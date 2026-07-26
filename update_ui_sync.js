const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// 1. Sidebar listener regex
const sidebarRegex = /el\.onclick\s*=\s*\(e\)\s*=>\s*\{[\s\S]*?refreshChatView\(\);\s*\};/;
const sidebarReplacement = `el.onclick = (e) => {
      if (e.target.closest('.session-delete-btn')) return;
      
      if (typeof currentAbortController !== 'undefined' && currentAbortController) {
        currentAbortController.abort();
      }
      
      // Force UI reset synchronously
      if (typeof isChatActive !== 'undefined') isChatActive = false;
      const sendBtn = document.getElementById('chat-send-btn');
      if (sendBtn) {
        sendBtn.innerHTML = '<i data-lucide="send" style="fill: currentColor; width: 14px; height: 14px; margin: auto;"></i>';
        if (window.lucide) lucide.createIcons();
      }

      const canvasPane = document.getElementById('canvas-pane');
      if (canvasPane) {
        canvasPane.classList.remove('open');
        canvasPane.classList.remove('active');
      }
      activeSessionId = session.id;
      persistSessions();
      refreshChatView();
    };`;

if (sidebarRegex.test(content)) {
  content = content.replace(sidebarRegex, sidebarReplacement);
  console.log('Sidebar logic successfully updated to reset UI synchronously.');
} else {
  console.log('Sidebar Regex failed to match.');
}

// 2. New Chat Button listener regex
const newChatRegex = /newChatBtn\.addEventListener\("click",\s*\(\)\s*=>\s*\{[\s\S]*?canvasPane\.classList\.remove\('active'\);\r?\n\s*\}/;
const newChatReplacement = `newChatBtn.addEventListener("click", () => {
    // 1. Interrupt AI if generating
    if (typeof currentAbortController !== 'undefined' && currentAbortController) {
      currentAbortController.abort();
    }
    
    // Force UI reset synchronously
    if (typeof isChatActive !== 'undefined') isChatActive = false;
    const sendBtn = document.getElementById('chat-send-btn');
    if (sendBtn) {
      sendBtn.innerHTML = '<i data-lucide="send" style="fill: currentColor; width: 14px; height: 14px; margin: auto;"></i>';
      if (window.lucide) lucide.createIcons();
    }

    // 2. Close canvas if open
    const canvasPane = document.getElementById('canvas-pane');
    if (canvasPane) {
      canvasPane.classList.remove('open');
      canvasPane.classList.remove('active');
    }`;

if (newChatRegex.test(content)) {
  content = content.replace(newChatRegex, newChatReplacement);
  console.log('New chat logic successfully updated to reset UI synchronously.');
} else {
  console.log('New chat Regex failed to match.');
}

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
