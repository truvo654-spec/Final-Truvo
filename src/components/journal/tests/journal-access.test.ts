import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasJournalFeatureAccess,
  JOURNAL_ACCESS_FEATURES,
  journalUnlockExpiry,
} from '../journalAccess';

test('Journal features follow the proposed membership levels', () => {
  const entitlements = {};

  assert.equal(hasJournalFeatureAccess('journalCore', 1, entitlements), false);
  assert.equal(hasJournalFeatureAccess('journalCore', 2, entitlements), true);
  assert.equal(hasJournalFeatureAccess('advancedInsights', 2, entitlements), false);
  assert.equal(hasJournalFeatureAccess('playbook', 2, entitlements), false);
  assert.equal(hasJournalFeatureAccess('backtest', 2, entitlements), false);
  assert.equal(hasJournalFeatureAccess('playbook', 3, entitlements), true);
  assert.equal(hasJournalFeatureAccess('backtest', 3, entitlements), true);
  assert.equal(hasJournalFeatureAccess('advancedCoach', 3, entitlements), false);
  assert.equal(hasJournalFeatureAccess('advancedCoach', 4, entitlements), true);
});

test('credit entitlements expire and can temporarily override a level gate', () => {
  const now = Date.parse('2026-10-15T00:00:00.000Z');
  const expiry = journalUnlockExpiry('7d', now);

  assert.equal(expiry, '2026-10-22T00:00:00.000Z');
  assert.equal(hasJournalFeatureAccess('backtest', 2, { backtest: expiry }, now), true);
  assert.equal(hasJournalFeatureAccess('backtest', 2, { backtest: expiry }, now + 7 * 86400000), false);
});

test('credit unlock prices match the upper Instrument Analysis price band', () => {
  const prices = Object.values(JOURNAL_ACCESS_FEATURES).map((feature) => feature.dailyPrice);

  assert.ok(prices.every((price) => price === 140 || price === 180));
});
