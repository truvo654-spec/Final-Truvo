import React, { useState, useId } from 'react';
import { Broker, UserProfile } from '../../../types';
import { BROKER_ACCOUNT_SPECS, TIER_MULTIPLIERS } from '../brokerConstants';
import { Sparkles, ChevronDown, ArrowRight, Zap, Trophy, Link2, Calendar } from 'lucide-react';

interface Tier2CashbackTabProps {
  broker: Broker;
  user: UserProfile;
  onNavigateToConnect: () => void;
  onOpenViewPlan?: () => void;
  onShowToast?: (msg: string) => void;
}

export const Tier2CashbackTab: React.FC<Tier2CashbackTabProps> = ({
  broker,
  user,
  onNavigateToConnect,
  onOpenViewPlan,
  onShowToast,
}) => {
  const [selectedAccountType, setSelectedAccountType] = useState<string>('Pro');
  const [selectedMemberLevel, setSelectedMemberLevel] = useState<string>(user.rankTitle || 'Rookie');
  const [dailyLotsInput, setDailyLotsInput] = useState<string>('10');
  const lotsInputId = useId();

  const activeSpec =
    BROKER_ACCOUNT_SPECS.find((s) => s.name === selectedAccountType) || BROKER_ACCOUNT_SPECS[3];
  const numDailyLots = parseFloat(dailyLotsInput) || 0;
  const currentBaseRate = activeSpec.baseCashbackRate;
  const currentMultiplier = TIER_MULTIPLIERS[selectedMemberLevel] || 1.0;
  const effectiveRate = currentBaseRate * currentMultiplier;

  const dailyCashback = (numDailyLots * effectiveRate).toFixed(2);
  const weeklyCashback = (numDailyLots * effectiveRate * 5).toFixed(2);
  const monthlyCashback = (numDailyLots * effectiveRate * 22).toFixed(2);
  const annualCashback = (numDailyLots * effectiveRate * 260).toFixed(2);

  return (
    <div id="tier2-cashback-scenario" className="space-y-10 animate-in fade-in duration-200">
      {/* ─── 1. Member Status & Connection Banner (D06) ─── */}
      <div className="bg-[#5945F1] text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shrink-0">
            👻
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">
                Hi, {user.username || 'Trader'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#CAEB0E] text-black text-xs font-black">
                {user.rankTitle || 'Rookie'} Member
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                Tier 2: Registered
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1">
              Your account is ready! Connect your {broker.name} account to start receiving automated cashback directly to your balance.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToConnect}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2"
        >
          <Link2 className="w-4 h-4" />
          <span>Connect {broker.name} Account</span>
        </button>
      </div>

      {/* ─── 2. Interactive Calculator Section (D06) ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-black text-xl text-[#0b1c30]">
              See Your Cashback
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimate your cashback based on account type, membership level and trading volume.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenViewPlan}
            className="text-xs font-bold text-[#5945F1] hover:underline cursor-pointer inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Level up to earn up to +50% →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Form: Account Type, Member Level, Lots per Day */}
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
              {/* Member Level Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Member Level</label>
                <div className="relative">
                  <select
                    value={selectedMemberLevel}
                    onChange={(e) => setSelectedMemberLevel(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#5945F1] shadow-2xs pr-8 cursor-pointer"
                  >
                    <option value="Rookie">Rookie (Baseline 1.0x)</option>
                    <option value="Climber">Climber (+15%)</option>
                    <option value="Pro">Pro (+25%)</option>
                    <option value="Master">Master (+35%)</option>
                    <option value="Boss">Boss (+50%)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
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
                    min="0"
                    step="0.5"
                    placeholder="10"
                    value={dailyLotsInput}
                    onChange={(e) => setDailyLotsInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#5945F1] shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">per day</span>
                </div>
              </div>
            </div>

            {/* Multiplier Info Tag */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FD02B0]" />
                <span className="text-slate-600">
                  Current Effective Rate:{' '}
                  <strong className="text-slate-900 font-extrabold">
                    ${effectiveRate.toFixed(2)} / lot
                  </strong>
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#5945F1] font-bold text-[11px]">
                {((currentMultiplier - 1) * 100).toFixed(0)}% Boost
              </span>
            </div>
          </div>

          {/* Right Metric Boxes: 2x2 Grid (Lime and Purple Tiles) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {/* Daily Tile */}
              <div className="bg-[#CAEB0E] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs">
                <div className="font-display font-black text-xl sm:text-2xl text-black">
                  ${dailyCashback} <span className="text-xs font-semibold text-black/80">/day</span>
                </div>
              </div>

              {/* Weekly Tile */}
              <div className="bg-[#5945F1] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs text-white">
                <div className="font-display font-black text-xl sm:text-2xl">
                  ${weeklyCashback} <span className="text-xs font-normal text-white/80">/week</span>
                </div>
              </div>

              {/* Monthly Tile */}
              <div className="bg-[#5945F1] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs text-white">
                <div className="font-display font-black text-xl sm:text-2xl">
                  ${monthlyCashback} <span className="text-xs font-normal text-white/80">/month</span>
                </div>
              </div>

              {/* Annual Tile */}
              <div className="bg-[#5945F1] rounded-2xl p-5 flex flex-col justify-center text-center shadow-xs text-white">
                <div className="font-display font-black text-xl sm:text-2xl">
                  ${annualCashback} <span className="text-xs font-normal text-white/80">/annual</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              Based on standard forex lot rate
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Cashback Breakdown Table ─── */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-display font-black text-xl text-[#0b1c30]">
            {broker.name} Cashback Breakdown
          </h3>
          <button
            type="button"
            onClick={onOpenViewPlan}
            className="text-xs font-bold text-[#5945F1] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Rates shown are for &apos;Boss&apos; level members. View for all levels →</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-indigo-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-100 text-slate-700">
                <th className="py-4 px-6 font-bold w-44"></th>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <th key={spec.name} className="py-4 px-6 font-bold text-center text-[#5945F1]">
                    {spec.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              <tr>
                <td className="py-5 px-6 font-bold text-slate-900">Forex</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
