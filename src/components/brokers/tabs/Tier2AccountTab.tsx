import React, { useState } from 'react';
import { Broker, UserProfile } from '../../../types';
import { BROKER_ACCOUNT_SPECS } from '../brokerConstants';
import { Check, Copy, ExternalLink, ShieldCheck, ArrowRight, Link2 } from 'lucide-react';

interface Tier2AccountTabProps {
  broker: Broker;
  user: UserProfile;
  onNavigateToConnect: () => void;
  onShowToast?: (msg: string) => void;
}

export const Tier2AccountTab: React.FC<Tier2AccountTabProps> = ({
  broker,
  user,
  onNavigateToConnect,
  onShowToast,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const partnerCode = 'SYDE-TRUVO-888';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(partnerCode);
    setCopiedCode(true);
    onShowToast?.(`Copied partner code: ${partnerCode}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="tier2-account-scenario" className="space-y-8 animate-in fade-in duration-200">
      {/* ─── Top Member Quick Action (D07) ─── */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">
              Account Linking Guide • Tier 2
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[10px] font-bold">
              Registered Member
            </span>
          </div>
          <h4 className="font-display font-black text-lg text-[#0b1c30]">
            Connect Your {broker.name} Account to MarketSyde
          </h4>
          <p className="text-xs text-slate-500">
            Link an existing MT4/MT5 account or open a fresh one under our partner code to activate automated rebates.
          </p>
        </div>

        {/* Partner Code Box */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-indigo-200 shadow-2xs shrink-0">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Partner IB Code</span>
            <span className="font-mono font-black text-xs sm:text-sm text-[#5945F1]">{partnerCode}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-2 rounded-lg bg-[#F0EDFF] hover:bg-[#5945F1] hover:text-white text-[#5945F1] transition-colors cursor-pointer"
            title="Copy Partner Code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── Accounts & Conditions Table (D07) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xl text-[#0b1c30]">
            Accounts &amp; Conditions
          </h3>
          <p className="text-xs text-slate-500 hidden sm:block">
            Explore account conditions and select the best fit for your trading style.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-indigo-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-100 text-[#5945F1] bg-slate-50/50">
                <th className="py-4 px-6 font-bold w-48 text-slate-700"></th>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <th key={spec.name} className="py-4 px-6 font-bold text-center">
                    <div>{spec.name}</div>
                    {spec.isHighestCashback && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#FD02B0] text-white text-[9px] font-bold mt-1">
                        Highest Cashback
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {/* Row 1: Spread type */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Spread type</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td
                    key={spec.name}
                    className={`py-4 px-6 text-center ${spec.name === 'Zero (ECN)' ? 'font-bold text-[#5945F1]' : ''}`}
                  >
                    {spec.spreadType}
                  </td>
                ))}
              </tr>

              {/* Row 2: Commission */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Commission</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.commission === 'None' ? (
                      <span className="text-slate-400">✕</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{spec.commission}</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 3: Min deposit */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Min deposit</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td
                    key={spec.name}
                    className={`py-4 px-6 text-center ${spec.name === 'Zero (ECN)' ? 'font-bold' : ''}`}
                  >
                    {spec.minDeposit}
                  </td>
                ))}
              </tr>

              {/* Row 4: Min trade volume */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Min trade volume</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.minTradeVolume}
                  </td>
                ))}
              </tr>

              {/* Row 5: Max leverage */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Max leverage</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.maxLeverage}
                  </td>
                ))}
              </tr>

              {/* Row 6: Trading platforms */}
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Trading platforms</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.tradingPlatforms}
                  </td>
                ))}
              </tr>

              {/* Row 7: Action */}
              <tr className="bg-slate-50/70">
                <td className="py-4 px-6 font-bold text-slate-900">Action</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={onNavigateToConnect}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#5945F1] hover:text-white text-slate-800 font-bold border border-slate-200 hover:border-[#5945F1] text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      Connect
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Step-by-Step Link Guidance for Registered User ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h4 className="font-display font-black text-base text-[#0b1c30]">
          Two Ways to Connect as a Registered Member
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Existing Account */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-bold text-xs text-[#5945F1] uppercase">Option A: Existing Account</span>
            <h5 className="font-bold text-sm text-slate-900">IB Transfer / Link Existing ID</h5>
            <p className="text-xs text-slate-500">
              Already trading with {broker.name}? Contact their support or request an IB transfer to code{' '}
              <strong className="text-slate-900">{partnerCode}</strong>.
            </p>
            <button
              type="button"
              onClick={onNavigateToConnect}
              className="text-xs font-bold text-[#5945F1] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Submit existing Account ID →</span>
            </button>
          </div>

          {/* Option B: New Account */}
          <div className="p-4 rounded-xl border border-[#5945F1]/30 bg-[#F0EDFF]/30 space-y-2">
            <span className="font-bold text-xs text-[#5945F1] uppercase">Option B: New Account</span>
            <h5 className="font-bold text-sm text-slate-900">Open Under Partner Code</h5>
            <p className="text-xs text-slate-500">
              Open a new trading account using our direct link. Your cashback tracking is instantly mapped.
            </p>
            <button
              type="button"
              onClick={onNavigateToConnect}
              className="text-xs font-bold text-[#5945F1] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Launch Broker Connect Flow →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
