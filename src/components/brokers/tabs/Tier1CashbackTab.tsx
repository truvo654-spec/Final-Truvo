import React, { useState, useId } from 'react';
import { Broker, UserProfile } from '../../../types';
import { BROKER_ACCOUNT_SPECS, TIER_MULTIPLIERS } from '../brokerConstants';
import { Sparkles, ArrowRight, UserPlus, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface Tier1CashbackTabProps {
  broker: Broker;
  user: UserProfile;
  onOpenViewPlan?: () => void;
  onRegisterPrompt: () => void;
}

export const Tier1CashbackTab: React.FC<Tier1CashbackTabProps> = ({
  broker,
  user,
  onOpenViewPlan,
  onRegisterPrompt,
}) => {
  const [selectedAccountType, setSelectedAccountType] = useState<string>('Standard');
  const [dailyLotsInput, setDailyLotsInput] = useState<string>('5');
  const lotsInputId = useId();

  const activeSpec =
    BROKER_ACCOUNT_SPECS.find((s) => s.name === selectedAccountType) || BROKER_ACCOUNT_SPECS[1];
  const numDailyLots = parseFloat(dailyLotsInput) || 0;
  const baseRate = activeSpec.baseCashbackRate;

  // Tier 1 calculation: starts at baseline Rookie (1.0x), but previews Boss (1.5x)
  const rookieDaily = numDailyLots * baseRate * TIER_MULTIPLIERS.Rookie;
  const rookieWeekly = rookieDaily * 5;
  const rookieMonthly = rookieDaily * 22;
  const rookieAnnual = rookieDaily * 260;

  const bossMonthly = numDailyLots * baseRate * TIER_MULTIPLIERS.Boss * 22;

  return (
    <div id="tier1-cashback-scenario" className="space-y-10 animate-in fade-in duration-200">
      {/* ─── 1. Guest Incentive Callout Banner ─── */}
      <div className="bg-gradient-to-r from-[#F0EDFF] via-[#fdf4ff] to-[#F0EDFF] border border-[#5945F1]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#5945F1] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-[#CAEB0E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5945F1]">
                Unregistered Visitor Preview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black text-[10px] font-black">
                Tier 1
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              You are viewing baseline rates. Register your free MarketSyde account to unlock up to{' '}
              <strong className="text-slate-900 font-extrabold">+50% extra cashback</strong> and automated rebate tracking!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRegisterPrompt}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4b39d6] text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-[#CAEB0E]" />
          <span>Register Free Account</span>
        </button>
      </div>

      {/* ─── 2. Interactive Calculator Section (D03) ─── */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-black text-xl text-[#0b1c30]">
            See Your Potential Cashback
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Estimate your earnings with {broker.name} based on account type and daily trading volume.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Form: Account Type, Level locked preview, Lots per Day */}
          <div className="lg:col-span-7 space-y-5">
            {/* Account Type Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Account Type</label>
              <div className="flex flex-wrap items-center gap-2">
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <button
                    key={spec.name}
                    type="button"
                    onClick={() => setSelectedAccountType(spec.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedAccountType === spec.name
                        ? 'bg-[#F0EDFF] text-[#5945F1] border border-[#5945F1]/40 shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Member Level Selector & Lots per day input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Member Level Dropdown (Locked preview for Tier 1) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Member Level</label>
                  <span className="text-[10px] text-[#5945F1] font-semibold">Starts at Rookie</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Rookie (Baseline 1.0x)</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                    Free
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Higher levels (Climber, Pro, Boss) unlock after registering and trading.
                </p>
              </div>

              {/* Number of Lots per day */}
              <div className="space-y-1.5">
                <label htmlFor={lotsInputId} className="text-xs font-bold text-slate-700">
                  Number of Lots
                </label>
                <div>
                  <input
                    id={lotsInputId}
                    type="number"
                    min="0.1"
                    step="0.5"
                    placeholder="5"
                    value={dailyLotsInput}
                    onChange={(e) => setDailyLotsInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#5945F1] shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">per trading day</span>
                </div>
              </div>
            </div>

            {/* Boss Level Teaser */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">Want higher returns?</span>
                <p className="text-slate-500 text-[11px]">
                  Boss members earn <strong className="text-[#5945F1]">${bossMonthly.toFixed(0)}/mo</strong> on this same volume.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenViewPlan}
                className="text-xs font-bold text-[#5945F1] hover:underline shrink-0"
              >
                View Plans →
              </button>
            </div>
          </div>

          {/* Right Metric Boxes: 2x2 Grid (Lime and Purple Tiles) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {/* Daily Tile */}
              <div className="bg-[#CAEB0E] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs">
                <div className="font-display font-black text-xl sm:text-2xl text-black">
                  ${rookieDaily.toFixed(2)}{' '}
                  <span className="text-xs font-semibold text-black/80">/day</span>
                </div>
              </div>

              {/* Weekly Tile */}
              <div className="bg-[#5945F1] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs text-white">
                <div className="font-display font-black text-xl sm:text-2xl">
                  ${rookieWeekly.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-white/80">/week</span>
                </div>
              </div>

              {/* Monthly Tile */}
              <div className="bg-[#5945F1] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs text-white">
                <div className="font-display font-black text-xl sm:text-2xl">
                  ${rookieMonthly.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-white/80">/month</span>
                </div>
              </div>

              {/* Annual Tile */}
              <div className="bg-[#5945F1] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs text-white">
                <div className="font-display font-black text-xl sm:text-2xl">
                  ${rookieAnnual.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-white/80">/annual</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              Estimated on {selectedAccountType} (${baseRate.toFixed(2)}/lot base rate)
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Cashback Breakdown Table ─── */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-display font-black text-xl text-[#0b1c30]">
            {broker.name} Cashback Rates by Account Type
          </h3>
          <button
            type="button"
            onClick={onOpenViewPlan}
            className="text-xs font-bold text-[#5945F1] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Learn how member ranks boost rates by up to 50% →</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-indigo-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-100 text-slate-700 bg-slate-50/50">
                <th className="py-4 px-6 font-bold w-44">Asset Class</th>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <th key={spec.name} className="py-4 px-6 font-bold text-center text-[#5945F1]">
                    {spec.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              <tr>
                <td className="py-5 px-6 font-bold text-slate-900">Forex Majors</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-5 px-6 text-center font-black text-[#5945F1] text-base">
                    ${spec.baseCashbackRate.toFixed(2)}
                    <span className="text-xs text-slate-500 font-normal">/Lot</span>
                    {spec.isHighestCashback && (
                      <span className="block px-2 py-0.5 rounded-full bg-[#FD02B0] text-white text-[9px] font-bold mt-1 mx-auto w-fit">
                        Highest
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-5 px-6 font-bold text-slate-900">Gold &amp; Commodities</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-5 px-6 text-center font-bold text-slate-800 text-sm">
                    ${(spec.baseCashbackRate * 0.9).toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal">/Lot</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. How It Works for Unregistered Users ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
        <h4 className="font-display font-black text-lg text-[#0b1c30]">
          How to Get Cashback with {broker.name}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#5945F1] text-white font-black text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-900">Create Free Account</h5>
              <p className="text-xs text-slate-500 mt-1">
                Register on MarketSyde in 30 seconds. No credit card required, free forever.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#5945F1] text-white font-black text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-900">Open or Link Broker</h5>
              <p className="text-xs text-slate-500 mt-1">
                Open a new account or link your existing {broker.name} account under our partner code.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#CAEB0E] text-black font-black text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-900">Receive Weekly Rebates</h5>
              <p className="text-xs text-slate-500 mt-1">
                Trade as usual. Automated cashback is credited weekly with zero extra spread.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onRegisterPrompt}
            className="px-8 py-3 rounded-xl bg-[#5945F1] hover:bg-[#4b39d6] text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Register Now to Start Earning</span>
            <ArrowRight className="w-4 h-4 text-[#CAEB0E]" />
          </button>
        </div>
      </div>
    </div>
  );
};
