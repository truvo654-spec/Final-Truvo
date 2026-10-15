# Changelog

All notable changes to this project will be documented in this file.

## [1.26.0] - 2026-10-09
### Added
- LockStateContainer: one lock state for every panel a level does not open yet, with the mascot holding the lock over the blurred content and a single gradient "Unlock with Credits".
### Changed
- LockedFeatureOverlay now renders it, so all ten locked panels across Instrument Analysis, the instrument detail page and the widgets pick up the new look without any change to their flow or wording.

## [1.25.0] - 2026-10-09
### Added
- The star on the instrument detail page favourites the asset: it fills violet while the asset is a favourite, and confirms with "Asset Favourited" or "Asset Unfavorited" in the same banner the price alert uses.

## [1.24.0] - 2026-10-09
### Added
- SegmentedTabs: a grey track with the chosen option lifting out as a white pill, for panels that switch between a few views without the weight of the folder tabs.
### Changed
- Today's News uses it for All News, Market and Research, with Research carrying its lock until level 4.

## [1.23.1] - 2026-10-09
### Fixed
- The Viewing Mode and Period selects drew two arrows, the browser's and ours. The browser's is hidden now and one chevron sits inside the field.
- The negative margins around the detail page's tab row were clipping the tab outline TabMain draws, so the tabs read as plain text rather than the folder shape used everywhere else.

## [1.23.0] - 2026-10-09
### Added
- Create Price Alert, opened by the bell on the instrument detail page and built to the design: the instrument with its live price, a condition and a target, a line restating what will happen in plain words, advanced filters behind a disclosure, and Cancel beside Create Alert.
- Making one shows the "Price Alert Created" confirmation at the top right, which clears itself.

## [1.22.0] - 2026-10-09
### Added
- The chart's crosshair: moving across the plot draws the dashed violet line and the price read-out the design shows.
- Signal rows carry drawn brand marks rather than letters: the EU flag with the US flag tucked under it, the Google mark in its four colours, the Bitcoin coin and a gold bar for XAU.
- A pager under the news list, with the arrows and dots from the design.
### Changed
- The most accurate predictor is Priya Shah, as the design names her.

## [1.21.3] - 2026-10-09
### Changed
- The chart follows the brand: four dashed violet guides instead of three grey ones, a taller plot on plain white with no tinted frame, a heavier lime line, and dark-lime dots on the series in place of the numbered violet pins.
- Removed the "Linked tags" switch under the chart, which the design does not carry.

## [1.21.2] - 2026-10-09
### Changed
- The chart carries the time axis the design shows beneath it, reading the hours on 1D and the weeks or quarters on the longer periods.
- News stories show their real thumbnail instead of a violet block, and "Go to Community" is the brand violet button the design draws rather than a near-black one with a rainbow glow.

## [1.21.1] - 2026-10-09
### Fixed
- Six things on the instrument detail page that still did not match the design, found by putting the whole page beside it rather than checking one block at a time: the performance chart was violet and is now the brand lime, the price dropped its cents, the figure tiles had no currency and spilled onto two lines, the "Markets / Crypto" breadcrumb was not in the design, the tab read "Products & Brokers" instead of "Brokers & Promotions", and the vote buttons wrapped.
- The floating Max and Min pills over the chart are gone; the design reads those from the figure tiles.

## [1.21.0] - 2026-10-09
### Changed
- The Overview panel on the instrument detail page matches the design: the heading reads "Overview" with "Performance of the asset in a selected period", the chart mode and the period are two labelled dropdowns rather than tab strips, and the six figures sit in a three-by-two grid reading 1D Return, Price Range, Min, Last Price, Max and Signal.
- The level gates survive the change: picking the advanced chart or a longer period below your level opens the unlock prompt instead of switching.

## [1.20.3] - 2026-10-09
### Changed
- Today's News matches the design: the heading reads "Today's News.", the live badge and the subtitle are gone, and each story is a coloured category dot with its time, the headline, a thumbnail on the right and its hashtags beneath, separated by a hairline rather than boxed in a card.

## [1.20.2] - 2026-10-09
### Changed
- The Most Recent Signals panel matches the design: round brand marks, the symbol and its move in the brand's lime and violet, a wider trend line, and the action as a solid lime Buy, a violet Sell or a pink-outlined Upgrade.

