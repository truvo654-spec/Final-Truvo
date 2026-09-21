import React, { useState, useMemo } from 'react';
import { MarketSignal, Broker, UserProfile } from '../types';
import { REFERENCE_SIGNALS } from '../data/signalsReferenceData';
import { TabMain, TabMainItem } from './common/TabMain';
import { SignalCreditUnlockModal } from './signals/SignalCreditUnlockModal';
import { InsufficientCreditModal } from './signals/InsufficientCreditModal';
import { SignalUnlockedToast } from './signals/SignalUnlockedToast';
import { SignalFilterPopover } from './signals/SignalFilterPopover';
import { SignalSearchDropdown } from './signals/SignalSearchDropdown';
import {
  Search,
  Filter,
  Clock,
  Hourglass,
  ArrowRight,
  Gem,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  ExternalLink,
  Zap,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Coins,
} from 'lucide-react';

interface TradingSignalsPageProps {
  user: UserProfile;
  signals: MarketSignal[];
  brokers: Broker[];
  onSelectSignal: (signal: MarketSignal) => void;
  onUpgradePrompt: () => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onOpenBrokerComparison: () => void;
  onNavigateToBrokers: () => void;
  onSimulateTradeCashback: (brokerName: string, lotSize: number, rebateAmount: number) => void;
  onSpendCredits?: (amount: number, reason: string) => boolean;
  onClaimBonusCredits?: (amount: number) => void;
  onSetUserCredits?: (amount: number) => void;
}

