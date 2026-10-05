import { PortfolioTrade } from '../../types';
import { EquityPoint, ACCOUNT_SERIES, PORTFOLIO_NOW, DAY } from '../../data/portfolioData';

export type Timeframe = '1W' | '2W' | '1M' | '3M' | 'ALL';
export const TF_DAYS: Record<Timeframe, number> = { '1W': 7, '2W': 14, '1M': 30, '3M': 90, ALL: 9999 };

export const isClosed = (t: PortfolioTrade) => t.isRealized && !!t.closedAt;
export const closedMs = (t: PortfolioTrade) => (t.closedAt ? Date.parse(t.closedAt) : 0);
export const rOf = (t: PortfolioTrade) => (t.outcome === 'win' ? t.riskRewardRatio ?? 1 : t.outcome === 'loss' ? -1 : 0);
export const durationH = (t: PortfolioTrade) =>
  t.closedAt ? (Date.parse(t.closedAt) - Date.parse(t.openedAt)) / 3600000 : (PORTFOLIO_NOW - Date.parse(t.openedAt)) / 3600000;

/** Sum equity across the chosen accounts (all of them when ids is empty). */
export function totalSeries(accountIds: string[]): EquityPoint[] {
  const ids = accountIds.length ? accountIds : Object.keys(ACCOUNT_SERIES);
  const base = ACCOUNT_SERIES[ids[0]];
  return base.map((p, i) => ({
    date: p.date,
    value: Math.round(ids.reduce((a, id) => a + ACCOUNT_SERIES[id][i].value, 0) * 100) / 100,
  }));
}

export function sliceSeries(series: EquityPoint[], days: number, maxDays: number): EquityPoint[] {
  const d = Math.min(days, maxDays);
  return series.slice(Math.max(0, series.length - 1 - d));
}

export function drawdownSeries(series: EquityPoint[]): { date: string; dd: number }[] {
  let peak = -Infinity;
  return series.map((p) => {
    peak = Math.max(peak, p.value);
    return { date: p.date, dd: peak > 0 ? ((p.value - peak) / peak) * 100 : 0 };
  });
}

export const maxDrawdown = (series: EquityPoint[]) => Math.abs(Math.min(0, ...drawdownSeries(series).map((d) => d.dd)));
export const currentDrawdown = (series: EquityPoint[]) => {
  const dd = drawdownSeries(series);
  return Math.abs(dd[dd.length - 1]?.dd ?? 0);
};

export interface TradeStats {
  closed: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  realized: number;
  grossWin: number;
  grossLoss: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  avgR: number;
  expectancy: number;
  best?: PortfolioTrade;
  worst?: PortfolioTrade;
  streak: { type: 'win' | 'loss' | 'none'; n: number };
}

export function tradeStats(trades: PortfolioTrade[]): TradeStats {
  const closed = trades.filter(isClosed);
  const wins = closed.filter((t) => t.outcome === 'win');
  const losses = closed.filter((t) => t.outcome === 'loss');
  const grossWin = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
  const decided = wins.length + losses.length;
  const sorted = [...closed].sort((a, b) => closedMs(b) - closedMs(a));
  let streakType: 'win' | 'loss' | 'none' = 'none';
  let n = 0;
  for (const t of sorted) {
    if (t.outcome === 'neutral') break;
    if (streakType === 'none') {
      streakType = t.outcome === 'win' ? 'win' : 'loss';
      n = 1;
    } else if ((t.outcome === 'win') === (streakType === 'win')) n++;
    else break;
  }
  return {
    closed: closed.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: closed.length - decided,
    winRate: decided ? (wins.length / decided) * 100 : 0,
    realized: closed.reduce((a, t) => a + t.pnl, 0),
    grossWin,
    grossLoss,
    profitFactor: grossLoss ? grossWin / grossLoss : grossWin ? 99 : 0,
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    avgR: closed.length ? closed.reduce((a, t) => a + rOf(t), 0) / closed.length : 0,
    expectancy: closed.length ? closed.reduce((a, t) => a + t.pnl, 0) / closed.length : 0,
    best: [...closed].sort((a, b) => b.pnl - a.pnl)[0],
    worst: [...closed].sort((a, b) => a.pnl - b.pnl)[0],
    streak: { type: streakType, n },
  };
}

