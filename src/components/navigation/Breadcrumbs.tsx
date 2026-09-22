import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { getRouteMeta } from '../../router';

interface BreadcrumbsProps {
  activeTab: string;
  onNavigateToTab: (tab: string) => void;
  customLabel?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = () => {
  // Breadcrumb removed for every page per user request
  return null;
};

