// Lightweight SVG charts for the Backtesting screens: equity / drawdown lines, bar breakdowns and candles.
import React, { useMemo, useRef, useState } from 'react';
import type { Bar } from '../../backtest/types';

const GRID = '#E2E8F0';
const AXIS = '#64748b';
export const UP = '#059669';
export const DOWN = '#e11d48';
export const ACCENT = '#5338ec';

const niceTicks = (lo: number, hi: number, n = 4): number[] => {
  if (!(hi > lo)) return [lo];
  const raw = (hi - lo) / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
};

export interface LineSeries { name: string; color: string; dashed?: boolean; points: { x: number; y: number }[] }

export const LineChart: React.FC<{
  series: LineSeries[];
  height?: number;
  yFmt: (v: number) => string;
  xFmt: (v: number) => string;
  band?: { color: string; points: { x: number; lo: number; hi: number }[]; label: string };
  hLines?: { y: number; label: string; color: string }[];
  area?: boolean;
  label: string;
}> = ({ series, height = 220, yFmt, xFmt, band, hLines = [], area = true, label }) => {
  const W = 760, H = height, M = { t: 12, r: 14, b: 26, l: 64 };
  const all = series.flatMap((s) => s.points);
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const geo = useMemo(() => {
    const xs = all.map((p) => p.x).concat(band ? band.points.map((p) => p.x) : []);
    const ys = all.map((p) => p.y).concat(band ? band.points.flatMap((p) => [p.lo, p.hi]) : []).concat(hLines.map((h) => h.y));
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (y0 === y1) { y0 -= 1; y1 += 1; }
    const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
    const sx = (x: number) => M.l + ((x - x0) / Math.max(1e-9, x1 - x0)) * (W - M.l - M.r);
    const sy = (y: number) => M.t + (1 - (y - y0) / (y1 - y0)) * (H - M.t - M.b);
    return { x0, x1, y0, y1, sx, sy };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, band, hLines, H]);
  if (!all.length) return <p className="text-xs text-slate-500 py-8 text-center">Nothing to chart yet.</p>;
  const { x0, x1, y0, y1, sx, sy } = geo;
  const path = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');
  const main = series[0];
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const x = x0 + ((((e.clientX - r.left) / r.width) * W - M.l) / (W - M.l - M.r)) * (x1 - x0);
    let best = 0, bd = Infinity;
    main.points.forEach((p, i) => { const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = i; } });
    setHover(best);
  };
  const hp = hover !== null ? main.points[hover] : null;
  const nearest = (s: LineSeries, x: number) => s.points.reduce((a, p) => (Math.abs(p.x - x) < Math.abs(a.x - x) ? p : a), s.points[0]);
  const xt = niceTicks(x0, x1, 4).length > 1 ? [x0, x0 + (x1 - x0) / 3, x0 + (2 * (x1 - x0)) / 3, x1] : [x0];
  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label={label} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {niceTicks(y0, y1).map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke={GRID} strokeDasharray={t === 0 ? undefined : '3 4'} />
            <text x={M.l - 8} y={sy(t) + 3} textAnchor="end" fontSize="10" fill={AXIS} className="tabular-nums">{yFmt(t)}</text>
          </g>
        ))}
        {xt.map((t, i) => <text key={i} x={sx(t)} y={H - 8} textAnchor={i === 0 ? 'start' : i === xt.length - 1 ? 'end' : 'middle'} fontSize="10" fill={AXIS}>{xFmt(t)}</text>)}
        {band && band.points.length > 1 && (
          <path d={`${band.points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x)},${sy(p.hi)}`).join('')}${[...band.points].reverse().map((p) => `L${sx(p.x)},${sy(p.lo)}`).join('')}Z`} fill={band.color} opacity={0.14} />
        )}
        {hLines.map((h) => (
          <g key={h.label}>
            <line x1={M.l} x2={W - M.r} y1={sy(h.y)} y2={sy(h.y)} stroke={h.color} strokeDasharray="5 4" strokeWidth={1.2} />
            <text x={W - M.r - 4} y={sy(h.y) - 4} textAnchor="end" fontSize="10" fill={h.color} fontWeight={700}>{h.label}</text>
          </g>
        ))}
        {area && main.points.length > 1 && (
          <path d={`${path(main.points)}L${sx(main.points[main.points.length - 1].x)},${sy(Math.max(y0, Math.min(y1, main.points[0].y)))}L${sx(main.points[0].x)},${sy(Math.max(y0, Math.min(y1, main.points[0].y)))}Z`} fill={main.color} opacity={0.08} />
        )}
        {series.map((s) => (
          <g key={s.name}>
            <path d={path(s.points)} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? '6 4' : undefined} strokeLinejoin="round" />
            {s.points.length > 0 && <circle cx={sx(s.points[s.points.length - 1].x)} cy={sy(s.points[s.points.length - 1].y)} r={3.5} fill={s.color} />}
          </g>
        ))}
        {hp && <line x1={sx(hp.x)} x2={sx(hp.x)} y1={M.t} y2={H - M.b} stroke="#94a3b8" strokeDasharray="3 3" />}
        {hp && series.map((s) => { const p = nearest(s, hp.x); return <circle key={s.name} cx={sx(p.x)} cy={sy(p.y)} r={4} fill="#fff" stroke={s.color} strokeWidth={2} />; })}
      </svg>
      {hp && (
        <div role="status" className="pointer-events-none absolute top-2 z-10 bg-[#0b1c30] text-white rounded-lg px-3 py-2 text-[11px] shadow-lg whitespace-nowrap"
          style={{ left: `${(sx(hp.x) / W) * 100}%`, transform: sx(hp.x) / W > 0.6 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)' }}>
          <p className="font-semibold mb-0.5">{xFmt(hp.x)}</p>
          {series.map((s) => <p key={s.name} className="tabular-nums"><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: s.color }} />{s.name}: {yFmt(nearest(s, hp.x).y)}</p>)}
        </div>
      )}
      {(series.length > 1 || band) && (
        <div className="flex flex-wrap gap-4 mt-1 text-[11px] text-[#474556]">
          {series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2" style={{ borderColor: s.color, borderStyle: s.dashed ? 'dashed' : 'solid' }} />{s.name}</span>)}
          {band && <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-2.5 rounded-sm" style={{ background: band.color, opacity: 0.25 }} />{band.label}</span>}
        </div>
      )}
    </div>
  );
};

/** Drawdown under the equity curve: red area at 15% opacity. Values are fractions (0.05 = 5% below the peak). */
export const DrawdownChart: React.FC<{ points: { x: number; dd: number }[]; xFmt: (v: number) => string; label: string }> = ({ points, label }) => {
  const W = 760, H = 70, M = { t: 6, r: 14, b: 6, l: 64 };
  if (points.length < 2) return null;
  const x0 = points[0].x, x1 = points[points.length - 1].x;
  const max = Math.max(0.0001, ...points.map((p) => p.dd));
  const sx = (x: number) => M.l + ((x - x0) / Math.max(1e-9, x1 - x0)) * (W - M.l - M.r);
  const sy = (d: number) => M.t + (d / max) * (H - M.t - M.b);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.dd).toFixed(1)}`).join('');
  const worst = points.reduce((a, p) => (p.dd > a.dd ? p : a), points[0]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={label}>
      <line x1={M.l} x2={W - M.r} y1={M.t} y2={M.t} stroke={GRID} />
      <path d={`${line}L${sx(x1)},${M.t}L${sx(x0)},${M.t}Z`} fill={DOWN} opacity={0.15} />
      <path d={line} fill="none" stroke={DOWN} strokeWidth={1.4} />
      <text x={M.l - 8} y={M.t + 4} textAnchor="end" fontSize="10" fill={AXIS}>0%</text>
      <text x={M.l - 8} y={H - M.b} textAnchor="end" fontSize="10" fill={DOWN}>−{(max * 100).toFixed(1)}%</text>
      <circle cx={sx(worst.x)} cy={sy(worst.dd)} r={3} fill={DOWN} />
    </svg>
  );
};

