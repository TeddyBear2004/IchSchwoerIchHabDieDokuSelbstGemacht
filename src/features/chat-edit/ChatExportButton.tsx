import {Button} from "@/components/ui/button"
import {Upload} from "lucide-react";

interface ChatExportButtonProps {
    selectedCount: number
    onExport?: () => void
}

export function ChatExportButton({selectedCount, onExport}: ChatExportButtonProps) {
    if (selectedCount === 0) return null

    return (
        <Button
            className="bg-accent hover:bg-accent/90 text-primary-foreground"
            onClick={onExport}>
            <Upload/>
            {selectedCount} {selectedCount === 1 ? "Eintrag" : "Einträge"} exportieren
        </Button>
    )
}

