import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, BarChart3, BookOpen, Bookmark, ChevronRight, Clock, Crown, Gem, History, Info, LineChart, List, Newspaper, PenLine, Pencil, ScrollText, ShieldCheck, TriangleAlert, Check, X, Plus } from 'lucide-react';
import { HashtagLink } from '../../hashtag/HashtagText';
import { Card, CardTitle, Dots, EmptyState, OutlineButton, PrimaryButton, BORDER, PreviewState } from './ui';
import { ARTICLE_FILTERS, COURSES, CONTRIBUTORS, DEFAULT_INTERESTS, IMG, INTEREST_STYLES, KEY_TOPICS, SIGNALS, STATE_COPY, SUGGESTED, SuggestIcon } from './data';
import { ShowToast } from './Toast';

const suggestIcon: Record<SuggestIcon, { icon: React.ElementType | null; bg: string; fg: string }> = {
  btc: { icon: null, bg: 'bg-[#f7931a]', fg: 'text-white' },
  chart: { icon: LineChart, bg: 'bg-[#EEF0FE]', fg: 'text-[#5945F1]' },
  shield: { icon: ShieldCheck, bg: 'bg-[#EEF0FE]', fg: 'text-[#5945F1]' },
  alert: { icon: TriangleAlert, bg: 'bg-[#fff1e0]', fg: 'text-[#e8740c]' },
  crown: { icon: Crown, bg: 'bg-[#fff1e0]', fg: 'text-[#e8740c]' },
};

export const SuggestIconBadge: React.FC<{ icon: SuggestIcon; size?: number }> = ({ icon, size = 28 }) => {
  const s = suggestIcon[icon];
  const Icon = s.icon;
  return (
    <span style={{ width: size, height: size }} className={`rounded-full ${s.bg} ${s.fg} flex items-center justify-center shrink-0 font-bold`}>
      {Icon ? <Icon className="w-[55%] h-[55%]" /> : <span style={{ fontSize: size * 0.55 }}>₿</span>}
    </span>
  );
};

const fail = (state?: PreviewState) => state === 'error';
const blank = (state?: PreviewState) => state === 'empty';

/* ───────── Key Topics Discussions (hashtags) ───────── */
export const KeyTopicsCard: React.FC<{ state?: PreviewState }> = ({ state }) => (
  <Card className={`p-4 ${state === 'default' || !state ? '' : 'h-[641px]'}`}>
    <CardTitle className="mb-[14px]">Key Topics Discussions</CardTitle>
    {fail(state) ? (
      <EmptyState error image={IMG.errDiscussion} {...STATE_COPY.topicsError} className="pt-[205px]" />
    ) : blank(state) ? (
      <EmptyState image={IMG.emptyDebates} {...STATE_COPY.topicsEmpty} className="pt-[197px]" />
    ) : (
      <ol>
        {KEY_TOPICS.map((t, i, a) => (
          <li key={t.tag} className={`flex items-center gap-2 ${i < a.length - 1 ? `h-14 border-b ${BORDER}` : 'h-14'}`}>
            <span className="w-6 h-6 rounded-full bg-[#EEF0FE] text-[#5945F1] text-xs flex items-center justify-center shrink-0">{i + 1}</span>
            <HashtagLink tag={t.tag} className="text-[14px] text-[#111827] flex-1 truncate" />
            <span className="text-[14px] text-[#6b7280] shrink-0">{t.posts} posts</span>
            <HashtagLink tag={t.tag} className="w-6 h-6 rounded-full bg-[#dcec82] text-[#4d5d00] flex items-center justify-center shrink-0 no-underline hover:no-underline"><ArrowUpRight className="w-3 h-3" /></HashtagLink>
          </li>
        ))}
      </ol>
    )}
  </Card>
);

