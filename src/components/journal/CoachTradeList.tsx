import React, { useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import { metrics, netOf, realizedR, timestampMs } from './journalMath';
import { formatMoney } from './JournalCurrency';

const marketStyle: Record<string, { label: string; style: string }> = {
  Forex: { label: 'FX', style: 'bg-blue-100 text-blue-700' },
  Crypto: { label: 'CR', style: 'bg-violet-100 text-violet-700' },
  Stocks: { label: 'EQ', style: 'bg-cyan-100 text-cyan-700' },
  Indices: { label: 'IX', style: 'bg-indigo-100 text-indigo-700' },
  Commodity: { label: 'CM', style: 'bg-amber-100 text-amber-700' },
};
const tone = (value: number) => value > 0 ? 'text-emerald-600' : value < 0 ? 'text-rose-600' : 'text-slate-500';
const entryDate = (entry: JournalEntry) => {
  const time = timestampMs(entry.entryTime);
  const knownTime = Number.isFinite(time);
  const date = new Date(knownTime ? time : `${entry.date}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return entry.date;
  const day = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
  return knownTime ? `${day} ${date.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })}` : day;
};

export const CoachTradeList: React.FC<{ entries: JournalEntry[]; currency: string; selectedIds: string[]; onSelectionChange: (ids: string[]) => void }> = ({ entries, currency, selectedIds, onSelectionChange }) => {
  const [page, setPage] = useState(1);
  const [ascending, setAscending] = useState(false);
  const sorted = useMemo(() => [...entries].sort((a, b) => (ascending ? 1 : -1) * ((timestampMs(a.entryTime) || timestampMs(`${a.date}T00:00:00Z`)) - (timestampMs(b.entryTime) || timestampMs(`${b.date}T00:00:00Z`)))), [entries, ascending]);
  useEffect(() => setPage(1), [entries, ascending]);
  const pages = Math.max(1, Math.ceil(sorted.length / 10));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * 10, current * 10);
  const selected = new Set(selectedIds);
  const total = metrics(entries.filter(entry => selected.has(entry.id)));
  const toggle = (id: string) => onSelectionChange([id]);
  return <div aria-label="Select trades for analysis">
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs"><p className="text-slate-500">Choose one trade to see its matching scenarios. Times are UTC.</p><span className="font-semibold text-[#5338ec]">{total.n} trade selected · {entries.length} available · {currency}</span></div>
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[720px] text-left text-xs">
        <caption className="sr-only">Source trades for the AI Coach scenario comparison</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500"><tr>
          <th scope="col" className="w-10 px-3 py-3"><span className="sr-only">Select one trade</span></th>
          <th scope="col" className="px-4 py-3"><button type="button" onClick={() => setAscending(value => !value)} aria-label={`Sort date ${ascending ? 'newest' : 'oldest'} first`} className="flex items-center gap-1 hover:text-[#5338ec]">Date &amp; Time <span className="text-[#5338ec]">{ascending ? '▴' : '▾'}</span></button></th>
          <th scope="col" className="px-4 py-3">Instrument</th><th scope="col" className="px-4 py-3">Side</th><th scope="col" className="px-4 py-3">Playbook</th><th scope="col" className="px-4 py-3 text-right">Net P&amp;L</th><th scope="col" className="px-4 py-3 text-right">Realized R</th>
        </tr></thead>
        <tbody>{visible.map(entry => {
          const market = marketStyle[entry.assetClass];
          const r = realizedR(entry);
          return <tr key={entry.id} onClick={() => toggle(entry.id)} className={`cursor-pointer border-b border-slate-100 hover:bg-[#F8F7FF] ${selected.has(entry.id) ? 'bg-[#FBFAFF]' : ''}`}>
            <td className="px-3 py-3.5" onClick={event => event.stopPropagation()}><input type="radio" name="coach-source-trade" aria-label={`Select trade ${entry.id} · ${entry.symbol}`} className="accent-[#5338ec]" checked={selected.has(entry.id)} onChange={() => toggle(entry.id)}/></td>
            <td className="whitespace-nowrap px-4 py-3.5"><button type="button" aria-pressed={selected.has(entry.id)} className="text-[#0b1c30] hover:text-[#5338ec] hover:underline" onClick={event => { event.stopPropagation(); toggle(entry.id); }}>{entryDate(entry)}</button></td>
            <td className="px-4 py-3.5"><div className="flex items-center gap-2"><span title={entry.assetClass} className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[9px] font-bold ${market?.style || 'bg-slate-100 text-slate-600'}`}>{market?.label || entry.assetClass.slice(0, 2)}</span><span className="font-semibold">{entry.symbol}</span></div></td>
            <td className="px-4 py-3.5"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${entry.direction === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{entry.direction === 'BUY' ? 'LONG' : 'SHORT'}</span></td>
            <td className="max-w-44 truncate px-4 py-3.5 text-slate-600" title={entry.strategy}>{entry.strategy || 'Unassigned'}</td>
            <td className={`whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums ${tone(netOf(entry))}`}>{formatMoney(netOf(entry), currency)}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-right tabular-nums">{r == null ? '—' : `${r.toFixed(2)}R`}</td>
          </tr>;
        })}{!visible.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No eligible closed trades match these filters.</td></tr>}</tbody>
        <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold"><tr><th scope="row" colSpan={5} className="px-4 py-3">Selected ({total.n})</th><td className={`px-4 py-3 text-right tabular-nums ${tone(total.total)}`}>{total.n ? formatMoney(total.total, currency) : '—'}</td><td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{total.avgR == null ? '—' : `${total.avgR.toFixed(2)}R avg`}</td></tr></tfoot>
      </table>
    </div>
    {pages > 1 && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"><span>{(current - 1) * 10 + 1}–{Math.min(current * 10, entries.length)} of {entries.length} trades</span><div className="flex items-center gap-3"><button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button><span>{current} / {pages}</span><button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Next</button></div></div>}
  </div>;
};
