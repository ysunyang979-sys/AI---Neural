// content-target.js
// This script is injected into all web pages (targets).
// It listens for commands from the background script.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TARGET_ACTION") {
        try {
            if (request.action === "read_dom") {
                // To save memory, clone and clean up the DOM before sending
                const clone = document.documentElement.cloneNode(true);
                clone.querySelectorAll("script, style, svg, link, iframe").forEach(el => el.remove());
                const cleanHTML = clone.innerHTML;
                
                // Truncate if it's absurdly huge
                sendResponse({ 
                    success: true,
                    title: document.title,
                    url: window.location.href,
                    html: cleanHTML.substring(0, 100000), // Max 100k chars for HTML
                    text: document.body.innerText.substring(0, 50000) // Max 50k chars for text
                });
            } else if (request.action === "click") {
                const el = document.querySelector(request.selector);
                if (el) {
                    el.click();
                    sendResponse({ success: true, message: `Clicked ${request.selector}` });
                } else {
                    sendResponse({ success: false, message: `Element ${request.selector} not found` });
                }
            } else if (request.action === "input") {
                const el = document.querySelector(request.selector);
                if (el) {
                    el.value = request.text || "";
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    sendResponse({ success: true, message: `Filled ${request.selector} with text` });
                } else {
                    sendResponse({ success: false, message: `Element ${request.selector} not found` });
                }
            } else {
                sendResponse({ success: false, message: "Unknown target action: " + request.action });
            }
        } catch (e) {
            sendResponse({ success: false, message: e.message });
        }
        return true;
    }
});
