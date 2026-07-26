// content-ai.js
// This script runs in the isolated world of the AI App's page.
// It bridges window.postMessage with chrome.runtime.sendMessage.

window.addEventListener("message", (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;

    if (event.data && event.data.type === "FROM_AI_APP") {
        // Forward the payload to the background script
        chrome.runtime.sendMessage({
            type: "AI_BRIDGE_REQUEST",
            ...event.data.payload
        }, (response) => {
            // Send the response back to the AI App
            window.postMessage({
                type: "FROM_CONTENT_SCRIPT",
                id: event.data.id,
                response: response
            }, "*");
        });
    }
});

// Let the AI app know the extension is active
window.postMessage({ type: "BRIDGE_READY" }, "*");
