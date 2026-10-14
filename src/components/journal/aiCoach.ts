import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { currencyOf, eligible, metrics, timestampMs } from './journalMath';
import { buildPlaybookRecommendations } from './playbookRecommendations';

export type CoachGoal = 'consistency' | 'expectancy' | 'drawdown';
export const COACH_GOALS: Record<CoachGoal, string> = {
  consistency: 'More consistent execution', expectancy: 'Better expectancy', drawdown: 'Smaller drawdowns',
};
export interface CoachScenario {
  id: string;
  kind: 'journal' | 'library';
  title: string;
  why: string;
  change: string;
  nextStep: string;
  sourcePlaybookId?: string;
  draft: JournalPlaybook;
  evidenceIds: string[];
  training: ReturnType<typeof metrics> | null;
  validation: ReturnType<typeof metrics> | null;
}

const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const normalize = (s: string) => s.trim().toLowerCase();
const rank = (trades: JournalEntry[], goal: CoachGoal) => {
  const m = metrics(trades);
  if (goal === 'drawdown') return -m.drawdown;
  if (goal === 'consistency') return m.plan ?? -1;
  return m.avgR ?? -Infinity;
};

/** Local, auditable pattern analysis. Candidate selection never reads the held-out results. */
export function buildCoachReport(entries: JournalEntry[], playbooks: JournalPlaybook[], currency: string, asOf: string, goal: CoachGoal, playbookId = '') {
  const selected = playbooks.find(p => p.id === playbookId);
  const scope = entries.filter(e => currencyOf(e) === currency && e.date <= asOf && (!selected || normalize(e.strategy) === normalize(selected.name)));
  const closed = scope.filter(e => eligible(e) && (!e.exitTime || timestampMs(e.exitTime) <= Date.parse(`${asOf}T23:59:59.999Z`)));
  const dates = [...new Set(closed.map(e => e.date))].sort();
  const cut = dates.length >= 2 ? dates[Math.max(0, Math.min(dates.length - 2, Math.floor(dates.length * 0.7) - 1))] : null;
  const training = closed.filter(e => !cut || (e.date <= cut && (!e.exitTime || timestampMs(e.exitTime) <= Date.parse(`${cut}T23:59:59.999Z`))));
  const validation = cut ? closed.filter(e => e.date > cut) : [];
  const names = [...new Map(training.filter(e => e.strategy.trim()).map(e => [normalize(e.strategy), e.strategy.trim()])).values()];
  const groups = names.map(name => ({ name, trades: training.filter(e => normalize(e.strategy) === normalize(name)) }));
  const lead = groups.filter(g => g.trades.length >= 5 && (goal !== 'expectancy' || metrics(g.trades).rCount >= 5) && (goal !== 'consistency' || metrics(g.trades).planKnown >= 5))
    .sort((a, b) => rank(b.trades, goal) - rank(a.trades, goal) || b.trades.length - a.trades.length || a.name.localeCompare(b.name))[0];
  const anchorName = selected?.name || lead?.name || groups.sort((a, b) => b.trades.length - a.trades.length)[0]?.name;
  const source = selected || playbooks.find(p => normalize(p.name) === normalize(anchorName || '') && p.status !== 'archived');
  const anchorTrades = training.filter(e => normalize(e.strategy) === normalize(anchorName || ''));
  const marketCounts = new Map<JournalEntry['assetClass'], number>();
  training.forEach(e => marketCounts.set(e.assetClass, (marketCounts.get(e.assetClass) || 0) + 1));
  const market = [...marketCounts].sort((a, b) => b[1] - a[1])[0]?.[0] || selected?.markets[0];
  const recommendations = market ? buildPlaybookRecommendations(training, playbooks, asOf).filter(r => r.market === market) : [];
  const template = source || recommendations.find(r => r.kind === 'journal')?.draft;
  const scenarios: CoachScenario[] = [];
  const addJournal = (id: string, title: string, why: string, change: string, test: (e: JournalEntry) => boolean) => {
    if (!template) return;
    const retained = training.filter(test);
    const later = validation.filter(test);
    // A scenario needs evidence both inside and outside its retained training cohort.
    if (retained.length < 3 || training.length - retained.length < 3) return;
    const draft = copy(template);
    draft.id = ''; draft.name = `${anchorName || template.name} · ${title}`;
    draft.status = 'testing'; draft.grade = 'C'; draft.createdAt = asOf;
    draft.scenarios = []; draft.reviews = []; draft.ruleHistory = []; draft.rulesEffectiveAt = undefined;
    draft.rules.push({ id: `coach-${id}`, title, detail: change });
    draft.thesis = `${draft.thesis}\nCoach experiment: ${change} Historical groups describe observed trades; this experiment has not been tested on new candles.`;
    draft.tags = [...new Set([...draft.tags, 'AI Coach experiment'])];
    draft.symbols = [...new Set(retained.map(e => e.symbol))];
    scenarios.push({ id, kind: 'journal', title, why, change, nextStep: 'Rehearse this rule in Practice, then compare a fresh test against your original setup.', sourcePlaybookId: source?.id, draft, evidenceIds: [...retained, ...later].map(e => e.id), training: metrics(retained), validation: cut ? metrics(later) : null });
  };
  if (lead && !selected) addJournal('focus', `Focus on ${lead.name}`, `This setup ranks first for ${COACH_GOALS[goal].toLowerCase()} among training groups with at least five closes${goal === 'expectancy' ? ' and five recorded R values' : ''}.`, `Only enter when the ${lead.name} playbook trigger and every required rule are confirmed.`, e => normalize(e.strategy) === normalize(lead.name));
  const planYes = training.filter(e => e.followedPlan === true);
  const planNo = training.filter(e => e.followedPlan === false);
  if (planYes.length >= 3 && planNo.length >= 3) addJournal('plan', 'Confirm the plan before entry', `The training period contains ${planYes.length} on-plan and ${planNo.length} off-plan closes. Unknown answers are excluded from this comparison.`, 'Confirm the written entry trigger, invalidation, planned exit and risk limit before placing an order. Skip the trade if any required condition is missing.', e => e.followedPlan === true);
  const mistakes = new Map<string, number>();
  training.forEach(e => [...new Set(e.mistakes)].forEach(m => mistakes.set(m, (mistakes.get(m) || 0) + 1)));
  const common = [...mistakes].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  if (common) addJournal('mistake', `Preflight: ${common[0]}`, `“${common[0]}” is recorded on ${common[1]} training closes. Untagged trades are not assumed mistake-free.`, `Before entry, explicitly check for “${common[0]}”. Write an observable reason to proceed or skip, then tag and review the result.`, e => e.mistakesReviewed === true && !e.mistakes.includes(common[0]));
  const alternatives = recommendations.filter(r => r.kind === 'technical' && r.draft.technicalRecipeId !== source?.technicalRecipeId);
  // Offer different catalogue approaches; their order is not a performance ranking.
  const picks = goal === 'drawdown' ? alternatives.filter(r => /reversion|reversal|reclaim/i.test(r.draft.style + r.title)).concat(alternatives) : alternatives;
  for (const recommendation of [...new Map(picks.map(r => [r.id, r])).values()].slice(0, 2)) {
    const draft = copy(recommendation.draft);
    draft.symbols = [...new Set(anchorTrades.filter(e => e.assetClass === market).map(e => e.symbol))];
    if (source?.riskPerTrade != null) draft.riskPerTrade = source.riskPerTrade;
    scenarios.push({ id: recommendation.id, kind: 'library', title: recommendation.title, why: `An alternative ${market} approach from your strategy library${source ? `, linked to ${source.name}` : ''}. Selected by market compatibility, not historical profitability.`, change: recommendation.draft.entryTrigger, nextStep: 'Open the editable backtest setup. Test the entry and exit recipe on the same data and costs as your original.', sourcePlaybookId: source?.id, draft, evidenceIds: anchorTrades.map(e => e.id), training: null, validation: null });
  }
  return { scope, closed, training, validation, cutoff: cut, baseline: metrics(closed), validationBaseline: metrics(validation), scenarios, excluded: scope.length - closed.length, missingCloseTimes: closed.filter(e => !e.exitTime).length };
}

export function createCoachDraft(scenario: CoachScenario, id: string, names: string[]): JournalPlaybook {
  const draft = copy(scenario.draft);
  let name = draft.name;
  let i = 2;
  while (names.some(n => normalize(n) === normalize(name))) name = `${draft.name} (${i++})`;
  return { ...draft, id, name, tags: [...new Set([...draft.tags, 'AI Coach experiment'])], coachOrigin: { scenarioId: scenario.id, sourcePlaybookId: scenario.sourcePlaybookId, evidenceTradeIds: [...scenario.evidenceIds] } };
}
