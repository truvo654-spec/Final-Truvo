import React, { useState } from 'react';
import {
  UserProfile,
  Broker,
  MarketSignal,
  QuickStep,
  PerformanceTimeframeData,
  LeaderboardUser,
} from '../types';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Calendar,
  Grid,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Gem,
  X as CloseIcon,
  ShoppingBag,
  Link2,
  CandlestickChart,
  DollarSign,
  Check,
  CheckCircle2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { EarningRewardData } from './EarningRewardModal';
import { HowItWorksModal } from './dashboard/HowItWorksModal';
import { WidgetPickerModal } from './dashboard/WidgetPickerModal';
import { CustomizableWidget } from './dashboard/CustomizableWidgets';
import { EmptyStateDashboardView } from './dashboard/EmptyStateDashboardView';
import { ActivityCarousel } from './dashboard/ActivityCarousel';
import { MoreConnectedBrokersBanner } from './dashboard/MoreConnectedBrokersBanner';
import { DashboardRow, DashboardSlot, WidgetType, WidgetSize } from '../types/dashboardWidgets';
import { LevelScenarioId } from '../data/levelScenarios';

interface ReferenceDashboardProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  quickSteps?: QuickStep[];
  performanceData?: Record<'1D' | '1W' | '1M' | 'All', PerformanceTimeframeData>;
  leaderboardUsers?: LeaderboardUser[];
  onOpenViewPlan: () => void;
  onAddDemoPoints?: () => void;
  onStepClick?: (stepIndex: number) => void;
  onToggleStep?: (stepIndex: number) => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onOpenLedger?: () => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onNavigateToTab: (tab: string) => void;
  onTriggerEarningModal?: (data: EarningRewardData) => void;
  onOpenSearchModal?: () => void;
  onShowToast?: (msg: string) => void;
  onNavigateToConnectBroker?: (broker?: Broker) => void;
  onSelectBrokerDetail?: (broker: Broker) => void;
  onSelectLevelScenario?: (scenarioId: LevelScenarioId) => void;
}

// ─────────────────────────────────────────────────────────────
// Custom 3D SVGs & Icons matching Dashboard; Desktop.png
// ─────────────────────────────────────────────────────────────

/**
 * Rookie Ghost Vector Badge (matches exact ghost outline from reference)
 */
function RookieGhostIcon() {
  return (
    <div className="w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center shrink-0">
      <svg
        viewBox="0 0 70 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Ghost Body Outline */}
        <path
          d="M 12 40 C 12 18, 22 8, 35 8 C 48 8, 58 18, 58 40 L 58 64 C 58 68, 54 70, 50 67 C 46 64, 43 64, 40 68 C 37 72, 33 72, 30 68 C 27 64, 24 64, 20 67 C 16 70, 12 68, 12 64 Z"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Left Eye */}
        <ellipse cx="27" cy="34" rx="3" ry="5" fill="white" />
        {/* Right Eye */}
        <ellipse cx="43" cy="34" rx="3" ry="5" fill="white" />
      </svg>
    </div>
  );
}

/**
 * 3D Calendar Streak Tile Icon
 */
function ActiveStreakCalendarIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7662f9] to-[#5945F1] p-1.5 shadow-md flex flex-col justify-between relative shrink-0">
      {/* Calendar top ring markers */}
      <div className="flex justify-between px-1.5 -mt-2.5">
        <span className="w-1.5 h-2.5 rounded-full bg-slate-300 border border-slate-400/30" />
        <span className="w-1.5 h-2.5 rounded-full bg-slate-300 border border-slate-400/30" />
      </div>
      {/* Calendar Sheet */}
      <div className="w-full h-full bg-white/95 rounded-lg flex flex-col items-center justify-center p-1 shadow-inner relative overflow-hidden">
        <div className="w-full h-1.5 bg-[#FD02B0] rounded-xs mb-1" />
        <svg viewBox="0 0 20 20" className="w-5 h-5 fill-none stroke-[#16a34a] stroke-[2.5]">
          <path d="M 4 10 L 8 14 L 16 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/**
 * 3D Cumulative Cashback Coin & Receipt Icon
 */
function CumulativeCashbackIcon() {
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4f46e5] via-[#5945F1] to-[#3b82f6] p-0.5 shadow-md flex items-center justify-center relative shrink-0">
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] flex items-center justify-center relative overflow-hidden">
        {/* Receipt paper behind */}
        <div className="absolute top-1.5 right-1.5 w-4 h-6 bg-white/90 rounded-xs shadow-xs rotate-12 flex flex-col justify-around p-0.5">
          <div className="w-full h-0.5 bg-slate-300 rounded-full" />
          <div className="w-3/4 h-0.5 bg-slate-300 rounded-full" />
          <div className="w-1/2 h-0.5 bg-emerald-500 rounded-full" />
        </div>
        {/* Dollar Symbol */}
        <span className="font-extrabold text-white text-lg font-mono relative z-10 drop-shadow-xs">$</span>
      </div>
    </div>
  );
}

