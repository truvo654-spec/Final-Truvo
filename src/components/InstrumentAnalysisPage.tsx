import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MarketSignal, Broker, UserProfile } from '../types';
import {
  MARKET_CATEGORIES,
  MarketCategory,
  InstrumentRow,
} from './analysis/instrumentAnalysisData';
import { MarketCarouselCard } from './analysis/MarketCarouselCard';
import { InstrumentIcon } from './analysis/InstrumentIcon';
import { TodaysCryptoWidget } from './analysis/TodaysCryptoWidget';
import { TradeVolumeComparisonWidget } from './analysis/TradeVolumeComparisonWidget';
import { MeetingTradingPartnerSection } from './analysis/MeetingTradingPartnerSection';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Download,
  Filter,
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
  Sparkles,
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
  // Carousel items layout representing the 5 major market categories:
  // Crypto | Forex | Indices CFDs (Default Center) | Commodities | Stocks
  const carouselCategories = useMemo(() => {
    return MARKET_CATEGORIES.map((cat) => ({
      ...cat,
      originalId: cat.id,
    }));
  }, []);

  // Active Category in Carousel (defaulting to center card index 2: 'Indices CFDs')
  const [activeCardIndex, setActiveCardIndex] = useState<number>(2);

  // Active Category object for table & widgets
  const activeCategory: MarketCategory = useMemo(() => {
    const activeItem = carouselCategories[activeCardIndex];
    if (activeItem) {
      const match = MARKET_CATEGORIES.find((c) => c.id === activeItem.originalId);
      if (match) return match;
    }
    return MARKET_CATEGORIES[2]; // Default to Indices CFDs (which has 463 results matching Frame 427322387.png)
  }, [activeCardIndex, carouselCategories]);

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

  // Pagination state (Page 1 active)
  const [currentPage, setCurrentPage] = useState<number>(1);

  // View tab state (Table | Heatmap | Scatter | Correlation)
  const [activeViewTab, setActiveViewTab] = useState<'table' | 'heatmap' | 'scatter' | 'correlation'>('table');

  // Responsive window width tracking for precise centering and responsive card spacing
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const handleSelectCard = (index: number) => {
    setActiveCardIndex(index);
    setCurrentPage(1);
  };

  const handlePrevCard = () => {
    setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : carouselCategories.length - 1));
    setCurrentPage(1);
  };

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev < carouselCategories.length - 1 ? prev + 1 : 0));
    setCurrentPage(1);
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevCard();
      } else if (e.key === 'ArrowRight') {
        handleNextCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carouselCategories.length]);

  // Touch Swipe Gesture Support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNextCard();
    } else if (distance < -50) {
      handlePrevCard();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
    const matchedSignal = signals.find((s) =>
      s.ticker.toLowerCase().includes(inst.symbol.split('/')[0].toLowerCase())
    );
    if (matchedSignal) {
      onSelectSignal(matchedSignal);
    } else {
      onOpenConnectModal?.(brokers[0]);
    }
  };

  return (
    <div className="w-full pb-16 space-y-8 animate-in fade-in duration-200">
      {/* ─── 1. TITLE & SUBTITLE AREA (Exact match to Frame 427322364.png) ─── */}
      <div className="text-center max-w-3xl mx-auto px-4 sm:px-8 md:px-[56px] space-y-2 pt-[100px]">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight">
          <span className="text-[#4F46E5]">Instrument</span>{' '}
          <span className="text-[#FD02B0]">Analysis</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Review market highlight, Fear &amp; greed, derivatives activity, and 24-hour changes before selecting an instrument.
        </p>
      </div>

      {/* ─── 2. FULL-WIDTH 3D PLAYFUL CAROUSEL WITH LEFT-RIGHT PHASE BLUR ─── */}
      <div className="relative w-full overflow-hidden pt-1 pb-2">
        {/* Left Phase Blur Overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-36 md:w-56 lg:w-72 z-40 pointer-events-none bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/80 to-transparent dark:from-[#090119] dark:via-[#090119]/80 backdrop-blur-[1.5px]" />

        {/* Right Phase Blur Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-36 md:w-56 lg:w-72 z-40 pointer-events-none bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/80 to-transparent dark:from-[#090119] dark:via-[#090119]/80 backdrop-blur-[1.5px]" />

        {/* Full-Width 3D Transform-Centered Carousel Stage */}
        <div
          className="relative w-full h-[650px] sm:h-[670px] md:h-[680px] select-none"
          style={{ perspective: 1200 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {carouselCategories.map((cat, idx) => {
            const diff = idx - activeCardIndex;
            const absDiff = Math.abs(diff);
            const isActive = diff === 0;

            // Spacing offsets for different screen viewports:
            const step1 = isMobile ? 220 : isTablet ? 275 : 340;
            const step2 = isMobile ? 390 : isTablet ? 490 : 600;
            const step3 = isMobile ? 560 : isTablet ? 700 : 860;

            let x = 0;
            let scale = 1;
            let rotateY = 0;
            let rotateZ = 0;
            let zIndex = 30;
            let opacity = 1;

            if (diff === 0) {
              x = 0;
              scale = 1;
              rotateY = 0;
              rotateZ = 0;
              zIndex = 30;
              opacity = 1;
            } else if (absDiff === 1) {
              x = diff * step1;
              scale = isMobile ? 0.76 : 0.83;
              rotateY = diff > 0 ? -24 : 24;
              rotateZ = diff > 0 ? 2.5 : -2.5;
              zIndex = 20;
              opacity = isMobile ? 0.65 : 0.88;
            } else if (absDiff === 2) {
              x = diff > 0 ? step2 : -step2;
              scale = isMobile ? 0.58 : 0.68;
              rotateY = diff > 0 ? -38 : 38;
              rotateZ = diff > 0 ? 4 : -4;
              zIndex = 10;
              opacity = isMobile ? 0 : 0.52;
            } else {
              x = diff > 0 ? step3 : -step3;
              scale = 0.5;
              rotateY = diff > 0 ? -45 : 45;
              rotateZ = diff > 0 ? 5 : -5;
              zIndex = 0;
              opacity = 0;
            }

            return (
              <motion.div
                key={cat.id}
                initial={false}
                animate={{
                  x: `calc(-50% + ${x}px)`,
                  y: isActive ? 0 : Math.min(absDiff * 14, 28),
                  scale,
                  rotateY,
                  rotateZ,
                  opacity,
                  z: isActive ? 50 : -80 * absDiff,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 24,
                  mass: 0.75,
                }}
                whileHover={
                  !isActive && absDiff <= 2
                    ? {
                        scale: scale * 1.05,
                        y: Math.min(absDiff * 14, 28) - 10,
                        rotateY: rotateY * 0.4,
                        rotateZ: 0,
                        opacity: 1,
                        transition: { duration: 0.2 },
                      }
                    : {}
                }
                whileTap={{ scale: scale * 0.95 }}
                style={{
                  top: '16px',
                  left: '50%',
                  transformStyle: 'preserve-3d',
                  zIndex,
                  pointerEvents:
                    absDiff > 2 || (isMobile && absDiff > 1) ? 'none' : 'auto',
                }}
                className={`absolute will-change-transform ${
                  isActive ? 'cursor-default' : 'cursor-pointer'
                }`}
                onClick={() => handleSelectCard(idx)}
              >
                <MarketCarouselCard
                  category={cat}
                  isActive={isActive}
                  distance={absDiff}
                  onClick={() => handleSelectCard(idx)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* ─── Carousel Navigation: < • • • • • > with Playful Tactile Bounces ─── */}
        <div className="flex items-center justify-center gap-3 mt-3 mb-2 select-none relative z-40">
          {/* Previous Arrow < */}
          <motion.button
            type="button"
            onClick={handlePrevCard}
            whileHover={{ scale: 1.18, x: -3 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-9 h-9 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-[#5945F1] hover:border-[#5945F1] transition-colors cursor-pointer"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </motion.button>

          {/* Dots Indicator with Morphing Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 shadow-inner">
            {carouselCategories.map((_, i) => {
              const isCurrent = i === activeCardIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectCard(i)}
                  className="relative p-1 cursor-pointer focus:outline-hidden"
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {isCurrent ? (
                    <motion.div
                      layoutId="activeCarouselDot"
                      className="w-7 h-2.5 rounded-full bg-gradient-to-r from-[#5945F1] to-[#FD02B0] shadow-xs shadow-[#5945F1]/40"
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 hover:bg-[#A5B4FC] transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Arrow > */}
          <motion.button
            type="button"
            onClick={handleNextCard}
            whileHover={{ scale: 1.18, x: 3 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-9 h-9 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-[#5945F1] hover:border-[#5945F1] transition-colors cursor-pointer"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        </div>
      </div>

      {/* ─── 3. LOWER SECTION CONTAINER (Full Width matching other pages) ─── */}
      <div className="w-full px-4 sm:px-8 md:px-[56px] space-y-5">
        {/* ─── VIEW TABS: Table | Heatmap | 🔒 Scatter | 🔒 Correlation (Exact match to Instrumental Analysis (1).png) ─── */}
        <div className="flex items-center gap-1 border-b border-slate-200/80 pb-1">
          <button
            type="button"
            onClick={() => setActiveViewTab('table')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeViewTab === 'table'
                ? 'bg-white border border-indigo-200 text-[#5945F1] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab('heatmap')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeViewTab === 'heatmap'
                ? 'bg-white border border-indigo-200 text-[#5945F1] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            Heatmap
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveViewTab('scatter');
              onShowToast?.('Scatter plot is an advanced feature unlocked in Pro tier');
            }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Scatter</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveViewTab('correlation');
              onShowToast?.('Correlation matrix is an advanced feature unlocked in Pro tier');
            }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Correlation</span>
          </button>
        </div>

        {/* ─── TOP BAR OF TABLE: Results Count + Action Buttons (Exact match to Instrumental Analysis (1).png) ─── */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Results Shown Label */}
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-800 select-none">
            {activeCategory.totalResults} Results Shown
          </h2>

          {/* Action Buttons: Broker Access + Export CSV + Filter Funnel */}
          <div className="flex items-center gap-2.5">
            {/* Broker Access Button */}
            <button
              type="button"
              onClick={() => onOpenConnectModal?.(brokers[0])}
              className="px-4 py-1.5 bg-white border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50 font-semibold text-sm rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none"
            >
              Broker Access
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50 font-semibold text-sm rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none"
            >
              <Download className="w-4 h-4 text-[#5945F1]" />
              <span>Export CSV</span>
            </button>

            {/* Filter Funnel Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`p-2 rounded-lg border transition-all cursor-pointer select-none ${
                isFilterOpen
                  ? 'bg-indigo-50 border-[#5945F1] text-[#5945F1]'
                  : 'bg-white border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50'
              }`}
              title="Filter & Search"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Filter & Search Drawer */}
        {isFilterOpen && (
          <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search instruments (e.g. Bitcoin, BTC, ETH)...`}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5945F1]/20 focus:border-[#5945F1]"
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

        {/* ─── 4. MAIN CONTENT 2-COLUMN LAYOUT (Table + Right Sidebar Stack) ─── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: TABLE */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            <div className="bg-white border border-[#E0E7FF] rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-indigo-100 text-xs font-medium text-[#5945F1] bg-white select-none">
                      {/* Favorite Star Column (Empty Header) */}
                      <th className="py-3.5 pl-4 pr-1 w-9 text-center">
                        <span className="sr-only">Star</span>
                      </th>

                      {/* Instrument Header */}
                      <th
                        onClick={() => handleSort('name')}
                        className="py-3.5 px-3.5 font-medium text-[#5945F1] cursor-pointer hover:text-[#4338CA] transition-colors"
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
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      </th>

                      {/* Price ($) Header */}
                      <th
                        onClick={() => handleSort('price')}
                        className="py-3.5 px-3.5 font-medium text-[#5945F1] cursor-pointer hover:text-[#4338CA] transition-colors"
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
                        className="py-3.5 px-3.5 font-medium text-[#5945F1] cursor-pointer hover:text-[#4338CA] transition-colors"
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
                        className="py-3.5 px-3.5 font-medium text-[#5945F1] cursor-pointer hover:text-[#4338CA] transition-colors"
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
                        className="py-3.5 px-3.5 font-medium text-[#5945F1] cursor-pointer hover:text-[#4338CA] transition-colors"
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
                        className="py-3.5 px-3.5 font-medium text-[#5945F1] cursor-pointer hover:text-[#4338CA] transition-colors"
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
                      <th className="py-3.5 px-3.5 font-medium text-[#5945F1]">
                        Market Cap
                      </th>

                      {/* Signal Header */}
                      <th className="py-3.5 px-4 font-medium text-[#5945F1] text-center">
                        Signal
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredInstruments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          No instruments found matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredInstruments.slice(0, 10).map((inst) => {
                        const isFav = favorites.has(inst.id);
                        const isPositiveChange = inst.change >= 0;
                        const isPositiveReturn = inst.return1M >= 0;

                        return (
                          <tr
                            key={inst.id}
                            className="hover:bg-indigo-50/20 transition-colors group cursor-pointer"
                            onClick={() => handleSignalClick(inst)}
                          >
                            {/* 1. Favorite Star (Purple outline star matching screenshot) */}
                            <td className="py-3.5 pl-4 pr-1 text-center">
                              <button
                                type="button"
                                onClick={(e) => toggleFavorite(inst.id, e)}
                                className="text-[#5945F1] hover:text-amber-400 transition-colors cursor-pointer"
                                title={isFav ? 'Remove favorite' : 'Add favorite'}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    isFav
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-[#5945F1] hover:text-amber-400'
                                  }`}
                                />
                              </button>
                            </td>

                            {/* 2. Instrument Icon + Name + Symbol */}
                            <td className="py-3.5 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <InstrumentIcon
                                  iconType={inst.iconType}
                                  name={inst.name}
                                  className="w-7 h-7"
                                />
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-bold text-slate-900 text-sm leading-tight">
                                    {inst.name}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    {inst.symbol}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* 3. Price ($) */}
                            <td className="py-3.5 px-3.5 font-bold text-slate-900 whitespace-nowrap text-sm">
                              $
                              {inst.price.toLocaleString('en-US', {
                                minimumFractionDigits: inst.decimals,
                                maximumFractionDigits: inst.decimals,
                              })}
                            </td>

                            {/* 4. Change with green arrow ↗ */}
                            <td className="py-3.5 px-3.5 whitespace-nowrap">
                              <div
                                className={`flex items-center gap-1 font-semibold text-xs ${
                                  isPositiveChange ? 'text-emerald-500' : 'text-rose-500'
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

                            {/* 5. 1M Return with green arrow ↗ */}
                            <td className="py-3.5 px-3.5 whitespace-nowrap">
                              <div
                                className={`flex items-center gap-1 font-semibold text-xs ${
                                  isPositiveReturn ? 'text-emerald-500' : 'text-rose-500'
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
                            <td className="py-3.5 px-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {inst.rolVolume.toFixed(2)}
                            </td>

                            {/* 7. RSI */}
                            <td className="py-3.5 px-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {inst.rsi.toFixed(1)}
                            </td>

                            {/* 8. Market Cap */}
                            <td className="py-3.5 px-3.5 font-semibold text-slate-800 text-xs whitespace-nowrap">
                              {inst.marketCap}
                            </td>

                            {/* 9. Signal Pill Badge */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {inst.signal.type === 'lock' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSignalClick(inst);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#6366F1] hover:bg-[#E0E7FF] transition-colors border border-indigo-100 cursor-pointer"
                                  title="Signal - click to review"
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

              {/* ─── Bottom Accent Line (Matching Frame 427322387.png blue-purple line) ─── */}
              <div className="w-full bg-slate-100/70 h-1 relative overflow-hidden">
                <div className="h-1 bg-[#5945F1] w-[58%] rounded-r-full" />
              </div>
            </div>

            {/* ─── Bottom Pagination (Exact match to Frame 427322387.png) ─── */}
            <div className="flex items-center justify-center gap-1.5 select-none pt-2">
              {/* |< */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="w-9 h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* < */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* 1 (Active Page matching screenshot) */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs'
                    : 'border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50'
                }`}
              >
                1
              </button>

              {/* 2 */}
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 2
                    ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs'
                    : 'border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50'
                }`}
              >
                2
              </button>

              {/* ... */}
              <div className="w-9 h-9 rounded-lg border border-indigo-200 text-slate-400 text-xs font-semibold flex items-center justify-center select-none">
                ...
              </div>

              {/* 20 */}
              <button
                type="button"
                onClick={() => setCurrentPage(20)}
                className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 20
                    ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs'
                    : 'border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50'
                }`}
              >
                20
              </button>

              {/* > */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(20, p + 1))}
                className="w-9 h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-[#5945F1] hover:bg-indigo-50/50 transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* >| */}
              <button
                type="button"
                onClick={() => setCurrentPage(20)}
                className="w-9 h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-[#5945F1] hover:bg-indigo-50/50 transition-all cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ─── Meeting Your Trading Partner Section (Exact match to Instrumental Analysis (1).png) ─── */}
            <MeetingTradingPartnerSection
              brokers={brokers}
              onOpenConnectModal={onOpenConnectModal}
              onNavigateToTab={onNavigateToTab}
            />
          </div>

          {/* RIGHT COLUMN: STACKED WIDGETS (Fixed 300px on LG) */}
          <div className="w-full lg:w-[300px] lg:shrink-0 space-y-6">
            <TradeVolumeComparisonWidget data={activeCategory.volumeComparison} />
            <TodaysCryptoWidget />
          </div>
        </div>
      </div>
    </div>
  );
};
