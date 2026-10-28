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

### Journal views (v2.33.4)

The journal opens in **Easy** for new preferences. Use **View** to choose Easy,
Standard, or the original Advanced interface independently for each supported tab. Use a
card's **⋯** menu to hide it, read more detail, or move it; **+ Add card** restores
hidden cards and reveals extra tools. Customized layouts are labeled **Custom**.
Profile → About You → **Journal view** controls the default, per-tab levels, and
reset. Resetting views never changes trades.

**Trade Log keeps its original interface**, including its shared header, eight
KPI cards, filters, grouping, columns, bulk actions, replay, exports, pagination,
and full review drawer. It is not affected by the journal view level or card
customizations. The simplified "My trades", manual-entry, and Quick review
interfaces from v2.27.0 have been withdrawn. Saved trades and review notes are
retained; no journal records are reset.

Preferences are versioned in the existing browser-local journal storage, with
in-memory fallback and a visible warning if storage is unavailable or unreadable.
This static Vite application has no preferences API or server database; views are
not synced between devices. The existing journal demo-date basis is retained.
Overview, Backtest, and AI Coach retain their existing content behind the shared
view/card foundation. Easy Playbook shows strategy cards with the saved markets,
instruments, rules and expandable details. Their example chart patterns are
illustrations, not actual market data, backtests or predictions. Cards show net
P&L, win rate, total trades, and winning/losing counts and net P&L subtotals.
Select a performance tile to open its contributing trades in a popup; net
P&L and win rate open all included trades, while winning and losing P&L open
their respective outcomes. Empty groups cannot be opened.
**Edit setup** changes the card's strategy details, markets, instruments, rules
and session without leaving Easy view. A name used by journal trades is locked
to preserve those links; other saved playbook data is retained.
Results use the current journal filters and closed trades with recorded costs in
the profile reporting currency; breakevens count toward the win-rate denominator,
and other currencies and unknown-cost records are excluded. **Edit or open full workspace** retains the original Playbook editor
and tools; **House rules & full workspace** is available even with no playbooks.
Standard and Advanced keep the original interface.

Easy Playbook has an Advanced-inspired quick-create chooser with three required
fields, optional starter cards and optional details. Defaults use the House risk
and trade-count limits, and the shared
House checklist remains in the existing check flow. Scenario technical details
and linked trade/backtest integration are not implemented yet.

### Simple Insights

Insights defaults to a ready-to-read report with six KPI cards and trends, a
trading calendar with weekly totals, a cumulative realized P&L / drawdown curve,
closing-weekday bars, entry-hour bars, and rule-based
observations, plus automatic playbook and discipline progress cards. Every chart
supports exact-value hover/focus details and opens the same trade drawer. Drawer
links open the original Trade Log and full review.
The curve supports drag-to-zoom and double-click/Escape reset; chart interactions
do not change the report filters.

Only three report filters are shown: **7D / 30D / 90D / YTD / All** (30D by
default), **Account** (hidden for a single account), and **All / Long / Short**.
Dates and accounts stay on the left; the side selector aligns right and wraps
without shrinking on narrow screens.
Selections are stored as `insightsRange`, `insightsAccount`, and `insightsSide`
query parameters, with `insightsAsOf` anchoring the final calendar date.
`journalTab=insights` opens the report directly; `journalTab=entries&journalTrade=ID`
opens a linked saved trade. Reload and browser Back/Forward restore selections.
URLs share selections, not private trade records; the receiving browser uses its
own saved journal and reporting profile.

Profile → Profile → **Journal reporting** sets the timezone and reporting currency.
The browser timezone and existing journal currency are the defaults. Calendar,
weekday, period boundaries, and curve use **local exit dates**; hourly and heatmap
views use **local entry times**, including daylight-saving changes. Other
currencies are visibly excluded rather than added without exchange rates.
Closed trades without a valid exit timestamp or reported result are excluded
with a coverage notice. Missing entry times exclude only entry-time analytics.
Results deduct recorded costs; missing costs are disclosed, not inferred. This
explicit recorded-cost basis can include trades that Advanced excludes when
total costs are unknown.

