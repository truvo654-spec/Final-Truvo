import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import type { JournalEntry } from '../../../types';
import { seriesFromBars, parseDay, dayMs } from '../../../backtest/marketData';
import { DATA_END } from '../../../backtest/config';
import { filterPlaybookInventory } from '../playbookInventory';
import { canonicalInstrument, INSTRUMENT_MARKETS, instrumentSelection, measureInstrumentPattern, newInstrumentPattern, PLAYBOOK_INSTRUMENTS, playbookInstrumentSelection, playbookPattern, suggestPlaybookInstruments, validateInstrumentPattern } from '../instrumentMatching';

const book = { ...DEFAULT_PLAYBOOKS[0], markets: ['Forex'] as const };
const forexBook = () => ({ ...book, markets: [...book.markets] });
const series = (shape: 'trend' | 'range' | 'breakout', count = 130) => seriesFromBars('EUR/USD', '1h', Array.from({ length: count }, (_, i) => {
  const close = shape === 'trend' ? 100+i*0.15 : shape === 'breakout' && i === count-1 ? 110 : 100+(i%2 ? 0.4 : -0.4);
  return { t: Date.UTC(2026,8,20)+i*3600000, o: close-0.03, h: close+0.15, l: close-0.2, c: close, v: shape === 'breakout' && i === count-1 ? 300 : 100 };
}));

test('inventory keeps Draft, Testing, Active and Archived distinct and counts can follow market/search', () => {
  const books = [...DEFAULT_PLAYBOOKS, { ...forexBook(), id:'draft', name:'My unfinished setup', status:'draft' as const }];
  const snapshot = JSON.stringify(books);
  assert.deepEqual(filterPlaybookInventory(books,'all','','draft').map(b => b.id), ['draft']);
  assert.equal(filterPlaybookInventory(books,'all','','active').length, 4);
  assert.equal(filterPlaybookInventory(books,'all','','archived').length, 1);
  assert.equal(filterPlaybookInventory(books,'Stocks','','draft').length, 0);
  assert.equal(filterPlaybookInventory(books,'Forex','unfinished','draft').length, 1);
  assert.equal(filterPlaybookInventory(books,'all','','all').length, books.length);
  assert.equal(JSON.stringify(books), snapshot);
});

test('selection supports all five markets and expands saved scope without discarding existing categories', () => {
  assert.deepEqual(INSTRUMENT_MARKETS, ['Forex','Indices','Commodity','Crypto','Stocks']);
  assert.deepEqual([...new Set(PLAYBOOK_INSTRUMENTS.map(i => i.market))], INSTRUMENT_MARKETS);
  const original = forexBook();
  const snapshot = JSON.stringify(original);
  const selection = playbookInstrumentSelection(original, ['NVDA','BTCUSDT','MGC','MNQ'], {});
  assert.deepEqual(selection.markets, INSTRUMENT_MARKETS);
  assert.deepEqual(selection.symbols, ['NVDA','BTC/USDT','XAU/USD','NAS100']);
  assert.equal(selection.instrumentMarkets.NVDA, 'Stocks');
  assert.deepEqual(playbookInstrumentSelection(original, [], {}).markets, ['Forex']);
  assert.deepEqual(playbookInstrumentSelection({ ...original,markets:[] }, ['NVDA'], {}).markets, ['Stocks']);
  assert.equal(JSON.stringify(original), snapshot);
});

test('saving an instrument selection normalizes aliases, deduplicates and preserves custom market assignments', () => {
  const symbols = ['EURUSD','EUR/USD','MNQ','NAS100','myindex'];
  const assigned = { MYINDEX: 'Indices' as const };
  const result = instrumentSelection(symbols, assigned);
  assert.deepEqual(result.symbols,['EUR/USD','NAS100','MYINDEX']);
  assert.deepEqual(result.instrumentMarkets, { 'EUR/USD':'Forex', NAS100:'Indices', MYINDEX:'Indices' });
  assert.equal(canonicalInstrument('MGC'),'XAU/USD');
  assert.equal(symbols.length,5);
  assert.deepEqual(assigned,{ MYINDEX:'Indices' });
});

test('pattern matching distinguishes directional movement, ranges and observed breakouts', () => {
  const trend = series('trend'), range = series('range'), breakout = series('breakout');
  assert.ok(measureInstrumentPattern(trend,'trend',Infinity)!.score > measureInstrumentPattern(range,'trend',Infinity)!.score);
  assert.ok(measureInstrumentPattern(range,'range',Infinity)!.score > measureInstrumentPattern(trend,'range',Infinity)!.score);
  assert.ok(measureInstrumentPattern(breakout,'breakout',Infinity)!.score > measureInstrumentPattern(range,'breakout',Infinity)!.score);
  assert.match(measureInstrumentPattern(range,'breakout',Infinity)!.reasons[0], /No confirmed/);
  assert.equal(playbookPattern(DEFAULT_PLAYBOOKS[0]),'breakout');
  assert.equal(playbookPattern(DEFAULT_PLAYBOOKS[2]),'breakout');
  assert.equal(playbookPattern(DEFAULT_PLAYBOOKS[4]),'range');
  assert.equal(measureInstrumentPattern(series('trend',30),'trend',Infinity),null);
});

test('completed-bar cutoff excludes future bars and invalid data cannot receive a fit score', () => {
  const bars = series('trend');
  const cutoff = bars.t[119]+3600000;
  const before = measureInstrumentPattern(bars,'trend',cutoff);
  bars.c[120] = NaN; bars.h[125] = 9999999;
  assert.deepEqual(measureInstrumentPattern(bars,'trend',cutoff),before);
  assert.equal(measureInstrumentPattern(bars,'trend',Infinity),null);
});

