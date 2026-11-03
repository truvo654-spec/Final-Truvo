import test from 'node:test';
import assert from 'node:assert/strict';
import {availableRuns,purchaseRunAllowance,completedRunUsage,reusableRuns} from '../runAccess';
import {defaultSettings} from '../rules';
import {BACKTEST_ENGINE_VERSION} from '../config';
import {retainRuns,saveRuns,loadRuns,loadUsage,thisMonth,type BacktestRun,type Usage} from '../store';

const exhausted=():Usage=>({month:thisMonth(),used:30,extraPaid:0,prepaid:0});
test('pay once: the persisted extra run is reused on rapid clicks and after a reload',()=>{
 let stored=exhausted(),credits=100,charges=0;
 const ports={load:()=>structuredClone(stored),save:(value:Usage)=>{stored=structuredClone(value);return true;},spend:()=>{assert.equal(stored.prepaid,1);credits-=15;charges++;return true;}};
 assert.equal(purchaseRunAllowance(30,ports).ok,true);
 assert.equal(purchaseRunAllowance(30,{...ports,load:()=>structuredClone(stored)}).ok,true);
 assert.equal(charges,1);assert.equal(credits,85);assert.equal(availableRuns(stored,30),1);
 const retry=completedRunUsage(stored,30,true,0);assert.equal(retry.prepaid,1);
 assert.equal(purchaseRunAllowance(30,ports).ok,true);assert.equal(charges,1);
 const done=completedRunUsage(stored,30,true,4);assert.equal(done.prepaid,0);assert.equal(done.extraPaid,1);
});
test('failed storage never charges; declined payment rolls back; failed/empty/unsaved tests retain access',()=>{
 let stored=exhausted(),charged=0;
 const ports={load:()=>stored,save:(u:Usage)=>{stored=u;return true;},spend:()=>{charged++;return true;}};
 assert.equal(purchaseRunAllowance(30,{...ports,save:()=>false}).ok,false);assert.equal(charged,0);
 assert.equal(purchaseRunAllowance(30,{...ports,spend:()=>false}).ok,false);assert.equal(stored.prepaid,0);
 const paid={...exhausted(),prepaid:1};
 for(const [saved,trades] of [[false,5],[true,0]] as const)assert.deepEqual(completedRunUsage(paid,30,saved,trades),paid);
 assert.equal(completedRunUsage({...paid,used:29},30,true,5).prepaid,1);
});
test('only complete current-engine results can reopen without another charge',()=>{
 const settings=defaultSettings(),run={id:'complete',engineVersion:BACKTEST_ENGINE_VERSION,status:'done',dataSource:'generated',settings,summary:{trades:2},output:{result:{trades:[{},{}]}}} as BacktestRun;
 const copy=structuredClone(settings);copy.rules.entry[0].id='new-editor-id';
 assert.deepEqual(reusableRuns([copy],[run]),[run]);
 assert.equal(reusableRuns([settings],[{...run,engineVersion:undefined}]),null);
 assert.equal(reusableRuns([settings],[{...run,summary:{...run.summary,trades:3}}]),null);
 copy.rules.exits.targetR=99;assert.equal(reusableRuns([copy],[run]),null);
});
test('a comparison over 30 results remains complete; full storage never saves truncated history',()=>{
 const batch=Array.from({length:45},(_,i)=>({id:String(i),name:'กราฟ แผน 📈',activityId:'one-comparison',output:{result:{trades:Array(201).fill({net:1})}}})) as BacktestRun[];
 assert.equal(retainRuns(batch).length,45);
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let stored=JSON.stringify(batch);let full=false;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>stored,setItem:(_key:string,value:string)=>{if(full||value.length>10000)throw Error('quota');stored=value;}}});
 try{
  assert.equal(loadRuns().length,45); // existing plain-JSON saves remain readable
  assert.equal(saveRuns(batch),true);assert.equal(loadRuns().length,45);assert.equal(loadRuns()[20].output.result.trades.length,201);
  assert.deepEqual(loadRuns(),batch);assert.ok(stored.length<JSON.stringify(batch).length/2);
  full=true;assert.equal(saveRuns([{...batch[0],id:'unsaved'},...batch]),false);assert.equal(loadRuns()[0].id,'0');
  stored=JSON.stringify({month:'2020-01',used:99,extraPaid:9,prepaid:2});assert.equal(loadUsage().prepaid,2);assert.equal(loadUsage().used,0);
  stored=JSON.stringify({month:thisMonth(),used:'invalid',prepaid:-1});assert.equal(availableRuns(loadUsage(),30),30);
 }finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else Reflect.deleteProperty(globalThis,'localStorage');}
});
