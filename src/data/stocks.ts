import { Stock, NewsItem } from '../types/market';

function generateInitialHistory(basePrice: number, volatility: number, days = 15) {
  const history = [];
  let current = basePrice * (1 - (days * 0.003)); // start slightly lower for organic trend
  
  for (let i = 1; i <= days; i++) {
    const changePct = (Math.random() - 0.48) * volatility * 2;
    const open = Math.round(current * 100) / 100;
    const close = Math.round(open * (1 + changePct) * 100) / 100;
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * volatility * 0.8) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * volatility * 0.8) * 100) / 100;
    const volume = Math.floor(150000 + Math.random() * 850000);
    
    history.push({
      day: i,
      price: close,
      open,
      high,
      low,
      volume,
    });
    current = close;
  }
  return { history, lastPrice: current };
}

interface BaseStockConfig {
  symbol: string;
  name: string;
  sector: Stock['sector'];
  price: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  volatility: number;
  trendBias: number;
  marketCapCr: number;
  peRatio: number;
  description: string;
}

const BASE_STOCKS: BaseStockConfig[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    sector: 'Conglomerate',
    price: 2950,
    openPrice: 2930,
    highPrice: 2975,
    lowPrice: 2915,
    previousClose: 2928,
    volatility: 0.016,
    trendBias: 0.0012,
    marketCapCr: 1980000,
    peRatio: 28.4,
    description: 'India\'s largest conglomerate spanning Oil-to-Chemicals, Jio Telecom, and Reliance Retail.',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    sector: 'Banking',
    price: 1560,
    openPrice: 1552,
    highPrice: 1574,
    lowPrice: 1545,
    previousClose: 1550,
    volatility: 0.014,
    trendBias: 0.0008,
    marketCapCr: 1190000,
    peRatio: 18.2,
    description: 'Premier private sector bank in India with expansive retail & institutional branch networks.',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    sector: 'IT Services',
    price: 1520,
    openPrice: 1510,
    highPrice: 1535,
    lowPrice: 1502,
    previousClose: 1508,
    volatility: 0.021,
    trendBias: 0.0015,
    marketCapCr: 630000,
    peRatio: 26.5,
    description: 'Global IT consulting and digital transformation services titan with high US & European exposure.',
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    sector: 'Automobile',
    price: 980,
    openPrice: 965,
    highPrice: 995,
    lowPrice: 960,
    previousClose: 970,
    volatility: 0.025,
    trendBias: 0.0022,
    marketCapCr: 360000,
    peRatio: 16.8,
    description: 'Automotive powerhouse leading Indian Electric Vehicles (EV) and Jaguar Land Rover luxury sales.',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'IT Services',
    price: 3940,
    openPrice: 3920,
    highPrice: 3968,
    lowPrice: 3905,
    previousClose: 3915,
    volatility: 0.013,
    trendBias: 0.0009,
    marketCapCr: 1420000,
    peRatio: 31.2,
    description: 'The crown jewel of Indian software exports with robust multi-billion-dollar enterprise order pipelines.',
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd',
    sector: 'FMCG',
    price: 435,
    openPrice: 432,
    highPrice: 439,
    lowPrice: 430,
    previousClose: 433,
    volatility: 0.011,
    trendBias: 0.0005,
    marketCapCr: 540000,
    peRatio: 25.1,
    description: 'Diversified consumer goods giant with defensive cash flows across cigarettes, foods, packaging & hotels.',
  },
];

export const INITIAL_STOCKS: Stock[] = BASE_STOCKS.map((stock) => {
  const { history } = generateInitialHistory(stock.price, stock.volatility, 15);
  const prev = history[history.length - 2];
  const last = history[history.length - 1];
  return {
    ...stock,
    price: last.price,
    openPrice: last.open,
    highPrice: last.high,
    lowPrice: last.low,
    previousClose: prev ? prev.price : stock.price,
    history,
  };
});

export const SIMULATION_NEWS_EVENTS: Omit<NewsItem, 'id'>[] = [
  {
    day: 3,
    headline: 'RBI Monetary Policy: Repo rate held unchanged at 6.5%; Banking liquidity deemed comfortable.',
    impactSymbol: 'HDFCBANK',
    impactPercent: 0.018,
    sentiment: 'positive',
  },
  {
    day: 6,
    headline: 'Tata Motors bags landmark order for 1,500 electric commercial vehicles in domestic metro routes.',
    impactSymbol: 'TATAMOTORS',
    impactPercent: 0.035,
    sentiment: 'positive',
  },
  {
    day: 10,
    headline: 'Global Tech Slowdown: US enterprise IT budgets face quarterly scrutiny; margins under watch.',
    impactSymbol: 'INFY',
    impactPercent: -0.024,
    sentiment: 'negative',
  },
  {
    day: 14,
    headline: 'Reliance Retail inaugurates 50 new flagship experiential superstores across tier-1 cities.',
    impactSymbol: 'RELIANCE',
    impactPercent: 0.022,
    sentiment: 'positive',
  },
  {
    day: 19,
    headline: 'TCS secures $750M mega multi-year cloud and AI modernization contract from UK retailer.',
    impactSymbol: 'TCS',
    impactPercent: 0.028,
    sentiment: 'positive',
  },
  {
    day: 23,
    headline: 'GST Council clarifies tobacco & agricultural cess structure; no immediate rate hikes announced.',
    impactSymbol: 'ITC',
    impactPercent: 0.019,
    sentiment: 'positive',
  },
  {
    day: 28,
    headline: 'Automotive chip supply normalizes; Jaguar Land Rover order book reaches 6-month high.',
    impactSymbol: 'TATAMOTORS',
    impactPercent: 0.031,
    sentiment: 'positive',
  },
  {
    day: 33,
    headline: 'Crude oil prices tick up 4% amid Gulf geopolitical developments, lifting gross refining margins.',
    impactSymbol: 'RELIANCE',
    impactPercent: 0.015,
    sentiment: 'positive',
  },
  {
    day: 37,
    headline: 'FIIs pump ₹8,500 Cr into domestic large-caps ahead of quarterly corporate earnings season.',
    impactSymbol: 'HDFCBANK',
    impactPercent: 0.023,
    sentiment: 'positive',
  },
];
