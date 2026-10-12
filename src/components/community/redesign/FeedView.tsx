import { ShowToast } from './Toast';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChartNoAxesColumnIncreasing, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Drama, Image as ImageIcon, Plus, Send, X } from 'lucide-react';
import { Avatar, Card, EmptyState, PrimaryButton, BORDER, PreviewState } from './ui';
import { FeedPost, IMG, STATE_COPY, STORIES, SUGGESTED, SuggestIcon } from './data';
import { PostCard } from './PostCard';
import { Me } from './Comments';
import { SuggestIconBadge } from './Sidebars';

/* ───────── Stories ───────── */
/** One story tile: the short plays in place, muted and looping, with the still as its poster. */
const StoryTile: React.FC<{ story: typeof STORIES[number]; last: boolean; onOpen: () => void }> = ({ story, last, onOpen }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((e) => e.forEach((x) => (x.isIntersecting ? v.play().catch(() => {}) : v.pause())), { threshold: 0.25 });
    io?.observe(v);
    v.play().catch(() => {});
    return () => io?.disconnect();
  }, []);
  return (
    <button type="button" onClick={onOpen} aria-label={`Open story: ${story.title}, ${story.time}`} className={`relative shrink-0 ${last ? 'w-[119px]' : 'w-[127.3px]'} h-[227px] rounded-lg overflow-hidden border ${BORDER} hover:brightness-110 transition`}>
      <video ref={ref} poster={story.image} muted loop playsInline preload="metadata" aria-hidden="true" className="w-full h-full object-cover">
        <source src={story.videoWebm} type="video/webm" />
        <source src={story.video} type="video/mp4" />
      </video>
    </button>
  );
};

export const StoriesRow: React.FC<{ state?: PreviewState; onAdd: () => void; onToast: ShowToast }> = ({ state, onAdd, onToast }) => {
  const [open, setOpen] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const player = useRef<HTMLVideoElement>(null);
  const close = () => { setOpen(null); setProgress(0); };
  const go = (i: number) => { setProgress(0); setOpen(i); };

  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' && open < STORIES.length - 1) go(open + 1);
      if (e.key === 'ArrowLeft' && open > 0) go(open - 1);
      if (e.key === ' ') { e.preventDefault(); const v = player.current; if (v) (v.paused ? v.play().catch(() => {}) : v.pause()); }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);

  const blank = state === 'empty';
  const failed = state === 'error';
  return (
    <section aria-label="Stories">
      <h2 className="relative -top-1 text-[20px] leading-7 text-[#111827] mb-0.5">Stories</h2>
      <div className="flex gap-[8.67px] overflow-x-auto no-scrollbar">
        <button type="button" onClick={onAdd} className="relative shrink-0 w-[128px] h-[227px] rounded-lg bg-[#efecff] overflow-hidden flex flex-col items-center justify-center gap-2.5 text-[14px] text-[#111827] hover:bg-[#e8e4ff] transition-colors">
          <span className="absolute -top-5 -right-6 w-20 h-20 rounded-full bg-[#cfc8fb]" aria-hidden="true" />
          <span className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-[#cfc8fb]" aria-hidden="true" />
          <span className="relative w-10 h-10 rounded-full bg-[#5945F1] text-white flex items-center justify-center"><Plus className="w-4 h-4" /></span>
          <span className="relative">Add to Story</span>
        </button>
        {blank || failed ? (
          <EmptyState
            error={failed}
            image={failed ? IMG.errStories : IMG.emptyStories}
            {...(failed ? STATE_COPY.storiesError : STATE_COPY.storiesEmpty)}
            className="flex-1 min-h-[227px] justify-start pt-[62px]"
            imgClass={failed ? 'w-[122px]' : 'w-[143px]'}
          />
        ) : (
          STORIES.map((s, i) => (
            <StoryTile key={s.id} story={s} last={i === STORIES.length - 1} onOpen={() => { go(i); onToast('Story Opened', s.title); }} />
          ))
        )}
      </div>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={STORIES[open].title} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={close}>
          <div className="relative h-[80vh] max-h-[640px] aspect-[9/16] rounded-2xl overflow-hidden bg-black" onClick={(e) => e.stopPropagation()}>
            <video
              key={STORIES[open].id}
              ref={player}
              poster={STORIES[open].image}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              onTimeUpdate={(e) => { const v = e.currentTarget; setProgress(v.duration ? v.currentTime / v.duration : 0); }}
              onEnded={() => (open < STORIES.length - 1 ? go(open + 1) : close())}
            >
              <source src={STORIES[open].videoWebm} type="video/webm" />
              <source src={STORIES[open].video} type="video/mp4" />
            </video>
            <div className="absolute top-2 left-2 right-2 flex gap-1" aria-hidden="true">
              {STORIES.map((_, i) => (
                <span key={i} className="h-0.5 flex-1 rounded-full bg-white/40 overflow-hidden">
                  <span className="block h-full bg-white" style={{ width: i < open ? '100%' : i === open ? `${Math.round(progress * 100)}%` : '0%' }} />
                </span>
              ))}
            </div>
            <button type="button" aria-label="Close story" onClick={close} className="absolute top-5 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
            {open > 0 && <button type="button" aria-label="Previous story" onClick={() => go(open - 1)} className="absolute left-2 top-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>}
            {open < STORIES.length - 1 && <button type="button" aria-label="Next story" onClick={() => go(open + 1)} className="absolute right-2 top-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>}
          </div>
        </div>
      )}
    </section>
  );
};

