const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// Replace addLine by finding the exact lines
content = content.replace(/addLine\(\`✨ 角色已切换为当前选中人格。AI 将在后续对话中采用新的人格设定。\`\);/g, '');
content = content.replace(/addLine\(\`✨ 技能已切换为 \$\{originalText\}。AI 将在后续对话中严格遵循新设定。\`\);/g, '');

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Removed invalid addLine calls.');
