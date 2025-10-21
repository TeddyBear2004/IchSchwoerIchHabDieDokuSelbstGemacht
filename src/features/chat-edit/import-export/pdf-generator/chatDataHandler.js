// Chat Data Handler
// Verarbeitet und validiert Chat-Daten für den PDF-Export

class ChatDataHandler {
    constructor() {
        this.data = null;
    }

    /**
     * Erstellt ein Chat-Turn-Objekt
     * @param {string} id - Eindeutige ID des Turns
     * @param {string} role - Rolle (assistant, user, etc.)
     * @param {string} model - Verwendetes Modell
     * @param {string} text - Textinhalt
     * @param {string} html - HTML-Inhalt (optional)
     * @param {string} date - ISO Datum String
     * @returns {Object} Chat Turn Objekt
     */
    static createTurn(id, role, model, text, html = null, date = null) {
        return {
            id: id,
            role: role || 'unknown',
            model: model,
            text: text,
            html: html,
            date: date || new Date().toISOString()
        };
    }

    /**
     * Erstellt ein Chat-Data-Objekt
     * @param {Array} turns - Array von Turn-Objekten
     * @param {Object} metadata - Zusätzliche Metadaten (optional)
     * @returns {Object} Chat Data Objekt
     */
    static createChatData(turns = [], metadata = {}) {
        return {
            turns: turns,
            metadata: {
                exportDate: new Date().toISOString(),
                totalTurns: turns.length,
                ...metadata
            }
        };
    }

