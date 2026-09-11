# Changelog

All notable changes to this project will be documented in this file.

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
