import React, { useState } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Share2,
  Bookmark,
  Repeat2,
  Eye,
  Check,
  UserPlus,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Filter,
} from 'lucide-react';
import {
  TokenMarketItem,
  CommunityPost,
  UserProfile,
  CommunityInfluencer,
} from '../../types';
import { TRENDING_TOKENS } from '../../data/communityData';

interface CommunityFeedsViewProps {
  posts: CommunityPost[];
  onToggleLike: (postId: string) => void;
  onToggleFollowAuthor: (authorHandle: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenCreatePost: () => void;
  onSelectInfluencerByHandle: (handle: string) => void;
  onReactionClick: (postId: string, emoji: string) => void;
  user: UserProfile;
}

export const CommunityFeedsView: React.FC<CommunityFeedsViewProps> = ({
  posts,
  onToggleLike,
  onToggleFollowAuthor,
  onAddComment,
  onOpenCreatePost,
  onSelectInfluencerByHandle,
  onReactionClick,
  user,
}) => {
  const [tokenFilterTab, setTokenFilterTab] = useState<'trending' | 'top' | 'watchlist'>('trending');
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<'foryou' | 'mindshare'>('foryou');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  // Filter posts based on token selection, search, or feedTab
  const filteredPosts = posts.filter((post) => {
    if (selectedTokenSymbol) {
      const mentionsToken = post.tokenMentions?.some(
        (t) => t.symbol.toLowerCase() === selectedTokenSymbol.toLowerCase()
      );
      const textMentions =
        post.content.toLowerCase().includes(selectedTokenSymbol.toLowerCase()) ||
        post.title.toLowerCase().includes(selectedTokenSymbol.toLowerCase());
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* ─── LEFT COLUMN: TOKEN MARKET LIST (3 cols) ─── */}
      <div className="lg:col-span-3 space-y-3">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs">
          <div className="text-xs text-[#474556] font-semibold mb-2.5">
            Showing Posts of:
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] border border-slate-200 rounded-xl mb-3 text-xs">
            <button
              onClick={() => {
                setTokenFilterTab('trending');
                setSelectedTokenSymbol(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                tokenFilterTab === 'trending'
                  ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => {
                setTokenFilterTab('top');
                setSelectedTokenSymbol(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                tokenFilterTab === 'top'
                  ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => {
                setTokenFilterTab('watchlist');
                setSelectedTokenSymbol(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                tokenFilterTab === 'watchlist'
                  ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              Watchlist
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 text-[10px] text-[#474556] font-semibold uppercase tracking-wider pb-2 border-b border-[#e2e8f0] px-1">
            <div className="col-span-2">#</div>
            <div className="col-span-6">Token / MC</div>
            <div className="col-span-4 text-right">Price / Chg</div>
          </div>

          {/* Token Rows */}
          <div className="divide-y divide-[#f1f5f9] max-h-[620px] overflow-y-auto pr-1">
            {TRENDING_TOKENS.map((token) => {
              const isSelected = selectedTokenSymbol === token.symbol;
              const isPositive = token.change24h >= 0;
              return (
                <div
                  key={token.id}
                  onClick={() =>
                    setSelectedTokenSymbol(isSelected ? null : token.symbol)
                  }
                  className={`grid grid-cols-12 items-center py-2 px-1 text-xs hover:bg-[#f8fafc] rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#ede9fe] border border-[#5338ec]/50' : ''
                  }`}
                >
                  <div className="col-span-2 font-mono text-[11px] text-slate-400">
                    {token.rank}
                  </div>
                  <div className="col-span-6 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{token.icon}</span>
                      <div className="truncate">
                        <span className="font-bold text-[#0b1c30] text-xs block leading-tight truncate">
                          {token.symbol}
                        </span>
                        <span className="text-[10px] text-[#474556] font-mono block">
                          {token.marketCap}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <div className="font-mono text-[#0b1c30] font-semibold text-xs leading-tight">
                      {token.price}
                    </div>
                    <div
                      className={`text-[10px] font-mono font-medium ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
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
            <div className="mt-2.5 pt-2 border-t border-[#e2e8f0] flex items-center justify-between">
              <span className="text-xs text-[#0b1c30]">
                Filtered by <strong className="text-[#5338ec]">{selectedTokenSymbol}</strong>
              </span>
              <button
                onClick={() => setSelectedTokenSymbol(null)}
                className="text-[11px] text-[#5338ec] hover:underline font-semibold"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── CENTER COLUMN: TRENDING POSTS FEED (9 cols) ─── */}
      <div className="lg:col-span-9 space-y-4">
        {/* Top Header Controls */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3.5 text-[#0b1c30] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-1.5 font-display">
              <span>Trending Posts</span>
            </h3>

            <div className="flex items-center gap-1 bg-[#f1f5f9] border border-slate-200 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFeedTab('foryou')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  feedTab === 'foryou'
                    ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                    : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setFeedTab('mindshare')}
                className={`py-1 px-3 rounded-lg font-medium transition-all ${
                  feedTab === 'mindshare'
                    ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                    : 'text-[#474556] hover:text-[#0b1c30]'
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
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#5338ec] transition-colors"
              />
            </div>

            <button
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center text-[#474556] shadow-xs">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#0b1c30]">No posts found</p>
              <p className="text-xs text-[#474556] mt-1">
                Try changing your search query or clearing the token filter.
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isBookmarked = bookmarkedPosts[post.id];
              const isCommentsOpen = expandedComments[post.id];

              return (
                <article
                  key={post.id}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-5 text-[#0b1c30] shadow-xs hover:border-[#cbd5e1] hover:shadow-sm transition-all"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        onClick={() => onSelectInfluencerByHandle(post.author.handle)}
                        className="cursor-pointer relative"
                      >
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 hover:border-[#5338ec] transition-colors"
                        />
                        {post.author.verified && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                            ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => onSelectInfluencerByHandle(post.author.handle)}
                            className="font-bold text-sm text-[#0b1c30] hover:text-[#5338ec] cursor-pointer transition-colors"
                          >
                            {post.author.name}
                          </span>
                          <span className="text-xs text-[#474556] font-mono">
                            {post.author.handle}
                          </span>
                          <span className="text-slate-300 text-xs">•</span>
                          <span className="text-xs text-[#474556] font-mono">
                            {post.timestamp}
                          </span>
                        </div>

                        {post.author.influenceScore && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f1f5f9] border border-slate-200 text-[10px] text-[#474556] font-mono">
                              <span className="text-amber-500">★</span>
                              <span>{post.author.influenceScore.toFixed(2)} Influence Score</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleFollowAuthor(post.author.handle)}
                      className={`text-xs font-semibold px-3 py-1 rounded-xl transition-colors flex items-center gap-1 shrink-0 ${
                        post.isFollowingAuthor
                          ? 'bg-[#f1f5f9] text-[#474556] hover:bg-slate-200 border border-slate-200'
                          : 'bg-[#ede9fe] text-[#5338ec] hover:bg-[#5338ec] hover:text-white border border-[#d8d0fe]'
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
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-3 mb-3">
                    <p className="text-xs sm:text-sm text-[#0b1c30] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Embedded Image Graphic */}
                    {post.image && (
                      <div className="rounded-xl overflow-hidden border border-[#e2e8f0] max-h-80 bg-slate-50">
                        <img
                          src={post.image}
                          alt="Post visual"
                          className="w-full h-auto object-cover max-h-80 hover:scale-[1.01] transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Token mentions pills */}
                    {post.tokenMentions && post.tokenMentions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {post.tokenMentions.map((tok, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2.5 py-1 text-xs font-medium"
                          >
                            <span className="text-[#0b1c30] font-bold">{tok.symbol}</span>
                            <span className="text-emerald-600 font-mono text-[11px] font-semibold">
                              +{tok.change}%
                            </span>
                            {tok.sentiment && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded">
                                {tok.sentiment}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction Emoji Row */}
                  {post.reactions && post.reactions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap py-2 border-t border-b border-[#f1f5f9] my-2.5">
                      {post.reactions.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => onReactionClick(post.id, r.emoji)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                            r.active
                              ? 'bg-[#ede9fe] border border-[#5338ec] text-[#5338ec] font-semibold'
                              : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#474556] hover:bg-[#f1f5f9]'
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span className="font-mono text-[11px] font-medium">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Post Engagement Footer */}
                  <div className="flex items-center justify-between text-xs text-[#474556] pt-1">
                    <div className="flex items-center gap-4 sm:gap-6">
                      {/* Views */}
                      <span className="flex items-center gap-1 hover:text-[#0b1c30]">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-[11px]">{post.viewsCount || '1.2K'}</span>
                      </span>

                      {/* Comments Toggle */}
                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className="flex items-center gap-1 hover:text-[#5338ec] transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px]">{post.commentsCount || 0}</span>
                      </button>

                      {/* Reposts */}
                      <button
                        onClick={() => onToggleLike(post.id)}
                        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                      >
                        <Repeat2 className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px]">{post.repostsCount || 0}</span>
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

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                      }}
                      className="p-1 hover:text-[#0b1c30] rounded transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expandable Comments Section */}
                  {isCommentsOpen && (
                    <div className="mt-3 pt-3 border-t border-[#f1f5f9] space-y-3">
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2">
                          {post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2.5 text-xs flex items-start gap-2"
                            >
                              <img
                                src={comment.avatar}
                                alt={comment.author}
                                className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-[#0b1c30]">
                                    {comment.author}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {comment.time}
                                  </span>
                                </div>
                                <p className="text-[#474556] mt-0.5">{comment.text}</p>
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
                          placeholder="Write a comment or share your take..."
                          className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-1.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#5338ec]"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="bg-[#5338ec] hover:bg-[#4326d8] text-white p-2 rounded-xl text-xs transition-colors shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
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
    </div>
  );
};
