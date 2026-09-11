import React, { useState } from 'react';
import { UserProfile, ActivityLogItem } from '../types';
import {
  Filter,
  Calendar,
  ChevronDown,
  ArrowLeft,
  X,
  Trophy,
  Sparkles,
  TimerOff,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';

/* ─── 3D Graphic: Star with Upward Arrow ─── */
function StarWithUpArrowIcon() {
  return (
    <div className="w-12 h-12 shrink-0 relative flex items-center justify-center">
      <svg viewBox="0 0 48 48" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="starBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="45%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 3D Multi-faceted Star */}
        <g filter="url(#starShadow)">
          {/* Main 5-Point Star with soft rounded bevels */}
          <path
            d="M 24,5 
               L 29,17 
               L 42,17 
               L 31.5,25 
               L 35.5,38 
               L 24,30 
               L 12.5,38 
               L 16.5,25 
               L 6,17 
               L 19,17 Z"
            fill="url(#starBodyGrad)"
            stroke="#c7d2fe"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Facet Shading on Left Wings */}
          <path d="M 24,5 L 24,30 L 12.5,38 L 16.5,25 L 6,17 L 19,17 Z" fill="#4f46e5" fillOpacity="0.18" />
          <path d="M 24,5 L 29,17 L 24,30 Z" fill="#e0e7ff" fillOpacity="0.45" />

          {/* Upward Arrow Inside Star */}
          <g transform="translate(16, 15)">
            <path
              d="M 8,0 L 14,7 L 10.5,7 L 10.5,15 L 5.5,15 L 5.5,7 L 2,7 Z"
              fill="url(#arrowGrad)"
              stroke="#ffffff"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ─── 3D Graphic: Faceted Diamond (Points) ─── */
function FacetedDiamondIcon() {
  return (
    <div className="w-12 h-12 shrink-0 relative flex items-center justify-center">
      <svg viewBox="0 0 48 48" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="actGemMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="35%" stopColor="#60a5fa" />
            <stop offset="70%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="gemGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.2" />
          </filter>
        </defs>

        <g filter="url(#gemGlow)">
          {/* Crown Facets */}
          <polygon points="12,12 36,12 44,22 36,22 12,22 4,22" fill="#c7d2fe" />
          <polygon points="12,12 36,12 30,22 18,22" fill="url(#actGemMain)" />
          <polygon points="4,22 12,12 18,22" fill="#818cf8" />
          <polygon points="36,12 44,22 30,22" fill="#ec4899" />

          {/* Pavilion (Bottom Cone) Facets */}
          <polygon points="4,22 18,22 24,40" fill="#6366f1" />
          <polygon points="18,22 30,22 24,40" fill="#4f46e5" />
          <polygon points="30,22 44,22 24,40" fill="#d946ef" />

          {/* Highlights & Reflection */}
          <polygon points="14,14 24,14 20,20 15,20" fill="#ffffff" fillOpacity="0.6" />
          <line x1="18" y1="22" x2="24" y2="40" stroke="#a5b4fc" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="30" y1="22" x2="24" y2="40" stroke="#f472b6" strokeWidth="0.8" strokeOpacity="0.7" />
        </g>
      </svg>
    </div>
  );
}

/* ─── 3D Graphic: Coins Stack (Credits) ─── */
function CreditCoinsIcon() {
  return (
    <div className="w-12 h-12 shrink-0 relative flex items-center justify-center">
      <svg viewBox="0 0 48 48" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="coinStackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <filter id="coinStackShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5945F1" floodOpacity="0.2" />
          </filter>
        </defs>

        <g filter="url(#coinStackShadow)">
          {/* Back Coin */}
          <g transform="translate(4, 4)">
            <ellipse cx="20" cy="18" rx="14" ry="7" fill="#c7d2fe" />
            <path d="M 6,18 C 6,22 12,25 20,25 C 28,25 34,22 34,18 L 34,23 C 34,27 28,30 20,30 C 12,30 6,27 6,23 Z" fill="#818cf8" />
            <ellipse cx="20" cy="18" rx="12" ry="5.5" fill="#6366f1" stroke="#e0e7ff" strokeWidth="0.7" />
          </g>

          {/* Front Coin */}
          <g transform="translate(10, 12)">
            <ellipse cx="18" cy="16" rx="15" ry="8" fill="#bef264" />
            <path d="M 3,16 C 3,21 10,25 18,25 C 26,25 33,21 33,16 L 33,22 C 33,27 26,31 18,31 C 10,31 3,27 3,22 Z" fill="#84cc16" />
            <ellipse cx="18" cy="16" rx="13" ry="6.5" fill="#5945F1" stroke="#c7d2fe" strokeWidth="0.8" />
            <circle cx="18" cy="16" r="2.8" fill="#c6f831" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ─── Background Orbit Graphic (Top Right) ─── */
function OrbitBackgroundGraphic() {
  return (
    <div className="absolute right-4 top-2 sm:right-12 sm:top-0 w-44 h-44 sm:w-56 sm:h-56 pointer-events-none select-none -z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          {/* Large Gradient Sphere: Magenta to Indigo */}
          <radialGradient id="spherePinkIndigo" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ff70d9" />
            <stop offset="45%" stopColor="#FE01B1" />
            <stop offset="100%" stopColor="#5945F1" />
          </radialGradient>
          {/* Small Indigo Sphere */}
          <radialGradient id="sphereIndigo" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4338ca" />
          </radialGradient>
          <filter id="sphereShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="6" stdDeviation="6" floodColor="#FE01B1" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Faint Dotted Orbit Circle */}
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="#f1b5ea"
          strokeWidth="1.6"
          strokeDasharray="4 4"
          strokeOpacity="0.75"
        />

        {/* Small Floating Indigo Sphere (Left on orbit) */}
        <circle cx="48" cy="74" r="11" fill="url(#sphereIndigo)" />

        {/* Large Floating Gradient Sphere (Lower Right on orbit) */}
        <g filter="url(#sphereShadow)">
          <circle cx="138" cy="128" r="26" fill="url(#spherePinkIndigo)" />
        </g>
      </svg>
    </div>
  );
}

interface ActivityLogsViewProps {
  user: UserProfile;
  activityLogs: ActivityLogItem[];
  onBackToMissions: () => void;
  onNavigateToSignals?: () => void;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({
  user,
  activityLogs,
  onBackToMissions,
  onNavigateToSignals,
}) => {
  // Filter states
  const [selectedRange, setSelectedRange] = useState<'Past 7 Days' | 'Past 30 Days' | 'This Month' | 'All Time'>('Past 7 Days');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true); // initially open matching image, toggleable
  const [isDateMenuOpen, setIsDateMenuOpen] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [movementFilter, setMovementFilter] = useState<string>('All');

  // Accordion expanded sections
  const [isTodayExpanded, setIsTodayExpanded] = useState<boolean>(true);
  const [isYesterdayExpanded, setIsYesterdayExpanded] = useState<boolean>(false);
  const [isEarlierExpanded, setIsEarlierExpanded] = useState<boolean>(false);

  // Group logs by timeframes
  const todayLogs = [
    {
      id: 'today-1',
      title: 'Points expired',
      subtitle: '',
      pointsChange: -25,
      creditsChange: null,
      time: '10:30 am',
      type: 'expired',
      category: 'Expirations',
    },
    {
      id: 'today-2',
      title: 'Completed first trade',
      subtitle: 'First trade completed successfully',
      pointsChange: 10,
      creditsChange: 35,
      time: '10:30 am',
      type: 'trade',
      category: 'Trades & Rebates',
    },
    {
      id: 'today-3',
      title: 'Daily login',
      subtitle: 'Logged in to the app',
      pointsChange: null,
      creditsChange: 5,
      time: '10:30 am',
      type: 'login',
      category: 'Daily Check-in',
    },
    {
      id: 'today-4',
      title: "Viewed today's Signals",
      subtitle: 'Checked daily signals feed',
      pointsChange: null,
      creditsChange: 5,
      time: '10:30 am',
      type: 'signals',
      category: 'Missions',
    },
  ];

  const yesterdayLogs = [
    {
      id: 'yesterday-1',
      title: 'Connected Broker Account: Exness Pro',
      subtitle: 'Account #EX-9281048 verified & synced',
      pointsChange: 20,
      creditsChange: 30,
      time: '04:15 pm',
      type: 'trade',
      category: 'Trades & Rebates',
    },
    {
      id: 'yesterday-2',
      title: 'Daily Streak Check-In (Day 14)',
      subtitle: 'Maintained consecutive login milestone',
      pointsChange: 5,
      creditsChange: 5,
      time: '09:12 am',
      type: 'login',
      category: 'Daily Check-in',
    },
  ];

  const earlierLogs = [
    {
      id: 'earlier-1',
      title: 'Converted Syde Credits to Points',
      subtitle: 'Exchanged 500 credits for 100 points',
      pointsChange: 100,
      creditsChange: -500,
      time: 'Apr 23, 2026',
      type: 'trade',
      category: 'Conversions',
    },
    {
      id: 'earlier-2',
      title: 'Completed Mission: Portfolio Power-Up',
      subtitle: 'Rebalanced holdings & diversified across classes',
      pointsChange: 15,
      creditsChange: 25,
      time: 'Apr 22, 2026',
      type: 'signals',
      category: 'Missions',
    },
  ];

  // Helper to filter items based on Category & Movement
  const filterList = (items: typeof todayLogs) => {
    return items.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }
      if (movementFilter === 'In (+)') {
        const hasPositive = (item.pointsChange && item.pointsChange > 0) || (item.creditsChange && item.creditsChange > 0);
        if (!hasPositive) return false;
      } else if (movementFilter === 'Out (-)') {
        const hasNegative = (item.pointsChange && item.pointsChange < 0) || (item.creditsChange && item.creditsChange < 0);
        if (!hasNegative) return false;
      } else if (movementFilter === 'Points Only') {
        if (item.pointsChange === null) return false;
      } else if (movementFilter === 'Credits Only') {
        if (item.creditsChange === null) return false;
      }
      return true;
    });
  };

  const filteredToday = filterList(todayLogs);
  const filteredYesterday = filterList(yesterdayLogs);
  const filteredEarlier = filterList(earlierLogs);

  return (
    <div className="w-full space-y-7 pb-16 relative">
      {/* ─── Back to Missions Navigation Bar ─── */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBackToMissions}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#5945F1] transition-colors cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-white border border-indigo-100 flex items-center justify-center group-hover:border-[#5945F1] group-hover:bg-indigo-50/50 shadow-2xs transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#5945F1]" />
          </div>
          <span>Back to Mission, Points & Credits</span>
        </button>

        <div className="text-xs font-semibold text-slate-400 hidden sm:block">
          Synchronized in real-time
        </div>
      </div>

      {/* ─── Hero Header & Orbit Decorative Art ─── */}
      <div className="relative pt-2 pb-1">
        <OrbitBackgroundGraphic />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-none">
            <span className="text-[#5945F1]">Activity </span>
            <span className="text-[#FE01B1]">Logs</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
            A complete record of every point you’ve earned and credit you’ve spent.
          </p>
        </div>
      </div>

      {/* ─── Filter & Date Control Row (Result: Past 7 Days) ─── */}
      <div className="flex items-center justify-between relative z-20 pt-1">
        {/* Left: Result Tag */}
        <div className="text-xs sm:text-sm text-slate-600">
          Result: <strong className="text-slate-900 font-bold">{selectedRange}</strong>
        </div>

        {/* Right: Action Buttons + Filter Dropdown */}
        <div className="flex items-center gap-2 relative">
          {/* Funnel Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isFilterOpen
                ? 'bg-[#5945F1] text-white ring-2 ring-[#5945F1]/30'
                : 'bg-[#5945F1] text-white hover:bg-[#432ec4]'
            }`}
            title="Filter activities"
          >
            <Filter className="w-4 h-4 fill-white" />
          </button>

          {/* Calendar Button */}
          <button
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="w-9 h-9 rounded-xl bg-white border border-indigo-200/90 text-[#5945F1] hover:bg-indigo-50/70 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            title="Select date range"
          >
            <Calendar className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Date Range Dropdown */}
          {isDateMenuOpen && (
            <div className="absolute right-0 top-11 z-30 w-44 bg-white rounded-xl border border-indigo-100 shadow-lg p-1.5 space-y-0.5">
              {(['Past 7 Days', 'Past 30 Days', 'This Month', 'All Time'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedRange(range);
                    setIsDateMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedRange === range
                      ? 'bg-indigo-50 text-[#5945F1]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{range}</span>
                  {selectedRange === range && <Check className="w-3.5 h-3.5 text-[#5945F1]" />}
                </button>
              ))}
            </div>
          )}

          {/* ── Filter Popover Dropdown (Exact Match to Design) ── */}
          {isFilterOpen && (
            <div className="absolute right-0 top-11 z-30 w-72 sm:w-80 bg-white rounded-2xl border border-indigo-200/90 shadow-xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Category Dropdown */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-800 block">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm text-slate-700 font-normal focus:outline-none focus:border-[#5945F1] focus:ring-1 focus:ring-[#5945F1] shadow-2xs"
                  >
                    <option value="All">All</option>
                    <option value="Trades & Rebates">Trades & Rebates</option>
                    <option value="Missions">Missions</option>
                    <option value="Daily Check-in">Daily Check-in</option>
                    <option value="Expirations">Expirations</option>
                    <option value="Conversions">Conversions</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Movement Dropdown */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-800 block">
                  Movement
                </label>
                <div className="relative">
                  <select
                    value={movementFilter}
                    onChange={(e) => setMovementFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm text-slate-700 font-normal focus:outline-none focus:border-[#5945F1] focus:ring-1 focus:ring-[#5945F1] shadow-2xs"
                  >
                    <option value="All">All</option>
                    <option value="In (+)">In (+) Earning</option>
                    <option value="Out (-)">Out (-) Expired / Spent</option>
                    <option value="Points Only">Points Only</option>
                    <option value="Credits Only">Credits Only</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Done Button */}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-2.5 rounded-xl border border-indigo-200/90 text-[#5945F1] font-bold text-xs sm:text-sm hover:bg-indigo-50/70 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Summary 3 Cards Row (Activities this week | Points this week | Credits this week) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 items-stretch">
        {/* Card 1: Activities this week */}
        <div className="rounded-2xl border border-indigo-100/90 bg-white p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
          <StarWithUpArrowIcon />
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#1e1b4b] leading-tight">
              24
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Activities this week
            </div>
          </div>
        </div>

        {/* Card 2: Points this week */}
        <div className="rounded-2xl border border-indigo-100/90 bg-white p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
          <FacetedDiamondIcon />
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#5945F1] leading-tight">
              +29
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Points this week
            </div>
          </div>
        </div>

        {/* Card 3: Credits this week */}
        <div className="rounded-2xl border border-indigo-100/90 bg-white p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
          <CreditCoinsIcon />
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#5945F1] leading-tight">
              +35
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Credits this week
            </div>
          </div>
        </div>
      </div>

      {/* ─── Activity Log Accordion Table Sections ─── */}
      <div className="space-y-5 pt-1">
        {/* ═══ SECTION 1: Today – Apr 26, 2026 ═══ */}
        <div className="rounded-2xl overflow-hidden border border-indigo-100/80 shadow-2xs bg-white">
          {/* Header Bar */}
          <div
            onClick={() => setIsTodayExpanded(!isTodayExpanded)}
            className="w-full bg-[#edf0fe] px-5 sm:px-6 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#e6eafd] transition-colors select-none"
          >
            <div className="text-xs sm:text-sm font-semibold text-[#5945F1]">
              Today – Apr 26, 2026
            </div>

            <div className="flex items-center gap-6 sm:gap-10">
              <div className="text-xs sm:text-sm font-medium text-[#5945F1]">
                -15 Points
              </div>
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center text-[#5945F1] font-bold text-lg"
                aria-label="Toggle section"
              >
                {isTodayExpanded ? '—' : '+'}
              </button>
            </div>
          </div>

          {/* Rows List */}
          {isTodayExpanded && (
            <div className="divide-y divide-slate-100">
              {filteredToday.length === 0 ? (
                <div className="py-8 text-center text-xs sm:text-sm text-slate-400">
                  No activities match your current filter.
                </div>
              ) : (
                filteredToday.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Left: Icon + Title & Subtitle */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Icon */}
                      {item.type === 'expired' && (
                        <div className="w-10 h-10 rounded-xl bg-[#fce7f3] flex items-center justify-center text-[#FE01B1] shrink-0">
                          <TimerOff className="w-5 h-5 stroke-[2]" />
                        </div>
                      )}
                      {item.type === 'trade' && (
                        <div className="w-10 h-10 rounded-xl bg-[#e0e7ff] flex items-center justify-center text-[#5945F1] shrink-0">
                          <Trophy className="w-5 h-5 stroke-[2]" />
                        </div>
                      )}
                      {(item.type === 'login' || item.type === 'signals') && (
                        <div className="w-10 h-10 rounded-xl bg-[#ecfccb] flex items-center justify-center text-[#65a30d] shrink-0">
                          <Sparkles className="w-5 h-5 stroke-[2]" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {item.subtitle ? (
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Columns: Points | Credits | Timestamp */}
                    <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                      {/* Points Column */}
                      <div className="w-14 sm:w-16 text-right">
                        {item.pointsChange !== null ? (
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              item.pointsChange < 0 ? 'text-[#5945F1]' : 'text-[#5945F1]'
                            }`}
                          >
                            {item.pointsChange > 0 ? `+${item.pointsChange}` : item.pointsChange}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </div>

                      {/* Credits Column */}
                      <div className="w-14 sm:w-16 text-right">
                        {item.creditsChange !== null ? (
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              item.creditsChange > 0 ? 'text-[#FE01B1]' : 'text-[#FE01B1]'
                            }`}
                          >
                            {item.creditsChange > 0 ? `+${item.creditsChange}` : item.creditsChange}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </div>

                      {/* Timestamp Column */}
                      <div className="w-16 sm:w-20 text-right text-xs text-slate-500 font-normal">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ═══ SECTION 2: Yesterday – Apr 25, 2026 ═══ */}
        <div className="rounded-2xl overflow-hidden border border-indigo-100/80 shadow-2xs bg-white">
          {/* Header Bar */}
          <div
            onClick={() => setIsYesterdayExpanded(!isYesterdayExpanded)}
            className="w-full bg-[#edf0fe] px-5 sm:px-6 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#e6eafd] transition-colors select-none"
          >
            <div className="text-xs sm:text-sm font-semibold text-[#5945F1]">
              Yesterday – Apr 25, 2026
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
                <span className="text-[#5945F1]">+25 Points</span>
                <span className="text-[#FE01B1]">+35 Credits</span>
              </div>
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center text-[#5945F1] font-bold text-lg"
                aria-label="Toggle section"
              >
                {isYesterdayExpanded ? '—' : '+'}
              </button>
            </div>
          </div>

          {/* Rows List */}
          {isYesterdayExpanded && (
            <div className="divide-y divide-slate-100">
              {filteredYesterday.length === 0 ? (
                <div className="py-8 text-center text-xs sm:text-sm text-slate-400">
                  No activities match your current filter.
                </div>
              ) : (
                filteredYesterday.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Left: Icon + Title & Subtitle */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {item.type === 'trade' && (
                        <div className="w-10 h-10 rounded-xl bg-[#e0e7ff] flex items-center justify-center text-[#5945F1] shrink-0">
                          <Trophy className="w-5 h-5 stroke-[2]" />
                        </div>
                      )}
                      {item.type === 'login' && (
                        <div className="w-10 h-10 rounded-xl bg-[#ecfccb] flex items-center justify-center text-[#65a30d] shrink-0">
                          <Sparkles className="w-5 h-5 stroke-[2]" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {item.subtitle ? (
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Columns: Points | Credits | Timestamp */}
                    <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                      <div className="w-14 sm:w-16 text-right">
                        {item.pointsChange !== null ? (
                          <span className="text-xs sm:text-sm font-bold text-[#5945F1]">
                            +{item.pointsChange}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </div>

                      <div className="w-14 sm:w-16 text-right">
                        {item.creditsChange !== null ? (
                          <span className="text-xs sm:text-sm font-bold text-[#FE01B1]">
                            +{item.creditsChange}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </div>

                      <div className="w-16 sm:w-20 text-right text-xs text-slate-500 font-normal">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ═══ SECTION 3: Earlier (Apr 23, 2026) ═══ */}
        <div className="rounded-2xl overflow-hidden border border-indigo-100/80 shadow-2xs bg-white">
          {/* Header Bar */}
          <div
            onClick={() => setIsEarlierExpanded(!isEarlierExpanded)}
            className="w-full bg-[#edf0fe] px-5 sm:px-6 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#e6eafd] transition-colors select-none"
          >
            <div className="text-xs sm:text-sm font-semibold text-[#5945F1]">
              Earlier – Apr 23, 2026
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
                <span className="text-[#5945F1]">+115 Points</span>
                <span className="text-[#FE01B1]">-475 Credits</span>
              </div>
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center text-[#5945F1] font-bold text-lg"
                aria-label="Toggle section"
              >
                {isEarlierExpanded ? '—' : '+'}
              </button>
            </div>
          </div>

          {/* Rows List */}
          {isEarlierExpanded && (
            <div className="divide-y divide-slate-100">
              {filteredEarlier.length === 0 ? (
                <div className="py-8 text-center text-xs sm:text-sm text-slate-400">
                  No activities match your current filter.
                </div>
              ) : (
                filteredEarlier.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#e0e7ff] flex items-center justify-center text-[#5945F1] shrink-0">
                        <Trophy className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {item.subtitle ? (
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                      <div className="w-14 sm:w-16 text-right">
                        {item.pointsChange !== null ? (
                          <span className="text-xs sm:text-sm font-bold text-[#5945F1]">
                            {item.pointsChange > 0 ? `+${item.pointsChange}` : item.pointsChange}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </div>

                      <div className="w-14 sm:w-16 text-right">
                        {item.creditsChange !== null ? (
                          <span className="text-xs sm:text-sm font-bold text-[#FE01B1]">
                            {item.creditsChange > 0 ? `+${item.creditsChange}` : item.creditsChange}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </div>

                      <div className="w-16 sm:w-20 text-right text-xs text-slate-500 font-normal">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
