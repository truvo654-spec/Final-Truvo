import React, { useState } from 'react';
import { Broker } from '../types';
import { X, Check, ArrowRight, ShieldCheck, Zap, Scale, DollarSign, Award, CheckCircle2 } from 'lucide-react';

interface BrokerComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokers: Broker[];
  onConnectBroker: (broker: Broker) => void;
  onSelectBrokerDetail?: (broker: Broker) => void;
}

export const BrokerComparisonModal: React.FC<BrokerComparisonModalProps> = ({
  isOpen,
  onClose,
  brokers,
  onConnectBroker,
  onSelectBrokerDetail,
}) => {
  const [brokerAId, setBrokerAId] = useState<string>(brokers[0]?.id || 'exness');
  const [brokerBId, setBrokerBId] = useState<string>(brokers[3]?.id || brokers[1]?.id || 'xm-ultra');

  if (!isOpen) return null;

  const brokerA = brokers.find((b) => b.id === brokerAId) || brokers[0];
  const brokerB = brokers.find((b) => b.id === brokerBId) || brokers[1] || brokers[0];

  const comparisonRows = [
    {
      label: 'Cashback Rebate',
      sublabel: 'Automated deposit per round turn lot',
      valA: brokerA.maxCashback,
      valB: brokerB.maxCashback,
      isBetter: brokerA.cashbackPerLot >= brokerB.cashbackPerLot ? 'A' : 'B',
      highlight: true,
    },
    {
      label: 'Spread From',
      sublabel: 'Raw account floating spread',
      valA: brokerA.spreadFrom,
      valB: brokerB.spreadFrom,
      isBetter: brokerA.spreadFrom === '0.0 pips' ? 'A' : brokerB.spreadFrom === '0.0 pips' ? 'B' : 'equal',
    },
    {
      label: 'Maximum Leverage',
      sublabel: 'Flexible margin ceiling',
      valA: brokerA.maxLeverage,
      valB: brokerB.maxLeverage,
      isBetter: brokerA.maxLeverage.includes('Unlimited') ? 'A' : brokerB.maxLeverage.includes('Unlimited') ? 'B' : 'equal',
    },
    {
      label: 'Minimum Deposit',
      sublabel: 'Starting balance requirement',
      valA: brokerA.minDeposit,
      valB: brokerB.minDeposit,
      isBetter: parseInt(brokerA.minDeposit.replace('$', '')) <= parseInt(brokerB.minDeposit.replace('$', '')) ? 'A' : 'B',
    },
    {
      label: 'Tier-1 Regulations',
      sublabel: 'Government supervisory licenses',
      valA: brokerA.regulations.join(', '),
      valB: brokerB.regulations.join(', '),
      isBetter: brokerA.regulations.length >= brokerB.regulations.length ? 'A' : 'B',
    },
    {
      label: 'Supported Platforms',
      sublabel: 'Desktop, mobile & web terminals',
      valA: brokerA.platforms.join(', '),
      valB: brokerB.platforms.join(', '),
      isBetter: 'equal',
    },
    {
      label: 'Automated Rebate Engine',
      sublabel: 'Direct-to-wallet deposit execution',
      valA: 'Instant Automated',
      valB: 'Instant Automated',
      isBetter: 'equal',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5338ec]/10 flex items-center justify-center text-[#5338ec]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-[#0b1c30]">
                  Broker Head-to-Head Comparison
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#5338ec]/10 text-[#5338ec] text-[11px] font-bold">
                  Live Battle
                </span>
              </div>
              <p className="text-xs text-slate-500">
                A head-to-head battle for your money. Transparent rebate rates and trading conditions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Broker Selectors (Side-by-Side Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* VS Badge Center */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#0b1c30] text-white font-bold text-xs items-center justify-center shadow-md border-2 border-white">
              VS
            </div>

            {/* Broker A Selector */}
            <div className="p-4 rounded-2xl bg-white border-2 border-[#5338ec]/30 shadow-xs relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5338ec] mb-1 block">
                Corner A (Select Broker)
              </span>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={brokerA.logo}
                  alt={brokerA.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="flex-1">
                  <select
                    value={brokerAId}
                    onChange={(e) => setBrokerAId(e.target.value)}
                    className="w-full text-sm font-bold text-[#0b1c30] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#5338ec]"
                  >
                    {brokers.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.id === brokerBId}>
                        {b.name} ({b.maxCashback})
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-slate-500 mt-1">
                    {brokerA.category} • {brokerA.platforms.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Rebate Payout:</div>
                <div className="text-base font-extrabold text-[#5338ec]">
                  {brokerA.maxCashback}
                </div>
              </div>
            </div>

            {/* Broker B Selector */}
            <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                Corner B (Select Rival)
              </span>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={brokerB.logo}
                  alt={brokerB.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="flex-1">
                  <select
                    value={brokerBId}
                    onChange={(e) => setBrokerBId(e.target.value)}
                    className="w-full text-sm font-bold text-[#0b1c30] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#5338ec]"
                  >
                    {brokers.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.id === brokerAId}>
                        {b.name} ({b.maxCashback})
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-slate-500 mt-1">
                    {brokerB.category} • {brokerB.platforms.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Rebate Payout:</div>
                <div className="text-base font-extrabold text-[#0b1c30]">
                  {brokerB.maxCashback}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Feature / Metric</div>
              <div className="col-span-3 text-center text-[#5338ec]">{brokerA.name}</div>
              <div className="col-span-4 text-center text-slate-700">{brokerB.name}</div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {comparisonRows.map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 px-4 py-3 items-center ${
                    row.highlight ? 'bg-[#5338ec]/5' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="col-span-5 pr-2">
                    <div className="font-bold text-[#0b1c30]">{row.label}</div>
                    <div className="text-[11px] text-slate-400">{row.sublabel}</div>
                  </div>

                  <div className="col-span-3 text-center px-1">
                    <span
                      className={`inline-block px-2 py-1 rounded-md font-semibold ${
                        row.isBetter === 'A'
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                          : 'text-[#0b1c30]'
                      }`}
                    >
                      {row.valA}
                      {row.isBetter === 'A' && ' 🏆'}
                    </span>
                  </div>

                  <div className="col-span-4 text-center px-1">
                    <span
                      className={`inline-block px-2 py-1 rounded-md font-semibold ${
                        row.isBetter === 'B'
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                          : 'text-[#0b1c30]'
                      }`}
                    >
                      {row.valB}
                      {row.isBetter === 'B' && ' 🏆'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-xs text-[#0b1c30]">{brokerA.name}</div>
                <div className="text-[11px] text-slate-500">Rebate rate: {brokerA.maxCashback}</div>
                {onSelectBrokerDetail && (
                  <button
                    onClick={() => {
                      onSelectBrokerDetail(brokerA);
                      onClose();
                    }}
                    className="text-[10px] text-[#5945F1] hover:underline font-bold mt-1 cursor-pointer block"
                  >
                    View Broker Profile →
                  </button>
                )}
              </div>
              {brokerA.connected ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </span>
              ) : (
                <button
                  onClick={() => {
                    onConnectBroker(brokerA);
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  Connect {brokerA.name.split(' ')[0]}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-xs text-[#0b1c30]">{brokerB.name}</div>
                <div className="text-[11px] text-slate-500">Rebate rate: {brokerB.maxCashback}</div>
                {onSelectBrokerDetail && (
                  <button
                    onClick={() => {
                      onSelectBrokerDetail(brokerB);
                      onClose();
                    }}
                    className="text-[10px] text-[#5945F1] hover:underline font-bold mt-1 cursor-pointer block"
                  >
                    View Broker Profile →
                  </button>
                )}
              </div>
              {brokerB.connected ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </span>
              ) : (
                <button
                  onClick={() => {
                    onConnectBroker(brokerB);
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#0b1c30] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  Connect {brokerB.name.split(' ')[0]}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
