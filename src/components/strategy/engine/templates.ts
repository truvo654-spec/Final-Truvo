import { Condition, ExitConfig, Operand, Operator, RuleGroup, Strategy } from './types';
import { getInstrument } from './marketData';

let counter = 0;
export const uid = (p = 'c') => `${p}_${Date.now().toString(36)}_${(counter++).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export const price = (): Operand => ({ kind: 'price', field: 'close' });
export const num = (v: number): Operand => ({ kind: 'value', value: v });
export const ma = (kind: 'sma' | 'ema', period: number): Operand => ({ kind, period, field: 'close' });
export const cond = (left: Operand, op: Operator, right: Operand): Condition => ({ id: uid(), left, op, right });
export const group = (logic: 'AND' | 'OR', conditions: Condition[]): RuleGroup => ({ logic, conditions });
export const emptyGroup = (): RuleGroup => ({ logic: 'AND', conditions: [] });

export const defaultExit = (): ExitConfig => ({
  stopLoss: { type: 'atr', value: 2 },
  takeProfit: { type: 'rr', value: 2 },
  trailing: { enabled: false, type: 'atr', value: 2.5 },
  timeExitBars: 0,
  exitOnOpposite: false,
  exitRules: emptyGroup(),
});

export interface Template {
  id: string;
  name: string;
  blurb: string;
  style: string;
  build: () => Strategy;
}

const base = (name: string): Strategy => {
  const ins = getInstrument('EURUSD');
  return {
    id: uid('s'),
    name,
    instrument: 'EURUSD',
    timeframe: '4H',
    period: '3Y',
    direction: 'both',
    longEntry: emptyGroup(),
    shortEntry: emptyGroup(),
    exit: defaultExit(),
    sizing: { mode: 'risk', riskPct: 1, lots: 0.1, maxLots: 50 },
    capital: 10000,
    costs: { spreadPips: ins.defaultSpreadPips, commissionPerLot: ins.defaultCommission, slippagePips: 0.2 },
  };
};

export const TEMPLATES: Template[] = [
  {
    id: 'ema-cross',
    name: 'EMA trend crossover',
    style: 'Trend following',
    blurb: 'Buys when a fast average crosses above a slow one, sells when it crosses below. Stops are 2× ATR and the target is 2.5× the risk.',
    build: () => {
      const s = base('EMA trend crossover');
      s.longEntry = group('AND', [cond(ma('ema', 20), 'crossesAbove', ma('ema', 50))]);
      s.shortEntry = group('AND', [cond(ma('ema', 20), 'crossesBelow', ma('ema', 50))]);
      s.exit = { ...defaultExit(), stopLoss: { type: 'atr', value: 2 }, takeProfit: { type: 'rr', value: 2.5 }, exitOnOpposite: true };
      return s;
    },
  },
  {
    id: 'rsi-reversion',
    name: 'RSI mean reversion',
    style: 'Mean reversion',
    blurb: 'Fades stretched moves: buys when RSI climbs back above 30 while price holds above the 200 average, sells the mirror image. Closes after 24 bars if nothing happens.',
    build: () => {
      const s = base('RSI mean reversion');
      s.longEntry = group('AND', [cond({ kind: 'rsi', period: 14 }, 'crossesAbove', num(30)), cond(price(), 'above', ma('sma', 200))]);
      s.shortEntry = group('AND', [cond({ kind: 'rsi', period: 14 }, 'crossesBelow', num(70)), cond(price(), 'below', ma('sma', 200))]);
      s.exit = { ...defaultExit(), stopLoss: { type: 'atr', value: 1.5 }, takeProfit: { type: 'rr', value: 1.5 }, timeExitBars: 24 };
      return s;
    },
  },
  {
    id: 'bollinger-breakout',
    name: 'Bollinger band breakout',
    style: 'Breakout',
    blurb: 'Goes with a close outside the 20-period band and leaves when price falls back through the middle line.',
    build: () => {
      const s = base('Bollinger band breakout');
      s.longEntry = group('AND', [cond(price(), 'crossesAbove', { kind: 'bbUpper', period: 20, mult: 2 })]);
      s.shortEntry = group('AND', [cond(price(), 'crossesBelow', { kind: 'bbLower', period: 20, mult: 2 })]);
      s.exit = {
        ...defaultExit(),
        stopLoss: { type: 'atr', value: 2 },
        takeProfit: { type: 'none', value: 0 },
        exitRules: group('OR', [cond(price(), 'crossesBelow', { kind: 'bbMid', period: 20, mult: 2 }), cond(price(), 'crossesAbove', { kind: 'bbMid', period: 20, mult: 2 })]),
      };
      return s;
    },
  },
  {
    id: 'macd-momentum',
    name: 'MACD momentum',
    style: 'Momentum',
    blurb: 'Enters when MACD crosses its signal line on the right side of zero, then trails the stop behind the move.',
    build: () => {
      const s = base('MACD momentum');
      const m: Operand = { kind: 'macd', period: 12, period2: 26, period3: 9 };
      const sg: Operand = { kind: 'macdSignal', period: 12, period2: 26, period3: 9 };
      s.longEntry = group('AND', [cond(m, 'crossesAbove', sg), cond(m, 'above', num(0))]);
      s.shortEntry = group('AND', [cond(m, 'crossesBelow', sg), cond(m, 'below', num(0))]);
      s.exit = { ...defaultExit(), stopLoss: { type: 'atr', value: 1.8 }, takeProfit: { type: 'none', value: 0 }, trailing: { enabled: true, type: 'atr', value: 2.5 } };
      return s;
    },
  },
  {
    id: 'donchian',
    name: 'Donchian channel breakout',
    style: 'Breakout',
    blurb: 'A classic channel breakout: buy a new 20-bar high, sell a new 20-bar low. Wide stop, trailing exit.',
    build: () => {
      const s = base('Donchian channel breakout');
      s.longEntry = group('AND', [cond(price(), 'crossesAbove', { kind: 'donchianHigh', period: 20 })]);
      s.shortEntry = group('AND', [cond(price(), 'crossesBelow', { kind: 'donchianLow', period: 20 })]);
      s.exit = { ...defaultExit(), stopLoss: { type: 'atr', value: 2.5 }, takeProfit: { type: 'none', value: 0 }, trailing: { enabled: true, type: 'atr', value: 3 } };
      return s;
    },
  },
  {
    id: 'blank',
    name: 'Blank strategy',
    style: 'Your own',
    blurb: 'Start with no rules and build from scratch.',
    build: () => {
      const s = base('My strategy');
      s.longEntry = group('AND', [cond(ma('sma', 10), 'crossesAbove', ma('sma', 30))]);
      s.shortEntry = emptyGroup();
      s.direction = 'long';
      return s;
    },
  },
];

export const cloneStrategy = (s: Strategy): Strategy => JSON.parse(JSON.stringify(s));

/** Describe an operand in words: "EMA(20)", "RSI(14)", "Price". */
export const describeOperand = (o: Operand): string => {
  const f = o.field && o.field !== 'close' ? ` ${o.field}` : '';
  switch (o.kind) {
    case 'price':
      return `Price${f}`;
    case 'value':
      return `${o.value ?? 0}`;
    case 'sma':
      return `SMA(${o.period})`;
    case 'ema':
      return `EMA(${o.period})`;
    case 'rsi':
      return `RSI(${o.period})`;
    case 'macd':
      return `MACD(${o.period},${o.period2},${o.period3})`;
    case 'macdSignal':
      return `MACD signal(${o.period},${o.period2},${o.period3})`;
    case 'macdHist':
      return `MACD histogram(${o.period},${o.period2},${o.period3})`;
    case 'bbUpper':
      return `Upper band(${o.period}, ${o.mult})`;
    case 'bbMid':
      return `Middle band(${o.period})`;
    case 'bbLower':
      return `Lower band(${o.period}, ${o.mult})`;
    case 'atr':
      return `ATR(${o.period})`;
    case 'stoch':
      return `Stochastic %K(${o.period})`;
    case 'donchianHigh':
      return `${o.period}-bar high`;
    case 'donchianLow':
      return `${o.period}-bar low`;
  }
};

export const OP_LABEL: Record<Operator, string> = {
  crossesAbove: 'crosses above',
  crossesBelow: 'crosses below',
  above: 'is above',
  below: 'is below',
};

export const describeGroup = (g: RuleGroup): string =>
  g.conditions.length ? g.conditions.map((c) => `${describeOperand(c.left)} ${OP_LABEL[c.op]} ${describeOperand(c.right)}`).join(g.logic === 'AND' ? ' and ' : ' or ') : 'no rules';
