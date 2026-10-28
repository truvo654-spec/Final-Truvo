import { UserProfile } from '../../types';
import { DEFAULT_PLAYBOOKS } from '../../data/journalPlaybooks';
import { JOURNAL_ENTRIES } from '../../data/journalData';
import { PROMOTIONS } from '../../data/promotionsData';
import { GAMIFICATION_TIERS, INITIAL_MISSIONS, LEADERBOARD_USERS, RECENT_TRADES } from '../../data/mockData';
import { AiBars, AiContext, AiMessage, AiReply, AiStat } from './aiTypes';
import { avg, mid, money, pct, plural, tone } from './aiUtil';

/* ═══════════════ Playbooks ═══════════════ */

export type PlaybookFocus = 'all' | 'best' | 'worst' | 'rules';

export function detectPlaybookFocus(q: string): PlaybookFocus {
  const t = q.toLowerCase();
  if (/rule|checklist|adheren|discipline/.test(t)) return 'rules';
  if (/worst|weak|losing|drop|retire/.test(t)) return 'worst';
  if (/best|top|strongest|winning/.test(t)) return 'best';
  return 'all';
}

interface PbRow { name: string; grade: string; status: string; n: number; wins: number; pnl: number; r: number[]; benchmark: number }

function playbookRows(): PbRow[] {
  return DEFAULT_PLAYBOOKS.map((p) => {
    const mine = JOURNAL_ENTRIES.filter((e) => e.strategy === p.name);
    return {
      name: p.name,
      grade: p.grade ?? 'Not graded',
      status: p.status,
      n: mine.length,
      wins: mine.filter((e) => e.outcome === 'win').length,
      pnl: mine.reduce((a, e) => a + (e.pnl || 0), 0),
      r: mine.map((e) => e.rMultiple).filter((x): x is number => typeof x === 'number'),
      benchmark: p.benchmarkRR,
    };
  }).filter((p) => p.n > 0 || p.status === 'active');
}

export function playbooks(ctx: AiContext, focus: PlaybookFocus = 'all'): AiReply {
  const rows = playbookRows();
  const traded = rows.filter((r) => r.n > 0).sort((a, b) => b.pnl - a.pnl);
  const mem = { surface: 'playbook' as const };

  if (!ctx.allowJournal) {
    return { msg: { id: mid(), role: 'ai', surface: 'playbook', heading: 'Your journal is switched off', paragraphs: ['Playbook results come from your journal entries. Turn “Use my trading journal” on in the panel and ask again.'], followUps: ['Give me today’s briefing'] }, mem };
  }
  if (!traded.length) {
    return { msg: { id: mid(), role: 'ai', surface: 'playbook', heading: 'No playbook results yet', paragraphs: [`You have ${plural(rows.length, 'playbook')} written up but no journal entries tagged to them yet. Tag a few trades and I can compare them.`], items: [{ title: 'Open the Playbook tab', tab: 'trading-journal' }], followUps: ['Any habits I should watch?', 'How are my trades doing?'] }, mem };
  }

  const best = traded[0];
  const worst = traded[traded.length - 1];
  const pick = focus === 'best' ? [best] : focus === 'worst' ? [worst] : traded.slice(0, 5);
  const avgR = (r: PbRow) => (r.r.length ? avg(r.r) : null);

  const paragraphs: string[] = [];
  if (focus === 'rules') {
    const graded = rows.filter((r) => r.n >= 2).map((r) => ({ ...r, hit: r.r.length ? r.r.filter((x) => x >= r.benchmark).length / r.r.length : 0 }));
    const weak = [...graded].sort((a, b) => a.hit - b.hit)[0];
    paragraphs.push(
      graded.length
        ? `Across your tagged trades, ${graded.filter((g) => g.hit >= 0.5).length} of ${graded.length} playbooks hit their own reward:risk benchmark at least half the time.`
        : 'Not enough tagged trades yet to check your playbooks against their benchmarks.',
    );
    if (weak) paragraphs.push(`Weakest on its own benchmark: ${weak.name} — only ${pct(weak.hit * 100)} of its trades reached ${weak.benchmark}R or better.`);
  } else {
    paragraphs.push(`Best playbook: ${best.name} (${money(best.pnl)} over ${plural(best.n, 'trade')}, ${pct((best.wins / best.n) * 100)} wins).${traded.length > 1 && worst.pnl < 0 ? ` Weakest: ${worst.name} (${money(worst.pnl)} over ${plural(worst.n, 'trade')}).` : ''}`);
    const noTrades = rows.filter((r) => r.n === 0);
    if (noTrades.length) paragraphs.push(`${plural(noTrades.length, 'playbook')} has no tagged trades yet: ${noTrades.map((r) => r.name).join(', ')}.`);
  }
  paragraphs.push('Playbook results only count trades you tagged to them, so tag consistently or the comparison drifts.');

  const stats: AiStat[] = focus === 'all' ? [
    { label: 'Playbooks', value: String(rows.length) },
    { label: 'With trades', value: String(traded.length) },
    { label: 'Best net', value: money(best.pnl), tone: tone(best.pnl) },
    { label: 'Average R (best)', value: avgR(best) == null ? 'n/a' : `${avgR(best)!.toFixed(2)}R` },
  ] : undefined;

  const bars: AiBars[] = [{ title: 'Net result by playbook', rows: traded.map((r) => ({ label: `${r.name} (${r.n})`, value: r.pnl, display: money(r.pnl) })) }];

  return {
    msg: {
      id: mid(), role: 'ai', surface: 'playbook',
      heading: focus === 'best' ? 'Your strongest playbook' : focus === 'worst' ? 'Your weakest playbook' : focus === 'rules' ? 'Playbooks against their own rules' : 'How your playbooks compare',
      paragraphs,
      stats,
      bars,
      items: [
        ...pick.map((r) => ({ title: r.name, sub: `${r.grade} · ${r.status} · ${plural(r.n, 'trade')} · ${money(r.pnl)}${avgR(r) == null ? '' : ` · ${avgR(r)!.toFixed(2)}R avg`}`, badge: 'Playbook', tab: 'trading-journal' })),
        { title: 'Open the Trading Journal', sub: 'Playbook tab, backtest and trade log', tab: 'trading-journal' },
      ],
      sources: ['Your playbooks', 'Your trading journal'],
      followUps: ['Which playbook is weakest?', 'Do my playbooks follow their rules?', 'How are my trades doing?', 'Any habits I should watch?'],
    },
    mem,
  };
}

