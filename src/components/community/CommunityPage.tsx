import React from 'react';
import { UserProfile } from '../../types';
import { CommunityRedesign } from './redesign/CommunityRedesign';

interface CommunityPageProps {
  user: UserProfile;
  onUpdateUserProfile?: (updatedUser: Partial<UserProfile>) => void;
  onRewardPoints?: (points: number, reason: string) => void;
  onRewardPointsAndCredits?: (points: number, credits: number, reason: string) => void;
  onNavigateToTab?: (tab: string, subTab?: string, symbol?: string) => void;
  initialInstrumentSymbol?: string | null;
  onOpenConnectModal?: () => void;
  onOpenAdvancedChart?: (symbol: string) => void;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

/**
 * Community now follows the MarketSyde design system: Feed, Article and My Page.
 * The previous Topics, Media and creator-profile views are still in this folder but are no longer routed.
 */
export const CommunityPage: React.FC<CommunityPageProps> = ({ user, onNavigateToTab, onRewardPointsAndCredits, isLoggedIn, onOpenAuth }) => (
  <CommunityRedesign user={user} isLoggedIn={isLoggedIn} onNavigateToTab={onNavigateToTab} onRewardPointsAndCredits={onRewardPointsAndCredits} onOpenAuth={onOpenAuth} />
);
