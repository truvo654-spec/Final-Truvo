import React, { useState } from 'react';
import {
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Layers,
  BarChart3,
  Info,
  TrendingUp,
  Share2,
  Trash2,
  MessageSquare,
  Repeat2,
  Bookmark,
  Check,
} from 'lucide-react';
import { UserProfile, CommunityPost } from '../../types';

interface CommunityMyPageViewProps {
  user: UserProfile;
  userPosts: CommunityPost[];
  onOpenCreatePost: () => void;
  onUpdateUserProfile: (updatedUser: Partial<UserProfile>) => void;
  onDeletePost?: (postId: string) => void;
  onShowToast: (msg: string) => void;
}

export const CommunityMyPageView: React.FC<CommunityMyPageViewProps> = ({
  user,
  userPosts,
  onOpenCreatePost,
  onUpdateUserProfile,
  onDeletePost,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'reactions'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user.username || 'User_wrzl75940815');
  const [editHandle, setEditHandle] = useState(`@${user.username || 'User_wrzl75940815'}`);
  const [editBio, setEditBio] = useState('Active trader on MarketSyde maximizing institutional broker cashback.');
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  const handleSaveProfile = () => {
    onUpdateUserProfile({
      username: editName,
      avatar: editAvatar,
    });
    setIsEditModalOpen(false);
    onShowToast('✅ Profile updated successfully');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* ─── LEFT COLUMN: USER PROFILE & INSIGHTS (4 cols) ─── */}
      <div className="lg:col-span-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden text-[#0b1c30] shadow-xs hover:border-[#cbd5e1] transition-all">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-100 relative border-b border-[#e2e8f0]">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 hover:text-[#0b1c30] shadow-xs transition-colors"
              title="Change banner"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 pt-0 relative space-y-4">
            {/* Avatar overlapping banner */}
            <div className="flex items-end justify-between -mt-10 mb-2">
              <div className="relative group">
                <img
                  src={
                    user.avatar.startsWith('http') || user.avatar.startsWith('/')
                      ? user.avatar
                      : '/toh-avatar.svg'
                  }
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white bg-slate-100 shadow-md"
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-1.5 rounded-full bg-[#5338ec] text-white hover:bg-[#4326d8] transition-colors shadow-xs"
                  title="Change avatar"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowToast('Options menu')}
                  className="p-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0b1c30] border border-[#e2e8f0] transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0b1c30] text-xs font-semibold border border-[#e2e8f0] transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Name & Handle */}
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] font-display">{user.username || 'User_wrzl75940815'}</h3>
              <p className="text-xs text-[#474556] font-mono">@{user.username || 'User_wrzl75940815'}</p>
              <p className="text-xs text-[#474556] mt-2 leading-relaxed">{editBio}</p>
            </div>

            {/* Watchlist CTA */}
            <button
              onClick={() => onShowToast('Watchlist creator opened')}
              className="w-full py-2 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0b1c30] border border-[#e2e8f0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#5338ec]" />
              <span>Create My First Watchlist</span>
            </button>
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
                Calculated once you publish market analysis and receive community upvotes.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3">
              <span className="text-[11px] text-[#474556] block mb-1">Social Influence</span>
              <span className="text-base font-bold font-mono text-[#0b1c30]">--</span>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3">
              <span className="text-[11px] text-[#474556] block mb-1">Analytical Depth</span>
              <span className="text-base font-bold font-mono text-[#0b1c30]">--</span>
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
            <p className="text-[10px] text-[#474556] max-w-xs mx-auto">
              Tag tickers in your posts (e.g. $BTC, $ETH, $ARB) to track your mention mindshare.
            </p>
          </div>
        </div>
      </div>

      {/* ─── CENTER COLUMN: POSTS FEED / EMPTY STATE (8 cols) ─── */}
      <div className="lg:col-span-8 space-y-4">
        {/* Header Controls */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3 text-[#0b1c30] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0b1c30] font-display">All Posts</h3>
            <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl text-xs">
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
            <button
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>
          </div>
        </div>

        {/* Content area: Either user posts or the exact Empty State */}
        {userPosts.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center text-[#0b1c30] shadow-xs space-y-4">
            {/* Artistic Illustration */}
            <div className="w-24 h-24 mx-auto rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center relative">
              <div className="w-14 h-14 rounded-full bg-[#ede9fe] border border-indigo-200 flex items-center justify-center">
                <Layers className="w-7 h-7 text-[#5338ec]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center text-xs">
                ✨
              </span>
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-base font-bold text-[#0b1c30] font-display">Nothing Here Yet</h4>
              <p className="text-xs text-[#474556] leading-relaxed">
                You can post your first post, or discover and repost accounts you are interested in!
              </p>
            </div>

            <button
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-2 bg-[#5338ec] hover:bg-[#4326d8] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs space-y-3 hover:border-[#cbd5e1] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        user.avatar.startsWith('http') || user.avatar.startsWith('/')
                          ? user.avatar
                          : '/toh-avatar.svg'
                      }
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#0b1c30]">{user.username}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>

                  {onDeletePost && (
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#0b1c30] leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {post.image && (
                  <div className="rounded-xl overflow-hidden border border-[#e2e8f0] max-h-72">
                    <img
                      src={post.image}
                      alt="Post visual"
                      className="w-full h-auto object-cover max-h-72"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-[#474556] pt-2 border-t border-[#f1f5f9]">
                  <span className="flex items-center gap-1 font-mono">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount || 0}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Repeat2 className="w-3.5 h-3.5" />
                    <span>{post.repostsCount || 0}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{post.bookmarksCount || 0}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODAL: EDIT PROFILE DIALOG ─── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full max-w-md text-[#0b1c30] shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30] font-display">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#474556] font-medium block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#474556] font-medium block mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#474556] font-medium block mb-1">Avatar Profile Photo</label>
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-[#e2e8f0]">
                  <img
                    src={
                      editAvatar &&
                      (editAvatar.startsWith('http') ||
                        editAvatar.startsWith('/') ||
                        editAvatar.startsWith('data:'))
                        ? editAvatar
                        : '/toh-avatar.svg'
                    }
                    alt="Avatar preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm bg-white shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setEditAvatar(ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditAvatar('/toh-avatar.svg')}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-[#e2e8f0] hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                      >
                        Reset Vector
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload any image from your device or paste a URL below.
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="Or enter image URL"
                  className="w-full mt-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#474556] hover:text-[#0b1c30]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5338ec] hover:bg-[#4326d8] text-white shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
