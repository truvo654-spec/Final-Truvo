import { BacktestResult, Bar, Condition, ExitReason, Metrics, RuleGroup, Strategy, Trade } from './types';
import { atr as atrFn, series } from './indicators';
import { getInstrument, InstrumentSpec, TIMEFRAMES } from './marketData';

const MS_DAY = 86_400_000;

/** One boolean per bar: does this rule group fire on that bar's close. */
export function evalGroup(group: RuleGroup, bars: Bar[]): boolean[] {
  const n = bars.length;
  const out = new Array<boolean>(n).fill(false);
  if (!group.conditions.length) return out;
  const prepared = group.conditions.map((c: Condition) => ({ c, l: series(bars, c.left), r: series(bars, c.right) }));
  for (let i = 1; i < n; i++) {
    let all = true;
    let any = false;
    for (const { c, l, r } of prepared) {
      const lv = l[i];
      const rv = r[i];
      let ok = false;
      if (isFinite(lv) && isFinite(rv)) {
        if (c.op === 'above') ok = lv > rv;
        else if (c.op === 'below') ok = lv < rv;
        else {
          const lp = l[i - 1];
          const rp = r[i - 1];
          if (isFinite(lp) && isFinite(rp)) ok = c.op === 'crossesAbove' ? lp <= rp && lv > rv : lp >= rp && lv < rv;
        }
      }
      if (ok) any = true;
      else all = false;
    }
    out[i] = group.logic === 'AND' ? all : any;
  }
  return out;
}

const vpu = (ins: InstrumentSpec, price: number) => (ins.jpyQuote ? ins.valuePerUnit / price : ins.valuePerUnit);
const round2 = (x: number) => Math.round(x * 100) / 100;

interface Position {
  dir: 1 | -1;
  entryIdx: number;
  entryPrice: number;
  lots: number;
  stop?: number;
  target?: number;
  trail?: number;
  stopDist?: number;
  riskMoney?: number;
  balanceAtEntry: number;
  extreme: number;
}

