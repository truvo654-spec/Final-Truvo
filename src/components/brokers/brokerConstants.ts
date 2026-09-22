export interface AccountTypeSpec {
  name: string;
  spreadType: string;
  commission: string;
  minDeposit: string;
  minTradeVolume: string;
  maxLeverage: string;
  tradingPlatforms: string;
  baseCashbackRate: number;
  isHighestCashback?: boolean;
  recommendedFor?: 'tier-1' | 'tier-2' | 'offshore';
}

export const BROKER_ACCOUNT_SPECS: AccountTypeSpec[] = [
  {
    name: 'Bonus',
    spreadType: 'Wide',
    commission: 'None',
    minDeposit: '$10',
    minTradeVolume: '0.01 lot',
    maxLeverage: '1:1000',
    tradingPlatforms: 'MT4, MT5',
    baseCashbackRate: 5.0,
  },
  {
    name: 'Standard',
    spreadType: 'Standard',
    commission: 'None',
    minDeposit: '$10',
    minTradeVolume: '0.01 lot',
    maxLeverage: '1:1000',
    tradingPlatforms: 'MT4, MT5',
    baseCashbackRate: 6.0,
    recommendedFor: 'tier-1',
  },
  {
    name: 'Premium',
    spreadType: 'Tight',
    commission: 'None',
    minDeposit: '$50',
    minTradeVolume: '0.01 lot',
    maxLeverage: '1:500',
    tradingPlatforms: 'MT4, MT5',
    baseCashbackRate: 7.0,
  },
  {
    name: 'Pro',
    spreadType: 'Tighter',
    commission: 'None',
    minDeposit: '$100',
    minTradeVolume: '0.10 lot',
    maxLeverage: '1:500',
    tradingPlatforms: 'MT4, MT5',
    baseCashbackRate: 8.0,
    isHighestCashback: true,
    recommendedFor: 'tier-2',
  },
  {
    name: 'Zero (ECN)',
    spreadType: 'Raw 0.0–0.2',
    commission: '$3/lot/side',
    minDeposit: '$200',
    minTradeVolume: '0.10 lot',
    maxLeverage: '1:200',
    tradingPlatforms: 'MT4, MT5',
    baseCashbackRate: 2.0,
    recommendedFor: 'offshore',
  },
];

export const TIER_MULTIPLIERS: Record<string, number> = {
  Rookie: 1.0,
  Climber: 1.15,
  Pro: 1.25,
  Master: 1.35,
  Boss: 1.5,
};
