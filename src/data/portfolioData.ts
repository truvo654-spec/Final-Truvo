import { PortfolioTrade } from '../types';

/** Fixed "today" for the demo dataset (same day the Journal uses). */
export const PORTFOLIO_NOW = Date.parse('2026-10-05T04:00:00Z');
export const DAY = 86400000;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────────────────── Accounts ───────────────────────── */

export interface PortfolioAccount {
  id: string;
  name: string;
  kind: 'api' | 'manual';
  server?: string;
  lastSync: string;
  startBalance: number;
  endBalance: number;
  marginUsed: number;
  seed: number;
}

export const PORTFOLIO_ACCOUNTS: PortfolioAccount[] = [
  { id: 'acc_hfm', name: 'HFM', kind: 'api', server: 'HFMarkets-Live 4', lastSync: '2 minutes ago', startBalance: 7500, endBalance: 9120.4, marginUsed: 2150, seed: 11 },
  { id: 'acc_exness', name: 'Exness', kind: 'api', server: 'Exness-Real 12', lastSync: '6 minutes ago', startBalance: 5200, endBalance: 6980.1, marginUsed: 1290, seed: 23 },
  { id: 'acc_manual', name: 'Manual Log', kind: 'manual', lastSync: 'Updated by you', startBalance: 1500, endBalance: 2320, marginUsed: 0, seed: 37 },
];

/* ───────────────────────── Equity series ───────────────────────── */

export interface EquityPoint {
  date: string;
  value: number;
}

const SERIES_DAYS = 120;

function buildSeries(acc: PortfolioAccount): EquityPoint[] {
  const rnd = mulberry32(acc.seed);
  const n = SERIES_DAYS;
  const walk: number[] = [0];
  for (let i = 1; i <= n; i++) walk.push(walk[i - 1] + (rnd() - 0.5) * 2);
  const scale = acc.startBalance * 0.026;
  const out: EquityPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const bridge = walk[i] - (i / n) * walk[n];
    const jitter = i === 0 || i === n ? 0 : (rnd() - 0.5) * acc.startBalance * 0.012;
    const v = acc.startBalance + (acc.endBalance - acc.startBalance) * (i / n) + bridge * scale + jitter;
    const date = new Date(PORTFOLIO_NOW - (n - i) * DAY).toISOString().slice(0, 10);
    out.push({ date, value: Math.round(v * 100) / 100 });
  }
  return out;
}

export const ACCOUNT_SERIES: Record<string, EquityPoint[]> = Object.fromEntries(
  PORTFOLIO_ACCOUNTS.map((a) => [a.id, buildSeries(a)])
);

/* ───────────────────────── Trades ───────────────────────── */

