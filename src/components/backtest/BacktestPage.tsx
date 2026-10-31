import { StrategyLab } from './StrategyLab';
import { labBenchmark, labSettings, labJobs, loadLabDraft, saveLabDraft } from './labTransfer';
import { resolveSymbol } from '../../backtest/marketData';
import { playbookFingerprint } from '../journal/playbookExecution';
import { JournalHelp, getJournalHelp } from '../journal/JournalHelp';
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
import { defaultSettings, deepClone, describeCondition, defaultCostsFor, JournalRules } from '../../backtest/rules';
import { expectedFromRun } from '../../backtest/gap';
import { userTz } from '../../backtest/format';
import {
  BacktestRun, claimPoints, loadReplay, loadRuns, loadUsage, PlaybookExpectedStats, ReplaySession, saveReplay, saveRuns, saveUsage, summarize, Usage,loadWhatIfs,saveWhatIfs,WhatIfRun,
} from '../../backtest/store';
import { BacktestSettings, JobOutput, Suggestion } from '../../backtest/types';
import { BacktestHome } from './BacktestHome';
import { brokerCosts } from './BacktestSetup';
import { BacktestComparisonResults } from './BacktestComparisonResults';
import type { BacktestComparisonItem } from './BacktestComparisonResults';
import { BacktestResults } from './BacktestResults';
import { SavedRuns } from './SavedRuns';
import { WhatIfPanel } from './WhatIfPanel';
import { ReplayPanel } from './ReplayPanel';
import { DemoReplay } from './DemoReplay';
import { Banner, Modal, btnPrimary, btnSecondary } from './ui';

export type BacktestIntent = { view: 'setup'; symbol?: string; playbookId?: string; comparePlaybookId?: string; benchmarkTradeIds?: string[] } | { view: 'replay'; entryId?: string; playbookId?: string } | { view: 'whatif'; playbookId?: string } | { view: 'home' };
type View = 'home' | 'setup' | 'running' | 'results' | 'comparison' | 'whatif' | 'replay' | 'demo' | 'runs';

interface Props {
  entries: JournalEntry[];
  allEntries: JournalEntry[];
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

const defaultsForPlaybook = (playbook: JournalPlaybook | null, entries: JournalEntry[], journalRules: JournalRules) => {
  const counts = new Map<string, number>();
  entries.filter((e) => playbook && e.strategy === playbook.name).forEach((e) => counts.set(e.symbol, (counts.get(e.symbol) || 0) + 1));
  const mostTraded = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([symbol]) => symbol)[0];
  return defaultSettings({ playbook, journalRules, mostTraded });
};

const withSharedSetup = (settings: BacktestSettings, shared: BacktestSettings): BacktestSettings => ({
  ...settings,
  symbol: shared.symbol,
  from: shared.from,
  to: shared.to,
  risk: { ...settings.risk, startBalance: shared.risk.startBalance, currency: shared.risk.currency },
  costs: { ...shared.costs },
  weekdays: [...shared.weekdays],
  news: shared.news,
  prop: shared.prop ? { ...shared.prop } : null,
});

const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

