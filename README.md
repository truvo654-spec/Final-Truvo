# MarketSyde

MarketSyde is a trader rewards dashboard combining broker rebates, market signals, community features, and points-based progression.

## UX Flow

```mermaid
flowchart TD
    Start([Open MarketSyde]) --> Credits[Points & Credits]

    Credits --> Mission{Choose an action}
    Mission --> Missions[Browse missions]
    Mission --> Convert[Convert Syde Credits to Points]
    Mission --> Activity[Open activity log]
    Mission --> MissionModal[Complete mission task modal]
    Mission --> SignalFromCredits[Open a linked market signal]

    Missions --> MissionModal
    MissionModal --> Reward[Update points, credits, activity log]
    Convert --> Reward
    Reward --> Credits
    Activity --> Credits
    SignalFromCredits --> SignalDetail[Signal detail modal]

    Credits --> Nav[Header navigation]
    Nav --> Dashboard[Dashboard]
    Nav --> Brokers[Broker Directory]
    Nav --> Signals[Trading Signals]
    Nav --> Community[Community]
    Nav --> Leaderboard[Leaderboard]
    Nav --> Credits

    Dashboard --> QuickStart{Quick Start action}
    Dashboard --> TierPlan[Tier plan modal]
    Dashboard --> Ledger[Cashback ledger modal]
    Dashboard --> SignalDetail
    QuickStart --> Brokers
    QuickStart --> Connect[Connect broker modal]
    QuickStart --> Signals
    QuickStart --> Ledger

    Brokers --> Compare[Compare brokers modal]
    Brokers --> Connect
    Compare --> Connect
    Connect --> Connected[Account connected]
    Connected --> Reward

    Signals --> SignalChoice{Select signal}
    SignalChoice --> SignalDetail
    SignalChoice --> TierPlan
    SignalDetail --> Copy[Copy setup or estimate cashback]

    Community --> CommunityViews[Feeds / Topics / Articles / My Page / Profile]
    CommunityViews --> CommunityAction{Community action}
    CommunityAction --> Post[Create post or comment]
    CommunityAction --> Follow[Follow contributor]
    CommunityAction --> Challenge[Join challenge]
    CommunityAction --> CommunitySignal[Open referenced signal]
    CommunityAction --> Connect
    Post --> CommunityReward[Update community state and award points]
    Follow --> CommunityViews
    Challenge --> CommunityReward
    CommunityReward --> Credits
    CommunitySignal --> SignalDetail

    Leaderboard --> TierPlan
    Leaderboard --> Reward

    TierPlan --> Credits
    Ledger --> Credits
    SignalDetail --> Credits
```

## Primary Views

- **Points & Credits:** missions, credit conversion, activity history, and reward progression.
- **Dashboard:** quick-start onboarding, performance, broker highlights, signals, and cashback access.
- **Broker Directory:** filter partners, compare rebate conditions, and connect a trading account.
- **Trading Signals:** filter and inspect market setups, with tier-gated upgrade prompts.
- **Community:** browse feeds, topics, articles, profiles, challenges, and trader discussions.
- **Leaderboard:** view rankings and earn additional points.

## Development

```bash
npm install
npm run dev
```