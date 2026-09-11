import React from 'react';
import { UserProfile } from '../types';
import { GAMIFICATION_TIERS } from '../data/mockData';
import { X, Check, Lock, Sparkles, Award, Zap, HelpCircle } from 'lucide-react';

interface ViewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigateToFullPlan?: () => void;
}

export const ViewPlanModal: React.FC<ViewPlanModalProps> = ({
  isOpen,
  onClose,
  user,
  onNavigateToFullPlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between bg-gradient-to-r from-[#5338ec] to-[#4338ca] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl overflow-hidden shrink-0">
              {user.avatar && (user.avatar.startsWith('/') || user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{user.avatar}</span>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/80 font-bold">
                TIER PROGRESSION ROADMAP
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Gamified Member Levels & Multipliers
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Current Status banner */}
          <div className="p-4 rounded-xl bg-[#eef2ff] border border-[#d6d0ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5338ec]">
                Your Active Tier
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h4 className="font-display text-xl font-bold text-[#0b1c30]">
                  {user.rankTitle} Tier
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#5338ec] text-white">
                  Level {user.tierLevel}
                </span>
              </div>
              <p className="text-xs text-[#474556] mt-1">
                Currently earning {user.boostPercentage}% boosted cashback on every executed lot.
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="text-xs text-slate-500 font-medium">Points Progress</div>
              <div className="text-lg font-bold text-[#5338ec] tabular-nums">
                💎 {user.currentPoints} / {user.maxPoints} pts
              </div>
              <span className="text-[11px] text-slate-500">
                {user.maxPoints - user.currentPoints} points needed for Bronze
              </span>
            </div>
          </div>

          {/* Tiers Grid */}
          <div>
            <h4 className="font-display text-base font-bold text-[#0b1c30] mb-3">
              All Tier Milestones
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {GAMIFICATION_TIERS.map((tier) => {
                const isCurrent = tier.tier === user.rankTitle;
                const isUnlocked = user.currentPoints >= tier.minPoints;

                return (
                  <div
                    key={tier.tier}
                    className={`rounded-xl p-4 border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-[#5338ec] bg-[#f8f9ff] ring-2 ring-[#5338ec]/20 shadow-md'
                        : isUnlocked
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-200 bg-slate-50 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Tier Top Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tier.icon}</span>
                          <div>
                            <h5 className="font-display font-bold text-sm text-[#0b1c30]">
                              {tier.tier}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              Level {tier.level}
                            </span>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5338ec] text-white">
                            CURRENT
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{tier.minPoints} pts</span>
                          </span>
                        )}
                      </div>

                      {/* Boost badge */}
                      <div className="my-2.5 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center">
                        <span className="text-xs font-bold text-[#5338ec]">
                          {tier.cashbackBoost} Rebate
                        </span>
                      </div>

                      {/* Perks list */}
                      <ul className="space-y-1.5 text-[11px] text-[#474556] mt-3">
                        {tier.perks.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#15803d] shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                      Points range: {tier.minPoints} - {tier.maxPoints} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to Earn Points Section */}
          <div className="rounded-xl p-4 bg-[#f8fafc] border border-[#e2e8f0]">
            <h5 className="font-display text-sm font-bold text-[#0b1c30] flex items-center gap-1.5 mb-2.5">
              <Zap className="w-4 h-4 text-[#5338ec]" />
              <span>How To Earn Progression Points</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                <div className="font-bold text-[#5338ec]">💎 +10 pts</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Per standard lot traded on connected broker</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                <div className="font-bold text-[#5338ec]">💎 +50 pts</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Each new verified trading account linked</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                <div className="font-bold text-[#5338ec]">💎 +25 pts</div>
                <div className="text-slate-600 text-[11px] mt-0.5">5-day consecutive trading activity streak</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                <div className="font-bold text-[#5338ec]">💎 +100 pts</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Invite a fellow trader to the community</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          {onNavigateToFullPlan ? (
            <button
              onClick={() => {
                onClose();
                onNavigateToFullPlan();
              }}
              className="text-xs font-bold text-[#5338ec] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Full Membership Roadmap Page →</span>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
