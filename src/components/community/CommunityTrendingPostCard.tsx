import React, { useState } from 'react';
import { Star, ImageIcon, CheckCircle2 } from 'lucide-react';
import { TrendingPost } from '../../data/communityTrendingPostsData';

interface CommunityTrendingPostCardProps {
  post: TrendingPost;
  onShowToast: (msg: string) => void;
}

export const CommunityTrendingPostCard: React.FC<CommunityTrendingPostCardProps> = ({ post, onShowToast }) => {
  const [following, setFollowing] = useState(false);
  const [voted, setVoted] = useState<'agree' | 'disagree' | null>(null);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
      {/* Category + type badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`px-3 py-2 rounded-xl text-xs font-bold leading-snug ${post.categoryClass}`}>
          {post.categoryLabel}
        </span>
        <span className="shrink-0 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#474556]">
          {post.postType}
        </span>
      </div>

      <h3 className="text-base font-bold text-[#0b1c30] leading-snug mb-1">{post.title}</h3>
      <p className="text-xs text-[#94a3b8] font-medium mb-3">Popular first · generated cover</p>

      <div className="h-px bg-[#f1f5f9] mb-3" />

      {/* Author row */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-bold text-[#0b1c30] truncate">{post.authorName}</span>
          {post.verified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500 shrink-0" />}
        </div>
        <button
          onClick={() => setFollowing((v) => !v)}
          className={`shrink-0 text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${
            following ? 'bg-slate-100 text-slate-500' : 'bg-violet-50 text-[#5338ec] hover:bg-violet-100'
          }`}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </div>
      <p className="text-xs text-[#94a3b8] font-medium mb-3">{post.authorHandle}</p>

      <div className="flex items-center gap-2.5 mb-3">
        {post.authorAvatar ? (
          <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: post.authorColor }}
          >
            {post.authorInitials}
          </div>
        )}
        <span className="text-xs text-[#94a3b8] font-medium">{post.timeAgo}</span>
      </div>

      {/* Stat row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-sm font-bold text-[#0b1c30]">{post.influenceScore}</span>
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] text-[#474556] font-semibold leading-tight">
            Influence
            <br />
            Score
          </span>
        </div>
        <div className="text-xs">
          <span className="font-semibold text-[#0b1c30]">Predict</span>
          <br />
          <span className="font-bold text-emerald-600">precision {post.predictPrecision}%</span>
        </div>
      </div>

      <p className="text-sm text-[#0b1c30] leading-relaxed whitespace-pre-line mb-3">{post.body}</p>

      {/* Post visual */}
      {post.chartImage ? (
        <img src={post.chartImage} alt="Chart" className="w-full rounded-xl mb-3 border border-slate-200" />
      ) : (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 mb-3">
          <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-500">Post visual</span>
        </div>
      )}

      {/* Token mentions */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {post.tokenMentions.map((tm) => (
          <span
            key={tm.symbol}
            className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
          >
            <span className="font-bold text-[#0b1c30]">{tm.symbol}</span>
            <span className={tm.sentiment === 'Bullish' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {tm.change >= 0 ? '+' : ''}
              {tm.change}%
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tm.sentiment === 'Bullish' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {tm.sentiment}
            </span>
          </span>
        ))}
      </div>

      {post.hashtags && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags.map((h) => (
            <span key={h} className="text-xs font-semibold text-emerald-600">
              {h}
            </span>
          ))}
        </div>
      )}

      {post.postType === 'Poll' && post.pollAgreePct !== undefined && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVoted('agree');
              onShowToast('Vote recorded: Agree');
            }}
            className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
              voted === 'agree'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            Agree {post.pollAgreePct}%
          </button>
          <button
            onClick={() => {
              setVoted('disagree');
              onShowToast('Vote recorded: Disagree');
            }}
            className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
              voted === 'disagree'
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            Disagree {post.pollDisagreePct}%
          </button>
        </div>
      )}
    </div>
  );
};
