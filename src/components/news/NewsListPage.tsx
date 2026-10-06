import React, { useMemo, useState } from 'react';
import {
  Flame,
  MessageCircle,
  Bookmark,
  Lock,
  ChevronRight,
  Sparkles,
  ThumbsDown,
  MoreHorizontal,
  FileText,
  PenSquare,
} from 'lucide-react';
import { NewsArticle } from '../../types';
import { NEWS_ARTICLES, NEWS_CATEGORIES, canAccessNews } from '../../data/newsData';
import { FolderTabs, FolderTabItem } from '../common/FolderTabs';
import { NewsPromoBanner } from './NewsPromoBanner';
import { useNewsFollowState, releasedArticles } from '../../data/newsFollows';

type NewsListTab = 'for-you' | 'following';

interface NewsListPageProps {
  articles?: NewsArticle[];
  isLoggedIn: boolean;
  userTierLevel: number; // UserProfile.tierLevel: 1 Rookie .. 4 Boss
  isAdvisor?: boolean;
  onSelectArticle: (article: NewsArticle) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const SENTIMENT_STYLES: Record<NewsArticle['sentiment'], string> = {
  Bullish: 'text-emerald-600',
  Bearish: 'text-rose-600',
  Neutral: 'text-slate-500',
};

export const NewsListPage: React.FC<NewsListPageProps> = ({
  articles: baseArticles = NEWS_ARTICLES,
  isLoggedIn,
  userTierLevel,
  isAdvisor = false,
  onSelectArticle,
  onUpgradePrompt,
  onShowToast,
}) => {
  const followState = useNewsFollowState();
  const followedWriters = followState.follows.map((f) => f.writer);
  // Stories published since the member started following sit on top of the feed
  const articles = useMemo(() => [...releasedArticles(followState), ...baseArticles], [followState, baseArticles]);
  const [tab, setTab] = useState<NewsListTab>('for-you');
  const [category, setCategory] = useState<(typeof NEWS_CATEGORIES)[number]>('All');
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [hiddenIds, setHiddenIds] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(!isLoggedIn);

  const tabs: FolderTabItem<NewsListTab>[] = [
    { id: 'for-you', label: 'For you' },
    { id: 'following', label: 'Following' },
  ];

  const filtered = useMemo(() => {
    let list = articles.filter((a) => !hiddenIds[a.id]);
    if (category !== 'All') {
      list = list.filter((a) => a.assetClass === (category as NewsArticle['assetClass']));
    }
    if (tab === 'following') {
      list = list.filter((a) => !!a.followedTopic || followedWriters.includes(a.source));
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, category, tab, hiddenIds, followState]);

  const canAccess = (article: NewsArticle) => canAccessNews(article, userTierLevel, isLoggedIn);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = !prev[id];
      onShowToast(next ? 'Saved to your reading list' : 'Removed from reading list');
      return { ...prev, [id]: next };
    });
  };

  const handleNotInterested = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenIds((prev) => ({ ...prev, [article.id]: true }));
    setOpenMenuId(null);
    onShowToast(`Got it — we'll show you less ${article.assetClass} news like this.`);
  };

  const advisorPicks = articles.filter((a) => a.advisorPick).slice(0, 3);

  return (
    <div className="w-full">
      <NewsPromoBanner
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
        onUpgrade={onUpgradePrompt}
      />

      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
        {/* Page title */}
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Market News</h1>
            <p className="text-sm text-[#474556] mt-1">
              Live coverage from Acuity, Reuters and Dow Jones — sorted by what actually moves your markets.
            </p>
          </div>
        </div>

        {/* Tabs + category filters */}
        <div className="flex flex-col gap-4 mb-6">
          <FolderTabs tabs={tabs} activeTab={tab} onChange={setTab} />
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {NEWS_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  category === c
                    ? 'bg-[#5338ec] border-[#5338ec] text-white'
                    : 'bg-white border-[#e2e8f0] text-[#474556] hover:border-[#5338ec] hover:text-[#5338ec]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10">
          {/* Feed column */}
          <div className="divide-y divide-[#f1f5f9]">
            {filtered.map((article) => {
              const locked = !canAccess(article);
              return (
                <article
                  key={article.id}
                  onClick={() => (locked ? onUpgradePrompt() : onSelectArticle(article))}
                  className={`relative flex items-start justify-between gap-6 py-6 cursor-pointer group ${
                    article.advisorPick ? 'border-l-2 border-[#FD02B0] pl-4 -ml-4' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {/* "Because you follow X" eyebrow — mirrors the Medium feed's personalization line */}
                    {article.followedTopic && (
                      <div className="flex items-center gap-1.5 text-xs text-[#474556] mb-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Because you follow <span className="font-semibold text-slate-700">{article.followedTopic}</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-[#474556] mb-2">
                      <img
                        src={article.sourceAvatar}
                        alt={article.source}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-700">{article.source}</span>
                      <span>· {article.timestamp}</span>
                      <span className={`font-semibold ${SENTIMENT_STYLES[article.sentiment]}`}>
                        · {article.sentiment}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] group-hover:text-[#5338ec] leading-snug mb-1.5 transition-colors">
                      {article.headline}
                    </h3>

                    <p
                      className={`text-sm text-[#474556] leading-relaxed line-clamp-2 mb-3 ${
                        locked ? 'blur-[3px] select-none' : ''
                      }`}
                    >
                      {article.excerpt}
                    </p>

                    {article.advisorPick && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FD02B0] mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{article.advisorPick.advisorName} pinned this as {article.advisorPick.label}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-[#474556]">
                      <span className="px-2 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] font-semibold">
                        {article.assetClass}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Flame className="w-3.5 h-3.5 text-slate-400" /> {article.claps}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <MessageCircle className="w-3.5 h-3.5 text-slate-400" /> {article.commentsCount}
                      </span>
                      <button
                        onClick={(e) => toggleSave(article.id, e)}
                        className={`flex items-center gap-1 transition-colors ${
                          savedIds[article.id] ? 'text-[#5338ec]' : 'hover:text-[#5338ec]'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${savedIds[article.id] ? 'fill-current' : ''}`} />
                      </button>

                      <div className="relative ml-auto flex items-center gap-3">
                        {locked && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Lock className="w-3.5 h-3.5" /> Members only
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === article.id ? null : article.id);
                          }}
                          className="hover:text-[#5338ec] transition-colors"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === article.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-6 z-10 w-48 bg-white border border-[#e2e8f0] rounded-xl shadow-lg py-1.5"
                          >
                            <button
                              onClick={(e) => handleNotInterested(article, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#0b1c30] hover:bg-slate-50"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" /> Show me less like this
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative w-[120px] h-[90px] sm:w-[148px] sm:h-[108px] shrink-0 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={article.thumbnail}
                      alt={article.headline}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        locked ? 'blur-[2px]' : ''
                      }`}
                    />
                    {locked && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-[#474556]">
                Nothing here yet — follow a few topics and we'll fill this in.
              </div>
            )}
          </div>

          {/* Sidebar — mirrors Medium's "Staff Picks" + "Write, grow, reach readers" widgets */}
          <aside className="space-y-6">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-[#0b1c30] mb-4">Advisor picks</h4>
              <div className="space-y-4">
                {advisorPicks.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => (canAccess(a) ? onSelectArticle(a) : onUpgradePrompt())}
                    className="block text-left w-full group"
                  >
                    <p className="text-xs text-[#474556] mb-1">
                      In <span className="font-semibold">Market News</span> by {a.advisorPick!.advisorName}
                    </p>
                    <p className="text-sm font-bold text-[#0b1c30] group-hover:text-[#5338ec] leading-snug transition-colors">
                      {a.headline}
                    </p>
                    <p className="text-xs text-[#474556] mt-1">{a.timestamp}</p>
                    {i < advisorPicks.length - 1 && <div className="h-px bg-[#f1f5f9] mt-4" />}
                  </button>
                ))}
              </div>
            </div>

            {isAdvisor && (
              <div className="bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <PenSquare className="w-4 h-4 text-[#5338ec]" />
                  <h4 className="text-sm font-bold text-[#0b1c30]">Got a take?</h4>
                </div>
                <p className="text-xs text-[#474556] mb-3">
                  Push your read on this move straight to your followers.
                </p>
                <ul className="text-xs text-[#474556] space-y-1.5">
                  <li>· Get the advisor starter guide</li>
                  <li>· Join this week's analyst office hours</li>
                  <li>· Read the community commentary guidelines</li>
                  <li>· Or just post your take</li>
                </ul>
              </div>
            )}

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[#0b1c30]">Your plan</h4>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#F0FCB1] text-[#323B01]">
                  Intermediate
                </span>
              </div>
              <ul className="text-xs text-[#474556] space-y-1.5 mb-4 list-disc pl-4">
                <li>Full premium news access</li>
                <li>Expert summaries on every article</li>
                <li>Breaking-news alerts</li>
              </ul>
              <button
                onClick={onUpgradePrompt}
                className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-[#5338ec] hover:text-[#4326d8] border border-[#5338ec]/30 hover:border-[#5338ec] rounded-xl py-2 transition-colors"
              >
                See Premium plan <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
