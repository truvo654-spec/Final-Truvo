import test from 'node:test';
import assert from 'node:assert/strict';
import {syncComparisonInstruments,comparisonInstrumentOptions} from '../comparisonInstrumentSelection';

test('Saved instrument additions appear while manually hidden existing instruments remain hidden',()=>{
  const before=['US500','NAS100'];
  const after=[...before,'GBP/USD'];
  assert.deepEqual(syncComparisonInstruments(['NAS100'],before,after,after),['NAS100','GBP/USD']);
});
test('Removed playbook instruments leave the comparison even if historical journal trades still exist',()=>{
  assert.deepEqual(syncComparisonInstruments(['US500','NAS100'],['US500','NAS100'],['NAS100'],['NAS100','US500']),['NAS100']);
});
test('Saved preferences reconcile on reopening, including newly added instruments',()=>{
  const saved={selection:['NAS100'],playbookSymbols:['US500','NAS100']};
  assert.deepEqual(syncComparisonInstruments(saved.selection,saved.playbookSymbols,['US500','NAS100','USD/JPY'],['US500','NAS100','USD/JPY']),['NAS100','USD/JPY']);
});
test('Manual journal-only selections are retained, unavailable selections removed, alias duplicates collapsed',()=>{
  assert.deepEqual(syncComparisonInstruments(['MNQ','BTC/USDT','MISSING'],['NAS100'],['NQ','GBP/USD'],['NQ','GBP/USD','BTC/USDT']),['NQ','BTC/USDT','GBP/USD']);
  assert.deepEqual(comparisonInstrumentOptions(['NAS100','GBP/USD'],['MNQ','NQ','BTC/USDT']),['NAS100','GBP/USD','BTC/USDT']);
});
test('Follow-all mode stays automatic; explicit empty filters stay empty until a new instrument is saved',()=>{
  assert.equal(syncComparisonInstruments(null,['NAS100'],['NAS100','USD/JPY'],['NAS100','USD/JPY']),null);
  assert.deepEqual(syncComparisonInstruments([],['NAS100'],['NAS100'],['NAS100']),[]);
  assert.deepEqual(syncComparisonInstruments([],['NAS100'],['NAS100','USD/JPY'],['NAS100','USD/JPY']),['USD/JPY']);
});
