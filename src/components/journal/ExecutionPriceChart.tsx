import React,{useEffect,useMemo,useState} from 'react';
import type {JournalEntry} from '../../types';
import {symbolSpec,resolveSymbol} from '../../backtest/marketData';
import {CandleChart,type Marker,type PriceLine} from '../backtest/charts';
import type {comparePlaybook,ExecutionPoint} from './playbookComparison';
import {executionPrice} from './playbookComparison';
import {instrumentKey} from './playbookExecution';
import {executionCurve,curveAt} from './executionChartData';
import type {LinkedPanel} from '../backtest/linkedPerformance';
import {RecordedExecutionChart} from './RecordedExecutionChart';
import {executionPriceBars,journalExecutionPoints,pointNetKnown,priceBarAt,priceWindowEnd,selectedPriceInterval,PRICE_INTERVAL_GROUPS,customPriceInterval,journalDemoAnchor,journalDemoPriceBars,recordedFillAnchors,recordedFocusInterval,recordedFocusWindow,recordedTradeLevels,shiftPriceInterval,clampTimeWindow,resizeTimeWindow,shiftTimeWindow,type TimeWindow,type PriceChartInterval,type PriceIntervalUnit} from './executionPriceStudy';
type Row=ReturnType<typeof comparePlaybook>['rows'][number];
const entryLabel=(point:ExecutionPoint)=>point.journal&&!point.journal.entryTime?`${point.journal.date} · time not recorded`:dateTime(point.entryAt);
const dateTime=(at:number)=>new Date(at).toISOString().slice(0,16).replace('T',' ')+' UTC';
const MAX_VISIBLE_CANDLES=200;
const button='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40';

