import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TradeListFilters } from '../TradeListFilters';
import { EMPTY_TRADE_FILTER, filterTradeList, journalTradeRecord, sortTradesByEntry, tradeRecordMarket } from '../tradeListFiltering';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { metrics } from '../journalMath';

test('market filters separate all five markets, including generated index and commodity symbols', () => {
  const rows = [
    { symbol: 'EUR/USD', market: 'Forex' }, { symbol: 'BTC/USDT', market: 'Crypto' },
    { symbol: 'MGC', market: 'Futures' }, { symbol: 'MNQ' }, { symbol: 'MES' },
    { symbol: 'NVDA', market: 'Stock' }, { symbol: 'CUSTOM', market: 'Commodities' }, { symbol: 'UNKNOWN' },
  ];
  const before = JSON.stringify(rows);
  const expected = { Forex: ['EUR/USD'], Crypto: ['BTC/USDT'], Commodity: ['MGC', 'CUSTOM'], Indices: ['MNQ', 'MES'], Stocks: ['NVDA'], Unassigned: ['UNKNOWN'] };
  for (const [market, symbols] of Object.entries(expected)) assert.deepEqual(filterTradeList(rows, { ...EMPTY_TRADE_FILTER, market }, r => r).map(r => r.symbol), symbols);
  const all = filterTradeList(rows, EMPTY_TRADE_FILTER, r => r);
  assert.equal(all.length, rows.length); assert.equal(all[2], rows[2]); assert.equal(JSON.stringify(rows), before);
});

test('search, market and symbol combine without excluding pending records or changing financial values', () => {
  const base = { ...JOURNAL_ENTRIES[0], symbol: 'EUR/USD', assetClass: 'Forex' as const, strategy: 'Swing', direction: 'BUY' as const, date: '2026-10-02', pnl: 100, commission: 8, pnlKnown: true, exitPrice: 110, tags: ['patient'] };
  const rows = [{ ...base, id: 'closed', tradingStatus: 'closed' as const }, { ...base, id: 'pending', tradingStatus: 'open' as const, exitPrice: null }, { ...base, id: 'other', symbol: 'GBP/USD' }];
  const before = JSON.stringify(rows);
  const matched = filterTradeList(rows, { search: 'eurusd LONG patient', market: 'Forex', symbol: 'EUR/USD' }, journalTradeRecord);
  assert.deepEqual(matched.map(r => r.id), ['closed', 'pending']);
  assert.equal(metrics(matched).n, 1); assert.equal(metrics(matched).total, 92);
  assert.deepEqual(filterTradeList(rows, { search: 'EURUSD', market: 'Crypto', symbol: 'all' }, journalTradeRecord), []);
  assert.equal(JSON.stringify(rows), before);
});

test('empty lists still offer every requested market and an optional instrument filter', () => {
  const html = renderToStaticMarkup(React.createElement(TradeListFilters, { value: EMPTY_TRADE_FILTER, onChange: () => {}, records: [], count: 0 }));
  for (const text of ['Forex', 'Crypto', 'Commodities', 'Indices', 'Stocks', 'Search trades', 'Instrument filter', 'All instruments']) assert.ok(html.includes(text), text);
  assert.ok(!html.includes('Futures'));
});

test('execution entry sorting works in both directions without mutating journal or simulated rows', () => {
  const journal = [{id:'later',entryTime:'2026-10-02T10:00:00Z',date:'2026-10-02'}, {id:'earlier',entryTime:'',date:'2026-10-01'}];
  const simulated = [{id:'later',entryAt:Date.parse('2026-10-02T10:00:00Z')}, {id:'earlier',entryAt:Date.parse('2026-10-01T10:00:00Z')}];
  for (const direction of ['asc', 'desc'] as const) {
    const expected = direction === 'asc' ? ['earlier', 'later'] : ['later', 'earlier'];
    assert.deepEqual(sortTradesByEntry(journal, row=>row.entryTime||row.date, direction).map(row=>row.id), expected);
    assert.deepEqual(sortTradesByEntry(simulated, row=>new Date(row.entryAt).toISOString(), direction).map(row=>row.id), expected);
  }
  assert.equal(journal[0].id, 'later');
  assert.equal(simulated[0].id, 'later');
});
