import { DirectionFilter, BOTH_SIDES, journalSide, type TradeSide } from './DirectionFilter';
import { PlaybookSetupDialog } from './PlaybookSetupDialog';
import { PlaybookExecutionWorkspace } from './PlaybookExecutionWorkspace';
import { JournalHelp } from './JournalHelp';
import { useMoney, formatMoney } from './JournalCurrency';
import { netOf, eligible, resultOf, realizedR, timestampMs, metrics } from './journalMath';
import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { JournalChecklistItem, JournalEntry, PortfolioAssetClass } from '../../types';
import { JournalPlaybook, PlaybookGrade, PlaybookScenario, PlaybookStatus, ReviewDecision, ScenarioStatus, PLAYBOOK_STATUS_LABELS } from '../../data/journalPlaybooks';
import { PlaybookInstruments } from './PlaybookInstruments';
import { PlaybookEditorFields } from './PlaybookEditorFields';
import { filterPlaybookInventory } from './playbookInventory';
import { instrumentMarket } from './instrumentMatching';
import { PlaybookAnalytics } from './PlaybookAnalytics';
import { PlaybookBacktestPanel } from '../backtest/PlaybookBacktestPanel';
import type { PlaybookExpectedStats } from '../../backtest/store';

import { JournalReplayAvailability } from './JournalReplayAvailability';
import { JOURNAL_TODAY } from '../../data/journalData';
import { TradingStatusBadge, tradingStatusOf } from './tradingStatus';
import { buildPlaybookRecommendations } from './playbookRecommendations';
import { StrategyRecommendationDialog } from './StrategyRecommendationDialog';
import { playbookConditions, validatePlaybookConditions } from '../../backtest/playbookConditions';
import { describeCondition } from '../../backtest/rules';
import type { GlobalTradingRules } from './JournalMonitors';
import { createPlaybookTradingRules, describeCustomTradingRule, isPlaybookTradingRules, resolvePlaybookTradingRules } from '../../data/tradingRules';

// Strategy playbooks (light theme, after the uploaded concept): library with market/status filters,
// search and sort; detail with thesis, a live pre-trade rules check, entry/stop/target, edge metrics
// and best executions; create, import template, edit, export.

const MARKETS: PortfolioAssetClass[] = ['Forex', 'Indices', 'Commodity', 'Crypto', 'Stocks'];
const GRADE_RANK: Record<PlaybookGrade, number> = { 'A+': 5, A: 4, 'B+': 3, B: 2, C: 1 };
const GRADE_STYLE: Record<PlaybookGrade, string> = {
  'A+': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'B+': 'bg-sky-50 text-sky-700 border-sky-200',
  B: 'bg-amber-50 text-amber-700 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
};
const STATUS_LABEL = PLAYBOOK_STATUS_LABELS;
type SortKey = 'pf' | 'net' | 'winRate' | 'trades' | 'grade';
type Step = 'setup' | 'rules' | 'scenarios' | 'checklist' | 'execution' | 'review';
const STEPS: [Step, string][] = [['setup', 'Setup'], ['rules', 'Rules'], ['scenarios', 'Scenarios'], ['checklist', 'Checklist'], ['execution', 'Execution'], ['review', 'Review']];
const SC_LABEL: Record<ScenarioStatus, string> = { watching: 'Watching', triggered: 'Triggered', invalidated: 'Invalidated', closed: 'Closed' };
const SC_STYLE: Record<ScenarioStatus, string> = { watching: 'bg-sky-50 text-sky-700', triggered: 'bg-emerald-50 text-emerald-700', invalidated: 'bg-rose-50 text-rose-700', closed: 'bg-slate-100 text-slate-600' };
const plannedRR = (sc: Pick<PlaybookScenario, 'entry' | 'stop' | 'target'>) =>
  sc.entry !== undefined && sc.stop !== undefined && sc.target !== undefined && sc.entry !== sc.stop ? Math.abs(sc.target - sc.entry) / Math.abs(sc.entry - sc.stop) : null;
