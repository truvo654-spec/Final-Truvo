import React, { useState, useMemo } from 'react';
import { MarketSignal, Broker, UserProfile } from '../../types';
import {
  Clock,
  Hourglass,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  ChevronDown,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface TradingSignalDetailPageProps {
  signal?: MarketSignal | null;
  user: UserProfile;
  brokers: Broker[];
  onBackToSignals: () => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onOpenViewPlan: () => void;
  onConnectBroker: (broker: Broker) => void;
  onNavigateToBrokers?: () => void;
  onNavigateToComparison?: () => void;
  onShowToast: (msg: string) => void;
}

// Sample Candlestick Candle structure
interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: string;
}

export const TradingSignalDetailPage: React.FC<TradingSignalDetailPageProps> = ({
  signal: incomingSignal,
  user,
  brokers,
  onBackToSignals,
  onSelectSignal,
  onOpenViewPlan,
  onConnectBroker,
  onNavigateToBrokers,
  onNavigateToComparison,
  onShowToast,
}) => {
  // Fallback to EUR/JPY if no signal or incoming matches screenshot
  const activeSignal: MarketSignal = useMemo(() => {
    if (incomingSignal) return incomingSignal;
    return {
      id: 'sig-eurjpy',
      ticker: 'EUR/JPY',
      assetClass: 'Forex',
      name: 'EUR/JPY',
      flag: '🇪🇺🇯🇵',
      action: 'BUY',
      price: 171.84,
      change24h: 0.35,
      sparkline: [171.2, 171.4, 171.1, 171.6, 171.84],
      analysis: 'Bullish momentum holding above 20 EMA with rising RSI.',
      entryPrice: 162.10,
      takeProfit1: 162.75,
      takeProfit2: 163.40,
      stopLoss: 161.35,
      riskReward: '1:2',
      confidence: 71,
      timeframe: '30m',
      validity: 'Valid until 27/05/26 • 15:30 GMT+7',
      period: '30m period',
      type: 'Currency',
      group: 'Major Crosses',
      timestamp: 'As of May 27, 2026 09:45 GMT+7',
      minLevel: 1,
    };
  }, [incomingSignal]);

  const [activeTimeframe, setActiveTimeframe] = useState<'1m' | '30m' | '1h'>('30m');
  const [chartType, setChartType] = useState<'candle' | 'line' | 'bar'>('candle');
  const [showIndicators, setShowIndicators] = useState<boolean>(false);
  const [enableMA, setEnableMA] = useState<boolean>(true);
  const [enableVolume, setEnableVolume] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [isQuickTradeModalOpen, setIsQuickTradeModalOpen] = useState(false);
  const [isPlaceTradeModalOpen, setIsPlaceTradeModalOpen] = useState(false);
  const [placeTradeScenario, setPlaceTradeScenario] = useState<'auto' | 'connected' | 'not-connected'>('auto');
  const [currentBrokerPage, setCurrentBrokerPage] = useState(1);
  const [selectedTradeBrokerName, setSelectedTradeBrokerName] = useState<string>('XM');
  const [tradeLotSize, setTradeLotSize] = useState<string>('1.0');
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'technical'>('overview');

  const isBuy = activeSignal.action === 'BUY';

  // Determine whether user has connected brokers for the Place Trade modal
  const effectiveHasConnected = useMemo(() => {
    if (placeTradeScenario === 'connected') return true;
    if (placeTradeScenario === 'not-connected') return false;
    return brokers.some((b) => b.connected);
  }, [placeTradeScenario, brokers]);

  // Fixed simulated candles matching EUR/JPY behavior in reference image
  // Screenshot shows hourly candles from 08:00 to 16:00 oscillating between 170.96 and 172.01
  const candleData: Candle[] = useMemo(() => {
    return [
      { time: '08:00', open: 171.30, high: 171.55, low: 171.18, close: 171.48, volume: '¥1.8M' },
      { time: '08:15', open: 171.48, high: 171.60, low: 171.32, close: 171.38, volume: '¥1.4M' },
      { time: '08:30', open: 171.38, high: 171.45, low: 171.10, close: 171.15, volume: '¥2.1M' },
      { time: '08:45', open: 171.15, high: 171.30, low: 171.02, close: 171.25, volume: '¥1.9M' },
      { time: '09:00', open: 171.25, high: 171.40, low: 170.96, close: 171.35, volume: '¥2.6M' },
      { time: '09:15', open: 171.35, high: 171.45, low: 171.20, close: 171.28, volume: '¥1.5M' },
      { time: '09:30', open: 171.28, high: 171.55, low: 171.25, close: 171.50, volume: '¥2.0M' },
      { time: '09:45', open: 171.50, high: 171.85, low: 171.40, close: 171.80, volume: '¥3.8M' },
      { time: '10:00', open: 171.80, high: 172.01, low: 171.65, close: 171.95, volume: '¥4.2M' },
      { time: '10:15', open: 171.95, high: 172.00, low: 171.70, close: 171.75, volume: '¥2.4M' },
      { time: '10:30', open: 171.75, high: 171.90, low: 171.60, close: 171.88, volume: '¥2.2M' },
      { time: '10:45', open: 171.88, high: 171.98, low: 171.72, close: 171.90, volume: '¥2.9M' },
      { time: '11:00', open: 171.90, high: 171.95, low: 171.50, close: 171.58, volume: '¥3.1M' },
      { time: '11:15', open: 171.58, high: 171.75, low: 171.45, close: 171.65, volume: '¥2.0M' },
      { time: '11:30', open: 171.65, high: 171.80, low: 171.55, close: 171.60, volume: '¥1.7M' },
      { time: '11:45', open: 171.60, high: 171.70, low: 171.40, close: 171.45, volume: '¥1.9M' },
      { time: '12:00', open: 171.45, high: 171.80, low: 171.35, close: 171.72, volume: '¥3.4M' },
      { time: '12:15', open: 171.72, high: 171.85, low: 171.60, close: 171.68, volume: '¥2.1M' },
      { time: '12:30', open: 171.68, high: 171.92, low: 171.65, close: 171.88, volume: '¥2.5M' },
      { time: '12:45', open: 171.88, high: 172.00, low: 171.80, close: 171.96, volume: '¥3.0M' },
      { time: '13:00', open: 171.96, high: 172.01, low: 171.50, close: 171.60, volume: '¥3.7M' },
      { time: '13:15', open: 171.60, high: 171.75, low: 171.45, close: 171.52, volume: '¥2.2M' },
      { time: '13:30', open: 171.52, high: 171.65, low: 171.35, close: 171.42, volume: '¥2.8M' },
      { time: '13:45', open: 171.42, high: 171.55, low: 171.20, close: 171.30, volume: '¥3.1M' },
      { time: '14:00', open: 171.30, high: 171.60, low: 171.18, close: 171.55, volume: '¥3.5M' },
      { time: '14:15', open: 171.55, high: 171.70, low: 171.40, close: 171.48, volume: '¥2.3M' },
      { time: '14:30', open: 171.48, high: 171.80, low: 171.35, close: 171.75, volume: '¥2.9M' },
      { time: '14:45', open: 171.75, high: 171.90, low: 171.65, close: 171.82, volume: '¥3.2M' },
      { time: '15:00', open: 171.82, high: 171.98, low: 171.55, close: 171.60, volume: '¥4.1M' },
      { time: '15:15', open: 171.60, high: 171.85, low: 171.45, close: 171.84, volume: '¥4.5M' },
    ];
  }, []);

  // Most recent signals list in right sidebar (Matching screenshot items exactly)
  const recentSidebarSignals = [
    {
      ticker: 'EUR/USD',
      name: 'EUR/USD',
      change: '+0.33%',
      isUp: true,
      action: 'BUY',
      isPremium: false,
      price: 1.0872,
      entryPrice: 1.0850,
      takeProfit1: 1.0910,
      stopLoss: 1.0820,
      confidence: 76,
      sparkline: 'M0,14 Q8,8 16,12 T32,6 T48,10 T64,4',
    },
    {
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      change: '-0.11%',
      isUp: false,
      action: 'SELL',
      isPremium: false,
      price: 174.50,
      entryPrice: 175.20,
      takeProfit1: 171.80,
      stopLoss: 177.00,
      confidence: 68,
      sparkline: 'M0,6 Q8,12 16,10 T32,16 T48,12 T64,18',
    },
    {
      ticker: 'BTC/USD',
      name: 'Bitcoin',
      change: '+2.41%',
      isUp: true,
      action: 'UPGRADE',
      isPremium: true,
      price: 68450.00,
      entryPrice: 67900.00,
      takeProfit1: 71200.00,
      stopLoss: 66500.00,
      confidence: 84,
      sparkline: 'M0,16 Q8,6 16,10 T32,4 T48,8 T64,2',
    },
    {
      ticker: 'S&P 500',
      name: 'S&P 500 Index',
      change: '+0.44%',
      isUp: true,
      action: 'BUY',
      isPremium: false,
      price: 5321.40,
      entryPrice: 5310.00,
      takeProfit1: 5350.00,
      stopLoss: 5290.00,
      confidence: 79,
      sparkline: 'M0,12 Q8,10 16,6 T32,8 T48,4 T64,3',
    },
    {
      ticker: 'XAU/USD',
      name: 'Gold / USD',
      change: '+0.24%',
      isUp: true,
      action: 'BUY',
      isPremium: false,
      price: 2384.60,
      entryPrice: 2378.00,
      takeProfit1: 2410.00,
      stopLoss: 2362.00,
      confidence: 82,
      sparkline: 'M0,14 Q8,12 16,7 T32,11 T48,5 T64,4',
    },
  ];

  // Helper for dual flags / asset logos matching screenshot
  const renderDualFlag = (ticker: string) => {
    if (ticker.includes('EUR/JPY') || ticker === 'EUR/JPY') {
      return (
        <div className="flex items-center -space-x-1 shrink-0">
          {/* EU Flag */}
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-xs bg-[#003399] flex items-center justify-center">
            <span className="text-[11px] text-yellow-300">★</span>
          </div>
          {/* Japan Flag */}
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-xs bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#bc002d]" />
          </div>
        </div>
      );
    }

    if (ticker.includes('EUR/USD')) {
      return (
        <div className="flex items-center -space-x-1 shrink-0">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-xs bg-[#003399] flex items-center justify-center">
            <span className="text-[11px] text-yellow-300">★</span>
          </div>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-xs bg-[#b22234] flex items-center justify-center text-[10px] text-white font-bold">
            🇺🇸
          </div>
        </div>
      );
    }

    if (ticker.includes('GOOGL')) {
      return (
        <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        </div>
      );
    }

    if (ticker.includes('BTC')) {
      return (
        <div className="w-7 h-7 rounded-full bg-[#f7931a] text-white flex items-center justify-center font-bold text-xs shadow-xs">
          ₿
        </div>
      );
    }

    if (ticker.includes('S&P') || ticker.includes('500')) {
      return (
        <div className="w-7 h-7 rounded-full bg-[#dc2626] text-white flex items-center justify-center font-extrabold text-[10px] tracking-tighter shadow-xs">
          500
        </div>
      );
    }

    if (ticker.includes('XAU') || ticker.includes('Gold')) {
      return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 flex items-center justify-center text-xs font-black shadow-xs">
          AU
        </div>
      );
    }

    // Default icon
    return (
      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-[#5945F1]">
        {ticker.slice(0, 3)}
      </div>
    );
  };

  // Connected Brokers list for "Where would you like to place it?" modal (Matches screenshot exactly)
  interface PlaceTradeBroker {
    id: string;
    name: string;
    verified: boolean;
    cashbackValue: string;
    maxCashback: string;
    logoType: 'xm' | 'hfm' | 'exness' | 'pepperstone' | 'icmarkets' | 'fxpro';
  }

  const placeTradeBrokers: PlaceTradeBroker[] = [
    {
      id: 'xm',
      name: 'XM',
      verified: true,
      cashbackValue: '$8.00',
      maxCashback: 'Max Cashback',
      logoType: 'xm',
    },
    {
      id: 'hfm',
      name: 'HFM',
      verified: true,
      cashbackValue: '$8.00',
      maxCashback: 'Max Cashback',
      logoType: 'hfm',
    },
    {
      id: 'exness',
      name: 'Exness',
      verified: true,
      cashbackValue: '$8.00',
      maxCashback: 'Max Cashback',
      logoType: 'exness',
    },
    {
      id: 'pepperstone',
      name: 'Pepperstone',
      verified: false,
      cashbackValue: '$8.00',
      maxCashback: 'Max Cashback',
      logoType: 'pepperstone',
    },
    {
      id: 'icmarkets',
      name: 'IC Markets',
      verified: false,
      cashbackValue: '$8.00',
      maxCashback: 'Max Cashback',
      logoType: 'icmarkets',
    },
    {
      id: 'fxpro',
      name: 'Fx Pro',
      verified: false,
      cashbackValue: '$8.00',
      maxCashback: 'Max Cashback',
      logoType: 'fxpro',
    },
  ];

  // Render broker logo for Place Trade popup matching screenshot
  const renderPlaceBrokerLogo = (logoType: PlaceTradeBroker['logoType']) => {
    switch (logoType) {
      case 'xm':
        return (
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-xs">
            <div className="flex items-center text-white font-black text-sm tracking-tight">
              <span className="text-white text-base font-black">X</span>
              <span className="text-[#E02B20] text-base font-black ml-0.5">M</span>
            </div>
          </div>
        );
      case 'hfm':
        return (
          <div className="w-12 h-12 rounded-xl bg-black flex flex-col items-center justify-center p-1 shadow-xs">
            <span className="text-white font-extrabold text-xs tracking-wider">HFM</span>
            <div className="h-0.5 w-6 bg-red-600 my-0.5" />
            <span className="text-[5.5px] text-white font-bold tracking-tighter uppercase leading-none">
              MARKETS
            </span>
          </div>
        );
      case 'exness':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#FCD303] flex items-center justify-center text-black font-black text-xl shadow-xs">
            ex
          </div>
        );
      case 'pepperstone':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#0066FF] flex flex-col items-center justify-center p-1 text-white shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M6 3h7a5 5 0 0 1 5 5 5 5 0 0 1-5 5H9v8H6V3zm3 3v4h4a2 2 0 0 0 2-2 2 2 0 0 0-2-2H9z" />
            </svg>
            <span className="text-[6.5px] font-bold tracking-tight lowercase leading-none mt-0.5">
              pepperstone
            </span>
          </div>
        );
      case 'icmarkets':
        return (
          <div className="w-12 h-12 rounded-xl bg-black flex flex-col items-center justify-center p-1 text-white shadow-xs">
            <div className="flex items-end gap-0.5 h-3 mb-0.5">
              <span className="w-0.5 h-2 bg-[#00E575] rounded-xs" />
              <span className="w-0.5 h-3 bg-[#00E575] rounded-xs" />
              <span className="w-0.5 h-2.5 bg-[#00E575] rounded-xs" />
              <span className="text-white font-black text-[9px] ml-0.5 leading-none">IC</span>
            </div>
            <span className="text-[6px] font-bold text-white tracking-tight leading-none">Markets</span>
            <span className="text-[5px] text-slate-400 font-medium tracking-tight leading-none mt-0.5">Global</span>
          </div>
        );
      case 'fxpro':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#DC2626] flex flex-col items-center justify-center p-1 text-white shadow-xs">
            <span className="text-white font-black text-xs tracking-tight">FxPro</span>
            <span className="text-[5px] text-white/90 font-medium tracking-tighter leading-none mt-0.5">
              Trade Like a Pro
            </span>
          </div>
        );
    }
  };

  const handleSelectBrokerToPlace = (broker: PlaceTradeBroker) => {
    setSelectedTradeBrokerName(broker.name);
    setIsPlaceTradeModalOpen(false);
    setIsQuickTradeModalOpen(true);
  };

  // Quick execution modal handler
  const handleExecuteTrade = () => {
    const lot = parseFloat(tradeLotSize) || 1.0;
    const estimatedCashback = (lot * 8.5 * (1 + (user.boostPercentage || 10) / 100)).toFixed(2);
    onShowToast(`🚀 Order placed with ${selectedTradeBrokerName}: ${activeSignal.action} ${lot} lot(s) of ${activeSignal.ticker}! Cashback +$${estimatedCashback}`);
    setIsQuickTradeModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Top Back Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={onBackToSignals}
          className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#5945F1] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Trading Signals</span>
        </button>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Signals</span>
          <span>/</span>
          <span className="text-[#0b1c30] font-semibold">{activeSignal.ticker}</span>
        </div>
      </div>

      {/* ─── TOP SECTION: SIGNAL HERO OVERVIEW BAR ─── */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left Block: Asset Ticker, Dual Flags, Price, Time */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
              {activeSignal.ticker}
            </h1>

            <div className="flex items-center gap-3">
              {renderDualFlag(activeSignal.ticker)}
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-[#0b1c30] tracking-tight">
                  {activeSignal.price > 100
                    ? activeSignal.price.toFixed(2)
                    : activeSignal.price.toFixed(4)}
                </span>
                <span
                  className={`text-lg sm:text-xl font-bold ${
                    isBuy ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {isBuy ? '↑' : '↓'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-normal">
              {activeSignal.timestamp || 'As of May 27, 2026 09:45 GMT+7'}
            </p>
          </div>

          {/* Center 4 Core Metrics: Entry, Target, Stop Loss, Risk/Reward */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-2 border-y lg:border-y-0 border-slate-100">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 block font-normal">Entry Price</span>
              <span className="text-base sm:text-lg font-bold text-[#0b1c30] tracking-tight">
                {activeSignal.entryPrice.toFixed(activeSignal.price > 100 ? 2 : 4)}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 block font-normal">Target Price</span>
              <span className="text-base sm:text-lg font-bold text-[#0b1c30] tracking-tight">
                {activeSignal.takeProfit1.toFixed(activeSignal.price > 100 ? 2 : 4)}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 block font-normal">Stop Loss</span>
              <span className="text-base sm:text-lg font-bold text-[#0b1c30] tracking-tight">
                {activeSignal.stopLoss.toFixed(activeSignal.price > 100 ? 2 : 4)}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 block font-normal">Risk/Reward</span>
              <span className="text-base sm:text-lg font-bold text-[#0b1c30] tracking-tight">
                {activeSignal.riskReward || '1:2'}
              </span>
            </div>
          </div>

          {/* Confidence Rate with 5 Dots */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-center lg:text-left">
              <div className="text-3xl font-black text-[#5945F1] leading-none">
                {activeSignal.confidence}%
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5 my-1.5">
                {[1, 2, 3, 4, 5].map((dotIndex) => {
                  const filled = dotIndex <= Math.round((activeSignal.confidence / 100) * 5);
                  return (
                    <span
                      key={dotIndex}
                      className={`w-2 h-2 rounded-full ${
                        filled ? 'bg-[#5945F1]' : 'bg-indigo-100'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[11px] text-slate-600 font-medium block">
                Confidence Rate
              </span>
            </div>
          </div>

          {/* Right Action: Validity + Bright Lime Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3">
            <div className="space-y-1 text-right sm:text-left lg:text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs text-indigo-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#5945F1]" />
                <span>{activeSignal.period || '30m period'}</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-emerald-600 font-medium">
                <Hourglass className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeSignal.validity || 'Valid until 27/05/26 • 15:30 GMT+7'}</span>
                <HelpCircle className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>
            </div>

            {/* Vibrant Lime Green Buy / Sell Button (Matching Screenshot) */}
            <button
              onClick={() => setIsPlaceTradeModalOpen(true)}
              className="px-7 py-2.5 rounded-lg bg-[#CAEB0E] hover:bg-[#bce000] active:scale-98 text-slate-950 font-extrabold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isBuy ? 'Buy' : 'Sell'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Divider line */}
        <div className="border-b border-slate-200/80 my-3.5" />

        {/* Metadata Line under separator: Type & Group (Right Aligned matching screenshot) */}
        <div className="flex items-center justify-end gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Type</span>
            <span className="font-bold text-[#0b1c30]">{activeSignal.type || 'Currency'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Group</span>
            <span className="font-bold text-[#0b1c30]">{activeSignal.group || 'Major Crosses'}</span>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT GRID: 8 COLS CHART + 4 COLS SIDEBAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── LEFT COLUMN: CANDLESTICK CHART MODULE (8 Cols) ─── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col">
            {/* Chart Toolbar Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              {/* Left controls: Timeframes & Chart types */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Timeframe selector */}
                <div className="flex items-center gap-1">
                  {(['1m', '30m', '1h'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setActiveTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        activeTimeframe === tf
                          ? 'text-[#5945F1] bg-indigo-50 font-extrabold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tf} {tf === '1h' && <ChevronDown className="w-3 h-3 inline ml-0.5" />}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-slate-200" />

                {/* Chart Style: Candlestick, Line, Bar */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChartType('candle')}
                    title="Candlestick Chart"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      chartType === 'candle'
                        ? 'text-[#5945F1] bg-indigo-50'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {/* Candlestick icon */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-[2]">
                      <line x1="9" y1="2" x2="9" y2="22" />
                      <rect x="6" y="6" width="6" height="12" rx="1" fill="currentColor" />
                      <line x1="17" y1="6" x2="17" y2="18" />
                      <rect x="14" y="9" width="6" height="6" rx="1" fill="currentColor" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setChartType('line')}
                    title="Line Chart"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      chartType === 'line'
                        ? 'text-[#5945F1] bg-indigo-50'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setChartType('bar')}
                    title="Bar Chart"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      chartType === 'bar'
                        ? 'text-[#5945F1] bg-indigo-50'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {/* Bar chart icon */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-[2]">
                      <line x1="8" y1="20" x2="8" y2="8" />
                      <line x1="8" y1="12" x2="12" y2="12" />
                      <line x1="16" y1="20" x2="16" y2="4" />
                      <line x1="12" y1="8" x2="16" y2="8" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right controls: Indicators & Fullscreen */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowIndicators(!showIndicators)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    showIndicators
                      ? 'text-[#5945F1] bg-indigo-50'
                      : 'text-slate-600 hover:text-[#5945F1]'
                  }`}
                >
                  <span className="font-serif italic font-bold">fx</span>
                  <span>Indicators</span>
                </button>

                <button
                  onClick={() => onShowToast('Fullscreen chart mode toggled')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                  title="Expand Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Technical Indicators Dropdown Panel */}
            {showIndicators && (
              <div className="py-2.5 px-3 my-2 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-150">
                <span className="font-bold text-[#0b1c30]">Active Overlays:</span>
                <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableMA}
                    onChange={(e) => setEnableMA(e.target.checked)}
                    className="rounded text-[#5945F1] focus:ring-0 cursor-pointer"
                  />
                  <span>Moving Average (20 EMA)</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVolume}
                    onChange={(e) => setEnableVolume(e.target.checked)}
                    className="rounded text-[#5945F1] focus:ring-0 cursor-pointer"
                  />
                  <span>Volume Bars</span>
                </label>
              </div>
            )}

            {/* OHLC Bar Header matching reference screenshot */}
            <div className="pt-3 pb-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0b1c30] text-sm">{activeSignal.ticker}</span>
                <span className="text-slate-500 font-medium">{activeTimeframe}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-700">
                  HFM
                </span>

                <div className="flex items-center gap-2 text-slate-700 font-mono text-xs pl-2">
                  <span>170.96</span>
                  <span className="text-[#5945F1] font-bold">171.58</span>
                  <span>H 172.01</span>
                  <span>L 170.96</span>
                  <span>C 171.22</span>
                </div>
              </div>
            </div>

            {/* ─── Candlestick Chart SVG Canvas ─── */}
            <div className="relative w-full h-[400px] sm:h-[460px] bg-white border border-slate-100 rounded-xl overflow-hidden mt-1 select-none">
              {/* Volume indicator at top-left inside chart matching screenshot */}
              <div className="absolute top-3.5 left-5 z-10 flex items-center gap-1.5 text-xs font-bold pointer-events-none select-none">
                <span className="text-slate-900 font-bold">Volume</span>
                <span className="text-[#5945F1] font-bold font-mono">¥32.5M</span>
              </div>

              {/* SVG Candlestick Rendering with Purple Theme */}
              <svg className="w-full h-full" viewBox="0 0 800 420" preserveAspectRatio="none">
                {/* Horizontal Grid lines with price ticks on right axis */}
                {[
                  { y: 30, price: '172.00' },
                  { y: 65, price: '171.87' },
                  { y: 100, price: '171.74' },
                  { y: 135, price: '171.61' },
                  { y: 170, price: '171.48' },
                  { y: 205, price: '171.35' },
                  { y: 240, price: '171.22' },
                  { y: 275, price: '171.09' },
                  { y: 310, price: '170.96' },
                  { y: 345, price: '170.83' },
                  { y: 380, price: '170.70' },
                ].map((g, idx) => (
                  <g key={idx}>
                    <line
                      x1="0"
                      y1={g.y}
                      x2="730"
                      y2={g.y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x="740"
                      y={g.y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {g.price}
                    </text>
                  </g>
                ))}

                {/* Vertical Hour Grid Lines */}
                {[
                  { x: 50, label: '08:00' },
                  { x: 135, label: '09:00' },
                  { x: 220, label: '10:00' },
                  { x: 305, label: '11:00' },
                  { x: 390, label: '12:00' },
                  { x: 475, label: '13:00' },
                  { x: 560, label: '14:00' },
                  { x: 645, label: '15:00' },
                  { x: 720, label: '16:00' },
                ].map((v, idx) => (
                  <g key={idx}>
                    <line
                      x1={v.x}
                      y1="20"
                      x2={v.x}
                      y2="380"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={v.x}
                      y="405"
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {v.label}
                    </text>
                  </g>
                ))}

                {/* Optional Volume Histogram at bottom */}
                {enableVolume && (
                  <g opacity="0.35">
                    {candleData.map((c, i) => {
                      const x = 30 + i * 23;
                      const isUp = c.close >= c.open;
                      const volHeight = Math.min(60, (parseFloat(c.volume.replace(/[^0-9.]/g, '')) || 2) * 12);
                      return (
                        <rect
                          key={`vol-${i}`}
                          x={x - 4}
                          y={380 - volHeight}
                          width="8"
                          height={volHeight}
                          fill={isUp ? '#5945F1' : '#C3B8FB'}
                          rx="1"
                        />
                      );
                    })}
                  </g>
                )}

                {/* Moving Average Line (20 EMA) */}
                {enableMA && (
                  <path
                    d="M 30,260 Q 120,280 200,160 T 380,200 T 560,180 T 710,140"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeOpacity="0.85"
                  />
                )}

                {/* Candlesticks in Vivid Purple & Soft Lavender (Exact match to screenshot) */}
                {candleData.map((c, i) => {
                  const x = 30 + i * 23;
                  const isUp = c.close >= c.open;

                  // Map price to Y coordinate (range: 170.70 to 172.05)
                  const scalePrice = (p: number) => {
                    const minP = 170.70;
                    const maxP = 172.05;
                    const norm = (p - minP) / (maxP - minP);
                    return 380 - norm * 350;
                  };

                  const yHigh = scalePrice(c.high);
                  const yLow = scalePrice(c.low);
                  const yOpen = scalePrice(c.open);
                  const yClose = scalePrice(c.close);

                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(4, Math.abs(yClose - yOpen));

                  // Purple theme styling
                  // Bullish = Rich Royal Purple (#5945F1)
                  // Bearish = Soft Translucent Lavender Purple (#C3B8FB)
                  const candleFill = isUp ? '#5945F1' : '#C3B8FB';
                  const wickStroke = isUp ? '#5945F1' : '#A290FB';

                  return (
                    <g
                      key={i}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredCandle(c)}
                      onMouseLeave={() => setHoveredCandle(null)}
                    >
                      {/* High-Low Wick */}
                      <line
                        x1={x}
                        y1={yHigh}
                        x2={x}
                        y2={yLow}
                        stroke={wickStroke}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />

                      {/* Candle Body */}
                      <rect
                        x={x - 5}
                        y={bodyTop}
                        width="10"
                        height={bodyHeight}
                        fill={candleFill}
                        rx="1"
                        className="group-hover:opacity-80 transition-opacity"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredCandle && (
                <div className="absolute top-4 left-4 bg-[#0b1c30]/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700 pointer-events-none z-10 flex items-center gap-3 animate-in fade-in duration-100">
                  <div className="text-slate-400 font-sans text-[11px] border-r border-slate-700 pr-2">
                    {hoveredCandle.time}
                  </div>
                  <div>
                    <span className="text-slate-400">O: </span>
                    <span className="font-bold">{hoveredCandle.open.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">H: </span>
                    <span className="font-bold text-emerald-400">{hoveredCandle.high.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">L: </span>
                    <span className="font-bold text-rose-400">{hoveredCandle.low.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">C: </span>
                    <span className="font-bold text-[#CAEB0E]">{hoveredCandle.close.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Vol: </span>
                    <span>{hoveredCandle.volume}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status & Disclaimer */}
            <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-slate-600">Live Institutional Feed Connected</span>
              </div>
              <span>Candles update in real time with market ticks</span>
            </div>
          </div>

          {/* ─── BOTTOM ANALYSIS SECTION (Overview & Technical Tabs - Exact Match to Dashboard_Trading Signals_Desktop_Max.png) ─── */}
          <div className="pt-2 space-y-4">
            {/* Tab Controls */}
            <div className="flex items-center gap-3 border-b border-slate-200/90 pb-3">
              <button
                type="button"
                onClick={() => setActiveDetailTab('overview')}
                className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeDetailTab === 'overview'
                    ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('technical')}
                className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeDetailTab === 'technical'
                    ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Technical
              </button>
            </div>

            {/* TAB 1: OVERVIEW (Exact Match to Trading Signals_Detail Page_Overview Tab.png) */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-6 pt-1">
                {/* Analysis Note */}
                <div className="space-y-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0b1c30]">
                    Analysis Note
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {activeSignal.ticker === 'EUR/JPY'
                      ? 'EUR/JPY continues to trade inside a well-supported bullish structure after rebounding from the 170.90 support zone earlier this week. The pair remains above both the 50-period and 200-period moving averages on the 4H timeframe, reinforcing medium-term upside momentum. Recent strength in EUR has been driven by improving Eurozone manufacturing sentiment, while persistent yield differentials continue to pressure the Japanese Yen. Momentum indicators remain constructive, although short-term overextension near 172.00 may trigger temporary pullbacks before continuation. A confirmed breakout above 172.10 could open the path toward 172.80 and 173.20 resistance levels. Traders should monitor upcoming ECB commentary and Tokyo CPI data for additional volatility catalysts.'
                      : activeSignal.analysis || `${activeSignal.ticker} continues to trade inside a well-supported bullish structure after rebounding from key support earlier this week. Moving averages across higher timeframes reinforce upside momentum, while momentum indicators remain constructive toward target projections.`}
                  </p>
                </div>

                {/* Exness Cashback Promo Banner (Magenta Border) */}
                <div className="rounded-2xl border border-pink-400 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#FCD303] flex items-center justify-center text-black font-black text-xl shrink-0 shadow-xs">
                      ex
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#0b1c30]">
                        Earn $6.20/Lot Cashback with <span className="text-[#FD02B0]">Exness</span><span className="text-[#FD02B0]">.</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Execute trades through your linked broker to earn the highest cashback rates!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPlaceTradeModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4935e0] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <span>Trade Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Our Preference Section (Based on Classic Pivot Points) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#0b1c30]">
                      Our Preference
                    </h3>
                    <span className="text-xs text-slate-400 font-normal">
                      Based on Classic Pivot Points
                    </span>
                  </div>

                  {/* Preference Card with Resistance, Pivot, Support Levels */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
                    {/* RESISTANCE SECTION */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 sm:col-span-3">
                        <span className="inline-block bg-rose-50 text-rose-500 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-md border border-rose-100">
                          RESISTANCE
                        </span>
                      </div>
                      <div className="col-span-12 sm:col-span-9 space-y-2.5">
                        {/* Row 1 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <span className="font-extrabold text-rose-500">173.20</span>
                            <span className="text-slate-500 font-medium">Resistance</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          </div>
                        </div>
                        {/* Row 2 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <span className="font-extrabold text-rose-500">172.80</span>
                            <span className="text-slate-500 font-medium">Resistance</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          </div>
                        </div>
                        {/* Row 3 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <span className="font-extrabold text-rose-500">172.10</span>
                            <span className="text-slate-500 font-medium">Resistance</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-b border-dashed border-slate-200" />

                    {/* PIVOT SECTION */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 sm:col-span-3">
                        <span className="inline-block bg-sky-50 text-sky-600 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-md border border-sky-100">
                          PIVOT
                        </span>
                      </div>
                      <div className="col-span-12 sm:col-span-9">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                          <span className="font-extrabold text-slate-900">173.20</span>
                          <span className="text-slate-500 font-medium">Pivot</span>
                        </div>
                      </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-b border-dashed border-slate-200" />

                    {/* SUPPORT SECTION */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 sm:col-span-3">
                        <span className="inline-block bg-emerald-50 text-emerald-600 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-md border border-emerald-100">
                          SUPPORT
                        </span>
                      </div>
                      <div className="col-span-12 sm:col-span-9 space-y-2.5">
                        {/* Row 1 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-extrabold text-emerald-600">173.20</span>
                            <span className="text-slate-500 font-medium">Support</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          </div>
                        </div>
                        {/* Row 2 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-extrabold text-emerald-600">172.80</span>
                            <span className="text-slate-500 font-medium">Support</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          </div>
                        </div>
                        {/* Row 3 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-extrabold text-emerald-600">172.10</span>
                            <span className="text-slate-500 font-medium">Support</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternative Scenario Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-3.5 shadow-xs">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0b1c30]">
                      Alternative Scenario
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      If EUR/JPY falls below 170.90, bearish pressure may accelerate toward 170.40 and 169.85 support zones.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {/* Target 1 */}
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                      <span className="text-xs text-slate-500 font-medium">Target 1</span>
                      <div className="my-1">
                        <span className="text-xl sm:text-2xl font-black text-rose-500 tracking-tight">
                          170.40
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">-69 pips</span>
                    </div>

                    {/* Target 2 */}
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                      <span className="text-xs text-slate-500 font-medium">Target 2</span>
                      <div className="my-1">
                        <span className="text-xl sm:text-2xl font-black text-rose-500 tracking-tight">
                          169.85
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">-69 pips</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-200/80 pt-2" />
              </div>
            )}

            {/* TAB 2: TECHNICAL (Interactive Oscillators, Moving Averages, Pivot Levels) */}
            {activeDetailTab === 'technical' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#0b1c30]">
                    Technical Analysis & Key Pivot Levels
                  </h2>
                  <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    Live Multi-Timeframe Scan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Indicators Table */}
                  <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Oscillators & Moving Averages
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Relative Strength Index (RSI 14)</span>
                        <span className="font-bold text-[#0b1c30]">58.4 (Neutral Bullish)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">MACD Histogram (12, 26, 9)</span>
                        <span className="font-bold text-emerald-600">+0.12 (Bullish Crossover)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">20 Exponential MA (30m)</span>
                        <span className="font-bold text-[#5945F1]">171.42 (Price Above EMA)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">50 Simple MA (4H)</span>
                        <span className="font-bold text-[#0b1c30]">170.95 (Dynamic Support)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">200 Simple MA (Daily)</span>
                        <span className="font-bold text-[#0b1c30]">169.80 (Long-Term Bullish)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Average True Range (ATR 14)</span>
                        <span className="font-bold text-[#0b1c30]">0.85 JPY (Normal Volatility)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pivot Points Table */}
                  <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Standard Pivot & Fibonacci Levels
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Resistance 2 (R2 - Extended Target)</span>
                        <span className="font-bold text-rose-600">172.80</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Resistance 1 (R1 - Breakout Level)</span>
                        <span className="font-bold text-rose-500">172.10</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Central Pivot Point (PP)</span>
                        <span className="font-bold text-indigo-700">171.35</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Support 1 (S1 - Week Low Defense)</span>
                        <span className="font-bold text-emerald-600">170.90</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Support 2 (S2 - Major Liquidity Floor)</span>
                        <span className="font-bold text-emerald-700">170.20</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Institutional Order Flow Bias</span>
                        <span className="font-bold text-emerald-600">64% Net Buy Pressure</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-slate-200/80 pt-4" />
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR (4 Cols): EXACT MATCH TO SCREENSHOT (Sticky during scroll) ─── */}
        <div className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar">
          {/* Card 1: Next Milestone / You're Connected. Nice! (Magenta Border) */}
          <div className="bg-white rounded-2xl border-2 border-[#FD02B0] p-5 shadow-xs relative">
            {/* Floating Pill on top right border */}
            <div className="absolute -top-3 right-6 bg-[#FD02B0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Next Milestone</span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                {/* Blue Square with link icon */}
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 stroke-white fill-none stroke-[2.5]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30]">
                    You're Connected. Nice!
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Start trading to get cashback
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPlaceTradeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#5945F1] hover:bg-[#4935e0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
              >
                Trade Now
              </button>
            </div>
          </div>

          {/* Card 2: Connect & Ready to Trade!. */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">
                <span className="text-[#5945F1]">Connect</span> & Ready to Trade!<span className="text-[#FD02B0]">.</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your accounts are connected. Time to make those trades pay you back!
              </p>
            </div>

            {/* Connected Brokers List */}
            <div className="space-y-3 pt-1">
              {/* 1. HFM */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center p-1.5 shrink-0">
                    <span className="text-white font-extrabold text-xs tracking-wider">HFM</span>
                  </div>
                  <div>
                    <div className="text-xs">
                      <span className="font-bold text-[#5945F1] text-sm">$3.80</span>
                      <span className="text-slate-400 font-medium ml-1">Max./lot</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Premium, Pro</div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaceTradeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#5945F1] hover:bg-[#4935e0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Trade
                </button>
              </div>

              {/* 2. Eightcap */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00b159] flex items-center justify-center p-1.5 shrink-0">
                    <span className="text-white font-black text-xs lowercase">eightcap</span>
                  </div>
                  <div>
                    <div className="text-xs">
                      <span className="font-bold text-[#5945F1] text-sm">$3.25</span>
                      <span className="text-slate-400 font-medium ml-1">Max./lot</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Standard</div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaceTradeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#5945F1] hover:bg-[#4935e0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Trade
                </button>
              </div>

              {/* 3. IG */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e01a22] flex items-center justify-center p-1.5 shrink-0">
                    <span className="text-white font-black text-sm tracking-wider">IG</span>
                  </div>
                  <div>
                    <div className="text-xs">
                      <span className="font-bold text-[#5945F1] text-sm">$2.40</span>
                      <span className="text-slate-400 font-medium ml-1">Max./lot</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Standard</div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaceTradeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#5945F1] hover:bg-[#4935e0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Trade
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* ─── MEET YOUR TRADING PARTNER FULL-WIDTH BANNER ─── */}
      <section className="bg-[#5945F1] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Buttons */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Meet Your
              </h2>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#CAEB0E] tracking-tight leading-tight flex items-baseline gap-0.5">
                <span>Trading Partner</span>
                <span className="text-[#FD02B0]">.</span>
              </div>
              <p className="text-white/90 text-sm mt-3 leading-relaxed">
                Compare brokers, account types and cashback before making your move.
              </p>
            </div>

            <div className="space-y-3 pt-2 max-w-xs">
              <button
                onClick={() => (onNavigateToBrokers ? onNavigateToBrokers() : onConnectBroker(brokers[0]))}
                className="w-full px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#5945F1] font-bold text-xs flex items-center justify-between transition-all shadow-sm cursor-pointer"
              >
                <span>View all brokers</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => (onNavigateToComparison ? onNavigateToComparison() : onConnectBroker(brokers[0]))}
                className="w-full px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/80 font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <span>See Side-by-Syde</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right Column: 3 Broker Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. HFM */}
            <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center p-1.5 shrink-0">
                    <span className="text-white font-extrabold text-xs tracking-wider">HFM</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✔ Verified
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[#0b1c30]">HFM</h4>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-[#5945F1]">$3.80/lot</span>
                    <span className="text-[10px] text-slate-400 font-medium">Max Cashback</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Eligible Account Types
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Premium</span>
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Pro</span>
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Pro Plus</span>
                  </div>
                  <button
                    onClick={() => onConnectBroker(brokers.find((b) => b.name.toLowerCase().includes('hfm')) || brokers[0])}
                    className="text-[11px] font-bold text-slate-800 hover:text-[#5945F1] flex items-center gap-0.5 pt-1 cursor-pointer"
                  >
                    <span>Link More</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsPlaceTradeModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4935e0] text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <span>Trade Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Exness */}
            <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FCD303] flex items-center justify-center text-black font-black text-base shrink-0 shadow-xs">
                    ex
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✔ Verified
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[#0b1c30]">Exness</h4>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-[#5945F1]">$6.20/lot</span>
                    <span className="text-[10px] text-slate-400 font-medium">Max Cashback</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Eligible Account Types
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Raw Spread</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Pro</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onConnectBroker(brokers.find((b) => b.name.toLowerCase().includes('exness')) || brokers[0])}
                className="w-full py-2.5 rounded-xl bg-[#CAEB0E] hover:bg-[#bce000] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <span>Connect Now</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* 3. Pepperstone */}
            <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#002244] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    <span className="tracking-tighter font-extrabold">P</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✔ Verified
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[#0b1c30] truncate">Pepperstone</h4>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-[#5945F1]">0.3 pips</span>
                    <span className="text-[10px] text-slate-400 font-medium">Max spread cashback</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Eligible Account Types
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Razor</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Standard Live</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onConnectBroker(brokers.find((b) => b.name.toLowerCase().includes('pepperstone')) || brokers[0])}
                className="w-full py-2.5 rounded-xl bg-[#CAEB0E] hover:bg-[#bce000] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <span>Connect Now</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODAL: Where would you like to place it? (2 Scenarios: Connected vs Not Connected) ─── */}
      {isPlaceTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                  Where would you like to place it?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Choose a connected broker below, or connect a new one to continue.
                </p>
              </div>
              <button
                onClick={() => setIsPlaceTradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 -mr-2 -mt-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scenario Testing Switcher (Allows seamless preview of both Connected and Not Connected scenarios) */}
            <div className="flex items-center justify-between pt-1 pb-0.5 border-t border-slate-100/80">
              <span className="text-xs font-semibold text-slate-400">
                {effectiveHasConnected ? 'Connected Brokers' : ''}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold text-slate-500">
                <button
                  type="button"
                  onClick={() => setPlaceTradeScenario('connected')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    effectiveHasConnected
                      ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                      : 'hover:text-slate-800'
                  }`}
                >
                  Connected (6)
                </button>
                <button
                  type="button"
                  onClick={() => setPlaceTradeScenario('not-connected')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    !effectiveHasConnected
                      ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                      : 'hover:text-slate-800'
                  }`}
                >
                  Not Connected
                </button>
              </div>
            </div>

            {/* ─── SCENARIO 1: Connected with Brokers ─── */}
            {effectiveHasConnected ? (
              <div className="space-y-4">
                {/* 2x3 Grid of 6 Connected Brokers */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {placeTradeBrokers.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBrokerToPlace(b)}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#5945F1]/80 hover:shadow-md transition-all p-3 flex flex-col items-center justify-between text-center relative cursor-pointer group min-h-[145px]"
                    >
                      {/* Verified Badge or Spacer for uniform height */}
                      <div className="h-5 flex items-center justify-center">
                        {b.verified ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-slate-950 bg-[#CAEB0E] px-2 py-0.5 rounded-full shadow-2xs">
                            ✔ Verified
                          </span>
                        ) : (
                          <span className="invisible text-[9px] px-2 py-0.5">spacer</span>
                        )}
                      </div>

                      {/* Broker Logo */}
                      <div className="my-1 transition-transform group-hover:scale-105">
                        {renderPlaceBrokerLogo(b.logoType)}
                      </div>

                      {/* Broker Name, Cashback & Subtitle */}
                      <div className="mt-1.5 space-y-0.5">
                        <h4 className="text-xs font-extrabold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                          {b.name}
                        </h4>
                        <div className="text-xs font-extrabold text-[#5945F1]">
                          {b.cashbackValue}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {b.maxCashback}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <button
                    onClick={() => setCurrentBrokerPage(1)}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    |&lt;
                  </button>
                  <button
                    onClick={() => setCurrentBrokerPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={() => setCurrentBrokerPage(1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      currentBrokerPage === 1
                        ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs'
                        : 'border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setCurrentBrokerPage(2)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      currentBrokerPage === 2
                        ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs'
                        : 'border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    2
                  </button>
                  <span className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs font-bold">
                    ...
                  </span>
                  <button
                    onClick={() => setCurrentBrokerPage(5)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      currentBrokerPage === 5
                        ? 'border border-[#5945F1] text-[#5945F1] bg-white shadow-2xs'
                        : 'border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    5
                  </button>
                  <button
                    onClick={() => setCurrentBrokerPage((p) => Math.min(5, p + 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    &gt;
                  </button>
                  <button
                    onClick={() => setCurrentBrokerPage(5)}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    &gt;|
                  </button>
                </div>

                {/* Footer divider + Connect Another Broker */}
                <div className="border-t border-slate-100 pt-3 space-y-2.5">
                  <p className="text-xs text-slate-500 text-center font-normal">
                    Want to connect more brokers?
                  </p>
                  <button
                    onClick={() => {
                      setIsPlaceTradeModalOpen(false);
                      onConnectBroker(brokers.find((b) => !b.connected) || brokers[0]);
                    }}
                    className="w-full py-2.5 rounded-xl border border-[#5945F1] text-[#5945F1] hover:bg-indigo-50/60 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Connect Another Broker
                  </button>
                </div>
              </div>
            ) : (
              /* ─── SCENARIO 2: NOT Connected to Any Brokers ─── */
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-150">
                <p className="text-xs text-slate-500 font-normal">
                  You haven't connected to any brokers.
                </p>
                <button
                  onClick={() => {
                    setIsPlaceTradeModalOpen(false);
                    onConnectBroker(brokers.find((b) => !b.connected) || brokers[0]);
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#5945F1] text-[#5945F1] hover:bg-indigo-50/60 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Connect now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Trade Execution Modal */}
      {isQuickTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {renderDualFlag(activeSignal.ticker)}
                <div>
                  <h3 className="font-extrabold text-[#0b1c30] text-base">
                    Execute {activeSignal.action} Order
                  </h3>
                  <span className="text-xs text-slate-400">{activeSignal.ticker} @ {activeSignal.price}</span>
                </div>
              </div>
              <button
                onClick={() => setIsQuickTradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Connected Broker</span>
                  <span className="font-bold text-[#0b1c30]">{selectedTradeBrokerName} (Institutional Zero)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rebate Rate</span>
                  <span className="font-bold text-emerald-600">$8.00 / lot + 10% Boost</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Position Size (Lots)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={tradeLotSize}
                    onChange={(e) => setTradeLotSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#5945F1]"
                  />
                  <div className="flex gap-1">
                    {['0.1', '0.5', '1.0', '2.0'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setTradeLotSize(l)}
                        className="px-2 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 font-medium">
                💰 Estimated Instant Cashback on this trade:{' '}
                <span className="font-extrabold text-emerald-700">
                  +$
                  {(
                    (parseFloat(tradeLotSize) || 1.0) *
                    8.0 *
                    (1 + (user.boostPercentage || 10) / 100)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsQuickTradeModalOpen(false)}
                className="w-1/2 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTrade}
                className="w-1/2 py-2.5 rounded-lg bg-[#CAEB0E] hover:bg-[#bce000] text-slate-950 font-extrabold text-xs transition-all shadow-sm cursor-pointer"
              >
                Confirm {activeSignal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
