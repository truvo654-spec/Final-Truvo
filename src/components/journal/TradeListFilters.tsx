import React from 'react';
import { EMPTY_TRADE_FILTER, TRADE_MARKETS, tradeRecordMarket, type TradeFilterRecord, type TradeListFilter } from './tradeListFiltering';

export function TradeListFilters({ value, onChange, records, count }: {
  value: TradeListFilter; onChange: (filter: TradeListFilter) => void; records: TradeFilterRecord[]; count: number;
}) {
  const symbols = [...new Set(records.filter(record => value.market === 'all' || tradeRecordMarket(record) === value.market).map(record => record.symbol))].sort();
  const active = value.search.trim() || value.market !== 'all' || value.symbol !== 'all';
  const field = 'mt-1 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0b1c30] focus:outline-[#5338ec]';
  return <div role="group" aria-label="Trade list filters" className="my-4 space-y-2">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <label className="min-w-0 text-xs font-semibold text-slate-500">Search<input type="search" aria-label="Search trades" placeholder="Search trades…" value={value.search} onChange={event => onChange({ ...value, search: event.target.value })} className={field} /></label>
      <label className="min-w-0 text-xs font-semibold text-slate-500">Market<select aria-label="Market filter" value={value.market} onChange={event => onChange({ ...value, market: event.target.value, symbol: 'all' })} className={field}><option value="all">All markets</option>{TRADE_MARKETS.map(([market, label]) => <option key={market} value={market}>{label}</option>)}{records.some(record => tradeRecordMarket(record) === 'Unassigned') && <option value="Unassigned">Unassigned</option>}</select></label>
      <label className="min-w-0 text-xs font-semibold text-slate-500">Instrument <span className="font-normal">· optional</span><select aria-label="Instrument filter" value={value.symbol} onChange={event => onChange({ ...value, symbol: event.target.value })} className={field}><option value="all">All instruments</option>{value.symbol !== 'all' && !symbols.includes(value.symbol) && <option value={value.symbol}>{value.symbol} · no matches</option>}{symbols.map(symbol => <option key={symbol}>{symbol}</option>)}</select></label>
    </div>
    <div className="flex items-center justify-between gap-3 text-xs text-slate-500"><span role="status">{count} of {records.length} trades</span>{active && <button type="button" onClick={() => onChange({ ...EMPTY_TRADE_FILTER })} className="font-semibold text-[#5338ec]">Clear filters</button>}</div>
  </div>;
}
