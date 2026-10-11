import { useState, useId, useEffect } from 'react';
import { Stock, Position, OrderType } from '../types/market';
import { soundFX } from '../utils/audio';
import { ArrowDownLeft, ArrowUpRight, ShieldAlert, Target, Info, Check } from 'lucide-react';

interface OrderPanelProps {
  stock: Stock;
  cash: number;
  position?: Position;
  onPlaceOrder: (params: {
    symbol: string;
    type: OrderType;
    quantity: number;
    price: number;
    stopLossPrice?: number;
    takeProfitPrice?: number;
    reason: string;
  }) => void;
}

export function OrderPanel({ stock, cash, position, onPlaceOrder }: OrderPanelProps) {
  const [orderType, setOrderType] = useState<OrderType>('BUY');
  const [quantity, setQuantity] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [reason, setReason] = useState<string>('Market Momentum');
  const [feedback, setFeedback] = useState<string | null>(null);

  const orderId = useId();

  // Reset symbol-specific SL / TP inputs when stock changes
  useEffect(() => {
    setStopLoss('');
    setTakeProfit('');
    setFeedback(null);
  }, [stock.symbol]);

  const maxAffordableShares = Math.floor(cash / stock.price);
  const availableSharesToSell = position ? position.quantity : 0;

  const totalOrderValue = quantity * stock.price;
  const remainingCashAfterBuy = cash - totalOrderValue;

  const handleQuickQty = (amount: number) => {
    setQuantity((prev) => Math.max(1, (prev || 0) + amount));
  };

  const handleMaxBuy = () => {
    if (maxAffordableShares > 0) {
      setQuantity(maxAffordableShares);
    }
  };

  const handleSellPercent = (pct: number) => {
    if (!position) return;
    const qty = Math.max(1, Math.floor((position.quantity * pct) / 100));
    setQuantity(qty);
  };

  const setOffsetSL = (pct: number) => {
    const slVal = stock.price * (1 - pct / 100);
    setStopLoss(slVal.toFixed(1));
  };

  const setOffsetTP = (pct: number) => {
    const tpVal = stock.price * (1 + pct / 100);
    setTakeProfit(tpVal.toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setFeedback('Quantity must be greater than 0.');
      return;
    }

    if (orderType === 'BUY') {
      if (totalOrderValue > cash) {
        setFeedback('Insufficient virtual cash for this purchase.');
        soundFX.playAlert();
        return;
      }
    } else {
      if (!position || position.quantity < quantity) {
        setFeedback(`Insufficient shares. You only own ${availableSharesToSell} shares.`);
        soundFX.playAlert();
        return;
      }
    }

    const slNum = stopLoss ? parseFloat(stopLoss) : undefined;
    const tpNum = takeProfit ? parseFloat(takeProfit) : undefined;

    if (slNum && slNum >= stock.price && orderType === 'BUY') {
      setFeedback('Stop-loss price must be lower than the current market price.');
      soundFX.playAlert();
      return;
    }

    if (tpNum && tpNum <= stock.price && orderType === 'BUY') {
      setFeedback('Take-profit price must be higher than the current market price.');
      soundFX.playAlert();
      return;
    }

    onPlaceOrder({
      symbol: stock.symbol,
      type: orderType,
      quantity,
      price: stock.price,
      stopLossPrice: slNum,
      takeProfitPrice: tpNum,
      reason: reason.trim() || (orderType === 'BUY' ? 'Manual Market Entry' : 'Manual Profit Booking'),
    });

    if (orderType === 'BUY') {
      soundFX.playBuy();
    } else {
      soundFX.playSell();
    }

    setFeedback(`Executed: ${orderType} ${quantity} ${stock.symbol} @ ₹${stock.price.toFixed(2)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">Trading Terminal</h3>
        <span className="text-xs font-mono text-neutral-400">
          Available Cash: <span className="text-neutral-200 font-semibold">₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </span>
      </div>

      {/* Buy / Sell Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setOrderType('BUY');
            setFeedback(null);
          }}
          className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            orderType === 'BUY'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ArrowDownLeft size={14} />
          <span>BUY (Market)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setOrderType('SELL');
            setFeedback(null);
          }}
          className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            orderType === 'SELL'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ArrowUpRight size={14} />
          <span>SELL (Market)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          {/* Quantity Selector */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor={`${orderId}-qty`} className="text-neutral-300 font-medium">Order Quantity</label>
              <span className="text-neutral-400 font-mono text-[11px]">
                {orderType === 'BUY'
                  ? `Max Afford: ${maxAffordableShares} shares`
                  : `Holding: ${availableSharesToSell} shares`}
              </span>
            </div>
            <div className="relative">
              <input
                id={`${orderId}-qty`}
                type="number"
                min="1"
                max={orderType === 'BUY' ? maxAffordableShares || 1 : availableSharesToSell || 1}
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm text-neutral-100 font-mono focus:outline-none focus:border-neutral-600"
                placeholder="Shares"
              />
              <span className="absolute right-3 top-2.5 text-xs text-neutral-400">shares</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              {orderType === 'BUY' ? (
                <>
                  {[10, 25, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleQuickQty(q)}
                      className="px-2 py-1 text-[11px] font-mono rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                    >
                      +{q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleMaxBuy}
                    className="ml-auto px-2 py-1 text-[11px] font-mono rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  >
                    Max
                  </button>
                </>
              ) : (
                <>
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSellPercent(pct)}
                      disabled={availableSharesToSell === 0}
                      className="px-2 py-1 text-[11px] font-mono rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-40"
                    >
                      {pct}%
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Stop-Loss & Take-Profit Fields (Applicable on BUY) */}
          {orderType === 'BUY' ? (
            <div className="pt-2 border-t border-neutral-800 space-y-3">
              <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Risk Management (Automated Triggers)</span>
                <span className="text-[10px] text-neutral-400 font-mono">Optional</span>
              </div>

              {/* Stop-Loss Input */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-rose-400 flex items-center gap-1 font-medium">
                    <ShieldAlert size={12} /> Stop-Loss Price (₹)
                  </span>
                  <div className="flex gap-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setOffsetSL(2)}
                      className="text-neutral-400 hover:text-rose-400"
                    >
                      -2%
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setOffsetSL(5)}
                      className="text-neutral-400 hover:text-rose-400"
                    >
                      -5%
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder={`e.g. ${(stock.price * 0.95).toFixed(1)}`}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-1.5 px-3 text-xs text-neutral-100 font-mono focus:outline-none focus:border-rose-500/50"
                />
              </div>

              {/* Take-Profit Input */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-purple-400 flex items-center gap-1 font-medium">
                    <Target size={12} /> Take-Profit Target (₹)
                  </span>
                  <div className="flex gap-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setOffsetTP(5)}
                      className="text-neutral-400 hover:text-purple-400"
                    >
                      +5%
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setOffsetTP(10)}
                      className="text-neutral-400 hover:text-purple-400"
                    >
                      +10%
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder={`e.g. ${(stock.price * 1.08).toFixed(1)}`}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-1.5 px-3 text-xs text-neutral-100 font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-1.5 font-mono">
              <Info size={12} className="text-sky-400 shrink-0" />
              <span>Selling liquidates shares and locks in realized P&L at market price.</span>
            </div>
          )}

          {/* Trade Rationale / Reason Log */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Trading Thesis / Log Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Technical breakout above resistance"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-1.5 px-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
            />
            {/* Quick reason suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['Breakout', 'Value Dip', 'News Catalyst', 'Profit Booking'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation summary */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-neutral-400">
            <span>Execution Price</span>
            <span className="text-neutral-200">₹{stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Order Value</span>
            <span className="text-neutral-100 font-semibold">₹{totalOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          {orderType === 'BUY' ? (
            <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-800/60">
              <span>Remaining Cash</span>
              <span className={remainingCashAfterBuy < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                ₹{remainingCashAfterBuy.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          ) : (
            position && (
              <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-800/60">
                <span>Est. Realized P&L</span>
                {(() => {
                  const estPnL = (stock.price - position.averagePrice) * quantity;
                  return (
                    <span className={estPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {estPnL >= 0 ? '+' : ''}₹{estPnL.toFixed(2)}
                    </span>
                  );
                })()}
              </div>
            )
          )}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="text-xs p-2 rounded bg-neutral-800/90 border border-neutral-700 text-neutral-200 flex items-center gap-1.5">
            <Info size={13} className="shrink-0 text-amber-400" />
            <span className="truncate">{feedback}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={orderType === 'SELL' && availableSharesToSell === 0}
          className={`w-full py-2.5 px-4 rounded-md text-xs font-bold tracking-wide uppercase transition-all shadow-sm ${
            orderType === 'BUY'
              ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold'
              : 'bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {orderType === 'BUY' ? `Buy ${quantity} ${stock.symbol}` : `Sell ${quantity} ${stock.symbol}`}
        </button>
      </form>
    </div>
  );
}
