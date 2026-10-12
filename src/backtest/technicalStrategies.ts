import type { PortfolioAssetClass } from '../types';
import type { Condition, IndType, StrategyRules, Timeframe } from './types';

export interface TechnicalStrategyRecipe {
  id: string;
  name: string;
  market: PortfolioAssetClass;
  style: string;
  timeframe: Timeframe;
  description: string;
  entryTrigger: string;
  stopRule: string;
  targetRule: string;
  tools: IndType[];
  rules: StrategyRules;
}

type Operand = Condition['left'];
type RecipeInput = Omit<TechnicalStrategyRecipe, 'rules'> & { entry: Condition[]; targetR?: number };

const close = (): Operand => ({ kind: 'price', field: 'close' });
const value = (n: number): Operand => ({ kind: 'value', value: n });
const indicator = (type: IndType, period?: number): Operand => ({ kind: 'ind', ind: { type, period } });
const condition = (id: string, left: Operand, op: Condition['op'], right: Operand): Condition => ({ id, left, op, right });
const priceVs = (id: string, op: Condition['op'], type: IndType, period?: number) => condition(id, close(), op, indicator(type, period));
const indVs = (id: string, type: IndType, op: Condition['op'], threshold: number, period?: number) => condition(id, indicator(type, period), op, value(threshold));

const recipe = (input: RecipeInput): TechnicalStrategyRecipe => ({
  ...input,
  rules: {
    direction: 'both',
    entry: input.entry,
    entryOrder: { type: 'market' },
    exits: {
      stop: { type: 'atr', mult: 1.5 },
      targetR: input.targetR ?? 2,
      breakevenAtR: null,
      breakevenLockR: 0,
      trailing: null,
      partial: null,
      timeExitBars: null,
      sessionEndExit: false,
    },
    maxTradesPerDay: 2,
  },
});

