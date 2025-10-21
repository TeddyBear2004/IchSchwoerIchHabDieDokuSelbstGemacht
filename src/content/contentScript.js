(function(){
    if (window.__chatgpt_extractor_installed) return;
    window.__chatgpt_extractor_installed = true;

    const btn = document.createElement('button');
    btn.innerText = 'Export Chat';
    Object.assign(btn.style, {
        position: 'fixed', right: '16px', bottom: '16px', zIndex: 999999,
        padding: '8px 12px', borderRadius: '8px', background: '#10a37f', color: 'white',
        border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    document.body.appendChild(btn);

    const textOf = (el) => el ? el.innerText.trim() : '';
    const htmlOf = (el) => el ? el.innerHTML.trim() : '';

    function extract() {
        const turns = Array.from(document.querySelectorAll(
            'article[data-turn-id], [data-testid^="conversation-turn-"], article[data-testid^="conversation-turn-"]'
        ));
        if (!turns.length) return {error: 'No chat turns found'};

        return turns.map(t => {
            const turnId = t.getAttribute('data-turn-id') || t.getAttribute('data-message-id') || null;
            const author = (t.querySelector('[data-message-author-role]')||t).getAttribute('data-message-author-role') ||
                (t.getAttribute('data-turn')?.includes('assistant') ? 'assistant' : 'user');
            const md = t.querySelector('.markdown, .whitespace-pre-wrap, .text-message, .user-message-bubble-color');
            const text = md ? textOf(md) : textOf(t);
            const html = md ? htmlOf(md) : htmlOf(t);
            const model = t.getAttribute('data-message-model-slug') ||
                (t.querySelector('[data-message-model-slug]')?.getAttribute('data-message-model-slug')) ||
                'unknown';
            return {
                id: turnId,
                role: author || 'unknown',
                model,
                text,
                html,
                date: new Date().toISOString()
            };
        });
    }

    btn.addEventListener('click', ()=>{
        const extracted = extract();
        if (extracted && extracted.error){
            alert('Keine Chat-Elemente gefunden.');
            return;
        }

        const payload = {
            meta: {
                title: document.title,
                url: location.href,
                timestamp: new Date().toISOString()
            },
            turns: extracted
        };

        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = 'Exportiere...';

        chrome.runtime.sendMessage({
            type: 'chat_export_payload',
            payload
        }, (response) => {
            btn.disabled = false;
            btn.innerText = originalText;

            if (chrome.runtime.lastError) {
                console.error('Fehler beim Senden des Exports:', chrome.runtime.lastError);
                alert('Export fehlgeschlagen. Bitte versuche es erneut.');
                return;
            }

            if (!response || response.success !== true) {
                console.error('Export konnte nicht verarbeitet werden:', response);
                alert('Export konnte nicht verarbeitet werden.');
            }
        });
    });

    window.addEventListener('keydown', e=>{ if (e.altKey && e.key.toLowerCase()==='e') btn.click(); });
})();
