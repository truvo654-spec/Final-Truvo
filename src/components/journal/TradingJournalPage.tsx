import { JournalHelp, getJournalHelp } from './JournalHelp';
import { AiJournalSummary } from './AiJournalSummary';
import { useMoney, formatMoney, JournalCurrency } from './JournalCurrency';
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Target, TrendingUp, ShieldCheck, Lock, Trash2, BookOpen, ChevronRight, AlertTriangle, PlayCircle, X } from 'lucide-react';
import { Broker, JournalEntry, JournalChecklistItem, JournalWeeklyReview, UserProfile } from '../../types';
import {
  JOURNAL_ENTRIES,
  hydrateDemoCfdEvidence,
  JOURNAL_REVIEWS,
  DEFAULT_CHECKLIST,
  JOURNAL_TODAY,
  JOURNAL_STRATEGIES,
  JOURNAL_EMOTIONS,
} from '../../data/journalData';
import { FolderTabs, FolderTabItem } from '../common/FolderTabs';
import { JournalEntryWizard } from './JournalEntryWizard';

import { JournalEntryDetail } from './JournalEntryDetail';
import { JournalCalendar } from './JournalCalendar';
const JournalTradeLog = lazy(() => import('./JournalTradeLog').then(module => ({ default: module.JournalTradeLog })));
import { JournalInsights } from './JournalInsights';
import { JournalAICoach, CoachOverviewCard } from './JournalAICoach';
import { createCoachDraft, type CoachScenario } from './aiCoach';
import { JournalPlaybooks } from './JournalPlaybooks';
import { DEFAULT_PLAYBOOKS, JournalPlaybook } from '../../data/journalPlaybooks';
import { JournalCumulativeChart } from './JournalCumulativeChart';
import { JournalOverviewAnalytics } from './overview/JournalOverviewAnalytics';
import { DisciplineCard, RulesMonitor, TiltMonitor } from './JournalMonitors';
import { CashbackMode, PnlMode, RangeMode, JOURNAL_MARKET_TYPES, UNASSIGNED, addMonth, brokerColor, computeKpis, entryCashback, entryPoints, entryValue, rangeBounds, shortDate } from './journalOverview';
import { BacktestPage, BacktestIntent } from '../backtest/BacktestPage';
import { StrategyHealthCard } from '../backtest/PlaybookBacktestPanel';
import { loadExpected, saveExpected, PlaybookExpectedStats } from '../../backtest/store';
import { TradingStatusBadge, ReviewStateBadge, reviewStateOf, tradingStatusOf } from './tradingStatus';
import { currencyOf, eligible, incompleteFields, metrics, netOf, resultOf, realizedR } from './journalMath';
import { journalSandbox, useJournalState } from './journalStorage';
import { JournalReviewDrawer } from './JournalReviewDrawer';
import { JournalDateRange } from './JournalDateRange';
import { JournalDayReview } from './JournalDayReview';
import { JournalReplayAvailability } from './JournalReplayAvailability';
import { isJournalTab, type JournalTab } from './journalViews';
import { useJournalCards } from './useJournalCards';
import { JournalAddCard, JournalLevelSwitch, JournalWorkspaceCard } from './JournalCards';
import { useJournalPopover } from './useJournalPopover';
import { browserTimeZone, validCurrency, validTimeZone } from './insights/insightsData';
import { InsightsLoading } from './insights/InsightsShared';
const SimpleInsights = lazy(() => import('./insights/SimpleInsights').then(module => ({ default: module.SimpleInsights })));

interface TradingJournalPageProps {
  reportingProfile?: Pick<UserProfile, 'timeZone' | 'preferredCurrency'>;
  onOpenProfile?: () => void;
  userTierLevel: number;
  isLoggedIn: boolean;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
  brokers?: Broker[];
  onConnectBroker?: (broker: Broker) => void;
  sydeCredits?: number;
  onSpendCredits?: (amount: number, reason: string) => boolean;
  onRewardPoints?: (points: number, reason: string) => void;
}

const OUTCOME_STYLE: Record<JournalEntry['outcome'], string> = {
  win: 'bg-emerald-50 text-emerald-600',
  loss: 'bg-rose-50 text-rose-600',
  breakeven: 'bg-slate-100 text-slate-500',
  open: 'bg-amber-50 text-amber-600',
};

const money = (n: number) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toFixed(2)}`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function isoDaysAgo(n: number): string {
  const d = new Date(`${JOURNAL_TODAY}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FILTER_HELP: Record<string, string> = {
  Playbook: 'Include or exclude journal entries by their recorded playbook or strategy.',
  'Market type': 'Include or exclude entries by asset class, such as Forex, Crypto or Indices.',
  'Net outcome': 'Include or exclude entries by realized outcome. Open and unknown results remain separate from closed results.',
  'Trading status': 'Include or exclude entries by lifecycle: planned, open or closed.',
  Broker: 'Include or exclude brokers. The cumulative chart uses the selected brokers for its totals and broker lines.',
};