export const BarBreakdown: React.FC<{ buckets: { label: string; value: number; n: number }[]; fmt: (v: number) => string; label: string }> = ({ buckets, fmt, label }) => {
  const W = 760, H = 200, M = { t: 14, r: 8, b: 34, l: 56 };
  const vals = buckets.map((b) => b.value);
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  const span = hi - lo || 1;
  const sy = (v: number) => M.t + (1 - (v - lo) / span) * (H - M.t - M.b);
  const bw = (W - M.l - M.r) / Math.max(1, buckets.length);
  const step = buckets.length > 12 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={label}>
      {niceTicks(lo, hi, 3).map((t) => (
        <g key={t}><line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke={GRID} strokeDasharray={t === 0 ? undefined : '3 4'} />
          <text x={M.l - 8} y={sy(t) + 3} textAnchor="end" fontSize="10" fill={AXIS}>{fmt(t)}</text></g>
      ))}
      {buckets.map((b, i) => {
        const x = M.l + i * bw + bw * 0.18, w = bw * 0.64;
        const y = Math.min(sy(b.value), sy(0)), h = Math.max(b.n ? 1.5 : 0, Math.abs(sy(b.value) - sy(0)));
        return (
          <g key={b.label}>
            <title>{`${b.label}: ${fmt(b.value)} from ${b.n} trade${b.n === 1 ? '' : 's'}`}</title>
            <rect x={x} y={y} width={w} height={h} rx={3} fill={b.value >= 0 ? UP : DOWN} opacity={b.n ? 1 : 0.2} />
            {i % step === 0 && <text x={x + w / 2} y={H - 18} textAnchor="middle" fontSize="10" fill={AXIS}>{b.label}</text>}
            {i % step === 0 && <text x={x + w / 2} y={H - 5} textAnchor="middle" fontSize="9" fill="#94a3b8">{b.n || ''}</text>}
          </g>
        );
      })}
    </svg>
  );
};

