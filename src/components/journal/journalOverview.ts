import { Broker, JournalEntry } from '../../types';
import { eligible, realized, metrics, currencyOf } from './journalMath';

export type PnlMode = 'gross' | 'net';
export type RangeMode = 'month' | 'last7' | 'last30' | 'all' | 'custom';

export const entryPnl = (e: JournalEntry, mode: PnlMode) => eligible(e, mode) ? (mode === 'net' ? e.pnl - (e.commission ?? 0) : e.pnl) : 0;
export const isRealized = realized;
export const realizedEntries = (entries: JournalEntry[]) => entries.filter(isRealized);

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
  realizedCount: number;
  pnl: number;
  winRate: number | null;
  profitFactor: number | null; // null = no losing trades
  avgR: number | null;
  plan: number | null;
}

export function computeKpis(entries: JournalEntry[], mode: PnlMode): Kpis {
  const m = metrics(entries, mode);
  return {
    count: entries.length,
    realizedCount: m.n, pnl: m.total,
    winRate: m.winRate === null ? null : Math.round(m.winRate * 10) / 10,
    profitFactor: m.pf, avgR: m.avgR, plan: m.plan,
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
  if (!realized(e)) return 0;
  if (e.cashback !== undefined) return e.cashback;
  const b = e.brokerId ? brokers.get(e.brokerId) : undefined;
  if (!b || b.hasCashback === false || !LOT_CLASSES.includes(e.assetClass) || (e.quantityUnit && !/^lots?$/i.test(e.quantityUnit))) return 0;
  return Math.round(b.cashbackPerLot * e.size * 100) / 100;
};

/** MarketSyde Points: base points per lot by asset class (from the Points & Credits guide); estimate, before level boosters. */
const POINTS_PER_LOT: Record<string, number> = { Forex: 50, Indices: 60, Commodity: 55, Crypto: 60 };
export const entryPoints = (e: JournalEntry) => realized(e) && (!e.quantityUnit || /^lots?$/i.test(e.quantityUnit)) ? Math.round(e.size * (POINTS_PER_LOT[e.assetClass] || 0)) : 0;

export const entryValue = (e: JournalEntry, mode: PnlMode, cb: CashbackMode, brokers: Map<string, Broker>) => {
  if (cb === 'points') return entryPoints(e);
  const base = entryPnl(e, mode);
  return cb === 'include' && currencyOf(e)==='USD' ? base + entryCashback(e, brokers) : base;
};
