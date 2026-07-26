const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Preset Buttons replacement
const presetTarget = `    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      currentSysPrompt = prompt;
      sysPromptInput.value = prompt;
      localStorage.setItem("aiSysPrompt", currentSysPrompt);`;

const presetReplacement = `    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      if (currentSysPrompt === prompt) return; // Prevent triggering if already active
      
      currentSysPrompt = prompt;
      sysPromptInput.value = prompt;
      localStorage.setItem("aiSysPrompt", currentSysPrompt);
      
      // DEEP FIX: Prevent persona contamination by auto-starting a new chat if current chat has history
      const activeHistory = getActiveHistory();
      if (activeHistory && activeHistory.length > 0) {
        if (currentAbortController) currentAbortController.abort();
        const canvasPane = document.getElementById('canvas-pane');
        if (canvasPane) canvasPane.classList.remove('active');
        if (typeof createEmptySession === 'function') {
          createEmptySession();
          refreshChatView();
          setTimeout(() => {
            addLine(\`✨ 已切换至全新人格模式，历史上下文已清空隔离。\`);
          }, 100);
        }
      }`;

content = content.replace(presetTarget, presetReplacement);

// 2. Dropdown Skills replacement
const dropdownTarget = `          // Clean up markdown frontmatter if present
          promptContent = promptContent
            .replace(/^---\\s*[\\s\\S]*?---\\s*/, "")
            .trim();

          
          currentSysPrompt = promptContent;
          sysPromptInput.value = promptContent;
          localStorage.setItem("aiSysPrompt", currentSysPrompt);`;

const dropdownReplacement = `          // Clean up markdown frontmatter if present
          promptContent = promptContent
            .replace(/^---\\s*[\\s\\S]*?---\\s*/, "")
            .trim();

          if (currentSysPrompt === promptContent) {
            moreSkillsDropdown.style.display = "none";
            item.innerHTML = originalText;
            item.classList.remove("loading");
            return;
          }
          
          currentSysPrompt = promptContent;
          sysPromptInput.value = promptContent;
          localStorage.setItem("aiSysPrompt", currentSysPrompt);
          
          // DEEP FIX: Prevent persona contamination
          const activeHistory = getActiveHistory();
          if (activeHistory && activeHistory.length > 0) {
            if (currentAbortController) currentAbortController.abort();
            const canvasPane = document.getElementById('canvas-pane');
            if (canvasPane) canvasPane.classList.remove('active');
            if (typeof createEmptySession === 'function') {
              createEmptySession();
              refreshChatView();
              setTimeout(() => {
                addLine(\`✨ 已装载 \${originalText}，开启全新会话以防历史干扰。\`);
              }, 100);
            }
          }`;

content = content.replace(dropdownTarget, dropdownReplacement);

content = content.replace(/\n/g, '\r\n');
fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Persona remnant fix applied.');
