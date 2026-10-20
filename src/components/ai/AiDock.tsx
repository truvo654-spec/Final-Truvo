import React, { useEffect, useMemo, useState } from 'react';
import { AiGhost } from './AiGhost';
import { AiChecklist, AiCompare, AiMetrics, AiNext, AiProgress, AiVerdict } from './AiWidgets';
import { AiStrip } from './AiSection';
import { UserProfile, MarketSignal, Broker } from '../../types';
import { SpotlightData } from './AiSpotlightPanel';
import { AiDashboardPanel } from './AiDashboardPanel';
import { AiIntro } from './AiIntro';
import {
  advisorsRead, alertsRead, calendarRead, communityRead, dashboardRead, educationRead,
  journalRead, leaderboardRead, newsRead, pointsRead, portfolioRead, promotionsRead, signalsRead,
  strategyRead, toSpotlight, DEMO_ALERTS, instrumentListStrip,
  advisorsCompare, alertsChecklist, backtestChecklist, calendarNext, educationProgress,
  newsVerdict, pointsProgress, portfolioMetrics, promotionsNext, signalsVerdict,
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
  /** The third card: a neighbouring page, never the AI page itself. */
  const to = (tab: string, label: string, sub: string) => ({ label, sub, onClick: () => go(tab) });

  switch (tab) {
    case 'dashboard': {
      const d = dashboardRead(user, signals as never);
      return toSpotlight(d, 'Read your trades, the calendar and today\u2019s news', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'See the calendar', sub: 'Check upcoming news, earnings and events.', onClick: () => go('economic-calendar') },
        to('news', 'Read the morning news', 'What moved overnight and what the desk is watching.'),
      ], {
        Open: 'Positions still running across your connected accounts.',
        Floating: 'Unrealised profit and loss on those open positions.',
        '7d net': 'Realised result from trades you closed in the last seven days.',
        '30d drawdown': 'The deepest fall from a peak in your equity over 30 days.',
      });
    }
    case 'signals': {
      const live = signals.filter((s) => s.action !== 'UPGRADE');
      return { ...toSpotlight(signalsRead(signals as never, user.tierLevel), `Read ${live.length} open signals`, [
        { label: 'Find a broker', sub: 'Compare spreads, cashback and regulation.', onClick: () => go('brokers') },
        { label: 'Check the calendar', sub: 'See what can move your positions today.', onClick: () => go('economic-calendar') },
        to('alerts', 'Set an alert', 'Mark the level you would act on and get told when it hits.'),
      ], {
        'Open signals': 'Calls currently published for your level.',
        Long: 'How many of them point up.',
        Short: 'How many point down.',
        'Avg confidence': 'The average confidence the desk put on these calls. Not a win rate.',
      }), visual: <AiVerdict bare {...signalsVerdict(signals as never)} /> };
    }
    case 'instrument-analysis': {
      const d = signalsRead(signals as never, user.tierLevel);
      return { ...toSpotlight(
        { ...d, headline: 'What is moving, and what is due', overview: instrumentListStrip(signals as never) },
        'Read the instrument list, signals and calendar',
        [
          { label: 'Open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
          { label: 'Check the calendar', sub: 'See what can move these instruments today.', onClick: () => go('economic-calendar') },
          to('news', 'Read the coverage', 'The stories behind the move, with today\u2019s lean.'),
        ],
        {
          'Open signals': 'Calls published across these instruments.',
          Long: 'How many point up.',
          Short: 'How many point down.',
          'Avg confidence': 'Average confidence on those calls. Not a win rate.',
        },
      ), visual: <AiStrip bare text={instrumentListStrip(signals as never)} /> };
    }
    case 'economic-calendar':
      return { ...toSpotlight(calendarRead(), 'Read the calendar', [
        { label: 'See open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
        { label: 'Review my positions', sub: 'Equity, drawdown and what is open.', onClick: () => go('portfolio-tracker') },
        to('news', 'Read the coverage', 'What the desk expects from these releases.'),
      ]), visual: (() => { const n = calendarNext(); return n ? <AiNext bare {...n} /> : null; })() };
    case 'news':
      return { ...toSpotlight(newsRead(), "Read today's stories", [
        { label: 'See open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
        { label: 'Open the calendar', sub: 'Check upcoming news, earnings and events.', onClick: () => go('economic-calendar') },
        to('instrument-analysis', 'Look at the instruments', 'Prices, momentum and what is due next.'),
      ]), visual: <AiVerdict bare {...newsVerdict()} /> };
    case 'education-hub':
      return { ...toSpotlight(educationRead(undefined, undefined, user.tierLevel), 'Read the course list', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'See my points', sub: 'Level, missions and what the next tier pays.', onClick: () => go('points-credits') },
        to('community', 'See what traders write', 'Articles and posts from the floor.'),
      ]), visual: (() => { const n = educationProgress(undefined, undefined, user.tierLevel); return n ? <AiProgress bare {...n} /> : null; })() };
    case 'brokers':
      return {
        pretext: `Read ${brokers.length} brokers`,
        headline: 'Cheapest spread is not the same as cheapest',
        overview: brokerListStrip(brokers as never),
        visual: <AiStrip bare text={brokerListStrip(brokers as never)} />,
        tabs: [{ id: 'summary', label: 'Summary', lines: [] }, { id: 'chat', label: 'Chat', lines: [] }],
        suggestions: [
          { label: 'Compare side by side', sub: 'Costs, platforms and regulation in one table.', onClick: () => go('broker-comparison') },
          { label: 'See offers', sub: 'What is live for your level and when it closes.', onClick: () => go('promotions') },
          to('cashback-overview', 'Open cashback', 'Credited, pending and the rate per lot.'),
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
        visual: <AiMetrics bare headline="" note={n.text} metrics={brokers.slice(0, 4).map((x) => ({ label: x.name, value: x.spreadFrom }))} />,
        tabs: [{ id: 'summary', label: 'Summary', lines: [] }, { id: 'chat', label: 'Chat', lines: [] }],
        suggestions: [
          { label: 'See offers', sub: 'What is live for your level and when it closes.', onClick: () => go('promotions') },
          { label: 'Open cashback', sub: 'Credited, pending and the rate per lot.', onClick: () => go('cashback-overview') },
          to('connect-to-truvo', 'Connect an account', 'Track the costs and cashback automatically.'),
        ],
        footnote: 'Commission tiers and execution are not in this number.',
      };
    }
    case 'promotions':
      return { ...toSpotlight(promotionsRead(undefined, user.tierLevel), 'Read the live offers', [
        { label: 'Open cashback', sub: 'Credited, pending and the rate per lot.', onClick: () => go('cashback-overview') },
        { label: 'See my level', onClick: () => go('points-credits') },
        to('brokers', 'Browse brokers', 'Who is behind these offers and how they trade.'),
      ]), visual: (() => { const n = promotionsNext(undefined, user.tierLevel); return n ? <AiNext bare tone="amber" {...n} /> : null; })() };
    case 'portfolio-tracker':
      return { ...toSpotlight(portfolioRead([], 30), 'Read your accounts, trades and goals', [
        { label: 'Open my journal', sub: 'Log trades, review results and track your progress.', onClick: () => go('trading-journal') },
        { label: 'Review alerts', sub: 'What is close to firing and what is noise.', onClick: () => go('alerts') },
        to('economic-calendar', 'Check the calendar', 'What can move these positions this week.'),
      ], {
        Equity: 'Balance across the accounts you picked.',
        '30d net': 'Realised result from trades closed in 30 days.',
        'Max drawdown': 'Deepest fall from a peak in that window.',
        Floating: 'Unrealised profit and loss on what is still open.',
      }), visual: <AiMetrics bare {...portfolioMetrics([], 30)} /> };
    case 'alerts':
      return { ...toSpotlight(alertsRead(DEMO_ALERTS, user.tierLevel >= 3 ? 999 : user.tierLevel === 2 ? 25 : 5), 'Read your alerts and the live quotes', [
        { label: 'See open signals', sub: 'The current calls and how confident they are.', onClick: () => go('signals') },
        { label: 'Check the calendar', sub: 'See what can move your positions today.', onClick: () => go('economic-calendar') },
        to('trading-journal', 'Open the journal', 'Write up what happened after the last one fired.'),
      ]), visual: <AiChecklist bare {...alertsChecklist(DEMO_ALERTS, user.tierLevel >= 3 ? 999 : user.tierLevel === 2 ? 25 : 5)} /> };
    case 'expert-advisors':
      return { ...toSpotlight(advisorsRead(undefined, user.tierLevel), 'Read the advisor listings', [
        { label: 'Open the backtest', sub: 'Test a playbook before you trade it again.', onClick: () => go('trading-journal') },
        { label: 'Find a broker', sub: 'Compare spreads, cashback and regulation.', onClick: () => go('brokers') },
        to('strategy-builder', 'Build your own', 'Turn a rule set into something you can test.'),
      ]), visual: (() => { const n = advisorsCompare(); return n ? <AiCompare bare {...n} /> : null; })() };
    case 'trading-journal':
      return toSpotlight(journalRead(), 'Read your journal entries', [
        { label: 'Review my accounts', sub: 'Equity, drawdown, margin and goals.', onClick: () => go('portfolio-tracker') },
        { label: 'Build a strategy', sub: 'Turn the pattern into rules and test it.', onClick: () => go('strategy-builder') },
        to('alerts', 'Review alerts', 'Mark the levels your plan actually trades.'),
      ], {
        Closed: 'Trades you logged with a result.',
        Net: 'Everything those closed trades made or lost.',
        'Win rate': 'Share of them that finished green.',
        'Average R': 'Average result measured in multiples of what you risked.',
      });
    case 'strategy-builder':
      return { ...toSpotlight(strategyRead(), 'Read your playbooks and their live trades', [
        { label: 'Open the journal', sub: 'Your entries, playbooks and reviews.', onClick: () => go('trading-journal') },
        { label: 'Review my accounts', sub: 'Equity, drawdown, margin and goals.', onClick: () => go('portfolio-tracker') },
        to('expert-advisors', 'See expert advisors', 'Ready-made rule sets, with their drawdown shown.'),
      ], {
        Playbooks: 'Rule sets you have written up.',
        'With live trades': 'How many have real trades tagged to them.',
        'Best net': 'The strongest playbook by money.',
        'Weakest net': 'The one giving money back.',
      }), visual: <AiChecklist bare {...backtestChecklist()} /> };
    case 'points-credits':
      return { ...toSpotlight(pointsRead(user), 'Read your level, credits and missions', [
        { label: 'See offers', sub: 'What is live for your level and when it closes.', onClick: () => go('promotions') },
        { label: 'Open the leaderboard', sub: 'Where you stand and the gap above.', onClick: () => go('leaderboard') },
        to('education-hub', 'Finish a course', 'Lessons pay points and the certificate sticks.'),
      ]), visual: <AiProgress bare {...pointsProgress(user)} /> };
    case 'leaderboard':
      return toSpotlight(leaderboardRead(), 'Read the standings for this period', [
        { label: 'See my points', sub: 'Level, missions and what the next tier pays.', onClick: () => go('points-credits') },
        { label: 'Open cashback', sub: 'Credited, pending and the rate per lot.', onClick: () => go('cashback-overview') },
        to('community', 'See the community', 'Who is posting and what they are writing.'),
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
        to('education-hub', 'Open the education hub', 'Courses that cover what the floor is arguing about.'),
      ]);
    }
    default:
      return null;
  }
}

