/** Shared types for the Strategy Builder and its backtest engine. */

export type Timeframe = '1H' | '4H' | '1D';
export type PeriodKey = '3M' | '6M' | '1Y' | '3Y' | '5Y';
export type Direction = 'long' | 'short' | 'both';

export interface Bar {
  t: number; // ms since epoch
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export type PriceField = 'close' | 'open' | 'high' | 'low';

export type OperandKind =
  | 'price'
  | 'value'
  | 'sma'
  | 'ema'
  | 'rsi'
  | 'macd'
  | 'macdSignal'
  | 'macdHist'
  | 'bbUpper'
  | 'bbMid'
  | 'bbLower'
  | 'atr'
  | 'stoch'
  | 'donchianHigh'
  | 'donchianLow';

export interface Operand {
  kind: OperandKind;
  /** Main length. MACD uses it as the fast length. */
  period?: number;
  /** MACD slow length. */
  period2?: number;
  /** MACD signal length. */
  period3?: number;
  /** Band width in standard deviations (Bollinger). */
  mult?: number;
  /** Constant for kind 'value'. */
  value?: number;
  field?: PriceField;
}

export type Operator = 'crossesAbove' | 'crossesBelow' | 'above' | 'below';

export interface Condition {
  id: string;
  left: Operand;
  op: Operator;
  right: Operand;
}

export interface RuleGroup {
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

export type StopType = 'none' | 'pips' | 'atr' | 'percent';
export type TakeProfitType = 'none' | 'rr' | 'pips' | 'atr' | 'percent';

export interface ExitConfig {
  stopLoss: { type: StopType; value: number };
  takeProfit: { type: TakeProfitType; value: number };
  trailing: { enabled: boolean; type: 'atr' | 'pips'; value: number };
  /** Close after this many bars. 0 turns it off. */
  timeExitBars: number;
  /** Close (and reverse when allowed) on the opposite entry signal. */
  exitOnOpposite: boolean;
  /** Extra exit rules, true means close whatever is open. */
  exitRules: RuleGroup;
}

export type SizingMode = 'risk' | 'fixedLot';

export interface Strategy {
  id: string;
  name: string;
  instrument: string;
  timeframe: Timeframe;
  period: PeriodKey;
  direction: Direction;
  longEntry: RuleGroup;
  shortEntry: RuleGroup;
  exit: ExitConfig;
  sizing: { mode: SizingMode; riskPct: number; lots: number; maxLots: number };
  capital: number;
  costs: { spreadPips: number; commissionPerLot: number; slippagePips: number };
  updatedAt?: string;
}

export type ExitReason = 'stop' | 'target' | 'trailing' | 'time' | 'opposite' | 'rule' | 'end';

export interface Trade {
  id: number;
  dir: 1 | -1;
  entryIdx: number;
  exitIdx: number;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  lots: number;
  pnl: number;
  /** pnl as % of the balance when the trade opened. */
  pnlPct: number;
  pips: number;
  /** pnl divided by the money risked at the stop. null when the trade had no stop. */
  r: number | null;
  bars: number;
  reason: ExitReason;
  stopPrice?: number;
  targetPrice?: number;
}

export interface Metrics {
  netProfit: number;
  returnPct: number;
  cagr: number;
  maxDrawdownPct: number;
  maxDrawdownBars: number;
  maxDrawdownMoney: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  volatilityPct: number;
  trades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  payoff: number;
  expectancy: number;
  avgR: number | null;
  best: number;
  worst: number;
  maxConsecWins: number;
  maxConsecLosses: number;
  avgBars: number;
  exposurePct: number;
  recoveryFactor: number;
  grossProfit: number;
  grossLoss: number;
  longTrades: number;
  shortTrades: number;
  longNet: number;
  shortNet: number;
  longWinRate: number;
  shortWinRate: number;
}

export interface BacktestResult {
  strategy: Strategy;
  bars: Bar[];
  trades: Trade[];
  /** Equity at the close of every bar. */
  equity: number[];
  drawdown: number[];
  metrics: Metrics;
  buyHoldPct: number;
  buyHoldEquity: number[];
  monthly: { key: string; year: number; month: number; ret: number }[];
  exitReasons: Record<ExitReason, number>;
  blown: boolean;
  years: number;
  barsPerYear: number;
}
