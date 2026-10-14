import type { JournalEntry } from '../../types';
import { compareParameters, splitWhatIfHistory } from '../../backtest/whatifOptimizer';
import { aiWhatIfRules } from '../../backtest/whatifStudy';
import { describeWhatIf } from '../../backtest/whatif';
import { recommendSetup, type RecommendationGoal } from '../../backtest/recommender';
import { currencyOf, eligible, realizedR, timestampMs } from './journalMath';

export function coachPeriod(entries: JournalEntry[], today: string, days: number | null) {
  const latest = entries.filter(e => e.date <= today).map(e => e.date).sort().at(-1) || today;
  const from = days ? new Date(Date.parse(`${latest}T00:00:00Z`) - (days - 1) * 86400000).toISOString().slice(0, 10) : '';
  return { from, to: latest };
}

/** Evaluate every proposed rule against the exact same baseline trade IDs. */
export function coachEligibleTrades(entries: JournalEntry[], currency: string, today: string) {
  return entries.filter(e => currencyOf(e) === currency && eligible(e) && e.date <= today && (!e.exitTime || timestampMs(e.exitTime) <= Date.parse(`${today}T23:59:59.999Z`)));
}
export function buildCoachScenarioStudy(entries: JournalEntry[], currency: string, today: string, goal: RecommendationGoal, variation = 0) {
  const cohort = coachEligibleTrades(entries, currency, today);
  const rules = aiWhatIfRules(cohort);
  const { train } = splitWhatIfHistory(cohort);
  const timed = cohort.length > 0 && cohort.every(e => Number.isFinite(timestampMs(e.entryTime)) && Number.isFinite(timestampMs(e.exitTime)) && timestampMs(e.exitTime) >= timestampMs(e.entryTime));
  const priced = train.some(e => e.initialRisk != null && e.initialRisk > 0 && realizedR(e) != null);
  const candidates = rules.filter(r => (!['lossesPerDay', 'dailyLoss'].includes(r.kind) || timed) && (!['stop', 'target', 'breakeven'].includes(r.kind) || priced) && (r.kind !== 'hours' || cohort.some(e => Number.isFinite(timestampMs(e.entryTime)))));
  // Include bounded exit experiments for a single-trade investigation; do not rank them as reliable improvements.
  const rows = compareParameters(cohort, candidates);
  const baseline = rows[0]?.training.actual;
  const recommendation = baseline ? recommendSetup(rows.map(row => ({ id: row.id, name: describeWhatIf(row.rule), metrics: row.training.whatIf, estimated: row.output.estimated, validation: row.validation ? { baseline: row.validation.actual, candidate: row.validation.whatIf } : null })), baseline, goal) : null;
  const gain = (row: typeof rows[number]) => goal === 'drawdown' ? row.training.actual.maxDD - row.training.whatIf.maxDD : goal === 'win' ? row.training.whatIf.winRate - row.training.actual.winRate : row.training.whatIf.netPnl - row.training.actual.netPnl;
  const ranked = [...rows].sort((a, b) => Number(b.id === recommendation?.candidate?.id) - Number(a.id === recommendation?.candidate?.id) || (Number.isFinite(gain(b)) ? gain(b) : -Infinity) - (Number.isFinite(gain(a)) ? gain(a) : -Infinity) || a.id.localeCompare(b.id));
  // Refresh varies matching parameter ideas while preserving the evidence-based recommendation.
  const bestId = recommendation?.candidate?.id;
  const families = [...new Set(ranked.map(row => row.rule.kind))];
  const ordered = variation > 0 ? families.flatMap(kind => {
    const group = ranked.filter(row => row.rule.kind === kind && row.id !== bestId);
    const offset = group.length ? variation % group.length : 0;
    return [...ranked.filter(row => row.rule.kind === kind && row.id === bestId), ...group.slice(offset), ...group.slice(0, offset)];
  }) : ranked;
  // Preserve multiple distinct rule families before filling the shortlist.
  const shortlist: typeof rows = [];
  for (const row of ordered) if (!shortlist.some(s => s.rule.kind === row.rule.kind)) shortlist.push(row);
  for (const row of ordered) if (shortlist.length < 6 && !shortlist.some(s => s.id === row.id)) shortlist.push(row);
  return { cohort, rows, shortlist: shortlist.slice(0, 6), recommendation, timed, priced };
}
