import React, { useEffect, useRef, useState } from 'react';
import { dateLabel, insightButton, InsightsTooltip, useInsightsChartWidth, type InsightsWidgetProps } from './InsightsShared';
import { formatInsightsMoney } from './insightsData';

export function InsightsCurve({ data, onDrill, compact = false }: InsightsWidgetProps) {
  const svg = useRef<SVGSVGElement>(null), drag = useRef<{ index: number; x: number } | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClick = () => { if (clickTimer.current) clearTimeout(clickTimer.current); clickTimer.current = null; };
  useEffect(() => () => cancelClick(), []);
  const [zoom, setZoom] = useState<[number, number] | null>(null), [active, setActive] = useState<number | null>(null), [dragTo, setDragTo] = useState<number | null>(null);
  const { ref: container, width } = useInsightsChartWidth();
  const points = data.curve.slice(zoom?.[0] ?? 0, (zoom?.[1] ?? data.curve.length - 1) + 1);
  const chartHeight = compact ? 260 : 310;
  const left = 72, right = 15, top = 16, bottom = compact ? 150 : 190, ddTop = compact ? 176 : 216, ddBottom = compact ? 228 : 278;
  const dateTicks = Math.max(2, Math.floor((width - left - right) / 120));
  const low = Math.min(0, ...points.map(point => point.cumulative)), high = Math.max(0, ...points.map(point => point.cumulative));
  const maxDD = Math.max(0.01, ...points.map(point => -point.drawdown));
  const firstTime = Date.parse(`${points[0]?.key}T00:00:00Z`), lastTime = Date.parse(`${points.at(-1)?.key}T00:00:00Z`);
  const x = (index: number) => points.length === 1 ? (left + width - right) / 2 : left + (Date.parse(`${points[index].key}T00:00:00Z`) - firstTime) / (lastTime - firstTime || 1) * (width - left - right);
  const y = (value: number) => bottom - (value - low) / (high - low || 1) * (bottom - top);
  const dy = (value: number) => ddTop + (-value / maxDD) * (ddBottom - ddTop);
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point.cumulative)}`).join(' ');
  const area = points.length ? `M${x(0)},${ddTop} ${points.map((point, index) => `L${x(index)},${dy(point.drawdown)}`).join(' ')} L${x(points.length - 1)},${ddTop} Z` : '';
  const pick = (clientX: number) => {
    const rect = svg.current?.getBoundingClientRect();
    if (!rect || !points.length) return 0;
    const px = (clientX - rect.left) / rect.width * width;
    let best = 0;
    points.forEach((_, index) => { if (Math.abs(x(index) - px) < Math.abs(x(best) - px)) best = index; });
    return best;
  };
  const reset = () => { cancelClick(); setZoom(null); setActive(null); setDragTo(null); drag.current = null; };
  const point = active === null ? null : points[active];
  return <div ref={container} className="min-w-0">
    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
      <span>Cumulative closed-trade P&L, not a balance including deposits.</span>
      {zoom && <button className={insightButton} onClick={reset}>Reset zoom</button>}
    </div>
    {!points.length ? <p className="py-10 text-center text-sm text-slate-500">No closed results in this period.</p> :
      <svg ref={svg} role="group" aria-label="Interactive cumulative P&L and drawdown" viewBox={`0 0 ${width} ${chartHeight}`} className={`block ${compact ? 'h-[260px]' : 'h-[310px]'} w-full select-none overflow-hidden`} style={{ touchAction: 'pan-y' }}
        onPointerMove={event => { const index = pick(event.clientX); setActive(index); if (drag.current) setDragTo(index); }}
        onPointerLeave={() => { if (!drag.current) setActive(null); }}
        onPointerDown={event => { if (event.button !== 0) return; cancelClick(); drag.current = { index: pick(event.clientX), x: event.clientX }; setDragTo(null); event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerCancel={() => { drag.current = null; setDragTo(null); }}
        onPointerUp={event => {
          const start = drag.current, end = pick(event.clientX); drag.current = null; setDragTo(null);
          if (!start) return;
          if (Math.abs(event.clientX - start.x) > 8 && start.index !== end) {
            const offset = zoom?.[0] ?? 0; setZoom([offset + Math.min(start.index, end), offset + Math.max(start.index, end)]); setActive(null);
          } else clickTimer.current = setTimeout(() => onDrill(`Closed on ${dateLabel(points[end].key, data.settings.locale)}`, points[end].trades), 400);
        }} onDoubleClick={reset}>
        {[low, 0, high].filter((value, index, list) => list.indexOf(value) === index).map(tick => <g key={tick}>
          <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} stroke="var(--border-default)" strokeDasharray="3 4"/>
          <text x={left - 7} y={y(tick) + 4} textAnchor="end" fill="var(--text-secondary)" fontSize="11">{formatInsightsMoney(tick, data.settings, true)}</text>
        </g>)}
        <path d={line} fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
        <line x1={left} x2={width - right} y1={ddTop} y2={ddTop} stroke="var(--border-default)"/>
        <path d={area} fill="var(--insights-loss)" fillOpacity="0.2"/>
        <text x={left} y={ddTop - 5} fontSize="10" fill="var(--text-secondary)">Realized drawdown</text>
        {points.map((p, index) => <g key={p.key}>
          <circle role="button" tabIndex={0} aria-label={`${dateLabel(p.key, data.settings.locale)}: cumulative ${formatInsightsMoney(p.cumulative, data.settings)}, day ${formatInsightsMoney(p.net, data.settings)}, drawdown ${formatInsightsMoney(p.drawdown, data.settings)}`}
            cx={x(index)} cy={y(p.cumulative)} r={active === index ? 5 : 3} fill="var(--color-brand-primary)" className="cursor-pointer outline-none"
            onFocus={() => setActive(index)} onBlur={() => setActive(null)} onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onDrill(`Closed on ${dateLabel(p.key, data.settings.locale)}`, p.trades); }
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault(); const next = Math.max(0, Math.min(points.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
                svg.current?.querySelectorAll<SVGCircleElement>('circle[role="button"]')[next]?.focus();
              }
              if (event.key === 'Escape') reset();
            }}/>
          {(index === 0 || index === points.length - 1 || (dateTicks > 2 && points.length > 6 && index % Math.ceil(points.length / dateTicks) === 0)) && <text x={x(index)} y={chartHeight - 10} fill="var(--text-secondary)" fontSize="10" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{dateLabel(p.key, data.settings.locale)}</text>}
        </g>)}
        {point && <line x1={x(active!)} x2={x(active!)} y1={top} y2={ddBottom} stroke="var(--text-secondary)" strokeDasharray="3 3" pointerEvents="none"/>}
        {drag.current && dragTo !== null && <rect x={Math.min(x(drag.current.index), x(dragTo))} width={Math.abs(x(dragTo) - x(drag.current.index))} y={top} height={ddBottom - top} fill="var(--color-brand-primary)" fillOpacity="0.12" pointerEvents="none"/>}
      </svg>}
    {point && <InsightsTooltip label={dateLabel(point.key, data.settings.locale)} bucket={point} settings={data.settings}>
      <p className="mt-1">Cumulative {formatInsightsMoney(point.cumulative, data.settings)} · Drawdown {formatInsightsMoney(point.drawdown, data.settings)}</p>
    </InsightsTooltip>}
    <p className="mt-3 text-xs text-slate-500">Hover for exact values. Drag across dates to zoom; double-click or press Escape to reset. Zoom changes this chart only. Select a point to explore that day's trades.</p>
  </div>;
}
