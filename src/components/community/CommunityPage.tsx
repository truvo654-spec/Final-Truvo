import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Flame,
  Radio,
  BookOpen,
  User,
  ChevronRight,
  Coins,
  Zap,
} from 'lucide-react';
import {
  CommunitySubTab,
  CommunityPost,
  UserProfile,
  CommunityInfluencer,
} from '../../types';
import {
  INITIAL_FEED_POSTS,
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
import { CommunityLivesView } from './CommunityLivesView';
import { TierUnlockModal } from './TierUnlockModal';
import { CreateCommunityPostModal } from './CreateCommunityPostModal';

interface CommunityPageProps {
  user: UserProfile;
  onUpdateUserProfile: (updatedUser: Partial<UserProfile>) => void;
  onRewardPoints: (points: number, reason: string) => void;
  onRewardPointsAndCredits?: (points: number, credits: number, reason: string) => void;
  onOpenConnectModal?: () => void;
  onNavigateToTab?: (tab: string, subTab?: string, symbol?: string) => void;
  initialInstrumentSymbol?: string | null;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  user,
  onUpdateUserProfile,
  onRewardPoints,
  onRewardPointsAndCredits,
  onOpenConnectModal,
  onNavigateToTab,
  initialInstrumentSymbol,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CommunitySubTab>('feeds');
  const [selectedInfluencer, setSelectedInfluencer] = useState<CommunityInfluencer | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_FEED_POSTS);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Like / Upvote
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          const delta = hasLiked ? 1 : -1;
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
            avatar:
              user.avatar.startsWith('http') || user.avatar.startsWith('/')
                ? user.avatar
                : '/toh-avatar.svg',
            tier: user.rankTitle || 'Rookie',
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
  };

  // Reaction Emoji click
  const handleReactionClick = (postId: string, emoji: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.reactions) {
          const updatedReactions = p.reactions.map((r) => {
            if (r.emoji === emoji) {
              const active = !r.active;
              return {
                ...r,
                active,
                count: active ? r.count + 1 : Math.max(0, r.count - 1),
              };
            }
            return r;
          });
          return { ...p, reactions: updatedReactions };
        }
        return p;
      })
    );
  };

  // Create post submission
  const handleCreatePost = (newPostData: Partial<CommunityPost>) => {
    const createdPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: {
        name: user.username || 'You',
        handle: `@${user.username || 'trader'}`,
        avatar:
          user.avatar.startsWith('http') || user.avatar.startsWith('/')
            ? user.avatar
            : '/toh-avatar.svg',
        verified: true,
        influenceScore: 101.4,
      },
      timestamp: 'Just now',
      title: newPostData.title || 'Market Update',
      content: newPostData.content || '',
      image: newPostData.image,
      tags: newPostData.tags || ['General'],
      likes: 1,
      hasLiked: true,
      commentsCount: 0,
      comments: [],
      reactions: [
        { emoji: '👏', count: 1, active: false },
        { emoji: '❤️', count: 1, active: true },
        { emoji: '🔥', count: 0, active: false },
        { emoji: '🚀', count: 0, active: false },
        { emoji: '📉', count: 0, active: false },
        { emoji: '💡', count: 0, active: false },
      ],
      viewsCount: '1',
      repostsCount: 0,
      bookmarksCount: 0,
      isFollowingAuthor: false,
    };

    setPosts([createdPost, ...posts]);
    setUserPosts([createdPost, ...userPosts]);
    showToast('Post published successfully!');
  };

  // Influencer profile viewing
  const handleSelectInfluencer = (influencer: CommunityInfluencer) => {
    setSelectedInfluencer(influencer);
    setActiveSubTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInfluencerByHandle = (handle: string) => {
    const found = TOP_INFLUENCERS.find((inf) => inf.handle.toLowerCase() === handle.toLowerCase());
    if (found) {
      handleSelectInfluencer(found);
    } else {
      showToast(`Viewing profile of ${handle}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white border border-slate-700 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#bef264]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── COMMUNITY TOP BAR & NAVIGATION ─── */}
      <header className="bg-white border border-[#e2e8f0] rounded-2xl px-4 sm:px-5 py-3 text-[#0b1c30] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Sub-tabs pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setActiveSubTab('feeds');
              setSelectedInfluencer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeSubTab === 'feeds'
                ? 'bg-[#5338ec] text-white shadow-xs'
                : 'text-[#474556] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Feeds</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('topics');
              setSelectedInfluencer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeSubTab === 'topics'
                ? 'bg-[#5338ec] text-white shadow-xs'
                : 'text-[#474556] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Hot Topics</span>
          </button>

          {/* New: Lives & Audio Spaces Tab */}
          <button
            onClick={() => {
              setActiveSubTab('lives');
              setSelectedInfluencer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 relative ${
              activeSubTab === 'lives'
                ? 'bg-[#5338ec] text-white shadow-xs'
                : 'text-[#474556] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>Lives</span>
            <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 px-1 rounded ml-0.5">
              Live
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('articles');
              setSelectedInfluencer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeSubTab === 'articles'
                ? 'bg-[#5338ec] text-white shadow-xs'
                : 'text-[#474556] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Articles</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('my-page');
              setSelectedInfluencer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeSubTab === 'my-page'
                ? 'bg-[#5338ec] text-white shadow-xs'
                : 'text-[#474556] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span>My Profile</span>
          </button>
        </div>

        {/* Right Actions: Gamification Tier + Syde Credits + Notifications Bell */}
        <div className="flex items-center gap-2 sm:gap-3 justify-end ml-auto">
          {/* Tier Unlock Progress Pill (Clickable) */}
          <button
            onClick={() => setIsTierModalOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/15 transition-all cursor-pointer group shadow-2xs"
            title="Click to view all Tier Unlocks &amp; Gamification Matrix"
          >
            <span className="text-sm">💎</span>
            <div className="text-left">
              <div className="text-[11px] font-bold text-[#0b1c30] flex items-center gap-1">
                <span>{user.rankTitle || 'Diamond Whale'}</span>
                <span className="text-[9px] bg-amber-500 text-slate-900 px-1 py-0.2 rounded font-mono font-bold">
                  Lvl {user.level}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[9px] text-slate-500">
                <span className="font-mono">{user.currentPoints} Pts</span>
                <span className="text-emerald-600 font-semibold">+{user.cashbackBooster || 15}% Boost</span>
              </div>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Syde Credits Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold hover:border-amber-400/50 transition-colors"
            title="Syde Credits: Redeemable for Broker fee discounts &amp; tipping"
          >
            <span className="text-amber-500">🪙</span>
            <span className="font-mono text-[#0b1c30]">{user.sydeCredits}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setUnreadNotifications(0);
              }}
              className="p-2 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] text-slate-600 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main>
        {/* SUB-VIEW 1: FEEDS */}
        {activeSubTab === 'feeds' && (
          <div className="flex flex-col xl:flex-row items-start gap-6">
            <div className="flex-1 min-w-0 w-full">
              <CommunityFeedsView
                posts={posts}
                user={user}
                onToggleLike={handleToggleLike}
                onToggleFollowAuthor={handleToggleFollowAuthor}
                onAddComment={handleAddComment}
                onOpenCreatePost={() => setIsCreateModalOpen(true)}
                onSelectInfluencerByHandle={handleSelectInfluencerByHandle}
                onReactionClick={handleReactionClick}
                onShowToast={showToast}
                onOpenTierModal={() => setIsTierModalOpen(true)}
                onRewardPointsAndCredits={onRewardPointsAndCredits}
              />
            </div>
            <div className="w-full xl:w-[300px] xl:shrink-0">
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
        {activeSubTab === 'topics' && (
          <div className="flex flex-col xl:flex-row items-start gap-6">
            <div className="flex-1 min-w-0 w-full">
              <CommunityTopicsView
                topics={COMMUNITY_TOPICS}
                onAnswerTopic={(topicId, answer) => {
                  if (onRewardPointsAndCredits) {
                    onRewardPointsAndCredits(25, 10, 'Debate Participation');
                  } else {
                    onRewardPoints(25, 'Debate Participation');
                  }
                  showToast('Debate answer submitted! Earned +25 Pts & +10 Syde Credits 🎉');
                }}
                onShowToast={showToast}
              />
            </div>
            <div className="w-full xl:w-[300px] xl:shrink-0">
              <CommunityRightSidebar
                mode="default"
                onSelectInfluencer={handleSelectInfluencer}
                onOpenHotTopic={() => {}}
                onShowToast={showToast}
              />
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: LIVES & AUDIO SPACES */}
        {activeSubTab === 'lives' && (
          <CommunityLivesView
            user={user}
            onRewardPoints={onRewardPoints}
            onShowToast={showToast}
            onOpenTierModal={() => setIsTierModalOpen(true)}
          />
        )}

        {/* SUB-VIEW 4: ARTICLES */}
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

        {/* SUB-VIEW 5: MY PAGE */}
        {activeSubTab === 'my-page' && (
          <div className="flex flex-col xl:flex-row items-start gap-6">
            <div className="flex-1 min-w-0 w-full">
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
                onOpenTierModal={() => setIsTierModalOpen(true)}
              />
            </div>
            <div className="w-full xl:w-[300px] xl:shrink-0">
              <CommunityRightSidebar
                mode="default"
                onSelectInfluencer={handleSelectInfluencer}
                onOpenHotTopic={() => setActiveSubTab('topics')}
                onShowToast={showToast}
              />
            </div>
          </div>
        )}

        {/* SUB-VIEW 6: PROFILE PAGE */}
        {activeSubTab === 'profile' && (
          <div className="flex flex-col xl:flex-row items-start gap-6">
            <div className="flex-1 min-w-0 w-full">
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
                  showToast('Follow status updated');
                }}
                onShowToast={showToast}
              />
            </div>
            <div className="w-full xl:w-[300px] xl:shrink-0">
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

      {/* ─── GAMIFICATION TIER UNLOCK MATRIX MODAL ─── */}
      <TierUnlockModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        user={user}
        onShowToast={showToast}
      />
    </div>
  );
};