export const tradesInRange = (trades: PortfolioTrade[], days: number) => {
  const cutoff = PORTFOLIO_NOW - days * DAY;
  return trades.filter((t) => (isClosed(t) ? closedMs(t) >= cutoff : Date.parse(t.openedAt) >= cutoff));
};

export function groupPnl(trades: PortfolioTrade[], key: (t: PortfolioTrade) => string) {
  const map = new Map<string, { name: string; pnl: number; count: number; wins: number; r: number }>();
  trades.filter(isClosed).forEach((t) => {
    const k = key(t) || 'Untagged';
    const row = map.get(k) || { name: k, pnl: 0, count: 0, wins: 0, r: 0 };
    row.pnl += t.pnl;
    row.count += 1;
    row.wins += t.outcome === 'win' ? 1 : 0;
    row.r += rOf(t);
    map.set(k, row);
  });
  return Array.from(map.values()).sort((a, b) => b.pnl - a.pnl);
}

export function dailyPnl(trades: PortfolioTrade[]): Record<string, number> {
  const out: Record<string, number> = {};
  trades.filter(isClosed).forEach((t) => {
    const k = (t.closedAt as string).slice(0, 10);
    out[k] = (out[k] || 0) + t.pnl;
  });
  return out;
}

export interface SmartAlert {
  id: string;
  tone: 'warning' | 'positive' | 'info';
  text: string;
}

export function smartAlerts(trades: PortfolioTrade[], series: EquityPoint[], ddLimit: number): SmartAlert[] {
  const out: SmartAlert[] = [];
  const closed = [...trades.filter(isClosed)].sort((a, b) => closedMs(b) - closedMs(a));
  let lossRun = 0;
  for (const t of closed) {
    if (t.outcome === 'loss') lossRun++;
    else break;
  }
  if (lossRun >= 2) out.push({ id: 'loss-run', tone: 'warning', text: `${lossRun} consecutive losses detected, review your strategy?` });

  const cutoff = PORTFOLIO_NOW - 14 * DAY;
  const prevCutoff = PORTFOLIO_NOW - 28 * DAY;
  const byClass = new Map<string, number>();
  const prevByClass = new Map<string, number>();
  const curCount = new Map<string, number>();
  closed.forEach((t) => {
    const ms = closedMs(t);
    if (ms >= cutoff) curCount.set(t.assetClass, (curCount.get(t.assetClass) || 0) + 1);
    if (ms >= cutoff) byClass.set(t.assetClass, (byClass.get(t.assetClass) || 0) + t.pnl);
    else if (ms >= prevCutoff) prevByClass.set(t.assetClass, (prevByClass.get(t.assetClass) || 0) + t.pnl);
  });
  new Set([...byClass.keys(), ...prevByClass.keys()]).forEach((k) => {
    const cur = byClass.get(k) || 0;
    const prev = prevByClass.get(k) || 0;
    if (!curCount.get(k)) return;
    if (prev > 50 && cur < prev * 0.8) {
      out.push({ id: `drop-${k}`, tone: 'warning', text: `${k} P&L dropped ${Math.round(((prev - cur) / prev) * 100)}% versus the previous 14 days. Consider rebalancing?` });
    } else if (cur < -150) {
      out.push({ id: `class-${k}`, tone: 'warning', text: `${k} P&L is -$${Math.abs(cur).toFixed(0)} over the last 14 days. Consider rebalancing?` });
    }
  });

  const cur = currentDrawdown(series);
  if (ddLimit > 0 && cur >= ddLimit * 0.75) {
    out.push({ id: 'dd', tone: 'warning', text: `Drawdown is ${cur.toFixed(1)}%, close to your ${ddLimit}% limit.` });
  }
  const s = tradeStats(trades);
  if (s.streak.type === 'win' && s.streak.n >= 3) out.push({ id: 'win-run', tone: 'positive', text: `You are on a ${s.streak.n}-trade win streak. Keep your sizing consistent.` });
  if (!out.length) out.push({ id: 'ok', tone: 'info', text: 'No warnings right now. Your portfolio is inside its limits.' });
  return out;
}

export function parseCsv(text: string): { rows: Record<string, string>[]; error?: string } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], error: 'Add a header row and at least one trade.' };
  const split = (line: string) => {
    const cells: string[] = [];
    let cur = '';
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) {
        cells.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const need = ['symbol', 'direction', 'entry', 'size'];
  const missing = need.filter((n) => !header.includes(n));
  if (missing.length) return { rows: [], error: `Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}` };
  const rows = lines.slice(1).map((l) => {
    const c = split(l);
    const r: Record<string, string> = {};
    header.forEach((h, i) => (r[h] = c[i] ?? ''));
    return r;
  });
  return { rows };
}

