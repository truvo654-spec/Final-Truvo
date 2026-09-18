import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Check,
} from 'lucide-react';
import { WidgetSize } from '../../types/dashboardWidgets';

export interface InstrumentItem {
  id: string;
  ticker: string;
  name: string;
  category: 'Crypto' | 'Forex' | 'Stocks' | 'Indices' | 'Commodities';
  avatarType: 'jpm' | 'btc' | 'eth' | 'sol' | 'apple' | 'forex' | 'gold' | 'indices';
  avatarBg?: string;
  avatarText?: string;
  price: string;
  change: string;
  changePositive: boolean;
  oneMonthReturn: string;
  returnPositive: boolean;
  rolVolume: string;
  rsi: string;
  marketCap: string;
}

const INSTRUMENT_DATA: Record<string, InstrumentItem[]> = {
  Crypto: [
    // Page 1 (Matching the exact screenshot in Widget, 3 coloumn.png)
    {
      id: 'c1',
      ticker: 'JPM',
      name: 'JPMorgan Chase',
      category: 'Crypto',
      avatarType: 'jpm',
      avatarBg: '#1e293b',
      avatarText: 'JPM',
      price: '$77,204.00',
      change: '+0.85%',
      changePositive: true,
      oneMonthReturn: '+0.85%',
      returnPositive: true,
      rolVolume: '+$2.0T',
      rsi: '56.2',
      marketCap: '$1.54T',
    },
    {
      id: 'c2',
      ticker: 'BTC',
      name: 'Bitcoin',
      category: 'Crypto',
      avatarType: 'btc',
      avatarBg: '#F7931A',
      avatarText: '₿',
      price: '$77,204.00',
      change: '+0.85%',
      changePositive: true,
      oneMonthReturn: '+0.85%',
      returnPositive: true,
      rolVolume: '+$2.0T',
      rsi: '56.2',
      marketCap: '$1.54T',
    },
    {
      id: 'c3',
      ticker: 'BTC',
      name: 'Bitcoin',
      category: 'Crypto',
      avatarType: 'btc',
      avatarBg: '#F7931A',
      avatarText: '₿',
      price: '$77,204.00',
      change: '+0.85%',
      changePositive: true,
      oneMonthReturn: '+0.85%',
      returnPositive: true,
      rolVolume: '+$2.0T',
      rsi: '56.2',
      marketCap: '$1.54T',
    },
    // Page 2
    {
      id: 'c4',
      ticker: 'ETH',
      name: 'Ethereum',
      category: 'Crypto',
      avatarType: 'eth',
      avatarBg: '#627EEA',
      avatarText: 'Ξ',
      price: '$3,892.40',
      change: '+1.42%',
      changePositive: true,
      oneMonthReturn: '+12.60%',
      returnPositive: true,
      rolVolume: '+$1.1T',
      rsi: '61.4',
      marketCap: '$468.2B',
    },
    {
      id: 'c5',
      ticker: 'SOL',
      name: 'Solana',
      category: 'Crypto',
      avatarType: 'sol',
      avatarBg: '#14F195',
      avatarText: 'S',
      price: '$184.50',
      change: '+3.15%',
      changePositive: true,
      oneMonthReturn: '+24.80%',
      returnPositive: true,
      rolVolume: '+$520B',
      rsi: '68.9',
      marketCap: '$84.6B',
    },
    {
      id: 'c6',
      ticker: 'BNB',
      name: 'Binance Coin',
      category: 'Crypto',
      avatarType: 'sol',
      avatarBg: '#F3BA2F',
      avatarText: 'B',
      price: '$612.80',
      change: '+0.64%',
      changePositive: true,
      oneMonthReturn: '+5.10%',
      returnPositive: true,
      rolVolume: '+$340B',
      rsi: '54.7',
      marketCap: '$92.1B',
    },
    // Page 3
    {
      id: 'c7',
      ticker: 'XRP',
      name: 'Ripple',
      category: 'Crypto',
      avatarType: 'sol',
      avatarBg: '#23292F',
      avatarText: '✕',
      price: '$0.584',
      change: '-0.42%',
      changePositive: false,
      oneMonthReturn: '+3.20%',
      returnPositive: true,
      rolVolume: '+$180B',
      rsi: '49.1',
      marketCap: '$32.4B',
    },
    {
      id: 'c8',
      ticker: 'AVAX',
      name: 'Avalanche',
      category: 'Crypto',
      avatarType: 'sol',
      avatarBg: '#E84142',
      avatarText: '▲',
      price: '$31.20',
      change: '+2.05%',
      changePositive: true,
      oneMonthReturn: '+18.40%',
      returnPositive: true,
      rolVolume: '+$210B',
      rsi: '63.2',
      marketCap: '$12.8B',
    },
    {
      id: 'c9',
      ticker: 'DOGE',
      name: 'Dogecoin',
      category: 'Crypto',
      avatarType: 'sol',
      avatarBg: '#C2A633',
      avatarText: 'Ð',
      price: '$0.142',
      change: '+1.18%',
      changePositive: true,
      oneMonthReturn: '+8.90%',
      returnPositive: true,
      rolVolume: '+$145B',
      rsi: '58.0',
      marketCap: '$20.5B',
    },
  ],
  Forex: [
    {
      id: 'f1',
      ticker: 'EUR/USD',
      name: 'Euro / US Dollar',
      category: 'Forex',
      avatarType: 'forex',
      avatarBg: '#003399',
      avatarText: '€',
      price: '1.0842',
      change: '+0.33%',
      changePositive: true,
      oneMonthReturn: '+0.85%',
      returnPositive: true,
      rolVolume: '+$4.2T',
      rsi: '52.1',
      marketCap: '$6.6T Daily',
    },
    {
      id: 'f2',
      ticker: 'GBP/USD',
      name: 'British Pound / USD',
      category: 'Forex',
      avatarType: 'forex',
      avatarBg: '#C8102E',
      avatarText: '£',
      price: '1.2715',
      change: '+0.21%',
      changePositive: true,
      oneMonthReturn: '+1.12%',
      returnPositive: true,
      rolVolume: '+$2.8T',
      rsi: '54.6',
      marketCap: '$4.1T Daily',
    },
    {
      id: 'f3',
      ticker: 'USD/JPY',
      name: 'US Dollar / Yen',
      category: 'Forex',
      avatarType: 'forex',
      avatarBg: '#BC002D',
      avatarText: '¥',
      price: '154.62',
      change: '-0.15%',
      changePositive: false,
      oneMonthReturn: '-0.90%',
      returnPositive: false,
      rolVolume: '+$3.1T',
      rsi: '46.8',
      marketCap: '$5.2T Daily',
    },
  ],
  Stocks: [
    {
      id: 's1',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      category: 'Stocks',
      avatarType: 'apple',
      avatarBg: '#76B900',
      avatarText: 'N',
      price: '$128.40',
      change: '+2.85%',
      changePositive: true,
      oneMonthReturn: '+14.20%',
      returnPositive: true,
      rolVolume: '+$4.8T',
      rsi: '71.2',
      marketCap: '$3.15T',
    },
    {
      id: 's2',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      category: 'Stocks',
      avatarType: 'apple',
      avatarBg: '#555555',
      avatarText: '🍎',
      price: '$224.50',
      change: '+0.65%',
      changePositive: true,
      oneMonthReturn: '+4.15%',
      returnPositive: true,
      rolVolume: '+$3.2T',
      rsi: '58.4',
      marketCap: '$3.42T',
    },
    {
      id: 's3',
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      category: 'Stocks',
      avatarType: 'apple',
      avatarBg: '#00A4EF',
      avatarText: '田',
      price: '$448.20',
      change: '+0.92%',
      changePositive: true,
      oneMonthReturn: '+5.80%',
      returnPositive: true,
      rolVolume: '+$2.9T',
      rsi: '62.0',
      marketCap: '$3.32T',
    },
  ],
  Indices: [
    {
      id: 'i1',
      ticker: 'S&P 500',
      name: 'S&P 500 Index',
      category: 'Indices',
      avatarType: 'indices',
      avatarBg: '#1e293b',
      avatarText: '500',
      price: '$5,620.40',
      change: '+0.74%',
      changePositive: true,
      oneMonthReturn: '+3.85%',
      returnPositive: true,
      rolVolume: '+$8.2T',
      rsi: '64.1',
      marketCap: '$45.8T',
    },
    {
      id: 'i2',
      ticker: 'NAS 100',
      name: 'Nasdaq 100',
      category: 'Indices',
      avatarType: 'indices',
      avatarBg: '#0284c7',
      avatarText: '100',
      price: '$19,840.10',
      change: '+1.12%',
      changePositive: true,
      oneMonthReturn: '+5.40%',
      returnPositive: true,
      rolVolume: '+$6.1T',
      rsi: '66.8',
      marketCap: '$24.2T',
    },
    {
      id: 'i3',
      ticker: 'DJ 30',
      name: 'Dow Jones 30',
      category: 'Indices',
      avatarType: 'indices',
      avatarBg: '#0f172a',
      avatarText: '30',
      price: '$40,210.00',
      change: '+0.38%',
      changePositive: true,
      oneMonthReturn: '+2.10%',
      returnPositive: true,
      rolVolume: '+$3.9T',
      rsi: '55.3',
      marketCap: '$13.6T',
    },
  ],
  Commodities: [
    {
      id: 'm1',
      ticker: 'XAU/USD',
      name: 'Gold Spot',
      category: 'Commodities',
      avatarType: 'gold',
      avatarBg: '#EAB308',
      avatarText: '🪙',
      price: '$2,480.50',
      change: '+0.48%',
      changePositive: true,
      oneMonthReturn: '+4.60%',
      returnPositive: true,
      rolVolume: '+$3.4T',
      rsi: '63.5',
      marketCap: '$16.2T',
    },
    {
      id: 'm2',
      ticker: 'XAG/USD',
      name: 'Silver Spot',
      category: 'Commodities',
      avatarType: 'gold',
      avatarBg: '#94a3b8',
      avatarText: 'Ag',
      price: '$31.25',
      change: '+1.05%',
      changePositive: true,
      oneMonthReturn: '+8.15%',
      returnPositive: true,
      rolVolume: '+$840B',
      rsi: '59.2',
      marketCap: '$1.8T',
    },
    {
      id: 'm3',
      ticker: 'WTI Oil',
      name: 'Crude Oil',
      category: 'Commodities',
      avatarType: 'gold',
      avatarBg: '#334155',
      avatarText: '🛢️',
      price: '$82.40',
      change: '-0.32%',
      changePositive: false,
      oneMonthReturn: '+2.40%',
      returnPositive: true,
      rolVolume: '+$1.6T',
      rsi: '51.8',
      marketCap: '$2.5T',
    },
  ],
};

