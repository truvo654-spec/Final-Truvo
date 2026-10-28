import React, { useState } from 'react';
import { addDays, addMonth } from '../journalOverview';
import { bucketLabel, cellTint, countLabel, dateLabel, insightButton, InsightsTooltip, type InsightsWidgetProps } from './InsightsShared';
import { formatInsightsMoney, mondayIndex, weekdayLabel } from './insightsData';

export function InsightsCalendar({ data, onDrill, today }: InsightsWidgetProps & { today: string }) {
  const [month, setMonth] = useState(data.filters.asOf.slice(0, 7)), [hover, setHover] = useState<string | null>(null);
  const first = `${month}-01`, start = addDays(first, -mondayIndex(first));
  const max = Math.max(0.01, ...data.days.map(day => Math.abs(day.net)));
  const caption = new Intl.DateTimeFormat(data.settings.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.parse(`${first}T12:00:00Z`));
  const active = hover ? data.byDay.get(hover) || data.weeks.get(hover) : undefined;
  const zero = { n: 0, net: 0, winRate: null };
  return <div className="min-w-0">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h4 className="text-sm font-semibold">{caption}</h4>
      <div className="flex items-center gap-1">
        <button className={insightButton} aria-label="Previous calendar month" disabled={month <= '0001-01'} onClick={() => { setMonth(addMonth(month, -1)); setHover(null); }}>‹</button>
        <button className={insightButton} onClick={() => { setMonth(today.slice(0, 7)); setHover(null); }}>Today</button>
        <button className={insightButton} aria-label="Next calendar month" disabled={month >= '9999-12'} onClick={() => { setMonth(addMonth(month, 1)); setHover(null); }}>›</button>
      </div>
    </header>
    <div className="grid min-w-0 grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,1.15fr)] gap-1 text-center text-[10px] text-slate-500 sm:text-xs">
      {Array.from({ length: 7 }, (_, index) => <span key={index} className="min-w-0 truncate py-2">{weekdayLabel(index, data.settings.locale)}</span>)}<span className="min-w-0 truncate py-2">Week</span>
      {Array.from({ length: 6 }, (_, week) => {
        const weekStart = addDays(start, week * 7), weekly = data.weeks.get(weekStart);
        return <React.Fragment key={weekStart}>
          {Array.from({ length: 7 }, (_, day) => {
            const date = addDays(weekStart, day), bucket = data.byDay.get(date);
            return <button key={date} type="button" aria-label={bucketLabel(date, bucket || zero, data.settings)} aria-current={date === today ? 'date' : undefined}
              className={`min-h-20 min-w-0 overflow-hidden rounded-lg border p-1 text-left focus-visible:outline-2 focus-visible:outline-[#5338ec] sm:p-2 ${date === today ? 'border-[#5338ec]' : 'border-transparent'} ${date.slice(0, 7) === month ? '' : 'opacity-50'}`}
              style={bucket ? cellTint(bucket.net, max) : { backgroundColor: 'var(--bg-subtle)' }}
              onMouseEnter={() => setHover(date)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(date)} onBlur={() => setHover(null)}
              onKeyDown={event => { if (event.key === 'Escape') setHover(null); }}
              onClick={() => onDrill(`Closed on ${dateLabel(date, data.settings.locale)}`, bucket?.trades || [])}>
              <span className="block text-xs font-semibold">{Number(date.slice(8)).toLocaleString(data.settings.locale)}</span>
              <span className="mt-2 block truncate text-[9px] font-semibold sm:text-xs">{bucket ? formatInsightsMoney(bucket.net, data.settings, true) : '—'}</span>
              <span className="mt-1 block truncate text-[9px] sm:text-[10px]">{bucket ? `${bucket.n} ${bucket.n === 1 ? 'trade' : 'trades'}` : '0 trades'}</span>
            </button>;
          })}
          <button type="button" className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1 text-[9px] sm:p-2 sm:text-xs"
            aria-label={bucketLabel(`Week starting ${weekStart}`, weekly || zero, data.settings)}
            onMouseEnter={() => setHover(`week:${weekStart}`)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(`week:${weekStart}`)} onBlur={() => setHover(null)}
            onClick={() => onDrill(`Week starting ${dateLabel(weekStart, data.settings.locale)}`, weekly?.trades || [])}>
            <span className="block truncate font-semibold">{formatInsightsMoney(weekly?.net || 0, data.settings, true)}</span>
            <span className="mt-2 block">{countLabel(weekly?.n || 0, data.settings.locale)}</span>
          </button>
        </React.Fragment>;
      })}
    </div>
    {hover && <InsightsTooltip label={hover.startsWith('week:') ? `Week of ${dateLabel(hover.slice(5), data.settings.locale)}` : dateLabel(hover, data.settings.locale)} bucket={hover.startsWith('week:') ? data.weeks.get(hover.slice(5)) || zero : active || zero} settings={data.settings}/>}
    <p className="mt-3 text-xs text-slate-500">Closing dates in {data.settings.timeZone}. Weekly totals cover the seven days shown, including adjacent-month cells. Only the selected period is counted.</p>
  </div>;
}
