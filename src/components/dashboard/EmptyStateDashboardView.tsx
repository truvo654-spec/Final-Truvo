import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { CashbackCalendarModal } from './CashbackCalendarModal';
import { ActivityCarousel } from './ActivityCarousel';
import { PerformanceComboChart } from './PerformanceComboChart';
import { MoreConnectedBrokersBanner } from './MoreConnectedBrokersBanner';
import { ConnectedAccountsCarousel } from './ConnectedAccountsCarousel';
import { AllConnectedAccountsModal } from './AllConnectedAccountsModal';
import { ConnectedAccountStepperCard } from './ConnectedAccountStepperCard';
import { ConnectionDeniedPopup } from './ConnectionDeniedPopup';
import { ConnectionUnavailablePopup } from './ConnectionUnavailablePopup';
import { InstrumentAnalysisWidget } from './InstrumentAnalysisWidget';
import { MissionCardWidget } from './MissionCardWidget';
import { CommunityWidget } from './CommunityWidget';
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
      const saved = localStorage.getItem('marketsyde_dashboard_active_state');
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
      localStorage.setItem('marketsyde_dashboard_active_state', newState);
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

      {/* ─── STATE SWITCHER BAR (Quickly Preview All States) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#5945F1] px-2 py-0.5 rounded-md bg-white shadow-2xs">
            Dashboard State
          </span>
          <span className="text-xs text-slate-500 hidden md:inline">
            {dashboardState === 'empty' && 'New Verified Member (No Activity)'}
            {dashboardState === 'pending' && 'Linked Broker Pending Review'}
            {dashboardState === 'approved' && 'Broker Approved & Trade Now Enabled'}
            {dashboardState === 'rejected' && 'Account Rejected: Reconnect or Delete'}
            {dashboardState === 'unavailable' && 'Account Unavailable: Check Broker Server'}
            {dashboardState === 'first-trade' && 'First Trade Retrieved & Cashback Logged'}
            {dashboardState === 'active-performance' && 'Active Multi-Day Trading & Performance Charts'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'empty', label: '1. Empty State' },
            { id: 'pending', label: '2. Pending Approval' },
            { id: 'approved', label: '3. Approved' },
            { id: 'rejected', label: '3a. Rejected' },
            { id: 'unavailable', label: '3b. Unavailable' },
            { id: 'first-trade', label: '4. First Trade' },
            { id: 'active-performance', label: '5. Active Performance' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleStateChange(st.id as DashboardStateType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dashboardState === st.id
                  ? 'bg-[#5945F1] text-white shadow-xs scale-102'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

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
                Look alive. The market won't wait, and we'd hate for you to miss what's next.
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
                The market kept moving. Good thing you did too.
              </p>
            </div>
          )}
        </div>

        {onEnterCustomizeMode && (
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <button
              onClick={onEnterCustomizeMode}
              className="px-3 py-1.5 rounded-xl border border-indigo-100/90 bg-white hover:bg-indigo-50 text-[#5945F1] flex items-center gap-2 shadow-2xs transition-all cursor-pointer hover:border-indigo-300 font-bold text-xs"
              title="Customize dashboard widgets"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden sm:inline">Customize</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── MAIN TWO-COLUMN DASHBOARD LAYOUT (RIGHT SIDEBAR FIXED 300px) ─── */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* ════════════ LEFT MAIN CONTENT (FLEX-1 MIN-W-0) ════════════ */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* ─── TOP ROW: Quick Start Guide / Connected Account (Left) + Your Level (Right) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* ── LEFT TOP CARD: Quick Start Guide vs Your Connected Account ── */}
            {dashboardState === 'empty' ? (
              <div id="tour-quick-start-card" className="md:col-span-8 rounded-2xl bg-white dark:bg-[#170345] border border-[#f0abfc]/70 dark:border-pink-900/50 p-5 sm:p-6 shadow-2xs flex flex-col justify-between interactive-card relative overflow-hidden">
                <BorderBeam
                  borderWidth={1.8}
                  duration={8}
                  colorFrom="#5945F1"
                  colorTo="#FD02B0"
                />
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-extrabold text-xl sm:text-[22px] text-[#5240F2] tracking-tight flex items-baseline">
                        <span>Quick Start Guide</span>
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#E11D89] ml-0.5 inline-block self-end mb-1"></span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                        Turn your trading into cashback, insights and rewards.
                      </p>
                    </div>
                    {onStartTour && (
                      <button
                        type="button"
                        onClick={onStartTour}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#5945F1] bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/70 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                        title="Start Interactive Guided Tour"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FD02B0]" />
                        <span>Take Tour</span>
                      </button>
                    )}
                  </div>

                  {/* 4 Steps Stepper Row matching design screenshot */}
                  <div className="relative mt-7 mb-2">
                    {/* Background track line */}
                    <div className="absolute top-[24px] left-[12.5%] right-[12.5%] h-[3px] bg-[#EEF0F8] rounded-full z-0 pointer-events-none" />

                    {/* Active progress bar segment from Step 1 to middle */}
                    <div className="absolute top-[24px] left-[12.5%] w-[12.5%] h-[3px] bg-[#5240F2] rounded-full z-0 pointer-events-none" />

                    {/* Steps Container */}
                    <div className="grid grid-cols-4 relative z-10">
                      {/* Step 1: Choose Broker (Active) */}
                      <div
                        onClick={() => onNavigateToTab('brokers')}
                        className="flex flex-col items-center text-center cursor-pointer group px-1"
                      >
                        <div className="w-12 h-12 rounded-[14px] bg-[#5240F2] text-white flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105">
                          <UserPlus className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="font-bold text-xs sm:text-[13px] text-[#5240F2] mt-3">
                          Choose Broker
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                          Choose yours, or find a better one here
                        </div>
                      </div>

                      {/* Step 2: Link Trading Account */}
                      <div
                        onClick={() => onNavigateToTab('brokers')}
                        className="flex flex-col items-center text-center cursor-pointer group px-1"
                      >
                        <div className="w-12 h-12 rounded-[14px] bg-[#EEF0F8] text-[#5240F2] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                          <Link2 className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="font-semibold text-xs sm:text-[13px] text-slate-700 mt-3">
                          Link Trading Account
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                          Connect your account to start tracking
                        </div>
                      </div>

                      {/* Step 3: Trade as Usual */}
                      <div className="flex flex-col items-center text-center px-1">
                        <div className="w-12 h-12 rounded-[14px] bg-[#EEF0F8] text-[#5240F2] flex items-center justify-center shrink-0">
                          <CandlestickChart className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="font-semibold text-xs sm:text-[13px] text-slate-700 mt-3">
                          Trade as Usual
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                          Keep trading normally on your platform
                        </div>
                      </div>

                      {/* Step 4: Earn Cashback */}
                      <div className="flex flex-col items-center text-center px-1">
                        <div className="w-12 h-12 rounded-[14px] bg-[#EEF0F8] text-[#5240F2] flex items-center justify-center shrink-0">
                          <DollarSign className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="font-semibold text-xs sm:text-[13px] text-slate-700 mt-3">
                          Earn Cashback
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                          Get paid to trade. Automatically
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                className="md:col-span-8"
                onNavigateToTab={onNavigateToTab}
                onNavigateToConnectBroker={handleConnectBrokerAction}
                onOpenConnectModal={onOpenConnectModal}
                onShowToast={showToast}
              />
            ) : (
              /* Your Connected Account Card (Matches Images 02, 03, 04, 05) */
              <div className="md:col-span-8 rounded-2xl bg-white dark:bg-[#170345] border border-[#f0abfc]/70 dark:border-pink-900/50 p-5 shadow-2xs flex flex-col justify-between space-y-4 interactive-card relative overflow-hidden">
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

            {/* ── RIGHT TOP CARD: Your Level Card (md:col-span-4) ── */}
            <div id="tour-rookie-level-card" className="md:col-span-4 rounded-2xl bg-[#5945F1] p-5 text-white flex flex-col justify-between shadow-xs relative overflow-hidden interactive-card group">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white/80">
                    Your Level
                  </div>
                  {onSelectLevelScenario && (
                    <div className="flex items-center gap-1 bg-black/25 backdrop-blur-xs p-0.5 rounded-lg border border-white/10">
                      {LEVEL_SCENARIOS.map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLevelScenario(sc.id);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            user.tierLevel === sc.level
                              ? 'bg-white text-[#5945F1] shadow-xs'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                          title={`Switch to ${sc.label} (Lv.${sc.level})`}
                        >
                          Lv.{sc.level}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  onClick={() => onNavigateToTab('profile')}
                  className="flex items-center gap-3.5 mt-2 cursor-pointer group"
                  title="View Profile & Account"
                >
                  <TierMascotIcon tierLevel={user.tierLevel || 1} />
                  <div>
                    <h4 className="font-display font-black text-2xl text-white tracking-tight leading-tight group-hover:underline">
                      {user.rankTitle || 'Rookie'}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95 mt-1">
                      <Gem className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{currentPoints.toLocaleString()}/{maxPoints.toLocaleString()} points.</span>
                      {currentPoints > 0 && (
                        <span className="text-[#CAEB0E] font-bold ml-1">Don't stop now</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/25 rounded-full h-2 mt-4 mb-2.5 overflow-hidden">
                  <div
                    className="h-full bg-[#FE01B1] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-white/90">
                  <span className="font-medium">{nextLevelText}</span>
                  <button
                    id="dashboard-level-view-plan-btn"
                    onClick={onOpenViewPlan}
                    className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#5945F1] font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    View Plan
                  </button>
                </div>
              </div>

              <div className="border-t border-white/20 pt-3 mt-4 space-y-1.5 text-xs text-white/95 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">$</span>
                  <span>+{user.boostPercentage || 10}% Cashback Boost</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">%</span>
                  <span>Higher Confidence Signals</span>
                </div>
                <div className="pt-1.5 text-[11px] text-white/70 font-normal select-none">
                  showing data of {recentDateStr}
                </div>
              </div>
            </div>
          </div>

          {/* ─── INSTRUMENT ANALYSIS WIDGET (Matching Widget, 3 coloumn.png) ─── */}
          <InstrumentAnalysisWidget onNavigateToTab={onNavigateToTab} />

          {/* ─── ROW 2: Your Stats / Your Performance Card ─── */}
          <div id="tour-your-stats-card" className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5 interactive-card">
            {/* Header: Title & Timeframe Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <h2 className="font-display text-lg sm:text-xl font-normal text-slate-700 tracking-tight">
                Your Stats: <span className="text-[#0b1c30] font-black">March 2026</span>
              </h2>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                  {(['1D', '1W', '1M', 'All'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedTimeframe === tf
                          ? 'bg-[#CAEB0E] text-black font-extrabold shadow-2xs'
                          : 'hover:text-[#0b1c30] text-slate-600'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                  <button
                    id="open-cashback-calendar-btn"
                    onClick={() => setIsCalendarModalOpen(true)}
                    title="View Cashback Calendar"
                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-[#5945F1] transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsCalendarModalOpen(true)}
                    title="Grid view"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Metric Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 pb-5 border-b border-slate-100 items-stretch">
              {/* Block 1: ACTIVE STREAK */}
              <div
                onClick={() => setIsCalendarModalOpen(true)}
                className="space-y-2 p-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                title="Click to view Calendar"
              >
                <div className="flex items-start gap-3">
                  <LimeCalendarIcon className="w-11 h-11" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      ACTIVE STREAK
                    </div>
                    <div className="text-2xl font-black font-display text-[#0b1c30] leading-tight">
                      {dashboardState === 'active-performance'
                        ? '12 days'
                        : dashboardState === 'first-trade'
                        ? '1 day'
                        : '0 days'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-normal">
                      {dashboardState === 'active-performance'
                        ? 'Track your consistency'
                        : dashboardState === 'first-trade'
                        ? 'First day of your streak!'
                        : 'Start trading to build streak'}
                    </div>
                  </div>
                </div>

                {/* 2 Rows of 16 Heatmap Squares */}
                <div className="pt-2 space-y-1">
                  <div className="flex items-center gap-[3px] flex-wrap max-w-[210px]">
                    {(dashboardState === 'active-performance'
                      ? [true, true, true, true, false, true, false, true, true, true, true, true, true, true, false, true]
                      : dashboardState === 'first-trade'
                      ? [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
                      : Array(16).fill(false)
                    ).map((isActive, i) => (
                      <span
                        key={`streak-r1-${i}`}
                        className={`w-2.5 h-2.5 rounded-[2px] transition-colors ${
                          isActive ? 'bg-[#BEF226] border border-[#a3e635]/50' : 'bg-slate-200/90'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-[3px] flex-wrap max-w-[210px]">
                    {(dashboardState === 'active-performance'
                      ? [false, true, false, true, true, false, false, true, true, false, true, true, true, true, false, false]
                      : Array(16).fill(false)
                    ).map((isActive, i) => (
                      <span
                        key={`streak-r2-${i}`}
                        className={`w-2.5 h-2.5 rounded-[2px] transition-colors ${
                          isActive ? 'bg-[#BEF226] border border-[#a3e635]/50' : 'bg-slate-200/90'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Block 2: CUMULATIVE CASHBACK */}
              <div
                onClick={() => onNavigateToTab('cashback-overview')}
                className="space-y-2 p-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                title="Click to view Cashback Overview"
              >
                <div className="flex items-start gap-3">
                  <LimeWalletIcon className="w-11 h-11" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      CUMULATIVE CASHBACK
                    </div>
                    <div className="text-2xl font-black font-display text-[#0b1c30] leading-tight">
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

                <p className="text-xs text-slate-400 leading-relaxed pt-1.5 max-w-[240px]">
                  {dashboardState === 'active-performance'
                    ? 'Your cashback earned during the selected period will appear here.'
                    : dashboardState === 'first-trade'
                    ? 'Cashback earned from your first trade with HFM.'
                    : 'Connect a broker to start earning cashback automatically.'}
                </p>
              </div>

              {/* Block 3: TOP 3 PERFORMERS */}
              <div className="space-y-2 p-1.5 relative">
                <div className="flex items-center justify-between gap-2 relative">
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    TOP 3 PERFORMERS
                  </div>

                  {isPerformanceActive ? (
                    /* Dropdown Selector */
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPerformerDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>{performerType === 'assets' ? 'Earning Assets' : 'Cashback Brokers'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                            isPerformerDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Popover Menu matching design */}
                      {isPerformerDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setPerformerType('assets');
                              setIsPerformerDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                              performerType === 'assets'
                                ? 'bg-[#F0EFFF] text-[#5945F1] font-bold'
                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            Earning Assets
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPerformerType('brokers');
                              setIsPerformerDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                              performerType === 'brokers'
                                ? 'bg-[#F0EFFF] text-[#5945F1] font-bold'
                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            Cashback Brokers
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-100">
                      No Data
                    </span>
                  )}
                </div>

                {dashboardState === 'active-performance' ? (
                  /* Donut Chart & List (Full active trader) */
                  <div className="flex items-center gap-3 pt-2">
                    <TopPerformersDonutChart type={performerType} />

                    {performerType === 'assets' ? (
                      <div className="space-y-1.5 text-xs flex-1 min-w-0">
                        {/* Item 1: EUR/USD */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#BEF226] shrink-0" />
                            <EUFlagCircle />
                            <span className="truncate">EUR/USD</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            $1,150.00
                          </span>
                        </div>

                        {/* Item 2: Dow Jones */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FD02B0] shrink-0" />
                            <UKFlagCircle />
                            <span className="truncate">Dow Jones</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            $1,035.00
                          </span>
                        </div>

                        {/* Item 3: AUDUSD */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1] shrink-0" />
                            <AUDFlagCircle />
                            <span className="truncate">AUDUSD</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            $943.00
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-xs flex-1 min-w-0">
                        {/* Item 1: XM Global */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
                            <span className="w-4 h-4 rounded-full bg-red-600 text-[9px] font-black text-white flex items-center justify-center shrink-0">
                              XM
                            </span>
                            <span className="truncate">XM Global</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            $1,420.00
                          </span>
                        </div>

                        {/* Item 2: HFM Markets */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] shrink-0" />
                            <span className="w-4 h-4 rounded-full bg-red-700 text-[8px] font-black text-white flex items-center justify-center shrink-0">
                              HF
                            </span>
                            <span className="truncate">HFM Markets</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            $1,080.00
                          </span>
                        </div>

                        {/* Item 3: Exness Pro */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-[8px] font-black text-white flex items-center justify-center shrink-0">
                              EX
                            </span>
                            <span className="truncate">Exness Pro</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            $628.00
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : dashboardState === 'first-trade' ? (
                  /* Single First Trade Performer */
                  <div className="flex items-center gap-3 pt-2">
                    <TopPerformersDonutChart type={performerType} isFirstTrade={true} />
                    <div className="space-y-1 text-xs flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#BEF226] shrink-0" />
                          {performerType === 'assets' ? (
                            <>
                              <EUFlagCircle />
                              <span className="truncate font-bold">EUR/USD</span>
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 rounded-full bg-red-700 text-[8px] font-black text-white flex items-center justify-center shrink-0">
                                HF
                              </span>
                              <span className="truncate font-bold">HFM Markets</span>
                            </>
                          )}
                        </div>
                        <span className="font-mono font-black text-slate-900 shrink-0">
                          $8.00
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        100% of trading volume (1 trade)
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State for Block 3 */
                  <div className="pt-2 pb-1 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <TrendingUp className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-700">No performance data yet</div>
                      <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        Your top earning assets and brokers will appear here once you trade.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── INTEGRATED PERFORMANCE COMBO CHART (Inside Same Card) ─── */}
            <PerformanceComboChart
              totalCashback={
                dashboardState === 'active-performance'
                  ? selectedTimeframe === '1D'
                    ? '$76.00'
                    : selectedTimeframe === '1W'
                    ? '$290.50'
                    : selectedTimeframe === 'All'
                    ? '$12,480.00'
                    : '$1,248.00'
                  : dashboardState === 'first-trade'
                  ? '$8.00'
                  : '$0.00'
              }
              lotsTraded={
                dashboardState === 'active-performance'
                  ? selectedTimeframe === '1D'
                    ? '6.8'
                    : selectedTimeframe === '1W'
                    ? '22.8'
                    : selectedTimeframe === 'All'
                    ? '1,124.0'
                    : '112.4'
                  : dashboardState === 'first-trade'
                  ? '1.6'
                  : '0'
              }
              avgCashbackPerLot={
                dashboardState === 'active-performance'
                  ? '$11.10'
                  : dashboardState === 'first-trade'
                  ? '$5.00'
                  : '$0.00'
              }
              bestDay={
                dashboardState === 'active-performance'
                  ? '$82.00'
                  : dashboardState === 'first-trade'
                  ? '$8.00'
                  : '$0.00'
              }
              timeframe={selectedTimeframe}
              isEmpty={!isPerformanceActive}
              isFirstTrade={dashboardState === 'first-trade'}
              emptyStateTitle={
                dashboardState === 'empty'
                  ? 'No Performance Recorded Yet'
                  : dashboardState === 'pending'
                  ? 'Broker Review in Progress'
                  : dashboardState === 'approved'
                  ? 'Ready for Your First Trade'
                  : dashboardState === 'rejected'
                  ? 'Connection Denied'
                  : 'Account Archived'
              }
              emptyStateDescription={
                dashboardState === 'empty'
                  ? 'Connect a broker and place your first trade to plot daily cashback earnings and volume in real time.'
                  : dashboardState === 'pending'
                  ? 'Your linked account (HFM • 1100012001) is awaiting review. Charts will activate once approved.'
                  : dashboardState === 'approved'
                  ? 'Your account is approved! Place your first trade with your broker to start earning cashback.'
                  : dashboardState === 'rejected'
                  ? 'Your broker connection could not be verified under Marketsyde. Please reconnect or link another broker.'
                  : 'Your broker has archived this account due to inactivity. Re-link an active account to resume.'
              }
              emptyStateCtaText={
                dashboardState === 'empty'
                  ? 'Connect Broker'
                  : dashboardState === 'pending'
                  ? 'Check Broker Status'
                  : dashboardState === 'approved'
                  ? 'Trade Now'
                  : dashboardState === 'rejected'
                  ? 'Reconnect Account'
                  : 'Connect New Brokers'
              }
              onEmptyStateCtaClick={
                dashboardState === 'empty'
                  ? handleConnectBrokerAction
                  : dashboardState === 'pending'
                  ? () => onNavigateToTab('brokers')
                  : dashboardState === 'approved'
                  ? () => onNavigateToTab('signals')
                  : dashboardState === 'rejected'
                  ? () => setIsConnectionDeniedOpen(true)
                  : () => setIsConnectionUnavailableOpen(true)
              }
              className="w-full pt-1"
            />
          </div>

          {/* ─── MISSION CARD WIDGET (Matching Mission Card.png & inserted between Performance Chart and Signals) ─── */}
          <MissionCardWidget
            missions={missions}
            onUpdateMissions={onUpdateMissions}
            onNavigateToTab={onNavigateToTab}
          />

          {/* ─── COMMUNITY WIDGET (Replaces Most Recent Signals widget - shows 2.5 cards + CTA to community) ─── */}
          <CommunityWidget
            onNavigateToTab={onNavigateToTab}
            onToast={showToast}
          />

          {/* ─── BOTTOM ROW: More Connected Brokers. More Opportunities. (1:1 with Small Banner 3.png) ─── */}
          <MoreConnectedBrokersBanner
            onConnectBroker={handleConnectBrokerAction}
            onNavigateToTab={onNavigateToTab}
            className="w-full"
          />
        </div>

        {/* ════════════ RIGHT SIDEBAR: STRICTLY FIXED AT 300px WITH STICKY SCROLL FIX ════════════ */}
        <aside
          id="dashboard-right-sidebar"
          aria-label="Dashboard Sidebar"
          className="w-full lg:w-[300px] lg:shrink-0 space-y-5 lg:sticky lg:top-[84px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* ── CARD 0: Activity Carousel (Auto-slides every 4s, 1:1 with UPS Next Milestone & UPS Pick up where you left off) ── */}
          <ActivityCarousel
            onNavigateToTab={onNavigateToTab}
            onConnectBroker={handleConnectBrokerAction}
            onSelectBrokerDetail={handleCardClick}
          />

          {/* ── CARD 1: Your Winning Signals (Shown in State 4 & 5 matching Images 04 & 05) ── */}
          {isPerformanceActive && (
            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#0b1c30]">
                    Your <span className="text-[#5945F1]">Winning Signals</span><span className="text-[#FD02B0]">.</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
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

              <div className="grid grid-cols-2 gap-2.5">
                {/* EUR/USD */}
                <div
                  onClick={() => onNavigateToTab('signals')}
                  className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-[#0b1c30]">
                    <span>🇪🇺</span>
                    <span>EUR/USD</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <MiniSparkline trend="up" color="#16a34a" />
                    <span className="text-[11px] font-bold text-[#16a34a] font-mono">+0.33%</span>
                  </div>
                </div>

                {/* Dow Jones */}
                <div
                  onClick={() => onNavigateToTab('signals')}
                  className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-[#0b1c30]">
                    <span>🇬🇧</span>
                    <span className="truncate">Dow Jones</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <MiniSparkline trend="down" color="#5945F1" />
                    <span className="text-[11px] font-bold text-[#5945F1] font-mono">-0.11%</span>
                  </div>
                </div>

                {/* AUDUSD */}
                <div
                  onClick={() => onNavigateToTab('signals')}
                  className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-[#0b1c30]">
                    <span>🇦🇺</span>
                    <span>AUDUSD</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <MiniSparkline trend="up" color="#16a34a" />
                    <span className="text-[11px] font-bold text-[#16a34a] font-mono">+0.44%</span>
                  </div>
                </div>

                {/* BTC/USD */}
                <div
                  onClick={() => onNavigateToTab('signals')}
                  className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-[#0b1c30]">
                    <span>₿</span>
                    <span>BTC/USD</span>
                  </div>
                  <div className="text-[11px] font-black text-[#FD02B0] tracking-tight">
                    Your next win?
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CARD 2: Tops Earning Points. (Always Present in All 5 States) ── */}
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

          {/* ── CARD 3: Most Recent Signals (Replaces Community Spotlight in Sidebar) ── */}
          {!isPerformanceActive && (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                    Most Recent <span className="text-[#5945F1]">Signals</span><span className="text-[#FD02B0]">.</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View most recent signals for your trading
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToTab('signals')}
                  className="text-xs font-bold text-[#5945F1] hover:text-[#492CED] transition-colors cursor-pointer flex items-center gap-0.5 shrink-0"
                >
                  <span>All Signals</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Signal Items List with Live Interactive Ticks */}
              <div className="space-y-2.5 pt-1">
                {/* 1. EUR/USD */}
                {(() => {
                  const isTicked = tickedSignalTicker === 'EUR/USD';
                  const val = +(0.33 + (signalLiveDeltas['EUR/USD'] || 0)).toFixed(2);
                  const isPos = val >= 0;
                  return (
                    <div
                      onClick={() => {
                        const s = signals.find((item) => item.ticker === 'EUR/USD') || signals[0];
                        if (s) onSelectSignal(s);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isTicked
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇪🇺</span>
                        <div>
                          <div className="font-bold text-xs text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                            EUR/USD
                          </div>
                          <motion.div
                            animate={
                              isTicked
                                ? { scale: [1, 1.15, 1] }
                                : { scale: [1, 1.02, 1] }
                            }
                            transition={{ duration: isTicked ? 0.45 : 2.5, repeat: isTicked ? 0 : Infinity }}
                            className={`text-[11px] font-bold font-mono inline-flex items-center gap-0.5 ${
                              isPos ? 'text-[#10B981]' : 'text-rose-500'
                            }`}
                          >
                            <span>{isPos ? '+' : ''}{val.toFixed(2)}%</span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniSparkline trend={isPos ? 'up' : 'down'} color={isPos ? '#16a34a' : '#ef4444'} isTicked={isTicked} />
                        <motion.span
                          animate={isTicked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          className="px-2.5 py-0.5 bg-[#CAEB0E] hover:bg-[#b8d60d] text-slate-950 text-[10px] font-black rounded-lg shadow-2xs"
                        >
                          Buy
                        </motion.span>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. GOOGL */}
                {(() => {
                  const isTicked = tickedSignalTicker === 'GOOGL';
                  const val = +(-0.11 + (signalLiveDeltas['GOOGL'] || 0)).toFixed(2);
                  const isPos = val >= 0;
                  return (
                    <div
                      onClick={() => {
                        const s = signals.find((item) => item.ticker === 'GOOGL') || signals[1];
                        if (s) onSelectSignal(s);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isTicked
                          ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
                          : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black shadow-2xs text-[#4285F4]">
                          G
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                            GOOGL
                          </div>
                          <motion.div
                            animate={
                              isTicked
                                ? { scale: [1, 1.15, 1] }
                                : { scale: [1, 1.02, 1] }
                            }
                            transition={{ duration: isTicked ? 0.45 : 2.5, repeat: isTicked ? 0 : Infinity }}
                            className={`text-[11px] font-bold font-mono inline-flex items-center gap-0.5 ${
                              isPos ? 'text-[#10B981]' : 'text-red-500'
                            }`}
                          >
                            <span>{isPos ? '+' : ''}{val.toFixed(2)}%</span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniSparkline trend={isPos ? 'up' : 'down'} color={isPos ? '#16a34a' : '#ef4444'} isTicked={isTicked} />
                        <motion.span
                          animate={isTicked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          className="px-2.5 py-0.5 bg-[#5945F1] text-white text-[10px] font-black rounded-lg shadow-2xs"
                        >
                          Sell
                        </motion.span>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. BTC/USD */}
                <div
                  onClick={() => {
                    const s = signals.find((item) => item.ticker === 'BTC/USD') || signals[0];
                    if (s) onSelectSignal(s);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-100/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#f7931a] text-white font-bold text-[10px] flex items-center justify-center shadow-2xs shrink-0">
                      ₿
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">BTC/USD</div>
                      <div className="text-[10px] text-[#FD02B0] font-bold flex items-center gap-1">
                        <Gem className="w-2.5 h-2.5" />
                        <span>Premium Signal</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenViewPlan();
                    }}
                    className="px-2.5 py-0.5 border border-[#FD02B0] text-[#FD02B0] hover:bg-pink-50 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Upgrade
                  </button>
                </div>

                {/* 4. S&P 500 */}
                {(() => {
                  const isTicked = tickedSignalTicker === 'S&P 500';
                  const val = +(0.44 + (signalLiveDeltas['S&P 500'] || 0)).toFixed(2);
                  const isPos = val >= 0;
                  return (
                    <div
                      onClick={() => {
                        const s = signals.find((item) => item.ticker.includes('S&P') || item.ticker.includes('500')) || signals[2];
                        if (s) onSelectSignal(s);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isTicked
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#E11928] text-white font-black text-[8px] flex items-center justify-center shadow-2xs shrink-0">
                          500
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                            S&P 500
                          </div>
                          <motion.div
                            animate={
                              isTicked
                                ? { scale: [1, 1.15, 1] }
                                : { scale: [1, 1.02, 1] }
                            }
                            transition={{ duration: isTicked ? 0.45 : 2.5, repeat: isTicked ? 0 : Infinity }}
                            className={`text-[11px] font-bold font-mono inline-flex items-center gap-0.5 ${
                              isPos ? 'text-[#10B981]' : 'text-rose-500'
                            }`}
                          >
                            <span>{isPos ? '+' : ''}{val.toFixed(2)}%</span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniSparkline trend={isPos ? 'up' : 'down'} color={isPos ? '#16a34a' : '#ef4444'} isTicked={isTicked} />
                        <motion.span
                          animate={isTicked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          className="px-2.5 py-0.5 bg-[#CAEB0E] hover:bg-[#b8d60d] text-slate-950 text-[10px] font-black rounded-lg shadow-2xs"
                        >
                          Buy
                        </motion.span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={() => onNavigateToTab('signals')}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5945F1] to-[#8B5CF6] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore All Signals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>
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