const CATEGORY_STATS: Record<string, { totalVal: string; changePct: string; activity: string }> = {
  Crypto: { totalVal: '$200.5T', changePct: '+0.45%', activity: 'Activity +$4.15' },
  Forex: { totalVal: '$6.6T', changePct: '+0.28%', activity: 'Activity +$1.85' },
  Stocks: { totalVal: '$112.4T', changePct: '+0.62%', activity: 'Activity +$8.40' },
  Indices: { totalVal: '$48.2T', changePct: '+0.35%', activity: 'Activity +$3.20' },
  Commodities: { totalVal: '$18.9T', changePct: '+0.19%', activity: 'Activity +$2.10' },
};

interface InstrumentAnalysisWidgetProps {
  className?: string;
  size?: WidgetSize;
  onNavigateToTab?: (tab: string) => void;
}

export const InstrumentAnalysisWidget: React.FC<InstrumentAnalysisWidgetProps> = ({
  className = '',
  size = 3,
  onNavigateToTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Crypto');
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>('By watchlist');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isWatchlistDropdownOpen, setIsWatchlistDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const categories = ['Crypto', 'Forex', 'Stocks', 'Indices', 'Commodities'];
  const watchlistOptions = ['By watchlist', 'Top Gainers', 'Most Active', 'Highest Volume'];

  const categoryItems = INSTRUMENT_DATA[selectedCategory] || INSTRUMENT_DATA.Crypto;
  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(categoryItems.length / itemsPerPage));
  const currentItems = categoryItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const stats = CATEGORY_STATS[selectedCategory] || CATEGORY_STATS.Crypto;

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setIsCategoryDropdownOpen(false);
    setCurrentPage(0);
  };

  return (
    <div
      id="instrument-analysis-widget"
      className={`w-full rounded-2xl sm:rounded-3xl border border-indigo-200/80 bg-white overflow-hidden shadow-2xs transition-all hover:shadow-xs interactive-card ${className}`}
    >
      {/* ─── GRADIENT HEADER (Matching Widget, 3 coloumn.png) ─── */}
      <div className="relative bg-gradient-to-r from-[#5338F5] via-[#482DEF] to-[#3B22D4] p-4 sm:p-5 text-white overflow-hidden">
        {/* Subtle curved overlay highlight on top right */}
        <div className="absolute top-0 right-0 w-80 h-full bg-radial from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: 3D Glossy Chart Icon & Category Selector with Stats */}
          <div className="flex items-center gap-3.5">
            {/* 3D Glossy Vector Chart Icon */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/25 shadow-inner backdrop-blur-md flex items-center justify-center p-2 shrink-0">
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
                {/* 4 Colored Bars */}
                <rect x="4" y="20" width="5" height="12" rx="1.5" fill="#FD02B0" opacity="0.9" />
                <rect x="11" y="14" width="5" height="18" rx="1.5" fill="#38BDF8" opacity="0.9" />
                <rect x="18" y="10" width="5" height="22" rx="1.5" fill="#818CF8" opacity="0.9" />
                <rect x="25" y="6" width="5" height="26" rx="1.5" fill="#BEF226" opacity="0.9" />
                {/* Neon Trend Spline */}
                <path
                  d="M 5 20 Q 12 12, 19 14 T 30 6"
                  stroke="#BEF226"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* Category Dropdown & Subtitle Stats */}
            <div className="space-y-0.5">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center gap-1.5 font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isCategoryDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-48 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-indigo-50 text-[#5945F1]'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitle Stats Line */}
              <div className="flex items-center gap-2 text-xs sm:text-[13px] font-medium flex-wrap">
                <span className="font-mono text-white/95">{stats.totalVal}</span>
                <span className="text-[#A3E635] font-bold">{stats.changePct}</span>
                <span className="text-white/60">.</span>
                <span className="text-white/85 font-normal">{stats.activity}</span>
              </div>
            </div>
          </div>

          {/* Right: By Watchlist Dropdown Button */}
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsWatchlistDropdownOpen(!isWatchlistDropdownOpen)}
              className="px-4 py-1.5 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-[13px] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs shadow-2xs"
            >
              <span>{selectedWatchlist}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isWatchlistDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Watchlist Dropdown Menu */}
            {isWatchlistDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                {watchlistOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedWatchlist(opt);
                      setIsWatchlistDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedWatchlist === opt
                        ? 'bg-indigo-50 text-[#5945F1]'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedWatchlist === opt && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE SECTION (Matching exact headers and values in Image 1) ─── */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold">
              <th className="py-3.5 pl-6 pr-4 font-semibold text-slate-400 min-w-[140px]">
                Instrument
              </th>
              <th className="py-3.5 px-4 font-semibold text-slate-400 min-w-[110px]">
                Price ($)
              </th>
              <th className="py-3.5 px-4 font-semibold text-slate-400 min-w-[100px]">
                Change
              </th>
              <th className="py-3.5 px-4 font-semibold text-slate-400 min-w-[110px]">
                1M Return
              </th>
              <th className="py-3.5 px-4 font-semibold text-slate-400 min-w-[110px]">
                RoL Volume
              </th>
              <th className="py-3.5 px-4 font-semibold text-slate-400 min-w-[80px]">
                RSI
              </th>
              <th className="py-3.5 pr-6 pl-4 font-semibold text-slate-400 min-w-[110px]">
                Market Cap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.map((item, index) => (
              <tr
                key={`${item.id}-${index}`}
                className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                onClick={() => onNavigateToTab && onNavigateToTab('signals')}
              >
                {/* 1. Instrument (Logo + Ticker) */}
                <td className="py-3.5 pl-6 pr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.avatarBg || '#1e293b' }}
                    >
                      {item.avatarText || item.ticker.slice(0, 3)}
                    </div>
                    <span className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#5945F1] transition-colors">
                      {item.ticker}
                    </span>
                  </div>
                </td>

                {/* 2. Price ($) */}
                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-slate-900 text-sm sm:text-[15px]">
                    {item.price}
                  </span>
                </td>

                {/* 3. Change (Green/Rose with Arrow) */}
                <td className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1 font-bold text-xs sm:text-sm text-emerald-600">
                    <span className="font-mono">{item.change}</span>
                    <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </td>

                {/* 4. 1M Return */}
                <td className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1 font-bold text-xs sm:text-sm text-emerald-600">
                    <span className="font-mono">{item.oneMonthReturn}</span>
                    <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </td>

                {/* 5. RoL Volume */}
                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    {item.rolVolume}
                  </span>
                </td>

                {/* 6. RSI */}
                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    {item.rsi}
                  </span>
                </td>

                {/* 7. Market Cap */}
                <td className="py-3.5 pr-6 pl-4">
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    {item.marketCap}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── PAGINATION FOOTER (< ● ○ ○ >) ─── */}
      <div className="py-3 px-6 border-t border-slate-100 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrevPage}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentPage(idx)}
              className={`rounded-full transition-all cursor-pointer ${
                currentPage === idx
                  ? 'w-2.5 h-2.5 bg-[#5338F5]'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Page ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNextPage}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
