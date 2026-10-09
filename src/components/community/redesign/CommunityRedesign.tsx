import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Home, ScrollText, UserCircle2 } from 'lucide-react';
import { CommunityPost, UserProfile } from '../../../types';
import { CreateCommunityPostModal } from '../CreateCommunityPostModal';
import { ARTICLES, Article, FeedPost, IMG, SEED_POSTS, SUGGESTED } from './data';
import { Me } from './Comments';
import { PreviewState, BORDER } from './ui';
import { AdCarousel, ContributorsCard, CoursesCard, KeyTopicsCard, SignalsCard, SuggestedCard } from './Sidebars';
import { BackLink, Composer, FeedList, StoriesRow, SuggestedView, TopicHeader } from './FeedView';
import { ArticleList } from './ArticleList';
import { ArticleRead } from './ArticleRead';
import { MyPageView } from './MyPageView';

type Tab = 'feed' | 'article' | 'mypage';

export interface CommunityRedesignProps {
  user: UserProfile;
  isLoggedIn?: boolean;
  onNavigateToTab?: (tab: string, subTab?: string, symbol?: string) => void;
  onRewardPointsAndCredits?: (points: number, credits: number, reason: string) => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

const STATES: { id: PreviewState; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'empty', label: 'Empty' },
  { id: 'error', label: 'Error' },
  { id: 'signed-out', label: 'Signed out' },
];

