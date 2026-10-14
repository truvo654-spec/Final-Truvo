// Online (streaming) indicators. Each one only ever sees the bars passed to update(),
// one at a time in time order, so it cannot read the future.
import { IND_DEFAULT_PERIOD, IndSpec, SESSIONS } from './types';

export interface Indicator {
  value: number; // NaN until enough bars
  prev: number;
  update(t: number, o: number, h: number, l: number, c: number, v: number): void;
}

const dayOf = (t: number) => Math.floor(t / 86400000);
const hourOf = (t: number) => (t % 86400000) / 3600000;

abstract class Base implements Indicator {
  value = NaN;
  prev = NaN;
  protected set(v: number) { this.prev = this.value; this.value = v; }
  abstract update(t: number, o: number, h: number, l: number, c: number, v: number): void;
}

class SMA extends Base {
  private buf: number[] = []; private sum = 0;
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, _h: number, _l: number, c: number) {
    this.buf.push(c); this.sum += c;
    if (this.buf.length > this.p) this.sum -= this.buf.shift()!;
    this.set(this.buf.length === this.p ? this.sum / this.p : NaN);
  }
}

class EMA extends Base {
  private n = 0; private e = 0; private seed = 0;
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, _h: number, _l: number, c: number) {
    this.n++;
    if (this.n <= this.p) {
      this.seed += c;
      if (this.n === this.p) { this.e = this.seed / this.p; this.set(this.e); } else this.set(NaN);
      return;
    }
    const k = 2 / (this.p + 1);
    this.e = c * k + this.e * (1 - k);
    this.set(this.e);
  }
}

/** Wilder's RSI. */
class RSI extends Base {
  private n = 0; private last = NaN; private g = 0; private l = 0;
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, _h: number, _lo: number, c: number) {
    if (Number.isNaN(this.last)) { this.last = c; this.set(NaN); return; }
    const ch = c - this.last; this.last = c;
    const up = Math.max(ch, 0), dn = Math.max(-ch, 0);
    this.n++;
    if (this.n <= this.p) {
      this.g += up; this.l += dn;
      if (this.n < this.p) { this.set(NaN); return; }
      this.g /= this.p; this.l /= this.p;
    } else {
      this.g = (this.g * (this.p - 1) + up) / this.p;
      this.l = (this.l * (this.p - 1) + dn) / this.p;
    }
    this.set(this.l === 0 ? 100 : 100 - 100 / (1 + this.g / this.l));
  }
}

/** Wilder's ATR. */
export class ATR extends Base {
  private n = 0; private prevC = NaN; private a = 0;
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number, c: number) {
    const tr = Number.isNaN(this.prevC) ? h - l : Math.max(h - l, Math.abs(h - this.prevC), Math.abs(l - this.prevC));
    this.prevC = c;
    this.n++;
    if (this.n <= this.p) {
      this.a += tr;
      if (this.n < this.p) { this.set(NaN); return; }
      this.a /= this.p;
    } else this.a = (this.a * (this.p - 1) + tr) / this.p;
    this.set(this.a);
  }
}

/** Volume-weighted average price, reset each UTC day. */
class VWAP extends Base {
  private day = -1; private pv = 0; private vol = 0;
  update(t: number, _o: number, h: number, l: number, c: number, v: number) {
    const d = dayOf(t);
    if (d !== this.day) { this.day = d; this.pv = 0; this.vol = 0; }
    const tp = (h + l + c) / 3;
    this.pv += tp * v; this.vol += v;
    this.set(this.vol > 0 ? this.pv / this.vol : NaN);
  }
}

/** Previous UTC day's high or low. */
class PrevDay extends Base {
  private day = -1; private hi = -Infinity; private lo = Infinity; private ph = NaN; private pl = NaN;
  constructor(private which: 'high' | 'low') { super(); }
  update(t: number, _o: number, h: number, l: number) {
    const d = dayOf(t);
    if (d !== this.day) {
      if (this.day !== -1) { this.ph = this.hi; this.pl = this.lo; }
      this.day = d; this.hi = -Infinity; this.lo = Infinity;
    }
    this.hi = Math.max(this.hi, h); this.lo = Math.min(this.lo, l);
    this.set(this.which === 'high' ? this.ph : this.pl);
  }
}

/** High or low of a session window on the current UTC day (e.g. the Asian range). Forming while the session runs. */
class SessionRange extends Base {
  private day = -1; private hi = NaN; private lo = NaN;
  constructor(private which: 'high' | 'low', private start: number, private end: number) { super(); }
  update(t: number, _o: number, h: number, l: number) {
    const d = dayOf(t);
    if (d !== this.day) { this.day = d; this.hi = NaN; this.lo = NaN; }
    const hr = hourOf(t);
    if (hr >= this.start && hr < this.end) {
      this.hi = Number.isNaN(this.hi) ? h : Math.max(this.hi, h);
      this.lo = Number.isNaN(this.lo) ? l : Math.min(this.lo, l);
    }
    this.set(this.which === 'high' ? this.hi : this.lo);
  }
}

