import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JournalEntry, UserProfile } from '../../../types';
import { INITIAL_USER } from '../../../data/mockData';
import { InsightsDrillDialog, JournalInsights } from '../JournalInsights';
import { JOURNAL_MARKET_TYPES } from '../journalOverview';
import { JournalOpenInsightsChart, openInsightGroups } from '../JournalOpenInsightsChart';

const trade=(patch:Partial<JournalEntry>={}):JournalEntry=>({id:'isolated',date:'2026-10-01',symbol:'TEST',assetClass:'Stocks',direction:'BUY',entryPrice:10,exitPrice:12,size:1,pnl:20,rMultiple:null,outcome:'win',tradingStatus:'closed',commission:0,strategy:'Breakout',tags:[],setupNotes:'',emotionBefore:null,emotionAfter:null,followedPlan:null,checklistDone:[],mistakes:[],lessons:'',rating:null,source:'manual',accountCurrency:'USD',...patch});

function render(entries:JournalEntry[],saved:Record<string,unknown>={},user:UserProfile={...INITIAL_USER,tierLevel:4},isLoggedIn=true) {
  const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const read:string[]=[];
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>{
    read.push(key);
    const name=key.replace(/^ms-journal-v2-/,'');
    return name in saved?JSON.stringify(saved[name]):null;
  }}});
  try {
    const html=renderToStaticMarkup(createElement(JournalInsights,{entries,brokers:[],overview:null,onDrill:()=>{},onToast:()=>{},user,isLoggedIn,onSignIn:()=>{},onUnlockCrossAnalysis:()=>false}));
    return {html,text:html.replace(/<[^>]*>/g,''),read};
  } finally {
    if(original)Object.defineProperty(globalThis,'localStorage',original);
    else Reflect.deleteProperty(globalThis,'localStorage');
  }
}

test('Cross analysis renders its controls only for included or actively unlocked members',()=>{
  const entries=[trade({brokerId:'unique-broker'})];
  const section=(html:string)=>html.split('aria-label="Cross analysis matrix">')[1].split('</section>')[0];
  const locked=section(render(entries,{}, {...INITIAL_USER,tierLevel:3}).html);
  assert.match(locked,/Unlock with Credits/);
  assert.doesNotMatch(locked,/role="tab"|unique-broker/);
  const guest=section(render(entries,{}, {...INITIAL_USER,tierLevel:4},false).html);
  assert.match(guest,/Sign in to unlock/);
  const included=section(render(entries,{}, {...INITIAL_USER,tierLevel:4}).html);
  assert.match(included,/role="tab"/);
  const paid=section(render(entries,{}, {...INITIAL_USER,tierLevel:1,journalCrossAnalysisUntil:Date.now()+60000}).html);
  assert.match(paid,/role="tab"/);
  const expired=section(render(entries,{}, {...INITIAL_USER,tierLevel:1,journalCrossAnalysisUntil:Date.now()-1}).html);
  assert.match(expired,/Unlock with Credits/);
});
test('Insights keeps all five journal market choices even in an empty cohort',()=>{
  assert.deepEqual(JOURNAL_MARKET_TYPES,['Forex','Crypto','Stocks','Commodity','Indices']);
  assert.ok(render([]).text.includes('Market type (5/5)'));
});
test('Retired report Broker filters neither render nor invisibly exclude trades',()=>{
  const result=render([trade({brokerId:'exness'}),trade({id:'b',brokerId:'hfm'})],{'JournalInsights-brokerOff':['exness','hfm']});
  assert.ok(result.text.includes('2 eligible closed trades'));
  assert.ok(!result.read.some(key=>key.endsWith('JournalInsights-brokerOff')));
  assert.doesNotMatch(result.text,/Broker \(\d+\/\d+\)/);
  assert.match(result.html,/role="tab"[^>]*>Broker</);
});
test('Insights uses the supplied shared cohort and preserves report market exclusions',()=>{
  const result=render([trade({assetClass:'Forex'}),trade({id:'b',assetClass:'Indices'})],{'JournalInsights-assetOff':['Indices']});
  assert.ok(result.text.includes('Market type (4/5)'));
  assert.ok(result.text.includes('1 eligible closed trades'));
});

