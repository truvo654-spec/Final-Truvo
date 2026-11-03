import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PlaybookAnalytics} from '../PlaybookAnalytics';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
import {eligible} from '../journalMath';

test('Playbook analytics omits the Scenario management panel',()=>{
 const playbook={...DEFAULT_PLAYBOOKS[0],scenarios:[...(DEFAULT_PLAYBOOKS[0].scenarios??[])]};
 const html=renderToStaticMarkup(createElement(PlaybookAnalytics,{playbook,playbooks:DEFAULT_PLAYBOOKS,entries:JOURNAL_ENTRIES,onShowTrades:()=>{},hasConnectedBroker:false,onConnectBroker:()=>{},onStartTrade:()=>{}}));
 assert.doesNotMatch(html,/Scenario management|Trigger rate:|Avg planned R:R:|Trades from scenarios:/);
 assert.match(html,/Win rate/);
 assert.match(html,/Results in R vs target/);
});

test('Empty Strategy Book analytics offers broker connection or trading based on connection status',()=>{
 const playbook=DEFAULT_PLAYBOOKS[0];
 const render=(hasConnectedBroker:boolean)=>renderToStaticMarkup(createElement(PlaybookAnalytics,{
 playbook,
 playbooks:DEFAULT_PLAYBOOKS,
 entries:[],
 onShowTrades:()=>{},
 hasConnectedBroker,
 onConnectBroker:()=>{},
 onStartTrade:()=>{},
 }));
 const disconnected=render(false),connected=render(true);
 assert.match(disconnected,/No completed journal data for this strategy book yet/);
 assert.match(disconnected,/Connect a broker/);
 assert.doesNotMatch(disconnected,/Start a trade/);
 assert.match(connected,/Start a trade/);
 assert.match(connected,/Signal Terminal/);
 assert.doesNotMatch(connected,/Connect a broker/);
});

test('Empty CTA stays hidden when this strategy book has recorded journal trades',()=>{
 const playbook=DEFAULT_PLAYBOOKS[0];
 const entry={...JOURNAL_ENTRIES.find(item=>eligible(item))!,strategy:playbook.name};
 const html=renderToStaticMarkup(createElement(PlaybookAnalytics,{
 playbook,
 playbooks:DEFAULT_PLAYBOOKS,
 entries:[entry],
 onShowTrades:()=>{},
 hasConnectedBroker:false,
 onConnectBroker:()=>{},
 onStartTrade:()=>{},
 }));
 assert.doesNotMatch(html,/No completed journal data for this strategy book yet|Connect a broker|Start a trade/);
});
