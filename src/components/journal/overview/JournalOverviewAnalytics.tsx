import { JournalHelp } from '../JournalHelp';
import React, { useMemo, useState } from 'react';
import type { JournalEntry } from '../../../types';
import { aggregateOverview, formatOverviewValue, type PnlBasis } from './overviewAnalytics';
import { statusOf } from '../journalMath';
import { ChartCard, CoverageRadar, RiskPortfolioComparisonChart, TimeSeriesChart, TradeScatter } from './OverviewCharts';

/** Additional views of the existing Overview cohort; no independent filters or storage. */
export function JournalOverviewAnalytics({ entries, currency, basis, onDay, onTrade }: {
  entries: JournalEntry[]; currency: string; basis: PnlBasis;
  onDay: (date: string) => void; onTrade: (id: string) => void;
}) {
  const data = useMemo(() => aggregateOverview(entries, basis), [entries, basis]);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [riskView, setRiskView] = useState<'history' | 'open'>('history');
  const format = (value: number | null, compact = false) => formatOverviewValue(value, currency, compact);
  const formatPercent = (value: number | null, compact = false) => value == null || !Number.isFinite(value) ? '—' : `${value.toFixed(compact ? 1 : 2)}%`;
  const label = basis === 'net' ? 'Net' : 'Gross';
  const openEntries = useMemo(() => entries.filter(entry => statusOf(entry) === 'open'), [entries]);
  const quantityUnits = useMemo(() => [...new Set(openEntries.map(entry => entry.quantityUnit || 'source units'))], [openEntries]);
  const sourceSize = quantityUnits.length === 1 ? openEntries.reduce((total, entry) => total + entry.size, 0) : null;
  const ratio = (value: number | null | undefined, equity: number | null | undefined) => Number.isFinite(value) && Number.isFinite(equity) && (equity || 0) > 0 ? value! / equity! * 100 : null;
  const riskTabs = <div role="tablist" aria-label="Risk and margin view" className="flex rounded-lg border border-slate-200 p-0.5">
    <button type="button" role="tab" aria-selected={riskView === 'history'} onClick={() => setRiskView('history')} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${riskView === 'history' ? 'bg-prime-20 text-prime-700' : 'text-slate-500'}`}>History</button>
    <button type="button" role="tab" aria-selected={riskView === 'open'} onClick={() => setRiskView('open')} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${riskView === 'open' ? 'bg-prime-20 text-prime-700' : 'text-slate-500'}`}>Open positions ({openEntries.length})</button>
  </div>;
  return <section aria-label="Overview trading analysis" className="pt-3 space-y-3">
    <p className="text-xs text-slate-500">Same Overview filters · {label.toLowerCase()} trading results in {currency} · cashback and points stay separate. Dates use the recorded UTC entry date.</p>
    <div className="grid grid-cols-1 min-[800px]:grid-cols-2 gap-4 items-start">
      <ChartCard title={`Daily ${basis} P&L`} definition={`Closed trades with known ${basis} results, grouped by recorded UTC entry date. Open and planned trades are excluded. Select a day to open the existing daily workspace.`}>
        <TimeSeriesChart title={`Daily ${basis} P&L`} days={data.daily} field="value" kind="bar" format={format} onDay={onDay} hoverDate={hoverDate} onHover={setHoverDate}/>
      </ChartCard>
      <ChartCard title={`${label} realized drawdown`} definition={`Daily cumulative ${basis} trading P&L below its previous peak, starting from zero at the beginning of this filtered view. The dashed line is separately reported open/unrealized P&L; it is not included in realized drawdown and is not inferred.`}>
        <TimeSeriesChart title={`${label} realized drawdown`} days={data.daily} field="drawdown" format={format} onDay={onDay} hoverDate={hoverDate} onHover={setHoverDate} overlay={{label:'Reported open / unrealized P&L',color:'#d97706',getValue:day=>day.unrealized}}/>
      </ChartCard>
      <ChartCard title="Trade entry time" definition={`Each dot shows one eligible closed trade's ${basis} result at its recorded UTC entry time. Missing times are excluded. Nearby dots can be pinned to choose the exact trade for review.`}>
        <TradeScatter entries={entries} basis={basis} kind="time" format={format} onTrade={onTrade}/>
      </ChartCard>
      <ChartCard title="Trade duration" definition={`Recorded entry-to-exit duration against ${basis} results. Buckets are under 15 minutes, 15–60 minutes, 1–4 hours, 4–24 hours, 1–7 days, and 7 days or more. Missing or reversed timestamps are excluded; partial-fill holding times are not invented.`}>
        <TradeScatter entries={entries} basis={basis} kind="duration" format={format} onTrade={onTrade}/>
      </ChartCard>
      <ChartCard title="Margin ratio, portfolio size & open P&L" definition="One comparative chart pairs margin used as a percentage of recorded equity with portfolio size in USD, or switches to open P&L ROI percentage with reported unrealized P&L in USD. The Open positions tab limits the comparison to open-position evidence. Live broker prices, margin level, leverage, liquidation thresholds and missing CFD notional are not estimated.">
        <div className="mb-3 flex justify-end">{riskTabs}</div>
        <RiskPortfolioComparisonChart days={data.daily} currency={currency} onDay={onDay} scope={riskView==='open'?'open':'all'}/>
        {riskView === 'open' ? <div aria-label="Open positions risk and margin snapshot">
          <p className="mb-3 text-[11px] leading-relaxed text-slate-500">Current recorded journal snapshot. It refreshes when journal entries change; live broker prices, margin level and liquidation data are not connected here.</p>
          {openEntries.length === 0 ? <p className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">No open positions in this view.</p> : <>
            <dl className="mb-3 grid grid-cols-2 gap-3 text-xs">
              <div><dt className="text-slate-500">Open risk / equity<JournalHelp label="Open risk / equity" /></dt><dd className="mt-1 font-mono font-semibold">{formatPercent(data.openPosition.riskRatio)}</dd></div>
              <div><dt className="text-slate-500">Margin used / equity<JournalHelp label="Margin used / equity" /></dt><dd className="mt-1 font-mono font-semibold">{formatPercent(data.openPosition.marginRatio)}</dd></div>
              <div><dt className="text-slate-500">Current portfolio equity (USD)<JournalHelp label="Current portfolio equity (USD)" /></dt><dd className="mt-1 font-mono font-semibold">{format(data.openPosition.equity)}</dd></div>
              <div><dt className="text-slate-500">Source size<JournalHelp label="Source size" /></dt><dd className="mt-1 font-mono font-semibold">{sourceSize == null ? 'Mixed / unknown' : `${sourceSize} ${quantityUnits[0]}`}</dd></div>
              <div><dt className="text-slate-500">Portfolio notional<JournalHelp label="Portfolio notional" /></dt><dd className="mt-1 font-mono font-semibold">Not recorded</dd></div>
            </dl>
            <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs">
                <caption className="sr-only">Open position risk and margin details</caption>
                <thead><tr className="border-b border-slate-100 text-left text-slate-500"><th className="p-2">Position<JournalHelp label="Position" /></th><th className="p-2 text-right">Risk %</th><th className="p-2 text-right">Margin %</th><th className="p-2 text-right">Open P&amp;L</th></tr></thead>
                <tbody>{openEntries.map(entry => <tr key={entry.id} className="border-b border-slate-100 last:border-0"><td className="p-2"><button className="text-left font-semibold text-prime-600 underline" onClick={() => onTrade(entry.id)}>{entry.symbol} · {entry.direction}<span className="block font-normal text-slate-500">{entry.size} {entry.quantityUnit || 'source units'}</span></button></td><td className="p-2 text-right font-mono">{formatPercent(ratio(entry.initialRisk, entry.equityAtEntry))}</td><td className="p-2 text-right font-mono">{formatPercent(ratio(entry.marginAtEntry, entry.equityAtEntry))}</td><td className="p-2 text-right font-mono">{entry.pnlKnown === false ? '—' : format(entry.pnl)}</td></tr>)}</tbody>
              </table>
            </div>
          </>}
        </div> : null}
      </ChartCard>
      <ChartCard title="Journal analysis" definition="Toggle between recorded profit and risk factors or strategy and discipline evidence. Click a radar corner for the metric's recorded value and calculation details. The radial values are analytical comparisons, not an automatic performance grade.">
        <CoverageRadar profitRisk={data.profitRisk} strategyDiscipline={data.strategyDiscipline}/>
      </ChartCard>
      <ChartCard title="Trading costs & daily context" definition="Gross, costs and net reconcile on the same closed-trade cohort with known costs, regardless of the display basis. Day win rate uses positive-result days divided by all days with eligible results, including flat days. Average win/loss uses the selected basis and the shared breakeven tolerance.">
        <dl className="space-y-3 text-sm">
          {([['Gross trading result', data.gross], ['Recorded costs', data.costs], ['Net trading result', data.net.n ? data.net.total : null]] as const).map(([name, value]) => <div key={name} className="flex justify-between gap-3 border-b border-slate-100 pb-3"><dt className="text-slate-600">{name}<JournalHelp label={name} /></dt><dd className="font-mono font-semibold tabular-nums">{format(value)}</dd></div>)}
        </dl>
        <p className="mt-3 text-xs text-slate-500">{data.net.n} closed trades with known costs / {entries.length} recorded. Missing costs are not treated as zero.</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
          <div><dt className="text-slate-500">{label} profitable days<JournalHelp label="Profitable days" /></dt><dd className="mt-1 font-semibold">{data.dayWinRate == null ? '—' : `${data.dayWinRate.toFixed(1)}%`} <span className="font-normal text-slate-500">({data.winningDays}/{data.days})</span></dd></div>
          <div><dt className="text-slate-500">Average win / loss<JournalHelp label="Average win / loss" /></dt><dd className="mt-1 font-semibold">{data.winLossRatio == null ? '—' : `${data.winLossRatio.toFixed(2)}×`}</dd></div>
          <div><dt className="text-slate-500">Average {basis} win<JournalHelp label="Average win / loss" /></dt><dd className="mt-1 font-mono">{format(data.avgWin)}</dd></div>
          <div><dt className="text-slate-500">Average {basis} loss<JournalHelp label="Average win / loss" /></dt><dd className="mt-1 font-mono">{format(data.avgLoss)}</dd></div>
        </dl>
      </ChartCard>
    </div>
  </section>;
}
