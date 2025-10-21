// Type definitions for ChatPDFGenerator

export class ChatPDFGenerator {
    constructor();

    init(): Promise<void>;
    loadCustomFont(): Promise<ArrayBuffer | null>;
    loadBasePdfFile(): Promise<ArrayBuffer | null>;
    wrapText(text: string, charsPerLine?: number): string[];
    generatePDF(pdfData: { rows: Array<{
        anfrage?: string;
        grund?: string;
        bewertung?: string;
        version?: string;
    }> }): Promise<Uint8Array>;
    downloadPDF(pdfBytes: Uint8Array, filename?: string): void;
}

