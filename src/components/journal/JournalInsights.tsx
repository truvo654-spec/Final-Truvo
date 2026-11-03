import { JournalHelp } from './JournalHelp';
import { useJournalState } from './journalStorage';
import { useMoney, formatMoney } from './JournalCurrency';
import { netOf, eligible, resultOf, realizedR, timestampMs, metrics } from './journalMath';
import React, { useEffect, useId, useMemo, useState } from 'react';
import { Broker, JournalEntry, UserProfile } from '../../types';
import { JOURNAL_TODAY } from '../../data/journalData';
import { UNASSIGNED, entryCashback, entryPoints } from './journalOverview';
import { TRADING_STATUS_LABEL, tradingStatusOf } from './tradingStatus';
import { JournalOpenInsightsChart, type InsightChartScope } from './JournalOpenInsightsChart';
import { useDialogFocus } from './useDialogFocus';
import { LockStateContainer } from '../common/LockStateContainer';
import { ToolCreditUnlockModal, type UnlockDurationOption } from '../analysis/ToolCreditUnlockModal';
import { CROSS_ANALYSIS_TOOL, hasCrossAnalysisAccess } from './crossAnalysisAccess';

// Insights opens directly to Day & Time using the shared journal scope: view tabs,
// insight cards, distribution chart, cross-analysis matrix, detailed breakdown with drill-down.
// Entry times are stored in UTC and shown in the time zone the user picks (saved per browser).

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

interface InsightsDrillDialogProps {
  label: string;
  entries: JournalEntry[];
  summary: Stats;
  formatMoney: (amount: number) => string;
  formatEntryTime: (entry: JournalEntry) => string;
  onClose: () => void;
  onOpenAll: () => void;
  onOpenTrade: (entry: JournalEntry) => void;
}

