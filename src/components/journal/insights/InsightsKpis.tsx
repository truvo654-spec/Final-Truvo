import React, { useRef, useState } from 'react';
import { dateLabel, InsightsTooltip, resultStyle, type InsightsWidgetProps } from './InsightsShared';
import { formatInsightsMoney, type InsightStats, type InsightsData, type InsightTrade } from './insightsData';

const valueText = (value: number | null, suffix = '') => value === null ? '—' : value === Infinity ? '∞' : `${value.toFixed(2)}${suffix}`;
type TrendKey = 'net' | 'winRate' | 'profitFactor' | 'payoff' | 'total' | 'dayNet';
function KpiCard({ label, value, detail, metric, data, onDrill, trades, change, tone }: InsightsWidgetProps & {
  label: string; value: string; detail: string; metric: TrendKey; trades: InsightTrade[]; change: string; tone?: number;
}) {
  const [active, setActive] = useState<number | null>(null), svg = useRef<SVGSVGElement>(null);
  const stride = Math.max(1, Math.ceil(data.trends.length / 45));
  const points = data.trends.filter((_, index) => index % stride === 0 || index === data.trends.length - 1);
  const values = points.map(point => point[metric]).filter((n): n is number => n !== null && Number.isFinite(n));
  const lo = Math.min(0, ...values), hi = Math.max(0, ...values);
  const x = (index: number) => points.length === 1 ? 80 : 2 + index / (points.length - 1) * 156;
  const y = (value: number) => 31 - (value - lo) / (hi - lo || 1) * 28;
  let gap = true;
  const path = points.map((point, index) => {
    const value = point[metric];
    if (value === null || !Number.isFinite(value)) { gap = true; return ''; }
    const part = `${gap ? 'M' : 'L'}${x(index)},${y(value)}`; gap = false; return part;
  }).join(' ');
  const point = active === null ? null : points[active];
  const pick = (clientX: number) => {
    const rect = svg.current?.getBoundingClientRect();
    if (rect && points.length) setActive(Math.min(points.length - 1, Math.max(0, Math.round((clientX - rect.left) / rect.width * (points.length - 1)))));
  };
  const open = () => {
    if (point) onDrill(`${label} · ${metric === 'dayNet' ? 'closed on' : 'through'} ${dateLabel(point.date, data.settings.locale)}`,
      data.current.filter(trade => metric === 'dayNet' ? trade.closeDate === point.date : trade.closeDate <= point.date));
    else onDrill(label, trades);
  };
  const activeValue = point?.[metric] ?? null;
  const display = metric === 'net' || metric === 'dayNet' ? (activeValue === null ? '—' : formatInsightsMoney(activeValue, data.settings)) : metric === 'total' && activeValue !== null ? activeValue.toLocaleString(data.settings.locale) : valueText(activeValue, metric === 'winRate' ? '%' : metric === 'payoff' ? '×' : '');
  return <div className="min-w-0 rounded-xl border border-slate-200 p-3">
    <button className="w-full text-left focus-visible:outline-2 focus-visible:outline-[#5338ec]" aria-label={`Explore ${label}`} onClick={open} onMouseLeave={() => setActive(null)} onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setActive(index => Math.max(0, Math.min(points.length - 1, (index ?? 0) + (event.key === 'ArrowRight' ? 1 : -1)))); }
      if (event.key === 'Escape') setActive(null);
    }}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-bold" style={tone === undefined ? undefined : resultStyle(tone)}>{value}</p>
      <p className="mt-1 min-h-8 text-xs text-slate-500">{detail}</p>
      <svg ref={svg} aria-label={`${label} trend`} role="img" viewBox="0 0 160 36" className="mt-2 h-10 w-full" onPointerMove={event => pick(event.clientX)}>
        <title>{label} across the selected period. Hover for values; click to explore trades.</title>
        <path d="M2,33 L158,33" stroke="var(--border-default)" fill="none"/>
        {path && <path d={path} stroke="var(--color-brand-primary)" fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke"/>}
        {points.length === 1 && values.length > 0 && <circle cx="80" cy={y(values[0])} r="2" fill="var(--color-brand-primary)"/>}
        {point && activeValue !== null && Number.isFinite(activeValue) && <circle cx={x(active!)} cy={y(activeValue)} r="3" fill="var(--color-brand-primary)"/>}
      </svg>
      <p className="mt-1 text-xs text-slate-500">{change}</p>
    </button>
    {point && <InsightsTooltip label={`${metric === 'dayNet' ? 'On' : 'Through'} ${dateLabel(point.date, data.settings.locale)}`} settings={data.settings}><p>{label}: {display}</p></InsightsTooltip>}
  </div>;
}
export function InsightsKpis({ data, onDrill }: InsightsWidgetProps) {
  const now = data.summary, previous = data.previousSummary;
  const money = (n: number) => formatInsightsMoney(n, data.settings);
  const change = (field: keyof Pick<InsightStats, 'net' | 'winRate' | 'profitFactor' | 'payoff' | 'n'>) => {
    if (!previous.n) return 'No trades in previous period';
    const a = now[field], b = previous[field];
    if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b)) return 'Comparison not available';
    const diff = a - b;
    return `${field === 'net' ? money(diff) : `${diff > 0 ? '+' : ''}${diff.toFixed(field === 'n' ? 0 : 1)}${field === 'winRate' ? ' pp' : field === 'n' ? Math.abs(diff) === 1 ? ' trade' : ' trades' : '×'}`} vs previous period`;
  };
  const best = data.dayExtremes.best, worst = data.dayExtremes.worst;
  const extremes = [...new Map([...(best?.trades || []), ...(worst?.trades || [])].map(trade => [trade.entry.id, trade])).values()];
  const previousBest = data.previousDayExtremes.best, previousWorst = data.previousDayExtremes.worst;
  return <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
    <KpiCard data={data} onDrill={onDrill} label="Net P&L" value={money(now.net)} detail="After recorded costs" metric="net" trades={data.current} tone={now.net} change={change('net')}/>
    <KpiCard data={data} onDrill={onDrill} label="Win rate" value={now.winRate === null ? '—' : `${now.winRate.toFixed(1)}%`} detail={`${now.wins}W / ${now.losses}L · ${now.breakeven} breakeven`} metric="winRate" trades={data.current} change={change('winRate')}/>
    <KpiCard data={data} onDrill={onDrill} label="Profit factor" value={valueText(now.profitFactor)} detail={now.profitFactor === Infinity ? 'No losing trades' : 'Money won ÷ money lost'} metric="profitFactor" trades={data.current} change={change('profitFactor')}/>
    <KpiCard data={data} onDrill={onDrill} label="Avg win vs avg loss" value={valueText(now.payoff, '×')} detail={`${now.avgWin === null ? '—' : money(now.avgWin)} / ${now.avgLoss === null ? '—' : money(-now.avgLoss)} · win/loss R:R`} metric="payoff" trades={data.current} change={change('payoff')}/>
    <KpiCard data={data} onDrill={onDrill} label="Total trades" value={now.n.toLocaleString(data.settings.locale)} detail="Closed trades only" metric="total" trades={data.current} change={change('n')}/>
    <KpiCard data={data} onDrill={onDrill} label="Best / worst day" value={`${best ? money(best.net) : '—'} / ${worst ? money(worst.net) : '—'}`} detail={`${best ? dateLabel(best.key, data.settings.locale) : '—'} / ${worst ? dateLabel(worst.key, data.settings.locale) : '—'}`} metric="dayNet" trades={extremes} change={previousBest && previousWorst && best && worst ? `${money(best.net - previousBest.net)} / ${money(worst.net - previousWorst.net)} vs previous period` : 'No trades in previous period'}/>
  </div>;
}
