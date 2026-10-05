import React, { useState } from 'react';
import {
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  Hash,
  Edit3,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  Settings2,
  Search,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { UserProfile, Broker } from '../../types';
import { INITIAL_BROKERS } from '../../data/mockData';
import { CommunityBrokerAdWidget } from './CommunityBrokerAdWidget';

type ActivityTab = 'all' | 'posts' | 'topics';
type PageTab = 'post' | 'articles';

interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'save' | 'follow';
  label: string;
  timeAgo: string;
  tag?: string;
  thumbnailColor?: string;
}

const ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'like', label: 'Liked a post', timeAgo: '2 hours ago', thumbnailColor: '#0b1c30' },
  { id: 'a2', type: 'comment', label: 'Commented', timeAgo: '1 day ago', thumbnailColor: '#1b0670' },
  { id: 'a3', type: 'save', label: 'Saved an article', timeAgo: '4 days ago', thumbnailColor: '#5338ec' },
  { id: 'a4', type: 'follow', label: 'Followed a topic', timeAgo: '5 days ago', tag: '#TechnicalAnalysis' },
];

const ACTIVITY_ICON: Record<ActivityItem['type'], React.ElementType> = {
  like: Heart,
  comment: MessageCircle,
  save: Bookmark,
  follow: Hash,
};

const MY_POSTS = [
  {
    id: 'mp_1',
    tag: '#Bitcoin',
    category: 'Technical Analysis',
    timeAgo: '2h ago',
    title: 'BTC showing strong structure on the 4H',
    body: "We're holding the higher low and looking like a breakout above this range. If volume continues, I'm watching the $110K – $112K zone next.",
    hasChart: true,
    likes: 124,
    comments: 32,
  },
  {
    id: 'mp_2',
    tag: '#TradingPsychology',
    category: 'Trading Psychology',
    timeAgo: '5 days ago',
    title: 'Staying Disciplined During a Losing Streak',
    body: "Losing streaks happen to every trader. Here's how to manage your mindset, stay disciplined, and avoid common emotional traps...",
    hasChart: false,
    likes: 86,
    comments: 14,
  },
  {
    id: 'mp_3',
    tag: '#BrokerReview',
    category: 'Broker Reviews',
    timeAgo: '1 week ago',
    title: 'Best Low Spread Brokers in 2024 (Comparison)',
    body: 'We compare the top low spread brokers based on fees, execution speed, regulation and platform features to help you choose the right one.',
    hasChart: false,
    likes: 102,
    comments: 28,
  },
];

interface CommunityMyPageTabViewProps {
  user: UserProfile;
  onShowToast: (msg: string) => void;
  onOpenConnectModal?: (broker?: Broker) => void;
}