/* ───────── Composer ───────── */
/** The feed composer: a preview of the box. Any control opens the Create Post modal. */
export const Composer: React.FC<{ me: Me; onOpenCreate: (intent?: 'text' | 'media' | 'poll') => void; heading?: string }> = ({ me, onOpenCreate, heading = 'Your Feed' }) => {
  const btn = `flex items-center gap-2 h-9 border ${BORDER} text-[#5945F1] hover:bg-[#EEF0FE] rounded-lg text-[14px] font-medium px-4 transition-colors`;
  return (
    <section aria-label={heading || 'Write a post'}>
      {heading && <h2 className="text-[20px] leading-7 text-[#111827] mb-1.5">{heading}</h2>}
      <Card className="p-4">
        <div className="flex gap-2.5">
          <Avatar src={me.avatar} alt={me.name} size={38} />
          <button
            type="button"
            onClick={() => onOpenCreate('text')}
            className={`flex-1 min-w-0 h-[60px] border ${BORDER} rounded-lg px-3 py-2 text-left text-[14px] leading-5 text-[#cbd5e1] hover:border-[#5945F1] transition-colors`}
          >
            What&apos;s on your mind, {me.name}?
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button type="button" onClick={() => onOpenCreate('media')} className={btn}><ImageIcon className="w-4 h-4" />Photo / Video</button>
          <button type="button" onClick={() => onOpenCreate('poll')} className={btn}><ChartNoAxesColumnIncreasing className="w-4 h-4" />Poll</button>
          <PrimaryButton onClick={() => onOpenCreate('text')} className="ml-auto flex items-center gap-2 !h-9 !px-4 !text-[14px] !font-medium"><Send className="w-4 h-4" />Post</PrimaryButton>
        </div>
      </Card>
    </section>
  );
};

/* ───────── Suggested list with pagination ───────── */
const PAGES = 20;

export const BackLink: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-2.5 text-[15px] text-[#111827] hover:text-[#5945F1] mb-[29px]"><ArrowLeft className="w-4 h-4" />View feed</button>
);