/** Highest high / lowest low of the previous N bars (the current bar is excluded, so a close above it is a breakout). */
class Channel extends Base {
  private buf: number[] = [];
  constructor(private which: 'high' | 'low', private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number) {
    this.set(this.buf.length === this.p ? (this.which === 'high' ? Math.max(...this.buf) : Math.min(...this.buf)) : NaN);
    this.buf.push(this.which === 'high' ? h : l);
    if (this.buf.length > this.p) this.buf.shift();
  }
}

/** 1 when a fair value gap forms on this bar (three-bar imbalance), else 0. */
class FVG extends Base {
  private hs: number[] = []; private ls: number[] = [];
  constructor(private bull: boolean) { super(); }
  update(_t: number, _o: number, h: number, l: number) {
    this.hs.push(h); this.ls.push(l);
    if (this.hs.length > 3) { this.hs.shift(); this.ls.shift(); }
    if (this.hs.length < 3) { this.set(0); return; }
    this.set(this.bull ? (this.ls[2] > this.hs[0] ? 1 : 0) : (this.hs[2] < this.ls[0] ? 1 : 0));
  }
}

class MACDHistogram extends Base {
  private fast = new EMA(12);
  private slow = new EMA(26);
  private signal = new EMA(9);
  update(t: number, o: number, h: number, l: number, c: number) {
    this.fast.update(t, o, h, l, c);
    this.slow.update(t, o, h, l, c);
    if (!Number.isFinite(this.fast.value) || !Number.isFinite(this.slow.value)) { this.set(NaN); return; }
    const macd = this.fast.value - this.slow.value;
    this.signal.update(t, o, h, l, macd);
    this.set(Number.isFinite(this.signal.value) ? macd - this.signal.value : NaN);
  }
}

class Stochastic extends Base {
  private highs: number[] = [];
  private lows: number[] = [];
  private smooth: number[] = [];
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number, c: number) {
    this.highs.push(h); this.lows.push(l);
    if (this.highs.length > this.p) { this.highs.shift(); this.lows.shift(); }
    if (this.highs.length < this.p) { this.set(NaN); return; }
    const hi = Math.max(...this.highs), lo = Math.min(...this.lows);
    this.smooth.push(hi === lo ? 50 : 100 * (c - lo) / (hi - lo));
    if (this.smooth.length > 3) this.smooth.shift();
    this.set(this.smooth.length === 3 ? this.smooth.reduce((a, b) => a + b, 0) / 3 : NaN);
  }
}

class CCI extends Base {
  private typical: number[] = [];
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number, c: number) {
    this.typical.push((h + l + c) / 3);
    if (this.typical.length > this.p) this.typical.shift();
    if (this.typical.length < this.p) { this.set(NaN); return; }
    const mean = this.typical.reduce((a, b) => a + b, 0) / this.p;
    const deviation = this.typical.reduce((a, b) => a + Math.abs(b - mean), 0) / this.p;
    this.set(deviation === 0 ? 0 : (this.typical[this.typical.length - 1] - mean) / (0.015 * deviation));
  }
}

class ADX extends Base {
  private previous: { h: number; l: number; c: number } | null = null;
  private count = 0;
  private tr = 0; private plus = 0; private minus = 0;
  private dx: number[] = [];
  private average = NaN;
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number, c: number) {
    const previous = this.previous;
    this.previous = { h, l, c };
    if (!previous) { this.set(NaN); return; }
    const up = h - previous.h, down = previous.l - l;
    const tr = Math.max(h - l, Math.abs(h - previous.c), Math.abs(l - previous.c));
    const plusDm = up > down && up > 0 ? up : 0;
    const minusDm = down > up && down > 0 ? down : 0;
    if (this.count < this.p) {
      this.tr += tr; this.plus += plusDm; this.minus += minusDm; this.count++;
      if (this.count < this.p) { this.set(NaN); return; }
    } else {
      this.tr = this.tr - this.tr / this.p + tr;
      this.plus = this.plus - this.plus / this.p + plusDm;
      this.minus = this.minus - this.minus / this.p + minusDm;
    }
    const plusDi = this.tr === 0 ? 0 : 100 * this.plus / this.tr;
    const minusDi = this.tr === 0 ? 0 : 100 * this.minus / this.tr;
    const sum = plusDi + minusDi;
    const dx = sum === 0 ? 0 : 100 * Math.abs(plusDi - minusDi) / sum;
    if (!Number.isFinite(this.average)) {
      this.dx.push(dx);
      if (this.dx.length > this.p) this.dx.shift();
      if (this.dx.length === this.p) this.average = this.dx.reduce((a, b) => a + b, 0) / this.p;
    } else this.average = (this.average * (this.p - 1) + dx) / this.p;
    this.set(this.average);
  }
}

