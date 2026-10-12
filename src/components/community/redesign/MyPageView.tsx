import { ShowToast } from './Toast';
import React, { useMemo, useState } from 'react';
import { AtSign, Bookmark, CalendarDays, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Heart, ImageOff, MapPin, MessageCircle, PenLine, Plus } from 'lucide-react';
import { Avatar, Card, EmptyState, Verified, BORDER, PreviewState } from './ui';
import { ARTICLES, Article, CATEGORY_STYLE, DRAFT_ARTICLES, FeedPost, IMG, ME } from './data';

const ART_COVERS = ARTICLES.map((a) => a.cover);
import { PostCard } from './PostCard';
import { ArticleCard } from './ArticleCard';
import { MoreMenu } from './PostCard';
import { AdCarousel, InterestsCard, MYPAGE_NAV, MYPAGE_NAV_TITLE, NavListCard, YourWritingCard } from './Sidebars';
import { Composer } from './FeedView';
import { Me } from './Comments';

/** A draft has no stats and may have no cover or title yet. */
const DraftCard: React.FC<{ article: Article; onOpen: () => void; onMenu: (a: 'edit' | 'draft' | 'delete') => void }> = ({ article: a, onOpen, onMenu }) => (
  <Card className="overflow-hidden flex flex-col">
    <div className="relative">
      <button type="button" onClick={onOpen} aria-label={`Edit draft: ${a.title || 'Untitled'}`} className="block w-full aspect-[16/9] bg-[#eef1f5]">
        {a.cover
          ? <img src={a.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
          : <span className="w-full h-full flex items-center justify-center text-[#c3ccd8]"><ImageOff className="w-14 h-14" aria-hidden /></span>}
      </button>
      <div className="absolute top-2 right-2">
        <MoreMenu label="Draft options" items={[{ label: 'Edit', onClick: () => onMenu('edit') }, { label: 'Delete', onClick: () => onMenu('delete') }]} />
      </div>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <span className={`self-start rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_STYLE[a.category]}`}>{a.category}</span>
      <button type="button" onClick={onOpen} className="text-left mt-3"><h3 className="text-[17px] font-bold text-[#0b1c30] leading-snug">{a.title || '-'}</h3></button>
      <p className="text-xs text-[#64748b] leading-relaxed mt-2 line-clamp-3">{a.excerpt}</p>
      <div className="flex items-center gap-2 mt-auto pt-4 text-xs">
        <Avatar src={a.avatar} alt={a.author} size={24} /><span className="font-bold text-[#0b1c30]">{a.author}</span><Verified className="!w-3.5 !h-3.5" /><span className="text-[#64748b] truncate">{a.handle} · {a.date}</span>
      </div>
    </div>
  </Card>
);

const Pager: React.FC<{ page: number; pages: number; onChange: (n: number) => void }> = ({ page, pages, onChange }) => {
  const btn = (disabled: boolean) => `w-11 h-11 rounded-lg border ${BORDER} flex items-center justify-center ${disabled ? 'text-[#c1bbf8] bg-[#f8f8ff]' : 'text-[#5945F1] bg-[#f8f8ff] hover:bg-[#EEF0FE]'}`;
  const items: (number | '…')[] = [1, 2, '…', pages];
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-6">
      <button type="button" aria-label="First page" disabled={page === 1} onClick={() => onChange(1)} className={btn(page === 1)}><ChevronFirst className="w-[18px] h-[18px]" /></button>
      <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)} className={btn(page === 1)}><ChevronLeft className="w-[18px] h-[18px]" /></button>
      {items.map((p, i) => (p === '…'
        ? <span key={i} className={`${btn(false)} select-none`} aria-hidden>…</span>
        : <button key={i} type="button" aria-current={page === p} onClick={() => onChange(p)} className={`${btn(false)} text-[17px] ${page === p ? '!bg-white font-semibold' : ''}`}>{p}</button>))}
      <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => onChange(Math.min(pages, page + 1))} className={btn(page === pages)}><ChevronRight className="w-[18px] h-[18px]" /></button>
      <button type="button" aria-label="Last page" disabled={page === pages} onClick={() => onChange(pages)} className={btn(page === pages)}><ChevronLast className="w-[18px] h-[18px]" /></button>
    </nav>
  );
};

