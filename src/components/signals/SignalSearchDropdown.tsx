import React, { useEffect, useRef } from 'react';

export interface SearchPairItem {
  ticker: string;
  name?: string;
  category?: 'forex' | 'crypto' | 'commodity' | 'indices';
}

export const POPULAR_SIGNAL_PAIRS: SearchPairItem[] = [
  { ticker: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex' },
  { ticker: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex' },
  { ticker: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'forex' },
  { ticker: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'forex' },
  { ticker: 'CHF/USD', name: 'Swiss Franc / US Dollar', category: 'forex' },
  { ticker: 'EUR/GBP', name: 'Euro / British Pound', category: 'forex' },
  { ticker: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'forex' },
  { ticker: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex' },
  { ticker: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'forex' },
  { ticker: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', category: 'forex' },
  { ticker: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'forex' },
  { ticker: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'forex' },
  { ticker: 'EUR/AUD', name: 'Euro / Australian Dollar', category: 'forex' },
  { ticker: 'GBP/AUD', name: 'British Pound / Australian Dollar', category: 'forex' },
  { ticker: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', category: 'forex' },
  { ticker: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', category: 'forex' },
  { ticker: 'EUR/CHF', name: 'Euro / Swiss Franc', category: 'forex' },
  { ticker: 'GBP/CHF', name: 'British Pound / Swiss Franc', category: 'forex' },
  { ticker: 'CAD/CHF', name: 'Canadian Dollar / Swiss Franc', category: 'forex' },
  // Additional market instruments
  { ticker: 'XAU/USD', name: 'Gold / US Dollar', category: 'commodity' },
  { ticker: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'crypto' },
  { ticker: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'crypto' },
  { ticker: 'US500', name: 'S&P 500 Index', category: 'indices' },
  { ticker: 'NAS100', name: 'Nasdaq 100 Index', category: 'indices' },
  { ticker: 'CHINA50', name: 'China A50 Index', category: 'indices' },
  { ticker: 'EUR/NZD', name: 'Euro / New Zealand Dollar', category: 'forex' },
  { ticker: 'USD/TRY', name: 'US Dollar / Turkish Lira', category: 'forex' },
];

/* ─── RECTANGULAR FLAG ICONS WITH CRISP DETAIL (Matching Dropdown List (1).png) ─── */

export function FlagEU() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#003399] border border-white/70 shadow-2xs relative shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 24 16" className="w-full h-full">
        <circle cx="12" cy="8" r="5" fill="none" />
        {/* Ring of yellow stars */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 12 + 4.8 * Math.cos(rad);
          const cy = 8 + 4.8 * Math.sin(rad);
          return <circle key={deg} cx={cx} cy={cy} r="0.75" fill="#FFCC00" />;
        })}
      </svg>
    </div>
  );
}

export function FlagUS() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#B22234] border border-white/70 shadow-2xs relative shrink-0">
      <svg viewBox="0 0 24 16" className="w-full h-full">
        {/* Stripes */}
        <rect width="24" height="16" fill="#B22234" />
        <rect y="2.5" width="24" height="2" fill="white" />
        <rect y="6.8" width="24" height="2" fill="white" />
        <rect y="11.2" width="24" height="2" fill="white" />
        {/* Canton */}
        <rect width="10.5" height="8.5" fill="#3C3B6E" />
        {/* Stars in canton */}
        <circle cx="2.5" cy="2.5" r="0.6" fill="white" />
        <circle cx="5.5" cy="2.5" r="0.6" fill="white" />
        <circle cx="8.5" cy="2.5" r="0.6" fill="white" />
        <circle cx="4" cy="4.5" r="0.6" fill="white" />
        <circle cx="7" cy="4.5" r="0.6" fill="white" />
        <circle cx="2.5" cy="6.5" r="0.6" fill="white" />
        <circle cx="5.5" cy="6.5" r="0.6" fill="white" />
        <circle cx="8.5" cy="6.5" r="0.6" fill="white" />
      </svg>
    </div>
  );
}

export function FlagJP() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-white border border-slate-200 shadow-2xs relative shrink-0 flex items-center justify-center">
      <div className="w-2.5 h-2.5 rounded-full bg-[#BC002D]" />
    </div>
  );
}

export function FlagGB() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#00247D] border border-white/70 shadow-2xs relative shrink-0">
      <svg viewBox="0 0 60 36" className="w-full h-full">
        {/* White saltire & cross */}
        <path d="M0,0 L60,36 M60,0 L0,36" stroke="#fff" strokeWidth="8" />
        <path d="M0,0 L60,36 M60,0 L0,36" stroke="#CF142B" strokeWidth="4" />
        <path d="M30,0 v36 M0,18 h60" stroke="#fff" strokeWidth="12" />
        <path d="M30,0 v36 M0,18 h60" stroke="#CF142B" strokeWidth="7" />
      </svg>
    </div>
  );
}