## [1.20.1] - 2026-10-09
### Changed
- The community posts on the instrument detail page match the design: a "Community Post" box with the credit line, Popular and Most Recent tabs, and each post showing the author, the price at the time, a bullish or bearish tag, and the agree and disagree counts as buttons.

## [1.20.0] - 2026-10-09
### Changed
- The community sidebar on the instrument detail page follows the design: the "Community." heading with View All, the sentiment split read as a bull and a bear with their percentages, a single lime-to-violet bar, Vote Bullish and Vote Bearish as a pair of buttons with the credit line beneath, and the most accurate predictor as a compact row.

## [1.19.0] - 2026-10-09
### Added
- Search now reaches the whole app, not just pages, signals and brokers. News headlines, education courses, promotions, community articles, expert advisors, journal playbooks and missions are all indexed, each in its own group and each opening the thing it names.

## [1.18.0] - 2026-10-09
### Added
- A command palette: one box that searches and jumps, opened with Cmd or Ctrl + K anywhere, or with / when the person is not already typing.
- It is reachable by keyboard alone: arrows move, Enter opens, Home and End jump to the ends, Escape closes, and the highlighted row is always scrolled into view. Mouse and keyboard share the one highlight so they never disagree.
- Results are grouped and labelled, the matched part of a label is marked so the reader can see why a row came back, and ranking favours a prefix over a word start over a loose match.
- Recent searches are remembered and can be cleared in one click, "Advanced search" hands the typed text to the full search screen, and the foot of the panel shows what the keyboard can do and how many results there are.
- Pages, signals and brokers are all reachable; the empty state says what matched nothing and offers the filtered search.
### Changed
- Cmd+K and the header search box now open the palette; the full search modal is one keystroke further in, behind "Advanced search".

## [1.18.0] - 2026-10-09
### Changed
- Search results carry the real mark: a signal shows its instrument's own logo, drawn with the same component the analysis pages use, and a broker shows its brand square rather than a generic briefcase.
### Added
- src/components/brokers/brokerMark.ts, one place for each broker's colours and short name, so every surface draws the same mark. The mock logo URLs point at unrelated stock photos and are no longer used here.
- src/components/analysis/instrumentIconType.ts, which maps a ticker to its mark, including gold, silver, oil and the major currencies.

## [1.17.0] - 2026-10-09
### Changed
- The instrument detail header follows the design: a round coin mark, the name with "Cryptocurrency · BTC/USD" and a line of description, the price with the move as a tinted pill and the cash figure beside it, a sparkline, and the four figures labelled Market Cap, Volume (24h), Relative Volume and 1M Return in trillions and billions rather than raw numbers.
- Watchlist and alert are icon buttons, "Trade via Brokers" is the gradient button, and the broker paying the most on the asset sits beneath them as its own card with a Trade Now button.

## [1.16.1] - 2026-10-09
### Added
- The remaining three empty states on the instrument detail page: "The Votes Aren't Showing" on sentiment, "Oops! The Chart Didn't Load" on the overview chart, and "The News Didn't Load, Yet." on the news panel. All four now switch together from the preview control.

## [1.16.0] - 2026-10-09
### Added
- Empty states for the instrument detail page, from the supplied design: a shared DetailEmptyState panel with the three MarketSyde mascot illustrations, the headline in the brand gradient and a line saying the data is late rather than lost.
- The signals panel uses it ("The Signals Aren't Here"), and a preview switch in the corner shows every panel's empty state without breaking the data.

## [1.15.1] - 2026-10-09
### Removed
- Three journal files the merge left behind with nothing importing them: JournalRuleSummary, TradeLogSection and tradeLogData.

## [1.15.0] - 2026-10-09
### Added
- Correlation tab rebuilt to the design: "Adaptive Correlation" with its subtitle, X Axis and Y Axis searches with suggestions, a Sort by dropdown, and a 10 by 10 grid where every cell says how often the two move together.
- Searching an axis highlights that row and column and rings the cell where they meet, rather than shrinking the grid.
- Lime where assets rise and fall together, violet where they move apart, with a line under the grid explaining it, and the same Not found and Error states as the other tabs.

