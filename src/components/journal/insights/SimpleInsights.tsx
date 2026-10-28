import React, { useEffect, useState } from 'react';
import type { JournalEntry } from '../../../types';
import type { JournalCardsController } from '../useJournalCards';
import { JournalCard } from '../JournalCards';
import { useInsightsData } from './useInsightsData';
import { INSIGHTS_RANGES, type InsightTrade, type InsightsSettings } from './insightsData';
import { dateLabel, insightButton, InsightTradeDrawer, type InsightsWidgetProps } from './InsightsShared';
import { InsightsKpis } from './InsightsKpis';
import { InsightsCalendar } from './InsightsCalendar';
import { InsightsCurve } from './InsightsCurve';
import { InsightsWeekdays, InsightsHours, InsightsHeatmap } from './InsightsDistributions';
import { InsightsPlaybookProgress, InsightsDisciplineProgress } from './InsightsProgress';
import { easyInsightsLayout } from './insightsLayout';

interface Props {
  entries: JournalEntry[]; settings: InsightsSettings; view: JournalCardsController; settingsWarnings: string[];
  checklistLength?: number;
  onTradeLog: () => void; onOpenProfile?: () => void;
  onOpenTrade: (entry: JournalEntry) => void; onOpenTrades: (entries: JournalEntry[], label: string) => void;
}
function InsightsCallouts({ data, onDrill, compact }: InsightsWidgetProps) {
  return data.callouts.length ? <div className={compact ? 'grid gap-2 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
    {data.callouts.map(callout => <button key={callout.id} className="block w-full rounded-lg bg-slate-50 p-3 text-left text-sm hover:underline" onClick={() => onDrill(callout.text, callout.trades)}>{callout.text} <span className="text-xs text-slate-500">({callout.trades.length} trades)</span></button>)}
  </div> : <p className="text-sm text-slate-500">Patterns appear when a comparable group has at least 5 closed trades. No conclusions are drawn from smaller samples.</p>;
}
export function SimpleInsights({ entries, settings, view, settingsWarnings, checklistLength = 0, onTradeLog, onOpenProfile, onOpenTrade, onOpenTrades }: Props) {
  const { data, today, errors, update } = useInsightsData(entries, settings, checklistLength);
  const [drill, setDrill] = useState<{ label: string; trades: InsightTrade[] } | null>(null);
  useEffect(() => setDrill(null), [data]);
  const open = (label: string, trades: InsightTrade[]) => setDrill({ label, trades });
  const compact = view.baseLevel === 'easy';
  const layout = compact ? easyInsightsLayout(view.cards.map(card => card.id)) : {};
  const widgetProps = { data, onDrill: open, compact };
  const change = (patch: Parameters<typeof update>[0]) => { setDrill(null); update(patch); };
  const filterKey = `${data.filters.range}:${data.filters.account}:${data.filters.side}:${data.filters.asOf}:${settings.timeZone}:${settings.currency}`;
  const profileLink = <a href="/account/profile?profileSection=journal" className="text-[#5338ec] underline" onClick={event => {
    if (onOpenProfile && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onOpenProfile(); }
  }}>Profile settings</a>;
  const render = (id: string) => {
    switch (id) {
      case 'insights-kpis': return <InsightsKpis {...widgetProps} sidebar={compact && !layout[id].includes('xl:col-span-12')}/>;
      case 'insights-playbooks': return <InsightsPlaybookProgress {...widgetProps}/>;
      case 'insights-discipline': return <InsightsDisciplineProgress {...widgetProps}/>;
      case 'insights-calendar': return <InsightsCalendar {...widgetProps} today={today}/>;
      case 'insights-curve': return <InsightsCurve {...widgetProps}/>;
      case 'insights-weekdays': return <InsightsWeekdays {...widgetProps}/>;
      case 'insights-hours': return <InsightsHours {...widgetProps}/>;
      case 'insights-heatmap': return <InsightsHeatmap {...widgetProps}/>;
      case 'insights-callouts': return <InsightsCallouts {...widgetProps}/>;
      default: return <p role="alert" className="text-sm text-rose-600">This widget is unavailable. Reset the Insights view to restore its cards.</p>;
    }
  };
  return <section aria-label="Simple Insights" className="min-w-0 space-y-5">
    <div role="group" aria-label="Insights filters" className="flex min-w-0 flex-wrap items-center gap-3">
      <div role="group" aria-label="Insights date range" className="flex flex-wrap gap-1">
        {INSIGHTS_RANGES.map(range => <button key={range} className={`${insightButton} ${data.filters.range === range ? 'border-[#5338ec] text-[#5338ec]' : 'text-slate-600'}`} aria-pressed={data.filters.range === range} onClick={() => change({ range, asOf: today })}>{range}</button>)}
      </div>
      {(data.accounts.length > 1 || data.filters.account !== 'all') && <label className="flex min-w-0 items-center gap-2 text-xs text-slate-500">Account
        <select aria-label="Insights account" value={data.filters.account} className="max-w-48 rounded-lg border border-slate-200 bg-white p-2 text-sm" onChange={event => change({ account: event.target.value })}>
          <option value="all">All accounts</option>{data.accounts.map(account => <option key={account}>{account}</option>)}
          {data.filters.account !== 'all' && !data.accounts.includes(data.filters.account) && <option value={data.filters.account}>Account not found: {data.filters.account}</option>}
        </select>
      </label>}
      <div role="group" aria-label="Insights side" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
        {(['all', 'long', 'short'] as const).map(side => <button key={side} aria-pressed={data.filters.side === side} className={`px-3 py-2 text-xs font-semibold capitalize ${data.filters.side === side ? 'bg-[#5338ec] text-white' : 'bg-white text-slate-500'}`} onClick={() => change({ side })}>{side}</button>)}
      </div>
    </div>
    <p className="text-xs leading-relaxed text-slate-500">{dateLabel(data.bounds.from, settings.locale)} – {dateLabel(data.bounds.to, settings.locale)} · {settings.currency} · {settings.timeZone}. Closing dates set the period; entry times set hour patterns. {profileLink}</p>
    {(errors.length > 0 || settingsWarnings.length > 0) && <p role="alert" className="text-sm text-rose-600">{[...errors, ...settingsWarnings].join(' ')}</p>}
    <details className="text-xs text-slate-500">
      <summary className="cursor-pointer">Data coverage · {data.summary.n} shown of {data.coverage.closed} closed trades</summary>
      <div className="mt-2 space-y-1">
        <p>All widgets use this same scope. Open trades are excluded. Results deduct recorded commissions and fees only; no exchange rates or account deposits are inferred.</p>
        <p>{data.coverage.otherCurrency} closed trades in other currencies, {data.coverage.missingExit} without a valid exit timestamp, {data.coverage.unknownResult} with unknown results and {data.coverage.invalidCosts} with invalid costs are excluded.</p>
        <p>{data.coverage.missingEntry} selected trades have missing or invalid entry times and cannot appear in entry-hour or heatmap views. {data.coverage.unknownCosts} have no recorded costs.</p>
        <p>KPI changes compare with the previous {data.bounds.days} calendar days: {dateLabel(data.bounds.previousFrom, settings.locale)} – {dateLabel(data.bounds.previousTo, settings.locale)}. Win rate includes breakeven trades.</p>
      </div>
    </details>
    {data.coverage.otherCurrency > 0 && <p role="status" className="text-xs text-slate-500">Reporting {settings.currency} only; {data.coverage.otherCurrency} closed trades use other currencies and are not combined. Choose a currency in {profileLink}.</p>}
    {(data.coverage.missingExit > 0 || data.coverage.unknownResult > 0 || data.coverage.invalidCosts > 0 || data.coverage.unknownCosts > 0 || data.coverage.missingEntry > 0) && <p role="status" className="text-xs text-slate-500">
      {data.coverage.missingExit > 0 && `${data.coverage.missingExit} closed trades have no valid exit timestamp and are excluded. `}
      {data.coverage.unknownResult > 0 && `${data.coverage.unknownResult} closed trades have unknown results and are excluded. `}
      {data.coverage.invalidCosts > 0 && `${data.coverage.invalidCosts} trades have invalid costs and are excluded. `}
      {data.coverage.unknownCosts > 0 && `${data.coverage.unknownCosts} selected trades have no recorded costs; results deduct recorded fees only. `}
      {data.coverage.missingEntry > 0 && `${data.coverage.missingEntry} selected trades have no valid entry time and are absent from hourly views.`}
    </p>}
    {!data.current.length ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <p className="text-sm text-slate-500">{data.coverage.closed === 0 ? 'Log your first trade to see insights' : 'No closed trades match this period, account, side and reporting currency.'}</p>
      <button className={insightButton+' mt-4'} onClick={onTradeLog}>Go to Trade Log</button>
    </div> : <div data-insights-layout={compact ? 'dashboard' : 'stacked'} className={compact ? 'grid min-w-0 grid-cols-12 items-start gap-4' : 'min-w-0 space-y-5'}>
      {view.cards.map(card => <JournalCard key={`${card.id}:${filterKey}`} card={card} view={view} detail={card.plainSummary} compact={compact} className={layout[card.id]}>{render(card.component)}</JournalCard>)}
    </div>}
    {drill && <InsightTradeDrawer label={drill.label} trades={drill.trades} settings={settings} onClose={() => setDrill(null)} onOpenTrade={onOpenTrade} onOpenTrades={onOpenTrades}/>}
  </section>;
}