export const CommunityMyPageTabView: React.FC<CommunityMyPageTabViewProps> = ({
  user,
  onShowToast,
  onOpenConnectModal,
}) => {
  const [activityTab, setActivityTab] = useState<ActivityTab>('all');
  const [pageTab, setPageTab] = useState<PageTab>('post');
  const [search, setSearch] = useState('');

  const visibleActivity = ACTIVITY.filter((a) => {
    if (activityTab === 'all') return true;
    if (activityTab === 'posts') return a.type === 'like' || a.type === 'comment';
    return a.type === 'follow';
  });

  const adBroker = INITIAL_BROKERS.find((b) => b.isTopPick) || INITIAL_BROKERS[0];
  const displayName = user.firstName || user.username;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left: My Activity */}
      <aside className="hidden lg:block xl:col-span-3">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30]">
              <Clock className="w-4 h-4 text-[#5338ec]" /> My Activity
            </h4>
          </div>
          <div className="flex items-center gap-1 bg-[#f8fafc] rounded-full p-1 mb-4">
            {(['all', 'posts', 'topics'] as ActivityTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActivityTab(t)}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  activityTab === t ? 'bg-[#5338ec] text-white shadow-xs' : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {visibleActivity.map((item) => {
              const Icon = ACTIVITY_ICON[item.type];
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F8F7FF] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#5338ec]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0b1c30]">{item.label}</p>
                    <p className="text-xs text-[#94a3b8]">{item.timeAgo}</p>
                    {item.tag && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] text-[10px] font-semibold">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  {item.thumbnailColor && (
                    <div
                      className="w-10 h-10 rounded-lg shrink-0"
                      style={{ background: `linear-gradient(135deg, ${item.thumbnailColor}, #0b1c30)` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Center */}
      <div className="xl:col-span-6 space-y-5">
        {/* Profile header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b0670] via-[#3b23b8] to-[#5338ec] p-6 sm:p-7">
          <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 400 140">
            <polyline
              points="0,100 40,70 80,110 120,50 160,90 200,40 240,80 280,30 320,70 360,20 400,60"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
          <button
            onClick={() => onShowToast('Opening profile editor...')}
            className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>

          <div className="flex items-end gap-5 relative">
            <img
              src={user.avatar}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/90 shrink-0 bg-white"
            />
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-2xl font-display font-bold text-white">{displayName}</h2>
                <CheckCircle2 className="w-5 h-5 text-white fill-sky-400" />
              </div>
              <p className="text-sm text-[#d7d2ff]">@{user.username}trades</p>
            </div>
            <span className="ml-auto mb-1 shrink-0 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold">
              {user.rankTitle}
            </span>
          </div>

          <p className="text-sm text-[#e9e6ff] leading-relaxed mt-4 max-w-md">
            {user.bio || 'Retail trader sharing my learning journey. Focus on price action, risk management and long-term growth.'}
          </p>

          <div className="flex items-center gap-5 mt-4 text-xs text-[#d7d2ff]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Bangkok, Thailand
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Joined Mar 2024
            </span>
          </div>

          <div className="flex items-center gap-6 mt-5">
            <div>
              <span className="text-lg font-bold text-white">{user.followingCount ?? 128}</span>
              <span className="text-xs text-[#d7d2ff] ml-1.5">Following</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white">
                {((user.followersCount ?? 3400) / 1000).toFixed(1)}K
              </span>
              <span className="text-xs text-[#d7d2ff] ml-1.5">Followers</span>
            </div>
          </div>
        </div>

        {/* Post / My Articles tabs + search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#f8fafc] rounded-full p-1">
            <button
              onClick={() => setPageTab('post')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                pageTab === 'post' ? 'bg-gradient-to-r from-[#5338ec] to-[#7c6ef0] text-white shadow-md' : 'text-[#474556]'
              }`}
            >
              Post
            </button>
            <button
              onClick={() => setPageTab('articles')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                pageTab === 'articles' ? 'bg-gradient-to-r from-[#5338ec] to-[#7c6ef0] text-white shadow-md' : 'text-[#474556]'
              }`}
            >
              My Articles
            </button>
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your posts..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
          </div>
          <button
            onClick={() => onShowToast('Filters coming soon')}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 shrink-0"
            aria-label="Filter"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Posts list */}
        {pageTab === 'post' ? (
          <div className="space-y-5">
            {MY_POSTS.filter((p) => !search.trim() || p.title.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <div key={p.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <img src={user.avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-[#0b1c30]">{displayName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                  </div>
                  <span className="text-xs text-[#94a3b8]">· {p.timeAgo} · {p.category}</span>
                  <span className="ml-auto px-2.5 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold shrink-0">
                    {p.tag}
                  </span>
                  <button onClick={() => onShowToast('More options')} className="text-slate-400 hover:text-slate-600 shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-[#0b1c30] mb-1.5">{p.title}</h3>
                <p className="text-sm text-[#474556] leading-relaxed mb-3">{p.body}</p>
                {p.hasChart && (
                  <div className="aspect-video w-full rounded-xl bg-[#0b1c30] mb-3 flex items-center justify-center text-white/40 text-xs font-semibold">
                    Chart
                  </div>
                )}
                <div className="flex items-center gap-5 text-xs text-[#474556] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" /> {p.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" /> {p.comments}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" /> Share
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4" /> Save
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-10 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0b1c30] mb-1">No articles published yet</p>
            <p className="text-xs text-[#474556]">Head over to the Article tab to write your first one.</p>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="xl:col-span-3 space-y-5">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
          <h4 className="text-sm font-bold text-[#0b1c30] mb-4">My Community Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xl font-bold text-[#0b1c30]">
                <FileText className="w-4 h-4 text-[#5338ec]" /> 28
              </p>
              <p className="text-[11px] text-[#474556]">Articles contributed</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xl font-bold text-[#0b1c30]">
                <Heart className="w-4 h-4 text-rose-500" /> 156
              </p>
              <p className="text-[11px] text-[#474556]">Likes received</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xl font-bold text-[#0b1c30]">
                <MessageCircle className="w-4 h-4 text-sky-500" /> 320
              </p>
              <p className="text-[11px] text-[#474556]">Comments received</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xl font-bold text-[#0b1c30]">
                <Bookmark className="w-4 h-4 text-amber-500" /> 12
              </p>
              <p className="text-[11px] text-[#474556]">Articles saved</p>
            </div>
          </div>
        </div>

        {adBroker && <CommunityBrokerAdWidget broker={adBroker} onOpenConnectModal={onOpenConnectModal} />}

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30]">
              <Clock className="w-4 h-4 text-[#5338ec]" /> Top Topics
            </h4>
            <button onClick={() => onShowToast('Opening topic manager')} className="text-xs font-semibold text-[#5338ec] hover:underline">
              Manage
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['#TechnicalAnalysis', '#RiskManagement', '#TradingPsychology', '#Forex', '#MarketNews'].map((t, i) => (
              <span
                key={t}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  i % 2 === 0 ? 'bg-[#EEF0FE] text-[#5338ec]' : 'bg-[#FCE9F6] text-[#be185d]'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
