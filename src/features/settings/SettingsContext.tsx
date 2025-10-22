/**
 * Settings Context - Globale Settings-Verwaltung
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { AISettings, SettingsContextType } from './types';
import { loadSettingsFromStorage, saveSettingsToStorage, getDefaultSettings } from './settingsStorage';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lade Einstellungen beim Mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSettings = await loadSettingsFromStorage();
      setSettings(loadedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Einstellungen';
      setError(errorMessage);
      console.error('Fehler beim Laden der Einstellungen:', err);
      // Verwende Standard-Einstellungen bei Fehler
      setSettings(getDefaultSettings());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updatedSettings: Partial<AISettings>) => {
    try {
      setError(null);
      const newSettings = { ...settings, ...updatedSettings };
      await saveSettingsToStorage(newSettings);
      setSettings(newSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern der Einstellungen';
      setError(errorMessage);
      console.error('Fehler beim Speichern der Einstellungen:', err);
      throw err;
    }
  }, [settings]);

  const value: SettingsContextType = {
    settings,
    updateSettings,
    loadSettings,
    isLoading,
    error,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Hook zum Zugriff auf die Settings
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings muss innerhalb eines SettingsProvider verwendet werden');
  }
  return context;
}

