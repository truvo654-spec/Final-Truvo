import { Bar, PeriodKey, Timeframe } from './types';

/**
 * Prices here are SIMULATED. There is no market data feed in the preview, so each
 * instrument gets a repeatable random history (trending, ranging and falling stretches
 * with volatility that comes in waves). The same name + scenario always gives the same bars.
 */

export interface InstrumentSpec {
  id: string;
  label: string;
  group: 'Forex' | 'Commodities' | 'Crypto' | 'Indices';
  startPrice: number;
  decimals: number;
  /** One pip in price units. */
  pip: number;
  /** USD value of a 1.0 move in price for 1 lot. */
  valuePerUnit: number;
  /** Quote currency is JPY, so value per unit is divided by the price. */
  jpyQuote?: boolean;
  annualVol: number;
  defaultSpreadPips: number;
  defaultCommission: number;
  weekends?: boolean;
}

export const INSTRUMENTS: InstrumentSpec[] = [
  { id: 'EURUSD', label: 'EUR/USD', group: 'Forex', startPrice: 1.08, decimals: 5, pip: 0.0001, valuePerUnit: 100000, annualVol: 0.07, defaultSpreadPips: 0.8, defaultCommission: 7 },
  { id: 'GBPUSD', label: 'GBP/USD', group: 'Forex', startPrice: 1.27, decimals: 5, pip: 0.0001, valuePerUnit: 100000, annualVol: 0.085, defaultSpreadPips: 1.0, defaultCommission: 7 },
  { id: 'USDJPY', label: 'USD/JPY', group: 'Forex', startPrice: 148, decimals: 3, pip: 0.01, valuePerUnit: 100000, jpyQuote: true, annualVol: 0.095, defaultSpreadPips: 0.9, defaultCommission: 7 },
  { id: 'XAUUSD', label: 'XAU/USD (Gold)', group: 'Commodities', startPrice: 2350, decimals: 2, pip: 0.1, valuePerUnit: 100, annualVol: 0.15, defaultSpreadPips: 3, defaultCommission: 7 },
  { id: 'BTCUSD', label: 'BTC/USD', group: 'Crypto', startPrice: 58000, decimals: 1, pip: 1, valuePerUnit: 1, annualVol: 0.55, defaultSpreadPips: 25, defaultCommission: 0, weekends: true },
  { id: 'US500', label: 'S&P 500', group: 'Indices', startPrice: 5200, decimals: 1, pip: 0.1, valuePerUnit: 1, annualVol: 0.16, defaultSpreadPips: 6, defaultCommission: 0 },
];

export const getInstrument = (id: string) => INSTRUMENTS.find((i) => i.id === id) ?? INSTRUMENTS[0];

export const TIMEFRAMES: { id: Timeframe; label: string; ms: number; barsPerYear: number }[] = [
  { id: '1H', label: '1 hour', ms: 3600_000, barsPerYear: 6240 },
  { id: '4H', label: '4 hours', ms: 4 * 3600_000, barsPerYear: 1560 },
  { id: '1D', label: '1 day', ms: 86_400_000, barsPerYear: 260 },
];

export const PERIODS: { id: PeriodKey; label: string; years: number }[] = [
  { id: '3M', label: '3 months', years: 0.25 },
  { id: '6M', label: '6 months', years: 0.5 },
  { id: '1Y', label: '1 year', years: 1 },
  { id: '3Y', label: '3 years', years: 3 },
  { id: '5Y', label: '5 years', years: 5 },
];

export const SCENARIOS = [
  { id: 1, label: 'History A' },
  { id: 2, label: 'History B' },
  { id: 3, label: 'History C' },
];

/** Small fast seeded generator (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const gauss = (r: () => number) => {
  let u = 0;
  let v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const cache = new Map<string, Bar[]>();

/** The last bar lands on or just before this day. */
export const DATA_END = Date.UTC(2026, 9, 5);

export function generateBars(instrumentId: string, timeframe: Timeframe, period: PeriodKey, scenario: number): Bar[] {
  const key = `${instrumentId}|${timeframe}|${period}|${scenario}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const ins = getInstrument(instrumentId);
  const tf = TIMEFRAMES.find((t) => t.id === timeframe)!;
  const years = PERIODS.find((p) => p.id === period)!.years;
  const n = Math.max(60, Math.round(years * tf.barsPerYear));
  const r = rng(hash(`${instrumentId}|${scenario}`) ^ hash(timeframe));
  const dt = 1 / tf.barsPerYear;

  // timestamps, skipping weekends where the market is shut
  const times: number[] = [];
  let t = DATA_END - (years * 365 + 7) * 86_400_000;
  t -= t % tf.ms;
  while (times.length < n) {
    const day = new Date(t).getUTCDay();
    if (ins.weekends || (day !== 0 && day !== 6)) times.push(t);
    t += tf.ms;
  }

  // market regimes: 0 trending up, 1 trending down, 2 ranging
  // drift is a multiple of the instrument's own volatility, so EUR/USD drifts a few percent a year and BTC far more
  const drift = [1.4 * ins.annualVol, -1.2 * ins.annualVol, 0];
  const volMul = [0.9, 1.25, 0.75];
  let regime = Math.floor(r() * 3);
  let left = Math.round(tf.barsPerYear * (0.06 + r() * 0.2));
  let logVol = 0;
  let price = ins.startPrice * (0.9 + r() * 0.2);
  const bars: Bar[] = [];

  for (let i = 0; i < n; i++) {
    if (left-- <= 0) {
      const pick = r();
      regime = pick < 0.38 ? 0 : pick < 0.62 ? 1 : 2;
      left = Math.round(tf.barsPerYear * (0.05 + r() * 0.22));
    }
    logVol = 0.94 * logVol + 0.22 * gauss(r) * Math.sqrt(1 - 0.94 * 0.94);
    const sigma = ins.annualVol * volMul[regime] * Math.exp(logVol);
    const ret = (drift[regime] - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * gauss(r);
    const open = price;
    const close = open * Math.exp(ret);
    const wick = sigma * Math.sqrt(dt);
    const high = Math.max(open, close) * Math.exp(Math.abs(gauss(r)) * wick * 0.45);
    const low = Math.min(open, close) * Math.exp(-Math.abs(gauss(r)) * wick * 0.45);
    bars.push({ t: times[i], o: open, h: high, l: low, c: close, v: Math.round(800 + r() * 1200 + Math.abs(ret) * 1e6) });
    price = close;
  }
  cache.set(key, bars);
  return bars;
}
