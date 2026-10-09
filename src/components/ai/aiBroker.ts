import { Broker } from '../../types';
import { AiMessage, AiReply, AiMemory, BrokerPrefs } from './aiTypes';
import { mid } from './aiUtil';

const num = (s: string) => parseFloat((s || '').replace(/[^0-9.]/g, '')) || 0;
const lev = (s: string) => {
  const m = (s || '').match(/(\d+)\s*:\s*(\d+)/);
  return m ? parseFloat(m[2]) : num(s);
};

export interface RankedBroker {
  b: Broker;
  score: number;
  fit: number;
  why: string[];
}

export function rankBrokers(brokers: Broker[], prefs: BrokerPrefs): RankedBroker[] {
  const scored = brokers.map((b) => {
    const spread = num(b.spreadFrom);
    const dep = num(b.minDeposit);
    const tier1 = b.regulations.filter((r) => /tier 1|fca|asic|cysec/i.test(r)).length;
    let score = (b.score ?? 8) * 4;
    const why: string[] = [];
    if (prefs.priority === 'cost') { score += (1 - Math.min(spread, 1.5) / 1.5) * 20; why.push(`spreads from ${b.spreadFrom}`); }
    if (prefs.priority === 'safety') { score += tier1 * 7; why.push(`${b.regulations.length} regulators including ${b.regulations.slice(0, 2).join(', ')}`); }
    if (prefs.priority === 'cashback') { score += b.cashbackPerLot * 3; why.push(`up to $${b.cashbackPerLot.toFixed(2)} cashback per lot`); }
    if (prefs.priority === 'deposit') { score += (1 - Math.min(dep, 200) / 200) * 20; why.push(`minimum deposit ${b.minDeposit}`); }
    if (prefs.style === 'scalping') {
      score += (1 - Math.min(spread, 1.5) / 1.5) * 8;
      if (/raw|zero|ecn/i.test(b.spreadType || '')) { score += 5; why.push('raw or zero-spread accounts for tight entries'); }
    }
    if (prefs.style === 'crypto') {
      const c = b.category === 'Crypto' || b.category === 'Multi-Asset';
      if (c) { score += 10; why.push('multi-asset coverage that includes crypto'); }
    }
    if (prefs.style === 'swing' && (b.platforms.includes('cTrader') || b.platforms.includes('MT5'))) {
      score += 4;
      why.push('MT5 or cTrader for swing charting');
    }
    if (prefs.platform !== 'any') {
      if (b.platforms.includes(prefs.platform)) { score += 8; why.push(`offers ${prefs.platform}`); }
      else { score -= 18; why.push(`no ${prefs.platform}`); }
    }
    return { b, score, fit: 0, why };
  }).sort((a, b) => b.score - a.score);
  const top = scored[0]?.score || 1;
  scored.forEach((r) => { r.fit = Math.max(1, Math.round((r.score / top) * 100)); });
  return scored;
}

const PRIORITY_LABEL: Record<BrokerPrefs['priority'], string> = {
  cost: 'low trading costs',
  safety: 'regulation and safety',
  cashback: 'cashback',
  deposit: 'a small starting deposit',
};

function brokerTable(list: Broker[], lots: number) {
  const cols = ['', ...list.map((b) => b.name)];
  const row = (label: string, f: (b: Broker) => string) => [label, ...list.map(f)];
  return {
    columns: cols,
    rows: [
      row('Spread from', (b) => b.spreadFrom),
      row('Min deposit', (b) => b.minDeposit),
      row('Max leverage', (b) => b.maxLeverage),
      row('Cashback / lot', (b) => `$${b.cashbackPerLot.toFixed(2)}`),
      row(`Cashback @ ${lots} lots`, (b) => `$${(b.cashbackPerLot * lots).toFixed(0)}`),
      row('Regulators', (b) => b.regulations.filter((r) => !/^(tier 1 )?regulated$/i.test(r)).slice(0, 3).join(', ') || b.regulations[0] || '-'),
      row('Platforms', (b) => b.platforms.filter((p) => /MT4|MT5|cTrader/.test(p)).join(', ') || b.platforms[0] || '-'),
    ],
  };
}

