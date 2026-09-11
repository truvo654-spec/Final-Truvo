import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BROKER_ACCOUNT_SPECS } from '../brokerConstants';
import { Check, ShieldCheck, UserPlus, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

interface Tier1AccountTabProps {
  broker: Broker;
  user: UserProfile;
  onRegisterPrompt: () => void;
}

export const Tier1AccountTab: React.FC<Tier1AccountTabProps> = ({
  broker,
  user,
  onRegisterPrompt,
}) => {
  return (
    <div id="tier1-account-scenario" className="space-y-8 animate-in fade-in duration-200">
      {/* ─── Top Banner for Unregistered Trader (D04) ─── */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">
              Account Types Guide • Tier 1
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              Guest
            </span>
          </div>
          <h4 className="font-display font-black text-lg text-[#0b1c30] mt-1">
            Find the Right Account for Your Strategy
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare spreads, commissions, and leverage across {broker.name} accounts. Register free on MarketSyde to earn cashback on whichever you choose.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegisterPrompt}
          className="px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4b39d6] text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-[#CAEB0E]" />
          <span>Register to Link Account</span>
        </button>
      </div>

      {/* ─── Accounts & Conditions Table (D04) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xl text-[#0b1c30]">
            Accounts &amp; Conditions
          </h3>
          <span className="text-xs text-slate-500">
            5 Account Types Available
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-indigo-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-100 text-[#5945F1] bg-slate-50/50">
                <th className="py-4 px-6 font-bold w-48 text-slate-700">Specification</th>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <th key={spec.name} className="py-4 px-6 font-bold text-center">
                    <div>{spec.name}</div>
                    {spec.recommendedFor === 'tier-1' && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black text-[9px] font-black mt-1">
                        Best for Beginners
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {/* Spread Type */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Spread type</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.spreadType}
                  </td>
                ))}
              </tr>

              {/* Commission */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Commission</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.commission === 'None' ? (
                      <span className="text-slate-400">✕ None</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{spec.commission}</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Min Deposit */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Min deposit</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center font-semibold">
                    {spec.minDeposit}
                  </td>
                ))}
              </tr>

              {/* Min Trade Volume */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Min trade volume</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.minTradeVolume}
                  </td>
                ))}
              </tr>

              {/* Max Leverage */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Max leverage</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center font-bold">
                    {spec.maxLeverage}
                  </td>
                ))}
              </tr>

              {/* Trading Platforms */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Trading platforms</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.tradingPlatforms}
                  </td>
                ))}
              </tr>

              {/* Cashback Rate */}
              <tr className="bg-indigo-50/30">
                <td className="py-4 px-6 font-bold text-[#5945F1]">Cashback / Lot</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center font-black text-[#5945F1]">
                    ${spec.baseCashbackRate.toFixed(2)}/lot
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Registration Guidance Box ─── */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-[#5945F1]/30 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5945F1]/10 text-[#5945F1] flex items-center justify-center font-bold">
            💡
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900">
              Important for New Traders (Tier 1)
            </h5>
            <p className="text-xs text-slate-500">
              To guarantee that your trading account receives automated rebates, create your free MarketSyde account first before signing up at {broker.name}.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-600">
            Takes only 30 seconds • No sensitive documents required to register on MarketSyde
          </span>
          <button
            type="button"
            onClick={onRegisterPrompt}
            className="px-6 py-2.5 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer text-center"
          >
            Create MarketSyde Account
          </button>
        </div>
      </div>
    </div>
  );
};
