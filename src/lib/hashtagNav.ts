/**
 * Lets any component open a hashtag page without passing a callback through every parent.
 * App listens for this event and opens /hashtag/<tag>.
 */
export const HASHTAG_EVENT = 'marketsyde:open-hashtag';

export const cleanTag = (tag: string) => tag.replace(/^#/, '').trim();

export function openHashtag(tag: string) {
  const t = cleanTag(tag);
  if (!t || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(HASHTAG_EVENT, { detail: t }));
}
