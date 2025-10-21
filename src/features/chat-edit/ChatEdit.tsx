import {useState, useEffect} from "react"
import type {Chat, ChatPair} from "./types"
import {ChatControlPanel} from "./ChatControlPanel"
import {ChatPairCard} from "./chat-pair/ChatPairCard.tsx"
import {ChatHeader} from "./ChatHeader"
import {ApplyToOthersDialog} from "./chat-pair/ApplyToOthersDialog.tsx"
import {handleExport} from "@/features/chat-edit/import-export/handleExport.ts";

interface ChatEditProps {
    initialChats: Chat[]
    chats: Chat[]
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>
}

export default function ChatEdit({ initialChats, chats, setChats }: ChatEditProps) {
    const [copyDialogOpen, setCopyDialogOpen] = useState(false)
    const [sourcePairId, setSourcePairId] = useState<string | null>(null)

    useEffect(() => {
        if (initialChats && initialChats.length > 0 && chats.length === 0) {
            setChats(initialChats)
        }
    }, [initialChats, chats.length, setChats])

    const allChatPairs = chats.flatMap(chat => chat.pairs)

    const toggleSelection = (pairId: string) => {
        setChats((prevChats) =>
            prevChats.map((chat) => ({
                ...chat,
                pairs: chat.pairs.map((pair) =>
                    pair.id === pairId ? { ...pair, selected: !pair.selected } : pair
                )
            }))
        )
    }

    const updatePair = (pairId: string, updates: Partial<ChatPair>) => {
        setChats((prevChats) =>
            prevChats.map((chat) => ({
                ...chat,
                pairs: chat.pairs.map((pair) =>
                    pair.id === pairId ? { ...pair, ...updates } : pair
                )
            }))
        )
    }

    const handleApplyToOthers = (pairId: string) => {
        setSourcePairId(pairId)
        setCopyDialogOpen(true)
    }

    const applyToSelectedPairs = (sourcePairId: string, targetPairIds: string[]) => {
        const sourcePair = allChatPairs.find((pair) => pair.id === sourcePairId)
        if (!sourcePair) return

        setChats((prevChats) =>
            prevChats.map((chat) => ({
                ...chat,
                pairs: chat.pairs.map((pair) => {
                    if (targetPairIds.includes(pair.id)) {
                        return {
                            ...pair,
                            questionReason: sourcePair.questionReason,
                            answerEvaluation: sourcePair.answerEvaluation,
                            selected: true
                        }
                    }
                    return pair
                })
            }))
        )
    }

    const selectAllInChat = (chatId: string) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === chatId
                    ? { ...chat, pairs: chat.pairs.map((pair) => ({ ...pair, selected: true })) }
                    : chat
            )
        )
    }

    const deselectAllInChat = (chatId: string) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === chatId
                    ? { ...chat, pairs: chat.pairs.map((pair) => ({ ...pair, selected: false })) }
                    : chat
            )
        )
    }

    const removeChat = (chatId: string) => {
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
    }

    const moveChatUp = (chatId: string) => {
        setChats((prevChats) => {
            const index = prevChats.findIndex((chat) => chat.id === chatId)
            if (index <= 0) return prevChats
            const newChats = [...prevChats]
            const temp = newChats[index - 1]
            newChats[index - 1] = newChats[index]
            newChats[index] = temp
            return newChats
        })
    }

    const moveChatDown = (chatId: string) => {
        setChats((prevChats) => {
            const index = prevChats.findIndex((chat) => chat.id === chatId)
            if (index < 0 || index >= prevChats.length - 1) return prevChats
            const newChats = [...prevChats]
            const temp = newChats[index + 1]
            newChats[index + 1] = newChats[index]
            newChats[index] = temp
            return newChats
        })
    }

    const selectAll = () => {
        setChats((prevChats) =>
            prevChats.map((chat) => ({
                ...chat,
                pairs: chat.pairs.map((pair) => ({ ...pair, selected: true }))
            }))
        )
    }

    const deselectAll = () => {
        setChats((prevChats) =>
            prevChats.map((chat) => ({
                ...chat,
                pairs: chat.pairs.map((pair) => ({ ...pair, selected: false }))
            }))
        )
    }

    const handleExportWithFilteredPairs = () => {
        const selectedPairs = allChatPairs.filter((pair) => pair.selected)
        console.log("Exporting:", selectedPairs)
        handleExport(selectedPairs);
    }

    const selectedCount = allChatPairs.filter((pair) => pair.selected).length
    const sourcePair = sourcePairId ? allChatPairs.find((pair) => pair.id === sourcePairId) || null : null

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <ChatControlPanel
                    selectedCount={selectedCount}
                    totalCount={allChatPairs.length}
                    onSelectAll={selectAll}
                    onDeselectAll={deselectAll}
                    handleExport={handleExportWithFilteredPairs}
                />

                {/* Gruppiert nach Chats */}
                <div className="space-y-8">
                    {chats.map((chat, index) => {
                        const selectedPairsInChat = chat.pairs.filter((pair) => pair.selected).length

                        return (
                            <div key={chat.id} className="space-y-4">
                                <ChatHeader
                                    chatId={chat.id}
                                    title={chat.title}
                                    pairsCount={chat.pairs.length}
                                    selectedPairsCount={selectedPairsInChat}
                                    onSelectAll={() => selectAllInChat(chat.id)}
                                    onDeselectAll={() => deselectAllInChat(chat.id)}
                                    onRemoveChat={() => removeChat(chat.id)}
                                    onMoveUp={() => moveChatUp(chat.id)}
                                    onMoveDown={() => moveChatDown(chat.id)}
                                    isFirst={index === 0}
                                    isLast={index === chats.length - 1}
                                />

                                {/* ChatPairs für diesen Chat */}
                                <div className="space-y-4">
                                    {chat.pairs.map((pair) => (
                                        <ChatPairCard
                                            key={pair.id}
                                            pair={pair}
                                            onToggle={toggleSelection}
                                            onUpdatePair={updatePair}
                                            onApplyToOthers={handleApplyToOthers}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <ApplyToOthersDialog
                open={copyDialogOpen}
                onOpenChange={setCopyDialogOpen}
                sourcePair={sourcePair}
                allPairs={allChatPairs}
                onApply={applyToSelectedPairs}
            />
        </div>
    )
}
