import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { QuickPlaybookCreate } from '../QuickPlaybookCreate';
import { defaultPlaybook, nextPlaybookId, PLAYBOOK_STARTERS, popularFromHistory, starterFor } from '../playbookDefaults';

test('starter defaults create an active ungraded playbook with house limits and editable rules', () => {
  const book = defaultPlaybook('Scalping', ['Forex'], ['EUR/USD'], { maxRisk: .5, maxTrades: 2 }, 'PB-008', new Date('2026-10-28T12:00:00Z'));
  assert.equal(book.status, 'active');
  assert.equal(book.grade, null);
  assert.equal(book.style, 'Scalp');
  assert.equal(book.benchmarkRR, 1.5);
  assert.equal(book.riskPerTrade, .5);
  assert.equal(book.maxTradesPerDay, 2);
  assert.ok(book.rules.length >= 3);
  assert.equal(book.instrumentMarkets?.['EUR/USD'], 'Forex');
  assert.equal(book.createdAt, '2026-10-28');
  assert.equal(defaultPlaybook('Swing', ['Crypto'], ['BTC/USDT'], { maxRisk: 1, maxTrades: 3 }, 'PB-009', new Date()).window, null);
});

test('starter inference covers the six templates and leaves unknown names custom', () => {
  assert.equal(PLAYBOOK_STARTERS.length, 6);
  assert.equal(starterFor('Morning Breakout').style, 'Momentum');
  assert.equal(starterFor('Trend Pullback').style, 'Trend');
  assert.equal(starterFor('Range Reversal').style, 'Mean reversion');
  assert.equal(starterFor('My own idea').style, 'Custom');
});

test('IDs do not collide with existing playbooks and ignore non-numeric names', () => {
  assert.equal(nextPlaybookId(DEFAULT_PLAYBOOKS), 'PB-008');
  assert.equal(nextPlaybookId([...DEFAULT_PLAYBOOKS, { ...DEFAULT_PLAYBOOKS[0], id: 'random-999999' }]), 'PB-008');
});

test('history suggestions respect market and instrument normalization', () => {
  const base = JOURNAL_ENTRIES[0];
  const entries = [
    { ...base, symbol: 'EURUSD', assetClass: 'Forex' as const },
    { ...base, symbol: 'EUR/USD', assetClass: 'Forex' as const },
    { ...base, symbol: 'BTC/USDT', assetClass: 'Crypto' as const },
  ];
  assert.deepEqual(popularFromHistory(entries, ['Forex']), ['EUR/USD']);
  assert.deepEqual(popularFromHistory(entries, ['Crypto']), ['BTC/USDT']);
});

test('quick create starts with the three required fields and optional details', () => {
  const html = renderToStaticMarkup(React.createElement(QuickPlaybookCreate, {
    entries: [], playbooks: [], houseLimits: { maxRisk: 1, maxTrades: 3 }, onClose: () => {}, onCreate: () => {},
  }));
  for (const label of ['Strategy name', 'Market type', 'Instrument symbols', 'Customize details', 'Create playbook']) assert.ok(html.includes(label));
  assert.match(html, /aria-label="Create playbook"/);
  assert.match(html, /Set up a strategy/);
  assert.match(html, /aria-label="Strategy starters"/);
  assert.match(html, /Create your own/);
  assert.match(html, /Rules and House limits are added automatically/);
  assert.match(html, /<form[^>]*novalidate/i);
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, PLAYBOOK_STARTERS.length + 5);
  assert.match(html, /<button type="submit"[^>]*>Create playbook<\/button>/);
  assert.doesNotMatch(html, /Step 1|Save draft/);
});
