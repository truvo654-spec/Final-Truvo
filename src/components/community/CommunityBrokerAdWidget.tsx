import React, { useState } from 'react';
import { Megaphone, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Broker } from '../../types';

interface CommunityBrokerAdWidgetProps {
  broker: Broker;
  onOpenConnectModal?: (broker: Broker) => void;
}

export const CommunityBrokerAdWidget: React.FC<CommunityBrokerAdWidgetProps> = ({
  broker,
  onOpenConnectModal,
}) => {
  const [slide, setSlide] = useState(0);
  const totalSlides = 4;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
      <div className="flex items-center gap-1.5 mb-3">
        <Megaphone className="w-4 h-4 text-[#5338ec]" />
        <h4 className="text-sm font-bold text-[#0b1c30]">Broker Ads Section</h4>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-[#0b1c30] to-[#1b0670] p-4 text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wide bg-white/10 px-2 py-0.5 rounded-full">
            Sponsored
          </span>
          <span className="text-xs font-bold">{broker.name}</span>
        </div>
        <p className="text-sm font-bold leading-snug mb-1">Trade smarter with lower fees</p>
        <p className="text-xs text-white/70 mb-4">
          Cashback up to <span className="font-mono font-semibold text-[#CAEB0E]">${broker.cashbackPerLot.toFixed(2)}</span>/lot, exclusive for MarketSyde members.
        </p>
        <button
          onClick={() => onOpenConnectModal?.(broker)}
          className="flex items-center gap-1.5 bg-[#CAEB0E] hover:bg-[#b8d60a] text-[#0b1c30] text-xs font-bold px-4 py-2 rounded-xl transition-colors"
        >
          Trade Now <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Carousel controls (visual — this ad rotates through sponsor slots) */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setSlide((s) => (s - 1 + totalSlides) % totalSlides)}
          aria-label="Previous ad"
          className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#5338ec] hover:border-[#5338ec] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === slide ? 'w-4 bg-[#5338ec]' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setSlide((s) => (s + 1) % totalSlides)}
          aria-label="Next ad"
          className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#5338ec] hover:border-[#5338ec] transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
