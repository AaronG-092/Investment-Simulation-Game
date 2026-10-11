export interface Stock {
  symbol: string;
  name: string;
  sector: 'Conglomerate' | 'Banking' | 'IT Services' | 'Automobile' | 'FMCG' | 'Telecom';
  price: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  history: {
    day: number;
    price: number;
    open: number;
    high: number;
    low: number;
    volume: number;
  }[];
  volatility: number; // Daily volatility % (e.g. 0.015 = 1.5%)
  trendBias: number;  // Drift factor (-0.002 to +0.003)
  marketCapCr: number; // In Crores
  peRatio: number;
  description: string;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  totalCost: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
}

export type OrderType = 'BUY' | 'SELL';

export interface TradeRecord {
  id: string;
  day: number;
  week: number;
  timeString: string;
  symbol: string;
  type: OrderType;
  price: number;
  quantity: number;
  totalValue: number;
  realizedPnL?: number;
  pnlPercent?: number;
  reason: string;
  notes?: string;
}

export interface NewsItem {
  id: string;
  day: number;
  headline: string;
  impactSymbol?: string;
  impactPercent?: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface PerformanceMetrics {
  startingCapital: number;
  finalPortfolioValue: number;
  netRealizedProfit: number;
  unrealizedProfit: number;
  totalPnL: number;
  roiPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  bestTrade: { symbol: string; profit: number; percent: number } | null;
  worstTrade: { symbol: string; profit: number; percent: number } | null;
  sectorDistribution: { sector: string; value: number; percent: number }[];
  traderTitle: string;
  critique: string;
}
