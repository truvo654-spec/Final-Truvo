// Backtest trade log: sortable table, two quick filters, a "More filters" drawer, removable chips,
// totals for what you see, and a side drawer with the trade on a chart.
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Filter, X, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BacktestTrade, Currency, EXIT_REASONS, ExitReason, Timeframe, TF_MS } from '../../backtest/types';
import { outcomeOf, Outcome, SESSION_BUCKETS, sessionOfUtc } from '../../backtest/metrics';
import { dateTime, dayIn, holdText, money, pct, priceFmt, rr, tone } from '../../backtest/format';
import { marketData, symbolSpec } from '../../backtest/marketData';
import { CandleChart } from './charts';
import { Drawer, Field, Segmented, btnPrimary, btnSecondary, inputBase, inputCls } from './ui';

interface Props { trades: BacktestTrade[]; currency: Currency; symbol: string; timeframe: Timeframe; tz: string }

interface Filters {
  result: Outcome[]; reasons: ExitReason[]; sessions: string[]; weekdays: string[];
  pnlMin: string; pnlMax: string; rMin: string; rMax: string; hourFrom: string; hourTo: string; holdMin: string; holdMax: string;
}
const EMPTY: Filters = { result: [], reasons: [], sessions: [], weekdays: [], pnlMin: '', pnlMax: '', rMin: '', rMax: '', hourFrom: '', hourTo: '', holdMin: '', holdMax: '' };
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type SortKey = 'id' | 'entryTime' | 'exitTime' | 'direction' | 'entryPrice' | 'exitPrice' | 'size' | 'gross' | 'net' | 'r' | 'mae' | 'mfe' | 'exitReason' | 'balance';
const COLS: { key: SortKey; label: string; hint: string; align?: 'right' }[] = [
  { key: 'id', label: '#', hint: 'Trade number in time order' },
  { key: 'entryTime', label: 'Entry time', hint: 'When the trade opened (your time zone)' },
  { key: 'exitTime', label: 'Exit time', hint: 'When the trade closed' },
  { key: 'direction', label: 'Side', hint: 'Long (buy) or short (sell)' },
  { key: 'entryPrice', label: 'Entry', hint: 'Fill price including spread and slippage, and the order type', align: 'right' },
  { key: 'exitPrice', label: 'Exit', hint: 'Average exit fill price', align: 'right' },
  { key: 'size', label: 'Size', hint: 'Position size', align: 'right' },
  { key: 'gross', label: 'Gross', hint: 'Profit or loss from the price move, before costs', align: 'right' },
  { key: 'net', label: 'Net', hint: 'After commission, spread and slippage', align: 'right' },
  { key: 'r', label: 'R', hint: 'Net result divided by the money risked at entry', align: 'right' },
  { key: 'mae', label: 'MAE', hint: 'Maximum adverse excursion: the furthest the trade went against you, in R', align: 'right' },
  { key: 'mfe', label: 'MFE', hint: 'Maximum favourable excursion: the furthest the trade went in your favour, in R', align: 'right' },
  { key: 'exitReason', label: 'Exit reason', hint: 'Why the trade closed' },
  { key: 'balance', label: 'Balance', hint: 'Running balance after this trade (always in time order, whatever the sorting)', align: 'right' },
];

const PAGE = 20;

