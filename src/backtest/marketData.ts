// Market data: the provider interface the engine reads from, plus a seeded mock feed.
// The mock generates two years of 5-minute bars per symbol (deterministic per symbol) and
// aggregates them to 15m, 1h, 4h and 1D. Swap in a real feed (planned: Acuity) by
// implementing MarketDataProvider.
import { DATA_END, DATA_START } from './config';
import { MarketHours, Series, SymbolSpec, TF_MS, Timeframe } from './types';
import { hashSeed, normal, rng } from './rng';

export interface MarketDataProvider {
  name: string;
  symbols(): SymbolSpec[];
  getSeries(symbol: string, tf: Timeframe, fromMs: number, toMs: number): Promise<Series>;
}

export const SYMBOLS: SymbolSpec[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', assetClass: 'Forex', aliases: ['EURUSD'], tickSize: 0.00001, multiplier: 100000, sizeUnit: 'lots', minSize: 0.01, sizeStep: 0.01, costUnit: { label: 'pips', size: 0.0001 }, priceDp: 5, hours: 'fx', startPrice: 1.095, annualVol: 0.07 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', assetClass: 'Forex', aliases: ['GBPUSD'], tickSize: 0.00001, multiplier: 100000, sizeUnit: 'lots', minSize: 0.01, sizeStep: 0.01, costUnit: { label: 'pips', size: 0.0001 }, priceDp: 5, hours: 'fx', startPrice: 1.305, annualVol: 0.08 },
  { symbol: 'MNQ', name: 'Micro Nasdaq-100 futures', assetClass: 'Futures', aliases: ['NAS100', 'NQ', 'NQ1!', 'US100'], tickSize: 0.25, multiplier: 2, sizeUnit: 'contracts', minSize: 1, sizeStep: 1, costUnit: { label: 'ticks', size: 0.25 }, priceDp: 2, hours: 'cme', startPrice: 20100, annualVol: 0.21 },
  { symbol: 'MES', name: 'Micro S&P 500 futures', assetClass: 'Futures', aliases: ['US500', 'ES', 'ES1!', 'SPX500'], tickSize: 0.25, multiplier: 5, sizeUnit: 'contracts', minSize: 1, sizeStep: 1, costUnit: { label: 'ticks', size: 0.25 }, priceDp: 2, hours: 'cme', startPrice: 5750, annualVol: 0.16 },
  { symbol: 'MGC', name: 'Micro Gold futures', assetClass: 'Futures', aliases: ['XAU/USD', 'XAUUSD', 'GC', 'GOLD'], tickSize: 0.1, multiplier: 10, sizeUnit: 'contracts', minSize: 1, sizeStep: 1, costUnit: { label: 'ticks', size: 0.1 }, priceDp: 1, hours: 'cme', startPrice: 2660, annualVol: 0.15 },
  { symbol: 'BTC/USDT', name: 'Bitcoin / Tether', assetClass: 'Crypto', aliases: ['BTCUSDT', 'BTC-PERP'], tickSize: 0.01, multiplier: 1, sizeUnit: 'coins', minSize: 0.001, sizeStep: 0.001, costUnit: { label: 'USD', size: 1 }, priceDp: 2, hours: 'crypto', startPrice: 63000, annualVol: 0.5 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'Stocks', aliases: [], tickSize: 0.01, multiplier: 1, sizeUnit: 'shares', minSize: 1, sizeStep: 1, costUnit: { label: 'cents', size: 0.01 }, priceDp: 2, hours: 'us-stocks', startPrice: 122, annualVol: 0.48 },
];

export const symbolSpec = (symbol: string): SymbolSpec | undefined =>
  SYMBOLS.find((s) => s.symbol === symbol) || SYMBOLS.find((s) => s.aliases.includes(symbol));

/** Map a journal symbol (NAS100, XAU/USD…) to an instrument the feed has, if any. */
export const resolveSymbol = (journalSymbol: string): string | null => symbolSpec(journalSymbol)?.symbol ?? null;

export const dayMs = 86400000;
export const parseDay = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
export const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Is the market open for a bar starting at t (UTC)? */
export function isOpen(hours: MarketHours, t: number): boolean {
  const d = new Date(t);
  const dow = d.getUTCDay();
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
  switch (hours) {
    case 'crypto': return true;
    case 'fx':
      if (dow === 6) return false;
      if (dow === 0) return mins >= 22 * 60;
      if (dow === 5) return mins < 22 * 60;
      return true;
    case 'cme':
      if (dow === 6) return false;
      if (dow === 0) return mins >= 23 * 60;
      if (dow === 5) return mins < 22 * 60;
      return mins < 22 * 60 || mins >= 23 * 60;
    case 'us-stocks':
      if (dow === 0 || dow === 6) return false;
      return mins >= 13 * 60 + 30 && mins < 20 * 60;
  }
}

