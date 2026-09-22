import React, { useState, useRef } from 'react';
import {
  Heart,
  Bookmark,
  Send,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

export interface CommunityPostItem {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  time: string;
  badge?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

export const SAMPLE_COMMUNITY_POSTS: CommunityPostItem[] = [
  {
    id: 'post-1',
    author: 'HextaStudio',
    handle: '@HextaStudio',
    avatar: 'https://cdn.21st.dev/assets/mirror/ec/ece1c487950b3d91d59a8b34b9f73f07f2c63b2fe913297599e786934f632d60.png',
    time: '7h',
    badge: 'Creator',
    content: 'HextaUI – Gorgeous web components without any effort! ✨\n\n🚀 HextaStudio launched their new product HextaUI, a collection of beautiful web components.\n\n🥳 Check it out now!',
    image: 'https://cdn.21st.dev/assets/mirror/e6/e621b97a97799ea2e5ba109264ba4ed3a5955c88c3db05eb6b946c492d20736a.png',
    likes: 128,
    comments: 24,
  },
  {
    id: 'post-2',
    author: 'Alex Rivera',
    handle: '@alex_macro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    time: '4h',
    badge: 'Pro Analyst',
    content: 'EUR/USD Bullish Continuation confirmed! 🚀📊\n\nClean retest at 1.0820 support zone with massive volume expansion across European desks. Targeting 1.0950 next with strict invalidation.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    likes: 94,
    comments: 18,
  },
  {
    id: 'post-3',
    author: 'Sofia Mendes',
    handle: '@sofia_quant',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    time: '2h',
    badge: 'Crypto Lead',
    content: 'Bitcoin holding $96K consolidation cleanly. Whale wallet accumulation up 14% this week. 🐋⚡\n\nWatching weekend liquidity sweeps before the next expansion leg!',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&auto=format&fit=crop&q=80',
    likes: 215,
    comments: 42,
  },
  {
    id: 'post-4',
    author: 'Maya Chen',
    handle: '@mayachen_fx',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    time: '1d',
    badge: 'Top Predictor',
    content: 'Gold (XAU/USD) technical roadmap: breakout above 2,680 confirmed on the 4H timeframe. Key liquidity cluster resting near 2,720. Trade safe and manage risk! 🏆',
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    likes: 167,
    comments: 31,
  },
];

interface PostCardProps {
  post: CommunityPostItem;
  onNavigateToTab?: (tab: string) => void;
  onToast?: (msg: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onNavigateToTab, onToast }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !bookmarked;
    setBookmarked(next);
    if (onToast) {
      onToast(next ? 'Saved to bookmarks' : 'Removed from bookmarks');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    if (onToast) {
      onToast('Post link copied to clipboard!');
    }
  };

  return (
    <div
      onClick={() => onNavigateToTab?.('community')}
      className="w-[84vw] sm:w-[calc((100%-1.5rem)/2.1)] lg:w-[calc((100%-2.5rem)/2.5)] min-w-[280px] max-w-[420px] shrink-0 snap-start rounded-4xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 card-header pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={post.avatar}
              alt={post.author}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              loading="lazy"
            />
            <div className="min-w-0">
              <h4 className="flex flex-col text-slate-900 font-bold text-sm leading-tight">
                <span className="truncate group-hover:text-[#5945F1] transition-colors">{post.author}</span>
                <span className="flex items-center gap-1.5 opacity-70 text-xs text-slate-500 font-normal">
                  <small className="font-mono">{post.handle}</small>
                  <span>·</span>
                  <small>{post.time}</small>
                </span>
              </h4>
            </div>
          </div>
          {post.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#5945F1] border border-indigo-100 shrink-0">
              {post.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-3.5 flex flex-col gap-3">
          <p className="whitespace-pre-wrap text-slate-700 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {post.content}
          </p>
          {post.image && (
            <div className="relative w-full h-40 sm:h-44 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
              <img
                src={post.image}
                alt={post.author}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-evenly gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLike}
          className={`flex grow items-center justify-center gap-2 rounded-xl px-3 py-1.5 transition text-xs font-semibold cursor-pointer ${
            liked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Like"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
          <span className="text-xs font-medium max-sm:hidden">
            {liked ? 'Liked' : 'Like'}
          </span>
          <span className="text-[11px] opacity-75 font-mono">({likesCount})</span>
        </button>

        <button
          type="button"
          onClick={handleBookmark}
          className={`flex grow items-center justify-center gap-2 rounded-xl px-3 py-1.5 transition text-xs font-semibold cursor-pointer ${
            bookmarked ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Save"
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-sky-500 text-sky-500' : 'text-slate-500'}`} />
          <span className="text-xs font-medium max-sm:hidden">
            {bookmarked ? 'Saved' : 'Save'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex grow items-center justify-center gap-2 rounded-xl px-3 py-1.5 transition text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          title="Share"
        >
          <Send className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-medium max-sm:hidden">Share</span>
        </button>
      </div>
    </div>
  );
};

interface CommunityWidgetProps {
  onNavigateToTab?: (tab: string) => void;
  onToast?: (msg: string) => void;
  className?: string;
}

export const CommunityWidget: React.FC<CommunityWidgetProps> = ({
  onNavigateToTab,
  onToast,
  className = '',
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 ${className}`}>
      {/* Header with Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#0b1c30]">
              Community <span className="text-[#5945F1]">Pulse.</span>
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time trader sentiment, discussions, and verified setups from the community
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <button
              onClick={() => scrollBy('left')}
              title="Scroll left"
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollBy('right')}
              title="Scroll right"
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* CTA: Go to Community */}
          <button
            onClick={() => onNavigateToTab?.('community')}
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-indigo-500/25 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Go to Community</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 2.5 Cards Carousel Row (2 cards full + 0.5 card peeking) */}
      <div
        ref={carouselRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth scrollbar-none snap-x snap-mandatory"
      >
        {SAMPLE_COMMUNITY_POSTS.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onNavigateToTab={onNavigateToTab}
            onToast={onToast}
          />
        ))}

        {/* Peek / Explore More Card at end of carousel */}
        <div
          onClick={() => onNavigateToTab?.('community')}
          className="w-[200px] sm:w-[220px] shrink-0 snap-start rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-all p-5 flex flex-col items-center justify-center text-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white text-[#5945F1] shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
              Explore More
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Join 12,000+ traders on the Community Floor
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5945F1] group-hover:underline">
            View All Posts
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