const openScenarios = (p: JournalPlaybook) => (p.scenarios || []).filter((x) => x.status === 'watching' || x.status === 'triggered');
const DECISION_LABEL: Record<ReviewDecision, string> = { keep: 'Keep', adjust: 'Adjust', pause: 'Pause', retire: 'Retire' };
const DECISION_STYLE: Record<ReviewDecision, string> = { keep: 'bg-emerald-50 text-emerald-700', adjust: 'bg-sky-50 text-sky-700', pause: 'bg-amber-50 text-amber-700', retire: 'bg-slate-100 text-slate-600' };

const pad = (n: number) => String(n).padStart(2, '0');
const money = (n: number, dp = 0) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const tone = (n: number) => (n > 0 ? 'text-emerald-600' : n < 0 ? 'text-rose-600' : 'text-slate-500');
const fmtPf = (n:number|null) => n==null?'—':n===Infinity?'∞':n.toFixed(2);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

interface PbStats { n: number; wins: number; losses: number; winRate: number; pf: number | null; payoff: number | null; net: number; totalR: number; avgR: number | null; expectancy: number; followed: number; avgHold: number | null; last: string | null }

const statsFor = (list: JournalEntry[]): PbStats => {
  list = list.filter(e => eligible(e));
  const nets = list.map(netOf);
  const wins = list.filter((e) => resultOf(e) === 'win').length;
  const losses = list.filter((e) => resultOf(e) === 'loss').length;
  const gW = nets.filter((x) => x > 0).reduce((a, b) => a + b, 0);
  const gL = Math.abs(nets.filter((x) => x < 0).reduce((a, b) => a + b, 0));
  const nW = nets.filter((x) => x > 0).length, nL = nets.filter((x) => x < 0).length;
  const rs = list.map((e) => realizedR(e)).filter((x): x is number => x !== null);
  const holds = list.filter((e) => e.entryTime && e.exitTime).map((e) => (timestampMs(e.exitTime) - timestampMs(e.entryTime)) / 60000);
  const net = nets.reduce((a, b) => a + b, 0);
  return {
    n: list.length, wins, losses,
    winRate: list.length ? Math.round((wins / list.length) * 1000) / 10 : 0,
    pf: gL > 0 ? gW / gL : gW>0?Infinity:null,
    payoff: nW && nL ? (gW / nW) / (gL / nL) : null,
    net, totalR: rs.reduce((a, b) => a + b, 0), avgR: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : null,
    expectancy: list.length ? net / list.length : 0,
    followed: list.filter((e) => e.followedPlan).length,
    avgHold: holds.length ? holds.reduce((a, b) => a + b, 0) / holds.length : null,
    last: list.length ? list.map((e) => e.date).sort().slice(-1)[0] : null,
  };
};

// Grade guide: a playbook earns the highest grade whose every line it meets.
const GRADE_RULES: { g: PlaybookGrade; pf: number; r: number; plan: number; n: number; text: string }[] = [
  { g: 'A+', pf: 2.5, r: 0.5, plan: 85, n: 30, text: 'PF ≥ 2.5 · avg ≥ +0.5R · plan ≥ 85% · 30+ trades' },
  { g: 'A', pf: 2.0, r: 0.3, plan: 80, n: 20, text: 'PF ≥ 2.0 · avg ≥ +0.3R · plan ≥ 80% · 20+ trades' },
  { g: 'B+', pf: 1.5, r: 0.2, plan: 0, n: 15, text: 'PF ≥ 1.5 · avg ≥ +0.2R · 15+ trades' },
  { g: 'B', pf: 1.2, r: 0.0001, plan: 0, n: 10, text: 'PF ≥ 1.2 · avg R above 0 · 10+ trades' },
];
const suggestGrade = (s: PbStats): { grade: PlaybookGrade; next: string | null } => {
  const pf = s.pf ?? 0;
  const r = s.avgR ?? 0;
  const plan = s.n ? (s.followed / s.n) * 100 : 0;
  const ok = (x: (typeof GRADE_RULES)[number]) => pf >= x.pf && r >= x.r && plan >= x.plan && s.n >= x.n;
  const idx = GRADE_RULES.findIndex(ok);
  const grade: PlaybookGrade = idx === -1 ? 'C' : GRADE_RULES[idx].g;
  const up = idx === -1 ? GRADE_RULES[GRADE_RULES.length - 1] : idx > 0 ? GRADE_RULES[idx - 1] : null;
  if (!up) return { grade, next: null };
  const gaps: string[] = [];
  if (s.n < up.n) gaps.push(`${up.n - s.n} more trade${up.n - s.n === 1 ? '' : 's'}`);
  if (pf < up.pf) gaps.push(`PF ${up.pf}+`);
  if (r < up.r) gaps.push(up.r < 0.001 ? 'positive avg R' : `avg +${up.r}R`);
  if (plan < up.plan) gaps.push(`plan followed ${up.plan}%+`);
  return { grade, next: `For ${up.g}: ${gaps.join(', ')}` };
};

