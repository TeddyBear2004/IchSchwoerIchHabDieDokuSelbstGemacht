import { Button } from "@/components/ui/button.tsx"
import { Copy } from "lucide-react"
import type { ChatPair } from "../types.ts"

interface ApplyToOthersButtonProps {
  pair: ChatPair
  onApplyClick: (pairId: string) => void
}

export function ApplyToOthersButton({ pair, onApplyClick }: ApplyToOthersButtonProps) {
  const hasReasonOrEvaluation = pair.questionReason || pair.answerEvaluation

  if (!hasReasonOrEvaluation) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.stopPropagation()
        onApplyClick(pair.id)
      }}
      className="text-primary border-secondary hover:bg-[rgb(60,210,255)]/10 hover:text-primary"
    >
      <Copy className="w-4 h-4 mr-2" />
      Auf andere Fragen anwenden
    </Button>
  )
}

