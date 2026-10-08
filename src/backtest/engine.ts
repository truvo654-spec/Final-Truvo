// The simulation engine. Bars are processed strictly in time order and every read of
// price data goes through GuardedSeries, which throws if the engine ever asks for a
// bar beyond the one it is on (no look-ahead).
//
// Per bar:
//   1. fill a pending entry order (market at this bar's open, or a limit/stop if price reached it)
//   2. manage the open position: stop first, then partial/target (stop wins if both are inside one bar)
//   3. update indicators with this bar
//   4. move breakeven / trailing stops, time and session exits, risk limits
//   5. look for a new signal at the close; the order fills on the next bar (or at this close)
import { USD_PER } from './config';
import { createIndicator, indKey, Indicator } from './indicators';
import { dayMs, isNewsDay as defaultIsNewsDay, symbolSpec } from './marketData';
import { describeCondition, mirrorCondition } from './rules';
import {
  BacktestSettings, BacktestTrade, Condition, ExitReason, Operand, RunDiagnostics, RunEvent, RunResult, SESSIONS, Series, SymbolSpec, TF_MS,
} from './types';

export class LookAheadError extends Error {
  constructor(public index: number, public current: number) {
    super(`Look-ahead: the engine read bar ${index} while processing bar ${current}.`);
    this.name = 'LookAheadError';
  }
}

/** Read-only view of a series that refuses to return any bar after the current one. */
export class GuardedSeries {
  private cur = -1;
  constructor(private s: Series) {}
  get length() { return this.s.length; }
  get current() { return this.cur; }
  advance(i: number) { this.cur = i; }
  private g(i: number) { if (i > this.cur) throw new LookAheadError(i, this.cur); }
  t(i: number) { this.g(i); return this.s.t[i]; }
  o(i: number) { this.g(i); return this.s.o[i]; }
  h(i: number) { this.g(i); return this.s.h[i]; }
  l(i: number) { this.g(i); return this.s.l[i]; }
  c(i: number) { this.g(i); return this.s.c[i]; }
  v(i: number) { this.g(i); return this.s.v[i]; }
}

interface Pending {
  dir: 1 | -1;
  type: 'market' | 'limit' | 'stop';
  price: number; // limit / stop trigger price (market: unused)
  stopDist: number; // for atr/points stops
  stopLevel: number | null; // for swing stops
  validLeft: number;
  placedT: number;
}

interface Pos {
  dir: 1 | -1;
  orderType: 'market' | 'limit' | 'stop';
  entryT: number;
  entryRaw: number;
  entryFill: number;
  initStop: number;
  stop: number;
  stopKind: 'stop' | 'breakeven' | 'trailing';
  target: number | null;
  riskDist: number;
  size: number;
  remaining: number;
  grossUsd: number;
  costsUsd: number;
  exitNotional: number; // Σ exit fill × qty, for the average exit price
  exitQty: number;
  partialDone: boolean;
  beDone: boolean;
  trailing: boolean;
  bestPx: number; // most favourable price reached
  worstPx: number;
  bars: number;
  ambiguous: boolean;
}

export interface RunHandle {
  total: number;
  readonly done: number;
  guard: GuardedSeries;
  /** Process up to n bars. Returns true when the run is finished. */
  step(n: number): boolean;
  result(): RunResult;
}

export interface RunOptions {
  isNewsDay?: (t: number) => boolean;
}

const minuteOfDay = (t: number) => Math.floor((t % dayMs) / 60000);
const marketCloseMin = (spec: SymbolSpec, t: number) => {
  const dow = new Date(t).getUTCDay();
  if (spec.hours === 'crypto') return 1440;
  if (spec.hours === 'us-stocks') return 20 * 60;
  if (spec.hours === 'cme') return 22 * 60;
  return dow === 5 ? 22 * 60 : 1440;
};

