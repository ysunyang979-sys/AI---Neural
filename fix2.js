const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

content = content.replace(
    '              result = `QR Code generated successfully.`;\n              addLine(`✅ 二维码生成完毕`);\n            }\n          } catch (err) {\n            result = `Error: ${err.message}`;\n            addLine(`❌ 工具调用失败: ${err.message}`);\n          }',
    '              result = `QR Code generated successfully.`;\n              addLine(`✅ 二维码生成完毕`);\n            } else {\n              result = `Error: Tool \\`${tc.function.name}\\` is not recognized or not implemented.`;\n              addLine(`⚠️ 未知工具: ${tc.function.name}`);\n            }\n          } catch (err) {\n            result = `Error: ${err.message}`;\n            addLine(`❌ 工具调用失败: ${err.message}`);\n          }'
);

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Done replacement.');
