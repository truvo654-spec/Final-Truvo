import type { JournalEntry, PortfolioAssetClass } from '../types';
import type { JournalPlaybook, PlaybookScenario } from '../data/journalPlaybooks';
import { createRun, RunSnapshot } from './engine';
import { marketGroupOf, resolveSymbol, seriesFromBars, symbolSpec } from './marketData';
import { configuredDemo, DemoConfiguration, DemoFeed, DemoHypothesis, demoTimeframe } from './demoReplay';
import { BacktestSettings } from './types';

export interface PositionSetup {
  equity:string; mode:'risk'|'quantity'; percent:string; quantity:string;
  scenarioKey:string; bias:'long'|'short'; entry:string; stop:string; target:string;
}
export const defaultPositionSetup = (book:JournalPlaybook|null, entry?:JournalEntry):PositionSetup => ({
  equity:'100000', mode:'risk', percent:String(book?.riskPerTrade ?? 1), quantity:'',
  scenarioKey:book?.scenarios?.some(s=>s.id===entry?.scenarioId)?entry!.scenarioId!:'',
  bias:entry?.direction==='SELL'?'short':'long',entry:'',stop:'',target:'',
});
const num = (v:string) => v.trim()?Number(v):NaN;
export function resolvePositionSetup(setup:PositionSetup, book:JournalPlaybook|null, symbol:string): {config:DemoConfiguration|null; error:string|null; scenario:PlaybookScenario|null} {
  const spec=symbolSpec(symbol), equity=num(setup.equity), percent=num(setup.percent), quantity=num(setup.quantity);
  const scenario=book?.scenarios?.find(s=>s.id===setup.scenarioKey)??null;
  const bad=(error:string)=>({config:null,error,scenario});
  if(!spec)return bad('No demo contract specification is available.');
  if(!Number.isFinite(equity)||equity<=0||equity>1e9)return bad('Demo equity must be above zero and no more than $1 billion.');
  if(setup.mode==='risk' && (!Number.isFinite(percent)||percent<0.01||percent>10))return bad('Demo risk must be between 0.01% and 10%.');
  if(setup.mode==='quantity' && (!Number.isFinite(quantity)||quantity<spec.minSize||quantity>1e8 || Math.abs(quantity/spec.sizeStep-Math.round(quantity/spec.sizeStep))>1e-6))return bad(`Quantity must be at least ${spec.minSize} ${spec.sizeUnit}, in steps of ${spec.sizeStep}.`);
  const config:DemoConfiguration={risk:{equity,mode:setup.mode,percent:setup.mode==='risk'?percent:1,quantity:setup.mode==='quantity'?quantity:spec.minSize},scenario:null};
  if(setup.scenarioKey) {
    if(setup.scenarioKey!=='custom' && !scenario)return bad('The linked scenario is unavailable. Choose a scenario or a demo-only draft.');
    const sc=scenario??{symbol,bias:setup.bias,entry:num(setup.entry),stop:num(setup.stop),target:num(setup.target)};
    if(resolveSymbol(sc.symbol)!==spec.symbol)return bad(`Scenario instrument ${sc.symbol} does not match demo instrument ${spec.symbol}. Select the matching instrument or copy it into a demo draft.`);
    if(![sc.entry,sc.stop,sc.target].every(p=>Number.isFinite(p)&&p!>0))return bad('Scenario entry, stop and target must all be recorded positive prices. Missing levels stay unknown.');
    const dir=sc.bias==='long'?1:-1;
    if(dir*(sc.entry!-sc.stop!)<=0 || dir*(sc.target!-sc.entry!)<=0)return bad(`For a ${sc.bias==='long'?'Buy':'Sell'} scenario, stop and target must be on opposite, correct sides of entry.`);
    config.scenario={symbol:spec.symbol,bias:sc.bias,entry:sc.entry!,stop:sc.stop!,target:sc.target!};
  }
  return {config,error:null,scenario};
}

