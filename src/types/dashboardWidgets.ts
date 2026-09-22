export type WidgetType =
  | 'level-card'
  | 'saved-calculators'
  | 'most-recent-signals'
  | 'winning-signals'
  | 'tops-earning-points'
  | 'connected-brokers'
  | 'market-clock'
  | 'instrument-analysis'
  | 'mission-card'
  | 'empty';

export type WidgetSize = 1 | 2 | 3;

export interface DashboardSlot {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  title?: string;
}

export interface DashboardRow {
  id: string;
  slots: DashboardSlot[];
}

export interface WidgetOption {
  id: string;
  type: WidgetType;
  title: string;
  category: string;
  availableSizes: WidgetSize[];
  description: string;
}
