import { ShowToast } from './Toast';
import { AiNote } from '../../ai/AiSection';
import { articleSummary } from '../../ai/aiFeature';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Facebook, Link2, Linkedin, Minus, Plus, Sparkles, TrendingUp, Twitter, Info } from 'lucide-react';
import { Avatar, Card, EmptyState, OutlineButton, PrimaryButton, Verified, BORDER, PreviewState } from './ui';
import { Article, CATEGORY_STYLE, CommentItem, IMG, READ_BODY, SEED_COMMENTS } from './data';
import { ArticleCard } from './ArticleCard';
import { CommentThread, Me } from './Comments';
import { MoreMenu } from './PostCard';

const bodyFor = (a: Article) =>
  a.id === 'a1'
    ? READ_BODY
    : [
        { h: 'Why this matters', p: [a.excerpt, 'Whatever the market is doing, the traders who last are the ones who work from a repeatable process instead of reacting to every candle.'] },
        { h: '1. Start with the setup', p: ['Write down what you expect to see, where the idea is wrong, and what you will do if price does something else. A plan you wrote before the trade is easier to follow than one you invent mid-move.'] },
        { h: '2. Size the position from the risk', p: ['Decide how much you are willing to lose first, then let the stop distance set the position size. This keeps every trade comparable and stops one bad idea from doing outsized damage.'] },
        { h: '3. Review what actually happened', p: ['Journal the result, including how you felt and whether you followed the plan. Patterns in your own behaviour usually teach more than a new indicator.'] },
        { h: 'Putting it together', p: ['Start small, measure honestly and adjust one thing at a time. This article is general education, not financial advice.'] },
      ];

/* ───────── Technical Snapshot ───────── */
const SNAPSHOTS = [
  { name: 'Bitcoin', pair: 'BTC/USD', price: '$108,420', change: '+2.41%', vol: '1.86×', pos: 74, mom: 'Price change +2.41%; 1-month return +8.90%. These periods can disagree.', badge: 'bg-[#f7931a]', mark: '₿' },
  { name: 'Ethereum', pair: 'ETH/USD', price: '$4,210', change: '+1.18%', vol: '1.32×', pos: 61, mom: 'Price change +1.18%; 1-month return +4.20%. Momentum is positive but less broad.', badge: 'bg-[#627eea]', mark: 'Ξ' },
  { name: 'Gold', pair: 'XAU/USD', price: '$2,890', change: '+0.24%', vol: '1.05×', pos: 52, mom: 'Price change +0.24%; 1-month return +1.10%. Moves have been small and mixed.', badge: 'bg-[#e0a800]', mark: 'Au' },
];

