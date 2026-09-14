import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface AboutUsPageProps {
  onOpenSignUp?: () => void;
  onNavigateToBrokers?: () => void;
  onNavigateToSignals?: () => void;
  onNavigateToPlan?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onOpenSignUp,
  onNavigateToBrokers,
  onNavigateToSignals,
  onNavigateToPlan,
  onNavigateToTab,
}) => {
  return (
    <div className="w-full bg-[#fafbfe] text-[#0b1c30] overflow-x-hidden font-sans selection:bg-[#5945F1]/20 selection:text-[#5945F1]">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO SECTION
          Built To Simplify. Designed To Connect.
          Made For Traders.
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 md:px-12 flex flex-col items-center text-center">
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#eff2fe]/70 via-[#f8f9ff]/30 to-transparent pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Subheading / Eyebrow */}
          <h2 className="text-sm sm:text-base md:text-lg font-medium text-slate-700 tracking-tight mb-2">
            Built To Simplify. Designed To Connect.
          </h2>

          {/* Main Giant Display Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight text-[#5945F1] leading-[1.08] mb-6 sm:mb-8 font-sans">
            Made For Traders.
          </h1>

          {/* Two-Column Explanation with Decorative Curved Line */}
          <div className="relative w-full max-w-2xl mt-2 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-left">
            {/* Hand-drawn smooth arrow / connector line matching reference */}
            <div className="shrink-0 w-16 h-14 sm:w-20 sm:h-16 relative mt-1 select-none">
              <svg
                viewBox="0 0 80 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#5945F1]"
              >
                {/* Smooth looping arrow curving towards the text */}
                <path
                  d="M10 12 C 10 38, 28 48, 62 42"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M54 36 L64 42 L56 50"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Explanatory Paragraph */}
            <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 leading-relaxed max-w-xl font-normal">
              We built MarketSyde to bring together the things traders use every day.
              From finding the right broker and earning cashback on eligible trades to
              accessing market insights, signals and practical tools, everything is
              designed to help traders make better decisions with less effort and fewer
              distractions.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: HOW WE ACTUALLY MAKE YOUR LIFE EASIER?
          4 Horizontal Cards with Distinctive 3D Pastel Icons
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16">
        <div className="mb-10 sm:mb-14">
          <span className="text-sm sm:text-base font-normal text-slate-500 block mb-1">
            How we actually
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight text-[#0b1c30]">
            make your life easier?
          </h2>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Get Paid for Existing */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* 3D Pastel Coin with Dollar Sign */}
              <div className="w-12 h-12 mb-6 rounded-2xl flex items-center justify-center relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c7d2fe] to-[#818cf8] shadow-md flex items-center justify-center text-white font-bold text-lg border-2 border-white/60">
                  <span className="font-sans font-black text-indigo-900">$</span>
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug mb-2">
                Get Paid for Existing
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Get top cashback on spreads plus rewards just for showing up.
              </p>
            </div>
          </div>

          {/* Card 2: Stop Guessing Your Setups */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* 3D Pink / Magenta Sphere / Target */}
              <div className="w-12 h-12 mb-6 rounded-2xl flex items-center justify-center relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f43f5e] via-[#fb7185] to-[#fda4af] shadow-md flex items-center justify-center border-2 border-white/60">
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug mb-2">
                Stop Guessing Your Setups
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                No crystal balls. Just sharp insights and data signals to keep you sane.
              </p>
            </div>
          </div>

          {/* Card 3: One Single Login. Seriously. */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* 3D Electric Lime / Chartreuse Cylinder */}
              <div className="w-12 h-12 mb-6 rounded-2xl flex items-center justify-center relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#bef226] to-[#a3e635] shadow-md flex items-center justify-center border-2 border-white/60 rotate-6">
                  <div className="w-4 h-4 rounded-md border-2 border-slate-900/60" />
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug mb-2">
                One Single Login. Seriously.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                No more juggling tabs. See your accounts and rewards in one view.
              </p>
            </div>
          </div>

          {/* Card 4: Play the Long Game */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* 3D Royal Violet Pyramid / Wedge */}
              <div className="w-12 h-12 mb-6 rounded-2xl flex items-center justify-center relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#818cf8] shadow-md flex items-center justify-center border-2 border-white/60 -rotate-6">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-white" />
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug mb-2">
                Play the Long Game
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Not a get-rich-quick scheme. We track your progress from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: WHAT WE BELIEVE.
          Left Lime Solid Card + 4 White Pillars in 2x2 Grid
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Solid Bright Lime Banner Card */}
          <div className="lg:col-span-4 bg-[#bef226] rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden min-h-[280px] lg:min-h-full shadow-xs">
            {/* Subtle radial gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 block leading-tight">
                What We
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#5945F1] leading-none mt-1">
                Believe.
              </h2>
            </div>

            {/* Decorative arrow curling from lime card to the first pillar */}
            <div className="relative z-10 hidden lg:block self-end mt-12 w-20 h-14">
              <svg
                viewBox="0 0 80 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#5945F1]"
              >
                <path
                  d="M10 20 C 35 10, 60 25, 68 50"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M58 45 L68 50 L72 38"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Right 2x2 Grid of White Belief Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Belief 1: Trading Should Be Transparent */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug">
                    Trading Should Be Transparent
                  </h3>
                  <div className="w-3 h-3 rounded-full bg-[#bef226] shrink-0 ml-2" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Clear numbers. Clear rewards. Zero hidden catch. If a platform can't show you its math upfront, don't trust them.
                </p>
              </div>
            </div>

            {/* Belief 2: Execution is Only 1% of the Job */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug">
                    Execution is Only 1% of the Job
                  </h3>
                  <div className="w-3 h-3 rounded-full bg-[#f43f5e] shrink-0 ml-2" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  You don't need a viral 1,000% trade. Consistently plugging the leaks in your trading costs is how you actually build a mountain over time.
                </p>
              </div>
            </div>

            {/* Belief 3: Growth Looks Different for Everyone */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug">
                    Growth Looks Different for Everyone
                  </h3>
                  <div className="w-3 h-3 rounded-full bg-[#818cf8] shrink-0 ml-2" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Whether you're trying to survive your first demo account or juggling institutional capital, your platform should grow with you; not feel like an old pair of shoes you're about to outgrow.
                </p>
              </div>
            </div>

            {/* Belief 4: Traders Deserve More Than Execution */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base sm:text-lg text-[#0b1c30] leading-snug">
                    Traders Deserve More Than Execution
                  </h3>
                  <div className="w-3 h-3 rounded-full bg-[#bef226] shrink-0 ml-2" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Clicking buy or sell is the easy part. The mental prep before the trade and the harsh reality check after it are where real traders are made.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: WHERE WE ARE HEADING NEXT.
          Large Circular Lavender Gradient Graphic on Left,
          Context & 3 Checklist bullets on Right
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 sm:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Circle Gradient Graphic with "Where we are heading next." */}
            <div className="lg:col-span-6 flex justify-center lg:justify-start relative">
              {/* Massive Floating Soft Purple Radial Sphere */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] rounded-full bg-gradient-to-tr from-[#e0e7ff] via-[#eff2fe] to-white flex flex-col items-center justify-center p-8 text-center shadow-[0_20px_50px_rgba(89,69,241,0.06)] border border-indigo-100/50">
                <div className="max-w-xs space-y-1">
                  <span className="text-lg sm:text-xl md:text-2xl font-medium text-slate-700 block">
                    Where we are
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#5945F1] leading-tight font-sans">
                    heading next.
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Mission & Focus Points */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 leading-relaxed font-normal">
                We're constantly adding new tools, bigger rewards, and features to lower your costs. But no matter how big we get, our mission stays the same: help you cut through the noise, save cash, and squeeze more value out of every single trade.
              </p>

              {/* Focus List */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-sm sm:text-base text-[#5945F1]">
                  As the platform grows, our focus remains the same:
                </h3>

                <div className="space-y-3">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#bef226] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Help you make slightly less emotional decisions
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#bef226] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Cut out the unnecessary hidden fees
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#bef226] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Squeeze actual value out of every single layout
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: READY TO TRADE SMARTER? START HERE.
          Call to Action with Button "Get inside - it's free ->"
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 text-center bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Main Call to Action Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0b1c30] tracking-tight leading-tight">
            Ready to Trade <span className="text-[#5945F1]">Smarter?</span>
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1 sm:mt-2">
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0b1c30] tracking-tight">
              Start Here
            </span>
            <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-[#5945F1] inline-block shadow-sm" />
          </div>

          {/* Subtext */}
          <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-4 sm:mt-6 max-w-xl leading-relaxed">
            Join a growing ecosystem designed around traders and discover what's possible when everything around your trading works together.
          </p>

          {/* Pill Button: Get inside - it's free -> */}
          <div className="mt-8 sm:mt-10">
            <button
              onClick={onOpenSignUp}
              className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#5945F1] hover:bg-[#492CED] text-white font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(89,69,241,0.25)] hover:shadow-[0_12px_30px_rgba(89,69,241,0.35)] transition-all cursor-pointer group"
            >
              <span>Get inside — it's free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>


    </div>
  );
};
