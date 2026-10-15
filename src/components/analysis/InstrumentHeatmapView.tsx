import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { InstrumentIcon } from './InstrumentIcon';
import HM_NOT_FOUND from '../../assets/community/ia-notfound.png';
import HM_ERROR from '../../assets/community/ia-error.png';

export type HeatmapState = 'default' | 'notfound' | 'error';

interface InstrumentHeatmapViewProps {
  /** Lets the page preview the empty and failed states. */
  state?: HeatmapState;
  onSelectInstrument?: (symbol: string) => void;
}

export interface Asset {
  name: string;
  symbol: string;
  iconType: string;
  /** Percentage change over a day, which drives the colour. */
  change: number;
  /** Relative volume in $B, which drives the tile size by default. */
  volume: number;
  marketCap: number;
  perf1M: number;
  pe: number;
}

export const ASSETS: Asset[] = [
  { name: 'Bitcoin', symbol: 'BTC/USD', iconType: 'btc', change: 2.34, volume: 1540, marketCap: 1540, perf1M: 21.77, pe: 38 },
  { name: 'Binance', symbol: 'BNB/USD', iconType: 'bnb', change: 1.87, volume: 950, marketCap: 95, perf1M: 18.72, pe: 24 },
  { name: 'Tether', symbol: 'USDT/USD', iconType: 'usdt', change: 3.42, volume: 760, marketCap: 140, perf1M: 0.1, pe: 11 },
  { name: 'Bitcoin Cash', symbol: 'BCH/USD', iconType: 'btc', change: 1.12, volume: 445, marketCap: 44, perf1M: 9.4, pe: 17 },
  { name: 'Litecoin', symbol: 'LTC/USD', iconType: 'ltc', change: 0.33, volume: 408, marketCap: 40, perf1M: 19.03, pe: 21 },
  { name: 'Near', symbol: 'NEAR/USD', iconType: 'near', change: 4.15, volume: 390, marketCap: 18, perf1M: 32.9, pe: 29 },
  { name: 'Tether Gold', symbol: 'XAUT/USD', iconType: 'tether', change: -0.47, volume: 365, marketCap: 26, perf1M: 4.1, pe: 15 },
  { name: 'Celo', symbol: 'CELO/USD', iconType: 'crv', change: -3.78, volume: 374, marketCap: 37, perf1M: -8.6, pe: 9 },
  { name: 'Monero', symbol: 'XMR/USD', iconType: 'xmr', change: -2.09, volume: 318, marketCap: 31, perf1M: 18.09, pe: 26 },
  { name: 'Ethereum', symbol: 'ETH/USD', iconType: 'eth', change: -0.29, volume: 302, marketCap: 302, perf1M: 33.78, pe: 42 },
  { name: 'XRP', symbol: 'XRP/USD', iconType: 'xrp', change: 1.67, volume: 288, marketCap: 88, perf1M: 35.29, pe: 19 },
  { name: 'Dai', symbol: 'DAI/USD', iconType: 'crv', change: 2.81, volume: 257, marketCap: 45, perf1M: 0.3, pe: 10 },
  { name: 'Cardano', symbol: 'ADA/USD', iconType: 'ada', change: 1.95, volume: 241, marketCap: 24, perf1M: 12.6, pe: 16 },
  { name: 'Dogecoin', symbol: 'DOGE/USD', iconType: 'doge', change: -5.12, volume: 214, marketCap: 14, perf1M: -6.21, pe: 7 },
  { name: 'Polkadot', symbol: 'DOT/USD', iconType: 'dot', change: -0.78, volume: 204, marketCap: 17, perf1M: 18.42, pe: 13 },
  { name: 'Chainlink', symbol: 'LINK/USD', iconType: 'link', change: -0.63, volume: 178, marketCap: 27, perf1M: 7.9, pe: 23 },
  { name: 'Hedera', symbol: 'HBAR/USD', iconType: 'hbar', change: 4.56, volume: 159, marketCap: 5.9, perf1M: 30.68, pe: 20 },
  { name: 'Internet Computer', symbol: 'ICP/USD', iconType: 'icp', change: 0.18, volume: 154, marketCap: 15, perf1M: 2.8, pe: 18 },
  { name: 'KuCoin', symbol: 'KCS/USD', iconType: 'kcs', change: -0.72, volume: 147, marketCap: 9.4, perf1M: 5.2, pe: 14 },
  { name: 'Toncoin', symbol: 'TON/USD', iconType: 'ton', change: -1.23, volume: 141, marketCap: 4.1, perf1M: -1.4, pe: 12 },
  { name: 'Shiba Inu', symbol: 'SHIB/USD', iconType: 'shib', change: -3.01, volume: 130, marketCap: 3.0, perf1M: 7.92, pe: 6 },
  { name: 'Pepe', symbol: 'PEPE/USD', iconType: 'pepe', change: 1.44, volume: 118, marketCap: 1.8, perf1M: -6.21, pe: 5 },
  { name: 'Chiliz', symbol: 'CHZ/USD', iconType: 'chz', change: 6.23, volume: 113, marketCap: 1.3, perf1M: 14.2, pe: 8 },
  { name: 'Worldcoin', symbol: 'WLD/USD', iconType: 'wld', change: 0.15, volume: 108, marketCap: 4.4, perf1M: -8.64, pe: 9 },
  { name: 'MarketSyde Index', symbol: 'MSX/USD', iconType: 'crv', change: 0.91, volume: 104, marketCap: 7.4, perf1M: 3.3, pe: 22 },
];

