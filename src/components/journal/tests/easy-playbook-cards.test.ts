import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { EasyPlaybookCards, playbookIllustration, playbookPerformance } from '../EasyPlaybookCards';

const render = (playbooks = DEFAULT_PLAYBOOKS) => renderToStaticMarkup(React.createElement(EasyPlaybookCards, {
  playbooks, entries: [], scopedEntries: [], currency: 'USD', timeZone: 'UTC', houseLimits: { maxRisk: 1, maxTrades: 3 }, onCreate: () => {}, onUpdate: () => {}, onOpenWorkspace: () => {},
}));

test('easy cards show actual markets, all instruments and real rule titles without simulating results', () => {
  const html = render([DEFAULT_PLAYBOOKS[0]]);
  assert.match(html, /Breakout strategy card/);
  for (const value of ['Indices', 'Forex', 'Commodities', 'US500', 'NAS100', 'XAU/USD', 'GBP/USD', 'Defined range']) assert.ok(html.includes(value));
  assert.match(html, /Illustration · not market data/);
  assert.match(html, /not market data or a prediction/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Show details/);
  assert.match(html, /aria-label="Edit Breakout setup"/);
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
  const html = render(DEFAULT_PLAYBOOKS);
  const ids = [...html.matchAll(/<linearGradient id="([^"]+)"/g)].map(match => match[1]);
  assert.ok(ids.length > 1);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(html, /Strategy blueprint/);
  assert.match(html, /<rect/);
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
    { ...base, id: 'second-win', pnl: 7.25 },
    { ...base, id: 'loss', pnl: -10, outcome: 'loss' as const },
    { ...base, id: 'breakeven', pnl: 2 },
    { ...base, id: 'open', pnl: 500, tradingStatus: 'open' as const, outcome: 'open' as const },
    { ...base, id: 'unknown-cost', pnl: 200, commission: undefined },
    { ...base, id: 'unknown-pnl', pnl: 200, pnlKnown: false },
    { ...base, id: 'eur', pnl: 500, accountCurrency: 'EUR' },
    { ...base, id: 'other-strategy', strategy: 'Another setup', pnl: 1000 },
  ];
  const { trades, winningTrades, losingTrades, ...totals } = playbookPerformance(entries, 'USD').get('Breakout')!;
  assert.deepEqual(totals, { count: 4, wins: 2, losses: 1, net: 9125, winNet: 10325, lossNet: -1200 });
  assert.deepEqual(trades.map(trade => trade.id), ['win', 'second-win', 'loss', 'breakeven']);
  assert.deepEqual(winningTrades.map(trade => trade.id), ['win', 'second-win']);
  assert.deepEqual(losingTrades.map(trade => trade.id), ['loss']);
  const html = renderToStaticMarkup(React.createElement(EasyPlaybookCards, {
    playbooks: [DEFAULT_PLAYBOOKS[0]], entries, scopedEntries: entries, currency: 'USD',
    timeZone: 'UTC', houseLimits: { maxRisk: 1, maxTrades: 3 }, onCreate: () => {}, onUpdate: () => {}, onOpenWorkspace: () => {},
  })).replace(/<!-- -->/g, '');
  assert.match(html, /4 closed trades/);
  assert.match(html, /\+\$91\.25/);
  assert.match(html, /Winning P&amp;L<\/span><strong[^>]*>\+\$103\.25<\/strong><span[^>]*>2 wins/);
  assert.match(html, /Losing P&amp;L<\/span><strong[^>]*>-\$12\.00<\/strong><span[^>]*>1 loss/);
  assert.match(html, /1 breakeven trade included in the total/);
  assert.match(html, /50%/);
  assert.match(html, /aria-label="Show all Breakout closed trades"/);
  assert.match(html, /aria-label="Show Breakout winning trades"/);
  assert.match(html, /aria-label="Show Breakout losing trades"/);
  assert.match(html, /unknown costs or other currencies are excluded/);
  assert.doesNotMatch(html, /\$998\.00/);
});

test('empty and losing-only cards distinguish unavailable results from zero wins', () => {
  const empty = render([DEFAULT_PLAYBOOKS[0]]).replace(/<!-- -->/g, '');
  assert.match(empty, /0 closed trades/);
  assert.match(empty, /Winning P&amp;L<\/span><strong[^>]*>—<\/strong><span[^>]*>0 wins/);
  assert.match(empty, /Losing P&amp;L<\/span><strong[^>]*>—<\/strong><span[^>]*>0 losses/);
  const loss = { ...JOURNAL_ENTRIES[0], strategy: 'Breakout', tradingStatus: 'closed' as const, pnlKnown: true, accountCurrency: 'USD', commission: 2, pnl: -10 };
  const html = renderToStaticMarkup(React.createElement(EasyPlaybookCards, {
    playbooks: [DEFAULT_PLAYBOOKS[0]], entries: [loss], scopedEntries: [loss], currency: 'USD',
    timeZone: 'UTC', houseLimits: { maxRisk: 1, maxTrades: 3 }, onCreate: () => {}, onUpdate: () => {}, onOpenWorkspace: () => {},
  })).replace(/<!-- -->/g, '');
  assert.match(html, /1 closed trade/);
  assert.match(html, /Winning P&amp;L<\/span><strong[^>]*>\$0\.00<\/strong><span[^>]*>0 wins/);
  assert.match(html, /Losing P&amp;L<\/span><strong[^>]*>-\$12\.00<\/strong><span[^>]*>1 loss/);
  assert.match(html, /0%/);
  assert.match(html, /<button[^>]*disabled=""[^>]*aria-label="Show Breakout winning trades"/);
});

test('card results follow scoped trades, including the selected reporting currency', () => {
  const base = { ...JOURNAL_ENTRIES[0], strategy: 'Breakout', tradingStatus: 'closed' as const, pnlKnown: true, commission: 0 };
  const entries = [
    { ...base, id: 'outside-scope', pnl: 100, accountCurrency: 'EUR' },
    { ...base, id: 'in-scope', pnl: -25, accountCurrency: 'EUR' },
    { ...base, id: 'other-currency', pnl: 500, accountCurrency: 'USD' },
  ];
  const scopedEntries = entries.slice(1);
  const { trades, winningTrades, losingTrades, ...totals } = playbookPerformance(scopedEntries, 'EUR').get('Breakout')!;
  assert.deepEqual(totals, { count: 1, wins: 0, losses: 1, net: -2500, winNet: 0, lossNet: -2500 });
  assert.deepEqual(trades.map(trade => trade.id), ['in-scope']);
  assert.deepEqual(winningTrades, []);
  assert.deepEqual(losingTrades.map(trade => trade.id), ['in-scope']);
  const html = renderToStaticMarkup(React.createElement(EasyPlaybookCards, {
    playbooks: [DEFAULT_PLAYBOOKS[0]], entries, scopedEntries, currency: 'EUR',
    timeZone: 'UTC', houseLimits: { maxRisk: 1, maxTrades: 3 }, onCreate: () => {}, onUpdate: () => {}, onOpenWorkspace: () => {},
  })).replace(/<!-- -->/g, '');
  assert.match(html, /1 closed trade/);
  assert.match(html, /-€25\.00/);
  assert.doesNotMatch(html, /€100\.00|€500\.00/);
});
