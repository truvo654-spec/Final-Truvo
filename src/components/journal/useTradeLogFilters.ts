import { useJournalState } from './journalStorage';

export function useTradeLogFilters() {
  const [query, setQuery] = useJournalState('JournalTradeLog-query', '');
  const [needsReview, setNeedsReview] = useJournalState('JournalTradeLog-needsReview', false);
  const [fOutcome, setFOutcome] = useJournalState('JournalTradeLog-fOutcome', 'all');
  const [fTradingStatus, setFTradingStatus] = useJournalState<'all' | 'planned' | 'open' | 'closed'>('JournalTradeLog-fTradingStatus', 'all');
  const [marketOff, setMarketOff] = useJournalState<string[]>('JournalTradeLog-marketOff', []);
  const [brokerOff, setBrokerOff] = useJournalState<string[]>('JournalTradeLog-brokerOff', []);
  return { query, setQuery, needsReview, setNeedsReview, fOutcome, setFOutcome, fTradingStatus, setFTradingStatus, marketOff, setMarketOff, brokerOff, setBrokerOff };
}
export type TradeLogFilterController = ReturnType<typeof useTradeLogFilters>;