/** Everything that did not fit on the board. */
const REMAINING_ASSETS = [
  { name: 'ZCash', change: '+2.31%', value: '$1.12B', tint: '#f5a524' },
  { name: 'Internet Explorer', change: '-1.74%', value: '$0.64B', tint: '#5945F1' },
  { name: 'Steller', change: '+4.08%', value: '$3.41B', tint: '#111827' },
  { name: 'Avalance', change: '-2.26%', value: '$18.73B', tint: '#e84142' },
  { name: 'Cronos', change: '+1.19%', value: '$3.28B', tint: '#0b1c30' },
  { name: 'Litecoin', change: '-0.92%', value: '$6.54B', tint: '#345d9d' },
];

export const FIELDS = ['Change 1D(%)', 'Performance 1M (%)', 'Market Cap ($B)', 'P/E Ratio (x)', 'Relative volume (x)'] as const;

export const fieldValue = (a: Asset, field: string): number => {
  switch (field) {
    case 'Change 1D(%)': return a.change;
    case 'Performance 1M (%)': return a.perf1M;
    case 'Market Cap ($B)': return a.marketCap;
    case 'P/E Ratio (x)': return a.pe;
    default: return a.volume;
  }
};

/** The design's scale: violet below zero, pale at zero, lime above. */
const SCALE = ['#8b7bf7', '#a99bff', '#cdc6ff', '#eef1f5', '#e4f09a', '#d3ea4e', '#caeb0e'];

/** Maps a reading onto the scale, normalising fields that are not percentages. */
function tileColour(value: number, field: string): { bg: string; text: string } {
  const pct = field.includes('Market Cap') ? (value / 200) - 1.5
    : field.includes('P/E') ? (value / 10) - 2.5
      : field.includes('Relative') ? (value / 400) - 1.5
        : value;
  const steps = [-3, -2, -1, 0, 1, 2, 3];
  let i = 0;
  for (let k = 0; k < steps.length; k += 1) if (pct >= steps[k]) i = k;
  if (pct < -3) i = 0;
  const strongLow = i <= 1;
  const strongHigh = i >= 5;
  return { bg: SCALE[i], text: strongLow ? '#2b1c7a' : strongHigh ? '#3d4d00' : '#0b1c30' };
}

interface Rect { x: number; y: number; w: number; h: number; a: Asset }

/** Squarified treemap, so tiles stay close to square and the board reads cleanly. */
function squarify(items: { a: Asset; v: number }[], x: number, y: number, w: number, h: number): Rect[] {
  const out: Rect[] = [];
  const total = items.reduce((s, i) => s + i.v, 0);
  if (total <= 0 || !items.length) return out;
  const scaled = items.map((i) => ({ a: i.a, v: (i.v / total) * (w * h) }));

  const worst = (row: { v: number }[], len: number) => {
    const s = row.reduce((t, r) => t + r.v, 0);
    const mx = Math.max(...row.map((r) => r.v));
    const mn = Math.min(...row.map((r) => r.v));
    if (!s || !mn) return Infinity;
    return Math.max((len * len * mx) / (s * s), (s * s) / (len * len * mn));
  };

  let cx = x; let cy = y; let cw = w; let ch = h;
  let rest = scaled.slice();
  let guard = 0;
  while (rest.length && guard < 200) {
    guard += 1;
    const vertical = cw >= ch;
    const len = vertical ? ch : cw;
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], len) <= worst(row, len)) {
      row.push(rest[i]);
      i += 1;
    }
    const sum = row.reduce((t, r) => t + r.v, 0);
    const thick = sum / len;
    let off = vertical ? cy : cx;
    row.forEach((r) => {
      const side = r.v / thick;
      out.push(vertical
        ? { x: cx, y: off, w: thick, h: side, a: r.a }
        : { x: off, y: cy, w: side, h: thick, a: r.a });
      off += side;
    });
    if (vertical) { cx += thick; cw -= thick; } else { cy += thick; ch -= thick; }
    rest = rest.slice(row.length);
    if (cw <= 0.5 || ch <= 0.5) break;
  }
  return out;
}

