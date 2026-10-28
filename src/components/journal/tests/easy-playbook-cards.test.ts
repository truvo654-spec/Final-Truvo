import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { EasyPlaybookCards, playbookIllustration } from '../EasyPlaybookCards';

const render = (playbooks = DEFAULT_PLAYBOOKS) => renderToStaticMarkup(React.createElement(EasyPlaybookCards, {
  playbooks, entries: [], scopedEntries: [], currency: 'USD', houseLimits: { maxRisk: 1, maxTrades: 3 }, onCreate: () => {}, onOpenWorkspace: () => {},
}));

test('easy cards show actual markets, all instruments and real rule titles without simulating results', () => {
  const html = render([DEFAULT_PLAYBOOKS[0]]);
  assert.match(html, /Breakout strategy card/);
  for (const value of ['Indices', 'Forex', 'Commodities', 'US500', 'NAS100', 'XAU/USD', 'GBP/USD', 'Defined range']) assert.ok(html.includes(value));
  assert.match(html, /Illustration · not market data/);
  assert.match(html, /not market data or a prediction/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Show details/);
  assert.match(html, /Edit or open full workspace/);
  assert.doesNotMatch(html, /Profit factor|Backtest this playbook|STEP 1/);
});

test('strategy illustrations are deterministic and unfamiliar setups use a generic example', () => {
  assert.equal(playbookIllustration({ name: 'London Breakout', style: 'Momentum' }), 'breakout');
  assert.equal(playbookIllustration({ name: 'EMA Pullback', style: 'Trend' }), 'pullback');
  assert.equal(playbookIllustration({ name: 'Scalping', style: 'Intraday' }), 'scalp');
  assert.equal(playbookIllustration({ name: 'Swing', style: 'Swing' }), 'swing');
  assert.equal(playbookIllustration({ name: 'Range Fade', style: 'Mean reversion' }), 'reversal');
  assert.equal(playbookIllustration({ name: 'My idea', style: 'Custom' }), 'generic');
});

test('only active cards are shown by default, with a clear empty state', () => {
  const html = render(DEFAULT_PLAYBOOKS);
  assert.match(html, /aria-label="Playbook status"/);
  assert.match(html, /aria-pressed="true"[^>]*>Active/);
  assert.doesNotMatch(html, /Range Fade strategy card/);
  assert.doesNotMatch(html, /Position strategy card/);
  const empty = render([]);
  assert.match(empty, /Create your first playbook/);
  assert.match(empty, /House rules &amp; full workspace/);
  assert.doesNotMatch(empty, /strategy card"/);
});

test('performance excludes open, unknown-cost and other-currency results', () => {
  const source = JOURNAL_ENTRIES[0];
  const base = { ...source, strategy: 'Breakout', tradingStatus: 'closed' as const, outcome: 'win' as const, pnlKnown: true, accountCurrency: 'USD', commission: 2 };
  const entries = [
    { ...base, id: 'win', pnl: 100 },
    { ...base, id: 'loss', pnl: -10, outcome: 'loss' as const },
    { ...base, id: 'open', pnl: 500, tradingStatus: 'open' as const, outcome: 'open' as const },
    { ...base, id: 'unknown-cost', pnl: 200, commission: undefined },
    { ...base, id: 'eur', pnl: 500, accountCurrency: 'EUR' },
  ];
  const html = renderToStaticMarkup(React.createElement(EasyPlaybookCards, {
    playbooks: [DEFAULT_PLAYBOOKS[0]], entries, scopedEntries: entries, currency: 'USD',
    houseLimits: { maxRisk: 1, maxTrades: 3 }, onCreate: () => {}, onOpenWorkspace: () => {},
  }));
  assert.match(html, /\$86\.00/);
  assert.match(html, /50%/);
  assert.match(html, /unknown costs or other currencies are excluded/);
});