export const BacktestPage: React.FC<Props> = (p) => {
  const { entries, playbooks, setPlaybooks, journalRules, brokers, userTierLevel, sydeCredits, onSpendCredits, onRewardPoints, onToast, expected, onSetExpected } = p;
  const [savedLab]=useState(loadLabDraft);
  const [view, setView] = useState<View>('home');
  const [whatIfPlaybookId, setWhatIfPlaybookId] = useState('');
  const [draft, setDraft] = useState<BacktestSettings>(() => savedLab?.settings ?? defaultSettings({ journalRules }));
  const [labSymbols,setLabSymbols]=useState<string[]>(savedLab?.symbols ?? []);
  const [labRevision,setLabRevision]=useState(0);
  const [draftsByPlaybook, setDraftsByPlaybook] = useState<Record<string, BacktestSettings>>(savedLab?.byBook ?? {});
  const [selectedPlaybookIds, setSelectedPlaybookIds] = useState<string[]>(savedLab?.bookIds.filter(id=>playbooks.some(b=>b.id===id&&b.status!=='archived')) ?? []);
  const [cur, setCur] = useState<Current | null>(null);
  const [comparisonResults, setComparisonResults] = useState<BacktestComparisonItem[] | null>(null);
  const [benchmarkEntries, setBenchmarkEntries] = useState<JournalEntry[]>(p.allEntries.filter(e=>savedLab?.tradeIds.includes(e.id)));
  const [runs, setRuns] = useState<BacktestRun[]>(() => loadRuns());
  const [whatIfRuns,setWhatIfRuns]=useState<WhatIfRun[]>(()=>loadWhatIfs());
  const [usage, setUsage] = useState<Usage>(() => loadUsage());
  const [sessions, setSessions] = useState<ReplaySession[]>(() => loadReplay());
  const [progress, setProgress] = useState(0);
  const [runStatus, setRunStatus] = useState<{ index: number; total: number; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState(false);
  const [replayEntry, setReplayEntry] = useState<string | null>(null);
  const [replayPlaybook, setReplayPlaybook] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(()=>{if(view==='setup')saveLabDraft({settings:draft,byBook:draftsByPlaybook,bookIds:selectedPlaybookIds,symbols:labSymbols,tradeIds:benchmarkEntries.map(e=>e.id)});},[view,draft,draftsByPlaybook,selectedPlaybookIds,labSymbols,benchmarkEntries]);
  const limit = runLimitFor(userTierLevel);
  const tz = userTz;

  const chooseLabBooks = (ids:string[]) => {
    const books=playbooks.filter(b=>ids.includes(b.id)&&b.status!=='archived');
    const next=Object.fromEntries(books.map(b=>[b.id, draftsByPlaybook[b.id] ?? labSettings(b,entries,journalRules)]));
    setSelectedPlaybookIds(books.map(b=>b.id)); setDraftsByPlaybook(next);
    if(books[0]) { setDraft(next[books[0].id]); if(!labSymbols.length) setLabSymbols([next[books[0].id].symbol]); }
    setComparisonResults(null);
  };
  const chooseLabTrades = (ids:string[], extraIds:string[] = []) => {
    const context=labBenchmark(p.allEntries,ids,playbooks);
    context.books=[...new Map([...context.books,...playbooks.filter(b=>extraIds.includes(b.id)&&b.status!=='archived')].map(b=>[b.id,b])).values()];
    const next=Object.fromEntries(context.books.map(b=>{
      const st=labSettings(b,context.trades,journalRules);
      if(context.from)st.from=context.from;if(context.to)st.to=context.to;
      if(context.currencies.length===1&&['USD','EUR','GBP'].includes(context.currencies[0]))st.risk.currency=context.currencies[0] as typeof st.risk.currency;
      return [b.id,st];
    }));
    setBenchmarkEntries(context.trades);setSelectedPlaybookIds(context.books.map(b=>b.id));setDraftsByPlaybook(next);setLabSymbols(context.symbols);
    if(context.books[0])setDraft(next[context.books[0].id]);
    setComparisonResults(null);setError(null);
  };
  const changeSelection = (ids: string[]) => {
    const activeIds = [...new Set(ids)].filter((id) => playbooks.some((x) => x.id === id && x.status !== 'archived'));
    setSelectedPlaybookIds(activeIds);
    setComparisonResults(null);
    if (!activeIds.length) {
      setDraft({ ...draft, playbookId: null });
      return;
    }
    const nextDrafts = { ...draftsByPlaybook };
    activeIds.forEach((id) => {
      const book = playbooks.find((x) => x.id === id && x.status !== 'archived');
      if (!book) return;
      const current = id === draft.playbookId ? draft : nextDrafts[id] ?? defaultsForPlaybook(book, entries, journalRules);
      nextDrafts[id] = withSharedSetup(current, draft);
    });
    const primary = nextDrafts[activeIds[0]];
    setDraftsByPlaybook(nextDrafts);
    setDraft(primary);
  };

  const updateDraft = (next: BacktestSettings) => {
    if(next.symbol!==draft.symbol)setLabSymbols([next.symbol]);
    setDraft(next);
    const nextDrafts = { ...draftsByPlaybook };
    selectedPlaybookIds.forEach((id) => {
      const current = nextDrafts[id];
      if (id === next.playbookId) nextDrafts[id] = next;
      else if (current) nextDrafts[id] = withSharedSetup(current, next);
    });
    setDraftsByPlaybook(nextDrafts);
  };

  const prepareSetup = (settings: BacktestSettings) => {
    const book = playbooks.find((x) => x.id === settings.playbookId && x.status !== 'archived') || null;
    const prepared = { ...settings, playbookId: book?.id ?? null };
    setDraft(prepared);
    setLabSymbols([prepared.symbol]);setLabRevision(v=>v+1);
    setSelectedPlaybookIds(book ? [book.id] : []);
    setDraftsByPlaybook(book ? { [book.id]: prepared } : {});
    setComparisonResults(null);
    setError(null);
    setView('setup');
  };

  const startSetup = (playbookId?: string, benchmarkTradeIds?: string[], comparePlaybookId?: string, symbol?: string) => {
    if(benchmarkTradeIds?.length) {
      chooseLabTrades(benchmarkTradeIds,[playbookId,comparePlaybookId].filter((id):id is string=>!!id));setLabRevision(v=>v+1);setView('setup');return;
    }
    const requested=playbooks.find(b=>b.id===playbookId&&b.status!=='archived');
    const books=[requested,playbooks.find(b=>b.id===comparePlaybookId&&b.id!==requested?.id&&b.status!=='archived')].filter((b):b is JournalPlaybook=>!!b);
    const next=Object.fromEntries(books.map(book=>[book.id,labSettings(book,entries,journalRules)]));
    if(symbol&&requested){const st=next[requested.id];st.symbol=resolveSymbol(symbol)??symbol;st.costs={...st.costs,...defaultCostsFor(st.symbol)};}
    const first=books[0]?next[books[0].id]:defaultSettings({journalRules});
    setBenchmarkEntries([]);setDraft(first);setSelectedPlaybookIds(books.map(b=>b.id));setDraftsByPlaybook(next);
    setLabSymbols(books.length?[first.symbol]:[]);setLabRevision(v=>v+1);
    setComparisonResults(null);setError(null);setView('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deep links from other parts of the journal (playbook page, trade log, insights).
  useEffect(() => {
    if (!p.intent) return;
    const it = p.intent;
    if (it.view === 'setup') startSetup(it.playbookId, it.benchmarkTradeIds, it.comparePlaybookId, it.symbol);
    else if (it.view === 'replay') { setBenchmarkEntries([]); setReplayEntry(it.entryId ?? null); setReplayPlaybook(it.playbookId ?? null); setView('replay'); }
    else if (it.view === 'whatif') { setWhatIfPlaybookId(it.playbookId ?? ''); setBenchmarkEntries([]); setView('whatif'); }
    else { setBenchmarkEntries([]); setView(it.view); }
    p.onIntentDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.intent]);

  const setU = (u: Usage) => { setUsage(u); saveUsage(u); };
  const left = Math.max(0, limit - usage.used) + usage.prepaid;

  const start = () => {
    const settingsList = labJobs(selectedPlaybookIds.flatMap(id=>draftsByPlaybook[id]?[draftsByPlaybook[id]]:[]),labSymbols);
    if (!settingsList.length) return;
    setError(null);
    setProgress(0);
    setRunStatus({ index: 1, total: settingsList.length, name: settingsList[0].name });
    setComparisonResults(null);
    const ctl = new AbortController();
    abort.current = ctl;
    setView('running');
    let activeSettings = settingsList[0];
    void (async () => {
      try {
        const completed: BacktestComparisonItem[] = [];
        for (let i = 0; i < settingsList.length; i++) {
          activeSettings = settingsList[i];
          setRunStatus({ index: i + 1, total: settingsList.length, name: activeSettings.name });
          const output = await runBacktest(activeSettings, {
            onProgress: (value) => setProgress((i + value) / settingsList.length),
            signal: ctl.signal,
          });
          completed.push({ settings: activeSettings, output });
        }
        const now = new Date().toISOString();
        const saved = completed.map((item, index): BacktestRun => ({
          id: `run_${Date.now().toString(36)}_${index}`, name: item.settings.name, mode: 'automated', status: 'done',
          sourceTradeIds: benchmarkEntries.map(e=>e.id), dataSource:'generated', timezone:tz,
          playbookId: item.settings.playbookId, symbol: item.settings.symbol, timeframe: item.settings.timeframe,
          from: item.settings.from, to: item.settings.to, createdAt: now, lastRun: now, settings: item.settings,
          summary: summarize(item.output), output: item.output,
          playbookFingerprint: playbooks.find(book => book.id === item.settings.playbookId) ? playbookFingerprint(playbooks.find(book => book.id === item.settings.playbookId)!) : undefined,
        }));
        saved.forEach(run => {
          if (run.playbookId && run.summary.trades > 0) onSetExpected(expectedFromRun(run.playbookId, run.id, run.name, run.symbol, run.output));
          const points = claimPoints('backtest', run.id);
          if (points) onRewardPoints(points, 'Saved a backtest');
        });
        const nextRuns = [...saved, ...loadRuns()].slice(0, 30);
        setRuns(nextRuns);
        if (!saveRuns(nextRuns)) onToast('Test finished, but browser storage could not save the results.');
        const u = loadUsage();
        setU(u.used < limit ? { ...u, used: u.used + 1 } : { ...u, prepaid: Math.max(0, u.prepaid - 1) });
        if (completed.length === 1) {
          const [item] = completed;
          setCur({ settings: item.settings, output: item.output, runId: saved[0].id, name: item.settings.name });
          setView('results');
        } else {
          setComparisonResults(completed);
          setView('comparison');
        }
        setRunStatus(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        setRunStatus(null);
        if (error instanceof CancelledError || error.name === 'CancelledError') { onToast('Backtest cancelled. It did not count toward your runs.'); setView('setup'); return; }
        setError(`Could not finish ${activeSettings.name}: ${error.message || 'The backtest could not run.'}`);
        setView('setup');
      }
    })();
  };

  const onRun = () => { if (left > 0) start(); else setGate(true); };

  const buyRun = () => {
    if (!onSpendCredits(EXTRA_RUN_CREDITS, 'Extra backtest run')) return;
    const u = loadUsage();
    setU({ ...u, extraPaid: u.extraPaid + 1, prepaid: u.prepaid + 1 });
    setGate(false);
    setTimeout(start, 0);
  };

  const editComparisonInstrument = (symbol: string) => {
    const items = comparisonResults;
    const first = items?.[0];
    if (!first) return;
    const broker = brokers.find((candidate) => candidate.id === first.settings.costs.brokerId);
    const shared = {
      ...first.settings,
      symbol,
      costs: { ...first.settings.costs, ...(broker ? brokerCosts(broker, symbol) : defaultCostsFor(symbol)) },
    };
    const nextDrafts = { ...draftsByPlaybook };
    const ids = [...new Set(items.map(({ settings }) => settings.playbookId).filter((id): id is string => !!id))];
    setLabSymbols([symbol]);
    items.forEach(({ settings }) => {
      if (settings.playbookId) nextDrafts[settings.playbookId] = withSharedSetup(settings, shared);
    });
    setSelectedPlaybookIds(ids);
    setDraftsByPlaybook(nextDrafts);
    setDraft(nextDrafts[ids[0]] ?? withSharedSetup(first.settings, shared));
    setError(null);
    setView('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onToast(`${symbol} selected. Review the setup and run the comparison to generate new results.`);
  };

  const pb = (id: string | null) => playbooks.find((x) => x.id === id) || null;

  const save = () => {
    if (!cur) return;
    const now = new Date().toISOString();
    const id = cur.runId ?? `run_${Date.now().toString(36)}`;
    const run: BacktestRun = {
      playbookFingerprint: playbooks.find(book => book.id === cur.settings.playbookId) ? playbookFingerprint(playbooks.find(book => book.id === cur.settings.playbookId)!) : undefined,
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
    prepareSetup(next);
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

  const savedRunCount=runs.length+whatIfRuns.length;
  const NAV: [View, string, string][] = [
    ['home', 'Home', 'Backtest'],
    ['setup', 'Strategy Lab', 'Strategy Lab'],
    ['whatif', 'What-if', 'What-if scenario lab'],
    ['replay', 'Practice', 'Practice'],
    ['demo', 'Demo replay', 'Playback'],
    ['runs', `Saved runs${savedRunCount ? ` (${savedRunCount})` : ''}`, 'Saved runs'],
  ];
  const navOn = (v: View) => view === v || (v === 'setup' && (view === 'running' || view === 'results' || view === 'comparison'));

  const curPb = cur ? pb(cur.settings.playbookId) : null;
  const setupRunHint = left > 0
    ? selectedPlaybookIds.length * labSymbols.length > 1 ? `Uses 1 test run for this ${selectedPlaybookIds.length * labSymbols.length}-result comparison. Usually takes a few seconds per playbook.` : `Uses 1 of your ${left} remaining test run${left === 1 ? '' : 's'} this month. Usually takes a few seconds.`
    : `You've used this month's test runs. Run this ${selectedPlaybookIds.length > 1 ? 'comparison' : 'test'} for ${EXTRA_RUN_CREDITS} Syde Credits.`;

  return (
    <div className="mt-5 space-y-5">
      <div className="w-fit max-w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-2 sm:p-2.5">
        <nav aria-label="Backtest sections" className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-xl bg-slate-50 p-1 scrollbar-none">
          {NAV.map(([v, label, helpTopic]) => {
            const active = navOn(v);
            return (
              <div key={v} className={`relative shrink-0 rounded-lg border transition-colors ${active ? 'border-[#D8D0FF] bg-[#F1EDFF] text-[#5338ec] shadow-xs' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white'}`}>
                <button type="button" aria-current={active ? 'page' : undefined} disabled={view === 'running' && v !== 'setup'} onClick={() => { if (view === 'running') return; if(v==='runs')setWhatIfRuns(loadWhatIfs()); if (v === 'setup') { if (view !== 'setup') { setError(null);setLabRevision(v=>v+1);setView('setup'); } } else setView(v); }}
                  className="min-h-10 whitespace-nowrap rounded-lg pl-3 pr-10 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5338ec] disabled:cursor-not-allowed disabled:opacity-40 sm:text-[13px]">{label}</button>
                <span className="absolute right-1 top-1/2 -translate-y-1/2"><JournalHelp label={label} text={getJournalHelp(helpTopic)} /></span>
              </div>
            );
          })}
        </nav>
      </div>

      {view === 'home' && (
        <BacktestHome playbooks={playbooks} entries={entries} expected={expected} runs={runs} usage={usage} limit={limit} credits={sydeCredits} sessions={sessions} tz={tz}
          onTest={startSetup} onWhatIf={() => setView('whatif')} onReplay={() => { setBenchmarkEntries([]); setReplayEntry(null); setView('replay'); }} onOpenRun={(id) => { const r = runs.find((x) => x.id === id); if (r) { setBenchmarkEntries([]); setComparisonResults(null); setCur({ settings: r.settings, output: r.output, runId: r.id, name: r.name }); setView('results'); } }} onAllRuns={() => setView('runs')} />
      )}

      {view === 'setup' && (
        <>
          {error && <Banner tone="bad" icon={<XCircle className="w-4 h-4" />}><b>The backtest didn't run.</b> {error}</Banner>}
          <StrategyLab key={labRevision} allEntries={p.allEntries} runs={runs} symbols={labSymbols} onSymbols={setLabSymbols}
            onBooks={chooseLabBooks} onTrades={chooseLabTrades}
            onPractice={(entryId,playbookId)=>{setReplayEntry(entryId??null);setReplayPlaybook(playbookId??null);setView('replay');}}
            onOpenRun={r=>{setBenchmarkEntries(p.allEntries.filter(e=>r.sourceTradeIds?.includes(e.id)));setComparisonResults(null);setCur({settings:r.settings,output:r.output,runId:r.id,name:r.name});setView('results');}}
            onRerun={r=>{setBenchmarkEntries(p.allEntries.filter(e=>r.sourceTradeIds?.includes(e.id)));prepareSetup(deepClone(r.settings));}}
            setup={{settings:draft,onChange:updateDraft,playbooks,selectedPlaybookIds,settingsByPlaybook:draftsByPlaybook,onSelectionChange:changeSelection,entries,benchmarkEntries,onClearBenchmark:()=>setBenchmarkEntries([]),brokers,journalRules,tz,onRun,onOpenTrades:p.onOpenTrades,runHint:setupRunHint}} />
        </>
      )}

      {view === 'running' && (
        <section className="bg-white border border-[#e2e8f0] rounded-2xl p-8 text-center max-w-xl mx-auto" aria-live="polite" aria-busy="true">
          <Loader2 className="w-8 h-8 text-[#5338ec] mx-auto animate-spin motion-reduce:animate-none" aria-hidden />
          <p className="text-base font-bold text-[#0b1c30] mt-3">{runStatus && runStatus.total > 1 ? `Running ${runStatus.index} of ${runStatus.total}: ${runStatus.name}` : `Testing ${runStatus?.name ?? 'your playbook'} on ${draft.symbol}`}</p>
          <p className="text-xs text-slate-500 mt-1">{draft.from} to {draft.to}, one bar at a time. Each playbook keeps its own rules, timeframe and session{progress > 0.8 ? '; now checking small rule changes for the verdict.' : '.'}</p>
          <div className="h-2 rounded-full bg-slate-100 mt-5 overflow-hidden" role="progressbar" aria-label="Backtest progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <div className="h-full bg-[#5338ec] rounded-full transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="text-xs font-semibold text-[#0b1c30] mt-2 tabular-nums">{Math.round(progress * 100)}%</p>
          <button type="button" className={`${btnSecondary} mt-4`} onClick={() => abort.current?.abort()}>Cancel</button>
        </section>
      )}

      {view === 'results' && cur && (
        <BacktestResults settings={cur.settings} output={cur.output} name={cur.name} saved={!!cur.runId} playbook={curPb} entries={entries} benchmarkEntries={benchmarkEntries} expected={curPb ? expected[curPb.id] : undefined} tz={tz}
          onOpenTrades={p.onOpenTrades}
          onBackToComparison={comparisonResults?.length ? () => setView('comparison') : undefined}
          onSave={save}
          onEdit={() => { prepareSetup(deepClone(cur.settings)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

      {view === 'comparison' && comparisonResults && (
        <BacktestComparisonResults items={comparisonResults} playbooks={playbooks} entries={entries} benchmarkEntries={benchmarkEntries} tz={tz} onOpenTrades={p.onOpenTrades}
          onEditSetup={() => setView('setup')}
          onChangeInstrument={editComparisonInstrument}
          onViewResult={(item) => { const saved=runs.find(r=>r.playbookId===item.settings.playbookId&&r.symbol===item.settings.symbol&&r.from===item.settings.from&&r.to===item.settings.to&&r.output===item.output);setCur({ settings: item.settings, output: item.output, runId: saved?.id ?? null, name: item.settings.name }); setView('results'); }} />
      )}

      {view === 'whatif' && (
        <WhatIfPanel key={whatIfPlaybookId || 'custom'} initialPlaybookId={whatIfPlaybookId} entries={entries} allEntries={p.allEntries} playbooks={playbooks} journalRules={journalRules} tz={tz} onToast={onToast} onOpenTrades={p.onOpenTrades}
          onSaveScenario={run=>{const next=[run,...loadWhatIfs()].slice(0,50);if(!saveWhatIfs(next))return false;setWhatIfRuns(next);return true;}}
          onViewSaved={()=>{setWhatIfRuns(loadWhatIfs());setView('runs');}}
          onAddRule={(kind, label, patch) => { if (patch) p.onUpdateRules(patch); else p.onAddChecklist(label); onToast(kind === 'rule' ? 'Added to your trading rules' : 'Added to your pre-trade checklist'); }} />
      )}

      {view === 'replay' && (
        <ReplayPanel entries={p.allEntries} playbooks={playbooks} sessions={sessions} tz={tz} initialEntryId={replayEntry} initialPlaybookId={replayPlaybook} onFinish={finishSession} onToast={onToast} />
      )}

      {view === 'demo' && <DemoReplay entries={p.allEntries} playbooks={playbooks}/>}

      {view === 'runs' && (
        <SavedRuns runs={runs} whatIfRuns={whatIfRuns} onDeleteWhatIf={id=>{const next=whatIfRuns.filter(r=>r.id!==id);if(saveWhatIfs(next)){setWhatIfRuns(next);onToast('Saved What-if scenario deleted');}else onToast('Could not delete this saved scenario. Browser storage is unavailable.');}} playbooks={playbooks} tz={tz} onToast={onToast} onNew={() => startSetup()}
          onOpen={(id) => { const r = runs.find((x) => x.id === id); if (r) { setBenchmarkEntries([]); setComparisonResults(null); setCur({ settings: r.settings, output: r.output, runId: r.id, name: r.name }); setView('results'); } }}
          onDuplicate={(id) => { const r = runs.find((x) => x.id === id); if (r) { setBenchmarkEntries([]); prepareSetup({ ...deepClone(r.settings), name: `${r.name} (copy)` }); } }}
          onDelete={(id) => { const next = runs.filter((r) => r.id !== id); setRuns(next); saveRuns(next); onToast('Run deleted'); }} />
      )}

      <Modal open={gate} onClose={() => setGate(false)} title="Monthly test runs used">
        <Sparkles className="w-7 h-7 text-[#5338ec] mb-3" aria-hidden />
        <h3 className="text-lg font-bold text-[#0b1c30]">You've used this month's {limit} test runs</h3>
        <p className="text-sm text-[#474556] mt-1.5">Your plan includes {limit} automated backtests a month. This {selectedPlaybookIds.length > 1 ? 'comparison' : 'playbook test'} counts as one run, or you can practise for free.</p>
        <div className="mt-5 space-y-2">
          <button type="button" className={`${btnPrimary} w-full h-11`} disabled={sydeCredits < EXTRA_RUN_CREDITS} onClick={buyRun}>
          <Coins className="w-4 h-4" /> Spend {EXTRA_RUN_CREDITS} Syde Credits for this {selectedPlaybookIds.length > 1 ? 'comparison' : 'run'}
          </button>
          <p className="text-[11px] text-center text-slate-500 tabular-nums">You have {sydeCredits.toLocaleString('en-US')} credits{sydeCredits < EXTRA_RUN_CREDITS ? `; you need ${EXTRA_RUN_CREDITS - sydeCredits} more` : ''}.</p>
          <button type="button" className={`${btnSecondary} w-full h-10`} onClick={() => { setGate(false); p.onUpgrade(); }}>See plans with more runs</button>
          <button type="button" className="w-full h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5338ec] hover:underline" onClick={() => { setGate(false); setReplayEntry(null); setView('replay'); }}><PlayCircle className="w-4 h-4" /> Use manual replay instead (free)</button>
        </div>
      </Modal>

      {(view === 'whatif' || view === 'replay' || view === 'demo' || view === 'runs') && (
        <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-[#474556] hover:text-[#5338ec]" onClick={() => setView('home')}><ArrowLeft className="w-3.5 h-3.5" /> Backtest home</button>
      )}
    </div>
  );
};
