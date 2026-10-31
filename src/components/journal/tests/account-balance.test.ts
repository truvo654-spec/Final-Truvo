import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PORTFOLIO_ACCOUNTS } from '../../../data/portfolioData';
import { BALANCE_DEMO_FROM, BALANCE_DEMO_TO, demoAccountBalanceSeries, generateDemoBrokerBalance, SAMPLE_BALANCE_BROKERS, type BalanceBroker } from '../accountBalance';
import { JournalAccountBalance } from '../JournalAccountBalance';

const hfm: BalanceBroker = { id: 'hfm', name: 'HFM', connected: true };
const exness: BalanceBroker = { id: 'exness', name: 'Exness', connected: true };
const xm: BalanceBroker = { id: 'xm', name: 'XM', connected: false };
const range = { from: '2026-10-01', to: '2026-10-31' };
const round = (value: number) => Math.round(value * 100) / 100;

test('generated broker demo histories are stable and reconcile balance, results and funding exactly', () => {
  const original = JSON.stringify(PORTFOLIO_ACCOUNTS);
  const account = generateDemoBrokerBalance(hfm);
  assert.deepEqual(account, generateDemoBrokerBalance(hfm));
  assert.equal(account.points[0].date, BALANCE_DEMO_FROM);
  assert.equal(account.points.at(-1)?.date, BALANCE_DEMO_TO);
  const net = round(account.points.reduce((sum, point) => sum + point.net, 0));
  const funding = round(account.movements.reduce((sum, movement) => sum + (movement.kind === 'deposit' ? movement.amount : -movement.amount), 0));
  assert.equal(account.points.at(-1)?.balance, round(account.initialBalance + net + funding));
  assert.equal(account.points.at(-1)?.funding, funding);
  assert.equal(JSON.stringify(PORTFOLIO_ACCOUNTS), original);
  assert.ok(account.movements.some(movement => movement.kind === 'withdrawal'));
  assert.ok(account.movements.some(movement => movement.kind === 'deposit'));
});

test('combined demo balance and funding sum connected accounts once per broker', () => {
  const data = demoAccountBalanceSeries([hfm, exness, xm, hfm], 'all', 'USD', null);
  const one = generateDemoBrokerBalance(hfm).points;
  const two = generateDemoBrokerBalance(exness).points;
  assert.equal(data.selectedBrokerCount, 2);
  assert.equal(data.demoAccountCount, 2);
  assert.equal(data.points.length, one.length);
  data.points.forEach((point, index) => {
    assert.equal(point.balance, round(one[index].balance + two[index].balance));
    assert.equal(point.funding, round(one[index].funding + two[index].funding));
    assert.equal(point.net, round(one[index].net + two[index].net));
  });
});

test('broker filtering isolates the generated account and does not include disconnected brokers', () => {
  const expected = generateDemoBrokerBalance(hfm).points.at(-1)?.balance;
  assert.equal(demoAccountBalanceSeries([hfm, exness], 'hfm', 'USD', range).closingBalance, expected);
  const disconnected = demoAccountBalanceSeries([hfm, xm], 'xm', 'USD', range);
  assert.equal(disconnected.selectedBrokerCount, 0);
  assert.deepEqual(disconnected.points, []);
  assert.equal(disconnected.closingBalance, null);
  const newConnection = demoAccountBalanceSeries([{ ...xm, connected: true }], 'all', 'USD', range);
  assert.equal(newConnection.demoAccountCount, 1);
  assert.ok(newConnection.points.every(point => Number.isFinite(point.balance)));
});

test('multi-broker sample comparison works without changing real connections', () => {
  const brokers = [exness, xm];
  const before = JSON.stringify(brokers);
  const data = demoAccountBalanceSeries(brokers, 'all', 'USD', range, 'sample');
  assert.equal(data.demoAccountCount, SAMPLE_BALANCE_BROKERS.length);
  assert.equal(data.accounts.length, 4);
  assert.equal(JSON.stringify(brokers), before);
  assert.equal(data.closingBalance, round(data.accounts.reduce((total, account) => total + account.points.at(-1)!.balance, 0)));
  const sampleBroker = demoAccountBalanceSeries(brokers, 'pepperstone', 'USD', range, 'sample');
  assert.equal(sampleBroker.demoAccountCount, 1);
  assert.equal(sampleBroker.accounts[0].broker.name, 'Pepperstone');
});

test('withdrawals reduce cumulative funding and October filters include deposits and withdrawals', () => {
  const data = demoAccountBalanceSeries([hfm], 'all', 'USD', range);
  assert.deepEqual(data.movements.map(movement => movement.kind), ['deposit', 'withdrawal']);
  assert.equal(data.points.find(point => point.date === '2026-10-23')!.funding, round(data.points.find(point => point.date === '2026-10-22')!.funding - data.movements[1].amount));
  assert.equal(data.points[0].date, range.from);
  assert.equal(data.points.at(-1)?.date, range.to);
  assert.deepEqual(demoAccountBalanceSeries([hfm], 'all', 'USD', { from: '2026-11-01', to: '2026-11-30' }).points, []);
  assert.throws(() => demoAccountBalanceSeries([hfm], 'all', 'USD', { from: '2026-10-05', to: '2026-10-01' }), /date range/);
});

test('unsupported currencies remain unavailable with no guessed currency conversion', () => {
  const euro = demoAccountBalanceSeries([hfm], 'all', 'EUR', range);
  assert.equal(euro.unsupportedCurrency, true);
  assert.equal(euro.closingBalance, null);
  assert.deepEqual(euro.points, []);
  assert.equal(demoAccountBalanceSeries([], 'all', 'USD', range).closingBalance, null);
});

test('compact widget labels generated data and has sample/broker controls but no setup button', () => {
  const html = renderToStaticMarkup(createElement(JournalAccountBalance, { brokers: [hfm, exness, xm], currency: 'USD', range }));
  assert.match(html, /aria-label="Balance chart broker"/);
  assert.match(html, /All connected brokers/);
  assert.match(html, /<option value="hfm">HFM<\/option>/);
  assert.match(html, /<option value="exness">Exness<\/option>/);
  assert.doesNotMatch(html, /<option value="xm">/);
  assert.match(html, /not live or journal/);
  assert.match(html, />Demo</);
  assert.match(html, /Multi-broker demo/);
  assert.match(html, /Demo through 2026-10-31/);
  assert.match(html, /Demo deposits and withdrawals series/);
  assert.match(html, /stroke="#f45b69"/);
  assert.match(html, /w-full h-40/);
  assert.doesNotMatch(html, /Set up|Edit balance setup|Balance chart account|<form/);
  assert.doesNotMatch(html, /NaN|Infinity/);
});

test('widget reports empty connections and currency limits without disabling the sample preview', () => {
  const render = (brokers: BalanceBroker[], currency = 'USD') => renderToStaticMarkup(createElement(JournalAccountBalance, { brokers, currency, range }));
  assert.match(render([]), /No connected brokers/);
  assert.match(render([]), /Multi-broker demo/);
  assert.match(render([hfm], 'EUR'), /available in USD only/);
});