test('suggestions scan any selected market, only use covered symbols, disclose proxies and preserve source records', async () => {
  const calls: string[] = [];
  const provider = { getSeries: async (symbol: string, _tf: string, _from: number, to: number) => { calls.push(symbol); assert.ok(to <= parseDay(DATA_END)+dayMs); return series('trend'); } };
  const entries = [{ strategy:book.name, symbol:'EURUSD', assetClass:'Forex', date:'2026-09-21' }] as JournalEntry[];
  const snapshot = JSON.stringify(entries);
  const result = await suggestPlaybookInstruments(forexBook(),entries,{ market:'Forex',pattern:'trend',timeframe:'1h',asOf:'2026-10-15' },provider);
  assert.ok(result.length >= 3);
  assert.ok(result.every(i => i.market === 'Forex' && i.bars === 120 && Number.isFinite(i.score) && i.score >= 0 && i.score <= 100));
  assert.equal(result.find(i => i.symbol === 'EUR/USD')!.journalCount,1);
  assert.ok(!result.some(i => i.symbol === 'AUD/USD'));
  assert.equal(JSON.stringify(entries), snapshot);
  const stocks = await suggestPlaybookInstruments(forexBook(),[],{ market:'Stocks',pattern:'trend',timeframe:'1h',asOf:'2026-10-15' },provider);
  assert.deepEqual(stocks.map(i => i.symbol), ['NVDA']);
  const indices = await suggestPlaybookInstruments({ ...forexBook(),markets:['Indices'] },[],{ market:'Indices',pattern:'trend',timeframe:'1h',asOf:'2026-10-15' },provider);
  assert.equal(indices.find(i => i.symbol === 'NAS100')!.sourceSymbol,'MNQ');
});

test('named pattern validation rejects invalid thresholds, incomplete windows and duplicate names', () => {
  const setup = { ...newInstrumentPattern('trend'), id:'custom-1', name:'My trend' };
  assert.equal(validateInstrumentPattern(setup), null);
  for (const patch of [{ name:' ' }, { lookbackBars:59 }, { lookbackBars:241 }, { lookbackBars:80.5 }, { minFit:NaN }, { minFit:101 }, { minVolumeRatio:-1 }, { minVolumeRatio:6 }, { minBreakoutAtr:Infinity }, { minBreakoutAtr:4 }]) {
    assert.ok(validateInstrumentPattern({ ...setup, ...patch }));
  }
  assert.match(validateInstrumentPattern({ ...setup,id:'other',name:' MY TREND ' }, [setup])!, /already exists/);
  assert.equal(validateInstrumentPattern(setup, [setup]), null);
  assert.equal(measureInstrumentPattern(series('trend'),'trend',Infinity,{ ...setup,lookbackBars:140 }), null);
  assert.equal(measureInstrumentPattern(series('trend'),'breakout',Infinity,setup), null);
});

test('saved pattern settings control candle windows, EMA direction, volume, breakout distance and fit', () => {
  const setup = { ...newInstrumentPattern('trend'), id:'custom-1', name:'My trend', minFit:0, lookbackBars:90 };
  const trend = series('trend');
  const before = measureInstrumentPattern(trend,'trend',Infinity,setup)!;
  assert.equal(before.bars, 90);
  assert.match(before.reasons.at(-1)!, /My trend/);
  assert.equal(measureInstrumentPattern(trend,'trend',Infinity,{ ...setup,direction:'bearish' }), null);
  assert.ok(measureInstrumentPattern(trend,'trend',Infinity,{ ...setup,direction:'bullish' }));
  assert.equal(measureInstrumentPattern(trend,'trend',Infinity,{ ...setup,minVolumeRatio:1.1 }), null);
  assert.ok(measureInstrumentPattern(trend,'trend',Infinity,{ ...setup,minVolumeRatio:1 }));
  const range = series('range');
  const fit = measureInstrumentPattern(range,'trend',Infinity,setup)!.score;
  assert.equal(measureInstrumentPattern(range,'trend',Infinity,{ ...setup,minFit:fit+1 }), null);
  const breakout = { ...setup,pattern:'breakout' as const,minBreakoutAtr:0.1 };
  assert.equal(measureInstrumentPattern(range,'breakout',Infinity,breakout), null);
  assert.ok(measureInstrumentPattern(series('breakout'),'breakout',Infinity,breakout));
  const saved = JSON.parse(JSON.stringify({ ...forexBook(),instrumentPatterns:[setup],instrumentPatternId:setup.id }));
  assert.deepEqual(measureInstrumentPattern(trend,'trend',Infinity,saved.instrumentPatterns[0]), before);
});

test('scanner applies custom rules and requests enough history for a long daily window', async () => {
  const setup = { ...newInstrumentPattern('trend'), id:'daily-trend', name:'Daily trend', direction:'bullish' as const, lookbackBars:240 };
  const provider = { getSeries: async (_symbol: string, _tf: string, from: number, to: number) => {
    assert.ok(to-from >= 365*dayMs);
    return series('trend',250);
  } };
  const options = { market:'Stocks' as const,pattern:'trend' as const,timeframe:'1D' as const,asOf:'2026-10-15',setup };
  const matches = await suggestPlaybookInstruments(forexBook(),[],options,provider);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].bars, 240);
  assert.deepEqual(await suggestPlaybookInstruments(forexBook(),[],{ ...options,setup:{ ...setup,direction:'bearish' } },provider), []);
});