## [1.14.0] - 2026-10-09
### Fixed
- Mission tasks paid double. The reward modal now only announces; whoever opened it has already paid. Measured before and after in the app: a task advertising +10 points paid 20, now it pays 10.
- Premium feature unlocks on an instrument page deducted credits only inside that page's own state, so the account never actually paid. They now go through the shared handler and land in the activity log.
- Unlocking a longer timeframe on the market banner charged nothing. It now costs 60 credits a day and says so on the button.
- Signal unlocks never expired and analysis tab unlocks died on reload. Both now store the moment they lapse and are restored, or dropped, on load.
- The conversion criteria were text and a demo toggle. They now read the real account: one trade, one linked broker, 250 credits.
- boostPercentage || 10 showed every Rookie a 10% boost, because zero is falsy. Fixed in all three places.
- Finishing a lesson announced points but added none. It now pays, once per lesson.
- A real level-up did not change the calculator slot count. It does now.
- Converting credits took the remainder below 5 without paying for it.
- Every credit charge was logged with the same sentence about signal telemetry.
- The daily login reward was unreachable code. It is a button now, claimable once a day, and its log entry uses a category the type actually has.
### Changed
- One source of truth for points per lot (src/data/pointsPerLot.ts), matching the published table. The flat 15 per lot and flat 50 are gone.
- The tier tables agree: mockData starts the levels at 100 / 250 / 500, and the Boss boost is 15% everywhere, including the FAQ.
- The Credit Earning Guide lists what the code actually pays, with the points activities separated from the credit ones.
- Correlation requires level 4 in both the feature table and the analysis page.
- Removed the dead CommunityHub import, and the two screens that compared a non-existent user.level now use tierLevel.
### Added
- @types/react and @types/react-dom, so type checking is no longer blind. It surfaced 39 hidden errors; the 9 that could bite at runtime are fixed. The remaining 30 are generic-inference complaints in the newly merged backtest UI and do not affect the build.

## [1.13.0] - 2026-10-09
### Added
- Merged the Trading Journal work from the Trading_journal_7.10.2026 branch: the What-if lab and MarketSyde recommender, practice and demo replay with editable setup transfer, saved what-if scenarios and reports, personalised AI Coach candle comparisons, unified replay comparisons, and the backtest import in the summary area. 59 new files, 39 updated.
- JournalEntry gained marginAtEntry, which the new overview analytics and replay need.
### Changed
- Kept this branch's own AI journal work through the merge and wired it back in: the spotlight summary on the Overview and the per-entry summary in the review drawer.
- Left the Strategy Builder alone; the journal branch does not carry it, so only journal, backtest and journal data files were taken.
### Fixed
- shiftDay no longer throws on an entry with a missing or malformed date, which was blanking the whole journal page.

## [1.12.0] - 2026-10-09
### Added
- Scatter tab rebuilt to the design: "Market Scatter" with its subtitle and the Gain / Loss key, three custom pickers for X axis, Y axis and Point size, a dashed grid with axis ticks, dots coloured lime for a gain and violet for a loss and sized by the third field, and the "X: … Y: … Size: …" line beneath.
- Hovering a dot draws a crosshair and opens the read-out from the design: the instrument with its sector, three trading signals with confidence and reward-to-risk, and the asset information table.
- Its Not found and Error states match the table and heatmap, driven by the same preview switch.

## [1.11.1] - 2026-10-09
### Changed
- The heatmap is a real treemap now: a squarified layout over 25 assets, so a tile's area reflects the field chosen under "Size by" and the board rearranges when that changes.
- Tile colour comes from the field under "Color by", mapped onto the seven-step scale at the foot, with the label colour following the tint so it stays readable at both ends.
- "Size by" and "Color by" are custom dropdowns with the design's five fields and the "Choose" placeholder, instead of the browser's select.
- Hovering a tile opens a read-out with its change, 1M return, market cap and relative volume.

## [1.11.0] - 2026-10-09
### Added
- Heatmap tab rebuilt towards the design: "Size by" and "Color by" sit above their own wider selects, the subtitle reads "Tile size and color update based on your selections below.", a dashed "256 More" tile opens the Remaining assets popup with its own search, and a seven-step colour scale from -3% to 3% runs along the foot.
- The heatmap carries the same Not found and Error states as the table, driven by the page's preview switch.

## [1.10.2] - 2026-10-09
### Changed
- Instrument Analysis banner figures follow the design: lime circles for what is rising, violet for what is falling, bigger values, and the Fear & Greed gauge is now a gradient ring with the score inside and the label beneath.
- The view tabs keep their lock marks on Scatter and Correlation again.
### Added
- The table's failed state: "Well, that didn't load — It's not you, it's us. Try refreshing again in a bit." with the mascot, plus a preview switch (Default / Not found / Error) for reviewing all three.

