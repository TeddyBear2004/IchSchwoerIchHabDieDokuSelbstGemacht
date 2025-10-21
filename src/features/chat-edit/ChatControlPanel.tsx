import {Button} from "@/components/ui/button"
import {Card} from "@/components/ui/card"
import {CheckSquare, Square} from "lucide-react"
import {ChatExportButton} from "@/features/chat-edit/ChatExportButton.tsx";

interface ChatControlPanelProps {
    selectedCount: number
    totalCount: number
    onSelectAll: () => void
    onDeselectAll: () => void
    handleExport: () => void
}

export function ChatControlPanel({
                                     selectedCount,
                                     totalCount,
                                     onSelectAll,
                                     onDeselectAll,
                                     handleExport,
                                 }: ChatControlPanelProps) {
    const isAllSelected = selectedCount === totalCount && totalCount > 0;
    return (
        <Card className="p-6 mb-6 bg-card/50 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={isAllSelected ? onDeselectAll : onSelectAll}
                        variant="outline"
                        className="border-secondary text-primary hover:bg-secondary"
                    >
                        {
                            isAllSelected ?
                                (
                                    <> <Square className="w-4 h-4 mr-2"/>
                                        Alle abwählen</>
                                )
                                :
                                (
                                    <> <CheckSquare className="w-4 h-4 mr-2"/>
                                        Alle auswählen</>
                                )
                        }
                    </Button>
                    <span className="text-sm text-muted-foreground">
                         {selectedCount} von {totalCount} ausgewählt
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <ChatExportButton selectedCount={selectedCount} onExport={handleExport}/>
                </div>
            </div>
        </Card>
    )
}

