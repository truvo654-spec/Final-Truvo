import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserProfile,
  Broker,
  MarketSignal,
  Mission,
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
  UserPlus,
  ChevronLeft,
  ChevronDown,
  Pencil,
  Info,
  AlertCircle,
  AlertTriangle,
  Trash2,
  X,
  ExternalLink,
  Search,
  Plus,
  Radio,
  Sparkles,
  Clock,
  CheckCircle2,
  Archive,
  TrendingUp,
  BarChart3,
  Check,
} from 'lucide-react';
import { CashbackCalendarModal } from './CashbackCalendarModal';
import { PerformanceComboChart } from './PerformanceComboChart';
import { MoreConnectedBrokersBanner } from './MoreConnectedBrokersBanner';
import { ConnectedAccountsCarousel } from './ConnectedAccountsCarousel';
import { AllConnectedAccountsModal } from './AllConnectedAccountsModal';
import { ConnectedAccountStepperCard } from './ConnectedAccountStepperCard';
import { ConnectionDeniedPopup } from './ConnectionDeniedPopup';
import { ConnectionUnavailablePopup } from './ConnectionUnavailablePopup';
import { InstrumentAnalysisWidget } from './InstrumentAnalysisWidget';
import { MissionCardWidget } from './MissionCardWidget';
import { PromotionWidget } from './PromotionWidget';
import { COPY_TONES, CopyTone, TONE_LABELS } from '../../data/copyTones';
import { LiveInteractiveSparkline } from './LiveInteractiveSparkline';
import { BorderBeam } from '../ui/BorderBeam';
import { getNextTierInfo, LEVEL_SCENARIOS, LevelScenarioId } from '../../data/levelScenarios';


export type DashboardStateType =
  | 'empty'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'unavailable'
  | 'first-trade'
  | 'active-performance';

interface DemoDashboardViewProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  onOpenViewPlan: () => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onNavigateToTab: (tab: string) => void;
  onNavigateToConnectBroker?: (broker?: Broker) => void;
  onSelectBrokerDetail?: (broker: Broker) => void;
  onSelectSignal?: (signal: MarketSignal) => void;
  onEnterCustomizeMode?: () => void;
  onSelectLevelScenario?: (scenarioId: LevelScenarioId) => void;
  initialState?: DashboardStateType;
  missions?: Mission[];
  onUpdateMissions?: (missions: Mission[]) => void;
  onStartTour?: () => void;
}

/**
 * Rookie Ghost Vector Badge (matches exact ghost outline from reference with playful floating animation)
 */
function RookieGhostIcon() {
  return (
    <div className="w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center shrink-0 animate-float-slow group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 cursor-pointer">
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
 * Dynamic Tier Mascot Icon that supports Rookie Ghost (Lv.1), Climber (Lv.2), Player (Lv.3), and Boss (Lv.4)
 */
function TierMascotIcon({ tierLevel = 1 }: { tierLevel?: number }) {
  if (tierLevel === 4) {
    return (
      <div className="w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center shrink-0 animate-float-slow group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 cursor-pointer">
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Boss Crown */}
          <path d="M 20 85 L 20 44 L 38 62 L 50 30 L 62 62 L 80 44 L 80 85 Z" fill="none" />
          <line x1="20" y1="94" x2="80" y2="94" strokeWidth="6" />
          <circle cx="20" cy="40" r="4" fill="white" stroke="none" />
          <circle cx="50" cy="26" r="4" fill="white" stroke="none" />
          <circle cx="80" cy="40" r="4" fill="white" stroke="none" />
        </svg>
      </div>
    );
  }
  if (tierLevel === 3) {
    return (
      <div className="w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center shrink-0 animate-float-slow group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 cursor-pointer">
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Player Lightning Star */}
          <polygon points="55,16 28,60 50,60 45,104 74,54 52,54" fill="none" stroke="white" strokeWidth="5" />
          <circle cx="76" cy="30" r="4" fill="#CAEB0E" stroke="none" />
          <circle cx="24" cy="85" r="4" fill="#CAEB0E" stroke="none" />
        </svg>
      </div>
    );
  }
  if (tierLevel === 2) {
    return (
      <div className="w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center shrink-0 animate-float-slow group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 cursor-pointer">
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Climber Footprints / Step */}
          <g transform="translate(14, 16)">
            <rect x="8" y="10" width="18" height="30" rx="9" fill="none" stroke="white" strokeWidth="4.5" />
            <rect x="10" y="46" width="14" height="14" rx="7" fill="none" stroke="white" strokeWidth="4.5" />
            <rect x="36" y="20" width="18" height="30" rx="9" fill="none" stroke="white" strokeWidth="4.5" />
            <rect x="38" y="56" width="14" height="14" rx="7" fill="none" stroke="white" strokeWidth="4.5" />
          </g>
        </svg>
      </div>
    );
  }
  return <RookieGhostIcon />;
}