/** Relative activity by UTC hour, so sessions behave like real ones (quiet Asia, busy London/NY overlap). */
function hourFactor(hours: MarketHours, t: number): number {
  const d = new Date(t);
  const h = d.getUTCHours() + d.getUTCMinutes() / 60;
  if (hours === 'us-stocks') return h < 14.5 ? 1.7 : h >= 19 ? 1.2 : 0.85;
  if (hours === 'crypto') return h >= 13 && h < 17 ? 1.2 : h < 6 ? 0.8 : 1;
  if (h < 7) return 0.55;
  if (h < 12) return 1.1;
  if (h < 16) return 1.45;
  if (h < 21) return 0.9;
  return 0.5;
}

// ── News calendar (mock): NFP first Friday, CPI second Wednesday, FOMC eight Wednesdays a year ──

export interface NewsEvent { name: string; minuteUTC: number }

const nthWeekday = (y: number, m: number, weekday: number, n: number) => {
  const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const day = 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  return Date.UTC(y, m, day);
};

let newsCache: Map<string, NewsEvent[]> | null = null;
export function newsCalendar(): Map<string, NewsEvent[]> {
  if (newsCache) return newsCache;
  const m = new Map<string, NewsEvent[]>();
  const add = (t: number, ev: NewsEvent) => { const k = dayKey(t); m.set(k, [...(m.get(k) || []), ev]); };
  for (let y = 2024; y <= 2026; y++) {
    for (let mo = 0; mo < 12; mo++) {
      add(nthWeekday(y, mo, 5, 1), { name: 'US Non-Farm Payrolls', minuteUTC: 12 * 60 + 30 });
      add(nthWeekday(y, mo, 3, 2), { name: 'US CPI', minuteUTC: 12 * 60 + 30 });
      if ([0, 2, 4, 5, 6, 8, 10, 11].includes(mo)) add(nthWeekday(y, mo, 3, 3), { name: 'FOMC rate decision', minuteUTC: 18 * 60 });
    }
  }
  newsCache = m;
  return m;
}
export const isNewsDay = (t: number) => newsCalendar().has(dayKey(t));

// ── Series helpers ──

export function emptySeries(symbol: string, tf: Timeframe, n: number): Series {
  return { symbol, tf, length: n, t: new Float64Array(n), o: new Float64Array(n), h: new Float64Array(n), l: new Float64Array(n), c: new Float64Array(n), v: new Float64Array(n) };
}

export function seriesFromBars(symbol: string, tf: Timeframe, bars: { t: number; o: number; h: number; l: number; c: number; v: number }[]): Series {
  const s = emptySeries(symbol, tf, bars.length);
  bars.forEach((b, i) => { s.t[i] = b.t; s.o[i] = b.o; s.h[i] = b.h; s.l[i] = b.l; s.c[i] = b.c; s.v[i] = b.v; });
  return s;
}

const lowerBound = (arr: Float64Array, x: number) => {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] < x) lo = mid + 1; else hi = mid; }
  return lo;
};

/** Bars whose open time is in [fromMs, toMs). Returns views, no copy. */
export function sliceSeries(s: Series, fromMs: number, toMs: number): Series {
  const a = lowerBound(s.t, fromMs);
  const b = lowerBound(s.t, toMs);
  return { symbol: s.symbol, tf: s.tf, length: b - a, t: s.t.subarray(a, b), o: s.o.subarray(a, b), h: s.h.subarray(a, b), l: s.l.subarray(a, b), c: s.c.subarray(a, b), v: s.v.subarray(a, b) };
}

const roundTo = (x: number, tick: number) => Math.round(x / tick) * tick;

