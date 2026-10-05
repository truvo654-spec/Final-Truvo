import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../../types';
import { NEWS_ARTICLES } from '../../data/newsData';

type NewsTab = 'all' | 'market' | 'research';

interface CommunityNewsWidgetProps {
  onSelectArticle?: (article: NewsArticle) => void;
}

const DOT_COLOR: Record<string, string> = {
  Forex: 'bg-[#5945F1]',
  Crypto: 'bg-[#FD02B0]',
  Commodity: 'bg-[#CAEB0E]',
  Indices: 'bg-sky-500',
  Stocks: 'bg-amber-500',
};

function tabLabelFor(article: NewsArticle): string {
  if (article.expertSummary) return 'Research';
  if (article.assetClass === 'Forex' || article.assetClass === 'Indices') return 'Macro';
  return 'Market Update';
}

export const CommunityNewsWidget: React.FC<CommunityNewsWidgetProps> = ({ onSelectArticle }) => {
  const [tab, setTab] = useState<NewsTab>('all');
  const [page, setPage] = useState(0);

  const withLabels = NEWS_ARTICLES.map((a) => ({ article: a, label: tabLabelFor(a) }));
  const filtered = withLabels.filter(
    (x) => tab === 'all' || (tab === 'market' && x.label !== 'Research') || (tab === 'research' && x.label === 'Research')
  );
  const perPage = 3;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs">
      <h3 className="font-display font-extrabold text-base text-[#0b1c30] mb-3">
        Today's <span className="text-[#5945F1]">News.</span>
      </h3>

      <div className="flex items-center gap-1 bg-[#f8fafc] rounded-full p-1 mb-4 w-fit">
        {([
          { id: 'all', label: 'All News' },
          { id: 'market', label: 'Market' },
          { id: 'research', label: 'Research' },
        ] as { id: NewsTab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              tab === t.id ? 'bg-white text-[#5945F1] shadow-xs' : 'text-[#474556] hover:text-[#0b1c30]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map(({ article, label }) => (
          <button
            key={article.id}
            onClick={() => onSelectArticle?.(article)}
            className="w-full flex items-start gap-3 text-left group"
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT_COLOR[article.assetClass]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#5945F1] group-hover:underline">
                {label} <span className="text-[#94a3b8] font-medium">· {article.timestamp}</span>
              </p>
              <p className="text-sm font-semibold text-[#0b1c30] leading-snug mt-0.5 line-clamp-2">
                {article.headline}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {article.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-[11px] font-semibold text-[#474556]">
                    #{t.replace(/\s/g, '')}
                  </span>
                ))}
              </div>
            </div>
            <img
              src={article.thumbnail}
              alt={article.headline}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100"
            />
          </button>
        ))}

        {visible.length === 0 && <p className="text-sm text-[#474556] py-6 text-center">No articles in this view yet.</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f1f5f9]">
          <button
            onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
            aria-label="Previous"
            className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#5945F1] hover:border-[#5945F1] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === page ? 'w-4 bg-[#5945F1]' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => (p + 1) % totalPages)}
            aria-label="Next"
            className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#5945F1] hover:border-[#5945F1] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