export const TradingJournalPage: React.FC<TradingJournalPageProps> = ({
  reportingProfile,
  onOpenProfile,
  userTierLevel,
  isLoggedIn,
  onUpgradePrompt,
  onShowToast,
  brokers,
  onConnectBroker,
  sydeCredits = 0,
  onSpendCredits,
  onRewardPoints,
}) => {
  const [storedTab, setStoredTab] = useJournalState<JournalTab>('tab', 'overview');
  const [tab, setTabState] = useState<JournalTab>(() => {
    const queryTab = new URLSearchParams(window.location.search).get('journalTab');
    return isJournalTab(queryTab) ? queryTab : storedTab;
  });
  const setTab = useCallback((next: JournalTab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    url.searchParams.set('journalTab', next);
    url.searchParams.delete('journalTrade');
    window.history.replaceState(window.history.state, '', url);
  }, []);
  useEffect(() => { setStoredTab(tab); }, [tab, setStoredTab]);
  useEffect(() => {
    const pop = () => { const next = new URLSearchParams(window.location.search).get('journalTab'); setTabState(isJournalTab(next) ? next : 'overview'); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const view = useJournalCards(tab);
  const originalView = tab === 'entries' || (view.baseLevel === 'advanced' && view.level !== 'custom');
  const simpleInsights = tab === 'insights' && view.baseLevel !== 'advanced';
  const coachToday = new Date().toISOString().slice(0, 10);
  const [entries, setEntries, storageFailed] = useJournalState<JournalEntry[]>('entries', JOURNAL_ENTRIES);
  useEffect(() => { setEntries(current => hydrateDemoCfdEvidence(current)); }, [setEntries]);
  const [reviewCohort, setReviewCohort] = useState<string[]>([]);
  const [dailyNotes, setDailyNotes] = useJournalState<Record<string,string>>('daily-notes', {});
  const [currency, setCurrency] = useJournalState('currency', 'USD');
  const reporting = useMemo(() => {
    const warnings: string[] = [];
    const preferredZone = reportingProfile?.timeZone || browserTimeZone();
    const preferredCurrency = reportingProfile?.preferredCurrency || currency;
    const reportCurrency = validCurrency(preferredCurrency) ? preferredCurrency : validCurrency(currency) ? currency : 'USD';
    if (!validTimeZone(preferredZone)) warnings.push('Your profile timezone is invalid; the browser timezone is being used.');
    if (!validCurrency(preferredCurrency)) warnings.push(`Your profile reporting currency is invalid; ${reportCurrency} is being used.`);
    return { settings: { timeZone: validTimeZone(preferredZone) ? preferredZone : browserTimeZone(),
      currency: reportCurrency,
      locale: Intl.DateTimeFormat().resolvedOptions().locale }, warnings };
  }, [reportingProfile?.timeZone, reportingProfile?.preferredCurrency, currency]);
  const [account, setAccount] = useJournalState('account', 'all');
  const money = (n:number,dp=2)=>formatMoney(n,currency,dp);
  const openEntry = (id: string, cohort?: string[]) => { setReviewCohort(cohort || scoped.map(e=>e.id)); setSelectedId(id); };
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewQueueOpen, setReviewQueueOpen] = useState(false);
  const [logPreset, setLogPreset] = useState<{ ids: string[]; label: string } | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const [checklist, setChecklist] = useJournalState<JournalChecklistItem[]>('checklist', DEFAULT_CHECKLIST);
  const [newItem, setNewItem] = useState('');
  const [playbooks, setPlaybooks, playbookStorageFailed] = useJournalState<JournalPlaybook[]>('playbooks', DEFAULT_PLAYBOOKS);
  const setVersionedPlaybooks:React.Dispatch<React.SetStateAction<JournalPlaybook[]>> = update=>setPlaybooks(previous=>{
    const next=typeof update==='function'?update(previous):update;
    return next.map(pb=>{const old=previous.find(p=>p.id===pb.id);if(!old || JSON.stringify(old.rules)===JSON.stringify(pb.rules))return pb;
      return {...pb,rulesEffectiveAt:new Date().toISOString(),ruleHistory:[...(old.ruleHistory || []),{version:(old.ruleHistory?.length || 0)+1,effectiveAt:old.rulesEffectiveAt || null,rules:old.rules}]};});
  });
  const [recordings, setRecordings] = useState<Record<string, string>>({}); // entry id → replay video (object URL)
  const [rules, setRules] = useJournalState('TradingJournalPage-rules', { maxRisk: 1, maxDailyLoss: 3, maxTrades: 3, stopAfterLosses: 2 });
  const [expected, setExpected] = useState<Record<string, PlaybookExpectedStats>>(() => loadExpected());
  const [btIntent, setBtIntent] = useState<BacktestIntent | null>(null);
  const goBacktest = (intent: BacktestIntent) => { setBtIntent(intent); setSelectedId(null); setTab('backtest'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const useCoachScenario = (scenario: CoachScenario, action: 'save' | 'practice' | 'test') => {
    const existing = playbooks.find(p => p.status === 'testing' && p.coachOrigin?.scenarioId === scenario.id && p.coachOrigin?.sourcePlaybookId === scenario.sourcePlaybookId && p.thesis === scenario.draft.thesis && JSON.stringify(p.rules) === JSON.stringify(scenario.draft.rules));
    const draft = existing || createCoachDraft(scenario, crypto.randomUUID(), playbooks.map(p => p.name));
    if (!existing) setVersionedPlaybooks(previous => [...previous, draft]);
    onShowToast(existing ? `Using saved experiment: ${draft.name}` : `Testing draft saved: ${draft.name}`);
    if (action === 'practice') goBacktest({ view: 'replay', playbookId: draft.id });
    if (action === 'test') goBacktest({ view: 'setup', playbookId: draft.id, comparePlaybookId: scenario.sourcePlaybookId, benchmarkTradeIds: scenario.evidenceIds });
  };
  const setExpectedFor = (st: PlaybookExpectedStats) => setExpected((m) => { const next = { ...m, [st.playbookId]: st }; saveExpected(next); return next; });


  const [reviews, setReviews] = useJournalState<JournalWeeklyReview[]>('weekly', JOURNAL_REVIEWS);
  const [rvFollowUp, setRvFollowUp] = useState('');
  const [rvBest, setRvBest] = useState('');
  const [rvLesson, setRvLesson] = useState('');
  const [rvFocus, setRvFocus] = useState('');

  const hasAdvanced = isLoggedIn && userTierLevel >= 3;

  // Overview toolbar + calendar state
  const [pnlMode, setPnlMode] = useJournalState<PnlMode>('TradingJournalPage-pnlMode', 'net');
  const [calMonth, setCalMonth] = useJournalState('TradingJournalPage-calMonth', JOURNAL_TODAY.slice(0, 7));
  const [rangeMode, setRangeMode] = useJournalState<RangeMode>('range', 'month');
  const [customRange, setCustomRange] = useJournalState('TradingJournalPage-customRange', { from: `${JOURNAL_TODAY.slice(0, 7)}-01`, to: JOURNAL_TODAY });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayReviewOpen, setDayReviewOpen] = useState(false);
  const [apiReplayId, setApiReplayId] = useState<string | null>(null);
  const openDay = (date: string) => { setSelectedDay(date); setDayReviewOpen(true); };
  const [openMenu, setOpenMenu] = useState<null | 'strategy' | 'asset' | 'outcome' | 'broker' | 'tradingStatus' | 'show' | 'basis'>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const scopeRef = useJournalPopover(!!openMenu || filtersOpen, () => { setOpenMenu(null); setFiltersOpen(false); });
  useEffect(() => {
    if (!openMenu) return;
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('[data-journal-filter]')?.getAttribute('data-journal-filter') !== openMenu) setOpenMenu(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [openMenu]);
  const [strategyOff, setStrategyOff] = useJournalState<string[]>('TradingJournalPage-strategyOff', []);
  const [assetOff, setAssetOff] = useJournalState<string[]>('TradingJournalPage-assetOff', []);
  const [outcomeOff, setOutcomeOff] = useJournalState<string[]>('TradingJournalPage-outcomeOff', []);
  const [brokerOff, setBrokerOff] = useJournalState<string[]>('TradingJournalPage-brokerOff', []);
  const [tradingStatusOff, setTradingStatusOff] = useJournalState<string[]>('TradingJournalPage-tradingStatusOff', []);

  const [cbMode, setCbMode] = useJournalState<CashbackMode>('TradingJournalPage-cbMode', 'off');

  const brokerMap = useMemo(() => new Map((brokers || []).map((b) => [b.id, b] as const)), [brokers]);
  const brokerOrder = useMemo(() => (brokers || []).map((b) => b.id), [brokers]);
  const brokerName = (id: string) => (id === UNASSIGNED ? 'Unassigned' : brokerMap.get(id)?.name || id);
  const colorOf = (id: string) => brokerColor(id, brokerOrder);
  const valueOf = useMemo(() => (e: JournalEntry) => entryValue(e, pnlMode, cbMode, brokerMap), [pnlMode, cbMode, brokerMap]);
  const valueLabel = `${pnlMode}${cbMode === 'include' ? ' + cashback' : ''}`;
  const toggleBroker = (id: string) => { setBrokerOff((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); setSelectedDay(null); };

  const [rangeFrom, rangeTo] = rangeBounds(rangeMode, calMonth, JOURNAL_TODAY, customRange);
  // entries after the Filters panel (used by the calendar, which shows every day of its month)
  const calEntries = useMemo(
    () =>
      entries.filter(
        (e) =>
          currencyOf(e) === currency && (account === 'all' || (e.accountId || 'legacy-demo') === account) &&
          !strategyOff.includes(e.strategy) &&
          !assetOff.includes(e.assetClass) &&
          !outcomeOff.includes(resultOf(e)) &&
          !tradingStatusOff.includes(tradingStatusOf(e)) &&
          !brokerOff.includes(e.brokerId || UNASSIGNED)
      ),
    [entries, currency, account, pnlMode, strategyOff, assetOff, outcomeOff, tradingStatusOff, brokerOff]
  );
  // ...and additionally inside the chosen date range (used by the KPI cards and recent list)
  const scoped = useMemo(() => calEntries.filter((e) => e.date >= rangeFrom && e.date <= rangeTo), [calEntries, rangeFrom, rangeTo]);
  const pendingEntries = useMemo(() => scoped.filter(e => reviewStateOf(e) !== 'complete'), [scoped]);
  const [pendingMarket,setPendingMarket]=useState('all');
  const [pendingSymbol,setPendingSymbol]=useState('all');
  const pendingSymbols=useMemo(()=>[...new Set(pendingEntries.filter(e=>pendingMarket==='all'||e.assetClass===pendingMarket).map(e=>e.symbol))].sort(),[pendingEntries,pendingMarket]);
  useEffect(()=>{if(pendingSymbol!=='all'&&!pendingSymbols.includes(pendingSymbol))setPendingSymbol('all');},[pendingSymbols,pendingSymbol]);
  const filteredPending=useMemo(()=>pendingEntries.filter(e=>(pendingMarket==='all'||e.assetClass===pendingMarket)&&(pendingSymbol==='all'||e.symbol===pendingSymbol)),[pendingEntries,pendingMarket,pendingSymbol]);
  const kpi = useMemo(() => computeKpis(scoped, pnlMode), [scoped, pnlMode]);
  const cashbackTotal = useMemo(() => Math.round(scoped.reduce((a, e) => a + entryCashback(e, brokerMap), 0) * 100) / 100, [scoped, brokerMap]);
  const shownTotal = useMemo(() => Math.round(scoped.reduce((a, e) => a + valueOf(e), 0) * 100) / 100, [scoped, valueOf]);
  // brokers that actually have entries (before the broker filter) -> options for the Brokers popover
  const brokerStats = useMemo(() => {
    const m = new Map<string, { n: number; cb: number }>();
    entries.forEach((e) => {
      const k = e.brokerId || UNASSIGNED;
      const d = m.get(k) || { n: 0, cb: 0 };
      d.n += 1; d.cb += entryCashback(e, brokerMap);
      m.set(k, d);
    });
    return Array.from(m.entries()).map(([id, d]) => ({ id, ...d, cb: Math.round(d.cb * 100) / 100 }));
  }, [entries, brokerMap]);
  const chartBrokers = useMemo(
    () => brokerStats.map((b) => ({ id: b.id, name: brokerName(b.id), color: colorOf(b.id), n: b.n })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brokerStats, brokerMap, brokerOrder]
  );
  const rangeLabel =
    rangeMode === 'all' ? 'All time' : `${shortDate(rangeFrom)} – ${shortDate(rangeTo, true)}`;
  const currentCurrencyCount=entries.filter(e=>currencyOf(e)===currency).length;
  const accountIds = [...new Set(entries.filter(e => currencyOf(e) === currency).map(e => e.accountId || 'legacy-demo'))];
  const activeFilters = strategyOff.length + assetOff.length + outcomeOff.length + tradingStatusOff.length + brokerOff.length;
  const resetJournalScope=()=>{setRangeMode('all');setAccount('all');setStrategyOff([]);setAssetOff([]);setOutcomeOff([]);setTradingStatusOff([]);setBrokerOff([]);setSelectedDay(null);setOpenMenu(null);setLogPreset(null);};
  const openInsightTrades = (trades: JournalEntry[], label: string, selected?: JournalEntry) => {
    resetJournalScope();
    setCurrency(trades.length ? currencyOf(trades[0]) : reporting.settings.currency);
    setLogPreset({ ids: trades.map(trade => trade.id), label });
    setTab('entries');
    if (selected) {
      setReviewCohort(trades.map(trade => trade.id)); setSelectedId(selected.id);
      const url = new URL(window.location.href); url.searchParams.set('journalTrade', selected.id);
      window.history.replaceState(window.history.state, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handledTradeLink = useRef<string | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('journalTrade');
    if (!id) { handledTradeLink.current = null; return; }
    if (tab !== 'entries' || handledTradeLink.current === id) return;
    handledTradeLink.current = id;
    const trade = entries.find(entry => entry.id === id);
    if (!trade) { onShowToast('This trade is not saved in this browser.'); return; }
    resetJournalScope(); setCurrency(currencyOf(trade));
    setLogPreset({ ids: [id], label: 'Linked trade from Insights' }); setReviewCohort([id]); setSelectedId(id);
  }, [tab, entries]);
  const dayEntries = useMemo(
    () => (selectedDay ? scoped.filter((e) => e.date === selectedDay) : []),
    [scoped, selectedDay]
  );

  const filterMenu = (
    id: 'strategy' | 'asset' | 'outcome' | 'broker' | 'tradingStatus',
    title: string,
    opts: { id: string; label: string; n: number; color?: string }[],
    off: string[],
    set: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <div className="relative" data-journal-filter={id}>
      <button
        type="button"
        aria-expanded={openMenu === id}
        title={FILTER_HELP[title]}
        onClick={() => setOpenMenu(openMenu === id ? null : id)}
        className={`h-9 text-xs font-semibold border rounded-lg pl-3 pr-10 bg-white hover:bg-slate-50 ${off.length ? 'border-[#5338ec] text-[#5338ec]' : 'border-slate-200 text-[#0b1c30]'}`}
      >
        {title} ({opts.length - off.length}/{opts.length})
      </button>{originalView && <span className="absolute right-1 top-1.5"><JournalHelp label={title} text={`${FILTER_HELP[title]} ${title === 'Playbook' ? 'The selected count shows included categories, not the number of trades.' : getJournalHelp(title) || ''}`} /></span>}
      {openMenu === id && (
        <div className="absolute z-20 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-2 max-h-72 overflow-y-auto">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-[#0b1c30] cursor-pointer">
              <input
                type="checkbox"
                checked={!off.includes(o.id)}
                onChange={() => { set((cur) => (cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur, o.id])); setSelectedDay(null); }}
                style={o.color ? { accentColor: o.color } : undefined}
              />
              <span className="flex-1">{o.label}</span>
              <span className="text-[10px] font-mono text-slate-400">{o.n}</span>
            </label>
          ))}
          <div className="flex justify-between px-2 pt-1.5">
            <button type="button" onClick={() => { set([]); setSelectedDay(null); }} className="text-[11px] font-semibold text-[#5338ec] hover:underline">Select all</button>
            <button type="button" onClick={() => { set(opts.map((o) => o.id)); setSelectedDay(null); }} className="text-[11px] font-semibold text-slate-500 hover:underline">Clear</button>
          </div>
        </div>
      )}
    </div>
  );

  const choiceMenu = <T extends string>(
    id: 'show' | 'basis',
    title: string,
    opts: { id: T; label: string }[],
    value: T,
    set: (v: T) => void
  ) => (
    <div className="relative" data-journal-filter={id}>
      <button
        type="button"
        aria-expanded={openMenu === id}
        title={id === 'show'
          ? 'Choose what the Overview displays: trading P&L, trading plus cashback, or MarketSyde Points.'
          : 'Choose whether Overview trading results are shown gross before costs or net after recorded costs.'}
        onClick={() => setOpenMenu(openMenu === id ? null : id)}
        className="h-9 text-xs font-semibold border rounded-lg pl-3 pr-10 bg-white hover:bg-slate-50 border-slate-200 text-[#0b1c30]"
      >
        {title}: {opts.find((o) => o.id === value)?.label}
      </button><span className="absolute right-1 top-1.5"><JournalHelp label={title} /></span>
      {openMenu === id && (
        <div role="radiogroup" aria-label={title} className="absolute z-20 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-2">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-[#0b1c30] cursor-pointer">
              <input type="radio" name={`ov-${id}`} checked={value === o.id} onChange={() => { set(o.id); setOpenMenu(null); }} />
              <span className="flex-1">{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const tabs: FolderTabItem<JournalTab>[] = [
    { id: 'overview', label: 'Overview', help: getJournalHelp('Overview') },
    { id: 'entries', label: 'Trade Log', help: getJournalHelp('Trade Log') },
    { id: 'insights', label: 'Insights', help: getJournalHelp('Insights') },
    { id: 'playbook', label: 'Playbook', help: getJournalHelp('Playbook') },
    { id: 'backtest', label: 'Backtest', help: getJournalHelp('Backtest') },
    { id: 'review', label: 'AI Coach', help: getJournalHelp('AI Coach') },
  ];

  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries]);

  const stats = useMemo(() => {
    const decided = entries.filter((e) => e.outcome === 'win' || e.outcome === 'loss');
    const wins = decided.filter((e) => e.outcome === 'win').length;
    const rs = entries.map((e) => e.rMultiple).filter((r): r is number => r !== null);
    const plan = entries.length ? Math.round((entries.filter((e) => e.followedPlan).length / entries.length) * 100) : 0;
    const dates = Array.from(new Set(entries.map((e) => e.date))).sort().reverse();
    let streak = dates.length ? 1 : 0;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(`${dates[i - 1]}T00:00:00Z`).getTime();
      const cur = new Date(`${dates[i]}T00:00:00Z`).getTime();
      if (prev - cur === 86400000) streak++;
      else break;
    }
    return {
      total: entries.length,
      winRate: decided.length ? Math.round((wins / decided.length) * 100) : 0,
      avgR: Math.round(avg(rs) * 10) / 10,
      plan,
      streak,
    };
  }, [entries]);


  const insights = useMemo(() => {
    const entries = scoped.filter(e=>eligible(e));
    const followed = entries.filter((e) => e.followedPlan === true).map(netOf);
    const broke = entries.filter((e) => e.followedPlan === false).map(netOf);
    const byStrategy = [...new Set(entries.map(e=>e.strategy).filter(Boolean))].map((s) => {
      const list = entries.filter((e) => e.strategy === s);
      return {
        name: s,
        count: list.length,
        winRate: list.length ? Math.round((list.filter((e) => resultOf(e) === 'win').length / list.length) * 100) : 0,
        pnl: list.reduce((a, e) => a + netOf(e), 0),
      };
    }).filter((s) => s.count > 0);
    const byEmotion = JOURNAL_EMOTIONS.map((em) => {
      const list = entries.filter((e) => e.emotionBefore === em);
      return { name: em, count: list.length, avgPnl: avg(list.map(netOf)) };
    }).filter((e) => e.count > 0);
    const byDay = WEEKDAYS.map((d, i) => {
      const list = entries.filter((e) => new Date(`${e.date}T00:00:00Z`).getUTCDay() === i);
      return { name: d, pnl: list.reduce((a, e) => a + netOf(e), 0), count: list.length };
    });
    const mistakeMap: Record<string, number> = {};
    entries.forEach((e) => e.mistakes.forEach((m) => (mistakeMap[m] = (mistakeMap[m] || 0) + 1)));
    const mistakes = Object.entries(mistakeMap).sort((a, b) => b[1] - a[1]);
    return { followedAvg: avg(followed), brokeAvg: avg(broke), followedN: followed.length, brokeN: broke.length, byStrategy, byEmotion, byDay, mistakes };
  }, [scoped]);

  const weekStart = isoDaysAgo((new Date(`${JOURNAL_TODAY}T00:00:00Z`).getUTCDay()+6)%7);
  const weekEnd = new Date(Date.parse(`${weekStart}T00:00:00Z`)+6*86400000).toISOString().slice(0,10);
  const weekEntries = calEntries.filter((e) => e.date >= weekStart && e.date <= weekEnd);
  const weekPnl = metrics(weekEntries).total;

  const selected = selectedId ? entries.find((e) => e.id === selectedId) : null;


  const EntryRow: React.FC<{ e: JournalEntry }> = ({ e }) => (
    <div className="relative"><button
      onClick={() => openEntry(e.id)}
      className="w-full text-left bg-white border border-[#e2e8f0] rounded-2xl p-4 pr-14 hover:border-[#5338ec] transition-colors"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="w-28 shrink-0">
          <p className="text-sm font-bold text-[#0b1c30]">{e.symbol}</p>
          <p className="text-[11px] text-[#94a3b8]">{e.date}</p>
        </div>
        <span className={`text-xs font-bold shrink-0 ${e.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>{e.direction}</span>
        {eligible(e,pnlMode) && <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize shrink-0 ${OUTCOME_STYLE[resultOf(e,pnlMode)]}`}>{resultOf(e,pnlMode)}</span>}
        <TradingStatusBadge status={tradingStatusOf(e)} />
        <ReviewStateBadge state={reviewStateOf(e)} />
        <span className="text-xs font-bold font-mono shrink-0">{eligible(e,pnlMode) ? money(pnlMode === 'net' ? netOf(e) : e.pnl) : 'Not realized / unknown'} {pnlMode}</span>
        {realizedR(e) !== null && <span className="text-xs font-mono text-[#474556] shrink-0">{realizedR(e)! > 0 ? '+' : ''}{realizedR(e)!.toFixed(2)}R</span>}
        <span className="px-2 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] text-[10px] font-semibold shrink-0">{e.strategy}</span>
        {e.brokerId && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#474556] shrink-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorOf(e.brokerId) }} />
            {brokerName(e.brokerId)}{entryCashback(e, brokerMap) > 0 ? ` · cb ${money(entryCashback(e, brokerMap))}` : ''}{entryPoints(e) > 0 ? ` · ${entryPoints(e)} pts` : ''}
          </span>
        )}
        <span className="text-[11px] text-[#474556] shrink-0">{e.emotionBefore} → {e.emotionAfter}</span>
        {e.followedPlan === false && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 shrink-0"><AlertTriangle className="w-3 h-3" /> Off plan</span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
      </div>
      {e.setupNotes && <p className="text-xs text-[#474556] mt-2 line-clamp-1">{e.setupNotes}</p>}
    </button><button type="button" aria-label={`Replay ${e.symbol} trade ${e.id}`} title="Replay log" onClick={()=>setApiReplayId(e.id)} className="absolute right-3 top-3 rounded-lg border border-purple-200 bg-purple-50 p-2 text-[#5338ec] hover:bg-purple-100"><PlayCircle size={18}/></button></div>
  );

  const maxAbsDay = Math.max(1, ...insights.byDay.map((d) => Math.abs(d.pnl)));
  const maxAbsEmotion = Math.max(1, ...insights.byEmotion.map((d) => Math.abs(d.avgPnl)));

  return (
    <JournalCurrency.Provider value={currency}><div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Trading Journal{originalView && <JournalHelp label="Trading Journal" />}</h1>
          <p className="text-sm text-[#474556] mt-1">
            Write down why you traded, how you felt, and what you'd change. Patterns show up fast.
          </p>
        </div>
        {!simpleInsights && <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className="shrink-0 text-sm font-semibold bg-[#5338ec] hover:bg-[#4326d8] text-white rounded-xl px-4 py-2.5 transition-colors"
        >
          Import / link
        </button>}
      </div>

      <div className="mb-6">
        <FolderTabs tabs={tabs} activeTab={tab} onChange={setTab} />
      </div>
      {journalSandbox && <p role="status" className="text-xs text-purple-700 mb-3">Isolated journal test workspace — separate from your journal records.</p>}
      {storageFailed && <p role="alert" className="text-xs text-rose-700">Local storage unavailable or unreadable. Changes may not survive reload; unreadable stored data has not been overwritten.</p>}
      {playbookStorageFailed && <p role="alert" className="text-xs text-rose-700">Playbooks could not be read or saved to local storage. Changes may not survive reload; unreadable stored data has not been overwritten.</p>}
      {view.error && <p role="alert" className="mb-3 text-xs text-rose-700">{view.error}</p>}
      {tab !== 'entries' && <div className="mb-3 flex justify-end"><JournalLevelSwitch key={tab} view={view}/></div>}
      {tab !== 'entries' && view.baseLevel === 'easy' && !view.welcomed && <div role="status" className="mb-4 flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p>This is the Easy view. Use ⋯ on any card or '+ Add card' to see more.</p><button className="text-[#5338ec] font-semibold" onClick={view.dismissWelcome} aria-label="Dismiss Easy view welcome">Got it</button>
      </div>}
      {!simpleInsights && <div ref={scopeRef}>
      {(originalView || filtersOpen) && <div className="flex flex-wrap gap-3 mb-3 text-xs">
        <label title="Keep calculations in one currency. No currency conversion is applied.">Account currency<JournalHelp label="Account currency" /> <select aria-label="Account currency" title="Choose the account currency; entries in other currencies are excluded." value={currency} onChange={e=>{setCurrency(e.target.value);setAccount('all');setSelectedDay(null);}}>{[...new Set(['USD',...entries.map(currencyOf)])].map(c=><option key={c}>{c}</option>)}</select></label>
        <label title="Limit the journal scope to one account or include all accounts in the selected currency.">Account<JournalHelp label="Account" /> <select aria-label="Account" title="Choose one account or all accounts in the selected currency." value={account} onChange={e=>{setAccount(e.target.value);setSelectedDay(null);}}><option value="all">All accounts in this currency</option>{[...new Set(entries.filter(e=>currencyOf(e)===currency).map(e=>e.accountId || 'legacy-demo'))].map(a=><option key={a}>{a}</option>)}</select></label>
        <span>{currency} only · entry-date basis (UTC) · no currency conversion · net win rate includes breakeven</span>
      </div>}

      {originalView && (tab==='entries'||tab==='insights')&&<section className={`mb-4 flex flex-wrap items-center gap-3 rounded-xl border p-3 text-xs ${entries.length===0?'border-amber-200 bg-amber-50 text-amber-900':'border-[#5338ec]/20 bg-[#FBFAFF] text-slate-700'}`} aria-label="Journal data coverage">
        {entries.length===0?<><div className="min-w-0 flex-1"><p className="font-semibold">No journal trades are saved in this browser.</p><p className="mt-1">Broker sync is not active in this build. Import a CSV statement or add journal trades to populate these reports.</p></div><button type="button" onClick={()=>setWizardOpen(true)} className="h-8 rounded-lg bg-[#5338ec] px-3 font-semibold text-white hover:bg-[#4326d8]">Import trades</button></>:<>
          <div className="min-w-0 flex-1"><p><strong>{scoped.length} shown of {entries.length} saved trades.</strong> Current view: {rangeLabel} · {currency} · {account==='all'?'all accounts':account}.</p><p className="mt-1 text-[11px] text-slate-500">{currentCurrencyCount===0?`No saved trades use ${currency}; choose a currency with records above.`:`${currentCurrencyCount} saved trades use ${currency}.`} Date, account, and journal filters affect both Trade Log and Insights.</p></div>
          {scoped.length<entries.length&&<button type="button" onClick={resetJournalScope} className="h-8 rounded-lg border border-[#5338ec]/30 bg-white px-3 font-semibold text-[#5338ec] hover:bg-[#F7F5FF]">Show all saved trades</button>}
        </>}
      </section>}

      {/* ───── OVERVIEW ───── */}
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-start gap-2" role="toolbar" aria-label="Journal scope">
            <div className="flex items-center gap-0.5">
                <JournalDateRange compact={!originalView} from={rangeFrom} to={rangeTo} label={rangeLabel} today={JOURNAL_TODAY} entries={calEntries} onApply={(range, all) => { setCustomRange(range); setRangeMode(all ? 'all' : 'custom'); setCalMonth(range.to.slice(0,7)); setSelectedDay(null); setDayReviewOpen(false); }}/>
            </div>

            {!originalView && <>
              {accountIds.length > 1 && <label className="flex items-center gap-2 text-xs">Account<select aria-label="Journal account" value={account} onChange={event => setAccount(event.target.value)} className="h-9 max-w-48 rounded-lg border border-slate-200 bg-white px-2"><option value="all">All accounts</option>{accountIds.map(id => <option key={id}>{id}</option>)}</select></label>}
              <button type="button" className="h-9 px-3 text-xs font-semibold text-[#5338ec]" aria-expanded={filtersOpen} onClick={() => { setFiltersOpen(!filtersOpen); setOpenMenu(null); }}>Filters{activeFilters ? ` (${activeFilters})` : ''}</button>
              <JournalHelp label="Journal scope and basis" text={`${rangeLabel} · ${currency} only · entry-date basis (UTC) · no currency conversion. Net results include known recorded costs. Win rate includes breakeven. ${entries.length} saved trades across all currencies. Use Filters to change currency; money in different currencies is never combined.`}/>
            </>}
            {(originalView || view.baseLevel === 'standard' || filtersOpen) && <>
            {filterMenu('strategy', 'Playbook', JOURNAL_STRATEGIES.map((v) => ({ id: v, label: v, n: entries.filter((e) => e.strategy === v).length })), strategyOff, setStrategyOff)}
            {filterMenu('asset', 'Market type', JOURNAL_MARKET_TYPES.map((v) => ({ id: v, label: v, n: entries.filter((e) => e.assetClass === v).length })), assetOff, setAssetOff)}
            {filterMenu('outcome', 'Net outcome', (['win', 'loss', 'breakeven', 'open'] as const).map((v) => ({ id: v, label: v === 'win' ? 'Wins' : v === 'loss' ? 'Losses' : v === 'breakeven' ? 'Breakeven' : 'Not realized / unknown', n: entries.filter((e) => resultOf(e) === v).length })), outcomeOff, setOutcomeOff)}
            {filterMenu('tradingStatus', 'Trading status', (['planned', 'open', 'closed'] as const).map((v) => ({ id: v, label: v[0].toUpperCase() + v.slice(1), n: entries.filter((e) => tradingStatusOf(e) === v).length })), tradingStatusOff, setTradingStatusOff)}
            {filterMenu('broker', 'Broker', chartBrokers.map((b) => ({ id: b.id, label: b.name, n: b.n, color: b.color })), brokerOff, setBrokerOff)}

            {tab==='overview' && choiceMenu<CashbackMode>('show', 'Overview show', [{ id: 'off', label: 'Trading' }, { id: 'include', label: '+ Cashback' }, { id: 'points', label: 'Points' }], cbMode, setCbMode)}
            {tab==='overview' && choiceMenu<PnlMode>('basis', 'Overview basis', [{ id: 'gross', label: 'Gross' }, { id: 'net', label: 'Net' }], pnlMode, setPnlMode)}
            </>}
          </div>

        </div>
      {!originalView && scoped.length < entries.length && <div role="status" className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span>Showing {scoped.length} of {entries.length} saved trades · {currency} only</span><button className="font-semibold text-[#5338ec] underline" onClick={resetJournalScope}>Show all{currentCurrencyCount < entries.length ? ` ${currency} trades` : ''}</button>
      </div>}
      </div>}
      {tab === 'overview' && <JournalWorkspaceCard key={tab} view={view}>
      {tab === 'overview' && (
        <div className="space-y-6 mt-6">
          {/* MarketSyde reads the journal and says what it sees, above the
              figures it is reading, so the words come before the numbers. */}
          <AiJournalSummary
            entries={scoped}
            checklistSize={checklist.length}
            today={JOURNAL_TODAY}
            onWriteEntry={() => setTab('entries')}
            onOpenInsights={() => setTab('insights')}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1 capitalize">{cbMode === 'points' ? 'MarketSyde Points' : `${valueLabel} P&L`}<JournalHelp label={cbMode === 'points' ? 'Points' : pnlMode === 'net' ? 'Net P&L' : 'Gross P&L'} /></p>
              <p className={`text-xl font-bold font-mono ${shownTotal > 0 ? 'text-emerald-600' : shownTotal < 0 ? 'text-rose-600' : ''}`}>{kpi.count ? (cbMode === 'points' ? `${shownTotal.toLocaleString('en-US')} pts` : money(shownTotal)) : '—'}</p>
              <p className="text-[10px] text-[#94a3b8] mt-0.5">{kpi.realizedCount} eligible / {kpi.count} recorded · cashback {formatMoney(cashbackTotal,'USD')}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Win rate<JournalHelp label="Win rate" /></p>
              <p className="text-xl font-bold flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> {kpi.winRate == null ? '—' : `${kpi.winRate}%`}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Profit factor<JournalHelp label="Profit factor" /></p>
              <p className="text-xl font-bold font-mono">{kpi.profitFactor === null ? '—' : kpi.profitFactor === Infinity ? '∞' : kpi.profitFactor.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Average R<JournalHelp label="Average R" /></p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Target className="w-4 h-4 text-[#5338ec]" /> {kpi.avgR==null?'—':`${kpi.avgR.toFixed(2)}R`}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Plan followed<JournalHelp label="Plan followed" /></p>
              <p className="text-xl font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-sky-500" /> {kpi.plan==null?'—':`${kpi.plan.toFixed(0)}%`}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 col-span-2 md:col-span-1">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Journal streak<JournalHelp label="Journal streak" /></p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /> {stats.streak} days</p>
            </div>
          </div>

          <JournalCumulativeChart entries={scoped} valueOf={valueOf} title={cbMode === 'points' ? 'MarketSyde Points' : `${valueLabel} P&L`} unit={cbMode === 'points' ? 'pts' : 'usd'} rangeLabel={rangeLabel} brokers={chartBrokers} off={brokerOff} onDay={openDay}/>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
            <div className="space-y-3">
              <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2" aria-label="Review queue">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">Review queue · {pendingEntries.length} pending<JournalHelp label="Review queue" /></h3>
                  {!!pendingEntries.length && <button type="button" className="text-xs font-semibold text-[#5338ec] hover:underline" onClick={() => setReviewQueueOpen(true)}>See full pending list</button>}
                </div>
                <p className="text-xs text-slate-500">In this scope. Incomplete information is not a negative result.</p>
                {pendingEntries.slice(0,3).map(e=><button key={e.id} className="block text-left text-xs text-[#5338ec] underline" onClick={()=>openEntry(e.id,pendingEntries.map(x=>x.id))}>{e.symbol} · {e.date} · {incompleteFields(e).join(', ') || 'Review reopened'}</button>)}
                <details className="pt-1 text-xs">
                  <summary className="cursor-pointer font-semibold text-[#5338ec] hover:underline">Show more information</summary>
                  <div className="mt-2 rounded-xl border border-[#e2dcff] bg-[#f7f5ff] p-3 text-[#474556] space-y-1.5">
                    <p><strong>What is pending:</strong> entries whose review state is not Complete, including entries reopened after completion.</p>
                    <p><strong>What is included:</strong> only trades matching the current date range, currency, account, playbook, market, outcome, trading-status and broker filters.</p>
                    <p><strong>What it means:</strong> pending indicates missing journal evidence such as costs, lessons, emotions, plan adherence or review answers. It does not change the trade result or mark the trade as a loss.</p>
                    <p><strong>Next step:</strong> select an entry above to open its Review form and save a draft or complete the missing information.</p>
                  </div>
                </details>
              </section>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  {selectedDay ? `Trades on ${shortDate(selectedDay, true)}` : 'Recent entries'}<JournalHelp label="Recent entries" />
                </h3>
                {selectedDay ? (
                  <button onClick={() => setSelectedDay(null)} className="text-xs font-semibold text-[#5338ec] hover:underline">Clear day</button>
                ) : (
                  <button onClick={() => setTab('entries')} className="text-xs font-semibold text-[#5338ec] hover:underline">View all</button>
                )}
              </div>
              {selectedDay ? (
                dayEntries.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <p className="text-sm text-[#474556]">No entries on this day.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] font-mono text-[#474556]">
                      {dayEntries.length} entr{dayEntries.length === 1 ? 'y' : 'ies'} · {cbMode === 'points' ? `${dayEntries.reduce((a, e) => a + valueOf(e), 0)} pts` : money(dayEntries.reduce((a, e) => a + valueOf(e), 0))} {cbMode === 'points' ? 'points' : valueLabel}
                    </p>
                    {dayEntries.map((e) => <EntryRow key={e.id} e={e} />)}
                  </>
                )
              ) : scoped.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-[#474556]">
                  No entries match this date range and filters.
                </div>
              ) : (
                [...scoped].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((e) => <EntryRow key={e.id} e={e} />)
              )}
              <JournalOverviewAnalytics entries={scoped} currency={currency} basis={pnlMode} onTrade={id=>openEntry(id,scoped.map(e=>e.id))} onDay={openDay}/>
            </div>

            <aside className="space-y-5">
              <CoachOverviewCard entries={scoped} playbooks={playbooks} currency={currency} today={coachToday} onOpen={() => { setTab('review'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}/>
              <JournalCalendar
                month={calMonth}
                onMonthChange={(ym) => { setCalMonth(ym); setSelectedDay(null); }}
                entries={scoped}
                valueOf={valueOf}
                eligibleForValue={e=>cbMode==='points'?tradingStatusOf(e)==='closed':eligible(e,pnlMode)}
                label={cbMode === 'points' ? 'points' : valueLabel}
                unit={cbMode === 'points' ? 'pts' : 'usd'}
                brokerName={brokerName}
                brokerColor={colorOf}
                today={JOURNAL_TODAY}
                selected={selectedDay}
                onSelect={date => date ? openDay(date) : setSelectedDay(null)}
              />

              <TiltMonitor entries={scoped} rules={rules} />
              <DisciplineCard entries={scoped} checklistLength={checklist.length} />
              <RulesMonitor entries={scoped} rules={rules} onEdit={() => setTab('playbook')} />
              <StrategyHealthCard playbooks={playbooks} entries={scoped} expected={expected} onOpen={() => goBacktest({ view: 'home' })} />

              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
                <h4 className="text-sm font-bold mb-2">What your journal says<JournalHelp label="What your journal says" /></h4>
                <p className="text-xs text-[#474556] leading-relaxed">
                  On trades where you followed your plan you averaged{' '}
                  <span className="font-bold text-emerald-600">{insights.followedN?money(insights.followedAvg):'unknown (no answered trades)'}</span>. Off-plan trades averaged{' '}
                  <span className="font-bold text-rose-600">{insights.brokeN?money(insights.brokeAvg):'unknown (no answered trades)'}</span>. Net results only; descriptive comparison.
                </p>
                <button onClick={() => setTab('insights')} className="mt-3 text-xs font-semibold text-[#5338ec] hover:underline">
                  See all insights
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      </JournalWorkspaceCard>}
      {/* ───── ENTRIES ───── */}
      {tab === 'entries' && (
        <Suspense fallback={<p role="status" className="py-6 text-sm text-slate-500">Loading Trade Log…</p>}>
        <JournalTradeLog
          entries={scoped}
          brokers={brokers || []}
          onChange={setEntries}
          onOpen={openEntry}
          onToast={onShowToast}
          preset={logPreset}
          onClearPreset={() => setLogPreset(null)}
          onReplay={(id) => goBacktest({ view: 'replay', entryId: id })}
          onReplayLog={setApiReplayId}
          onBacktestTrades={(ids) => goBacktest({ view: 'setup', benchmarkTradeIds: ids })}
        />
        </Suspense>
      )}

      {simpleInsights && <Suspense fallback={<InsightsLoading compact={view.baseLevel === 'easy'}/>}>
        <SimpleInsights entries={entries} settings={reporting.settings} settingsWarnings={reporting.warnings} view={view} checklistLength={checklist.length}
          onTradeLog={() => setTab('entries')} onOpenProfile={onOpenProfile}
          onOpenTrade={trade => openInsightTrades([trade], 'Trade from Insights', trade)}
          onOpenTrades={openInsightTrades}/>
      </Suspense>}
      {tab !== 'entries' && tab !== 'overview' && !simpleInsights && <JournalWorkspaceCard key={tab} view={view}>
      {/* ───── INSIGHTS ───── */}
      {tab === 'insights' && (
        <JournalInsights
          entries={scoped}
          brokers={brokers || []}
          onToast={onShowToast}
          onDrill={(ids, label) => { setLogPreset({ ids, label }); setTab('entries'); }}
          onWhatIf={() => goBacktest({ view: 'whatif' })}
          overview={(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-bold text-sm">Realized results · {rangeLabel} · {currency}</h3>
            {(()=>{const m=metrics(scoped);return <><p className="text-xs mt-2">{m.n} eligible / {m.count} recorded · expectancy {m.expectancy==null?'—':money(m.expectancy)} per closed trade · daily closed-result drawdown {money(m.drawdown)} · costs {money(m.fees)}</p><p className="text-xs mt-2">Initial monetary-risk coverage {m.riskCount}/{m.n}; reported/derived R coverage {m.rCount}/{m.n}. Drawdown is a currency amount, not account-equity drawdown. Cohorts are descriptive, not causal.</p><details className="mt-3"><summary className="text-xs cursor-pointer">Daily net results table</summary><table className="text-xs w-full"><thead><tr><th className="text-left">Entry date UTC</th><th className="text-right">Net result<JournalHelp label="Net result" /></th></tr></thead><tbody>{m.daily.map(([d,v])=><tr key={d}><td><button className="text-[#5338ec] underline" onClick={()=>{setLogPreset({ids:m.list.filter(e=>e.date===d).map(e=>e.id),label:`Daily net ${d}`});setTab('entries');}}>{d}</button></td><td className="text-right">{money(v)}</td></tr>)}</tbody></table></details></>;})()}
          </section>
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4">Plan adherence<JournalHelp label="Plan adherence" /></h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-emerald-700 mb-1">Followed plan ({insights.followedN})</p>
                <p className="text-lg font-bold text-emerald-600 font-mono">{insights.followedN?money(insights.followedAvg):'Unknown'}</p>
                <p className="text-[10px] text-emerald-700">avg per trade</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-rose-700 mb-1">Broke plan ({insights.brokeN})</p>
                <p className="text-lg font-bold text-rose-600 font-mono">{insights.brokeN?money(insights.brokeAvg):'Unknown'}</p>
                <p className="text-[10px] text-rose-700">avg per trade</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4">By strategy<JournalHelp label="By strategy" /></h4>
            <div className="space-y-3">
              {insights.byStrategy.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="font-semibold w-28 shrink-0">{s.name}</span>
                  <span className="text-[#474556] w-16 shrink-0">{s.winRate}% win</span>
                  <span className="text-[#94a3b8] w-12 shrink-0">{s.count} trades</span>
                  <span className={`font-bold font-mono ml-auto ${s.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(s.pnl)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4">P&amp;L by weekday<JournalHelp label="P&L by weekday" /></h4>
            <div className="flex items-end gap-2 h-32">
              {insights.byDay.map((d) => (
                <div key={d.name} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <div
                    className={`w-full rounded-t-md ${d.pnl >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    style={{ height: `${Math.max(4, (Math.abs(d.pnl) / maxAbsDay) * 100)}%`, opacity: d.count ? 1 : 0.25 }}
                    title={`${d.name}: ${money(d.pnl)}`}
                  />
                  <span className="text-[10px] text-[#94a3b8] font-semibold">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 relative overflow-hidden">
            <h4 className="text-sm font-bold mb-4">Emotion vs. result<JournalHelp label="Emotion vs. result" /></h4>
            <div className={`space-y-3 ${hasAdvanced ? '' : 'blur-[3px] select-none'}`}>
              {insights.byEmotion.map((em) => (
                <div key={em.name} className="flex items-center gap-3 text-xs">
                  <span className="w-20 font-semibold shrink-0">{em.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${em.avgPnl >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ width: `${Math.max(6, (Math.abs(em.avgPnl) / maxAbsEmotion) * 100)}%` }} />
                  </div>
                  <span className={`w-16 text-right font-mono font-bold ${em.avgPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(em.avgPnl)}</span>
                </div>
              ))}
            </div>
            {!hasAdvanced && (
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                <button onClick={onUpgradePrompt} className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl">
                  <Lock className="w-3.5 h-3.5" /> Unlock on Intermediate
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 relative overflow-hidden">
            <h4 className="text-sm font-bold mb-4">Most common mistakes<JournalHelp label="Most common mistakes" /></h4>
            <div className={`space-y-3 ${hasAdvanced ? '' : 'blur-[3px] select-none'}`}>
              {insights.mistakes.length === 0 && <p className="text-xs text-[#474556]">No mistakes logged yet.</p>}
              {insights.mistakes.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold">{count}×</span>
                </div>
              ))}
            </div>
            {!hasAdvanced && (
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                <button onClick={onUpgradePrompt} className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl">
                  <Lock className="w-3.5 h-3.5" /> Unlock on Intermediate
                </button>
              </div>
            )}
          </div>
        </div>
          )}
        />
      )}

      {/* ───── BACKTEST ───── */}
      {tab === 'backtest' && (
        <BacktestPage
          entries={scoped}
          allEntries={entries}
          playbooks={playbooks}
          setPlaybooks={setVersionedPlaybooks}
          journalRules={rules}
          onUpdateRules={(p) => setRules((r) => ({ ...r, ...p }))}
          onAddChecklist={(label) => setChecklist((prev) => (prev.some((c) => c.label === label) ? prev : [...prev, { id: `chk_${Date.now()}`, label }]))}
          brokers={brokers || []}
          userTierLevel={isLoggedIn ? userTierLevel : 1}
          sydeCredits={sydeCredits}
          onSpendCredits={(amount, reason) => (onSpendCredits ? onSpendCredits(amount, reason) : false)}
          onRewardPoints={(pts, reason) => (onRewardPoints ? onRewardPoints(pts, reason) : onShowToast(`+${pts} Points: ${reason}`))}
          onUpgrade={onUpgradePrompt}
          onToast={onShowToast}
          onOpenTrades={(ids, label) => { setLogPreset({ ids, label }); setTab('entries'); }}
          expected={expected}
          onSetExpected={setExpectedFor}
          intent={btIntent}
          onIntentDone={() => setBtIntent(null)}
        />
      )}

      {/* ───── PLAYBOOK ───── */}
      {tab === 'playbook' && (
        <JournalPlaybooks
          entries={scoped}
          allJournalEntries={entries}
          playbooks={playbooks}
          setPlaybooks={setVersionedPlaybooks}
          onOpenEntry={id=>openEntry(id,scoped.filter(e=>e.strategy===entries.find(x=>x.id===id)?.strategy).map(e=>e.id))}
          onShowTrades={(ids, label) => { setLogPreset({ ids, label }); setTab('entries'); }}
          onToast={onShowToast}
          houseChecklist={checklist}
          houseLimits={rules}
          easy={view.baseLevel === 'easy'}
          recordings={recordings}
          onSetRecording={(id, blob) => setRecordings((r) => {
            const next = { ...r };
            if (next[id]) URL.revokeObjectURL(next[id]);
            if (blob) next[id] = URL.createObjectURL(blob); else delete next[id];
            return next;
          })}
          expected={expected}
          onBacktest={(id) => goBacktest({ view: 'setup', playbookId: id })}
          onWhatIf={id => goBacktest({ view: 'whatif', playbookId: id })}
          houseRules={(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="flex items-center gap-1.5 text-sm font-bold mb-1"><BookOpen className="w-4 h-4 text-[#5338ec]" /> Pre-trade checklist<JournalHelp label="Pre-trade checklist" /></h4>
            <p className="text-xs text-[#474556] mb-4">These show up in every new entry so you can check them off honestly.</p>
            <div className="space-y-2 mb-4">
              {checklist.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5">
                  <span className="text-sm">{c.label}</span>
                  <button onClick={() => setChecklist((prev) => prev.filter((x) => x.id !== c.id))} aria-label="Remove" className="text-slate-300 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add a rule to check before every trade..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              <button
                onClick={() => {
                  if (!newItem.trim()) return;
                  setChecklist((prev) => [...prev, { id: `chk_${Date.now()}`, label: newItem.trim() }]);
                  setNewItem('');
                }}
                className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-4 rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="flex items-center gap-1.5 text-sm font-bold mb-1"><ShieldCheck className="w-4 h-4 text-[#5338ec]" /> Trading rules<JournalHelp label="Trading rules" /></h4>
            <p className="text-xs text-[#474556] mb-4">Your hard limits. Write them when you're calm, not mid-trade.</p>
            <div className="space-y-3.5">
              {([
                ['maxRisk', 'Max risk per trade', '% of account'],
                ['maxDailyLoss', 'Max daily loss', '% of account'],
                ['maxTrades', 'Max trades per day', 'trades'],
                ['stopAfterLosses', 'Stop after consecutive losses', 'losses'],
              ] as const).map(([key, label, unit]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{label}<JournalHelp label={label} /></span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={rules[key]}
                      onChange={(e) => setRules((r) => ({ ...r, [key]: Number(e.target.value) }))}
                      className="w-20 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
                    />
                    <span className="text-[11px] text-[#94a3b8] w-20">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onShowToast('Trading rules saved')} className="mt-5 w-full bg-[#0b1c30] hover:bg-slate-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Save rules
            </button>
          </div>
        </div>
          )}
        />
      )}

      {/* ───── AI COACH ───── */}
      {tab === 'review' && (
        <div className="space-y-5">
          <JournalAICoach entries={scoped} history={calEntries} playbooks={playbooks} currency={currency} today={coachToday} rangeLabel={rangeLabel} onImport={() => setWizardOpen(true)} onToast={onShowToast} onScenario={useCoachScenario} onEvidence={(ids, label) => { resetJournalScope(); setLogPreset({ ids, label }); setTab('entries'); }}/>
          <details className="rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer text-sm font-semibold">Saved reviews & reflection<JournalHelp label="Saved reviews & reflection" /></summary>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="space-y-5">
            <p className="text-sm font-semibold mt-5">Week {weekStart} – {weekEnd} · {currency} · net realized results</p>
            <button className="text-xs text-[#5338ec] underline" onClick={()=>{setLogPreset({ids:weekEntries.map(e=>e.id),label:`Week ${weekStart} – ${weekEnd}`});setTab('entries');}}>Open linked week trades ({weekEntries.length})</button>
            <p className="text-xs">Previous focus: {reviews.find(r=>!r.from || r.from<weekStart)?.focusNextWeek || 'No previous focus recorded'}</p>
            <label className="block text-xs">Previous focus follow-up<textarea className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={rvFollowUp} onChange={ev=>setRvFollowUp(ev.target.value)}/></label>
            <details><summary className="text-xs cursor-pointer">Daily reflections from this week<JournalHelp label="Daily reflections from this week" /></summary>{Object.entries(dailyNotes).filter(([d])=>d>=weekStart && d<=weekEnd).map(([d,n])=><p key={d} className="text-xs mt-2"><button className="text-[#5338ec] underline" onClick={()=>{openDay(d);setTab('overview');}}>{d}</button>: {n}</p>)}</details>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-[#474556] mb-1">Entries this week</p>
                <p className="text-xl font-bold">{weekEntries.length}</p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-[#474556] mb-1">Net P&amp;L<JournalHelp label="Net P&L" /></p>
                <p className={`text-xl font-bold font-mono ${weekPnl>0 ? 'text-emerald-600' : weekPnl<0?'text-rose-600':'text-slate-600'}`}>{weekEntries.some(e=>eligible(e))?money(weekPnl):'—'}</p><p className="text-[10px] text-slate-500">{weekEntries.filter(e=>eligible(e)).length} eligible closed trades</p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-[#474556] mb-1">Off-plan trades</p>
                <p className="text-xl font-bold">{weekEntries.filter((e) => e.followedPlan === false).length}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold">This week's review<JournalHelp label="This week's review" /></h4>
              <div>
                <label className="text-xs font-semibold text-[#474556] mb-1 block">Best trade and why</label>
                <textarea value={rvBest} onChange={(e) => setRvBest(e.target.value)} rows={2} className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#474556] mb-1 block">Biggest lesson</label>
                <textarea value={rvLesson} onChange={(e) => setRvLesson(e.target.value)} rows={2} className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#474556] mb-1 block">One thing to focus on next week</label>
                <textarea value={rvFocus} onChange={(e) => setRvFocus(e.target.value)} rows={2} className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              </div>
              <button
                disabled={!rvBest.trim() && !rvLesson.trim() && !rvFocus.trim()}
                onClick={() => {
                  setReviews((prev) => [
                    { id: crypto.randomUUID(), from:weekStart, to:weekEnd, currency, tradeIds:weekEntries.map(e=>e.id), focusFollowUp:rvFollowUp, weekLabel: `${weekStart} – ${weekEnd}`, bestTrade: rvBest, biggestLesson: rvLesson, focusNextWeek: rvFocus, entriesCount: weekEntries.length, netPnl: weekPnl },
                    ...prev,
                  ]);
                  setRvBest(''); setRvLesson(''); setRvFocus('');
                  onShowToast('Weekly review saved');
                }}
                className="bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Save review
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <h4 className="text-sm font-bold">Past reviews<JournalHelp label="Past reviews" /></h4>
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold">{r.weekLabel}</p>
                  <span className={`text-xs font-bold font-mono ${r.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMoney(r.netPnl,r.currency || 'USD')}</span>
                </div>
                {r.bestTrade && <p className="text-xs text-[#474556] mb-1"><span className="font-semibold text-[#0b1c30]">Best:</span> {r.bestTrade}</p>}
                {r.biggestLesson && <p className="text-xs text-[#474556] mb-1"><span className="font-semibold text-[#0b1c30]">Lesson:</span> {r.biggestLesson}</p>}
                {r.focusNextWeek && <p className="text-xs text-[#474556]"><span className="font-semibold text-[#0b1c30]">Focus:</span> {r.focusNextWeek}</p>}
                {r.tradeIds && <button className="text-xs text-[#5338ec] underline mt-2" onClick={()=>{setLogPreset({ids:r.tradeIds!,label:`Review ${r.weekLabel}`});setTab('entries');}}>Linked trades ({r.tradeIds.length}; current scope applies)</button>}
              </div>
            ))}
          </aside>
        </div>
          </details>
        </div>
      )}

      </JournalWorkspaceCard>}
      {tab !== 'entries' && <JournalAddCard key={`add-${tab}`} tab={tab} view={view}/>}
      {selected && <JournalReviewDrawer entry={selected} cohort={reviewCohort} checklist={checklist} playbook={playbooks.find(p=>p.name===selected.strategy)} onSelect={setSelectedId} onClose={()=>setSelectedId(null)} onSave={upd=>{setEntries(prev=>prev.map(e=>e.id===upd.id?upd:e));onShowToast('Review saved locally');}} onDelete={id=>{setEntries(prev=>prev.filter(e=>e.id!==id));setSelectedId(null);onShowToast('Entry deleted locally');}} onReplay={()=>goBacktest({view:'replay',entryId:selected.id})}/>}
      {reviewQueueOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1c30]/40 p-3 sm:p-6" role="presentation" onMouseDown={() => setReviewQueueOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pending-review-title"
            tabIndex={-1}
            className="w-full max-w-2xl max-h-[90dvh] overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] text-[#0b1c30] shadow-2xl focus:outline-none"
            onMouseDown={event => event.stopPropagation()}
            onKeyDown={event => { if (event.key === 'Escape') setReviewQueueOpen(false); }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
              <div>
                <h2 id="pending-review-title" className="text-lg font-bold">Pending reviews · {filteredPending.length}</h2>
                <p className="mt-1 text-xs text-slate-500">{rangeLabel} · {currency} · current journal filters</p>
              </div>
              <button type="button" aria-label="Close pending review list" title="Close pending review list" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" onClick={() => setReviewQueueOpen(false)}><X size={18}/></button>
            </header>
            <div className="max-h-[calc(90dvh-106px)] overflow-y-auto p-4">
              <p className="mb-3 rounded-xl border border-[#e2dcff] bg-[#f7f5ff] p-3 text-xs text-[#474556]">Pending means the review state is not Complete or required journal evidence is missing. It does not mark the trade as a loss. Select a row to open its Review form.</p>
              <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-600">Market type<JournalHelp label="Market type" /><select aria-label="Pending review market type" value={pendingMarket} onChange={e=>{setPendingMarket(e.target.value);setPendingSymbol('all');}} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#0b1c30]"><option value="all">All markets</option>{[['Forex','Forex'],['Crypto','Crypto'],['Commodity','Commodities'],['Indices','Indices'],['Stocks','Stock']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
                  <label className="text-xs font-semibold text-slate-600">Symbol<JournalHelp label="Symbol" /><select aria-label="Pending review symbol" value={pendingSymbol} onChange={e=>setPendingSymbol(e.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#0b1c30]"><option value="all">All symbols</option>{pendingSymbols.map(symbol=><option key={symbol} value={symbol}>{symbol}</option>)}</select></label>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs"><p className="text-slate-500" role="status">{filteredPending.length} of {pendingEntries.length} pending reviews</p>{(pendingMarket!=='all'||pendingSymbol!=='all')&&<button type="button" className="font-semibold text-[#5338ec]" onClick={()=>{setPendingMarket('all');setPendingSymbol('all');}}>Reset filters</button>}</div>
              </div>
              <div className="space-y-2">
                {!filteredPending.length&&<p className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">No pending reviews match these filters.</p>}
                {filteredPending.map(entry => (
                  <button
                    key={entry.id}
                    type="button"
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-[#5338ec] focus-visible:outline-2 focus-visible:outline-[#5338ec]"
                    onClick={() => { setReviewQueueOpen(false); openEntry(entry.id, filteredPending.map(item => item.id)); }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-sm">{entry.symbol} <span className="font-normal text-slate-500">· {entry.date}</span></span>
                      <span className="flex flex-wrap gap-1"><TradingStatusBadge status={tradingStatusOf(entry)}/><ReviewStateBadge state={reviewStateOf(entry)}/></span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{incompleteFields(entry).join(' · ') || 'Review reopened'}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
      {tab === 'overview' && selectedDay && dayReviewOpen && <JournalDayReview suspended={!!selected || !!apiReplayId} date={selectedDay} entries={dayEntries} currency={currency} from={rangeFrom} to={rangeTo} note={dailyNotes[selectedDay] || ''} onNote={value => setDailyNotes(d => ({ ...d, [selectedDay]: value }))} onDay={openDay} onClose={() => { setDayReviewOpen(false); setSelectedDay(null); }} onTrade={id => openEntry(id, dayEntries.map(e => e.id))} onReplay={setApiReplayId} onEditRules={() => { setDayReviewOpen(false); setTab('playbook'); }} brokerName={brokerName} checklistLength={checklist.length} playbookNames={playbooks.map(p => p.name)} rules={rules}/>}
      {apiReplayId && (() => { const trade = entries.find(e => e.id === apiReplayId); return trade ? <JournalReplayAvailability entry={trade} entries={scoped} playbooks={playbooks} onClose={() => setApiReplayId(null)}/> : null; })()}
      {wizardOpen && (
        <JournalEntryWizard
          strategies={playbooks.filter((p) => p.status !== 'archived').map((p) => p.name)}
          onClose={() => setWizardOpen(false)}
          existingEntries={entries}
          brokers={brokers}
          onConnectBroker={onConnectBroker}
          onImportMany={(list) => {
            setEntries((prev) => [...list, ...prev]);
            setWizardOpen(false);
            setTab('entries');
            onShowToast(`${list.length} trade${list.length === 1 ? '' : 's'} imported`);
          }}
        />
      )}
    </div></JournalCurrency.Provider>
  );
};
