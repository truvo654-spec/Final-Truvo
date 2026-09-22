import { UserProfile } from '../types';

export type LevelScenarioId = 'rookie' | 'climber' | 'player' | 'boss';

export interface LevelScenario {
  id: LevelScenarioId;
  level: number;
  label: string;
  rankTitle: string;
  points: number;
  maxPoints: number;
  nextThreshold: number;
  sydeCredits: number;
  boostPercentage: number;
  perks: string[];
  slotsSaved: number;
  slotsTotal: number;
  lotsTradedTotal: number;
  connectedBrokersCount: number;
  pendingPayout: number;
  totalCashbackEarned: number;
  activeStreakDays: number;
  description: string;
  tagColor: string;
}

export const LEVEL_SCENARIOS: LevelScenario[] = [
  {
    id: 'rookie',
    level: 1,
    label: 'Rookie',
    rankTitle: 'Rookie',
    points: 50,
    maxPoints: 100,
    nextThreshold: 100,
    sydeCredits: 150,
    boostPercentage: 0,
    perks: ['Standard Cashback Rate', '70% - 74% Signal Confidence', 'Broker Comparisons', 'Table Analysis'],
    slotsSaved: 2,
    slotsTotal: 5,
    lotsTradedTotal: 142.8,
    connectedBrokersCount: 4,
    pendingPayout: 380.00,
    totalCashbackEarned: 1428.50,
    activeStreakDays: 14,
    description: 'Level 1: What you have now - Trading tools, Standard cashback rate',
    tagColor: '#0B1C30',
  },
  {
    id: 'climber',
    level: 2,
    label: 'Climber',
    rankTitle: 'Climber',
    points: 120,
    maxPoints: 250,
    nextThreshold: 250,
    sydeCredits: 480,
    boostPercentage: 5,
    perks: ['+5% Cashback Boost', '75% - 79% Signal Confidence', 'Better Broker Offers', 'Heatmap & Screener'],
    slotsSaved: 6,
    slotsTotal: 10,
    lotsTradedTotal: 385.2,
    connectedBrokersCount: 6,
    pendingPayout: 850.00,
    totalCashbackEarned: 4250.00,
    activeStreakDays: 28,
    description: 'Level 2: What you get - +5% Cashback boost, 75-79% Signals, Better Broker Offers',
    tagColor: '#FD02B0',
  },
  {
    id: 'player',
    level: 3,
    label: 'Player',
    rankTitle: 'Player',
    points: 280,
    maxPoints: 500,
    nextThreshold: 500,
    sydeCredits: 1450,
    boostPercentage: 10,
    perks: ['+10% Cashback Boost', '80% - 89% Signal Confidence', 'Premium Promotions', 'Scatter & Correlation Unlocked'],
    slotsSaved: 14,
    slotsTotal: 20,
    lotsTradedTotal: 1120.5,
    connectedBrokersCount: 8,
    pendingPayout: 2100.00,
    totalCashbackEarned: 12800.00,
    activeStreakDays: 64,
    description: 'Level 3: What you get - +10% Cashback boost, 80-89% Signals, Premium Promotions',
    tagColor: '#CAEB0E',
  },
  {
    id: 'boss',
    level: 4,
    label: 'Boss',
    rankTitle: 'Boss',
    points: 1000,
    maxPoints: 1000,
    nextThreshold: 1000,
    sydeCredits: 4800,
    boostPercentage: 15,
    perks: ['+15% Cashback Boost', '90%+ Confidence Signals Full Access', 'Exclusive Member Only Benefits', 'VIP Concierge'],
    slotsSaved: 35,
    slotsTotal: 50,
    lotsTradedTotal: 4580.0,
    connectedBrokersCount: 12,
    pendingPayout: 6400.00,
    totalCashbackEarned: 48500.00,
    activeStreakDays: 180,
    description: 'Level 4: What you get - +15% Cashback boost, 90%+ Confidence Signals, Exclusive benefits',
    tagColor: '#5046E5',
  },
];

