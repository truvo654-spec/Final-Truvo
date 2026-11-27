# MarketSyde · Multi-Broker Dashboard: update blocks v23–v34

These are the update blocks that Claude added to the Multi-Broker Dashboard prototype, plus a test setup and a change log.

**This folder does not run by itself.** Each block adds to `multi-broker-v22b.js` in the prototype artifact (*Trading journal, Point, Diamonds, Cashback, Dashboard from Dolly 18.11.2026*). That artifact holds the full project, with all its other features and files.

Block v24 came from a different chat and isn't included here.

## How the blocks fit in

`multi-broker-v22b.js` runs as one self-contained function (an IIFE). Each block is pasted into that function, in version order, directly before this line:

```
/* ============================ BOOT ============================ */
```

How the blocks work:

- **Layering.** A block changes earlier behaviour by wrapping an existing function, for example `var _x = fn; fn = function () { … }`. A later function declaration with the same name also replaces the earlier one.
- **Shared names.**
  - State lives in `S`.
  - Click actions are entries in the `H7` map, triggered by `data-a` / `data-v` attributes in the markup.
  - `render()` redraws the dashboard.
- **Checking.** The blocks for v29–v34 in this folder match the live prototype file byte for byte. This was checked against the file size after each publish.

## Change log (what each block does)

| Block | Feature |
|---|---|
| v23 | Strategy books: assign more than one strategy book to a position (Holdings). |
| v25 | Drill-downs: one shared details panel for KPI tiles and charts. Also: Compare drill-downs, the Long/Short split, data-feed rows and alert targets. |
| v26 | View switch: **Portfolio status / Open positions** in the filter bar. In Open positions view, each tab gets the Open positions card (KPIs, last-known and unavailable notes, the By instrument and By account charts). |
| v27 | Risk widgets: Margin risk by account, Stop-loss coverage, Equity drawdown. Also keeps the selected account and portfolio in sync. |
| v28 | Chart types: diverging bars (Overview P/L by instrument), bullet chart (margin level vs broker stop-out), stacked bar (stop-loss coverage), and an underwater drawdown chart you can hover, tap or move through with the arrow keys. |
| v29 | The Monitor view bar moves **inside the Open positions card**. Tabs: Charts · Tiles · Holdings · Matrix · Map · Exposure · Margin risk · Stop-loss · Drawdown, with Alerts on the right. Portfolios uses the same card. Overview's P/L-by-instrument bars now open the details panel. Also fixes a bug that stopped clicks working on the Monitor and Portfolios tabs. |
| v30 | Data consistency. See below. |
| v31 | About 70 extra closed trades (25 Oct – 24 Nov) so every account × direction × date range has data. See below. |
| v32 | Monitor › Portfolio status gets the same tab bar, with a Portfolio status header showing Equity, Realized P/L, Closed trades and Win rate. Your selected tab stays selected when you switch views. |
| v33 | **Long / Short split** in the Charts tab. Colour means direction (olive = Long, purple = Short). Whether a bar is a gain or a loss is shown by which side of $0 it sits on and by its +/− sign. |
| v34 | Portfolio status draws **the same views** as Open positions. Only the data underneath changes (see below). Portfolios › Portfolio status gets the card too. |

### v30 in detail

- **Connected accounts.** Accounts added through Connect all had the same placeholder data. Each one now gets its own positions, and its P/L, equity and margin are worked out from those positions. They also get equity and margin history.
- **Pepperstone.** Added a Pepperstone broker record: logo colour plus a demo stop-out level.
- **Manage tab.** The Connection column no longer shows "undefined". "Need attention" and "Cashback this month" are now counted from the accounts instead of being fixed numbers.
- **Margin meter.** Shows each broker's own stop-out level.
- **Portfolios filters.** The tab views follow the portfolio and Long/Short filters.

### v31 in detail

The extra trades follow these rules:

- XM stops at its last snapshot (21 Nov).
- IC Markets ••7724 has none.
- Today's trades all close before the 11:58 snapshot.

### v34 in detail

- **Open positions:** positions open at the latest snapshot.
- **Portfolio status:** closed trades in the date range, grouped by account, instrument and side. Size is the volume traded; P/L is realized.

## Which filters each tab responds to

| Tab | Account / portfolio | Long / Short | Date range |
|---|---|---|---|
| Charts, Holdings, Matrix, Map, Exposure | Yes | Yes | Portfolio status only |
| Stop-loss | Yes | Yes | No (positions open now) |
| Margin risk | Yes | No (covers the whole account) | No |
| Drawdown | Yes | No (covers the whole account) | Yes |
| Tiles | Yes | – | Same in both views |

## Demo data (not real)

- Positions exist only at the 24 Nov 11:58 snapshot.
- Broker stop-out levels are demo values.
- XM doesn't send stop-loss fields; this is simulated.
- Equity and margin history are simulated.
- Data-feed sync times are demo values.
- Connected accounts and their history are generated from a fixed formula, so they're the same every time.
- Closed trades from v31 are generated.

## Test setup (`test-harness/`)

`harness.html` loads `bundle.js`. That file contains simplified stand-ins for the dashboard's core functions, with blocks v25–v34 applied on top. The stand-ins copy the real code's names and markup, but not every behaviour. Date handling in particular is simplified.

To run the tests (needs Node and Playwright):

```
cd test-harness/tests
node t29b.js   # Open positions card: tabs, Margin risk, Stop-loss, Drawdown, desktop + phone
node tpfb.js   # Portfolios tab uses the same card; analytics untouched
node tclick.js # every tab stays clickable (repeats the frozen-click bug and checks the fix)
node t30.js    # connected accounts: P/L, equity and margin add up; Manage has no "undefined"
node t31.js    # closed-trade history: no empty account × direction × date combination
```

All checks pass. `t30.js`, `t31.js` and `tclick.js` print their results rather than PASS lines.

`screenshots/` holds reference captures from the test setup.
