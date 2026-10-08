import React, { useMemo, useState } from 'react';
import { JournalChecklistItem, JournalEntry, PortfolioAssetClass } from '../../types';
import { JournalPlaybook, PlaybookGrade, PlaybookScenario, PlaybookStatus, PLAYBOOK_TEMPLATES, ReviewDecision, ScenarioStatus } from '../../data/journalPlaybooks';
import { guessAssetClass } from './journalIngest';
import { PlaybookAnalytics } from './PlaybookAnalytics';
import { PlaybookBacktestPanel } from '../backtest/PlaybookBacktestPanel';
import type { PlaybookExpectedStats } from '../../backtest/store';
import { TradeReplayModal } from './TradeReplayModal';
import { JOURNAL_TODAY } from '../../data/journalData';

// Strategy playbooks (light theme, after the uploaded concept): library with market/status filters,
// search and sort; detail with thesis, a live pre-trade rules check, entry/stop/target, edge metrics
// and best executions; create, import template, edit, export.

const MARKETS: PortfolioAssetClass[] = ['Forex', 'Indices', 'Commodity', 'Crypto', 'Stocks'];
const GRADES: PlaybookGrade[] = ['A+', 'A', 'B+', 'B', 'C'];
const GRADE_RANK: Record<PlaybookGrade, number> = { 'A+': 5, A: 4, 'B+': 3, B: 2, C: 1 };
const GRADE_STYLE: Record<PlaybookGrade, string> = {
  'A+': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'B+': 'bg-sky-50 text-sky-700 border-sky-200',
  B: 'bg-amber-50 text-amber-700 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
};
const STATUS_LABEL: Record<PlaybookStatus, string> = { active: 'Active', testing: 'Testing', archived: 'Archived' };
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
const netOf = (e: JournalEntry) => e.pnl - (e.commission ?? 0);
const money = (n: number, dp = 0) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const tone = (n: number) => (n > 0 ? 'text-emerald-600' : n < 0 ? 'text-rose-600' : 'text-slate-500');
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

interface PbStats { n: number; wins: number; losses: number; winRate: number; pf: number | null; payoff: number | null; net: number; totalR: number; avgR: number | null; expectancy: number; followed: number; avgHold: number | null; last: string | null }