class Momentum extends Base {
  private closes: number[] = [];
  constructor(private p: number, private percent: boolean) { super(); }
  update(_t: number, _o: number, _h: number, _l: number, c: number) {
    this.closes.push(c);
    if (this.closes.length > this.p + 1) this.closes.shift();
    if (this.closes.length <= this.p) { this.set(NaN); return; }
    const prior = this.closes[0];
    this.set(this.percent ? (prior === 0 ? NaN : (c - prior) / prior * 100) : c - prior);
  }
}

class StochasticRSI extends Base {
  private rsi: RSI;
  private values: number[] = [];
  constructor(private p: number) { super(); this.rsi = new RSI(p); }
  update(t: number, o: number, h: number, l: number, c: number, v: number) {
    this.rsi.update(t, o, h, l, c);
    if (!Number.isFinite(this.rsi.value)) { this.set(NaN); return; }
    this.values.push(this.rsi.value);
    if (this.values.length > this.p) this.values.shift();
    if (this.values.length < this.p) { this.set(NaN); return; }
    const hi = Math.max(...this.values), lo = Math.min(...this.values);
    this.set(hi === lo ? 50 : 100 * (this.rsi.value - lo) / (hi - lo));
  }
}

class WilliamsR extends Base {
  private highs: number[] = []; private lows: number[] = [];
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number, c: number) {
    this.highs.push(h); this.lows.push(l);
    if (this.highs.length > this.p) { this.highs.shift(); this.lows.shift(); }
    if (this.highs.length < this.p) { this.set(NaN); return; }
    const hi = Math.max(...this.highs), lo = Math.min(...this.lows);
    this.set(hi === lo ? -50 : -100 * (hi - c) / (hi - lo));
  }
}

class ElderPower extends Base {
  private ema: EMA;
  constructor(private direction: 'bull' | 'bear', p: number) { super(); this.ema = new EMA(p); }
  update(t: number, o: number, h: number, l: number, c: number) {
    this.ema.update(t, o, h, l, c);
    this.set(Number.isFinite(this.ema.value) ? (this.direction === 'bull' ? h - this.ema.value : l - this.ema.value) : NaN);
  }
}

class UltimateOscillator extends Base {
  private previousClose = NaN;
  private pressure: number[] = [];
  private ranges: number[] = [];
  update(_t: number, _o: number, h: number, l: number, c: number) {
    const prior = Number.isFinite(this.previousClose) ? this.previousClose : c;
    this.previousClose = c;
    this.pressure.push(c - Math.min(l, prior));
    this.ranges.push(Math.max(h, prior) - Math.min(l, prior));
    if (this.pressure.length > 28) { this.pressure.shift(); this.ranges.shift(); }
    if (this.pressure.length < 28) { this.set(NaN); return; }
    const ratio = (n: number) => {
      const bp = this.pressure.slice(-n).reduce((a, b) => a + b, 0);
      const tr = this.ranges.slice(-n).reduce((a, b) => a + b, 0);
      return tr === 0 ? 0.5 : bp / tr;
    };
    this.set(100 * (4 * ratio(7) + 2 * ratio(14) + ratio(28)) / 7);
  }
}

class VWMA extends Base {
  private closes: number[] = []; private volumes: number[] = [];
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, _h: number, _l: number, c: number, v: number) {
    this.closes.push(c); this.volumes.push(v);
    if (this.closes.length > this.p) { this.closes.shift(); this.volumes.shift(); }
    if (this.closes.length < this.p) { this.set(NaN); return; }
    const volume = this.volumes.reduce((a, b) => a + b, 0);
    this.set(volume > 0 ? this.closes.reduce((sum, close, i) => sum + close * this.volumes[i], 0) / volume : NaN);
  }
}

const weightedMean = (values: number[]) => {
  const denominator = values.length * (values.length + 1) / 2;
  return values.reduce((sum, value, i) => sum + value * (i + 1), 0) / denominator;
};

class HMA extends Base {
  private closes: number[] = []; private differences: number[] = [];
  private half: number; private root: number;
  constructor(private p: number) { super(); this.half = Math.max(1, Math.floor(p / 2)); this.root = Math.max(1, Math.floor(Math.sqrt(p))); }
  update(_t: number, _o: number, _h: number, _l: number, c: number) {
    this.closes.push(c);
    if (this.closes.length > this.p) this.closes.shift();
    if (this.closes.length < this.p) { this.set(NaN); return; }
    const diff = 2 * weightedMean(this.closes.slice(-this.half)) - weightedMean(this.closes);
    this.differences.push(diff);
    if (this.differences.length > this.root) this.differences.shift();
    this.set(this.differences.length === this.root ? weightedMean(this.differences) : NaN);
  }
}

