// filepath: c:\Users\engel\WebstormProjects\ISIHDDSG\public\background.ts
const VIEWER_PATH = 'index.html';
const MESSAGE_TYPE_PAYLOAD = 'chat_export_payload';
const MESSAGE_TYPE_UPDATED = 'chatExportUpdated';

interface ChatExportMessage {
  type: 'chat_export_payload';
  payload: string;
}

interface ChatExportUpdatedMessage {
  type: 'chatExportUpdated';
  message: string;
}

type Message = ChatExportMessage | ChatExportUpdatedMessage;

interface ResponseMessage {
  success: boolean;
  error?: string;
  message?: string;
  tabId?: number;
}

function notifyViewerUpdated(tabId: number, message: string): void {
    // Sende Nachricht direkt an den Tab, nicht an die Extension
    if (!tabId) {
        console.warn('Keine Tab-ID für Benachrichtigung vorhanden');
        return;
    }

    chrome.tabs.sendMessage(tabId, {
        type: MESSAGE_TYPE_UPDATED,
        message
    }).catch((error: Error) => {
        // Fehler abfangen, falls der Tab nicht bereit ist
        console.log('Viewer-Tab konnte nicht benachrichtigt werden:', error.message);
    });
}

chrome.runtime.onMessage.addListener((
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseMessage) => void
): boolean => {
    if (!message || message.type !== MESSAGE_TYPE_PAYLOAD) {
        return false;
    }

    const payload = (message as ChatExportMessage).payload;
    if (!payload) {
        sendResponse({ success: false, error: 'Kein Payload übermittelt.' });
        return true;
    }

    chrome.storage.local.set({ chatExport: payload }, () => {
        if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
        }

        const viewerUrl = chrome.runtime.getURL(VIEWER_PATH);

        chrome.tabs.query({ url: viewerUrl }, (tabs: chrome.tabs.Tab[]) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            const finalize = (tabId: number, infoMessage: string): void => {
                notifyViewerUpdated(tabId, infoMessage);
                sendResponse({ success: true, message: infoMessage, tabId });
            };

            if (tabs && tabs.length > 0) {
                const targetTab = tabs[0];

                chrome.tabs.update(targetTab.id!, { active: true }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('Konnte Tab nicht aktivieren:', chrome.runtime.lastError);
                    }

                    chrome.windows.update(targetTab.windowId!, { focused: true }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('Konnte Fenster nicht fokussieren:', chrome.runtime.lastError);
                        }
                        finalize(targetTab.id!, 'Viewer fokussiert');
                    });
                });
            } else {
                chrome.tabs.create({ url: viewerUrl }, (createdTab: chrome.tabs.Tab | undefined) => {
                    if (chrome.runtime.lastError || !createdTab) {
                        sendResponse({
                            success: false,
                            error: chrome.runtime.lastError?.message || 'Viewer konnte nicht geöffnet werden.'
                        });
                        return;
                    }
                    finalize(createdTab.id!, 'Viewer geöffnet');
                });
            }
        });
    });

    return true;
});
