import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Globe2,
  BarChart3,
  Plus,
  Minus,
  ArrowRight,
  X,
  Timer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { EconomicEvent, EventCategory, Broker } from '../../types';
import {
  ECONOMIC_EVENTS,
  CALENDAR_NOW,
  CALENDAR_TIMEZONES,
  CALENDAR_COUNTRIES,
  CALENDAR_CATEGORIES,
  CALENDAR_CATEGORY_MATCHES,
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
import { createMockEconomicCalendarProvider } from '../../data/economicCalendarProvider';

type PageTab = 'calendar' | 'holidays' | 'earnings' | 'dividends' | 'ipo';
type RangeId = 'yesterday' | 'today' | 'tomorrow' | 'week' | 'nextweek' | 'twoweeks' | 'custom';
type FilterMenu = 'range' | 'impact' | 'countries' | 'marketType' | 'category' | 'timezone' | null;
type FilterId = Exclude<FilterMenu, null>;
type MarketType = 'All Markets' | 'Forex' | 'Indices' | 'Stocks' | 'Commodities' | 'Crypto';

const DEFAULT_FILTER_ORDER: FilterId[] = ['range', 'impact', 'countries', 'marketType', 'category', 'timezone'];

interface EconomicCalendarPageProps {
  events?: EconomicEvent[];
  userTierLevel: number;
  isLoggedIn: boolean;
  isAdvisor?: boolean;
  isBroker?: boolean;
  onNavigateToArticle?: (articleId: string) => void;
  onNavigateToSignal?: (ticker: string) => void;
  onNavigateToInstrument?: (symbol: string) => void;
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
const timelineDayLabel = (key: string) => {
  const date = new Date(`${key}T00:00:00Z`);
  return `${date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })} ${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}`;
};
const monthStart = (key: string) => `${key.slice(0, 7)}-01`;
const shiftMonth = (key: string, amount: number) => {
  const date = new Date(`${monthStart(key)}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7) + '-01';
};
const monthTitle = (key: string) =>
  new Date(`${monthStart(key)}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const displayDate = (key: string) => key ? key.split('-').reverse().join('/') : '—';

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
  onNavigateToInstrument,
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
  const provider = useMemo(() => createMockEconomicCalendarProvider(events), [events]);

  const [tab, setTab] = useState<PageTab>('calendar');
  const [range, setRange] = useState<RangeId>('today');
  const [customFrom, setCustomFrom] = useState('2026-10-05');
  const [customTo, setCustomTo] = useState('2026-10-09');
  const [tz, setTz] = useState(7);
  const [displayMode, setDisplayMode] = useState<'all' | 'remaining'>('all');
  const [calendarView, setCalendarView] = useState<'visualization' | 'list'>('visualization');
  const [expandedInstrumentGroup, setExpandedInstrumentGroup] = useState<string | null>(null);
  const [selectedInstrumentGroup, setSelectedInstrumentGroup] = useState<{
    market: string;
    currency: string;
    events: EconomicEvent[];
  } | null>(null);
  const [search, setSearch] = useState('');
  const [instrumentQuery, setInstrumentQuery] = useState('');
  const [openFilter, setOpenFilter] = useState<FilterMenu>(null);
  const [filterOrder, setFilterOrder] = useState<FilterId[]>(DEFAULT_FILTER_ORDER);
  const [draggingFilter, setDraggingFilter] = useState<FilterId | null>(null);
  const [impSel, setImpSel] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [countrySel, setCountrySel] = useState<string[]>([]);
  const [marketType, setMarketType] = useState<MarketType>('All Markets');
  const [catSel, setCatSel] = useState<string[]>([]);
  const [watchedIds, setWatchedIds] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<Record<string, number>>({});
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [panel, setPanel] = useState<SidePanel>('markets');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [draftRangeId, setDraftRangeId] = useState<RangeId | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => `${new Date().toISOString().slice(0, 7)}-01`);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [calendarPickerPinned, setCalendarPickerPinned] = useState(false);
  const calendarPickerRootRef = useRef<HTMLDivElement>(null);
  const calendarVisualizationRef = useRef<HTMLDivElement>(null);
  const [isCalendarFullscreen, setIsCalendarFullscreen] = useState(false);

  const hasAiAccess = isLoggedIn && userTierLevel >= 3;
  const alertsLimited = !(isLoggedIn && userTierLevel >= 3);
  const tzLabel = CALENDAR_TIMEZONES.find((t) => t.offset === tz)?.label || 'GMT';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 360);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsCalendarFullscreen(document.fullscreenElement === calendarVisualizationRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleCalendarFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await calendarVisualizationRef.current?.requestFullscreen();
    } catch {
      onShowToast('Fullscreen view is not available in this browser.');
    }
  };

  const todayKey = dayKeyOf(NOW_MS, tz);
  const weekStart = addDays(todayKey, -((new Date(`${todayKey}T00:00:00Z`).getUTCDay() + 6) % 7));

  const [rangeFrom, rangeTo] = useMemo<[string, string]>(() => {
    switch (range) {
      case 'yesterday': return [addDays(todayKey, -1), addDays(todayKey, -1)];
      case 'tomorrow': return [addDays(todayKey, 1), addDays(todayKey, 1)];
      case 'week': return [weekStart, addDays(weekStart, 6)];
      case 'nextweek': return [addDays(weekStart, 7), addDays(weekStart, 13)];
      case 'twoweeks': return [weekStart, addDays(weekStart, 13)];
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
        if (marketType !== 'All Markets' && e.assetClass !== (marketType === 'Commodities' ? 'Commodity' : marketType)) return false;
        if (catSel.length && !catSel.some((label) => CALENDAR_CATEGORY_MATCHES[label as keyof typeof CALENDAR_CATEGORY_MATCHES]?.includes(e.category))) return false;
        const instrumentSearch = instrumentQuery.trim().toLowerCase();
        if (instrumentSearch && ![e.currency, e.country, e.assetClass, e.title].some((value) => value.toLowerCase().includes(instrumentSearch))) return false;
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
  }, [events, search, instrumentQuery, rangeFrom, rangeTo, impSel, countrySel, marketType, catSel, displayMode, tz, NOW_MS]);

  const groups = useMemo(() => {
    const map = new Map<string, EconomicEvent[]>();
    filtered.forEach((e) => {
      const k = eventKey(e);
      map.set(k, [...(map.get(k) || []), e]);
    });
    return Array.from(map.entries());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, tz]);

  const timelineDays = useMemo(() => {
    const span = Math.round((Date.parse(`${rangeTo}T00:00:00Z`) - Date.parse(`${rangeFrom}T00:00:00Z`)) / DAY_MS);
    if (span <= 14) return Array.from({ length: Math.max(1, span + 1) }, (_, index) => addDays(rangeFrom, index));
    return Array.from(new Set(filtered.map((event) => eventKey(event)))).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeFrom, rangeTo, filtered, tz]);
  const timelineEvents = filtered;
  const timelineIsSingleDay = timelineDays.length === 1;
  const nextImpactful = useMemo(() => provider.getNextImpactfulEvent(NOW_MS), [provider, NOW_MS]);
  const countdown = (at: string) => {
    const remaining = Math.max(0, Date.parse(at) - NOW_MS);
    const hours = Math.floor(remaining / HOUR);
    const minutes = Math.floor((remaining % HOUR) / 60000);
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  };

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
    (Object.values(impSel).filter(Boolean).length < 3 ? 1 : 0) + (countrySel.length ? 1 : 0) + (marketType !== 'All Markets' ? 1 : 0) + (catSel.length ? 1 : 0);

  const resetFilters = () => {
    setImpSel({ 1: true, 2: true, 3: true });
    setCountrySel([]);
    setMarketType('All Markets');
    setCatSel([]);
    setInstrumentQuery('');
  };

  const reorderFilters = (target: FilterId) => {
    if (!draggingFilter || draggingFilter === target) return;
    setFilterOrder((current) => {
      const next = current.filter((id) => id !== draggingFilter);
      const targetIndex = next.indexOf(target);
      next.splice(targetIndex, 0, draggingFilter);
      return next;
    });
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
    { id: 'twoweeks', label: '2 Weeks' },
  ];
  const calendarCells = useMemo(() => {
    const first = new Date(`${calendarMonth}T00:00:00Z`);
    const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const leadingDays = first.getUTCDay();
    const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => {
      const date = new Date(first);
      date.setUTCDate(index - leadingDays + 1);
      const dateKey = date.toISOString().slice(0, 10);
      return { date: dateKey, adjacent: date.getUTCMonth() !== first.getUTCMonth() };
    });
  }, [calendarMonth]);
  const openRangePicker = (dayFrom?: string, dayTo?: string) => {
    const nextFrom = dayFrom || (range === 'custom' ? customFrom : rangeFrom);
    const nextTo = dayTo || (range === 'custom' ? customTo : rangeTo);
    setDraftFrom(nextFrom);
    setDraftTo(nextTo);
    setDraftRangeId(dayFrom ? 'custom' : range);
    setCalendarMonth(monthStart(nextFrom || todayKey));
    setOpenFilter(null);
    setShowCalendarPicker(true);
    setCalendarPickerPinned(true);
  };
  const toggleRangePicker = () => {
    if (showCalendarPicker && calendarPickerPinned) {
      setCalendarPickerPinned(false);
      setShowCalendarPicker(false);
    } else {
      openRangePicker();
    }
  };
  const selectDraftDate = (date: string) => {
    setDraftRangeId(null);
    if (!draftFrom || draftTo) {
      setDraftFrom(date);
      setDraftTo('');
    } else if (date < draftFrom) {
      setDraftFrom(date);
      setDraftTo(draftFrom);
    } else {
      setDraftTo(date);
    }
  };
  const applyDraftRange = () => {
    if (!draftFrom) return;
    const end = draftTo || draftFrom;
    setCustomFrom(draftFrom <= end ? draftFrom : end);
    setCustomTo(draftFrom <= end ? end : draftFrom);
    setRange(draftRangeId && draftRangeId !== 'custom' ? draftRangeId : 'custom');
    closeCalendarPicker();
  };
  const clearDraftRange = () => {
    setDraftFrom('');
    setDraftTo('');
    setDraftRangeId(null);
  };
  const selectQuickRange = (id: RangeId) => {
    const nextRange = id === 'custom'
      ? [customFrom, customTo]
      : id === 'yesterday'
        ? [addDays(todayKey, -1), addDays(todayKey, -1)]
        : id === 'tomorrow'
          ? [addDays(todayKey, 1), addDays(todayKey, 1)]
          : id === 'week'
            ? [weekStart, addDays(weekStart, 6)]
            : id === 'nextweek'
              ? [addDays(weekStart, 7), addDays(weekStart, 13)]
              : id === 'twoweeks'
                ? [weekStart, addDays(weekStart, 13)]
              : [todayKey, todayKey];
    setDraftFrom(nextRange[0]);
    setDraftTo(nextRange[1]);
    setDraftRangeId(id);
    setCalendarMonth(monthStart(nextRange[0]));
  };

  const closeCalendarPicker = () => {
    setCalendarPickerPinned(false);
    setShowCalendarPicker(false);
  };

  useEffect(() => {
    closeCalendarPicker();
  }, []);

  useEffect(() => {
    if (!showCalendarPicker) return;
    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (!calendarPickerRootRef.current?.contains(event.target as Node)) {
        closeCalendarPicker();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCalendarPicker();
    };
    document.addEventListener('mousedown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showCalendarPicker]);

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
            <div
              key={id}
              ref={id === 'calendar' ? calendarPickerRootRef : undefined}
              className="relative shrink-0"
            >
              <button
                onClick={() => {
                  if (id === 'calendar') {
                    setTab('calendar');
                    toggleRangePicker();
                  } else {
                    setTab(id);
                    closeCalendarPicker();
                  }
                }}
                aria-label={id === 'calendar' ? 'Economic Calendar — Calendar filters' : label}
                title={id === 'calendar' ? 'Economic Calendar — Calendar filters' : undefined}
                aria-expanded={id === 'calendar' ? showCalendarPicker : undefined}
                aria-controls={id === 'calendar' ? 'economic-calendar-date-picker' : undefined}
                className={`inline-flex flex-col items-start gap-0.5 pb-3 -mb-0.5 text-base font-bold whitespace-nowrap border-b-2 transition-colors ${
                  tab === id ? 'text-[#5338ec] border-[#5338ec]' : 'text-[#0b1c30] border-transparent hover:text-[#5338ec]'
                }`}
              >
                <span>{label}</span>
                {id === 'calendar' && <span className={`text-[10px] font-semibold tracking-wide ${showCalendarPicker ? 'text-[#5338ec]' : 'text-slate-400'}`}>Calendar filters</span>}
              </button>
              {id === 'calendar' && showCalendarPicker && (
                <div
                  id="economic-calendar-date-picker"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeCalendarPicker();
                  }}
                  className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#020817]/55 p-4 pt-20 sm:pt-24"
                >
                  <div className="w-full max-w-[960px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-[#24364d] bg-[#0b1c30] p-4 text-white shadow-2xl sm:p-6">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Date range</p>
                        <p className="mt-1 text-base font-bold tracking-wide sm:text-lg">{displayDate(draftFrom)} - {displayDate(draftTo || draftFrom)}</p>
                      </div>
                      <button onClick={clearDraftRange} aria-label="Clear selected date range" className="rounded-md px-2.5 py-1.5 text-[10px] font-semibold text-white/60 hover:bg-white/10 hover:text-white">Clear</button>
                    </div>
                    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
                      <div>
                        <div className="flex items-center justify-between">
                          <button onClick={() => setCalendarMonth((current) => shiftMonth(current, -1))} aria-label="Previous month" className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
                          <p className="text-base font-bold sm:text-lg">{monthTitle(calendarMonth)}</p>
                          <button onClick={() => setCalendarMonth((current) => shiftMonth(current, 1))} aria-label="Next month" className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"><ChevronRight className="h-5 w-5" /></button>
                        </div>
                        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:gap-2 sm:text-xs">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
                        </div>
                        <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
                          {calendarCells.map(({ date, adjacent }) => (
                            <button
                              key={date}
                              onClick={() => selectDraftDate(date)}
                              aria-label={`Select ${date}`}
                              className={`h-10 rounded-lg text-xs font-semibold transition-colors sm:h-12 sm:text-sm ${
                                date === draftFrom || date === draftTo
                                  ? 'bg-[#f97316] text-white'
                                  : draftFrom && draftTo && date > draftFrom && date < draftTo
                                    ? 'bg-[#f97316]/25 text-white'
                                    : adjacent
                                      ? 'text-white/25 hover:bg-white/10 hover:text-white/60'
                                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {Number(date.slice(-2))}
                            </button>
                          ))}
                        </div>
                      </div>
                      <aside className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Quick ranges</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {rangePills.map((pill) => (
                            <button key={pill.id} onClick={() => selectQuickRange(pill.id)} className="rounded-lg bg-white/5 px-3 py-2.5 text-left text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">
                              {pill.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Selected range</p>
                          <p className="mt-2 text-sm font-bold">{displayDate(draftFrom)} - {displayDate(draftTo || draftFrom)}</p>
                          <p className="mt-2 text-xs leading-5 text-white/50">Choose a start date, then an end date. Applying the range filters the economic calendar.</p>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-2">
                          <button onClick={closeCalendarPicker} className="rounded-lg px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white">Cancel</button>
                          <button onClick={applyDraftRange} disabled={!draftFrom} className="rounded-lg bg-[#f97316] px-4 py-2 text-xs font-bold text-white hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-40">Apply</button>
                        </div>
                      </aside>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ───────── ECONOMIC CALENDAR ───────── */}
        {tab === 'calendar' && (
          <>
            <div className="mb-6">
              <div className="rounded-2xl border border-[#ded8fb] bg-[#f6f3ff] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#5338ec]"><Timer className="h-3.5 w-3.5" /> Next impactful release</p>
                    {nextImpactful ? <button onClick={() => setSelectedEvent(nextImpactful.event)} className="mt-2 text-left">
                      <p className="text-base font-bold text-[#0b1c30]">{nextImpactful.event.countryFlag} {nextImpactful.event.title}</p>
                      <p className="mt-1 text-xs text-[#475569]">{nextImpactful.event.currency} · {whenLabel(nextImpactful.event)} · <span className="font-bold text-[#5338ec]">in {countdown(nextImpactful.event.at)}</span></p>
                    </button> : <p className="mt-2 text-sm text-[#475569]">No upcoming medium or high-impact releases in this demo window.</p>}
                  </div>
                  {nextImpactful && <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#5338ec]">{nextImpactful.event.impact} impact</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#475569]">
                  {nextImpactful?.affectedAssets.map(asset => <span key={asset} className="rounded-full border border-[#d9d1ff] bg-white px-2 py-1">{asset}</span>)}
                  {nextImpactful && <span className="rounded-full border border-[#d9d1ff] bg-white px-2 py-1">True range {nextImpactful.trueRange}</span>}
                </div>
              </div>
            </div>

            {/* Compact column-based filters */}
            <div className="relative z-20 flex flex-wrap items-center border border-[#d6d8df] bg-white mb-4 overflow-visible">
              {[
                { id: 'range' as const, icon: CalendarIcon, label: 'Recent', active: range !== 'today' },
                { id: 'impact' as const, icon: Star, label: 'Impact', active: activeFilterCount > 0 && Object.values(impSel).filter(Boolean).length < 3 },
                { id: 'countries' as const, icon: Globe2, label: 'Countries', active: countrySel.length > 0 },
                { id: 'marketType' as const, icon: BarChart3, label: 'Market Type', active: marketType !== 'All Markets' },
                { id: 'category' as const, icon: BarChart3, label: 'Category', active: catSel.length > 0 },
                { id: 'timezone' as const, icon: Clock, label: tzLabel, active: false },
              ].sort((a, b) => filterOrder.indexOf(a.id) - filterOrder.indexOf(b.id)).map(({ id, icon: Icon, label, active }) => (
                <div
                  key={id}
                  draggable
                  onDragStart={() => setDraggingFilter(id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => { reorderFilters(id); setDraggingFilter(null); }}
                  onDragEnd={() => setDraggingFilter(null)}
                  title="Drag to reorder filters"
                  className={`relative cursor-grab active:cursor-grabbing ${draggingFilter === id ? 'opacity-50' : ''}`}
                >
                  <button
                    onClick={() => setOpenFilter((current) => current === id ? null : id)}
                    className={`flex items-center gap-1.5 h-9 px-3 border-r border-[#d6d8df] text-xs font-semibold whitespace-nowrap transition-colors ${
                      active ? 'text-[#5338ec] bg-[#f8f7ff]' : 'text-[#26364a] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#5338ec]" />}
                    <ChevronDown className={`w-3.5 h-3.5 text-[#64748b] transition-transform ${openFilter === id ? 'rotate-180' : ''}`} />
                  </button>

                  {openFilter === id && id === 'range' && (
                    <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-[#d6d8df] bg-white p-1.5 shadow-lg">
                      {rangePills.map((p) => (
                        <button key={p.id} onClick={() => { setRange(p.id); setOpenFilter(null); }} className={`block w-full rounded-md px-3 py-2 text-left text-xs font-semibold ${range === p.id ? 'bg-[#eef0fe] text-[#5338ec]' : 'text-[#26364a] hover:bg-slate-50'}`}>
                          {p.label}
                        </button>
                      ))}
                      <button onClick={() => { setRange('custom'); setOpenFilter(null); }} className={`block w-full rounded-md px-3 py-2 text-left text-xs font-semibold ${range === 'custom' ? 'bg-[#eef0fe] text-[#5338ec]' : 'text-[#26364a] hover:bg-slate-50'}`}>
                        Custom dates
                      </button>
                    </div>
                  )}

                  {openFilter === id && id === 'impact' && (
                    <div className="absolute left-0 top-full mt-1 w-40 rounded-lg border border-[#d6d8df] bg-white p-1.5 shadow-lg">
                      {[1, 2, 3].map((n) => (
                        <button key={n} onClick={() => toggleIn(Object.values(impSel).filter(Boolean).map((_, i) => i + 1), n, (next) => setImpSel({ 1: next.includes(1), 2: next.includes(2), 3: next.includes(3) }))} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-[#26364a] hover:bg-slate-50">
                          <span className={`flex ${impSel[n] ? 'text-[#5338ec]' : 'text-slate-300'}`}>{Array.from({ length: n }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</span>
                          {n === 1 ? 'Low' : n === 2 ? 'Medium' : 'High'}
                          {impSel[n] && <span className="ml-auto text-[#5338ec]">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {openFilter === id && id === 'countries' && (
                    <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-[#d6d8df] bg-white p-1.5 shadow-lg">
                      <button onClick={() => setCountrySel([])} className={`block w-full rounded-md px-3 py-2 text-left text-xs font-semibold ${countrySel.length === 0 ? 'bg-[#eef0fe] text-[#5338ec]' : 'text-[#26364a] hover:bg-slate-50'}`}>All countries</button>
                      <div className="max-h-64 overflow-y-auto">
                        {CALENDAR_COUNTRIES.map((c) => (
                          <button key={c.code} onClick={() => toggleIn(countrySel, c.code, setCountrySel)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-[#26364a] hover:bg-slate-50">
                            <span>{c.flag}</span><span>{c.code}</span>{countrySel.includes(c.code) && <span className="ml-auto text-[#5338ec]">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {openFilter === id && id === 'category' && (
                    <div className="absolute left-0 top-full mt-1 w-48 rounded-none border border-[#cbd5e1] bg-white py-1 shadow-md">
                      <button onClick={() => setCatSel([])} className={`block w-full px-3.5 py-1.5 text-left text-sm ${catSel.length === 0 ? 'font-semibold text-[#5338ec]' : 'text-[#26364a] hover:bg-[#f8fafc]'}`}>All Events</button>
                      <div className="max-h-64 overflow-y-auto">
                        {CALENDAR_CATEGORIES.map((c) => (
                          <button key={c} onClick={() => toggleIn(catSel, c, setCatSel)} className={`block w-full px-3.5 py-1.5 text-left text-sm ${catSel.includes(c) ? 'font-semibold text-[#5338ec]' : 'text-[#26364a] hover:bg-[#f8fafc]'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {openFilter === id && id === 'marketType' && (
                    <div className="absolute left-0 top-full mt-1 w-44 rounded-none border border-[#cbd5e1] bg-white py-1 shadow-md">
                      {(['All Markets', 'Forex', 'Indices', 'Stocks', 'Commodities', 'Crypto'] as MarketType[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => { setMarketType(option); setOpenFilter(null); }}
                          className={`flex w-full items-center gap-2 px-3.5 py-1.5 text-left text-sm ${marketType === option ? 'font-semibold text-[#5338ec]' : 'text-[#26364a] hover:bg-[#f8fafc]'}`}
                          role="option"
                          aria-selected={marketType === option}
                        >
                          <input
                            type="checkbox"
                            checked={marketType === option}
                            readOnly
                            tabIndex={-1}
                            aria-hidden="true"
                            className="h-3.5 w-3.5 accent-[#5338ec]"
                          />
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {openFilter === id && id === 'timezone' && (
                    <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[#d6d8df] bg-white p-1.5 shadow-lg">
                      {CALENDAR_TIMEZONES.map((t) => (
                        <button key={t.label} onClick={() => { setTz(t.offset); setOpenFilter(null); }} className={`block w-full rounded-md px-3 py-2 text-left text-xs font-semibold ${tz === t.offset ? 'bg-[#eef0fe] text-[#5338ec]' : 'text-[#26364a] hover:bg-slate-50'}`}>{t.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {activeFilterCount > 0 && <button onClick={resetFilters} className="ml-2 flex items-center gap-1 px-2 text-[11px] font-semibold text-slate-500 hover:text-[#5338ec]"><X className="w-3 h-3" /> Reset</button>}
              <div className="ml-2 flex items-center rounded-lg border border-[#d6d8df] bg-white p-0.5" role="group" aria-label="Calendar display mode">
                {([['visualization', 'Visualization'], ['list', 'List']] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={calendarView === mode}
                    onClick={() => setCalendarView(mode)}
                    className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold transition-colors ${calendarView === mode ? 'bg-[#0b1c30] text-white' : 'text-[#64748b] hover:text-[#0b1c30]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative ml-auto flex min-w-[190px] flex-1 items-center border-l border-[#d6d8df] sm:max-w-[250px]">
                <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={instrumentQuery}
                  onChange={(event) => setInstrumentQuery(event.target.value)}
                  placeholder="Search instruments"
                  aria-label="Search instruments"
                  className="h-9 w-full bg-transparent pl-8 pr-8 text-xs font-semibold text-[#26364a] outline-none placeholder:font-normal placeholder:text-slate-400"
                />
                {instrumentQuery && <button onClick={() => setInstrumentQuery('')} aria-label="Clear instrument search" className="absolute right-2 text-slate-400 hover:text-[#5338ec]"><X className="h-3.5 w-3.5" /></button>}
              </div>
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
              <div>
            <div
              ref={calendarVisualizationRef}
              className={`mb-6 w-full overflow-hidden bg-[#0b1c30] px-4 py-5 text-white sm:px-5 ${
                isCalendarFullscreen
                  ? 'min-h-screen overflow-y-auto rounded-none'
                  : 'rounded-2xl'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ABA1F8]">Economic Calendar</p>
                  <h2 className="mt-1 text-lg font-bold">Upcoming economic events</h2>
                </div>
                <button
                  type="button"
                  onClick={toggleCalendarFullscreen}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={isCalendarFullscreen ? 'Exit fullscreen calendar' : 'View calendar fullscreen'}
                  title={isCalendarFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
                >
                  {isCalendarFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  {isCalendarFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                </button>
              </div>
              {calendarView === 'visualization' ? <><div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="mr-2 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-white/40">Impact Level</span>
                {([['Low', 1], ['Medium', 2], ['High', 3]] as const).map(([label, level]) => (
                  <button
                    key={label}
                    onClick={() => setImpSel((current) => ({ ...current, [level]: !current[level] }))}
                    className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                      impSel[level]
                        ? label === 'Low'
                          ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                          : label === 'Medium'
                            ? 'border-sky-300/40 bg-sky-300/15 text-sky-200'
                            : 'border-rose-400/40 bg-rose-400/15 text-rose-200'
                        : 'border-white/10 bg-white/5 text-white/30 line-through'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-5 overflow-x-auto pb-2 scrollbar-none">
                <div className="min-w-[1280px]">
                  <div className={timelineIsSingleDay ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-7 gap-2'}>
                    {timelineDays.map((day) => {
                      const dayEvents = timelineEvents.filter((event) => eventKey(event) === day);
                      return (
                        <button
                          key={day}
                          onClick={() => openRangePicker(day, day)}
                          className={`rounded-lg border px-2 py-2 text-left transition-colors ${day === todayKey ? 'border-[#f97316]/70 bg-[#f97316]/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-white/70">{timelineDayLabel(day)}</span>
                            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/50">{dayEvents.length}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative mt-3 h-1 rounded-full bg-white/15">
                    <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-emerald-300/70 via-sky-300/70 to-rose-400/80" />
                    {timelineDays.map((day, index) => <span key={day} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0b1c30] bg-white/70" style={{ left: `${(index / 6) * 100}%` }} />)}
                  </div>
                  <div className={timelineIsSingleDay ? 'mt-3 grid grid-cols-1 gap-2' : 'mt-3 grid grid-cols-7 gap-2'}>
                    {timelineDays.map((day) => {
                      const dayEvents = timelineEvents.filter((event) => eventKey(event) === day);
                      const marketGroups = dayEvents.reduce<Record<string, EconomicEvent[]>>((groups, event) => {
                        const group = event.assetClass || 'Other';
                        (groups[group] ||= []).push(event);
                        return groups;
                      }, {});
                      return (
                        <div key={day} className={timelineIsSingleDay ? 'space-y-2' : 'max-h-[280px] space-y-2 overflow-y-auto pr-1'}>
                          {dayEvents.length === 0 && <p className="rounded-lg border border-dashed border-white/10 px-2 py-5 text-center text-[10px] text-white/25">No events</p>}
                          {(Object.entries(marketGroups) as [string, EconomicEvent[]][]).map(([market, marketEvents]) => (
                            <section key={market} className="rounded-xl border border-white/10 bg-white/[0.025] p-1.5">
                              <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
                                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">{market}</span>
                                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/60">{marketEvents.length}</span>
                              </div>
                              <div className="space-y-2">
                                {(Object.entries(
                                  marketEvents.reduce<Record<string, EconomicEvent[]>>((groups, event) => {
                                    (groups[event.currency] ||= []).push(event);
                                    return groups;
                                  }, {})
                                ) as [string, EconomicEvent[]][]).map(([currency, instrumentEvents]) => (
                                  <div key={currency} className="rounded-lg border border-white/10 bg-black/10 p-1.5">
                                    {(() => {
                                      const instrumentGroupKey = `${day}:${market}:${currency}`;
                                      const isExpanded = expandedInstrumentGroup === instrumentGroupKey;
                                      return (
                                        <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedInstrumentGroup(isExpanded ? null : instrumentGroupKey);
                                        setSelectedInstrumentGroup(
                                          isExpanded ? null : { market, currency, events: instrumentEvents }
                                        );
                                      }}
                                      className={`mb-1.5 flex w-full items-center justify-between gap-2 rounded-md px-1 text-left transition-colors ${
                                        isExpanded ? 'bg-white/10' : 'hover:bg-white/5'
                                      }`}
                                      aria-expanded={isExpanded}
                                    >
                                      <span className="text-[9px] font-bold uppercase tracking-wide text-white/60">
                                        {instrumentEvents[0].countryFlag} {currency}
                                      </span>
                                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/60">
                                        {instrumentEvents.length}
                                      </span>
                                    </button>
                                    <div className={timelineIsSingleDay ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4' : 'space-y-2'}>
                                      {instrumentEvents.map((event) => {
                                        const impactClass = event.impact === 'High'
                                          ? 'border-rose-400/40 bg-rose-400/10'
                                          : event.impact === 'Medium'
                                            ? 'border-sky-300/30 bg-sky-300/10'
                                            : 'border-emerald-400/30 bg-emerald-400/10';
                                        return (
                                          <button
                                            key={event.id}
                                            onClick={() => {
                                              setCalendarView('list');
                                              setSelectedEvent(event);
                                            }}
                                            className={`relative w-full rounded-xl border p-2.5 text-left transition-colors hover:brightness-125 ${impactClass}`}
                                          >
                                            <div className="flex items-center justify-between gap-2">
                                              <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                                                event.impact === 'High'
                                                  ? 'border-rose-400/60 text-rose-200'
                                                  : event.impact === 'Medium'
                                                    ? 'border-sky-300/60 text-sky-100'
                                                    : 'border-emerald-300/60 text-emerald-100'
                                              }`}>
                                                {event.impact} impact
                                              </span>
                                              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/70">
                                                {event.countryFlag} {event.currency}
                                              </span>
                                            </div>
                                            <p className="mt-2 line-clamp-2 min-h-8 text-xs font-bold leading-4 text-white">{event.title}</p>
                                            <p className="mt-2 text-[10px] font-mono text-white/55">{event.allDay ? 'All day' : hhmmOf(eventMs(event), tz)}</p>
                                            <div className="mt-2 grid grid-cols-3 gap-1 border-t border-white/10 pt-2 text-[9px]">
                                              <span className="text-white/45">Forecast<br /><strong className="font-mono text-white/80">{event.forecast || '—'}</strong></span>
                                              <span className="text-white/45">Previous<br /><strong className="font-mono text-white/80">{event.previous || '—'}</strong></span>
                                              <span className="text-white/45">Actual<br /><strong className="font-mono text-white/80">{event.actual || '—'}</strong></span>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div></> : (
                <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white p-4 text-[#0b1c30] sm:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="flex items-center gap-2 font-semibold text-[#5338ec]">
                        <Clock className="h-4 w-4" /> Current Time:
                        <span className="font-mono font-bold text-[#0b1c30]">{hhmmOf(NOW_MS, tz)}</span>
                      </span>
                      <span className="flex items-center gap-2 font-semibold text-[#5338ec]">
                        Display Time:
                        <span className="font-semibold text-[#0b1c30]">{displayMode === 'remaining' ? 'Remaining today' : 'All events'}</span>
                      </span>
                    </div>
                    <span className="text-xs text-[#474556]">Actual values appear as releases are confirmed.</span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className={`min-w-[760px]`}>
                      <div className={`hidden md:grid ${ROW_GRID} gap-2 border-b border-[#e2e8f0] px-3 py-3 text-sm font-bold text-[#0b1c30]`}>
                        <span>Time</span><span>Cur.</span><span>Event</span><span>Imp.</span>
                        <span className="text-right">Actual</span><span className="text-right">Forecast</span><span className="text-right">Previous</span><span />
                      </div>
                      {groups.length === 0 && <div className="py-16 text-center text-sm text-[#474556]">No events match these filters. Try a wider date range or reset the filters.</div>}
                      {groups.map(([key, rows]) => {
                        const markerAt = key === todayKey ? nowMarkerIndex(rows) : -1;
                        return (
                          <div key={key}>
                            <div className="border-b border-[#f1f5f9] bg-[#fafbfe] px-3 py-3.5 text-center text-sm font-bold text-[#0b1c30]">{longDate(key)}</div>
                            {rows.map((event, index) => {
                              const stars = IMPACT_STARS[event.impact];
                              const hasFlag = watchedIds[event.id] || alerts[event.id] !== undefined;
                              return (
                                <React.Fragment key={event.id}>
                                  {markerAt === index && <NowMarker />}
                                  <div onClick={() => setSelectedEvent(event)} className={`group grid grid-cols-1 ${ROW_GRID} items-center gap-2 border-b border-[#f1f5f9] px-3 py-3 transition-colors hover:bg-[#f8f9fc]`}>
                                    <span className="text-sm">{event.allDay ? 'All Day' : hhmmOf(eventMs(event), tz)}</span>
                                    <span className="flex items-center gap-1.5 text-sm"><span className="text-base leading-none">{event.countryFlag}</span><span className="font-semibold">{event.currency}</span></span>
                                    <span className="flex min-w-0 items-center gap-2 text-sm"><span className="min-w-0 truncate">{event.title}<span className="mt-0.5 block text-[10px] font-normal text-slate-400">{provider.getSnapshot(event).releaseState} · {provider.getSnapshot(event).surprise}</span></span>{event.hasSpeech && <Volume2 className="h-4 w-4 shrink-0 text-slate-400" />}</span>
                                    <span className="flex items-center gap-0.5" title={`${event.impact} impact`}>{[1, 2, 3].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= stars ? IMPACT_STYLES[event.impact].star : 'fill-slate-200 text-slate-200'}`} />)}</span>
                                    <span className={`font-bold md:text-right ${actualClass(event)}`}>{event.actual || ''}</span>
                                    <span className="md:text-right">{event.forecast || ''}</span>
                                    <span className="md:text-right">{event.previous || ''}</span>
                                    <span className={`flex items-center justify-end gap-2 ${hasFlag ? 'opacity-100' : 'md:opacity-0 md:group-hover:opacity-100'}`}>
                                      <button onClick={(ev) => { ev.stopPropagation(); toggleWatch(event.id); }} aria-label="Watch event" className={watchedIds[event.id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}><Star className={`h-4 w-4 ${watchedIds[event.id] ? 'fill-current' : ''}`} /></button>
                                      {!event.allDay && <button onClick={(ev) => { ev.stopPropagation(); toggleBell(event); }} aria-label="Set reminder" className={alerts[event.id] !== undefined ? 'text-[#5338ec]' : 'text-slate-400 hover:text-[#5338ec]'}>{alerts[event.id] !== undefined ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}</button>}
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
                  </div>
                </div>
              )}
            </div>

            {calendarView === 'visualization' && selectedInstrumentGroup && (
              <div className="mb-6 w-full overflow-hidden rounded-2xl border border-[#1f2937] bg-[#111827] p-4 text-white sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ABA1F8]">Instrument details</p>
                    <h3 className="mt-1 text-base font-bold">
                      {selectedInstrumentGroup.currency} · {selectedInstrumentGroup.market} events
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70">
                      {selectedInstrumentGroup.events.length} events
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedInstrumentGroup(null);
                        setSelectedInstrumentGroup(null);
                      }}
                      className="rounded-lg border border-white/15 px-2 py-1 text-[10px] font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="grid grid-flow-col auto-cols-[220px] gap-3 overflow-x-auto pb-2">
                  {selectedInstrumentGroup.events.map((event) => {
                    const impactClass = event.impact === 'High'
                      ? 'border-rose-400/40 bg-rose-400/10'
                      : event.impact === 'Medium'
                        ? 'border-sky-300/30 bg-sky-300/10'
                        : 'border-emerald-400/30 bg-emerald-400/10';
                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          setCalendarView('list');
                          setSelectedEvent(event);
                        }}
                        className={`relative w-full rounded-xl border p-3 text-left transition-colors hover:brightness-125 ${impactClass}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                            event.impact === 'High'
                              ? 'border-rose-400/60 text-rose-200'
                              : event.impact === 'Medium'
                                ? 'border-sky-300/60 text-sky-100'
                                : 'border-emerald-300/60 text-emerald-100'
                          }`}>
                            {event.impact} impact
                          </span>
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/70">
                            {event.countryFlag} {event.currency}
                          </span>
                        </div>
                        <p className="mt-3 min-h-8 text-sm font-bold leading-4 text-white">{event.title}</p>
                        <p className="mt-3 text-[10px] font-mono text-white/55">{event.allDay ? 'All day' : hhmmOf(eventMs(event), tz)}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-2 text-[10px]">
                          <span className="text-white/45">Forecast<br /><strong className="font-mono text-white/85">{event.forecast || '—'}</strong></span>
                          <span className="text-white/45">Previous<br /><strong className="font-mono text-white/85">{event.previous || '—'}</strong></span>
                          <span className="text-white/45">Actual<br /><strong className="font-mono text-white/85">{event.actual || '—'}</strong></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

              {calendarView === 'visualization' && <div className="hidden" aria-hidden="true">
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
                                <button
                                  onClick={(event) => { event.stopPropagation(); onNavigateToInstrument?.(e.currency); }}
                                  className="font-semibold text-[#0b1c30] underline decoration-transparent underline-offset-2 hover:text-[#5338ec] hover:decoration-current transition-colors"
                                  title={`Open ${e.currency} instrument details`}
                                >
                                  {e.currency}
                                </button>
                              </span>
                              <span className="flex items-center gap-2 text-sm text-[#0b1c30] min-w-0">
                                <span className="min-w-0 truncate">{e.title}<span className="mt-0.5 block text-[10px] font-normal text-slate-400">{provider.getSnapshot(e).releaseState} · {provider.getSnapshot(e).surprise}</span></span>
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

              </div>}

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
          onNavigateToInstrument={(symbol) => {
            setSelectedEvent(null);
            onNavigateToInstrument?.(symbol);
          }}
          onUpgradePrompt={onUpgradePrompt}
          onShowToast={onShowToast}
          fullPage
        />
      )}
    </div>
  );
};
