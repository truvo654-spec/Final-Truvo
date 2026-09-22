import React from 'react';
import { LeaderboardUser } from '../types';
import { Trophy, Medal, Award, ChevronRight } from 'lucide-react';

interface LeaderboardCardProps {
  users: LeaderboardUser[];
  onOpenViewPlan: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  users,
  onOpenViewPlan,
}) => {
  return (
    <div
      id="leaderboard-card"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-display text-lg font-bold text-[#0b1c30] tracking-tight">
              Tops Earning Points
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#474556]">
            Weekly Reset in 2d
          </span>
        </div>

        <p className="text-xs text-[#474556] mt-2 mb-4">
          Community traders racking up the highest lot rebates and tier multiplier points
        </p>

        {/* User list */}
        <div className="space-y-2">
          {users.map((item) => {
            const isTop3 = item.rank <= 3;
            const rankBadge =
              item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`;

            return (
              <div
                key={item.username}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 ${
                  item.isCurrentUser
                    ? 'bg-[#eef2ff] border border-[#d6d0ff] ring-1 ring-[#5338ec]/20'
                    : 'bg-[#f8fafc] hover:bg-slate-100 border border-transparent'
                }`}
              >
                {/* Rank + Avatar + Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 text-center text-xs font-bold text-slate-500 tabular-nums">
                    {rankBadge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-2xs">
                    {item.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0b1c30] truncate">
                        {item.username}
                      </span>
                      {item.isCurrentUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#5338ec] text-white">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {item.tier}
                    </span>
                  </div>
                </div>

                {/* Points & Cashback Earned */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-[#5338ec] tabular-nums flex items-center justify-end gap-1">
                    <span>💎</span>
                    <span>{item.points.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold tabular-nums">
                    ${item.cashbackEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link to Tier Perks */}
      <div className="pt-4 mt-3 border-t border-slate-100">
        <button
          onClick={onOpenViewPlan}
          className="w-full py-2 px-3 rounded-lg border border-[#e2e8f0] hover:border-[#5338ec] bg-white text-xs font-bold text-[#5338ec] hover:bg-[#5338ec]/5 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Explore Tier Progression & Rewards</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
