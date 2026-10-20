/**
 * Every way the platform pays Credits, one entry per mission.
 *
 * From the Final Beta workbook v2.9, 20 Oct 2026, which folded the social
 * quests into this list: Q01 to Q14 are rows here with Type "Social quest".
 * Rewards are already the halved platform-activity figures, and the ledger's
 * caps sit on top, so what a member receives can be less and the reason is
 * always shown.
 *
 * The cap group is the part that decides which limit answers for a mission.
 * Group 1 is what a member can do alone and repeat, held to a hundred Credits
 * a day. Group 2 is confirmed by someone else or by a verified outcome, so
 * only its own limit applies. Group 3 is confirmed by the broker and answers
 * to the monthly cap. One-off rewards are paid once and held before they can
 * be spent. Alias rows name an event that another row already pays for, and
 * must never pay twice.
 *
 * Only a verified server event pays. A browser timer, a page view or a click
 * the server never saw earns nothing.
 */

export type MissionDifficulty = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D4\u2013D5' | 'D6' | '-';

export interface CreditMission {
  id: string;
  /** The group it belongs to, as the workbook groups them. */
  type: string;
  activity: string;
  difficulty: MissionDifficulty;
  /** Credits at the low and high end. Null where the workbook leaves it open. */
  rewardMin: number | null;
  rewardMax: number | null;
  /** How often it can pay, in the workbook's own words. */
  limit: string;
  /** Which cap answers for it, in the workbook's own words. */
  capGroup: string;
}

