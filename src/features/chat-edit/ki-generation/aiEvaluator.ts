// AI Evaluator für Chat-Nachrichten
// Nutzt API um Bewertungen für Chat-Turns zu generieren

import { loadConfig } from './configLoader';
import type { AIConfig } from './configLoader';
import { COMPLETIONS_ENDPOINT } from '@/features/settings/types';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface BegruendungOptions {
    stichpunkte?: string;
    frage?: string;
    antwort?: string;
}

interface BewertungOptions {
    frage: string;
    antwort: string;
    stichpunkte?: string;
}

class AIEvaluator {
    private apiKey: string | null;
    private config: AIConfig | null;

    constructor(apiKey: string | null = null) {
        this.apiKey = apiKey; // Optional: Falls direkt übergeben
        this.config = null;
    }

    // Lädt die Konfiguration
    async loadConfiguration(): Promise<AIConfig> {
        if (!this.config) {
            this.config = await loadConfig();
            // Verwende übergebenen API-Key falls vorhanden, sonst den aus der Config
            if (!this.apiKey) {
                this.apiKey = this.config.apiKey;
            }
        }
        return this.config;
    }

    // Validiert ob API-Key konfiguriert ist
    validateApiKey(): void {
        if (!this.apiKey) {
            throw new Error('API-Key nicht konfiguriert. Bitte API-Key eintragen.');
        }
    }

    // Ruft die API auf
    async callGroqAPI(messages: Message[]): Promise<string> {
        await this.loadConfiguration();
        this.validateApiKey();

        // Zusammensetzen der vollständigen URL aus baseUrl und der API_ENDPOINT Konstante
        const fullUrl = `${this.config!.apiBaseUrl}${COMPLETIONS_ENDPOINT}`;

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.config!.model,
                messages: messages,
                temperature: this.config!.temperature,
                max_tokens: this.config!.maxTokens
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API Fehler: ${error.error?.message || response.statusText}`);
        }

        const result = await response.json();
        return result.choices[0].message.content;
    }

    /**
     * Ersetzt Platzhalter in einem Prompt-Template
     */
    replacePromptPlaceholders(template: string, replacements: Record<string, string>): string {
        let result = template;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }
        return result;
    }

    /**
     * Generiert eine Begründung basierend auf Text, Frage und Antwort
     */
    async generiereBegruendung(options: BegruendungOptions = {}): Promise<string> {
        const { stichpunkte = '', frage = '', antwort = '' } = options;
        await this.loadConfiguration();

        let prompt: string;
        const hasStichpunkte = stichpunkte && stichpunkte.trim().length > 0;

        if (hasStichpunkte) {
            // Stichpunkte vorhanden - generiere Begründung daraus
            prompt = this.replacePromptPlaceholders(
                this.config!.prompts.begruendung.mitStichpunkten,
                { stichpunkte, frage }
            );
        } else if (frage && antwort) {
            // Keine Stichpunkte - generiere aus Frage und Antwort
            prompt = this.replacePromptPlaceholders(
                this.config!.prompts.begruendung.ohneStichpunkte,
                { frage, antwort }
            );
        } else {
            throw new Error('Entweder Stichpunkte oder Frage+Antwort müssen angegeben werden.');
        }

        const messages: Message[] = [
            {
                role: 'system',
                content: this.config!.prompts.begruendung.systemPrompt
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const begruendung = await this.callGroqAPI(messages);
        return begruendung.trim();
    }

    /**
     * Generiert eine Bewertung basierend auf Frage und Antwort
     */
    async generiereBewertung(options: BewertungOptions): Promise<string> {
        const { frage = '', antwort = '', stichpunkte = '' } = options;
        await this.loadConfiguration();

        if (!frage || !antwort) {
            throw new Error('Frage und Antwort müssen angegeben werden.');
        }

        let prompt: string;
        const hasStichpunkte = stichpunkte && stichpunkte.trim().length > 0;

        if (hasStichpunkte) {
            // Stichpunkte vorhanden - berücksichtige die Meinung des Users
            prompt = this.replacePromptPlaceholders(
                this.config!.prompts.bewertung.mitStichpunkten,
                { frage, antwort, stichpunkte }
            );
        } else {
            // Keine Stichpunkte - generiere objektive Bewertung
            prompt = this.replacePromptPlaceholders(
                this.config!.prompts.bewertung.ohneStichpunkte,
                { frage, antwort }
            );
        }

        const messages: Message[] = [
            {
                role: 'system',
                content: this.config!.prompts.bewertung.systemPrompt
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const bewertung = await this.callGroqAPI(messages);
        return bewertung.trim();
    }

}

export default AIEvaluator;