    /**
     * Validiert ein Turn-Objekt
     * @param {Object} turn - Turn zum Validieren
     * @returns {boolean} True wenn valide
     */
    static validateTurn(turn) {
        if (!turn || typeof turn !== 'object') {
            return false;
        }

        // Pflichtfelder prüfen
        if (!turn.id || !turn.role) {
            return false;
        }

        // Datum validieren
        if (turn.date) {
            const date = new Date(turn.date);
            if (isNaN(date.getTime())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validiert Chat-Data
     * @param {Object} chatData - Chat Data zum Validieren
     * @returns {Object} { valid: boolean, errors: Array }
     */
    static validateChatData(chatData) {
        const errors = [];

        if (!chatData || typeof chatData !== 'object') {
            errors.push('chatData muss ein Objekt sein');
            return { valid: false, errors };
        }

        if (!Array.isArray(chatData.turns)) {
            errors.push('chatData.turns muss ein Array sein');
            return { valid: false, errors };
        }

        // Alle Turns validieren
        chatData.turns.forEach((turn, index) => {
            if (!ChatDataHandler.validateTurn(turn)) {
                errors.push(`Turn an Index ${index} ist ungültig`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Bereinigt Text für PDF-Export
     * @param {string} text - Text zum Bereinigen
     * @returns {string} Bereinigter Text
     */
    static sanitizeText(text) {
        if (!text) return '';

        // Entferne problematische Zeichen
        return text
            .replace(/[\r\n\t]+/g, ' ')  // Ersetze Zeilenumbrüche und Tabs durch Leerzeichen
            .replace(/\s+/g, ' ')         // Reduziere mehrere Leerzeichen
            .trim();
    }

    /**
     * Extrahiert Text aus HTML
     * @param {string} html - HTML String
     * @returns {string} Extrahierter Text
     */
    static extractTextFromHtml(html) {
        if (!html) return '';

        // Einfache HTML-zu-Text Konvertierung
        let text = html
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/p>/gi, ' ')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"');

        return ChatDataHandler.sanitizeText(text);
    }

    /**
     * Bereitet einen Turn für PDF-Export vor
     * @param {Object} turn - Turn Objekt
     * @returns {Object} Vorbereiteter Turn
     */
    static prepareTurnForExport(turn) {
        const prepared = { ...turn };

        // Verwende HTML-Text wenn kein Text vorhanden
        if (!prepared.text && prepared.html) {
            prepared.text = ChatDataHandler.extractTextFromHtml(prepared.html);
        }

        // Bereinige Text
        if (prepared.text) {
            prepared.text = ChatDataHandler.sanitizeText(prepared.text);
        }

        // Stelle sicher dass Datum vorhanden ist
        if (!prepared.date) {
            prepared.date = new Date().toISOString();
        }

        return prepared;
    }

    /**
     * Bereitet Chat-Data für PDF-Export vor
     * @param {Object} chatData - Chat Data
     * @returns {Object} Vorbereitete Chat Data
     */
    static prepareChatDataForExport(chatData) {
        // Validiere zuerst
        const validation = ChatDataHandler.validateChatData(chatData);
        if (!validation.valid) {
            console.warn('Chat Data Validierung fehlgeschlagen:', validation.errors);
        }

        // Bereite alle Turns vor
        const preparedTurns = chatData.turns.map(turn =>
            ChatDataHandler.prepareTurnForExport(turn)
        );

        return ChatDataHandler.createChatData(preparedTurns, chatData.metadata);
    }

    /**
     * Filtert Turns nach Kriterien
     * @param {Array} turns - Array von Turns
     * @param {Object} criteria - Filter-Kriterien
     * @returns {Array} Gefilterte Turns
     */
    static filterTurns(turns, criteria = {}) {
        return turns.filter(turn => {
            // Nach Rolle filtern
            if (criteria.role && turn.role !== criteria.role) {
                return false;
            }

            // Nach Modell filtern
            if (criteria.model && turn.model !== criteria.model) {
                return false;
            }

            // Nach Datum filtern
            if (criteria.dateFrom || criteria.dateTo) {
                const turnDate = new Date(turn.date);

                if (criteria.dateFrom && turnDate < new Date(criteria.dateFrom)) {
                    return false;
                }

                if (criteria.dateTo && turnDate > new Date(criteria.dateTo)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Sortiert Turns
     * @param {Array} turns - Array von Turns
     * @param {string} sortBy - Sortierfeld (date, role, model)
     * @param {string} order - Sortierrichtung (asc, desc)
     * @returns {Array} Sortierte Turns
     */
    static sortTurns(turns, sortBy = 'date', order = 'asc') {
        return [...turns].sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            // Datum-spezielle Behandlung
            if (sortBy === 'date') {
                valueA = new Date(valueA).getTime();
                valueB = new Date(valueB).getTime();
            }

            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Statistiken über Chat-Data berechnen
     * @param {Object} chatData - Chat Data
     * @returns {Object} Statistiken
     */
    static getStatistics(chatData) {
        const stats = {
            totalTurns: chatData.turns.length,
            byRole: {},
            byModel: {},
            totalTextLength: 0,
            averageTextLength: 0,
            dateRange: {
                earliest: null,
                latest: null
            }
        };

        chatData.turns.forEach(turn => {
            // Nach Rolle zählen
            stats.byRole[turn.role] = (stats.byRole[turn.role] || 0) + 1;

            // Nach Modell zählen
            if (turn.model) {
                stats.byModel[turn.model] = (stats.byModel[turn.model] || 0) + 1;
            }

            // Textlänge
            if (turn.text) {
                stats.totalTextLength += turn.text.length;
            }

            // Datumsbereich
            const turnDate = new Date(turn.date);
            if (!stats.dateRange.earliest || turnDate < new Date(stats.dateRange.earliest)) {
                stats.dateRange.earliest = turn.date;
            }
            if (!stats.dateRange.latest || turnDate > new Date(stats.dateRange.latest)) {
                stats.dateRange.latest = turn.date;
            }
        });

        // Durchschnittliche Textlänge
        if (stats.totalTurns > 0) {
            stats.averageTextLength = Math.round(stats.totalTextLength / stats.totalTurns);
        }

        return stats;
    }
}

// Export für Chrome Extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatDataHandler;
}

