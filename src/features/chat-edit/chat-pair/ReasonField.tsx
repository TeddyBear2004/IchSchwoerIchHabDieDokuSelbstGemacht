import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2 } from "lucide-react";

type ReasonFieldProps = {
    pairId: string;
    value?: string;
    onChange: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
};

export function ReasonField({ pairId, value, onChange, onGenerate, isGenerating }: ReasonFieldProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
                Begründung der Frage
            </label>
            <Textarea
                id={`reason-${pairId}`}
                placeholder="Warum wurde diese Frage gestellt?"
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
                    'Begründung generieren'
                )}
            </Button>
        </div>
    );
}