## [1.10.1] - 2026-10-09
### Changed
- Instrument Analysis moved towards the new design, UI only: the title is one purple-to-magenta gradient with the design's subtitle, the asset pills sit in a single rounded container, Export CSV moved up beside the filter on the tab bar, the results count sits to the left of the pagination under the table, and the DURATION label is gone from the range switcher.
- The table's no-match state is now the designed one: the magnifier illustration with "Data not found — No instruments match these filters. Try loosening them up a bit."

## [1.10.0] - 2026-10-09
### Added
- Every feature now renders its own presentation inside the AI card, as the AI map describes: the verdict meter on signals and news, next-up on the calendar and promotions, the progress bar on education and points, side-by-side on expert advisors, the metrics row on portfolio and broker comparison, the checklist on alerts and the strategy builder, and the strip on brokers and instrument analysis. The dashboard and journal keep the figure tiles.
- Each widget gained a chrome-less mode and dark styles so it sits inside the panel without a card inside a card.

## [1.9.5] - 2026-10-09
### Removed
- "Ask the AI Companion" is gone from the panel, along with the Ask tab and the invite's link, so nothing in the panel sends people to the AI page.
### Changed
- The third card is now a neighbouring page that follows on from what was just read: signals offer setting an alert, alerts offer writing the trade up, news offers the instrument list, the calendar offers the coverage, brokers offer cashback, comparison offers connecting an account, and so on.

## [1.9.4] - 2026-10-09
### Changed
- The collapsed AI control is now a 56px orb holding only the mascot: a gradient ring in the brand colours rotating around it, a blurred halo of the same gradient behind, and a pulse that goes out every few seconds. The ghost bobs and blinks, hover brightens the halo and speeds everything up, and the press scales it down. All of it stops under prefers-reduced-motion.

## [1.9.3] - 2026-10-09
### Changed
- The first-run invite follows the attached design in both themes: the tinted title block reading "You're invited to try advanced MarketSyde AI", rules above and below two feature rows with 52px tiles, the "may make mistakes" line, the Learn more line and the pill button, at 400px wide.

## [1.9.2] - 2026-10-09
### Changed
- The collapsed AI button now carries the MarketSyde ghost, drawn the same way as the one on the error pages, and so do the panel header and the invite.
- It is alive: the ghost bobs, blinks every few seconds and sends out a ring, the button lifts on hover and presses in on click, and all of it stops under prefers-reduced-motion.
### Fixed
- Opted-out areas keep their icons again: the platform-wide icon removal no longer beats `data-keep-button-icons` on specificity.

## [1.9.1] - 2026-10-09
### Changed
- Each page's AI read now matches the AI map: the journal reads your journal (closed trades, net, win rate, average R, what is working and what costs you) instead of borrowing the playbook read, instrument analysis reads the movers and the next release, alerts read real alerts instead of an empty list, and strategy keeps the backtest checklist.
- Every page's CTAs point where that feature leads, and every figure carries the line explaining what it is.
### Added
- The leverage calculator's inline AI note is back, as the map describes.

## [1.9.0] - 2026-10-09
### Changed
- The AI panel header is brand purple, carrying the MarketSyde glyph with its lime dot and the wordmark, with the AI and Beta marks beside it and white tabs on the bar.
### Added
- The panel is interactive: each figure opens a line saying what it is and where it came from, re-analyse shows the pre-text and a skeleton while it re-reads, and tabs, cards and controls all have hover and pressed states.
- Figures carry their own explanation per page, so what the panel shows always refers to the page you are on.

## [1.8.3] - 2026-10-09
### Changed
- The AI panel is a fixed 720 × 550, shrinking to the viewport on smaller screens, with the hero and figures sized to match.

## [1.8.2] - 2026-10-09
### Changed
- Both AI surfaces are smaller: the invite is 340 × 440 with two feature rows as in the design, and the panel is 820 × 620 with a smaller hero, figures and cards.

## [1.8.1] - 2026-10-09
### Changed
- The AI invite is now a 400px card docked in the same bottom-right corner the panel opens in, instead of a modal over the page: brand purple on white in light, on black in dark, with the tinted title block, rules and pill button from the design. "Show me" opens the panel there; "Maybe later" leaves the pill.

