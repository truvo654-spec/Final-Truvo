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
import { CalculatorType } from './calculators/TradingCalculatorsModal';
import { useTheme } from '../theme/ThemeContext';

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
  onOpenCalculator?: (calcType: CalculatorType) => void;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { theme, setTheme, toggleTheme } = useTheme();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[56px] h-[68px] flex items-center justify-between relative">
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
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5945F1] flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform shrink-0">
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
                  activeHoverMenu === 'trade' || activeTab === 'dashboard' || activeTab === 'signals' || activeTab === 'signal-detail'
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
                  activeHoverMenu === 'brokers' || activeTab === 'brokers'
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

            {/* Member Plan Link (Direct text link, NO chevron, matching Total Nav Bar.png) */}
            <button
              onClick={() => {
                onOpenViewPlan();
                handleCloseImmediately();
              }}
              className="text-slate-800 hover:text-[#5945F1] transition-colors py-1 cursor-pointer"
            >
              Member Plan
            </button>

            {/* Company Dropdown Trigger */}
            <div
              className="relative py-4"
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  handleCloseImmediately();
                }}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  activeHoverMenu === 'company' || activeTab === 'leaderboard' || activeTab === 'community' || activeTab === 'points-credits'
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
                  placeholder="Signal"
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

          {/* Quick Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#170345] hover:border-[#5945F1] text-slate-600 dark:text-[#CCC6FB] hover:text-[#5945F1] dark:hover:text-[#ABA1F8] flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
            title={theme === 'light' ? 'Switch to Dark Theme (Figma Tokens)' : 'Switch to Light Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 stroke-[1.8]" />
            ) : (
              <Sun className="w-4 h-4 stroke-[1.8] text-[#DCF73B]" />
            )}
          </button>

          {/* User Profile Pill & Dropdown Menu (if logged in) OR Guest Buttons (if not logged in) */}
          {isLoggedIn ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  setIsProfileMenuOpen((prev) => !prev);
                  handleCloseImmediately();
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer ${
                  isProfileMenuOpen
                    ? 'border-[#5945F1] ring-2 ring-[#5945F1]/15'
                    : 'border-indigo-200/90 hover:border-indigo-300'
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
                  {/* Purple notification dot floating on top-right corner */}
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5945F1] absolute -top-1 -right-1 ring-2 ring-white" />
                </div>

                {/* Name + Rank with Purple Ghost Icon */}
                <div className="leading-tight pr-1">
                  <div className="text-xs sm:text-[13px] font-semibold text-[#0b1c30]">
                    Hi, {user.username}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                    {/* Custom Purple Ghost Icon matching Total Nav Bar.png */}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-[#5945F1] fill-none stroke-current shrink-0"
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

            {/* Profile Dropdown Menu - Exact match to image.png */}
            {isProfileMenuOpen && (
              <div className="absolute top-full right-0 mt-2.5 w-[275px] max-w-[calc(100vw-24px)] bg-white rounded-[22px] border border-indigo-100/90 shadow-2xl shadow-indigo-950/15 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
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
              </div>
            )}
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

            <div className="w-full max-w-[940px] bg-white rounded-[26px] p-3.5 shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-stretch gap-2">
              {/* Left Feature Illustration Banner (Soft Tinted Rounded Container) */}
              <div className="w-full md:w-[56%] bg-[#eff3fa] rounded-[22px] p-6 sm:p-7 flex items-center justify-between relative overflow-hidden shrink-0">
                {/* Left Typography Block */}
                <div className="flex flex-col space-y-1 select-none z-10">
                  <span className="text-[13px] sm:text-sm font-extrabold tracking-wider text-[#3b5bfd] uppercase font-display">
                    REAL BROKER
                  </span>
                  <span className="text-[13px] sm:text-sm font-extrabold tracking-wider text-[#3b5bfd] uppercase font-display">
                    COMPARISONS THAT
                  </span>
                  <span className="text-base sm:text-[17px] font-black tracking-widest text-[#4f46e5] uppercase font-display">
                    ACTUALLY MATTER.
                  </span>
                </div>

                {/* Interactive 3D Orbiting Broker Arena */}
                <InteractiveBrokersGraphic />
              </div>

              {/* Right Menu Options */}
              <div className="w-full md:w-[44%] pl-7 pr-6 py-6 flex flex-col justify-center space-y-7">
                {/* 1. Broker List (with solid purple bullet) */}
                <button
                  onClick={() => {
                    setActiveTab('brokers');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  {/* Purple solid circular bullet */}
                  <div className="w-5 h-5 rounded-full bg-[#5338ec] flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Broker List
                    </div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                      The ultimate broker directory. No blind dates, just total transparency.
                    </div>
                  </div>
                </button>

                {/* 2. Broker Comparison */}
                <button
                  onClick={() => {
                    if (onOpenBrokerComparison) {
                      onOpenBrokerComparison();
                    } else {
                      setActiveTab('brokers');
                    }
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#5338ec] group-hover:bg-[#5338ec]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#5338ec] transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Broker Comparison
                    </div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                      A head-to-head battle for your money.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            HOVER MEGA MENU: TRADE
           ───────────────────────────────────────────────────────────── */}
        {activeHoverMenu === 'trade' && (
          <div
            className="absolute top-full left-0 right-0 pt-2 z-50 flex justify-center animate-in fade-in zoom-in-98 duration-150"
            onMouseEnter={() => handleMouseEnter('trade')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Bridging shield */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="w-full max-w-[960px] bg-white rounded-[26px] p-3.5 shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-stretch gap-3">
              {/* Left Feature Illustration Banner matching Navigation Menu Content 2.png */}
              <div className="w-full md:w-[48%] bg-[#bef226] rounded-[22px] p-6 sm:p-7 flex items-center justify-between relative overflow-hidden shrink-0 shadow-inner">
                <div className="flex flex-col select-none z-10 space-y-0.5">
                  <span className="text-[12px] sm:text-[13px] font-bold tracking-tight text-[#0f172a] uppercase leading-tight font-sans">
                    SPOT OPPORTUNITIES
                  </span>
                  <span className="text-[12px] sm:text-[13px] font-bold tracking-tight text-[#0f172a] uppercase leading-tight font-sans">
                    AND MANAGE RISK
                  </span>
                  <span className="text-sm sm:text-[15px] font-black tracking-tight text-[#000000] uppercase leading-tight font-sans mt-0.5">
                    WITH PRECISION
                  </span>
                </div>

                {/* Interactive Orbital Graphic with 4 Floating Feature Squircles */}
                <InteractiveTradeGraphic
                  onSelectCalculator={(calcType) => {
                    onOpenCalculator?.(calcType);
                    handleCloseImmediately();
                  }}
                  onSelectSignals={() => {
                    setActiveTab('signals');
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

              {/* Right Menu Options matching Navigation Menu Content 2.png */}
              <div className="w-full md:w-[52%] pl-6 pr-5 py-4 flex flex-col justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Column 1: Products */}
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-slate-700 font-sans">
                      Products
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveTab('signals');
                          handleCloseImmediately();
                        }}
                        className="text-left group transition-all"
                      >
                        <div className="font-bold text-[15px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                          Trading Signals
                        </div>
                        <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          Skip the charts. Get instant buy/sell cues.
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Tools */}
                  <div className="space-y-5">
                    <div className="text-sm font-medium text-slate-700 font-sans">
                      Tools
                    </div>

                    {/* Section: Trading Calculators */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#3b5bfd] shrink-0" />
                        <span className="font-bold text-[14px] text-[#0b1c30]">
                          Trading Calculators
                        </span>
                      </div>

                      <ul className="space-y-1.5 pl-6 text-xs">
                        <li>
                          <button
                            onClick={() => {
                              setActiveTab('leverage-calculator');
                              handleCloseImmediately();
                            }}
                            className="text-[#5030e5] font-bold hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-[#FD02B0] font-black">•</span> Leverage Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setActiveTab('volatility-calculator');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-slate-400">•</span> Volatility Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setActiveTab('spread-calculator');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-slate-400">•</span> Spread Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setActiveTab('pip-calculator');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-slate-400">•</span> Pip Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setActiveTab('margin-calculator');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-slate-400">•</span> Margin Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setActiveTab('rebate-calculator');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-slate-400">•</span> Rebate Calculator
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('planning');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
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
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
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
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-slate-400">•</span> Performance Calculator
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Section: Converter Calculators */}
                    <div className="space-y-2 pt-1">
                      <div className="font-bold text-[14px] text-[#0b1c30]">
                        Converter Calculators
                      </div>

                      <ul className="space-y-1.5 pl-2 text-xs">
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('timezone');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
                          >
                            <span className="text-slate-400">•</span> Trading Timezone Converter
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              onOpenCalculator?.('currency');
                              handleCloseImmediately();
                            }}
                            className="text-slate-600 hover:text-[#5030e5] hover:underline flex items-center gap-1.5 text-left"
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
            HOVER MEGA MENU: COMMUNITY (NEW DEDICATED SUB-MENU FLOW)
           ───────────────────────────────────────────────────────────── */}
        {activeHoverMenu === 'community' && (
          <div
            className="absolute top-full left-0 right-0 pt-2 z-50 flex justify-center animate-in fade-in zoom-in-98 duration-150"
            onMouseEnter={() => handleMouseEnter('community')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Bridging shield */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="w-full max-w-[940px] bg-white rounded-[26px] p-3.5 shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-stretch gap-2">
              {/* Left Feature Illustration Banner */}
              <div className="w-full md:w-[56%] bg-[#eff3fa] rounded-[22px] p-6 sm:p-7 flex items-center justify-between relative overflow-hidden shrink-0">
                <div className="flex flex-col space-y-1 select-none z-10">
                  <span className="text-[13px] sm:text-sm font-extrabold tracking-wider text-[#3b5bfd] uppercase font-display">
                    COMMUNITY ALPHA
                  </span>
                  <span className="text-[13px] sm:text-sm font-extrabold tracking-wider text-[#3b5bfd] uppercase font-display">
                    CONNECTING
                  </span>
                  <span className="text-base sm:text-[17px] font-black tracking-widest text-[#4f46e5] uppercase font-display">
                    SMART TRADERS.
                  </span>
                </div>

                {/* Interactive Live Community Sphere with Sentiment & Chat */}
                <InteractiveCommunityGraphic />
              </div>

              {/* Right Menu Options */}
              <div className="w-full md:w-[44%] pl-7 pr-6 py-4 flex flex-col justify-center space-y-4">
                {/* 1. Community Floor & Feeds */}
                <button
                  onClick={() => {
                    setActiveTab('community');
                    onSelectCommunitySubTab?.('feeds');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-[#5338ec] flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Community Feeds
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Live trader streams, verified setup charts, and member market alpha.
                    </div>
                  </div>
                </button>

                {/* 2. Debate Topics & Polls */}
                <button
                  onClick={() => {
                    setActiveTab('community');
                    onSelectCommunitySubTab?.('topics');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#5338ec] group-hover:bg-[#5338ec]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#5338ec] transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Debate Topics & Polls
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Active macro theses, community debates, and daily sentiment voting.
                    </div>
                  </div>
                </button>

                {/* 3. Research Articles & Spread Tests */}
                <button
                  onClick={() => {
                    setActiveTab('community');
                    onSelectCommunitySubTab?.('articles');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#5338ec] group-hover:bg-[#5338ec]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#5338ec] transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Articles & Broker Audits
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      In-depth quant studies, live slippage audits, and trading strategies.
                    </div>
                  </div>
                </button>

                {/* 4. Trader Leaderboard */}
                <button
                  onClick={() => {
                    setActiveTab('leaderboard');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#5338ec] group-hover:bg-[#5338ec]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#5338ec] transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight flex items-center gap-1.5">
                      <span>Weekly Leaderboard</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#c6f831]/20 text-emerald-800 font-bold">
                        $1,750 Pool
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Compete for cash rewards, reputation badges, and tier upgrades.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            HOVER MEGA MENU: COMPANY
           ───────────────────────────────────────────────────────────── */}
        {activeHoverMenu === 'company' && (
          <div
            className="absolute top-full left-0 right-0 pt-2 z-50 flex justify-center animate-in fade-in zoom-in-98 duration-150"
            onMouseEnter={() => handleMouseEnter('company')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Bridging shield */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="w-full max-w-[940px] bg-white rounded-[26px] p-3.5 shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-stretch gap-2">
              {/* Left Feature Illustration Banner */}
              <div className="w-full md:w-[56%] bg-[#eff3fa] rounded-[22px] p-6 sm:p-7 flex items-center justify-between relative overflow-hidden shrink-0">
                <div className="flex flex-col space-y-1 select-none z-10">
                  <span className="text-[13px] sm:text-sm font-extrabold tracking-wider text-[#3b5bfd] uppercase font-display">
                    GROW WITH OUR
                  </span>
                  <span className="text-[13px] sm:text-sm font-extrabold tracking-wider text-[#3b5bfd] uppercase font-display">
                    COMMUNITY OF
                  </span>
                  <span className="text-base sm:text-[17px] font-black tracking-widest text-[#4f46e5] uppercase font-display">
                    ACTIVE TRADERS.
                  </span>
                </div>

                {/* Interactive Trophy & Leaderboard Arena */}
                <InteractiveCompanyGraphic />
              </div>

              {/* Right Menu Options */}
              <div className="w-full md:w-[44%] pl-7 pr-6 py-6 flex flex-col justify-center space-y-7">
                <button
                  onClick={() => {
                    setActiveTab('community');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-[#5338ec] flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Community Floor
                    </div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Live discussions, real-time trader sentiment, and verified setup ideas.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('leaderboard');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#5338ec] group-hover:bg-[#5338ec]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#5338ec] transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Weekly Leaderboard
                    </div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Compete with top traders for weekly cash prize pools and prestige.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('points-credits');
                    handleCloseImmediately();
                  }}
                  className="group flex items-start gap-3.5 text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#5338ec] group-hover:bg-[#5338ec]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#5338ec] transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-[#0b1c30] group-hover:text-[#5338ec] transition-colors leading-tight">
                      Points & Syde Credits
                    </div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Level up through trader tiers, complete missions, and redeem rewards.
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
              onOpenViewPlan();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 text-left text-sm font-semibold text-[#5338ec]"
          >
            Member Plan
          </button>

          {/* Theme switcher for mobile */}
          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-[#230674] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">Theme</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#230674] rounded-lg">
              <button
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  theme === 'light' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  theme === 'dark' ? 'bg-[#5945F1] text-white shadow-2xs' : 'text-slate-500 dark:text-[#8A7AF6] hover:text-white'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
