import React, { useState } from 'react';
import {
  UserProfile,
  Broker,
  MarketSignal,
  QuickStep,
  PerformanceTimeframeData,
  LeaderboardUser,
} from '../types';
import { LevelTrackerCard } from './LevelTrackerCard';
import { PerformanceSection } from './PerformanceSection';
import { QuickStartGuide } from './QuickStartGuide';
import { SignalsList } from './SignalsList';
import { LeaderboardCard } from './LeaderboardCard';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Zap,
  Clock,
  Trophy,
  Users,
  Radio,
  ChevronRight,
  Percent,
} from 'lucide-react';

interface DashboardBentoGridProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  quickSteps: QuickStep[];
  performanceData: Record<'1D' | '1W' | '1M' | 'All', PerformanceTimeframeData>;
  leaderboardUsers: LeaderboardUser[];
  onOpenViewPlan: () => void;
  onAddDemoPoints: () => void;
  onStepClick: (stepIndex: number) => void;
  onToggleStep: (stepIndex: number) => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onOpenLedger: () => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardBentoGrid: React.FC<DashboardBentoGridProps> = ({
  user,
  brokers,
  signals,
  quickSteps,
  performanceData,
  leaderboardUsers,
  onOpenViewPlan,
  onAddDemoPoints,
  onStepClick,
  onToggleStep,
  onOpenConnectModal,
  onOpenLedger,
  onSelectSignal,
  onNavigateToTab,
}) => {
  // Calculator state for top partner spotlight
  const [calcLots, setCalcLots] = useState<number>(10);
  const featuredBroker = brokers.find((b) => b.id === 'xm-ultra') || brokers[0];
  const calculatedMonthlyRebate = (calcLots * featuredBroker.cashbackPerLot * (1 + user.boostPercentage / 100)).toFixed(2);

  // Highest confidence signal for spotlight
  const topSignal = signals.find((s) => s.ticker === 'XAU/USD') || signals[0];

  return (
    <div className="space-y-6">
      {/* ─── BENTO GRID CONTAINER ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
        {/* ─── TILE 1: Gamified Level Tracker (Bento Hero Tile, 8 Cols) ─── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col justify-between">
          <LevelTrackerCard
            user={user}
            onOpenViewPlan={onOpenViewPlan}
            onAddDemoPoints={onAddDemoPoints}
            onNavigateToProfile={() => onNavigateToTab('profile')}
          />
        </div>

        {/* ─── TILE 2: High-Conviction Alpha Radar Spotlight (Bento 4 Cols) ─── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#5338ec]/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#5338ec]/5 rounded-full blur-xl pointer-events-none" />

          <div>
            {/* Tile Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Alpha Spotlight
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {topSignal.confidence}% Confidence
              </span>
            </div>

            {/* Asset Headline */}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{topSignal.flag}</span>
                  <h3 className="font-display font-bold text-lg text-[#0b1c30]">
                    {topSignal.ticker}
                  </h3>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md text-white ${
                      topSignal.action === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {topSignal.action}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {topSignal.name} • {topSignal.timeframe}
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-base font-bold text-[#0b1c30]">
                  ${topSignal.price > 100 ? topSignal.price.toFixed(2) : topSignal.price.toFixed(4)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">
                  +{topSignal.change24h}% (24h)
                </div>
              </div>
            </div>

            {/* Sparkline & Targets */}
            <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Target TP1:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ${topSignal.takeProfit1.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Stop Loss:</span>
                <span className="font-mono font-bold text-rose-700">
                  ${topSignal.stopLoss.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Cashback Edge:</span>
                <span className="text-[11px] font-bold text-[#5338ec]">
                  +$8.00 / lot rebate
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {topSignal.analysis}
            </p>
          </div>

          {/* CTA Trigger */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-400">1:3.8 Risk/Reward</span>
            <button
              onClick={() => onSelectSignal(topSignal)}
              className="px-3.5 py-1.5 rounded-lg bg-[#0b1c30] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 group"
            >
              <span>Inspect Setup</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ─── TILE 3: Performance Intelligence Chart (Bento 8 Cols) ─── */}
        <div className="col-span-12 lg:col-span-8">
          <PerformanceSection
            performanceData={performanceData}
            onOpenConnectModal={() => onOpenConnectModal()}
            onOpenLedger={onOpenLedger}
          />
        </div>

        {/* ─── TILE 4: Top Rebate Partner Spotlight & Live Calculator (Bento 4 Cols) ─── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5338ec]" />
                <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                  Highest Rebate Partner
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5338ec]/10 text-[#5338ec]">
                Verified 100% Payout
              </span>
            </div>

            {/* Broker Header */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={featuredBroker.logo}
                  alt={featuredBroker.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-display font-bold text-sm text-[#0b1c30]">
                    {featuredBroker.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    FSC • CySEC • ASIC
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-emerald-700 font-mono">
                  ${featuredBroker.cashbackPerLot.toFixed(2)}/lot
                </div>
                <div className="text-[10px] text-slate-400">Max Base Rebate</div>
              </div>
            </div>

            {/* Interactive Rebate Estimator */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-[#5338ec]" />
                  <span>Monthly Lots Traded:</span>
                </span>
                <span className="font-mono font-bold text-[#0b1c30] text-sm">
                  {calcLots} lots
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="1"
                max="100"
                value={calcLots}
                onChange={(e) => setCalcLots(parseInt(e.target.value, 10))}
                className="w-full accent-[#5338ec] cursor-pointer"
              />

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Estimated Cashback (+{user.boostPercentage}% Boost):
                </span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  ${calculatedMonthlyRebate}
                </span>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                Spreads from 0.0 pips
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                1:1000 Leverage
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                MT4 & MT5
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenConnectModal(featuredBroker)}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98"
          >
            <ShieldCheck className="w-4 h-4 text-[#c6f831]" />
            <span>Connect & Activate {featuredBroker.name}</span>
          </button>
        </div>

        {/* ─── TILE 5: 4-Step Onboarding Pathway (Bento 12 Cols Full Width) ─── */}
        <div className="col-span-12">
          <QuickStartGuide
            steps={quickSteps}
            onStepClick={onStepClick}
            onToggleStep={onToggleStep}
          />
        </div>

        {/* ─── TILE 6: Quantitative Signals Radar (Bento 7 Cols) ─── */}
        <div className="col-span-12 lg:col-span-7">
          <SignalsList
            signals={signals}
            onSelectSignal={onSelectSignal}
            onUpgradePrompt={onOpenViewPlan}
          />
        </div>

        {/* ─── TILE 7: Weekly Prize Pool & Community Leaderboard (Bento 5 Cols) ─── */}
        <div className="col-span-12 lg:col-span-5 space-y-4 flex flex-col justify-between">
          <LeaderboardCard
            users={leaderboardUsers}
            onOpenViewPlan={onOpenViewPlan}
          />

          {/* Community Floor Link Card */}
          <div className="bg-gradient-to-r from-[#0b1c30] to-[#1e1b4b] rounded-2xl p-4 text-white border border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5338ec]/30 border border-[#5338ec]/50 flex items-center justify-center text-white shrink-0">
                <Radio className="w-5 h-5 text-[#c6f831] animate-pulse" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Trading Floor Community</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#c6f831] text-[#0b1c30] text-[9px] font-extrabold">
                    428 LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Discuss live setups, vote on alpha, and enter lot sprints.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('community')}
              className="px-3.5 py-2 rounded-xl bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
