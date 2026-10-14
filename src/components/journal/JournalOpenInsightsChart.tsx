import React, { useState } from 'react';
import type { JournalEntry } from '../../types';
import { currencyOf, statusOf } from './journalMath';
import { formatMoney } from './JournalCurrency';
import { useDialogFocus } from './useDialogFocus';

export type InsightChartScope = 'closed' | 'open' | 'unrealized';
type Bucket = { key: string; label: string; order: number };
const reportedPnl = (entry: JournalEntry) => entry.pnlKnown !== false && Number.isFinite(entry.pnl) ? entry.pnl : null;

export function openInsightGroups(entries: JournalEntry[], bucketOf: (entry: JournalEntry) => Bucket) {
  const grouped = new Map<string, Bucket & { entries: JournalEntry[] }>();
  entries.filter(entry => statusOf(entry) === 'open').forEach(entry => {
    const bucket = bucketOf(entry);
    if (!grouped.has(bucket.key)) grouped.set(bucket.key, { ...bucket, entries: [] });
    grouped.get(bucket.key)!.entries.push(entry);
  });
  return [...grouped.values()].sort((a, b) => a.order - b.order).map(group => {
    const known = group.entries.filter(entry => reportedPnl(entry) != null);
    const mixed = new Set(known.map(currencyOf)).size > 1;
    const subtotal = known.length && !mixed ? known.reduce((sum, entry) => sum + entry.pnl, 0) : null;
    return { ...group, known: known.length, subtotal, pnl: known.length === group.entries.length ? subtotal : null };
  });
}

interface Props {
  entries: JournalEntry[];
  bucketOf: (entry: JournalEntry) => Bucket;
  onDrill: (ids: string[], label: string) => void;
}

const OpenPositionsDialog: React.FC<{ title: string; summary: string; onClose: () => void; children: React.ReactNode }> = ({ title, summary, onClose, children }) => {
  const ref = useDialogFocus(onClose);
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className="w-full max-w-3xl max-h-[90dvh] overflow-y-auto bg-white text-[#0b1c30] rounded-2xl p-5 shadow-2xl outline-none">
        <header className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-sm font-bold">{title}</h4>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50">Close</button>
        </header>
        <p className="mb-3 text-xs text-slate-600">{summary}</p>
        {children}
      </div>
    </div>
  );
};

