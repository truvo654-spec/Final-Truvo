import { useJournalState } from './journalStorage';
import { useMoney, formatMoney } from './JournalCurrency';
import { netOf, eligible, resultOf, realizedR, timestampMs, metrics } from './journalMath';
import React, { useMemo, useState } from 'react';
import { Broker, JournalEntry } from '../../types';
import { JOURNAL_STRATEGIES, JOURNAL_TODAY } from '../../data/journalData';
import { UNASSIGNED, addDays, brokerColor, entryCashback, entryPoints, shortDate } from './journalOverview';
import { TRADING_STATUS_LABEL, tradingStatusOf } from './tradingStatus';

// Insights › reports. "Day & Time" follows the uploaded concept (light theme): view tabs, benchmark,
// insight cards, distribution chart, cross-analysis matrix, detailed breakdown with drill-down.
// Entry times are stored in UTC and shown in the time zone the user picks (saved per browser).

type Report = 'overview' | 'daytime';
type View = 'days' | 'month' | 'time' | 'duration';
type Metric = 'net' | 'winRate' | 'trades' | 'avgR';
type Dim = 'broker' | 'playbook' | 'symbol' | 'tag' | 'session' | 'duration' | 'size' | 'r';
type SessionId = 'asia' | 'london' | 'overlap' | 'nypm' | 'late' | 'untimed';

// Session windows are fixed in UTC (market hours); their local times are shown in the chosen zone.
const SESSIONS: { id: SessionId; label: string; start: number; end: number }[] = [
  { id: 'asia', label: 'Asia', start: 0, end: 7 },
  { id: 'london', label: 'London', start: 7, end: 12 },
  { id: 'overlap', label: 'London / NY overlap', start: 12, end: 16 },
  { id: 'nypm', label: 'New York PM', start: 16, end: 21 },
  { id: 'late', label: 'After hours', start: 21, end: 24 },
  { id: 'untimed', label: 'No entry time', start: -1, end: -1 },
];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DUR_BUCKETS = [
  { key: 'd0', label: 'Under 15 min', max: 15 },
  { key: 'd1', label: '15–60 min', max: 60 },
  { key: 'd2', label: '1–4 hours', max: 240 },
  { key: 'd3', label: '4 hours +', max: Infinity },
];

const pad = (n: number) => String(n).padStart(2, '0');
const hourOf = (e: JournalEntry) => e.entryTime ? new Date(timestampMs(e.entryTime)).getUTCHours() : null;

