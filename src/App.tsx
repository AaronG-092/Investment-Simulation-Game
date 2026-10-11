import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Stock, Position, TradeRecord, NewsItem, OrderType, PerformanceMetrics } from './types/market';
import { INITIAL_STOCKS, SIMULATION_NEWS_EVENTS } from './data/stocks';
import { soundFX } from './utils/audio';
import { StockChart } from './components/StockChart';
import { OrderPanel } from './components/OrderPanel';
import { PositionsTable } from './components/PositionsTable';
import { TradingJournal } from './components/TradingJournal';
import { Watchlist } from './components/Watchlist';
import { MarketTicker } from './components/MarketTicker';
import { FinalReportModal } from './components/FinalReportModal';
import { Volume2, VolumeX, RotateCcw, Wallet, TrendingUp, TrendingDown, Layers } from 'lucide-react';

const STARTING_CAPITAL = 500000; // ₹5,00,000 INR
const MAX_DAYS = 40; // 8 weeks * 5 trading days = 40 days

export default function App() {
  const [cash, setCash] = useState<number>(STARTING_CAPITAL);
  const [stocks, setStocks] = useState<Stock[]>(() => INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [positions, setPositions] = useState<Position[]>([]);
  const [journal, setJournal] = useState<TradeRecord[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'holdings' | 'journal'>('holdings');
  const [peakNetWorth, setPeakNetWorth] = useState<number>(STARTING_CAPITAL);
  const [maxDrawdownPercent, setMaxDrawdownPercent] = useState<number>(0);

  const currentWeek = Math.min(8, Math.floor((currentDay - 1) / 5) + 1);

  // Toggle sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
  };

  // Selected stock object
  const activeStock = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  }, [stocks, selectedSymbol]);

  // Selected stock's position if any
  const activePosition = useMemo(() => {
    return positions.find((p) => p.symbol === selectedSymbol);
  }, [positions, selectedSymbol]);

  // Compute portfolio valuation
  const stockMap = useMemo(() => new Map(stocks.map((s) => [s.symbol, s])), [stocks]);

  const totalPositionsValue = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const s = stockMap.get(pos.symbol);
      const price = s ? s.price : pos.averagePrice;
      return acc + price * pos.quantity;
    }, 0);
  }, [positions, stockMap]);

  const totalInvestedCapital = useMemo(() => {
    return positions.reduce((acc, pos) => acc + pos.totalCost, 0);
  }, [positions]);

  const totalPortfolioValue = cash + totalPositionsValue;
  const totalUnrealizedPnL = totalPositionsValue - totalInvestedCapital;

  const totalRealizedPnL = useMemo(() => {
    return journal
      .filter((r) => r.type === 'SELL' && r.realizedPnL !== undefined)
      .reduce((acc, r) => acc + (r.realizedPnL || 0), 0);
  }, [journal]);

  const totalProfitLoss = totalPortfolioValue - STARTING_CAPITAL;
  const overallROIPercent = ((totalProfitLoss) / STARTING_CAPITAL) * 100;

  // Track peak valuation and max drawdown percentage
  useEffect(() => {
    if (totalPortfolioValue > peakNetWorth) {
      setPeakNetWorth(totalPortfolioValue);
    } else if (peakNetWorth > 0) {
      const dd = ((peakNetWorth - totalPortfolioValue) / peakNetWorth) * 100;
      if (dd > maxDrawdownPercent) {
        setMaxDrawdownPercent(dd);
      }
    }
  }, [totalPortfolioValue, peakNetWorth, maxDrawdownPercent]);

  // Handle Order Placement
  const handlePlaceOrder = useCallback(
    ({
      symbol,
      type,
      quantity,
      price,
      stopLossPrice,
      takeProfitPrice,
      reason,
    }: {
      symbol: string;
      type: OrderType;
      quantity: number;
      price: number;
      stopLossPrice?: number;
      takeProfitPrice?: number;
      reason: string;
    }) => {
      const orderTotal = quantity * price;
      const nowTime = `W${currentWeek}·D${currentDay} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

      if (type === 'BUY') {
        if (orderTotal > cash) return;

        setCash((prev) => prev - orderTotal);

        setPositions((prev) => {
          const existing = prev.find((p) => p.symbol === symbol);
          if (existing) {
            const newQty = existing.quantity + quantity;
            const newCost = existing.totalCost + orderTotal;
            const newAvg = newCost / newQty;
            return prev.map((p) =>
              p.symbol === symbol
                ? {
                    ...p,
                    quantity: newQty,
                    totalCost: newCost,
                    averagePrice: newAvg,
                    stopLossPrice: stopLossPrice !== undefined ? stopLossPrice : p.stopLossPrice,
                    takeProfitPrice: takeProfitPrice !== undefined ? takeProfitPrice : p.takeProfitPrice,
                  }
                : p
            );
          } else {
            return [
              ...prev,
              {
                symbol,
                quantity,
                averagePrice: price,
                totalCost: orderTotal,
                stopLossPrice,
                takeProfitPrice,
              },
            ];
          }
        });

        // Add to Journal
        const record: TradeRecord = {
          id: `TR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          day: currentDay,
          week: currentWeek,
          timeString: nowTime,
          symbol,
          type: 'BUY',
          price,
          quantity,
          totalValue: orderTotal,
          reason,
        };
        setJournal((prev) => [record, ...prev]);
      } else {
        // SELL
        const existing = positions.find((p) => p.symbol === symbol);
        if (!existing || existing.quantity < quantity) return;

        const costBasisForSoldShares = existing.averagePrice * quantity;
        const realizedPnL = orderTotal - costBasisForSoldShares;
        const pnlPct = (realizedPnL / costBasisForSoldShares) * 100;

        setCash((prev) => prev + orderTotal);

        setPositions((prev) => {
          return prev
            .map((p) => {
              if (p.symbol === symbol) {
                const remainingQty = p.quantity - quantity;
                if (remainingQty <= 0) return null;
                const remainingCost = p.averagePrice * remainingQty;
                return {
                  ...p,
                  quantity: remainingQty,
                  totalCost: remainingCost,
                };
              }
              return p;
            })
            .filter((p): p is Position => p !== null);
        });

        const record: TradeRecord = {
          id: `TR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          day: currentDay,
          week: currentWeek,
          timeString: nowTime,
          symbol,
          type: 'SELL',
          price,
          quantity,
          totalValue: orderTotal,
          realizedPnL,
          pnlPercent: pnlPct,
          reason,
        };
        setJournal((prev) => [record, ...prev]);
      }
    },
    [cash, currentDay, currentWeek, positions]
  );

  // Exit an entire position directly from holdings
  const handleExitPosition = useCallback(
    (symbol: string, quantity: number, currentPrice: number) => {
      handlePlaceOrder({
        symbol,
        type: 'SELL',
        quantity,
        price: currentPrice,
        reason: 'Manual Position Liquidate',
      });
      soundFX.playSell();
    },
    [handlePlaceOrder]
  );

  // Update stop loss and take profit for a position
  const handleUpdateLimits = useCallback(
    (symbol: string, stopLoss?: number, takeProfit?: number) => {
      setPositions((prev) =>
        prev.map((p) => (p.symbol === symbol ? { ...p, stopLossPrice: stopLoss, takeProfitPrice: takeProfit } : p))
      );
    },
    []
  );

  // Advance simulation by 1 day and handle SL / TP triggers
  const advanceDay = useCallback(() => {
    if (currentDay >= MAX_DAYS) {
      setAutoPlay(false);
      setIsReportOpen(true);
      return;
    }

    const nextDay = currentDay + 1;
    const nextWeek = Math.min(8, Math.floor((nextDay - 1) / 5) + 1);
    soundFX.playDayAdvance();

    // Check if any news event triggers on this day
    const newsForDay = SIMULATION_NEWS_EVENTS.find((n) => n.day === nextDay);
    if (newsForDay) {
      setActiveNews({ ...newsForDay, id: `NEWS-${nextDay}` });
    }

    // 1. Simulate price movements for each stock
    let updatedStocks: Stock[] = [];
    setStocks((prevStocks) => {
      updatedStocks = prevStocks.map((stock) => {
        let baseChangePct = (Math.random() - 0.49) * stock.volatility * 2 + stock.trendBias;

        // Apply news impact if matches
        if (newsForDay && newsForDay.impactSymbol === stock.symbol && newsForDay.impactPercent) {
          baseChangePct += newsForDay.impactPercent;
        }

        const open = stock.price;
        const newPrice = Math.round(Math.max(1, open * (1 + baseChangePct)) * 100) / 100;
        const high = Math.round(Math.max(open, newPrice) * (1 + Math.random() * stock.volatility * 0.7) * 100) / 100;
        const low = Math.round(Math.min(open, newPrice) * (1 - Math.random() * stock.volatility * 0.7) * 100) / 100;
        const volume = Math.floor(180000 + Math.random() * 950000);

        const newHistory = [
          ...stock.history,
          {
            day: nextDay,
            price: newPrice,
            open,
            high,
            low,
            volume,
          },
        ];

        return {
          ...stock,
          price: newPrice,
          openPrice: open,
          highPrice: high,
          lowPrice: low,
          previousClose: open,
          history: newHistory,
        };
      });

      return updatedStocks;
    });

    // 2. Automated Stop-Loss & Take-Profit check evaluated synchronously
    setPositions((currentPositions) => {
      const remainingPositions: Position[] = [];
      const triggeredRecords: TradeRecord[] = [];
      let totalReturnedCash = 0;

      currentPositions.forEach((pos) => {
        const stock = updatedStocks.find((s) => s.symbol === pos.symbol);
        if (!stock) {
          remainingPositions.push(pos);
          return;
        }

        let triggered = false;
        let triggerReason = '';

        if (pos.stopLossPrice && stock.price <= pos.stopLossPrice) {
          triggered = true;
          triggerReason = `Stop-Loss Triggered (₹${stock.price.toFixed(2)} <= ₹${pos.stopLossPrice.toFixed(2)})`;
        } else if (pos.takeProfitPrice && stock.price >= pos.takeProfitPrice) {
          triggered = true;
          triggerReason = `Take-Profit Hit (₹${stock.price.toFixed(2)} >= ₹${pos.takeProfitPrice.toFixed(2)})`;
        }

        if (triggered) {
          // Liquidate position automatically
          const orderTotal = pos.quantity * stock.price;
          const costBasis = pos.averagePrice * pos.quantity;
          const realizedPnL = orderTotal - costBasis;
          const pnlPct = (realizedPnL / costBasis) * 100;

          totalReturnedCash += orderTotal;

          triggeredRecords.push({
            id: `AUTO-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            day: nextDay,
            week: nextWeek,
            timeString: `W${nextWeek}·D${nextDay} AUTO-EXEC`,
            symbol: pos.symbol,
            type: 'SELL',
            price: stock.price,
            quantity: pos.quantity,
            totalValue: orderTotal,
            realizedPnL,
            pnlPercent: pnlPct,
            reason: triggerReason,
          });
        } else {
          remainingPositions.push(pos);
        }
      });

      if (triggeredRecords.length > 0) {
        setCash((c) => c + totalReturnedCash);
        setJournal((j) => [...triggeredRecords, ...j]);
        soundFX.playAlert();
      }

      return remainingPositions;
    });

    setCurrentDay(nextDay);

    if (nextDay >= MAX_DAYS) {
      setAutoPlay(false);
      setTimeout(() => {
        setIsReportOpen(true);
      }, 500);
    }
  }, [currentDay]);

  const advanceDayRef = useRef(advanceDay);
  advanceDayRef.current = advanceDay;
  const multiDayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Advance by multi days with reliable non-stale callback and boundary check
  const advanceMultiDays = useCallback((days: number) => {
    if (multiDayTimerRef.current) {
      clearInterval(multiDayTimerRef.current);
      multiDayTimerRef.current = null;
    }
    let remaining = days;
    multiDayTimerRef.current = setInterval(() => {
      advanceDayRef.current();
      remaining--;
      if (remaining <= 0) {
        if (multiDayTimerRef.current) {
          clearInterval(multiDayTimerRef.current);
          multiDayTimerRef.current = null;
        }
      }
    }, 180);
  }, []);

  // Clean up any multi-day timer on unmount
  useEffect(() => {
    return () => {
      if (multiDayTimerRef.current) clearInterval(multiDayTimerRef.current);
    };
  }, []);

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (autoPlay && currentDay < MAX_DAYS) {
      timer = setInterval(() => {
        advanceDay();
      }, 1200);
    } else if (currentDay >= MAX_DAYS) {
      setAutoPlay(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoPlay, currentDay, advanceDay]);

  // Restart Simulation
  const handleRestart = () => {
    if (multiDayTimerRef.current) {
      clearInterval(multiDayTimerRef.current);
      multiDayTimerRef.current = null;
    }
    setCash(STARTING_CAPITAL);
    setStocks(INITIAL_STOCKS);
    setSelectedSymbol('RELIANCE');
    setPositions([]);
    setJournal([]);
    setCurrentDay(1);
    setAutoPlay(false);
    setActiveNews(null);
    setIsReportOpen(false);
    setPeakNetWorth(STARTING_CAPITAL);
    setMaxDrawdownPercent(0);
  };

  // Generate Performance Metrics for Final Report
  const performanceMetrics = useMemo<PerformanceMetrics>(() => {
    const closedTrades = journal.filter((j) => j.type === 'SELL' && j.realizedPnL !== undefined);
    const winningTrades = closedTrades.filter((t) => (t.realizedPnL || 0) > 0);
    const losingTrades = closedTrades.filter((t) => (t.realizedPnL || 0) < 0);

    const grossProfits = winningTrades.reduce((acc, t) => acc + (t.realizedPnL || 0), 0);
    const grossLosses = Math.abs(losingTrades.reduce((acc, t) => acc + (t.realizedPnL || 0), 0));
    const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? 99 : 0;

    const winRatePercent = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Sector distribution
    const sectorMap = new Map<string, number>();
    positions.forEach((pos) => {
      const stock = stockMap.get(pos.symbol);
      const sector = stock ? stock.sector : 'Other';
      const val = (stock ? stock.price : pos.averagePrice) * pos.quantity;
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + val);
    });

    const sectorDistribution = Array.from(sectorMap.entries()).map(([sector, value]) => ({
      sector,
      value,
      percent: totalPositionsValue > 0 ? (value / totalPositionsValue) * 100 : 0,
    }));

    // Persona rating
    let traderTitle = 'Discreet Value Investor';
    let critique = 'You maintained strict capital discipline and steady risk allocation across large-cap leaders.';

    if (overallROIPercent > 15) {
      traderTitle = 'Dalal Street Alpha Wizard';
      critique = 'Outstanding performance! You capitalized effectively on momentum swings and outpaced the benchmark NIFTY indices decisively.';
    } else if (overallROIPercent > 5) {
      traderTitle = 'Disciplined Portfolio Manager';
      critique = 'Consistent alpha generation with sensible risk management. Your stop-loss adherence prevented catastrophic tail risk.';
    } else if (overallROIPercent < -8) {
      traderTitle = 'High Volatility Speculator';
      critique = 'Aggressive sizing led to drawdown pressures during pullbacks. Consider tightening stop-loss targets and diversifying sector weights.';
    } else if (closedTrades.length === 0) {
      traderTitle = 'Buy-and-Hold Institutional Custodian';
      critique = 'You practiced patient long-term equity accumulation, letting your core blue-chip holdings mature through market cycles.';
    }

    const bestTradeRecord = winningTrades.length > 0
      ? winningTrades.reduce((acc, t) => ((t.realizedPnL || 0) > (acc.realizedPnL || 0) ? t : acc), winningTrades[0])
      : null;

    const worstTradeRecord = losingTrades.length > 0
      ? losingTrades.reduce((acc, t) => ((t.realizedPnL || 0) < (acc.realizedPnL || 0) ? t : acc), losingTrades[0])
      : null;

    return {
      startingCapital: STARTING_CAPITAL,
      finalPortfolioValue: totalPortfolioValue,
      netRealizedProfit: totalRealizedPnL,
      unrealizedProfit: totalUnrealizedPnL,
      totalPnL: totalProfitLoss,
      roiPercent: overallROIPercent,
      totalTrades: journal.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRatePercent,
      profitFactor,
      maxDrawdownPercent,
      bestTrade: bestTradeRecord ? { symbol: bestTradeRecord.symbol, profit: bestTradeRecord.realizedPnL || 0, percent: bestTradeRecord.pnlPercent || 0 } : null,
      worstTrade: worstTradeRecord ? { symbol: worstTradeRecord.symbol, profit: worstTradeRecord.realizedPnL || 0, percent: worstTradeRecord.pnlPercent || 0 } : null,
      sectorDistribution,
      traderTitle,
      critique,
    };
  }, [journal, positions, stockMap, totalPositionsValue, totalPortfolioValue, totalRealizedPnL, totalUnrealizedPnL, totalProfitLoss, overallROIPercent, maxDrawdownPercent]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Universal Top Bar (3-zone contract compliant) */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-100">
              Dalal Street Alpha
            </span>
            <span className="text-neutral-500 text-xs">/</span>
            <span className="text-xs text-neutral-400 font-mono">Investment Simulator</span>
          </div>

          {/* Zone 2: Navigation / Section links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <button
              onClick={() => setActiveBottomTab('holdings')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 ${
                activeBottomTab === 'holdings' ? 'text-neutral-100 font-semibold' : ''
              }`}
            >
              Portfolio Holdings
            </button>
            <button
              onClick={() => setActiveBottomTab('journal')}
              className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 ${
                activeBottomTab === 'journal' ? 'text-neutral-100 font-semibold' : ''
              }`}
            >
              Trade Journal
            </button>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono">Cycle: 8 Weeks (40 Days)</span>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              End 8-Week Simulation
            </button>
          </div>
        </div>
      </header>

      {/* Global Portfolio KPI Strip */}
      <div className="bg-neutral-900 border-b border-neutral-800 py-3">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Total Net Worth</span>
            <span className="text-base font-bold text-neutral-100">
              ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Liquid Cash</span>
            <span className="text-base font-bold text-neutral-200">
              ₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Invested Capital</span>
            <span className="text-base font-bold text-neutral-300">
              ₹{totalPositionsValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Unrealized P&L</span>
            <span className={`text-base font-bold flex items-center gap-1 ${totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnL >= 0 ? '+' : ''}₹{totalUnrealizedPnL.toFixed(0)}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Realized P&L</span>
            <span className={`text-base font-bold flex items-center gap-1 ${totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalRealizedPnL >= 0 ? '+' : ''}₹{totalRealizedPnL.toFixed(0)}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 text-[10px] uppercase block">Overall ROI %</span>
            <span className={`text-base font-bold flex items-center gap-1 ${overallROIPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overallROIPercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {overallROIPercent >= 0 ? '+' : ''}{overallROIPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Market Ticker Strip with Benchmark Indices and Stepping Controls */}
      <MarketTicker
        currentDay={currentDay}
        currentWeek={currentWeek}
        maxDays={MAX_DAYS}
        stocks={stocks}
        activeNews={activeNews}
        onAdvanceDay={advanceDay}
        onAdvanceMultiDays={advanceMultiDays}
        autoPlay={autoPlay}
        onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
        onEndSimulation={() => setIsReportOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Core Trading Terminal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Watchlist (3 cols) */}
          <div className="lg:col-span-3 min-h-[460px]">
            <Watchlist
              stocks={stocks}
              selectedSymbol={selectedSymbol}
              positions={positions}
              onSelectStock={setSelectedSymbol}
            />
          </div>

          {/* Center Column: Live Stock Price Chart (6 cols) */}
          <div className="lg:col-span-6 min-h-[460px]">
            <StockChart stock={activeStock} position={activePosition} />
          </div>

          {/* Right Column: Order Execution Panel (3 cols) */}
          <div className="lg:col-span-3 min-h-[460px]">
            <OrderPanel
              stock={activeStock}
              cash={cash}
              position={activePosition}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>

        {/* Bottom Section: Tabbed Portfolio Holdings & Trading Journal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <button
              onClick={() => setActiveBottomTab('holdings')}
              className={`py-1.5 px-4 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeBottomTab === 'holdings'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers size={13} />
              <span>Active Portfolio Holdings ({positions.length})</span>
            </button>
            <button
              onClick={() => setActiveBottomTab('journal')}
              className={`py-1.5 px-4 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeBottomTab === 'journal'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Wallet size={13} />
              <span>Trading Journal & Execution Log ({journal.length})</span>
            </button>
          </div>

          {activeBottomTab === 'holdings' ? (
            <PositionsTable
              positions={positions}
              stocks={stocks}
              onExitPosition={handleExitPosition}
              onUpdateLimits={handleUpdateLimits}
              onSelectStock={setSelectedSymbol}
            />
          ) : (
            <TradingJournal records={journal} />
          )}
        </div>
      </main>

      {/* Performance Analysis Report Modal */}
      <FinalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        metrics={performanceMetrics}
        onRestartSimulation={handleRestart}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
          <div>
            Dalal Street Alpha · Realistic Indian Equities Investment Simulation Engine
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                import('./utils/generateStandaloneHtml').then(({ generateStandaloneHTML }) => {
                  const html = generateStandaloneHTML();
                  const blob = new Blob([html], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'dalal-street-simulation.html';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                });
              }}
              className="text-neutral-300 hover:text-emerald-400 transition-colors underline decoration-dotted"
            >
              Export Standalone HTML
            </button>
            <span>·</span>
            <span>Virtual Capital: ₹5,00,000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
