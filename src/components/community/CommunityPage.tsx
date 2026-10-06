import { HashtagLink } from '../hashtag/HashtagText';
import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Sparkles,
  Flame,
  Radio,
  BookOpen,
  User,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Award,
  CheckCircle2,
  X,
  Search,
  Home,
  Hash,
  Film,
  FileText,
} from 'lucide-react';
import {
  CommunitySubTab,
  CommunityPost,
  UserProfile,
  CommunityInfluencer,
} from '../../types';
import {
  INITIAL_FEED_POSTS,
  MORE_FEED_POSTS,
  COMMUNITY_TOPICS,
  COMMUNITY_ARTICLES,
  CRYPTO_ADVENTURE_PROFILE,
  CRYPTO_ADVENTURE_POSTS,
  TOP_INFLUENCERS,
} from '../../data/communityData';
import { CommunityFeedsView } from './CommunityFeedsView';
import { CommunityTopicsView } from './CommunityTopicsView';
import { CommunityArticlesView } from './CommunityArticlesView';
import { CommunityArticlesTabView } from './CommunityArticlesTabView';
import { CommunityMyPageView } from './CommunityMyPageView';
import { CommunityMyPageTabView } from './CommunityMyPageTabView';
import { CommunityProfileView } from './CommunityProfileView';
import { CommunityRightSidebar } from './CommunityRightSidebar';
import { CommunityLeftSidebar } from './CommunityLeftSidebar';
import { CommunityTopicsSidebar } from './CommunityTopicsSidebar';
import { CommunityPostComposer } from './CommunityPostComposer';
import { CommunityStoriesRow } from './CommunityStoriesRow';
import { CommunityLeaderboardWidget } from './CommunityLeaderboardWidget';
import { CommunityBrokerAdWidget } from './CommunityBrokerAdWidget';
import { CommunityFeaturedCoursesWidget } from './CommunityFeaturedCoursesWidget';
import { CommunitySignalsWidget } from './CommunitySignalsWidget';
import { CommunityNewsWidget } from './CommunityNewsWidget';
import { INITIAL_BROKERS } from '../../data/mockData';
import { CommunityTrendingPostsView } from './CommunityTrendingPostsView';
import { CreateCommunityPostModal } from './CreateCommunityPostModal';

