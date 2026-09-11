import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface LevelTrackerCardProps {
  user: UserProfile;
  onOpenViewPlan: () => void;
  onAddDemoPoints?: () => void;
  onNavigateToProfile?: () => void;
}

export const LevelTrackerCard: React.FC<LevelTrackerCardProps> = ({
  user,
  onOpenViewPlan,
  onAddDemoPoints,
  onNavigateToProfile,
}) => {
  const percentage = Math.min(100, Math.round((user.currentPoints / user.maxPoints) * 100));

  return (
    <div
      id="level-tracker-card"
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-xl shadow-[#5338ec]/20 transition-all"
      style={{
        background: 'linear-gradient(135deg, #5338ec 0%, #4338ca 100%)',
      }}
    >
      {/* Background Decorative Rings */}
      <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-xl"></div>
      <div className="absolute right-32 -bottom-12 w-40 h-40 rounded-full bg-[#c6f831]/10 pointer-events-none blur-2xl"></div>

      {/* Top Row: Subtitle + Mascot + Rank + Points counter */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          type="button"
          onClick={onNavigateToProfile}
          className="flex items-center gap-3.5 text-left group cursor-pointer"
          title="View User Profile"
        >
          {/* Ghost Mascot Avatar Frame */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
            {user.avatar && (user.avatar.startsWith('/') || user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span>{user.avatar}</span>
            )}
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest font-bold text-white/75 flex items-center gap-1.5">
              <span>YOUR LEVEL</span>
              <span className="w-1 h-1 rounded-full bg-[#c6f831]"></span>
              <span className="text-[#c6f831] font-semibold lowercase">level {user.tierLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight group-hover:underline">
                {user.rankTitle}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#c6f831] text-[#0b1c30] tracking-tight">
                Tier {user.tierLevel}
              </span>
            </div>
          </div>
        </button>

        {/* Points Counter & Progress bar block */}
        <div className="md:w-72 lg:w-80 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5 text-white/90">
              <span>💎</span>
              <span className="font-bold tabular-nums text-white text-sm">
                {user.currentPoints}/{user.maxPoints}
              </span>
              <span className="text-white/70">points</span>
            </div>
            <span className="text-[#c6f831] font-bold text-xs tabular-nums">
              {user.maxPoints - user.currentPoints} pts to Bronze
            </span>
          </div>

          {/* Progress bar with white fill & glow */}
          <div className="w-full h-3 rounded-full bg-white/20 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 my-4.5 border-t border-white/15"></div>

      {/* Perk Row: Bulleted incentives + CTA */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
          <span className="text-white/70 font-medium">Active Tier Perks:</span>
          {user.perks.map((perk, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c6f831] shrink-0" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAddDemoPoints && (
            <button
              onClick={onAddDemoPoints}
              className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all active:scale-95 flex items-center gap-1"
              title="Simulate earning trading points"
            >
              <Zap className="w-3 h-3 text-[#c6f831]" />
              <span>+25 pts</span>
            </button>
          )}

          <button
            id="view-plan-btn"
            onClick={onOpenViewPlan}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#5338ec] text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1 group"
          >
            <span>View Plan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
