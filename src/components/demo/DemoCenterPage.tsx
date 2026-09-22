import React, { useState } from 'react';
import {
  Play,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Award,
  Layers,
  Activity,
  Sliders,
  Wallet,
} from 'lucide-react';
import { UserProfile, Broker, MarketSignal } from '../../types';
import { LEVEL_SCENARIOS, LevelScenarioId } from '../../data/levelScenarios';

interface DemoCenterPageProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  isLoggedIn: boolean;
  onToggleAuthState: (loggedIn: boolean) => void;
  onSelectLevelScenario: (scenarioId: LevelScenarioId) => void;
  onAddDemoPoints: () => void;
  onResetDemoData: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onShowToast?: (msg: string) => void;
}

export const DemoCenterPage: React.FC<DemoCenterPageProps> = ({
  user,
  brokers,
  signals,
  isLoggedIn,
  onToggleAuthState,
  onSelectLevelScenario,
  onAddDemoPoints,
  onResetDemoData,
  onNavigateToTab,
  onOpenSignIn,
  onOpenSignUp,
  onShowToast,
}) => {
  const [simLots, setSimLots] = useState<number>(10);
  const [simBroker, setSimBroker] = useState<string>(brokers[0]?.id || 'xm-ultra');

  const selectedBroker = brokers.find((b) => b.id === simBroker) || brokers[0];
  const boost = user.boostPercentage || 0;
  const calculatedRebate = (simLots * (selectedBroker?.cashbackPerLot || 8) * (1 + boost / 100)).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── Hero Header ─── */}
      <div className="bg-gradient-to-r from-[#5945F1]/10 via-purple-50 to-white border border-[#5945F1]/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5945F1]/10 text-[#5945F1] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Sandbox & Demo Hub</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b1c30]">
            MarketSyde Platform Demo
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Experience the complete trader journey. Test tier progressions, simulate live cashback earnings, toggle guest vs. member states, and explore all premium features in real-time.
          </p>
        </div>

        {/* Quick state indicators */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2 min-w-[240px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                isLoggedIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isLoggedIn ? '● Signed In' : '○ Guest Mode'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Rank & Level:</span>
            <span className="font-bold text-[#5945F1]">
              Level {user.tierLevel} · {user.rankTitle}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Syde Points:</span>
            <span className="font-mono font-bold text-slate-800">{user.sydePoints} pts</span>
          </div>
        </div>
      </div>

      {/* ─── Control Panels Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Auth State Switcher */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-[#5945F1]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0b1c30]">
                  Authentication Mode
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle between Guest and Signed-In trader experience
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When in Guest mode, signals and broker trade actions guide visitors through preview or sign-in flows. Signed-in mode unlocks personalized perks.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onToggleAuthState(!isLoggedIn);
                onShowToast?.(
                  !isLoggedIn
                    ? 'Switched to Signed-In Trader mode'
                    : 'Switched to Guest / Visitor mode'
                );
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isLoggedIn
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{isLoggedIn ? 'Switch to Guest Mode' : 'Switch to Signed In Mode'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenSignIn}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                Open Sign In Modal
              </button>
              <button
                onClick={onOpenSignUp}
                className="w-full py-2 rounded-xl border border-indigo-200 text-[#5945F1] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer"
              >
                Open Sign Up Modal
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Tier & Rank Scenario Switcher */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0b1c30]">
                  Trader Tier Progression
                </h3>
                <p className="text-xs text-slate-500">
                  Instantly switch between Tier 1 through Tier 4
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {LEVEL_SCENARIOS.map((sc) => {
                const isActive = user.tierLevel === sc.level;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      onSelectLevelScenario(sc.id);
                      onShowToast?.(`Applied Level ${sc.level}: ${sc.label} Tier scenario`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#5945F1] bg-[#5945F1]/5 ring-1 ring-[#5945F1]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0b1c30]">{sc.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">Lv.{sc.level}</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                      +{sc.boostPercentage}% Boost
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onAddDemoPoints();
                onShowToast?.('🎉 +25 Syde Points added to your account!');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5945F1] hover:bg-[#4338ca] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Add +25 Points (Level Up Demo)</span>
            </button>
          </div>
        </div>

        {/* Card 3: Rebate & Cashback Simulator */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0b1c30]">
                  Rebate Calculator Demo
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate live cashback based on tier boost
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                  <span>Selected Broker:</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    ${selectedBroker?.cashbackPerLot || 8}/lot
                  </span>
                </label>
                <select
                  value={simBroker}
                  onChange={(e) => setSimBroker(e.target.value)}
                  className="mt-1 w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                >
                  {brokers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (${b.cashbackPerLot}/lot)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Monthly Lots:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{simLots} lots</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={simLots}
                  onChange={(e) => setSimLots(parseInt(e.target.value, 10))}
                  className="w-full accent-[#5945F1] cursor-pointer mt-1"
                />
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">Calculated Payout</div>
                  <div className="text-lg font-black text-[#5945F1] font-mono">
                    ${calculatedRebate}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  +{boost}% Boost
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('cashback-overview')}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Cashback Station</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Platform Feature Tour Section ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0b1c30]">
            Explore Key Platform Features
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jump directly into any section to verify functionality, layout, and responsiveness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateToTab('signals')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#5945F1] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5945F1] flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                Trading Signals
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Alpha radar, 16 market signals, confidence scores, and unlock scenarios.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-[#5945F1] gap-1">
              <span>Inspect Signals</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('brokers')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#5945F1] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                Broker Directory
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Verified broker rankings, rebate schedules, connect flow, and reviews.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 gap-1">
              <span>View Brokers</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('member-plan')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#5945F1] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                Membership Plans
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tier comparisons, cashback multipliers, unlock thresholds, and FAQs.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-purple-600 gap-1">
              <span>View Plans</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('leverage-calculator')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#5945F1] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Sliders className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                Trading Calculators
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                17 institutional-grade calculators including Leverage, Pip, SL/TP, and Margin.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-600 gap-1">
              <span>Launch Calculators</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Reset Demo State ─── */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        <span>Need a clean slate? Reset all simulated demo points, unlocked signals, and mock trades:</span>
        <button
          onClick={() => {
            onResetDemoData();
            onShowToast?.('Demo state successfully reset to initial defaults');
          }}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Defaults</span>
        </button>
      </div>
    </div>
  );
};
