import React, { useState } from 'react';
import { ChevronRight, ThumbsUp, ThumbsDown, Send, Smile } from 'lucide-react';

interface MiniComment {
  id: string;
  name: string;
  initials: string;
  color: string;
  stance: 'Bullish' | 'Bearish';
  timeAgo: string;
  price: string;
  text: string;
  likes: number;
  dislikes: number;
}

const INITIAL_COMMENTS: MiniComment[] = [
  {
    id: 'mc_1',
    name: 'Ava Kim',
    initials: 'AK',
    color: '#EC4899',
    stance: 'Bullish',
    timeAgo: '2h ago',
    price: '$66,420.00',
    text: 'I like the sentiment shift. The bullish case feels stronger after the last update, especially with the on-chain volume holding up.',
    likes: 24,
    dislikes: 12,
  },
  {
    id: 'mc_2',
    name: 'Ayasha Sharma',
    initials: 'AS',
    color: '#F59E0B',
    stance: 'Bearish',
    timeAgo: '2h ago',
    price: '$62,434.10',
    text: 'The momentum looks fragile. Weak follow-through and fading volume suggest more downside could be ahead.',
    likes: 19,
    dislikes: 8,
  },
  {
    id: 'mc_3',
    name: 'Jordan Lee',
    initials: 'JL',
    color: '#22C55E',
    stance: 'Bullish',
    timeAgo: '2h ago',
    price: '$64,820.00',
    text: "Momentum is improving, but I'd wait for a clearer breakout before adding to the position.",
    likes: 35,
    dislikes: 8,
  },
];

interface CommunityLeftSidebarProps {
  onOpenTopics?: () => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityLeftSidebar: React.FC<CommunityLeftSidebarProps> = ({ onOpenTopics, onShowToast }) => {
  const [vote, setVote] = useState<'bullish' | 'bearish' | null>('bullish');
  const [hasVotedToday, setHasVotedToday] = useState(true);
  const [postTab, setPostTab] = useState<'popular' | 'recent'>('popular');
  const [draft, setDraft] = useState('');
  const [reactions, setReactions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [hasPostedToday, setHasPostedToday] = useState(false);

  const bullishPct = vote === 'bearish' ? 71 : 74;
  const bearishPct = 100 - bullishPct;

  const castVote = (choice: 'bullish' | 'bearish') => {
    const alreadyVoted = hasVotedToday && vote === choice;
    if (alreadyVoted) return;
    setVote(choice);
    if (!hasVotedToday) {
      setHasVotedToday(true);
      onShowToast?.('+50 credits — thanks for voting!');
    } else {
      onShowToast?.('Vote updated');
    }
  };

  const toggleReaction = (id: string, kind: 'like' | 'dislike') => {
    setReactions((prev) => ({ ...prev, [id]: prev[id] === kind ? null : kind }));
  };

  const comments =
    postTab === 'popular' ? [...INITIAL_COMMENTS].sort((a, b) => b.likes - a.likes) : INITIAL_COMMENTS;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-[#5945F1]">
          Community<span className="text-[#0b1c30]">.</span>
        </h3>
        <button
          onClick={onOpenTopics}
          className="flex items-center gap-0.5 text-xs font-bold text-[#5945F1] hover:underline shrink-0"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sentiment */}
      <h4 className="text-sm font-bold text-[#0b1c30] mb-1">Sentiment</h4>
      <p className="text-[11px] text-[#94a3b8] font-medium mb-3">Based on 12.4k community votes · Resets in 6h</p>

      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-sm font-bold text-lime-600">
          🐂 {bullishPct}% Bullish
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30]">
          {bearishPct}% Bearish 🐻
        </span>
      </div>
      <div className="h-2.5 bg-[#EEF0FE] rounded-full overflow-hidden mb-3">
        <div className="h-full bg-lime-500 rounded-full transition-all" style={{ width: `${bullishPct}%` }} />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => castVote('bullish')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-colors ${
            vote === 'bullish' ? 'bg-lime-500 text-slate-950' : 'bg-[#F8F7FF] text-[#5945F1] hover:bg-[#EEF0FE]'
          }`}
        >
          ↗ {vote === 'bullish' ? 'Bullish Voted' : 'Vote Bullish'}
        </button>
        <button
          onClick={() => castVote('bearish')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-colors ${
            vote === 'bearish' ? 'bg-[#0b1c30] text-white' : 'bg-[#F8F7FF] text-[#5945F1] hover:bg-[#EEF0FE]'
          }`}
        >
          ↘ {vote === 'bearish' ? 'Bearish Voted' : 'Vote Bearish'}
        </button>
      </div>
      <p className="text-[11px] text-[#94a3b8] font-medium mb-4">Vote once a day to get 50 credits</p>

