/**
 * Settings Feature - Types und Interfaces
 */

// Konstante für den OpenAI-konformen API Endpoint
export const COMPLETIONS_ENDPOINT = '/v1/chat/completions';

// Presets für verschiedene API-Provider
export interface ApiPreset {
  name: string;
  apiBaseUrl: string;
  model: string;
}

export const API_PRESETS: Record<string, ApiPreset> = {
  openai: {
    name: 'OpenAI',
    apiBaseUrl: 'https://api.openai.com',
    model: 'gpt-4o',
  },
  groq: {
    name: 'Groq',
    apiBaseUrl: 'https://api.groq.com/openai',
    model: 'openai/gpt-oss-20b',
  },
  ollama: {
    name: 'Ollama',
    apiBaseUrl: 'http://localhost:11434',
    model: 'mistral',
  },
  lmstudio: {
    name: 'LM Studio',
    apiBaseUrl: 'http://localhost:1234',
    model: 'local-model',
  },
};

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