export const FieldDropdown: React.FC<{ label: string; value: string; options?: readonly string[]; onChange: (v: string) => void }> = ({ label, value, options = FIELDS, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-slate-500">{label}</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`flex w-[190px] items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-[14px] font-medium text-slate-900 transition ${open ? 'border-[#5945F1] ring-2 ring-[#5945F1]/20' : 'border-[#CCC6FB] hover:border-[#5945F1]'}`}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {open && (
          <>
            <span className="fixed inset-0 z-10" aria-hidden onClick={() => setOpen(false)} />
            <ul role="listbox" className="absolute left-0 top-[calc(100%+6px)] z-20 w-[190px] overflow-hidden rounded-xl border border-[#CCC6FB] bg-white py-1 shadow-xl">
              <li className="px-3.5 py-2 text-[14px] text-slate-400">Choose</li>
              {options.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o === value}
                    onClick={() => { onChange(o); setOpen(false); }}
                    className={`w-full px-3.5 py-2 text-left text-[14px] transition ${o === value ? 'bg-[#f1f0fe] font-medium text-slate-900' : 'text-slate-700 hover:bg-[#faf9ff]'}`}
                  >
                    {o}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

const Header: React.FC<{
  sizeBy: string; setSizeBy: (v: string) => void;
  colorBy: string; setColorBy: (v: string) => void;
  muted?: boolean;
}> = ({ sizeBy, setSizeBy, colorBy, setColorBy, muted }) => (
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
    <div>
      <h2 className="select-none font-display text-base font-bold text-slate-900 sm:text-lg">Market Heatmap</h2>
      <p className="mt-0.5 text-xs text-slate-500">Tile size and color update based on your selections below.</p>
    </div>
    <div className={`flex flex-wrap items-start gap-4 sm:gap-6 ${muted ? 'pointer-events-none opacity-60' : ''}`}>
      <FieldDropdown label="Size by" value={sizeBy} onChange={setSizeBy} />
      <FieldDropdown label="Color by" value={colorBy} onChange={setColorBy} />
    </div>
  </div>
);

const BOARD_W = 1000;
const BOARD_H = 560;

export const InstrumentHeatmapView: React.FC<InstrumentHeatmapViewProps> = ({ onSelectInstrument, state = 'default' }) => {
  const [sizeBy, setSizeBy] = useState<string>('Relative volume (x)');
  const [colorBy, setColorBy] = useState<string>('Change 1D(%)');
  const [showRemaining, setShowRemaining] = useState(false);
  const [remainingQuery, setRemainingQuery] = useState('');
  const [hover, setHover] = useState<{ a: Asset; x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const rects = useMemo(() => {
    const items = ASSETS
      .map((a) => ({ a, v: Math.max(0.3, Math.abs(fieldValue(a, sizeBy))) }))
      .sort((p, q) => q.v - p.v);
    return squarify(items, 0, 0, BOARD_W, BOARD_H);
  }, [sizeBy]);

  if (state !== 'default') {
    return (
      <div className="w-full space-y-6 rounded-2xl border border-[#CCC6FB] bg-white p-5 shadow-xs sm:p-7">
        <Header sizeBy={sizeBy} setSizeBy={setSizeBy} colorBy={colorBy} setColorBy={setColorBy} muted />
        <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
          <img src={state === 'error' ? HM_ERROR : HM_NOT_FOUND} alt="" className={state === 'error' ? 'h-auto w-[270px]' : 'h-auto w-[200px]'} />
          <p className="mt-6 font-display text-[34px] font-bold text-[#c026d3]">
            {state === 'error' ? 'Well, that didn’t load' : 'Data not found'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {state === 'error'
              ? 'It’s not you, it’s us. Try refreshing again in a bit.'
              : 'No instruments match these filters. Try loosening them up a bit.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 rounded-2xl border border-[#CCC6FB] bg-white p-5 shadow-xs sm:p-7">
      <Header sizeBy={sizeBy} setSizeBy={setSizeBy} colorBy={colorBy} setColorBy={setColorBy} />

      <div className="select-none space-y-4">
        <div ref={boardRef} className="relative w-full" style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}>
          {rects.map(({ a, x, y, w, h }) => {
            const { bg, text } = tileColour(fieldValue(a, colorBy), colorBy);
            const tiny = w < 70 || h < 46;
            const small = w < 110 || h < 74;
            return (
              <button
                key={a.symbol}
                type="button"
                onClick={() => onSelectInstrument?.(a.symbol)}
                onMouseEnter={(e) => {
                  const b = boardRef.current?.getBoundingClientRect();
                  if (b) setHover({ a, x: e.clientX - b.left, y: e.clientY - b.top });
                }}
                onMouseMove={(e) => {
                  const b = boardRef.current?.getBoundingClientRect();
                  if (b) setHover({ a, x: e.clientX - b.left, y: e.clientY - b.top });
                }}
                onMouseLeave={() => setHover(null)}
                className="absolute flex flex-col items-center justify-center overflow-hidden rounded-[10px] p-1 text-center outline-none transition hover:z-10 hover:brightness-[0.97] focus-visible:ring-2 focus-visible:ring-[#5945F1]"
                style={{
                  left: `${(x / BOARD_W) * 100}%`,
                  top: `${(y / BOARD_H) * 100}%`,
                  width: `${(w / BOARD_W) * 100}%`,
                  height: `${(h / BOARD_H) * 100}%`,
                  background: bg,
                  color: text,
                  border: '2px solid #ffffff',
                }}
              >
                {!small && <InstrumentIcon iconType={a.iconType} name={a.name} className="mb-1 h-6 w-6" />}
                <span className={`font-extrabold leading-tight ${tiny ? 'text-[11px]' : 'text-[13px]'}`}>
                  {a.change > 0 ? '+' : ''}{a.change.toFixed(2)}%
                </span>
                {!tiny && (
                  <span className="text-[11px] font-medium opacity-70">
                    ${a.volume >= 1000 ? `${(a.volume / 1000).toFixed(2)}T` : `${(a.volume / 1000).toFixed(3)}B`}
                  </span>
                )}
              </button>
            );
          })}

          {hover && (
            <div
              className="pointer-events-none absolute z-40 w-[210px] rounded-xl border border-[#CCC6FB] bg-white p-3 text-left shadow-xl"
              style={{ left: `min(${hover.x + 14}px, calc(100% - 220px))`, top: Math.max(0, hover.y - 110) }}
              role="status"
            >
              <p className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
                <InstrumentIcon iconType={hover.a.iconType} name={hover.a.name} className="h-5 w-5" />
                {hover.a.name}
              </p>
              <dl className="mt-2 space-y-1 text-[12px]">
                {[
                  ['Change 1D', `${hover.a.change > 0 ? '+' : ''}${hover.a.change.toFixed(2)}%`],
                  ['1M return', `${hover.a.perf1M > 0 ? '+' : ''}${hover.a.perf1M.toFixed(2)}%`],
                  ['Market cap', `$${hover.a.marketCap}B`],
                  ['Relative volume', `${(hover.a.volume / 1000).toFixed(3)}B`],
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

        {/* what did not fit on the board */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRemaining((v) => !v)}
            aria-expanded={showRemaining}
            className="ml-auto flex h-[72px] w-[200px] flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#CCC6FB] bg-[repeating-linear-gradient(45deg,#f6f5ff_0_6px,#ffffff_6px_12px)] transition hover:border-[#5945F1]"
          >
            <span className="text-[15px] font-bold text-slate-900">256 More</span>
            <span className="text-xs text-slate-500">$270.30B</span>
          </button>

          {showRemaining && (
            <div className="absolute bottom-[calc(100%+10px)] right-0 z-30 w-[300px] rounded-2xl border border-[#CCC6FB] bg-white p-4 text-left shadow-2xl">
              <p className="text-[15px] font-bold text-slate-900">Remaining assets</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Tile size and color use the selected market fields</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#CCC6FB] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <input
                  value={remainingQuery}
                  onChange={(e) => setRemainingQuery(e.target.value)}
                  placeholder="Search..."
                  aria-label="Search the remaining assets"
                  className="w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                />
              </div>
              <ul className="mt-3 max-h-[180px] space-y-2.5 overflow-y-auto pr-1">
                {REMAINING_ASSETS.filter((a) => a.name.toLowerCase().includes(remainingQuery.trim().toLowerCase())).map((a) => (
                  <li key={a.name} className="flex items-center gap-2 text-[14px]">
                    <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: a.tint }} aria-hidden />
                    <span className="flex-1 truncate text-slate-900">{a.name}</span>
                    <span className={`tabular-nums ${a.change.startsWith('-') ? 'text-[#5945F1]' : 'text-[#5f7a00]'}`}>{a.change}</span>
                    <span className="w-[62px] text-right tabular-nums text-slate-900">{a.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* colour scale */}
        <div className="pt-1">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
            {['-3%', '-2%', '-1%', '0%', '1%', '2%', '3%'].map((t) => <span key={t}>{t}</span>)}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-2">
            {SCALE.map((c) => <span key={c} className="h-2.5 rounded-full" style={{ background: c }} />)}
          </div>
        </div>
      </div>
    </div>
  );
};
