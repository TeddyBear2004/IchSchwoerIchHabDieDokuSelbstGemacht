import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import type { ChatPair } from "../types.ts"

interface ApplyToOthersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourcePair: ChatPair | null
  allPairs: ChatPair[]
  onApply: (sourcePairId: string, targetPairIds: string[]) => void
}

export function ApplyToOthersDialog({
  open,
  onOpenChange,
  sourcePair,
  allPairs,
  onApply,
}: ApplyToOthersDialogProps) {
  const [targetPairIds, setTargetPairIds] = useState<string[]>([])

  const toggleTargetPair = (pairId: string) => {
    setTargetPairIds((prev) =>
      prev.includes(pairId)
        ? prev.filter((id) => id !== pairId)
        : [...prev, pairId]
    )
  }

  const handleApply = () => {
    if (sourcePair && targetPairIds.length > 0) {
      onApply(sourcePair.id, targetPairIds)
      setTargetPairIds([])
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setTargetPairIds([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Antworten auf andere Paare anwenden
          </DialogTitle>
          <DialogDescription>
            Wähle die Frage-Antwort-Paare aus, auf die die Begründung und Bewertung angewendet werden sollen.
          </DialogDescription>
        </DialogHeader>

        {sourcePair && (
          <div className="space-y-4">
            <div className="p-4 bg-[rgb(60,210,255)]/10 rounded-lg border border-secondary">
              <p className="text-sm font-medium text-primary mb-2">Quelle:</p>
              <p className="text-sm font-semibold mb-2">{sourcePair.question}</p>
              {sourcePair.questionReason && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Begründung:</p>
                  <p className="text-sm">{sourcePair.questionReason}</p>
                </div>
              )}
              {sourcePair.answerEvaluation && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Bewertung:</p>
                  <p className="text-sm">{sourcePair.answerEvaluation}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">Ziel-Paare auswählen:</p>
              {allPairs
                .filter((pair) => pair.id !== sourcePair.id)
                .map((pair) => (
                  <div
                    key={pair.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      targetPairIds.includes(pair.id)
                        ? "border-secondary bg-[rgb(60,210,255)]/5"
                        : "border-border hover:border-secondary/50"
                    }`}
                    onClick={() => toggleTargetPair(pair.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={targetPairIds.includes(pair.id)}
                        onCheckedChange={() => toggleTargetPair(pair.id)}
                        className="mt-1 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pair.question}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {pair.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button
            onClick={handleApply}
            disabled={targetPairIds.length === 0}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Auf {targetPairIds.length} {targetPairIds.length === 1 ? "Paar" : "Paare"} anwenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
