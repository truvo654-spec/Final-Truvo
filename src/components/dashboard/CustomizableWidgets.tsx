import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Trash2,
  Move,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Gem,
  DollarSign,
  ArrowRight,
  Calculator,
  ExternalLink,
} from 'lucide-react';
import { DashboardSlot } from '../../types/dashboardWidgets';
import { UserProfile, MarketSignal, Broker, Mission } from '../../types';
import { InstrumentAnalysisWidget } from './InstrumentAnalysisWidget';
import { MissionCardWidget } from './MissionCardWidget';
import { LiveInteractiveSparkline } from './LiveInteractiveSparkline';
import { BorderBeam } from '../ui/BorderBeam';
import { getNextTierInfo, LEVEL_SCENARIOS, LevelScenarioId } from '../../data/levelScenarios';


interface CustomizableWidgetProps {
  slot: DashboardSlot;
  isCustomizeMode: boolean;
  onEmptySlot: () => void;
  onClickSlot: () => void;
  user: UserProfile;
  signals: MarketSignal[];
  brokers: Broker[];
  onOpenViewPlan: () => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onNavigateToTab: (tab: string) => void;
  onSelectLevelScenario?: (scenarioId: LevelScenarioId) => void;
  missions?: Mission[];
  onUpdateMissions?: (missions: Mission[]) => void;
}

/**
 * Ghost Outline Badge matching Rookie
 */
function RookieGhostIcon() {
  return (
    <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
      <svg
        viewBox="0 0 70 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <path
          d="M 12 40 C 12 18, 22 8, 35 8 C 48 8, 58 18, 58 40 L 58 64 C 58 68, 54 70, 50 67 C 46 64, 43 64, 40 68 C 37 72, 33 72, 30 68 C 27 64, 24 64, 20 67 C 16 70, 12 68, 12 64 Z"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx="27" cy="34" rx="3" ry="5" fill="white" />
        <ellipse cx="43" cy="34" rx="3" ry="5" fill="white" />
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
      <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="55,16 28,60 50,60 45,104 74,54 52,54" fill="none" stroke="white" strokeWidth="5" />
          <circle cx="76" cy="30" r="4" fill="#CAEB0E" stroke="none" />
          <circle cx="24" cy="85" r="4" fill="#CAEB0E" stroke="none" />
        </svg>
      </div>
    );
  }
  if (tierLevel === 2) {
    return (
      <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
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
 * Mini Sparkline (Upgraded with LiveInteractiveSparkline)
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
      width={46}
      height={18}
    />
  );
}

