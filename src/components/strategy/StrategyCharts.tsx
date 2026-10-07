import React, { useMemo, useRef, useState } from 'react';
import { Bar, Trade } from './engine/types';
import { axisDate, dateTime, monthName, num as fmtInt } from './format';
import { GridResult } from './engine/optimize';
import { MonteCarlo } from './engine/monteCarlo';

/** Chart colours come from CSS variables so dark mode can swap them (see index.css). */
const TXT = 'var(--st-text, #6b7686)';
const GRID = 'var(--st-grid, #e8ebf0)';
const UP = '#16a34a';
const DOWN = '#e11d48';
const BRAND = '#5338ec';

const niceTicks = (min: number, max: number, count = 4): number[] => {
  if (!isFinite(min) || !isFinite(max)) return [0];
  if (min === max) return [min];
  const span = max - min;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
};

const fmtAxis = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(Math.abs(v) >= 100000 ? 0 : 1)}k` : Math.abs(v) < 10 && v % 1 !== 0 ? v.toFixed(2) : v.toFixed(0));

/* ───────────── Line chart (equity, drawdown, compare) ───────────── */

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
  dashed?: boolean;
  width?: number;
  fill?: boolean;
}

export const LineChart: React.FC<{
  times: number[];
  series: LineSeries[];
  height?: number;
  yFormat?: (v: number) => string;
  zeroLine?: boolean;
  /** A horizontal reference line, e.g. starting capital. */
  baseline?: number;
  ariaLabel: string;
}> = ({ times, series, height = 260, yFormat = fmtAxis, zeroLine, baseline, ariaLabel }) => {
  const W = 760;
  const m = { l: 54, r: 12, t: 10, b: 24 };
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const n = times.length;

  const { paths, ys, y0, y1, xTicks } = useMemo(() => {
    const stride = Math.max(1, Math.ceil(n / 700));
    const idx: number[] = [];
    for (let i = 0; i < n; i += stride) idx.push(i);
    if (idx[idx.length - 1] !== n - 1) idx.push(n - 1);
    let lo = Infinity;
    let hi = -Infinity;
    series.forEach((s) => idx.forEach((i) => {
      const v = s.values[i];
      if (isFinite(v)) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }));
    if (baseline !== undefined) {
      lo = Math.min(lo, baseline);
      hi = Math.max(hi, baseline);
    }
    if (zeroLine) {
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
    }
    if (!isFinite(lo)) {
      lo = 0;
      hi = 1;
    }
    const pad = (hi - lo) * 0.06 || 1;
    lo -= pad;
    hi += pad;
    const X = (i: number) => m.l + (i / Math.max(1, n - 1)) * (W - m.l - m.r);
    const Y = (v: number) => m.t + (1 - (v - lo) / (hi - lo)) * (height - m.t - m.b);
    const paths = series.map((s) => {
      const d = idx.map((i, k) => `${k ? 'L' : 'M'}${X(i).toFixed(1)},${Y(s.values[i]).toFixed(1)}`).join('');
      const area = s.fill ? `${d}L${X(idx[idx.length - 1]).toFixed(1)},${Y(zeroLine ? 0 : lo).toFixed(1)}L${X(idx[0]).toFixed(1)},${Y(zeroLine ? 0 : lo).toFixed(1)}Z` : '';
      return { d, area };
    });
    const span = n ? (times[n - 1] - times[0]) / 86_400_000 : 1;
    const xTicks = Array.from({ length: 5 }, (_, k) => Math.round((k / 4) * (n - 1))).map((i) => ({ x: X(i), label: n ? axisDate(times[i], span) : '' }));
    return { paths, ys: niceTicks(lo, hi, 4).map((v) => ({ v, y: Y(v) })), y0: Y, y1: X, xTicks };
  }, [series, times, n, height, baseline, zeroLine]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || n < 2) return;
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - m.l) / (W - m.l - m.r)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${height}`} className="w-full h-auto select-none" role="img" aria-label={ariaLabel} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {ys.map((t) => (
          <g key={t.v}>
            <line x1={m.l} x2={W - m.r} y1={t.y} y2={t.y} stroke={GRID} strokeWidth="1" />
            <text x={m.l - 6} y={t.y + 3.5} textAnchor="end" fontSize="10" fill={TXT}>{yFormat(t.v)}</text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={height - 6} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'} fontSize="10" fill={TXT}>{t.label}</text>
        ))}
        {baseline !== undefined && <line x1={m.l} x2={W - m.r} y1={y0(baseline)} y2={y0(baseline)} stroke={TXT} strokeDasharray="3 4" strokeWidth="1" opacity="0.6" />}
        {zeroLine && <line x1={m.l} x2={W - m.r} y1={y0(0)} y2={y0(0)} stroke={TXT} strokeWidth="1" opacity="0.5" />}
        {series.map((s, k) => (
          <g key={s.name}>
            {s.fill && paths[k].area && <path d={paths[k].area} fill={s.color} opacity="0.16" />}
            <path d={paths[k].d} fill="none" stroke={s.color} strokeWidth={s.width ?? 1.8} strokeDasharray={s.dashed ? '5 4' : undefined} strokeLinejoin="round" />
          </g>
        ))}
        {hover !== null && (
          <g>
            <line x1={y1(hover)} x2={y1(hover)} y1={m.t} y2={height - m.b} stroke={TXT} strokeWidth="1" opacity="0.5" />
            {series.map((s) => isFinite(s.values[hover]) && <circle key={s.name} cx={y1(hover)} cy={y0(s.values[hover])} r="3.5" fill={s.color} stroke="#fff" strokeWidth="1.5" />)}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="absolute top-2 pointer-events-none bg-[#0b1c30] text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap z-10"
          style={{ left: `${Math.min(78, Math.max(2, (y1(hover) / W) * 100 + 1))}%` }}
        >
          <p className="font-semibold text-white/70 mb-0.5">{dateTime(times[hover])}</p>
          {series.map((s) => (
            <p key={s.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.name}: <b>{yFormat(s.values[hover])}</b>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────── Candles with trades (replay and trade detail) ───────────── */

export interface Overlay {
  name: string;
  color: string;
  values: number[];
}

export const PriceChart: React.FC<{
  bars: Bar[];
  from: number;
  to: number; // exclusive
  overlays: Overlay[];
  trades: Trade[];
  /** Bars after this index are not drawn as closed or open trades (replay). */
  upTo: number;
  oscillator?: { name: string; values: number[]; levels?: number[]; color: string };
  decimals: number;
  openTrade?: Trade | null;
  highlightTrade?: number | null;
}> = ({ bars, from, to, overlays, trades, upTo, oscillator, decimals, openTrade, highlightTrade }) => {
  const W = 760;
  const priceH = oscillator ? 250 : 320;
  const oscH = oscillator ? 78 : 0;
  const H = priceH + oscH + 22;
  const m = { l: 58, r: 12, t: 8 };
  const count = Math.max(1, to - from);
  const plotW = W - m.l - m.r;
  const step = plotW / count;
  const body = Math.max(1, Math.min(14, step * 0.62));

  const geom = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = from; i < to; i++) {
      lo = Math.min(lo, bars[i].l);
      hi = Math.max(hi, bars[i].h);
    }
    overlays.forEach((o) => {
      for (let i = from; i < to; i++) if (isFinite(o.values[i])) {
        lo = Math.min(lo, o.values[i]);
        hi = Math.max(hi, o.values[i]);
      }
    });
    if (openTrade) [openTrade.stopPrice, openTrade.targetPrice].forEach((v) => {
      if (v !== undefined) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    });
    const pad = (hi - lo) * 0.05 || 0.001;
    return { lo: lo - pad, hi: hi + pad };
  }, [bars, from, to, overlays, openTrade]);
  const X = (i: number) => m.l + (i - from + 0.5) * step;
  const Y = (v: number) => m.t + (1 - (v - geom.lo) / (geom.hi - geom.lo)) * (priceH - m.t - 4);
  const ticks = niceTicks(geom.lo, geom.hi, 5);

  let oLo = 0;
  let oHi = 100;
  if (oscillator) {
    oLo = Infinity;
    oHi = -Infinity;
    for (let i = from; i < to; i++) if (isFinite(oscillator.values[i])) {
      oLo = Math.min(oLo, oscillator.values[i]);
      oHi = Math.max(oHi, oscillator.values[i]);
    }
    (oscillator.levels ?? []).forEach((l) => {
      oLo = Math.min(oLo, l);
      oHi = Math.max(oHi, l);
    });
    if (!isFinite(oLo)) {
      oLo = 0;
      oHi = 100;
    }
    const pad = (oHi - oLo) * 0.08 || 1;
    oLo -= pad;
    oHi += pad;
  }
  const OY = (v: number) => priceH + 10 + (1 - (v - oLo) / (oHi - oLo)) * (oscH - 14);

  const visibleTrades = trades.filter((t) => t.entryIdx < to && t.exitIdx >= from && t.entryIdx <= upTo);
  const span = (bars[Math.max(from, to - 1)].t - bars[from].t) / 86_400_000;
  const labelIdx = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.min(to - 1, from + Math.round(f * (count - 1))));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label="Price chart with the strategy's trades">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={m.l} x2={W - m.r} y1={Y(v)} y2={Y(v)} stroke={GRID} />
          <text x={m.l - 6} y={Y(v) + 3.5} textAnchor="end" fontSize="10" fill={TXT}>{v.toFixed(decimals > 3 ? 4 : decimals)}</text>
        </g>
      ))}
      {Array.from({ length: count }, (_, k) => from + k).map((i) => {
        const b = bars[i];
        const future = i > upTo;
        const up = b.c >= b.o;
        const c = up ? UP : DOWN;
        return (
          <g key={i} opacity={future ? 0 : 1}>
            <line x1={X(i)} x2={X(i)} y1={Y(b.h)} y2={Y(b.l)} stroke={c} strokeWidth="1" />
            <rect x={X(i) - body / 2} y={Math.min(Y(b.o), Y(b.c))} width={body} height={Math.max(1, Math.abs(Y(b.o) - Y(b.c)))} fill={up ? c : c} opacity={up ? 0.85 : 1} />
          </g>
        );
      })}
      {overlays.map((o) => {
        let d = '';
        for (let i = from; i < to && i <= upTo; i++) if (isFinite(o.values[i])) d += `${d ? 'L' : 'M'}${X(i).toFixed(1)},${Y(o.values[i]).toFixed(1)}`;
        return d ? <path key={o.name} d={d} fill="none" stroke={o.color} strokeWidth="1.5" /> : null;
      })}
      {visibleTrades.map((t) => {
        const done = t.exitIdx <= upTo;
        const win = t.pnl > 0;
        const col = done ? (win ? UP : DOWN) : BRAND;
        const hl = highlightTrade === t.id;
        const x1 = X(t.entryIdx);
        const x2 = X(Math.min(t.exitIdx, to - 1));
        return (
          <g key={t.id}>
            {done && t.exitIdx < to && <line x1={x1} y1={Y(t.entryPrice)} x2={x2} y2={Y(t.exitPrice)} stroke={col} strokeWidth={hl ? 2.2 : 1.2} strokeDasharray="4 3" />}
            {t.entryIdx >= from && (
              <path d={t.dir === 1 ? `M${x1},${Y(t.entryPrice) + 1}l-5,9h10z` : `M${x1},${Y(t.entryPrice) - 1}l-5,-9h10z`} fill={t.dir === 1 ? UP : DOWN} stroke="#fff" strokeWidth="0.8" />
            )}
            {done && t.exitIdx >= from && t.exitIdx < to && <circle cx={x2} cy={Y(t.exitPrice)} r={hl ? 5 : 3.6} fill={col} stroke="#fff" strokeWidth="1.2" />}
          </g>
        );
      })}
      {openTrade && openTrade.entryIdx <= upTo && openTrade.exitIdx > upTo && (
        <g>
          {openTrade.stopPrice !== undefined && (
            <g>
              <line x1={m.l} x2={W - m.r} y1={Y(openTrade.stopPrice)} y2={Y(openTrade.stopPrice)} stroke={DOWN} strokeDasharray="5 4" opacity="0.8" />
              <text x={W - m.r - 2} y={Y(openTrade.stopPrice) - 3} textAnchor="end" fontSize="10" fill={DOWN}>stop</text>
            </g>
          )}
          {openTrade.targetPrice !== undefined && (
            <g>
              <line x1={m.l} x2={W - m.r} y1={Y(openTrade.targetPrice)} y2={Y(openTrade.targetPrice)} stroke={UP} strokeDasharray="5 4" opacity="0.8" />
              <text x={W - m.r - 2} y={Y(openTrade.targetPrice) - 3} textAnchor="end" fontSize="10" fill={UP}>target</text>
            </g>
          )}
        </g>
      )}
      {oscillator && (
        <g>
          <rect x={m.l} y={priceH + 8} width={plotW} height={oscH - 10} fill="none" stroke={GRID} />
          {(oscillator.levels ?? []).map((l) => (
            <g key={l}>
              <line x1={m.l} x2={W - m.r} y1={OY(l)} y2={OY(l)} stroke={TXT} strokeDasharray="3 4" opacity="0.5" />
              <text x={m.l - 6} y={OY(l) + 3.5} textAnchor="end" fontSize="9" fill={TXT}>{l}</text>
            </g>
          ))}
          {(() => {
            let d = '';
            for (let i = from; i < to && i <= upTo; i++) if (isFinite(oscillator.values[i])) d += `${d ? 'L' : 'M'}${X(i).toFixed(1)},${OY(oscillator.values[i]).toFixed(1)}`;
            return d ? <path d={d} fill="none" stroke={oscillator.color} strokeWidth="1.5" /> : null;
          })()}
          <text x={m.l + 4} y={priceH + 20} fontSize="10" fill={TXT}>{oscillator.name}</text>
        </g>
      )}
      {labelIdx.map((i, k) => (
        <text key={k} x={X(i)} y={H - 6} textAnchor={k === 0 ? 'start' : k === 4 ? 'end' : 'middle'} fontSize="10" fill={TXT}>{axisDate(bars[i].t, span)}</text>
      ))}
    </svg>
  );
};

