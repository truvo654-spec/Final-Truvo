import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bestValues} from '../../components/backtest/comparisonHighlights';

test('best results follow metric direction rather than the AI column',()=>{
  assert.deepEqual(bestValues([400,200,300]).winners,[0]);
  assert.deepEqual(bestValues([400,200,300],false).winners,[1]);
  assert.deepEqual(bestValues([-500,-300,-100]).winners,[2]);
  assert.deepEqual(bestValues([1.5,Infinity,2]).winners,[1]);
});

test('ties and missing evidence do not create an artificial winner',()=>{
  assert.deepEqual(bestValues([200,100,200]),{winners:[0,2],tied:true,allEqual:false});
  assert.deepEqual(bestValues([200,200,200]),{winners:[],tied:true,allEqual:true});
  assert.deepEqual(bestValues([NaN,0,NaN]),{winners:[],tied:false,allEqual:false});
  assert.deepEqual(bestValues([-100,-50,NaN]).winners,[1]);
});
