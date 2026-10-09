// Online (streaming) indicators. Each one only ever sees the bars passed to update(),
// one at a time in time order, so it cannot read the future.
import { IndSpec, SESSIONS } from './types';

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

export function createIndicator(spec: IndSpec): Indicator {
  const p = spec.period ?? 14;
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
  }
}

export const indKey = (s: IndSpec) => `${s.type}|${s.period ?? ''}|${s.session ?? ''}`;
