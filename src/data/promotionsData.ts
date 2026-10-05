export type PromoType = 'cashback' | 'deposit' | 'spread' | 'fee' | 'contest';
export type PromoSource = 'broker' | 'platform';
export type PromoLevel = 1 | 2 | 3 | 4;

/** Level names match the member levels used across the app. */
export const PROMO_LEVELS: Record<PromoLevel, string> = { 1: 'Rookie', 2: 'Climber', 3: 'Player', 4: 'Boss' };

export const PROMO_TYPES: { id: PromoType; label: string; hint: string }[] = [
  { id: 'cashback', label: 'Cashback', hint: 'Extra rebate on lots you trade' },
  { id: 'deposit', label: 'Deposit bonus', hint: 'Credit or match on funding' },
  { id: 'spread', label: 'Lower spreads', hint: 'Tighter spreads or no commission' },
  { id: 'fee', label: 'Fee waivers', hint: 'Swap, financing or commission relief' },
  { id: 'contest', label: 'Competitions', hint: 'Compete for a prize pool' },
];

export interface Promotion {
  id: string;
  /** broker = an offer the broker gives. platform = a MarketSyde promotion. */
  source: PromoSource;
  type: PromoType;
  brokerId: string;
  brokerName: string;
  title: string;
  /** Short label printed on the banner. */
  kind: string;
  summary: string;
  /** Big number on the banner. */
  value: string;
  valueNote: string;
  accountTypes: string[];
  /** Lowest member level that can see and take this offer. */
  minLevel: PromoLevel;
  /** A broker offer reserved for higher levels. */
  premiumDrop: boolean;
  requiresConnected: boolean;
  minDeposit: number;
  /** 0 = live now. Above 0 = starts in this many days. */
  startsInDays: number;
  /** Days from today until it ends. */
  endsInDays: number;
  addedDaysAgo: number;
  terms: string[];
}

type Base = Omit<Promotion, 'source' | 'brokerId' | 'brokerName' | 'premiumDrop' | 'requiresConnected' | 'minDeposit' | 'startsInDays' | 'addedDaysAgo' | 'accountTypes' | 'terms'> &
  Partial<Pick<Promotion, 'source' | 'brokerId' | 'brokerName' | 'premiumDrop' | 'requiresConnected' | 'minDeposit' | 'startsInDays' | 'addedDaysAgo' | 'accountTypes' | 'terms'>>;

const b = (brokerId: string, brokerName: string) => ({ source: 'broker' as const, brokerId, brokerName });
const platform = { source: 'platform' as const, brokerId: 'marketsyde', brokerName: 'MarketSyde' };

const make = (x: Base): Promotion => ({
  source: 'broker', brokerId: '', brokerName: '', premiumDrop: false, requiresConnected: false, minDeposit: 0,
  startsInDays: 0, addedDaysAgo: 2, accountTypes: ['Any'], terms: ['Read the full terms on the provider’s site.'], ...x,
});