/**
 * 3D Wallet & Coin Icon for Empty State
 */
function WalletCoin3DIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#818cf8] via-[#6366f1] to-[#4f46e5] p-2 shadow-sm flex items-center justify-center relative shrink-0">
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 drop-shadow-xs">
        <path
          d="M 8 14 C 8 10, 12 8, 18 8 C 24 8, 28 10, 28 14 L 30 26 C 30 30, 26 32, 18 32 C 10 32, 6 30, 6 26 Z"
          fill="url(#walletGradient)"
        />
        <path
          d="M 10 14 C 10 12, 13 10, 18 10 C 23 10, 26 12, 26 14 C 26 16, 23 17, 18 17 C 13 17, 10 16, 10 14 Z"
          fill="#c7d2fe"
        />
        <circle cx="18" cy="22" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
        <text x="18" y="24.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#854d0e">$</text>
        <defs>
          <linearGradient id="walletGradient" x1="6" y1="8" x2="30" y2="32">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * 3D Coin Swap Icon for Top Earning Assets Empty State
 */
function CoinSwap3DIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c084fc] via-[#a855f7] to-[#7e22ce] p-2 shadow-sm flex items-center justify-center relative shrink-0">
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 drop-shadow-xs">
        <circle cx="18" cy="18" r="14" fill="url(#swapGradient)" />
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
          <linearGradient id="swapGradient" x1="4" y1="4" x2="32" y2="32">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * 3D Empty Performance Chart Graphic
 */
function EmptyPerformanceChartGraphic() {
  return (
    <div className="relative w-28 h-24 flex items-center justify-center">
      <svg viewBox="0 0 100 80" fill="none" className="w-full h-full drop-shadow-md">
        <ellipse cx="50" cy="70" rx="42" ry="7" fill="#e2e8f0" />
        <rect x="20" y="38" width="12" height="30" rx="5" fill="url(#pinkBarGrad)" />
        <rect x="36" y="26" width="12" height="42" rx="5" fill="url(#greenBarGrad)" />
        <rect x="52" y="16" width="12" height="52" rx="5" fill="url(#yellowBarGrad)" />
        <rect x="68" y="8" width="12" height="60" rx="5" fill="url(#purpleBarGrad)" />
        <path
          d="M 16 52 Q 44 42 74 16"
          stroke="#16a34a"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="76,14 66,16 74,24" fill="#16a34a" />
        <defs>
          <linearGradient id="pinkBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <linearGradient id="greenBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="yellowBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Donut Chart for Top 3 Performers
 */
function TopPerformersDonutChart() {
  // SVG donut with 3 arcs: Gold/Amber (~40%), Indigo (~35%), Magenta (~25%)
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
        {/* Background Track */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {/* Amber Segment: XAU/USD (~38%) */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="16"
          strokeDasharray="91 238"
          strokeDashoffset="0"
          strokeLinecap="round"
        />
        {/* Indigo Segment: Dow Jones (~34%) */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#4F46E5"
          strokeWidth="16"
          strokeDasharray="81 238"
          strokeDashoffset="-96"
          strokeLinecap="round"
        />
        {/* Magenta Segment: AUDUSD (~28%) */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#FD02B0"
          strokeWidth="16"
          strokeDasharray="66 238"
          strokeDashoffset="-182"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="w-3 h-3 rounded-full bg-white shadow-2xs" />
      </div>
    </div>
  );
}

/**
 * Mini Sparkline SVG helper
 */
function MiniSparkline({ trend = 'up', color = '#16a34a' }: { trend?: 'up' | 'down'; color?: string }) {
  const points =
    trend === 'up'
      ? '0,14 6,12 12,15 18,10 24,11 30,7 36,9 42,4 48,2'
      : '0,4 6,7 12,5 18,11 24,9 30,13 36,11 42,15 48,16';

  return (
    <svg viewBox="0 0 50 18" className="w-14 h-4 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

const DEFAULT_ROWS: DashboardRow[] = [
  {
    id: 'row-1',
    slots: [
      { id: 'slot-1-1', type: 'level-card', size: 1, title: 'Rookie Level' },
      { id: 'slot-1-2', type: 'saved-calculators', size: 1, title: 'Saved Calculators' },
      { id: 'slot-1-3', type: 'most-recent-signals', size: 1, title: 'Most Recent Signals' },
    ],
  },
  {
    id: 'row-2',
    slots: [
      { id: 'slot-2-1', type: 'instrument-analysis', size: 3, title: 'Instrument Analysis' },
    ],
  },
  {
    id: 'row-3',
    slots: [
      { id: 'slot-3-1', type: 'mission-card', size: 3, title: 'Portfolio Power-Up' },
    ],
  },
];

function ConnectedBrokersRow({
  brokers,
  onOpenConnectModal,
  onNavigateToTab,
}: {
  brokers: Broker[];
  onOpenConnectModal: (broker?: Broker) => void;
  onNavigateToTab: (tab: string) => void;
}) {
  return (
    <MoreConnectedBrokersBanner
      onConnectBroker={(brokerName) => {
        const brokerObj = brokers.find((br) => br.name.toLowerCase().includes(brokerName.toLowerCase()));
        onOpenConnectModal(brokerObj);
      }}
      onNavigateToTab={onNavigateToTab}
      className="w-full"
    />
  );
}

function CustomizeRightSidebar({
  signals,
  onSelectSignal,
  onNavigateToTab,
}: {
  signals: MarketSignal[];
  onSelectSignal: (s: MarketSignal) => void;
  onNavigateToTab: (tab: string) => void;
}) {
  return (
    <aside
      id="customize-right-sidebar"
      aria-label="Sidebar"
      className="space-y-5 lg:sticky lg:top-[84px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* Activity Carousel (Auto-slides every 4s) */}
      <ActivityCarousel onNavigateToTab={onNavigateToTab} />

      {/* 1. 😎 Just This Spot */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-indigo-100 p-6 shadow-2xs text-center space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FD02B0] text-white text-xs font-bold shadow-xs">
          <span>😎 Just This Spot</span>
        </div>
        <p className="text-xs text-slate-600 max-w-[220px] mx-auto font-medium leading-relaxed">
          We locked it so you won't miss your account status
        </p>
      </div>

      {/* 2. Your Winning Signals */}
      <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
              Your <span className="text-[#5945F1]">Winning Signals.</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Signals from your actual money-makers.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('signals')}
            className="text-xs font-bold text-slate-600 hover:text-[#5945F1] transition-colors cursor-pointer flex items-center gap-0.5 shrink-0"
          >
            <span>All Signals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* EUR/USD */}
          <div
            onClick={() => {
              const s = signals.find((item) => item.ticker === 'EUR/USD') || signals[0];
              if (s) onSelectSignal(s);
            }}
            className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0b1c30]">
              <span className="text-sm">🇪🇺</span>
              <span>EUR/USD</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#16a34a] font-mono">+0.33%</span>
            </div>
          </div>

          {/* Dow Jones */}
          <div
            onClick={() => {
              const s = signals.find((item) => item.ticker.includes('Dow')) || signals[1];
              if (s) onSelectSignal(s);
            }}
            className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0b1c30]">
              <span className="text-sm">🇬🇧</span>
              <span className="truncate">Dow Jones</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#5945F1] font-mono">-0.11%</span>
            </div>
          </div>

          {/* AUDUSD */}
          <div
            onClick={() => {
              const s = signals.find((item) => item.ticker.includes('AUD')) || signals[2];
              if (s) onSelectSignal(s);
            }}
            className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0b1c30]">
              <span className="text-sm">🇦🇺</span>
              <span>AUDUSD</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#16a34a] font-mono">+0.44%</span>
            </div>
          </div>

          {/* BTC/USD */}
          <div
            onClick={() => {
              const s = signals.find((item) => item.ticker === 'BTC/USD') || signals[0];
              if (s) onSelectSignal(s);
            }}
            className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-1.5"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0b1c30]">
              <span className="text-sm">₿</span>
              <span>BTC/USD</span>
            </div>
            <div className="text-xs font-black text-[#FD02B0] tracking-tight">
              Your next win?
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tops Earning Points */}
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

        <div className="space-y-3.5 pt-1">
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
    </aside>
  );
}

export const ReferenceDashboard: React.FC<ReferenceDashboardProps> = ({
  user,
  brokers,
  signals,
  onOpenViewPlan,
  onOpenConnectModal,
  onSelectSignal,
  onNavigateToTab,
  onTriggerEarningModal,
  onOpenSearchModal,
  onShowToast,
  onNavigateToConnectBroker,
  onSelectBrokerDetail,
  onSelectLevelScenario,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | 'All'>('1M');
  const [connectedPage, setConnectedPage] = useState<number>(1);
  const [readyPage, setReadyPage] = useState<number>(1);
  const [activeAssetFilter, setActiveAssetFilter] = useState<string>('Earning Assets');

  // Dashboard Widget Customization Mode state
  const [isCustomizeMode, setIsCustomizeMode] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState<boolean>(false);
  const [targetSlot, setTargetSlot] = useState<{ rowIndex: number; slotIndex: number } | null>(null);

  const [rows, setRows] = useState<DashboardRow[]>(() => {
    try {
      const saved = localStorage.getItem('marketsyde_dashboard_rows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_ROWS;
  });

  const [originalRows, setOriginalRows] = useState<DashboardRow[]>(rows);
  const [draggedSlotInfo, setDraggedSlotInfo] = useState<{ rowIndex: number; slotIndex: number } | null>(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);

  const handleEnterCustomizeMode = () => {
    setOriginalRows(JSON.parse(JSON.stringify(rows)));
    setIsCustomizeMode(true);
    const hideRules = localStorage.getItem('marketsyde_hide_rules_modal');
    if (!hideRules) {
      setIsRulesModalOpen(true);
    }
  };

  const handleDiscard = () => {
    setRows(JSON.parse(JSON.stringify(originalRows)));
    setIsCustomizeMode(false);
    if (onShowToast) onShowToast('Customizations discarded.');
  };

  const handleReset = () => {
    setRows(JSON.parse(JSON.stringify(DEFAULT_ROWS)));
    if (onShowToast) onShowToast('Dashboard layout reset to default.');
  };

  const handleSave = () => {
    try {
      localStorage.setItem('marketsyde_dashboard_rows', JSON.stringify(rows));
    } catch {
      // ignore
    }
    setOriginalRows(JSON.parse(JSON.stringify(rows)));
    setIsCustomizeMode(false);
    if (onShowToast) onShowToast('Dashboard layout saved successfully!');
  };

  const handleAddRow = () => {
    const newRowId = `row-${Date.now()}`;
    const newRow: DashboardRow = {
      id: newRowId,
      slots: [
        { id: `slot-${Date.now()}-1`, type: 'empty', size: 1 },
        { id: `slot-${Date.now()}-2`, type: 'empty', size: 1 },
        { id: `slot-${Date.now()}-3`, type: 'empty', size: 1 },
      ],
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (rows.length <= 1) {
      setRows([
        {
          id: `row-${Date.now()}`,
          slots: [
            { id: `slot-${Date.now()}-1`, type: 'empty', size: 1 },
            { id: `slot-${Date.now()}-2`, type: 'empty', size: 1 },
            { id: `slot-${Date.now()}-3`, type: 'empty', size: 1 },
          ],
        },
      ]);
      return;
    }
    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  const handleOpenPickerForSlot = (rowIndex: number, slotIndex: number) => {
    setTargetSlot({ rowIndex, slotIndex });
    setIsWidgetPickerOpen(true);
  };

  const handleSelectWidget = (type: WidgetType, size: WidgetSize) => {
    if (!targetSlot) return;
    const { rowIndex, slotIndex } = targetSlot;
    setRows((prev) => {
      const copy: DashboardRow[] = JSON.parse(JSON.stringify(prev));
      if (copy[rowIndex] && copy[rowIndex].slots[slotIndex]) {
        copy[rowIndex].slots[slotIndex] = {
          id: `slot-${Date.now()}`,
          type,
          size,
        };
      }
      return copy;
    });
    setTargetSlot(null);
  };

  const handleEmptySlot = (rowIndex: number, slotIndex: number) => {
    setRows((prev) => {
      const copy: DashboardRow[] = JSON.parse(JSON.stringify(prev));
      if (copy[rowIndex] && copy[rowIndex].slots[slotIndex]) {
        copy[rowIndex].slots[slotIndex] = {
          id: `slot-${Date.now()}`,
          type: 'empty',
          size: 1,
        };
      }
      return copy;
    });
  };

  // Interactive accounts data matching reference: HFM, XM, FxPro
  const [accountList, setAccountList] = useState([
    {
      id: 'hfm-acc-1',
      broker: 'HFM',
      accountType: 'Premium',
      accountNumber: '1100045789',
      status: 'pending',
      statusLabel: 'Pending Approval',
      timeEstimate: 'Takes 2–3 days',
      progressPercent: 45,
      logoColor: 'bg-black',
      textColor: 'text-white',
    },
    {
      id: 'xm-acc-2',
      broker: 'XM',
      accountType: 'Ultra Low',
      accountNumber: '1100098765',
      status: 'pending',
      statusLabel: 'Pending Approval',
      timeEstimate: 'Takes 2–3 days',
      progressPercent: 45,
      logoColor: 'bg-black',
      textColor: 'text-white',
    },
    {
      id: 'fxpro-acc-3',
      broker: 'FxPro',
      accountType: 'Raw+',
      accountNumber: '1100034521',
      status: 'approved',
      statusLabel: 'Approved',
      timeEstimate: '',
      progressPercent: 100,
      logoColor: 'bg-[#E11928]',
      textColor: 'text-white',
    },
  ]);

  const handleTradeNow = (accountName: string) => {
    if (onTriggerEarningModal) {
      onTriggerEarningModal({
        type: 'trade',
        points: 20,
        credits: 10,
        brokerName: accountName,
      });
    } else {
      onNavigateToTab('signals');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ─── 1. TOP GREETING / CUSTOMIZER HEADER ─── */}
      {isCustomizeMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-2xs">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              <span>Your vibe. Your dashboar</span>
              <span className="text-[#FD02B0]">d</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
              Save it. Don't let your masterpiece vanish into the ether.
            </p>
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <span>See the rules</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleDiscard}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
            >
              ✕ Discard
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
            >
              ↺ Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Save</span>
              <span>💾</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 2. MAIN DASHBOARD CONTENT (CUSTOMIZE MODE vs STANDARD BENTO) ─── */}
      {isCustomizeMode ? (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* ════ LEFT COLUMN: Customizable Rows + More Connected Brokers ════ */}
          <div className="flex-1 min-w-0 w-full space-y-5">
            {rows.map((row, rowIndex) => (
              <div
                key={row.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedRowIndex === null || draggedRowIndex === rowIndex) return;
                  setRows((prev) => {
                    const copy = [...prev];
                    const [moved] = copy.splice(draggedRowIndex, 1);
                    copy.splice(rowIndex, 0, moved);
                    return copy;
                  });
                  setDraggedRowIndex(null);
                }}
                className="flex items-stretch gap-2 sm:gap-3"
              >
                {/* Drag Grip Handle on the left */}
                <div
                  draggable
                  onDragStart={() => setDraggedRowIndex(rowIndex)}
                  title="Drag to reorder row"
                  className="w-6 sm:w-7 rounded-xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-center text-indigo-400 cursor-grab active:cursor-grabbing hover:text-indigo-600 hover:bg-indigo-100 transition-colors shadow-2xs shrink-0 self-center py-4"
                >
                  <div className="grid grid-cols-2 gap-0.5 pointer-events-none">
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-1 h-1 rounded-full bg-current" />
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {row.slots.map((slot, slotIndex) => (
                    <div
                      key={slot.id}
                      draggable={slot.type !== 'empty'}
                      onDragStart={() => setDraggedSlotInfo({ rowIndex, slotIndex })}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (!draggedSlotInfo) return;
                        if (draggedSlotInfo.rowIndex === rowIndex && draggedSlotInfo.slotIndex === slotIndex) return;
                        setRows((prev) => {
                          const copy: DashboardRow[] = JSON.parse(JSON.stringify(prev));
                          const source = copy[draggedSlotInfo.rowIndex].slots[draggedSlotInfo.slotIndex];
                          const target = copy[rowIndex].slots[slotIndex];
                          copy[draggedSlotInfo.rowIndex].slots[draggedSlotInfo.slotIndex] = target;
                          copy[rowIndex].slots[slotIndex] = source;
                          return copy;
                        });
                        setDraggedSlotInfo(null);
                      }}
                      className="h-full"
                    >
                      <CustomizableWidget
                        slot={slot}
                        isCustomizeMode={true}
                        onEmptySlot={() => handleEmptySlot(rowIndex, slotIndex)}
                        onClickSlot={() => handleOpenPickerForSlot(rowIndex, slotIndex)}
                        user={user}
                        signals={signals}
                        brokers={brokers}
                        onOpenViewPlan={onOpenViewPlan}
                        onOpenConnectModal={onOpenConnectModal}
                        onSelectSignal={onSelectSignal}
                        onNavigateToTab={onNavigateToTab}
                        onSelectLevelScenario={onSelectLevelScenario}
                      />
                    </div>
                  ))}
                </div>

                {/* Red Circular Delete Row Button on the right */}
                <button
                  onClick={() => handleDeleteRow(rowIndex)}
                  title="Delete row"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100/90 hover:bg-rose-200 text-rose-500 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs shrink-0 self-center"
                >
                  <CloseIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ))}

            {/* ─── ADD MORE ROW BUTTON (Matching New (1).png) ─── */}
            <div className="rounded-2xl border-2 border-dashed border-indigo-200/90 bg-white/40 p-4 flex items-center justify-center">
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 text-[#5945F1] font-bold text-xs transition-colors cursor-pointer shadow-2xs active:scale-95"
              >
                <div className="w-4 h-4 border border-indigo-400 rounded-xs flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-indigo-500 rounded-xs" />
                </div>
                <span>Add More Row</span>
              </button>
            </div>

            {/* ─── MORE CONNECTED BROKERS. MORE OPPORTUNITIES (Matching New.png) ─── */}
            <ConnectedBrokersRow
              brokers={brokers}
              onOpenConnectModal={onOpenConnectModal}
              onNavigateToTab={onNavigateToTab}
            />
          </div>

          {/* ════ RIGHT COLUMN (Fixed 300px on LG): Just This Spot + Winning Signals + Tops Earning Points ════ */}
          <div className="w-full lg:w-[300px] lg:shrink-0">
            <CustomizeRightSidebar
              signals={signals}
              onSelectSignal={onSelectSignal}
              onNavigateToTab={onNavigateToTab}
            />
          </div>
        </div>
      ) : (
        <EmptyStateDashboardView
          user={user}
          brokers={brokers}
          signals={signals}
          onOpenViewPlan={onOpenViewPlan}
          onOpenConnectModal={onOpenConnectModal}
          onNavigateToTab={onNavigateToTab}
          onNavigateToConnectBroker={onNavigateToConnectBroker}
          onSelectBrokerDetail={onSelectBrokerDetail}
          onSelectSignal={onSelectSignal}
          onEnterCustomizeMode={handleEnterCustomizeMode}
          onSelectLevelScenario={onSelectLevelScenario}
        />
      )}

      {/* ─── HOW IT WORKS RULES MODAL ─── */}
      <HowItWorksModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onDontShowAgain={(dontShow) => {
          if (dontShow) {
            localStorage.setItem('marketsyde_hide_rules_modal', 'true');
          } else {
            localStorage.removeItem('marketsyde_hide_rules_modal');
          }
        }}
      />

      {/* ─── WIDGET PICKER MODAL ─── */}
      <WidgetPickerModal
        isOpen={isWidgetPickerOpen}
        onClose={() => {
          setIsWidgetPickerOpen(false);
          setTargetSlot(null);
        }}
        onSelectWidget={handleSelectWidget}
        currentlyUsedTypes={rows.flatMap((r) => r.slots.map((s) => s.type)).filter((t) => t !== 'empty')}
      />
    </div>
  );
};
