# Backtesting module

Backtesting lives inside the Trading Journal as its own tab (Overview · Trade Log · Insights · Playbook · **Backtest** · AI Coach). It uses the journal's playbooks, trades, trading rules, brokers, Syde Credits and Points, and sends its results back to them.

## Expert-trader version (1.32.0)

**No historical price provider is connected.** Automated results are generated-demo experiments, not a verification of every written strategy rule or a forecast of actual performance. Setup shows written-rule coverage, the executable template, and transferred numerical constraints. Prop checks use a simplified realized-balance/bar model, not an individual firm's compliance rules.

- **Save vs reference:** Save retains the complete experiment and never silently trims older trades or replaces a reference. A storage failure preserves the prior data and awards no Points. On a saved, versioned run, **Set as demo reference** explicitly replaces the previous reference and retains source, currency, symbol, written version and executable settings. Recorded comparisons require matching instrument/currency/version and known realized R, excluding unknown legacy versions and CFD/futures substitutions. Demo references never classify real performance as on track or underperforming.
- **Chronological checks:** An unchanged-rule chronological split and four fixed-rule periods describe generated results. Neither is walk-forward optimization, and changing parameters does not preserve an independent holdout. Trades crossing a split/period boundary are excluded from that check, but retained in the full report.
- **Entry restrictions:** Session, weekday, news and daily halts are checked again at the actual fill, not only when a signal places an order. Consecutive closed-trade net losses can halt the remainder of the UTC day.
- **Practice drafts:** Exact bars, cursor, orders, positions, settings and notes resume paused after navigation/reload. Drafts do not claim completion rewards. Finish persists the session and one-time claim together. A corrupt draft is not overwritten; errors and an explicit discard action are shown.
- **Playbook evidence:** Immutable IDs protect attribution across filtered accounts. A scenario has directional price validation and its own versioned preparation checklist. Link an existing execution from Checklist or assign playbook/scenario in review. Preparation is a dated snapshot, not proof of execution compliance; review-time rule attribution must be explicit.
- **Local backups:** **Download full Journal Backup** exports a versioned, lossless browser-local data set including reviews/images, playbooks, saved experiments and a Practice draft. Restore previews replacement and requires confirmation; export the current backup first. Login, credits, unlock entitlements and current report filters are not restored. CSV is for round-trip execution data, not a lossless review backup.
- **Statement reconciliation:** Map explicit planned/open/closed status. A zero result without exit evidence needs status rather than guessing closure. Open-to-closed updates and conflicting corrections are previewed and require approval; reviews and record IDs are retained. Conflicting currencies require reconciliation. Missing strategy becomes Unassigned.
- **Scope and monitors:** Account/currency/category filters also scope Practice and coaching; date-broadened cohorts retain other filters. Sample-origin trades can be excluded without deletion. The current UTC date drives planning and expiry. Monitors use known exits before an entry, verified monetary risk/equity, and fixed checklist snapshots, with unknown coverage explicitly reported.

## Access by member level

| Level | Included access |
|---|---|
| 1 | Trading Journal core, advanced Insights, Playbook, Backtest and advanced Coach tools are locked by default. Each can be temporarily unlocked with Syde Credits. The basic local AI Coach summary remains available. |
| 2 | Overview, Trade Log and standard Insights. Advanced Insights, Playbook and Backtest remain locked by default and can be temporarily unlocked with credits. |
| 3 | Journal core, advanced Insights, Playbook and Backtest. Advanced AI Coach scenarios remain limited to Level 4 or a credit unlock. |
| 4+ | All Journal and Backtest features, including advanced AI Coach scenarios. |

Credit unlocks last 1, 7 or 30 days and follow the upper Instrument Analysis price band: 140 credits/day for Journal core and advanced Insights; 180 credits/day for Playbook, Backtest and advanced Coach tools. A Backtest tab unlock does not increase the existing level-based monthly run allowance; the 15-credit extra-run charge still applies. Unlocks are stored with the journal's browser-local data; production authorization must also be enforced by a backend.

## 1. Design read of the concept screens

