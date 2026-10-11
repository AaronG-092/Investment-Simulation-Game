import { useState } from 'react';
import { Stock, Position } from '../types/market';
import { Search, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';

interface WatchlistProps {
  stocks: Stock[];
  selectedSymbol: string;
  positions: Position[];
  onSelectStock: (symbol: string) => void;
}

export function Watchlist({ stocks, selectedSymbol, positions, onSelectStock }: WatchlistProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  const positionMap = new Map(positions.map((p) => [p.symbol, p]));

  const sectors = ['ALL', 'Banking', 'IT Services', 'Automobile', 'Conglomerate', 'FMCG'];

  const filteredStocks = stocks.filter((stock) => {
    if (sectorFilter !== 'ALL' && stock.sector !== sectorFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">Indian Equities Watchlist</h3>
        <span className="text-xs font-mono text-neutral-400">{filteredStocks.length} Stocks</span>
      </div>

      {/* Search Input */}
      <div className="mt-3 relative">
        <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-1.5 pl-8 pr-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-700"
        />
      </div>

      {/* Sector filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto py-2 text-xs no-scrollbar">
        {sectors.map((sec) => (
          <button
            key={sec}
            onClick={() => setSectorFilter(sec)}
            className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
              sectorFilter === sec
                ? 'bg-neutral-800 text-neutral-100 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mt-1 pr-1">
        {filteredStocks.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const pos = positionMap.get(stock.symbol);
          const priceChange = stock.price - stock.previousClose;
          const pctChange = (priceChange / stock.previousClose) * 100;
          const isPositive = priceChange >= 0;

          return (
            <button
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-neutral-800/80 border-neutral-600 shadow-sm'
                  : 'bg-neutral-950/60 border-neutral-800/70 hover:bg-neutral-800/40 hover:border-neutral-700'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-neutral-100">{stock.symbol}</span>
                  {pos && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-400 font-mono">
                      <Briefcase size={10} />
                      <span>{pos.quantity}</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 truncate max-w-[130px] font-sans">
                  {stock.name}
                </div>
              </div>

              <div className="text-right font-mono shrink-0">
                <div className="text-xs font-semibold text-neutral-100">
                  ₹{stock.price.toFixed(2)}
                </div>
                <div
                  className={`text-[10px] flex items-center justify-end gap-0.5 ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span>{isPositive ? '+' : ''}{pctChange.toFixed(2)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
