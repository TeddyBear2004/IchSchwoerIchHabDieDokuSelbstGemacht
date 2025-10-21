import type {ChatPair} from "@/features/chat-edit/types.ts";
import { ApplyToOthersButton } from "./ApplyToOthersButton.tsx";
import { ReasonField } from "./ReasonField.tsx";
import { EvaluationField } from "./EvaluationField.tsx";
import { useAIGeneration } from "./useAIGeneration.ts";
import {useState} from "react";

type ChatPairQuestionProps = {
    pair: ChatPair
    onUpdatePair: (id: string, updates: Partial<ChatPair>) => void
    onApplyToOthers: (pairId: string) => void
    hidden?: boolean
}

function ChatPairQuestions({pair, onUpdatePair, onApplyToOthers, hidden}: ChatPairQuestionProps) {
    const { isGeneratingReason, isGeneratingEvaluation, error, generateReason, generateEvaluation } = useAIGeneration();

    const [tagRatings, setTagRatings] = useState<Record<string, "gut" | "schlecht">>({})

    const updateReason = (value: string) => {
        onUpdatePair(pair.id, { questionReason: value });
    }

    const updateEvaluation = (value: string) => {
        onUpdatePair(pair.id, { answerEvaluation: value });
    }

    const handleGenerateReason = async () => {
        const result = await generateReason(
            pair.question,
            pair.answer,
            pair.questionReason
        );

        if (result) {
            onUpdatePair(pair.id, { questionReason: result });
        }
    };

    const handleGenerateEvaluation = async () => {
        console.log(tagRatings)
        const result = await generateEvaluation(
            pair.question,
            pair.answer,
            pair.answerEvaluation,
            tagRatings
        );

        if (result) {
            onUpdatePair(pair.id, { answerEvaluation: result });
        }
    };

    return(
        <div className={"grid md:grid-cols-3 gap-6 pt-4 border-t " + (hidden ? "hidden" : "")}>
            {/* Reason Field */}
            <div>
                <ReasonField
                    pairId={pair.id}
                    value={pair.questionReason}
                    onChange={updateReason}
                    onGenerate={handleGenerateReason}
                    isGenerating={isGeneratingReason}
                />
            </div>

            {/* Evaluation Field with Tags */}
            <div className="md:col-span-2">
                <EvaluationField
                    pairId={pair.id}
                    value={pair.answerEvaluation}
                    tagRatings={tagRatings}
                    onChange={updateEvaluation}
                    setTagRatings={setTagRatings}
                    onGenerate={handleGenerateEvaluation}
                    isGenerating={isGeneratingEvaluation}
                />
            </div>

            {/* Error Display */}
            {error && (
                <div className="md:col-span-3 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Apply to Others Button */}
            <div className="md:col-span-3 flex justify-end">
                <ApplyToOthersButton pair={pair} onApplyClick={onApplyToOthers} />
            </div>
        </div>
    )
}

export default ChatPairQuestions;