// Generates a complete standalone single-file HTML code with integrated CSS & JS

export function generateStandaloneHTML(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dalal Street Alpha - Investment Simulation Game</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(23, 23, 23, 0.5); }
    ::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.5); border-radius: 3px; }
  </style>
</head>
<body class="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased">
  <!-- Top Bar -->
  <header class="border-b border-neutral-800 bg-neutral-900 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-lg font-bold tracking-tight text-neutral-100">Dalal Street Alpha</span>
        <span class="text-neutral-500">/</span>
        <span class="text-xs text-neutral-400 font-mono">Investment Simulator</span>
      </div>
      <div class="flex items-center gap-3">
        <button id="endSimBtn" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors">
          End 8-Week Simulation
        </button>
      </div>
    </div>
  </header>

  <!-- KPI Ribbon -->
  <div class="bg-neutral-900 border-b border-neutral-800 py-3">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
      <div>
        <span class="text-neutral-400 text-[10px] uppercase block">Total Net Worth</span>
        <span id="kpiNetWorth" class="text-base font-bold text-neutral-100">₹5,00,000</span>
      </div>
      <div>
        <span class="text-neutral-400 text-[10px] uppercase block">Liquid Cash</span>
        <span id="kpiCash" class="text-base font-bold text-neutral-200">₹5,00,000</span>
      </div>
      <div>
        <span class="text-neutral-400 text-[10px] uppercase block">Invested Capital</span>
        <span id="kpiInvested" class="text-base font-bold text-neutral-300">₹0</span>
      </div>
      <div>
        <span class="text-neutral-400 text-[10px] uppercase block">Unrealized P&L</span>
        <span id="kpiUnrealized" class="text-base font-bold text-neutral-400">₹0</span>
      </div>
      <div>
        <span class="text-neutral-400 text-[10px] uppercase block">Realized P&L</span>
        <span id="kpiRealized" class="text-base font-bold text-neutral-400">₹0</span>
      </div>
      <div>
        <span class="text-neutral-400 text-[10px] uppercase block">ROI %</span>
        <span id="kpiROI" class="text-base font-bold text-emerald-400">0.00%</span>
      </div>
    </div>
  </div>

  <!-- Stepper Strip -->
  <div class="bg-neutral-900/60 border-b border-neutral-800 px-4 py-2">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-4 font-mono">
        <span class="text-neutral-300">NIFTY 50: <b class="text-neutral-100">24,850.2</b></span>
        <span class="text-neutral-300 hidden sm:inline">SENSEX: <b class="text-neutral-100">81,420.0</b></span>
      </div>
      <div class="flex items-center gap-2">
        <div id="simClock" class="bg-neutral-950 px-3 py-1 rounded border border-neutral-800 font-mono text-neutral-300">
          Week 1 · Day 1 of 40
        </div>
        <button id="stepDayBtn" class="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 text-neutral-100 text-xs">+1 Day</button>
        <button id="stepWeekBtn" class="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 text-neutral-300 text-xs">+1 Wk</button>
      </div>
    </div>
  </div>

  <!-- Workspace -->
  <main class="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Watchlist -->
      <div class="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 class="text-xs font-semibold text-neutral-100 uppercase tracking-wider">Indian Watchlist</h3>
          <span class="text-xs font-mono text-neutral-400">6 Equities</span>
        </div>
        <div id="watchlistContainer" class="mt-3 space-y-2 flex-1"></div>
      </div>

      <!-- Chart -->
      <div class="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col min-h-[420px]">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <span id="chartSymbol" class="text-xl font-bold text-neutral-100">RELIANCE</span>
            <span id="chartSector" class="text-xs text-neutral-400 ml-2">Conglomerate</span>
          </div>
          <div class="text-right font-mono">
            <div id="chartPrice" class="text-2xl font-bold text-neutral-100">₹2,950.00</div>
            <div id="chartChange" class="text-xs text-emerald-400">+0.00 (0.00%)</div>
          </div>
        </div>
        <div class="flex-1 w-full mt-3 relative min-h-[300px]">
          <canvas id="stockChartCanvas"></canvas>
        </div>
      </div>

      <!-- Order Panel -->
      <div class="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col">
        <div class="pb-3 border-b border-neutral-800">
          <h3 class="text-xs font-semibold text-neutral-100 uppercase tracking-wider">Trading Terminal</h3>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-3 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
          <button id="tabBuy" class="py-1.5 rounded text-xs font-semibold bg-emerald-600 text-white">BUY</button>
          <button id="tabSell" class="py-1.5 rounded text-xs font-semibold text-neutral-400 hover:text-white">SELL</button>
        </div>

        <form id="orderForm" class="mt-4 space-y-3 flex-1 flex flex-col justify-between">
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-neutral-300 mb-1">Quantity (Shares)</label>
              <input id="inputQty" type="number" min="1" value="10" class="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs font-mono text-white">
            </div>
            <div>
              <label class="block text-xs text-rose-400 mb-1">Stop-Loss Price (₹)</label>
              <input id="inputSL" type="number" step="0.1" placeholder="Optional SL" class="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs font-mono text-white">
            </div>
            <div>
              <label class="block text-xs text-purple-400 mb-1">Take-Profit Target (₹)</label>
              <input id="inputTP" type="number" step="0.1" placeholder="Optional TP" class="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs font-mono text-white">
            </div>
            <div>
              <label class="block text-xs text-neutral-300 mb-1">Trade Reason / Thesis</label>
              <input id="inputReason" type="text" value="Technical Setup" class="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white">
            </div>
          </div>

          <div class="space-y-2">
            <div class="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-xs font-mono">
              <div class="flex justify-between text-neutral-400"><span>Estimated Value</span><span id="orderValueText" class="text-white">₹0</span></div>
            </div>
            <button id="submitOrderBtn" type="submit" class="w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase">
              Execute Order
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Portfolio Holdings & Journal -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Active Positions -->
      <div class="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <h3 class="text-xs font-semibold text-neutral-100 uppercase tracking-wider pb-3 border-b border-neutral-800">Active Portfolio Holdings</h3>
        <div class="overflow-x-auto mt-2">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="text-neutral-400 border-b border-neutral-800">
                <th class="py-2">Stock</th>
                <th class="py-2 text-right">Qty</th>
                <th class="py-2 text-right">Avg</th>
                <th class="py-2 text-right">LTP</th>
                <th class="py-2 text-right">P&L</th>
                <th class="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody id="holdingsTableBody" class="divide-y divide-neutral-800"></tbody>
          </table>
        </div>
      </div>

      <!-- Journal -->
      <div class="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <h3 class="text-xs font-semibold text-neutral-100 uppercase tracking-wider pb-3 border-b border-neutral-800">Trade Execution Journal</h3>
        <div class="overflow-x-auto max-h-[300px] overflow-y-auto mt-2">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="text-neutral-400 border-b border-neutral-800">
                <th class="py-2">Day</th>
                <th class="py-2">Symbol</th>
                <th class="py-2">Type</th>
                <th class="py-2 text-right">Price</th>
                <th class="py-2 text-right">Qty</th>
                <th class="py-2 text-right">Net P&L</th>
                <th class="py-2">Reason</th>
              </tr>
            </thead>
            <tbody id="journalTableBody" class="divide-y divide-neutral-800"></tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <!-- Final Report Modal -->
  <div id="reportModal" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 hidden">
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl p-6 space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
        <h2 class="text-lg font-bold text-neutral-100">8-Week Simulation Performance Report</h2>
        <button id="closeReportBtn" class="text-neutral-400 hover:text-white">&times;</button>
      </div>

      <div class="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex justify-between items-center">
        <div>
          <span class="text-xs text-neutral-400 uppercase font-mono block">Final Net Worth</span>
          <span id="reportFinalValue" class="text-2xl font-bold font-mono text-neutral-100">₹0</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-neutral-400 uppercase font-mono block">ROI %</span>
          <span id="reportROI" class="text-2xl font-bold font-mono text-emerald-400">0.00%</span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div class="p-3 bg-neutral-950 border border-neutral-800 rounded">
          <span class="text-neutral-400 block text-[10px]">Win Rate</span>
          <span id="reportWinRate" class="text-base font-bold text-white block mt-1">0%</span>
        </div>
        <div class="p-3 bg-neutral-950 border border-neutral-800 rounded">
          <span class="text-neutral-400 block text-[10px]">Total Trades</span>
          <span id="reportTotalTrades" class="text-base font-bold text-white block mt-1">0</span>
        </div>
        <div class="p-3 bg-neutral-950 border border-neutral-800 rounded">
          <span class="text-neutral-400 block text-[10px]">Realized P&L</span>
          <span id="reportRealizedPnL" class="text-base font-bold text-white block mt-1">₹0</span>
        </div>
        <div class="p-3 bg-neutral-950 border border-neutral-800 rounded">
          <span class="text-neutral-400 block text-[10px]">Holding Value</span>
          <span id="reportHoldingsVal" class="text-base font-bold text-white block mt-1">₹0</span>
        </div>
      </div>

      <div class="p-3 bg-neutral-950 border border-neutral-800 rounded text-xs">
        <span class="text-neutral-400 block text-[10px] uppercase font-mono mb-1">Sector Diversification</span>
        <div id="reportSectorBars" class="space-y-1.5"></div>
      </div>

      <div class="p-3 bg-neutral-950 border border-neutral-800 rounded text-xs">
        <span class="text-neutral-400 block text-[10px] uppercase font-mono mb-1">Trader Archetype</span>
        <h4 id="reportArchetype" class="font-bold text-white">Prudent Portfolio Manager</h4>
        <p id="reportCritique" class="text-neutral-300 mt-1 leading-relaxed"></p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button id="modalRestartBtn" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded text-xs">
          Restart Simulation
        </button>
      </div>
    </div>
  </div>

  <script>
    // State
    const STARTING_CAPITAL = 500000;
    let cash = STARTING_CAPITAL;
    let currentDay = 1;
    let selectedSymbol = 'RELIANCE';
    let currentOrderType = 'BUY';
    let positions = [];
    let journal = [];
    let chartInstance = null;

    const STOCKS = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Conglomerate', price: 2950, prev: 2930, vol: 0.016, history: [] },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', price: 1560, prev: 1550, vol: 0.014, history: [] },
      { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT Services', price: 1520, prev: 1508, vol: 0.021, history: [] },
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', price: 980, prev: 970, vol: 0.025, history: [] },
      { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT Services', price: 3940, prev: 3915, vol: 0.013, history: [] },
      { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', price: 435, prev: 433, vol: 0.011, history: [] }
    ];

    // Seed 15 days history
    STOCKS.forEach(stock => {
      let p = stock.price * 0.95;
      for (let i = 1; i <= 15; i++) {
        p = Math.round(p * (1 + (Math.random() - 0.48) * stock.vol * 2) * 100) / 100;
        stock.history.push({ day: i, price: p });
      }
      stock.price = p;
    });

    function getStock(sym) { return STOCKS.find(s => s.symbol === sym) || STOCKS[0]; }
    function getPos(sym) { return positions.find(p => p.symbol === sym); }

    function updateKPIs() {
      const holdingsVal = positions.reduce((acc, p) => acc + (getStock(p.symbol).price * p.qty), 0);
      const totalCost = positions.reduce((acc, p) => acc + p.cost, 0);
      const totalNetWorth = cash + holdingsVal;
      const unrealized = holdingsVal - totalCost;
      const realized = journal.filter(j => j.type === 'SELL' && j.pnl !== undefined).reduce((a, b) => a + b.pnl, 0);
      const roi = ((totalNetWorth - STARTING_CAPITAL) / STARTING_CAPITAL) * 100;

      document.getElementById('kpiNetWorth').textContent = '₹' + Math.round(totalNetWorth).toLocaleString('en-IN');
      document.getElementById('kpiCash').textContent = '₹' + Math.round(cash).toLocaleString('en-IN');
      document.getElementById('kpiInvested').textContent = '₹' + Math.round(holdingsVal).toLocaleString('en-IN');
      document.getElementById('kpiUnrealized').textContent = (unrealized >= 0 ? '+' : '') + '₹' + Math.round(unrealized).toLocaleString('en-IN');
      document.getElementById('kpiRealized').textContent = (realized >= 0 ? '+' : '') + '₹' + Math.round(realized).toLocaleString('en-IN');
      document.getElementById('kpiROI').textContent = (roi >= 0 ? '+' : '') + roi.toFixed(2) + '%';
      document.getElementById('kpiROI').className = 'text-base font-bold ' + (roi >= 0 ? 'text-emerald-400' : 'text-rose-400');
    }

    function renderWatchlist() {
      const container = document.getElementById('watchlistContainer');
      container.innerHTML = '';
      STOCKS.forEach(s => {
        const chg = s.price - s.prev;
        const pct = (chg / s.prev) * 100;
        const pos = getPos(s.symbol);
        const div = document.createElement('div');
        div.className = \`p-2.5 rounded-lg border cursor-pointer flex justify-between items-center transition \${s.symbol === selectedSymbol ? 'bg-neutral-800 border-neutral-600' : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'}\`;
        div.onclick = () => { selectedSymbol = s.symbol; renderAll(); };
        div.innerHTML = \`
          <div>
            <div class="flex items-center gap-1.5 font-bold text-xs text-white">
              \${s.symbol} \${pos ? '<span class="text-[10px] text-sky-400 font-mono">(' + pos.qty + ')</span>' : ''}
            </div>
            <div class="text-[10px] text-neutral-400">\${s.sector}</div>
          </div>
          <div class="text-right font-mono">
            <div class="text-xs font-semibold text-white">₹\${s.price.toFixed(2)}</div>
            <div class="text-[10px] \${chg >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
              \${chg >= 0 ? '+' : ''}\${pct.toFixed(2)}%
            </div>
          </div>
        \`;
        container.appendChild(div);
      });
    }

    function renderChart() {
      const stock = getStock(selectedSymbol);
      document.getElementById('chartSymbol').textContent = stock.symbol;
      document.getElementById('chartSector').textContent = stock.sector;
      document.getElementById('chartPrice').textContent = '₹' + stock.price.toFixed(2);
      const chg = stock.price - stock.prev;
      const pct = (chg / stock.prev) * 100;
      const elChg = document.getElementById('chartChange');
      elChg.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + ' (' + (chg >= 0 ? '+' : '') + pct.toFixed(2) + '%)';
      elChg.className = 'text-xs ' + (chg >= 0 ? 'text-emerald-400' : 'text-rose-400');

      const ctx = document.getElementById('stockChartCanvas').getContext('2d');
      if (chartInstance) chartInstance.destroy();

      const labels = stock.history.map(h => 'D' + h.day);
      const data = stock.history.map(h => h.price);

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: stock.symbol,
            data,
            borderColor: chg >= 0 ? '#10b981' : '#ef4444',
            backgroundColor: chg >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            fill: true,
            tension: 0.2,
            borderWidth: 2,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(39,39,42,0.4)' }, ticks: { color: '#71717a' } },
            y: { position: 'right', grid: { color: 'rgba(39,39,42,0.4)' }, ticks: { color: '#a1a1aa' } }
          }
        }
      });
    }

    function renderHoldings() {
      const tbody = document.getElementById('holdingsTableBody');
      tbody.innerHTML = '';
      if (positions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-neutral-400">No active positions.</td></tr>';
        return;
      }
      positions.forEach(p => {
        const s = getStock(p.symbol);
        const curVal = s.price * p.qty;
        const pnl = curVal - p.cost;
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-neutral-800/40';
        tr.innerHTML = \`
          <td class="py-2 font-bold text-white cursor-pointer" onclick="selectedSymbol='\${p.symbol}'; renderAll();">\${p.symbol}</td>
          <td class="py-2 text-right">\${p.qty}</td>
          <td class="py-2 text-right text-neutral-400">₹\${p.avg.toFixed(1)}</td>
          <td class="py-2 text-right">₹\${s.price.toFixed(1)}</td>
          <td class="py-2 text-right \${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
            \${pnl >= 0 ? '+' : ''}₹\${pnl.toFixed(0)}
          </td>
          <td class="py-2 text-right">
            <button onclick="exitPosition('\${p.symbol}')" class="px-2 py-0.5 rounded bg-neutral-800 hover:bg-rose-950 text-neutral-300 hover:text-rose-300 text-[10px]">Exit</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function renderJournal() {
      const tbody = document.getElementById('journalTableBody');
      tbody.innerHTML = '';
      if (journal.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-neutral-400">No trades executed yet.</td></tr>';
        return;
      }
      journal.forEach(j => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td class="py-1.5 text-neutral-400">D\${j.day}</td>
          <td class="py-1.5 font-bold">\${j.symbol}</td>
          <td class="py-1.5 \${j.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}">\${j.type}</td>
          <td class="py-1.5 text-right">₹\${j.price.toFixed(1)}</td>
          <td class="py-1.5 text-right">\${j.qty}</td>
          <td class="py-1.5 text-right \${j.pnl !== undefined ? (j.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-neutral-400'}">
            \${j.pnl !== undefined ? (j.pnl >= 0 ? '+' : '') + '₹' + j.pnl.toFixed(0) : '—'}
          </td>
          <td class="py-1.5 text-neutral-300 truncate max-w-[120px]">\${j.reason}</td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function updateOrderValue() {
      const stock = getStock(selectedSymbol);
      const qty = parseInt(document.getElementById('inputQty').value) || 0;
      document.getElementById('orderValueText').textContent = '₹' + (qty * stock.price).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }

    function executeOrder(e) {
      if (e) e.preventDefault();
      const stock = getStock(selectedSymbol);
      const qty = parseInt(document.getElementById('inputQty').value) || 0;
      const sl = parseFloat(document.getElementById('inputSL').value) || null;
      const tp = parseFloat(document.getElementById('inputTP').value) || null;
      const reason = document.getElementById('inputReason').value || 'Market Order';

      if (qty <= 0) return alert('Quantity must be greater than 0');
      const totalVal = qty * stock.price;

      if (currentOrderType === 'BUY') {
        if (totalVal > cash) return alert('Insufficient cash.');
        cash -= totalVal;
        const existing = getPos(stock.symbol);
        if (existing) {
          existing.qty += qty;
          existing.cost += totalVal;
          existing.avg = existing.cost / existing.qty;
          if (sl) existing.sl = sl;
          if (tp) existing.tp = tp;
        } else {
          positions.push({ symbol: stock.symbol, qty, avg: stock.price, cost: totalVal, sl, tp });
        }
        journal.unshift({ day: currentDay, symbol: stock.symbol, type: 'BUY', price: stock.price, qty, val: totalVal, reason });
      } else {
        const existing = getPos(stock.symbol);
        if (!existing || existing.qty < qty) return alert('Insufficient shares to sell.');
        const costBasis = existing.avg * qty;
        const pnl = totalVal - costBasis;
        cash += totalVal;
        existing.qty -= qty;
        existing.cost -= costBasis;
        if (existing.qty <= 0) {
          positions = positions.filter(p => p.symbol !== stock.symbol);
        }
        journal.unshift({ day: currentDay, symbol: stock.symbol, type: 'SELL', price: stock.price, qty, val: totalVal, pnl, reason });
      }

      renderAll();
    }

    window.exitPosition = function(sym) {
      const pos = getPos(sym);
      if (!pos) return;
      const stock = getStock(sym);
      const totalVal = pos.qty * stock.price;
      const pnl = totalVal - pos.cost;
      cash += totalVal;
      journal.unshift({ day: currentDay, symbol: sym, type: 'SELL', price: stock.price, qty: pos.qty, val: totalVal, pnl, reason: 'Position Liquidate' });
      positions = positions.filter(p => p.symbol !== sym);
      renderAll();
    };

    function stepDay() {
      if (currentDay >= 40) return openReport();
      currentDay++;
      const week = Math.min(8, Math.floor((currentDay - 1) / 5) + 1);
      document.getElementById('simClock').textContent = \`Week \${week} · Day \${currentDay} of 40\`;

      STOCKS.forEach(stock => {
        stock.prev = stock.price;
        const change = (Math.random() - 0.49) * stock.vol * 2;
        stock.price = Math.round(Math.max(1, stock.price * (1 + change)) * 100) / 100;
        stock.history.push({ day: currentDay + 15, price: stock.price });

        // Auto Stop-Loss and Take-Profit
        const pos = getPos(stock.symbol);
        if (pos) {
          if (pos.sl && stock.price <= pos.sl) {
            exitPositionWithReason(stock.symbol, 'Stop-Loss Hit');
          } else if (pos.tp && stock.price >= pos.tp) {
            exitPositionWithReason(stock.symbol, 'Take-Profit Hit');
          }
        }
      });

      renderAll();
      if (currentDay >= 40) setTimeout(openReport, 400);
    }

    function exitPositionWithReason(sym, reason) {
      const pos = getPos(sym);
      if (!pos) return;
      const stock = getStock(sym);
      const totalVal = pos.qty * stock.price;
      const pnl = totalVal - pos.cost;
      cash += totalVal;
      journal.unshift({ day: currentDay, symbol: sym, type: 'SELL', price: stock.price, qty: pos.qty, val: totalVal, pnl, reason });
      positions = positions.filter(p => p.symbol !== sym);
    }

    function openReport() {
      const holdingsVal = positions.reduce((acc, p) => acc + (getStock(p.symbol).price * p.qty), 0);
      const netWorth = cash + holdingsVal;
      const roi = ((netWorth - STARTING_CAPITAL) / STARTING_CAPITAL) * 100;
      const sells = journal.filter(j => j.type === 'SELL');
      const wins = sells.filter(s => s.pnl > 0).length;
      const winRate = sells.length > 0 ? (wins / sells.length) * 100 : 0;
      const realized = sells.reduce((a, b) => a + (b.pnl || 0), 0);

      document.getElementById('reportFinalValue').textContent = '₹' + Math.round(netWorth).toLocaleString('en-IN');
      document.getElementById('reportROI').textContent = (roi >= 0 ? '+' : '') + roi.toFixed(2) + '%';
      document.getElementById('reportWinRate').textContent = winRate.toFixed(1) + '%';
      document.getElementById('reportTotalTrades').textContent = journal.length;
      document.getElementById('reportRealizedPnL').textContent = '₹' + Math.round(realized).toLocaleString('en-IN');
      document.getElementById('reportHoldingsVal').textContent = '₹' + Math.round(holdingsVal).toLocaleString('en-IN');

      const sectorMap = {};
      positions.forEach(p => {
        const s = getStock(p.symbol);
        sectorMap[s.sector] = (sectorMap[s.sector] || 0) + (s.price * p.qty);
      });
      const barContainer = document.getElementById('reportSectorBars');
      barContainer.innerHTML = '';
      if (Object.keys(sectorMap).length === 0) {
        barContainer.innerHTML = '<span class="text-neutral-400">100% Cash reserves held.</span>';
      } else {
        for (const [sec, val] of Object.entries(sectorMap)) {
          const pct = ((val / holdingsVal) * 100).toFixed(1);
          barContainer.innerHTML += \`
            <div class="flex justify-between font-mono text-[11px]"><span>\${sec}</span><span>₹\${Math.round(val).toLocaleString('en-IN')} (\${pct}%)</span></div>
            <div class="h-1 bg-neutral-800 rounded"><div class="h-1 bg-emerald-500 rounded" style="width:\${pct}%"></div></div>
          \`;
        }
      }

      if (roi > 10) {
        document.getElementById('reportArchetype').textContent = 'Alpha Market Wizard';
        document.getElementById('reportCritique').textContent = 'Exceptional trade timing and sector selection. You significantly outperformed the benchmark!';
      } else if (roi >= 0) {
        document.getElementById('reportArchetype').textContent = 'Prudent Portfolio Manager';
        document.getElementById('reportCritique').textContent = 'Sound capital preservation and measured trade execution.';
      } else {
        document.getElementById('reportArchetype').textContent = 'Aggressive Growth Speculator';
        document.getElementById('reportCritique').textContent = 'High volatility drawdowns. Practice tighter stop-loss management to protect capital.';
      }

      if (roi > 0 && typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 60 });
      }

      document.getElementById('reportModal').classList.remove('hidden');
    }

    function renderAll() {
      updateKPIs();
      renderWatchlist();
      renderChart();
      renderHoldings();
      renderJournal();
      updateOrderValue();
      const btn = document.getElementById('submitOrderBtn');
      if (btn) {
        btn.textContent = (currentOrderType === 'BUY' ? 'Buy ' : 'Sell ') + selectedSymbol;
      }
    }

    // Events
    document.getElementById('tabBuy').onclick = () => {
      currentOrderType = 'BUY';
      document.getElementById('tabBuy').className = 'py-1.5 rounded text-xs font-semibold bg-emerald-600 text-white';
      document.getElementById('tabSell').className = 'py-1.5 rounded text-xs font-semibold text-neutral-400 hover:text-white';
      document.getElementById('submitOrderBtn').className = 'w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase';
      document.getElementById('submitOrderBtn').textContent = 'Buy ' + selectedSymbol;
    };
    document.getElementById('tabSell').onclick = () => {
      currentOrderType = 'SELL';
      document.getElementById('tabSell').className = 'py-1.5 rounded text-xs font-semibold bg-rose-600 text-white';
      document.getElementById('tabBuy').className = 'py-1.5 rounded text-xs font-semibold text-neutral-400 hover:text-white';
      document.getElementById('submitOrderBtn').className = 'w-full py-2.5 rounded bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold text-xs uppercase';
      document.getElementById('submitOrderBtn').textContent = 'Sell ' + selectedSymbol;
    };
    document.getElementById('inputQty').oninput = updateOrderValue;
    document.getElementById('orderForm').onsubmit = executeOrder;
    document.getElementById('stepDayBtn').onclick = stepDay;
    document.getElementById('stepWeekBtn').onclick = () => {
      for (let i = 0; i < 5; i++) {
        if (currentDay >= 40) break;
        stepDay();
      }
    };
    document.getElementById('endSimBtn').onclick = openReport;
    document.getElementById('closeReportBtn').onclick = () => document.getElementById('reportModal').classList.add('hidden');
    document.getElementById('modalRestartBtn').onclick = () => {
      cash = STARTING_CAPITAL;
      currentDay = 1;
      positions = [];
      journal = [];
      document.getElementById('reportModal').classList.add('hidden');
      document.getElementById('simClock').textContent = 'Week 1 · Day 1 of 40';
      renderAll();
    };

    // Initial render
    renderAll();
  </script>
</body>
</html>`;
}
