import { JournalHelp } from '../journal/JournalHelp';
import React, { useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import type { WhatIfRule } from '../../backtest/whatif';
import { describeWhatIf as describeRule } from '../../backtest/whatif';
import { dayMs, resolveSymbol, symbolSpec } from '../../backtest/marketData';
import { JournalCurrency, formatMoney } from '../journal/JournalCurrency';
import { CandleChart, LineChart } from './charts';
import { CollapsibleCard, Field, Pill, inputBase, btnSecondary } from './ui';
import { MarketSydeRecommender, RecommendationBadge } from './MarketSydeRecommender';
import type { WhatIfStudyModel } from './useWhatIfStudy';
import type {WhatIfStudyRow} from '../../backtest/savedWhatIf';
import type {WhatIfSnapshot} from '../../backtest/store';
import {SaveScenarioButton} from './SaveScenarioButton';
import {ChartTimeframeSelect} from './ChartTimeframeSelect';
import {executionPriceBars,selectedPriceInterval,priceWindowEnd,shiftPriceInterval,clampTimeWindow,resizeTimeWindow,shiftTimeWindow,recordedTimeTicks,type PriceChartInterval,type TimeWindow} from '../journal/executionPriceStudy';
import {curveAt} from '../journal/executionChartData';
import {linkedValueAt,type LinkedPanel} from './linkedPerformance';
import {whatIfPerformance,windowWhatIfSeries,whatIfRecordedMarkers} from './whatIfChart';

const COLORS = ['#5338ec', '#059669', '#0284c7', '#d97706', '#db2777', '#7c3aed'];
export const WhatIfComparison: React.FC<{ benchmarkLabel?:string; fixedScope?:boolean; entries: JournalEntry[]; selectedSymbols:string[]; instrumentOptions:string[]; onInstrument:(symbol:string)=>void; rule: WhatIfRule; model:WhatIfStudyModel; onSelect: (rule: WhatIfRule) => void; onSave:(row:WhatIfStudyRow,source:WhatIfSnapshot['source'])=>void; isSaved:(row:WhatIfStudyRow,source:WhatIfSnapshot['source'])=>boolean }> = ({ benchmarkLabel, fixedScope=false, entries, selectedSymbols,instrumentOptions,onInstrument,rule, model, onSelect,onSave,isSaved }) => {
  const currency = React.useContext(JournalCurrency);
  const money = (n: number) => Number.isFinite(n) ? formatMoney(n, currency, 2) : '—';
  const describeWhatIf = (rule: WhatIfRule) => rule.kind === 'dailyLoss' ? `Stop after ${money(rule.usd)} net loss in a day` : describeRule(rule);
  const {bounds,setBounds,goal:recommendationGoal,setGoal:setRecommendationGoal,baseline:recommendationBaseline}=model;
  const comparison={rows:model.rows,error:model.error};
  const recommendation={...model.recommendation,candidate:model.recommendation.candidate&&model.aiRow?{...model.recommendation.candidate,name:describeWhatIf(model.aiRow.rule)}:null};
  const [score, setScore] = useState('net');
  const [improvedOnly, setImprovedOnly] = useState(false);
  const [visible, setVisible] = useState<string[] | null>(null);

  const [chartWindow,setChartWindow]=useState<[number,number]|null>(null);
  const [equityWindow,setEquityWindow]=useState<TimeWindow|null>(null);
  const [interval,setInterval]=useState<'auto'|PriceChartInterval>('auto');
  const [performanceId,setPerformanceId]=useState('setup');
  const [focusId,setFocusId]=useState<string|null>(null);
  const chartRef=React.useRef<HTMLDivElement>(null);
  useEffect(() => { setVisible(null); }, [rule.kind]);

  const rank = (row: typeof comparison.rows[number]) => score === 'drawdown' ? -row.training.whatIf.maxDD : score === 'win' ? row.training.whatIf.winRate : row.training.whatIf.netPnl;
  const ranked = [...comparison.rows].sort((a, b) => rank(b) - rank(a));
  const shown = ranked.filter(r => !improvedOnly || r.output.saved > 0);
  const selected = shown.filter(r => visible ? visible.includes(r.id) : shown.indexOf(r) < 3 || r.id === recommendation.candidate?.id || r.id === JSON.stringify(rule)).slice(0,6);
  const symbols = Array.from(new Set<string>(entries.map(e => e.symbol))).sort();
  const [chartSymbol,setChartSymbol]=useState('');
  const instrument=(fixedScope&&symbols.includes(chartSymbol)?chartSymbol:'')||selectedSymbols.map(selected=>symbols.find(symbol=>symbol===selected||(!!resolveSymbol(selected)&&resolveSymbol(selected)===resolveSymbol(symbol)))).find(Boolean)||symbols[0]||'';
  const actualTrades = comparison.rows[0]?.output.trades ?? [];
  const timestamps=actualTrades.flatMap(t=>[t.entryTime,t.exitTime]).filter(Number.isFinite);
  const scopeStart=Math.floor((timestamps.length?Math.min(...timestamps):0)/dayMs)*dayMs;
  const scopeEnd=Math.floor((timestamps.length?Math.max(...timestamps):0)/dayMs)*dayMs+dayMs;
  const startDate=new Date(scopeStart).toISOString().slice(0,10),endDate=new Date(scopeEnd-dayMs).toISOString().slice(0,10);
  const autoTf=selectedPriceInterval('auto',startDate,endDate),tf=selectedPriceInterval(interval,startDate,endDate);
  useEffect(()=>{setChartWindow(null);setEquityWindow(null);},[instrument,scopeStart,scopeEnd,tf]);
  const bars=useMemo(()=>executionPriceBars(instrument,startDate,endDate,tf),[instrument,startDate,endDate,tf]);
  const origin = [{x:scopeStart,y:0}];
  const actualCurve = [...origin,...whatIfPerformance(actualTrades,true).nodes.map(n=>({x:n.at,y:n.cumulative}))];
  const portfolioSeries = [{ name: 'Actual', color: '#94a3b8', dashed: true, points: actualCurve }, ...selected.map((row, i) => {
    return { name: (row.id === JSON.stringify(rule) ? 'Your setup · ' : '') + describeWhatIf(row.rule) + (row.id === recommendation.candidate?.id ? (recommendation.status === 'exploratory' ? ' · AI exploration' : ' · MarketSyde AI') : ''), color: row.id === recommendation.candidate?.id ? '#5338ec' : row.id === JSON.stringify(rule) ? '#0284c7' : COLORS[(i + 1) % COLORS.length], points: [...origin,...whatIfPerformance(row.output.trades,false).nodes.map(n=>({x:n.at,y:n.cumulative}))] };
  })];
  const performanceChoices=selected.filter(row=>row.id!==JSON.stringify(rule));
  const performanceKey=performanceId==='actual'||performanceId==='setup'||performanceChoices.some(row=>row.id===performanceId)?performanceId:'setup';
  const performanceRow=performanceChoices.find(row=>row.id===performanceKey)??comparison.rows[0];
  const performance=whatIfPerformance(performanceRow?.output.trades??[],performanceKey==='actual');
  const performanceName=performanceKey==='actual'?'Original':performanceKey==='setup'?'Your setup':describeWhatIf(performanceRow.rule);
  const highlightColor=focusId===performanceRow?.id?'#5338ec':performanceKey==='actual'?'#94a3b8':'#0284c7';
  const markerSource=performanceKey==='actual'?'History':performanceKey==='setup'?'Your setup':`Scenario ${Math.max(0,comparison.rows.findIndex(row=>row.id===performanceRow?.id))+1}`;
  const highlightedTrades=useMemo(()=>performanceKey==='actual'?actualTrades.map(trade=>({...trade,status:'same' as const,newNet:trade.actualNet,newR:trade.actualR})):performanceRow?.output.trades??[],[performanceKey,actualTrades,performanceRow]);
  const markers=useMemo(()=>whatIfRecordedMarkers(highlightedTrades,entries,bars,instrument,tf,performanceName,highlightColor,markerSource),[highlightedTrades,entries,bars,instrument,tf,performanceName,highlightColor,markerSource]);
  const highlightedCurve=[...origin,...performance.nodes.map(n=>({x:n.at,y:n.cumulative}))];
  const highlightSeries=[{name:'Original benchmark',color:'#94a3b8',dashed:true,points:actualCurve},{name:performanceName,color:highlightColor,points:highlightedCurve}];
  const candleHighlightSeries=highlightSeries.map(line=>{const points=line.points.map(point=>({at:point.x,value:point.y}));return {...line,points:bars.map(bar=>({x:bar.t,y:linkedValueAt(points,bar.t)}))};});
  const tradeAt=(id:string)=>highlightedTrades.find(trade=>id===trade.id+':entry'||id===trade.id+':exit');
  const [selectedMarker,setSelectedMarker]=useState<string|null>(null);
  const selectedTrade=selectedMarker?tradeAt(selectedMarker):undefined;
  useEffect(()=>setSelectedMarker(null),[performanceKey,instrument]);
  const compact=(value:number)=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(Math.abs(value)<1e-9?0:value);
  const panels:LinkedPanel[]=[
    {id:'pnl',label:'Cumulative closed P&L',color:highlightColor,points:performance.nodes.map(n=>({at:n.at,value:n.cumulative})),format:money,axisFormat:compact},
    {id:'drawdown',label:'Drawdown from peak',color:'#e11d48',points:performance.nodes.map(n=>({at:n.at,value:n.drawdown})),format:v=>money(-v),axisFormat:v=>compact(-v),underwater:true},
  ];
  const fallbackRange:[number,number]=[interval==='auto'?0:Math.max(0,bars.length-200),bars.length];
  const to=Math.max(0,Math.min(bars.length,(chartWindow??fallbackRange)[1])),from=Math.max(0,Math.min(to-1,(chartWindow??fallbackRange)[0]));
  const scope:TimeWindow=[scopeStart,scopeEnd],equityRange=clampTimeWindow(equityWindow??scope,scope);
  const candleView=bars.length>0;
  const windowEnd=priceWindowEnd(bars,to,tf,scopeEnd);
  const minimum=Math.min(scopeEnd-scopeStart,Math.abs(shiftPriceInterval((equityRange[0]+equityRange[1])/2,tf,8)-(equityRange[0]+equityRange[1])/2));
  const zoom=(factor:number)=>{
    if(!candleView){setEquityWindow(resizeTimeWindow(equityRange,scope,factor,minimum));return;}
    const size=Math.min(bars.length,Math.max(8,Math.min(200,Math.round((to-from)*factor)))),lo=Math.max(0,Math.min(bars.length-size,Math.round((from+to-size)/2)));setChartWindow([lo,lo+size]);
  };
  const browse=(direction:number)=>{if(!candleView){setEquityWindow(shiftTimeWindow(equityRange,scope,direction));return;}const size=to-from,lo=Math.max(0,Math.min(bars.length-size,from+direction*Math.max(1,Math.round(size/2))));setChartWindow([lo,lo+size]);};
  const fullPeriod=()=>{setInterval('auto');setChartWindow(null);setEquityWindow(null);};
  const hoverDetail=(at:number)=>{const node=curveAt(performance.nodes,at);return <p>{performanceName} · Closed P&amp;L {money(node?.cumulative??0)} · drawdown {money(-(node?.drawdown??0))}</p>;};
  const first = comparison.rows[0];
  const rowSource=(row:WhatIfStudyRow):WhatIfSnapshot['source']=>row.id===JSON.stringify(rule)?'user':row.id===model.aiRow?.id?'ai':'parameter';
  const focusScenario=(id:string)=>{model.pin(id);setImprovedOnly(false);setVisible([...new Set([JSON.stringify(rule),id])]);setPerformanceId(id===JSON.stringify(rule)?'setup':id);setFocusId(id);window.setTimeout(()=>chartRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),60);};
  const focusRow=focusId?comparison.rows.find(row=>row.id===focusId)??null:null;
  const pctPts=(a:number,b:number)=>`${((a-b)*100)>=0?'+':''}${((a-b)*100).toFixed(1)} pts`;
  return <div className="space-y-5">
    <MarketSydeRecommender collapsible estimateLabel={model.aiRow?.rule.kind==='technical'?'Demo price check':'Estimated price path'} recommendation={recommendation} baseline={recommendationBaseline} baselineName={benchmarkLabel?benchmarkLabel+" on the training days":"actual journal history on the training days"} goal={recommendationGoal} onGoal={setRecommendationGoal} money={money}
      evidence={`Selection uses the first 70% of entry days. The remaining days are checked independently; crossing trades stay in full-history results only. AI explores ${model.tested} supported setups across guardrails, session, tags and price-dependent rules, including your parameter range.`} action="Compare AI scenario" onUse={focusScenario} ideas={model.ideas} selectedId={focusId} />
    <div ref={chartRef} className="scroll-mt-24"><CollapsibleCard title="Candles & scenario comparison" summary={`${instrument || 'No instrument'} · ${tf} · ${performanceName}`} sub="Explore price, closed P&L and drawdown on one timeline.">
      {focusRow&&<section aria-label="Selected scenario details" className="mb-4 rounded-xl border border-[#5338ec]/30 bg-[#F6F3FF] p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#5338ec]">{focusRow.id===recommendation.candidate?.id?'MarketSyde AI scenario':'Scenario details'}</p><h4 className="mt-1 text-sm font-bold">{describeWhatIf(focusRow.rule)}</h4><p className="mt-1 text-[11px] text-slate-500">Same {entries.length} trades · candles, P&amp;L and drawdown below now follow this scenario{focusRow.output.estimated?' · estimated price path':''}.</p></div><button type="button" className={btnSecondary} onClick={()=>{setFocusId(null);setPerformanceId('setup');}}>Back to your setup</button></div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">{([
          ['Net P&L',money(focusRow.output.whatIf.netPnl),`${money(focusRow.output.saved)} vs original`],
          ['Win rate',`${(focusRow.output.whatIf.winRate*100).toFixed(1)}%`,pctPts(focusRow.output.whatIf.winRate,focusRow.output.actual.winRate)],
          ['Max drawdown',money(-focusRow.output.whatIf.maxDD),`original ${money(-focusRow.output.actual.maxDD)}`],
          ['Trades changed',`${focusRow.output.changed} changed · ${focusRow.output.skipped} skipped`,`${focusRow.output.lossesAvoided} losses avoided · ${focusRow.output.winsForfeited} wins reduced`],
          ['Holdout',focusRow.validation?money(focusRow.validation.whatIf.netPnl-focusRow.validation.actual.netPnl):'—',focusRow.validation?`${focusRow.validationCount} holdout trades`:'not enough days'],
        ] as [string,string,string][]).map(([k,v,sub])=><div key={k} className="rounded-lg bg-white p-2.5"><dt className="text-[10px] text-slate-500">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd><p className="mt-0.5 text-[10px] text-slate-500">{sub}</p></div>)}</dl>
      </section>}
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <Field label={fixedScope?'Candle instrument':'Candle instrument · linked to setup'} htmlFor="wi-chart-symbol"><select id="wi-chart-symbol" className={inputBase} value={instrument} onChange={e => fixedScope?setChartSymbol(e.target.value):onInstrument(e.target.value)}>{instrumentOptions.map(s => <option key={s}>{s}</option>)}</select></Field>

      </div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3"><ChartTimeframeSelect value={interval} autoInterval={autoTf} onChange={value=>{setInterval(value);setChartWindow(null);setEquityWindow(null);}}/><div className="flex flex-wrap gap-1">
        <button type="button" className={btnSecondary} aria-label="Zoom in What-if chart" disabled={candleView?to-from<=8:equityRange[1]-equityRange[0]<=minimum} onClick={()=>zoom(0.5)}>+</button>
        <button type="button" className={btnSecondary} aria-label="Zoom out What-if chart" disabled={candleView?to-from>=Math.min(200,bars.length):equityRange[1]-equityRange[0]>=scopeEnd-scopeStart} onClick={()=>zoom(2)}>−</button>
        <button type="button" className={btnSecondary} onClick={fullPeriod}>Full period</button>
      </div></div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"><span>{performanceName} · Selected result · {currency}{candleView?` · ${to-from} of ${bars.length.toLocaleString()} candles`:''}</span><div className="flex gap-1"><button type="button" className={btnSecondary} aria-label="Earlier What-if period" disabled={candleView?from<=0:equityRange[0]<=scopeStart} onClick={()=>browse(-1)}>←</button><button type="button" className={btnSecondary} aria-label="Later What-if period" disabled={candleView?to>=bars.length:equityRange[1]>=scopeEnd} onClick={()=>browse(1)}>→</button></div></div>
      {candleView ? <><CandleChart label={`${instrument} demo candles with linked What-if performance`} bars={bars} from={from} to={to} height={260} dp={symbolSpec(instrument)?.priceDp ?? 2} responsive showTimeAxis interactive timelineEnd={windowEnd} linkedPanels={panels} tooltipDetail={hoverDetail} markers={markers} onMarkerClick={marker=>setSelectedMarker(marker.id??null)} pnl={{series:candleHighlightSeries,detail:at=>{const node=curveAt(performance.nodes,at);return <p>{performanceName}: {money(node?.cumulative??0)}</p>;}}}/>
        <label className="block text-[11px] text-slate-500 mt-3">Chart timeline<JournalHelp label="Chart timeline" /><input type="range" aria-label="What-if candle timeline" min={to-from} max={bars.length} value={to} onChange={e=>{const end=Number(e.target.value);setChartWindow([end-(to-from),end]);}} className="w-full accent-[#5338ec]" /></label></> : <>
        <p role="status" className="text-xs text-slate-500 mb-3">No demo candles for this instrument and date range. Showing full-history equity.</p>
        <LineChart label="Actual and What-if full-history equity" height={260} area={false} yFmt={money} xFmt={x=>new Date(x).toISOString().slice(5,tf.endsWith('m')||tf.endsWith('h')?16:10).replace('T',' ')} series={windowWhatIfSeries(focusId?highlightSeries:portfolioSeries,equityRange[0],equityRange[1]-1)} timeline={[equityRange[0],equityRange[1]-1]} timeTicks={recordedTimeTicks(equityRange[0],equityRange[1],tf)} linkedPanels={panels} tooltipDetail={hoverDetail}/>
      </>}
      <p className="mt-2 text-[11px] text-slate-500">One timeline · hover any pane or use ← / → · zoom and browse together.</p>
      <p className="mt-2 text-[11px] text-slate-500"><span aria-hidden className="mr-1 inline-block h-2 w-2 rounded-full" style={{background:highlightColor}}/>The highlighted line and recorded entry/exit dots follow {performanceName}. Grey dots represent trades skipped by this scenario; the dashed line is the original benchmark. Recorded fills are not estimated scenario exit or stop-loss prices.</p>
      {selectedTrade&&<div aria-label="Selected scenario trade" className="mt-3 rounded-lg border border-[#5338ec]/30 bg-[#F6F3FF] p-3 text-xs"><p className="font-semibold">{performanceName} · {selectedTrade.symbol} · {selectedTrade.direction==='BUY'?'Long':'Short'}</p><p className="mt-1">Original {money(selectedTrade.actualNet)} · Scenario {money(selectedTrade.newNet)} · {selectedTrade.status}</p>{selectedTrade.note&&<p className="mt-1 text-slate-500">{selectedTrade.note}</p>}</div>}
      <div className="mt-3 grid grid-cols-3 gap-2" aria-label="What-if chart summary">{[['Closed trades',String(performance.count)],['Net P&L',money(performance.net)],['Max drawdown',money(-performance.maxDD)]].map(([label,value])=><div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div>
      <p className="text-[11px] text-slate-500 mt-3">{performanceName} · Full selected period. Drawdown uses exact close times in {currency}; no account balance is assumed. Chart timeframe changes the view only. Demo candles are illustrative and do not drive What-if calculations.</p>
    </CollapsibleCard></div>
    <CollapsibleCard title="Parameter optimization" summary={comparison.error ? 'Check parameter range' : `${comparison.rows.length} setups compared · ${entries.length} trades`} sub="Sweep one parameter on the same trades. Select rows to compare up to six scenarios on the main chart.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        {rule.kind==='technical'?<p className="text-xs text-slate-500">Compare all {rule.conditions.length} conditions together with each condition individually · {rule.timeframe} · demo prices.</p>:rule.kind !== 'mistakes' ? bounds.map((value, i) => <Field key={i} label={['Minimum', 'Maximum', 'Step'][i]} htmlFor={`wi-bound-${i}`}><input id={`wi-bound-${i}`} type="number" min="0.01" step={rule.kind === 'lossesPerDay' || rule.kind === 'hours' ? 1 : 0.25} value={value} onChange={e => { setBounds(b => b.map((v, j) => i === j ? Number(e.target.value) : v)); setVisible(null); }} className={`${inputBase} w-24`} /></Field>) : <p className="text-xs text-slate-500">Compare the selected tag set with each individual tag.</p>}
        <Field label="Rank by training result" htmlFor="wi-rank"><select id="wi-rank" className={inputBase} value={score} onChange={e => setScore(e.target.value)}><option value="net">Highest net P&amp;L</option><option value="drawdown">Lowest drawdown</option><option value="win">Highest win rate</option></select></Field>
        <label className="flex items-center gap-2 h-9 text-xs"><input type="checkbox" checked={improvedOnly} onChange={e => setImprovedOnly(e.target.checked)} />Improved net only<JournalHelp label="Improved net only" /></label>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">{rule.kind === 'hours' ? 'Range is session duration in hours, from the selected UTC start.' : rule.kind === 'dailyLoss' ? `Range is daily loss in ${currency}.` : rule.kind === 'lossesPerDay' ? 'Range is the number of losses allowed each day.' : rule.kind !== 'mistakes' && rule.kind !== 'technical' ? 'Range is measured in R, relative to each recorded trade’s initial risk.' : ''} The current setup is included alongside the range. A highlighted AI scenario can use another supported rule.</p>
      {['stop','target','breakeven'].includes(rule.kind) && <p className="text-[11px] text-amber-700 mb-3">Price-path coverage: {entries.filter(e => Number.isFinite(e.initialRisk) && e.initialRisk! > 0).length} / {entries.length} trades have initial monetary risk. Missing-risk trades stay unchanged. Paths are reconstructed estimates, not recorded candles.</p>}
      {comparison.error && <p role="alert" className="text-xs text-rose-600">{comparison.error}</p>}
      {first && <div className="flex flex-wrap gap-2 mb-3"><Pill tone="info">{first.trainingCount} training trades</Pill><Pill tone="neutral">{first.validationCount} holdout trades</Pill><span className="text-[11px] text-slate-500">First 70% of entry days train; remaining days validate independently. {first.validationCount ? 'Holdout results do not determine ranking.' : 'More entry days are needed for a holdout.'} {first.crossingCount ? `${first.crossingCount} trades cross the split and appear only in full-history results.` : ''}</span></div>}
      {entries.length < 30 && <p className="text-[11px] text-amber-700 mb-3">Small sample: {entries.length} trades. An in-sample winner is a hypothesis to test.</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[790px] text-xs tabular-nums"><thead><tr className="border-b text-slate-500 text-left"><th className="py-2">Chart / scenario</th><th className="text-right">Net P&amp;L<JournalHelp label="Net P&L" /></th><th className="text-right">Δ actual</th><th className="text-right">Win rate<JournalHelp label="Win rate" /></th><th className="text-right">Drawdown</th><th className="text-right">Taken / skipped</th><th className="text-right">Training Δ</th><th className="text-right">Holdout Δ</th><th>Actions</th></tr></thead><tbody>
        <tr className="bg-slate-50 border-b"><td className="py-3 font-bold">Actual history</td><td className="text-right">{money(first?.output.actual.netPnl ?? NaN)}</td><td className="text-right">—</td><td className="text-right">{first && Number.isFinite(first.output.actual.winRate) ? `${(first.output.actual.winRate*100).toFixed(1)}%` : '—'}</td><td className="text-right">{money(first?.output.actual.maxDD ?? NaN)}</td><td className="text-right">{entries.length} / 0</td><td colSpan={3} /></tr>
        {shown.map(row => <tr key={row.id} className={`border-b border-slate-100 ${row.id === recommendation.candidate?.id ? 'bg-[#F1EDFF]' : ''} ${JSON.stringify(rule) === row.id ? 'bg-[#FBFAFF]' : ''}`}><td className="py-3 pr-3"><label className="flex items-start gap-2"><input type="checkbox" aria-label={`Chart ${describeWhatIf(row.rule)}`} checked={selected.some(r => r.id === row.id)} disabled={!selected.some(r => r.id === row.id) && selected.length >= 6} onChange={() => setVisible(selected.some(r => r.id === row.id) ? selected.filter(r => r.id !== row.id).map(r => r.id) : [...selected.map(r => r.id), row.id])} /><span>{describeWhatIf(row.rule)}{row.id === recommendation.candidate?.id && <span className="block mt-1"><RecommendationBadge exploratory={recommendation.status === 'exploratory'} /></span>}{row.output.estimated && <span className="block text-[10px] text-amber-600">{row.rule.kind==='technical'?'Demo price check':'Estimated price path'}</span>}</span></label></td><td className="text-right font-bold">{money(row.output.whatIf.netPnl)}</td><td className={`text-right ${row.output.saved > 0 ? 'text-emerald-600' : row.output.saved < 0 ? 'text-rose-600' : ''}`}>{money(row.output.saved)}</td><td className="text-right">{Number.isFinite(row.output.whatIf.winRate) ? `${(row.output.whatIf.winRate*100).toFixed(1)}%` : '—'}</td><td className="text-right">{money(row.output.whatIf.maxDD)}</td><td className="text-right">{row.output.whatIf.trades} / {row.output.skipped}</td><td className="text-right">{money(row.training.saved)}</td><td className="text-right">{money(row.validation?.saved ?? NaN)}</td><td className="pl-3"><div className="flex items-center gap-1"><SaveScenarioButton name={describeWhatIf(row.rule)} saved={isSaved(row,rowSource(row))} onSave={()=>onSave(row,rowSource(row))}/><button className={btnSecondary} type="button" onClick={() => onSelect(row.rule)}>Use setup</button></div></td></tr>)}
      </tbody></table></div>
      {!shown.length && !comparison.error && <p role="status" className="text-xs text-slate-500 mt-3">No scenarios match this comparison filter.</p>}
    </CollapsibleCard>
  </div>;
};
