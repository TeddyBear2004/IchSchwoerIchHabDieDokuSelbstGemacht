import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2 } from "lucide-react";
import { RatingTag } from "./RatingTag.tsx";

const RATING_TAGS = [
    "Qualität",
    "Geeignet",
    "Fachlich passend",
    "Vollständig",
    "Verständlich",
    "Ausführlich",
    "Hilfreich",
];

type EvaluationFieldProps = {
    pairId: string;
    value?: string;
    tagRatings?: Record<string, "gut" | "schlecht">;
    setTagRatings?: (ratings: Record<string, "gut" | "schlecht">) => void;
    onChange: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
};

export function EvaluationField({ pairId, value, onChange, onGenerate, isGenerating, tagRatings, setTagRatings}: EvaluationFieldProps) {

    const handleTagChange = (tag: string, rating: "gut" | "schlecht" | null) => {
        if (!setTagRatings) return;

        const newRatings = { ...(tagRatings || {}) };
        if (rating === null) {
            delete newRatings[tag];
        } else {
            newRatings[tag] = rating;
        }
        setTagRatings(newRatings);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
                Bewertung der Antwort
            </label>

            <Textarea
                id={`rating-${pairId}`}
                placeholder="Wie hilfreich war die Antwort?"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[80px] resize-none focus:ring-secondary focus:border-secondary"
                onClick={(e) => e.stopPropagation()}
            />
            <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={(e) => {
                    e.stopPropagation();
                    onGenerate();
                }}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird generiert...
                    </>
                ) : (
                    'Bewertung generieren'
                )}
            </Button>
            {/* Rating Tags/Badges - below the textarea */}
            <div className="flex flex-wrap gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                {RATING_TAGS.map((tag) => (
                    <RatingTag
                        key={tag}
                        tag={tag}
                        value={tagRatings?.[tag] || null}
                        onChange={(rating) => handleTagChange(tag, rating)}
                    />
                ))}
            </div>
        </div>
    );
}
