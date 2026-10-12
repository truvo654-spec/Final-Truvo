import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home, ScrollText, UserCircle2 } from 'lucide-react';
import { UserProfile } from '../../../types';
import { CreatePostModal, NewPostDraft } from './CreatePostModal';
import { ConfirmDialog } from './ConfirmDialog';
import { ARTICLES, Article, FeedPost, IMG, SEED_POSTS, SUGGESTED } from './data';
import { Me } from './Comments';
import { PreviewState, BORDER } from './ui';
import { AdCarousel, ContributorsCard, CoursesCard, KeyTopicsCard, SignalsCard, SuggestedCard } from './Sidebars';
import { BackLink, Composer, FeedList, StoriesRow, SuggestedView, TopicHeader } from './FeedView';
import { ArticleList } from './ArticleList';
import { ArticleRead } from './ArticleRead';
import { MyPageView } from './MyPageView';
import { ToastStack, useToasts } from './Toast';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [createIntent, setCreateIntent] = useState<'text' | 'media' | 'poll'>('text');
  const [confirm, setConfirm] = useState<{ kind: 'post' | 'article'; id: string; title: string } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const { toasts, showToast } = useToasts();

  const me: Me = useMemo(() => ({
    name: user.firstName || user.username || 'You',
    handle: `@${user.username || 'trader'}`,
    avatar: user.avatar || IMG.josh,
  }), [user.firstName, user.username, user.avatar]);

  const signedIn = isLoggedIn && preview !== 'signed-out';
  const activeTab: Tab = !signedIn && tab === 'mypage' ? 'feed' : tab;
  const nav = (t: string) => { onNavigateToTab?.(t); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const auth = (mode: 'signin' | 'signup') => (onOpenAuth ? onOpenAuth(mode) : showToast('Sign In Needed', 'Sign in to continue'));

  // Own content always shows the current user's name and avatar.
  const shownPosts = useMemo(() => posts.map((p) => (p.own ? { ...p, name: me.name, handle: me.handle, avatar: me.avatar } : p)), [posts, me]);
  const shownArticles = useMemo(() => articles.map((a) => (a.own ? { ...a, author: me.name, handle: me.handle, avatar: me.avatar } : a)), [articles, me]);

  const changePost = (p: FeedPost) => setPosts((l) => l.map((x) => (x.id === p.id ? p : x)));
  const dropPost = (id: string, mode: 'delete' | 'draft') => {
    setPosts((l) => l.filter((x) => x.id !== id));
    showToast(mode === 'draft' ? 'Moved to Drafts' : 'Post Deleted', mode === 'draft' ? 'Find it in your drafts' : 'It is gone from your feed');
  };
  const removePost = (id: string, mode: 'delete' | 'draft') => {
    if (mode === 'draft') return dropPost(id, 'draft');
    const p = posts.find((x) => x.id === id);
    setConfirm({ kind: 'post', id, title: p ? `${p.name}’s post` : 'this post' });
  };
  const addPost = (draft: NewPostDraft) => {
    const p: FeedPost = {
      id: `up${Date.now()}`, name: me.name, handle: me.handle, avatar: me.avatar, verified: true, time: 'Just now',
      text: draft.text,
      media: draft.media.length ? draft.media : undefined,
      poll: draft.poll,
      sentiment: draft.sentiment,
      tags: draft.text.match(/#[A-Za-z][A-Za-z0-9_]*/g) ?? [],
      likes: 0, views: '1', saves: 0, own: true, comments: [],
    };
    setPosts((l) => [p, ...l]);
    const what = draft.sentiment ? `${draft.sentiment.view[0].toUpperCase()}${draft.sentiment.view.slice(1)} call on ${draft.sentiment.symbol}` : draft.poll ? 'Poll published' : draft.media.length ? `${draft.media.length} attachment${draft.media.length === 1 ? '' : 's'} published` : 'First post published';
    showToast('+10 Credits', what, { reward: true });
  };

  const openCreate = (intent: 'text' | 'media' | 'poll' = 'text') => {
    if (!signedIn) return auth('signin');
    setCreateIntent(intent);
    setCreateOpen(true);
  };

  const toggleArticle = (id: string, key: 'liked' | 'saved') => {
    setArticles((l) => l.map((a) => {
      if (a.id !== id) return a;
      if (key === 'saved') { showToast(a.saved ? 'Removed from Saved' : 'Article Saved', a.title); return { ...a, saved: !a.saved, saves: a.saves + (a.saved ? -1 : 1) }; }
      showToast(a.liked ? 'Like Removed' : 'Article Liked', a.title);
      return { ...a, liked: !a.liked };
    }));
  };
  const articleMenu = (id: string, action: 'edit' | 'draft' | 'delete') => {
    const title = articles.find((a) => a.id === id)?.title ?? 'Article';
    if (action === 'edit') return showToast('Editor Opened', title);
    if (action === 'draft') { setArticles((l) => l.filter((a) => a.id !== id)); return showToast('Moved to Drafts', title); }
    setConfirm({ kind: 'article', id, title });
  };
  const shareArticle = async (a: Article) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/community?article=${a.id}`); showToast('Link Copied', a.title); } catch { showToast('Could Not Copy', 'Copy the link from the address bar'); }
  };
  const openArticle = (id: string) => { setTab('article'); setArticleId(id); showToast('Article Opened', articles.find((a) => a.id === id)?.title ?? 'Reading now'); };
  const reading = shownArticles.find((a) => a.id === articleId) ?? null;
  const retry = () => { setPreview('default'); showToast('Refreshed', 'Content loaded again'); };
  const reward = useCallback(() => {
    if (!articleId) return;
    setRewarded((s) => new Set(s).add(articleId));
    onRewardPointsAndCredits?.(0, 5, 'Finished reading an article');
    showToast('+5 Credits', 'Article finished', { reward: true });
  }, [articleId, onRewardPointsAndCredits]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'article', label: 'Article', icon: ScrollText },
    ...(signedIn ? [{ id: 'mypage' as Tab, label: 'My Page', icon: UserCircle2 }] : []),
  ];

  const openTopic = (title: string) => { setTopic(title); setFeedView('feed'); window.scrollTo({ top: 0, behavior: 'smooth' }); showToast('Topic Opened', title); };
  const topicIcon = SUGGESTED.find((s) => s.title === topic)?.icon ?? 'chart';
  const topicPosts = useMemo(() => (topic ? shownPosts.slice(0, 2) : shownPosts), [topic, shownPosts]);
  const wrap = 'grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_300px] gap-8 items-start';
  /** Sidebars follow the page while it scrolls, and scroll internally when taller than the viewport. */
  const stickyCol = 'xl:sticky xl:top-[93px] xl:max-h-[calc(100vh-109px)] xl:overflow-y-auto no-scrollbar xl:pb-2';

  return (
    <div className="font-sans" data-keep-button-icons>
      <ToastStack toasts={toasts} />

      <nav aria-label="Community sections" className="flex justify-center mb-3">
        <div role="tablist" className="inline-flex items-center rounded-[10px] bg-[#efecff] p-[3px]">
          {tabs.map((t) => {
            const Icon = t.icon;
            const on = activeTab === t.id;
            return (
              <button key={t.id} role="tab" type="button" aria-selected={on} onClick={() => { setTab(t.id); if (t.id === 'article') setArticleId(null); if (t.id === 'feed') { setFeedView('feed'); setTopic(null); } window.scrollTo({ top: 0 }); showToast(`${t.label} Opened`, t.id === 'feed' ? 'The latest from the community' : t.id === 'article' ? 'Articles from the community' : 'Your posts and articles'); }}
                className={`flex items-center gap-1.5 h-[31px] rounded-lg text-[14px] transition-colors ${on ? 'bg-white text-[#5945F1] px-6' : 'text-[#111827] px-4 hover:text-[#5945F1]'}`}>
                <Icon className="w-[18px] h-[18px]" />{t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {activeTab === 'feed' && (
        <div className={wrap}>
          <aside className={`order-2 lg:order-none space-y-8 lg:row-span-2 xl:row-span-1 ${stickyCol}`}>
            <KeyTopicsCard state={preview} />
            <SuggestedCard state={preview} onOpen={() => { setTopic(null); setFeedView('suggested'); window.scrollTo({ top: 0, behavior: 'smooth' }); showToast('Suggestions Opened', 'All suggested discussions'); }} onOpenTopic={openTopic} />
          </aside>

          <div className="order-1 lg:order-none min-w-0">
            {feedView === 'suggested' ? (
              <SuggestedView onBack={() => { setFeedView('feed'); showToast('Feed Opened', 'Back to the community feed'); }} onOpenTopic={openTopic} onToast={showToast} />
            ) : topic ? (
              <div className="flex flex-col gap-[17px]">
                <div>
                  <BackLink onClick={() => { setTopic(null); showToast('Feed Opened', 'Back to the community feed'); }} />
                  <TopicHeader title={topic} icon={topicIcon} />
                </div>
                <Composer me={me} heading="" onOpenCreate={openCreate} />
                <div className="mt-[15px]"><FeedList posts={topicPosts} state={preview} me={me} onChange={changePost} onRemove={removePost} onToast={showToast} /></div>
              </div>
            ) : (
              <div className="flex flex-col gap-7">
                <StoriesRow state={preview} onToast={showToast} onAdd={() => openCreate('media')} />
                <Composer me={me} onOpenCreate={openCreate} />
                <div className="mt-1"><FeedList posts={shownPosts} state={preview} openFirstComments me={me} onChange={changePost} onRemove={removePost} onToast={showToast} /></div>
              </div>
            )}
          </div>

          <aside className={`order-3 lg:order-none lg:col-span-2 xl:col-span-1 grid sm:grid-cols-2 xl:grid-cols-1 gap-8 items-start ${stickyCol}`}>
            {preview !== 'empty' && <ContributorsCard state={preview} onOpenArticles={() => { setTab('article'); showToast('Article Opened', 'Articles from the community'); }} />}
            <SignalsCard state={preview} onSignals={() => { showToast('Signals Opened', 'Taking you to the signals page'); nav('signals'); }} onUpgrade={() => { showToast('Upgrade Opened', 'Premium signals need a higher plan'); nav('member-plan'); }} />
            <CoursesCard state={preview} onOpen={() => { showToast('Courses Opened', 'Taking you to the education hub'); nav('education-hub'); }} />
          </aside>
        </div>
      )}

      {activeTab === 'article' && (reading
        ? <ArticleRead article={reading} others={shownArticles.filter((a) => a.id !== reading.id)} state={preview} signedIn={signedIn} me={me} alreadyRewarded={rewarded.has(reading.id)}
            onBack={() => setArticleId(null)} onOpen={openArticle} onReward={reward} onAuth={auth} onToast={showToast} onNavigate={nav} onRetry={retry}
            onToggleFollow={() => setArticles((l) => l.map((a) => (a.id === reading.id ? { ...a, following: !a.following } : a)))}
            onToggle={toggleArticle} />
        : <ArticleList state={preview} articles={shownArticles} signedIn={signedIn} onOpen={openArticle} onToggle={toggleArticle} onMenu={articleMenu} onShare={shareArticle} onWrite={() => (signedIn ? showToast('Editor Opened', 'Write and share an article') : auth('signin'))} onToast={showToast} onRetry={retry} onNavigate={nav} />)}

      {activeTab === 'mypage' && signedIn && (
        <MyPageView me={me} posts={shownPosts} articles={shownArticles} state={preview} rankTitle={user.rankTitle} onChangePost={changePost} onRemovePost={removePost}
          onOpenCreate={openCreate} onOpenArticle={openArticle} onToggleArticle={toggleArticle} onArticleMenu={articleMenu} onShareArticle={shareArticle} onToast={showToast} onNavigate={nav} />
      )}

      <div className={`fixed bottom-4 left-4 z-40 bg-white/95 backdrop-blur border ${BORDER} rounded-xl shadow-lg print:hidden`} role="group" aria-label="Preview design state">
        <button type="button" aria-expanded={panelOpen} onClick={() => setPanelOpen((v) => !v)} className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748b] hover:text-[#5945F1]">
          Preview state{!panelOpen && preview !== 'default' && <span className="normal-case tracking-normal text-[#5945F1]">· {STATES.find((s) => s.id === preview)?.label}</span>}<span aria-hidden="true">{panelOpen ? '▾' : '▸'}</span>
        </button>
        {panelOpen && (
          <div className="flex gap-1 px-2 pb-2">
            {STATES.map((s) => <button key={s.id} type="button" aria-pressed={preview === s.id} onClick={() => { setPreview(s.id); showToast('Preview Changed', `${s.label} state`); }} className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${preview === s.id ? 'bg-[#5945F1] text-white' : 'text-[#474556] hover:bg-[#EEF0FE]'}`}>{s.label}</button>)}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.kind === 'article' ? 'Confirm Article Deletion' : 'Confirm Post Deletion'}
        body={confirm?.kind === 'article'
          ? 'Are you sure you want to delete this article? Once deleted, it can’t be recovered.'
          : 'Are you sure you want to delete this post? Once deleted, it can’t be recovered.'}
        secondary={{
          label: 'Move to Draft',
          onClick: () => {
            if (!confirm) return;
            if (confirm.kind === 'article') { setArticles((l) => l.filter((a) => a.id !== confirm.id)); showToast('Moved to Drafts', confirm.title); }
            else dropPost(confirm.id, 'draft');
            setConfirm(null);
          },
        }}
        confirmLabel={confirm?.kind === 'article' ? 'Delete Article' : 'Delete Post'}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === 'article') { setArticles((l) => l.filter((a) => a.id !== confirm.id)); showToast('Article Deleted', confirm.title); }
          else dropPost(confirm.id, 'delete');
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />

      <CreatePostModal open={createOpen} me={me} intent={createIntent} onClose={() => setCreateOpen(false)} onSubmit={addPost} onToast={showToast} />
    </div>
  );
};
