import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerCashbackTabContent } from './BrokerCashbackTabContent';

interface Tier2CashbackTabProps {
  broker: Broker;
  user: UserProfile;
  isConnected?: boolean;
  onOpenRebateTable?: () => void;
  onNavigateToConnect?: () => void;
  onOpenViewPlan?: () => void;
  onShowToast?: (msg: string) => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const Tier2CashbackTab: React.FC<Tier2CashbackTabProps> = ({
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
      tier="tier-2"
      isConnected={isConnected}
      onOpenRebateTable={onOpenRebateTable}
      onOpenViewPlan={onOpenViewPlan}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
