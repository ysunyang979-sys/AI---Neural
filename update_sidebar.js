const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// The regex matches el.querySelector("span").onclick = () => { ... };
const regex = /el\.querySelector\("span"\)\.onclick\s*=\s*\(\)\s*=>\s*\{[\s\S]*?refreshChatView\(\);\s*\};/;

const replacement = `el.onclick = (e) => {
      // Don't trigger if they clicked the delete button
      if (e.target.closest('.session-delete-btn')) return;
      
      if (typeof currentAbortController !== 'undefined' && currentAbortController) {
        currentAbortController.abort();
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

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
  console.log('Sidebar logic successfully updated.');
} else {
  console.log('Regex failed to match.');
}
