// ─── Copy Tone System ───────────────────────────────────────────────
// Two voices for the same product: "default" (current, professional)
// and "cheekyGamer" (the witty/gamified overhaul).
//
// GOLDEN RULE: anything touching trade execution, balances, errors or
// KYC lives in `shared` below and is NOT duplicated per-tone — both
// tones read the exact same literal copy for those, on purpose.

export type CopyTone = 'default' | 'cheekyGamer';

export const TONE_LABELS: Record<CopyTone, string> = {
  default: 'Standard',
  cheekyGamer: 'Cheeky Gamer',
};

interface QuickStartStepCopy {
  title: string;
  description: string;
  cta: string;
}

interface PromoSlideCopy {
  title: string;
  description: string;
}

export interface ToneCopy {
  greetingSubtitle: (name: string) => string;
  returningGreetingSubtitle: string;
  quickStartBarLabel: string;
  quickStartDoneLabel: string;
  yourCashbackLabel: string;
  yourCashbackEmptyDescription: string;
  chooseBrokerTitle: string;
  chooseBrokerSubtitle: string;
  chooseBrokerCta: string;
  quickStartSteps: Record<
    'choose-broker' | 'link-account' | 'trade-usual' | 'earn-cashback',
    QuickStartStepCopy
  >;
  promoSlides: Record<
    'double-cashback-weekend' | 'referral-bonus' | 'streak-challenge' | 'new-broker-welcome',
    PromoSlideCopy
  >;
  addWidgetsCta: string;
  moreBrokersTitle: string;
  moreBrokersSubtitle: string;
  navLabels: {
    dashboard: string;
    brokers: string;
    community: string;
    leaderboard: string;
    signals: string;
    wallet: string;
  };
  errorPages: {
    '404': { headline: string; description: string; cta: string };
    '500': { headline: string; description: string; ctaPrimary: string; ctaSecondary: string };
    '503': { headline: string; description: string; cta: string };
  };
  pageTitles: {
    cashbackOverview: string;
    pointsCredits: string;
    brokerComparison: string;
    memberPlan: string;
  };
  pageSubtitles: {
    pointsCredits: string;
    brokerComparison: string;
    memberPlan: string;
  };
}

