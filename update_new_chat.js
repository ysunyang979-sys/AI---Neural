const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

const target = `// ─── New Chat Button ───
const newChatBtn = document.getElementById("chat-new-btn");
if (newChatBtn) {
  newChatBtn.addEventListener("click", () => {
    if (typeof createEmptySession === "function") {
      createEmptySession();
      refreshChatView();
    }
  });
}`;

const replacement = `// ─── New Chat Button ───
const newChatBtn = document.getElementById("chat-new-btn");
if (newChatBtn) {
  newChatBtn.addEventListener("click", () => {
    // 1. Interrupt AI if generating
    if (typeof currentAbortController !== 'undefined' && currentAbortController) {
      currentAbortController.abort();
    }
    
    // 2. Close canvas if open
    const canvasPane = document.getElementById('canvas-pane');
    if (canvasPane) {
      canvasPane.classList.remove('active');
    }

    // 3. Only create new session if current has messages
    const activeHistory = typeof getActiveHistory === 'function' ? getActiveHistory() : [];
    if (activeHistory.length > 0) {
      if (typeof createEmptySession === "function") {
        createEmptySession();
        refreshChatView();
      }
    } else {
      // If already on a blank chat, just focus the input
      const chatInput = document.getElementById('chat-input');
      if (chatInput) chatInput.focus();
    }
  });
}`;

if (content.includes('// ─── New Chat Button ───')) {
  content = content.replace(target, replacement);
  fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
  console.log('Successfully updated new chat button logic.');
} else {
  console.log('Target block not found.');
}
