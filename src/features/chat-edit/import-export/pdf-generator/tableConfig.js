// Tabellen-Konfiguration für PDF-Export
// Enthält alle Einstellungen für die Darstellung der Chat-Daten in der Tabelle

const charsPerLine = 57;
const offset = 179;

const TableConfig = {
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

// Export für Chrome Extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TableConfig;
}

export { TableConfig };
