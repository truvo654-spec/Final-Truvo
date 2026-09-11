import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import {
  Search,
  ChevronDown,
  Plus,
  Minus,
  ArrowLeft,
  Zap,
} from 'lucide-react';

interface LevelPointsGuideViewProps {
  user: UserProfile;
  onBackToMissions?: () => void;
}

interface InstrumentItem {
  symbol: string;
  category: 'forex' | 'indices' | 'stocks' | 'commodities' | 'cryptos';
  baseFlag1: string; // ISO or emoji or SVG key
  baseFlag2: string;
  booster?: string; // '1.25x'
  boosterColor?: 'lime' | 'pink';
  points: number;
}

const INSTRUMENTS_DATA: InstrumentItem[] = [
  { symbol: 'EUR/USD', category: 'forex', baseFlag1: 'eu', baseFlag2: 'us', booster: '1.25x', boosterColor: 'lime', points: 50 },
  { symbol: 'USD/JPY', category: 'forex', baseFlag1: 'us', baseFlag2: 'jp', points: 50 },
  { symbol: 'EUR/JPY', category: 'forex', baseFlag1: 'eu', baseFlag2: 'jp', points: 50 },
  { symbol: 'AUD/USD', category: 'forex', baseFlag1: 'au', baseFlag2: 'us', points: 50 },
  { symbol: 'CHF/USD', category: 'forex', baseFlag1: 'ch', baseFlag2: 'us', booster: '1.25x', boosterColor: 'pink', points: 50 },
  { symbol: 'EUR/GBP', category: 'forex', baseFlag1: 'eu', baseFlag2: 'gb', booster: '1.25x', boosterColor: 'pink', points: 50 },
  { symbol: 'GBP/JPY', category: 'forex', baseFlag1: 'gb', baseFlag2: 'jp', points: 50 },
  { symbol: 'CAD/USD', category: 'forex', baseFlag1: 'ca', baseFlag2: 'us', booster: '1.25x', boosterColor: 'lime', points: 50 },
  { symbol: 'AUD/JPY', category: 'forex', baseFlag1: 'au', baseFlag2: 'jp', points: 50 },
  { symbol: 'CAD/JPY', category: 'forex', baseFlag1: 'ca', baseFlag2: 'jp', points: 50 },
  { symbol: 'NZD/USD', category: 'forex', baseFlag1: 'nz', baseFlag2: 'us', points: 50 },
  { symbol: 'USD/CHF', category: 'forex', baseFlag1: 'us', baseFlag2: 'ch', booster: '1.25x', boosterColor: 'lime', points: 50 },
  // Indices
  { symbol: 'US500 (S&P 500)', category: 'indices', baseFlag1: 'us', baseFlag2: 'us', booster: '1.25x', boosterColor: 'lime', points: 65 },
  { symbol: 'NAS100 (Nasdaq)', category: 'indices', baseFlag1: 'us', baseFlag2: 'us', points: 60 },
  { symbol: 'GER40 (DAX)', category: 'indices', baseFlag1: 'eu', baseFlag2: 'eu', points: 55 },
  // Commodities
  { symbol: 'XAU/USD (Gold)', category: 'commodities', baseFlag1: 'us', baseFlag2: 'us', booster: '1.25x', boosterColor: 'lime', points: 70 },
  { symbol: 'XAG/USD (Silver)', category: 'commodities', baseFlag1: 'us', baseFlag2: 'us', points: 50 },
  { symbol: 'USOIL (WTI Crude)', category: 'commodities', baseFlag1: 'us', baseFlag2: 'us', points: 55 },
  // Cryptos
  { symbol: 'BTC/USD (Bitcoin)', category: 'cryptos', baseFlag1: 'us', baseFlag2: 'us', booster: '1.25x', boosterColor: 'pink', points: 75 },
  { symbol: 'ETH/USD (Ethereum)', category: 'cryptos', baseFlag1: 'us', baseFlag2: 'us', points: 60 },
  { symbol: 'SOL/USD (Solana)', category: 'cryptos', baseFlag1: 'us', baseFlag2: 'us', points: 50 },
];

function FacetedGemIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 inline-block`} fill="none">
      <defs>
        <linearGradient id="guideGemCrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="guideGemPavilion" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="60%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>
      </defs>
      <polygon points="7,4 17,4 21,9 17,9 7,9 3,9" fill="#c7d2fe" />
      <polygon points="7,4 17,4 14,9 10,9" fill="url(#guideGemCrown)" />
      <polygon points="7,4 10,9 3,9" fill="#818cf8" />
      <polygon points="17,4 21,9 14,9" fill="#818cf8" />
      <polygon points="3,9 10,9 12,20" fill="url(#guideGemPavilion)" />
      <polygon points="10,9 14,9 12,20" fill="#a3e635" />
      <polygon points="14,9 21,9 12,20" fill="url(#guideGemPavilion)" />
    </svg>
  );
}

// Dual Flag Pill matching the visual style in the reference
function PairFlag({ flag1, flag2 }: { flag1: string; flag2: string }) {
  const getFlagEmoji = (code: string) => {
    switch (code) {
      case 'eu': return '🇪🇺';
      case 'us': return '🇺🇸';
      case 'jp': return '🇯🇵';
      case 'gb': return '🇬🇧';
      case 'au': return '🇦🇺';
      case 'ch': return '🇨🇭';
      case 'ca': return '🇨🇦';
      case 'nz': return '🇳🇿';
      default: return '🌐';
    }
  };

  return (
    <div className="flex items-center -space-x-1 shrink-0 text-base leading-none">
      <span className="relative z-10 drop-shadow-xs">{getFlagEmoji(flag1)}</span>
      <span className="relative z-0 drop-shadow-xs">{getFlagEmoji(flag2)}</span>
    </div>
  );
}

export const LevelPointsGuideView: React.FC<LevelPointsGuideViewProps> = ({
  user,
  onBackToMissions,
}) => {
  // Calculator state
  const [calcSymbol, setCalcSymbol] = useState('EUR/USD');
  const [lotCount, setLotCount] = useState<number>(0);

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'forex' | 'indices' | 'stocks' | 'commodities' | 'cryptos'>('forex');
  const [onlyWithBooster, setOnlyWithBooster] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Calculation for "Manifest Your Points"
  const selectedInstrument = INSTRUMENTS_DATA.find((i) => i.symbol === calcSymbol) || INSTRUMENTS_DATA[0];
  const multiplier = selectedInstrument.booster ? 1.25 : 1.0;
  const estimatedPoints = Math.round(lotCount * selectedInstrument.points * multiplier);

  // Filter instruments
  const filteredInstruments = useMemo(() => {
    return INSTRUMENTS_DATA.filter((item) => {
      if (selectedCategory !== item.category && selectedCategory !== 'forex') {
        // if category tab isn't forex, filter by that category
        return item.category === selectedCategory;
      }
      if (selectedCategory === 'forex' && item.category !== 'forex') {
        return false;
      }
      if (onlyWithBooster && !item.booster) {
        return false;
      }
      if (searchQuery.trim()) {
        return item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [selectedCategory, onlyWithBooster, searchQuery]);

  const faqs = [
    {
      q: 'How are points calculated?',
      a: 'Points are accrued automatically each time an eligible trade is executed through your linked broker accounts. Points per lot vary by asset class (typically 50–75 points per round-turn lot) and are boosted by your tier status or active market booster events.',
    },
    {
      q: 'Do all instruments earn the same points?',
      a: 'No. Major forex pairs earn a baseline of 50 points per standard lot, whereas selected exotic pairs, indices, precious metals (such as XAU/USD), and cryptos may yield higher base rates or feature temporary 1.25x–1.5x boosters.',
    },
    {
      q: 'Can I earn points from multiple brokers?',
      a: 'Yes! MarketSyde seamlessly aggregates trading volumes across all your connected broker accounts into one unified balance, helping you level up faster without fragmenting your progress.',
    },
    {
      q: 'What happens when I reach a new level?',
      a: 'Reaching higher tiers (from Rookie to Bronze, Silver, Gold, and VIP) permanently increases your cashback multiplier rate (up to +25%), grants access to institutional trading signals, and provides priority rebate withdrawals.',
    },
  ];

  return (
    <div className="w-full relative overflow-hidden pb-16">
      {/* ─── Top Back Navigation Link ─── */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToMissions}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#5338ec] hover:text-[#432ec4] bg-white border border-indigo-100 hover:border-indigo-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Missions, Points & Credits</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>Home</span>
          <span>/</span>
          <span>Missions</span>
          <span>/</span>
          <span className="text-[#5338ec] font-semibold">Level Points Guide</span>
        </div>
      </div>

      {/* ─── Hero Title Section with Orbit Graphics ─── */}
      <div className="relative pt-2 pb-8 sm:pb-12">
        {/* Orbital Ellipse Graphic Background */}
        <div className="absolute top-[-40px] right-[-30px] sm:right-[5%] w-[380px] sm:w-[540px] h-[380px] sm:h-[540px] pointer-events-none select-none z-0">
          <svg viewBox="0 0 540 540" className="w-full h-full overflow-visible opacity-70">
            {/* Dotted Elliptical Path */}
            <ellipse
              cx="270"
              cy="270"
              rx="250"
              ry="210"
              fill="none"
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
          </svg>

          {/* 3D Glowing Purple Orb Top Right */}
          <div className="absolute top-[38px] left-[70px] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#312e81] via-[#5338ec] to-[#a5b4fc] shadow-lg shadow-indigo-500/30 flex items-center justify-center transform -rotate-12">
            <div className="w-10 h-10 rounded-full bg-white/10 blur-xs" />
          </div>

          {/* Curved Hand-Drawn Arrow swooping down */}
          <div className="absolute top-[130px] left-[130px] w-16 h-16 pointer-events-none">
            <svg viewBox="0 0 60 60" fill="none" className="w-full h-full stroke-[#6366f1]" strokeWidth="2.2" strokeLinecap="round">
              <path d="M 12 10 Q 38 18 42 38" />
              <path d="M 34 35 L 42 40 L 44 30" />
            </svg>
          </div>
        </div>

        {/* Big Display Title */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold font-display tracking-tight text-[#5945F1] leading-tight">
            Level Points Guide
            <span className="text-[#FE01B1] font-black inline-block ml-0.5">.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-normal mt-3 max-w-2xl leading-relaxed">
            Different markets. Different point rates. See how each instrument contributes to your next level.
          </p>
        </div>
      </div>

      {/* ─── Main Content 2-Column Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* ─── LEFT COLUMN: How Do Points Work + Manifest Your Points ─── */}
        <div className="lg:col-span-5 space-y-8">
          {/* Section: How Do Points Work? */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-display text-[#0b1c30] tracking-tight">
              How Do Points Work?
            </h2>

            <ul className="space-y-4 text-sm text-slate-800 leading-snug">
              {/* Bullet 1: Black circle */}
              <li className="flex items-start gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-black shrink-0 mt-0.5" />
                <span className="font-normal text-slate-800">Every eligible trade earns points.</span>
              </li>

              {/* Bullet 2: Hot Pink circle */}
              <li className="flex items-start gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FE01B1] shrink-0 mt-0.5" />
                <span className="font-normal text-slate-800">
                  Different markets payout different points amount based on volume and cashback.
                </span>
              </li>

              {/* Bullet 3: Volt Green circle */}
              <li className="flex items-start gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#a3e635] shrink-0 mt-0.5" />
                <span className="font-normal text-slate-800">
                  More points mean higher levels, which means better perks.
                </span>
              </li>

              {/* Bullet 4: Royal Blue circle */}
              <li className="flex items-start gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#5338ec] shrink-0 mt-0.5" />
                <span className="font-normal text-slate-800">Trade smarter. Level faster.</span>
              </li>

              {/* Bullet 5: Light Periwinkle circle */}
              <li className="flex items-start gap-3.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#a5b4fc] shrink-0 mt-0.5" />
                <span className="font-normal text-slate-800">
                  Keep an eye out for temporary point boosters on select instruments.
                </span>
              </li>
            </ul>
          </div>

          {/* Interactive Card: Manifest Your Points */}
          <div className="rounded-3xl border border-[#c7d2fe] bg-white p-6 shadow-xs hover:shadow-sm transition-shadow relative overflow-hidden">
            {/* Subtle Gradient Accent Border Effect */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none border border-pink-200/50" />

            <div className="relative z-10 space-y-5">
              <div>
                <h3 className="text-xl font-bold font-display text-[#5338ec] tracking-tight">
                  Manifest Your Points
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select an asset and lot volume to estimate your daily point yield.
                </p>
              </div>

              {/* Inputs Row: Symbol Selector + Number of Lot */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Symbol Dropdown */}
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1.5">
                    Symbol
                  </label>
                  <div className="relative">
                    <select
                      value={calcSymbol}
                      onChange={(e) => setCalcSymbol(e.target.value)}
                      className="w-full appearance-none bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec] pr-8 cursor-pointer"
                    >
                      {INSTRUMENTS_DATA.map((inst) => (
                        <option key={inst.symbol} value={inst.symbol}>
                          {inst.symbol} {inst.booster ? `(${inst.booster})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Number of Lot Input */}
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1.5">
                    Number of Lot
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="0.1"
                      value={lotCount === 0 ? '' : lotCount}
                      placeholder="0"
                      onChange={(e) => setLotCount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec]"
                    />
                    <span className="absolute right-1 -bottom-4 text-[10px] text-slate-400 font-normal">
                      per day
                    </span>
                  </div>
                </div>
              </div>

              {/* Estimated Points Output */}
              <div className="flex items-center justify-between pt-3">
                <span className="text-sm font-semibold text-[#5338ec]">
                  Estimated points
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold font-display text-[#5338ec] tracking-tight">
                  {estimatedPoints}
                </span>
              </div>

              {/* Bottom Prediction / Level Track */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="max-w-[170px]">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Math Predicts Your Level
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Boost your level and rewards with your favorite symbol for the same effort
                  </p>
                </div>

                {/* Level Node Track with "You're here!" annotation */}
                <div className="flex flex-col items-center relative">
                  {/* Handwritten style "You're here!" pointer */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mb-1">
                    <span>You're <strong className="text-slate-900 font-bold">here!</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active Node: Rookie Ghost Icon */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-xl border border-indigo-200 bg-indigo-50/70 flex items-center justify-center text-sm shadow-2xs">
                        {/* Ghost mascot silhouette */}
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#5338ec]">
                          <path d="M12 2a7 7 0 0 0-7 7v10l2.5-1.5L10 19l2-1.5 2 1.5 2.5-1.5L19 19V9a7 7 0 0 0-7-7zm-2.5 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#0b1c30] mt-1">
                        Rookie
                      </span>
                    </div>

                    {/* Dotted connecting line */}
                    <div className="w-4 border-t-2 border-dotted border-slate-300 -mt-3" />

                    {/* Milestone 2: Gray dot */}
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-300 -mt-3" title="Bronze" />

                    <div className="w-4 border-t-2 border-dotted border-slate-300 -mt-3" />

                    {/* Milestone 3: Gray dot */}
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-300 -mt-3" title="Silver" />

                    <div className="w-4 border-t-2 border-dotted border-slate-300 -mt-3" />

                    {/* Milestone 4: Gray dot */}
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-300 -mt-3" title="Gold" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Symbols Filter, Categories & Table ─── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Search Input: Account Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700 block">
              Account Currency
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search symbol"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Tabs & "Only with booster" Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-indigo-100 pb-2">
            {/* Tabs */}
            <div className="flex items-center gap-4 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar">
              {/* Forex (with 99+ badge) */}
              <button
                onClick={() => setSelectedCategory('forex')}
                className={`flex items-center gap-1.5 pb-1 transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'forex'
                    ? 'text-[#5338ec] font-bold border-b-2 border-[#5338ec]'
                    : 'text-slate-600 hover:text-[#5338ec]'
                }`}
              >
                <span>Forex</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#eef2ff] text-[10px] font-bold text-[#5338ec] border border-indigo-200">
                  99+
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('indices')}
                className={`pb-1 transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'indices'
                    ? 'text-[#5338ec] font-bold border-b-2 border-[#5338ec]'
                    : 'text-slate-600 hover:text-[#5338ec]'
                }`}
              >
                Indices
              </button>

              <button
                onClick={() => setSelectedCategory('stocks')}
                className={`pb-1 transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'stocks'
                    ? 'text-[#5338ec] font-bold border-b-2 border-[#5338ec]'
                    : 'text-slate-600 hover:text-[#5338ec]'
                }`}
              >
                Stocks
              </button>

              <button
                onClick={() => setSelectedCategory('commodities')}
                className={`pb-1 transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'commodities'
                    ? 'text-[#5338ec] font-bold border-b-2 border-[#5338ec]'
                    : 'text-slate-600 hover:text-[#5338ec]'
                }`}
              >
                Commodities
              </button>

              <button
                onClick={() => setSelectedCategory('cryptos')}
                className={`pb-1 transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'cryptos'
                    ? 'text-[#5338ec] font-bold border-b-2 border-[#5338ec]'
                    : 'text-slate-600 hover:text-[#5338ec]'
                }`}
              >
                Cryptos
              </button>
            </div>

            {/* Toggle Switch: Only with booster */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-xs font-normal text-slate-700 select-none">
                Only with booster
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={onlyWithBooster}
                onClick={() => setOnlyWithBooster(!onlyWithBooster)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  onlyWithBooster ? 'bg-[#5338ec]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    onlyWithBooster ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ─── Instruments Table with Background Orbit Satellite ─── */}
          <div className="rounded-2xl border border-indigo-100/90 bg-white overflow-hidden shadow-2xs relative">
            {/* Dotted Orbit Path Line through table */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
              <svg viewBox="0 0 600 500" className="w-full h-full">
                <path
                  d="M 500 -20 C 350 120 400 320 580 440"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                {/* Purple Satellite Dot */}
                <circle cx="496" cy="118" r="5" fill="#5338ec" />
              </svg>
            </div>

            <div className="relative z-10 divide-y divide-indigo-50/80">
              {/* Header Row */}
              <div className="flex items-center justify-between px-5 py-3 text-xs font-medium text-[#5338ec] bg-[#fcfdff]">
                <span>Symbol</span>
                <span>Points Earned</span>
              </div>

              {/* Rows */}
              {filteredInstruments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No instruments match your criteria.
                </div>
              ) : (
                filteredInstruments.slice(0, 10).map((inst) => (
                  <div
                    key={inst.symbol}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Left: Dual Flag + Symbol + Booster Pill */}
                    <div className="flex items-center gap-3">
                      <PairFlag flag1={inst.baseFlag1} flag2={inst.baseFlag2} />
                      <span className="text-sm font-semibold text-slate-800">
                        {inst.symbol}
                      </span>
                      {inst.booster && (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            inst.boosterColor === 'lime'
                              ? 'bg-[#ecfccb] text-[#65a30d] border border-[#d9f99d]'
                              : 'bg-[#fdf2f8] text-[#db2777] border border-[#fbcfe8]'
                          }`}
                        >
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          <span>{inst.booster}</span>
                        </span>
                      )}
                    </div>

                    {/* Right: Faceted Gem + Points (50) */}
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#5338ec]">
                      <FacetedGemIcon className="w-4 h-4" />
                      <span>{inst.points}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs font-medium text-slate-600">
            <button
              onClick={() => setCurrentPage(1)}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              |&lt;
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              &lt;
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold cursor-pointer ${
                currentPage === 1
                  ? 'border border-[#5338ec] text-[#5338ec] bg-indigo-50/50'
                  : 'border border-slate-200 hover:bg-slate-100'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${
                currentPage === 2
                  ? 'border border-[#5338ec] text-[#5338ec] bg-indigo-50/50 font-bold'
                  : 'border border-slate-200 hover:bg-slate-100'
              }`}
            >
              2
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              onClick={() => setCurrentPage(20)}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              20
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(20, currentPage + 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              &gt;
            </button>
            <button
              onClick={() => setCurrentPage(20)}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              &gt;|
            </button>
          </div>
        </div>
      </div>

      {/* ─── Got Questions? (FAQ Accordion) ─── */}
      <div className="mt-20 pt-8 max-w-4xl mx-auto text-center space-y-3">
        <h2 className="text-3xl font-extrabold font-display text-[#5338ec] tracking-tight">
          Got Questions?
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Quick answers to help you navigate points, levels, and payouts.
        </p>

        {/* Accordion List */}
        <div className="text-left mt-8 divide-y divide-slate-200/80 border-t border-b border-slate-200/80">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.q} className="py-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 text-left py-1 group cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-[#5338ec] transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-[#5338ec] p-1 rounded-md group-hover:bg-indigo-50 transition-colors">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="pt-2.5 pb-2 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200 pr-8">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
