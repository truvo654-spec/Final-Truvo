import React, { useState, useRef } from 'react';
import { UserProfile, Mission, ActivityLogItem, MarketSignal } from '../types';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Coins,
  Gem,
  Plus,
  Minus,
  Check,
  Zap,
  BarChart2,
  PieChart,
  Search,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';
import {
  AssetClassModal,
  StopLossModal,
  AlphaBriefModal,
  EconomicCalendarModal,
  SpreadsComparisonModal,
  AssetPointsDetailModal,
} from './MissionActionModals';
import { EarningRewardData } from './EarningRewardModal';

// ─────────────────────────────────────────────────────────────
// Custom 3D SVG Assets matching reference designs
// ─────────────────────────────────────────────────────────────

function RookieGhostBadge() {
  return (
    <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
      {/* Soft Purple Glow underneath */}
      <div className="absolute inset-0 rounded-2xl bg-[#6366f1]/25 blur-lg transform scale-90" />

      <svg viewBox="0 0 92 100" className="w-full h-full relative z-10 drop-shadow-md overflow-visible">
        <defs>
          <linearGradient id="rookieHexBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="rookieGhostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="35%" stopColor="#5338ec" />
            <stop offset="70%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#bef264" />
          </linearGradient>
          <filter id="rookieGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.32" />
          </filter>
        </defs>

        {/* 3D Hexagon Body */}
        <path
          d="M 46,6
             C 49,4 53,4 56,6
             L 82,20
             C 85,22 87,25 87,28
             L 87,70
             C 87,73 85,76 82,78
             L 56,92
             C 53,94 49,94 46,92
             L 20,78
             C 17,76 15,73 15,70
             L 15,28
             C 15,25 17,22 20,20
             Z"
          fill="#ffffff"
          stroke="url(#rookieHexBorder)"
          strokeWidth="3.2"
          filter="url(#rookieGlowFilter)"
        />

        {/* Subtle Inner Hexagon Accent */}
        <path
          d="M 46,12
             L 81,30
             L 81,68
             L 46,86
             L 21,68
             L 21,30
             Z"
          fill="none"
          stroke="#eef2ff"
          strokeWidth="1.5"
        />

        {/* Ghost Mascot Centered */}
        <g transform="translate(27, 26)">
          {/* Ghost Silhouette */}
          <path
            d="M 24,0
               C 10.7,0 0,10.7 0,24
               L 0,44
               C 0,44 4,40 8,44
               C 12,48 16,40 20,44
               C 24,48 28,40 32,44
               C 36,48 40,40 44,44
               C 48,48 48,44 48,44
               L 48,24
               C 48,10.7 37.3,0 24,0
               Z"
            fill="url(#rookieGhostGrad)"
          />
          {/* 2 White Circular Eyes */}
          <circle cx="15" cy="20" r="3.2" fill="#ffffff" />
          <circle cx="33" cy="20" r="3.2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

function SydeCoinsIcon() {
  return (
    <div className="relative w-20 h-16 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-sm">
        <defs>
          <linearGradient id="coinFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="35%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="coinLimeRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="50%" stopColor="#bef264" />
            <stop offset="100%" stopColor="#65a30d" />
          </linearGradient>
        </defs>

        {/* Bottom Stack Coin */}
        <g transform="translate(6, 16)">
          <path
            d="M 12,24 C 12,33 28,40 48,40 C 68,40 84,33 84,24 L 84,33 C 84,42 68,49 48,49 C 28,49 12,42 12,33 Z"
            fill="url(#coinLimeRimGrad)"
          />
          <path
            d="M 12,24 C 12,30 28,36 48,36 C 68,36 84,30 84,24 L 84,28 C 84,34 68,40 48,40 C 28,40 12,34 12,28 Z"
            fill="#312e81"
            opacity="0.35"
          />
          <ellipse cx="48" cy="24" rx="36" ry="12" fill="#4338ca" />
        </g>

        {/* Top Main Coin */}
        <g transform="translate(6, 4)">
          {/* Cylinder side with vibrant neon lime */}
          <path
            d="M 12,18 C 12,27 28,34 48,34 C 68,34 84,27 84,18 L 84,27 C 84,36 68,43 48,43 C 28,43 12,36 12,27 Z"
            fill="url(#coinLimeRimGrad)"
          />
          {/* Rim shadow */}
          <path
            d="M 12,18 C 12,24 28,30 48,30 C 68,30 84,24 84,18 L 84,22 C 84,28 68,34 48,34 C 28,34 12,28 12,22 Z"
            fill="#312e81"
            opacity="0.35"
          />
          {/* Top Face */}
          <ellipse cx="48" cy="18" rx="36" ry="12" fill="url(#coinFaceGrad)" stroke="#c7d2fe" strokeWidth="0.8" />
          {/* Inner ring highlight */}
          <ellipse cx="48" cy="18" rx="31" ry="9.5" fill="none" stroke="#a5b4fc" strokeWidth="0.8" opacity="0.6" />

          {/* MarketSyde 'M' Logo with lime dot */}
          <path
            d="M 33,21 C 34,16 38,13 41,17 C 44,21 48,14 52,16 C 56,18 59,21 61,22"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="60.5" cy="23.5" r="2" fill="#c6f831" />
        </g>

        {/* Front-right 3rd smaller coin */}
        <g transform="translate(56, 38)">
          <path
            d="M 2,8 C 2,12 11,16 22,16 C 33,16 42,12 42,8 L 42,12 C 42,16 33,20 22,20 C 11,20 2,16 2,12 Z"
            fill="url(#coinLimeRimGrad)"
          />
          <ellipse cx="22" cy="8" rx="20" ry="7.5" fill="url(#coinFaceGrad)" stroke="#c7d2fe" strokeWidth="0.6" />
        </g>
      </svg>
    </div>
  );
}

function MiniCoinsIcon() {
  return (
    <div className="w-5 h-4 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 36 28" className="w-full h-full">
        <path d="M 4,14 C 4,18 10,21 17,21 C 24,21 30,18 30,14 L 30,17 C 30,21 24,24 17,24 C 10,24 4,21 4,17 Z" fill="#84cc16" />
        <ellipse cx="17" cy="14" rx="13" ry="5.5" fill="#4338ca" />
        <path d="M 4,8 C 4,12 10,15 17,15 C 24,15 30,12 30,8 L 30,11 C 30,15 24,18 17,18 C 10,18 4,15 4,11 Z" fill="#bef264" />
        <ellipse cx="17" cy="8" rx="13" ry="5.5" fill="#6366f1" stroke="#c7d2fe" strokeWidth="0.5" />
        <circle cx="21" cy="9" r="1.2" fill="#c6f831" />
      </svg>
    </div>
  );
}

function FacetedGemIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 inline-block`} fill="none">
      <defs>
        <linearGradient id="gemCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="gemPavilionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="60%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>
      </defs>
      {/* Top Table */}
      <polygon points="7,4 17,4 21,9 17,9 7,9 3,9" fill="#c7d2fe" />
      <polygon points="7,4 17,4 14,9 10,9" fill="url(#gemCrownGrad)" />
      <polygon points="7,4 10,9 3,9" fill="#818cf8" />
      <polygon points="17,4 21,9 14,9" fill="#818cf8" />
      {/* Bottom Pavilion */}
      <polygon points="3,9 10,9 12,20" fill="url(#gemPavilionGrad)" />
      <polygon points="10,9 14,9 12,20" fill="#a3e635" />
      <polygon points="14,9 21,9 12,20" fill="url(#gemPavilionGrad)" />
    </svg>
  );
}

function MissionChartBadge() {
  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#6852ff] to-[#4330d4] p-2.5 flex items-center justify-center shrink-0 shadow-md relative overflow-hidden border border-white/20">
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/20 blur-xs pointer-events-none" />
      <svg viewBox="0 0 32 32" className="w-full h-full fill-none overflow-visible">
        {/* Candlestick columns in white */}
        <line x1="8" y1="18" x2="8" y2="24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <rect x="6.5" y="19" width="3" height="4" rx="0.75" fill="#ffffff" opacity="0.8" />

        <line x1="16" y1="12" x2="16" y2="24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <rect x="14.5" y="14" width="3" height="7" rx="0.75" fill="#ffffff" />

        <line x1="24" y1="8" x2="24" y2="24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        <rect x="22.5" y="10" width="3" height="10" rx="0.75" fill="#ffffff" />

        {/* Upward Volt-Lime Zigzag Trend Line with Arrowhead */}
        <polyline
          points="6,21 13,18 19,13 26,7"
          stroke="#c6f831"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="21,7 26,7 26,12"
          stroke="#c6f831"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function UnlockConversionIcon() {
  return (
    <div className="w-12 h-12 shrink-0 relative flex items-center justify-center">
      <svg viewBox="0 0 48 48" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="unlockGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#FE01B1" />
          </linearGradient>
        </defs>
        {/* Soft circle background */}
        <circle cx="24" cy="24" r="21" fill="#f5f3ff" />
        {/* Curved looping exchange arrow */}
        <path
          d="M 12,18 C 17,9 31,9 36,16"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="2.5 2.5"
        />
        <polyline points="33,16 36,16 37,13" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* 3D Faceted Gem (Right) */}
        <g transform="translate(19, 13)">
          <polygon points="4,2 14,2 18,7 14,7 4,7 0,7" fill="#c7d2fe" />
          <polygon points="4,2 14,2 12,7 6,7" fill="url(#unlockGemGrad)" />
          <polygon points="0,7 6,7 9,18" fill="#818cf8" />
          <polygon points="6,7 12,7 9,18" fill="#6366f1" />
          <polygon points="12,7 18,7 9,18" fill="#FE01B1" />
        </g>

        {/* 3D Coin (Left/Bottom) */}
        <g transform="translate(6, 19)">
          <ellipse cx="10" cy="11" rx="9" ry="5.5" fill="#bef264" />
          <path d="M 1,11 C 1,14 5,17 10,17 C 15,17 19,14 19,11 L 19,14 C 19,17 15,20 10,20 C 5,20 1,17 1,14 Z" fill="#84cc16" />
          <ellipse cx="10" cy="11" rx="7.5" ry="4.2" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="0.5" />
          <circle cx="10" cy="11" r="1.5" fill="#c6f831" />
        </g>

        {/* Sparkles */}
        <path d="M 37,8 L 38,10 L 40,11 L 38,12 L 37,14 L 36,12 L 34,11 L 36,10 Z" fill="#c6f831" />
      </svg>
    </div>
  );
}

function DualFlag() {
  return (
    <div className="flex items-center -space-x-1.5 shrink-0">
      {/* EU Flag */}
      <span className="w-5 h-5 rounded-full overflow-hidden inline-flex items-center justify-center border border-white shadow-2xs">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <rect width="24" height="24" fill="#003399" />
          <circle cx="12" cy="5" r="0.9" fill="#FFCC00" />
          <circle cx="15.5" cy="6" r="0.9" fill="#FFCC00" />
          <circle cx="18" cy="8.5" r="0.9" fill="#FFCC00" />
          <circle cx="19" cy="12" r="0.9" fill="#FFCC00" />
          <circle cx="18" cy="15.5" r="0.9" fill="#FFCC00" />
          <circle cx="15.5" cy="18" r="0.9" fill="#FFCC00" />
          <circle cx="12" cy="19" r="0.9" fill="#FFCC00" />
          <circle cx="8.5" cy="18" r="0.9" fill="#FFCC00" />
          <circle cx="6" cy="15.5" r="0.9" fill="#FFCC00" />
          <circle cx="5" cy="12" r="0.9" fill="#FFCC00" />
          <circle cx="6" cy="8.5" r="0.9" fill="#FFCC00" />
          <circle cx="8.5" cy="6" r="0.9" fill="#FFCC00" />
        </svg>
      </span>
      {/* US Flag */}
      <span className="w-5 h-5 rounded-full overflow-hidden inline-flex items-center justify-center border border-white shadow-2xs">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <rect width="24" height="24" fill="#B22234" />
          <path d="M0,3.7 h24 M0,7.4 h24 M0,11.1 h24 M0,14.8 h24 M0,18.5 h24 M0,22.2 h24" stroke="#ffffff" strokeWidth="1.8" />
          <rect width="11" height="13" fill="#3C3B6E" />
        </svg>
      </span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function GoldBullionIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#d97706] to-[#f59e0b] flex items-center justify-center text-white shadow-2xs shrink-0">
      <Coins className="w-3.5 h-3.5 text-amber-100" />
    </div>
  );
}

function Sp500Badge() {
  return (
    <div className="w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center font-bold text-[8.5px] shadow-2xs shrink-0">
      500
    </div>
  );
}

interface PointsAndCreditsViewProps {
  user: UserProfile;
  missions: Mission[];
  signals: MarketSignal[];
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onUpdateMissions: (updatedMissions: Mission[]) => void;
  onAddActivityLog: (log: ActivityLogItem) => void;
  onOpenViewPlan: () => void;
  onOpenLevelPointsGuide?: () => void;
  onOpenCreditEarningGuide?: () => void;
  onOpenActivityLog: () => void;
  onNavigateToSignals: () => void;
  onSelectSignal?: (signal: MarketSignal) => void;
  onOpenConnectModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onTriggerEarningModal?: (data: EarningRewardData) => void;
}

export const PointsAndCreditsView: React.FC<PointsAndCreditsViewProps> = ({
  user,
  missions,
  signals,
  onUpdateUser,
  onUpdateMissions,
  onAddActivityLog,
  onOpenViewPlan,
  onOpenLevelPointsGuide,
  onOpenCreditEarningGuide,
  onOpenActivityLog,
  onNavigateToSignals,
  onSelectSignal,
  onOpenConnectModal,
  searchQuery,
  onSearchChange,
  onTriggerEarningModal,
}) => {
  // Tabs for mission filtering
  const [missionFilter, setMissionFilter] = useState<'all' | 'active' | 'available'>('all');

  // Accordion expanded state for missions
  const [expandedMissions, setExpandedMissions] = useState<Record<string, boolean>>({
    'portfolio-power-up': true, // Expanded by default as in reference
    'market-watch': false,
    '7-day-explorer': false,
  });

  // Converter State
  const [converterCredits, setConverterCredits] = useState<number>(500);
  const [conversionSuccess, setConversionSuccess] = useState<string | null>(null);
  const [converterHighlight, setConverterHighlight] = useState<boolean>(false);
  const [showActiveConverter, setShowActiveConverter] = useState<boolean>(false);
  const converterRef = useRef<HTMLDivElement>(null);

  // Modals state for interactive mission tasks
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [isStopLossModalOpen, setIsStopLossModalOpen] = useState<boolean>(false);
  const [isAlphaBriefModalOpen, setIsAlphaBriefModalOpen] = useState<boolean>(false);
  const [isEconomicCalendarModalOpen, setIsEconomicCalendarModalOpen] = useState<boolean>(false);
  const [isSpreadsModalOpen, setIsSpreadsModalOpen] = useState<boolean>(false);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState<boolean>(false);
  const [isTradeSimModalOpen, setIsTradeSimModalOpen] = useState<boolean>(false);
  const [isFullDirectoryOpen, setIsFullDirectoryOpen] = useState<boolean>(false);

  // Selected asset detail modal
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<{
    symbol: string;
    name: string;
    icon: string;
    points: number;
    cashback: string;
    spread: string;
    volatility: string;
  } | null>(null);

  // Conversion rate: 5 Syde Credits = 1 Point (500 Credits = 100 Points)
  const convertedPoints = Math.floor((converterCredits || 0) / 5);

  const toggleMission = (id: string) => {
    setExpandedMissions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMaxCredits = () => {
    setConverterCredits(user.sydeCredits);
  };

  const handleSetPresetCredits = (amt: number) => {
    setConverterCredits(amt);
  };

  // Convert Credits to Points with state update, rank check, and activity logging
  const handleConvert = () => {
    if (converterCredits <= 0) return;

    let creditsToDeduct = converterCredits;

    if (converterCredits > user.sydeCredits) {
      creditsToDeduct = user.sydeCredits;
    }

    if (creditsToDeduct <= 0) {
      setConversionSuccess('⚠️ You currently have 0 Syde Credits. Complete missions below or claim bonus credits to convert!');
      setTimeout(() => setConversionSuccess(null), 4000);
      return;
    }

    const pointsToAdd = Math.floor(creditsToDeduct / 5);
    const newCredits = user.sydeCredits - creditsToDeduct;
    const newPoints = user.currentPoints + pointsToAdd;

    // Check if new points level up user from Rookie to Silver Voyager (threshold: 150)
    let newRank = user.rankTitle;
    let newBoost = user.boostPercentage;
    let levelUpMsg = '';

    if (newPoints >= 150 && user.currentLevel === 1) {
      newRank = 'Silver Voyager';
      newBoost = 15;
      levelUpMsg = ' 🌟 Congratulations! You have ranked up to Silver Voyager (+15% Multiplier unlocked)!';
    }

    onUpdateUser({
      sydeCredits: newCredits,
      currentPoints: newPoints,
      rankTitle: newRank,
      boostPercentage: newBoost,
      currentLevel: newPoints >= 150 ? 2 : 1,
    });

    onAddActivityLog({
      id: `conv-${Date.now()}`,
      title: `Converted ${creditsToDeduct} Syde Credits to Points`,
      description: `Exchanged ecosystem credits at 5:1 ratio for +${pointsToAdd} Tier Points.${levelUpMsg}`,
      timestamp: 'Just now',
      type: 'both',
      pointsChange: pointsToAdd,
      creditsChange: -creditsToDeduct,
      category: 'Conversion',
    });

    setConversionSuccess(
      `🎉 Converted ${creditsToDeduct} Credits to +${pointsToAdd} Points!${levelUpMsg}`
    );
    setTimeout(() => setConversionSuccess(null), 5000);
  };

  // Claim Instant Demo Bonus Credits (ensures user always has credits to play with)
  const handleClaimBonusCredits = () => {
    const bonus = 5;
    onUpdateUser({
      sydeCredits: user.sydeCredits + bonus,
    });
    onAddActivityLog({
      id: `bonus-${Date.now()}`,
      title: 'Daily Login Reward',
      description: 'You earned 5 credits for login in today.',
      timestamp: 'Just now',
      type: 'credits',
      pointsChange: 0,
      creditsChange: bonus,
      category: 'Reward',
    });
    if (onTriggerEarningModal) {
      onTriggerEarningModal({
        type: 'quest',
        credits: 5,
        questName: 'login in today',
        subtitle: 'Way to go!',
      });
    } else {
      setConversionSuccess('🎉 +5 Credits added for daily login streak!');
      setTimeout(() => setConversionSuccess(null), 4000);
    }
  };

  // Generic Task Completion Handler
  const markTaskCompleted = (missionId: string, taskId: string, rewardPts: number, rewardCrd: number, customTitle?: string) => {
    const updated = missions.map((m) => {
      if (m.id !== missionId) return m;
      const updatedTasks = m.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, completed: true };
      });
      return { ...m, tasks: updatedTasks };
    });

    onUpdateMissions(updated);

    const newPoints = user.currentPoints + rewardPts;
    const newCredits = user.sydeCredits + rewardCrd;

    onUpdateUser({
      currentPoints: newPoints,
      sydeCredits: newCredits,
    });

    onAddActivityLog({
      id: `task-${Date.now()}`,
      title: customTitle || 'Completed Mission Task',
      description: `Earned +${rewardPts} Points and +${rewardCrd} Credits for mission advancement.`,
      timestamp: 'Just now',
      type: 'both',
      pointsChange: rewardPts,
      creditsChange: rewardCrd,
      category: 'Mission',
    });

    if (onTriggerEarningModal) {
      onTriggerEarningModal({
        type: 'mission',
        credits: rewardCrd || 5,
        points: rewardPts || 10,
        title: 'Mission Complete!',
      });
    } else {
      setConversionSuccess(`✅ Completed task! Awarded +${rewardPts} Points & +${rewardCrd} Credits.`);
      setTimeout(() => setConversionSuccess(null), 4000);
    }
  };

  // Focus converter helper
  const focusConverter = () => {
    converterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setConverterHighlight(true);
    setTimeout(() => setConverterHighlight(false), 2000);
  };

  // Find signal helper
  const handleOpenSignalByTicker = (tickerQuery: string) => {
    const found = signals.find((s) => s.ticker.toLowerCase().includes(tickerQuery.toLowerCase()));
    if (found && onSelectSignal) {
      onSelectSignal(found);
    } else {
      onNavigateToSignals();
    }
  };

  // Filter missions
  const filteredMissions = missions.filter((m) => {
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSubtitle = m.subtitle.toLowerCase().includes(q);
      const matchTasks = m.tasks.some((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchTasks) return false;
    }

    if (missionFilter === 'all') return true;
    if (missionFilter === 'active') return m.status === 'active';
    if (missionFilter === 'available') return m.status === 'available';
    return true;
  });

  return (
    <div className="w-full space-y-8 pb-12">
      {/* ─── Hero Heading ─── */}
      <div className="text-center max-w-2xl mx-auto pt-2 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight">
          <span className="text-[#5945F1]">Mission, Points </span>
          <span className="text-[#FE01B1]">& Credits</span>
          <span className="text-[#c6f831] font-extrabold inline-block">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Everything you’ve earned so far, plus what you’re currently missing out on.
        </p>

        {/* Interactive Earning Modals Trigger Row */}
        {onTriggerEarningModal && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() =>
                onTriggerEarningModal({
                  type: 'quest',
                  credits: 5,
                  questName: 'login in today',
                  subtitle: 'Way to go!',
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-pink-50/70 border border-[#FD02B0]/40 text-[#FD02B0] text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>✨ Quest Complete (+5 Credits)</span>
            </button>
            <button
              onClick={() =>
                onTriggerEarningModal({
                  type: 'mission',
                  credits: 5,
                  title: 'Mission Complete!',
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-indigo-50/70 border border-[#5945F1]/40 text-[#5945F1] text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>👑 Mission Complete (+5 Credits)</span>
            </button>
            <button
              onClick={() =>
                onTriggerEarningModal({
                  type: 'trade',
                  points: 20,
                  credits: 10,
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>📈 Completing a Trade (+20 Pts, +10 Cr)</span>
            </button>
          </div>
        )}

        {/* Search Query Active Tag */}
        {searchQuery && searchQuery.trim().length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-[#5338ec]">
            <Search className="w-3.5 h-3.5" />
            <span>Filtering for: <strong>"{searchQuery}"</strong></span>
            <button
              onClick={() => onSearchChange?.('')}
              className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 text-[#5338ec] flex items-center justify-center transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Alert / Success Toast */}
      {conversionSuccess && (
        <div className="max-w-2xl mx-auto px-4 py-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold text-center shadow-xs animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{conversionSuccess}</span>
        </div>
      )}

      {/* ─── Main 2-Column Layout (Left: Top Cards + Missions | Right: Sidebar Widgets) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN: TOP CARDS & MISSIONS (8 COLS) ═══ */}
        <div className="lg:col-span-8 space-y-6">
          {/* ── Top 3 Cards Row (Your Tier | Syde Credits | Unlock Conversion) ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
              {/* Card 1: Rookie Card */}
              <div
                onClick={() => {
                  if (onOpenLevelPointsGuide) {
                    onOpenLevelPointsGuide();
                  } else {
                    onOpenViewPlan();
                  }
                }}
                className="rounded-2xl border border-indigo-100/90 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group hover:border-indigo-200"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5338ec]">Your Tier</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenLevelPointsGuide) {
                        onOpenLevelPointsGuide();
                      } else {
                        onOpenViewPlan();
                      }
                    }}
                    className="text-xs text-[#5338ec] font-medium px-3 py-1 rounded-xl border border-indigo-200/90 hover:bg-indigo-50 flex items-center gap-1 transition-colors cursor-pointer group-hover:border-[#5338ec]"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Main Content: 3D Ghost Hexagon Badge + Info */}
                <div className="flex items-center gap-4 py-2">
                  <RookieGhostBadge />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl sm:text-[28px] font-bold font-display text-[#5338ec] tracking-tight leading-none">
                      {user.rankTitle || 'Rookie'}
                    </h3>
                    {/* Thin Purple-to-Pink Progress Bar */}
                    <div className="w-full max-w-[190px] h-1.5 bg-[#eceffd] rounded-full overflow-hidden my-2.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(10, Math.round((user.currentPoints / user.maxPoints) * 100)))}%`,
                        }}
                      />
                    </div>
                    {/* Points Line: Faceted Gem + 50/150 Total Points */}
                    <div className="flex items-center gap-1 text-sm font-medium flex-wrap">
                      <FacetedGemIcon className="w-4 h-4" />
                      <span className="font-extrabold text-[#5338ec] text-base">{user.currentPoints}</span>
                      <span className="font-normal text-[#818cf8]">/{user.maxPoints}</span>
                      <span className="font-medium text-[#6366f1] ml-1">Total Points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Syde Credits Card */}
              <div
                onClick={() => {
                  if (onOpenCreditEarningGuide) {
                    onOpenCreditEarningGuide();
                  } else {
                    onOpenActivityLog();
                  }
                }}
                className="rounded-2xl border border-indigo-100/90 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group hover:border-indigo-200"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5338ec]">Syde Credits</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenCreditEarningGuide) {
                        onOpenCreditEarningGuide();
                      } else {
                        onOpenActivityLog();
                      }
                    }}
                    className="text-xs text-[#5338ec] font-medium px-3 py-1 rounded-xl border border-indigo-200/90 hover:bg-indigo-50 flex items-center gap-1 transition-colors cursor-pointer group-hover:border-[#5338ec]"
                  >
                    <span>How to Earn</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Main Content: 3D Stack of Coins + Balance Info */}
                <div className="flex items-center gap-4 py-2">
                  <SydeCoinsIcon />

                  <div className="flex-1 min-w-0">
                    <div className="text-2xl sm:text-[28px] font-bold font-display text-[#5338ec] tracking-tight leading-none">
                      {user.sydeCredits}
                    </div>
                    <div className="text-xs font-semibold text-[#16a34a] mt-1">
                      + {user.lastWeekCredits || 75} Last Week
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                      <span className="text-sm font-normal text-[#6366f1]">Total Balance</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaimBonusCredits();
                        }}
                        className="px-2.5 py-0.5 rounded-lg bg-[#FD02B0]/10 hover:bg-[#FD02B0]/20 text-[#FD02B0] text-[11px] font-bold border border-[#FD02B0]/25 transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        Claim Daily +5 Cr
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Unlock Conversion Banner / Active Converter */}
              {!showActiveConverter ? (
                <div
                  ref={converterRef}
                  className={`rounded-2xl border border-indigo-100/90 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all ${
                    converterHighlight ? 'ring-2 ring-[#5338ec] bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 py-1">
                    <UnlockConversionIcon />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-800 leading-snug font-medium">
                        Earn more <strong className="text-[#5945F1] font-bold">credits</strong> or{' '}
                        <strong className="text-[#FE01B1] font-bold">points</strong>
                        <br />to unlock conversion.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (onOpenCreditEarningGuide) onOpenCreditEarningGuide();
                        else setShowActiveConverter(true);
                      }}
                      className="text-xs text-[#5945F1] font-semibold px-4 py-1.5 rounded-xl border border-indigo-200/90 hover:bg-indigo-50 inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>Learn More</span>
                    </button>
                    <button
                      onClick={() => setShowActiveConverter(true)}
                      className="text-[11px] text-slate-400 hover:text-[#5945F1] font-medium underline cursor-pointer"
                      title="Open interactive converter"
                    >
                      Convert
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  ref={converterRef}
                  className="rounded-2xl border border-indigo-200 bg-white p-3 sm:p-4 flex flex-col justify-between space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#5338ec]">Converter</span>
                    <button
                      onClick={() => setShowActiveConverter(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-normal text-slate-700">Credits</span>
                      <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded-lg px-2 py-1 w-32">
                        <MiniCoinsIcon />
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          step="50"
                          value={converterCredits}
                          onChange={(e) => setConverterCredits(Number(e.target.value))}
                          className="w-full bg-transparent font-normal text-slate-700 focus:outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleMaxCredits}
                          className="text-[10px] text-[#5338ec] font-bold"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#5338ec]">
                        <span>{convertedPoints}</span>
                        <FacetedGemIcon className="w-3.5 h-3.5" />
                      </div>
                      <button
                        onClick={handleConvert}
                        className="px-3.5 py-1 rounded-lg bg-[#5338ec] hover:bg-[#432ec4] text-white font-medium text-xs shadow-2xs"
                      >
                        Convert
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mission Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 pb-3 text-sm">
            <button
              onClick={() => setMissionFilter('all')}
              className={`flex items-center gap-2 font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                missionFilter === 'all'
                  ? 'border border-indigo-200/90 bg-white text-[#5945F1] shadow-2xs'
                  : 'text-slate-800 hover:text-slate-950'
              }`}
            >
              <span>All Missions</span>
              <span className="w-5 h-5 rounded-full bg-[#5945F1] text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
            </button>

            <button
              onClick={() => setMissionFilter('active')}
              className={`flex items-center gap-1.5 font-bold transition-all px-2 py-1 rounded-lg cursor-pointer ${
                missionFilter === 'active'
                  ? 'text-[#5945F1]'
                  : 'text-slate-800 hover:text-slate-950'
              }`}
            >
              <span>Active</span>
              <span className="text-slate-800 font-bold">2</span>
            </button>

            <button
              onClick={() => setMissionFilter('available')}
              className={`flex items-center gap-1.5 font-bold transition-all px-2 py-1 rounded-lg cursor-pointer ${
                missionFilter === 'available'
                  ? 'text-[#5945F1]'
                  : 'text-slate-800 hover:text-slate-950'
              }`}
            >
              <span>New</span>
              <span className="text-slate-800 font-bold">1</span>
            </button>
          </div>

          {/* Missions List */}
          <div className="space-y-4">
            {filteredMissions.map((mission) => {
              const isExpanded = !!expandedMissions[mission.id];
              const completedCount = mission.tasks.filter((t) => t.completed).length;
              const totalCount = mission.tasks.length;

              if (mission.id === 'portfolio-power-up') {
                return (
                  /* Card 1: Portfolio Power-Up (Deep Royal Purple Canvas, White nested subtasks) */
                  <div
                    key={mission.id}
                    className="rounded-[26px] bg-[#5338ec] text-white p-6 sm:p-7 relative overflow-hidden shadow-sm transition-all"
                  >
                    {/* Subtle right-side radial glow */}
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-white/12 via-white/5 to-transparent rounded-l-full pointer-events-none" />

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-start gap-4">
                        {/* 3D Candlestick Chart squircle with volt-lime trendline */}
                        <MissionChartBadge />

                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                            Portfolio Power-Up
                          </h3>
                          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-lg">
                            Strengthen your portfolio by diversifying across asset classes.
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs text-white text-xs font-medium border border-white/10 flex items-center gap-1.5">
                              <span>⏳</span>
                              <span>Expires in 5 Days</span>
                            </span>
                            <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs text-white text-xs font-medium border border-white/10 flex items-center gap-1.5">
                              <span>💎</span>
                              <span>+15 Points</span>
                            </span>
                            <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs text-white text-xs font-medium border border-white/10 flex items-center gap-1.5">
                              <span>🪙</span>
                              <span>+25 Credits</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Completed Pill & Toggle */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        <div className="px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1">
                          <span className="text-[#5945F1]">1/3</span>
                          <span className="text-slate-500 font-medium">Completed</span>
                        </div>
                        <button
                          onClick={() => toggleMission('portfolio-power-up')}
                          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-lg shadow-sm transition-all cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <Minus className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Subtasks (White Box) */}
                    {isExpanded && (
                      <div className="bg-white rounded-2xl p-5 sm:p-6 mt-5 space-y-4 shadow-sm text-slate-800 relative z-10 animate-in fade-in">
                        {/* Task 1 */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="w-4 h-4 rounded-full bg-[#eef2f6] border border-slate-300 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                Adjust allocations so no single stock exceeds 30%.
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Buy into a sector you haven't invested in yet.
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsAssetModalOpen(true)}
                            className="px-4 py-1.5 rounded-xl border border-indigo-200 hover:border-[#5945F1] text-[#5945F1] hover:bg-indigo-50/60 font-semibold text-xs transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                          >
                            Add Asset
                          </button>
                        </div>

                        {/* Task 2 (Completed) */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <div className="flex items-start gap-3">
                            <span className="w-4 h-4 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-[#16a34a]">
                                Rebalance Your Holdings
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Adjust allocations so no single stock exceeds 30%.
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Task 3 */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <div className="flex items-start gap-3">
                            <span className="w-4 h-4 rounded-full bg-[#eef2f6] border border-slate-300 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                Set a Stop-Loss Order
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Protect a position by placing a stop-loss trigger.
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsStopLossModalOpen(true)}
                            className="px-4 py-1.5 rounded-xl border border-indigo-200 hover:border-[#5945F1] text-[#5945F1] hover:bg-indigo-50/60 font-semibold text-xs transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                          >
                            Set Position
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (mission.id === 'market-watch') {
                return (
                  /* Card 2: Market Watch (Hot Pink Arch on Right) */
                  <div
                    key={mission.id}
                    className="rounded-[26px] bg-white border border-slate-100 shadow-2xs relative overflow-hidden p-6 sm:p-7 flex flex-col justify-between transition-all"
                  >
                    {/* Massive hot-pink circular crescent dome on the right */}
                    <div
                      className="absolute -right-4 -bottom-16 w-80 h-72 rounded-t-full pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, #FF007A 0%, #FE01B1 100%)',
                      }}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      {/* Left content */}
                      <div className="flex items-start gap-4">
                        <MissionChartBadge />

                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
                            <span className="text-[#5945F1]">Market </span>
                            <span className="text-[#FE01B1]">Watch</span>
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                            Keep an eye on today's market before you trade.
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full border border-pink-200 bg-pink-50/50 text-[#FE01B1] text-xs font-medium flex items-center gap-1.5">
                              <span>⏳</span>
                              <span>Daily</span>
                            </span>
                            <span className="px-3 py-1 rounded-full border border-pink-200 bg-pink-50/50 text-[#FE01B1] text-xs font-medium flex items-center gap-1.5">
                              <span>💎</span>
                              <span>+15 Points</span>
                            </span>
                            <span className="px-3 py-1 rounded-full border border-pink-200 bg-pink-50/50 text-[#FE01B1] text-xs font-medium flex items-center gap-1.5">
                              <span>🪙</span>
                              <span>+25 Credits</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Progress & Plus button */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        <div className="px-4 py-2 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1">
                          <span>0/3</span>
                          <span className="text-slate-500 font-medium">Completed</span>
                        </div>
                        <button
                          onClick={() => toggleMission('market-watch')}
                          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-[#FE01B1] flex items-center justify-center font-bold text-lg shadow-sm transition-all cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <Minus className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </div>
                    </div>

                    {/* Subtasks when expanded */}
                    {isExpanded && (
                      <div className="bg-white rounded-2xl p-5 sm:p-6 mt-5 space-y-4 shadow-sm text-slate-800 relative z-10 border border-slate-100 animate-in fade-in">
                        {mission.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              {task.completed ? (
                                <span className="w-4 h-4 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-[#eef2f6] border border-slate-300 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                  {task.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {task.description}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (task.id === 'task-morning-brief') {
                                  setIsAlphaBriefModalOpen(true);
                                } else if (task.id === 'task-calendar-event') {
                                  setIsEconomicCalendarModalOpen(true);
                                } else {
                                  markTaskCompleted('market-watch', task.id, 8, 15, task.title);
                                }
                              }}
                              className="px-4 py-1.5 rounded-xl border border-pink-200 hover:border-[#FE01B1] text-[#FE01B1] hover:bg-pink-50/60 font-semibold text-xs transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                            >
                              {task.completed ? 'Claimed' : task.actionLabel || 'Check'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (mission.id === '7-day-explorer') {
                return (
                  /* Card 3: 7-Day Explorer (Volt Lime Arch on Right) */
                  <div
                    key={mission.id}
                    className="rounded-[26px] bg-white border border-slate-100 shadow-2xs relative overflow-hidden p-6 sm:p-7 flex flex-col justify-between transition-all"
                  >
                    {/* Massive volt-lime circular crescent dome on the right */}
                    <div
                      className="absolute -right-4 -bottom-16 w-80 h-72 rounded-t-full pointer-events-none"
                      style={{
                        backgroundColor: '#c6f831',
                      }}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      {/* Left content */}
                      <div className="flex items-start gap-4">
                        <MissionChartBadge />

                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-[#FE01B1]">
                            7-Day Explorer
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                            Maintain continuous streak and explore advanced analytics.
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full border border-lime-300 bg-lime-50/60 text-slate-800 text-xs font-medium flex items-center gap-1.5">
                              <span>⏳</span>
                              <span>Expires in 7 Days</span>
                            </span>
                            <span className="px-3 py-1 rounded-full border border-lime-300 bg-lime-50/60 text-slate-800 text-xs font-medium flex items-center gap-1.5">
                              <span>🪙</span>
                              <span>+300 Credits</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Progress & Plus button */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        <div className="px-4 py-2 rounded-xl bg-white/95 backdrop-blur-xs text-slate-800 font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1">
                          <span>3/7</span>
                          <span className="text-slate-600 font-medium">Completed</span>
                        </div>
                        <button
                          onClick={() => toggleMission('7-day-explorer')}
                          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-[#65a30d] flex items-center justify-center font-bold text-lg shadow-sm transition-all cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <Minus className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </div>
                    </div>

                    {/* Subtasks when expanded */}
                    {isExpanded && (
                      <div className="bg-white rounded-2xl p-5 sm:p-6 mt-5 space-y-4 shadow-sm text-slate-800 relative z-10 border border-slate-100 animate-in fade-in">
                        {mission.tasks.map((task, idx) => (
                          <div key={task.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              {task.completed ? (
                                <span className="w-4 h-4 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-slate-300 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                              )}
                              <div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                  {task.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {task.description}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (task.id === 'streak-day-1' || task.id === 'exp-day-1') {
                                  setIsSpreadsModalOpen(true);
                                } else if (task.id === 'streak-day-2' || task.id === 'exp-day-2') {
                                  if (onOpenConnectModal) onOpenConnectModal();
                                  else onOpenViewPlan();
                                } else if (task.id === 'streak-day-3' || task.id === 'exp-day-3') {
                                  onNavigateToSignals();
                                } else if (task.id === 'streak-day-4' || task.id === 'exp-day-4') {
                                  setIsTradeSimModalOpen(true);
                                } else if (task.id === 'streak-day-5' || task.id === 'exp-day-5') {
                                  focusConverter();
                                } else {
                                  markTaskCompleted('7-day-explorer', task.id, 0, 45, task.title);
                                }
                              }}
                              className={`px-4 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
                                task.completed
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold'
                                  : 'border-lime-300 bg-[#c6f831]/20 hover:bg-[#c6f831]/40 text-[#0b1c30]'
                              }`}
                            >
                              {task.completed ? 'Claimed' : task.actionLabel || 'Check-in'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN: SIDEBAR WIDGETS (4 COLS) (Sticky during scroll) ═══ */}
        <div className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar">
          {/* ── Widget 1: Track every point and credit earned (Glowing Gradient Border) ── */}
          <div
            onClick={onOpenActivityLog}
            className="p-[1.5px] rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#FE01B1] shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="bg-white rounded-[15px] p-4 flex items-center justify-between gap-3.5">
              <div className="flex items-center gap-3">
                {/* 3-Level Battery / Meter Squircle */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#3b2ecc] to-[#5945F1] flex items-center justify-center shrink-0 p-2.5 shadow-xs group-hover:scale-105 transition-transform">
                  <div className="w-full flex flex-col justify-between h-full py-0.5">
                    <div className="h-1.5 w-full bg-[#fde047] rounded-full" />
                    <div className="h-1.5 w-full bg-[#a3e635] rounded-full" />
                    <div className="h-1.5 w-full bg-[#22c55e] rounded-full" />
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-slate-900 leading-snug">
                    Track every <strong className="text-[#5945F1] font-bold">point</strong> and{' '}
                    <strong className="text-[#FE01B1] font-bold">credit</strong> earned.
                  </p>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1 mt-1 group-hover:text-[#5945F1] transition-colors">
                    <span>View Activity Log</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Widget 2: Tops Earning Points. (Hot-pink border, clean rows) ── */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border border-[#FE01B1] shadow-2xs space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-[#5945F1] tracking-tight">
                Tops Earning Points<span className="text-[#FE01B1]">.</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Get rewarded for trading your usual assets.{' '}
                <strong className="text-slate-800 font-semibold">No extra effort required.</strong>
              </p>
            </div>

            <div className="space-y-1 pt-0.5">
              {/* EUR/USD */}
              <div
                onClick={() =>
                  setSelectedAssetDetail({
                    symbol: 'EUR/USD',
                    name: 'Euro / US Dollar',
                    icon: '🇪🇺🇺🇸',
                    points: 50,
                    cashback: '$8.00/lot',
                    spread: '0.0 pips',
                    volatility: 'Moderate (Liquid)',
                  })
                }
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <DualFlag />
                  <span className="text-sm font-bold text-slate-800 group-hover:text-[#5945F1] transition-colors">
                    EUR/USD
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#5945F1]">
                  <FacetedGemIcon className="w-4 h-4" />
                  <span>50</span>
                </div>
              </div>

              {/* GOOGL */}
              <div
                onClick={() =>
                  setSelectedAssetDetail({
                    symbol: 'GOOGL',
                    name: 'Alphabet Inc.',
                    icon: 'G',
                    points: 35,
                    cashback: '$3.80/trade',
                    spread: '0.04 pips',
                    volatility: 'Growth Tech',
                  })
                }
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <GoogleIcon />
                  <span className="text-sm font-bold text-slate-800 group-hover:text-[#5945F1] transition-colors">
                    GOOGL
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#5945F1]">
                  <FacetedGemIcon className="w-4 h-4" />
                  <span>35</span>
                </div>
              </div>

              {/* XAU/USD */}
              <div
                onClick={() =>
                  setSelectedAssetDetail({
                    symbol: 'XAU/USD',
                    name: 'Gold / US Dollar',
                    icon: '🪙',
                    points: 20,
                    cashback: '$5.50/lot',
                    spread: '0.12 pips',
                    volatility: 'High Momentum',
                  })
                }
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <GoldBullionIcon />
                  <span className="text-sm font-bold text-slate-800 group-hover:text-[#5945F1] transition-colors">
                    XAU/USD
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#5945F1]">
                  <FacetedGemIcon className="w-4 h-4" />
                  <span>20</span>
                </div>
              </div>

              {/* S&P 500 */}
              <div
                onClick={() =>
                  setSelectedAssetDetail({
                    symbol: 'S&P 500',
                    name: 'US Indices ETF',
                    icon: '500',
                    points: 20,
                    cashback: '$4.20/contract',
                    spread: '0.40 pts',
                    volatility: 'Macro Benchmark',
                  })
                }
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Sp500Badge />
                  <span className="text-sm font-bold text-slate-800 group-hover:text-[#5945F1] transition-colors">
                    S&P 500
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#5945F1]">
                  <FacetedGemIcon className="w-4 h-4" />
                  <span>20</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setIsFullDirectoryOpen(true)}
                className="w-auto px-7 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#432ec4] text-white text-xs font-semibold shadow-2xs inline-flex items-center gap-2 mx-auto transition-all cursor-pointer"
              >
                <span>View More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Widget 3: Most Recent Signals (2x2 Grid, light gray container) ── */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-[#f4f5f8] border border-slate-100/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 font-bold text-sm sm:text-base text-slate-900">
                  <span>Most Recent</span>
                  <span className="text-[#5945F1]">
                    Signals<span className="text-[#FE01B1]">.</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  View most recent signals for your trading
                </p>
              </div>
              <button
                onClick={onNavigateToSignals}
                className="text-xs text-slate-700 hover:text-[#5945F1] font-semibold flex items-center gap-0.5 shrink-0 cursor-pointer"
              >
                <span>More</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2x2 Mini Signals Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* EUR/USD */}
              <div
                onClick={() => handleOpenSignalByTicker('EUR/USD')}
                className="p-3 rounded-xl bg-white border border-slate-100/80 hover:border-indigo-200 flex flex-col justify-between cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-1.5">
                  <DualFlag />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#5945F1]">
                    EUR/USD
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <svg className="w-12 h-4 text-emerald-500" viewBox="0 0 50 15">
                    <path d="M0,12 L10,8 L20,11 L30,4 L40,7 L50,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-bold text-emerald-600 font-mono">+0.33%</span>
                </div>
              </div>

              {/* GOOGL */}
              <div
                onClick={() => handleOpenSignalByTicker('GOOGL')}
                className="p-3 rounded-xl bg-white border border-slate-100/80 hover:border-indigo-200 flex flex-col justify-between cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-1.5">
                  <GoogleIcon />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#5945F1]">
                    GOOGL
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <svg className="w-12 h-4 text-indigo-500" viewBox="0 0 50 15">
                    <path d="M0,4 L12,9 L24,5 L36,12 L50,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-bold text-indigo-600 font-mono">-0.11%</span>
                </div>
              </div>

              {/* BTC/USD */}
              <div
                onClick={() => handleOpenSignalByTicker('BTC/USD')}
                className="p-3 rounded-xl bg-white border border-slate-100/80 hover:border-indigo-200 flex flex-col justify-between cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#f7931a] text-white flex items-center justify-center font-bold text-[9px] shadow-2xs shrink-0">
                    ₿
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#5945F1]">
                    BTC/USD
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-1 text-[#FE01B1] font-bold text-xs">
                  <FacetedGemIcon className="w-3.5 h-3.5" />
                  <span>Premium</span>
                </div>
              </div>

              {/* S&P 500 */}
              <div
                onClick={() => handleOpenSignalByTicker('S&P 500')}
                className="p-3 rounded-xl bg-white border border-slate-100/80 hover:border-indigo-200 flex flex-col justify-between cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-1.5">
                  <Sp500Badge />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#5945F1]">
                    S&P 500
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <svg className="w-12 h-4 text-emerald-500" viewBox="0 0 50 15">
                    <path d="M0,10 L10,6 L22,11 L34,3 L42,6 L50,1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-bold text-emerald-600 font-mono">+0.44%</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* ─── Interactive Action Modals ─── */}
      <AssetClassModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelectAsset={(assetName, category) => {
          markTaskCompleted(
            'portfolio-power-up',
            'task-1',
            10,
            15,
            `Added Asset Class: ${assetName} (${category})`
          );
        }}
      />

      <StopLossModal
        isOpen={isStopLossModalOpen}
        onClose={() => setIsStopLossModalOpen(false)}
        onConfirmStopLoss={(ticker, slLevel) => {
          markTaskCompleted(
            'portfolio-power-up',
            'task-3',
            5,
            10,
            `Set Stop-Loss Protection for ${ticker} at ${slLevel}`
          );
        }}
      />

      <AlphaBriefModal
        isOpen={isAlphaBriefModalOpen}
        onClose={() => setIsAlphaBriefModalOpen(false)}
        onConfirmRead={() => {
          markTaskCompleted(
            'market-watch',
            'mw-task-1',
            8,
            15,
            'Read Morning Alpha Briefing'
          );
        }}
      />

      <EconomicCalendarModal
        isOpen={isEconomicCalendarModalOpen}
        onClose={() => setIsEconomicCalendarModalOpen(false)}
        onConfirmReviewed={() => {
          markTaskCompleted(
            'market-watch',
            'mw-task-2',
            7,
            10,
            'Reviewed High-Impact Economic Calendar'
          );
        }}
      />

      <SpreadsComparisonModal
        isOpen={isSpreadsModalOpen}
        onClose={() => setIsSpreadsModalOpen(false)}
        onClaimDay1={() => {
          markTaskCompleted(
            '7-day-explorer',
            'exp-day-1',
            0,
            40,
            'Verified Live Spreads Across Tier-1 Brokers'
          );
        }}
      />

      <AssetPointsDetailModal
        isOpen={!!selectedAssetDetail}
        onClose={() => setSelectedAssetDetail(null)}
        asset={selectedAssetDetail}
        onTradeNow={() => {
          if (onOpenConnectModal) onOpenConnectModal();
          else onOpenViewPlan();
        }}
        onViewSignal={() => {
          if (selectedAssetDetail) {
            handleOpenSignalByTicker(selectedAssetDetail.symbol);
          }
        }}
      />

      {/* Portfolio Rebalance Details Modal */}
      {isRebalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#0b1c30]">Portfolio Holdings Rebalanced</h3>
              </div>
              <button
                onClick={() => setIsRebalanceModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Your current holding weights are optimized for risk-adjusted rebate yield across 4 major asset categories:
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Forex Majors (EUR/USD, GBP/USD)', pct: '40%', color: 'bg-[#5338ec]' },
                  { name: 'Commodities (Spot Gold, Crude Oil)', pct: '25%', color: 'bg-amber-500' },
                  { name: 'US Equities (Tech Alpha)', pct: '20%', color: 'bg-blue-500' },
                  { name: 'Indices (S&P 500, NASDAQ)', pct: '15%', color: 'bg-emerald-500' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-bold font-mono text-slate-900">{item.pct}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsRebalanceModalOpen(false);
                  setConversionSuccess('✨ Portfolio auto-rebalancer executed! Optimal weights locked.');
                  setTimeout(() => setConversionSuccess(null), 3000);
                }}
                className="w-full py-2.5 rounded-xl bg-[#5338ec] hover:bg-[#432ec4] text-white font-bold text-xs shadow-xs"
              >
                Re-Optimize Allocations (+5 Bonus Points)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Simulation Modal (Day 4 task) */}
      {isTradeSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-lime-50">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-5 h-5 text-lime-800" />
                <h3 className="text-base font-bold text-[#0b1c30]">Simulate Micro-Lot Execution</h3>
              </div>
              <button
                onClick={() => setIsTradeSimModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Test how our automated rebate engine registers trades from your broker terminal in under 50 milliseconds.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order:</span>
                  <span className="font-bold text-[#0b1c30]">0.01 lot EUR/USD BUY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Execution Speed:</span>
                  <span className="font-bold text-emerald-600 font-mono">14 ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Rebate Earned:</span>
                  <span className="font-bold text-[#5338ec] font-mono">+$0.08 Cashback + 1 Pt</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsTradeSimModalOpen(false);
                  if (onTriggerEarningModal) {
                    onTriggerEarningModal({
                      type: 'trade',
                      points: 20,
                      credits: 10,
                    });
                  } else {
                    markTaskCompleted('7-day-explorer', 'exp-day-4', 20, 10, 'Simulated Micro-Lot Trade');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#c6f831] hover:bg-[#bcf220] text-[#0b1c30] font-bold text-xs shadow-xs"
              >
                Execute 0.01 Lot & Claim (+20 Pts, +10 Credits)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Ecosystem Asset Directory Modal (View More from Tops Earning Points) */}
      {isFullDirectoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#5338ec]/5 via-purple-50 to-pink-50 shrink-0">
              <div>
                <div className="text-xs font-bold text-[#5338ec] uppercase tracking-wider">Ecosystem Directory</div>
                <h3 className="text-base font-bold text-[#0b1c30]">Full Asset Points & Rebate Schedule</h3>
              </div>
              <button
                onClick={() => setIsFullDirectoryOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-100">
              {[
                { symbol: 'EUR/USD', name: 'Euro / US Dollar', cat: 'Forex Major', pts: 50, cb: '$8.00/lot' },
                { symbol: 'GBP/USD', name: 'British Pound / Dollar', cat: 'Forex Major', pts: 45, cb: '$7.50/lot' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', cat: 'US Equities', pts: 35, cb: '$3.80/trade' },
                { symbol: 'AAPL', name: 'Apple Inc.', cat: 'US Equities', pts: 30, cb: '$3.50/trade' },
                { symbol: 'XAU/USD', name: 'Spot Gold', cat: 'Commodities', pts: 20, cb: '$5.50/lot' },
                { symbol: 'XAG/USD', name: 'Spot Silver', cat: 'Commodities', pts: 20, cb: '$4.50/lot' },
                { symbol: 'S&P 500', name: 'US 500 Index', cat: 'Indices', pts: 20, cb: '$4.20/contract' },
                { symbol: 'NASDAQ 100', name: 'US Tech 100', cat: 'Indices', pts: 25, cb: '$4.80/contract' },
                { symbol: 'BTC/USD', name: 'Bitcoin', cat: 'Crypto', pts: 45, cb: '$8.00/coin' },
                { symbol: 'ETH/USD', name: 'Ethereum', cat: 'Crypto', pts: 40, cb: '$6.50/coin' },
              ].map((item, i) => (
                <div key={i} className="pt-2.5 first:pt-0 flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg">
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">{item.symbol}</div>
                    <div className="text-[10px] text-slate-400">{item.name} • {item.cat}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#5338ec] flex items-center justify-end gap-1">
                      <Gem className="w-3 h-3 text-[#5338ec]" />
                      <span>{item.pts} Pts</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">{item.cb}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500">All rebates automatically synced to linked broker</span>
              <button
                onClick={() => setIsFullDirectoryOpen(false)}
                className="py-2 px-4 rounded-xl bg-[#5338ec] text-white text-xs font-bold hover:bg-[#432ec4]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
