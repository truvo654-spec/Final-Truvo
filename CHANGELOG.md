# Changelog

All notable changes to this project will be documented in this file.

## [1.7.1] - 2026-10-10

### Changed

- Merged position P&L comparisons into the main candlestick chart in Journal replay and Backtest. One chart and timeline now show price, entry/exit markers, stop/target levels, and both P&L lines with explicitly separate price and USD scales.
- Unified candle and position details on hover and keyboard focus. Kept the accessible data table and removed the separate P&L chart/card.

## [1.7.0] - 2026-10-10

### Added

- Replay now opens a direct position test from a recorded trade or playbook setup. Entry, size, unit valuation, estimated costs, stop and target are editable copies. Starting at a selected chart bar exposes open P&L, realized test P&L, remaining size and account return as playback advances or rewinds.
- A linked P&L history compares stop/target exits with continuing to hold the position, including chart price in hover details and an accessible table. Manual close and return-to-start controls use the same timeline. Stop gaps and candles touching both exit levels use explicit conservative rules; the last chart bar does not force an exit.
- Recorded contract aliases and missing currency/valuation information require explicit test inputs. Generated prices remain labeled as simulated; no historical feed or recorded fills are invented. Existing strategy simulation and its position monitor remain available in the second replay mode.

## [1.6.1] - 2026-10-09

### Changed

- Trade Log, Insights, Playbook, Backtest and Weekly Review now use the same two-month date-range calendar as Overview. Presets, manual dates, Apply/Cancel and keyboard navigation reuse the existing component and shared journal date scope, so switching tabs retains the selected range.

## [1.6.0] - 2026-10-09

### Added

- Shared Overview/Backtest demo replay now monitors the hypothesis position at the selected timeline bar: initial/remaining quantity in instrument units, entry, initial/current stop, monetary and percentage risk, partial-close P&L, closed-trade P&L and estimated net open P&L. The existing engine exposes a read-only snapshot; it does not force an exit when inspecting an unfinished replay.
- Demo equity and risk-percentage/fixed-quantity controls use instrument minimums, increments and multipliers. A setup preview distinguishes planned quantity, stop risk and commissions from actual simulated fills. Invalid or missing inputs remain unknown and block testing.
- Match the selected playbook with a read-only saved scenario or an editable demo-only price draft. Scenario numeric tests use its bias, entry crossing and absolute stop/target, while discretionary written triggers remain unknown. Checks distinguish Match, Mismatch, Unknown and Not applicable for instrument, timeframe, risk, reward/risk, session, scenario validity and recorded strategy; no automatic compliance grade is added.
- Scenario validity uses the recorded trade date (or today's UTC date for free practice), not the generated candle date. Saved playbooks/scenario statuses, trading records, currencies, journal metrics, credits and points are never changed by this sandbox.

## [1.5.0] - 2026-10-09

### Added

- Overview daily replay now opens a light-mode simulated candlestick workspace with volume, timeline scrubbing, play/pause, step, restart, speed, instrument and timeframe controls. The same workspace is available under Backtest → Demo replay; existing Practice and automated backtests remain intact.
- Recorded trade strategy selects its matching playbook's existing executable template. A full-demo hypothesis comparison uses the existing bar-by-bar engine on identical generated candles, with editable ATR stop, R target and commissions, USD demo-account returns, execution ledger and chart markers. Unknown/unlinked strategies require an explicitly separate template; written discretionary rules are not automatically evaluated.
- Deterministic demo paths do not use actual outcomes or exit prices and are clearly separate from historical/API prices. Demo actions never write trading records, playbook rules, expected performance, points, credits or saved runs. Keyboard timeline controls, candle-table alternatives and modal focus restoration are retained.

## [1.4.1] - 2026-10-09

### Added

- Overview daily review's Linked trades table now separates Buy/Sell, Net ROI percentage and Strategy (identifying known playbooks versus unlinked recorded strategies). Net ROI uses net P&L divided by recorded account equity at entry, not guessed margin or notional. Open/planned trades, unknown costs and missing/non-positive equity remain unknown.
- A keyboard-accessible replay icon opens a connection-status dialog and returns to the same daily review with focus restored. No custom replay API is configured or documented in the repository; real-candle playback is pending that integration. Generated practice candles are not substituted for actual trade history.
- Replay and Review actions stay visible while the daily table scrolls horizontally, with an explicit explanation of ROI's denominator.

## [1.4.0] - 2026-10-09

### Added

- Journal Overview's calendar, daily-result and drawdown points, and cumulative chart/table open a light-mode daily review window. Includes separate gross/net/known-cost coverage, lifecycle and review states, trade-by-trade result curve with table alternative, linked trade reviews, previous/next day navigation and the existing daily reflection shared with Weekly Review.
- Overview date filter now opens two adjacent month calendars, editable start/end dates, inclusive UTC presets, recorded-day count and explicit Apply/Cancel. Draft changes do not affect the journal until confirmed; confirmed ranges remain shared with other journal screens and persist locally. Demo presets identify the journal's demo date; no live feeds or exchange-session counts are implied.
- Daily progress uses actual review, playbook, stop-history and reflection evidence alongside the existing discipline and rules components, without a competing score. Missing costs, timestamps, risk and answers remain unknown; open and planned trades stay outside realized results; currencies remain separate.

### Fixed

- Empty or planned-only rule cohorts no longer claim that the maximum-trades rule was kept. Dialog focus handling includes expandable data tables and restores focus and scrolling on close. Main Dashboard remains untouched.

## [1.3.2] - 2026-10-09

### Changed

- Removed the duplicate Broker filter from Insights → Day & Time. The shared journal Broker filter remains authoritative; old report-only broker exclusions no longer silently narrow calculations, comparisons, exports or drilldowns. Broker analysis remains available in the matrix.
- Insights' Market type filter now lists all five journal markets (Forex, Crypto, Stocks, Commodity, Indices), including zero-trade types. Its list and the shared journal toolbar use the same definition; saved report market selections remain intact.

## [1.3.1] - 2026-10-09

### Changed

- Replaced the unavailable Options button in Backtest → Market and dates with an active Indices group. MNQ and MES appear under Indices and selecting the group selects MNQ. Futures retains MGC. Existing symbols, saved runs, contract multipliers, tick sizes and cost calculations are unchanged; the setup explains that available indices are micro index futures, not cash-index CFDs.

## [1.3.0] - 2026-10-09

### Added

- Additional trading charts belong only in Trading Journal → Overview, below Recent Entries: daily P&L, realized daily drawdown, entry-time and duration scatter views, descriptive information coverage, and cost/daily context. Existing Overview filters, currency and gross/net basis control the same cohort; cashback and points remain separate.
- Chart details support focus, keyboard selection and data-table alternatives. Day selection reuses the daily workspace; trade selection reuses the review drawer. Missing timestamps, costs and risk are not invented.

### Fixed

- Changing currency now resets the account filter to that currency's accounts, rather than leaving an invisible incompatible account selected. Changing currency/account also clears the selected day.
- New chart explanations stay inside their cards on desktop and mobile. Daily chart positions use actual date spacing, and all-flat charts retain valid axes.

### Preserved

- Restored the main Dashboard to its previous layout. No duplicate KPI row, cumulative chart, calendar, review queue, filters, dashboard score or navigation was added to the journal. Existing emotion, discipline, rules, playbook and broker/cashback workflows remain in place.

## [1.2.0] - 2026-10-09

### Changed

- Journal calculations share closed-result eligibility, net outcomes including breakeven, known-cost requirements, risk coverage and separate currencies. Gross Overview display is explicitly labeled; trading results, USD cashback estimates and Points remain separate.
- Psychology starts unanswered. Review completion and trading lifecycle are separate. Personal-rule summaries identify unavailable evidence instead of claiming complete compliance.
- Shared account/currency/date/filter scope continues between journal views. `/trade/journal` opens and reloads the journal directly. Browser storage preserves records and preferences, with an isolated `journalTest=1` workspace for evaluation.
- Header controls fit medium screens. Trade Log has a smaller default column set without removing optional columns or overriding saved choices. Calendar, Insights and Playbook chart details support keyboard access and clearer explanations.

### Added

- Planned, Open and Closed status indicators and filters across journal and backtest trade views.
- Review queue, Needs Review view, keyboard-accessible review drawer, previous/next navigation, validation, cancellation, reopen and local save.
- Daily reflection workspace; weekly dates, prior-focus follow-up, linked trades and daily-note connections.
- User-supplied execution ledger and partial-close evidence, initial monetary-risk history, equity-at-entry evidence, planned versus realized R and local chart attachments. Incomplete valuation metadata does not create estimated live results.
- CSV account identity, source-offset handling, known gross/net basis, validation preview, account-aware duplicate skipping, reconciliation and retained import history. Linking is explicitly distinguished from automatic sync, which is not live.
- Expectancy, daily closed-result drawdown, cost impact and risk/R coverage; per-rule followed/broken/unknown/not-applicable drilldowns and retained rule-definition snapshots.
- Journal calculation/import regression tests alongside the existing backtest-engine tests.

### Limitations

- This remains a local prototype: no server persistence or automatic broker sync, no currency conversion, and no automatic fill valuation without instrument metadata. Existing aggregate records are retained; missing historical evidence is not invented.

## [1.1.2] - 2026-10-08

### Changed

- Backtest → Practice: the single "Market" dropdown is replaced by separate **Market type** (Forex, Indices, Commodities, Crypto, Stocks) and **Instrument** filters, both multi-select. With several instruments, one is picked at random (blind mode keeps you guessing). Journal names map to the demo feed (NAS100 → MNQ, US500 → MES, XAU/USD → MGC).
- Practising your own trades adds Result (losses / wins / all), Playbook and Mistake filters, with a live count of matching trades.
- Custom filters: "Save as my filter" stores the current combination under a name; saved filters appear as chips to apply or delete.

## [1.1.1] - 2026-10-08

### Changed

- Trading Journal tabs: Playbook now comes before Backtest (Overview · Trade Log · Insights · Playbook · Backtest · Weekly Review).

## [1.1.0] - 2026-10-08

### Added

- **Backtest tab in the Trading Journal**. Simplified flow: a home page with three plain choices, then one page per task.
  - **Test a playbook on past prices.** One setup page in three steps (what to test, market and dates, money/risk/costs), pre-filled from the playbook, your journal's trading rules and your broker, so you can press Run straight away. Rules can come from a playbook, a rule builder (SMA, EMA, RSI, ATR, VWAP, yesterday's high/low, session high/low, N-bar high/low, fair value gaps) or a plain-English description that is shown back for confirmation. Less common settings (session, weekdays, news days, trade management, costs, prop-firm rules) are folded away. Run is disabled until the setup is valid, with the reason shown.
  - **Engine** in a Web Worker with a one-at-a-time queue, progress and cancel: strict time order with a guard that refuses to read future bars, market fills at the next bar open (or same-bar close), limit orders only when price trades through, stop-before-target when both are inside one bar (flagged), commission/spread/slippage, % / fixed $ / fixed size sizing, breakeven, trailing stop, partial exits, time and session-end exits, daily loss, max drawdown and prop-firm rules. Zero-trade runs explain why.
  - **Results**: one-sentence summary, four headline numbers with sample sizes (more behind "Show all stats": profit factor, expectancy, Sharpe, Sortino, Calmar, streaks…), equity curve ($ or R) with drawdown, a verdict with three reasons and suggested changes that were re-tested on the same data, out-of-sample (70/30), walk-forward (4 periods) and Monte Carlo (1,000 reshuffles) checks, breakdowns by session, weekday and hour, and warnings for small samples and too many rules.
  - **Trade log** for each run: sortable columns (running balance stays in time order), direction and date filters, a "More filters" drawer (result, P&L, R, exit reason, session, weekday, entry hour, hold time) with removable chips and totals for the filtered trades, and a side drawer showing the trade on a chart.
  - **What-if on your real trades**: pick trades with journal filters, change one rule (losses per day, daily loss, hours, mistake tags, breakeven, target, tighter stop), compare actual vs what-if with deltas, overlaid equity and the list of changed trades (opens in the Trade Log). Price-path rules are labelled as estimates.
  - **Practice (manual replay)**: random date, a day like today, or your own journal trades rebuilt bar by bar, blind by default; play/step/speed/jump, higher-timeframe inset, horizontal lines, an order ticket with live reward:risk, breakeven/close half/close, tags and notes. Finishing a session awards Points once.
  - **Saved runs** with open, duplicate, share, delete, and side-by-side comparison of 2–3 runs (changed settings highlighted, best value with its lead, overlaid curves, one-line summary).