const SnapshotCard: React.FC<{ onDetails: () => void }> = ({ onDetails }) => {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(true);
  const s = SNAPSHOTS[i];
  return (
    <Card className="p-3.5 text-[#0b1c30]">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-medium"><Sparkles className="w-3.5 h-3.5 text-[#5945F1]" />Technical Snapshot</h3>
        <button type="button" aria-expanded={open} aria-label={open ? 'Collapse snapshot' : 'Expand snapshot'} onClick={() => setOpen(!open)} className="text-[#5945F1]">{open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
      </div>
      {open && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full ${s.badge} text-white text-xs font-bold flex items-center justify-center`}>{s.mark}</span>
            <div className="leading-tight"><p className="text-sm font-semibold">{s.name}</p><p className="text-[10px] text-[#64748b]">{s.pair}</p></div>
            <button type="button" onClick={onDetails} className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#5945F1] hover:underline">View Details <ArrowRight className="w-3 h-3" /></button>
          </div>
          <p className="text-[10px] text-[#64748b] leading-snug mt-2">Example instrument related to this article, not a signal for the article as a whole.</p>
          <div className={`mt-2 border ${BORDER} rounded-lg p-2 flex items-end justify-between`}>
            <div><p className="text-[9px] text-[#64748b]">Illustrative Price</p><p className="text-lg font-semibold">{s.price}</p></div>
            <svg viewBox="0 0 60 24" className="w-14 h-6" aria-hidden="true"><path d="M0 20 L8 16 L14 18 L22 10 L30 14 L38 7 L46 11 L54 4 L60 6" fill="none" stroke="#7da800" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className={`border ${BORDER} rounded-lg p-2`}><p className="text-[9px] text-[#64748b]">24h change</p><p className="flex items-center gap-1.5 text-sm font-semibold"><span className="w-5 h-5 rounded-full bg-[#caeb0e] flex items-center justify-center"><ArrowUpRight className="w-3 h-3 text-[#1f2a00]" /></span>{s.change}</p></div>
            <div className={`border ${BORDER} rounded-lg p-2`}><p className="text-[9px] text-[#64748b]">Rel. Volume</p><p className="flex items-center gap-1.5 text-sm font-semibold">{s.vol}<span className="flex items-end gap-0.5 h-4 ml-auto" aria-hidden="true">{[5, 8, 11, 15].map((h) => <span key={h} style={{ height: h }} className="w-1 bg-[#caeb0e] rounded-sm" />)}</span></p></div>
          </div>
          <div className="mt-3 rounded-lg bg-[#f6f5ff] p-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#5945F1] tracking-wide"><TrendingUp className="w-3 h-3" />PRICE MOMENTUM</p>
            <p className="text-[10px] text-[#64748b] leading-snug mt-1">{s.mom}</p>
            <div className="flex h-2 rounded-full overflow-hidden mt-2" role="img" aria-label={`${s.pos}% positive, ${100 - s.pos}% negative`}><span style={{ width: `${s.pos}%` }} className="bg-[#caeb0e]" /><span style={{ width: `${100 - s.pos}%` }} className="bg-[#5945F1]" /></div>
            <div className="flex justify-between text-[9px] mt-1"><span className="text-[#5f7a00] font-semibold">{s.pos}% positive</span><span className="text-[#5945F1] font-semibold">{100 - s.pos}% negative</span></div>
          </div>
          <p className="flex items-center gap-1 text-[9px] text-[#64748b] mt-2"><Info className="w-3 h-3" />Evidence, not an instruction or live quote</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-[#5945F1]">
            <button type="button" aria-label="Previous instrument" onClick={() => setI((i + SNAPSHOTS.length - 1) % SNAPSHOTS.length)} className="text-xs">‹</button>
            {SNAPSHOTS.map((_, k) => <span key={k} className={`rounded-full ${k === i ? 'w-2 h-2 bg-[#5945F1]' : 'w-1.5 h-1.5 bg-[#ABA1F8]'}`} />)}
            <button type="button" aria-label="Next instrument" onClick={() => setI((i + 1) % SNAPSHOTS.length)} className="text-xs">›</button>
          </div>
        </div>
      )}
    </Card>
  );
};

/* ───────── Share rail ───────── */
const ShareRail: React.FC<{ title: string; onToast: ShowToast }> = ({ title, onToast }) => {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const open = (u: string) => { window.open(u, '_blank', 'noopener,noreferrer,width=600,height=500'); onToast('Share Opened', title); };
  const btn = 'w-9 h-9 flex items-center justify-center text-[#0b1c30] hover:text-[#5945F1] hover:bg-[#EEF0FE] rounded-lg transition-colors';
  return (
    <Card className="p-1.5 flex flex-row lg:flex-col gap-0.5 w-fit">
      <button type="button" aria-label="Share on X" className={btn} onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)}><Twitter className="w-4 h-4" /></button>
      <button type="button" aria-label="Share on Facebook" className={btn} onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}><Facebook className="w-4 h-4" /></button>
      <button type="button" aria-label="Share on LinkedIn" className={btn} onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}><Linkedin className="w-4 h-4" /></button>
      <button type="button" aria-label="Copy link" className={btn} onClick={async () => { try { await navigator.clipboard.writeText(url); onToast('Link Copied', title); } catch { onToast('Could Not Copy', 'Copy the link from the address bar'); } }}><Link2 className="w-4 h-4" /></button>
    </Card>
  );
};

/* ───────── Sign-in gate (signed out) ───────── */
const SignInGate: React.FC<{ onAuth: (mode: 'signin' | 'signup') => void }> = ({ onAuth }) => (
  <div className="relative -mt-40 pt-40 text-center">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fbfbff]/90 to-[#fbfbff] backdrop-blur-[3px] pointer-events-none" aria-hidden="true" />
    <div className="relative max-w-[250px] mx-auto pb-10">
      <h3 className="font-display text-base font-medium text-[#5945F1]">Sign In to MarketSyde</h3>
      <p className="text-[11px] text-[#64748b] mt-1">Enter your email below to log in to your account</p>
      <div className="mt-3 space-y-2">
        {['Google', 'Facebook', 'Apple'].map((p) => (
          <button key={p} type="button" onClick={() => onAuth('signin')} className={`w-full bg-white border ${BORDER} rounded-lg py-2 text-xs font-medium text-[#0b1c30] hover:bg-[#EEF0FE] transition-colors`}>{p}</button>
        ))}
      </div>
      <p className="text-[11px] text-[#64748b] mt-3">New to our platform? <button type="button" onClick={() => onAuth('signup')} className="text-[#5945F1] underline">Create account</button></p>
    </div>
  </div>
);

/* ───────── Credit modal ───────── */
const CreditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="credit-title" className="fixed inset-0 z-50 bg-[#1a1440]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-[320px] bg-white rounded-2xl shadow-2xl px-6 pt-5 pb-6 text-center" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute top-3 right-4 text-[#64748b] hover:text-[#0b1c30] text-lg leading-none">×</button>
        <img src={IMG.creditBox} alt="" className="w-32 h-auto mx-auto" />
        <h2 id="credit-title" className="font-display text-2xl text-[#c026d3] mt-1">Yay!</h2>
        <p className="text-xs text-[#64748b] mt-2 leading-relaxed">You earned <b className="text-[#c026d3]">5 credits</b> for finish reading the article. Way to go!</p>
        <PrimaryButton ref={btn} onClick={onClose} className="w-full mt-5">Nice!</PrimaryButton>
      </div>
    </div>
  );
};

interface Props {
  article: Article;
  others: Article[];
  state: PreviewState;
  signedIn: boolean;
  me: Me;
  alreadyRewarded: boolean;
  onBack: () => void;
  onOpen: (id: string) => void;
  onReward: () => void;
  onAuth: (mode: 'signin' | 'signup') => void;
  onToggleFollow: () => void;
  onToggle: (id: string, key: 'liked' | 'saved') => void;
  onToast: ShowToast;
  onNavigate: (tab: string) => void;
  onRetry: () => void;
}

export const ArticleRead: React.FC<Props> = ({ article: a, others, state, signedIn, me, alreadyRewarded, onBack, onOpen, onReward, onAuth, onToggleFollow, onToggle, onToast, onNavigate, onRetry }) => {
  const [comments, setComments] = useState<CommentItem[]>(SEED_COMMENTS.slice(0, 3));
  const [credit, setCredit] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const error = state === 'error';
  const gated = !signedIn;
  const body = bodyFor(a);
  const visible = gated ? body.slice(0, 1) : body;

  useEffect(() => { window.scrollTo({ top: 0 }); }, [a.id]);
  // Reward once the reader scrolls down to the end of the article body.
  useEffect(() => {
    if (!signedIn || error || alreadyRewarded) return;
    const check = () => {
      const el = sentinel.current;
      if (el && el.getBoundingClientRect().top < window.innerHeight) { window.removeEventListener('scroll', check); onReward(); setCredit(true); }
    };
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [a.id, signedIn, error, alreadyRewarded, onReward]);

  return (
    <div className="max-w-[1000px] mx-auto">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-[#0b1c30] hover:text-[#5945F1] mb-5"><ArrowLeft className="w-4 h-4" />View All Articles</button>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,660px)_220px] gap-x-8 justify-center">
        <article className="min-w-0">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${a.category === 'Trading Strategy' ? 'bg-[#ffe0f3] text-[#d3139f]' : CATEGORY_STYLE[a.category]}`}>{a.category}</span>
          <h1 className="font-display text-3xl sm:text-[34px] leading-tight text-[#0b1c30] mt-3">{a.title}</h1>
          <p className="text-[15px] text-[#64748b] leading-relaxed mt-3">Exploring the key trends, principles and opportunities that will shape how traders work in the years ahead.</p>
          <div className="flex items-center gap-2 mt-5 text-sm">
            <Avatar src={a.avatar} alt={a.author} size={32} /><span className="font-semibold text-[#0b1c30]">{a.author}</span><Verified />
            <span className="text-[#64748b] text-[13px] truncate">{a.handle} · 8 min read</span>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {!a.own && <OutlineButton aria-pressed={!!a.following} onClick={() => { onToggleFollow(); onToast(a.following ? 'Unfollowed' : 'Following', a.author); }}>{a.following ? 'Following' : 'Follow'}</OutlineButton>}
              <MoreMenu items={[{ label: 'Copy link', onClick: async () => { try { await navigator.clipboard.writeText(window.location.href); onToast('Link Copied', a.title); } catch { onToast('Could Not Copy', 'Copy the link from the address bar'); } } }, { label: 'Report', onClick: () => onToast('Report Sent', 'Thanks, we will review this article') }]} />
            </div>
          </div>

          {error ? (
            <EmptyState error image={IMG.emptyError} title="Article Has Failed to Load" text="Article is still there. Refresh to catch up." className="py-20" imgClass="w-48" />
          ) : (
            <>
              <img src={a.cover} alt="" className="w-full rounded-xl mt-6" />
              {!gated && (() => { const n = articleSummary({ headline: a.title, excerpt: a.excerpt, content: body.flatMap((s) => s.p), tags: [a.category], source: a.author, readTime: '8 min' }); return <AiNote title={n.title} lines={n.lines} footnote={n.footnote} className="mt-5" />; })()}
              <div className={`mt-6 space-y-5 ${gated ? 'select-none' : ''}`}>
                {visible.map((s, i) => (
                  <section key={i}>
                    {s.h && <h2 className="text-[15px] font-bold text-[#0b1c30] mb-2">{s.h}</h2>}
                    {s.p.map((p, j) => <p key={j} className={`text-sm text-[#0b1c30] leading-relaxed mb-3 last:mb-0 ${gated && j > 0 ? 'blur-[2.5px]' : ''}`}>{p}</p>)}
                  </section>
                ))}
              </div>
              {gated && <SignInGate onAuth={onAuth} />}
              <div ref={sentinel} aria-hidden="true" className="h-px" />
              {!gated && (
                <section className={`mt-10 pt-6 border-t ${BORDER}`} aria-label="Comments">
                  <div className="flex items-center justify-between mb-3"><h2 className="text-sm text-[#5945F1]">Comments</h2><span className="text-xs text-[#64748b]">{comments.length} Replies</span></div>
                  <CommentThread comments={comments} me={me} max={500} multiline onChange={setComments} onToast={onToast} />
                </section>
              )}
            </>
          )}

          <section className={`mt-10 pt-6 ${error ? `border-t ${BORDER}` : ''}`} aria-label="More articles">
            <div className="flex items-center justify-between mb-4"><h2 className="text-sm text-[#5945F1]">More Articles</h2><button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#0b1c30] hover:text-[#5945F1]">View All <ArrowRight className="w-4 h-4" /></button></div>
            {error
              ? <><EmptyState error image={IMG.emptyError} title="Articles Have Failed to Load" text="Articles are still there. Refresh to catch up." className="py-10" imgClass="w-40" /><div className="text-center"><PrimaryButton onClick={onRetry}>Refresh</PrimaryButton></div></>
              : <div className="grid sm:grid-cols-2 gap-5">{others.slice(0, 2).map((o) => <ArticleCard key={o.id} article={o} signedIn={signedIn} onOpen={() => onOpen(o.id)} onToggle={(k) => onToggle(o.id, k)} onMenu={() => onToast('Open the Article', 'Manage it from the article page')} onShare={() => onToast('Link Copied', o.title)} />)}</div>}
          </section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <ShareRail title={a.title} onToast={onToast} />
            {!error && <SnapshotCard onDetails={() => onNavigate('signals')} />}
          </div>
        </aside>
        {!error && <div className="lg:hidden mt-8 space-y-4"><ShareRail title={a.title} onToast={onToast} /><SnapshotCard onDetails={() => onNavigate('signals')} /></div>}
      </div>
      {credit && <CreditModal onClose={() => setCredit(false)} />}
    </div>
  );
};