| Screen | Layout regions | Components | States shown | Functions implied |
|---|---|---|---|---|
| New backtest run (setup) | Three steps: select one or more playbooks, choose shared market and dates, configure shared money/risk/costs; sticky Run button | Playbook checkboxes with each hypothesis, simulated rules, timeframe/session, journal metrics and Trade Log link | One playbook or multi-playbook comparison | Playbook rules/timeframe/session remain individual; market, dates, risk and costs are shared |
| Comparison results | Interactive account-balance curves with checkboxes for each scenario, followed by side-by-side metrics, full reports and matching Trade Log links | Each line is one playbook on its selected instrument; hover for date/value details and toggle lines to compare | Completed batch comparison | One monthly run is charged per comparison |
| Imported journal benchmark | Selected Trade Log rows shown beside the simulated result; matching playbook is preselected when unambiguous | Actual net P&L, win rate and realized average R; incomplete/open trades are excluded from these metrics | User imports selected rows from the Trade Log | Existing playbook hypothesis/rules are tested; imported results are a reference, not inferred rules |
| Strategy lab (home + results) | Header with actions; tabs (Simulations, Playbook verification, Stress test, Forward tests); formula strip; 7 KPI cards; equity vs live chart; "Journal bridge" side panel; executions table | KPI cards with sample size, equity overlay, drawdown strip, leak card, push-to-playbook button, filterable table | Results with live comparison | Backtest vs live gap, push rules to playbook, export to journal |
| Replay | Practice source list (left), chart with controls (centre), order ticket + open position (right), session telemetry + tags + notes (bottom) | Source tabs, blind toggle, trade cards, play/step/speed/jump, drawing tools, HTF mini chart, buy/sell ticket with R:R, position card, tag chips, notes, toast | Blind mode active, open short position, auto-saved toast | Replay journal losses blind, tag practice trades, notes to Notebook, Points |
| What-if | Filter bar (range, account, symbols, playbook, mistake tags); "Change one rule" list (left); AI insight + comparison matrix + equity overlay + changed trades (right) | Rule cards with inputs/toggles, KPI deltas, overlaid equity, table of changed trades | Rule 4 active, 2 mistake tags selected | One-rule counterfactual on real trades, add rule to tracker |
| Saved run results | Title + actions; significance strip; KPI cards; generated price chart; demo assessment; robustness checks; trade table with filters | KPI cards, descriptive score, 3 demo checks, filter dropdowns, pagination | Completed generated-price experiment | Fixed-rule chronological split / period stability / Monte Carlo, explicit reference selection |

## 2. Conflicts with the spec and how they were resolved

| Concept image | Spec | Resolution |
|---|---|---|
| Dark navy theme | Light theme | Light theme. The module reuses the journal's own card style and purple accent so it looks like part of the same page; profit and loss use green and red with + / − signs and icons. |
| Left sidebar with Daily Routine, Notebook, Prop Firms | The real app has a top header and a tabbed journal | Backtest is a tab in the Trading Journal. "Send notes to Notebook" writes to the playbook's review notes, and "Add to tomorrow's plan" adds a scenario to the playbook, because the app has no Notebook or Daily Routine page yet. |
| Dense screens: 10+ KPI cards, 4 sub-tabs, 6 rule rows on one view | "User friendly, not complicated" | Simplified (see section 3). |
| "AI verdict", "AI Oracle" | Demo assessment | A deterministic description of generated-price chronological/period checks, Monte Carlo and small parameter re-runs. These checks do not verify market profitability or validate re-tuned parameters on untouched data. |
| Tick / 1s timeframes, Barclays/LMAX feed | Tick to 1D | 5m, 15m, 1h, 4h and 1D work on the mock feed. Tick, 1s and 1m are shown but disabled until a real data provider (Acuity) is connected. |

## 3. Simplifications (the user-friendly version)

- **One home, three plain questions.** "Compare playbooks on past prices", "What if I followed one rule?", "Practice on past charts". Each opens a single page; there are no nested tabs.
- **Playbook-first comparisons.** Select one or more playbooks. Each keeps its own strategy rules, timeframe and session, while symbol, date range, account/risk and costs are shared. A multi-playbook comparison consumes one monthly run.
- **Import actual trades as a benchmark.** Select Trade Log rows and open them in Backtest. Their realized results stay visible beside the simulation; when the sample has one playbook, its saved hypothesis and rules are preselected. The benchmark does not invent rules from outcomes.
- **Transparent rules.** Executable technical recipes transfer directly. When a playbook has no technical recipe, the test uses a starter template and clearly says that discretionary notes are context only, not simulated rules.
- **Run in one click.** Coming from a playbook, its settings are prefilled; the setup page keeps common settings together and folds less-used filters away (market filters, costs detail, prop-firm mode, exits).
- **Results start with one sentence**, then four numbers (net P&L, win rate, average R, max drawdown), each with its sample size. Everything else sits behind "Show all stats".
- **The verdict says what to do next** with clickable suggestions that start a new run with that change.
- **Trade log filters** are two controls plus one "More filters" drawer, with removable chips and totals for what you see.

