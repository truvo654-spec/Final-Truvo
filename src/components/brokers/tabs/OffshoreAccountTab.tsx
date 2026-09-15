import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerAccountTabContent } from './BrokerAccountTabContent';

interface OffshoreAccountTabProps {
  broker: Broker;
  user: UserProfile;
  isConnected?: boolean;
  onNavigateToConnect?: () => void;
  onShowToast?: (msg: string) => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const OffshoreAccountTab: React.FC<OffshoreAccountTabProps> = ({
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
      tier="offshore"
      isConnected={isConnected}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
