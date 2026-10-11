import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PerformanceMetrics, Stock } from '../types/market';
import { Award, TrendingUp, TrendingDown, PieChart, RefreshCw, X, Shield, BarChart3 } from 'lucide-react';

interface FinalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: PerformanceMetrics;
  onRestartSimulation: () => void;
}

export function FinalReportModal({
  isOpen,
  onClose,
  metrics,
  onRestartSimulation,
}: FinalReportModalProps) {
  useEffect(() => {
    if (isOpen && metrics.roiPercent > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // Safe confetti fallback
      }
    }
  }, [isOpen, metrics.roiPercent]);

  if (!isOpen) return null;

  const isPositiveROI = metrics.roiPercent >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Award className={isPositiveROI ? 'text-amber-400' : 'text-neutral-400'} size={20} />
              <h2 className="text-lg font-bold text-neutral-100">8-Week Simulation Performance Report</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Comprehensive audit of your virtual Dalal Street investment journey</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top Hero KPI Banner */}
          <div className="p-5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">Total Portfolio Value</span>
              <div className="text-3xl font-bold font-mono text-neutral-100 mt-1">
                ₹{metrics.finalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-mono text-neutral-400 mt-1">
                Started with: ₹{metrics.startingCapital.toLocaleString('en-IN')} virtual cash
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">Net Return on Investment</span>
              <div className={`text-3xl font-bold font-mono mt-1 flex items-center justify-end gap-1.5 ${isPositiveROI ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositiveROI ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                <span>{isPositiveROI ? '+' : ''}{metrics.roiPercent.toFixed(2)}%</span>
              </div>
              <div className={`text-xs font-mono font-medium mt-1 ${isPositiveROI ? 'text-emerald-500' : 'text-rose-500'}`}>
                {metrics.totalPnL >= 0 ? '+' : ''}₹{metrics.totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Trader Archetype & Qualitative Critique */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-3">
            <div className="p-2.5 rounded bg-neutral-800 text-neutral-200 shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Assigned Trader Persona</div>
              <h4 className="text-base font-bold text-neutral-100 mt-0.5">{metrics.traderTitle}</h4>
              <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed font-sans">{metrics.critique}</p>
            </div>
          </div>

          {/* Key Trading Metrics Grid */}
          <div>
            <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-wider mb-3">Execution Statistics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <span className="text-[11px] text-neutral-400 block font-mono">Win Rate</span>
                <span className="text-lg font-bold font-mono text-neutral-100 mt-1 block">
                  {metrics.winRatePercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {metrics.winningTrades}W / {metrics.losingTrades}L of {metrics.totalTrades}
                </span>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <span className="text-[11px] text-neutral-400 block font-mono">Profit Factor</span>
                <span className="text-lg font-bold font-mono text-neutral-100 mt-1 block">
                  {metrics.profitFactor > 0 ? metrics.profitFactor.toFixed(2) : 'N/A'}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Gross Gain / Loss</span>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <span className="text-[11px] text-neutral-400 block font-mono">Realized P&L</span>
                <span className={`text-lg font-bold font-mono mt-1 block ${metrics.netRealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metrics.netRealizedProfit >= 0 ? '+' : ''}₹{metrics.netRealizedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Closed positions</span>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <span className="text-[11px] text-neutral-400 block font-mono">Unrealized P&L</span>
                <span className={`text-lg font-bold font-mono mt-1 block ${metrics.unrealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metrics.unrealizedProfit >= 0 ? '+' : ''}₹{metrics.unrealizedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Open holdings</span>
              </div>
            </div>
          </div>

          {/* Sector Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">Sector Capital Allocation</h4>
              <span className="text-[11px] text-neutral-400 font-mono">Holdings Diversification</span>
            </div>

            {metrics.sectorDistribution.length === 0 ? (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-center text-xs text-neutral-400 font-mono">
                100% Capital held in Liquid Virtual Cash (No active equity sectors).
              </div>
            ) : (
              <div className="space-y-2.5 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                {metrics.sectorDistribution.map((sector) => (
                  <div key={sector.sector} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-200">{sector.sector}</span>
                      <span className="text-neutral-400">
                        ₹{sector.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({sector.percent.toFixed(1)}%)
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, sector.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-neutral-100 transition-colors"
          >
            Review Simulation Ledger
          </button>

          <button
            onClick={onRestartSimulation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw size={13} />
            <span>Restart New 8-Week Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
