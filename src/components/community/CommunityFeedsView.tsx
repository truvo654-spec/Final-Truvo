import React, { useState } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Share2,
  Bookmark,
  Eye,
  Check,
  UserPlus,
  Send,
  Sparkles,
  Heart,
  Lock,
  Zap,
  Coins,
  ShieldCheck,
  TrendingUp,
  Flame,
} from 'lucide-react';
import {
  TokenMarketItem,
  CommunityPost,
  UserProfile,
} from '../../types';
import { TRENDING_TOKENS } from '../../data/communityData';

interface CommunityFeedsViewProps {
  posts: CommunityPost[];
  user?: UserProfile;
  onToggleLike: (postId: string) => void;
  onToggleFollowAuthor: (authorHandle: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenCreatePost: () => void;
  onSelectInfluencerByHandle: (handle: string) => void;
  onReactionClick: (postId: string, emoji: string) => void;
  onShowToast: (msg: string) => void;
  onOpenTierModal?: () => void;
  onRewardPointsAndCredits?: (pts: number, credits: number, reason: string) => void;
}

export const CommunityFeedsView: React.FC<CommunityFeedsViewProps> = ({
  posts,
  user,
  onToggleLike,
  onToggleFollowAuthor,
  onAddComment,
  onOpenCreatePost,
  onSelectInfluencerByHandle,
  onReactionClick,
  onShowToast,
  onOpenTierModal,
  onRewardPointsAndCredits,
}) => {
  const [tokenTab, setTokenTab] = useState<'trending' | 'top' | 'watchlist'>('trending');
  const [feedTab, setFeedTab] = useState<'foryou' | 'mindshare'>('foryou');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Trigger floating micro-reward animation
  const triggerFloatingReward = (text: string, e?: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    setFloatingPoints((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
    }, 1500);
  };

  // Filter posts based on token selection, search, or feedTab
  const filteredPosts = posts.filter((post) => {
    if (selectedTokenSymbol) {
      const sym = selectedTokenSymbol.toLowerCase();
      const mentionsToken = post.tokenMentions?.some(
        (t) => t.symbol.toLowerCase() === sym || sym.includes(t.symbol.toLowerCase())
      );
      const textMentions =
        post.content.toLowerCase().includes(sym) ||
        post.title.toLowerCase().includes(sym);
      if (!mentionsToken && !textMentions) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesText =
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q) ||
        post.author.handle.toLowerCase().includes(q);
      if (!matchesText) return false;
    }

    return true;
  });

