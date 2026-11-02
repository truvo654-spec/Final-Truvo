import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {WhatIfTrade} from '../../../backtest/whatif';
import {whatIfPerformance,windowWhatIfSeries} from '../whatIfChart';
import {LineChart} from '../charts';
import {linkedValueAt} from '../linkedPerformance';
const trade=(id:string,exitTime:number,actualNet:number,newNet=actualNet,status:WhatIfTrade['status']='same'):WhatIfTrade=>({id,symbol:'EUR/USD',strategy:'Test',direction:'BUY',entryTime:exitTime-1,exitTime,actualNet,newNet,actualR:null,newR:null,status,note:'',mistakes:[]});

test('linked What-if performance uses exact closes, groups simultaneous exits and excludes skipped trades',()=>{
 const trades=[trade('profit',10,100),trade('loss',20,-150),trade('skipped',30,-100,0,'skipped'),trade('recover',40,50)];
 const before=JSON.stringify(trades),actual=whatIfPerformance(trades,true),scenario=whatIfPerformance(trades,false);
 assert.deepEqual([actual.count,actual.net,actual.maxDD],[4,-100,250]);
 assert.deepEqual([scenario.count,scenario.net,scenario.maxDD],[3,0,150]);
 assert.equal(linkedValueAt(scenario.nodes.map(n=>({at:n.at,value:n.cumulative})),19),100);
 const sameTime=whatIfPerformance([trade('first',10,200),trade('second',10,-200)],true);
 assert.equal(sameTime.nodes.length,1);assert.equal(sameTime.maxDD,0);
 assert.equal(JSON.stringify(trades),before);
});

test('equity zoom carries known values without showing a future close or dropping prior P&L',()=>{
 const series=[{name:'Original',color:'#5338ec',points:[{x:0,y:0},{x:10,y:100},{x:20,y:-50},{x:30,y:0}]}];
 assert.deepEqual(windowWhatIfSeries(series,12,18)[0].points,[{x:12,y:100},{x:18,y:100}]);
 assert.deepEqual(windowWhatIfSeries(series,12,25)[0].points,[{x:12,y:100},{x:20,y:-50},{x:25,y:-50}]);
 assert.equal(series[0].points.length,4);
});

test('equity-only chart keeps linked performance panes and time scale when no candles exist',()=>{
 const html=renderToStaticMarkup(createElement(LineChart,{series:[{name:'Original',color:'#5338ec',points:[{x:10,y:0},{x:20,y:100}]}],label:'Equity comparison',timeline:[0,30],timeTicks:[0,10,20],yFmt:String,xFmt:String,linkedPanels:[{id:'pnl',label:'Cumulative closed P&L',color:'#5338ec',points:[{at:20,value:100}],format:String},{id:'dd',label:'Drawdown from peak',color:'#e11d48',points:[{at:20,value:0}],format:String,underwater:true}]}));
 assert.match(html,/Cumulative closed P&amp;L/);assert.match(html,/Drawdown from peak/);assert.match(html,/tabindex="0"/);assert.doesNotMatch(html,/NaN|Infinity/);
});