## [1.8.0] - 2026-10-09
### Changed
- The AI dock is now a panel the size of a small dashboard, built to the supplied design in both light and dark: a MarketSyde header with the AI badge, the page's tabs plus Ask and a Beta mark, a greeting, the headline read with the robot, four figures each with its own trend line, "Where to go next" as three described cards, and the source note at the foot.
- Suggestions carry a line of explanation, and the figures' trend lines are generated from the figure itself so they stay put between renders.

## [1.7.1] - 2026-10-09
### Added
- A one-time invite before the AI dock appears: what it reads, that it knows your account, and that it is not a chat, with the usual caveat and a Learn more link to the AI Companion. "Show me" opens the dock; "Maybe later" leaves it as the pill in the corner. Either way it is not shown again.

## [1.7.0] - 2026-10-09
### Added
- `AiSpotlightPanel`: a proposal for one AI shape across the app, borrowing the rhythm of a chat without being one. Header of tabs, a pre-text line saying what was read, lines that arrive one after another, a bottom strip of per-feature suggestions, and a minimise control that remembers its state per feature.
- The panel is docked bottom right on every feature page: dashboard, signals, instrument analysis, calendar, news, education, brokers, broker comparison, promotions, portfolio, alerts, expert advisors, strategy builder, backtest, journal, points, leaderboard and community. Each page supplies its own pre-text and its own suggestions.
- Minimise collapses it to the headline and is remembered per page; close drops it to a pill in the corner and is remembered across pages.
### Removed
- The inline AI blocks on those pages, now that the dock carries the same read.

## [1.6.0] - 2026-10-09
### Added
- Write an Article page, built to the designs: three numbered steps (Basic information, Cover Image, Article Content), a headline, a deck with a 150-character counter, a related-topic picker, free tags, a cover uploader with drag and drop, a content editor with a formatting toolbar, a live word count and an autosave marker.
- Its failed state mirrors the design: publishing with gaps turns the offending fields red, puts the reason under each one and scrolls to the first.
- Preview renders the article as readers will see it, with a cover placeholder where none is set.
- Save as Draft and Publish Article both work: publishing adds the piece to the Article tab and pays credits.
- The editor opens from the "Write An Article" banner, from "Write an Article" on the My Page empty state, from Continue Writing on the draft card, and from Edit on any of your articles or drafts.

## [1.5.1] - 2026-10-09
### Added
- My Page → My Activity rebuilt to the design: a My Activities tab, filter pills (All, Posts, Articles, Comments, Bookmarks, Topics, Mentions) and a feed of what you did, each row with a thumbnail, the kind of action badged on its corner, the title and how long ago.
- Its empty state reads "No Activities Yet — Like, comment, or follow. We'll keep track." and its failed state "Your Activities Didn't Load — Your moves are safe. Refresh to see them."

## [1.5.0] - 2026-10-09
### Added
- My Page → Article rebuilt to the designs, with four states: **default** (your published articles with the Edit / Move to Drafts / Delete menu), **drafts** (cards with a placeholder where there is no cover, "-" where there is no title, no stats, and pagination), **empty** ("Nothing to Read Yet — Know something we don't? Write it." with a Write an Article button) and **failed** ("The Articles Are Hiding — They're still here. Refresh to find them.").
- A "Viewing" switch above the grid, between "Articles by me" and "Drafts".
### Changed
- My Page tabs follow the section: My Article / Saved Article under Article, My Post / Saved Post under Post.
- The My Page sidebar card is titled "My Items".

## [1.4.5] - 2026-10-09
### Changed
- My Page, My Post empty state follows the design: "No Posts Yet — Your followers are waiting. No pressure." with the papers illustration and a Write a Post button that opens the composer. The inline composer is hidden in that state; Saved Post keeps its own message.
### Added
- `EmptyState` can carry an action button.

## [1.4.4] - 2026-10-09
### Added
- My Page has a failed state: "Your Posts Didn’t Load — Don’t worry, they’re safe. Try a refresh." with the same wording for the Article and My Activity sections, the sidebar counts at zero and the composer hidden.

## [1.4.3] - 2026-10-09
### Changed
- Signed out, the Community feed keeps its "Your Feed" heading and the posts; only the composer box is gone, as in the design.
- Any action that writes now opens the sign-in modal instead of silently working: liking, saving, following, voting in a poll, commenting, replying, posting, adding a story, and the article like, save and menu actions. Reading, opening an article and switching tabs still work signed out.

