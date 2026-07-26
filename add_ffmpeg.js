const fs = require('fs');
let content = fs.readFileSync('d:/uuu/app.js', 'utf8');

// Insert tool definition
const toolDef = `        {
          type: "function",
          function: {
            name: "edit_media",
            description: "Process video/audio files directly in the browser using FFmpeg.wasm. Provide ffmpeg commands like '-i input.mp4 -ss 0 -t 10 output.mp4'. Note: The user will upload their file, and we will automatically map 'input.mp4' in your command to their uploaded file.",
            parameters: {
              type: "object",
              properties: {
                command: { type: "string", description: "The ffmpeg command arguments (excluding 'ffmpeg'). e.g. '-i input.mp4 -vf scale=320:-1 output.mp4'" },
                outputFilename: { type: "string", description: "The expected output filename. e.g. 'output.mp4'" }
              },
              required: ["command", "outputFilename"],
            },
          },
        },
`;

content = content.replace(
    '        {\n          type: "function",\n          function: {\n            name: "calculate",',
    toolDef + '        {\n          type: "function",\n          function: {\n            name: "calculate",'
);

// Insert tool execution
const toolExec = `            if (tc.function.name === "edit_media") {
              const cmd = args.command || "";
              const outName = args.outputFilename || "output.mp4";
              addLine(\`🎬 启动 FFmpeg 媒体编辑...\`);
              
              const canvasPane = document.getElementById("canvas-pane");
              const canvasContent = document.getElementById("canvas-content");
              if (canvasPane && canvasContent) {
                canvasPane.classList.add("active");
                canvasContent.innerHTML = \`
                  <div style="padding: 20px; font-family: monospace;">
                    <h3 style="color: #63b3ed;">🎬 FFmpeg.wasm 本地剪辑引擎</h3>
                    <p>执行指令: <code>ffmpeg \${cmd}</code></p>
                    <div id="ffmpeg-dropzone" style="border: 2px dashed #4a5568; padding: 40px; text-align: center; border-radius: 8px; margin: 20px 0; cursor: pointer; color: #a0aec0; transition: all 0.3s;">
                      点击或拖拽上传需要处理的媒体文件<br><br><span style="font-size: 12px; color: #718096;">(所有处理均在你本地进行，不会上传服务器)</span>
                    </div>
                    <div id="ffmpeg-log" style="background: #1a202c; color: #a0aec0; padding: 10px; border-radius: 4px; height: 180px; overflow-y: auto; font-size: 12px; white-space: pre-wrap; display: none;"></div>
                    <div id="ffmpeg-result" style="margin-top: 15px;"></div>
                  </div>
                \`;
                
                const script = document.createElement('script');
                script.innerHTML = \`
                  (async () => {
                    const dropzone = document.getElementById('ffmpeg-dropzone');
                    const logEl = document.getElementById('ffmpeg-log');
                    const resultEl = document.getElementById('ffmpeg-result');
                    
                    const log = (msg) => {
                      logEl.style.display = 'block';
                      logEl.innerHTML += msg + '<br>';
                      logEl.scrollTop = logEl.scrollHeight;
                    };
                    
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    
                    dropzone.onclick = () => fileInput.click();
                    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = '#63b3ed'; dropzone.style.background = 'rgba(99, 179, 237, 0.1)'; };
                    dropzone.ondragleave = (e) => { e.preventDefault(); dropzone.style.borderColor = '#4a5568'; dropzone.style.background = 'transparent'; };
                    dropzone.ondrop = (e) => {
                      e.preventDefault();
                      dropzone.style.borderColor = '#4a5568';
                      dropzone.style.background = 'transparent';
                      if (e.dataTransfer.files.length > 0) {
                        processFile(e.dataTransfer.files[0]);
                      }
                    };
                    
                    fileInput.onchange = (e) => {
                      if (e.target.files.length > 0) {
                        processFile(e.target.files[0]);
                      }
                    };
                    
                    async function processFile(file) {
                      dropzone.style.display = 'none';
                      log('⏳ Loading FFmpeg.wasm core libraries (might take a few seconds)...');
                      if (!window.FFmpeg) {
                        await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
                        await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
                      }
                      
                      const { FFmpeg } = window.FFmpeg;
                      const { fetchFile } = window.FFmpegUtil;
                      
                      const ffmpeg = new FFmpeg();
                      ffmpeg.on('log', ({ message }) => { log(message); });
                      
                      try {
                        log('🚀 Initializing ffmpeg worker...');
                        await ffmpeg.load({
                          coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
                          wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
                        });
                        
                        log('📂 Reading input file into memory: ' + file.name);
                        await ffmpeg.writeFile(file.name, await fetchFile(file));
                        
                        log('⚙️ Executing command...');
                        let rawCmd = "\${cmd.replace(/"/g, '\\"')}";
                        // Try to replace generic input name with actual file name
                        let cmdArr = rawCmd.split(' ');
                        const inputIndex = cmdArr.indexOf('-i');
                        if (inputIndex !== -1 && inputIndex + 1 < cmdArr.length) {
                          cmdArr[inputIndex + 1] = file.name;
                        }
                        
                        await ffmpeg.exec(cmdArr);
                        
                        log('💾 Generating output file: \${outName}');
                        const data = await ffmpeg.readFile('\${outName}');
                        
                        const url = URL.createObjectURL(new Blob([data.buffer]));
                        resultEl.innerHTML = \\\`
                          <h4 style="color: #48bb78; margin-bottom: 10px;">✅ 处理完成!</h4>
                          <a href="\\\${url}" download="\${outName}" style="display: inline-block; padding: 10px 20px; background: #3182ce; color: white; text-decoration: none; border-radius: 6px; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">💾 下载 \${outName}</a>
                          <br><br>
                          <video src="\\\${url}" controls style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></video>
                        \\\`;
                      } catch (err) {
                        log('<span style="color: #fc8181;">❌ 错误: ' + err.message + '</span>');
                      }
                    }
                  })();
                \`;
                document.body.appendChild(script);
              }
              
              result = \`Media edit task initiated. Waiting for user to upload file and process via FFmpeg in the browser UI. Target output: \${outName}\`;
              addLine(\`✅ FFmpeg 任务已发送至 Canvas\`);
            } else if (tc.function.name === "calculate") {`;

content = content.replace(
    '            if (tc.function.name === "calculate") {',
    toolExec
);

fs.writeFileSync('d:/uuu/app.js', content, 'utf8');
console.log('FFmpeg added.');
