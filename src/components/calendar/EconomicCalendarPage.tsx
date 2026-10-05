import React, { useEffect, useMemo, useState } from 'react';
import {
  Info,
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Star,
  Bell,
  BellRing,
  Sparkles,
  Volume2,
  SlidersHorizontal,
  Plus,
  Minus,
  ArrowRight,
  X,
} from 'lucide-react';
import { EconomicEvent, EventCategory, Broker } from '../../types';
import {
  ECONOMIC_EVENTS,
  CALENDAR_NOW,
  CALENDAR_TIMEZONES,
  CALENDAR_COUNTRIES,
  CALENDAR_CATEGORIES,
  CALENDAR_FAQ,
  HOLIDAYS,
  EARNINGS,
  DIVIDENDS,
  IPOS,
  CALENDAR_SAMPLE_NOTE,
  EVENT_NOTES,
  IMPACT_STARS,
  IMPACT_STYLES,
} from '../../data/economicCalendarData';
import { INITIAL_BROKERS } from '../../data/mockData';
import { EventDetailModal } from './EventDetailModal';
import { CalendarSidePanel, SidePanel } from './CalendarSidePanel';

type PageTab = 'calendar' | 'holidays' | 'earnings' | 'dividends' | 'ipo';
type RangeId = 'yesterday' | 'today' | 'tomorrow' | 'week' | 'nextweek' | 'custom';