/* ───────── Suggested for You (carousel of 5) ───────── */
export const SuggestedCard: React.FC<{ state?: PreviewState; onOpen: () => void; onOpenTopic: (title: string) => void }> = ({ state, onOpen, onOpenTopic }) => {
  const [page, setPage] = useState(0);
  const pages = 2;
  const items = SUGGESTED.slice(page * 5, page * 5 + 5);
  return (
    <Card className={`px-4 pt-5 pb-2.5 ${blank(state) ? 'h-[450px]' : ''}`}>
      <div className="flex items-center justify-between mb-5">
        <CardTitle>Suggested for You</CardTitle>
        <button type="button" onClick={onOpen} aria-label="View all suggestions" className="text-[#0b1c30] hover:text-[#5945F1]"><ArrowRight className="w-4 h-4" /></button>
      </div>
      {blank(state) ? (
        <EmptyState image={IMG.emptyDebates} {...STATE_COPY.suggestedEmpty} className="pt-[108px]" />
      ) : (
        <>
          <ul>
            {items.map((s, i, a) => (
              <li key={s.title} className={i < a.length - 1 ? `border-b ${BORDER}` : ''}>
                <button type="button" onClick={() => onOpenTopic(s.title)} className="w-full h-[67px] flex items-center gap-3 text-left">
                  <SuggestIconBadge icon={s.icon} size={36} />
                  <span className="min-w-0"><span className="block text-[15px] leading-5 text-[#111827] truncate">{s.title}</span><span className="block text-xs leading-4 text-[#6b7280]">{s.comments} comments</span></span>
                </button>
              </li>
            ))}
          </ul>
          <Dots count={pages} index={page} onChange={setPage} className="h-6 mt-3" />
        </>
      )}
    </Card>
  );
};

/* ───────── Top Article Contributors ───────── */
export const ContributorsCard: React.FC<{ state?: PreviewState; onOpenArticles?: () => void }> = ({ state, onOpenArticles }) => (
  <Card className={`p-4 ${fail(state) ? 'h-[424px]' : ''}`}>
    <CardTitle className="mb-[23px]">Top Article Contributors</CardTitle>
    {fail(state) ? (
      <EmptyState error image={IMG.errContributors} {...STATE_COPY.contributorsError} className="pt-[88px]" />
    ) : (
      <ol>
        {CONTRIBUTORS.map((c, i, a) => (
          <li key={c.name} className={i < a.length - 1 ? `border-b ${BORDER}` : ''}>
            <button type="button" onClick={onOpenArticles} className="w-full h-[68px] flex items-center gap-4 text-left">
              <span className={`w-9 h-9 rounded-full text-xs flex items-center justify-center shrink-0 ${c.badge}`}>{c.rank}</span>
              <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              <span className="min-w-0"><span className={`block text-[16px] leading-6 ${c.rank <= 3 ? 'font-semibold' : ''} ${c.color}`}>{c.name}</span><span className="block text-xs leading-5 text-[#6b7280]">{c.articles} Articles</span></span>
            </button>
          </li>
        ))}
      </ol>
    )}
  </Card>
);