interface BreakdownRow { key: string; label: string; s: Stats; ids: string[] }
const InsightsBreakdownDialog: React.FC<{
  label: string; splitLabel: string; summary: Stats; ids: string[]; rows: BreakdownRow[]; peak: boolean; leak: boolean;
  formatMoney: (amount: number) => string; onClose: () => void; onOpenGroup: (label: string, ids: string[]) => void; onOpenAll: () => void;
}> = ({ label, splitLabel, summary, ids, rows, peak, leak, formatMoney, onClose, onOpenGroup, onOpenAll }) => {
  const ref = useDialogFocus(onClose);
  const titleId = useId();
  const cells = (s: Stats) => [
    [String(s.n), 'font-mono'],
    [`${s.winRate.toFixed(1)}%`, 'font-mono text-emerald-600'],
    [`${s.lossRate.toFixed(1)}%`, 'font-mono text-rose-600'],
    [`${s.beRate.toFixed(1)}%`, 'font-mono text-slate-500'],
    [formatMoney(s.net), `font-mono font-bold ${tone(s.net)}`],
    [formatMoney(s.gross), 'font-mono text-[#474556]'],
    [fmtPf(s.pf), 'font-mono'],
    [s.avgR === null ? '—' : `${s.avgR > 0 ? '+' : ''}${s.avgR.toFixed(2)}R`, `font-mono ${s.avgR === null ? 'text-slate-400' : tone(s.avgR)}`],
    [s.cb ? `+$${s.cb.toFixed(2)}` : '—', 'font-mono text-emerald-600'],
    [s.pts ? `+${s.pts}` : '—', 'font-mono text-violet-600'],
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white p-5 text-[#0b1c30] shadow-2xl outline-none">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-sm font-bold">Detailed session &amp; time breakdown · {label}<JournalHelp label="Detailed session & time breakdown" /></h2>
            <p className="mt-1 text-xs text-slate-600">
              {summary.wins} wins / {summary.losses} losses / {summary.be} breakeven · split by {splitLabel}
              {peak && <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">Peak</span>}
              {leak && <span className="ml-2 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">Leak</span>}
            </p>
            <dl className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs" aria-label="Group summary">
              {([
                ['Trades', String(summary.n), ''],
                ['Net P&L', formatMoney(summary.net), summary.net >= 0 ? 'text-emerald-700' : 'text-rose-700'],
                ['Win rate', summary.n ? `${summary.winRate.toFixed(0)}%` : '—', ''],
                ['Profit factor', fmtPf(summary.pf), ''],
                ['Avg R', summary.avgR === null ? '—' : summary.avgR.toFixed(2), ''],
              ] as [string, string, string][]).map(([k, v, t]) => (
                <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                  <dd className={`mt-0.5 font-mono font-semibold ${t || 'text-[#0b1c30]'}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">Close</button>
        </header>
        <p className="mt-4 text-[11px] text-slate-500">Click a {splitLabel} to see its closed trades.</p>
        <div className="mt-2 min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <caption className="sr-only">Closed results for {label}, split by {splitLabel}</caption>
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>{[splitLabel[0].toUpperCase() + splitLabel.slice(1), 'Trades', 'Win %', 'Loss %', 'BE %', 'Net P&L', 'Gross P&L', 'PF', 'Avg R', 'Cashback', 'Points'].map((h, i) => (
                <th key={h} className={`px-3 py-2 font-semibold whitespace-nowrap ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.key} className="border-t border-slate-100">
                  <td className="px-3 py-2 whitespace-nowrap"><button type="button" onClick={() => onOpenGroup(`${label} · ${r.label}`, r.ids)} className="font-semibold text-[#0b1c30] hover:text-[#5338ec] hover:underline">{r.label}</button></td>
                  {cells(r.s).map(([v, c], i) => <td key={i} className={`px-3 py-2 text-right ${c}`}>{v}</td>)}
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={11} className="py-8 text-center text-slate-500">No closed trades in this group.</td></tr>}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold">
                <tr>
                  <td className="px-3 py-2"><button type="button" onClick={() => onOpenGroup(label, ids)} className="hover:text-[#5338ec] hover:underline">Σ {label}</button></td>
                  {cells(summary).map(([v, c], i) => <td key={i} className={`px-3 py-2 text-right ${c}`}>{v}</td>)}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onOpenAll} className="rounded-lg bg-[#5338ec] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4326d8]">Open all in Trade Log</button>
        </div>
      </div>
    </div>
  );
};

export const InsightsDrillDialog: React.FC<InsightsDrillDialogProps> = ({
  label, entries, summary, formatMoney, formatEntryTime, onClose, onOpenAll, onOpenTrade,
}) => {
  const ref = useDialogFocus(onClose);
  const titleId = useId();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white p-5 text-[#0b1c30] shadow-2xl outline-none">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-sm font-bold">Closed trade results · {label}</h2>
            <p className="mt-1 text-xs text-slate-600">{summary.wins} wins / {summary.losses} losses / {summary.be} breakeven</p>
            <dl className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs" aria-label="Group summary">
              {([
                ['Trades', String(summary.n), ''],
                ['Net P&L', formatMoney(summary.net), summary.net >= 0 ? 'text-emerald-700' : 'text-rose-700'],
                ['Win rate', summary.n ? `${summary.winRate.toFixed(0)}%` : '—', ''],
                ['Profit factor', fmtPf(summary.pf), ''],
                ['Avg R', summary.avgR === null ? '—' : summary.avgR.toFixed(2), ''],
              ] as [string, string, string][]).map(([k, v, tone]) => (
                <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                  <dd className={`mt-0.5 font-mono font-semibold ${tone || 'text-[#0b1c30]'}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">Close</button>
        </header>
        <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <caption className="sr-only">Closed trades in this chart group with realized net profit or loss</caption>
            <thead className="sticky top-0 bg-slate-50 text-left text-slate-500">
              <tr><th className="p-2">Entry time</th><th className="p-2">Trade</th><th className="p-2">Strategy</th><th className="p-2">Outcome<JournalHelp label="Outcome" /></th><th className="p-2 text-right">Net P&amp;L<JournalHelp label="Net P&L" /></th><th className="p-2 text-right">R</th></tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const net = netOf(entry);
                const r = realizedR(entry);
                const outcome = resultOf(entry);
                return (
                  <tr key={entry.id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap p-2 text-slate-600">{formatEntryTime(entry)}</td>
                    <td className="p-2"><button type="button" className="font-semibold text-[#5338ec] hover:underline" onClick={() => onOpenTrade(entry)}>{entry.symbol} · {entry.direction === 'BUY' ? 'LONG' : 'SHORT'}</button></td>
                    <td className="p-2 text-slate-600">{entry.strategy || 'Unassigned'}</td>
                    <td className={`p-2 capitalize ${outcome === 'win' ? 'text-emerald-700' : outcome === 'loss' ? 'text-rose-700' : 'text-slate-500'}`}>{outcome === 'breakeven' ? 'Breakeven' : outcome}</td>
                    <td className={`whitespace-nowrap p-2 text-right font-mono font-semibold ${net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatMoney(net)}</td>
                    <td className="whitespace-nowrap p-2 text-right font-mono">{r == null ? '—' : `${r > 0 ? '+' : ''}${r.toFixed(2)}R`}</td>
                  </tr>
                );
              })}
              {!entries.length && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No eligible closed trades in this group.</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">Values use realized net P&amp;L after recorded costs; missing costs are not inferred.</p>
          <button type="button" onClick={onOpenAll} className="rounded-lg bg-[#5338ec] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4326d8]">Open all in Trade Log</button>
        </footer>
      </div>
    </div>
  );
};

interface Props {
  entries: JournalEntry[];
  brokers: Broker[];
  onDrill: (ids: string[], label: string) => void;
  onToast: (msg: string) => void;
  user: UserProfile;
  isLoggedIn: boolean;
  onSignIn: () => void;
  onUnlockCrossAnalysis: (duration: UnlockDurationOption) => boolean;
}

export const JournalInsights: React.FC<Props> = ({ entries, brokers, onDrill, onToast, user, isLoggedIn, onSignIn, onUnlockCrossAnalysis }) => {
  const money = useMoney();
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [, refreshAccess] = useState(0);
  const matrixAccessible = hasCrossAnalysisAccess(user, isLoggedIn);
  useEffect(() => {
    const until = user.journalCrossAnalysisUntil;
    if (!isLoggedIn || user.tierLevel >= 4 || typeof until !== 'number' || !Number.isFinite(until) || until <= Date.now()) return;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      refreshAccess(value => value + 1);
      const remaining = until - Date.now();
      if (remaining > 0) timer = setTimeout(refresh, Math.min(remaining, 2147483647));
    };
    timer = setTimeout(refresh, Math.min(until - Date.now(), 2147483647));
    const onVisibility = () => {
      clearTimeout(timer);
      refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, [isLoggedIn, user.tierLevel, user.journalCrossAnalysisUntil]);

  const brokerMap = useMemo(() => new Map(brokers.map((b) => [b.id, b] as const)), [brokers]);
  const brokerName = (id: string) => (id === UNASSIGNED ? 'Unassigned' : brokerMap.get(id)?.name || id);

  const [tz, setTzState] = useState<string>(() => {
    try { const saved=localStorage.getItem('ms-journal-tz');return TIMEZONES.some(z=>z.id===saved)?saved!:'UTC'; } catch { return 'UTC'; }
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
  const [metric, setMetric] = useJournalState<Metric>('JournalInsights-metric-v2', 'net');
  const [savedChartScope, setChartScope] = useJournalState<InsightChartScope>('JournalInsights-chartScope', 'closed');
  const chartScope = savedChartScope === 'open' || savedChartScope === 'unrealized' ? 'open' : 'closed';
  const [dim, setDim] = useJournalState<Dim>('JournalInsights-dim', 'playbook');
  const [sessOff, setSessOff] = useJournalState<SessionId[]>('JournalInsights-sessOff', []);
  const [mouseHover, setHover] = useState<number | null>(null);
  const [focusedBucket,setFocusedBucket] = useState<number|null>(null);
  const hover=focusedBucket===-1?null:focusedBucket ?? mouseHover;
  const [expanded, setExpanded] = useState<string[]>([]);
  const [rowFilter, setRowFilter] = useJournalState('JournalInsights-rowFilter', '');
  const [drill, setDrill] = useState<{ label: string; ids: string[]; matrix?: boolean } | null>(null);
  const [breakdownKey, setBreakdownKey] = useState<string | null>(null);
  useEffect(() => {
    if (!matrixAccessible) setDrill(current => current?.matrix ? null : current);
  }, [matrixAccessible]);

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

  // Shared journal filters apply upstream; only the visible session filter narrows this report.
  const passReportFilters = (e: JournalEntry) => !sessOff.includes(sessionOf(e));
  const openCur = entries.filter(e => tradingStatusOf(e) === 'open' && passReportFilters(e));
  const cur = useMemo(() => entries.filter(e => eligible(e) && !sessOff.includes(sessionOf(e))), [entries, sessOff]);

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
    const m = new Map<string, { key: string; label: string; order: number; list: JournalEntry[] }>();
    if (view === 'days') [1, 2, 3, 4, 5, 6, 0].forEach((d) => m.set(`w${d}`, { key: `w${d}`, label: DAY_NAMES[d], order: (d + 6) % 7, list: [] }));
    cur.forEach((e) => { const b = bucketOf(e); if (!m.has(b.key)) m.set(b.key, { ...b, list: [] }); m.get(b.key)!.list.push(e); });
    return Array.from(m.values()).sort((a, b) => a.order - b.order).map((b) => ({ ...b, s: stats(b.list) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, view, resolution, brokerMap, tz]);

  const total = useMemo(() => stats(cur), // eslint-disable-next-line react-hooks/exhaustive-deps
    [cur, brokerMap]);

  // ── insight cards ──
  const withData = buckets.filter((b) => b.s.n > 0);
  const best = withData.length ? withData.reduce((a, b) => (b.s.net > a.s.net ? b : a)) : null;
  const losingBuckets=withData.filter(b=>b.s.net<0);
  const worst = losingBuckets.length ? losingBuckets.reduce((a,b)=>b.s.net<a.s.net?b:a) : null;
  const busiest = withData.length ? withData.reduce((a, b) => (b.s.n > a.s.n ? b : a)) : null;
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
  const vals = buckets.map((b) => metricVal(b.s));
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
    const head = ['Window', 'Trades', 'Win %', 'Loss %', 'BE %', 'Net P&L', 'Gross P&L', 'Profit factor', 'Avg R', 'Cashback (est.)', 'Points (est.)'];
    const line = (label: string, s: Stats) => [label, s.n, s.winRate, s.lossRate, s.beRate, s.net, s.gross, s.pf ?? '', s.avgR ?? '', s.cb, s.pts];
    const rows: (string | number)[][] = [];
    shownRows.forEach((b) => { rows.push(line(b.label, b.s)); subOf(b.list).forEach((x) => rows.push(line(`  ${x.label}`, stats(x.list)))); });
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const blob = new Blob([[head, ...rows].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `day-time-${view}.csv`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast(`Exported ${rows.length} rows to CSV`);
  };

  const resetFilters = () => { setSessOff([]); setRowFilter(''); setDrill(null); };
  const activeFilters = sessOff.length;

  // ── small UI helpers ──
  const btn = 'h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0b1c30]';
  const Card: React.FC<{ kicker: string; badge: string; badgeTone: string; title: string; sub: string; left: [string, React.ReactNode]; right: [string, React.ReactNode]; foot?: React.ReactNode }> = ({ kicker, badge, badgeTone, title, sub, left, right, foot }) => (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{kicker}<JournalHelp label={kicker} text={kicker.startsWith('Most') ? 'The window with the largest eligible closed-trade count. Activity alone does not establish profit or quality. Inspect its source trades for context.' : kicker.startsWith('Leak') ? 'The window with the lowest observed net result among losing windows. Check sample size and risk per trade before changing a schedule.' : 'The highest observed net-result window in this filtered report. Counts, risk and position size affect this ranking; open its source trades to inspect the evidence.'} /></p>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeTone}`}>{badge}</span>
      </div>
      <p className="text-lg font-bold text-[#0b1c30] mt-2 leading-tight">{title}</p>
      <p className="text-[11px] text-slate-500 mt-1 min-h-[30px]">{sub}</p>
      <div className="mt-auto pt-3 flex items-end justify-between gap-2 border-t border-slate-100">
        <div><p className="text-[10px] text-slate-500">{left[0]}<JournalHelp label={left[0]} /></p><div className="text-base font-bold font-mono">{left[1]}</div></div>
        <div className="text-right"><p className="text-[10px] text-slate-500">{right[0]}<JournalHelp label={right[0]} /></p><div className="text-xs font-bold font-mono text-[#0b1c30]">{right[1]}</div></div>
      </div>
      {foot && <div className="mt-1">{foot}</div>}
    </div>
  );

  const DIMS: [Dim, string][] = [['broker', 'Broker'], ['playbook', 'Strategy Book'], ['symbol', 'Symbol'], ['tag', 'Tag'], ['session', 'Session'], ['duration', 'Duration'], ['size', 'Position size'], ['r', 'R-multiple']];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 items-start">
      {/* Session filter and related action */}
      <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-2">Session filter<JournalHelp label="Session filter" /></p>
            {SESSIONS.map((s) => (
              <label key={s.id} className="flex items-center justify-between gap-2 py-1 text-xs text-[#0b1c30] cursor-pointer">
                <span>{s.label}{s.start >= 0 && <span className="block text-[10px] text-slate-400 font-mono">{sessHours(s)}</span>}</span>
                <input type="checkbox" checked={!sessOff.includes(s.id)} onChange={() => setSessOff((o) => (o.includes(s.id) ? o.filter((x) => x !== s.id) : [...o, s.id]))} />
              </label>
            ))}
            <div className="flex justify-between text-[11px] mt-3 pt-3 border-t border-slate-100">
              <label htmlFor="ins-tz" className="font-semibold text-slate-500">Timezone<JournalHelp label="Timezone" /></label>
              <span className="font-mono text-[#0b1c30]">{offsetLabel(offNow)}</span>
            </div>
            <select aria-label="Timezone" id="ins-tz" value={tz} onChange={(e) => { setTz(e.target.value); setHover(null); setDrill(null); setBreakdownKey(null); }} className="mt-2 w-full h-9 border border-slate-200 rounded-lg px-2 text-xs font-semibold bg-white text-[#0b1c30]">
              {TIMEZONES.map((z) => <option key={z.id} value={z.id}>{z.label} ({offsetLabel(tzOffset(z.id, `${JOURNAL_TODAY}T12:00:00`))})</option>)}
            </select>
            <p className="text-[10px] text-slate-400 mt-1.5">Days, months and trade times are shown in this zone. Daylight saving is applied automatically.</p>
          </div>
      </aside>

      <div className="min-w-0 space-y-5" role="region" aria-label="Day & Time">
        <h2 className="text-lg font-bold text-[#0b1c30]">Day &amp; Time<JournalHelp label="Day & Time" /></h2>
        <section aria-label="Insights data connection" className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-xs"><p><strong>{entries.length} Trade Log records connected.</strong> {entries.filter(e=>eligible(e)).length} have eligible closed net results; {cur.length} match Day &amp; Time report filters.</p>{(activeFilters>0||rowFilter)&&<div className="mt-2 flex flex-wrap items-center justify-between gap-2"><p className="text-slate-500">Session filters narrow the shared journal selection.</p><button type="button" className="font-semibold text-purple-700" onClick={resetFilters}>Reset Insights filters</button></div>}{!cur.length&&entries.length>0&&<p className="mt-2 text-slate-600">{entries.some(e=>eligible(e))?'No closed results match the report filters. Reset Insights filters to restore this journal scope.':'Recorded trades are open/planned or missing realized P&L or costs. They remain in Trade Log; closed net calculations exclude them.'}</p>}</section>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-9 rounded-lg border border-slate-200 bg-white overflow-hidden" role="tablist" aria-label="Group by">
                {([['days', 'Days'], ['month', 'Month'], ['time', 'Trade time'], ['duration', 'Duration']] as const).map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => { setView(id); setHover(null); setDrill(null); setBreakdownKey(null); }}
                    className={`px-3 text-xs font-semibold ${view === id ? 'bg-[#0b1c30] text-white' : 'text-[#474556] hover:bg-slate-50'}`}>{label}</button>
                ))}
              </div>
              {view === 'time' && (
                <select aria-label="Resolution" value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="h-9 text-xs font-semibold border border-slate-200 rounded-lg px-3 bg-white">
                  <option value={1}>Hourly</option><option value={2}>2-hour</option><option value={4}>4-hour</option>
                </select>
              )}
              <button type="button" onClick={exportCsv} className={`${btn} ml-auto`}>Export CSV</button>
            </div>
            <p className="text-[11px] text-slate-500 -mt-2">
              {total.n} eligible closed trades · entire journal scope
              {activeFilters > 0 && <> · {activeFilters} filter{activeFilters === 1 ? '' : 's'} off</>}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] mb-1" aria-label="Trading status summary">
              <span className="font-semibold text-[#474556]">Trading status:</span>
              {(['open', 'closed'] as const).map((status) => (
                <span key={status} className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                  {TRADING_STATUS_LABEL[status]} {entries.filter((e) => tradingStatusOf(e) === status).length} recorded in journal scope
                </span>
              ))}
            </div>

            {/* Insight cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {best && best.s.net > 0 ? (() => { const ts = topSession(best.list, 1); return (
                <Card kicker={`Best ${unit}`} badge="Rank #1" badgeTone="bg-emerald-50 text-emerald-700" title={best.label}
                  sub={ts ? `Strongest in ${ts.s.label} (${money(ts.st.net, 0)})` : ''}
                  left={['Net P&L', <span className="text-emerald-600">{money(best.s.net)}</span>]}
                  right={['Win rate / PF', `${best.s.winRate.toFixed(0)}% · ${fmtPf(best.s.pf)}`]}
                  />
              ); })() : <Card kicker={`Best ${unit}`} badge="—" badgeTone="bg-slate-100 text-slate-500" title="No profitable window" sub="" left={['Net P&L', '—']} right={['', '']} />}
              {worst && worst.s.net < 0 ? (() => { const ts = topSession(worst.list, -1); return (
                <Card kicker={`Leak ${unit}`} badge="Risk" badgeTone="bg-rose-50 text-rose-700" title={worst.label}
                  sub={ts ? `Weakest in ${ts.s.label} (${money(ts.st.net, 0)})` : ''}
                  left={['Net P&L', <span className="text-rose-600">{money(worst.s.net)}</span>]}
                  right={['Win rate / PF', `${worst.s.winRate.toFixed(0)}% · ${fmtPf(worst.s.pf)}`]}
                  />
              ); })() : <Card kicker={`Leak ${unit}`} badge="None" badgeTone="bg-slate-100 text-slate-600" title="No losing window" sub={withData.length?'Observed windows are net positive or breakeven.':'No eligible results in this scope.'} left={['Net P&L', '—']} right={['', '']} />}
              {busiest ? (
                <Card kicker={`Most active ${unit}`} badge="Volume" badgeTone="bg-sky-50 text-sky-700" title={busiest.label}
                  sub={`${busiest.s.n} trades · ${total.n ? Math.round((busiest.s.n / total.n) * 1000) / 10 : 0}% of volume`}
                  left={['Avg hold time', <span className="text-[#0b1c30]">{busiest.s.avgDur === null ? '—' : fmtDur(busiest.s.avgDur)}</span>]}
                  right={['Net P&L', <span className={tone(busiest.s.net)}>{money(busiest.s.net, 0)}</span>]}
                  />
              ) : <Card kicker="Most active" badge="—" badgeTone="bg-slate-100 text-slate-500" title="No trades" sub="" left={['', '']} right={['', '']} />}

            </div>

            {/* Distribution chart */}
            <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Distribution">
              <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Distribution position scope">
                {([['closed', 'Closed performance'], ['open', 'Open positions & unrealized P&L']] as const).map(([id, label]) => (
                  <button key={id} type="button" aria-pressed={chartScope === id} onClick={() => { setChartScope(id); setHover(null); setFocusedBucket(null); }}
                    className={`px-3 h-8 rounded-lg text-xs font-semibold border ${chartScope === id ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556] hover:bg-slate-50'}`}>{label}</button>
                ))}
              </div>
              {chartScope !== 'closed' ? (
                <>
                  <h4 className="text-sm font-bold mb-2">Open positions & unrealized P&amp;L<JournalHelp label="Open positions & unrealized P&L" /></h4>
                  {view === 'duration' && <p className="text-[11px] text-slate-500 mb-2">Open hold time is unavailable without a valuation timestamp; exit-based duration buckets apply only to closed trades.</p>}
                  <JournalOpenInsightsChart key={`${chartScope}-${view}-${tz}-${resolution}`} entries={openCur}
                    bucketOf={e => view === 'duration' ? { key: 'open', label: 'Still open', order: 0 } : bucketOf(e)} onDrill={onDrill} />
                </>
              ) : (
                <>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold">{view === 'days' ? 'Day of week' : view === 'month' ? 'Monthly' : view === 'time' ? 'Time of day' : 'Hold time'} distribution<JournalHelp label="Distribution" /></h4>
                  <p className="text-[11px] text-slate-500">{metric === 'net' ? 'Bars show realized net profit or loss: green for profit, red for loss.' : metric === 'avgR' ? 'Bars show average realized R: green for positive, red for negative.' : 'Bars show the selected distribution metric.'} Click a bar or press Enter to open its detailed session & time breakdown.</p>
                </div>
                <div className="flex h-8 rounded-lg border border-slate-200 overflow-hidden" role="group" aria-label="Metric">
                  {([['net', 'Net P&L'], ['winRate', 'Win rate %'], ['trades', 'Trades'], ['avgR', 'Avg R']] as const).map(([id, label]) => (
                    <button key={id} type="button" aria-pressed={metric === id} onClick={() => setMetric(id)}
                      className={`px-2.5 text-[11px] font-semibold ${metric === id ? 'bg-[#0b1c30] text-white' : 'bg-white text-[#474556] hover:bg-slate-50'}`}>{label}</button>
                  ))}
                </div>
              </div>
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
                    return (
                      <g key={b.key} role="button" tabIndex={0} aria-haspopup="dialog" aria-label={`${b.label}: ${b.s.n} closed trades, net ${money(b.s.net)}; open session & time breakdown`} onFocus={()=>setFocusedBucket(i)} onBlur={()=>setFocusedBucket(null)} onKeyDown={ev=>{if(ev.key==='Escape'){setFocusedBucket(-1);setHover(null);}if((ev.key==='Enter'||ev.key===' ')&&b.s.n){ev.preventDefault();setBreakdownKey(b.key);}}} onMouseEnter={() => setHover(i)} onClick={() => { if (b.s.n) setBreakdownKey(b.key); }} style={{ cursor: b.s.n ? 'pointer' : 'default' }}>
                        <rect x={x} y={M.t} width={bw} height={H - M.t - M.b} fill={hover === i ? '#f1f5f9' : 'transparent'} />
                        {b.s.n > 0 && <rect x={x + (bw - inner) / 2} y={Math.min(yS(v), yS(0))} width={inner} height={Math.max(1.5, Math.abs(yS(v) - yS(0)))} rx={4} fill={fill} />}
                        <text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize="10" fill={b.s.n ? '#334155' : '#94a3b8'} fontWeight={b === best || b === worst ? 700 : 400}>
                          {view === 'days' ? b.label.slice(0, 3) : view === 'month' ? b.label.slice(0, 3) : b.label.split('–')[0]}
                        </text>
                        {(b === best || b === worst) && b.s.n > 0 && <text x={x + bw / 2} y={H - 2} textAnchor="middle" fontSize="9" fill={b === best ? '#059669' : '#e11d48'} fontWeight={700}>{b === best ? 'Peak' : 'Leak'}</text>}
                      </g>
                    );
                  })}
                </svg>
              </div>
              {best && best.s.n > 0 && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Peak {unit}: <span className="font-semibold text-emerald-600">{best.label}</span> ({money(best.s.net, 0)})
                  {worst && worst.s.net < 0 && <> · Leak: <span className="font-semibold text-rose-600">{worst.label}</span> ({money(worst.s.net, 0)})</>}
                </p>
              )}
                </>
              )}
            </section>

            {drill && (!drill.matrix || matrixAccessible) && (() => {
              const list = entries.filter((e) => drill.ids.includes(e.id)).sort((a, b) => (b.entryTime || b.date).localeCompare(a.entryTime || a.date));
              const s = stats(list);
              const formatEntryTime = (entry: JournalEntry) => entry.entryTime
                ? `${loc(entry).date} ${pad(loc(entry).hour ?? 0)}:${loc(entry).minute} ${tz}`
                : `${entry.date} · no time`;
              return (
                <InsightsDrillDialog
                  label={drill.label}
                  entries={list}
                  summary={s}
                  formatMoney={value => money(value)}
                  formatEntryTime={formatEntryTime}
                  onClose={() => setDrill(null)}
                  onOpenAll={() => { setDrill(null); onDrill(drill.ids, drill.label); }}
                  onOpenTrade={entry => { setDrill(null); onDrill([entry.id], `Trade · ${entry.symbol}`); }}
                />
              );
            })()}
            <ToolCreditUnlockModal
              isOpen={unlockOpen && isLoggedIn && !matrixAccessible}
              tool={CROSS_ANALYSIS_TOOL}
              user={user}
              onClose={() => setUnlockOpen(false)}
              onConfirmUnlock={(_tool, duration) => {
                if (onUnlockCrossAnalysis(duration)) setUnlockOpen(false);
              }}
            />
            {breakdownKey && (() => {
              const b = buckets.find(x => x.key === breakdownKey);
              if (!b || !b.s.n) return null;
              return (
                <InsightsBreakdownDialog
                  label={b.label}
                  splitLabel={view === 'time' ? 'weekday' : 'session'}
                  summary={b.s}
                  ids={b.list.map(e => e.id)}
                  rows={subOf(b.list).map(x => ({ key: x.key, label: x.label, s: stats(x.list), ids: x.list.map(e => e.id) }))}
                  peak={b === best && b.s.net > 0}
                  leak={b === worst && b.s.net < 0}
                  formatMoney={value => money(value)}
                  onClose={() => setBreakdownKey(null)}
                  onOpenGroup={(groupLabel, groupIds) => { setBreakdownKey(null); setDrill({ label: groupLabel, ids: groupIds }); }}
                  onOpenAll={() => { setBreakdownKey(null); onDrill(b.list.map(e => e.id), b.label); }}
                />
              );
            })()}
            {/* Cross analysis matrix */}
            <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Cross analysis matrix">
              <h4 className="text-sm font-bold">Cross analysis matrix<JournalHelp label="Cross analysis matrix" /></h4>
              <p className="text-[11px] text-slate-500 mb-3">Closed performance only. Each cell is net P&amp;L, trades and win rate for that pair. Click a cell to see its trades. Open-position chart toggles do not change realized statistics or CSV exports.</p>
              {matrixAccessible ? <>
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
                                <button type="button" onClick={() => setDrill({ label: `${row.k} · ${matrixCols.find((m) => m.key === c.key)!.label}`, ids: c.list.map((e) => e.id), matrix: true })}
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
              </> : (
                <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-slate-50">
                  <LockStateContainer
                    title="Cross analysis matrix · Level 4"
                    buttonText={isLoggedIn ? 'Unlock with Credits' : 'Sign in to unlock'}
                    onUnlock={() => isLoggedIn ? setUnlockOpen(true) : onSignIn()}
                  />
                </div>
              )}
            </section>
      </div>
    </div>
  );
};
