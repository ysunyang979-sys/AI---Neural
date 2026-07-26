import { WebContainer } from 'https://unpkg.com/@webcontainer/api@1.1.14/dist/index.js';

let webcontainerInstance;
let terminal;
let currentServerUrl = '';

function convertToTree(filesArray) {
    const tree = {};
    for (const file of filesArray) {
        const parts = file.path.split('/');
        let currentLevel = tree;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!currentLevel[part]) {
                currentLevel[part] = { directory: {} };
            }
            currentLevel = currentLevel[part].directory;
        }
        const fileName = parts[parts.length - 1];
        currentLevel[fileName] = {
            file: {
                contents: file.content
            }
        };
    }
    return tree;
}

async function init() {
    // 1. Setup Terminal
    terminal = new Terminal({
        convertEol: true,
        theme: { background: '#1e293b' },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace'
    });
    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(document.getElementById('terminal-container'));
    fitAddon.fit();
    window.addEventListener('resize', () => fitAddon.fit());

    // 2. Boot WebContainer
    try {
        webcontainerInstance = await WebContainer.boot();
    } catch (e) {
        document.getElementById('loading-text').innerText = "Boot failed: " + e.message;
        return;
    }

    document.getElementById('loading-overlay').style.opacity = '0';
    setTimeout(() => document.getElementById('loading-overlay').style.display = 'none', 500);

    // 3. Mount Files
    const filesJson = localStorage.getItem('wc_init_files');
    if (filesJson) {
        try {
            const files = JSON.parse(filesJson);
            const tree = convertToTree(files);
            await webcontainerInstance.mount(tree);
            terminal.write('\x1b[32mSuccessfully mounted files from chat.\x1b[0m\r\n');
        } catch (e) {
            terminal.write('\x1b[31mError mounting files: ' + e.message + '\x1b[0m\r\n');
        }
    } else {
        terminal.write('\x1b[33mNo initial files provided. Starting empty environment.\x1b[0m\r\n');
    }

    // 4. Setup Server Listener
    webcontainerInstance.on('server-ready', (port, url) => {
        currentServerUrl = url;
        document.getElementById('url-bar').innerText = url;
        document.getElementById('preview-iframe').src = url;
        terminal.write(`\x1b[32m\r\nServer running at ${url}\x1b[0m\r\n`);
    });

    // 5. Start Shell
    const shellProcess = await webcontainerInstance.spawn('jsh', {
        terminal: {
            cols: terminal.cols,
            rows: terminal.rows,
        },
    });

    shellProcess.output.pipeTo(
        new WritableStream({
            write(data) {
                terminal.write(data);
            },
        })
    );

    const input = shellProcess.input.getWriter();
    terminal.onData((data) => {
        input.write(data);
    });

    const initCmd = localStorage.getItem('wc_init_command');
    if (initCmd) {
        input.write(initCmd + '\r');
    }

    // UI Listeners
    document.getElementById('reload-btn').addEventListener('click', () => {
        if (currentServerUrl) {
            document.getElementById('preview-iframe').src = currentServerUrl;
        }
    });
    document.getElementById('open-external-btn').addEventListener('click', () => {
        if (currentServerUrl) {
            window.open(currentServerUrl, '_blank');
        }
    });
}

init();
