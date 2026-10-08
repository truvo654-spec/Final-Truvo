// Strategy rules: plain-English descriptions, short-side mirroring, validation,
// playbook templates and default settings.
import type { JournalPlaybook } from '../data/journalPlaybooks';
import { DATA_END, DATA_START, MAX_RULES } from './config';
import { parseDay, resolveSymbol, symbolSpec } from './marketData';
import {
  BacktestSettings, Condition, IndSpec, IndType, Operand, Op, SESSIONS, SessionId, StrategyRules, SUPPORTED_TIMEFRAMES, Timeframe,
} from './types';

let uid = 0;
export const newId = (p = 'c') => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`;

export const ind = (type: IndType, period?: number, session?: IndSpec['session']): Operand => ({ kind: 'ind', ind: { type, period, session } });
export const price = (field: 'close' | 'open' | 'high' | 'low' = 'close'): Operand => ({ kind: 'price', field });
export const val = (value: number): Operand => ({ kind: 'value', value });
export const cond = (left: Operand, op: Op, right: Operand): Condition => ({ id: newId(), left, op, right });

// ── Plain-English descriptions ──

export const IND_LABEL: Record<IndType, string> = {
  SMA: 'Simple moving average', EMA: 'Exponential moving average', RSI: 'RSI', ATR: 'ATR (volatility)', VWAP: 'VWAP',
  PDH: "Yesterday's high", PDL: "Yesterday's low", SESSION_HIGH: 'Session high', SESSION_LOW: 'Session low',
  HIGHEST: 'N-bar high', LOWEST: 'N-bar low', FVG_BULL: 'Bullish fair value gap', FVG_BEAR: 'Bearish fair value gap',
};
export const IND_HAS_PERIOD: IndType[] = ['SMA', 'EMA', 'RSI', 'ATR', 'HIGHEST', 'LOWEST'];

export function describeOperand(o: Operand): string {
  if (o.kind === 'value') return String(o.value);
  if (o.kind === 'price') return o.field === 'close' ? 'the close' : `the bar ${o.field}`;
  const { type, period, session } = o.ind;
  const sess = SESSIONS[session ?? 'asia'].label;
  switch (type) {
    case 'SMA': return `the ${period ?? 20}-bar SMA`;
    case 'EMA': return `the ${period ?? 20} EMA`;
    case 'RSI': return `RSI(${period ?? 14})`;
    case 'ATR': return `ATR(${period ?? 14})`;
    case 'VWAP': return 'VWAP';
    case 'PDH': return "yesterday's high";
    case 'PDL': return "yesterday's low";
    case 'SESSION_HIGH': return `the ${sess} session high`;
    case 'SESSION_LOW': return `the ${sess} session low`;
    case 'HIGHEST': return `the ${period ?? 20}-bar high`;
    case 'LOWEST': return `the ${period ?? 20}-bar low`;
    case 'FVG_BULL': return 'a bullish fair value gap';
    case 'FVG_BEAR': return 'a bearish fair value gap';
  }
}

const OP_TEXT: Record<Op, string> = { gt: 'is above', lt: 'is below', crossAbove: 'crosses above', crossBelow: 'crosses below' };
export const OP_LABEL: Record<Op, string> = { gt: 'is above', lt: 'is below', crossAbove: 'crosses above', crossBelow: 'crosses below' };

const isFvg = (o: Operand) => o.kind === 'ind' && (o.ind.type === 'FVG_BULL' || o.ind.type === 'FVG_BEAR');

export function describeCondition(c: Condition): string {
  if (isFvg(c.left)) return `${describeOperand(c.left)} forms`;
  return `${describeOperand(c.left)} ${OP_TEXT[c.op]} ${describeOperand(c.right)}`;
}

// ── Mirroring long rules for the short side ──

const MIRROR: Partial<Record<IndType, IndType>> = {
  PDH: 'PDL', PDL: 'PDH', SESSION_HIGH: 'SESSION_LOW', SESSION_LOW: 'SESSION_HIGH', HIGHEST: 'LOWEST', LOWEST: 'HIGHEST', FVG_BULL: 'FVG_BEAR', FVG_BEAR: 'FVG_BULL',
};
const isAtr = (o: Operand) => o.kind === 'ind' && o.ind.type === 'ATR';
const isRsi = (o: Operand) => o.kind === 'ind' && o.ind.type === 'RSI';
const FLIP: Record<Op, Op> = { gt: 'lt', lt: 'gt', crossAbove: 'crossBelow', crossBelow: 'crossAbove' };

function mirrorOperand(o: Operand, rsiSide: boolean): Operand {
  if (o.kind === 'ind' && MIRROR[o.ind.type]) return { kind: 'ind', ind: { ...o.ind, type: MIRROR[o.ind.type]! } };
  if (o.kind === 'value' && rsiSide) return { kind: 'value', value: 100 - o.value };
  return o;
}

export function mirrorCondition(c: Condition): Condition {
  if (isAtr(c.left) || isAtr(c.right)) return c; // volatility is not directional
  if (isFvg(c.left)) return { ...c, left: mirrorOperand(c.left, false) };
  const rsi = isRsi(c.left) || isRsi(c.right);
  return { ...c, left: mirrorOperand(c.left, rsi), op: FLIP[c.op], right: mirrorOperand(c.right, rsi) };
}

// ── Rule sentences for the setup summary and results ──

export function describeRules(r: StrategyRules, costUnit = 'pips'): { label: string; text: string }[] {
  const dir = r.direction === 'both' ? 'Long and short' : r.direction === 'long' ? 'Long only' : 'Short only';
  const entry = r.entry.length ? r.entry.map(describeCondition).join(', and ') : 'no entry rule yet';
  const order = r.entryOrder.type === 'market' ? 'at market'
    : r.entryOrder.type === 'limit' ? `with a limit order ${r.entryOrder.offsetAtr} ATR better than the signal close (valid ${r.entryOrder.validBars} bars)`
    : `with a stop order beyond the signal bar (valid ${r.entryOrder.validBars} bars)`;
  const x = r.exits;
  const stop = x.stop.type === 'atr' ? `${x.stop.mult} × ATR(14) from entry` : x.stop.type === 'points' ? `${x.stop.value} ${costUnit} from entry` : `beyond the last ${x.stop.lookback}-bar swing`;
  const out: { label: string; text: string }[] = [
    { label: 'Direction', text: `${dir}${r.direction === 'both' ? '. Short rules mirror the long rules.' : ''}` },
    { label: 'Entry', text: `${r.direction === 'short' ? 'Sell' : 'Buy'} when ${entry}, ${order}.` },
    { label: 'Stop loss', text: `${stop}.` },
    { label: 'Take profit', text: x.targetR ? `${x.targetR}R (${x.targetR} × the risk).` : 'No fixed target; exits come from the rules below.' },
  ];
  const mgmt: string[] = [];
  if (x.partial) mgmt.push(`close ${Math.round(x.partial.fraction * 100)}% at ${x.partial.atR}R`);
  if (x.breakevenAtR) mgmt.push(`move the stop to ${x.breakevenLockR ? `+${x.breakevenLockR}R` : 'breakeven'} at ${x.breakevenAtR}R`);
  if (x.trailing) mgmt.push(`trail the stop ${x.trailing.atrMult} × ATR behind price after ${x.trailing.startR}R`);
  if (x.timeExitBars) mgmt.push(`close after ${x.timeExitBars} bars`);
  if (x.sessionEndExit) mgmt.push('close at the end of the session');
  if (r.direction === 'both') mgmt.push('close if the opposite signal appears');
  if (mgmt.length) out.push({ label: 'Manage', text: mgmt[0][0].toUpperCase() + mgmt.join(', ').slice(1) + '.' });
  if (r.maxTradesPerDay) out.push({ label: 'Limit', text: `At most ${r.maxTradesPerDay} trade${r.maxTradesPerDay === 1 ? '' : 's'} a day.` });
  return out;
}

/** Number of rules, for the "too many rules" warning (stop and target are always present, so they don't count). */
export function ruleCount(s: BacktestSettings): number {
  const x = s.rules.exits;
  return s.rules.entry.length
    + (x.breakevenAtR ? 1 : 0) + (x.trailing ? 1 : 0) + (x.partial ? 1 : 0) + (x.timeExitBars ? 1 : 0) + (x.sessionEndExit ? 1 : 0)
    + (s.rules.maxTradesPerDay ? 1 : 0)
    + (s.session.id !== 'any' ? 1 : 0) + (s.weekdays.length < 5 ? 1 : 0) + (s.news !== 'include' ? 1 : 0);
}
export const tooManyRules = (s: BacktestSettings) => ruleCount(s) > MAX_RULES;

// ── Validation ──

export interface Problem { field: string; message: string }

export function validateSettings(s: BacktestSettings): Problem[] {
  const out: Problem[] = [];
  const spec = symbolSpec(s.symbol);
  if (!spec) out.push({ field: 'symbol', message: `There's no price data for "${s.symbol}" yet. Pick one of the listed markets.` });
  if (!SUPPORTED_TIMEFRAMES.includes(s.timeframe)) out.push({ field: 'timeframe', message: `${s.timeframe} bars need a tick data feed. Choose 5m or higher.` });
  const from = parseDay(s.from), to = parseDay(s.to);
  if (!s.from || !s.to || Number.isNaN(from) || Number.isNaN(to)) out.push({ field: 'dates', message: 'Choose a start and end date.' });
  else if (from >= to) out.push({ field: 'dates', message: 'The end date must be after the start date.' });
  else if (from < parseDay(DATA_START) || to > parseDay(DATA_END)) out.push({ field: 'dates', message: `Price data covers ${DATA_START} to ${DATA_END}.` });
  if (!s.rules.entry.length) out.push({ field: 'rules', message: 'Add at least one entry rule.' });
  s.rules.entry.forEach((c) => [c.left, c.right].forEach((o) => {
    if (o.kind === 'ind' && IND_HAS_PERIOD.includes(o.ind.type) && (!o.ind.period || o.ind.period < 2 || o.ind.period > 500)) out.push({ field: 'rules', message: `${IND_LABEL[o.ind.type]} needs a length between 2 and 500.` });
    if (o.kind === 'value' && !Number.isFinite(o.value)) out.push({ field: 'rules', message: 'Every rule needs a number to compare with.' });
  }));
  const st = s.rules.exits.stop;
  if ((st.type === 'atr' && !(st.mult > 0)) || (st.type === 'points' && !(st.value > 0)) || (st.type === 'swing' && !(st.lookback >= 2))) out.push({ field: 'rules', message: 'The stop loss must be greater than zero.' });
  if (s.rules.exits.targetR !== null && !(s.rules.exits.targetR > 0)) out.push({ field: 'rules', message: 'The take-profit must be greater than 0R.' });
  if (!(s.risk.startBalance > 0)) out.push({ field: 'risk', message: 'Enter a starting balance above zero.' });
  if (s.risk.mode === 'percent' && !(s.risk.percent > 0 && s.risk.percent <= 10)) out.push({ field: 'risk', message: 'Risk per trade must be between 0.01% and 10%.' });
  if (s.risk.mode === 'fixedR' && !(s.risk.fixedR > 0)) out.push({ field: 'risk', message: 'Enter the dollar amount to risk per trade.' });
  if (s.risk.mode === 'fixedQty' && !(s.risk.qty > 0)) out.push({ field: 'risk', message: 'Enter a position size above zero.' });
  if (!s.weekdays.length) out.push({ field: 'market', message: 'Pick at least one weekday to trade.' });
  if (s.session.id === 'custom' && s.session.start === s.session.end) out.push({ field: 'market', message: 'Custom hours need a different start and end time.' });
  return out;
}

