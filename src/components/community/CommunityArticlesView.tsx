import React, { useState } from 'react';
import {
  BookOpen,
  Eye,
  Heart,
  Share2,
  Clock,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { CommunityArticle } from '../../types';
import { COMMUNITY_ARTICLES } from '../../data/communityData';

interface CommunityArticlesViewProps {
  articles?: CommunityArticle[];
  onSelectAuthorByName?: (authorName: string) => void;
  onShowToast: (msg: string) => void;
}

export const CommunityArticlesView: React.FC<CommunityArticlesViewProps> = ({
  articles = COMMUNITY_ARTICLES,
  onSelectAuthorByName,
  onShowToast,
}) => {
  const [selectedArticle, setSelectedArticle] = useState<CommunityArticle | null>(null);
  const [articlesList, setArticlesList] = useState<CommunityArticle[]>(articles);
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});

  const handleToggleLike = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = !likedArticles[articleId];
    setLikedArticles((prev) => ({ ...prev, [articleId]: isLiked }));
    setArticlesList((prev) =>
      prev.map((a) =>
        a.id === articleId
          ? { ...a, likes: isLiked ? a.likes + 1 : a.likes - 1 }
          : a
      )
    );
    if (isLiked) {
      onShowToast('❤️ Liked article! +5 Points for reading and engaging');
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#0b1c30] font-display">Latest Research & Articles</h3>
          <p className="text-xs text-[#474556] mt-0.5">
            Institutional macro reports, market structure breakdowns, and tokenomics analyses.
          </p>
        </div>

        <button
          onClick={() => onShowToast('All 34 verified community reports available')}
          className="flex items-center gap-1 text-xs text-[#5338ec] hover:text-[#4326d8] font-semibold transition-colors"
        >
          <span>See All Articles</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3-Column Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articlesList.map((art) => {
          const isLiked = likedArticles[art.id];
          return (
            <article
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden text-[#0b1c30] shadow-xs hover:border-[#cbd5e1] hover:shadow-sm transition-all cursor-pointer flex flex-col group"
            >
              {/* Thumbnail header */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={art.thumbnail}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-xs border ${
                      art.badgeColor || 'bg-white/90 text-[#0b1c30] border-slate-200 shadow-xs'
                    }`}
                  >
                    {art.tickerBadge}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#0b1c30] group-hover:text-[#5338ec] line-clamp-2 leading-snug transition-colors">
                    {art.title}
                  </h4>
                  <p className="text-xs text-[#474556] line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                {/* Footer publisher & stats */}
                <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAuthorByName?.(art.publisher.name);
                    }}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={art.publisher.avatar}
                      alt={art.publisher.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-semibold text-[#0b1c30] text-xs truncate max-w-[110px]">
                      {art.publisher.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[#474556] font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{art.views}</span>
                    </span>

                    <button
                      onClick={(e) => handleToggleLike(art.id, e)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{art.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ─── FULL ARTICLE READER MODAL ─── */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-[#0b1c30] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            {/* Modal Article Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    selectedArticle.badgeColor || 'bg-slate-100 text-[#0b1c30]'
                  }`}
                >
                  {selectedArticle.tickerBadge}
                </span>
                <span className="text-xs text-[#474556] font-mono">
                  {selectedArticle.readTime || '4 min read'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-[#474556] font-mono">
                  {selectedArticle.date}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0b1c30] leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center gap-3 py-3 border-y border-[#f1f5f9]">
                <img
                  src={selectedArticle.publisher.avatar}
                  alt={selectedArticle.publisher.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">
                    {selectedArticle.publisher.name}
                  </p>
                  <p className="text-[11px] text-[#474556] font-mono">Verified Publisher</p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden aspect-video w-full bg-slate-100 border border-slate-200">
                <img
                  src={selectedArticle.thumbnail}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-[#0b1c30] text-sm leading-relaxed whitespace-pre-line py-2">
                {selectedArticle.content || selectedArticle.summary}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#f1f5f9]">
                <button
                  onClick={(e) => handleToggleLike(selectedArticle.id, e)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    likedArticles[selectedArticle.id]
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-[#f1f5f9] text-[#474556] hover:bg-slate-200'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedArticles[selectedArticle.id] ? 'fill-current text-rose-500' : ''
                    }`}
                  />
                  <span>
                    {selectedArticle.likes + (likedArticles[selectedArticle.id] ? 1 : 0)} Likes
                  </span>
                </button>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="bg-[#5338ec] hover:bg-[#4326d8] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
