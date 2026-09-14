import React, { useState, useEffect, useRef } from 'react';
import {
  Broker,
  MarketSignal,
} from '../types';
import {
  Search,
  ChevronRight,
  Info,
  X,
  Gem,
  ExternalLink,
  Calculator,
  ArrowRightLeft,
  Scale,
  Activity,
  DollarSign,
  Sparkles,
  Target,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Clock,
  Coins,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  brokers: Broker[];
  signals: MarketSignal[];
  onSelectSignal: (signal: MarketSignal) => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onOpenViewPlan: () => void;
  onNavigateToTab: (tab: string) => void;
  onSelectBrokerDetail?: (broker: Broker) => void;
  onShowToast?: (msg: string) => void;
}

// ─────────────────────────────────────────────────────────────
// Custom Crisp Icons matching image.png exactly
// ─────────────────────────────────────────────────────────────

/**
 * EU & US flag pair for EUR/USD
 */
function EurUsdFlags() {
  return (
    <div className="flex items-center -space-x-1 shrink-0">
      {/* EU Flag */}
      <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#003399]">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#FFCC00]">
          <circle cx="12" cy="3.5" r="0.9" />
          <circle cx="16.2" cy="4.6" r="0.9" />
          <circle cx="19.3" cy="7.7" r="0.9" />
          <circle cx="20.5" cy="12" r="0.9" />
          <circle cx="19.3" cy="16.3" r="0.9" />
          <circle cx="16.2" cy="19.4" r="0.9" />
          <circle cx="12" cy="20.5" r="0.9" />
          <circle cx="7.8" cy="19.4" r="0.9" />
          <circle cx="4.7" cy="16.3" r="0.9" />
          <circle cx="3.5" cy="12" r="0.9" />
          <circle cx="4.7" cy="7.7" r="0.9" />
          <circle cx="7.8" cy="4.6" r="0.9" />
        </svg>
      </div>
      {/* US Flag */}
      <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#B22234]">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <rect width="24" height="24" fill="#B22234" />
          <rect y="3.5" width="24" height="3" fill="white" />
          <rect y="10" width="24" height="3" fill="white" />
          <rect y="16.5" width="24" height="3" fill="white" />
          <rect width="11" height="12" fill="#3C3B6E" />
          <circle cx="3" cy="3" r="0.8" fill="white" />
          <circle cx="8" cy="3" r="0.8" fill="white" />
          <circle cx="5.5" cy="6" r="0.8" fill="white" />
          <circle cx="3" cy="9" r="0.8" fill="white" />
          <circle cx="8" cy="9" r="0.8" fill="white" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Official Google G 4-color icon
 */
function GoogleGIcon() {
  return (
    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    </div>
  );
}

/**
 * Bitcoin icon
 */
function BitcoinIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-[#F7931A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
      ₿
    </div>
  );
}

/**
 * S&P 500 red badge
 */
function Sp500Icon() {
  return (
    <div className="w-5 h-5 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-black text-[9px] tracking-tight shrink-0 shadow-2xs">
      500
    </div>
  );
}

/**
 * XAU/USD Gold bullion icon
 */
function GoldIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white flex items-center justify-center shrink-0 shadow-2xs">
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M4 18h16v3H4zM2 12h9v3H2zm11 0h9v3h-9zM6 6h12v3H6z" opacity="0.9" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Search Categories & Tabs
// ─────────────────────────────────────────────────────────────
type SearchCategoryTab =
  | 'all'
  | 'signals'
  | 'trading-calculators'
  | 'converter-calculators'
  | 'brokers'
  | 'broker-comparison';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  brokers,
  signals,
  onSelectSignal,
  onOpenConnectModal,
  onOpenViewPlan,
  onNavigateToTab,
  onSelectBrokerDetail,
  onShowToast,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SearchCategoryTab>('all');

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 3 Primary Brokers for Trusted Broker Network (HFM, Exness, XM)
  const hfmBroker = brokers.find((b) => b.name.includes('HFM')) || brokers[1] || brokers[0];
  const exnessBroker = brokers.find((b) => b.name.includes('Exness')) || brokers[2] || brokers[0];
  const xmBroker = brokers.find((b) => b.name.includes('XM')) || brokers[0];

  // 5 Canonical Signals from image.png
  const signalEurUsd = signals.find((s) => s.ticker === 'EUR/USD') || signals[0];
  const signalGoogl = signals.find((s) => s.ticker.includes('GOOG')) || {
    id: 'googl-stock',
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    action: 'SELL',
    price: 182.4,
    change24h: -0.11,
    timeframe: '1H',
    confidence: 74,
    entryPrice: 1.069,
    takeProfit1: 1.0696,
    takeProfit2: 1.071,
    stopLoss: 1.067,
    riskReward: '1:2.8',
    analysis: 'Intraday distribution pattern.',
    timestamp: '15m ago',
    flag: '🇬',
    assetClass: 'Stocks',
  };
  const signalBtc = signals.find((s) => s.ticker.includes('BTC')) || signals[1];
  const signalSp500 = signals.find((s) => s.ticker.includes('500')) || signals[3] || signals[0];
  const signalXau = signals.find((s) => s.ticker.includes('XAU') || s.ticker.includes('Gold')) || signals[2];

  // Filter signals based on search query
  const query = searchQuery.trim().toLowerCase();
  const showSignals =
    activeTab === 'all' || activeTab === 'signals';
  const showBrokers =
    activeTab === 'all' || activeTab === 'brokers';
  const showTradingCalc =
    activeTab === 'trading-calculators';
  const showConverterCalc =
    activeTab === 'converter-calculators';
  const showBrokerComparison =
    activeTab === 'broker-comparison';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex flex-col items-center pt-6 sm:pt-10 px-4 pb-12 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ─── Top Wide Search Input Bar (Exact match to image.png) ─── */}
      <div className="w-full max-w-[960px] relative">
        <div className="w-full h-11 sm:h-12 px-4 bg-white rounded-xl sm:rounded-2xl border border-[#5945F1] shadow-lg flex items-center gap-3 transition-all">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 shrink-0 stroke-[2]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Signal"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
            title="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── Main White Command Palette Card (Exact match to image.png) ─── */}
      <div className="w-full max-w-[960px] mt-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-7 animate-in zoom-in-95 duration-150">
        {/* ════════════ TOP FILTER TABS (EXACT MATCH TO image.png) ════════════ */}
        <div className="border-b border-slate-100 pb-3 flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar text-xs sm:text-sm font-medium">
          {/* Tab 1: All */}
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-1 cursor-pointer transition-all relative whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-[#0b1c30] font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#5945F1] after:rounded-full'
                : 'text-slate-600 hover:text-[#5945F1]'
            }`}
          >
            All
          </button>

          {/* Tab 2: Trading Signals */}
          <button
            onClick={() => setActiveTab('signals')}
            className={`pb-1 cursor-pointer transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'signals'
                ? 'text-[#0b1c30] font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#5945F1] after:rounded-full'
                : 'text-slate-600 hover:text-[#5945F1]'
            }`}
          >
            <span>Trading Signals</span>
            <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[10px] sm:text-[11px] font-bold">
              99+
            </span>
          </button>

          {/* Tab 3: Trading Calculators */}
          <button
            onClick={() => setActiveTab('trading-calculators')}
            className={`pb-1 cursor-pointer transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'trading-calculators'
                ? 'text-[#0b1c30] font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#5945F1] after:rounded-full'
                : 'text-slate-600 hover:text-[#5945F1]'
            }`}
          >
            <span>Trading Calculators</span>
            <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[10px] sm:text-[11px] font-bold">
              16
            </span>
          </button>

          {/* Tab 4: Converter Calculators */}
          <button
            onClick={() => setActiveTab('converter-calculators')}
            className={`pb-1 cursor-pointer transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'converter-calculators'
                ? 'text-[#0b1c30] font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#5945F1] after:rounded-full'
                : 'text-slate-600 hover:text-[#5945F1]'
            }`}
          >
            <span>Converter Calculators</span>
            <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[10px] sm:text-[11px] font-bold">
              11
            </span>
          </button>

          {/* Tab 5: Brokers List */}
          <button
            onClick={() => setActiveTab('brokers')}
            className={`pb-1 cursor-pointer transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'brokers'
                ? 'text-[#0b1c30] font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#5945F1] after:rounded-full'
                : 'text-slate-600 hover:text-[#5945F1]'
            }`}
          >
            <span>Brokers List</span>
            <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[10px] sm:text-[11px] font-bold">
              25
            </span>
          </button>

          {/* Tab 6: Broker Comparison */}
          <button
            onClick={() => setActiveTab('broker-comparison')}
            className={`pb-1 cursor-pointer transition-all relative whitespace-nowrap ${
              activeTab === 'broker-comparison'
                ? 'text-[#0b1c30] font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#5945F1] after:rounded-full'
                : 'text-slate-600 hover:text-[#5945F1]'
            }`}
          >
            Broker Comparison
          </button>
        </div>

        {/* ════════════ SECTION 1: Trading Signals (AT THE TOP IN image.png) ════════════ */}
        {showSignals && (
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                Trading Signals
              </h3>
              <button
                onClick={() => {
                  onNavigateToTab('signals');
                  onClose();
                }}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>More</span>
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Row 1: EUR/USD */}
              <div
                onClick={() => {
                  onSelectSignal(signalEurUsd);
                  onClose();
                }}
                className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
              >
                {/* Col 1: Flag & Asset Ticker */}
                <div className="flex items-center gap-3 w-32 sm:w-40 shrink-0">
                  <EurUsdFlags />
                  <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                    EUR/USD
                  </span>
                </div>

                {/* Col 2: Order Side */}
                <div className="w-28 sm:w-36 text-left">
                  <div className="text-xs sm:text-sm font-bold text-[#84CC16]">
                    BUY <span className="font-semibold text-xs text-[#84CC16]">(Long Term)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Order Side</div>
                </div>

                {/* Col 3: Confidence Rate */}
                <div className="w-24 sm:w-32 text-center">
                  <div className="text-sm sm:text-base font-bold text-[#5945F1]">70%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Confidence Rate</div>
                </div>

                {/* Col 4: Current & Target Price */}
                <div className="hidden sm:block w-36 text-left text-xs font-mono">
                  <div className="text-slate-500">
                    Current Price:<strong className="text-[#0b1c30] ml-1">1.0690</strong>
                  </div>
                  <div className="text-slate-500">
                    Target Priced:<strong className="text-[#0b1c30] ml-1">1.0696</strong>
                  </div>
                </div>

                {/* Col 5: Expected Move */}
                <div className="w-28 sm:w-36 text-right">
                  <div className="text-xs sm:text-sm font-bold text-[#16a34a] flex items-center justify-end gap-1">
                    <span>▲</span>
                    <span>20 - 29PIPS</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Expected move</div>
                </div>
              </div>

              {/* Row 2: GOOGL */}
              <div
                onClick={() => {
                  onSelectSignal(signalGoogl);
                  onClose();
                }}
                className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
              >
                {/* Col 1 */}
                <div className="flex items-center gap-3 w-32 sm:w-40 shrink-0">
                  <GoogleGIcon />
                  <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                    GOOGL
                  </span>
                </div>

                {/* Col 2 */}
                <div className="w-28 sm:w-36 text-left">
                  <div className="text-xs sm:text-sm font-bold text-[#4F46E5]">
                    SELL <span className="font-semibold text-xs text-[#4F46E5]">(Intraday)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Order Side</div>
                </div>

                {/* Col 3 */}
                <div className="w-24 sm:w-32 text-center">
                  <div className="text-sm sm:text-base font-bold text-[#5945F1]">74%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Confidence Rate</div>
                </div>

                {/* Col 4 */}
                <div className="hidden sm:block w-36 text-left text-xs font-mono">
                  <div className="text-slate-500">
                    Current Price:<strong className="text-[#0b1c30] ml-1">1.0690</strong>
                  </div>
                  <div className="text-slate-500">
                    Target Priced:<strong className="text-[#0b1c30] ml-1">1.0696</strong>
                  </div>
                </div>

                {/* Col 5 */}
                <div className="w-28 sm:w-36 text-right">
                  <div className="text-xs sm:text-sm font-bold text-[#4F46E5] flex items-center justify-end gap-1">
                    <span>▼</span>
                    <span>25 - 40 PIPS</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Expected move</div>
                </div>
              </div>

              {/* Row 3: BTC/USD (Premium Signal - Exact match to image.png) */}
              <div className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                {/* Col 1 */}
                <div
                  onClick={() => {
                    onSelectSignal(signalBtc);
                    onClose();
                  }}
                  className="flex items-center gap-3 w-32 sm:w-40 shrink-0 cursor-pointer"
                >
                  <BitcoinIcon />
                  <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                    BTC/USD
                  </span>
                </div>

                {/* Premium Signal Tag & Unlock Message */}
                <div className="flex-1 flex items-center justify-between px-2 gap-3 min-w-0">
                  <div className="flex items-center gap-1.5 text-[#5945F1] shrink-0 font-semibold text-xs sm:text-sm">
                    <Gem className="w-4 h-4 fill-[#5945F1]" />
                    <span>Premium Signal</span>
                    <Info className="w-3.5 h-3.5 stroke-[2] opacity-80" />
                  </div>

                  <div className="hidden md:block text-xs sm:text-[13px] text-slate-500 font-medium truncate">
                    Higher levels only. Connect broker and trade to unlock.
                  </div>
                </div>

                {/* Plans Button */}
                <div className="w-24 sm:w-32 text-right shrink-0">
                  <button
                    onClick={() => {
                      onOpenViewPlan();
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-lg border border-[#e2d9fd] hover:border-[#5945F1] text-[#5945F1] font-bold text-xs hover:bg-[#f4f0ff] transition-all cursor-pointer inline-block"
                  >
                    Plans
                  </button>
                </div>
              </div>

              {/* Row 4: S&P 500 */}
              <div
                onClick={() => {
                  onSelectSignal(signalSp500);
                  onClose();
                }}
                className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
              >
                {/* Col 1 */}
                <div className="flex items-center gap-3 w-32 sm:w-40 shrink-0">
                  <Sp500Icon />
                  <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                    S&P 500
                  </span>
                </div>

                {/* Col 2 */}
                <div className="w-28 sm:w-36 text-left">
                  <div className="text-xs sm:text-sm font-bold text-[#84CC16]">
                    BUY <span className="font-semibold text-xs text-[#84CC16]">(Long Term)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Order Side</div>
                </div>

                {/* Col 3 */}
                <div className="w-24 sm:w-32 text-center">
                  <div className="text-sm sm:text-base font-bold text-[#5945F1]">71%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Confidence Rate</div>
                </div>

                {/* Col 4 */}
                <div className="hidden sm:block w-36 text-left text-xs font-mono">
                  <div className="text-slate-500">
                    Current Price:<strong className="text-[#0b1c30] ml-1">1.0690</strong>
                  </div>
                  <div className="text-slate-500">
                    Target Priced:<strong className="text-[#0b1c30] ml-1">1.0696</strong>
                  </div>
                </div>

                {/* Col 5 */}
                <div className="w-28 sm:w-36 text-right">
                  <div className="text-xs sm:text-sm font-bold text-[#16a34a] flex items-center justify-end gap-1">
                    <span>▲</span>
                    <span>20 - 29PIPS</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Expected move</div>
                </div>
              </div>

              {/* Row 5: XAU/USD */}
              <div
                onClick={() => {
                  onSelectSignal(signalXau);
                  onClose();
                }}
                className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
              >
                {/* Col 1 */}
                <div className="flex items-center gap-3 w-32 sm:w-40 shrink-0">
                  <GoldIcon />
                  <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                    XAU/USD
                  </span>
                </div>

                {/* Col 2 */}
                <div className="w-28 sm:w-36 text-left">
                  <div className="text-xs sm:text-sm font-bold text-[#4F46E5]">
                    SELL <span className="font-semibold text-xs text-[#4F46E5]">(Intraday)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Order Side</div>
                </div>

                {/* Col 3 */}
                <div className="w-24 sm:w-32 text-center">
                  <div className="text-sm sm:text-base font-bold text-[#5945F1]">73%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Confidence Rate</div>
                </div>

                {/* Col 4 */}
                <div className="hidden sm:block w-36 text-left text-xs font-mono">
                  <div className="text-slate-500">
                    Current Price:<strong className="text-[#0b1c30] ml-1">1.0690</strong>
                  </div>
                  <div className="text-slate-500">
                    Target Priced:<strong className="text-[#0b1c30] ml-1">1.0696</strong>
                  </div>
                </div>

                {/* Col 5 */}
                <div className="w-28 sm:w-36 text-right">
                  <div className="text-xs sm:text-sm font-bold text-[#4F46E5] flex items-center justify-end gap-1">
                    <span>▼</span>
                    <span>25 - 40 PIPS</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Expected move</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SECTION 2: Trusted Broker Network (UNDER SIGNALS IN image.png) ════════════ */}
        {showBrokers && (
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                Trusted Broker Network
              </h3>
              <button
                onClick={() => {
                  onNavigateToTab('brokers');
                  onClose();
                }}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>More</span>
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: HFM */}
              <div
                onClick={() => {
                  if (onSelectBrokerDetail) {
                    onSelectBrokerDetail(hfmBroker);
                  } else {
                    onOpenConnectModal(hfmBroker);
                  }
                  onClose();
                }}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-black text-white flex flex-col items-center justify-center p-1 shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="font-black text-xs tracking-tight leading-none">HFM</span>
                  <span className="text-[6px] uppercase font-semibold text-slate-400 tracking-wider scale-75 mt-0.5">
                    HF MARKETS
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#0b1c30]">HFM</div>
                  <div className="text-xs text-slate-500 font-medium">
                    Max Cashback: <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#FD02B0] text-white text-[10px] font-bold shadow-2xs">
                      Top Pick
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                      <span>Tier 1 Regulated</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Exness */}
              <div
                onClick={() => {
                  if (onSelectBrokerDetail) {
                    onSelectBrokerDetail(exnessBroker);
                  } else {
                    onOpenConnectModal(exnessBroker);
                  }
                  onClose();
                }}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFDE00] text-black flex items-center justify-center shrink-0 font-bold text-2xl tracking-tighter shadow-xs group-hover:scale-105 transition-transform">
                  ex
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#0b1c30]">Exness</div>
                  <div className="text-xs text-slate-500 font-medium">
                    Max Cashback: <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                      <span>Tier 1 Regulated</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: XM */}
              <div
                onClick={() => {
                  if (onSelectBrokerDetail) {
                    onSelectBrokerDetail(xmBroker);
                  } else {
                    onOpenConnectModal(xmBroker);
                  }
                  onClose();
                }}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0 relative overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E11928] rounded-full" />
                  <span className="font-black text-sm tracking-tighter">XM</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#0b1c30]">XM</div>
                  <div className="text-xs text-slate-500 font-medium">
                    Max Cashback: <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                      <span>Regulated</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ TAB: Trading Calculators ════════════ */}
        {showTradingCalc && (
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                Trading Calculators
              </h3>
              <button
                onClick={() => {
                  onNavigateToTab('calculators');
                  onClose();
                }}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>More</span>
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { name: 'Trading Timezone Converter', desc: 'Convert market sessions and monitor trading hours overlaps', tab: 'timezone-converter', icon: Clock },
                { name: 'Currency Converter', desc: 'Real-time global currency conversion and exchange rates', tab: 'currency-converter', icon: ArrowRightLeft },
                { name: 'Fibonacci Calculator', desc: 'Map levels where price may pause, reverse, or accelerate', tab: 'fibonacci-calculator', icon: TrendingUp },
                { name: 'Pivot Point Calculator', desc: 'Calculate classical support and resistance levels', tab: 'pivot-point-calculator', icon: Target },
                { name: 'Profit/Loss Calculator', desc: 'Calculate potential profit or loss before you trade', tab: 'profit-loss-calculator', icon: DollarSign },
                { name: 'Drawdown Calculator', desc: 'Track drawdown and plan your recovery', tab: 'drawdown-calculator', icon: TrendingUp },
                { name: 'Compound Calculator', desc: 'See how reinvested gains can build over time', tab: 'compound-calculator', icon: Calculator },
                { name: 'Position Size Calculator', desc: 'Calculate exact lot sizing and risk management', tab: 'position-size-calculator', icon: Target },
                { name: 'Stop Loss Take Profit', desc: 'Real-time Risk/Reward projection and pip targets', tab: 'sltp-calculator', icon: TrendingUp },
                { name: 'Stop-out Calculator', desc: 'Find your margin call and stop-out price buffers', tab: 'stop-out-calculator', icon: ShieldAlert },
                { name: 'Leverage Calculator', desc: 'Determine safe leverage with advance risk assessment', tab: 'leverage-calculator', icon: Calculator },
                { name: 'Volatility Calculator', desc: 'Measure market volatility and expected range', tab: 'volatility-calculator', icon: Activity },
                { name: 'Spread Calculator', desc: 'See what spreads cost before you place a trade', tab: 'spread-calculator', icon: ArrowRightLeft },
                { name: 'Pip Calculator', desc: 'Measure pip value before placing your trade', tab: 'pip-calculator', icon: DollarSign },
                { name: 'Margin Calculator', desc: 'Calculate required margin before you trade', tab: 'margin-calculator', icon: Scale },
                { name: 'Rebate Calculator', desc: 'See how much cashback your trades can earn', tab: 'rebate-calculator', icon: Sparkles },
              ].map((calc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onNavigateToTab(calc.tab);
                    onClose();
                  }}
                  className="border border-slate-200/80 rounded-2xl p-4 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ECEAFE] text-[#5945F1] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <calc.icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                    {calc.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{calc.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ TAB: Converter Calculators ════════════ */}
        {showConverterCalc && (
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                Converter Calculators
              </h3>
              <button
                onClick={() => {
                  onNavigateToTab('timezone-converter');
                  onClose();
                }}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>More</span>
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  onNavigateToTab('timezone-converter');
                  onClose();
                }}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white hover:border-[#5945F1] transition-all cursor-pointer"
              >
                <div className="font-bold text-sm text-[#0b1c30]">Trading Timezone Converter</div>
                <div className="text-xs text-slate-500 mt-1">Live market sessions, overlaps, and worldwide trading hours.</div>
              </div>
              <div
                onClick={() => {
                  onNavigateToTab('currency-converter');
                  onClose();
                }}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white hover:border-[#5945F1] transition-all cursor-pointer"
              >
                <div className="font-bold text-sm text-[#0b1c30]">Currency Converter</div>
                <div className="text-xs text-slate-500 mt-1">Live interbank rates across global fiat and currency pairs.</div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ TAB: Broker Comparison ════════════ */}
        {showBrokerComparison && (
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                Broker Comparison Matrix
              </h3>
              <button
                onClick={() => {
                  onNavigateToTab('brokers');
                  onClose();
                }}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>More</span>
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div
              onClick={() => {
                onNavigateToTab('brokers');
                onClose();
              }}
              className="border border-slate-200/80 rounded-2xl p-5 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 hover:border-[#5945F1] transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-sm text-[#0b1c30]">Compare Spreads, Regulation & Cashback Rates</div>
                <div className="text-xs text-slate-500 mt-1">
                  Side-by-side comparison of HFM, Exness, XM, IC Markets, and Pepperstone.
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-lg bg-[#5945F1] text-white text-xs font-bold shrink-0">
                Compare Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