// ── Playbook templates ──

interface Template { tf: Timeframe; rules: StrategyRules; news?: BacktestSettings['news'] }

const exits = (p: Partial<StrategyRules['exits']>): StrategyRules['exits'] => ({
  stop: { type: 'atr', mult: 1.5 }, targetR: 2, breakevenAtR: null, breakevenLockR: 0, trailing: null, partial: null, timeExitBars: null, sessionEndExit: false, ...p,
});

export function templateFor(pb: Pick<JournalPlaybook, 'name' | 'style'> | null): Template {
  const n = `${pb?.name ?? ''} ${pb?.style ?? ''}`.toLowerCase();
  const T = (tf: Timeframe, entry: Condition[], ex: Partial<StrategyRules['exits']>, more: Partial<StrategyRules> = {}, news?: Template['news']): Template => ({
    tf, news, rules: { direction: 'both', entry, entryOrder: { type: 'market' }, exits: exits(ex), maxTradesPerDay: 2, ...more },
  });
  if (n.includes('silver') || n.includes('fvg')) return T('15m', [cond(ind('FVG_BULL'), 'gt', val(0.5)), cond(price(), 'gt', ind('VWAP'))], { stop: { type: 'atr', mult: 1 }, targetR: 2, breakevenAtR: 1 }, { entryOrder: { type: 'limit', offsetAtr: 0.3, validBars: 3 } });
  if (n.includes('opening range') || n.includes('orb')) return T('5m', [cond(price(), 'crossAbove', ind('HIGHEST', 6))], { stop: { type: 'atr', mult: 1 }, targetR: 1.8, sessionEndExit: true }, { maxTradesPerDay: 1 });
  if (n.includes('vwap')) return T('5m', [cond(ind('RSI', 14), 'crossAbove', val(30)), cond(price(), 'lt', ind('VWAP'))], { stop: { type: 'atr', mult: 1.2 }, targetR: 1.5, sessionEndExit: true });
  if (n.includes('breakout') || n.includes('momentum')) return T('15m', [cond(price(), 'crossAbove', ind('HIGHEST', 20))], { stop: { type: 'atr', mult: 1.5 }, targetR: 4, partial: { atR: 2, fraction: 0.5 }, breakevenAtR: 2, sessionEndExit: true });
  if (n.includes('scalp') || n.includes('intraday')) return T('5m', [cond(ind('EMA', 9), 'crossAbove', ind('EMA', 21))], { stop: { type: 'atr', mult: 1 }, targetR: 1.5, sessionEndExit: true }, { maxTradesPerDay: 3 });
  if (n.includes('pullback') || n.includes('trend')) return T('15m', [cond(price(), 'gt', ind('EMA', 50)), cond(price(), 'crossAbove', ind('EMA', 20))], { stop: { type: 'atr', mult: 1.5 }, targetR: 2, breakevenAtR: 1 });
  if (n.includes('fade') || n.includes('reversion') || n.includes('range')) return T('15m', [cond(ind('RSI', 14), 'crossAbove', val(30))], { stop: { type: 'atr', mult: 1.2 }, targetR: 1.5, sessionEndExit: true });
  if (n.includes('news') || n.includes('event')) return T('5m', [cond(price(), 'crossAbove', ind('HIGHEST', 6))], { stop: { type: 'atr', mult: 1.5 }, targetR: 2 }, { maxTradesPerDay: 1 }, 'only');
  if (n.includes('swing')) return T('4h', [cond(price(), 'gt', ind('EMA', 50)), cond(price(), 'crossAbove', ind('EMA', 20))], { stop: { type: 'swing', lookback: 10 }, targetR: 2.5 }, { maxTradesPerDay: 1 });
  if (n.includes('position') || n.includes('long-term')) return T('1D', [cond(price(), 'crossAbove', ind('HIGHEST', 20))], { stop: { type: 'atr', mult: 2.5 }, targetR: 3 }, { maxTradesPerDay: 1 });
  return T('15m', [cond(price(), 'crossAbove', ind('HIGHEST', 20))], { stop: { type: 'atr', mult: 1.5 }, targetR: 2 });
}

