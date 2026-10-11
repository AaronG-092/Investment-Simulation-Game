import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Stock, Position } from '../types/market';
import { TrendingUp, TrendingDown, Eye, Activity } from 'lucide-react';

Chart.register(...registerables);

interface StockChartProps {
  stock: Stock;
  position?: Position;
}

export function StockChart({ stock, position }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState<'10D' | '20D' | 'ALL'>('ALL');
  const [showSMA, setShowSMA] = useState<boolean>(true);

  const priceChange = stock.price - stock.previousClose;
  const pctChange = ((priceChange / stock.previousClose) * 100);
  const isPositive = priceChange >= 0;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filter history based on timeframe
    let filteredHistory = [...stock.history];
    if (timeframe === '10D') {
      filteredHistory = filteredHistory.slice(-10);
    } else if (timeframe === '20D') {
      filteredHistory = filteredHistory.slice(-20);
    }

    const labels = filteredHistory.map(h => `Day ${h.day}`);
    const prices = filteredHistory.map(h => h.price);
    const volumes = filteredHistory.map(h => h.volume);

    // Compute simple moving average (SMA 5)
    const smaValues = filteredHistory.map((_, idx, arr) => {
      const windowSize = 5;
      if (idx < windowSize - 1) return null;
      const slice = arr.slice(idx - windowSize + 1, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.price, 0);
      return Math.round((sum / windowSize) * 100) / 100;
    });

    // Create subtle gradient for area chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    if (isPositive) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.00)');
    }

    const datasets: any[] = [
      {
        label: `${stock.symbol} Price (₹)`,
        data: prices,
        borderColor: isPositive ? '#10b981' : '#ef4444',
        borderWidth: 2,
        pointRadius: filteredHistory.length > 30 ? 2 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: isPositive ? '#10b981' : '#ef4444',
        pointBorderColor: '#09090b',
        pointBorderWidth: 1.5,
        backgroundColor: gradient,
        fill: true,
        tension: 0.2,
        yAxisID: 'y',
      },
    ];

    if (showSMA) {
      datasets.push({
        label: '5-Day SMA',
        data: smaValues,
        borderColor: '#f59e0b',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.2,
        yAxisID: 'y',
      });
    }

    // Horizontal guidelines if position exists
    if (position) {
      if (position.averagePrice) {
        datasets.push({
          label: `Avg Buy (₹${position.averagePrice.toFixed(1)})`,
          data: new Array(filteredHistory.length).fill(position.averagePrice),
          borderColor: '#38bdf8',
          borderWidth: 1.5,
          borderDash: [5, 3],
          pointRadius: 0,
          fill: false,
          yAxisID: 'y',
        });
      }
      if (position.stopLossPrice) {
        datasets.push({
          label: `Stop-Loss (₹${position.stopLossPrice.toFixed(1)})`,
          data: new Array(filteredHistory.length).fill(position.stopLossPrice),
          borderColor: '#f43f5e',
          borderWidth: 1.5,
          borderDash: [2, 3],
          pointRadius: 0,
          fill: false,
          yAxisID: 'y',
        });
      }
      if (position.takeProfitPrice) {
        datasets.push({
          label: `Take-Profit (₹${position.takeProfitPrice.toFixed(1)})`,
          data: new Array(filteredHistory.length).fill(position.takeProfitPrice),
          borderColor: '#a855f7',
          borderWidth: 1.5,
          borderDash: [2, 3],
          pointRadius: 0,
          fill: false,
          yAxisID: 'y',
        });
      }
    }

    // Volume dataset
    datasets.push({
      label: 'Volume',
      data: volumes,
      type: 'bar',
      backgroundColor: 'rgba(113, 113, 122, 0.25)',
      hoverBackgroundColor: 'rgba(161, 161, 170, 0.45)',
      yAxisID: 'yVolume',
      barPercentage: 0.5,
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 350,
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#18181b',
            titleColor: '#f4f4f5',
            bodyColor: '#e4e4e7',
            borderColor: '#27272a',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label(tooltipItem) {
                const label = tooltipItem.dataset.label || '';
                const val = tooltipItem.parsed.y;
                if (val === null || val === undefined) return ` ${label}`;
                if (label.includes('Volume')) {
                  return ` ${label}: ${(val / 1000).toFixed(0)}k shares`;
                }
                return ` ${label}: ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(39, 39, 42, 0.5)',
            },
            ticks: {
              color: '#71717a',
              font: {
                family: 'JetBrains Mono',
                size: 11,
              },
              maxRotation: 0,
            },
          },
          y: {
            position: 'right',
            grid: {
              color: 'rgba(39, 39, 42, 0.5)',
            },
            ticks: {
              color: '#a1a1aa',
              font: {
                family: 'JetBrains Mono',
                size: 11,
              },
              callback(value) {
                return `₹${value}`;
              },
            },
          },
          yVolume: {
            position: 'left',
            display: false,
            min: 0,
            max: Math.max(...(volumes.length ? volumes : [1000])) * 4.5, // keep volume bars subtle at bottom 20%
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stock, timeframe, showSMA, position]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-neutral-100">{stock.symbol}</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400 font-medium">{stock.sector}</span>
            </div>
            <p className="text-xs text-neutral-400 truncate max-w-sm">{stock.name}</p>
          </div>
        </div>

        {/* Live Price and stats */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-neutral-100 tracking-tight">
              ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-mono font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{pctChange.toFixed(2)}%)</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono border-l border-neutral-800 pl-4 text-neutral-400">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Day High</div>
              <div className="text-neutral-200">₹{stock.highPrice.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Day Low</div>
              <div className="text-neutral-200">₹{stock.lowPrice.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">P/E</div>
              <div className="text-neutral-200">{stock.peRatio}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Toolbar */}
      <div className="flex items-center justify-between py-2.5 text-xs">
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-md border border-neutral-800">
          <button
            onClick={() => setTimeframe('10D')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${timeframe === '10D' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            10 Days
          </button>
          <button
            onClick={() => setTimeframe('20D')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${timeframe === '20D' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            20 Days
          </button>
          <button
            onClick={() => setTimeframe('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${timeframe === 'ALL' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            Full Cycle
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${showSMA ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'}`}
          >
            <Activity size={12} />
            <span>5-Day SMA</span>
          </button>

          {position && (
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="text-sky-400 flex items-center gap-1">
                <span className="w-2 h-0.5 bg-sky-400 inline-block"></span> Avg: ₹{position.averagePrice.toFixed(1)}
              </span>
              {position.stopLossPrice && (
                <span className="text-rose-400 flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-rose-400 inline-block"></span> SL: ₹{position.stopLossPrice.toFixed(1)}
                </span>
              )}
              {position.takeProfitPrice && (
                <span className="text-purple-400 flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-purple-400 inline-block"></span> TP: ₹{position.takeProfitPrice.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[290px] relative">
        <canvas ref={canvasRef} />
      </div>

      {/* Bottom Sub-info */}
      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
        <div>Prev Close: ₹{stock.previousClose.toFixed(2)} · Open: ₹{stock.openPrice.toFixed(2)}</div>
        <div className="flex items-center gap-1 text-neutral-400">
          <Eye size={11} />
          <span>Interactive hover enabled · Powered by Chart.js</span>
        </div>
      </div>
    </div>
  );
}