/* ───────────── Monthly returns ───────────── */

export const MonthlyHeatmap: React.FC<{ monthly: { year: number; month: number; ret: number }[] }> = ({ monthly }) => {
  const years = Array.from(new Set(monthly.map((x) => x.year))).sort();
  const max = Math.max(3, ...monthly.map((x) => Math.abs(x.ret)));
  // Solid colours with dark text, so the tiles read the same in light and dark mode.
  const mix = (from: number[], to: number[], t: number) => `rgb(${from.map((f, i) => Math.round(f + (to[i] - f) * t)).join(',')})`;
  const cell = (r: number) => {
    const a = Math.min(1, Math.abs(r) / max);
    return r >= 0 ? mix([232, 247, 238], [74, 222, 128], a) : mix([253, 232, 236], [251, 113, 133], a);
  };
  const ink = () => '#0b1c30';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-separate border-spacing-1 min-w-[620px]">
        <thead>
          <tr>
            <th className="w-10" />
            {Array.from({ length: 12 }, (_, i) => <th key={i} className="font-semibold" style={{ color: TXT }}>{monthName(i)}</th>)}
            <th className="font-semibold" style={{ color: TXT }}>Year</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y) => {
            const row = monthly.filter((x) => x.year === y);
            const total = row.reduce((a, x) => a * (1 + x.ret / 100), 1) - 1;
            return (
              <tr key={y}>
                <td className="font-semibold pr-1" style={{ color: TXT }}>{y}</td>
                {Array.from({ length: 12 }, (_, mo) => {
                  const c = row.find((x) => x.month === mo);
                  return (
                    <td key={mo} className="text-center rounded-md py-1.5 font-mono" style={{ background: c ? cell(c.ret) : 'transparent', color: c ? ink() : 'transparent' }}>
                      {c ? `${c.ret > 0 ? '+' : ''}${c.ret.toFixed(1)}` : '·'}
                    </td>
                  );
                })}
                <td className="text-center rounded-md py-1.5 font-mono font-bold" style={{ background: cell(total * 100), color: ink() }}>{`${total > 0 ? '+' : ''}${(total * 100).toFixed(1)}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ───────────── Histogram ───────────── */

export const Histogram: React.FC<{ values: number[]; bins?: number; unit: string; ariaLabel: string }> = ({ values, bins = 14, unit, ariaLabel }) => {
  const W = 420;
  const H = 150;
  const m = { l: 8, r: 8, t: 8, b: 22 };
  if (values.length < 2) return <p className="text-xs" style={{ color: TXT }}>Not enough trades yet.</p>;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const w = (hi - lo) / bins || 1;
  const counts = new Array(bins).fill(0);
  values.forEach((v) => counts[Math.min(bins - 1, Math.floor((v - lo) / w))]++);
  const mx = Math.max(...counts);
  const bw = (W - m.l - m.r) / bins;
  const zeroX = lo < 0 && hi > 0 ? m.l + ((0 - lo) / (hi - lo)) * (W - m.l - m.r) : null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={ariaLabel}>
      {counts.map((c, i) => {
        const mid = lo + (i + 0.5) * w;
        const h = (c / mx) * (H - m.t - m.b);
        return <rect key={i} x={m.l + i * bw + 1} y={H - m.b - h} width={bw - 2} height={h} rx="2" fill={mid >= 0 ? UP : DOWN} opacity="0.8" />;
      })}
      {zeroX !== null && <line x1={zeroX} x2={zeroX} y1={m.t} y2={H - m.b} stroke={TXT} strokeDasharray="3 3" />}
      <text x={m.l} y={H - 6} fontSize="10" fill={TXT}>{lo.toFixed(1)}{unit}</text>
      <text x={W - m.r} y={H - 6} textAnchor="end" fontSize="10" fill={TXT}>{hi.toFixed(1)}{unit}</text>
    </svg>
  );
};

/* ───────────── Monte Carlo fan ───────────── */

export const FanChart: React.FC<{ mc: MonteCarlo; capital: number }> = ({ mc, capital }) => {
  const W = 760;
  const H = 260;
  const m = { l: 54, r: 12, t: 10, b: 24 };
  const n = mc.tradesPerRun;
  const lo = Math.min(...mc.bands.p5) * 0.97;
  const hi = Math.max(...mc.bands.p95) * 1.03;
  const X = (i: number) => m.l + (i / Math.max(1, n)) * (W - m.l - m.r);
  const Y = (v: number) => m.t + (1 - (v - lo) / (hi - lo)) * (H - m.t - m.b);
  const line = (a: number[]) => a.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  const band = (u: number[], l: number[]) => `${line(u)}${l.map((_, i) => `L${X(n - i).toFixed(1)},${Y(l[n - i]).toFixed(1)}`).join('')}Z`;
  const ticks = niceTicks(lo, hi, 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Range of possible equity paths from reshuffled trades">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={m.l} x2={W - m.r} y1={Y(v)} y2={Y(v)} stroke={GRID} />
          <text x={m.l - 6} y={Y(v) + 3.5} textAnchor="end" fontSize="10" fill={TXT}>{fmtAxis(v)}</text>
        </g>
      ))}
      <path d={band(mc.bands.p95, mc.bands.p5)} fill={BRAND} opacity="0.12" />
      <path d={band(mc.bands.p75, mc.bands.p25)} fill={BRAND} opacity="0.22" />
      <line x1={m.l} x2={W - m.r} y1={Y(capital)} y2={Y(capital)} stroke={TXT} strokeDasharray="3 4" opacity="0.6" />
      <path d={line(mc.bands.p50)} fill="none" stroke={BRAND} strokeWidth="2" />
      <text x={m.l} y={H - 6} fontSize="10" fill={TXT}>Trade 0</text>
      <text x={W - m.r} y={H - 6} textAnchor="end" fontSize="10" fill={TXT}>Trade {n}</text>
    </svg>
  );
};

/* ───────────── Optimisation grid ───────────── */

export const GridHeatmap: React.FC<{
  grid: GridResult;
  xLabel: string;
  yLabel: string;
  format: (v: number) => string;
  higherBetter: boolean;
  best: { x: number; y: number } | null;
  current?: { x: number; y: number } | null;
  onPick: (x: number, y: number) => void;
}> = ({ grid, xLabel, yLabel, format, higherBetter, best, current, onPick }) => {
  const vals = grid.cells.flat().filter((c) => c.trades > 0).map((c) => c.value);
  const lo = vals.length ? Math.min(...vals) : 0;
  const hi = vals.length ? Math.max(...vals) : 1;
  const colour = (v: number, trades: number) => {
    if (trades === 0) return 'rgba(148,163,184,0.18)';
    let t = hi === lo ? 0.5 : (v - lo) / (hi - lo);
    if (!higherBetter) t = 1 - t;
    return t >= 0.5 ? `rgba(22,163,74,${0.12 + (t - 0.5) * 1.3})` : `rgba(225,29,72,${0.12 + (0.5 - t) * 1.3})`;
  };
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <p className="text-[11px] font-semibold mb-1" style={{ color: TXT }}>↓ {yLabel}</p>
        <table className="border-separate border-spacing-1 text-[11px] w-full">
          <tbody>
            {grid.ys.map((y, yi) => (
              <tr key={y}>
                <td className="pr-2 text-right font-mono font-semibold whitespace-nowrap" style={{ color: TXT }}>{y}</td>
                {grid.xs.map((x, xi) => {
                  const c = grid.cells[yi][xi];
                  const isBest = best && best.x === xi && best.y === yi;
                  const isCur = current && current.x === xi && current.y === yi;
                  return (
                    <td key={x} className="p-0">
                      <button
                        type="button"
                        onClick={() => onPick(xi, yi)}
                        title={`${xLabel}: ${x}, ${yLabel}: ${y}\nValue ${c.trades ? format(c.value) : 'no trades'} · ${c.trades} trades · return ${c.returnPct.toFixed(1)}% · max drawdown ${c.maxDD.toFixed(1)}%`}
                        className={`w-full min-w-[44px] h-9 rounded-md font-mono text-[11px] text-[#0b1c30] transition-transform hover:scale-105 ${isBest ? 'ring-2 ring-[#5338ec]' : ''} ${isCur ? 'outline outline-2 outline-offset-1 outline-[#0b1c30]' : ''}`}
                        style={{ background: colour(c.value, c.trades) }}
                      >
                        {c.trades ? format(c.value) : '–'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td />
              {grid.xs.map((x) => <td key={x} className="text-center font-mono font-semibold pt-1" style={{ color: TXT }}>{x}</td>)}
            </tr>
          </tbody>
        </table>
        <p className="text-[11px] font-semibold text-right mt-0.5" style={{ color: TXT }}>{xLabel} →</p>
      </div>
    </div>
  );
};

export { fmtInt };