const CORE_TRADES: PortfolioTrade[] = [
  { id: 'ptr_1', broker: 'HFM', inputMethod: 'api', assetClass: 'Forex', symbol: 'EUR/USD', direction: 'BUY', entryPrice: 1.0835, exitPrice: 1.091, size: 2.0, pnl: 150.0, isRealized: true, outcome: 'win', riskTag: 'low-risk', strategyTag: 'Swing', riskRewardRatio: 2.4, openedAt: '2026-09-22T09:14:00Z', closedAt: '2026-09-24T15:40:00Z' },
  { id: 'ptr_2', broker: 'HFM', inputMethod: 'api', assetClass: 'Commodity', symbol: 'XAU/USD', direction: 'BUY', entryPrice: 2612.4, exitPrice: null, size: 0.5, pnl: -42.1, isRealized: false, outcome: 'neutral', riskTag: 'high-risk', strategyTag: 'Breakout', openedAt: '2026-09-29T07:02:00Z', closedAt: null, analystNote: 'Entered on the real-yield breakdown flagged in the advisor commentary.', confidence: 84 },
  { id: 'ptr_3', broker: 'Exness', inputMethod: 'api', assetClass: 'Crypto', symbol: 'BTC/USDT', direction: 'SELL', entryPrice: 68420, exitPrice: 66180, size: 0.2, pnl: 448.0, isRealized: true, outcome: 'win', riskTag: 'high-reward', strategyTag: 'Scalping', riskRewardRatio: 3.1, openedAt: '2026-09-25T13:20:00Z', closedAt: '2026-09-25T18:05:00Z' },
  { id: 'ptr_4', broker: 'Manual Log', inputMethod: 'manual', assetClass: 'Indices', symbol: 'US500', direction: 'BUY', entryPrice: 5820, exitPrice: 5786, size: 1.0, pnl: -340.0, isRealized: true, outcome: 'loss', riskTag: 'high-risk', strategyTag: 'Day Trade', riskRewardRatio: 0.6, openedAt: '2026-09-21T14:00:00Z', closedAt: '2026-09-21T19:30:00Z' },
  { id: 'ptr_5', broker: 'Exness', inputMethod: 'api', assetClass: 'Crypto', symbol: 'ETH/USDT', direction: 'SELL', entryPrice: 2480, exitPrice: null, size: 1.5, pnl: -96.3, isRealized: false, outcome: 'neutral', riskTag: 'high-risk', strategyTag: 'Momentum', openedAt: '2026-09-30T05:40:00Z', closedAt: null },
  { id: 'ptr_6', broker: 'Manual Log', inputMethod: 'manual', assetClass: 'Forex', symbol: 'GBP/JPY', direction: 'SELL', entryPrice: 198.4, exitPrice: 196.9, size: 0.8, pnl: 212.5, isRealized: true, outcome: 'win', riskTag: 'low-risk', strategyTag: 'Swing', riskRewardRatio: 2.1, openedAt: '2026-09-18T08:00:00Z', closedAt: '2026-09-20T11:15:00Z' },
  { id: 'ptr_7', broker: 'HFM', inputMethod: 'api', assetClass: 'Forex', symbol: 'USD/CAD', direction: 'BUY', entryPrice: 1.364, exitPrice: 1.3585, size: 1.2, pnl: -198.0, isRealized: true, outcome: 'loss', riskTag: 'high-risk', strategyTag: 'Day Trade', riskRewardRatio: 0.8, openedAt: '2026-09-17T10:20:00Z', closedAt: '2026-09-17T16:45:00Z' },
  { id: 'ptr_9', broker: 'Exness', inputMethod: 'api', assetClass: 'Crypto', symbol: 'SOL/USDT', direction: 'BUY', entryPrice: 138.4, exitPrice: 146.2, size: 2.0, pnl: 186.4, isRealized: true, outcome: 'win', riskTag: 'high-reward', strategyTag: 'Momentum', riskRewardRatio: 2.2, openedAt: '2026-10-02T06:10:00Z', closedAt: '2026-10-03T09:30:00Z' },
  { id: 'ptr_10', broker: 'HFM', inputMethod: 'api', assetClass: 'Forex', symbol: 'GBP/USD', direction: 'SELL', entryPrice: 1.2712, exitPrice: 1.2761, size: 1.0, pnl: -92.0, isRealized: true, outcome: 'loss', riskTag: 'low-risk', strategyTag: 'Day Trade', riskRewardRatio: 0.7, openedAt: '2026-10-02T08:00:00Z', closedAt: '2026-10-02T13:45:00Z' },
  { id: 'ptr_11', broker: 'HFM', inputMethod: 'api', assetClass: 'Forex', symbol: 'USD/JPY', direction: 'BUY', entryPrice: 152.9, exitPrice: 153.8, size: 1.1, pnl: 141.6, isRealized: true, outcome: 'win', riskTag: 'low-risk', strategyTag: 'Swing', riskRewardRatio: 1.8, openedAt: '2026-09-30T02:30:00Z', closedAt: '2026-10-01T10:20:00Z' },
  { id: 'ptr_12', broker: 'Manual Log', inputMethod: 'manual', assetClass: 'Forex', symbol: 'EUR/USD', direction: 'SELL', entryPrice: 1.0912, exitPrice: 1.0881, size: 0.6, pnl: 64.0, isRealized: true, outcome: 'win', riskTag: 'low-risk', strategyTag: 'Swing', riskRewardRatio: 1.4, openedAt: '2026-09-30T09:00:00Z', closedAt: '2026-09-30T17:10:00Z' },
  { id: 'ptr_8', broker: 'Exness', inputMethod: 'api', assetClass: 'Stocks', symbol: 'NVDA', direction: 'BUY', entryPrice: 118.2, exitPrice: null, size: 10, pnl: 64.0, isRealized: false, outcome: 'neutral', riskTag: 'low-risk', strategyTag: 'Position', openedAt: '2026-09-27T14:00:00Z', closedAt: null },
];

