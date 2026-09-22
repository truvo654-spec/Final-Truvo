import React from 'react';
import { Broker } from '../../types';
import { Check, Info, ArrowRight } from 'lucide-react';

interface MeetingTradingPartnerSectionProps {
  brokers?: Broker[];
  onOpenConnectModal?: (broker?: Broker) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const MeetingTradingPartnerSection: React.FC<MeetingTradingPartnerSectionProps> = ({
  brokers,
  onOpenConnectModal,
  onNavigateToTab,
}) => {
  const partnerBrokers = [
    {
      id: 'hfm',
      name: 'HFM',
      logoBg: '#0b0f19',
      logoText: 'HFM',
      logoTextColor: '#ffffff',
      cashback: '$3.80',
      unit: '/lot',
      cashbackLabel: 'Max Cashback',
      verified: true,
      accountTypes: ['Premium', 'Pro'],
      status: 'Connected and ready to trade',
      isConnected: true,
      buttonText: 'Trade Now',
      buttonTheme: 'purple', // #5945F1
    },
    {
      id: 'fxpro',
      name: 'FxPro',
      logoBg: '#dc2626',
      logoText: 'FxPro',
      logoTextColor: '#ffffff',
      cashback: '$4.30',
      unit: '/lot',
      cashbackLabel: 'Max Cashback',
      verified: true,
      accountTypes: ['Raw Spread', 'Pro'],
      status: null,
      isConnected: false,
      buttonText: 'Connect Now',
      buttonTheme: 'lime', // #BEF226
    },
    {
      id: 'exness',
      name: 'Exness',
      logoBg: '#fbbf24',
      logoText: 'ex',
      logoTextColor: '#0f172a',
      cashback: '$6.20',
      unit: '/lot',
      cashbackLabel: 'Max Cashback',
      verified: true,
      accountTypes: ['Raw Spread', 'Pro'],
      status: null,
      isConnected: false,
      buttonText: 'Connect Now',
      buttonTheme: 'lime', // #BEF226
    },
    {
      id: 'pepperstone',
      name: 'Peppersto...',
      fullName: 'Pepperstone',
      logoBg: '#1e3a8a',
      logoText: 'pepperstone',
      logoTextColor: '#ffffff',
      cashback: '0.3 pips',
      unit: '',
      cashbackLabel: 'Max spread cashback',
      verified: false,
      accountTypes: ['Razor', 'Standard Live'],
      status: null,
      isConnected: false,
      buttonText: 'Connect Now',
      buttonTheme: 'lime', // #BEF226
    },
  ];

  const handleAction = (partner: (typeof partnerBrokers)[0]) => {
    const matchedBroker = brokers?.find(
      (b) => b.id.toLowerCase() === partner.id || b.name.toLowerCase().includes(partner.name.toLowerCase())
    );
    if (onOpenConnectModal) {
      onOpenConnectModal(matchedBroker);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-pink-300/80 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Title & Subtitle matching Instrumental Analysis (1).png */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[#3730A3] inline-flex items-center justify-center gap-1.5">
          <span>Meeting Your Trading Partner</span>
          <span className="w-2.5 h-2.5 bg-[#BEF226] inline-block rounded-2xs" />
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          These brokers support cashback for this asset. Choose one, connect, and you&apos;re good to go!
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {partnerBrokers.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between hover:shadow-sm transition-all relative"
          >
            {/* Top row: Logo + Name */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] tracking-tighter shrink-0"
                  style={{ backgroundColor: partner.logoBg, color: partner.logoTextColor }}
                >
                  {partner.logoText}
                </div>
                <span className="font-bold text-sm text-slate-900 truncate" title={partner.fullName || partner.name}>
                  {partner.name}
                </span>
              </div>

              {/* Cashback display */}
              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-[#2563EB] tracking-tight">
                    {partner.cashback}
                  </span>
                  {partner.unit && (
                    <span className="text-xs font-semibold text-slate-500">{partner.unit}</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {partner.cashbackLabel}
                </span>
              </div>

              {/* Verified Badge */}
              {partner.verified && (
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#BEF226] text-[#0f2402]">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Verified</span>
                  </span>
                </div>
              )}

              {/* Eligible Account Types */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-[#5945F1] block mb-1">
                  Eligible Account Types
                </span>
                <ul className="space-y-0.5">
                  {partner.accountTypes.map((type, tIdx) => (
                    <li key={tIdx} className="flex items-center gap-1 text-xs text-slate-600">
                      <span className="text-slate-400">•</span>
                      <span>{type}</span>
                      <Info className="w-3 h-3 text-slate-300 ml-0.5 cursor-help" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom: Status & Button */}
            <div className="pt-3 mt-3 space-y-2">
              {partner.status ? (
                <div className="bg-slate-100/90 rounded-lg py-1.5 px-2 text-center text-[11px] leading-tight">
                  <span className="font-bold text-slate-800 block">Status: Connected</span>
                  <span className="text-slate-500 block text-[10px]">and ready to trade</span>
                </div>
              ) : (
                <div className="h-[38px] hidden lg:block" />
              )}

              <button
                type="button"
                onClick={() => handleAction(partner)}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  partner.buttonTheme === 'purple'
                    ? 'bg-[#5945F1] hover:bg-[#4338CA] text-white shadow-xs'
                    : 'bg-[#BEF226] hover:bg-[#abd923] text-black shadow-xs'
                }`}
              >
                <span>{partner.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Brokers Button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => onNavigateToTab?.('brokers')}
          className="px-6 py-2 bg-white hover:bg-slate-50 border border-indigo-200 text-[#5945F1] font-semibold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>View All Brokers</span>
        </button>
      </div>
    </div>
  );
};
