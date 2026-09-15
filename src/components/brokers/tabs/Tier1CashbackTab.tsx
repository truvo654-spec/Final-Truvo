import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerCashbackTabContent } from './BrokerCashbackTabContent';

interface Tier1CashbackTabProps {
  broker: Broker;
  user: UserProfile;
  isConnected?: boolean;
  onOpenRebateTable?: () => void;
  onOpenViewPlan?: () => void;
  onRegisterPrompt?: () => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const Tier1CashbackTab: React.FC<Tier1CashbackTabProps> = ({
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
      tier="tier-1"
      isConnected={isConnected}
      onOpenRebateTable={onOpenRebateTable}
      onOpenViewPlan={onOpenViewPlan}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
