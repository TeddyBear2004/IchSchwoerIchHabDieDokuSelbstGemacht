import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Trash2, MoreVertical, ArrowUp, ArrowDown} from "lucide-react"
import {useState} from "react"

interface ChatHeaderProps {
    chatId: string
    title: string
    pairsCount: number
    selectedPairsCount: number
    onSelectAll: () => void
    onDeselectAll: () => void
    onRemoveChat: () => void
    onMoveUp?: () => void
    onMoveDown?: () => void
    isFirst?: boolean
    isLast?: boolean
}

export function ChatHeader({
                               title,
                               pairsCount,
                               selectedPairsCount,
                               onSelectAll,
                               onDeselectAll,
                               onRemoveChat,
                               onMoveUp,
                               onMoveDown,
                               isFirst,
                               isLast,
                           }: ChatHeaderProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const allSelected = selectedPairsCount === pairsCount && pairsCount > 0
    const someSelected = selectedPairsCount > 0 && selectedPairsCount < pairsCount

    const handleToggleAll = () => {
        if (allSelected) {
            onDeselectAll()
        } else {
            onSelectAll()
        }
    }

    const handleConfirmDelete = () => {
        onRemoveChat()
        setShowDeleteDialog(false)
    }

    return (
        <>
            <div className="border-l-4 border-secondary pl-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                        checked={allSelected}
                        data-indeterminate={someSelected}
                        onCheckedChange={handleToggleAll}
                        className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary w-6 h-6"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-primary">
                            {title}
                           </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {pairsCount} {pairsCount === 1 ? "Eintrag" : "Einträge"}
                            {selectedPairsCount > 0 && (
                                <span className="text-secondary font-medium">
                                    {" "}
                                    · {selectedPairsCount} ausgewählt
                                  </span>
                            )}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                title="Chat-Optionen"
                            >
                                <MoreVertical className="h-5 w-5"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onMoveUp && (
                                <DropdownMenuItem
                                    onClick={onMoveUp}
                                    disabled={isFirst}
                                >
                                    <ArrowUp className="mr-2 h-4 w-4" />
                                    Nach oben verschieben
                                </DropdownMenuItem>
                            )}
                            {onMoveDown && (
                                <DropdownMenuItem
                                    onClick={onMoveDown}
                                    disabled={isLast}
                                >
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    Nach unten verschieben
                                </DropdownMenuItem>
                            )}
                            {(onMoveUp || onMoveDown) && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Chat entfernen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Sind Sie sicher, dass Sie den Chat "{title}" entfernen möchten?
                            Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className={"hover:bg-transparent hover:text-muted-foreground"}>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/70"
                        >
                            Entfernen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

