// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "AI_BRIDGE_REQUEST") {
        handleAiRequest(request, sendResponse);
        return true; // indicates asynchronous response
    }
});

async function handleAiRequest(request, sendResponse) {
    try {
        if (request.action === "list_tabs") {
            const tabs = await chrome.tabs.query({});
            // Filter out internal chrome pages or empty tabs
            const simplified = tabs
                .filter(t => t.url && !t.url.startsWith("chrome://"))
                .map(t => ({
                    id: t.id,
                    title: t.title,
                    url: t.url,
                    active: t.active,
                    windowId: t.windowId
                }));
            sendResponse({ success: true, data: simplified });
        } else if (request.action === "read_dom" || request.action === "click" || request.action === "input") {
            const tabId = request.tabId;
            if (!tabId) throw new Error("tabId is required for this action");
            
            // Forward the action to the content-target.js injected in the target tab
            chrome.tabs.sendMessage(tabId, {
                type: "TARGET_ACTION",
                action: request.action,
                selector: request.selector,
                text: request.text
            }, (res) => {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ success: true, data: res });
                }
            });
        } else {
            sendResponse({ success: false, error: "Unknown action: " + request.action });
        }
    } catch(e) {
        sendResponse({ success: false, error: e.message });
    }
}
