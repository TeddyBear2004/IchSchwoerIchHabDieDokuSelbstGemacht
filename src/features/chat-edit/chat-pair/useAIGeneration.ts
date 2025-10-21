import { useState } from 'react';

export function useAIGeneration() {
    const [isGeneratingReason, setIsGeneratingReason] = useState(false);
    const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateReason = async (
        question: string,
        answer: string,
        existingReason?: string
    ): Promise<string | null> => {
        setIsGeneratingReason(true);
        setError(null);

        try {
            // Dynamically import the AIEvaluator
            const { default: AIEvaluator } = await import(
                '../ki-generation/aiEvaluator.ts'
            );

            // API-Key wird nun aus der config.json geladen
            const evaluator = new AIEvaluator();

            return await evaluator.generiereBegruendung({
                stichpunkte: existingReason || '',
                frage: question,
                antwort: answer,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Fehler bei der Generierung';
            setError(errorMessage);
            console.error('AI Generation Error:', err);
            return null;
        } finally {
            setIsGeneratingReason(false);
        }
    };

    const generateEvaluation = async (
        question: string,
        answer: string,
        existingEvaluation?: string,
        tagRatings?: Record<string, "gut" | "schlecht">
    ): Promise<string | null> => {
        setIsGeneratingEvaluation(true);
        setError(null);

        try {
            const { default: AIEvaluator } = await import(
                '../ki-generation/aiEvaluator.ts'
            );

            // API-Key wird nun aus der config.json geladen
            const evaluator = new AIEvaluator();

            // Baue einen String aus den Tag-Bewertungen
            let tagHints = '';
            if (tagRatings && Object.keys(tagRatings).length > 0) {
                const gutTags = Object.entries(tagRatings)
                    .filter(([, rating]) => rating === "gut")
                    .map(([tag]) => tag);
                const schlechtTags = Object.entries(tagRatings)
                    .filter(([, rating]) => rating === "schlecht")
                    .map(([tag]) => tag);

                const hints = [];
                if (gutTags.length > 0) {
                    hints.push(`Positive Aspekte: ${gutTags.join(', ')}`);
                }
                if (schlechtTags.length > 0) {
                    hints.push(`Negative Aspekte: ${schlechtTags.join(', ')}`);
                }

                if (hints.length > 0) {
                    tagHints = `\nBerücksichtige folgende Bewertungen: ${hints.join('; ')}`;
                }
            }

            // Kombiniere existingEvaluation und tagHints nur wenn sie vorhanden sind
            let stichpunkte = '';
            if (existingEvaluation && existingEvaluation.trim().length > 0) {
                stichpunkte = existingEvaluation;
            }
            if (tagHints) {
                stichpunkte = stichpunkte ? stichpunkte + tagHints : tagHints;
            }

            return await evaluator.generiereBewertung({
                frage: question,
                antwort: answer,
                stichpunkte: stichpunkte,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Fehler bei der Generierung';
            setError(errorMessage);
            console.error('AI Generation Error:', err);
            return null;
        } finally {
            setIsGeneratingEvaluation(false);
        }
    };

    return {
        isGeneratingReason,
        isGeneratingEvaluation,
        error,
        generateReason,
        generateEvaluation,
    };
}
