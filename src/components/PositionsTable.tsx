import { useState } from 'react';
import { Position, Stock } from '../types/market';
import { TrendingUp, TrendingDown, XCircle, ShieldAlert, Target, Check, Edit2, X } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
  stocks: Stock[];
  onExitPosition: (symbol: string, quantity: number, currentPrice: number) => void;
  onUpdateLimits: (symbol: string, stopLoss?: number, takeProfit?: number) => void;
  onSelectStock: (symbol: string) => void;
}

export function PositionsTable({
  positions,
  stocks,
  onExitPosition,
  onUpdateLimits,
  onSelectStock,
}: PositionsTableProps) {
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editSL, setEditSL] = useState<string>('');
  const [editTP, setEditTP] = useState<string>('');

  const stockMap = new Map(stocks.map((s) => [s.symbol, s]));

  const startEdit = (pos: Position) => {
    setEditingSymbol(pos.symbol);
    setEditSL(pos.stopLossPrice ? pos.stopLossPrice.toString() : '');
    setEditTP(pos.takeProfitPrice ? pos.takeProfitPrice.toString() : '');
  };

  const saveEdit = (symbol: string) => {
    const sl = editSL.trim() !== '' ? parseFloat(editSL) : undefined;
    const tp = editTP.trim() !== '' ? parseFloat(editTP) : undefined;
    const validSL = sl !== undefined && !isNaN(sl) && sl > 0 ? sl : undefined;
    const validTP = tp !== undefined && !isNaN(tp) && tp > 0 ? tp : undefined;
    onUpdateLimits(symbol, validSL, validTP);
    setEditingSymbol(null);
  };

  // Calculate totals across open positions
  const totalInvested = positions.reduce((acc, p) => acc + p.totalCost, 0);
  const totalCurrentValue = positions.reduce((acc, p) => {
    const s = stockMap.get(p.symbol);
    return acc + (s ? s.price * p.quantity : p.totalCost);
  }, 0);
  const totalUnrealizedPnL = totalCurrentValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">Active Portfolio Holdings</h3>
          <p className="text-xs text-neutral-400">Open market positions and risk protection levels</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Total Invested</span>
            <span className="text-neutral-200">₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Current Value</span>
            <span className="text-neutral-100 font-semibold">₹{totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Unrealized P&L</span>
            <span className={`font-semibold ${totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnL >= 0 ? '+' : ''}₹{totalUnrealizedPnL.toFixed(2)} ({totalUnrealizedPnL >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {positions.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 text-xs font-mono">
          <p>No active stock positions.</p>
          <p className="text-neutral-400 text-[11px] mt-1">Select an Indian stock from the watchlist and execute a BUY order to build your portfolio.</p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                <th className="py-2.5 px-3">Stock</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Avg Price</th>
                <th className="py-2.5 px-3 text-right">LTP</th>
                <th className="py-2.5 px-3 text-right">Current Value</th>
                <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                <th className="py-2.5 px-3 text-center">Stop-Loss / Target</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {positions.map((pos) => {
                const stock = stockMap.get(pos.symbol);
                const currentPrice = stock ? stock.price : pos.averagePrice;
                const currentValue = currentPrice * pos.quantity;
                const pnl = currentValue - pos.totalCost;
                const pnlPercent = (pnl / pos.totalCost) * 100;
                const isProfitable = pnl >= 0;
                const isEditing = editingSymbol === pos.symbol;

                return (
                  <tr key={pos.symbol} className="hover:bg-neutral-800/40 transition-colors">
                    {/* Stock Symbol */}
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectStock(pos.symbol)}
                        className="text-left group cursor-pointer"
                      >
                        <span className="font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors">
                          {pos.symbol}
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-sans truncate max-w-[120px]">
                          {stock?.sector}
                        </span>
                      </button>
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-3 text-right text-neutral-200">
                      {pos.quantity}
                    </td>

                    {/* Avg Price */}
                    <td className="py-2.5 px-3 text-right text-neutral-300">
                      ₹{pos.averagePrice.toFixed(2)}
                    </td>

                    {/* Current LTP */}
                    <td className="py-2.5 px-3 text-right font-semibold text-neutral-100">
                      ₹{currentPrice.toFixed(2)}
                    </td>

                    {/* Current Value */}
                    <td className="py-2.5 px-3 text-right text-neutral-200">
                      ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    {/* Unrealized P&L */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-semibold flex items-center justify-end gap-1 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isProfitable ? '+' : ''}₹{pnl.toFixed(2)}
                      </span>
                      <span className={`text-[10px] block ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                        ({isProfitable ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </span>
                    </td>

                    {/* Stop-Loss / Take-Profit */}
                    <td className="py-2.5 px-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            placeholder="SL"
                            value={editSL}
                            onChange={(e) => setEditSL(e.target.value)}
                            className="w-16 bg-neutral-950 border border-neutral-700 rounded px-1.5 py-0.5 text-[11px] text-rose-300"
                          />
                          <input
                            type="number"
                            placeholder="TP"
                            value={editTP}
                            onChange={(e) => setEditTP(e.target.value)}
                            className="w-16 bg-neutral-950 border border-neutral-700 rounded px-1.5 py-0.5 text-[11px] text-purple-300"
                          />
                          <button
                            onClick={() => saveEdit(pos.symbol)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            title="Save Limits"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingSymbol(null)}
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                            title="Cancel Edit"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <div className="text-[11px] text-left">
                            <span className="text-rose-400 block">
                              SL: {pos.stopLossPrice ? `₹${pos.stopLossPrice.toFixed(1)}` : 'None'}
                            </span>
                            <span className="text-purple-400 block">
                              TP: {pos.takeProfitPrice ? `₹${pos.takeProfitPrice.toFixed(1)}` : 'None'}
                            </span>
                          </div>
                          <button
                            onClick={() => startEdit(pos)}
                            className="text-neutral-400 hover:text-neutral-200 p-1"
                            title="Edit Stop-Loss / Take-Profit"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onExitPosition(pos.symbol, pos.quantity, currentPrice)}
                        className="py-1 px-2.5 rounded bg-neutral-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 border border-neutral-700 text-neutral-300 text-[11px] font-sans font-medium transition-colors"
                      >
                        Exit All
                      </button>
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
