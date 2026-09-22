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
import { CommunityMyPageView } from './CommunityMyPageView';
import { CommunityProfileView } from './CommunityProfileView';
import { CommunityRightSidebar } from './CommunityRightSidebar';
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

      {/* ─── SUB-MENU NAVIGATION BAR ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-2 sm:p-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          {/* Left Sub-Menu Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Feeds Tab */}
            <button
              onClick={() => {
                setActiveSubTab('feeds');
                setSelectedInfluencer(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeSubTab === 'feeds'
                  ? 'bg-[#5338ec] text-white shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30] hover:bg-[#f1f5f9]'
              }`}
            >
              <span>Feeds</span>
            </button>

            {/* Topics Tab */}
            <button
              onClick={() => {
                setActiveSubTab('topics');
                setSelectedInfluencer(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeSubTab === 'topics'
                  ? 'bg-[#5338ec] text-white shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30] hover:bg-[#f1f5f9]'
              }`}
            >
              <span>Topics</span>
            </button>

            {/* Media Tab */}
            <button
              onClick={() => {
                setActiveSubTab('media');
                setSelectedInfluencer(null);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#474556] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-all flex items-center gap-1.5"
            >
              <span>Media</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {/* Articles Tab */}
            <button
              onClick={() => {
                setActiveSubTab('articles');
                setSelectedInfluencer(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeSubTab === 'articles'
                  ? 'bg-[#5338ec] text-white shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30] hover:bg-[#f1f5f9]'
              }`}
            >
              <span>Articles</span>
            </button>

            {/* My Page Tab */}
            <button
              onClick={() => {
                setActiveSubTab('my-page');
                setSelectedInfluencer(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeSubTab === 'my-page'
                  ? 'bg-[#5338ec] text-white shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30] hover:bg-[#f1f5f9]'
              }`}
            >
              <span>My Page</span>
            </button>

          </div>

          {/* Right Notifications Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:flex">
              <Search className="h-3.5 w-3.5 text-slate-400" />
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
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-slate-200 text-xs font-semibold text-[#0b1c30] transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-[#5338ec]" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#5338ec] text-white text-[10px] flex items-center justify-center font-mono font-bold">
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
            <div className="xl:col-span-9">
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
            <div className="xl:col-span-3">
              <CommunityRightSidebar
                mode="default"
                onSelectInfluencer={handleSelectInfluencer}
                onOpenHotTopic={() => setActiveSubTab('topics')}
                onShowToast={showToast}
              />
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
                <div className="mt-5 border-t border-[#e2e8f0] pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Trending hashtags</p><div className="flex flex-wrap gap-1.5">{['#BTC','#Macro','#Technical','#Fundamental','#Forex','#Stocks','#Crypto','#Earnings'].map((tag) => <span key={tag} className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">{tag}</span>)}</div></div>
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
          <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr]">
              <aside className="border-b border-[#e2e8f0] bg-slate-50/60 p-4 lg:border-b-0 lg:border-r">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Explore topics</p>
                <div className="space-y-1 text-sm">
                  <button type="button" className="w-full rounded-lg bg-violet-100 px-3 py-2 text-left font-semibold text-[#5338ec]">Home</button>
                  <button type="button" className="w-full rounded-lg px-3 py-2 text-left font-semibold text-slate-600 hover:bg-white">Popular</button>
                  <button type="button" className="w-full rounded-lg px-3 py-2 text-left font-semibold text-slate-600 hover:bg-white">Market News</button>
                  <button type="button" onClick={() => showToast('Start a topic flow opened')} className="w-full rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-white">＋ Start a topic</button>
                  <button type="button" onClick={() => setShowCommunityDirectory((open) => !open)} className="w-full rounded-lg px-3 py-2 text-left font-semibold text-[#5338ec] hover:bg-white">Community</button>
                </div>
                {showCommunityDirectory && <div className="mt-2 space-y-1 rounded-lg bg-white p-2"><p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#5338ec]">Community topics</p>{[['Stocks','Equity Lens'],['Stocks','Technical Traders'],['Crypto','Crypto Markets'],['Crypto','DeFi Builders'],['Forex','Macro & Geopolitics'],['Forex','Currency Traders'],['Commodities','Raw Materials'],['Indices','Global Index Monitor']].map(([market, name]) => <div key={`${market}-${name}`} className="flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-violet-50"><button type="button" onClick={() => showToast(`Opening ${name}`)} className="min-w-0 flex-1 text-left"><span className="block truncate text-[10px] font-semibold text-[#0b1c30]">{name}</span><span className="block text-[9px] text-slate-400">{market}</span></button><button type="button" onClick={() => { const credits = Math.floor(Math.random() * 101) + 50; showToast(`Joined ${name}. You received ${credits} free credits!`); }} className="shrink-0 rounded-full border border-[#5338ec] px-1.5 py-0.5 text-[8px] font-semibold text-[#5338ec]">Join</button></div>)}</div>}
                <div className="mt-5 border-t border-[#e2e8f0] pt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Trending hashtags</p>
                  <div className="flex flex-wrap gap-1.5">{['#BTC', '#Macro', '#Technical', '#Fundamental', '#Forex', '#Stocks', '#Crypto', '#Earnings'].map((tag) => <span key={tag} className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">{tag}</span>)}</div>
                </div>
                <div className="mt-5 border-t border-[#e2e8f0] pt-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Recommended communities</p>
                  <div className="space-y-3">{[
                    ['CM', 'Crypto Markets', 'Digital assets, liquidity, and protocols', '58K members'],
                    ['MG', 'Macro & Geopolitics', 'Rates, policy, and global risk', '49K members'],
                    ['TT', 'Technical Traders', 'Charts, levels, and setups', '36K members'],
                  ].map(([initials, name, description, members]) => <button type="button" key={name} onClick={() => showToast(`Opening ${name}`)} className="flex w-full items-start gap-2 text-left hover:opacity-80"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">{initials}</span><span className="min-w-0"><span className="block truncate text-[11px] font-bold text-[#0b1c30]">{name}</span><span className="block text-[10px] leading-snug text-slate-500">{description}</span><span className="block text-[10px] text-slate-400">{members}</span></span></button>)}</div>
                  <button type="button" onClick={() => showToast('Showing all recommended communities')} className="mt-3 text-[10px] font-semibold text-[#5338ec]">See more communities</button>
                </div>
              </aside>
              <div className="p-4">
                {showCommunityDirectory && <section className="mb-4 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xs"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-[#0b1c30]">Community Directory</h2><button type="button" onClick={() => setShowCommunityDirectory(false)} className="text-xs font-semibold text-[#5338ec]">Close</button></div><div className="space-y-1">{[
                  ['Stocks', 'Equity Lens', 'Earnings, equities, and long-term investing', '42K members'],
                  ['Stocks', 'Technical Traders', 'Charts, levels, and setups', '36K members'],
                  ['Crypto', 'Crypto Markets', 'Digital assets, liquidity, and protocols', '58K members'],
                  ['Crypto', 'DeFi Builders', 'Protocols, tokenomics, and on-chain research', '31K members'],
                  ['Forex', 'Macro & Geopolitics', 'Rates, policy, and global risk', '49K members'],
                  ['Forex', 'Currency Traders', 'FX strategy, pairs, and central banks', '25K members'],
                  ['Commodities', 'Raw Materials', 'Gold, oil, copper, and supply chains', '21K members'],
                  ['Indices', 'Global Index Monitor', 'Index breadth, sectors, and allocation', '18K members'],
                ].map(([market, name, description, members]) => <button type="button" key={`${market}-${name}`} onClick={() => showToast(`Opening ${name}`)} className="flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left last:border-0 hover:bg-slate-50"><span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#5338ec]">{market}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#0b1c30]">{name}</span><span className="block text-xs text-slate-500">{description}</span></span><span className="shrink-0 text-[10px] text-slate-400">{members}</span></button>)}</div></section>}
                <section className="mb-4 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xs">
                  <div className="grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-[190px_1fr]">
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                      <img src={COMMUNITY_TOPICS[0]?.image} alt={COMMUNITY_TOPICS[0]?.title} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase text-slate-950">🔥 Hot discussion</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#5338ec]">Featured topic · Trending now</p>
                      <h2 className="mt-2 text-lg font-bold leading-snug text-[#0b1c30]">{COMMUNITY_TOPICS[0]?.title}</h2>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {COMMUNITY_TOPICS[0]?.tokens.map((token) => <span key={token.symbol} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-[#0b1c30]">{token.symbol} <span className="text-emerald-600">+{token.change}%</span></span>)}
                        <span className="text-[11px] text-slate-500">{COMMUNITY_TOPICS[0]?.answersCount} traders answered</span>
                      </div>
                    </div>
                  </div>
                </section>
                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[
                    ['Top post', 'BTC liquidity is holding while risk appetite returns.', '131 answers'],
                    ['Reward pool', '$14,850 cashback pool is open for this week.', '+50 C available'],
                    ['Technical discuss', 'Which level invalidates the current thesis?', '84 replies'],
                  ].map(([label, title, meta]) => <article key={label} className="rounded-xl border border-[#e2e8f0] bg-slate-50/60 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[#5338ec]">{label}</p><h3 className="mt-1 line-clamp-2 text-xs font-bold text-[#0b1c30]">{title}</h3><p className="mt-2 text-[10px] text-slate-500">{meta}</p></article>)}
                </div>
                <section className="mb-5 divide-y divide-[#e2e8f0] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
                  {COMMUNITY_TOPICS.slice(0, 4).map((topic, index) => {
                    const reactions = topicReactions[topic.id] ?? { likes: 0, agrees: 0, disagrees: 0, comments: 0 };
                    return <article key={topic.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <img src={topic.image} alt="" onError={(event) => { event.currentTarget.src = COMMUNITY_TOPICS[0].image; }} className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-cover" />
                        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5"><h3 className="text-xs font-bold text-[#0b1c30]">{topic.title}</h3><span className="text-[10px] text-slate-400">· #{index + 1} trending</span></div><p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{topic.description || 'Active market discussion from the community.'}</p><div className="mt-1 flex flex-wrap gap-1">{topic.tokens.slice(0, 3).map((token) => <span key={token.symbol} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold text-violet-700">#{token.symbol}</span>)}</div></div>
                        <button type="button" onClick={() => { const credits = Math.floor(Math.random() * 101) + 50; showToast(`Joined ${topic.title}. You received ${credits} free credits!`); }} className="shrink-0 rounded-full border border-[#5338ec] px-2.5 py-1 text-[10px] font-semibold text-[#5338ec]">{topic.answersCount > 100 ? 'Free to join' : `${topic.answersCount} credits · Join`}</button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2"><button type="button" onClick={() => reactToTopic(topic.id, 'comments')} className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-600">💬 Comment {topic.answersCount + reactions.comments}</button><button type="button" onClick={() => reactToTopic(topic.id, 'agrees')} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Agree {reactions.agrees}</button><button type="button" onClick={() => reactToTopic(topic.id, 'disagrees')} className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700">Disagree {reactions.disagrees}</button><button type="button" onClick={() => reactToTopic(topic.id, 'likes')} className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">♥ Like {reactions.likes}</button></div>
                    </article>;
                  })}
                </section>
                <section className="mb-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-[#0b1c30]">All Hot Topics</h2><span className="text-[10px] font-mono text-slate-500">{COMMUNITY_TOPICS.length} Active Debates</span></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2">{COMMUNITY_TOPICS.slice(0, 4).map((topic) => <article key={`card-${topic.id}`} className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xs"><div className="flex items-start justify-between gap-2"><span className="rounded-md bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-[#5338ec]">{topic.category}</span><span className="text-xs font-mono text-slate-500">{topic.answersCount} Answers</span></div><h3 className="mt-3 line-clamp-2 text-sm font-semibold text-[#0b1c30]">{topic.title}</h3><div className="mt-3 flex flex-wrap gap-2">{topic.tokens.map((token) => <span key={`${topic.id}-${token.symbol}`} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-[#0b1c30]">{token.symbol} <span className="text-emerald-600">+{token.change}%</span></span>)}</div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[11px] text-slate-400">Open for answers</span><button type="button" onClick={() => showToast(`Answering ${topic.title}`)} className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-[#0b1c30]">💬 Answer</button></div></article>)}</div></section>
                <section className="mb-5">
                  <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-[#0b1c30]">Trending Posts</h2><span className="text-[10px] text-slate-500">Popular first · generated feed</span></div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{posts.slice(0, 4).map((post) => <article key={post.id} className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xs"><div className="p-3"><div className="flex items-center gap-2"><img src={post.author.avatar} alt={post.author.name} className="h-7 w-7 rounded-full object-cover" /><div><p className="text-[11px] font-bold text-[#0b1c30]">{post.author.name}</p><p className="text-[9px] text-slate-400">{post.timestamp} · {post.category || 'Discussion'}</p></div></div><h3 className="mt-2 line-clamp-2 text-sm font-bold text-[#0b1c30]">{post.title}</h3><p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{post.content}</p>{post.image && <img src={post.image} alt="" className="mt-3 h-28 w-full rounded-xl object-cover" />}<div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500"><span>♥ {post.likes}</span><span>◌ {post.viewsCount || '1.2K'}</span><span>▢ {post.commentsCount}</span></div></div></article>)}</div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: ARTICLES */}
        {activeSubTab === 'articles' && (
          <CommunityArticlesView
            articles={COMMUNITY_ARTICLES}
            onSelectAuthorByName={(name) => {
              if (name === 'Crypto Adventure') {
                handleSelectInfluencer(CRYPTO_ADVENTURE_PROFILE);
              } else {
                showToast(`Viewing publisher: ${name}`);
              }
            }}
            onShowToast={showToast}
          />
        )}

        {/* SUB-VIEW 4: MY PAGE */}
        {activeSubTab === 'my-page' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9">
              <CommunityMyPageView
                user={user}
                userPosts={userPosts}
                onOpenCreatePost={() => setIsCreateModalOpen(true)}
                onUpdateUserProfile={onUpdateUserProfile}
                onDeletePost={(postId) => {
                  setUserPosts(userPosts.filter((p) => p.id !== postId));
                  setPosts(posts.filter((p) => p.id !== postId));
                  showToast('Post deleted');
                }}
                onShowToast={showToast}
              />
            </div>
            <div className="xl:col-span-3">
              <CommunityRightSidebar
                mode="default"
                onSelectInfluencer={handleSelectInfluencer}
                onOpenHotTopic={() => setActiveSubTab('topics')}
                onShowToast={showToast}
              />
            </div>
          </div>
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
