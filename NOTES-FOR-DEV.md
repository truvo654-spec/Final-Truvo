# Notes for developers

Last updated 9 Oct 2026, at v2.0.1 on `main`.

## What landed

The rewards system now follows the Final Beta workbook **v2.9** (20 Oct 2026).
Everything the workbook could express as code is in `src/data/`, and nothing
should keep its own copy of those numbers.

| File | What it holds |
| --- | --- |
| `rewardRules.ts` | Every setting: level starts, cashback shares, unlock discounts and lengths, the caps, expiry lives, boost ranges, conversion |
| `rewardsLedger.ts` | The dated ledger: expiry, oldest-first spending, repeat decay, the cap groups |
| `featureAccess.ts` | 63 features: who gets each one free, who may buy it, and what each length costs |
| `creditMissions.ts` | 131 missions including the social quests, each with its cap group |
| `pointsEarning.ts` | Every way Points are earned, including the four that pay none |
| `creditSpending.ts` | What Credits buy, and what they never buy |
| `rewardsCalculator.ts` | The workbook's calculator as functions |
| `adminRequirements.ts` | 36 Admin panel requirements across 11 modules |
| `socialQuests.ts` | Reads the quests back out of `creditMissions.ts`; kept only so older imports still resolve |

## Three rules worth knowing before you change anything

**Any locked feature can be bought from LV1.** v2.7 opened this up, so the
reach rule no longer refuses anything and price is what limits how far a
member goes. If you are tempted to add a level check in a component, the
answer is almost certainly `canUnlock()` instead.

**Caps are grouped, not global.** A mission belongs to cap group 1, 2 or 3,
and that decides which limit answers for it. Group 1 is what a member can do
alone and repeat, held to 100 Credits a day with the 60 social Credits inside
that hundred. The 1,200 a week is a safety net: if it is ever what stops
someone, a bug or a ring got past the others.

**Credits buy time with a tool, never an advantage in the market.** No cash,
no execution, no leverage, no bigger positions. This one is not a setting.

## What is deliberately not built

- **No Admin panel.** `adminRequirements.ts` is the list to work through, not
  a description of something that exists.
- **No server, but the seam is cut.** The ledger lives in `localStorage`, which
  means a member can clear it. `useLedgerStore()` in `rewardsLedger.ts` takes a
  `{ read, write, trusted }` object and every caller goes through it, so moving
  the record behind an API is one implementation rather than a rewrite. Until
  one is set, `isTrusted()` is false and the Points page says the balance is
  kept on this device. Only a verified server event may pay: a browser timer
  never does, whatever the catalogue says a task is worth.
- **No boosts.** Partner, Campaign and Consistency Boosts are in the rules and
  the calculator but nothing issues them yet.
- **No D6 milestones**, no expiry reminders, no first-use counter, no holding
  period enforcement. The numbers are there; the triggers are not.
- **Trading Journal and backtesting** were taken out of the rewards scope by
  v2.7. The Journal itself still works; it just does not pay anything.

## The AI dock

Two tabs. Summary reads the page; Chat answers from what it read. There is no
model behind it, so `aiAnswer.ts` matches the question against the lines the
feature itself produced and says plainly when a question is not covered rather
than inventing an answer. Keep it that way: a confident wrong answer about a
trade is worse than no answer.

The daily allowance (5 / 15 / 40 / unlimited by level) is shared between the
dock and the AI Companion page, and is counted in the browser for now, which is
one of the things the server has to take over.

## Checked, not assumed

The gap list in the workbook is closed, and the pieces that could be run were
run rather than taken on trust: expiry drops old Points out of the level,
spending takes the oldest Credits first, a repeated task pays 40, 20, 10 then
nothing, and the calculator matches the workbook's worked example line for
line (198 Points from a boosted $100 trade, 250 Credits converting to 2 Points
for 200 with 50 kept, $14 back on $100 of commission at LV3).

`npx tsc --noEmit` is clean.