const statsFor = (list: JournalEntry[]): PbStats => {
  const nets = list.map(netOf);
  const wins = list.filter((e) => e.outcome === 'win').length;
  const losses = list.filter((e) => e.outcome === 'loss').length;
  const gW = nets.filter((x) => x > 0).reduce((a, b) => a + b, 0);
  const gL = Math.abs(nets.filter((x) => x < 0).reduce((a, b) => a + b, 0));
  const nW = nets.filter((x) => x > 0).length, nL = nets.filter((x) => x < 0).length;
  const rs = list.map((e) => e.rMultiple).filter((x): x is number => x !== null);
  const holds = list.filter((e) => e.entryTime && e.exitTime).map((e) => (Date.parse(`${e.exitTime}Z`) - Date.parse(`${e.entryTime}Z`)) / 60000);
  const net = nets.reduce((a, b) => a + b, 0);
  return {
    n: list.length, wins, losses,
    winRate: wins + losses ? Math.round((wins / (wins + losses)) * 1000) / 10 : 0,
    pf: gL > 0 ? gW / gL : null,
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
  const pf = s.pf ?? (s.n ? 99 : 0);
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
  playbooks: JournalPlaybook[];
  setPlaybooks: (fn: (prev: JournalPlaybook[]) => JournalPlaybook[]) => void;
  onOpenEntry: (id: string) => void;
  onShowTrades: (ids: string[], label: string) => void;
  onToast: (msg: string) => void;
  houseRules: React.ReactNode;
  houseChecklist: JournalChecklistItem[];
  recordings: Record<string, string>;
  onSetRecording: (entryId: string, blob: Blob | null) => void;
  onLogTrade: (prefill: {
    strategy: string; checklist: string[]; symbol?: string; assetClass?: PortfolioAssetClass; direction?: 'BUY' | 'SELL';
    entryPrice?: number; stopPrice?: number; takeProfit?: number; notes?: string; scenarioId?: string;
  }) => void;
  /** Saved backtest expectations by playbook id. */
  expected?: Record<string, PlaybookExpectedStats>;
  onBacktest?: (playbookId: string) => void;
}

const blank = (): JournalPlaybook => ({
  id: '', name: '', grade: 'B', style: '', status: 'testing', markets: ['Forex'], window: null, benchmarkRR: 2,
  thesis: '', rules: [{ id: 'r1', title: '', detail: '' }], entryTrigger: '', stopRule: '', targetRule: '', tags: [], createdAt: JOURNAL_TODAY,
});

export const JournalPlaybooks: React.FC<Props> = ({ entries, playbooks, setPlaybooks, onOpenEntry, onShowTrades, onToast, houseRules, houseChecklist, onLogTrade, recordings, onSetRecording, expected = {}, onBacktest }) => {
  const [market, setMarket] = useState<'all' | PortfolioAssetClass>('all');
  const [status, setStatus] = useState<'all' | PlaybookStatus>('active');
  const [sort, setSort] = useState<SortKey>('pf');
  const [query, setQuery] = useState('');
  const [selId, setSelId] = useState<string>(playbooks[0]?.id || '');
  const [checks, setChecks] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<JournalPlaybook | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [step, setStep] = useState<Step>('setup');
  const [replayId, setReplayId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [gradeTip, setGradeTip] = useState<{ id: string; x: number; y: number } | null>(null);
  const [houseChecks, setHouseChecks] = useState<Record<string, string[]>>({});
  const [reviewNote, setReviewNote] = useState('');
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>('keep');
  const [scFilter, setScFilter] = useState<'open' | 'all'>('open');
  const [scDraft, setScDraft] = useState<PlaybookScenario | null>(null);
  const [activeSc, setActiveSc] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const m = new Map<string, PbStats>();
    playbooks.forEach((p) => m.set(p.id, statsFor(entries.filter((e) => e.strategy === p.name))));
    return m;
  }, [entries, playbooks]);

  const inStatus = playbooks.filter((p) => status === 'all' || p.status === status);
  const list = inStatus
    .filter((p) => market === 'all' || p.markets.includes(market))
    .filter((p) => { const q = query.trim().toLowerCase(); return !q || [p.name, p.style, p.thesis, ...p.tags, ...p.rules.map((r) => r.title), ...(p.symbols || []), ...(p.scenarios || []).map((x) => `${x.symbol} ${x.hypothesis}`)].some((s) => s.toLowerCase().includes(q)); })
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
  const s = sel ? stats.get(sel.id)! : null;
  const selTrades = sel ? entries.filter((e) => e.strategy === sel.name) : [];

  const nextId = () => `PB-${pad(Math.max(0, ...playbooks.map((p) => Number(p.id.replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')}`;

  const startNew = () => { setEditing(blank()); setIsNew(true); setConfirmDelete(false); };
  const startEdit = () => { if (sel) { setEditing(JSON.parse(JSON.stringify(sel))); setIsNew(false); setConfirmDelete(false); } };
  const importTpl = (i: number) => {
    const t = PLAYBOOK_TEMPLATES[i];
    let name = t.name; let k = 2;
    while (playbooks.some((p) => p.name.toLowerCase() === name.toLowerCase())) name = `${t.name} (${k++})`;
    const pb: JournalPlaybook = { ...JSON.parse(JSON.stringify(t)), name, id: nextId(), createdAt: JOURNAL_TODAY };
    setPlaybooks((prev) => [...prev, pb]);
    setStatus('all'); setMarket('all'); setQuery(''); setSelId(pb.id); setTplOpen(false);
    onToast(`Imported "${name}" as a testing playbook`);
  };
  const save = () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) { onToast('Give the playbook a name'); return; }
    if (playbooks.some((p) => p.id !== editing.id && p.name.toLowerCase() === name.toLowerCase())) { onToast('A playbook with that name already exists'); return; }
    const clean: JournalPlaybook = { ...editing, name, avoid: (editing.avoid || []).map((a) => a.trim()).filter(Boolean), rules: editing.rules.filter((r) => r.title.trim()).map((r, i) => ({ ...r, id: `r${i + 1}` })) };
    if (isNew) {
      clean.id = nextId();
      setPlaybooks((prev) => [...prev, clean]);
      setStatus('all'); setMarket('all'); setQuery('');
    } else setPlaybooks((prev) => prev.map((p) => (p.id === clean.id ? clean : p)));
    setSelId(clean.id); setEditing(null);
    onToast(isNew ? `Created "${name}"` : `Saved "${name}"`);
  };
  const remove = () => {
    if (!sel) return;
    setPlaybooks((prev) => prev.filter((p) => p.id !== sel.id));
    setEditing(null); setConfirmDelete(false);
    onToast(`Deleted "${sel.name}"`);
  };
  const exportMd = () => {
    if (!sel || !s) return;
    const md = [
      `# ${sel.name} (${sel.id})`, '',
      `Grade: ${sel.grade} · Style: ${sel.style} · Status: ${STATUS_LABEL[sel.status]}`,
      `Markets: ${sel.markets.join(', ')} · Window: ${windowText(sel)} · Benchmark R:R 1:${sel.benchmarkRR}`, '',
      `Instruments: ${(sel.symbols || []).join(', ') || '—'}`, '',
      '## Thesis', sel.thesis, '',
      '## Execution rules', ...sel.rules.map((r, i) => `${i + 1}. **${r.title}**: ${r.detail}`), '',
      '## Risk limits', `Risk per trade: ${sel.riskPerTrade !== undefined ? `${sel.riskPerTrade}%` : 'house limit'} · Max trades per day: ${sel.maxTradesPerDay ?? 'house limit'}`, '',
      '## Do not trade when', ...(sel.avoid || []).map((a) => `- ${a}`), '',
      '## Entry trigger', sel.entryTrigger, '', '## Stop / invalidation', sel.stopRule, '', '## Profit taking', sel.targetRule, '',
      '## Journal stats', `Trades: ${s.n} · Win rate: ${s.winRate}% · Profit factor: ${s.pf === null ? '—' : s.pf.toFixed(2)} · Net: ${money(s.net, 2)} · Total R: ${s.totalR.toFixed(1)}R`,
      `Plan followed on ${s.followed} of ${s.n} trades.`, '',
      '## Scenarios', ...(sel.scenarios || []).map((x) => `- [${SC_LABEL[x.status]}] ${x.symbol} ${x.bias}: ${x.hypothesis} (entry ${x.entry ?? '—'}, stop ${x.stop ?? '—'}, target ${x.target ?? '—'}, valid until ${x.validUntil})`), '',
      '## Review log', ...(sel.reviews || []).map((rv) => `- ${rv.date} [${DECISION_LABEL[rv.decision]}] ${rv.note}`),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${sel.name.replace(/[^\w]+/g, '-').toLowerCase()}-playbook.md`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast('Playbook exported');
  };

  const chip = (on: boolean) => `h-8 px-3 rounded-lg text-xs font-semibold border ${on ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556] hover:bg-slate-50'}`;
  const btn = 'h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0b1c30]';
  const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';
  const lbl = 'text-[10px] font-bold tracking-wider uppercase text-slate-500';

  const checked = sel ? checks[sel.id] || [] : [];
  const met = sel ? sel.rules.filter((r) => checked.includes(r.id)).length : 0;
  const houseChecked = sel ? (houseChecks[sel.id] || []).filter((id) => houseChecklist.some((c) => c.id === id)) : [];
  const houseMet = houseChecked.length;
  const totalChecks = (sel ? sel.rules.length : 0) + houseChecklist.length;
  const metAll = met + houseMet;
  const allMet = totalChecks > 0 && metAll === totalChecks;
  // Checklist is guidance, not a gate: show how complete the setup is and let the trader decide.
  const pct = totalChecks ? Math.round((metAll / totalChecks) * 100) : 0;
  const quality = allMet ? { label: 'Full setup', cls: 'text-emerald-700', bar: 'bg-emerald-500' }
    : pct >= 70 ? { label: 'Strong setup', cls: 'text-emerald-700', bar: 'bg-emerald-400' }
    : pct >= 40 ? { label: 'Partial setup', cls: 'text-amber-700', bar: 'bg-amber-400' }
    : metAll > 0 ? { label: 'Light setup', cls: 'text-slate-600', bar: 'bg-slate-400' }
    : { label: 'Nothing ticked yet', cls: 'text-slate-500', bar: 'bg-slate-300' };
  // rules: days on which this playbook was traded more often than its daily limit
  const overDays = (() => {
    if (!sel || sel.maxTradesPerDay === undefined) return 0;
    const byDay = new Map<string, number>();
    selTrades.forEach((e) => byDay.set(e.date, (byDay.get(e.date) || 0) + 1));
    return Array.from(byDay.values()).filter((n) => n > sel.maxTradesPerDay!).length;
  })();
  const checklistPct = selTrades.length && houseChecklist.length
    ? Math.round((selTrades.reduce((a, e) => a + e.checklistDone.filter((id) => houseChecklist.some((c) => c.id === id)).length, 0) / (selTrades.length * houseChecklist.length)) * 100)
    : null;
  const ordered = [...selTrades].sort((a, b) => (a.entryTime || a.date).localeCompare(b.entryTime || b.date));
  const rCurve = (() => { let c = 0; return ordered.filter((e) => e.rMultiple !== null).map((e) => (c += e.rMultiple as number)); })();
  const split = (on: boolean) => { const l = selTrades.filter((e) => e.followedPlan === on); return { n: l.length, avg: l.length ? l.reduce((a, e) => a + netOf(e), 0) / l.length : 0 }; };
  const planSplit = { on: split(true), off: split(false) };
  const topMistakes = (() => { const m = new Map<string, number>(); selTrades.forEach((e) => e.mistakes.forEach((x) => m.set(x, (m.get(x) || 0) + 1))); return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4); })();
  const addReview = () => {
    if (!sel || !reviewNote.trim()) return;
    const statusFor: Partial<Record<ReviewDecision, PlaybookStatus>> = { keep: 'active', pause: 'testing', retire: 'archived' };
    const rv = { id: `rv${Date.now()}`, date: JOURNAL_TODAY, note: reviewNote.trim(), decision: reviewDecision };
    setPlaybooks((prev) => prev.map((p) => (p.id === sel.id ? { ...p, reviews: [...(p.reviews || []), rv], status: statusFor[reviewDecision] ?? p.status } : p)));
    setReviewNote('');
    if (statusFor[reviewDecision] && statusFor[reviewDecision] !== sel.status) setStatus('all');
    onToast(`Review saved${statusFor[reviewDecision] && statusFor[reviewDecision] !== sel.status ? `; status set to ${STATUS_LABEL[statusFor[reviewDecision]!]}` : ''}`);
  };

  const showTip = (id: string) => (e: React.MouseEvent | React.FocusEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setGradeTip({ id, x: Math.min(r.left, window.innerWidth - 330), y: Math.min(r.bottom + 6, window.innerHeight - 470) });
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
      <div role="tooltip" className="fixed z-50 w-[320px] rounded-xl bg-[#0b1c30] text-white shadow-2xl p-3 text-[11px] pointer-events-none" style={{ left: gradeTip.x, top: gradeTip.y }}>
        <p className="font-bold text-xs">Grade {tipPb.grade} <span className="font-normal text-slate-300">· set by you in Edit playbook</span></p>
        <p className="text-slate-300 mt-1">Grades rank how proven a setup is. A playbook earns the highest grade whose every line it meets:</p>
        <ul className="mt-1.5 space-y-0.5 font-mono">
          {GRADE_RULES.map((x) => (
            <li key={x.g} className={`flex gap-2 ${x.g === sg.grade ? 'text-emerald-300 font-bold' : ''}`}><span className="w-5 shrink-0">{x.g}</span><span>{x.text}</span></li>
          ))}
          <li className={`flex gap-2 ${sg.grade === 'C' ? 'text-emerald-300 font-bold' : ''}`}><span className="w-5 shrink-0">C</span><span>below B, or under 10 trades</span></li>
        </ul>
        <dl className="mt-2 pt-2 border-t border-white/15 space-y-1">
          <div><dt className="inline font-bold">PF (profit factor)</dt><dd className="inline text-slate-300">: gross profit ÷ gross loss. 1.0 = break-even, 2.0 = $2 won for every $1 lost.</dd></div>
          <div><dt className="inline font-bold">Avg R</dt><dd className="inline text-slate-300">: average result in units of planned risk. +0.3R = $30 per trade when risking $100. Works for any account size.</dd></div>
          <div><dt className="inline font-bold">Plan followed</dt><dd className="inline text-slate-300">: share of trades marked as following the playbook rules. Shows the results come from the setup, not from luck.</dd></div>
          <div><dt className="inline font-bold">Trades</dt><dd className="inline text-slate-300">: sample size. Under 10–20 trades the numbers are mostly noise.</dd></div>
        </dl>
        <div className="mt-2 pt-2 border-t border-white/15">
          <p className="text-slate-300">This playbook: PF {tipStats.pf === null ? (tipStats.n ? '∞' : '—') : tipStats.pf.toFixed(2)} · avg {tipStats.avgR === null ? '—' : `${tipStats.avgR >= 0 ? '+' : ''}${tipStats.avgR.toFixed(2)}R`} · plan {plan}% · {tipStats.n} trades</p>
          <p className="mt-0.5 font-bold">Data suggests: {sg.grade}{sg.grade !== tipPb.grade ? ` (you set ${tipPb.grade})` : ' (matches)'}</p>
          {sg.next && <p className="text-slate-300">{sg.next}</p>}
        </div>
      </div>
    );
  })();

  // ── scenarios (trade hypotheses) ──
  const startScenario = (p: JournalPlaybook) => {
    const until = new Date(Date.parse(`${JOURNAL_TODAY}T00:00:00Z`) + 3 * 86400000).toISOString().slice(0, 10);
    setScDraft({ id: '', symbol: (p.symbols || [])[0] || '', bias: 'long', hypothesis: '', trigger: '', validUntil: until, status: 'watching', createdAt: JOURNAL_TODAY });
  };
  const saveScenario = () => {
    if (!sel || !scDraft) return;
    if (!scDraft.symbol.trim() || !scDraft.hypothesis.trim()) { onToast('Add a symbol and your hypothesis'); return; }
    const sc = { ...scDraft, symbol: scDraft.symbol.trim().toUpperCase() };
    const isNewSc = !sc.id;
    if (isNewSc) sc.id = `sc${Date.now()}`;
    setPlaybooks((prev) => prev.map((p) => (p.id === sel.id ? {
      ...p,
      scenarios: isNewSc ? [...(p.scenarios || []), sc] : (p.scenarios || []).map((x) => (x.id === sc.id ? sc : x)),
      symbols: (p.symbols || []).includes(sc.symbol) ? p.symbols : [...(p.symbols || []), sc.symbol],
    } : p)));
    setScDraft(null);
    onToast(isNewSc ? `Scenario added: ${sc.symbol} ${sc.bias}` : 'Scenario updated');
  };
  const setScStatus = (id: string, st: ScenarioStatus) => {
    if (!sel) return;
    setPlaybooks((prev) => prev.map((p) => (p.id === sel.id ? { ...p, scenarios: (p.scenarios || []).map((x) => (x.id === id ? { ...x, status: st } : x)) } : p)));
  };
  const deleteScenario = (id: string) => {
    if (!sel) return;
    setPlaybooks((prev) => prev.map((p) => (p.id === sel.id ? { ...p, scenarios: (p.scenarios || []).filter((x) => x.id !== id) } : p)));
    if (activeSc[sel.id] === id) setActiveSc((a) => ({ ...a, [sel.id]: '' }));
  };
  const scenarioPrefill = (sc: PlaybookScenario) => ({
    symbol: sc.symbol, assetClass: guessAssetClass(sc.symbol), direction: (sc.bias === 'long' ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
    entryPrice: sc.entry, stopPrice: sc.stop, takeProfit: sc.target, scenarioId: sc.id,
    notes: `Scenario: ${sc.hypothesis}${sc.trigger ? `\nTrigger: ${sc.trigger}` : ''}`,
  });
  const curSc = sel ? (sel.scenarios || []).find((x) => x.id === activeSc[sel.id]) : undefined;
  const logTrade = () => {
    if (!sel) return;
    if (curSc) setScStatus(curSc.id, 'triggered');
    const first = (sel.symbols || [])[0];
    onLogTrade({ strategy: sel.name, checklist: houseChecked, ...(curSc ? scenarioPrefill(curSc) : first ? { symbol: first, assetClass: guessAssetClass(first) } : {}) });
  };

  // ── Edit / create form ──
  const form = editing && (
    <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4" aria-label={isNew ? 'New playbook' : 'Edit playbook'}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0b1c30]">{isNew ? 'New playbook' : `Edit ${editing.name}`}</h3>
        <button type="button" onClick={() => setEditing(null)} className="text-xs font-semibold text-[#474556] hover:underline">Cancel</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block"><span className={lbl}>Name</span>
          <input className={`${input} mt-1`} value={editing.name} disabled={!isNew && selTrades.length > 0} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. London Breakout" />
          {!isNew && selTrades.length > 0 && <span className="text-[10px] text-slate-400">Locked: {selTrades.length} journal entries use this name.</span>}
        </label>
        <label className="block"><span className={lbl}>Style</span>
          <input className={`${input} mt-1`} value={editing.style} onChange={(e) => setEditing({ ...editing, style: e.target.value })} placeholder="Momentum, Mean reversion..." />
        </label>
        <label className="block"><span className={lbl}>Grade</span>
          <select className={`${input} mt-1`} value={editing.grade} onChange={(e) => setEditing({ ...editing, grade: e.target.value as PlaybookGrade })}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select>
          {!isNew && stats.get(editing.id) && <span className="text-[10px] text-slate-500">Data suggests {suggestGrade(stats.get(editing.id)!).grade}. Hover a grade badge to see the criteria.</span>}
        </label>
        <label className="block"><span className={lbl}>Status</span>
          <select className={`${input} mt-1`} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as PlaybookStatus })}>
            {(['active', 'testing', 'archived'] as const).map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
          </select>
        </label>
      </div>
      <div>
        <span className={lbl}>Markets</span>
        <div className="flex flex-wrap gap-3 mt-1">
          {MARKETS.map((m) => (
            <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.markets.includes(m)} onChange={() => setEditing({ ...editing, markets: editing.markets.includes(m) ? editing.markets.filter((x) => x !== m) : [...editing.markets, m] })} />{m}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
        <label className="flex items-center gap-2 text-sm col-span-2 sm:col-span-1">
          <input type="checkbox" checked={!!editing.window} onChange={(e) => setEditing({ ...editing, window: e.target.checked ? { start: 7, end: 12, label: 'London' } : null })} /> Session window
        </label>
        {editing.window && (
          <>
            <label className="block"><span className={lbl}>From (UTC)</span>
              <select className={`${input} mt-1`} value={editing.window.start} onChange={(e) => setEditing({ ...editing, window: { ...editing.window!, start: Number(e.target.value) } })}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{pad(h)}:00</option>)}</select>
            </label>
            <label className="block"><span className={lbl}>To (UTC)</span>
              <select className={`${input} mt-1`} value={editing.window.end} onChange={(e) => setEditing({ ...editing, window: { ...editing.window!, end: Number(e.target.value) } })}>{Array.from({ length: 24 }, (_, h) => h + 1).map((h) => <option key={h} value={h}>{pad(h)}:00</option>)}</select>
            </label>
            <label className="block"><span className={lbl}>Label</span>
              <input className={`${input} mt-1`} value={editing.window.label} onChange={(e) => setEditing({ ...editing, window: { ...editing.window!, label: e.target.value } })} />
            </label>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block"><span className={lbl}>Min reward:risk (1:x)</span>
          <input type="number" min={0.5} step={0.1} className={`${input} mt-1`} value={editing.benchmarkRR} onChange={(e) => setEditing({ ...editing, benchmarkRR: Number(e.target.value) })} />
        </label>
        <label className="block"><span className={lbl}>Risk per trade (% of account)</span>
          <input type="number" min={0} step={0.1} className={`${input} mt-1`} value={editing.riskPerTrade ?? ''} placeholder="House limit" onChange={(e) => setEditing({ ...editing, riskPerTrade: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </label>
        <label className="block"><span className={lbl}>Max trades per day</span>
          <input type="number" min={1} step={1} className={`${input} mt-1`} value={editing.maxTradesPerDay ?? ''} placeholder="House limit" onChange={(e) => setEditing({ ...editing, maxTradesPerDay: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </label>
      </div>
      <label className="block"><span className={lbl}>Do not trade when (one per line)</span>
        <textarea rows={3} className={`${input} mt-1`} value={(editing.avoid || []).join('\n')} onChange={(e) => setEditing({ ...editing, avoid: e.target.value.split('\n') })} placeholder="e.g. Within 15 minutes of a tier-1 release" />
      </label>
      <label className="block"><span className={lbl}>Thesis</span>
        <textarea rows={3} className={`${input} mt-1`} value={editing.thesis} onChange={(e) => setEditing({ ...editing, thesis: e.target.value })} placeholder="Why this setup works and when it does not." />
      </label>
      <div>
        <span className={lbl}>Execution rules</span>
        <div className="space-y-2 mt-1">
          {editing.rules.map((r, i) => (
            <div key={i} className="grid grid-cols-[24px_1fr_2fr_auto] gap-2 items-center">
              <span className="text-xs font-bold text-slate-400">{i + 1}.</span>
              <input className={input} value={r.title} placeholder="Rule" onChange={(e) => setEditing({ ...editing, rules: editing.rules.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
              <input className={input} value={r.detail} placeholder="What must be true" onChange={(e) => setEditing({ ...editing, rules: editing.rules.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)) })} />
              <button type="button" aria-label={`Remove rule ${i + 1}`} onClick={() => setEditing({ ...editing, rules: editing.rules.filter((_, j) => j !== i) })} className="text-xs text-slate-400 hover:text-rose-600 px-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setEditing({ ...editing, rules: [...editing.rules, { id: `r${editing.rules.length + 1}`, title: '', detail: '' }] })} className="text-xs font-semibold text-[#5338ec] hover:underline">Add rule</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {([['entryTrigger', 'Entry trigger'], ['stopRule', 'Stop / invalidation'], ['targetRule', 'Profit taking']] as const).map(([k, l]) => (
          <label key={k} className="block"><span className={lbl}>{l}</span>
            <textarea rows={3} className={`${input} mt-1`} value={editing[k]} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      <label className="block"><span className={lbl}>Instruments (comma separated)</span>
        <input className={`${input} mt-1`} value={(editing.symbols || []).join(', ')} onChange={(e) => setEditing({ ...editing, symbols: e.target.value.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean) })} placeholder="EUR/USD, XAU/USD, NAS100" />
      </label>
      <label className="block"><span className={lbl}>Tags (comma separated)</span>
        <input className={`${input} mt-1`} value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
      </label>
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <button type="button" onClick={save} className="h-9 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">{isNew ? 'Create playbook' : 'Save changes'}</button>
        <button type="button" onClick={() => setEditing(null)} className={btn}>Cancel</button>
        {!isNew && (selTrades.length === 0 ? (
          confirmDelete ? (
            <span className="ml-auto flex items-center gap-2 text-xs text-rose-700">Delete this playbook?
              <button type="button" onClick={remove} className="h-8 px-3 rounded-lg bg-rose-600 text-white font-semibold">Delete</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="font-semibold text-[#474556] hover:underline">Keep</button>
            </span>
          ) : <button type="button" onClick={() => setConfirmDelete(true)} className="ml-auto text-xs font-semibold text-rose-600 hover:underline">Delete playbook</button>
        ) : <span className="ml-auto text-[11px] text-slate-400">Has trades, so it can be archived but not deleted.</span>)}
      </div>
    </section>
  );

  // ── level bar for a trade (stop / entry / exit on one scale) ──
  const levelBar = (e: JournalEntry) => {
    const pts = [e.entryPrice, e.exitPrice, e.stopPrice, e.takeProfit].filter((x): x is number => typeof x === 'number');
    const lo = Math.min(...pts), hi = Math.max(...pts), span = hi - lo || 1;
    const pos = (v: number) => `${((v - lo) / span) * 100}%`;
    const win = netOf(e) >= 0;
    return (
      <div className="relative h-10 mt-3 mb-5 mx-2" aria-hidden="true">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200" />
        {e.exitPrice !== null && (
          <div className={`absolute top-1/2 h-2 -mt-1 rounded ${win ? 'bg-emerald-400/60' : 'bg-rose-400/60'}`} style={{ left: pos(Math.min(e.entryPrice, e.exitPrice)), width: `${(Math.abs(e.exitPrice - e.entryPrice) / span) * 100}%` }} />
        )}
        {e.stopPrice !== undefined && <span className="absolute top-0 bottom-0 w-0.5 bg-rose-500" style={{ left: pos(e.stopPrice) }}><span className="absolute top-full mt-0.5 -translate-x-1/2 text-[9px] font-mono text-rose-600 whitespace-nowrap">SL</span></span>}
        <span className="absolute top-0 bottom-0 w-0.5 bg-[#0b1c30]" style={{ left: pos(e.entryPrice) }}><span className="absolute top-full mt-0.5 -translate-x-1/2 text-[9px] font-mono text-[#0b1c30] whitespace-nowrap">In</span></span>
        {e.exitPrice !== null && <span className={`absolute top-0 bottom-0 w-0.5 ${win ? 'bg-emerald-600' : 'bg-rose-600'}`} style={{ left: pos(e.exitPrice) }}><span className={`absolute top-full mt-0.5 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap ${win ? 'text-emerald-700' : 'text-rose-700'}`}>Out</span></span>}
      </div>
    );
  };

  const statusCount = (st: 'all' | PlaybookStatus) => playbooks.filter((p) => st === 'all' || p.status === st).length;
  const marketCount = (m: 'all' | PortfolioAssetClass) => inStatus.filter((p) => m === 'all' || p.markets.includes(m)).length;

  return (
    <div className="space-y-5">
      {tip}
      {replayId && (() => { const re = entries.find((x) => x.id === replayId); const pb = re ? playbooks.find((p) => p.name === re.strategy) : undefined; return re ? (
        <TradeReplayModal entry={re} targetRR={pb?.benchmarkRR ?? 2} recording={recordings[re.id]} onAttach={(b) => onSetRecording(re.id, b)} onRemove={() => onSetRecording(re.id, null)} onClose={() => setReplayId(null)} />
      ) : null; })()}
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#5338ec]">Strategy playbooks</p>
          <h2 className="text-2xl font-bold text-[#0b1c30]">Your setups, rules and edge</h2>
          <p className="text-sm text-[#474556]">Each playbook's stats come from the journal entries tagged with it.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter setups, symbols, scenarios..." aria-label="Filter playbooks" className="h-9 w-60 border border-slate-200 rounded-lg px-3 text-xs bg-white" />
          <div className="relative">
            <button type="button" aria-expanded={tplOpen} onClick={() => setTplOpen((o) => !o)} className={btn}>Import template</button>
            {tplOpen && (
              <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-2">
                {PLAYBOOK_TEMPLATES.map((t, i) => (
                  <button key={t.name} type="button" onClick={() => importTpl(i)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50">
                    <span className="block text-sm font-semibold text-[#0b1c30]">{t.name}</span>
                    <span className="block text-[11px] text-slate-500">{t.style} · {t.markets.join(', ')} · {t.rules.length} rules</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={startNew} className="h-9 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">Create new playbook</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3 space-y-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Market">
          {(['all', ...MARKETS] as const).map((m) => (
            <button key={m} type="button" aria-pressed={market === m} onClick={() => setMarket(m)} className={chip(market === m)}>{m === 'all' ? 'All' : m} ({marketCount(m)})</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['active', 'testing', 'archived', 'all'] as const).map((st) => (
            <button key={st} type="button" aria-pressed={status === st} onClick={() => setStatus(st)}
              className={`h-7 px-2.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${status === st ? 'bg-[#0b1c30] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {st === 'all' ? 'All' : STATUS_LABEL[st]} ({statusCount(st)})
            </button>
          ))}
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
          <p className="px-3 pt-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">Playbooks ({list.length})</p>
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
                      <span className="ml-auto font-mono shrink-0">{st.n ? `${st.winRate.toFixed(0)}% · PF ${st.pf === null ? '∞' : st.pf.toFixed(1)}` : 'no trades'}</span>
                    </span>
                  </button>
                  {open.length > 0 && (
                    <button type="button" onClick={() => { setSelId(p.id); setEditing(null); setStep('scenarios'); }} className="block w-full text-left px-3 pb-2 -mt-1 text-[10px] font-semibold text-[#5338ec] hover:underline">
                      {open.length} open scenario{open.length === 1 ? '' : 's'}
                    </button>
                  )}
                </li>
              );
            })}
            {list.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-500">No playbooks match.</li>}
          </ul>
        </div>

        {/* Detail / editor */}
        <div className="min-w-0">
          {editing ? form : sel && s ? (
            <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-5" aria-label={`${sel.name} playbook`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {gradeBadge(sel, 'md', `${sel.grade} · ${sel.style || 'Setup'}`)}
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">{sel.markets.join(' / ')}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500">ID: #{sel.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EEF0FE] text-[10px] font-bold text-[#5338ec]">{STATUS_LABEL[sel.status]}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0b1c30]">{sel.name}</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-xs text-[#474556]">
                    <span>Session: <b className="text-[#0b1c30]">{windowText(sel)}</b></span>
                    <span>Min reward:risk: <b className="text-[#0b1c30]">1:{sel.benchmarkRR}</b></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {onBacktest && <button type="button" onClick={() => onBacktest(sel.id)} className={btn} title="Test these rules on past prices">Backtest this playbook</button>}
                  <button type="button" onClick={exportMd} className={btn}>Export</button>
                  <button type="button" onClick={startEdit} className={btn}>Edit playbook</button>
                </div>
              </div>

              {/* Analytics: always visible above the steps */}
              <div className="rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-[#0b1c30]">Analytics <span className="font-normal text-[11px] text-slate-500">· win rate, profit factor, avg W/L, target and scenarios</span></h4>
                  <button type="button" aria-expanded={showAnalytics} onClick={() => setShowAnalytics((v) => !v)} className="text-xs font-semibold text-[#5338ec] hover:underline">{showAnalytics ? 'Hide' : 'Show'}</button>
                </div>
                {showAnalytics && <PlaybookAnalytics playbook={sel} playbooks={playbooks} entries={entries} onShowTrades={onShowTrades} />}
              </div>

              {onBacktest && <PlaybookBacktestPanel playbook={sel} entries={entries} expected={expected[sel.id]} onBacktest={() => onBacktest(sel.id)} />}

              {/* Step tabs: Setup → Rules → Checklist → Execution → Review */}
              <nav className="grid grid-cols-3 md:grid-cols-6 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Playbook steps">
                {STEPS.map(([id, label], i) => {
                  const badge = id === 'checklist' ? `${metAll}/${totalChecks}` : id === 'review' ? (s.n ? `${s.n} trades` : '') : id === 'rules' ? `${sel.rules.length + (sel.avoid?.length || 0)}` : id === 'scenarios' ? `${openScenarios(sel).length} open` : '';
                  return (
                    <button key={id} type="button" role="tab" aria-selected={step === id} onClick={() => setStep(id)}
                      className={`rounded-lg px-2 py-2 text-left ${step === id ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}>
                      <span className={`block text-[10px] font-bold ${step === id ? 'text-[#5338ec]' : 'text-slate-400'}`}>STEP {i + 1}</span>
                      <span className={`block text-xs font-bold ${step === id ? 'text-[#0b1c30]' : 'text-[#474556]'}`}>{label}</span>
                      {badge && <span className="block text-[10px] text-slate-500 font-mono">{badge}</span>}
                    </button>
                  );
                })}
              </nav>

              {step === 'setup' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[['Grade · style', `${sel.grade} · ${sel.style || '—'}`], ['Markets', sel.markets.join(', ')], ['Session', sel.window ? `${pad(sel.window.start)}:00–${pad(sel.window.end)}:00 UTC` : 'Any time'], ['Min reward:risk', `1:${sel.benchmarkRR}`]].map(([l, v]) => (
                      <div key={l} className="rounded-xl border border-slate-200 px-3 py-2.5"><p className={lbl}>{l}</p><p className="text-sm font-bold text-[#0b1c30] mt-0.5">{v}</p></div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 px-3 py-2.5">
                    <p className={lbl}>Instruments</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(sel.symbols || []).map((sy) => {
                        const n = selTrades.filter((e) => e.symbol === sy).length;
                        return <span key={sy} className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-[#0b1c30]">{sy}<span className="ml-1 text-[10px] font-mono text-slate-500">{n}</span></span>;
                      })}
                      {!(sel.symbols || []).length && <span className="text-xs text-slate-400">No instruments yet. Add them in Edit playbook.</span>}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className={`${lbl} text-[#5338ec]`}>Setup thesis: why it works</p>
                    <p className="text-sm leading-relaxed text-[#0b1c30] mt-1.5">{sel.thesis || <span className="text-slate-400">No thesis written yet. Use Edit playbook to add one.</span>}</p>
                    {sel.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{sel.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">#{t.replace(/\s+/g, '_')}</span>)}</div>}
                  </div>
                  <button type="button" onClick={() => setStep('rules')} className="text-xs font-semibold text-[#5338ec] hover:underline">Next: rules →</button>
                </div>
              )}

              {step === 'rules' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#0b1c30] mb-2">Setup rules: what must be true</h4>
                    <ol className="space-y-2">
                      {sel.rules.map((r, i) => (
                        <li key={r.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
                          <span className="block text-sm font-semibold text-[#0b1c30]">{i + 1}. {r.title}</span>
                          <span className="block text-xs text-[#474556]">{r.detail}</span>
                        </li>
                      ))}
                      {sel.rules.length === 0 && <li className="text-sm text-slate-400">No setup rules yet.</li>}
                    </ol>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 px-3 py-2.5"><p className={lbl}>Risk per trade</p><p className="text-sm font-bold text-[#0b1c30] mt-0.5">{sel.riskPerTrade !== undefined ? `${sel.riskPerTrade}% of account` : 'House limit'}</p></div>
                    <div className="rounded-xl border border-slate-200 px-3 py-2.5">
                      <p className={lbl}>Max trades per day</p>
                      <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{sel.maxTradesPerDay ?? 'House limit'}</p>
                      {sel.maxTradesPerDay !== undefined && <p className={`text-[11px] mt-0.5 ${overDays ? 'text-rose-600' : 'text-emerald-600'}`}>{overDays ? `Broken on ${overDays} day${overDays === 1 ? '' : 's'} in the journal` : 'Never broken in the journal'}</p>}
                    </div>
                    <div className="rounded-xl border border-slate-200 px-3 py-2.5"><p className={lbl}>Min reward:risk</p><p className="text-sm font-bold text-[#0b1c30] mt-0.5">1:{sel.benchmarkRR}</p></div>
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3">
                    <p className={`${lbl} text-rose-600`}>Do not trade when</p>
                    <ul className="mt-1.5 space-y-1">
                      {(sel.avoid || []).map((a) => <li key={a} className="text-xs text-[#0b1c30]">✕ {a}</li>)}
                      {!(sel.avoid || []).length && <li className="text-xs text-slate-400">No no-trade conditions yet. Add them in Edit playbook.</li>}
                    </ul>
                  </div>
                  <button type="button" onClick={() => setStep('scenarios')} className="text-xs font-semibold text-[#5338ec] hover:underline">Next: scenarios →</button>
                </div>
              )}

              {step === 'scenarios' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#0b1c30]">Scenarios: your trade hypotheses</h4>
                      <p className="text-[11px] text-slate-500">Write the idea before the market moves: "If ... then ...", the trigger, and the levels. When it triggers, check it and log the trade.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold">
                        {(['open', 'all'] as const).map((f) => <button key={f} type="button" aria-pressed={scFilter === f} onClick={() => setScFilter(f)} className={`px-2.5 ${scFilter === f ? 'bg-[#0b1c30] text-white' : 'bg-white text-[#474556]'}`}>{f === 'open' ? 'Open' : 'All'}</button>)}
                      </div>
                      {!scDraft && <button type="button" onClick={() => startScenario(sel)} className="h-8 px-3 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">New scenario</button>}
                    </div>
                  </div>

                  {scDraft && (() => {
                    const rr = plannedRR(scDraft);
                    const setN = (k: 'entry' | 'stop' | 'target', v: string) => setScDraft({ ...scDraft, [k]: v === '' ? undefined : Number(v) });
                    const levelErr = scDraft.entry !== undefined && scDraft.stop !== undefined && (scDraft.bias === 'long' ? scDraft.stop >= scDraft.entry : scDraft.stop <= scDraft.entry);
                    return (
                      <div className="rounded-xl border border-[#5338ec]/30 bg-[#F8F7FF] p-4 space-y-3" aria-label="Scenario form">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <label className="block"><span className={lbl}>Symbol</span>
                            <input list="pb-symbols" className={`${input} mt-1 bg-white`} value={scDraft.symbol} onChange={(e) => setScDraft({ ...scDraft, symbol: e.target.value })} placeholder="e.g. EUR/USD" />
                            <datalist id="pb-symbols">{(sel.symbols || []).map((sy) => <option key={sy} value={sy} />)}</datalist>
                          </label>
                          <div><span className={lbl}>Bias</span>
                            <div className="flex mt-1 h-[38px] rounded-lg border border-slate-200 overflow-hidden bg-white">
                              {(['long', 'short'] as const).map((b) => <button key={b} type="button" aria-pressed={scDraft.bias === b} onClick={() => setScDraft({ ...scDraft, bias: b })} className={`flex-1 text-xs font-bold ${scDraft.bias === b ? (b === 'long' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'text-[#474556]'}`}>{b === 'long' ? 'LONG' : 'SHORT'}</button>)}
                            </div>
                          </div>
                          <label className="block"><span className={lbl}>Valid until</span>
                            <input type="date" className={`${input} mt-1 bg-white`} value={scDraft.validUntil} onChange={(e) => setScDraft({ ...scDraft, validUntil: e.target.value })} />
                          </label>
                          <label className="block"><span className={lbl}>Status</span>
                            <select className={`${input} mt-1 bg-white`} value={scDraft.status} onChange={(e) => setScDraft({ ...scDraft, status: e.target.value as ScenarioStatus })}>
                              {(Object.keys(SC_LABEL) as ScenarioStatus[]).map((st) => <option key={st} value={st}>{SC_LABEL[st]}</option>)}
                            </select>
                          </label>
                        </div>
                        <label className="block"><span className={lbl}>Hypothesis</span>
                          <textarea rows={2} className={`${input} mt-1 bg-white`} value={scDraft.hypothesis} onChange={(e) => setScDraft({ ...scDraft, hypothesis: e.target.value })} placeholder="If price does X at level Y, then I expect Z because..." />
                        </label>
                        <label className="block"><span className={lbl}>Trigger: what confirms it</span>
                          <input className={`${input} mt-1 bg-white`} value={scDraft.trigger} onChange={(e) => setScDraft({ ...scDraft, trigger: e.target.value })} placeholder="e.g. 15m close above the range high with volume" />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {([['entry', 'Entry'], ['stop', 'Stop'], ['target', 'Target']] as const).map(([k, l]) => (
                            <label key={k} className="block"><span className={lbl}>{l}</span>
                              <input type="number" step="any" className={`${input} mt-1 bg-white font-mono`} value={scDraft[k] ?? ''} onChange={(e) => setN(k, e.target.value)} />
                            </label>
                          ))}
                        </div>
                        <p className={`text-[11px] ${levelErr ? 'text-rose-600' : rr !== null && rr < sel.benchmarkRR ? 'text-amber-600' : 'text-slate-500'}`}>
                          {levelErr ? `Stop must be ${scDraft.bias === 'long' ? 'below' : 'above'} the entry for a ${scDraft.bias}.` : rr === null ? 'Add entry, stop and target to see the planned reward:risk.' : `Planned reward:risk 1:${rr.toFixed(2)}${rr < sel.benchmarkRR ? `, below this playbook's 1:${sel.benchmarkRR} minimum` : ' meets the playbook minimum'}.`}
                        </p>
                        <div className="flex gap-2">
                          <button type="button" disabled={levelErr} onClick={saveScenario} className="h-9 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-xs font-semibold text-white">{scDraft.id ? 'Save scenario' : 'Add scenario'}</button>
                          <button type="button" onClick={() => setScDraft(null)} className={btn}>Cancel</button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    {(sel.scenarios || []).filter((x) => scFilter === 'all' || x.status === 'watching' || x.status === 'triggered').map((sc) => {
                      const rr = plannedRR(sc);
                      const expired = sc.validUntil < JOURNAL_TODAY && (sc.status === 'watching');
                      return (
                        <div key={sc.id} className="rounded-xl border border-slate-200 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#0b1c30]">{sc.symbol}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${sc.bias === 'long' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{sc.bias === 'long' ? 'LONG' : 'SHORT'}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${SC_STYLE[sc.status]}`}>{SC_LABEL[sc.status]}</span>
                            {expired && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-[10px] font-bold text-amber-700">Expired {sc.validUntil}</span>}
                            {!expired && <span className="text-[10px] text-slate-400">Valid until {sc.validUntil}</span>}
                            <span className="ml-auto flex gap-3 text-[11px] font-semibold">
                              <button type="button" onClick={() => setScDraft({ ...sc })} className="text-[#474556] hover:underline">Edit</button>
                              <button type="button" onClick={() => deleteScenario(sc.id)} className="text-rose-600 hover:underline">Delete</button>
                            </span>
                          </div>
                          <p className="text-sm text-[#0b1c30] mt-1.5">{sc.hypothesis}</p>
                          {sc.trigger && <p className="text-xs text-[#474556] mt-1"><span className="font-semibold">Trigger:</span> {sc.trigger}</p>}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] font-mono">
                            <span>Entry <b>{sc.entry ?? '—'}</b></span><span className="text-rose-600">Stop <b>{sc.stop ?? '—'}</b></span><span className="text-emerald-600">Target <b>{sc.target ?? '—'}</b></span>
                            {rr !== null && <span className={rr < sel.benchmarkRR ? 'text-amber-600' : 'text-[#0b1c30]'}>R:R 1:{rr.toFixed(2)}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(sc.status === 'watching' || sc.status === 'triggered') && (
                              <button type="button" onClick={() => { setActiveSc((a) => ({ ...a, [sel.id]: sc.id })); setStep('checklist'); }} className="h-8 px-3 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">Check and trade</button>
                            )}
                            {sc.status === 'watching' && <button type="button" onClick={() => setScStatus(sc.id, 'invalidated')} className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-[#474556] hover:bg-slate-50">Invalidated</button>}
                            {sc.status === 'triggered' && <button type="button" onClick={() => setScStatus(sc.id, 'closed')} className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-[#474556] hover:bg-slate-50">Mark closed</button>}
                            {(sc.status === 'invalidated' || sc.status === 'closed') && <button type="button" onClick={() => setScStatus(sc.id, 'watching')} className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-[#474556] hover:bg-slate-50">Reopen</button>}
                          </div>
                        </div>
                      );
                    })}
                    {!(sel.scenarios || []).some((x) => scFilter === 'all' || x.status === 'watching' || x.status === 'triggered') && !scDraft && (
                      <p className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl p-4 text-center">No {scFilter === 'open' ? 'open ' : ''}scenarios. Add one when you see this setup forming on a chart.</p>
                    )}
                  </div>
                </div>
              )}

              {step === 'checklist' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                    <span className={lbl}>Checking</span>
                    <select aria-label="Scenario to check" value={curSc?.id || ''} onChange={(e) => setActiveSc((a) => ({ ...a, [sel.id]: e.target.value }))} className="h-8 border border-slate-200 rounded-lg px-2 text-xs font-semibold bg-white max-w-full">
                      <option value="">No scenario (general check)</option>
                      {openScenarios(sel).map((x) => <option key={x.id} value={x.id}>{x.symbol} {x.bias === 'long' ? 'long' : 'short'}: {x.hypothesis.slice(0, 60)}{x.hypothesis.length > 60 ? '…' : ''}</option>)}
                    </select>
                    {curSc && <span className="text-[11px] font-mono text-slate-500">Entry {curSc.entry ?? '—'} · Stop {curSc.stop ?? '—'} · Target {curSc.target ?? '—'}</span>}
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-sm font-bold ${quality.cls}`}>{metAll} of {totalChecks} ticked · {quality.label}</span>
                    <span className="text-[11px] text-[#474556]">Tick what applies. You don't need all of them; the score is saved with the trade for later review.</span>
                    {(checked.length > 0 || houseChecked.length > 0) && <button type="button" onClick={() => { setChecks((c) => ({ ...c, [sel.id]: [] })); setHouseChecks((c) => ({ ...c, [sel.id]: [] })); }} className="ml-auto text-xs font-semibold text-[#474556] hover:underline">Reset</button>}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={totalChecks} aria-valuenow={metAll} aria-label="Checklist completion">
                      <div className={`h-full rounded-full ${quality.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className={`${lbl} mb-1.5`}>Setup conditions ({met}/{sel.rules.length})</p>
                    <div className="space-y-2">
                      {sel.rules.map((r, i) => {
                        const on = checked.includes(r.id);
                        return (
                          <label key={r.id} className={`flex gap-3 items-start rounded-xl border px-3 py-2.5 cursor-pointer ${on ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input type="checkbox" className="mt-0.5" checked={on} onChange={() => setChecks((c) => ({ ...c, [sel.id]: on ? checked.filter((x) => x !== r.id) : [...checked, r.id] }))} />
                            <span><span className="block text-sm font-semibold text-[#0b1c30]">{i + 1}. {r.title}</span><span className="block text-xs text-[#474556]">{r.detail}</span></span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className={`${lbl} mb-1.5`}>House pre-trade checklist ({houseMet}/{houseChecklist.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {houseChecklist.map((c) => {
                        const on = houseChecked.includes(c.id);
                        return (
                          <label key={c.id} className={`flex gap-2.5 items-center rounded-xl border px-3 py-2 cursor-pointer text-xs ${on ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input type="checkbox" checked={on} onChange={() => setHouseChecks((x) => ({ ...x, [sel.id]: on ? houseChecked.filter((y) => y !== c.id) : [...houseChecked, c.id] }))} />
                            <span className="text-[#0b1c30]">{c.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {(sel.avoid || []).length > 0 && <p className="text-[11px] text-rose-600">Also check you are not in a no-trade condition: {(sel.avoid || []).join(' · ')}.</p>}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button type="button" onClick={logTrade} className="h-9 px-4 rounded-lg text-xs font-semibold text-white bg-[#5338ec] hover:bg-[#4326d8]">
                      Log trade with this playbook
                    </button>
                    <span className="text-[11px] text-slate-500">Opens a new journal entry with this playbook and your ticked checklist{curSc ? `, plus ${curSc.symbol}, direction and levels from the scenario` : ''} filled in.</span>
                  </div>
                </div>
              )}

              {step === 'execution' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[['Entry trigger', sel.entryTrigger, 'text-[#5338ec]'], ['Stop / invalidation', sel.stopRule, 'text-rose-600'], ['Profit taking', sel.targetRule, 'text-emerald-600']].map(([l, v, c]) => (
                      <div key={l} className="rounded-xl border border-slate-200 p-3">
                        <p className={`${lbl} ${c}`}>{l}</p>
                        <p className="text-xs text-[#0b1c30] mt-1.5 leading-relaxed">{v || <span className="text-slate-400">Not set</span>}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 px-3 py-2.5"><p className={lbl}>Plan followed</p><p className={`text-sm font-bold font-mono mt-0.5 ${s.n && s.followed / s.n >= 0.8 ? 'text-emerald-600' : 'text-amber-600'}`}>{s.n ? `${Math.round((s.followed / s.n) * 100)}% (${s.followed}/${s.n})` : '—'}</p></div>
                    <div className="rounded-xl border border-slate-200 px-3 py-2.5"><p className={lbl}>Checklist completion</p><p className="text-sm font-bold font-mono mt-0.5 text-[#0b1c30]">{checklistPct === null ? '—' : `${checklistPct}% of items ticked`}</p></div>
                    <div className="rounded-xl border border-slate-200 px-3 py-2.5"><p className={lbl}>Avg hold time</p><p className="text-sm font-bold font-mono mt-0.5 text-[#0b1c30]">{s.avgHold === null ? '—' : s.avgHold < 60 ? `${Math.round(s.avgHold)}m` : `${Math.floor(s.avgHold / 60)}h ${pad(Math.round(s.avgHold % 60))}m`}</p></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-[#0b1c30]">Recent executions</h4>
                      {selTrades.length > 0 && <button type="button" onClick={() => onShowTrades(selTrades.map((e) => e.id), `${sel.name} playbook`)} className="text-xs font-semibold text-[#5338ec] hover:underline">All {selTrades.length} in Trade Log</button>}
                    </div>
                    {selTrades.length === 0 ? (
                      <p className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl p-4 text-center">No trades with this playbook yet. Use the Checklist step to log one.</p>
                    ) : (
                      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                        {[...selTrades].sort((a, b) => (b.entryTime || b.date).localeCompare(a.entryTime || a.date)).slice(0, 6).map((e) => (
                          <div key={e.id} className="flex items-center gap-2 pr-2 hover:bg-slate-50">
                          <button type="button" onClick={() => onOpenEntry(e.id)} className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2 text-xs text-left">
                            <span className="font-mono text-slate-500 w-32 shrink-0">{(e.entryTime || e.date).replace('T', ' ').slice(0, 16)}</span>
                            <span className="font-bold text-[#0b1c30] w-20 shrink-0">{e.symbol}</span>
                            <span className={`text-[10px] font-bold w-10 ${e.direction === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>{e.direction === 'BUY' ? 'LONG' : 'SHORT'}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${e.followedPlan ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{e.followedPlan ? 'On plan' : 'Off plan'}</span>
                            {e.mistakes[0] && <span className="text-[10px] text-rose-600 truncate">{e.mistakes[0]}</span>}
                            <span className={`ml-auto font-mono font-bold ${tone(netOf(e))}`}>{money(netOf(e), 2)}</span>
                          </button>
                          <button type="button" onClick={() => setReplayId(e.id)} className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold ${recordings[e.id] ? 'bg-emerald-50 text-emerald-700' : 'text-[#5338ec] hover:bg-[#EEF0FE]'}`}>{recordings[e.id] ? '▶ Recorded' : '▶ Replay'}</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'review' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {[
                      ['Trades', String(s.n), ''],
                      ['Win rate', s.n ? `${s.winRate.toFixed(1)}%` : '—', ''],
                      ['Profit factor', s.pf === null ? (s.n ? '∞' : '—') : s.pf.toFixed(2), 'text-emerald-600'],
                      ['Expectancy', s.n ? money(s.expectancy, 2) : '—', tone(s.expectancy)],
                      ['Average R', s.avgR === null ? '—' : `${s.avgR >= 0 ? '+' : ''}${s.avgR.toFixed(2)}R`, s.avgR === null ? '' : tone(s.avgR)],
                      ['Net P&L', s.n ? money(s.net, 2) : '—', tone(s.net)],
                    ].map(([l, v, c]) => (
                      <div key={l} className="rounded-xl border border-slate-200 px-2.5 py-2"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{l}</p><p className={`text-sm font-bold font-mono mt-0.5 ${c || 'text-[#0b1c30]'}`}>{v}</p></div>
                    ))}
                  </div>

                  {selTrades.some((e) => recordings[e.id]) && (
                    <div>
                      <h4 className="text-sm font-bold text-[#0b1c30] mb-2">Your execution replays</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selTrades.filter((e) => recordings[e.id]).map((e) => (
                          <div key={e.id} className="rounded-xl border border-slate-200 p-2">
                            <video src={recordings[e.id]} controls className="w-full rounded-lg bg-black aspect-video" />
                            <div className="flex items-center justify-between mt-1.5 px-1 text-[11px]">
                              <span className="font-semibold text-[#0b1c30]">{e.symbol} · {(e.entryTime || e.date).slice(0, 10)}</span>
                              <span className={`font-mono font-bold ${tone(netOf(e))}`}>{money(netOf(e), 2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rCurve.length > 1 && (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className={lbl}>Cumulative R, trade by trade</p>
                      <svg viewBox="0 0 600 120" className="w-full h-auto mt-2" role="img" aria-label={`Cumulative R over ${rCurve.length} trades, ending at ${rCurve[rCurve.length - 1].toFixed(1)}R`}>
                        {(() => {
                          const lo = Math.min(0, ...rCurve), hi = Math.max(0, ...rCurve), sp = hi - lo || 1;
                          const x = (i: number) => 8 + (i / (rCurve.length - 1)) * 584;
                          const y = (v: number) => 8 + (1 - (v - lo) / sp) * 104;
                          return (
                            <>
                              <line x1={8} x2={592} y1={y(0)} y2={y(0)} stroke="#cbd5e1" strokeDasharray="3 4" />
                              <text x={4} y={y(0) - 3} fontSize="9" fill="#64748b">0R</text>
                              <path d={rCurve.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} fill="none" stroke="#5338ec" strokeWidth={2} strokeLinejoin="round" />
                              <circle cx={x(rCurve.length - 1)} cy={y(rCurve[rCurve.length - 1])} r={3.5} fill="#5338ec" />
                              <text x={584} y={y(rCurve[rCurve.length - 1]) < 26 ? y(rCurve[rCurve.length - 1]) + 18 : y(rCurve[rCurve.length - 1]) - 8} textAnchor="end" fontSize="10" fontWeight={700} fill="#0b1c30">{rCurve[rCurve.length - 1] >= 0 ? '+' : ''}{rCurve[rCurve.length - 1].toFixed(1)}R</text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className={lbl}>Followed plan vs broke plan</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="rounded-lg bg-emerald-50 px-3 py-2"><p className="text-[10px] font-semibold text-emerald-700">On plan ({planSplit.on.n})</p><p className="text-sm font-bold font-mono text-emerald-700">{planSplit.on.n ? `${money(planSplit.on.avg, 2)}/trade` : '—'}</p></div>
                        <div className="rounded-lg bg-rose-50 px-3 py-2"><p className="text-[10px] font-semibold text-rose-700">Off plan ({planSplit.off.n})</p><p className="text-sm font-bold font-mono text-rose-700">{planSplit.off.n ? `${money(planSplit.off.avg, 2)}/trade` : '—'}</p></div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className={lbl}>Most common mistakes</p>
                      <ul className="mt-2 space-y-1">
                        {topMistakes.map(([m, c]) => <li key={m} className="flex justify-between text-xs"><span className="text-[#0b1c30]">{m}</span><span className="font-mono text-rose-600">{c}×</span></li>)}
                        {topMistakes.length === 0 && <li className="text-xs text-slate-400">No mistakes logged for this playbook.</li>}
                      </ul>
                    </div>
                  </div>

                  {selTrades.length > 0 && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <p className={`${lbl} px-3 pt-3`}>By instrument</p>
                      <table className="w-full text-xs mt-1">
                        <thead className="text-slate-500"><tr><th className="text-left font-semibold px-3 py-1.5">Symbol</th><th className="text-right font-semibold px-3 py-1.5">Trades</th><th className="text-right font-semibold px-3 py-1.5">Win %</th><th className="text-right font-semibold px-3 py-1.5">Avg R</th><th className="text-right font-semibold px-3 py-1.5">Net</th></tr></thead>
                        <tbody>
                          {Array.from(new Set<string>(selTrades.map((e) => e.symbol))).map((sy) => ({ sy, st: statsFor(selTrades.filter((e) => e.symbol === sy)) })).sort((a, b) => b.st.net - a.st.net).map(({ sy, st }) => (
                            <tr key={sy} className="border-t border-slate-100 font-mono">
                              <td className="px-3 py-1.5 font-sans font-semibold text-[#0b1c30]">{sy}{!(sel.symbols || []).includes(sy) && <span className="ml-1 text-[9px] font-bold text-amber-600">not in list</span>}</td>
                              <td className="px-3 py-1.5 text-right">{st.n}</td>
                              <td className="px-3 py-1.5 text-right">{st.winRate.toFixed(0)}%</td>
                              <td className={`px-3 py-1.5 text-right ${st.avgR === null ? 'text-slate-400' : tone(st.avgR)}`}>{st.avgR === null ? '—' : `${st.avgR >= 0 ? '+' : ''}${st.avgR.toFixed(2)}R`}</td>
                              <td className={`px-3 py-1.5 text-right font-bold ${tone(st.net)}`}>{money(st.net, 2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selTrades.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-[#0b1c30] mb-2">Best executions <span className="font-normal text-[11px] text-slate-500">· replay or record each one</span></h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[...selTrades].sort((a, b) => netOf(b) - netOf(a)).slice(0, 2).map((e) => (
                          <div key={e.id} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-[#0b1c30]">{e.symbol} <span className={`text-[10px] font-bold ${e.direction === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>{e.direction === 'BUY' ? 'LONG' : 'SHORT'}</span></p>
                                <p className="text-[11px] text-slate-500 font-mono">{(e.entryTime || e.date).replace('T', ' ').slice(0, 16)} UTC</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-base font-bold font-mono ${tone(netOf(e))}`}>{money(netOf(e), 2)}</p>
                                {e.rMultiple !== null && <p className={`text-[11px] font-mono ${tone(e.rMultiple)}`}>{e.rMultiple >= 0 ? '+' : ''}{e.rMultiple.toFixed(1)}R</p>}
                              </div>
                            </div>
                            {levelBar(e)}
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex flex-wrap gap-1">{e.tags.slice(0, 2).map((t) => <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">#{t.replace(/\s+/g, '_')}</span>)}</span>
                              <span className="flex gap-3">
                                <button type="button" onClick={() => setReplayId(e.id)} className={`text-xs font-semibold hover:underline whitespace-nowrap ${recordings[e.id] ? 'text-emerald-700' : 'text-[#5338ec]'}`}>{recordings[e.id] ? '▶ Watch replay' : '▶ Replay'}</button>
                                <button type="button" onClick={() => onOpenEntry(e.id)} className="text-xs font-semibold text-[#5338ec] hover:underline whitespace-nowrap">View trade</button>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-[#0b1c30] mb-2">Review log</h4>
                    <div className="rounded-xl border border-slate-200 p-3 space-y-2">
                      <textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="What did the numbers tell you? What will you change?" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" aria-label="Review note" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500">Decision</span>
                        {(['keep', 'adjust', 'pause', 'retire'] as const).map((d) => (
                          <button key={d} type="button" aria-pressed={reviewDecision === d} onClick={() => setReviewDecision(d)} className={chip(reviewDecision === d)}>{DECISION_LABEL[d]}</button>
                        ))}
                        <button type="button" disabled={!reviewNote.trim()} onClick={addReview} className="ml-auto h-8 px-3 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-xs font-semibold text-white">Save review</button>
                      </div>
                      <p className="text-[10px] text-slate-400">Keep sets the playbook to Active, Pause to Testing, Retire to Archived. Adjust leaves the status as is.</p>
                    </div>
                    <ul className="mt-2 space-y-2">
                      {[...(sel.reviews || [])].reverse().map((rv) => (
                        <li key={rv.id} className="rounded-xl border border-slate-200 px-3 py-2">
                          <div className="flex items-center gap-2 text-[11px]"><span className="font-mono text-slate-500">{rv.date}</span><span className={`px-1.5 py-0.5 rounded font-bold ${DECISION_STYLE[rv.decision]}`}>{DECISION_LABEL[rv.decision]}</span></div>
                          <p className="text-xs text-[#0b1c30] mt-1">{rv.note}</p>
                        </li>
                      ))}
                      {!(sel.reviews || []).length && <li className="text-xs text-slate-400">No reviews yet. Review each playbook every week or two.</li>}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">Select a playbook, or create one.</div>
          )}
        </div>
      </div>

      {/* House rules (global checklist + risk limits) */}
      <div>
        <h3 className="text-sm font-bold text-[#0b1c30] mb-1">House rules</h3>
        <p className="text-xs text-[#474556] mb-3">Apply to every playbook: the pre-trade checklist in each new entry and your hard risk limits.</p>
        {houseRules}
      </div>
    </div>
  );
};
