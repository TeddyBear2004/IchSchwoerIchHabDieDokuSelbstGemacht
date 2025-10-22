import type {AISettings} from '@/features/settings/types';
import {loadSettingsFromStorage} from '@/features/settings/settingsStorage';

export type AIConfig = AISettings;

/**
 * Lädt die KI-Konfiguration aus dem Chrome Storage
 * Fallback auf Standard-Konfiguration wenn nichts vorhanden
 * Die Config wird bei jedem Aufruf neu geladen
 */
export async function loadConfig(): Promise<AIConfig> {
  try {
      return await loadSettingsFromStorage();
  } catch (error) {
    console.error('Fehler beim Laden der KI-Konfiguration:', error);
    throw new Error('KI-Konfiguration konnte nicht geladen werden. Bitte überprüfen Sie die Einstellungen.');
  }
}
