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
import { CreateCommunityPostModal } from './CreateCommunityPostModal';

interface CommunityPageProps {
  user: UserProfile;
  onUpdateUserProfile: (updatedUser: Partial<UserProfile>) => void;
  onRewardPoints: (points: number, reason: string) => void;
  onOpenConnectModal?: () => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  user,
  onUpdateUserProfile,
  onRewardPoints,
  onOpenConnectModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CommunitySubTab>('feeds');
  const [selectedInfluencer, setSelectedInfluencer] = useState<CommunityInfluencer | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_FEED_POSTS);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
          if (hasLiked) {
            onRewardPoints(5, 'Liked community post');
            showToast('❤️ Post upvoted! +5 Points awarded');
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
            avatar: user.avatar.startsWith('http') || user.avatar.startsWith('/')
              ? user.avatar
              : '/toh-avatar.svg',
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
    onRewardPoints(10, 'Commented on market alpha');
    showToast('💬 Comment posted! +10 Points awarded');
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

  // Create new post
  const handleCreatePost = (newPostData: Partial<CommunityPost>) => {
    const newPost: CommunityPost = {
      id: `user-post-${Date.now()}`,
      author: {
        name: user.username || 'You',
        handle: `@${user.username || 'trader'}`,
        avatar: user.avatar.startsWith('http') || user.avatar.startsWith('/')
          ? user.avatar
          : '/toh-avatar.svg',
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
    onRewardPoints(25, 'Published community post');
    showToast('🚀 Post published to Community Feed and My Page! +25 Points awarded');
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
    <div className="space-y-6 font-sans">
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

            {/* Lives Tab */}
            <button
              onClick={() => {
                showToast('🎙️ Live audio stream starting in 45m');
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#474556] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-all flex items-center gap-1.5"
            >
              <span>Lives</span>
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

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#474556] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-all flex items-center gap-1"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl py-2 z-40">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Community Guidelines: 100% verified alpha, no spam, institutional respectful analysis.');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-[#0b1c30] hover:bg-[#f8fafc] flex items-center gap-2 font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#5338ec]" />
                    <span>Community Guidelines</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Redirecting to MarketSyde VIP Discord');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-[#0b1c30] hover:bg-[#f8fafc] flex items-center gap-2 font-medium"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>VIP Discord Lounge</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Rebate Pool: $142,850 distributed to traders this month');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-[#0b1c30] hover:bg-[#f8fafc] flex items-center gap-2 font-medium"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Cashback Rebate Pools</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Notifications Button */}
          <div className="flex items-center gap-3 shrink-0">
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
                onReactionClick={handleReactionClick}
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
        {activeSubTab === 'topics' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9">
              <CommunityTopicsView
                topics={COMMUNITY_TOPICS}
                onAnswerTopic={(topicId, answer) => {
                  onRewardPoints(15, 'Answered community debate');
                }}
                onShowToast={showToast}
              />
            </div>
            <div className="xl:col-span-3">
              <CommunityRightSidebar
                mode="default"
                onSelectInfluencer={handleSelectInfluencer}
                onOpenHotTopic={() => {}}
                onShowToast={showToast}
              />
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
                  onRewardPoints(10, 'Followed community alpha creator');
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
