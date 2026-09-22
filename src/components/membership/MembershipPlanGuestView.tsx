import React, { useState } from 'react';
import {
  ArrowRight,
  Plus,
  Minus,
  Mail,
  UserPlus,
  Coins,
  Wine,
  KeyRound,
  Gem,
  Award,
} from 'lucide-react';

export interface MembershipPlanGuestViewProps {
  onOpenSignUp?: () => void;
  onOpenSignIn?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

export const MembershipPlanGuestView: React.FC<MembershipPlanGuestViewProps> = ({
  onOpenSignUp,
  onOpenSignIn,
  onNavigateToTab,
  onShowToast,
}) => {
  // Accordion state for "Got Questions?"
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const faqList = [
    {
      q: 'Do I need to pay for a membership?',
      a: 'No, MarketSyde is 100% free to join. There are no monthly fees, subscription charges, or hidden costs. Every trader starts at the Rookie level immediately upon creating a free account.',
    },
    {
      q: 'How do I move up?',
      a: 'You level up automatically as you trade with any of our connected partner brokers. Every closed lot earns you Points. Once you hit the required points threshold (100 for Climber, 250 for Player, 500 for Boss), your tier upgrades automatically.',
    },
    {
      q: 'Do I need to claim rewards?',
      a: 'No claims or manual requests required. Your cashback boost rate, enhanced signal confidence tiers, and broker discounts are applied automatically to your account as soon as your tier upgrades.',
    },
    {
      q: 'How do I earn points?',
      a: 'Points are generated automatically with every trade you place through connected accounts. 1 standard forex or metals lot generates points toward your tier progression, compounding alongside your cash rebates.',
    },
  ];

  return (
    <div className="w-full bg-white text-[#0b1c30] font-sans antialiased overflow-x-hidden selection:bg-[#5945F1]/15 selection:text-[#5945F1] pt-20 sm:pt-24">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HERO SECTION
          "Free to join. Trade more, Get More."
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-10 pb-12 sm:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-12">
          {/* Left Headline */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-normal tracking-tight text-[#0b1c30]">
              Free to join.{' '}
              <span className="font-extrabold text-[#0b1c30]">Trade more,</span>
            </h1>

            {/* Giant "Get More." with Hot Pink Dot */}
            <div className="text-6xl sm:text-7xl lg:text-[92px] font-black tracking-tighter text-[#5945F1] leading-[0.95] select-none">
              Get More<span className="text-[#FE01B1]">.</span>
            </div>
          </div>

          {/* Right Subtitle */}
          <div className="lg:max-w-md text-slate-600 text-sm sm:text-base leading-relaxed pb-2">
            <p>
              The higher your level, the better the cashback, perks, and rewards.{' '}
              <strong className="text-[#0b1c30] font-bold block sm:inline">
                Simple as that.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. "How It Works." SECTION WITH LIME CAPSULE SHAPE ON LEFT
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          
          {/* Left Lime Green Shape with "How It Works." */}
          <div className="w-full lg:w-auto shrink-0 flex items-center justify-start">
            <div className="relative bg-[#CAEB0E] rounded-3xl lg:rounded-r-[110px] lg:rounded-l-3xl px-8 sm:px-12 py-8 sm:py-10 shadow-sm w-full sm:w-auto min-w-[280px] sm:min-w-[320px]">
              <div className="space-y-0.5">
                <div className="text-3xl sm:text-4xl font-normal text-[#0b1c30] tracking-tight">
                  How <span className="font-extrabold">It</span>
                </div>
                <div className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#5945F1] tracking-tight leading-none">
                  Works<span className="text-[#FE01B1]">.</span>
                </div>
              </div>

              {/* Curved Purple Arrow Swooping Up & Right towards Step 1 */}
              <div className="hidden lg:block absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-16 pointer-events-none">
                <svg
                  viewBox="0 0 80 60"
                  fill="none"
                  className="w-full h-full text-[#5945F1]"
                >
                  <path
                    d="M 5 35 Q 35 15 65 18"
                    stroke="#5945F1"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 52 10 L 68 18 L 54 28"
                    stroke="#5945F1"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Flow: 3 Steps with Dotted Arrows and Caption */}
          <div className="flex-1 w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8">
            
            {/* The 3 Steps Horizontal Layout */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 px-2 sm:px-6">
              
              {/* Step 1: Sign up free */}
              <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-[#5945F1]/30 flex items-center justify-center text-[#5945F1] shadow-2xs group-hover:scale-105 transition-transform">
                  <KeyRound className="w-7 h-7 stroke-[2.2] -rotate-45" />
                </div>
                <div className="font-extrabold text-[#5945F1] text-base sm:text-lg">
                  Sign up free
                </div>
              </div>

              {/* Dotted Arrow 1 */}
              <div className="hidden sm:flex items-center justify-center text-slate-300 font-bold tracking-widest text-lg select-none px-2">
                <span className="border-b-2 border-dotted border-slate-400 w-16 sm:w-20 inline-block relative -top-0.5" />
                <span className="text-slate-500 font-bold -ml-1 text-xs">▶</span>
              </div>

              {/* Step 2: Trade & Earn Points */}
              <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-14 h-14 rounded-full bg-pink-50 border-2 border-[#FE01B1]/40 flex items-center justify-center text-[#FE01B1] shadow-2xs group-hover:scale-105 transition-transform">
                  <Gem className="w-7 h-7 stroke-[2.2]" />
                </div>
                <div className="font-extrabold text-[#5945F1] text-base sm:text-lg">
                  Trade &amp; Earn Points
                </div>
              </div>

              {/* Dotted Arrow 2 */}
              <div className="hidden sm:flex items-center justify-center text-slate-300 font-bold tracking-widest text-lg select-none px-2">
                <span className="border-b-2 border-dotted border-slate-400 w-16 sm:w-20 inline-block relative -top-0.5" />
                <span className="text-slate-500 font-bold -ml-1 text-xs">▶</span>
              </div>

              {/* Step 3: Move Up to Next Level */}
              <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="relative w-14 h-14 rounded-full bg-indigo-50 border-2 border-[#5945F1]/30 flex items-center justify-center text-[#5945F1] shadow-2xs group-hover:scale-105 transition-transform">
                  <UserPlus className="w-7 h-7 stroke-[2.2]" />
                  {/* Subtle Gold Crown/Star Badge */}
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#CAEB0E] text-slate-900 text-[9px] font-black flex items-center justify-center shadow-xs">
                    ★
                  </span>
                </div>
                <div className="font-extrabold text-[#5945F1] text-base sm:text-lg">
                  Move Up to Next Level
                </div>
              </div>

            </div>

            {/* Sub-caption matching screenshot */}
            <div className="text-center text-xs sm:text-sm text-slate-600 max-w-xl mx-auto space-y-1">
              <p>
                <strong className="font-extrabold text-[#0b1c30]">
                  No applications. No forms. No &quot;VIP manager&quot;
                </strong>{' '}
                chasing you on WhatsApp.
              </p>
              <p className="text-slate-500 font-medium">
                Your level updates automatically when you qualify.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. 4 TIER CARDS (ROOKIE, CLIMBER, PLAYER, BOSS)
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28">
        
        {/* Container with horizontal cards and dotted arrows */}
        <div className="relative pt-12">
          
          {/* Ghost Mascot & "Everyone starts here!" Callout above Card 1 */}
          <div className="absolute top-0 left-4 sm:left-8 z-20 flex items-end gap-2.5 pointer-events-none select-none">
            {/* Friendly Little Ghost */}
            <div className="relative -mb-1">
              <svg
                width="46"
                height="54"
                viewBox="0 0 54 62"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xs"
              >
                <path
                  d="M7 28 C7 12, 18 5, 27 5 C36 5, 47 12, 47 28 L47 50 C47 50, 42 46, 38 50 C34 54, 31 46, 27 50 C23 54, 19 46, 16 50 C12 54, 7 50, 7 50 Z"
                  fill="white"
                  stroke="#0B1C30"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <ellipse cx="21" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                <ellipse cx="33" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
              </svg>
            </div>

            {/* Blue Curved Arrow */}
            <div className="flex items-center gap-1.5 -mb-2">
              <svg
                width="34"
                height="26"
                viewBox="0 0 38 28"
                fill="none"
                className="text-[#3B82F6]"
              >
                <path
                  d="M32 4 C20 6, 10 14, 6 23"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 23 L12 20 M6 23 L7 17"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Tilted Lime Badge: Everyone starts here! */}
              <div className="bg-[#CAEB0E] text-[#5945F1] font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs -rotate-6 whitespace-nowrap">
                Everyone starts here!
              </div>
            </div>
          </div>

          {/* Grid of 4 Cards with Dotted Connectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative">
            
            {/* ═══════════════ CARD 1: ROOKIE ═══════════════ */}
            <div className="relative bg-white rounded-2xl border-[1.5px] border-slate-900 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              {/* Connector to Card 2 on lg screens */}
              <div className="hidden lg:flex items-center absolute -right-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <span className="border-b-2 border-dotted border-slate-300 w-4 inline-block" />
                <span className="text-slate-400 text-[10px] -ml-0.5 font-bold">▶</span>
              </div>

              <div className="space-y-4">
                {/* Top Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>ROOKIE</span>
                  </span>
                </div>

                {/* Cashback */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block font-normal leading-none mb-1">
                    Cashback
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
                    Standard rate
                  </div>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* What you get */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#0b1c30]">What you get</div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Trading Tools</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>
                        <strong className="font-bold text-[#0b1c30]">70% - 74%</strong> Signal Confidence
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Broker Comparisons</span>
                    </li>
                  </ul>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* How to get it? */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#0b1c30]">How to get it?</div>
                  <div className="text-xs text-slate-700">
                    <strong className="font-bold text-[#0b1c30]">Sign up.</strong> That&apos;s it.
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════ CARD 2: CLIMBER ═══════════════ */}
            <div className="relative bg-white rounded-2xl border-[1.5px] border-[#FE01B1] p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              {/* Connector to Card 3 on lg screens */}
              <div className="hidden lg:flex items-center absolute -right-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <span className="border-b-2 border-dotted border-slate-300 w-4 inline-block" />
                <span className="text-slate-400 text-[10px] -ml-0.5 font-bold">▶</span>
              </div>

              <div className="space-y-4">
                {/* Top Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FE01B1] text-white text-[11px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>CLIMBER</span>
                  </span>
                </div>

                {/* Cashback */}
                <div className="pt-1 flex items-baseline gap-2">
                  <div className="text-3xl sm:text-4xl font-black text-[#FE01B1] tracking-tight leading-none">
                    +5%
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    <span>Cashback</span>
                    <span className="block font-bold text-[#FE01B1]">boost rate</span>
                  </div>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* What you get */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#0b1c30]">What you get</div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Trading Tools</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>
                        Trading Signal with{' '}
                        <strong className="font-bold text-[#FE01B1]">75% - 79%</strong> Confidence
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Better Broker Offers</span>
                    </li>
                  </ul>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* How to get it? */}
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#0b1c30]">How to get it?</div>
                  <div className="text-xs text-slate-700">
                    Just <strong className="font-bold text-[#FE01B1]">100 points.</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    A few good trades and you&apos;re here.
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════ CARD 3: PLAYER ═══════════════ */}
            <div className="relative bg-white rounded-2xl border-[1.5px] border-[#CAEB0E] p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              {/* Connector to Card 4 on lg screens */}
              <div className="hidden lg:flex items-center absolute -right-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <span className="border-b-2 border-dotted border-slate-300 w-4 inline-block" />
                <span className="text-slate-400 text-[10px] -ml-0.5 font-bold">▶</span>
              </div>

              <div className="space-y-4">
                {/* Top Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CAEB0E] text-black text-[11px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    <span>PLAYER</span>
                  </span>
                </div>

                {/* Cashback */}
                <div className="pt-1 flex items-baseline gap-2">
                  <div className="text-3xl sm:text-4xl font-black text-[#8ea600] tracking-tight leading-none">
                    +10%
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    <span>Cashback</span>
                    <span className="block font-bold text-[#8ea600]">boost rate</span>
                  </div>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* What you get */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#0b1c30]">What you get</div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Trading Tools</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>
                        Trading Signal with{' '}
                        <strong className="font-bold text-[#8ea600]">80% - 89%</strong> Confidence
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Premium Promotions</span>
                    </li>
                  </ul>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* How to get it? */}
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#0b1c30]">How to get it?</div>
                  <div className="text-xs text-slate-700">
                    Earn <strong className="font-bold text-[#8ea600]">250 Points</strong> .
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Popular with active traders.
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════ CARD 4: BOSS ═══════════════ */}
            <div className="relative bg-white rounded-2xl border-[1.5px] border-[#5945F1] p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Top Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5945F1] text-white text-[11px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>BOSS</span>
                  </span>
                </div>

                {/* Cashback */}
                <div className="pt-1 flex items-baseline gap-2">
                  <div className="text-3xl sm:text-4xl font-black text-[#5945F1] tracking-tight leading-none">
                    +15%
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    <span>Cashback</span>
                    <span className="block font-bold text-[#5945F1]">boost rate</span>
                  </div>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* What you get */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#0b1c30]">What you get</div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Trading Tools</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>
                        Gain full access to{' '}
                        <strong className="font-bold text-[#5945F1]">90%+</strong> confidence signals
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Exclusive member only benefits</span>
                    </li>
                  </ul>
                </div>

                <div className="border-b border-slate-100 my-3" />

                {/* How to get it? */}
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#0b1c30]">How to get it?</div>
                  <div className="text-xs font-bold text-[#5945F1]">
                    500 Points
                  </div>
                  <div className="text-[11px] text-slate-400">
                    For traders who don&apos;t quit.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. "Fair Warning:" SECTION (3 Columns)
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 sm:pb-24">
        <h3 className="text-base font-bold text-[#0b1c30] mb-6">
          Fair Warning:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="flex items-start gap-3">
            <div className="text-[#5945F1] shrink-0 mt-0.5">
              <UserPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-[13px] font-bold text-[#0b1c30]">
                Leveling up has side effects.
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                More cashback. More Benefits. Less interest in lower levels.
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex items-start gap-3">
            <div className="text-[#5945F1] shrink-0 mt-0.5">
              <Coins className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-[13px] font-bold text-[#0b1c30]">
                Progress can become surprisingly addictive.
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                One level unlocks. Then another starts looking achievable. You may end up staying longer than expected.
              </p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex items-start gap-3">
            <div className="text-[#5945F1] shrink-0 mt-0.5">
              <Wine className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-[13px] font-bold text-[#0b1c30]">
                The difficult part isn&apos;t getting there.
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                It&apos;s settling for less afterwards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. "Got Questions?" ACCORDION SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5945F1] tracking-tight">
          Got Questions<span className="text-[#FE01B1]">?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-10 max-w-lg mx-auto">
          The answers to some of the most common questions about how membership works.
        </p>

        {/* Minimal Accordion List */}
        <div className="space-y-3 text-left">
          {faqList.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border-b border-slate-100 py-3 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between gap-4 text-left py-2 group cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-[#5945F1] font-light text-lg shrink-0 transition-transform duration-200">
                    {isOpen ? <Minus className="w-4 h-4 stroke-[2]" /> : <Plus className="w-4 h-4 stroke-[2]" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="pt-2 pb-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. VIBRANT PURPLE FOOTER (EXACT MATCH TO SCREENSHOT)
         ───────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#5945F1] text-white pt-16 sm:pt-20 pb-8 px-4 sm:px-8 md:px-14 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          {/* Top Row: Left 3D M-Logo & Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left 3D Logo Bubble */}
            <div className="lg:col-span-4 flex items-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-3 shadow-2xl">
                {/* Background sphere glow */}
                <div className="absolute -top-3 -left-3 w-16 h-16 rounded-full bg-white/30 blur-xs" />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[#FE01B1] blur-md opacity-80" />

                {/* Stylized M Vector */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-20 h-20 fill-none"
                >
                  <path
                    d="M 22 70 C 22 45, 28 30, 38 30 C 48 30, 52 48, 56 56 C 60 48, 64 30, 74 30 C 82 30, 84 45, 84 65"
                    stroke="white"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="85" cy="68" r="7" fill="#CAEB0E" />
                </svg>

                {/* Hot pink satellite dot */}
                <span className="absolute bottom-2 right-4 w-5 h-5 rounded-full bg-[#FE01B1] shadow-md" />
              </div>
            </div>

            {/* 3 Nav Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs sm:text-sm">
              
              {/* Column 1: More than product */}
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-white text-sm sm:text-base">
                  More than product
                </h4>
                <ul className="space-y-2 text-white/80">
                  <li>
                    <button
                      onClick={() => onNavigateToTab?.('member-plan')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Member Plan
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateToTab?.('points-credits')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Loyalty Program
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateToTab?.('level-points-guide')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Points System
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 2: Company */}
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-white text-sm sm:text-base">
                  Company
                </h4>
                <ul className="space-y-2 text-white/80">
                  <li>
                    <button
                      onClick={() => onNavigateToTab?.('about')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateToTab?.('contact-us')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Contact Us &amp; FAQs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onShowToast?.('Company News coming soon')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Company News
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onShowToast?.('Careers: Check back soon')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Careers
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: Regal / Legal */}
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-white text-sm sm:text-base">
                  Regal
                </h4>
                <ul className="space-y-2 text-white/80">
                  <li>
                    <button
                      onClick={() => onShowToast?.('Legal Notice viewed')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Legal Notice
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onShowToast?.('Privacy Policy viewed')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onShowToast?.('Terms & Conditions viewed')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Terms &amp; Conditions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onShowToast?.('Cookies Policy viewed')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Cookies Policy
                    </button>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Middle Row: Copyright, Social Icons, and Big Email Callout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/15">
            
            {/* Copyright */}
            <div className="text-xs text-white/80 font-normal order-2 md:order-1">
              © 2026 MarketSyde. All rights reserved.
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4 text-white/90 order-3 md:order-2">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title="X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Chat / Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title="Community Chat"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>

            {/* Email Box matching screenshot */}
            <div className="flex items-center gap-3 order-1 md:order-3 text-right">
              <div className="w-10 h-10 rounded-xl bg-[#CAEB0E] flex items-center justify-center text-slate-950 shrink-0 shadow-xs">
                <Mail className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <a
                  href="mailto:abc@MarketSyde.com"
                  className="font-extrabold text-white text-base sm:text-lg hover:underline block leading-tight"
                >
                  abc@MarketSyde.com
                </a>
                <span className="text-[11px] text-white/80 block">
                  Look who finally knows how to reach us
                </span>
              </div>
            </div>

          </div>

          {/* Legal Disclaimer Paragraph */}
          <div className="pt-6 border-t border-white/15 text-[11px] sm:text-xs text-white/70 leading-relaxed font-normal">
            By using this website, you agree to be bound by MarketSyde&apos;s Terms &amp; Conditions, which may be updated at any time without prior notice. Continued use of the site signifies your acceptance of all current terms, including any revisions. All content is provided for informational purposes only and may be changed or removed at our discretion. If you do not agree with these terms, please discontinue use of the website.
          </div>

        </div>

        {/* Giant Watermark at the Very Bottom matching screenshot */}
        <div className="w-full text-center overflow-hidden pointer-events-none select-none -mb-8 sm:-mb-12 mt-6">
          <span className="font-display font-black text-white/10 text-7xl sm:text-9xl md:text-[160px] lg:text-[210px] tracking-tighter leading-none inline-block">
            marketsyde
          </span>
        </div>

      </footer>
    </div>
  );
};