export interface PriceLine { price: number; color: string; label: string; dashed?: boolean }
export interface Marker { index: number; price: number; kind: 'buy' | 'sell' | 'exit' }

export const CandleChart: React.FC<{
  bars: Bar[];
  /** Show bars [from, to). */
  from: number;
  to: number;
  height?: number;
  dp: number;
  lines?: PriceLine[];
  markers?: Marker[];
  drawings?: number[];
  onPick?: (price: number) => void;
  label: string;
  hidePriceAxis?: boolean;
}> = ({ bars, from, to, height = 320, dp, lines = [], markers = [], drawings = [], onPick, label, hidePriceAxis }) => {
  const W = 760, H = height, M = { t: 10, r: hidePriceAxis ? 8 : 64, b: 10, l: 8 };
  const vis = bars.slice(Math.max(0, from), Math.max(from, to));
  const ref = useRef<SVGSVGElement>(null);
  if (!vis.length) return <div className="h-40 grid place-items-center text-xs text-slate-500">No bars to show.</div>;
  let lo = Math.min(...vis.map((b) => b.l)), hi = Math.max(...vis.map((b) => b.h));
  lines.forEach((l) => { if (Number.isFinite(l.price)) { lo = Math.min(lo, l.price); hi = Math.max(hi, l.price); } });
  const pad = (hi - lo) * 0.06 || hi * 0.001; lo -= pad; hi += pad;
  const sy = (p: number) => M.t + (1 - (p - lo) / (hi - lo)) * (H - M.t - M.b);
  const bw = (W - M.l - M.r) / vis.length;
  const sx = (i: number) => M.l + (i - from) * bw + bw / 2;
  const click = (e: React.MouseEvent) => {
    if (!onPick) return;
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const y = ((e.clientY - r.top) / r.height) * H;
    onPick(lo + (1 - (y - M.t) / (H - M.t - M.b)) * (hi - lo));
  };
  const last = vis[vis.length - 1];
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={`w-full h-auto select-none ${onPick ? 'cursor-crosshair' : ''}`} role="img" aria-label={label} onClick={click}>
      {!hidePriceAxis && niceTicks(lo, hi, 5).map((t) => (
        <g key={t}><line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke={GRID} strokeDasharray="3 4" />
          <text x={W - M.r + 6} y={sy(t) + 3} fontSize="10" fill={AXIS}>{t.toFixed(dp)}</text></g>
      ))}
      {vis.map((b, k) => {
        const i = from + k;
        const up = b.c >= b.o;
        const col = up ? UP : DOWN;
        const x = sx(i);
        return (
          <g key={b.t}>
            <line x1={x} x2={x} y1={sy(b.h)} y2={sy(b.l)} stroke={col} strokeWidth={1} />
            <rect x={x - Math.max(1, bw * 0.32)} y={sy(Math.max(b.o, b.c))} width={Math.max(2, bw * 0.64)} height={Math.max(1, Math.abs(sy(b.o) - sy(b.c)))} fill={up ? '#fff' : col} stroke={col} strokeWidth={1} />
          </g>
        );
      })}
      {drawings.map((p, k) => <line key={`d${k}`} x1={M.l} x2={W - M.r} y1={sy(p)} y2={sy(p)} stroke="#0ea5e9" strokeWidth={1.2} />)}
      {lines.filter((l) => Number.isFinite(l.price)).map((l) => (
        <g key={l.label}>
          <line x1={M.l} x2={W - M.r} y1={sy(l.price)} y2={sy(l.price)} stroke={l.color} strokeWidth={1.2} strokeDasharray={l.dashed ? '5 4' : undefined} />
          <rect x={W - M.r + 2} y={sy(l.price) - 8} width={M.r - 4} height={16} rx={3} fill={l.color} />
          <text x={W - M.r + 6} y={sy(l.price) + 3} fontSize="9" fill="#fff" fontWeight={700}>{l.label}</text>
        </g>
      ))}
      {markers.filter((m) => m.index >= from && m.index < to).map((m, k) => (
        <g key={`m${k}`}>
          <circle cx={sx(m.index)} cy={sy(m.price)} r={5} fill={m.kind === 'buy' ? UP : m.kind === 'sell' ? DOWN : '#0b1c30'} stroke="#fff" strokeWidth={1.5} />
          <text x={sx(m.index)} y={sy(m.price) + (m.kind === 'sell' ? -9 : 15)} textAnchor="middle" fontSize="9" fontWeight={700} fill={m.kind === 'buy' ? UP : m.kind === 'sell' ? DOWN : '#0b1c30'}>{m.kind === 'buy' ? 'BUY' : m.kind === 'sell' ? 'SELL' : 'EXIT'}</text>
        </g>
      ))}
      {!hidePriceAxis && (
        <g>
          <rect x={W - M.r + 2} y={sy(last.c) - 8} width={M.r - 4} height={16} rx={3} fill="#0b1c30" />
          <text x={W - M.r + 6} y={sy(last.c) + 3} fontSize="9" fill="#fff" fontWeight={700}>{last.c.toFixed(dp)}</text>
        </g>
      )}
    </svg>
  );
};
