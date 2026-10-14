import test from 'node:test';
import assert from 'node:assert/strict';
import type { JournalEntry } from '../../../types';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { TECHNICAL_STRATEGIES } from '../../../backtest/technicalStrategies';
import { defaultSettings, IND_LABEL } from '../../../backtest/rules';
import { buildPlaybookRecommendations, RECOMMENDATION_MARKETS } from '../playbookRecommendations';

const trade = (patch: Partial<JournalEntry> = {}): JournalEntry => ({
  id: 'trade',
  date: '2026-10-01',
  symbol: 'EUR/USD',
  assetClass: 'Forex',
  direction: 'BUY',
  entryPrice: 1,
  exitPrice: 2,
  size: 1,
  pnl: 10,
  rMultiple: 1,
  outcome: 'win',
  tradingStatus: 'closed',
  commission: 0,
  strategy: 'Test setup',
  tags: [],
  setupNotes: '',
  emotionBefore: null,
  emotionAfter: null,
  followedPlan: null,
  checklistDone: [],
  mistakes: [],
  lessons: '',
  rating: null,
  source: 'manual',
  ...patch,
});

test('recommendations cover all five journal asset classes and use starter drafts without evidence', () => {
  const recommendations = buildPlaybookRecommendations([], [], '2026-10-12');
  const journal = recommendations.filter((recommendation) => recommendation.kind === 'journal');
  const technical = recommendations.filter((recommendation) => recommendation.kind === 'technical');
  assert.deepEqual(journal.map((recommendation) => recommendation.market), RECOMMENDATION_MARKETS);
  assert.equal(recommendations.length, 25);
  assert.equal(technical.length, 20);
  assert.equal(new Set(recommendations.map((recommendation) => recommendation.id)).size, 25);
  for (const market of RECOMMENDATION_MARKETS) {
    assert.equal(technical.filter((recommendation) => recommendation.market === market).length, 4);
  }
  assert.ok(journal.every((recommendation) => !recommendation.personalized));
  assert.ok(recommendations.every((recommendation) => recommendation.draft.status === 'testing'));
  assert.ok(journal.every((recommendation) => recommendation.draft.rules.length >= 3));
  assert.deepEqual(technical.map((recommendation) => recommendation.id), TECHNICAL_STRATEGIES.map((scenario) => scenario.id));
  for (const recommendation of technical) {
    const scenario = TECHNICAL_STRATEGIES.find((item) => item.id === recommendation.id)!;
    assert.equal(recommendation.draft.technicalRecipeId, scenario.id);
    assert.deepEqual(recommendation.tools, scenario.tools.map((tool) => IND_LABEL[tool]));
  }
});

test('technical recommendations load the same timeframe and executable rules in backtest setup', () => {
  const recommendations = buildPlaybookRecommendations([], [], '2026-10-12');
  for (const scenario of TECHNICAL_STRATEGIES) {
    const recommendation = recommendations.find((item) => item.id === scenario.id)!;
    const settings = defaultSettings({ playbook: recommendation.draft });
    assert.equal(settings.timeframe, scenario.timeframe);
    assert.deepEqual(settings.rules, JSON.parse(JSON.stringify(scenario.rules)));
  }
});

test('personalized recommendation requires five eligible, risk-recorded trades with positive average R', () => {
  const entries = Array.from({ length: 5 }, (_, i) => trade({ id: `t${i}`, rMultiple: 0.5 + i / 10 }));
  const [forex] = buildPlaybookRecommendations(entries, [], '2026-10-12');
  assert.equal(forex.personalized, true);
  assert.match(forex.title, /Test setup/);
  assert.match(forex.description, /5 eligible closes/);
  assert.match(forex.draft.thesis, /positive average/);
  assert.equal(forex.draft.symbols?.[0], 'EUR/USD');
});

test('open trades, unknown costs, and insufficient R coverage cannot create a performance-ranked setup', () => {
  const entries = [
    ...Array.from({ length: 5 }, (_, i) => trade({ id: `missing-r${i}`, rMultiple: null })),
    trade({ id: 'open', tradingStatus: 'open', rMultiple: 2 }),
    trade({ id: 'unknown-costs', commission: undefined, rMultiple: 2 }),
  ];
  const [forex] = buildPlaybookRecommendations(entries, [], '2026-10-12');
  assert.equal(forex.personalized, false);
  assert.match(forex.description, /not a performance ranking/);
});

test('recommendation copies matching playbook rules into an isolated testing draft', () => {
  const playbook = DEFAULT_PLAYBOOKS.find((item) => item.name === 'Swing')!;
  const entries = Array.from({ length: 5 }, (_, i) => trade({
    id: `swing${i}`,
    strategy: 'Swing',
    rMultiple: 1,
    assetClass: 'Forex',
  }));
  const [forex] = buildPlaybookRecommendations(entries, [playbook], '2026-10-12');
  assert.equal(forex.draft.status, 'testing');
  assert.equal(forex.draft.grade, 'C');
  assert.equal(forex.draft.markets.join(','), 'Forex');
  assert.equal(forex.draft.rules[0].title, playbook.rules[0].title);
  assert.deepEqual(forex.draft.scenarios, []);
  assert.notEqual(forex.draft.rules, playbook.rules);
});
