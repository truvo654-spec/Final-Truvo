import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Gem, ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';

export interface MembershipPlanPageProps {
  user: UserProfile;
  onNavigateToTrade?: () => void;
  onShowToast?: (msg: string) => void;
}

export const MembershipPlanPage: React.FC<MembershipPlanPageProps> = ({
  user,
  onNavigateToTrade,
  onShowToast,
}) => {
  // State for active preview level (1: Rookie, 2: Climber, 3: Player, 4: Boss)
  // Default to Lv. 1 (Rookie) matching "Membership plan - Member Lv.1.png" exactly
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // Derive dynamic title based on active level
  const getLevelTitle = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Rookie';
      case 2:
        return 'Climber';
      case 3:
        return 'Player';
      case 4:
        return 'Boss';
      default:
        return 'Rookie';
    }
  };

  return (
    <div id="membership-plan-page" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* ─────────────────────────────────────────────────────────────
          DEMO SWITCHER / INTERACTIVE LEVEL CONTROLLER (SUBTLE BAR)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium pl-2">
          <span className="w-2 h-2 rounded-full bg-[#CAEB0E]" />
          <span>Viewing Tier:</span>
          <span className="font-bold text-[#0b1c30]">
            Level {activeLevel} ({getLevelTitle(activeLevel)})
          </span>
          {activeLevel === 1 && (
            <span className="px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black text-[10px] font-extrabold tracking-tight">
              Exact match to Lv.1 reference
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { level: 1, name: 'Rookie (Lv.1)' },
            { level: 2, name: 'Climber (Lv.2)' },
            { level: 3, name: 'Player (Lv.3)' },
            { level: 4, name: 'Boss (Lv.4)' },
          ].map((item) => {
            const isSelected = activeLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => {
                  setActiveLevel(item.level);
                  onShowToast?.(`Previewing ${item.name} plan`);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER SECTION (Exact match to Membership plan - Member Lv.1.png)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        {/* Main Title: You're a Rookie. For now. */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0b1c30]">
          You&apos;re a {getLevelTitle(activeLevel)}. For now.
        </h1>

        {/* Sub-hero Row: Giant "Get More." + Right Description */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-10">
          {/* Giant "Get More." with hot pink dot */}
          <div className="font-display text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-[#5945F1] leading-none select-none">
            Get More<span className="text-[#FE01B1]">.</span>
          </div>

          {/* Right Description */}
          <div className="text-slate-600 font-medium text-base sm:text-lg max-w-xl leading-snug">
            <p>The higher your level, the better the cashback, perks, and rewards.</p>
            <p className="font-bold text-[#0b1c30] mt-1">Simple as that.</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. 4 TIERS CONNECTED ROW (ROOKIE, CLIMBER, PLAYER, BOSS)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {/* ════════════════════════════════════════════════════════════
              CARD 1: ROOKIE
             ════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col">
            {/* Cute Cartoon Ghost & "You're here" callout (when activeLevel === 1) */}
            {activeLevel === 1 && (
              <div className="absolute -top-14 left-4 z-20 flex items-end gap-2 pointer-events-none select-none">
                {/* Friendly cartoon ghost */}
                <div className="relative -mb-1">
                  <svg
                    width="54"
                    height="62"
                    viewBox="0 0 54 62"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-xs"
                  >
                    {/* Ghost body with rounded arch head and ruffled skirt bottom */}
                    <path
                      d="M7 28 C7 12, 18 5, 27 5 C36 5, 47 12, 47 28 L47 50 C47 50, 42 46, 38 50 C34 54, 31 46, 27 50 C23 54, 19 46, 16 50 C12 54, 7 50, 7 50 Z"
                      fill="white"
                      stroke="#0B1C30"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    {/* Two vertical dark eyes */}
                    <ellipse cx="21" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                    <ellipse cx="33" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                  </svg>
                </div>

                {/* Curved arrow from badge to ghost */}
                <div className="flex items-center gap-1 -mb-2">
                  <svg
                    width="38"
                    height="28"
                    viewBox="0 0 38 28"
                    fill="none"
                    className="text-[#3B82F6]"
                  >
                    <path
                      d="M32 4 C20 6, 10 14, 6 23"
                      stroke="#3B82F6"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 23 L12 20 M6 23 L7 17"
                      stroke="#3B82F6"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Lime green badge: You're here */}
                  <div className="bg-[#CAEB0E] text-black font-black text-[11px] leading-tight px-3 py-1 rounded-full shadow-xs text-center">
                    <div>You&apos;re</div>
                    <div>here</div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Outer with Gradient Border if Level 1 */}
            <div
              className={`h-full rounded-[26px] transition-all duration-200 flex flex-col ${
                activeLevel === 1
                  ? 'p-[2px] bg-gradient-to-br from-[#5945F1] via-[#8B5CF6] to-[#FE01B1] shadow-lg'
                  : 'border border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="bg-white rounded-[24px] p-6 sm:p-7 h-full flex flex-col justify-between">
                <div>
                  {/* Top Pill Tag: ROOKIE */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>ROOKIE</span>
                    </span>
                  </div>

                  {/* Cashback section */}
                  <div className="mb-6">
                    <span className="text-xs text-slate-500 font-medium block">Cashback</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight mt-1">
                      Standard rate
                    </h3>
                  </div>

                  {/* What you have now */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#0b1c30]">What you have now</h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Trading Tools</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>
                          <strong className="font-bold text-[#0b1c30]">70% - 74%</strong> Signal Confidence
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Broker Comparisons</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Divider */}
                <div>
                  <div className="h-px bg-slate-100 my-6" />

                  {/* Don't stop now! + Progress Bar + Points */}
                  <div className="space-y-2">
                    <div className="font-bold text-sm text-[#5945F1]">Don&apos;t stop now!</div>
                    <div className="text-xs text-slate-400">The good stuff is waiting.</div>

                    {/* Progress Track */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-[#5945F1] rounded-full w-[33.3%]" />
                    </div>

                    {/* Diamond and Points Counter */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-1">
                      <Gem className="w-3.5 h-3.5 text-[#5945F1]" />
                      <span>
                        <strong className="font-bold text-[#5945F1]">50</strong>/150 to Next Level
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dotted Arrow to Next Card (Desktop XL) */}
            <div className="hidden xl:flex absolute -right-5 top-[52%] -translate-y-1/2 z-10 pointer-events-none">
              <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                <line x1="0" y1="6" x2="22" y2="6" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 3" />
                <path d="M18 2 L23 6 L18 10" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CARD 2: CLIMBER
             ════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col">
            {/* Cute Cartoon Ghost & "You're here" callout (when activeLevel === 2) */}
            {activeLevel === 2 && (
              <div className="absolute -top-14 left-4 z-20 flex items-end gap-2 pointer-events-none select-none">
                <div className="relative -mb-1">
                  <svg width="54" height="62" viewBox="0 0 54 62" fill="none" className="drop-shadow-xs">
                    <path
                      d="M7 28 C7 12, 18 5, 27 5 C36 5, 47 12, 47 28 L47 50 C47 50, 42 46, 38 50 C34 54, 31 46, 27 50 C23 54, 19 46, 16 50 C12 54, 7 50, 7 50 Z"
                      fill="white"
                      stroke="#0B1C30"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <ellipse cx="21" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                    <ellipse cx="33" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 -mb-2">
                  <svg width="38" height="28" viewBox="0 0 38 28" fill="none" className="text-[#3B82F6]">
                    <path d="M32 4 C20 6, 10 14, 6 23" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round" />
                    <path d="M6 23 L12 20 M6 23 L7 17" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="bg-[#CAEB0E] text-black font-black text-[11px] leading-tight px-3 py-1 rounded-full shadow-xs text-center">
                    <div>You&apos;re</div>
                    <div>here</div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`h-full rounded-[26px] transition-all duration-200 flex flex-col ${
                activeLevel === 2
                  ? 'p-[2px] bg-gradient-to-br from-[#5945F1] via-[#8B5CF6] to-[#FE01B1] shadow-lg'
                  : 'border border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="bg-white rounded-[24px] p-6 sm:p-7 h-full flex flex-col justify-between">
                <div>
                  {/* Top Pill Tag: CLIMBER */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FE01B1] text-white text-xs font-black uppercase tracking-wider shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>CLIMBER</span>
                    </span>
                  </div>

                  {/* Cashback section */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-4xl font-black text-[#FE01B1] tracking-tight leading-none">
                        +5%
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] text-slate-500 font-medium">Cashback</span>
                        <span className="text-xs font-bold text-[#FE01B1]">boost rate</span>
                      </div>
                    </div>
                  </div>

                  {/* What you get */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#0b1c30]">What you get</h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Trading Tools</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>
                          Trading Signal with{' '}
                          <strong className="font-bold text-[#FE01B1]">75% - 79%</strong> Confidence
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Better Broker Offers</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Divider */}
                <div>
                  <div className="h-px bg-slate-100 my-6" />

                  {/* How to get it? */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-xs text-[#0b1c30]">How to get it?</div>
                    <div className="text-xs text-slate-700">
                      Just <strong className="font-bold text-[#FE01B1]">100 points.</strong>
                    </div>
                    <div className="text-xs text-slate-400">A few good trades and you&apos;re here.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dotted Arrow to Next Card (Desktop XL) */}
            <div className="hidden xl:flex absolute -right-5 top-[52%] -translate-y-1/2 z-10 pointer-events-none">
              <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                <line x1="0" y1="6" x2="22" y2="6" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 3" />
                <path d="M18 2 L23 6 L18 10" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CARD 3: PLAYER
             ════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col">
            {/* Cute Cartoon Ghost & "You're here" callout (when activeLevel === 3) */}
            {activeLevel === 3 && (
              <div className="absolute -top-14 left-4 z-20 flex items-end gap-2 pointer-events-none select-none">
                <div className="relative -mb-1">
                  <svg width="54" height="62" viewBox="0 0 54 62" fill="none" className="drop-shadow-xs">
                    <path
                      d="M7 28 C7 12, 18 5, 27 5 C36 5, 47 12, 47 28 L47 50 C47 50, 42 46, 38 50 C34 54, 31 46, 27 50 C23 54, 19 46, 16 50 C12 54, 7 50, 7 50 Z"
                      fill="white"
                      stroke="#0B1C30"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <ellipse cx="21" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                    <ellipse cx="33" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 -mb-2">
                  <svg width="38" height="28" viewBox="0 0 38 28" fill="none" className="text-[#3B82F6]">
                    <path d="M32 4 C20 6, 10 14, 6 23" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round" />
                    <path d="M6 23 L12 20 M6 23 L7 17" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="bg-[#CAEB0E] text-black font-black text-[11px] leading-tight px-3 py-1 rounded-full shadow-xs text-center">
                    <div>You&apos;re</div>
                    <div>here</div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`h-full rounded-[26px] transition-all duration-200 flex flex-col ${
                activeLevel === 3
                  ? 'p-[2px] bg-gradient-to-br from-[#5945F1] via-[#8B5CF6] to-[#FE01B1] shadow-lg'
                  : 'border border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="bg-white rounded-[24px] p-6 sm:p-7 h-full flex flex-col justify-between">
                <div>
                  {/* Top Pill Tag: PLAYER */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CAEB0E] text-black text-xs font-black uppercase tracking-wider shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      <span>PLAYER</span>
                    </span>
                  </div>

                  {/* Cashback section */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-4xl font-black text-[#85A900] tracking-tight leading-none">
                        +10%
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] text-slate-500 font-medium">Cashback</span>
                        <span className="text-xs font-bold text-[#85A900]">boost rate</span>
                      </div>
                    </div>
                  </div>

                  {/* What you get */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#0b1c30]">What you get</h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Trading Tools</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>
                          Trading Signal with{' '}
                          <strong className="font-bold text-[#85A900]">80% - 89%</strong> Confidence
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Premium Promotions</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Divider */}
                <div>
                  <div className="h-px bg-slate-100 my-6" />

                  {/* How to get it? */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-xs text-[#0b1c30]">How to get it?</div>
                    <div className="text-xs text-slate-700">
                      Earn <strong className="font-bold text-[#85A900]">250 Points .</strong>
                    </div>
                    <div className="text-xs text-slate-400">
                      This is a favourite stop for active traders.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dotted Arrow to Next Card (Desktop XL) */}
            <div className="hidden xl:flex absolute -right-5 top-[52%] -translate-y-1/2 z-10 pointer-events-none">
              <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                <line x1="0" y1="6" x2="22" y2="6" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 3" />
                <path d="M18 2 L23 6 L18 10" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CARD 4: BOSS
             ════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col">
            {/* Cute Cartoon Ghost & "You're here" callout (when activeLevel === 4) */}
            {activeLevel === 4 && (
              <div className="absolute -top-14 left-4 z-20 flex items-end gap-2 pointer-events-none select-none">
                <div className="relative -mb-1">
                  <svg width="54" height="62" viewBox="0 0 54 62" fill="none" className="drop-shadow-xs">
                    <path
                      d="M7 28 C7 12, 18 5, 27 5 C36 5, 47 12, 47 28 L47 50 C47 50, 42 46, 38 50 C34 54, 31 46, 27 50 C23 54, 19 46, 16 50 C12 54, 7 50, 7 50 Z"
                      fill="white"
                      stroke="#0B1C30"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <ellipse cx="21" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                    <ellipse cx="33" cy="24" rx="2.4" ry="4.5" fill="#0B1C30" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 -mb-2">
                  <svg width="38" height="28" viewBox="0 0 38 28" fill="none" className="text-[#3B82F6]">
                    <path d="M32 4 C20 6, 10 14, 6 23" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round" />
                    <path d="M6 23 L12 20 M6 23 L7 17" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="bg-[#CAEB0E] text-black font-black text-[11px] leading-tight px-3 py-1 rounded-full shadow-xs text-center">
                    <div>You&apos;re</div>
                    <div>here</div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`h-full rounded-[26px] transition-all duration-200 flex flex-col ${
                activeLevel === 4
                  ? 'p-[2px] bg-gradient-to-br from-[#5945F1] via-[#8B5CF6] to-[#FE01B1] shadow-lg'
                  : 'border border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="bg-white rounded-[24px] p-6 sm:p-7 h-full flex flex-col justify-between">
                <div>
                  {/* Top Pill Tag: BOSS */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5945F1] text-white text-xs font-black uppercase tracking-wider shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>BOSS</span>
                    </span>
                  </div>

                  {/* Cashback section */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-4xl font-black text-[#5945F1] tracking-tight leading-none">
                        +15%
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] text-slate-500 font-medium">Cashback</span>
                        <span className="text-xs font-bold text-[#5945F1]">boost rate</span>
                      </div>
                    </div>
                  </div>

                  {/* What you get */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#0b1c30]">What you get</h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Trading Tools</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>
                          Gain full access to{' '}
                          <strong className="font-bold text-[#5945F1]">90%+</strong> confidence signals
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                        <span>Exclusive member only benefits</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Divider */}
                <div>
                  <div className="h-px bg-slate-100 my-6" />

                  {/* How to get it? */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-xs text-[#0b1c30]">How to get it?</div>
                    <div className="text-xs text-slate-700">
                      <strong className="font-bold text-[#5945F1]">500 Points</strong>
                    </div>
                    <div className="text-xs text-slate-400">For traders who don&apos;t quit.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM CALL-TO-ACTION BAR (Exact match to image)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 pb-4">
        <p className="text-sm sm:text-base text-slate-800 font-medium text-center sm:text-left">
          Because staying at the same level is boring.{' '}
          <span className="text-[#5945F1] font-bold">
            A few more trades today. Better perks tomorrow
          </span>
          <span className="text-[#FE01B1] font-black">.</span>
        </p>

        <button
          type="button"
          onClick={() => {
            if (onNavigateToTrade) {
              onNavigateToTrade();
            }
          }}
          className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834df] text-white font-bold text-sm transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
        >
          Trade Now!
        </button>
      </div>
    </div>
  );
};
