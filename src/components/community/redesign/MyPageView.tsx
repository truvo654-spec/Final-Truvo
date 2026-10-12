import { ShowToast } from './Toast';
import React, { useMemo, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { Avatar, Card, EmptyState, BORDER, PreviewState } from './ui';
import { Article, FeedPost, IMG, ME } from './data';
import { PostCard } from './PostCard';
import { ArticleCard } from './ArticleCard';
import { AdCarousel, InterestsCard, MYPAGE_NAV, NavListCard, YourWritingCard } from './Sidebars';
import { Composer } from './FeedView';
import { Me } from './Comments';

const ACTIVITY = [
  { text: 'You liked “BTC breaks above $70K – What’s next?”', time: '12 min ago' },
  { text: 'You commented on a post by BTC Research', time: '1 hour ago' },
  { text: 'You earned 5 credits for finish reading an article', time: '3 hours ago' },
  { text: 'You followed Raiden', time: 'Yesterday' },
  { text: 'You saved “A Beginner’s Guide to RSI (With Examples)”', time: 'Yesterday' },
];

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
  const pickSection = (id: string) => { setSection(id); onToast('Section Opened', MYPAGE_NAV.find((n) => n.id === id)?.label ?? id); };
  const pickTab = (id: 'mine' | 'saved') => { setTab(id); onToast(id === 'mine' ? 'My Posts' : 'Saved Posts', id === 'mine' ? 'Showing what you posted' : 'Showing what you saved'); };
  const mine = useMemo(() => posts.filter((p) => p.own), [posts]);
  const saved = useMemo(() => posts.filter((p) => p.saved), [posts]);
  const myArticles = articles.filter((a) => a.own);
  const empty = state === 'empty';
  const nav = MYPAGE_NAV.map((n) => (n.id === 'post' ? { ...n, count: String(42 + Math.max(0, mine.length - 1)) } : n.id === 'article' ? { ...n, count: String(24 - Math.max(0, 3 - myArticles.length)) } : n));

  const posts_ = tab === 'mine' ? mine : saved;
  let main: React.ReactNode;
  if (section === 'article') {
    main = myArticles.length && !empty
      ? <div className="grid sm:grid-cols-2 gap-5">{myArticles.map((a) => <ArticleCard key={a.id} article={a} signedIn onOpen={() => onOpenArticle(a.id)} onToggle={(k) => onToggleArticle(a.id, k)} onMenu={(m) => onArticleMenu(a.id, m)} onShare={() => onShareArticle(a)} />)}</div>
      : <EmptyState image={IMG.emptyArticles} title="You haven’t written an article yet" text="Share what you know and earn credits." className="py-16" imgClass="w-44" />;
  } else if (section === 'activity') {
    main = (
      <Card className="p-2"><ul>{ACTIVITY.map((a, i) => <li key={a.text} className={`flex items-center justify-between gap-3 px-3 py-3 text-sm text-[#0b1c30] ${i ? `border-t ${BORDER}` : ''}`}><span>{a.text}</span><span className="text-xs text-[#64748b] shrink-0">{a.time}</span></li>)}</ul></Card>
    );
  } else {
    main = (
      <>
        {tab === 'mine' && <div className="mb-6"><Composer me={me} heading="Share something" onOpenCreate={onOpenCreate} /></div>}
        {posts_.length && !empty
          ? <div className="space-y-6">{posts_.map((p) => <PostCard key={p.id} post={p} me={me} onChange={onChangePost} onRemove={onRemovePost} onShare={onSharePost} onToast={onToast} />)}</div>
          : <EmptyState image={IMG.emptyQuiet} title={tab === 'mine' ? 'It’s Quiet in Here' : 'Nothing saved yet'} text={tab === 'mine' ? 'No posts yet. The first word is yours!' : 'Tap the bookmark on a post to keep it here.'} className="py-20" imgClass="w-44" />}
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_300px] gap-8 items-start">
      <aside className="order-2 lg:order-none space-y-8 lg:row-span-2 xl:row-span-1 xl:sticky xl:top-[93px] xl:max-h-[calc(100vh-109px)] xl:overflow-y-auto no-scrollbar xl:pb-2">
        <NavListCard items={nav} active={section} onChange={pickSection} />
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

        {section === 'post' && (
          <div role="tablist" aria-label="Post lists" className={`flex items-center gap-1 border-b ${BORDER}`}>
            {([['mine', 'My Post'], ['saved', 'Saved Post']] as const).map(([id, label]) => (
              <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => pickTab(id)} className={`px-4 py-2 text-sm -mb-px transition-colors ${tab === id ? `text-[#5945F1] font-medium border ${BORDER} border-b-white bg-white rounded-t-lg` : 'text-[#0b1c30] hover:text-[#5945F1]'}`}>{label}</button>
            ))}
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