const STORE = 'marketsyde.aiDock.closed';
const SEEN = 'marketsyde.aiDock.introSeen';

/** The orb: a rotating gradient ring in the brand colours, a blurred halo and the mascot. */
const AI_PILL_CSS = `
@keyframes ai-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ai-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(0.1)}}
@keyframes ai-spin{to{transform:rotate(1turn)}}
@keyframes ai-ring{0%{transform:scale(.9);opacity:.5}70%{transform:scale(1.35);opacity:0}100%{opacity:0}}
.ai-orb{position:fixed;isolation:isolate}
.ai-orb-glow,.ai-orb-edge{
  position:absolute;border-radius:9999px;
  background:conic-gradient(from 0deg,#5945F1,#c026d3,#fd02b0,#c9ea0e,#5945F1);
  animation:ai-spin 6s linear infinite;
}
.ai-orb-glow{inset:-9px;filter:blur(12px);opacity:.75}
.ai-orb-edge{inset:-2px}
.ai-orb-face{position:relative;border-radius:9999px}
.ai-orb-pulse{position:absolute;inset:-2px;border-radius:9999px;border:2px solid #5945F1;animation:ai-ring 2.8s ease-out infinite;pointer-events:none}
.ai-orb-ghost{animation:ai-bob 2.8s ease-in-out infinite}
.ai-orb:hover .ai-orb-ghost{animation-duration:1.1s}
.ai-orb:hover .ai-orb-glow{opacity:1;filter:blur(16px)}
.ai-orb:hover .ai-orb-glow,.ai-orb:hover .ai-orb-edge{animation-duration:2.4s}
.ai-ghost-eyes{animation:ai-blink 5s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){
  .ai-orb-ghost,.ai-ghost-eyes,.ai-orb-pulse,.ai-orb-glow,.ai-orb-edge{animation:none}
  .ai-orb-pulse{opacity:0}
}
`;

/** The read for the page the person is on, or null where the dock stays shut. */

/** The mascot bobs, blinks and sends out a ring so the pill reads as live. */

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
        onLearnMore={() => finishIntro(true)}
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
          aria-label="Open the MarketSyde AI summary"
          title="MarketSyde AI"
          data-keep-button-icons
          className="ai-orb group bottom-5 right-5 z-40 h-14 w-14 rounded-full transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 print:hidden"
        >
          <span className="ai-orb-glow" aria-hidden />
          <span className="ai-orb-edge" aria-hidden />
          <span className="ai-orb-face flex h-14 w-14 items-center justify-center bg-white text-[#5945F1] shadow-[0_8px_24px_rgba(89,69,241,0.28)] dark:bg-[#0b0320] dark:text-[#bfb3ff]">
            <span className="ai-orb-pulse" aria-hidden />
            <AiGhost className="ai-orb-ghost h-7 w-7" />
          </span>
        </button>
      </>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(480px,calc(100vw-2rem))] print:hidden">
      <AiDashboardPanel
        data={data}
        greeting={greeting}
        storageKey={ctx.tab}
        onClose={() => shut(true)}
        className="h-[min(800px,calc(100vh-7.5rem))]"
      />
    </div>
  );
};