export const TradingSignalsPage: React.FC<TradingSignalsPageProps> = ({
  user,
  signals: initialSignals,
  brokers,
  onSelectSignal,
  onUpgradePrompt,
  onOpenConnectModal,
  onOpenBrokerComparison,
  onNavigateToBrokers,
  onSimulateTradeCashback,
  onSpendCredits,
  onClaimBonusCredits,
  onSetUserCredits,
}) => {
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // Credit Unlock Modal state, Insufficient credit scenarios & Toast
  const [unlockTargetSignal, setUnlockTargetSignal] = useState<MarketSignal | null>(null);
  const [isInsufficientCreditModalOpen, setIsInsufficientCreditModalOpen] = useState<boolean>(false);
  const [insufficientCreditTargetSignal, setInsufficientCreditTargetSignal] = useState<MarketSignal | null>(null);
  const [isUnlockedToastVisible, setIsUnlockedToastVisible] = useState<boolean>(false);

  const [unlockedSignalIds, setUnlockedSignalIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('marketsyde_unlocked_signals');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const handlePromptUnlock = (sig: MarketSignal) => {
    // If user has less than 200 credits, open the InsufficientCreditModal directly
    // Scenario 1: 0 credits -> "Wallet feeling light?"
    // Scenario 2: some credits (<200) -> "Missing syde credits"
    if (user.sydeCredits < 200) {
      setInsufficientCreditTargetSignal(sig);
      setIsInsufficientCreditModalOpen(true);
    } else {
      setUnlockTargetSignal(sig);
    }
  };

  const handleUnlockSignal = (sig: MarketSignal, cost: number) => {
    if (user.sydeCredits < cost) {
      setInsufficientCreditTargetSignal(sig);
      setIsInsufficientCreditModalOpen(true);
      return;
    }
    if (onSpendCredits) {
      const ok = onSpendCredits(cost, `Unlocked ${sig.name || sig.ticker} (${sig.confidence}% Confidence)`);
      if (!ok) return;
    }
    setUnlockedSignalIds((prev) => {
      const next = new Set(prev);
      next.add(sig.id);
      try {
        localStorage.setItem('marketsyde_unlocked_signals', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    // Show green toast notification matching Trading Signals; Desktop; Signal Unlocked.png
    setIsUnlockedToastVisible(true);
  };

  const handleShowMeCredits = () => {
    setIsInsufficientCreditModalOpen(false);
    if (onClaimBonusCredits) {
      onClaimBonusCredits(300);
    }
    if (insufficientCreditTargetSignal) {
      setUnlockTargetSignal(insufficientCreditTargetSignal);
    }
  };

  // Filter states matching Broker Filter.png & Dropdown List.png
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('Highest Confidence');

  // Active filter detection matching Dashboard_Trading Signals_Desktop_Max_Filter_6.png
  const hasActiveFilter = Boolean(
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedPeriod !== 'All' ||
    selectedConfidence !== 'All' ||
    selectedSort !== 'Highest Confidence'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPeriod('All');
    setSelectedConfidence('All');
    setSelectedSort('Highest Confidence');
    setCurrentPage(1);
  };

  // Quick Trade Simulator Modal State
  const [tradeModalBroker, setTradeModalBroker] = useState<string | null>(null);
  const [tradeModalLotSize, setTradeModalLotSize] = useState<string>('1.0');
  const [tradeModalSuccess, setTradeModalSuccess] = useState<boolean>(false);

  // Merge reference signals with any props signals to ensure we have the exact reference set
  const allAvailableSignals = useMemo(() => {
    const map = new Map<string, MarketSignal>();
    // Priority: reference signals first so the exact 16 from the mockup are present
    REFERENCE_SIGNALS.forEach((sig) => map.set(sig.ticker + (sig.minLevel || ''), sig));
    initialSignals.forEach((sig) => {
      if (!map.has(sig.ticker + (sig.minLevel || ''))) {
        map.set(sig.ticker + (sig.minLevel || ''), sig);
      }
    });
    return Array.from(map.values());
  }, [initialSignals]);

  // Filtered signals logic matching Category, Search, Period, Confidence and Sort
  const filteredSignals = useMemo(() => {
    const filtered = allAvailableSignals.filter((sig) => {
      // Category match
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Cryptos') {
          if (sig.assetClass !== 'Crypto') return false;
        } else if (selectedCategory === 'Commodities') {
          if (sig.assetClass !== 'Commodity') return false;
        } else if (selectedCategory === 'Stocks') {
          if (sig.assetClass !== 'Stocks') return false;
        } else if (selectedCategory === 'Indices') {
          if (sig.assetClass !== 'Indices') return false;
        } else if (selectedCategory === 'Forex') {
          if (sig.assetClass !== 'Forex') return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTicker = sig.ticker.toLowerCase().includes(query);
        const matchesName = sig.name.toLowerCase().includes(query);
        const matchesAnalysis = sig.analysis.toLowerCase().includes(query);
        if (!matchesTicker && !matchesName && !matchesAnalysis) return false;
      }

      // Period filter (Scalping: 5m-15m, Intraday: 15m-1H, Swing: 4H-1D, Position: 1D-1W, Investment: 1W-1M)
      if (selectedPeriod !== 'All') {
        const p = (sig.period || sig.timeframe || '').toLowerCase();
        if (selectedPeriod === 'Scalping') {
          if (!p.includes('5m') && !p.includes('15m') && !p.includes('scalp')) return false;
        } else if (selectedPeriod === 'Intraday') {
          if (!p.includes('15m') && !p.includes('30m') && !p.includes('1h') && !p.includes('intra')) return false;
        } else if (selectedPeriod === 'Swing') {
          if (!p.includes('4h') && !p.includes('1d') && !p.includes('swing')) return false;
        } else if (selectedPeriod === 'Position') {
          if (!p.includes('1d') && !p.includes('1w') && !p.includes('pos')) return false;
        } else if (selectedPeriod === 'Investment') {
          if (!p.includes('1w') && !p.includes('1m') && !p.includes('invest')) return false;
        }
      }

      // Confidence filter (e.g. 90%+, 80%+, 70%+)
      if (selectedConfidence !== 'All') {
        const minConf = parseInt(selectedConfidence.replace('%+', ''), 10);
        if (!isNaN(minConf) && sig.confidence < minConf) {
          return false;
        }
      }

      return true;
    });

    // Sort by selection
    const sorted = [...filtered];
    if (selectedSort === 'Highest Confidence') {
      sorted.sort((a, b) => b.confidence - a.confidence);
    } else if (selectedSort === 'Lowest Confidence') {
      sorted.sort((a, b) => a.confidence - b.confidence);
    } else if (selectedSort === 'Risk/Reward Ratio') {
      const parseRR = (rr: string) => {
        const parts = rr.split(':');
        return parts.length === 2 ? parseFloat(parts[1]) || 0 : 0;
      };
      sorted.sort((a, b) => parseRR(b.riskReward) - parseRR(a.riskReward));
    } else if (selectedSort === 'Newest First') {
      sorted.sort((a, b) => (a.timestamp.includes('m') ? -1 : 1));
    }

    return sorted;
  }, [allAvailableSignals, selectedCategory, searchQuery, selectedPeriod, selectedConfidence, selectedSort]);

  // Categories list matching reference: All 99, Forex, Indices, Stocks, Commodities, Cryptos
  // When filters are applied (e.g. 0 match), "All" reflects the filtered count like in the mockup
  const categories: TabMainItem<string>[] = useMemo(() => [
    { id: 'All', label: 'All', count: hasActiveFilter ? filteredSignals.length : 99 },
    { id: 'Forex', label: 'Forex', count: 42 },
    { id: 'Indices', label: 'Indices', count: 18 },
    { id: 'Stocks', label: 'Stocks', count: 16 },
    { id: 'Commodities', label: 'Commodities', count: 12 },
    { id: 'Cryptos', label: 'Cryptos', count: 11 },
  ], [hasActiveFilter, filteredSignals.length]);

  // Split into Top 8 (Rows 1 & 2) and Bottom 8 (Rows 3 & 4) for pagination page 1
  const displayedSignals = useMemo(() => {
    return filteredSignals.slice(0, 16);
  }, [filteredSignals]);

  const topSignals = displayedSignals.slice(0, 8);
  const bottomSignals = displayedSignals.slice(8, 16);

  // Asset icon helper with crisp visual badges matching reference
  const renderAssetIcon = (sig: MarketSignal) => {
    if (sig.ticker === 'CHINA50') {
      return (
        <div className="w-7 h-5 rounded-[3px] bg-[#DE2910] overflow-hidden flex items-center justify-center text-xs relative shadow-2xs shrink-0 border border-slate-200/50">
          🇨🇳
        </div>
      );
    }
    if (sig.ticker === 'EUR/NZD' || (sig.ticker.includes('EUR') && sig.ticker.includes('NZD'))) {
      return (
        <div className="flex items-center -space-x-1 shrink-0">
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-[#003399] flex items-center justify-center text-[10px] z-10">
            🇪🇺
          </div>
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-[#00247D] flex items-center justify-center text-[10px]">
            🇳🇿
          </div>
        </div>
      );
    }
    if (sig.ticker === 'USD/TRY' || (sig.ticker.includes('USD') && sig.ticker.includes('TRY'))) {
      return (
        <div className="flex items-center -space-x-1 shrink-0">
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-red-600 flex items-center justify-center text-[10px] z-10">
            🇺🇸
          </div>
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-[#E30A17] flex items-center justify-center text-[10px]">
            🇹🇷
          </div>
        </div>
      );
    }
    if (sig.ticker === 'ETH' || sig.ticker.includes('ETH')) {
      return (
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-slate-800" viewBox="0 0 784.37 1277.39" fill="currentColor">
            <path d="M392.07 0L383.5 29.11V874.74L392.07 883.29L784.13 651.54L392.07 0Z" fill="#2d3748" />
            <path d="M392.07 0L0 651.54L392.07 883.29V470.89V0Z" fill="#718096" />
            <path d="M392.07 956.52L387.24 962.41V1272.58L392.07 1277.38L784.37 724.89L392.07 956.52Z" fill="#2d3748" />
            <path d="M392.07 1277.38V956.52L0 724.89L392.07 1277.38Z" fill="#718096" />
            <path d="M392.07 883.29L784.13 651.54L392.07 470.9V883.29Z" fill="#1a202c" />
            <path d="M0 651.54L392.07 883.29V470.9L0 651.54Z" fill="#4a5568" />
          </svg>
        </div>
      );
    }
    if (sig.ticker === 'EUR/JPY' || (sig.ticker.includes('EUR') && sig.ticker.includes('JPY'))) {
      return (
        <div className="flex items-center -space-x-1 shrink-0">
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-[#003399] flex items-center justify-center text-[10px] z-10">
            🇪🇺
          </div>
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-white flex items-center justify-center text-[10px]">
            🇯🇵
          </div>
        </div>
      );
    }
    if (sig.ticker === 'USD/CAD' || (sig.ticker.includes('USD') && sig.ticker.includes('CAD'))) {
      return (
        <div className="flex items-center -space-x-1 shrink-0">
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-red-600 flex items-center justify-center text-[10px] z-10">
            🇺🇸
          </div>
          <div className="w-5 h-4 rounded-[2px] overflow-hidden shadow-2xs border border-white/60 bg-red-600 flex items-center justify-center text-[10px]">
            🇨🇦
          </div>
        </div>
      );
    }
    if (sig.ticker.includes('Gas')) {
      return (
        <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sm shrink-0">
          💧
        </div>
      );
    }
    if (sig.ticker === 'BTC' || sig.ticker.includes('BTC')) {
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs">
          ₿
        </div>
      );
    }
    if (sig.ticker === 'NIKKEI') {
      return (
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
          🔴
        </div>
      );
    }
    if (sig.ticker === 'BRENT') {
      return (
        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-sm shrink-0">
          🛢️
        </div>
      );
    }
    if (sig.ticker.includes('AUD')) {
      return (
        <div className="w-7 h-7 rounded-lg bg-[#00008b] flex items-center justify-center text-xs font-bold text-white shrink-0">
          🇦🇺
        </div>
      );
    }
    if (sig.ticker.includes('GBP')) {
      return (
        <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
          🇬🇧
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
        {sig.flag || '📈'}
      </div>
    );
  };

  const handleExecuteQuickTrade = () => {
    if (!tradeModalBroker) return;
    const lots = parseFloat(tradeModalLotSize) || 1.0;
    const rebatePerLot = tradeModalBroker === 'Exness' ? 6.2 : tradeModalBroker === 'HFM' ? 3.8 : 3.25;
    const totalRebate = +(lots * rebatePerLot * (1 + user.boostPercentage / 100)).toFixed(2);

    onSimulateTradeCashback(tradeModalBroker, lots, totalRebate);
    setTradeModalSuccess(true);
    setTimeout(() => {
      setTradeModalSuccess(false);
      setTradeModalBroker(null);
    }, 1400);
  };

  return (
    <div id="trading-signals-dashboard" className="w-full space-y-8 pb-12">
      {/* ─── 1. HERO HEADER ─── */}
      <div className="text-center space-y-2 pt-0">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-center">
          <span className="bg-gradient-to-r from-[#5945F1] to-[#FE01B1] bg-clip-text text-transparent inline-block pb-1">
            Trading Signals
          </span>
          <span className="text-[#c6f831] font-extrabold inline-block">.</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium">
          Market opportunities, trade ideas and actionable insights designed to help you make more informed trading decisions.
        </p>
      </div>

      {/* ─── 2. CATEGORY TABS (TabMain - 1:1 with reference design) ─── */}
      <div className="pt-2">
        <TabMain
          tabs={categories}
          activeTab={selectedCategory}
          onChange={(newCat) => {
            setSelectedCategory(newCat);
            setCurrentPage(1);
          }}
          showBadgeOnActiveOnly={true}
        />
      </div>

      {/* ─── 3. SUB-BAR (ACTIVE SIGNALS COUNT + SEARCH & FILTER) ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-b border-slate-100 pb-4">
        {/* Left: 0 of 99 active signals · Updated 1s ago (Exact match to Dashboard_Trading Signals_Desktop_Max_Filter_6.png) */}
        <div className="flex items-center gap-2 text-sm sm:text-base text-slate-800">
          <span className="font-semibold text-[#0b1c30]">
            {hasActiveFilter
              ? `${filteredSignals.length} of 99 active signals`
              : '99 active signals'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">
            {hasActiveFilter ? 'Updated 1s  ago' : 'Updated 2m  ago'}
          </span>
        </div>

        {/* Right: Search Input + Filter Funnel Button (Exact match to image.png & Dashboard_Trading Signals_Desktop_Max_Filter_6.png) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto relative">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Signals"
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-[#15093f] border border-[#D4D2FB] dark:border-[#382285] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5338F5]/20 focus:border-[#5338F5] text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Autocomplete Search Dropdown matching Dropdown List (1).png */}
            {showSearchDropdown && (
              <SignalSearchDropdown
                query={searchQuery}
                onSelect={(ticker) => {
                  setSearchQuery(ticker);
                  setShowSearchDropdown(false);
                  setCurrentPage(1);
                }}
                onClose={() => setShowSearchDropdown(false)}
              />
            )}
          </div>

          {/* Filter Popover Button & Dropdown with Pink Filter Indicator Dot */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown((prev) => !prev)}
              className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                showFilterDropdown || hasActiveFilter
                  ? 'border-[#5338F5] bg-[#5338F5]/5 text-[#5338F5]'
                  : 'border-[#D4D2FB] dark:border-[#382285] bg-white dark:bg-[#15093f] text-[#5338F5] hover:bg-slate-50 dark:hover:bg-[#1d0d54]'
              }`}
              title="Filter Options"
            >
              <Filter className="w-4 h-4 text-[#5338F5]" />
              {/* Pink dot indicating active filter from Dashboard_Trading Signals_Desktop_Max_Filter_6.png */}
              {hasActiveFilter && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FD02B0] rounded-full ring-2 ring-white dark:ring-[#15093f]" />
              )}
            </button>

            {/* Popover Filter Card matching Broker Filter.png and Dropdown List.png */}
            <SignalFilterPopover
              isOpen={showFilterDropdown}
              onClose={() => setShowFilterDropdown(false)}
              selectedPeriod={selectedPeriod}
              onSelectPeriod={(p) => {
                setSelectedPeriod(p);
                setCurrentPage(1);
              }}
              selectedConfidence={selectedConfidence}
              onSelectConfidence={(c) => {
                setSelectedConfidence(c);
                setCurrentPage(1);
              }}
              selectedSort={selectedSort}
              onSelectSort={(s) => {
                setSelectedSort(s);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN CONTENT (4-COL GRID + RIGHT SIDEBAR) ─── */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        {/* LEFT COLUMN: SIGNALS GRID OR MATCH NOT FOUND STATE */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {filteredSignals.length === 0 ? (
            /* Match Not Found Empty State (Exact match to Dashboard_Trading Signals_Desktop_Max_Filter_6.png) */
            <div className="w-full bg-white dark:bg-[#15093f] rounded-3xl border border-[#D4D2FB] dark:border-[#382285] min-h-[520px] flex flex-col items-center justify-center p-8 sm:p-12 text-center shadow-2xs">
              {/* 3D Glass Magnifying Glass with Center Magenta Cross Badge */}
              <div className="mb-4 relative flex items-center justify-center">
                <svg width="112" height="112" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
                  <defs>
                    <linearGradient id="handle3D" x1="60" y1="60" x2="98" y2="98" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="40%" stopColor="#4338CA" />
                      <stop offset="100%" stopColor="#312E81" />
                    </linearGradient>
                    <linearGradient id="rim3D" x1="15" y1="15" x2="70" y2="70" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="30%" stopColor="#60A5FA" />
                      <stop offset="70%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                    <radialGradient id="lensGlass" cx="42" cy="42" r="30" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#EEF2FF" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.3" />
                    </radialGradient>
                    <linearGradient id="crossBadge" x1="30" y1="30" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FD02B0" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#6366F1" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Handle with 3D curve */}
                  <rect x="62" y="58" width="13" height="40" rx="6.5" transform="rotate(-45 62 58)" fill="url(#handle3D)" filter="url(#shadowGlow)" />
                  <rect x="64.5" y="60.5" width="4" height="34" rx="2" transform="rotate(-45 64.5 60.5)" fill="#A5B4FC" opacity="0.6" />

                  {/* Metallic/Iridescent Rim */}
                  <circle cx="42" cy="42" r="30" fill="url(#lensGlass)" stroke="url(#rim3D)" strokeWidth="7" filter="url(#shadowGlow)" />
                  
                  {/* Specular gloss curves */}
                  <path d="M 21 36 A 23 23 0 0 1 36 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                  <path d="M 48 63 A 23 23 0 0 0 63 48" stroke="#84CC16" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

                  {/* Center Magenta Badge with Cross */}
                  <circle cx="42" cy="42" r="14" fill="url(#crossBadge)" />
                  <path d="M 37 37 L 47 47 M 47 37 L 37 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Message */}
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-normal mb-5">
                No signals matched your filter
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-[#5338F5] hover:bg-[#4326cf] active:scale-[0.99] text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Show Recommended Signals
              </button>
            </div>
          ) : (
            <>
              {/* Top 8 Cards (Rows 1 & 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {topSignals.map((sig) => (
                  <SignalCard
                    key={sig.id}
                    signal={sig}
                    userTierLevel={user.tierLevel}
                    isUnlockedByCredit={unlockedSignalIds.has(sig.id)}
                    onSelectSignal={onSelectSignal}
                    onUpgradePrompt={onUpgradePrompt}
                    onUnlockPrompt={handlePromptUnlock}
                    renderAssetIcon={renderAssetIcon}
                  />
                ))}
              </div>

              {/* ─── MIDDLE BANNER: "Your Account Are Ready." ─── */}
              <div className="bg-gradient-to-r from-purple-50/70 via-white to-purple-50/40 border border-purple-200/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  {/* Illustrated 3D pouch/wallet graphic */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5030e5] to-[#7c3aed] flex items-center justify-center text-white shadow-md shrink-0 relative">
                    <DollarSign className="w-6 h-6 text-[#bef226]" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#bef226] border-2 border-white" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] flex items-center gap-1.5">
                      Your Account Are Ready
                      <span className="inline-block w-2 h-2 rounded-full bg-[#bef226]" />
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Trade these assets now to get your cashback.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setTradeModalBroker('HFM')}
                  className="w-full sm:w-auto bg-[#5030e5] hover:bg-[#4326cf] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
                >
                  <span>Trade Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Bottom 8 Cards (Rows 3 & 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {bottomSignals.map((sig) => (
                  <SignalCard
                    key={sig.id}
                    signal={sig}
                    userTierLevel={user.tierLevel}
                    isUnlockedByCredit={unlockedSignalIds.has(sig.id)}
                    onSelectSignal={onSelectSignal}
                    onUpgradePrompt={onUpgradePrompt}
                    onUnlockPrompt={handlePromptUnlock}
                    renderAssetIcon={renderAssetIcon}
                  />
                ))}
              </div>

              {/* ─── PAGINATION BAR ─── */}
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Page numbers */}
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                    currentPage === 1
                      ? 'border-[#5030e5] text-[#5030e5] bg-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                    currentPage === 2
                      ? 'border-[#5030e5] text-[#5030e5] bg-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  2
                </button>
                <span className="text-slate-400 text-xs px-1 select-none">...</span>
                <button
                  onClick={() => setCurrentPage(20)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                    currentPage === 20
                      ? 'border-[#5030e5] text-[#5030e5] bg-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  20
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(20, p + 1))}
                  disabled={currentPage === 20}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(20)}
                  disabled={currentPage === 20}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: 3 STACKED CARDS (Fixed 300px on XL, Sticky on scroll) */}
        <aside className="w-full xl:w-[300px] xl:shrink-0 space-y-5 xl:sticky xl:top-[84px] xl:self-start xl:max-h-[calc(100vh-96px)] xl:overflow-y-auto xl:overscroll-contain sidebar-scrollbar">
          {/* Card 1: Move up. Earn More. (Exact match to image.png) */}
          <div className="bg-white rounded-3xl border-2 border-[#FE01B1] p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-display font-black text-xl text-[#0b1c30] tracking-tight">
                Move up. Earn More
                <span className="text-[#FE01B1]">.</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Keep trading to climb levels and boost cashback.
              </p>
            </div>

            {/* Stepper with "You" Badge & View Plan Button (Exact match to image.png) */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {/* Node 1: Rookie */}
                <div className="flex flex-col items-center relative">
                  {/* "You" Floating Tooltip */}
                  <div className="absolute -top-7 px-2.5 py-0.5 rounded-lg bg-[#5945F1] text-white text-[11px] font-bold shadow-xs whitespace-nowrap">
                    You
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#5945F1] rotate-45" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#5945F1]" />
                  <span className="text-[11px] font-bold text-[#FE01B1] mt-1.5">Rookie</span>
                </div>

                {/* Connecting Line */}
                <div className="w-8 sm:w-10 h-0.5 bg-slate-200" />

                {/* Node 2: Climber */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-[#5945F1] bg-white" />
                  <span className="text-[11px] font-bold text-[#5945F1] mt-1.5">Climber</span>
                </div>
              </div>

              {/* View Plan Button */}
              <button
                type="button"
                onClick={onUpgradePrompt}
                className="px-3.5 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4834df] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                View Plan
              </button>
            </div>
          </div>

          {/* Card 2: Pick up where you left off. */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0b1c30]">
                Pick up where you left off
                <span className="text-[#ec4899]">.</span>
              </h3>
              <button
                onClick={onNavigateToBrokers}
                className="text-xs text-slate-400 hover:text-[#5030e5] font-semibold flex items-center gap-0.5"
              >
                <span>View</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete linking accounts for more perks
            </p>

            {/* 3 Broker Logo Boxes */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* axi */}
              <button
                onClick={() => onOpenConnectModal(brokers.find((b) => b.name.includes('Axi')) || brokers[0])}
                className="h-10 rounded-xl bg-[#dc2626] hover:opacity-90 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-2xs transition-all"
                title="Connect Axi"
              >
                axi
              </button>
              {/* OANDA */}
              <button
                onClick={() => onOpenConnectModal(brokers.find((b) => b.name.includes('OANDA')) || brokers[0])}
                className="h-10 rounded-xl bg-[#0a1c3d] hover:opacity-90 flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-2xs transition-all"
                title="Connect OANDA"
              >
                OANDA
              </button>
              {/* AVATRADE */}
              <button
                onClick={() => onOpenConnectModal(brokers.find((b) => b.name.includes('Ava')) || brokers[0])}
                className="h-10 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:opacity-90 flex items-center justify-center text-white font-extrabold text-[10px] tracking-tight shadow-2xs transition-all"
                title="Connect AvaTrade"
              >
                AVATRADE
              </button>
            </div>
          </div>

          {/* Card 3: Connect & Ready to Trade!. */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-[#0b1c30]">
                Connect & Ready to Trade!
                <span className="text-[#ec4899]">.</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your accounts are connected. Time to make those trades pay you back!
              </p>
            </div>

            {/* Connected Brokers List */}
            <div className="space-y-2.5">
              {/* HFM */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0">
                    HFM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">
                      $3.80 <span className="text-[11px] font-normal text-slate-500">Max./lot</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Premium, Pro</div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setTradeModalBroker('HFM')}
                  className="bg-[#5030e5] hover:bg-[#4326cf] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Trade
                </button>
              </div>

              {/* Eightcap */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex flex-col items-center justify-center text-[9px] font-bold leading-tight shrink-0">
                    <span>8</span>
                    <span className="text-[7px]">eightcap</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">
                      $3.25 <span className="text-[11px] font-normal text-slate-500">Max./lot</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Standard</div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setTradeModalBroker('Eightcap')}
                  className="bg-[#5030e5] hover:bg-[#4326cf] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Trade
                </button>
              </div>

              {/* IG */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    IG
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">
                      $2.40 <span className="text-[11px] font-normal text-slate-500">Max./lot</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Standard</div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setTradeModalBroker('IG')}
                  className="bg-[#5030e5] hover:bg-[#4326cf] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Trade
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ─── 5. BOTTOM SECTION: "Meet Your Trading Partner." ─── */}
      <div className="bg-[#402fe0] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text and Action Buttons */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Meet Your <span className="text-[#bef226]">Trading</span>{' '}
              <span className="text-[#bef226]">Partner</span>
              <span className="text-[#ec4899]">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
              Compare brokers, account types and cashback before making your move.
            </p>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 pt-2">
              <button
                onClick={onNavigateToBrokers}
                className="bg-white hover:bg-slate-100 text-[#0b1c30] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>View all brokers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onOpenBrokerComparison}
                className="border border-white/40 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>See Side-by-Syde</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Cards: 3 Brokers */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: HFM */}
            <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[10px] tracking-tight">
                    HFM
                  </div>
                  <span className="text-xs font-semibold text-slate-500">HFM</span>
                </div>

                <div>
                  <div className="text-base font-extrabold text-[#0b1c30]">
                    $3.80<span className="text-xs font-normal text-slate-500">/lot</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Max Cashback</div>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Eligible Account Types
                  </div>
                  <ul className="text-xs space-y-1 text-slate-700">
                    <li className="flex items-center justify-between">
                      <span>• Premium</span>
                      <HelpCircle className="w-3 h-3 text-slate-400" title="Low spreads, zero commission" />
                    </li>
                    <li className="flex items-center justify-between">
                      <span>• Pro</span>
                      <HelpCircle className="w-3 h-3 text-slate-400" title="Ultra tight raw spreads" />
                    </li>
                    <li>• Pro Plus</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={onNavigateToBrokers}
                  className="text-xs text-[#5030e5] hover:underline font-bold flex items-center gap-1"
                >
                  <span>Link More</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setTradeModalBroker('HFM')}
                  className="w-full bg-[#5030e5] hover:bg-[#4326cf] text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs"
                >
                  Trade Now →
                </button>
              </div>
            </div>

            {/* Card 2: Exness */}
            <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                    ex
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Exness</span>
                </div>

                <div>
                  <div className="text-base font-extrabold text-[#0b1c30]">
                    $6.20<span className="text-xs font-normal text-slate-500">/lot</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Max Cashback</div>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Eligible Account Types
                  </div>
                  <ul className="text-xs space-y-1 text-slate-700">
                    <li>• Raw Spread</li>
                    <li>• Pro</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenConnectModal(brokers.find((b) => b.name.includes('Exness')) || brokers[0])}
                  className="w-full bg-[#bef226] hover:bg-[#b0e31d] text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-xs"
                >
                  Connect Now →
                </button>
              </div>
            </div>

            {/* Card 3: Pepperstone */}
            <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] tracking-tight">
                    PEP
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Pepperstone</span>
                </div>

                <div>
                  <div className="text-base font-extrabold text-[#0b1c30]">
                    0.3 pips
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Max spread cashback</div>
                </div>

                <div className="space-y-1 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Eligible Account Types
                  </div>
                  <ul className="text-xs space-y-1 text-slate-700">
                    <li>• Razor</li>
                    <li>• Standard Live</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenConnectModal(brokers.find((b) => b.name.includes('Pepperstone')) || brokers[0])}
                  className="w-full bg-[#bef226] hover:bg-[#b0e31d] text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-xs"
                >
                  Connect Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── QUICK TRADE EXECUTION & REBATE SIMULATOR MODAL ─── */}
      {tradeModalBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5030e5]/10 text-[#5030e5] flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#0b1c30]">
                    Execute Trade via {tradeModalBroker}
                  </h4>
                  <p className="text-xs text-slate-500">Automated institutional rebate tracking</p>
                </div>
              </div>
              <button
                onClick={() => setTradeModalBroker(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {tradeModalSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl animate-bounce">
                  ✓
                </div>
                <h5 className="font-bold text-lg text-slate-800">Trade Verified & Credited!</h5>
                <p className="text-xs text-slate-500">
                  Your cashback has been added directly to your account balance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Lot Size
                  </label>
                  <div className="flex gap-2">
                    {['0.5', '1.0', '2.5', '5.0'].map((lot) => (
                      <button
                        key={lot}
                        type="button"
                        onClick={() => setTradeModalLotSize(lot)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          tradeModalLotSize === lot
                            ? 'bg-[#5030e5] text-white border-[#5030e5]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lot} Lots
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation preview */}
                <div className="p-3.5 rounded-2xl bg-[#eff3fa] space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Base Rebate:</span>
                    <span className="font-bold text-slate-800">
                      ${(parseFloat(tradeModalLotSize || '1') * 3.8).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Rookie Perk (+{user.boostPercentage}%):</span>
                    <span className="font-bold text-[#5030e5]">
                      +${((parseFloat(tradeModalLotSize || '1') * 3.8 * user.boostPercentage) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex justify-between text-sm font-extrabold text-[#0b1c30]">
                    <span>Total Cash Back Earned:</span>
                    <span className="text-emerald-600 font-mono">
                      +${(parseFloat(tradeModalLotSize || '1') * 3.8 * (1 + user.boostPercentage / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTradeModalBroker(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteQuickTrade}
                    className="flex-1 py-2.5 rounded-xl bg-[#5030e5] hover:bg-[#4326cf] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Simulate & Credit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: Credit Unlock Signal Modal (Exact match to Trading Signals; Desktop; Unlocking Modal.png) ─── */}
      <SignalCreditUnlockModal
        isOpen={Boolean(unlockTargetSignal)}
        signal={unlockTargetSignal}
        userCredits={user.sydeCredits}
        cost={200}
        onClose={() => setUnlockTargetSignal(null)}
        onUnlock={handleUnlockSignal}
        onClaimBonusCredits={onClaimBonusCredits}
        onInsufficientCredits={(_credits, _cost) => {
          setInsufficientCreditTargetSignal(unlockTargetSignal);
          setUnlockTargetSignal(null);
          setIsInsufficientCreditModalOpen(true);
        }}
      />

      {/* ─── MODAL: Insufficient Credits Modal (2 Scenarios from Dashboard_Trading Signals_Desktop_Beginner (2) & (3).png) ─── */}
      <InsufficientCreditModal
        isOpen={isInsufficientCreditModalOpen}
        userCredits={user.sydeCredits}
        cost={200}
        onClose={() => setIsInsufficientCreditModalOpen(false)}
        onShowMe={handleShowMeCredits}
      />

      {/* ─── TOAST: Signal Unlocked Toast Notification (Exact match to Trading Signals; Desktop; Signal Unlocked.png) ─── */}
      <SignalUnlockedToast
        isVisible={isUnlockedToastVisible}
        onDismiss={() => setIsUnlockedToastVisible(false)}
        message="Trading Signal Unlocked!"
      />

      {/* Discreet floating scenario tester for quick review */}
      {onSetUserCredits && (
        <div className="fixed bottom-4 left-4 z-40 bg-white/95 dark:bg-[#15093f]/95 backdrop-blur-sm border border-purple-200/90 dark:border-purple-800 rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 text-xs">
          <Coins className="w-3.5 h-3.5 text-[#5338F5]" />
          <span className="font-bold text-slate-700 dark:text-slate-200">{user.sydeCredits} crd</span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 font-medium">Test:</span>
          <button
            type="button"
            onClick={() => onSetUserCredits(1000)}
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
              user.sydeCredits >= 200 ? 'bg-[#5338F5] text-white' : 'text-purple-700 hover:bg-purple-100'
            }`}
            title="1000 credits (Can unlock)"
          >
            1K
          </button>
          <button
            type="button"
            onClick={() => onSetUserCredits(160)}
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
              user.sydeCredits > 0 && user.sydeCredits < 200 ? 'bg-[#FD02B0] text-white' : 'text-pink-600 hover:bg-pink-100'
            }`}
            title="160 credits (Missing 40 credits)"
          >
            160
          </button>
          <button
            type="button"
            onClick={() => onSetUserCredits(0)}
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
              user.sydeCredits === 0 ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="0 credits (Empty wallet)"
          >
            0
          </button>
        </div>
      )}
    </div>
  );
};

// ─── SUB-COMPONENT: SignalCard ───
interface SignalCardProps {
  signal: MarketSignal;
  userTierLevel: number;
  isUnlockedByCredit?: boolean;
  onSelectSignal: (sig: MarketSignal) => void;
  onUpgradePrompt: () => void;
  onUnlockPrompt: (sig: MarketSignal) => void;
  renderAssetIcon: (sig: MarketSignal) => React.ReactNode;
}

const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  userTierLevel,
  isUnlockedByCredit = false,
  onSelectSignal,
  onUpgradePrompt,
  onUnlockPrompt,
  renderAssetIcon,
}) => {
  const isLocked = Boolean(signal.minLevel && signal.minLevel > userTierLevel && !isUnlockedByCredit);
  const isBuy = signal.action === 'BUY';

  // Format price helper exactly matching reference design
  const formatPrice = (val: number) => {
    if (val >= 1000) {
      if (val >= 10000 && val % 1 === 0) {
        return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (val > 10) return val.toFixed(3);
    return val.toFixed(4);
  };

  return (
    <div
      onClick={() => {
        if (isLocked) {
          onUnlockPrompt(signal);
        } else {
          onSelectSignal(signal);
        }
      }}
      className="bg-white rounded-2xl border border-indigo-200/90 hover:border-indigo-400/90 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group relative shadow-2xs h-full"
    >
      <div className="space-y-3">
        {/* Top Header Row: Asset Icon & Name */}
        <div className="flex items-center gap-2.5">
          {renderAssetIcon(signal)}
          <span className="font-display font-extrabold text-slate-900 text-lg group-hover:text-[#5338F5] transition-colors leading-tight tracking-tight">
            {signal.name || signal.ticker}
          </span>
        </div>

        {/* Middle Metrics Row */}
        <div className="flex items-start justify-between pt-1">
          {/* Left Values: Target, Entry, Stop */}
          <div className="space-y-1.5 text-xs sm:text-[13px]">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 w-11 font-normal">Target</span>
              {isLocked ? (
                <span className="font-mono text-slate-400 blur-[4px] select-none opacity-40">
                  {formatPrice(signal.takeProfit1)}
                </span>
              ) : (
                <span className="font-mono font-medium text-slate-900">
                  {formatPrice(signal.takeProfit1)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 w-11 font-normal">Entry</span>
              {isLocked ? (
                <span className="font-mono text-slate-400 blur-[4px] select-none opacity-40">
                  {formatPrice(signal.entryPrice)}
                </span>
              ) : (
                <span className="font-mono font-medium text-slate-900">
                  {formatPrice(signal.entryPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 w-11 font-normal">Stop</span>
              {isLocked ? (
                <span className="font-mono text-slate-400 blur-[4px] select-none opacity-40">
                  {formatPrice(signal.stopLoss)}
                </span>
              ) : (
                <span className="font-mono font-medium text-slate-900">
                  {formatPrice(signal.stopLoss)}
                </span>
              )}
            </div>
          </div>

          {/* Right Value: Confidence % */}
          <div className="text-right">
            <div className="font-display font-black text-2xl sm:text-3xl text-[#5338F5] leading-none tracking-tight">
              {signal.confidence}
              <span className="text-[#9333EA] font-extrabold">%</span>
            </div>
            <div className="text-xs font-semibold text-[#5338F5]/85 mt-1">
              Confidence
            </div>
          </div>
        </div>

        {/* Risk / Reward */}
        <div className="flex items-center justify-between text-xs sm:text-[13px] pt-1">
          <span className="text-slate-500 font-normal">Risk/Reward</span>
          <span className="font-mono font-bold text-slate-900">
            {signal.riskReward || '1:1.8'}
          </span>
        </div>
      </div>

      {/* Bottom Area (Divider + Button or Required Level Badge) */}
      <div className="pt-2">
        <div className="border-t border-slate-100 my-2.5" />

        {isLocked ? (
          /* Required Level Badge: EXACT UI MATCH to Card 2 & Card 4 */
          <div className="space-y-2.5">
            {/* Empty placeholder spacer matching validity row height */}
            <div className="h-4 sm:h-[18px]" />

            <div
              onClick={(e) => {
                e.stopPropagation();
                onUnlockPrompt(signal);
              }}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-[#5338F5] hover:text-[#4326cf] font-bold text-sm sm:text-[15px] transition-colors cursor-pointer select-none"
            >
              <Gem className="w-4.5 h-4.5 text-[#5338F5] stroke-[2.2] shrink-0" />
              <span>
                {signal.minLevel === 4 ? 'Level 4 and Above' : `Level ${signal.minLevel || 2} and Above`}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Time period + validity tags */}
            <div className="flex items-center justify-between text-xs font-medium px-0.5">
              <div className="flex items-center gap-1.5 text-[#5338F5]">
                <Clock className="w-3.5 h-3.5 text-[#5338F5] stroke-[2]" />
                <span>{signal.period || '30m period'}</span>
              </div>
              {isUnlockedByCredit ? (
                <div className="flex items-center gap-1 text-[#FD02B0] font-bold text-[11px] bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#FD02B0]" />
                  <span>Unlocked 24h</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <Hourglass className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                  <span>{signal.validity || 'valid for 12m'}</span>
                </div>
              )}
            </div>

            {/* Buy / Sell Button: EXACT UI MATCH to Card 1 & Card 3 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSignal(signal);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-indigo-200/90 bg-white hover:bg-slate-50/80 active:scale-[0.99] transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2 group/btn"
            >
              {isBuy ? (
                <>
                  <span className="font-bold text-sm sm:text-base text-[#65a30d]">Buy</span>
                  <ArrowRight className="w-4 h-4 text-[#65a30d] stroke-[2.5] group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  <span className="font-bold text-sm sm:text-base text-[#5338F5]">Sell</span>
                  <ArrowRight className="w-4 h-4 text-[#5338F5] stroke-[2.5] group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
