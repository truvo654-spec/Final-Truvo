import React, { useState, useId } from 'react';
import { Broker, UserProfile } from '../../../types';
import { BROKER_ACCOUNT_SPECS, TIER_MULTIPLIERS } from '../brokerConstants';
import {
  Sparkles,
  Zap,
  TrendingUp,
  CreditCard,
  PlusCircle,
  Coins,
  History,
  CheckCircle2,
  Settings,
  ChevronRight,
} from 'lucide-react';

interface OffshoreCashbackTabProps {
  broker: Broker;
  user: UserProfile;
  onNavigateToConnect: () => void;
  onShowToast?: (msg: string) => void;
}

export const OffshoreCashbackTab: React.FC<OffshoreCashbackTabProps> = ({
  broker,
  user,
  onNavigateToConnect,
  onShowToast,
}) => {
  const [selectedAccountType, setSelectedAccountType] = useState<string>('Zero (ECN)');
  const [dailyLotsInput, setDailyLotsInput] = useState<string>('25');
  const [payoutMethod, setPayoutMethod] = useState<'usdt' | 'balance' | 'bank'>('usdt');
  const lotsInputId = useId();

  const activeSpec =
    BROKER_ACCOUNT_SPECS.find((s) => s.name === selectedAccountType) || BROKER_ACCOUNT_SPECS[4];
  const numDailyLots = parseFloat(dailyLotsInput) || 0;

  // Offshore VIP multiplier (Boss 1.5x automatically unlocked for experienced active traders)
  const vipMultiplier = 1.5;
  const currentBaseRate = activeSpec.baseCashbackRate;
  const effectiveRate = currentBaseRate * vipMultiplier;

  const dailyCashback = (numDailyLots * effectiveRate).toFixed(2);
  const weeklyCashback = (numDailyLots * effectiveRate * 5).toFixed(2);
  const monthlyCashback = (numDailyLots * effectiveRate * 22).toFixed(2);
  const annualCashback = (numDailyLots * effectiveRate * 260).toFixed(2);

  return (
    <div id="offshore-cashback-scenario" className="space-y-10 animate-in fade-in duration-200">
      {/* ─── 1. Active Trading & Account Connection Banner (D09) ─── */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#CAEB0E] text-black flex items-center justify-center font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-black text-lg text-white">
                  Active Trader Dashboard • {broker.name}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FD02B0] text-white text-[10px] font-black uppercase tracking-wider">
                  Offshore VIP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected MT5 Account #1100045789 (Active) • Automated Weekly Payout Enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onNavigateToConnect();
                onShowToast?.('Opening Sub-Account Linking modal...');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-[#CAEB0E]" />
              <span>Link Sub-Account</span>
            </button>

            <button
              type="button"
              onClick={() => onShowToast?.('VIP Account Manager contacted')}
              className="px-4 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4b39d6] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Contact VIP Desk
            </button>
          </div>
        </div>

        {/* 4 Performance Metric Cards for Experienced Trader */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              Cumulative Rebate
            </span>
            <div className="font-display font-black text-xl sm:text-2xl text-[#CAEB0E]">
              ${(user.totalCashbackEarned || 3128).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block">● 100% Paid Out</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              Total Volume Traded
            </span>
            <div className="font-display font-black text-xl sm:text-2xl text-white">
              {(user.lotsTradedTotal || 163.6).toFixed(1)}{' '}
              <span className="text-xs text-slate-400 font-normal">Lots</span>
            </div>
            <span className="text-[10px] text-slate-400 block">Across 2 connected accounts</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              VIP Tier Boost
            </span>
            <div className="font-display font-black text-xl sm:text-2xl text-[#FD02B0]">
              +50% Boss
            </div>
            <span className="text-[10px] text-[#CAEB0E] font-semibold block">Maximum Tier Active</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              Next Payout Batch
            </span>
            <div className="font-display font-black text-xl sm:text-2xl text-white">
              Monday
            </div>
            <span className="text-[10px] text-slate-400 block">Auto-transfer to USDT (TRC20)</span>
          </div>
        </div>
      </div>

      {/* ─── 2. High-Volume VIP Rebate Calculator (D09) ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-black text-xl text-[#0b1c30]">
              High-Volume &amp; Offshore VIP Rebate Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate high-volume daily trading with institutional Raw ECN &amp; Standard accounts.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EDFF] text-[#5945F1] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#FD02B0]" />
            <span>VIP Boss Rates (1.5x Boost Active)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Form: Account Type, Lots per Day, Payout Method */}
          <div className="lg:col-span-7 space-y-5">
            {/* Account Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Account Execution Type</label>
              <div className="flex flex-wrap items-center gap-2">
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <button
                    key={spec.name}
                    type="button"
                    onClick={() => setSelectedAccountType(spec.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedAccountType === spec.name
                        ? 'bg-[#0b1c30] text-[#CAEB0E] border border-black shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Lots Input (Formatted for High-Volume) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor={lotsInputId} className="text-xs font-bold text-slate-700">
                  Daily Volume (Lots)
                </label>
                <div>
                  <input
                    id={lotsInputId}
                    type="number"
                    min="1"
                    step="5"
                    placeholder="25"
                    value={dailyLotsInput}
                    onChange={(e) => setDailyLotsInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#5945F1] shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Institutional scaling supported up to 1,000+ lots/day
                  </span>
                </div>
              </div>

              {/* Payout Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Rebate Rail</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('usdt')}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      payoutMethod === 'usdt'
                        ? 'bg-[#5945F1] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    USDT
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('balance')}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      payoutMethod === 'balance'
                        ? 'bg-[#5945F1] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Trading Bal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      payoutMethod === 'bank'
                        ? 'bg-[#5945F1] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Local Wire
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Zero conversion fee for USDT TRC20/ERC20
                </span>
              </div>
            </div>

            {/* Active VIP Rate Indicator */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Effective VIP Rebate Rate:</span>
                <div className="font-bold text-sm text-[#CAEB0E] mt-0.5">
                  ${effectiveRate.toFixed(2)} / lot (1.5x Boss Multiplier)
                </div>
              </div>
              <button
                type="button"
                onClick={() => onShowToast?.('Custom IB Agreement requested for review')}
                className="text-xs font-bold text-[#FD02B0] hover:underline cursor-pointer"
              >
                Request Custom IB Rate &gt;
              </button>
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
              Automated weekly settlement directly to selected payout rail
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Full Breakdown Table for Institutional & ECN Accounts ─── */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-display font-black text-xl text-[#0b1c30]">
            Offshore &amp; Institutional Rebate Schedule
          </h3>
          <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>VIP Boss Rates Auto-Applied</span>
          </span>
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
                <td className="py-5 px-6 font-bold text-slate-900">Forex Majors (VIP)</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-5 px-6 text-center font-black text-[#5945F1] text-base">
                    ${(spec.baseCashbackRate * 1.5).toFixed(2)}
                    <span className="text-xs text-slate-500 font-normal">/Lot</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-5 px-6 font-bold text-slate-900">XAU/USD Gold (VIP)</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-5 px-6 text-center font-bold text-slate-800 text-sm">
                    ${(spec.baseCashbackRate * 1.5 * 1.1).toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal">/Lot</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-5 px-6 font-bold text-slate-900">Indices (US30 / NAS100)</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-5 px-6 text-center font-medium text-slate-600 text-xs">
                    $1.50 - $3.00/Lot
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
