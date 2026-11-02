import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
import {PlaybookTradeHistory,playbookTradeHistory} from '../PlaybookTradeHistory';
const book=DEFAULT_PLAYBOOKS[0];
const closed={...JOURNAL_ENTRIES[0],id:'closed',strategy:book.name,direction:'BUY' as const,tradingStatus:'closed' as const,date:'2026-10-01',entryTime:'2026-10-01T09:00:00Z',exitPrice:110,pnl:100,commission:0,pnlKnown:true,accountCurrency:'USD'};
test('Playbook history preserves recorded open and unknown-cost trades and historical instruments',()=>{
 const entries=[closed,{...closed,id:'open',direction:'SELL' as const,symbol:'OLD-SYMBOL',tradingStatus:'open' as const,date:'2026-10-02',entryTime:'2026-10-02T09:00:00Z',exitPrice:null},{...closed,id:'unknown',commission:null,date:'2026-10-03',entryTime:'2026-10-03T09:00:00Z'},{...closed,id:'other',strategy:'Other'}];
 const before=JSON.stringify(entries),rows=playbookTradeHistory(entries,book,['long','short']);
 assert.deepEqual(rows.map(e=>e.id),['unknown','open','closed']);
 assert.deepEqual(playbookTradeHistory(entries,book,['short']).map(e=>e.id),['open']);
 assert.deepEqual(playbookTradeHistory(entries,book,[]),[]);
 const html=renderToStaticMarkup(React.createElement(PlaybookTradeHistory,{entries:rows,onTrade:()=>{},onReplay:()=>{}}));
 assert.match(html,/OLD-SYMBOL/);assert.match(html,/Pending \/ incomplete/);assert.match(html,/1 closed net result/);assert.match(html,/Replay/);
 assert.equal(JSON.stringify(entries),before);
});
