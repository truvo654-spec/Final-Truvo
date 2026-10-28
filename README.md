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

### Journal views (v2.27.0)

The journal opens in **Easy** for new preferences. Use **View** to choose Easy,
Standard, or the original Advanced interface independently for each tab. Use a
card's **⋯** menu to hide it, read more detail, or move it; **+ Add card** restores
hidden cards and reveals extra tools. Customized layouts are labeled **Custom**.
Profile → About You → **Journal view** controls the default, per-tab levels, and
reset. Resetting views never changes trades.

Trade Log's Easy view is **My trades**: one results summary, newest-first rows,
search, load more, manual entry, broker import, and a three-question Quick review.
Standard adds four result cards, a six-column sortable table, table settings, and
bulk tools. Advanced keeps the original workspace. Both simplified views use the
same filters and KPI calculations as Advanced; visible scope chips identify hidden
trades. Currency totals are never combined.

Quick review saves the **after-trade emotion**, plan adherence, lesson, and an
optional chart image without replacing other trade fields. **Partly** is preserved
as additional review detail and is not counted as fully following the plan in
existing analytics. A quick save does not bypass the full review's completion
requirements. **Open full review** saves the quick answers first.

Preferences are versioned in the existing browser-local journal storage, with
in-memory fallback and a visible warning if storage is unavailable or unreadable.
This static Vite application has no preferences API or server database; views are
not synced between devices. The existing journal demo-date basis is retained.
Other tabs receive the shared view/card foundation only; the dedicated Insights,
Playbook, Backtest, and optional fix prompts remain deferred.

Focused journal regression checks:

```powershell
node --import tsx --test src\components\journal\tests\journal-views.test.ts src\components\journal\tests\journal.test.ts src\components\journal\tests\day-review.test.ts
```