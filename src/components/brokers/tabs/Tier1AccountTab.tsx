import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerAccountTabContent } from './BrokerAccountTabContent';

interface Tier1AccountTabProps {
  broker: Broker;
  user: UserProfile;
  isConnected?: boolean;
  onRegisterPrompt?: () => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const Tier1AccountTab: React.FC<Tier1AccountTabProps> = ({
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
      tier="tier-1"
      isConnected={isConnected}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
