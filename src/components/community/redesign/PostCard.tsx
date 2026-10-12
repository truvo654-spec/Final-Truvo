import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bookmark, ChartNoAxesColumnIncreasing, Check, ChevronLeft, ChevronRight, Eye, Gift, Heart, MessageCircle, MoreVertical, Share2 } from 'lucide-react';
import { HashtagLink } from '../../hashtag/HashtagText';
import { Avatar, Card, Verified, BORDER } from './ui';
import { CommentThread, Me } from './Comments';
import { FeedPost } from './data';
import { ShowToast } from './Toast';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

export const MoreMenu: React.FC<{ items: { label: string; onClick: () => void; danger?: boolean }[]; label?: string }> = ({ items, label = 'More options' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#5945F1] ${open ? 'bg-[#ddd8ff]' : 'bg-[#e9e5ff] hover:bg-[#ddd8ff]'}`}><MoreVertical className="w-4 h-4" /></button>
      {open && (
        <div role="menu" className="absolute right-0 top-[41px] z-20 w-[116px] bg-white border border-[#5945F1] rounded-lg shadow-md py-px overflow-hidden">
          {items.map((it) => <button key={it.label} role="menuitem" type="button" onClick={() => { setOpen(false); it.onClick(); }} className="w-full h-[32px] text-left px-2 text-[14px] text-[#111827] whitespace-nowrap hover:bg-[#f3f1ff]">{it.label}</button>)}
        </div>
      )}
    </div>
  );
};

interface Props {
  post: FeedPost;
  /** Open the comment thread straight away (the first post in the feed does). */
  openComments?: boolean;
  me: Me;
  onChange: (p: FeedPost) => void;
  onRemove: (id: string, mode: 'delete' | 'draft') => void;
  onShare?: (id: string, who: string) => void;
  onToast: ShowToast;
}