export function matchBrokers(brokers: Broker[], prefs: BrokerPrefs): AiReply {
  const ranked = rankBrokers(brokers, prefs);
  const top = ranked.slice(0, 3);
  const style = prefs.style === 'crypto' ? 'crypto' : prefs.style;
  const msg: AiMessage = {
    id: mid(),
    role: 'ai',
    surface: 'broker',
    heading: 'Your top brokers',
    paragraphs: [
      `You told me ${PRIORITY_LABEL[prefs.priority]} matters most, you trade ${style}${prefs.platform !== 'any' ? ` and want ${prefs.platform}` : ''}. Here is how the directory ranks for that. Tap a broker to open it.`,
    ],
    items: top.map(({ b, fit, why }, i) => ({
      title: `${i + 1}. ${b.name}`,
      sub: `${why.slice(0, 2).join(' · ')}${b.connected ? ' · already connected' : ''}`,
      badge: `${fit}% match`,
      broker: b.id,
    })),
    table: brokerTable(top.map((r) => r.b), prefs.lots),
    bars: [{ title: `Estimated cashback at ${prefs.lots} lots a month`, rows: top.map(({ b }) => ({ label: b.name, value: b.cashbackPerLot * prefs.lots, display: `$${(b.cashbackPerLot * prefs.lots).toFixed(0)}` })) }],
    sources: ['Broker directory', 'Your answers'],
    note: 'Match % is relative to the best fit for your answers. This ranks listed data, not execution quality. Check the full account types before you fund.',
    followUps: ['Compare these brokers', ranked[3] ? `Why not ${ranked[3].b.name}?` : 'Which broker is safest?', `How much cashback for ${prefs.lots * 2} lots?`, 'Which broker is safest?'],
  };
  return { msg, mem: { surface: 'broker', brokerIds: top.map((r) => r.b.id) } };
}

export function compareBrokers(brokers: Broker[], ids: string[] | undefined, prefs: BrokerPrefs): AiReply {
  const list = (ids?.length ? ids.map((id) => brokers.find((b) => b.id === id)).filter(Boolean) as Broker[] : rankBrokers(brokers, prefs).slice(0, 3).map((r) => r.b)).slice(0, 4);
  const cheapest = [...list].sort((a, b) => num(a.spreadFrom) - num(b.spreadFrom))[0];
  const richest = [...list].sort((a, b) => b.cashbackPerLot - a.cashbackPerLot)[0];
  const lowDep = [...list].sort((a, b) => num(a.minDeposit) - num(b.minDeposit))[0];
  const highLev = [...list].sort((a, b) => lev(b.maxLeverage) - lev(a.maxLeverage))[0];
  const msg: AiMessage = {
    id: mid(),
    role: 'ai',
    surface: 'broker',
    heading: `Side by side: ${list.map((b) => b.name).join(' vs ')}`,
    paragraphs: [
      `Lowest starting spread: ${cheapest.name} (${cheapest.spreadFrom}). Highest cashback: ${richest.name} ($${richest.cashbackPerLot.toFixed(2)} per lot). Smallest deposit: ${lowDep.name} (${lowDep.minDeposit}). Highest leverage: ${highLev.name} (${highLev.maxLeverage}).`,
      'No broker wins everything, so the right one depends on what you ranked first.',
    ],
    table: brokerTable(list, prefs.lots),
    items: [
      ...list.map((b) => ({ title: `Open ${b.name}`, sub: b.connected ? 'Already connected' : 'Not connected yet', broker: b.id })),
      { title: 'Full comparison tool', sub: 'All account types and rebates', tab: 'broker-comparison' },
    ],
    sources: ['Broker directory'],
    note: 'Higher leverage is a limit, not a goal. Size by risk, not by what the broker allows.',
    followUps: ['Which broker is safest?', 'Brokers with the best cashback', 'Which broker suits me?'],
  };
  return { msg, mem: { surface: 'broker', brokerIds: list.map((b) => b.id) } };
}

