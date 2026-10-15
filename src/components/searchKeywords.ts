/**
 * What people actually type, mapped to what the app calls things.
 *
 * Search used to match letters, so "gold" found nothing because the row says
 * XAU/USD, and "เงินคืน" found nothing because the page is called Cashback.
 * Every entry here is a word a reader might reach for, pointing at the words
 * already on the row. Thai sits beside English because the floor uses both.
 */

/** A word the reader types, and the words it should also look for. */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // instruments
  gold: ['xau', 'xauusd', 'gold'],
  ทอง: ['xau', 'gold'],
  silver: ['xag', 'silver'],
  เงิน: ['xag', 'silver'],
  oil: ['usoil', 'wti', 'brent', 'crude', 'oil'],
  น้ำมัน: ['usoil', 'wti', 'oil', 'crude'],
  bitcoin: ['btc', 'bitcoin'],
  บิทคอยน์: ['btc', 'bitcoin'],
  ether: ['eth', 'ethereum'],
  ethereum: ['eth', 'ethereum'],
  crypto: ['btc', 'eth', 'sol', 'crypto', 'cryptocurrency'],
  คริปโต: ['crypto', 'btc', 'eth'],
  forex: ['fx', 'forex', 'currency', 'eur', 'gbp', 'usd', 'jpy'],
  ฟอเร็กซ์: ['forex', 'fx'],
  stocks: ['stock', 'equity', 'equities', 'shares'],
  หุ้น: ['stock', 'stocks', 'equity'],
  indices: ['index', 'indices', 'us500', 'nas100', 'ger40', 'sp500'],
  nasdaq: ['nas100', 'nasdaq'],
  sp500: ['us500', 's&p', 'sp500'],
  dax: ['ger40', 'dax'],

  // money coming back
  cashback: ['cashback', 'rebate', 'rebates'],
  rebate: ['cashback', 'rebate'],
  เงินคืน: ['cashback', 'rebate'],
  แคชแบ็ก: ['cashback', 'rebate'],
  commission: ['commission', 'spread', 'cost', 'fee'],
  ค่าธรรมเนียม: ['commission', 'spread', 'fee', 'cost'],
  spread: ['spread', 'pips', 'cost'],

  // rewards
  points: ['points', 'pts', 'level', 'tier'],
  แต้ม: ['points', 'pts'],
  credits: ['credits', 'syde credits'],
  เครดิต: ['credits'],
  level: ['level', 'tier', 'rookie', 'climber', 'player', 'boss'],
  เลเวล: ['level', 'tier'],
  ระดับ: ['level', 'tier'],
  mission: ['mission', 'quest', 'task'],
  ภารกิจ: ['mission', 'quest'],
  reward: ['reward', 'bonus', 'points', 'credits'],
  รางวัล: ['reward', 'bonus'],
  bonus: ['bonus', 'promotion', 'offer', 'deposit'],
  โบนัส: ['bonus', 'promotion'],
  promo: ['promotion', 'promo', 'offer', 'deal'],
  โปร: ['promotion', 'promo', 'offer'],
  โปรโมชั่น: ['promotion', 'promo', 'offer'],

  // trading surfaces
  signal: ['signal', 'call', 'setup', 'trade idea'],
  สัญญาณ: ['signal', 'call'],
  chart: ['chart', 'analysis', 'instrument', 'technical'],
  กราฟ: ['chart', 'analysis'],
  journal: ['journal', 'diary', 'log', 'entries', 'trades'],
  บันทึก: ['journal', 'log'],
  backtest: ['backtest', 'replay', 'what-if', 'test'],
  ทดสอบ: ['backtest', 'test', 'replay'],
  playbook: ['playbook', 'strategy', 'rules', 'setup'],
  กลยุทธ์: ['strategy', 'playbook'],
  strategy: ['strategy', 'playbook', 'backtest'],
  portfolio: ['portfolio', 'equity', 'accounts', 'positions'],
  พอร์ต: ['portfolio', 'equity', 'positions'],
  alert: ['alert', 'notification', 'reminder', 'price alert'],
  แจ้งเตือน: ['alert', 'notification'],
  calculator: ['calculator', 'leverage', 'margin', 'position size', 'lot'],
  คำนวณ: ['calculator', 'leverage', 'margin'],
  leverage: ['leverage', 'margin', 'calculator'],
  calendar: ['calendar', 'economic', 'events', 'release'],
  ปฏิทิน: ['calendar', 'economic'],
  ข่าว: ['news', 'market update', 'research'],
  news: ['news', 'headline', 'market update', 'research'],

  // people and learning
  broker: ['broker', 'brokers', 'exness', 'hfm', 'fxpro', 'pepperstone', 'xm'],
  โบรก: ['broker', 'brokers'],
  โบรกเกอร์: ['broker', 'brokers'],
  course: ['course', 'lesson', 'education', 'learn', 'academy'],
  คอร์ส: ['course', 'lesson', 'education'],
  เรียน: ['course', 'education', 'learn', 'lesson'],
  community: ['community', 'forum', 'post', 'article', 'floor'],
  ชุมชน: ['community', 'forum', 'post'],
  advisor: ['advisor', 'ea', 'expert advisor', 'bot', 'robot'],
  บอท: ['bot', 'ea', 'expert advisor', 'advisor'],
  ea: ['ea', 'expert advisor', 'bot'],
  leaderboard: ['leaderboard', 'ranking', 'rank', 'standings'],
  อันดับ: ['leaderboard', 'ranking', 'rank'],

  // account
  account: ['account', 'profile', 'settings'],
  บัญชี: ['account', 'profile'],
  profile: ['profile', 'account', 'settings'],
  setting: ['settings', 'preferences', 'profile'],
  ตั้งค่า: ['settings', 'preferences'],
  withdraw: ['withdraw', 'withdrawal', 'payout'],
  ถอน: ['withdraw', 'withdrawal', 'payout'],
  deposit: ['deposit', 'fund', 'top up'],
  ฝาก: ['deposit', 'fund'],
};

/** The same table with every key normalised, which is how a typed query arrives. */
const SYNONYMS_NFC: Record<string, string[]> = Object.fromEntries(
  Object.entries(SEARCH_SYNONYMS).map(([k, v]) => [k.normalize('NFC').toLowerCase(), v]),
);

/**
 * The words a query should be matched on: what was typed, plus anything that
 * means the same. Each term is matched on its own, so "gold signal" asks for
 * a row that satisfies both.
 */
export function expandQuery(query: string): string[][] {
  // Thai can arrive in a different but equivalent code-point order, so both
  // sides of every comparison are normalised before they are matched.
  return query
    .normalize('NFC')
    .toLowerCase()
    .split(/[\s,]+/)
    // \p{M} keeps Thai vowels and tone marks, which are marks rather than letters;
    // without it แต้ม became แตม and matched nothing.
    .map((t) => t.replace(/[^\p{L}\p{N}\p{M}&/.-]/gu, ''))
    .filter(Boolean)
    .map((term) => {
      const hit = SYNONYMS_NFC[term];
      if (hit) return Array.from(new Set([term, ...hit]));
      // A longer word can still carry a known one inside it, as "cashbacks" does.
      const loose = Object.keys(SYNONYMS_NFC).filter((k) => k.length > 3 && term.includes(k));
      return loose.length ? Array.from(new Set([term, ...loose.flatMap((k) => SYNONYMS_NFC[k])])) : [term];
    });
}
