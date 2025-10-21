import { ThumbsUp, ThumbsDown } from "lucide-react";

type RatingTagProps = {
    tag: string;
    value?: "gut" | "schlecht" | null;
    onChange: (value: "gut" | "schlecht" | null) => void;
};

export function RatingTag({ tag, value, onChange }: RatingTagProps) {
    const handleThumbsUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value === "gut" ? null : "gut");
    };

    const handleThumbsDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value === "schlecht" ? null : "schlecht");
    };

    return (
        <div className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1">
            <span className="text-xs font-medium text-foreground">{tag}</span>
            <div className="flex items-center gap-0.5 ml-1">
                <button
                    type="button"
                    onClick={handleThumbsUp}
                    className={`p-0.5 rounded hover:bg-secondary/20 transition-colors ${
                        value === "gut" 
                            ? "text-green-600 bg-green-100 hover:bg-green-200" 
                            : "text-muted-foreground"
                    }`}
                    aria-label={`${tag} als gut bewerten`}
                >
                    <ThumbsUp className="h-3.5 w-3.5" fill={value === "gut" ? "currentColor" : "none"} />
                </button>
                <button
                    type="button"
                    onClick={handleThumbsDown}
                    className={`p-0.5 rounded hover:bg-secondary/20 transition-colors ${
                        value === "schlecht" 
                            ? "text-red-600 bg-red-100 hover:bg-red-200" 
                            : "text-muted-foreground"
                    }`}
                    aria-label={`${tag} als schlecht bewerten`}
                >
                    <ThumbsDown className="h-3.5 w-3.5" fill={value === "schlecht" ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
    );
}
