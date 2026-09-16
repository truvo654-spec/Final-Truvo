import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, MarketSignal } from '../types';
import {
  ChevronDown,
  User,
  Radio,
  Trophy,
  Menu,
  X,
  Search,
  Zap,
  Layers,
  ArrowRight,
  BarChart3,
  BookOpen,
  MessageSquare,
  Flame,
  LayoutGrid,
  CircleDollarSign,
  Diamond,
  Shield,
  Bell,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import { InteractiveBrokersGraphic } from './submenu/InteractiveBrokersGraphic';
import { InteractiveTradeGraphic } from './submenu/InteractiveTradeGraphic';
import { InteractiveCommunityGraphic } from './submenu/InteractiveCommunityGraphic';
import { InteractiveCompanyGraphic } from './submenu/InteractiveCompanyGraphic';
import { InteractiveCompanySubmenuGraphic } from './submenu/InteractiveCompanySubmenuGraphic';
import { CompanyModals } from './CompanyModals';
import { CalculatorType } from './calculators/TradingCalculatorsModal';
import { useTheme } from '../theme/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: UserProfile;
  signals: MarketSignal[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConnectModal: () => void;
  onOpenViewPlan: () => void;
  onOpenLedger: () => void;
  onOpenBrokerComparison?: () => void;
  onSelectCommunitySubTab?: (tab: 'feeds' | 'topics' | 'articles' | 'mypage') => void;
  onOpenCalculator?: (calcType: CalculatorType | string, subTool?: string) => void;
  onNavigateToCashbackOverview?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenSearchModal?: () => void;
  onShowToast?: (msg: string) => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
  isLoggedIn?: boolean;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  signals,
  activeTab,
  setActiveTab,
  onOpenConnectModal,
  onOpenViewPlan,
  onOpenLedger,
  onOpenBrokerComparison,
  onSelectCommunitySubTab,
  onOpenCalculator,
  onNavigateToCashbackOverview,
  searchQuery,
  onSearchChange,
  onOpenSearchModal,
  onShowToast,
  onUpdateAvatar,
  isLoggedIn = true,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
}) => {
  const [activeHoverMenu, setActiveHoverMenu] = useState<'trade' | 'brokers' | 'community' | 'company' | null>(null);
  const [hoveredBrokerOption, setHoveredBrokerOption] = useState<'brokers' | 'broker-comparison' | null>(null);
  const [hoveredTradeOption, setHoveredTradeOption] = useState<'signals' | 'analysis' | 'calculators' | 'converters' | null>(null);
  const [hoveredCommunityOption, setHoveredCommunityOption] = useState<string | null>(null);
  const [hoveredCompanyOption, setHoveredCompanyOption] = useState<'about' | 'contact' | null>(null);
  const [companyModal, setCompanyModal] = useState<{ isOpen: boolean; type: 'about' | 'contact' }>({
    isOpen: false,
    type: 'about',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { theme, setTheme, toggleTheme } = useTheme();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const activeTradeFeature: 'signals' | 'analysis' | 'calculators' | 'converters' =
    hoveredTradeOption ||
    (activeTab === 'signals' || activeTab === 'signal-detail'
      ? 'signals'
      : activeTab === 'instrument-analysis'
      ? 'analysis'
      : [
          'timezone-converter',
          'trading-timezone-converter',
          'currency-converter',
          'conversion-calculator',
        ].includes(activeTab)
      ? 'converters'
      : [
          'leverage-calculator',
          'volatility-calculator',
          'spread-calculator',
          'pip-calculator',
          'margin-calculator',
          'rebate-calculator',
          'position-size-calculator',
          'trade-planning-calculator',
          'sltp-calculator',
          'stop-out-calculator',
          'fibonacci-calculator',
          'pivot-point-calculator',
          'profit-loss-calculator',
          'loss-calculator',
          'drawdown-calculator',
          'compound-calculator',
          'performance-calculator',
          'calculators',
        ].includes(activeTab)
      ? 'calculators'
      : 'signals');

  const activeBrokerFeature: 'brokers' | 'broker-comparison' =
    hoveredBrokerOption ||
    (activeTab === 'broker-comparison' ? 'broker-comparison' : 'brokers');

  const activeCompanyFeature: 'about' | 'contact' =
    hoveredCompanyOption || 'about';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleMouseEnter = (menu: 'trade' | 'brokers' | 'community' | 'company') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsProfileMenuOpen(false);
    setActiveHoverMenu(menu);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveHoverMenu(null);
    }, 180);
  };

  const handleCloseImmediately = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveHoverMenu(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-indigo-100/70">
      <div className="w-full px-4 sm:px-8 md:px-[56px] h-[68px] flex items-center justify-between relative">
        {/* Brand Logo & Left Navigation */}
        <div className="flex items-center gap-10 lg:gap-12">
          {/* MarketSyde Logo */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              handleCloseImmediately();
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            {/* Purple Circular Glyph with Swirl 'm' & Neon Lime Dot */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5945F1] flex items-center justify-center relative shadow-xs group-hover:scale-110 group-hover:rotate-6 group-active:scale-95 transition-all duration-300 shrink-0">
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-none">
                <path
                  d="M 8 20 C 8 14.5, 9.5 11.5, 12 11.5 C 14 11.5, 15.5 13.5, 16.5 16 C 17.5 13.5, 19 11.5, 21 11.5 C 23 11.5, 24 14.5, 24 18.5"
                  stroke="white"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="24.5" cy="19.5" r="2.2" fill="#bef226" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl sm:text-[22px] tracking-tight text-[#0b1c30]">
              market<span className="text-[#5945F1]">syde</span>
            </span>
          </button>

          {/* Desktop Navigation with Hover Mega Menus - Exactly matching Total Nav Bar.png */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-800">
            {/* Trade Dropdown Trigger */}
            <div
              className="relative py-4"
              onMouseEnter={() => handleMouseEnter('trade')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  handleCloseImmediately();
                }}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  activeHoverMenu === 'trade' || activeTab === 'dashboard' || activeTab === 'signals' || activeTab === 'signal-detail' || activeTab === 'instrument-analysis'
                    ? 'text-[#5945F1] font-semibold'
                    : 'text-slate-800 hover:text-[#5945F1]'
                }`}
              >
                <span>Trade</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 stroke-[2] ${
                    activeHoverMenu === 'trade' ? 'rotate-180 text-[#5945F1]' : 'text-slate-700'
                  }`}
                />
              </button>
            </div>

            {/* Brokers Dropdown Trigger */}
            <div
              className="relative py-4"
              onMouseEnter={() => handleMouseEnter('brokers')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  setActiveTab('brokers');
                  handleCloseImmediately();
                }}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  activeHoverMenu === 'brokers' || activeTab === 'brokers' || activeTab === 'broker-detail' || activeTab === 'broker-comparison'
                    ? 'text-[#5945F1] font-semibold'
                    : 'text-slate-800 hover:text-[#5945F1]'
                }`}
              >
                <span>Brokers</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 stroke-[2] ${
                    activeHoverMenu === 'brokers' ? 'rotate-180 text-[#5945F1]' : 'text-slate-700'
                  }`}
                />
              </button>
            </div>

            {/* Member Plan Link (Direct text link, NO chevron, matching Total Nav Bar.png & Membership plan - Member Lv.1.png) */}
            <button
              onClick={() => {
                setActiveTab('member-plan');
                handleCloseImmediately();
              }}
              className={`transition-colors py-1 cursor-pointer font-medium text-sm ${
                activeTab === 'member-plan'
                  ? 'text-[#0b1c30] font-bold'
                  : 'text-slate-800 hover:text-[#5945F1]'
              }`}
            >
              Member Plan
            </button>

            {/* Community Dropdown Trigger */}
            <div
              className="relative py-4"
              onMouseEnter={() => handleMouseEnter('community')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  setActiveTab('community');
                  handleCloseImmediately();
                }}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  activeHoverMenu === 'community' || activeTab === 'community' || activeTab === 'leaderboard' || activeTab === 'points-credits'
                    ? 'text-[#5945F1] font-semibold'
                    : 'text-slate-800 hover:text-[#5945F1]'
                }`}
              >
                <span>Community</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 stroke-[2] ${
                    activeHoverMenu === 'community' ? 'rotate-180 text-[#5945F1]' : 'text-slate-700'
                  }`}
                />
              </button>
            </div>

            {/* Company Dropdown Trigger */}
            <div
              className="relative py-4"
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  setActiveTab('about');
                  handleCloseImmediately();
                }}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  activeHoverMenu === 'company' || activeTab === 'about'
                    ? 'text-[#5945F1] font-semibold'
                    : 'text-slate-800 hover:text-[#5945F1]'
                }`}
              >
                <span>Company</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 stroke-[2] ${
                    activeHoverMenu === 'company' ? 'rotate-180 text-[#5945F1]' : 'text-slate-700'
                  }`}
                />
              </button>
            </div>
          </nav>
        </div>

        {/* Right Search Input & User Profile Pill - Exactly matching Total Nav Bar.png */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          {/* Search Input Box */}
          <div className="hidden md:flex items-center relative">
            <div
              onClick={() => onOpenSearchModal?.()}
              className="w-52 lg:w-64 h-10 px-3.5 bg-white border border-indigo-200/90 hover:border-[#5945F1] rounded-xl flex items-center justify-between gap-2 shadow-2xs transition-all text-left cursor-pointer group"
              title="Search brokers, trading signals, and rewards (Cmd+K)"
            >
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors min-w-0 flex-1">
                <Search className="w-4 h-4 shrink-0 stroke-[1.75]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onFocus={() => onOpenSearchModal?.()}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    onOpenSearchModal?.();
                  }}
                  className="text-sm font-medium text-slate-800 placeholder-slate-400 truncate bg-transparent focus:outline-none w-full cursor-pointer"
                />
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 shrink-0">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* User Profile Pill & Dropdown Menu (if logged in) OR Guest Buttons (if not logged in) */}
          {isLoggedIn ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  setIsProfileMenuOpen((prev) => !prev);
                  handleCloseImmediately();
                }}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left group cursor-pointer ${
                  isProfileMenuOpen
                    ? 'bg-slate-100'
                    : 'hover:bg-slate-50'
                }`}
                title="Click to view profile & account options"
              >
                {/* Rounded Icon Box with User Photo / Silhouette + Purple Notification Dot */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg border border-indigo-100 bg-white flex items-center justify-center text-slate-700 group-hover:text-[#5945F1] group-hover:border-indigo-200 transition-colors shrink-0 overflow-hidden shadow-2xs">
                    {user.avatar && (user.avatar.startsWith('/') || user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-4 h-4 stroke-[1.75]" />
                    )}
                  </div>
                  {/* Purple notification dot floating on top-right corner with radar pulse */}
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5945F1] absolute -top-1 -right-1 ring-2 ring-white z-10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5945F1] absolute -top-1 -right-1 animate-ping opacity-75 pointer-events-none" />
                </div>

                {/* Name + Rank with Purple Ghost Icon */}
                <div className="leading-tight pr-1">
                  <div className="text-xs sm:text-[13px] font-semibold text-[#0b1c30]">
                    Hi, {user.username}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                    {/* Custom Purple Ghost Icon matching Total Nav Bar.png with playful hover */}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-[#5945F1] fill-none stroke-current shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 4a7 7 0 0 0-7 7v8l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5V11a7 7 0 0 0-7-7z" />
                      <circle cx="9.5" cy="10" r="1.1" fill="currentColor" />
                      <circle cx="14.5" cy="10" r="1.1" fill="currentColor" />
                    </svg>
                    <span>{user.rankTitle}</span>
                  </div>
                </div>
              </button>

            {/* Profile Dropdown Menu - Exact match to image.png with bouncy spring */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                  className="absolute top-full right-0 mt-2.5 w-[275px] max-w-[calc(100vw-24px)] bg-white rounded-[22px] border border-indigo-100/90 shadow-2xl shadow-indigo-950/15 p-4 z-50"
                >
                  {/* Top Header Card: Ghost Mascot, Rank, Progress Bar, Diamond Points, Edit Icon */}
                  <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-left group cursor-pointer"
                    title="View Profile & Account"
                  >
                    {/* Purple Arcade Mascot Ghost */}
                    <svg
                      viewBox="0 0 32 36"
                      className="w-10 h-11 text-[#5945F1] fill-none stroke-current shrink-0 group-hover:scale-105 transition-transform"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 5 18 C 5 9 9.5 5 16 5 C 22.5 5 27 9 27 18 L 27 28 C 25.5 30 23.5 30 22 28 C 20.5 26 17.5 26 16 28 C 14.5 30 12.5 30 11 28 C 9.5 26 6.5 26 5 28 Z" />
                      <circle cx="12" cy="15" r="1.5" fill="#5945F1" stroke="none" />
                      <circle cx="20" cy="15" r="1.5" fill="#5945F1" stroke="none" />
                    </svg>

                    <div>
                      <div className="text-[17px] font-bold text-[#5945F1] leading-tight group-hover:underline">
                        {user.rankTitle}
                      </div>
                      {/* Horizontal progress bar */}
                      <div className="w-28 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-[#5945F1] rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, (user.currentPoints / (user.nextTierThreshold || 150)) * 100))}%`,
                          }}
                        />
                      </div>
                      {/* Diamond & Points */}
                      <div className="flex items-center gap-1 mt-1.5 text-xs">
                        <Diamond className="w-3 h-3 text-[#5945F1] stroke-[2.2] shrink-0" />
                        <span className="font-bold text-[#5945F1]">{user.currentPoints}</span>
                        <span className="text-indigo-400/90 font-medium">/{user.nextTierThreshold || 150} pts.</span>
                      </div>
                    </div>
                  </button>

                  {/* Edit Pencil Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-[#5945F1] hover:text-[#432ec4] hover:bg-indigo-50/80 transition-colors cursor-pointer"
                    title="Edit Profile & Account"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-none stroke-current"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                </div>

                {/* Menu List Items */}
                <div className="py-2 space-y-0.5">
                  {/* Profile & Account Settings */}
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left group cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-indigo-50/80 text-[#5945F1] font-semibold'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-[#5945F1]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <User className={`w-4 h-4 stroke-[1.8] shrink-0 ${activeTab === 'profile' ? 'text-[#5945F1]' : 'text-slate-700 group-hover:text-[#5945F1]'}`} />
                      <span className="text-[13.5px] font-medium leading-none">Profile & Account</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#5945F1] bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-2xs">
                      View
                    </span>
                  </button>

                  {/* Dashboard */}
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-2.5 py-2 rounded-xl text-slate-800 hover:bg-slate-50 hover:text-[#5945F1] transition-colors text-left group cursor-pointer"
                  >
                    <LayoutGrid className="w-4 h-4 text-slate-700 group-hover:text-[#5945F1] stroke-[1.8] shrink-0" />
                    <span className="text-[13.5px] font-medium leading-none">Dashboard</span>
                  </button>

                  {/* Cashback */}
                  <button
                    onClick={() => {
                      if (onNavigateToCashbackOverview) {
                        onNavigateToCashbackOverview();
                      } else {
                        setActiveTab('cashback-overview');
                      }
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-2.5 py-2 rounded-xl text-slate-800 hover:bg-slate-50 hover:text-[#5945F1] transition-colors text-left group cursor-pointer"
                  >
                    <CircleDollarSign className="w-4 h-4 text-slate-700 group-hover:text-[#5945F1] stroke-[1.8] shrink-0" />
                    <span className="text-[13.5px] font-medium leading-none">Cashback</span>
                  </button>

                  {/* Points and Credits (leads directly to points&credits page) */}
                  <button
                    onClick={() => {
                      setActiveTab('points-credits');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-2.5 py-2 rounded-xl text-slate-800 hover:bg-slate-50 hover:text-[#5945F1] transition-colors text-left group cursor-pointer"
                  >
                    <Diamond className="w-4 h-4 text-slate-700 group-hover:text-[#5945F1] stroke-[1.8] shrink-0" />
                    <span className="text-[13.5px] font-medium leading-none">Points and Credits</span>
                  </button>

                  {/* Activity Logs */}
                  <button
                    onClick={() => {
                      setActiveTab('activity-logs');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-2.5 py-2 rounded-xl text-slate-800 hover:bg-slate-50 hover:text-[#5945F1] transition-colors text-left group cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-slate-700 group-hover:text-[#5945F1] stroke-[1.8] shrink-0" />
                    <span className="text-[13.5px] font-medium leading-none">Activity Logs</span>
                  </button>

                  {/* Account Security */}
                  <button
                    onClick={() => {
                      setActiveTab('account-security');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-2.5 py-2 rounded-xl text-slate-800 hover:bg-slate-50 hover:text-[#5945F1] transition-colors text-left group cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-slate-700 group-hover:text-[#5945F1] stroke-[1.8] shrink-0" />
                    <span className="text-[13.5px] font-medium leading-none">Account Security</span>
                  </button>

                  {/* Notifications */}
                  <button
                    onClick={() => {
                      if (onShowToast) {
                        onShowToast('🔔 1 Notification: Welcome bonus of 25 Syde Credits credited!');
                      }
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-800 hover:bg-slate-50 hover:text-[#5945F1] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <Bell className="w-4 h-4 text-slate-700 group-hover:text-[#5945F1] stroke-[1.8] shrink-0" />
                      <span className="text-[13.5px] font-medium leading-none">Notifications</span>
                    </div>
                    <span className="w-5 h-5 rounded-md bg-[#5945F1] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                  </button>
                </div>

                {/* Theme Toggle (Light / Dark) */}
                <div className="w-full bg-[#F3F4F8] dark:bg-[#230674] p-1 rounded-xl flex items-center mt-1 border border-transparent dark:border-[#3410D5]/50">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                      theme === 'light'
                        ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                        : 'text-slate-500 dark:text-[#8A7AF6] hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title="Light Mode"
                  >
                    <Sun className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                      theme === 'dark'
                        ? 'bg-[#5945F1] text-white shadow-2xs font-semibold'
                        : 'text-slate-500 dark:text-[#8A7AF6] hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title="Dark Mode (Design Tokens)"
                  >
                    <Moon className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Dark</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-100 my-3" />

                {/* Sign Out Button */}
                <div className="flex justify-center pb-0.5">
                  <button
                    onClick={() => {
                      if (onSignOut) {
                        onSignOut();
                      } else if (onShowToast) {
                        onShowToast("You've been signed out. Welcome back anytime!");
                      }
                      setIsProfileMenuOpen(false);
                    }}
                    className="px-6 py-1.5 rounded-xl border border-indigo-200/90 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 text-[#5945F1] font-semibold text-[13px] transition-all cursor-pointer shadow-2xs"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        ) : (
          /* Guest Actions (Sign In & Open free account) matching D12_Sign-Up.png */
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenSignIn}
              className="px-3.5 sm:px-4 py-2 rounded-xl border border-indigo-200/90 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#5945F1] hover:border-[#5945F1] bg-white transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onOpenSignUp}
              className="px-3.5 sm:px-5 py-2 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-black font-extrabold text-xs sm:text-sm transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Open free account
            </button>
          </div>
        )}

          {/* Mobile Search button */}
          <button
            onClick={() => onOpenSearchModal?.()}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            HOVER MEGA MENU: BROKERS (EXACT MATCH TO REFERENCE SCREENSHOT)
           ───────────────────────────────────────────────────────────── */}
        {activeHoverMenu === 'brokers' && (
          <div
            className="absolute top-full left-0 right-0 pt-2 z-50 flex justify-center animate-in fade-in zoom-in-98 duration-150"
            onMouseEnter={() => handleMouseEnter('brokers')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Invisible bridging shield to prevent premature mouse leave */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="w-full max-w-[940px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
              {/* Soft Lavender / Periwinkle Curved Backdrop (Left ~56% of container) */}
              <div className="absolute inset-y-0 left-0 w-full md:w-[56%] bg-[#eff2fe] rounded-r-none md:rounded-r-[130px] pointer-events-none" />

              {/* Left Feature Illustration Section */}
              <div className="w-full md:w-[56%] flex items-center justify-between relative z-10 pl-2 pr-2 shrink-0">
                {/* Left Typography Block */}
                <div className="flex flex-col space-y-1 select-none z-10 pl-1 sm:pl-3 shrink-0">
                  <span className="text-xs sm:text-[13px] font-bold tracking-wider text-[#5945F1] uppercase font-display">
                    REAL BROKER
                  </span>
                  <div className="text-xs sm:text-[13px] tracking-wider text-[#5945F1] uppercase font-display">
                    <span className="font-bold">COMPARISONS </span>
                    <span className="font-black">THAT</span>
                  </div>
                  <span className="text-sm sm:text-base font-black tracking-wider text-[#5945F1] uppercase font-display">
                    ACTUALLY MATTER.
                  </span>
                </div>

                {/* Broker Comparison Card Arena with Floating Badges */}
                <InteractiveBrokersGraphic
                  variant={activeBrokerFeature}
                  onOpenBrokerList={() => {
                    setActiveTab('brokers');
                    handleCloseImmediately();
                  }}
                  onOpenComparison={() => {
                    if (onOpenBrokerComparison) {
                      onOpenBrokerComparison();
                    } else {
                      setActiveTab('broker-comparison');
                    }
                    handleCloseImmediately();
                  }}
                />
              </div>

              {/* Right Menu Options */}
              <div className="w-full md:w-[44%] flex flex-col justify-center space-y-7 pl-4 sm:pl-8 pr-4 relative z-10">
                {/* 1. Broker List */}
                <button
                  onClick={() => {
                    setActiveTab('brokers');
                    handleCloseImmediately();
                  }}
                  onMouseEnter={() => setHoveredBrokerOption('brokers')}
                  className="group flex items-start text-left transition-all cursor-pointer w-full"
                >
                  <div className="flex items-start gap-3">
                    {/* Purple Circle Dot: Active when hovered or on brokers tab */}
                    {activeBrokerFeature === 'brokers' ? (
                      <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-1 shadow-xs" />
                    ) : null}
                    <div>
                      <div className={`font-bold text-base transition-colors leading-tight ${
                        activeBrokerFeature === 'brokers'
                          ? 'text-[#5945F1]'
                          : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                      }`}>
                        Broker List
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        The ultimate broker directory. No blind dates, just total transparency.
                      </div>
                    </div>
                  </div>
                </button>

                {/* 2. Broker Comparison */}
                <button
                  onClick={() => {
                    if (onOpenBrokerComparison) {
                      onOpenBrokerComparison();
                    } else {
                      setActiveTab('broker-comparison');
                    }
                    handleCloseImmediately();
                  }}
                  onMouseEnter={() => setHoveredBrokerOption('broker-comparison')}
                  className="group flex items-start text-left transition-all cursor-pointer w-full"
                >
                  <div className="flex items-start gap-3">
                    {/* Purple Circle Dot: Active when hovered or on comparison tab */}
                    {activeBrokerFeature === 'broker-comparison' ? (
                      <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-1 shadow-xs" />
                    ) : null}
                    <div>
                      <div className={`font-bold text-base transition-colors leading-tight ${
                        activeBrokerFeature === 'broker-comparison'
                          ? 'text-[#5945F1]'
                          : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                      }`}>
                        Broker Comparison
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        A head-to-head battle for your money.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            HOVER MEGA MENU: TRADE (DYNAMIC LEFT GRAPHIC ON HOVER)
           ───────────────────────────────────────────────────────────── */}
        {activeHoverMenu === 'trade' && (
          <div
            className="absolute top-full left-0 right-0 pt-2 z-50 flex justify-center animate-in fade-in zoom-in-98 duration-150"
            onMouseEnter={() => handleMouseEnter('trade')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Bridging shield */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="w-full max-w-[960px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
              {/* Vibrant Electric Lime Curved Backdrop (Left ~48% of container) matching Navigation Menu Content 44, 45, 46 */}
              <div className="absolute inset-y-0 left-0 w-full md:w-[48%] bg-[#bef226] rounded-r-none md:rounded-r-[130px] pointer-events-none" />

              {/* Left Feature Illustration Section */}
              <div className="w-full md:w-[48%] flex items-center justify-between relative z-10 pl-2 pr-2 shrink-0">
                {/* Left Typography Block */}
                <div className="flex flex-col space-y-0.5 select-none z-10 pl-1 sm:pl-3 shrink-0">
                  <span className="text-xs sm:text-[13px] font-bold tracking-tight text-black uppercase font-sans">
                    SPOT OPPORTUNITIES
                  </span>
                  <span className="text-xs sm:text-[13px] font-bold tracking-tight text-black uppercase font-sans">
                    AND MANAGE RISK
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-tight text-black uppercase font-sans mt-0.5">
                    WITH PRECISION
                  </span>
                </div>

                {/* Interactive Dynamic Graphic (Variants: signals, analysis, calculators, converters) */}
                <InteractiveTradeGraphic
                  variant={activeTradeFeature}
                  onSelectCalculator={(calcType) => {
                    onOpenCalculator?.(calcType);
                    handleCloseImmediately();
                  }}
                  onSelectSignals={() => {
                    setActiveTab('signals');
                    handleCloseImmediately();
                  }}
                  onSelectAnalysis={() => {
                    setActiveTab('instrument-analysis');
                    handleCloseImmediately();
                  }}
                  onSelectCashback={() => {
                    if (onNavigateToCashbackOverview) {
                      onNavigateToCashbackOverview();
                    } else {
                      setActiveTab('cashback-overview');
                    }
                    handleCloseImmediately();
                  }}
                />
              </div>

              {/* Right Menu Options (Preserving exact structure: Products & Tools) */}
              <div className="w-full md:w-[52%] pl-4 sm:pl-6 pr-2 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Column 1: Products */}
                  <div className="space-y-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                      Products
                    </div>
                    <div className="space-y-5">
                      {/* 1. Trading Signals */}
                      <button
                        onClick={() => {
                          setActiveTab('signals');
                          handleCloseImmediately();
                        }}
                        onMouseEnter={() => setHoveredTradeOption('signals')}
                        className="group flex items-start text-left transition-all cursor-pointer w-full"
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Purple Circle Dot: Active when trading signals is hovered/active */}
                          {activeTradeFeature === 'signals' ? (
                            <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-0.5 shadow-xs" />
                          ) : null}
                          <div>
                            <div className={`font-bold text-base transition-colors leading-tight ${
                              activeTradeFeature === 'signals'
                                ? 'text-[#5945F1]'
                                : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                            }`}>
                              Trading Signals
                            </div>
                            <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                              Skip the charts. Get instant buy/sell cues.
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* 2. Instrument Analysis (หัวข้อใหญ่เหมือน trading signal พร้อมคำอธิบาย อยู่ลำดับต่อจาก Trading signal ด้านล่าง) */}
                      <button
                        onClick={() => {
                          setActiveTab('instrument-analysis');
                          handleCloseImmediately();
                        }}
                        onMouseEnter={() => setHoveredTradeOption('analysis')}
                        className="group flex items-start text-left transition-all cursor-pointer w-full"
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Purple Circle Dot: Active when instrument analysis is hovered/active */}
                          {activeTradeFeature === 'analysis' ? (
                            <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-0.5 shadow-xs" />
                          ) : null}
                          <div>
                            <div className={`font-bold text-base transition-colors leading-tight ${
                              activeTradeFeature === 'analysis'
                                ? 'text-[#5945F1]'
                                : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                            }`}>
                              Instrument Analysis
                            </div>
                            <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                              Deep technical breakdown, key levels, and asset telemetry.
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Tools */}
                  <div className="space-y-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                      Tools
                    </div>

                    {/* Section 1: Trading Calculators */}
                    <div
                      className="space-y-2"
                      onMouseEnter={() => setHoveredTradeOption('calculators')}
                    >
                      <div className="flex items-center gap-2 cursor-pointer group">
                        {/* Purple Circle Dot: Active when calculators is hovered/active */}
                        {activeTradeFeature === 'calculators' ? (
                          <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 shadow-xs" />
                        ) : null}
                        <span className="font-bold text-base text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                          Trading Calculators
                        </span>
                      </div>

                      <ul className="space-y-1.5 pl-3 text-xs">
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('forex');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5945F1] hover:underline flex items-center gap-1.5 text-left transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">•</span> Forex Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('planning');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5945F1] hover:underline flex items-center gap-1.5 text-left transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">•</span> Trade Planning Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('technical');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5945F1] hover:underline flex items-center gap-1.5 text-left transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">•</span> Technical Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('performance');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5945F1] hover:underline flex items-center gap-1.5 text-left transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">•</span> Performance Calculator
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Section 2: Converter Calculators */}
                    <div
                      className="space-y-2 pt-2 border-t border-slate-100"
                      onMouseEnter={() => setHoveredTradeOption('converters')}
                    >
                      <div className="flex items-center gap-2 cursor-pointer group">
                        {/* Purple Circle Dot: Active when converters is hovered/active */}
                        {activeTradeFeature === 'converters' ? (
                          <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 shadow-xs" />
                        ) : null}
                        <button
                          onClick={() => {
                            onOpenCalculator?.('conversion');
                            handleCloseImmediately();
                          }}
                          className="font-bold text-base text-[#0b1c30] group-hover:text-[#5945F1] transition-colors text-left cursor-pointer"
                        >
                          Converter Calculators
                        </button>
                      </div>

                      <ul className="space-y-1.5 pl-3 text-xs">
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('conversion', 'timezone');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5945F1] hover:underline flex items-center gap-1.5 text-left transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">•</span> Trading Timezone Converter
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('conversion', 'currency');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5945F1] hover:underline flex items-center gap-1.5 text-left transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">•</span> Currency Converter
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            HOVER MEGA MENU: COMMUNITY (MOVED FROM FORMER COMPANY MENU)
           ───────────────────────────────────────────────────────────── */}
        {activeHoverMenu === 'community' && (
          <div
            className="absolute top-full left-0 right-0 pt-2 z-50 flex justify-center animate-in fade-in zoom-in-98 duration-150"
            onMouseEnter={() => handleMouseEnter('community')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Bridging shield */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="w-full max-w-[940px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
              {/* Soft Lavender / Periwinkle Curved Backdrop (Left ~54% of container) */}
              <div className="absolute inset-y-0 left-0 w-full md:w-[54%] bg-[#eff2fe] rounded-r-none md:rounded-r-[130px] pointer-events-none" />

              {/* Left Feature Illustration Banner */}
              <div className="w-full md:w-[54%] flex items-center justify-between relative z-10 pl-2 pr-2 shrink-0">
                <div className="flex flex-col space-y-1 select-none z-10 pl-1 sm:pl-3 shrink-0">
                  <span className="text-xs sm:text-[13px] font-bold tracking-wider text-[#5945F1] uppercase font-display">
                    GROW WITH OUR
                  </span>
                  <div className="text-xs sm:text-[13px] tracking-wider text-[#5945F1] uppercase font-display">
                    <span className="font-bold">COMMUNITY </span>
                    <span className="font-black">OF</span>
                  </div>
                  <span className="text-sm sm:text-base font-black tracking-wider text-[#5945F1] uppercase font-display">
                    ACTIVE TRADERS.
                  </span>
                </div>

                {/* Interactive Trophy & Leaderboard Arena */}
                <InteractiveCompanyGraphic />
              </div>

              {/* Right Menu Options */}
              <div className="w-full md:w-[46%] flex flex-col justify-center space-y-5 sm:space-y-6 pl-4 sm:pl-8 pr-4 relative z-10">
                <button
                  onClick={() => {
                    setActiveTab('community');
                    handleCloseImmediately();
                  }}
                  onMouseEnter={() => setHoveredCommunityOption('community')}
                  onMouseLeave={() => setHoveredCommunityOption(null)}
                  className="group flex items-start text-left transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {(hoveredCommunityOption === 'community' || (!hoveredCommunityOption && activeTab === 'community')) ? (
                      <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-1 shadow-xs" />
                    ) : null}
                    <div>
                      <div className={`font-bold text-base transition-colors leading-tight ${
                        (hoveredCommunityOption === 'community' || (!hoveredCommunityOption && activeTab === 'community'))
                          ? 'text-[#5945F1]'
                          : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                      }`}>
                        Community Floor
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        Live discussions, real-time trader sentiment, and verified setup ideas.
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('leaderboard');
                    handleCloseImmediately();
                  }}
                  onMouseEnter={() => setHoveredCommunityOption('leaderboard')}
                  onMouseLeave={() => setHoveredCommunityOption(null)}
                  className="group flex items-start text-left transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {(hoveredCommunityOption === 'leaderboard' || (!hoveredCommunityOption && activeTab === 'leaderboard')) ? (
                      <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-1 shadow-xs" />
                    ) : null}
                    <div>
                      <div className={`font-bold text-base transition-colors leading-tight ${
                        (hoveredCommunityOption === 'leaderboard' || (!hoveredCommunityOption && activeTab === 'leaderboard'))
                          ? 'text-[#5945F1]'
                          : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                      }`}>
                        Weekly Leaderboard
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        Compete with top traders for weekly cash prize pools and prestige.
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('points-credits');
                    handleCloseImmediately();
                  }}
                  onMouseEnter={() => setHoveredCommunityOption('points-credits')}
                  onMouseLeave={() => setHoveredCommunityOption(null)}
                  className="group flex items-start text-left transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {(hoveredCommunityOption === 'points-credits' || (!hoveredCommunityOption && (activeTab === 'points-credits' || (activeTab !== 'community' && activeTab !== 'leaderboard')))) ? (
                      <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-1 shadow-xs" />
                    ) : null}
                    <div>
                      <div className={`font-bold text-base transition-colors leading-tight ${
                        (hoveredCommunityOption === 'points-credits' || (!hoveredCommunityOption && (activeTab === 'points-credits' || (activeTab !== 'community' && activeTab !== 'leaderboard'))))
                          ? 'text-[#5945F1]'
                          : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                      }`}>
                        Points & Syde Credits
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        Level up through trader tiers, complete missions, and redeem rewards.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            HOVER MEGA MENU: COMPANY (ABOUT US & CONTACT US WITH DYNAMIC GRAPHICS)
            Matching State=Company 1 and State=Company 2
           ───────────────────────────────────────────────────────────── */}
        {activeHoverMenu === 'company' && (
          <div
            className="absolute top-full left-0 right-0 pt-2 z-50 flex justify-center animate-in fade-in zoom-in-98 duration-150"
            onMouseEnter={() => handleMouseEnter('company')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Bridging shield */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="w-full max-w-[940px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
              {/* Soft Lavender / Periwinkle Curved Backdrop (Left ~50% of container) */}
              <div className="absolute inset-y-0 left-0 w-full md:w-[50%] bg-[#eff2fe] rounded-r-none md:rounded-r-[130px] pointer-events-none" />

              {/* Left Feature Illustration Banner */}
              <div className="w-full md:w-[50%] flex items-center justify-between relative z-10 pl-2 pr-2 shrink-0">
                <div className="flex flex-col space-y-1 select-none z-10 pl-1 sm:pl-3 shrink-0">
                  <span className="text-xs sm:text-[13px] font-bold tracking-tight text-[#5945F1] uppercase font-sans">
                    DISCOVER WHO WE ARE
                  </span>
                  <span className="text-xs sm:text-[13px] font-medium tracking-tight text-[#5945F1] uppercase font-sans">
                    AND GET THE SUPPORT YOU
                  </span>
                  <span className="text-xs sm:text-[13px] font-bold tracking-tight text-[#5945F1] uppercase font-sans">
                    NEED.
                  </span>
                </div>

                {/* Dynamic Graphic: About Us Globe vs Contact Us Envelope */}
                <InteractiveCompanySubmenuGraphic
                  variant={activeCompanyFeature}
                  onOpenAbout={() => {
                    setActiveTab('about');
                    handleCloseImmediately();
                  }}
                  onOpenContact={() => {
                    setActiveTab('contact-us');
                    handleCloseImmediately();
                  }}
                />
              </div>

              {/* Right Menu Options */}
              <div className="w-full md:w-[50%] flex flex-col justify-center space-y-6 sm:space-y-7 pl-4 sm:pl-8 pr-4 relative z-10">
                {/* 1. About Us */}
                <button
                  onClick={() => {
                    setActiveTab('about');
                    handleCloseImmediately();
                  }}
                  onMouseEnter={() => setHoveredCompanyOption('about')}
                  className="group flex items-start text-left transition-all cursor-pointer w-full"
                >
                  <div className="flex items-start gap-3">
                    {activeCompanyFeature === 'about' ? (
                      <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-1 shadow-xs" />
                    ) : null}
                    <div>
                      <div className={`font-bold text-base transition-colors leading-tight ${
                        activeCompanyFeature === 'about'
                          ? 'text-[#5945F1]'
                          : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                      }`}>
                        About Us
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        Learn about our mission, values, and story.
                      </div>
                    </div>
                  </div>
                </button>

                {/* 2. Contact Us */}
                <button
                  onClick={() => {
                    setActiveTab('contact-us');
                    handleCloseImmediately();
                  }}
                  onMouseEnter={() => setHoveredCompanyOption('contact')}
                  className="group flex items-start text-left transition-all cursor-pointer w-full"
                >
                  <div className="flex items-start gap-3">
                    {activeCompanyFeature === 'contact' ? (
                      <div className="w-4 h-4 rounded-full bg-[#5945F1] shrink-0 mt-1 shadow-xs" />
                    ) : null}
                    <div>
                      <div className={`font-bold text-base transition-colors leading-tight ${
                        activeCompanyFeature === 'contact'
                          ? 'text-[#5945F1]'
                          : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                      }`}>
                        Contact Us
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        Drop a message, find our details, or browse FAQs.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2">
          {/* Mobile User Profile Banner */}
          <div
            onClick={() => {
              setActiveTab('profile');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 hover:border-[#5945F1] transition-all cursor-pointer mb-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-200 bg-white shadow-2xs shrink-0">
                <img
                  src={user.avatar || '/toh-avatar.svg'}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <span>{user.fullName || user.username}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5945F1] text-white font-semibold">
                    {user.rankTitle}
                  </span>
                </div>
                <div className="text-xs text-[#5945F1] font-medium mt-0.5">
                  {user.currentPoints} pts • Tap to view Profile
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#5945F1]" />
          </div>

          <button
            onClick={() => {
              setActiveTab('profile');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold flex items-center justify-between ${
              activeTab === 'profile' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>User Profile & Account</span>
            </div>
            {activeTab === 'profile' && (
              <span className="w-2 h-2 rounded-full bg-[#5338ec]" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'dashboard' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('signals');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'signals' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            Market Signals
          </button>
          <button
            onClick={() => {
              setActiveTab('instrument-analysis');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'instrument-analysis' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            Instrument Analysis
          </button>
          <button
            onClick={() => {
              setActiveTab('brokers');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'brokers' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            Brokers Directory
          </button>
          <button
            onClick={() => {
              if (onOpenBrokerComparison) {
                onOpenBrokerComparison();
              } else {
                setActiveTab('brokers');
              }
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 text-left text-sm font-semibold text-slate-700 hover:text-[#5338ec]"
          >
            Broker Comparison
          </button>
          <button
            onClick={() => {
              setActiveTab('community');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'community' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            Community Floor (Live)
          </button>
          <button
            onClick={() => {
              setActiveTab('points-credits');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'points-credits' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            Points & Credits
          </button>
          <button
            onClick={() => {
              setActiveTab('leaderboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'leaderboard' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => {
              setActiveTab('leverage-calculator');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold flex items-center justify-between ${
              activeTab === 'leverage-calculator' ? 'text-[#5338ec]' : 'text-slate-700'
            }`}
          >
            <span>Leverage Calculator</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FD02B0]/10 text-[#FD02B0] font-bold">
              PRO
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('position-size-calculator');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold flex items-center justify-between ${
              activeTab === 'position-size-calculator' || activeTab === 'trade-planning-calculator'
                ? 'text-[#5338ec]'
                : 'text-slate-700'
            }`}
          >
            <span>Trade Planning Calculator</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5945F1]/10 text-[#5945F1] font-bold">
              PLAN
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('fibonacci-calculator');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold flex items-center justify-between ${
              activeTab === 'fibonacci-calculator' || activeTab === 'pivot-point-calculator'
                ? 'text-[#5338ec]'
                : 'text-slate-700'
            }`}
          >
            <span>Technical Calculator</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5945F1]/10 text-[#5945F1] font-bold">
              TECH
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('profit-loss-calculator');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold flex items-center justify-between ${
              activeTab === 'profit-loss-calculator' ||
              activeTab === 'loss-calculator' ||
              activeTab === 'drawdown-calculator' ||
              activeTab === 'compound-calculator' ||
              activeTab === 'performance-calculator'
                ? 'text-[#5338ec]'
                : 'text-slate-700'
            }`}
          >
            <span>Performance Calculator</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5945F1]/10 text-[#5945F1] font-bold">
              PERF
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('timezone-converter');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold flex items-center justify-between ${
              activeTab === 'timezone-converter' ||
              activeTab === 'trading-timezone-converter' ||
              activeTab === 'currency-converter' ||
              activeTab === 'conversion-calculator'
                ? 'text-[#5338ec]'
                : 'text-slate-700'
            }`}
          >
            <span>Conversion Calculator</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5945F1]/10 text-[#5945F1] font-bold">
              CONV
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('member-plan');
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2 text-left text-sm font-semibold ${
              activeTab === 'member-plan' ? 'text-[#0b1c30] font-bold' : 'text-[#5338ec]'
            }`}
          >
            Member Plan
          </button>

          {/* Company Modals Triggers in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Company
            </span>
            <button
              onClick={() => {
                setActiveTab('about');
                setMobileMenuOpen(false);
              }}
              className="w-full py-1.5 text-left text-sm font-semibold text-slate-700 hover:text-[#5338ec]"
            >
              About Us
            </button>
            <button
              onClick={() => {
                setActiveTab('contact-us');
                setMobileMenuOpen(false);
              }}
              className="w-full py-1.5 text-left text-sm font-semibold text-slate-700 hover:text-[#5338ec]"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}

      {/* Company Info & Contact Dialog Modals */}
      <CompanyModals
        isOpen={companyModal.isOpen}
        type={companyModal.type}
        onClose={() => setCompanyModal((prev) => ({ ...prev, isOpen: false }))}
        onNavigateToAbout={() => setActiveTab('about')}
      />
    </header>
  );
};
