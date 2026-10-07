import { EconomicEvent, EventNote, BrokerEventTag, EventCategory, EventImpact } from '../types';

export const CALENDAR_IMPACTS = ['Low', 'Medium', 'High'] as const;

export const IMPACT_STYLES: Record<string, { dot: string; chip: string; star: string }> = {
  Low: { dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-600', star: 'text-slate-400 fill-slate-400' },
  Medium: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700', star: 'text-amber-500 fill-amber-500' },
  High: { dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-600', star: 'text-rose-500 fill-rose-500' },
};

export const IMPACT_STARS: Record<EventImpact, number> = { Low: 1, Medium: 2, High: 3 };

/** The mock "now" for the demo dataset: Monday 5 Oct 2026, 10:36 in GMT+7. */
export const CALENDAR_NOW = '2026-10-05T10:36:00+07:00';

export const CALENDAR_TIMEZONES = [
  { label: 'GMT+7:00', offset: 7 },
  { label: 'GMT+9:00', offset: 9 },
  { label: 'GMT+5:30', offset: 5.5 },
  { label: 'GMT+8:00', offset: 8 },
  { label: 'GMT', offset: 0 },
  { label: 'GMT-4:00', offset: -4 },
];

export const CALENDAR_CATEGORIES = [
  'Interest Rate',
  'Prices & Inflation',
  'Labour Market',
  'GDP Growth',
  'Foreign Trade',
  'Government',
  'Business Confidence',
  'Consumer Sentiment',
  'Housing Market',
  'Bond Auctions',
  'Energy',
  'Holidays',
  'Earnings',
] as const;

// Display labels follow the calendar reference taxonomy while these mappings
// keep filtering compatible with the event categories in the demo dataset.
export const CALENDAR_CATEGORY_MATCHES: Record<(typeof CALENDAR_CATEGORIES)[number], EventCategory[]> = {
  'Interest Rate': ['Central Bank'],
  'Prices & Inflation': ['Inflation'],
  'Labour Market': ['Employment'],
  'GDP Growth': ['GDP'],
  'Foreign Trade': ['Trade'],
  Government: ['Speech'],
  'Business Confidence': ['Sentiment'],
  'Consumer Sentiment': ['Sentiment'],
  'Housing Market': ['Housing'],
  'Bond Auctions': ['Trade'],
  Energy: ['Trade'],
  Holidays: ['Holiday'],
  Earnings: ['GDP'],
};

const CUR: Record<string, { country: string; flag: string; region: string }> = {
  USD: { country: 'United States', flag: '🇺🇸', region: 'US' },
  EUR: { country: 'Eurozone', flag: '🇪🇺', region: 'EU' },
  GBP: { country: 'United Kingdom', flag: '🇬🇧', region: 'UK' },
  JPY: { country: 'Japan', flag: '🇯🇵', region: 'Japan' },
  CNY: { country: 'China', flag: '🇨🇳', region: 'China' },
  AUD: { country: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific' },
  NZD: { country: 'New Zealand', flag: '🇳🇿', region: 'Asia-Pacific' },
  KRW: { country: 'South Korea', flag: '🇰🇷', region: 'Asia-Pacific' },
  SGD: { country: 'Singapore', flag: '🇸🇬', region: 'Asia-Pacific' },
  THB: { country: 'Thailand', flag: '🇹🇭', region: 'Southeast Asia' },
  IDR: { country: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia' },
  MYR: { country: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia' },
  INR: { country: 'India', flag: '🇮🇳', region: 'South Asia' },
  CAD: { country: 'Canada', flag: '🇨🇦', region: 'US' },
};

export const CALENDAR_COUNTRIES = Object.entries(CUR).map(([code, m]) => ({ code, ...m }));

type Row = {
  at: string;
  cur: string;
  title: string;
  imp: 1 | 2 | 3;
  cat: EventCategory;
  f?: string;
  p?: string;
  a?: string;
  speech?: boolean;
  extra?: Partial<EconomicEvent>;
};

const impOf = (n: 1 | 2 | 3): EventImpact => (n === 3 ? 'High' : n === 2 ? 'Medium' : 'Low');

const COUNTRY_CODE_BY_CURRENCY: Record<string, string> = {
  USD: 'US', EUR: 'EMU', GBP: 'GB', JPY: 'JP', CNY: 'CN', AUD: 'AU', NZD: 'NZ', KRW: 'KR', SGD: 'SG', THB: 'TH', IDR: 'ID', MYR: 'MY', INR: 'IN', CAD: 'CA',
};

const acuityDetails = (id: string, at: string, cur: string, meta: { country: string }, category: EventCategory, title: string, impact: 1 | 2 | 3, summary: string, eventTime: 'BMO' | 'AMC' | 'NA' = 'NA', relatedTicker?: string) => {
  const countryCode = COUNTRY_CODE_BY_CURRENCY[cur] || cur;
  return {
    source: 'Acuity' as const,
    eventId: `acuity_${countryCode}_${category.toLowerCase().replace(/\s+/g, '-')}_${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    occurrenceId: id,
    countryCode,
    countryName: meta.country,
    currencyId: cur,
    eventTypeId: `type_${category.toLowerCase().replace(/\s+/g, '-')}`,
    eventTypeDescription: category === 'Holiday' ? 'Holidays' : category,
    potency: impact,
    potencySymbol: impact === 3 ? 'H' : impact === 2 ? 'M' : 'L',
    description: summary,
    eventTime,
    assetIds: relatedTicker ? [relatedTicker.length * 10] : [],
    assetTickers: relatedTicker ? [relatedTicker] : [],
    isLatest: true,
  };
};

const summaryFor = (r: Row, country: string) =>
  r.cat === 'Speech'
    ? `${r.title.replace(' Speaks', '')} delivers remarks. The headline risk is tone: a change from recent guidance can move ${r.cur} quickly.`
    : `${r.title} for ${country}. Compare the Actual with the Forecast first, then with the Previous figure to see the direction of travel. Large surprises tend to move ${r.cur} pairs.`;

const build = (rows: Row[]): EconomicEvent[] =>
  rows.map((r, i) => {
    const meta = CUR[r.cur];
    const id = `evt_${r.at.slice(0, 10).replace(/-/g, '')}_${i}`;
    const summary = summaryFor(r, meta.country);
    return {
      id,
      title: r.title,
      country: meta.country,
      countryFlag: meta.flag,
      currency: r.cur,
      region: meta.region,
      assetClass: 'Forex',
      category: r.cat,
      impact: impOf(r.imp),
      at: r.at,
      hasSpeech: r.speech,
      forecast: r.f,
      previous: r.p,
      actual: r.a,
      summary,
      historicalTrend: [],
      acuity: acuityDetails(id, r.at, r.cur, meta, r.cat, r.title, r.imp, summary, r.speech ? 'NA' : 'NA', r.extra?.relatedSignalTicker),
      ...r.extra,
    } as EconomicEvent;
  });

const holiday = (date: string, cur: string, title: string): EconomicEvent => {
  const meta = CUR[cur];
  const id = `hol_${date.replace(/-/g, '')}_${cur}`;
  const summary = `${meta.country} markets are closed or trade on reduced hours. Expect thinner liquidity in ${cur} pairs.`;
  return {
    id,
    title,
    country: meta.country,
    countryFlag: meta.flag,
    currency: cur,
    region: meta.region,
    assetClass: 'Forex',
    category: 'Holiday',
    impact: 'Low',
    at: `${date}T00:00:00+07:00`,
    date,
    allDay: true,
    summary,
    historicalTrend: [],
    acuity: acuityDetails(id, `${date}T00:00:00+07:00`, cur, meta, 'Holiday', title, 1, summary),
  };
};

export const ECONOMIC_EVENTS: EconomicEvent[] = [
  // ───────── Sunday 4 Oct (yesterday) ─────────
  holiday('2026-10-04', 'CNY', 'China - National Day'),
  ...build([
    { at: '2026-10-04T08:30:00+07:00', cur: 'THB', title: 'Business Sentiment Index (Sep)', imp: 1, cat: 'Sentiment', f: '49.0', p: '48.8', a: '49.6' },
    { at: '2026-10-04T14:00:00+07:00', cur: 'INR', title: 'Services PMI (Sep)', imp: 2, cat: 'PMI', f: '58.9', p: '59.3', a: '58.4' },
  ]),

  // ───────── Monday 5 Oct (today) ─────────
  holiday('2026-10-05', 'CNY', 'China - National Day'),
  holiday('2026-10-05', 'KRW', 'South Korea - National Foundation Day of Korea'),
  ...build([
    { at: '2026-10-05T05:00:00+07:00', cur: 'AUD', title: 'S&P Global Services PMI (Sep)', imp: 1, cat: 'PMI', f: '51.4', p: '53.2', a: '51.9' },
    { at: '2026-10-05T05:00:00+07:00', cur: 'AUD', title: 'S&P Global Manufacturing & Services PMI (Sep)', imp: 1, cat: 'PMI', f: '50.80', p: '52.70', a: '51.30' },
    { at: '2026-10-05T07:00:00+07:00', cur: 'AUD', title: 'MI Inflation Gauge (MoM) (Sep)', imp: 1, cat: 'Inflation', p: '0.5%', a: '0.3%' },
    { at: '2026-10-05T07:00:00+07:00', cur: 'NZD', title: 'ANZ Commodity Price Index (MoM)', imp: 1, cat: 'Trade', p: '-0.4%', a: '0.6%' },
    { at: '2026-10-05T07:30:00+07:00', cur: 'JPY', title: 'S&P Global Services PMI (Sep)', imp: 2, cat: 'PMI', f: '51.6', p: '52.5', a: '51.3' },
    { at: '2026-10-05T07:30:00+07:00', cur: 'JPY', title: 'Manufacturing & Services PMI (Sep)', imp: 1, cat: 'PMI', f: '52.50', p: '53.50', a: '52.30' },
    { at: '2026-10-05T12:00:00+07:00', cur: 'JPY', title: 'Household Confidence (Sep)', imp: 1, cat: 'Sentiment', f: '35.3', p: '35.5' },
    { at: '2026-10-05T12:00:00+07:00', cur: 'SGD', title: 'Retail Sales (YoY) (Aug)', imp: 1, cat: 'GDP', p: '1.5%' },
    { at: '2026-10-05T14:30:00+07:00', cur: 'THB', title: 'Consumer Price Index (YoY) (Sep)', imp: 2, cat: 'Inflation', f: '0.6%', p: '0.4%' },
    {
      at: '2026-10-05T15:00:00+07:00', cur: 'EUR', title: 'HCOB Eurozone Services PMI (Sep)', imp: 2, cat: 'PMI', f: '53.0', p: '53.0',
      extra: { historicalTrend: [51.4, 52.1, 52.6, 53.0, 53.0], relatedArticleId: 'news_6', relatedSignalTicker: 'EUR/USD', assetClass: 'Forex' },
    },
    { at: '2026-10-05T15:00:00+07:00', cur: 'EUR', title: 'HCOB Eurozone Composite PMI (Sep)', imp: 2, cat: 'PMI', f: '53.1', p: '53.1' },
    { at: '2026-10-05T15:00:00+07:00', cur: 'EUR', title: "ECB's Lane Speaks", imp: 2, cat: 'Speech', speech: true, extra: { relatedArticleId: 'news_6' } },
    { at: '2026-10-05T15:30:00+07:00', cur: 'GBP', title: 'S&P Global Composite PMI (Sep)', imp: 2, cat: 'PMI', f: '51.7', p: '51.7' },
    { at: '2026-10-05T15:30:00+07:00', cur: 'EUR', title: 'Sentix Investor Confidence (Oct)', imp: 1, cat: 'Sentiment', f: '4.5', p: '5.1' },
    { at: '2026-10-05T16:00:00+07:00', cur: 'EUR', title: "ECB's Schnabel Speaks", imp: 2, cat: 'Speech', speech: true },
    { at: '2026-10-05T16:00:00+07:00', cur: 'EUR', title: 'PPI (MoM) (Aug)', imp: 1, cat: 'Inflation', f: '1.9%', p: '1.6%' },
    { at: '2026-10-05T16:00:00+07:00', cur: 'EUR', title: 'PPI (YoY) (Aug)', imp: 1, cat: 'Inflation', p: '5.8%' },
    { at: '2026-10-05T20:30:00+07:00', cur: 'CAD', title: 'S&P Global Services PMI (Sep)', imp: 1, cat: 'PMI', p: '49.10' },
    {
      at: '2026-10-05T21:45:00+07:00', cur: 'USD', title: 'S&P Global Services PMI (Sep)', imp: 2, cat: 'PMI', f: '55.4', p: '55.4',
      extra: { relatedSignalTicker: 'EUR/USD' },
    },
    {
      at: '2026-10-05T22:00:00+07:00', cur: 'USD', title: 'S&P 500 Futures Sentiment', imp: 2, cat: 'Sentiment', f: '0.4%', p: '0.2%',
      extra: {
        assetClass: 'Indices',
        relatedSignalTicker: 'SPX',
        summary: 'Illustrative index-futures sentiment snapshot for the S&P 500. This synthetic event demonstrates index-linked calendar cards in the current-day view.',
      },
    },
    {
      at: '2026-10-05T22:05:00+07:00', cur: 'USD', title: 'Nasdaq 100 Futures Sentiment', imp: 1, cat: 'Sentiment', f: '0.6%', p: '0.3%',
      extra: {
        assetClass: 'Indices',
        relatedSignalTicker: 'NDX',
        summary: 'Illustrative technology-index futures snapshot. Values are demo-only and intended to exercise grouped Indices cards and linked detail pages.',
      },
    },
    {
      at: '2026-10-05T22:15:00+07:00', cur: 'USD', title: 'Tesla Earnings Preview', imp: 2, cat: 'GDP', f: '0.72', p: '0.78',
      extra: {
        assetClass: 'Stocks',
        relatedSignalTicker: 'TSLA',
        summary: 'Illustrative single-stock earnings preview for Tesla. Synthetic EPS values demonstrate the Stocks market type without a live earnings provider.',
      },
    },
    {
      at: '2026-10-05T22:20:00+07:00', cur: 'USD', title: 'Microsoft Earnings Preview', imp: 2, cat: 'GDP', f: '3.95', p: '3.88',
      extra: {
        assetClass: 'Stocks',
        relatedSignalTicker: 'MSFT',
        summary: 'Illustrative single-stock earnings preview for Microsoft. This event is grouped with other Stocks instruments and opens the standard detail flow.',
      },
    },
    {
      at: '2026-10-05T22:30:00+07:00', cur: 'USD', title: 'WTI Crude Inventory Preview', imp: 3, cat: 'Trade', f: '-1.8M', p: '-0.9M',
      extra: {
        assetClass: 'Commodity',
        relatedSignalTicker: 'WTI',
        summary: 'Illustrative crude-oil inventory preview for WTI. Inventory surprises are commonly used to demonstrate commodity volatility and range metrics.',
      },
    },
    {
      at: '2026-10-05T22:35:00+07:00', cur: 'USD', title: 'Gold ETF Holdings Snapshot', imp: 1, cat: 'Trade', f: '875.2T', p: '873.9T',
      extra: {
        assetClass: 'Commodity',
        relatedSignalTicker: 'XAU/USD',
        summary: 'Illustrative gold ETF holdings snapshot. This synthetic release provides a second Commodity card for grouped instrument behavior.',
      },
    },
    {
      at: '2026-10-05T22:45:00+07:00', cur: 'USD', title: 'Bitcoin Funding Rate', imp: 2, cat: 'Trade', f: '0.012%', p: '0.009%',
      extra: {
        assetClass: 'Crypto',
        relatedSignalTicker: 'BTC/USD',
        summary: 'Illustrative perpetual-futures funding-rate snapshot for Bitcoin. Values are synthetic and demonstrate the Crypto event workflow.',
      },
    },
    {
      at: '2026-10-05T22:50:00+07:00', cur: 'USD', title: 'Ethereum Network Activity', imp: 1, cat: 'Trade', f: '1.24M', p: '1.19M',
      extra: {
        assetClass: 'Crypto',
        relatedSignalTicker: 'ETH/USD',
        summary: 'Illustrative Ethereum network-activity update. This second Crypto event demonstrates multi-card grouping and linked detail navigation.',
      },
    },
  ]),

  // ───────── Tuesday 6 Oct ─────────
  ...build([
    { at: '2026-10-06T08:30:00+07:00', cur: 'JPY', title: 'Average Cash Earnings (YoY) (Aug)', imp: 1, cat: 'Employment', f: '2.9%', p: '3.4%' },
    {
      at: '2026-10-06T11:30:00+07:00', cur: 'AUD', title: 'RBA Interest Rate Decision', imp: 3, cat: 'Central Bank', f: '3.85%', p: '3.85%',
      extra: {
        historicalTrend: [4.35, 4.35, 4.1, 3.85, 3.85, 3.85],
        summary: 'The Reserve Bank of Australia announces its cash-rate decision. Markets expect a hold; the statement and the governor’s press conference set the tone for AUD.',
        aiPrediction: 'A hold is priced in. The model flags any change in the inflation language as the swing factor for AUD/USD in the first hour.',
      },
    },
    { at: '2026-10-06T14:00:00+07:00', cur: 'THB', title: 'Consumer Confidence (Sep)', imp: 1, cat: 'Sentiment', f: '52.1', p: '51.7' },
    { at: '2026-10-06T15:00:00+07:00', cur: 'EUR', title: 'Retail Sales (MoM) (Aug)', imp: 2, cat: 'GDP', f: '0.2%', p: '-0.1%' },
    { at: '2026-10-06T19:30:00+07:00', cur: 'USD', title: 'Trade Balance (Aug)', imp: 2, cat: 'Trade', f: '-78.5B', p: '-78.9B' },
    { at: '2026-10-06T21:00:00+07:00', cur: 'USD', title: 'ISM Services PMI (Sep)', imp: 3, cat: 'PMI', f: '52.0', p: '51.5', extra: { historicalTrend: [50.1, 50.8, 51.2, 51.5], relatedSignalTicker: 'EUR/USD' } },
  ]),

  // ───────── Wednesday 7 Oct ─────────
  ...build([
    { at: '2026-10-07T08:30:00+07:00', cur: 'IDR', title: 'Consumer Confidence (Sep)', imp: 1, cat: 'Sentiment', f: '121.0', p: '120.2' },
    {
      at: '2026-10-07T16:00:00+07:00', cur: 'USD', title: 'Gold Reserves Report', imp: 2, cat: 'Trade', p: '2,845 tonnes',
      extra: {
        assetClass: 'Commodity',
        historicalTrend: [2780, 2795, 2810, 2825, 2838, 2845],
        relatedArticleId: 'news_2',
        relatedSignalTicker: 'XAU/USD',
        summary: 'Quarterly update on central-bank gold reserve accumulation. A continued buying trend tends to support gold prices over the medium term.',
      },
    },
    { at: '2026-10-07T19:30:00+07:00', cur: 'CAD', title: 'Ivey PMI (Sep)', imp: 1, cat: 'PMI', f: '53.4', p: '52.9' },
    {
      at: '2026-10-07T23:00:00+07:00', cur: 'USD', title: 'FOMC Member Speech', imp: 2, cat: 'Speech', speech: true,
      extra: { relatedArticleId: 'news_1', relatedSignalTicker: 'EUR/USD', summary: 'A voting Federal Reserve member delivers prepared remarks and takes questions. Can move markets if the tone differs from recent committee messaging.' },
    },
  ]),

  // ───────── Thursday 8 Oct ─────────
  ...build([
    { at: '2026-10-08T08:30:00+07:00', cur: 'JPY', title: 'Current Account (Aug)', imp: 1, cat: 'Trade', f: '2.40T', p: '2.84T' },
    { at: '2026-10-08T13:00:00+07:00', cur: 'GBP', title: 'GDP (MoM) (Aug)', imp: 2, cat: 'GDP', f: '0.1%', p: '0.2%', extra: { historicalTrend: [0.3, 0.2, 0.0, -0.1, 0.2, 0.2] } },
    {
      at: '2026-10-08T18:15:00+07:00', cur: 'EUR', title: 'ECB Interest Rate Decision', imp: 3, cat: 'Central Bank', f: '4.00%', p: '4.00%',
      extra: {
        historicalTrend: [4.5, 4.25, 4.25, 4.0, 4.0, 4.0],
        relatedArticleId: 'news_6',
        relatedSignalTicker: 'EUR/USD',
        summary: 'The European Central Bank announces its benchmark rate. Markets are pricing a hold, so attention shifts to forward guidance in the press conference.',
        aiPrediction: 'A hold is already priced in. The model flags press-conference tone as the real catalyst; hawkish wording could reverse EUR strength quickly.',
      },
    },
    { at: '2026-10-08T19:30:00+07:00', cur: 'USD', title: 'Initial Jobless Claims', imp: 2, cat: 'Employment', f: '224K', p: '219K' },
    { at: '2026-10-08T20:30:00+07:00', cur: 'EUR', title: "ECB President Press Conference", imp: 3, cat: 'Speech', speech: true, extra: { relatedSignalTicker: 'EUR/USD' } },
  ]),

  // ───────── Friday 9 Oct ─────────
  ...build([
    { at: '2026-10-09T10:00:00+07:00', cur: 'THB', title: 'Bank of Thailand Interest Rate Decision', imp: 3, cat: 'Central Bank', f: '2.25%', p: '2.25%', extra: { historicalTrend: [2.5, 2.5, 2.25, 2.25] } },
    { at: '2026-10-09T14:30:00+07:00', cur: 'INR', title: 'RBI Monetary Policy Statement', imp: 3, cat: 'Central Bank', f: '5.50%', p: '5.50%' },
    {
      at: '2026-10-09T19:30:00+07:00', cur: 'USD', title: 'Non-Farm Payrolls (Sep)', imp: 3, cat: 'Employment', f: '180K', p: '142K',
      extra: {
        historicalTrend: [210, 190, 175, 165, 142],
        relatedArticleId: 'news_1',
        relatedSignalTicker: 'EUR/USD',
        summary: 'Monthly change in employed people, excluding farming. A figure well below forecast tends to weigh on the dollar and firm up rate-cut pricing.',
        aiPrediction: 'Model assigns a 68% probability of continued dollar weakness if payrolls miss by more than 40K, with EUR/USD likely to test 1.0950 within 24 hours.',
      },
    },
    { at: '2026-10-09T19:30:00+07:00', cur: 'USD', title: 'Unemployment Rate (Sep)', imp: 3, cat: 'Employment', f: '4.2%', p: '4.2%' },
    { at: '2026-10-09T19:30:00+07:00', cur: 'CAD', title: 'Employment Change (Sep)', imp: 3, cat: 'Employment', f: '20.0K', p: '22.1K' },
  ]),

  // ───────── Week of 12 Oct ─────────
  holiday('2026-10-12', 'JPY', 'Japan - Sports Day'),
  holiday('2026-10-12', 'CAD', 'Canada - Thanksgiving Day'),
  holiday('2026-10-13', 'THB', 'Thailand - King Bhumibol Memorial Day'),
  ...build([
    {
      at: '2026-10-12T08:00:00+07:00', cur: 'CNY', title: 'Industrial Production (YoY) (Sep)', imp: 2, cat: 'GDP', f: '5.6%', p: '5.4%',
      extra: { assetClass: 'Commodity', relatedSignalTicker: 'BRENT', historicalTrend: [5.1, 5.2, 5.3, 5.2, 5.4, 5.4] },
    },
    { at: '2026-10-12T21:00:00+07:00', cur: 'USD', title: 'Existing Home Sales (Sep)', imp: 1, cat: 'Housing', f: '4.10M', p: '4.00M', extra: { assetClass: 'Indices' } },
    { at: '2026-10-13T08:30:00+07:00', cur: 'JPY', title: 'Machinery Orders (MoM) (Aug)', imp: 1, cat: 'GDP', f: '0.9%', p: '-0.6%' },
    {
      at: '2026-10-13T19:30:00+07:00', cur: 'USD', title: 'Core CPI (MoM) (Sep)', imp: 3, cat: 'Inflation', f: '0.3%', p: '0.3%',
      extra: {
        assetClass: 'Indices',
        historicalTrend: [0.4, 0.3, 0.2, 0.3, 0.3, 0.3],
        relatedArticleId: 'news_4',
        relatedSignalTicker: 'XAU/USD',
        summary: 'Change in prices paid by consumers, excluding food and energy. The most-watched inflation print for rate-path expectations.',
        aiPrediction: 'Options-implied volatility is at a six-week high into this print. A hotter-than-expected read has historically moved gold 1.2% or more within the hour.',
      },
    },
    { at: '2026-10-13T19:30:00+07:00', cur: 'USD', title: 'CPI (YoY) (Sep)', imp: 3, cat: 'Inflation', f: '2.9%', p: '2.9%' },
    { at: '2026-10-14T08:00:00+07:00', cur: 'IDR', title: 'Trade Balance (Sep)', imp: 1, cat: 'Trade', f: '3.10B', p: '2.95B' },
    {
      at: '2026-10-14T22:00:00+07:00', cur: 'USD', title: 'Crypto Market Structure Hearing', imp: 2, cat: 'Speech', speech: true,
      extra: {
        assetClass: 'Crypto',
        relatedArticleId: 'news_5',
        relatedSignalTicker: 'ETH',
        summary: 'A congressional committee hearing on digital-asset market-structure legislation. Headline risk is elevated around regulatory commentary, which can move Bitcoin and other major coins.',
      },
    },
    {
      at: '2026-10-14T23:00:00+07:00', cur: 'USD', title: 'Bitcoin ETF Flow Update', imp: 2, cat: 'Trade',
      extra: {
        assetClass: 'Crypto',
        relatedSignalTicker: 'BTC/USD',
        summary: 'Illustrative daily flow update for spot Bitcoin exchange-traded funds. This synthetic release demonstrates grouped Crypto cards without requiring a live market-data provider.',
      },
    },
    {
      at: '2026-10-14T21:00:00+07:00', cur: 'USD', title: 'JPMorgan Earnings (Q3)', imp: 3, cat: 'GDP', f: '4.82', p: '4.37',
      extra: {
        assetClass: 'Stocks',
        relatedSignalTicker: 'JPM',
        summary: 'Illustrative company earnings release for JPMorgan Chase. Compare the synthetic EPS forecast and previous result to demonstrate the Stocks market-type workflow.',
      },
    },
    {
      at: '2026-10-14T21:15:00+07:00', cur: 'USD', title: 'Wells Fargo Earnings (Q3)', imp: 2, cat: 'GDP', f: '1.55', p: '1.42',
      extra: {
        assetClass: 'Stocks',
        relatedSignalTicker: 'WFC',
        summary: 'Illustrative company earnings release for Wells Fargo. This synthetic event is grouped with other Stocks events and links to the standard event detail flow.',
      },
    },
    {
      at: '2026-10-15T21:00:00+07:00', cur: 'USD', title: 'Bank of America Earnings (Q3)', imp: 2, cat: 'GDP', f: '0.92', p: '0.81',
      extra: {
        assetClass: 'Stocks',
        relatedSignalTicker: 'BAC',
        summary: 'Illustrative company earnings release for Bank of America. Values are demo-only and intentionally require no provider credentials.',
      },
    },
    {
      at: '2026-10-15T22:00:00+07:00', cur: 'USD', title: '10-Year Treasury Auction', imp: 2, cat: 'Trade', f: '4.12%', p: '4.09%',
      extra: {
        assetClass: 'Other',
        relatedSignalTicker: 'US10Y',
        summary: 'Illustrative sovereign-bond auction result. This Other-market event demonstrates rates and fixed-income calendar data without requiring a live auction feed.',
      },
    },
    {
      at: '2026-10-16T20:00:00+07:00', cur: 'USD', title: 'US Consumer Credit Update', imp: 1, cat: 'Trade', f: '18.4B', p: '16.9B',
      extra: {
        assetClass: 'Other',
        relatedSignalTicker: 'US2Y',
        summary: 'Synthetic fixed-income and credit-market update for the Other market group. Values are illustrative and are safe to replace with a real provider response later.',
      },
    },
    {
      at: '2026-10-16T21:00:00+07:00', cur: 'EUR', title: 'Eurozone Bond Spread Monitor', imp: 1, cat: 'Trade', f: '132bp', p: '135bp',
      extra: {
        assetClass: 'Other',
        relatedSignalTicker: 'DE10Y',
        summary: 'Illustrative sovereign-spread monitor event for the Other market group, included to exercise multi-card grouping and linked detail pages.',
      },
    },
    { at: '2026-10-15T11:30:00+07:00', cur: 'AUD', title: 'Employment Change (Sep)', imp: 3, cat: 'Employment', f: '25.0K', p: '47.5K' },
    { at: '2026-10-15T15:00:00+07:00', cur: 'MYR', title: 'GDP (YoY) (Q3, Advance)', imp: 2, cat: 'GDP', f: '4.6%', p: '4.4%' },
    { at: '2026-10-15T19:30:00+07:00', cur: 'USD', title: 'Retail Sales (MoM) (Sep)', imp: 2, cat: 'Sentiment', f: '0.3%', p: '0.1%', extra: { assetClass: 'Indices' } },
    { at: '2026-10-16T14:00:00+07:00', cur: 'INR', title: 'Trade Balance (Sep)', imp: 1, cat: 'Trade', f: '-24.5B', p: '-26.0B' },
  ]),
];

export interface HolidayRow {
  date: string;
  weekday: string;
  cur: string;
  holiday: string;
  impact: string;
}

export const HOLIDAYS: HolidayRow[] = [
  { date: 'Oct 1 – Oct 7', weekday: 'Thu – Wed', cur: 'CNY', holiday: 'China - National Day (Golden Week)', impact: 'Mainland exchanges closed' },
  { date: 'Oct 5', weekday: 'Mon', cur: 'KRW', holiday: 'South Korea - National Foundation Day (substitute)', impact: 'Korean markets closed' },
  { date: 'Oct 12', weekday: 'Mon', cur: 'JPY', holiday: 'Japan - Sports Day', impact: 'Tokyo exchanges closed' },
  { date: 'Oct 12', weekday: 'Mon', cur: 'CAD', holiday: 'Canada - Thanksgiving Day', impact: 'Toronto exchange closed' },
  { date: 'Oct 12', weekday: 'Mon', cur: 'USD', holiday: 'United States - Columbus Day', impact: 'Bond markets closed, equities open' },
  { date: 'Oct 13', weekday: 'Tue', cur: 'THB', holiday: 'Thailand - King Bhumibol Memorial Day', impact: 'Banks and SET closed' },
  { date: 'Oct 20', weekday: 'Tue', cur: 'INR', holiday: 'India - Dussehra', impact: 'Indian exchanges closed' },
  { date: 'Oct 23', weekday: 'Fri', cur: 'THB', holiday: 'Thailand - Chulalongkorn Day', impact: 'Banks and SET closed' },
];

export interface EarningsRow {
  date: string;
  time: 'Before open' | 'After close';
  company: string;
  ticker: string;
  epsForecast: string;
  epsPrevious: string;
  revenueForecast: string;
}

export const EARNINGS: EarningsRow[] = [
  { date: 'Oct 14', time: 'Before open', company: 'JPMorgan Chase', ticker: 'JPM', epsForecast: '4.82', epsPrevious: '4.37', revenueForecast: '43.1B' },
  { date: 'Oct 14', time: 'Before open', company: 'Wells Fargo', ticker: 'WFC', epsForecast: '1.55', epsPrevious: '1.42', revenueForecast: '20.9B' },
  { date: 'Oct 15', time: 'Before open', company: 'Bank of America', ticker: 'BAC', epsForecast: '0.92', epsPrevious: '0.81', revenueForecast: '26.4B' },
  { date: 'Oct 15', time: 'After close', company: 'Taiwan Semiconductor', ticker: 'TSM', epsForecast: '2.35', epsPrevious: '1.94', revenueForecast: '23.8B' },
  { date: 'Oct 16', time: 'Before open', company: 'Charles Schwab', ticker: 'SCHW', epsForecast: '1.18', epsPrevious: '1.05', revenueForecast: '5.7B' },
  { date: 'Oct 16', time: 'After close', company: 'Interactive Brokers', ticker: 'IBKR', epsForecast: '2.05', epsPrevious: '1.88', revenueForecast: '1.4B' },
];

export interface DividendRow {
  exDate: string;
  company: string;
  ticker: string;
  dividend: string;
  yield: string;
  payDate: string;
}

export const DIVIDENDS: DividendRow[] = [
  { exDate: 'Oct 6', company: 'Procter & Gamble', ticker: 'PG', dividend: '1.06', yield: '2.4%', payDate: 'Nov 15' },
  { exDate: 'Oct 8', company: 'Cisco Systems', ticker: 'CSCO', dividend: '0.41', yield: '2.7%', payDate: 'Oct 29' },
  { exDate: 'Oct 9', company: 'Microsoft', ticker: 'MSFT', dividend: '0.83', yield: '0.7%', payDate: 'Dec 10' },
  { exDate: 'Oct 13', company: 'Shell', ticker: 'SHEL', dividend: '0.36', yield: '3.9%', payDate: 'Dec 21' },
  { exDate: 'Oct 15', company: 'JPMorgan Chase', ticker: 'JPM', dividend: '1.40', yield: '1.9%', payDate: 'Oct 31' },
  { exDate: 'Oct 16', company: 'PTT Public Company', ticker: 'PTT', dividend: '0.65', yield: '4.1%', payDate: 'Nov 20' },
];

export interface IpoRow {
  date: string;
  company: string;
  exchange: string;
  priceRange: string;
  shares: string;
  status: 'Expected' | 'Priced' | 'Filed';
}

export const IPOS: IpoRow[] = [
  { date: 'Oct 7', company: 'Northwind Robotics (sample)', exchange: 'NASDAQ', priceRange: '$18 – $21', shares: '12.0M', status: 'Expected' },
  { date: 'Oct 9', company: 'Lanna Digital Bank (sample)', exchange: 'SET', priceRange: '฿9.50 – ฿11.00', shares: '240M', status: 'Priced' },
  { date: 'Oct 13', company: 'Meridian Therapeutics (sample)', exchange: 'NYSE', priceRange: '$24 – $27', shares: '9.5M', status: 'Expected' },
  { date: 'Oct 15', company: 'Kaveri Solar (sample)', exchange: 'NSE', priceRange: '₹310 – ₹330', shares: '45M', status: 'Filed' },
];

export const CALENDAR_SAMPLE_NOTE = 'Sample data for preview. Figures are illustrative and not real market data.';

export const CALENDAR_FAQ: { q: string; a: string }[] = [
  {
    q: 'What is the MarketSyde Economic Calendar?',
    a: 'A schedule of economic events and data releases that can move currencies, gold, indices and crypto. Each row shows when the event happens, which currency it affects, how much volatility to expect, and the Actual, Forecast and Previous figures.',
  },
  {
    q: 'What do the star icons mean?',
    a: 'Stars show the expected market impact. One star (grey) is low, two (amber) is medium and three (red) is high. Three-star events like rate decisions and payrolls are the ones most likely to move prices sharply.',
  },
  {
    q: 'How do the Actual, Forecast and Previous columns work?',
    a: 'Forecast is the consensus estimate before the release. Previous is the last reported figure. Actual appears once the number is published. The gap between Actual and Forecast is what usually moves the market.',
  },
  {
    q: 'Why are Actual values green or red?',
    a: 'Green means the Actual came in above the Forecast and red means it came in below. That is only a comparison to the estimate. Whether it is good or bad for a currency depends on the indicator, so read the event summary before reacting.',
  },
  {
    q: 'Which indicators matter most?',
    a: 'Central bank rate decisions, Non-Farm Payrolls, CPI and Core CPI, GDP, and PMI surveys are the usual heavy hitters. Central bank speeches matter when the tone is different from recent guidance.',
  },
  {
    q: 'How can I filter and customize the calendar?',
    a: 'Use the date buttons for a quick range, or pick custom dates. Show Filters lets you narrow by importance, country and category. You can also search by event name and change the time zone the table is shown in.',
  },
  {
    q: 'How do alerts and the Watched Events list work?',
    a: 'Star an event to add it to Watched Events. Tap the bell on a row, or open the event, to set a reminder before it starts. Basic plans can keep a small number of reminders. Intermediate and above can create unlimited reminders.',
  },
  {
    q: 'What is the AI predicted reaction?',
    a: 'On supported events, the AI Assistant estimates how the market has tended to react to similar surprises. It is an estimate based on past behaviour, not a forecast or a guarantee. Always manage your risk.',
  },
];

export const EVENT_NOTES: EventNote[] = [
  {
    id: 'note_1',
    eventId: 'evt_20261009_2',
    advisorName: 'Sarah K.',
    advisorAvatar: '',
    text: 'If payrolls print soft again, I want everyone watching 1.0950 on EUR/USD, same level from Monday\u2019s class.',
  },
];

export const BROKER_EVENT_TAGS: BrokerEventTag[] = [
  {
    id: 'tag_1',
    eventId: 'evt_20261009_2',
    brokerName: 'HFM',
    message: 'Tight spreads on EUR/USD during NFP. Check your account tier.',
  },
];
