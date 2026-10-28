import React, { useState } from 'react';
import { bucketLabel, cellTint, InsightsTooltip, useInsightsChartWidth, type InsightsWidgetProps } from './InsightsShared';
import { formatInsightsMoney, hourLabel, weekdayLabel, type InsightBucket } from './insightsData';

function PerformanceBars({ data, onDrill, buckets, hourly }: InsightsWidgetProps & { buckets: InsightBucket[]; hourly?: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const { ref, width } = useInsightsChartWidth();
  const left = 64, right = 12, top = 20, bottom = 220, slot = (width - left - right) / buckets.length;
  const low = Math.min(0, ...buckets.map(bucket => bucket.net)), high = Math.max(0, ...buckets.map(bucket => bucket.net));
  const y = (net: number) => bottom - (net - low) / (high - low || 1) * (bottom - top);
  const label = (index: number) => hourly ? hourLabel(index, data.settings.locale) : weekdayLabel(index, data.settings.locale);
  const best = data.hourExtremes.best?.key, worst = data.hourExtremes.worst?.key;
  return <div ref={ref} className="min-w-0">
    <svg viewBox={`0 0 ${width} 275`} className="block h-[275px] w-full overflow-hidden" role="group" aria-label={hourly ? `Entry hour performance in ${data.settings.timeZone}` : 'Closing weekday performance'}>
      {[low, 0, high].filter((value, index, list) => list.indexOf(value) === index).map(tick => <g key={tick}>
        <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} stroke="var(--border-default)" strokeDasharray={tick ? '3 4' : undefined}/>
        <text x={left - 8} y={y(tick) + 4} textAnchor="end" fill="var(--text-secondary)" fontSize="11">{formatInsightsMoney(tick, data.settings, true)}</text>
      </g>)}
      {buckets.map((bucket, index) => {
        const valueY = y(bucket.net), zeroY = y(0), barHeight = Math.abs(valueY - zeroY), barX = left + index * slot;
        const selected = hourly && (bucket.key === best || bucket.key === worst) && bucket.n > 0;
        return <g key={bucket.key} role="button" tabIndex={0} aria-label={bucketLabel(label(index), bucket, data.settings)} className="cursor-pointer outline-none"
          onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(index)} onBlur={() => setActive(null)}
          onClick={() => onDrill(`${hourly ? 'Opened at' : 'Closed on'} ${label(index)}`, bucket.trades)}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onDrill(label(index), bucket.trades); } if (event.key === 'Escape') setActive(null); }}>
          <title>{bucketLabel(label(index), bucket, data.settings)}</title>
          <rect x={barX + 1} y={top - 5} width={slot - 2} height={bottom - top + 44} fill="transparent" stroke={active === index || selected ? 'var(--color-brand-primary)' : 'none'} rx="4"/>
          <rect x={barX + slot * 0.18} y={Math.min(valueY, zeroY)} width={slot * 0.64} height={barHeight || (bucket.n ? 2 : 0)} fill={bucket.net > 0 ? 'var(--insights-gain)' : bucket.net < 0 ? 'var(--insights-loss)' : 'var(--text-secondary)'} opacity={active === index ? 1 : 0.8} rx="2"/>
          {(!hourly || index % 3 === 0) && <text x={barX + slot / 2} y="241" fill="var(--text-secondary)" textAnchor="middle" fontSize="10">{hourly ? index.toLocaleString(data.settings.locale) : label(index)}</text>}
          {!hourly && <text x={barX + slot / 2} y="258" fill="var(--text-secondary)" textAnchor="middle" fontSize="10">{bucket.winRate === null ? '—' : `${bucket.winRate.toFixed(0)}% win`}</text>}
        </g>;
      })}
    </svg>
    {active !== null && <InsightsTooltip label={label(active)} bucket={buckets[active]} settings={data.settings}/>}
    <p className="mt-2 text-xs text-slate-500">{hourly ? `Entry hours (0–23) in ${data.settings.timeZone}. Hover or focus for exact P&L, trade count and win rate.` : 'Grouped by closing weekday. Hover or focus for exact values; select a bar to explore its trades.'}</p>
    {hourly && <div className="mt-3 flex flex-wrap gap-3 text-xs">
      {data.hourExtremes.best && <button className="text-[#5338ec] underline" onClick={() => onDrill('Best entry hour', data.hourExtremes.best!.trades)}>Best: {hourLabel(Number(best), data.settings.locale)} · {formatInsightsMoney(data.hourExtremes.best.net, data.settings)}</button>}
      {data.hourExtremes.worst && <button className="text-[#5338ec] underline" onClick={() => onDrill('Worst entry hour', data.hourExtremes.worst!.trades)}>Worst: {hourLabel(Number(worst), data.settings.locale)} · {formatInsightsMoney(data.hourExtremes.worst.net, data.settings)}</button>}
    </div>}
  </div>;
}
export const InsightsWeekdays = (props: InsightsWidgetProps) => <PerformanceBars {...props} buckets={props.data.weekdays}/>;
export const InsightsHours = (props: InsightsWidgetProps) => <PerformanceBars {...props} buckets={props.data.hours} hourly/>;
export function InsightsHeatmap({ data, onDrill }: InsightsWidgetProps) {
  const [active, setActive] = useState<InsightBucket | null>(null);
  const max = Math.max(0.01, ...data.heatmap.map(bucket => Math.abs(bucket.net)));
  const label = (bucket: InsightBucket) => { const [day, hour] = bucket.key.split('-').map(Number); return `${weekdayLabel(day, data.settings.locale, true)} at ${hourLabel(hour, data.settings.locale)}`; };
  return <>
    <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-lg pb-2" tabIndex={0} role="region" aria-label="Scrollable entry day and hour heatmap">
      <div className="grid min-w-[820px] grid-cols-[76px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-slate-500">
        <span/>{Array.from({ length: 24 }, (_, hour) => <span key={hour} className="py-2 text-center" title={hourLabel(hour, data.settings.locale)}>{hour.toLocaleString(data.settings.locale)}</span>)}
        {Array.from({ length: 7 }, (_, day) => <React.Fragment key={day}>
          <span className="self-center truncate pr-2">{weekdayLabel(day, data.settings.locale)}</span>
          {data.heatmap.slice(day * 24, day * 24 + 24).map(bucket => <button key={bucket.key} className="h-9 min-w-0 overflow-hidden rounded text-center text-[9px] focus-visible:outline-2 focus-visible:outline-[#5338ec]"
            style={cellTint(bucket.net, max)} aria-label={bucketLabel(label(bucket), bucket, data.settings)}
            onMouseEnter={() => setActive(bucket)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(bucket)} onBlur={() => setActive(null)}
            onKeyDown={event => { if (event.key === 'Escape') setActive(null); }} onClick={() => onDrill(`Opened ${label(bucket)}`, bucket.trades)}>
            {bucket.n ? new Intl.NumberFormat(data.settings.locale, { notation: 'compact', maximumFractionDigits: 0, signDisplay: 'exceptZero' }).format(bucket.net) : '·'}
          </button>)}
        </React.Fragment>)}
      </div>
    </div>
    {active && <InsightsTooltip label={label(active)} bucket={active} settings={data.settings}/>}
    <p className="mt-3 text-xs text-slate-500">Entry weekday × entry hour in {data.settings.timeZone}. Green = gains, red = losses; intensity scales with net P&L. Select a cell to see its trades.</p>
  </>;
}