- **Closing the loop**: saving a run from a playbook stores it as that playbook's expected results. Playbook pages show "Backtest vs live" (expected vs actual, On track / Underperforming, live cumulative R against the expected range) and a "Backtest this playbook" button; the journal Overview has a "Strategy health" card. Entry points: "Replay this trade blind" on a journal entry and in the Trade Log selection bar, and "Try a what-if" in Insights. Results can be sent to the playbook's review notes or added to tomorrow's plan as a scenario.
- **Plan, Credits, Points**: automated runs per month by member level, an extra run for 15 Syde Credits (spent, never "debited"), and Points for finished replay sessions and saved runs. What-if and replay are free.
- Mock market data (7 instruments, 5-minute bars from Oct 2024 to Oct 2026), configurable values in `src/backtest/config.ts`, engine tests (`npm test`) and docs in `docs/BACKTESTING.md`.

## [1.0.134] - 2026-10-07

### Added

- Playbook analytics: ⓘ hover/focus explanations for each metric (win rate, profit factor, avg win/loss, target hit) showing this playbook's own calculation, plus explanations for the rolling chart, by-playbook comparison, results in R and scenario management.

## [1.0.133] - 2026-10-07
### Changed
- Playbooks: the Analytics panel (metric cards, rolling chart, by-playbook comparison, R vs target, scenario stats) now sits directly under the playbook header for every step, with Hide/Show, instead of only inside Review. The rolling chart is shorter.