/**
 * Crisp Vector Calendar Icon for Active Streak (matching Top Performers - Dropdown Open.jpg)
 */
function LimeCalendarIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 flex items-center justify-center`}>
      <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
        {/* Binder rings */}
        <rect x="13" y="3" width="3.5" height="7" rx="1.75" fill="#84CC16" />
        <rect x="27.5" y="3" width="3.5" height="7" rx="1.75" fill="#84CC16" />
        {/* Calendar Body */}
        <rect x="6" y="6.5" width="32" height="32" rx="7" fill="#F7FEE7" stroke="#84CC16" strokeWidth="2.4" />
        {/* Top Header Divider */}
        <line x1="6" y1="16" x2="38" y2="16" stroke="#84CC16" strokeWidth="2" strokeLinecap="round" />
        {/* Calendar Grid Dots */}
        <rect x="11.5" y="21" width="3.5" height="3.5" rx="1" fill="#84CC16" />
        <rect x="20.25" y="21" width="3.5" height="3.5" rx="1" fill="#84CC16" />
        <rect x="29" y="21" width="3.5" height="3.5" rx="1" fill="#84CC16" />
        <rect x="11.5" y="28" width="3.5" height="3.5" rx="1" fill="#84CC16" />
        <rect x="20.25" y="28" width="3.5" height="3.5" rx="1" fill="#84CC16" />
        <rect x="29" y="28" width="3.5" height="3.5" rx="1" fill="#84CC16" />
      </svg>
    </div>
  );
}

/**
 * Crisp Vector Wallet Icon for Cumulative Cashback (matching Top Performers - Dropdown Open.jpg)
 */
function LimeWalletIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 flex items-center justify-center`}>
      <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
        {/* Card Peaking Out */}
        <path
          d="M 13 10 L 31 10 C 32.5 10 33.5 11 33.5 12.5 L 33.5 15 L 10.5 15 L 10.5 12.5 C 10.5 11 11.5 10 13 10 Z"
          fill="#D9F99D"
          stroke="#84CC16"
          strokeWidth="2"
        />
        {/* Main Body */}
        <rect x="6" y="14" width="32" height="24" rx="6" fill="#F7FEE7" stroke="#84CC16" strokeWidth="2.4" />
        {/* Clasp */}
        <path
          d="M 26 21 L 38 21 C 39 21 40 22 40 23 L 40 29 C 40 30 39 31 38 31 L 26 31 C 23.5 31 22 29.5 22 26 C 22 22.5 23.5 21 26 21 Z"
          fill="#BEF226"
          stroke="#84CC16"
          strokeWidth="2"
        />
        <circle cx="28.5" cy="26" r="2" fill="#4D7C0F" />
      </svg>
    </div>
  );
}

/**
 * Crisp Flag Icon Circles for Top Performers
 */
function EUFlagCircle() {
  return (
    <svg className="w-4 h-4 rounded-full shrink-0 shadow-2xs" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#003399" />
      <g fill="#FFCC00" transform="translate(16,16) scale(0.68)">
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x = 15 * Math.sin(angle);
          const y = -15 * Math.cos(angle);
          return <circle key={i} cx={x} cy={y} r="1.8" />;
        })}
      </g>
    </svg>
  );
}

