import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { ShieldCheck, Globe, Database, ArrowRight, Lock, CheckCircle2, Zap } from 'lucide-react';

interface OffshoreCompanyTabProps {
  broker: Broker;
  user: UserProfile;
}

export const OffshoreCompanyTab: React.FC<OffshoreCompanyTabProps> = ({ broker, user }) => {
  return (
    <div id="offshore-company-scenario" className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">
            Jurisdiction &amp; Liquidity • Offshore
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[#CAEB0E] text-[10px] font-black">
            Experienced Trader
          </span>
        </div>
        <h3 className="font-display font-black text-xl text-[#0b1c30] mt-1">
          {broker.name} Offshore Architecture &amp; Liquidity Network
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Dual-jurisdiction framework providing maximal leverage and institutional trading conditions.
        </p>
      </div>

      {/* ─── Jurisdiction Comparison: Offshore vs Tier-1 ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Offshore Entity Specs */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#CAEB0E]">
              <Zap className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white">Offshore Global Entity</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black text-[10px] font-extrabold">
              Active Choice
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Registered under Seychelles FSA / FSC international securities regulations, customized for global active traders seeking maximum flexibility.
          </p>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Max Leverage:</span>
              <span className="font-bold text-[#CAEB0E]">Up to 1:2000 (Unlimited available)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Payment Rails:</span>
              <span className="font-bold text-white">USDT, BTC, Bank Wire, Local QR</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Trading Rules:</span>
              <span className="font-bold text-emerald-400">EA, News Trading, Hedging Allowed</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Cashback Settlement:</span>
              <span className="font-bold text-[#FD02B0]">Automated Weekly (100% Rate)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tier-1 Onshore Entity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5945F1]">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-bold text-sm text-[#0b1c30]">Tier-1 Regulated Group</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              Institutional
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Operating under European CySEC and UK FCA licenses for high-net-worth accounts requiring statutory compensation.
          </p>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Supervisory Body:</span>
              <span className="font-bold text-slate-900">CySEC (Lic # 183/12) &amp; FCA</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Client Insurance:</span>
              <span className="font-bold text-slate-900">Up to €20,000 / £85,000</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Retail Leverage Limit:</span>
              <span className="font-bold text-slate-700">1:30 (ESMA standard)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Bank Custodians:</span>
              <span className="font-bold text-emerald-600">Barclays, BNP Paribas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Institutional Liquidity & Execution Network ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-[#5945F1]">
          <Database className="w-5 h-5" />
          <h4 className="font-bold text-base text-[#0b1c30]">
            Tier-1 Liquidity Providers &amp; Prime Brokerage
          </h4>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {broker.name} aggregates direct pricing from multiple Tier-1 global investment banks and non-bank liquidity pools through smart order routing (SOR) engines, guaranteeing tight spreads even during high-impact market news releases.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Execution</span>
            <span className="font-bold text-xs text-slate-900 mt-0.5 block">100% STP / ECN</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Server Latency</span>
            <span className="font-bold text-xs text-emerald-600 mt-0.5 block">&lt; 10ms LD4</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Slippage Control</span>
            <span className="font-bold text-xs text-slate-900 mt-0.5 block">Positive Slippage Enabled</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rebate Settlement</span>
            <span className="font-bold text-xs text-[#5945F1] mt-0.5 block">Weekly Automated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