## [1.0.132] - 2026-10-07
### Added
- Playbook analytics (Review step): win rate, profit factor, avg win/loss and target hit rate (share of trades reaching the playbook's minimum R) as selectable cards, a rolling 10-trade line with reference line and hover details, a by-playbook comparison, an R-outcome distribution against the target, and scenario management stats (status counts, trigger rate, average planned R:R, trades from scenarios vs others).
- Execution replays: every trade in Execution and Best executions has a Replay button. The replay window can record a short screen capture (up to 60s, via the browser's screen share) or attach a video file, plays it back, downloads or removes it, and shows an animated trade-path schematic (entry → exit against stop and target; clearly labelled as drawn from journal numbers, not tick data). Recorded trades are marked and listed under "Your execution replays".
- Journal entries logged from a scenario keep a link to it (scenarioId) for the scenario stats.

## [1.0.131] - 2026-10-07
### Fixed
- New journal entry: when Next is disabled on the first step, the footer now says why (e.g. "Add entry price and size to continue", a stop/target on the wrong side, or which tab to use).
- Logging a trade from a playbook without a scenario now prefills the playbook's first instrument as the symbol.

## [1.0.130] - 2026-10-07
### Changed
- Playbook checklist is now guidance, not a gate: it shows "x of N ticked" with a completion bar and a setup label (Light, Partial, Strong, Full), and "Log trade with this playbook" is always available. The ticked house checklist items are still saved on the new entry.

## [1.0.129] - 2026-10-07
### Added
- Playbooks: the grade tooltip now explains each variable (profit factor, average R, plan followed, trades) in plain language.

## [1.0.128] - 2026-10-07
### Added
- Playbooks: hovering or focusing a grade badge shows the grading criteria (A+: PF ≥ 2.5, avg ≥ +0.5R, plan ≥ 85%, 30+ trades; A: PF ≥ 2.0, ≥ +0.3R, plan ≥ 80%, 20+; B+: PF ≥ 1.5, ≥ +0.2R, 15+; B: PF ≥ 1.2, avg R > 0, 10+; C: below B or under 10 trades), this playbook's numbers, the grade the data suggests versus the one you set, and what is needed for the next grade. The Edit form shows the suggested grade next to the grade picker.

## [1.0.127] - 2026-10-07
### Changed
- Playbooks: inventory is now a compact side list (280px, two lines per playbook: name, grade, net P&L; instruments, win rate, profit factor) with an open-scenarios link, a scroll area and sticky position; the detail panel gets the extra width.

## [1.0.126] - 2026-10-07
### Added
- Playbooks: instruments per playbook (symbol chips with trade counts, editable in Edit playbook, searchable) and a "By instrument" table in Review.
- Playbooks: Scenarios step (Setup → Rules → Scenarios → Checklist → Execution → Review). Traders write their own hypothesis per playbook: symbol, long/short bias, "If … then …" statement, trigger, entry/stop/target with planned reward:risk checked against the playbook minimum, valid-until date and status (Watching, Triggered, Invalidated, Closed). Scenarios can be edited, deleted, invalidated, closed or reopened; expired ones are flagged.
- "Check and trade" links a scenario to the Checklist step; "Log trade" then opens a new journal entry prefilled with the playbook, ticked checklist, symbol, direction, entry, stop, target and the hypothesis as notes, and marks the scenario Triggered.
### Changed
- Playbook inventory cards simplified: name, grade, session, instruments, net P&L and one stats line, with links to open scenarios and "+ New scenario".

## [1.0.125] - 2026-10-07
### Changed
- Strategy Playbooks: each playbook now follows one flow, Playbook = Setup + Rules + Checklist + Execution + Review, shown as five steps.
  - Setup (kept): grade, style, markets, session, minimum reward:risk, thesis and tags.
  - Rules (new): numbered setup rules, per-playbook risk per trade and max trades per day (with how often the daily limit was broken in the journal), and "Do not trade when" conditions.
  - Checklist (extended): setup conditions plus the house pre-trade checklist in one live check with a valid/wait verdict, and "Log trade with this playbook", which opens a new entry with the playbook and ticked checklist items filled in.
  - Execution (extended): entry/stop/profit-taking rules, plan-followed rate, checklist completion from journal entries, average hold time, and the latest executions marked on/off plan with their mistake.
  - Review (new): trades, win rate, profit factor, expectancy, average R and net P&L, a cumulative R curve, on-plan vs off-plan results, most common mistakes, best executions, and a review log with Keep / Adjust / Pause / Retire decisions that update the playbook status.
- Edit playbook: risk per trade, max trades per day and no-trade conditions. Export includes risk limits, no-trade conditions and the review log.

## [1.0.124] - 2026-10-07
### Changed
- Journal Overview: with Custom range selected, the From/To date pickers now sit below the date range filter (with the range text under them) instead of beside it.

## [1.0.123] - 2026-10-07
### Added
- Journal Playbook tab rebuilt as Strategy Playbooks (light theme, after the uploaded concept):
  - Playbook library with grade/style badges, markets, session window (UTC), net P&L and total R, win rate, profit factor, avg win/loss and trade count computed from journal entries; "In session now" and last-traded indicators.
  - Market filter chips with counts, Active / Testing / Archived / All tabs, search, and sort by profit factor, net P&L, win rate, trades or grade.
  - Detail pane: ID, session, benchmark R:R, edge metrics (expectancy, average R, average hold time, plan followed), setup thesis and tags, an interactive execution-rules check ("x/y conditions met"), entry trigger / stop / profit-taking cards, and best executions with a stop/entry/exit level bar, View trade and "All trades in Trade Log".
  - Create new playbook, Import template (Silver Bullet 15m FVG, Opening Range Breakout, VWAP Mean Reversion), Edit (grade, style, status, markets, session window, benchmark R:R, thesis, rules, entry/stop/target, tags), delete for playbooks without trades, and Export to Markdown.
  - New playbooks appear in the entry wizard's setup list (archived ones are hidden).
- The pre-trade checklist and trading rules are kept under "House rules" on the same tab.

## [1.0.122] - 2026-10-07
### Added
- Insights › Day & Time: editable time zone (UTC, London, Frankfurt, New York, Chicago, Dubai, Bangkok, Singapore/Hong Kong, Tokyo, Sydney), remembered per browser. Weekdays, months, trade-time buckets, drill-down times and the session hours are shown in the chosen zone with daylight saving applied; market sessions stay fixed in UTC.

## [1.0.121] - 2026-10-07
### Added
- Journal Insights: report navigation (Overview, Day & Time) and a new Day & Time report in light mode, based on the uploaded concept:
  - Views Days / Month / Trade time (hourly, 2-hour, 4-hour) / Duration, date range, Broker / Market type / Playbook filters, session filter (Asia, London, London/NY overlap, New York PM, after hours, no entry time; UTC) and Export CSV.
  - Benchmark vs previous period (same-length window before the selected range) on cards, chart and table.
  - Insight cards: best window, leak window, most active window (with average hold time) and peak win rate.
  - Distribution chart (Net P&L, Win rate, Trades or Avg R) with hover details and click-to-drill.
  - Cross analysis matrix against Broker, Playbook, Symbol, Tag, Session, Duration, Position size or R-multiple.
  - Detailed breakdown table (trades, win/loss/BE %, net and gross P&L, PF, Avg R, cashback, points) with expandable session or weekday sub-rows, totals, peak/leak flags.
  - Drill-down panel and "Open in Trade Log", which opens the Trade Log filtered to those trades.
- Sample journal data: generated Aug–Sep 2026 trade history (58 trades with entry/exit times, brokers and commissions) so reports have enough data.

## [1.0.120] - 2026-10-07
### Changed
- Journal Overview: the Trading / + Cashback / Points and Gross / Net toggles are now dropdown buttons in the same style as the other filters (Show: Trading, Basis: Gross).

## [1.0.119] - 2026-10-07
### Changed
- Journal Overview: the Filters popover (single-choice selects) is replaced by checkbox dropdowns like the Trade Log: Playbook, Market type, Outcome and Broker, each showing ticked/total with Select all and Clear.

## [1.0.118] - 2026-10-07
### Changed
- Journal Overview: filter bar restyled to match the Trade Log controls (one row of same-height buttons: Date range, Filters, Broker checkbox dropdown, Trading / + Cashback / Points, Gross / Net). The broker checkbox row and filter card were removed.

## [1.0.117] - 2026-10-07
### Changed
- Trade Log: Market type and Broker filters are now checkbox dropdowns in the same row and style as Group, Any outcome and Columns (all controls share one height).

## [1.0.116] - 2026-10-07
### Added
- Trade Log: Market type and Broker checkbox filters (with counts, Select all / Clear). They drive the table, KPI cards, group subtotals, totals and export.

## [1.0.115] - 2026-10-07
### Changed
- Trade Log switched from the dark concept theme to the app's light theme (same layout and functions).

## [1.0.114] - 2026-10-07
### Changed
- Journal "Entries" tab is now the "Trade Log", redesigned from the uploaded dark concept: KPI strip (Cumul. Net P&L, Profit Factor, Win Rate, Avg Win/Loss, Realized R-Avg, Comms & Fees, plus Cashback and Points), bulk-action bar (Tag, Move Account, Export CSV, Delete, Deselect with selected-trade subtotals), filter, Group by (Instrument, Broker, Playbook, Side, Outcome) with group subtotals, column picker, sortable table with new Broker, Cashback, Points and Comm. & Fees columns, Total and Selected sum rows, per-page and pagination.
- Sample journal entries now carry execution times and commissions.

## [1.0.113] - 2026-10-07
### Changed
- Journal Overview: filter toolbar is now one card with a row for Date range, Filters, Trading / + Cashback / Points and Gross / Net, and a second row with the broker checkboxes (moved up from the cumulative chart).

## [1.0.112] - 2026-10-07
### Changed
- Cumulative chart table view: brokers are now rows (Date, Broker, Entries, Day, Cumulative) with a Total row per date, instead of one column per broker.

## [1.0.111] - 2026-10-07
### Changed
- Journal Overview: the selected date range text now sits below the date range filter instead of beside it.

## [1.0.110] - 2026-10-07
### Changed
- Journal Overview: the "Cashback only" option is now "Points". It shows estimated MarketSyde Points (base points per lot by asset class: Forex 50, Indices 60, Commodity 55, Crypto 60) in the KPI card, cumulative chart and calendar, in "pts" instead of dollars.
- "Sync data" moved from the Overview toolbar to the Trading Journal page header.

## [1.0.109] - 2026-10-07
### Changed
- Journal cumulative chart: replaced the Combined / By broker switch with broker checkboxes (Select all / Clear). The ticked brokers drive the chart, KPIs, calendar and recent entries; with two or more ticked the chart shows a Total line plus one line per broker.
- Removed the Brokers popover from the Overview toolbar (duplicated by the checkboxes).

## [1.0.108] - 2026-10-07
### Added
- Journal Overview: Brokers filter (select one or several brokers) that drives the KPIs, cumulative chart, calendar and recent entries.
- Journal Overview: Cashback switch (Trading / + Cashback / Cashback only). Cashback is the stored amount or the broker's rate per lot x lots for Forex, Commodity and Indices trades.
- Cumulative chart: Combined / By broker view with per-broker lines, clickable legend, per-broker tooltip and table columns.
- Calendar: per-broker colour dots and per-broker split on hover.
- Journal entries can carry a broker (Broker field in the manual entry form); entry rows show broker and cashback.
### Removed
- Duplicate "New entry" button in the Trading Journal header (Sync data in the toolbar opens the same window).

## [1.0.107] - 2026-10-07
### Added
- Journal Overview: cumulative P&L chart (follows range, filters and Gross/Net) with hover tooltip, keyboard navigation and a table view.
- Journal Overview: Discipline score, Personal rules monitor (max trades/day, stop after losses; percent-based rules show "Not tracked" until an account balance is available) and Tilt monitor (recent losing streak, negative emotions, off-plan trades, revenge/overtrading signals).

## [1.0.106] - 2026-10-07
### Removed
- Removed the "You haven't journaled today" banner (Write an entry) from the Journal Overview.

## [1.0.105] - 2026-10-07
### Added
- Journal Overview: toolbar with date range (calendar month, last 7/30 days, all time, custom), Filters (playbook, asset class, outcome), Gross/Net P&L toggle and Sync data shortcut, mirroring the Stitch Connect & Ingest header.
- Journal Overview: P&L and profit factor KPIs that follow the range, filters and Gross/Net choice.
- Journal Overview: the 5-week heatmap is now an interactive month calendar (month navigation, daily P&L colouring, click a day to list its trades, keyboard accessible).

## [1.0.104] - 2026-10-07
### Changed
- Renamed the journal entry "Auto-Sync" tab to "Sync Account".

## [1.0.103] - 2026-10-07
### Changed
- Journal Auto-Sync tab now uses the real MarketSyde broker directory (names, verification, score, cashback, platforms, regulators, category filters, linked accounts) and opens the existing Link Trading Account flow, replacing the placeholder connector list.

## [1.0.102] - 2026-10-07
### Added
- New journal entry window now has the Stitch Connect & Ingest functions: Upload Statement (CSV drop zone, automatic header mapping with manual override, duplicate skipping by ticket id, batch import) and an Auto-Sync connector preview (demo only, no live broker sync). Entries gain an optional ticketId.

## [1.0.101] - 2026-10-07
### Changed
- Journal manual entry: LONG/SHORT direction labels, Playbook setup dropdown in the ticket form, live Gross/Net P&L preview.
- Journal entry detail now shows stop loss, take profit (planned R:R), commissions, net P&L and entry/exit timestamps when provided.

## [1.0.100] - 2026-10-07
### Added
- Journal "New journal entry" manual trade form now matches the Quick Ticket Manual Entry Dock: added Commissions, Take Profit, Entry/Exit timestamps, planned risk:reward, and validation (exit after entry, SL/TP on the correct side of entry).

## [1.0.99] - 2026-10-07
### Added
- Added ascending/descending sorting to the Upcoming economic events list headers (Time, Cur., Event, Imp., Actual, Forecast, Previous, Actions). Sorting applies within each day; blank values stay last.

## [1.0.98] - 2026-10-06
### Added
- Added a functional Indices tab to the calendar Markets panel with S&P 500, Nasdaq 100, and DAX 40 demo instruments.

## [1.0.97] - 2026-10-06
### Fixed
- Made timeline market headers deterministically select one market group and restore all markets when clicked again.

## [1.0.96] - 2026-10-06
### Fixed
- Stabilized timeline market-group filtering by centralizing asset-class normalization and adding explicit selected-state feedback to group buttons.

## [1.0.95] - 2026-10-06
### Changed
- Enhanced the calendar rail Personalize promotion with a neon glow, animated beacon, Promo badge, and motion-safe pulse.

## [1.0.94] - 2026-10-06
### Added
- Made chart true-range bars selectable to switch and highlight the 1H, 1D, 1W, or 1M horizon using the same market-unit conversion.

## [1.0.93] - 2026-10-06
### Added
- Added hover, focus, and click interactions to event-impact chart points with market-aware reaction details.

## [1.0.92] - 2026-10-06
### Changed
- Added a currency hashtag badge beside event-detail titles for easier scanning and sharing.

## [1.0.91] - 2026-10-06
### Changed
- Expanded event-impact volatility horizons to 1H, 1D, 1W, and 1M, with market-aware pip, point, and percentage move comparisons.

## [1.0.90] - 2026-10-06
### Changed
- Locked the calendar rail's AI Assistant entry for users below Level 3 and routed locked clicks to the existing upgrade prompt.

## [1.0.89] - 2026-10-06
### Changed
- Kept alert controls visible for all-day calendar events and assigned future all-day releases a one-day reminder default.

## [1.0.88] - 2026-10-06
### Changed
- Made the economic calendar table fit the available card width on desktop while preserving horizontal scrolling on narrow screens.

## [1.0.87] - 2026-10-06
### Added
- Added a neon animated `Personalize` promotion to the calendar side rail, linking to the existing profile/account personalization flow.

## [1.0.86] - 2026-10-06
### Changed
- Made Watchlist and Alert controls persistently visible in calendar event rows instead of revealing them only on hover.
- Added an Actions column label and accessible action titles for adding/removing watched events and alerts.

## [1.0.85] - 2026-10-06
### Changed
- Made AI Assistant the default calendar side-panel view and moved it to the first rail position.
- Added show/hide controls for the side-panel rail while keeping the active panel visible.

## [1.0.84] - 2026-10-06
### Added
- Added a demo Google Calendar sync card to the profile, including local connection state, last-sync status, and an option to include watched economic-calendar events.

## [1.0.83] - 2026-10-06
### Changed
- Expanded the adaptive upcoming-impact watchlist from the top 3 to the top 10 upcoming impactful events and updated its heading.

## [1.0.82] - 2026-10-06
### Changed
- Removed the duplicate Summary historical participation chart, range controls, projection legend, and sample-stat cards so Event Impact history is the single primary reaction visualization.

## [1.0.81] - 2026-10-06
### Fixed
- Connected the Summary historical chart to its forecast series so the inspected chart renders both history and a dashed forecast path.
- Added deterministic Actual/Forecast comparison rows for non-numeric demo events such as holidays and speeches, keeping the impact visualization populated without implying provider data.

## [1.0.80] - 2026-10-06
### Changed
- Made the event-impact visualization explicit: Actual and Forecast lines, true-range percentages, potential-range percentages, post-event price windows for 1H/1D/1W/1M, and dated news sentiment from the one-day pre-release window.
- Added related-article count and clearer impact-range labels to the dark analytics panel.

## [1.0.79] - 2026-10-06
### Added
- Added a combined event-impact chart with actual-versus-forecast history, surprise points, true-range bars, reaction windows, sentiment split, and potential-range visualization.

## [1.0.78] - 2026-10-06
### Changed
- Enabled multi-select Market Type filtering with inclusive filtering across selected markets.

## [1.0.77] - 2026-10-06
### Changed
- Made list-view currency symbols clickable through the existing instrument-page navigation callback.

## [1.0.76] - 2026-10-06
### Changed
- Set the economic calendar to open in List view by default.

## [1.0.75] - 2026-10-06
### Changed
- Removed the duplicate inline From/To date inputs; custom date selection remains available in the range picker.

## [1.0.74] - 2026-10-06
### Changed
- Made the adaptive top-three impact watchlist horizontally slidable with snap scrolling and desktop navigation controls.

## [1.0.73] - 2026-10-06
### Changed
- Replaced the single next-release panel with an adaptive top-three upcoming impact watchlist driven by the selected dates and active filters.

## [1.0.72] - 2026-10-06
### Changed
- Made each market-category header and event count clickable to apply that market type as the active calendar filter.

## [1.0.71] - 2026-10-06
### Changed
- Removed the `Other` option from the Market Type dropdown while retaining its illustrative events under All Markets.

## [1.0.70] - 2026-10-06
### Fixed
- Made populated multi-event instrument groups display their dummy event cards immediately instead of hiding them until group selection.

## [1.0.69] - 2026-10-06
### Added
- Added same-day illustrative Index, Stock, Commodity, and Crypto events with instrument tickers for immediate visibility in the default calendar view.

## [1.0.68] - 2026-10-06
### Changed
- Reworded the event-detail demo notice as an introductory explanation of the available research sections.

## [1.0.67] - 2026-10-06
### Added
- Added an `Other` market type with illustrative bond, credit, and sovereign-spread events and filter support.

## [1.0.66] - 2026-10-06
### Added
- Added deterministic Stocks earnings and Crypto flow demo events so every market-type filter has representative multi-event data.

## [1.0.65] - 2026-10-06
### Changed
- Made every instrument/currency group row actionable with linked mock detail data, including single-event groups.

## [1.0.64] - 2026-10-06
### Changed
- Single-event instruments now render directly as linked cards; multi-event instruments expose a clickable group header that populates the detail-card strip below.

## [1.0.63] - 2026-10-06
### Changed
- Made the below-calendar event-card strip visible by default for the active day; instrument selection now narrows the same linked card strip.

## [1.0.62] - 2026-10-06
### Changed
- Moved selected instrument-group details into a full-width panel below the calendar visualization.

## [1.0.61] - 2026-10-06
### Added
- Added clickable instrument group headers/counts that expand the group into a horizontal detail-card strip for all active events.

## [1.0.60] - 2026-10-06
### Changed
- Added per-instrument grouping and event-count badges inside each market category.

## [1.0.59] - 2026-10-06
### Changed
- Expanded visualization event cards with impact/country badges, release time, and Forecast/Previous/Actual values.
- Widened the timeline canvas so detailed cards remain readable across multi-day views.

## [1.0.58] - 2026-10-06
### Changed
- Clarified visualization badges so category counts represent the number of rendered event cards, while cards show impact labels instead of numeric impact levels.

## [1.0.57] - 2026-10-06
### Changed
- Grouped visualization event cards by market category with compact category labels and event-count badges.
- Added checkbox indicators to the Market Type filter menu.

## [1.0.55] - 2026-10-06
### Added
- Added a fullscreen control for the Economic Calendar visualization with browser exit and Escape-key synchronization.

## [1.0.54] - 2026-10-06
### Changed
- Reduced Economic Calendar sidebar padding, chart height, row spacing, and section gaps for a more compact layout.

## [1.0.53] - 2026-10-06
### Added
- Added a shared two-week calendar range option so the Visualization timeline can extend beyond a single week.

## [1.0.52] - 2026-10-06
### Changed
- Made single-day Visualization events render in a compact responsive card grid so the timeline fits the active data without a long vertical event column.

## [1.0.51] - 2026-10-06
### Changed
- Removed the duplicate lower calendar table from Visualization mode and made the timeline container fill its available calendar column.

## [1.0.50] - 2026-10-06
### Changed
- Refined economic indicator detail pages into a light provider-backed layout with release snapshots, affected-asset chips, news sentiment, and simulated market-reaction context.

## [1.0.49] - 2026-10-06
### Changed
- Timeline event cards now switch to the shared calendar table area and open the existing event detail flow when selected.

## [1.0.48] - 2026-10-06
### Changed
- Moved List mode into the Economic Calendar section using the existing white calendar table presentation and interactions.

## [1.0.47] - 2026-10-06
### Added
- Added an accessible Visualization/List toggle for switching between the economic-calendar timeline and the existing filtered event list.

## [1.0.46] - 2026-10-06
### Added
- Replaced the Next 24 hours strip with a responsive weekly Economic Calendar timeline linked to the shared impact filters, event details, and Calendar filters overlay.

## [1.0.45] - 2026-10-06
### Changed
- Stacked the `Calendar filters` descriptor below the Economic Calendar tab label for a compact vertical control layout.

## [1.0.44] - 2026-10-06
### Changed
- Added the visible `Calendar filters` descriptor and matching accessibility label to the Economic Calendar tab control.

## [1.0.43] - 2026-10-06
### Changed
- Replaced the Economic Calendar week-at-a-glance card with a tab-anchored dark date-range picker for custom calendar filtering.
- Added click-only and outside-dismiss behavior while preserving pinned picker interaction.
- Expanded the picker into a fixed responsive overlay with a two-column desktop layout and stacked mobile layout.

## [1.0.42] - 2026-10-06
### Added
- Added a replaceable mock economic-calendar provider contract with event snapshots, release state, surprise labels, affected assets, range metrics, overview tiles, and CSV export.
- Added week-at-a-glance event counts, maximum impact, next-impactful-event countdown, release/surprise labels, and export affordances to the calendar.
- Expanded indicator detail pages with affected assets, true/potential range scenarios, sentiment/news correlation, and market-structure context, plus actual-vs-forecast history visualization.

## [1.0.41] - 2026-10-05
### Reverted
- Restored the pre-API local-demo calendar and Summary, Forecast, Consensus, and Alerts indicator detail experience, including populated holiday demo content.
- Removed the latest Acuity API/streaming integration, event-route controls, and Corporate / Economic filter; preserved earlier calendar filters and instrument links.
- Saved the removed update in a local rollback backup so it remains recoverable.

## [1.0.39] - 2026-10-05
### Added
- Added Acuity API-shaped event metadata to calendar demo events and surfaced the payload on reusable indicator detail pages.

## [1.0.38] - 2026-10-05
### Added
- Added populated Australia S&P Global Composite PMI sample content with historical statistics, components, related indicators, forecasts, consensus context, and news.

## [1.0.37] - 2026-10-05
### Added
- Added a reusable Economic Indicator Detail feature with shared data across Summary, Forecast, Consensus, and Alerts views.
- Added structured analytical commentary, historical/forecast data, consensus comparison, components, related indicators, methodology, news, and alert management.

## [1.0.36] - 2026-10-05
### Changed
- Removed the Last, Previous, Forecast, and Unit snapshot cards from event detail pages.

## [1.0.35] - 2026-10-05
### Changed
- Removed the detail-page tag row and instrument/market/country/category summary cards per the requested layout.

## [1.0.34] - 2026-10-05
### Changed
- Added category-specific content for Forecast, Consensus, Alerts, Unit, and indicator description sections.

## [1.0.33] - 2026-10-05
### Added
- Expanded event detail pages with Summary, Forecast, Consensus, and Alerts tabs.
- Added historical data visualization, indicator context, related indicators, and release snapshots.

## [1.0.32] - 2026-10-05
### Added
- Added a linked instrument-symbol tag and instrument context summary to event detail pages.
- Instrument tags navigate directly to the corresponding Instrument Analysis detail view.

## [1.0.31] - 2026-10-05
### Added
- Added a dedicated instrument search field to filter calendar events by symbol, country, market type, or event title.

## [1.0.30] - 2026-10-05
### Changed
- Event titles now open a full-page event detail view with a back-to-calendar action.
- Preserved event actions and related content from the previous detail modal.

## [1.0.29] - 2026-10-05
### Added
- Made calendar currency tags clickable and connected them to Instrument Analysis detail pages.
- Added fallback instrument detail data for symbols without a dedicated mock instrument record.

## [1.0.28] - 2026-10-05
### Added
- Made the calendar filter columns sortable by drag and drop.

## [1.0.27] - 2026-10-05
### Added
- Added a Market Type filter with All Markets, Forex, Indices, Stocks, Commodities, and Crypto options.

## [1.0.26] - 2026-10-05
### Changed
- Expanded the Category filter with the full reference taxonomy and mapped each label to the existing calendar event data.

## [1.0.25] - 2026-10-05
### Changed
- Refined the Category filter menu to match the reference dropdown style with compact, full-width text rows.

## [1.0.24] - 2026-10-05
### Changed
- Replaced the expanded Economic Calendar filter panel with a compact, column-based filter bar matching the provided reference style.
- Added dropdown menus for date range, impact, countries, category, and timezone filters while preserving existing filtering behavior.

## [0.66.0] - 2026-09-15
### Added
- **TabMain Component (`src/components/common/TabMain.tsx` & `src/components/TabMain.tsx`)**:
  - Reusable folder-tab navigation component replicating the design from the reference image.
  - Features precise SVG inverted fillets (concave smooth bottom curves) transitioning cleanly into the lavender baseline border.
  - Active tab styling with solid white/dark background, subtle lavender borders, vibrant purple pill badge, and active text coloring.
  - Responsive horizontal scrolling with clean touch/mouse interactions.
- **Integrated TabMain into Trading Signals Page (`src/components/TradingSignalsPage.tsx`)**:
  - Replaced the previous pill buttons with the new `TabMain` component for categories (`All (99)`, `Forex`, `Indices`, `Stocks`, `Commodities`, `Cryptos`).

## [0.65.0] - 2026-09-15
### Reverted
- **Reverted 1024px Layout Width Constraint**:
  - Fully restored the original responsive layout width across all views and pages.
  - Removed explicit 1024px bounds from `src/index.css`, `index.html`, and `src/App.tsx`, restoring the full-width responsive container scaling.

## [0.64.0] - 2026-09-15
### Changed
- **Global 1024px Centered Body Layout**:
  - Configured global layout width across all pages to 1024px centered (`max-w-[1024px] mx-auto w-full`):
    - Added global `html` and `body` rules in `src/index.css` with a refined neutral backdrop on widescreen viewports and clean subtle elevation.
    - Updated `index.html` `<body>` and `<div id="root">` containers to ensure 1024px maximum width constraint and horizontal auto-centering.
    - Applied `max-w-[1024px] mx-auto` to the root application shell in `src/App.tsx` ensuring the sticky header, tab views, and all page contents consistently render within the centered 1024px layout grid.

## [0.63.0] - 2026-09-15
### Added
- **More Connected Brokers. More Opportunities Banner (1:1 with `Small Banner 3.png`)**:
  - Rebuilt the "More Connected Brokers. More Opportunities." section to replicate the reference image with pixel precision:
    - **Gradient Border Card**: Encased in an outer container with a vibrant gradient border running smoothly from `#5945F1` through `#A855F7` to `#FD02B0` around clean white interior with mathematical nested corner radius.
    - **Header Typography**:
      - Title: "More Connected Brokers" in purple `#5945F1`, amber/yellow period `.` in `#FACC15`, " More Opportunitie" in purple `#5945F1`, and magenta "s." in `#FD02B0`.
      - Subtitle: "Connect more broker partners and give your trades more ways to earn cashback." in refined slate-500.
    - **6 Broker Cards (XM, HFM, Exness, Pepperstone, IC Markets, FxPro)**:
      - **Verified Badges**: Chartreuse/lime badge (`✓ Verified`) accurately displayed on verified partners (XM, HFM, Exness) with equal height alignment preserved across non-badged partners (Pepperstone, IC Markets, FxPro).
      - **Custom Official SVG Logos**:
        - **XM**: Black background with white XM typography and signature red corner triangle.
        - **HFM**: Black background with white/red HFM lettering and "HF MARKETS" subtext.
        - **Exness**: Official yellow `#FFCC00` background with bold black "ex" branding.
        - **Pepperstone**: Royal blue `#0066FF` shield icon and "pepperstone" lowercase branding.
        - **IC Markets**: Black background with 3 green signal bars and "IC Markets Global".
        - **FxPro**: Deep red `#E61C24` background with white "FxPro" and "Trade Like a Pro".
      - **Cashback Rate**: `$8.00` in vibrant `#5945F1` font-mono bold with "Max Cashback" beneath.
      - **Connect Button**: White pill button with soft purple border and purple text matching the reference image.
    - **Explore All Brokers Action**: Centered solid purple `#5945F1` pill button at the bottom of the banner.

## [0.62.0] - 2026-09-15
### Added
- **Full-Width Dual-Axis Performance Chart & Summary Table (1:1 with `image.png`)**:
  - Rebuilt the dashboard performance chart and summary metric table to match the provided UI design reference 1:1:
    - **Top 4-Column Summary Table / Metric Row**:
      - `Total Cashback (1M)`: Displayed in bold vibrant purple `#5945F1` (e.g. `$0.00` or `$3,128.00`).
      - `Lots Traded`: Displayed in bold vibrant purple `#5945F1` (e.g. `0` or `163.6`).
      - `Avg Cashback / Lot`: Displayed in bold vibrant purple `#5945F1` (e.g. `$0.00` or `$19.12`).
      - `Best Day`: Displayed in bold vibrant purple `#5945F1` (e.g. `$0.00` or `$415.00`).
      - Spanned by a full-width subtle line divider underneath.
    - **Full-Width Dual-Axis Combo Chart**:
      - **Truly Full Width**: Rendered with responsive high-resolution SVG geometry (`viewBox="0 0 1000 320"` and `w-full`) that smoothly fills 100% of the available width on all viewports without horizontal scroll clipping or empty gaps.
      - **Left Y-Axis**: Scale from `$0` to `$100` with 10 intermediate intervals (`$10`, `$20`, ..., `$100`).
      - **Right Y-Axis**: Volume scale from `0 lots` to `10 lots` with 1-lot steps.
      - **Gridlines**: Soft lavender/indigo dashed horizontal lines (`#c7d2fe` with 5 5 dasharray) and solid baseline at `$0 / 0 lots`.
      - **Bars (Cashback USD)**: Light lavender/purple rounded bars (`#C4B5FD` with `rx="3"`) precisely positioned on active days (Days 1–12, 15).
      - **Line (Trading Volume Lots)**: Vibrant royal purple polyline (`#5945F1`, 2.5px width) tracing exact volume coordinates matching the design reference, plunging to baseline on zero days (Days 13–14) and terminating cleanly after Day 15.
      - **Interactive Tooltips**: Hovering over any day reveals a contextual tooltip with day number, cashback amount, and lot volume.
      - **X-Axis (Days 1 to 31)**: All 31 days aligned symmetrically under their respective slots.
      - **Legend**: Centered below chart with rounded square for `Cashback (USD)` and line marker for `Trading Volume (Lots)`.
    - **Signals Table**: Always rendered in full width on the dashboard, allowing immediate browsing and execution of market signals.

## [0.61.0] - 2026-09-15
### Added
- **Cashback Calendar Modal (1:1 with `Notification Card.png`)**:
  - Replaced and aligned the Cashback Calendar component to match the exact design in the uploaded UI screenshot:
    - **Header**: "Cashback Calendar" title with "Latest Update 15 Feb 2026 11:59PM HH:MM", clean horizontal divider, and top-right "Month" dropdown (`February`).
    - **Top Summary Banner**:
      - 2px gradient outline border (`#5945F1` to `#FD02B0`).
      - 3D wallet graphic with purple dollar coin badge (`$3,128.00` in royal indigo `#4338CA` and `163.6 Lots` below).
      - Dynamic area wave chart with soft purple gradient fill and smooth surge matching the UI curve.
    - **Calendar Grid**:
      - Plain text day of week headers (`Sunday` to `Saturday`) without enclosing container boxes.
      - 28-cell grid (February 2026, 4 rows x 7 columns) with 1px borders.
      - Status squares in top-right of each cell: solid purple for active trading cashback days, thin gray outline for non-trading days, and solid gray for unlogged/future dates.
      - Daily earnings and lot sizes (e.g. Day 1: `$155.00` / `8.2 Lots`, Day 7: `$415.00` / `22.0 Lots`, Day 17: `$265.25` / `13.9 Lots`).
    - **Action Buttons**: Centered "My Cashback" (white with purple border) and "Trade Now" (solid vibrant purple `#4F46E5`).

## [0.60.0] - 2026-09-15
### Added
- **Sidebar Fixed Sticky Scroll Layout ("side bar scroll fix")**:
  - Pinned the right sidebar with `lg:sticky lg:top-[84px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto` while allowing the middle/center content area to scroll freely and smoothly.
  - Added hidden sleek scrollbars (`[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`) so long sidebar contents remain accessible without disruptive scroll tracks.
- **Activity Carousel in Sidebar ("activity carousel with 4s auto-slide")**:
  - Implemented the dedicated `ActivityCarousel` component matching `UPS Next Milestone.png` and `UPS Pick up where you left off.png`:
    - **Slide 1: Next Milestone**:
      - Distinct gradient border with solid magenta `#FE01B1` "● Next Milestone" badge.
      - Blue gradient icon, "You're Connected. Nice!", "Start trading to get cashback", and "Trade Now" button linking to signals.
    - **Slide 2: Pick up where you left off**:
      - Gradient border with "Pick up where you left off■" header and "View >" link.
      - 3 interactive broker quick-action badges: `Axi` (vibrant red), `OANDA` (midnight navy with neon green tick marks and "SMARTER TRADING"), and `AVATRADE` (royal blue with "TRADE WITH CONFIDENCE").
  - Configured automated 4-second (`4000ms`) interval rotation with pause-on-hover capability and interactive pagination dots & arrows.
  - Integrated into both `EmptyStateDashboardView` and `ReferenceDashboard` customizable sidebar.

## [0.59.0] - 2026-09-15
### Added
- **Account Rejected State (1:1 with `03a. Dashboard - Account Rejected.png`)**:
  - Displays `Premium • 1100012001 • 🔴 Rejected ⓘ` with a distinct red status badge and interactive info icon.
  - Action buttons on the right of the account row:
    - `Reconnect`: Quick-action button in `#5945F1` to re-enter MT4/MT5 credentials or re-link broker account.
    - `Delete`: Dark button in `#0b1c30` to safely remove or unlink the failed account with a confirmation modal.
  - Interactive Rejection Info Modal explaining broker failure reasons (account number discrepancy, invalid read-only password, or archived status) and guidance on how to fix it.
- **Account Unavailable State (1:1 with `03b. Dashboard - Account Unavailable.png`)**:
  - Displays `Premium • 1100012001 • ⚫ Unavailable ⓘ` with a subtle slate/dark badge and interactive info icon.
  - Action button on the right of the account row:
    - `Go to 'Broker'`: Navigates to broker detail / official broker portal to check live maintenance or server status.
  - Interactive Unavailable Status Modal clarifying that broker API servers are temporarily offline or undergoing scheduled maintenance, and reassuring the user that pending cashback remains safe.
- **Interactive State Switcher Updated**:
  - Expanded the top state switcher bar to include all 7 lifecycle states:
    `1. Empty State`, `2. Pending Approval`, `3. Approved`, `3a. Rejected`, `3b. Unavailable`, `4. First Trade`, and `5. Active Performance`.
- **Confirmation & Notification Dialogs**:
  - Added Delete Account Confirmation modal with instant removal feedback via a floating toast alert.
### Added
- **Dashboard Sidebar Fixed Width at 300px**:
  - Aligned the dashboard layout structure to match other platform pages with a flexible content area (`flex-1 min-w-0`) and fixed 300px right sidebar (`w-full lg:w-[300px] lg:shrink-0`).
- **5 Comprehensive Dashboard Lifecycle States (1:1 with Design Files)**:
  - **1. Empty State** (`01. Dashboard - Empty State.png`):
    - Greeting: `👋 Welcome, Josh! Look alive. The market won't wait...`
    - Top Left: Quick Start Guide (4 numbered steps: Choose Broker, Link Trading Account, Trade as Usual, Earn Cashback).
    - Top Middle: Your Level (Rookie, 0/150 points, View Plan button).
    - Stats: 0 days streak (14 empty square dots), $0.00 cumulative cashback, 3D empty performance chart graphic with "Connect Broker" CTA.
    - Bottom: "Ready to connect?" with 6 verified broker cards.
  - **2. Pending Approval** (`02. Dashboard - Pending Approval.png`):
    - Greeting: `🥳 Oh look, you’re back!`
    - Top Left: "Your Connected Account" with HFM Premium account marked with orange dot `🟠 Pending Approval`, plus "Connect More &rarr;" and "Add Trading Account".
    - Performance: "Your Performance: March 2026" with pending state guidance.
  - **3. Trading Account Approved** (`03. Dashboard - Account Approved.png`):
    - Replaces pending status with green dot `🟢 Approved` and displays direct purple `Trade Now` action button.
  - **4. First Trade Completed** (`04. Dashboard - First Trade Completed.png`):
    - Your Level increases to `5/150 points` with `Don't stop now` highlighted.
    - Active streak increments to `1 days` with first square dot filled in purple.
    - Cumulative cashback displays `$8.00` and `1.6 Lots` with smooth area wave sparkline.
    - Top 3 Earning Assets displays donut chart with XAU/USD ($5.00), Dow Jones ($1.00), AUDUSD ($2.00).
    - Main Chart renders dual-axis Bar + Line chart ($0-$100 on left, 0-10 lots on right, Days 1-31 on X axis) with Day 1 data.
    - Lower Section renders full-width "Most Recent Signals." table with Asset filter, technical SL/TP levels, and execution actions.
    - Right Sidebar updates to display "Next Milestone: You're Connected. Nice!", "Your Winning Signals.", and "Tops Earning Points."
  - **5. Active Trading Performance** (`05. Dashboard - Active Trading Performance.png`):
    - Your Connected Account displays multi-broker accounts (HFM Approved, XM Approved, FxPro Pending Approval).
    - Level progress increases to `50/150 points` (33% progress).
    - Active streak updates to `12 days` (12 purple square dots, 2 empty).
    - Cumulative cashback updates to `$3,128.00` and `163.6 Lots`.
    - Dual-axis Chart displays multi-day trading activity across Days 1 through 15 with volume peaks and cashback bars.
- **Cashback Calendar Modal (`Modal - Cashback Calendar.png`)**:
  - Modal opens on clicking the Calendar icon in the timeframe bar or active streak card.
  - Header with "Cashback Calendar", "Latest Update 15 Feb 2026 11:59PM", and Month selector ("February").
  - Gradient-bordered summary banner with 3D wallet icon, `$3,128.00`, `163.6 Lots`, and smooth purple area wave.
  - 7-column calendar grid (Sunday to Saturday) with date numbers, solid purple trading indicators, cashback amounts (e.g. `$155.00`, `$415.00`), and trading lots.
  - Action footer buttons: "My Cashback" (linking to cashback overview) and "Trade Now".
- **Interactive State Switcher Bar**:
  - Added clean pill selector at top of dashboard allowing instant preview and switching between all 5 lifecycle states.

## [0.57.0] - 2026-09-15
### Added
- **Conditional Tab Rendering for Brokers (Cashback vs. Non-Cashback)**:
  - Brokers with cashback offer 3 tabs: **Cashback**, **Account**, and **Company**.
  - Brokers without cashback offer only 2 tabs: **Account** and **Company** (Cashback tab is fully hidden and auto-redirected).
  - Added dedicated right-hand card for non-cashback brokers highlighting direct institutional execution terms, spreads, leverage, and zero markup execution.
  - Interactive scenario toggle added in the tab header to preview both **Has Cashback** and **No Cashback** states on the fly.
- **Cashback Rebate Table Navigation (`BrokerRebateTablePage`)**:
  - Implemented full dedicated **Rebate Table page** matching `D02_Cashback Rebate Table_Default View.png`.
  - Added "View for all levels &rarr;" button in the Cashback Breakdown header linking directly to the full Rebate Table page.
  - Includes instrument breakdown tabs (Forex, Metals, Commodities, Indices, Cryptos, Energies, Stocks), comprehensive search filter, pagination, export, and account level rebate columns.

## [0.56.0] - 2026-09-15
### Added
- **Broker Detail Page: Connected to MarketSyde Scenario Support**:
  - Implemented the "Connected to MarketSyde" state toggle and UI across all 3 Tiers (`Tier 1`, `Tier 2`, `Offshore`) and all 3 Tabs (`Cashback`, `Account`, `Company`):
    - **Interactive Scenario Switcher**: Added seamless 1-click toggle between `Not Connected` and `Connected` alongside the Tier picker.
    - **Header Cashback Card**: Displays active connected badge (`● CONNECTED`), active cashback metric (`$8.00/lot`), and direct `Trade with HFM (Account #1100045789)` action button.
    - **Cashback Tab**: Displays verified connected trading account banner with active rebate status and member tier calculation.
    - **Account Tab**: Highlights connected trading account specifications (`Pro Account #1100045789`).
    - **Company Tab**: Provides MarketSyde Partner Priority Support and verified IB dispute resolution routing.

## [0.23.4] - 2026-09-14
### Changed
- **Full Width Layout & Unified 56px Left-Right Padding Across All Screens**:
  - Removed artificial `max-w-[1440px] mx-auto` restrictions from `<main>` and the sticky navigation `<header>`.
  - Configured full-width layout (`w-full`) with standard `px-[56px]` left-right padding across desktop and large screens (`px-4 sm:px-8 md:px-[56px]`), providing a spacious, seamless edge-to-edge experience.
  - Removed internal `max-w-7xl` and `max-w-[1080px]` restrictions from individual page containers (`MembershipPlanPage`, `ProfilePage`, `AccountSecurityPage`, and `ConnectToTruvoPage`), ensuring all pages expand uniformly to 100% width with the consistent 56px padding.
  - Aligned `<Footer>` horizontal padding with the rest of the application layout (`px-4 sm:px-8 md:px-[56px]`).

## [0.23.3] - 2026-09-14
### Changed
- **Revamped Brokers Mega Submenu (1:1 with Reference Screenshot `Nav Content Box.png`)**:
  - **Single Seamless Outer Card**: Restyled the dropdown container with a continuous white rounded card (`rounded-3xl border border-slate-200/90 shadow-2xl`) and elegant lavender/periwinkle backdrop curve (`bg-[#eff2fe] rounded-r-[130px]`) occupying the left feature area.
  - **Left Typography Block**: Aligned display typography (`REAL BROKER`, `COMPARISONS THAT`, `ACTUALLY MATTER.`) in signature purple (`#5945F1`) with bold weight emphasis.
  - **Interactive 1:1 Comparison Graphic (`InteractiveBrokersGraphic`)**:
    - **HFM Card**: Tilted -6deg white card with black HFM logo squircle, "HFM" label, purple "500+" stat, and "instruments" subtext.
    - **Exness Card**: Tilted +6deg white card with iconic yellow "ex" logo squircle, "Exness" label, purple "240+" stat, and "instruments" subtext.
    - **"VS" Overlap Badge**: Solid purple circular badge (`#5945F1`) with crisp white border positioned at the center intersection of both cards.
    - **Floating Badges**: Lime green circular dollar badge (`$`), tilted black XM logo tile, tilted red FxPro tile, and hot pink star badge (`#FE01B1`).
    - Added subtle smooth floating and hover interactive effects; clicking the graphic navigates to Broker Comparison.
  - **Right Menu Navigation**:
    - **Broker List**: Bold title with subtitle *"The ultimate broker directory. No blind dates, just total transparency."*
    - **Broker Comparison**: Paired with the solid purple indicator circle (`● bg-[#5945F1]`) and subtitle *"A head-to-head battle for your money."*
    - Dynamic hover tracking that smoothly highlights whichever option is hovered or active.

## [0.23.2] - 2026-09-11
### Changed
- **Comprehensive "View Plan" Navigation to Member Plan Page Across App**:
  - Matched the **"Move up. Earn More."** level promotion sidebar card 1:1 to the uploaded screenshot (`image.png`):
    - Added crisp 2px pink border (`border-[#FE01B1]`), `rounded-3xl` container, bold display typography with pink period (`.`), and subtext.
    - Updated progression stepper with purple "You" floating tooltip, filled purple circle, hot pink "Rookie" label (`#FE01B1`), divider line, and purple bordered "Climber" node.
    - Designed the solid purple `View Plan` pill button (`bg-[#5945F1]`) with active scale feedback and smooth transition.
  - Synchronized across all occurrences of the card (Trading Signals, Broker Listing, Broker Comparison).
  - Verified and routed **100% of "View Plan" buttons** across the entire application directly to the **Member Plan** page (`setActiveTab('member-plan')`), including:
    - Dashboard Level Card (Customizable Widgets & Empty State)
    - Signals Page Sidebar Level Card
    - Broker Listing Page Sidebar Level Card
    - Broker Comparison Page Sidebar Level Card
    - Broker Detail Page (Tier 1 & Tier 2 cashback upgrade prompts)
    - User Profile Page Level Card
    - Cashback Overview Page Level Card
    - Global Search Modal ("Plans" button)
    - Leaderboard Card

## [0.23.1] - 2026-09-11
### Changed
- **Direct Navigation from Dashboard "View Plan" to Member Plan Page**:
  - Wired the "View Plan" button on the purple **Your Level (Rookie)** card in the dashboard directly to the **Member Plan** page (`setActiveTab('member-plan')`).
  - Matched the button design and card typography precisely to the uploaded screenshot (`image.png`): solid white pill button with purple text, crisp contrast, proper spacing, and ⚡ lightning icon for "Higher Confidence Signals".
  - Added smooth scroll-to-top transition when switching to the Member Plan view so the user immediately sees the full tier roadmap and progression badges.
  - Aligned all corresponding "View Plan" action triggers across other views (broker listing, broker comparison, leaderboard, and profile) to route directly to the Member Plan page.

## [0.23.0] - 2026-09-11
### Added
- **Pixel-Perfect Membership Plan Page (`Membership plan - Member Lv.1.png`)**:
  - Implemented the complete standalone **Member Plan** page with exact visual fidelity to the uploaded design:
    - **Header Navigation Active State**: Wired the top navigation bar `Member Plan` link directly to this full page (`activeTab === 'member-plan'`) with high-contrast active state styling.
    - **Hero Section**:
      - Display headline: `You're a Rookie. For now.` with dynamic tier name adaptation.
      - Giant stylized brand statement: `Get More.` in vibrant indigo `#5945F1` with an authentic hot pink period (`.`) in `#FE01B1`.
      - Right-side subtitle: *"The higher your level, the better the cashback, perks, and rewards. Simple as that."*
    - **4 Connected Tier Cards Row**:
      - **Cute Cartoon Ghost & Callout**: Positioned directly atop Card 1 (Rookie), featuring the custom vector ghost with two vertical oval eyes, curved directional arrow, and lime green oval badge (`#CAEB0E`) with `You're here`.
      - **Card 1 (ROOKIE)**: Styled with a dual-gradient border (`#5945F1` to `#FE01B1`), black `● ROOKIE` tag, Cashback Standard rate, *"What you have now"* feature list, *"Don't stop now! The good stuff is waiting."*, and a progress bar showing `50/150 to Next Level` with gem icon.
      - **Card 2 (CLIMBER)**: Hot pink `● CLIMBER` tag, large `+5%` cashback boost rate, trading signal 75%-79% confidence, and *"How to get it? Just 100 points."*.
      - **Card 3 (PLAYER)**: Lime green `● PLAYER` tag, `+10%` cashback boost rate, trading signal 80%-89% confidence, and *"Earn 250 Points ."*.
      - **Card 4 (BOSS)**: Purple `● BOSS` tag, `+15%` cashback boost rate, 90%+ confidence signals, exclusive benefits, and *"500 Points"*.
      - **Horizontal Dotted Connectors**: Clean dotted arrow dividers (`········>`) linking each successive tier card across the progression flow.
    - **Bottom Call-to-Action Bar**:
      - Styled footer statement: *"Because staying at the same level is boring. A few more trades today. Better perks tomorrow."* with branded purple highlights and hot pink accent dot.
      - Direct **`Trade Now!`** button leading straight to broker/trading execution.
    - **Interactive Tier Level Switcher**: Top subtle controller allowing testing between `Rookie (Lv.1)`, `Climber (Lv.2)`, `Player (Lv.3)`, and `Boss (Lv.4)` with reactive placement of the ghost character and gradient border.
    - **Modal Synchronization**: Updated `ViewPlanModal` with direct navigation link to the full Membership Plan page.

## [0.22.1] - 2026-09-11
### Added
- **Card-Level "Compare" Action to Comparison Page Flow (Exact match to uploaded broker card asset)**:
  - Updated broker card in `BrokerListPage` to accurately match the uploaded reference card (`image.png`):
    - **Compare button**: Placed on the bottom-left of the broker card (`Compare`). Clicking it immediately navigates to the **Compare CFD Brokers** page (`broker-comparison`) and pre-selects that specific broker (e.g., XM) into Slot 1 of the comparison matrix.
    - **Trade Now button**: Updated label to `"Trade Now"` with authentic purple branding (`#5945F1`), rounded styling, and smooth click interactions.
    - **External Details button**: Styled `↗` link icon button for viewing the full broker profile.
    - **Refined XM Brand Logo**: Added stylized red/white diagonal logo matching official XM brand assets.
  - **State Synchronization & Auto-Loading**:
    - Connected `comparisonInitialBroker` state in `App.tsx` between `BrokerListPage` and `BrokerComparisonPage`.
    - Added automatic slot assignment logic so clicking "Compare" on any broker card (XM, HFM, Exness, IC Markets, Pepperstone, etc.) immediately injects that broker into the comparison matrix and displays a confirmation toast (`"Loaded [Broker] into Comparison"`).

## [0.22.0] - 2026-09-11
### Added
- **Compare CFD Brokers Full Page (`D02_Broker Comparison_Empty State.png` to `D08_3 Brokers Selected_Maximum.png`)**:
  - Implemented the complete 3-slot head-to-head comparison page with full support for both **Signed-In** and **Not Signed-In (Guest)** states.
  - **State Switcher Demo Controller**: Quick-switch bar on top of the page allowing reviewers and users to toggle between `[Signed In (Josh / Rookie rank)]` and `[Not Signed In (Guest)]` with immediate reactive UI changes.
  - **3 Comparison Slots**:
    - Supports empty state with `"Select a Broker"` prompt and dropdown.
    - Searchable floating broker selection popup with all 19 CFD brokers (HFM, XM, Exness, IC Markets, Pepperstone, FxPro, Tickmill, FP Markets, Vantage, Eightcap, Axi, AvaTrade, IG, OANDA, Capital.com, Deriv, Octa, JustMarkets, ATFX).
    - Selected broker card header with score, verified badge, remove (`✕`) action, and **`Connect Now`** CTA button:
      - **Not Signed-In State**: Prompted with the registration/sign-in modal (`AuthModal`).
      - **Signed-In State**: Navigates directly to the broker connection flow.
    - Popular broker chips below slots (XM, IC Markets, Pepperstone, FxPro, Tickmill, Eightcap) with 1-click slot insertion.
  - **Full Comparison Spec Matrix**:
    - **Cashback & Income**: Highest cashback per lot with `"Top Pick"` badge, estimated monthly earnings, rebate payment schedule, and eligible pairs.
    - **Costs & Spreads**: Spread types, lowest average spread, standard spread, raw commission, total cost per lot, slippage, and pip value.
    - **Account Details**: Account type variety, minimum deposit, maximum leverage, minimum lot size, instruments count, and supported platforms (`MT4`, `MT5`, `cTrader`, `App`).
    - **Currency & Execution**: Account currency, execution speed, decimal price levels, entry precision, minimum SL distance, and SL fill accuracy.
    - **Risk Management**: Margin call level, stop-out level, and margin buffer indicator.
    - **Trading Conditions**: Scalping, hedging, EA/algorithmic trading, swap-free Islamic accounts, copy trading, sessions, and negative balance protection with custom styled status pills.
    - **Direct Broker Profiles**: `"View [Broker] Profile"` buttons navigating to the Broker Detail page.
  - **Right Sidebar Widgets**:
    - **Move up. Earn More.**: Branded tier progression bar with `"You"` marker on Rookie climbing to Climber, with `"View Plan"` button and guest sign-up prompt.
    - **Most Recent Signals.**: Live signals widget for EUR/USD, GOOGL, BTC/USD (Premium Signal), S&P 500, and XAU/USD with sparklines and Buy/Sell/Upgrade actions.
  - **Most Viewed Broker Matchups**:
    - Gradient banner featuring top matchups (HFM, Exness, FxPro) with 1-click `"View full comparison"` auto-load preset.
  - **Navigation Integration**:
    - Added dedicated routing for tab `'broker-comparison'`.
    - Updated `Header.tsx` desktop hover menu and mobile menu with dynamic active indicators.
    - Connected comparison triggers in `BrokerListPage`, `BrokerDirectory`, and `TradingSignalsPage`.

## [0.21.4] - 2026-09-11
### Added
- **Connect to MarketSyde / Account Connection Flow (Exact match to `D12_Connect to MarketSyde.png`)**:
  - Implemented the full post-signup / registered user flow when clicking **"Get Cashback"**:
    - **Header Title**: `"Let's Get Your Account Connected."` with branded accents (`#5945F1` title, `#FE01B1` 'd', and `#CAEB0E` dot).
    - **Subtitle & Info Box**: Explanatory text and 2-3 business days approval notice with direct link to the Cashback dashboard.
    - **Tab Switcher**: Seamless toggle between `"Open New Account"` and `"Already Have An Account"`.
    - **Broker Showcase Card**:
      - Gradient border (`#5945F1` to `#FE01B1`).
      - Detailed HFM desktop and mobile trading conditions screen preview mockup.
      - Broker specs list (`Settlement Period: Weekly`, `Platform: MT4, MT5`, `Leverage: 1000`, `Min. Deposit: 5`, `Margin call/Stop out: 50% / 20%`, `Supported Currencies: EUR, JPY, THB, USD, IDR, NGN`).
      - Solid purple Highest Cashback box (`$8.00 / lot`).
    - **Numbered Flow Cards (Step 1 to Step 5)**:
      - **Step 1**: `"Create Account with <<Broker>>"`, sub-steps 1.1 (Open Broker Account) & 1.2 (Open New Trading Account), `"Go to <<Broker's Name>>"` action button, and Partner Code box with 1-click copy (`xyz123`).
      - **Step 2**: `"Pending Approval"` notice card.
      - **Return Platform Notification**: Pink/purple outlined banner highlighting the next steps after broker account approval.
      - **Steps 3, 4, 5 Connected Timeline Card**:
        - **Step 3**: `"Register Trading Account"` with `"Register to Marketsyde"` action button.
        - **Step 4**: `"Approval Status"` with `"Go to 'My Cashback'"` action button.
        - **Step 5**: `"Start Earning"` milestone.
    - **Already Have An Account Flow**: Instructions and account number submission form for existing broker account IB transfers.
  - **Routing Integration**:
    - When an authenticated/signed-up user (`isLoggedIn === true`) clicks **"Get Cashback"** on the Broker Detail Page, they are immediately brought to this page.
    - Newly registered users completing the `AuthModal` flow are also automatically routed directly to this page.

## [0.21.3] - 2026-09-11
### Added
- **Unregistered Guest Sign-Up Flow for "Get Cashback" (Exact match to `D12_Sign-Up.png`)**:
  - Implemented `AuthModal` component matching the reference design:
    - **Header**: MarketSyde logo (`#5945F1` + `#CAEB0E` dot), title `Sign up with MarketSyde`, subtitle `Explore the power of FX intelligence, copy-trade, and broker cashbacks.`
    - **Sign In / Sign Up Mode Switcher**: Seamless toggle between registration and existing account login.
    - **Interactive Password Validation Checklist**: Real-time validation criteria with green checkmarks:
      - At least 8 characters
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one number
      - At least one special character
    - **Password Visibility Toggle**: Eye icon to inspect entered password.
    - **Terms & Privacy Agreement Checkbox**: Custom styled checkbox.
    - **Sign Up Button**: High-visibility `#CAEB0E` button with active state.
    - **Social Auth Providers**: One-click registration options for Google, Apple, and Facebook with SVG logos.
    - **Login Prompt**: "Already have an account? Log In" link at the bottom.
  - **Integration in Broker Detail Page**:
    - When clicking the **"Get Cashback"** button or any registration prompts while not signed up (`isLoggedIn === false`), the `AuthModal` is automatically opened.
    - Upon successful sign-up or sign-in, the user state is updated, authentication is persisted, and the connection flow smoothly proceeds.
  - **Header Authentication State Sync**:
    - When logged out, the navigation bar displays `Sign In` and `Open free account` (`#CAEB0E`) buttons matching the design.
    - Users can also sign out from their profile menu to test guest flows at any time.

## [0.21.2] - 2026-09-11
### Changed
- **Broker Detail Page Header Layout Alignment**:
  - Aligned the top of the Broker Detail Page to match the reference design:
    - Clean Left Card: Purple-to-pink gradient border containing Broker Logo (`HFM / HF MARKETS`), `✔ Verified` pill, `Headquarter: Cyprus | Founded: 2009`, `Highlights` pill banner, and structured `Summary` with `● Offshore` pill and bullet list (`Min Deposit`, `Max Leverage`, `Platforms`, `Spread Type`, `Supported Currencies`).
    - Clean Right Card: Solid purple container with `Cashback with MarketSyde`, stacked `Estimated cashback` with `$8.00/lot`, `Lots trade per month` slider with white numeric indicator box (`25`), 2-column projected rewards (`$120/mth.` and `$1,440/yr.`), and full-width `Get Cashback` button.
  - Removed top intrusive tier switcher bar from the header area.

## [0.21.1] - 2026-09-11
### Changed
- **Header & Navigation Bar Cleanup**:
  - Removed redundant standalone "Profile" item from the desktop header navigation bar (`Trade`, `Brokers`, `Member Plan`, `Company`).
  - User profile & account management remain accessible via the user avatar & rank pill on the right side of the navigation bar.

## [0.21.0] - 2026-09-11
### Added
- **Broker Detail Page Multi-Tier Architecture & Scenarios**:
  - Implemented 3 distinct user tiers matching specifications:
    - **Tier 1 (Guest / คนทั่วไปที่ยังไม่ได้ register)**: Unregistered visitor experience with guest incentive banners, baseline rate calculations, registration incentives, beginner-friendly account comparisons, and one-click registration simulation modal.
    - **Tier 2 (Registered Member / คนที่ register แล้ว)**: Personal rank recognition, dynamic member multiplier calculations (+15% to +50%), partner IB code 1-click copy (`SYDE-TRUVO-888`), and direct broker account connection workflow.
    - **Offshore (Active Trader / trade มาแล้วระยะนึง)**: High-volume institutional specs, VIP Boss 1.5x automated boost, active connected account monitor (#1100045789), sub-account manager, deep liquidity (Raw 0.0, LD4 latency < 10ms), and multi-rail automated payouts (USDT TRC20/ERC20, Trading Balance, Bank Wire).
  - Implemented the 3 dedicated scenario views across each tier:
    - **Cashback Tab**: D03 (Tier 1), D06 (Tier 2), D09 (Offshore).
    - **Account Tab**: D04 (Tier 1), D07 (Tier 2), D10 (Offshore).
    - **About Company Tab**: D05 (Tier 1), D08 (Tier 2), D11 (Offshore).
  - Added an interactive User Tier Switcher bar in the top navigation of the Broker Detail Page for testing and switching between tiers seamlessly.

## [0.5.0] - 2026-09-09
### Added
- **Exact Search Results Command Palette View (Precise match to latest `image.png`)**:
  - **Category Tabs Navigation**:
    - `All`: Active tab with purple indicator underline (`#5945F1`).
    - `Trading Signals`: Purple badge with `99+`.
    - `Trading Calculators`: Purple badge with `11`.
    - `Converter Calculators`: Purple badge with `11`.
    - `Brokers List`: Purple badge with `25`.
    - `Broker Comparison`: Smooth interactive tab.
  - **Top Search Bar**:
    - Full width pill container with purple outline (`border-[#5945F1]`), magnifying search icon, and live typed query display (`Signal`).
  - **Section 1: Trading Signals (Positioned at Top)**:
    - `EUR/USD`: EU & US round flag badges, `BUY (Long Term)` (`#84CC16`), `70%` confidence (`#5945F1`), `Current Price: 1.0690` / `Target Priced: 1.0696`, and `▲ 20 - 29PIPS` expected move.
    - `GOOGL`: Authentic 4-color Google G emblem, `SELL (Intraday)` (`#4F46E5`), `74%` confidence (`#5945F1`), `Current Price: 1.0690` / `Target Priced: 1.0696`, and `▼ 25 - 40 PIPS` expected move.
    - `BTC/USD`: Orange Bitcoin coin emblem, `Premium Signal` indicator with diamond & info icons, level unlock notice ("Higher levels only. Connect broker and trade to unlock."), and direct `Plans` button.
    - `S&P 500`: Red circular `500` index badge, `BUY (Long Term)` (`#84CC16`), `71%` confidence (`#5945F1`), and `▲ 20 - 29PIPS` expected move.
    - `XAU/USD`: Gold bullion bars emblem, `SELL (Intraday)` (`#4F46E5`), `73%` confidence (`#5945F1`), and `▼ 25 - 40 PIPS` expected move.
    - Interactive `More ›` link leading to the signals page.
  - **Section 2: Trusted Broker Network**:
    - **HFM**: `Max Cashback: $8.00`, fuchsia `Top Pick` pill, and `Tier 1 Regulated` pill.
    - **Exness**: Canary yellow `ex` insignia, `Max Cashback: $8.00`, and `Tier 1 Regulated` pill.
    - **XM**: Black emblem with red accent & `XM` insignia, `Max Cashback: $8.00`, and `Regulated` pill.
    - Interactive `More ›` link leading to brokers directory.
  - **Header Direct Search Integration**:
    - Header search box allows direct typing and focus to open the command palette immediately.

## [0.4.0] - 2026-09-09
### Added
- **Command Palette & Search Modal (Exact match to `image.png` design)**:
  - **Search Activation**:
    - Clicking the search bar in the desktop header, tapping the search icon on mobile, or pressing `Cmd+K` / `Ctrl+K` opens the search modal.
    - Backdrop blur overlay (`backdrop-blur-md bg-slate-900/40`) with auto-focused search input container.
    - Search input matches reference design with purple outline (`#5945F1`), `Search...` placeholder, and `ESC` badge / clear icon.
  - **Section 1: Trusted Broker Network**:
    - Header with title and interactive `More ›` link navigating to the brokers directory.
    - 3 institutional broker cards:
      - **HFM**: Black emblem with `HFM` & `HF MARKETS` typography, `Max Cashback: $8.00`, `Top Pick` fuchsia badge, and `Tier 1 Regulated` badge.
      - **Exness**: Canary yellow emblem with signature bold `ex` insignia, `Max Cashback: $8.00`, and `Tier 1 Regulated` badge.
      - **XM**: Black emblem with red corner accent & bold `XM` insignia, `Max Cashback: $8.00`, and `Regulated` badge.
      - Clicking any broker card opens the connection modal.
  - **Section 2: Trading Signals**:
    - Header with title and interactive `More ›` link navigating to the signals page.
    - 5 institutional signal rows matching reference columns:
      - **EUR/USD**: EU/US flag badges, `BUY (Long Term)` in lime green (`#84CC16`), `70%` confidence rate in purple (`#5945F1`), `Current Price: 1.0690` / `Target Priced: 1.0696`, and `▲ 20 - 29PIPS` expected move.
      - **GOOGL**: Google four-color emblem, `SELL (Intraday)` in indigo (`#4F46E5`), `74%` confidence rate, and `▼ 25 - 40 PIPS` expected move.
      - **BTC/USD (Premium Signal)**: Bitcoin orange coin emblem, `Premium Signal` indicator with gem & info icons, locked status text ("Higher levels only. Connect broker and trade to unlock."), and direct `Plans` upgrade button.
      - **S&P 500**: Red index emblem, `BUY (Long Term)` in lime green (`#84CC16`), `71%` confidence rate, and `▲ 20 - 29PIPS` expected move.
      - **XAU/USD**: Gold coin bullion emblem, `SELL (Intraday)` in indigo (`#4F46E5`), `73%` confidence rate, and `▼ 25 - 40 PIPS` expected move.
      - Clicking any signal row opens the detailed institutional signal modal.
  - **Section 3: Spotlight Picks**:
    - Header with info tooltip icon.
    - 2 Canary-yellow (`#FFDE43`) promotional interactive banners:
      - **Banner 1**: Custom illustrated welcome card graphic with comic lettering, "Looking for an attractive banner to draw the subscriber's attention?", and black pill `ORDER NOW` button.
      - **Banner 2**: Custom illustrated interactive coupon window with character gesture, "Looking for a fun way to reveal your offers?", and "Go interactive with the Flip or Scratch effect!" subtitle.


## [0.3.0] - 2026-09-09
### Added
- **Precise User Dashboard Redesign (Matching `Dashboard; Desktop.png` exactly)**:
  - **Header Greeting & Customization**:
    - Two-tone display heading: `Oh look, you're ` in brand purple (`#5945F1`) and `back!` in vibrant magenta (`#FD02B0`).
    - Subtitle: "The market kept moving. Good thing you did too."
    - Top-right edit pencil button in rounded-xl container for trader greeting personalization.
  - **Top Row Bento Cards**:
    - **Card 1 (Ready to Trade)**:
      - Subtle pink/fuchsia border (`border-[#f0abfc]`), dual-tone title ("Ready" in `#5945F1`, "to Trade" in `#FD02B0`), and "Account connected and ready for trading." subtitle.
      - "Connected Accounts" tag pill + quick action links (`+ Add More Accounts ,` and `🔍 Explore Brokers`).
      - 3 interactive broker account status cards:
        - **HFM**: Premium account (`1100045789`), `Pending Approval` amber badge, dual-color progress bar, `Takes 2–3 days`.
        - **XM**: Ultra Low account (`1100098765`), `Pending Approval` amber badge, dual-color progress bar, `Takes 2–3 days`.
        - **FxPro**: Raw+ account (`1100034521`), `Approved` emerald badge, and full-width `Trade Now` action button triggering trade modal.
      - Bottom carousel pagination controls (`< • • • >`).
    - **Card 2 (Rookie Rank)**:
      - Royal purple card (`bg-[#5945F1]`) with custom Rookie Ghost SVG icon.
      - Dual-tone progress bar with magenta fill (`#FD02B0`), `50/150 points.` with gem icon, and volt-lime accent text `Don't Stop Now` (`#CAEB0E`).
      - Bottom perks: `Next level at 50 Points`, `+10% Cashback Boost`, and `Higher Confidence Signals`.
      - Interactive pill button `View Plan` opening the rank progression modal.
    - **Card 3 (You're Connected. Nice!)**:
      - Floating magenta milestone pill on top-right border: `● Next Milestone`.
      - Blue Exness badge with white stylized 'X' logo, "You're Connected. Nice!" heading, and "Start trading to get cashback" subtitle.
      - Dedicated `Trade Now` button triggering immediate trade flow and reward modal.
      - Bottom pagination controls.
  - **Lower Left Section: "Your Stats: March 2026"**:
    - Header with date subtitle, timeframe pills (`1D`, `1W`, `1M` with volt-lime active highlight, `All`), and calendar/grid toggles.
    - 3 metric blocks:
      - **ACTIVE STREAK**: 3D purple calendar tile with green checkmark, `12 days` bold display, subtitle, and 2-row green/volt-lime consistency heatmap.
      - **CUMULATIVE CASHBACK**: 3D blue circle coin and receipt icon, `$3,128.00` bold display, `163.6 Lots`, and smooth neon-lime wave chart filling the base.
      - **TOP 3 PERFORMERS**: Dropdown selector (`Earning Assets ⌄`), custom SVG 3-segment donut ring (Gold, Indigo, Magenta), and asset breakdown with icons:
        - 🪙 `XAU/USD` — `$1,150.00`
        - 🇬🇧 `Dow Jones` — `$1,035.00`
        - 🇦🇺 `AUDUSD` — `$943.00`
    - Secondary 4-column metric row: `Total Cashback (1M)`, `Lots Traded`, `Avg Cashback / Lot`, `Best Day`.
    - 4-tier horizontal dashed chart grid lines (`$100` to `10 lots`, `$90` to `9 lots`, `$80` to `8 lots`, `$70` to `7 lots`).
  - **Lower Right Section (Stacked Cards)**:
    - **Card A (Your Winning Signals.)**:
      - Header with purple highlight and `All Signals >` link.
      - 2x2 grid of white signal cards:
        - 🇪🇺 EUR/USD with green sparkline and `+0.33%`.
        - 🇬🇧 Dow Jones with purple sparkline and `-0.11%`.
        - 🇦🇺 AUDUSD with green sparkline and `+0.44%`.
        - ₿ BTC/USD with vibrant magenta callout: `Your next win?`.
    - **Card B (Tops Earning Points.)**:
      - Magenta border card with "No extra effort required." copy.
      - List of 4 earning assets with purple diamond icons:
        - 🇪🇺 EUR/USD → 💎 50
        - 🇬 GOOGL → 💎 35
        - 🪙 XAU/USD → 💎 20
        - 500 S&P 500 → 💎 20
      - Full-width `View More →` button navigating to Points & Credits center.

## [0.2.7] - 2026-09-09
### Added
- **Earning Reward Modals Full Flow Integration (Matching User Reference Designs Precisely)**:
  - **Earning - Modal of Quest Complete (+5 Credits)**:
    - 3D open purple gift box with neon volt-lime flaps, metallic silver and indigo coins bursting upward, and floating MarketSyde 3D sphere with white swirl `m`.
    - **`Yay!`** display heading in brand magenta (`#FD02B0`).
    - Exact copy: "You earned <span class="text-[#FD02B0] font-bold">5 credits</span> for login in today. Way to go!"
    - Primary full-width **`Nice!`** action button in `#5945F1`.
    - Auto-triggered upon claiming daily login streaks, Syde Credits daily bonus, and interactive demo triggers.
  - **Earning - Modal of Mission Complete (+5 Credits & Points)**:
    - 3D purple sphere with perched neon volt-lime crown, jewel studs, and flowing folded magenta ribbon.
    - Two-tone display heading: **`Mission `** in `#5945F1` and **`Complete!`** in `#FD02B0`.
    - Exact copy: "Wow, look at you go. <span class="text-[#FD02B0] font-bold">5 credits</span> are now in your balance!"
    - Full-width **`Nice!`** action button in `#5945F1`.
    - Auto-triggered when completing mission tasks (e.g. Portfolio Power-up, Market Watch, 7-day Explorer).
  - **Earning - Modal of Completing a Trade (+20 Points & +10 Credits)**:
    - 3D cylinder bar chart with ascending magenta arrow, lilac/lime multi-faceted gemstone, and 3D MarketSyde sphere.
    - Two-tone display heading: **`Look who's `** in `#5945F1` and **`active!`** in `#FD02B0`.
    - Exact copy: "Trading with your broker just got you <span class="text-[#5945F1] font-bold">20 Points</span> and <span class="text-[#FD02B0] font-bold">10 Credits</span>."
    - Full-width **`Nice!`** action button in `#5945F1`.
    - Auto-triggered when linking an account, executing/simulating trades from broker cards, or executing micro-lot simulations.
  - **Interactive Preview & Testing Controls**:
    - Added one-click preview bars on both the **Broker List** page (matching the exact background of the reference screenshots) and the **Mission, Points & Credits** page.
    - Added "Claim Daily +5 Cr" quick-action directly within the Syde Credits balance card.
    - Added "Trade & Earn (+20 Pts, +10 Cr)" directly on connected broker cards.

## [0.2.6] - 2026-09-09
### Added
- **Figma Design Tokens Alignment (Light & Dark Modes)**:
  - Exported and integrated full Figma design token palette into `/src/theme/tokens.ts` and Tailwind CSS v4 `@theme` configuration:
    - **Primary Brand Purple (`prime`)**: Complete scale from `0` (`#FFFFFF`) to `1000` (`#090119`), with core brand color `prime-500` (`#5945F1`), subtle cards `prime-100` (`#ECEEFA`), and background `prime-10` (`#FBFBFF`).
    - **Secondary Volt-Lime (`secon`)**: `secon-500` (`#CAEB0E`), accents `secon-200` (`#F0FCB1`), `secon-300` (`#E6FA76`), `secon-400` (`#DCF73B`).
    - **Tertiary Magenta Hot-Pink (`tert`)**: `tert-500` (`#FD02B0`), `tert-100` (`#FFD6F3`), `tert-200` (`#FE9AE1`), `tert-400` (`#FD35C2`).
    - **Neutrals & Slates (`neut`, `silver`)**: `neut-0` to `neut-1000`, `silver-0` to `silver-1000`, with brand silver `silver-200` (`#E2E8F0`).
    - **Status (`stat`)**: `success` (`#16A34A`), `warning` (`#D97706`), `destructive` (`#E03434`), `info` (`#0284C7`).
  - **Dynamic Theme CSS Variables**:
    - Added surface, border, and text token variables (`--bg-app`, `--bg-card`, `--border-default`, `--border-card`, `--text-primary`, `--text-secondary`).
    - Synchronized document `dark` class toggling with Header theme switcher.

## [0.2.5] - 2026-09-09
### Added
- **Activity Logs Dedicated View (Precise Match to Reference Design)**:
  - **Header & Visual Artwork**:
    - Dual-tone title: `Activity ` in `#5945F1` and `Logs` in `#FE01B1`.
    - Subtitle: "A complete record of every point you’ve earned and credit you’ve spent."
    - Top-right 3D vector art: Faint dotted lavender orbit ring with small indigo sphere and large magenta-to-indigo gradient sphere with soft drop-shadow.
  - **Filter & Date Bar**:
    - Left: `Result: Past 7 Days` dynamic status tag.
    - Right: Purple funnel filter button (`#5945F1`), white calendar button with purple border, and interactive popover matching reference with `Category` (All, Trades & Rebates, Missions, Daily Check-in, Expirations, Conversions), `Movement` (All, In (+), Out (-), Points Only, Credits Only), and `Done` action button.
    - Interactive Date Range selector with options (`Past 7 Days`, `Past 30 Days`, `This Month`, `All Time`).
  - **Summary Metrics (3 Cards)**:
    - **Activities this week**: 3D faceted star with upward arrow graphic, `24` value in deep navy display font.
    - **Points this week**: 3D multi-faceted colored gemstone, `+29` value in `#5945F1`.
    - **Credits this week**: 3D stacked dual-layer coins with lime rim, `+35` value in `#5945F1`.
  - **Activity Log Accordion Groups**:
    - **Today – Apr 26, 2026**: Lavender header bar (`#edf0fe`), `-15 Points` summary, `—` toggle, and detailed rows:
      - `Points expired` with pink stopwatch icon and `-25` points.
      - `Completed first trade` with trophy icon, `+10` points, `+35` credits.
      - `Daily login` with lime sparkle icon, `+5` credits.
      - `Viewed today's Signals` with lime sparkle icon, `+5` credits.
    - **Yesterday – Apr 25, 2026**: Lavender header bar, `+25 Points` & `+35 Credits` summaries, expandable list.
    - **Earlier – Apr 23, 2026**: Lavender header bar, `+115 Points` & `-475 Credits` summaries.
  - **Navigation Integration**:
    - Seamless jump from the sidebar Activity Log widget in Mission, Points & Credits.
    - Added "Activity Logs" shortcut inside the Header Profile dropdown menu.
    - "Back to Mission, Points & Credits" navigation bar.
    - "Open Full Page" quick-action from the Activity Log modal.

## [0.2.4] - 2026-09-09
### Added
- **Unified 2-Column Layout & Sidebar Exact Match**:
  - Aligned page architecture so the top 3 cards (Your Tier, Syde Credits, and Unlock Conversion) sit within the 8-column primary container on the left, running alongside the 4-column sidebar on the right.
  - **Hero Heading**: Updated to exact typography: `Mission, Points & Credits.` (`Mission, Points ` in `#5945F1`, `& Credits` in `#FE01B1`, and `.` in volt-lime `#c6f831`) with subtitle `Everything you’ve earned so far, plus what you’re currently missing out on.`
  - **Top Card 2**: Updated action button to `How to Earn >`.
  - **Top Card 3 (Unlock Conversion)**: Added 3D faceted diamond and coin icon with curved exchange arrow (`UnlockConversionIcon`), copy "Earn more credits or points to unlock conversion.", and `Learn More` action button (with instant toggle to converter when desired).
  - **Sidebar Widget 2 (Tops Earning Points)**: Outlined with crisp hot-pink border (`border-[#FE01B1]`), cleanly spaced asset rows (`EUR/USD`, `GOOGL`, `XAU/USD`, `S&P 500`), and centered solid purple `View More →` button (`bg-[#5945F1]`).
  - **Sidebar Widget 3 (Most Recent Signals)**: Framed with light gray container (`bg-[#f4f5f8]`), header with `Signals.` accent, `More >` button, and 2x2 grid featuring mini sparkline charts and BTC/USD 💎 Premium badge.

## [0.2.3] - 2026-09-09
### Added
- **Mission Tab & Component Redesign (Precise Design Match)**:
  - **Filter Tabs**: Added pill active tab styling with lavender border, purple text (`#5945F1`), and circular count badge (`3` on All Missions, `2` on Active, `1` on New).
  - **Card 1 (Portfolio Power-Up)**:
    - Full-bleed rich royal purple canvas (`bg-[#5338ec]`) with custom 3D candlestick chart badge with fluorescent volt-lime zigzag trendline.
    - Glassmorphism badge tags (`Expires in 5 Days`, `+15 Points`, `+25 Credits`).
    - Right-aligned progress capsule (`1/3 Completed`) and square toggle button (`−` / `+`).
    - Nested high-contrast white card for active subtasks with custom action buttons (`Add Asset`, `Set Position`) and completed state with emerald checkmark badge (`Rebalance Your Holdings`).
  - **Card 2 (Market Watch)**:
    - Clean white card with dual-color title (`Market` in `#5945F1`, `Watch` in `#FE01B1`).
    - Semicircular hot-pink / magenta crescent dome (`linear-gradient(135deg, #FF007A, #FE01B1)`) in the right corner housing the `0/3 Completed` progress pill and square plus button.
    - Soft pink outline badges (`Daily`, `+15 Points`, `+25 Credits`).
  - **Card 3 (7-Day Explorer)**:
    - Clean white card with title in `#FE01B1` and large volt-lime crescent dome (`#c6f831`) in the right corner housing the `3/7 Completed` capsule and plus button.
    - Lime-accented badges (`Expires in 7 Days`, `+300 Credits`).
- **Sidebar Widgets Redesign (Precise Design Match)**:
  - **Widget 1 (Activity Log Card)**:
    - Glowing gradient border container (`#6366f1` to `#FE01B1`).
    - 3-level battery / power meter squircle (yellow, lime, green bars) with direct link to the Activity Log modal.
  - **Widget 2 (Tops Earning Points)**:
    - Custom dual-flag icon for EUR/USD (`DualFlag` EU + US split flag).
    - Google colorful G icon for GOOGL (`GoogleIcon`).
    - 3D Gold bullion bar icon with gold sheen for XAU/USD (`GoldBullionIcon`).
    - Red 500 circular badge for S&P 500 (`Sp500Badge`).
    - Direct modal inspection when clicking each instrument, and "View More" button.
  - **Widget 3 (Most Recent Signals)**:
    - Clean 2x2 grid container with light slate canvas (`#f8f9fc`).
    - Responsive instrument cards for EUR/USD (+0.33%), GOOGL (-0.11%), BTC/USD (Premium badge with faceted gem), and S&P 500 (+0.44%).
    - Direct routing to the trading signals view.

## [0.2.2] - 2026-09-09
### Added
- **User Profile Dropdown Menu (Exact Match to Design)**:
  - **Dropdown Trigger**: Clicking the user profile pill in the navbar toggles the dropdown menu with outside-click dismissal.
  - **Mascot Header Card**: Top section features the purple arcade ghost mascot (`#5945F1`), current rank title (`Rookie`), horizontal progress bar, purple diamond gem indicator with live points (`0/150 pts.`), and an edit pencil button.
  - **Direct Points & Missions Link**: Clicking either the top mascot header card or the **"Points and Credits"** menu item directly opens the comprehensive Points, Credits & Missions page.
  - **Precise Menu Items**:
    - **Dashboard** with 2x2 grid icon (`LayoutGrid`).
    - **Cashback** with circular dollar icon (`CircleDollarSign`).
    - **Profile** with silhouette icon (`User`).
    - **Points and Credits** with faceted diamond icon (`Diamond`).
    - **Account Security** with shield icon (`Shield`).
    - **Notifications** with bell icon (`Bell`) and vibrant purple unread badge (`1`).
  - **Theme Toggle Segmented Control**: Integrated pill controller with Light (Sun) and Dark (Moon) mode buttons.
  - **Sign Out Button**: Centered rounded outline button with purple accent typography and active feedback.
### Changed
- **Navigation Bar Component (High-Fidelity Match to Design)**:
  - **Logo**: Updated MarketSyde logo icon with signature purple circular badge, flowing calligraphic 'm' loop in crisp white, and volt-lime fluorescent accent dot alongside `market`**syde** wordmark.
  - **Desktop Navigation Links**: Aligned desktop header navigation strictly to `Trade ⌵`, `Brokers ⌵`, `Member Plan` (direct link), and `Company ⌵`.
  - **Search Input**: Updated search pill container with light lavender/indigo rounded border (`border-indigo-200/90`), 12px border radius, search icon, and `Search...` placeholder.
  - **User Profile Pill**: Redesigned user profile pill with matching rounded container, white user silhouette box with floating purple notification badge at top-right corner, user greeting (`Hi, Josh`), and arcade purple ghost icon (`👻`) with rank label (`Rookie`).
  - **Submenu Access**: Ensured Missions, Points & Credits, and Community Floor are readily accessible through the Company menu and profile interactions.

## [0.2.0] - 2026-09-09
### Added
- **Credit Earning Guide**: Added dedicated full-fidelity Credit Earning Guide page matching reference design:
  - Hero section with dual-color typography (`Credit Earning Guide.`) and animated orbital graphic with hot pink orb.
  - "How Do Credits Work?" 5 distinct colored bullet points.
  - 10-item Activity rewards table with faceted gem icons and orbital satellite trajectory background.
  - Interactive pagination controls.
  - "Got Questions?" FAQ accordion.
- **Level Points Guide**: Interactive instrument level points guide with dual flags, booster multiplier badges, lot-size calculator, and FAQ.
- **Card Navigation Linking**: Linked "Learn More" on Rookie Card to Level Points Guide and "Learn More" on Syde Credits Card to Credit Earning Guide.
- **Discord Community Icon**: Updated social footer with official Discord icon and copyright 2026.

## [0.1.0] - Initial Release
- Bento Grid Dashboard, Trading Signals, Cashback Overview, Calculators, Missions & Points.
