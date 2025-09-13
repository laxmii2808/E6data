const terminalOutput = document.getElementById('terminal-output');
const commandInput = document.getElementById('command-input');
const commandHistory = [];
let historyIndex = -1;

commandInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && commandInput.value.trim() !== '') {
        const command = commandInput.value.trim();
        commandHistory.unshift(command);
        historyIndex = -1;
        logCommand(command);
        await executeCommand(command);
        commandInput.value = '';
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            commandInput.value = commandHistory[historyIndex];
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            commandInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = -1;
            commandInput.value = '';
        }
    }
});

function logToTerminal(message, type = 'log') {
    const line = document.createElement('div');
    line.innerHTML = message;
    line.classList.add(`${type}-log`);
    terminalOutput.appendChild(line);
}

function logCommand(command) { logToTerminal(`> ${command}`, 'command'); }

async function executeCommand(command) {
    try {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command }),
        });
        const data = await response.json();
        if (!response.ok) {
            logToTerminal(data.error || 'An unknown error occurred.', 'error');
        } else {
            const formattedResult = JSON.stringify(data.result, null, 2);
            logToTerminal(`<pre>${formattedResult}</pre>`, 'result');
        }
    } catch (err) {
        logToTerminal('Failed to connect to the server.', 'error');
    }
}
document.getElementById('terminal').addEventListener('click', () => { commandInput.focus(); });