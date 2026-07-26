const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

const regex = /canvasPane\.classList\.remove\('open'\);\r?\n\s*\}/;
const replacement = `canvasPane.classList.remove('open');
      canvasPane.classList.remove('active');
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
  console.log('Added remove active to new chat button.');
} else {
  console.log('Regex failed to match.');
}