  const handleToggleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentSubmit = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    triggerFloatingReward('+15 Pts');
    onShowToast('🎉 Comment posted! +15 Points & +5 Credits');
  };

  const handleShareClick = (post: CommunityPost) => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast('Link copied to clipboard!');
  };

  // Tipping creator
  const handleTipCreator = (post: CommunityPost) => {
    if (user && user.sydeCredits < 5) {
      onShowToast('⚠️ Insufficient Syde Credits (requires 5 Credits). Earn more in community activities!');
      return;
    }
    if (onRewardPointsAndCredits) {
      onRewardPointsAndCredits(10, -5, `Tipped 5 Credits to ${post.author.name}`);
    }
    triggerFloatingReward('🪙 -5 Credits');
    onShowToast(`🪙 Sent 5 Syde Credits tip to ${post.author.name}! (You earned +10 Pts)`);
  };

  // Check user level for New Post button
  const handleNewPostClick = () => {
    if (user && user.level < 2) {
      onShowToast(`🔒 New Post unlocks at Level 2 (Climber)! You have ${user.currentPoints} Pts (needs 100 Pts).`);
      if (onOpenTierModal) onOpenTierModal();
    } else {
      onOpenCreatePost();
    }
  };

  const displayTokens =
    tokenTab === 'trending'
      ? TRENDING_TOKENS
      : tokenTab === 'top'
      ? [...TRENDING_TOKENS].sort((a, b) => b.change24h - a.change24h)
      : TRENDING_TOKENS.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full relative">
      {/* Floating points micro-particles */}
      {floatingPoints.map((pt) => (
        <div
          key={pt.id}
          className="fixed pointer-events-none z-50 text-xs font-bold text-amber-500 bg-amber-100/90 dark:bg-amber-950/90 dark:text-amber-300 px-2 py-0.5 rounded-full shadow-md border border-amber-300"
          style={{
            left: `${pt.x}px`,
            top: `${pt.y - 20}px`,
            animation: 'floatUp 1.4s ease-out forwards',
          }}
        >
          {pt.text}
        </div>
      ))}

      {/* ─── LEFT COLUMN: SHOWING POSTS OF (3 cols) ─── */}
      <div className="lg:col-span-3 space-y-3">
        <div className="bg-white dark:bg-[#171924] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-4 text-[#0b1c30] dark:text-white shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs text-[#474556] dark:text-slate-400 font-semibold">Showing Posts of:</span>
            <span className="text-[10px] text-[#5338ec] dark:text-indigo-400 font-mono font-bold bg-[#ede9fe] dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
              Live Feed
            </span>
          </div>

          {/* Filter Pills: Trending, Top, Watchlist (Image 1) */}
          <div className="flex items-center gap-1 p-1 bg-[#f1f5f9] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-3 text-xs">
            {(['trending', 'top', 'watchlist'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setTokenTab(tab);
                  setSelectedTokenSymbol(null);
                }}
                className={`flex-1 py-1 px-1.5 rounded-lg font-medium text-[11px] capitalize transition-all text-center ${
                  tokenTab === tab
                    ? 'bg-white dark:bg-[#3861fb] text-[#5338ec] dark:text-white font-bold shadow-xs'
                    : 'text-[#474556] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table Header: # | Token / MC | Price / Change (Image 1) */}
          <div className="grid grid-cols-12 text-[10px] text-[#474556] dark:text-slate-400 font-semibold uppercase tracking-wider pb-2 border-b border-[#e2e8f0] dark:border-slate-800 px-1">
            <div className="col-span-2">#</div>
            <div className="col-span-6">Token / MC</div>
            <div className="col-span-4 text-right">Price / Change</div>
          </div>

          {/* Token Rows */}
          <div className="divide-y divide-[#f1f5f9] dark:divide-slate-800/80 max-h-[520px] overflow-y-auto pr-1">
            {displayTokens.map((token, idx) => {
              const isSelected = selectedTokenSymbol?.toLowerCase() === token.symbol.toLowerCase();
              const isPositive = token.change24h >= 0;

              return (
                <div
                  key={token.id}
                  onClick={() =>
                    setSelectedTokenSymbol(isSelected ? null : token.symbol)
                  }
                  className={`grid grid-cols-12 items-center py-2 px-1 text-xs hover:bg-[#f8fafc] dark:hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#ede9fe] dark:bg-indigo-950/80 border border-[#5338ec]/50' : ''
                  }`}
                >
                  <div className="col-span-2 font-mono text-[11px] text-slate-400">
                    {idx + 1}
                  </div>
                  <div className="col-span-6 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{token.icon}</span>
                      <div className="truncate">
                        <span className="font-bold text-[#0b1c30] dark:text-white text-xs block leading-tight truncate">
                          {token.symbol}
                        </span>
                        <span className="text-[10px] text-[#474556] dark:text-slate-400 font-mono block truncate">
                          {token.marketCap}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <div className="font-mono text-[#0b1c30] dark:text-white font-semibold text-xs leading-tight">
                      {token.price}
                    </div>
                    <div
                      className={`text-[10px] font-mono font-medium ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${token.change24h}%` : `${token.change24h}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTokenSymbol && (
            <div className="mt-2.5 pt-2 border-t border-[#e2e8f0] dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-[#0b1c30] dark:text-slate-200">
                Filtered: <strong className="text-[#5338ec] dark:text-indigo-400">{selectedTokenSymbol}</strong>
              </span>
              <button
                onClick={() => setSelectedTokenSymbol(null)}
                className="text-[11px] text-[#5338ec] dark:text-indigo-400 hover:underline font-semibold"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── CENTER COLUMN: TRENDING POSTS (9 cols) ─── */}
      <div className="lg:col-span-9 space-y-4">
        {/* Top Header Controls (Image 1) */}
        <div className="bg-white dark:bg-[#171924] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-3.5 text-[#0b1c30] dark:text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-[#0b1c30] dark:text-white flex items-center gap-1.5 font-display">
              <span>Trending Posts</span>
            </h3>

            <div className="flex items-center gap-1 bg-[#f1f5f9] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFeedTab('foryou')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  feedTab === 'foryou'
                    ? 'bg-white dark:bg-[#3861fb] text-[#5338ec] dark:text-white font-bold shadow-xs'
                    : 'text-[#474556] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white'
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setFeedTab('mindshare')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  feedTab === 'mindshare'
                    ? 'bg-white dark:bg-[#3861fb] text-[#5338ec] dark:text-white font-bold shadow-xs'
                    : 'text-[#474556] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white'
                }`}
              >
                Mindshare
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts or users..."
                className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0b1c30] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5338ec] transition-colors"
              />
            </div>

            {/* New Post Button with Tier check */}
            <button
              onClick={handleNewPostClick}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition-all shrink-0 ${
                user && user.level < 2
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                  : 'bg-gradient-to-r from-[#5338ec] to-[#4326d8] hover:opacity-95 text-white'
              }`}
            >
              {user && user.level < 2 ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>+ New Post (Lvl 2)</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>+ New Post</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── POSTS: 2-COLUMN MASONRY GRID (MATCHING CMC IMAGE 1) ─── */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-[#171924] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-12 text-center text-[#474556] dark:text-slate-400 shadow-xs">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#0b1c30] dark:text-white">No posts found</p>
            <p className="text-xs text-[#474556] dark:text-slate-400 mt-1">
              Try changing your search query or clearing the token filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => {
              const isBookmarked = bookmarkedPosts[post.id];
              const isCommentsOpen = expandedComments[post.id];

              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-[#171924] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-[#0b1c30] dark:text-white shadow-xs hover:border-[#cbd5e1] dark:hover:border-slate-700 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Post Header: Avatar, Name, Checkmark, Handle, Time, Score, Follow */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          onClick={() => onSelectInfluencerByHandle(post.author.handle)}
                          className="cursor-pointer relative shrink-0"
                        >
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:border-[#5338ec] transition-colors"
                          />
                          {post.author.verified && (
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] text-white font-bold">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              onClick={() => onSelectInfluencerByHandle(post.author.handle)}
                              className="font-bold text-xs sm:text-sm text-[#0b1c30] dark:text-white hover:text-[#5338ec] cursor-pointer transition-colors truncate"
                            >
                              {post.author.name}
                            </span>
                            <span className="text-[11px] text-[#474556] dark:text-slate-400 font-mono truncate">
                              {post.author.handle}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
                            <span className="text-[11px] text-[#474556] dark:text-slate-400 font-mono shrink-0">
                              {post.timestamp}
                            </span>
                          </div>

                          {post.author.influenceScore && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f1f5f9] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-[#474556] dark:text-slate-300 font-mono">
                                <span className="text-amber-500">★</span>
                                <span>{post.author.influenceScore.toFixed(2)} Influence Score</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleFollowAuthor(post.author.handle)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1 shrink-0 ${
                          post.isFollowingAuthor
                            ? 'bg-[#f1f5f9] dark:bg-slate-800 text-[#474556] dark:text-slate-300 hover:bg-slate-200'
                            : 'bg-[#ede9fe] dark:bg-blue-600/20 text-[#5338ec] dark:text-blue-400 hover:bg-[#5338ec] hover:text-white'
                        }`}
                      >
                        {post.isFollowingAuthor ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>+ Follow</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Topic / Headline pill (Image 1) */}
                    {post.title && (
                      <div className="mb-2">
                        <span className="text-xs font-bold text-[#5338ec] dark:text-indigo-400 hover:underline cursor-pointer">
                          Topic: {post.title}
                        </span>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="space-y-2.5 mb-3">
                      <p className="text-xs sm:text-[13px] text-[#0b1c30] dark:text-slate-200 leading-relaxed whitespace-pre-line line-clamp-4">
                        {post.content}
                      </p>

                      {/* Embedded Image Graphic */}
                      {post.image && (
                        <div className="rounded-xl overflow-hidden border border-[#e2e8f0] dark:border-slate-800 max-h-56 bg-slate-50 dark:bg-slate-900">
                          <img
                            src={post.image}
                            alt="Post visual"
                            className="w-full h-auto object-cover max-h-56 hover:scale-[1.01] transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Token mentions pills */}
                      {post.tokenMentions && post.tokenMentions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {post.tokenMentions.map((tok, i) => (
                            <div
                              key={i}
                              onClick={() => setSelectedTokenSymbol(tok.symbol)}
                              className="inline-flex items-center gap-1.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 hover:border-[#5338ec] rounded-lg px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors"
                            >
                              <span className="text-[#0b1c30] dark:text-white font-bold">{tok.symbol}</span>
                              <span
                                className={`font-mono text-[11px] font-semibold ${
                                  tok.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {tok.change >= 0 ? `+${tok.change}%` : `${tok.change}%`}
                              </span>
                              {tok.sentiment && (
                                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1 rounded">
                                  {tok.sentiment}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ─── MarketSyde Feature: Broker Cashback Alpha Bar ─── */}
                    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                          Trade setup on <strong>Exness</strong> • Earn <strong>$19.60/lot Cashback</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => onShowToast('⚡ 1-Click Trade executed! Cashback synced to your MarketSyde wallet')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shrink-0 transition-colors shadow-xs"
                      >
                        Trade & Earn
                      </button>
                    </div>

                    {/* Reaction Emoji Row (Image 1) */}
                    {post.reactions && post.reactions.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap py-2 border-t border-b border-[#f1f5f9] dark:border-slate-800 my-2">
                        {post.reactions.map((r, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              onReactionClick(post.id, r.emoji);
                              triggerFloatingReward('+5 Pts', e);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all active:scale-95 ${
                              r.active
                                ? 'bg-[#ede9fe] dark:bg-indigo-950 border border-[#5338ec] text-[#5338ec] dark:text-indigo-400 font-semibold'
                                : 'bg-[#f8fafc] dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 text-[#474556] dark:text-slate-300 hover:bg-[#f1f5f9]'
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span className="font-mono text-[11px] font-medium">{r.count}</span>
                          </button>
                        ))}

                        {/* Syde Credits Tipping Button */}
                        <button
                          onClick={() => handleTipCreator(post)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors ml-auto font-medium"
                          title="Tip 5 Syde Credits to author"
                        >
                          <Coins className="w-3 h-3 text-amber-500" />
                          <span>Tip 5 Credits</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post Engagement Footer (Image 1) */}
                  <div className="flex items-center justify-between text-xs text-[#474556] dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Views */}
                      <span className="flex items-center gap-1 hover:text-[#0b1c30] dark:hover:text-white">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-[11px]">{post.viewsCount || '17.6k'}</span>
                      </span>

                      {/* Comments Toggle */}
                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className="flex items-center gap-1 hover:text-[#5338ec] dark:hover:text-indigo-400 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px]">{post.commentsCount || 0}</span>
                      </button>

                      {/* Upvote / Like Button */}
                      <button
                        onClick={(e) => {
                          onToggleLike(post.id);
                          if (!post.hasLiked) {
                            triggerFloatingReward('+5 Pts', e);
                          }
                        }}
                        className={`flex items-center gap-1 transition-colors ${
                          post.hasLiked
                            ? 'text-rose-600 font-bold'
                            : 'hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${post.hasLiked ? 'fill-current' : ''}`} />
                        <span className="font-mono text-[11px]">{post.likes || 0}</span>
                      </button>

                      {/* Bookmarks */}
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          isBookmarked
                            ? 'text-amber-500'
                            : 'hover:text-amber-500'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        <span className="font-mono text-[11px]">
                          {(post.bookmarksCount || 0) + (isBookmarked ? 1 : 0)}
                        </span>
                      </button>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShareClick(post)}
                      className="inline-flex items-center gap-1 text-xs text-[#474556] dark:text-slate-400 hover:text-[#5338ec] dark:hover:text-white transition-colors"
                      title="Share post"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Expandable Comments Section */}
                  {isCommentsOpen && (
                    <div className="mt-3 pt-3 border-t border-[#f1f5f9] dark:border-slate-800 space-y-3">
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2">
                          {post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 rounded-xl p-2.5 text-xs flex items-start gap-2"
                            >
                              <img
                                src={comment.avatar}
                                alt={comment.author}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#0b1c30] dark:text-white text-[11px]">
                                    {comment.author}
                                  </span>
                                  <span className="text-[10px] text-[#474556] dark:text-slate-400 font-mono">
                                    {comment.time}
                                  </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2">
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
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                          placeholder="Write a comment (+15 Pts)..."
                          className="flex-1 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-[#0b1c30] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5338ec]"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="p-2 bg-[#5338ec] hover:bg-[#4326d8] text-white rounded-xl transition-colors shadow-xs"
                          title="Post comment"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
