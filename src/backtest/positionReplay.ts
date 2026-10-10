import type { JournalEntry } from '../types';
import type { Bar } from './types';
import { symbolSpec } from './marketData';
import type { JournalPlaybook } from '../data/journalPlaybooks';
import { DemoFeed, demoSettings } from './demoReplay';
import { defaultPositionSetup, resolvePositionSetup, monitorDemo } from './demoPosition';

export interface PositionDraft {
  direction:'BUY'|'SELL'; entry:string; quantity:string; unit:string; multiplier:string;
  stop:string; target:string; costs:string; equity:string;
}
export interface TestPosition {
  direction:'BUY'|'SELL'; entry:number; quantity:number; unit:string; multiplier:number;
  stop:number|null; target:number|null; costs:number; equity:number|null;
}
const positive=(n:number)=>Number.isFinite(n)&&n>0;
const value=(s:string)=>s.trim()?Number(s):NaN;
export function recordedPositionDraft(entry:JournalEntry):PositionDraft {
  const spec=symbolSpec(entry.symbol);
  // Aliases can represent different broker contracts (e.g. US500 CFDs versus MES).
  const exact=spec?.symbol===entry.symbol && entry.quantityUnit===spec.sizeUnit;
  const usd=(entry.accountCurrency||'USD')==='USD';
  return {direction:entry.direction,entry:positive(entry.entryPrice)?String(entry.entryPrice):'',
    quantity:positive(entry.size)?String(entry.size):'',unit:entry.quantityUnit||'',multiplier:exact?String(spec.multiplier):'',
    stop:positive(entry.stopPrice!)?String(entry.stopPrice):'',target:positive(entry.takeProfit!)?String(entry.takeProfit):'',
    costs:usd&&Number.isFinite(entry.commission)&&entry.commission!>=0?String(entry.commission):'',
    equity:usd&&positive(entry.equityAtEntry!)?String(entry.equityAtEntry):''};
}
export function playbookPositionDraft(feed:DemoFeed,book:JournalPlaybook|null,cursor:number,direction:'BUY'|'SELL'='BUY',scenarioId=''):PositionDraft {
  const spec=symbolSpec(feed.symbol)!,scenario=book?.scenarios?.find(s=>s.id===scenarioId);
  const base=demoSettings(feed,book,direction),config=resolvePositionSetup({...defaultPositionSetup(book),percent:'1',scenarioKey:''},book,feed.symbol).config!;
  const atr=monitorDemo(feed,base,{stopAtr:1.5,targetR:2,commission:0},config,cursor).atr;
  const dir=(scenario?.bias==='short'?'SELL':scenario?'BUY':direction)==='BUY'?1:-1;
  const px=scenario?(scenario.entry??NaN):feed.bars[cursor-1].c,rule=base.rules.exits.stop;
  const visible=feed.bars.slice(Math.max(0,cursor-(rule.type==='swing'?rule.lookback:1)),cursor);
  const rawStop=scenario?scenario.stop:atr ? rule.type==='swing' ? (dir===1?Math.min(...visible.map(b=>b.l))-atr*0.1:Math.max(...visible.map(b=>b.h))+atr*0.1) : px-dir*(rule.type==='atr'?rule.mult*atr:rule.value*spec.costUnit.size):undefined;
  const stop=scenario?scenario.stop:rawStop===undefined?undefined:(dir===1?Math.floor(rawStop/spec.tickSize):Math.ceil(rawStop/spec.tickSize))*spec.tickSize;
  const dist=stop===undefined?NaN:dir*(px-stop),rr=base.rules.exits.targetR??book?.benchmarkRR??2;
  const target=scenario?scenario.target:positive(dist)?px+dir*Math.ceil(dist*rr/spec.tickSize-1e-9)*spec.tickSize:undefined;
  const qty=positive(dist)?Math.floor((100000*(book?.riskPerTrade??1)/100)/(dist*spec.multiplier)/spec.sizeStep+1e-9)*spec.sizeStep:NaN;
  return {direction:dir===1?'BUY':'SELL',entry:positive(px)?scenario?String(px):px.toFixed(feed.dp):'',quantity:positive(qty)?String(+qty.toFixed(8)):'',unit:spec.sizeUnit,multiplier:String(spec.multiplier),
    stop:stop===undefined?'':scenario?String(stop):stop.toFixed(feed.dp),target:target===undefined?'':scenario?String(target):target.toFixed(feed.dp),costs:'0',equity:'100000'};
}
export function parsePositionDraft(d:PositionDraft):{position:TestPosition|null;error:string|null} {
  const entry=value(d.entry),quantity=value(d.quantity),multiplier=value(d.multiplier),costs=value(d.costs);
  const stop=d.stop.trim()?value(d.stop):null,target=d.target.trim()?value(d.target):null,equity=d.equity.trim()?value(d.equity):null;
  const bad=(error:string)=>({position:null,error});
  if(!positive(entry))return bad('Enter a positive entry price.');
  if(!positive(quantity)||quantity>1e8)return bad('Enter a position size above zero and no more than 100 million units.');
  if(!d.unit.trim())return bad('Specify the quantity unit, such as lots, contracts or coins.');
  if(!positive(multiplier)||multiplier>1e9)return bad('Specify the USD value of a 1.0 price move per quantity unit.');
  if(!Number.isFinite(costs)||costs<0)return bad('Enter estimated total costs in USD, including zero if no costs apply.');
  if(equity!==null&&!positive(equity))return bad('Account equity must be positive, or left blank when unknown.');
  const dir=d.direction==='BUY'?1:-1;
  if(stop!==null&&(!positive(stop)||dir*(entry-stop)<=0))return bad('Stop must be below a Buy entry or above a Sell entry.');
  if(target!==null&&(!positive(target)||dir*(target-entry)<=0))return bad('Target must be above a Buy entry or below a Sell entry.');
  if(!Number.isFinite(entry*quantity*multiplier)||!Number.isFinite(costs*quantity))return bad('Position values are too large to calculate.');
  return {position:{direction:d.direction,entry,quantity,unit:d.unit.trim(),multiplier,stop,target,costs,equity},error:null};
}
export interface PositionPoint {index:number;time:number;price:number;priceChange:number;holdNet:number;managedNet:number;openNet:number;realizedNet:number;remaining:number;}
export interface PositionPath {points:PositionPoint[];exit:{index:number;price:number;reason:string}|null;status:'before'|'open'|'closed';}
/** Inspect only revealed bars. The first bar is a close-time starting snapshot, not an invented historical fill. */
export function positionPath(bars:Bar[],p:TestPosition,start:number,cursor:number,manualExit:number|null=null):PositionPath {
  const points:PositionPoint[]=[],dir=p.direction==='BUY'?1:-1;
  let exit:PositionPath['exit']=null;
  const net=(price:number)=>(price-p.entry)*dir*p.quantity*p.multiplier-p.costs;
  for(let i=start;i<Math.min(cursor,bars.length);i++) {
    const b=bars[i];
    if(!exit) {
      // Monitoring starts at this bar's close; prior intrabar highs/lows cannot trigger an exit.
      const stopHit=p.stop!==null&&(i===start?dir*(b.c-p.stop)<=0:dir*((dir===1?b.l:b.h)-p.stop)<=0);
      const targetHit=p.target!==null&&(i===start?dir*(b.c-p.target)>=0:dir*((dir===1?b.h:b.l)-p.target)>=0);
      if(stopHit)exit={index:i,price:i===start?b.c:dir*(b.o-p.stop!)<0?b.o:p.stop!,reason:targetHit?'Stop · both levels touched':'Stop'};
      else if(targetHit)exit={index:i,price:i===start?b.c:p.target!,reason:'Target'};
      else if(manualExit!==null&&i>=manualExit)exit={index:i,price:b.c,reason:'Closed at chart price'};
    }
    const holdNet=net(b.c),managedNet=exit?net(exit.price):holdNet;
    points.push({index:i,time:b.t,price:b.c,priceChange:(b.c/p.entry-1)*100,holdNet,managedNet,
      openNet:exit?0:managedNet,realizedNet:exit?managedNet:0,remaining:exit?0:p.quantity});
  }
  return {points,exit,status:points.length?exit?'closed':'open':'before'};
}
