import test from 'node:test';
import assert from 'node:assert/strict';
import { brokerSupportsPlaybookMarkets } from '../playbookBrokerCompatibility';
import type { PortfolioAssetClass } from '../../../types';

const book = (markets: PortfolioAssetClass[]) => ({ markets });

test('Forex and raw-spread brokers only qualify for Forex strategy books', () => {
  for (const category of ['Forex', 'Raw Spread'] as const) {
    assert.equal(brokerSupportsPlaybookMarkets({ category }, book(['Forex'])), true);
    assert.equal(brokerSupportsPlaybookMarkets({ category }, book(['Forex', 'Indices'])), false);
  }
});

test('Multi-asset brokers qualify across markets while crypto brokers qualify only for Crypto', () => {
  assert.equal(brokerSupportsPlaybookMarkets({ category: 'Multi-Asset' }, book(['Forex', 'Indices', 'Commodity', 'Crypto', 'Stocks'])), true);
  assert.equal(brokerSupportsPlaybookMarkets({ category: 'Crypto' }, book(['Crypto'])), true);
  assert.equal(brokerSupportsPlaybookMarkets({ category: 'Crypto' }, book(['Crypto', 'Forex'])), false);
});
