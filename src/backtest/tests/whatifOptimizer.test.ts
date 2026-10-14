import test from 'node:test';
import assert from 'node:assert/strict';
import { parameterRules, compareParameters, playbookWhatIfSetup, selectWhatIfBenchmark } from '../whatifOptimizer';
import { DEFAULT_PLAYBOOKS } from '../../data/journalPlaybooks';
import { runWhatIf } from '../whatif';
import { autoMap, convertRows, parseCsv, SAMPLE_CSV } from '../../components/journal/journalIngest';

const imported = () => { const [headers, ...rows] = parseCsv(SAMPLE_CSV); return convertRows(rows, autoMap(headers), [], { strategy: 'Unassigned', currency: 'USD' }).map(r => { assert.equal(r.status,'ok'); return r.entry!; }); };

test('journal benchmarks automatically include existing and newly imported history within one currency', () => {
  const rows = imported();
  const history = [...rows, {...rows[0],id:'euro',accountCurrency:'EUR'}, {...rows[1],id:'account-b',accountId:'Broker B'}];
  assert.deepEqual(selectWhatIfBenchmark([rows[2]],history,'selection','USD'),[rows[2]]);
  assert.equal(selectWhatIfBenchmark([],history,'history','USD').length,4);
  assert.equal(selectWhatIfBenchmark([],history,'playbook','USD','Breakout').length,3);
  assert.equal(selectWhatIfBenchmark([],history,'playbook','USD').length,0);
  assert.deepEqual(selectWhatIfBenchmark([],history,'account:Broker B','USD').map(e => e.id),['account-b']);
  assert.equal(selectWhatIfBenchmark([],history,'account:legacy-demo','USD').length,3);
  const newTrade = {...rows[0],id:'new-import',accountId:'Broker B'};
  assert.equal(selectWhatIfBenchmark([],[...history,newTrade],'history','USD').length,5);
  assert.equal(selectWhatIfBenchmark([],[...history,newTrade],'playbook','USD','Breakout').length,4);
  assert.equal(selectWhatIfBenchmark([],[...history,newTrade],'account:Broker B','USD').length,2);
});

test('history import preserves risk, exits and journal log for price-rule optimization', () => {
  const rows = imported();
  assert.equal(rows[0].initialRisk, 600); assert.equal(rows[0].assetClass, 'Indices');
  assert.equal(rows[0].strategy, 'Breakout'); assert.equal(rows[0].exitTime, '2026-10-05T15:30:00.000Z');
  assert.equal(rows[1].stopPrice, 5852.25); assert.deepEqual(rows[1].mistakes, ['Chased price']);
  assert.equal(rows[0].setupNotes, 'Waited for retest');
  const compared = compareParameters(rows, parameterRules({kind:'target',r:2},0.5,3,0.5));
  assert.equal(compared.length,6); assert.equal(compared[0].output.actual.netPnl,1142);
  assert.ok(compared.some(r => r.output.changed > 0));
  assert.ok(compared.every(r => Math.abs(r.output.whatIf.netPnl - r.output.actual.netPnl - r.output.saved) < 1e-8));
});

test('parameter sweeps reject invalid ranges and keep original setup without duplicates', () => {
  assert.throws(() => parameterRules({kind:'target',r:2},1,10,0.1), /12/);
  assert.throws(() => parameterRules({kind:'lossesPerDay',n:2},0.5,2,0.5), /whole/);
  assert.throws(() => parameterRules({kind:'stop',mult:0.75},0.5,2,0.5), /between/);
  assert.throws(() => parameterRules({kind:'target',r:2},NaN,2,1));
  const rules = parameterRules({kind:'target',r:1.7},1,2,0.5);
  assert.equal(rules.length,4); assert.deepEqual(rules[0],{kind:'target',r:1.7});
  assert.deepEqual(parameterRules({kind:'hours',start:22,end:2},2,4,2),[{kind:'hours',start:22,end:2},{kind:'hours',start:22,end:0}]);
});

test('holdout respects entry-day groups and is evaluated independently', () => {
  const rows = imported(); const extra = {...rows[0],id:'same-day',pnl:-600};
  const compared = compareParameters([rows[2],extra,rows[1],rows[0]],[{kind:'mistakes',tags:['Chased price']}])[0];
  assert.equal(compared.trainingCount,3); assert.equal(compared.validationCount,1);
  assert.equal(compared.validation!.saved,0); assert.ok(Math.abs(compared.training.saved-220.9)<1e-8);
  assert.equal(compareParameters([rows[0],extra],[{kind:'target',r:1}])[0].validation,null);
  const crossing = compareParameters([{...rows[0],exitTime:'2026-10-07T14:00:00Z'}, rows[1], rows[2]],[{kind:'target',r:1}])[0];
  assert.equal(crossing.trainingCount,1); assert.equal(crossing.crossingCount,1); assert.equal(crossing.output.actual.trades,3);
});

test('playbook transfer copies scope and numeric scenario R, without changing its source', () => {
  const pb = DEFAULT_PLAYBOOKS[0]; const before = JSON.stringify(pb);
  const base = playbookWhatIfSetup(pb); assert.equal(base.target,2); assert.equal(base.start,12); assert.equal(base.end,16);
  assert.equal(base.market,'playbook'); assert.deepEqual(base.markets,pb.markets);
  const setup = playbookWhatIfSetup(pb,'sc1'); assert.equal(setup.target,3); assert.deepEqual(setup.symbols,['NAS100']); assert.equal(setup.direction,'BUY');
  setup.symbols.push('OTHER'); assert.equal(JSON.stringify(pb),before);
  assert.equal(playbookWhatIfSetup({...pb,scenarios:[{...pb.scenarios![0],stop:20000}]},'sc1').target,2);
});

test('malformed optional risk and exit-time evidence is rejected rather than fabricated', () => {
  const [headers, ...rows] = parseCsv(SAMPLE_CSV); const mapping = autoMap(headers);
  const badRisk = [...rows[0]]; badRisk[headers.indexOf('InitialRisk')] = '-1';
  assert.equal(convertRows([badRisk],mapping,[],{strategy:'Test'})[0].status,'invalid');
  const badExit = [...rows[0]]; badExit[headers.indexOf('ExitTime')] = '2026-10-01T00:00:00Z';
  assert.equal(convertRows([badExit],mapping,[],{strategy:'Test'})[0].status,'invalid');
});

test('daily-loss optimization does not use an overlapping trade’s future loss', () => {
  const sample = imported()[0];
  const rows = [
    {...sample,id:'first',pnl:-100,commission:0,entryTime:'2026-10-05T12:00:00Z',exitTime:'2026-10-05T14:00:00Z'},
    {...sample,id:'overlap',pnl:50,commission:0,entryTime:'2026-10-05T13:00:00Z',exitTime:'2026-10-05T16:00:00Z'},
    {...sample,id:'after',pnl:50,commission:0,entryTime:'2026-10-05T15:00:00Z',exitTime:'2026-10-05T16:00:00Z'},
  ];
  for (const rule of [{kind:'lossesPerDay' as const,n:1},{kind:'dailyLoss' as const,usd:100}]) {
    assert.deepEqual(runWhatIf(rows,rule).trades.map(t => t.status),['same','same','skipped']);
  }
});
