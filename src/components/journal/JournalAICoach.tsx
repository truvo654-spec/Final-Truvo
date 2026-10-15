import { JournalHelp } from './JournalHelp';
import React, { useMemo } from 'react';
import { ArrowRight, BookOpen, FlaskConical, Network, Play, Sparkles } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { buildCoachReport, COACH_GOALS, type CoachGoal, type CoachScenario } from './aiCoach';
import { useJournalState } from './journalStorage';
import { formatMoney } from './JournalCurrency';
import { metrics } from './journalMath';
import { JournalScenarioLab } from './JournalScenarioLab';
import { buildCoachScenarioStudy, coachPeriod } from './coachScenarios';

const panel = 'rounded-2xl border border-slate-200 bg-white p-5';
const secondary = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold hover:border-[#5338ec] hover:text-[#5338ec] disabled:opacity-40';
const primary = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#5338ec] px-3 text-xs font-semibold text-white hover:bg-[#4326d8]';

export function CoachOverviewCard({ entries, playbooks, currency, today, onOpen }: { entries: JournalEntry[]; playbooks: JournalPlaybook[]; currency: string; today: string; onOpen: () => void }) {
  const study = useMemo(() => { const range = coachPeriod(entries, today, 7); return buildCoachScenarioStudy(entries.filter(e => e.date >= range.from && e.date <= range.to), currency, today, 'net'); }, [entries, currency, today]);
  return <section className="rounded-2xl border border-[#5338ec]/25 bg-gradient-to-br from-[#F3EFFF] to-white p-5" aria-label="Personalized AI coach">
    <p className="flex items-center gap-2 text-xs font-bold text-[#5338ec]"><Sparkles className="h-4 w-4"/>MarketSyde AI <span className="rounded bg-white px-1.5 py-0.5 text-[10px]">Coach · Beta</span></p>
    <h3 className="mt-3 text-sm font-bold">One trade. Multiple scenarios.<JournalHelp label="One trade. Multiple scenarios." /></h3>
    <p className="mt-2 text-xs leading-relaxed text-slate-600">Choose a recent trade, then compare several alternative setups on its candle chart.</p>
    <p className="mt-2 text-[11px] text-slate-500">{study.cohort.length} eligible closes in the latest week of this view · {study.shortlist.length} scenario ideas</p>
    <button type="button" onClick={onOpen} className={`${primary} mt-4 w-full`}>Explore AI Coach <ArrowRight className="h-3.5 w-3.5"/></button>
  </section>;
}

interface Props {
  entries: JournalEntry[];
  history: JournalEntry[];
  playbooks: JournalPlaybook[];
  currency: string;
  today: string;
  rangeLabel: string;
  onEvidence: (ids: string[], label: string) => void;
  onScenario: (scenario: CoachScenario, action: 'save' | 'practice' | 'test') => void;
  onImport: () => void;
  onToast: (msg: string) => void;
}

export function JournalAICoach({ entries, history, playbooks, currency, today, rangeLabel, onEvidence, onScenario, onImport, onToast }: Props) {
  const [goal, setGoal] = useJournalState<CoachGoal>('coach-goal', 'consistency');
  const [bookId, setBookId] = useJournalState('coach-playbook', '');
  const [scope, setScope] = useJournalState<'view' | 'history'>('coach-scope', 'history');
  const activeBooks = playbooks.filter(p => p.status !== 'archived');
  const validBookId = activeBooks.some(p => p.id === bookId) ? bookId : '';
  const safeGoal = goal in COACH_GOALS ? goal : 'consistency';
  const report = useMemo(() => buildCoachReport(scope === 'view' ? entries : history, activeBooks, currency, today, safeGoal, validBookId), [entries, history, playbooks, currency, today, safeGoal, validBookId, scope]);
  const source = activeBooks.find(p => p.id === validBookId);
  const journalScenarios = report.scenarios.filter(s => s.kind === 'journal');
  const number = (v: number | null, suffix = '') => v == null ? '—' : `${v.toFixed(1)}${suffix}`;
  return <div className="mt-6 space-y-5 text-[#0b1c30]">
    <section className="relative overflow-hidden rounded-2xl border border-[#D8D0FF] bg-gradient-to-br from-[#F1ECFF] via-white to-[#EEF8FF] p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-bold text-[#5338ec]"><Sparkles className="h-5 w-5"/>MarketSyde AI <span className="rounded-full border border-[#D8D0FF] px-2 py-0.5 text-[10px]">Coach · Beta</span></p><span className="text-[11px] text-slate-500">Local journal pattern engine</span></div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">One trade. Several alternatives to test.<JournalHelp label="One trade. Several alternatives to test." /></h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Find a trade in your history, select several matching scenarios, and compare their exits and results on the same candle chart.</p>
      <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Coaching workflow">{[['01', 'Your trade history'], ['02', 'Evidence & patterns'], ['03', 'Alternative scenarios'], ['04', 'Practice & compare']].map(([n, title]) => <li key={n} className="flex items-center gap-2 rounded-xl border border-white bg-white/75 px-3 py-2.5 text-xs"><span className="font-mono text-[#5338ec]">{n}</span><span className="font-semibold">{title}</span></li>)}</ol>
    </section>

    <section className={`${panel} grid gap-4 sm:grid-cols-2`} aria-label="Coach preferences">
      <label className="text-xs font-semibold">Your goal<JournalHelp label="Your goal" /><select aria-label="Your goal" value={safeGoal} onChange={e => setGoal(e.target.value as CoachGoal)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal">{Object.entries(COACH_GOALS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label className="text-xs font-semibold">Build around<JournalHelp label="Build around" /><select aria-label="Build around" value={validBookId} onChange={e => setBookId(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal"><option value="">Find a pattern across my playbooks</option>{activeBooks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    </section>

    <JournalScenarioLab history={history} currency={currency} today={today} goal={safeGoal} playbookName={source?.name} onEvidence={onEvidence} onToast={onToast}/>
    <details className={panel}><summary className="cursor-pointer text-sm font-semibold">Playbook experiments & strategy alternatives<JournalHelp label="Playbook experiments & strategy alternatives" /></summary><div className="mt-5 space-y-5">
    <label className="block text-xs font-semibold">Playbook evidence scope<JournalHelp label="Playbook evidence scope" /><select aria-label="Playbook evidence scope" value={scope} onChange={e => setScope(e.target.value as 'view' | 'history')} className="ml-3 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal"><option value="history">All dates · current account & filters</option><option value="view">Current journal date range · {rangeLabel}</option></select></label>

    <div className="grid gap-3 sm:grid-cols-3">{[
      ['Evidence available', `${report.closed.length} closed / ${report.scope.length} recorded`, `${report.excluded} excluded: open, unknown net result or unavailable close`],
      ['Your recorded baseline', report.baseline.n ? formatMoney(report.baseline.total, currency) : '—', `${currency} · ${number(report.baseline.avgR, 'R')} average R · ${report.baseline.rCount} with R`],
      ['Your experiment shortlist', `${report.scenarios.length} scenarios`, `${journalScenarios.length} journal patterns · ${report.scenarios.length - journalScenarios.length} library alternatives`],
    ].map(([label, value, detail]) => <section key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-[11px] font-semibold text-slate-500">{label}<JournalHelp label={label} /></p><p className="mt-2 text-lg font-bold">{value}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{detail}</p></section>)}</div>

    {report.closed.length === 0 ? <section className={`${panel} text-center`}><Network className="mx-auto h-8 w-8 text-[#5338ec]"/><h3 className="mt-3 font-bold">Start with your trading evidence</h3><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">No eligible closes match {source?.name || 'this scope'} in {currency}. Broaden the account or journal filters, choose another playbook, or import your statement.</p><button type="button" className={`${primary} mt-4`} onClick={onImport}>Import trades</button></section> : <>
      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">What your history suggests<JournalHelp label="What your history suggests" /></h3><button type="button" onClick={() => onEvidence(report.closed.map(e => e.id), 'AI Coach · analyzed closes')} className="text-xs font-semibold text-[#5338ec]">Inspect {report.closed.length} source trades <ArrowRight className="inline h-3 w-3"/></button></div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{journalScenarios.length ? `We found ${journalScenarios.length} rule changes worth rehearsing. They come from the earlier ${report.training.length} closes; the later ${report.validation.length} closes are shown separately for a chronological check.` : `The ${report.training.length} earlier closes do not meet the cohort thresholds for a journal pattern. You can still explore market-compatible library setups; they have no measured results yet.`}</p>
        <p className="mt-2 text-[11px] text-slate-500">{source ? `Linked strategy: ${source.name}. ` : ''}Account, currency and journal filters apply. Suggestion selection uses the earlier period; later results do not change the shortlist.</p>
      </section>

      <div className="flex items-center justify-between"><h3 className="text-lg font-bold">A few paths to test<JournalHelp label="A few paths to test" /></h3><span className="text-xs text-slate-500">Choose one experiment at a time</span></div>
      <div className="grid gap-4 lg:grid-cols-2">{report.scenarios.map((scenario, i) => <article key={scenario.id} className={`${panel} flex flex-col`}>
        <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[#F1ECFF] px-2.5 py-1 text-[10px] font-bold text-[#5338ec]">{scenario.kind === 'journal' ? 'From your Trade Log' : 'Strategy library · untested'}</span><span className="text-xs font-mono text-slate-400">0{i + 1}</span></div>
        <h4 className="mt-3 text-base font-bold">{scenario.title}</h4><p className="mt-2 text-xs leading-relaxed text-slate-600">{scenario.why}</p>
        <div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">The change to rehearse</p><p className="mt-1 text-xs leading-relaxed">{scenario.change}</p></div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><p className="text-[10px] text-slate-500">Entry & invalidation</p><p className="mt-1 leading-relaxed">{scenario.draft.stopRule}</p></div><div><p className="text-[10px] text-slate-500">Exit plan</p><p className="mt-1 leading-relaxed">{scenario.draft.targetRule}</p></div></div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{scenario.nextStep}</p>
        {scenario.kind === 'journal' && <p className="mt-2 text-[11px] leading-relaxed text-amber-700">This behavior change is a manual practice checklist. Automated tests only enforce supported market rules, so review the test settings before running.</p>}
        <details className="mt-3 text-xs"><summary className="cursor-pointer font-semibold text-[#5338ec]">Setup rules & source evidence<JournalHelp label="Setup rules & source evidence" /></summary><ul className="mt-2 space-y-2">{scenario.draft.rules.map(r => <li key={r.id}><strong>{r.title}:</strong> {r.detail}</li>)}</ul>{scenario.evidenceIds.length > 0 && <button type="button" onClick={() => onEvidence(scenario.evidenceIds, `AI Coach · ${scenario.title}`)} className="mt-3 font-semibold text-[#5338ec]">Open {scenario.evidenceIds.length} linked trades</button>}</details>
        <div className="mt-auto flex flex-wrap gap-2 pt-5"><button type="button" className={primary} onClick={() => onScenario(scenario, 'practice')}><Play className="h-3 w-3"/>Save & practice</button><button type="button" className={secondary} onClick={() => onScenario(scenario, 'test')}><FlaskConical className="h-3.5 w-3.5"/>{scenario.sourcePlaybookId ? 'Save & compare' : 'Save & test'}</button><button type="button" className={secondary} onClick={() => onScenario(scenario, 'save')}><BookOpen className="h-3.5 w-3.5"/>Save draft</button></div>
      </article>)}</div>

      <section className={panel}>
        <h3 className="font-bold">Compare the evidence<JournalHelp label="Compare the evidence" /></h3><p className="mt-1 text-xs text-slate-500">Later-period recorded results{report.cutoff ? ` · entry dates after ${report.cutoff}` : ' · need at least two dates'}. Scenario rows retain observed trades that match the rule; this is a subset comparison, not a simulated return.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><caption className="sr-only">Later-period baseline and scenario evidence</caption><thead className="bg-slate-50 text-[10px] text-slate-500"><tr>{['Approach', 'Strategy change', 'Closes', `Net ${currency}`, 'Win rate', 'Avg R', 'Daily net drawdown'].map(h => <th key={h} className="p-3 font-semibold">{h}<JournalHelp label={h} /></th>)}</tr></thead><tbody>
          <EvidenceRow title="Recorded baseline" change="All eligible later-period trades" evidence={report.cutoff ? report.validationBaseline : null} currency={currency}/>
          {report.scenarios.map(s => <EvidenceRow key={s.id} title={s.title} change={s.kind === 'library' ? 'New entry / exit recipe · untested' : 'Retained historical cohort'} evidence={s.validation} currency={currency}/>)}
        </tbody></table></div>
        <p className="mt-3 text-[11px] text-slate-500">Different counts and position sizes affect comparisons. A small later-period sample can reverse the earlier pattern; no scenario is labeled a winner.</p>
      </section>
    </>}

    <details className={`${panel} text-xs leading-relaxed text-slate-600`}><summary className="cursor-pointer font-semibold text-[#0b1c30]">How this coach builds scenarios<JournalHelp label="How this coach builds scenarios" /></summary><div className="mt-3 space-y-2"><p>This Beta uses transparent local rules, not a trained neural model or a connected language model. Your Trade Log is analyzed in this browser. Suggestions are editable experiment drafts.</p><p>The first 70% of unique entry dates select ideas; later dates provide a chronological check, not independent validation. A strategy needs five earlier closes to be ranked; expectancy also needs five recorded R values. Behavioral comparisons need at least three observed trades on each side. Unknown adherence and unreviewed mistake tags are not treated as positive evidence.</p><p>{report.missingCloseTimes} eligible trades have no close timestamp and use their recorded entry date. Trades with known exits after the earlier-period cutoff cannot select a scenario. Open trades, unknown net results, other currencies and future records are excluded.</p><p>Written behavior rules remain a manual practice checklist. Library recipes can prefill automated rules; backtests and Practice label their data source separately. Saved drafts preserve your original playbook.</p></div></details>
    </div></details>
  </div>;
}

const EvidenceRow: React.FC<{ title: string; change: string; evidence: ReturnType<typeof metrics> | null; currency: string }> = ({ title, change, evidence, currency }) => {
  const known = evidence && evidence.n > 0;
  return <tr className="border-b border-slate-100"><th scope="row" className="p-3 font-semibold">{title}</th><td className="p-3 text-slate-500">{change}</td><td className="p-3">{evidence ? evidence.n : '—'}</td><td className="p-3 font-mono">{known ? formatMoney(evidence.total, currency) : '—'}</td><td className="p-3">{known ? `${evidence.winRate!.toFixed(1)}%` : '—'}</td><td className="p-3">{known && evidence.avgR != null ? `${evidence.avgR.toFixed(2)}R (${evidence.rCount})` : '—'}</td><td className="p-3 font-mono">{known ? formatMoney(evidence.drawdown, currency) : '—'}</td></tr>;
};
