import type { EconomicEvent, EventCategory } from '../types';

export type IndicatorTab = 'Summary' | 'Forecast' | 'Consensus' | 'Alerts';
export type AlertType = 'Release' | 'Threshold' | 'Consensus' | 'Change' | 'Forecast' | 'News';
export type Delivery = 'In-app' | 'Push' | 'Email';
export interface IndicatorAlert {
  id: string;
  indicatorId: string;
  name: string;
  type: AlertType;
  condition: string;
  triggerValue: string;
  delivery: Delivery;
  active: boolean;
}
export interface SeriesPoint { period: string; value: number }
export interface IndicatorRelation {
  id: string;
  name: string;
  latest: number;
  previous: number;
  unit: string;
  referencePeriod: string;
  state: string;
}
export interface EconomicIndicator {
  id: string;
  country: { code: string; name: string; flag: string };
  category: EventCategory;
  name: string;
  slug: string;
  currency: string;
  kind: 'indicator' | 'holiday' | 'speech';
  latest: number | null;
  previous: number | null;
  consensus: number | null;
  forecast: number | null;
  unit: string;
  frequency: string;
  referencePeriod: string;
  releaseDate: string;
  provider: string;
  lastUpdated: string;
  neutralThreshold: number | null;
  higherIsEconomicallyPositive: boolean | null;
  historicalStats: { average: number; high: number; highDate: string; low: number; lowDate: string; coverage: string };
  summary: { headline: string; mainResult: string; commentary: { label: string; text: string }[] };
  methodology: { label: string; text: string }[];
  components: IndicatorRelation[];
  relatedIndicators: IndicatorRelation[];
  historicalSeries: SeriesPoint[];
  forecastSeries: { period: string; value: number; type: string; change: number; source: string }[];
  consensusHistory: { referencePeriod: string; releaseDate: string; actual: number; consensus: number; previous: number; surprise: number }[];
  news: { id: string; headline: string; summary: string; publishedAt: string; source: string; body: string }[];
  sessions: { venue: string; symbol: string; status: string; reopening: string; expectation: string; observed: string }[];
  outlook: { scenario: string; probability: string; implication: string }[];
  affectedAssets: { symbol: string; assetClass: string; sensitivity: 'High' | 'Medium' | 'Low'; rationale: string }[];
  volatility: { window: string; trueRange: string; potentialRange: string; confidence: string }[];
  sentiment: { label: 'Bullish' | 'Bearish' | 'Neutral'; score: number; rationale: string };
  marketStructure: { label: string; value: string; note: string }[];
  releaseState: 'Upcoming' | 'Released' | 'All day';
  surpriseLabel: 'Beat' | 'Miss' | 'In line' | 'Pending';
  seededAlerts: IndicatorAlert[];
}