interface EconomicCalendarPageProps {
  events?: EconomicEvent[];
  userTierLevel: number;
  isLoggedIn: boolean;
  isAdvisor?: boolean;
  isBroker?: boolean;
  onNavigateToArticle?: (articleId: string) => void;
  onNavigateToSignal?: (ticker: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenConnectModal?: (broker?: Broker) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const ANCHOR_MS = Date.parse(CALENDAR_NOW);
const DAY_MS = 86400000;
const BASIC_ALERT_LIMIT = 3;
const HOUR = 3600000;

const pad = (n: number) => String(n).padStart(2, '0');
const shifted = (ms: number, off: number) => new Date(ms + off * HOUR);
const dayKeyOf = (ms: number, off: number) => shifted(ms, off).toISOString().slice(0, 10);
const hhmmOf = (ms: number, off: number) => {
  const d = shifted(ms, off);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
const addDays = (key: string, n: number) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const longDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
const shortDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

const num = (s?: string) => (s ? parseFloat(s.replace(/[^0-9.\-]/g, '')) : NaN);

const ROW_GRID = 'md:grid-cols-[72px_64px_minmax(0,1fr)_72px_84px_84px_84px_88px]';

const brokerColor = (name: string) => {
  const palette = ['#5338ec', '#0b1c30', '#FD02B0', '#0d9488', '#334155', '#8d6a1f', '#3410D5', '#be185d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

export const EconomicCalendarPage: React.FC<EconomicCalendarPageProps> = ({
  events: eventsProp = ECONOMIC_EVENTS,
  userTierLevel,
  isLoggedIn,
  isAdvisor = false,
  isBroker = false,
  onNavigateToArticle,
  onNavigateToSignal,
  onNavigateToTab,
  onOpenConnectModal,
  onUpgradePrompt,
  onShowToast,
}) => {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const NOW_MS = nowMs;

  // The sample dataset is anchored to one day. Shift it so "today" in the data is the real today (GMT+7).
  const dayDelta = useMemo(() => {
    const realKey = new Date(Date.now() + 7 * HOUR).toISOString().slice(0, 10);
    const anchorKey = new Date(ANCHOR_MS + 7 * HOUR).toISOString().slice(0, 10);
    return Math.round((Date.parse(`${realKey}T00:00:00Z`) - Date.parse(`${anchorKey}T00:00:00Z`)) / DAY_MS);
  }, []);
  const rebasedEvents = useMemo(
    () =>
      dayDelta === 0
        ? eventsProp
        : eventsProp.map((e) => ({
            ...e,
            at: new Date(Date.parse(e.at) + dayDelta * DAY_MS).toISOString(),
            date: e.date ? addDays(e.date, dayDelta) : e.date,
          })),
    [eventsProp, dayDelta]
  );
  const events = rebasedEvents;

  const [tab, setTab] = useState<PageTab>('calendar');
  const [range, setRange] = useState<RangeId>('today');
  const [customFrom, setCustomFrom] = useState('2026-10-05');
  const [customTo, setCustomTo] = useState('2026-10-09');
  const [tz, setTz] = useState(7);
  const [displayMode, setDisplayMode] = useState<'all' | 'remaining'>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [impSel, setImpSel] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [countrySel, setCountrySel] = useState<string[]>([]);
  const [catSel, setCatSel] = useState<EventCategory[]>([]);
  const [watchedIds, setWatchedIds] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<Record<string, number>>({});
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [panel, setPanel] = useState<SidePanel>('markets');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const hasAiAccess = isLoggedIn && userTierLevel >= 3;
  const alertsLimited = !(isLoggedIn && userTierLevel >= 3);
  const tzLabel = CALENDAR_TIMEZONES.find((t) => t.offset === tz)?.label || 'GMT';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 360);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const todayKey = dayKeyOf(NOW_MS, tz);
  const weekStart = addDays(todayKey, -((new Date(`${todayKey}T00:00:00Z`).getUTCDay() + 6) % 7));

  const [rangeFrom, rangeTo] = useMemo<[string, string]>(() => {
    switch (range) {
      case 'yesterday': return [addDays(todayKey, -1), addDays(todayKey, -1)];
      case 'tomorrow': return [addDays(todayKey, 1), addDays(todayKey, 1)];
      case 'week': return [weekStart, addDays(weekStart, 6)];
      case 'nextweek': return [addDays(weekStart, 7), addDays(weekStart, 13)];
      case 'custom': return customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom];
      default: return [todayKey, todayKey];
    }
  }, [range, todayKey, weekStart, customFrom, customTo]);

  const eventMs = (e: EconomicEvent) => Date.parse(e.at);
  const eventKey = (e: EconomicEvent) => (e.allDay && e.date ? e.date : dayKeyOf(eventMs(e), tz));

  const whenLabel = (e: EconomicEvent) =>
    e.allDay ? `${shortDate(eventKey(e))}, All day` : `${shortDate(eventKey(e))}, ${hhmmOf(eventMs(e), tz)} (${tzLabel})`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => {
        const k = eventKey(e);
        if (k < rangeFrom || k > rangeTo) return false;
        if (!impSel[IMPACT_STARS[e.impact]]) return false;
        if (countrySel.length && !countrySel.includes(e.currency)) return false;
        if (catSel.length && !catSel.includes(e.category)) return false;
        if (q && !(e.title.toLowerCase().includes(q) || e.country.toLowerCase().includes(q) || e.currency.toLowerCase().includes(q))) return false;
        if (displayMode === 'remaining' && !e.allDay && eventMs(e) <= NOW_MS && k === todayKey) return false;
        return true;
      })
      .sort((a, b) => {
        const ka = eventKey(a);
        const kb = eventKey(b);
        if (ka !== kb) return ka.localeCompare(kb);
        if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1;
        return eventMs(a) - eventMs(b);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, search, rangeFrom, rangeTo, impSel, countrySel, catSel, displayMode, tz, NOW_MS]);

  const groups = useMemo(() => {
    const map = new Map<string, EconomicEvent[]>();
    filtered.forEach((e) => {
      const k = eventKey(e);
      map.set(k, [...(map.get(k) || []), e]);
    });
    return Array.from(map.entries());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, tz]);

  const digest = useMemo(
    () =>
      events
        .filter((e) => !e.allDay && eventMs(e) > NOW_MS && eventMs(e) <= NOW_MS + 24 * HOUR && e.impact !== 'Low')
        .sort((a, b) => eventMs(a) - eventMs(b)),
    [events, NOW_MS]
  );

  const aiEvents = useMemo(() => events.filter((e) => !e.allDay && eventMs(e) > NOW_MS && e.aiPrediction).slice(0, 5), [events, NOW_MS]);
  const watchedEvents = events.filter((e) => watchedIds[e.id]);
  const alertEvents = Object.entries(alerts)
    .map(([id, lead]) => ({ event: events.find((e) => e.id === id)!, lead }))
    .filter((x) => !!x.event);

  const toggleWatch = (id: string) => {
    const next = !watchedIds[id];
    setWatchedIds((prev) => ({ ...prev, [id]: next }));
    onShowToast(next ? 'Added to Watched Events' : 'Removed from Watched Events');
  };

  const setAlert = (id: string, lead: number | null) => {
    if (lead === null) {
      setAlerts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      onShowToast('Reminder removed');
      return;
    }
    const isNew = alerts[id] === undefined;
    if (isNew && alertsLimited && Object.keys(alerts).length >= BASIC_ALERT_LIMIT) {
      onShowToast(`Your plan includes ${BASIC_ALERT_LIMIT} reminders. Upgrade for unlimited.`);
      onUpgradePrompt();
      return;
    }
    setAlerts((prev) => ({ ...prev, [id]: lead }));
    onShowToast(`Reminder set for ${lead} minutes before`);
  };

  const toggleBell = (e: EconomicEvent) => {
    if (e.allDay || eventMs(e) <= NOW_MS) {
      onShowToast('This event has already happened.');
      return;
    }
    setAlert(e.id, alerts[e.id] !== undefined ? null : 15);
  };

  function toggleIn<T>(list: T[], v: T, set: (l: T[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  const activeFilterCount =
    (Object.values(impSel).filter(Boolean).length < 3 ? 1 : 0) + (countrySel.length ? 1 : 0) + (catSel.length ? 1 : 0);

  const resetFilters = () => {
    setImpSel({ 1: true, 2: true, 3: true });
    setCountrySel([]);
    setCatSel([]);
  };

  const actualClass = (e: EconomicEvent) => {
    const a = num(e.actual);
    const f = num(e.forecast);
    if (Number.isNaN(a) || Number.isNaN(f)) return 'text-[#0b1c30]';
    if (a > f) return 'text-emerald-600';
    if (a < f) return 'text-rose-600';
    return 'text-[#0b1c30]';
  };

  const alertLimitLabel = alertsLimited
    ? `${Object.keys(alerts).length} of ${BASIC_ALERT_LIMIT} reminders used on your plan`
    : 'Unlimited reminders on your plan';

  const goTab = (t: PageTab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rangePills: { id: RangeId; label: string }[] = [
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'week', label: 'This Week' },
    { id: 'nextweek', label: 'Next Week' },
  ];

  const nowMarkerIndex = (rows: EconomicEvent[]) => {
    if (!rows.some((r) => !r.allDay)) return -1;
    const firstFuture = rows.findIndex((r) => !r.allDay && eventMs(r) > NOW_MS);
    return firstFuture === -1 ? rows.length : firstFuture;
  };

  const NowMarker = () => (
    <div className="relative h-0 border-t-2 border-[#5338ec]">
      <span className="absolute -top-3.5 left-2 bg-white border border-[#5338ec] text-[#5338ec] text-[11px] font-bold font-mono px-1.5 rounded">
        {hhmmOf(NOW_MS, tz)}
      </span>
    </div>
  );

  return (
    <div className="w-full">
      {/* Sticky tools strip (appears after scrolling) */}
      {scrolled && (
        <div className="fixed top-[68px] left-0 right-0 z-30 bg-white/95 backdrop-blur border-b border-[#e2e8f0] shadow-xs">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 flex items-center gap-1 overflow-x-auto">
            {([
              ['Economic Calendar', () => goTab('calendar'), tab === 'calendar'],
              ['Holidays', () => goTab('holidays'), tab === 'holidays'],
              ['Earnings', () => goTab('earnings'), tab === 'earnings'],
              ['Dividends', () => goTab('dividends'), tab === 'dividends'],
              ['IPO', () => goTab('ipo'), tab === 'ipo'],
              ['Currency Converter', () => onNavigateToTab?.('currency-converter'), false],
              ['Fibonacci Calculator', () => onNavigateToTab?.('fibonacci-calculator'), false],
              ['Volatility Calculator', () => onNavigateToTab?.('volatility-calculator'), false],
              ['Pip Calculator', () => onNavigateToTab?.('pip-calculator'), false],
            ] as [string, () => void, boolean][]).map(([label, fn, active]) => (
              <button
                key={label}
                onClick={fn}
                className={`px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active ? 'text-[#5338ec] bg-[#F8F7FF]' : 'text-[#474556] hover:text-[#5338ec]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
        {/* Title + search */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">
              Economic Calendar
              <span title="Scheduled data releases and events that can move the markets.">
                <Info className="w-4 h-4 text-slate-400" />
              </span>
            </h1>
            <p className="text-sm text-[#474556] mt-2">
              Ready to act on market events?{' '}
              <button onClick={() => onNavigateToTab?.('broker-comparison')} className="font-semibold text-[#5338ec] hover:underline">
                Compare brokers
              </button>
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for event name"
              className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Page tabs */}
        <div className="flex items-center gap-7 border-b-2 border-[#f1f5f9] mt-6 mb-6 overflow-x-auto">
          {([
            ['calendar', 'Economic Calendar'],
            ['holidays', 'Holidays'],
            ['earnings', 'Earnings'],
            ['dividends', 'Dividends'],
            ['ipo', 'IPO'],
          ] as [PageTab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`pb-3 -mb-0.5 text-base font-bold whitespace-nowrap border-b-2 transition-colors ${
                tab === id ? 'text-[#5338ec] border-[#5338ec]' : 'text-[#0b1c30] border-transparent hover:text-[#5338ec]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ───────── ECONOMIC CALENDAR ───────── */}
        {tab === 'calendar' && (
          <>
            {digest.length > 0 && (
              <div className="bg-[#0b1c30] rounded-2xl px-5 py-4 mb-6 overflow-hidden">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#ABA1F8] mb-3">
                  <Clock className="w-3.5 h-3.5" /> Next 24 hours
                </p>
                <div className="flex gap-3 overflow-x-auto scrollbar-none">
                  {digest.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEvent(e)}
                      className="shrink-0 flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${IMPACT_STYLES[e.impact].dot}`} />
                      <span className="text-xs text-white/60 font-mono shrink-0">{hhmmOf(eventMs(e), tz)}</span>
                      <span className="text-sm font-semibold text-white whitespace-nowrap">{e.countryFlag} {e.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Range pills + Show filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {rangePills.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setRange(p.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                      range === p.id
                        ? 'border-[#5338ec] text-[#5338ec] bg-white'
                        : 'border-transparent bg-[#f1f5f9] text-[#0b1c30] hover:bg-[#e8ecf3]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setRange('custom')}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                    range === 'custom'
                      ? 'border-[#5338ec] text-[#5338ec] bg-white'
                      : 'border-transparent bg-[#f1f5f9] text-[#0b1c30] hover:bg-[#e8ecf3]'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" /> Custom dates
                </button>
              </div>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center gap-1.5 border border-[#5338ec]/30 hover:border-[#5338ec] text-[#5338ec] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#5338ec] text-white text-[11px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {range === 'custom' && (
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                <label className="flex items-center gap-2 font-semibold text-[#474556]">
                  From
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </label>
                <label className="flex items-center gap-2 font-semibold text-[#474556]">
                  To
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </label>
              </div>
            )}

            {showFilters && (
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 mb-5 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Importance</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setImpSel((p) => ({ ...p, [n]: !p[n] }))}
                        className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          impSel[n] ? 'bg-[#EEF0FE] border-[#5338ec] text-[#5338ec]' : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {Array.from({ length: n }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                        {n === 1 ? 'Low' : n === 2 ? 'Medium' : 'High'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">
                    Countries {countrySel.length === 0 && <span className="normal-case font-medium text-[#94a3b8]">(all)</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CALENDAR_COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => toggleIn(countrySel, c.code, setCountrySel)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          countrySel.includes(c.code) ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'
                        }`}
                      >
                        {c.flag} {c.code}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">
                    Category {catSel.length === 0 && <span className="normal-case font-medium text-[#94a3b8]">(all)</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CALENDAR_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleIn(catSel, c, setCatSel)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          catSel.includes(c) ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-500">
                  <X className="w-3.5 h-3.5" /> Reset filters
                </button>
              </div>
            )}

            {/* Time controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-2 text-[#5338ec] font-semibold">
                  <Clock className="w-4 h-4" /> Current Time:{' '}
                  <span className="font-mono font-bold text-[#0b1c30]">{hhmmOf(NOW_MS, tz)}</span>
                  <select value={tz} onChange={(e) => setTz(Number(e.target.value))} className="text-xs font-semibold text-[#0b1c30] border border-slate-200 rounded-lg px-2 py-1 bg-white">
                    {CALENDAR_TIMEZONES.map((t) => (
                      <option key={t.label} value={t.offset}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </span>
                <span className="flex items-center gap-2 text-[#5338ec] font-semibold">
                  Display Time:
                  <select value={displayMode} onChange={(e) => setDisplayMode(e.target.value as 'all' | 'remaining')} className="text-xs font-semibold text-[#0b1c30] border border-slate-200 rounded-lg px-2 py-1 bg-white">
                    <option value="all">All events</option>
                    <option value="remaining">Remaining today</option>
                  </select>
                </span>
              </div>
              <span className="text-xs text-[#474556]">Actual values appear as releases are confirmed.</span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_440px] gap-6 items-start">
              {/* Table */}
              <div>
                <div className={`hidden md:grid ${ROW_GRID} gap-2 px-3 py-3 text-sm font-bold text-[#0b1c30] border-b border-[#e2e8f0]`}>
                  <span>Time</span>
                  <span>Cur.</span>
                  <span>Event</span>
                  <span>Imp.</span>
                  <span className="text-right">Actual</span>
                  <span className="text-right">Forecast</span>
                  <span className="text-right">Previous</span>
                  <span />
                </div>

                {groups.length === 0 && (
                  <div className="py-16 text-center text-sm text-[#474556]">
                    No events match these filters. Try a wider date range or reset the filters.
                  </div>
                )}

                {groups.map(([key, rows]) => {
                  const markerAt = key === todayKey ? nowMarkerIndex(rows) : -1;
                  return (
                    <div key={key}>
                      <div className="text-center text-sm font-bold text-[#0b1c30] py-3.5 bg-[#fafbfe] border-b border-[#f1f5f9]">
                        {longDate(key)}
                      </div>
                      {rows.map((e, idx) => {
                        const stars = IMPACT_STARS[e.impact];
                        const hasFlag = watchedIds[e.id] || alerts[e.id] !== undefined;
                        return (
                          <React.Fragment key={e.id}>
                            {markerAt === idx && <NowMarker />}
                            <div
                              onClick={() => setSelectedEvent(e)}
                              className={`group grid grid-cols-1 ${ROW_GRID} gap-2 items-center px-3 py-3 border-b border-[#f1f5f9] cursor-pointer hover:bg-[#f8f9fc] transition-colors`}
                            >
                              <span className="text-sm text-[#0b1c30]">{e.allDay ? 'All Day' : hhmmOf(eventMs(e), tz)}</span>
                              <span className="flex items-center gap-1.5 text-sm text-[#0b1c30]">
                                <span className="text-base leading-none">{e.countryFlag}</span>
                                {e.currency}
                              </span>
                              <span className="flex items-center gap-2 text-sm text-[#0b1c30] min-w-0">
                                <span className="truncate">{e.title}</span>
                                {e.hasSpeech && <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />}
                              </span>
                              {e.allDay ? (
                                <span className="md:col-span-4 text-sm font-bold text-[#0b1c30]">Holiday</span>
                              ) : (
                                <>
                                  <div className="flex items-center gap-0.5" title={`${e.impact} impact`}>
                                    {[1, 2, 3].map((i) => (
                                      <Star key={i} className={`w-3.5 h-3.5 ${i <= stars ? IMPACT_STYLES[e.impact].star : 'text-slate-200 fill-slate-200'}`} />
                                    ))}
                                  </div>
                                  <span className={`text-sm font-bold md:text-right ${actualClass(e)}`}>{e.actual || ''}</span>
                                  <span className="text-sm md:text-right text-[#0b1c30]">{e.forecast || ''}</span>
                                  <span className="text-sm md:text-right text-[#0b1c30]">{e.previous || ''}</span>
                                </>
                              )}
                              <span className={`flex items-center justify-end gap-2 transition-opacity ${hasFlag ? 'opacity-100' : 'md:opacity-0 md:group-hover:opacity-100'}`}>
                                <button
                                  onClick={(ev) => { ev.stopPropagation(); toggleWatch(e.id); }}
                                  aria-label="Watch event"
                                  className={watchedIds[e.id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}
                                >
                                  <Star className={`w-4 h-4 ${watchedIds[e.id] ? 'fill-current' : ''}`} />
                                </button>
                                {!e.allDay && (
                                  <button
                                    onClick={(ev) => { ev.stopPropagation(); toggleBell(e); }}
                                    aria-label="Set reminder"
                                    className={alerts[e.id] !== undefined ? 'text-[#5338ec]' : 'text-slate-400 hover:text-[#5338ec]'}
                                  >
                                    {alerts[e.id] !== undefined ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                  </button>
                                )}
                                {e.aiPrediction && !e.allDay && (
                                  <button
                                    onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); }}
                                    aria-label="AI predicted reaction"
                                    className="text-slate-400 hover:text-[#5338ec]"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                  </button>
                                )}
                              </span>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      {markerAt === rows.length && <NowMarker />}
                    </div>
                  );
                })}
              </div>

              {/* Right panel */}
              <div className="xl:sticky xl:top-28">
                <CalendarSidePanel
                  panel={panel}
                  onPanelChange={setPanel}
                  watchedEvents={watchedEvents}
                  alertEvents={alertEvents}
                  aiEvents={aiEvents}
                  hasAiAccess={hasAiAccess}
                  alertLimitLabel={alertLimitLabel}
                  eventWhen={whenLabel}
                  onOpenEvent={setSelectedEvent}
                  onRemoveAlert={(id) => setAlert(id, null)}
                  onUpgradePrompt={onUpgradePrompt}
                  onNavigateToTab={onNavigateToTab}
                  onOpenConnectModal={onOpenConnectModal}
                />
              </div>
            </div>
          </>
        )}

        {/* ───────── HOLIDAYS ───────── */}
        {tab === 'holidays' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[140px_100px_80px_minmax(0,1fr)_240px] gap-3 px-5 py-3 text-sm font-bold text-[#0b1c30] border-b border-[#e2e8f0]">
              <span>Date</span><span>Day</span><span>Cur.</span><span>Holiday</span><span>Market impact</span>
            </div>
            {HOLIDAYS.map((h, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[140px_100px_80px_minmax(0,1fr)_240px] gap-1 md:gap-3 px-5 py-3.5 border-b border-[#f1f5f9] text-sm text-[#0b1c30]">
                <span className="font-semibold">{h.date}</span>
                <span>{h.weekday}</span>
                <span className="font-semibold">{h.cur}</span>
                <span>{h.holiday}</span>
                <span className="text-[#474556]">{h.impact}</span>
              </div>
            ))}
          </div>
        )}

        {/* ───────── EARNINGS ───────── */}
        {tab === 'earnings' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[100px_130px_minmax(0,1fr)_90px_120px_120px_140px] gap-3 px-5 py-3 text-sm font-bold text-[#0b1c30] border-b border-[#e2e8f0]">
              <span>Date</span><span>Time</span><span>Company</span><span>Ticker</span>
              <span className="text-right">EPS forecast</span><span className="text-right">EPS previous</span><span className="text-right">Revenue forecast</span>
            </div>
            {EARNINGS.map((r, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[100px_130px_minmax(0,1fr)_90px_120px_120px_140px] gap-1 md:gap-3 px-5 py-3.5 border-b border-[#f1f5f9] text-sm text-[#0b1c30]">
                <span className="font-semibold">{r.date}</span>
                <span className="text-[#474556]">{r.time}</span>
                <span>{r.company}</span>
                <span className="font-bold">{r.ticker}</span>
                <span className="md:text-right font-mono">{r.epsForecast}</span>
                <span className="md:text-right font-mono">{r.epsPrevious}</span>
                <span className="md:text-right font-mono">{r.revenueForecast}</span>
              </div>
            ))}
            <p className="px-5 py-3 text-[11px] text-[#94a3b8]">{CALENDAR_SAMPLE_NOTE}</p>
          </div>
        )}

        {/* ───────── DIVIDENDS ───────── */}
        {tab === 'dividends' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[100px_minmax(0,1fr)_90px_120px_100px_120px] gap-3 px-5 py-3 text-sm font-bold text-[#0b1c30] border-b border-[#e2e8f0]">
              <span>Ex-date</span><span>Company</span><span>Ticker</span>
              <span className="text-right">Dividend</span><span className="text-right">Yield</span><span className="text-right">Pay date</span>
            </div>
            {DIVIDENDS.map((r, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[100px_minmax(0,1fr)_90px_120px_100px_120px] gap-1 md:gap-3 px-5 py-3.5 border-b border-[#f1f5f9] text-sm text-[#0b1c30]">
                <span className="font-semibold">{r.exDate}</span>
                <span>{r.company}</span>
                <span className="font-bold">{r.ticker}</span>
                <span className="md:text-right font-mono">{r.dividend}</span>
                <span className="md:text-right font-mono">{r.yield}</span>
                <span className="md:text-right text-[#474556]">{r.payDate}</span>
              </div>
            ))}
            <p className="px-5 py-3 text-[11px] text-[#94a3b8]">{CALENDAR_SAMPLE_NOTE}</p>
          </div>
        )}

        {/* ───────── IPO ───────── */}
        {tab === 'ipo' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[100px_minmax(0,1fr)_100px_170px_110px_110px] gap-3 px-5 py-3 text-sm font-bold text-[#0b1c30] border-b border-[#e2e8f0]">
              <span>Date</span><span>Company</span><span>Exchange</span><span>Price range</span><span className="text-right">Shares</span><span className="text-right">Status</span>
            </div>
            {IPOS.map((r, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[100px_minmax(0,1fr)_100px_170px_110px_110px] gap-1 md:gap-3 px-5 py-3.5 border-b border-[#f1f5f9] text-sm text-[#0b1c30]">
                <span className="font-semibold">{r.date}</span>
                <span>{r.company}</span>
                <span className="font-semibold">{r.exchange}</span>
                <span className="font-mono">{r.priceRange}</span>
                <span className="md:text-right font-mono">{r.shares}</span>
                <span className="md:text-right">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${r.status === 'Priced' ? 'bg-emerald-50 text-emerald-600' : r.status === 'Expected' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {r.status}
                  </span>
                </span>
              </div>
            ))}
            <p className="px-5 py-3 text-[11px] text-[#94a3b8]">{CALENDAR_SAMPLE_NOTE} Company names are made up.</p>
          </div>
        )}

        {/* ───────── FAQ ───────── */}
        <div className="mt-14">
          <h2 className="text-2xl font-display font-bold text-[#0b1c30] mb-4">FAQ</h2>
          <div className="border-t border-[#e2e8f0]">
            {CALENDAR_FAQ.map((f, i) => (
              <button
                key={f.q}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full text-left py-5 border-b border-[#e2e8f0] group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-[#0b1c30] group-hover:text-[#5338ec] transition-colors mb-1.5">{f.q}</p>
                    <p className={`text-sm text-[#474556] leading-relaxed ${faqOpen === i ? '' : 'line-clamp-1'}`}>{f.a}</p>
                  </div>
                  {faqOpen === i ? <Minus className="w-5 h-5 text-slate-400 shrink-0 mt-1" /> : <Plus className="w-5 h-5 text-slate-400 shrink-0 mt-1" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ───────── Compare brokers banner ───────── */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-[#F4F2FF] border-l-4 border-[#5338ec] rounded-2xl px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
              <CalendarIcon className="w-6 h-6 text-[#5338ec]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0b1c30]">Ready to act on market events?</p>
              <p className="text-sm text-[#474556]">
                Compare <span className="font-bold">trusted brokers</span> and see what each one costs on the pairs these releases move.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab?.('broker-comparison')}
            className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Compare Brokers <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-6 text-sm text-[#474556] leading-relaxed">
          <span className="font-bold text-[#0b1c30]">Disclaimer:</span> Economic events and release times change often. MarketSyde shares this
          calendar for information only. Trading carries risk, and MarketSyde cannot be held responsible for any losses incurred from using it.
        </p>

        {/* ───────── Regulated broker tiles ───────── */}
        <div className="mt-10 pt-8 border-t border-[#e2e8f0]">
          <button
            onClick={() => onNavigateToTab?.('brokers')}
            className="text-xl font-display font-bold text-[#5338ec] hover:underline mb-5"
          >
            Trade with a regulated broker »
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {INITIAL_BROKERS.slice(0, 10).map((b) => (
              <button key={b.id} onClick={() => onNavigateToTab?.('brokers')} className="group text-left">
                <div
                  className="h-20 rounded-xl flex items-center justify-center text-white text-lg font-black tracking-tight px-3 text-center group-hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: brokerColor(b.name) }}
                >
                  {b.name}
                </div>
                <p className="text-[11px] text-[#474556] font-medium mt-1.5">{b.maxCashback}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          whenLabel={whenLabel(selectedEvent)}
          isWatched={!!watchedIds[selectedEvent.id]}
          alertLeadTime={alerts[selectedEvent.id] ?? null}
          hasAiAccess={hasAiAccess}
          isAdvisor={isAdvisor}
          isBroker={isBroker}
          notes={EVENT_NOTES.filter((n) => n.eventId === selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
          onToggleWatch={() => toggleWatch(selectedEvent.id)}
          onSetAlert={(lead) => setAlert(selectedEvent.id, lead)}
          onNavigateToArticle={onNavigateToArticle}
          onNavigateToSignal={onNavigateToSignal}
          onUpgradePrompt={onUpgradePrompt}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
