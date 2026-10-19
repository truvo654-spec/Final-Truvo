import test from 'node:test';
import assert from 'node:assert/strict';
import { clearPracticeDraft,loadPracticeDraft,savePracticeDraft,validPracticeDraft,type PracticeDraft } from '../practiceDraft';

const draft:PracticeDraft={
  version:1,data:{id:'D',source:'random',symbol:'NVDA',tf:'5m',bars:[0,1,2,3].map(i=>({t:Date.UTC(2026,0,5,10,i*5),o:100,h:102,l:98,c:101,v:1000})),
    start:1,dp:2,tick:0.01,multiplier:1,sizeUnit:'shares',minSize:1,label:'Demo',dateLabel:'Jan 5'},
  cursor:2,minCursor:1,sessionId:'S',startedAt:'2026-01-05T10:00:00Z',pending:null,
  pos:{dir:1,entry:100,size:10,stop:98,target:104,entryBar:1,initRisk:20,tags:['practice']},trades:[],notes:'Keep this thesis',tags:['practice'],drawings:[99],
  source:'random',filter:{markets:[],symbols:[],result:'all',playbook:'',mistake:''},blind:true,useJournalSetup:true,pickId:null,
  side:1,otype:'market',oprice:'',riskPct:1,startingBalance:10000,useRecordedSize:false,stopPx:'98',targetPx:'104',
  targetR:2,stopAtr:1.5,stopFraction:1,breakevenR:'',sessionStart:'9',sessionEnd:'16',maxTrades:'3',lossLimit:'2',dailyLoss:'300',related:null,ticketEdited:true,
};
test('unfinished practice restores exact bars, cursor, position, guardrails and notes without completing a session',()=>{
  const memory=new Map<string,string>();const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>memory.get(key) ?? null,setItem:(key:string,value:string)=>memory.set(key,value),removeItem:(key:string)=>memory.delete(key)}});
  try {
    assert.ok(validPracticeDraft(draft));assert.ok(savePracticeDraft(draft));
    assert.deepEqual(loadPracticeDraft(),{draft,error:''});
    assert.equal(memory.has('ms_backtest_replay_v1'),false);assert.equal(memory.has('ms_backtest_awarded_v1'),false);
    const broken={...draft,cursor:999};assert.equal(validPracticeDraft(broken),false);
    memory.set('ms_backtest_practice_draft_v1',JSON.stringify(broken));
    assert.ok(loadPracticeDraft().error);assert.equal(loadPracticeDraft().draft,null);
    assert.equal(memory.get('ms_backtest_practice_draft_v1'),JSON.stringify(broken));
    assert.ok(clearPracticeDraft());assert.deepEqual(loadPracticeDraft(),{draft:null,error:''});
  } finally {if(previous)Object.defineProperty(globalThis,'localStorage',previous);else Reflect.deleteProperty(globalThis,'localStorage');}
});
