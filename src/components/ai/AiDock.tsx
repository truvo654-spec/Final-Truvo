import React, { useEffect, useMemo, useState } from 'react';
import { CALENDAR_NOW, ECONOMIC_EVENTS } from '../../data/economicCalendarData';
import { NEWS_ARTICLES } from '../../data/newsData';
import { POINT_LIFE_DAYS } from '../../data/rewardRules';
import { isLive, readLedger } from '../../data/rewardsLedger';
import { PROMOTIONS } from '../../data/promotionsData';
import { COURSES } from '../../data/educationData';
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
export function dockFor(ctx: AiDockContext): SpotlightData | null {
  const read = dockRead(ctx);
  return read ? { ...read, onResults: resultsFor(ctx) } : null;
}

function resultsFor({ signals, brokers, go }: AiDockContext) {
  return (label: string) => {
    const open = (signals ?? []).filter((sg) => (sg as never as { status?: string }).status !== 'closed');

    const brokerRows = (brokers ?? []).slice()
      .sort((a, b) => (b.cashbackPerLot ?? 0) - (a.cashbackPerLot ?? 0))
      .slice(0, 5)
      .map((b) => ({
        title: b.name,
        meta: `$${(b.cashbackPerLot ?? 0).toFixed(2)} a lot \u00b7 from ${b.minDeposit ?? '$0'} \u00b7 ${(b.regulations ?? [])[0] ?? 'see profile'}`,
        action: { label: 'Trade', run: () => go('brokers') },
      }));

    const signalRows = open.slice(0, 3).map((sg) => {
      const side = String((sg as never as { direction?: string }).direction ?? '').toUpperCase();
      const conf = (sg as never as { confidence?: number }).confidence;
      return {
        title: `${(sg as never as { pair?: string; symbol?: string }).pair ?? (sg as never as { symbol?: string }).symbol ?? 'Signal'} \u00b7 ${side || 'BUY'}`,
        meta: `${conf ? `${conf}% confidence` : 'confidence withheld'} \u00b7 ${(sg as never as { timeframe?: string }).timeframe ?? ''}`.trim(),
        action: { label: side === 'SELL' ? 'Sell' : 'Buy', run: () => go('instrument-analysis') },
      };
    });

    switch (label) {
      case 'Find a broker':
      case 'Open: Find a broker':
      case 'Compare side by side':
      case 'What the table hides':
      case 'Who pays most per lot':
      case 'Connect a broker':
      case 'Connect an account':
        return brokerRows.length
          ? { intro: `The ${brokerRows.length} paying most per lot right now. Cashback is only part of it: regulation and execution decide more.`, rows: brokerRows }
          : null;

      case 'Open signals':
      case 'See the calls on these':
      case 'The strongest call':
      case 'Where the risk sits':
        return signalRows.length
          ? { intro: `The ${signalRows.length} strongest calls open at your level. Each one comes with its own stop and target: take them as a set.`, rows: signalRows }
          : null;

      case 'What I can claim now':
      case 'See offers':
      case 'What closes soonest':
      case 'Spend them on an offer': {
        // Live now, soonest to close first: the one with least time left is
        // the one worth seeing.
        const offers = PROMOTIONS
          .filter((pr) => pr.startsInDays === 0)
          .sort((a, b) => a.endsInDays - b.endsInDays)
          .slice(0, 5)
          .map((pr) => ({
            title: pr.title,
            meta: `${pr.brokerName} \u00b7 ${pr.value} \u00b7 ${pr.endsInDays <= 0 ? 'ends today' : `${pr.endsInDays} days left`}${pr.requiresConnected ? ' \u00b7 needs a connected account' : ''}`,
            action: { label: 'Claim', run: () => go('promotions') },
          }));
        return offers.length
          ? { intro: `${offers.length} offers live now. Most need a connected and verified account before they pay anything.`, rows: offers }
          : null;
      }

      case 'Where to start':
      case 'Finish a course':
      case 'Open the course': {
        // Shortest first, because the hard part is starting.
        const courses = COURSES.slice()
          .sort((a, b) => a.lessons.length - b.lessons.length)
          .slice(0, 5)
          .map((c) => ({
            title: c.title,
            meta: `${c.lessons.length} lessons \u00b7 ${c.level} \u00b7 ${c.requiredPlan === 'Free' ? 'open to you' : `${c.requiredPlan} plan`}`,
            action: { label: 'Start', run: () => go('education-hub') },
          }));
        return courses.length
          ? { intro: `${courses.length} courses open to you. Finishing a lesson pays Credits; Points come from trading alone.`, rows: courses }
          : null;
      }

      case 'What moves this week':
      case 'Open the calendar':
      case 'Check what is due':
      case 'What is due on these': {
        // High impact first, soonest first, and only what is still ahead.
        const now = new Date(CALENDAR_NOW).getTime();
        const due = ECONOMIC_EVENTS
          .filter((e) => new Date(e.at).getTime() >= now && e.impact === 'High')
          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
          .slice(0, 5)
          .map((e) => ({
            title: `${e.currency} \u00b7 ${e.title}`,
            meta: `${new Date(e.at).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}${e.forecast ? ` \u00b7 forecast ${e.forecast}` : ''}`,
            action: { label: 'Watch', run: () => go('economic-calendar') },
          }));
        return due.length
          ? { intro: `The ${due.length} high-impact releases still ahead. These are the ones that usually move price on the minute.`, rows: due }
          : null;
      }

      case 'What the desk leans':
      case 'Read the coverage': {
        const stories = NEWS_ARTICLES.slice(0, 5).map((a) => ({
          title: a.headline,
          meta: `${a.source} \u00b7 ${a.assetClass}${a.sentiment ? ` \u00b7 ${a.sentiment}` : ''}`,
          action: { label: 'Read', run: () => go('news') },
        }));
        return stories.length
          ? { intro: `${stories.length} stories the desk published. A lean is an opinion, not a forecast.`, rows: stories }
          : null;
      }

      case 'What expires first':
      case 'See my points':
      case 'See my missions': {
        const led = readLedger();
        const soon = [...led.points]
          .filter((e) => isLive(e, POINT_LIFE_DAYS))
          .sort((a, b) => new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime())
          .slice(0, 5)
          .map((e) => {
            const left = POINT_LIFE_DAYS - Math.floor((Date.now() - new Date(e.earnedAt).getTime()) / 86_400_000);
            return {
              title: `${e.amount} Points \u00b7 ${e.reason}`,
              meta: `${left} day${left === 1 ? '' : 's'} left before they stop counting towards your level`,
              action: { label: 'Earn more', run: () => go('points-credits') },
            };
          });
        return soon.length
          ? { intro: `Your Points, oldest first. Each one counts towards your level for ${POINT_LIFE_DAYS} days from the day it was earned.`, rows: soon }
          : null;
      }

      default:
        return null;
    }
  };
}

