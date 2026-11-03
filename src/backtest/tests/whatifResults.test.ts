import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JOURNAL_ENTRIES} from '../../data/journalData';
import {runWhatIf} from '../whatif';
import {quickWhatIfAlternatives} from '../whatifQuick';
import {cond,ind,val} from '../rules';
import {compareParameters} from '../whatifOptimizer';
import {buildWhatIfStudy} from '../whatifStudy';
import {whatIfResultGroups,whatIfBreakdowns,projectWhatIfRow,whatIfDrawdownCurve} from '../whatifResults';
import {makeSavedWhatIf,whatIfSaveKey,savedWhatIfKey} from '../savedWhatIf';
import {loadWhatIfs,saveWhatIfs} from '../store';
import {WhatIfResultPicker} from '../../components/backtest/WhatIfResultPicker';
import {WhatIfResults} from '../../components/backtest/WhatIfResults';
import {WhatIfPriceChart} from '../../components/backtest/WhatIfPriceChart';
const entry=(id:string,symbol:string,strategy:string,net:number,hour:number)=>({...JOURNAL_ENTRIES[0],id,symbol,strategy,assetClass:symbol==='EUR/USD'?'Forex' as const:'Crypto' as const,date:'2026-10-01',entryTime:'2026-10-01T'+String(hour).padStart(2,'0')+':00:00Z',exitTime:'2026-10-01T'+String(hour).padStart(2,'0')+':30:00Z',accountCurrency:'USD',pnl:net,commission:0,tradingStatus:'closed' as const,pnlKnown:true,outcome:net>0?'win' as const:'loss' as const});
const entries=[entry('loss-forex','EUR/USD','Swing',-100,9),entry('loss-crypto','BTC/USDT','Scalping',-50,10),entry('late-win','EUR/USD','Swing',300,11)];
const rule={kind:'lossesPerDay' as const,n:2};

test('result picker lists only observed playbook / instrument pairs and retains exact IDs',()=>{
 const groups=whatIfResultGroups(entries);
 assert.equal(groups.length,3);assert.equal(groups[0].id,'all');
 assert.deepEqual(groups.map(g=>g.label).sort(),['All selected trades','Scalping · BTC/USDT','Swing · EUR/USD'].sort());
 assert.deepEqual(groups.find(g=>g.label==='Swing · EUR/USD')!.tradeIds,['loss-forex','late-win']);
 const html=renderToStaticMarkup(createElement(WhatIfResultPicker,{groups,value:'all',onChange:()=>{}}));
 assert.match(html,/aria-label="What-if result"/);assert.match(html,/optgroup label="Crypto"/);assert.match(html,/optgroup label="Forex"/);
 assert.doesNotMatch(html,/Swing · BTC|Scalping · EUR/);
});

test('breakdowns retain cross-instrument daily stop decisions instead of rerunning the filtered trades',()=>{
 const output=runWhatIf(entries,rule),parts=whatIfBreakdowns(output,entries),swing=parts.find(g=>g.label==='Swing · EUR/USD')!;
 assert.equal(output.actual.netPnl,150);assert.equal(output.whatIf.netPnl,-150);
 assert.equal(swing.output.actual.netPnl,200);assert.equal(swing.output.whatIf.netPnl,-100);
 assert.equal(swing.output.trades.find(t=>t.id==='late-win')!.status,'skipped');
 assert.equal(runWhatIf(entries.filter(e=>e.strategy==='Swing'),rule).whatIf.netPnl,200);
 assert.equal(parts.reduce((sum,g)=>sum+g.output.whatIf.netPnl,0),output.whatIf.netPnl);
 assert.equal(swing.output.actual.profitFactor,3);assert.equal(output.actual.profitFactor,2);
 assert.equal(swing.output.whatIf.maxDD,100);assert.equal(output.whatIf.maxDD,150);
});

test('advanced study and basic breakdown share the same decision ledger and cohort split',()=>{
 const row=compareParameters(entries,[rule])[0],ids=['loss-forex','late-win'];
 const projected=projectWhatIfRow(row,entries,ids),study=buildWhatIfStudy(entries,rule,[1,3,1],'net',ids);
 assert.deepEqual(study.rows[0].output,projected.output);
 assert.deepEqual(projected.training.trades.map(t=>t.id),ids);
 assert.equal(projected.trainingCount,2);assert.equal(projected.validation,null);
 assert.equal(projected.crossingCount,0);
});

test('one saved comparison freezes every breakdown and restores special metrics without rerunning',t=>{
 const previous=globalThis.localStorage,values=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)}});
 t.after(()=>Object.defineProperty(globalThis,'localStorage',{configurable:true,value:previous}));
 const row=compareParameters(entries,[rule])[0],breakdowns=whatIfBreakdowns(row.output,entries);
 const context={currency:'USD',source:'user' as const,goal:'net' as const,benchmark:'Chosen journal',scope:{'Trade IDs':entries.map(e=>e.id).join(',')},breakdowns,selectedBreakdown:breakdowns[0].id};
 const saved=makeSavedWhatIf(row,context,'Comparison');assert.equal(saveWhatIfs([saved]),true);
 const restored=loadWhatIfs()[0];assert.deepEqual(restored.snapshot!.breakdowns,breakdowns);
 assert.equal(restored.snapshot!.output.actual.trades,3);
 assert.equal(savedWhatIfKey(restored),whatIfSaveKey(rule,{...context,selectedBreakdown:'all'},row.output));
 breakdowns[0].output.trades[0].newNet=123456;
 assert.notEqual(restored.snapshot!.breakdowns![0].output.trades[0].newNet,123456);
});


