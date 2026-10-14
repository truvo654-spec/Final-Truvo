import React, { useMemo, useRef, useState } from 'react';
import { InstrumentIcon } from './InstrumentIcon';
import { ASSETS, Asset, FieldDropdown, fieldValue } from './InstrumentHeatmapView';
import SC_NOT_FOUND from '../../assets/community/ia-notfound.png';
import SC_ERROR from '../../assets/community/ia-error.png';

export type ScatterState = 'default' | 'notfound' | 'error';

interface InstrumentScatterViewProps {
  /** Lets the page preview the empty and failed states. */
  state?: ScatterState;
  onSelectInstrument?: (symbol: string) => void;
}

/** The fields the three pickers offer, as in the design. */
const AXIS_FIELDS = ['Change 1D(%)', 'Relative volume (x)', 'Market Cap ($B)', 'Last price'] as const;

const axisValue = (a: Asset, field: string): number => {
  if (field === 'Last price') return Math.max(0.5, a.marketCap / 2 + a.pe);
  return fieldValue(a, field);
};

/** Signals shown in the read-out, so the hover is useful rather than decorative. */
const SIGNALS = [
  { side: 'Sell', confidence: 79, level: 'L1', detail: 'Sell - Target / Entry / Stop 4,198', rr: 'R:R 1:1.8', tone: 'violet' },
  { side: 'Buy', confidence: 73, level: 'L1', detail: 'Buy - Target / Entry / Stop 4,522', rr: 'R:R 1:2.4', tone: 'lime' },
  { side: 'Sell', confidence: 72, level: 'L1', detail: 'Sell - Target / Entry / Stop 4,065', rr: 'R:R 1:2.1', tone: 'violet' },
] as const;

const PAD = { left: 56, right: 24, top: 18, bottom: 44 };
const W = 1000;
const H = 470;

