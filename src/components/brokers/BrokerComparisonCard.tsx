import React from 'react';
import { Broker } from '../../types';
import { Check, ArrowRight } from 'lucide-react';

interface BrokerComparisonCardProps {
  broker: Broker;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const BrokerComparisonCard: React.FC<BrokerComparisonCardProps> = ({
  broker,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  return (
    <div className="w-full p-[1.5px] rounded-[24px] bg-gradient-to-r from-[#5945F1] via-[#FD02B0] to-[#5945F1] shadow-xs">
      <div className="bg-white rounded-[22.5px] p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        {/* Left Side: Callout Text & Action Buttons */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-4 text-left">
          <div>
            <h3 className="font-display font-black text-2xl sm:text-[28px] text-[#0b1c30] leading-tight">
              How <span className="text-[#0b1c30]">{broker.name}</span>{' '}
              <span className="text-[#5945F1]">Compares</span>
              <span className="text-[#FD02B0]">.</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Compare key features side-by-syde with similar brokers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onSeeComparison}
              className="px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>See Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onExploreAllBrokers}
              className="px-5 py-2.5 rounded-xl border border-[#5945F1] hover:bg-[#EEF2FF] text-[#5945F1] font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Explore All Brokers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: 3 Broker Cards in a Row (HFM, Exness, Fx Pro) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: HFM */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 flex flex-col items-center text-center shadow-2xs relative">
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black font-extrabold text-[9px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Verified</span>
              </span>
            </div>

            {/* HFM Logo */}
            <div className="w-12 h-12 rounded-xl bg-black flex flex-col items-center justify-center text-white shrink-0 p-1 mt-1">
              <div className="font-black text-sm tracking-tight leading-none flex items-center">
                <span>HF</span>
                <span className="text-red-600">M</span>
              </div>
              <span className="text-[5px] text-white/90 font-bold tracking-widest mt-0.5 uppercase">
                HF MARKETS
              </span>
            </div>

            <h4 className="font-bold text-sm text-[#0b1c30] mt-2">HFM</h4>

            <div className="mt-1">
              <div className="text-sm font-extrabold text-[#5945F1]">$8.00</div>
              <div className="text-[10px] text-slate-400 font-medium">Max Cashback</div>
            </div>

            <div className="w-full border-t border-slate-100 my-2.5" />

            <div className="w-full space-y-1 text-[11px] text-slate-600 font-medium text-center">
              <div>
                Deposit: <span className="text-[#5945F1] font-bold">$10</span>
              </div>
              <div>
                Spread: <span className="text-[#5945F1] font-bold">0.0 - 0.1</span>
              </div>
              <div>
                Leverage: <span className="text-[#5945F1] font-bold">Unlimited</span>
              </div>
            </div>
          </div>

          {/* Card 2: Exness */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 flex flex-col items-center text-center shadow-2xs relative">
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black font-extrabold text-[9px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Verified</span>
              </span>
            </div>

            {/* Exness Logo (Yellow with ex) */}
            <div className="w-12 h-12 rounded-xl bg-[#F8E300] flex items-center justify-center text-black font-black text-lg shrink-0 mt-1 shadow-2xs">
              ex
            </div>

            <h4 className="font-bold text-sm text-[#0b1c30] mt-2">Exness</h4>

            <div className="mt-1">
              <div className="text-sm font-extrabold text-[#5945F1]">$8.00</div>
              <div className="text-[10px] text-slate-400 font-medium">Max Cashback</div>
            </div>

            <div className="w-full border-t border-slate-100 my-2.5" />

            <div className="w-full space-y-1 text-[11px] text-slate-600 font-medium text-center">
              <div>
                Deposit: <span className="text-[#5945F1] font-bold">$10</span>
              </div>
              <div>
                Spread: <span className="text-[#5945F1] font-bold">0.0 - 0.1</span>
              </div>
              <div>
                Leverage: <span className="text-[#5945F1] font-bold">1:500</span>
              </div>
            </div>
          </div>

          {/* Card 3: Fx Pro */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 flex flex-col items-center text-center shadow-2xs relative">
            {/* FxPro Logo (Red with FxPro) */}
            <div className="w-12 h-12 rounded-xl bg-[#D92228] flex flex-col items-center justify-center text-white shrink-0 p-1 mt-1 shadow-2xs">
              <span className="font-black text-xs leading-none tracking-tight">FxPro</span>
              <span className="text-[5px] text-white/80 font-bold uppercase mt-0.5">
                Trade Like a Pro
              </span>
            </div>

            <h4 className="font-bold text-sm text-[#0b1c30] mt-2">Fx Pro</h4>

            <div className="mt-1">
              <div className="text-sm font-extrabold text-[#5945F1]">$8.00</div>
              <div className="text-[10px] text-slate-400 font-medium">Max Cashback</div>
            </div>

            <div className="w-full border-t border-slate-100 my-2.5" />

            <div className="w-full space-y-1 text-[11px] text-slate-600 font-medium text-center">
              <div>
                Deposit: <span className="text-[#5945F1] font-bold">$10</span>
              </div>
              <div>
                Spread: <span className="text-[#5945F1] font-bold">0.0 - 0.1</span>
              </div>
              <div>
                Leverage: <span className="text-[#5945F1] font-bold">1:1500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
