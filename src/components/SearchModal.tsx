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
// Custom Crisp Flag & Asset Icons matching screenshots exactly
// ─────────────────────────────────────────────────────────────

function EuFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#003399] shrink-0">
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
  );
}

function UsFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#B22234] shrink-0">
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
  );
}

function JapanFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-white shrink-0">
      <div className="w-2.5 h-2.5 rounded-full bg-[#BC002D]" />
    </div>
  );
}

function AustraliaFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#00008B] relative shrink-0">
      {/* Mini Union Jack canton */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#00247D] overflow-hidden">
        <svg viewBox="0 0 60 30" className="w-full h-full">
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#CF142B" strokeWidth="6" />
        </svg>
      </div>
      {/* Stars */}
      <div className="absolute right-0.5 top-0.5 text-white text-[7px] leading-none">★</div>
      <div className="absolute right-1 bottom-1 text-white text-[5px] leading-none">★</div>
      <div className="absolute left-1 bottom-0.5 text-white text-[6px] leading-none">★</div>
    </div>
  );
}

function UkFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#00247D] shrink-0">
      <svg viewBox="0 0 60 30" className="w-full h-full scale-125">
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#CF142B" strokeWidth="3" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#CF142B" strokeWidth="6" />
      </svg>
    </div>
  );
}

function SwissFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#D52B1E] relative shrink-0">
      <div className="w-1 h-3 bg-white rounded-[0.5px]" />
      <div className="w-3 h-1 bg-white rounded-[0.5px] absolute" />
    </div>
  );
}

function CanadaFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-white relative shrink-0">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF0000]" />
      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#FF0000]" />
      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#FF0000] relative z-10">
        <path d="M12 2l1.2 3.5 2.8-.8-1 3.5 3 1.2-2.5 2.2 1.8 3.4-3.5-.5-.8 3.5-.8-3.5-3.5.5 1.8-3.4-2.5-2.2 3-1.2-1-3.5 2.8.8z" />
        <rect x="11.2" y="15" width="1.6" height="4" fill="#FF0000" />
      </svg>
    </div>
  );
}

function ChinaFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#DE2910] relative shrink-0">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <polygon points="5,3 6,6 9,6 6.5,8 7.5,11 5,9 2.5,11 3.5,8 1,6 4,6" fill="#FFDE00" transform="scale(0.8) translate(1,1)" />
        <polygon points="8,2 8.5,3.5 10,3.5 8.8,4.5 9.2,6 8,5 6.8,6 7.2,4.5 6,3.5 7.5,3.5" fill="#FFDE00" transform="scale(0.35) translate(15,2)" />
        <polygon points="8,2 8.5,3.5 10,3.5 8.8,4.5 9.2,6 8,5 6.8,6 7.2,4.5 6,3.5 7.5,3.5" fill="#FFDE00" transform="scale(0.35) translate(18,6)" />
        <polygon points="8,2 8.5,3.5 10,3.5 8.8,4.5 9.2,6 8,5 6.8,6 7.2,4.5 6,3.5 7.5,3.5" fill="#FFDE00" transform="scale(0.35) translate(18,11)" />
        <polygon points="8,2 8.5,3.5 10,3.5 8.8,4.5 9.2,6 8,5 6.8,6 7.2,4.5 6,3.5 7.5,3.5" fill="#FFDE00" transform="scale(0.35) translate(15,15)" />
      </svg>
    </div>
  );
}

function HongKongFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#EE1C25] relative shrink-0">
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
        <circle cx="12" cy="12" r="1.5" />
        <path d="M12 7c-1 0-2 1.5-1 3 .5.8 1.5 1 1.5 1s1-.2 1.5-1c1-1.5 0-3-1-3z" />
        <path d="M16 10c-.5-.9-2-.8-2.5.8-.3.9.2 1.8.2 1.8s1 .3 1.8-.2c1.3-.8.9-2 .5-2.4z" />
        <path d="M15 15c0-1-1.5-1.5-2.5-.5-.6.7-.4 1.7-.4 1.7s.9.7 1.7.4c1.2-.4 1.2-1.3 1.2-1.6z" />
        <path d="M10 16c.8-.5.8-2-.8-2.5-.9-.3-1.8.2-1.8.2s-.3 1 .2 1.8c.8 1.3 2 .9 2.4.5z" />
        <path d="M8 11c.9.3 1.7-.6 1.4-2-.2-.9-1.1-1.4-1.1-1.4s-.9.4-1.1 1.3c-.3 1.4.3 1.9.8 2.1z" />
      </svg>
    </div>
  );
}

function NewZealandFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex items-center justify-center bg-[#00247D] relative shrink-0">
      <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#00247D] overflow-hidden">
        <svg viewBox="0 0 60 30" className="w-full h-full">
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#CF142B" strokeWidth="6" />
        </svg>
      </div>
      <div className="absolute right-1 top-0.5 text-[#CF142B] text-[6px] font-black leading-none drop-shadow-[0_0_1px_#fff]">★</div>
      <div className="absolute right-0.5 top-2.5 text-[#CF142B] text-[5px] font-black leading-none drop-shadow-[0_0_1px_#fff]">★</div>
      <div className="absolute right-1.5 bottom-1 text-[#CF142B] text-[6px] font-black leading-none drop-shadow-[0_0_1px_#fff]">★</div>
      <div className="absolute left-2.5 bottom-0.5 text-[#CF142B] text-[5px] font-black leading-none drop-shadow-[0_0_1px_#fff]">★</div>
    </div>
  );
}

