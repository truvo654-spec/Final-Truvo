import React, { useState } from 'react';
import { Broker, UserProfile } from '../../../types';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { BrokerComparisonCard } from '../BrokerComparisonCard';
import { CashbackEligibilitySection } from './CashbackEligibilitySection';

interface BrokerCashbackTabContentProps {
  broker: Broker;
  user: UserProfile;
  tier?: 'tier-1' | 'tier-2' | 'offshore';
  isConnected?: boolean;
  onOpenRebateTable?: () => void;
  onOpenViewPlan?: () => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

const ACCOUNT_TYPES = ['Bonus', 'Standard', 'Premium', 'Pro', 'Zero (ECN)'] as const;

// Base rates for Boss level members (as stated in breakdown table)
const BASE_RATES: Record<string, number> = {
  Bonus: 5.0,
  Standard: 6.0,
  Premium: 7.0,
  Pro: 8.0,
  'Zero (ECN)': 2.0,
};

const MEMBER_MULTIPLIERS: Record<string, number> = {
  Rookie: 1.0,
  Climber: 1.15,
  Pro: 1.25,
  Master: 1.35,
  Boss: 1.5,
};

export const BrokerCashbackTabContent: React.FC<BrokerCashbackTabContentProps> = ({
  broker,
  user,
  tier = 'tier-1',
  isConnected = false,
  onOpenRebateTable,
  onOpenViewPlan,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('Bonus');
  const [selectedLevel, setSelectedLevel] = useState<string>('Rookie');
  const [numLots, setNumLots] = useState<string>('0');

  const lots = parseFloat(numLots) || 0;
  const baseRate = BASE_RATES[selectedAccount] || 5.0;
  const multiplier = MEMBER_MULTIPLIERS[selectedLevel] || 1.0;

  // Daily, weekly (x5), monthly (x22), annual (x260)
  const daily = lots * baseRate * multiplier;
  const weekly = daily * 5;
  const monthly = daily * 22;
  const annual = daily * 260;

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Connected Account Banner when user is connected */}
      {isConnected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#eff2fe] to-[#fdf4fc] border border-[#5945F1]/20 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#0b1c30]">
                  Connected Account: <span className="text-[#5945F1] font-extrabold">#1100045789</span>
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Linked via MarketSyde IB. Trades on this account earn automated cashback rebates according to your tier.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              Pro Account (Active)
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. SEE YOUR CASHBACK CALCULATOR (D03, D06, D09)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <h3 className="font-display font-bold text-lg text-[#0b1c30]">
            See Your Cashback
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimate your cashback based on account type, membership level and trading volume.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Controls: Account Type Pills, Member Level, Number of Lot */}
          <div className="lg:col-span-7 space-y-4">
            {/* Account Type Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Account Type</label>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {ACCOUNT_TYPES.map((type) => {
                  const isSelected = selectedAccount === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedAccount(type)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EEF2FF] text-[#5945F1] font-bold shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs Grid: Member Level & Number of Lot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Member Level */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Member Level</label>
                <div className="relative">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:border-[#5945F1] focus:ring-1 focus:ring-[#5945F1] outline-none cursor-pointer pr-8"
                  >
                    <option value="Rookie">Rookie</option>
                    <option value="Climber">Climber</option>
                    <option value="Pro">Pro</option>
                    <option value="Master">Master</option>
                    <option value="Boss">Boss</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Number of Lot */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Number of Lot</label>
                <div>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={numLots}
                    onChange={(e) => setNumLots(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:border-[#5945F1] focus:ring-1 focus:ring-[#5945F1] outline-none"
                    placeholder="0"
                  />
                  <div className="text-[10px] text-slate-400 font-medium text-right mt-0.5">
                    per day
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 2x2 Colored Grid Block */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full grid grid-cols-2 rounded-2xl overflow-hidden shadow-xs border border-slate-100">
              {/* Top-Left: Lime Box ($ 0.00 /day) */}
              <div className="bg-[#CAEB0E] text-black font-extrabold text-sm sm:text-base py-5 px-3 flex items-center justify-center text-center">
                $ {daily.toFixed(2)} <span className="font-medium text-xs ml-1 text-black/80">/day</span>
              </div>

              {/* Top-Right: Purple Box ($ 0.00 /week) */}
              <div className="bg-[#5945F1] text-white font-extrabold text-sm sm:text-base py-5 px-3 flex items-center justify-center text-center border-l border-white/10">
                $ {weekly.toFixed(2)} <span className="font-medium text-xs ml-1 text-white/80">/week</span>
              </div>

              {/* Bottom-Left: Purple Box ($ 0.00 /month) */}
              <div className="bg-[#5945F1] text-white font-extrabold text-sm sm:text-base py-5 px-3 flex items-center justify-center text-center border-t border-white/10">
                $ {monthly.toFixed(2)} <span className="font-medium text-xs ml-1 text-white/80">/month</span>
              </div>

              {/* Bottom-Right: Purple Box ($ 0.00 /annual) */}
              <div className="bg-[#5945F1] text-white font-extrabold text-sm sm:text-base py-5 px-3 flex items-center justify-center text-center border-t border-l border-white/10">
                $ {annual.toFixed(2)} <span className="font-medium text-xs ml-1 text-white/80">/annual</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium text-center mt-2">
              Based on standard forex lot rate
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. HFM CASHBACK BREAKDOWN TABLE (D03, D06, D09 & image.png)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h3 className="font-display font-bold text-xl sm:text-[22px] text-slate-900 tracking-tight">
            {broker.name} Cashback Breakdown
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <p className="text-xs text-slate-600 font-normal">
              Rates shown are for <span className="text-[#5945F1] font-semibold">‘Boss’</span> level members.
            </p>
            <button
              type="button"
              onClick={onOpenRebateTable || onOpenViewPlan}
              className="px-3.5 py-1 rounded-full border border-[#5945F1]/30 hover:border-[#5945F1] bg-white hover:bg-indigo-50/40 text-[#5945F1] text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              View for all levels &rarr;
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[#5945F1]">
                <th className="py-3.5 px-5 font-bold w-36 text-slate-700"></th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Bonus</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Standard</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Premium</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Pro</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Zero (ECN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {/* Row 1: Forex */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-5 font-bold text-slate-900">Forex</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$5.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$6.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$7.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$8.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                  <div className="mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#FD02B0] text-white font-extrabold text-[9px] tracking-tight">
                      Highest
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$2.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
              </tr>

              {/* Row 2: Indices */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-semibold text-slate-800">Indices</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$2.00</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$2.50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$3.00</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">Tighter</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$1.00</td>
              </tr>

              {/* Row 3: Stocks */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-semibold text-slate-800">Stocks</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.40</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.60</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.80</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$4.00</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.20</td>
              </tr>

              {/* Row 4: Bonds */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-semibold text-slate-800">Bonds</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.30</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.40</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$1.00</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.10</td>
              </tr>

              {/* Row 5: ETFs */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-semibold text-slate-800">ETFs</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.60</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.70</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.60</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.20</td>
              </tr>

              {/* Row 6: Commodities */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-semibold text-slate-800">Commodities</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$1.00</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$1.50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$2.00</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.80</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$0.60</td>
              </tr>

              {/* Row 7: Crypto */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-semibold text-slate-800">Crypto</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$1.50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$2.00</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$2.50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$2.50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$1.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Cashback rate are subject to change. Final amount are calculated by MarketSyde.</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW HFM COMPARES CARD
         ───────────────────────────────────────────────────────────── */}
      <BrokerComparisonCard
        broker={broker}
        onSeeComparison={onSeeComparison}
        onExploreAllBrokers={onExploreAllBrokers}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. CASHBACK ELIGIBILITY & PAYOUTS SECTION
         ───────────────────────────────────────────────────────────── */}
      <CashbackEligibilitySection />
    </div>
  );
};
