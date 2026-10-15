import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JournalEntry } from '../../../types';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { buildCoachReport, createCoachDraft } from '../aiCoach';
import { JournalAICoach } from '../JournalAICoach';
import { relatedReplaySetups } from '../../../backtest/replaySetups';
import { defaultSettings } from '../../../backtest/rules';

const trade = (i: number, patch: Partial<JournalEntry> = {}): JournalEntry => ({
  id: `t${i}`, date: `2026-09-${String(i + 1).padStart(2, '0')}`, symbol: 'EUR/USD', assetClass: 'Forex', direction: 'BUY',
  entryPrice: 1.1, exitPrice: 1.2, size: 1, pnl: 30, commission: 1, rMultiple: 1, outcome: 'win', tradingStatus: 'closed',
  strategy: 'Breakout', tags: [], setupNotes: '', emotionBefore: null, emotionAfter: null, followedPlan: true,
  checklistDone: [], mistakes: [], mistakesReviewed: true, lessons: '', rating: null, source: 'manual', ...patch,
});
const history = () => Array.from({ length: 10 }, (_, i) => [trade(i, { id: `a${i}`, strategy: 'Breakout', followedPlan: true, rMultiple: 2 }), trade(i, { id: `b${i}`, strategy: 'Swing', followedPlan: false, pnl: -20, rMultiple: -1, mistakes: ['Early entry'] })]).flat();

test('coach excludes unavailable results, foreign currencies and future records without inventing a baseline', () => {
  const entries = [trade(0), trade(1, { commission: undefined }), trade(2, { tradingStatus: 'open' }), trade(3, { accountCurrency: 'EUR' }), trade(4, { date: '2027-01-01' }), trade(5, { exitTime: '2027-01-01T10:00:00Z' })];
  const report = buildCoachReport(entries, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'expectancy');
  assert.deepEqual(report.closed.map(e => e.id), ['t0']);
  assert.equal(report.baseline.total, 29);
  const empty = buildCoachReport([], DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'consistency');
  assert.equal(empty.baseline.expectancy, null);
  assert.deepEqual(empty.scenarios, []);
});

test('later-period results cannot influence scenario selection and same-day entries stay in one partition', () => {
  const entries = history();
  const before = buildCoachReport(entries, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'expectancy');
  const changed = entries.map(e => e.date > before.cutoff! ? { ...e, pnl: -99999, rMultiple: -1000, mistakes: ['New future mistake'], followedPlan: !e.followedPlan } : e);
  const after = buildCoachReport(changed, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'expectancy');
  assert.deepEqual(after.scenarios.map(s => [s.id, s.title, s.draft.rules]), before.scenarios.map(s => [s.id, s.title, s.draft.rules]));
  assert.notEqual(after.validationBaseline.total, before.validationBaseline.total);
  assert.ok(before.training.every(t => !before.validation.some(v => v.date === t.date)));
  assert.equal(before.scenarios.find(s => s.id === 'focus')?.sourcePlaybookId, 'PB-001');
});

test('unknown plan answers and unreviewed empty mistake tags cannot become favorable evidence', () => {
  const entries = history();
  entries.push(...Array.from({ length: 6 }, (_, i) => trade(i, { id: `unknown${i}`, followedPlan: null, mistakesReviewed: false })));
  const report = buildCoachReport(entries, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'consistency');
  assert.ok(report.scenarios.find(s => s.id === 'plan'));
  assert.ok(report.scenarios.find(s => s.id === 'mistake'));
  assert.ok(report.scenarios.filter(s => s.kind === 'journal' && s.id !== 'focus').every(s => s.evidenceIds.every(id => !id.startsWith('unknown'))));
});

test('known exits beyond the training cutoff never select a hypothesis', () => {
  const entries = history();
  const initial = buildCoachReport(entries, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'expectancy');
  const late = trade(0, { id: 'crossing', pnl: 90000, rMultiple: 9000, exitTime: '2026-09-10T12:00:00Z' });
  const report = buildCoachReport([...entries, late], DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'expectancy');
  assert.equal(report.cutoff, initial.cutoff);
  assert.ok(!report.training.some(e => e.id === late.id));
});

test('goal changes use their own metric and linked playbooks restrict the analysis', () => {
  const entries = history().map(e => e.strategy === 'Swing' ? { ...e, rMultiple: 4 } : e);
  const expectancy = buildCoachReport(entries, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'expectancy');
  const consistency = buildCoachReport(entries, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'consistency');
  assert.match(expectancy.scenarios.find(s => s.id === 'focus')!.title, /Swing/);
  assert.match(consistency.scenarios.find(s => s.id === 'focus')!.title, /Breakout/);
  const linked = buildCoachReport(entries, DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'consistency', 'PB-002');
  assert.ok(linked.closed.every(e => e.strategy === 'Swing'));
  assert.ok(linked.scenarios.every(s => s.sourcePlaybookId === 'PB-002'));
});

test('saved experiments are independent, uniquely named and transfer executable recipes to testing', () => {
  const originals = JSON.stringify(DEFAULT_PLAYBOOKS);
  const report = buildCoachReport(history(), DEFAULT_PLAYBOOKS, 'USD', '2026-10-14', 'consistency');
  const scenario = report.scenarios.find(s => s.kind === 'library')!;
  const draft = createCoachDraft(scenario, 'coach-1', [scenario.draft.name]);
  assert.match(draft.name, /\(2\)$/);
  assert.equal(draft.status, 'testing');
  assert.equal(draft.coachOrigin?.sourcePlaybookId, 'PB-001');
  assert.ok(defaultSettings({ playbook: draft }).rules.entry.length > 0);
  assert.ok(relatedReplaySetups([draft], history(), [], []).some(s => s.id === 'playbook:coach-1' && s.playbookId === draft.id));
  draft.rules[0].title = 'Edited locally';
  assert.notEqual(draft.rules[0].title, scenario.draft.rules[0].title);
  assert.equal(JSON.stringify(DEFAULT_PLAYBOOKS), originals);
});

test('coach renders evidence, untested alternatives, comparison and saved-draft actions without model claims', () => {
  const html = renderToStaticMarkup(createElement(JournalAICoach, { entries: history(), history: history(), playbooks: DEFAULT_PLAYBOOKS, currency: 'USD', today: '2026-10-14', rangeLabel: 'All time', advancedAccess: true, currentLevel: 4, credits: 500, onUnlockAdvanced: () => {}, onUpgrade: () => {}, onEvidence: () => {}, onScenario: () => {}, onImport: () => {}, onToast: () => {} }));
  assert.match(html, /Compare the evidence/);
  assert.match(html, /Strategy library · untested/);
  assert.match(html, /Save &amp; practice/);
  assert.match(html, /Save &amp; compare/);
  assert.match(html, /not a trained neural model/);
  assert.doesNotMatch(html, /NaN|Guaranteed|Predicted profit/);
});

test('basic coach summary remains available while advanced scenarios are locked below Level 4', () => {
  const html = renderToStaticMarkup(createElement(JournalAICoach, { entries: history(), history: history(), playbooks: DEFAULT_PLAYBOOKS, currency: 'USD', today: '2026-10-14', rangeLabel: 'All time', advancedAccess: false, currentLevel: 3, credits: 500, onUnlockAdvanced: () => {}, onUpgrade: () => {}, onEvidence: () => {}, onScenario: () => {}, onImport: () => {}, onToast: () => {} }));

  assert.match(html, /Your journal summary/);
  assert.match(html, /Advanced AI Coach scenarios is locked/);
  assert.doesNotMatch(html, /Compare the evidence|Save &amp; practice/);
});