function ThailandFlag() {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-2xs flex flex-col shrink-0">
      <div className="h-[16.6%] bg-[#A51931]" />
      <div className="h-[16.6%] bg-white" />
      <div className="h-[33.4%] bg-[#2D2A4A]" />
      <div className="h-[16.6%] bg-white" />
      <div className="h-[16.6%] bg-[#A51931]" />
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

/**
 * Smart Asset / Pair Icon Resolver
 */
function AssetSignalIcon({ ticker }: { ticker: string }) {
  if (ticker === 'EUR/USD') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <EuFlag />
        <UsFlag />
      </div>
    );
  }
  if (ticker === 'EUR/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <EuFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'AUD/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <AustraliaFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'USD/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <UsFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'GBP/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <UkFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'CHF/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <SwissFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'CAD/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <CanadaFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'CNY/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <ChinaFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'HKD/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <HongKongFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'NZD/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <NewZealandFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'THB/JPY') {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <ThailandFlag />
        <JapanFlag />
      </div>
    );
  }
  if (ticker === 'GOOGL') return <GoogleGIcon />;
  if (ticker.includes('BTC')) return <BitcoinIcon />;
  if (ticker.includes('500')) return <Sp500Icon />;
  if (ticker.includes('XAU') || ticker.includes('Gold')) return <GoldIcon />;

  return (
    <div className="flex items-center -space-x-1 shrink-0">
      <EuFlag />
      <UsFlag />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Custom 3D Vector Illustration for "No Results Found"
// (Faithfully matching No Results Found.png)
// ─────────────────────────────────────────────────────────────
function NoResultsIllustration() {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      {/* Background Soft Purple Glow */}
      <div className="absolute inset-0 rounded-full bg-purple-100/70 blur-xl scale-125 pointer-events-none" />

      {/* Magnifying Glass SVG with 3D gradients and magenta X badge */}
      <svg
        viewBox="0 0 120 120"
        className="w-24 h-24 relative z-10 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lensRingGrad" x1="18" y1="18" x2="78" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="handleGrad" x1="68" y1="68" x2="108" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <radialGradient id="glassShine" cx="48" cy="48" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#EEF2FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.15" />
          </radialGradient>
          <linearGradient id="crossBadgeGrad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
        </defs>

        {/* Handle (tilted 45 degrees pointing down right) */}
        <rect
          x="68"
          y="68"
          width="15"
          height="38"
          rx="7.5"
          transform="rotate(-45 68 68)"
          fill="url(#handleGrad)"
        />
        <rect
          x="70"
          y="70"
          width="11"
          height="34"
          rx="5.5"
          transform="rotate(-45 70 70)"
          fill="#4F46E5"
          opacity="0.9"
        />

        {/* Glass Ring Outer */}
        <circle
          cx="48"
          cy="48"
          r="34"
          stroke="url(#lensRingGrad)"
          strokeWidth="8.5"
        />

        {/* Inner Glass Translucency */}
        <circle
          cx="48"
          cy="48"
          r="29.5"
          fill="url(#glassShine)"
        />

        {/* Specular Highlight Arc */}
        <path
          d="M 28 42 A 22 22 0 0 1 54 26"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Top-Right Neon Lime Sparkle Star */}
        <path
          d="M 46 10 L 48 16 L 54 18 L 48 20 L 46 26 L 44 20 L 38 18 L 44 16 Z"
          fill="#A3E635"
        />

        {/* Circular Rose/Magenta Badge with 'X' */}
        <g transform="translate(33, 33)">
          <circle
            cx="15"
            cy="15"
            r="15"
            fill="url(#crossBadgeGrad)"
            filter="drop-shadow(0 2px 5px rgba(225,29,72,0.35))"
          />
          <path
            d="M 10.5 10.5 L 19.5 19.5 M 19.5 10.5 L 10.5 19.5"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>
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

  // Canonical Signal Models from screenshots
  const defaultSignalsList: Array<{
    id: string;
    ticker: string;
    orderType: 'BUY' | 'SELL';
    term: string;
    confidence: number;
    currentPrice: string;
    targetPrice: string;
    pips: string;
    pipsDir: 'up' | 'down';
    isPremium?: boolean;
  }> = [
    {
      id: 'eurusd-sig',
      ticker: 'EUR/USD',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 70,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '20 - 29PIPS',
      pipsDir: 'up',
    },
    {
      id: 'googl-sig',
      ticker: 'GOOGL',
      orderType: 'SELL',
      term: '(Intraday)',
      confidence: 74,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '25 - 40 PIPS',
      pipsDir: 'down',
    },
    {
      id: 'btcusd-sig',
      ticker: 'BTC/USD',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 82,
      currentPrice: '67,420',
      targetPrice: '71,500',
      pips: '150 - 300 PIPS',
      pipsDir: 'up',
      isPremium: true,
    },
    {
      id: 'sp500-sig',
      ticker: 'S&P 500',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 71,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '20 - 29PIPS',
      pipsDir: 'up',
    },
    {
      id: 'xauusd-sig',
      ticker: 'XAU/USD',
      orderType: 'SELL',
      term: '(Intraday)',
      confidence: 73,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '25 - 40 PIPS',
      pipsDir: 'down',
    },
  ];

  // Point Calculator items matching Search Results_ All Tab.png
  const pointCalculatorPairs = [
    { id: 'eurjpy-pt', ticker: 'EUR/JPY', value: 50 },
    { id: 'audjpy-pt', ticker: 'AUD/JPY', value: 50 },
    { id: 'usdjpy-pt', ticker: 'USD/JPY', value: 50 },
    { id: 'gbpjpy-pt', ticker: 'GBP/JPY', value: 50 },
  ];

  // Specific JPY signals matching Search Results_ Trading Signals Tab (Scrolled).png (10 signals)
  const jpySignalsList: Array<{
    id: string;
    ticker: string;
    orderType: 'BUY' | 'SELL';
    term: string;
    confidence: number;
    currentPrice: string;
    targetPrice: string;
    pips: string;
    pipsDir: 'up' | 'down';
    isPremium?: boolean;
  }> = [
    {
      id: 'eurjpy-sig',
      ticker: 'EUR/JPY',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 70,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '20 - 29PIPS',
      pipsDir: 'up',
    },
    {
      id: 'audjpy-sig',
      ticker: 'AUD/JPY',
      orderType: 'SELL',
      term: '(Intraday)',
      confidence: 74,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '25 - 40 PIPS',
      pipsDir: 'down',
    },
    {
      id: 'usdjpy-sig',
      ticker: 'USD/JPY',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 85,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '30 - 50 PIPS',
      pipsDir: 'up',
      isPremium: true,
    },
    {
      id: 'chfjpy-sig',
      ticker: 'CHF/JPY',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 70,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '20 - 29PIPS',
      pipsDir: 'up',
    },
    {
      id: 'gbpjpy-sig',
      ticker: 'GBP/JPY',
      orderType: 'SELL',
      term: '(Intraday)',
      confidence: 74,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '25 - 40 PIPS',
      pipsDir: 'down',
    },
    {
      id: 'cadjpy-sig',
      ticker: 'CAD/JPY',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 85,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '30 - 50 PIPS',
      pipsDir: 'up',
      isPremium: true,
    },
    {
      id: 'cnyjpy-sig',
      ticker: 'CNY/JPY',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 70,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '20 - 29PIPS',
      pipsDir: 'up',
    },
    {
      id: 'hkdjpy-sig',
      ticker: 'HKD/JPY',
      orderType: 'SELL',
      term: '(Intraday)',
      confidence: 74,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '25 - 40 PIPS',
      pipsDir: 'down',
    },
    {
      id: 'nzdjpy-sig',
      ticker: 'NZD/JPY',
      orderType: 'BUY',
      term: '(Long Term)',
      confidence: 70,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '20 - 29PIPS',
      pipsDir: 'up',
    },
    {
      id: 'thbjpy-sig',
      ticker: 'THB/JPY',
      orderType: 'SELL',
      term: '(Intraday)',
      confidence: 74,
      currentPrice: '1.0690',
      targetPrice: '1.0696',
      pips: '25 - 40 PIPS',
      pipsDir: 'down',
    },
  ];

  // 1. Forex Calculators (5) matching Trading Calculators Tab Results.png
  const forexCalculators = [
    {
      name: 'Leverage',
      desc: 'Risk-managed leverage',
      tab: 'leverage-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <circle cx="8" cy="11" r="1" fill="currentColor" />
          <circle cx="12" cy="11" r="1" fill="currentColor" />
          <circle cx="16" cy="11" r="1" fill="currentColor" />
          <circle cx="8" cy="15" r="1" fill="currentColor" />
          <circle cx="12" cy="15" r="1" fill="currentColor" />
          <circle cx="16" cy="15" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'Volatility',
      desc: 'Analyze symbol risk',
      tab: 'volatility-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      name: 'Spread',
      desc: 'See spreads then trade',
      tab: 'spread-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <polyline points="5 9 2 12 5 15" />
          <polyline points="9 5 12 2 15 5" />
          <polyline points="15 19 12 22 9 19" />
          <polyline points="19 9 22 12 19 15" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      ),
    },
    {
      name: 'Pip',
      desc: 'Measure pip value first',
      tab: 'pip-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <rect x="7" y="5" width="4" height="12" rx="1" />
          <line x1="9" y1="2" x2="9" y2="5" />
          <line x1="9" y1="17" x2="9" y2="22" />
          <rect x="13" y="7" width="4" height="10" rx="1" />
          <line x1="15" y1="4" x2="15" y2="7" />
          <line x1="15" y1="17" x2="15" y2="20" />
        </svg>
      ),
    },
    {
      name: 'Margin',
      desc: 'Check required margin',
      tab: 'margin-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v9h9" />
        </svg>
      ),
    },
  ];

  // 2. Trade Planning Calculators (3) matching Trading Calculators Tab Results.png
  const tradePlanningCalculators = [
    {
      name: 'Position Size',
      desc: 'Mind risk/reward on exits',
      tab: 'position-size-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 12L12 3 A9 9 0 0 1 21 12 Z" fill="currentColor" opacity="0.3" />
        </svg>
      ),
    },
    {
      name: 'TP/SL',
      desc: 'Forex risk/reward guide',
      tab: 'tpsl-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <rect x="9" y="6" width="6" height="12" rx="1" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="5" y1="6" x2="19" y2="6" />
          <line x1="5" y1="18" x2="19" y2="18" />
        </svg>
      ),
    },
    {
      name: 'Stop-out',
      desc: 'Prevent stop-outs',
      tab: 'stop-out-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <path d="M4 19h16M4 15l4-6 4 4 6-8M18 5h2v2" />
        </svg>
      ),
    },
  ];

  // 3. Technical Calculator (1) matching Trading Calculators Tab Results.png
  const technicalCalculators = [
    {
      name: 'Pivot Point',
      desc: 'Find support & resistance',
      tab: 'pivot-point-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <polyline points="3 17 9 11 13 15 21 7" />
          <circle cx="9" cy="11" r="1.5" fill="currentColor" />
          <circle cx="13" cy="15" r="1.5" fill="currentColor" />
          <circle cx="21" cy="7" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
  ];

  // 4. Performance Calculators (1) matching Trading Calculators Tab Results.png
  const performanceCalculators = [
    {
      name: 'Profit/Loss',
      desc: 'Calculate potential PnL',
      tab: 'profit-loss-calculator',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9.5 9.5c.5-.8 1.4-1 2.5-1s2.5.5 2.5 1.5c0 1.5-3 1.5-3 3 0 .8 1.4 1.5 2.5 1.5s2-.5 2.5-1" />
        </svg>
      ),
    },
  ];

  // 5. Converter Calculators (1) matching Converter Calculators Tab Results.png
  const converterCalculatorsList = [
    {
      name: 'Currency Converter',
      desc: 'Risk-managed leverage',
      tab: 'currency-converter',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
          <circle cx="9" cy="9" r="5" />
          <line x1="9" y1="7" x2="9" y2="11" />
          <circle cx="15" cy="15" r="5" />
          <line x1="15" y1="13" x2="15" y2="17" />
          <path d="M12 4l2 2-2 2" />
          <path d="M12 20l-2-2 2-2" />
        </svg>
      ),
    },
  ];

  // Canonical Calculators (5) shown in All Tab matching Search Results_ All Tab.png
  const canonicalCalculators = forexCalculators;

  // Search Query Matching Logic
  const rawQuery = searchQuery.trim();
  const query = rawQuery.toLowerCase();
  const hasQuery = rawQuery.length > 0;

  // Check known domain matches
  const isJpySearch = query.includes('jpy');
  const isSignalSearch =
    query.includes('signal') ||
    query.includes('eur') ||
    query.includes('usd') ||
    query.includes('googl') ||
    query.includes('btc') ||
    query.includes('500') ||
    query.includes('xau') ||
    query.includes('gold') ||
    query.includes('forex') ||
    query.includes('crypto') ||
    query.includes('trade');

  const isBrokerSearch =
    query.includes('broker') ||
    query.includes('hfm') ||
    query.includes('exness') ||
    query.includes('xm') ||
    query.includes('cashback') ||
    query.includes('tier') ||
    query.includes('ic markets') ||
    query.includes('pepperstone');

  const isCalcSearch =
    query.includes('calc') ||
    query.includes('leverage') ||
    query.includes('volatility') ||
    query.includes('spread') ||
    query.includes('pip') ||
    query.includes('margin') ||
    query.includes('converter') ||
    query.includes('fibonacci') ||
    query.includes('pivot') ||
    query.includes('profit') ||
    query.includes('drawdown') ||
    query.includes('compound') ||
    query.includes('position');

  // Any match across signals, brokers, calculators, or general terms
  const hasMatches =
    !hasQuery ||
    isJpySearch ||
    isSignalSearch ||
    isBrokerSearch ||
    isCalcSearch ||
    signals.some(
      (s) =>
        s.ticker.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.assetClass?.toLowerCase().includes(query)
    ) ||
    brokers.some(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.regulation?.toLowerCase().includes(query)
    );

  // Scenario 3: No Results Found (e.g. "Hamburger", "pizza", "xyz123")
  const isNoResults = hasQuery && !hasMatches;

  // Active signals to display
  const activeSignalsToDisplay = isJpySearch
    ? jpySignalsList
    : defaultSignalsList;

  // Determine what sections to show based on activeTab
  const showSignalsSection = activeTab === 'all' || activeTab === 'signals';
  const showBrokersSection = activeTab === 'all' || activeTab === 'brokers';
  const showCalculatorsSection =
    activeTab === 'all' || activeTab === 'trading-calculators';
  const showConverterCalculators = activeTab === 'converter-calculators';
  const showBrokerComparison = activeTab === 'broker-comparison';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex flex-col items-center pt-6 sm:pt-10 px-4 pb-12 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ─── Top Wide Search Input Bar ─── */}
      <div className="w-full max-w-[960px] relative">
        <div className="w-full h-11 sm:h-12 px-4 bg-white rounded-xl sm:rounded-2xl border border-[#5945F1] shadow-lg flex items-center gap-3 transition-all">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 shrink-0 stroke-[2]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-0 text-sm sm:text-base bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />

          {/* When typing, cancel / clear button is removed as requested ("เอาปุ่ม cancel ตรง search เวลาตอนพิมพ์ออก") */}
          {!searchQuery && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0 ml-auto"
              title="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Main White Command Palette Card ─── */}
      <div className="w-full max-w-[960px] mt-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-7 animate-in zoom-in-95 duration-150">
        {/* ════════════ SCENARIO 3: NO RESULTS FOUND (e.g. 'Hamburger') ════════════ */}
        {isNoResults ? (
          <div className="py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center">
            <NoResultsIllustration />
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#0b1c30] mt-5">
              Oops! No Results Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
              It looks like '{rawQuery}' isn't listed with us yet. Try using more general terms or
              searching for different keywords.
            </p>
          </div>
        ) : (
          <>
            {/* ════════════ FILTER TABS (SHOWN WHEN SEARCH QUERY IS PRESENT) ════════════ */}
            {hasQuery && (
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
                    11
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
                  className={`pb-1 cursor-pointer transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'broker-comparison'
                      ? 'text-[#0b1c30] font-bold after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#5945F1] after:rounded-full'
                      : 'text-slate-600 hover:text-[#5945F1]'
                  }`}
                >
                  <span>Broker Comparison</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[10px] sm:text-[11px] font-bold">
                    25
                  </span>
                </button>
              </div>
            )}

            {/* ════════════ SCENARIO 1: DEFAULT STATE (NO QUERY) ════════════ */}
            {!hasQuery && (
              <>
                {/* 1. Trusted Broker Network (at top in Default) */}
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
                    {/* HFM */}
                    <div
                      onClick={() => {
                        if (onSelectBrokerDetail) onSelectBrokerDetail(hfmBroker);
                        else onOpenConnectModal(hfmBroker);
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
                          Max Cashback:{' '}
                          <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
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

                    {/* Exness */}
                    <div
                      onClick={() => {
                        if (onSelectBrokerDetail) onSelectBrokerDetail(exnessBroker);
                        else onOpenConnectModal(exnessBroker);
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
                          Max Cashback:{' '}
                          <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                            <span>Tier 1 Regulated</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* XM */}
                    <div
                      onClick={() => {
                        if (onSelectBrokerDetail) onSelectBrokerDetail(xmBroker);
                        else onOpenConnectModal(xmBroker);
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
                          Max Cashback:{' '}
                          <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
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

                {/* 2. Trading Signals (middle in Default) */}
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
                    {defaultSignalsList.map((sig) => {
                      if (sig.isPremium) {
                        return (
                          <div
                            key={sig.id}
                            className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                          >
                            <div
                              onClick={() => {
                                onSelectSignal(
                                  signals.find((s) => s.ticker.includes('BTC')) || signals[0]
                                );
                                onClose();
                              }}
                              className="flex items-center gap-3 w-32 sm:w-40 shrink-0 cursor-pointer"
                            >
                              <AssetSignalIcon ticker={sig.ticker} />
                              <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                                {sig.ticker}
                              </span>
                            </div>
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
                        );
                      }

                      return (
                        <div
                          key={sig.id}
                          onClick={() => {
                            const found =
                              signals.find((s) => s.ticker === sig.ticker) || signals[0];
                            onSelectSignal(found);
                            onClose();
                          }}
                          className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 w-32 sm:w-40 shrink-0">
                            <AssetSignalIcon ticker={sig.ticker} />
                            <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                              {sig.ticker}
                            </span>
                          </div>
                          <div className="w-28 sm:w-36 text-left">
                            <div
                              className={`text-xs sm:text-sm font-bold ${
                                sig.orderType === 'BUY' ? 'text-[#84CC16]' : 'text-[#4F46E5]'
                              }`}
                            >
                              {sig.orderType}{' '}
                              <span className="font-semibold text-xs">{sig.term}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">Order Side</div>
                          </div>
                          <div className="w-24 sm:w-32 text-center">
                            <div className="text-sm sm:text-base font-bold text-[#5945F1]">
                              {sig.confidence}%
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Confidence Rate
                            </div>
                          </div>
                          <div className="hidden sm:block w-36 text-left text-xs font-mono">
                            <div className="text-slate-500">
                              Current Price:
                              <strong className="text-[#0b1c30] ml-1">{sig.currentPrice}</strong>
                            </div>
                            <div className="text-slate-500">
                              Target Priced:
                              <strong className="text-[#0b1c30] ml-1">{sig.targetPrice}</strong>
                            </div>
                          </div>
                          <div className="w-28 sm:w-36 text-right">
                            <div
                              className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-1 ${
                                sig.pipsDir === 'up' ? 'text-[#16a34a]' : 'text-[#4F46E5]'
                              }`}
                            >
                              <span>{sig.pipsDir === 'up' ? '▲' : '▼'}</span>
                              <span>{sig.pips}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Expected move
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Spotlight Picks ⓘ (banners at bottom in Default) */}
                <div>
                  <div className="flex items-center gap-1.5 pb-3">
                    <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                      Spotlight Picks
                    </h3>
                    <Info className="w-4 h-4 text-slate-400 stroke-[2]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Banner 1: Looking for an attractive banner to draw the subscriber's attention? */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF875] via-[#FFDE38] to-[#FFC72C] p-4 sm:p-5 flex items-center justify-between gap-3 border border-amber-300 shadow-2xs group">
                      {/* Left Megaphone & Welcome Graphic */}
                      <div className="w-24 sm:w-28 shrink-0 flex items-center justify-center relative">
                        <div className="w-20 h-16 bg-white/95 rounded-xl border border-black/80 shadow-xs p-1.5 flex flex-col items-center justify-center transform -rotate-3 relative group-hover:rotate-0 transition-transform">
                          <div className="bg-black text-[#FFDE38] text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
                            WELCOME!
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px]">
                            <span>🎉</span>
                            <span className="font-bold text-black text-[9px]">SPECIAL</span>
                          </div>
                          <div className="absolute -top-2 -left-1 text-[10px]">✨</div>
                          <div className="absolute -bottom-1 -right-1 text-[10px]">⭐</div>
                        </div>
                      </div>

                      {/* Center/Right Text & Button */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-sm sm:text-base text-black leading-snug">
                          Looking for an attractive banner to draw the subscriber's attention?
                        </h4>
                        <button
                          onClick={() => {
                            onNavigateToTab('member-plan');
                            onClose();
                          }}
                          className="mt-2.5 px-5 py-1.5 rounded-full bg-black text-[#FFDE38] hover:bg-slate-900 font-extrabold text-[11px] tracking-wide cursor-pointer transition-all shadow-sm hover:scale-105"
                        >
                          ORDER NOW
                        </button>
                      </div>
                    </div>

                    {/* Banner 2: Looking for a fun way to reveal your offers? */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF875] via-[#FFDE38] to-[#FFC72C] p-4 sm:p-5 flex items-center justify-between gap-3 border border-amber-300 shadow-2xs group">
                      {/* Left Text & Subtitle */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-sm sm:text-base text-black leading-snug">
                          Looking for a fun way to reveal your offers?
                        </h4>
                        <p className="text-xs text-slate-800 mt-1 font-medium">
                          Go interactive with the Flip or Scratch effect!
                        </p>
                      </div>

                      {/* Right Screen & Character Illustration */}
                      <div className="w-24 sm:w-28 shrink-0 flex items-center justify-center relative">
                        <div className="w-20 h-16 bg-white/95 rounded-xl border border-black/80 shadow-xs p-1 flex flex-col justify-between relative group-hover:scale-105 transition-transform">
                          <div className="flex items-center gap-1 px-1 pt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          </div>
                          <div className="flex items-center justify-center gap-1.5 py-1">
                            <div className="w-6 h-6 rounded-full bg-[#FD02B0] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                              🙋‍♀️
                            </div>
                            <div className="space-y-1">
                              <div className="w-6 h-1.5 bg-indigo-200 rounded-full" />
                              <div className="w-4 h-1 bg-amber-200 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ════════════ SCENARIO 2: SEARCH RESULTS FOUND ════════════ */}
            {hasQuery && (
              <>
                {/* ════════════ TAB: ALL ════════════ */}
                {activeTab === 'all' && (
                  <div className="space-y-7">
                    {/* 1. Point Calculator (Shown when searching JPY or calc, matching Search Results_ All Tab.png) */}
                    {isJpySearch && (
                      <div>
                        <div className="flex items-center justify-between pb-3">
                          <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                            Point Calculator
                          </h3>
                          <button
                            onClick={() => {
                              onNavigateToTab('pip-calculator');
                              onClose();
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>More</span>
                            <ChevronRight className="w-4 h-4 stroke-[2]" />
                          </button>
                        </div>

                        {/* 4 Cards with Flags, Pair Name, and Purple Diamond with 50 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                          {pointCalculatorPairs.map((pt) => (
                            <div
                              key={pt.id}
                              onClick={() => {
                                onNavigateToTab('pip-calculator');
                                onClose();
                              }}
                              className="border border-slate-200/90 rounded-2xl p-3.5 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <AssetSignalIcon ticker={pt.ticker} />
                                <span className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                                  {pt.ticker}
                                </span>
                              </div>
                              <div className="flex flex-col items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-[#5945F1] stroke-2">
                                  <polygon points="12 2 22 12 12 22 2 12" />
                                </svg>
                                <span className="text-[11px] font-bold text-[#5945F1] leading-none mt-0.5">
                                  {pt.value}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Trading Signals (5 items in All Tab) */}
                    <div>
                      <div className="flex items-center justify-between pb-2">
                        <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                          Trading Signals
                        </h3>
                        <button
                          onClick={() => {
                            setActiveTab('signals');
                          }}
                          className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>More</span>
                          <ChevronRight className="w-4 h-4 stroke-[2]" />
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {activeSignalsToDisplay.slice(0, 5).map((sig) => {
                          if (sig.isPremium) {
                            return (
                              <div
                                key={sig.id}
                                className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                              >
                                <div
                                  onClick={() => {
                                    onSelectSignal(
                                      signals.find((s) => s.ticker.includes('BTC') || s.ticker.includes('USD/JPY')) ||
                                        signals[0]
                                    );
                                    onClose();
                                  }}
                                  className="flex items-center gap-3 w-32 sm:w-40 shrink-0 cursor-pointer"
                                >
                                  <AssetSignalIcon ticker={sig.ticker} />
                                  <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                                    {sig.ticker}
                                  </span>
                                </div>
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
                            );
                          }

                          return (
                            <div
                              key={sig.id}
                              onClick={() => {
                                const found =
                                  signals.find((s) => s.ticker === sig.ticker) || signals[0];
                                onSelectSignal(found);
                                onClose();
                              }}
                              className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 w-32 sm:w-40 shrink-0">
                                <AssetSignalIcon ticker={sig.ticker} />
                                <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                                  {sig.ticker}
                                </span>
                              </div>
                              <div className="w-28 sm:w-36 text-left">
                                <div
                                  className={`text-xs sm:text-sm font-bold ${
                                    sig.orderType === 'BUY' ? 'text-[#84CC16]' : 'text-[#4F46E5]'
                                  }`}
                                >
                                  {sig.orderType}{' '}
                                  <span className="font-semibold text-xs">{sig.term}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">Order Side</div>
                              </div>
                              <div className="w-24 sm:w-32 text-center">
                                <div className="text-sm sm:text-base font-bold text-[#5945F1]">
                                  {sig.confidence}%
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  Confidence Rate
                                </div>
                              </div>
                              <div className="hidden sm:block w-36 text-left text-xs font-mono">
                                <div className="text-slate-500">
                                  Current Price:
                                  <strong className="text-[#0b1c30] ml-1">{sig.currentPrice}</strong>
                                </div>
                                <div className="text-slate-500">
                                  Target Priced:
                                  <strong className="text-[#0b1c30] ml-1">{sig.targetPrice}</strong>
                                </div>
                              </div>
                              <div className="w-28 sm:w-36 text-right">
                                <div
                                  className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-1 ${
                                    sig.pipsDir === 'up' ? 'text-[#16a34a]' : 'text-[#4F46E5]'
                                  }`}
                                >
                                  <span>{sig.pipsDir === 'up' ? '▲' : '▼'}</span>
                                  <span>{sig.pips}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  Expected move
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Trusted Broker Network */}
                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                          Trusted Broker Network
                        </h3>
                        <button
                          onClick={() => {
                            setActiveTab('brokers');
                          }}
                          className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>More</span>
                          <ChevronRight className="w-4 h-4 stroke-[2]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* HFM */}
                        <div
                          onClick={() => {
                            if (onSelectBrokerDetail) onSelectBrokerDetail(hfmBroker);
                            else onOpenConnectModal(hfmBroker);
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
                              Max Cashback:{' '}
                              <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
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

                        {/* Exness */}
                        <div
                          onClick={() => {
                            if (onSelectBrokerDetail) onSelectBrokerDetail(exnessBroker);
                            else onOpenConnectModal(exnessBroker);
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
                              Max Cashback:{' '}
                              <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                                <span>Tier 1 Regulated</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* XM */}
                        <div
                          onClick={() => {
                            if (onSelectBrokerDetail) onSelectBrokerDetail(xmBroker);
                            else onOpenConnectModal(xmBroker);
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
                              Max Cashback:{' '}
                              <span className="text-[#5945F1] font-bold font-mono">$8.00</span>
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

                    {/* 4. Trading Calculators (Shown when JPY or Calc searched, matching Search Results_ All Tab.png) */}
                    {(isJpySearch || isCalcSearch) && (
                      <div>
                        <div className="flex items-center justify-between pb-3">
                          <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                            Trading Calculators
                          </h3>
                          <button
                            onClick={() => {
                              setActiveTab('trading-calculators');
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>More</span>
                            <ChevronRight className="w-4 h-4 stroke-[2]" />
                          </button>
                        </div>

                        {/* 5 Neon Lime Circle Calculator Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {canonicalCalculators.map((calc, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                onNavigateToTab(calc.tab);
                                onClose();
                              }}
                              className="border border-slate-200/90 rounded-2xl p-3.5 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#D4F834] text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                {calc.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors leading-tight">
                                  {calc.name}
                                </div>
                                <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                                  {calc.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════ TAB: TRADING SIGNALS ════════════ */}
                {/* Matches Search Results_ Trading Signals Tab (Scrolled).png */}
                {activeTab === 'signals' && (
                  <div className="space-y-6">
                    {/* Spotlight Picks ⓘ (at top of tab) */}
                    <div>
                      <div className="flex items-center gap-1.5 pb-3">
                        <h3 className="font-display font-semibold text-base sm:text-lg text-[#0b1c30]">
                          Spotlight Picks
                        </h3>
                        <Info className="w-4 h-4 text-slate-400 stroke-[2]" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Banner 1: Looking for an attractive banner to draw the subscriber's attention? */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF875] via-[#FFDE38] to-[#FFC72C] p-4 sm:p-5 flex items-center justify-between gap-3 border border-amber-300 shadow-2xs group">
                          <div className="w-24 sm:w-28 shrink-0 flex items-center justify-center relative">
                            <div className="w-20 h-16 bg-white/95 rounded-xl border border-black/80 shadow-xs p-1.5 flex flex-col items-center justify-center transform -rotate-3 relative group-hover:rotate-0 transition-transform">
                              <div className="bg-black text-[#FFDE38] text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
                                WELCOME!
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[10px]">
                                <span>🎉</span>
                                <span className="font-bold text-black text-[9px]">SPECIAL</span>
                              </div>
                              <div className="absolute -top-2 -left-1 text-[10px]">✨</div>
                              <div className="absolute -bottom-1 -right-1 text-[10px]">⭐</div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-bold text-sm sm:text-base text-black leading-snug">
                              Looking for an attractive banner to draw the subscriber's attention?
                            </h4>
                            <button
                              onClick={() => {
                                onNavigateToTab('member-plan');
                                onClose();
                              }}
                              className="mt-2.5 px-5 py-1.5 rounded-full bg-black text-[#FFDE38] hover:bg-slate-900 font-extrabold text-[11px] tracking-wide cursor-pointer transition-all shadow-sm hover:scale-105"
                            >
                              ORDER NOW
                            </button>
                          </div>
                        </div>

                        {/* Banner 2: Looking for a fun way to reveal your offers? */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF875] via-[#FFDE38] to-[#FFC72C] p-4 sm:p-5 flex items-center justify-between gap-3 border border-amber-300 shadow-2xs group">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-bold text-sm sm:text-base text-black leading-snug">
                              Looking for a fun way to reveal your offers?
                            </h4>
                            <p className="text-xs text-slate-800 mt-1 font-medium">
                              Go interactive with the Flip or Scratch effect!
                            </p>
                          </div>

                          <div className="w-24 sm:w-28 shrink-0 flex items-center justify-center relative">
                            <div className="w-20 h-16 bg-white/95 rounded-xl border border-black/80 shadow-xs p-1 flex flex-col justify-between relative group-hover:scale-105 transition-transform">
                              <div className="flex items-center gap-1 px-1 pt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              </div>
                              <div className="flex items-center justify-center gap-1.5 py-1">
                                <div className="w-6 h-6 rounded-full bg-[#FD02B0] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                                  🙋‍♀️
                                </div>
                                <div className="space-y-1">
                                  <div className="w-6 h-1.5 bg-indigo-200 rounded-full" />
                                  <div className="w-4 h-1 bg-amber-200 rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Breadcrumb Result Header: Result in 'Trading Signals' | Results (99+) > */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-2">
                        <span className="text-slate-700">
                          Result in <strong className="text-[#0b1c30] font-bold">'Trading Signals'</strong>
                        </span>
                        <span className="text-slate-300 mx-1">|</span>
                        <button
                          onClick={() => {
                            onNavigateToTab('signals');
                            onClose();
                          }}
                          className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                        >
                          <span>Results (99+)</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>

                      {/* 10 Scrolled Signals List */}
                      <div className="divide-y divide-slate-100">
                        {activeSignalsToDisplay.map((sig) => {
                          if (sig.isPremium) {
                            return (
                              <div
                                key={sig.id}
                                className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                              >
                                <div
                                  onClick={() => {
                                    onSelectSignal(
                                      signals.find((s) => s.ticker.includes('BTC') || s.ticker.includes('USD/JPY')) ||
                                        signals[0]
                                    );
                                    onClose();
                                  }}
                                  className="flex items-center gap-3 w-32 sm:w-40 shrink-0 cursor-pointer"
                                >
                                  <AssetSignalIcon ticker={sig.ticker} />
                                  <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                                    {sig.ticker}
                                  </span>
                                </div>
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
                            );
                          }

                          return (
                            <div
                              key={sig.id}
                              onClick={() => {
                                const found =
                                  signals.find((s) => s.ticker === sig.ticker) || signals[0];
                                onSelectSignal(found);
                                onClose();
                              }}
                              className="py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 w-32 sm:w-40 shrink-0">
                                <AssetSignalIcon ticker={sig.ticker} />
                                <span className="font-display font-bold text-sm sm:text-base text-[#0b1c30]">
                                  {sig.ticker}
                                </span>
                              </div>
                              <div className="w-28 sm:w-36 text-left">
                                <div
                                  className={`text-xs sm:text-sm font-bold ${
                                    sig.orderType === 'BUY' ? 'text-[#84CC16]' : 'text-[#4F46E5]'
                                  }`}
                                >
                                  {sig.orderType}{' '}
                                  <span className="font-semibold text-xs">{sig.term}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">Order Side</div>
                              </div>
                              <div className="w-24 sm:w-32 text-center">
                                <div className="text-sm sm:text-base font-bold text-[#5945F1]">
                                  {sig.confidence}%
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  Confidence Rate
                                </div>
                              </div>
                              <div className="hidden sm:block w-36 text-left text-xs font-mono">
                                <div className="text-slate-500">
                                  Current Price:
                                  <strong className="text-[#0b1c30] ml-1">{sig.currentPrice}</strong>
                                </div>
                                <div className="text-slate-500">
                                  Target Priced:
                                  <strong className="text-[#0b1c30] ml-1">{sig.targetPrice}</strong>
                                </div>
                              </div>
                              <div className="w-28 sm:w-36 text-right">
                                <div
                                  className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-1 ${
                                    sig.pipsDir === 'up' ? 'text-[#16a34a]' : 'text-[#4F46E5]'
                                  }`}
                                >
                                  <span>{sig.pipsDir === 'up' ? '▲' : '▼'}</span>
                                  <span>{sig.pips}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  Expected move
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════ TAB: TRADING CALCULATORS ════════════ */}
                {/* Matches Trading Calculators Tab Results.png */}
                {activeTab === 'trading-calculators' && (
                  <div className="space-y-6">
                    {/* 1. Forex Calculators (5) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-3">
                        <span className="text-slate-700">
                          Result in <strong className="text-[#0b1c30] font-bold">'Forex Calculators'</strong>
                        </span>
                        <span className="text-slate-300 mx-1">|</span>
                        <button
                          onClick={() => {
                            onNavigateToTab('leverage-calculator');
                            onClose();
                          }}
                          className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                        >
                          <span>Results (5)</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {forexCalculators.map((calc, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              onNavigateToTab(calc.tab);
                              onClose();
                            }}
                            className="border border-slate-200/90 rounded-2xl p-3.5 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#D4F834] text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                              {calc.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors leading-tight">
                                {calc.name}
                              </div>
                              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                                {calc.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Trade Planning Calculators (3) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-3">
                        <span className="text-slate-700">
                          Result in <strong className="text-[#0b1c30] font-bold">'Trade Planning Calculators'</strong>
                        </span>
                        <span className="text-slate-300 mx-1">|</span>
                        <button
                          onClick={() => {
                            onNavigateToTab('position-size-calculator');
                            onClose();
                          }}
                          className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                        >
                          <span>Results (3)</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {tradePlanningCalculators.map((calc, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              onNavigateToTab(calc.tab);
                              onClose();
                            }}
                            className="border border-slate-200/90 rounded-2xl p-3.5 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#D4F834] text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                              {calc.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors leading-tight">
                                {calc.name}
                              </div>
                              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                                {calc.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Technical Calculator (1) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-3">
                        <span className="text-slate-700">
                          Result in <strong className="text-[#0b1c30] font-bold">'Technical Calculator'</strong>
                        </span>
                        <span className="text-slate-300 mx-1">|</span>
                        <button
                          onClick={() => {
                            onNavigateToTab('pivot-point-calculator');
                            onClose();
                          }}
                          className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                        >
                          <span>Results (1)</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {technicalCalculators.map((calc, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              onNavigateToTab(calc.tab);
                              onClose();
                            }}
                            className="border border-slate-200/90 rounded-2xl p-3.5 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#D4F834] text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                              {calc.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors leading-tight">
                                {calc.name}
                              </div>
                              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                                {calc.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Performance Calculators (1) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-3">
                        <span className="text-slate-700">
                          Result in <strong className="text-[#0b1c30] font-bold">'Performance Calculators'</strong>
                        </span>
                        <span className="text-slate-300 mx-1">|</span>
                        <button
                          onClick={() => {
                            onNavigateToTab('profit-loss-calculator');
                            onClose();
                          }}
                          className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                        >
                          <span>Results (1)</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {performanceCalculators.map((calc, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              onNavigateToTab(calc.tab);
                              onClose();
                            }}
                            className="border border-slate-200/90 rounded-2xl p-3.5 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#D4F834] text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                              {calc.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors leading-tight">
                                {calc.name}
                              </div>
                              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                                {calc.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════ TAB: CONVERTER CALCULATORS ════════════ */}
                {/* Matches Converter Calculators Tab Results.png */}
                {activeTab === 'converter-calculators' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-2">
                      <span className="text-slate-700">
                        Result in <strong className="text-[#0b1c30] font-bold">'Converter Calculators'</strong>
                      </span>
                      <span className="text-slate-300 mx-1">|</span>
                      <button
                        onClick={() => {
                          onNavigateToTab('currency-converter');
                          onClose();
                        }}
                        className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                      >
                        <span>Results (1)</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {converterCalculatorsList.map((calc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            onNavigateToTab(calc.tab);
                            onClose();
                          }}
                          className="border border-slate-200/90 rounded-2xl p-3.5 bg-white hover:border-[#5945F1] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#D4F834] text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                            {calc.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors leading-tight">
                              {calc.name}
                            </div>
                            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                              {calc.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ════════════ TAB: BROKERS LIST ════════════ */}
                {activeTab === 'brokers' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-2">
                      <span className="text-slate-700">
                        Result in <strong className="text-[#0b1c30] font-bold">'Brokers List'</strong>
                      </span>
                      <span className="text-slate-300 mx-1">|</span>
                      <button
                        onClick={() => {
                          onNavigateToTab('brokers');
                          onClose();
                        }}
                        className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                      >
                        <span>Results (25)</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* HFM */}
                      <div
                        onClick={() => {
                          if (onSelectBrokerDetail) onSelectBrokerDetail(hfmBroker);
                          else onOpenConnectModal(hfmBroker);
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

                      {/* Exness */}
                      <div
                        onClick={() => {
                          if (onSelectBrokerDetail) onSelectBrokerDetail(exnessBroker);
                          else onOpenConnectModal(exnessBroker);
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

                      {/* XM */}
                      <div
                        onClick={() => {
                          if (onSelectBrokerDetail) onSelectBrokerDetail(xmBroker);
                          else onOpenConnectModal(xmBroker);
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

                      {/* Pepperstone */}
                      <div
                        onClick={() => {
                          onNavigateToTab('brokers');
                          onClose();
                        }}
                        className="border border-slate-200/80 rounded-2xl p-4 bg-white flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#002B49] text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                          P
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-[#0b1c30]">Pepperstone</div>
                          <div className="text-xs text-slate-500 font-medium">
                            Max Cashback: <span className="text-[#5945F1] font-bold font-mono">$6.50</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                              <span>ASIC / FCA Regulated</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* IC Markets */}
                      <div
                        onClick={() => {
                          onNavigateToTab('brokers');
                          onClose();
                        }}
                        className="border border-slate-200/80 rounded-2xl p-4 bg-white flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#0F2027] text-[#00FF87] flex items-center justify-center shrink-0 font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                          IC
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-[#0b1c30]">IC Markets</div>
                          <div className="text-xs text-slate-500 font-medium">
                            Max Cashback: <span className="text-[#5945F1] font-bold font-mono">$5.50</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                              <span>Raw Spread Leader</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vantage */}
                      <div
                        onClick={() => {
                          onNavigateToTab('brokers');
                          onClose();
                        }}
                        className="border border-slate-200/80 rounded-2xl p-4 bg-white flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#001D4A] text-white flex items-center justify-center shrink-0 font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                          VT
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-[#0b1c30]">Vantage Markets</div>
                          <div className="text-xs text-slate-500 font-medium">
                            Max Cashback: <span className="text-[#5945F1] font-bold font-mono">$7.00</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#ECEAFE] text-[#5945F1] text-[10px] font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                              <span>Global Multi-Asset</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════ TAB: BROKER COMPARISON ════════════ */}
                {activeTab === 'broker-comparison' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pb-2">
                      <span className="text-slate-700">
                        Result in <strong className="text-[#0b1c30] font-bold">'Broker Comparison'</strong>
                      </span>
                      <span className="text-slate-300 mx-1">|</span>
                      <button
                        onClick={() => {
                          onNavigateToTab('broker-comparison');
                          onClose();
                        }}
                        className="text-slate-500 hover:text-[#5945F1] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                      >
                        <span>Results (25)</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <div
                      onClick={() => {
                        onNavigateToTab('broker-comparison');
                        onClose();
                      }}
                      className="border border-slate-200/80 rounded-2xl p-6 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-white hover:border-[#5945F1] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-base text-[#0b1c30]">
                          Side-by-Side Broker Comparison Matrix
                        </div>
                        <div className="text-xs sm:text-sm text-slate-500">
                          Compare live EUR/USD & JPY spreads, leverage limits, Tier-1 regulations, and cashback tiers between HFM, Exness, XM, Pepperstone, and IC Markets.
                        </div>
                      </div>
                      <button className="px-5 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4d3ad8] text-white text-xs sm:text-sm font-bold shrink-0 shadow-sm cursor-pointer transition-colors">
                        Launch Comparison
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
