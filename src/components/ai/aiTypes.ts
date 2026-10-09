import { Broker, MarketSignal, UserProfile } from '../../types';

export type Surface = 'broker' | 'learn' | 'market' | 'insights' | 'behavior' | 'playbook' | 'rewards' | 'next';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type RangeDays = 7 | 30 | 90;

export interface AiItem {
  title: string;
  sub?: string;
  badge?: string;
  tab?: string;
  signal?: string;
  broker?: string;
}

export interface AiStat {
  label: string;
  value: string;
  tone?: 'good' | 'bad' | 'neutral';
}

export interface AiBars {
  title: string;
  rows: { label: string; value: number; display: string }[];
}

export interface AiTable {
  columns: string[];
  rows: string[][];
}

export interface AiQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source?: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  heading?: string;
  paragraphs?: string[];
  stats?: AiStat[];
  bars?: AiBars[];
  table?: AiTable;
  items?: AiItem[];
  quiz?: AiQuiz;
  sources?: string[];
  note?: string;
  followUps?: string[];
  surface?: Surface;
}

export interface BrokerPrefs {
  priority: 'cost' | 'safety' | 'cashback' | 'deposit';
  style: 'scalping' | 'swing' | 'crypto';
  platform: 'any' | 'MT4' | 'MT5' | 'cTrader';
  lots: number;
}

export interface AiMemory {
  surface?: Surface;
  term?: string;
  symbol?: string;
  assetClass?: string;
  range?: RangeDays;
  brokerIds?: string[];
  quizId?: string;
  level?: Level;
}

export interface AiContext {
  /** The signed-in profile, for level, points, credits and cashback answers. */
  user: UserProfile;
  firstName: string;
  brokers: Broker[];
  signals: MarketSignal[];
  level: Level;
  range: RangeDays;
  allowTrades: boolean;
  allowJournal: boolean;
  prefs: BrokerPrefs;
  memory: AiMemory;
}

export interface AiReply {
  msg: AiMessage;
  mem: AiMemory;
}