export const BacktestTradeLog: React.FC<Props> = ({ trades, currency, symbol, timeframe, tz }) => {
  const spec = symbolSpec(symbol);
  const dp = spec?.priceDp ?? 2;
  const [dir, setDir] = useState<'all' | 'long' | 'short'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [f, setF] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [drawer, setDrawer] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'id', asc: true });
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<BacktestTrade | null>(null);

  const hourOf = (t: number) => Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date(t))) % 24;
  const wdOf = (t: number) => new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date(t));
  const n = (s: string) => (s === '' ? null : Number(s));

  const filtered = useMemo(() => trades.filter((t) => {
    if (dir !== 'all' && t.direction !== dir) return false;
    const d = dayIn(t.entryTime, tz);
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (f.result.length && !f.result.includes(outcomeOf(t))) return false;
    if (f.reasons.length && !f.reasons.includes(t.exitReason)) return false;
    if (f.sessions.length && !f.sessions.includes(sessionOfUtc(t.entryTime))) return false;
    if (f.weekdays.length && !f.weekdays.includes(wdOf(t.entryTime))) return false;
    const lim = (v: number, lo: string, hi: string) => (n(lo) === null || v >= n(lo)!) && (n(hi) === null || v <= n(hi)!);
    if (!lim(t.net, f.pnlMin, f.pnlMax) || !lim(t.r, f.rMin, f.rMax)) return false;
    const h = hourOf(t.entryTime);
    if (n(f.hourFrom) !== null && h < n(f.hourFrom)!) return false;
    if (n(f.hourTo) !== null && h > n(f.hourTo)!) return false;
    if (!lim((t.exitTime - t.entryTime) / 60000, f.holdMin, f.holdMax)) return false;
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [trades, dir, from, to, f, tz]);

  const rows = useMemo(() => {
    const k = sort.key;
    return [...filtered].sort((a, b) => {
      const x = a[k], y = b[k];
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.asc ? c : -c;
    });
  }, [filtered, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = rows.slice(pg * PAGE, pg * PAGE + PAGE);
  const net = filtered.reduce((a, t) => a + t.net, 0);
  const wins = filtered.filter((t) => outcomeOf(t) === 'win').length;
  const avgR = filtered.length ? filtered.reduce((a, t) => a + t.r, 0) / filtered.length : 0;

  const activeCount = f.result.length + f.reasons.length + f.sessions.length + f.weekdays.length
    + [f.pnlMin || f.pnlMax, f.rMin || f.rMax, f.hourFrom || f.hourTo, f.holdMin || f.holdMax].filter(Boolean).length;

  const chips: { label: string; clear: () => void }[] = [];
  if (dir !== 'all') chips.push({ label: dir === 'long' ? 'Long only' : 'Short only', clear: () => setDir('all') });
  if (from || to) chips.push({ label: `${from || 'start'} → ${to || 'end'}`, clear: () => { setFrom(''); setTo(''); } });
  f.result.forEach((r) => chips.push({ label: r === 'win' ? 'Winners' : r === 'loss' ? 'Losers' : 'Breakeven', clear: () => setF({ ...f, result: f.result.filter((x) => x !== r) }) }));
  f.reasons.forEach((r) => chips.push({ label: `Exit: ${r}`, clear: () => setF({ ...f, reasons: f.reasons.filter((x) => x !== r) }) }));
  f.sessions.forEach((r) => chips.push({ label: SESSION_BUCKETS.find((s) => s.key === r)!.label, clear: () => setF({ ...f, sessions: f.sessions.filter((x) => x !== r) }) }));
  f.weekdays.forEach((r) => chips.push({ label: r, clear: () => setF({ ...f, weekdays: f.weekdays.filter((x) => x !== r) }) }));
  if (f.pnlMin || f.pnlMax) chips.push({ label: `P&L ${f.pnlMin || '…'} to ${f.pnlMax || '…'}`, clear: () => setF({ ...f, pnlMin: '', pnlMax: '' }) });
  if (f.rMin || f.rMax) chips.push({ label: `R ${f.rMin || '…'} to ${f.rMax || '…'}`, clear: () => setF({ ...f, rMin: '', rMax: '' }) });
  if (f.hourFrom || f.hourTo) chips.push({ label: `Entry hour ${f.hourFrom || '0'}–${f.hourTo || '23'}`, clear: () => setF({ ...f, hourFrom: '', hourTo: '' }) });
  if (f.holdMin || f.holdMax) chips.push({ label: `Hold ${f.holdMin || '0'}–${f.holdMax || '∞'} min`, clear: () => setF({ ...f, holdMin: '', holdMax: '' }) });

  const toggleIn = <K extends 'result' | 'reasons' | 'sessions' | 'weekdays'>(k: K, v: Filters[K][number]) =>
    setDraft((d) => ({ ...d, [k]: (d[k] as string[]).includes(v as string) ? (d[k] as string[]).filter((x) => x !== v) : [...(d[k] as string[]), v] }));

  const chartFor = (t: BacktestTrade) => {
    try {
      const s = marketData.seriesSync(symbol, timeframe);
      let lo = 0, hi = s.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (s.t[m] < t.entryTime) lo = m + 1; else hi = m; }
      const ei = lo;
      let xi = ei;
      while (xi < s.length - 1 && s.t[xi] + TF_MS[timeframe] <= t.exitTime) xi++;
      const a = Math.max(0, ei - 40), b = Math.min(s.length, Math.max(xi + 15, ei + 30), a + 220);
      const bars = [];
      for (let i = a; i < b; i++) bars.push({ t: s.t[i], o: s.o[i], h: s.h[i], l: s.l[i], c: s.c[i], v: s.v[i] });
      return { bars, ei: ei - a, xi: xi - a };
    } catch { return null; }
  };
  const ch = open ? chartFor(open) : null;

  const pill = (on: boolean) => `h-8 px-3 rounded-lg text-xs font-semibold border ${on ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556] hover:bg-slate-50'}`;

  return (
    <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5 min-w-0" aria-label="Backtest trades">
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div className="mr-auto">
          <h3 className="text-sm font-bold text-[#0b1c30]">Trades</h3>
          <p className="text-[11px] text-slate-500">Click a column to sort (again to reverse). Click a row to see the trade on a chart.</p>
        </div>
        <Segmented size="sm" label="Direction" value={dir} onChange={(v) => { setDir(v); setPage(0); }} options={[{ id: 'all', label: 'All' }, { id: 'long', label: 'Long' }, { id: 'short', label: 'Short' }]} />
        <div className="flex items-center gap-1.5">
          <input type="date" aria-label="From date (included)" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} className={`${inputBase} h-8 w-[9.5rem] text-xs`} />
          <span className="text-xs text-slate-400">to</span>
          <input type="date" aria-label="To date (included)" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} className={`${inputBase} h-8 w-[9.5rem] text-xs`} />
        </div>
        <button type="button" className={`${btnSecondary} h-8`} onClick={() => { setDraft(f); setDrawer(true); }}>
          <Filter className="w-3.5 h-3.5" /> More filters{activeCount > 0 && <span className="ml-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-[#5338ec] text-white text-[10px]">{activeCount}</span>}
        </button>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3" aria-label="Active filters">
          {chips.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-full bg-[#EEF0FE] text-[#5338ec] text-[11px] font-semibold">
              {c.label}
              <button type="button" aria-label={`Remove filter ${c.label}`} onClick={() => { c.clear(); setPage(0); }} className="p-0.5 rounded-full hover:bg-[#5338ec]/10"><X className="w-3 h-3" /></button>
            </span>
          ))}
          <button type="button" className="text-[11px] font-semibold text-slate-500 hover:underline ml-1" onClick={() => { setDir('all'); setFrom(''); setTo(''); setF(EMPTY); setPage(0); }}>Clear all</button>
        </div>
      )}

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-xs tabular-nums">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              {COLS.map((c) => {
                const on = sort.key === c.key;
                return (
                  <th key={c.key} scope="col" aria-sort={on ? (sort.asc ? 'ascending' : 'descending') : 'none'} className={`py-2 px-2 font-bold whitespace-nowrap ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                    <button type="button" title={c.hint} onClick={() => setSort(on ? { key: c.key, asc: !sort.asc } : { key: c.key, asc: c.key === 'id' || c.key === 'entryTime' })} className="inline-flex items-center gap-1 uppercase hover:text-[#0b1c30]">
                      {c.label}{on && (sort.asc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((t) => (
              <tr key={t.id} tabIndex={0} onClick={() => setOpen(t)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(t); } }}
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer focus:outline-none focus-visible:bg-[#EEF0FE]">
                <td className="py-2 px-2 text-slate-400">{t.id}</td>
                <td className="py-2 px-2 whitespace-nowrap">{dateTime(t.entryTime, tz)}</td>
                <td className="py-2 px-2 whitespace-nowrap text-slate-500">{dateTime(t.exitTime, tz)}</td>
                <td className="py-2 px-2"><span className={`inline-flex items-center gap-1 font-bold ${t.direction === 'long' ? 'text-emerald-700' : 'text-rose-700'}`}>{t.direction === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{t.direction === 'long' ? 'Long' : 'Short'}</span></td>
                <td className="py-2 px-2 text-right whitespace-nowrap">{priceFmt(t.entryPrice, dp)} <span className="text-[10px] text-slate-400">{t.orderType}</span></td>
                <td className="py-2 px-2 text-right">{priceFmt(t.exitPrice, dp)}</td>
                <td className="py-2 px-2 text-right">{t.size}</td>
                <td className={`py-2 px-2 text-right ${tone(t.gross)}`}>{money(t.gross, currency)}</td>
                <td className={`py-2 px-2 text-right font-bold ${tone(t.net)}`}>{money(t.net, currency)}</td>
                <td className={`py-2 px-2 text-right font-semibold ${tone(t.r)}`}>{rr(t.r)}</td>
                <td className="py-2 px-2 text-right text-rose-600">{rr(t.mae)}</td>
                <td className="py-2 px-2 text-right text-emerald-600">{rr(t.mfe)}</td>
                <td className="py-2 px-2 whitespace-nowrap capitalize">{t.exitReason}{t.ambiguous && <span title="Stop and target were both inside this bar; the stop was counted first." className="ml-1 text-amber-600"><AlertTriangle className="inline w-3 h-3" /></span>}{t.partial && <span className="ml-1 text-[10px] text-slate-400">+partial</span>}</td>
                <td className="py-2 px-2 text-right text-[#0b1c30]">{money(t.balance, currency, 0, false)}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={COLS.length} className="py-10 text-center text-slate-500">No trades match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#474556]">
        <p className="tabular-nums" aria-live="polite">Showing <b className="text-[#0b1c30]">{filtered.length}</b> of {trades.length} trades · net <b className={tone(net)}>{money(net, currency)}</b> · win rate <b className="text-[#0b1c30]">{pct(filtered.length ? wins / filtered.length : 0, 0)}</b> · avg <b className={tone(avgR)}>{rr(avgR)}</b></p>
        {pages > 1 && (
          <div className="ml-auto flex items-center gap-1">
            <button type="button" className={`${btnSecondary} h-8`} disabled={pg === 0} onClick={() => setPage(pg - 1)}>Previous</button>
            <span className="px-2 tabular-nums">{pg + 1} / {pages}</span>
            <button type="button" className={`${btnSecondary} h-8`} disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}>Next</button>
          </div>
        )}
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="More filters"
        footer={<div className="flex gap-2"><button type="button" className={btnSecondary} onClick={() => setDraft(EMPTY)}>Clear all</button><button type="button" className={`${btnPrimary} flex-1`} onClick={() => { setF(draft); setPage(0); setDrawer(false); }}>Apply</button></div>}>
        <div className="space-y-5">
          <Field label="Result">
            <div className="flex flex-wrap gap-1.5">{(['win', 'loss', 'breakeven'] as Outcome[]).map((r) => <button key={r} type="button" aria-pressed={draft.result.includes(r)} onClick={() => toggleIn('result', r)} className={pill(draft.result.includes(r))}>{r === 'win' ? 'Winners' : r === 'loss' ? 'Losers' : 'Breakeven'}</button>)}</div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`P&L from (${currency})`}><input type="number" aria-label="P&L from" value={draft.pnlMin} onChange={(e) => setDraft({ ...draft, pnlMin: e.target.value })} className={inputCls} /></Field>
            <Field label="to"><input type="number" aria-label="P&L to" value={draft.pnlMax} onChange={(e) => setDraft({ ...draft, pnlMax: e.target.value })} className={inputCls} /></Field>
            <Field label="R from"><input type="number" step="0.1" aria-label="R from" value={draft.rMin} onChange={(e) => setDraft({ ...draft, rMin: e.target.value })} className={inputCls} /></Field>
            <Field label="to"><input type="number" step="0.1" aria-label="R to" value={draft.rMax} onChange={(e) => setDraft({ ...draft, rMax: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Exit reason">
            <div className="flex flex-wrap gap-1.5">{EXIT_REASONS.map((r) => <button key={r} type="button" aria-pressed={draft.reasons.includes(r)} onClick={() => toggleIn('reasons', r)} className={`${pill(draft.reasons.includes(r))} capitalize`}>{r}</button>)}</div>
          </Field>
          <Field label="Session (UTC)">
            <div className="flex flex-wrap gap-1.5">{SESSION_BUCKETS.map((s) => <button key={s.key} type="button" aria-pressed={draft.sessions.includes(s.key)} onClick={() => toggleIn('sessions', s.key)} className={pill(draft.sessions.includes(s.key))}>{s.label}</button>)}</div>
          </Field>
          <Field label="Weekday">
            <div className="flex flex-wrap gap-1.5">{WEEKDAYS.map((d) => <button key={d} type="button" aria-pressed={draft.weekdays.includes(d)} onClick={() => toggleIn('weekdays', d)} className={pill(draft.weekdays.includes(d))}>{d}</button>)}</div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry hour from" hint="Hour of entry in your time zone, 0–23"><input type="number" min={0} max={23} aria-label="Entry hour from" value={draft.hourFrom} onChange={(e) => setDraft({ ...draft, hourFrom: e.target.value })} className={inputCls} /></Field>
            <Field label="to"><input type="number" min={0} max={23} aria-label="Entry hour to" value={draft.hourTo} onChange={(e) => setDraft({ ...draft, hourTo: e.target.value })} className={inputCls} /></Field>
            <Field label="Hold time from (min)"><input type="number" min={0} aria-label="Hold time from in minutes" value={draft.holdMin} onChange={(e) => setDraft({ ...draft, holdMin: e.target.value })} className={inputCls} /></Field>
            <Field label="to"><input type="number" min={0} aria-label="Hold time to in minutes" value={draft.holdMax} onChange={(e) => setDraft({ ...draft, holdMax: e.target.value })} className={inputCls} /></Field>
          </div>
        </div>
      </Drawer>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `Trade #${open.id} · ${open.direction === 'long' ? 'Long' : 'Short'} ${symbol}` : 'Trade'} width="max-w-2xl">
        {open && (
          <div className="space-y-4">
            {ch && <CandleChart bars={ch.bars} from={0} to={ch.bars.length} dp={dp} height={300} label={`Trade ${open.id} on the chart`}
              lines={[{ price: open.entryPrice, color: '#5338ec', label: 'Entry' }, { price: open.stopPrice, color: '#e11d48', label: 'Stop', dashed: true }, ...(open.targetPrice ? [{ price: open.targetPrice, color: '#059669', label: 'Target', dashed: true }] : [])]}
              markers={[{ index: ch.ei, price: open.entryPrice, kind: open.direction === 'long' ? 'buy' : 'sell' }, { index: ch.xi, price: open.exitPrice, kind: 'exit' }]} />}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                ['Entry', `${priceFmt(open.entryPrice, dp)} (${open.orderType})`], ['Exit', priceFmt(open.exitPrice, dp)], ['Stop', priceFmt(open.stopPrice, dp)],
                ['Target', open.targetPrice ? priceFmt(open.targetPrice, dp) : 'None'], ['Size', `${open.size} ${spec?.sizeUnit ?? ''}`], ['Held', `${open.bars} bars · ${holdText((open.exitTime - open.entryTime) / 60000)}`],
                ['Gross', money(open.gross, currency)], ['Costs', money(-open.costs, currency)], ['Net', money(open.net, currency)],
                ['Result', rr(open.r)], ['MAE / MFE', `${rr(open.mae)} / ${rr(open.mfe)}`], ['Exit reason', open.exitReason],
                ['Opened', dateTime(open.entryTime, tz)], ['Closed', dateTime(open.exitTime, tz)], ['Balance after', money(open.balance, currency, 2, false)],
              ].map(([k, v]) => <div key={k} className="rounded-lg bg-slate-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</dt><dd className="font-semibold text-[#0b1c30] tabular-nums capitalize-first">{v}</dd></div>)}
            </dl>
            {open.ambiguous && <p className="text-xs text-amber-700 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> The stop and the target were both inside one bar. The stop was counted first, so this result may be slightly pessimistic.</p>}
          </div>
        )}
      </Drawer>
    </section>
  );
};