      {/* Most Accurate Predictor */}
      <h4 className="text-sm font-bold text-[#0b1c30] mb-2">Most Accurate Predictor</h4>
      <div className="flex items-center justify-between bg-[#F8F7FF] rounded-xl px-3 py-2.5 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#EC4899] text-white flex items-center justify-center text-xs font-bold shrink-0">
            M
          </div>
          <span className="text-sm font-semibold text-[#0b1c30] truncate">Priya Shah</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-bold text-emerald-600">82% Accuracy</span>
          <span className="text-base">🦜</span>
        </div>
      </div>

      <div className="h-px bg-[#f1f5f9] mb-4" />

      {/* Community Post mini composer */}
      <h4 className="text-sm font-bold text-[#0b1c30] mb-2">Community Post</h4>
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 flex items-center gap-2 bg-[#f8fafc] border border-slate-100 rounded-xl px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What are your thoughts?"
            className="flex-1 min-w-0 bg-transparent text-sm text-[#0b1c30] placeholder:text-[#94a3b8] focus:outline-none"
          />
          <Smile className="w-4 h-4 text-[#94a3b8] shrink-0" />
        </div>
        <button
          onClick={() => {
            if (!draft.trim()) return;
            setDraft('');
            if (!hasPostedToday) {
              setHasPostedToday(true);
              onShowToast?.('Posted! +50 credits');
            } else {
              onShowToast?.('Posted to the community');
            }
          }}
          aria-label="Post"
          className="w-9 h-9 rounded-full bg-[#5945F1] hover:bg-[#4d3ad8] text-white flex items-center justify-center shrink-0 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-[#94a3b8] font-medium mb-4">Share once a day and get 50 credits</p>

      {/* Popular / Most Recent tabs */}
      <div className="flex items-center gap-4 mb-3 border-b border-[#f1f5f9]">
        <button
          onClick={() => setPostTab('popular')}
          className={`pb-2 text-sm font-bold transition-colors relative ${
            postTab === 'popular' ? "text-[#5945F1] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#5945F1]" : 'text-[#94a3b8]'
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => setPostTab('recent')}
          className={`pb-2 text-sm font-bold transition-colors relative ${
            postTab === 'recent' ? "text-[#5945F1] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#5945F1]" : 'text-[#94a3b8]'
          }`}
        >
          Most Recent
        </button>
      </div>

      <div className="space-y-4 mb-4">
        {comments.map((c) => {
          const reaction = reactions[c.id];
          const likes = c.likes + (reaction === 'like' ? 1 : 0);
          const dislikes = c.dislikes + (reaction === 'dislike' ? 1 : 0);
          return (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.initials}
                  </div>
                  <span className="text-sm font-bold text-[#0b1c30] truncate">{c.name}</span>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.stance === 'Bullish' ? 'bg-lime-100 text-lime-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {c.stance === 'Bullish' ? '↗' : '↘'} {c.stance}
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] font-medium mb-1 pl-9">
                {c.timeAgo} · {c.price}
              </p>
              <p className="text-xs text-[#474556] leading-relaxed pl-9 mb-1.5">{c.text}</p>
              <div className="flex items-center gap-4 pl-9 text-[11px] text-[#94a3b8] font-semibold">
                <button
                  onClick={() => toggleReaction(c.id, 'like')}
                  className={`flex items-center gap-1 transition-colors ${reaction === 'like' ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${reaction === 'like' ? 'fill-current' : ''}`} /> {likes}
                </button>
                <button
                  onClick={() => toggleReaction(c.id, 'dislike')}
                  className={`flex items-center gap-1 transition-colors ${reaction === 'dislike' ? 'text-rose-500' : 'hover:text-rose-500'}`}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${reaction === 'dislike' ? 'fill-current' : ''}`} /> {dislikes}
                </button>
                <button onClick={() => onShowToast?.('Reply opened')} className="hover:text-[#0b1c30] transition-colors">
                  Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onOpenTopics}
        className="w-full bg-[#5945F1] hover:bg-[#4d3ad8] text-white text-sm font-bold py-3 rounded-xl transition-colors"
      >
        Go to Community
      </button>
    </div>
  );
};
