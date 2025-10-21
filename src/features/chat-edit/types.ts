export interface ChatPair {
    id: string
    question: string
    answer: string
    selected: boolean
    questionReason?: string
    answerEvaluation?: string
    model?: string
}

export interface Chat {
    id: string
    title: string
    pairs: ChatPair[]
}