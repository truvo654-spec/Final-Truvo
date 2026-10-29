import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { TECHNICAL_STRATEGIES } from '../../../backtest/technicalStrategies';
import { defaultSettings, cond, describeCondition, ind, val } from '../../../backtest/rules';
import { playbookConditions, validatePlaybookConditions } from '../../../backtest/playbookConditions';
import { seriesFromBars } from '../../../backtest/marketData';
import { measureInstrumentPattern, validateInstrumentPattern } from '../instrumentMatching';
import { playbookConditionPattern } from '../playbookConditionPattern';
import { PlaybookTechnicalConditions } from '../PlaybookTechnicalConditions';

test('recommended conditions are copied and remain editable without changing their recipe', () => {
  for (const recipe of TECHNICAL_STRATEGIES) {
    const book = { ...DEFAULT_PLAYBOOKS[0], technicalRecipeId: recipe.id };
    const conditions = playbookConditions(book);
    assert.equal(validatePlaybookConditions(conditions), null, recipe.id);
    assert.equal(conditions.length, recipe.rules.entry.length);
    assert.equal(validateInstrumentPattern(playbookConditionPattern(book)!), null, recipe.id);
    conditions[0].op = 'lt';
    assert.notEqual(conditions[0], recipe.rules.entry[0]);
    assert.deepEqual(defaultSettings({ playbook: book }).rules.entry, JSON.parse(JSON.stringify(recipe.rules.entry)));
  }
});

test('custom conditions replace only backtest entries and provide matching scanner rules', () => {
  const conditions = [cond(ind('RSI', 14), 'gt', val(70))];
  const book = { ...DEFAULT_PLAYBOOKS[0], technicalRecipeId: TECHNICAL_STRATEGIES[0].id, technicalEntryConditions: conditions };
  const settings = defaultSettings({ playbook: book });
  assert.deepEqual(settings.rules.entry, JSON.parse(JSON.stringify(conditions)));
  assert.notEqual(settings.rules.entry, conditions);
  assert.deepEqual(settings.rules.exits, TECHNICAL_STRATEGIES[0].rules.exits);
  const pattern = playbookConditionPattern(book)!;
  assert.equal(validateInstrumentPattern(pattern), null);
  assert.equal(pattern.technicalRules?.[0].left.tool, 'RSI');
  assert.equal(pattern.technicalRules?.[0].operator, 'above');
  const bars = seriesFromBars('EUR/USD', '1h', Array.from({ length: 240 }, (_, i) => ({
    t: Date.UTC(2026, 8, 1) + i * 3600000, o: 100 + i, h: 101 + i, l: 99 + i, c: 100 + i, v: 100,
  })));
  assert.ok(measureInstrumentPattern(bars, 'custom', Infinity, pattern));
  const failing = { ...book, technicalEntryConditions: [cond(ind('RSI', 14), 'lt', val(70))] };
  assert.equal(measureInstrumentPattern(bars, 'custom', Infinity, playbookConditionPattern(failing)!), null);
  const saved = JSON.parse(JSON.stringify(book));
  assert.deepEqual(defaultSettings({ playbook: saved }).rules.entry, JSON.parse(JSON.stringify(conditions)));
  assert.deepEqual(playbookConditionPattern(saved), pattern);
});

test('invalid or empty custom conditions cannot produce a scanner pattern', () => {
  const book = { ...DEFAULT_PLAYBOOKS[0], technicalEntryConditions: [] };
  assert.match(validatePlaybookConditions(book.technicalEntryConditions)!, /between 1 and 12/);
  assert.equal(playbookConditionPattern(book), null);
  const bad = [cond(ind('EMA', 239), 'gt', val(1))];
  assert.match(validatePlaybookConditions(bad)!, /periods/);
  assert.equal(playbookConditionPattern({ ...book, technicalEntryConditions: bad }), null);
});

test('condition editor exposes indicators and prefilled recommendation rules for custom editing', () => {
  const book = { ...DEFAULT_PLAYBOOKS[0], technicalRecipeId: TECHNICAL_STRATEGIES[0].id };
  const html = renderToStaticMarkup(createElement(PlaybookTechnicalConditions, { playbook: book, onChange: () => {} }));
  assert.match(html, /Condition 4 indicator/);
  assert.match(html, /Condition 4 number/);
  assert.doesNotMatch(html, /Condition \d+ (left|right)/);
  assert.match(html, /Replace with an indicator and number/);
  assert.match(html, /the close crosses above the 20 EMA/);
  assert.match(html, /Exponential moving average/);
  assert.match(html, /Add condition/);
  assert.equal((html.match(/Remove technical condition/g) || []).length, TECHNICAL_STRATEGIES[0].rules.entry.length);
  assert.match(describeCondition(cond(ind('FVG_BULL'), 'lt', val(0.5))), /is below 0.5/);
});

test('a custom indicator and threshold renders as a single condition', () => {
  const condition = cond(ind('RSI', 14), 'gt', val(70));
  const book = { ...DEFAULT_PLAYBOOKS[0], technicalEntryConditions: [condition] };
  const html = renderToStaticMarkup(createElement(PlaybookTechnicalConditions, { playbook: book, onChange: () => {} }));
  assert.match(html, /Condition 1 indicator/);
  assert.match(html, /Condition 1 comparison/);
  assert.match(html, /Condition 1 number/);
  assert.doesNotMatch(html, /Condition 1 (left|right)|Replace with an indicator/);
});
