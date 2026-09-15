# Changelog

All notable changes to this project will be documented in this file.

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
