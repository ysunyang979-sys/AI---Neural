const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

const regex = /\/\/ ─── New Chat Button ───[\s\S]*?\}\);[\s\S]*?\}/;

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

content = content.replace(regex, replacement);
fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Successfully updated new chat button logic with regex.');
