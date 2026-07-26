const fs = require('fs');
let code = fs.readFileSync('D:/AI/uuu/app.js', 'utf8');

// Fix the get_weather / get_market_data mix-up
const badBlock = } else if (tc.function.name === "get_weather") {
              addLine(\??? 获取天气: \\);
              const res = await fetch(
                \https://wttr.in/\?format=j1\,
              );
              if (res.ok) {
                const data = await res.json();
                result = JSON.stringify(data);
                addLine(\? 获取价格成功\);
              } else {
                throw new Error(\CoinGecko API returned \\);
              };

const goodBlock = } else if (tc.function.name === "get_weather") {
              addLine(\??? 获取天气: \\);
              const res = await fetch(
                \https://wttr.in/\?format=j1\,
              );
              if (res.ok) {
                const data = await res.json();
                result = JSON.stringify({
                  current_condition: data.current_condition[0],
                  weather: data.weather,
                });
                addLine(\? 获取天气成功\);
              } else {
                throw new Error(\Weather API returned \\);
              }
            } else if (tc.function.name === "get_market_data") {
              addLine(\?? 获取价格: \\);
              const res = await fetch(
                \https://api.coingecko.com/api/v3/simple/price?ids=\&vs_currencies=usd\,
              );
              if (res.ok) {
                const data = await res.json();
                result = JSON.stringify(data);
                addLine(\? 获取价格成功\);
              } else {
                throw new Error(\CoinGecko API returned \\);
              };

code = code.replace(badBlock, goodBlock);

// Fix the missing tools and generate_qr_code block
const badBlock2 = } else {
                throw new Error(\IP-API returned \\);
              }
            result = \Error: \\;
            addLine(\? 工具调用失败: \\);
          };

const goodBlock2 = } else {
                throw new Error(\IP-API returned \\);
              }
            } else if (tc.function.name === "generate_qr_code") {
              addLine(\??? 生成二维码: \...\);
              const qrUrl = \https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=\\;
              initialReply += \<br><br><img src="\" style="max-width:250px; border-radius:8px; cursor:pointer;" onclick="window.open(this.src, '_blank')" alt="QR Code" /><br><br>\;
              result = \QR Code generated successfully.\;
              addLine(\? 二维码生成完毕\);
            } else if (tc.function.name === "manage_memory") {
              addLine(\?? 记忆管理: \ -> \\);
              if (args.action === "save") {
                localStorage.setItem("ai_memory_" + args.key, args.value);
                result = \Successfully saved memory for key: \\;
              } else {
                const val = localStorage.getItem("ai_memory_" + args.key);
                result = val ? \Memory retrieved: \\ : \No memory found for key: \\;
              }
              addLine(\? 记忆已同步\);
            } else if (tc.function.name === "control_ui") {
              addLine(\?? 控制界面: \\);
              if (args.action === "toggle_theme") {
                const themeBtn = document.getElementById("theme-toggle-btn");
                if (themeBtn) themeBtn.click();
                result = "Theme toggled successfully.";
              } else {
                result = \UI action \ not supported.\;
              }
            } else if (tc.function.name === "create_downloadable_file") {
              addLine(\?? 生成文件: \\);
              const blob = new Blob([args.content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = args.filename;
              a.click();
              URL.revokeObjectURL(url);
              result = \File \ generated and download triggered.\;
              if (args.open_canvas) {
                const drawToggle = document.getElementById('chat-draw-toggle');
                if (drawToggle && !drawToggle.classList.contains('active')) {
                  drawToggle.click();
                  result += " Canvas panel also opened.";
                }
              }
              addLine(\? 文件已生成\);
            } else if (tc.function.name === "launch_ar_view") {
              addLine(\?? 尝试启动 WebXR AR: \\);
              if (navigator.xr && navigator.xr.isSessionSupported) {
                try {
                  const supported = await navigator.xr.isSessionSupported('immersive-ar');
                  if (supported) {
                    result = "AR Session supported. (Awaiting user interaction to fully launch due to browser security).";
                    initialReply += \<br><button onclick="navigator.xr.requestSession('immersive-ar').then(s=>alert('AR Started')).catch(e=>alert('AR Failed: '+e))">Launch AR for \</button><br>\;
                  } else {
                    result = "Error: AR is not supported on this device/browser.";
                  }
                } catch(e) {
                  result = \Error checking XR support: \\;
                }
              } else {
                result = "Error: WebXR API not available (requires HTTPS and compatible hardware).";
              }
            } else if (tc.function.name === "start_p2p_transfer") {
              addLine(\?? 初始化 P2P 传输: \\);
              try {
                const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
                const channel = pc.createDataChannel('fileTransfer');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                const sdpStr = btoa(JSON.stringify(pc.localDescription)).substring(0, 40) + "...";
                initialReply += \<br><b>P2P Offer Code (Give this to peer):</b><br><code>\</code><br>\;
                result = \WebRTC offer generated for \. Connection is waiting for answer.\;
                addLine(\? P2P 准备就绪\);
              } catch(e) {
                result = \Error starting P2P: \\;
              }
            } else if (tc.function.name === "control_other_tabs") {
              addLine(\?? 跨标签页控制: \ -> \\);
              try {
                if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
                  chrome.runtime.sendMessage("hypothetical_ext_id", { action: args.action, target: args.url_pattern }, (response) => {
                    if (chrome.runtime.lastError) {
                      console.warn(chrome.runtime.lastError);
                    }
                  });
                  result = \Command sent to extension.\;
                } else {
                  window.postMessage({ type: "EXT_CONTROL", action: args.action, target: args.url_pattern }, "*");
                  result = \Dispatched window.postMessage. Note: This requires a companion Chrome Extension to actually function.\;
                }
              } catch (e) {
                result = \Error controlling tabs: \\;
              }
            } else if (tc.function.name === "canvas_image_processor") {
              addLine(\??? 图像滤镜处理: \\);
              try {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
                  img.src = args.image_url;
                });
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                  if (args.filter_type === 'grayscale') {
                    const avg = (data[i] + data[i+1] + data[i+2]) / 3;
                    data[i] = data[i+1] = data[i+2] = avg;
                  } else if (args.filter_type === 'invert') {
                    data[i] = 255 - data[i];
                    data[i+1] = 255 - data[i+1];
                    data[i+2] = 255 - data[i+2];
                  } else if (args.filter_type === 'sepia') {
                    const r = data[i], g = data[i+1], b = data[i+2];
                    data[i] = Math.min(255, (r * .393) + (g *.769) + (b * .189));
                    data[i+1] = Math.min(255, (r * .349) + (g *.686) + (b * .168));
                    data[i+2] = Math.min(255, (r * .272) + (g *.534) + (b * .131));
                  }
                }
                ctx.putImageData(imageData, 0, 0);
                const newUrl = canvas.toDataURL('image/jpeg', 0.8);
                initialReply += \<br><img src="\" style="max-width:300px; border-radius:8px;" alt="Filtered Image"/><br>\;
                result = \Image processed with \ filter successfully and displayed.\;
                addLine(\? 图像处理完毕\);
              } catch(e) {
                result = \Error processing image: \\;
                addLine(\? 图像处理失败\);
              }
            } else {
              result = \Error: Tool \\\\\\\ is not recognized or not implemented.\;
              addLine(\?? 未知工具: \\);
            }
          } catch (err) {
            result = \Error: \\;
            addLine(\? 工具调用失败: \\);
          };

code = code.replace(badBlock2, goodBlock2);
fs.writeFileSync('D:/AI/uuu/app.js', code);
console.log('Fixed app.js successfully.');
