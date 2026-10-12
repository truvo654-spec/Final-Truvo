import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JournalEntryWizard } from '../JournalEntryWizard';

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
