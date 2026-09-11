import React, { useState } from 'react';
import { Broker, UserProfile } from '../../types';
import {
  Search,
  Filter,
  Check,
  ExternalLink,
  ArrowUpRight,
  Info,
  ChevronRight,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react';

interface BrokerListPageProps {
  brokers: Broker[];
  user: UserProfile;
  onSelectBrokerDetail: (broker: Broker) => void;
  onConnectBroker: (broker: Broker) => void;
  onOpenComparison?: (broker?: Broker) => void;
  onOpenViewPlan?: () => void;
  onShowToast?: (msg: string) => void;
}

export const BrokerListPage: React.FC<BrokerListPageProps> = ({
  brokers,
  user,
  onSelectBrokerDetail,
  onConnectBroker,
  onOpenComparison,
  onOpenViewPlan,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cashback' | 'toppick' | 'verified'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Connection tasks in the right sidebar (Pick up where you left off)
  const [inProgressBrokers, setInProgressBrokers] = useState([
    {
      id: 'axi',
      name: 'Axi',
      stepTitle: 'Account approved?',
      subtext: 'If ready, continue to next step',
      progressStep: 2, // step 2 of 3
      logoBg: 'bg-[#ff0033]',
      logoText: 'axi',
    },
    {
      id: 'vt-markets',
      name: 'VT Markets',
      stepTitle: 'IB approved?',
      subtext: 'If ready, continue to next step',
      progressStep: 2,
      logoBg: 'bg-[#0f172a]',
      logoText: 'W',
    },
    {
      id: 'avatrade',
      name: 'AvaTrade',
      stepTitle: 'IB Transfer approved?',
      subtext: 'If ready, continue to next step',
      progressStep: 2,
      logoBg: 'bg-[#002f6c]',
      logoText: 'AVA TRADE',
    },
  ]);

  const handleDismissTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInProgressBrokers((prev) => prev.filter((b) => b.id !== id));
    onShowToast?.('Task dismissed');
  };

  const filteredBrokers = brokers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.platforms.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.regulations.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'cashback') return b.hasCashback !== false;
    if (filterType === 'toppick') return b.isTopPick;
    if (filterType === 'verified') return b.verified;

    return true;
  });

  // Render stylized SVG/Logo badge for brokers
  const renderBrokerLogo = (broker: Broker) => {
    const name = broker.name.toLowerCase();
    if (name.includes('hfm')) {
      return (
        <div className="w-14 h-14 rounded-xl bg-black flex flex-col items-center justify-center text-white shrink-0 p-1 shadow-xs">
          <span className="font-extrabold text-base tracking-tighter leading-none">HFM</span>
          <span className="text-[7px] text-red-500 font-bold tracking-widest mt-0.5">HF MARKETS</span>
        </div>
      );
    }
    if (name.includes('xm')) {
      return (
        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shrink-0 shadow-xs relative overflow-hidden p-1">
          <span className="font-black text-2xl tracking-tighter flex items-center">
            <span className="text-[#E60000] font-black">X</span>
            <span className="text-white font-black">M</span>
          </span>
        </div>
      );
    }
    if (name.includes('exness')) {
      return (
        <div className="w-14 h-14 rounded-xl bg-[#FEE600] flex items-center justify-center text-black shrink-0 shadow-xs">
          <span className="font-black text-2xl tracking-tighter lowercase font-mono">ex</span>
        </div>
      );
    }
    if (name.includes('ic markets')) {
      return (
        <div className="w-14 h-14 rounded-xl bg-black flex flex-col items-center justify-center text-white shrink-0 p-1 shadow-xs">
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-3 bg-[#00FF66] rounded-xs" />
            <div className="w-1.5 h-4 bg-[#00FF66] rounded-xs" />
            <div className="w-1.5 h-2 bg-[#00FF66] rounded-xs" />
            <span className="font-bold text-xs ml-0.5">IC</span>
          </div>
          <span className="text-[7px] text-slate-300 font-semibold tracking-wider">Markets Global</span>
        </div>
      );
    }
    if (name.includes('pepperstone')) {
      return (
        <div className="w-14 h-14 rounded-xl bg-[#0052FF] flex flex-col items-center justify-center text-white shrink-0 p-1 shadow-xs">
          <span className="font-black text-xl leading-none">P</span>
          <span className="text-[7px] tracking-tight font-medium mt-0.5">pepperstone</span>
        </div>
      );
    }
    if (name.includes('fxpro')) {
      return (
        <div className="w-14 h-14 rounded-xl bg-[#D92525] flex flex-col items-center justify-center text-white shrink-0 p-1 shadow-xs text-center">
          <span className="font-extrabold text-sm leading-none">FxPro</span>
          <span className="text-[6px] text-white/90 leading-tight mt-0.5">Trade Like a Pro</span>
        </div>
      );
    }
    return (
      <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs font-bold text-base">
        {broker.name.slice(0, 3).toUpperCase()}
      </div>
    );
  };

  return (
    <div id="broker-list-landing-page" className="w-full space-y-8 pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER SECTION (Exact typography: Partner Brokers.)
         ───────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-3 pt-2">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#0b1c30]">
          <span className="text-[#5945F1]">Partner Broker</span>
          <span className="text-[#FD02B0]">s</span>
          <span className="text-[#CAEB0E]">.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          Explore trusted brokers, discover trading conditions, and find cashback opportunities that fit your trading style.
        </p>

        {/* Search Bar & Filter Button */}
        <div className="flex items-center justify-center gap-2.5 pt-2 relative">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Brokers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5945F1] focus:ring-2 focus:ring-[#5945F1]/10 shadow-2xs transition-all"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                filterType !== 'all'
                  ? 'border-[#5945F1] bg-[#5945F1] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-[#5945F1] hover:border-[#5945F1]/40'
              }`}
              title="Filter Brokers"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-20 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setFilterType('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'all' ? 'bg-[#5945F1]/10 text-[#5945F1] font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  All Brokers
                </button>
                <button
                  onClick={() => {
                    setFilterType('cashback');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'cashback' ? 'bg-[#5945F1]/10 text-[#5945F1] font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  With Cashback
                </button>
                <button
                  onClick={() => {
                    setFilterType('toppick');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'toppick' ? 'bg-[#5945F1]/10 text-[#5945F1] font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Top Picks
                </button>
                <button
                  onClick={() => {
                    setFilterType('verified');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'verified' ? 'bg-[#5945F1]/10 text-[#5945F1] font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Verified Only
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT: 2-COLUMN LAYOUT (BROKER CARDS & RIGHT SIDEBAR)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: BROKER CARDS GRID (8 COLS ON LG) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredBrokers.map((broker) => {
              const hasCashback = broker.hasCashback !== false;
              return (
                <div
                  key={broker.id}
                  onClick={() => onSelectBrokerDetail(broker)}
                  className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#5945F1] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[350px] relative hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Row: Logo & Broker Name & Score & Badges */}
                    <div className="flex items-start gap-3 mb-4">
                      {renderBrokerLogo(broker)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-bold text-lg text-[#0b1c30] group-hover:text-[#5945F1] transition-colors truncate">
                            {broker.name}
                          </h3>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <span className="font-bold text-[#5945F1]">{broker.score || 9.75}</span>
                          <span>Score</span>
                          <Info className="w-3 h-3 text-slate-400" />
                        </div>

                        {/* Badges: Verified (Lime) & Top Pick (Pink) */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {broker.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black text-[10px] font-extrabold tracking-tight">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Verified</span>
                            </span>
                          )}
                          {broker.isTopPick && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FD02B0] text-white text-[10px] font-bold tracking-tight shadow-2xs">
                              Top Pick
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Broker Conditions Bullets (Blue/Purple colored values matching design) */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">• Min Deposit :</span>
                        <span className="font-semibold text-[#5945F1]">{broker.minDeposit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">• Max Leverage :</span>
                        <span className="font-semibold text-[#5945F1]">{broker.maxLeverage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">• Platforms :</span>
                        <span className="font-semibold text-[#5945F1] text-right truncate max-w-[150px]">
                          {broker.platforms.slice(0, 3).join(' • ')}
                        </span>
                      </div>
                    </div>

                    {/* Tags: Regulation & Cashback Status */}
                    <div className="space-y-1.5 mb-4">
                      {/* Regulation Tag */}
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#5945F1] text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                          <span>{broker.regulations[0] || 'Tier 1 Regulated'}</span>
                        </span>
                      </div>

                      {/* Cash Back Tag (Only for brokers with cashback) */}
                      {hasCashback ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EEFBEA] text-[#16A34A] text-[11px] font-semibold">
                            <span>$ Cash Back: {broker.maxCashback}</span>
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                            <span>● Partner Direct (No Cashback)</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions Row: Compare | Trade Now | External Link Button (Exact match to image.png) */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenComparison) {
                          onOpenComparison(broker);
                        } else {
                          onShowToast?.(`Comparing ${broker.name}...`);
                        }
                      }}
                      className="text-xs font-semibold text-slate-800 hover:text-[#5945F1] transition-colors cursor-pointer py-1.5 px-1 flex items-center gap-1 active:scale-95"
                    >
                      Compare
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onConnectBroker(broker);
                        }}
                        className="px-5 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4834df] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        Trade Now
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBrokerDetail(broker);
                        }}
                        className="p-2 rounded-xl border border-slate-200 hover:border-[#5945F1]/40 text-[#5945F1] hover:bg-slate-50 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <ArrowUpRight className="w-4 h-4 text-[#5945F1]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBrokers.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <p className="text-slate-600 font-medium text-sm">No brokers matched your search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#5945F1] text-white text-xs font-bold hover:bg-[#4834df]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT SIDEBAR (4 COLS ON LG) (Exact match to Landing Page design)
           ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. LEVEL PROMOTION CARD (Move up. Earn More.) */}
          <div className="bg-white rounded-2xl border-2 border-[#FD02B0]/90 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-black text-xl text-[#0b1c30] tracking-tight">
                Move up. Earn More<span className="text-[#FD02B0]">.</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Keep trading to climb levels and boost cashback.
              </p>
            </div>

            {/* Stepper with "You" Pin */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                {/* Step 1: Rookie with "You" bubble */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-[#5945F1] text-white text-[10px] font-black tracking-wider shadow-xs">
                    You
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#5945F1] rotate-45" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#5945F1] border-2 border-white shadow-xs flex items-center justify-center text-white" />
                  <span className="text-xs font-extrabold text-[#FD02B0] mt-1.5">Rookie</span>
                </div>

                {/* Line connector */}
                <div className="w-12 h-0.5 bg-slate-300" />

                {/* Step 2: Climber */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-[#5945F1] bg-white" />
                  <span className="text-xs font-bold text-[#5945F1] mt-1.5">Climber</span>
                </div>
              </div>

              {/* View Plan Button */}
              <button
                type="button"
                onClick={() => onOpenViewPlan?.()}
                className="px-4 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4834df] text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                View Plan
              </button>
            </div>
          </div>

          {/* 2. PICK UP WHERE YOU LEFT OFF CARD */}
          <div className="bg-[#f8fafc] rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-[#0b1c30] tracking-tight">
                  Pick up <span className="font-medium text-slate-700">where you left off</span>
                  <span className="text-[#FD02B0]">.</span>
                </h3>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your account connection to access tiered trading cashback.
              </p>
            </div>

            {/* Task Items List */}
            <div className="space-y-4 divide-y divide-slate-200/80">
              {inProgressBrokers.map((task) => (
                <div key={task.id} className="pt-4 first:pt-0 space-y-2.5">
                  <div className="flex items-start gap-3">
                    {/* Brand Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl ${task.logoBg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}
                    >
                      {task.logoText}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#0b1c30] leading-tight">{task.stepTitle}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.subtext}</p>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center flex-1 gap-1">
                      {/* Dot 1 */}
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5945F1]" />
                      <div className="flex-1 h-0.5 bg-[#FD02B0]" />
                      {/* Dot 2 */}
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FD02B0]" />
                      <div className="flex-1 h-0.5 bg-slate-300" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                      Register Account
                    </span>
                  </div>

                  {/* Action Buttons: Continue (Lime) & Dismiss */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const brokerObj = brokers.find((b) => b.id === task.id) || brokers[0];
                        onConnectBroker(brokerObj);
                      }}
                      className="px-3.5 py-1.5 rounded-md bg-[#CAEB0E] hover:bg-[#b5d50c] text-black font-extrabold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      Continue
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDismissTask(task.id, e)}
                      className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}

              {inProgressBrokers.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400">
                  All connection tasks completed! 🎉
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
