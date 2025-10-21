// filepath: c:\Users\engel\WebstormProjects\ISIHDDSG\src\features\chat-edit\import-export\pdf-generator\chatDataHandler.ts
// Chat Data Handler
// Verarbeitet und validiert Chat-Daten für den PDF-Export

interface Turn {
  id: string;
  role: string;
  model: string;
  text: string;
  html?: string | null;
  date: string;
}

interface Metadata {
  exportDate: string;
  totalTurns: number;
  [key: string]: unknown;
}

interface ChatData {
  turns: Turn[];
  metadata: Metadata;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface FilterCriteria {
  role?: string;
  model?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface Statistics {
  totalTurns: number;
  byRole: Record<string, number>;
  byModel: Record<string, number>;
  totalTextLength: number;
  averageTextLength: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

class ChatDataHandler {
  data: ChatData | null;

  constructor() {
    this.data = null;
  }

  /**
   * Erstellt ein Chat-Turn-Objekt
   */
  static createTurn(id: string, role: string, model: string, text: string, html: string | null = null, date: string | null = null): Turn {
    return {
      id,
      role: role || 'unknown',
      model,
      text,
      html,
      date: date || new Date().toISOString()
    };
  }

  /**
   * Erstellt ein Chat-Data-Objekt
   */
  static createChatData(turns: Turn[] = [], metadata: Partial<Metadata> = {}): ChatData {
    return {
      turns,
      metadata: {
        exportDate: new Date().toISOString(),
        totalTurns: turns.length,
        ...metadata
      }
    };
  }

  /**
   * Validiert ein Turn-Objekt
   */
  static validateTurn(turn: unknown): turn is Turn {
    if (!turn || typeof turn !== 'object') {
      return false;
    }

    const t = turn as Record<string, unknown>;

    // Pflichtfelder prüfen
    if (typeof t.id !== 'string' || typeof t.role !== 'string') {
      return false;
    }

    // Datum validieren
    if (t.date && typeof t.date === 'string') {
      const date = new Date(t.date);
      if (isNaN(date.getTime())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validiert Chat-Data
   */
  static validateChatData(chatData: unknown): ValidationResult {
    const errors: string[] = [];

    if (!chatData || typeof chatData !== 'object') {
      errors.push('chatData muss ein Objekt sein');
      return { valid: false, errors };
    }

    const cd = chatData as Record<string, unknown>;

    if (!Array.isArray(cd.turns)) {
      errors.push('chatData.turns muss ein Array sein');
      return { valid: false, errors };
    }

    // Alle Turns validieren
    cd.turns.forEach((turn, index) => {
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
   */
  static sanitizeText(text: string): string {
    if (!text) return '';

    // Entferne problematische Zeichen
    return text
      .replace(/[\r\n\t]+/g, ' ')  // Ersetze Zeilenumbrüche und Tabs durch Leerzeichen
      .replace(/\s+/g, ' ')         // Reduziere mehrere Leerzeichen
      .trim();
  }

  /**
   * Extrahiert Text aus HTML
   */
  static extractTextFromHtml(html: string): string {
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
   */
  static prepareTurnForExport(turn: Turn): Turn {
    const prepared: Turn = { ...turn };

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
   */
  static prepareChatDataForExport(chatData: ChatData): ChatData {
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
   */
  static filterTurns(turns: Turn[], criteria: FilterCriteria = {}): Turn[] {
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
   */
  static sortTurns(turns: Turn[], sortBy: keyof Turn = 'date', order: 'asc' | 'desc' = 'asc'): Turn[] {
    return [...turns].sort((a, b) => {
      let valueA: unknown = a[sortBy];
      let valueB: unknown = b[sortBy];

      // Datum-spezielle Behandlung
      if (sortBy === 'date') {
        valueA = new Date(valueA as string).getTime();
        valueB = new Date(valueB as string).getTime();
      }

      const numA = valueA as number;
      const numB = valueB as number;

      if (numA < numB) return order === 'asc' ? -1 : 1;
      if (numA > numB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Statistiken über Chat-Data berechnen
   */
  static getStatistics(chatData: ChatData): Statistics {
    const stats: Statistics = {
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

export { ChatDataHandler };
export type { Turn, ChatData, ValidationResult, FilterCriteria, Statistics };
