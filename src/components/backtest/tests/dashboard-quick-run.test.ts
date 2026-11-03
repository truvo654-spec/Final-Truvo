import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {dashboardQuickRun} from '../dashboardQuickRun';
import {DashboardRunPrompt} from '../DashboardRunPrompt';
import {DashboardOverview} from '../DashboardOverview';
import {dashboardSources,dashboardStats,filterDashboardRows,initialDashboardScope} from '../dashboardData';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
import {cond,defaultSettings,deepClone,price,val} from '../../../backtest/rules';
import {performJob,CancelledError} from '../../../backtest/job';
import {summarize,type BacktestRun} from '../../../backtest/store';

const book=DEFAULT_PLAYBOOKS[0],rules={maxRisk:1,maxDailyLoss:3,maxTrades:3} as any;
const savedSettings=()=>{
 const settings=defaultSettings({playbook:book});
 settings.symbol='EUR/USD';settings.from='2026-09-01';settings.to='2026-10-07';settings.timeframe='15m';
 return settings;
};

test('rerun keeps the entire saved setup and benchmark, independent of current playbook or Lab edits',()=>{
 const settings=savedSettings(),run={settings,sourceTradeIds:['exact-record']} as BacktestRun;
 const draft=deepClone(settings);draft.risk.percent=9;draft.from='2026-10-07';
 const result=dashboardQuickRun({run,bookId:'deleted',tradeIds:['unrelated']},[],[],rules,{[book.id]:draft},draft);
 assert.deepEqual(result,{settings,tradeIds:['exact-record']});
 result.settings.risk.percent=8;result.settings.rules.entry.length=0;result.tradeIds.push('new');
 assert.notEqual(settings.risk.percent,8);assert.ok(settings.rules.entry.length);assert.deepEqual(run.sourceTradeIds,['exact-record']);
});

test('new dashboard tests reuse the chosen Lab copy or saved playbook without mutating journal data',()=>{
 const draft=savedSettings();draft.risk.percent=2.5;
 const entries=JOURNAL_ENTRIES.slice(0,2),before=JSON.stringify(entries);
 const result=dashboardQuickRun({bookId:book.id,tradeIds:[entries[0].id]},[book],entries,rules,{[book.id]:draft},defaultSettings());
 assert.deepEqual(result.settings,draft);assert.deepEqual(result.tradeIds,[entries[0].id]);
 result.settings.rules.entry.length=0;assert.ok(draft.rules.entry.length);assert.equal(JSON.stringify(entries),before);
 const custom={...book,instrumentTimeframe:'1h' as const,directions:['short' as const],benchmarkRR:3};
 const fromBook=dashboardQuickRun({bookId:book.id},[custom],[],rules,{},defaultSettings()).settings;
 assert.equal(fromBook.timeframe,'1h');assert.equal(fromBook.rules.direction,'short');assert.equal(fromBook.rules.exits.targetR,3);
 assert.throws(()=>dashboardQuickRun({bookId:book.id},[{...book,status:'archived'}],[],rules,{},draft),/Choose a playbook/);
});

test('a real demo run supplies dashboard rows, metrics and chart, and clears an old empty filter scope',async()=>{
 const settings=savedSettings();settings.rules.entry=[cond(price('close'),'gt',val(0))];settings.rules.direction='long';
 const output=await performJob(settings);
 assert.ok(output.result.trades.length>0);
 const run:BacktestRun={id:'new-result',name:settings.name,playbookId:book.id,settings,symbol:settings.symbol,timeframe:settings.timeframe,from:settings.from,to:settings.to,mode:'automated',status:'done',createdAt:'2026-11-03',lastRun:'2026-11-03',summary:summarize(output),output};
 const oldScope={...initialDashboardScope([run],[]),from:'2027-01-01',symbols:['NVDA']};
 const source=dashboardSources([run],[],[],[book],oldScope)[0];assert.equal(filterDashboardRows(source,oldScope).length,0);
 const scope=initialDashboardScope([run],[],{resultIds:['run:'+run.id]},oldScope);
 const rows=filterDashboardRows(source,scope),stats=dashboardStats(rows,source.balance);
 assert.equal(stats.count,output.result.trades.length);assert.equal(stats.net,run.summary.net);
 const props={rows,source,unit:'money' as const,advanced:true,visibleWidgets:['performance'],widgets:[],selectedSources:[source],scope,onSetBalance:()=>{},privacy:false,timezone:'UTC',format:String,money:String,valueOf:(row:typeof rows[number])=>row.net,onInspect:()=>{},emptyAction:createElement('button',null,'Run test')};
 const filled=renderToStaticMarkup(createElement(DashboardOverview,props));
 assert.match(filled,/Overview performance/);assert.doesNotMatch(filled,/>Run test</);
 const empty=renderToStaticMarkup(createElement(DashboardOverview,{...props,rows:[]}));
 assert.match(empty,/>Run test</);assert.doesNotMatch(empty,/View trades →/);
});

test('zero signals stay empty with their engine explanation, while cancellation rejects the run',async()=>{
 const settings=savedSettings();settings.rules.entry=[cond(price('close'),'lt',val(0))];settings.rules.direction='long';
 const output=await performJob(settings);assert.equal(output.result.trades.length,0);assert.ok(output.result.zeroTradeReason);
 const run={settings,symbol:settings.symbol,timeframe:settings.timeframe,from:settings.from,to:settings.to,output} as BacktestRun;
 const props={run,options:[],bookId:'',onBook:()=>{},onRun:()=>{},running:false,progress:0,hiddenResults:false,onClear:()=>{}};
 const html=renderToStaticMarkup(createElement(DashboardRunPrompt,props));
 assert.match(html,/No trades in this test yet/);assert.ok(html.includes(renderToStaticMarkup(createElement('span',null,output.result.zeroTradeReason)).slice(6,-7)));assert.match(html,/>Run test</);
 const loading=renderToStaticMarkup(createElement(DashboardRunPrompt,{...props,running:true,progress:.4,onCancel:()=>{}}));
 assert.match(loading,/Test progress/);assert.match(loading,/Cancel test/);assert.doesNotMatch(loading,/>Run test</);
 const long=savedSettings();long.from='2024-10-07';long.timeframe='5m';
 await assert.rejects(performJob(long,{cancelled:()=>true}),CancelledError);
});
