const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// 1. Fix the New Chat Canvas close bug (active -> open)
content = content.replace(
  "canvasPane.classList.remove('active');",
  "canvasPane.classList.remove('open');"
);

// 2. Add the abort and canvas close logic to the session switching in sidebar
const sidebarTarget = `    el.querySelector("span").onclick = () => {
      activeSessionId = session.id;
      persistSessions();
      refreshChatView();
    };`;

const sidebarReplacement = `    el.querySelector("span").onclick = () => {
      if (typeof currentAbortController !== 'undefined' && currentAbortController) {
        currentAbortController.abort();
      }
      const canvasPane = document.getElementById('canvas-pane');
      if (canvasPane) {
        canvasPane.classList.remove('open');
      }
      activeSessionId = session.id;
      persistSessions();
      refreshChatView();
    };`;

content = content.replace(sidebarTarget, sidebarReplacement);

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Fixed canvas close class and updated sidebar session switching logic.');