export function runBacktest(strategy: Strategy, bars: Bar[]): BacktestResult {
  const ins = getInstrument(strategy.instrument);
  const tf = TIMEFRAMES.find((t) => t.id === strategy.timeframe)!;
  const n = bars.length;
  const capital = strategy.capital;
  const half = (ins.pip * strategy.costs.spreadPips) / 2;
  const slip = ins.pip * strategy.costs.slippagePips;
  const ex = strategy.exit;

  const longSig = evalGroup(strategy.longEntry, bars);
  const shortSig = evalGroup(strategy.shortEntry, bars);
  const exitSig = evalGroup(ex.exitRules, bars);
  const atr14 = series(bars, { kind: 'atr', period: 14 });
  const longOk = strategy.direction !== 'short';
  const shortOk = strategy.direction !== 'long';

  const trades: Trade[] = [];
  const equity = new Array<number>(n).fill(capital);
  let balance = capital;
  let pos: Position | null = null;
  let pendingEntry: 1 | -1 | null = null;
  let pendingExit: ExitReason | null = null;
  let blown = false;
  let id = 1;

  const close = (p: Position, price: number, i: number, reason: ExitReason) => {
    const gross = p.dir * (price - p.entryPrice) * vpu(ins, price) * p.lots;
    const pnl = gross - strategy.costs.commissionPerLot * p.lots;
    const before = balance;
    balance += pnl;
    trades.push({
      id: id++,
      dir: p.dir,
      entryIdx: p.entryIdx,
      exitIdx: i,
      entryTime: bars[p.entryIdx].t,
      exitTime: bars[i].t,
      entryPrice: p.entryPrice,
      exitPrice: price,
      lots: p.lots,
      pnl,
      pnlPct: before > 0 ? (pnl / before) * 100 : 0,
      pips: (p.dir * (price - p.entryPrice)) / ins.pip,
      r: p.riskMoney && p.riskMoney > 0 ? pnl / p.riskMoney : null,
      bars: i - p.entryIdx + 1,
      reason,
      stopPrice: p.stop,
      targetPrice: p.target,
    });
    if (balance <= 0) {
      balance = 0;
      blown = true;
    }
  };

  const open = (dir: 1 | -1, i: number) => {
    const b = bars[i];
    const price = b.o + dir * half + dir * slip;
    const a = isFinite(atr14[i - 1]) ? atr14[i - 1] : atr14[i];
    let stopDist: number | undefined;
    if (ex.stopLoss.type === 'pips') stopDist = ex.stopLoss.value * ins.pip;
    else if (ex.stopLoss.type === 'atr') stopDist = isFinite(a) ? ex.stopLoss.value * a : undefined;
    else if (ex.stopLoss.type === 'percent') stopDist = (price * ex.stopLoss.value) / 100;
    if (ex.stopLoss.type !== 'none' && (!stopDist || !isFinite(stopDist) || stopDist <= 0)) return;

    let targetDist: number | undefined;
    if (ex.takeProfit.type === 'rr') targetDist = stopDist ? stopDist * ex.takeProfit.value : undefined;
    else if (ex.takeProfit.type === 'pips') targetDist = ex.takeProfit.value * ins.pip;
    else if (ex.takeProfit.type === 'atr') targetDist = isFinite(a) ? ex.takeProfit.value * a : undefined;
    else if (ex.takeProfit.type === 'percent') targetDist = (price * ex.takeProfit.value) / 100;

    let lots = strategy.sizing.lots;
    if (strategy.sizing.mode === 'risk' && stopDist) lots = (balance * (strategy.sizing.riskPct / 100)) / (stopDist * vpu(ins, price));
    lots = Math.min(strategy.sizing.maxLots, Math.max(0.01, round2(lots)));
    if (!isFinite(lots)) return;

    pos = {
      dir,
      entryIdx: i,
      entryPrice: price,
      lots,
      stop: stopDist ? price - dir * stopDist : undefined,
      target: targetDist ? price + dir * targetDist : undefined,
      stopDist,
      riskMoney: stopDist ? stopDist * vpu(ins, price) * lots : undefined,
      balanceAtEntry: balance,
      extreme: dir === 1 ? b.h : b.l,
    };
  };

  for (let i = 0; i < n && !blown; i++) {
    const b = bars[i];

    // 1. orders decided on the previous close fill at this open
    if (pos && pendingExit) {
      close(pos, b.o - pos.dir * half - pos.dir * slip, i, pendingExit);
      pos = null;
      pendingExit = null;
      if (blown) break;
    }
    if (!pos && pendingEntry) {
      open(pendingEntry, i);
      pendingEntry = null;
    }

    // 2. stop and target inside the bar. If both are touched the stop is assumed first.
    if (pos) {
      const p: Position = pos;
      const trailBetter = p.trail !== undefined && (p.stop === undefined || (p.dir === 1 ? p.trail > p.stop : p.trail < p.stop));
      const stopLevel = trailBetter ? p.trail : p.stop;
      let exited = false;
      if (p.dir === 1) {
        if (stopLevel !== undefined && b.l <= stopLevel) {
          close(p, Math.min(stopLevel, b.o) - half - slip, i, trailBetter ? 'trailing' : 'stop');
          exited = true;
        } else if (p.target !== undefined && b.h >= p.target) {
          close(p, Math.max(p.target, b.o) - half, i, 'target');
          exited = true;
        }
      } else if (stopLevel !== undefined && b.h >= stopLevel) {
        close(p, Math.max(stopLevel, b.o) + half + slip, i, trailBetter ? 'trailing' : 'stop');
        exited = true;
      } else if (p.target !== undefined && b.l <= p.target) {
        close(p, Math.min(p.target, b.o) + half, i, 'target');
        exited = true;
      }
      if (exited) {
        pos = null;
        if (blown) break;
      }
    }

    // 3. end-of-bar housekeeping: trailing stop and time exit
    if (pos) {
      const p: Position = pos;
      p.extreme = p.dir === 1 ? Math.max(p.extreme, b.h) : Math.min(p.extreme, b.l);
      if (ex.trailing.enabled) {
        const dist = ex.trailing.type === 'pips' ? ex.trailing.value * ins.pip : isFinite(atr14[i]) ? ex.trailing.value * atr14[i] : NaN;
        if (isFinite(dist) && dist > 0) {
          const next = p.dir === 1 ? p.extreme - dist : p.extreme + dist;
          p.trail = p.trail === undefined ? next : p.dir === 1 ? Math.max(p.trail, next) : Math.min(p.trail, next);
        }
      }
      if (ex.timeExitBars > 0 && i - p.entryIdx + 1 >= ex.timeExitBars) {
        close(p, b.c - p.dir * half - p.dir * slip, i, 'time');
        pos = null;
        if (blown) break;
      }
    }

    // 4. look for signals on this close. They act on the next bar's open.
    if (i < n - 1) {
      if (pos) {
        const p: Position = pos;
        const opposite = p.dir === 1 ? shortSig[i] : longSig[i];
        if (exitSig[i]) pendingExit = 'rule';
        else if (ex.exitOnOpposite && opposite) {
          pendingExit = 'opposite';
          if ((p.dir === 1 && shortOk) || (p.dir === -1 && longOk)) pendingEntry = p.dir === 1 ? -1 : 1;
        }
      } else if (!pendingEntry) {
        if (longOk && longSig[i]) pendingEntry = 1;
        else if (shortOk && shortSig[i]) pendingEntry = -1;
      }
    }

    // 5. mark to market
    equity[i] = balance + (pos ? (pos as Position).dir * (b.c - (pos as Position).entryPrice) * vpu(ins, b.c) * (pos as Position).lots : 0);
  }

  if (pos && !blown) {
    const last = bars[n - 1];
    close(pos, last.c - (pos as Position).dir * half - (pos as Position).dir * slip, n - 1, 'end');
    pos = null;
    equity[n - 1] = balance;
  }
  if (blown) {
    const from = trades.length ? trades[trades.length - 1].exitIdx : 0;
    for (let i = from; i < n; i++) equity[i] = 0;
  }

  const barsPerYear = tf.barsPerYear;
  const years = Math.max((bars[n - 1].t - bars[0].t) / (365.25 * MS_DAY), 1 / 365);
  const metrics = computeMetrics(trades, equity, bars, capital, barsPerYear, years);

  // drawdown curve
  const drawdown = new Array<number>(n).fill(0);
  let peak = capital;
  for (let i = 0; i < n; i++) {
    peak = Math.max(peak, equity[i]);
    drawdown[i] = peak > 0 ? ((equity[i] - peak) / peak) * 100 : 0;
  }

  // monthly returns
  const monthly: BacktestResult['monthly'] = [];
  let prevEnd = capital;
  for (let i = 0; i < n; i++) {
    const d = new Date(bars[i].t);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const nextKey = i + 1 < n ? (() => { const nd = new Date(bars[i + 1].t); return `${nd.getUTCFullYear()}-${String(nd.getUTCMonth() + 1).padStart(2, '0')}`; })() : null;
    if (key !== nextKey) {
      monthly.push({ key, year: d.getUTCFullYear(), month: d.getUTCMonth(), ret: prevEnd > 0 ? (equity[i] / prevEnd - 1) * 100 : 0 });
      prevEnd = equity[i];
    }
  }

  const exitReasons: Record<ExitReason, number> = { stop: 0, target: 0, trailing: 0, time: 0, opposite: 0, rule: 0, end: 0 };
  trades.forEach((t) => (exitReasons[t.reason] += 1));

  const buyHoldEquity = bars.map((b) => capital * (b.c / bars[0].o));
  return {
    strategy,
    bars,
    trades,
    equity,
    drawdown,
    metrics,
    buyHoldPct: (bars[n - 1].c / bars[0].o - 1) * 100,
    buyHoldEquity,
    monthly,
    exitReasons,
    blown,
    years,
    barsPerYear,
  };
}

