import React from 'react';
import { ErrorPageView, ErrorType } from './ErrorPageView';

export { ErrorPageView };
export type { ErrorType };

export const Error404Page: React.FC<{
  onNavigateHome: () => void;
  onNavigateToTab?: (tab: string) => void;
  onRefresh?: () => void;
}> = (props) => <ErrorPageView type="404" {...props} />;

export const Error500Page: React.FC<{
  onNavigateHome: () => void;
  onNavigateToTab?: (tab: string) => void;
  onRefresh?: () => void;
}> = (props) => <ErrorPageView type="500" {...props} />;

export const Error503Page: React.FC<{
  onNavigateHome: () => void;
  onNavigateToTab?: (tab: string) => void;
  onRefresh?: () => void;
}> = (props) => <ErrorPageView type="503" {...props} />;