export const TECHNICAL_STRATEGIES: TechnicalStrategyRecipe[] = [
  recipe({
    id: 'fx-ema-adx-continuation', name: 'EMA Trend + ADX Confirmation', market: 'Forex', style: 'Trend continuation', timeframe: '1h',
    description: 'A moving-average alignment with a trend-strength filter. Wait for all selected conditions to agree on a completed bar.',
    entryTrigger: 'Enter when price crosses above EMA(20), EMA(20) is above EMA(50), price is above EMA(50), and ADX(14) is above 20.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; review the exit plan before testing.',
    tools: ['EMA', 'ADX', 'ATR'],
    entry: [priceVs('fx-ema-1', 'crossAbove', 'EMA', 20), condition('fx-ema-2', indicator('EMA', 20), 'gt', indicator('EMA', 50)), priceVs('fx-ema-3', 'gt', 'EMA', 50), indVs('fx-ema-4', 'ADX', 'gt', 20)],
  }),
  recipe({
    id: 'fx-rsi-bollinger-reclaim', name: 'RSI + Bollinger Reclaim', market: 'Forex', style: 'Mean reversion', timeframe: '15m',
    description: 'An oversold RSI recovery paired with a reclaim of the lower volatility band; it is a hypothesis to test, not a buy signal.',
    entryTrigger: 'Enter when RSI(14) crosses above 30 and price crosses back above the lower Bollinger band.',
    stopRule: 'Initial stop 1.2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.5R or exit earlier if the setup invalidates.',
    tools: ['RSI', 'BB_LOWER', 'ATR'],
    entry: [indVs('fx-rsi-1', 'RSI', 'crossAbove', 30, 14), priceVs('fx-rsi-2', 'crossAbove', 'BB_LOWER', 20)],
    targetR: 1.5,
  }),
  recipe({
    id: 'fx-macd-vwma-momentum', name: 'MACD + VWMA Momentum', market: 'Forex', style: 'Momentum', timeframe: '15m',
    description: 'Combines a zero-line MACD histogram shift, price relative to volume-weighted average, and ADX trend strength.',
    entryTrigger: 'Enter when the MACD histogram crosses above zero, price is above VWMA(20), and ADX(14) is above 18.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; review the exit plan before testing.',
    tools: ['MACD', 'VWMA', 'ADX', 'ATR'],
    entry: [indVs('fx-macd-1', 'MACD', 'crossAbove', 0), priceVs('fx-macd-2', 'gt', 'VWMA', 20), indVs('fx-macd-3', 'ADX', 'gt', 18)],
  }),
  recipe({
    id: 'fx-stoch-range-reversal', name: 'Stochastic + Band Reversal', market: 'Forex', style: 'Range reversal', timeframe: '5m',
    description: 'A bounded oscillator recovery at the lower Bollinger band. Add a range/no-news filter when applying it to a live plan.',
    entryTrigger: 'Enter when Stochastic %K crosses above 20 and price is at or below the lower Bollinger band.',
    stopRule: 'Initial stop 1.2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.5R; do not assume a range will hold.',
    tools: ['STOCH', 'BB_LOWER', 'ATR'],
    entry: [indVs('fx-stoch-1', 'STOCH', 'crossAbove', 20, 14), priceVs('fx-stoch-2', 'lt', 'BB_LOWER', 20)],
    targetR: 1.5,
  }),
  recipe({
    id: 'indices-channel-adx-breakout', name: 'Channel Breakout + ADX', market: 'Indices', style: 'Breakout', timeframe: '15m',
    description: 'A close above a prior-bar channel high with a minimum trend-strength reading.',
    entryTrigger: 'Enter when price crosses above the previous 20-bar high and ADX(14) is above 20.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; test gaps and session-specific behavior.',
    tools: ['HIGHEST', 'ADX', 'ATR'],
    entry: [priceVs('idx-break-1', 'crossAbove', 'HIGHEST', 20), indVs('idx-break-2', 'ADX', 'gt', 20)],
  }),
  recipe({
    id: 'indices-vwap-hma-reclaim', name: 'VWAP + HMA Reclaim', market: 'Indices', style: 'Intraday continuation', timeframe: '5m',
    description: 'A VWAP reclaim with price holding above a short Hull moving average.',
    entryTrigger: 'Enter when price crosses above VWAP and closes above HMA(20).',
    stopRule: 'Initial stop 1.2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.8R or flatten at the end of the session.',
    tools: ['VWAP', 'HMA', 'ATR'],
    entry: [priceVs('idx-vwap-1', 'crossAbove', 'VWAP'), priceVs('idx-vwap-2', 'gt', 'HMA', 20)],
    targetR: 1.8,
  }),
  recipe({
    id: 'indices-cci-bollinger-expansion', name: 'CCI + Bollinger Expansion', market: 'Indices', style: 'Momentum breakout', timeframe: '15m',
    description: 'A positive CCI threshold and close outside the upper Bollinger band, designed for testing breakout follow-through.',
    entryTrigger: 'Enter when CCI(20) is above 100 and price crosses above the upper Bollinger band.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; test false-break frequency and costs.',
    tools: ['CCI', 'BB_UPPER', 'ATR'],
    entry: [indVs('idx-cci-1', 'CCI', 'gt', 100, 20), priceVs('idx-cci-2', 'crossAbove', 'BB_UPPER', 20)],
  }),
  recipe({
    id: 'indices-hma-rsi-pullback', name: 'HMA Trend + RSI Pullback', market: 'Indices', style: 'Trend pullback', timeframe: '15m',
    description: 'A trend filter using HMA(50) with an RSI recovery through its midpoint.',
    entryTrigger: 'Enter when price is above HMA(50) and RSI(14) crosses above 50.',
    stopRule: 'Initial stop beyond the recent swing or 1.5 × ATR(14); size to your risk limit.',
    targetRule: 'Target 2R; test alternate swing lookbacks.',
    tools: ['HMA', 'RSI', 'ATR'],
    entry: [priceVs('idx-hma-1', 'gt', 'HMA', 50), indVs('idx-hma-2', 'RSI', 'crossAbove', 50, 14)],
  }),
  recipe({
    id: 'commodity-ichimoku-adx', name: 'Ichimoku + ADX Trend', market: 'Commodity', style: 'Trend continuation', timeframe: '1h',
    description: 'Uses the Ichimoku conversion/base relationship with ADX as a trend-strength filter.',
    entryTrigger: 'Enter when the conversion line crosses above the base line, price is above the base line, and ADX(14) is above 20.',
    stopRule: 'Initial stop 2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2.5R; account for contract value and overnight gaps.',
    tools: ['ICHIMOKU_CONVERSION', 'ICHIMOKU_BASE', 'ADX', 'ATR'],
    entry: [condition('cmd-ichi-1', indicator('ICHIMOKU_CONVERSION', 9), 'crossAbove', indicator('ICHIMOKU_BASE', 26)), priceVs('cmd-ichi-2', 'gt', 'ICHIMOKU_BASE', 26), indVs('cmd-ichi-3', 'ADX', 'gt', 20)],
    targetR: 2.5,
  }),
  recipe({
    id: 'commodity-roc-vwma', name: 'ROC + VWMA Direction', market: 'Commodity', style: 'Momentum', timeframe: '1h',
    description: 'Requires positive rate of change and momentum with price above its volume-weighted average.',
    entryTrigger: 'Enter when ROC(12) and Momentum(10) are above zero, and price is above VWMA(20).',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; test roll dates and instrument-specific costs separately.',
    tools: ['ROC', 'MOMENTUM', 'VWMA', 'ATR'],
    entry: [indVs('cmd-roc-1', 'ROC', 'gt', 0, 12), indVs('cmd-roc-2', 'MOMENTUM', 'gt', 0, 10), priceVs('cmd-roc-3', 'gt', 'VWMA', 20)],
  }),
  recipe({
    id: 'commodity-williams-cci-turn', name: 'Williams %R + CCI Turn', market: 'Commodity', style: 'Reversal', timeframe: '15m',
    description: 'Looks for two bounded/centered oscillators to recover from oversold territory before entry.',
    entryTrigger: 'Enter when Williams %R crosses above -80 and CCI(20) crosses above -100.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.8R; test against trend and range regimes.',
    tools: ['WILLR', 'CCI', 'ATR'],
    entry: [indVs('cmd-will-1', 'WILLR', 'crossAbove', -80, 14), indVs('cmd-will-2', 'CCI', 'crossAbove', -100, 20)],
    targetR: 1.8,
  }),
  recipe({
    id: 'commodity-bollinger-mfi', name: 'Bollinger + MFI Reclaim', market: 'Commodity', style: 'Mean reversion', timeframe: '15m',
    description: 'Combines an MFI oversold reading with a reclaim of the lower Bollinger band.',
    entryTrigger: 'Enter when MFI(14) is below 25, price crosses back above the lower Bollinger band, and price remains below the middle band.',
    stopRule: 'Initial stop 1.2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.5R; the middle Bollinger band is an entry filter in this backtest recipe, not a dynamic exit.',
    tools: ['MFI', 'BB_LOWER', 'BB_MIDDLE', 'ATR'],
    entry: [indVs('cmd-bb-1', 'MFI', 'lt', 25, 14), priceVs('cmd-bb-2', 'crossAbove', 'BB_LOWER', 20), priceVs('cmd-bb-3', 'lt', 'BB_MIDDLE', 20)],
    targetR: 1.5,
  }),
  recipe({
    id: 'crypto-roc-ema-obv', name: 'ROC + EMA + OBV Momentum', market: 'Crypto', style: 'Momentum', timeframe: '1h',
    description: 'Combines positive rate of change and price/EMA alignment with net buying volume since the selected test window began.',
    entryTrigger: 'Enter when ROC(12) is positive, price is above EMA(50), and OBV is above zero since the start of the selected test window.',
    stopRule: 'Initial stop 2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2.5R; test volatility spikes and trading fees.',
    tools: ['ROC', 'EMA', 'OBV', 'ATR'],
    entry: [indVs('cry-roc-1', 'ROC', 'gt', 0, 12), priceVs('cry-roc-2', 'gt', 'EMA', 50), indVs('cry-roc-3', 'OBV', 'crossAbove', 0)],
    targetR: 2.5,
  }),
  recipe({
    id: 'crypto-mfi-bollinger-turn', name: 'MFI + Bollinger Turn', market: 'Crypto', style: 'Mean reversion', timeframe: '1h',
    description: 'Pairs an MFI recovery with a lower-band reclaim; crypto gaps and fast moves can invalidate this setup quickly.',
    entryTrigger: 'Enter when MFI(14) crosses above 20 and price crosses above the lower Bollinger band.',
    stopRule: 'Initial stop 2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.8R; include realistic fees and slippage.',
    tools: ['MFI', 'BB_LOWER', 'ATR'],
    entry: [indVs('cry-mfi-1', 'MFI', 'crossAbove', 20, 14), priceVs('cry-mfi-2', 'crossAbove', 'BB_LOWER', 20)],
    targetR: 1.8,
  }),
  recipe({
    id: 'crypto-stochrsi-hma', name: 'Stochastic RSI + HMA Reclaim', market: 'Crypto', style: 'Pullback continuation', timeframe: '15m',
    description: 'Uses a Stochastic RSI recovery plus price reclaiming HMA(20) as a pullback scenario.',
    entryTrigger: 'Enter when Stochastic RSI crosses above 20 and price is above HMA(20).',
    stopRule: 'Initial stop 1.8 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; test across high- and low-volatility periods.',
    tools: ['STOCH_RSI', 'HMA', 'ATR'],
    entry: [indVs('cry-srsi-1', 'STOCH_RSI', 'crossAbove', 20, 14), priceVs('cry-srsi-2', 'gt', 'HMA', 20)],
  }),
  recipe({
    id: 'crypto-fvg-macd-breakout', name: 'FVG + MACD Breakout', market: 'Crypto', style: 'Breakout', timeframe: '1h',
    description: 'Requires a bullish fair value gap with a positive MACD histogram and a prior-channel break.',
    entryTrigger: 'Enter when a bullish fair value gap forms, the MACD histogram is positive, and price breaks the prior 20-bar high.',
    stopRule: 'Initial stop 2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2.5R; test gap risk and costs before use.',
    tools: ['FVG_BULL', 'MACD', 'HIGHEST', 'ATR'],
    entry: [indVs('cry-fvg-1', 'FVG_BULL', 'gt', 0.5), indVs('cry-fvg-2', 'MACD', 'gt', 0), priceVs('cry-fvg-3', 'crossAbove', 'HIGHEST', 20)],
    targetR: 2.5,
  }),
  recipe({
    id: 'stocks-macd-vwma-adx', name: 'MACD + VWMA + ADX', market: 'Stocks', style: 'Trend momentum', timeframe: '1h',
    description: 'A momentum-shift scenario with price/volume-weighted trend and ADX confirmation.',
    entryTrigger: 'Enter when the MACD histogram crosses above zero, price is above VWMA(20), and ADX(14) is above 20.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; test stock-specific gaps and costs.',
    tools: ['MACD', 'VWMA', 'ADX', 'ATR'],
    entry: [indVs('stk-macd-1', 'MACD', 'crossAbove', 0), priceVs('stk-macd-2', 'gt', 'VWMA', 20), indVs('stk-macd-3', 'ADX', 'gt', 20)],
  }),
  recipe({
    id: 'stocks-rsi-bollinger-reclaim', name: 'RSI + Bollinger Reclaim', market: 'Stocks', style: 'Mean reversion', timeframe: '15m',
    description: 'A lower-band reclaim with RSI recovery, intended as a testable pullback scenario rather than a prediction.',
    entryTrigger: 'Enter when RSI(14) crosses above 30 and price crosses above the lower Bollinger band.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.8R; test earnings gaps separately.',
    tools: ['RSI', 'BB_LOWER', 'ATR'],
    entry: [indVs('stk-rsi-1', 'RSI', 'crossAbove', 30, 14), priceVs('stk-rsi-2', 'crossAbove', 'BB_LOWER', 20)],
    targetR: 1.8,
  }),
  recipe({
    id: 'stocks-vwap-ultimate', name: 'VWAP + Ultimate Oscillator', market: 'Stocks', style: 'Intraday continuation', timeframe: '5m',
    description: 'A VWAP reclaim paired with an Ultimate Oscillator reading above its midpoint.',
    entryTrigger: 'Enter when price crosses above VWAP and the Ultimate Oscillator is above 50.',
    stopRule: 'Initial stop 1.2 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 1.5R or flatten at the end of the session.',
    tools: ['VWAP', 'ULTIMATE', 'ATR'],
    entry: [priceVs('stk-vwap-1', 'crossAbove', 'VWAP'), indVs('stk-vwap-2', 'ULTIMATE', 'gt', 50)],
    targetR: 1.5,
  }),
  recipe({
    id: 'stocks-elder-power-trend', name: 'Elder Power + Ichimoku Trend', market: 'Stocks', style: 'Trend pullback', timeframe: '1h',
    description: 'Uses a bear-power pullback with Ichimoku conversion/base alignment; the bear-power rule mirrors to bull power for short entries.',
    entryTrigger: 'For longs, enter when bear power is below zero, the conversion line is above the base line, and price is above the base line. Short entries mirror these conditions.',
    stopRule: 'Initial stop 1.5 × ATR(14); size the position from your risk limit.',
    targetRule: 'Target 2R; test earnings and overnight gaps separately.',
    tools: ['BULL_POWER', 'BEAR_POWER', 'ICHIMOKU_CONVERSION', 'ICHIMOKU_BASE', 'ATR'],
    entry: [indVs('stk-elder-1', 'BEAR_POWER', 'lt', 0, 13), condition('stk-elder-2', indicator('ICHIMOKU_CONVERSION', 9), 'gt', indicator('ICHIMOKU_BASE', 26)), priceVs('stk-elder-3', 'gt', 'ICHIMOKU_BASE', 26)],
  }),
];

export const getTechnicalStrategyRecipe = (id?: string) => TECHNICAL_STRATEGIES.find((item) => item.id === id);