/** Generate seeded 5-minute bars for one symbol across the mock data range. */
export function generateBaseSeries(spec: SymbolSpec): Series {
  const start = parseDay(DATA_START);
  const end = parseDay(DATA_END) + dayMs;
  const step = TF_MS['5m'];
  const r = rng(hashSeed(spec.symbol));
  const barsPerYear = spec.hours === 'crypto' ? 365 * 288 : spec.hours === 'us-stocks' ? 252 * 78 : 260 * 280;
  const sigmaBar = spec.annualVol / Math.sqrt(barsPerYear);
  const news = newsCalendar();

  // Count open bars first so the arrays are allocated once.
  let n = 0;
  for (let t = start; t < end; t += step) if (isOpen(spec.hours, t)) n++;
  const s = emptySeries(spec.symbol, '5m', n);

  let price = spec.startPrice;
  let lnVol = 0; // daily volatility regime
  let drift = 0; // slow trend regime
  let curDay = -1;
  let lastT = -Infinity;
  let newsMinute = -1;
  let lastRet = 0;
  let i = 0;
  for (let t = start; t < end; t += step) {
    if (!isOpen(spec.hours, t)) continue;
    const day = Math.floor(t / dayMs);
    if (day !== curDay) {
      curDay = day;
      lnVol = 0.88 * lnVol + 0.22 * normal(r);
      drift = 0.96 * drift + 0.07 * normal(r);
      const ev = news.get(dayKey(t));
      newsMinute = ev && spec.hours !== 'crypto' ? ev[0].minuteUTC : -1;
    }
    const minute = Math.floor((t % dayMs) / 60000);
    let vol = sigmaBar * Math.exp(lnVol) * hourFactor(spec.hours, t);
    if (newsMinute >= 0) {
      if (minute === newsMinute) vol *= 5;
      else if (minute > newsMinute && minute <= newsMinute + 20) vol *= 2;
    }
    let o = price;
    if (t - lastT > step * 3 && lastT > 0) o = price * Math.exp(normal(r) * sigmaBar * 4); // session gap
    // Session behaviour: follow-through in London / NY hours, mean reversion in the quiet Asia hours.
    const hr = minute / 60;
    const ac = spec.hours === 'crypto' ? 0.05 : hr >= 7 && hr < 16 ? 0.12 : hr < 7 ? -0.22 : 0;
    const ret = drift * sigmaBar * 0.12 + ac * lastRet + vol * normal(r);
    lastRet = ret;
    const c = o * Math.exp(ret);
    const wick = () => Math.abs(normal(r)) * vol * 0.55;
    const hi = Math.max(o, c) * Math.exp(wick());
    const lo = Math.min(o, c) * Math.exp(-wick());
    s.t[i] = t;
    s.o[i] = roundTo(o, spec.tickSize);
    s.c[i] = roundTo(c, spec.tickSize);
    s.h[i] = Math.max(s.o[i], s.c[i], roundTo(hi, spec.tickSize));
    s.l[i] = Math.min(s.o[i], s.c[i], roundTo(lo, spec.tickSize));
    s.v[i] = Math.round(1000 * hourFactor(spec.hours, t) * (1 + Math.abs(ret) / sigmaBar) * (0.7 + 0.6 * r()));
    price = s.c[i];
    lastT = t;
    i++;
  }
  return s;
}

/** Aggregate a series to a higher timeframe (buckets aligned to UTC). */
export function aggregate(base: Series, tf: Timeframe): Series {
  const ms = TF_MS[tf];
  if (ms === TF_MS[base.tf]) return base;
  const out: { t: number; o: number; h: number; l: number; c: number; v: number }[] = [];
  let cur: { t: number; o: number; h: number; l: number; c: number; v: number } | null = null;
  for (let i = 0; i < base.length; i++) {
    const bucket = Math.floor(base.t[i] / ms) * ms;
    if (!cur || cur.t !== bucket) {
      if (cur) out.push(cur);
      cur = { t: bucket, o: base.o[i], h: base.h[i], l: base.l[i], c: base.c[i], v: base.v[i] };
    } else {
      if (base.h[i] > cur.h) cur.h = base.h[i];
      if (base.l[i] < cur.l) cur.l = base.l[i];
      cur.c = base.c[i];
      cur.v += base.v[i];
    }
  }
  if (cur) out.push(cur);
  return seriesFromBars(base.symbol, tf, out);
}

export class MockMarketData implements MarketDataProvider {
  name = 'MarketSyde demo feed';
  private base = new Map<string, Series>();
  private agg = new Map<string, Series>();

  symbols() { return SYMBOLS; }

  /** Whole-range series, generated on first use and cached. */
  seriesSync(symbol: string, tf: Timeframe): Series {
    const spec = symbolSpec(symbol);
    if (!spec) throw new Error(`No price data for ${symbol}.`);
    if (!['5m', '15m', '1h', '4h', '1D'].includes(tf)) throw new Error(`${tf} bars need a tick data feed, which isn't connected yet.`);
    let b = this.base.get(spec.symbol);
    if (!b) { b = generateBaseSeries(spec); this.base.set(spec.symbol, b); }
    if (tf === '5m') return b;
    const key = `${spec.symbol}|${tf}`;
    let a = this.agg.get(key);
    if (!a) { a = aggregate(b, tf); this.agg.set(key, a); }
    return a;
  }

  async getSeries(symbol: string, tf: Timeframe, fromMs: number, toMs: number): Promise<Series> {
    return sliceSeries(this.seriesSync(symbol, tf), fromMs, toMs);
  }
}

/** One shared mock feed per JS context (page or worker). */
export const marketData = new MockMarketData();