export const JournalOpenInsightsChart: React.FC<Props> = ({ entries, bucketOf, onDrill }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [dialogKey, setDialogKey] = useState<string | null>(null);
  const active = focused ?? hovered;
  const groups = openInsightGroups(entries, bucketOf);
  const positions = groups.flatMap(group => group.entries);
  const known = positions.filter(entry => reportedPnl(entry) != null);
  const currencies = new Set(positions.map(currencyOf));
  const mixed = currencies.size > 1;
  const currency = currencies.values().next().value ?? 'USD';
  const money = (value: number) => formatMoney(value, currency);
  const total = !mixed && known.length === positions.length && positions.length ? known.reduce((sum, entry) => sum + entry.pnl, 0) : null;
  const valueOf = (group: typeof groups[number]) => mixed ? null : group.pnl;
  const values = groups.map(valueOf).filter((value): value is number => value != null);
  const max = Math.max(0, ...values), min = Math.min(0, ...values);
  const span = max - min || 1;
  const width = 760, height = 240, left = 24, right = 12, top = 16, bottom = 40;
  const step = (width - left - right) / Math.max(1, groups.length);
  const y = (value: number) => top + (max - value) / span * (height - top - bottom);
  const selected = groups.find(group => group.key === active);
  const dialogGroup = groups.find(group => group.key === dialogKey);
  const details = (group: typeof groups[number]) => `${group.label}: ${group.entries.length} open positions; ${mixed ? 'mixed currencies, P&L cannot be combined' : group.pnl == null ? `unrealized P&L unknown (${group.known}/${group.entries.length} reported)` : `unrealized P&L ${money(group.pnl)}`}`;
  const positionTable = (list: typeof groups) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <caption className="text-left text-slate-500 pb-2">Open-position list · click a position to review · account ROI uses recorded equity at entry, not CFD notional or margin.</caption>
        <thead><tr className="text-left text-slate-500"><th className="p-2">Position</th><th className="p-2">Entry window</th><th className="p-2">Unrealized P&amp;L</th><th className="p-2">Account ROI %</th></tr></thead>
        <tbody>{list.flatMap(group => group.entries.map(entry => {
          const pnl = reportedPnl(entry);
          const roi = pnl != null && Number.isFinite(entry.equityAtEntry) && entry.equityAtEntry! > 0 ? pnl / entry.equityAtEntry! * 100 : null;
          return <tr key={entry.id} className="border-t border-slate-100">
            <td className="p-2"><button type="button" className="text-[#5338ec] font-semibold hover:underline" onClick={() => onDrill([entry.id], `Open position · ${entry.symbol}`)}>{entry.symbol} · {entry.direction}</button></td>
            <td className="p-2">{group.label}</td>
            <td className="p-2 font-mono">{pnl == null ? 'Unknown' : formatMoney(pnl, currencyOf(entry))}</td>
            <td className="p-2 font-mono">{roi == null ? 'Unknown' : `${roi.toFixed(2)}%`}</td>
          </tr>;
        }))}</tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600" aria-live="polite">
        {positions.length} open positions · {known.length}/{positions.length} P&amp;L reported · Unrealized P&amp;L: <strong>{total == null ? 'Unknown' : money(total)}</strong>
      </p>
      <p className="text-[11px] text-slate-500">Recorded open-position snapshot, grouped by entry time, not a historical P&amp;L series or live broker feed. Report filters apply. Planned and closed trades are excluded; fees are not inferred.</p>
      <p className="text-[11px] text-slate-500">Bars show unrealized profit/loss; labels show open-position counts. Hover or focus for exact values; select a bar to open its position-list popup.</p>
      {mixed && <p role="alert" className="text-xs text-amber-700">Select one account currency before combining unrealized P&amp;L. Individual position values remain available below.</p>}
      {!positions.length ? <p className="py-8 text-center text-sm text-slate-500">No open positions match these report filters.</p> : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Open positions and reported unrealized P&L by entry window" onMouseLeave={() => setHovered(null)}>
            <text x={left} y={12} fontSize={10} fill="#64748b">{mixed ? 'Mixed currencies' : currency}</text>
            <line x1={left} x2={width - right} y1={y(0)} y2={y(0)} stroke="#94a3b8" />
            {groups.map((group, index) => {
              const value = valueOf(group), x = left + index * step, bar = Math.min(46, step * 0.6);
              const drill = () => setDialogKey(group.key);
              return (
                <g key={group.key} role="button" tabIndex={0} aria-haspopup="dialog" aria-label={`${details(group)}; view positions`} onMouseEnter={() => setHovered(group.key)} onFocus={() => setFocused(group.key)} onBlur={() => setFocused(null)} onClick={drill} onKeyDown={event => {
                  if (event.key === 'Escape') { setFocused(null); setHovered(null); }
                  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); drill(); }
                }} className="cursor-pointer">
                  <rect x={x} y={top} width={step} height={height - top - bottom} fill={active === group.key ? '#f1f5f9' : 'transparent'} />
                  {value != null ? <rect x={x + (step - bar) / 2} y={Math.min(y(value), y(0))} width={bar} height={Math.max(2, Math.abs(y(value) - y(0)))} rx={4} fill={value < 0 ? '#f43f5e' : '#10b981'} /> : <text x={x + step / 2} y={height / 2} textAnchor="middle" fontSize={11} fill="#64748b">Unknown</text>}
                  <text x={x + step / 2} y={height - 18} textAnchor="middle" fontSize={10} fill="#334155">{group.label.length > 16 ? `${group.label.slice(0, 14)}…` : group.label}</text>
                  <text x={x + step / 2} y={height - 4} textAnchor="middle" fontSize={9} fill="#64748b">{group.entries.length} open</text>
                  <title>{details(group)}</title>
                </g>
              );
            })}
          </svg>
          {selected && <p role="status" className="rounded-lg bg-slate-50 p-2 text-xs font-mono">{details(selected)}{!mixed && selected.pnl == null && selected.subtotal != null ? ` · Known subtotal only: ${money(selected.subtotal)}` : ''}</p>}
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold text-[#5338ec]">Show all open positions ({positions.length})</summary>
            <div className="mt-3">{positionTable(groups)}</div>
          </details>
          {dialogGroup && <OpenPositionsDialog title={`Open positions · ${dialogGroup.label}`} summary={details(dialogGroup)} onClose={() => setDialogKey(null)}>
            {positionTable([dialogGroup])}
          </OpenPositionsDialog>}
        </>
      )}
    </div>
  );
};
