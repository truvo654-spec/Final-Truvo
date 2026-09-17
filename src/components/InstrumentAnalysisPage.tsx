import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MarketSignal, Broker, UserProfile } from '../types';
import {
  MARKET_CATEGORIES,
  MarketCategory,
  InstrumentRow,
} from './analysis/instrumentAnalysisData';
import { MarketCarouselCard } from './analysis/MarketCarouselCard';
import { MarketBannerCard } from './analysis/MarketBannerCard';
import { InstrumentIcon } from './analysis/InstrumentIcon';
import { TodaysCryptoWidget } from './analysis/TodaysCryptoWidget';
import { TradeVolumeComparisonWidget } from './analysis/TradeVolumeComparisonWidget';
import { MeetingTradingPartnerSection } from './analysis/MeetingTradingPartnerSection';
import { InstrumentHeatmapView } from './analysis/InstrumentHeatmapView';
import { InstrumentScatterView } from './analysis/InstrumentScatterView';
import { InstrumentCorrelationView } from './analysis/InstrumentCorrelationView';
import { LockedFeatureOverlay } from './analysis/LockedFeatureOverlay';
import {
  InstrumentFilterDrawer,
  FilterCondition,
  DEFAULT_FILTER_CONDITIONS,
} from './analysis/InstrumentFilterDrawer';
import { TabMain, TabMainItem } from './common/TabMain';
import { InstrumentDetail } from './analysis/detail/InstrumentDetail';
import { MarketEngagementProvider } from './analysis/detail/MarketEngagementContext';
import { instruments } from './analysis/detail/mockMarket';
import type { Instrument } from './analysis/detail/types';
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
  onNavigateToTab?: (tab: string, subTab?: string, symbol?: string) => void;
  onShareToCommunity?: (symbol: string, name: string) => void;
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
  onShareToCommunity,
  onShowToast,
}) => {
  // Market categories order matching the user's reference pills:
  // Forex | Crypto | Commodities | Indicies | Stock
  const categoryPills = [
    { id: 'forex', label: 'Forex' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'indices', label: 'Indicies' },
    { id: 'stocks', label: 'Stock' },
  ];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('forex');
  const [displayMode, setDisplayMode] = useState<'banner' | 'carousel'>('banner');

  // Carousel items layout representing the 5 major market categories:
  const carouselCategories = useMemo(() => {
    return MARKET_CATEGORIES.map((cat) => ({
      ...cat,
      originalId: cat.id,
    }));
  }, []);

  // Active Category in Carousel
  const [activeCardIndex, setActiveCardIndex] = useState<number>(1);

  // Active Category object for table & widgets
  const activeCategory: MarketCategory = useMemo(() => {
    if (displayMode === 'banner') {
      const match = MARKET_CATEGORIES.find((c) => c.id === selectedCategoryId);
      if (match) return match;
    }
    const activeItem = carouselCategories[activeCardIndex];
    if (activeItem) {
      const match = MARKET_CATEGORIES.find((c) => c.id === activeItem.originalId);
      if (match) return match;
    }
    return MARKET_CATEGORIES.find((c) => c.id === 'forex') || MARKET_CATEGORIES[0];
  }, [displayMode, selectedCategoryId, activeCardIndex, carouselCategories]);

  // Favorites tracking
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [minRsi, setMinRsi] = useState<number>(0);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Drawer Filter & Logic state (Matches Instrumental Analysis (3).png)
  const [filterSector, setFilterSector] = useState<string>('All');
  const [filterSubSector, setFilterSubSector] = useState<string>('All');
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(DEFAULT_FILTER_CONDITIONS);
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state (Page 1 active)
  const [currentPage, setCurrentPage] = useState<number>(1);

  // View tab state (Table | Heatmap | Scatter | Correlation)
  const [activeViewTab, setActiveViewTab] = useState<'table' | 'heatmap' | 'scatter' | 'correlation'>('table');
  const [selectedDetailInstrument, setSelectedDetailInstrument] = useState<Instrument | null>(null);

  const toDetailInstrument = (inst: InstrumentRow): Instrument => {
    const matched = instruments.find(
      (i) =>
        i.symbol.toLowerCase() === inst.symbol.toLowerCase() ||
        i.symbol.split('/')[0].toLowerCase() === inst.symbol.split('/')[0].toLowerCase() ||
        inst.symbol.toLowerCase().includes(i.symbol.toLowerCase()) ||
        i.symbol.toLowerCase().includes(inst.symbol.toLowerCase())
    );
    if (matched) return matched;

    const marketCapNum = parseFloat(inst.marketCap.replace(/[^0-9.]/g, '')) || 50;

    return {
      symbol: inst.symbol,
      name: inst.name,
      market: 'Forex',
      sector: 'Major',
      price: inst.price,
      change: inst.change,
      volume: 12.5,
      rvol: inst.rolVolume || 1.25,
      rsi: inst.rsi || 52,
      return1m: inst.return1M || 1.5,
      marketCap: marketCapNum,
      sentiment: 56,
      signal: inst.signal.text.toUpperCase().includes('LONG') || inst.signal.text.toUpperCase().includes('BUY')
        ? 'LONG'
        : inst.signal.text.toUpperCase().includes('SELL')
        ? 'WATCH'
        : 'NEUTRAL',
      confidence: 65,
    };
  };

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

  // Condition evaluation helpers for the Filter Drawer
  const parseMarketCapBillions = (cap: string): number => {
    if (!cap) return 0;
    const clean = cap.replace(/[$, ]/g, '').toUpperCase();
    if (clean.endsWith('T')) return parseFloat(clean) * 1000;
    if (clean.endsWith('B')) return parseFloat(clean);
    if (clean.endsWith('M')) return parseFloat(clean) / 1000;
    return parseFloat(clean) || 0;
  };

  const checkCondition = (inst: InstrumentRow, cond: FilterCondition): boolean => {
    let val = 0;
    if (cond.field === 'marketCap') {
      val = parseMarketCapBillions(inst.marketCap);
    } else if (cond.field === 'rolVolume') {
      val = inst.rolVolume || 0;
    } else if (cond.field === 'rsi') {
      val = inst.rsi || 0;
    } else if (cond.field === 'return1M') {
      val = inst.return1M || 0;
    } else if (cond.field === 'change') {
      val = inst.change || 0;
    } else if (cond.field === 'price') {
      val = inst.price || 0;
    }

    if (cond.operator === '>') return val > cond.value;
    if (cond.operator === '<') return val < cond.value;
    if (cond.operator === '>=') return val >= cond.value;
    if (cond.operator === '<=') return val <= cond.value;
    if (cond.operator === '=') return Math.abs(val - cond.value) < 0.01;
    return true;
  };

  const handleRemoveFilterCondition = (id: string) => {
    setFilterConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddFilterCondition = (condition: FilterCondition) => {
    setFilterConditions((prev) => {
      if (prev.some((c) => c.id === condition.id)) return prev;
      return [...prev, condition];
    });
  };

  const handleResetFilterConditions = () => {
    setFilterConditions(DEFAULT_FILTER_CONDITIONS);
    setFilterSector('All');
    setFilterSubSector('All');
    setIsFilterActive(false);
    onShowToast?.('Reset all filters to default');
  };

  const handleApplyFilterDone = () => {
    setIsFilterActive(true);
    setIsFilterOpen(false);
    onShowToast?.(`Applied filters (${filterConditions.length} conditions active)`);
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

    // Drawer Logic Filter conditions
    if (isFilterActive && filterConditions.length > 0) {
      list = list.filter((inst) => {
        return filterConditions.every((cond) => checkCondition(inst, cond));
      });
    }

    // Drawer Sector & Sub-sector
    if (isFilterActive && filterSector !== 'All') {
      const s = filterSector.toLowerCase();
      list = list.filter((inst) =>
        activeCategory.name.toLowerCase().includes(s) ||
        inst.name.toLowerCase().includes(s) ||
        inst.symbol.toLowerCase().includes(s)
      );
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
    isFilterActive,
    filterConditions,
    filterSector,
    sortField,
    sortDirection,
  ]);

  type ViewTabType = 'table' | 'heatmap' | 'scatter' | 'correlation';

  // Tier level: 1 = Rookie, 2 = Climber, 3 = Player, 4 = Boss
  const userTierLevel = user.tierLevel || 1;

  // Track temporary credit unlocks
  const [unlockedTabs, setUnlockedTabs] = useState<Set<ViewTabType>>(new Set());
  const [isNewsUnlocked, setIsNewsUnlocked] = useState(false);
  const [isVolumeUnlocked, setIsVolumeUnlocked] = useState(false);

  // Access rules:
  // - Table: Level 1+ (Everyone)
  // - Heatmap: Level 2+ (Climber, Player, Boss)
  // - Scatter: Level 3+ (Player, Boss)
  // - Correlation: Level 4+ (Boss)
  const isHeatmapLocked = userTierLevel < 2 && !unlockedTabs.has('heatmap');
  const isScatterLocked = userTierLevel < 3 && !unlockedTabs.has('scatter');
  const isCorrelationLocked = userTierLevel < 4 && !unlockedTabs.has('correlation');

  // Sidebar widgets: Level 3+ (Player, Boss)
  const isNewsLocked = userTierLevel < 3 && !isNewsUnlocked;
  const isVolumeLocked = userTierLevel < 3 && !isVolumeUnlocked;

  // Real-time market tick simulation for auto-animation
  const [tickedRowId, setTickedRowId] = useState<string | null>(null);
  const [tickDirection, setTickDirection] = useState<'up' | 'down'>('up');
  const [liveDeltas, setLiveDeltas] = useState<
    Record<string, { changeOffset: number; priceOffset: number; returnOffset: number }>
  >({});

  useEffect(() => {
    const interval = setInterval(() => {
      if (!filteredInstruments || filteredInstruments.length === 0) return;
      // Pick a random instrument from first few rows
      const targetIndex = Math.floor(Math.random() * Math.min(filteredInstruments.length, 6));
      const target = filteredInstruments[targetIndex];
      if (!target) return;

      const dir = Math.random() > 0.35 ? 'up' : 'down';
      setTickedRowId(target.id);
      setTickDirection(dir);

      setLiveDeltas((prev) => {
        const curr = prev[target.id] || { changeOffset: 0, priceOffset: 0, returnOffset: 0 };
        const dChange = (dir === 'up' ? 1 : -1) * +(Math.random() * 0.08 + 0.02).toFixed(2);
        const dPrice = (dir === 'up' ? 1 : -1) * (target.price * (Math.random() * 0.0015 + 0.0004));
        const dReturn = (dir === 'up' ? 1 : -1) * +(Math.random() * 0.05 + 0.01).toFixed(2);
        return {
          ...prev,
          [target.id]: {
            changeOffset: +(curr.changeOffset + dChange).toFixed(2),
            priceOffset: curr.priceOffset + dPrice,
            returnOffset: +(curr.returnOffset + dReturn).toFixed(2),
          },
        };
      });

      const timeout = setTimeout(() => {
        setTickedRowId(null);
      }, 950);

      return () => clearTimeout(timeout);
    }, 2400);

    return () => clearInterval(interval);
  }, [filteredInstruments]);

  const handleUnlockTab = (tab: ViewTabType, tabName: string) => {
    setUnlockedTabs((prev) => {
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
    onShowToast?.(`🔓 Unlocked ${tabName} view with Credits!`);
  };

  const handleUnlockNews = () => {
    setIsNewsUnlocked(true);
    onShowToast?.('🔓 Unlocked Daily Market News & Recap with Credits!');
  };

  const handleUnlockVolume = () => {
    setIsVolumeUnlocked(true);
    onShowToast?.('🔓 Unlocked Cross-market Activity with Credits!');
  };

  const viewTabs: TabMainItem<ViewTabType>[] = useMemo(
    () => [
      {
        id: 'table',
        label: 'Table',
      },
      {
        id: 'heatmap',
        label: 'Heatmap',
        icon: isHeatmapLocked ? (
          <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
        ) : undefined,
      },
      {
        id: 'scatter',
        label: 'Scatter',
        icon: isScatterLocked ? (
          <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
        ) : undefined,
      },
      {
        id: 'correlation',
        label: 'Correlation',
        icon: isCorrelationLocked ? (
          <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
        ) : undefined,
      },
    ],
    [isHeatmapLocked, isScatterLocked, isCorrelationLocked]
  );

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

  if (selectedDetailInstrument) {
    return (
      <MarketEngagementProvider
        user={user}
        onOpenConnectBrokerModal={onOpenConnectModal}
        onShowToast={onShowToast}
        onViewPlans={() => onNavigateToTab?.('plans')}
      >
        <div className="market-feature w-full min-h-screen pt-[88px] pb-16 px-3 sm:px-6 lg:px-8 animate-in fade-in duration-200">
          <InstrumentDetail
            instrument={selectedDetailInstrument}
            onBack={() => setSelectedDetailInstrument(null)}
            chartOpen={false}
            chartContent={null}
            showLinkedTags={true}
            onShowLinkedTagsChange={() => {}}
            watchlistCount={favorites.size}
            watchlistLimit={user.tierLevel >= 3 ? 999 : user.tierLevel >= 2 ? 20 : 5}
            followedPublisher={null}
            onFollowPublisher={(name) => onShowToast?.(`Followed ${name}`)}
            onCommunityChart={() => {}}
            onOpenCommunity={() => onNavigateToTab?.('community')}
            onChart={() => {}}
            onToast={(msg) => onShowToast?.(msg)}
          />
        </div>
      </MarketEngagementProvider>
    );
  }

  return (
    <div className="w-full pb-16 space-y-7 animate-in fade-in duration-200">
      {/* ─── 1. TITLE & SUBTITLE AREA (Exact match to Reference screenshots) ─── */}
      <div className="text-center max-w-3xl mx-auto px-4 sm:px-8 md:px-[56px] space-y-3 pt-[100px]">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight">
          <span className="text-slate-900">Instrument</span>{' '}
          <span className="text-[#FD02B0]">Analysis</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Review market highlight, Fear &amp; greed, derivatives activity, and 24-hour changes before selecting an instrument.
        </p>

        {/* ─── Category Pills Selector (Exact match to Reference Images) ─── */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-2">
          {categoryPills.map((cat) => {
            const isSelected = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  const idx = carouselCategories.findIndex((c) => c.id === cat.id);
                  if (idx >= 0) setActiveCardIndex(idx);
                  setCurrentPage(1);
                }}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? 'bg-white border-2 border-[#5046E5] text-[#5046E5] shadow-xs'
                    : 'bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. WIDE MARKET BANNER CARD (Exact match to Instrumental Analysis.png) ─── */}
      {displayMode === 'banner' ? (
        <div className="w-full px-4 sm:px-8 md:px-[56px]">
          <MarketBannerCard
            category={activeCategory}
            userTierLevel={userTierLevel}
            onShowToast={onShowToast}
            onOpenHighlight={() => {
              onShowToast?.(`Viewing Market Highlight for ${activeCategory.name}`);
            }}
            onOpenETF={() => {
              onShowToast?.(`Viewing ETF statistics for ${activeCategory.name}`);
            }}
          />
        </div>
      ) : (
        /* Full-Width 3D Carousel if toggled */
        <div className="relative w-full overflow-hidden pt-1 pb-2">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-36 md:w-56 lg:w-72 z-40 pointer-events-none bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/80 to-transparent dark:from-[#090119] dark:via-[#090119]/80 backdrop-blur-[1.5px]" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-36 md:w-56 lg:w-72 z-40 pointer-events-none bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/80 to-transparent dark:from-[#090119] dark:via-[#090119]/80 backdrop-blur-[1.5px]" />

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

          <div className="flex items-center justify-center gap-3 mt-3 mb-2 select-none relative z-40">
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
      )}

      {/* ─── 3. LOWER SECTION CONTAINER (Full Width matching other pages) ─── */}
      <div className="w-full px-4 sm:px-8 md:px-[56px] space-y-5">
        {/* ─── VIEW TABS: Table | Heatmap | 🔒 Scatter | 🔒 Correlation (Using TabMain Component) ─── */}
        <div className="-mx-2 sm:mx-0">
          <TabMain<ViewTabType>
            tabs={viewTabs}
            activeTab={activeViewTab}
            onChange={(tabId) => {
              setActiveViewTab(tabId);
            }}
            showBadgeOnActiveOnly={true}
            rightContent={
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer select-none shadow-2xs active:scale-95 flex items-center justify-center ${
                  isFilterOpen || isFilterActive
                    ? 'bg-purple-50 border-[#8B5CF6] text-[#8B5CF6] ring-2 ring-[#8B5CF6]/20'
                    : 'bg-white border-purple-200 text-[#5945F1] hover:bg-purple-50/60 hover:border-purple-300'
                }`}
                title="Filter & Logic"
              >
                <Filter className="w-4 h-4 text-[#5945F1]" />
              </button>
            }
          />
        </div>

        {/* Active Filter Indicators Bar (if active) */}
        {isFilterActive && (
          <div className="flex flex-wrap items-center gap-2 py-1 px-1">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              Active Filters:
            </span>
            {filterSector !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs font-medium text-purple-700 dark:text-purple-300">
                Sector: {filterSector}
              </span>
            )}
            {filterSubSector !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs font-medium text-purple-700 dark:text-purple-300">
                Sub-sector: {filterSubSector}
              </span>
            )}
            {filterConditions.map((cond) => (
              <span
                key={cond.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs font-medium text-purple-700 dark:text-purple-300"
              >
                {cond.label} {cond.displayValue}
                <button
                  type="button"
                  onClick={() => handleRemoveFilterCondition(cond.id)}
                  className="text-purple-400 hover:text-purple-600 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilterConditions}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 underline cursor-pointer ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* ─── 4. MAIN CONTENT 2-COLUMN LAYOUT (Active Tab View + Right Sidebar Stack) ─── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: VIEW CONTENT + MEETING TRADING PARTNER */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* VIEW 1: TABLE VIEW */}
            {activeViewTab === 'table' && (
              <>
                {/* ─── TABLE VIEW SUBHEADER: "15 of 463 Results Shown" + Live Orderbook Pill + Action Buttons ─── */}
                <div className="flex items-center justify-between gap-4 select-none px-1 pt-1 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">
                      15 of {activeCategory.totalResults || 463} Results Shown
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-700 shadow-2xs">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span>LIVE FEED</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenConnectModal?.(brokers[0])}
                      className="px-4 py-1.5 bg-white border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50 font-semibold text-sm rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none"
                    >
                      Broker Access
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50 font-semibold text-sm rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none"
                    >
                      <Download className="w-4 h-4 text-[#5945F1]" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

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
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredInstruments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No instruments found matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredInstruments.slice(0, 15).map((inst, index) => {
                        const isFav = favorites.has(inst.id);
                        const delta = liveDeltas[inst.id] || { changeOffset: 0, priceOffset: 0, returnOffset: 0 };
                        const displayPrice = Math.max(0.00001, inst.price + delta.priceOffset);
                        const displayChange = inst.change + delta.changeOffset;
                        const displayReturn = inst.return1M + delta.returnOffset;
                        const isPositiveChange = displayChange >= 0;
                        const isPositiveReturn = displayReturn >= 0;

                        return (
                          <tr
                            key={inst.id}
                            className="hover:bg-indigo-50/20 transition-colors group cursor-pointer"
                            onClick={() => setSelectedDetailInstrument(toDetailInstrument(inst))}
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

                            {/* 2. Instrument Icon + Name (+ Trade pill button on row 1) */}
                            <td className="py-3.5 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <InstrumentIcon
                                  iconType={inst.iconType}
                                  name={inst.name}
                                  className="w-7 h-7 shrink-0"
                                />
                                <span className="font-bold text-slate-900 text-sm leading-tight">
                                  {inst.name}
                                </span>
                                {index === 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSignalClick(inst);
                                    }}
                                    className="relative group overflow-hidden px-2.5 py-0.5 rounded-full bg-[#5046E5] text-white text-[11px] font-bold shadow-xs hover:bg-[#4338CA] cursor-pointer transition-all shrink-0 hover:scale-105 active:scale-95"
                                  >
                                    <span className="relative z-10">Trade</span>
                                    <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* 3. Price ($) with Auto-Animated Live Ticker Flash */}
                            <td
                              className={`py-3.5 px-3.5 font-bold whitespace-nowrap text-sm transition-all duration-300 rounded-md ${
                                inst.id === tickedRowId
                                  ? tickDirection === 'up'
                                    ? 'bg-emerald-100/80 text-emerald-800 scale-[1.02]'
                                    : 'bg-rose-100/80 text-rose-800 scale-[1.02]'
                                  : 'text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <span>
                                  $
                                  {displayPrice.toLocaleString('en-US', {
                                    minimumFractionDigits: inst.decimals,
                                    maximumFractionDigits: inst.decimals,
                                  })}
                                </span>
                                {inst.id === tickedRowId && (
                                  <span
                                    className={`text-[10px] font-bold transition-all ${
                                      tickDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                  >
                                    {tickDirection === 'up' ? '▲' : '▼'}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 4. Change Signal with Auto-Animated Floating Arrow & Live Pulse */}
                            <td className="py-3.5 px-3.5 whitespace-nowrap">
                              <motion.div
                                animate={
                                  inst.id === tickedRowId
                                    ? { scale: [1, 1.15, 1] }
                                    : { scale: [1, 1.025, 1], opacity: [0.92, 1, 0.92] }
                                }
                                transition={{
                                  duration: inst.id === tickedRowId ? 0.45 : 2.2 + (index % 4) * 0.35,
                                  repeat: inst.id === tickedRowId ? 0 : Infinity,
                                  ease: 'easeInOut',
                                  delay: (index % 5) * 0.16,
                                }}
                                className={`inline-flex items-center gap-1 font-semibold text-xs transition-all duration-300 px-1.5 py-0.5 rounded-md ${
                                  inst.id === tickedRowId
                                    ? isPositiveChange
                                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 shadow-xs'
                                      : 'bg-rose-100 text-rose-700 ring-1 ring-rose-300 shadow-xs'
                                    : isPositiveChange
                                    ? 'text-emerald-500 hover:bg-emerald-50/70'
                                    : 'text-rose-500 hover:bg-rose-50/70'
                                }`}
                              >
                                <motion.span
                                  className="inline-flex items-center shrink-0"
                                  animate={
                                    isPositiveChange
                                      ? {
                                          y: [0, -2.4, 0],
                                          x: [0, 1.6, 0],
                                        }
                                      : {
                                          y: [0, 2.4, 0],
                                          x: [0, 1.2, 0],
                                        }
                                  }
                                  transition={{
                                    duration: 2.0 + (index % 4) * 0.35,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: (index % 5) * 0.16,
                                  }}
                                >
                                  {isPositiveChange ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  )}
                                </motion.span>
                                <span className="tabular-nums">
                                  {isPositiveChange ? '+' : ''}
                                  {displayChange.toFixed(2)}%
                                </span>
                              </motion.div>
                            </td>

                            {/* 5. 1M Return Signal with Auto-Animated Floating Arrow & Live Pulse */}
                            <td className="py-3.5 px-3.5 whitespace-nowrap">
                              <motion.div
                                animate={
                                  inst.id === tickedRowId
                                    ? { scale: [1, 1.12, 1] }
                                    : { scale: [1, 1.02, 1], opacity: [0.92, 1, 0.92] }
                                }
                                transition={{
                                  duration: inst.id === tickedRowId ? 0.45 : 2.6 + ((index + 2) % 4) * 0.35,
                                  repeat: inst.id === tickedRowId ? 0 : Infinity,
                                  ease: 'easeInOut',
                                  delay: ((index + 2) % 5) * 0.18,
                                }}
                                className={`inline-flex items-center gap-1 font-semibold text-xs transition-all duration-300 px-1.5 py-0.5 rounded-md ${
                                  inst.id === tickedRowId
                                    ? isPositiveReturn
                                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 shadow-xs'
                                      : 'bg-rose-100 text-rose-700 ring-1 ring-rose-300 shadow-xs'
                                    : isPositiveReturn
                                    ? 'text-emerald-500 hover:bg-emerald-50/70'
                                    : 'text-rose-500 hover:bg-rose-50/70'
                                }`}
                              >
                                <motion.span
                                  className="inline-flex items-center shrink-0"
                                  animate={
                                    isPositiveReturn
                                      ? {
                                          y: [0, -2.4, 0],
                                          x: [0, 1.6, 0],
                                        }
                                      : {
                                          y: [0, 2.4, 0],
                                          x: [0, 1.2, 0],
                                        }
                                  }
                                  transition={{
                                    duration: 2.4 + ((index + 2) % 4) * 0.35,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: ((index + 2) % 5) * 0.18,
                                  }}
                                >
                                  {isPositiveReturn ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  )}
                                </motion.span>
                                <span className="tabular-nums">
                                  {isPositiveReturn ? '+' : ''}
                                  {displayReturn.toFixed(2)}%
                                </span>
                              </motion.div>
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
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── Bottom Pagination (Exact match to Reference Screenshot) ─── */}
            <div className="flex items-center justify-center gap-1.5 select-none pt-2">
                {/* |< */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* < */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* 1 (Active Page matching screenshot) */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
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
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === 2
                      ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs'
                      : 'border border-indigo-200 text-[#5945F1] hover:bg-indigo-50/50'
                  }`}
                >
                  2
                </button>

                {/* ... */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-indigo-200 text-slate-400 text-xs font-semibold flex items-center justify-center select-none">
                  ...
                </div>

                {/* 20 */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(20)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
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
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-[#5945F1] hover:bg-indigo-50/50 transition-all cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* >| */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(20)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-indigo-200 flex items-center justify-center text-[#5945F1] hover:bg-indigo-50/50 transition-all cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
            )}

            {/* VIEW 2: HEATMAP VIEW */}
            {activeViewTab === 'heatmap' && (
              isHeatmapLocked ? (
                <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden min-h-[500px]">
                  {/* Glassmorphism Preview: properly blurred */}
                  <div className="filter blur-[5px] opacity-45 pointer-events-none select-none max-h-[650px] overflow-hidden">
                    <InstrumentHeatmapView
                      onSelectInstrument={() => {}}
                    />
                  </div>
                  {/* Floating Glassmorphic Lock Overlay Card */}
                  <LockedFeatureOverlay
                    title="Heatmap Analysis requires Level 2"
                    description="Real-time multi-asset heatmaps, sector volatility mapping, and volume clustering are available from Climber tier. Unlock temporarily with Credits."
                    buttonText="Unlock"
                    onUnlock={() => handleUnlockTab('heatmap', 'Heatmap')}
                  />
                </div>
              ) : (
                <InstrumentHeatmapView
                  onSelectInstrument={(symbol) => {
                    const match = filteredInstruments.find((i) => i.symbol === symbol);
                    if (match) setSelectedDetailInstrument(toDetailInstrument(match));
                  }}
                />
              )
            )}

            {/* VIEW 3: SCATTER VIEW */}
            {activeViewTab === 'scatter' && (
              isScatterLocked ? (
                <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden min-h-[500px]">
                  {/* Glassmorphism Preview: properly blurred */}
                  <div className="filter blur-[5px] opacity-45 pointer-events-none select-none max-h-[650px] overflow-hidden">
                    <InstrumentScatterView
                      onSelectInstrument={() => {}}
                    />
                  </div>
                  {/* Floating Glassmorphic Lock Overlay Card */}
                  <LockedFeatureOverlay
                    title="Scatter Plot Analysis requires Level 3"
                    description="Institutional 2D risk-reward distribution, RSI relative momentum, and beta correlation maps are reserved for Player tier and above."
                    buttonText="Unlock"
                    onUnlock={() => handleUnlockTab('scatter', 'Scatter Plot')}
                  />
                </div>
              ) : (
                <InstrumentScatterView
                  onSelectInstrument={(symbol) => {
                    const match = filteredInstruments.find((i) => i.symbol === symbol);
                    if (match) setSelectedDetailInstrument(toDetailInstrument(match));
                  }}
                />
              )
            )}

            {/* VIEW 4: CORRELATION VIEW */}
            {activeViewTab === 'correlation' && (
              isCorrelationLocked ? (
                <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden min-h-[500px]">
                  {/* Glassmorphism Preview: properly blurred */}
                  <div className="filter blur-[5px] opacity-45 pointer-events-none select-none max-h-[650px] overflow-hidden">
                    <InstrumentCorrelationView
                      onSelectInstrument={() => {}}
                    />
                  </div>
                  {/* Floating Glassmorphic Lock Overlay Card */}
                  <LockedFeatureOverlay
                    title="Correlation Matrix requires Level 4"
                    description="Advanced cross-asset Pearson correlation matrices and portfolio hedging telemetry are exclusive to Boss tier. Unlock temporarily with Credits."
                    buttonText="Unlock"
                    onUnlock={() => handleUnlockTab('correlation', 'Correlation Matrix')}
                  />
                </div>
              ) : (
                <InstrumentCorrelationView
                  onSelectInstrument={(symbol) => {
                    const match = filteredInstruments.find((i) => i.symbol === symbol);
                    if (match) setSelectedDetailInstrument(toDetailInstrument(match));
                  }}
                />
              )
            )}

            {/* ─── Meeting Your Trading Partner Section (Exact match to Frame 427322387 series) ─── */}
            <MeetingTradingPartnerSection
              brokers={brokers}
              onOpenConnectModal={onOpenConnectModal}
              onNavigateToTab={onNavigateToTab}
            />
          </div>

          {/* RIGHT COLUMN: STACKED WIDGETS (Fixed 300px on LG, Sticky on scroll) */}
          <aside className="w-full lg:w-[300px] lg:shrink-0 space-y-6 lg:sticky lg:top-[84px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar">
            <TradeVolumeComparisonWidget
              data={activeCategory.volumeComparison}
              isLocked={isVolumeLocked}
              onUnlock={handleUnlockVolume}
            />
            <TodaysCryptoWidget
              isLocked={isNewsLocked}
              onUnlock={handleUnlockNews}
              requiredLevelTitle="Daily Market News & Recap requires Level 3"
              requiredLevelDesc="Curated macroeconomic intelligence, sentiment analysis, and editorial crypto recaps require Player tier (Lv.3) or a credit unlock."
            />
          </aside>
        </div>
      </div>

      {/* ─── RIGHT SLIDE-OVER FILTER & LOGIC DRAWER (Matches Instrumental Analysis (3).png) ─── */}
      <InstrumentFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        sector={filterSector}
        onSectorChange={setFilterSector}
        subSector={filterSubSector}
        onSubSectorChange={setFilterSubSector}
        conditions={filterConditions}
        onRemoveCondition={handleRemoveFilterCondition}
        onAddCondition={handleAddFilterCondition}
        onResetAll={handleResetFilterConditions}
        onDone={handleApplyFilterDone}
      />
    </div>
  );
};