export function FlagAU() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#00008B] border border-white/70 shadow-2xs relative shrink-0">
      {/* Mini Union Jack canton */}
      <div className="absolute top-0 left-0 w-[10px] h-[7px] overflow-hidden bg-[#00247D]">
        <svg viewBox="0 0 60 36" className="w-full h-full">
          <path d="M0,0 L60,36 M60,0 L0,36" stroke="#fff" strokeWidth="8" />
          <path d="M0,0 L60,36 M60,0 L0,36" stroke="#CF142B" strokeWidth="4" />
          <path d="M30,0 v36 M0,18 h60" stroke="#fff" strokeWidth="12" />
          <path d="M30,0 v36 M0,18 h60" stroke="#CF142B" strokeWidth="7" />
        </svg>
      </div>
      {/* Southern Cross stars */}
      <div className="absolute right-1 top-1 w-1 h-1 text-white text-[6px] leading-none">★</div>
      <div className="absolute right-2.5 bottom-1 w-1 h-1 text-white text-[5px] leading-none">★</div>
      <div className="absolute left-1 bottom-0.5 w-1 h-1 text-white text-[6px] leading-none">★</div>
    </div>
  );
}

export function FlagCH() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#D52B1E] border border-white/70 shadow-2xs relative shrink-0 flex items-center justify-center">
      <div className="w-1 h-2.5 bg-white rounded-[0.5px]" />
      <div className="w-2.5 h-1 bg-white rounded-[0.5px] absolute" />
    </div>
  );
}

export function FlagCA() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-white border border-slate-200 shadow-2xs relative shrink-0 flex items-center justify-center">
      <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#FF0000]" />
      <div className="absolute right-0 top-0 bottom-0 w-[5px] bg-[#FF0000]" />
      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#FF0000] relative z-10">
        <path d="M12 2l1.2 3.5 2.8-.8-1 3.5 3 1.2-2.5 2.2 1.8 3.4-3.5-.5-.8 3.5-.8-3.5-3.5.5 1.8-3.4-2.5-2.2 3-1.2-1-3.5 2.8.8z" />
        <rect x="11.2" y="15" width="1.6" height="4" fill="#FF0000" />
      </svg>
    </div>
  );
}

export function FlagNZ() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#00247D] border border-white/70 shadow-2xs relative shrink-0">
      <div className="absolute top-0 left-0 w-[10px] h-[7px] overflow-hidden bg-[#00247D]">
        <svg viewBox="0 0 60 36" className="w-full h-full">
          <path d="M0,0 L60,36 M60,0 L0,36" stroke="#fff" strokeWidth="8" />
          <path d="M0,0 L60,36 M60,0 L0,36" stroke="#CF142B" strokeWidth="4" />
          <path d="M30,0 v36 M0,18 h60" stroke="#fff" strokeWidth="12" />
          <path d="M30,0 v36 M0,18 h60" stroke="#CF142B" strokeWidth="7" />
        </svg>
      </div>
      <div className="absolute right-1 top-0.5 text-[#CF142B] text-[5px] font-black leading-none drop-shadow-[0_0_1px_#fff]">★</div>
      <div className="absolute right-2 bottom-1 text-[#CF142B] text-[5px] font-black leading-none drop-shadow-[0_0_1px_#fff]">★</div>
    </div>
  );
}

export function FlagCN() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#DE2910] border border-white/70 shadow-2xs relative shrink-0 flex items-center justify-center">
      <span className="text-[9px]">🇨🇳</span>
    </div>
  );
}

export function FlagTR() {
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] overflow-hidden bg-[#E30A17] border border-white/70 shadow-2xs relative shrink-0 flex items-center justify-center text-[8px] text-white">
      🇹🇷
    </div>
  );
}

/* ─── SINGLE CURRENCY FLAG RESOLVER ─── */
function renderSingleCurrencyFlag(curr: string) {
  const c = curr.toUpperCase();
  if (c === 'EUR') return <FlagEU />;
  if (c === 'USD') return <FlagUS />;
  if (c === 'JPY') return <FlagJP />;
  if (c === 'GBP') return <FlagGB />;
  if (c === 'AUD') return <FlagAU />;
  if (c === 'CHF') return <FlagCH />;
  if (c === 'CAD') return <FlagCA />;
  if (c === 'NZD') return <FlagNZ />;
  if (c === 'CNY' || c === 'CHINA50') return <FlagCN />;
  if (c === 'TRY') return <FlagTR />;

  // Default fallback
  return (
    <div className="w-[20px] h-[14px] rounded-[2px] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">
      {c.slice(0, 2)}
    </div>
  );
}