/* ───────── Most Recent Signals ───────── */
export const SignalsCard: React.FC<{ state?: PreviewState; onSignals: () => void; onUpgrade: () => void }> = ({ state, onSignals, onUpgrade }) => {
  const [page, setPage] = useState(0);
  return (
    <div>
      <div className={`bg-[#f1f3f7] rounded-2xl px-4 pt-[14px] pb-[9px] shadow-[0_2px_10px_rgba(89,69,241,0.07)] ${fail(state) ? 'h-[352px]' : ''}`}>
        <div className="flex items-start justify-between">
          <h3 className="text-[18.5px] leading-6 font-medium text-[#111827]">Most Recent <span className="text-[#5945F1] font-semibold">Signals</span><span className="inline-block w-[5px] h-[5px] bg-[#fd02b0] ml-px" aria-hidden="true" /></h3>
          <button type="button" onClick={onSignals} className="flex items-center text-sm font-medium text-[#111827] hover:text-[#5945F1]">More <ChevronRight className="w-4 h-4" /></button>
        </div>
        <p className="text-[13px] leading-4 text-[#6b7280] mt-[3px] -mb-0.5">View most recent signals for your trading</p>
        {fail(state) ? (
          <EmptyState error image={IMG.errSignals} {...STATE_COPY.signalsError} className="pt-[52px]" imgClass="w-[168px]" />
        ) : (
          <ul>
            {SIGNALS.map((s, i) => (
              <li key={s.name} className={`flex items-center gap-2 h-[60px] ${i ? `border-t ${BORDER}` : ''}`}>
                <img src={s.icon} alt="" className="w-8 h-8 object-contain shrink-0" />
                <div className={s.action === 'Upgrade' ? 'flex-1 min-w-0' : 'w-[75px] shrink-0'}>
                  <p className="text-[14px] leading-5 text-[#111827]">{s.name}</p>
                  {s.action === 'Upgrade'
                    ? <p className="flex items-center gap-1 text-xs font-medium text-[#fd02b0] whitespace-nowrap"><Gem className="w-3.5 h-3.5" />Premium Signal<Info className="w-3.5 h-3.5" /></p>
                    : <p className={`text-[14px] leading-5 font-semibold ${s.up ? 'text-[#8cb300]' : 'text-[#5945F1]'}`}>{s.change}</p>}
                </div>
                {s.action !== 'Upgrade' && <svg viewBox="0 0 68 20" preserveAspectRatio="none" className="w-20 h-5 shrink-0" aria-hidden="true"><path d={s.path} fill="none" stroke={s.up ? '#8cb300' : '#5945F1'} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" /></svg>}
                {s.action === 'Upgrade'
                  ? <button type="button" onClick={onUpgrade} className="shrink-0 h-9 px-3.5 border border-[#fd02b0] text-[#fd02b0] bg-white rounded-lg text-[14px] font-medium hover:bg-[#fff0fa]">Upgrade</button>
                  : <button type="button" onClick={onSignals} className={`shrink-0 h-9 w-[57px] rounded-lg text-[14px] font-medium ${s.action === 'Buy' ? 'bg-[#c9ea0e] text-[#111827] hover:bg-[#bddc08]' : 'bg-[#5945F1] text-white hover:bg-[#4a38d6]'}`}>{s.action}</button>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dots count={2} index={page} onChange={setPage} className="h-5 mt-2.5 -mb-0.5" />
    </div>
  );
};

/* ───────── Featured Courses ───────── */
export const CoursesCard: React.FC<{ state?: PreviewState; onOpen: () => void }> = ({ state, onOpen }) => {
  const [page, setPage] = useState(0);
  return (
    <Card className={`px-4 pt-5 pb-2.5 ${fail(state) ? 'h-[445px]' : ''}`}>
      <div className="flex items-center justify-between mb-5">
        <CardTitle>Featured Courses</CardTitle>
        <button type="button" onClick={onOpen} aria-label="All courses" className="text-[#0b1c30] hover:text-[#5945F1]"><ArrowRight className="w-4 h-4" /></button>
      </div>
      {fail(state) ? (
        <EmptyState error image={IMG.errCourses} {...STATE_COPY.coursesError} className="pt-[88px]" imgClass="w-[163px]" />
      ) : (
        <ul>
          {COURSES.map((c, i, a) => (
            <li key={c.title} className={`flex items-center gap-3 h-28 ${i < a.length - 1 ? `border-b ${BORDER}` : ''}`}>
              <img src={c.image} alt="" className="w-[108px] h-20 rounded object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-[14px] leading-[18px] text-[#111827]">{c.title}</p>
                <p className="flex items-center gap-1 text-xs text-[#6b7280] mt-1"><Clock className="w-3.5 h-3.5" />{c.meta}</p>
                <OutlineButton onClick={onOpen} className="mt-1.5 !h-6 !py-0 !px-2 !text-xs !rounded">View Course</OutlineButton>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dots count={2} index={page} onChange={setPage} className="h-6 mt-2.5" />
    </Card>
  );
};

/* ───────── Ad carousel ───────── */
export const AdCarousel: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const [i, setI] = useState(0);
  const slides = [
    <img key="p" src={IMG.ad} alt="Trade smarter with lower fees. Exclusive cashback for MarketSyde members." className="w-full h-full object-cover" />,
    <div key="h" className="w-full h-full bg-gradient-to-br from-[#0b1c30] to-[#2a1a7a] text-white p-4 flex flex-col justify-center"><p className="font-display text-lg leading-tight">Earn more<br />on every lot.</p><p className="text-[11px] text-[#d7d2ff] mt-1">Compare cashback across brokers.</p><span className="mt-3 self-start bg-[#caeb0e] text-[#1f2a00] text-xs font-bold px-3 py-1.5 rounded-lg">Compare brokers</span></div>,
    <div key="e" className="w-full h-full bg-gradient-to-br from-[#5945F1] to-[#c026d3] text-white p-4 flex flex-col justify-center"><p className="font-display text-lg leading-tight">Connect your<br />trading account.</p><p className="text-[11px] text-white/80 mt-1">Track cashback automatically.</p><span className="mt-3 self-start bg-white text-[#5945F1] text-xs font-bold px-3 py-1.5 rounded-lg">Connect now</span></div>,
  ];
  return (
    <div>
      <button type="button" onClick={onOpen} className="block w-full aspect-[300/132] rounded-xl overflow-hidden text-left">{slides[i]}</button>
      <Dots count={slides.length} index={i} onChange={setI} className="mt-2" />
    </div>
  );
};

/* ───────── Your Writing ───────── */
export const YourWritingCard: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
  <Card className="p-4">
    <CardTitle className="mb-3">Your Writing</CardTitle>
    <p className="flex items-center gap-2 text-[10px] text-[#64748b] mb-2"><span className="inline-flex items-center gap-1 border border-slate-200 rounded px-1.5 py-0.5 text-[#0b1c30]"><Pencil className="w-3 h-3" />Draft</span>2 days ago</p>
    <img src={IMG.writing} alt="" className="w-full aspect-[198/115] object-cover rounded-lg" />
    <p className="text-[13px] font-semibold text-[#0b1c30] mt-2 mb-3 truncate">How I Use Trend Channels for Better Entries</p>
    <PrimaryButton onClick={onContinue} className="w-full flex items-center justify-center gap-2">Continue Writing <ArrowRight className="w-4 h-4" /></PrimaryButton>
  </Card>
);

/* ───────── Interests / Recommended topics ───────── */
export const InterestsCard: React.FC<{ title: string; onToast: ShowToast }> = ({ title, onToast }) => {
  const [items, setItems] = useState(DEFAULT_INTERESTS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim().replace(/^#?/, '#');
    if (t.length < 2) return;
    if (items.includes(t)) { onToast('Already Added', `${t} is in your list`); return; }
    setItems([...items, t]);
    setDraft('');
    onToast('Topic Added', `${t} added to your list`);
  };
  return (
    <div className="bg-[#f6f5ff] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[17px] font-medium text-[#5945F1]">{title}</h3>
        <button type="button" onClick={() => setEditing((v) => !v)} aria-label={editing ? 'Done editing' : 'Edit topics'} className="text-[#0b1c30] hover:text-[#5945F1]">{editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span key={t} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${INTEREST_STYLES[i % INTEREST_STYLES.length]}`}>
            <HashtagLink tag={t} className="no-underline hover:underline" />
            {editing && <button type="button" aria-label={`Remove ${t}`} onClick={() => { setItems(items.filter((x) => x !== t)); onToast('Topic Removed', `${t} removed from your list`); }}><X className="w-3 h-3" /></button>}
          </span>
        ))}
      </div>
      {editing && (
        <div className="flex gap-2 mt-3">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a topic" maxLength={24} aria-label="Add a topic" className="flex-1 min-w-0 border border-[#d7d3fb] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#5945F1]/30" />
          <button type="button" onClick={add} aria-label="Add topic" className="w-8 h-8 rounded-lg bg-[#5945F1] text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
};

/* ───────── Left nav card (Articles categories / My Page sections) ───────── */
export const NavListCard: React.FC<{ items: { id: string; label: string; count?: string; icon: React.ElementType; tint?: string }[]; active: string; onChange: (id: string) => void; title?: string }> = ({ items, active, onChange, title = 'Key Topics Discussions' }) => (
  <Card className="p-4">
    <CardTitle className="mb-3">{title}</CardTitle>
    <ul className="space-y-1">
      {items.map((it) => {
        const Icon = it.icon;
        const on = active === it.id;
        return (
          <li key={it.id}>
            <button type="button" aria-pressed={on} onClick={() => onChange(it.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${on ? 'bg-[#EEF0FE] text-[#5945F1] font-medium' : 'text-[#0b1c30] hover:bg-slate-50'}`}>
              <Icon className={`w-4 h-4 shrink-0 ${on ? 'text-[#5945F1]' : it.tint ?? 'text-[#5945F1]'}`} />
              <span className="flex-1 truncate">{it.label}</span>
              {it.count && <span className="text-[11px] text-[#64748b]">{it.count}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  </Card>
);

export const ARTICLE_NAV = ARTICLE_FILTERS.map((f, i) => ({
  id: f.id,
  label: f.label,
  count: f.count,
  icon: [List, Newspaper, LineChart, BarChart3, BookOpen, Bookmark][i],
  tint: ['', 'text-[#16a34a]', 'text-[#ec4899]', 'text-[#2563eb]', 'text-[#ea580c]', 'text-[#dc2626]'][i],
}));

export const MYPAGE_NAV = [
  { id: 'post', label: 'Post', count: '42', icon: ScrollText },
  { id: 'article', label: 'Article', count: '24', icon: PenLine },
  { id: 'activity', label: 'My Activity', count: '3.2k', icon: History },
];
