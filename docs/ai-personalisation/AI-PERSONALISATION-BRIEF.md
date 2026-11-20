# Marketsyde AI personalisation — implementation brief and audit

Reviewed: 20 November 2026. Status: **Phase 1 prototype; not ready for production approval**.

## Delivery and provenance

Destination: `truvo654-spec/Final-Truvo`, branch `AI_Personalisation`, based on `main` commit `d756d289244f8699b3802017df8bf083c4eedb3a` (v2.34.0).

The ten application files are copied unchanged from the user-supplied `AI_Personalisation-files.zip` (SHA-256 `D65251794B9F5C4F23868E51F4247C042D67099AB15D83CB847E9CC4C4FB5CD3`). They are Claude's v2.35.0 implementation. This brief records requirements and independent findings; it does not certify all Claude claims or fix the supplied source.

Claude conversation reviewed: https://claude.ai/cowork/cse_01YKR1nkKmHSL5kYdeE1h6dE?artifact=20bc1499-ad72-491e-943d-20386a9e11ed

Reference artifact: https://claude.ai/artifact/53T2S5sWE3k2a6ebFKV428?sk=9kpYb74l7tdc6aKK1qP9Bg

Design exploration: https://stitch.google.com/projects/2627831830757325109

Interaction reference: https://coinmarketcap.com/cmc-ai/ask/

## Product policy

| Membership | Basic per UTC day | Advanced per UTC day |
| --- | --- | --- |
| LV1 Rookie | Locked | Locked |
| LV2 Climber | 10 | Locked; unlocks at LV3 |
| LV3 Player | 20 | 10 |
| LV4 Boss | Unlimited, fair use | 10 in this package; provisional pending a product decision |

The initial Codex brief left Advanced quantities undecided. In the later Claude conversation, the user explicitly requested “let advanced from lv 3 can use 10”. Claude retained LV4 at 10 and identified that value as provisional. Do not describe unlimited Basic as unlimited Advanced.

Basic covers focused explanations, platform lookups, page/news summaries, individual chart explanations and explanations of authoritative calculator results. Advanced covers multi-source comparisons, journal patterns, portfolio/account analysis and strategy/backtest report interpretation. Advanced in this package is a labelled sample response, not a connected research agent.

Use `user.tierLevel` as the canonical membership level. A successful fresh generation consumes one prompt in its own mode. Follow-ups, regeneration and fresh summaries count. Navigation, saved answers, failures, cancellation before a completed answer, and automatic retries must not cause extra charges. Counters reset at 00:00 UTC (07:00 Bangkok), with no rollover. Upgrades retain today's usage; downgrades clamp remaining prompts at zero. Locked users retain drafts/history and see the required level and membership action.

## Required full experience

The compact Summary/Chat panel must offer an accessible expand action into a real full AI workspace route. Expanding and returning must preserve conversation, draft, selected mode, source page, account/date scope and counters without charging. The route must support reload/deep links. LV1 may inspect the workspace, with generation locked.

