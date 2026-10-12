import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { UserProfile, MarketSignal, Broker } from '../../types';
import { SpotlightData } from './AiSpotlightPanel';
import { AiDashboardPanel } from './AiDashboardPanel';
import { AiIntro } from './AiIntro';
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
  const ask = { label: 'Ask the AI Companion', sub: 'Get analysis, ideas and answers tailored to your trading.', onClick: () => go('ai-companion') };

  switch (tab) {
    case 'dashboard': {
      const d = dashboardRead(user, signals as never);
      return toSpotlight(d, 'Read your morning', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'See the calendar', sub: 'Check upcoming news, earnings and events.', onClick: () => go('economic-calendar') },
        ask,
      ]);
    }
    case 'signals': {
      const live = signals.filter((s) => s.action !== 'UPGRADE');
      return toSpotlight(signalsRead(signals as never, user.tierLevel), `Read ${live.length} open signals`, [
        { label: 'Find a broker', sub: 'Compare spreads, cashback and regulation.', onClick: () => go('brokers') },
        { label: 'Check the calendar', sub: 'See what can move your positions today.', onClick: () => go('economic-calendar') },
        ask,
      ]);
    }
    case 'instrument-analysis':
      return toSpotlight(signalsRead(signals as never, user.tierLevel), 'Read the instrument list', [
        { label: 'Open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
        { label: 'Check the calendar', sub: 'See what can move your positions today.', onClick: () => go('economic-calendar') },
        ask,
      ]);
    case 'economic-calendar':
      return toSpotlight(calendarRead(), 'Read the calendar', [
        { label: 'See open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
        { label: 'Review my positions', sub: 'Equity, drawdown and what is open.', onClick: () => go('portfolio-tracker') },
        ask,
      ]);
    case 'news':
      return toSpotlight(newsRead(), "Read today's stories", [
        { label: 'See open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
        { label: 'Open the calendar', sub: 'Check upcoming news, earnings and events.', onClick: () => go('economic-calendar') },
        ask,
      ]);
    case 'education-hub':
      return toSpotlight(educationRead(undefined, undefined, user.tierLevel), 'Read the course list', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'See my points', sub: 'Level, missions and what the next tier pays.', onClick: () => go('points-credits') },
        ask,
      ]);
    case 'brokers':
      return {
        pretext: `Read ${brokers.length} brokers`,
        headline: 'Cheapest spread is not the same as cheapest',
        overview: brokerListStrip(brokers as never),
        tabs: [{ id: 'summary', label: 'Summary', lines: [] }],
        suggestions: [
          { label: 'Compare side by side', sub: 'Costs, platforms and regulation in one table.', onClick: () => go('broker-comparison') },
          { label: 'See offers', sub: 'What is live for your level and when it closes.', onClick: () => go('promotions') },
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
          { label: 'See offers', sub: 'What is live for your level and when it closes.', onClick: () => go('promotions') },
          { label: 'Open cashback', sub: 'Credited, pending and the rate per lot.', onClick: () => go('cashback-overview') },
          ask,
        ],
        footnote: 'Commission tiers and execution are not in this number.',
      };
    }
    case 'promotions':
      return toSpotlight(promotionsRead(undefined, user.tierLevel), 'Read the live offers', [
        { label: 'Open cashback', sub: 'Credited, pending and the rate per lot.', onClick: () => go('cashback-overview') },
        { label: 'See my level', onClick: () => go('points-credits') },
        ask,
      ]);
    case 'portfolio-tracker':
      return toSpotlight(portfolioRead([], 30), 'Read your accounts', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'Review alerts', sub: 'What is close to firing and what is noise.', onClick: () => go('alerts') },
        ask,
      ]);
    case 'alerts':
      return toSpotlight(alertsRead([], user.tierLevel >= 3 ? 999 : user.tierLevel === 2 ? 25 : 5), 'Read your alerts', [
        { label: 'See open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
        { label: 'Check the calendar', sub: 'See what can move your positions today.', onClick: () => go('economic-calendar') },
        ask,
      ]);
    case 'expert-advisors':
      return toSpotlight(advisorsRead(undefined, user.tierLevel), 'Read the advisor listings', [
        { label: 'Open the backtest', sub: 'Test a playbook before you trade it again.', onClick: () => go('trading-journal') },
        { label: 'Find a broker', sub: 'Compare spreads, cashback and regulation.', onClick: () => go('brokers') },
        ask,
      ]);
    case 'strategy-builder':
    case 'trading-journal':
      return toSpotlight(strategyRead(), 'Read your playbooks', [
        { label: 'Open the journal', sub: 'Your entries, playbooks and reviews.', onClick: () => go('trading-journal') },
        { label: 'Review my accounts', sub: 'Equity, drawdown, margin and goals.', onClick: () => go('portfolio-tracker') },
        ask,
      ]);
    case 'points-credits':
      return toSpotlight(pointsRead(user), 'Read your level', [
        { label: 'See offers', sub: 'What is live for your level and when it closes.', onClick: () => go('promotions') },
        { label: 'Open the leaderboard', sub: 'Where you stand and the gap above.', onClick: () => go('leaderboard') },
        ask,
      ]);
    case 'leaderboard':
      return toSpotlight(leaderboardRead(), 'Read the standings', [
        { label: 'See my points', sub: 'Level, missions and what the next tier pays.', onClick: () => go('points-credits') },
        { label: 'Open cashback', sub: 'Credited, pending and the rate per lot.', onClick: () => go('cashback-overview') },
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
        { label: 'Open the articles', sub: 'What the community is writing this week.', onClick: () => go('community') },
        { label: 'See my points', sub: 'Level, missions and what the next tier pays.', onClick: () => go('points-credits') },
        ask,
      ]);
    }
    default:
      return null;
  }
}

const STORE = 'marketsyde.aiDock.closed';
const SEEN = 'marketsyde.aiDock.introSeen';

/** Docks the spotlight panel in the bottom right of every feature page. */
export const AiDock: React.FC<AiDockContext> = (ctx) => {
  const [closed, setClosed] = useState(false);
  const [intro, setIntro] = useState(false);
  const data = useMemo(() => {
    try { return dockFor(ctx); } catch { return null; }
  }, [ctx.tab, ctx.user, ctx.signals, ctx.brokers]);

  useEffect(() => {
    try {
      setClosed(window.localStorage.getItem(STORE) === '1');
      setIntro(window.localStorage.getItem(SEEN) !== '1');
    } catch { /* storage can be blocked; show the dock without the invite */ }
  }, []);

  const finishIntro = (start: boolean) => {
    setIntro(false);
    try { window.localStorage.setItem(SEEN, '1'); } catch { /* ignore */ }
    shut(!start);
  };

  const shut = (v: boolean) => {
    setClosed(v);
    try { window.localStorage.setItem(STORE, v ? '1' : '0'); } catch { /* ignore */ }
  };

  if (!data) return null;

  if (intro) {
    return (
      <AiIntro
        open
        onStart={() => finishIntro(true)}
        onLater={() => finishIntro(false)}
        onLearnMore={() => { finishIntro(true); ctx.go('ai-companion'); }}
      />
    );
  }

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(720px,calc(100vw-2rem))] print:hidden">
      <AiDashboardPanel
        data={data}
        greeting={greeting}
        storageKey={ctx.tab}
        onClose={() => shut(true)}
        onAsk={() => ctx.go('ai-companion')}
        className="h-[min(550px,calc(100vh-2rem))]"
      />
    </div>
  );
};
