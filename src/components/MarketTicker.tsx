import { NewsItem, Stock } from '../types/market';
import { Newspaper, ChevronRight, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketTickerProps {
  currentDay: number;
  currentWeek: number;
  maxDays: number;
  stocks: Stock[];
  activeNews: NewsItem | null;
  onAdvanceDay: () => void;
  onAdvanceMultiDays: (days: number) => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  onEndSimulation: () => void;
}

export function MarketTicker({
  currentDay,
  currentWeek,
  maxDays,
  stocks,
  activeNews,
  onAdvanceDay,
  onAdvanceMultiDays,
  autoPlay,
  onToggleAutoPlay,
  onEndSimulation,
}: MarketTickerProps) {
  // Aggregate simulated indices based on underlying weighted stocks
  const avgStockPctChange =
    stocks.reduce((acc, s) => acc + ((s.price - s.previousClose) / s.previousClose) * 100, 0) /
    stocks.length;

  const niftyPrice = 24850 * (1 + (avgStockPctChange / 100) * 0.7);
  const sensexPrice = 81400 * (1 + (avgStockPctChange / 100) * 0.7);

  const isNiftyUp = avgStockPctChange >= 0;

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-xs">
      {/* Top Strip: Benchmark Indices & Simulation Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Market Benchmark Tickers */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-semibold">NIFTY 50</span>
            <span className="text-neutral-100 font-bold">{niftyPrice.toFixed(1)}</span>
            <span className={`flex items-center text-[11px] ${isNiftyUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNiftyUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isNiftyUp ? '+' : ''}{(avgStockPctChange * 0.7).toFixed(2)}%
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-neutral-800 pl-4">
            <span className="text-neutral-400 font-semibold">SENSEX</span>
            <span className="text-neutral-100 font-bold">{sensexPrice.toFixed(0)}</span>
            <span className={`flex items-center text-[11px] ${isNiftyUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNiftyUp ? '+' : ''}{(avgStockPctChange * 0.68).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Simulation Clock & Stepping Controls */}
        <div className="flex items-center gap-3">
          {/* Day / Week indicator */}
          <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-md border border-neutral-800 font-mono text-xs">
            <Clock size={12} className="text-neutral-400" />
            <span className="text-neutral-300 font-medium">
              Week {currentWeek} <span className="text-neutral-500">·</span> Day {currentDay} of {maxDays}
            </span>
          </div>

          {/* Stepping Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onAdvanceDay}
              disabled={currentDay >= maxDays}
              className="py-1 px-2.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-700 text-neutral-100 text-xs font-medium transition-colors"
              title="Advance market by 1 day"
            >
              +1 Day
            </button>
            <button
              onClick={() => onAdvanceMultiDays(5)}
              disabled={currentDay >= maxDays}
              className="hidden sm:block py-1 px-2 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
              title="Advance market by 1 trading week"
            >
              +1 Wk
            </button>
            <button
              onClick={onToggleAutoPlay}
              disabled={currentDay >= maxDays}
              className={`py-1 px-2.5 rounded text-xs font-medium transition-colors ${
                autoPlay
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300'
              }`}
            >
              {autoPlay ? 'Pause' : 'Auto'}
            </button>
            <button
              onClick={onEndSimulation}
              className="py-1 px-3 rounded bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs transition-colors shadow-sm ml-1"
            >
              End 8-Week Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Breaking News Feed Strip (if any active news) */}
      {activeNews && (
        <div className="bg-neutral-950 border-t border-neutral-800/80 px-4 py-1.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <div className="flex items-center gap-1 text-amber-400 font-semibold shrink-0">
              <Newspaper size={12} />
              <span>MARKET DISPATCH:</span>
            </div>
            <span className="text-neutral-300 truncate">{activeNews.headline}</span>
          </div>
          {activeNews.impactSymbol && (
            <span className="text-neutral-400 font-mono text-[10px] shrink-0 ml-2">
              Catalyst: {activeNews.impactSymbol}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
