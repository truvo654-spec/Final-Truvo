import React, { useState, useMemo, useRef } from 'react';
import { MarketSignal, Broker, UserProfile } from '../types';
import {
  MARKET_CATEGORIES,
  MarketCategory,
  InstrumentRow,
} from './analysis/instrumentAnalysisData';
import { MarketCarouselCard } from './analysis/MarketCarouselCard';
import { InstrumentIcon } from './analysis/InstrumentIcon';
import { TradeVolumeComparisonWidget } from './analysis/TradeVolumeComparisonWidget';
import {
  Star,
  Download,
  SlidersHorizontal,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from 'lucide-react';

interface InstrumentAnalysisPageProps {
  user: UserProfile;
  signals: MarketSignal[];
  brokers: Broker[];
  onSelectSignal: (signal: MarketSignal) => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onOpenCalculator?: (type: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

type SortField = 'name' | 'price' | 'change' | 'return1M' | 'rolVolume' | 'rsi';
type SortDirection = 'asc' | 'desc';

export const InstrumentAnalysisPage: React.FC<InstrumentAnalysisPageProps> = ({
  user,
  signals,
  brokers,
  onSelectSignal,
  onOpenConnectModal,
  onOpenCalculator,
  onNavigateToTab,
  onShowToast,
}) => {
  // Active Category in Carousel (defaults to index 2: 'Indices CFDs', centered matching screenshot)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(2);

  // Current active category object
  const activeCategory: MarketCategory =
    MARKET_CATEGORIES[activeCategoryIndex] || MARKET_CATEGORIES[0];

  // Favorites tracking
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [minRsi, setMinRsi] = useState<number>(0);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Carousel ref & card refs for auto-centering
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Smoothly center active card on category change
  React.useEffect(() => {
    const activeEl = cardRefs.current[activeCategoryIndex];
    if (activeEl && carouselContainerRef.current) {
      const container = carouselContainerRef.current;
      const scrollLeft =
        activeEl.offsetLeft -
        container.clientWidth / 2 +
        activeEl.clientWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeCategoryIndex]);

  // Toggle Favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        onShowToast?.(`Removed from favorites`);
      } else {
        next.add(id);
        onShowToast?.(`Added to favorites`);
      }
      return next;
    });
  };

  // Carousel Navigation
  const handlePrevCategory = () => {
    setActiveCategoryIndex((prev) => {
      const nextIdx = prev > 0 ? prev - 1 : MARKET_CATEGORIES.length - 1;
      return nextIdx;
    });
    setCurrentPage(1);
  };

  const handleNextCategory = () => {
    setActiveCategoryIndex((prev) => {
      const nextIdx = prev < MARKET_CATEGORIES.length - 1 ? prev + 1 : 0;
      return nextIdx;
    });
    setCurrentPage(1);
  };

  const handleSelectCategory = (index: number) => {
    setActiveCategoryIndex(index);
    setCurrentPage(1);
  };

  // Filtered and Sorted Instruments
  const filteredInstruments = useMemo(() => {
    let list = [...activeCategory.instruments];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (inst) =>
          inst.name.toLowerCase().includes(q) ||
          inst.symbol.toLowerCase().includes(q)
      );
    }

    // Min RSI filter
    if (minRsi > 0) {
      list = list.filter((inst) => inst.rsi >= minRsi);
    }

    // Only favorites filter
    if (onlyFavorites) {
      list = list.filter((inst) => favorites.has(inst.id));
    }

    // Sorting
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return list;
  }, [
    activeCategory,
    searchQuery,
    minRsi,
    onlyFavorites,
    favorites,
    sortField,
    sortDirection,
  ]);

  // Handle Sort Header Click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export CSV Functionality
  const handleExportCSV = () => {
    const headers = [
      'Instrument',
      'Symbol',
      'Price ($)',
      'Change (%)',
      '1M Return (%)',
      'RoL Volume',
      'RSI',
      'Market Cap',
      'Signal',
    ];

    const rows = filteredInstruments.map((inst) => [
      `"${inst.name}"`,
      `"${inst.symbol}"`,
      inst.price,
      `${inst.change}%`,
      `${inst.return1M}%`,
      inst.rolVolume,
      inst.rsi,
      `"${inst.marketCap}"`,
      `"${inst.signal.text}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `market_analysis_${activeCategory.id}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast?.(`Exported ${activeCategory.name} data to CSV`);
  };

  // Signal click handler
  const handleSignalClick = (inst: InstrumentRow) => {
    // Check if correlated signal exists
    const matchedSignal = signals.find((s) =>
      s.ticker.toLowerCase().includes(inst.symbol.split('/')[0].toLowerCase())
    );
    if (matchedSignal) {
      onSelectSignal(matchedSignal);
    } else {
      // Prompt broker connect
      onOpenConnectModal?.(brokers[0]);
    }
  };

  return (
    <div className="w-full pb-16 space-y-8 animate-in fade-in duration-200">
      {/* ─── 1. TITLE & SUBTITLE AREA (Exact match to Instrumental Analysis.png) ─── */}
      <div className="text-center max-w-3xl mx-auto px-4 space-y-3 pt-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight">
          <span className="text-[#6366F1]">Instrument</span>{' '}
          <span className="text-[#FD02B0]">Analysis</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Review market highlight, Fear &amp; greed, derivatives activity, and 24-hour changes before selecting an instrument.
        </p>
      </div>

      {/* ─── 2. FULL WIDTH INTERACTIVE CAROUSEL WITH LEFT-RIGHT PHASE BLUR ─── */}
      <div className="relative w-full space-y-4">
        {/* Carousel Outer Wrapper with Left and Right Phase Blur */}
        <div className="relative w-full overflow-hidden">
          {/* Left Phase Blur Overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 md:w-64 lg:w-80 z-30 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent backdrop-blur-[4px] dark:from-[#0b0326] dark:via-[#0b0326]/80" />

          {/* Right Phase Blur Overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 md:w-64 lg:w-80 z-30 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent backdrop-blur-[4px] dark:from-[#0b0326] dark:via-[#0b0326]/80" />

          {/* Horizontal Carousel Viewport */}
          <div
            ref={carouselContainerRef}
            className="relative w-full overflow-x-auto scrollbar-none py-6 px-6 flex items-center justify-start md:justify-center"
          >
            {/* Track with Cards */}
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 transition-all duration-500 ease-out mx-auto px-16 sm:px-32 md:px-56">
              {MARKET_CATEGORIES.map((cat, idx) => {
                const isActive = idx === activeCategoryIndex;

                return (
                  <div
                    key={cat.id}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    className="shrink-0"
                  >
                    <MarketCarouselCard
                      category={cat}
                      isActive={isActive}
                      onClick={() => handleSelectCategory(idx)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carousel Pagination Controls: <  o o • o o  > */}
        <div className="flex items-center justify-center gap-3">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrevCategory}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Previous Market Type"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {MARKET_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeCategoryIndex
                    ? 'w-2.5 h-2.5 bg-[#4F46E5]'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Switch to ${cat.name}`}
              />
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNextCategory}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Next Market Type"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 3. LOWER SECTION CONTAINER (Max-w 7xl) ─── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ─── MIDDLE CONTROLS BAR: Count + Broker Access + Export CSV + Filter ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {/* Results Counter */}
          <div className="flex items-center gap-3">
            <span className="text-lg sm:text-xl font-bold font-display text-[#0b1c30]">
              {activeCategory.totalResults} Results Shown
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100">
              {activeCategory.name}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Broker Access Button */}
            <button
              type="button"
              onClick={() => onOpenConnectModal?.(brokers[0])}
              className="px-4 py-2 bg-white border border-indigo-200/90 text-[#4F46E5] hover:bg-indigo-50/60 font-semibold text-sm rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none"
            >
              Broker Access
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`p-2 rounded-xl border transition-all cursor-pointer select-none ${
                isFilterOpen
                  ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Filter & Search"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Expandable Filter & Search Drawer */}
      {isFilterOpen && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeCategory.name} instruments (e.g. Bitcoin, BTC, EUR)...`}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Minimum RSI Filter */}
            <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
              <span className="font-medium">Min RSI:</span>
              <select
                value={minRsi}
                onChange={(e) => setMinRsi(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value={0}>All Levels</option>
                <option value={50}>Over 50 (Bullish)</option>
                <option value={60}>Over 60 (Momentum)</option>
                <option value={70}>Over 70 (Overbought)</option>
              </select>
            </div>

            {/* Only Favorites */}
            <button
              type="button"
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  onlyFavorites ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                }`}
              />
              <span>Favorites Only</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 4. MAIN CONTENT 2-COLUMN GRID (Table + Right Trade Volume Comparison) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: TABLE (8 or 9 Cols on Large) */}
        <div className="lg:col-span-9 bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-xs font-semibold text-[#4F46E5] uppercase tracking-wider bg-slate-50/50 select-none">
                  {/* Favorite Header */}
                  <th className="py-4 pl-5 pr-2 w-10 text-center">
                    <span className="sr-only">Favorite</span>
                  </th>

                  {/* Instrument Header */}
                  <th
                    onClick={() => handleSort('name')}
                    className="py-4 px-4 font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Instrument</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 hover:opacity-100" />
                      )}
                    </div>
                  </th>

                  {/* Price Header */}
                  <th
                    onClick={() => handleSort('price')}
                    className="py-4 px-4 font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Price ($)</span>
                      {sortField === 'price' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        ))}
                    </div>
                  </th>

                  {/* Change Header */}
                  <th
                    onClick={() => handleSort('change')}
                    className="py-4 px-4 font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Change</span>
                      {sortField === 'change' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        ))}
                    </div>
                  </th>

                  {/* 1M Return Header */}
                  <th
                    onClick={() => handleSort('return1M')}
                    className="py-4 px-4 font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>1M Return</span>
                      {sortField === 'return1M' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        ))}
                    </div>
                  </th>

                  {/* RoL Volume Header */}
                  <th
                    onClick={() => handleSort('rolVolume')}
                    className="py-4 px-4 font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>RoL Volume</span>
                      {sortField === 'rolVolume' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        ))}
                    </div>
                  </th>

                  {/* RSI Header */}
                  <th
                    onClick={() => handleSort('rsi')}
                    className="py-4 px-4 font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>RSI</span>
                      {sortField === 'rsi' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        ))}
                    </div>
                  </th>

                  {/* Market Cap Header */}
                  <th className="py-4 px-4 font-semibold text-[#4F46E5]">
                    Market Cap
                  </th>

                  {/* Signal Header */}
                  <th className="py-4 px-5 font-semibold text-[#4F46E5] text-center">
                    Signal
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInstruments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No instruments match the current filter in {activeCategory.name}.
                    </td>
                  </tr>
                ) : (
                  filteredInstruments.map((inst) => {
                    const isFav = favorites.has(inst.id);
                    const isPositiveChange = inst.change >= 0;
                    const isPositiveReturn = inst.return1M >= 0;

                    return (
                      <tr
                        key={inst.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => handleSignalClick(inst)}
                      >
                        {/* 1. Favorite Star */}
                        <td className="py-4 pl-5 pr-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(inst.id, e)}
                            className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                            title={isFav ? 'Remove favorite' : 'Add favorite'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFav
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 hover:text-amber-400'
                              }`}
                            />
                          </button>
                        </td>

                        {/* 2. Instrument Logo + Name + Pair */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <InstrumentIcon
                              iconType={inst.iconType}
                              name={inst.name}
                              className="w-8 h-8"
                            />
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {inst.name}
                              </div>
                              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                {inst.symbol}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Price ($) */}
                        <td className="py-4 px-4 font-bold text-slate-900 font-display whitespace-nowrap">
                          $
                          {inst.price.toLocaleString('en-US', {
                            minimumFractionDigits: inst.decimals,
                            maximumFractionDigits: inst.decimals,
                          })}
                        </td>

                        {/* 4. Change */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div
                            className={`flex items-center gap-1 font-semibold text-xs ${
                              isPositiveChange ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {isPositiveChange ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isPositiveChange ? '+' : ''}
                              {inst.change.toFixed(2)}%
                            </span>
                          </div>
                        </td>

                        {/* 5. 1M Return */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div
                            className={`flex items-center gap-1 font-semibold text-xs ${
                              isPositiveReturn ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {isPositiveReturn ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isPositiveReturn ? '+' : ''}
                              {inst.return1M.toFixed(2)}%
                            </span>
                          </div>
                        </td>

                        {/* 6. RoL Volume */}
                        <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {inst.rolVolume.toFixed(2)}
                        </td>

                        {/* 7. RSI */}
                        <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {inst.rsi.toFixed(1)}
                        </td>

                        {/* 8. Market Cap */}
                        <td className="py-4 px-4 font-medium text-slate-800 text-xs whitespace-nowrap">
                          {inst.marketCap}
                        </td>

                        {/* 9. Signal Pill */}
                        <td className="py-4 px-5 text-center whitespace-nowrap">
                          {inst.signal.type === 'lock' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSignalClick(inst);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#6366F1] hover:bg-[#E0E7FF] transition-colors border border-indigo-100 cursor-pointer"
                              title="Locked signal - click to unlock"
                            >
                              <Lock className="w-3 h-3 text-[#6366F1]" />
                              <span>{inst.signal.text}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                              {inst.signal.text}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Bottom Pagination (Exact match to Instrumental Analysis.png) ─── */}
          <div className="py-4 px-6 border-t border-slate-100 flex items-center justify-center gap-1.5 select-none">
            {/* First Page button |< */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page button < */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page 1 (Active) */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 1
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 2
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              2
            </button>

            {/* Ellipsis ... */}
            <span className="px-1 text-slate-400 text-xs">...</span>

            {/* Page 20 */}
            <button
              type="button"
              onClick={() => setCurrentPage(20)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 20
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              20
            </button>

            {/* Next Page button > */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(20, p + 1))}
              disabled={currentPage === 20}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page button >| */}
            <button
              type="button"
              onClick={() => setCurrentPage(20)}
              disabled={currentPage === 20}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: TRADE VOLUME COMPARISON WIDGET (Sticky on scroll) */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar space-y-6">
            <TradeVolumeComparisonWidget
              data={activeCategory.volumeComparison}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
