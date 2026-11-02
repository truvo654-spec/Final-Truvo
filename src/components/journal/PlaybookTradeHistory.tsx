import { TradeListFilters } from './TradeListFilters';
import { EMPTY_TRADE_FILTER, filterTradeList, journalTradeRecord } from './tradeListFiltering';
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { BOTH_SIDES, journalSide, type TradeSide } from './DirectionFilter';
import { eligible, metrics, netOf } from './journalMath';
import { useMoney } from './JournalCurrency';
import { executionPrice } from './playbookComparison';
import { TradingStatusBadge, tradingStatusOf } from './tradingStatus';
import { useDialogFocus } from './useDialogFocus';

/** Recorded history follows the journal scope, including open and incomplete records. */
export function playbookTradeHistory(entries: JournalEntry[], playbook: JournalPlaybook, directions: TradeSide[] = playbook.directions ?? BOTH_SIDES) {
  return entries.filter(e => e.strategy === playbook.name && directions.includes(journalSide(e.direction)))
    .sort((a, b) => (b.entryTime || b.date).localeCompare(a.entryTime || a.date) || a.id.localeCompare(b.id));
}

export function PlaybookTradeHistory({ entries, onTrade, onReplay, onViewAll }: {
  entries: JournalEntry[]; onTrade: (id: string) => void; onReplay: (id: string) => void; onViewAll?: () => void;
}) {
  const [filters, setFilters] = useState({ ...EMPTY_TRADE_FILTER });
  const filtered = filterTradeList(entries, filters, journalTradeRecord);
  const money = useMoney(), summary = metrics(filtered), compact = !!onViewAll;
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(filtered.length / 10)), current = Math.min(page, pages);
  const cell = 'px-3 py-3 text-left whitespace-nowrap';
  return <section aria-label="Playbook trade history" className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h4 className="text-sm font-bold">Trade history ({filtered.length})</h4><p className="mt-1 text-xs text-slate-500">Recorded trades · current journal filters</p></div>
      {onViewAll && <button type="button" onClick={onViewAll} className="text-xs font-semibold text-[#5338ec]">View all trades</button>}
    </header>
    <TradeListFilters value={filters} onChange={value => { setFilters(value); setPage(1); }} records={entries.map(journalTradeRecord)} count={filtered.length} />
    <p className="mt-3 text-xs text-slate-600">{summary.n} closed net result{summary.n === 1 ? "" : "s"} · Net P&amp;L <strong>{summary.n ? money(summary.total) : '—'}</strong></p>
    <div className="mt-3 overflow-x-auto"><table className="w-full text-xs">
      <thead className="bg-slate-50 text-slate-500"><tr>{['Entry · UTC', 'Instrument', 'Side', ...(compact ? [] : ['Status', 'Entry → exit']), 'Net P&L', 'Review'].map(label => <th key={label} className={cell}>{label}</th>)}</tr></thead>
      <tbody>{filtered.slice((current - 1) * 10, current * 10).map(entry => <tr key={entry.id} className="border-t border-slate-100">
        <td className={cell}>{(entry.entryTime || entry.date).replace('T', ' ').slice(0, 16)}</td>
        <td className={cell}>{entry.symbol}{compact && <span className="mt-1 block"><TradingStatusBadge status={tradingStatusOf(entry)} /></span>}</td><td className={cell}>{entry.direction === 'BUY' ? 'Long' : 'Short'}</td>
        {!compact && <td className={cell}><TradingStatusBadge status={tradingStatusOf(entry)} /></td>}
        {!compact && <td className={cell}>{executionPrice(entry.entryPrice, entry.symbol)} → {entry.exitPrice == null ? 'Open' : executionPrice(entry.exitPrice, entry.symbol)}</td>}
        <td className={cell}>{eligible(entry) ? money(netOf(entry)) : 'Pending / incomplete'}</td>
        <td className={cell}><button type="button" aria-label={`Review ${entry.symbol} trade ${entry.id}`} className="font-semibold text-[#5338ec]" onClick={() => onTrade(entry.id)}>View trade</button><button type="button" aria-label={`Replay ${entry.symbol} trade ${entry.id}`} className="ml-3 font-semibold text-[#5338ec]" onClick={() => onReplay(entry.id)}>Replay</button></td>
      </tr>)}</tbody>
    </table></div>
    {!filtered.length && <p className="py-6 text-center text-xs text-slate-500">No trades match these filters.</p>}
    {pages > 1 && <footer className="mt-3 flex items-center justify-end gap-3 text-xs"><button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button><span>{current} / {pages}</span><button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button></footer>}
  </section>;
}

export function PlaybookHistoryDialog({ name, entries, onTrade, onReplay, onClose, suspended = false }: {
  name: string; entries: JournalEntry[]; onTrade: (id: string) => void; onReplay: (id: string) => void; onClose: () => void; suspended?: boolean;
}) {
  const ref = useDialogFocus(onClose), lastFocus = useRef<HTMLElement | null>(null), wasSuspended = useRef(suspended);
  useLayoutEffect(() => {
    if (wasSuspended.current && !suspended) (lastFocus.current?.isConnected ? lastFocus.current : ref.current)?.focus({ preventScroll: true });
    wasSuspended.current = suspended;
  }, [suspended]);
  return <div inert={suspended ? true : undefined} aria-hidden={suspended || undefined} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal={!suspended} aria-label={`${name} trade history`} tabIndex={-1} onFocusCapture={e => { if (!suspended) lastFocus.current = e.target as HTMLElement; }} className="max-h-[90dvh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none">
      <header className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold">{name} · Trade history</h3><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Close</button></header>
      <PlaybookTradeHistory entries={entries} onTrade={onTrade} onReplay={onReplay} />
    </div>
  </div>;
}
