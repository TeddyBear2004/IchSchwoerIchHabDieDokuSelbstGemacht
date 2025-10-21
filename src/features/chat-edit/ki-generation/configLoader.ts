// Config Loader für KI-Generation
// Lädt die Konfiguration aus der public/config.json Datei

export interface AIConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  prompts: {
    begruendung: {
      mitStichpunkten: string;
      ohneStichpunkte: string;
      systemPrompt: string;
    };
    bewertung: {
      mitStichpunkten: string;
      ohneStichpunkte: string;
      systemPrompt: string;
    };
    evaluation: {
      userPrompt: string;
      systemPrompt: string;
    };
  };
}

/**
 * Lädt die KI-Konfiguration aus der public/config.json Datei
 * Die Config wird bei jedem Aufruf neu geladen
 */
export async function loadConfig(): Promise<AIConfig> {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Config: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden der KI-Konfiguration:', error);
    throw new Error('KI-Konfiguration konnte nicht geladen werden. Bitte config.json im public-Ordner überprüfen.');
  }
}
