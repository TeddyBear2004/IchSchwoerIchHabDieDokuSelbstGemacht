// filepath: c:\Users\engel\WebstormProjects\ISIHDDSG\src\features\chat-edit\import-export\pdf-generator\pdfGenerator.ts
import type { PDFDocument, PDFFont, PDFPage } from 'pdf-lib';

// Table configuration interfaces
interface Layout {
  startX: number;
  startY: number;
  rowHeight: number;
  maxRows: number;
  textPadding: number;
}

interface Font {
  size: number;
  lineHeight: number;
}

interface Column {
  name: string;
  offsetX: number;
  charsPerLine: number;
}

interface Columns {
  definitions: Column[];
}

interface FieldMapping {
  role: {
    assistant: string;
    user: string;
    default: string;
  };
  dateFormat: string;
  defaultReason: string;
  defaultEvaluation: string;
}

interface TableConfigType {
  layout: Layout;
  font: Font;
  columns: Columns;
  textLinesPerRow: number;
  fieldMapping: FieldMapping;
}

// Table configuration
const charsPerLine = 57;
const offset = 179;

const TableConfig: TableConfigType = {
    // Layout-Einstellungen
    layout: {
        startX: 52,           // X-Position wo die Tabelle beginnt
        startY: 405,          // Y-Position wo die Tabelle beginnt (von unten)
        rowHeight: 39,        // Höhe einer Tabellenzeile in Pixeln
        maxRows: 8,           // Maximale Anzahl von Zeilen pro Seite
        textPadding: 5        // Abstand vom Zellenrand in Pixeln
    },

    // Schriftart-Einstellungen
    font: {
        size: 5,              // Schriftgröße
        lineHeight: 0         // Zusätzlicher Abstand zwischen Textzeilen
    },

    // Spalten-Definitionen
    columns: {

        definitions: [
            {
                name: 'Anfrage',
                offsetX: 0,
                charsPerLine: charsPerLine
            },
            {
                name: 'Grund',
                offsetX: offset,     // 1 * 179
                charsPerLine: charsPerLine
            },
            {
                name: 'Bewertung',
                offsetX: 2 * offset,     // 2 * 179
                charsPerLine: charsPerLine
            },
            {
                name: 'Version',
                offsetX: 3 * offset,     // 3 * 179
                charsPerLine: charsPerLine
            }
        ]
    },

    // Berechnung: Wie viele Textzeilen = 1 Tabellenzeile
    textLinesPerRow: 7,

    // Feldmappings für Chat-Daten
    fieldMapping: {
        role: {
            assistant: 'Assistent',
            user: 'Benutzer',
            default: 'Unbekannt'
        },
        dateFormat: 'de-DE',
        // Dummy-Werte für fehlende Felder
        defaultReason: 'Zur Dokumentation',
        defaultEvaluation: 'Hilfreich'
    }
};

// Data types
interface Row {
  anfrage: string;
  grund: string;
  bewertung: string;
  version: string;
}

interface PdfData {
  rows: Row[];
}

interface CellData {
  text: string;
  column: Column;
  charsPerLine: number;
}

interface PageInfo {
  page: PDFPage;
  row: number;
}

type PDFLibModule = typeof import('pdf-lib');

// PDF Generator für Chat Export
// Verwendet pdf-lib um Chat-Daten in eine Tabelle auf basePdf einzufügen

class ChatPDFGenerator {
  config: TableConfigType;
  PDFLib: PDFLibModule | undefined;

  constructor() {
    this.config = TableConfig;
  }

  // Lädt die SpaceMono-Regular Schriftart
  async loadCustomFont(): Promise<ArrayBuffer | null> {
    try {
      const fontUrl = chrome.runtime.getURL('fonts/SpaceMono-Regular.ttf');
      return await fetch(fontUrl).then(res => res.arrayBuffer());
    } catch (error) {
      console.error('Fehler beim Laden der Schriftart:', error);
      return null;
    }
  }

  // Lädt die basePdf.pdf Datei
  async loadBasePdfFile(): Promise<ArrayBuffer | null> {
    try {
      const pdfUrl = chrome.runtime.getURL('templates/basePdf.pdf');
      return await fetch(pdfUrl).then(res => res.arrayBuffer());
    } catch (error) {
      console.error('Fehler beim Laden der Basis-PDF:', error);
      return null;
    }
  }

