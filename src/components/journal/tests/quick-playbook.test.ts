import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { StrategyRecommendationDialog } from '../StrategyRecommendationDialog';
import { PlaybookSetupDialog } from '../PlaybookSetupDialog';
import { PlaybookEditorFields } from '../PlaybookEditorFields';
import { PlaybookTradingRulesEditor } from '../PlaybookTradingRulesEditor';
import { SharedTradingRules } from '../SharedTradingRules';
import { describeCustomTradingRule, isCustomTradingRule } from '../customTradingRule';
import type { GlobalTradingRules } from '../JournalMonitors';
import { createPlaybookTradingRules, updatePlaybookTradingRulesFromDefaults } from '../../../data/tradingRules';
import { buildPlaybookRecommendations } from '../playbookRecommendations';
import { prepareQuickDraft, quickInstrumentCandidates, recommendationQuickDraft, toggleQuickMarket, uniquePlaybookName } from '../quickPlaybook';
import { defaultSettings } from '../../../backtest/rules';
import { TECHNICAL_STRATEGIES } from '../../../backtest/technicalStrategies';
import type { JournalEntry } from '../../../types';

const globalRules: GlobalTradingRules = { maxRisk: 1.5, maxDailyLoss: 4, maxTrades: 6, stopAfterLosses: 3, customRules: ['Avoid trading during major news.', { kind: 'numeric', name: 'Open positions', comparison: 'atMost', value: 2, unit: 'positions' }] };

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
    globalRules,
    existingNames: [],
    createdAt: '2026-10-28',
    onClose: () => {},
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
    globalRules,
    onChange: () => {},
    onBack: () => {},
    onCreate: () => null,
  }));
  assert.match(setup, /aria-modal="true"/);
  assert.match(setup, /Strategy name/);
  assert.match(setup, /AI suggestions/);
  assert.match(setup, /Search instruments/);
  assert.match(setup, /Choose instruments/);
  assert.match(setup, /aria-label="Tags \(comma separated\)"/);
  assert.doesNotMatch(setup, /Edit instruments|Instrument symbols/);
  assert.equal((setup.match(/aria-label="Playbook instruments"/g) ?? []).length, 1);
  assert.match(setup, /Strategy markets/);
  assert.match(setup, /Customize details/);
  assert.match(setup, /Create playbook/);
  assert.match(setup, /Back to recommendations/);
});

test('Detailed editor exposes the existing setup fields and prefilled recommendation rules', () => {
  const recommendation = buildPlaybookRecommendations([], [], '2026-10-29').find(item => item.kind === 'technical')!;
  const draft = recommendationQuickDraft(recommendation, [], [], '2026-10-29');
  const html = renderToStaticMarkup(createElement(PlaybookEditorFields, {
    editing: draft,
    setEditing: () => {},
    entries: [],
    globalRules,
    isNew: true,
  }));
  for (const label of ['Name', 'Style', 'Grade', 'Status', 'Session window', 'Min reward:risk (1:x)', 'Max risk per trade value', 'Max trades per day value', 'Thesis', 'Entry trigger', 'Stop / invalidation', 'Profit taking', 'Tags (comma separated)']) {
    assert.ok(html.includes(`aria-label="${label}"`), `${label} missing`);
  }
  assert.ok(html.includes(draft.rules[0].title));
  assert.match(html, /Execution rules/);
  assert.match(html, /Playbook instruments/);
  assert.match(html, /AI suggestions/);
  assert.doesNotMatch(html, /<details/);
});

test('Popup details organize the prefilled editor into closed topics without duplicate setup controls', () => {
  const draft = recommendationQuickDraft(buildPlaybookRecommendations([], [], '2026-10-29')[0], [], [], '2026-10-29');
  const html = renderToStaticMarkup(createElement(PlaybookEditorFields, {
    editing: draft,
    setEditing: () => {},
    entries: [],
    globalRules,
    isNew: true,
    includeSetupFields: false,
    grouped: true,
  }));
  assert.doesNotMatch(html, /aria-label="Name"|About Markets/);
  const topics = [...html.matchAll(/<details([^>]*)>([\s\S]*?)<\/details>/g)];
  assert.equal(topics.length, 5);
  for (const [index, [title, field]] of [
    ['Strategy profile', 'aria-label="Style"'],
    ['Session and risk', 'aria-label="Session window"'],
    ['Thesis and execution rules', 'aria-label="Thesis"'],
    ['Entry, stop and profit taking', 'aria-label="Entry trigger"'],
    ['Technical conditions', 'Technical entry conditions'],
  ].entries()) {
    assert.doesNotMatch(topics[index][1], /\bopen\b/);
    assert.ok(topics[index][2].includes(title));
    assert.ok(topics[index][2].includes(field));
  }
  assert.doesNotMatch(html, /Instrument tools and tags|Tags \(comma separated\)/);
  assert.ok(html.includes(draft.rules[0].title));
});

