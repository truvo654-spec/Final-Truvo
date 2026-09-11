import React from 'react';
import { Broker } from '../../../types';
import { ShieldCheck, Lock, Building2, CheckCircle2, Globe, Award, HelpCircle } from 'lucide-react';

interface Tier1CompanyTabProps {
  broker: Broker;
  onRegisterPrompt: () => void;
}

export const Tier1CompanyTab: React.FC<Tier1CompanyTabProps> = ({
  broker,
  onRegisterPrompt,
}) => {
  return (
    <div id="tier1-company-scenario" className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">
            Company &amp; Safety • Tier 1
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
            Guest Overview
          </span>
        </div>
        <h3 className="font-display font-black text-xl text-[#0b1c30] mt-1">
          {broker.name} Profile &amp; Regulatory Safety
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Everything you need to know about the safety of your funds before registering.
        </p>
      </div>

      {/* 2-Column Safety Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regulations & Licenses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#5945F1]">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm text-[#0b1c30]">Tier-1 Regulations &amp; Licenses</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {broker.name} operates under oversight from premier global regulatory watchdogs ensuring strict compliance and operational transparency.
          </p>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">European Authority:</span>
              <span className="font-bold text-slate-900">CySEC (Cyprus Securities &amp; Exchange)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">United Kingdom:</span>
              <span className="font-bold text-slate-900">FCA (Financial Conduct Authority)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Africa Region:</span>
              <span className="font-bold text-slate-900">FSCA (Financial Sector Conduct Authority)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Client Fund Protection:</span>
              <span className="font-bold text-emerald-600">Segregated Custodian Accounts</span>
            </div>
          </div>
        </div>

        {/* Safety of Client Funds */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#5945F1]">
            <Lock className="w-5 h-5" />
            <h4 className="font-bold text-sm text-[#0b1c30]">Institutional Fund Protection</h4>
          </div>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Segregated Bank Accounts:</strong>
                <p className="text-slate-500 mt-0.5">
                  Client trading funds are kept strictly separate from company operational accounts in Tier 1 European banks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Negative Balance Protection:</strong>
                <p className="text-slate-500 mt-0.5">
                  Retail accounts are contractually protected from falling below $0 even in extreme volatility.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Investor Compensation Scheme:</strong>
                <p className="text-slate-500 mt-0.5">
                  Qualifying retail client accounts are insured up to €20,000 under statutory funds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Guarantee for Unregistered users */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#CAEB0E] text-black text-[11px] font-black">
            <span>MarketSyde Guarantee</span>
          </div>
          <h4 className="font-display font-black text-xl text-white">
            Your Funds &amp; Credentials Stay 100% Safe
          </h4>
          <p className="text-xs text-white/80 leading-relaxed">
            MarketSyde is an official Introducing Broker partner. We never hold your capital, view your passwords, or execute trades on your behalf. You trade directly on {broker.name}&apos;s regulated platform while receiving automated cashback rebates.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegisterPrompt}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0 text-center"
        >
          Register Free Account
        </button>
      </div>
    </div>
  );
};
