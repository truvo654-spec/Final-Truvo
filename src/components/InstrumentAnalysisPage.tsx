import React, { useState, useMemo } from 'react';
import { MarketSignal, Broker, UserProfile } from '../types';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  SlidersHorizontal,
  Compass,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Percent,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface InstrumentData {
  symbol: string;
  name: string;
  category: 'Forex' | 'Metals' | 'Crypto' | 'Indices' | 'Commodities';
  price: number;
  decimals: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  pipValue: number;
  typicalSpread: number;
  atr14: number;
  overallRating: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  buyCount: number;
  neutralCount: number;
  sellCount: number;
  bullishSentiment: number; // percentage (e.g. 68)
  description: string;
  oscillators: {
    rsi14: { value: number; signal: 'Buy' | 'Neutral' | 'Sell' };
    stochK: { value: number; signal: 'Buy' | 'Neutral' | 'Sell' };
    macd: { value: number; signal: 'Buy' | 'Neutral' | 'Sell'; text: string };
    adx: { value: number; signal: 'Trending' | 'Neutral' | 'Ranging' };
    cci20: { value: number; signal: 'Buy' | 'Neutral' | 'Sell' };
  };
  movingAverages: {
    ema20: { value: number; signal: 'Buy' | 'Sell' };
    ema50: { value: number; signal: 'Buy' | 'Sell' };
    ema100: { value: number; signal: 'Buy' | 'Sell' };
    ema200: { value: number; signal: 'Buy' | 'Sell' };
  };
  pivots: {
    r3: number;
    r2: number;
    r1: number;
    pivot: number;
    s1: number;
    s2: number;
    s3: number;
  };
  candles: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

const INSTRUMENT_LIST: InstrumentData[] = [
  {
    symbol: 'XAU/USD',
    name: 'Gold Spot / US Dollar',
    category: 'Metals',
    price: 2658.45,
    decimals: 2,
    change24h: 1.42,
    high24h: 2670.2,
    low24h: 2638.1,
    volume24h: '$38.4B',
    pipValue: 10.0,
    typicalSpread: 1.2,
    atr14: 24.8,
    overallRating: 'Strong Buy',
    buyCount: 16,
    neutralCount: 4,
    sellCount: 2,
    bullishSentiment: 73,
    description:
      'Gold trades firmly near record resistance levels, backed by ongoing central bank buying, yield adjustments, and strong safe-haven liquidity flows.',
    oscillators: {
      rsi14: { value: 64.2, signal: 'Buy' },
      stochK: { value: 74.8, signal: 'Buy' },
      macd: { value: 6.84, signal: 'Buy', text: 'Bullish Crossover' },
      adx: { value: 36.2, signal: 'Trending' },
      cci20: { value: 114.5, signal: 'Buy' },
    },
    movingAverages: {
      ema20: { value: 2642.1, signal: 'Buy' },
      ema50: { value: 2620.5, signal: 'Buy' },
      ema100: { value: 2588.0, signal: 'Buy' },
      ema200: { value: 2534.2, signal: 'Buy' },
    },
    pivots: {
      r3: 2692.0,
      r2: 2678.5,
      r1: 2668.0,
      pivot: 2652.1,
      s1: 2641.5,
      s2: 2628.0,
      s3: 2614.5,
    },
    candles: [
      { time: '08:00', open: 2640.2, high: 2648.5, low: 2638.1, close: 2646.0, volume: 4200 },
      { time: '10:00', open: 2646.0, high: 2654.1, low: 2644.0, close: 2652.8, volume: 5300 },
      { time: '12:00', open: 2652.8, high: 2661.0, low: 2650.2, close: 2658.2, volume: 6800 },
      { time: '14:00', open: 2658.2, high: 2670.2, low: 2656.0, close: 2666.5, volume: 8100 },
      { time: '16:00', open: 2666.5, high: 2669.0, low: 2654.0, close: 2658.45, volume: 6200 },
    ],
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'Forex',
    price: 1.0872,
    decimals: 4,
    change24h: 0.38,
    high24h: 1.0912,
    low24h: 1.0845,
    volume24h: '$84.2B',
    pipValue: 10.0,
    typicalSpread: 0.8,
    atr14: 0.0064,
    overallRating: 'Buy',
    buyCount: 13,
    neutralCount: 6,
    sellCount: 3,
    bullishSentiment: 61,
    description:
      'EUR/USD exhibits consistent ascending trendline support. Dollar index consolidation provides upside room toward the 1.0920 weekly resistance band.',
    oscillators: {
      rsi14: { value: 58.6, signal: 'Buy' },
      stochK: { value: 62.4, signal: 'Buy' },
      macd: { value: 0.0018, signal: 'Buy', text: 'Positive Histogram' },
      adx: { value: 24.8, signal: 'Neutral' },
      cci20: { value: 88.2, signal: 'Neutral' },
    },
    movingAverages: {
      ema20: { value: 1.0855, signal: 'Buy' },
      ema50: { value: 1.0838, signal: 'Buy' },
      ema100: { value: 1.0815, signal: 'Buy' },
      ema200: { value: 1.0862, signal: 'Buy' },
    },
    pivots: {
      r3: 1.0965,
      r2: 1.0932,
      r1: 1.0898,
      pivot: 1.0865,
      s1: 1.0832,
      s2: 1.0798,
      s3: 1.0765,
    },
    candles: [
      { time: '08:00', open: 1.0848, high: 1.0865, low: 1.0845, close: 1.0860, volume: 12400 },
      { time: '10:00', open: 1.0860, high: 1.0888, low: 1.0855, close: 1.0882, volume: 15600 },
      { time: '12:00', open: 1.0882, high: 1.0912, low: 1.0874, close: 1.0905, volume: 18200 },
      { time: '14:00', open: 1.0905, high: 1.0910, low: 1.0865, close: 1.0878, volume: 14100 },
      { time: '16:00', open: 1.0878, high: 1.0884, low: 1.0868, close: 1.0872, volume: 9800 },
    ],
  },
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    category: 'Crypto',
    price: 68450.0,
    decimals: 1,
    change24h: 3.15,
    high24h: 69200.0,
    low24h: 66100.0,
    volume24h: '$26.8B',
    pipValue: 1.0,
    typicalSpread: 12.0,
    atr14: 1850.0,
    overallRating: 'Strong Buy',
    buyCount: 18,
    neutralCount: 3,
    sellCount: 1,
    bullishSentiment: 78,
    description:
      'Bitcoin is testing key psychological resistance near $69,000, supported by accelerating ETF net inflows and strong on-chain accumulation metrics.',
    oscillators: {
      rsi14: { value: 68.4, signal: 'Buy' },
      stochK: { value: 82.1, signal: 'Buy' },
      macd: { value: 420.5, signal: 'Buy', text: 'Strong Bullish Expansion' },
      adx: { value: 41.5, signal: 'Trending' },
      cci20: { value: 142.0, signal: 'Buy' },
    },
    movingAverages: {
      ema20: { value: 66800.0, signal: 'Buy' },
      ema50: { value: 64950.0, signal: 'Buy' },
      ema100: { value: 62400.0, signal: 'Buy' },
      ema200: { value: 59200.0, signal: 'Buy' },
    },
    pivots: {
      r3: 71400.0,
      r2: 70100.0,
      r1: 69250.0,
      pivot: 67900.0,
      s1: 66800.0,
      s2: 65400.0,
      s3: 64100.0,
    },
    candles: [
      { time: '08:00', open: 66400, high: 67100, low: 66100, close: 66950, volume: 820 },
      { time: '10:00', open: 66950, high: 67800, low: 66800, close: 67650, volume: 1140 },
      { time: '12:00', open: 67650, high: 68900, low: 67500, close: 68500, volume: 1560 },
      { time: '14:00', open: 68500, high: 69200, low: 68100, close: 68800, volume: 1890 },
      { time: '16:00', open: 68800, high: 68950, low: 68200, close: 68450, volume: 1020 },
    ],
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'Forex',
    price: 1.3045,
    decimals: 4,
    change24h: -0.22,
    high24h: 1.3095,
    low24h: 1.3021,
    volume24h: '$42.1B',
    pipValue: 10.0,
    typicalSpread: 1.1,
    atr14: 0.0078,
    overallRating: 'Neutral',
    buyCount: 8,
    neutralCount: 9,
    sellCount: 5,
    bullishSentiment: 52,
    description:
      'GBP/USD consolidates above 1.3000 psychological handle ahead of UK CPI data release. Price oscillates inside a defined 70-pip horizontal range.',
    oscillators: {
      rsi14: { value: 50.4, signal: 'Neutral' },
      stochK: { value: 48.2, signal: 'Neutral' },
      macd: { value: -0.0004, signal: 'Neutral', text: 'Flat Baseline' },
      adx: { value: 18.2, signal: 'Ranging' },
      cci20: { value: -12.4, signal: 'Neutral' },
    },
    movingAverages: {
      ema20: { value: 1.3055, signal: 'Sell' },
      ema50: { value: 1.3040, signal: 'Buy' },
      ema100: { value: 1.3012, signal: 'Buy' },
      ema200: { value: 1.2965, signal: 'Buy' },
    },
    pivots: {
      r3: 1.3150,
      r2: 1.3110,
      r1: 1.3075,
      pivot: 1.3040,
      s1: 1.3005,
      s2: 1.2970,
      s3: 1.2930,
    },
    candles: [
      { time: '08:00', open: 1.3070, high: 1.3095, low: 1.3060, close: 1.3085, volume: 9200 },
      { time: '10:00', open: 1.3085, high: 1.3090, low: 1.3050, close: 1.3062, volume: 10400 },
      { time: '12:00', open: 1.3062, high: 1.3075, low: 1.3032, close: 1.3040, volume: 11200 },
      { time: '14:00', open: 1.3040, high: 1.3055, low: 1.3021, close: 1.3038, volume: 9800 },
      { time: '16:00', open: 1.3038, high: 1.3052, low: 1.3035, close: 1.3045, volume: 7400 },
    ],
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'Forex',
    price: 152.85,
    decimals: 2,
    change24h: 0.65,
    high24h: 153.2,
    low24h: 151.9,
    volume24h: '$61.5B',
    pipValue: 6.54,
    typicalSpread: 0.9,
    atr14: 1.22,
    overallRating: 'Buy',
    buyCount: 14,
    neutralCount: 5,
    sellCount: 3,
    bullishSentiment: 64,
    description:
      'USD/JPY maintains upside pressure as the US-Japan bond yield differential widens. Traders monitor intervention jawboning around the 153.50 pivot zone.',
    oscillators: {
      rsi14: { value: 61.2, signal: 'Buy' },
      stochK: { value: 69.5, signal: 'Buy' },
      macd: { value: 0.48, signal: 'Buy', text: 'Bullish Crossover' },
      adx: { value: 31.0, signal: 'Trending' },
      cci20: { value: 92.4, signal: 'Buy' },
    },
    movingAverages: {
      ema20: { value: 152.1, signal: 'Buy' },
      ema50: { value: 151.2, signal: 'Buy' },
      ema100: { value: 149.8, signal: 'Buy' },
      ema200: { value: 148.5, signal: 'Buy' },
    },
    pivots: {
      r3: 154.6,
      r2: 153.8,
      r1: 153.3,
      pivot: 152.5,
      s1: 151.9,
      s2: 151.2,
      s3: 150.4,
    },
    candles: [
      { time: '08:00', open: 152.1, high: 152.4, low: 151.9, close: 152.3, volume: 8800 },
      { time: '10:00', open: 152.3, high: 152.75, low: 152.2, close: 152.6, volume: 11200 },
      { time: '12:00', open: 152.6, high: 153.2, low: 152.5, close: 153.05, volume: 14600 },
      { time: '14:00', open: 153.05, high: 153.15, low: 152.7, close: 152.8, volume: 12100 },
      { time: '16:00', open: 152.8, high: 152.95, low: 152.65, close: 152.85, volume: 9400 },
    ],
  },
  {
    symbol: 'US30',
    name: 'Dow Jones Industrial Average',
    category: 'Indices',
    price: 43240.0,
    decimals: 1,
    change24h: 0.48,
    high24h: 43380.0,
    low24h: 43010.0,
    volume24h: '$19.2B',
    pipValue: 1.0,
    typicalSpread: 2.0,
    atr14: 340.0,
    overallRating: 'Buy',
    buyCount: 15,
    neutralCount: 4,
    sellCount: 3,
    bullishSentiment: 67,
    description:
      'Dow Jones index trades near historical peaks supported by quarterly corporate earnings beats and steady industrial sector capital rotation.',
    oscillators: {
      rsi14: { value: 62.4, signal: 'Buy' },
      stochK: { value: 71.0, signal: 'Buy' },
      macd: { value: 84.5, signal: 'Buy', text: 'Positive Slope' },
      adx: { value: 29.5, signal: 'Trending' },
      cci20: { value: 104.2, signal: 'Buy' },
    },
    movingAverages: {
      ema20: { value: 43050.0, signal: 'Buy' },
      ema50: { value: 42720.0, signal: 'Buy' },
      ema100: { value: 42100.0, signal: 'Buy' },
      ema200: { value: 41200.0, signal: 'Buy' },
    },
    pivots: {
      r3: 43750.0,
      r2: 43520.0,
      r1: 43380.0,
      pivot: 43180.0,
      s1: 43020.0,
      s2: 42840.0,
      s3: 42650.0,
    },
    candles: [
      { time: '08:00', open: 43060, high: 43180, low: 43010, close: 43150, volume: 3200 },
      { time: '10:00', open: 43150, high: 43290, low: 43120, close: 43260, volume: 4600 },
      { time: '12:00', open: 43260, high: 43380, low: 43220, close: 43340, volume: 5400 },
      { time: '14:00', open: 43340, high: 43360, low: 43190, close: 43210, volume: 4100 },
      { time: '16:00', open: 43210, high: 43270, low: 43200, close: 43240, volume: 2900 },
    ],
  },
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Index',
    category: 'Indices',
    price: 20485.0,
    decimals: 1,
    change24h: 1.12,
    high24h: 20590.0,
    low24h: 20260.0,
    volume24h: '$32.4B',
    pipValue: 1.0,
    typicalSpread: 1.4,
    atr14: 215.0,
    overallRating: 'Strong Buy',
    buyCount: 17,
    neutralCount: 3,
    sellCount: 2,
    bullishSentiment: 75,
    description:
      'Nasdaq 100 surges as megacap tech and AI semiconductor leaders breach technical resistances, confirming broadening participation across index weights.',
    oscillators: {
      rsi14: { value: 66.8, signal: 'Buy' },
      stochK: { value: 78.4, signal: 'Buy' },
      macd: { value: 112.0, signal: 'Buy', text: 'Bullish Momentum' },
      adx: { value: 38.0, signal: 'Trending' },
      cci20: { value: 126.5, signal: 'Buy' },
    },
    movingAverages: {
      ema20: { value: 20310.0, signal: 'Buy' },
      ema50: { value: 20080.0, signal: 'Buy' },
      ema100: { value: 19740.0, signal: 'Buy' },
      ema200: { value: 19250.0, signal: 'Buy' },
    },
    pivots: {
      r3: 20850.0,
      r2: 20680.0,
      r1: 20560.0,
      pivot: 20420.0,
      s1: 20300.0,
      s2: 20160.0,
      s3: 20020.0,
    },
    candles: [
      { time: '08:00', open: 20290, high: 20380, low: 20260, close: 20360, volume: 5400 },
      { time: '10:00', open: 20360, high: 20490, low: 20340, close: 20460, volume: 7200 },
      { time: '12:00', open: 20460, high: 20590, low: 20440, close: 20550, volume: 8800 },
      { time: '14:00', open: 20550, high: 20570, low: 20450, close: 20470, volume: 6700 },
      { time: '16:00', open: 20470, high: 20510, low: 20460, close: 20485, volume: 4900 },
    ],
  },
  {
    symbol: 'USOIL',
    name: 'WTI Crude Oil',
    category: 'Commodities',
    price: 71.45,
    decimals: 2,
    change24h: -1.25,
    high24h: 73.1,
    low24h: 70.8,
    volume24h: '$18.7B',
    pipValue: 10.0,
    typicalSpread: 2.8,
    atr14: 1.85,
    overallRating: 'Sell',
    buyCount: 4,
    neutralCount: 6,
    sellCount: 12,
    bullishSentiment: 38,
    description:
      'Crude oil drops below the 20-day moving average following reports of OPEC+ supply restoration discussions and moderate global inventory builds.',
    oscillators: {
      rsi14: { value: 42.1, signal: 'Sell' },
      stochK: { value: 34.0, signal: 'Sell' },
      macd: { value: -0.62, signal: 'Sell', text: 'Bearish Signal Line Cross' },
      adx: { value: 26.5, signal: 'Trending' },
      cci20: { value: -84.0, signal: 'Sell' },
    },
    movingAverages: {
      ema20: { value: 72.8, signal: 'Sell' },
      ema50: { value: 73.4, signal: 'Sell' },
      ema100: { value: 74.5, signal: 'Sell' },
      ema200: { value: 75.8, signal: 'Sell' },
    },
    pivots: {
      r3: 74.8,
      r2: 73.6,
      r1: 72.5,
      pivot: 71.8,
      s1: 70.7,
      s2: 69.9,
      s3: 68.8,
    },
    candles: [
      { time: '08:00', open: 72.8, high: 73.1, low: 72.4, close: 72.6, volume: 4100 },
      { time: '10:00', open: 72.6, high: 72.7, low: 71.9, close: 72.1, volume: 5300 },
      { time: '12:00', open: 72.1, high: 72.3, low: 71.2, close: 71.4, volume: 6400 },
      { time: '14:00', open: 71.4, high: 71.8, low: 70.8, close: 71.2, volume: 5800 },
      { time: '16:00', open: 71.2, high: 71.6, low: 71.1, close: 71.45, volume: 3900 },
    ],
  },
];

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
  const [selectedSymbol, setSelectedSymbol] = useState<string>('XAU/USD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTimeframe, setActiveTimeframe] = useState<'15M' | '1H' | '4H' | '1D' | '1W'>('1H');

  const filteredInstruments = useMemo(() => {
    return INSTRUMENT_LIST.filter((inst) => {
      const matchCat =
        selectedCategory === 'All' ||
        (selectedCategory === 'Forex' && inst.category === 'Forex') ||
        (selectedCategory === 'Metals' && (inst.category === 'Metals' || inst.category === 'Commodities')) ||
        (selectedCategory === 'Crypto' && inst.category === 'Crypto') ||
        (selectedCategory === 'Indices' && inst.category === 'Indices');

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        inst.symbol.toLowerCase().includes(q) ||
        inst.name.toLowerCase().includes(q) ||
        inst.category.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const currentInstrument = useMemo(() => {
    return (
      INSTRUMENT_LIST.find((i) => i.symbol === selectedSymbol) ||
      INSTRUMENT_LIST[0]
    );
  }, [selectedSymbol]);

  // Find active signals that correlate with this instrument ticker
  const correlatedSignals = useMemo(() => {
    const symNormalized = currentInstrument.symbol.replace('/', '').toLowerCase();
    return signals.filter((sig) => {
      const sigNormalized = sig.ticker.replace('/', '').toLowerCase();
      return (
        sigNormalized === symNormalized ||
        sig.name.toLowerCase().includes(currentInstrument.symbol.toLowerCase()) ||
        currentInstrument.symbol.toLowerCase().includes(sig.ticker.toLowerCase())
      );
    });
  }, [signals, currentInstrument]);

  // Rating Badge Styles
  const getRatingBadge = (rating: InstrumentData['overallRating']) => {
    switch (rating) {
      case 'Strong Buy':
        return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'Buy':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Neutral':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'Sell':
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      case 'Strong Sell':
        return 'bg-rose-500 text-white shadow-rose-500/20';
    }
  };

  const formatPrice = (val: number, decimals: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* ─── 1. TOP HEADER BANNER ─── */}
      <div className="bg-gradient-to-br from-[#0b1c30] via-[#122340] to-[#1a1c38] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
        {/* Abstract Background Accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#5945F1]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#bef226]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#bef226]">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Technical Telemetry & Market Structure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
              Instrument Analysis
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              In-depth multi-timeframe oscillators, moving averages confluence, key pivot levels, and market sentiment across major trading assets.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[110px]">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Coverage
              </div>
              <div className="text-xl font-black text-white mt-0.5">8 Major Assets</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[110px]">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Telemetry
              </div>
              <div className="text-xl font-black text-[#bef226] mt-0.5">18 Indicators</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. INSTRUMENT SELECTOR BAR & SEARCH ─── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 space-y-4">
        {/* Category Pills & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['All', 'Forex', 'Metals', 'Crypto', 'Indices'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search symbol (e.g. XAU, EUR, BTC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#5945F1] focus:ring-2 focus:ring-[#5945F1]/15 transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Horizontal Instrument Cards Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2 border-t border-slate-100">
          {filteredInstruments.map((inst) => {
            const isSelected = inst.symbol === selectedSymbol;
            const isPositive = inst.change24h >= 0;
            return (
              <button
                key={inst.symbol}
                onClick={() => setSelectedSymbol(inst.symbol)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#5945F1] bg-[#5945F1]/5 ring-2 ring-[#5945F1]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-[13px] text-[#0b1c30]">
                    {inst.symbol}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {inst.change24h}%
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                  {formatPrice(inst.price, inst.decimals)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3. MAIN INSTRUMENT HERO OVERVIEW ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Symbol Title & Price Headline */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5945F1]/10 border border-[#5945F1]/20 flex items-center justify-center text-[#5945F1] font-black text-xl shadow-xs shrink-0">
              {currentInstrument.symbol.split('/')[0] || currentInstrument.symbol.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight">
                  {currentInstrument.symbol}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {currentInstrument.category}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full shadow-xs ${getRatingBadge(
                    currentInstrument.overallRating
                  )}`}
                >
                  {currentInstrument.overallRating}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {currentInstrument.name}
              </p>
            </div>
          </div>

          {/* Real-Time Price & Change Stats */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Live Price
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight">
                {formatPrice(currentInstrument.price, currentInstrument.decimals)}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                24h Change
              </div>
              <div
                className={`text-lg sm:text-xl font-bold flex items-center gap-1 ${
                  currentInstrument.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {currentInstrument.change24h >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                )}
                <span>
                  {currentInstrument.change24h >= 0 ? '+' : ''}
                  {currentInstrument.change24h}%
                </span>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(['15M', '1H', '4H', '1D', '1W'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTimeframe === tf
                      ? 'bg-white text-[#5945F1] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Summary Cards: High/Low, Spread, Pip Value, ATR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              24h High / Low
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-800 mt-1">
              <span className="text-emerald-600 font-extrabold">
                {formatPrice(currentInstrument.high24h, currentInstrument.decimals)}
              </span>{' '}
              / <span className="text-rose-600 font-extrabold">{formatPrice(currentInstrument.low24h, currentInstrument.decimals)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Typical Spread
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-800 mt-1 flex items-baseline gap-1">
              <span className="text-[#5945F1] font-black">{currentInstrument.typicalSpread}</span>
              <span className="text-xs text-slate-500 font-normal">pips / pts</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Pip Value (1 Lot)
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-800 mt-1">
              ${currentInstrument.pipValue.toFixed(2)}{' '}
              <span className="text-xs text-slate-500 font-normal">USD</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              ATR (14 Volatility)
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-800 mt-1 flex items-baseline gap-1">
              <span className="text-slate-900 font-black">
                {formatPrice(currentInstrument.atr14, currentInstrument.decimals > 2 ? 4 : 2)}
              </span>
              <span className="text-xs text-slate-500 font-normal">daily range</span>
            </div>
          </div>
        </div>

        {/* Narrative Market Structure Analysis */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-700 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#5945F1] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">
              Market Structure Insight
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">
              {currentInstrument.description}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 4. TECHNICAL INDICATORS & OSCILLATORS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Oscillators & Moving Averages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Oscillators Table Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#5945F1]" />
                <h3 className="font-bold text-lg text-[#0b1c30]">
                  Oscillators Telemetry
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Timeframe: {activeTimeframe}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-semibold">
                    <th className="pb-3 font-semibold">Indicator</th>
                    <th className="pb-3 font-semibold">Value</th>
                    <th className="pb-3 font-semibold">Signal</th>
                    <th className="pb-3 font-semibold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* RSI */}
                  <tr>
                    <td className="py-3 font-bold text-slate-800">RSI (14)</td>
                    <td className="py-3 font-mono font-bold text-slate-700">
                      {currentInstrument.oscillators.rsi14.value}
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {currentInstrument.oscillators.rsi14.signal}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-slate-500">
                      {currentInstrument.oscillators.rsi14.value > 70
                        ? 'Overbought zone'
                        : currentInstrument.oscillators.rsi14.value < 30
                        ? 'Oversold zone'
                        : 'Healthy momentum'}
                    </td>
                  </tr>

                  {/* Stochastic */}
                  <tr>
                    <td className="py-3 font-bold text-slate-800">Stochastic (14, 3, 3)</td>
                    <td className="py-3 font-mono font-bold text-slate-700">
                      {currentInstrument.oscillators.stochK.value}
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {currentInstrument.oscillators.stochK.signal}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-slate-500">
                      Ascending impulse
                    </td>
                  </tr>

                  {/* MACD */}
                  <tr>
                    <td className="py-3 font-bold text-slate-800">MACD (12, 26, 9)</td>
                    <td className="py-3 font-mono font-bold text-slate-700">
                      {currentInstrument.oscillators.macd.value}
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {currentInstrument.oscillators.macd.signal}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-slate-500">
                      {currentInstrument.oscillators.macd.text}
                    </td>
                  </tr>

                  {/* ADX */}
                  <tr>
                    <td className="py-3 font-bold text-slate-800">ADX (14 Trend)</td>
                    <td className="py-3 font-mono font-bold text-slate-700">
                      {currentInstrument.oscillators.adx.value}
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-[#5945F1]">
                        {currentInstrument.oscillators.adx.signal}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-slate-500">
                      {currentInstrument.oscillators.adx.value > 25
                        ? 'Strong Trend Strength'
                        : 'Consolidation / Weak Trend'}
                    </td>
                  </tr>

                  {/* CCI */}
                  <tr>
                    <td className="py-3 font-bold text-slate-800">CCI (20)</td>
                    <td className="py-3 font-mono font-bold text-slate-700">
                      {currentInstrument.oscillators.cci20.value}
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {currentInstrument.oscillators.cci20.signal}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-slate-500">
                      Channel Expansion
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Moving Averages Telemetry Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#5945F1]" />
                <h3 className="font-bold text-lg text-[#0b1c30]">
                  Moving Averages Confluence
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                4 / 4 Bullish Alignment
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'EMA 20', item: currentInstrument.movingAverages.ema20 },
                { label: 'EMA 50', item: currentInstrument.movingAverages.ema50 },
                { label: 'EMA 100', item: currentInstrument.movingAverages.ema100 },
                { label: 'EMA 200', item: currentInstrument.movingAverages.ema200 },
              ].map((ma) => {
                const isBuy = ma.item.signal === 'Buy';
                return (
                  <div
                    key={ma.label}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-500">{ma.label}</div>
                      <div className="text-sm font-bold text-slate-800 mt-1 font-mono">
                        {formatPrice(ma.item.value, currentInstrument.decimals)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                          isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {ma.item.signal.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Pivot Points & Sentiment Meter (Sticky during scroll) */}
        <div className="space-y-6 lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar">
          {/* Sentiment Meter */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-[#0b1c30]">
                Community Sentiment
              </h3>
              <span className="text-xs font-bold text-emerald-600">
                {currentInstrument.bullishSentiment}% Long
              </span>
            </div>

            {/* Split Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${currentInstrument.bullishSentiment}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${100 - currentInstrument.bullishSentiment}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-700">
                Buyers {currentInstrument.bullishSentiment}%
              </span>
              <span className="text-rose-700">
                Sellers {100 - currentInstrument.bullishSentiment}%
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Technical Indicators Gauge:</span>
              <span className="font-bold text-[#0b1c30]">
                {currentInstrument.buyCount} Buy • {currentInstrument.neutralCount} Neutral • {currentInstrument.sellCount} Sell
              </span>
            </div>
          </div>

          {/* Pivot Points Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#5945F1]" />
                <h3 className="font-bold text-base sm:text-lg text-[#0b1c30]">
                  Pivot Points (Classic)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Daily</span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-rose-50 text-rose-800 font-medium">
                <span>Resistance 3 (R3)</span>
                <span className="font-mono font-bold">
                  {formatPrice(currentInstrument.pivots.r3, currentInstrument.decimals)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-rose-50/70 text-rose-700 font-medium">
                <span>Resistance 2 (R2)</span>
                <span className="font-mono font-bold">
                  {formatPrice(currentInstrument.pivots.r2, currentInstrument.decimals)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-rose-50/40 text-rose-700 font-medium">
                <span>Resistance 1 (R1)</span>
                <span className="font-mono font-bold">
                  {formatPrice(currentInstrument.pivots.r1, currentInstrument.decimals)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-indigo-100 text-[#5945F1] font-bold border border-indigo-200">
                <span>Central Pivot (P)</span>
                <span className="font-mono font-black">
                  {formatPrice(currentInstrument.pivots.pivot, currentInstrument.decimals)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-emerald-50/40 text-emerald-700 font-medium">
                <span>Support 1 (S1)</span>
                <span className="font-mono font-bold">
                  {formatPrice(currentInstrument.pivots.s1, currentInstrument.decimals)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-emerald-50/70 text-emerald-700 font-medium">
                <span>Support 2 (S2)</span>
                <span className="font-mono font-bold">
                  {formatPrice(currentInstrument.pivots.s2, currentInstrument.decimals)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                <span>Support 3 (S3)</span>
                <span className="font-mono font-bold">
                  {formatPrice(currentInstrument.pivots.s3, currentInstrument.decimals)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Calculators Shortcuts */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-[#bef226]">
              <Calculator className="w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Precision Calculators
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculate exact lot sizing, pip risk, and broker rebate values for {currentInstrument.symbol}.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onOpenCalculator?.('forex')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all text-left flex items-center justify-between border border-white/10 cursor-pointer"
              >
                <span>Pip & Margin Calculator</span>
                <ChevronRight className="w-4 h-4 text-[#bef226]" />
              </button>
              <button
                onClick={() => onOpenCalculator?.('planning')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all text-left flex items-center justify-between border border-white/10 cursor-pointer"
              >
                <span>Position Size & SL/TP Planner</span>
                <ChevronRight className="w-4 h-4 text-[#bef226]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. CORRELATED TRADING SIGNALS SECTION ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5945F1] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Active Market Signals
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30] mt-0.5">
              Live Signals for {currentInstrument.symbol}
            </h3>
          </div>

          <button
            onClick={() => onNavigateToTab?.('signals')}
            className="text-xs sm:text-sm font-bold text-[#5945F1] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Signals</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {correlatedSignals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {correlatedSignals.map((sig) => (
              <div
                key={sig.id}
                onClick={() => onSelectSignal(sig)}
                className="p-5 rounded-2xl border border-slate-200 hover:border-[#5945F1] bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                      {sig.ticker}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {sig.timeframe}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg ${
                      sig.action === 'BUY'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {sig.action}
                  </span>
                </div>

                <div className="my-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Entry:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {sig.entryPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TP 1:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {sig.takeProfit1}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SL:</span>
                    <span className="font-mono font-bold text-rose-600">
                      {sig.stopLoss}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Confidence: <strong className="text-slate-800">{sig.confidence}%</strong>
                  </span>
                  <span className="text-[#5945F1] font-bold group-hover:underline inline-flex items-center gap-0.5">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">
              No specific active signals for {currentInstrument.symbol} right now
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Our AI and analyst models update every 15 minutes. Check the general signals board to browse other assets.
            </p>
            <button
              onClick={() => onNavigateToTab?.('signals')}
              className="mt-4 px-4 py-2 rounded-xl bg-[#5945F1] text-white text-xs font-bold hover:bg-[#4d3ad6] transition-colors cursor-pointer"
            >
              Browse All Signals
            </button>
          </div>
        )}
      </div>

      {/* ─── 6. CONNECT BROKER & TRADE CASHBACK CTA ─── */}
      <div className="bg-[#bef226] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-xs font-black uppercase tracking-wider text-black/80 font-mono">
            GET PAID TO TRADE
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-black">
            Ready to trade {currentInstrument.symbol}?
          </h3>
          <p className="text-xs sm:text-sm text-black/80 font-medium max-w-xl">
            Connect your broker account through MarketSyde to earn automatic cash rebates on every lot traded — win or lose.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenConnectModal(brokers[0])}
            className="px-6 py-3 rounded-xl bg-black hover:bg-slate-900 text-white font-extrabold text-sm transition-all shadow-md cursor-pointer whitespace-nowrap active:scale-95"
          >
            Connect Broker Account
          </button>
          <button
            onClick={() => onNavigateToTab?.('brokers')}
            className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white text-black font-bold text-sm transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            View Brokers
          </button>
        </div>
      </div>
    </div>
  );
};