export const CREDIT_MISSIONS: CreditMission[] = [
  { id: 'C01', type: 'Daily habit', activity: 'Daily market check-in', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C02', type: 'Market learning', activity: 'Review the morning market brief', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C03', type: 'Market learning', activity: 'Review high-impact economic events', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C04', type: 'Market learning', activity: 'Explore a personalised market', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C05', type: 'Market learning', activity: 'Read relevant market analysis', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '2/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C06', type: 'Market learning', activity: 'Explore a recommended instrument', difficulty: 'D2', rewardMin: 15, rewardMax: 15, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C07', type: 'Tools', activity: 'Compare partner broker spreads', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C08', type: 'Tools', activity: 'Set up a risk control (e.g. stop-loss)', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C09', type: 'Tools', activity: 'Use a recommended trading calculator', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C10', type: 'Tools', activity: 'Complete a trade simulation (no real order)', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C11', type: 'Tools', activity: 'Try a new platform feature for the first time', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: 'First meaningful use', capGroup: 'One-off: first use (max 10; holding period)' },
  { id: 'C12', type: 'Quests', activity: 'Complete a personalised quest', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C13', type: 'Quests', activity: 'Complete 3 daily quests', difficulty: 'D3', rewardMin: 30, rewardMax: 30, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C14', type: 'Quests', activity: 'Complete the full daily quest set', difficulty: 'D4', rewardMin: 40, rewardMax: 40, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'C15', type: 'Quests', activity: 'Complete a portfolio rebalance learning scenario', difficulty: 'D4', rewardMin: 30, rewardMax: 30, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C16', type: 'Quests', activity: 'Complete the weekly personalised quest', difficulty: 'D4', rewardMin: 75, rewardMax: 75, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C17', type: 'Quests', activity: '7-Day Explorer streak', difficulty: 'D5', rewardMin: 80, rewardMax: 80, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C18', type: 'Quests', activity: 'Complete the weekly quest set', difficulty: 'D5', rewardMin: 100, rewardMax: 100, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'C19', type: 'Account', activity: 'Verify a broker account', difficulty: 'D5', rewardMin: 250, rewardMax: 250, limit: 'Once per broker', capGroup: 'Alias of RV-01: build once, under the RV row' },
  { id: 'C20', type: 'Account', activity: 'Reach a verified cashback milestone', difficulty: 'D4–D5', rewardMin: 200, rewardMax: 200, limit: 'Per milestone', capGroup: 'Alias of RV-05: build once, under the RV row' },
  { id: 'C21', type: 'Demo', activity: 'Claim the demo top-up when Credits run short', difficulty: '-', rewardMin: 300, rewardMax: 300, limit: 'Unlimited, demo only', capGroup: 'Remove (demo)' },
  { id: 'C22', type: 'Demo', activity: 'Trader Level Progress button', difficulty: '-', rewardMin: 5, rewardMax: 5, limit: 'Unlimited, for testing', capGroup: 'Remove (demo)' },
  { id: 'C23', type: 'Onboarding', activity: 'Complete a profile; review a broker', difficulty: '-', rewardMin: null, rewardMax: null, limit: '-', capGroup: '-' },
  { id: 'C24', type: 'Guide screen', activity: 'Credit Earning Guide (published table)', difficulty: '-', rewardMin: null, rewardMax: null, limit: '-', capGroup: '-' },
  { id: 'IA-M01', type: 'Instrument Analysis', activity: 'Add an instrument to your watchlist with a one-line bias note (bullish / bearish / neutral)', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M02', type: 'Instrument Analysis', activity: 'Run the market screener with 2+ filters and open a result', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M03', type: 'Instrument Analysis', activity: 'Save a screener preset', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M04', type: 'Instrument Analysis', activity: 'Set a price alert on a watchlist instrument', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M05', type: 'Instrument Analysis', activity: 'Compare 2+ instruments in the heatmap or scatter plot', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M06', type: 'Instrument Analysis', activity: 'Run a correlation check on two instruments from your own markets', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M07', type: 'Instrument Analysis', activity: 'Review 5+ technical indicators and save a chart layout', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M08', type: 'Instrument Analysis', activity: 'Instrument deep-dive: chart, indicators, financial or seasonal view, plus a written note (80+ characters) on one instrument', difficulty: 'D4', rewardMin: 50, rewardMax: 50, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M09', type: 'Instrument Analysis', activity: 'Share an instrument chart snapshot with your note to Community', difficulty: 'D3', rewardMin: 0, rewardMax: 0, limit: 'Counts as Q08', capGroup: '2 Confirmed (pays as Q08)' },
  { id: 'IA-M10', type: 'Instrument Analysis', activity: 'Analyst weekly set: watchlist note on 5 days, 2 alerts, 1 deep-dive', difficulty: 'D5', rewardMin: 75, rewardMax: 75, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'IA-M11', type: 'Instrument Analysis', activity: 'First use of each Instrument Analysis tool', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: 'Once per tool', capGroup: 'One-off: first use (max 10; holding period)' },
  { id: 'PE-M01', type: 'Platform Explorer', activity: 'Complete the guided platform tour', difficulty: 'D2', rewardMin: 15, rewardMax: 15, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'PE-M02', type: 'Platform Explorer', activity: 'Complete your trader profile (markets, experience, goals)', difficulty: 'D2', rewardMin: 15, rewardMax: 15, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'PE-M03', type: 'Platform Explorer', activity: 'Set a reminder on a high-impact economic event', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'PE-M09', type: 'Platform Explorer', activity: 'Write a broker review', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: 'Once per broker, max 3', capGroup: 'One-off (holding period)' },
  { id: 'PE-M10', type: 'Platform Explorer', activity: 'Rewards 101: read the level guide and pass a 3-question quiz', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'PE-M11', type: 'Platform Explorer', activity: 'Explorer passport: one verified action in 5 different areas in a week (analysis, calendar, education, community, brokers)', difficulty: 'D4', rewardMin: 60, rewardMax: 60, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'CM-M01', type: 'Community', activity: 'Ask a question in Topics', difficulty: 'D1', rewardMin: 3, rewardMax: 3, limit: '1/day', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'CM-M02', type: 'Community', activity: 'Answer a question in Topics', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '2/day, shared by CM-M02, Q07 and MN-M04', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'CM-M03', type: 'Community', activity: 'Your answer is marked helpful by the asker', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '3/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'CM-M04', type: 'Community', activity: 'Vote agree or disagree on a market prediction post', difficulty: 'D1', rewardMin: 3, rewardMax: 3, limit: '1/day', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'CM-M05', type: 'Community', activity: 'Cast the weekly community vote on an instrument', difficulty: 'D1', rewardMin: 3, rewardMax: 3, limit: '1/week', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'CM-M06', type: 'Community', activity: 'Complete your community profile (bio, markets, avatar)', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'CM-M07', type: 'Community', activity: 'Report spam or hype that moderators confirm', difficulty: 'D2', rewardMin: 5, rewardMax: 5, limit: '3/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'CM-M08', type: 'Community', activity: 'Your first approved post', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: 'Once', capGroup: 'One-off: first use (max 10; holding period)' },
  { id: 'CM-M09', type: 'Community', activity: 'Helper set: 3 approved answers and 1 helpful mark in a week', difficulty: 'D4', rewardMin: 40, rewardMax: 40, limit: '1/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'Q01', type: 'Social quest', activity: 'Like or react to 5 community posts', difficulty: 'D1', rewardMin: 3, rewardMax: 3, limit: '1/day', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q02', type: 'Social quest', activity: 'Watch a member video for 60+ seconds', difficulty: 'D1', rewardMin: 3, rewardMax: 3, limit: '3/day', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q03', type: 'Social quest', activity: 'Follow a new creator', difficulty: 'D1', rewardMin: 3, rewardMax: 3, limit: '3/week', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q04', type: 'Social quest', activity: 'Share a post inside the platform with your own note', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '2/day', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q05', type: 'Social quest', activity: 'Share MarketSyde content to external media', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/day', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q06', type: 'Education', activity: 'Pass the quiz at the end of a lesson (quiz bonus)', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'Q07', type: 'Social quest', activity: 'Write a quality comment', difficulty: 'D2', rewardMin: 5, rewardMax: 5, limit: '2/day, shared by CM-M02, Q07 and MN-M04', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q08', type: 'Social quest', activity: 'Publish an approved market post', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '2/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'Q09', type: 'Social quest', activity: 'Post a short video or chart analysis', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: '2/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'Q10', type: 'Social quest', activity: 'Join a live session or voice room for 15+ minutes', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '2/week', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q11', type: 'Social quest', activity: 'External share that brings a new visitor who registers', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: '3/week', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'Q12', type: 'Social quest', activity: 'Complete the weekly social set: likes on 5 days, 3 shares, 1 approved post', difficulty: 'D4', rewardMin: 50, rewardMax: 50, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'Q13', type: 'Social quest', activity: 'Earn "Top post of the week" (50+ genuine reactions)', difficulty: 'D4', rewardMin: 40, rewardMax: 40, limit: '1/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'Q14', type: 'Social quest', activity: 'Host an approved community live session', difficulty: 'D4', rewardMin: 50, rewardMax: 50, limit: '1/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'SG-M01', type: 'Trading Signals', activity: 'Accept the signals risk agreement', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'SG-M02', type: 'Trading Signals', activity: 'Signal review x1: open a signal and record take or skip with a reason', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'SG-M03', type: 'Trading Signals', activity: 'Signal review x3: three different signals reviewed in a day', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'SG-M04', type: 'Trading Signals', activity: 'Signal review x5: five different signals reviewed in a day', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'SG-M05', type: 'Trading Signals', activity: 'Weekly signal recap: compare your take/skip calls with what happened and write one lesson', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'BR-M01', type: 'Brokers', activity: 'Verify an account with a promoted partner broker', difficulty: 'D5', rewardMin: 150, rewardMax: 150, limit: 'Once per broker', capGroup: 'Alias of RV-02: build once, under the RV row' },
  { id: 'BR-M02', type: 'Brokers', activity: 'Add a second trading account', difficulty: 'D3', rewardMin: 100, rewardMax: 100, limit: 'Once per account, max 3', capGroup: 'Alias of RV-12: build once, under the RV row' },
  { id: 'BR-M03', type: 'Brokers', activity: 'IB transfer approved', difficulty: 'D5', rewardMin: 300, rewardMax: 300, limit: 'Once per broker', capGroup: 'Alias of RV-03: build once, under the RV row' },
  { id: 'BR-M04', type: 'Brokers', activity: 'Complete the broker-match questionnaire', difficulty: 'D2', rewardMin: 15, rewardMax: 15, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'BR-M05', type: 'Promotions', activity: 'Join a promotion', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: 'Max 4 a month', capGroup: '1 Farmable (daily cap)' },
  { id: 'AI-M01', type: 'MarketSyde AI', activity: 'AI tour: ask the AI spotlight on 5 different pages', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: 'Once', capGroup: 'One-off: first use (max 10; holding period)' },
  { id: 'AI-M02', type: 'MarketSyde AI', activity: 'Pass an AI learning quiz', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'AI-M03', type: 'MarketSyde AI', activity: 'Set an AI learning path', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'AI-M04', type: 'MarketSyde AI', activity: 'Complete a step of your AI learning path', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: '2/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'AI-M05', type: 'MarketSyde AI', activity: 'Do what an AI recommendation suggests', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: '2/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'AI-M06', type: 'MarketSyde AI', activity: 'Weekly AI behaviour review: read it and set one focus for next week', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'AI-M08', type: 'MarketSyde AI', activity: 'AI broker match with a cashback estimate', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'DA-M06', type: 'Discipline', activity: 'Stay inside your own drawdown limit for 30 days', difficulty: 'D4', rewardMin: 60, rewardMax: 60, limit: '1/month', capGroup: '2 Confirmed (own limit)' },
  { id: 'DA-M07', type: 'Discipline', activity: 'Set your first drawdown-limit goal', difficulty: 'D2', rewardMin: 15, rewardMax: 15, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'DA-M08', type: 'Discipline', activity: 'Trades tracked milestones: 25 and 100 trades', difficulty: 'D3', rewardMin: 25, rewardMax: 25, limit: 'Once each (25 C, then 50 C)', capGroup: 'One-off (holding period)' },
  { id: 'ED-M01', type: 'Education', activity: 'Complete a lesson', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: '3/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'ED-M02', type: 'Education', activity: 'Reach 50% of a course', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: 'Once per course', capGroup: 'One-off (holding period)' },
  { id: 'ED-M03', type: 'Education', activity: 'Finish a course and earn its certificate', difficulty: 'D5', rewardMin: 75, rewardMax: 75, limit: 'Once per course', capGroup: 'One-off (holding period)' },
  { id: 'MN-M01', type: 'Market News', activity: 'Read a full news article (reach the end, 45+ seconds on the page)', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: '3/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'MN-M02', type: 'Market News', activity: 'Follow a topic or asset class in News', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: 'Once each, max 3', capGroup: 'One-off (holding period)' },
  { id: 'MN-M03', type: 'Market News', activity: 'News to chart: open an instrument from an article\'s tag and view its chart for 1+ minute', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'MN-M04', type: 'Market News', activity: 'Comment on a news article (approved)', difficulty: 'D2', rewardMin: 5, rewardMax: 5, limit: '2/day, shared by CM-M02, Q07 and MN-M04', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'MN-M05', type: 'Market News', activity: 'Weekly news habit: read articles on 5 different days', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'MN-M06', type: 'Market News', activity: 'Weekly news quiz: 3 questions on the week\'s top stories, pass 2', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'MN-M07', type: 'Market News: Research', activity: 'Research reader: read 3 research reports in a week', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'ED-M04', type: 'Education', activity: 'Enrol in your first course', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'ED-M05', type: 'Education', activity: 'Attend a live class for 15+ minutes', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'ED-M06', type: 'Education', activity: 'Learning streak: complete a lesson on 5 different days in a week', difficulty: 'D4', rewardMin: 30, rewardMax: 30, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'CA-M01', type: 'Calculators', activity: 'First use of each calculator group (Forex, Trade planning, Technical, Performance)', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: 'Once per group, max 4', capGroup: 'One-off: first use (max 10; holding period)' },
  { id: 'CA-M02', type: 'Calculators', activity: 'Pre-trade check: position size and SL/TP calculated and saved', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap)' },
  { id: 'CA-M03', type: 'Calculators', activity: 'Risk routine: a pre-trade check on 3 different days this week', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'CV-M01', type: 'Converters', activity: 'Set your home timezone in the Trading Timezone Converter', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'CV-M02', type: 'Converters', activity: 'Session check: view the market session overlap on 3 different days this week', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'CV-M03', type: 'Converters', activity: 'First currency conversion (deposit, P&L or cost in your own currency)', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'ST-M01', type: 'Strategy and tools', activity: 'Save your first strategy in the Strategy Builder', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: 'Once', capGroup: 'One-off: first use (max 10; holding period)' },
  { id: 'ST-M02', type: 'Strategy and tools', activity: 'Save or update a strategy', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '2/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'ST-M03', type: 'Strategy and tools', activity: 'Stress-test or optimise a strategy before trading it', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'ST-M04', type: 'Strategy and tools', activity: 'Compare two strategies', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'ST-M05', type: 'Strategy and tools', activity: 'Weekly event prep: reminders on 3 high-impact events', difficulty: 'D3', rewardMin: 20, rewardMax: 20, limit: '1/week', capGroup: '1 Farmable (daily cap)' },
  { id: 'ST-M06', type: 'Strategy and tools', activity: 'Export your monthly portfolio report', difficulty: 'D2', rewardMin: 10, rewardMax: 10, limit: '1/month', capGroup: '1 Farmable (daily cap)' },
  { id: 'ST-M07', type: 'Strategy and tools', activity: 'Import trades from CSV for the first time', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'ST-M08', type: 'Strategy and tools', activity: 'Save your first custom dashboard layout', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'ST-M09', type: 'Strategy and tools', activity: 'Turn on notifications or the weekly digest', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'ST-M10', type: 'Strategy and tools', activity: 'Security check-up: strong password and a recovery method', difficulty: 'D2', rewardMin: 15, rewardMax: 15, limit: 'Once', capGroup: 'One-off (holding period)' },
  { id: 'ST-M11', type: 'Strategy and tools', activity: 'Follow a news writer', difficulty: 'D1', rewardMin: 5, rewardMax: 5, limit: 'Once each, max 3', capGroup: 'One-off (holding period)' },
  { id: 'CT-M01', type: 'Content', activity: 'Publish an approved long article', difficulty: 'D4', rewardMin: 40, rewardMax: 40, limit: '1/week, inside Q08\'s 2-a-week limit', capGroup: '2 Confirmed (own limit)' },
  { id: 'CT-M02', type: 'Content', activity: 'Create a poll that gets 10+ votes from other members', difficulty: 'D3', rewardMin: 15, rewardMax: 15, limit: '1/week', capGroup: '2 Confirmed (own limit)' },
  { id: 'CT-M03', type: 'Content', activity: 'Post a sentiment call (symbol, bullish or bearish) with a written reason', difficulty: 'D2', rewardMin: 8, rewardMax: 8, limit: '1/day', capGroup: '1 Farmable (daily cap; social cap inside it)' },
  { id: 'CT-M04', type: 'Content', activity: 'A member you invited completes onboarding', difficulty: 'D3', rewardMin: 10, rewardMax: 10, limit: 'Max 5 a month', capGroup: 'One-off: referral (holding period)' },
  { id: 'RV-01', type: 'Revenue-linked', activity: 'Verify a broker account', difficulty: 'D5', rewardMin: 250, rewardMax: 250, limit: 'Once per broker', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-02', type: 'Revenue-linked', activity: 'Verify an account with a promoted partner broker (bonus on top of RV-01)', difficulty: 'D5', rewardMin: 150, rewardMax: 150, limit: 'Once per broker', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-03', type: 'Revenue-linked', activity: 'IB transfer approved', difficulty: 'D5', rewardMin: 300, rewardMax: 300, limit: 'Once per broker', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-04', type: 'Revenue-linked', activity: 'First verified trade with a partner broker', difficulty: 'D5', rewardMin: 200, rewardMax: 200, limit: 'Once per broker', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-05', type: 'Revenue-linked', activity: 'First cashback credited', difficulty: 'D5', rewardMin: 200, rewardMax: 200, limit: 'Once', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-06', type: 'Revenue-linked', activity: 'Monthly trading milestone 1: 30 Base Points from verified partner trades', difficulty: 'D5', rewardMin: 100, rewardMax: 100, limit: '1/month', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-07', type: 'Revenue-linked', activity: 'Monthly trading milestone 2: 100 Base Points from verified partner trades', difficulty: 'D5', rewardMin: 150, rewardMax: 150, limit: '1/month', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-08', type: 'Revenue-linked', activity: 'Monthly trading milestone 3: 170 Base Points from verified partner trades', difficulty: 'D5', rewardMin: 250, rewardMax: 250, limit: '1/month', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-09', type: 'Revenue-linked', activity: 'Trade on 4+ different days this month with a partner broker', difficulty: 'D5', rewardMin: 100, rewardMax: 100, limit: '1/month', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-10', type: 'Revenue-linked', activity: 'Keep a partner broker account active 3 months in a row', difficulty: 'D5', rewardMin: 200, rewardMax: 200, limit: 'Every 3 months', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-11', type: 'Revenue-linked', activity: 'Complete the trading condition of a broker-funded promotion', difficulty: 'D5', rewardMin: 150, rewardMax: 150, limit: 'Once per promotion, max 2 a month', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-12', type: 'Revenue-linked', activity: 'Add and verify a second trading account', difficulty: 'D5', rewardMin: 100, rewardMax: 100, limit: 'Once per account, max 3', capGroup: '3 Broker-confirmed (monthly cap)' },
  { id: 'RV-13', type: 'Revenue-linked', activity: 'Referral becomes a verified, trading member (plus the D6 10 Points)', difficulty: 'D5', rewardMin: 300, rewardMax: 300, limit: 'Once per referral, max 5 a month', capGroup: '3 Broker-confirmed (monthly cap); holding period' },
];

/** The missions in one group, in the order the workbook lists them. */
export function missionsOfType(type: string): CreditMission[] {
  return CREDIT_MISSIONS.filter((m) => m.type === type);
}

export function missionById(id: string): CreditMission | undefined {
  return CREDIT_MISSIONS.find((m) => m.id === id);
}

/** Which cap answers for this mission: 1 farmable, 2 confirmed, 3 broker. */
export function capGroupOf(id: string): 1 | 2 | 3 | null {
  const m = missionById(id);
  if (!m) return null;
  if (m.capGroup.startsWith('1')) return 1;
  if (m.capGroup.startsWith('2')) return 2;
  if (m.capGroup.startsWith('3')) return 3;
  return null;
}

/** Paid once per member, and held before it can be spent. */
export function isOneOff(id: string): boolean {
  return missionById(id)?.capGroup.startsWith('One-off') ?? false;
}

/**
 * An alias names an event another row already pays for.
 *
 * C19 and RV-01 are the same verification; paying both would pay twice for
 * one thing, so the alias is built under the row it points at and never on
 * its own.
 */
export function isAlias(id: string): boolean {
  return missionById(id)?.capGroup.startsWith('Alias') ?? false;
}

/** Demo rows, to be removed before launch. */
export function isDemo(id: string): boolean {
  return missionById(id)?.capGroup.startsWith('Remove') ?? false;
}

/**
 * Comments and answers share one limit.
 *
 * Q07, MN-M04 and CM-M02 pay at most twice a day between them, so a member
 * cannot write the same comment in three places for three rewards.
 */
export const SHARED_COMMENT_LIMIT = { missions: ['Q07', 'MN-M04', 'CM-M02'], perDay: 2 } as const;

/**
 * The limit as a period and a count, where it can be read that way.
 *
 * "1/day" and "2/week" become something the ledger can enforce; "Once per
 * broker" and "Max 5 a month" cannot be reduced to that, so they come back
 * null and the caller has to handle them on their own terms.
 */
export function parseLimit(limit: string): { count: number; period: 'day' | 'week' } | null {
  const match = /^(\d+)\s*\/\s*(day|week)/i.exec(limit.trim());
  if (!match) return null;
  return { count: Number(match[1]), period: match[2].toLowerCase() as 'day' | 'week' };
}
