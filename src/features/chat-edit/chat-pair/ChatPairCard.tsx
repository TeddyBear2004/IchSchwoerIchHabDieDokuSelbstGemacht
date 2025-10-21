import { Card } from "@/components/ui/card.tsx"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import { Button } from "@/components/ui/button.tsx"
import type { ChatPair } from "../types.ts"
import {useEffect, useState} from "react"
import ChatPairQuestions from "@/features/chat-edit/chat-pair/ChatPairQuestions.tsx";

interface ChatPairCardProps {
  pair: ChatPair
  onToggle: (id: string) => void
  onUpdatePair: (id: string, updates: Partial<ChatPair>) => void
  onApplyToOthers: (pairId: string) => void
}

export function ChatPairCard({ pair, onToggle, onUpdatePair, onApplyToOthers }: ChatPairCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isQuestionExpanded, setIsQuestionExpanded] = useState(false)
  const maxLength = 200

  const shouldTruncateAnswer = pair.answer.length > maxLength
  const displayedAnswer = shouldTruncateAnswer && !isExpanded
    ? pair.answer.slice(0, maxLength) + "..."
    : pair.answer

  const shouldTruncateQuestion = pair.question.length > maxLength
  const displayedQuestion = shouldTruncateQuestion && !isQuestionExpanded
    ? pair.question.slice(0, maxLength) + "..."
    : pair.question

    useEffect(() => {
        console.log(pair)
    }, []);

  return (
    <Card
      className={`p-6 transition-all hover:shadow-lg cursor-pointer ${
        pair.selected
          ? "ring-2 ring-secondary"
          : "hover:border-secondary/50"
      }`}
      onClick={() => {
        if (!pair.selected) {
          onToggle(pair.id)
        }
      }}
    >
      <div className="flex gap-4">
          <Checkbox
            checked={pair.selected}
            onCheckedChange={() => onToggle(pair.id)}
            className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary w-6 h-6 mt-1"
            onClick={(e) => e.stopPropagation()}
          />

        <div className="flex-1 space-y-6">
          {/* Frage und Antwort */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Frage</span>
              </div>
              <p className="text-foreground font-medium leading-relaxed break-words">{displayedQuestion}</p>
              {shouldTruncateQuestion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsQuestionExpanded(!isQuestionExpanded)
                  }}
                  className="text-secondary hover:text-primary/50 hover:bg-transparent p-0 h-auto font-medium"
                >
                  {isQuestionExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                </Button>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Antwort
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed break-words">{displayedAnswer}</p>
              {shouldTruncateAnswer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className="text-secondary hover:text-primary/50 hover:bg-transparent p-0 h-auto font-medium"
                >
                  {isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                </Button>
              )}
            </div>
          </div>

         <ChatPairQuestions
           pair={pair}
           onUpdatePair={onUpdatePair}
           onApplyToOthers={onApplyToOthers}
           hidden={!pair.selected}
         />
        </div>
      </div>
    </Card>
  )
}