test('a single technical condition does not create a duplicate alternative under another label',()=>{
 const rules=quickWhatIfAlternatives({kind:'technical',label:'RSI',timeframe:'15m',conditions:[cond(ind('RSI',14),'gt',val(50))]});
 assert.equal(rules.length,1);
});

test('multi-condition technical comparison includes the compare-conditions section',()=>{
 const technical={kind:'technical' as const,label:'Multi-filter',timeframe:'15m' as const,conditions:[cond(ind('RSI',14),'gt',val(50)),cond(ind('ADX',14),'gt',val(25))]};
 const rows=compareParameters(entries,quickWhatIfAlternatives(technical));
 assert.equal(rows.length,3);
 const html=renderToStaticMarkup(createElement(WhatIfResults,{rows,selected:rows[0],currency:'USD',summary:'Journal · 3 trades',simulation:false,saved:false,onSelect:()=>{},onSave:()=>{},onTrades:()=>{},onClose:()=>{}}));
 assert.match(html,/aria-label="Compare values of this rule"/);
 assert.match(html,/Compare conditions/);
 assert.match(html,/Condition 1 only/);
 assert.match(html,/Condition 2 only/);
 assert.match(html,/RSI\(14\) is above 50/);
 assert.match(html,/ADX\(14\) is above 25/);
});

test('all twelve configured conditions get separate results and colors with an unchanged benchmark',()=>{
 const technical={kind:'technical' as const,label:'All filters',timeframe:'15m' as const,conditions:Array.from({length:12},(_,i)=>cond(ind('RSI',14),'gt',val(i+20)))};
 const before=JSON.stringify(technical);
 const variants=quickWhatIfAlternatives(technical);
 assert.equal(variants.length,13);
 assert.deepEqual(variants[0],technical);
 for(let i=0;i<12;i++){const variant=variants[i+1];assert.deepEqual(variant.kind==='technical'?variant.conditions:[],[technical.conditions[i]]);}
 const rows=compareParameters(entries,variants);
 for(const row of rows)assert.deepEqual(row.output.trades.map(t=>({id:t.id,net:t.actualNet})),rows[0].output.trades.map(t=>({id:t.id,net:t.actualNet})));
 const render=(selected:typeof rows[number])=>renderToStaticMarkup(createElement(WhatIfResults,{rows,selected,currency:'USD',summary:'Journal',simulation:true,saved:false,onSelect:()=>{},onSave:()=>{},onTrades:()=>{},onClose:()=>{}}));
 const html=render(rows[12]);
 assert.match(html,/Condition 12 only/);
 assert.match(html,/All conditions \(AND\)/);
 assert.match(html,/Original test · before technical filters/);
 const chart=html.split('aria-label="Original and selected What-if cumulative net P&amp;L"')[1].split('</svg>')[0];
 assert.equal((chart.match(/stroke-width="2"[^>]*stroke-linejoin="round"/g)??[]).length,14);
 assert.equal(new Set([...chart.matchAll(/<path[^>]+stroke="([^"]+)"/g)].map(match=>match[1])).size,14);
 assert.match(chart,/stroke="#94a3b8"[^>]+stroke-dasharray="6 4"/);
 const benchmark=(text:string)=>text.match(/<path d="([^"]+)" fill="none" stroke="#94a3b8"/)?.[1];
 assert.equal(benchmark(html),benchmark(render(rows[0])));
 assert.equal(JSON.stringify(technical),before);
});

test('drawdown curves match daily entry-date metrics for baseline and scenarios',()=>{
 const history=[entry('win','EUR/USD','Swing',100,9),{...entry('loss','EUR/USD','Swing',-200,10),date:'2026-10-02',entryTime:'2026-10-02T10:00:00Z',exitTime:'2026-10-04T10:30:00Z'},{...entry('recovery','EUR/USD','Swing',50,11),date:'2026-10-03',entryTime:'2026-10-03T11:00:00Z',exitTime:'2026-10-03T11:30:00Z'}];
 const output=runWhatIf(history,{kind:'mistakes',tags:['none']});
 for(const actual of [true,false]){
  const points=whatIfDrawdownCurve(output,history,actual);
  assert.deepEqual(points.map(p=>p.y),[0,-200,-150]);
  assert.equal(-Math.min(...points.map(p=>p.y)),(actual?output.actual:output.whatIf).maxDD);
  assert.equal(new Date(points[1].x).toISOString().slice(0,10),'2026-10-02');
 }
 assert.deepEqual(whatIfDrawdownCurve({...output,trades:[]},history),[]);
});

test('price-chart markers and P&L share the selected scenario color and labelled entry/exit',()=>{
 const output=runWhatIf(entries,rule);
 const html=renderToStaticMarkup(createElement(WhatIfPriceChart,{trades:output.trades,entries,simulation:false,money:String,scenario:'Condition 2 only',scenarioColor:'#d97706',onTrades:()=>{}}));
 assert.match(html,/stroke="#d97706"/);
 assert.match(html,/Condition 2 only · Entry · Long/);
 assert.match(html,/Condition 2 only · Exit · Long/);
 assert.match(html,/Colored entry\/exit dots/);
 const rows=compareParameters(entries,[rule]);
 const result=renderToStaticMarkup(createElement(WhatIfResults,{rows,selected:rows[0],currency:'USD',summary:'Journal',simulation:false,saved:false,onSelect:()=>{},onSave:()=>{},onTrades:()=>{},onClose:()=>{}}));
 assert.match(result,/aria-label="What-if drawdown comparison"/);
 assert.match(result,/aria-label="Original and scenario drawdown"/);
});
