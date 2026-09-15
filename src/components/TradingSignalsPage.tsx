import React, { useState, useMemo } from 'react';
import { MarketSignal, Broker, UserProfile } from '../types';
import { REFERENCE_SIGNALS } from '../data/signalsReferenceData';
import { TabMain, TabMainItem } from './common/TabMain';
import {
  Search,
  SlidersHorizontal,
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
}) => {
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  // Advanced filters inside dropdown
  const [minConfidenceFilter, setMinConfidenceFilter] = useState<number>(0);
  const [actionFilter, setActionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

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

  // Categories list matching reference: All 99, Forex, Indices, Stocks, Commodities, Cryptos
  const categories: TabMainItem<string>[] = [
    { id: 'All', label: 'All', count: 99 },
    { id: 'Forex', label: 'Forex', count: 42 },
    { id: 'Indices', label: 'Indices', count: 18 },
    { id: 'Stocks', label: 'Stocks', count: 16 },
    { id: 'Commodities', label: 'Commodities', count: 12 },
    { id: 'Cryptos', label: 'Cryptos', count: 11 },
  ];

  // Filtered signals logic
  const filteredSignals = useMemo(() => {
    return allAvailableSignals.filter((sig) => {
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

      // Dropdown filters
      if (minConfidenceFilter > 0 && sig.confidence < minConfidenceFilter) {
        return false;
      }
      if (actionFilter === 'BUY' && sig.action !== 'BUY') return false;
      if (actionFilter === 'SELL' && sig.action !== 'SELL') return false;
      if (accessFilter === 'UNLOCKED' && sig.minLevel && sig.minLevel > user.tierLevel) return false;
      if (accessFilter === 'LOCKED' && (!sig.minLevel || sig.minLevel <= user.tierLevel)) return false;

      return true;
    });
  }, [allAvailableSignals, selectedCategory, searchQuery, minConfidenceFilter, actionFilter, accessFilter, user.tierLevel]);

  // Split into Top 8 (Rows 1 & 2) and Bottom 8 (Rows 3 & 4) for pagination page 1
  const displayedSignals = useMemo(() => {
    return filteredSignals.slice(0, 16);
  }, [filteredSignals]);

  const topSignals = displayedSignals.slice(0, 8);
  const bottomSignals = displayedSignals.slice(8, 16);

  // Asset icon helper with crisp visual badges
  const renderAssetIcon = (sig: MarketSignal) => {
    if (sig.ticker === 'EUR/JPY' || sig.ticker.includes('EUR')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#003399] flex items-center justify-center text-xs font-bold text-[#ffcc00] shrink-0 shadow-2xs">
          🇪🇺
        </div>
      );
    }
    if (sig.ticker.includes('Gas')) {
      return (
        <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sm shrink-0">
          💧
        </div>
      );
    }
    if (sig.ticker === 'BTC' || sig.ticker.includes('BTC')) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs">
          ₿
        </div>
      );
    }
    if (sig.ticker === 'USD/CAD' || sig.ticker.includes('USD/TRY') || sig.ticker.includes('USD')) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs">
          🇺🇸
        </div>
      );
    }
    if (sig.ticker === 'CHINA50') {
      return (
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-yellow-300 shrink-0 shadow-2xs">
          🇨🇳
        </div>
      );
    }
    if (sig.ticker === 'ETH') {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 text-xs font-bold shrink-0 shadow-2xs">
          ⟠
        </div>
      );
    }
    if (sig.ticker === 'NIKKEI') {
      return (
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
          🔴
        </div>
      );
    }
    if (sig.ticker === 'BRENT') {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-sm shrink-0">
          🛢️
        </div>
      );
    }
    if (sig.ticker.includes('AUD')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#00008b] flex items-center justify-center text-xs font-bold text-white shrink-0">
          🇦🇺
        </div>
      );
    }
    if (sig.ticker.includes('GBP')) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
          🇬🇧
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
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
        <div className="text-sm text-slate-600">
          <span className="font-bold text-[#0b1c30]">99 active signals</span>
          <span className="mx-2 text-slate-400">·</span>
          <span className="text-slate-500">Updated 2m ago</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto relative">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Signals"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5030e5]/30 focus:border-[#5030e5] text-slate-800 placeholder-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                showFilterDropdown || minConfidenceFilter > 0 || actionFilter !== 'ALL' || accessFilter !== 'ALL'
                  ? 'border-[#5030e5] bg-[#5030e5]/10 text-[#5030e5]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs'
              }`}
              title="Filter Options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showFilterDropdown && (
              <div className="absolute right-0 top-11 z-30 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-[#0b1c30]">Signal Filters</span>
                  <button
                    onClick={() => {
                      setMinConfidenceFilter(0);
                      setActionFilter('ALL');
                      setAccessFilter('ALL');
                    }}
                    className="text-[11px] text-[#5030e5] hover:underline font-semibold"
                  >
                    Reset All
                  </button>
                </div>

                {/* Min Confidence */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Min Confidence:</span>
                    <span className="font-bold text-[#5030e5]">
                      {minConfidenceFilter > 0 ? `${minConfidenceFilter}%+` : 'Any'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 70, 80, 90].map((val) => (
                      <button
                        key={val}
                        onClick={() => setMinConfidenceFilter(val)}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          minConfidenceFilter === val
                            ? 'bg-[#5030e5] text-white border-[#5030e5]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {val === 0 ? 'All' : `${val}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Filter */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-600">Direction:</span>
                  <div className="flex gap-1.5">
                    {(['ALL', 'BUY', 'SELL'] as const).map((act) => (
                      <button
                        key={act}
                        onClick={() => setActionFilter(act)}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          actionFilter === act
                            ? 'bg-[#5030e5] text-white border-[#5030e5]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Access Level Filter */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-600">Access Tier:</span>
                  <div className="flex gap-1.5">
                    {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map((acc) => (
                      <button
                        key={acc}
                        onClick={() => setAccessFilter(acc)}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          accessFilter === acc
                            ? 'bg-[#5030e5] text-white border-[#5030e5]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN CONTENT (4-COL GRID + RIGHT SIDEBAR) ─── */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        {/* LEFT COLUMN: SIGNALS GRID (4 CARDS PER ROW) */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* Top 8 Cards (Rows 1 & 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {topSignals.map((sig) => (
              <SignalCard
                key={sig.id}
                signal={sig}
                userTierLevel={user.tierLevel}
                onSelectSignal={onSelectSignal}
                onUpgradePrompt={onUpgradePrompt}
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
                onSelectSignal={onSelectSignal}
                onUpgradePrompt={onUpgradePrompt}
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
        </div>

        {/* RIGHT COLUMN: 3 STACKED CARDS (Fixed 300px on XL) */}
        <div className="w-full xl:w-[300px] xl:shrink-0">
          <div className="space-y-5 xl:sticky xl:top-[84px] xl:max-h-[calc(100vh-96px)] xl:overflow-y-auto xl:overscroll-contain sidebar-scrollbar">
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
        </div>
      </div>
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
    </div>
  );
};

// ─── SUB-COMPONENT: SignalCard ───
interface SignalCardProps {
  signal: MarketSignal;
  userTierLevel: number;
  onSelectSignal: (sig: MarketSignal) => void;
  onUpgradePrompt: () => void;
  renderAssetIcon: (sig: MarketSignal) => React.ReactNode;
}

const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  userTierLevel,
  onSelectSignal,
  onUpgradePrompt,
  renderAssetIcon,
}) => {
  const isLocked = Boolean(signal.minLevel && signal.minLevel > userTierLevel);
  const isBuy = signal.action === 'BUY';

  // Format price helper
  const formatPrice = (val: number) => {
    if (val > 1000) return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    if (val > 10) return val.toFixed(3);
    return val.toFixed(4);
  };

  return (
    <div
      onClick={() => {
        if (isLocked) {
          onUpgradePrompt();
        } else {
          onSelectSignal(signal);
        }
      }}
      className="bg-white rounded-2xl border border-slate-200/85 hover:border-[#5030e5]/60 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group relative"
    >
      <div className="space-y-3">
        {/* Top Header Row: Asset Icon & Name */}
        <div className="flex items-center gap-2.5">
          {renderAssetIcon(signal)}
          <span className="font-bold text-[#0b1c30] text-[15px] group-hover:text-[#5030e5] transition-colors leading-tight">
            {signal.name || signal.ticker}
          </span>
        </div>

        {/* Middle Metrics Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Values: Target, Entry, Stop */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-10">Target</span>
              {isLocked ? (
                <span className="font-mono text-slate-300 blur-[3px] select-none">162.75</span>
              ) : (
                <span className="font-semibold text-slate-700">{formatPrice(signal.takeProfit1)}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-10">Entry</span>
              {isLocked ? (
                <span className="font-mono text-slate-300 blur-[3px] select-none">162.10</span>
              ) : (
                <span className="font-semibold text-slate-700">{formatPrice(signal.entryPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-10">Stop</span>
              {isLocked ? (
                <span className="font-mono text-slate-300 blur-[3px] select-none">161.35</span>
              ) : (
                <span className="font-semibold text-slate-700">{formatPrice(signal.stopLoss)}</span>
              )}
            </div>
          </div>

          {/* Right Value: Confidence % */}
          <div className="text-right">
            <div className="text-2xl font-extrabold text-[#5030e5] leading-none tracking-tight">
              {signal.confidence}%
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Confidence
            </div>
          </div>
        </div>

        {/* Risk / Reward */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-400">Risk/Reward</span>
          <span className="font-semibold text-slate-700">{signal.riskReward || '1:1.8'}</span>
        </div>
      </div>

      {/* Bottom Info / Button Area */}
      <div className="pt-3 space-y-2">
        {isLocked ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpgradePrompt();
            }}
            className="w-full py-1.5 px-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-[#5030e5] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
          >
            <Gem className="w-3.5 h-3.5 text-[#5030e5]" />
            <span>
              {signal.minLevel === 4 ? 'Level 4' : `Level ${signal.minLevel || 2} and Above`}
            </span>
          </button>
        ) : (
          <>
            {/* Time period + validity tags */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-0.5">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{signal.period || '30m period'}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Hourglass className="w-3 h-3 text-emerald-600" />
                <span>{signal.validity || 'valid for 12m'}</span>
              </div>
            </div>

            {/* Buy / Sell Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSignal(signal);
              }}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                isBuy
                  ? 'border border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 text-amber-700'
                  : 'border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-[#5030e5]'
              }`}
            >
              <span>{isBuy ? 'Buy' : 'Sell'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