type ActivityKind = 'post-liked' | 'post-commented' | 'article-liked' | 'article-saved' | 'article-drafted' | 'comment-replied' | 'topic-followed' | 'mention';

interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  title: string;
  time: string;
  thumb?: string;
  /** Which filter pills this row belongs to. */
  groups: string[];
}

const ACTIVITY: ActivityItem[] = [
  { id: 'a1', kind: 'article-liked', label: 'Article Liked', title: 'BTC breaks above $70K – What’s next?', time: '2 hours ago', thumb: ART_COVERS[0], groups: ['articles'] },
  { id: 'a2', kind: 'post-commented', label: 'Post Commented', title: 'How I Use Trend Channels for Better Entries', time: '1 day ago', thumb: ART_COVERS[1], groups: ['posts', 'comments'] },
  { id: 'a3', kind: 'article-saved', label: 'Article Saved', title: 'A Beginner’s Guide to RSI (With Examples)', time: '4 days ago', thumb: ART_COVERS[3], groups: ['articles', 'bookmarks'] },
  { id: 'a4', kind: 'topic-followed', label: 'Topic Followed', title: '#TechnicalAnalysis', time: '5 days ago', groups: ['topics'] },
  { id: 'a5', kind: 'article-drafted', label: 'Article Drafted', title: 'Best Low Spread Brokers of 2024 (Comparison)', time: '1 week ago', groups: ['articles'] },
  { id: 'a6', kind: 'comment-replied', label: 'Comment Replied', title: 'Gold holding key support here. What’s your view?', time: '1 week ago', groups: ['comments'] },
  { id: 'a7', kind: 'post-liked', label: 'Post Liked', title: 'My Bitcoin rule: decide the downside before the upside. Position size, an invalidation level and…', time: '2 weeks ago', thumb: ART_COVERS[4], groups: ['posts'] },
  { id: 'a8', kind: 'post-commented', label: 'Post Commented', title: 'How I Use Trend Channels for Better Entries', time: '3 weeks ago', thumb: ART_COVERS[1], groups: ['posts', 'comments'] },
  { id: 'a9', kind: 'post-commented', label: 'Post Commented', title: 'XAU/USD watchlist: compare gold with the dollar and real yields before choosing a direction. I…', time: '3 weeks ago', thumb: ART_COVERS[2], groups: ['posts', 'comments'] },
  { id: 'a10', kind: 'mention', label: 'You Were Mentioned', title: 'Raiden replied to your call on EUR/NZD', time: '1 month ago', groups: ['mentions'] },
];

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'articles', label: 'Articles' },
  { id: 'comments', label: 'Comments' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'topics', label: 'Topics' },
  { id: 'mentions', label: 'Mentions' },
];

/** The little coloured badge on the corner of an activity thumbnail. */
const BADGE: Record<ActivityKind, { Icon: React.ElementType; bg: string; fg: string; tile: string }> = {
  'post-liked': { Icon: Heart, bg: 'bg-[#5945F1]', fg: 'text-white', tile: 'bg-[#ece9ff]' },
  'post-commented': { Icon: MessageCircle, bg: 'bg-[#caeb0e]', fg: 'text-[#1f2a00]', tile: 'bg-[#f4fbcd]' },
  'article-liked': { Icon: Heart, bg: 'bg-[#5945F1]', fg: 'text-white', tile: 'bg-[#ece9ff]' },
  'article-saved': { Icon: Bookmark, bg: 'bg-[#fd02b0]', fg: 'text-white', tile: 'bg-[#ffe4f5]' },
  'article-drafted': { Icon: PenLine, bg: 'bg-[#f59e0b]', fg: 'text-white', tile: 'bg-[#f4fbcd]' },
  'comment-replied': { Icon: MessageCircle, bg: 'bg-[#caeb0e]', fg: 'text-[#1f2a00]', tile: 'bg-[#ece9ff]' },
  'topic-followed': { Icon: Plus, bg: 'bg-[#22c55e]', fg: 'text-white', tile: 'bg-[#ffe4f5]' },
  mention: { Icon: AtSign, bg: 'bg-[#5945F1]', fg: 'text-white', tile: 'bg-[#ece9ff]' },
};