export const CustomizableWidget: React.FC<CustomizableWidgetProps> = ({
  slot,
  isCustomizeMode,
  onEmptySlot,
  onClickSlot,
  user,
  signals,
  brokers,
  onOpenViewPlan,
  onOpenConnectModal,
  onSelectSignal,
  onNavigateToTab,
  onSelectLevelScenario,
  missions,
  onUpdateMissions,
}) => {
  // Live auto-interactive signal ticker
  const [tickedSignalTicker, setTickedSignalTicker] = useState<string | null>(null);
  const [signalLiveDeltas, setSignalLiveDeltas] = useState<Record<string, number>>({
    'EUR/USD': 0,
    'S&P 500': 0,
  });

  useEffect(() => {
    if (slot.type !== 'most-recent-signals') return;
    const interval = setInterval(() => {
      const keys = ['EUR/USD', 'S&P 500'];
      const picked = keys[Math.floor(Math.random() * keys.length)];
      setTickedSignalTicker(picked);
      setSignalLiveDeltas((prev) => {
        const delta = (Math.random() > 0.4 ? 1 : -1) * +(Math.random() * 0.04 + 0.01).toFixed(2);
        return {
          ...prev,
          [picked]: +((prev[picked] || 0) + delta).toFixed(2),
        };
      });
      const timer = setTimeout(() => setTickedSignalTicker(null), 950);
      return () => clearTimeout(timer);
    }, 2800);
    return () => clearInterval(interval);
  }, [slot.type]);

  // Current user tier points & next tier calculation
  const currentPoints = user.currentPoints ?? 50;
  const maxPoints = user.maxPoints || 100;
  const progressPercent = Math.min(100, Math.max(0, (currentPoints / maxPoints) * 100));
  const nextInfo = getNextTierInfo(user.tierLevel || 1, currentPoints);
  const nextLevelText = nextInfo.isMaxLevel
    ? 'Max Level Reached'
    : `Next level at ${nextInfo.pointsNeeded} Points`;

  // ─── EMPTY SLOT ───
  if (slot.type === 'empty') {
    return (
      <div
        onClick={onClickSlot}
        className="w-full h-full min-h-[240px] rounded-2xl border-2 border-dashed border-indigo-200/90 bg-white/70 hover:bg-indigo-50/50 hover:border-[#5945F1] transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center gap-3 select-none group shadow-2xs relative"
      >
        <div className="w-9 h-9 rounded-full bg-indigo-100/80 text-[#5945F1] group-hover:bg-[#5945F1] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-xs font-bold text-[#5945F1] group-hover:underline">
          Move or Add Widget Here
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          Click to choose from widget library
        </span>
      </div>
    );
  }

  // Common Wrapper in edit mode: Purple border matching New.png
  const borderClasses = isCustomizeMode
    ? 'border-2 border-[#8b5cf6] shadow-sm relative group'
    : 'border border-slate-200/80 shadow-2xs';

  return (
    <div className={`rounded-2xl h-full flex flex-col justify-between transition-all ${borderClasses}`}>
      {/* Edit Mode Remove Badge */}
      {isCustomizeMode && (
        <div className="absolute -top-2.5 -right-2.5 z-20 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEmptySlot();
            }}
            title="Remove widget"
            className="w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ─── 1. LEVEL CARD (ROOKIE) - Matching image.png ─── */}
      {slot.type === 'level-card' && (
        <div className="bg-[#5945F1] rounded-2xl p-5 text-white flex flex-col justify-between h-full relative overflow-hidden shadow-xs">
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
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-black text-2xl text-white tracking-tight leading-tight group-hover:underline">
                  {user.rankTitle || 'Rookie'}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95 mt-1">
                  <Gem className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{currentPoints.toLocaleString()}/{maxPoints.toLocaleString()} points.</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/25 rounded-full h-2 mt-4 mb-2.5 overflow-hidden">
              <div
                className="h-full bg-[#FE01B1] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-white/90">
              <span className="font-medium">{nextLevelText}</span>
              <button
                onClick={onOpenViewPlan}
                className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#5945F1] font-bold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer active:scale-95 shrink-0"
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
              <span className="text-amber-300 text-sm leading-none">⚡</span>
              <span>Higher Confidence Signals</span>
            </div>
            <div className="pt-1 text-[11px] text-white/70 font-normal select-none">
              showing data of {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. SAVED CALCULATORS ─── */}
      {slot.type === 'saved-calculators' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
          <div>
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Saved Calculators<span className="text-[#FD02B0]">.</span>
              </h3>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-100">
              <span>2 of 2 Slots</span>
              <button
                onClick={() => onNavigateToTab('leverage-calculator')}
                className="text-[#5945F1] hover:underline font-semibold cursor-pointer"
              >
                Break limits →
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Item 1 */}
              <div
                onClick={() => onNavigateToTab('forex-calculator')}
                className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5945F1] shrink-0 font-bold text-xs">
                    $
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0b1c30]">Forex Result 1</div>
                    <div className="text-[10px] text-slate-400">Forex • Nov 28</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Item 2 */}
              <div
                onClick={() => onNavigateToTab('leverage-calculator')}
                className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-[#FD02B0] shrink-0 font-bold text-xs">
                    $
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0b1c30]">High-Risk 50:1</div>
                    <div className="text-[10px] text-slate-400">Forex • Nov 28</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('leverage-calculator')}
            className="text-xs font-bold text-[#5945F1] hover:underline pt-1 text-center"
          >
            Open All 10 Calculators
          </button>
        </div>
      )}

      {/* ─── 3. MOST RECENT SIGNALS ─── */}
      {slot.type === 'most-recent-signals' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Most Recent Signals<span className="text-[#FD02B0]">.</span>
              </h3>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Signal 1: EUR/USD */}
              {(() => {
                const isTicked = tickedSignalTicker === 'EUR/USD';
                const val = +(0.33 + (signalLiveDeltas['EUR/USD'] || 0)).toFixed(2);
                const isPos = val >= 0;
                return (
                  <div
                    onClick={() => {
                      const s = signals.find((i) => i.ticker === 'EUR/USD') || signals[0];
                      if (s) onSelectSignal(s);
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-xs ${
                      isTicked
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                      <span>🇪🇺</span>
                      <span>EUR/USD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MiniSparkline trend={isPos ? 'up' : 'down'} color={isPos ? '#16a34a' : '#ef4444'} isTicked={isTicked} />
                      <motion.span
                        animate={isTicked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        className={`font-bold font-mono ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}
                      >
                        {isPos ? '+' : ''}{val.toFixed(2)}%
                      </motion.span>
                      <motion.span
                        animate={isTicked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                        className="px-2 py-0.5 rounded bg-[#CAEB0E] text-slate-950 font-black text-[10px]"
                      >
                        Buy
                      </motion.span>
                    </div>
                  </div>
                );
              })()}

              {/* Signal 2: BTC/USD */}
              <div
                onClick={() => {
                  const s = signals.find((i) => i.ticker === 'BTC/USD') || signals[0];
                  if (s) onSelectSignal(s);
                }}
                className="p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-100 flex items-center justify-between transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#0b1c30]">₿ BTC/USD</span>
                  <span className="text-[10px] text-slate-400 font-medium">Higher levels only.</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenViewPlan();
                  }}
                  className="px-2.5 py-0.5 rounded border border-[#FD02B0] text-[#FD02B0] hover:bg-pink-50 font-bold text-[10px]"
                >
                  Plans
                </button>
              </div>

              {/* Signal 3: S&P 500 */}
              {(() => {
                const isTicked = tickedSignalTicker === 'S&P 500';
                const val = +(-0.11 + (signalLiveDeltas['S&P 500'] || 0)).toFixed(2);
                const isPos = val >= 0;
                return (
                  <div
                    onClick={() => {
                      const s = signals.find((i) => i.ticker.includes('S&P') || i.ticker.includes('500')) || signals[1];
                      if (s) onSelectSignal(s);
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-xs ${
                      isTicked
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                      <span className="w-4 h-4 rounded-full bg-[#E11928] text-white flex items-center justify-center text-[7px] font-black">
                        500
                      </span>
                      <span>S&P 500</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MiniSparkline trend={isPos ? 'up' : 'down'} color={isPos ? '#16a34a' : '#ef4444'} isTicked={isTicked} />
                      <motion.span
                        animate={isTicked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        className={`font-bold font-mono ${isPos ? 'text-emerald-600' : 'text-[#5945F1]'}`}
                      >
                        {isPos ? '+' : ''}{val.toFixed(2)}%
                      </motion.span>
                      <motion.span
                        animate={isTicked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                        className="px-2 py-0.5 rounded bg-[#5945F1] text-white font-black text-[10px]"
                      >
                        Sell
                      </motion.span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('signals')}
            className="text-xs font-bold text-slate-600 hover:text-[#5945F1] pt-1 text-center transition-colors flex items-center justify-center gap-1"
          >
            <span>View All Signals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── 4. WINNING SIGNALS ─── */}
      {slot.type === 'winning-signals' && (
        <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-[#0b1c30]">
                Your <span className="text-[#5945F1]">Winning Signals.</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('signals')}
                className="text-[11px] font-bold text-slate-500 hover:text-[#5945F1] flex items-center"
              >
                <span>All Signals</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Signals from your actual money-makers.</p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold">🇪🇺 EUR/USD</div>
                <div className="text-emerald-600 font-bold font-mono text-[11px] mt-1">+0.33%</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold">🇬🇧 Dow Jones</div>
                <div className="text-[#5945F1] font-bold font-mono text-[11px] mt-1">-0.11%</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold">🇦🇺 AUDUSD</div>
                <div className="text-emerald-600 font-bold font-mono text-[11px] mt-1">+0.44%</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold">₿ BTC/USD</div>
                <div className="text-[#FD02B0] font-black text-[10px] mt-1">Your next win?</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. TOPS EARNING POINTS ─── */}
      {slot.type === 'tops-earning-points' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-[#0b1c30]">
              Tops Earning Points<span className="text-[#FD02B0]">.</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Get rewarded for your usual assets.</p>

            <div className="space-y-2 mt-2.5">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="font-bold">🇪🇺 EUR/USD</span>
                <span className="font-bold text-[#5945F1]">50 pts</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="font-bold">🔍 GOOGL</span>
                <span className="font-bold text-[#5945F1]">35 pts</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="font-bold">🪙 XAU/USD</span>
                <span className="font-bold text-[#5945F1]">20 pts</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('points-credits')}
            className="w-full py-2 rounded-xl bg-[#5945F1] hover:bg-[#492CED] text-white font-bold text-xs text-center cursor-pointer"
          >
            View More Points →
          </button>
        </div>
      )}

      {/* ─── 6. CONNECTED BROKERS HUB ─── */}
      {slot.type === 'connected-brokers' && (
        <div className="bg-gradient-to-r from-purple-50/40 via-white to-pink-50/40 dark:from-[#170345] dark:to-[#170345] rounded-2xl p-5 flex flex-col justify-between h-full space-y-3 relative overflow-hidden border border-indigo-100/70 dark:border-indigo-950/70">
          <BorderBeam
            borderWidth={1.5}
            duration={8}
            colorFrom="#5945F1"
            colorTo="#FD02B0"
          />
          <div>
            <h3 className="font-display font-extrabold text-base text-[#5945F1]">
              More Connected Brokers. More Opportunities.
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect broker partners to earn max rebates on every lot.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
              {brokers.slice(0, 3).map((b) => (
                <div key={b.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                  <div className="font-bold text-xs text-[#0b1c30]">{b.name}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">${b.maxCashbackRate}/lot</div>
                  <button
                    onClick={() => onOpenConnectModal(b)}
                    className="w-full py-1 rounded-lg bg-[#5945F1] text-white text-[10px] font-bold"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('brokers')}
            className="text-xs font-bold text-[#FD02B0] hover:underline text-center"
          >
            Explore All Brokers →
          </button>
        </div>
      )}

      {/* ─── 7. INSTRUMENT ANALYSIS WIDGET ─── */}
      {slot.type === 'instrument-analysis' && (
        <div className="w-full h-full">
          <InstrumentAnalysisWidget
            size={slot.size}
            onNavigateToTab={onNavigateToTab}
          />
        </div>
      )}

      {/* ─── 8. MISSION CARD WIDGET ─── */}
      {slot.type === 'mission-card' && (
        <div className="w-full h-full">
          <MissionCardWidget
            size={slot.size}
            missions={missions}
            onUpdateMissions={onUpdateMissions}
            onNavigateToTab={onNavigateToTab}
          />
        </div>
      )}
    </div>
  );
};
