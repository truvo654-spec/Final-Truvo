import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CandleChart} from '../../backtest/charts';
import {candleTimePosition,candlePositionTime,linkedValueAt,linkedStepPath,type LinkedPanel} from '../../backtest/linkedPerformance';
import {executionCurve} from '../executionChartData';
import {priceWindowEnd} from '../executionPriceStudy';
import type {Bar} from '../../../backtest/types';
const hour=3600000,start=Date.parse('2026-10-05T12:00:00Z');
const bars:Bar[]=Array.from({length:4},(_,i)=>({t:start+i*hour,o:100+i,h:105+i,l:95+i,c:102+i,v:10}));
const values=[{at:start+hour/2,value:100},{at:start+2*hour+hour/2,value:60},{at:start+4*hour,value:80}];
const panels:LinkedPanel[]=[{id:'pnl',label:'Cumulative closed P&L',color:'purple',points:values,format:String},{id:'drawdown',label:'Drawdown from peak',color:'red',points:values.map(p=>({...p,value:100-p.value})),format:String,underwater:true}];

test('Candle, fill and performance event timestamps share one invertible scale',()=>{
 for(const at of [start,start+hour/2,start+hour,start+3.5*hour,start+4*hour]){
  const position=candleTimePosition(bars,0,4,at,start+4*hour);
  assert.ok(Math.abs(candlePositionTime(bars,0,4,position,start+4*hour)-at)<1);
 }
 const gap=[bars[0],{...bars[1],t:start+48*hour}];
 const at=start+24*hour,pos=candleTimePosition(gap,0,2,at,start+49*hour);
 assert.ok(Math.abs(candlePositionTime(gap,0,2,pos,start+49*hour)-at)<1);
});

test('Zoomed panes carry earlier results, preserve peaks, and exclude future closes',()=>{
 const nodes=executionCurve([{id:'a',at:start,entryAt:start-1,net:100,r:1,symbol:'US500'},{id:'b',at:start+hour,entryAt:start,net:-60,r:-0.6,symbol:'US500'},{id:'future',at:start+4*hour,entryAt:start+3*hour,net:200,r:2,symbol:'US500'}],1000);
 const points=nodes.map(node=>({at:node.at,value:node.cumulative}));
 assert.equal(linkedValueAt(points,start+2*hour),40);
 assert.equal(linkedStepPath(points,start+2*hour,start+3*hour,n=>n-start,n=>n),`M ${2*hour} 40 H ${3*hour}`);
 assert.equal(linkedValueAt(nodes.map(node=>({at:node.at,value:node.drawdown})),start+2*hour),60);
 assert.equal(linkedValueAt(points,start-1),0);
});

test('Window includes closes inside the last visible candle and respects calendar boundaries',()=>{
 assert.equal(priceWindowEnd(bars,3,'1h',start+4*hour),start+3*hour);
 assert.equal(priceWindowEnd(bars,4,'1h',start+3.5*hour),start+3.5*hour);
 assert.equal(linkedValueAt(values,start+2*hour),100);
 assert.equal(linkedValueAt(values,priceWindowEnd(bars,3,'1h',start+4*hour)),60);
 const month=[{...bars[0],t:Date.parse('2026-09-01')}];
 assert.equal(priceWindowEnd(month,1,'1M',Date.parse('2026-12-01')),Date.parse('2026-10-01'));
});

test('Market chart renders both performance panes in one SVG and one time axis',()=>{
 const html=renderToStaticMarkup(createElement(CandleChart,{bars,from:1,to:3,height:260,dp:2,label:'Linked chart',interactive:true,showTimeAxis:true,linkedPanels:panels,timelineEnd:start+3*hour}));
 assert.equal((html.match(/<svg/g)??[]).length,1);
 assert.match(html,/Cumulative closed P&amp;L/);assert.match(html,/Drawdown from peak/);
 assert.match(html,/viewBox="0 0 760 464"/);assert.doesNotMatch(html,/NaN/);
 assert.equal((html.match(/10-05 13:00 UTC/g)??[]).length,1);
});


test('A fill marker and its closed-P&L step have identical horizontal positions',()=>{
 const at=start+hour/2,position=8+candleTimePosition(bars,0,4,at,start+4*hour)*(760-8-64);
 const html=renderToStaticMarkup(createElement(CandleChart,{bars,from:0,to:4,dp:2,label:'Matching close',linkedPanels:panels,timelineEnd:start+4*hour,markers:[{index:0,price:102,kind:'exit',time:at}],onMarkerClick:()=>{}}));
 assert.ok(html.includes(`cx="${position}"`));assert.ok(html.includes(` H ${position} V `));
 const single=renderToStaticMarkup(createElement(CandleChart,{bars:[bars[0]],from:0,to:1,dp:2,label:'One candle',showTimeAxis:true,linkedPanels:panels,timelineEnd:start+hour}));
 assert.match(single,/10-05 12:00 UTC/);assert.match(single,/10-05 12:59 UTC/);
});
