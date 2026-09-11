import React, { useState } from 'react';
import {
  ExternalLink,
  MoreHorizontal,
  UserPlus,
  Check,
  Search,
  Plus,
  BarChart3,
  Info,
  ArrowLeft,
  Eye,
  MessageSquare,
  Repeat2,
  Bookmark,
  Share2,
} from 'lucide-react';
import { CommunityInfluencer, CommunityPost } from '../../types';
import {
  CRYPTO_ADVENTURE_PROFILE,
  CRYPTO_ADVENTURE_POSTS,
} from '../../data/communityData';

interface CommunityProfileViewProps {
  influencer?: CommunityInfluencer;
  posts?: CommunityPost[];
  onBackToFeeds: () => void;
  onToggleFollow: (influencerId: string) => void;
  onShowToast: (msg: string) => void;
}

export const CommunityProfileView: React.FC<CommunityProfileViewProps> = ({
  influencer = CRYPTO_ADVENTURE_PROFILE,
  posts = CRYPTO_ADVENTURE_POSTS,
  onBackToFeeds,
  onToggleFollow,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'articles' | 'reactions'>('posts');
  const [isFollowing, setIsFollowing] = useState(influencer.isFollowing || false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFollowClick = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    onToggleFollow(influencer.id);
    onShowToast(
      nextState
        ? `⭐ You are now following ${influencer.name}`
        : `Unfollowed ${influencer.name}`
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* ─── LEFT COLUMN: INFLUENCER PROFILE CARD (4 cols) ─── */}
      <div className="lg:col-span-4 space-y-4">
        <button
          onClick={onBackToFeeds}
          className="inline-flex items-center gap-1.5 text-xs text-[#474556] hover:text-[#0b1c30] transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Feeds</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden text-[#0b1c30] shadow-xs hover:border-[#cbd5e1] transition-all">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-100 relative border-b border-[#e2e8f0]" />

          <div className="p-5 pt-0 relative space-y-4">
            {/* Avatar & Follow Controls */}
            <div className="flex items-end justify-between -mt-10 mb-2">
              <div className="relative">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white bg-slate-100 shadow-md"
                />
                {influencer.verified && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowToast('Profile options')}
                  className="p-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0b1c30] border border-[#e2e8f0] transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <button
                  onClick={handleFollowClick}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isFollowing
                      ? 'bg-slate-100 text-[#0b1c30] hover:bg-slate-200 border border-slate-200'
                      : 'bg-[#5338ec] hover:bg-[#4326d8] text-white shadow-xs'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Name, Handle, Rank */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30] font-display">{influencer.name}</h3>
                {influencer.rank && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-700 font-bold">
                    Rank #{influencer.rank}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#474556] font-mono mt-0.5">{influencer.handle}</p>

              {influencer.bio && (
                <p className="text-xs text-[#474556] mt-2.5 leading-relaxed">
                  {influencer.bio}
                </p>
              )}

              {influencer.website && (
                <a
                  href={`https://${influencer.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#5338ec] hover:underline mt-2 font-mono font-medium"
                >
                  <span>{influencer.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Social Insights Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#474556]">
              Social Insights
            </h4>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 rounded-lg bg-slate-900 text-white text-[10px] z-30 shadow-lg">
                Metrics calculated based on public signal performance and engagement mindshare.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3">
              <span className="text-[11px] text-[#474556] block mb-1">Social Influence</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-mono text-[#0b1c30]">
                  {influencer.influenceScore.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold">+0%</span>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3">
              <span className="text-[11px] text-[#474556] block mb-1">Analytical Depth</span>
              <span className="text-base font-bold font-mono text-[#0b1c30]">
                {influencer.analyticalDepth || '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Token Mentions Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#474556]">
              Token Mentions
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>Mindshare</span>
              <span>•</span>
              <span>Price</span>
              <span>•</span>
              <span>24h Sentiment</span>
            </div>
          </div>

          <div className="py-8 text-center bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-2">
            <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-[#0b1c30] font-semibold">No data available</p>
          </div>
        </div>
      </div>

      {/* ─── CENTER COLUMN: AUTHOR'S ALL POSTS (8 cols) ─── */}
      <div className="lg:col-span-8 space-y-4">
        {/* Header Controls */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3 text-[#0b1c30] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0b1c30] font-display">All Posts</h3>
            <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  activeTab === 'posts'
                    ? 'bg-white text-[#5338ec] shadow-xs font-semibold'
                    : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  activeTab === 'comments'
                    ? 'bg-white text-[#5338ec] shadow-xs font-semibold'
                    : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  activeTab === 'articles'
                    ? 'bg-white text-[#5338ec] shadow-xs font-semibold'
                    : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                Articles
              </button>
              <button
                onClick={() => setActiveTab('reactions')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  activeTab === 'reactions'
                    ? 'bg-white text-[#5338ec] shadow-xs font-semibold'
                    : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                Reactions
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search author's posts..."
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 text-[#0b1c30] shadow-xs hover:border-[#cbd5e1] hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#0b1c30]">{influencer.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {post.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#0b1c30] leading-snug">
                {post.title}
              </h4>

              <p className="text-xs sm:text-sm text-[#474556] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9] text-xs text-[#474556]">
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.viewsCount || '100'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="w-3.5 h-3.5" />
                    <span>{post.repostsCount || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{post.bookmarksCount || 0}</span>
                  </span>
                </div>

                <button
                  onClick={() => onShowToast('Share link copied')}
                  className="p-1 text-slate-400 hover:text-[#0b1c30] transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}

          {/* End of data indicator */}
          <div className="py-6 text-center text-xs text-slate-400 font-mono">
            ── No more data ──
          </div>
        </div>
      </div>
    </div>
  );
};