/** What each surface reads, before the chat results are attached. */
function dockRead({ tab, user, signals, brokers, go }: AiDockContext): SpotlightData | null {
  /**
   * What a chat button brings back, rather than where it jumps to.
   *
   * Each question is answered with the real rows behind it: the brokers that
   * actually pay most, the calls actually open, the offers actually closing.
   * Anything not listed here returns null, and the button opens the page as
   * before rather than showing invented rows.
   */
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
        { label: 'Where the risk sits', sub: 'Which open calls lean the same way, and what that means together.', onClick: () => go('signals'), cta: { label: 'Open the instrument', run: () => go('instrument-analysis') } },
        to('signals', 'The strongest call', 'The highest confidence open right now, and its reward to risk.'),
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
          { label: 'What changed today', sub: 'The movers on this list and how far they have come.', onClick: () => go('instrument-analysis'), cta: { label: 'See the calls on these', run: () => go('signals') } },
          to('instrument-analysis', 'What is due on these', 'The releases that touch the instruments on this list.'),
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
        { label: 'What moves this week', sub: 'The high-impact releases and which pairs they touch.', onClick: () => go('economic-calendar'), cta: { label: 'See the calls affected', run: () => go('signals') } },
        { label: 'Review my positions', sub: 'Equity, drawdown and what is open.', onClick: () => go('portfolio-tracker') },
        to('instrument-analysis', 'What is due on these', 'The releases that touch the instruments on this list.'),
      ], {
        'Next 24h': 'Releases due in the next day, whatever their impact.',
        'High impact': 'The ones that usually move price on release.',
        'This week': 'Everything scheduled between now and Sunday.',
        'Busiest currency': 'The currency with the most releases due, so its pairs are the ones to watch.',
      }), visual: (() => { const n = calendarNext(); return n ? <AiNext bare {...n} /> : null; })() };
    case 'news':
      return { ...toSpotlight(newsRead(), "Read today's stories", [
        { label: 'What the desk leans', sub: 'How today\u2019s coverage splits bullish against bearish.', onClick: () => go('news'), cta: { label: 'Look at the instruments', run: () => go('instrument-analysis') } },
        { label: 'Open the calendar', sub: 'Check upcoming news, earnings and events.', onClick: () => go('economic-calendar') },
        to('instrument-analysis', 'Look at the instruments', 'Prices, momentum and what is due next.'),
      ], {
        Stories: 'Pieces published in the window you are reading.',
        Bullish: 'How many lean positive on their subject.',
        Bearish: 'How many lean negative.',
        Neutral: 'Reported without a lean either way.',
        'Most covered': 'The instrument the desk wrote about most.',
      }), visual: <AiVerdict bare {...newsVerdict()} /> };
    case 'education-hub':
      return { ...toSpotlight(educationRead(undefined, undefined, user.tierLevel), 'Read the course list', [
        { label: 'Where to start', sub: 'The shortest course open at your level.', onClick: () => go('education-hub'), cta: { label: 'Open the course', run: () => go('education-hub') } },
        { label: 'Who pays most per lot', sub: 'Cashback against spread, which is the pair that matters.', onClick: () => go('brokers'), cta: { label: 'Open cashback', run: () => go('cashback-overview') } },
        to('community', 'See what traders write', 'Articles and posts from the floor.'),
      ], {
        Courses: 'Courses open at your level.',
        Lessons: 'Lessons across them, finished or not.',
        Hours: 'Roughly how long the whole thing takes.',
        'Points on offer': 'What the courses advertise. Lessons pay Credits; Points come from trading.',
        'Certificates earned': 'Courses you have finished end to end.',
      }), visual: (() => { const n = educationProgress(undefined, undefined, user.tierLevel); return n ? <AiProgress bare {...n} /> : null; })() };
    case 'brokers':
      return {
        pretext: `Read ${brokers.length} brokers`,
        headline: 'Cheapest spread is not the same as cheapest',
        overview: brokerListStrip(brokers as never),
        visual: <AiStrip bare text={brokerListStrip(brokers as never)} />,
        tabs: [{ id: 'summary', label: 'Summary', lines: [] }, { id: 'chat', label: 'Chat', lines: [] }],
        suggestions: [
          { label: 'Compare side by side', sub: 'Costs, platforms and regulation in one table.', onClick: () => go('broker-comparison') },
          { label: 'What the table hides', sub: 'Regulation and execution, which no column ranks.', onClick: () => go('broker-comparison'), cta: { label: 'Read the broker profiles', run: () => go('brokers') } },
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
          { label: 'What closes soonest', sub: 'The offer with the least time left on it.', onClick: () => go('promotions'), cta: { label: 'Open the offer', run: () => go('promotions') } },
          { label: 'What each one asks first', sub: 'Which need a connected account before they pay.', onClick: () => go('promotions'), cta: { label: 'Connect a broker', run: () => go('brokers') } },
          to('connect-to-truvo', 'Connect an account', 'Track the costs and cashback automatically.'),
        ],
        footnote: 'Commission tiers and execution are not in this number.',
      };
    }
    case 'promotions':
      return { ...toSpotlight(promotionsRead(undefined, user.tierLevel), 'Read the live offers', [
        { label: 'What I can claim now', sub: 'Open at your level, and what each one asks for first.', onClick: () => go('promotions'), cta: { label: 'Connect an account', run: () => go('brokers') } },
        { label: 'See my level', onClick: () => go('points-credits') },
        to('brokers', 'Browse brokers', 'Who is behind these offers and how they trade.'),
      ], {
        'Open to you': 'Offers your level can claim today.',
        Locked: 'Live, but above your level for now.',
        'Closes first': 'The one with the least time left on it.',
        'Need a connected account': 'These only pay once a broker account is linked and verified.',
      }), visual: (() => { const n = promotionsNext(undefined, user.tierLevel); return n ? <AiNext bare tone="amber" {...n} /> : null; })() };
    case 'portfolio-tracker':
      return { ...toSpotlight(portfolioRead([], 30), 'Read your accounts, trades and goals', [
        { label: 'What is exposed', sub: 'Where the open positions overlap, and the drawdown behind them.', onClick: () => go('portfolio-tracker'), cta: { label: 'Open the chart', run: () => go('instrument-analysis') } },
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
        { label: 'Which are close to firing', sub: 'The levels price is nearest, and the ones just sitting there.', onClick: () => go('alerts'), cta: { label: 'Open the chart', run: () => go('instrument-analysis') } },
        { label: 'Which are only noise', sub: 'Alerts that fire often and tell you nothing.', onClick: () => go('alerts'), cta: { label: 'Check what is due', run: () => go('economic-calendar') } },
        to('trading-journal', 'Open the journal', 'Write up what happened after the last one fired.'),
      ], {
        Armed: 'Alerts watching the market right now.',
        Paused: 'Set up but not watching, so they will not fire.',
        'Plan limit': 'How many your level allows at once.',
        Price: 'Alerts set on a level rather than an indicator.',
      }), visual: <AiChecklist bare {...alertsChecklist(DEMO_ALERTS, user.tierLevel >= 3 ? 999 : user.tierLevel === 2 ? 25 : 5)} /> };
    case 'expert-advisors':
      return { ...toSpotlight(advisorsRead(undefined, user.tierLevel), 'Read the advisor listings', [
        { label: 'Open the backtest', sub: 'Test a playbook before you trade it again.', onClick: () => go('trading-journal') },
        { label: 'What their drawdown looks like', sub: 'The deepest fall each advisor has taken, not just the return.', onClick: () => go('expert-advisors'), cta: { label: 'Open the journal', run: () => go('trading-journal') } },
        to('strategy-builder', 'Build your own', 'Turn a rule set into something you can test.'),
      ]), visual: (() => { const n = advisorsCompare(); return n ? <AiCompare bare {...n} /> : null; })() };
    case 'trading-journal':
      return toSpotlight(journalRead(), 'Read your journal entries', [
        { label: 'What the entries show', sub: 'The habit the last trades keep repeating.', onClick: () => go('trading-journal'), cta: { label: 'Read the coverage', run: () => go('news') } },
        { label: 'Build a strategy', sub: 'Turn the pattern into rules and test it.', onClick: () => go('strategy-builder') },
        to('trading-journal', 'What to test next', 'The pattern worth writing into a rule.'),
      ], {
        Closed: 'Trades you logged with a result.',
        Net: 'Everything those closed trades made or lost.',
        'Win rate': 'Share of them that finished green.',
        'Average R': 'Average result measured in multiples of what you risked.',
      });
    case 'strategy-builder':
      return { ...toSpotlight(strategyRead(), 'Read your playbooks and their live trades', [
        { label: 'Open the journal', sub: 'Your entries, playbooks and reviews.', onClick: () => go('trading-journal') },
        { label: 'Which playbook earns', sub: 'The strongest rule set by money, and the one giving it back.', onClick: () => go('strategy-builder'), cta: { label: 'Open the journal', run: () => go('trading-journal') } },
        to('expert-advisors', 'See expert advisors', 'Ready-made rule sets, with their drawdown shown.'),
      ], {
        Playbooks: 'Rule sets you have written up.',
        'With live trades': 'How many have real trades tagged to them.',
        'Best net': 'The strongest playbook by money.',
        'Weakest net': 'The one giving money back.',
      }), visual: <AiChecklist bare {...backtestChecklist()} /> };
    case 'points-credits':
      return { ...toSpotlight(pointsRead(user), 'Read your level, credits and missions', [
        { label: 'What expires first', sub: 'Points and Credits with the least time left.', onClick: () => go('points-credits'), cta: { label: 'Spend them on an offer', run: () => go('promotions') } },
        { label: 'Open the leaderboard', sub: 'Where you stand and the gap above.', onClick: () => go('leaderboard') },
        to('education-hub', 'Finish a course', 'Lessons pay points and the certificate sticks.'),
      ]), visual: <AiProgress bare {...pointsProgress(user)} /> };
    case 'leaderboard':
      return toSpotlight(leaderboardRead(), 'Read the standings for this period', [
        { label: 'What the gap is', sub: 'How far above you the next place sits.', onClick: () => go('leaderboard'), cta: { label: 'See how points are earned', run: () => go('points-credits') } },
        { label: 'What the leader does differently', sub: 'Where the top of the board earns, by volume or by missions.', onClick: () => go('leaderboard'), cta: { label: 'See my missions', run: () => go('points-credits') } },
        to('community', 'See the community', 'Who is posting and what they are writing.'),
      ], {
        'Your rank': 'Where you sit on this board, this period.',
        'Your points': 'Active Points counted for the standings.',
        Leader: 'What the top of the board holds.',
        'Board average': 'The middle of the field, which is the more useful comparison.',
        Traders: 'How many people the board is ranking.',
      });
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
        { label: 'What is worth reading', sub: 'The posts with real engagement rather than the newest.', onClick: () => go('community'), cta: { label: 'Open the feed', run: () => go('community') } },
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
        tierLevel={ctx.user.tierLevel}
        tierName={ctx.user.rankTitle}
        storageKey={ctx.tab}
        onClose={() => shut(true)}
        className="h-[min(800px,calc(100vh-7.5rem))]"
      />
    </div>
  );
};