export const SuggestedView: React.FC<{ onBack: () => void; onOpenTopic: (title: string) => void; onToast: ShowToast }> = ({ onBack, onOpenTopic, onToast }) => {
  const [page, setPage] = useState(1);
  const go = (n: number) => { setPage(n); onToast('Page Changed', `Showing page ${n} of ${PAGES}`); };
  const list = page % 2 ? SUGGESTED : [...SUGGESTED].reverse();
  const pager: (number | '…')[] = [1, 2, '…', PAGES];
  const pb = (disabled: boolean) => `w-11 h-11 rounded-lg border ${BORDER} flex items-center justify-center ${disabled ? 'text-[#c1bbf8] bg-[#f8f8ff]' : 'text-[#5945F1] bg-[#f8f8ff] hover:bg-[#EEF0FE]'}`;
  return (
    <div>
      <BackLink onClick={onBack} />
      <div className={`border-b ${BORDER}`}>
        <span className={`inline-block border ${BORDER} border-b-transparent bg-[#fbfbff] rounded-t-lg px-4 py-2 text-[16px] font-semibold text-[#5945F1] -mb-px`}>Suggested for You</span>
      </div>
      <ul className="mt-[38px] space-y-4">
        {list.map((s) => (
          <li key={s.title}>
            <button type="button" onClick={() => onOpenTopic(s.title)} className={`w-full h-[68px] flex items-center gap-3 bg-white border-b ${BORDER} rounded-lg px-4 text-left hover:bg-[#faf9ff] transition-colors`}>
              <SuggestIconBadge icon={s.icon} size={36} />
              <span className="min-w-0"><span className="block text-[15px] leading-5 text-[#111827] truncate">{s.title}</span><span className="block text-xs leading-4 text-[#6b7280]">{s.comments} comments</span></span>
            </button>
          </li>
        ))}
      </ul>
      <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-[23px]">
        <button type="button" aria-label="First page" disabled={page === 1} onClick={() => go(1)} className={pb(page === 1)}><ChevronFirst className="w-[18px] h-[18px]" /></button>
        <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => go(page - 1)} className={pb(page === 1)}><ChevronLeft className="w-[18px] h-[18px]" /></button>
        {pager.map((p, i) => p === '…'
          ? <span key={i} className={`${pb(false)} select-none`} aria-hidden="true">…</span>
          : <button key={i} type="button" aria-current={page === p} onClick={() => go(p)} className={`${pb(false)} text-[17px] ${page === p ? '!bg-white font-semibold' : ''}`}>{p}</button>)}
        <button type="button" aria-label="Next page" disabled={page === PAGES} onClick={() => go(Math.min(PAGES, page + 1))} className={pb(page === PAGES)}><ChevronRight className="w-[18px] h-[18px]" /></button>
        <button type="button" aria-label="Last page" disabled={page === PAGES} onClick={() => go(PAGES)} className={pb(page === PAGES)}><ChevronLast className="w-[18px] h-[18px]" /></button>
      </nav>
    </div>
  );
};

/** One suggested topic opened as its own discussion. */
export const TopicHeader: React.FC<{ title: string; icon: SuggestIcon }> = ({ title, icon }) => (
  <div className={`flex items-center gap-4 pb-[14px] border-b ${BORDER}`}>
    <SuggestIconBadge icon={icon} size={36} />
    <h1 className="text-[26px] leading-8 font-semibold text-[#111827] min-w-0 truncate">{title}</h1>
  </div>
);

/* ───────── Feed posts ───────── */
export const FeedList: React.FC<{ posts: FeedPost[]; state?: PreviewState; openFirstComments?: boolean; me: Me; onChange: (p: FeedPost) => void; onRemove: (id: string, mode: 'delete' | 'draft') => void; onShare?: (id: string, who: string) => void; onToast: ShowToast }> = ({ posts, state, openFirstComments, me, onChange, onRemove, onShare, onToast }) => {
  if (state === 'error') return <EmptyState error image={IMG.errFeed} {...STATE_COPY.feedError} className="pt-[163px] pb-24" imgClass="w-[198px]" />;
  if (state === 'empty' || posts.length === 0) return <EmptyState image={IMG.emptyQuiet} {...STATE_COPY.feedEmpty} className="pt-[168px] pb-24" imgClass="w-[213px]" />;
  return <div className="space-y-6">{posts.map((p, i) => <PostCard key={p.id} post={p} openComments={!!openFirstComments && i === 0} me={me} onChange={onChange} onRemove={onRemove} onShare={onShare} onToast={onToast} />)}</div>;
};
