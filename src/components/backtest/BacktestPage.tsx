// Backtest tab of the Trading Journal: routes between Home, Setup, Results, What-if, Replay and Saved runs,
// and owns the run queue, usage limits, credits and points.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Coins, Loader2, XCircle, PlayCircle, Sparkles } from 'lucide-react';
import type { Broker, JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { JOURNAL_TODAY } from '../../data/journalData';
import { EXTRA_RUN_CREDITS, runLimitFor } from '../../backtest/config';
import { applyPatch } from '../../backtest/job';
import { runBacktest, CancelledError } from '../../backtest/service';
import { defaultSettings, deepClone, describeCondition, JournalRules } from '../../backtest/rules';
import { expectedFromRun } from '../../backtest/gap';
import { userTz } from '../../backtest/format';
import {
  BacktestRun, claimPoints, loadReplay, loadRuns, loadUsage, PlaybookExpectedStats, ReplaySession, saveReplay, saveRuns, saveUsage, summarize, Usage,
} from '../../backtest/store';
import { BacktestSettings, JobOutput, Suggestion } from '../../backtest/types';
import { BacktestHome } from './BacktestHome';
import { BacktestSetup } from './BacktestSetup';
import { BacktestResults } from './BacktestResults';
import { SavedRuns } from './SavedRuns';
import { WhatIfPanel } from './WhatIfPanel';
import { ReplayPanel } from './ReplayPanel';
import { Banner, Modal, btnPrimary, btnSecondary } from './ui';

export type BacktestIntent = { view: 'setup'; playbookId?: string } | { view: 'replay'; entryId?: string } | { view: 'whatif' } | { view: 'home' };
type View = 'home' | 'setup' | 'running' | 'results' | 'whatif' | 'replay' | 'runs';

interface Props {
  entries: JournalEntry[];
  playbooks: JournalPlaybook[];
  setPlaybooks: (fn: (prev: JournalPlaybook[]) => JournalPlaybook[]) => void;
  journalRules: JournalRules;
  onUpdateRules: (p: Partial<JournalRules>) => void;
  onAddChecklist: (label: string) => void;
  brokers: Broker[];
  userTierLevel: number;
  sydeCredits: number;
  onSpendCredits: (amount: number, reason: string) => boolean;
  onRewardPoints: (points: number, reason: string) => void;
  onUpgrade: () => void;
  onToast: (m: string) => void;
  onOpenTrades: (ids: string[], label: string) => void;
  expected: Record<string, PlaybookExpectedStats>;
  onSetExpected: (s: PlaybookExpectedStats) => void;
  intent: BacktestIntent | null;
  onIntentDone: () => void;
}

interface Current { settings: BacktestSettings; output: JobOutput; runId: string | null; name: string }

const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

export const BacktestPage: React.FC<Props> = (p) => {
  const { entries, playbooks, setPlaybooks, journalRules, brokers, userTierLevel, sydeCredits, onSpendCredits, onRewardPoints, onToast, expected, onSetExpected } = p;
  const [view, setView] = useState<View>('home');
  const [draft, setDraft] = useState<BacktestSettings>(() => defaultSettings({ journalRules }));
  const [cur, setCur] = useState<Current | null>(null);
  const [runs, setRuns] = useState<BacktestRun[]>(() => loadRuns());
  const [usage, setUsage] = useState<Usage>(() => loadUsage());
  const [sessions, setSessions] = useState<ReplaySession[]>(() => loadReplay());
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState(false);
  const [replayEntry, setReplayEntry] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const limit = runLimitFor(userTierLevel);
  const tz = userTz;

  const startSetup = (playbookId?: string) => {
    const pb = playbooks.find((x) => x.id === playbookId) || null;
    const counts = new Map<string, number>();
    entries.filter((e) => pb && e.strategy === pb.name).forEach((e) => counts.set(e.symbol, (counts.get(e.symbol) || 0) + 1));
    const most = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([s]) => s)[0];
    setDraft(defaultSettings({ playbook: pb, journalRules, mostTraded: most }));
    setError(null);
    setView('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deep links from other parts of the journal (playbook page, trade log, insights).
  useEffect(() => {
    if (!p.intent) return;
    const it = p.intent;
    if (it.view === 'setup') startSetup(it.playbookId);
    else if (it.view === 'replay') { setReplayEntry(it.entryId ?? null); setView('replay'); }
    else setView(it.view);
    p.onIntentDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.intent]);

  const setU = (u: Usage) => { setUsage(u); saveUsage(u); };
  const left = Math.max(0, limit - usage.used) + usage.prepaid;

  const start = () => {
    setError(null);
    setProgress(0);
    const settings = deepClone(draft);
    const ctl = new AbortController();
    abort.current = ctl;
    setView('running');
    runBacktest(settings, { onProgress: setProgress, signal: ctl.signal })
      .then((output) => {
        const u = loadUsage();
        setU(u.used < limit ? { ...u, used: u.used + 1 } : { ...u, prepaid: Math.max(0, u.prepaid - 1) });
        setCur({ settings, output, runId: null, name: settings.name });
        setView('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((e: Error) => {
        if (e instanceof CancelledError || e.name === 'CancelledError') { onToast('Backtest cancelled. It did not count toward your runs.'); setView('setup'); return; }
        setError(e.message || 'The backtest could not run.');
        setView('setup');
      });
  };

  const onRun = () => { if (left > 0) start(); else setGate(true); };

  const buyRun = () => {
    if (!onSpendCredits(EXTRA_RUN_CREDITS, 'Extra backtest run')) return;
    const u = loadUsage();
    setU({ ...u, extraPaid: u.extraPaid + 1, prepaid: u.prepaid + 1 });
    setGate(false);
    setTimeout(start, 0);
  };

  const pb = (id: string | null) => playbooks.find((x) => x.id === id) || null;

  const save = () => {
    if (!cur) return;
    const now = new Date().toISOString();
    const id = cur.runId ?? `run_${Date.now().toString(36)}`;
    const run: BacktestRun = {
      id, name: cur.name, mode: 'automated', status: 'done', playbookId: cur.settings.playbookId, symbol: cur.settings.symbol, timeframe: cur.settings.timeframe,
      from: cur.settings.from, to: cur.settings.to, createdAt: now, lastRun: now, settings: cur.settings, summary: summarize(cur.output), output: cur.output,
    };
    const next = [run, ...runs.filter((r) => r.id !== id)];
    setRuns(next);
    if (!saveRuns(next)) onToast('Saved for this visit, but browser storage is full; older runs were trimmed.');
    setCur({ ...cur, runId: id });
    const book = pb(cur.settings.playbookId);
    if (book && run.summary.trades > 0) onSetExpected(expectedFromRun(book.id, id, run.name, run.symbol, cur.output));
    const pts = claimPoints('backtest', id);
    if (pts) onRewardPoints(pts, 'Saved a backtest');
    onToast(book ? `Saved. ${book.name}'s expected results are updated from this run.` : 'Backtest saved');
  };

  const applySuggestion = (sg: Suggestion) => {
    if (!cur) return;
    const next = applyPatch(cur.settings, sg.patch);
    next.name = `${cur.settings.name.replace(/ · .*$/, '')} · ${sg.label}`;
    setDraft(next);
    setView('setup');
    onToast(`Setup updated: ${sg.label}. Press Run backtest to test it.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishSession = (s: ReplaySession) => {
    const pts = s.trades.length ? claimPoints('replay', s.id) : 0;
    const done = { ...s, pointsAwarded: pts > 0 || s.pointsAwarded };
    const next = [done, ...sessions.filter((x) => x.id !== s.id)];
    setSessions(next); saveReplay(next);
    if (pts) onRewardPoints(pts, 'Finished a replay session');
    else onToast(s.trades.length ? 'Session saved' : 'Session saved. Place at least one trade to earn Points.');
  };

  const NAV: [View, string][] = [['home', 'Home'], ['setup', 'Test a playbook'], ['whatif', 'What-if'], ['replay', 'Practice'], ['runs', `Saved runs${runs.length ? ` (${runs.length})` : ''}`]];
  const navOn = (v: View) => view === v || (v === 'setup' && (view === 'running' || view === 'results'));

  const curPb = cur ? pb(cur.settings.playbookId) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Backtest sections" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {NAV.map(([v, label]) => (
            <button key={v} type="button" aria-current={navOn(v) ? 'page' : undefined} disabled={view === 'running' && v !== 'setup'} onClick={() => { if (view !== 'running') setView(v); }}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${navOn(v) ? 'bg-white text-[#5338ec] shadow-sm' : 'text-[#474556] hover:text-[#0b1c30]'}`}>{label}</button>
          ))}
        </nav>
        <span className="ml-auto text-[11px] text-slate-500 tabular-nums flex items-center gap-3">
          <span title="Automated backtests included in your plan this month. What-if and practice are free.">{Math.max(0, limit - usage.used)} of {limit} test runs left{usage.prepaid ? ` + ${usage.prepaid} paid` : ''}</span>
          <span className="flex items-center gap-1" title="Your Syde Credits"><Coins className="w-3.5 h-3.5 text-amber-500" />{sydeCredits.toLocaleString('en-US')}</span>
        </span>
      </div>

      {view === 'home' && (
        <BacktestHome playbooks={playbooks} entries={entries} expected={expected} runs={runs} usage={usage} limit={limit} credits={sydeCredits} sessions={sessions} tz={tz}
          onTest={startSetup} onWhatIf={() => setView('whatif')} onReplay={() => { setReplayEntry(null); setView('replay'); }} onOpenRun={(id) => { const r = runs.find((x) => x.id === id); if (r) { setCur({ settings: r.settings, output: r.output, runId: r.id, name: r.name }); setView('results'); } }} onAllRuns={() => setView('runs')} />
      )}

      {view === 'setup' && (
        <>
          {error && <Banner tone="bad" icon={<XCircle className="w-4 h-4" />}><b>The backtest didn't run.</b> {error}</Banner>}
          <BacktestSetup settings={draft} onChange={setDraft} playbooks={playbooks} entries={entries} brokers={brokers} journalRules={journalRules} tz={tz} onRun={onRun}
            runHint={left > 0 ? `Uses 1 of your ${left} remaining test run${left === 1 ? '' : 's'} this month. Usually takes a few seconds.` : `You've used this month's test runs. Run one more for ${EXTRA_RUN_CREDITS} Syde Credits.`} />
        </>
      )}

      {view === 'running' && (
        <section className="bg-white border border-[#e2e8f0] rounded-2xl p-8 text-center max-w-xl mx-auto" aria-live="polite" aria-busy="true">
          <Loader2 className="w-8 h-8 text-[#5338ec] mx-auto animate-spin motion-reduce:animate-none" aria-hidden />
          <p className="text-base font-bold text-[#0b1c30] mt-3">Testing {draft.playbookId ? pb(draft.playbookId)?.name : 'your rules'} on {draft.symbol}</p>
          <p className="text-xs text-slate-500 mt-1">{draft.timeframe} bars from {draft.from} to {draft.to}, one bar at a time{progress > 0.8 ? '. Now trying small rule changes for the verdict.' : '.'}</p>
          <div className="h-2 rounded-full bg-slate-100 mt-5 overflow-hidden" role="progressbar" aria-label="Backtest progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <div className="h-full bg-[#5338ec] rounded-full transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="text-xs font-semibold text-[#0b1c30] mt-2 tabular-nums">{Math.round(progress * 100)}%</p>
          <button type="button" className={`${btnSecondary} mt-4`} onClick={() => abort.current?.abort()}>Cancel</button>
        </section>
      )}

      {view === 'results' && cur && (
        <BacktestResults settings={cur.settings} output={cur.output} name={cur.name} saved={!!cur.runId} playbook={curPb} entries={entries} expected={curPb ? expected[curPb.id] : undefined} tz={tz}
          onSave={save}
          onEdit={() => { setDraft(deepClone(cur.settings)); setView('setup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onApplySuggestion={applySuggestion}
          onSetExpected={() => { if (curPb) { onSetExpected(expectedFromRun(curPb.id, cur.runId ?? 'unsaved', cur.name, cur.settings.symbol, cur.output)); onToast(`${curPb.name}'s expected results now come from this run`); } }}
          onSendNotes={(text, decision) => { if (!curPb) return; setPlaybooks((prev) => prev.map((x) => (x.id === curPb.id ? { ...x, reviews: [{ id: `rv_${Date.now()}`, date: JOURNAL_TODAY, note: text, decision }, ...(x.reviews || [])] } : x))); onToast(`Added to ${curPb.name}'s review notes`); }}
          onAddToPlan={(text) => {
            if (!curPb) return;
            const s = cur.settings;
            setPlaybooks((prev) => prev.map((x) => (x.id === curPb.id ? { ...x, scenarios: [{ id: `sc_${Date.now()}`, symbol: s.symbol, bias: s.rules.direction === 'short' ? 'short' : 'long', hypothesis: text, trigger: s.rules.entry[0] ? describeCondition(s.rules.entry[0]) : 'Playbook entry rules', validUntil: addDays(JOURNAL_TODAY, 1), status: 'watching', createdAt: JOURNAL_TODAY }, ...(x.scenarios || [])] } : x)));
            onToast(`Added to tomorrow's plan in ${curPb.name}`);
          }}
          onToast={onToast} />
      )}

      {view === 'whatif' && (
        <WhatIfPanel entries={entries} playbooks={playbooks} journalRules={journalRules} tz={tz} onToast={onToast} onOpenTrades={p.onOpenTrades}
          onAddRule={(kind, label, patch) => { if (patch) p.onUpdateRules(patch); else p.onAddChecklist(label); onToast(kind === 'rule' ? 'Added to your trading rules' : 'Added to your pre-trade checklist'); }} />
      )}

      {view === 'replay' && (
        <ReplayPanel entries={entries} tz={tz} initialEntryId={replayEntry} onFinish={finishSession} onToast={onToast} />
      )}

      {view === 'runs' && (
        <SavedRuns runs={runs} playbooks={playbooks} tz={tz} onToast={onToast} onNew={() => startSetup()}
          onOpen={(id) => { const r = runs.find((x) => x.id === id); if (r) { setCur({ settings: r.settings, output: r.output, runId: r.id, name: r.name }); setView('results'); } }}
          onDuplicate={(id) => { const r = runs.find((x) => x.id === id); if (r) { setDraft({ ...deepClone(r.settings), name: `${r.name} (copy)` }); setView('setup'); } }}
          onDelete={(id) => { const next = runs.filter((r) => r.id !== id); setRuns(next); saveRuns(next); onToast('Run deleted'); }} />
      )}

      <Modal open={gate} onClose={() => setGate(false)} title="Monthly test runs used">
        <Sparkles className="w-7 h-7 text-[#5338ec] mb-3" aria-hidden />
        <h3 className="text-lg font-bold text-[#0b1c30]">You've used this month's {limit} test runs</h3>
        <p className="text-sm text-[#474556] mt-1.5">Your plan includes {limit} automated backtests a month. You can still run this one, or practise for free.</p>
        <div className="mt-5 space-y-2">
          <button type="button" className={`${btnPrimary} w-full h-11`} disabled={sydeCredits < EXTRA_RUN_CREDITS} onClick={buyRun}>
            <Coins className="w-4 h-4" /> Spend {EXTRA_RUN_CREDITS} Syde Credits for this run
          </button>
          <p className="text-[11px] text-center text-slate-500 tabular-nums">You have {sydeCredits.toLocaleString('en-US')} credits{sydeCredits < EXTRA_RUN_CREDITS ? `; you need ${EXTRA_RUN_CREDITS - sydeCredits} more` : ''}.</p>
          <button type="button" className={`${btnSecondary} w-full h-10`} onClick={() => { setGate(false); p.onUpgrade(); }}>See plans with more runs</button>
          <button type="button" className="w-full h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5338ec] hover:underline" onClick={() => { setGate(false); setReplayEntry(null); setView('replay'); }}><PlayCircle className="w-4 h-4" /> Use manual replay instead (free)</button>
        </div>
      </Modal>

      {(view === 'whatif' || view === 'replay' || view === 'runs') && (
        <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-[#474556] hover:text-[#5338ec]" onClick={() => setView('home')}><ArrowLeft className="w-3.5 h-3.5" /> Backtest home</button>
      )}
    </div>
  );
};
