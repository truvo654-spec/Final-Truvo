import React, { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { TRENDING_POSTS } from '../../data/communityTrendingPostsData';
import { CommunityTrendingSidebar } from './CommunityTrendingSidebar';
import { CommunityTrendingPostCard } from './CommunityTrendingPostCard';

type MarketFilter = 'All' | 'Crypto' | 'Forex' | 'Stocks' | 'Commodities';
type TypeFilter = 'All' | 'Blog' | 'Poll';
type SortFilter = 'Popular' | 'Newest';

interface CommunityTrendingPostsViewProps {
  onShowToast: (msg: string) => void;
}

export const CommunityTrendingPostsView: React.FC<CommunityTrendingPostsViewProps> = ({ onShowToast }) => {
  const [market, setMarket] = useState<MarketFilter>('All');
  const [postType, setPostType] = useState<TypeFilter>('All');
  const [sort, setSort] = useState<SortFilter>('Popular');
  const [followOnly, setFollowOnly] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = TRENDING_POSTS.filter(
      (p) =>
        (market === 'All' || p.market === market) &&
        (postType === 'All' || p.postType === postType) &&
        (!search.trim() ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.authorName.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === 'Popular') {
      list = [...list].sort((a, b) => b.influenceScore - a.influenceScore);
    }
    return list;
  }, [market, postType, sort, search]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
      <div>
        <CommunityTrendingSidebar />
      </div>

      <div>
        {/* Header + filters */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 mb-5">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-[#0b1c30]">Trending Posts</h2>
              <label className="flex items-center gap-2 mt-2 text-xs font-medium text-[#474556] cursor-pointer">
                <input
                  type="checkbox"
                  checked={followOnly}
                  onChange={(e) => {
                    setFollowOnly(e.target.checked);
                    onShowToast(e.target.checked ? 'Showing only people you follow' : 'Showing everyone');
                  }}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]"
                />
                Show only your follow
              </label>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value as MarketFilter)}
                  className="appearance-none text-xs font-semibold text-[#0b1c30] border border-slate-200 rounded-xl pl-3 pr-7 py-2 bg-white"
                >
                  {(['All', 'Crypto', 'Forex', 'Stocks', 'Commodities'] as MarketFilter[]).map((m) => (
                    <option key={m} value={m}>
                      {m === 'All' ? 'Market' : m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as TypeFilter)}
                  className="appearance-none text-xs font-semibold text-[#0b1c30] border border-slate-200 rounded-xl pl-3 pr-7 py-2 bg-white"
                >
                  {(['All', 'Blog', 'Poll'] as TypeFilter[]).map((t) => (
                    <option key={t} value={t}>
                      {t === 'All' ? 'Post type' : t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortFilter)}
                  className="appearance-none text-xs font-semibold text-[#0b1c30] border border-slate-200 rounded-xl pl-3 pr-7 py-2 bg-white"
                >
                  <option value="Popular">Sort: Popular</option>
                  <option value="Newest">Sort: Newest</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts or users..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
          </div>
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((post) => (
            <CommunityTrendingPostCard key={post.id} post={post} onShowToast={onShowToast} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-[#474556]">
              No posts match these filters yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
