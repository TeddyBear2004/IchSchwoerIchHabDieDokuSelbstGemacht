const VIEWER_PATH = 'index.html';
const MESSAGE_TYPE_PAYLOAD = 'chat_export_payload';
const MESSAGE_TYPE_UPDATED = 'chatExportUpdated';

function notifyViewerUpdated(tabId, message) {
    // Sende Nachricht direkt an den Tab, nicht an die Extension
    if (!tabId) {
        console.warn('Keine Tab-ID für Benachrichtigung vorhanden');
        return;
    }

    chrome.tabs.sendMessage(tabId, {
        type: MESSAGE_TYPE_UPDATED,
        message
    }).catch(error => {
        // Fehler abfangen, falls der Tab nicht bereit ist
        console.log('Viewer-Tab konnte nicht benachrichtigt werden:', error.message);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== MESSAGE_TYPE_PAYLOAD) {
        return;
    }

    const payload = message.payload;
    if (!payload) {
        sendResponse({ success: false, error: 'Kein Payload übermittelt.' });
        return;
    }

    chrome.storage.local.set({ chatExport: payload }, () => {
        if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
        }

        const viewerUrl = chrome.runtime.getURL(VIEWER_PATH);

        chrome.tabs.query({ url: viewerUrl }, (tabs) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            const finalize = (tabId, infoMessage) => {
                notifyViewerUpdated(tabId, infoMessage);
                sendResponse({ success: true, message: infoMessage, tabId });
            };

            if (tabs && tabs.length > 0) {
                const targetTab = tabs[0];

                chrome.tabs.update(targetTab.id, { active: true }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('Konnte Tab nicht aktivieren:', chrome.runtime.lastError);
                    }

                    chrome.windows.update(targetTab.windowId, { focused: true }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('Konnte Fenster nicht fokussieren:', chrome.runtime.lastError);
                        }
                        finalize(targetTab.id, 'Viewer fokussiert');
                    });
                });
            } else {
                chrome.tabs.create({ url: viewerUrl }, (createdTab) => {
                    if (chrome.runtime.lastError || !createdTab) {
                        sendResponse({
                            success: false,
                            error: chrome.runtime.lastError?.message || 'Viewer konnte nicht geöffnet werden.'
                        });
                        return;
                    }
                    finalize(createdTab.id, 'Viewer geöffnet');
                });
            }
        });
    });

    return true;
});
