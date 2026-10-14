import test from 'node:test';
import assert from 'node:assert/strict';
import { createIndicator } from '../indicators';
import { IND_HAS_PERIOD, IND_LABEL, mirrorCondition, cond, ind, val } from '../rules';
import { IND_DEFAULT_PERIOD, IndType } from '../types';
import { parseStrategy } from '../parse';
import { TECHNICAL_STRATEGIES } from '../technicalStrategies';

const NEW_INDICATORS: IndType[] = [
  'MACD', 'STOCH', 'CCI', 'ADX', 'MOMENTUM', 'ROC', 'STOCH_RSI', 'WILLR',
  'BULL_POWER', 'BEAR_POWER', 'ULTIMATE', 'VWMA', 'HMA',
  'ICHIMOKU_CONVERSION', 'ICHIMOKU_BASE',
  'BB_UPPER', 'BB_MIDDLE', 'BB_LOWER', 'OBV', 'MFI',
];

function feed(indicator: ReturnType<typeof createIndicator>, count = 240) {
  for (let i = 0; i < count; i++) {
    const close = 100 + i * 0.025 + Math.sin(i / 4) * 2;
    indicator.update(i * 300_000, close - 0.1, close + 0.75, close - 0.8, close, 100 + (i % 17));
  }
  return indicator.value;
}

test('the custom setup catalog exposes twenty additional computed technical tools', () => {
  for (const type of NEW_INDICATORS) {
    assert.ok(IND_LABEL[type], `${type} needs a user-facing label`);
    assert.ok(Number.isFinite(feed(createIndicator({ type, period: IND_DEFAULT_PERIOD[type] }))), `${type} should produce a finite value after warm-up`);
  }
  assert.equal(NEW_INDICATORS.length, 20);
});

test('technical scenarios include every additional indicator in a backtestable tool set', () => {
  const scenarioTools = new Set(TECHNICAL_STRATEGIES.flatMap((scenario) => scenario.tools));
  for (const type of NEW_INDICATORS) assert.ok(scenarioTools.has(type), `${type} should be used by at least one scenario`);
});

test('Bollinger bands preserve upper/middle/lower ordering and stochastic tools stay bounded', () => {
  const bands = (['BB_UPPER', 'BB_MIDDLE', 'BB_LOWER'] as const).map((type) => feed(createIndicator({ type, period: 20 })));
  assert.ok(bands[0] >= bands[1] && bands[1] >= bands[2]);
  for (const type of ['STOCH', 'STOCH_RSI', 'MFI'] as const) {
    const value = feed(createIndicator({ type, period: IND_DEFAULT_PERIOD[type] }));
    assert.ok(value >= 0 && value <= 100, `${type} should be in [0, 100]`);
  }
  const williams = feed(createIndicator({ type: 'WILLR' }));
  assert.ok(williams >= -100 && williams <= 0);
  assert.ok(feed(createIndicator({ type: 'ADX' })) >= 0);
});

test('OBV adds and subtracts volume only when the close direction changes', () => {
  const obv = createIndicator({ type: 'OBV' });
  obv.update(0, 10, 11, 9, 10, 100);
  obv.update(1, 10, 12, 10, 11, 20);
  assert.equal(obv.value, 20);
  obv.update(2, 11, 12, 9, 10, 5);
  assert.equal(obv.value, 15);
  obv.update(3, 10, 11, 9, 10, 500);
  assert.equal(obv.value, 15);
});

test('directional mirroring preserves symmetric indicators and swaps signed or bounded thresholds', () => {
  assert.equal(mirrorCondition(cond(ind('ADX', 14), 'gt', val(25))).op, 'gt');
  assert.deepEqual(mirrorCondition(cond(ind('STOCH', 14), 'lt', val(20))).right, val(80));
  assert.deepEqual(mirrorCondition(cond(ind('WILLR', 14), 'lt', val(-80))).right, val(-20));
  assert.deepEqual(mirrorCondition(cond(ind('MACD'), 'gt', val(1))).right, val(-1));
  const mirroredBand = mirrorCondition(cond(ind('BB_UPPER', 20), 'gt', val(0))).left;
  assert.equal(mirroredBand.kind, 'ind');
  if (mirroredBand.kind === 'ind') assert.equal(mirroredBand.ind.type, 'BB_LOWER');
  assert.ok(IND_HAS_PERIOD.includes('HMA'));
});

test('natural-language strategy parsing recognizes the added oscillator tools', () => {
  const parsed = parseStrategy('Buy when MACD crosses above 0 and Stochastic RSI(14) is below 20. Stop 1.5 ATR, target 2R.');
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.rules.entry.length, 2);
    assert.deepEqual(parsed.rules.entry.map((rule) => rule.left.kind === 'ind' ? rule.left.ind.type : null).sort(), ['MACD', 'STOCH_RSI']);
  }
  const cci = parseStrategy('Sell when CCI(20) crosses below -100. Stop at swing, target 2R.');
  assert.equal(cci.ok, true);
  if (cci.ok) assert.equal(cci.rules.entry[0].left.kind === 'ind' ? cci.rules.entry[0].left.ind.type : null, 'CCI');

  const fullToolSet = parseStrategy('Buy when price crosses above VWMA(20), Ichimoku conversion crosses above the base line, price is above the upper Bollinger band, and OBV is above 0. Stop 1.5 ATR, target 2R.');
  assert.equal(fullToolSet.ok, true);
  if (fullToolSet.ok) {
    assert.deepEqual(fullToolSet.rules.entry.map((rule) => rule.left.kind === 'ind' ? rule.left.ind.type : rule.right.kind === 'ind' ? rule.right.ind.type : null).sort(), [
      'BB_UPPER', 'ICHIMOKU_CONVERSION', 'OBV', 'VWMA',
    ]);
  }
});