// ── time zones ── (entry times are stored in UTC; reports can be shown in any zone)
export const TIMEZONES: { id: string; label: string }[] = [
  { id: 'UTC', label: 'UTC' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Berlin', label: 'Frankfurt / Berlin' },
  { id: 'America/New_York', label: 'New York' },
  { id: 'America/Chicago', label: 'Chicago' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Asia/Bangkok', label: 'Bangkok' },
  { id: 'Asia/Singapore', label: 'Singapore / Hong Kong' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Australia/Sydney', label: 'Sydney' },
];
const fmtCache = new Map<string, Intl.DateTimeFormat>();
const zoned = (isoUtc: string, tz: string) => {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' });
    fmtCache.set(tz, f);
  }
  const p = Object.fromEntries(f.formatToParts(new Date(timestampMs(isoUtc))).map((x) => [x.type, x.value]));
  const date = `${p.year}-${p.month}-${p.day}`;
  return { date, hour: Number(p.hour) % 24, minute: p.minute, weekday: new Date(`${date}T00:00:00Z`).getUTCDay() };
};
/** Offset of a zone in hours at a given UTC instant. */
const tzOffset = (tz: string, isoUtc: string) => {
  const z = zoned(isoUtc, tz);
  const local = Date.parse(`${z.date}T${pad(z.hour)}:${z.minute}:00Z`);
  return Math.round((local - Date.parse(`${isoUtc.slice(0, 16)}:00Z`)) / 36e5 * 2) / 2;
};
const offsetLabel = (h: number) => `UTC${h >= 0 ? '+' : '-'}${Math.floor(Math.abs(h))}${Math.abs(h) % 1 ? ':30' : ''}`;
const sessionOf = (e: JournalEntry): SessionId => {
  const h = hourOf(e);
  if (h === null) return 'untimed';
  return h < 7 ? 'asia' : h < 12 ? 'london' : h < 16 ? 'overlap' : h < 21 ? 'nypm' : 'late';
};
const durMin = (e: JournalEntry) =>
  e.entryTime && e.exitTime ? Math.max(0, (timestampMs(e.exitTime) - timestampMs(e.entryTime)) / 60000) : null;
const fmtDur = (m: number) => (m < 60 ? `${Math.round(m)}m` : `${Math.floor(m / 60)}h ${pad(Math.round(m % 60))}m`);
const money = (n: number, dp = 2) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const tone = (n: number) => (n > 0 ? 'text-emerald-600' : n < 0 ? 'text-rose-600' : 'text-slate-500');
const fmtPf = (n:number|null) => n==null?'—':n===Infinity?'∞':n.toFixed(2);

interface Stats { n: number; wins: number; losses: number; be: number; net: number; gross: number; pf: number | null; winRate: number; lossRate: number; beRate: number; avgR: number | null; cb: number; pts: number; avgDur: number | null }

interface Props {
  entries: JournalEntry[];
  brokers: Broker[];
  overview: React.ReactNode;
  onDrill: (ids: string[], label: string) => void;
  onToast: (msg: string) => void;
  /** Open Backtest → What-if on these trades. */
  onWhatIf?: () => void;
}

export const JournalInsights: React.FC<Props> = ({ entries, brokers, overview, onDrill, onToast, onWhatIf }) => {
  const money = useMoney();

  const brokerMap = useMemo(() => new Map(brokers.map((b) => [b.id, b] as const)), [brokers]);
  const brokerOrder = useMemo(() => brokers.map((b) => b.id), [brokers]);
  const brokerName = (id: string) => (id === UNASSIGNED ? 'Unassigned' : brokerMap.get(id)?.name || id);

  const [report, setReport] = useJournalState<Report>('JournalInsights-report', 'daytime');
  const [tz, setTzState] = useState<string>(() => {
    try { return localStorage.getItem('ms-journal-tz') || 'UTC'; } catch { return 'UTC'; }
  });
  const setTz = (v: string) => { setTzState(v); try { localStorage.setItem('ms-journal-tz', v); } catch { /* storage unavailable */ } };
  const offNow = tzOffset(tz, `${JOURNAL_TODAY}T12:00:00`);
  const sessHours = (sx: { start: number; end: number }) => {
    if (sx.start < 0) return '';
    const f = (h: number) => { const v = (((h + offNow) % 24) + 24) % 24; return `${pad(Math.floor(v))}:${v % 1 ? '30' : '00'}`; };
    return `${f(sx.start)}–${f(sx.end)}`;
  };
  // local (chosen zone) view of an entry: date, hour, weekday
  const loc = (e: JournalEntry) => (e.entryTime ? zoned(e.entryTime, tz) : { date: e.date, hour: null as number | null, minute: '00', weekday: new Date(`${e.date}T00:00:00Z`).getUTCDay() });
  const [view, setView] = useJournalState<View>('JournalInsights-view', 'days');
  const [resolution, setResolution] = useJournalState('JournalInsights-resolution', 2);
  const [range, setRange] = useJournalState<'last30' | 'last90' | 'all'>('JournalInsights-range', 'all');
  const [bench, setBench] = useJournalState('JournalInsights-bench', false);
  const [metric, setMetric] = useJournalState<Metric>('JournalInsights-metric', 'net');
  const [dim, setDim] = useJournalState<Dim>('JournalInsights-dim', 'playbook');
  const [sessOff, setSessOff] = useJournalState<SessionId[]>('JournalInsights-sessOff', []);
  const [brokerOff, setBrokerOff] = useJournalState<string[]>('JournalInsights-brokerOff', []);
  const [assetOff, setAssetOff] = useJournalState<string[]>('JournalInsights-assetOff', []);
  const [stratOff, setStratOff] = useJournalState<string[]>('JournalInsights-stratOff', []);
  const [openMenu, setOpenMenu] = useState<null | 'broker' | 'asset' | 'strategy'>(null);
  const [mouseHover, setHover] = useState<number | null>(null);
  const [focusedBucket,setFocusedBucket] = useState<number|null>(null);
  const hover=focusedBucket===-1?null:focusedBucket ?? mouseHover;
  const [expanded, setExpanded] = useState<string[]>([]);
  const [rowFilter, setRowFilter] = useJournalState('JournalInsights-rowFilter', '');
  const [drill, setDrill] = useState<{ label: string; ids: string[] } | null>(null);

  const stats = (list: JournalEntry[]): Stats => {
    list = list.filter(e => eligible(e));
    const nets = list.map(netOf);
    // Classify eligible closed results after known costs, using the shared tolerance.
    const wins = list.filter((e) => resultOf(e) === 'win').length;
    const losses = list.filter((e) => resultOf(e) === 'loss').length;
    const be = list.length - wins - losses;
    const gW = nets.filter((x) => x > 0).reduce((a, b) => a + b, 0);
    const gL = Math.abs(nets.filter((x) => x < 0).reduce((a, b) => a + b, 0));
    const rs = list.map((e) => realizedR(e)).filter((x): x is number => x !== null);
    const ds = list.map(durMin).filter((x): x is number => x !== null);
    const pct = (k: number) => (list.length ? Math.round((k / list.length) * 1000) / 10 : 0);
    return {
      n: list.length, wins, losses, be,
      net: Math.round(nets.reduce((a, b) => a + b, 0) * 100) / 100,
      gross: Math.round(list.reduce((a, e) => a + e.pnl, 0) * 100) / 100,
      pf: gL > 0 ? Math.round((gW / gL) * 100) / 100 : gW>0?Infinity:null,
      winRate: pct(wins), lossRate: pct(losses), beRate: pct(be),
      avgR: rs.length ? Math.round((rs.reduce((a, b) => a + b, 0) / rs.length) * 100) / 100 : null,
      cb: Math.round(list.reduce((a, e) => a + entryCashback(e, brokerMap), 0) * 100) / 100,
      pts: list.reduce((a, e) => a + entryPoints(e), 0),
      avgDur: ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : null,
    };
  };

  // ── date range + benchmark window ──
  const days = range === 'last30' ? 30 : range === 'last90' ? 90 : 0;
  const from = days ? addDays(JOURNAL_TODAY, -(days - 1)) : '0000-01-01';
  const prevFrom = days ? addDays(JOURNAL_TODAY, -(2 * days - 1)) : '';
  const prevTo = days ? addDays(JOURNAL_TODAY, -days) : '';
  const benchOn = bench && days > 0;

  const passFilters = (e: JournalEntry) =>
    eligible(e) && !brokerOff.includes(e.brokerId || UNASSIGNED) && !assetOff.includes(e.assetClass) && !stratOff.includes(e.strategy) && !sessOff.includes(sessionOf(e));
  const cur = useMemo(() => entries.filter((e) => passFilters(e) && e.date >= from && (range === 'all' || e.date <= JOURNAL_TODAY)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, brokerOff, assetOff, stratOff, sessOff, from]);
  const prev = useMemo(() => (benchOn ? entries.filter((e) => passFilters(e) && e.date >= prevFrom && e.date <= prevTo) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, brokerOff, assetOff, stratOff, sessOff, benchOn, prevFrom, prevTo]);

  // ── buckets for the current view ──
  const bucketOf = (e: JournalEntry): { key: string; label: string; order: number } => {
    if (view === 'days') { const d = loc(e).weekday; return { key: `w${d}`, label: DAY_NAMES[d], order: (d + 6) % 7 }; }
    if (view === 'month') { const ym = loc(e).date.slice(0, 7); return { key: ym, label: new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }), order: Number(ym.replace('-', '')) }; }
    if (view === 'time') {
      const h = loc(e).hour;
      if (h === null) return { key: 'none', label: 'No entry time', order: 99 };
      const s = Math.floor(h / resolution) * resolution;
      return { key: `h${s}`, label: `${pad(s)}:00–${pad(s + resolution)}:00`, order: s };
    }
    const m = durMin(e);
    if (m === null) return { key: 'none', label: 'No exit time', order: 99 };
    const i = DUR_BUCKETS.findIndex((b) => m < b.max);
    return { key: DUR_BUCKETS[i].key, label: DUR_BUCKETS[i].label, order: i };
  };

  const buckets = useMemo(() => {
    const m = new Map<string, { key: string; label: string; order: number; list: JournalEntry[]; prevList: JournalEntry[] }>();
    if (view === 'days') [1, 2, 3, 4, 5].forEach((d) => m.set(`w${d}`, { key: `w${d}`, label: DAY_NAMES[d], order: d - 1, list: [], prevList: [] }));
    cur.forEach((e) => { const b = bucketOf(e); if (!m.has(b.key)) m.set(b.key, { ...b, list: [], prevList: [] }); m.get(b.key)!.list.push(e); });
    prev.forEach((e) => { const b = bucketOf(e); if (m.has(b.key)) m.get(b.key)!.prevList.push(e); });
    return Array.from(m.values()).sort((a, b) => a.order - b.order).map((b) => ({ ...b, s: stats(b.list), ps: stats(b.prevList) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, prev, view, resolution, brokerMap, tz]);

  const total = useMemo(() => stats(cur), // eslint-disable-next-line react-hooks/exhaustive-deps
    [cur, brokerMap]);
  const prevTotal = useMemo(() => stats(prev), // eslint-disable-next-line react-hooks/exhaustive-deps
    [prev, brokerMap]);

  // ── insight cards ──
  const withData = buckets.filter((b) => b.s.n > 0);
  const best = withData.length ? withData.reduce((a, b) => (b.s.net > a.s.net ? b : a)) : null;
  const losingBuckets=withData.filter(b=>b.s.net<0);
  const worst = losingBuckets.length ? losingBuckets.reduce((a,b)=>b.s.net<a.s.net?b:a) : null;
  const busiest = withData.length ? withData.reduce((a, b) => (b.s.n > a.s.n ? b : a)) : null;
  const wrPool = withData.filter((b) => b.s.n >= 3);
  const peakWr = wrPool.length ? wrPool.reduce((a, b) => (b.s.winRate > a.s.winRate ? b : a)) : null;
  const unit = view === 'days' ? 'day' : view === 'month' ? 'month' : view === 'time' ? 'time window' : 'hold time';

  // best session inside a bucket (for card sub-titles)
  const topSession = (list: JournalEntry[], dir: 1 | -1) => {
    const by = SESSIONS.map((s) => ({ s, st: stats(list.filter((e) => sessionOf(e) === s.id)) })).filter((x) => x.st.n > 0);
    if (!by.length) return null;
    return by.reduce((a, b) => (dir * b.st.net > dir * a.st.net ? b : a));
  };

  // ── chart ──
  const metricVal = (s: Stats) => (metric === 'net' ? s.net : metric === 'winRate' ? s.winRate : metric === 'trades' ? s.n : s.avgR ?? 0);
  const fmtMetric = (v: number) => (metric === 'net' ? money(v, 0) : metric === 'winRate' ? `${v.toFixed(0)}%` : metric === 'trades' ? `${v}` : `${v > 0 ? '+' : ''}${v.toFixed(2)}R`);
  const W = 760, H = 240, M = { t: 16, r: 12, b: 34, l: 56 };
  const vals = buckets.flatMap((b) => [metricVal(b.s), ...(benchOn ? [metricVal(b.ps)] : [])]);
  const vMax = Math.max(0, ...vals), vMin = Math.min(0, ...vals);
  const span = vMax - vMin || 1;
  const yS = (v: number) => M.t + (1 - (v - vMin) / span) * (H - M.t - M.b);
  const bw = (W - M.l - M.r) / Math.max(1, buckets.length);
  const ticks = [vMin, vMin + span / 2, vMax].filter((v, i, a) => a.indexOf(v) === i);

  // ── matrix ──
  const dimKey = (e: JournalEntry): string => {
    switch (dim) {
      case 'broker': return brokerName(e.brokerId || UNASSIGNED);
      case 'playbook': return e.strategy;
      case 'symbol': return e.symbol;
      case 'tag': return e.tags[0] || 'Untagged';
      case 'session': return SESSIONS.find((s) => s.id === sessionOf(e))!.label;
      case 'duration': { const m = durMin(e); return m === null ? 'No exit time' : DUR_BUCKETS.find((b) => m < b.max)!.label; }
      case 'size': {
        const same = cur.filter((x) => x.assetClass === e.assetClass).map((x) => x.size).sort((a, b) => a - b);
        const med = same[Math.floor(same.length / 2)] ?? e.size;
        return e.size > med ? 'Larger than usual' : e.size < med ? 'Smaller than usual' : 'Typical size';
      }
      case 'r': { const r = realizedR(e); return r === null ? 'No R' : r <= -1 ? '≤ -1R' : r < 0 ? '-1R to 0' : r < 1 ? '0 to 1R' : r < 2 ? '1R to 2R' : '≥ 2R'; }
    }
  };
  const matrixCols = buckets.filter((b) => b.s.n > 0);
  const matrix = useMemo(() => {
    const rows = new Map<string, JournalEntry[]>();
    cur.forEach((e) => { const k = dimKey(e); rows.set(k, [...(rows.get(k) || []), e]); });
    return Array.from(rows.entries())
      .map(([k, list]) => ({ k, s: stats(list), cells: matrixCols.map((c) => { const l = list.filter((e) => bucketOf(e).key === c.key); return { key: c.key, list: l, s: stats(l) }; }) }))
      .sort((a, b) => b.s.net - a.s.net);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, dim, view, resolution, brokerMap, tz]);
  const cellMax = Math.max(1, ...matrix.flatMap((r) => r.cells.map((c) => Math.abs(c.s.net))));

  // ── breakdown rows ──
  const subOf = (list: JournalEntry[]) => {
    if (view === 'time') {
      return [1, 2, 3, 4, 5, 6, 0].map((d) => ({ key: `w${d}`, label: DAY_NAMES[d], list: list.filter((e) => loc(e).weekday === d) })).filter((x) => x.list.length);
    }
    return SESSIONS.map((s) => ({ key: s.id, label: `${s.label}${s.start >= 0 ? ` (${sessHours(s)})` : ''}`, list: list.filter((e) => sessionOf(e) === s.id) })).filter((x) => x.list.length);
  };
  const shownRows = buckets.filter((b) => b.s.n > 0 && b.label.toLowerCase().includes(rowFilter.trim().toLowerCase()));

  const exportCsv = () => {
    const head = ['Window', 'Trades', 'Win %', 'Loss %', 'BE %', 'Net P&L', 'Gross P&L', 'Profit factor', 'Avg R', 'Cashback (est.)', 'Points (est.)', ...(benchOn ? ['Prev net', 'Change'] : [])];
    const line = (label: string, s: Stats, ps?: Stats) => [label, s.n, s.winRate, s.lossRate, s.beRate, s.net, s.gross, s.pf ?? '', s.avgR ?? '', s.cb, s.pts, ...(benchOn && ps ? [ps.net, Math.round((s.net - ps.net) * 100) / 100] : [])];
    const rows: (string | number)[][] = [];
    shownRows.forEach((b) => { rows.push(line(b.label, b.s, b.ps)); subOf(b.list).forEach((x) => rows.push(line(`  ${x.label}`, stats(x.list)))); });
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const blob = new Blob([[head, ...rows].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `day-time-${view}.csv`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast(`Exported ${rows.length} rows to CSV`);
  };

  const resetFilters = () => { setBrokerOff([]); setAssetOff([]); setStratOff([]); setSessOff([]); setRowFilter(''); setRange('all'); setBench(false); setDrill(null); };
  const activeFilters = brokerOff.length + assetOff.length + stratOff.length + sessOff.length;

  // ── small UI helpers ──
  const btn = 'h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0b1c30]';
  const menu = (id: 'broker' | 'asset' | 'strategy', title: string, opts: { id: string; label: string; color?: string }[], off: string[], set: (v: string[]) => void) => (
    <div className="relative">
      <button type="button" aria-expanded={openMenu === id} onClick={() => setOpenMenu(openMenu === id ? null : id)} className={`${btn} ${off.length ? 'border-[#5338ec] text-[#5338ec]' : ''}`}>
        {title} ({opts.length - off.length}/{opts.length})
      </button>
      {openMenu === id && (
        <div className="absolute z-30 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-2 max-h-72 overflow-y-auto">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-[#0b1c30] cursor-pointer">
              <input type="checkbox" checked={!off.includes(o.id)} onChange={() => set(off.includes(o.id) ? off.filter((x) => x !== o.id) : [...off, o.id])} style={o.color ? { accentColor: o.color } : undefined} />
              <span className="flex-1">{o.label}</span>
              <span className="text-[10px] font-mono text-slate-400">{entries.filter((e) => (id === 'broker' ? (e.brokerId || UNASSIGNED) : id === 'asset' ? e.assetClass : e.strategy) === o.id).length}</span>
            </label>
          ))}
          <div className="flex justify-between px-2 pt-1.5">
            <button type="button" onClick={() => set([])} className="text-[11px] font-semibold text-[#5338ec] hover:underline">Select all</button>
            <button type="button" onClick={() => set(opts.map((o) => o.id))} className="text-[11px] font-semibold text-slate-500 hover:underline">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
  const brokerOpts = Array.from(new Set<string>(entries.map((e) => e.brokerId || UNASSIGNED))).map((id) => ({ id, label: brokerName(id), color: brokerColor(id, brokerOrder) }));
  const assetOpts = Array.from(new Set<string>(entries.map((e) => e.assetClass))).map((id) => ({ id, label: id }));
  const stratOpts = JOURNAL_STRATEGIES.filter((s) => entries.some((e) => e.strategy === s)).map((id) => ({ id, label: id }));

  const delta = (a: number, b: number, fmt: (n: number) => string) => {
    const d = a - b;
    return <span className={`text-[10px] font-semibold ${tone(d)}`}>{d === 0 ? 'no change' : `${fmt(d)} vs prev`}</span>;
  };

  const Card: React.FC<{ kicker: string; badge: string; badgeTone: string; title: string; sub: string; left: [string, React.ReactNode]; right: [string, React.ReactNode]; foot?: React.ReactNode }> = ({ kicker, badge, badgeTone, title, sub, left, right, foot }) => (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{kicker}</p>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeTone}`}>{badge}</span>
      </div>
      <p className="text-lg font-bold text-[#0b1c30] mt-2 leading-tight">{title}</p>
      <p className="text-[11px] text-slate-500 mt-1 min-h-[30px]">{sub}</p>
      <div className="mt-auto pt-3 flex items-end justify-between gap-2 border-t border-slate-100">
        <div><p className="text-[10px] text-slate-500">{left[0]}</p><div className="text-base font-bold font-mono">{left[1]}</div></div>
        <div className="text-right"><p className="text-[10px] text-slate-500">{right[0]}</p><div className="text-xs font-bold font-mono text-[#0b1c30]">{right[1]}</div></div>
      </div>
      {foot && <div className="mt-1">{foot}</div>}
    </div>
  );

  const DIMS: [Dim, string][] = [['broker', 'Broker'], ['playbook', 'Playbook'], ['symbol', 'Symbol'], ['tag', 'Tag'], ['session', 'Session'], ['duration', 'Duration'], ['size', 'Position size'], ['r', 'R-multiple']];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 items-start">
      {/* Report nav + session filter */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        <nav className="bg-white border border-[#e2e8f0] rounded-2xl p-2" aria-label="Reports">
          {([['overview', 'Overview'], ['daytime', 'Day & Time']] as const).map(([id, label]) => (
            <button key={id} type="button" aria-current={report === id ? 'page' : undefined} onClick={() => setReport(id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${report === id ? 'bg-[#EEF0FE] text-[#5338ec]' : 'text-[#474556] hover:bg-slate-50'}`}>{label}</button>
          ))}
        </nav>
        {onWhatIf && (
          <button type="button" onClick={onWhatIf} className="w-full text-left bg-[#FBFAFF] border border-[#5338ec]/20 rounded-2xl p-4 hover:border-[#5338ec]">
            <p className="text-xs font-bold text-[#0b1c30]">What if you had followed one rule?</p>
            <p className="text-[11px] text-[#474556] mt-0.5">Test "stop after 2 losses a day" and other rules on these trades.</p>
            <p className="text-[11px] font-semibold text-[#5338ec] mt-1.5">Try a what-if →</p>
          </button>
        )}
        {report === 'daytime' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-2">Session filter</p>
            {SESSIONS.map((s) => (
              <label key={s.id} className="flex items-center justify-between gap-2 py-1 text-xs text-[#0b1c30] cursor-pointer">
                <span>{s.label}{s.start >= 0 && <span className="block text-[10px] text-slate-400 font-mono">{sessHours(s)}</span>}</span>
                <input type="checkbox" checked={!sessOff.includes(s.id)} onChange={() => setSessOff((o) => (o.includes(s.id) ? o.filter((x) => x !== s.id) : [...o, s.id]))} />
              </label>
            ))}
            <div className="flex justify-between text-[11px] mt-3 pt-3 border-t border-slate-100">
              <label htmlFor="ins-tz" className="font-semibold text-slate-500">Timezone</label>
              <span className="font-mono text-[#0b1c30]">{offsetLabel(offNow)}</span>
            </div>
            <select id="ins-tz" value={tz} onChange={(e) => { setTz(e.target.value); setHover(null); setDrill(null); }} className="mt-2 w-full h-9 border border-slate-200 rounded-lg px-2 text-xs font-semibold bg-white text-[#0b1c30]">
              {TIMEZONES.map((z) => <option key={z.id} value={z.id}>{z.label} ({offsetLabel(tzOffset(z.id, `${JOURNAL_TODAY}T12:00:00`))})</option>)}
            </select>
            <p className="text-[10px] text-slate-400 mt-1.5">Days, months and trade times are shown in this zone. Daylight saving is applied automatically.</p>
          </div>
        )}
      </aside>

      <div className="min-w-0 space-y-5">
        {report === 'overview' ? overview : (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-9 rounded-lg border border-slate-200 bg-white overflow-hidden" role="tablist" aria-label="Group by">
                {([['days', 'Days'], ['month', 'Month'], ['time', 'Trade time'], ['duration', 'Duration']] as const).map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => { setView(id); setHover(null); setDrill(null); }}
                    className={`px-3 text-xs font-semibold ${view === id ? 'bg-[#0b1c30] text-white' : 'text-[#474556] hover:bg-slate-50'}`}>{label}</button>
                ))}
              </div>
              {view === 'time' && (
                <select aria-label="Resolution" value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="h-9 text-xs font-semibold border border-slate-200 rounded-lg px-3 bg-white">
                  <option value={1}>Hourly</option><option value={2}>2-hour</option><option value={4}>4-hour</option>
                </select>
              )}
              <select aria-label="Report subrange" value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="h-9 text-xs font-semibold border border-slate-200 rounded-lg px-3 bg-white">
                <option value="last30">Last 30 days within scope</option><option value="last90">Last 90 days within scope</option><option value="all">Entire journal scope</option>
              </select>
              {menu('broker', 'Broker', brokerOpts, brokerOff, setBrokerOff)}
              {menu('asset', 'Market type', assetOpts, assetOff, setAssetOff)}
              {menu('strategy', 'Playbook', stratOpts, stratOff, setStratOff)}
              <label className={`${btn} flex items-center gap-2 cursor-pointer ${days ? '' : 'opacity-50 cursor-not-allowed'}`} title={days ? '' : 'Pick Last 30 or 90 days to compare with the period before'}>
                <input type="checkbox" checked={benchOn} disabled={!days} onChange={(e) => setBench(e.target.checked)} />
                Benchmark vs prev period
              </label>
              <button type="button" onClick={exportCsv} className={`${btn} ml-auto`}>Export CSV</button>
            </div>
            <p className="text-[11px] text-slate-500 -mt-2">
              {total.n} eligible closed trades · {range === 'all' ? 'entire journal scope' : `${shortDate(from)} – ${shortDate(JOURNAL_TODAY, true)} within journal scope`}
              {benchOn && <> · compared with {shortDate(prevFrom)} – {shortDate(prevTo, true)} ({prevTotal.n} trades)</>}
              {activeFilters > 0 && <> · {activeFilters} filter{activeFilters === 1 ? '' : 's'} off</>}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] mb-1" aria-label="Trading status summary">
              <span className="font-semibold text-[#474556]">Trading status:</span>
              {(['planned', 'open', 'closed'] as const).map((status) => (
                <span key={status} className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                  {TRADING_STATUS_LABEL[status]} {entries.filter((e) => tradingStatusOf(e) === status).length} recorded in journal scope
                </span>
              ))}
            </div>

            {/* Insight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {best && best.s.net > 0 ? (() => { const ts = topSession(best.list, 1); return (
                <Card kicker={`Best ${unit}`} badge="Rank #1" badgeTone="bg-emerald-50 text-emerald-700" title={best.label}
                  sub={ts ? `Strongest in ${ts.s.label} (${money(ts.st.net, 0)})` : ''}
                  left={['Net P&L', <span className="text-emerald-600">{money(best.s.net)}</span>]}
                  right={['Win rate / PF', `${best.s.winRate.toFixed(0)}% · ${fmtPf(best.s.pf)}`]}
                  foot={benchOn ? delta(best.s.net, best.ps.net, (d) => money(d, 0)) : undefined} />
              ); })() : <Card kicker={`Best ${unit}`} badge="—" badgeTone="bg-slate-100 text-slate-500" title="No profitable window" sub="" left={['Net P&L', '—']} right={['', '']} />}
              {worst && worst.s.net < 0 ? (() => { const ts = topSession(worst.list, -1); return (
                <Card kicker={`Leak ${unit}`} badge="Risk" badgeTone="bg-rose-50 text-rose-700" title={worst.label}
                  sub={ts ? `Weakest in ${ts.s.label} (${money(ts.st.net, 0)})` : ''}
                  left={['Net P&L', <span className="text-rose-600">{money(worst.s.net)}</span>]}
                  right={['Win rate / PF', `${worst.s.winRate.toFixed(0)}% · ${fmtPf(worst.s.pf)}`]}
                  foot={benchOn ? delta(worst.s.net, worst.ps.net, (d) => money(d, 0)) : undefined} />
              ); })() : <Card kicker={`Leak ${unit}`} badge="None" badgeTone="bg-slate-100 text-slate-600" title="No losing window" sub={withData.length?'Observed windows are net positive or breakeven.':'No eligible results in this scope.'} left={['Net P&L', '—']} right={['', '']} />}
              {busiest ? (
                <Card kicker={`Most active ${unit}`} badge="Volume" badgeTone="bg-sky-50 text-sky-700" title={busiest.label}
                  sub={`${busiest.s.n} trades · ${total.n ? Math.round((busiest.s.n / total.n) * 1000) / 10 : 0}% of volume`}
                  left={['Avg hold time', <span className="text-[#0b1c30]">{busiest.s.avgDur === null ? '—' : fmtDur(busiest.s.avgDur)}</span>]}
                  right={['Net P&L', <span className={tone(busiest.s.net)}>{money(busiest.s.net, 0)}</span>]}
                  foot={benchOn ? delta(busiest.s.n, busiest.ps.n, (d) => `${d > 0 ? '+' : ''}${d} trades`) : undefined} />
              ) : <Card kicker="Most active" badge="—" badgeTone="bg-slate-100 text-slate-500" title="No trades" sub="" left={['', '']} right={['', '']} />}
              {peakWr ? (
                <Card kicker="Peak win rate" badge="Edge" badgeTone="bg-violet-50 text-violet-700" title={peakWr.label}
                  sub={`${peakWr.s.wins} wins / ${peakWr.s.losses} losses${peakWr.s.be ? ` / ${peakWr.s.be} BE` : ''}`}
                  left={['Win rate', <span className="text-emerald-600">{peakWr.s.winRate.toFixed(1)}%</span>]}
                  right={['Avg R', peakWr.s.avgR === null ? '—' : `${peakWr.s.avgR > 0 ? '+' : ''}${peakWr.s.avgR.toFixed(2)}R`]}
                  foot={benchOn ? delta(peakWr.s.winRate, peakWr.ps.winRate, (d) => `${d > 0 ? '+' : ''}${d.toFixed(1)} pts`) : undefined} />
              ) : <Card kicker="Peak win rate" badge="—" badgeTone="bg-slate-100 text-slate-500" title="Not enough trades" sub="Needs 3+ trades in a window." left={['', '']} right={['', '']} />}
            </div>

            {/* Distribution chart */}
            <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Distribution">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold">{view === 'days' ? 'Day of week' : view === 'month' ? 'Monthly' : view === 'time' ? 'Time of day' : 'Hold time'} distribution</h4>
                  <p className="text-[11px] text-slate-500">Net of commissions · hover a bar for details · click to drill down</p>
                </div>
                <div className="flex h-8 rounded-lg border border-slate-200 overflow-hidden" role="group" aria-label="Metric">
                  {([['net', 'Net P&L'], ['winRate', 'Win rate %'], ['trades', 'Trades'], ['avgR', 'Avg R']] as const).map(([id, label]) => (
                    <button key={id} type="button" aria-pressed={metric === id} onClick={() => setMetric(id)}
                      className={`px-2.5 text-[11px] font-semibold ${metric === id ? 'bg-[#0b1c30] text-white' : 'bg-white text-[#474556] hover:bg-slate-50'}`}>{label}</button>
                  ))}
                </div>
              </div>
              {benchOn && (
                <div className="flex gap-4 text-[11px] text-[#474556] mb-1">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#5338ec]" />This period</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border-2 border-slate-400" />Previous period</span>
                </div>
              )}
              <div className="relative">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label={`${metric} by ${unit}`} onMouseLeave={() => setHover(null)}>
                  {ticks.map((t) => (
                    <g key={t}>
                      <line x1={M.l} x2={W - M.r} y1={yS(t)} y2={yS(t)} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : '3 4'} />
                      <text x={M.l - 8} y={yS(t) + 3} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">{fmtMetric(Math.round(t * 100) / 100)}</text>
                    </g>
                  ))}
                  <line x1={M.l} x2={W - M.r} y1={yS(0)} y2={yS(0)} stroke="#94a3b8" />
                  {buckets.map((b, i) => {
                    const v = metricVal(b.s);
                    const x = M.l + i * bw;
                    const inner = Math.min(46, bw * 0.6);
                    const fill = metric === 'net' || metric === 'avgR' ? (v >= 0 ? '#10b981' : '#f43f5e') : '#5338ec';
                    const pv = metricVal(b.ps);
                    return (
                      <g key={b.key} role="button" tabIndex={0} aria-label={`${b.label}: ${b.s.n} realized trades, net ${money(b.s.net)}; open cohort`} onFocus={()=>setFocusedBucket(i)} onBlur={()=>setFocusedBucket(null)} onKeyDown={ev=>{if(ev.key==='Escape'){setFocusedBucket(-1);setHover(null);}if((ev.key==='Enter'||ev.key===' ')&&b.s.n){ev.preventDefault();setDrill({label:b.label,ids:b.list.map(e=>e.id)});}}} onMouseEnter={() => setHover(i)} onClick={() => b.s.n && setDrill({ label: b.label, ids: b.list.map((e) => e.id) })} style={{ cursor: b.s.n ? 'pointer' : 'default' }}>
                        <rect x={x} y={M.t} width={bw} height={H - M.t - M.b} fill={hover === i ? '#f1f5f9' : 'transparent'} />
                        {b.s.n > 0 && <rect x={x + (bw - inner) / 2} y={Math.min(yS(v), yS(0))} width={inner} height={Math.max(1.5, Math.abs(yS(v) - yS(0)))} rx={4} fill={fill} />}
                        {benchOn && b.ps.n > 0 && <rect x={x + (bw - inner) / 2 - 3} y={Math.min(yS(pv), yS(0))} width={inner + 6} height={Math.max(1.5, Math.abs(yS(pv) - yS(0)))} rx={4} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />}
                        <text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize="10" fill={b.s.n ? '#334155' : '#94a3b8'} fontWeight={b === best || b === worst ? 700 : 400}>
                          {view === 'days' ? b.label.slice(0, 3) : view === 'month' ? b.label.slice(0, 3) : b.label.split('–')[0]}
                        </text>
                        {(b === best || b === worst) && b.s.n > 0 && <text x={x + bw / 2} y={H - 2} textAnchor="middle" fontSize="9" fill={b === best ? '#059669' : '#e11d48'} fontWeight={700}>{b === best ? 'Peak' : 'Leak'}</text>}
                      </g>
                    );
                  })}
                </svg>
                {hover !== null && buckets[hover] && (() => {
                  const b = buckets[hover];
                  const left = ((M.l + hover * bw + bw / 2) / W) * 100;
                  return (
                    <div className="pointer-events-none absolute top-2 z-10 bg-[#0b1c30] text-white rounded-lg px-3 py-2 text-[11px] shadow-lg max-w-[85%] break-words" style={{ left: `${left}%`, transform: left > 60 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)' }} role="status">
                      <p className="font-semibold">{b.label}</p>
                      <p className="font-mono">{b.s.n} trades · net {money(b.s.net)}</p>
                      <p className="font-mono text-slate-300">Win {b.s.n?`${b.s.winRate.toFixed(0)}%`:'—'} · PF {fmtPf(b.s.pf)} · Avg R {b.s.avgR === null ? '—' : b.s.avgR.toFixed(2)}</p>
                      {benchOn && <p className="font-mono text-slate-300">Prev: {b.ps.n} trades · net {money(b.ps.net)}</p>}
                    </div>
                  );
                })()}
              </div>
              {best && best.s.n > 0 && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Peak {unit}: <span className="font-semibold text-emerald-600">{best.label}</span> ({money(best.s.net, 0)})
                  {worst && worst.s.net < 0 && <> · Leak: <span className="font-semibold text-rose-600">{worst.label}</span> ({money(worst.s.net, 0)})</>}
                </p>
              )}
            </section>

            {/* Cross analysis matrix */}
            <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Cross analysis matrix">
              <h4 className="text-sm font-bold">Cross analysis matrix</h4>
              <p className="text-[11px] text-slate-500 mb-3">Each cell is net P&amp;L, trades and win rate for that pair. Click a cell to see its trades.</p>
              <div className="flex flex-wrap gap-1.5 mb-3" role="tablist" aria-label="Compare by">
                {DIMS.map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={dim === id} onClick={() => setDim(id)}
                    className={`px-3 h-8 rounded-lg text-xs font-semibold border ${dim === id ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556] hover:bg-slate-50'}`}>{label}</button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-separate" style={{ borderSpacing: 4 }}>
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="text-left font-bold px-2 py-1 whitespace-nowrap">{DIMS.find((d) => d[0] === dim)![1]} \ {unit}</th>
                      {matrixCols.map((c) => <th key={c.key} className="font-bold px-2 py-1 whitespace-nowrap">{view === 'time' ? c.label : c.label.split(' ')[0]}</th>)}
                      <th className="font-bold px-2 py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row) => (
                      <tr key={row.k}>
                        <td className="px-2 py-1 font-semibold text-[#0b1c30] whitespace-nowrap">
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: row.s.net >= 0 ? '#10b981' : '#f43f5e' }} />{row.k}
                        </td>
                        {row.cells.map((c) => {
                          const a = c.s.n ? 0.08 + 0.32 * (Math.abs(c.s.net) / cellMax) : 0;
                          return (
                            <td key={c.key} className="p-0">
                              {c.s.n ? (
                                <button type="button" onClick={() => setDrill({ label: `${row.k} · ${matrixCols.find((m) => m.key === c.key)!.label}`, ids: c.list.map((e) => e.id) })}
                                  className="w-full min-w-[96px] rounded-lg px-2 py-2 text-center border border-transparent hover:border-[#5338ec]/50"
                                  style={{ backgroundColor: c.s.net >= 0 ? `rgba(16,185,129,${a})` : `rgba(244,63,94,${a})` }}>
                                  <span className={`block font-mono font-bold ${tone(c.s.net)}`}>{money(c.s.net, 0)}</span>
                                  <span className="block text-[10px] text-slate-600">{c.s.n} trade{c.s.n === 1 ? '' : 's'} ({c.s.winRate.toFixed(0)}%)</span>
                                </button>
                              ) : <span className="block min-w-[96px] rounded-lg bg-slate-50 px-2 py-3 text-center text-slate-300">—</span>}
                            </td>
                          );
                        })}
                        <td className="px-2 py-1 text-center whitespace-nowrap">
                          <span className={`block font-mono font-bold ${tone(row.s.net)}`}>{money(row.s.net, 0)}</span>
                          <span className="block text-[10px] text-slate-500">{row.s.n} · {row.s.winRate.toFixed(0)}%</span>
                        </td>
                      </tr>
                    ))}
                    {matrix.length === 0 && <tr><td colSpan={matrixCols.length + 2} className="py-8 text-center text-slate-500">No trades match these filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Drill-down panel */}
            {drill && (() => {
              const list = entries.filter((e) => drill.ids.includes(e.id)).sort((a, b) => (b.entryTime || b.date).localeCompare(a.entryTime || a.date));
              const s = stats(list);
              return (
                <section className="bg-[#F8F7FF] border border-[#5338ec]/30 rounded-2xl p-4" aria-label="Drill-down">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-wider uppercase text-[#5338ec]">Drill-down</p>
                      <p className="text-sm font-bold text-[#0b1c30]">{drill.label}</p>
                    </div>
                    <span className="text-xs text-[#474556]">{s.n} trade{s.n === 1 ? '' : 's'} · <span className={`font-mono font-bold ${tone(s.net)}`}>{money(s.net)}</span> · win {s.winRate.toFixed(0)}%</span>
                    <button type="button" onClick={() => onDrill(drill.ids, drill.label)} className="ml-auto h-9 px-3 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">Open in Trade Log</button>
                    <button type="button" onClick={() => setDrill(null)} className="text-xs font-semibold text-[#474556] hover:underline">Close</button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {list.slice(0, 8).map((e) => (
                      <div key={e.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                        <span className="font-mono text-slate-500 w-32 shrink-0">{e.entryTime ? `${loc(e).date} ${pad(loc(e).hour ?? 0)}:${loc(e).minute}` : e.date}</span>
                        <span className="font-bold text-[#0b1c30] w-20 shrink-0">{e.symbol}</span>
                        <span className={`text-[10px] font-bold ${e.direction === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>{e.direction === 'BUY' ? 'LONG' : 'SHORT'}</span>
                        <span className="text-slate-500 truncate">{e.strategy}</span>
                        <span className={`ml-auto font-mono font-bold ${tone(netOf(e))}`}>{money(netOf(e))}</span>
                      </div>
                    ))}
                  </div>
                  {list.length > 8 && <p className="text-[11px] text-slate-500 mt-2">+{list.length - 8} more. Open in Trade Log to see all.</p>}
                </section>
              );
            })()}

            {/* Detailed breakdown */}
            <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Detailed breakdown">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold">Detailed session &amp; time breakdown</h4>
                  <p className="text-[11px] text-slate-500">Expand a row to split it by {view === 'time' ? 'weekday' : 'session'}. Click a row label to drill down.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input value={rowFilter} onChange={(e) => setRowFilter(e.target.value)} placeholder="Filter window or day..." aria-label="Filter rows" className="h-9 w-48 border border-slate-200 rounded-lg px-3 text-xs" />
                  <button type="button" className={btn} onClick={() => setExpanded(expanded.length ? [] : shownRows.map((b) => b.key))}>{expanded.length ? 'Collapse all' : 'Expand all'}</button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      {['Window', 'Trades', 'Win %', 'Loss %', 'BE %', 'Net P&L', 'Gross P&L', 'PF', 'Avg R', 'Cashback', 'Points', ...(benchOn ? ['Prev net', 'Change'] : [])].map((h, i) => (
                        <th key={h} className={`px-3 py-2 font-semibold whitespace-nowrap ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shownRows.map((b) => {
                      const open = expanded.includes(b.key);
                      const isBest = b === best && b.s.net > 0;
                      const isLeak = b === worst && b.s.net < 0;
                      const row = (label: React.ReactNode, s: Stats, sub: boolean, ids: string[], key: string, ps?: Stats) => (
                        <tr key={key} className={`border-t border-slate-100 ${sub ? 'bg-slate-50/60' : ''} ${isBest && !sub ? 'bg-emerald-50/40' : ''} ${isLeak && !sub ? 'bg-rose-50/40' : ''}`}>
                          <td className={`px-3 py-2 whitespace-nowrap ${sub ? 'pl-9 text-[#474556]' : 'font-semibold text-[#0b1c30]'}`}>{label}</td>
                          <td className="px-3 py-2 text-right font-mono">{s.n}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-600">{s.winRate.toFixed(1)}%</td>
                          <td className="px-3 py-2 text-right font-mono text-rose-600">{s.lossRate.toFixed(1)}%</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-500">{s.beRate.toFixed(1)}%</td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${tone(s.net)}`}>{money(s.net)}</td>
                          <td className="px-3 py-2 text-right font-mono text-[#474556]">{money(s.gross)}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmtPf(s.pf)}</td>
                          <td className={`px-3 py-2 text-right font-mono ${s.avgR === null ? 'text-slate-400' : tone(s.avgR)}`}>{s.avgR === null ? '—' : `${s.avgR > 0 ? '+' : ''}${s.avgR.toFixed(2)}R`}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-600">{s.cb ? `+$${s.cb.toFixed(2)}` : '—'}</td>
                          <td className="px-3 py-2 text-right font-mono text-violet-600">{s.pts ? `+${s.pts}` : '—'}</td>
                          {benchOn && <td className="px-3 py-2 text-right font-mono text-slate-500">{ps ? money(ps.net) : ''}</td>}
                          {benchOn && <td className={`px-3 py-2 text-right font-mono ${ps ? tone(s.net - ps.net) : ''}`}>{ps ? money(Math.round((s.net - ps.net) * 100) / 100) : ''}</td>}
                        </tr>
                      );
                      return (
                        <React.Fragment key={b.key}>
                          {row(
                            <span className="inline-flex items-center gap-2">
                              <button type="button" aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${b.label}`} onClick={() => setExpanded((x) => (open ? x.filter((k) => k !== b.key) : [...x, b.key]))} className="w-5 h-5 rounded border border-slate-200 text-[10px] text-slate-500 hover:bg-slate-100">{open ? '−' : '+'}</button>
                              <button type="button" onClick={() => setDrill({ label: b.label, ids: b.list.map((e) => e.id) })} className="hover:text-[#5338ec] hover:underline">{b.label}</button>
                              {isBest && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">Peak</span>}
                              {isLeak && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">Leak</span>}
                            </span>, b.s, false, b.list.map((e) => e.id), b.key, b.ps)}
                          {open && subOf(b.list).map((x) => row(
                            <button type="button" onClick={() => setDrill({ label: `${b.label} · ${x.label}`, ids: x.list.map((e) => e.id) })} className="hover:text-[#5338ec] hover:underline">{x.label}</button>,
                            stats(x.list), true, x.list.map((e) => e.id), `${b.key}-${x.key}`))}
                        </React.Fragment>
                      );
                    })}
                    {shownRows.length === 0 && <tr><td colSpan={13} className="py-8 text-center text-slate-500">No rows match.</td></tr>}
                  </tbody>
                  {shownRows.length > 0 && (
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold">
                      <tr>
                        <td className="px-3 py-2">Σ Total</td>
                        <td className="px-3 py-2 text-right font-mono">{total.n}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-600">{total.winRate.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right font-mono text-rose-600">{total.lossRate.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-500">{total.beRate.toFixed(1)}%</td>
                        <td className={`px-3 py-2 text-right font-mono font-bold ${tone(total.net)}`}>{money(total.net)}</td>
                        <td className="px-3 py-2 text-right font-mono">{money(total.gross)}</td>
                        <td className="px-3 py-2 text-right font-mono">{fmtPf(total.pf)}</td>
                        <td className="px-3 py-2 text-right font-mono">{total.avgR === null ? '—' : `${total.avgR.toFixed(2)}R`}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-600">+${total.cb.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-mono text-violet-600">+{total.pts}</td>
                        {benchOn && <td className="px-3 py-2 text-right font-mono text-slate-500">{money(prevTotal.net)}</td>}
                        {benchOn && <td className={`px-3 py-2 text-right font-mono ${tone(total.net - prevTotal.net)}`}>{money(Math.round((total.net - prevTotal.net) * 100) / 100)}</td>}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500">
                <span>Displaying {shownRows.length} {unit} rows · {total.n} closed trades aggregated</span>
                <button type="button" onClick={resetFilters} className="ml-auto h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#0b1c30] hover:bg-slate-50">Reset filters</button>
                <button type="button" onClick={() => onDrill(cur.map((e) => e.id), 'Day & Time report selection')} className="h-8 px-3 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">Drill down to Trade Log</button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
