import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSettings,cond,price,ind,val} from '../rules';
import {performJob,seriesFor} from '../job';
import {createRun} from '../engine';
import {parseDay,dayMs} from '../marketData';

test('the reported two-day BTC 4h / EMA50 test warms indicators without adding out-of-range trades',async()=>{
 const settings=defaultSettings();settings.symbol='BTC/USDT';settings.timeframe='4h';settings.from='2026-10-01';settings.to='2026-10-02';
 settings.rules.entry=[cond(price('close'),'gt',ind('EMA',50))];settings.rules.direction='both';settings.session={id:'any',start:0,end:24};
 const series=seriesFor(settings);assert.equal(series.length,12);assert.ok(series.warmup!.length>=50);
 const output=await performJob(settings);assert.ok(output.result.trades.length>0);
 assert.equal(output.result.rangeStart,parseDay(settings.from));assert.equal(output.result.rangeEnd,parseDay(settings.to)+dayMs);
 assert.equal(output.result.diagnostics.bars,12);
 assert.ok(output.result.trades.every(t=>t.entryTime>=parseDay(settings.from)&&t.exitTime<=parseDay(settings.to)+dayMs));
});
test('future bars cannot seed an indicator and impossible rules still produce an honest empty result',async()=>{
 const s=defaultSettings();s.symbol='BTC/USDT';s.timeframe='4h';s.from='2026-10-01';s.to='2026-10-02';
 const series=seriesFor(s);assert.throws(()=>createRun(s,{...series,warmup:{...series,warmup:undefined} as any}),/before the test/);
 s.rules.entry=[cond(price('close'),'lt',val(-1))];s.rules.direction='long';
 const output=await performJob(s);assert.equal(output.result.trades.length,0);assert.match(output.result.zeroTradeReason!,/No bar met/);
});
