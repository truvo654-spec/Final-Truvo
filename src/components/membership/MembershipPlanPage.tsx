import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Gem, ArrowRight, Sparkles, Check, ChevronRight, UserCheck, Eye } from 'lucide-react';
import { MembershipPlanGuestView } from './MembershipPlanGuestView';

export interface MembershipPlanPageProps {
  user: UserProfile;
  isLoggedIn?: boolean;
  onNavigateToTrade?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onToggleLogin?: () => void;
}

export const MembershipPlanPage: React.FC<MembershipPlanPageProps> = ({
  user,
  isLoggedIn = true,
  onNavigateToTrade,
  onShowToast,
  onOpenSignIn,
  onOpenSignUp,
  onNavigateToTab,
  onToggleLogin,
}) => {
  // Allow toggling between Guest mode and Member mode for preview/testing
  const [viewModeOverride, setViewModeOverride] = useState<'guest' | 'member' | null>(null);

  // Determine whether to display the Guest UI (matching D03. Membership plan - Guest.png)
  // or the Logged-in Member UI (matching Membership plan - Member Lv.1.png)
  const isGuest = viewModeOverride !== null ? viewModeOverride === 'guest' : !isLoggedIn;

  // State for active preview level in member mode (1: Rookie, 2: Climber, 3: Player, 4: Boss)
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

  if (isGuest) {
    return (
      <div className="relative w-full">
        {/* Subtle Preview Switcher Banner at top of Guest View */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#CAEB0E]" />
            <span>Membership Plan View:</span>
            <span className="font-bold text-[#5945F1]">Guest Mode (Not Logged In)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setViewModeOverride('guest');
                onShowToast?.('Showing Guest view');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#5945F1] text-white shadow-2xs cursor-pointer"
            >
              Guest UI
            </button>
            <button
              onClick={() => {
                setViewModeOverride('member');
                onShowToast?.('Showing Logged-in Member view');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Member Lv.1 UI
            </button>
          </div>
        </div>

        {/* Guest View exact match to D03. Membership plan - Guest.png */}
        <MembershipPlanGuestView
          onOpenSignIn={onOpenSignIn}
          onOpenSignUp={onOpenSignUp}
          onNavigateToTab={onNavigateToTab}
          onShowToast={onShowToast}
        />
      </div>
    );
  }

  return (
    <div id="membership-plan-page" className="w-full py-2 sm:py-4 space-y-12">
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

        <div className="flex items-center gap-2">
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

          <div className="h-4 w-px bg-slate-200" />

          {/* Quick toggle back to guest view */}
          <button
            onClick={() => {
              setViewModeOverride('guest');
              onShowToast?.('Switching to Guest UI');
            }}
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-[#5945F1] hover:bg-indigo-50 transition-colors cursor-pointer"
            title="Preview how this page looks for guests (not logged in)"
          >
            Preview as Guest
          </button>
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
          (Exact match to Frame 427322784, 427322785, 427322786, 427322787)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {[
            {
              level: 1,
              name: 'ROOKIE',
              badgeBg: 'bg-black text-white',
              badgeDotBg: 'bg-white',
              cashbackType: 'standard',
              whatTitle: 'What you have now',
              features: [
                { text: <span>Trading Tools</span> },
                {
                  text: (
                    <span>
                      <strong className="font-bold text-[#0b1c30]">70% - 74%</strong> Signal Confidence
                    </span>
                  ),
                },
                { text: <span>Broker Comparisons</span> },
              ],
            },
            {
              level: 2,
              name: 'CLIMBER',
              badgeBg: 'bg-[#FD02B0] text-white',
              badgeDotBg: 'bg-white',
              cashbackType: 'boost',
              cashbackRate: '+5%',
              cashbackColor: '#FD02B0',
              whatTitle: 'What you get',
              features: [
                { text: <span>Trading Tools</span> },
                {
                  text: (
                    <span>
                      Trading Signal with{' '}
                      <strong className="font-bold text-[#FD02B0]">75% - 79%</strong> Confidence
                    </span>
                  ),
                },
                { text: <span>Better Broker Offers</span> },
              ],
            },
            {
              level: 3,
              name: 'PLAYER',
              badgeBg: 'bg-[#CAEB0E] text-slate-950 font-black',
              badgeDotBg: 'bg-black',
              cashbackType: 'boost',
              cashbackRate: '+10%',
              cashbackColor: '#65A30D',
              whatTitle: 'What you get',
              features: [
                { text: <span>Trading Tools</span> },
                {
                  text: (
                    <span>
                      Trading Signal with{' '}
                      <strong className="font-bold text-[#65A30D]">80% - 89%</strong> Confidence
                    </span>
                  ),
                },
                { text: <span>Premium Promotions</span> },
              ],
            },
            {
              level: 4,
              name: 'BOSS',
              badgeBg: 'bg-[#5046E5] text-white',
              badgeDotBg: 'bg-white',
              cashbackType: 'boost',
              cashbackRate: '+15%',
              cashbackColor: '#5046E5',
              whatTitle: 'What you get',
              features: [
                { text: <span>Trading Tools</span> },
                {
                  text: (
                    <span>
                      Gain full access to{' '}
                      <strong className="font-bold text-[#5046E5]">90%+</strong> confidence signals
                    </span>
                  ),
                },
                { text: <span>Exclusive member only benefits</span> },
              ],
            },
          ].map((tier, idx) => {
            const isActive = activeLevel === tier.level;

            return (
              <div key={tier.level} className="relative flex flex-col">
                {/* ─── Avatar & Callout Badge above the active card ─── */}
                {isActive && (
                  <div className="absolute -top-16 left-4 z-20 flex items-end gap-2 pointer-events-none select-none">
                    {/* Character Avatar inside soft circular backdrop */}
                    <div className="w-14 h-14 rounded-full bg-[#E8EDF9] flex items-center justify-center shadow-xs">
                      {tier.level === 1 ? (
                        /* Cute Cartoon Ghost (ROOKIE) */
                        <svg
                          width="38"
                          height="44"
                          viewBox="0 0 38 44"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 19 C5 8, 12 4, 19 4 C26 4, 33 8, 33 19 L33 36 C33 36, 29 33, 26 36 C23 39, 21 33, 19 36 C17 39, 14 33, 12 36 C9 39, 5 36, 5 36 Z"
                            fill="white"
                            stroke="#0B1C30"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                          />
                          <ellipse cx="14" cy="17" rx="1.8" ry="3.5" fill="#0B1C30" />
                          <ellipse cx="24" cy="17" rx="1.8" ry="3.5" fill="#0B1C30" />
                        </svg>
                      ) : tier.level === 2 || tier.level === 3 ? (
                        /* Pink Footsteps (CLIMBER & PLAYER) */
                        <svg
                          width="40"
                          height="42"
                          viewBox="0 0 40 42"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g transform="translate(6, 6) rotate(-6)">
                            <rect x="2" y="1" width="9.5" height="15" rx="4.75" fill="white" stroke="#FD02B0" strokeWidth="2.5" />
                            <rect x="3.2" y="18" width="7" height="7.5" rx="3.5" fill="white" stroke="#FD02B0" strokeWidth="2.5" />
                          </g>
                          <g transform="translate(20, 3) rotate(6)">
                            <rect x="2" y="1" width="9.5" height="15" rx="4.75" fill="white" stroke="#FD02B0" strokeWidth="2.5" />
                            <rect x="3.2" y="18" width="7" height="7.5" rx="3.5" fill="white" stroke="#FD02B0" strokeWidth="2.5" />
                          </g>
                        </svg>
                      ) : (
                        /* Purple Royal Crown (BOSS) */
                        <svg
                          width="42"
                          height="42"
                          viewBox="0 0 42 42"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 16 L12 30 L30 30 L35 16 L27 22 L21 11 L15 22 Z"
                            fill="white"
                            stroke="#5046E5"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          <line x1="10" y1="33" x2="32" y2="33" stroke="#5046E5" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>

                    {/* Curved Arrow & Callout Badge */}
                    {tier.level === 4 ? (
                      /* Boss Level Activated callout */
                      <div className="flex items-center gap-1 -mb-1">
                        <svg width="38" height="28" viewBox="0 0 38 28" fill="none">
                          <path d="M34 5 C22 7, 12 14, 6 24" stroke="#5046E5" strokeWidth="1.75" strokeLinecap="round" />
                          <path d="M6 24 L13 21 M6 24 L8 17" stroke="#5046E5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#CAEB0E] px-3 py-1 rounded-full shadow-xs text-center">
                          <div className="text-[11px] font-black text-[#5046E5] leading-tight">Boss Level</div>
                          <div className="text-[11px] font-bold text-slate-900 leading-tight">Activated</div>
                        </div>
                      </div>
                    ) : (
                      /* You're here callout */
                      <div className="flex items-center gap-1 -mb-1">
                        <svg width="38" height="28" viewBox="0 0 38 28" fill="none">
                          <path d="M34 5 C22 7, 12 14, 6 24" stroke="#5046E5" strokeWidth="1.75" strokeLinecap="round" />
                          <path d="M6 24 L13 21 M6 24 L8 17" stroke="#5046E5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#CAEB0E] px-3 py-1 rounded-full shadow-xs text-center">
                          <div className="text-[11px] font-bold text-slate-900 leading-tight">You&apos;re</div>
                          <div className="text-[11px] font-black text-[#5046E5] leading-tight">here</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Card Container with Active Gradient Border ─── */}
                <div
                  onClick={() => {
                    setActiveLevel(tier.level);
                    onShowToast?.(`Selected ${tier.name} tier`);
                  }}
                  className={`h-full rounded-[28px] transition-all duration-300 flex flex-col cursor-pointer ${
                    isActive
                      ? 'p-[2.5px] bg-gradient-to-b from-[#5046E5] via-[#8B5CF6] to-[#FD02B0] shadow-md'
                      : 'border border-[#E0E7FF] bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="bg-white rounded-[25.5px] p-6 sm:p-7 h-full flex flex-col justify-between">
                    <div>
                      {/* Top Pill Tag: ROOKIE, CLIMBER, PLAYER, BOSS */}
                      <div className="mb-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs ${tier.badgeBg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tier.badgeDotBg}`} />
                          <span>{tier.name}</span>
                        </span>
                      </div>

                      {/* Cashback Section */}
                      <div className="mb-6">
                        {tier.cashbackType === 'standard' ? (
                          <>
                            <span className="text-xs text-slate-500 font-medium block">Cashback</span>
                            <h3 className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight mt-1">
                              Standard rate
                            </h3>
                          </>
                        ) : (
                          <div className="flex items-baseline gap-2.5">
                            <span
                              className="text-4xl font-black tracking-tight leading-none"
                              style={{ color: tier.cashbackColor }}
                            >
                              {tier.cashbackRate}
                            </span>
                            <div className="flex flex-col leading-tight">
                              <span className="text-[11px] text-slate-500 font-medium">Cashback</span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: tier.cashbackColor }}
                              >
                                boost rate
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* What you have now / What you get */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-[#0b1c30]">{tier.whatTitle}</h4>
                        <ul className="space-y-2 text-xs text-slate-600">
                          {tier.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                              {feat.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Divider & Dynamic Bottom Content */}
                    <div>
                      <div className="h-px bg-slate-200/80 my-5" />

                      {/* Dynamic Bottom Status based on user's active tier */}
                      {(() => {
                        // 1. ACTIVE TIER
                        if (isActive) {
                          if (tier.level === 4) {
                            return (
                              <div className="space-y-2">
                                <div className="font-bold text-sm text-[#5046E5]">Big leagues now.</div>
                                <div className="text-xs text-slate-500">
                                  Time to show them how it&apos;s done.
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                                  <div className="h-full bg-gradient-to-r from-[#5046E5] to-[#FD02B0] rounded-full w-[25.1%]" />
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-1">
                                  <Gem className="w-3.5 h-3.5 text-[#5046E5]" />
                                  <span>
                                    <strong className="font-bold text-[#5046E5]">251</strong>/1,000
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-2">
                              <div className="font-bold text-sm text-[#5046E5]">Don&apos;t stop now!</div>
                              <div className="text-xs text-slate-500">The good stuff is waiting.</div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                                <div className="h-full bg-gradient-to-r from-[#5046E5] to-[#FD02B0] rounded-full w-[33.3%]" />
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-1">
                                <Gem className="w-3.5 h-3.5 text-[#5046E5]" />
                                <span>
                                  <strong className="font-bold text-[#5046E5]">50</strong>/150 to Next Level
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // 2. PREVIOUS ALREADY ACHIEVED TIERS
                        if (tier.level < activeLevel) {
                          if (tier.level === 1) {
                            return (
                              <div className="space-y-1.5">
                                <div className="font-bold text-sm text-[#0b1c30]">Level achieved.</div>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                  Don&apos;t look back now, we know exactly what you&apos;re capable of.
                                </div>
                              </div>
                            );
                          }
                          if (tier.level === 2) {
                            return (
                              <div className="space-y-1.5">
                                <div className="font-bold text-sm text-[#0b1c30]">100 points in the bag.</div>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                  Level secured. Keep chasing the next one.
                                </div>
                              </div>
                            );
                          }
                          if (tier.level === 3) {
                            return (
                              <div className="space-y-1.5">
                                <div className="font-bold text-sm text-[#0b1c30]">250 points bagged.</div>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                  Go ahead and celebrate, just try not to brag too much.
                                </div>
                              </div>
                            );
                          }
                        }

                        // 3. FUTURE LOCKED TIERS
                        if (tier.level === 2) {
                          return (
                            <div className="space-y-1.5">
                              <div className="font-bold text-sm text-[#0b1c30]">How to get it?</div>
                              <div className="text-xs text-slate-700">
                                Just <strong className="font-bold text-[#FD02B0]">100 points.</strong>
                              </div>
                              <div className="text-xs text-slate-500">
                                A few good trades and you&apos;re here.
                              </div>
                            </div>
                          );
                        }
                        if (tier.level === 3) {
                          return (
                            <div className="space-y-1.5">
                              <div className="font-bold text-sm text-[#0b1c30]">How to get it?</div>
                              <div className="text-xs text-slate-700">
                                Earn <strong className="font-bold text-[#65A30D]">250 Points .</strong>
                              </div>
                              <div className="text-xs text-slate-500">Popular with active traders.</div>
                            </div>
                          );
                        }
                        if (tier.level === 4) {
                          return (
                            <div className="space-y-1.5">
                              <div className="font-bold text-sm text-[#0b1c30]">How to get it?</div>
                              <div className="text-xs text-slate-700">
                                <strong className="font-bold text-[#5046E5]">500 Points</strong>
                              </div>
                              <div className="text-xs text-slate-500">For traders who don&apos;t quit.</div>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Dotted Arrow Connector to Next Card (Desktop XL) */}
                {idx < 3 && (
                  <div className="hidden xl:flex absolute -right-5 top-[52%] -translate-y-1/2 z-10 pointer-events-none">
                    <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                      <line
                        x1="0"
                        y1="6"
                        x2="20"
                        y2="6"
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                      />
                      <path
                        d="M16 2 L21 6 L16 10"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Pagination Dots (Exact match to screenshots) ─── */}
        <div className="flex items-center justify-center gap-2 pt-8 select-none">
          {[1, 2, 3, 4].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setActiveLevel(lvl);
                onShowToast?.(`Selected ${getLevelTitle(lvl)} tier`);
              }}
              aria-label={`Go to Level ${lvl}`}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                activeLevel === lvl
                  ? 'bg-[#5046E5] ring-2 ring-[#5046E5]/20 scale-110'
                  : 'bg-[#DDD6FE] hover:bg-[#C4B5FD]'
              }`}
            />
          ))}
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