export const ExecutionPriceChart:React.FC<{
  rows:Row[];history:JournalEntry[];priceContext?:JournalEntry[];instrument:string;source:'journal'|'simulated';from:string;to:string;balance:number;currency:string;format:(n:number)=>string;
  onInstrument:(symbol:string)=>void;onSource:(source:'journal'|'simulated')=>void;onPoint:(point:ExecutionPoint)=>void;
}> = ({rows,history,priceContext=history,instrument,source,from,to,balance,currency,format,onInstrument,onSource,onPoint}) => {
  const row=rows.find(r=>instrumentKey(r.symbol)===instrumentKey(instrument))??(source==='journal'?rows.find(r=>history.some(entry=>instrumentKey(entry.symbol)===instrumentKey(r.symbol))):rows.find(r=>resolveSymbol(r.symbol)))??rows[0];
  const symbol=row?.symbol??'';
  const [focus,setFocus]=useState<ExecutionPoint|null>(null);
  const [window,setWindow]=useState<[number,number]|null>(null);
  const [recordedWindow,setRecordedWindow]=useState<TimeWindow|null>(null);
  const [interval,setInterval]=useState<'auto'|PriceChartInterval>('auto');
  const [customizing,setCustomizing]=useState(false);
  const [customCount,setCustomCount]=useState('20');
  const [customUnit,setCustomUnit]=useState<PriceIntervalUnit>('m');
  const [customError,setCustomError]=useState('');
  useEffect(()=>{setFocus(null);setWindow(null);setRecordedWindow(null);},[symbol,source,from,to]);
  const journal=useMemo(()=>journalExecutionPoints(history,symbol),[history,symbol]);
  const points=source==='journal'?journal:row?.simulated.points??[];
  const ordered=[...points].sort((a,b)=>b.entryAt-a.entryAt);
  const autoTf=source==='journal'&&focus?recordedFocusInterval(focus):selectedPriceInterval('auto',from,to,focus?.run?.settings.timeframe);
  const tf=interval==='auto'?autoTf:selectedPriceInterval(interval,from,to);
  useEffect(()=>{setWindow(null);setRecordedWindow(null);},[tf]);
  const anchor=journalDemoAnchor(priceContext,symbol);
  const anchorKey=anchor?`${anchor.id}|${anchor.entryPrice}|${anchor.entryTime||anchor.date}`:'';
  const bars=useMemo(()=>source==='simulated'?executionPriceBars(symbol,from,to,tf):journalDemoPriceBars(symbol,from,to,tf,anchor),[symbol,from,to,tf,source,anchorKey]);
  const recordedOnly=source==='journal'&&!bars.length;
  const navigationFocus=focus??(source==='journal'&&interval!=='auto'?ordered[0]:null);
  const focusEntry=navigationFocus?priceBarAt(bars,navigationFocus.entryAt,tf):null;
  const focusExit=navigationFocus?priceBarAt(bars,navigationFocus.at,tf):null;
  const focusedRange:[number,number]|null=focusEntry!==null?[Math.max(0,focusEntry-8),Math.min(bars.length,Math.max(0,focusEntry-8)+MAX_VISIBLE_CANDLES,Math.max(focusEntry,focusExit??focusEntry)+9)]:null;
  const range=window??focusedRange??[interval==='auto'?0:Math.max(0,bars.length-MAX_VISIBLE_CANDLES),bars.length];
  const shift=(direction:number)=>{const size=range[1]-range[0],lo=Math.max(0,Math.min(bars.length-size,range[0]+direction*Math.max(1,Math.floor(size/2))));setWindow([lo,lo+size]);};
  const select=(point:ExecutionPoint)=>{setFocus(point);setWindow(null);setRecordedWindow(null);};
  const markers:Marker[]=points.flatMap(point=>{
    const trade=point.trade;
    if(point.journal)return recordedFillAnchors(point).flatMap(fill=>{
      const index=priceBarAt(bars,fill.time,tf);if(index===null)return [];
      const buy=point.journal!.direction==='BUY';
      return [{index,price:fill.price,kind:fill.kind==='exit'?'exit' as const:buy?'buy' as const:'sell' as const,color:fill.kind==='exit'?'#5338ec':buy?'#059669':'#e11d48',label:fill.kind==='exit'?'Exit':buy?'Buy entry':'Sell entry',showLabel:focus?.id===point.id,id:point.id,time:fill.time,timeLabel:fill.dayOnly?new Date(fill.time).toISOString().slice(0,10)+' (time not recorded)':undefined}];
    });
    if(!trade)return [];
    const entry=priceBarAt(bars,trade.entryTime,tf),exit=priceBarAt(bars,trade.exitTime,tf);
    const isSelected=focus?.id===point.id;
    return [...(entry===null?[]:[{index:entry,price:trade.entryPrice,kind:trade.direction==='long'?'buy' as const:'sell' as const,color:trade.direction==='long'?'#059669':'#e11d48',label:`${trade.direction==='long'?'Buy':'Sell'} entry`,showLabel:isSelected,id:point.id,time:trade.entryTime}]),...(exit===null?[]:[{index:exit,price:trade.exitPrice,kind:'exit' as const,color:'#5338ec',label:'Exit',showLabel:isSelected,id:point.id,time:trade.exitTime}])];
  });
  const lines:PriceLine[]=focus?.trade?[{price:focus.trade.entryPrice,label:'Entry',color:'#5338ec'},{price:focus.trade.exitPrice,label:'Exit',color:'#0d9488'},{price:focus.trade.stopPrice,label:'Stop',color:'#e11d48',dashed:true},...(focus.trade.targetPrice===null?[]:[{price:focus.trade.targetPrice,label:'Target',color:'#059669',dashed:true}])]:recordedTradeLevels(focus);
  const stats=row?.[source==='journal'?'journal':'simulated'];
  const curve=useMemo(()=>executionCurve(stats?.points??[],balance),[stats?.points,balance]);
  const start=Date.parse(from+'T00:00:00Z'),end=Date.parse(to+'T00:00:00Z')+86400000;
  const recordedScope:TimeWindow=[start,end];
  const recordedSubject=focus?.journal?focus:interval!=='auto'?ordered[0]:undefined;
  const recordedRange=clampTimeWindow(recordedWindow??(recordedSubject?recordedFocusWindow(recordedSubject,recordedScope,tf):interval==='auto'?recordedScope:[Math.max(start,shiftPriceInterval(end,tf,-MAX_VISIBLE_CANDLES)),end]),recordedScope);
  const recordedSpan=recordedRange[1]-recordedRange[0],recordedCenter=(recordedRange[0]+recordedRange[1])/2;
  const recordedMinimum=Math.min(end-start,Math.abs(shiftPriceInterval(recordedCenter,tf,8)-recordedCenter));
  const browseVisible=recordedOnly?recordedSpan<end-start:range[1]-range[0]<bars.length;
  const zoomInDisabled=recordedOnly?!points.length||recordedSpan<=recordedMinimum:range[1]-range[0]<=8;
  const zoomOutDisabled=recordedOnly?recordedSpan>=end-start:range[1]-range[0]>=Math.min(MAX_VISIBLE_CANDLES,bars.length);
  const browse=(direction:number)=>recordedOnly?setRecordedWindow(shiftTimeWindow(recordedRange,recordedScope,direction)):shift(direction);

  const linkedPanels:LinkedPanel[]=useMemo(()=>[
    {id:'pnl',label:'Cumulative closed P&L',color:'#5338ec',points:curve.map(node=>({at:node.at,value:node.cumulative})),format,axisFormat:value=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value)},
    {id:'drawdown',label:'Drawdown from peak',color:'#e11d48',points:curve.map(node=>({at:node.at,value:node.drawdownPct})),format:value=>value.toFixed(2)+'%',axisFormat:value=>value.toFixed(1)+'%',underwater:true},
  ],[curve,format]);
  const windowEnd=priceWindowEnd(bars,range[1],tf,end);
  const zoom=(factor:number)=>{const size=Math.min(bars.length,Math.max(8,Math.min(MAX_VISIBLE_CANDLES,Math.round((range[1]-range[0])*factor))));const center=(range[0]+range[1])/2;const lo=Math.max(0,Math.min(bars.length-size,Math.round(center-size/2)));setWindow([lo,lo+size]);};
  const zoomChart=(factor:number)=>recordedOnly?setRecordedWindow(resizeTimeWindow(recordedRange,recordedScope,factor,recordedMinimum)):zoom(factor);
  const groups=[...new Set(rows.map(r=>r.market))];
  return <section aria-label="Price and trade chart" className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="text-sm font-bold">Price &amp; trades</h4><p className="mt-1 text-xs text-slate-500">Choose an instrument. Click an entry or exit to review the trade.</p></div><label className="text-xs font-semibold">Instrument<select aria-label="Price chart instrument" value={symbol} onChange={e=>onInstrument(e.target.value)} disabled={!rows.length} className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">{groups.map(market=><optgroup key={market} label={market==='Commodity'?'Commodities':market}>{rows.filter(r=>r.market===market).map(r=><option key={r.symbol} value={r.symbol}>{r.symbol}</option>)}</optgroup>)}</select></label></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label="Price chart source" className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">{(['journal','simulated'] as const).map(kind=><button key={kind} type="button" aria-pressed={source===kind} onClick={()=>onSource(kind)} className={`rounded-md px-3 py-2 text-xs font-semibold ${source===kind?'bg-white text-[#5338ec] shadow-sm':'text-slate-500'}`}>{kind==='simulated'?'Backtest':'Journal'}</button>)}</div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${source==='simulated'?'bg-teal-50 text-teal-700':'bg-slate-100 text-slate-600'}`}>{source==='simulated'?'Sample market candles':recordedOnly?'Recorded fills only':'Demo candles + journal fills'}</span></div>
    {!row?<p className="mt-4 rounded-lg bg-slate-50 p-6 text-xs text-slate-500">Select a market and instrument above to see its chart.</p>:<>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-slate-500">Timeframe<select aria-label="Price chart timeframe" value={customizing?'custom':interval} onChange={e=>{setCustomError('');if(e.target.value==='custom'){setCustomizing(true);return;}setCustomizing(false);setInterval(e.target.value as 'auto'|PriceChartInterval);setWindow(null);}} className="rounded-lg border border-slate-200 bg-white px-2 py-2 font-semibold text-slate-900"><option value="auto">Auto ({autoTf})</option>{PRICE_INTERVAL_GROUPS.map(group=><optgroup key={group.label} label={group.label}>{group.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</optgroup>)}{interval!=='auto'&&!PRICE_INTERVAL_GROUPS.some(group=>group.options.some(option=>option.value===interval))&&<option value={interval}>{interval} (custom)</option>}<option value="custom">Custom interval…</option></select></label></div><div className="flex gap-1"><button type="button" className={button} aria-label="Zoom in price chart" disabled={zoomInDisabled} onClick={()=>zoomChart(0.5)}>+</button><button type="button" className={button} aria-label="Zoom out price chart" disabled={zoomOutDisabled} onClick={()=>zoomChart(2)}>−</button><button type="button" className={button} title="Fit the selected dates using an automatic timeframe" onClick={()=>{setFocus(null);setWindow(null);setRecordedWindow(recordedScope);setInterval('auto');setCustomizing(false);}}>Full period</button></div></div>
      {customizing&&<form aria-label="Custom chart interval" className="mt-2 rounded-lg bg-slate-50 p-3" onSubmit={event=>{event.preventDefault();const next=customPriceInterval(Number(customCount),customUnit);if(!next){setCustomError(customUnit==='m'?'Use a multiple of 5 minutes, from 5 to 1440.':`Use a whole number from 1 to ${{h:24,D:365,W:52,M:12}[customUnit]}.`);return;}setInterval(next);setWindow(null);setCustomizing(false);setCustomError('');}}><div className="flex flex-wrap items-center gap-2"><input aria-label="Custom interval amount" type="number" min={customUnit==='m'?5:1} max={{m:1440,h:24,D:365,W:52,M:12}[customUnit]} step={customUnit==='m'?5:1} value={customCount} onChange={e=>setCustomCount(e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs" required/><select aria-label="Custom interval unit" value={customUnit} onChange={e=>setCustomUnit(e.target.value as PriceIntervalUnit)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs">{[['m','Minutes'],['h','Hours'],['D','Days'],['W','Weeks'],['M','Months']].map(([unit,label])=><option key={unit} value={unit}>{label}</option>)}</select><button type="submit" className={button}>Apply</button><button type="button" className="px-2 py-2 text-xs text-slate-500" onClick={()=>{setCustomizing(false);setCustomError('');}}>Cancel</button></div><p className="mt-2 text-[11px] text-slate-500">{source==='journal'?'The timeframe sets the time grid. Recorded fill times stay exact.':'Minimum 5 minutes. Tick, second and range bars need another data feed.'}</p>{customError&&<p role="alert" className="mt-2 text-xs text-rose-600">{customError}</p>}</form>}
      {browseVisible&&<div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"><span>{recordedOnly?`${dateTime(recordedRange[0])} – ${dateTime(recordedRange[1]-1)}`:`${range[1]-range[0]} of ${bars.length.toLocaleString()} candles · zoom or browse the period`}</span><div className="flex gap-1"><button type="button" aria-label="Earlier period" disabled={recordedOnly?recordedRange[0]<=start:range[0]<=0} className={button} onClick={()=>browse(-1)}>←</button><button type="button" aria-label="Later period" disabled={recordedOnly?recordedRange[1]>=end:range[1]>=bars.length} className={button} onClick={()=>browse(1)}>→</button></div></div>}
      {bars.length>0?<CandleChart bars={bars} from={range[0]} to={range[1]} height={260} linkedPanels={linkedPanels} timelineEnd={windowEnd} dp={symbolSpec(symbol)?.priceDp??4} interactive showTimeAxis responsive label={source==='journal'?`${symbol} demo market price chart with journal entries and exits`:`${symbol} sample market price chart with backtest entries and exits`} markers={markers} lines={lines} onMarkerClick={marker=>{const point=points.find(p=>p.id===marker.id);if(point)select(point);}} tooltipDetail={at=>{const closed=curveAt(curve,at);return <p>Closed P&amp;L {format(closed?.cumulative??0)} · drawdown {(closed?.drawdownPct??0).toFixed(2)}%</p>;}}/>:source==='journal'?<RecordedExecutionChart points={points} selected={focus?.id} from={recordedRange[0]} to={recordedRange[1]} symbol={symbol} timeframe={tf} onSelect={select} panels={linkedPanels} lines={lines}/>:<p className="mt-4 rounded-lg bg-slate-50 p-6 text-center text-xs text-slate-500">Sample candles are unavailable for {symbol} in these dates. Choose another instrument or open Journal to see recorded fills.</p>}
    {source==='simulated'?<>
      <p className="mt-2 text-[11px] text-slate-500">Green/red = buy/sell entry · purple = exit. Chart timeframe changes the view only. {resolveSymbol(symbol)!==symbol?`Sample instrument: ${resolveSymbol(symbol)??'unavailable'}. `:''}Candles use the same generated feed as the backtest; they are not live or verified historical prices.</p>
      {!row.run&&<p className="mt-2 rounded-lg bg-[#FAF8FF] p-3 text-xs text-[#5338ec]">Run backtest above to place matching entries and exits on this price chart.</p>}
      {row.run&&!points.length&&<p className="mt-2 text-xs text-slate-500">{row.run.output.result.zeroTradeReason||'No closed backtest trades match these dates.'}</p>}
      {row.run&&(row.stale||row.partial||row.balanceChanged)&&<p className="mt-2 text-xs text-amber-700">Saved backtest uses {row.stale?'an earlier setup':row.partial?'a different date range':'a different starting balance'}. Run backtest to refresh it.</p>}
    </>:<>
      <p className="mt-2 text-[11px] text-slate-500">{recordedOnly?'Demo candles are unavailable for this instrument or date range; showing recorded fills. Dashed lines connect fills, not market movement.':'Demo candles are illustrative, not historical or live prices. Entry/exit markers, P&L and drawdown use your journal records.'} Day-only entries stay on their recorded date; exits without times are not plotted.</p>
    </>}
    <p className="mt-1 text-[11px] font-medium text-slate-500">One timeline · hover any pane or use ← / → · zoom and browse all three together.</p>
    {focus&&<div aria-label="Selected chart trade" className="mt-3 rounded-xl border border-[#DED5FF] bg-[#FAF8FF] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold">{focus.symbol} · {focus.trade?.direction??(focus.journal?.direction==='BUY'?'Long':'Short')} · {entryLabel(focus)}</p><button type="button" className="text-xs font-semibold text-[#5338ec]" onClick={()=>onPoint(focus)}>Open trade details</button></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><p><span className="block text-[10px] text-slate-500">Entry</span>{executionPrice(focus.trade?.entryPrice??focus.journal?.entryPrice,symbol)}</p><p><span className="block text-[10px] text-slate-500">Exit</span>{executionPrice(focus.trade?.exitPrice??focus.journal?.exitPrice,symbol)}</p><p><span className="block text-[10px] text-slate-500">Net P&amp;L</span>{pointNetKnown(focus)&&focus.at<=end?format(focus.net):'Pending / unavailable'}</p></div></div>}
    <div className="mt-3 grid grid-cols-3 gap-2">{[['Closed trades',String(stats?.count??0)],['Net P&L',stats?.count?format(stats.net):'—'],['Max drawdown',stats?.count?stats.drawdownPct!.toFixed(2)+'%':'—']].map(([label,value])=><div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div>
    <p className="mt-1 text-[10px] text-slate-500">For {symbol} and the selected dates only. Drawdown uses the {new Intl.NumberFormat('en-US',{style:'currency',currency}).format(balance)} reference balance, not account-equity history.</p>
    {ordered.length>0&&<div className="mt-3"><div className="mb-2 flex items-center justify-between"><h5 className="text-xs font-semibold">Recent trades · {symbol}</h5><span className="text-[10px] text-slate-400">{points.length} in this period</span></div><div className="flex max-h-36 flex-col gap-1 overflow-y-auto">{ordered.slice(0,8).map(point=><button key={point.id} type="button" aria-label={`Show chart trade ${point.id}`} aria-pressed={focus?.id===point.id} onClick={()=>select(point)} className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs ${focus?.id===point.id?'border-[#CFC5FF] bg-[#FAF8FF]':'border-slate-100 hover:bg-slate-50'}`}><span>{entryLabel(point)} · {point.trade?.direction??(point.journal?.direction==='BUY'?'Long':'Short')}</span><span className="font-semibold">{pointNetKnown(point)&&point.at<=end?format(point.net):'Open / pending'}</span></button>)}</div></div>}
    </>}
  </section>;
};
