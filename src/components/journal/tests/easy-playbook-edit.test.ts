import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { EasyPlaybookEdit, easySetupChanges, easySetupDraft, easySetupErrors } from '../EasyPlaybookEdit';

const book = DEFAULT_PLAYBOOKS[0];
const errors = (draft: ReturnType<typeof easySetupDraft>, entries = [], books = [book], source = book) =>
  easySetupErrors(source, draft, entries, books);

test('unchanged legacy setup and transient instrument additions do not alter missing fields', () => {
  const legacy = { ...book, symbols: undefined, instrumentMarkets: undefined, window: null };
  const draft = easySetupDraft(legacy);
  assert.deepEqual(easySetupChanges(legacy, draft), {});
  draft.instrumentMarkets = {};
  assert.deepEqual(easySetupChanges(legacy, draft), {});
  assert.deepEqual(errors(draft, [], [legacy], legacy), []);
});

test('editing saves only changed fields without replacing unrelated playbook data', () => {
  const draft = easySetupDraft(book);
  draft.style = 'New style';
  draft.status = 'testing';
  draft.thesis = 'New thesis';
  draft.rr = '3';
  draft.rules[0].title = 'New rule';
  draft.rules = [...draft.rules.slice(0, -1), { id: 'r6', title: 'Added', detail: 'Details' }];
  const patch = easySetupChanges(book, draft);
  assert.deepEqual(Object.keys(patch).sort(), ['benchmarkRR', 'rules', 'status', 'style', 'thesis']);
  const updated = { ...book, ...patch };
  for (const key of ['grade', 'scenarios', 'technicalRecipeId', 'instrumentPatterns', 'reviews', 'riskPerTrade', 'entryTrigger', 'stopRule', 'targetRule', 'tags'] as const) {
    assert.deepEqual(updated[key], book[key]);
  }
  assert.equal(book.rules[0].title, 'Defined range');
  assert.deepEqual(errors(draft), []);
});

test('trade-linked names are locked and duplicate new names are rejected', () => {
  const draft = easySetupDraft(book);
  const entry = { ...JOURNAL_ENTRIES[0], strategy: book.name };
  draft.name = 'Another name';
  assert.match(errors(draft, [entry]).join(' '), /name cannot change/);
  draft.name = ` ${DEFAULT_PLAYBOOKS[1].name.toLowerCase()} `;
  assert.match(errors(draft, [], DEFAULT_PLAYBOOKS).join(' '), /already exists/);
  draft.name = ' ';
  assert.match(errors(draft).join(' '), /Enter a strategy name/);
  draft.name = book.name;
  assert.deepEqual(errors(draft, [], [book, { ...book, id: 'duplicate' }]), []);
});

test('validates changed risk, session and rule values', () => {
  const draft = easySetupDraft(book);
  draft.rr = '0';
  draft.window = { start: 17, end: 9, label: '' };
  draft.rules.push({ id: 'new', title: ' ', detail: '' });
  const messages = errors(draft).join(' ');
  assert.match(messages, /reward:risk/);
  assert.match(messages, /session/);
  assert.match(messages, /title for each rule/);
  draft.rr = '2.5';
  draft.window = null;
  draft.rules.pop();
  assert.deepEqual(errors(draft), []);
});

test('retains custom instruments and rejects market changes that misclassify them', () => {
  const legacy = { ...book, symbols: ['CUSTOM', 'NAS100'], instrumentMarkets: { CUSTOM: 'Forex' as const } };
  const draft = easySetupDraft(legacy);
  draft.thesis = 'Changed';
  assert.deepEqual(easySetupChanges(legacy, draft), { thesis: 'Changed' });
  draft.markets = ['Indices'];
  assert.match(errors(draft, [], [legacy], legacy).join(' '), /CUSTOM belongs to a market/);
  draft.symbols = ['NAS100'];
  draft.instrumentMarkets = {};
  assert.deepEqual(errors(draft, [], [legacy], legacy), []);
  const unclassified = { ...legacy, instrumentMarkets: undefined };
  const unknown = easySetupDraft(unclassified);
  unknown.markets = ['Indices'];
  assert.match(errors(unknown, [], [unclassified], unclassified).join(' '), /market for CUSTOM is unknown/);
  unknown.instrumentMarkets = { CUSTOM: 'Indices' };
  assert.deepEqual(errors(unknown, [], [unclassified], unclassified), []);
});

test('editor renders an accessible dialog and locks linked names', () => {
  const entry = { ...JOURNAL_ENTRIES[0], strategy: book.name };
  const html = renderToStaticMarkup(React.createElement(EasyPlaybookEdit, {
    book, entries: [entry], playbooks: [book], onClose: () => {}, onSave: () => {},
  })).replace(/<!-- -->/g, '');
  assert.match(html, /role="dialog" aria-modal="true" aria-label="Edit playbook setup"/);
  assert.match(html, /Strategy name<input[^>]*disabled=""/);
  assert.match(html, /Name locked: 1 journal trade/);
  assert.match(html, /Save changes/);
  assert.match(html, /Custom symbol/);
});
