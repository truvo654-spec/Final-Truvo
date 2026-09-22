import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerCompanyTabContent } from './BrokerCompanyTabContent';

interface Tier2CompanyTabProps {
  broker: Broker;
  user?: UserProfile;
  isConnected?: boolean;
  onNavigateToConnect?: () => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const Tier2CompanyTab: React.FC<Tier2CompanyTabProps> = ({
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
      tier="tier-2"
      isConnected={isConnected}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
