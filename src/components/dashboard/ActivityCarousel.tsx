import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BorderBeam } from '../ui/BorderBeam';

interface ActivityCarouselProps {

  onNavigateToTab: (tab: string) => void;
  onConnectBroker?: (brokerName: string) => void;
  onSelectBrokerDetail?: (brokerName: string) => void;
  className?: string;
}

export const ActivityCarousel: React.FC<ActivityCarouselProps> = ({
  onNavigateToTab,
  onConnectBroker,
  onSelectBrokerDetail,
  className = '',
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_SLIDES = 2;

  // Auto-slide every 4 seconds (4000ms)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    }, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
  };

  const handleBrokerClick = (brokerName: string) => {
    if (onConnectBroker) {
      onConnectBroker(brokerName);
    } else if (onSelectBrokerDetail) {
      onSelectBrokerDetail(brokerName);
    } else {
      onNavigateToTab('brokers');
    }
  };

  return (
    <div
      id="activity-carousel"
      aria-label="Activity Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative rounded-2xl p-[2px] bg-gradient-to-r from-[#5945F1]/30 via-[#c084fc]/30 to-[#FD02B0]/30 shadow-2xs group transition-all overflow-hidden ${className}`}
    >
      <BorderBeam
        borderWidth={2.5}
        duration={7}
        colorFrom="#5945F1"
        colorTo="#FD02B0"
      />
      <div className="bg-white rounded-[14px] p-3.5 sm:p-4 relative overflow-hidden">
        {/* Slide 1: Next Milestone (UPS Next Milestone.png) */}
        {currentSlide === 0 && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Top Badge: Next Milestone (positioned over the top right edge) */}
            <div className="flex items-center justify-end -mt-1 -mr-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FE01B1] text-white text-[10px] font-extrabold shadow-xs tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Next Milestone
              </span>
            </div>

            {/* Content Row */}
            <div className="flex items-center justify-between gap-2.5 pt-0.5">
              {/* Blue Rounded Swirl Icon */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E5BF9] to-[#4338CA] text-white flex items-center justify-center shadow-xs shrink-0 p-2">
                <svg viewBox="0 0 32 32" className="w-full h-full fill-none" stroke="currentColor">
                  <path
                    d="M9 10 C13 10 19 22 23 22 C26 22 26 15 22 11 C18 7 13 22 9 22 C6 22 6 15 9 10 Z"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="1.75" strokeOpacity="0.5" />
                </svg>
              </div>

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="font-extrabold text-[13px] sm:text-sm text-[#0b1c30] leading-tight truncate">
                  You're Connected. Nice!
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  Start trading to get cashback
                </div>
              </div>

              {/* Trade Now Button */}
              <button
                onClick={() => onNavigateToTab('signals')}
                className="px-3 py-1.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                Trade Now
              </button>
            </div>
          </div>
        )}

        {/* Slide 2: Pick up where you left off (UPS Pick up where you left off.png) */}
        {currentSlide === 1 && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Header: Pick up where you left off. + View > */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="leading-snug">
                  <span className="font-bold text-sm sm:text-[15px] text-[#5945F1]">Pick up </span>
                  <span className="font-extrabold text-sm sm:text-[15px] text-[#0b1c30]">where you left off</span>
                  <span className="inline-block w-1.5 h-1.5 bg-[#FE01B1] ml-0.5 mb-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                  Complete linking accounts for more perks
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('brokers')}
                className="text-xs font-bold text-[#0b1c30] hover:text-[#5945F1] flex items-center gap-0.5 cursor-pointer transition-colors shrink-0 pt-0.5"
              >
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* 3 Broker Badges: Axi, OANDA, AVATRADE */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {/* Axi (Red Card) */}
              <button
                type="button"
                onClick={() => handleBrokerClick('Axi')}
                title="Connect Axi"
                className="h-11 sm:h-12 rounded-xl bg-[#FF3849] hover:bg-[#e82c3d] text-white flex items-center justify-center p-1.5 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer group/axi"
              >
                <span className="font-black text-base sm:text-lg tracking-tight lowercase select-none group-hover/axi:scale-105 transition-transform">
                  axi
                </span>
              </button>

              {/* OANDA (Midnight Navy Card) */}
              <button
                type="button"
                onClick={() => handleBrokerClick('OANDA')}
                title="Connect OANDA"
                className="h-11 sm:h-12 rounded-xl bg-[#001D38] hover:bg-[#08284d] text-white flex flex-col items-center justify-center p-1.5 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer group/oanda"
              >
                <div className="flex items-center gap-1 leading-none group-hover/oanda:scale-105 transition-transform">
                  <span className="text-[#00FF87] font-black text-xs leading-none">\\/</span>
                  <span className="font-black text-[11px] tracking-wider text-white">OANDA</span>
                </div>
                <span className="text-[6px] text-slate-300 font-bold uppercase tracking-wider scale-90 mt-0.5">
                  SMARTER TRADING
                </span>
              </button>

              {/* AVATRADE (Royal Blue Card) */}
              <button
                type="button"
                onClick={() => handleBrokerClick('AvaTrade')}
                title="Connect AvaTrade"
                className="h-11 sm:h-12 rounded-xl bg-[#4C6EF5] hover:bg-[#3b5de7] text-white flex flex-col items-center justify-center p-1.5 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer group/ava"
              >
                <span className="font-black text-[10px] tracking-wider text-white leading-none group-hover/ava:scale-105 transition-transform">
                  AVATRADE
                </span>
                <span className="text-[5.5px] text-blue-100 font-bold uppercase tracking-tighter scale-90 mt-0.5 leading-none">
                  TRADE WITH CONFIDENCE
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Carousel Footer: Left/Right Arrows & Dots (Auto slides every 4s) */}
        <div className="flex items-center justify-center gap-2 pt-2.5 text-slate-400">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            {[0, 1].map((idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-4 h-1.5 bg-[#5945F1]'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
