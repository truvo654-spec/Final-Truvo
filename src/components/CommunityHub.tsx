import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Share2,
  Trophy,
  Users,
  Radio,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  Filter,
  PlusCircle,
  Clock,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Flame,
  Volume2,
} from 'lucide-react';
import {
  CommunityPost,
  CommunityChallenge,
  TopContributor,
  UserProfile,
  MarketSignal,
} from '../types';
import { CreatePostModal } from './CreatePostModal';

interface CommunityHubProps {
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  challenges: CommunityChallenge[];
  setChallenges: React.Dispatch<React.SetStateAction<CommunityChallenge[]>>;
  contributors: TopContributor[];
  setContributors: React.Dispatch<React.SetStateAction<TopContributor[]>>;
  user: UserProfile;
  onRewardPoints: (points: number, reason: string) => void;
  onSelectSignalByTicker?: (ticker: string) => void;
  onOpenConnectModal: () => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  posts,
  setPosts,
  challenges,
  setChallenges,
  contributors,
  setContributors,
  user,
  onRewardPoints,
  onSelectSignalByTicker,
  onOpenConnectModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inVoiceRoom, setInVoiceRoom] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Like / Upvote handler
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          const newLikes = hasLiked ? post.likes + 1 : post.likes - 1;
          if (hasLiked) {
            onRewardPoints(5, 'Upvoted community alpha');
            showToast('👍 Upvoted! +5 Points awarded for community engagement');
          }
          return { ...post, likes: newLikes, hasLiked };
        }
        return post;
      })
    );
  };

  // Follow / Unfollow contributor
  const handleToggleFollow = (contributorId: string) => {
    setContributors((prev) =>
      prev.map((c) => {
        if (c.id === contributorId) {
          const isFollowing = !c.isFollowing;
          const deltaFollowers = isFollowing ? 1 : -1;
          showToast(
            isFollowing
              ? `⭐ You are now following ${c.name}`
              : `Unfollowed ${c.name}`
          );
          return { ...c, isFollowing, followers: c.followers + deltaFollowers };
        }
        return c;
      })
    );
  };

  // Join challenge
  const handleToggleChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === challengeId) {
          const joined = !ch.joined;
          const participantsCount = joined
            ? ch.participantsCount + 1
            : ch.participantsCount - 1;
          if (joined) {
            onRewardPoints(20, `Enrolled in ${ch.title}`);
            showToast(`🏁 Enrolled in challenge! +20 Points added to your level`);
          }
          return { ...ch, joined, participantsCount };
        }
        return ch;
      })
    );
  };

  // Submit comment
  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            author: user.username,
            avatar: user.avatar,
            tier: user.rankTitle,
            time: 'Just now',
            text,
          };
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );

    setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
    onRewardPoints(10, 'Contributed to community discussion');
    showToast('💬 Reply posted! +10 Points awarded');
  };

  // Handle post creation
  const handleCreatePost = (
    newPostData: Omit<CommunityPost, 'id' | 'likes' | 'hasLiked' | 'commentsCount' | 'comments'>
  ) => {
    const fullPost: CommunityPost = {
      ...newPostData,
      id: `post_${Date.now()}`,
      likes: 1,
      hasLiked: true,
      commentsCount: 0,
      comments: [],
    };

    setPosts((prev) => [fullPost, ...prev]);
    onRewardPoints(25, 'Published alpha trade setup');
    showToast('🚀 Alpha setup published! +25 Points added to your level');
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Alpha' && post.category === 'Alpha') ||
      (activeCategory === 'Discussion' && post.category === 'Discussion') ||
      (activeCategory === 'Review' && post.category === 'Review') ||
      (activeCategory === 'Educational' && post.category === 'Educational');

    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.ticker && post.ticker.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#c6f831] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Trading Floor Status Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Weekly Prize Pool */}
        <div className="bg-gradient-to-br from-[#0b1c30] to-[#1e1b4b] rounded-2xl p-5 text-white border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5338ec]/20 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 border border-amber-400/30">
                <Trophy className="w-3.5 h-3.5" />
                <span>Weekly Jackpot</span>
              </span>
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#c6f831]" />
                <span>Ends: 2d 14h</span>
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
              $1,750 USD Pool
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Funded by broker rebate surplus. Distributed to top 10 traders this Sunday.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center -space-x-1.5">
              <span className="w-7 h-7 rounded-full bg-amber-500/30 border border-white/20 flex items-center justify-center text-xs">👑</span>
              <span className="w-7 h-7 rounded-full bg-slate-500/30 border border-white/20 flex items-center justify-center text-xs">⚡</span>
              <span className="w-7 h-7 rounded-full bg-orange-500/30 border border-white/20 flex items-center justify-center text-xs">🚀</span>
              <span className="text-[11px] text-slate-400 pl-3">+318 entered</span>
            </div>
            <button
              onClick={() => handleToggleChallenge('chal_1')}
              className="px-3 py-1.5 rounded-lg bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>Join Sprint</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Live Trading Floor Voice Room */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1.5 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Voice Trading Room</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                428 Online
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-[#0b1c30]">
              London-NY Overlap Session
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Order flow analysis on Gold (XAU/USD) and EUR/USD liquidity sweeps with real-time audio commentary.
            </p>
          </div>
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Volume2 className="w-4 h-4 text-[#5338ec]" />
              <span className="font-medium">ApexScalper_X speaking...</span>
            </div>
            <button
              onClick={() => {
                setInVoiceRoom(!inVoiceRoom);
                showToast(
                  !inVoiceRoom
                    ? '🎧 Connected to Live Trading Floor Voice Room!'
                    : 'Disconnected from Trading Floor.'
                );
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inVoiceRoom
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-[#0b1c30] text-white hover:bg-slate-800'
              }`}
            >
              {inVoiceRoom ? 'Leave Floor' : 'Tune In Live'}
            </button>
          </div>
        </div>

        {/* Card 3: Rebate Transparency Pledge */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-full bg-violet-50 text-[#5338ec] text-[11px] font-bold flex items-center gap-1.5 border border-violet-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5338ec]" />
                <span>Transparency Report</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">March 2026</span>
            </div>
            <h3 className="font-display text-xl font-bold text-[#0b1c30]">
              $142,850.00
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated lot cashback credited to 2,490 active community members this month across 18,420 lots.
            </p>
          </div>
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              100% On-Time Payouts
            </span>
            <button
              onClick={onOpenConnectModal}
              className="text-xs font-bold text-[#5338ec] hover:underline flex items-center gap-1"
            >
              <span>Connect Account</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Community Layout: Posts & Discussions Left, Right Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Alpha Feed & Discussions */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Controls Bar: Category Filters & Search & New Post Button */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {(['All', 'Alpha', 'Discussion', 'Review', 'Educational'] as const).map(
                  (cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-[#5338ec] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        {cat === 'All' && 'All Pulse'}
                        {cat === 'Alpha' && '⚡ Alpha Setups'}
                        {cat === 'Discussion' && '💬 Strategy'}
                        {cat === 'Review' && '⭐ Broker Reviews'}
                        {cat === 'Educational' && '📚 Guides'}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Share Alpha CTA */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-[#c6f831]" />
                <span>Share Trade Setup</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trade ideas, tickers (e.g. XAU/USD, EUR/USD), or authors..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5338ec] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-display font-bold text-base text-[#0b1c30]">
                  No trade setups found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your filter or be the first to post a high-conviction trade setup for the community.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#5338ec] text-white text-xs font-bold"
                >
                  Post First Alpha
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isExpanded = !!expandedComments[post.id];

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#5338ec]/40 transition-all space-y-4"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg border border-slate-200 shadow-sm shrink-0">
                          {post.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#0b1c30]">
                              {post.author.name}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {post.author.handle}
                            </span>
                            {post.author.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                post.author.tier === 'Elite'
                                  ? 'bg-amber-100 text-amber-800'
                                  : post.author.tier === 'Pro Trader'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {post.author.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{post.timestamp}</span>
                            {post.author.winRate && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold">
                                  {post.author.winRate} Win Rate
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          post.category === 'Alpha'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : post.category === 'Discussion'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : post.category === 'Review'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-violet-50 text-violet-800 border border-violet-200'
                        }`}
                      >
                        {post.category}
                      </span>
                    </div>

                    {/* Trade Setup Box (if Alpha) */}
                    {post.category === 'Alpha' && post.ticker && (
                      <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-extrabold text-white ${
                                post.side === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            >
                              {post.side}
                            </span>
                            <span className="font-mono font-bold text-sm text-[#0b1c30]">
                              {post.ticker}
                            </span>
                            {post.projectedRebate && (
                              <span className="text-[11px] font-semibold text-[#5338ec] bg-[#5338ec]/10 px-2 py-0.5 rounded-full">
                                {post.projectedRebate}
                              </span>
                            )}
                          </div>

                          {onSelectSignalByTicker && (
                            <button
                              onClick={() => onSelectSignalByTicker(post.ticker!)}
                              className="text-xs font-semibold text-[#5338ec] hover:underline flex items-center gap-1"
                            >
                              <span>View Live Order Book</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Trade Coordinates Matrix */}
                        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                          {post.entryPrice && (
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                Entry Price
                              </div>
                              <div className="font-mono font-bold text-slate-800">
                                {post.entryPrice}
                              </div>
                            </div>
                          )}
                          {post.targetPrice && (
                            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                              <div className="text-[10px] text-emerald-600 uppercase font-semibold">
                                Target (TP)
                              </div>
                              <div className="font-mono font-bold text-emerald-800">
                                {post.targetPrice}
                              </div>
                            </div>
                          )}
                          {post.stopLoss && (
                            <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100">
                              <div className="text-[10px] text-rose-600 uppercase font-semibold">
                                Stop Loss (SL)
                              </div>
                              <div className="font-mono font-bold text-rose-800">
                                {post.stopLoss}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="space-y-2">
                      <h4 className="font-display font-bold text-base text-[#0b1c30]">
                        {post.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#474556] leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        {/* Upvote Button */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            post.hasLiked
                              ? 'bg-[#5338ec]/10 text-[#5338ec]'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${
                              post.hasLiked ? 'fill-[#5338ec] text-[#5338ec]' : ''
                            }`}
                          />
                          <span className="font-mono font-bold">{post.likes}</span>
                          <span className="hidden sm:inline">Upvotes</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-mono font-bold">{post.commentsCount}</span>
                          <span className="hidden sm:inline">Replies</span>
                        </button>
                      </div>

                      {/* Share Button */}
                      <button
                        onClick={() => {
                          showToast('🔗 Trade setup link copied to clipboard!');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-xs font-semibold"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>

                    {/* Comments Section Drawer */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                        {post.comments.length > 0 && (
                          <div className="space-y-2.5">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-slate-50 rounded-xl p-3 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                                    <span>{comment.avatar}</span>
                                    <span>{comment.author}</span>
                                    <span className="text-[10px] font-semibold text-[#5338ec] bg-[#5338ec]/10 px-1.5 py-0.2 rounded">
                                      {comment.tier}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {comment.time}
                                  </span>
                                </div>
                                <p className="text-slate-600 pl-5 leading-relaxed">
                                  {comment.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Reply Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCommentText[post.id] || ''}
                            onChange={(e) =>
                              setNewCommentText((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder="Add your execution analysis or perspective..."
                            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5338ec] focus:bg-white transition-all"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold rounded-xl transition-all"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar: Fixed 300px on LG */}
        <div className="w-full lg:w-[300px] lg:shrink-0">
          <div className="space-y-6 lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar">
          {/* Top Alpha Contributors Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h4 className="font-display font-bold text-base text-[#0b1c30]">
                  Top Alpha Leaders
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Audited
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {contributors.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-base border border-slate-200">
                      {c.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#0b1c30] flex items-center gap-1.5">
                        <span>{c.name}</span>
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 rounded">
                          {c.tier}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="text-emerald-700 font-semibold">
                          {c.winRate} Win
                        </span>
                        <span>•</span>
                        <span>{c.alphaCalls} setups</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(c.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      c.isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#5338ec] text-white hover:bg-[#4338ca]'
                    }`}
                  >
                    {c.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Lot Challenges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#5338ec]" />
                <h4 className="font-display font-bold text-base text-[#0b1c30]">
                  Lot Volume Races
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#5338ec] bg-[#5338ec]/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="space-y-3">
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-display font-bold text-xs text-[#0b1c30]">
                        {ch.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 font-mono shrink-0">
                      {ch.prize}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Your volume:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {ch.progress} / {ch.target}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5338ec] to-[#c6f831] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (ch.progress / parseFloat(ch.target)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {ch.participantsCount} participants • {ch.endsIn} left
                    </span>
                    <button
                      onClick={() => handleToggleChallenge(ch.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        ch.joined
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#0b1c30] text-white hover:bg-slate-800'
                      }`}
                    >
                      {ch.joined ? '✓ Enrolled' : 'Join Race'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="p-4 rounded-2xl bg-[#eef2ff] border border-[#d6d0ff] space-y-2 text-xs text-[#3a07d6]">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#5338ec]" />
              <span>Community Integrity Pledge</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every alpha setup and rebate discussion is benchmarked against real broker execution. No unverified trading claims or promotional affiliate spam tolerated.
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* Modal for creating a new post */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        username={user.username}
        avatar={user.avatar}
        tier={user.rankTitle}
      />
    </div>
  );
};
