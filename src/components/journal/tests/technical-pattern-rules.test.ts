import test from 'node:test';
import assert from 'node:assert/strict';
import type { InstrumentPatternSetup, TechnicalPatternRule } from '../../../data/instrumentPatterns';
import { seriesFromBars } from '../../../backtest/marketData';
import { measureInstrumentPattern, newInstrumentPattern, validateInstrumentPattern } from '../instrumentMatching';
import { editableTechnicalSetup, operand, TECHNICAL_TOOLS } from '../technicalPatternRules';

const rule=(left=operand('RSI'),operator:TechnicalPatternRule['operator']='above',right=operand('number',70)):TechnicalPatternRule=>({id:'r1',left,operator,right});
const setup=(rules:TechnicalPatternRule[]):InstrumentPatternSetup=>({...newInstrumentPattern('custom'),id:'my-setup',name:'My setup',patternType:'My custom price confirmation',matchMode:'all',minFit:0,technicalRules:rules});
const series=(close=(i:number)=>100+i*0.2)=>seriesFromBars('EUR/USD','1h',Array.from({length:130},(_,i)=>({t:Date.UTC(2026,8,1)+i*3600000,o:close(i)-0.02,h:close(i)+0.1,l:close(i)-0.1,c:close(i),v:100})));
const measure=(config:InstrumentPatternSetup,bars=series())=>measureInstrumentPattern(bars,'custom',Infinity,config);

test('custom pattern categories and technical rules validate before scanning',()=>{
  const config=setup([rule()]);
  assert.equal(validateInstrumentPattern(config),null);
  assert.ok(Object.keys(TECHNICAL_TOOLS).length>35);
  assert.match(validateInstrumentPattern({...config,patternType:' '})!,/pattern type/);
  assert.match(validateInstrumentPattern({...config,technicalRules:[]})!,/1 and 12/);
  assert.match(validateInstrumentPattern({...config,technicalRules:[rule(),rule()]})!,/unique ID/);
  assert.match(validateInstrumentPattern(setup([rule({...operand('SMA'),period:500})]))!,/period/);
  assert.match(validateInstrumentPattern(setup([rule({...operand('MACD'),fastPeriod:50,slowPeriod:20})]))!,/MACD/);
  assert.match(validateInstrumentPattern(setup([rule({...operand('BB_UPPER'),deviations:0})]))!,/deviation/);
  assert.match(validateInstrumentPattern(setup([rule({...operand('RSI'),tool:'UNKNOWN' as never})]))!,/supported/);
  assert.match(validateInstrumentPattern(setup([rule({...operand('RSI'),offset:NaN})]))!,/finite/);
});

test('custom scans compare indicators, apply thresholds and use All/Any plus minimum rule fit',()=>{
  const bullish=rule(),failing={...rule(operand('close'),'below',operand('number',1)),id:'r2'};
  const config=setup([bullish,failing]);
  assert.equal(measure(config),null);
  const any={...config,matchMode:'any' as const};
  assert.equal(measure(any)!.score,50);
  assert.match(measure(any)!.reasons[1],/Passed: RSI/);
  assert.match(measure(any)!.reasons[2],/Not met/);
  assert.equal(measure({...any,minFit:51}),null);
  const comparison=setup([rule({...operand('SMA'),period:5},'above',{...operand('SMA'),period:30})]);
  assert.equal(measure(comparison)!.score,100);
  assert.match(measure(comparison)!.reasons[1],/SMA \(5\).*SMA \(30\)/);
  const threshold=operand('number',123);
  assert.ok(measure(setup([rule({...operand('SMA'),period:5},'above',threshold)])));
  assert.equal(measure(setup([rule({...operand('SMA'),period:50},'above',threshold)])),null);
});

test('crossovers require the final two completed candles and ignore later data',()=>{
  const bars=series(i=>i===128 ? 99 : i===129 ? 101 : 100);
  const config=setup([rule(operand('close'),'crossAbove',operand('number',100))]);
  assert.ok(measure(config,bars));
  assert.equal(measure({...config,technicalRules:[rule(operand('close'),'crossBelow',operand('number',100))]},bars),null);
  const cutoff=bars.t[128]+3600000;
  const before=measureInstrumentPattern(bars,'custom',cutoff,config);
  bars.c[129]=NaN;
  assert.deepEqual(measureInstrumentPattern(bars,'custom',cutoff,config),before);
  assert.equal(measure(config,bars),null);
});

test('volume averages and breakout range/ATR periods are configurable rules',()=>{
  const bars=series(()=>100);
  for(let i=0;i<130;i++)bars.v[i]=i>=119 ? 100 : 200;
  bars.v[129]=150;
  const volume=(period:number)=>setup([rule({...operand('relativeVolume'),period},'atLeast',operand('number',1.2))]);
  assert.ok(measure(volume(10),bars));
  assert.equal(measure(volume(50),bars),null);
  const breakout=series(i=>i===129 ? 110 : 100);
  breakout.h[100]=120;
  const range=(period:number)=>setup([rule({...operand('breakoutUp'),period,atrPeriod:10},'above',operand('number',0.1))]);
  assert.ok(measure(range(20),breakout));
  assert.equal(measure(range(40),breakout),null);
  assert.match(measure(range(20),breakout)!.reasons[1],/ATR 10/);
});

test('MACD settings, Bollinger deviations and operand transforms change calculated evidence',()=>{
  const bars=series(i=>100+Math.sin(i/4)*2+i*0.01);
  const evidence=(left:ReturnType<typeof operand>)=>measure(setup([rule(left,'above',operand('number',-10000))]),bars)!.reasons[1];
  assert.notEqual(evidence(operand('MACD')),evidence({...operand('MACD'),fastPeriod:5,slowPeriod:20,signalPeriod:4}));
  assert.notEqual(evidence(operand('BB_UPPER')),evidence({...operand('BB_UPPER'),deviations:3}));
  const config=setup([rule({...operand('number',2),multiplier:3,offset:1},'atLeast',operand('number',7))]);
  assert.ok(measure(config));
  assert.equal(measure({...config,technicalRules:[rule({...operand('number',2),multiplier:3,offset:0},'atLeast',operand('number',7))]}),null);
});

test('insufficient indicator warm-up fails closed and legacy settings stay intact until edited',()=>{
  const config=setup([rule({...operand('MACD'),slowPeriod:118,fastPeriod:100,signalPeriod:100})]);
  assert.equal(validateInstrumentPattern(config),null);
  assert.equal(measure(config),null);
  const legacy={...newInstrumentPattern('breakout'),id:'old',name:'Old setup',minVolumeRatio:1.5,minBreakoutAtr:0.2,direction:'bearish' as const};
  const snapshot=JSON.stringify(legacy),editable=editableTechnicalSetup(legacy);
  assert.equal(JSON.stringify(legacy),snapshot);
  assert.equal(editable.pattern,'custom');
  assert.equal(editable.technicalRules!.length,3);
  assert.equal(editable.technicalRules![2].left.tool,'breakoutEither');
  const saved=JSON.parse(JSON.stringify(editable));
  assert.deepEqual(saved,editable);
  assert.equal(validateInstrumentPattern(saved),null);
});
