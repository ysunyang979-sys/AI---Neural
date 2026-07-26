const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// Insert tool definition
const surferTools = `        {
          type: "function",
          function: {
            name: "surf_web",
            description: "Agentic Web Surfer. Fetches a web page using a CORS proxy, sanitizes it, and renders it in the Canvas. It can also extract specific data from the page using CSS selectors if requested.",
            parameters: {
              type: "object",
              properties: {
                url: { type: "string", description: "The URL of the webpage to surf." },
                action: { type: "string", enum: ["navigate", "extract"], description: "'navigate' to just load and view the page. 'extract' to load and extract text matching a CSS selector." },
                selector: { type: "string", description: "CSS selector for extraction (only required if action is 'extract'). e.g. 'h1', '.article-body', etc." }
              },
              required: ["url", "action"],
            },
          },
        },
`;

content = content.replace(
    '        {\n          type: "function",\n          function: {\n            name: "calculate",',
    surferTools + '        {\n          type: "function",\n          function: {\n            name: "calculate",'
);

// Insert execution logic
const surferExec = `            if (tc.function.name === "surf_web") {
              const url = args.url;
              const action = args.action;
              const selector = args.selector;
              
              addLine(\`🕷️ Agentic Web Surfer: 接管网页 \${url}...\`);
              
              const proxyUrl = \`https://api.allorigins.win/get?url=\${encodeURIComponent(url)}\`;
              try {
                const res = await fetch(proxyUrl);
                const data = await res.json();
                const htmlStr = data.contents;
                
                // Parse and sanitize
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlStr, 'text/html');
                
                // Remove scripts, styles, forms, iframes for safety
                const elementsToRemove = doc.querySelectorAll('script, style, iframe, frame, object, embed, form');
                elementsToRemove.forEach(el => el.remove());
                
                // Rewrite relative links to absolute (visual only)
                const baseUrl = new URL(url);
                doc.querySelectorAll('a').forEach(a => {
                  if (a.getAttribute('href') && a.getAttribute('href').startsWith('/')) {
                    a.href = baseUrl.origin + a.getAttribute('href');
                  }
                  a.target = '_blank'; // open links in new tab
                });
                
                const canvasPane = document.getElementById("canvas-pane");
                const canvasContent = document.getElementById("canvas-content");
                
                if (canvasPane && canvasContent) {
                  canvasPane.classList.add("active");
                  // Build safe reader view
                  const cleanHtml = doc.body.innerHTML;
                  canvasContent.innerHTML = \`
                    <div style="padding: 10px; background: #e2e8f0; border-bottom: 1px solid #cbd5e0; color: #2d3748; font-family: sans-serif; display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">🌐</span>
                        <div style="background: white; padding: 4px 12px; border-radius: 4px; border: 1px solid #a0aec0; width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          \${url}
                        </div>
                      </div>
                      <div style="font-size: 12px; background: #ed8936; color: white; padding: 4px 8px; border-radius: 4px;">阅读模式 / 沉浸接管</div>
                    </div>
                    <div style="padding: 20px; background: white; color: black; height: calc(100% - 60px); overflow-y: auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                      \${cleanHtml}
                    </div>
                  \`;
                }
                
                if (action === "extract" && selector) {
                  const nodes = doc.querySelectorAll(selector);
                  let extractedText = "";
                  nodes.forEach((node, i) => {
                    extractedText += \`[\${i+1}] \${node.innerText.trim()}\\n\`;
                  });
                  if (!extractedText) extractedText = "No elements matched the selector.";
                  result = \`Successfully navigated to \${url}. Extracted data:\\n\${extractedText.substring(0, 5000)}\`;
                  addLine(\`✅ 已提取网页数据\`);
                } else {
                  const pageText = doc.body.innerText.replace(/\\s+/g, ' ').substring(0, 5000);
                  result = \`Successfully navigated to \${url}. Page text preview:\\n\${pageText}\`;
                  addLine(\`✅ 网页已在 Canvas 渲染\`);
                }
              } catch (err) {
                result = \`Error fetching or parsing webpage: \${err.message}\`;
                addLine(\`❌ 抓取失败: \${err.message}\`);
              }
            } else if (tc.function.name === "calculate") {`;

content = content.replace(
    '            if (tc.function.name === "calculate") {',
    surferExec
);

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Surfer added.');
