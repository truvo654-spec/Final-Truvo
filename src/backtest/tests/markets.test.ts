import test from 'node:test';
import assert from 'node:assert/strict';
import { ASSET_CLASSES } from '../types';
import { marketGroupOf, SYMBOLS, symbolSpec } from '../marketData';
import { defaultCostsFor } from '../rules';

test('Indices replaces Options and has selectable instruments in the market picker',()=>{
  assert.deepEqual(ASSET_CLASSES,['Stocks','Futures','Forex','Crypto','Indices']);
  assert.deepEqual(SYMBOLS.filter(s=>marketGroupOf(s)==='Indices').map(s=>s.symbol),['MNQ','MES']);
  for(const group of ASSET_CLASSES)assert.ok(SYMBOLS.some(s=>marketGroupOf(s)===group));
  assert.deepEqual(SYMBOLS.filter(s=>marketGroupOf(s)==='Futures').map(s=>s.symbol),['MGC']);
});
test('Index grouping preserves aliases, futures valuation and cost defaults',()=>{
  const nq=symbolSpec('NAS100')!,es=symbolSpec('US500')!;
  assert.equal(nq.symbol,'MNQ');assert.equal(es.symbol,'MES');
  assert.equal(nq.assetClass,'Futures');assert.equal(es.assetClass,'Futures');
  assert.equal(nq.multiplier,2);assert.equal(es.multiplier,5);
  assert.equal(nq.tickSize,.25);assert.equal(es.tickSize,.25);
  assert.equal(nq.sizeUnit,'contracts');assert.equal(es.hours,'cme');
  assert.deepEqual(defaultCostsFor('MNQ'),{commissionPerSide:.62,spread:1,slippage:1});
  assert.deepEqual(defaultCostsFor('MES'),defaultCostsFor('MNQ'));
});
