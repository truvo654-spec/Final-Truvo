import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JournalEntryWizard } from '../JournalEntryWizard';
import { StatementUploadPanel } from '../JournalIngestPanels';
import { ConnectBrokerModal } from '../../ConnectBrokerModal';

test('Journal import dialog opens on statement upload and keeps account status secondary', () => {
  const html = renderToStaticMarkup(createElement(JournalEntryWizard, {
    onClose: () => {},
    onImportMany: () => {},
  }));

  assert.match(html, /Import or link trades/);
  assert.match(html, />Link account<\/button>/);
  assert.match(html, />Upload Statement<\/button>/);
  assert.match(html, /Drag &amp; drop a statement CSV/);
  assert.doesNotMatch(html, /Import from Portfolio|Enter manually|Manual account identity|Save entry/);
});

test('broker link notice never reports a simulated connection or asks for credentials', () => {
  const html=renderToStaticMarkup(createElement(ConnectBrokerModal,{isOpen:true,onClose:()=>{},selectedBroker:null}));
  assert.match(html,/Live broker sync isn’t available/);
  assert.match(html,/cannot verify an account, fetch trades, or sync new activity/);
  assert.doesNotMatch(html,/password|Verify &amp; Link|Connected Successfully/);
});

test('Statement importer omits the quantity-unit override', () => {
  const html = renderToStaticMarkup(createElement(StatementUploadPanel, {
    existing: [],
    strategy: 'Unassigned',
    onImport: () => {},
  }));

  assert.doesNotMatch(html, /Import quantity unit|lots, shares, contracts/);
});