export const InstrumentScatterView: React.FC<InstrumentScatterViewProps> = ({ onSelectInstrument, state = 'default' }) => {
  const [xField, setXField] = useState<string>('Change 1D(%)');
  const [yField, setYField] = useState<string>('Change 1D(%)');
  const [sizeField, setSizeField] = useState<string>('Market Cap ($B)');
  const [hover, setHover] = useState<{ a: Asset; px: number; py: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const points = useMemo(() => {
    const xs = ASSETS.map((a) => axisValue(a, xField));
    const ys = ASSETS.map((a) => axisValue(a, yField));
    const sizes = ASSETS.map((a) => axisValue(a, sizeField));
    const nice = (lo: number, hi: number) => {
      const span = Math.max(1e-6, hi - lo);
      const pad = span * 0.12;
      return [lo - pad, hi + pad] as const;
    };
    const [x0, x1] = nice(Math.min(...xs), Math.max(...xs));
    const [y0, y1] = nice(Math.min(...ys), Math.max(...ys));
    const s0 = Math.min(...sizes);
    const s1 = Math.max(...sizes);
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    return {
      x0, x1, y0, y1,
      items: ASSETS.map((a) => {
        const xv = axisValue(a, xField);
        const yv = axisValue(a, yField);
        const sv = axisValue(a, sizeField);
        return {
          a,
          px: PAD.left + ((xv - x0) / (x1 - x0)) * plotW,
          py: PAD.top + plotH - ((yv - y0) / (y1 - y0)) * plotH,
          r: 4 + ((sv - s0) / Math.max(1e-6, s1 - s0)) * 9,
          gain: a.change >= 0,
        };
      }),
    };
  }, [xField, yField, sizeField]);

  const ticks = (lo: number, hi: number) => {
    const out: number[] = [];
    for (let i = 0; i <= 4; i += 1) out.push(lo + ((hi - lo) / 4) * i);
    return out;
  };
  const fmt = (v: number, field: string) => (field.includes('%') ? `${v.toFixed(0)}%` : field.includes('$') ? `$${v.toFixed(0)}B` : v.toFixed(1));

  const header = (
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
      <div>
        <h2 className="select-none font-display text-base font-bold text-slate-900 sm:text-lg">Market Scatter</h2>
        <p className="mt-0.5 text-xs text-slate-500">Pick two metrics to compare, and a third to size the dots.</p>
        <div className="mt-2.5 flex items-center gap-4 text-xs font-medium text-slate-700">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#caeb0e]" />Gain</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#5945F1]" />Loss</span>
        </div>
      </div>
      <div className={`flex flex-wrap items-start gap-4 sm:gap-6 ${state !== 'default' ? 'pointer-events-none opacity-60' : ''}`}>
        <FieldDropdown label="X axis" value={xField} options={AXIS_FIELDS} onChange={setXField} />
        <FieldDropdown label="Y axis" value={yField} options={AXIS_FIELDS} onChange={setYField} />
        <FieldDropdown label="Point size:" value={sizeField} options={AXIS_FIELDS} onChange={setSizeField} />
      </div>
    </div>
  );

  if (state !== 'default') {
    return (
      <div className="w-full space-y-6 rounded-2xl border border-[#e0e7ff] bg-white p-5 shadow-xs sm:p-7">
        {header}
        <div className="flex min-h-[470px] flex-col items-center justify-center px-6 text-center">
          <img src={state === 'error' ? SC_ERROR : SC_NOT_FOUND} alt="" className={state === 'error' ? 'h-auto w-[270px]' : 'h-auto w-[200px]'} />
          <p className="mt-6 font-display text-[34px] font-bold text-[#c026d3]">
            {state === 'error' ? 'Well, that didn’t load' : 'Data not found'}
          </p>
          <p className="mt-2 max-w-[320px] text-sm text-slate-500">
            {state === 'error'
              ? 'It’s not you, it’s us. Try refreshing again in a bit.'
              : 'No instruments match these filters. Try loosening them up a bit.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 rounded-2xl border border-[#e0e7ff] bg-white p-5 shadow-xs sm:p-7">
      {header}

      <div className="border-t border-[#eef1f5] pt-5">
        <div ref={boardRef} className="relative w-full select-none" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Market scatter">
            {/* horizontal grid */}
            {ticks(points.y0, points.y1).map((t, i) => {
              const y = PAD.top + (H - PAD.top - PAD.bottom) * (1 - i / 4);
              return (
                <g key={`y${i}`}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#cbd5e1" strokeDasharray="6 6" strokeWidth="1" />
                  <text x={PAD.left - 12} y={y + 4} textAnchor="end" className="fill-slate-500" style={{ fontSize: 13 }}>{fmt(t, yField)}</text>
                </g>
              );
            })}
            {/* vertical ticks */}
            {ticks(points.x0, points.x1).map((t, i) => {
              const x = PAD.left + (W - PAD.left - PAD.right) * (i / 4);
              return (
                <text key={`x${i}`} x={x} y={H - PAD.bottom + 24} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 13 }}>
                  {fmt(t, xField)}
                </text>
              );
            })}
            <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#e2e8f0" strokeWidth="1" />

            {/* crosshair for whatever is hovered */}
            {hover && (
              <g>
                <line x1={hover.px} x2={hover.px} y1={PAD.top} y2={H - PAD.bottom} stroke="#5945F1" strokeDasharray="5 5" strokeWidth="1" />
                <line x1={PAD.left} x2={W - PAD.right} y1={hover.py} y2={hover.py} stroke="#5945F1" strokeDasharray="5 5" strokeWidth="1" />
              </g>
            )}

            {points.items.map(({ a, px, py, r, gain }) => (
              <circle
                key={a.symbol}
                cx={px}
                cy={py}
                r={r}
                fill={gain ? '#caeb0e' : '#5945F1'}
                stroke="#fff"
                strokeWidth="1.5"
                className="cursor-pointer transition-[r] hover:brightness-95"
                onMouseEnter={() => setHover({ a, px, py })}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectInstrument?.(a.symbol)}
              >
                <title>{`${a.name} ${a.change > 0 ? '+' : ''}${a.change}%`}</title>
              </circle>
            ))}
          </svg>

          {hover && (
            <div
              className="pointer-events-none absolute z-30 w-[290px] rounded-xl border border-[#e4e0fa] bg-white p-4 text-left shadow-2xl"
              style={{
                left: `min(${(hover.px / W) * 100}%, calc(100% - 300px))`,
                top: `min(${(hover.py / H) * 100}%, calc(100% - 330px))`,
              }}
              role="status"
            >
              <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                <InstrumentIcon iconType={hover.a.iconType} name={hover.a.name} className="h-5 w-5" />
                {hover.a.name}
                <span className="text-[13px] font-medium text-slate-500">{hover.a.symbol}</span>
              </p>
              <p className="mt-1 text-[13px] text-slate-700">Smart Contract Platforms - Layer 1</p>
              <p className="text-[13px] text-slate-500">Crypto Spot - Country unavailable</p>

              <p className="mt-3 border-l-2 border-[#5945F1] pl-2 text-[13px] font-semibold text-slate-900">Trading Signals</p>
              <ul className="mt-2 space-y-2">
                {SIGNALS.map((s) => (
                  <li key={s.detail} className={`rounded-lg p-2 ${s.tone === 'lime' ? 'bg-[#f4fbcd]' : 'bg-[#f1f0fe]'}`}>
                    <p className="flex items-center justify-between text-[13px] font-bold">
                      <span className={s.tone === 'lime' ? 'text-[#5f7a00]' : 'text-[#5945F1]'}>{s.side}</span>
                      <span className="text-slate-700">{s.confidence}% <span className="ml-1 text-slate-500">{s.level}</span></span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">{s.detail} &nbsp; {s.rr}</p>
                  </li>
                ))}
              </ul>

              <p className="mt-3 border-l-2 border-[#5945F1] pl-2 text-[13px] font-semibold text-slate-900">Asset information</p>
              <dl className="mt-1.5 space-y-1 text-[12.5px]">
                {[
                  ['Price', `${(hover.a.marketCap * 3).toFixed(0)}`],
                  ['Market Cap', `$${hover.a.marketCap}B`],
                  ['P/E Ratio', hover.a.pe ? `${hover.a.pe}x` : 'N/A'],
                  ['Change ID', `${hover.a.change > 0 ? '+' : ''}${hover.a.change.toFixed(2)}%`],
                  ['Performance 1M', `${hover.a.perf1M > 0 ? '+' : ''}${hover.a.perf1M.toFixed(2)}%`],
                  ['Relative Volume', `${(hover.a.volume / 500).toFixed(2)}x`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <p className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[13px] text-slate-500">
          <span>X: <span className="text-slate-700">{xField.replace('(%)', '[%]').replace('($B)', '[$B]')}</span></span>
          <span>Y: <span className="text-slate-700">{yField.replace('(%)', '[%]').replace('($B)', '[$B]')}</span></span>
          <span>Size: <span className="text-slate-700">{sizeField.replace('(%)', '[%]').replace('($B)', '[$B]')}</span></span>
        </p>
      </div>
    </div>
  );
};