test('playbook editor keeps saved rule choices independent of later default changes', () => {
  const draft = {
    ...DEFAULT_PLAYBOOKS[0],
    tradingRules: createPlaybookTradingRules(globalRules, { riskPerTrade: 0.75, maxTradesPerDay: 2 }),
    strategyNotes: 'Wait for confirmation.\nReview the spread.',
  };
  const render = (editing: typeof draft, rules: typeof globalRules = globalRules) => renderToStaticMarkup(createElement(PlaybookEditorFields, {
    editing, setEditing: () => {}, entries: [], globalRules: rules, isNew: false, grouped: true,
  }));
  const html = render(draft);
  assert.doesNotMatch(html, /Global trading rules/);
  assert.match(html, /Max risk per trade value[^>]*value="0\.75"/);
  assert.match(html, /Max daily loss value[^>]*value="4"/);
  assert.match(html, /Max trades per day value[^>]*value="2"/);
  assert.match(html, /Stop after consecutive losses value[^>]*value="3"/);
  assert.match(html, /Avoid trading during major news\./);
  assert.match(html, /Open positions: At most 2 positions/);
  assert.match(html, /Reference only · not checked automatically/);
  assert.match(html, /aria-label="Strategy notes"[^>]*>Wait for confirmation\.\nReview the spread\./);
  assert.match(html, /Trading rules for this strategy/);
  assert.match(html, /Use Max risk per trade for this strategy/);
  assert.ok(html.includes(draft.rules[0].title));
  const updated = render(draft, { ...globalRules, maxRisk: 9 });
  assert.match(updated, /Max risk per trade value[^>]*value="0\.75"/);
  assert.doesNotMatch(updated, /Max risk per trade value[^>]*value="9"/);
  assert.equal(JSON.parse(JSON.stringify(draft)).strategyNotes, draft.strategyNotes);
});

test('playbook trading rules inherit defaults and can be selected independently', () => {
  const rules = createPlaybookTradingRules(globalRules, { riskPerTrade: 0.75, maxTradesPerDay: 2 });
  assert.deepEqual(rules.values, { maxRisk: 0.75, maxDailyLoss: 4, maxTrades: 2, stopAfterLosses: 3 });
  assert.ok(Object.values(rules.enabled).every(Boolean));
  assert.equal(rules.customRules.length, 2);
  const html = renderToStaticMarkup(createElement(PlaybookTradingRulesEditor, { rules, onChange: () => {} }));
  assert.match(html, /aria-label="Trading rules for this strategy"/);
  assert.match(html, /Use Max risk per trade for this strategy/);
  assert.match(html, /Use Max daily loss for this strategy/);
  assert.match(html, /Use added rule 1 for this strategy/);
  assert.match(html, /Remove added rule 1 from this strategy/);
  assert.match(html, /Avoid trading during major news\./);
  assert.match(html, /Reference only · not checked automatically/);
});

test('shared rule edits propagate defaults while preserving playbook opt-outs', () => {
  const playbook = createPlaybookTradingRules(globalRules);
  playbook.enabled.maxRisk = false;
  playbook.customRules[1].enabled = false;
  playbook.customRules.push({ id: 'local-reminder', rule: 'Only in this strategy', enabled: true });
  const updated = updatePlaybookTradingRulesFromDefaults(playbook, globalRules, {
    ...globalRules,
    maxDailyLoss: 5,
    customRules: [globalRules.customRules[0], 'Avoid low-volume sessions'],
  });
  assert.equal(updated.values.maxDailyLoss, 5);
  assert.equal(updated.enabled.maxRisk, false);
  assert.equal(updated.customRules[0].enabled, true);
  assert.equal(updated.customRules[1].rule, 'Avoid low-volume sessions');
  assert.equal(updated.customRules[1].enabled, false);
  assert.deepEqual(updated.customRules[2], { id: 'local-reminder', rule: 'Only in this strategy', enabled: true });
  const html = renderToStaticMarkup(createElement(SharedTradingRules, { rules: globalRules, storageFailed: false, onSave: () => true }));
  assert.match(html, /aria-label="Edit shared trading rules"/);
  assert.match(html, /update every existing playbook/i);
  assert.match(html, /Avoid trading during major news\./);
  assert.doesNotMatch(html, /Remove shared rule/);
});

test('numeric rules validate and describe conditions while preserving legacy written rules', () => {
  const numeric = { kind: 'numeric' as const, name: 'Open positions', comparison: 'atMost' as const, value: 2, unit: 'positions' };
  assert.equal(isCustomTradingRule('Check spreads.'), true);
  assert.equal(isCustomTradingRule(numeric), true);
  assert.equal(describeCustomTradingRule(numeric), 'Open positions: At most 2 positions');
  assert.equal(isCustomTradingRule({ ...numeric, comparison: 'invalid' }), false);
  assert.equal(isCustomTradingRule({ ...numeric, value: NaN }), false);
  assert.equal(isCustomTradingRule({ ...numeric, name: ' ' }), false);
  assert.equal(isCustomTradingRule({ ...numeric, unit: 5 }), false);
  const rules = createPlaybookTradingRules({ ...globalRules, customRules: [numeric] });
  const html = renderToStaticMarkup(createElement(PlaybookTradingRulesEditor, { rules, onChange: () => {} }));
  assert.match(html, /Open positions: At most 2 positions/);
  assert.match(html, /Trading rules for this strategy/);
  assert.match(html, /Use added rule 1 for this strategy/);
});
