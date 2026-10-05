import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PORTFOLIO_NOW, DAY } from '../../data/portfolioData';

function useWidth<T extends HTMLElement>(fallback = 700) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => setW(Math.max(240, Math.floor(el.getBoundingClientRect().width)));
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const compact = (n: number) =>
  Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n.toFixed(0)}`;

/* ───────────── Equity line / area chart ───────────── */

export interface ChartMarker {
  date: string;
  radius: number;
  win: boolean;
  label: string;
}

interface EquityChartProps {
  data: { date: string; value: number }[];
  compare?: number[];
  height?: number;
  theme?: 'dark' | 'light';
  markers?: ChartMarker[];
  targetLine?: { value: number; label: string };
}

export const EquityChart: React.FC<EquityChartProps> = ({ data, compare, height = 260, theme = 'light', markers, targetLine }) => {
  const [ref, width] = useWidth<HTMLDivElement>();
  const gid = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);
  const dark = theme === 'dark';

  const L = 54;
  const R = 14;
  const T = 14;
  const B = 26;
  const innerW = width - L - R;
  const innerH = height - T - B;

  const geo = useMemo(() => {
    const vals = data.map((d) => d.value);
    const all = [...vals, ...(compare || []), ...(targetLine ? [targetLine.value] : [])];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = (max - min || 1) * 0.12;
    const lo = min - pad;
    const hi = max + pad;
    const x = (i: number) => L + (data.length > 1 ? (i / (data.length - 1)) * innerW : 0);
    const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * innerH;
    const ticks = [0, 1, 2, 3].map((k) => lo + ((hi - lo) * k) / 3);
    return { x, y, ticks, lo, hi };
  }, [data, compare, targetLine, innerW, innerH]);

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${geo.x(i).toFixed(1)},${geo.y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${geo.x(data.length - 1).toFixed(1)},${T + innerH} L${L},${T + innerH} Z`;
  const cmpLine = compare
    ? compare.map((v, i) => `${i === 0 ? 'M' : 'L'}${geo.x(i).toFixed(1)},${geo.y(v).toFixed(1)}`).join(' ')
    : '';

  const stroke = dark ? '#CAEB0E' : '#5338ec';
  const grid = dark ? 'rgba(255,255,255,0.08)' : '#eef1f6';
  const txt = dark ? 'rgba(255,255,255,0.55)' : '#94a3b8';

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(data.length - 1, Math.max(0, Math.round(rel * (data.length - 1)))));
  };

  const xLabelIdx = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * (data.length - 1)));
  const hp = hover !== null ? data[hover] : null;
  const change = hp ? hp.value - data[0].value : 0;
  const tipLeft = hover !== null ? Math.min(width - 150, Math.max(4, geo.x(hover) - 70)) : 0;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      <svg width={width} height={height} className="block">
        <defs>
          <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={dark ? 0.32 : 0.2} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {geo.ticks.map((t, i) => (
          <g key={i}>
            <line x1={L} x2={width - R} y1={geo.y(t)} y2={geo.y(t)} stroke={grid} strokeDasharray="3 4" />
            <text x={L - 8} y={geo.y(t) + 4} textAnchor="end" fontSize="10.5" fill={txt} fontFamily="Geist Mono, monospace">
              {compact(t)}
            </text>
          </g>
        ))}
        {xLabelIdx.map((idx, i) => (
          <text key={i} x={geo.x(idx)} y={height - 6} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'} fontSize="10.5" fill={txt}>
            {fmtDate(data[idx].date)}
          </text>
        ))}
        <path d={area} fill={`url(#g-${gid})`} />
        {compare && <path d={cmpLine} fill="none" stroke={dark ? 'rgba(255,255,255,0.45)' : '#b9c0cf'} strokeWidth="1.5" strokeDasharray="4 4" />}
        <path d={line} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        {targetLine && (
          <g>
            <line x1={L} x2={width - R} y1={geo.y(targetLine.value)} y2={geo.y(targetLine.value)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x={width - R} y={geo.y(targetLine.value) - 5} textAnchor="end" fontSize="10.5" fontWeight="600" fill="#b45309">{targetLine.label}</text>
          </g>
        )}
        {markers?.map((m, i) => {
          const idx = data.findIndex((d) => d.date === m.date);
          if (idx < 0) return null;
          return (
            <circle key={i} cx={geo.x(idx)} cy={geo.y(data[idx].value)} r={m.radius} fill={m.win ? '#10b981' : '#f43f5e'} fillOpacity="0.85" stroke={dark ? '#0b1c30' : '#fff'} strokeWidth="1.5">
              <title>{m.label}</title>
            </circle>
          );
        })}
        {hp && hover !== null && (
          <g>
            <line x1={geo.x(hover)} x2={geo.x(hover)} y1={T} y2={T + innerH} stroke={dark ? 'rgba(255,255,255,0.25)' : '#cbd5e1'} />
            <circle cx={geo.x(hover)} cy={geo.y(hp.value)} r="5" fill={stroke} stroke={dark ? '#0b1c30' : '#fff'} strokeWidth="2" />
          </g>
        )}
        <rect x={L} y={T} width={innerW} height={innerH} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {hp && (
        <div
          className="absolute pointer-events-none bg-white text-[#0b1c30] rounded-xl shadow-xl border border-[#e2e8f0] px-3 py-2 text-xs"
          style={{ left: tipLeft, top: 4, width: 140 }}
        >
          <p className="text-[#94a3b8] font-medium">{fmtDate(hp.date)}</p>
          <p className="font-bold font-mono text-sm">${hp.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className={`font-mono font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {change >= 0 ? '+' : '-'}${Math.abs(change).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

/* ───────────── Drawdown (underwater) chart ───────────── */

export const DrawdownChart: React.FC<{ data: { date: string; dd: number }[]; limit?: number; height?: number }> = ({
  data,
  limit,
  height = 160,
}) => {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const L = 40;
  const R = 10;
  const T = 8;
  const B = 22;
  const iw = width - L - R;
  const ih = height - T - B;
  const minDd = Math.min(-1, ...data.map((d) => d.dd), limit ? -limit * 1.1 : -1);
  const y = (v: number) => T + (v / minDd) * ih;
  const x = (i: number) => L + (data.length > 1 ? (i / (data.length - 1)) * iw : 0);
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.dd).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)},${T} L${L},${T} Z`;
  const hp = hover !== null ? data[hover] : null;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg width={width} height={height} className="block">
        {[0, minDd / 2, minDd].map((v, i) => (
          <g key={i}>
            <line x1={L} x2={width - R} y1={y(v)} y2={y(v)} stroke="#eef1f6" strokeDasharray="3 4" />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Geist Mono, monospace">
              {v.toFixed(0)}%
            </text>
          </g>
        ))}
        {limit && (
          <g>
            <line x1={L} x2={width - R} y1={y(-limit)} y2={y(-limit)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={width - R} y={y(-limit) - 4} textAnchor="end" fontSize="10" fill="#b45309" fontWeight="600">
              Limit {limit}%
            </text>
          </g>
        )}
        <path d={area} fill="rgba(244,63,94,0.14)" />
        <path d={line} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinejoin="round" />
        {[0, 0.5, 1].map((f, i) => {
          const idx = Math.round(f * (data.length - 1));
          return (
            <text key={i} x={x(idx)} y={height - 5} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} fontSize="10" fill="#94a3b8">
              {fmtDate(data[idx].date)}
            </text>
          );
        })}
        {hp && hover !== null && <circle cx={x(hover)} cy={y(hp.dd)} r="4" fill="#f43f5e" stroke="#fff" strokeWidth="2" />}
        <rect
          x={L}
          y={T}
          width={iw}
          height={ih}
          fill="transparent"
          onMouseMove={(e) => {
            const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
            setHover(Math.min(data.length - 1, Math.max(0, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)))));
          }}
          onMouseLeave={() => setHover(null)}
        />
      </svg>
      {hp && (
        <div className="absolute top-0 right-2 bg-white border border-[#e2e8f0] rounded-lg px-2.5 py-1 text-[11px] shadow-md pointer-events-none">
          <span className="text-[#94a3b8]">{fmtDate(hp.date)} </span>
          <span className="font-bold font-mono text-rose-600">{hp.dd.toFixed(2)}%</span>
        </div>
      )}
    </div>
  );
};

/* ───────────── Donut ───────────── */

export interface DonutSeg {
  name: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{ segments: DonutSeg[]; centerTop: string; centerBottom: string; size?: number }> = ({
  segments,
  centerTop,
  centerBottom,
  size = 150,
}) => {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {segments.map((s) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.name}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${Math.max(0, len - 2)} ${c - Math.max(0, len - 2)}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-mono text-[#0b1c30] leading-none">{centerTop}</span>
          <span className="text-[10px] text-[#94a3b8] font-semibold mt-1">{centerBottom}</span>
        </div>
      </div>
      <div className="space-y-2 min-w-[130px] flex-1">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 font-semibold text-[#0b1c30]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
            <span className="font-mono text-[#474556]">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───────────── Semi-circle gauge ───────────── */

export const Gauge: React.FC<{ value: number; label: string; sub?: string; size?: number }> = ({ value, label, sub, size = 170 }) => {
  const v = Math.max(0, Math.min(100, value));
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = size / 2 - 14;
  const pt = (deg: number) => [cx + r * Math.cos((Math.PI * deg) / 180), cy - r * Math.sin((Math.PI * deg) / 180)] as const;
  const arc = (from: number, to: number) => {
    const [x1, y1] = pt(180 - from * 1.8);
    const [x2, y2] = pt(180 - to * 1.8);
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${to - from > 50 ? 1 : 0} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  };
  const color = v < 50 ? '#10b981' : v < 80 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 26 }}>
      <svg width={size} height={size / 2 + 18}>
        <path d={arc(0, 100)} fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
        {v > 0 && <path d={arc(0, v)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />}
      </svg>
      <div className="absolute left-0 right-0 text-center" style={{ top: size / 2 - 22 }}>
        <p className="text-2xl font-bold font-mono text-[#0b1c30] leading-none">{label}</p>
        {sub && <p className="text-[11px] font-semibold mt-1" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
};

/* ───────────── Daily P&L heatmap ───────────── */

export const PnlHeatmap: React.FC<{ daily: Record<string, number>; weeks?: number }> = ({ daily, weeks = 16 }) => {
  const today = new Date(PORTFOLIO_NOW);
  const dow = (today.getUTCDay() + 6) % 7; // Mon=0
  const start = PORTFOLIO_NOW - (weeks * 7 - 1 - (6 - dow)) * DAY;
  const cells: { iso: string; v: number | null; future: boolean }[][] = [];
  const max = Math.max(1, ...(Object.values(daily) as number[]).map((v) => Math.abs(v)));
  for (let w = 0; w < weeks; w++) {
    const col: { iso: string; v: number | null; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const ms = start + (w * 7 + d) * DAY;
      const iso = new Date(ms).toISOString().slice(0, 10);
      col.push({ iso, v: daily[iso] ?? null, future: ms > PORTFOLIO_NOW });
    }
    cells.push(col);
  }
  const color = (v: number | null, future: boolean) => {
    if (future) return 'transparent';
    if (v === null) return '#f1f5f9';
    const a = 0.25 + (Math.abs(v) / max) * 0.75;
    return v >= 0 ? `rgba(16,185,129,${a})` : `rgba(244,63,94,${a})`;
  };
  return (
    <div>
      <div className="flex gap-1.5">
        <div className="flex flex-col justify-between py-0.5 text-[10px] text-[#94a3b8] font-semibold pr-1">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>
        <div className="flex gap-1 flex-1">
          {cells.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-1 flex-1">
              {col.map((c) => (
                <div
                  key={c.iso}
                  title={c.v === null ? `${c.iso}: no closed trades` : `${c.iso}: ${c.v >= 0 ? '+' : '-'}$${Math.abs(c.v).toFixed(2)}`}
                  className="h-6 rounded-[4px] min-w-[10px]"
                  style={{ background: color(c.v, c.future) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-[#94a3b8] font-semibold">
        <span className="w-3 h-3 rounded-[3px] bg-rose-400" /> Loss
        <span className="w-3 h-3 rounded-[3px] bg-slate-100 ml-2" /> No trades
        <span className="w-3 h-3 rounded-[3px] bg-emerald-400 ml-2" /> Profit
      </div>
    </div>
  );
};

/* ───────────── Diverging bar list ───────────── */

export const BarList: React.FC<{ items: { name: string; value: number; right?: string; sub?: string }[]; format?: (n: number) => string }> = ({
  items,
  format = (n) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toFixed(0)}`,
}) => {
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.name}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-[#0b1c30]">
              {i.name} {i.sub && <span className="text-[#94a3b8] font-medium">· {i.sub}</span>}
            </span>
            <span className={`font-mono font-bold ${i.value >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{i.right ?? format(i.value)}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${i.value >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
              style={{ width: `${Math.max(4, (Math.abs(i.value) / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ───────────── Histogram ───────────── */

export const Histogram: React.FC<{ buckets: { label: string; win: number; loss: number }[] }> = ({ buckets }) => {
  const max = Math.max(1, ...buckets.map((b) => b.win + b.loss));
  return (
    <div className="flex items-end gap-2 h-32">
      {buckets.map((b) => (
        <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
          <div className="w-full flex flex-col-reverse rounded-t-md overflow-hidden" style={{ height: `${((b.win + b.loss) / max) * 100}%`, minHeight: b.win + b.loss ? 6 : 0 }}>
            <div className="bg-emerald-400" style={{ flex: b.win }} title={`${b.win} wins`} />
            <div className="bg-rose-400" style={{ flex: b.loss }} title={`${b.loss} losses`} />
          </div>
          <span className="text-[10px] text-[#94a3b8] font-semibold">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ───────────── Sparkline ───────────── */

export const Sparkline: React.FC<{ values: number[]; color?: string; className?: string }> = ({ values, color = '#5338ec', className = 'w-20 h-7' }) => {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 90 - 5}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};
