import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CandleChart} from '../../components/backtest/charts';
import {TradeMarkerBadge,tradeBadgePosition,tradeBadgeLanes} from '../../components/backtest/TradeMarkerBadge';

const bars=Array.from({length:4},(_,i)=>({t:Date.UTC(2026,9,1,10,i*15),o:100,h:120,l:80,c:110,v:100}));

test('buy, sell and exit badges name their source and preserve marker actions',()=>{
 const html=renderToStaticMarkup(createElement(CandleChart,{bars,from:0,to:4,dp:2,label:'Sources',onMarkerClick:()=>{},markers:[
  {index:0,price:90,kind:'buy',source:'History',id:'history',time:bars[0].t},
  {index:2,price:110,kind:'sell',source:'Condition 1',id:'condition',time:bars[2].t},
  {index:3,price:100,kind:'exit',source:'Scenario 1',id:'exit',time:bars[3].t},
 ]}));
 for(const label of ['BUY · History','SELL · Condition 1','EXIT · Scenario 1'])assert.ok(html.includes(label));
 assert.equal((html.match(/role="button"/g)??[]).length,3);
 assert.match(html,/at 90.00/);
 assert.match(html,/2026-10-01T10:00 UTC/);
 assert.doesNotMatch(html,/NaN|Infinity/);
});

test('badges stay in plot bounds and crowded trades retain focusable dots',()=>{
 for(const kind of ['buy','sell','exit'] as const){
  for(const [x,y] of [[8,10],[216,230]]){
   const box=tradeBadgePosition(x,y,kind,'History',8,216,10,232);
   assert.ok(box.x>=8&&box.x+box.width<=216);
   assert.ok(box.y>=10&&box.y+box.height<=232);
  }
 }
 const source='A very long scenario name that must retain its accessible identity';
 const badge=renderToStaticMarkup(createElement(TradeMarkerBadge,{x:100,y:120,kind:'buy',source,color:'#5338ec',left:8,right:216,top:10,bottom:232}));
 assert.match(badge,/…/);
 const points=Array.from({length:30},()=>({x:100,y:100,kind:'buy' as const,source:'History'}));
 assert.ok(tradeBadgeLanes(points,{left:8,right:216,top:10,bottom:232}).some(lane=>lane===null));
 const html=renderToStaticMarkup(createElement(CandleChart,{bars,from:0,to:4,dp:2,label:'Crowded trades',onMarkerClick:()=>{},markers:points.map((_,i)=>({index:1,price:100,kind:'buy' as const,source,id:String(i)}))}));
 assert.equal((html.match(/role="button"/g)??[]).length,30);
 assert.ok(html.includes(source));
});

test('invalid marker geometry and unrevealed replay trades are not drawn',()=>{
 const html=renderToStaticMarkup(createElement(CandleChart,{bars,from:0,to:2,dp:2,label:'Replay',markers:[
  {index:-1,price:100,kind:'buy',source:'Invalid'},
  {index:0,price:NaN,kind:'buy',source:'Missing'},
  {index:3,price:100,kind:'sell',source:'Future'},
  {index:1,price:100,kind:'buy',source:'Practice'},
 ]}));
 assert.match(html,/BUY · Practice/);
 assert.doesNotMatch(html,/BUY · Invalid|BUY · Missing|SELL · Future|NaN/);
});
