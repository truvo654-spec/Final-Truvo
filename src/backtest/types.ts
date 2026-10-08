// Shared types for the Backtesting module (engine, storage and UI).

export type Timeframe = 'tick' | '1s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1D';
/** Timeframes the mock feed can serve. Tick, 1s and 1m need a real tick data provider. */
export const SUPPORTED_TIMEFRAMES: Timeframe[] = ['5m', '15m', '1h', '4h', '1D'];
export const ALL_TIMEFRAMES: Timeframe[] = ['tick', '1s', '1m', '5m', '15m', '1h', '4h', '1D'];
export const TF_MS: Record<Timeframe, number> = {
  tick: 0, '1s': 1000, '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000, '4h': 14400000, '1D': 86400000,
};

export type AssetClass = 'Stocks' | 'Futures' | 'Forex' | 'Crypto' | 'Options';
export const ASSET_CLASSES: AssetClass[] = ['Stocks', 'Futures', 'Forex', 'Crypto', 'Options'];

/** Column-oriented price history (typed arrays keep two years of 5-minute bars small and fast). */
export interface Series {
  symbol: string;
  tf: Timeframe;
  length: number;
  t: Float64Array; // bar open time, ms UTC
  o: Float64Array;
  h: Float64Array;
  l: Float64Array;
  c: Float64Array;
  v: Float64Array;
}

export interface Bar { t: number; o: number; h: number; l: number; c: number; v: number }

export type MarketHours = 'fx' | 'cme' | 'crypto' | 'us-stocks';

export interface SymbolSpec {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  /** Journal symbols that map onto this instrument (e.g. NAS100 → NQ). */
  aliases: string[];
  tickSize: number;
  /** USD value of a 1.0 price move for one unit of size. */
  multiplier: number;
  sizeUnit: string; // lots, contracts, coins, shares
  minSize: number;
  sizeStep: number;
  /** Unit used for spread and slippage inputs. */
  costUnit: { label: string; size: number };
  priceDp: number;
  hours: MarketHours;
  startPrice: number;
  annualVol: number;
}

export type SessionId = 'any' | 'asia' | 'london' | 'ny' | 'custom';
export const SESSIONS: Record<Exclude<SessionId, 'custom' | 'any'>, { label: string; start: number; end: number }> = {
  asia: { label: 'Asia', start: 0, end: 7 },
  london: { label: 'London', start: 7, end: 16 },
  ny: { label: 'New York', start: 12, end: 21 },
};

// ── Rules ────────────────────────────────────────────────────────────────

export type IndType =
  | 'SMA' | 'EMA' | 'RSI' | 'ATR' | 'VWAP'
  | 'PDH' | 'PDL' | 'SESSION_HIGH' | 'SESSION_LOW'
  | 'HIGHEST' | 'LOWEST' | 'FVG_BULL' | 'FVG_BEAR';

export interface IndSpec { type: IndType; period?: number; session?: 'asia' | 'london' | 'ny' }

export type Operand =
  | { kind: 'price'; field: 'close' | 'open' | 'high' | 'low' }
  | { kind: 'ind'; ind: IndSpec }
  | { kind: 'value'; value: number };

export type Op = 'gt' | 'lt' | 'crossAbove' | 'crossBelow';

export interface Condition { id: string; left: Operand; op: Op; right: Operand }

export type StopRule =
  | { type: 'atr'; mult: number }
  | { type: 'points'; value: number } // in the symbol's cost unit (pips, ticks, $)
  | { type: 'swing'; lookback: number };

export type EntryOrder =
  | { type: 'market' }
  | { type: 'limit'; offsetAtr: number; validBars: number }
  | { type: 'stop'; validBars: number };

export interface ExitRules {
  stop: StopRule;
  targetR: number | null;
  breakevenAtR: number | null;
  /** Where the stop goes at breakeven, in R above entry (e.g. 0.2 locks +0.2R). */
  breakevenLockR: number;
  trailing: { atrMult: number; startR: number } | null;
  partial: { atR: number; fraction: number } | null;
  timeExitBars: number | null;
  sessionEndExit: boolean;
}

