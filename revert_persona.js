const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// We are reverting the createEmptySession() logic but keeping the strict persona separation.
// We will instead append a strict override to the system prompt if the persona changes mid-conversation.

// For preset icons
const presetRegex = /\/\/ DEEP FIX: Prevent persona contamination[\s\S]*?\}\s*\}/;
content = content.replace(presetRegex, `// Visual feedback for persona switch without clearing chat
      const activeHistory = getActiveHistory();
      if (activeHistory && activeHistory.length > 0) {
        addLine(\`✨ 角色已切换为当前选中人格。AI 将在后续对话中采用新的人格设定。\`);
        // We set a flag to strictly enforce the new persona on the next message
        window._personaJustSwitched = true;
      }`);

// For dropdown skills
const dropdownRegex = /\/\/ DEEP FIX: Prevent persona contamination[\s\S]*?\}\s*\}/g;
content = content.replace(dropdownRegex, `// Visual feedback for persona switch without clearing chat
          const activeHistory = getActiveHistory();
          if (activeHistory && activeHistory.length > 0) {
            addLine(\`✨ 技能已切换为 \${originalText}。AI 将在后续对话中严格遵循新设定。\`);
            window._personaJustSwitched = true;
          }`);

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Reverted createEmptySession, added mid-chat switch handling.');