function UKFlagCircle() {
  return (
    <svg className="w-4 h-4 rounded-full shrink-0 shadow-2xs overflow-hidden" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#012169" />
      <path d="M0,0 L32,32 M32,0 L0,32" stroke="#FFF" strokeWidth="5.5" />
      <path d="M0,0 L32,32 M32,0 L0,32" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M16,0 L16,32 M0,16 L32,16" stroke="#FFF" strokeWidth="8" />
      <path d="M16,0 L16,32 M0,16 L32,16" stroke="#C8102E" strokeWidth="4.5" />
    </svg>
  );
}

function AUDFlagCircle() {
  return (
    <svg className="w-4 h-4 rounded-full shrink-0 shadow-2xs overflow-hidden" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#00247D" />
      {/* Union Jack canton */}
      <rect x="0" y="0" width="16" height="16" fill="#00247D" />
      <path d="M0,0 L16,16 M16,0 L0,16" stroke="#FFF" strokeWidth="2.8" />
      <path d="M0,0 L16,16 M16,0 L0,16" stroke="#CF142B" strokeWidth="1.2" />
      <path d="M8,0 L8,16 M0,8 L16,8" stroke="#FFF" strokeWidth="4.2" />
      <path d="M8,0 L8,16 M0,8 L16,8" stroke="#CF142B" strokeWidth="2" />
      {/* Stars */}
      <circle cx="7" cy="24" r="2.2" fill="#FFF" />
      <circle cx="24" cy="8" r="1.4" fill="#FFF" />
      <circle cx="21.5" cy="14" r="1.3" fill="#FFF" />
      <circle cx="27" cy="17" r="1.3" fill="#FFF" />
      <circle cx="23" cy="22" r="1.3" fill="#FFF" />
      <circle cx="25" cy="26.5" r="1.5" fill="#FFF" />
    </svg>
  );
}

/**
 * 3D Coin Swap Vector Icon for Top Earning Assets Empty State
 */
function CoinSwap3DIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-slate-100 p-1.5 shadow-2xs flex items-center justify-center shrink-0">
      <LimeCalendarIcon className="w-8 h-8" />
    </div>
  );
}

/**
 * Donut Chart for Top 3 Performers (Matching Top Performers - Dropdown Open.jpg)
 */
