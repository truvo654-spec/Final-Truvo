import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerCompanyTabContent } from './BrokerCompanyTabContent';

interface OffshoreCompanyTabProps {
  broker: Broker;
  user?: UserProfile;
  isConnected?: boolean;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const OffshoreCompanyTab: React.FC<OffshoreCompanyTabProps> = ({
  broker,
  user,
  isConnected = false,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  return (
    <BrokerCompanyTabContent
      broker={broker}
      user={user}
      tier="offshore"
      isConnected={isConnected}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
