export type Tier = 'GUEST' | 'BASIC' | 'INTERMEDIATE' | 'PREMIUM';
export type View = 'dashboard' | 'screener' | 'flow' | 'instrument' | 'signals' | 'advisors' | 'watchlist' | 'alerts' | 'portfolio';
export type Visualization = 'Table' | 'Heatmap' | 'Scatter' | 'Correlation' | 'Cross-market' | 'Custom';
export type FxCategory = 'Major' | 'Minor' | 'Exotic';
export type InstrumentMetric = 'price' | 'change' | 'return1m' | 'volume' | 'rvol' | 'rsi' | 'marketCap' | 'sentiment' | 'pe' | 'yield';

export type Instrument = {
  symbol: string;
  name: string;
  market: string;
  sector: string;
  primaryMarket?: string;
  region?: string;
  country?: string;
  subSector?: string;
  price: number;
  change: number;
  volume: number;
  rvol: number;
  rsi: number;
  return1m: number;
  marketCap: number;
  sentiment: number;
  signal: 'LONG' | 'WATCH' | 'NEUTRAL';
  confidence: number;
  fxCategory?: FxCategory;
  pe?: number;
  yield?: number;
};

export type InstrumentDetailData = {
  quoteCurrency: string;
  unit: string;
  dataSource: string;
  marketStatus: string;
  open: number;
  previousClose: number;
  dayLow: number;
  dayHigh: number;
  historicalLow: number;
  historicalHigh: number;
  volumeType: string;
  performance1d: number;
  performance1w: number;
  performance1m: number;
  performance6m: number;
  performanceYtd: number;
  performance1y: number;
  factors: { label: string; value: string; unit?: string }[];
};

export type FilterRule = {
  id: string;
  field: string;
  operator: string;
  value: string;
  join: 'AND' | 'OR';
};

export type IndexStatus = 'Top Gainer' | 'Top Loser' | 'New High' | 'New Low' | 'Neutral';
export type IndexSector = { sector: string; change: number };

export type MarketIndex = {
  symbol: string;
  name: string;
  region: string;
  price: number;
  change: number;
  status: IndexStatus;
  signal: 'LONG' | 'WATCH' | 'NEUTRAL';
  confidence: number;
  sectors: IndexSector[];
};

export type PremiumFeature =
  | 'advancedScreener'
  | 'signalPrecision'
  | 'eventIntelligence'
  | 'orderFlow'
  | 'historicalData'
  | 'marketScreener'
  | 'heatmap'
  | 'scatter'
  | 'correlation'
  | 'advancedFilters'
  | 'alerts'
  | 'brokerComparison'
  | 'tradingCalculator'
  | 'customDashboard'
  | 'researchNews'
  | 'advancedChart'
  | 'performanceAnalytics'
  | 'technicalIntervals'
  | 'technicalTools'
  | 'technicalParameters';

export type UnlockDuration = '1h' | '1d' | '7d';
