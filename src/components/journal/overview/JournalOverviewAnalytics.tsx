import React, { useMemo, useState } from 'react';
import type { JournalEntry } from '../../../types';
import { aggregateOverview, formatOverviewValue, type PnlBasis } from './overviewAnalytics';
import { ChartCard, CoverageRadar, TimeSeriesChart, TradeScatter } from './OverviewCharts';

/** Additional views of the existing Overview cohort; no independent filters or storage. */
export function JournalOverviewAnalytics({ entries, currency, basis, onDay, onTrade }: {
  entries: JournalEntry[]; currency: string; basis: PnlBasis;
  onDay: (date: string) => void; onTrade: (id: string) => void;
}) {
  const data = useMemo(() => aggregateOverview(entries, basis), [entries, basis]);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const format = (value: number | null, compact = false) => formatOverviewValue(value, currency, compact);
  const label = basis === 'net' ? 'Net' : 'Gross';
  return <section aria-label="Overview trading analysis" className="pt-3 space-y-3">
    <p className="text-xs text-slate-500">Same Overview filters · {label.toLowerCase()} trading results in {currency} · cashback and points stay separate. Dates use the recorded UTC entry date.</p>
    <div className="grid grid-cols-1 min-[800px]:grid-cols-2 gap-4 items-start">
      <ChartCard title={`Daily ${basis} P&L`} definition={`Closed trades with known ${basis} results, grouped by recorded UTC entry date. Open and planned trades are excluded. Select a day to open the existing daily workspace.`}>
        <TimeSeriesChart title={`Daily ${basis} P&L`} days={data.daily} field="value" kind="bar" format={format} onDay={onDay} hoverDate={hoverDate} onHover={setHoverDate}/>
      </ChartCard>
      <ChartCard title={`${label} realized drawdown`} definition={`Daily cumulative ${basis} trading P&L below its previous peak, starting from zero at the beginning of this filtered view. A currency amount, not an account-equity percentage. Intraday drawdown is not inferred.`}>
        <TimeSeriesChart title={`${label} realized drawdown`} days={data.daily} field="drawdown" format={format} onDay={onDay} hoverDate={hoverDate} onHover={setHoverDate}/>
      </ChartCard>
      <ChartCard title="Trade entry time" definition={`Each dot shows one eligible closed trade's ${basis} result at its recorded UTC entry time. Missing times are excluded. Nearby dots can be pinned to choose the exact trade for review.`}>
        <TradeScatter entries={entries} basis={basis} kind="time" format={format} onTrade={onTrade}/>
      </ChartCard>
      <ChartCard title="Trade duration" definition={`Recorded entry-to-exit duration against ${basis} results. Buckets are under 15 minutes, 15–60 minutes, 1–4 hours, 4–24 hours, 1–7 days, and 7 days or more. Missing or reversed timestamps are excluded; partial-fill holding times are not invented.`}>
        <TradeScatter entries={entries} basis={basis} kind="duration" format={format} onTrade={onTrade}/>
      </ChartCard>
      <ChartCard title="Journal information coverage" definition="The percentage of all recorded trades in this scope with each type of evidence. A plan answer can be yes or no; both count as answered. This is completeness information, not another discipline or performance score.">
        <CoverageRadar axes={data.coverage}/>
      </ChartCard>
      <ChartCard title="Trading costs & daily context" definition="Gross, costs and net reconcile on the same closed-trade cohort with known costs, regardless of the display basis. Day win rate uses positive-result days divided by all days with eligible results, including flat days. Average win/loss uses the selected basis and the shared breakeven tolerance.">
        <dl className="space-y-3 text-sm">
          {([['Gross trading result', data.gross], ['Recorded costs', data.costs], ['Net trading result', data.net.n ? data.net.total : null]] as const).map(([name, value]) => <div key={name} className="flex justify-between gap-3 border-b border-slate-100 pb-3"><dt className="text-slate-600">{name}</dt><dd className="font-mono font-semibold tabular-nums">{format(value)}</dd></div>)}
        </dl>
        <p className="mt-3 text-xs text-slate-500">{data.net.n} closed trades with known costs / {entries.length} recorded. Missing costs are not treated as zero.</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
          <div><dt className="text-slate-500">{label} profitable days</dt><dd className="mt-1 font-semibold">{data.dayWinRate == null ? '—' : `${data.dayWinRate.toFixed(1)}%`} <span className="font-normal text-slate-500">({data.winningDays}/{data.days})</span></dd></div>
          <div><dt className="text-slate-500">Average win / loss</dt><dd className="mt-1 font-semibold">{data.winLossRatio == null ? '—' : `${data.winLossRatio.toFixed(2)}×`}</dd></div>
          <div><dt className="text-slate-500">Average {basis} win</dt><dd className="mt-1 font-mono">{format(data.avgWin)}</dd></div>
          <div><dt className="text-slate-500">Average {basis} loss</dt><dd className="mt-1 font-mono">{format(data.avgLoss)}</dd></div>
        </dl>
      </ChartCard>
    </div>
  </section>;
}
