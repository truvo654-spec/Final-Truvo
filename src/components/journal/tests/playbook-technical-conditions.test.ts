import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import type { PlaybookTechnicalConditions } from '../../../data/instrumentPatterns';
import { EasyPlaybookCards } from '../EasyPlaybookCards';
import { PlaybookTechnicalConditionsEditor, validatePlaybookConditions } from '../PlaybookTechnicalConditions';
import { operand } from '../technicalPatternRules';

const condition = (): PlaybookTechnicalConditions => ({
  matchMode: 'all', rules: [{ id: '1', left: operand('RSI'), operator: 'below', right: operand('number', 30), timeframe: '1h' }],
});

test('conditions validate indicators, parameters, timeframes and unique rules', () => {
  const value = condition();
  assert.equal(validatePlaybookConditions(undefined), null);
  assert.equal(validatePlaybookConditions(value), null);
  value.rules[0].left = { ...operand('EMA'), period: 200 };
  assert.equal(validatePlaybookConditions(value), null);
  value.rules[0].left.period = 1001;
  assert.match(validatePlaybookConditions(value)!, /period must be/);
  value.rules[0].left = { ...operand('MACD'), fastPeriod: 26, slowPeriod: 12 };
  assert.match(validatePlaybookConditions(value)!, /MACD/);
  value.rules[0].left = operand('RSI');
  value.rules.push({ ...value.rules[0] });
  assert.match(validatePlaybookConditions(value)!, /unique ID/);
  value.rules = [];
  assert.match(validatePlaybookConditions(value)!, /1 and 12/);
});

test('editor and cards describe saved conditions without presenting signals', () => {
  const value = condition();
  const editor = renderToStaticMarkup(React.createElement(PlaybookTechnicalConditionsEditor, { value, onChange: () => {} }));
  assert.match(editor, /Advanced technical conditions/);
  assert.match(editor, /not live signals/);
  assert.match(editor, /Relative Strength|RSI/);
  assert.match(editor, /Condition 1 left technical tool/);
  assert.match(editor, /Timeframe/);
  const html = renderToStaticMarkup(React.createElement(EasyPlaybookCards, {
    playbooks: [{ ...DEFAULT_PLAYBOOKS[0], technicalConditions: value }], entries: [], scopedEntries: [], currency: 'USD', timeZone: 'UTC',
    houseLimits: { maxRisk: 1, maxTrades: 3 }, onCreate: () => {}, onUpdate: () => {}, onOpenWorkspace: () => {},
  }));
  assert.match(html, /RSI \(14\) is below 30 · 1h/);
  assert.match(html, /Saved conditions only; not automatically evaluated/);
});
