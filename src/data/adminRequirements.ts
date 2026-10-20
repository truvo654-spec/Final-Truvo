/**
 * What the Admin panel has to do, one entry per requirement.
 *
 * From the Final Beta workbook, 20 Oct 2026. No admin code exists yet, so this
 * is the list the build works through rather than a description of something
 * already there. Screens and layout belong to the design team; this is the
 * behaviour each screen owes.
 *
 * "Must" means needed for the beta launch.
 */

export type AdminRole =
  | 'Economy manager'
  | 'Partnerships'
  | 'Content editor'
  | 'Support'
  | 'Finance'
  | 'Compliance'
  | 'Engineering';

export type Priority = 'Must' | 'Should' | 'Could';
export type Phase = 'MVP' | 'Phase 2';

export interface AdminRequirement {
  id: string;
  module: string;
  moduleName: string;
  requirement: string;
  /** What stops an admin breaking the economy with one keystroke. */
  guardrail: string;
  role: AdminRole;
  priority: Priority;
  phase: Phase;
}

export const ADMIN_REQUIREMENTS: AdminRequirement[] = [
  { id: 'AD-01.1', module: 'AD-01', moduleName: 'Roles, approvals and audit', requirement: 'Role-based access with the seven roles; every module checks the role before showing or saving.', guardrail: 'A user without the role sees nothing of it.', role: 'Engineering', priority: 'Must', phase: 'MVP' },
  { id: 'AD-01.2', module: 'AD-01', moduleName: 'Roles, approvals and audit', requirement: 'Every change goes draft, preview, approve, publish, with a scheduled effective date.', guardrail: 'Economy changes need a second approver.', role: 'Engineering', priority: 'Must', phase: 'MVP' },
  { id: 'AD-01.3', module: 'AD-01', moduleName: 'Roles, approvals and audit', requirement: 'Audit log of every change: who, when, field, before, after, reason. Exportable.', guardrail: 'A reason is required and the log is append-only.', role: 'Compliance', priority: 'Must', phase: 'MVP' },
  { id: 'AD-01.4', module: 'AD-01', moduleName: 'Roles, approvals and audit', requirement: 'Settings history, with restore of an earlier published version.', guardrail: 'A restore is itself a change and needs approval.', role: 'Engineering', priority: 'Should', phase: 'MVP' },

  { id: 'AD-02.1', module: 'AD-02', moduleName: 'Levels and cashback', requirement: 'Edit level names, Active Point starts, cashback rates and unlock discounts in one place.', guardrail: 'Starts must rise with each level.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-02.2', module: 'AD-02', moduleName: 'Levels and cashback', requirement: 'Preview how many members would move up or down, and the change in cashback paid, before publishing.', guardrail: 'Shown on the approval step.', role: 'Economy manager', priority: 'Should', phase: 'MVP' },
  { id: 'AD-02.3', module: 'AD-02', moduleName: 'Levels and cashback', requirement: 'Edit the perks text shown for each level.', guardrail: 'Text only; access itself is set in AD-07.', role: 'Economy manager', priority: 'Could', phase: 'Phase 2' },

  { id: 'AD-03.1', module: 'AD-03', moduleName: 'Points rules and boosts', requirement: 'Edit D6 milestone Points, the Consistency Boost range and the combined boost cap.', guardrail: 'Boosts only add, never subtract.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-03.2', module: 'AD-03', moduleName: 'Points rules and boosts', requirement: 'Show the base rule, one dollar of Point Value is one Point, as locked.', guardrail: 'No admin can edit the base rule.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-03.3', module: 'AD-03', moduleName: 'Points rules and boosts', requirement: 'Boosts are always shown to the member separately from Base Points.', guardrail: 'So nobody mistakes a promotion for the baseline.', role: 'Economy manager', priority: 'Should', phase: 'MVP' },

  { id: 'AD-04.1', module: 'AD-04', moduleName: 'Campaigns and partner deals', requirement: 'Create a Partner Boost per broker deal: rate, period, instruments and eligible levels.', guardrail: 'Rate within the Settings range.', role: 'Partnerships', priority: 'Must', phase: 'MVP' },
  { id: 'AD-04.2', module: 'AD-04', moduleName: 'Campaigns and partner deals', requirement: 'Create Campaign Boosts with start and end dates.', guardrail: 'Rate 1.00 to 2.00 times, and it must end.', role: 'Partnerships', priority: 'Must', phase: 'MVP' },
  { id: 'AD-04.3', module: 'AD-04', moduleName: 'Campaigns and partner deals', requirement: 'Campaign calendar showing active and upcoming boosts.', guardrail: '', role: 'Partnerships', priority: 'Could', phase: 'Phase 2' },

  { id: 'AD-05.1', module: 'AD-05', moduleName: 'Credit missions and quests', requirement: 'Create, edit, pause and retire missions and quests: reward, difficulty, limit, from level, social flag, verification.', guardrail: 'A quest without server verification cannot be published.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-05.2', module: 'AD-05', moduleName: 'Credit missions and quests', requirement: 'Edit the platform-activity multiplier with a preview of weekly issuance by level.', guardrail: 'Preview uses the live catalogue.', role: 'Economy manager', priority: 'Should', phase: 'MVP' },
  { id: 'AD-05.3', module: 'AD-05', moduleName: 'Credit missions and quests', requirement: 'Edit personalisation multipliers and streak bonuses.', guardrail: 'Within 1.0 to 2.0 times.', role: 'Economy manager', priority: 'Should', phase: 'MVP' },
  { id: 'AD-05.4', module: 'AD-05', moduleName: 'Credit missions and quests', requirement: 'Regenerate the member-facing Credit Earning Guide from the live catalogue.', guardrail: 'No hand-typed reward copy.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },

  { id: 'AD-06.1', module: 'AD-06', moduleName: 'Caps and anti-farming', requirement: 'Edit the four caps and the repeat decay.', guardrail: 'The form warns when a weekly cap falls below the daily one times seven.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-06.2', module: 'AD-06', moduleName: 'Caps and anti-farming', requirement: 'Show cap usage per member, today, this week and this month, in the member view.', guardrail: '', role: 'Economy manager', priority: 'Should', phase: 'MVP' },

  { id: 'AD-07.1', module: 'AD-07', moduleName: 'Feature access and unlock prices', requirement: 'Edit per feature: included-from level, Credit-unlock-from level and daily price, with prices for each length.', guardrail: 'Unlock-from cannot be above included-from.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-07.2', module: 'AD-07', moduleName: 'Feature access and unlock prices', requirement: 'Edit the length shares, the rounding step and the one-level-up rule, plus a per-tool exception list.', guardrail: 'The exception list is explicit, never implied.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-07.3', module: 'AD-07', moduleName: 'Feature access and unlock prices', requirement: 'Edit the signal confidence bands per level.', guardrail: 'Bands must rise with the level.', role: 'Economy manager', priority: 'Should', phase: 'MVP' },
  { id: 'AD-07.4', module: 'AD-07', moduleName: 'Feature access and unlock prices', requirement: 'Rules for running unlocks: at most two seven-day unlocks at once at LV2; saved work turns read-only when one expires.', guardrail: 'Nothing a member made is deleted when access lapses.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },

  { id: 'AD-08.1', module: 'AD-08', moduleName: 'Allowances and quotas', requirement: 'Edit per-level allowances: AI questions, backtest runs, calculator slots, watchlist size, alert count.', guardrail: 'Whole numbers only.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-08.2', module: 'AD-08', moduleName: 'Allowances and quotas', requirement: 'Edit the AI day pass and extra backtest run prices.', guardrail: 'The AI pass rounds to the five-Credit step like other unlocks.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-08.3', module: 'AD-08', moduleName: 'Allowances and quotas', requirement: 'Allowance counts are kept on the server and reset in the business timezone.', guardrail: 'A browser count can be cleared by the member.', role: 'Engineering', priority: 'Must', phase: 'MVP' },

  { id: 'AD-09.1', module: 'AD-09', moduleName: 'Expiry, conversion and reminders', requirement: 'Edit Point and Credit life, reminder days and the conversion rate, cap and window.', guardrail: 'New lives apply to new entries only.', role: 'Economy manager', priority: 'Must', phase: 'MVP' },
  { id: 'AD-09.2', module: 'AD-09', moduleName: 'Expiry, conversion and reminders', requirement: 'Set the business timezone used for daily limits, expiry and resets.', guardrail: 'One timezone for the whole platform.', role: 'Engineering', priority: 'Must', phase: 'MVP' },
  { id: 'AD-09.3', module: 'AD-09', moduleName: 'Expiry, conversion and reminders', requirement: 'Run a report of upcoming expiry for the next thirty days.', guardrail: '', role: 'Economy manager', priority: 'Should', phase: 'MVP' },

  { id: 'AD-10.1', module: 'AD-10', moduleName: 'Member ledger and support', requirement: 'Member view: level, Active Points, Credit batches with expiry, running unlocks, cap usage, recent awards.', guardrail: 'Read only without the support role.', role: 'Support', priority: 'Must', phase: 'MVP' },
  { id: 'AD-10.2', module: 'AD-10', moduleName: 'Member ledger and support', requirement: 'Manual Credit or Point adjustment with a reason code.', guardrail: 'Above the support limit a second admin approves.', role: 'Support', priority: 'Must', phase: 'MVP' },
  { id: 'AD-10.3', module: 'AD-10', moduleName: 'Member ledger and support', requirement: 'Reverse an award for a cancelled trade or an invalid action; the level recalculates.', guardrail: 'A reversal can take back Credits already spent.', role: 'Support', priority: 'Must', phase: 'MVP' },
  { id: 'AD-10.4', module: 'AD-10', moduleName: 'Member ledger and support', requirement: 'Refund an unlock for a support case.', guardrail: 'The refund returns the same Credit batches with their original expiry.', role: 'Support', priority: 'Should', phase: 'MVP' },

  { id: 'AD-11.1', module: 'AD-11', moduleName: 'Content', requirement: 'Tag any article or report as Research so it falls under the Research gate.', guardrail: 'Untagged content stays free.', role: 'Content editor', priority: 'Must', phase: 'MVP' },
  { id: 'AD-11.2', module: 'AD-11', moduleName: 'Content', requirement: 'Manage courses, lessons, live classes and certificates, with quizzes.', guardrail: 'A quiz needs at least three questions.', role: 'Content editor', priority: 'Must', phase: 'MVP' },
  { id: 'AD-11.3', module: 'AD-11', moduleName: 'Content', requirement: 'Publish trading signals with a confidence value; the level band filter applies on its own.', guardrail: '', role: 'Content editor', priority: 'Should', phase: 'MVP' },
];

/** The requirements the beta cannot launch without. */
export const MUST_HAVE = ADMIN_REQUIREMENTS.filter((r) => r.priority === 'Must');

/** Grouped by module, in the order the workbook lists them. */
export function byModule(): { module: string; moduleName: string; items: AdminRequirement[] }[] {
  const out: { module: string; moduleName: string; items: AdminRequirement[] }[] = [];
  for (const req of ADMIN_REQUIREMENTS) {
    const last = out[out.length - 1];
    if (last && last.module === req.module) last.items.push(req);
    else out.push({ module: req.module, moduleName: req.moduleName, items: [req] });
  }
  return out;
}