export const PostCard: React.FC<Props> = ({ post, openComments, me, onChange, onRemove, onShare, onToast }) => {
  const [showComments, setShowComments] = useState(!!openComments);
  const [slide, setSlide] = useState(0);
  const media = post.media ?? [];
  const poll = post.poll;
  const votes = poll ? poll.options.reduce((a, o) => a + o.votes, 0) : 0;
  // A small, stable reward per post so the pill does not jump around on re-render.
  const shareCredits = 25 + (post.id.charCodeAt(post.id.length - 1) % 40);
  const set = (patch: Partial<FeedPost>) => onChange({ ...post, ...patch });
  const share = async () => {
    if (onShare) return onShare(post.id, post.name);
    try { await navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`); onToast('Link Copied', 'Share it anywhere'); } catch { onToast('Could Not Copy', 'Copy the link from the address bar'); }
  };
  const stat = 'flex items-center gap-1.5 text-[13px] leading-5';

  return (
    <Card className="p-4">
      <header className="flex items-start gap-2">
        <Avatar src={post.avatar} alt={post.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-1.5 text-[16px] leading-[22px]"><span className="font-semibold text-[#111827]">{post.name}</span><Verified /><span className="text-[#6b7280]">{post.handle} · {post.time}</span></p>
          {post.precision != null && <span className="inline-block mt-1.5 bg-[#f3f4f6] text-[#374151] text-[12px] leading-[21px] rounded-md px-2.5 py-0.5">Predict Precision: {post.precision}%</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!post.own && <button type="button" aria-pressed={!!post.following} onClick={() => { set({ following: !post.following }); onToast(post.following ? 'Unfollowed' : 'Following', post.name); }} className={`h-8 w-[68px] rounded-lg border ${BORDER} text-[14px] text-[#5945F1] hover:bg-[#EEF0FE] transition-colors ${post.following ? 'bg-[#EEF0FE]' : ''}`}>{post.following ? 'Following' : 'Follow'}</button>}
          <MoreMenu items={[{ label: 'Move to Drafts', onClick: () => onRemove(post.id, 'draft') }, { label: 'Delete', onClick: () => onRemove(post.id, 'delete'), danger: true }]} />
        </div>
      </header>

      <p className="text-[16px] leading-5 text-[#111827] mt-[18px]">{post.text}</p>
      {post.sentiment && (() => {
        const v = post.sentiment.view;
        const style = v === 'bullish' ? 'bg-[#e5f586] text-[#4d5d00]' : v === 'bearish' ? 'bg-[#ece9ff] text-[#5945F1]' : 'bg-[#f3f4f6] text-[#111827]';
        const Icon = v === 'bullish' ? ArrowUpRight : v === 'bearish' ? ArrowDownRight : ArrowRight;
        return (
          <p className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 mt-3 text-[13px] font-medium ${style}`}>
            <Icon className="w-4 h-4" aria-hidden />
            {v[0].toUpperCase() + v.slice(1)} on {post.sentiment.symbol}
            <span className="opacity-70 tabular-nums">{post.sentiment.price}</span>
          </p>
        );
      })()}
      {post.image && <img src={post.image} alt="" className="w-full rounded-lg mt-[15px]" loading="lazy" />}

      {media.length > 0 && (
        <div className="mt-[15px]">
          <div className="rounded-lg overflow-hidden bg-black">
            {media[slide]?.kind === 'video'
              ? <video key={media[slide].id} src={media[slide].url} controls playsInline preload="metadata" className="w-full max-h-[420px] object-contain bg-black" />
              : <img src={media[slide]?.url} alt={media[slide]?.name ?? ''} className="w-full max-h-[420px] object-contain bg-black" loading="lazy" />}
          </div>
          {media.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <button type="button" aria-label="Previous attachment" disabled={slide === 0} onClick={() => setSlide(slide - 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af]"><ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
              {media.map((m, i) => <button key={m.id} type="button" aria-label={`Attachment ${i + 1}`} aria-current={i === slide} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full ${i === slide ? 'bg-[#5945F1]' : 'bg-[#c9c4fb]'}`} />)}
              <button type="button" aria-label="Next attachment" disabled={slide === media.length - 1} onClick={() => setSlide(slide + 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af]"><ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
            </div>
          )}
        </div>
      )}

      {poll && (
        <section className="mt-[15px]" aria-label="Poll">
          <p className="flex items-center gap-2 text-[13px] text-[#6b7280] mb-2.5">
            <ChartNoAxesColumnIncreasing className="w-4 h-4 text-[#5945F1]" aria-hidden />
            Poll · {votes.toLocaleString()} {votes === 1 ? 'vote' : 'votes'}
          </p>
          <div className="space-y-1.5">
            {poll.options.map((o) => {
              const share = votes ? Math.round((o.votes / votes) * 100) : 0;
              const mine = poll.votedId === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={mine}
                  onClick={() => {
                    if (mine) return;
                    const was = poll.votedId;
                    onChange({
                      ...post,
                      poll: {
                        ...poll,
                        votedId: o.id,
                        options: poll.options.map((x) => ({ ...x, votes: x.votes + (x.id === o.id ? 1 : 0) - (was && x.id === was ? 1 : 0) })),
                      },
                    });
                    onToast(was ? 'Vote Changed' : 'Vote Counted', o.text);
                  }}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <span className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${mine ? 'bg-[#5945F1] border-[#5945F1]' : 'border-[#d0cbfb] group-hover:border-[#5945F1]'}`}>
                    {mine && <Check className="w-3 h-3 text-white" strokeWidth={3} aria-hidden />}
                  </span>
                  <span className="relative flex-1 min-w-0 h-[30px] rounded-md bg-[#f1f0fe] overflow-hidden">
                    <span style={{ width: `${share}%` }} className={`absolute inset-y-0 left-0 rounded-md transition-all ${mine ? 'bg-[#c7c0fb]' : 'bg-[#ddd9fd]'}`} aria-hidden />
                    <span className="relative flex items-center h-full px-3 text-[14px] text-[#111827] truncate">{o.text}</span>
                  </span>
                  <span className={`shrink-0 w-11 text-right text-[15px] font-bold tabular-nums ${mine ? 'text-[#5945F1]' : 'text-[#111827]'}`}>{share}%</span>
                  <span className="shrink-0 w-16 text-[12px] text-[#6b7280] tabular-nums">{o.votes} votes</span>
                </button>
              );
            })}
          </div>
          <p className="text-[12px] text-[#6b7280] mt-2.5">{poll.endsIn ? `Voting ends in ${poll.endsIn} · ` : ''}You can change your vote anytime</p>
        </section>
      )}

      <div className="flex items-center gap-6 mt-3.5 text-[#111827]">
        <button type="button" aria-pressed={!!post.liked} aria-label="Like" onClick={() => { set({ liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }); onToast(post.liked ? 'Like Removed' : 'Post Liked', post.liked ? `You unliked ${post.name}’s post` : `You liked ${post.name}’s post`); }} className={`${stat} ${post.liked ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}`}><Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />{fmt(post.likes)}</button>
        <span className={stat}><Eye className="w-4 h-4" />{post.views}</span>
        <button type="button" aria-expanded={showComments} aria-label="Comments" onClick={() => setShowComments((v) => !v)} className={`${stat} hover:text-[#5945F1]`}><MessageCircle className="w-4 h-4" />{post.comments.length + (post.commentBase ?? 0)}</button>
        <button type="button" aria-pressed={!!post.saved} aria-label="Save" onClick={() => { set({ saved: !post.saved, saves: post.saves + (post.saved ? -1 : 1) }); onToast(post.saved ? 'Removed from Saved' : 'Post Saved', post.saved ? 'No longer in your saved posts' : 'Find it on My Page'); }} className={`${stat} ${post.saved ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}`}><Bookmark className={`w-4 h-4 ${post.saved ? 'fill-current' : ''}`} />{post.saves}</button>
        <button type="button" onClick={share} className="flex items-center gap-2 rounded-full bg-[#f1f0fe] hover:bg-[#e6e2fd] px-3 py-1.5 text-[13px] text-[#111827] transition-colors">
          <Gift className="w-4 h-4 text-[#5945F1]" aria-hidden />Share to get +{shareCredits} free credits
        </button>
        <button type="button" aria-label="Share" onClick={share} className="ml-auto hover:text-[#5945F1]"><Share2 className="w-4 h-4" /></button>
      </div>

      {showComments && (
        <section className="mt-[17px]" aria-label="Comments">
          <div className="flex items-center justify-between mb-4"><h4 className="text-[17px] leading-6 text-[#5945F1]">Comments</h4><span className="text-sm text-[#6b7280]">{post.comments.length} Comments</span></div>
          <CommentThread comments={post.comments} me={me} onChange={(c) => set({ comments: c })} onToast={onToast} />
        </section>
      )}
    </Card>
  );
};
