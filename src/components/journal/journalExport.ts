import type { Broker, JournalEntry } from '../../types';
import { currencyOf, statusOf, eligible, netOf, realizedR } from './journalMath';
import { entryCashback, entryPoints } from './journalOverview';
import { reviewStateOf } from './tradingStatus';

export function journalCsv(entries:JournalEntry[],brokers:Map<string,Broker>=new Map()) {
  const headers=['Date','Instrument','Side','Size','Entry','Exit','GrossPnL','Commissions','TradingStatus','TicketID','AccountID','AccountCurrency','QuantityUnit','AssetClass','ExitTime','StopPrice','TakeProfit','InitialRisk','Playbook','Tags','Mistakes','JournalNotes','JournalExportVersion','NetPnL','RealizedR','Broker','Cashback (est. USD)','Points (est.)','JournalID','ReviewState','NetEligible'];
  const escape=(value:string|number) => `"${(typeof value==='string' && /^[=+@-]/.test(value) ? `'${value}` : String(value)).replace(/"/g,'""')}"`;
  return [headers.map(escape).join(','), ...entries.map(e=>[
    e.entryTime || e.date,e.symbol,e.direction,e.size,e.entryPrice,e.exitPrice ?? '',e.pnlKnown===false?'':e.pnl,e.commission ?? '',
    statusOf(e),e.ticketId || '',e.accountId || 'legacy-demo',currencyOf(e),e.quantityUnit || 'unknown',e.assetClass,e.exitTime || '',
    e.stopPrice ?? '',e.takeProfit ?? '',e.initialRisk ?? '',e.strategy,e.tags.join('|'),e.mistakes.join('|'),e.setupNotes,1,
    eligible(e)?netOf(e):'',realizedR(e) ?? '',brokers.get(e.brokerId || '')?.name || e.brokerId || 'Unassigned',
    entryCashback(e,brokers),entryPoints(e),e.id,reviewStateOf(e),eligible(e)?'yes':'no',
  ].map(escape).join(','))].join('\n');
}