## 4. Assumptions, configurable values and what is mocked

See `src/backtest/config.ts` for every configurable value.

| Item | Value | Where |
|---|---|---|
| Automated runs per month by member level | Level 1: 3 · Level 2: 5 · Level 3: 10 · Level 4+: 30 | `PLAN_RUN_LIMITS` |
| Monthly run charge for multiple selected playbooks | One run per comparison batch | `BacktestPage` |
| Extra run price | 15 Syde Credits | `EXTRA_RUN_CREDITS` |
| Points for a finished replay session / saved backtest | 10 / 5, once per session or run | `POINTS` |
| Out-of-sample split | 70 / 30 | `OOS_SPLIT` |
| Fixed-rule stability periods (not walk-forward optimization) | 4 | `WALK_FORWARD_PERIODS` |
| Monte Carlo reshuffles | 1,000 | `MONTE_CARLO_RUNS` |
| Low-sample warning | under 30 trades or more than 6 rules | `MIN_TRADES`, `MAX_RULES` |
| Breakeven band | absolute net amount <= 0.005 account-currency units | shared `netOutcome` |

Mocked until real services exist:

- **Market data.** `MockMarketData` generates seeded 5-minute OHLCV for EUR/USD, GBP/USD, micro Nasdaq (MNQ), micro S&P (MES), micro gold (MGC), BTC/USDT and NVDA from 2024-10-01 to 2026-10-07, aggregated to 15m, 1h, 4h and 1D. Journal names map onto them (NAS100 → MNQ, US500 → MES, XAU/USD → MGC). Micro contracts keep 1% risk workable on a $100,000 account. Swap in a real provider by implementing `MarketDataProvider` (planned: Acuity).
- **News calendar.** High-impact days (NFP, CPI, FOMC) follow a fixed yearly pattern.
- **Engine service.** The engine runs in a Web Worker with a one-at-a-time job queue, progress and cancel. The same module can run in a server worker; the page only stores and reads results.
- **Storage.** Saved runs, usage, replay sessions and playbook expected stats are kept in the browser (`localStorage`) until a backend exists. Entities match the spec: BacktestRun, BacktestTrade, ReplaySession, WhatIfRun, PlaybookExpectedStats.
- **What-if price paths.** Journal trades have no recorded price path, so rules that depend on price movement (tighter stop, different target, breakeven) use a path rebuilt from the trade's entry, exit, stop and times. They are labelled "estimate". Rules that only need the trade list (losses per day, daily loss, hours, mistake tags) are exact.
- **Times.** Stored in UTC; shown in your browser's time zone. Sessions are defined in UTC (Asia 00–07, London 07–16, New York 12–21).

## 5. Metric definitions

- Win rate = winning trades ÷ all trades.
- Profit factor = gross profit ÷ |gross loss|.
- Expectancy = total net P&L divided by all completed trades, including cash amounts inside the breakeven band. Average R is separately averaged from available R evidence.
- R multiple = net P&L ÷ initial risk; initial risk = |entry − stop| × size × multiplier.
- Max drawdown = largest peak-to-trough fall in equity, in $ and %.
- Sharpe = mean daily return ÷ standard deviation of daily returns × √252 (risk-free 0).
- Sortino = mean daily return ÷ downside deviation × √252.
- Calmar = annualised return ÷ max drawdown %.

## 6. Tests

`npm test` runs the engine tests with Node's built-in test runner:

- no look-ahead: the guarded series throws on any read past the current bar, and a run on a shorter history gives identical trades for every trade that closed before the cut;
- fills: market at next open, stop on a cross, limit only when price trades through;
- costs: commission, spread and slippage change P&L by the expected amount;
- stop before target when both are hit in one bar (and the trade is flagged);
- metric formulas against a hand-calculated fixture.