type Sym = { s: string; a: PortfolioTrade['assetClass']; p: number; dec: number; accts: string[] };
const SYMS: Sym[] = [
  { s: 'EUR/USD', a: 'Forex', p: 1.085, dec: 4, accts: ['HFM', 'Manual Log'] },
  { s: 'GBP/USD', a: 'Forex', p: 1.27, dec: 4, accts: ['HFM'] },
  { s: 'USD/JPY', a: 'Forex', p: 153.2, dec: 2, accts: ['HFM', 'Manual Log'] },
  { s: 'AUD/USD', a: 'Forex', p: 0.662, dec: 4, accts: ['HFM'] },
  { s: 'XAU/USD', a: 'Commodity', p: 2590, dec: 1, accts: ['HFM'] },
  { s: 'WTI/USD', a: 'Commodity', p: 78.4, dec: 2, accts: ['HFM'] },
  { s: 'BTC/USDT', a: 'Crypto', p: 66500, dec: 0, accts: ['Exness'] },
  { s: 'ETH/USDT', a: 'Crypto', p: 2450, dec: 0, accts: ['Exness'] },
  { s: 'SOL/USDT', a: 'Crypto', p: 142, dec: 2, accts: ['Exness'] },
  { s: 'US500', a: 'Indices', p: 5790, dec: 0, accts: ['HFM', 'Manual Log'] },
  { s: 'NAS100', a: 'Indices', p: 20150, dec: 0, accts: ['HFM'] },
  { s: 'NVDA', a: 'Stocks', p: 121, dec: 2, accts: ['Exness', 'Manual Log'] },
  { s: 'AAPL', a: 'Stocks', p: 231, dec: 2, accts: ['Exness'] },
  { s: 'TSLA', a: 'Stocks', p: 332, dec: 2, accts: ['Exness'] },
];
const STRATS = ['Swing', 'Breakout', 'Scalping', 'Day Trade', 'Momentum', 'Position'];
const NOTES = [
  'Imported from a MarketSyde signal.',
  'Entered after the economic calendar flagged the release.',
  'Advisor commentary supported the setup.',
];

function generateTrades(): PortfolioTrade[] {
  const rnd = mulberry32(2026);
  const out: PortfolioTrade[] = [];
  const total = 38;
  for (let i = 0; i < total; i++) {
    const sym = SYMS[Math.floor(rnd() * SYMS.length)];
    const broker = sym.accts[Math.floor(rnd() * sym.accts.length)];
    const win = rnd() < 0.58;
    const dir: 'BUY' | 'SELL' = rnd() < 0.5 ? 'BUY' : 'SELL';
    const dayOff = 20 + Math.floor((i / total) * 98) + Math.floor(rnd() * 3);
    const durH = win ? 2 + rnd() * 68 : 1 + rnd() * 38;
    const closed = PORTFOLIO_NOW - dayOff * DAY + Math.floor(rnd() * 10) * 3600000;
    const opened = closed - durH * 3600000;
    const pnl = win ? Math.round((60 + rnd() * 380) * 100) / 100 : -Math.round((40 + rnd() * 240) * 100) / 100;
    const entry = sym.p * (1 + (rnd() - 0.5) * 0.02);
    const move = (0.002 + rnd() * 0.009) * (win ? 1 : -1) * (dir === 'BUY' ? 1 : -1);
    const exit = entry * (1 + move);
    const rr = win ? Math.round((1.1 + rnd() * 2.3) * 10) / 10 : Math.round((0.4 + rnd() * 0.5) * 10) / 10;
    const risk: PortfolioTrade['riskTag'] = pnl > 280 ? 'high-reward' : pnl < -170 ? 'high-risk' : rnd() < 0.5 ? 'low-risk' : undefined;
    out.push({
      id: `ptr_g${i + 1}`,
      broker,
      inputMethod: broker === 'Manual Log' ? 'manual' : 'api',
      assetClass: sym.a,
      symbol: sym.s,
      direction: dir,
      entryPrice: Number(entry.toFixed(sym.dec)),
      exitPrice: Number(exit.toFixed(sym.dec)),
      size: Math.round((0.2 + rnd() * 2.2) * 10) / 10,
      pnl,
      isRealized: true,
      outcome: win ? 'win' : 'loss',
      riskTag: risk,
      strategyTag: STRATS[Math.floor(rnd() * STRATS.length)],
      riskRewardRatio: rr,
      openedAt: new Date(opened).toISOString(),
      closedAt: new Date(closed).toISOString(),
      analystNote: undefined,
    });
    if (rnd() < 0.34) {
      const last = out[out.length - 1];
      last.analystNote = NOTES[Math.floor(rnd() * NOTES.length)];
      last.confidence = Math.round(60 + rnd() * 34 + (win ? 4 : -4));
    }
  }
  return out;
}

export const PORTFOLIO_TRADES: PortfolioTrade[] = [...CORE_TRADES, ...generateTrades()].sort((a, b) =>
  b.openedAt.localeCompare(a.openedAt)
);

/* ───────────────────────── Goals ───────────────────────── */

export interface PortfolioGoal2 {
  id: string;
  type: 'growth' | 'drawdown';
  label: string;
  target: number; // $ for growth, % for drawdown
  deadline?: string;
  startBalance?: number;
  startDate?: string;
}

