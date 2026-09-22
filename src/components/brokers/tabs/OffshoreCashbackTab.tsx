import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerCashbackTabContent } from './BrokerCashbackTabContent';

interface OffshoreCashbackTabProps {
  broker: Broker;
  user: UserProfile;
  isConnected?: boolean;
  onOpenRebateTable?: () => void;
  onNavigateToConnect?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenViewPlan?: () => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const OffshoreCashbackTab: React.FC<OffshoreCashbackTabProps> = ({
  broker,
  user,
  isConnected = false,
  onOpenRebateTable,
  onOpenViewPlan,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  return (
    <BrokerCashbackTabContent
      broker={broker}
      user={user}
      tier="offshore"
      isConnected={isConnected}
      onOpenRebateTable={onOpenRebateTable}
      onOpenViewPlan={onOpenViewPlan}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