export function monitorDemo(feed:DemoFeed, baseline:BacktestSettings, h:DemoHypothesis, config:DemoConfiguration, cursor:number):RunSnapshot {
  const {variant,options}=configuredDemo(baseline,h,config);
  const run=createRun(variant,seriesFromBars(feed.symbol,feed.tf,feed.bars),options);
  run.step(Math.max(0,Math.min(feed.bars.length,Math.floor(cursor))));
  return run.snapshot();
}

export interface PositionPlan {entry:number;stop:number;target:number;quantity:number;risk:number;riskPercent:number;rr:number;fees:number;direction:'BUY'|'SELL'}
export function draftScenarioLevels(feed:DemoFeed, cursor:number, bias:'long'|'short', atr:number, h:DemoHypothesis):Pick<PositionSetup,'entry'|'stop'|'target'>|null {
  const spec=symbolSpec(feed.symbol), close=feed.bars[cursor-1]?.c;
  if(!spec||!close||![atr,h.stopAtr,h.targetR].every(v=>Number.isFinite(v)&&v>0))return null;
  const tick=spec.tickSize, dir=bias==='long'?1:-1;
  const entry=Math.round(close/tick)*tick;
  const distance=Math.ceil(atr*h.stopAtr/tick-1e-9)*tick;
  const reward=Math.ceil(distance*h.targetR/tick-1e-9)*tick;
  const stop=entry-dir*distance, target=entry+dir*reward;
  if(stop<=0||target<=0)return null;
  return {entry:entry.toFixed(feed.dp),stop:stop.toFixed(feed.dp),target:target.toFixed(feed.dp)};
}
export function planPosition(feed:DemoFeed, config:DemoConfiguration, h:DemoHypothesis, snapshot:RunSnapshot, cursor:number, direction:JournalEntry['direction']):PositionPlan|null {
  const spec=symbolSpec(feed.symbol)!, sc=config.scenario, dir=sc?sc.bias==='long'?1:-1:direction==='BUY'?1:-1;
  const entry=sc?.entry??feed.bars[cursor-1]?.c;
  if(!entry || (!sc && (!snapshot.atr || snapshot.atr<=0)))return null;
  const stop=sc?.stop??entry-dir*snapshot.atr!*h.stopAtr, target=sc?.target??entry+dir*Math.abs(entry-stop)*h.targetR;
  const dist=Math.abs(entry-stop);
  if(!(dist>0) || stop<=0 || target<=0)return null;
  const qty=config.risk.mode==='quantity'?config.risk.quantity:Math.floor((snapshot.balance*config.risk.percent/100)/(dist*spec.multiplier)/spec.sizeStep+1e-9)*spec.sizeStep;
  const risk=dist*qty*spec.multiplier;
  return {entry,stop,target,quantity:+qty.toFixed(8),risk,riskPercent:risk/snapshot.balance*100,rr:Math.abs(target-entry)/dist,fees:h.commission*qty*2,direction:dir===1?'BUY':'SELL'};
}

