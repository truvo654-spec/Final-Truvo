import React, { useMemo, useState } from 'react';
import { Flame, Target, TrendingUp, ShieldCheck, Lock, Trash2, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react';
import { Broker, JournalEntry, JournalChecklistItem, JournalWeeklyReview } from '../../types';
import {
  JOURNAL_ENTRIES,
  JOURNAL_REVIEWS,
  DEFAULT_CHECKLIST,
  JOURNAL_TODAY,
  JOURNAL_STRATEGIES,
  JOURNAL_EMOTIONS,
} from '../../data/journalData';
import { FolderTabs, FolderTabItem } from '../common/FolderTabs';
import { JournalEntryWizard } from './JournalEntryWizard';

type WizardPrefill = React.ComponentProps<typeof JournalEntryWizard>['prefill'];
import { JournalEntryDetail } from './JournalEntryDetail';
import { JournalCalendar } from './JournalCalendar';
import { JournalTradeLog } from './JournalTradeLog';
import { JournalInsights } from './JournalInsights';
import { JournalPlaybooks } from './JournalPlaybooks';
import { DEFAULT_PLAYBOOKS, JournalPlaybook } from '../../data/journalPlaybooks';
import { JournalCumulativeChart } from './JournalCumulativeChart';
import { DisciplineCard, RulesMonitor, TiltMonitor } from './JournalMonitors';
import { CashbackMode, PnlMode, RangeMode, UNASSIGNED, addMonth, brokerColor, computeKpis, entryCashback, entryPoints, entryValue, rangeBounds, shortDate } from './journalOverview';

type JournalTab = 'overview' | 'entries' | 'insights' | 'playbook' | 'review';

interface TradingJournalPageProps {
  userTierLevel: number;
  isLoggedIn: boolean;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
  brokers?: Broker[];
  onConnectBroker?: (broker: Broker) => void;
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

export const TradingJournalPage: React.FC<TradingJournalPageProps> = ({
  userTierLevel,
  isLoggedIn,
  onUpgradePrompt,
  onShowToast,
  brokers,
  onConnectBroker,
}) => {
  const [tab, setTab] = useState<JournalTab>('overview');
  const [entries, setEntries] = useState<JournalEntry[]>(JOURNAL_ENTRIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logPreset, setLogPreset] = useState<{ ids: string[]; label: string } | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const [checklist, setChecklist] = useState<JournalChecklistItem[]>(DEFAULT_CHECKLIST);
  const [newItem, setNewItem] = useState('');
  const [playbooks, setPlaybooks] = useState<JournalPlaybook[]>(DEFAULT_PLAYBOOKS);
  const [recordings, setRecordings] = useState<Record<string, string>>({}); // entry id → replay video (object URL)
  const [rules, setRules] = useState({ maxRisk: 1, maxDailyLoss: 3, maxTrades: 3, stopAfterLosses: 2 });


  const [reviews, setReviews] = useState<JournalWeeklyReview[]>(JOURNAL_REVIEWS);
  const [rvBest, setRvBest] = useState('');
  const [rvLesson, setRvLesson] = useState('');
  const [rvFocus, setRvFocus] = useState('');

  const hasAdvanced = isLoggedIn && userTierLevel >= 3;

  // Overview toolbar + calendar state
  const [wizardMode, setWizardMode] = useState<'auto' | 'upload' | 'import' | 'manual'>('import');
  const [wizardPreset, setWizardPreset] = useState<WizardPrefill>(null);
  const openWizard = (m: 'auto' | 'upload' | 'import' | 'manual' = 'import', preset: WizardPrefill = null) => {
    setWizardPreset(preset);
    setWizardMode(m);
    setWizardOpen(true);
  };
  const [pnlMode, setPnlMode] = useState<PnlMode>('gross');
  const [calMonth, setCalMonth] = useState(JOURNAL_TODAY.slice(0, 7));
  const [rangeMode, setRangeMode] = useState<RangeMode>('month');
  const [customRange, setCustomRange] = useState({ from: `${JOURNAL_TODAY.slice(0, 7)}-01`, to: JOURNAL_TODAY });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<null | 'strategy' | 'asset' | 'outcome' | 'broker' | 'show' | 'basis'>(null);
  const [strategyOff, setStrategyOff] = useState<string[]>([]);
  const [assetOff, setAssetOff] = useState<string[]>([]);
  const [outcomeOff, setOutcomeOff] = useState<string[]>([]);
  const [brokerOff, setBrokerOff] = useState<string[]>([]);

  const [cbMode, setCbMode] = useState<CashbackMode>('off');

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
          !strategyOff.includes(e.strategy) &&
          !assetOff.includes(e.assetClass) &&
          !outcomeOff.includes(e.outcome) &&
          !brokerOff.includes(e.brokerId || UNASSIGNED)
      ),
    [entries, strategyOff, assetOff, outcomeOff, brokerOff]
  );
  // ...and additionally inside the chosen date range (used by the KPI cards and recent list)
  const scoped = useMemo(() => calEntries.filter((e) => e.date >= rangeFrom && e.date <= rangeTo), [calEntries, rangeFrom, rangeTo]);
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
  const dayEntries = useMemo(
    () => (selectedDay ? calEntries.filter((e) => e.date === selectedDay) : []),
    [calEntries, selectedDay]
  );

  const filterMenu = (
    id: 'strategy' | 'asset' | 'outcome' | 'broker',
    title: string,
    opts: { id: string; label: string; n: number; color?: string }[],
    off: string[],
    set: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <div className="relative">
      <button
        type="button"
        aria-expanded={openMenu === id}
        onClick={() => setOpenMenu(openMenu === id ? null : id)}
        className={`h-9 text-xs font-semibold border rounded-lg px-3 bg-white hover:bg-slate-50 ${off.length ? 'border-[#5338ec] text-[#5338ec]' : 'border-slate-200 text-[#0b1c30]'}`}
      >
        {title} ({opts.length - off.length}/{opts.length})
      </button>
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
    <div className="relative">
      <button
        type="button"
        aria-expanded={openMenu === id}
        onClick={() => setOpenMenu(openMenu === id ? null : id)}
        className="h-9 text-xs font-semibold border rounded-lg px-3 bg-white hover:bg-slate-50 border-slate-200 text-[#0b1c30]"
      >
        {title}: {opts.find((o) => o.id === value)?.label}
      </button>
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
    { id: 'overview', label: 'Overview' },
    { id: 'entries', label: 'Trade Log' },
    { id: 'insights', label: 'Insights' },
    { id: 'playbook', label: 'Playbook' },
    { id: 'review', label: 'Weekly Review' },
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
    const followed = entries.filter((e) => e.followedPlan).map((e) => e.pnl);
    const broke = entries.filter((e) => !e.followedPlan).map((e) => e.pnl);
    const byStrategy = JOURNAL_STRATEGIES.map((s) => {
      const list = entries.filter((e) => e.strategy === s);
      const decided = list.filter((e) => e.outcome === 'win' || e.outcome === 'loss');
      return {
        name: s,
        count: list.length,
        winRate: decided.length ? Math.round((decided.filter((e) => e.outcome === 'win').length / decided.length) * 100) : 0,
        pnl: list.reduce((a, e) => a + e.pnl, 0),
      };
    }).filter((s) => s.count > 0);
    const byEmotion = JOURNAL_EMOTIONS.map((em) => {
      const list = entries.filter((e) => e.emotionBefore === em);
      return { name: em, count: list.length, avgPnl: avg(list.map((e) => e.pnl)) };
    }).filter((e) => e.count > 0);
    const byDay = WEEKDAYS.map((d, i) => {
      const list = entries.filter((e) => new Date(`${e.date}T00:00:00Z`).getUTCDay() === i);
      return { name: d, pnl: list.reduce((a, e) => a + e.pnl, 0), count: list.length };
    });
    const mistakeMap: Record<string, number> = {};
    entries.forEach((e) => e.mistakes.forEach((m) => (mistakeMap[m] = (mistakeMap[m] || 0) + 1)));
    const mistakes = Object.entries(mistakeMap).sort((a, b) => b[1] - a[1]);
    return { followedAvg: avg(followed), brokeAvg: avg(broke), followedN: followed.length, brokeN: broke.length, byStrategy, byEmotion, byDay, mistakes };
  }, [entries]);

  const weekStart = isoDaysAgo(6);
  const weekEntries = entries.filter((e) => e.date >= weekStart);
  const weekPnl = weekEntries.reduce((a, e) => a + e.pnl, 0);

  const selected = selectedId ? entries.find((e) => e.id === selectedId) : null;

  if (selected) {
    return (
      <JournalEntryDetail
        entry={selected}
        checklist={checklist}
        onBack={() => setSelectedId(null)}
        onUpdate={(upd) => setEntries((prev) => prev.map((e) => (e.id === upd.id ? upd : e)))}
        onDelete={(id) => {
          setEntries((prev) => prev.filter((e) => e.id !== id));
          setSelectedId(null);
          onShowToast('Entry deleted');
        }}
        onShowToast={onShowToast}
      />
    );
  }

  const EntryRow: React.FC<{ e: JournalEntry }> = ({ e }) => (
    <button
      onClick={() => setSelectedId(e.id)}
      className="w-full text-left bg-white border border-[#e2e8f0] rounded-2xl p-4 hover:border-[#5338ec] transition-colors"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="w-28 shrink-0">
          <p className="text-sm font-bold text-[#0b1c30]">{e.symbol}</p>
          <p className="text-[11px] text-[#94a3b8]">{e.date}</p>
        </div>
        <span className={`text-xs font-bold shrink-0 ${e.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>{e.direction}</span>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize shrink-0 ${OUTCOME_STYLE[e.outcome]}`}>{e.outcome}</span>
        <span className={`text-xs font-bold font-mono shrink-0 ${e.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(e.pnl)}</span>
        {e.rMultiple !== null && <span className="text-xs font-mono text-[#474556] shrink-0">{e.rMultiple > 0 ? '+' : ''}{e.rMultiple}R</span>}
        <span className="px-2 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] text-[10px] font-semibold shrink-0">{e.strategy}</span>
        {e.brokerId && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#474556] shrink-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorOf(e.brokerId) }} />
            {brokerName(e.brokerId)}{entryCashback(e, brokerMap) > 0 ? ` · cb ${money(entryCashback(e, brokerMap))}` : ''}{entryPoints(e) > 0 ? ` · ${entryPoints(e)} pts` : ''}
          </span>
        )}
        <span className="text-[11px] text-[#474556] shrink-0">{e.emotionBefore} → {e.emotionAfter}</span>
        {!e.followedPlan && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 shrink-0"><AlertTriangle className="w-3 h-3" /> Off plan</span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
      </div>
      {e.setupNotes && <p className="text-xs text-[#474556] mt-2 line-clamp-1">{e.setupNotes}</p>}
    </button>
  );

  const maxAbsDay = Math.max(1, ...insights.byDay.map((d) => Math.abs(d.pnl)));
  const maxAbsEmotion = Math.max(1, ...insights.byEmotion.map((d) => Math.abs(d.avgPnl)));

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Trading Journal</h1>
          <p className="text-sm text-[#474556] mt-1">
            Write down why you traded, how you felt, and what you'd change. Patterns show up fast.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openWizard('auto')}
          className="shrink-0 text-sm font-semibold bg-[#5338ec] hover:bg-[#4326d8] text-white rounded-xl px-4 py-2.5 transition-colors"
        >
          Sync data
        </button>
      </div>

      <div className="mb-6">
        <FolderTabs tabs={tabs} activeTab={tab} onChange={setTab} />
      </div>

      {/* ───── OVERVIEW ───── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-start gap-2" role="toolbar" aria-label="Overview filters">
            <div className="flex flex-col gap-1.5">
                <select
                  aria-label="Date range"
                  value={rangeMode}
                  onChange={(e) => setRangeMode(e.target.value as RangeMode)}
                  className="h-9 text-xs font-semibold border border-slate-200 rounded-lg px-3 bg-white text-[#0b1c30]"
                >
                  <option value="month">Calendar month</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="all">All time</option>
                  <option value="custom">Custom range</option>
                </select>
                {rangeMode === 'custom' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input type="date" aria-label="From date" value={customRange.from} max={customRange.to} onChange={(e) => e.target.value && setCustomRange((r) => ({ ...r, from: e.target.value }))} className="text-xs h-9 border border-slate-200 rounded-lg px-2" />
                    <span className="text-xs text-[#94a3b8]">to</span>
                    <input type="date" aria-label="To date" value={customRange.to} min={customRange.from} onChange={(e) => e.target.value && setCustomRange((r) => ({ ...r, to: e.target.value }))} className="text-xs h-9 border border-slate-200 rounded-lg px-2" />
                  </div>
                )}
              <span className="text-xs font-mono text-[#474556] px-1" aria-live="polite">{rangeLabel}</span>
            </div>

            {filterMenu('strategy', 'Playbook', JOURNAL_STRATEGIES.map((v) => ({ id: v, label: v, n: entries.filter((e) => e.strategy === v).length })), strategyOff, setStrategyOff)}
            {filterMenu('asset', 'Market type', ['Forex', 'Crypto', 'Stocks', 'Commodity', 'Indices'].map((v) => ({ id: v, label: v, n: entries.filter((e) => e.assetClass === v).length })), assetOff, setAssetOff)}
            {filterMenu('outcome', 'Outcome', (['win', 'loss', 'breakeven', 'open'] as const).map((v) => ({ id: v, label: v === 'win' ? 'Wins' : v === 'loss' ? 'Losses' : v === 'breakeven' ? 'Breakeven' : 'Open', n: entries.filter((e) => e.outcome === v).length })), outcomeOff, setOutcomeOff)}
            {filterMenu('broker', 'Broker', chartBrokers.map((b) => ({ id: b.id, label: b.name, n: b.n, color: b.color })), brokerOff, setBrokerOff)}

            {choiceMenu<CashbackMode>('show', 'Show', [{ id: 'off', label: 'Trading' }, { id: 'include', label: '+ Cashback' }, { id: 'points', label: 'Points' }], cbMode, setCbMode)}
            {choiceMenu<PnlMode>('basis', 'Basis', [{ id: 'gross', label: 'Gross' }, { id: 'net', label: 'Net' }], pnlMode, setPnlMode)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1 capitalize">{cbMode === 'points' ? 'MarketSyde Points' : `${valueLabel} P&L`}</p>
              <p className={`text-xl font-bold font-mono ${shownTotal > 0 ? 'text-emerald-600' : shownTotal < 0 ? 'text-rose-600' : ''}`}>{kpi.count ? (cbMode === 'points' ? `${shownTotal.toLocaleString('en-US')} pts` : money(shownTotal)) : '—'}</p>
              <p className="text-[10px] text-[#94a3b8] mt-0.5">{kpi.count} entr{kpi.count === 1 ? 'y' : 'ies'} · cashback {money(cashbackTotal)}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Win rate</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> {kpi.winRate}%</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Profit factor</p>
              <p className="text-xl font-bold font-mono">{kpi.count === 0 ? '—' : kpi.profitFactor === null ? '∞' : kpi.profitFactor.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Average R</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Target className="w-4 h-4 text-[#5338ec]" /> {kpi.avgR}R</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Plan followed</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-sky-500" /> {kpi.plan}%</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 col-span-2 md:col-span-1">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Journal streak</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /> {stats.streak} days</p>
            </div>
          </div>

          <JournalCumulativeChart entries={scoped} valueOf={valueOf} title={cbMode === 'points' ? 'MarketSyde Points' : `${valueLabel} P&L`} unit={cbMode === 'points' ? 'pts' : 'usd'} rangeLabel={rangeLabel} brokers={chartBrokers} off={brokerOff} />

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  {selectedDay ? `Trades on ${shortDate(selectedDay, true)}` : 'Recent entries'}
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
                    <button onClick={() => openWizard('manual')} className="mt-2 text-xs font-semibold text-[#5338ec] hover:underline">Add one</button>
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
            </div>

            <aside className="space-y-5">
              <JournalCalendar
                month={calMonth}
                onMonthChange={(ym) => { setCalMonth(ym); setSelectedDay(null); }}
                entries={calEntries}
                valueOf={valueOf}
                label={cbMode === 'points' ? 'points' : valueLabel}
                unit={cbMode === 'points' ? 'pts' : 'usd'}
                brokerName={brokerName}
                brokerColor={colorOf}
                today={JOURNAL_TODAY}
                selected={selectedDay}
                onSelect={setSelectedDay}
              />

              <TiltMonitor entries={calEntries} rules={rules} />
              <DisciplineCard entries={scoped} checklistLength={checklist.length} />
              <RulesMonitor entries={scoped} rules={rules} onEdit={() => setTab('playbook')} />

              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
                <h4 className="text-sm font-bold mb-2">What your journal says</h4>
                <p className="text-xs text-[#474556] leading-relaxed">
                  On trades where you followed your plan you averaged{' '}
                  <span className="font-bold text-emerald-600">{money(insights.followedAvg)}</span>. Off-plan trades averaged{' '}
                  <span className="font-bold text-rose-600">{money(insights.brokeAvg)}</span>.
                </p>
                <button onClick={() => setTab('insights')} className="mt-3 text-xs font-semibold text-[#5338ec] hover:underline">
                  See all insights
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ───── ENTRIES ───── */}
      {tab === 'entries' && (
        <JournalTradeLog
          entries={entries}
          brokers={brokers || []}
          onChange={setEntries}
          onOpen={setSelectedId}
          onNew={() => openWizard('manual')}
          onToast={onShowToast}
          preset={logPreset}
          onClearPreset={() => setLogPreset(null)}
        />
      )}

      {/* ───── INSIGHTS ───── */}
      {tab === 'insights' && (
        <JournalInsights
          entries={entries}
          brokers={brokers || []}
          onToast={onShowToast}
          onDrill={(ids, label) => { setLogPreset({ ids, label }); setTab('entries'); }}
          overview={(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4">Plan adherence</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-emerald-700 mb-1">Followed plan ({insights.followedN})</p>
                <p className="text-lg font-bold text-emerald-600 font-mono">{money(insights.followedAvg)}</p>
                <p className="text-[10px] text-emerald-700">avg per trade</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-rose-700 mb-1">Broke plan ({insights.brokeN})</p>
                <p className="text-lg font-bold text-rose-600 font-mono">{money(insights.brokeAvg)}</p>
                <p className="text-[10px] text-rose-700">avg per trade</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4">By strategy</h4>
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
            <h4 className="text-sm font-bold mb-4">P&amp;L by weekday</h4>
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
            <h4 className="text-sm font-bold mb-4">Emotion vs. result</h4>
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
            <h4 className="text-sm font-bold mb-4">Most common mistakes</h4>
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

      {/* ───── PLAYBOOK ───── */}
      {tab === 'playbook' && (
        <JournalPlaybooks
          entries={entries}
          playbooks={playbooks}
          setPlaybooks={setPlaybooks}
          onOpenEntry={setSelectedId}
          onShowTrades={(ids, label) => { setLogPreset({ ids, label }); setTab('entries'); }}
          onToast={onShowToast}
          houseChecklist={checklist}
          recordings={recordings}
          onSetRecording={(id, blob) => setRecordings((r) => {
            const next = { ...r };
            if (next[id]) URL.revokeObjectURL(next[id]);
            if (blob) next[id] = URL.createObjectURL(blob); else delete next[id];
            return next;
          })}
          onLogTrade={(pre) => openWizard('manual', pre)}
          houseRules={(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h4 className="flex items-center gap-1.5 text-sm font-bold mb-1"><BookOpen className="w-4 h-4 text-[#5338ec]" /> Pre-trade checklist</h4>
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
            <h4 className="flex items-center gap-1.5 text-sm font-bold mb-1"><ShieldCheck className="w-4 h-4 text-[#5338ec]" /> Trading rules</h4>
            <p className="text-xs text-[#474556] mb-4">Your hard limits. Write them when you're calm, not mid-trade.</p>
            <div className="space-y-3.5">
              {([
                ['maxRisk', 'Max risk per trade', '% of account'],
                ['maxDailyLoss', 'Max daily loss', '% of account'],
                ['maxTrades', 'Max trades per day', 'trades'],
                ['stopAfterLosses', 'Stop after consecutive losses', 'losses'],
              ] as const).map(([key, label, unit]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{label}</span>
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

      {/* ───── WEEKLY REVIEW ───── */}
      {tab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-[#474556] mb-1">Entries this week</p>
                <p className="text-xl font-bold">{weekEntries.length}</p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-[#474556] mb-1">Net P&amp;L</p>
                <p className={`text-xl font-bold font-mono ${weekPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(weekPnl)}</p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-[#474556] mb-1">Off-plan trades</p>
                <p className="text-xl font-bold">{weekEntries.filter((e) => !e.followedPlan).length}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold">This week's review</h4>
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
                    { id: `wr_${Date.now()}`, weekLabel: 'Sep 29 – Oct 5', bestTrade: rvBest, biggestLesson: rvLesson, focusNextWeek: rvFocus, entriesCount: weekEntries.length, netPnl: weekPnl },
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
            <h4 className="text-sm font-bold">Past reviews</h4>
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold">{r.weekLabel}</p>
                  <span className={`text-xs font-bold font-mono ${r.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(r.netPnl)}</span>
                </div>
                {r.bestTrade && <p className="text-xs text-[#474556] mb-1"><span className="font-semibold text-[#0b1c30]">Best:</span> {r.bestTrade}</p>}
                {r.biggestLesson && <p className="text-xs text-[#474556] mb-1"><span className="font-semibold text-[#0b1c30]">Lesson:</span> {r.biggestLesson}</p>}
                {r.focusNextWeek && <p className="text-xs text-[#474556]"><span className="font-semibold text-[#0b1c30]">Focus:</span> {r.focusNextWeek}</p>}
              </div>
            ))}
          </aside>
        </div>
      )}

      {wizardOpen && (
        <JournalEntryWizard
          initialMode={wizardMode}
          prefill={wizardPreset}
          strategies={playbooks.filter((p) => p.status !== 'archived').map((p) => p.name)}
          checklist={checklist}
          journaledTradeIds={entries.map((e) => e.linkedTradeId).filter((x): x is string => !!x)}
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
          onSave={(entry) => {
            setEntries((prev) => [entry, ...prev]);
            setWizardOpen(false);
            setTab('entries');
            onShowToast('Journal entry saved');
          }}
        />
      )}
    </div>
  );
};
