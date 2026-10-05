import React from 'react';
import {
  MessageSquare,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Bitcoin,
  BarChart3,
  ShieldAlert,
  AlertTriangle,
  Trophy,
} from 'lucide-react';

interface KeyTopic {
  tag: string;
  posts: string;
  trend: 'up' | 'down';
}

const KEY_TOPICS: KeyTopic[] = [
  { tag: '#Bitcoin', posts: '12.4K posts', trend: 'up' },
  { tag: '#TradingStrategy', posts: '8.1K posts', trend: 'up' },
  { tag: '#RiskManagement', posts: '6.5K posts', trend: 'up' },
  { tag: '#XAUUSD', posts: '5.2K posts', trend: 'up' },
  { tag: '#DayTrading', posts: '4.8K posts', trend: 'down' },
  { tag: '#TechnicalAnalysis', posts: '4.1K posts', trend: 'up' },
  { tag: '#MarketNews', posts: '3.9K posts', trend: 'up' },
  { tag: '#Forex', posts: '3.4K posts', trend: 'up' },
  { tag: '#Options', posts: '2.8K posts', trend: 'up' },
  { tag: '#Psychology', posts: '2.6K posts', trend: 'up' },
];

interface SuggestedItem {
  id: string;
  title: string;
  comments: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const SUGGESTED_ITEMS: SuggestedItem[] = [
  { id: 'sg1', title: 'BTC to $120K this year?', comments: '1.2K comments', icon: Bitcoin, iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { id: 'sg2', title: 'Best brokers for low spreads?', comments: '892 comments', icon: BarChart3, iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  { id: 'sg3', title: 'Your risk management rules', comments: '645 comments', icon: ShieldAlert, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 'sg4', title: 'Gold breakout soon?', comments: '538 comments', icon: AlertTriangle, iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
  { id: 'sg5', title: 'Prop firm experiences', comments: '421 comments', icon: Trophy, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500' },
];

interface CommunityTopicsSidebarProps {
  onOpenTopics?: () => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityTopicsSidebar: React.FC<CommunityTopicsSidebarProps> = ({
  onOpenTopics,
  onShowToast,
}) => {
  return (
    <>
      {/* ─── KEY TOPICS DISCUSSIONS ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#5338ec]" />
            <h4 className="text-sm font-bold text-[#0b1c30]">Key Topics Discussions</h4>
          </div>
          <button
            onClick={onOpenTopics}
            className="flex items-center gap-0.5 text-xs font-semibold text-[#5338ec] hover:text-[#4326d8] transition-colors shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          {KEY_TOPICS.map((t, i) => (
            <button
              key={t.tag}
              onClick={() => onShowToast?.(`Showing posts tagged ${t.tag}`)}
              className="w-full flex items-center justify-between py-1.5 px-1 rounded-lg hover:bg-[#f8fafc] transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-mono text-slate-400 w-3.5 shrink-0">{i + 1}</span>
                <span className="text-sm font-semibold text-[#0b1c30] group-hover:text-[#5338ec] transition-colors truncate">
                  {t.tag}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#94a3b8] font-medium">{t.posts}</span>
                {t.trend === 'up' ? (
                  <ArrowUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-rose-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── SUGGESTED FOR YOU ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#5338ec]" />
            <h4 className="text-sm font-bold text-[#0b1c30]">Suggested for You</h4>
          </div>
          <button
            onClick={onOpenTopics}
            className="flex items-center gap-0.5 text-xs font-semibold text-[#5338ec] hover:text-[#4326d8] transition-colors shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {SUGGESTED_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onShowToast?.(`Opening "${item.title}"...`)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${item.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0b1c30] group-hover:text-[#5338ec] transition-colors line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#94a3b8] font-medium">{item.comments}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
