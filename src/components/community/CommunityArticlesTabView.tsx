import React, { useMemo, useState } from 'react';
import {
  List,
  Image as ImageIcon,
  TrendingUp,
  BarChart3,
  Shield,
  Star,
  Award,
  BookOpen,
  Monitor,
  Lightbulb,
  Search,
  Eye,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  PenSquare,
  Crown,
  ChevronRight,
} from 'lucide-react';
import {
  ARTICLE_CATEGORIES,
  ArticleCategoryId,
  COMMUNITY_ARTICLES_TAB,
  ARTICLE_RECOMMENDED_TOPICS,
  TOP_ARTICLE_AUTHORS,
} from '../../data/communityArticlesTabData';

type ArticleTab = 'latest' | 'trending' | 'following' | 'saved';

const CATEGORY_ICON: Record<string, React.ElementType> = {
  all: List,
  'market-news': ImageIcon,
  'trading-strategy': TrendingUp,
  'technical-analysis': BarChart3,
  'risk-management': Shield,
  'broker-reviews': Star,
  'trading-psychology': Award,
  education: BookOpen,
  'platform-tutorials': Monitor,
  'industry-insights': Lightbulb,
};

const MEDAL_STYLE: Record<number, string> = {
  1: 'text-[#F5B700] fill-[#F5B700]',
  2: 'text-[#94A3B8] fill-[#94A3B8]',
  3: 'text-[#D97706] fill-[#D97706]',
};

interface CommunityArticlesTabViewProps {
  onShowToast: (msg: string) => void;
}

