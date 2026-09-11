import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { ShieldCheck, Lock, Gift, Zap, Server, CheckCircle2, ArrowRight } from 'lucide-react';

interface Tier2CompanyTabProps {
  broker: Broker;
  user: UserProfile;
  onNavigateToConnect: () => void;
}

export const Tier2CompanyTab: React.FC<Tier2CompanyTabProps> = ({
  broker,
  user,
  onNavigateToConnect,
}) => {
  return (
    <div id="tier2-company-scenario" className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">
            Company &amp; Safety • Tier 2
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[10px] font-bold">
            Registered Member
          </span>
        </div>
        <h3 className="font-display font-black text-xl text-[#0b1c30] mt-1">
          Company Profile &amp; Member Privileges
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Institutional regulations combined with exclusive perks for MarketSyde traders.
        </p>
      </div>

      {/* Grid: Regulations + Perks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Regulations & Licenses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#5945F1]">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm text-[#0b1c30]">Regulations &amp; Licenses</h4>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="text-slate-500">Tier 1 Authority:</span>
              <span className="font-bold text-slate-900">CySEC (Cyprus Securities &amp; Exchange)</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="text-slate-500">UK Authorization:</span>
              <span className="font-bold text-slate-900">FCA (Financial Conduct Authority)</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="text-slate-500">Africa Region:</span>
              <span className="font-bold text-slate-900">FSCA (Financial Sector Conduct Authority)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Institutional Safety:</span>
              <span className="font-bold text-emerald-600">Tier 1 Segregated Accounts</span>
            </div>
          </div>
        </div>

        {/* Card 2: Exclusive Member Perks */}
        <div className="bg-white rounded-2xl p-6 border border-[#5945F1]/30 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#5945F1]">
            <Gift className="w-5 h-5 text-[#FD02B0]" />
            <h4 className="font-bold text-sm text-[#0b1c30]">MarketSyde Member Privileges</h4>
          </div>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Free Ultra-Low Latency VPS:</strong>
                <p className="text-slate-500 mt-0.5">
                  Maintain 10+ lots traded per month on {broker.name} to receive sponsored VPS hosting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">1-Click Signals Integration:</strong>
                <p className="text-slate-500 mt-0.5">
                  Synchronize MarketSyde trading signals directly into your connected account MT4/MT5 charts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Expedited Payout Channel:</strong>
                <p className="text-slate-500 mt-0.5">
                  Direct weekly automated cashback payout into your Syde Credits or external wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety of Client Funds Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-[#5945F1]">
          <Lock className="w-5 h-5" />
          <h4 className="font-bold text-sm text-[#0b1c30]">Safety of Client Funds</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-900 block">Segregated Accounts</span>
            <span className="text-slate-500 mt-1 block">Held with Tier-1 international banks, completely separated from operations.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-900 block">Negative Balance Guard</span>
            <span className="text-slate-500 mt-1 block">You can never lose more than your deposited balance on retail accounts.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-900 block">€20,000 Compensation</span>
            <span className="text-slate-500 mt-1 block">Covered under statutory Investor Compensation Fund regulations.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
