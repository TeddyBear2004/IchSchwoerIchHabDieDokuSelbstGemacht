import type {ChatPair} from "@/features/chat-edit/types.ts";

export async function handleExport(pairs: ChatPair[]) {
    const {ChatPDFGenerator} = await import("@/features/chat-edit/import-export/pdf-generator/pdfGenerator");

    const pdfData = {
        rows: pairs.map((pair) => {
            console.log(pair);
            return {
                anfrage: pair.question + " (" + new Date().toLocaleDateString('de-DE') + ")"
                    || '(Kein Text)',
                grund: pair.questionReason ?? "-",
                bewertung: pair.answerEvaluation ?? "-",
                version: pair.model || '-'
            };
        })
    };

    const generator = new ChatPDFGenerator();
    const pdfBytes = await generator.generatePDF(pdfData);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    generator.downloadPDF(pdfBytes, `chatgpt-export-${timestamp}.pdf`);
}