const MARKET_DEFAULT: Record<string, string> = { Forex: 'EUR/USD', Indices: 'MNQ', Commodity: 'MGC', Crypto: 'BTC/USDT', Stocks: 'NVDA' };

/** The instrument to test a playbook on: its first instrument the feed has, otherwise a default for its market. */
export function symbolForPlaybook(pb: JournalPlaybook | null, mostTraded?: string): string {
  if (mostTraded) { const r = resolveSymbol(mostTraded); if (r) return r; }
  for (const s of pb?.symbols || []) { const r = resolveSymbol(s); if (r) return r; }
  for (const m of pb?.markets || []) if (MARKET_DEFAULT[m]) return MARKET_DEFAULT[m];
  return 'EUR/USD';
}

export function sessionFromWindow(w: JournalPlaybook['window']): BacktestSettings['session'] {
  if (!w) return { id: 'any', start: 0, end: 24 };
  const known = (Object.entries(SESSIONS) as [SessionId, { start: number; end: number }][]).find(([, v]) => v.start === w.start && v.end === w.end);
  return known ? { id: known[0], start: w.start, end: w.end } : { id: 'custom', start: w.start, end: w.end };
}

export interface JournalRules { maxRisk: number; maxDailyLoss: number; maxTrades: number; stopAfterLosses: number }