export const DEFAULT_GOALS: PortfolioGoal2[] = [
  { id: 'goal_growth', type: 'growth', label: 'Grow the account to $20,000', target: 20000, deadline: '2026-12-31', startBalance: 14200, startDate: '2026-06-07' },
  { id: 'goal_dd', type: 'drawdown', label: 'Keep max drawdown under 10%', target: 10 },
];

/* ───────────────────────── Advisor / Broker demo data ───────────────────────── */

export interface ClientRow {
  id: string;
  name: string;
  color: string;
  returnPct: number;
  winRate: number;
  drawdown: number;
  risk: 'Low' | 'Medium' | 'High';
  assets: string[];
  balance: number;
  active: string;
  seed: number;
}

export const CLIENTS: ClientRow[] = [
  { id: 'cl_1', name: 'Macro Alpha', color: '#5338ec', returnPct: 14.2, winRate: 63, drawdown: 4.1, risk: 'Low', assets: ['Forex', 'Commodity'], balance: 24100, active: '12 min ago', seed: 3 },
  { id: 'cl_2', name: 'Volatix Trader', color: '#FD02B0', returnPct: 22.8, winRate: 54, drawdown: 11.6, risk: 'High', assets: ['Crypto'], balance: 9800, active: '1 h ago', seed: 5 },
  { id: 'cl_3', name: 'Golden Cross', color: '#0d9488', returnPct: -3.4, winRate: 41, drawdown: 9.8, risk: 'Medium', assets: ['Indices', 'Stocks'], balance: 6200, active: 'Yesterday', seed: 7 },
  { id: 'cl_4', name: 'Pip Hunter', color: '#8d6a1f', returnPct: 6.7, winRate: 58, drawdown: 5.2, risk: 'Low', assets: ['Forex'], balance: 15300, active: '3 h ago', seed: 9 },
  { id: 'cl_5', name: 'Nina Park', color: '#be185d', returnPct: 0.4, winRate: 49, drawdown: 7.3, risk: 'Medium', assets: ['Forex', 'Indices'], balance: 4100, active: '2 days ago', seed: 12 },
  { id: 'cl_6', name: 'Arun Mehta', color: '#334155', returnPct: 9.9, winRate: 60, drawdown: 6.0, risk: 'Medium', assets: ['Stocks'], balance: 31800, active: '40 min ago', seed: 14 },
  { id: 'cl_7', name: 'Kai Tanaka', color: '#3410D5', returnPct: -8.9, winRate: 36, drawdown: 16.4, risk: 'High', assets: ['Crypto', 'Forex'], balance: 2700, active: '5 days ago', seed: 17 },
  { id: 'cl_8', name: 'Sari Wijaya', color: '#0ea5e9', returnPct: 11.5, winRate: 61, drawdown: 4.8, risk: 'Low', assets: ['Commodity'], balance: 12900, active: '1 h ago', seed: 19 },
  { id: 'cl_9', name: 'Lina Chen', color: '#CA8A04', returnPct: 3.1, winRate: 52, drawdown: 8.4, risk: 'Medium', assets: ['Indices'], balance: 7600, active: 'Yesterday', seed: 21 },
  { id: 'cl_10', name: 'Omar Haddad', color: '#16a34a', returnPct: 18.3, winRate: 57, drawdown: 12.9, risk: 'High', assets: ['Forex', 'Crypto'], balance: 18900, active: '25 min ago', seed: 25 },
];

export const WEEKLY_VOLUME = [3120, 3340, 3010, 3680, 3950, 3720, 4180, 4410, 4060, 4630, 4820, 4975];

export const COHORTS = [
  { label: 'Jul cohort', size: 412, retention: [100, 78, 66, 59, 54, 51] },
  { label: 'Aug cohort', size: 538, retention: [100, 81, 69, 62, 57] },
  { label: 'Sep cohort', size: 604, retention: [100, 84, 72, 66] },
  { label: 'Oct cohort', size: 191, retention: [100, 86] },
];

export const TOP_INSTRUMENTS = [
  { name: 'XAU/USD', lots: 1480 },
  { name: 'EUR/USD', lots: 1210 },
  { name: 'BTC/USDT', lots: 860 },
  { name: 'US500', lots: 620 },
  { name: 'USD/JPY', lots: 505 },
];

export const USER_PERFORMANCE = {
  medianReturn: [0.4, 0.9, 0.7, 1.4, 1.9, 1.6, 2.3, 2.8, 2.6, 3.4, 3.9, 4.2],
  profitableShare: 58,
  avgDrawdown: 7.1,
};
