import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bestValues} from '../../components/backtest/comparisonHighlights';
import {whatIfRecordedMarkers} from '../../components/backtest/whatIfChart';
import {JOURNAL_ENTRIES} from '../../data/journalData';
import {runWhatIf} from '../whatif';

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

test('scenario highlights use only recorded prices and times, with skipped trades grey',()=>{
 const at=Date.parse('2026-10-01T10:00:00Z');
 const entry={...JOURNAL_ENTRIES[0],id:'highlight',symbol:'EUR/USD',date:'2026-10-01',entryTime:'2026-10-01T10:00:00Z',exitTime:'2026-10-01T10:15:00Z',entryPrice:1.1,exitPrice:1.2,commission:0,pnl:100,pnlKnown:true,tradingStatus:'closed' as const,mistakes:['Counter-trend']};
 const output=runWhatIf([entry],{kind:'mistakes',tags:[]});
 const bars=[{t:at,o:1.1,h:1.2,l:1,c:1.15,v:10},{t:at+900000,o:1.15,h:1.3,l:1.1,c:1.2,v:10}];
 const markers=whatIfRecordedMarkers(output.trades,[entry],bars,'EUR/USD','15m','Selected idea','#5338ec');
 assert.deepEqual(markers.map(m=>m.price),[1.1,1.2]);
 assert.ok(markers.every(m=>m.color==='#5338ec'&&m.label?.includes('Selected idea')));
 const skipped=runWhatIf([entry],{kind:'mistakes',tags:['Counter-trend']});
 assert.ok(whatIfRecordedMarkers(skipped.trades,[entry],bars,'EUR/USD','15m','Skipped idea','#5338ec').every(m=>m.color==='#94a3b8'));
 assert.deepEqual(whatIfRecordedMarkers(output.trades,[{...entry,entryTime:undefined,exitTime:undefined}],bars,'EUR/USD','15m','Unknown','#5338ec'),[]);
 assert.deepEqual(whatIfRecordedMarkers(output.trades,[entry],bars,'BTC/USDT','15m','Other','#5338ec'),[]);
});
