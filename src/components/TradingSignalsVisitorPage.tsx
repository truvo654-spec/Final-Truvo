import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
} from 'lucide-react';

interface TradingSignalsVisitorPageProps {
  onOpenSignUp?: () => void;
  onOpenSignIn?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onSelectSignalForAuth?: (pair: string) => void;
}

export const TradingSignalsVisitorPage: React.FC<TradingSignalsVisitorPageProps> = ({
  onOpenSignUp,
  onOpenSignIn,
  onNavigateToTab,
  onSelectSignalForAuth,
}) => {
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const sampleSignals = [
    {
      pair: 'EUR/USD',
      flag: '🇪🇺',
      price: '1.0850',
      action: 'BUY',
      confidence: '95%',
      gain: '+2.4%',
      barColor: 'from-blue-500 to-indigo-600',
    },
    {
      pair: 'GOOGL',
      badge: 'G',
      price: '182.40',
      action: 'BUY',
      confidence: '89%',
      gain: '+3.1%',
      barColor: 'from-amber-400 to-orange-500',
    },
    {
      pair: 'BTC/USD',
      badge: '₿',
      price: '64,800.0',
      action: 'BUY',
      confidence: '87%',
      gain: '+5.8%',
      barColor: 'from-purple-500 to-indigo-600',
    },
    {
      pair: 'S&P 500',
      badge: '500',
      price: '5,540.2',
      action: 'BUY',
      confidence: '92%',
      gain: '+1.9%',
      barColor: 'from-rose-500 to-pink-600',
    },
    {
      pair: 'XAU/USD',
      badge: '🥇',
      price: '2,420.5',
      action: 'BUY',
      confidence: '94%',
      gain: '+14.1%',
      barColor: 'from-emerald-500 to-teal-600',
    },
    {
      pair: 'BTC/USD',
      badge: '₿',
      price: '65,200.0',
      action: 'SELL',
      confidence: '86%',
      gain: '-2.1%',
      barColor: 'from-indigo-500 to-violet-600',
    },
    {
      pair: 'S&P 500',
      badge: '500',
      price: '5,520.0',
      action: 'BUY',
      confidence: '90%',
      gain: '+1.4%',
      barColor: 'from-red-500 to-rose-600',
    },
    {
      pair: 'BTC/USD',
      badge: '₿',
      price: '64,950.0',
      action: 'BUY',
      confidence: '91%',
      gain: '+4.2%',
      barColor: 'from-amber-500 to-yellow-600',
    },
  ];

  const faqs = [
    {
      q: "Why can't I see the live signals on this page?",
      a: "Live signals are intelligence — and intelligence loses its edge the moment it's public. They're delivered exclusively inside the Members Area to registered traders, so the people acting on them are on the inside, not the outside.",
    },
    {
      q: 'Where do the signals come from?',
      a: 'Signals are generated through a rigorous hybrid methodology combining institutional-grade algorithmic quant models, multi-timeframe price action analysis, and veteran proprietary trader oversight.',
    },
    {
      q: 'Do you guarantee profits?',
      a: 'No reputable financial platform guarantees trading profits. MarketSyde provides quantified edge, disciplined risk-to-reward frameworks, and transparent confidence metrics to significantly improve trade execution.',
    },
    {
      q: 'Is it really free to start?',
      a: 'Yes, absolutely. You can create a free account, explore the platform, access foundational signals, and earn Syde Points and Credits through daily engagement and trading volume.',
    },
    {
      q: 'How will I know when a new signal drops?',
      a: 'Members receive real-time notifications via browser alerts, telegram webhook sync, and direct dashboard flash radars with entry, stop-loss, and multi-tier take-profit levels.',
    },
  ];

  return (
    <div className="w-full bg-[#FAFAFC] text-[#0b1c30] overflow-x-hidden font-sans selection:bg-[#5945F1]/20 selection:text-[#5945F1] pb-24">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
          "You're one step from seeing Live Opportunities."
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-16 pb-12 px-4 sm:px-6 md:px-12 flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0b1c30] leading-[1.1]">
            You're <span className="text-[#0b1c30]">one step from seeing</span>
            <br />
            <span className="text-[#5945F1]">Live Opportunities.</span>
          </h1>

          {/* Key Stat Badges with neon yellow dots */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#bef226]" />
              <span className="font-bold text-slate-900">1,200+</span>
              <span className="text-slate-500 font-normal">Instruments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#bef226]" />
              <span className="font-bold text-slate-900">70% up</span>
              <span className="text-slate-500 font-normal">confidence rates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#bef226]" />
              <span className="font-bold text-slate-900">24/7</span>
              <span className="text-slate-500 font-normal">Real-time alert</span>
            </div>
          </div>

          {/* Primary CTA Button: Neon Lime Banner */}
          <div className="pt-6">
            <button
              onClick={onOpenSignUp}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#bef226] hover:bg-[#aee619] text-black font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Sign Up and Unlock Signals</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── Blurred Live Signals Carousel / Teaser Strip ─── */}
        <div className="w-full max-w-6xl mx-auto mt-12 overflow-hidden relative py-4">
          {/* Subtle gradient overlays on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FAFAFC] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#FAFAFC] to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar px-6">
            {sampleSignals.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (onSelectSignalForAuth) {
                    onSelectSignalForAuth(item.pair);
                  } else if (onOpenSignUp) {
                    onOpenSignUp();
                  }
                }}
                className="shrink-0 w-44 bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-2xs relative group cursor-pointer hover:border-[#5945F1]/50 transition-all hover:scale-102 select-none"
              >
                {/* Header with pair and badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                      {item.flag || item.badge}
                    </div>
                    <span className="font-bold text-xs text-slate-900">{item.pair}</span>
                  </div>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      item.action === 'BUY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.action}
                  </span>
                </div>

                {/* Blurred price details */}
                <div className="relative my-2 py-1">
                  <div className="filter blur-[4px] select-none text-[11px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-mono font-bold text-slate-800">{item.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stop:</span>
                      <span className="font-mono text-slate-600">Locked</span>
                    </div>
                  </div>

                  {/* Overlay Lock & Confidence Chip */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#5945F1] text-white text-[11px] font-black tracking-tight shadow-xs flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{item.confidence}</span>
                    </span>
                  </div>
                </div>

                {/* Sparkline teaser */}
                <div className="h-6 w-full opacity-60">
                  <svg viewBox="0 0 100 24" className="w-full h-full stroke-emerald-500 fill-none" strokeWidth="2">
                    <path d="M 0 18 Q 25 8 50 14 T 100 6" />
                  </svg>
                </div>

                {/* Buy / Sell Button for Visitors */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectSignalForAuth) {
                      onSelectSignalForAuth(item.pair);
                    } else if (onOpenSignUp) {
                      onOpenSignUp();
                    }
                  }}
                  className="w-full mt-2.5 py-1.5 px-3 rounded-lg border border-indigo-200/90 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 group/btn"
                >
                  {item.action === 'BUY' ? (
                    <>
                      <span className="font-bold text-xs text-[#65a30d]">Buy</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#65a30d] stroke-[2.5] group-hover/btn:translate-x-0.5 transition-transform" />
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-xs text-[#5338F5]">Sell</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#5338F5] stroke-[2.5] group-hover/btn:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: SAME SIGNAL STRUCTURE, ALWAYS PREDICTABLE
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <div className="bg-[#EBF0F7] rounded-3xl p-8 sm:p-12 border border-slate-200/60 shadow-xs">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
              Same signal structure,
            </h2>
            <div className="text-3xl sm:text-4xl font-black text-[#5945F1] tracking-tight mt-0.5 flex items-center gap-1">
              <span>always predictable</span>
              <span className="w-2 h-2 rounded-xs bg-[#FD02B0]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {/* 01 */}
            <div className="space-y-2">
              <div className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                01 · Asset & Direction
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Forex, Crypto, Commodities, Indices or Stocks — clearly tagged Buy or Sell.
              </p>
            </div>

            {/* 02 */}
            <div className="space-y-2">
              <div className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                02 · Entry, Stop-Loss & Take-Profit
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Precise price levels so you can size and manage the trade with discipline.
              </p>
            </div>

            {/* 03 */}
            <div className="space-y-2">
              <div className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                03 · Confidence Score
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A transparent reliability read based on current market conditions — filter by your risk appetite.
              </p>
            </div>

            {/* 04 */}
            <div className="space-y-2">
              <div className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                04 · Analyst Notes & Scenarios
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instrument analysis · Multi-broker dashboard · AI trading companion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: INTELLIGENCE YOU CAN AUDIT (Three overlapping circles)
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Text */}
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight leading-tight">
              Intelligence
              <br />
              you can
              <br />
              <span className="text-[#5945F1]">audit.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When we get a call right, the record shows it. When we get one wrong, we own it — out loud. That's the deal.
            </p>
          </div>

          {/* Right Visual: Three Venn-like overlapping circles */}
          <div className="relative flex items-center justify-center min-h-[220px] w-full max-w-md">
            {/* Circle 1: Neon Lime */}
            <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-[#bef226] text-black flex flex-col items-center justify-center p-4 text-center z-10 -mr-10 shadow-sm">
              <div className="font-black text-sm sm:text-base">Daily</div>
              <div className="text-[11px] text-slate-800 font-medium leading-tight mt-1">
                Fresh signals
                <br />
                published
              </div>
            </div>

            {/* Circle 2: Purple / Indigo */}
            <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#5945F1] text-white flex flex-col items-center justify-center p-4 text-center z-20 shadow-md">
              <div className="font-black text-lg sm:text-xl">100%</div>
              <div className="text-[11px] text-purple-100 font-medium leading-tight mt-1">
                Signals carry a
                <br />
                confidence score
              </div>
            </div>

            {/* Circle 3: White / Subtle glow ring */}
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white border border-slate-200 text-[#5945F1] flex flex-col items-center justify-center p-4 text-center z-10 -ml-10 shadow-xs">
              <div className="font-black text-sm sm:text-base">24/7</div>
              <div className="text-[11px] text-slate-600 font-medium leading-tight mt-1">
                Real-time alerts
                <br />
                on premium
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: THREE STEPS TO YOUR FIRST SIGNAL
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Step List */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step 1 */}
            <div className="space-y-2 relative pl-6 border-l-2 border-slate-200">
              <span className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-[#FD02B0]" />
              <div className="font-bold text-sm text-slate-900">
                01 · Create your account
              </div>
              <p className="text-xs text-slate-500">
                Free to join. Your signals live inside the Members Area, tied to your trader profile and level.
              </p>
              <div className="pt-1">
                <button
                  onClick={onOpenSignUp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FD02B0] hover:bg-[#e0029c] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <span>Create Account Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-1 relative pl-6 border-l-2 border-slate-200">
              <span className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-[#bef226]" />
              <div className="font-bold text-sm text-slate-900">
                02 · Filter to your style
              </div>
              <p className="text-xs text-slate-500">
                Free to join. Your signals live inside the Members Area, tied to your trader profile and level.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-1 relative pl-6 border-l-2 border-slate-200">
              <span className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-[#5945F1]" />
              <div className="font-bold text-sm text-slate-900">
                03 · Get alerted, act fast
              </div>
              <p className="text-xs text-slate-500">
                New signals push to you in real time. Save them, set alerts, and build a watchlist as you level up.
              </p>
            </div>
          </div>

          {/* Right Giant Typography & Hand-drawn Arrow visual */}
          <div className="lg:col-span-6 flex flex-col items-start lg:items-center justify-center relative">
            {/* Curved Arrow SVG */}
            <div className="w-32 h-16 text-[#5945F1] mb-2 hidden sm:block">
              <svg viewBox="0 0 120 50" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 110 40 Q 60 5 10 30" />
                <polyline points="15,18 8,30 22,34" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0b1c30] tracking-tight leading-tight">
              Three steps
              <br />
              to your
              <br />
              <span className="text-[#5945F1]">first signal.</span>
            </h2>

            {/* Floating indigo orb */}
            <div className="w-8 h-8 rounded-full bg-[#5945F1] mt-6 shadow-sm" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: THE MORE TRADE THE MORE YOU UNLOCK
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">
              The more <span className="text-[#5945F1]">trade</span>
            </div>
            <div className="text-3xl sm:text-5xl font-black text-[#0b1c30] tracking-tight flex items-center gap-1">
              <span>the more you unlock</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-[#FD02B0]" />
            </div>
          </div>

          {/* Border-gradient outlined pill badge */}
          <div className="max-w-md p-4 sm:p-5 rounded-2xl border border-[#5945F1]/40 bg-white shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed">
            Signals scale with your level. Start free, then earn your way deeper inside — more history, faster access, and AI-assisted picks.
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-6">
          <button
            onClick={onOpenSignUp}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#5945F1] hover:bg-[#492CED] text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer"
          >
            <span>Sign Up and Unlock Signals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: FREQUENTLY ASKED QUESTION (FAQ)
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-20">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5945F1]">
            Frequently Asked Question (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Questions before you join.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 hover:text-[#5945F1] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#5945F1] shrink-0 font-bold text-base">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-[#FAFAFC]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: YOU'RE EITHER ON THE INSIDE, OR THE OUTSIDE (Banner)
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="bg-[#5945F1] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-md">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              You're either on
              <br />
              <span className="text-[#bef226]">the inside,</span> or the outside
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Join MarketSyde and put yourself on the inside of the market — with signals built to give you a genuine edge.
            </p>
          </div>

          <button
            onClick={onOpenSignUp}
            className="shrink-0 px-8 py-4 rounded-xl bg-[#bef226] hover:bg-[#aee619] text-black font-black text-sm sm:text-base shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Unlock Signals — Free</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </section>
    </div>
  );
};