Use the existing Marketsyde design system: purple-to-magenta header (#5945F1, #6D3AE8, #C026D3), navy text (#0B1C30), pale panel (#FBFBFF), lavender border (#CCC6FB), existing system font, 16px panels and 8px buttons. Preserve the actual wordmark and surrounding app navigation. CMC is an interaction reference, not the brand style.

Every generation path must use the same server entitlement/reservation service, including Summary, Chat, suggested prompts, charts, Companion, journal coach and future full workspace. Keep staff roles independent from membership. Existing calculators, reward ledger and signal services remain authoritative; AI must honor private resource permissions and paid-content locks. Do not invent financial facts or execute trades.

## Function classification and dependencies

These are proposed requirements, not a claim that the ZIP implements every area.

| Platform area | Basic | Advanced | Required authoritative data/access |
| --- | --- | --- | --- |
| Cashback | Explain balances, status and rules | Compare eligible account/broker cashback patterns | Cashback ledger and broker conditions |
| Brokers | Explain a broker and fees | Compare multiple brokers against user criteria | Broker catalogue, dated fee/regulation sources |
| Signals | Explain an accessible signal | Compare signals/timeframes and recorded outcomes | Signal service and content entitlement |
| Instruments | Explain an instrument or single chart | Combine technical, news and macro context | Timestamped market data and calculation tools |
| Calculators | Explain verified inputs/results | Compare scenarios using calculator tools | Deterministic calculators |
| Community | Summarise accessible discussions | Identify attributed themes across discussions | Community visibility/moderation controls |
| Levels, points, credits, missions | Explain progress and rules | Model eligible progression scenarios | Rewards rules and ledger; no AI-issued rewards |
| Staff admin | Staff help and record summaries | Authorized aggregate investigation | Staff role checks and audit trail |
| Personalisation | Page-aware assistance and preferences | Cross-module assistance with scoped consent | Profile and resource permissions |
| Promotions | Explain eligibility and terms | Compare eligible offers and net conditions | Promotion source terms and dates |
| Market news | Summarise with sources | Compare narratives and related assets | Licensed/approved news and timestamps |
| Economic calendar | Explain events and dates | Compare event exposure across holdings | Calendar feed, timezone, portfolio access |
| Education | Explain concepts and lessons | Tailor study/review to demonstrated needs | Education catalogue and progress |
| Multi-broker dashboard | Explain current account figures | Compare account exposure, fees and results | Authorized connected-account data |
| Trading journal | Explain a recorded trade/statistic | Find supported patterns across trades | Authorized journal and verified metrics |
| Strategy/backtesting | Explain assumptions and a report | Compare simulations and sensitivity | Deterministic backtest output, costs and provenance |

## Files supplied by Claude

- `src/components/ai/AiDashboardPanel.tsx`
- `src/components/ai/AiDock.tsx`
- `src/components/ai/AiModeBar.tsx`
- `src/components/ai/aiAllowance.ts`
- `src/components/ai/aiEntitlement.ts`
- `src/components/ai/aiModeBar.css`
- `dist-single/index.html`
- `package.json`
- `CHANGELOG.md`
- `NOTES-FOR-DEV.md`

## Independent validation

The package was overlaid onto a fresh clone of the stated main commit. `npm ci --ignore-scripts`, `npm run lint` (TypeScript), and `npm run build` completed successfully. Ten direct policy checks passed: Basic/Advanced limits, locks, reservation/release, idempotent commit, separate counters, upgrade retention, exhaustion/downgrade clamp, UTC rollover, and existing day-pass behavior. These are isolated checks, not concurrent-tab or server tests.

Browser checks on the newly built production app confirmed: LV1 locked Summary and generation; LV2 10 Basic with Advanced locked; a completed Basic answer changing usage to 1; LV3 retaining that usage (19/20 left), Advanced generation changing only Advanced to 1 used; LV4 unlimited Basic while retaining 9/10 Advanced. The labelled Advanced sample and purple panel style were visible. Screenshots accompany this brief.

Claude separately reported 25 real-app Chromium checks and 35 artifact harness checks. Those full evidence files were not in this ZIP, so those totals are reported claims, not independently rerun test suites.

The development server reported dependency scanning trouble with the checked-in single-file HTML and `@emotion/is-prop-valid`; production build and preview worked. Generated HTML has trailing-whitespace diff warnings. The pre-existing package-lock version is stale relative to package.json.

## Audit findings and required follow-up

1. **P1 — Full workspace is absent.** The supplied dock has Summary/Chat, refresh and close, but no expand action or new full workspace route/state handoff. Claude explicitly deferred this to Phase 2. Implement the originally requested compact-to-full flow and its reload/deep-link acceptance checks.
2. **P1 — Companion paths bypass the policy.** `AiCompanionPage.tsx` lines 154–165 (`pickSurface`, `matchWithPrefs`) call response generators without quota or level checks. Its `ask` function (around line 142) charges via `recordAsk()` before completion. Its remaining-count memo does not subscribe to shared usage/storage updates. Migrate every generator to the shared entitlement flow, including journal coaching; do not claim complete platform gating from this ZIP.
3. **P1 — Counters are client-only and not atomic.** `reserveAi` and `commitAi` in `aiEntitlement.ts` independently read and write localStorage. A storage event updates displays but does not serialize concurrent requests. Concurrent tabs can overwrite reservations/counts; account IDs are absent from storage keys. Production needs authenticated per-user counters, atomic reservations/commits, idempotency and authoritative reset handling. The claim that tabs cannot overspend is stronger than this implementation supports.
4. **P1 — Cancellation/completion needs a precise boundary.** `say` calls `commitAi(hold)` before word-by-word delivery finishes. Stop during delivery therefore leaves a charge. Unmount cleanup clears the stream timer but does not cancel the thinking timer/interval or release its held reservation. Verify stop/close/navigation at every request stage and enforce the agreed completed-answer charging rule.
5. **P2 — Credits day pass overrides LV2/LV3 Basic caps.** `hasDayPass` makes remaining unlimited at finite eligible levels. This is inherited behavior explicitly called out by Claude; it is outside the simple level matrix and needs an explicit product decision. LV1 stays locked.
6. **P2 — Advanced is a sample and LV4 policy is provisional.** The answer function reads a few page statistics with fixed sample scope text; live multi-source analysis is not connected. Source/account/date labels must become actual execution metadata before launch. Confirm LV4 Advanced allowance and publish a measurable Basic fair-use policy.
7. **P2 — Documentation conflicts.** NOTES-FOR-DEV retains the older 5/15/40/unlimited paragraph below the new table; reconcile it. Its LV4 Advanced row itself says “not decided yet”. Preserve this brief's distinction between confirmed requirements and provisional implementation.

## Release acceptance

Before merge/release, resolve P1 findings and policy decisions. Verify every AI entrypoint at LV1–4, both quota boundaries, failure/cancel/retry, reload, multi-tab last-prompt races, account switching, midnight rollover, upgrade/downgrade during generation, locked content, and expand/minimise handoff. Keep AI-generated insights separate from authoritative calculations and sample data clearly labelled.

## Screenshots

- [LV1 locked panel](marketsyde-ai-audit-lv1.jpg)
- [LV2 Advanced locked / Basic 10](marketsyde-ai-audit-lv2.jpg)
- [LV3 separate counters and Advanced sample](marketsyde-ai-audit-lv3.jpg)
- [LV4 unlimited Basic](marketsyde-ai-audit-lv4.jpg)
- [CMC interaction reference](cmc-ai-layout-reference.jpg)
- [Stitch platform-style exploration](marketsyde-stitch-platform-matched.jpg)

