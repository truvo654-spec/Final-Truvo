// Performance metrics, using the definitions in docs/BACKTESTING.md.
import { BREAKEVEN_R } from './config';

export interface MetricTrade { entryTime: number; exitTime: number; net: number; r: number | null }

export interface Metrics {
  trades: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number; // 0–1, wins ÷ all trades
  lossRate: number;
  grossProfit: number;
  grossLoss: number; // negative
  profitFactor: number | null; // null = no losing trades
  avgWin: number;
  avgLoss: number; // negative
  expectancy: number; // account currency per trade
  avgR: number;
  netPnl: number;
  netPct: number;
  endBalance: number;
  maxDD: number; // account currency, positive
  maxDDPct: number; // 0–1
  sharpe: number | null;
  sortino: number | null;
  calmar: number | null;
  annualReturn: number;
  longestWinStreak: number;
  longestLossStreak: number;
  avgHoldMin: number;
  days: number;
}

export type Outcome = 'win' | 'loss' | 'breakeven';
export const outcomeOf = (t: { net: number; r: number | null }): Outcome => {
  if (t.r !== null && Number.isFinite(t.r) && Math.abs(t.r) < BREAKEVEN_R) return 'breakeven';
  return t.net > 0 ? 'win' : t.net < 0 ? 'loss' : 'breakeven';
};

const DAY = 86400000;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Largest peak-to-trough fall of a balance path that starts at `start`. */
export function maxDrawdown(start: number, pnls: number[]): { dd: number; ddPct: number } {
  let eq = start, peak = start, dd = 0, ddPct = 0;
  for (const p of pnls) {
    eq += p;
    if (eq > peak) peak = eq;
    const d = peak - eq;
    if (d > dd) dd = d;
    if (peak > 0 && d / peak > ddPct) ddPct = d / peak;
  }
  return { dd, ddPct };
}

export function computeMetrics(list: MetricTrade[], startBalance: number, rangeStart?: number, rangeEnd?: number): Metrics {
  const trades = [...list].sort((a, b) => a.exitTime - b.exitTime);
  const n = trades.length;
  const outs = trades.map(outcomeOf);
  const winsL = trades.filter((_, i) => outs[i] === 'win');
  const lossL = trades.filter((_, i) => outs[i] === 'loss');
  const grossProfit = trades.filter((t) => t.net > 0).reduce((a, t) => a + t.net, 0);
  const grossLoss = trades.filter((t) => t.net < 0).reduce((a, t) => a + t.net, 0);
  const winRate = n ? winsL.length / n : 0;
  const lossRate = n ? lossL.length / n : 0;
  const avgWin = mean(winsL.map((t) => t.net));
  const avgLoss = mean(lossL.map((t) => t.net));
  const rs = trades.map((t) => t.r).filter((r): r is number => r !== null && Number.isFinite(r));
  const netPnl = trades.reduce((a, t) => a + t.net, 0);
  const { dd, ddPct } = maxDrawdown(startBalance, trades.map((t) => t.net));

  // Daily returns: weekdays in the range, plus any weekend day with a closed trade.
  const start = rangeStart ?? (n ? Math.min(...trades.map((t) => t.entryTime)) : 0);
  const end = rangeEnd ?? (n ? Math.max(...trades.map((t) => t.exitTime)) : 0);
  const byDay = new Map<number, number>();
  trades.forEach((t) => { const d = Math.floor(t.exitTime / DAY); byDay.set(d, (byDay.get(d) || 0) + t.net); });
  const rets: number[] = [];
  let eq = startBalance;
  for (let d = Math.floor(start / DAY); d <= Math.floor((end - 1) / DAY); d++) {
    const pnl = byDay.get(d) || 0;
    const dow = new Date(d * DAY).getUTCDay();
    if ((dow === 0 || dow === 6) && pnl === 0) continue;
    rets.push(eq > 0 ? pnl / eq : 0);
    eq += pnl;
  }
  const mu = mean(rets);
  const sd = rets.length > 1 ? Math.sqrt(rets.reduce((a, r) => a + (r - mu) ** 2, 0) / (rets.length - 1)) : 0;
  const downside = rets.length ? Math.sqrt(rets.reduce((a, r) => a + Math.min(r, 0) ** 2, 0) / rets.length) : 0;
  const calDays = Math.max(1, (end - start) / DAY);
  const endBalance = startBalance + netPnl;
  const annualReturn = startBalance > 0 && endBalance > 0 ? (endBalance / startBalance) ** (365.25 / calDays) - 1 : -1;

  let ws = 0, ls = 0, bw = 0, bl = 0;
  outs.forEach((o) => {
    if (o === 'win') { ws++; ls = 0; } else if (o === 'loss') { ls++; ws = 0; } else { ws = 0; ls = 0; }
    bw = Math.max(bw, ws); bl = Math.max(bl, ls);
  });

  return {
    trades: n,
    wins: winsL.length,
    losses: lossL.length,
    breakevens: n - winsL.length - lossL.length,
    winRate, lossRate,
    grossProfit, grossLoss,
    profitFactor: grossLoss < 0 ? grossProfit / Math.abs(grossLoss) : null,
    avgWin, avgLoss,
    expectancy: winRate * avgWin - lossRate * Math.abs(avgLoss),
    avgR: mean(rs),
    netPnl,
    netPct: startBalance > 0 ? netPnl / startBalance : 0,
    endBalance,
    maxDD: dd,
    maxDDPct: ddPct,
    sharpe: sd > 0 ? (mu / sd) * Math.sqrt(252) : null,
    sortino: downside > 0 ? (mu / downside) * Math.sqrt(252) : null,
    calmar: ddPct > 0 ? annualReturn / ddPct : null,
    annualReturn,
    longestWinStreak: bw,
    longestLossStreak: bl,
    avgHoldMin: mean(trades.map((t) => (t.exitTime - t.entryTime) / 60000)),
    days: rets.length,
  };
}

