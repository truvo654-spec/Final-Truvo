import React, { useMemo, useState } from 'react';
import { ChartCard } from './overview/OverviewCharts';
import type { DateRange } from './journalDay';
import { demoAccountBalanceSeries, SAMPLE_BALANCE_BROKERS, type BalanceBroker, type BalanceDemoScope } from './accountBalance';

const PURPLE = '#5338ec';
const RED = '#f45b69';
const W = 500, H = 220, L = 65, R = 15, T = 16, B = 35;

interface Props {
  brokers: BalanceBroker[];
  currency: string;
  range: DateRange | null;
}

export function JournalAccountBalance({ brokers, currency, range }: Props) {
  const connected = useMemo(() => [...new Map(brokers.filter(broker => broker.connected).map(broker => [broker.id, broker])).values()]
    .sort((a, b) => a.name.localeCompare(b.name)), [brokers]);
  const [scope, setScope] = useState<BalanceDemoScope>('connected');
  const available = scope === 'sample' ? SAMPLE_BALANCE_BROKERS : connected;
  const [selected, setSelected] = useState('all');
  const selectedBroker = available.some(broker => broker.id === selected) ? selected : 'all';
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [table, setTable] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showFunding, setShowFunding] = useState(true);
  const data = useMemo(() => demoAccountBalanceSeries(brokers, selectedBroker, currency, range, scope), [brokers, selectedBroker, currency, range, scope]);
  const points = data.points;
  const active = points.find(point => point.date === activeDate);
  const format = (value: number | null, compact = false) => value === null ? 'Unknown' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: compact ? 0 : 2, maximumFractionDigits: compact ? 0 : 2 }).format(value);
  const values = points.flatMap(point => [...(showBalance ? [point.balance] : []), ...(showFunding ? [point.funding] : [])]);
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values) === low ? low + 1 : Math.max(0, ...values);
  const span = high - low;
  const first = points.length ? Date.parse(points[0].date) : 0;
  const last = points.length ? Date.parse(points[points.length - 1].date) : 0;
  const x = (date: string) => L + (last === first ? (W - L - R) / 2 : (Date.parse(date) - first) / (last - first) * (W - L - R));
  const y = (value: number) => T + (high - value) / span * (H - T - B);
  const dateTicks = points.length ? last === first ? [points[0].date] : [
    points[0].date,
    new Date(first + (last - first) / 2).toISOString().slice(0, 10),
    points[points.length - 1].date,
  ].filter((date, index, dates) => dates.indexOf(date) === index) : [];
  const path = (field: 'balance' | 'funding') => points.map((point, index) => `${index ? 'L' : 'M'}${x(point.date)},${y(point[field])}`).join(' ');
  const definition = 'Generated demo balances and funding, not live broker balances or realized journal profit/loss. Balance equals the example starting balance plus simulated net results and deposits minus withdrawals. Funding is the net cumulative deposits minus withdrawals. Connected mode filters your connected broker names; Multi-broker demo uses four sample accounts without connecting them. All brokers sums each example account once. USD only; no currency conversion. Demo data stays separate from your journal and saved funding settings.';
  const emptyMessage = scope === 'connected' && !connected.length ? 'No connected brokers. Choose Multi-broker demo to explore sample accounts.'
    : data.unsupportedCurrency ? 'Demo account balances are available in USD only. No currency conversion is applied.'
    : 'No demo balance records in this date range.';

  return <section aria-label="Overview account balance">
    <ChartCard title="Account balance" definition={definition} action={<span className="shrink-0 rounded-md bg-[#F1EDFF] px-2 py-1 text-[10px] font-bold text-[#5338ec]">Demo</span>}>
      <div role="group" aria-label="Balance demo scope" className="mb-2 flex flex-wrap gap-1">
        {([['connected', 'Connected'], ['sample', 'Multi-broker demo']] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={scope === id} onClick={() => { setScope(id); setSelected('all'); setActiveDate(null); }} className={`rounded-lg border px-2 py-1 text-[10px] font-semibold ${scope === id ? 'border-[#CFC5FF] bg-[#F1EDFF] text-[#5338ec]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{label}</button>)}
      </div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="min-w-0 text-[11px] font-semibold text-slate-600">Broker
          <select aria-label="Balance chart broker" value={selectedBroker} onChange={event => { setSelected(event.target.value); setActiveDate(null); }} className="ml-2 max-w-44 appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-7">
            <option value="all">{scope === 'sample' ? 'All sample brokers' : 'All connected brokers'}</option>
            {available.map(broker => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
          </select>
        </label>
        <span aria-label="Combined demo account balance" className="text-sm font-bold font-mono text-slate-900">{format(data.closingBalance)}</span>
      </div>
      <p className="mb-2 text-[10px] text-slate-500">Generated USD examples · not live or journal P&amp;L{scope === 'sample' ? ' · connections unchanged' : ''}</p>
      {data.points.length > 0 && <p className="mb-2 text-[10px] text-slate-500">Demo through {points.at(-1)?.date} · {data.demoAccountCount} demo account{data.demoAccountCount === 1 ? '' : 's'}</p>}
      {!points.length ? <p role="status" className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-xs text-slate-500">{emptyMessage}</p> : <>
        <div role="group" aria-label="Account balance chart series" className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
          <button type="button" aria-label="Demo account balance series" aria-pressed={showBalance} onClick={() => setShowBalance(value => !value)} className={`inline-flex items-center gap-1 ${showBalance ? '' : 'opacity-40'}`}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: PURPLE }} />Demo balance</button>
          <button type="button" aria-label="Demo deposits and withdrawals series" aria-pressed={showFunding} onClick={() => setShowFunding(value => !value)} className={`inline-flex items-center gap-1 ${showFunding ? '' : 'opacity-40'}`}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: RED }} />Deposits / withdrawals</button>
        </div>
        <div className="relative">
          {!showBalance && !showFunding ? <p className="py-10 text-center text-sm text-slate-500">Select a chart series to show it.</p> : <svg role="group" aria-label="Demo account balance history" viewBox={`0 0 ${W} ${H}`} className="w-full h-40 overflow-visible select-none" onMouseLeave={() => setActiveDate(null)} onMouseMove={event => {
            const transform = event.currentTarget.getScreenCTM();
            if (!transform) return;
            const px = new DOMPoint(event.clientX, event.clientY).matrixTransform(transform.inverse()).x;
            const nearest = points.reduce((best, point) => Math.abs(x(point.date) - px) < Math.abs(x(best.date) - px) ? point : best, points[0]);
            setActiveDate(nearest.date);
          }}>
            {[0, .25, .5, .75, 1].map(fraction => <g key={fraction}><line x1={L} x2={W - R} y1={y(low + span * fraction)} y2={y(low + span * fraction)} stroke="#e2e8f0" strokeDasharray="3 4" /><text x={L - 8} y={y(low + span * fraction) + 4} textAnchor="end" fontSize="10" fill="#64748b">{format(low + span * fraction, true)}</text></g>)}
            {showBalance && <path d={path('balance')} fill="none" stroke={PURPLE} strokeWidth="2.5" strokeLinejoin="round" />}
            {showFunding && <path d={path('funding')} fill="none" stroke={RED} strokeWidth="2" strokeLinejoin="round" />}
            {active && <line x1={x(active.date)} x2={x(active.date)} y1={T} y2={H - B} stroke="#94a3b8" strokeDasharray="4 4" />}
            {points.map((point, index) => <circle key={point.date} cx={x(point.date)} cy={y(showBalance ? point.balance : point.funding)} r={activeDate === point.date ? 5 : points.length > 20 ? 2 : 3} fill={showBalance ? PURPLE : RED} tabIndex={0} role="button" aria-label={`${point.date}: demo account balance ${format(point.balance)}, net funding ${format(point.funding)}`} onFocus={() => setActiveDate(point.date)} onBlur={() => setActiveDate(null)} onClick={() => setActiveDate(point.date)} onKeyDown={event => {
              if (event.key === 'Escape') { event.stopPropagation(); setActiveDate(null); }
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveDate(point.date); }
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                const next = points[Math.max(0, Math.min(points.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)))];
                (event.currentTarget.closest('svg')?.querySelector(`[data-balance-date="${next.date}"]`) as SVGElement | null)?.focus();
              }
            }} data-balance-date={point.date} className="cursor-pointer focus:outline-none focus:stroke-slate-900 focus:stroke-2" />)}
            {dateTicks.map((date, index) => <text key={date} x={x(date)} y={H - 10} textAnchor={index === 0 ? 'start' : index === dateTicks.length - 1 ? 'end' : 'middle'} fontSize="10" fill="#64748b">{date.slice(5)}</text>)}
          </svg>}
          <div aria-live="polite">{active && <p className="pointer-events-none absolute left-0 top-0 z-10 max-w-full rounded-lg bg-[#0b1c30] p-2 text-[11px] text-white shadow-lg">{active.date} · demo balance {format(active.balance)} · net funding {format(active.funding)} · simulated net P&amp;L {format(active.net)}</p>}</div>
        </div>
        <p className="mt-1 text-[10px] text-slate-500">Hover or focus for demo values.</p>
      </>}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        {!!points.length && <button type="button" aria-label="Account balance data table" aria-expanded={table} onClick={() => setTable(value => !value)} className="text-[11px] font-semibold text-[#5338ec]">{table ? 'Hide' : 'Show'} data table</button>}
        <details className="text-[11px] text-slate-500">
          <summary className="cursor-pointer font-semibold text-[#5338ec]">Balance details</summary>
          <div className="mt-2 space-y-2">
            <p>{range ? `${range.from} to ${range.to}` : 'Full demo history'}. {scope === 'sample' ? 'Sample brokers are for comparison only; this does not connect them to your profile.' : 'Only connected brokers appear in this filter.'} Each broker contributes one generated demo account, not its actual linked balance.</p>
            {data.sourceFrom && data.sourceTo && <p>Demo coverage: {data.sourceFrom} to {data.sourceTo}. Dates outside this range are not projected.</p>}
            <p>Balances, deposits, withdrawals and net results are generated examples. They are independent of journal trades, saved funding settings and other journal filters, and do not represent your money.</p>
            <ul className="space-y-1">{data.accounts.map(account => <li key={account.broker.id}>{account.broker.name}: starting example balance {format(account.initialBalance)}</li>)}</ul>
          </div>
        </details>
      </div>
      {table && !!points.length && <div className="mt-2 space-y-3">
        <div className="max-h-56 overflow-auto"><table className="w-full text-xs"><caption className="sr-only">Demo account balance by date</caption><thead><tr><th className="p-2 text-left">Demo date (UTC)</th><th className="p-2 text-right">Combined demo balance</th><th className="p-2 text-right">Net funding</th></tr></thead><tbody>{points.map(point => <tr key={point.date} className="border-t border-slate-100"><td className="p-2">{point.date}</td><td className="p-2 text-right font-mono">{format(point.balance)}</td><td className="p-2 text-right font-mono">{format(point.funding)}</td></tr>)}</tbody></table></div>
        <div className="max-h-48 overflow-auto"><table className="w-full text-xs"><caption className="mb-2 text-left font-semibold">Demo deposits / withdrawals</caption><thead><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Broker</th><th className="p-2 text-left">Type</th><th className="p-2 text-right">Amount</th></tr></thead><tbody>{data.movements.map(movement => <tr key={movement.id} className="border-t border-slate-100"><td className="p-2">{movement.date}</td><td className="p-2">{movement.broker}</td><td className="p-2">{movement.kind === 'deposit' ? 'Deposit' : 'Withdrawal'}</td><td className="p-2 text-right font-mono">{format(movement.amount)}</td></tr>)}</tbody></table></div>
      </div>}
    </ChartCard>
  </section>;
}