## [1.4.2] - 2026-10-09
### Changed
- The post composer is hidden when signed out, on both the feed and a topic, since there is nothing to write with until you sign in.

## [1.4.1] - 2026-10-09
### Added
- Share now opens the share panel from the design instead of silently copying: Embed, Facebook, Telegram, LinkedIn and WhatsApp, with the link in a field and a Copy button that confirms. Embed copies an iframe snippet; the networks open their own share window.
- It is used by article cards, the article reading page's share rail, and posts in the feed and on My Page.

## [1.4.0] - 2026-10-09
### Added
- Create Post modal gained the optional **Market or Asset Sentiment** section from the design: search an instrument, see its quote, then tag the post Bullish, Neutral or Bearish.
- It has three steps. Empty: a search field, a line explaining it is optional and the three buttons greyed out with "Choose an instrument first." Searching: matching instruments with their quotes. Picked: the symbol and price with a clear button, and the three buttons live.
- A post carries its sentiment through to the feed, where it shows as a coloured tag under the text, and the publish toast names the call.

## [1.3.4] - 2026-10-09
### Added
- Polls render their results in the feed to the design: a vote count above, a filled bar and percentage per option, the ticked circle on your choice, and "Voting ends in 1 day · You can change your vote anytime". Changing your vote moves the count instead of locking it.
- A "Share to get +N free credits" pill in the post action row.
- Deleting a post or an article now asks first, with Cancel, Move to Draft and the destructive button, as in the Confirm Article Deletion design.
### Changed
- Create Post modal poll section reads "Create a Poll" with the "Ask the community something..." placeholder.
- The article sidebar card is "Your Latest Draft".

## [1.3.3] - 2026-10-09
### Added
- Articles now carry a MarketSyde AI summary of that piece, above the body: three of the article's own sentences picked for the ones carrying figures, levels and named drivers, plus the expert highlight where there is one and a line on what the coverage leans towards. It shows on Market News stories the reader has access to, and on Community articles.
- The summary is extractive, so every line is the article's own wording rather than something invented.

## [1.3.2] - 2026-10-09
### Changed
- Every AI summary now sits between the page's short description and its content, instead of above the title. Dashboard, Trading Signals, Market News, Economic Calendar, Education Hub, Instrument Analysis, Broker List, Broker Comparison, Promotions and Points & Credits all moved.
- `ReferenceDashboard` and `EmptyStateDashboardView` take an `aiSlot`, so the dashboard brief renders under the greeting rather than above it.

## [1.3.1] - 2026-10-09
### Changed
- AI no longer looks the same on every page. The dark spotlight card is now only on the Dashboard and the Trading Journal, where the read is the point; everywhere else uses a shape that matches what the AI is saying:
  - **Verdict meter** (Trading Signals, Market News) — a split bar for longs against shorts, or bullish against bearish.
  - **Next up** (Economic Calendar, Promotions) — an accented strip with the time on it; amber for an offer closing.
  - **Progress bar** (Points & Credits, Education Hub) — how far to the next level or through the courses.
  - **Side-by-side** (Expert Advisors) — the steadiest record against the roughest ride.
  - **Metrics row** (Portfolio Tracker) — four numbers with one line of reading.
  - **Checklist** (Price Alerts, Backtest, Strategy Builder) — numbered steps.
  - **Inline note** (Leaderboard, Broker Comparison, Calculator) and **strip** (Broker List, Instrument Analysis) stay as they were.

## [1.3.0] - 2026-10-09
### Added
- AI now reaches the last six features, each with the UI that suits it rather than the same card everywhere:
  - **Dashboard** — the full spotlight card, opened by default: your book, today's release, the highest-conviction call and one thing to do.
  - **Instrument Analysis** — a one-line strip above the list: biggest 24h move, highest-conviction call and the next release that can move it.
  - **Broker List** — a strip ranking the list on starting spread, cashback and minimum deposit, with the reminder that regulation matters more.
  - **Broker Comparison** — an inline note working out the monthly cost gap at 20 lots and naming the trade-off.
  - **Trading Calculator** — an inline note reading the result, warning when margin or effective leverage is heavy.
  - **Community article** — a light box above the body summarising the opening and flagging that it is one trader's view.
- Three lighter AI components (`AiStrip`, `AiInline`, `AiNote`) alongside the spotlight card, so the weight of the UI matches how much the AI is adding.