export function computeMetrics(trades: Trade[], equity: number[], bars: Bar[], startCapital: number, barsPerYear: number, years: number): Metrics {
  const n = equity.length;
  const final = n ? equity[n - 1] : startCapital;
  const netProfit = final - startCapital;

  // drawdown
  let peak = startCapital;
  let peakIdx = -1;
  let maxDD = 0;
  let maxDDMoney = 0;
  let maxDDBars = 0;
  for (let i = 0; i < n; i++) {
    if (equity[i] >= peak) {
      peak = equity[i];
      peakIdx = i;
    } else {
      const dd = peak > 0 ? ((peak - equity[i]) / peak) * 100 : 0;
      maxDD = Math.max(maxDD, dd);
      maxDDMoney = Math.max(maxDDMoney, peak - equity[i]);
      maxDDBars = Math.max(maxDDBars, i - peakIdx);
    }
  }

  // daily returns for Sharpe and Sortino
  const dayEnd = new Map<number, number>();
  for (let i = 0; i < n; i++) dayEnd.set(Math.floor(bars[i].t / MS_DAY), equity[i]);
  const days = Array.from(dayEnd.entries()).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const rets: number[] = [];
  let prev = startCapital;
  for (const v of days) {
    rets.push(prev > 0 ? v / prev - 1 : 0);
    prev = v;
  }
  const mean = rets.length ? rets.reduce((a, b) => a + b, 0) / rets.length : 0;
  const sd = rets.length > 1 ? Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1)) : 0;
  const down = rets.length ? Math.sqrt(rets.reduce((a, b) => a + Math.min(b, 0) ** 2, 0) / rets.length) : 0;
  const sharpe = sd > 0 ? (mean / sd) * Math.sqrt(252) : 0;
  const sortino = down > 0 ? (mean / down) * Math.sqrt(252) : 0;

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const grossProfit = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
  const avgWin = wins.length ? grossProfit / wins.length : 0;
  const avgLoss = losses.length ? -grossLoss / losses.length : 0;
  const rTrades = trades.filter((t) => t.r !== null);
  const cagr = final > 0 && startCapital > 0 && years > 0 ? (Math.pow(final / startCapital, 1 / years) - 1) * 100 : final <= 0 ? -100 : 0;

  let cw = 0;
  let cl = 0;
  let maxW = 0;
  let maxL = 0;
  for (const t of trades) {
    if (t.pnl > 0) {
      cw++;
      cl = 0;
    } else {
      cl++;
      cw = 0;
    }
    maxW = Math.max(maxW, cw);
    maxL = Math.max(maxL, cl);
  }
  const longs = trades.filter((t) => t.dir === 1);
  const shorts = trades.filter((t) => t.dir === -1);
  const barsIn = trades.reduce((a, t) => a + t.bars, 0);
  const wr = (arr: Trade[]) => (arr.length ? (arr.filter((t) => t.pnl > 0).length / arr.length) * 100 : 0);

  return {
    netProfit,
    returnPct: startCapital > 0 ? (netProfit / startCapital) * 100 : 0,
    cagr,
    maxDrawdownPct: maxDD,
    maxDrawdownBars: maxDDBars,
    maxDrawdownMoney: maxDDMoney,
    sharpe,
    sortino,
    calmar: maxDD > 0 ? cagr / maxDD : 0,
    volatilityPct: sd * Math.sqrt(252) * 100,
    trades: trades.length,
    winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    avgWin,
    avgLoss,
    payoff: avgLoss < 0 ? avgWin / Math.abs(avgLoss) : 0,
    expectancy: trades.length ? netProfit / trades.length : 0,
    avgR: rTrades.length ? rTrades.reduce((a, t) => a + (t.r as number), 0) / rTrades.length : null,
    best: trades.length ? Math.max(...trades.map((t) => t.pnl)) : 0,
    worst: trades.length ? Math.min(...trades.map((t) => t.pnl)) : 0,
    maxConsecWins: maxW,
    maxConsecLosses: maxL,
    avgBars: trades.length ? barsIn / trades.length : 0,
    exposurePct: n ? Math.min(100, (barsIn / n) * 100) : 0,
    recoveryFactor: maxDDMoney > 0 ? netProfit / maxDDMoney : 0,
    grossProfit,
    grossLoss,
    longTrades: longs.length,
    shortTrades: shorts.length,
    longNet: longs.reduce((a, t) => a + t.pnl, 0),
    shortNet: shorts.reduce((a, t) => a + t.pnl, 0),
    longWinRate: wr(longs),
    shortWinRate: wr(shorts),
  };
}

/** Results for the first part of the history and the rest, for a quick out-of-sample check. */
export function splitMetrics(result: BacktestResult, ratio = 0.7) {
  const n = result.bars.length;
  const cut = Math.floor(n * ratio);
  const start = result.strategy.capital;
  const eqA = result.equity.slice(0, cut);
  const eqB = result.equity.slice(cut);
  const capB = cut > 0 ? result.equity[cut - 1] : start;
  const yearsA = Math.max((result.bars[cut - 1].t - result.bars[0].t) / (365.25 * MS_DAY), 1 / 365);
  const yearsB = Math.max((result.bars[n - 1].t - result.bars[cut].t) / (365.25 * MS_DAY), 1 / 365);
  const inSample = computeMetrics(result.trades.filter((t) => t.exitIdx < cut).map((t) => t), eqA, result.bars.slice(0, cut), start, result.barsPerYear, yearsA);
  const outSample = computeMetrics(result.trades.filter((t) => t.exitIdx >= cut), eqB, result.bars.slice(cut), capB, result.barsPerYear, yearsB);
  return { cut, inSample, outSample };
}

export { atrFn };
