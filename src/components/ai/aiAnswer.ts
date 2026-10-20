import type { SpotlightData } from './AiSpotlightPanel';

/**
 * Answers a question from what MarketSyde already read on this page.
 *
 * There is no model behind the dock, and pretending otherwise would be worse
 * than saying less: everything here comes from the figures and lines the
 * feature itself produced. When nothing matches, it says so and points at the
 * openers rather than inventing an answer.
 */

/** Words that carry no meaning for matching. */
const NOISE = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'what',
  'why', 'how', 'when', 'who', 'which', 'my', 'me', 'i', 'you', 'this', 'that',
  'it', 'to', 'of', 'on', 'in', 'for', 'and', 'or', 'with', 'about', 'should',
  'can', 'tell', 'show', 'explain', 'page', 'here',
]);

function terms(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}%.]+/u)
    .filter((w) => w.length > 2 && !NOISE.has(w));
}

/** How much a candidate answers the question. */
function overlap(question: string[], candidate: string): number {
  const hay = candidate.toLowerCase();
  return question.reduce((n, w) => (hay.includes(w) ? n + 1 : n), 0);
}

export function answerFromPage(data: SpotlightData, question: string): string {
  const q = terms(question);

  if (q.length === 0) {
    return data.overview
      ? `${data.headline} ${data.overview}`
      : data.headline;
  }

  // Every line the feature wrote, plus the figures it put on the card.
  const candidates: string[] = [
    ...(data.overview ? [data.overview] : []),
    ...data.tabs.flatMap((t) => t.lines.map((l) => `${l.label}. ${l.body}`)),
    ...(data.stats ?? []).map((s) => {
      const note = data.statNotes?.[s.label];
      return `${s.label} is ${s.value}.${note ? ` ${note}` : ''}`;
    }),
  ];

  const best = candidates
    .map((text) => ({ text, score: overlap(q, text) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (best) return best.text;

  const openers = (data.suggestions ?? []).slice(0, 2).map((s) => `"${s.label}"`).join(' or ');
  const headline = /[.!?]$/.test(data.headline) ? data.headline : `${data.headline}.`;
  return openers
    ? `That is not in what I read here. What I did read: ${headline} Try ${openers}, or ask about one of the figures above.`
    : `That is not in what I read here. What I did read: ${headline}`;
}
