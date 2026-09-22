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
  Bell,
  Gift,
  Heart,
  UserPlus,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Filter,
  LineChart,
  ChevronDown,
} from 'lucide-react';
import {
  TokenMarketItem,
  CommunityPost,
  UserProfile,
  CommunityInfluencer,
} from '../../types';
import { instruments } from '../analysis/detail/mockMarket';

interface CommunityFeedsViewProps {
  posts: CommunityPost[];
  onToggleLike: (postId: string) => void;
  onToggleFollowAuthor: (authorHandle: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenCreatePost: () => void;
  onSelectInfluencerByHandle: (handle: string) => void;
  onOpenAdvancedChart: (symbol: string) => void;
  user: UserProfile;
}

export const CommunityFeedsView: React.FC<CommunityFeedsViewProps> = ({
  posts,
  onToggleLike,
  onToggleFollowAuthor,
  onAddComment,
  onOpenCreatePost,
  onSelectInfluencerByHandle,
  onOpenAdvancedChart,
  user,
}) => {
  const [tokenFilterTab, setTokenFilterTab] = useState<'trending' | 'gainers' | 'losers'>('trending');
  const [tokenDuration, setTokenDuration] = useState('1D');
  const [assetFilter, setAssetFilter] = useState('All');
  const assetCategories = ['All', 'Stocks', 'Crypto', 'Forex', 'Commodities', 'Indices'];
  const supplementalTokens = [
    ['EUR/USD', 'Forex', 1.0864, 0.42, 1.18],
    ['GBP/USD', 'Forex', 1.2931, -0.18, 1.64],
    ['USD/JPY', 'Forex', 148.62, 0.27, 0.91],
    ['AUD/USD', 'Forex', 0.6578, -0.36, 0.74],
    ['USD/CAD', 'Forex', 1.3612, 0.12, 0.83],
    ['XAU/USD', 'Commodities', 2328.4, 0.64, 15.2],
    ['WTI', 'Commodities', 78.16, -1.12, 8.7],
    ['BRENT', 'Commodities', 82.41, 0.38, 9.3],
    ['XAG/USD', 'Commodities', 29.18, 1.46, 1.92],
    ['NATGAS', 'Commodities', 2.74, -2.08, 3.1],
    ['S&P 500', 'Indices', 5487.03, 0.82, 5120],
    ['NASDAQ 100', 'Indices', 19342.41, 1.14, 2870],
    ['DOW 30', 'Indices', 38778.1, 0.31, 1210],
    ['DAX', 'Indices', 18386.7, -0.24, 980],
    ['NIKKEI 225', 'Indices', 38683.93, 0.57, 1640],
  ].map(([symbol, category, price, change24h, marketCap], index) => ({
    id: `${symbol}-${category}`,
    symbol: String(symbol),
    icon: ['💱', '🛢️', '📊'][index % 3],
    marketCap: `$${Number(marketCap).toFixed(2)}B`,
    price: `$${Number(price).toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
    change24h: Number(change24h),
    rank: 16 + index,
    category: String(category),
  }));
  const syncedTokens = [
    ...Array.from({ length: 15 }, (_, index) => {
    const instrument = instruments[index % instruments.length];
    const category = instrument.market.includes('Crypto')
      ? 'Crypto'
      : instrument.market.includes('Index')
        ? 'Indices'
        : instrument.market.includes('Forex')
          ? 'Forex'
          : instrument.market.includes('Commodit')
            ? 'Commodities'
            : 'Stocks';
    const change = instrument.change + ((index % 5) - 2) * 0.8;
    return {
      id: `${instrument.symbol}-${category}-${index}`,
      symbol: `${instrument.symbol}${index >= instruments.length ? `-${index + 1}` : ''}`,
      icon: ['📈', '🟢', '🔵', '💠', '🪙'][index % 5],
      marketCap: `$${Math.max(1, instrument.marketCap + index * 0.37).toFixed(2)}B`,
      price: `$${(instrument.price * (1 + index * 0.012)).toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
      change24h: Number(change.toFixed(2)),
      rank: index + 1,
      category,
    };
    }),
    ...supplementalTokens,
  ];
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<'popular' | 'ai' | 'foryou' | 'following'>('popular');
  const [feedPostType, setFeedPostType] = useState('All');
  const [feedSort, setFeedSort] = useState<'popular' | 'date'>('popular');
  const [openFeedFilter, setOpenFeedFilter] = useState<'market' | 'type' | 'sort' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [predictionVotes, setPredictionVotes] = useState<Record<string, 'agree' | 'disagree'>>({});
  const [alertSubscriptions, setAlertSubscriptions] = useState<Record<string, boolean>>({});
  const [authorSubscriptions, setAuthorSubscriptions] = useState<Record<string, boolean>>({});
  const [donatedPosts, setDonatedPosts] = useState<Record<string, boolean>>({});
  const [commentVotes, setCommentVotes] = useState<Record<string, 'agree' | 'disagree' | undefined>>({});
  const [showOnlyFollowing, setShowOnlyFollowing] = useState(false);
  const [claimedBonuses, setClaimedBonuses] = useState<Record<string, boolean>>({});
  const claimBonus = (postId: string, action: string) => {
    const bonusKey = `${postId}:${action}`;
    if (claimedBonuses[bonusKey]) return;
    const bonus = 25 + ((postId.length * 13 + action.length * 7) % 76);
    setClaimedBonuses((current) => ({ ...current, [bonusKey]: true }));
    window.dispatchEvent(new CustomEvent('marketsyde-credit-bonus', { detail: { amount: bonus } }));
  };
  const getPostType = (post: CommunityPost) => {
    const searchablePost = `${post.title} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
    if (/\bpoll\b|\bvote\b|\bquestion\b/.test(searchablePost)) return 'Poll';
    if (/\bfundamental\b|\bearnings\b|\brevenue\b|\bvaluation\b|\bcompany\b/.test(searchablePost)) return 'Fundamental';
    if (/\btechnical\b|\bchart\b|\bbreakout\b|\bsupport\b|\bresistance\b/.test(searchablePost)) return 'Technical';
    return 'Blog';
  };
  const postTypeCover: Record<string, { label: string; className: string }> = {
    Blog: { label: 'Market brief', className: 'border-sky-100 bg-sky-50 text-sky-700' },
    Technical: { label: 'Technical setup', className: 'border-violet-100 bg-violet-50 text-violet-700' },
    Fundamental: { label: 'Fundamental view', className: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
    Poll: { label: 'Community poll', className: 'border-amber-100 bg-amber-50 text-amber-700' },
  };
  const getPostMarket = (post: CommunityPost) => {
    const mentionedSymbols = new Set((post.tokenMentions || []).map((token) => token.symbol.toLowerCase()));
    const syncedCategory = syncedTokens.find((token) => mentionedSymbols.has(token.symbol.toLowerCase()))?.category;
    if (syncedCategory) return syncedCategory;

    const searchablePost = `${post.title} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
    if (/\bcrypto\b|\bdefi\b|\bblockchain\b|\bweb3\b|\bcoin\b|\btoken\b|\bpolymarket\b|\bhyperliquid\b/.test(searchablePost)) return 'Crypto';
    if (/\bforex\b|\beur\/usd\b|\bgbp\/usd\b|\busd\/jpy\b|\bdxy\b|\becb\b/.test(searchablePost)) return 'Forex';
    if (/\bcommodity\b|\bgold\b|\bsilver\b|\boil\b|\bbrent\b|\bwti\b|\bnatgas\b/.test(searchablePost)) return 'Commodities';
    if (/\bindex\b|\bnasdaq\b|\bs&p\b|\bdow\b|\bdax\b|\bnikkei\b/.test(searchablePost)) return 'Indices';
    if (/\bstock\b|\bequity\b|\bearnings\b|\bshares\b|\bcompany\b/.test(searchablePost)) return 'Stocks';
    return mentionedSymbols.size > 0 ? 'Crypto' : 'Markets';
  };

  // Filter posts based on token selection, search, or feedTab
  const filteredPosts = posts.filter((post) => {
    if (showOnlyFollowing && !post.isFollowingAuthor) return false;
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

    if (assetFilter !== 'All') {
      if (getPostMarket(post) !== assetFilter) return false;
    }

    if (feedPostType !== 'All' && getPostType(post) !== feedPostType) return false;

    return true;
  });
  const sortedPosts = [...filteredPosts].sort((a, b) =>
    feedSort === 'popular' ? b.likes - a.likes : b.timestamp.localeCompare(a.timestamp),
  );

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
                setTokenFilterTab('gainers');
                setSelectedTokenSymbol(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                tokenFilterTab === 'gainers'
                  ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              Top gain
            </button>
            <button
              onClick={() => {
                setTokenFilterTab('losers');
                setSelectedTokenSymbol(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                tokenFilterTab === 'losers'
                  ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              Top loser
            </button>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 p-1 text-[10px]">
            <span className="px-1 text-slate-400">Period</span>
            {['1D', '1W', '1M', '1Y'].map((duration) => (
              <button key={duration} onClick={() => setTokenDuration(duration)} className={`rounded-md px-2 py-1 font-semibold ${tokenDuration === duration ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-violet-50'}`}>{duration}</button>
            ))}
          </div>
          {/* Table Header */}
          <div className="grid grid-cols-12 text-[10px] text-[#474556] font-semibold uppercase tracking-wider pb-2 border-b border-[#e2e8f0] px-1">
            <div className="col-span-2">#</div>
            <div className="col-span-6">Token / MC</div>
            <div className="col-span-4 text-right">Price / Chg</div>
          </div>

          {/* Token Rows */}
          <div className="divide-y divide-[#f1f5f9] max-h-[620px] overflow-y-auto pr-1">
            {syncedTokens
              .filter((token) => tokenFilterTab === 'trending' || (tokenFilterTab === 'gainers' ? token.change24h >= 0 : token.change24h < 0))
              .filter((token) => assetFilter === 'All' || token.category === assetFilter)
              .sort((a, b) => tokenFilterTab === 'losers' ? a.change24h - b.change24h : b.change24h - a.change24h)
              .map((token) => {
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
                      {isPositive ? `+${(token.change24h * ({ '1D': 1, '1W': 1.8, '1M': 3.2, '1Y': 6.5 }[tokenDuration] ?? 1)).toFixed(2)}%` : `${(token.change24h * ({ '1D': 1, '1W': 1.8, '1M': 3.2, '1Y': 6.5 }[tokenDuration] ?? 1)).toFixed(2)}%`}
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
            <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#474556]">
              <input type="checkbox" checked={showOnlyFollowing} onChange={(event) => setShowOnlyFollowing(event.target.checked)} className="h-3.5 w-3.5 accent-[#5338ec]" />
              Show only your follow
            </label>

            <div className="flex flex-wrap items-center gap-1">
              {[
                { key: 'market' as const, label: assetFilter === 'All' ? 'Market' : assetFilter },
                { key: 'type' as const, label: feedPostType === 'All' ? 'Post type' : feedPostType },
                { key: 'sort' as const, label: feedSort === 'popular' ? 'Sort: Popular' : 'Sort: By date' },
              ].map((filter) => (
                <div key={filter.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenFeedFilter((current) => current === filter.key ? null : filter.key)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      openFeedFilter === filter.key
                        ? 'border-[#5338ec] bg-[#ede9fe] text-[#5338ec]'
                        : 'border-[#e2e8f0] bg-white text-[#474556] hover:border-[#cbd5e1]'
                    }`}
                  >
                    {filter.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {openFeedFilter === filter.key && (
                    <div className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-lg">
                      {(filter.key === 'market' ? assetCategories : filter.key === 'type' ? ['All', 'Blog', 'Technical', 'Fundamental', 'Poll'] : ['popular', 'date']).map((option) => {
                        const label = filter.key === 'sort'
                          ? option === 'popular' ? 'Popular' : 'By date'
                          : option;
                        const selected = filter.key === 'market'
                          ? assetFilter === option
                          : filter.key === 'type'
                            ? feedPostType === option
                            : feedSort === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              if (filter.key === 'market') setAssetFilter(option);
                              if (filter.key === 'type') setFeedPostType(option);
                              if (filter.key === 'sort') setFeedSort(option as 'popular' | 'date');
                              setOpenFeedFilter(null);
                            }}
                            className={`block w-full rounded-lg px-2.5 py-2 text-left text-[11px] ${
                              selected ? 'bg-[#ede9fe] font-semibold text-[#5338ec]' : 'text-[#474556] hover:bg-[#f8fafc]'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
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
        <div className="community-feed-list space-y-4 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
          {sortedPosts.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center text-[#474556] shadow-xs">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#0b1c30]">No posts found</p>
              <p className="text-xs text-[#474556] mt-1">
                Try changing your search query or clearing the token filter.
              </p>
            </div>
          ) : (
            sortedPosts.map((post) => {
              const isBookmarked = bookmarkedPosts[post.id];
              const isCommentsOpen = expandedComments[post.id];
              const postType = getPostType(post);
              const typeCover = postTypeCover[postType];
              const coverMarket = assetFilter === 'All' ? getPostMarket(post) : assetFilter;
              const coverSort = feedSort === 'popular' ? 'Popular first' : 'Latest first';
              const agreePercent = 55 + (post.likes % 26);
              const disagreePercent = 100 - agreePercent;
              const predictionPrecision = post.author.winRate
                || `${Math.round(65 + ((post.author.influenceScore || 0) % 25))}%`;
              const predictionVote = predictionVotes[post.id];
              const alertsEnabled = alertSubscriptions[post.author.handle] || false;
              const isSubscribed = authorSubscriptions[post.author.handle] || false;
              const hasDonated = donatedPosts[post.id] || false;
              const bonusAction = ['Like', 'Comment', 'Agree', 'Share'][post.id.length % 4];
              const bonusAmount = 25 + ((post.id.length * 13 + bonusAction.length * 7) % 76);

              return (
                <article
                  key={post.id}
                  className="community-feed-post bg-white border border-[#e2e8f0] rounded-xl p-3.5 text-[#0b1c30] shadow-none hover:border-[#cbd5e1] transition-colors"
                >
                  <div className={`mb-2 flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${typeCover.className}`}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{coverMarket} · {typeCover.label}</span>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold">{postType}</span>
                  </div>
                  <div className="mb-2 border-b border-[#f1f5f9] pb-2">
                    <p className="line-clamp-1 text-xs font-bold text-[#0b1c30]">{post.title}</p>
                    <span className="text-[10px] text-[#94a3b8]">{coverSort} · generated cover</span>
                  </div>
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => onSelectInfluencerByHandle(post.author.handle)}
                        className="cursor-pointer relative"
                      >
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 hover:border-[#5338ec] transition-colors"
                        />
                        {post.author.verified && (
                          <span                           className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[7px] text-white font-bold">
                            ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => onSelectInfluencerByHandle(post.author.handle)}
                            className="font-bold text-xs text-[#0b1c30] hover:text-[#5338ec] cursor-pointer transition-colors"
                          >
                            {post.author.name}
                          </span>
                          <span className="text-[11px] text-[#474556] font-mono">
                            {post.author.handle}
                          </span>
                          <span className="text-slate-300 text-xs">•</span>
                          <span className="text-[11px] text-[#474556] font-mono">
                            {post.timestamp}
                          </span>
                        </div>

                        {(post.author.influenceScore !== undefined || post.author.winRate) && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {post.author.influenceScore !== undefined && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f1f5f9] border border-slate-200 text-[9px] text-[#474556] font-mono">
                                <span className="text-amber-500">★</span>
                                <span>{post.author.influenceScore.toFixed(2)} Influence Score</span>
                              </span>
                            )}
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              Predict precision {predictionPrecision}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onToggleFollowAuthor(post.author.handle)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
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
                      <button
                        type="button"
                        onClick={() => setAlertSubscriptions((current) => ({
                          ...current,
                          [post.author.handle]: !alertsEnabled,
                        }))}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
                          alertsEnabled
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1] hover:text-[#5338ec]'
                        }`}
                      >
                        <Bell className="h-3 w-3" />
                        <span>{alertsEnabled ? 'Alerts on' : 'Follow alerts'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthorSubscriptions((current) => ({
                          ...current,
                          [post.author.handle]: !isSubscribed,
                        }))}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
                          isSubscribed
                            ? 'border-violet-200 bg-violet-50 text-violet-700'
                            : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-violet-200 hover:text-violet-700'
                        }`}
                      >
                        <Bell className="h-3 w-3" />
                        <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonatedPosts((current) => ({
                          ...current,
                          [post.id]: !hasDonated,
                        }))}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
                          hasDonated
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-amber-200 hover:text-amber-700'
                        }`}
                      >
                        <Gift className="h-3 w-3" />
                        <span>{hasDonated ? 'Donated' : 'Donate'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-2 mb-2.5">
                    <p className="text-xs text-[#0b1c30] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Embedded Image Graphic */}
                    {post.image && (
                      <div
                        className="relative rounded-lg overflow-hidden border border-[#e2e8f0] max-h-36 bg-slate-50 group cursor-pointer"
                        onClick={() => {
                          const symbol = post.tokenMentions?.[0]?.symbol;
                          if (symbol) onOpenAdvancedChart(symbol);
                        }}
                        role={post.tokenMentions?.[0] ? "button" : undefined}
                        tabIndex={post.tokenMentions?.[0] ? 0 : undefined}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            const symbol = post.tokenMentions?.[0]?.symbol;
                            if (symbol) onOpenAdvancedChart(symbol);
                          }
                        }}
                      >
                        <img
                          src={post.image}
                          alt="Post visual"
                          className="w-full h-auto object-cover max-h-36 hover:scale-[1.01] transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Token mentions pills */}
                    {post.tokenMentions && post.tokenMentions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {post.tokenMentions.map((tok, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-2 py-1 text-[11px] font-medium"
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

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {post.tags.slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="text-[10px] font-semibold text-[#159b78] hover:text-[#5338ec] transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prediction vote row */}
                  <div className="flex items-center gap-2.5 flex-wrap py-1 text-[11px] text-[#64748b]">
                    <button
                      type="button"
                      onClick={() => { setPredictionVotes((current) => ({ ...current, [post.id]: 'agree' })); if (bonusAction === 'Agree') claimBonus(post.id, 'Agree'); }}
                      aria-pressed={predictionVote === 'agree'}
                      className={`rounded-md border px-2 py-1 font-semibold transition-colors ${
                        predictionVote === 'agree'
                          ? 'border-emerald-400 bg-emerald-100 text-emerald-700 shadow-sm'
                          : 'border-emerald-100 bg-emerald-50/70 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      Agree <span className="font-mono">{agreePercent}%</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPredictionVotes((current) => ({ ...current, [post.id]: 'disagree' })); if (bonusAction === 'Agree') claimBonus(post.id, 'Agree'); }}
                      aria-pressed={predictionVote === 'disagree'}
                      className={`rounded-md border px-2 py-1 font-semibold transition-colors ${
                        predictionVote === 'disagree'
                          ? 'border-rose-400 bg-rose-100 text-rose-700 shadow-sm'
                          : 'border-rose-100 bg-rose-50/70 text-rose-600 hover:border-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      Disagree <span className="font-mono">{disagreePercent}%</span>
                    </button>
                    <span className="text-[10px] text-slate-400">{post.likes + post.commentsCount} votes</span>
                  </div>

                  {/* Post Engagement Footer */}
                  <div className="group/bonus relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11px] text-[#64748b] pt-1">
                    <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden rounded-lg bg-[#0b1c30] px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg group-hover/bonus:block">🎁 Marketsyde bonus: click {bonusAction} to get +{bonusAmount} free credits</span>
                    <div className="flex items-center gap-4 sm:gap-5">
                      {/* Like */}
                      <button
                        type="button"
                        onClick={() => { onToggleLike(post.id); if (bonusAction === 'Like') claimBonus(post.id, 'Like'); }}
                        className={`flex items-center gap-1 transition-colors ${
                          post.hasLiked ? 'text-rose-500' : 'hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${post.hasLiked ? 'fill-current' : ''}`} />
                        <span className="font-mono text-[11px]">{post.likes}</span>
                      </button>

                      {/* Views */}
                      <span className="flex items-center gap-1 hover:text-[#0b1c30]">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span className="font-mono text-[11px]">{post.viewsCount || '1.2K'}</span>
                      </span>

                      {/* Comments Toggle */}
                      <button
                        onClick={() => {
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          })); if (bonusAction === 'Comment') claimBonus(post.id, 'Comment');
                        }}
                        className="flex items-center gap-1 hover:text-[#5338ec] transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span className="font-mono text-[11px]">{post.commentsCount || 0}</span>
                      </button>

                      {/* Reposts */}
                      <button
                        onClick={() => onToggleLike(post.id)}
                        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                      >
                        <Repeat2 className="w-3 h-3" />
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
                        <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
                        <span className="font-mono text-[11px]">
                          {(post.bookmarksCount || 0) + (isBookmarked ? 1 : 0)}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          if (bonusAction === 'Share') claimBonus(post.id, 'Share');
                        }}
                        className="inline-flex items-center hover:text-[#0b1c30] transition-colors"
                        title="Share link"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
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
                                  <button
                                    type="button"
                                    onClick={() => onSelectInfluencerByHandle(`@${comment.author.toLowerCase().replace(/\s+/g, '')}`)}
                                    className="font-semibold text-[#5338ec] hover:underline"
                                  >
                                    {comment.author}
                                  </button>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {comment.time}
                                  </span>
                                </div>
                                <p className="text-[#474556] mt-0.5">{comment.text}</p>
                                <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                                  <button type="button" onClick={() => setCommentVotes((prev) => ({ ...prev, [comment.id]: prev[comment.id] === 'agree' ? undefined : 'agree' }))} className={commentVotes[comment.id] === 'agree' ? 'font-semibold text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}>Agree · {commentVotes[comment.id] === 'agree' ? 1 : 0}</button>
                                  <button type="button" onClick={() => setCommentVotes((prev) => ({ ...prev, [comment.id]: prev[comment.id] === 'disagree' ? undefined : 'disagree' }))} className={commentVotes[comment.id] === 'disagree' ? 'font-semibold text-rose-500' : 'text-slate-400 hover:text-rose-500'}>Disagree · {commentVotes[comment.id] === 'disagree' ? 1 : 0}</button>
                                </div>
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
