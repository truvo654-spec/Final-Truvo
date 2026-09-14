import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  LineChart,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface PublicLandingPageProps {
  onOpenSignUp?: () => void;
  onOpenSignIn?: () => void;
  onNavigateToBrokers?: () => void;
  onNavigateToSignals?: () => void;
  onNavigateToPlan?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onOpenSignUp,
  onOpenSignIn,
  onNavigateToBrokers,
  onNavigateToSignals,
  onNavigateToPlan,
  onNavigateToTab,
}) => {
  // Interactive state for Section 6: Level selector (Elite User, Active Member, Growing Explorer, Beginner)
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'explorer' | 'member' | 'elite'>('beginner');

  // Interactive state for Section 4: Tool slider tabs
  const [activeTool, setActiveTool] = useState<'compare' | 'signals' | 'tools' | 'cashback'>('compare');

  return (
    <div className="w-full bg-white text-[#0b1c30] overflow-x-hidden font-sans selection:bg-[#5945F1]/20 selection:text-[#5945F1]">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO
          "Your trade starts before Buy and grows far beyond Sell."
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-16 px-4 sm:px-6 md:px-12 flex flex-col items-center text-center">
        {/* Main Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-[#5945F1] leading-[1.12]">
            Your trade starts before Buy<br className="hidden sm:inline" /> and grows far beyond Sell.
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            MarketSyde is your daily hub for planning, analyzing, and improving your trades.
            <br className="hidden sm:inline" />
            Everything you need before, during, and after every trade.
          </p>
        </div>

        {/* Dynamic Interactive Trading Mockup Floating Display */}
        <div className="relative w-full max-w-5xl mx-auto mt-12 sm:mt-16 flex items-center justify-center min-h-[300px] sm:min-h-[360px]">
          
          {/* Left Floating Sphere / Globe with Broker Badges */}
          <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-gradient-to-br from-indigo-100/70 via-indigo-50/40 to-transparent items-center justify-center p-3">
            <div className="relative w-full h-full rounded-full border border-indigo-200/60 flex items-center justify-center">
              {/* Central stylized world outline */}
              <div className="text-[#5945F1] opacity-75">
                <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-current fill-none" strokeWidth="1.5">
                  <circle cx="50" cy="50" r="42" />
                  <ellipse cx="50" cy="50" rx="20" ry="42" />
                  <line x1="8" y1="50" x2="92" y2="50" />
                  <path d="M16 30 Q 50 40 84 30" />
                  <path d="M16 70 Q 50 60 84 70" />
                </svg>
              </div>
              {/* Floating Broker Mini Badges */}
              <div className="absolute -top-1 left-3 bg-[#0b1c30] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                HFM
              </div>
              <div className="absolute top-10 -right-2 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                +14%
              </div>
              <div className="absolute -bottom-2 right-4 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                XM
              </div>
              <div className="absolute bottom-6 -left-2 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md">
                ex
              </div>
            </div>
          </div>

          {/* Central Layered Glass Cards & Tickers */}
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-[0_20px_60px_rgba(89,69,241,0.08)] flex flex-col items-center">
            
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
              {/* Left Context Pill */}
              <div className="text-left space-y-1">
                <span className="text-xs text-slate-500 font-medium">Signals scale with your level.</span>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  <button onClick={onOpenSignUp} className="text-[#5945F1] underline font-bold hover:text-[#492CED]">
                    Start free
                  </button>
                  , then unlock more history, faster access, and AI picks.
                </div>
              </div>

              {/* Main Center Dark Trading Signal Card: XAU/USD */}
              <div className="w-60 bg-[#070b14] text-white rounded-2xl p-4 shadow-xl border border-slate-800 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs">
                      $
                    </div>
                    <div>
                      <div className="font-black text-sm tracking-tight">XAU/USD</div>
                      <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+14.05%</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500 text-black font-extrabold text-[10px] rounded-md tracking-wider">
                    BUY
                  </span>
                </div>
                
                {/* Confidence Bar */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Confidence</span>
                  <span className="font-extrabold text-[#bef226]">88%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="w-[88%] h-full bg-[#bef226] rounded-full" />
                </div>
              </div>

              {/* Smooth Chart Line Graphic */}
              <div className="hidden sm:block w-36 h-16">
                <svg viewBox="0 0 140 60" className="w-full h-full stroke-[#5945F1] fill-none" strokeWidth="2.5">
                  <path d="M 5 45 Q 35 15 65 35 T 135 10" />
                  <circle cx="135" cy="10" r="3" fill="#5945F1" />
                </svg>
              </div>
            </div>

            {/* Bottom Floating Horizontal Asset Tickers */}
            <div className="w-full pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                GOOGL
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                BTC/USD
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                S&P 500
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0b1c30] text-white rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                XAU/USD
              </span>
            </div>
          </div>

          {/* Right Floating Cash / Rebates Orb */}
          <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-gradient-to-bl from-indigo-100/70 via-indigo-50/40 to-transparent items-center justify-center p-3">
            <div className="relative w-full h-full rounded-full border border-indigo-200/60 flex flex-col items-center justify-center gap-2 text-center">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                $1,150.00
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                $1,035.00
              </div>
            </div>
          </div>

        </div>

        {/* Action Callout Bar under Hero */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <div className="text-left text-xs sm:text-sm text-slate-600 font-medium">
            <span>Keep trading where you trade.</span>
            <br />
            <strong className="text-slate-900 font-bold">Bring everything else together here.</strong>
          </div>
          <button
            onClick={onOpenSignUp}
            className="px-6 py-3 rounded-xl bg-[#c026d3] hover:bg-[#a21caf] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Get InSyde now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Trust Points Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] sm:text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5945F1]" />
            Regulated Brokers only: FCA, ASIC, CySEC, FSA
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <LineChart className="w-3.5 h-3.5 text-[#5945F1]" />
            Data by Acuity Trading and Dow Jones
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5945F1]" />
            We never sell you data
          </span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: 99% OF YOUR TIME
          "You spend 99% of your time getting ready to trade."
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Grid Dot Matrix Graphic */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start">
            <div className="relative p-6 sm:p-8 bg-slate-50/70 rounded-3xl border border-slate-200/80">
              {/* Y-axis label */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-widest uppercase font-bold text-slate-400">
                HOUR OF PREPARATION
              </div>

              {/* 10x10 Matrix of Dots */}
              <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
                {Array.from({ length: 99 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#c7d2fe]"
                  />
                ))}
                {/* The 100th dot: Lime accent representing the 1% Action */}
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#bef226] ring-2 ring-[#a3e635] shadow-xs" />
              </div>

              {/* X-axis label */}
              <div className="text-center text-[10px] tracking-widest uppercase font-bold text-slate-400 mt-4">
                HOUR OF REVIEW
              </div>
            </div>

            {/* Bottom Pill Badge: YOU JUST TAKE THE 1% ACTION */}
            <div className="mt-4 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-2xs text-[11px] font-extrabold text-slate-700 tracking-wider">
              YOU JUST TAKE THE <span className="text-[#84cc16]">1%</span> ACTION
            </div>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-slate-800 tracking-tight leading-[1.1]">
              You spend <span className="text-[#5945F1]">99%</span>
              <br />
              of your time
              <br />
              getting ready to <span className="text-slate-900 underline decoration-[#bef226] decoration-4">trade</span>.
            </h2>
            
            <p className="text-base sm:text-lg text-slate-700 font-semibold pt-2">
              Let us take the <span className="text-[#5945F1] font-bold">99%</span> away for you.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: QUOTES / PAIN POINTS
          "Every trader does it, nobody talks about it."
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          
          {/* Header Block */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-base sm:text-lg text-[#ec4899] leading-snug">
              Every trader does it, nobody talks about it.
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Hover to see how <span className="text-slate-800 font-bold underline decoration-[#bef226]">we make it effortless</span>.
            </p>
          </div>

          {/* Quote 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-left hover:border-[#5945F1] transition-colors">
            <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed italic">
              "I chose my broker because their ad had really nice color scheme."
            </p>
          </div>

          {/* Quote 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-left hover:border-[#5945F1] transition-colors">
            <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed italic">
              "I use 5 different platforms just to confirm one trade. By the time I decide, the move is already gone."
            </p>
          </div>

          {/* Quote 3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-left hover:border-[#5945F1] transition-colors">
            <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed italic">
              "I size my position by 'eh, that feels about right'."
            </p>
          </div>

        </div>

        {/* Sub-CTA under quotes */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center">
          <div className="text-xs sm:text-sm text-slate-600">
            <span>Leave the hard work to us.</span>
            <br />
            <strong className="text-slate-900 font-bold">You just make the shot.</strong>
          </div>
          <button
            onClick={onOpenSignUp}
            className="px-6 py-3 rounded-xl bg-[#c026d3] hover:bg-[#a21caf] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Join now — it's free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: PACKED INTO ONE TAB
          "Packed into One Tab. Every Tool You Need."
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 text-center">
        {/* Title */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            Packed into <span className="text-[#0b1c30]">One Tab</span>.
          </h2>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#5945F1] tracking-tight mt-1">
            Every Tool You Need.
          </h2>
        </div>

        {/* Central Broker Compare Hub Display */}
        <div className="relative max-w-3xl mx-auto p-8 sm:p-12 bg-slate-50/50 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
          
          {/* Circular Connected Broker Nodes */}
          <div className="relative w-72 h-44 sm:w-96 sm:h-48 mb-6 flex items-center justify-center">
            {/* Center Broker Logomarks & VS tags */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Exness */}
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-black font-black flex items-center justify-center shadow-md">
                ex
              </div>
              <span className="w-6 h-6 rounded-full bg-[#ec4899] text-white text-[10px] font-bold flex items-center justify-center">
                VS
              </span>
              {/* HFM */}
              <div className="w-12 h-12 rounded-xl bg-[#0b1c30] text-white font-black text-xs flex items-center justify-center shadow-md">
                HFM
              </div>
            </div>

            {/* Sub-row logos */}
            <div className="absolute bottom-2 flex items-center gap-4">
              {/* Axi */}
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                axi
              </div>
              <span className="w-5 h-5 rounded-full bg-[#ec4899] text-white text-[9px] font-bold flex items-center justify-center">
                VS
              </span>
              {/* Vantage */}
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-md">
                8
              </div>
            </div>
          </div>

          {/* Info Card Inside */}
          <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-base sm:text-lg text-[#0b1c30]">
              Broker Compare
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Real-time quotes, economic calendar, sentiment, news — packaged with context that tells you what to do, not just what just happened.
            </p>
            <div className="pt-1">
              <button
                onClick={onNavigateToBrokers}
                className="px-5 py-2 rounded-xl bg-[#5945F1] hover:bg-[#492CED] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Explore more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: THREE STEPS. ZERO BROKER SWITCH.
          3 Overlapping Colorful Circles: 01 (Lime), 02 (Purple), 03 (White)
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 text-center">
        {/* Title */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            <span className="text-[#0b1c30]">Three</span> steps.
          </h2>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#5945F1] tracking-tight">
            Zero broker switch.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto pt-2">
            You don't migrate. You don't change platforms. You don't put a single dollar on the line that you weren't already going to trade. You just start getting paid back for it.
          </p>
        </div>

        {/* 3 Circular Steps Interconnected */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4 max-w-5xl mx-auto">
          
          {/* Step 01: Lime Circle */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#bef226] p-8 flex flex-col justify-center items-center text-center shadow-lg relative shrink-0">
            {/* Broker Micro-Pill on top right */}
            <div className="absolute -top-3 right-6 bg-white px-3 py-1 rounded-full shadow-md text-[10px] font-bold text-slate-700 flex items-center gap-1">
              <span>Link to MarketSyde</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <span className="text-3xl sm:text-4xl font-black text-slate-900 block mb-1">
              01
            </span>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-tight mb-2">
              LINK YOUR BROKER.
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed max-w-[200px] mb-3">
              Link your IB account in 90 seconds. Read-only access means we see your fills, never your funds.
            </p>
            <button
              onClick={onNavigateToBrokers}
              className="text-xs font-bold text-slate-900 underline hover:text-[#5945F1] inline-flex items-center gap-1"
            >
              <span>Explore All Brokers</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Smooth connecting arrow */}
          <div className="hidden lg:block w-8 h-8 text-slate-400">
            <ArrowRight className="w-6 h-6 stroke-[2]" />
          </div>

          {/* Step 02: Deep Violet / Blue Circle */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#5945F1] text-white p-8 flex flex-col justify-center items-center text-center shadow-lg relative shrink-0">
            <span className="text-3xl sm:text-4xl font-black text-white block mb-1">
              02
            </span>
            <h4 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight mb-2">
              TRADE THE SAME.
            </h4>
            <p className="text-xs text-indigo-100 leading-relaxed max-w-[200px]">
              Trade exactly as you do now. We automatically track your lots in the background.
            </p>
          </div>

          {/* Smooth connecting arrow */}
          <div className="hidden lg:block w-8 h-8 text-slate-400">
            <ArrowRight className="w-6 h-6 stroke-[2]" />
          </div>

          {/* Step 03: Soft White Circle with Rose Accent */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-white border border-slate-200 text-slate-800 p-8 flex flex-col justify-center items-center text-center shadow-lg relative shrink-0">
            <span className="text-3xl sm:text-4xl font-black text-slate-300 block mb-1">
              03
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-rose-500 uppercase tracking-tight mb-2">
              GET PAID EVERY MONDAY.
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
              Earn weekly spread rewards in your MarketSyde wallet. Cash out to bank, broker, or crypto, or fund your next trade.
            </p>
          </div>

        </div>

        {/* Sub-CTA under 3 Steps */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center">
          <div className="text-xs sm:text-sm text-slate-600">
            <span>Trade with your usual broker.</span>
            <br />
            <strong className="text-slate-900 font-bold">Start getting paid for it this time.</strong>
          </div>
          <button
            onClick={onOpenSignUp}
            className="px-6 py-3 rounded-xl bg-[#c026d3] hover:bg-[#a21caf] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Join now — it's free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: THE MORE YOU TRADE, THE MORE IT RETURNS.
          Left Level Selector (Elite User, Active Member, Growing Explorer, Beginner)
          Right Dark Ghost Card (Beginner Standard rate + 49 lots CTA)
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        {/* Title */}
        <div className="max-w-2xl mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            The <span className="underline decoration-[#bef226] decoration-4">more</span> you <span className="underline decoration-[#bef226] decoration-4">trade</span>,
            <br />
            <span className="text-[#5945F1]">the more it returns.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-2">
            You level up through trading, learning and showing up. Higher levels mean higher cashback, sharper signals and more of the platform — every level returns more than the last.
          </p>
        </div>

        {/* 2-Column Level Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: 4 Level Buttons */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            
            {/* Level 04: Elite User */}
            <button
              onClick={() => setSelectedLevel('elite')}
              className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                selectedLevel === 'elite'
                  ? 'bg-white border-[#5945F1] shadow-md ring-2 ring-[#5945F1]/10'
                  : 'bg-transparent border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LEVEL · 04</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-3 h-3 rounded-full bg-[#5945F1]" />
                <span className="font-bold text-sm sm:text-base text-slate-900">Elite User</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">The highest rebates and the most accurate calls.</p>
            </button>

            {/* Level 03: Active Member */}
            <button
              onClick={() => setSelectedLevel('member')}
              className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                selectedLevel === 'member'
                  ? 'bg-white border-[#5945F1] shadow-md ring-2 ring-[#5945F1]/10'
                  : 'bg-transparent border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LEVEL · 03</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-3 h-3 rounded-full bg-[#bef226]" />
                <span className="font-bold text-sm sm:text-base text-slate-900">Active Member</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Sharper signals, higher rebates, AI on your side.</p>
            </button>

            {/* Level 02: Growing Explorer */}
            <button
              onClick={() => setSelectedLevel('explorer')}
              className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                selectedLevel === 'explorer'
                  ? 'bg-white border-[#5945F1] shadow-md ring-2 ring-[#5945F1]/10'
                  : 'bg-transparent border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LEVEL · 02</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
                <span className="font-bold text-sm sm:text-base text-slate-900">Growing Explorer</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Trade more, learn more, post in the community.</p>
            </button>

            {/* Level 01: Beginner (Default Active in reference) */}
            <button
              onClick={() => setSelectedLevel('beginner')}
              className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                selectedLevel === 'beginner'
                  ? 'bg-white border-slate-300 shadow-sm ring-2 ring-slate-200'
                  : 'bg-transparent border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LEVEL · 01</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-sm sm:text-base text-slate-900">Beginner</span>
                <div className="w-3 h-3 rounded-full bg-slate-900" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Start earning from your very first trade.</p>
            </button>

          </div>

          {/* Right Column: Dark Ghost Card (Exact match to reference) */}
          <div className="lg:col-span-7 bg-[#0b101b] text-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            
            <div className="flex items-start justify-between">
              {/* Title and Cashback Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {selectedLevel === 'beginner' && 'Beginner'}
                    {selectedLevel === 'explorer' && 'Explorer'}
                    {selectedLevel === 'member' && 'Active Member'}
                    {selectedLevel === 'elite' && 'Elite Trader'}
                  </h3>
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#5945F1]" />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-medium">Cashback</span>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {selectedLevel === 'beginner' && 'Standard rate'}
                    {selectedLevel === 'explorer' && '+10% Boosted rate'}
                    {selectedLevel === 'member' && '+20% Institutional tier'}
                    {selectedLevel === 'elite' && '+35% Maximum VIP tier'}
                  </div>
                </div>

                {/* What you get */}
                <div className="pt-2 space-y-2">
                  <span className="text-xs text-slate-400 block font-medium">What you get</span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>Trading Tools</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bef226]" />
                      <span><strong className="text-white">70% - 74%</strong> Signal Confidence</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* White Arcade Mascot Ghost on top right */}
              <div className="w-24 h-28 sm:w-28 sm:h-32 text-white fill-white shrink-0">
                <svg viewBox="0 0 100 120" className="w-full h-full">
                  <path
                    d="M 15 50 C 15 25 30 10 50 10 C 70 10 85 25 85 50 L 85 95 L 75 85 L 60 95 L 50 85 L 40 95 L 25 85 L 15 95 Z"
                    fill="white"
                  />
                  {/* Ghost Eyes */}
                  <circle cx="38" cy="45" r="5" fill="#0b101b" />
                  <circle cx="62" cy="45" r="5" fill="#0b101b" />
                </svg>
              </div>
            </div>

            {/* Bottom CTA bar inside dark card */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                <button onClick={onOpenSignUp} className="underline text-white font-bold hover:text-[#bef226]">
                  Want this level?
                </button>{' '}
                Just sign up and trade a stress-free <strong className="text-white">49 lots</strong>.
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: THE ECOSYSTEM KEEPS GROWING.
          4 Upcoming modules with "SOON" badges + Center Blue Market & News
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#5945F1]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            THIS IS THE STARTING LINE
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          The ecosystem
        </h2>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#5945F1] tracking-tight mb-12 sm:mb-16">
          keeps growing.
        </h2>

        {/* 5 Connected Module Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto items-center">
          
          {/* 1. Instrument Analysis */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="font-bold text-xs sm:text-sm text-slate-800 block">Instrument Analysis</span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              ● SOON
            </span>
          </div>

          {/* 2. Economic Calendar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="font-bold text-xs sm:text-sm text-slate-800 block">Economic Calendar</span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              ● SOON
            </span>
          </div>

          {/* 3. CENTER ACTIVE BLUE CIRCLE: MARKET & NEWS */}
          <div className="col-span-2 sm:col-span-1 p-6 bg-[#5945F1] text-white rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-1 scale-105">
            <span className="font-black text-xs sm:text-sm tracking-tight text-center leading-tight">
              MARKET<br />& NEWS
            </span>
            <span className="text-[10px] font-extrabold text-white/90 bg-white/20 px-2.5 py-0.5 rounded-full inline-block mt-1">
              SOON
            </span>
          </div>

          {/* 4. Promotion & Bonuses */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="font-bold text-xs sm:text-sm text-slate-800 block">Promotion & Bonuses</span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              ● SOON
            </span>
          </div>

          {/* 5. Community & circles */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="font-bold text-xs sm:text-sm text-slate-800 block">Community & circles</span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              ● SOON
            </span>
          </div>

        </div>

        <p className="text-xs sm:text-sm text-slate-500 mt-8 max-w-md mx-auto leading-relaxed">
          Same login, same wallet, same level; new surfaces snapping into place as we go. Here's a glimpse of what's already on the way.
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: TWO SIDES TO EVERY TRADE. JOIN THE RIGHT ONE.
          Bottom Pre-Footer Callout with Pink Button
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 text-center bg-gradient-to-b from-white via-indigo-50/20 to-white">
        {/* Eyebrow with pink dot */}
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            YOUR SYDE OF THE MARKET
          </span>
        </div>

        {/* Headline */}
        <div className="max-w-3xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight">
            Two sides to <span className="text-[#0b1c30]">every trade</span>.
          </h2>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#5945F1] tracking-tight">
            Join the right one.
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-4 max-w-xl mx-auto leading-relaxed">
            Be first in when MarketSyde goes live. Get early access and your founding-member head start.
          </p>

          <div className="pt-6">
            <button
              onClick={onOpenSignUp}
              className="px-8 py-4 rounded-2xl bg-[#c026d3] hover:bg-[#a21caf] text-white font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get inside — it's free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>


    </div>
  );
};
