import test from 'node:test';
import assert from 'node:assert/strict';
import { startRuleReview, moveRuleReview } from '../labRuleReview';
import { cond, ind, val, deepClone } from '../../../backtest/rules';
import { validatePlaybookConditions } from '../../../backtest/playbookConditions';

test('multi-playbook review keeps its complete order and each edit through back and forward navigation', () => {
  const ids = ['breakout', 'swing', 'scalping', 'crypto', 'forex'];
  const breakout = deepClone([cond(ind('RSI', 14), 'gt', val(55))]);
  const swing = deepClone([cond(ind('EMA', 50), 'gt', val(0))]);
  const first = startRuleReview(ids)!;
  const second = moveRuleReview(first, breakout, 1)!;
  const back = moveRuleReview(second, swing, -1)!;
  assert.equal(back.ids[back.index], 'breakout');
  assert.deepEqual(back.drafts.breakout, breakout);
  const edited = deepClone([cond(ind('RSI', 14), 'gt', val(60))]);
  let forward = moveRuleReview(back, edited, 1)!;
  assert.equal(forward.ids[forward.index], 'swing'); assert.deepEqual(forward.drafts.swing, swing);
  assert.deepEqual(forward.drafts.breakout, edited);
  assert.deepEqual(first.drafts, {}); assert.deepEqual(second.drafts.breakout, breakout);
  assert.deepEqual(ids, ['breakout', 'swing', 'scalping', 'crypto', 'forex']);
  swing[0].right = val(99); assert.deepEqual(back.drafts.swing[0].right, val(0));
  for (let index = 1; index < ids.length - 1; index++) forward = moveRuleReview(forward, swing, 1)!;
  assert.equal(forward.index, 4); assert.deepEqual(forward.ids, ids);
  assert.equal(moveRuleReview(forward, swing, 1), null);
});

test('Back retains an unfinished draft without approving it or changing applied conditions', () => {
  const entries = [cond(ind('RSI', 14), 'gt', val(50))];
  const second = moveRuleReview(startRuleReview(['one', 'two'])!, entries, 1)!;
  const back = moveRuleReview(second, [], -1)!;
  const revisit = moveRuleReview(back, entries, 1)!;
  assert.deepEqual(revisit.drafts.two, []);
  assert.ok(validatePlaybookConditions(revisit.drafts.two, 500));
  const unfinished = [cond(ind('EMA', NaN), 'gt', val(0))];
  const retain = moveRuleReview(second, unfinished, -1)!;
  const restore = moveRuleReview(retain, entries, 1)!;
  assert.ok(Number.isNaN((restore.drafts.two[0].left as any).ind.period));
  assert.ok(validatePlaybookConditions(restore.drafts.two, 500));
  assert.deepEqual(entries[0].right, val(50));
  assert.equal(startRuleReview([]), null);
  assert.equal(moveRuleReview(startRuleReview(['one'])!, entries, -1)!.index, 0);
});