const inWindow = (pb: JournalPlaybook) => {
  if (!pb.window) return false;
  const h = new Date().getUTCHours() + new Date().getUTCMinutes() / 60;
  return h >= pb.window.start && h < pb.window.end;
};
const windowText = (pb: JournalPlaybook) => (pb.window ? `${pb.window.label} (${pad(pb.window.start)}:00–${pad(pb.window.end)}:00 UTC)` : 'Any time');

interface Props {
  entries: JournalEntry[];
  allJournalEntries?: JournalEntry[];
  comparisonEntries?: JournalEntry[];
  playbooks: JournalPlaybook[];
  setPlaybooks: (fn: (prev: JournalPlaybook[]) => JournalPlaybook[]) => void;
  onOpenEntry: (id: string) => void;
  onShowTrades: (ids: string[], label: string) => void;
  onToast: (msg: string) => void;
  houseRules: React.ReactNode;
  globalRules: GlobalTradingRules;
  houseChecklist: JournalChecklistItem[];
  recordings: Record<string, string>;
  onSetRecording: (entryId: string, blob: Blob | null) => void;
  /** Saved backtest expectations by playbook id. */
  expected?: Record<string, PlaybookExpectedStats>;
  onBacktest?: (playbookId: string, symbol?: string) => void;
  onWhatIf?: (playbookId: string) => void;
}

const blank = (): JournalPlaybook => ({
  id: '', name: '', grade: 'B', style: '', status: 'draft', markets: ['Forex'], window: null, benchmarkRR: 2,
  thesis: '', rules: [{ id: 'r1', title: '', detail: '' }], entryTrigger: '', stopRule: '', targetRule: '', tags: [], createdAt: JOURNAL_TODAY,
});