export const CommunityArticlesTabView: React.FC<CommunityArticlesTabViewProps> = ({ onShowToast }) => {
  const [category, setCategory] = useState<ArticleCategoryId>('all');
  const [tab, setTab] = useState<ArticleTab>('latest');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let list = COMMUNITY_ARTICLES_TAB;
    if (category !== 'all') list = list.filter((a) => a.category === category);
    if (tab === 'saved') list = list.filter((a) => savedIds[a.id]);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.authorName.toLowerCase().includes(q));
    }
    if (tab === 'trending') list = [...list].sort((a, b) => b.views - a.views);
    return list;
  }, [category, tab, search, savedIds]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = !prev[id];
      onShowToast(next ? 'Saved to your reading list' : 'Removed from saved articles');
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left: Browse Categories */}
      <aside className="hidden lg:block xl:col-span-3">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
          <h4 className="text-sm font-bold text-[#0b1c30] mb-3">Browse Categories</h4>
          <div className="space-y-1">
            {ARTICLE_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c.id];
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    active ? 'bg-[#EEF0FE] text-[#5338ec]' : 'text-[#474556] hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </span>
                  <span className="text-xs font-mono text-[#94a3b8] shrink-0">{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Center */}
      <div className="xl:col-span-6 space-y-5">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1a7a] via-[#3b23b8] to-[#5338ec] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-[#c7beff] mb-2">Share Your Knowledge</p>
          <h2 className="text-xl sm:text-2xl font-display font-bold leading-snug mb-2 max-w-sm">
            Write and share an article with the MarketSyde community.
          </h2>
          <p className="text-sm text-[#d7d2ff] max-w-sm mb-5">
            Insights, strategies, market trends or broker reviews. Help other traders grow while earning rewards.
          </p>
          <button
            onClick={() => onShowToast('Opening article editor...')}
            className="flex items-center gap-1.5 bg-white text-[#3b23b8] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Write an Article <ChevronRight className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 items-center justify-center w-28 h-28 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <PenSquare className="w-12 h-12 text-white/80" />
          </div>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-[#f8fafc] rounded-full p-1">
            {(['latest', 'trending', 'following', 'saved'] as ArticleTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                  tab === t ? 'bg-white text-[#5338ec] shadow-xs' : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                {t === 'saved' ? 'Saved Article' : t}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
          </div>
        </div>

        {/* Article list */}
        <div className="space-y-5">
          {filtered.map((a) => (
            <div key={a.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex gap-4">
                <img src={a.thumbnail} alt={a.title} className="w-32 sm:w-40 aspect-video rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${a.categoryClass}`}>
                      {a.categoryLabel}
                    </span>
                    <button
                      onClick={() => onShowToast('More options')}
                      className="text-slate-400 hover:text-slate-600 shrink-0"
                      aria-label="More"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-[#0b1c30] leading-snug mb-1 hover:text-[#5338ec] cursor-pointer transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-sm text-[#474556] leading-relaxed line-clamp-2 mb-2">{a.excerpt}</p>

                  <div className="flex items-center gap-2 mb-2">
                    <img src={a.authorAvatar} alt={a.authorName} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-[#0b1c30]">{a.authorName}</span>
                    {a.verified && <span className="text-sky-500 text-xs">✓</span>}
                    <span className="text-xs text-[#94a3b8]">· {a.timeAgo} · {a.readTime}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#94a3b8] font-semibold">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {(a.views / 1000).toFixed(1)}K
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> {a.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> {a.comments}
                    </span>
                    <button
                      onClick={() => toggleSave(a.id)}
                      className={`ml-auto flex items-center gap-1 transition-colors ${
                        savedIds[a.id] ? 'text-[#5338ec]' : 'hover:text-[#5338ec]'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedIds[a.id] ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-[#474556]">No articles match these filters yet.</div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="xl:col-span-3 space-y-5">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FE] flex items-center justify-center mb-3">
            <PenSquare className="w-5 h-5 text-[#5338ec]" />
          </div>
          <h4 className="text-sm font-bold text-[#0b1c30] mb-1.5">Create Article</h4>
          <p className="text-xs text-[#474556] leading-relaxed mb-4">
            Share your insights, strategies or market analysis with the community.
          </p>
          <button
            onClick={() => onShowToast('Opening article editor...')}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#5338ec] to-[#7c6ef0] text-white text-sm font-bold py-2.5 rounded-xl mb-4 hover:brightness-105 transition-all"
          >
            Write an Article <ChevronRight className="w-4 h-4" />
          </button>
          <ul className="space-y-2">
            {[
              'Earn credits for quality content',
              'Get featured on the platform',
              'Build your reputation',
              'Help other traders grow',
            ].map((line) => (
              <li key={line} className="flex items-center gap-2 text-xs text-[#474556]">
                <Shield className="w-3.5 h-3.5 text-[#5338ec] shrink-0" /> {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30]">
              <span className="text-rose-500">🔥</span> Recommended Topics
            </h4>
            <button onClick={() => onShowToast('Opening all topics')} className="text-xs font-semibold text-[#5338ec] hover:underline shrink-0">
              View All →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ARTICLE_RECOMMENDED_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setSearch(t.replace('#', ''))}
                className="px-2.5 py-1 rounded-full bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold hover:bg-[#E0E3FC] transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30]">
              <Crown className="w-4 h-4 text-[#F5B700] fill-[#F5B700]" /> Top Article Authors
            </h4>
            <button onClick={() => onShowToast('Opening author leaderboard')} className="text-xs font-semibold text-[#5338ec] hover:underline shrink-0">
              View All
            </button>
          </div>
          <div className="space-y-1">
            {TOP_ARTICLE_AUTHORS.map((author) => (
              <div key={author.rank} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-mono text-slate-400 w-3.5 shrink-0">{author.rank}</span>
                  <img src={author.avatar} alt={author.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-xs font-semibold text-[#0b1c30] truncate">
                      {author.name}
                      {author.verified && <span className="text-sky-500">✓</span>}
                    </p>
                    <p className="text-[10px] text-[#94a3b8] font-medium">{author.articles} articles</p>
                  </div>
                </div>
                <Crown className={`w-4 h-4 shrink-0 ${MEDAL_STYLE[author.rank] || 'text-slate-200'}`} />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