export function createRun(settings: BacktestSettings, series: Series, opts: RunOptions = {}): RunHandle {
  const spec = symbolSpec(settings.symbol);
  if (!spec) throw new Error(`No price data for ${settings.symbol}.`);
  const newsDay = opts.isNewsDay ?? defaultIsNewsDay;
  const gs = new GuardedSeries(series);
  const n = series.length;
  const tfMs = TF_MS[settings.timeframe] || TF_MS[series.tf];
  const intraday = tfMs < dayMs;
  const { rules, risk, costs, prop } = settings;
  const ex = rules.exits;
  const rate = USD_PER[risk.currency] ?? 1;
  const unit = spec.costUnit.size;
  const halfSpread = costs.enabled ? (costs.spread * unit) / 2 : 0;
  const slip = costs.enabled ? costs.slippage * unit : 0;
  const commission = costs.enabled ? costs.commissionPerSide : 0;
  const sizeDp = Math.max(0, Math.round(-Math.log10(spec.sizeStep)));

  // Indicators used by the rules (long and mirrored short) plus ATR(14) for stops and offsets.
  const longConds: Condition[] = rules.entry;
  const shortConds: Condition[] = rules.entry.map(mirrorCondition);
  const inds = new Map<string, Indicator>();
  const need = (o: Operand) => { if (o.kind === 'ind') { const k = indKey(o.ind); if (!inds.has(k)) inds.set(k, createIndicator(o.ind)); } };
  [...longConds, ...shortConds].forEach((c) => { need(c.left); need(c.right); });
  const atrSpec = { type: 'ATR' as const, period: 14 };
  need({ kind: 'ind', ind: atrSpec });
  const atr = inds.get(indKey(atrSpec))!;
  const indList = Array.from(inds.values());

  // Rolling highs/lows for swing stops (past bars only).
  const swingN = ex.stop.type === 'swing' ? ex.stop.lookback : 0;
  const recentH: number[] = [];
  const recentL: number[] = [];

  // State
  let i = 0;
  let finished = n === 0;
  let pend: Pending | null = null;
  let pos: Pos | null = null;
  let balance = risk.startBalance;
  let peak = balance;
  let curDay = -1;
  let dayStart = balance;
  let dayPnl = 0;
  let dayHalted = false;
  let tradesToday = 0;
  const tradeDays = new Set<number>();
  let stopReason: string | null = null;
  let propStatus: RunResult['propStatus'] = prop ? 'in progress' : null;
  const trades: BacktestTrade[] = [];
  const events: RunEvent[] = [];
  let prevO = NaN, prevH = NaN, prevL = NaN, prevC = NaN;
  let curO = NaN, curH = NaN, curL = NaN, curC = NaN;
  const diag: RunDiagnostics = {
    bars: n, signals: 0,
    filtered: { session: 0, weekday: 0, news: 0, dayLimit: 0, maxTrades: 0, minSize: 0, expired: 0 },
    conditionHits: longConds.map((c) => ({ label: describeCondition(c), hits: 0 })),
    allTogether: 0,
  };

  const val = (o: Operand, prev: boolean): number => {
    if (o.kind === 'value') return o.value;
    if (o.kind === 'price') {
      const f = o.field;
      return prev ? (f === 'close' ? prevC : f === 'open' ? prevO : f === 'high' ? prevH : prevL) : (f === 'close' ? curC : f === 'open' ? curO : f === 'high' ? curH : curL);
    }
    const x = inds.get(indKey(o.ind))!;
    return prev ? x.prev : x.value;
  };
  const test = (c: Condition): boolean => {
    const a = val(c.left, false), b = val(c.right, false);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    if (c.op === 'gt') return a > b;
    if (c.op === 'lt') return a < b;
    const pa = val(c.left, true), pb = val(c.right, true);
    if (!Number.isFinite(pa) || !Number.isFinite(pb)) return false;
    return c.op === 'crossAbove' ? pa <= pb && a > b : pa >= pb && a < b;
  };

  const toAcct = (usd: number) => usd / rate;

  /** Close `qty` of the open position at raw price `raw`. limitFill = target/partial (no slippage). */
  const fillExit = (p: Pos, qty: number, raw: number, limitFill: boolean) => {
    const fill = raw - p.dir * (halfSpread + (limitFill ? 0 : slip));
    p.grossUsd += (raw - p.entryRaw) * p.dir * qty * spec.multiplier;
    p.costsUsd += (Math.abs(fill - raw) + Math.abs(p.entryFill - p.entryRaw)) * qty * spec.multiplier + commission * qty * 2;
    p.exitNotional += fill * qty;
    p.exitQty += qty;
    p.remaining = +(p.remaining - qty).toFixed(sizeDp + 2);
  };

  const closeTrade = (p: Pos, t: number, reason: ExitReason) => {
    const gross = toAcct(p.grossUsd);
    const costsA = toAcct(p.costsUsd);
    const net = gross - costsA;
    const riskAcct = toAcct(p.riskDist * p.size * spec.multiplier);
    balance += net;
    dayPnl += net;
    peak = Math.max(peak, balance);
    trades.push({
      id: trades.length + 1,
      entryTime: p.entryT,
      exitTime: t,
      direction: p.dir === 1 ? 'long' : 'short',
      entryPrice: p.entryFill,
      orderType: p.orderType,
      exitPrice: p.exitQty ? p.exitNotional / p.exitQty : p.entryFill,
      stopPrice: p.initStop,
      targetPrice: p.target,
      size: p.size,
      gross, costs: costsA, net,
      r: riskAcct > 0 ? net / riskAcct : 0,
      mae: p.riskDist > 0 ? (p.dir * (p.worstPx - p.entryFill)) / p.riskDist : 0,
      mfe: p.riskDist > 0 ? (p.dir * (p.bestPx - p.entryFill)) / p.riskDist : 0,
      exitReason: reason,
      balance,
      bars: p.bars,
      ambiguous: p.ambiguous,
      partial: p.partialDone,
    });
    pos = null;
  };

  const exitAll = (p: Pos, raw: number, t: number, reason: ExitReason, limitFill = false) => {
    if (p.remaining > 0) fillExit(p, p.remaining, raw, limitFill);
    closeTrade(p, t, reason);
    afterRealized(t);
  };

  /** Risk limits on closed-trade (realized) results. */
  const afterRealized = (t: number) => {
    if (risk.dailyLossPct && dayPnl <= -(risk.dailyLossPct / 100) * dayStart && !dayHalted) {
      dayHalted = true;
      events.push({ t, kind: 'daily-limit', text: `Daily loss limit (${risk.dailyLossPct}%) reached; no more trades that day.` });
    }
    if (risk.maxDrawdownPct && (peak - balance) / peak >= risk.maxDrawdownPct / 100) {
      stopReason = `Max drawdown limit (${risk.maxDrawdownPct}%) reached.`;
      events.push({ t, kind: 'max-drawdown', text: stopReason });
      finished = true;
    }
    if (prop) {
      const ref = prop.trailing ? peak : risk.startBalance;
      if (balance <= ref * (1 - prop.maxDrawdownPct / 100)) {
        propStatus = 'failed'; stopReason = `Prop rule broken: ${prop.trailing ? 'trailing' : 'maximum'} drawdown of ${prop.maxDrawdownPct}%.`;
        events.push({ t, kind: 'prop-failed', text: stopReason }); finished = true;
      } else if (dayPnl <= -(prop.dailyLossPct / 100) * dayStart) {
        propStatus = 'failed'; stopReason = `Prop rule broken: daily loss of ${prop.dailyLossPct}%.`;
        events.push({ t, kind: 'prop-failed', text: stopReason }); finished = true;
      } else if (balance >= risk.startBalance * (1 + prop.profitTargetPct / 100) && tradeDays.size >= prop.minDays) {
        propStatus = 'passed'; stopReason = `Prop challenge passed: +${prop.profitTargetPct}% in ${tradeDays.size} trading days.`;
        events.push({ t, kind: 'prop-passed', text: stopReason }); finished = true;
      }
    }
  };

  const sizeFor = (dist: number): number => {
    if (risk.mode === 'fixedQty') return risk.qty;
    const budgetAcct = risk.mode === 'percent' ? balance * (risk.percent / 100) : risk.fixedR;
    const raw = (budgetAcct * rate) / (dist * spec.multiplier);
    return +(Math.floor(raw / spec.sizeStep + 1e-9) * spec.sizeStep).toFixed(sizeDp);
  };

  const open = (pd: Pending, raw: number, t: number) => {
    const fill = raw + pd.dir * (halfSpread + (pd.type === 'limit' ? 0 : slip));
    const stop = pd.stopLevel !== null ? pd.stopLevel : raw - pd.dir * pd.stopDist;
    const riskDist = Math.abs(fill - stop);
    if (pd.dir * (fill - stop) <= 0 || riskDist <= 0) return; // gapped through the stop
    const size = sizeFor(riskDist);
    if (!(size >= spec.minSize)) { diag.filtered.minSize++; return; }
    pos = {
      dir: pd.dir, orderType: pd.type, entryT: t, entryRaw: raw, entryFill: fill,
      initStop: stop, stop, stopKind: 'stop',
      target: ex.targetR ? fill + pd.dir * ex.targetR * riskDist : null,
      riskDist, size, remaining: size, grossUsd: 0, costsUsd: 0, exitNotional: 0, exitQty: 0,
      partialDone: false, beDone: false, trailing: false, bestPx: fill, worstPx: fill, bars: 0, ambiguous: false,
    };
    tradesToday++;
    tradeDays.add(Math.floor(t / dayMs));
  };

  /** Intrabar management of the open position on bar j. sameBarEntry: the position was filled inside this bar. */
  const manage = (p: Pos, j: number, sameBarEntry: boolean) => {
    const t = gs.t(j), o = gs.o(j), h = gs.h(j), l = gs.l(j);
    p.bars++;
    const fav = p.dir === 1 ? h : l, adv = p.dir === 1 ? l : h;
    // Gap through the stop at the open (not on the entry bar)
    if (!sameBarEntry && p.dir * (o - p.stop) <= 0) {
      p.worstPx = p.dir === 1 ? Math.min(p.worstPx, o) : Math.max(p.worstPx, o);
      exitAll(p, o, t, p.stopKind === 'stop' ? 'stop' : p.stopKind);
      return;
    }
    const stopHit = p.dir * (adv - p.stop) <= 0;
    const partialLvl = ex.partial && !p.partialDone ? p.entryFill + p.dir * ex.partial.atR * p.riskDist : null;
    const partialHit = partialLvl !== null && p.dir * (fav - partialLvl) >= 0;
    const targetHit = p.target !== null && p.dir * (fav - p.target) >= 0;
    // MAE/MFE (conservative: the whole bar counts)
    if (p.dir * (fav - p.bestPx) > 0) p.bestPx = fav;
    if (p.dir * (p.worstPx - adv) > 0) p.worstPx = adv;
    if (stopHit) {
      if (targetHit || partialHit) p.ambiguous = true; // both inside one bar: assume the stop came first
      exitAll(p, p.stop, t, p.stopKind === 'stop' ? 'stop' : p.stopKind);
      return;
    }
    if (sameBarEntry && p.orderType !== 'market') return; // filled mid-bar: don't credit a target in the same bar
    if (partialHit && partialLvl !== null && ex.partial) {
      const q = +(Math.floor((p.size * ex.partial.fraction) / spec.sizeStep + 1e-9) * spec.sizeStep).toFixed(sizeDp);
      if (q >= spec.minSize && q < p.remaining) {
        fillExit(p, q, partialLvl, true);
        p.partialDone = true;
      } else p.partialDone = true; // too small to split
    }
    if (targetHit && p.target !== null) exitAll(p, p.target, t, 'target', true);
  };

  /** After the bar closed: breakeven, trailing, time and session exits. */
  const afterClose = (p: Pos, j: number) => {
    const t = gs.t(j), c = gs.c(j);
    if (ex.breakevenAtR && !p.beDone && p.dir * (p.bestPx - (p.entryFill + p.dir * ex.breakevenAtR * p.riskDist)) >= 0) {
      const be = p.entryFill + p.dir * ex.breakevenLockR * p.riskDist;
      if (p.dir * (be - p.stop) > 0) { p.stop = be; p.stopKind = 'breakeven'; }
      p.beDone = true;
    }
    if (ex.trailing && p.dir * (p.bestPx - p.entryFill) >= ex.trailing.startR * p.riskDist && Number.isFinite(atr.value)) {
      const cand = p.bestPx - p.dir * ex.trailing.atrMult * atr.value;
      if (p.dir * (cand - p.stop) > 0) { p.stop = cand; p.stopKind = 'trailing'; p.trailing = true; }
    }
    if (ex.timeExitBars && p.bars >= ex.timeExitBars) { exitAll(p, c, t + tfMs, 'time'); return; }
    if (ex.sessionEndExit && intraday) {
      const endMin = settings.session.id === 'any' ? marketCloseMin(spec, t) : settings.session.end * 60;
      const s0 = minuteOfDay(t), s1 = s0 + tfMs / 60000;
      if (s0 < endMin && s1 >= endMin) { exitAll(p, c, t + tfMs, 'session end'); return; }
    }
    // Equity-based limits while a trade is open (closes it as a rule limit)
    const openPnl = toAcct((c - p.entryRaw) * p.dir * p.remaining * spec.multiplier + p.grossUsd - p.costsUsd);
    const dayLimit = risk.dailyLossPct ? (risk.dailyLossPct / 100) * dayStart : Infinity;
    const propDay = prop ? (prop.dailyLossPct / 100) * dayStart : Infinity;
    if (dayPnl + openPnl <= -Math.min(dayLimit, propDay)) exitAll(p, c, t + tfMs, 'rule limit');
  };

  const sessionOk = (tEntry: number) => {
    if (!intraday || settings.session.id === 'any') return true;
    const { start, end } = settings.session.id === 'custom' ? settings.session : SESSIONS[settings.session.id];
    const h = minuteOfDay(tEntry) / 60;
    return start < end ? h >= start && h < end : h >= start || h < end;
  };

  const step = (count: number): boolean => {
    let k = 0;
    while (!finished && i < n && k < count) {
      gs.advance(i);
      const t = gs.t(i);
      curO = gs.o(i); curH = gs.h(i); curL = gs.l(i); curC = gs.c(i);
      const v = gs.v(i);
      const day = Math.floor(t / dayMs);
      if (day !== curDay) { curDay = day; dayStart = balance; dayPnl = 0; dayHalted = false; tradesToday = 0; }

      // 1. Pending entry order
      let filledHere = false;
      if (pend) {
        const pd: Pending = pend;
        if (pd.type === 'market') {
          pend = null;
          if (t - pd.placedT > tfMs * 3) diag.filtered.expired++; // market was closed in between
          else { open(pd, curO, t); filledHere = !!pos; }
        } else {
          // A limit fills only if price trades through it; a stop fills when price reaches it.
          const touched = pd.type === 'limit'
            ? (pd.dir === 1 ? curL < pd.price : curH > pd.price)
            : (pd.dir === 1 ? curH >= pd.price : curL <= pd.price);
          if (touched) {
            pend = null;
            const raw = pd.type === 'limit' ? (pd.dir === 1 ? Math.min(curO, pd.price) : Math.max(curO, pd.price)) : (pd.dir === 1 ? Math.max(curO, pd.price) : Math.min(curO, pd.price));
            open(pd, raw, t); filledHere = !!pos;
          } else if (--pd.validLeft <= 0) { pend = null; diag.filtered.expired++; }
        }
      }

      // 2. Manage the open position inside this bar
      if (pos) manage(pos, i, filledHere);

      // 3. Indicators see this bar
      for (const x of indList) x.update(t, curO, curH, curL, curC, v);
      if (swingN) { recentH.push(curH); recentL.push(curL); if (recentH.length > swingN) { recentH.shift(); recentL.shift(); } }

      // 4. End-of-bar management
      if (pos) afterClose(pos, i);

      // 5. Signals at the close
      if (!finished) {
        const hitsLong = longConds.map(test);
        hitsLong.forEach((hit, ci) => { if (hit) diag.conditionHits[ci].hits++; });
        const longSig = rules.direction !== 'short' && hitsLong.length > 0 && hitsLong.every(Boolean);
        const shortSig = rules.direction !== 'long' && shortConds.length > 0 && shortConds.every(test);
        if (hitsLong.length && hitsLong.every(Boolean)) diag.allTogether++;
        const dir: 1 | -1 | 0 = longSig ? 1 : shortSig ? -1 : 0;
        const p = pos as Pos | null;
        if (p && dir !== 0 && dir !== p.dir && rules.direction === 'both') exitAll(p, curC, t + tfMs, 'signal');
        else if (!pos && !pend && dir !== 0 && i < n - 1) {
          diag.signals++;
          const tEntry = t + tfMs;
          const wd = new Date(tEntry).getUTCDay();
          if (!sessionOk(tEntry)) diag.filtered.session++;
          else if (!settings.weekdays.includes(wd)) diag.filtered.weekday++;
          else if (settings.news !== 'include' && (settings.news === 'skip') === newsDay(tEntry)) diag.filtered.news++;
          else if (dayHalted) diag.filtered.dayLimit++;
          else if (rules.maxTradesPerDay && tradesToday >= rules.maxTradesPerDay) diag.filtered.maxTrades++;
          else {
            const a = atr.value;
            let stopDist = 0, stopLevel: number | null = null;
            if (ex.stop.type === 'atr') stopDist = ex.stop.mult * a;
            else if (ex.stop.type === 'points') stopDist = ex.stop.value * unit;
            else if (recentL.length >= Math.min(swingN, 2)) stopLevel = dir === 1 ? Math.min(...recentL) - 0.1 * (a || 0) : Math.max(...recentH) + 0.1 * (a || 0);
            const ready = ex.stop.type === 'swing' ? stopLevel !== null && Number.isFinite(stopLevel) : Number.isFinite(stopDist) && stopDist > 0;
            if (ready) {
              const eo = rules.entryOrder;
              const pd: Pending = {
                dir, type: eo.type, stopDist, stopLevel, placedT: t,
                price: eo.type === 'limit' ? curC - dir * eo.offsetAtr * (a || 0) : eo.type === 'stop' ? (dir === 1 ? curH : curL) + dir * spec.tickSize : curC,
                validLeft: eo.type === 'market' ? 1 : eo.validBars,
              };
              if (eo.type === 'market' && settings.costs.fillModel === 'sameClose') open(pd, curC, t + tfMs);
              else pend = pd;
            }
          }
        }
      }

      prevO = curO; prevH = curH; prevL = curL; prevC = curC;
      i++; k++;
    }
    if (i >= n || finished) {
      if (pos && n > 0) {
        const last = Math.min(i, n) - 1;
        exitAll(pos as Pos, gs.c(last), gs.t(last) + tfMs, 'end of test');
      }
      finished = true;
      i = n;
    }
    return finished;
  };

  const result = (): RunResult => {
    let zero: string | null = null;
    if (!trades.length) {
      const f = diag.filtered;
      const never = diag.conditionHits.find((c) => c.hits === 0);
      if (n === 0) zero = `There's no ${settings.symbol} price data in this date range.`;
      else if (never) zero = `No bar met "${never.label}" in this range. Try a looser value or a longer date range.`;
      else if (diag.allTogether === 0 && longConds.length > 1) zero = 'Each entry rule was met on its own, but never all on the same bar. Try removing one rule.';
      else if (diag.signals === 0) zero = 'The rules never lined up while you were flat. Try a longer date range.';
      else if (f.session === diag.signals) zero = `${diag.signals} signals happened, but all were outside your session hours.`;
      else if (f.weekday + f.session === diag.signals) zero = `${diag.signals} signals happened, but all were on days or hours you excluded.`;
      else if (f.news > 0 && f.news + f.session + f.weekday >= diag.signals) zero = `${diag.signals} signals happened, but your news-day filter removed them.`;
      else if (f.minSize > 0) zero = 'Your risk per trade is too small for the minimum position size. Raise the risk or the balance.';
      else if (f.expired > 0) zero = 'Signals appeared, but your limit/stop orders were never filled before they expired.';
      else zero = 'No trades were taken with these settings.';
    }
    return {
      trades,
      startBalance: risk.startBalance,
      endBalance: balance,
      currency: risk.currency,
      rangeStart: n ? series.t[0] : 0,
      rangeEnd: n ? series.t[n - 1] + tfMs : 0,
      events,
      stopReason,
      diagnostics: diag,
      zeroTradeReason: zero,
      propStatus: prop ? (propStatus === 'in progress' && stopReason === null ? 'in progress' : propStatus) : null,
      tradingDays: tradeDays.size,
    };
  };

  return {
    total: n,
    get done() { return i; },
    guard: gs,
    step,
    result,
  };
}

/** Run to completion synchronously (tests, variants, worker). */
export function runSync(settings: BacktestSettings, series: Series, opts: RunOptions = {}): RunResult {
  const h = createRun(settings, series, opts);
  while (!h.step(1_000_000));
  return h.result();
}
