import test from 'node:test';
import assert from 'node:assert/strict';
import {resultTradeReplay,replayCandleGroups,replayTradePerformance} from '../../../backtest/resultTradeReplay';
import {runSync} from '../../../backtest/engine';
import {seriesFromBars} from '../../../backtest/marketData';
import {defaultSettings,cond,price,val} from '../../../backtest/rules';
import type {BacktestTrade,Series} from '../../../backtest/types';
const step=300000;
const series:Series={symbol:'MGC',tf:'5m',length:8,t:Float64Array.from({length:8},(_,i)=>i*step),o:Float64Array.from({length:8},(_,i)=>100+i),h:new Float64Array(8).fill(110),l:new Float64Array(8).fill(90),c:new Float64Array(8).fill(105),v:new Float64Array(8).fill(10)};
const trade={entryTime:2*step,exitTime:4*step,orderType:'market',exitReason:'target'} as BacktestTrade;
test('replay uses exact saved OHLC and stops at the exit bar, without revealing future bars',()=>{
 const replay=resultTradeReplay(series,trade);
 assert.equal(replay.entryIndex,2);assert.equal(replay.exitIndex,4);assert.equal(replay.start,3);
 assert.deepEqual(replay.bars.map(b=>b.o),[100,101,102,103,104]);assert.equal(replay.bars.at(-1)!.t,trade.exitTime);
 assert.equal(series.length,8);
});
test('close-time fills map to the candle that just closed, including end-of-series exits',()=>{
 const replay=resultTradeReplay(series,{...trade,exitReason:'time'},true);
 assert.equal(replay.entryIndex,1);assert.equal(replay.exitIndex,3);
 assert.equal(resultTradeReplay(series,{...trade,exitReason:'end of test',exitTime:8*step}).exitIndex,7);
 assert.equal(resultTradeReplay(series,{...trade,orderType:'limit'},true).entryIndex,2);
});
test('single-bar trades and market gaps keep real bar indices',()=>{
 const one=resultTradeReplay(series,{...trade,exitTime:trade.entryTime});assert.equal(one.start,one.bars.length);
 const gaps={...series,t:Float64Array.from([0,step,2*step,6*step,7*step,8*step,9*step,10*step])};
 const replay=resultTradeReplay(gaps,{...trade,exitReason:'session end',exitTime:3*step});
 assert.equal(replay.bars.at(-1)!.t,2*step);
});
test('unavailable or invalid trade ranges return no substitute candles',()=>{
 assert.equal(resultTradeReplay({...series,length:0},trade).bars.length,0);
 for(const patch of [{entryTime:-1},{exitTime:9*step},{exitTime:step},{entryTime:NaN}])assert.equal(resultTradeReplay(series,{...trade,...patch}).bars.length,0);
});


test('larger chart candles contain only revealed prices and leave source data unchanged',()=>{
 const bars=[{t:0,o:10,h:12,l:9,c:11,v:1},{t:900000,o:11,h:15,l:8,c:14,v:2},{t:1800000,o:14,h:999,l:1,c:900,v:3}];
 const before=JSON.stringify(bars),groups=replayCandleGroups(bars,2,'1h');
 assert.deepEqual(groups,[{t:0,o:10,h:15,l:8,c:14,v:3}]);assert.equal(JSON.stringify(bars),before);
 assert.equal(replayCandleGroups(bars,3,'1h')[0].c,900);
});

function performanceFixture(currency:'USD'|'EUR'='USD',side:'long'|'short'='long',sameClose=false){
 const settings=defaultSettings();settings.symbol='EUR/USD';settings.timeframe='5m';settings.news='include';settings.session={id:'any',start:0,end:24};settings.weekdays=[1,2,3,4,5];
 settings.rules={direction:side,entry:[cond(price('close'),'crossAbove',val(1.1))],entryOrder:{type:'market'},exits:{stop:{type:'points',value:20},targetR:2,partial:{atR:1,fraction:.5},breakevenAtR:null,breakevenLockR:0,trailing:null,timeExitBars:null,sessionEndExit:false},maxTradesPerDay:null};
 settings.risk={...settings.risk,mode:'fixedQty',qty:1,currency,dailyLossPct:null,maxDrawdownPct:null};
 settings.costs={enabled:true,brokerId:null,commissionPerSide:3.5,spread:.2,slippage:.2,fillModel:sameClose?'sameClose':'nextOpen'};
 const values=[...Array.from({length:20},()=>[1.095,1.0955,1.0945,1.095]),[1.095,1.1012,1.0948,1.101],[1.101,1.102,1.1005,1.1015],[1.1015,1.1035,1.1013,1.1032],[1.1032,1.1034,1.102,1.1022],[1.1022,1.106,1.102,1.1055]];
 const data=seriesFromBars('EUR/USD','5m',values.map(([o,h,l,c],i)=>({t:Date.UTC(2026,0,5,8)+i*step,o:side==='long'?o:2.2-o,h:side==='long'?h:2.2-l,l:side==='long'?l:2.2-h,c:side==='long'?c:2.2-c,v:100})));
 const trade=runSync(settings,data).trades[0];assert.ok(trade);assert.equal(trade.partial,true);
 return {settings,data,trade};
}
test('playback P&L includes partial exits, cost estimates and exact final net in account currency',()=>{
 for(const currency of ['USD','EUR'] as const)for(const side of ['long','short'] as const){
  const {settings,data,trade}=performanceFixture(currency,side);const before=JSON.stringify({settings,trade});
  const points=replayTradePerformance(settings,data,trade)!;assert.ok(points);assert.equal(points.at(-1)!.net,trade.net);assert.equal(points.at(-1)!.remaining,0);
  const partial=points.findIndex(p=>p.remaining===.5);assert.ok(partial>=0);
  const expected=50/(currency==='EUR'?1.08:1);assert.ok(Math.abs(points[partial].net-points[partial+1].net-expected)<.00001);
  assert.ok(Math.abs(points[partial+1].drawdown-expected)<.00001);
  assert.ok(points.at(-1)!.maxDrawdown>=expected-.00001);
  assert.equal(JSON.stringify({settings,trade}),before);
 }
});
test('same-close entries include costs immediately, and mismatched saved results are not replaced',()=>{
 const {settings,data,trade}=performanceFixture('USD','long',true),points=replayTradePerformance(settings,data,trade)!;
 assert.ok(points[0].net<0);assert.equal(points[0].drawdown,-points[0].net);assert.equal(points.at(-1)!.net,trade.net);
 assert.equal(replayTradePerformance(settings,data,{...trade,net:trade.net+10}),null);
});
