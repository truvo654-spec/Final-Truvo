import React from 'react';
import { LockStateContainer, type LockStateContainerProps } from '../common/LockStateContainer';

export type LockedFeatureOverlayProps = LockStateContainerProps;

/**
 * Kept as the name the panels already call, so each one picks up the shared
 * lock state without having to be touched.
 */
export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = (props) => (
  <LockStateContainer {...props} />
);
