import React, { useState } from 'react';
import {
  UserProfile,
  Broker,
  MarketSignal,
} from '../../types';
import {
  Calendar,
  Grid,
  ChevronRight,
  ArrowRight,
  Gem,
  Link2,
  CandlestickChart,
  DollarSign,
  UserCheck,
} from 'lucide-react';

interface EmptyStateDashboardViewProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  onOpenViewPlan: () => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onNavigateToTab: (tab: string) => void;
  onNavigateToConnectBroker?: (broker?: Broker) => void;
  onSelectBrokerDetail?: (broker: Broker) => void;
  onSelectSignal?: (signal: MarketSignal) => void;
}

/**
 * Rookie Ghost Vector Badge (matches exact ghost outline from Empty state.png)
 */
function RookieGhostIcon() {
  return (
    <div className="w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center shrink-0">
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-md"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M 20 60 C 20 25, 80 25, 80 60 L 80 105 L 68 95 L 56 105 L 44 95 L 32 105 L 20 95 Z"
          fill="none"
        />
        <circle cx="38" cy="52" r="6" fill="white" stroke="none" />
        <circle cx="62" cy="52" r="6" fill="white" stroke="none" />
      </svg>
    </div>
  );
}

/**
 * 3D Calendar Vector Icon for Active Streak
 */
function ActiveStreakCalendarIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c084fc] via-[#a855f7] to-[#7c3aed] p-2 shadow-sm flex items-center justify-center relative shrink-0">
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 drop-shadow-xs">
        <rect x="5" y="8" width="26" height="24" rx="6" fill="url(#streakCalGrad)" />
        <rect x="5" y="8" width="26" height="8" rx="3" fill="#6b21a8" />
        <rect x="10" y="5" width="3" height="5" rx="1.5" fill="#f8fafc" />
        <rect x="23" y="5" width="3" height="5" rx="1.5" fill="#f8fafc" />
        <circle cx="12" cy="21" r="1.5" fill="white" />
        <circle cx="18" cy="21" r="1.5" fill="white" />
        <circle cx="24" cy="21" r="1.5" fill="white" />
        <circle cx="12" cy="26" r="1.5" fill="white" />
        <circle cx="18" cy="26" r="1.5" fill="white" />
        <circle cx="24" cy="26" r="1.5" fill="white" />
        <defs>
          <linearGradient id="streakCalGrad" x1="5" y1="8" x2="31" y2="32">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * 3D Wallet & Coin Bag Vector Icon for Cumulative Cashback Empty State
 */
function WalletCoin3DIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#818cf8] via-[#6366f1] to-[#4f46e5] p-2 shadow-sm flex items-center justify-center relative shrink-0">
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 drop-shadow-xs">
        <path
          d="M 8 14 C 8 10, 12 8, 18 8 C 24 8, 28 10, 28 14 L 30 26 C 30 30, 26 32, 18 32 C 10 32, 6 30, 6 26 Z"
          fill="url(#walletEmptyGrad)"
        />
        <path
          d="M 10 14 C 10 12, 13 10, 18 10 C 23 10, 26 12, 26 14 C 26 16, 23 17, 18 17 C 13 17, 10 16, 10 14 Z"
          fill="#c7d2fe"
        />
        <circle cx="18" cy="22" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
        <text x="18" y="24.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#854d0e">$</text>
        <defs>
          <linearGradient id="walletEmptyGrad" x1="6" y1="8" x2="30" y2="32">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * 3D Coin Swap Vector Icon for Top Earning Assets Empty State
 */
function CoinSwap3DIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c084fc] via-[#a855f7] to-[#7e22ce] p-2 shadow-sm flex items-center justify-center relative shrink-0">
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 drop-shadow-xs">
        <circle cx="18" cy="18" r="14" fill="url(#swapEmptyGrad)" />
        <path
          d="M 11 15 C 13 11, 18 10, 22 12 L 20 14 M 22 12 L 23 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 25 21 C 23 25, 18 26, 14 24 L 16 22 M 14 24 L 13 27"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="18" r="4.5" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
        <text x="18" y="20" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#854d0e">$</text>
        <defs>
          <linearGradient id="swapEmptyGrad" x1="4" y1="4" x2="32" y2="32">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * 3D Empty Performance Chart Graphic (pink, green, yellow bars + curved green arrow)
 */
function EmptyPerformanceChartGraphic() {
  return (
    <div className="relative w-32 h-24 flex items-center justify-center">
      <svg viewBox="0 0 100 80" fill="none" className="w-full h-full drop-shadow-md">
        <ellipse cx="50" cy="70" rx="42" ry="7" fill="#e2e8f0" />
        <rect x="20" y="38" width="12" height="30" rx="5" fill="url(#pinkBarGrad2)" />
        <rect x="36" y="26" width="12" height="42" rx="5" fill="url(#greenBarGrad2)" />
        <rect x="52" y="16" width="12" height="52" rx="5" fill="url(#yellowBarGrad2)" />
        <rect x="68" y="8" width="12" height="60" rx="5" fill="url(#purpleBarGrad2)" />
        <path
          d="M 16 52 Q 44 42 74 16"
          stroke="#16a34a"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="76,14 66,16 74,24" fill="#16a34a" />
        <defs>
          <linearGradient id="pinkBarGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <linearGradient id="greenBarGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="yellowBarGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="purpleBarGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Mini Sparkline SVG
 */
function MiniSparkline({ trend, color }: { trend: 'up' | 'down'; color: string }) {
  const points = trend === 'up' ? '0,14 8,11 16,13 24,7 32,9 40,2' : '0,2 8,6 16,4 24,11 32,9 40,14';
  return (
    <div className="w-10 h-4 flex items-center">
      <svg viewBox="0 0 40 16" className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

export const EmptyStateDashboardView: React.FC<EmptyStateDashboardViewProps> = ({
  user,
  brokers,
  signals,
  onOpenViewPlan,
  onOpenConnectModal,
  onNavigateToTab,
  onNavigateToConnectBroker,
  onSelectBrokerDetail,
  onSelectSignal,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | 'All'>('1M');

  const getTargetBroker = (brokerName: string) => {
    return (
      brokers.find((b) => b.name.toLowerCase().includes(brokerName.toLowerCase().replace(' ', ''))) ||
      brokers[0]
    );
  };

  const handleConnectBrokerAction = (brokerName: string) => {
    const target = getTargetBroker(brokerName);
    if (onNavigateToConnectBroker) {
      onNavigateToConnectBroker(target);
    } else {
      onNavigateToTab('connect-to-truvo');
    }
  };

  const handleCardClick = (brokerName: string) => {
    const target = getTargetBroker(brokerName);
    if (onSelectBrokerDetail) {
      onSelectBrokerDetail(target);
    } else {
      onNavigateToTab('brokers');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* ════════════ LEFT COLUMN (8 cols) ════════════ */}
      <div className="lg:col-span-8 space-y-5">
        {/* ─── ROW 1: Quick Start Guide (Left 2/3) & Your Level (Right 1/3) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Quick Start Guide Card (md:col-span-8) */}
          <div className="md:col-span-8 rounded-2xl bg-white border border-[#f0abfc]/90 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="font-display font-extrabold text-lg text-[#0b1c30] tracking-tight">
                Quick Start Guid<span className="text-[#FD02B0]">e.</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Turn your trading into cashback, insights and rewards.
              </p>

              {/* 4 Steps Row with Connecting Dots */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#5945F1] text-white flex items-center justify-center shadow-2xs shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-[#0b1c30]">Choose Broker</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Choose yours, or find a better one here
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center space-y-1.5 relative">
                  <div className="w-8 h-8 rounded-full border border-slate-300 text-[#5945F1] flex items-center justify-center shadow-2xs shrink-0 bg-white">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-[#0b1c30]">Link Trading Account</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Connect your account to start tracking
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full border border-slate-300 text-[#5945F1] flex items-center justify-center shadow-2xs shrink-0 bg-white">
                    <CandlestickChart className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-[#0b1c30]">Trade as Usual</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Keep trading normally on your platform
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full border border-slate-300 text-[#5945F1] flex items-center justify-center shadow-2xs shrink-0 bg-white">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-[#0b1c30]">Earn Cashback</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Get paid to trade. Automatically
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Level Card (md:col-span-4) */}
          <div className="md:col-span-4 rounded-2xl bg-[#5945F1] p-5 text-white flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div>
              <div className="text-[11px] font-semibold text-white/80">
                Your Level
              </div>
              <div className="flex items-center gap-3 mt-1">
                <RookieGhostIcon />
                <div>
                  <h4 className="font-display font-black text-xl text-white">
                    {user.rankTitle || 'Rookie'}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-white/95 mt-0.5">
                    <Gem className="w-3 h-3 text-white shrink-0" />
                    <span>{user.currentPoints}/150 points.</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-3 mb-2 overflow-hidden">
                <div
                  className="h-full bg-[#FD02B0] rounded-full"
                  style={{ width: `${Math.min(100, (user.currentPoints / 150) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-1 text-[10px] text-white/90">
                <span>Next level at 50 Points</span>
                <button
                  onClick={onOpenViewPlan}
                  className="px-2.5 py-0.5 rounded-full bg-white hover:bg-white/90 text-[#5945F1] font-bold text-[10px] shadow-2xs transition-all cursor-pointer"
                >
                  View Plan
                </button>
              </div>
            </div>

            <div className="border-t border-white/20 pt-2.5 mt-3 space-y-1 text-[11px] text-white/95 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">$</span>
                <span>+10% Cashback Boost</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold">⚡</span>
                <span>Higher Confidence Signals</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 2: Your Stats: March 2026 ─── */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          {/* Header: Title & Timeframe Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-700 tracking-tight">
              Your Stats: <span className="text-[#0b1c30] font-black">March 2026</span>
            </h2>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setSelectedTimeframe('1D')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedTimeframe === '1D'
                      ? 'bg-[#CAEB0E] text-[#0b1c30] font-black shadow-xs'
                      : 'hover:text-[#0b1c30]'
                  }`}
                >
                  1D
                </button>
                <button
                  onClick={() => setSelectedTimeframe('1W')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedTimeframe === '1W'
                      ? 'bg-[#CAEB0E] text-[#0b1c30] font-black shadow-xs'
                      : 'hover:text-[#0b1c30]'
                  }`}
                >
                  1W
                </button>
                <button
                  onClick={() => setSelectedTimeframe('1M')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedTimeframe === '1M'
                      ? 'bg-[#CAEB0E] text-[#0b1c30] font-black shadow-xs'
                      : 'hover:text-[#0b1c30]'
                  }`}
                >
                  1M
                </button>
                <button
                  onClick={() => setSelectedTimeframe('All')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedTimeframe === 'All'
                      ? 'bg-[#CAEB0E] text-[#0b1c30] font-black shadow-xs'
                      : 'hover:text-[#0b1c30]'
                  }`}
                >
                  All
                </button>
              </div>

              <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                  <Calendar className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 3 Metric Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 pb-4 border-b border-slate-100 items-stretch">
            {/* Block 1: ACTIVE STREAK */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <ActiveStreakCalendarIcon />
                <div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    ACTIVE STREAK
                  </div>
                  <div className="text-2xl font-black font-display text-[#0b1c30] leading-tight">
                    0 days
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-normal">
                    Track your consistency
                  </div>
                </div>
              </div>

              {/* 4x7 Dot Matrix (28 dots total, all gray/empty) */}
              <div className="pt-2">
                <div className="grid grid-cols-7 gap-1.5 max-w-[170px]">
                  {[...Array(28)].map((_, i) => (
                    <span
                      key={`streak-dot-${i}`}
                      className="w-2.5 h-2.5 rounded-full bg-slate-200"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Block 2: CUMULATIVE CASHBACK (Clickable -> Leads to Cashback Overview) */}
            <div
              onClick={() => onNavigateToTab('cashback-overview')}
              className="space-y-2 p-2 rounded-2xl border border-transparent hover:border-[#FD02B0]/40 hover:bg-slate-50/70 transition-all cursor-pointer group"
              title="Click to view Cashback Overview"
            >
              <div className="flex items-start gap-3">
                <WalletCoin3DIcon />
                <div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <span>CUMULATIVE CASHBACK</span>
                    <span className="text-[10px] text-[#FD02B0] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-display text-[#0b1c30] leading-tight">
                      $0.00
                    </span>
                    <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-normal">
                    0.0 Lots
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Your cashback earned during the selected period will appear here.
              </p>
            </div>

            {/* Block 3: TOP 3 EARNING ASSETS */}
            <div className="space-y-2 p-2">
              <div className="flex items-start gap-3">
                <CoinSwap3DIcon />
                <div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    TOP 3 EARNING ASSETS
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Your top-paying assets will rank here once you take your first trade.
              </p>
            </div>
          </div>

          {/* 4 Secondary Mini Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 text-left border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Cashback (1M)</div>
              <div className="text-sm sm:text-base font-bold text-[#0b1c30] mt-1 font-mono">
                $0.00
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Lots Traded</div>
              <div className="text-sm sm:text-base font-bold text-[#0b1c30] mt-1 font-mono">
                0
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Avg Cashback / Lot</div>
              <div className="text-sm sm:text-base font-bold text-[#0b1c30] mt-1 font-mono">
                $0.00
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Best Day</div>
              <div className="text-sm sm:text-base font-bold text-[#0b1c30] mt-1 font-mono">
                $0.00
              </div>
            </div>
          </div>

          {/* Empty Performance Graphic Box with 3D Bar Chart and Button */}
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <EmptyPerformanceChartGraphic />
            <div className="space-y-1">
              <div className="font-bold text-sm text-[#0b1c30]">
                Your performance tracking starts with your first trade.
              </div>
              <div className="text-xs text-slate-500">
                As a blank chart never paid anyone.
              </div>
            </div>
            <button
              onClick={() => handleConnectBrokerAction('XM')}
              className="mt-1 px-5 py-2 rounded-full border-2 border-[#5945F1] text-[#5945F1] hover:bg-[#5945F1] hover:text-white font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              Connect Broker
            </button>
          </div>
        </div>

        {/* ─── ROW 3: Ready to connect? (6 Broker Cards) ─── */}
        <div className="space-y-4 pt-1">
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#5945F1] tracking-tight">
              Ready to connect?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified, reliable, and fully supported. Pick your broker below to securely sync your trading data.
            </p>
          </div>

          {/* 6 Broker Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                name: 'XM',
                cashback: '$8.00 Max Cashback',
                logoBg: 'bg-black',
                renderLogo: () => (
                  <div className="flex items-center justify-center font-black text-white text-sm relative overflow-hidden">
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#E11928] rounded-full" />
                    <span>XM</span>
                  </div>
                ),
              },
              {
                name: 'HFM',
                cashback: '$8.00 Max Cashback',
                logoBg: 'bg-black',
                renderLogo: () => (
                  <div className="flex flex-col items-center justify-center leading-none">
                    <span className="font-extrabold text-white text-[11px] tracking-tight">HFM</span>
                    <span className="text-[5px] text-slate-400 font-bold uppercase tracking-tighter scale-90">HF MARKETS</span>
                  </div>
                ),
              },
              {
                name: 'Exness',
                cashback: '$8.00 Max Cashback',
                logoBg: 'bg-[#FFCC00]',
                renderLogo: () => (
                  <div className="flex items-center justify-center font-black text-black text-sm tracking-tighter">
                    ex
                  </div>
                ),
              },
              {
                name: 'Pepperstone',
                cashback: '$8.00 Max Cashback',
                logoBg: 'bg-[#002B49]',
                renderLogo: () => (
                  <div className="flex items-center justify-center font-black text-white text-base">
                    P
                  </div>
                ),
              },
              {
                name: 'IC Markets',
                cashback: '$8.00 Max Cashback',
                logoBg: 'bg-[#002D3B]',
                renderLogo: () => (
                  <div className="flex flex-col items-center justify-center text-white text-center leading-none">
                    <span className="font-black text-[10px]">IC</span>
                    <span className="text-[5px] text-slate-300 uppercase scale-90">Markets</span>
                  </div>
                ),
              },
              {
                name: 'Fx Pro',
                cashback: '$8.00 Max Cashback',
                logoBg: 'bg-[#E11928]',
                renderLogo: () => (
                  <div className="flex flex-col items-center justify-center text-white text-center leading-none">
                    <span className="font-black text-[10px]">FxPro</span>
                  </div>
                ),
              },
            ].map((item) => (
              <div
                key={item.name}
                onClick={() => handleCardClick(item.name)}
                className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center justify-between space-y-2 hover:shadow-md hover:border-[#5945F1]/40 transition-all cursor-pointer group"
                title={`Click to view ${item.name} details`}
              >
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-900 bg-[#a3e635] px-2 py-0.5 rounded-full">
                  ✔ Verified
                </span>

                <div className={`w-11 h-11 rounded-xl ${item.logoBg} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                  {item.renderLogo()}
                </div>

                <div>
                  <div className="font-bold text-xs text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">{item.name}</div>
                  <div className="text-[10px] font-bold text-[#5945F1] mt-0.5 font-mono">
                    {item.cashback}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectBrokerAction(item.name);
                  }}
                  className="w-full py-1.5 px-2 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <button
              onClick={() => onNavigateToTab('brokers')}
              className="px-5 py-2 rounded-full border border-[#5945F1]/30 bg-white hover:bg-slate-50 text-[#5945F1] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              Explore All Brokers
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ RIGHT COLUMN (4 cols) ════════════ */}
      <div className="lg:col-span-4 space-y-5">
        {/* ── CARD 1: Tops Earning Points. ── */}
        <div className="rounded-2xl bg-white border-2 border-[#FD02B0]/80 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
              Tops Earning Points<span className="text-[#FD02B0]">.</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Get rewarded for trading your usual assets.{' '}
              <strong className="text-slate-800 font-bold">No extra effort required.</strong>
            </p>
          </div>

          {/* 4 Assets List */}
          <div className="space-y-3 pt-1">
            {/* 1: EUR/USD */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🇪🇺</span>
                <span className="font-bold text-sm text-[#0b1c30]">EUR/USD</span>
              </div>
              <div className="flex items-center gap-1 text-[#5945F1] font-bold text-sm">
                <Gem className="w-3.5 h-3.5 fill-[#5945F1]/20 stroke-[#5945F1]" />
                <span>50</span>
              </div>
            </div>

            {/* 2: GOOGL */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black shadow-2xs">
                  <span className="text-[#4285F4]">G</span>
                </div>
                <span className="font-bold text-sm text-[#0b1c30]">GOOGL</span>
              </div>
              <div className="flex items-center gap-1 text-[#5945F1] font-bold text-sm">
                <Gem className="w-3.5 h-3.5 fill-[#5945F1]/20 stroke-[#5945F1]" />
                <span>35</span>
              </div>
            </div>

            {/* 3: XAU/USD */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🪙</span>
                <span className="font-bold text-sm text-[#0b1c30]">XAU/USD</span>
              </div>
              <div className="flex items-center gap-1 text-[#5945F1] font-bold text-sm">
                <Gem className="w-3.5 h-3.5 fill-[#5945F1]/20 stroke-[#5945F1]" />
                <span>20</span>
              </div>
            </div>

            {/* 4: S&P 500 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E11928] text-white flex items-center justify-center text-[9px] font-black shadow-2xs">
                  500
                </div>
                <span className="font-bold text-sm text-[#0b1c30]">S&P 500</span>
              </div>
              <div className="flex items-center gap-1 text-[#5945F1] font-bold text-sm">
                <Gem className="w-3.5 h-3.5 fill-[#5945F1]/20 stroke-[#5945F1]" />
                <span>20</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('points-credits')}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#5945F1] hover:bg-[#492CED] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View More</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── CARD 2: Most Recent Signals. ── */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Most Recent Signal<span className="text-[#FD02B0]">s.</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                View most recent signals for your trading
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('signals')}
              className="text-xs font-bold text-slate-600 hover:text-[#5945F1] transition-colors cursor-pointer flex items-center gap-0.5 shrink-0"
            >
              <span>More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5 Signals in List */}
          <div className="space-y-2">
            {[
              { ticker: 'EUR/USD', change: '+0.33%', type: 'buy', sparkColor: '#16a34a' },
              { ticker: 'GOOGL', change: '-0.11%', type: 'sell', sparkColor: '#5945F1' },
              { ticker: 'BTC/USD', change: 'Premium', type: 'upgrade', sparkColor: '#FD02B0' },
              { ticker: 'S&P 500', change: '+0.44%', type: 'buy', sparkColor: '#16a34a' },
              { ticker: 'XAU/USD', change: '+0.24%', type: 'buy', sparkColor: '#16a34a' },
            ].map((s) => (
              <div
                key={s.ticker}
                className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-[#0b1c30]">{s.ticker}</span>
                  {s.type !== 'upgrade' && (
                    <div className="flex items-center gap-1">
                      <MiniSparkline trend={s.change.startsWith('+') ? 'up' : 'down'} color={s.sparkColor} />
                      <span className={`text-[11px] font-mono font-bold ${s.change.startsWith('+') ? 'text-emerald-600' : 'text-[#5945F1]'}`}>
                        {s.change}
                      </span>
                    </div>
                  )}
                </div>

                {s.type === 'buy' && (
                  <button
                    onClick={() => onNavigateToTab('signals')}
                    className="px-3 py-1 rounded-md bg-[#A3E635] text-slate-900 font-bold text-[11px] shadow-2xs hover:opacity-90 cursor-pointer"
                  >
                    Buy
                  </button>
                )}
                {s.type === 'sell' && (
                  <button
                    onClick={() => onNavigateToTab('signals')}
                    className="px-3 py-1 rounded-md bg-[#5945F1] text-white font-bold text-[11px] shadow-2xs hover:opacity-90 cursor-pointer"
                  >
                    Sell
                  </button>
                )}
                {s.type === 'upgrade' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                      👑 Premium Signal
                    </span>
                    <button
                      onClick={() => onNavigateToTab('signals')}
                      className="px-2.5 py-1 rounded-md border border-[#5945F1] text-[#5945F1] font-bold text-[11px] hover:bg-indigo-50 cursor-pointer"
                    >
                      Upgrade
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
