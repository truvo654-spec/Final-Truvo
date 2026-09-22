import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Coins, Users, Flame, Gift, Play, Pause } from 'lucide-react';

interface PromoSlide {
  id: string;
  title: string;
  description: string;
  theme: 'ink' | 'violet' | 'magenta' | 'deep';
  targetDate: string;
  // Graphic content (mega-menu style context card)
  label: string;
  icon: React.ReactNode;
  iconBoxClass: string;
  mainValue: string;
  mainValueSub: string;
  mainValueSubColor: string;
  statValue: string;
  statLabel: string;
  badgeText: string;
  badgeClass: string;
  blobClass: string;
}

function getFutureDate(days: number, hours: number, minutes: number, seconds: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours, d.getMinutes() + minutes, d.getSeconds() + seconds);
  return d.toISOString();
}

function calcTimeLeft(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// 4 promotions dreamed up for MarketSyde's cashback/rewards platform
const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'double-cashback-weekend',
    title: 'Double Cashback Weekend',
    description: 'Every trade this weekend earns 2x rebates across all connected brokers.',
    theme: 'ink',
    targetDate: getFutureDate(2, 14, 0, 0),
    label: 'CASHBACK',
    icon: <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />,
    iconBoxClass: 'bg-gradient-to-br from-amber-400 to-amber-600',
    mainValue: '2.0X',
    mainValueSub: 'rebate rate',
    mainValueSubColor: 'text-emerald-400',
    statValue: '$76',
    statLabel: 'avg per trade',
    badgeText: 'CLAIM',
    badgeClass: 'bg-[#10b981] group-hover:bg-[#059669]',
    blobClass: 'bg-[#CAEB0E]',
  },
  {
    id: 'referral-bonus',
    title: 'Refer a Trader, Earn $50',
    description: 'Invite a friend to MarketSyde and get $50 in credits once they place their first trade.',
    theme: 'violet',
    targetDate: getFutureDate(14, 0, 0, 0),
    label: 'REFERRAL',
    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />,
    iconBoxClass: 'bg-gradient-to-br from-sky-400 to-sky-600',
    mainValue: '$50',
    mainValueSub: 'per referral',
    mainValueSubColor: 'text-sky-400',
    statValue: '\u221E',
    statLabel: 'no limit',
    badgeText: 'INVITE',
    badgeClass: 'bg-[#10b981] group-hover:bg-[#059669]',
    blobClass: 'bg-[#38BDF8]',
  },
  {
    id: 'streak-challenge',
    title: '7-Day Streak Challenge',
    description: 'Trade 7 days in a row this month to unlock +300 bonus points instantly.',
    theme: 'magenta',
    targetDate: getFutureDate(9, 6, 0, 0),
    label: 'STREAK',
    icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />,
    iconBoxClass: 'bg-gradient-to-br from-orange-400 to-orange-600',
    mainValue: 'Day 7',
    mainValueSub: 'unlocks bonus',
    mainValueSubColor: 'text-orange-300',
    statValue: '+300',
    statLabel: 'points',
    badgeText: 'GO',
    badgeClass: 'bg-[#10b981] group-hover:bg-[#059669]',
    blobClass: 'bg-[#FDBA02]',
  },
  {
    id: 'new-broker-welcome',
    title: 'New Broker Welcome Offer',
    description: 'Connect a new broker this week and get an instant $25 cashback boost.',
    theme: 'deep',
    targetDate: getFutureDate(5, 20, 0, 0),
    label: 'WELCOME',
    icon: <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />,
    iconBoxClass: 'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600',
    mainValue: '$25',
    mainValueSub: 'instant boost',
    mainValueSubColor: 'text-fuchsia-300',
    statValue: 'NEW',
    statLabel: 'brokers only',
    badgeText: 'CLAIM',
    badgeClass: 'bg-[#10b981] group-hover:bg-[#059669]',
    blobClass: 'bg-[#FD02B0]',
  },
];

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className="font-display text-sm sm:text-base font-extrabold text-white tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[7px] sm:text-[8px] uppercase tracking-wider text-white/45 font-bold mt-1">
        {label}
      </span>
    </div>
  );
}

const THEME_BG: Record<PromoSlide['theme'], string> = {
  ink: 'bg-[#5945F1]',
  violet: 'bg-[#FD02B0]',
  magenta: 'bg-[#5945F1]',
  deep: 'bg-[#FD02B0]',
};

/**
 * Mega-menu-style context graphic (matches InteractiveTradeGraphic's "signals" card):
 * a soft colored blob behind a tilted dark card that carries real context —
 * a label row, an icon + headline value, a secondary stat — plus a floating
 * reward pill poking out at the corner. Sized to read at a glance, not just an icon.
 */
