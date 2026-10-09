import { ShowToast } from './Toast';
import React, { useMemo, useState } from 'react';
import { ArrowRight, Gift, Search, Star, Trophy } from 'lucide-react';
import { EmptyState, PrimaryButton, BORDER, PreviewState } from './ui';
import { ARTICLES, Article, IMG } from './data';
import { ArticleCard } from './ArticleCard';
import { AdCarousel, ARTICLE_NAV, ContributorsCard, InterestsCard, NavListCard, YourWritingCard } from './Sidebars';

type Tab = 'latest' | 'trending' | 'following' | 'saved';
const views = (v: string) => parseFloat(v) * (v.includes('k') ? 1000 : 1);

export const ArticleBanner: React.FC<{ onWrite: () => void }> = ({ onWrite }) => (
  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2b14b8] via-[#3d22d6] to-[#5945F1] text-white p-6 sm:p-7 min-h-[146px]" aria-label="Write an article">
    <img src={IMG.bannerArt} alt="" aria-hidden="true" className="hidden sm:block absolute right-0 top-0 h-full w-auto object-cover [mask-image:linear-gradient(to_right,transparent,black_30%)]" />
    <div className="relative max-w-[330px]">
      <p className="text-[11px] text-[#d7d2ff]">Share Your Knowledge</p>
      <h2 className="font-display text-xl font-semibold leading-snug mt-1">Write and share an article with the MarketSyde community.</h2>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#e6e2ff] mt-2.5">
        <li className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" />Earn credits</li>
        <li className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" />Get Featured</li>
        <li className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" />Build Reputation</li>
      </ul>
      <button type="button" onClick={onWrite} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#fd02b0] hover:brightness-110 text-white text-sm font-semibold px-4 py-2 transition">Write An Article <ArrowRight className="w-4 h-4" /></button>
    </div>
  </section>
);

interface Props {
  state: PreviewState;
  articles: Article[];
  signedIn: boolean;
  onOpen: (id: string) => void;
  onToggle: (id: string, key: 'liked' | 'saved') => void;
  onMenu: (id: string, action: 'edit' | 'draft' | 'delete') => void;
  onShare: (a: Article) => void;
  onWrite: () => void;
  onToast: ShowToast;
  onRetry: () => void;
  onNavigate: (tab: string) => void;
}

export const ArticleList: React.FC<Props> = ({ state, articles, signedIn, onOpen, onToggle, onMenu, onShare, onWrite, onToast, onRetry, onNavigate }) => {
  const [filter, setFilter] = useState<string>('all');
  const [tab, setTab] = useState<Tab>('latest');
  const [q, setQ] = useState('');
  const pickFilter = (id: string) => { setFilter(id); onToast('Category Opened', ARTICLE_NAV.find((n) => n.id === id)?.label ?? id); };
  const pickTab = (t: Tab) => { setTab(t); onToast('List Changed', t === 'saved' ? 'Showing your saved articles' : `Showing ${t} articles`); };
  const tabs: Tab[] = signedIn ? ['latest', 'trending', 'following', 'saved'] : ['latest', 'trending', 'following'];
  const activeTab = tabs.includes(tab) ? tab : 'latest';

  const list = useMemo(() => {
    let l = articles;
    if (filter !== 'all') l = l.filter((a) => a.category === filter);
    if (activeTab === 'saved') l = l.filter((a) => a.saved);
    if (activeTab === 'following') l = l.filter((a) => a.following);
    if (q.trim()) { const s = q.toLowerCase(); l = l.filter((a) => `${a.title} ${a.excerpt} ${a.author}`.toLowerCase().includes(s)); }
    if (activeTab === 'trending') l = [...l].sort((a, b) => views(b.views) - views(a.views));
    return l;
  }, [articles, filter, activeTab, q]);

  const empty = state === 'empty';
  const error = state === 'error';
  const nav = ARTICLE_NAV.map((n) => (empty ? { ...n, count: '0' } : n));
  const tabLabel = (t: Tab) => (t === 'saved' ? 'Saved Articles' : t[0].toUpperCase() + t.slice(1));

  let body: React.ReactNode;
  if (error) body = <EmptyState error image={IMG.emptyError} title="Articles Have Failed to Load" text="Articles are still there. Refresh to catch up." className="py-16" imgClass="w-44"/>;
  else if (empty || articles.length === 0) body = <EmptyState image={IMG.emptyArticles} title="There Are No Articles Yet" text="Be the first author and share an article." className="py-16" imgClass="w-44" />;
  else if (list.length === 0) body = <p className="text-center text-sm text-[#64748b] py-16">{activeTab === 'following' ? 'Follow authors to see their articles here.' : activeTab === 'saved' ? 'Articles you save will show up here.' : 'No articles match your filters.'}</p>;
  else body = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {list.map((a) => <ArticleCard key={a.id} article={a} signedIn={signedIn} onOpen={() => onOpen(a.id)} onToggle={(k) => onToggle(a.id, k)} onMenu={(m) => onMenu(a.id, m)} onShare={() => onShare(a)} />)}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_300px] gap-8 items-start">
      <aside className="order-2 lg:order-none space-y-8 lg:row-span-2 xl:row-span-1 xl:sticky xl:top-[93px] xl:max-h-[calc(100vh-109px)] xl:overflow-y-auto no-scrollbar xl:pb-2">
        <NavListCard items={nav} active={filter} onChange={pickFilter} />
        <AdCarousel onOpen={() => { onToast('Broker Offer', 'Taking you to the broker page'); onNavigate('brokers'); }} />
      </aside>

      <div className="order-1 lg:order-none space-y-6 min-w-0">
        <ArticleBanner onWrite={onWrite} />
        <div className={`flex flex-wrap items-center gap-3 border-b ${BORDER}`}>
          <div role="tablist" aria-label="Article lists" className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button key={t} role="tab" type="button" aria-selected={activeTab === t} onClick={() => pickTab(t)} className={`px-4 py-2 text-sm whitespace-nowrap -mb-px transition-colors ${activeTab === t ? `text-[#5945F1] font-medium border ${BORDER} border-b-white bg-white rounded-t-lg` : 'text-[#0b1c30] hover:text-[#5945F1]'}`}>{tabLabel(t)}</button>
            ))}
          </div>
          <div className={`relative w-full sm:w-52 mb-2 sm:mb-1`}>
            <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." aria-label="Search articles" className={`w-full border ${BORDER} rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5945F1]/30 bg-white`} />
          </div>
        </div>
        {body}
        {error && <div className="text-center -mt-8"><PrimaryButton onClick={onRetry}>Refresh</PrimaryButton></div>}
      </div>

      <aside className="order-3 lg:order-none lg:col-span-2 xl:col-span-1 grid sm:grid-cols-2 xl:grid-cols-1 gap-8 items-start xl:sticky xl:top-[93px] xl:max-h-[calc(100vh-109px)] xl:overflow-y-auto no-scrollbar xl:pb-2">
        {signedIn && <YourWritingCard onContinue={() => onToast('Draft Opened', 'Continue where you left off')} />}
        <ContributorsCard />
        {signedIn && <InterestsCard title="Recommended Topics" onToast={onToast} />}
      </aside>
    </div>
  );
};

export { ARTICLES };