  // Bricht Text alle N Zeichen in eine neue Zeile um (ohne Limit)
  wrapText(text: string, charsPerLine: number = 30): string[] {
    if (!text) return [];

    const lines: string[] = [];

    // Teile den Text zuerst nach Absätzen (Zeilenumbrüchen)
    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph, paragraphIndex) => {
      // Wenn der Absatz leer ist, füge eine Leerzeile hinzu
      if (paragraph.trim() === '') {
        lines.push('');
        return;
      }

      // Breche den Absatz in Zeilen um
      let currentIndex = 0;
      while (currentIndex < paragraph.length) {
        const line = paragraph.substring(currentIndex, currentIndex + charsPerLine);
        lines.push(line);
        currentIndex += charsPerLine;
      }

      // Füge nach jedem Absatz (außer dem letzten) eine Leerzeile hinzu
      if (paragraphIndex < paragraphs.length - 1) {
        lines.push('');
      }
    });

    return lines;
  }

  // Berechnet wie viele Tabellenzeilen für einen Eintrag benötigt werden
  calculateRequiredRows(cellDataArray: CellData[]): number {
    let maxRequiredRows = 1;

    cellDataArray.forEach(cell => {
      const textLines = this.wrapText(cell.text, cell.charsPerLine);
      const requiredRowsForThisCell = Math.ceil(textLines.length / this.config.textLinesPerRow);
      if (requiredRowsForThisCell > maxRequiredRows) {
        maxRequiredRows = requiredRowsForThisCell;
      }
    });

    return maxRequiredRows;
  }

  // Bereitet die Zelldaten für einen Chat-Eintrag vor
  prepareCellData(row: Row): CellData[] {
    // Erwartet ein Objekt mit den Feldern: anfrage, grund, bewertung, version
    return this.config.columns.definitions.map(col => ({
      text: col.name === 'Anfrage' ? (row.anfrage || '') :
        col.name === 'Grund' ? (row.grund || '') :
          col.name === 'Bewertung' ? (row.bewertung || '') :
            col.name === 'Version' ? (row.version || '') :
              '',
      column: col,
      charsPerLine: col.charsPerLine
    }));
  }

  // Fügt "..." am Anfang oder Ende einer Zeile hinzu
  addEllipsis(line: string, isFirstLine: boolean, isLastLine: boolean, startLineIndex: number, endLineIndex: number, totalLines: number): string {
    let modifiedLine = line;

    if (isLastLine && endLineIndex < totalLines) {
      // Letzte Zeile auf dieser Seite und es gibt noch mehr Text
      modifiedLine = modifiedLine.substring(0, Math.max(0, modifiedLine.length - 3)) + '...';
    }
    if (isFirstLine && startLineIndex > 0) {
      // Erste Zeile auf dieser Seite und es gab schon Text vorher
      modifiedLine = '...' + modifiedLine.substring(0, Math.max(0, modifiedLine.length - 3));
    }

    return modifiedLine;
  }

  // Rendert eine einzelne Textzeile auf der Seite
  drawTextLine(currentPage: PDFPage, line: string, x: number, y: number, font: PDFFont): void {
    if (!this.PDFLib) throw new Error('PDFLib not loaded');
    currentPage.drawText(line, {
      x: x,
      y: y,
      size: this.config.font.size,
      font: font,
      color: this.PDFLib.rgb(0, 0, 0)
    });
  }

  // Rendert alle Zellen für einen Teil eines Eintrags
  renderCellsOnPage(currentPage: PDFPage, cellData: CellData[], rowY: number, textLinesOffset: number, maxLinesOnThisPage: number, font: PDFFont): void {
    const lineHeight = this.config.font.size + this.config.font.lineHeight;

    cellData.forEach(cell => {
      const absoluteX = this.config.layout.startX + cell.column.offsetX;
      const textLines = this.wrapText(cell.text, cell.charsPerLine);

      // Bestimme welche Textzeilen auf dieser Seite gerendert werden
      const startLineIndex = textLinesOffset;
      const endLineIndex = Math.min(textLinesOffset + maxLinesOnThisPage, textLines.length);
      const linesToRender = textLines.slice(startLineIndex, endLineIndex);

      // Zeichne die Textzeilen
      linesToRender.forEach((line, lineIndex) => {
        const lineY = rowY + this.config.layout.textPadding - (lineIndex * lineHeight);

        // Füge "..." hinzu wenn nötig
        const isFirstLine = lineIndex === 0;
        const isLastLine = lineIndex === linesToRender.length - 1;
        const modifiedLine = this.addEllipsis(
          line,
          isFirstLine,
          isLastLine,
          startLineIndex,
          endLineIndex,
          textLines.length
        );

        this.drawTextLine(currentPage, modifiedLine, absoluteX + this.config.layout.textPadding, lineY, font);
      });
    });
  }

  // Erstellt eine neue Seite aus der basePdf
  async createNewPage(pdfDoc: PDFDocument, basePdfBytes: ArrayBuffer): Promise<PDFPage> {
    if (!this.PDFLib) throw new Error('PDFLib not loaded');
    try {
      const basePdfDoc = await this.PDFLib.PDFDocument.load(basePdfBytes);
      const [copiedPage] = await pdfDoc.copyPages(basePdfDoc, [0]);
      return pdfDoc.addPage(copiedPage);
    } catch (error) {
      console.error('Fehler beim Kopieren der basePdf:', error);
      return pdfDoc.addPage([841.92, 595.32]);
    }
  }

  // Rendert einen Eintrag, der über mehrere Seiten gehen kann
  async renderMultiPageEntry(pdfDoc: PDFDocument, cellData: CellData[], currentPage: PDFPage, currentRow: number, basePdfBytes: ArrayBuffer | null, font: PDFFont): Promise<PageInfo> {
    let remainingRows = this.calculateRequiredRows(cellData);
    let textLinesOffset = 0;
    let pageInfo: PageInfo = { page: currentPage, row: currentRow };

    while (remainingRows > 0) {
      const availableRows = this.config.layout.maxRows - pageInfo.row;
      const rowsToRenderOnThisPage = Math.min(remainingRows, availableRows > 0 ? availableRows : this.config.layout.maxRows);
      const maxLinesOnThisPage = rowsToRenderOnThisPage * this.config.textLinesPerRow;
      const rowY = this.config.layout.startY - (pageInfo.row * this.config.layout.rowHeight);

      // Rendere Zellen für diese Seite
      this.renderCellsOnPage(pageInfo.page, cellData, rowY, textLinesOffset, maxLinesOnThisPage, font);

      // Aktualisiere Zähler
      remainingRows -= rowsToRenderOnThisPage;
      textLinesOffset += maxLinesOnThisPage;
      pageInfo.row += rowsToRenderOnThisPage;

      // Wenn noch Zeilen übrig sind, erstelle neue Seite
      if (remainingRows > 0) {
        pageInfo.page = await this.createNewPage(pdfDoc, basePdfBytes!);
        pageInfo.row = 0;
      }
    }

    return pageInfo;
  }

  // Rendert einen Eintrag, der komplett auf eine Seite passt
  renderSinglePageEntry(currentPage: PDFPage, cellData: CellData[], currentRow: number, font: PDFFont): number {
    const lineHeight = this.config.font.size + this.config.font.lineHeight;
    const requiredRows = this.calculateRequiredRows(cellData);

    // Rendere jede benötigte Tabellenzeile
    for (let tableRow = 0; tableRow < requiredRows; tableRow++) {
      const rowY = this.config.layout.startY - ((currentRow + tableRow) * this.config.layout.rowHeight);
      const textLinesOffset = tableRow * this.config.textLinesPerRow;
      const maxLinesInThisRow = this.config.textLinesPerRow;

      cellData.forEach(cell => {
        const absoluteX = this.config.layout.startX + cell.column.offsetX;
        const textLines = this.wrapText(cell.text, cell.charsPerLine);

        // Bestimme welche Textzeilen in dieser Tabellenzeile gerendert werden
        const startLineIndex = textLinesOffset;
        const endLineIndex = Math.min(textLinesOffset + maxLinesInThisRow, textLines.length);
        const linesToRender = textLines.slice(startLineIndex, endLineIndex);

        // Zeichne die Textzeilen
        linesToRender.forEach((line, lineIndex) => {
          const lineY = rowY + this.config.layout.textPadding - (lineIndex * lineHeight);
          this.drawTextLine(currentPage, line, absoluteX + this.config.layout.textPadding, lineY, font);
        });
      });
    }

    return currentRow + requiredRows;
  }

  // Füllt die Tabelle mit PDF-Daten
  async fillTable(pdfDoc: PDFDocument, pdfData: PdfData, font: PDFFont, startPageIndex: number = 0, basePdfBytes: ArrayBuffer | null = null): Promise<void> {
    // Erwartet pdfData mit { rows: [...], metadata: {...} }
    if (!pdfData.rows || !Array.isArray(pdfData.rows)) {
      throw new Error('pdfData.rows muss ein Array sein');
    }

    let currentPage = pdfDoc.getPage(startPageIndex);
    let currentRow = 0;

    for (let i = 0; i < pdfData.rows.length; i++) {
      const row = pdfData.rows[i];
      const cellData = this.prepareCellData(row);
      const requiredRows = this.calculateRequiredRows(cellData);
      const availableRows = this.config.layout.maxRows - currentRow;

      // Wenn der Eintrag nicht komplett auf die Seite passt
      if (requiredRows > availableRows) {
        const pageInfo = await this.renderMultiPageEntry(
          pdfDoc,
          cellData,
          currentPage,
          currentRow,
          basePdfBytes,
          font
        );
        currentPage = pageInfo.page;
        currentRow = pageInfo.row;
      } else {
        // Eintrag passt komplett auf die aktuelle Seite
        currentRow = this.renderSinglePageEntry(currentPage, cellData, currentRow, font);
      }

      // Prüfe ob wir eine neue Seite brauchen für den nächsten Eintrag
      if (currentRow >= this.config.layout.maxRows && i < pdfData.rows.length - 1) {
        currentPage = await this.createNewPage(pdfDoc, basePdfBytes!);
        currentRow = 0;
      }
    }
  }

  // Generiert das finale PDF mit allen Chat-Daten
  async generatePDF(pdfData: PdfData): Promise<Uint8Array> {
    // Validiere PDF-Daten
    if (!pdfData || !pdfData.rows || !Array.isArray(pdfData.rows)) {
      throw new Error('Ungültige PDF-Daten: rows Array fehlt');
    }

    if (pdfData.rows.length === 0) {
      throw new Error('Keine Daten zum Exportieren vorhanden');
    }

    const PDFLib = await import('pdf-lib');
    const { default: fontkitLib } = await import('@pdf-lib/fontkit');

    this.PDFLib = PDFLib;

    // Lade die basePdf.pdf als Basis
    const basePdfBytes = await this.loadBasePdfFile();
    let pdfDoc: PDFDocument;

    if (basePdfBytes) {
      // Lade die Basis-PDF
      pdfDoc = await PDFLib.PDFDocument.load(basePdfBytes);
    } else {
      // Fallback: Erstelle neues PDF wenn Basis-PDF nicht geladen werden kann
      console.warn('basePdf.pdf konnte nicht geladen werden, erstelle neues PDF');
      pdfDoc = await PDFLib.PDFDocument.create();
      pdfDoc.addPage([841.92, 595.32]); // A4 Querformat
    }

    // Registriere fontkit für benutzerdefinierte Schriftarten
    pdfDoc.registerFontkit(fontkitLib);

    // Lade SpaceMono-Regular Schriftart
    const fontBytes = await this.loadCustomFont();
    let font: PDFFont;

    if (fontBytes) {
      // Verwende SpaceMono-Regular (unterstützt alle Unicode-Zeichen)
      font = await pdfDoc.embedFont(fontBytes);
    } else {
      // Fallback auf Standard-Schriftart
      console.warn('SpaceMono-Regular konnte nicht geladen werden, verwende Standard-Schriftart');
      font = PDFLib.StandardFonts.Helvetica as unknown as PDFFont;
    }

    // Fülle die Tabelle mit PDF-Daten
    await this.fillTable(pdfDoc, pdfData, font, 0, basePdfBytes);

    // PDF als Bytes zurückgeben
    return pdfDoc.save();
  }

  // Hilfsfunktion zum Download des PDFs
  downloadPDF(pdfBytes: Uint8Array, filename: string = 'chat-export.pdf'): void {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export { ChatPDFGenerator };
export type { PdfData, Row, CellData };