export function applyLevelScenarioToUser(user: UserProfile, scenarioId: LevelScenarioId): UserProfile {
  const scenario = LEVEL_SCENARIOS.find((s) => s.id === scenarioId) || LEVEL_SCENARIOS[0];
  return {
    ...user,
    tierLevel: scenario.level,
    rankTitle: scenario.rankTitle,
    currentPoints: scenario.points,
    maxPoints: scenario.maxPoints,
    boostPercentage: scenario.boostPercentage,
    sydeCredits: scenario.sydeCredits,
    perks: scenario.perks,
    slotsSaved: scenario.slotsSaved,
    slotsTotal: scenario.slotsTotal,
    lotsTradedTotal: scenario.lotsTradedTotal,
    connectedBrokersCount: scenario.connectedBrokersCount,
    pendingPayout: scenario.pendingPayout,
    totalCashbackEarned: scenario.totalCashbackEarned,
    activeStreakDays: scenario.activeStreakDays,
  };
}

/**
 * Derives tier, level, max points, perks and boost according to the system rules:
 * Level 1 = Rookie (0 - 99 pts, target: 100)
 * Level 2 = Climber (100 - 249 pts, target: 250)
 * Level 3 = Player (250 - 499 pts, target: 500)
 * Level 4 = Boss (500+ pts, target: 1000)
 */
export function getTierForPoints(points: number): {
  level: number;
  rankTitle: string;
  maxPoints: number;
  boostPercentage: number;
  perks: string[];
} {
  if (points >= 500) {
    return {
      level: 4,
      rankTitle: 'Boss',
      maxPoints: 1000,
      boostPercentage: 15,
      perks: ['+15% Cashback Boost', '90%+ Confidence Signals Full Access', 'Exclusive Member Only Benefits', 'VIP Concierge'],
    };
  } else if (points >= 250) {
    return {
      level: 3,
      rankTitle: 'Player',
      maxPoints: 500,
      boostPercentage: 10,
      perks: ['+10% Cashback Boost', '80% - 89% Signal Confidence', 'Premium Promotions', 'Scatter & Correlation Unlocked'],
    };
  } else if (points >= 100) {
    return {
      level: 2,
      rankTitle: 'Climber',
      maxPoints: 250,
      boostPercentage: 5,
      perks: ['+5% Cashback Boost', '75% - 79% Signal Confidence', 'Better Broker Offers', 'Heatmap & Screener'],
    };
  } else {
    return {
      level: 1,
      rankTitle: 'Rookie',
      maxPoints: 100,
      boostPercentage: 0,
      perks: ['Standard Cashback Rate', '70% - 74% Signal Confidence', 'Broker Comparisons', 'Table Analysis'],
    };
  }
}

/**
 * Returns info on points needed for the next tier.
 */
export function getNextTierInfo(level: number, currentPoints: number): {
  nextTierName: string | null;
  nextTierLevel: number | null;
  pointsNeeded: number;
  isMaxLevel: boolean;
  threshold: number;
} {
  if (level === 1) {
    return {
      nextTierName: 'Climber',
      nextTierLevel: 2,
      pointsNeeded: Math.max(0, 100 - currentPoints),
      isMaxLevel: false,
      threshold: 100,
    };
  } else if (level === 2) {
    return {
      nextTierName: 'Player',
      nextTierLevel: 3,
      pointsNeeded: Math.max(0, 250 - currentPoints),
      isMaxLevel: false,
      threshold: 250,
    };
  } else if (level === 3) {
    return {
      nextTierName: 'Boss',
      nextTierLevel: 4,
      pointsNeeded: Math.max(0, 500 - currentPoints),
      isMaxLevel: false,
      threshold: 500,
    };
  } else {
    return {
      nextTierName: null,
      nextTierLevel: null,
      pointsNeeded: 0,
      isMaxLevel: true,
      threshold: 1000,
    };
  }
}