export const CommunityRedesign: React.FC<CommunityRedesignProps> = ({ user, isLoggedIn = true, onNavigateToTab, onRewardPointsAndCredits, onOpenAuth }) => {
  const [tab, setTab] = useState<Tab>('feed');
  const [feedView, setFeedView] = useState<'feed' | 'suggested'>('feed');
  const [topic, setTopic] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>('default');
  const [posts, setPosts] = useState<FeedPost[]>(SEED_POSTS);
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [rewarded, setRewarded] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const me: Me = useMemo(() => ({
    name: user.firstName || user.username || 'You',
    handle: `@${user.username || 'trader'}`,
    avatar: user.avatar || IMG.josh,
  }), [user.firstName, user.username, user.avatar]);

  const showToast = useCallback((m: string) => {
    setToast(m);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const signedIn = isLoggedIn && preview !== 'signed-out';
  const activeTab: Tab = !signedIn && tab === 'mypage' ? 'feed' : tab;
  const nav = (t: string) => { onNavigateToTab?.(t); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const auth = (mode: 'signin' | 'signup') => (onOpenAuth ? onOpenAuth(mode) : showToast('Sign in to continue'));

  // Own content always shows the current user's name and avatar.
  const shownPosts = useMemo(() => posts.map((p) => (p.own ? { ...p, name: me.name, handle: me.handle, avatar: me.avatar } : p)), [posts, me]);
  const shownArticles = useMemo(() => articles.map((a) => (a.own ? { ...a, author: me.name, handle: me.handle, avatar: me.avatar } : a)), [articles, me]);

  const changePost = (p: FeedPost) => setPosts((l) => l.map((x) => (x.id === p.id ? p : x)));
  const removePost = (id: string, mode: 'delete' | 'draft') => { setPosts((l) => l.filter((x) => x.id !== id)); showToast(mode === 'draft' ? 'Post moved to drafts' : 'Post deleted'); };
  const addPost = (text: string, image?: string, tags?: string[]) => {
    const p: FeedPost = { id: `up${Date.now()}`, name: me.name, handle: me.handle, avatar: me.avatar, verified: true, time: 'Just now', text, image, tags: tags ?? (text.match(/#[A-Za-z][A-Za-z0-9_]*/g) ?? []), likes: 0, views: '1', saves: 0, own: true, comments: [] };
    setPosts((l) => [p, ...l]);
    showToast('Post published to your feed and My Page');
  };
  const fromModal = (d: Partial<CommunityPost>) => {
    const text = [d.title, d.content].filter(Boolean).join('\n\n') || 'New post';
    addPost(text, d.image, (d.tags ?? []).map((t) => (t.startsWith('#') ? t : `#${t}`)));
  };

  const toggleArticle = (id: string, key: 'liked' | 'saved') => {
    setArticles((l) => l.map((a) => {
      if (a.id !== id) return a;
      if (key === 'saved') { showToast(a.saved ? 'Removed from saved articles' : 'Saved to your reading list'); return { ...a, saved: !a.saved, saves: a.saves + (a.saved ? -1 : 1) }; }
      return { ...a, liked: !a.liked };
    }));
  };
  const articleMenu = (id: string, action: 'edit' | 'draft' | 'delete') => {
    if (action === 'edit') return showToast('Opening article editor...');
    setArticles((l) => l.filter((a) => a.id !== id));
    showToast(action === 'draft' ? 'Article moved to drafts' : 'Article deleted');
  };
  const shareArticle = async (a: Article) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/community?article=${a.id}`); showToast('Link copied'); } catch { showToast('Could not copy the link here'); }
  };
  const openArticle = (id: string) => { setTab('article'); setArticleId(id); };
  const reading = shownArticles.find((a) => a.id === articleId) ?? null;
  const retry = () => { setPreview('default'); showToast('Refreshed'); };
  const reward = useCallback(() => {
    if (!articleId) return;
    setRewarded((s) => new Set(s).add(articleId));
    onRewardPointsAndCredits?.(0, 5, 'Finished reading an article');
  }, [articleId, onRewardPointsAndCredits]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'article', label: 'Article', icon: ScrollText },
    ...(signedIn ? [{ id: 'mypage' as Tab, label: 'My Page', icon: UserCircle2 }] : []),
  ];

  const openTopic = (title: string) => { setTopic(title); setFeedView('feed'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const topicIcon = SUGGESTED.find((s) => s.title === topic)?.icon ?? 'chart';
  const topicPosts = useMemo(() => (topic ? shownPosts.slice(0, 2) : shownPosts), [topic, shownPosts]);
  const wrap = 'grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_300px] gap-8 items-start';

  return (
    <div className="font-sans" data-keep-button-icons>
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-[60] bg-[#0b1c30] border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#c6f831] shrink-0" /><span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      <nav aria-label="Community sections" className="flex justify-center mb-[17px]">
        <div role="tablist" className="inline-flex items-center rounded-[10px] bg-[#efecff] p-[3px]">
          {tabs.map((t) => {
            const Icon = t.icon;
            const on = activeTab === t.id;
            return (
              <button key={t.id} role="tab" type="button" aria-selected={on} onClick={() => { setTab(t.id); if (t.id === 'article') setArticleId(null); if (t.id === 'feed') { setFeedView('feed'); setTopic(null); } window.scrollTo({ top: 0 }); }}
                className={`flex items-center gap-1.5 h-[31px] rounded-lg text-[14px] transition-colors ${on ? 'bg-white text-[#5945F1] px-6' : 'text-[#111827] px-4 hover:text-[#5945F1]'}`}>
                <Icon className="w-[18px] h-[18px]" />{t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {activeTab === 'feed' && (
        <div className={wrap}>
          <aside className="order-2 lg:order-none space-y-8 lg:row-span-2 xl:row-span-1">
            <KeyTopicsCard state={preview} />
            <SuggestedCard state={preview} onOpen={() => { setTopic(null); setFeedView('suggested'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onOpenTopic={openTopic} />
          </aside>

          <div className="order-1 lg:order-none min-w-0">
            {feedView === 'suggested' ? (
              <SuggestedView onBack={() => setFeedView('feed')} onOpenTopic={openTopic} />
            ) : topic ? (
              <div className="flex flex-col gap-7">
                <div>
                  <BackLink onClick={() => setTopic(null)} />
                  <TopicHeader title={topic} icon={topicIcon} />
                </div>
                <Composer me={me} heading="" onPost={(t, i) => (signedIn ? addPost(t, i) : auth('signin'))} onOpenCreate={() => (signedIn ? setCreateOpen(true) : auth('signin'))} />
                <div className="mt-1"><FeedList posts={topicPosts} state={preview} me={me} onChange={changePost} onRemove={removePost} onToast={showToast} /></div>
              </div>
            ) : (
              <div className="flex flex-col gap-7">
                <StoriesRow state={preview} onAdd={() => (signedIn ? setCreateOpen(true) : auth('signin'))} />
                <Composer me={me} onPost={(t, i) => (signedIn ? addPost(t, i) : auth('signin'))} onOpenCreate={() => (signedIn ? setCreateOpen(true) : auth('signin'))} />
                <div className="mt-1"><FeedList posts={shownPosts} state={preview} openFirstComments me={me} onChange={changePost} onRemove={removePost} onToast={showToast} /></div>
              </div>
            )}
          </div>

          <aside className="order-3 lg:order-none lg:col-span-2 xl:col-span-1 grid sm:grid-cols-2 xl:grid-cols-1 gap-8 items-start">
            {preview !== 'empty' && <ContributorsCard state={preview} onOpenArticles={() => setTab('article')} />}
            <SignalsCard state={preview} onSignals={() => nav('signals')} onUpgrade={() => nav('member-plan')} />
            <CoursesCard state={preview} onOpen={() => nav('education-hub')} />
          </aside>
        </div>
      )}

      {activeTab === 'article' && (reading
        ? <ArticleRead article={reading} others={shownArticles.filter((a) => a.id !== reading.id)} state={preview} signedIn={signedIn} me={me} alreadyRewarded={rewarded.has(reading.id)}
            onBack={() => setArticleId(null)} onOpen={openArticle} onReward={reward} onAuth={auth} onToast={showToast} onNavigate={nav} onRetry={retry}
            onToggleFollow={() => setArticles((l) => l.map((a) => (a.id === reading.id ? { ...a, following: !a.following } : a)))}
            onToggle={toggleArticle} />
        : <ArticleList state={preview} articles={shownArticles} signedIn={signedIn} onOpen={openArticle} onToggle={toggleArticle} onMenu={articleMenu} onShare={shareArticle} onWrite={() => (signedIn ? showToast('Opening article editor...') : auth('signin'))} onToast={showToast} onRetry={retry} onNavigate={nav} />)}

      {activeTab === 'mypage' && signedIn && (
        <MyPageView me={me} posts={shownPosts} articles={shownArticles} state={preview} rankTitle={user.rankTitle} onChangePost={changePost} onRemovePost={removePost}
          onPost={(t, i) => addPost(t, i)} onOpenCreate={() => setCreateOpen(true)} onOpenArticle={openArticle} onToggleArticle={toggleArticle} onArticleMenu={articleMenu} onShareArticle={shareArticle} onToast={showToast} onNavigate={nav} />
      )}

      <div className={`fixed bottom-4 left-4 z-40 bg-white/95 backdrop-blur border ${BORDER} rounded-xl shadow-lg print:hidden`} role="group" aria-label="Preview design state">
        <button type="button" aria-expanded={panelOpen} onClick={() => setPanelOpen((v) => !v)} className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748b] hover:text-[#5945F1]">
          Preview state{!panelOpen && preview !== 'default' && <span className="normal-case tracking-normal text-[#5945F1]">· {STATES.find((s) => s.id === preview)?.label}</span>}<span aria-hidden="true">{panelOpen ? '▾' : '▸'}</span>
        </button>
        {panelOpen && (
          <div className="flex gap-1 px-2 pb-2">
            {STATES.map((s) => <button key={s.id} type="button" aria-pressed={preview === s.id} onClick={() => setPreview(s.id)} className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${preview === s.id ? 'bg-[#5945F1] text-white' : 'text-[#474556] hover:bg-[#EEF0FE]'}`}>{s.label}</button>)}
          </div>
        )}
      </div>

      <CreateCommunityPostModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSubmit={fromModal} user={user} />
    </div>
  );
};