/* ─── DUAL OVERLAPPING FLAGS (Exact match to Dropdown List (1).png) ─── */
export function DualCurrencyIcon({ ticker }: { ticker: string }) {
  if (ticker.includes('/')) {
    const [base, quote] = ticker.split('/');
    return (
      <div className="relative w-[30px] h-[22px] shrink-0">
        {/* Top-left flag */}
        <div className="absolute top-0 left-0 z-10 drop-shadow-xs">
          {renderSingleCurrencyFlag(base)}
        </div>
        {/* Bottom-right flag overlapping */}
        <div className="absolute bottom-0 right-0 z-20 drop-shadow-xs">
          {renderSingleCurrencyFlag(quote)}
        </div>
      </div>
    );
  }

  // Non-pair instruments
  if (ticker === 'CHINA50') {
    return (
      <div className="relative w-[30px] h-[22px] flex items-center justify-center shrink-0">
        <FlagCN />
      </div>
    );
  }

  if (ticker === 'XAU/USD' || ticker.includes('XAU') || ticker.includes('Gold')) {
    return (
      <div className="relative w-[30px] h-[22px] shrink-0">
        <div className="absolute top-0 left-0 z-10 drop-shadow-xs">
          <div className="w-[20px] h-[14px] rounded-[2px] bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-500 shadow-2xs flex items-center justify-center text-[8px] font-bold text-amber-900">
            AU
          </div>
        </div>
        <div className="absolute bottom-0 right-0 z-20 drop-shadow-xs">
          <FlagUS />
        </div>
      </div>
    );
  }

  if (ticker.includes('BTC')) {
    return (
      <div className="w-[26px] h-[20px] rounded-[4px] bg-[#F7931A] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs shrink-0">
        ₿
      </div>
    );
  }

  if (ticker.includes('ETH')) {
    return (
      <div className="w-[26px] h-[20px] rounded-[4px] bg-slate-800 text-white flex items-center justify-center shadow-2xs shrink-0">
        <svg className="w-3 h-3 text-white" viewBox="0 0 784.37 1277.39" fill="currentColor">
          <path d="M392.07 0L383.5 29.11V874.74L392.07 883.29L784.13 651.54L392.07 0Z" />
          <path d="M392.07 956.52L387.24 962.41V1272.58L392.07 1277.38L784.37 724.89L392.07 956.52Z" />
        </svg>
      </div>
    );
  }

  // Fallback icon
  return (
    <div className="w-[26px] h-[20px] rounded-[4px] bg-[#5338F5]/10 text-[#5338F5] flex items-center justify-center text-[10px] font-bold shrink-0">
      {ticker.slice(0, 3)}
    </div>
  );
}

/* ─── AUTOCOMPLETE SEARCH DROPDOWN ─── */
interface SignalSearchDropdownProps {
  query: string;
  onSelect: (ticker: string) => void;
  onClose: () => void;
}

export function SignalSearchDropdown({ query, onSelect, onClose }: SignalSearchDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter list based on search query
  const filteredPairs = POPULAR_SIGNAL_PAIRS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    const cleanTicker = item.ticker.toLowerCase().replace('/', '');
    const cleanQuery = q.replace('/', '');
    return (
      item.ticker.toLowerCase().includes(q) ||
      cleanTicker.includes(cleanQuery) ||
      (item.name && item.name.toLowerCase().includes(q))
    );
  });

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-[#15093f] border border-[#D4D2FB] dark:border-[#382285] rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      <div className="max-h-[380px] overflow-y-auto py-1.5 dropdown-scrollbar">
        {filteredPairs.length === 0 ? (
          <div className="py-4 px-4 text-center text-xs text-slate-400">
            No matching pairs
          </div>
        ) : (
          filteredPairs.map((item) => (
            <button
              key={item.ticker}
              type="button"
              onClick={() => onSelect(item.ticker)}
              className="w-full text-left flex items-center gap-3.5 px-4 py-2.5 hover:bg-purple-50/70 dark:hover:bg-purple-950/30 transition-colors cursor-pointer group"
            >
              {/* Dual Flag Icon */}
              <DualCurrencyIcon ticker={item.ticker} />

              {/* Ticker Name */}
              <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-slate-100 group-hover:text-[#5338F5] transition-colors">
                {item.ticker}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
