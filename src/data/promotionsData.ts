export type PromoAsset = 'Forex' | 'Crypto' | 'Stocks' | 'Commodity' | 'Indices';
export type PromoKind = 'Deposit bonus' | 'Cashback boost' | 'Spread discount' | 'Fee waiver' | 'Competition' | 'Premium drop';

export interface Promotion {
  id: string;
  brokerId: string;
  brokerName: string;
  title: string;
  kind: PromoKind;
  summary: string;
  value: string;
  assets: PromoAsset[];
  accountTypes: string[];
  /** 0 = every plan, 1 = Intermediate and up, 2 = Premium only */
  minPlan: 0 | 1 | 2;
  premiumDrop: boolean;
  requiresConnected: boolean;
  minDeposit: number;
  endsInDays: number;
  addedDaysAgo: number;
  terms: string[];
}

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo_hfm_match', brokerId: 'hfm', brokerName: 'HFM', title: '20% deposit match', kind: 'Deposit bonus',
    summary: 'A 20% credit on your next deposit, usable as margin. Withdrawing profits is allowed once the lot requirement is met.',
    value: 'Up to $500', assets: ['Forex', 'Commodity'], accountTypes: ['Standard', 'Premium'], minPlan: 0, premiumDrop: false,
    requiresConnected: false, minDeposit: 100, endsInDays: 12, addedDaysAgo: 3,
    terms: ['Minimum deposit $100.', 'Credit cannot be withdrawn, profits can after 1 lot per $30 of credit.', 'One claim per client.'],
  },
  {
    id: 'promo_exness_spread', brokerId: 'exness', brokerName: 'Exness', title: 'Zero commission on majors', kind: 'Spread discount',
    summary: 'No commission on EUR/USD, GBP/USD and USD/JPY for connected Raw Spread accounts.',
    value: 'Save about $3.50 / lot', assets: ['Forex'], accountTypes: ['Raw Spread'], minPlan: 0, premiumDrop: false,
    requiresConnected: true, minDeposit: 0, endsInDays: 6, addedDaysAgo: 1,
    terms: ['Raw Spread accounts only.', 'Applies to the three listed pairs.', 'Account must be connected to MarketSyde.'],
  },
  {
    id: 'promo_xm_comp', brokerId: 'xm', brokerName: 'XM', title: 'Monthly trading competition', kind: 'Competition',
    summary: 'Compete on percentage return across a demo or live account. Top 10 share the prize pool.',
    value: '$10,000 prize pool', assets: ['Forex', 'Indices', 'Commodity', 'Crypto'], accountTypes: ['Any'], minPlan: 0, premiumDrop: false,
    requiresConnected: false, minDeposit: 0, endsInDays: 25, addedDaysAgo: 5,
    terms: ['Free to enter.', 'Ranked by percentage return, minimum 10 closed trades.', 'Prizes are paid in trading credit.'],
  },
  {
    id: 'promo_ic_rebate', brokerId: 'ic-markets', brokerName: 'IC Markets', title: 'Rebate boost on Raw Spread', kind: 'Cashback boost',
    summary: 'An extra $1.50 per lot of MarketSyde cashback on top of your tier rate for the next three weeks.',
    value: '+$1.50 / lot', assets: ['Forex', 'Indices'], accountTypes: ['Raw Spread'], minPlan: 1, premiumDrop: false,
    requiresConnected: true, minDeposit: 0, endsInDays: 18, addedDaysAgo: 2,
    terms: ['Intermediate plan or higher.', 'Account must be connected.', 'Boost applies to eligible lots traded during the promotion.'],
  },
  {
    id: 'promo_pepper_crypto', brokerId: 'pepperstone', brokerName: 'Pepperstone', title: 'Crypto CFD fee waiver', kind: 'Fee waiver',
    summary: 'Overnight financing waived on the first five crypto CFD positions held this month.',
    value: 'Waived financing', assets: ['Crypto'], accountTypes: ['Standard', 'Razor'], minPlan: 0, premiumDrop: false,
    requiresConnected: false, minDeposit: 0, endsInDays: 9, addedDaysAgo: 4,
    terms: ['Five positions per client.', 'Standard and Razor accounts.', 'Crypto CFDs carry high risk and can move fast.'],
  },
  {
    id: 'promo_fxpro_gold', brokerId: 'fxpro', brokerName: 'FxPro', title: 'Reduced swap on gold', kind: 'Premium drop',
    summary: 'Members-only: 50% lower swap on XAU/USD long positions for the next two weeks.',
    value: '50% lower swap', assets: ['Commodity'], accountTypes: ['Elite', 'Raw+'], minPlan: 2, premiumDrop: true,
    requiresConnected: true, minDeposit: 0, endsInDays: 14, addedDaysAgo: 0,
    terms: ['Premium plan only.', 'Connected account required.', 'Applies to positions opened during the promotion.'],
  },
  {
    id: 'promo_axi_new', brokerId: 'axi', brokerName: 'Axi', title: 'New-account cashback boost', kind: 'Cashback boost',
    summary: 'Open a new Axi account through MarketSyde and get 20% more cashback for your first 30 days.',
    value: '+20% cashback', assets: ['Forex', 'Commodity'], accountTypes: ['Pro'], minPlan: 0, premiumDrop: false,
    requiresConnected: false, minDeposit: 50, endsInDays: 30, addedDaysAgo: 6,
    terms: ['New Axi clients only.', 'Minimum deposit $50.', 'Boost lasts 30 days from account approval.'],
  },
  {
    id: 'promo_vt_stocks', brokerId: 'vt-markets', brokerName: 'VT Markets', title: 'Stock CFD commission rebate', kind: 'Fee waiver',
    summary: 'Commission rebated on US stock CFDs up to a monthly cap.',
    value: 'Up to $120 back', assets: ['Stocks'], accountTypes: ['RAW ECN'], minPlan: 1, premiumDrop: false,
    requiresConnected: true, minDeposit: 0, endsInDays: 21, addedDaysAgo: 7,
    terms: ['Intermediate plan or higher.', 'Monthly cap of $120.', 'RAW ECN accounts only.'],
  },
  {
    id: 'promo_ava_priority', brokerId: 'avatrade', brokerName: 'AvaTrade', title: 'Priority withdrawals plus $50 credit', kind: 'Premium drop',
    summary: 'Members-only: jump the withdrawal queue for 30 days and receive $50 trading credit on first funding.',
    value: '$50 credit', assets: ['Forex', 'Indices', 'Commodity'], accountTypes: ['Retail'], minPlan: 2, premiumDrop: true,
    requiresConnected: false, minDeposit: 200, endsInDays: 10, addedDaysAgo: 1,
    terms: ['Premium plan only.', 'Minimum first deposit $200.', 'Credit is non-withdrawable.'],
  },
  {
    id: 'promo_hfm_raw', brokerId: 'hfm', brokerName: 'HFM', title: 'Raw spread upgrade for 30 days', kind: 'Premium drop',
    summary: 'Members-only: trade Premium accounts on Zero-account spreads for a month.',
    value: 'Spreads from 0.0 pips', assets: ['Forex'], accountTypes: ['Premium'], minPlan: 2, premiumDrop: true,
    requiresConnected: true, minDeposit: 0, endsInDays: 8, addedDaysAgo: 0,
    terms: ['Premium plan only.', 'Connected HFM Premium account.', 'Commission still applies.'],
  },
];
