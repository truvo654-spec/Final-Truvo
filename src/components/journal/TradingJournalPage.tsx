import React, { useMemo, useState } from 'react';
import { Plus, Flame, Target, TrendingUp, ShieldCheck, Lock, Search, Trash2, BookOpen, Lightbulb, ChevronRight, AlertTriangle } from 'lucide-react';
import { JournalEntry, JournalChecklistItem, JournalWeeklyReview } from '../../types';
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
import { JournalEntryDetail } from './JournalEntryDetail';
import { AiJournalSummary } from './AiJournalSummary';

type JournalTab = 'overview' | 'entries' | 'insights' | 'playbook' | 'review';

interface TradingJournalPageProps {
  userTierLevel: number;
  isLoggedIn: boolean;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
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
}) => {
  const [tab, setTab] = useState<JournalTab>('overview');
  const [entries, setEntries] = useState<JournalEntry[]>(JOURNAL_ENTRIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const [checklist, setChecklist] = useState<JournalChecklistItem[]>(DEFAULT_CHECKLIST);
  const [newItem, setNewItem] = useState('');
  const [rules, setRules] = useState({ maxRisk: 1, maxDailyLoss: 3, maxTrades: 3, stopAfterLosses: 2 });

  const [search, setSearch] = useState('');
  const [fOutcome, setFOutcome] = useState<'all' | JournalEntry['outcome']>('all');
  const [fStrategy, setFStrategy] = useState('all');
  const [fEmotion, setFEmotion] = useState('all');

  const [reviews, setReviews] = useState<JournalWeeklyReview[]>(JOURNAL_REVIEWS);
  const [rvBest, setRvBest] = useState('');
  const [rvLesson, setRvLesson] = useState('');
  const [rvFocus, setRvFocus] = useState('');

  const hasAdvanced = isLoggedIn && userTierLevel >= 3;

  const tabs: FolderTabItem<JournalTab>[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'entries', label: 'Entries' },
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

  const heat = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => (counts[e.date] = (counts[e.date] || 0) + 1));
    return Array.from({ length: 35 }, (_, i) => {
      const iso = isoDaysAgo(34 - i);
      return { iso, count: counts[iso] || 0 };
    });
  }, [entries]);

  const journaledToday = entries.some((e) => e.date === JOURNAL_TODAY);

  const filtered = useMemo(
    () =>
      sorted.filter(
        (e) =>
          (fOutcome === 'all' || e.outcome === fOutcome) &&
          (fStrategy === 'all' || e.strategy === fStrategy) &&
          (fEmotion === 'all' || e.emotionBefore === fEmotion) &&
          (!search.trim() ||
            e.symbol.toLowerCase().includes(search.toLowerCase()) ||
            e.setupNotes.toLowerCase().includes(search.toLowerCase()) ||
            e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
      ),
    [sorted, fOutcome, fStrategy, fEmotion, search]
  );

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
        allEntries={entries}
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
          onClick={() => setWizardOpen(true)}
          className="shrink-0 flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> New entry
        </button>
      </div>

      <div className="mb-6">
        <FolderTabs tabs={tabs} activeTab={tab} onChange={setTab} />
      </div>

      {/* ───── OVERVIEW ───── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <AiJournalSummary entries={entries} checklistSize={checklist.length} today={JOURNAL_TODAY} onWriteEntry={() => setWizardOpen(true)} onOpenInsights={() => setTab('insights')} />

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Entries</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Win rate</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> {stats.winRate}%</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Average R</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Target className="w-4 h-4 text-[#5338ec]" /> {stats.avgR}R</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Plan followed</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-sky-500" /> {stats.plan}%</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 col-span-2 lg:col-span-1">
              <p className="text-[11px] font-semibold text-[#474556] mb-1">Journal streak</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /> {stats.streak} days</p>
            </div>
          </div>

          {!journaledToday && (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl px-5 py-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#5338ec] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">You haven't journaled today</p>
                  <p className="text-xs text-[#474556]">Two minutes now is worth more than trying to remember it on Friday.</p>
                </div>
              </div>
              <button onClick={() => setWizardOpen(true)} className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                Write an entry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Recent entries</h3>
                <button onClick={() => setTab('entries')} className="text-xs font-semibold text-[#5338ec] hover:underline">View all</button>
              </div>
              {sorted.slice(0, 4).map((e) => (
                <EntryRow key={e.id} e={e} />
              ))}
            </div>

            <aside className="space-y-5">
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
                <h4 className="text-sm font-bold mb-3">Last 5 weeks</h4>
                <div className="grid grid-cols-7 gap-1.5">
                  {heat.map((c) => (
                    <div
                      key={c.iso}
                      title={`${c.iso}: ${c.count} entr${c.count === 1 ? 'y' : 'ies'}`}
                      className={`aspect-square rounded-md ${
                        c.count === 0 ? 'bg-slate-100' : c.count === 1 ? 'bg-[#C9C2FA]' : 'bg-[#5338ec]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#94a3b8] mt-2">Darker means more entries that day.</p>
              </div>

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
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symbol, tag or notes..." className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
            </div>
            <select value={fOutcome} onChange={(e) => setFOutcome(e.target.value as typeof fOutcome)} className="text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2">
              <option value="all">Any outcome</option>
              <option value="win">Wins</option>
              <option value="loss">Losses</option>
              <option value="breakeven">Breakeven</option>
              <option value="open">Open</option>
            </select>
            <select value={fStrategy} onChange={(e) => setFStrategy(e.target.value)} className="text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2">
              <option value="all">Any strategy</option>
              {JOURNAL_STRATEGIES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={fEmotion} onChange={(e) => setFEmotion(e.target.value)} className="text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2">
              <option value="all">Any feeling before</option>
              {JOURNAL_EMOTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {filtered.map((e) => <EntryRow key={e.id} e={e} />)}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-[#474556]">
                No entries match these filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───── INSIGHTS ───── */}
      {tab === 'insights' && (
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

      {/* ───── PLAYBOOK ───── */}
      {tab === 'playbook' && (
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
          checklist={checklist}
          journaledTradeIds={entries.map((e) => e.linkedTradeId).filter((x): x is string => !!x)}
          onClose={() => setWizardOpen(false)}
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