KPI comparisons use the immediately preceding equal number of calendar days;
an empty previous period is labeled, not treated as a measured zero. Observations
require at least five trades in every compared group. Widgets can be hidden or
reordered through the existing card controls. Choose **Advanced** for Insights in
Profile's **Journal view** section to retain the original reports and tools.

Easy Insights opens with **How am I doing?** first, followed by **Trading
calendar**. Both always use full-width rows in the compact dashboard. Larger screens
pair playbook progress with discipline, and the equity curve with weekday results.
Hourly charts keep full width; short observations use a compact grid. The
**Day × Hour** heatmap is removed from Easy, including its Add card menu; Standard
retains that widget, and Advanced analytics stay intact. Phones stack all widgets,
and tablet layouts split only suitable cards. Hidden or reordered widgets re-pair
or expand to fill rows without changing saved order. Hover details overlay the
cards rather than resizing them. Standard keeps its stacked layout, and
Advanced analytics are unchanged.

Existing custom orders are preserved. **Reset this tab** restores the new
summary-first default without changing trades, filters, or review notes.

### Closed trades and open positions in the drawer

The shared trade drawer has a **Closed trades / Open positions** toggle.
Closed trades restores the exact chart group that was clicked. Open positions
shows the latest saved snapshot for the selected account, side and reporting
currency; the date preset, period end and clicked historical day/group do not
restrict that snapshot. It is not a reconstruction of past positions or a live
broker feed. Changing drawer views never changes the chart filters or realized
KPIs.

The open view shows reported unrealized P&L, floating losses (the sum of negative
reported open-position results), recorded position details, and links to the
original Trade Log. Costs are shown separately, not deducted from a value that
may already include them. Missing reported P&L keeps full totals unknown; known
subtotals are explicitly labeled. Different currencies are never combined.
Floating losses are **not historical peak-to-trough drawdown**: no mark-to-market
history for the open positions is available. The cumulative and daily realized
chart views remain closed-result-only.

When no closed results match but saved open positions are available, **View open
positions** opens the same drawer directly. Switching tabs resets the list to
the top, and both views retain load-more controls and Trade Log actions.

### P&L chart views

The P&L card has two local view toggles: **Cumulative P&L** and **Daily P&L**
(non-cumulative net result per local exit date).
Cumulative and Daily share the same closed trades and realized drawdown; changing
the view resets chart-only zoom, not report filters, totals or journal records.
The chosen mode stays selected when report filters change; zoom resets for the
new scope.
Hover values, keyboard navigation and day drill-downs work in both realized
views.

The chart has no Floating losses option or View open positions in drawer button.
Saved open-position information remains available through the existing toggle
inside the shared trade drawer.

### Automatic personal progress

Easy Insights adds two basic, read-only trackers with no new settings or goals
to configure. They inherit the same date, account, side, timezone and reporting
currency scope as the other Insights widgets.

- **Your playbook progress:** recorded setups, their results and win rate, and
  simple plan-following bars. The most-used named setup is highlighted, not
  recommended as the best strategy. Three groups show initially; **Show all
  playbooks** reveals the rest, including unassigned trades. Unanswered plan
  checks are excluded from percentages, and consistency labels require five
  answers.
- **Your discipline track:** the existing Overview discipline calculation
  (plan 50%, checklist 30%, reviewed mistake-free trades 20%), review coverage,
  previous-period score change, and the current reviewed-plan streak. Automatic
  habit markers at 1, 3, 5 and 10 reviews reflect this view's current streak, not
  lifetime achievements. Streaks are withheld when entry timing is unreliable.

Scores use the current house checklist and the existing review-evidence rules;
they are not profit targets or account levels. Progress does not require profits
or additional trading, and **no Points or Credits are awarded**. Missing evidence
is never counted as a pass or failure. Select a result or progress bar to inspect
its trades in the shared drawer; this does not change global filters. Both cards
use the existing hide/reorder controls. Full Advanced analytics, Playbook, Trade
Log and review workflows remain unchanged.

Focused journal regression checks:

```powershell
node --import tsx --test src\components\journal\tests\simple-insights.test.ts src\components\journal\tests\journal-views.test.ts src\components\journal\tests\journal.test.ts src\components\journal\tests\day-review.test.ts
```