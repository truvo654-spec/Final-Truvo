import React, { useState } from 'react';
import {
  Flame,
  Radio,
  Bell,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Play,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  TOP_INFLUENCERS,
  OTHER_INFLUENCERS,
} from '../../data/communityData';
import { CommunityInfluencer } from '../../types';

interface CommunityRightSidebarProps {
  mode?: 'default' | 'profile';
  onSelectInfluencer?: (influencer: CommunityInfluencer) => void;
  onOpenHotTopic?: () => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityRightSidebar: React.FC<CommunityRightSidebarProps> = ({
  mode = 'default',
  onSelectInfluencer,
  onOpenHotTopic,
  onShowToast,
}) => {
  const [influencerTab, setInfluencerTab] = useState<'social' | 'depth'>('social');
  const [isLiveReminded, setIsLiveReminded] = useState(false);
  const [liveIndex, setLiveIndex] = useState(1);

  const handleToggleReminder = () => {
    setIsLiveReminded(!isLiveReminded);
    if (!isLiveReminded) {
      onShowToast?.('🔔 Live reminder set for "Weekly Crypto Forecast" (Sep 07, 22:00)');
    } else {
      onShowToast?.('Reminder removed');
    }
  };

  const handlePrevLive = () => {
    setLiveIndex((prev) => (prev > 1 ? prev - 1 : 4));
  };

  const handleNextLive = () => {
    setLiveIndex((prev) => (prev < 4 ? prev + 1 : 1));
  };

  return (
    <div className="space-y-4 w-full xl:sticky xl:top-[84px] xl:max-h-[calc(100vh-96px)] xl:overflow-y-auto xl:overscroll-contain sidebar-scrollbar">
      {/* ─── 1. HOT TOPIC WIDGET ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs hover:border-[#cbd5e1] hover:shadow-sm transition-all relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onOpenHotTopic}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Hot Topic</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
            LIVE DISCUSS
          </span>
        </div>

        <h4
          onClick={onOpenHotTopic}
          className="text-sm font-semibold text-[#0b1c30] hover:text-[#5338ec] cursor-pointer line-clamp-2 mb-3 leading-snug transition-colors"
        >
          $115M wiped out in an hour on Iran news. Does BTC hold $75K or hit $70K?
        </h4>

        <div className="flex items-center justify-between pt-1">
          <div className="inline-flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2.5 py-1 text-xs font-medium">
            <span className="text-amber-500 font-bold">₿</span>
            <span className="text-[#0b1c30] font-semibold">BTC</span>
            <span className="text-emerald-600 font-mono text-[11px] font-semibold">+1.34%</span>
          </div>

          <button
            onClick={onOpenHotTopic}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#f1f5f9] hover:bg-[#5338ec] text-[#0b1c30] hover:text-white px-3 py-1.5 rounded-xl transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Check it out</span>
          </button>
        </div>
      </div>

      {/* ─── 2. UPCOMING LIVES WIDGET ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1c30]">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Upcoming Lives</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-1 text-xs text-[#474556] font-mono">
            <button
              onClick={handlePrevLive}
              className="p-0.5 hover:text-[#0b1c30] hover:bg-slate-100 rounded transition-colors"
              title="Previous Live"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-[#474556]">{liveIndex}/4</span>
            <button
              onClick={handleNextLive}
              className="p-0.5 hover:text-[#0b1c30] hover:bg-slate-100 rounded transition-colors"
              title="Next Live"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#0b1c30] line-clamp-1">
                {liveIndex === 1 && 'Weekly Crypto Forecast'}
                {liveIndex === 2 && 'Macro FX & NFP Liquidity Prep'}
                {liveIndex === 3 && 'Layer 2 Tokenomics & Rebates'}
                {liveIndex === 4 && 'Institutional Hedging Masterclass'}
              </p>
              <p className="text-[11px] text-[#474556] mt-1 font-mono">
                {liveIndex === 1 && '22:00, Sep 07 | 92 going'}
                {liveIndex === 2 && '14:30, Sep 08 | 148 going'}
                {liveIndex === 3 && '19:00, Sep 09 | 81 going'}
                {liveIndex === 4 && '16:00, Sep 10 | 210 going'}
              </p>
            </div>
            <span className="shrink-0 w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xs font-bold">
              🎙️
            </span>
          </div>
        </div>

        <button
          onClick={handleToggleReminder}
          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            isLiveReminded
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-[#5338ec] hover:bg-[#4326d8] text-white shadow-xs'
          }`}
        >
          {isLiveReminded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Reminder Set</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5" />
              <span>Set Reminder</span>
            </>
          )}
        </button>
      </div>

      {/* ─── 3. TOP INFLUENCERS / OTHER INFLUENCERS ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#0b1c30]">
              {mode === 'profile' ? 'Other Influencers' : 'Top Influencers'}
            </h4>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 rounded-lg bg-[#0b1c30] text-white text-[10px] z-30 shadow-lg">
                Ranked according to social influence algorithm, sentiment volume, and verified alpha call accuracy.
              </div>
            </div>
          </div>
        </div>

        {mode !== 'profile' && (
          <div className="flex items-center p-1 bg-[#f1f5f9] border border-slate-200 rounded-xl mb-3 text-xs">
            <button
              onClick={() => setInfluencerTab('social')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                influencerTab === 'social'
                  ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              Social Influence
            </button>
            <button
              onClick={() => setInfluencerTab('depth')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                influencerTab === 'depth'
                  ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                  : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              Analytical Depth
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          {(mode === 'profile' ? OTHER_INFLUENCERS : TOP_INFLUENCERS).map((inf, idx) => {
            const isBullish = inf.sentiment === 'Bullish';
            return (
              <div
                key={inf.id}
                onClick={() => onSelectInfluencer?.(inf)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono text-slate-400 w-4 text-center">
                    {inf.rank || idx + 1}
                  </span>
                  <div className="relative shrink-0">
                    <img
                      src={inf.avatar}
                      alt={inf.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    {inf.verified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border border-white flex items-center justify-center text-[7px] text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0b1c30] group-hover:text-[#5338ec] truncate transition-colors">
                      {inf.name}
                    </p>
                    <p className="text-[10px] text-[#474556] font-mono">
                      {influencerTab === 'social'
                        ? `${inf.influenceScore.toFixed(2)} Score`
                        : `${inf.analyticalDepth || '92.0'} Depth`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono ${
                      isBullish
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isBullish ? `Bullish ${inf.sentimentScore || '4.00'}` : 'Neutral'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
