import React, { useMemo, useRef, useState } from 'react';
import { JournalEntry } from '../../types';
import { UNASSIGNED, shortDate } from './journalOverview';

export interface ChartBroker { id: string; name: string; color: string; n: number }

interface Props {
  entries: JournalEntry[]; // already limited to the selected range and filters
  valueOf: (e: JournalEntry) => number;
  title: string; // e.g. "gross P&L + cashback"
  rangeLabel: string;
  brokers: ChartBroker[]; // every broker with journal entries (the options)
  unit?: 'usd' | 'pts';
  off: string[]; // brokers currently unticked
}

interface Series { key: string; name: string; color: string; pts: { date: string; day: number; n: number; cum: number }[] }

const W = 640;
const H = 230;
const M = { top: 14, right: 16, bottom: 26, left: 52 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;
const LINE = '#5338ec'; // brand purple, single series
const usdFullBase = (n: number) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usdAxisBase = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n) >= 1000 ? `${(Math.abs(n) / 1000).toFixed(Math.abs(n) % 1000 === 0 ? 0 : 1)}k` : String(Number(Math.abs(n).toFixed(2)))}`;

function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) || raw;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

export const JournalCumulativeChart: React.FC<Props> = ({ entries, valueOf, title, rangeLabel, brokers, unit = 'usd', off }) => {
  const pts = unit === 'pts';
  const usdFull = (n: number) => (pts ? `${n < 0 ? '-' : n > 0 ? '+' : ''}${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })} pts` : usdFullBase(n));
  const usdAxis = (n: number) => (pts ? `${n < 0 ? '-' : ''}${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : usdAxisBase(n));
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const on = useMemo(() => brokers.filter((b) => !off.includes(b.id)), [brokers, off]);
  const bySeries = on.length > 1; // total line plus one line per ticked broker

  const { dates, series } = useMemo(() => {
    const dates = Array.from(new Set<string>(entries.map((e) => e.date))).sort();
    const defs: { key: string; name: string; color: string; match: (e: JournalEntry) => boolean }[] = bySeries
      ? [{ key: 'total', name: 'Total', color: LINE, match: () => true }, ...on.map((b) => ({ key: b.id, name: b.name, color: b.color, match: (e: JournalEntry) => (e.brokerId || UNASSIGNED) === b.id }))]
      : [{ key: 'all', name: on[0]?.name || 'Total', color: on[0]?.color || LINE, match: () => true }];
    const series: Series[] = defs.map((d) => {
      let cum = 0;
      const pts = dates.map((date) => {
        const es = entries.filter((e) => e.date === date && d.match(e));
        const day = es.reduce((a, e) => a + valueOf(e), 0);
        cum += day;
        return { date, day: Math.round(day * 100) / 100, n: es.length, cum: Math.round(cum * 100) / 100 };
      });
      return { key: d.key, name: d.name, color: d.color, pts };
    });
    return { dates, series };
  }, [entries, valueOf, bySeries, on]);

  const geo = useMemo(() => {
    if (!dates.length) return null;
    const ys = series.flatMap((s) => s.pts.map((p) => p.cum));
    const yMin = Math.min(0, ...ys);
    const yMax = Math.max(0, ...ys);
    const ticks = niceTicks(yMin, yMax);
    const lo = Math.min(ticks[0], yMin);
    const hi = Math.max(ticks[ticks.length - 1], yMax);
    const t0 = new Date(`${dates[0]}T00:00:00Z`).getTime();
    const t1 = new Date(`${dates[dates.length - 1]}T00:00:00Z`).getTime();
    const xs = dates.map((d) => (dates.length === 1 ? M.left + IW / 2 : t1 === t0 ? M.left : M.left + ((new Date(`${d}T00:00:00Z`).getTime() - t0) / (t1 - t0)) * IW));
    const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo || 1)) * IH;
    return { ticks, y, xs, zeroY: y(0) };
  }, [dates, series]);

  const main = series[0];
  const total = main && main.pts.length ? main.pts[main.pts.length - 1].cum : 0;
  const peak = main && main.pts.length ? Math.max(...main.pts.map((p) => p.cum)) : null;

  const pick = (clientX: number) => {
    const el = svgRef.current;
    if (!el || !geo) return;
    const r = el.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * W;
    let best = 0;
    geo.xs.forEach((x, i) => { if (Math.abs(x - px) < Math.abs(geo.xs[best] - px)) best = i; });
    setActive(best);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!dates.length) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); setActive((a) => Math.min(dates.length - 1, (a ?? -1) + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setActive((a) => Math.max(0, (a ?? dates.length) - 1)); }
    if (e.key === 'Escape') setActive(null);
  };

  const path = (s: Series) => (geo ? s.pts.map((p, i) => `${i ? 'L' : 'M'}${geo.xs[i].toFixed(1)},${geo.y(p.cum).toFixed(1)}`).join(' ') : '');
  const area = geo && dates.length > 1 && main
    ? `${path(main)} L${geo.xs[dates.length - 1].toFixed(1)},${geo.zeroY.toFixed(1)} L${geo.xs[0].toFixed(1)},${geo.zeroY.toFixed(1)} Z`
    : '';
  const ax = active !== null && geo ? geo.xs[active] : 0;
  const ay = active !== null && geo ? geo.y(series[0]?.pts[active]?.cum ?? 0) : 0;

  return (
    <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Cumulative P&L">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-bold">Cumulative {title}</h4>
          <p className="text-[11px] text-[#94a3b8]">{rangeLabel} · running total of daily results</p>
          {bySeries && <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#474556]"><span className="w-4 h-0.5 rounded" style={{ backgroundColor: LINE }} aria-hidden="true" />Total of ticked brokers</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {dates.length > 0 && (
            <div className="text-right">
              <p className={`text-lg font-bold font-mono leading-tight ${total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{usdFull(total)}</p>
              <p className="text-[10px] text-[#94a3b8]">{peak !== null ? `Peak ${usdFull(peak)}` : ''}</p>
            </div>
          )}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden" role="group" aria-label="Chart view">
            {([false, true] as const).map((t) => (
              <button key={String(t)} type="button" aria-pressed={table === t} onClick={() => setTable(t)}
                className={`px-2.5 py-1 text-[11px] font-semibold ${table === t ? 'bg-[#0b1c30] text-white' : 'bg-white text-[#474556]'}`}>{t ? 'Table' : 'Chart'}</button>
            ))}
          </div>
        </div>
      </div>

      {!geo || series.length === 0 || on.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-[#474556] border border-dashed border-slate-200 rounded-xl">
          {on.length === 0 && brokers.length > 0 ? 'No broker selected. Choose at least one broker in the Broker filter.' : 'No entries in this range. Pick a wider range or reset the filters.'}
        </div>
      ) : table ? (
        <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[#474556] sticky top-0">
              <tr>
                <th className="text-left px-3 py-1.5 font-semibold">Date</th>
                <th className="text-left px-3 py-1.5 font-semibold">Broker</th>
                <th className="text-right px-3 py-1.5 font-semibold">Entries</th>
                <th className="text-right px-3 py-1.5 font-semibold">Day</th>
                <th className="text-right px-3 py-1.5 font-semibold">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {dates.flatMap((d, i) =>
                series
                  .filter((s) => s.pts[i].n > 0)
                  .map((s) => ({ d, s, p: s.pts[i], total: bySeries && s.key === 'total' }))
              ).map(({ d, s, p, total: isTotal }) => (
                <tr key={`${d}-${s.key}`} className={`border-t border-slate-100 font-mono ${isTotal ? 'bg-slate-50 font-bold' : ''}`}>
                  <td className="px-3 py-1.5">{d}</td>
                  <td className="px-3 py-1.5 font-sans">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
                      {s.name}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right">{p.n}</td>
                  <td className={`px-3 py-1.5 text-right ${p.day >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{usdFull(p.day)}</td>
                  <td className="px-3 py-1.5 text-right font-bold">{usdFull(p.cum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto touch-none select-none"
            role="img"
            aria-label={`Cumulative ${title} from ${shortDate(dates[0])} to ${shortDate(dates[dates.length - 1], true)}${bySeries ? ' by broker' : `, ending at ${usdFull(total)}`}`}
            onMouseMove={(e) => pick(e.clientX)}
            onMouseLeave={() => setActive(null)}
            onTouchMove={(e) => pick(e.touches[0].clientX)}
          >
            {geo.ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={W - M.right} y1={geo.y(t)} y2={geo.y(t)} stroke="#e2e8f0" strokeWidth={t === 0 ? 1.25 : 1} strokeDasharray={t === 0 ? undefined : '3 4'} />
                <text x={M.left - 8} y={geo.y(t) + 3} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">{usdAxis(t)}</text>
              </g>
            ))}
            {area && <path d={area} fill={LINE} fillOpacity={0.08} />}
            {series.map((s) => (
              <g key={s.key}>
                <path d={path(s)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {s.pts.map((p, i) => (
                  <circle key={p.date} cx={geo.xs[i]} cy={geo.y(p.cum)} r={active === i ? 5 : dates.length > 40 || bySeries ? (active === null && i === dates.length - 1 ? 3 : 0) : 3} fill={s.color} stroke="#fff" strokeWidth={2} />
                ))}
              </g>
            ))}
            {[0, Math.floor((dates.length - 1) / 2), dates.length - 1]
              .filter((i, k, a) => a.indexOf(i) === k)
              .map((i) => (
                <text key={i} x={geo.xs[i]} y={H - 8} textAnchor={i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle'} fontSize="10" fill="#64748b">{shortDate(dates[i])}</text>
              ))}
            {active !== null && <line x1={ax} x2={ax} y1={M.top} y2={M.top + IH} stroke="#94a3b8" strokeWidth={1} />}
          </svg>
          <div tabIndex={0} role="application" aria-label="Chart data points, use left and right arrow keys" onKeyDown={onKey} onBlur={() => setActive(null)} className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5338ec]/40" style={{ pointerEvents: 'none' }} />
          {active !== null && (
            <div
              className="pointer-events-none absolute z-10 bg-[#0b1c30] text-white rounded-lg px-3 py-2 text-[11px] shadow-lg whitespace-nowrap"
              style={{
                left: `${(ax / W) * 100}%`,
                top: `${(ay / H) * 100}%`,
                transform: `translate(${ax > W * 0.6 ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
              }}
              role="status"
            >
              <p className="font-semibold">{shortDate(dates[active], true)}</p>
              {bySeries ? series.map((s) => (
                <p key={s.key} className="font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                  {s.name} {usdFull(s.pts[active].cum)}
                  <span className="text-slate-300">({usdFull(s.pts[active].day)} day)</span>
                </p>
              )) : (
                <>
                  <p className="font-mono">Cumulative {usdFull(main.pts[active].cum)}</p>
                  <p className="font-mono text-slate-300">Day {usdFull(main.pts[active].day)} · {main.pts[active].n} entr{main.pts[active].n === 1 ? 'y' : 'ies'}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