export const COPY_TONES: Record<CopyTone, ToneCopy> = {
  default: {
    greetingSubtitle: () =>
      "Look alive. The market won't wait, and we'd hate for you to miss what's next.",
    returningGreetingSubtitle: 'The market kept moving. Good thing you did too.',
    quickStartBarLabel: 'Start trading in a few steps',
    quickStartDoneLabel: 'Done',
    yourCashbackLabel: 'CUMULATIVE CASHBACK',
    yourCashbackEmptyDescription: 'Connect a broker to start earning cashback automatically.',
    chooseBrokerTitle: 'Choose a Broker',
    chooseBrokerSubtitle: 'Start trading with a connected broker.',
    chooseBrokerCta: 'Choose Broker',
    quickStartSteps: {
      'choose-broker': {
        title: 'Choose Broker',
        description: 'Choose yours, or find a better one here',
        cta: 'Choose',
      },
      'link-account': {
        title: 'Link Trading Account',
        description: 'Connect your account to start tracking',
        cta: 'Link',
      },
      'trade-usual': {
        title: 'Trade as Usual',
        description: 'Keep trading normally on your platform',
        cta: 'Trade',
      },
      'earn-cashback': {
        title: 'Earn Cashback',
        description: 'Get paid to trade. Automatically',
        cta: 'View',
      },
    },
    promoSlides: {
      'double-cashback-weekend': {
        title: 'Double Cashback Weekend',
        description: 'Every trade this weekend earns 2x rebates across all connected brokers.',
      },
      'referral-bonus': {
        title: 'Refer a Trader, Earn $50',
        description:
          'Invite a friend to MarketSyde and get $50 in credits once they place their first trade.',
      },
      'streak-challenge': {
        title: '7-Day Streak Challenge',
        description: 'Trade 7 days in a row this month to unlock +300 bonus points instantly.',
      },
      'new-broker-welcome': {
        title: 'New Broker Welcome Offer',
        description: 'Connect a new broker this week and get an instant $25 cashback boost.',
      },
    },
    addWidgetsCta: '+ Add widgets',
    moreBrokersTitle: 'More Connected Brokers. More Opportunities.',
    moreBrokersSubtitle: 'Connect more broker partners and give your trades more ways to earn cashback.',
    navLabels: {
      dashboard: 'Dashboard',
      brokers: 'Broker Directory',
      community: 'Community',
      leaderboard: 'Leaderboard',
      signals: 'Trading Signals',
      wallet: 'Wallet',
    },
    errorPages: {
      '404': {
        headline: 'Well, this is awkward.',
        description:
          "Either you made a typo, or we hid this page because we're exclusive like that. Let's pretend this never happened and get you back to safety.",
        cta: 'Take Me Home',
      },
      '500': {
        headline: "It's not you, It's entirely us.",
        description:
          'Our servers just had a minor existential crisis. A bunch of ones and zeros are currently fighting for their lives, but our team is on it (or just turning it off and on again).',
        ctaPrimary: 'Try Refreshing',
        ctaSecondary: 'Escape to Homepage',
      },
      '503': {
        headline: "We're down. Everything is fine. Mostly.",
        description:
          "We're currently injecting the system with fresh code and a lot of caffeine. We're temporarily offline, meaning you'll have to find another way to procrastinate for a few minutes.",
        cta: 'Check Again',
      },
    },
    pageTitles: {
      cashbackOverview: 'Cashback Overview',
      pointsCredits: 'Mission, Points & Credits',
      brokerComparison: 'Compare CFD Brokers',
      memberPlan: 'Member Plan',
    },
    pageSubtitles: {
      pointsCredits: "Everything you've earned so far, plus what you're currently missing out on.",
      brokerComparison: 'Compare cashback rates, spreads, and perks side by side before you connect.',
      memberPlan: 'See your current tier, perks, and what it takes to level up.',
    },
  },
  cheekyGamer: {
    greetingSubtitle: () =>
      "The market doesn't wait for anyone, and honestly, neither do we. Let's get this loot.",
    returningGreetingSubtitle: "You're back. The market missed you (probably). Let's go make some loot.",
    quickStartBarLabel: "The Tutorial (yes, you still have to do it)",
    quickStartDoneLabel: 'Cleared ✓',
    yourCashbackLabel: 'TOTAL LOOT COLLECTED',
    yourCashbackEmptyDescription:
      "Wow. Such empty. Do you even trade? Connect a broker and watch this number stop being sad.",
    chooseBrokerTitle: 'Recruit a Broker',
    chooseBrokerSubtitle: "Pick one, or ditch your current one for someone better. No hard feelings.",
    chooseBrokerCta: 'Recruit Broker',
    quickStartSteps: {
      'choose-broker': {
        title: 'Recruit Your Broker',
        description: 'Pick one, or find a better one here. No hard feelings.',
        cta: 'Recruit',
      },
      'link-account': {
        title: 'Plug In',
        description: 'Hook up your account so we can start counting your loot.',
        cta: 'Plug In',
      },
      'trade-usual': {
        title: 'Do Your Thing',
        description: "Trade exactly like you already do. We're not asking you to change.",
        cta: 'Trade',
      },
      'earn-cashback': {
        title: 'Get Paid',
        description: "Loot lands automatically. You don't even have to say please.",
        cta: 'Claim',
      },
    },
    promoSlides: {
      'double-cashback-weekend': {
        title: 'Double Loot Weekend',
        description: 'Every trade this weekend drops 2x rebates. No grinding required.',
      },
      'referral-bonus': {
        title: 'Squad Up, Earn $50',
        description:
          'Drag a friend into MarketSyde. They trade once, you get $50 in loot. Easiest co-op mission ever.',
      },
      'streak-challenge': {
        title: '7-Day Combo Challenge',
        description: 'Keep the streak alive for 7 days straight and unlock +300 bonus XP instantly.',
      },
      'new-broker-welcome': {
        title: 'New Recruit Bonus',
        description: 'Recruit a new broker this week and grab an instant $25 loot drop.',
      },
    },
    addWidgetsCta: '+ Customize Your Base',
    moreBrokersTitle: 'More Squad Members. More Loot Drops.',
    moreBrokersSubtitle: 'Recruit more broker partners and give every trade more ways to pay you back.',
    navLabels: {
      dashboard: 'Your Base',
      brokers: 'Broker Roster',
      community: 'The Guild',
      leaderboard: 'Hall of Flame',
      signals: 'Intel Drops',
      wallet: 'Loot Stash',
    },
    errorPages: {
      '404': {
        headline: '404: This Page Rage-Quit.',
        description:
          "Even we don't know where it went. Maybe it rage-quit, maybe it's farming XP somewhere else. Either way, let's get you back to base.",
        cta: 'Back to Base',
      },
      '500': {
        headline: 'Server Down. Send Help (and Snacks).',
        description:
          "Our servers took critical damage and are currently respawning. Our engineers are on it — no loot was lost, we promise.",
        ctaPrimary: 'Try Again',
        ctaSecondary: 'Retreat to Base',
      },
      '503': {
        headline: 'Down for Maintenance. Back Soon, Probably.',
        description:
          "We're patching the game (i.e. the platform). Grab a snack, stretch your legs — we'll be back online before you know it.",
        cta: 'Check Again',
      },
    },
    pageTitles: {
      cashbackOverview: 'Your Loot Ledger',
      pointsCredits: 'Quests, XP & Credits',
      brokerComparison: 'Broker Showdown',
      memberPlan: 'Your Rank & Perks',
    },
    pageSubtitles: {
      pointsCredits: "Everything you've looted so far, plus what you're sleeping on.",
      brokerComparison: 'Stack cashback rates, spreads, and perks head-to-head before you recruit one.',
      memberPlan: 'Your current rank, your perks, and what it takes to level up.',
    },
  },
};