## [1.2.2] - 2026-10-09
### Changed
- The AI summary on the feature pages is now a short card: a one-line headline, two lines of summary and four stat chips, about half its old height. The columns of detail sit behind a "Read the detail" toggle, and the disclaimer shows with them. The trading journal's own summary is unchanged.

## [1.2.1] - 2026-10-09
### Added
- A MarketSyde AI summary now sits on every remaining feature page: Trading Signals, Economic Calendar, Market News, Education Hub, Promotions, Points & Credits and the Leaderboard. Each reads that page's own data, so it covers twelve pages in total.
### Removed
- The AI summary is gone from the Community feed.

## [1.2.0] - 2026-10-09
### Added
- AI Companion now covers the rest of the app, taking it to twelve areas: **Portfolio review** (accounts, equity, drawdown, margin and goals), **Backtest guide** (what to test next and how to read a run), **Advisors & alerts** (which expert advisor stands up, alert limits and hygiene) and **Community pulse** (what the feed is posting and which article to read).
- A MarketSyde AI summary section, in the same spotlight card the trading journal uses, now sits on Expert Advisors, Price Alerts, Portfolio Tracker, Strategy Builder, the journal Backtest tab and the Community feed. Each one reads that page's own live data.
- Shared `AiSection` component so any page can show the spotlight read with a headline, a paragraph, stat chips and up to three columns.

## [1.1.3] - 2026-10-09
### Changed
- Create Post modal rebuilt to the supplied design at its measured sizes: 664px wide, 17px gutters, the title, author row, 108px text box, 166px upload area, a 16:9 attachment block with the round white remove button and the dot pager, the poll card with 37px fields, and a footer of three filled buttons.
- Attachments (photos and uploaded video) use that same 16:9 block, so a short plays in the frame the design shows.

## [1.1.2] - 2026-10-09
### Added
- AI Companion gained two areas, taking it to eight: **Playbook review** (compares the playbooks from the new journal by net result, win rate and average R, and checks each against its own reward:risk benchmark) and **Cashback & perks** (cashback credited, pending and per lot by broker, level and points to the next tier, open missions, live offers for your level, and your leaderboard place).
- Questions like "how much cashback have I earned?", "how close am I to the next level?", "what missions are open?", "what offers are live?", "where am I on the leaderboard?", "which playbook is weakest?" and "do my playbooks follow their rules?" now route to those areas, with broker-cashback questions still going to the broker directory.
### Fixed
- AI Companion surface tiles show their icons again; the platform-wide icon removal is scoped out of that page.

## [1.1.1] - 2026-10-09
### Added
- Create Post modal built to the design: author row, text, an upload area for photos and video from the device (drag and drop too), an attachment carousel with remove, and a poll with a question, options, Add Option and character counters.
- Posts now carry uploads and polls: attachments play or display in the feed card, and a poll can be voted on once, showing the share per option.
### Changed
- The feed composer is now a preview of the box with Photo / Video and Poll only; any control opens the Create Post modal, with Photo / Video opening the file picker straight away and Poll opening with the poll section ready.
- Shorts in the feed are mock market replays generated for the demo (animated candles, "MOCK DATA · DEMO" on screen). The design stills remain in `src/assets/community` as `story1..4`.

## [1.1.0] - 2026-10-09
### Added
- Trading Journal brought over from `Trading_journal_7.10.2026`: Overview, Trade Log, Insights, Playbook, Backtest and Weekly Review tabs, the entry wizard with import and ingest, review drawer with rule evidence and fills, calendar, cumulative chart, monitors, playbook analytics and trade replay, plus the `src/backtest` engine the Backtest tab needs.
- Journal types extended (trading status, review state, fills, risk history, broker, cashback, playbook scenario) and the new journal data files (`journalHistory`, `journalPlaybooks`).
### Kept
- MarketSyde AI summary from design-team: the overview card now sits at the top of the Overview tab and the per-trade read appears inside the new review drawer.
### Fixed
- Overview bar chart no longer emits an SVG rect with an undefined height when a point has no value.

## [1.0.50] - 2026-10-09
### Added
- Community stories are real video now: each tile plays a looping, muted 6-second clip in place (pausing when scrolled out of view), and opening one plays it full screen with a progress bar, keyboard controls and auto-advance to the next story.
- Clips ship as WebM (VP9) and MP4 (H.264) so they play across browsers. They were generated from the design stills with a slow pan and zoom, so they are motion rather than filmed footage.

