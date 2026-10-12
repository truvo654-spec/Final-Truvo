import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JournalEntryWizard } from '../JournalEntryWizard';
import { StatementUploadPanel } from '../JournalIngestPanels';

test('Journal import dialog only offers account linking and statement uploads', () => {
  const html = renderToStaticMarkup(createElement(JournalEntryWizard, {
    onClose: () => {},
    onImportMany: () => {},
  }));

  assert.match(html, /Import or link trades/);
  assert.match(html, />Link account<\/button>/);
  assert.match(html, />Upload Statement<\/button>/);
  assert.doesNotMatch(html, /Import from Portfolio|Enter manually|Manual account identity|Save entry/);
});

test('Statement importer omits the quantity-unit override', () => {
  const html = renderToStaticMarkup(createElement(StatementUploadPanel, {
    existing: [],
    strategy: 'Unassigned',
    onImport: () => {},
  }));

  assert.doesNotMatch(html, /Import quantity unit|lots, shares, contracts/);
});
