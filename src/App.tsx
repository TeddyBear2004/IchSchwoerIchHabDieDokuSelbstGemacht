import {Header} from "./navigation/Header.tsx";
import {useCallback, useEffect, useState, lazy, Suspense} from "react";
import {convertChatGPTExportToChats} from "@/features/chat-edit/import-export/chatConverter.ts";
import type {Chat} from "@/features/chat-edit/types.ts";

const ChatEdit = lazy(() => import('./features/chat-edit/ChatEdit.tsx'));
const TutorialPage = lazy(() => import('@/features/tutorial/TutorialPage.tsx').then(module => ({ default: module.TutorialPage })));

function App() {
    //TODO Mehr anzeigen auch für frage
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentView, setCurrentView] = useState<'editor' | 'tutorial'>('editor');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (chats.length > 0) {
            setHasUnsavedChanges(true);
        }
    }, [chats]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    const performReload = useCallback(() => {
        try {
            chrome.storage.local.get('chatExport', (result) => {
                if (result.chatExport) {
                    const convertedChats = convertChatGPTExportToChats(result.chatExport);

                    setChats(prevChats => {
                        return [...convertedChats, ...prevChats];
                    });

                    // Wichtig: Lösche chatExport nach dem Laden, sonst wird es immer wieder hinzugefügt
                    chrome.storage.local.remove('chatExport', () => {
                        console.log("chatExport cleared from storage");
                    });
                }
            });
        } catch (error) {
            console.error(error);
        }
    }, []);

    const loadDataAndRender = useCallback(() => {
        console.log("loading data");
        if (typeof chrome === 'undefined' || !chrome?.storage?.local) {
            return;
        }

        performReload();
    }, [performReload]);

    useEffect(() => {
        if (typeof chrome === 'undefined' || !chrome?.runtime || !chrome?.storage) {
            console.warn('Chrome extension API not available');
            return;
        }

        loadDataAndRender();

        try{
            // Message Listener
            const messageListener = (message: { type?: string }) => {
                if (message && message.type === 'chatExportUpdated') {
                    console.log("Received chatExportUpdated message");
                    loadDataAndRender();
                }
            };

            // Storage Change Listener
            const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
                if (area === 'local' && changes.chatExport) {
                    console.log("Storage changed for chatExport");
                    loadDataAndRender();
                }
            };

            chrome.runtime.onMessage.addListener(messageListener);
            chrome.storage.onChanged.addListener(storageListener);

            // Cleanup: Entferne Listener beim Unmount
            return () => {
                chrome.runtime.onMessage.removeListener(messageListener);
                chrome.storage.onChanged.removeListener(storageListener);
            };
        }
        catch(error){
            console.error(error);
        }
    }, [loadDataAndRender]);

    return (
        <>
            <Header
                currentView={currentView}
                onNavigate={setCurrentView}
            />
            <Suspense fallback={<div>Loading...</div>}>
                {currentView === 'tutorial' ? (
                    <TutorialPage />
                ) : (
                    <ChatEdit initialChats={chats} chats={chats} setChats={setChats}/>
                )}
            </Suspense>
        </>
    )
}

export default App
