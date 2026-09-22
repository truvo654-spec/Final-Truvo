import React, { useState } from 'react';
import { ActivityLogItem, UserProfile } from '../types';
import { X, ArrowUpRight, ArrowDownRight, Sparkles, Filter, Calendar, Search, Maximize2 } from 'lucide-react';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  activityLogs: ActivityLogItem[];
  onOpenFullPage?: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
  user,
  activityLogs,
  onOpenFullPage,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'points' | 'credits'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredLogs = activityLogs.filter((log) => {
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'points'
        ? log.type === 'points' || log.type === 'both'
        : log.type === 'credits' || log.type === 'both';

    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-lg text-[#0b1c30] flex items-center gap-2">
              <span>Points & Credits Activity Log</span>
              <span className="text-xs bg-[#5338ec]/10 text-[#5338ec] font-semibold px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep track of what goes around Points and Credits in your account
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenFullPage && (
              <button
                onClick={onOpenFullPage}
                className="px-2.5 py-1.5 rounded-lg border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open dedicated Activity Logs page"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Full Page</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Balance Cards */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-slate-100 bg-slate-50/30">
          {/* Points */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Trader Points</span>
              <span>💎</span>
            </div>
            <div className="text-xl font-bold text-[#5338ec] font-mono mt-1">
              {user.currentPoints} <span className="text-xs font-normal text-slate-400">/ {user.maxPoints} pts</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Rank: <strong className="text-slate-700">{user.rankTitle}</strong>
            </div>
          </div>

          {/* Credits */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Syde Credits Balance</span>
              <span>🪙</span>
            </div>
            <div className="text-xl font-bold text-emerald-600 font-mono mt-1">
              {user.sydeCredits}{' '}
              <span className="text-xs font-normal text-emerald-500 font-sans">
                (+{user.lastWeekCredits || 75} this week)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Available for Points conversion
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-[#5338ec] shadow-2xs'
                  : 'text-slate-600 hover:text-[#0b1c30]'
              }`}
            >
              All Events ({activityLogs.length})
            </button>
            <button
              onClick={() => setFilterType('points')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterType === 'points'
                  ? 'bg-white text-[#5338ec] shadow-2xs'
                  : 'text-slate-600 hover:text-[#0b1c30]'
              }`}
            >
              💎 Points Only
            </button>
            <button
              onClick={() => setFilterType('credits')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterType === 'credits'
                  ? 'bg-white text-[#5338ec] shadow-2xs'
                  : 'text-slate-600 hover:text-[#0b1c30]'
              }`}
            >
              🪙 Credits Only
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#5338ec]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          </div>
        </div>

        {/* Transaction Items */}
        <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No activity logs match your search.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                      log.category === 'Mission'
                        ? 'bg-purple-100 text-[#5338ec]'
                        : log.category === 'Rebate'
                        ? 'bg-emerald-100 text-emerald-700'
                        : log.category === 'Conversion'
                        ? 'bg-blue-100 text-blue-700'
                        : log.category === 'Streak'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {log.category === 'Mission' && '🎯'}
                    {log.category === 'Rebate' && '💵'}
                    {log.category === 'Conversion' && '🔄'}
                    {log.category === 'Streak' && '🔥'}
                    {log.category === 'Bonus' && '🎁'}
                  </div>

                  <div>
                    <div className="font-semibold text-xs text-[#0b1c30]">
                      {log.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {log.description}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-500">{log.category}</span>
                    </div>
                  </div>
                </div>

                {/* Amount Badges */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  {log.pointsChange !== undefined && (
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                        log.pointsChange >= 0
                          ? 'bg-purple-50 text-[#5338ec]'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {log.pointsChange >= 0 ? `+${log.pointsChange}` : log.pointsChange} 💎
                    </span>
                  )}
                  {log.creditsChange !== undefined && (
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                        log.creditsChange >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {log.creditsChange >= 0 ? `+${log.creditsChange}` : log.creditsChange} 🪙
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Points and credits are automatically credited upon completing ecosystem activities.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
