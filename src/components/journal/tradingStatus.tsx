import React from 'react';
import { JournalEntry, JournalReviewState, TradingStatus } from '../../types';
import { statusOf, incompleteFields } from './journalMath';

export const tradingStatusOf = (entry: JournalEntry): TradingStatus =>
  statusOf(entry);

export const TRADING_STATUS_LABEL: Record<TradingStatus, string> = {
  planned: 'Planned',
  open: 'Open',
  closed: 'Closed',
};

export const TRADING_STATUS_STYLE: Record<TradingStatus, string> = {
  planned: 'bg-violet-50 text-violet-700',
  open: 'bg-amber-50 text-amber-700',
  closed: 'bg-emerald-50 text-emerald-700',
};

export const TradingStatusBadge: React.FC<{ status: TradingStatus; className?: string }> = ({ status, className = '' }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${TRADING_STATUS_STYLE[status]} ${className}`}>
    {TRADING_STATUS_LABEL[status]}
  </span>
);

export const reviewStateOf = (entry: JournalEntry): JournalReviewState => entry.reviewState === 'needs_review' || incompleteFields(entry).length ? 'needs_review' : 'complete';

export const ReviewStateBadge: React.FC<{ state: JournalReviewState; className?: string }> = ({ state, className = '' }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${state === 'complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} ${className}`}>
    {state === 'complete' ? 'Reviewed' : 'Needs review'}
  </span>
);
