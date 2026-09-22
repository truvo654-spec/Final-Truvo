import React from 'react';
import { Check } from 'lucide-react';
import { BorderBeam } from '../ui/BorderBeam';

export interface MoreConnectedBrokersBannerProps {
  onConnectBroker?: (brokerName: string) => void;
  onNavigateToTab?: (tab: string) => void;
  className?: string;
  titleOverride?: React.ReactNode;
  subtitleOverride?: string;
}

interface BrokerItem {
  id: string;
  name: string;
  cashbackRate: string;
  verified: boolean;
  renderLogo: () => React.ReactNode;
}

const BROKERS_LIST: BrokerItem[] = [
  {
    id: 'xm',
    name: 'XM',
    cashbackRate: '$8.00',
    verified: true,
    renderLogo: () => (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-black flex items-center justify-center p-2 shadow-xs select-none">
        <svg viewBox="0 0 54 32" className="w-11 h-7 sm:w-12 sm:h-8" fill="none">
          {/* Upper left red triangle of X */}
          <polygon points="6,4 18,4 12,16 6,16" fill="#E11928" />
          {/* Lower left white wing of X */}
          <polygon points="6,28 18,28 12,16 6,16" fill="#FFFFFF" />
          {/* Right wing of X */}
          <polygon points="26,4 32,4 18,28 12,28" fill="#FFFFFF" />
          <polygon points="12,4 18,4 32,28 26,28" fill="#FFFFFF" />
          {/* M letter */}
          <path
            d="M36,28 V4 H42 L46,18 L50,4 H56 V28 H51 V12 L47,26 H45 L41,12 V28 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
  },
  {
    id: 'hfm',
    name: 'HFM',
    cashbackRate: '$8.00',
    verified: true,
    renderLogo: () => (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-black flex flex-col items-center justify-center p-2 shadow-xs leading-none select-none">
        <div className="flex items-center font-black text-base sm:text-lg tracking-tight">
          <span className="text-white">HF</span>
          <span className="text-[#E11928]">M</span>
        </div>
        <span className="text-[6px] sm:text-[7px] text-slate-300 font-bold uppercase tracking-widest mt-1">
          HF MARKETS
        </span>
      </div>
    ),
  },
  {
    id: 'exness',
    name: 'Exness',
    cashbackRate: '$8.00',
    verified: true,
    renderLogo: () => (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#FFCC00] flex items-center justify-center p-2 shadow-xs select-none">
        <span className="font-bold text-black text-2xl sm:text-3xl font-sans tracking-tighter leading-none">
          ex
        </span>
      </div>
    ),
  },
  {
    id: 'pepperstone',
    name: 'Pepperstone',
    cashbackRate: '$8.00',
    verified: false,
    renderLogo: () => (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#0066FF] flex flex-col items-center justify-center p-2 shadow-xs leading-none select-none">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current" stroke="none">
          <path d="M12 2L4 5.5v5.5c0 5.25 3.42 10.18 8 11.5 4.58-1.32 8-6.25 8-11.5V5.5L12 2zm1 11h-2v-4h2c1.1 0 2 .9 2 2s-.9 2-2 2z" />
        </svg>
        <span className="text-[7.5px] sm:text-[8.5px] text-white font-semibold lowercase tracking-tight mt-1">
          pepperstone
        </span>
      </div>
    ),
  },
  {
    id: 'icmarkets',
    name: 'IC Markets',
    cashbackRate: '$8.00',
    verified: false,
    renderLogo: () => (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-black flex flex-col items-center justify-center p-2 shadow-xs leading-none text-center select-none">
        <div className="flex items-center gap-1">
          {/* Signal bars */}
          <div className="flex items-end gap-[1.5px] h-3.5">
            <span className="w-1 h-1.5 bg-[#00D084] rounded-xs" />
            <span className="w-1 h-2.5 bg-[#00D084] rounded-xs" />
            <span className="w-1 h-3.5 bg-[#00D084] rounded-xs" />
          </div>
          <span className="font-extrabold text-[#00D084] text-sm sm:text-base leading-none">IC</span>
        </div>
        <span className="text-[8.5px] sm:text-[9.5px] text-white font-bold leading-tight mt-0.5">
          Markets
        </span>
        <span className="text-[6px] sm:text-[7px] text-slate-400 font-medium leading-tight">
          Global
        </span>
      </div>
    ),
  },
  {
    id: 'fxpro',
    name: 'FxPro',
    cashbackRate: '$8.00',
    verified: false,
    renderLogo: () => (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#E61C24] flex flex-col items-center justify-center p-2 shadow-xs leading-none text-center select-none">
        <span className="font-black text-white text-base sm:text-lg tracking-tight font-serif">
          FxPro
        </span>
        <span className="text-[6px] sm:text-[7px] text-white/90 font-medium tracking-tight mt-0.5">
          Trade Like a Pro
        </span>
      </div>
    ),
  },
];

export const MoreConnectedBrokersBanner: React.FC<MoreConnectedBrokersBannerProps> = ({
  onConnectBroker,
  onNavigateToTab,
  className = '',
  titleOverride,
  subtitleOverride,
}) => {
  return (
    <div
      id="tour-brokers-section"
      data-banner-id="more-connected-brokers-banner"
      className={`w-full p-[2px] rounded-3xl bg-gradient-to-r from-[#5945F1]/30 via-[#A855F7]/30 to-[#FD02B0]/30 shadow-2xs relative overflow-hidden ${className}`}
    >
      <BorderBeam
        borderWidth={2.5}
        duration={10}
        colorFrom="#5945F1"
        colorTo="#FD02B0"
      />
      <div className="w-full rounded-[22px] bg-white dark:bg-[#170345] p-5 sm:p-7 md:p-8 space-y-6">
        {/* ─── TITLE & SUBTITLE (1:1 with Small Banner 3.png) ─── */}
        <div className="text-center space-y-1.5">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-[28px] leading-tight tracking-tight">
            {titleOverride ?? (
              <>
                <span className="text-[#5945F1]">More Connected Brokers</span>
                <span className="text-[#FACC15]">.</span>
                <span className="text-[#5945F1]"> More Opportunitie</span>
                <span className="text-[#FD02B0]">s.</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-normal">
            {subtitleOverride ?? 'Connect more broker partners and give your trades more ways to earn cashback.'}
          </p>
        </div>

        {/* ─── BROKER CARDS ROW (1:1 with Small Banner 3.png) ─── */}
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 min-w-[680px] lg:min-w-0">
            {BROKERS_LIST.map((broker) => (
              <div
                key={broker.id}
                onClick={() => onConnectBroker?.(broker.name)}
                className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 flex flex-col items-center justify-between text-center space-y-2.5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                {/* Verified Badge or Empty Placeholder */}
                {broker.verified ? (
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-[#bef264] px-2.5 py-0.5 rounded-md shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <div className="h-[21px]" />
                )}

                {/* Broker Logo Box */}
                <div className="group-hover:scale-105 transition-transform duration-200">
                  {broker.renderLogo()}
                </div>

                {/* Broker Name & Cashback */}
                <div className="space-y-0.5">
                  <div className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                    {broker.name}
                  </div>
                  <div className="text-sm font-bold text-[#5945F1] font-mono leading-none">
                    {broker.cashbackRate}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal">
                    Max Cashback
                  </div>
                </div>

                {/* Connect Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnectBroker?.(broker.name);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl border border-indigo-100/90 bg-white hover:bg-indigo-50/60 active:scale-95 text-[#5945F1] font-semibold text-xs sm:text-[13px] shadow-2xs transition-all cursor-pointer"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── BOTTOM EXPLORE ALL BROKERS BUTTON (1:1 with Small Banner 3.png) ─── */}
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={() => onNavigateToTab?.('brokers')}
            className="px-8 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4836d9] text-white font-bold text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            Explore All Brokers
          </button>
        </div>
      </div>
    </div>
  );
};
