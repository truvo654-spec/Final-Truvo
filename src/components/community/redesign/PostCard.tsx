import React, { useEffect, useRef, useState } from 'react';
import { Bookmark, Eye, Heart, MessageCircle, MoreVertical, Share2 } from 'lucide-react';
import { HashtagLink } from '../../hashtag/HashtagText';
import { Avatar, Card, Verified, BORDER } from './ui';
import { CommentThread, Me } from './Comments';
import { FeedPost } from './data';

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
  onToast: (m: string) => void;
}

export const PostCard: React.FC<Props> = ({ post, openComments, me, onChange, onRemove, onToast }) => {
  const [showComments, setShowComments] = useState(!!openComments);
  const set = (patch: Partial<FeedPost>) => onChange({ ...post, ...patch });
  const share = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`); onToast('Link copied'); } catch { onToast('Could not copy the link here'); }
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
          {!post.own && <button type="button" aria-pressed={!!post.following} onClick={() => { set({ following: !post.following }); onToast(post.following ? `Unfollowed ${post.name}` : `You are now following ${post.name}`); }} className={`h-8 w-[68px] rounded-lg border ${BORDER} text-[14px] text-[#5945F1] hover:bg-[#EEF0FE] transition-colors ${post.following ? 'bg-[#EEF0FE]' : ''}`}>{post.following ? 'Following' : 'Follow'}</button>}
          <MoreMenu items={[{ label: 'Move to Drafts', onClick: () => onRemove(post.id, 'draft') }, { label: 'Delete', onClick: () => onRemove(post.id, 'delete'), danger: true }]} />
        </div>
      </header>

      <p className="text-[16px] leading-5 text-[#111827] mt-[18px]">{post.text}</p>
      {post.image && <img src={post.image} alt="" className="w-full rounded-lg mt-[15px]" loading="lazy" />}
      <p className="flex flex-wrap gap-x-2 gap-y-1 mt-[15px] text-[13px] leading-5 text-[#5945F1]">{post.tags.map((t) => <HashtagLink key={t} tag={t} />)}</p>

      <div className="flex items-center gap-6 mt-3.5 text-[#111827]">
        <button type="button" aria-pressed={!!post.liked} aria-label="Like" onClick={() => set({ liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) })} className={`${stat} ${post.liked ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}`}><Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />{fmt(post.likes)}</button>
        <span className={stat}><Eye className="w-4 h-4" />{post.views}</span>
        <button type="button" aria-expanded={showComments} aria-label="Comments" onClick={() => setShowComments((v) => !v)} className={`${stat} hover:text-[#5945F1]`}><MessageCircle className="w-4 h-4" />{post.comments.length + (post.commentBase ?? 0)}</button>
        <button type="button" aria-pressed={!!post.saved} aria-label="Save" onClick={() => { set({ saved: !post.saved, saves: post.saves + (post.saved ? -1 : 1) }); onToast(post.saved ? 'Removed from saved posts' : 'Saved to your posts'); }} className={`${stat} ${post.saved ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}`}><Bookmark className={`w-4 h-4 ${post.saved ? 'fill-current' : ''}`} />{post.saves}</button>
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
