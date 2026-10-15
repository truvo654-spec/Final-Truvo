import React, { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import CR_NOT_FOUND from '../../assets/community/ia-notfound.png';
import CR_ERROR from '../../assets/community/ia-error.png';

export type CorrelationState = 'default' | 'notfound' | 'error';

interface InstrumentCorrelationViewProps {
  /** Lets the page preview the empty and failed states. */
  state?: CorrelationState;
  onSelectInstrument?: (symbol: string) => void;
}

/** The assets on the grid, in the order the design shows them. */
const ASSETS = [
  'Bitcoin', 'Ethereum', 'Solana', 'Binance', 'Ripple', 'Uniswap', 'Dogecoin', 'Cardano',
  'Aave', 'Polkadot', 'Canton', 'Pepe', 'Worldcoin', 'Gram', 'Shiba Inu',
];

/** How each pair moves together, as a percentage. Symmetric, so one half is enough. */
const PAIRS: Record<string, number> = {
  'Bitcoin|Ethereum': 82, 'Bitcoin|Solana': 12, 'Bitcoin|Binance': 64, 'Bitcoin|Ripple': 71,
  'Bitcoin|Uniswap': 38, 'Bitcoin|Dogecoin': 58, 'Bitcoin|Cardano': 52, 'Bitcoin|Aave': 43,
  'Bitcoin|Polkadot': 49, 'Bitcoin|Canton': 31, 'Bitcoin|Pepe': 54, 'Bitcoin|Worldcoin': 46,
  'Bitcoin|Gram': 27, 'Bitcoin|Shiba Inu': 61,
  'Ethereum|Solana': 69, 'Ethereum|Binance': 67, 'Ethereum|Ripple': 51, 'Ethereum|Uniswap': -72,
  'Ethereum|Dogecoin': 63, 'Ethereum|Cardano': 71, 'Ethereum|Aave': 74, 'Ethereum|Polkadot': 62,
  'Ethereum|Canton': 37, 'Ethereum|Pepe': 67, 'Ethereum|Worldcoin': 59, 'Ethereum|Gram': 32,
  'Ethereum|Shiba Inu': 75,
  'Solana|Binance': 61, 'Solana|Ripple': -59, 'Solana|Uniswap': 31, 'Solana|Dogecoin': 68,
  'Solana|Cardano': 55, 'Solana|Aave': 71, 'Solana|Polkadot': 58, 'Solana|Canton': 29,
  'Solana|Pepe': 63, 'Solana|Worldcoin': 64, 'Solana|Gram': 24, 'Solana|Shiba Inu': 70,
  'Binance|Ripple': 48, 'Binance|Uniswap': 31, 'Binance|Dogecoin': 54, 'Binance|Cardano': 44,
  'Binance|Aave': -39, 'Binance|Polkadot': 47, 'Binance|Canton': 34, 'Binance|Pepe': 49,
  'Binance|Worldcoin': 41, 'Binance|Gram': 22, 'Binance|Shiba Inu': 56,
  'Ripple|Uniswap': 29, 'Ripple|Dogecoin': 63, 'Ripple|Cardano': 57, 'Ripple|Aave': 34,
  'Ripple|Polkadot': 42, 'Ripple|Canton': 26, 'Ripple|Pepe': 55, 'Ripple|Worldcoin': 39,
  'Ripple|Gram': 18, 'Ripple|Shiba Inu': 64,
  'Uniswap|Dogecoin': -12, 'Uniswap|Cardano': 18, 'Uniswap|Aave': 46, 'Uniswap|Polkadot': 41,
  'Uniswap|Canton': 9, 'Uniswap|Pepe': 28, 'Uniswap|Worldcoin': 17, 'Uniswap|Gram': -7,
  'Uniswap|Shiba Inu': 21,
  'Dogecoin|Cardano': 69, 'Dogecoin|Aave': 21, 'Dogecoin|Polkadot': 37, 'Dogecoin|Canton': 14,
  'Dogecoin|Pepe': 73, 'Dogecoin|Worldcoin': 28, 'Dogecoin|Gram': 11, 'Dogecoin|Shiba Inu': 84,
  'Cardano|Aave': 27, 'Cardano|Polkadot': 53, 'Cardano|Canton': 19, 'Cardano|Pepe': 58,
  'Cardano|Worldcoin': 34, 'Cardano|Gram': 16, 'Cardano|Shiba Inu': 72,
  'Aave|Polkadot': 48, 'Aave|Canton': 23, 'Aave|Pepe': 31, 'Aave|Worldcoin': 52,
  'Aave|Gram': 12, 'Aave|Shiba Inu': 26,
  'Polkadot|Canton': 21, 'Polkadot|Pepe': 35, 'Polkadot|Worldcoin': 44, 'Polkadot|Gram': 8,
  'Polkadot|Shiba Inu': 39,
  'Canton|Pepe': 11, 'Canton|Worldcoin': -7, 'Canton|Gram': 17, 'Canton|Shiba Inu': 6,
  'Pepe|Worldcoin': 24, 'Pepe|Gram': 4, 'Pepe|Shiba Inu': 81,
  'Worldcoin|Gram': -7, 'Worldcoin|Shiba Inu': 22,
  'Gram|Shiba Inu': 9,
};

const corr = (a: string, b: string): number | null =>
  a === b ? null : PAIRS[`${a}|${b}`] ?? PAIRS[`${b}|${a}`] ?? null;

/** Lime where assets move together, violet where they move apart, pale in between. */
function cellStyle(v: number | null): { background: string; color: string } {
  if (v === null) return { background: '#ffffff', color: '#94a3b8' };
  const t = Math.min(1, Math.abs(v) / 85);
  if (v < 0) {
    const bg = v <= -55 ? '#8b7bf7' : v <= -30 ? '#a99bff' : '#d7d1ff';
    return { background: bg, color: v <= -30 ? '#ffffff' : '#2b1c7a' };
  }
  const bg = t > 0.8 ? '#caeb0e' : t > 0.6 ? '#d9ee5c' : t > 0.4 ? '#e5f29a' : t > 0.2 ? '#eef6c4' : '#f6fae2';
  return { background: bg, color: '#2f3d00' };
}

const SORTS = ['Default', 'Strongest first', 'Weakest first', 'Name A–Z'] as const;

const SortDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-slate-500">Sort by</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`flex w-[190px] items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-[14px] text-slate-900 transition ${open ? 'border-[#5945F1] ring-2 ring-[#5945F1]/20' : 'border-[#CCC6FB] hover:border-[#5945F1]'}`}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {open && (
          <>
            <span className="fixed inset-0 z-10" aria-hidden onClick={() => setOpen(false)} />
            <ul role="listbox" className="absolute left-0 top-[calc(100%+6px)] z-20 w-[190px] overflow-hidden rounded-xl border border-[#CCC6FB] bg-white py-1 shadow-xl">
              {SORTS.map((o) => (
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

const AxisSearch: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[13px] font-medium text-slate-500">{label}</span>
    <div className="flex w-[160px] items-center gap-2 rounded-xl border border-[#CCC6FB] bg-white px-3 py-2.5 focus-within:border-[#5945F1] focus-within:ring-2 focus-within:ring-[#5945F1]/20">
      <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        aria-label={label}
        list="correlation-assets"
        className="w-full min-w-0 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  </div>
);

export const InstrumentCorrelationView: React.FC<InstrumentCorrelationViewProps> = ({ onSelectInstrument, state = 'default' }) => {
  const [xQuery, setXQuery] = useState('');
  const [yQuery, setYQuery] = useState('');
  const [sort, setSort] = useState<string>('Default');

  /** A search narrows the grid to the rows and columns that match. */
  const match = (name: string, q: string) => !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase());
  const cols = useMemo(() => {
    // A search highlights a row and a column; it does not shrink the grid.
    const sorted = ASSETS.slice(0, 10);
    if (sort === 'Name A–Z') sorted.sort((a, b) => a.localeCompare(b));
    if (sort === 'Strongest first' || sort === 'Weakest first') {
      const strength = (n: string) => ASSETS.reduce((t, o) => t + Math.abs(corr(n, o) ?? 0), 0);
      sorted.sort((a, b) => (sort === 'Strongest first' ? strength(b) - strength(a) : strength(a) - strength(b)));
    }
    return sorted;
  }, [sort]);

  const highlightCol = ASSETS.find((a) => xQuery.trim() && a.toLowerCase().includes(xQuery.trim().toLowerCase()));
  const highlightRow = ASSETS.find((a) => yQuery.trim() && a.toLowerCase().includes(yQuery.trim().toLowerCase()));

  const header = (
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
      <div>
        <h2 className="select-none font-display text-base font-bold text-slate-900 sm:text-lg">Adaptive Correlation</h2>
        <p className="mt-0.5 text-xs text-slate-500">How these assets move together, based on your current filters.</p>
      </div>
      <div className={`flex flex-wrap items-start gap-4 sm:gap-6 ${state !== 'default' ? 'pointer-events-none opacity-60' : ''}`}>
        <AxisSearch label="X Axis" value={xQuery} onChange={setXQuery} />
        <AxisSearch label="Y Axis" value={yQuery} onChange={setYQuery} />
        <SortDropdown value={sort} onChange={setSort} />
      </div>
      <datalist id="correlation-assets">
        {ASSETS.map((a) => <option key={a} value={a} />)}
      </datalist>
    </div>
  );

  if (state !== 'default') {
    return (
      <div className="w-full space-y-6 rounded-2xl border border-[#CCC6FB] bg-white p-5 shadow-xs sm:p-7">
        {header}
        <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
          <img src={state === 'error' ? CR_ERROR : CR_NOT_FOUND} alt="" className={state === 'error' ? 'h-auto w-[270px]' : 'h-auto w-[200px]'} />
          <p className="mt-6 font-display text-[34px] font-bold text-[#c026d3]">
            {state === 'error' ? 'Well, that didn’t load' : 'Data not found'}
          </p>
          <p className="mt-2 max-w-[340px] text-sm text-slate-500">
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
      {header}

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-center">
          <thead>
            <tr>
              <th className="w-[92px]" />
              {cols.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className={`px-1 pb-2 text-[13px] font-medium text-slate-700 ${c === highlightCol ? 'bg-[#f6fae2] rounded-t-lg' : ''}`}
                >
                  <span className="block max-w-[76px] truncate" title={c}>{c}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cols.map((r) => (
              <tr key={r} className={r === highlightRow ? 'bg-[#f6fae2]' : undefined}>
                <th scope="row" className="pr-2 text-right text-[13px] font-semibold text-slate-900">
                  <span className="block max-w-[88px] truncate" title={r}>{r}</span>
                </th>
                {cols.map((c) => {
                  const v = corr(r, c);
                  const st = cellStyle(v);
                  const strong = (r === highlightRow && c === highlightCol);
                  return (
                    <td key={c} className="p-0">
                      <button
                        type="button"
                        onClick={() => onSelectInstrument?.(`${c}/USD`)}
                        title={v === null ? `${r}` : `${r} and ${c} move together ${v > 0 ? '+' : ''}${v}% of the time`}
                        className={`h-[58px] w-full rounded-lg text-[14px] font-semibold transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945F1] ${strong ? 'ring-2 ring-[#5945F1]' : ''}`}
                        style={st}
                      >
                        {v === null ? '–' : `${v > 0 ? '+' : ''}${v}%`}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Lime means the two tend to rise and fall together; violet means one tends to rise while the other falls.
      </p>
    </div>
  );
};
