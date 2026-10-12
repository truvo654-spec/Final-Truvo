import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { UserProfile, MarketSignal, Broker } from '../../types';
import { AiSpotlightPanel, SpotlightData } from './AiSpotlightPanel';
import {
  advisorsRead, alertsRead, calendarRead, communityRead, dashboardRead, educationRead,
  leaderboardRead, newsRead, pointsRead, portfolioRead, promotionsRead, signalsRead,
  strategyRead, toSpotlight,
} from './aiFeature';
import { INITIAL_FEED_POSTS, MORE_FEED_POSTS, COMMUNITY_ARTICLES } from '../../data/communityData';
import { brokerListStrip, brokerCompareNote } from './aiFeature';

export interface AiDockContext {
  tab: string;
  user: UserProfile;
  signals: MarketSignal[];
  brokers: Broker[];
  go: (tab: string) => void;
}

const line = (label: string, body: string) => ({ label, body });

/** The read for the page the person is on, or null where the dock stays shut. */
export function dockFor({ tab, user, signals, brokers, go }: AiDockContext): SpotlightData | null {
  const ask = { label: 'Ask the AI Companion', onClick: () => go('ai-companion') };

  switch (tab) {
    case 'dashboard': {
      const d = dashboardRead(user, signals as never);
      return toSpotlight(d, 'Read your morning', [
        { label: 'Open my journal', onClick: () => go('trading-journal') },
        { label: 'See the calendar', onClick: () => go('economic-calendar') },
        ask,
      ]);
    }
    case 'signals': {
      const live = signals.filter((s) => s.action !== 'UPGRADE');
      return toSpotlight(signalsRead(signals as never, user.tierLevel), `Read ${live.length} open signals`, [
        { label: 'Find a broker', onClick: () => go('brokers') },
        { label: 'Check the calendar', onClick: () => go('economic-calendar') },
        ask,
      ]);
    }
    case 'instrument-analysis':
      return toSpotlight(signalsRead(signals as never, user.tierLevel), 'Read the instrument list', [
        { label: 'Open signals', onClick: () => go('signals') },
        { label: 'Check the calendar', onClick: () => go('economic-calendar') },
        ask,
      ]);
    case 'economic-calendar':
      return toSpotlight(calendarRead(), 'Read the calendar', [
        { label: 'See open signals', onClick: () => go('signals') },
        { label: 'Review my positions', onClick: () => go('portfolio-tracker') },
        ask,
      ]);
    case 'news':
      return toSpotlight(newsRead(), "Read today's stories", [
        { label: 'See open signals', onClick: () => go('signals') },
        { label: 'Open the calendar', onClick: () => go('economic-calendar') },
        ask,
      ]);
    case 'education-hub':
      return toSpotlight(educationRead(undefined, undefined, user.tierLevel), 'Read the course list', [
        { label: 'Open my journal', onClick: () => go('trading-journal') },
        { label: 'See my points', onClick: () => go('points-credits') },
        ask,
      ]);
    case 'brokers':
      return {
        pretext: `Read ${brokers.length} brokers`,
        headline: 'Cheapest spread is not the same as cheapest',
        overview: brokerListStrip(brokers as never),
        tabs: [{ id: 'summary', label: 'Summary', lines: [] }],
        suggestions: [
          { label: 'Compare side by side', onClick: () => go('broker-comparison') },
          { label: 'See offers', onClick: () => go('promotions') },
          ask,
        ],
        footnote: 'Built from the broker directory. Not financial advice.',
      };
    case 'broker-comparison': {
      const n = brokerCompareNote(brokers as never);
      if (!n) return null;
      return {
        pretext: `Compared ${brokers.length} brokers`,
        headline: 'What the gap is worth at 20 lots a month',
        overview: n.text,
        tabs: [{ id: 'summary', label: 'Summary', lines: [] }],
        suggestions: [
          { label: 'See offers', onClick: () => go('promotions') },
          { label: 'Open cashback', onClick: () => go('cashback-overview') },
          ask,
        ],
        footnote: 'Commission tiers and execution are not in this number.',
      };
    }
    case 'promotions':
      return toSpotlight(promotionsRead(undefined, user.tierLevel), 'Read the live offers', [
        { label: 'Open cashback', onClick: () => go('cashback-overview') },
        { label: 'See my level', onClick: () => go('points-credits') },
        ask,
      ]);
    case 'portfolio-tracker':
      return toSpotlight(portfolioRead([], 30), 'Read your accounts', [
        { label: 'Open my journal', onClick: () => go('trading-journal') },
        { label: 'Review alerts', onClick: () => go('alerts') },
        ask,
      ]);
    case 'alerts':
      return toSpotlight(alertsRead([], user.tierLevel >= 3 ? 999 : user.tierLevel === 2 ? 25 : 5), 'Read your alerts', [
        { label: 'See open signals', onClick: () => go('signals') },
        { label: 'Check the calendar', onClick: () => go('economic-calendar') },
        ask,
      ]);
    case 'expert-advisors':
      return toSpotlight(advisorsRead(undefined, user.tierLevel), 'Read the advisor listings', [
        { label: 'Open the backtest', onClick: () => go('trading-journal') },
        { label: 'Find a broker', onClick: () => go('brokers') },
        ask,
      ]);
    case 'strategy-builder':
    case 'trading-journal':
      return toSpotlight(strategyRead(), 'Read your playbooks', [
        { label: 'Open the journal', onClick: () => go('trading-journal') },
        { label: 'Review my accounts', onClick: () => go('portfolio-tracker') },
        ask,
      ]);
    case 'points-credits':
      return toSpotlight(pointsRead(user), 'Read your level', [
        { label: 'See offers', onClick: () => go('promotions') },
        { label: 'Open the leaderboard', onClick: () => go('leaderboard') },
        ask,
      ]);
    case 'leaderboard':
      return toSpotlight(leaderboardRead(), 'Read the standings', [
        { label: 'See my points', onClick: () => go('points-credits') },
        { label: 'Open cashback', onClick: () => go('cashback-overview') },
        ask,
      ]);
    case 'community': {
      const posts = [...INITIAL_FEED_POSTS, ...MORE_FEED_POSTS].map((p) => ({
        name: p.author.name, text: p.content, likes: p.likes, saves: p.bookmarksCount ?? 0,
        tags: (p.tags ?? []).map((t) => (t.startsWith('#') ? t : `#${t}`)), own: p.isCurrentUser, comments: p.comments ?? [],
      }));
      const articles = COMMUNITY_ARTICLES.map((a) => ({
        title: a.title, category: a.tickerBadge, author: a.publisher.name,
        views: a.views >= 1000 ? `${(a.views / 1000).toFixed(1)}k` : String(a.views), comments: a.likes, saves: a.likes,
      }));
      return toSpotlight(communityRead(posts, articles), 'Read the community', [
        { label: 'Open the articles', onClick: () => go('community') },
        { label: 'See my points', onClick: () => go('points-credits') },
        ask,
      ]);
    }
    default:
      return null;
  }
}