const ActivityRow: React.FC<{ item: ActivityItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const { Icon, bg, fg, tile } = BADGE[item.kind];
  return (
    <li>
      <button type="button" onClick={onOpen} className={`w-full flex items-center gap-4 bg-white border ${BORDER} rounded-lg p-3.5 text-left hover:border-[#5945F1] transition-colors`}>
        <span className="relative shrink-0">
          {item.thumb
            ? <img src={item.thumb} alt="" className="w-[52px] h-[52px] rounded-full object-cover" loading="lazy" />
            : <span className={`w-[52px] h-[52px] rounded-full ${tile} flex items-center justify-center text-[#5945F1] text-lg font-bold`}>{item.kind === 'topic-followed' ? '#' : <Icon className="w-5 h-5" aria-hidden />}</span>}
          <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${bg} ${fg} flex items-center justify-center ring-2 ring-white`}>
            <Icon className="w-3 h-3" aria-hidden />
          </span>
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] text-[#6b7280]">{item.label}</span>
          <span className="block text-[15px] font-bold text-[#111827] truncate">{item.title}</span>
          <span className="block text-[13px] text-[#9ca3af] mt-0.5">{item.time}</span>
        </span>
      </button>
    </li>
  );
};

interface Props {
  me: Me;
  posts: FeedPost[];
  articles: Article[];
  state: PreviewState;
  rankTitle: string;
  onChangePost: (p: FeedPost) => void;
  onRemovePost: (id: string, mode: 'delete' | 'draft') => void;
  onSharePost?: (id: string, who: string) => void;
  onOpenCreate: (intent?: 'text' | 'media' | 'poll') => void;
  onOpenArticle: (id: string) => void;
  onToggleArticle: (id: string, key: 'liked' | 'saved') => void;
  onArticleMenu: (id: string, a: 'edit' | 'draft' | 'delete') => void;
  onShareArticle: (a: Article) => void;
  onToast: ShowToast;
  onNavigate: (tab: string) => void;
}

export const MyPageView: React.FC<Props> = ({ me, posts, articles, state, rankTitle, onChangePost, onRemovePost, onSharePost, onOpenCreate, onOpenArticle, onToggleArticle, onArticleMenu, onShareArticle, onToast, onNavigate }) => {
  const [section, setSection] = useState('post');
  const [tab, setTab] = useState<'mine' | 'saved'>('mine');
  const [viewing, setViewing] = useState<'mine' | 'drafts'>('mine');
  const [activityFilter, setActivityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pickSection = (id: string) => { setSection(id); onToast('Section Opened', MYPAGE_NAV.find((n) => n.id === id)?.label ?? id); };
  const pickTab = (id: 'mine' | 'saved') => {
    setTab(id);
    const what = section === 'article' ? 'Article' : 'Post';
    onToast(id === 'mine' ? `My ${what}s` : `Saved ${what}s`, id === 'mine' ? `Showing what you ${section === 'article' ? 'wrote' : 'posted'}` : 'Showing what you saved');
  };
  const mine = useMemo(() => posts.filter((p) => p.own), [posts]);
  const saved = useMemo(() => posts.filter((p) => p.saved), [posts]);
  const myArticles = articles.filter((a) => a.own);
  const empty = state === 'empty';
  const failed = state === 'error';
  const nav = MYPAGE_NAV.map((n) => (failed || empty
    ? { ...n, count: '0' }
    : n.id === 'post' ? { ...n, count: String(42 + Math.max(0, mine.length - 1)) }
    : n.id === 'article' ? { ...n, count: String(24 - Math.max(0, 3 - myArticles.length)) }
    : n));

  const posts_ = tab === 'mine' ? mine : saved;
  let main: React.ReactNode;
  const FAIL: Record<string, { title: string; text: string }> = {
    post: { title: 'Your Posts Didn’t Load', text: 'Don’t worry, they’re safe. Try a refresh.' },
    article: { title: 'The Articles Are Hiding', text: 'They’re still here. Refresh to find them.' },
    activity: { title: 'Your Activities Didn’t Load', text: 'Your moves are safe. Refresh to see them.' },
  };

  if (failed) {
    main = <EmptyState error image={IMG.errDiscussion} {...FAIL[section]} className="py-24" imgClass="w-[216px]" />;
  } else if (section === 'article') {
    const saved = articles.filter((a) => a.saved);
    const list = tab === 'saved' ? saved : viewing === 'drafts' ? DRAFT_ARTICLES : myArticles;
    const pages = viewing === 'drafts' && tab === 'mine' ? 20 : 1;
    main = list.length && !empty
      ? (
        <>
          <div className="grid sm:grid-cols-2 gap-5">
            {list.map((a) => (viewing === 'drafts' && tab === 'mine'
              ? <DraftCard key={a.id} article={a} onOpen={() => onArticleMenu(a.id, 'edit')} onMenu={(m) => onArticleMenu(a.id, m)} />
              : <ArticleCard key={a.id} article={a} signedIn onOpen={() => onOpenArticle(a.id)} onToggle={(k) => onToggleArticle(a.id, k)} onMenu={(m) => onArticleMenu(a.id, m)} onShare={() => onShareArticle(a)} />))}
          </div>
          {pages > 1 && <Pager page={page} pages={pages} onChange={(n) => { setPage(n); onToast('Page Changed', `Showing page ${n} of ${pages}`); }} />}
        </>
      )
      : tab === 'mine'
        ? <EmptyState
            image={IMG.emptyPosts}
            title="Nothing to Read Yet"
            text="Know something we don’t? Write it."
            className="py-24"
            imgClass="w-[253px]"
            action={{ label: 'Write an Article', onClick: () => onToast('Editor Opened', 'Write and share an article'), icon: <PenLine className="w-4 h-4" aria-hidden /> }}
          />
        : <EmptyState image={IMG.emptyArticles} title="Nothing saved yet" text="Tap the bookmark on an article to keep it here." className="py-20" imgClass="w-44" />;
  } else if (section === 'activity') {
    const rows = empty ? [] : ACTIVITY.filter((a) => activityFilter === 'all' || a.groups.includes(activityFilter));
    main = (
      <>
        {!empty && (
        <div className="flex flex-wrap gap-2.5">
          {ACTIVITY_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={activityFilter === f.id}
              onClick={() => { setActivityFilter(f.id); onToast('Filter Changed', f.label); }}
              className={`h-9 px-4 rounded-lg text-[14px] font-medium transition-colors ${activityFilter === f.id ? 'bg-[#5945F1] text-white' : `border ${BORDER} text-[#111827] hover:bg-[#EEF0FE]`}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        )}
        {rows.length
          ? <ul className="space-y-3 mt-5">{rows.map((a) => <ActivityRow key={a.id} item={a} onOpen={() => onToast('Opening', a.title)} />)}</ul>
          : empty
            ? <EmptyState image={IMG.emptyPosts} title="No Activities Yet" text="Like, comment, or follow. We’ll keep track." className="py-24" imgClass="w-[253px]" />
            : <p className="text-center text-sm text-[#6b7280] py-20">Nothing here under that filter yet.</p>}
      </>
    );
  } else {
    main = (
      <>
        {tab === 'mine' && !failed && !empty && <div className="mb-6"><Composer me={me} heading="Share something" onOpenCreate={onOpenCreate} /></div>}
        {posts_.length && !empty
          ? <div className="space-y-6">{posts_.map((p) => <PostCard key={p.id} post={p} me={me} onChange={onChangePost} onRemove={onRemovePost} onShare={onSharePost} onToast={onToast} />)}</div>
          : tab === 'mine'
            ? <EmptyState
                image={IMG.emptyPosts}
                title="No Posts Yet"
                text="Your followers are waiting. No pressure."
                className="py-24"
                imgClass="w-[253px]"
                action={{ label: 'Write a Post', onClick: () => onOpenCreate('text'), icon: <PenLine className="w-4 h-4" aria-hidden /> }}
              />
            : <EmptyState image={IMG.emptyQuiet} title="Nothing saved yet" text="Tap the bookmark on a post to keep it here." className="py-20" imgClass="w-44" />}
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_300px] gap-8 items-start">
      <aside className="order-2 lg:order-none space-y-8 lg:row-span-2 xl:row-span-1 xl:sticky xl:top-[93px] xl:max-h-[calc(100vh-109px)] xl:overflow-y-auto no-scrollbar xl:pb-2">
        <NavListCard items={nav} active={section} onChange={pickSection} title={MYPAGE_NAV_TITLE} />
        <AdCarousel onOpen={() => { onToast('Broker Offer', 'Taking you to the broker page'); onNavigate('brokers'); }} />
      </aside>

      <div className="order-1 lg:order-none min-w-0 space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2b14b8] via-[#3d22d6] to-[#5945F1] text-white p-6 sm:p-7" aria-label="Profile">
          <img src={IMG.bannerArt} alt="" aria-hidden="true" className="hidden sm:block absolute right-0 top-0 h-full w-auto object-cover opacity-90 [mask-image:linear-gradient(to_right,transparent_35%,black_75%)]" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
            <Avatar src={me.avatar} alt={me.name} size={132} ring />
            <div className="min-w-0 text-center sm:text-left">
              <h1 className="font-display text-3xl flex items-center justify-center sm:justify-start gap-2">{me.name}<span className="w-5 h-5 rounded-full border border-white/70 inline-flex items-center justify-center text-[11px]" aria-label="Verified">✓</span></h1>
              <p className="flex flex-wrap justify-center sm:justify-start items-center gap-x-3 text-sm mt-1.5"><span><b>{ME.following}</b> Following</span><span className="hidden sm:inline text-white/50">|</span><span><b>{ME.followers}</b> Followers</span></p>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-sm mt-1.5"><span className="text-[#e6e2ff]">{me.handle}</span><span className="bg-white text-[#5945F1] rounded-full px-3 py-0.5 text-xs font-semibold">{rankTitle || ME.rank}</span></p>
              <p className="text-sm text-[#eeeaff] leading-snug mt-3 max-w-[290px]">{ME.bio[0]}<br />{ME.bio[1]}</p>
              <p className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 text-xs text-[#e6e2ff] mt-3"><span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{ME.location}</span><span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Joined {ME.joined}</span></p>
            </div>
          </div>
        </section>

        {section === 'activity' && (
          <div role="tablist" aria-label="Activity" className={`flex items-center gap-1 border-b ${BORDER}`}>
            <button role="tab" type="button" aria-selected className={`px-4 py-2 text-sm -mb-px text-[#5945F1] font-medium border ${BORDER} border-b-white bg-white rounded-t-lg`}>My Activities</button>
          </div>
        )}
        {(section === 'post' || section === 'article') && (
          <div role="tablist" aria-label={section === 'article' ? 'Article lists' : 'Post lists'} className={`flex items-center gap-1 border-b ${BORDER}`}>
            {(section === 'article'
              ? ([['mine', 'My Article'], ['saved', 'Saved Article']] as const)
              : ([['mine', 'My Post'], ['saved', 'Saved Post']] as const)).map(([id, label]) => (
              <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => pickTab(id)} className={`px-4 py-2 text-sm -mb-px transition-colors ${tab === id ? `text-[#5945F1] font-medium border ${BORDER} border-b-white bg-white rounded-t-lg` : 'text-[#0b1c30] hover:text-[#5945F1]'}`}>{label}</button>
            ))}
          </div>
        )}
        {section === 'article' && tab === 'mine' && !failed && !empty && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] text-[#111827]">Viewing</span>
            <label className="sr-only" htmlFor="mypage-viewing">Viewing</label>
            <select
              id="mypage-viewing"
              value={viewing}
              onChange={(e) => { const v = e.target.value as 'mine' | 'drafts'; setViewing(v); setPage(1); onToast(v === 'drafts' ? 'Drafts' : 'Articles by me', v === 'drafts' ? 'Showing what you have not published' : 'Showing what you published'); }}
              className={`h-10 w-[190px] border ${BORDER} rounded-lg bg-white px-3.5 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#5945F1]/30`}
            >
              <option value="mine">Articles by me</option>
              <option value="drafts">Drafts</option>
            </select>
          </div>
        )}
        {main}
      </div>

      <aside className="order-3 lg:order-none lg:col-span-2 xl:col-span-1 grid sm:grid-cols-2 xl:grid-cols-1 gap-8 items-start xl:sticky xl:top-[93px] xl:max-h-[calc(100vh-109px)] xl:overflow-y-auto no-scrollbar xl:pb-2">
        <YourWritingCard onContinue={() => onToast('Draft Opened', 'Continue where you left off')} />
        <InterestsCard title="My Interests" onToast={onToast} />
      </aside>
    </div>
  );
};