export function whyNotBroker(brokers: Broker[], prefs: BrokerPrefs, name: string): AiReply {
  const ranked = rankBrokers(brokers, prefs);
  const idx = ranked.findIndex((r) => r.b.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(r.b.name.toLowerCase()));
  if (idx < 0) return matchBrokers(brokers, prefs);
  const them = ranked[idx];
  const best = ranked[0];
  const diffs: string[] = [];
  if (num(them.b.spreadFrom) !== num(best.b.spreadFrom)) diffs.push(`spreads start at ${them.b.spreadFrom} versus ${best.b.spreadFrom}`);
  if (num(them.b.minDeposit) !== num(best.b.minDeposit)) diffs.push(`the minimum deposit is ${them.b.minDeposit} versus ${best.b.minDeposit}`);
  if (Math.abs(them.b.cashbackPerLot - best.b.cashbackPerLot) >= 0.05) diffs.push(`cashback is $${them.b.cashbackPerLot.toFixed(2)} versus $${best.b.cashbackPerLot.toFixed(2)} per lot`);
  if (them.b.regulations.length !== best.b.regulations.length) diffs.push(`it lists ${them.b.regulations.length} regulators versus ${best.b.regulations.length}`);
  if (prefs.platform !== 'any' && !them.b.platforms.includes(prefs.platform)) diffs.push(`it does not list ${prefs.platform}`);
  const tied = them.fit >= 97;
  const msg: AiMessage = {
    id: mid(),
    role: 'ai',
    surface: 'broker',
    heading: idx === 0 ? `${them.b.name} is already your top match` : tied ? `${them.b.name} is almost tied with ${best.b.name}` : `Why ${them.b.name} ranks #${idx + 1}`,
    paragraphs: idx === 0
      ? [`For ${PRIORITY_LABEL[prefs.priority]} and ${prefs.style}, ${them.b.name} comes first: ${them.why.slice(0, 2).join(', ')}.`]
      : [
          tied
            ? `On ${PRIORITY_LABEL[prefs.priority]} and ${prefs.style} the two score within a few points, so it comes down to the details.`
            : `For ${PRIORITY_LABEL[prefs.priority]} and ${prefs.style}, ${best.b.name} edges it (${them.fit}% of the top match).`,
          diffs.length ? `Compared with ${best.b.name}: ${diffs.join('; ')}.` : `It is identical to ${best.b.name} on every listed metric, so look at the account types and execution reviews.`,
          'Change what matters most in the panel and I will re-rank.',
        ],
    table: idx === 0 ? undefined : brokerTable([best.b, them.b], prefs.lots),
    items: [{ title: `Open ${them.b.name}`, broker: them.b.id }],
    sources: ['Broker directory', 'Your answers'],
    followUps: ['Compare these brokers', 'Which broker suits me?'],
  };
  return { msg, mem: { surface: 'broker', brokerIds: [best.b.id, them.b.id] } };
}

export function cashbackEstimate(brokers: Broker[], lots: number): AiReply {
  const sorted = [...brokers].sort((a, b) => b.cashbackPerLot - a.cashbackPerLot);
  const best = sorted[0];
  const connected = brokers.filter((b) => b.connected).sort((a, b) => b.cashbackPerLot - a.cashbackPerLot)[0];
  const monthly = best.cashbackPerLot * lots;
  const msg: AiMessage = {
    id: mid(),
    role: 'ai',
    surface: 'broker',
    heading: `Cashback at ${lots} lots a month`,
    paragraphs: [
      `${best.name} pays the most in the directory: about $${monthly.toFixed(0)} a month ($${(monthly * 12).toFixed(0)} a year) at ${lots} lots.`,
      connected && connected.id !== best.id ? `Your best connected broker, ${connected.name}, would give about $${(connected.cashbackPerLot * lots).toFixed(0)} a month.` : 'Cashback is returned on top of normal trading, so it lowers your effective spread.',
    ],
    bars: [{ title: 'Estimated monthly cashback', rows: sorted.slice(0, 6).map((b) => ({ label: b.name, value: b.cashbackPerLot * lots, display: `$${(b.cashbackPerLot * lots).toFixed(0)}` })) }],
    items: [{ title: 'Open the rebate table', sub: 'Rates by account type', tab: 'broker-rebate-table' }],
    sources: ['Broker directory'],
    note: 'Rates change by account type and instrument. Never pick a broker on cashback alone.',
    followUps: ['Which broker suits me?', 'Compare these brokers'],
  };
  return { msg, mem: { surface: 'broker' } };
}

/** Read preference hints from a sentence and fold them onto the saved preferences. */
export function prefsFromText(q: string, prefs: BrokerPrefs): BrokerPrefs {
  const t = q.toLowerCase();
  const next = { ...prefs };
  if (/cashback|rebate/.test(t)) next.priority = 'cashback';
  else if (/regulat|safe|trust|licen[sc]e/.test(t)) next.priority = 'safety';
  else if (/deposit|small account|start small|low capital/.test(t)) next.priority = 'deposit';
  else if (/cheap|low cost|spread|commission|fees?/.test(t)) next.priority = 'cost';
  if (/crypto|bitcoin/.test(t)) next.style = 'crypto';
  else if (/scalp/.test(t)) next.style = 'scalping';
  else if (/swing|position trad/.test(t)) next.style = 'swing';
  if (/\bmt4\b/.test(t)) next.platform = 'MT4';
  else if (/\bmt5\b/.test(t)) next.platform = 'MT5';
  else if (/ctrader/.test(t)) next.platform = 'cTrader';
  return next;
}

export const brokerMemory = (ranked: RankedBroker[]): AiMemory => ({ surface: 'broker', brokerIds: ranked.slice(0, 3).map((r) => r.b.id) });
