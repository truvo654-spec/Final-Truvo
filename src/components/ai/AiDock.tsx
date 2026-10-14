import React, { useEffect, useMemo, useState } from 'react';
import { AiGhost } from './AiGhost';
import { UserProfile, MarketSignal, Broker } from '../../types';
import { SpotlightData } from './AiSpotlightPanel';
import { AiDashboardPanel } from './AiDashboardPanel';
import { AiIntro } from './AiIntro';
import {
  advisorsRead, alertsRead, calendarRead, communityRead, dashboardRead, educationRead,
  journalRead, leaderboardRead, newsRead, pointsRead, portfolioRead, promotionsRead, signalsRead,
  strategyRead, toSpotlight, DEMO_ALERTS, instrumentListStrip,
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
      return toSpotlight(d, 'Read your trades, the calendar and today\u2019s news', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'See the calendar', sub: 'Check upcoming news, earnings and events.', onClick: () => go('economic-calendar') },
        ask,
      ], {
        Open: 'Positions still running across your connected accounts.',
        Floating: 'Unrealised profit and loss on those open positions.',
        '7d net': 'Realised result from trades you closed in the last seven days.',
        '30d drawdown': 'The deepest fall from a peak in your equity over 30 days.',
      });
    }
    case 'signals': {
      const live = signals.filter((s) => s.action !== 'UPGRADE');
      return toSpotlight(signalsRead(signals as never, user.tierLevel), `Read ${live.length} open signals`, [
        { label: 'Find a broker', sub: 'Compare spreads, cashback and regulation.', onClick: () => go('brokers') },
        { label: 'Check the calendar', sub: 'See what can move your positions today.', onClick: () => go('economic-calendar') },
        ask,
      ], {
        'Open signals': 'Calls currently published for your level.',
        Long: 'How many of them point up.',
        Short: 'How many point down.',
        'Avg confidence': 'The average confidence the desk put on these calls. Not a win rate.',
      });
    }
    case 'instrument-analysis': {
      const d = signalsRead(signals as never, user.tierLevel);
      return toSpotlight(
        { ...d, headline: 'What is moving, and what is due', overview: instrumentListStrip(signals as never) },
        'Read the instrument list, signals and calendar',
        [
          { label: 'Open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
          { label: 'Check the calendar', sub: 'See what can move these instruments today.', onClick: () => go('economic-calendar') },
          ask,
        ],
        {
          'Open signals': 'Calls published across these instruments.',
          Long: 'How many point up.',
          Short: 'How many point down.',
          'Avg confidence': 'Average confidence on those calls. Not a win rate.',
        },
      );
    }
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
      return toSpotlight(portfolioRead([], 30), 'Read your accounts, trades and goals', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'Review alerts', sub: 'What is close to firing and what is noise.', onClick: () => go('alerts') },
        ask,
      ], {
        Equity: 'Balance across the accounts you picked.',
        '30d net': 'Realised result from trades closed in 30 days.',
        'Max drawdown': 'Deepest fall from a peak in that window.',
        Floating: 'Unrealised profit and loss on what is still open.',
      });
    case 'alerts':
      return toSpotlight(alertsRead(DEMO_ALERTS, user.tierLevel >= 3 ? 999 : user.tierLevel === 2 ? 25 : 5), 'Read your alerts and the live quotes', [
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
    case 'trading-journal':
      return toSpotlight(journalRead(), 'Read your journal entries', [
        { label: 'Review my accounts', sub: 'Equity, drawdown, margin and goals.', onClick: () => go('portfolio-tracker') },
        { label: 'Build a strategy', sub: 'Turn the pattern into rules and test it.', onClick: () => go('strategy-builder') },
        ask,
      ], {
        Closed: 'Trades you logged with a result.',
        Net: 'Everything those closed trades made or lost.',
        'Win rate': 'Share of them that finished green.',
        'Average R': 'Average result measured in multiples of what you risked.',
      });
    case 'strategy-builder':
      return toSpotlight(strategyRead(), 'Read your playbooks and their live trades', [
        { label: 'Open the journal', sub: 'Your entries, playbooks and reviews.', onClick: () => go('trading-journal') },
        { label: 'Review my accounts', sub: 'Equity, drawdown, margin and goals.', onClick: () => go('portfolio-tracker') },
        ask,
      ], {
        Playbooks: 'Rule sets you have written up.',
        'With live trades': 'How many have real trades tagged to them.',
        'Best net': 'The strongest playbook by money.',
        'Weakest net': 'The one giving money back.',
      });
    case 'points-credits':
      return toSpotlight(pointsRead(user), 'Read your level, credits and missions', [
        { label: 'See offers', sub: 'What is live for your level and when it closes.', onClick: () => go('promotions') },
        { label: 'Open the leaderboard', sub: 'Where you stand and the gap above.', onClick: () => go('leaderboard') },
        ask,
      ]);
    case 'leaderboard':
      return toSpotlight(leaderboardRead(), 'Read the standings for this period', [
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

/** The mascot bobs, blinks and sends out a ring so the pill reads as live. */
const AI_PILL_CSS = `
@keyframes ai-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ai-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(0.1)}}
@keyframes ai-ring{0%{transform:scale(.85);opacity:.45}70%{transform:scale(1.25);opacity:0}100%{opacity:0}}
.ai-pill{position:fixed}
.ai-pill-ghost{animation:ai-bob 2.8s ease-in-out infinite}
.ai-pill:hover .ai-pill-ghost{animation-duration:1.1s}
.ai-ghost-eyes{animation:ai-blink 5s ease-in-out infinite}
.ai-pill-ring{position:absolute;inset:0;border-radius:9999px;border:2px solid #5945F1;animation:ai-ring 2.8s ease-out infinite;pointer-events:none}
@media (prefers-reduced-motion: reduce){
  .ai-pill-ghost,.ai-ghost-eyes,.ai-pill-ring{animation:none}
  .ai-pill-ring{opacity:0}
}
`;

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
      <>
        <style>{AI_PILL_CSS}</style>
        <button
          type="button"
          onClick={() => shut(false)}
          aria-label="Show the MarketSyde AI summary"
          data-keep-button-icons
          className="ai-pill group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-[#d0cbfb] bg-white py-3 pl-4 pr-5 text-[15px] font-bold text-[#5945F1] shadow-[0_10px_30px_rgba(89,69,241,0.18)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(89,69,241,0.26)] active:translate-y-0 active:scale-[0.98] dark:border-[#2a1a66] dark:bg-[#0f0726] dark:text-[#a99bff] print:hidden"
        >
          <span className="ai-pill-ring" aria-hidden />
          <AiGhost className="ai-pill-ghost h-5 w-5 shrink-0" />
          <span>MarketSyde AI</span>
        </button>
      </>
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