export const PROMOTIONS: Promotion[] = [
  /* ───── Broker offers: live ───── */
  make({ ...b('hfm', 'HFM'), id: 'promo_hfm_match', type: 'deposit', title: '20% deposit match', kind: 'Deposit bonus', summary: 'A 20% credit on your next deposit, usable as margin. Profits can be withdrawn once the lot requirement is met.', value: '20% match', valueNote: 'up to $500', accountTypes: ['Standard', 'Premium'], minLevel: 1, minDeposit: 100, endsInDays: 12, addedDaysAgo: 3, terms: ['Minimum deposit $100.', 'Credit cannot be withdrawn, profits can after 1 lot per $30 of credit.', 'One claim per client.'] }),
  make({ ...b('exness', 'Exness'), id: 'promo_exness_spread', type: 'spread', title: 'Zero commission on majors', kind: 'Spread discount', summary: 'No commission on EUR/USD, GBP/USD and USD/JPY for connected Raw Spread accounts.', value: '$0 commission', valueNote: 'on 3 major pairs', accountTypes: ['Raw Spread'], minLevel: 1, requiresConnected: true, endsInDays: 6, addedDaysAgo: 1, terms: ['Raw Spread accounts only.', 'Applies to the three listed pairs.', 'Account must be connected to MarketSyde.'] }),
  make({ ...b('xm', 'XM'), id: 'promo_xm_comp', type: 'contest', title: 'Monthly trading competition', kind: 'Competition', summary: 'Compete on percentage return across a demo or live account. The top 10 share the prize pool.', value: '$10,000', valueNote: 'prize pool', accountTypes: ['Any'], minLevel: 1, endsInDays: 25, addedDaysAgo: 5, terms: ['Free to enter.', 'Ranked by percentage return, minimum 10 closed trades.', 'Prizes are paid in trading credit.'] }),
  make({ ...b('pepperstone', 'Pepperstone'), id: 'promo_pepper_crypto', type: 'fee', title: 'Crypto CFD fee waiver', kind: 'Fee waiver', summary: 'Overnight financing waived on the first five crypto CFD positions held this month.', value: 'Waived financing', valueNote: 'first 5 crypto CFDs', accountTypes: ['Standard', 'Razor'], minLevel: 1, endsInDays: 9, addedDaysAgo: 4, terms: ['Five positions per client.', 'Standard and Razor accounts.', 'Crypto CFDs carry high risk and can move fast.'] }),
  make({ ...b('axi', 'Axi'), id: 'promo_axi_new', type: 'cashback', title: 'New-account cashback boost', kind: 'Cashback boost', summary: 'Open a new Axi account through MarketSyde and get 20% more cashback for your first 30 days.', value: '+20% cashback', valueNote: 'first 30 days', accountTypes: ['Pro'], minLevel: 1, minDeposit: 50, endsInDays: 30, addedDaysAgo: 6, terms: ['New Axi clients only.', 'Minimum deposit $50.', 'Boost lasts 30 days from account approval.'] }),
  make({ ...b('ic-markets', 'IC Markets'), id: 'promo_ic_rebate', type: 'cashback', title: 'Rebate boost on Raw Spread', kind: 'Cashback boost', summary: 'An extra $1.50 per lot of MarketSyde cashback on top of your level rate for the next three weeks.', value: '+$1.50 / lot', valueNote: 'extra cashback', accountTypes: ['Raw Spread'], minLevel: 2, requiresConnected: true, endsInDays: 18, addedDaysAgo: 2, terms: ['Level 2 or higher.', 'Account must be connected.', 'Applies to eligible lots traded during the promotion.'] }),
  make({ ...b('vt-markets', 'VT Markets'), id: 'promo_vt_stocks', type: 'fee', title: 'Stock CFD commission rebate', kind: 'Fee waiver', summary: 'Commission rebated on US stock CFDs up to a monthly cap.', value: 'Up to $120', valueNote: 'back each month', accountTypes: ['RAW ECN'], minLevel: 3, requiresConnected: true, endsInDays: 21, addedDaysAgo: 7, terms: ['Level 3 or higher.', 'Monthly cap of $120.', 'RAW ECN accounts only.'] }),

  /* ───── Broker offers: upcoming ───── */
  make({ ...b('exness', 'Exness'), id: 'promo_exn_autumn', type: 'cashback', title: 'Autumn rebate boost', kind: 'Cashback boost', summary: 'A seasonal rebate boost on all Standard and Pro accounts, starting soon.', value: '+$1 / lot', valueNote: 'extra cashback', accountTypes: ['Standard', 'Pro'], minLevel: 1, startsInDays: 5, endsInDays: 19, addedDaysAgo: 0, terms: ['Starts on the date shown.', 'Applies to lots opened after the start.'] }),
  make({ ...b('ic-markets', 'IC Markets'), id: 'promo_ic_gold', type: 'spread', title: 'Tighter gold spreads', kind: 'Spread discount', summary: 'Reduced spreads on XAU/USD during London and New York sessions.', value: 'From 0.2', valueNote: 'on XAU/USD', accountTypes: ['Raw Spread'], minLevel: 1, startsInDays: 9, endsInDays: 39, addedDaysAgo: 0, terms: ['Raw Spread accounts.', 'London and New York sessions only.'] }),
  make({ ...b('xm', 'XM'), id: 'promo_xm_dep', type: 'deposit', title: 'Year-end deposit match', kind: 'Deposit bonus', summary: 'A 25% credit on deposits made during the last six weeks of the year.', value: '25% match', valueNote: 'up to $750', accountTypes: ['Standard'], minLevel: 2, minDeposit: 150, startsInDays: 14, endsInDays: 56, addedDaysAgo: 0, terms: ['Level 2 or higher.', 'Minimum deposit $150.'] }),

  /* ───── Premium drops (broker offers by level): live ───── */
  make({ ...b('pepperstone', 'Pepperstone'), id: 'drop_pepper_welcome', type: 'fee', premiumDrop: true, title: 'First 3 trades commission-free', kind: 'Premium drop', summary: 'A welcome drop for every member: your first three trades on a Razor account carry no commission.', value: '$0 commission', valueNote: 'first 3 trades', accountTypes: ['Razor'], minLevel: 1, endsInDays: 14, addedDaysAgo: 0, terms: ['Razor accounts only.', 'Applies to your first three trades after joining.'] }),
  make({ ...b('exness', 'Exness'), id: 'drop_exness_swap', type: 'fee', premiumDrop: true, title: 'Swap-free week on gold', kind: 'Premium drop', summary: 'No swap on XAU/USD positions held this week on connected accounts.', value: 'Swap-free', valueNote: 'XAU/USD · 7 days', accountTypes: ['Pro', 'Raw Spread'], minLevel: 2, requiresConnected: true, endsInDays: 7, addedDaysAgo: 0, terms: ['Level 2 or higher.', 'Connected account required.'] }),
  make({ ...b('fxpro', 'FxPro'), id: 'promo_fxpro_gold', type: 'fee', premiumDrop: true, title: 'Reduced swap on gold', kind: 'Premium drop', summary: '50% lower swap on XAU/USD long positions for the next two weeks.', value: '50% lower', valueNote: 'swap on gold', accountTypes: ['Elite', 'Raw+'], minLevel: 3, requiresConnected: true, endsInDays: 14, addedDaysAgo: 0, terms: ['Level 3 or higher.', 'Connected account required.', 'Applies to positions opened during the promotion.'] }),
  make({ ...b('avatrade', 'AvaTrade'), id: 'promo_ava_priority', type: 'deposit', premiumDrop: true, title: 'Priority withdrawals plus $50 credit', kind: 'Premium drop', summary: 'Jump the withdrawal queue for 30 days and receive $50 trading credit on first funding.', value: '$50 credit', valueNote: 'plus priority withdrawals', accountTypes: ['Retail'], minLevel: 4, minDeposit: 200, endsInDays: 10, addedDaysAgo: 1, terms: ['Level 4 only.', 'Minimum first deposit $200.', 'Credit is non-withdrawable.'] }),
  make({ ...b('hfm', 'HFM'), id: 'promo_hfm_raw', type: 'spread', premiumDrop: true, title: 'Raw spread upgrade for 30 days', kind: 'Premium drop', summary: 'Trade Premium accounts on Zero-account spreads for a month.', value: 'From 0.0 pips', valueNote: 'for 30 days', accountTypes: ['Premium'], minLevel: 4, requiresConnected: true, endsInDays: 8, addedDaysAgo: 0, terms: ['Level 4 only.', 'Connected HFM Premium account.', 'Commission still applies.'] }),

  /* ───── Premium drops: upcoming ───── */
  make({ ...b('exness', 'Exness'), id: 'drop_exness_vip', type: 'cashback', premiumDrop: true, title: 'VIP rebate window', kind: 'Premium drop', summary: 'A short rebate window with a higher per-lot rate for members at Level 2 and above.', value: '+$2 / lot', valueNote: '5-day window', accountTypes: ['Pro'], minLevel: 2, startsInDays: 7, endsInDays: 12, addedDaysAgo: 0, terms: ['Level 2 or higher.', 'Starts on the date shown.'] }),
  make({ ...b('axi', 'Axi'), id: 'drop_axi_vip', type: 'deposit', premiumDrop: true, title: 'VIP funding credit', kind: 'Premium drop', summary: 'A trading credit on your next funding for members at Level 3 and above.', value: '$100 credit', valueNote: 'on funding', accountTypes: ['Pro'], minLevel: 3, minDeposit: 500, startsInDays: 10, endsInDays: 24, addedDaysAgo: 0, terms: ['Level 3 or higher.', 'Minimum funding $500.'] }),
  make({ ...b('ic-markets', 'IC Markets'), id: 'drop_ic_boss', type: 'spread', premiumDrop: true, title: 'Boss ECN access', kind: 'Premium drop', summary: 'Access to the institutional ECN pricing tier for Level 4 members.', value: 'Raw ECN', valueNote: 'institutional pricing', accountTypes: ['Raw Spread'], minLevel: 4, startsInDays: 16, endsInDays: 46, addedDaysAgo: 0, terms: ['Level 4 only.', 'Subject to broker approval.'] }),

  /* ───── MarketSyde promotions (My offers): live ───── */
  make({ ...platform, id: 'pl_double', type: 'cashback', title: 'Double cashback weekend', kind: 'Cashback boost', summary: 'Every lot you trade through a connected broker this weekend earns twice the cashback.', value: '2× cashback', valueNote: 'this weekend', minLevel: 1, endsInDays: 3, addedDaysAgo: 0, terms: ['Connected broker accounts.', 'Applies to eligible lots only.', 'Normal cashback validation rules apply.'] }),
  make({ ...platform, id: 'pl_first', type: 'cashback', title: 'First connected trade bonus', kind: 'Mission reward', summary: 'Connect a broker and place your first eligible trade. We add the bonus to your cashback balance.', value: '+$5', valueNote: 'cashback', minLevel: 1, endsInDays: 60, addedDaysAgo: 8, terms: ['One per member.', 'Counts after broker validation.'] }),
  make({ ...platform, id: 'pl_refer', type: 'cashback', title: 'Refer a trader', kind: 'Referral', summary: 'When a friend connects a broker and trades, you both get cashback.', value: '$10', valueNote: 'per friend', minLevel: 1, endsInDays: 90, addedDaysAgo: 12, terms: ['Friend must be new to MarketSyde.', 'Paid after their first validated trade.'] }),
  make({ ...platform, id: 'pl_weekly', type: 'contest', title: 'Weekly lot challenge', kind: 'Competition', summary: 'Trade the most eligible lots this week and climb the board. Top 20 win credits.', value: '500 credits', valueNote: 'for the top 20', minLevel: 1, endsInDays: 4, addedDaysAgo: 3, terms: ['Eligible lots only.', 'Credits land within 48 hours of the end.'] }),
  make({ ...platform, id: 'pl_withdraw', type: 'fee', title: 'Zero withdrawal fees', kind: 'Level perk', summary: 'Withdraw your cashback with no fees while you are at Level 2 or higher.', value: '$0 fees', valueNote: 'on withdrawals', minLevel: 2, endsInDays: 40, addedDaysAgo: 5, terms: ['Level 2 or higher.', 'Bank or wallet fees from third parties may still apply.'] }),
  make({ ...platform, id: 'pl_player', type: 'cashback', title: 'Player cashback boost', kind: 'Level perk', summary: 'A higher cashback rate on every connected broker while you stay at Level 3.', value: '+15%', valueNote: 'cashback rate', minLevel: 3, endsInDays: 30, addedDaysAgo: 4, terms: ['Level 3 or higher.', 'Rate returns to normal if your level drops.'] }),

  /* ───── MarketSyde promotions: upcoming ───── */
  make({ ...platform, id: 'pl_leader', type: 'contest', title: 'Monthly leaderboard', kind: 'Competition', summary: 'A month-long contribution and growth board. Ranked on growth and quality, not on profit.', value: '$1,000', valueNote: 'prize pool', minLevel: 1, startsInDays: 6, endsInDays: 36, addedDaysAgo: 0, terms: ['Starts on the date shown.', 'Ranked on contribution and growth.'] }),
  make({ ...platform, id: 'pl_boss', type: 'cashback', title: 'Boss cashback day', kind: 'Level perk', summary: 'One day a month where Level 4 members earn triple cashback.', value: '3× cashback', valueNote: 'one day', minLevel: 4, startsInDays: 12, endsInDays: 13, addedDaysAgo: 0, terms: ['Level 4 only.', 'Date announced one week ahead.'] }),
];