## [1.0.49] - 2026-10-09
### Changed
- Community toasts now follow the second template: #f0efff card at the top right under the header, icon and headline on the first line, and the action detail underneath.
- Credit-earning actions (first comment, first post, finishing an article) show the gift icon with "+N Credits"; other actions keep the check icon with a short headline.

## [1.0.48] - 2026-10-09
### Changed
- Knowledge Hub and Community are top-level header items again, as they were before 1.0.46; the entries added to the Company menu were removed. The header keeps its design styling (62px, page background, design border, search box without the Cmd+K badge).

## [1.0.47] - 2026-10-09
### Added
- Community toast built to the supplied template (290px, #f7f5ff, purple check, title plus one line of detail), stacking up to three and clearing after 3.2s.
- Every Community action now raises a toast: like, save, follow, comment (first comment reads "Credits Earned"), reply, share, publish, move to drafts, delete, open a story or topic, change tab, category, list or page, add or remove an interest, attach or remove an image, finish reading an article (+5 credits), and open signals, courses or the broker offer.

## [1.0.46] - 2026-10-09
### Changed
- Header matched to the design: 61px tall on the page background with the design border, the four top-level items (Trade, Brokers, Member Plan, Company), design search box without the Cmd+K badge, and the dropdown chevrons kept.
- Knowledge Hub and Community are no longer top-level items, to match the design; both are now entries in the Company menu so they stay reachable.
- Community page offsets retuned to the new header so the tab bar and cards land exactly where the design puts them.

## [1.0.45] - 2026-10-09
### Added
- Community sidebars now stay with the page while it scrolls (sticky below the header) and scroll internally when taller than the viewport, on Feed, Article and My Page.
### Changed
- Community content starts at the same offset as the design, the composer uses the designed Shorts and Poll icons, and the Suggested list and topic view spacing were matched to the design.

## [1.0.44] - 2026-10-09
### Changed
- Community rebuilt to the MarketSyde design system: Feed, Article and My Page, with the previous Topics, Media and creator-profile views retired.
- Feed laid out to the 1440px design: 300 / 664 / 300 columns, Key Topics, Suggested for You, Stories, composer, posts with comments and replies, Top Contributors, Most Recent Signals and Featured Courses.
- Added the Suggested for You list with pagination, and a per-topic discussion view opened from either the sidebar card or that list.
- Added the designed empty and failed states for every block: Key Topics, Suggested, Stories, feed, Contributors, Signals and Courses, plus a preview switch (Default / Empty / Error / Signed out) for reviewing them.
- Article tab, article reading page (share rail, Technical Snapshot, comments, sign-in gate, 5-credit reward) and My Page.
- Community images are stored in `src/assets/community` and bundled, so the standalone build carries them.
- Buttons inside Community keep their icons: the platform-wide icon removal is scoped out of this area only.

## [1.0.43] - 2026-10-09
### Added
- AI Companion rebuilt across all six areas, split into focused modules under `src/components/ai/`.
- Broker matching: platform and monthly-lots preferences, match %, side-by-side comparison table, "why not X?" explanations, cashback estimates, and tap-through to broker detail.
- Learning assistant: ~48-term glossary that adapts to Beginner / Intermediate / Advanced, "simpler" and "deeper" follow-ups, in-chat multiple-choice quiz, learning path, and calculators (position size, pip value, margin, drawdown recovery, risk/reward, break-even win rate).
- Market summaries: today, week ahead, per asset class, per instrument (signal, news, events, your open positions), and sentiment by asset class.
- Trading insights: 7 / 30 / 90 day ranges, comparison with the previous period, and breakdowns by strategy, instrument, session, weekday, direction, broker and open positions.
- Behavioral observation: discipline score, mood and mistake cost, behaviour after a loss, checklist impact, and a re-entry-after-loss cross-check against the portfolio.
- Recommendations: ranked, each with a "why", drawn from journal, equity curve, calendar, signals, broker cashback gap and missions.
- Conversation memory for follow-ups, follow-up suggestion chips, copy and thumbs feedback, chat saved on this device, "New conversation", and separate privacy switches for trades and journal.
- Basic Thai keyword recognition for greetings and the main topics.

## [1.0.42] - 2026-10-08
### Added
- Added `vite.single.config.ts` and `vite-plugin-singlefile` to build the whole app as a single self-contained HTML file (`npm run build:single`).
- Added the standalone build at `artifact/marketsyde.html` for the design team.

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
