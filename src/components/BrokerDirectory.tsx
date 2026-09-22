import React, { useState } from 'react';
import { Broker } from '../types';
import { Check, ShieldCheck, Search, Filter, ExternalLink, ArrowRight, CheckCircle2, Scale } from 'lucide-react';
import { EarningRewardData } from './EarningRewardModal';

interface BrokerDirectoryProps {
  brokers: Broker[];
  onConnectBroker: (broker: Broker) => void;
  onOpenComparison?: () => void;
  onTriggerEarningModal?: (data: EarningRewardData) => void;
}

export const BrokerDirectory: React.FC<BrokerDirectoryProps> = ({
  brokers,
  onConnectBroker,
  onOpenComparison,
  onTriggerEarningModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Forex', 'Raw Spread', 'Multi-Asset'];

  const filteredBrokers = brokers.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.platforms.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.regulations.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="broker-partners-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-bold text-[#0b1c30] tracking-tight">
              Verified Broker Partners
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#eef2ff] text-[#5338ec]">
              {brokers.length} Partners
            </span>
          </div>
          <p className="text-xs text-[#474556] mt-0.5">
            Institutional rebate agreements with top tier-1 regulated trading platforms
          </p>
        </div>

        {/* Filter, Comparison and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {onOpenComparison && (
            <button
              onClick={onOpenComparison}
              className="px-3 py-1.5 rounded-lg bg-[#5338ec]/10 hover:bg-[#5338ec]/20 text-[#5338ec] text-xs font-bold flex items-center gap-1.5 transition-all border border-[#5338ec]/30 shadow-2xs whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Head-to-Head</span>
            </button>
          )}

          {/* Category Tabs */}
          <div className="p-1 rounded-lg bg-[#f1f5f9] flex items-center gap-1 border border-slate-200 self-stretch sm:self-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                    : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search broker, MT5..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec]"
            />
          </div>
        </div>
      </div>

      {/* Interactive Earning Modals Demo Trigger Bar (Matching reference designs on Broker List page) */}
      {onTriggerEarningModal && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#5338ec]/5 via-[#fe01b1]/5 to-[#c6f831]/10 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#FD02B0] animate-pulse" />
            <span>Interactive Earning Modals (Preview Reference Designs):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                onTriggerEarningModal({
                  type: 'quest',
                  credits: 5,
                  questName: 'login in today',
                  subtitle: 'Way to go!',
                })
              }
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50/50 text-xs font-bold text-[#FD02B0] border border-[#FD02B0]/40 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>✨ Quest Complete (+5 Credits)</span>
            </button>
            <button
              onClick={() =>
                onTriggerEarningModal({
                  type: 'mission',
                  credits: 5,
                  title: 'Mission Complete!',
                })
              }
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50/50 text-xs font-bold text-[#5945F1] border border-[#5945F1]/40 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>👑 Mission Complete (+5 Credits)</span>
            </button>
            <button
              onClick={() =>
                onTriggerEarningModal({
                  type: 'trade',
                  points: 20,
                  credits: 10,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>📈 Completing a Trade (+20 Pts, +10 Cr)</span>
            </button>
          </div>
        </div>
      )}

      {/* Broker Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredBrokers.map((broker) => {
          return (
            <div
              key={broker.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between group ${
                broker.connected
                  ? 'border-[#5338ec]/50 shadow-md ring-1 ring-[#5338ec]/20'
                  : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div>
                {/* Top Row: Verified Badge & Regulation */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {/* Verification Tag */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[11px] font-bold tracking-tight">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Verified</span>
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    {broker.regulations.join(' • ')}
                  </div>
                </div>

                {/* Logo & Name */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 p-1 group-hover:border-[#5338ec]/30 transition-colors">
                    <img
                      src={broker.logo}
                      alt={broker.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-[#0b1c30] leading-tight">
                      {broker.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {broker.category} • {broker.platforms[0]}
                    </span>
                  </div>
                </div>

                {/* Cashback Highlight Box */}
                <div className="bg-[#f8f9ff] border border-[#d6d0ff]/50 rounded-xl p-3 mb-4 text-center">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-0.5">
                    Automated Rebate
                  </span>
                  <div className="text-lg font-bold font-display text-[#5338ec] tabular-nums">
                    {broker.maxCashback}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Direct automated deposit per round turn lot
                  </span>
                </div>

                {/* Specs List */}
                <div className="space-y-1.5 text-xs text-[#474556] mb-5 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Spread From:</span>
                    <span className="font-semibold text-[#0b1c30]">{broker.spreadFrom}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Max Leverage:</span>
                    <span className="font-semibold text-[#0b1c30]">{broker.maxLeverage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Supported Terminals:</span>
                    <span className="font-medium text-[#0b1c30]">{broker.platforms.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Button: Full width */}
              <div>
                {broker.connected ? (
                  <div className="space-y-2">
                    <div className="w-full py-2 px-3 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Linked ({broker.connectedAccountId})</span>
                    </div>
                    {onTriggerEarningModal && (
                      <button
                        onClick={() =>
                          onTriggerEarningModal({
                            type: 'trade',
                            points: 20,
                            credits: 10,
                            brokerName: broker.name,
                          })
                        }
                        className="w-full py-1.5 px-3 rounded-lg bg-[#5338ec]/10 hover:bg-[#5338ec]/20 text-[#5338ec] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#5338ec]/20"
                      >
                        <span>Trade & Earn (+20 Pts, +10 Cr)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onConnectBroker(broker)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