export type SetupState='Match'|'Mismatch'|'Unknown'|'Not applicable';
export interface SetupCheck {label:string;state:SetupState;detail:string}
const check=(label:string,condition:boolean|null,detail:string):SetupCheck=>({label,state:condition===null?'Unknown':condition?'Match':'Mismatch',detail});
export function positionChecks({book,entry,feed,plan,snapshot,scenario,scenarioKey,asOf}:{book:JournalPlaybook|null;entry?:JournalEntry;feed:DemoFeed;plan:PositionPlan|null;snapshot:RunSnapshot|null;scenario:PlaybookScenario|null;scenarioKey:string;asOf:string}):SetupCheck[] {
  const spec=symbolSpec(feed.symbol)!, p=snapshot?.position;
  const riskPct=p?p.initialRisk/p.equityAtEntry*100:plan?.riskPercent;
  const rr=p && p.target!==null ? Math.abs(p.target-p.entry)/Math.abs(p.entry-p.initialStop):plan?.rr;
  const rows:SetupCheck[]=[
    check('Recorded strategy',entry&&book ? entry.strategy===book.name:null,entry?`${entry.strategy||'Not recorded'} → ${book?.name||'No playbook'}`:'No recorded trade selected.'),
    check('Playbook instrument',book ? book.symbols?.length ? book.symbols.some(s=>resolveSymbol(s)===spec.symbol) : book.markets?.length ? book.markets.includes(marketGroupOf(spec) as PortfolioAssetClass):null : null,book?.symbols?.length?`Allowed: ${book.symbols.join(', ')}. Selected: ${spec.symbol}.`:'Uses the selected playbook market list when no symbol list is recorded.'),
    check('Playbook timeframe',book ? feed.tf===demoTimeframe(book):null,`Executable template: ${book?demoTimeframe(book):'Unknown'}; demo: ${feed.tf}.`),
    check('Risk per trade',Number.isFinite(book?.riskPerTrade)&&book!.riskPerTrade!>0&&Number.isFinite(riskPct) ? riskPct!<=book!.riskPerTrade!+1e-8:null,`Initial stop risk ${riskPct===undefined?'Unknown':riskPct.toFixed(2)+'%'}; current playbook limit ${book?.riskPerTrade??'Unknown'}%. Fees are separate.`),
    check('Minimum quantity',p||plan?(p?.size??plan!.quantity)>=spec.minSize:null,`Minimum ${spec.minSize} ${spec.sizeUnit}; size rounds to increments of ${spec.sizeStep}.`),
    check('Planned reward / risk',Number.isFinite(book?.benchmarkRR)&&book!.benchmarkRR>0&&Number.isFinite(rr) ? rr!+1e-8>=book!.benchmarkRR:null,`Planned ${rr===undefined?'Unknown':rr.toFixed(2)+'R'}; playbook minimum ${book?.benchmarkRR??'Unknown'}R.`),
  ];
  const t=p?.entryTime??(snapshot?.processed?feed.bars[snapshot.processed-1]?.t:NaN);
  if(book?.window) {const hour=new Date(t).getUTCHours()+new Date(t).getUTCMinutes()/60;const w=book.window;rows.push(check('Session timing',Number.isFinite(hour)? w.start<w.end?hour>=w.start&&hour<w.end:hour>=w.start||hour<w.end:null,`${w.label} · ${w.start}–${w.end} UTC; ${p?'demo fill time':'current demo bar'}.`));}
  else rows.push({label:'Session timing',state:book?'Not applicable':'Unknown',detail:book?'Playbook allows any session.':'No playbook selected.'});
  if(scenarioKey) {
    rows.push(check('Scenario price levels',plan?true:null,plan?'Entry, stop and target are numeric and correctly ordered.':'Complete a valid, instrument-matched setup before levels can be evaluated.'));
    rows.push(check('Scenario direction',entry && (scenario||plan)?(scenario?.bias??(plan!.direction==='BUY'?'long':'short'))===(entry.direction==='BUY'?'long':'short'):null,'Compares scenario bias with the recorded trade; simulation follows the scenario bias.'));
    const validDay=(d:string)=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
    const valid=!!scenario && validDay(scenario.validUntil) && validDay(scenario.createdAt) && validDay(asOf);
    rows.push(check('Scenario validity',valid ? scenario!.createdAt<=asOf&&asOf<=scenario!.validUntil&&!['closed','invalidated'].includes(scenario!.status):null,scenario?`${scenario.status}; ${scenario.createdAt} → ${scenario.validUntil}; checked on ${asOf} (${entry?'recorded trade date':'today, UTC'}), not the synthetic candle date.`:'Demo-only draft has no recorded validity dates.'));
    rows.push(check('Written scenario trigger',null,'Numeric demo uses a close crossing entry, then next-bar market fill. Written trigger conditions are not automatically verified.'));
  } else rows.push({label:'Scenario link',state:'Not applicable',detail:'No scenario selected; monitoring the strategy template hypothesis.'});
  rows.push(check('Written playbook rules',null,'Discretionary rules need review evidence. These setup checks use the current playbook, not historical rule versions; they are not a compliance grade.'));
  return rows;
}
