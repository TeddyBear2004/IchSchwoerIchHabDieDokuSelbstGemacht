import type {Chat, ChatPair} from "../types.ts"

export interface ChatGPTExportFormat {
    meta: {
        timestamp: string
        url: string
        title: string
    }
    turns: Array<{
        date: string
        html: string
        id: string
        model: string
        role: "user" | "assistant"
        text: string
    }>
}

export const convertChatGPTExportToChats = (data: ChatGPTExportFormat[] | ChatGPTExportFormat): Chat[] => {
    const conversations = Array.isArray(data) ? data : [data]

    return conversations.map((conversation) => {
        const pairs: ChatPair[] = []

        const turns = conversation.turns || []

        let currentQuestion = ""
        let pairId = 1

        // Generiere eine eindeutige Chat-ID mit Timestamp
        const uniqueChatId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        for (const turn of turns) {
            if (turn.role === "user") {
                currentQuestion = turn.text
            } else if (turn.role === "assistant" && currentQuestion) {
                pairs.push({
                    id: `${uniqueChatId}-${pairId}`,
                    question: currentQuestion,
                    answer: turn.text,
                    selected: false,
                    model: turn.model,
                })
                pairId++
                currentQuestion = ""
            }
        }

        return {
            id: uniqueChatId,
            title: conversation.meta.title || `Chat ${new Date().toLocaleString()}`,
            pairs
        }
    }).filter(chat => chat.pairs.length > 0)
}