const entryDay = (entry: JournalEntry) => ({key:entry.date,label:entry.date,order:Number(entry.date.replaceAll('-',''))});
test('Open Insights groups reported snapshots without counting closed or planned trades',()=>{
  const entries=[trade({id:'profit',tradingStatus:'open',pnl:80}),trade({id:'loss',tradingStatus:'open',pnl:-30}),trade({id:'plan',tradingStatus:'planned',pnl:999}),trade({id:'closed',pnl:999})];
  const groups=openInsightGroups(entries,entryDay);
  assert.equal(groups.length,1);
  assert.equal(groups[0].entries.length,2);
  assert.equal(groups[0].known,2);
  assert.equal(groups[0].pnl,50);
  const html=renderToStaticMarkup(createElement(JournalOpenInsightsChart,{entries,bucketOf:entryDay,onDrill:()=>{}}));
  assert.match(html,/2 open positions/);
  assert.match(html,/\+\$50\.00/);
  assert.doesNotMatch(html,/\$999/);
});
test('Open Insights preserves unknown P&L, zero and mixed-currency evidence',()=>{
  const entries=[trade({id:'zero',tradingStatus:'open',pnl:0}),trade({id:'unknown',tradingStatus:'open',pnlKnown:false,pnl:250})];
  const groups=openInsightGroups(entries,entryDay);
  assert.equal(groups[0].pnl,null);
  assert.equal(groups[0].subtotal,0);
  assert.equal(groups[0].known,1);
  assert.equal(openInsightGroups([entries[0]],entryDay)[0].pnl,0);
  assert.equal(openInsightGroups([trade({tradingStatus:'open',pnl:NaN})],entryDay)[0].pnl,null);
  const mixed=[trade({id:'usd',tradingStatus:'open'}),trade({id:'eur',tradingStatus:'open',accountCurrency:'EUR'})];
  assert.equal(openInsightGroups(mixed,entryDay)[0].pnl,null);
  const html=renderToStaticMarkup(createElement(JournalOpenInsightsChart,{entries:mixed,bucketOf:entryDay,onDrill:()=>{}}));
  assert.match(html,/role="alert"/);
  assert.match(html,/Individual position values remain available/);
  assert.doesNotMatch(html,/NaN|Infinity/);
});
test('Insights chart scope toggles share filters but do not change closed performance',()=>{
  const entries=[trade({id:'closed',pnl:15}),trade({id:'visible',symbol:'OPEN-EUR',tradingStatus:'open',assetClass:'Forex',pnl:-125,equityAtEntry:25000}),trade({id:'excluded',symbol:'HIDDEN-INDEX',tradingStatus:'open',assetClass:'Indices',pnl:900})];
  for(const scope of ['open','unrealized']) {
    const {text,html}=render(entries,{'JournalInsights-chartScope':scope,'JournalInsights-assetOff':['Indices']});
    assert.match(text,/1 eligible closed trades/);
    assert.match(text,/1 open positions/);
    assert.match(text,/OPEN-EUR/);
    assert.doesNotMatch(text,/HIDDEN-INDEX/);
    assert.match(text,/-\$125\.00/);
    assert.match(text,/-0\.50%/);
    assert.match(text,/Closed performance only/);
    assert.match(html,/role="button" tabindex="0"/);
    assert.match(html,/aria-haspopup="dialog"/);
    assert.match(text,/Bars show unrealized profit\/loss; labels show open-position counts/);
    assert.match(html,/>Open positions &amp; unrealized P&amp;L<\/button>/);
    assert.doesNotMatch(html,/>Unrealized P&amp;L<\/button>/);
    assert.doesNotMatch(html,/NaN|Infinity/);
  }
});
test('Closed distribution defaults to net P&L bars and exposes chart groups as dialog actions',()=>{
  const {html}=render([
    trade({id:'profit',date:'2026-10-01',pnl:80}),
    trade({id:'loss',date:'2026-10-02',pnl:-30,outcome:'loss'}),
  ],{'JournalInsights-metric':'trades'});
  assert.match(html,/aria-pressed="true"[^>]*>Net P&amp;L<\/button>/);
  assert.match(html,/fill="#10b981"/);
  assert.match(html,/fill="#f43f5e"/);
  assert.match(html,/aria-haspopup="dialog" aria-label="Thursday: 1 closed trades/);
  assert.match(html,/aria-haspopup="dialog" aria-label="Friday: 1 closed trades/);
});
test('Distribution popup lists all selected trades with realized profit, loss, and R',()=>{
  const entries=Array.from({length:11},(_,i)=>trade({
    id:`closed-${i}`,
    symbol:`SYM${i}`,
    pnl:i===0?-25:i*10,
    outcome:i===0?'loss':'win',
    rMultiple:i===0?-1:i/2,
  }));
  const summary={n:11,wins:10,losses:1,be:0,net:525,gross:525,pf:4,winRate:90.9,lossRate:9.1,beRate:0,avgR:2.3,cb:0,pts:0,avgDur:null};
  const html=renderToStaticMarkup(createElement(InsightsDrillDialog,{
    label:'Thursday',
    entries,
    summary,
    formatMoney:value=>`${value<0?'-':'+'}$${Math.abs(value).toFixed(2)}`,
    formatEntryTime:entry=>entry.date,
    onClose:()=>{},
    onOpenAll:()=>{},
    onOpenTrade:()=>{},
  }));
  assert.match(html,/role="dialog" aria-modal="true"/);
  assert.match(html,/Closed trade results · Thursday/);
  assert.match(html,/SYM0/);
  assert.match(html,/SYM10/);
  assert.match(html,/Net P&amp;L/);
  assert.match(html,/Open all in Trade Log/);
  assert.doesNotMatch(html,/more\. Open in Trade Log/);
});
test('Open Insights respects report subranges, session filters, and missing exit times',()=>{
  const entries=[trade({id:'recent',symbol:'RECENT',date:'2026-10-01',entryTime:'2026-10-01T08:00:00Z',tradingStatus:'open'}),
    trade({id:'old',symbol:'OLD',date:'2026-01-01',tradingStatus:'open'}),
    trade({id:'late',symbol:'LATE',date:'2026-10-01',entryTime:'2026-10-01T23:00:00Z',tradingStatus:'open'})];
  const {text}=render(entries,{'JournalInsights-chartScope':'open','JournalInsights-range':'last30','JournalInsights-sessOff':['late'],'JournalInsights-view':'duration'});
  assert.match(text,/1 open positions/);
  assert.match(text,/RECENT/);
  assert.doesNotMatch(text,/OLD|LATE/);
  assert.match(text,/Still open/);
  assert.match(text,/Open hold time is unavailable/);
});
test('Open Insights renders an honest empty scope and tolerates an invalid saved toggle',()=>{
  assert.match(render([],{'JournalInsights-chartScope':'open'}).text,/No open positions match/);
  assert.match(render([trade()],{'JournalInsights-chartScope':'invalid'}).text,/Bars show realized net profit or loss/);
});

test('recent Insights subranges follow the supplied Trade Log dates instead of a fixed demo date',()=>{
  const result=render([trade({date:'2020-04-10'}),trade({id:'b',date:'2020-04-01'}),trade({id:'old',date:'2020-01-01'})],{'JournalInsights-range':'last30'});
  assert.ok(result.text.includes('2 eligible closed trades'));
  assert.ok(result.text.includes('3 Trade Log records connected.'));
});
test('custom playbooks and saved filter recovery remain visible in Insights',()=>{
  const result=render([trade({strategy:'My custom setup'})],{'JournalInsights-assetOff':['Stocks']});
  assert.ok(result.text.includes('Playbook (1/1)'));
  assert.ok(result.text.includes('Reset Insights filters'));
  assert.ok(result.text.includes('1 Trade Log records connected.'));
  assert.ok(result.text.includes('0 match Day &amp; Time report filters.'));
});