const STORE = 'marketsyde.aiDock.closed';

/** Docks the spotlight panel in the bottom right of every feature page. */
export const AiDock: React.FC<AiDockContext> = (ctx) => {
  const [closed, setClosed] = useState(false);
  const data = useMemo(() => {
    try { return dockFor(ctx); } catch { return null; }
  }, [ctx.tab, ctx.user, ctx.signals, ctx.brokers]);

  useEffect(() => {
    try { setClosed(window.localStorage.getItem(STORE) === '1'); } catch { /* ignore */ }
  }, []);

  const shut = (v: boolean) => {
    setClosed(v);
    try { window.localStorage.setItem(STORE, v ? '1' : '0'); } catch { /* ignore */ }
  };

  if (!data) return null;

  if (closed) {
    return (
      <button
        type="button"
        onClick={() => shut(false)}
        aria-label="Show the MarketSyde AI summary"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-[#d0cbfb] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#5945F1] shadow-[0_6px_24px_rgba(11,28,48,0.12)] transition hover:bg-[#f7f6ff] print:hidden"
      >
        <Sparkles className="h-4 w-4" aria-hidden />MarketSyde AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[min(380px,calc(100vw-2.5rem))] print:hidden">
      <div className="relative">
        <button
          type="button"
          onClick={() => shut(true)}
          aria-label="Close the MarketSyde AI summary"
          className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#d0cbfb] bg-white text-[#64748b] shadow transition hover:text-[#5945F1]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <AiSpotlightPanel
          data={data}
          storageKey={ctx.tab}
          className="max-h-[min(70vh,560px)] overflow-y-auto shadow-[0_10px_40px_rgba(11,28,48,0.14)]"
        />
      </div>
    </div>
  );
};
