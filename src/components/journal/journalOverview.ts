import { Broker, JournalEntry } from '../../types';

export type PnlMode = 'gross' | 'net';
export type RangeMode = 'month' | 'last7' | 'last30' | 'all' | 'custom';

export const entryPnl = (e: JournalEntry, mode: PnlMode) => (mode === 'net' ? e.pnl - (e.commission ?? 0) : e.pnl);

const pad = (n: number) => String(n).padStart(2, '0');

export const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const addMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

export const monthBounds = (ym: string): [string, string] => {
  const [y, m] = ym.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [`${ym}-01`, `${ym}-${pad(last)}`];
};

/** Leading nulls pad the first week (Sunday start) so the grid lines up with weekday headers. */
export const monthCells = (ym: string): (string | null)[] => {
  const [first, last] = monthBounds(ym);
  const lead = new Date(`${first}T00:00:00Z`).getUTCDay();
  const days = Number(last.slice(8));
  return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${ym}-${pad(i + 1)}`)];
};

export const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const shortDate = (iso: string, withYear = false) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: withYear ? 'numeric' : undefined, timeZone: 'UTC' });

export function rangeBounds(
  mode: RangeMode,
  calMonth: string,
  today: string,
  custom: { from: string; to: string }
): [string, string] {
  switch (mode) {
    case 'month': return monthBounds(calMonth);
    case 'last7': return [addDays(today, -6), today];
    case 'last30': return [addDays(today, -29), today];
    case 'custom': return custom.from <= custom.to ? [custom.from, custom.to] : [custom.to, custom.from];
    default: return ['0000-01-01', '9999-12-31'];
  }
}

export interface Kpis {
  count: number;
  pnl: number;
  winRate: number;
  profitFactor: number | null; // null = no losing trades
  avgR: number;
  plan: number;
}

export function computeKpis(entries: JournalEntry[], mode: PnlMode): Kpis {
  const decided = entries.filter((e) => e.outcome === 'win' || e.outcome === 'loss');
  const wins = decided.filter((e) => e.outcome === 'win').length;
  const pnls = entries.map((e) => entryPnl(e, mode));
  const grossWin = pnls.filter((p) => p > 0).reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(pnls.filter((p) => p < 0).reduce((a, b) => a + b, 0));
  const rs = entries.map((e) => e.rMultiple).filter((r): r is number => r !== null);
  return {
    count: entries.length,
    pnl: Math.round(pnls.reduce((a, b) => a + b, 0) * 100) / 100,
    winRate: decided.length ? Math.round((wins / decided.length) * 100) : 0,
    profitFactor: grossLoss > 0 ? Math.round((grossWin / grossLoss) * 100) / 100 : null,
    avgR: rs.length ? Math.round((rs.reduce((a, b) => a + b, 0) / rs.length) * 10) / 10 : 0,
    plan: entries.length ? Math.round((entries.filter((e) => e.followedPlan).length / entries.length) * 100) : 0,
  };
}

export type CashbackMode = 'off' | 'include' | 'points';
export const UNASSIGNED = 'none';

/** Fixed categorical order (validated chart palette); a broker keeps its colour whatever is filtered. */
const BROKER_PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#4a3aa7', '#e87ba4', '#eda100', '#008300', '#e34948'];
export const brokerColor = (id: string | undefined, order: string[]) => {
  if (!id || id === UNASSIGNED) return '#94a3b8';
  const i = order.indexOf(id);
  return BROKER_PALETTE[(i < 0 ? 0 : i) % BROKER_PALETTE.length];
};

const LOT_CLASSES = ['Forex', 'Commodity', 'Indices'];

/** Cashback in USD: the stored amount, else the broker's rate per lot x lots (lot-based asset classes only). */
export const entryCashback = (e: JournalEntry, brokers: Map<string, Broker>) => {
  if (e.cashback !== undefined) return e.cashback;
  const b = e.brokerId ? brokers.get(e.brokerId) : undefined;
  if (!b || b.hasCashback === false || !LOT_CLASSES.includes(e.assetClass)) return 0;
  return Math.round(b.cashbackPerLot * e.size * 100) / 100;
};

/** MarketSyde Points: base points per lot by asset class (from the Points & Credits guide); estimate, before level boosters. */
const POINTS_PER_LOT: Record<string, number> = { Forex: 50, Indices: 60, Commodity: 55, Crypto: 60 };
export const entryPoints = (e: JournalEntry) => Math.round(e.size * (POINTS_PER_LOT[e.assetClass] || 0));

export const entryValue = (e: JournalEntry, mode: PnlMode, cb: CashbackMode, brokers: Map<string, Broker>) => {
  if (cb === 'points') return entryPoints(e);
  const base = entryPnl(e, mode);
  return cb === 'include' ? base + entryCashback(e, brokers) : base;
};
