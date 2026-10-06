import { NewsArticle } from '../types';
import {
  SOURCE_REUTERS,
  SOURCE_DOWJONES,
  SOURCE_BLOOMBERG,
  SOURCE_ACUITY,
  THUMB_USD,
  THUMB_GOLD,
  THUMB_BANKS,
  THUMB_EUR,
  THUMB_ETH,
  THUMB_SPX,
} from './newsImagePlaceholders';

/**
 * Sample stories that "arrive" after a member turns on notifications for a writer.
 * There is no live newsroom feed in this preview. These stand in for it so the follow,
 * notify and Market News notification flow can be seen end to end.
 */
const a = (x: Omit<NewsArticle, 'tags' | 'claps' | 'commentsCount' | 'readTime' | 'timestamp'> & Partial<NewsArticle>): NewsArticle => ({
  tags: [x.assetClass],
  claps: 0,
  commentsCount: 0,
  readTime: '2 min read',
  timestamp: 'Just now',
  ...x,
});

export const NEWS_INCOMING: NewsArticle[] = [
  a({ id: 'news_new_reuters_1', source: 'Reuters', sourceAvatar: SOURCE_REUTERS, assetClass: 'Forex', tags: ['Forex', 'EUR', 'Central Banks'], headline: 'Euro edges up as ECB officials signal patience on cuts', excerpt: 'Two policymakers said the bank can wait for more wage data before easing again, nudging the euro higher against the dollar.', content: ['The euro rose 0.3% after two ECB policymakers said there is no rush to cut rates again, pointing to sticky services inflation.', 'Traders trimmed bets on a December move. The next inflation flash estimate is now the main event for the pair.'], thumbnail: THUMB_EUR, heroImage: THUMB_EUR, sentiment: 'Bullish', minTier: 'public' }),
  a({ id: 'news_new_reuters_2', source: 'Reuters', sourceAvatar: SOURCE_REUTERS, assetClass: 'Indices', tags: ['Indices', 'Stocks'], headline: 'Wall Street futures flat ahead of bank earnings', excerpt: 'Index futures barely moved as investors waited for results from the largest US lenders.', content: ['Futures tied to the S&P 500 were little changed in early trading as investors held off before the first big bank results of the quarter.', 'Analysts expect net interest income to stay under pressure, with guidance on loan growth in focus.'], thumbnail: THUMB_SPX, heroImage: THUMB_SPX, sentiment: 'Neutral', minTier: 'public' }),
  a({ id: 'news_new_dj_1', source: 'Dow Jones', sourceAvatar: SOURCE_DOWJONES, assetClass: 'Commodity', tags: ['Commodities', 'Gold'], headline: 'Gold steadies after a three-day climb as dollar firms', excerpt: 'Bullion paused near recent highs while a firmer dollar capped further gains.', content: ['Spot gold held in a tight range after three sessions of gains, as a slightly stronger dollar offset demand for safe havens.', 'Traders are watching Treasury yields and the next inflation print for direction.'], thumbnail: THUMB_GOLD, heroImage: THUMB_GOLD, sentiment: 'Neutral', minTier: 'public' }),
  a({ id: 'news_new_dj_2', source: 'Dow Jones', sourceAvatar: SOURCE_DOWJONES, assetClass: 'Stocks', tags: ['Stocks', 'Banks'], headline: 'Regional banks rally on easing funding costs', excerpt: 'Smaller lenders led the gains as deposit costs showed early signs of stabilising.', content: ['Shares of regional banks rose after several lenders reported steadier deposit costs, easing worries about margins.', 'Investors will look for confirmation in next week’s earnings from the larger names.'], thumbnail: THUMB_BANKS, heroImage: THUMB_BANKS, sentiment: 'Bullish', minTier: 'public' }),
  a({ id: 'news_new_bbg_1', source: 'Bloomberg', sourceAvatar: SOURCE_BLOOMBERG, assetClass: 'Forex', tags: ['Forex', 'USD'], headline: 'Dollar index slips to a fresh low on softer retail sales', excerpt: 'A weaker retail sales print added to bets that the Fed has room to ease.', content: ['The dollar index fell to its lowest in two months after retail sales missed forecasts, extending a slide that began with last week’s jobs data.', 'Options markets show demand for dollar downside protection rising into the next Fed meeting.'], thumbnail: THUMB_USD, heroImage: THUMB_USD, sentiment: 'Bearish', minTier: 'public' }),
  a({ id: 'news_new_bbg_2', source: 'Bloomberg', sourceAvatar: SOURCE_BLOOMBERG, assetClass: 'Crypto', tags: ['Crypto', 'ETH'], headline: 'Ether funding rates turn positive for the first time this month', excerpt: 'Derivatives data suggests traders are leaning long again after a quiet stretch.', content: ['Funding rates on major ether perpetual contracts turned positive, a sign long positions are paying a premium to stay open.', 'Open interest has also ticked up, though spot volumes remain below the monthly average.'], thumbnail: THUMB_ETH, heroImage: THUMB_ETH, sentiment: 'Bullish', minTier: 'public' }),
  a({ id: 'news_new_acuity_1', source: 'Acuity', sourceAvatar: SOURCE_ACUITY, assetClass: 'Forex', tags: ['Forex', 'GBP'], headline: 'Sterling steady as UK inflation data comes in line', excerpt: 'The pound held its range after consumer prices matched expectations.', content: ['UK consumer price inflation matched forecasts, leaving the pound largely unchanged against the dollar and euro.', 'The data keeps a Bank of England cut in play but does not change the timing for most desks.'], thumbnail: THUMB_USD, heroImage: THUMB_USD, sentiment: 'Neutral', minTier: 'public' }),
  a({ id: 'news_new_acuity_2', source: 'Acuity', sourceAvatar: SOURCE_ACUITY, assetClass: 'Indices', tags: ['Indices'], headline: 'Nikkei climbs as yen weakness lifts exporters', excerpt: 'Japanese exporters led the index higher after the yen slid against the dollar.', content: ['The Nikkei 225 rose as a weaker yen boosted the outlook for exporters, with autos and machinery leading.', 'Traders remain cautious ahead of the next Bank of Japan meeting.'], thumbnail: THUMB_SPX, heroImage: THUMB_SPX, sentiment: 'Bullish', minTier: 'public' }),
];

export const findNewsById = (id: string) => NEWS_INCOMING.find((x) => x.id === id);
