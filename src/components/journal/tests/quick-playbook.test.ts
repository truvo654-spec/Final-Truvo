import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { StrategyRecommendationDialog } from '../StrategyRecommendationDialog';
import { PlaybookSetupDialog } from '../PlaybookSetupDialog';
import { buildPlaybookRecommendations } from '../playbookRecommendations';
import { prepareQuickDraft, quickInstrumentCandidates, recommendationQuickDraft, toggleQuickMarket, uniquePlaybookName } from '../quickPlaybook';
import { defaultSettings } from '../../../backtest/rules';
import { TECHNICAL_STRATEGIES } from '../../../backtest/technicalStrategies';
import type { JournalEntry } from '../../../types';

test('Starter names stay unique regardless of casing and surrounding whitespace', () => {
  assert.equal(uniquePlaybookName('Breakout', [' breakout ', 'BREAKOUT (2)']), 'Breakout (3)');
  assert.equal(uniquePlaybookName('Fresh', ['Other']), 'Fresh');
});

test('Removing a market removes only its selected symbols and associated assignments', () => {
  const starter = DEFAULT_PLAYBOOKS.find(item => item.id === 'PB-001')!;
  const custom = { ...starter, symbols: [...starter.symbols!, 'CUSTOM'], instrumentMarkets: { CUSTOM: 'Forex' as const } };
  const result = toggleQuickMarket(custom, 'Forex');
  assert.ok(!result.markets.includes('Forex'));
  assert.ok(!result.symbols?.includes('GBP/USD'));
  assert.ok(!result.symbols?.includes('CUSTOM'));
  assert.ok(result.symbols?.includes('US500'));
  assert.deepEqual(result.instrumentMarkets, {});
  assert.ok(toggleQuickMarket(result, 'Forex').markets.includes('Forex'));
});

test('Quick instruments combine deduplicated market choices with journal symbols', () => {
  const entries = [
    { symbol: 'CUSTOM', assetClass: 'Forex' },
    { symbol: 'EUR/USD', assetClass: 'Forex' },
    { symbol: 'CUSTOM', assetClass: 'Forex' },
    { symbol: 'OTHER', assetClass: 'Crypto' },
  ] as JournalEntry[];
  const list = quickInstrumentCandidates(['Forex'], entries);
  assert.equal(list.filter(item => item.symbol === 'CUSTOM').length, 1);
  assert.equal(list.filter(item => item.symbol === 'EUR/USD').length, 1);
  assert.ok(!list.some(item => item.symbol === 'OTHER'));
  assert.deepEqual(quickInstrumentCandidates([], entries), []);
});

test('Quick setup normalizes inherited symbols and keeps custom market assignments', () => {
  const starter = DEFAULT_PLAYBOOKS.find(item => item.id === 'PB-001')!;
  const draft = { ...starter, symbols: ['eurusd', 'EUR/USD', 'CUSTOM'], instrumentMarkets: { CUSTOM: 'Indices' as const } };
  const prepared = prepareQuickDraft(draft, []);
  assert.deepEqual(prepared.symbols, ['EUR/USD', 'CUSTOM']);
  assert.equal(prepared.instrumentMarkets?.CUSTOM, 'Indices');
  assert.deepEqual(toggleQuickMarket(prepared, 'Indices').symbols, ['EUR/USD']);
});

test('Selection fills a unique draft, preserves technical recipes, and suggests an instrument when needed', () => {
  const recommendations = buildPlaybookRecommendations([], [], '2026-10-28');
  for (const recommendation of recommendations) {
    const draft = recommendationQuickDraft(recommendation, [], [recommendation.draft.name], '2026-10-28');
    assert.equal(draft.name, `${recommendation.draft.name} (2)`);
    assert.equal(draft.status, 'draft');
    assert.equal(draft.createdAt, '2026-10-28');
    assert.equal(draft.id, '');
    assert.ok(draft.symbols?.length);
    assert.deepEqual(draft.rules, recommendation.draft.rules);
    if (recommendation.kind === 'technical') {
      const scenario = TECHNICAL_STRATEGIES.find(item => item.id === recommendation.id)!;
      assert.equal(draft.technicalRecipeId, scenario.id);
      assert.deepEqual(defaultSettings({ playbook: draft }).rules, JSON.parse(JSON.stringify(scenario.rules)));
    }
  }
});

test('Selection preserves inherited symbols and market assignments instead of replacing them', () => {
  const recommendation = buildPlaybookRecommendations([], [], '2026-10-28')[0];
  recommendation.draft.symbols = ['custom'];
  recommendation.draft.instrumentMarkets = { CUSTOM: 'Forex' };
  const entries = [{ symbol: 'EUR/USD', assetClass: 'Forex' }] as JournalEntry[];
  const draft = recommendationQuickDraft(recommendation, entries, [], '2026-10-28');
  assert.deepEqual(draft.symbols, ['CUSTOM']);
  assert.equal(draft.instrumentMarkets?.CUSTOM, 'Forex');
});

test('Recommendation cards expose creation actions while setup controls remain in a separate dialog', () => {
  const blankDraft = { ...DEFAULT_PLAYBOOKS[0], name: '', markets: [], symbols: [] };
  const recommendations = buildPlaybookRecommendations([], [], '2026-10-28');
  const html = renderToStaticMarkup(createElement(StrategyRecommendationDialog, {
    recommendations,
    blankDraft,
    entries: [],
    existingNames: [],
    createdAt: '2026-10-28',
    onClose: () => {},
    onCustomize: () => {},
    onCreate: () => null,
  }));
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /Search strategy recommendations/);
  assert.match(html, /Create your own/);
  assert.match(html, /Create playbook/);
  assert.match(html, /role="region" aria-label="Strategy recommendations" tabindex="0"/);
  assert.equal((html.match(/Create playbook from /g) || []).length, recommendations.length);
  assert.doesNotMatch(html, /Use this draft|Strategy name|Instrument symbols|Customize details/);

  const setup = renderToStaticMarkup(createElement(PlaybookSetupDialog, {
    draft: blankDraft,
    entries: [],
    onChange: () => {},
    onBack: () => {},
    onCustomize: () => {},
    onCreate: () => null,
  }));
  assert.match(setup, /aria-modal="true"/);
  assert.match(setup, /Strategy name/);
  assert.match(setup, /Instrument symbols/);
  assert.match(setup, /Strategy markets/);
  assert.match(setup, /Customize details/);
  assert.match(setup, /Create playbook/);
  assert.match(setup, /Back to recommendations/);
});
