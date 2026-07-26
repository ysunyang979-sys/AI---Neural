const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// Insert tool definitions
const cronTools = `        {
          type: "function",
          function: {
            name: "schedule_automation",
            description: "Schedule a task to be executed automatically by the AI after a specific delay (in minutes).",
            parameters: {
              type: "object",
              properties: {
                taskPrompt: { type: "string", description: "The exact prompt/instruction the AI should execute when the timer triggers. e.g. 'Search for latest AI news and summarize'." },
                delayMinutes: { type: "number", description: "How many minutes to wait before executing the task." }
              },
              required: ["taskPrompt", "delayMinutes"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "cancel_automation",
            description: "Cancel a previously scheduled automation task by its ID.",
            parameters: {
              type: "object",
              properties: {
                taskId: { type: "string", description: "The ID of the task to cancel." }
              },
              required: ["taskId"],
            },
          },
        },
`;

content = content.replace(
    '        {\n          type: "function",\n          function: {\n            name: "calculate",',
    cronTools + '        {\n          type: "function",\n          function: {\n            name: "calculate",'
);

// Insert execution logic
const cronExec = `            if (tc.function.name === "schedule_automation") {
              const taskPrompt = args.taskPrompt;
              const delay = args.delayMinutes || 1;
              const taskId = 'task_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
              
              if (!window.autoTasks) window.autoTasks = [];
              const executeTime = Date.now() + delay * 60 * 1000;
              
              const taskObj = {
                id: taskId,
                prompt: taskPrompt,
                executeTime: executeTime,
                timer: setTimeout(() => {
                  window.autoTasks = window.autoTasks.filter(t => t.id !== taskId);
                  // Render active tasks if canvas is open
                  if (window.renderAutoTasks) window.renderAutoTasks();
                  
                  // Trigger execution
                  const msgInput = document.getElementById("message-input");
                  const sendBtn = document.getElementById("send-btn");
                  if (msgInput && sendBtn) {
                    const originalVal = msgInput.value;
                    msgInput.value = \`[Auto-Trigger System]: Time has arrived for scheduled task: \${taskPrompt}\`;
                    sendBtn.click();
                    // Optional: restore original input if there was any
                    setTimeout(() => { msgInput.value = originalVal; }, 500);
                  }
                }, delay * 60 * 1000)
              };
              
              window.autoTasks.push(taskObj);
              
              const canvasPane = document.getElementById("canvas-pane");
              const canvasContent = document.getElementById("canvas-content");
              
              window.renderAutoTasks = () => {
                if (!canvasPane || !canvasContent) return;
                let html = \`<div style="padding: 20px; font-family: monospace;">
                  <h3 style="color: #ed8936;">⏰ 自动化任务中心 (Automation Hub)</h3>
                  <p style="color: #a0aec0;">运行在浏览器后台的 Agentic 任务。您可以随时关闭窗口，但在触发前需保持页面打开。</p>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; color: #e2e8f0;">
                    <tr style="border-bottom: 1px solid #4a5568;">
                      <th style="padding: 10px;">ID</th>
                      <th style="padding: 10px;">任务指令</th>
                      <th style="padding: 10px;">执行时间</th>
                      <th style="padding: 10px;">操作</th>
                    </tr>\`;
                
                if (window.autoTasks.length === 0) {
                  html += \`<tr><td colspan="4" style="padding: 20px; text-align: center; color: #718096;">暂无运行中的任务</td></tr>\`;
                } else {
                  window.autoTasks.forEach(t => {
                    const date = new Date(t.executeTime).toLocaleTimeString();
                    html += \`<tr style="border-bottom: 1px dashed #2d3748;">
                      <td style="padding: 10px; color: #ecc94b;">\${t.id.substring(0, 8)}</td>
                      <td style="padding: 10px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${t.prompt}</td>
                      <td style="padding: 10px;">\${date}</td>
                      <td style="padding: 10px;">
                        <button onclick="window.cancelAutoTask('\${t.id}')" style="background: #e53e3e; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">取消</button>
                      </td>
                    </tr>\`;
                  });
                }
                
                html += \`</table></div>\`;
                canvasContent.innerHTML = html;
              };
              
              window.cancelAutoTask = (id) => {
                if (!window.autoTasks) return;
                const taskIndex = window.autoTasks.findIndex(t => t.id === id);
                if (taskIndex !== -1) {
                  clearTimeout(window.autoTasks[taskIndex].timer);
                  window.autoTasks.splice(taskIndex, 1);
                  if (window.renderAutoTasks) window.renderAutoTasks();
                  addLine(\`🛑 已取消任务: \${id}\`);
                }
              };
              
              if (canvasPane) canvasPane.classList.add("active");
              window.renderAutoTasks();
              
              result = \`Automation task scheduled successfully. ID: \${taskId}, executing in \${delay} minutes.\`;
              addLine(\`✅ 任务已安排在 \${delay} 分钟后执行\`);
            } else if (tc.function.name === "cancel_automation") {
              const taskId = args.taskId;
              if (window.cancelAutoTask) {
                window.cancelAutoTask(taskId);
                result = \`Automation task \${taskId} cancelled successfully.\`;
              } else {
                result = \`Error: Task \${taskId} not found or no tasks running.\`;
              }
            } else if (tc.function.name === "calculate") {`;

content = content.replace(
    '            if (tc.function.name === "calculate") {',
    cronExec
);

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('Cron added.');
