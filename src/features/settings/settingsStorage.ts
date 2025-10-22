/**
 * Settings Storage - Verwaltet die Persistierung von Einstellungen
 */

import type { AISettings } from './types';

const STORAGE_KEY = 'aiSettings';

// Standard-Einstellungen als Fallback
const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  apiBaseUrl: 'https://api.groq.com/openai/v1',
  model: 'mixtral-8x7b-32768',
  temperature: 0.7,
  maxTokens: 10000,
  prompts: {
    begruendung: {
      mitStichpunkten:
        'Basierend auf den folgenden Stichpunkten, formuliere eine klare und prägnante Begründung in Ich-Form, warum diese Frage gestellt wurde (max. 270 Zeichen):\n\nFrage:{frage}\n\nStichpunkte: "{stichpunkte}"\n\nGib NUR die Begründung zurück, ohne zusätzliche Erklärungen.',
      ohneStichpunkte:
        'Analysiere die folgende Frage und Antwort und erstelle eine kurze Begründung in Ich-Form, warum diese Frage gestellt wurde (max. 270 Zeichen):\n\nFrage: "{frage}"\nAntwort: "{antwort}"\n\nGib NUR die Begründung zurück, ohne zusätzliche Erklärungen.',
      systemPrompt:
        'Du bist ein hilfreicher Assistent, der prägnante Begründungen formuliert. Antworte immer kurz und präzise und ausformuliert.',
    },
    bewertung: {
      mitStichpunkten:
        'Bewerte die folgende Antwort auf eine Frage. Der Benutzer hat folgende Stichpunkte zu seiner Meinung gegeben. Formuliere daraus eine ausformulierte Bewertung (max. 270 Zeichen):\n\nFrage: "{frage}"\nAntwort: "{antwort}"\nMeinung des Benutzers (Stichpunkte): "{stichpunkte}"\n\nGib NUR die ausformulierte Bewertung zurück, ohne zusätzliche Erklärungen.',
      ohneStichpunkte:
        'Bewerte die folgende Antwort auf eine Frage objektiv und erstelle eine ausformulierte Bewertung (max. 270 Zeichen):\n\nFrage: "{frage}"\nAntwort: "{antwort}"\n\nGib NUR die Bewertung zurück, ohne zusätzliche Erklärungen.',
      systemPrompt:
        'Du bist ein hilfreicher Assistent, der Bewertungen für Antworten formuliert. Antworte immer kurz, präzise und ausformuliert.',
    }
  },
};

/**
 * Lädt die Einstellungen aus dem Chrome Storage
 */
export async function loadSettingsFromStorage(): Promise<AISettings> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome?.storage?.local) {
      console.warn('Chrome Storage nicht verfügbar, verwende Standard-Einstellungen');
      resolve(DEFAULT_SETTINGS);
      return;
    }

    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        resolve(result[STORAGE_KEY]);
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    });
  });
}

/**
 * Speichert die Einstellungen im Chrome Storage
 */
export async function saveSettingsToStorage(settings: AISettings): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome?.storage?.local) {
      console.warn('Chrome Storage nicht verfügbar');
      reject(new Error('Chrome Storage nicht verfügbar'));
      return;
    }

    chrome.storage.local.set({ [STORAGE_KEY]: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Gibt die Standard-Einstellungen zurück
 */
export function getDefaultSettings(): AISettings {
  return DEFAULT_SETTINGS;
}

