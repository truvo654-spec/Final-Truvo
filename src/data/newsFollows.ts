import { useSyncExternalStore } from 'react';
import { NewsArticle } from '../types';
import { NEWS_INCOMING, findNewsById } from './newsIncoming';

/**
 * Writers a member follows on Market News, and the "Market News" notifications.
 * Kept in localStorage so it survives a refresh.
 *
 * There is no live newsroom feed in this preview. When notifications are turned on for a writer,
 * a sample story from that writer is published after a short delay so the flow can be seen.
 */
export interface WriterFollow {
  writer: string;
  notify: boolean;
  since: string;
}

export interface NewsAlert {
  /** Article id. One alert per article. */
  id: string;
  writer: string;
  headline: string;
  excerpt: string;
  date: string;
  time: string;
  isRead: boolean;
}

interface State {
  follows: WriterFollow[];
  alerts: NewsAlert[];
  /** Ids of sample stories already published to the feed. */
  released: string[];
}

const KEY = 'marketsyde_news_follows';
const RELEASE_DELAY_MS = 12000;

function load(): State {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) return { follows: [], alerts: [], released: [], ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    /* fall through */
  }
  return { follows: [], alerts: [], released: [] };
}

let state: State = load();
const listeners = new Set<() => void>();
const releaseListeners = new Set<(a: NewsAlert) => void>();
const timers = new Map<string, number>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage can be blocked; the in-memory state still works */
  }
  listeners.forEach((l) => l());
}

const stamp = () => {
  const d = new Date();
  return { date: '05/10/26', time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` };
};

function nextUnreleased(writer: string): NewsArticle | undefined {
  return NEWS_INCOMING.find((x) => x.source === writer && !state.released.includes(x.id));
}

function schedule(writer: string) {
  if (timers.has(writer) || !nextUnreleased(writer)) return;
  const id = window.setTimeout(() => {
    timers.delete(writer);
    const follow = state.follows.find((f) => f.writer === writer);
    const article = nextUnreleased(writer);
    if (!follow || !follow.notify || !article) return; // turned off or unfollowed while waiting
    const alert: NewsAlert = { id: article.id, writer, headline: article.headline, excerpt: article.excerpt, ...stamp(), isRead: false };
    commit({ ...state, released: [article.id, ...state.released], alerts: [alert, ...state.alerts] });
    releaseListeners.forEach((l) => l(alert));
  }, RELEASE_DELAY_MS);
  timers.set(writer, id);
}

function cancel(writer: string) {
  const t = timers.get(writer);
  if (t !== undefined) {
    window.clearTimeout(t);
    timers.delete(writer);
  }
}

export const newsFollows = {
  get: () => state,
  isFollowing: (writer: string) => state.follows.some((f) => f.writer === writer),
  notifyOn: (writer: string) => !!state.follows.find((f) => f.writer === writer)?.notify,
  /** Follow a writer, or update the notify choice if already following. */
  follow: (writer: string, notify: boolean) => {
    const exists = state.follows.some((f) => f.writer === writer);
    const follows = exists
      ? state.follows.map((f) => (f.writer === writer ? { ...f, notify } : f))
      : [{ writer, notify, since: new Date().toISOString() }, ...state.follows];
    commit({ ...state, follows });
    if (notify) schedule(writer);
    else cancel(writer);
  },
  setNotify: (writer: string, notify: boolean) => newsFollows.follow(writer, notify),
  unfollow: (writer: string) => {
    cancel(writer);
    commit({ ...state, follows: state.follows.filter((f) => f.writer !== writer) });
  },
  markRead: (id: string) => commit({ ...state, alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)) }),
  markAllRead: () => commit({ ...state, alerts: state.alerts.map((a) => ({ ...a, isRead: true })) }),
  /** Called when a sample story is published for a followed writer with notifications on. */
  onRelease: (cb: (a: NewsAlert) => void) => {
    releaseListeners.add(cb);
    return () => {
      releaseListeners.delete(cb);
    };
  },
  reset: () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers.clear();
    commit({ follows: [], alerts: [], released: [] });
  },
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const useNewsFollowState = (): State => useSyncExternalStore(subscribe, () => state);

/** Sample stories that have been published, newest first. They sit on top of the Market News list. */
export function releasedArticles(s: State): NewsArticle[] {
  return s.released.map((id) => findNewsById(id)).filter(Boolean) as NewsArticle[];
}
