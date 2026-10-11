import { useState } from 'react';
import { TradeRecord } from '../types/market';
import { Download, Search, Filter, BookOpen } from 'lucide-react';

interface TradingJournalProps {
  records: TradeRecord[];
}

export function TradingJournal({ records }: TradingJournalProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((rec) => {
    if (filterType !== 'ALL' && rec.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        rec.symbol.toLowerCase().includes(q) ||
        rec.reason.toLowerCase().includes(q) ||
        (rec.notes && rec.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalRealizedTrades = records.filter((r) => r.type === 'SELL');
  const totalRealizedPnL = totalRealizedTrades.reduce((acc, r) => acc + (r.realizedPnL || 0), 0);

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID', 'Week', 'Day', 'Time', 'Symbol', 'Type', 'Price (INR)', 'Quantity', 'Total Value (INR)', 'Realized PnL (INR)', 'Reason'];
    const rows = records.map((r) => [
      r.id,
      r.week,
      r.day,
      `"${r.timeString.replace(/"/g, '""')}"`,
      r.symbol,
      r.type,
      r.price.toFixed(2),
      r.quantity,
      r.totalValue.toFixed(2),
      r.realizedPnL !== undefined ? r.realizedPnL.toFixed(2) : '0',
      `"${r.reason.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade_journal_sim_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">Trading Journal & Execution Log</h3>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-400 font-mono">{records.length} executions</span>
          </div>
          <p className="text-xs text-neutral-400">Automated audit ledger recording all market entries, exits & stop triggers</p>
        </div>

        {/* Realized Summary & Export */}
        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-xs">
            <span className="text-[10px] text-neutral-400 uppercase block">Cumulative Realized P&L</span>
            <span className={`font-semibold ${totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalRealizedPnL >= 0 ? '+' : ''}₹{totalRealizedPnL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={exportCSV}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-neutral-800/80 text-xs">
        {/* Type filter buttons */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-md border border-neutral-800">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filterType === 'ALL' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilterType('BUY')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filterType === 'BUY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            Buy Only
          </button>
          <button
            onClick={() => setFilterType('SELL')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filterType === 'SELL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            Sell Only
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search symbol or trade thesis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-1.5 pl-8 pr-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-700"
          />
        </div>
      </div>

      {/* Journal Table */}
      {records.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 text-xs font-mono">
          <BookOpen className="mx-auto mb-2 text-neutral-400" size={24} />
          <p>No trades executed yet.</p>
          <p className="text-neutral-400 text-[11px] mt-1">Every market buy, profit booking, or stop-loss trigger will be cataloged here automatically.</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-8 text-center text-neutral-400 text-xs font-mono">
          No records match the current filter.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Total Value</th>
                <th className="py-2.5 px-3 text-right">Net P&L</th>
                <th className="py-2.5 px-3">Trade Rationale / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredRecords.map((r) => {
                const isBuy = r.type === 'BUY';
                const hasPnL = r.realizedPnL !== undefined;
                const isProfit = (r.realizedPnL || 0) >= 0;

                return (
                  <tr key={r.id} className="hover:bg-neutral-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                      <div>{r.timeString}</div>
                      <div className="text-[10px] text-neutral-400">Week {r.week} · Day {r.day}</div>
                    </td>

                    {/* Symbol */}
                    <td className="py-2.5 px-3 font-bold text-neutral-100">
                      {r.symbol}
                    </td>

                    {/* Order Type */}
                    <td className="py-2.5 px-3">
                      <span className={`font-semibold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.type}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 text-right text-neutral-200">
                      ₹{r.price.toFixed(2)}
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-3 text-right text-neutral-300">
                      {r.quantity}
                    </td>

                    {/* Value */}
                    <td className="py-2.5 px-3 text-right text-neutral-200">
                      ₹{r.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* Net P&L */}
                    <td className="py-2.5 px-3 text-right">
                      {hasPnL ? (
                        <div>
                          <span className={`font-semibold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}₹{r.realizedPnL!.toFixed(2)}
                          </span>
                          {r.pnlPercent !== undefined && (
                            <span className={`block text-[10px] ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                              ({isProfit ? '+' : ''}{r.pnlPercent.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Reason Log */}
                    <td className="py-2.5 px-3 text-neutral-300 font-sans text-xs">
                      <span className={`font-medium ${r.reason.includes('Stop-Loss') ? 'text-rose-400' : r.reason.includes('Take-Profit') ? 'text-purple-400' : 'text-neutral-200'}`}>
                        {r.reason}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
