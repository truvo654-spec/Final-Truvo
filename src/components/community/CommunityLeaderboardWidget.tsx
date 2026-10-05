import React from 'react';
import { Crown, ChevronRight } from 'lucide-react';
import { LEADERBOARD_USERS } from '../../data/mockData';

interface CommunityLeaderboardWidgetProps {
  onNavigateToTab?: (tab: string) => void;
}

const RANK_MEDAL: Record<number, { bg: string; text: string; crown: string }> = {
  1: { bg: 'bg-[#FFF3D6]', text: 'text-[#B8860B]', crown: 'text-[#F5B700] fill-[#F5B700]' },
  2: { bg: 'bg-[#EDEFF5]', text: 'text-[#64748B]', crown: 'text-[#94A3B8] fill-[#94A3B8]' },
  3: { bg: 'bg-[#FBE3D4]', text: 'text-[#B45309]', crown: 'text-[#D97706] fill-[#D97706]' },
};

export const CommunityLeaderboardWidget: React.FC<CommunityLeaderboardWidgetProps> = ({
  onNavigateToTab,
}) => {
  const topFive = LEADERBOARD_USERS.filter((u) => u.rank <= 5).sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-[#F5B700] fill-[#F5B700]" />
          <h4 className="text-sm font-bold text-[#0b1c30]">Top Point Earner List</h4>
        </div>
        <button
          onClick={() => onNavigateToTab?.('leaderboard')}
          className="flex items-center gap-0.5 text-xs font-semibold text-[#5338ec] hover:text-[#4326d8] transition-colors shrink-0"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        {topFive.map((u) => {
          const medal = RANK_MEDAL[u.rank];
          return (
            <div
              key={u.rank}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    medal ? `${medal.bg} ${medal.text}` : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {u.rank}
                </div>
                <div className="w-7 h-7 rounded-full bg-[#F8F7FF] border border-slate-200 flex items-center justify-center text-sm shrink-0">
                  {u.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0b1c30] truncate">{u.username}</p>
                  <p className="text-[10px] text-[#94a3b8] font-medium">{u.tier}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-[#5338ec] font-mono">{u.points.toLocaleString()} pts</span>
                {medal ? (
                  <Crown className={`w-4 h-4 ${medal.crown}`} />
                ) : (
                  <Crown className="w-4 h-4 text-slate-200" />
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
