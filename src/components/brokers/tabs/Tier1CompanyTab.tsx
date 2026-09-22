import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { BrokerCompanyTabContent } from './BrokerCompanyTabContent';

interface Tier1CompanyTabProps {
  broker: Broker;
  user?: UserProfile;
  isConnected?: boolean;
  onRegisterPrompt?: () => void;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const Tier1CompanyTab: React.FC<Tier1CompanyTabProps> = ({
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
      tier="tier-1"
      isConnected={isConnected}
      onSeeComparison={onSeeComparison}
      onExploreAllBrokers={onExploreAllBrokers}
    />
  );
};
