import type {DashboardRow,DashboardScope,DashboardSource,DashboardUnit} from './dashboardData';
import {symbolSpec} from '../../backtest/marketData';
import {netRoiOf,timestampMs} from '../journal/journalMath';

export const finite=(n:number|null|undefined):number|null=>n!=null&&Number.isFinite(n)?n:null;
export const rowState=(r:DashboardRow)=>r.state??(r.closed===false?'open':'closed');
export const closedRow=(r:DashboardRow)=>r.closed!==false&&Number.isFinite(r.net);
export function rowOutcome(r:DashboardRow,threshold=r.beThreshold??.005):'win'|'loss'|'breakeven'|null {return !closedRow(r)?null:Math.abs(r.net)<=threshold?'breakeven':r.net>0?'win':'loss';}
export const rowTags=(r:DashboardRow)=>r.tags??r.journal?.tags??r.practice?.tags??[];
export const rowMistakes=(r:DashboardRow)=>r.journal?.mistakes??[];
export const rowReviewed=(r:DashboardRow)=>r.reviewed??(r.journal? r.journal.reviewState==='complete':false);
export function entryClock(row:DashboardRow,zone:string){
 if(row.journal&&!row.journal.entryTime||!Number.isFinite(row.entryAt))return null;
 const p=new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(row.entryAt),get=(t:string)=>p.find(v=>v.type===t)?.value??'';
 return {weekday:get('weekday'),hour:Number(get('hour')),day:`${get('year')}-${get('month')}-${get('day')}`};
}
export const ADVANCED_DEFAULTS={holding:'all' as 'all'|'intraday'|'multiday',state:'all' as 'all'|'open'|'closed',review:'all' as 'all'|'reviewed'|'unreviewed',outcomes:[] as string[],tags:[] as string[],mistakes:[] as string[],weekdays:[] as string[],hourFrom:'',hourTo:'',breakeven:.005};
export function matchesAdvanced(row:DashboardRow,scope:DashboardScope){
 const a={...ADVANCED_DEFAULTS,...scope},clock=entryClock(row,scope.timezone),outcome=rowOutcome(row,a.breakeven);
 const closeDay=rowState(row)==='closed'&&row.holdKnown?row.day:null;
 return (a.state==='all'||a.state===rowState(row))&&(a.review==='all'||(a.review==='reviewed')===rowReviewed(row))
 &&(!a.outcomes.length||outcome!==null&&a.outcomes.includes(outcome))&&(!a.tags.length||a.tags.some(t=>rowTags(row).includes(t)))&&(!a.mistakes.length||a.mistakes.some(t=>rowMistakes(row).includes(t)))
 &&(a.holding==='all'||!!clock&&!!closeDay&&((a.holding==='intraday')===(clock.day===closeDay)))
 &&(!a.weekdays.length||!!clock&&a.weekdays.includes(clock.weekday))
 &&(a.hourFrom===''&&a.hourTo===''||!!clock&&(a.hourFrom===''||clock.hour>=Number(a.hourFrom))&&(a.hourTo===''||clock.hour<=Number(a.hourTo)));
}
export function priceValues(r:DashboardRow){return {entry:r.trade?.entryPrice??r.practice?.entry??r.journal?.entryPrice,exit:r.trade?.exitPrice??r.practice?.exit??r.journal?.exitPrice};}
export function priceUnitValue(row:DashboardRow,unit:'ticks'|'points'|'pips'):number|null {
 if(!closedRow(row))return null;const raw=row.symbol.toUpperCase().replace(/[^A-Z]/g,''),extraPips:Record<string,number>={AUDUSD:.0001,NZDUSD:.0001,USDCHF:.0001,EURJPY:.01};const spec=symbolSpec(row.symbol)??(extraPips[raw]?{assetClass:'Forex',costUnit:{size:extraPips[raw]},tickSize:extraPips[raw]/10}:undefined),p=priceValues(row);if(!spec||p.entry==null||p.exit==null||!Number.isFinite(p.entry)||!Number.isFinite(p.exit))return null;
 const forex=spec.assetClass==='Forex',futures=spec.assetClass==='Futures'||spec.assetClass==='Indices';
 if(unit==='pips'&&!forex||unit!=='pips'&&!futures)return null;
 const movement=(p.exit-p.entry)*(row.side==='long'?1:-1);
 // Price movement per unit of position, before costs; money is not divided by guessed FX/contract values.
 return finite(movement/(unit==='points'?1:unit==='pips'?spec.costUnit.size:spec.tickSize));
}
export function unitAvailability(rows:DashboardRow[],unit:'ticks'|'points'|'pips'){const list=rows.filter(closedRow);return list.length>0&&list.every(r=>priceUnitValue(r,unit)!==null);}
export function displayRowValue(row:DashboardRow,unit:DashboardUnit,balance:number|null){
 if(!closedRow(row))return null;
 return unit==='money'?row.net:unit==='r'?finite(row.r):unit==='percent'?balance&&balance>0?finite(row.net/balance*100):null:priceUnitValue(row,unit);
}
export function rowRoi(row:DashboardRow){if(!closedRow(row))return null;if(row.journal)return netRoiOf(row.journal);if(row.trade){const before=row.trade.balance-row.net;return before>0?finite(row.net/before*100):null;}return null;}
export function advancedStats(rows:DashboardRow[],balance:number|null,value:(r:DashboardRow)=>number|null=(r)=>r.net,threshold=.005){
 const list=rows.filter(closedRow),days=new Map<string,DashboardRow[]>();list.forEach(r=>days.set(r.day,[...(days.get(r.day)??[]),r]));
 const daily=[...days].sort(([a],[b])=>a.localeCompare(b)).map(([day,rs])=>({day,net:rs.reduce((n,r)=>n+r.net,0),values:rs.map(value).filter((v):v is number=>v!==null)}));
 let cumulative=0,peak=0,episode=0;const depths:number[]=[];
 let dayWins=0,dayBE=0,dayLosses=0,ws=0,ls=0,maxWinDays=0,maxLossDays=0;
 for(const d of daily){if(d.net>threshold){dayWins++;ws++;ls=0;}else if(d.net< -threshold){dayLosses++;ls++;ws=0;}else{dayBE++;ws=ls=0;}maxWinDays=Math.max(maxWinDays,ws);maxLossDays=Math.max(maxLossDays,ls);
 if(!d.values.length)continue;cumulative+=d.values.reduce((a,b)=>a+b,0);if(cumulative>=peak){if(episode>0)depths.push(episode);episode=0;peak=cumulative;}else episode=Math.max(episode,peak-cumulative);}
 if(episode>0)depths.push(episode);
 // Arithmetic daily cash return / saved reference balance; sample stdev, zero risk-free/MAR, 252-day scale.
 const returns=balance&&balance>0?daily.map(d=>d.net/balance):[];
 const mean=returns.length?returns.reduce((n,r)=>n+r,0)/returns.length:0;
 const stdev=returns.length>1?Math.sqrt(returns.reduce((n,r)=>n+(r-mean)**2,0)/(returns.length-1)):0;
 const downside=returns.length?Math.sqrt(returns.reduce((n,r)=>n+Math.min(0,r)**2,0)/returns.length):0;
 let cash=0,cashPeak=0,dd=0,peakBalance=balance??0,ddPeakPct=0;
 for(const d of daily){cash+=d.net;cashPeak=Math.max(cashPeak,cash);dd=Math.max(dd,cashPeak-cash);const equity=(balance??0)+cash;peakBalance=Math.max(peakBalance,equity);if(peakBalance>0)ddPeakPct=Math.max(ddPeakPct,(peakBalance-equity)/peakBalance);}
 const ddStart=daily.length&&balance&&balance>0?dd/balance:null;
 const enough=returns.length>=2;
 return {dayWins,dayBE,dayLosses,maxWinDays,maxLossDays,avgDrawdown:daily.some(d=>d.values.length)?(depths.length?depths.reduce((n,d)=>n+d,0)/depths.length:0):null,
 sharpe:enough&&stdev>0?finite(mean/stdev*Math.sqrt(252)):null,sortino:enough&&downside>0?finite(mean/downside*Math.sqrt(252)):null,
 calmar:enough&&ddPeakPct>0&&1+cash/balance!>0?finite(((1+cash/balance!)**(252/returns.length)-1)/ddPeakPct):null,drawdownStartPct:ddStart===null?null:finite(ddStart*100),days:daily.length};
}
export function coveredMonths(sources:DashboardSource[],scope:DashboardScope){
 const intervals=sources.flatMap(s=>{const from=s.run?.from??s.session?.marketDate,to=s.run?.to??s.session?.marketDate;if(!from||!to)return [];
 const start=Date.parse((scope.from&&scope.from>from?scope.from:from)+'T00:00:00Z'),end=Date.parse((scope.to&&scope.to<to?scope.to:to)+'T00:00:00Z')+86400000;
 return Number.isFinite(start)&&Number.isFinite(end)&&end>start?[[start,end]]:[];}).sort((a,b)=>a[0]-b[0]);
 if(!intervals.length)return null;let total=0,[start,end]=intervals[0];for(const [a,b] of intervals.slice(1)){if(a<=end)end=Math.max(end,b);else{total+=end-start;start=a;end=b;}}return (total+end-start)/86400000/(365.25/12);
}
export function activeMilliseconds(sources:DashboardSource[]){const sessions=new Map<string,number>();let missing=0;for(const s of sources){const record=s.run??s.session,ms=record?.activeMs,key=s.run?.activityId??s.id;if(ms==null||!Number.isFinite(ms)||ms<0){missing++;continue;}sessions.set(key,Math.max(sessions.get(key)??0,ms));}return {ms:sessions.size?[...sessions.values()].reduce((a,b)=>a+b,0):null,missing};}
export const METRIC_HELP={sharpe:'Annualized Sharpe = mean(daily net / reference balance) ÷ sample standard deviation × √252. Zero risk-free rate. Requires a positive saved/reference balance, 2+ closing days and nonzero variance.',sortino:'Annualized Sortino = mean(daily net / reference balance) ÷ √mean(min(return, 0)²) × √252. Zero target. Requires a saved/reference balance, 2+ days and downside deviation.',calmar:'Calmar = annualized compounded account growth ÷ maximum daily drawdown / peak equity. Growth annualized over 252 trading observations. Requires a saved/reference balance, 2+ closing days, positive terminal equity and nonzero drawdown.',avgDrawdown:'Mean of the maximum depth of each daily closed-result drawdown episode, including an unrecovered final episode. Uses the selected display unit. No drawdowns = zero; no eligible results = unavailable.'};
export function saveDownload(name:string,data:string,type:string){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function escapeMarkup(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));}
export function snapshotSvg(title:string,lines:string[]){const wrapped=lines.flatMap(line=>line.match(/.{1,120}/g)??['']);return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="${130+wrapped.length*30}"><rect width="100%" height="100%" fill="#faf9fd"/><text x="40" y="48" font-family="Arial" font-size="24" font-weight="bold" fill="#5338ec">MarketSyde · ${escapeMarkup(title)}</text>${wrapped.map((v,i)=>`<text x="40" y="${95+i*30}" font-family="Arial" font-size="14" fill="#334155">${escapeMarkup(v)}</text>`).join('')}</svg>`;}