import { PortfolioGoal2 } from '../../data/portfolioData';

export interface GoalProgress {
  current: number;
  progress: number; // 0..1
  status: 'On track' | 'Behind' | 'Reached' | 'Safe' | 'Watch' | 'Breached';
  tone: 'good' | 'warn' | 'bad';
  detail: string;
}

export function goalProgress(goal: PortfolioGoal2, series: EquityPoint[]): GoalProgress {
  if (goal.type === 'growth') {
    const current = series[series.length - 1]?.value ?? 0;
    const start = goal.startBalance ?? series[0]?.value ?? 0;
    const span = goal.target - start;
    const progress = span > 0 ? Math.max(0, Math.min(1, (current - start) / span)) : current >= goal.target ? 1 : 0;
    if (current >= goal.target) return { current, progress: 1, status: 'Reached', tone: 'good', detail: 'Goal reached.' };
    let status: GoalProgress['status'] = 'On track';
    let detail = `${(goal.target - current).toLocaleString(undefined, { maximumFractionDigits: 0 })} to go`;
    if (goal.deadline) {
      const t0 = Date.parse(`${goal.startDate ?? series[0].date}T00:00:00Z`);
      const t1 = Date.parse(`${goal.deadline}T00:00:00Z`);
      const elapsed = Math.max(0, Math.min(1, (PORTFOLIO_NOW - t0) / Math.max(1, t1 - t0)));
      status = progress >= elapsed * 0.9 ? 'On track' : 'Behind';
      const daysLeft = Math.max(0, Math.ceil((t1 - PORTFOLIO_NOW) / DAY));
      detail += ` · ${daysLeft} days left`;
    }
    return { current, progress, status, tone: status === 'On track' ? 'good' : 'warn', detail };
  }
  const current = maxDrawdown(series);
  const used = goal.target ? current / goal.target : 0;
  const status: GoalProgress['status'] = used >= 1 ? 'Breached' : used >= 0.75 ? 'Watch' : 'Safe';
  return {
    current,
    progress: Math.max(0, Math.min(1, used)),
    status,
    tone: status === 'Safe' ? 'good' : status === 'Watch' ? 'warn' : 'bad',
    detail: `Max drawdown ${current.toFixed(1)}% of ${goal.target}% allowed`,
  };
}

export interface Achievement {
  id: string;
  title: string;
  detail: string;
  date?: string;
}

export function achievements(series: EquityPoint[], trades: PortfolioTrade[]): Achievement[] {
  const out: Achievement[] = [];
  let peak = -Infinity;
  let peakDate = '';
  series.forEach((p) => {
    if (p.value >= peak) {
      peak = p.value;
      peakDate = p.date;
    }
  });
  const last = series[series.length - 1];
  if (last && last.date === peakDate) out.push({ id: 'high', title: 'New equity high', detail: `$${peak.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, date: peakDate });
  else if (peakDate) out.push({ id: 'high', title: 'Equity high', detail: `$${peak.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, date: peakDate });

  const milestones = [15000, 16000, 17000, 18000, 19000];
  milestones.forEach((m) => {
    const hit = series.find((p) => p.value >= m);
    if (hit) out.push({ id: `m${m}`, title: `Reached $${m.toLocaleString()}`, detail: 'Balance milestone', date: hit.date });
  });

  const closed = trades.filter(isClosed).sort((a, b) => closedMs(a) - closedMs(b));
  let run = 0;
  let best = 0;
  closed.forEach((t) => {
    run = t.outcome === 'win' ? run + 1 : 0;
    best = Math.max(best, run);
  });
  if (best >= 3) out.push({ id: 'streak', title: `${best}-trade win streak`, detail: 'Longest run in your history' });
  const day = Object.entries(dailyPnl(trades)).sort((a, b) => b[1] - a[1])[0];
  if (day) out.push({ id: 'day', title: 'Best day', detail: `+$${day[1].toFixed(0)}`, date: day[0] });
  if (closed.length >= 25) out.push({ id: 'logged', title: `${closed.length} trades tracked`, detail: 'Your sample is big enough to learn from' });
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6);
}