class IchimokuLine extends Base {
  private highs: number[] = []; private lows: number[] = [];
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number) {
    this.highs.push(h); this.lows.push(l);
    if (this.highs.length > this.p) { this.highs.shift(); this.lows.shift(); }
    this.set(this.highs.length === this.p ? (Math.max(...this.highs) + Math.min(...this.lows)) / 2 : NaN);
  }
}

class Bollinger extends Base {
  private closes: number[] = [];
  constructor(private p: number, private band: 'upper' | 'middle' | 'lower') { super(); }
  update(_t: number, _o: number, _h: number, _l: number, c: number) {
    this.closes.push(c);
    if (this.closes.length > this.p) this.closes.shift();
    if (this.closes.length < this.p) { this.set(NaN); return; }
    const mean = this.closes.reduce((a, b) => a + b, 0) / this.p;
    const deviation = Math.sqrt(this.closes.reduce((sum, value) => sum + (value - mean) ** 2, 0) / this.p);
    this.set(this.band === 'middle' ? mean : mean + (this.band === 'upper' ? 2 : -2) * deviation);
  }
}

class OBV extends Base {
  private previousClose = NaN;
  private total = 0;
  update(_t: number, _o: number, _h: number, _l: number, c: number, v: number) {
    if (Number.isFinite(this.previousClose)) {
      if (c > this.previousClose) this.total += v;
      else if (c < this.previousClose) this.total -= v;
    }
    this.previousClose = c;
    this.set(this.total);
  }
}

class MFI extends Base {
  private previousTypical = NaN;
  private positive: number[] = []; private negative: number[] = [];
  constructor(private p: number) { super(); }
  update(_t: number, _o: number, h: number, l: number, c: number, v: number) {
    const typical = (h + l + c) / 3;
    const flow = typical * v;
    if (Number.isFinite(this.previousTypical)) {
      this.positive.push(typical > this.previousTypical ? flow : 0);
      this.negative.push(typical < this.previousTypical ? flow : 0);
      if (this.positive.length > this.p) { this.positive.shift(); this.negative.shift(); }
    }
    this.previousTypical = typical;
    if (this.positive.length < this.p) { this.set(NaN); return; }
    const pos = this.positive.reduce((a, b) => a + b, 0);
    const neg = this.negative.reduce((a, b) => a + b, 0);
    this.set(neg === 0 ? (pos === 0 ? 50 : 100) : 100 - 100 / (1 + pos / neg));
  }
}

export function createIndicator(spec: IndSpec): Indicator {
  const p = spec.period ?? IND_DEFAULT_PERIOD[spec.type] ?? 14;
  const sess = SESSIONS[spec.session ?? 'asia'];
  switch (spec.type) {
    case 'SMA': return new SMA(p);
    case 'EMA': return new EMA(p);
    case 'RSI': return new RSI(p);
    case 'ATR': return new ATR(p);
    case 'VWAP': return new VWAP();
    case 'PDH': return new PrevDay('high');
    case 'PDL': return new PrevDay('low');
    case 'SESSION_HIGH': return new SessionRange('high', sess.start, sess.end);
    case 'SESSION_LOW': return new SessionRange('low', sess.start, sess.end);
    case 'HIGHEST': return new Channel('high', p);
    case 'LOWEST': return new Channel('low', p);
    case 'FVG_BULL': return new FVG(true);
    case 'FVG_BEAR': return new FVG(false);
    case 'MACD': return new MACDHistogram();
    case 'STOCH': return new Stochastic(p);
    case 'CCI': return new CCI(p);
    case 'ADX': return new ADX(p);
    case 'MOMENTUM': return new Momentum(p, false);
    case 'ROC': return new Momentum(p, true);
    case 'STOCH_RSI': return new StochasticRSI(p);
    case 'WILLR': return new WilliamsR(p);
    case 'BULL_POWER': return new ElderPower('bull', p);
    case 'BEAR_POWER': return new ElderPower('bear', p);
    case 'ULTIMATE': return new UltimateOscillator();
    case 'VWMA': return new VWMA(p);
    case 'HMA': return new HMA(p);
    case 'ICHIMOKU_CONVERSION': return new IchimokuLine(p);
    case 'ICHIMOKU_BASE': return new IchimokuLine(p);
    case 'BB_UPPER': return new Bollinger(p, 'upper');
    case 'BB_MIDDLE': return new Bollinger(p, 'middle');
    case 'BB_LOWER': return new Bollinger(p, 'lower');
    case 'OBV': return new OBV();
    case 'MFI': return new MFI(p);
  }
}

export const indKey = (s: IndSpec) => `${s.type}|${s.period ?? ''}|${s.session ?? ''}`;
