/**
 * Settings Feature - Types und Interfaces
 */

// Konstante für den OpenAI-konformen API Endpoint
export const COMPLETIONS_ENDPOINT = '/chat/completions';

export interface PromptConfig {
  mitStichpunkten: string;
  ohneStichpunkte: string;
  systemPrompt: string;
}

export interface PromptsConfig {
  begruendung: PromptConfig;
  bewertung: PromptConfig;
}

export interface AISettings {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  prompts: PromptsConfig;
}

export interface SettingsContextType {
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