interface CommunityPageProps {
  user: UserProfile;
  onUpdateUserProfile: (updatedUser: Partial<UserProfile>) => void;
  onRewardPoints: (points: number, reason: string) => void;
  onRewardPointsAndCredits?: (points: number, credits: number, reason: string) => void;
  onNavigateToTab?: (tab: string, subTab?: string, symbol?: string) => void;
  initialInstrumentSymbol?: string | null;
  onOpenConnectModal?: () => void;
  onOpenAdvancedChart?: (symbol: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  user,
  onUpdateUserProfile,
  onRewardPoints,
  onRewardPointsAndCredits,
  onNavigateToTab,
  initialInstrumentSymbol,
  onOpenConnectModal,
  onOpenAdvancedChart,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CommunitySubTab>('feeds');
  const [selectedInfluencer, setSelectedInfluencer] = useState<CommunityInfluencer | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([
    ...INITIAL_FEED_POSTS,
    ...MORE_FEED_POSTS,
  ]);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [communitySearch, setCommunitySearch] = useState('');
  const [showCommunityDirectory, setShowCommunityDirectory] = useState(false);
  const [lastGlobalBonusAt, setLastGlobalBonusAt] = useState(0);
  const [topicReactions, setTopicReactions] = useState<Record<string, { likes: number; agrees: number; disagrees: number; comments: number }>>({});
  const [feedTypeFilter, setFeedTypeFilter] = useState<'for-you' | 'latest' | 'following' | 'trending'>('for-you');
  const feedAdBroker = INITIAL_BROKERS.find((b) => b.isTopPick) || INITIAL_BROKERS[0];

  const reactToTopic = (topicId: string, reaction: 'likes' | 'agrees' | 'disagrees' | 'comments') => {
    setTopicReactions((current) => ({
      ...current,
      [topicId]: {
        likes: current[topicId]?.likes ?? 0,
        agrees: current[topicId]?.agrees ?? 0,
        disagrees: current[topicId]?.disagrees ?? 0,
        comments: current[topicId]?.comments ?? 0,
        [reaction]: (current[topicId]?.[reaction] ?? 0) + 1,
      },
    }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCommunityInteraction = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest('button, a, [role="button"]')) return;
    const now = Date.now();
    if (now - lastGlobalBonusAt < 2500 || Math.random() > 0.32) return;
    const actions = ['Like', 'Comment', 'Agree', 'Share', 'Post', 'Follow', 'Join', 'Watch'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const credits = 25 + Math.floor(Math.random() * 76);
    setLastGlobalBonusAt(now);
    showToast(`🎁 Marketsyde bonus: ${action} earned ${credits} free credits!`);
  };

  // Toggle Like / Upvote
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          const delta = hasLiked ? 1 : -1;
          if (hasLiked) {
            showToast('Post upvoted. Reactions do not earn rewards.');
          }
          return { ...p, likes: p.likes + delta, hasLiked };
        }
        return p;
      })
    );
  };

  // Toggle Follow author from feed
  const handleToggleFollowAuthor = (authorHandle: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.author.handle === authorHandle) {
          const nextState = !p.isFollowingAuthor;
          showToast(
            nextState
              ? `⭐ You are now following ${p.author.name}`
              : `Unfollowed ${p.author.name}`
          );
          return { ...p, isFollowingAuthor: nextState };
        }
        return p;
      })
    );
  };

  // Add Comment
  const handleAddComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: user.username || 'You',
            avatar: user.avatar.startsWith('http')
              ? user.avatar
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&auto=format&fit=crop&q=80',
            tier: 'Bronze',
            time: 'Just now',
            text,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );
    showToast('Comment posted locally. Credit rewards require moderation, which is not connected in this demo.');
  };

  // Create new post
  const handleCreatePost = (newPostData: Partial<CommunityPost>) => {
    const newPost: CommunityPost = {
      id: `user-post-${Date.now()}`,
      author: {
        name: user.username || 'You',
        handle: `@${user.username || 'trader'}`,
        avatar: user.avatar.startsWith('http')
          ? user.avatar
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80',
        verified: true,
        influenceScore: 100.0,
      },
      timestamp: 'Just now',
      title: newPostData.title || 'Market Analysis',
      content: newPostData.content || '',
      image: newPostData.image,
      tokenMentions: newPostData.tokenMentions || [],
      tags: newPostData.tags || ['CommunityAlpha'],
      likes: 1,
      hasLiked: true,
      commentsCount: 0,
      comments: [],
      reactions: [
        { emoji: '🚀', count: 1, active: true },
        { emoji: '🔥', count: 1, active: false },
      ],
      viewsCount: '1',
      repostsCount: 0,
      bookmarksCount: 0,
      isCurrentUser: true,
    };

    setPosts([newPost, ...posts]);
    setUserPosts([newPost, ...userPosts]);
    showToast('Post published locally to Feed and My Page. Credit rewards require moderation, which is not connected in this demo.');
  };

  // Navigate to Influencer Profile
  const handleSelectInfluencer = (influencer: CommunityInfluencer) => {
    setSelectedInfluencer(influencer);
    setActiveSubTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInfluencerByHandle = (handle: string) => {
    const found = TOP_INFLUENCERS.find((inf) => inf.handle === handle);
    if (found) {
      handleSelectInfluencer(found);
    } else {
      // Default to Crypto Adventure profile
      handleSelectInfluencer(CRYPTO_ADVENTURE_PROFILE);
    }
  };

  return (
    <div className="community-interaction-zone group/community space-y-6 font-sans" onClickCapture={handleCommunityInteraction}>
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#c6f831] shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ─── SUB-MENU NAVIGATION BAR (fully pill-shaped, matching reference design) ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-full p-2 sm:p-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          {/* Left Sub-Menu Tabs — one connected rounded-full pill */}
          <div className="flex items-center gap-1 bg-[#f8fafc] rounded-full p-1 overflow-x-auto no-scrollbar">
            {([
              { id: 'feeds', label: 'Feed', icon: Home },
              { id: 'topics', label: 'Topics', icon: Hash },
              { id: 'media', label: 'Media', icon: Film },
              { id: 'articles', label: 'Article', icon: FileText },
              { id: 'my-page', label: 'My Page', icon: User },
            ] as const).map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSubTab(item.id);
                    setSelectedInfluencer(null);
                  }}
                  className={`relative flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#5338ec] to-[#c026d3] text-white shadow-md'
                      : 'text-[#474556] hover:text-[#0b1c30]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.id === 'media' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Search + Notifications */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden items-center gap-2 rounded-full bg-[#f8fafc] px-4 py-2 sm:flex">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                value={communitySearch}
                onChange={(event) => setCommunitySearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && communitySearch.trim()) {
                    showToast(`Searching community for “${communitySearch.trim()}”`);
                  }
                }}
                placeholder="Search names, communities, symbols, hashtags..."
                className="w-44 bg-transparent text-xs text-[#0b1c30] outline-none placeholder:text-slate-400 lg:w-64"
                aria-label="Search community"
              />
            </div>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setUnreadNotifications(0);
              }}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEF0FE] hover:bg-[#E0E3FC] text-xs font-bold text-[#0b1c30] transition-colors"
            >
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#5338ec] text-white text-[11px] flex items-center justify-center font-mono font-bold shrink-0">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── NOTIFICATIONS DRAWER / MODAL ─── */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-sm text-[#0b1c30] shadow-2xl p-5 space-y-4 mt-16 animate-in slide-in-from-right-5 duration-200">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#5338ec]" />
                <h4 className="text-sm font-bold text-[#0b1c30]">Community Alerts</h4>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-[#474556] hover:text-[#0b1c30]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="font-semibold text-[#0b1c30]">
                  Michael Saylor commented on your Bitcoin thesis
                </p>
                <span className="text-[10px] text-[#474556] font-mono">15m ago</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="font-semibold text-[#0b1c30]">
                  Upcoming Live: "Weekly Crypto Forecast" in 2 hours
                </p>
                <span className="text-[10px] text-[#474556] font-mono">1h ago</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="font-semibold text-[#0b1c30]">
                  Cashback reward of $14.80 credited from IC Markets trades
                </p>
                <span className="text-[10px] text-[#474556] font-mono">3h ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main>
        {/* SUB-VIEW 1: FEEDS */}
        {activeSubTab === 'feeds' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="hidden lg:block xl:col-span-3 space-y-5">
              <CommunityLeftSidebar
                onOpenTopics={() => setActiveSubTab('topics')}
                onShowToast={showToast}
              />
              <CommunityTopicsSidebar
                onOpenTopics={() => setActiveSubTab('topics')}
                onShowToast={showToast}
              />
            </div>
            <div className="xl:col-span-6 space-y-6">
              <CommunityPostComposer
                username={user.firstName || user.username}
                avatar={user.avatar}
                onOpenCreatePost={() => setIsCreateModalOpen(true)}
              />
              <CommunityStoriesRow
                onOpenCreatePost={() => setIsCreateModalOpen(true)}
                onShowToast={showToast}
              />

              <div className="flex items-center gap-5 border-b border-[#f1f5f9]">
                {(['for-you', 'latest', 'following', 'trending'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFeedTypeFilter(f);
                      if (f !== 'for-you') showToast(`Showing ${f === 'latest' ? 'latest' : f} posts`);
                    }}
                    className={`pb-2.5 text-sm font-bold capitalize transition-colors relative ${
                      feedTypeFilter === f
                        ? "text-[#5945F1] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#5945F1]"
                        : 'text-[#94a3b8] hover:text-[#0b1c30]'
                    }`}
                  >
                    {f === 'for-you' ? 'For you' : f}
                  </button>
                ))}
              </div>

              <CommunityFeedsView
                posts={posts}
                onToggleLike={handleToggleLike}
                onToggleFollowAuthor={handleToggleFollowAuthor}
                onAddComment={handleAddComment}
                onOpenCreatePost={() => setIsCreateModalOpen(true)}
                onSelectInfluencerByHandle={handleSelectInfluencerByHandle}
                onOpenAdvancedChart={(symbol) => onOpenAdvancedChart?.(symbol)}
                user={user}
              />
            </div>
            <div className="xl:col-span-3 space-y-5">
              <CommunitySignalsWidget
                onSelectSignal={(sig) => onNavigateToTab?.('signal-detail', undefined, sig.ticker)}
                onNavigateToTab={() => onNavigateToTab?.('signals')}
                onUpgradePrompt={() => onNavigateToTab?.('member-plan')}
              />
              <CommunityNewsWidget onSelectArticle={() => onNavigateToTab?.('news')} />
              <CommunityLeaderboardWidget onNavigateToTab={onNavigateToTab} />
              {feedAdBroker && <CommunityBrokerAdWidget broker={feedAdBroker} onOpenConnectModal={onOpenConnectModal} />}
              <CommunityFeaturedCoursesWidget onNavigateToTab={onNavigateToTab} />
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: TOPICS */}
        {activeSubTab === 'media' && (
          <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr]">
              <aside className="border-b border-[#e2e8f0] bg-slate-50/60 p-4 lg:border-b-0 lg:border-r">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Explore topics</p>
                <div className="space-y-1 text-sm"><button type="button" onClick={() => setActiveSubTab('topics')} className="w-full rounded-lg px-3 py-2 text-left font-semibold text-slate-600 hover:bg-white">Home</button><button type="button" className="w-full rounded-lg px-3 py-2 text-left font-semibold text-slate-600 hover:bg-white">Popular</button><button type="button" className="w-full rounded-lg px-3 py-2 text-left font-semibold text-slate-600 hover:bg-white">Market News</button><button type="button" onClick={() => showToast('Start a topic flow opened')} className="w-full rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-white">＋ Start a topic</button></div>
                <div className="mt-5 border-t border-[#e2e8f0] pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Trending hashtags</p><div className="flex flex-wrap gap-1.5">{['#BTC','#Macro','#Technical','#Fundamental','#Forex','#Stocks','#Crypto','#Earnings'].map((tag) => <HashtagLink key={tag} tag={tag} className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">{tag}</HashtagLink>)}</div></div>
              </aside>
              <div className="space-y-6 p-4"><section><div className="mb-3 flex items-center gap-2"><span className="text-lg">▶</span><h2 className="text-lg font-bold text-[#0b1c30]">Shorts</h2></div><div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">{[
                ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80','FOMC #Trading #Crypto #Bitcoin · @CryptoBanter','4.2k views'],
                ['https://images.unsplash.com/photo-1559526324-593bc073d938?w=500&auto=format&fit=crop&q=80','Franklin Templeton Validators #Crypto #Web3 · @ChainResearch','109 views'],
                ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=80','Crypto Bill Rules #Regulation #Markets · @MacroVoice','5.1k views'],
                ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80','TOP 5 Altcoins #Altcoins #ETH · @CoinDaily','219k views'],
                ['https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80','2026 Crypto Predictions #BTC #Crypto · @MarketWizard','1.7m views'],
                ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80','Bitcoin Levels #TechnicalAnalysis #BTC · @ChartMaster','18k views'],
                ['https://images.unsplash.com/photo-1559526324-593bc073d938?w=500&auto=format&fit=crop&q=80','Altcoin Rotation #Trading #DeFi · @AlphaSignals','62k views'],
                ['https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=500&auto=format&fit=crop&q=80','DeFi Builders Weekly #DeFi #Web3 · @DeFiBuilders','7.4k views'],
              ].map(([image,title,views]) => <article key={title} className="group w-[170px] shrink-0 snap-start sm:w-[190px]"><div className="relative aspect-[9/14] overflow-hidden rounded-xl bg-slate-100"><img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-110" /><span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold">New</span><span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-violet-600/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></div><h3 className="mt-2 line-clamp-2 text-xs font-semibold text-[#0b1c30]">{title}</h3><p className="mt-1 text-[10px] text-slate-500">{views}</p></article>)}</div></section><section className="grid grid-cols-1 gap-4 md:grid-cols-[38%_1fr]"><div className="group relative overflow-hidden rounded-xl"><img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=80" alt="Live market stream" className="aspect-video w-full object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-110" /><span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" /></div><div><h3 className="text-base font-semibold text-[#0b1c30]">Will Stocks Crash and Take Bitcoin Down With Them?</h3><p className="mt-1 text-[11px] text-slate-500">4.3k views · Streamed 3 hours ago</p><p className="mt-4 text-xs text-slate-500">Market commentary, live analysis, and key levels from the community stream.</p><span className="mt-3 inline-block rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">New · Subtitles · Hover preview</span></div></section><section className="space-y-3"><h2 className="text-lg font-bold text-[#0b1c30]">More full-size videos</h2>{[
                ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80','Bitcoin Market Structure #BTC #TechnicalAnalysis · @ChartMaster','12k views · 28:40'],
                ['https://images.unsplash.com/photo-1559526324-593bc073d938?w=1000&auto=format&fit=crop&q=80','Crypto Portfolio Review #Crypto #Risk · @AlphaSignals','8.7k views · 34:12'],
                ['https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1000&auto=format&fit=crop&q=80','DeFi, Rates, and Liquidity #DeFi #Markets · @DeFiBuilders','15k views · 41:05'],
              ].map(([image,title,meta]) => <article key={title} className="group grid grid-cols-1 gap-4 md:grid-cols-[38%_1fr]"><div className="relative overflow-hidden rounded-xl"><img src={image} alt={title} className="aspect-video w-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110" /><span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-white">VIDEO</span></div><div><h3 className="text-base font-semibold text-[#0b1c30]">{title}</h3><p className="mt-1 text-[11px] text-slate-500">{meta}</p><p className="mt-3 text-xs text-slate-500">Market commentary, chart walkthroughs, and practical takeaways from the community.</p><span className="mt-3 inline-block rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">New · Subtitles · Hover preview</span></div></article>)}</section></div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: TOPICS */}
        {activeSubTab === 'topics' && (
          <CommunityTrendingPostsView onShowToast={showToast} />
        )}

        {/* SUB-VIEW 3: ARTICLES */}
        {activeSubTab === 'articles' && (
          <CommunityArticlesTabView onShowToast={showToast} />
        )}

        {/* SUB-VIEW 4: MY PAGE */}
        {activeSubTab === 'my-page' && (
          <CommunityMyPageTabView
            user={user}
            onShowToast={showToast}
            onOpenConnectModal={onOpenConnectModal}
          />
        )}

        {/* SUB-VIEW 5: PROFILE PAGE (Viewing another creator, e.g. Crypto Adventure) */}
        {activeSubTab === 'profile' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9">
              <CommunityProfileView
                influencer={selectedInfluencer || CRYPTO_ADVENTURE_PROFILE}
                posts={
                  selectedInfluencer?.id === 'inf-cryptoadventure' || !selectedInfluencer
                    ? CRYPTO_ADVENTURE_POSTS
                    : CRYPTO_ADVENTURE_POSTS.slice(0, 3)
                }
                onBackToFeeds={() => {
                  setActiveSubTab('feeds');
                  setSelectedInfluencer(null);
                }}
                onToggleFollow={(id) => {
                  showToast('Creator followed. Following does not earn rewards.');
                }}
                onShowToast={showToast}
              />
            </div>
            <div className="xl:col-span-3">
              <CommunityRightSidebar
                mode="profile"
                onSelectInfluencer={handleSelectInfluencer}
                onOpenHotTopic={() => setActiveSubTab('topics')}
                onShowToast={showToast}
                onNavigateToTab={onNavigateToTab}
              />
            </div>
          </div>
        )}
      </main>

      {/* ─── CREATE POST MODAL ─── */}
      <CreateCommunityPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        user={user}
      />
    </div>
  );
};