export const presetRange = (months: number | 'max'): { from: string; to: string } => {
  if (months === 'max') return { from: DATA_START, to: DATA_END };
  const end = new Date(parseDay(DATA_END));
  const start = new Date(end); start.setUTCMonth(start.getUTCMonth() - months);
  const from = start.toISOString().slice(0, 10);
  return { from: from < DATA_START ? DATA_START : from, to: DATA_END };
};

export function defaultSettings(opts: { playbook?: JournalPlaybook | null; journalRules?: JournalRules; mostTraded?: string } = {}): BacktestSettings {
  const pb = opts.playbook ?? null;
  const tpl = templateFor(pb);
  const jr = opts.journalRules;
  const rules: StrategyRules = { ...tpl.rules, maxTradesPerDay: pb?.maxTradesPerDay ?? jr?.maxTrades ?? tpl.rules.maxTradesPerDay };
  const symbol = symbolForPlaybook(pb, opts.mostTraded);
  return {
    name: pb ? `${pb.name} backtest` : 'New backtest',
    playbookId: pb?.id ?? null,
    symbol,
    timeframe: tpl.tf,
    ...presetRange(24),
    session: sessionFromWindow(pb?.window ?? null),
    weekdays: [1, 2, 3, 4, 5],
    news: tpl.news ?? 'include',
    rules,
    risk: {
      mode: 'percent', percent: pb?.riskPerTrade ?? jr?.maxRisk ?? 1, fixedR: 500, qty: 1, startBalance: 100000, currency: 'USD',
      dailyLossPct: jr?.maxDailyLoss ?? 3, maxDrawdownPct: null,
    },
    costs: { enabled: true, brokerId: null, ...defaultCostsFor(symbol), fillModel: 'nextOpen' },
    prop: null,
  };
}

/** Normalise costs to the symbol's units when the symbol changes. */
export function defaultCostsFor(symbol: string): { commissionPerSide: number; spread: number; slippage: number } {
  const spec = symbolSpec(symbol);
  switch (spec?.assetClass) {
    case 'Forex': return { commissionPerSide: 3.5, spread: 0.2, slippage: 0.2 };
    case 'Futures': return { commissionPerSide: 0.62, spread: 1, slippage: 1 };
    case 'Crypto': return { commissionPerSide: 30, spread: 5, slippage: 5 };
    case 'Stocks': return { commissionPerSide: 0.005, spread: 1, slippage: 1 };
    default: return { commissionPerSide: 0, spread: 0, slippage: 0 };
  }
}

export const deepClone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