// ── Breakdowns ──

export interface Bucket { key: string; label: string; n: number; net: number; winRate: number; avgR: number }

const fmtCache = new Map<string, Intl.DateTimeFormat>();
const parts = (t: number, tz: string) => {
  let f = fmtCache.get(tz);
  if (!f) { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23', weekday: 'short' }); fmtCache.set(tz, f); }
  const p = f.formatToParts(new Date(t));
  return { hour: Number(p.find((x) => x.type === 'hour')?.value ?? 0) % 24, weekday: p.find((x) => x.type === 'weekday')?.value ?? 'Mon' };
};

export const SESSION_BUCKETS = [
  { key: 'asia', label: 'Asia', from: 0, to: 7 },
  { key: 'london', label: 'London', from: 7, to: 12 },
  { key: 'overlap', label: 'London / NY overlap', from: 12, to: 16 },
  { key: 'ny', label: 'New York', from: 16, to: 21 },
  { key: 'late', label: 'After hours', from: 21, to: 24 },
];
export const sessionOfUtc = (t: number) => {
  const h = new Date(t).getUTCHours();
  return SESSION_BUCKETS.find((s) => h >= s.from && h < s.to)!.key;
};

export function breakdown(trades: (MetricTrade & { entryTime: number })[], by: 'hour' | 'weekday' | 'session', tz: string): Bucket[] {
  const keys: { key: string; label: string }[] =
    by === 'hour' ? Array.from({ length: 24 }, (_, h) => ({ key: String(h), label: `${String(h).padStart(2, '0')}:00` }))
    : by === 'weekday' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ key: d, label: d }))
    : SESSION_BUCKETS.map((s) => ({ key: s.key, label: s.label }));
  const keyOf = (t: MetricTrade) => (by === 'session' ? sessionOfUtc(t.entryTime) : by === 'hour' ? String(parts(t.entryTime, tz).hour) : parts(t.entryTime, tz).weekday);
  return keys.map(({ key, label }) => {
    const l = trades.filter((t) => keyOf(t) === key);
    const rs = l.map((t) => t.r).filter((r): r is number => r !== null);
    return { key, label, n: l.length, net: l.reduce((a, t) => a + t.net, 0), winRate: l.length ? l.filter((t) => outcomeOf(t) === 'win').length / l.length : 0, avgR: mean(rs) };
  });
}
