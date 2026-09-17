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
} from 'lucide-react';
import { CashbackCalendarModal } from './CashbackCalendarModal';
import { ActivityCarousel } from './ActivityCarousel';
import { PerformanceComboChart } from './PerformanceComboChart';
import { MoreConnectedBrokersBanner } from './MoreConnectedBrokersBanner';
import { ConnectedAccountsCarousel } from './ConnectedAccountsCarousel';
import { AllConnectedAccountsModal } from './AllConnectedAccountsModal';

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
  initialState?: DashboardStateType;
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
 * 3D Calendar Vector Icon for Active Streak with interactive hover
 */
function ActiveStreakCalendarIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c084fc] via-[#a855f7] to-[#7c3aed] p-2 shadow-sm flex items-center justify-center relative shrink-0 hover:scale-110 hover:-rotate-3 transition-transform duration-300 cursor-pointer">
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
 * 3D Wallet & Coin Bag Vector Icon for Cumulative Cashback Empty State with interactive hover
 */
function WalletCoin3DIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#818cf8] via-[#6366f1] to-[#4f46e5] p-2 shadow-sm flex items-center justify-center relative shrink-0 hover:scale-110 hover:rotate-3 transition-transform duration-300 cursor-pointer">
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
 * 3D Coin Swap Vector Icon for Top Earning Assets Empty State with interactive hover
 */
function CoinSwap3DIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c084fc] via-[#a855f7] to-[#7e22ce] p-2 shadow-sm flex items-center justify-center relative shrink-0 hover:scale-110 hover:-rotate-3 transition-transform duration-300 cursor-pointer">
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
 * 3D Empty Performance Chart Graphic
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
 * Donut Chart for Top 3 Performers (Matching Images 04 & 05)
 */
function TopPerformersDonutChart() {
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {/* Yellow/Amber Segment: XAU/USD */}
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
        {/* Magenta Segment: Dow Jones */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#FD02B0"
          strokeWidth="16"
          strokeDasharray="81 238"
          strokeDashoffset="-96"
          strokeLinecap="round"
        />
        {/* Blue/Indigo Segment: AUDUSD */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="16"
          strokeDasharray="66 238"
          strokeDashoffset="-182"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
      </div>
    </div>
  );
}

/**
 * Mini Sparkline SVG
 */
function MiniSparkline({ trend, color }: { trend: 'up' | 'down'; color: string }) {
  const points =
    trend === 'up' ? '0,14 8,11 16,13 24,7 32,9 40,2' : '0,2 8,6 16,4 24,11 32,9 40,14';
  return (
    <div className="w-10 h-4 flex items-center shrink-0">
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
  onEnterCustomizeMode,
  initialState,
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
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAllConnectedModalOpen, setIsAllConnectedModalOpen] = useState(false);
  const recentDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('All');
  const [statusInfoModal, setStatusInfoModal] = useState<'rejected' | 'unavailable' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStateChange = (newState: DashboardStateType) => {
    setDashboardState(newState);
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

  // Points and Progress calculation based on state
  const points =
    dashboardState === 'empty' ||
    dashboardState === 'pending' ||
    dashboardState === 'approved' ||
    dashboardState === 'rejected' ||
    dashboardState === 'unavailable'
      ? 0
      : dashboardState === 'first-trade'
      ? 5
      : 50;

  const progressPercent = Math.min(100, (points / 150) * 100);

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
              <div className="md:col-span-8 rounded-2xl bg-white border border-[#f0abfc]/90 p-5 shadow-2xs flex flex-col justify-between interactive-card group">
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
                    <div className="flex flex-col items-center text-center space-y-1.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#5945F1] text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-[#0b1c30]">Choose Broker</div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Choose yours, or find a better one here
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center space-y-1.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full border border-slate-300 text-[#5945F1] flex items-center justify-center shadow-2xs shrink-0 bg-white group-hover:scale-110 transition-transform">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-[#0b1c30]">Link Trading Account</div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Connect your account to start tracking
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center space-y-1.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full border border-slate-300 text-[#5945F1] flex items-center justify-center shadow-2xs shrink-0 bg-white group-hover:scale-110 transition-transform">
                        <CandlestickChart className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-[#0b1c30]">Trade as Usual</div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Keep trading normally on your platform
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center space-y-1.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full border border-slate-300 text-[#5945F1] flex items-center justify-center shadow-2xs shrink-0 bg-white group-hover:scale-110 transition-transform">
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
            ) : dashboardState === 'active-performance' || dashboardState === 'approved' ? (
              <ConnectedAccountsCarousel
                className="md:col-span-8"
                onNavigateToTab={onNavigateToTab}
                onNavigateToConnectBroker={handleConnectBrokerAction}
                onOpenConnectModal={onOpenConnectModal}
                onShowToast={showToast}
              />
            ) : (
              /* Your Connected Account Card (Matches Images 02, 03, 04, 05) */
              <div className="md:col-span-8 rounded-2xl bg-white border border-[#f0abfc]/90 p-5 shadow-2xs flex flex-col justify-between space-y-4 interactive-card">
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
                                setStatusInfoModal('rejected');
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
                                setStatusInfoModal('unavailable');
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
            <div className="md:col-span-4 rounded-2xl bg-[#5945F1] p-5 text-white flex flex-col justify-between shadow-xs relative overflow-hidden interactive-card group">
              <div>
                <div className="text-xs font-semibold text-white/80">
                  Your Level
                </div>
                <div className="flex items-center gap-3.5 mt-2">
                  <RookieGhostIcon />
                  <div>
                    <h4 className="font-display font-black text-2xl text-white tracking-tight leading-tight">
                      {user.rankTitle || 'Rookie'}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95 mt-1">
                      <Gem className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{points}/150 points.</span>
                      {points > 0 && (
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
                  <span className="font-medium">Next level at 50 Points</span>
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

          {/* ─── ROW 2: Your Stats / Your Performance Card ─── */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5 interactive-card">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 pb-4 border-b border-slate-100 items-stretch">
              {/* Block 1: ACTIVE STREAK */}
              <div
                onClick={() => setIsCalendarModalOpen(true)}
                className="space-y-2 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                title="Click to view Calendar"
              >
                <div className="flex items-start gap-3">
                  <ActiveStreakCalendarIcon />
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      ACTIVE STREAK
                    </div>
                    <div className="text-2xl font-black font-display text-[#0b1c30] leading-tight">
                      {dashboardState === 'active-performance'
                        ? '12 days'
                        : dashboardState === 'first-trade'
                        ? '1 days'
                        : '0 days'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-normal">
                      {isPerformanceActive ? 'Keep it going!' : 'Track your consistency'}
                    </div>
                  </div>
                </div>

                {/* 2 Rows of 7 Square Dots (14 Dots Total) */}
                <div className="pt-2">
                  <div className="grid grid-cols-7 gap-1.5 max-w-[170px]">
                    {[...Array(14)].map((_, i) => {
                      const isFilled =
                        dashboardState === 'active-performance'
                          ? i < 12
                          : dashboardState === 'first-trade'
                          ? i < 1
                          : false;
                      return (
                        <span
                          key={`streak-dot-${i}`}
                          className={`w-3 h-3 rounded-xs transition-colors ${
                            isFilled ? 'bg-[#5945F1]' : 'bg-slate-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Block 2: CUMULATIVE CASHBACK */}
              <div
                onClick={() => onNavigateToTab('cashback-overview')}
                className="space-y-2 p-2 rounded-2xl border border-transparent hover:border-[#FD02B0]/40 hover:bg-slate-50/70 transition-all cursor-pointer group relative overflow-hidden"
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
                        {dashboardState === 'active-performance'
                          ? '$3,128.00'
                          : dashboardState === 'first-trade'
                          ? '$8.00'
                          : '$0.00'}
                      </span>
                      {!isPerformanceActive && (
                        <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-normal">
                      {dashboardState === 'active-performance'
                        ? '163.6 Lots'
                        : dashboardState === 'first-trade'
                        ? '1.6 Lots'
                        : '0.0 Lots'}
                    </div>
                  </div>
                </div>

                {isPerformanceActive ? (
                  /* Smooth Area Wave Graph */
                  <div className="w-full h-10 mt-1">
                    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="cumWaveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,30 Q 30,32 60,25 T 120,20 T 170,12 T 200,6 L 200,40 L 0,40 Z"
                        fill="url(#cumWaveGrad)"
                      />
                      <path
                        d="M 0,30 Q 30,32 60,25 T 120,20 T 170,12 T 200,6"
                        fill="none"
                        stroke="#5945F1"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Your cashback earned during the selected period will appear here.
                  </p>
                )}
              </div>

              {/* Block 3: TOP 3 EARNING ASSETS */}
              <div className="space-y-2 p-2">
                <div className="flex items-start gap-3">
                  {!isPerformanceActive && <CoinSwap3DIcon />}
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      TOP 3 EARNING ASSETS
                    </div>
                  </div>
                </div>

                {isPerformanceActive ? (
                  <div className="flex items-center gap-3 pt-1">
                    <TopPerformersDonutChart />
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                          <span>🪙 XAU/USD</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {dashboardState === 'active-performance' ? '$1,150.00' : '$5.00'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-[#FD02B0]" />
                          <span>🇬🇧 Dow Jones</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {dashboardState === 'active-performance' ? '$1,035.00' : '$1.00'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                          <span>🇦🇺 AUDUSD</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {dashboardState === 'active-performance' ? '$943.00' : '$2.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {dashboardState === 'empty'
                      ? 'Your top-paying assets will rank here once you take your first trade.'
                      : 'Your highest cashback generating assets will show up here after your first trades.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── ROW 3: Dedicated Full-Width Performance Combo Chart (1:1 with image.png) ─── */}
          <PerformanceComboChart
            totalCashback={
              dashboardState === 'active-performance'
                ? '$3,128.00'
                : dashboardState === 'first-trade'
                ? '$8.00'
                : '$0.00'
            }
            lotsTraded={
              dashboardState === 'active-performance'
                ? '163.6'
                : dashboardState === 'first-trade'
                ? '1.6'
                : '0'
            }
            avgCashbackPerLot={
              dashboardState === 'active-performance'
                ? '$19.12'
                : dashboardState === 'first-trade'
                ? '$5.00'
                : '$0.00'
            }
            bestDay={
              dashboardState === 'active-performance'
                ? '$415.00'
                : dashboardState === 'first-trade'
                ? '$8.00'
                : '$0.00'
            }
            className="w-full"
          />

          {/* ─── FULL-WIDTH SIGNALS TABLE (Matching Images 04 & 05) ─── */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
                    Most Recent Signal<span className="text-[#FD02B0]">s.</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time signals, tailored to you. Spot opportunities and execute instantly
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Asset</span>
                  <div className="relative">
                    <select
                      value={selectedAssetFilter}
                      onChange={(e) => setSelectedAssetFilter(e.target.value)}
                      className="appearance-none pl-3 pr-7 py-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0b1c30] shadow-2xs cursor-pointer focus:outline-none"
                    >
                      <option value="All">All</option>
                      <option value="Forex">Forex</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Indices">Indices</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Signals Detailed Rows */}
              <div className="space-y-2.5 divide-y divide-slate-100">
                {[
                  {
                    ticker: 'EUR/USD',
                    flag: '🇪🇺',
                    confidence: '70%',
                    trend: 'up',
                    sparkColor: '#84cc16',
                    tp: '1.0690',
                    sl: '1.0696',
                    expectedMove: '▲ 20 - 29PIPS',
                    moveColor: 'text-[#84cc16]',
                    change: '+0.33%',
                    action: 'Buy',
                    btnBg: 'bg-[#A3E635] text-slate-900',
                  },
                  {
                    ticker: 'GOOGL',
                    icon: 'G',
                    confidence: '74%',
                    trend: 'down',
                    sparkColor: '#5945F1',
                    tp: '1.0690',
                    sl: '1.0696',
                    expectedMove: '▼ 25 - 40 PIPS',
                    moveColor: 'text-[#5945F1]',
                    change: '-0.11%',
                    action: 'Sell',
                    btnBg: 'bg-[#5945F1] text-white',
                  },
                  {
                    ticker: 'BTC/USD',
                    flag: '₿',
                    confidence: '92%',
                    isPremium: true,
                    action: 'Plans',
                  },
                  {
                    ticker: 'S&P 500',
                    badge: '500',
                    confidence: '71%',
                    trend: 'up',
                    sparkColor: '#84cc16',
                    tp: '1.0690',
                    sl: '1.0696',
                    expectedMove: '▲ 20 - 29PIPS',
                    moveColor: 'text-[#84cc16]',
                    change: '+0.44%',
                    action: 'Buy',
                    btnBg: 'bg-[#A3E635] text-slate-900',
                  },
                  {
                    ticker: 'XAU/USD',
                    flag: '🪙',
                    confidence: '73%',
                    trend: 'down',
                    sparkColor: '#5945F1',
                    tp: '1.0690',
                    sl: '1.0696',
                    expectedMove: '▼ 25 - 40 PIPS',
                    moveColor: 'text-[#5945F1]',
                    change: '-0.24%',
                    action: 'Sell',
                    btnBg: 'bg-[#5945F1] text-white',
                  },
                ].map((s, idx) => (
                  <div
                    key={s.ticker}
                    className="pt-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    {/* Symbol & Confidence */}
                    <div className="flex items-center gap-3 w-44">
                      <div className="flex items-center gap-2">
                        {s.flag && <span className="text-base">{s.flag}</span>}
                        {s.icon && (
                          <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-[#4285F4] text-[10px]">
                            G
                          </div>
                        )}
                        {s.badge && (
                          <div className="w-5 h-5 rounded-full bg-[#E11928] text-white flex items-center justify-center font-bold text-[8px]">
                            500
                          </div>
                        )}
                        <span className="font-bold text-[#0b1c30]">{s.ticker}</span>
                      </div>
                      <span className="font-bold text-[#5945F1]">{s.confidence} confidence</span>
                    </div>

                    {/* Sparkline & Technical Stats */}
                    {s.isPremium ? (
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#5945F1] font-bold text-[11px] border border-purple-200">
                            💎 Premium Signal ⓘ
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Higher levels only. Connect broker and trade to unlock.
                          </span>
                        </div>
                        <button
                          onClick={onOpenViewPlan}
                          className="px-4 py-1 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer shrink-0"
                        >
                          Plans
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-24">
                          <MiniSparkline
                            trend={s.trend as 'up' | 'down'}
                            color={s.sparkColor || '#84cc16'}
                          />
                        </div>

                        <div className="font-mono text-slate-600 font-semibold">
                          <span>TP: {s.tp} </span>
                          <span className="ml-2">SL: {s.sl}</span>
                        </div>

                        <div className="text-slate-500">
                          <span>Expected move </span>
                          <span className={`font-bold ${s.moveColor}`}>{s.expectedMove}</span>
                        </div>

                        <div className="font-mono font-bold text-slate-800">
                          Price change <span className={s.change?.startsWith('+') ? 'text-emerald-600' : 'text-[#5945F1]'}>{s.change}</span>
                        </div>

                        <button
                          onClick={() => onNavigateToTab('signals')}
                          className={`px-4 py-1 rounded-lg font-bold text-xs shadow-2xs hover:opacity-90 transition-all cursor-pointer ${s.btnBg}`}
                        >
                          {s.action}
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => onNavigateToTab('signals')}
                  className="px-6 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  View All Signals
                </button>
              </div>
            </div>

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

          {/* ── CARD 3: Most Recent Signals. (Shown on Right Sidebar for State 1, 2, 3) ── */}
          {!isPerformanceActive && (
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
                          <MiniSparkline
                            trend={s.change.startsWith('+') ? 'up' : 'down'}
                            color={s.sparkColor}
                          />
                          <span
                            className={`text-[11px] font-mono font-bold ${
                              s.change.startsWith('+') ? 'text-emerald-600' : 'text-[#5945F1]'
                            }`}
                          >
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
                          onClick={onOpenViewPlan}
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

      {/* ─── STATUS INFO MODAL (REJECTED & UNAVAILABLE) ─── */}
      {statusInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150 space-y-4">
            <button
              onClick={() => setStatusInfoModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  statusInfoModal === 'rejected'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {statusInfoModal === 'rejected' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
                  {statusInfoModal === 'rejected'
                    ? 'Account Verification Rejected'
                    : 'Account Connection Unavailable'}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  HFM Premium • 1100012001
                </div>
              </div>
            </div>

            <div className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
              {statusInfoModal === 'rejected' ? (
                <>
                  <p className="font-semibold text-rose-700">
                    The broker rejected verification for this trading account.
                  </p>
                  <p>Common reasons for rejection:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                    <li>Account ID does not match an active HFM account.</li>
                    <li>Investor or read-only password was invalid or expired.</li>
                    <li>Account was archived or registered under a different affiliate group.</li>
                  </ul>
                  <p className="pt-1 text-slate-600 font-medium">
                    Please click <strong>Reconnect</strong> to check your MT4/MT5 credentials and resubmit.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">
                    Broker gateway server is temporarily unreachable.
                  </p>
                  <p>
                    Marketsyde is currently unable to communicate with HFM's API server. This typically occurs during scheduled server maintenance or temporary connection latency.
                  </p>
                  <p className="pt-1 text-slate-600 font-medium">
                    Your pending cashback and trade records are safe and will automatically synchronize once the connection is restored.
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusInfoModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              {statusInfoModal === 'rejected' ? (
                <button
                  onClick={() => {
                    setStatusInfoModal(null);
                    handleConnectBrokerAction('HFM');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5945F1] hover:bg-[#4734dc] text-white shadow-xs cursor-pointer transition-all"
                >
                  Reconnect Now
                </button>
              ) : (
                <button
                  onClick={() => {
                    setStatusInfoModal(null);
                    handleCardClick('HFM');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0b1c30] hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all"
                >
                  Go to 'Broker'
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
