document.addEventListener('DOMContentLoaded', () => {
    // App's state
    let currentConnectionId = null;
    let connections = [];
    let analyticsChart = null;

    // DOM Element references
    const connectionListEl = document.getElementById('connection-list');
    const workspaceEl = document.getElementById('workspace');
    const workspacePlaceholderEl = document.getElementById('workspace-placeholder');
    const workspaceTitleEl = document.getElementById('workspace-title');
    const tabsEl = document.getElementById('workspace-tabs');
    const tabContentEl = document.getElementById('tab-content');
    const closeConnectionBtn = document.getElementById('close-connection-btn');

    // API fetcher functions
    const api = {
        getConnections: () => fetch('/api/v1/users/me/connections').then(res => res.json()),
        getAnalytics: (connId) => fetch(`/api/v1/users/me/analytics?connId=${connId}`).then(res => res.json()),
        getQueryHistory: (connId) => fetch(`/api/v1/users/me/queries?connId=${connId}`).then(res => res.json()),
        executeQuery: (connId, queryData) => fetch(`/api/v1/users/me/connections/${connId}/query`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(queryData)
        }).then(res => res.json()),
        deleteConnection: (connId) => fetch(`/api/v1/users/me/connections/${connId}`, { method: 'DELETE' }).then(res => res.json())
    };

    // --- UI Rendering Functions ---
    const renderConnectionList = () => {
        connectionListEl.innerHTML = connections.map(c => `
            <div class="connection-item" data-conn-id="${c.connectionId}">
                <div class="flex-grow"><span class="font-semibold">${c.connectionName}</span><span class="text-xs text-gray-400 block">${c.databaseType}</span></div>
            </div>`).join('');
    };

    const renderAnalytics = (data) => {
        const analyticsEl = document.getElementById('analytics-content');
        analyticsEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="kpi-card"><h4>Total Queries</h4><p>${data.summary.totalQueries}</p></div>
                <div class="kpi-card"><h4>Avg. Execution (ms)</h4><p>${data.summary.avgExecutionTime}</p></div>
                <div class="kpi-card"><h4>Success Rate</h4><p>${data.summary.successRate}%</p></div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg"><canvas id="analytics-chart"></canvas></div>`;
        renderChart(data.dailyAnalytics);
    };
    
    const renderChart = (dailyData) => {
        const ctx = document.getElementById('analytics-chart').getContext('2d');
        if(analyticsChart) analyticsChart.destroy();
        analyticsChart = new Chart(ctx, { type: 'bar', /* ... Chart.js options from previous answer ... */ });
    };

    const renderQueryExecutor = () => {
        const queryEl = document.getElementById('query-content');
        queryEl.innerHTML = `
            <form id="query-form"><textarea id="query-input" class="query-textarea" placeholder='{ "query": "{\\"status\\":\\"active\\"}", "queryType": "find", "collection": "users" }'></textarea><button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Execute Query</button></form>
            <div class="bg-gray-800 mt-4 p-4 rounded-lg min-h-[200px] border border-gray-700"><pre id="query-result" class="text-sm"><code class="language-json"></code></pre></div>`;
    };

    const renderQueryHistory = (data) => {
        const historyEl = document.getElementById('history-content');
        historyEl.innerHTML = `<div class="bg-gray-800 p-4 rounded-lg border border-gray-700"><h3 class="font-bold mb-2">Recent Queries</h3>` +
            data.queries.map(q => `<div class="p-2 border-b border-gray-700 font-mono text-xs">${q.query} <span class="text-green-400 float-right">${q.status}</span></div>`).join('') +
            `</div>`;
    };

    // --- Event Handlers & Core Logic ---
    const handleConnectionSelect = (connId) => {
        currentConnectionId = connId;
        const selectedConn = connections.find(c => c.connectionId === connId);
        document.querySelectorAll('.connection-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-conn-id="${connId}"]`).classList.add('active');
        workspacePlaceholderEl.classList.add('hidden');
        workspaceEl.classList.remove('hidden');
        workspaceTitleEl.innerText = selectedConn.connectionName;
        const activeTab = document.querySelector('.tab-item.active-tab').dataset.tab;
        handleTabSwitch(activeTab);
    };

    const handleTabSwitch = async (tabName) => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active-tab'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active-tab');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        const activePane = document.getElementById(`${tabName}-content`);
        activePane.innerHTML = `<p class="text-gray-400">Loading ${tabName}...</p>`;
        activePane.classList.remove('hidden');

        if (tabName === 'analytics') {
            const res = await api.getAnalytics(currentConnectionId);
            renderAnalytics(res.data);
        } else if (tabName === 'query') {
            renderQueryExecutor();
        } else if (tabName === 'history') {
            const res = await api.getQueryHistory(currentConnectionId);
            renderQueryHistory(res.data);
        }
    };

    // --- App Initializer ---
    const init = async () => {
        const res = await api.getConnections();
        connections = res.data;
        renderConnectionList();

        connectionListEl.addEventListener('click', (e) => {
            const connItem = e.target.closest('.connection-item');
            if (connItem) handleConnectionSelect(connItem.dataset.connId);
        });

        tabsEl.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.matches('.tab-item')) handleTabSwitch(e.target.dataset.tab);
        });

        closeConnectionBtn.addEventListener('click', () => {
            if (currentConnectionId && confirm('Are you sure you want to close this connection?')) {
                api.deleteConnection(currentConnectionId).then(() => {
                    workspaceEl.classList.add('hidden');
                    workspacePlaceholderEl.classList.remove('hidden');
                    init(); // Refresh the connection list
                });
            }
        });
        
        tabContentEl.addEventListener('submit', async (e) => {
            if(e.target.id === 'query-form') {
                e.preventDefault();
                const input = document.getElementById('query-input');
                const resultEl = document.querySelector('#query-result code');
                try {
                    const queryData = JSON.parse(input.value);
                    resultEl.textContent = 'Executing...';
                    const res = await api.executeQuery(currentConnectionId, queryData);
                    resultEl.textContent = JSON.stringify(res, null, 2);
                    Prism.highlightElement(resultEl);
                } catch(err) { resultEl.textContent = `Error: Invalid JSON. ${err.message}`; }
            }
        });
    };

    init();
});