export const JournalPlaybooks: React.FC<Props> = ({ entries, allJournalEntries = entries, comparisonEntries = entries, playbooks, setPlaybooks, onOpenEntry, onShowTrades, onToast, houseRules, globalRules, houseChecklist, recordings, onSetRecording, expected = {}, onBacktest, onWhatIf }) => {
  const money = useMoney();

  const [market, setMarket] = useState<'all' | PortfolioAssetClass>('all');
  const [status, setStatus] = useState<'all' | PlaybookStatus>('active');
  const [sort, setSort] = useState<SortKey>('pf');
  const [query, setQuery] = useState('');
  const [selId, setSelId] = useState<string>(playbooks[0]?.id || '');
  const [editing, setEditing] = useState<JournalPlaybook | null>(null);

  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replayId, setReplayId] = useState<string | null>(null);

  const [sideOverrides, setSideOverrides] = useState<Record<string, {signature:string; value:TradeSide[]}>>({});
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [gradeTip, setGradeTip] = useState<{ id: string; x: number; y: number } | null>(null);
  const recommendations = useMemo(
    () => buildPlaybookRecommendations(allJournalEntries, playbooks, JOURNAL_TODAY),
    [allJournalEntries, playbooks],
  );
  const stats = useMemo(() => {
    const m = new Map<string, PbStats>();
    playbooks.forEach((p) => m.set(p.id, statsFor(entries.filter((e) => e.strategy === p.name))));
    return m;
  }, [entries, playbooks]);

  const inStatus = playbooks.filter((p) => status === 'all' || p.status === status);
  const matchingInventory = filterPlaybookInventory(playbooks, market, query);
  const list = filterPlaybookInventory(matchingInventory, 'all', '', status)
    .sort((a, b) => {
      const sa = stats.get(a.id)!, sb = stats.get(b.id)!;
      switch (sort) {
        case 'net': return sb.net - sa.net;
        case 'winRate': return sb.winRate - sa.winRate;
        case 'trades': return sb.n - sa.n;
        case 'grade': return GRADE_RANK[b.grade] - GRADE_RANK[a.grade];
        default: return (sb.pf ?? (sb.n ? 99 : -1)) - (sa.pf ?? (sa.n ? 99 : -1));
      }
    });
  const sel = playbooks.find((p) => p.id === selId) && list.some((p) => p.id === selId) ? playbooks.find((p) => p.id === selId)! : list[0];
  const savedSides = sel?.directions ?? BOTH_SIDES;
  const signature = JSON.stringify(savedSides);
  const sides = sel && sideOverrides[sel.id]?.signature === signature ? sideOverrides[sel.id].value : savedSides;
  const setSides = (value:TradeSide[]) => { if(sel) setSideOverrides(prev=>({...prev,[sel.id]:{signature,value}})); };
  const sideEntries = entries.filter(entry=>sides.includes(journalSide(entry.direction)));

  const s = sel ? stats.get(sel.id)! : null;
  const selTrades = sel ? entries.filter((e) => e.strategy === sel.name) : [];
  const nextId = () => `PB-${pad(Math.max(0, ...playbooks.map((p) => Number(p.id.replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')}`;

  const startNew = () => {
    setRecommendationOpen(true);
    setConfirmDelete(false);
  };
  const startEdit = () => { if (sel) { setEditing(JSON.parse(JSON.stringify(sel))); setConfirmDelete(false); } };
  const persistPlaybook = (draft: JournalPlaybook, newPlaybook: boolean, statusOverride?: PlaybookStatus): string | null => {
    const name = draft.name.trim();
    if (!name) return 'Give the playbook a name';
    if (playbooks.some((p) => p.id !== draft.id && p.name.trim().toLowerCase() === name.toLowerCase())) return 'A playbook with that name already exists';
    if (draft.directions && !draft.directions.length) { onToast('Select Long or Short for this playbook.'); return; }
    if (draft.technicalEntryConditions) {
      const error = validatePlaybookConditions(draft.technicalEntryConditions);
      if (error) return error;
    }
    const outsideMarket = (draft.symbols || []).find(symbol => {
      const market = instrumentMarket(symbol, draft);
      return market && !draft.markets.includes(market);
    });
    if (outsideMarket) return `${outsideMarket} is outside the selected market types. Edit instruments or update Markets before saving.`;
    const tradingRules = draft.tradingRules ?? createPlaybookTradingRules(globalRules, draft);
    if (!isPlaybookTradingRules(tradingRules)) return 'Review the playbook trading rules and correct any invalid values.';
    const clean: JournalPlaybook = {
      ...draft,
      name,
      status: statusOverride ?? draft.status,
      tradingRules,
      riskPerTrade: tradingRules.enabled.maxRisk ? tradingRules.values.maxRisk : undefined,
      maxTradesPerDay: tradingRules.enabled.maxTrades ? tradingRules.values.maxTrades : undefined,
      avoid: (draft.avoid || []).map((a) => a.trim()).filter(Boolean),
      rules: draft.rules.filter((r) => r.title.trim()).map((r, i) => ({ ...r, id: `r${i + 1}` })),
    };
    if (newPlaybook) {
      clean.id = nextId();
      setPlaybooks((prev) => [...prev, clean]);
      setStatus('all'); setMarket('all'); setQuery('');
    } else setPlaybooks((prev) => prev.map((p) => (p.id === clean.id ? clean : p)));
    setStatus(clean.status); setMarket('all'); setQuery(''); setSelId(clean.id); setEditing(null);
    onToast(statusOverride === 'archived' ? `Archived "${name}"` : newPlaybook ? `Created "${name}"` : `Saved "${name}"`);
    return null;
  };
  const chip = (on: boolean) => `h-8 px-3 rounded-lg text-xs font-semibold border ${on ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556] hover:bg-slate-50'}`;
  const btn = 'h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0b1c30]';
  const showTip = (id: string) => (e: React.MouseEvent | React.FocusEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setGradeTip({ id, x: Math.max(8,Math.min(r.left, window.innerWidth - 330)), y: Math.max(8,Math.min(r.bottom + 6, window.innerHeight - 470)) });
  };
  const gradeBadge = (p: JournalPlaybook, size: 'sm' | 'md', label?: string) => (
    <span
      tabIndex={0}
      aria-label={`Grade ${p.grade}. Hover or focus for the grading criteria.`}
      onMouseEnter={showTip(p.id)} onMouseLeave={() => setGradeTip(null)} onFocus={showTip(p.id)} onBlur={() => setGradeTip(null)}
      className={`${size === 'sm' ? 'px-1 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} rounded border font-bold cursor-help ${GRADE_STYLE[p.grade]}`}
    >{label ?? p.grade}</span>
  );
  const tipPb = gradeTip ? playbooks.find((p) => p.id === gradeTip.id) : undefined;
  const tipStats = tipPb ? stats.get(tipPb.id) : undefined;
  const tip = tipPb && tipStats && gradeTip && (() => {
    const sg = suggestGrade(tipStats);
    const plan = tipStats.n ? Math.round((tipStats.followed / tipStats.n) * 100) : 0;
    return (
      <div role="tooltip" className="fixed z-50 w-[320px] max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] overflow-y-auto rounded-xl bg-[#0b1c30] text-white shadow-2xl p-3 text-[11px] pointer-events-none" style={{ left: gradeTip.x, top: gradeTip.y }}>
        <p className="font-bold text-xs">Grade {tipPb.grade} <span className="font-normal text-slate-300">· set by you in Edit playbook</span></p>
        <p className="text-slate-300 mt-1">Grades rank how proven a setup is. A playbook earns the highest grade whose every line it meets:</p>
        <ul className="mt-1.5 space-y-0.5 font-mono">
          {GRADE_RULES.map((x) => (
            <li key={x.g} className={`flex gap-2 ${x.g === sg.grade ? 'text-emerald-300 font-bold' : ''}`}><span className="w-5 shrink-0">{x.g}</span><span>{x.text}</span></li>
          ))}
          <li className={`flex gap-2 ${sg.grade === 'C' ? 'text-emerald-300 font-bold' : ''}`}><span className="w-5 shrink-0">C</span><span>below B, or under 10 trades</span></li>
        </ul>
        <dl className="mt-2 pt-2 border-t border-white/15 space-y-1">
          <div><dt className="inline font-bold">PF (profit factor)<JournalHelp label="PF (profit factor)" /></dt><dd className="inline text-slate-300">: positive net results ÷ absolute negative net results. Costs are deducted.</dd></div>
          <div><dt className="inline font-bold">Avg R<JournalHelp label="Avg R" /></dt><dd className="inline text-slate-300">: average result in units of planned risk. +0.3R = $30 per trade when risking $100. Works for any account size.</dd></div>
          <div><dt className="inline font-bold">Plan followed<JournalHelp label="Plan followed" /></dt><dd className="inline text-slate-300">: recorded positives out of eligible trades. Unknown answers cannot earn a positive grade; this is descriptive evidence, not proof of causation.</dd></div>
          <div><dt className="inline font-bold">Trades<JournalHelp label="Trades" /></dt><dd className="inline text-slate-300">: sample size. Under 10–20 trades the numbers are mostly noise.</dd></div>
        </dl>
        <div className="mt-2 pt-2 border-t border-white/15">
          <p className="text-slate-300">This playbook: PF {fmtPf(tipStats.pf)} · avg {tipStats.avgR === null ? '—' : `${tipStats.avgR >= 0 ? '+' : ''}${tipStats.avgR.toFixed(2)}R`} · recorded on plan {plan}% · {tipStats.n} trades</p>
          <p className="mt-0.5 font-bold">Data suggests: {sg.grade}{sg.grade !== tipPb.grade ? ` (you set ${tipPb.grade})` : ' (matches)'}</p>
          {sg.next && <p className="text-slate-300">{sg.next}</p>}
        </div>
      </div>
    );
  })();

  // ── scenarios (trade hypotheses) ──
  const form = editing && <PlaybookSetupDialog mode="edit" draft={editing} entries={allJournalEntries} globalRules={globalRules} houseChecklist={houseChecklist} lockName={allJournalEntries.some(e => e.strategy === editing.name)} onChange={update => setEditing(current => current ? typeof update === 'function' ? update(current) : update : current)} onBack={() => setEditing(null)} onCreate={(draft, status) => persistPlaybook(draft, false, status)} />;

  const statusCount = (st: 'all' | PlaybookStatus) => matchingInventory.filter(p => st === 'all' || p.status === st).length;
  const marketCount = (m: 'all' | PortfolioAssetClass) => inStatus.filter((p) => m === 'all' || p.markets.includes(m)).length;

  return (
    <div className="space-y-5">
      {tip}
      {recommendationOpen && <StrategyRecommendationDialog
        recommendations={recommendations}
        blankDraft={{ ...blank(), markets: [], symbols: [] }}
        entries={allJournalEntries}
        globalRules={globalRules}
        houseChecklist={houseChecklist}
        existingNames={playbooks.map(playbook => playbook.name)}
        createdAt={JOURNAL_TODAY}
        onClose={() => setRecommendationOpen(false)}
        onCreate={(draft, statusOverride) => {
          const error = persistPlaybook(draft, true, statusOverride);
          if (!error) setRecommendationOpen(false);
          return error;
        }}
      />}
      {replayId&&(()=>{const trade=allJournalEntries.find(e=>e.id===replayId)??entries.find(e=>e.id===replayId);return trade?<JournalReplayAvailability entry={trade} entries={allJournalEntries} playbooks={playbooks} returnLabel="Return to playbook" recording={recordings[trade.id]} onAttachRecording={blob=>onSetRecording(trade.id,blob)} onRemoveRecording={()=>onSetRecording(trade.id,null)} onClose={()=>setReplayId(null)}/>:null;})()}
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#5338ec]">Strategy playbooks</p>
          <h2 className="text-2xl font-bold text-[#0b1c30]">Your setups, rules and edge<JournalHelp label="Your setups, rules and edge" /></h2>
          <p className="text-sm text-[#474556]">Each playbook's stats come from the journal entries tagged with it.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter setups, symbols, scenarios..." aria-label="Filter playbooks" className="h-9 w-60 border border-slate-200 rounded-lg px-3 text-xs bg-white" />
          <button type="button" onClick={startNew} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#5338ec] px-4 text-xs font-semibold text-white hover:bg-[#4326d8]"><Sparkles className="h-3.5 w-3.5" /> Create new playbook</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-2xl p-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Market">
          {(['all', ...MARKETS] as const).map((m) => (
            <button key={m} type="button" aria-pressed={market === m} onClick={() => setMarket(m)} className={chip(market === m)}>{m === 'all' ? 'All' : m} ({marketCount(m)})</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="ml-auto flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase text-slate-500">Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-8 border border-slate-200 rounded-lg px-2 text-xs font-semibold normal-case tracking-normal text-[#0b1c30] bg-white">
              <option value="pf">Profit factor</option><option value="net">Net P&amp;L</option><option value="winRate">Win rate</option><option value="trades">Trades</option><option value="grade">Grade</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
        {/* Inventory (compact) */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl lg:sticky lg:top-24">
          <div className="border-b border-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-xs font-bold text-slate-700">Playbooks <span className="ml-1 font-normal text-slate-400">{list.length}</span></h3><JournalHelp label="Playbook status filters" text="Filter the library by Active, Draft, Testing or Archived. Drafts are unfinished setups; Testing is for setups under evaluation. Counts follow the selected market and search. Saving a changed status opens its matching filter." /></div>
            <div role="group" aria-label="Playbook status" className="flex flex-wrap gap-1.5">{(['all','active','draft','testing','archived'] as const).map(st => <button key={st} type="button" aria-pressed={status === st} onClick={() => setStatus(st)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${status === st ? 'border-[#CFC5FF] bg-[#F1EDFF] text-[#5338ec]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{st === 'all' ? 'All' : STATUS_LABEL[st]} <span className="ml-1 opacity-60">{statusCount(st)}</span></button>)}</div>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
            {list.map((p) => {
              const st = stats.get(p.id)!;
              const on = sel?.id === p.id;
              const live = p.status === 'active' && inWindow(p);
              const open = openScenarios(p);
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => { setSelId(p.id); setEditing(null); }} aria-pressed={on}
                    className={`w-full text-left px-3 py-2.5 border-l-[3px] ${on ? 'border-[#5338ec] bg-[#F8F7FF]' : 'border-transparent hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-1.5">
                      {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="In session now" />}
                      <span className="text-sm font-bold text-[#0b1c30] truncate">{p.name}</span>
                      {gradeBadge(p, 'sm')}
                      {p.status !== 'active' && <span className="text-[9px] font-bold text-amber-600 uppercase">{STATUS_LABEL[p.status]}</span>}
                      <span className={`ml-auto text-xs font-bold font-mono shrink-0 ${tone(st.net)}`}>{st.n ? money(st.net) : '—'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                      <span className="truncate">{(p.symbols || []).slice(0, 3).join(' · ') || p.markets.join(' · ')}{(p.symbols || []).length > 3 ? ` +${(p.symbols || []).length - 3}` : ''}</span>
                      <span className="ml-auto font-mono shrink-0">{st.n ? `${st.winRate.toFixed(0)}% · PF ${fmtPf(st.pf)}` : 'no trades'}</span>
                    </span>
                  </button>

                </li>
              );
            })}
            {list.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-500">{status === 'draft' ? 'No drafts match this view.' : 'No playbooks match.'}{status === 'draft' && <button type="button" onClick={startNew} className="mx-auto mt-3 block rounded-lg bg-[#5338ec] px-3 py-2 font-semibold text-white">Create draft</button>}</li>}
          </ul>
        </div>

        {/* Detail / editor */}
        <div className="min-w-0">
          {form}
          {sel && s ? (
            <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-5" aria-label={`${sel.name} playbook`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {gradeBadge(sel, 'md', `${sel.grade} · ${sel.style || 'Setup'}`)}
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">{sel.markets.join(' / ')}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500">ID: #{sel.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EEF0FE] text-[10px] font-bold text-[#5338ec]">{STATUS_LABEL[sel.status]}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0b1c30]">{sel.name}<JournalHelp label="Playbook" /></h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-xs text-[#474556]">
                    <span>Session: <b className="text-[#0b1c30]">{windowText(sel)}</b></span>
                    <span>Min reward:risk: <b className="text-[#0b1c30]">1:{sel.benchmarkRR}</b></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">

                  {onBacktest && <button type="button" onClick={() => onBacktest(sel.id)} className="h-9 rounded-lg bg-[#5338ec] px-4 text-xs font-semibold text-white hover:bg-[#4326d8]" title="Test these rules on past prices">Backtest this playbook</button>}

                  <button type="button" onClick={startEdit} className={btn}>Edit playbook</button>
                </div>
              </div>

              <div className="rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-[#0b1c30]">Analytics<JournalHelp label="Analytics" /> <span className="font-normal text-[11px] text-slate-500">· win rate, profit factor, avg W/L, target and scenarios</span></h4>
                  <button type="button" aria-expanded={showAnalytics} onClick={() => setShowAnalytics(v => !v)} className="text-xs font-semibold text-[#5338ec] hover:underline">{showAnalytics ? 'Hide' : 'Show'}</button>
                </div>
                <DirectionFilter label="Trade direction" value={sides} onChange={setSides} />
                <p className="mb-3 text-[11px] text-slate-500">Applies to analytics, comparison, charts and executions.</p>
                {showAnalytics && <PlaybookAnalytics playbook={sel} playbooks={playbooks} entries={sideEntries} onShowTrades={onShowTrades} />}
              </div>

              <PlaybookExecutionWorkspace directions={sides} key={sel.id} playbook={sel} entries={entries} allEntries={allJournalEntries} comparisonEntries={comparisonEntries} globalRules={globalRules} onOpenEntry={onOpenEntry} onShowTrades={onShowTrades} onReplay={setReplayId} onTest={onBacktest ? symbol => onBacktest(sel.id, symbol) : undefined} />
            </section>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">Select a playbook, or create one.</div>
          )}
        </div>
      </div>

      {/* House rules (global checklist + risk limits) */}
      <div>
        <h3 className="text-sm font-bold text-[#0b1c30] mb-1">House rules<JournalHelp label="House rules" /></h3>
        <p className="text-xs text-[#474556] mb-3">Apply to every playbook: the pre-trade checklist in each new entry. Trading limits are customized in each playbook.</p>
        {houseRules}
      </div>
    </div>
  );
};
