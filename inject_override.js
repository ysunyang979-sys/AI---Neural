const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

const target = '  if (currentUserPrompt && currentUserPrompt.trim()) {';
const replacement = `  if (window._personaJustSwitched) {
    dynamicSysPrompt += "\\n\\n[CRITICAL OVERRIDE: The user has just switched your persona/role! You MUST COMPLETELY FORGET any previous tone, role, or persona you played earlier in this conversation. From this point forward, you must STRICTLY act according to the new system prompt provided above. Do NOT let previous responses influence your behavior.]";
    window._personaJustSwitched = false;
  }
  
  if (currentUserPrompt && currentUserPrompt.trim()) {`;

content = content.replace(target, replacement);
fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Added strict persona override.');
