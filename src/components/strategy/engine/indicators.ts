import { Bar, Operand, PriceField } from './types';

const NaNs = (n: number) => new Array<number>(n).fill(NaN);

const field = (bars: Bar[], f: PriceField): number[] => bars.map((b) => (f === 'open' ? b.o : f === 'high' ? b.h : f === 'low' ? b.l : b.c));

export function sma(values: number[], p: number): number[] {
  const out = NaNs(values.length);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= p) sum -= values[i - p];
    if (i >= p - 1) out[i] = sum / p;
  }
  return out;
}

export function ema(values: number[], p: number): number[] {
  const out = NaNs(values.length);
  if (values.length < p) return out;
  const k = 2 / (p + 1);
  let seed = 0;
  for (let i = 0; i < p; i++) seed += values[i];
  let prev = seed / p;
  out[p - 1] = prev;
  for (let i = p; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

/** Wilder's RSI. */
export function rsi(values: number[], p: number): number[] {
  const out = NaNs(values.length);
  if (values.length <= p) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= p; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= p;
  loss /= p;
  out[p] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  for (let i = p + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gain = (gain * (p - 1) + Math.max(d, 0)) / p;
    loss = (loss * (p - 1) + Math.max(-d, 0)) / p;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

export function macd(values: number[], fast: number, slow: number, signal: number) {
  const f = ema(values, fast);
  const s = ema(values, slow);
  const line = values.map((_, i) => (isFinite(f[i]) && isFinite(s[i]) ? f[i] - s[i] : NaN));
  const firstValid = line.findIndex((x) => isFinite(x));
  const sig = NaNs(values.length);
  if (firstValid >= 0) {
    const tail = ema(line.slice(firstValid), signal);
    tail.forEach((v, i) => (sig[firstValid + i] = v));
  }
  const hist = line.map((x, i) => (isFinite(x) && isFinite(sig[i]) ? x - sig[i] : NaN));
  return { line, signal: sig, hist };
}

export function bollinger(values: number[], p: number, k: number) {
  const mid = sma(values, p);
  const upper = NaNs(values.length);
  const lower = NaNs(values.length);
  for (let i = p - 1; i < values.length; i++) {
    let v = 0;
    for (let j = i - p + 1; j <= i; j++) v += (values[j] - mid[i]) ** 2;
    const sd = Math.sqrt(v / p);
    upper[i] = mid[i] + k * sd;
    lower[i] = mid[i] - k * sd;
  }
  return { mid, upper, lower };
}

export function atr(bars: Bar[], p: number): number[] {
  const out = NaNs(bars.length);
  if (bars.length <= p) return out;
  const tr = bars.map((b, i) => (i === 0 ? b.h - b.l : Math.max(b.h - b.l, Math.abs(b.h - bars[i - 1].c), Math.abs(b.l - bars[i - 1].c))));
  let prev = 0;
  for (let i = 1; i <= p; i++) prev += tr[i];
  prev /= p;
  out[p] = prev;
  for (let i = p + 1; i < bars.length; i++) {
    prev = (prev * (p - 1) + tr[i]) / p;
    out[i] = prev;
  }
  return out;
}

export function stochK(bars: Bar[], p: number): number[] {
  const out = NaNs(bars.length);
  for (let i = p - 1; i < bars.length; i++) {
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - p + 1; j <= i; j++) {
      hi = Math.max(hi, bars[j].h);
      lo = Math.min(lo, bars[j].l);
    }
    out[i] = hi === lo ? 50 : ((bars[i].c - lo) / (hi - lo)) * 100;
  }
  return out;
}

/** Highest high (or lowest low) of the previous p bars, so a breakout compares with the past only. */
export function donchian(bars: Bar[], p: number, side: 'high' | 'low'): number[] {
  const out = NaNs(bars.length);
  for (let i = p; i < bars.length; i++) {
    let v = side === 'high' ? -Infinity : Infinity;
    for (let j = i - p; j < i; j++) v = side === 'high' ? Math.max(v, bars[j].h) : Math.min(v, bars[j].l);
    out[i] = v;
  }
  return out;
}

/** Series for one operand, memoised per bars array. */
const memo = new WeakMap<Bar[], Map<string, number[]>>();

export function operandKey(o: Operand): string {
  return [o.kind, o.period ?? '', o.period2 ?? '', o.period3 ?? '', o.mult ?? '', o.value ?? '', o.field ?? ''].join(':');
}

export function series(bars: Bar[], o: Operand): number[] {
  let m = memo.get(bars);
  if (!m) memo.set(bars, (m = new Map()));
  const key = operandKey(o);
  const hit = m.get(key);
  if (hit) return hit;
  const p = Math.max(1, Math.round(o.period ?? 14));
  const src = field(bars, o.field ?? 'close');
  let out: number[];
  switch (o.kind) {
    case 'price':
      out = src;
      break;
    case 'value':
      out = new Array<number>(bars.length).fill(o.value ?? 0);
      break;
    case 'sma':
      out = sma(src, p);
      break;
    case 'ema':
      out = ema(src, p);
      break;
    case 'rsi':
      out = rsi(src, p);
      break;
    case 'macd':
    case 'macdSignal':
    case 'macdHist': {
      const r = macd(src, p, Math.max(p + 1, Math.round(o.period2 ?? 26)), Math.max(1, Math.round(o.period3 ?? 9)));
      out = o.kind === 'macd' ? r.line : o.kind === 'macdSignal' ? r.signal : r.hist;
      break;
    }
    case 'bbUpper':
    case 'bbMid':
    case 'bbLower': {
      const r = bollinger(src, Math.max(2, p), o.mult ?? 2);
      out = o.kind === 'bbUpper' ? r.upper : o.kind === 'bbMid' ? r.mid : r.lower;
      break;
    }
    case 'atr':
      out = atr(bars, p);
      break;
    case 'stoch':
      out = stochK(bars, p);
      break;
    case 'donchianHigh':
      out = donchian(bars, p, 'high');
      break;
    case 'donchianLow':
      out = donchian(bars, p, 'low');
      break;
    default:
      out = NaNs(bars.length);
  }
  m.set(key, out);
  return out;
}

/** True when the operand is drawn on the price chart, false when it needs its own panel. */
export const isPriceScale = (kind: Operand['kind']) => ['price', 'sma', 'ema', 'bbUpper', 'bbMid', 'bbLower', 'donchianHigh', 'donchianLow'].includes(kind);