/* ═══════════════ Cashback, points and perks ═══════════════ */

export type RewardFocus = 'all' | 'cashback' | 'level' | 'missions' | 'promos' | 'leaderboard';

export function detectRewardFocus(q: string): RewardFocus {
  const t = q.toLowerCase();
  if (/mission|task|quest/.test(t)) return 'missions';
  if (/promo|offer|bonus|deal|deposit match|competition/.test(t)) return 'promos';
  if (/leaderboard|rank(ing)?\b|standing/.test(t)) return 'leaderboard';
  if (/level|tier|points|perk|upgrade|unlock/.test(t)) return 'level';
  if (/cashback|rebate|payout|earned/.test(t)) return 'cashback';
  return 'all';
}

export function rewards(ctx: AiContext, user: UserProfile, focus: RewardFocus = 'all'): AiReply {
  const mem = { surface: 'rewards' as const };
  const credited = RECENT_TRADES.filter((t) => t.status === 'Credited').reduce((a, t) => a + t.cashbackEarned, 0);
  const pending = RECENT_TRADES.filter((t) => t.status !== 'Credited').reduce((a, t) => a + t.cashbackEarned, 0);
  const lots = RECENT_TRADES.reduce((a, t) => a + t.lots, 0);
  const perLot = lots ? (credited + pending) / lots : 0;
  const byBroker = Array.from(RECENT_TRADES.reduce((m, t) => m.set(t.broker, (m.get(t.broker) ?? 0) + t.cashbackEarned), new Map<string, number>()).entries())
    .map(([name, v]) => ({ label: name, value: v, display: `$${v.toFixed(2)}` }))
    .sort((a, b) => b.value - a.value);

  const tierIndex = GAMIFICATION_TIERS.findIndex((t) => t.level === user.tierLevel);
  const next = tierIndex >= 0 ? GAMIFICATION_TIERS[tierIndex + 1] : undefined;
  const toNext = next ? Math.max(0, next.minPoints - user.currentPoints) : 0;

  const openMissions = INITIAL_MISSIONS.filter((m) => m.status !== 'completed' && m.tasks.some((t) => !t.completed));
  const missionPoints = openMissions.reduce((a, m) => a + m.rewardPoints, 0);
  const missionCredits = openMissions.reduce((a, m) => a + m.rewardCredits, 0);

  const promos = PROMOTIONS.filter((p) => p.minLevel <= Math.max(1, user.tierLevel) && p.startsInDays === 0)
    .sort((a, b) => a.endsInDays - b.endsInDays);
  const me = LEADERBOARD_USERS.find((u) => u.isCurrentUser);
  const ahead = me ? LEADERBOARD_USERS.find((u) => u.rank === me.rank - 1) : undefined;

  const paragraphs: string[] = [];
  const stats: AiStat[] = [];
  const bars: AiBars[] = [];
  const items: AiMessage['items'] = [];

  const cashbackPara = `Cashback so far: $${credited.toFixed(2)} credited and $${pending.toFixed(2)} pending across ${lots.toFixed(2)} lots, about $${perLot.toFixed(2)} per lot. Lifetime on your profile is $${user.totalCashbackEarned.toFixed(2)} with $${user.pendingPayout.toFixed(2)} waiting to pay out.`;
  const levelPara = next
    ? `You are ${user.rankTitle} (level ${user.tierLevel}) with ${user.currentPoints} of ${user.maxPoints} points. ${toNext} more points reaches ${next.tier}, which gives ${next.cashbackBoost} and ${next.signalAccess}.`
    : `You are ${user.rankTitle} (level ${user.tierLevel}), the top level, with ${user.currentPoints} points.`;
  const missionPara = openMissions.length
    ? `${plural(openMissions.length, 'mission')} still open, worth up to +${missionPoints} points and +${missionCredits} credits. Nearest: ${openMissions[0].title} (${openMissions[0].tasks.filter((t) => !t.completed).length} tasks left).`
    : 'No missions are open right now.';
  const promoPara = promos.length
    ? `${plural(promos.length, 'offer')} live for your level. Closing soonest: ${promos[0].title} from ${promos[0].brokerName} (${promos[0].value}, ends in ${plural(promos[0].endsInDays, 'day')}).`
    : 'No promotions are live for your level right now.';
  const boardPara = me
    ? `You are #${me.rank} on the leaderboard with ${me.points.toLocaleString()} points and $${me.cashbackEarned.toFixed(2)} cashback.${ahead ? ` ${ahead.username} is one place ahead, ${(ahead.points - me.points).toLocaleString()} points up.` : ''}`
    : 'You are not on the current leaderboard page yet.';

  if (focus === 'all' || focus === 'cashback') {
    paragraphs.push(cashbackPara);
    stats.push(
      { label: 'Credited', value: `$${credited.toFixed(2)}`, tone: 'good' },
      { label: 'Pending', value: `$${pending.toFixed(2)}`, tone: 'neutral' },
      { label: 'Per lot', value: `$${perLot.toFixed(2)}` },
    );
    if (byBroker.length) bars.push({ title: 'Cashback by broker', rows: byBroker });
    items.push({ title: 'Open Cashback overview', sub: 'Ledger, payouts and rates', badge: 'Cashback', tab: 'cashback-overview' });
  }
  if (focus === 'all' || focus === 'level') {
    paragraphs.push(levelPara);
    if (focus === 'level') stats.push(
      { label: 'Level', value: `${user.tierLevel} · ${user.rankTitle}` },
      { label: 'Points', value: `${user.currentPoints}/${user.maxPoints}` },
      { label: 'Credits', value: user.sydeCredits.toLocaleString() },
      ...(next ? [{ label: 'To next level', value: `${toNext} pts` }] : []),
    );
    items.push({ title: 'Points & Credits', sub: 'How points, credits and perks work', badge: 'Level', tab: 'points-credits' });
  }
  if (focus === 'all' || focus === 'missions') {
    paragraphs.push(missionPara);
    openMissions.slice(0, focus === 'missions' ? 4 : 1).forEach((m) =>
      items.push({ title: `Mission: ${m.title}`, sub: `+${m.rewardPoints} pts · +${m.rewardCredits} credits${m.expiresIn ? ` · ${m.expiresIn}` : ''}`, badge: 'Mission', tab: 'points-credits' }),
    );
  }
  if (focus === 'promos') {
    paragraphs.push(promoPara);
    promos.slice(0, 4).forEach((p) => items.push({ title: p.title, sub: `${p.brokerName} · ${p.value} · ends in ${plural(p.endsInDays, 'day')}`, badge: 'Offer', tab: 'promotions' }));
  }
  if (focus === 'leaderboard') {
    paragraphs.push(boardPara);
    items.push({ title: 'Open the leaderboard', tab: 'leaderboard' });
  }
  if (focus === 'all') {
    paragraphs.push(promoPara);
    items.push({ title: 'See promotions', sub: `${promos.length} live for your level`, badge: 'Offer', tab: 'promotions' });
  }

  return {
    msg: {
      id: mid(), role: 'ai', surface: 'rewards',
      heading: focus === 'cashback' ? 'Your cashback' : focus === 'level' ? 'Your level and points' : focus === 'missions' ? 'Missions you can finish' : focus === 'promos' ? 'Offers live for you' : focus === 'leaderboard' ? 'Where you stand' : 'Cashback, points and perks',
      paragraphs,
      stats: stats.length ? stats : undefined,
      bars: bars.length ? bars : undefined,
      items,
      sources: ['Your cashback ledger', 'Your level and missions', 'Promotions'],
      note: 'Cashback and offer terms come from the broker. Check the full terms before you act on one.',
      followUps: ['How close am I to the next level?', 'What missions are open?', 'What offers are live?', 'Where am I on the leaderboard?'],
    },
    mem,
  };
}