function PromoGraphic({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative shrink-0 w-[170px] sm:w-[210px] flex items-center justify-center group">
      {/* Soft colored blob */}
      <div className={`absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full ${slide.blobClass} opacity-25 blur-xl pointer-events-none`} />

      {/* Tilted dark context card */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#0f1115] border border-white/10 shadow-xl p-3.5 sm:p-5 transform -rotate-6 transition-transform duration-300 group-hover:rotate-0 overflow-visible">
        {/* Top Row: dot + label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-white shadow-xs shrink-0" />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-white/80 uppercase font-mono truncate">
            {slide.label}
          </span>
        </div>

        {/* Middle Row: Icon box + Main value + sub label */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl ${slide.iconBoxClass} flex items-center justify-center shadow-md shrink-0`}>
            {slide.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg font-black text-white leading-tight tracking-tight truncate">
              {slide.mainValue}
            </span>
            <span className={`text-[10px] sm:text-xs font-bold ${slide.mainValueSubColor} truncate`}>
              {slide.mainValueSub}
            </span>
          </div>
        </div>

        {/* Bottom Row: big stat + small label */}
        <div className="flex items-baseline gap-1.5 pt-2 border-t border-white/10">
          <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
            {slide.statValue}
          </span>
          <span className="text-[10px] sm:text-xs text-white/60 font-medium truncate">
            {slide.statLabel}
          </span>
        </div>

        {/* Floating reward pill poking out at bottom right */}
        <div
          className={`absolute -bottom-2.5 -right-2.5 ${slide.badgeClass} text-white text-[10px] sm:text-xs font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wide shadow-lg transition-transform group-hover:scale-105`}
        >
          {slide.badgeText}
        </div>
      </div>
    </div>
  );
}

const PromoCard = React.forwardRef<HTMLDivElement, { slide: PromoSlide }>(({ slide }, ref) => {
  const { days, hours, minutes, seconds } = useCountdown(slide.targetDate);
  const bgClass = THEME_BG[slide.theme];

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl ${bgClass} p-6 sm:p-8 min-h-[290px] sm:min-h-[340px] h-full flex items-center justify-between gap-4 shadow-2xs interactive-card`}
    >
      {/* Decorative glow */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 min-w-0 flex-1">
        <h3 className="font-display text-base sm:text-xl font-extrabold text-white leading-snug">
          {slide.title}
        </h3>
        <p className="text-[11px] sm:text-sm text-white/55 mt-2 leading-snug line-clamp-2">
          {slide.description}
        </p>

        <div className="flex items-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          <CountdownBlock value={days} label="Days" />
          <span className="text-white/25 font-bold text-sm pb-3">:</span>
          <CountdownBlock value={hours} label="Hours" />
          <span className="text-white/25 font-bold text-sm pb-3">:</span>
          <CountdownBlock value={minutes} label="Min" />
          <span className="text-white/25 font-bold text-sm pb-3">:</span>
          <CountdownBlock value={seconds} label="Sec" />
        </div>
      </div>

      <PromoGraphic slide={slide} />
    </div>
  );
});
PromoCard.displayName = 'PromoCard';

interface PromotionWidgetProps {
  slides?: PromoSlide[];
}

export const PromotionWidget: React.FC<PromotionWidgetProps> = ({ slides = PROMO_SLIDES }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const isProgrammaticScroll = useRef(false);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];
    if (!track || !card) return;
    isProgrammaticScroll.current = true;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  };

  // Autoplay: advance to the next card every 4s
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => {
        const next = (i + 1) % slides.length;
        scrollToIndex(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, slides.length]);

  // Keep the dots in sync when the user manually scrolls/swipes the track
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const trackLeft = track.getBoundingClientRect().left;
        let closest = 0;
        let closestDist = Infinity;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setActiveIndex(closest);
      });
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [slides.length]);

  const dots = useMemo(() => slides.map((s) => s.id), [slides]);

  return (
    <div className="space-y-3">
      {/* Horizontal-scroll carousel: shows ~2.5 cards at a time on desktop */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="snap-start shrink-0 w-[88%] sm:w-[46%]"
          >
            <PromoCard slide={slide} />
          </div>
        ))}
      </div>

      {/* Carousel indicator row */}
      <div className="flex items-center justify-center gap-1.5">
        {dots.map((id, i) => (
          <button
            key={id}
            onClick={() => {
              setActiveIndex(i);
              scrollToIndex(i);
            }}
            aria-label={`Go to promotion slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === activeIndex ? 'w-5 bg-[#0b1c30]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Pause promotions carousel' : 'Play promotions carousel'}
          className="ml-1.5 w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer"
        >
          {isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
        </button>
      </div>
    </div>
  );
};