export interface StrategyRules {
  direction: 'long' | 'short' | 'both';
  /** Long entry conditions (all must be true). Short rules mirror them automatically. */
  entry: Condition[];
  entryOrder: EntryOrder;
  exits: ExitRules;
  maxTradesPerDay: number | null;
}

// ── Settings ─────────────────────────────────────────────────────────────

export type Currency = 'USD' | 'EUR' | 'GBP';

export interface RiskSettings {
  mode: 'percent' | 'fixedR' | 'fixedQty';
  percent: number;
  fixedR: number;
  qty: number;
  startBalance: number;
  currency: Currency;
  dailyLossPct: number | null;
  maxDrawdownPct: number | null;
}

export interface CostSettings {
  enabled: boolean;
  brokerId: string | null;
  commissionPerSide: number; // USD per unit of size per side
  spread: number; // cost units
  slippage: number; // cost units
  fillModel: 'nextOpen' | 'sameClose';
}

export interface PropSettings {
  account: string;
  profitTargetPct: number;
  maxDrawdownPct: number;
  trailing: boolean;
  dailyLossPct: number;
  minDays: number;
}

export interface BacktestSettings {
  name: string;
  playbookId: string | null;
  symbol: string;
  timeframe: Timeframe;
  from: string; // YYYY-MM-DD inclusive
  to: string; // YYYY-MM-DD inclusive
  session: { id: SessionId; start: number; end: number };
  weekdays: number[]; // 0 = Sun … 6 = Sat (UTC)
  news: 'include' | 'skip' | 'only';
  rules: StrategyRules;
  risk: RiskSettings;
  costs: CostSettings;
  prop: PropSettings | null;
}

// ── Results ──────────────────────────────────────────────────────────────

export type ExitReason = 'target' | 'stop' | 'breakeven' | 'trailing' | 'session end' | 'signal' | 'time' | 'rule limit' | 'end of test';
export const EXIT_REASONS: ExitReason[] = ['target', 'stop', 'breakeven', 'trailing', 'session end', 'signal', 'time', 'rule limit', 'end of test'];

export interface BacktestTrade {
  id: number;
  entryTime: number;
  exitTime: number;
  direction: 'long' | 'short';
  entryPrice: number;
  orderType: 'market' | 'limit' | 'stop';
  exitPrice: number;
  stopPrice: number; // initial stop
  targetPrice: number | null;
  size: number;
  gross: number; // account currency, before costs
  costs: number; // commission + spread + slippage
  net: number;
  r: number;
  mae: number; // R
  mfe: number; // R
  exitReason: ExitReason;
  balance: number; // running balance after this trade (time order)
  bars: number; // bars held
  ambiguous: boolean; // stop and target both inside one bar; stop assumed first
  partial: boolean;
}

export interface RunEvent { t: number; kind: 'daily-limit' | 'max-drawdown' | 'prop-passed' | 'prop-failed' | 'info'; text: string }

export interface RunDiagnostics {
  bars: number;
  signals: number;
  filtered: { session: number; weekday: number; news: number; dayLimit: number; maxTrades: number; minSize: number; expired: number };
  conditionHits: { label: string; hits: number }[];
  allTogether: number;
}

export interface RunResult {
  trades: BacktestTrade[];
  startBalance: number;
  endBalance: number;
  currency: Currency;
  rangeStart: number;
  rangeEnd: number;
  events: RunEvent[];
  stopReason: string | null;
  diagnostics: RunDiagnostics;
  zeroTradeReason: string | null;
  propStatus: 'passed' | 'failed' | 'in progress' | null;
  tradingDays: number;
}

export interface Suggestion { id: string; label: string; detail: string; deltaR: number; trades: number; patch: Partial<BacktestSettings> & { rulesPatch?: Partial<StrategyRules>; exitsPatch?: Partial<ExitRules> } }

export interface JobOutput { result: RunResult; suggestions: Suggestion[] }
