import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_USER } from '../../../data/mockData';
import { crossAnalysisPurchase, hasCrossAnalysisAccess } from '../crossAnalysisAccess';

test('Matrix access requires a signed-in level 4 member or an unexpired purchase', () => {
  const user = { ...INITIAL_USER, tierLevel: 3, journalCrossAnalysisUntil: 2000 };
  assert.equal(hasCrossAnalysisAccess(user, true, 1999), true);
  assert.equal(hasCrossAnalysisAccess(user, true, 2000), false);
  assert.equal(hasCrossAnalysisAccess(user, false, 1999), false);
  assert.equal(hasCrossAnalysisAccess({ ...user, tierLevel: 4 }, true, 2000), true);
  assert.equal(hasCrossAnalysisAccess({ ...user, journalCrossAnalysisUntil: NaN }, true, 1000), false);
});

test('Matrix purchases charge the selected standard-analytics price and expire precisely', () => {
  const user = { ...INITIAL_USER, sydeCredits: 5000 };
  const day = 86400000;
  for (const [level, duration, cost, days] of [
    [1, '1d', 120, 1], [2, '7d', 480, 7], [3, '30d', 930, 30],
  ] as const) {
    const purchase = crossAnalysisPurchase({ ...user, tierLevel: level }, duration, 1000);
    assert.equal(purchase.ok, true);
    if (!purchase.ok) throw new Error('Expected successful purchase');
    assert.equal(purchase.cost, cost);
    assert.equal(purchase.user.sydeCredits, 5000 - cost);
    assert.equal(purchase.user.journalCrossAnalysisUntil, 1000 + day * days);
  }
});

test('Matrix purchases do not charge included, active, or insufficient accounts', () => {
  const user = { ...INITIAL_USER, tierLevel: 1, sydeCredits: 119 };
  assert.deepEqual(crossAnalysisPurchase(user, '1d', 1000), { ok: false, reason: 'insufficient' });
  assert.deepEqual(crossAnalysisPurchase({ ...user, tierLevel: 4 }, '1d', 1000), { ok: false, reason: 'included' });
  assert.deepEqual(crossAnalysisPurchase({ ...user, journalCrossAnalysisUntil: 1001 }, '1d', 1000), { ok: false, reason: 'active' });
  assert.equal(user.sydeCredits, 119);
});
