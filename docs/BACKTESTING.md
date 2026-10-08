# Backtesting module

Backtesting lives inside the Trading Journal as its own tab (Overview · Trade Log · Insights · Playbook · **Backtest** · Weekly Review). It uses the journal's playbooks, trades, trading rules, brokers, Syde Credits and Points, and sends its results back to them.

## 1. Design read of the concept screens

| Screen | Layout regions | Components | States shown | Functions implied |
|---|---|---|---|---|
| New backtest run (setup) | Breadcrumb; "Rules pre-filled from playbook" banner with journal benchmark; two columns: Market data + Costs (left), Strategy rules + Risk (right); sticky footer with run profile and Run button | Segmented controls (asset class, timeframe, news), symbol search, date presets + from/to, weekday chips, numbered rule rows with Edit, broker cost tiles, sizing mode tabs, prop-firm card | Pre-filled from playbook, live broker sync, prop mode on | Playbook pre-fill, broker cost import, prop-firm rules, AI run quota on the Run button |
| Strategy lab (home + results) | Header with actions; tabs (Simulations, Playbook verification, Stress test, Forward tests); formula strip; 7 KPI cards; equity vs live chart; "Journal bridge" side panel; executions table | KPI cards with sample size, equity overlay, drawdown strip, leak card, push-to-playbook button, filterable table | Results with live comparison | Backtest vs live gap, push rules to playbook, export to journal |
| Replay | Practice source list (left), chart with controls (centre), order ticket + open position (right), session telemetry + tags + notes (bottom) | Source tabs, blind toggle, trade cards, play/step/speed/jump, drawing tools, HTF mini chart, buy/sell ticket with R:R, position card, tag chips, notes, toast | Blind mode active, open short position, auto-saved toast | Replay journal losses blind, tag practice trades, notes to Notebook, Points |
| What-if | Filter bar (range, account, symbols, playbook, mistake tags); "Change one rule" list (left); AI insight + comparison matrix + equity overlay + changed trades (right) | Rule cards with inputs/toggles, KPI deltas, overlaid equity, table of changed trades | Rule 4 active, 2 mistake tags selected | One-rule counterfactual on real trades, add rule to tracker |
| Saved run results | Title + actions; significance strip; 10 KPI cards; equity with benchmark; drawdown; AI verdict; robustness checks; trade table with filters | KPI cards, verdict score, 3 pass/fail checks, filter dropdowns, pagination | Validated run, all checks passed | Verdict with suggestions, OOS / walk-forward / Monte Carlo, journal actions |

## 2. Conflicts with the spec and how they were resolved

| Concept image | Spec | Resolution |
|---|---|---|
| Dark navy theme | Light theme | Light theme. The module reuses the journal's own card style and purple accent so it looks like part of the same page; profit and loss use green and red with + / − signs and icons. |
| Left sidebar with Daily Routine, Notebook, Prop Firms | The real app has a top header and a tabbed journal | Backtest is a tab in the Trading Journal. "Send notes to Notebook" writes to the playbook's review notes, and "Add to tomorrow's plan" adds a scenario to the playbook, because the app has no Notebook or Daily Routine page yet. |
| Dense screens: 10+ KPI cards, 4 sub-tabs, 6 rule rows on one view | "User friendly, not complicated" | Simplified (see section 3). |
| "AI verdict", "AI Oracle" | AI verdict card | The verdict is calculated from the run's own checks (out-of-sample, walk-forward, Monte Carlo) and from real re-runs of small rule changes, so every claim is backed by a number. It can be swapped for a Gemini call later. |
| Tick / 1s timeframes, Barclays/LMAX feed | Tick to 1D | 5m, 15m, 1h, 4h and 1D work on the mock feed. Tick, 1s and 1m are shown but disabled until a real data provider (Acuity) is connected. |

## 3. Simplifications (the user-friendly version)

- **One home, three plain questions.** "Test a playbook on past prices", "What if I followed one rule?", "Practice on past charts". Each opens a single page; there are no nested tabs.
- **Run in one click.** Coming from a playbook, every field is already filled (symbol, timeframe, session, rules, risk from your journal rules, costs from your broker). The setup page is three short steps on one screen with the less common settings folded away (market filters, costs detail, prop-firm mode, exits).
- **Rules read as sentences.** Rules are shown as "Buy when the close crosses above the 20-bar high", not as code. You can switch to the rule builder or type the strategy in your own words.
- **Results start with one sentence**, then four numbers (net P&L, win rate, average R, max drawdown), each with its sample size. Everything else sits behind "Show all stats".
- **The verdict says what to do next** with clickable suggestions that start a new run with that change.
- **Trade log filters** are two controls plus one "More filters" drawer, with removable chips and totals for what you see.

## 4. Assumptions, configurable values and what is mocked

See `src/backtest/config.ts` for every configurable value.

| Item | Value | Where |
|---|---|---|
| Automated runs per month by member level | Level 1: 3 · Level 2: 5 · Level 3: 10 · Level 4+: 30 | `PLAN_RUN_LIMITS` |
| Extra run price | 15 Syde Credits | `EXTRA_RUN_CREDITS` |
| Points for a finished replay session / saved backtest | 10 / 5, once per session or run | `POINTS` |
| Out-of-sample split | 70 / 30 | `OOS_SPLIT` |
| Walk-forward periods | 4 | `WALK_FORWARD_PERIODS` |
| Monte Carlo reshuffles | 1,000 | `MONTE_CARLO_RUNS` |
| Low-sample warning | under 30 trades or more than 6 rules | `MIN_TRADES`, `MAX_RULES` |
| Breakeven band | a trade within ±0.05R counts as breakeven | `BREAKEVEN_R` |

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
- Expectancy = win rate × average win − loss rate × |average loss| (also shown in R as average R).
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
