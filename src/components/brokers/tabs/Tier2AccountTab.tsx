import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerAccountTabContent } from './BrokerAccountTabContent';

interface Tier2AccountTabProps {
  broker: Broker;
  user: UserProfile;
  isConnected?: boolean;
  onNavigateToConnect?: () => void;
  onShowToast?: (msg: string) => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const Tier2AccountTab: React.FC<Tier2AccountTabProps> = ({
  broker,
  user,
  isConnected = false,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  return (
    <BrokerAccountTabContent
      broker={broker}
      user={user}
      tier="tier-2"
      isConnected={isConnected}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