function TopPerformersDonutChart({
  type = 'assets',
  isFirstTrade = false,
}: {
  type?: 'assets' | 'brokers';
  isFirstTrade?: boolean;
}) {
  if (isFirstTrade) {
    return (
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
          <circle cx="50" cy="50" r="36" fill="none" stroke="#f1f5f9" strokeWidth="14" />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#BEF226"
            strokeWidth="14"
            strokeDasharray="226 226"
            strokeDashoffset="0"
          />
        </svg>
      </div>
    );
  }

  if (type === 'brokers') {
    return (
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
          <circle cx="50" cy="50" r="36" fill="none" stroke="#f1f5f9" strokeWidth="14" />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#DC2626"
            strokeWidth="14"
            strokeDasharray="90 226"
            strokeDashoffset="0"
          />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#B91C1C"
            strokeWidth="14"
            strokeDasharray="72 226"
            strokeDashoffset="-90"
          />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="14"
            strokeDasharray="64 226"
            strokeDashoffset="-162"
          />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ rotate: [-90, -85, -90] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full transform">
        <circle cx="50" cy="50" r="36" fill="none" stroke="#f8fafc" strokeWidth="14" />
        {/* Lime Green segment (36%) */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#BEF226"
          strokeWidth="14"
          strokeDasharray="81 226"
          strokeDashoffset="0"
        />
        {/* Hot Pink segment (28%) */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#FD02B0"
          strokeWidth="14"
          strokeDasharray="63 226"
          strokeDashoffset="-81"
        />
        {/* Purple segment (22%) */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#5945F1"
          strokeWidth="14"
          strokeDasharray="50 226"
          strokeDashoffset="-144"
        />
        {/* Cyan segment (14%) */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="14"
          strokeDasharray="32 226"
          strokeDashoffset="-194"
        />
      </svg>
    </motion.div>
  );
}

/**
 * Mini Sparkline SVG (Upgraded to LiveInteractiveSparkline with live pulse and animations)
 */
function MiniSparkline({
  trend,
  color,
  isTicked = false,
}: {
  trend: 'up' | 'down';
  color: string;
  isTicked?: boolean;
}) {
  return (
    <LiveInteractiveSparkline
      trend={trend}
      color={color}
      isTicked={isTicked}
      width={42}
      height={18}
    />
  );
}

export const DemoDashboardView: React.FC<DemoDashboardViewProps> = ({
  user,
  brokers,
  signals,
  onOpenViewPlan,
  onOpenConnectModal,
  onNavigateToTab,
  onNavigateToConnectBroker,
  onSelectBrokerDetail,
  onSelectSignal,
  onEnterCustomizeMode,
  onSelectLevelScenario,
  initialState,
  missions,
  onUpdateMissions,
  onStartTour,
}) => {
  // Read state from localStorage or initial state
  const [dashboardState, setDashboardState] = useState<DashboardStateType>(() => {
    if (initialState) return initialState;
    try {
      const saved = localStorage.getItem('marketsyde_demo_dashboard_active_state');
      if (
        saved &&
        ['empty', 'pending', 'approved', 'rejected', 'unavailable', 'first-trade', 'active-performance'].includes(saved)
      ) {
        return saved as DashboardStateType;
      }
    } catch {}
    return 'active-performance';
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | 'All'>('1M');
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [tone, setTone] = useState<CopyTone>('default');
  const copy = COPY_TONES[tone];
  const [completedQuickStartIds, setCompletedQuickStartIds] = useState<Set<string>>(new Set());

  // Steps for the Quick Start checklist — mirrors the original Quick Start Guide content.
  // Clicking a step's CTA marks it done (checkbox flips to a checkmark) and navigates onward.
  const QUICK_START_STEPS_BASE = [
    {
      id: 'choose-broker' as const,
      icon: UserPlus,
      onClick: () => onNavigateToTab('brokers'),
    },
    {
      id: 'link-account' as const,
      icon: Link2,
      onClick: () => onNavigateToTab('brokers'),
    },
    {
      id: 'trade-usual' as const,
      icon: CandlestickChart,
      onClick: () => onNavigateToTab('signals'),
    },
    {
      id: 'earn-cashback' as const,
      icon: DollarSign,
      onClick: () => onNavigateToTab('cashback-overview'),
    },
  ];
  const QUICK_START_STEPS = QUICK_START_STEPS_BASE.map((step) => ({
    ...step,
    ...copy.quickStartSteps[step.id],
    completed: completedQuickStartIds.has(step.id),
  }));
  const completedQuickStartCount = QUICK_START_STEPS.filter((s) => s.completed).length;

  const handleQuickStartStepAction = (stepId: string, onClick: () => void) => {
    setCompletedQuickStartIds((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
    onClick();
  };

  const [performerType, setPerformerType] = useState<'assets' | 'brokers'>('assets');
  const [isPerformerDropdownOpen, setIsPerformerDropdownOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAllConnectedModalOpen, setIsAllConnectedModalOpen] = useState(false);
  const recentDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('All');
  const [isConnectionDeniedOpen, setIsConnectionDeniedOpen] = useState(false);
  const [isConnectionUnavailableOpen, setIsConnectionUnavailableOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live real-time auto-interactive ticker for Most Recent Signals
  const [tickedSignalTicker, setTickedSignalTicker] = useState<string | null>(null);
  const [signalLiveDeltas, setSignalLiveDeltas] = useState<Record<string, number>>({
    'EUR/USD': 0,
    'GOOGL': 0,
    'S&P 500': 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const keys = ['EUR/USD', 'GOOGL', 'S&P 500'];
      const picked = keys[Math.floor(Math.random() * keys.length)];
      setTickedSignalTicker(picked);

      setSignalLiveDeltas((prev) => {
        const delta = (Math.random() > 0.4 ? 1 : -1) * +(Math.random() * 0.04 + 0.01).toFixed(2);
        return {
          ...prev,
          [picked]: +((prev[picked] || 0) + delta).toFixed(2),
        };
      });

      const timer = setTimeout(() => {
        setTickedSignalTicker(null);
      }, 950);

      return () => clearTimeout(timer);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStateChange = (newState: DashboardStateType) => {
    setDashboardState(newState);
    if (newState === 'rejected') {
      setIsConnectionDeniedOpen(true);
    } else if (newState === 'unavailable') {
      setIsConnectionUnavailableOpen(true);
    }
    try {
      localStorage.setItem('marketsyde_demo_dashboard_active_state', newState);
    } catch {}
  };

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

  const isConnectedState = dashboardState !== 'empty';
  const isPerformanceActive = dashboardState === 'first-trade' || dashboardState === 'active-performance';

  // Current user tier points & next tier calculation (synchronized with selected Level Scenario)
  const currentPoints = user.currentPoints ?? (dashboardState === 'first-trade' ? 5 : 50);
  const maxPoints = user.maxPoints || 100;
  const progressPercent = Math.min(100, Math.max(0, (currentPoints / maxPoints) * 100));
  const nextInfo = getNextTierInfo(user.tierLevel || 1, currentPoints);
  const nextLevelText = nextInfo.isMaxLevel
    ? 'Max Level Reached'
    : `Next level at ${nextInfo.pointsNeeded} Points`;
  const points = currentPoints;

  return (
    <div className="w-full space-y-6">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 text-[#FD02B0] shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── TOP GREETING HEADER ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {dashboardState === 'empty' ? (
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight">
                <span>👋 </span>
                <span className="text-[#5945F1]">Welcome, </span>
                <span className="text-[#FD02B0]">{user.username}!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                {copy.greetingSubtitle(user.username)}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight">
                <span>🥳 </span>
                <span className="text-[#5945F1]">Oh look, you’re back</span>
                <span className="text-[#FD02B0]">!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                {copy.returningGreetingSubtitle}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1">
          {/* ─── LANGUAGE / TONE SWITCHER ─── */}
          <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            {(Object.keys(TONE_LABELS) as CopyTone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  tone === t
                    ? 'bg-white text-[#0b1c30] shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>

          {onEnterCustomizeMode && (
            <button
              onClick={onEnterCustomizeMode}
              className="px-3 py-1.5 rounded-xl border border-indigo-100/90 bg-white hover:bg-indigo-50 text-[#5945F1] flex items-center gap-2 shadow-2xs transition-all cursor-pointer hover:border-indigo-300 font-bold text-xs"
              title="Customize dashboard widgets"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden sm:inline">Customize</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── QUICK START ACCORDION (Full width, below greeting; collapsible, shows per-step completion) ─── */}
      <div className="rounded-2xl bg-[#EEF2F9] overflow-hidden">
        {/* Header row: toggles the accordion open/closed */}
        <button
          type="button"
          onClick={() => setIsQuickStartOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Circular progress ring showing steps completed out of 4 */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
              <svg viewBox="0 0 36 36" className="w-9 h-9 sm:w-10 sm:h-10 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(completedQuickStartCount / QUICK_START_STEPS.length) * 2 * Math.PI * 15.5} ${2 * Math.PI * 15.5}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-slate-600">
                {completedQuickStartCount}/{QUICK_START_STEPS.length}
              </div>
            </div>
            <span className="text-sm sm:text-base font-medium text-slate-700 truncate">
              {copy.quickStartBarLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform duration-300 ${
                isQuickStartOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Expandable step content */}
        <AnimatePresence initial={false}>
          {isQuickStartOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1">
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="space-y-3.5">
                    {QUICK_START_STEPS.map((step) => {
                      const StepIcon = step.icon;
                      return (
                        <div
                          key={step.id}
                          className="flex items-center justify-between gap-4 select-none"
                        >
                          {/* Left: Checkmark or unchecked circle + icon + title & description */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            {step.completed ? (
                              <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <Check className="w-3 h-3 stroke-[3.5]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#edf2f7] border border-slate-200/80 shrink-0 transition-colors" />
                            )}

                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                step.completed
                                  ? 'bg-[#16a34a]/10 text-[#16a34a]'
                                  : 'bg-[#EEF0F8] text-[#5240F2]'
                              }`}
                            >
                              <StepIcon className="w-4 h-4 stroke-[2.2]" />
                            </div>

                            <div className="min-w-0">
                              <div
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  step.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                                }`}
                              >
                                {step.title}
                              </div>
                              <div
                                className={`text-[11px] sm:text-xs font-normal mt-0.5 truncate ${
                                  step.completed ? 'text-slate-300 line-through' : 'text-slate-400'
                                }`}
                              >
                                {step.description}
                              </div>
                            </div>
                          </div>

                          {/* Right: CTA, or just a checkmark once completed */}
                          {step.completed ? (
                            <div className="shrink-0 w-8 h-8 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
                              <Check className="w-4 h-4 text-[#16a34a] stroke-[3]" />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStartStepAction(step.id, step.onClick)}
                              className="shrink-0 rounded-lg border border-indigo-200 bg-white text-[#5945F1] hover:bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            >
                              {step.cta}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── MAIN DASHBOARD LAYOUT (SIDEBAR REMOVED, FULL WIDTH) ─── */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* ════════════ LEFT MAIN CONTENT (FLEX-1 MIN-W-0) ════════════ */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* ─── TOP ROW: Your Cashback (Left) + Choose Broker (Right) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* ── LEFT TOP CARD: Your Stats / Your Performance (md:col-span-8) ── */}
            <div id="tour-your-stats-card" className="md:col-span-8 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5 interactive-card flex flex-col min-h-[260px] sm:min-h-[300px]">
            {/* Header: Cumulative Cashback (icon + label + big number + lots + description) */}
            <div
              onClick={() => onNavigateToTab('cashback-overview')}
              className="pb-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group max-w-sm p-1.5 -m-1.5"
              title="Click to view Cashback Overview"
            >
              <div className="flex items-start gap-3">
                <LimeWalletIcon className="w-11 h-11" />
                <div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    {copy.yourCashbackLabel}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-display text-[#0b1c30] leading-tight mt-1">
                    {dashboardState === 'active-performance'
                      ? selectedTimeframe === '1D'
                        ? '$76.00'
                        : selectedTimeframe === '1W'
                        ? '$290.50'
                        : selectedTimeframe === 'All'
                        ? '$12,480.00'
                        : '$3,128.00'
                      : dashboardState === 'first-trade'
                      ? '$8.00'
                      : '$0.00'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-normal">
                    {dashboardState === 'active-performance'
                      ? selectedTimeframe === '1D'
                        ? '6.8 Lots'
                        : selectedTimeframe === '1W'
                        ? '22.8 Lots'
                        : selectedTimeframe === 'All'
                        ? '1,124.0 Lots'
                        : '112.4 Lots'
                      : dashboardState === 'first-trade'
                      ? '1.6 Lots'
                      : '0.0 Lots'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed pt-2.5 max-w-[240px]">
                {dashboardState === 'active-performance'
                  ? 'Your cashback earned during the selected period will appear here.'
                  : dashboardState === 'first-trade'
                  ? 'Cashback earned from your first trade with HFM.'
                  : copy.yourCashbackEmptyDescription}
              </p>
            </div>
            </div>

            {/* ── RIGHT TOP CARD: Choose Broker CTA (md:col-span-4) ── */}
            {dashboardState === 'empty' ? (
              <div id="tour-quick-start-card" className="md:col-span-4 rounded-2xl bg-white dark:bg-[#170345] border border-[#f0abfc]/70 dark:border-pink-900/50 p-6 shadow-2xs flex flex-col items-center justify-center text-center interactive-card relative overflow-hidden min-h-[260px] sm:min-h-[300px]">
                <BorderBeam
                  borderWidth={1.8}
                  duration={8}
                  colorFrom="#5945F1"
                  colorTo="#FD02B0"
                />
                <h3 className="font-display font-extrabold text-xl sm:text-[22px] text-[#0b1c30] tracking-tight">
                  {copy.chooseBrokerTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-[220px]">
                  {copy.chooseBrokerSubtitle}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('brokers')}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] text-white text-sm font-bold px-5 py-2.5 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>{copy.chooseBrokerCta}</span>
                </button>
              </div>
            ) : dashboardState === 'pending' ||
              dashboardState === 'approved' ||
              dashboardState === 'rejected' ||
              dashboardState === 'unavailable' ||
              dashboardState === 'first-trade' ? (
              <ConnectedAccountStepperCard
                status={dashboardState}
                brokerName="HFM"
                accountNumber="1100012001"
                accountType="Premium"
                onNavigateToTab={onNavigateToTab}
                onOpenConnectModal={onOpenConnectModal}
                onShowToast={showToast}
                onDeleteAccount={() => setShowDeleteConfirm(true)}
                onOpenDeniedPopup={() => setIsConnectionDeniedOpen(true)}
                onOpenUnavailablePopup={() => setIsConnectionUnavailableOpen(true)}
              />
            ) : dashboardState === 'active-performance' ? (
              <ConnectedAccountsCarousel
                className="md:col-span-4"
                onNavigateToTab={onNavigateToTab}
                onNavigateToConnectBroker={handleConnectBrokerAction}
                onOpenConnectModal={onOpenConnectModal}
                onShowToast={showToast}
              />
            ) : (
              /* Your Connected Account Card (Matches Images 02, 03, 04, 05) */
              <div className="md:col-span-4 rounded-2xl bg-white dark:bg-[#170345] border border-[#f0abfc]/70 dark:border-pink-900/50 p-5 shadow-2xs flex flex-col justify-between space-y-4 interactive-card relative overflow-hidden">
                <BorderBeam
                  borderWidth={1.8}
                  duration={8}
                  colorFrom="#5945F1"
                  colorTo="#FD02B0"
                />
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-[#0b1c30] tracking-tight">
                      Your Connected Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-normal">
                      Account connected and ready for trading.
                    </p>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAllConnectedModalOpen(true)}
                      className="px-4 py-1 rounded-full border border-indigo-200/90 hover:border-indigo-300 text-[#5945F1] hover:text-[#432bd4] text-xs sm:text-sm font-semibold bg-white hover:bg-indigo-50/40 shadow-2xs transition-colors cursor-pointer"
                    >
                      Connected Accounts
                    </button>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5945F1]">
                      <button
                        onClick={() => onNavigateToTab('active-trading-accounts')}
                        className="hover:underline hover:text-[#432bd4] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add More Accounts</span>
                      </button>
                      <span className="text-[#5945F1] select-none">,</span>
                      <button
                        onClick={() => onNavigateToTab('brokers')}
                        className="hover:underline hover:text-[#432bd4] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Explore Brokers</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Rows List */}
                <div className="space-y-2.5 pt-1">
                  {/* Account 1: HFM */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex flex-col items-center justify-center text-[10px] font-black shrink-0 leading-none">
                        <span>HFM</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-700">
                        <span className="font-bold text-[#0b1c30]">Premium</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-600">1100012001</span>
                        <span className="text-slate-400">•</span>

                        {dashboardState === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold border border-amber-200/60">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Pending Approval
                          </span>
                        )}

                        {dashboardState === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold border border-rose-200/60">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Rejected</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsConnectionDeniedOpen(true);
                              }}
                              className="text-rose-400 hover:text-rose-700 cursor-pointer transition-colors p-0.5 rounded-full hover:bg-rose-100"
                              title="Rejection details"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}

                        {dashboardState === 'unavailable' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300">
                            <span className="w-2 h-2 rounded-full bg-slate-800" />
                            <span>Unavailable</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsConnectionUnavailableOpen(true);
                              }}
                              className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors p-0.5 rounded-full hover:bg-slate-200"
                              title="Unavailable status details"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}

                        {(dashboardState === 'approved' ||
                          dashboardState === 'first-trade' ||
                          dashboardState === 'active-performance') && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-200/60">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Approved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons matching exact design per state */}
                    {dashboardState === 'rejected' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleConnectBrokerAction('HFM')}
                          className="px-4 py-1.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          Reconnect
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0b1c30] hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {dashboardState === 'unavailable' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCardClick('HFM')}
                          className="px-4 py-1.5 rounded-xl bg-[#0b1c30] hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          Go to 'Broker'
                        </button>
                      </div>
                    )}

                    {dashboardState !== 'pending' &&
                      dashboardState !== 'rejected' &&
                      dashboardState !== 'unavailable' && (
                        <button
                          onClick={() => onNavigateToTab('signals')}
                          className="px-4 py-1.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          Trade Now
                        </button>
                      )}
                  </div>

                  {/* Multiple Accounts for State 5: Active Trading Performance */}
                  {dashboardState === 'active-performance' && (
                    <>
                      {/* Account 2: XM (Approved) */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black shrink-0 relative overflow-hidden">
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#E11928] rounded-full" />
                            <span>XM</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-700">
                            <span className="font-bold text-[#0b1c30]">Ultra Low</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono text-slate-600">1100012001</span>
                            <span className="text-slate-400">•</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-200/60">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Approved
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onNavigateToTab('signals')}
                          className="px-4 py-1.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          Trade Now
                        </button>
                      </div>

                      {/* Account 3: FxPro (Pending Approval) */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#E11928] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                            fx
                          </div>
                          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-700">
                            <span className="font-bold text-[#0b1c30]">Raw+</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono text-slate-600">1100012001</span>
                            <span className="text-slate-400">•</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold border border-amber-200/60">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Pending Approval
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── PROMOTIONS CAROUSEL (Matching reference layout: two promo banners with countdown timers) ─── */}
          <PromotionWidget tone={tone} />

          {/* ─── MISSION CARD WIDGET (Left, widened for readability) + INSTRUMENT ANALYSIS WIDGET (Right) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <MissionCardWidget
              missions={missions}
              onUpdateMissions={onUpdateMissions}
              onNavigateToTab={onNavigateToTab}
              className="md:col-span-5"
              themeOverride="light"
              noShadow
            />

            <InstrumentAnalysisWidget onNavigateToTab={onNavigateToTab} className="md:col-span-7" showPagination={false} containerBgClassName="bg-[#EEF2F9]" noShadow />
          </div>

          {/* ─── BOTTOM ROW: More Connected Brokers. More Opportunities. (1:1 with Small Banner 3.png) ─── */}
          <MoreConnectedBrokersBanner
            onConnectBroker={handleConnectBrokerAction}
            onNavigateToTab={onNavigateToTab}
            className="w-full"
          />
        </div>
      </div>

      {/* ─── CASHBACK CALENDAR MODAL (MATCHES Modal - Cashback Calendar.png) ─── */}
      <CashbackCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onNavigateToTab={onNavigateToTab}
        onTradeNow={() => onNavigateToTab('signals')}
      />

      {/* ─── CONNECTION DENIED POPUP (Matches Connection Denied Popup.png) ─── */}
      <ConnectionDeniedPopup
        isOpen={isConnectionDeniedOpen}
        onClose={() => setIsConnectionDeniedOpen(false)}
        onReconnect={() => {
          setIsConnectionDeniedOpen(false);
          handleConnectBrokerAction('HFM');
        }}
        onExploreBrokers={() => {
          setIsConnectionDeniedOpen(false);
          onNavigateToTab('brokers');
        }}
        brokerName="HFM"
      />

      {/* ─── CONNECTION UNAVAILABLE POPUP (Matches Connection Unavailable Popup.png) ─── */}
      <ConnectionUnavailablePopup
        isOpen={isConnectionUnavailableOpen}
        onClose={() => setIsConnectionUnavailableOpen(false)}
        onConnectNewBrokers={() => {
          setIsConnectionUnavailableOpen(false);
          onNavigateToTab('brokers');
        }}
        brokerName="HFM"
      />

      {/* ─── DELETE ACCOUNT CONFIRMATION MODAL ─── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                  Delete Connected Account?
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  HFM Premium • 1100012001
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this account? Your historical records will remain safe, but automatic cashback tracking for this account will stop until you re-link it.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleStateChange('empty');
                  showToast('Account 1100012001 deleted successfully.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── ALL CONNECTED ACCOUNTS MODAL ─── */}
      <AllConnectedAccountsModal
        isOpen={isAllConnectedModalOpen}
        onClose={() => setIsAllConnectedModalOpen(false)}
        onNavigateToTab={onNavigateToTab}
        onNavigateToConnectBroker={handleConnectBrokerAction}
        onOpenConnectModal={onOpenConnectModal}
        onShowToast={showToast}
      />
    </div>
  );
};
