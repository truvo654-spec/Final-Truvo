import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { buildCoachScenarioStudy, coachPeriod } from '../coachScenarios';
import { eligible, netOf } from '../journalMath';
import { buildPlaybookRecommendations } from '../playbookRecommendations';
import { defaultSettings, validateSettings } from '../../../backtest/rules';

test('latest week contains exactly seven inclusive dates ending at the latest recorded day', () => {
  const period = coachPeriod(JOURNAL_ENTRIES, '2026-10-14', 7);
  assert.deepEqual(period, { from: '2026-09-29', to: '2026-10-05' });
});

test('every scenario reconciles to the same recorded baseline and same trade IDs', () => {
  const study = buildCoachScenarioStudy(JOURNAL_ENTRIES, 'USD', '2026-10-14', 'net');
  assert.ok(study.shortlist.length >= 2);
  const ids = study.cohort.map(e => e.id).sort();
  const net = Math.round(study.cohort.reduce((sum, e) => sum + netOf(e), 0) * 100) / 100;
  for (const row of study.rows) {
    assert.deepEqual(row.output.trades.map(e => e.id).sort(), ids);
    assert.equal(row.output.actual.netPnl, net);
    assert.ok(Math.abs(row.output.saved - (row.output.whatIf.netPnl - net)) < 1e-8);
    assert.equal(row.output.estimated, ['stop', 'target', 'breakeven'].includes(row.rule.kind));
  }
});

test('one recorded trade can be compared to multiple exits without a reliable improvement claim', () => {
  const source = JOURNAL_ENTRIES.find(e => eligible(e))!;
  const study = buildCoachScenarioStudy([{ ...source, initialRisk: 100, rMultiple: 2, pnl: 200, commission: 0 }], 'USD', '2026-10-14', 'net');
  assert.ok(study.shortlist.length >= 3);
  assert.equal(study.recommendation?.status, 'insufficient');
  assert.ok(study.rows.every(r => r.output.trades.length === 1));
});

test('later-period performance cannot change the suggested scenario shortlist', () => {
  const first = buildCoachScenarioStudy(JOURNAL_ENTRIES, 'USD', '2026-10-14', 'net');
  const laterIds = new Set(first.rows[0].validation?.trades.map(t => t.id) || []);
  const changed = JOURNAL_ENTRIES.map(e => laterIds.has(e.id) ? { ...e, pnl: -999999, rMultiple: -1000 } : e);
  const second = buildCoachScenarioStudy(changed, 'USD', '2026-10-14', 'net');
  assert.deepEqual(second.shortlist.map(r => r.id), first.shortlist.map(r => r.id));
});

test('refreshing matching ideas changes parameter choices without changing their source trades or recommendation', () => {
  const first = buildCoachScenarioStudy(JOURNAL_ENTRIES, 'USD', '2026-10-14', 'net');
  const next = buildCoachScenarioStudy(JOURNAL_ENTRIES, 'USD', '2026-10-14', 'net', 1);
  assert.notDeepEqual(next.shortlist.map(row => row.id), first.shortlist.map(row => row.id));
  assert.equal(next.recommendation?.candidate?.id, first.recommendation?.candidate?.id);
  if (next.recommendation?.candidate) assert.ok(next.shortlist.some(row => row.id === next.recommendation!.candidate!.id));
  assert.deepEqual(next.cohort.map(entry => entry.id), first.cohort.map(entry => entry.id));
  const selection = first.cohort.slice(0, 2);
  const subset = buildCoachScenarioStudy(selection, 'USD', '2026-10-14', 'net', 2);
  for (const row of subset.rows) assert.deepEqual(row.output.trades.map(trade => trade.id).sort(), selection.map(entry => entry.id).sort());
});

test('daily guardrails are withheld when execution chronology is missing', () => {
  const entries = JOURNAL_ENTRIES.map(e => ({ ...e, entryTime: undefined, exitTime: undefined, initialRisk: undefined, mistakes: [], tags: [] }));
  const study = buildCoachScenarioStudy(entries, 'USD', '2026-10-14', 'net');
  assert.ok(study.rows.every(r => !['lossesPerDay', 'dailyLoss', 'hours', 'stop', 'target', 'breakeven'].includes(r.rule.kind)));
});

test('all catalogue recipes transfer valid indicator parameters into backtest setup', () => {
  for (const recommendation of buildPlaybookRecommendations([], [], '2026-10-14').filter(r => r.kind === 'technical')) {
    const settings = defaultSettings({ playbook: recommendation.draft });
    assert.deepEqual(validateSettings(settings).filter(p => p.field === 'rules'), [], recommendation.title);
  }
});