const round = (n: number) => Math.round(n * 100) / 100;
export const formatValue = (n: number | null) => n === null ? 'Not applicable' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
const numberFrom = (v?: string) => {
  if (!v || !/[0-9]/.test(v)) return null;
  const parsed = Number(v.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};
const profiles: Record<EventCategory, { base: number; step: number; unit: string; definition: string; driver: string; variables: string; interpretation: string; provider: string }> = {
  PMI: { base: 51.3, step: 0.6, unit: 'index points', definition: 'A survey of purchasing managers tracking changes in private-sector business activity.', driver: 'New orders improved while export demand remained softer. Services activity provided more support than manufacturing.', variables: 'Output, new orders, employment, supplier delivery times and prices.', interpretation: '50 is neutral. Above 50 signals expansion; below 50 signals contraction.', provider: 'S&P Global / survey provider (demo)' },
  Inflation: { base: 2.6, step: 0.15, unit: '%', definition: 'A price index measuring changes in the cost of a representative basket of goods and services.', driver: 'Services prices remained firm, while easing goods and energy costs moderated the headline change.', variables: 'Goods, services, housing, food and energy prices.', interpretation: 'Read headline and underlying inflation alongside central-bank targets and wage growth.', provider: 'National statistics office (demo)' },
  Employment: { base: 145, step: 12, unit: 'thousand jobs', definition: 'A labour-market measure of employment, unemployment, wages or participation.', driver: 'Hiring remained concentrated in services, while weaker vacancies pointed to more balanced labour demand.', variables: 'Employment, unemployment, participation, vacancies, hours and wages.', interpretation: 'Job creation and falling unemployment often signal stronger demand; wages also inform inflation risk.', provider: 'Labour statistics agency (demo)' },
  GDP: { base: 2.4, step: 0.2, unit: '%', definition: 'A measure of economic output or spending activity over the reference period.', driver: 'Household demand supported activity, while investment and external trade delivered mixed contributions.', variables: 'Consumption, investment, government spending and net exports.', interpretation: 'Read growth with revisions and contributions to assess the breadth of activity.', provider: 'National statistics office (demo)' },
  'Central Bank': { base: 3.85, step: 0.25, unit: '%', definition: 'The policy rate or scheduled monetary-policy decision of the central bank.', driver: 'Policymakers balanced persistent services inflation against slower demand and more moderate hiring.', variables: 'Policy rate, inflation outlook, labour conditions and policy guidance.', interpretation: 'Interpret the decision alongside the statement and the expected future policy path.', provider: 'Central bank (demo)' },
  Trade: { base: 5.4, step: 0.4, unit: 'index points', definition: 'A measure of trade, commodity prices, inventories or external demand.', driver: 'External orders softened while import demand stabilized, leaving the balance sensitive to commodity prices.', variables: 'Exports, imports, commodity prices and inventories.', interpretation: 'Changes can affect growth contributions, domestic prices and demand for the local currency.', provider: 'Trade statistics / industry provider (demo)' },
  Housing: { base: 4.2, step: 0.3, unit: '%', definition: 'A measure of residential property activity, construction or housing prices.', driver: 'Financing conditions constrained demand, while limited supply kept prices supported in major cities.', variables: 'Prices, transactions, permits, starts and completions.', interpretation: 'Compare prices and volumes to distinguish demand pressure from supply constraints.', provider: 'Housing statistics agency (demo)' },
  Sentiment: { base: 49.6, step: 0.9, unit: 'index points', definition: 'A survey of household, investor or business expectations about economic conditions.', driver: 'Expectations improved as price pressure eased, although respondents remained cautious about future demand.', variables: 'Current conditions, expected activity, hiring, spending and confidence.', interpretation: 'A higher reading reflects improved survey sentiment; each survey uses its own scale.', provider: 'Survey institute (demo)' },
  Speech: { base: 72, step: 5, unit: 'attention index', definition: 'A scheduled communication event with potential implications for monetary policy and market expectations.', driver: 'Attention is focused on inflation persistence, employment conditions and the timing of future policy changes.', variables: 'Policy guidance, inflation language, growth risks and audience questions.', interpretation: 'Compare the message with previous guidance; this event has no numerical economic release.', provider: 'Official communications calendar (demo)' },
  Holiday: { base: 38, step: 4, unit: 'turnover index', definition: 'A calendar event affecting local trading sessions and settlement availability.', driver: 'Local market closures reduce onshore participation. Offshore instruments may remain available with thinner liquidity.', variables: 'Session status, reopening schedule, settlement timing and indicative liquidity.', interpretation: 'The demo turnover index uses a normal session = 100. Lower values illustrate reduced participation.', provider: 'Market session calendar (demo)' },
};

const pairFor = (currency: string) => ['USD', 'EUR'].includes(currency) ? 'EUR/USD' : ['JPY', 'CNY', 'KRW', 'INR', 'THB', 'SGD', 'IDR', 'MYR'].includes(currency) ? `USD/${currency}` : `${currency}/USD`;
const dateLabel = (date: Date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

// These are deliberately synthetic fixtures. Calendar values and API-shaped context
// seed the example; supplemental history, projections, commentary and news are demo data.
export function buildDemoIndicator(event: EconomicEvent): EconomicIndicator {
  const profile = profiles[event.category];
  const kind = event.category === 'Holiday' ? 'holiday' : event.category === 'Speech' ? 'speech' : 'indicator';
  const isNumeric = kind === 'indicator';
  const baseDate = new Date(event.at);
  const month = /\((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\)/.exec(event.title)?.[1];
  const periodDate = new Date(baseDate);
  if (month) periodDate.setUTCMonth(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month), 1);
  const referencePeriod = isNumeric ? periodDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : dateLabel(baseDate);
  const unit = kind !== 'indicator' ? profile.unit : /%/.test(`${event.actual}${event.previous}${event.forecast}`) || /CPI|PPI|inflation|GDP|rate|sales|production|unemployment|earnings/i.test(event.title) ? '%' : /payroll|claims/i.test(event.title) ? 'thousand people' : profile.unit;
  const base = numberFrom(event.actual) ?? numberFrom(event.previous) ?? numberFrom(event.forecast) ?? profile.base;
  const latest = isNumeric ? numberFrom(event.actual) ?? round(base + profile.step * 0.35) : null;
  const previous = isNumeric ? numberFrom(event.previous) ?? round(base - profile.step) : null;
  const consensus = isNumeric ? numberFrom(event.forecast) ?? round(base - profile.step * 0.2) : null;
  const measure = latest ?? profile.base;
  const step = Math.max(Math.abs(measure) * 0.015, profile.step);
  const pattern = [-1.8, -1.2, -0.6, -0.9, 0.2, 0.5, -0.1, 0.8, 0.1, 1.4, 0.6, 0];
  const historicalSeries = pattern.map((offset, i) => {
    const date = new Date(periodDate);
    date.setUTCMonth(date.getUTCMonth() - (11 - i), 1);
    return { period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }), value: round(measure + offset * step) };
  });
  if (isNumeric && previous !== null) historicalSeries[10].value = previous;
  if (event.historicalTrend?.length && isNumeric) {
    event.historicalTrend.slice(-11).forEach((value, i, values) => { historicalSeries[11 - values.length + i].value = value; });
  }
  const forecastSeries = [1, 3, 6, 12].map((horizon, index) => {
    const date = new Date(periodDate);
    date.setUTCMonth(date.getUTCMonth() + horizon, 1);
    const value = round(measure + [0.25, 0.6, 0.9, 1.1][index] * step);
    return { period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }), value, type: index === 0 ? 'Platform forecast' : 'Econometric model', change: round(value - measure), source: 'Demo scenario model' };
  });
  const reopening = new Date(baseDate);
  if (event.currency === 'CNY' && kind === 'holiday') reopening.setUTCDate(8);
  else reopening.setUTCDate(reopening.getUTCDate() + 1);
  while (reopening.getUTCDay() === 0 || reopening.getUTCDay() === 6) reopening.setUTCDate(reopening.getUTCDate() + 1);
  const reopeningLabel = `${dateLabel(reopening)} · 09:30 local`;
  const sessions = kind === 'holiday' ? [
    { venue: event.currency === 'CNY' ? 'Shanghai Stock Exchange' : `${event.country} equities`, symbol: event.currency === 'CNY' ? 'SSE' : event.currency, status: 'Closed', reopening: reopeningLabel, expectation: 'Closed for the holiday', observed: 'Closure in demo schedule' },
    { venue: event.currency === 'CNY' ? 'Shenzhen Stock Exchange' : `${event.country} derivatives`, symbol: event.currency === 'CNY' ? 'SZSE' : event.currency, status: 'Closed', reopening: reopeningLabel, expectation: 'Closed for the holiday', observed: 'Closure in demo schedule' },
    { venue: `${event.currency} onshore settlement`, symbol: event.currency, status: 'Deferred', reopening: reopeningLabel, expectation: 'Next available business day', observed: 'Settlement deferred in sample' },
    { venue: 'Offshore FX session', symbol: pairFor(event.currency), status: 'Open · reduced liquidity', reopening: 'Continuous weekday session', expectation: 'Open with thinner participation', observed: 'Reduced participation in sample' },
  ] : kind === 'speech' ? [
    { venue: 'Prepared remarks', symbol: event.currency, status: 'Scheduled', reopening: dateLabel(baseDate), expectation: 'Policy outlook and inflation update', observed: 'Sample: cautious policy language' },
    { venue: 'Audience questions', symbol: pairFor(event.currency), status: 'After remarks', reopening: '30 minutes after start (demo)', expectation: 'Clarification of future policy path', observed: 'Sample: no commitment on timing' },
  ] : [];
  if (kind === 'holiday') {
    historicalSeries.forEach((point, i) => { point.value = [64, 71, 58, 66, 74, 62, 69, 57, 63, 67, 44, 38][i]; });
    forecastSeries.forEach((point, i) => { point.period = ['Closure day', 'Final closed session', 'Reopening session', 'Following session'][i]; point.value = [38, 42, 93, 100][i]; point.change = point.value - 38; });
  }
  const values = historicalSeries.map(p => p.value);
  const relation = (suffix: string, name: string, value: number, prev: number, relationUnit = 'index points'): IndicatorRelation => ({ id: `${event.id}-${suffix}`, name, latest: value, previous: prev, unit: relationUnit, referencePeriod, state: relationUnit === 'index points' && /PMI/.test(name) ? value >= 50 ? 'Expansion' : 'Contraction' : 'Latest sample observation' });
  const components = kind === 'holiday' ? [] : event.category === 'PMI' ? [
    relation('manufacturing', `${event.country} Manufacturing PMI`, 49.6, 52),
    relation('services', `${event.country} Services PMI`, 51.9, 53.2),
  ] : isNumeric ? [
    relation('core', `${event.category} underlying measure`, round(measure * 0.85), round((previous ?? measure) * 0.85), unit),
    relation('component', `${event.category} supporting measure`, round(measure * 0.65), round((previous ?? measure) * 0.65), unit),
  ] : [];
  const relatedIndicators = [relation('composite', `${event.country} Composite PMI`, 51.3, 52.7), relation('cpi', `${event.country} Consumer Price Inflation`, 2.4, 2.6, '%'), relation('rate', `${event.country} Policy Rate`, 3.85, 3.85, '%'), relation('confidence', `${event.country} Business Confidence`, 49.6, 48.8)];
  const direction = latest !== null && previous !== null ? latest > previous ? 'increased' : latest < previous ? 'decreased' : 'was unchanged' : 'remains on the published demo schedule';
  const commentary = kind === 'holiday' ? [
    { label: 'Market closure', text: `${event.country} local equity sessions are closed in this sample calendar. Trading availability differs between onshore and offshore instruments.` },
    { label: 'Liquidity', text: 'The indicative turnover index is 38 versus 100 for a normal session. These simulated values illustrate thinner order books during the holiday.' },
    { label: 'Settlement', text: 'Local-currency settlement is deferred to the next open business day in the demo schedule. Offshore FX remains accessible during weekday hours.' },
    { label: 'Reopening', text: `The sample reopening window is ${reopeningLabel}. The first open session may concentrate orders accumulated during the closure.` },
    { label: 'Related markets', text: `Track ${pairFor(event.currency)}, local equities and the next policy or inflation releases for context around the reopening.` },
  ] : kind === 'speech' ? [
    { label: 'Policy focus', text: profile.driver },
    { label: 'Base case', text: 'The sample message reiterates a data-dependent policy stance with no commitment to the date of the next rate change.' },
    { label: 'Alternative scenario', text: 'Stronger concern about inflation would shift attention toward tighter policy; emphasis on weaker demand would shift it toward easing.' },
    { label: 'Follow-up', text: 'The demo attention index illustrates interest around the event. It is an analytical proxy rather than a released economic statistic.' },
  ] : [
    { label: 'Main result', text: `The sample reading is ${formatValue(latest)} ${unit} for ${referencePeriod}.` },
    { label: 'Previous period', text: `The reading ${direction} from ${formatValue(previous)} ${unit}, a change of ${formatValue(round((latest ?? 0) - (previous ?? 0)))}.` },
    { label: 'Overall direction', text: event.category === 'PMI' ? `${formatValue(latest)} is ${(latest ?? 0) >= 50 ? 'above' : 'below'} the neutral level of 50, indicating ${(latest ?? 0) >= 50 ? 'expansion' : 'contraction'} in the sample.` : profile.interpretation },
    { label: 'Demand / new orders', text: profile.driver },
    { label: 'Employment', text: 'The sample labour backdrop shows moderate hiring and more balanced demand for workers.' },
    { label: 'Prices / input costs', text: 'Input costs remain elevated in the sample, with easing goods pressure partially offset by services costs.' },
    { label: 'Output prices', text: 'The illustrative scenario shows gradual pass-through of costs as demand improves.' },
    { label: 'Business sentiment', text: 'The sample confidence measure improved to 49.6 from 48.8, suggesting a cautious improvement in expectations.' },
  ];
  const outlook = [
    { scenario: kind === 'holiday' ? 'Orderly reopening' : 'Base case', probability: '60%', implication: kind === 'holiday' ? 'Participation recovers toward normal levels as domestic venues reopen.' : 'The current trend continues with modest changes over the next three months.' },
    { scenario: kind === 'holiday' ? 'Elevated reopening activity' : 'Upside scenario', probability: '25%', implication: kind === 'holiday' ? 'Accumulated orders lift volume and short-term volatility in the first open session.' : 'Improving demand produces a stronger reading than the central projection.' },
    { scenario: kind === 'holiday' ? 'Slow liquidity recovery' : 'Downside scenario', probability: '15%', implication: kind === 'holiday' ? 'Cautious participation keeps turnover below the normal-session baseline.' : 'Weaker demand or tighter financing conditions slow the recovery.' },
  ];
  const news = [
    { id: `${event.id}-brief`, headline: kind === 'holiday' ? `${event.country} holiday reduces local market participation` : `${event.country}: ${event.title} research brief`, summary: kind === 'holiday' ? 'Local equity trading and settlement pause while offshore currency markets remain active.' : profile.driver, publishedAt: event.at, source: 'MarketSyde demo research', body: `${profile.definition} ${profile.driver} ${profile.interpretation} This sample brief illustrates the structure of an indicator-linked research article.` },
    { id: `${event.id}-outlook`, headline: kind === 'holiday' ? 'Reopening watch: liquidity and accumulated orders' : `Outlook: ${event.category.toLowerCase()} and the next release`, summary: outlook[0].implication, publishedAt: event.at, source: 'MarketSyde demo research', body: `${outlook[0].implication} ${outlook[1].implication} ${outlook[2].implication} These are illustrative scenarios for exploring the detail page.` },
    { id: `${event.id}-crossasset`, headline: `${pairFor(event.currency)}: related calendar events to monitor`, summary: 'Policy rates, inflation and business activity provide the next set of reference points for the local currency.', publishedAt: event.at, source: 'MarketSyde demo research', body: `The sample dashboard links ${event.currency} events with PMI, inflation, policy rates and confidence data. Select a related indicator to explore its history and release expectations.` },
  ];
  const basePair = pairFor(event.currency);
  const affectedAssets = [
    { symbol: basePair, assetClass: 'Forex', sensitivity: event.impact === 'High' ? 'High' as const : 'Medium' as const, rationale: `Primary ${event.currency} cross reacts to rate-path and growth expectations.` },
    { symbol: event.relatedSignalTicker || (event.currency === 'USD' ? 'DXY' : 'XAU/USD'), assetClass: event.currency === 'USD' ? 'Index' : 'Commodity', sensitivity: event.impact === 'High' ? 'Medium' as const : 'Low' as const, rationale: 'Cross-asset reference for the first reaction window.' },
    { symbol: event.currency === 'USD' ? 'US500' : `${event.currency} equities`, assetClass: 'Indices', sensitivity: 'Low' as const, rationale: 'Risk appetite and discount-rate repricing can transmit into broader markets.' },
  ];
  const volatility = [
    { window: '15 min', trueRange: event.impact === 'High' ? '0.35%' : '0.18%', potentialRange: event.impact === 'High' ? '0.60%' : '0.30%', confidence: 'Medium' },
    { window: '1 hour', trueRange: event.impact === 'High' ? '0.80%' : '0.42%', potentialRange: event.impact === 'High' ? '1.40%' : '0.70%', confidence: 'Medium' },
    { window: '1 day', trueRange: event.impact === 'High' ? '1.25%' : '0.68%', potentialRange: event.impact === 'High' ? '2.40%' : '1.20%', confidence: 'Low' },
  ];
  const releaseState = event.allDay ? 'All day' : Date.parse(event.at) <= Date.now() ? 'Released' : 'Upcoming';
  const surpriseLabel = latest === null || consensus === null ? 'Pending' : latest > consensus ? 'Beat' : latest < consensus ? 'Miss' : 'In line';
  const sentiment = event.category === 'Inflation' || event.category === 'Employment' && latest !== null && previous !== null && latest < previous
    ? { label: 'Bearish' as const, score: 42, rationale: 'The illustrative surprise path suggests softer growth or tighter financial-condition concerns.' }
    : { label: 'Neutral' as const, score: 56, rationale: 'The sample release is balanced; direction depends on policy guidance and follow-through in related data.' };
  const marketStructure = [
    { label: 'Liquidity regime', value: event.impact === 'High' ? 'Thin into release' : 'Normal / moderate', note: 'Illustrative spread and depth condition around the scheduled timestamp.' },
    { label: 'Key reaction zone', value: event.impact === 'High' ? 'First 15 minutes' : 'First hour', note: 'Demo window where the initial surprise is most likely to be repriced.' },
    { label: 'Confirmation', value: 'Cross-asset follow-through', note: `Compare ${basePair} with rates, ${event.currency === 'USD' ? 'DXY' : 'gold'} and the next related release.` },
  ];
  return {
    id: event.id, country: { code: event.acuity?.countryCode || event.currency, name: event.country, flag: event.countryFlag }, category: event.category,
    name: event.currency === 'AUD' && /Manufacturing.*Services PMI/.test(event.title) ? 'Australia S&P Global Composite PMI' : event.title,
    slug: event.id, currency: event.currency, kind, latest, previous, consensus,
    forecast: isNumeric ? forecastSeries[0].value : null, unit, frequency: kind === 'holiday' ? 'Annual calendar event' : kind === 'speech' ? 'Scheduled communication' : /GDP/.test(event.title) ? 'Quarterly' : 'Monthly', referencePeriod,
    releaseDate: event.at, provider: profile.provider, lastUpdated: '2026-10-05T10:36:00+07:00',
    neutralThreshold: event.category === 'PMI' ? 50 : null,
    higherIsEconomicallyPositive: /unemployment/.test(event.title.toLowerCase()) ? false : event.category === 'Inflation' || !isNumeric ? null : true,
    historicalStats: { average: round(values.reduce((a, b) => a + b, 0) / values.length), high: Math.max(...values), highDate: historicalSeries[values.indexOf(Math.max(...values))].period, low: Math.min(...values), lowDate: historicalSeries[values.indexOf(Math.min(...values))].period, coverage: `${historicalSeries[0].period} – ${historicalSeries[11].period} · 12 sample observations` },
    summary: { headline: kind === 'holiday' ? `${event.country} holiday: local venues closed, offshore FX remains open` : kind === 'speech' ? 'Policy guidance takes focus ahead of the scheduled remarks' : `${event.country} ${event.category.toLowerCase()} ${direction} in the latest sample`, mainResult: kind === 'holiday' ? `This demo schedule shows two local trading venues closed and settlement deferred. Indicative participation falls to 38% of a normal session, with reopening modeled for ${reopeningLabel}.` : kind === 'speech' ? 'The demo brief tracks policy language, inflation concerns and growth risks. The accompanying attention index illustrates market interest around previous communication events.' : `The illustrative ${referencePeriod} result is ${formatValue(latest)} ${unit}, compared with ${formatValue(previous)} previously and a pre-release consensus of ${formatValue(consensus)}. ${profile.driver}`, commentary },
    methodology: [
      { label: 'Definition', text: profile.definition }, { label: 'Data provider', text: profile.provider },
      { label: 'Methodology', text: kind === 'holiday' ? 'Session status and reopening dates are illustrative calendar fixtures. Turnover is simulated on a normal-session baseline of 100.' : 'Sample observations are seeded from calendar fixture values. Supplemental history and projections are deterministic demo series.' },
      { label: 'Construction', text: event.category === 'PMI' ? 'The PMI example uses a diffusion-index framework, with 50 as neutral. Supporting series illustrate manufacturing and services relationships.' : 'The displayed measure and supporting series follow the unit and frequency of the selected event.' },
      { label: 'Variables tracked', text: profile.variables }, { label: 'Interpretation', text: profile.interpretation },
      { label: 'Source / data notes', text: 'Country, currency, category, description and event timing come from the calendar fixtures. API-shaped identifiers are mock values. All supplemental statistics, news, schedules and projections are illustrative.' },
    ], components, relatedIndicators, historicalSeries, forecastSeries,
    consensusHistory: isNumeric ? historicalSeries.slice(-6).map((point, i, points) => { const expectation = i === points.length - 1 ? consensus! : round(point.value + [0.2, -0.1, 0.3, -0.2, 0.1][i] * step); return { referencePeriod: point.period, releaseDate: `${point.period} · sample release`, actual: point.value, consensus: expectation, previous: i === 0 ? historicalSeries[5].value : points[i - 1].value, surprise: round(point.value - expectation) }; }) : [],
    news, sessions, outlook, affectedAssets, volatility, sentiment, marketStructure, releaseState, surpriseLabel,
    seededAlerts: [
      { id: `${event.id}-reminder`, indicatorId: event.id, name: kind === 'holiday' ? 'Reopening reminder' : 'Release reminder', type: 'Release', condition: 'Before release', triggerValue: '30', delivery: 'In-app', active: true },
      { id: `${event.id}-monitor`, indicatorId: event.id, name: kind === 'holiday' ? 'Schedule and liquidity updates' : 'New research brief', type: 'News', condition: 'Relevant news published', triggerValue: 'Any update', delivery: 'Email', active: false },
      ...(event.category === 'PMI' ? [{ id: `${event.id}-threshold`, indicatorId: event.id, name: 'PMI contraction watch', type: 'Threshold' as const, condition: 'Cross below', triggerValue: '50', delivery: 'In-app' as const, active: true }] : []),
    ],
  };
}
