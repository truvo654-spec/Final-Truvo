import React, { useMemo, useState } from 'react';
import { track } from '../../../data/analytics';
import { Check, Minus, Star, ThumbsUp, X } from 'lucide-react';
import { awardCredits, readLedger, writeLedger } from '../../../data/rewardsLedger';

/**
 * What members say about a broker.
 *
 * Two rules shape this. A review is only worth reading if it cannot be bought
 * or deleted by the company it is about, so reviews are never editable here
 * and the page says so plainly. And a review has to be written by someone who
 * is signed in, both so it can be attributed and so the Credits it earns can
 * go to a real account; anyone else is asked to sign in rather than shown a
 * form that will fail.
 */

export interface BrokerReview {
  id: string;
  rating: number;
  title: string;
  /** Said once, kept short: "Trading for 2 years", "Former client". */
  role: string;
  relationship: string;
  location?: string;
  recommend: boolean | null;
  trustworthy: boolean | null;
  wouldFundAgain: boolean | null;
  pros: string;
  cons: string;
  postedOn: string;
  helpful: number;
  isNew?: boolean;
  /** Scores for the things traders actually compare brokers on. */
  categories?: Partial<Record<ReviewCategory, number>>;
}

/** The six things a broker is judged on, in the order they are shown. */
export const REVIEW_CATEGORIES = [
  'Execution',
  'Spreads and fees',
  'Withdrawals',
  'Platform',
  'Support',
  'Transparency',
] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];

/** How many reviews a guest may read before being asked to write one. */
export const FREE_REVIEWS = 3;

/** What writing one pays, from the workbook's social quests. */
export const REVIEW_CREDITS = 20;

const STORE_KEY = (brokerId: string) => `marketsyde_reviews_${brokerId}`;

function readReviews(brokerId: string, seed: BrokerReview[]): BrokerReview[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY(brokerId));
    return raw ? [...(JSON.parse(raw) as BrokerReview[]), ...seed] : seed;
  } catch {
    return seed;
  }
}

/** A row of stars at any size, used here and on the broker list. */
export const ReviewStars: React.FC<{ value: number; size?: number }> = ({ value, size = 16 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        style={{ width: size, height: size }}
        className={n <= Math.round(value) ? 'fill-[#5945F1] text-[#5945F1]' : 'text-[#CCC6FB]'}
        aria-hidden
      />
    ))}
  </span>
);

function writeReview(brokerId: string, review: BrokerReview) {
  try {
    const raw = window.localStorage.getItem(STORE_KEY(brokerId));
    const mine = raw ? (JSON.parse(raw) as BrokerReview[]) : [];
    window.localStorage.setItem(STORE_KEY(brokerId), JSON.stringify([review, ...mine]));
  } catch { /* storage can be blocked */ }
}

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 16 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        style={{ width: size, height: size }}
        className={n <= Math.round(value) ? 'fill-[#5945F1] text-[#5945F1]' : 'text-[#CCC6FB]'}
        aria-hidden
      />
    ))}
  </span>
);

const Verdict: React.FC<{ label: string; value: boolean | null }> = ({ label, value }) => (
  <span className="inline-flex items-center gap-1.5 text-[13px] text-[#0b1c30]">
    {value === true && <Check className="h-4 w-4 text-[#16a34a]" aria-hidden />}
    {value === false && <X className="h-4 w-4 text-[#dc2626]" aria-hidden />}
    {value === null && <Minus className="h-4 w-4 text-[#94a3b8]" aria-hidden />}
    {label}
  </span>
);

export const BrokerReviewsTabContent: React.FC<{
  brokerId: string;
  brokerName: string;
  isLoggedIn: boolean;
  /** Opens the sign-in or sign-up dialog the rest of the app uses. */
  onRequireLogin: () => void;
  onShowToast?: (message: string) => void;
  seedReviews?: BrokerReview[];
}> = ({ brokerId, brokerName, isLoggedIn, onRequireLogin, onShowToast, seedReviews = [] }) => {
  const [reviews, setReviews] = useState(() => readReviews(brokerId, seedReviews));
  const [writing, setWriting] = useState(false);
  const [sort, setSort] = useState<'relevant' | 'newest' | 'highest' | 'lowest'>('relevant');

  const [draft, setDraft] = useState({
    rating: 0,
    title: '',
    role: '',
    relationship: 'Current client',
    pros: '',
    cons: '',
    categories: {} as Partial<Record<ReviewCategory, number>>,
    recommend: null as boolean | null,
    trustworthy: null as boolean | null,
    wouldFundAgain: null as boolean | null,
  });

  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const yes = reviews.filter((r) => r.recommend === true).length;
    const counted = reviews.filter((r) => r.recommend !== null).length;
    const spread = [5, 4, 3, 2, 1].map((n) => ({
      stars: n,
      count: reviews.filter((r) => Math.round(r.rating) === n).length,
    }));
    const categories = REVIEW_CATEGORIES.map((name) => {
      const scored = reviews.map((r) => r.categories?.[name]).filter((n): n is number => typeof n === 'number');
      return { name, value: scored.length ? scored.reduce((a, n) => a + n, 0) / scored.length : null };
    }).filter((c) => c.value !== null) as { name: ReviewCategory; value: number }[];

    return {
      average: total / reviews.length,
      count: reviews.length,
      categories,
      recommend: counted ? Math.round((yes / counted) * 100) : null,
      spread,
    };
  }, [reviews]);

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sort === 'newest') return list.sort((a, b) => b.postedOn.localeCompare(a.postedOn));
    if (sort === 'highest') return list.sort((a, b) => b.rating - a.rating);
    if (sort === 'lowest') return list.sort((a, b) => a.rating - b.rating);
    return list.sort((a, b) => b.helpful - a.helpful);
  }, [reviews, sort]);

  const start = () => {
    if (!isLoggedIn) {
      track('review_gate_hit', { broker_id: brokerId, reviews_seen: Math.min(FREE_REVIEWS, reviews.length) });
      onRequireLogin();
      return;
    }
    track('review_started', { broker_id: brokerId });
    setWriting(true);
  };

  const TITLE_MIN = 8;
  const PROS_MIN = 20;

  /** What is still missing, in the person's own terms. */
  const missing = [
    draft.rating === 0 && 'a rating',
    draft.title.trim().length < TITLE_MIN && `a headline of at least ${TITLE_MIN} characters`,
    draft.pros.trim().length < PROS_MIN && `at least ${PROS_MIN} characters on what works`,
  ].filter(Boolean) as string[];

  const ready = missing.length === 0;

  const submit = () => {
    if (!isLoggedIn) { onRequireLogin(); return; }
    if (!ready) return;

    const review: BrokerReview = {
      id: `r${Date.now()}`,
      rating: draft.rating,
      title: draft.title.trim(),
      role: draft.role.trim() || 'Trader',
      relationship: draft.relationship,
      recommend: draft.recommend,
      trustworthy: draft.trustworthy,
      wouldFundAgain: draft.wouldFundAgain,
      categories: draft.categories,
      pros: draft.pros.trim(),
      cons: draft.cons.trim(),
      postedOn: new Date().toISOString().slice(0, 10),
      helpful: 0,
      isNew: true,
    };
    track('review_submitted', {
      broker_id: brokerId, rating: review.rating,
      has_cons: review.cons.length > 0,
      categories_scored: Object.keys(review.categories ?? {}).length,
    });
    writeReview(brokerId, review);
    setReviews((r) => [review, ...r]);
    setWriting(false);

    // Paid through the ledger like any other task, so the daily and weekly
    // caps hold and a second review of the same broker pays less.
    const paid = awardCredits(readLedger(), {
      task: `review:${brokerId}`,
      amount: REVIEW_CREDITS,
      reason: `Reviewed ${brokerName}`,
      social: true,
    });
    writeLedger(paid.ledger);
    onShowToast?.(paid.awarded > 0
      ? `Thanks. +${paid.awarded} Credits for reviewing ${brokerName}.`
      : paid.note ?? 'Thanks for the review.');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#CCC6FB] bg-white p-5">
        <h3 className="font-display text-[20px] font-extrabold text-[#0b1c30]">{brokerName} reviews</h3>

        <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#f5f4ff] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#474556]">
          <span aria-hidden>ℹ️</span>
          Brokers cannot edit or remove what members write here. Reviews are opinions from
          traders, not advice, and a good experience is not a promise of profit.
        </p>

        {stats ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-display text-[40px] font-extrabold leading-none text-[#5945F1]">
                {stats.average.toFixed(1)}
              </span>
              <Stars value={stats.average} size={22} />
              <span className="text-[13px] text-[#64748b]">({stats.count} reviews)</span>
            </div>

            {stats.recommend !== null && (
              <p className="mt-2 text-[15px] font-bold text-[#0b1c30]">
                {stats.recommend}% would recommend this broker
              </p>
            )}

            {stats.categories.length > 0 && (
              <>
                <h4 className="mt-5 font-display text-[15px] font-extrabold text-[#0b1c30]">Ratings by category</h4>
                <dl className="mt-2.5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {[...stats.categories].sort((a, b) => b.value - a.value).map((c) => (
                    <div key={c.name} className="flex items-baseline gap-2">
                      <dt className="order-2 text-[13.5px] text-[#474556]">{c.name}</dt>
                      <dd className="order-1 w-7 font-display text-[14px] font-extrabold tabular-nums text-[#5945F1]">
                        {c.value.toFixed(1)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            <div className="mt-5 space-y-1.5">
              {stats.spread.map((row) => (
                <div key={row.stars} className="flex items-center gap-2.5">
                  <span className="w-3 text-[12.5px] text-[#64748b]">{row.stars}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#eceafb]">
                    <span
                      className="block h-full rounded-full bg-[#5945F1]"
                      style={{ width: `${stats.count ? (row.count / stats.count) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="w-6 text-right text-[12.5px] tabular-nums text-[#64748b]">{row.count}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-[14px] text-[#64748b]">
            Nobody has reviewed {brokerName} yet. Yours would be the first.
          </p>
        )}

        <button
          type="button"
          onClick={start}
          className="mt-5 w-full rounded-xl bg-[#5945F1] py-3 font-display text-[15px] font-extrabold text-white transition hover:bg-[#4a38d6] sm:w-auto sm:px-6"
        >
          Write a review · earn {REVIEW_CREDITS} Credits
        </button>
        {!isLoggedIn && (
          <p className="mt-2 text-[12.5px] text-[#64748b]">
            You will be asked to sign in first, so the review can be attributed and the Credits
            can reach your account.
          </p>
        )}
      </div>

      {writing && (
        <div className="rounded-2xl border border-[#CCC6FB] bg-white p-5">
          <h4 className="font-display text-[17px] font-extrabold text-[#0b1c30]">
            Your review of {brokerName}
          </h4>

          <p className="mt-1 text-[12.5px] text-[#64748b]">
            Write what you would want to read before funding an account. Once it is posted you
            cannot edit it, and neither can the broker.
          </p>

          <div className="mt-4">
            <span className="block text-[13px] font-bold text-[#0b1c30]">Overall rating</span>
            <span className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition ${n <= draft.rating ? 'fill-[#5945F1] text-[#5945F1]' : 'text-[#CCC6FB] hover:text-[#8a7af6]'}`}
                    aria-hidden
                  />
                </button>
              ))}
            </span>
          </div>

          <div className="mt-4">
            <span className="block text-[13px] font-bold text-[#0b1c30]">Score the parts that matter</span>
            <p className="mt-0.5 text-[12px] text-[#64748b]">Leave anything you have no view on blank.</p>
            <div className="mt-2 space-y-2">
              {REVIEW_CATEGORIES.map((name) => (
                <div key={name} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13.5px] text-[#0b1c30]">{name}</span>
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${name}: ${n}`}
                        onClick={() => setDraft((d) => ({ ...d, categories: { ...d.categories, [name]: n } }))}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-4 w-4 ${(draft.categories[name] ?? 0) >= n ? 'fill-[#5945F1] text-[#5945F1]' : 'text-[#CCC6FB] hover:text-[#8a7af6]'}`}
                          aria-hidden
                        />
                      </button>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <label className="mt-4 block">
            <span className="block text-[13px] font-bold text-[#0b1c30]">Headline</span>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Sum it up in a line"
              className="mt-1.5 w-full rounded-xl border border-[#CCC6FB] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#5945F1]"
            />
            <span className="mt-1 block text-[11.5px] text-[#94a3b8]">
              {draft.title.trim().length < TITLE_MIN
                ? `${TITLE_MIN - draft.title.trim().length} more characters`
                : 'Long enough'}
            </span>
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-[13px] font-bold text-[#0b1c30]">What you trade</span>
              <input
                value={draft.role}
                onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                placeholder="Forex swing trader"
                className="mt-1.5 w-full rounded-xl border border-[#CCC6FB] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#5945F1]"
              />
            </label>
            <label className="block">
              <span className="block text-[13px] font-bold text-[#0b1c30]">Your relationship</span>
              <select
                value={draft.relationship}
                onChange={(e) => setDraft((d) => ({ ...d, relationship: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-[#CCC6FB] bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-[#5945F1]"
              >
                <option>Current client</option>
                <option>Former client</option>
                <option>Demo account only</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="block text-[13px] font-bold text-[#0b1c30]">What works</span>
            <textarea
              value={draft.pros}
              onChange={(e) => setDraft((d) => ({ ...d, pros: e.target.value }))}
              rows={3}
              placeholder="Execution, spreads, withdrawals, support"
              className="mt-1.5 w-full resize-none rounded-xl border border-[#CCC6FB] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#5945F1]"
            />
            <span className="mt-1 block text-[11.5px] text-[#94a3b8]">
              {draft.pros.trim().length < PROS_MIN
                ? `${PROS_MIN - draft.pros.trim().length} more characters`
                : 'Long enough'}
            </span>
          </label>

          <label className="mt-4 block">
            <span className="block text-[13px] font-bold text-[#0b1c30]">What does not</span>
            <textarea
              value={draft.cons}
              onChange={(e) => setDraft((d) => ({ ...d, cons: e.target.value }))}
              rows={3}
              placeholder="Be specific. "
              className="mt-1.5 w-full resize-none rounded-xl border border-[#CCC6FB] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#5945F1]"
            />
          </label>

          <div className="mt-4 space-y-2.5">
            {([
              ['recommend', 'Would you recommend this broker?'],
              ['trustworthy', 'Did withdrawals arrive as promised?'],
              ['wouldFundAgain', 'Would you fund an account again?'],
            ] as const).map(([key, question]) => (
              <div key={key} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13.5px] text-[#0b1c30]">{question}</span>
                <span className="flex gap-1.5">
                  {([['Yes', true], ['No', false], ['Not sure', null]] as const).map(([label, value]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, [key]: value }))}
                      className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-bold transition ${
                        draft[key] === value
                          ? 'border-[#5945F1] bg-[#f1f0fe] text-[#5945F1]'
                          : 'border-[#CCC6FB] text-[#64748b] hover:border-[#5945F1]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={submit}
              disabled={!ready}
              className="rounded-xl bg-[#5945F1] px-5 py-2.5 font-display text-[14px] font-extrabold text-white transition hover:bg-[#4a38d6] disabled:bg-[#cdc7f5]"
            >
              Post review
            </button>
            <button
              type="button"
              onClick={() => setWriting(false)}
              className="rounded-xl border border-[#CCC6FB] px-4 py-2.5 text-[14px] font-bold text-[#64748b] transition hover:border-[#5945F1] hover:text-[#5945F1]"
            >
              Cancel
            </button>
            {!ready && (
              <span className="text-[12.5px] text-[#b45309]">
                Still needed: {missing.join(', ')}.
              </span>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#CCC6FB] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CCC6FB] px-5 py-3.5">
          <span className="text-[13px] text-[#64748b]">
            {reviews.length} reviews
            {!isLoggedIn && reviews.length > FREE_REVIEWS && (
              <span className="text-[#94a3b8]"> · {FREE_REVIEWS} shown</span>
            )}
          </span>
          <label className="flex items-center gap-2 text-[13px] text-[#64748b]">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-lg border border-[#CCC6FB] bg-white px-2.5 py-1.5 text-[13px] font-bold text-[#0b1c30] outline-none"
            >
              <option value="relevant">most helpful</option>
              <option value="newest">newest</option>
              <option value="highest">highest rated</option>
              <option value="lowest">lowest rated</option>
            </select>
          </label>
        </div>

        {sorted.length === 0 ? (
          <p className="px-5 py-8 text-center text-[14px] text-[#64748b]">
            No reviews yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#eceafb]">
            {sorted.map((r, i) => {
              const locked = !isLoggedIn && i >= FREE_REVIEWS;
              return (
              <li key={r.id} className={`relative px-5 py-5 ${locked ? 'select-none' : ''}`}>
                {locked && (
                  <>
                    <span className="absolute inset-0 z-10 backdrop-blur-[5px]" aria-hidden />
                    {i === FREE_REVIEWS && (
                      <span className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-5">
                        <button
                          type="button"
                          onClick={start}
                          className="rounded-xl bg-[#0b1c30] px-5 py-3 font-display text-[14.5px] font-extrabold text-white shadow-lg transition hover:bg-black"
                        >
                          Share your experience to get access
                        </button>
                      </span>
                    )}
                  </>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-[15px] font-extrabold text-[#0b1c30]">
                      {r.rating.toFixed(1)}
                    </span>
                    <Stars value={r.rating} />
                  </span>
                  <span className="text-[13px] text-[#94a3b8]">{r.postedOn}</span>
                </div>

                {r.isNew && (
                  <span className="mt-2 inline-block rounded-md bg-[#eaf7ee] px-2 py-0.5 text-[11.5px] font-bold text-[#16803c]">
                    New
                  </span>
                )}

                <h4 className="mt-2 font-display text-[16px] font-extrabold leading-snug text-[#0b1c30]">
                  {r.title}
                </h4>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#f3f4f8] px-2 py-0.5 text-[12px] text-[#64748b]">{r.role}</span>
                  <span className="rounded-md bg-[#f3f4f8] px-2 py-0.5 text-[12px] text-[#64748b]">{r.relationship}</span>
                  {r.location && (
                    <span className="rounded-md bg-[#f3f4f8] px-2 py-0.5 text-[12px] text-[#64748b]">{r.location}</span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <Verdict label="Recommend" value={r.recommend} />
                  <Verdict label="Withdrawals on time" value={r.trustworthy} />
                  <Verdict label="Would fund again" value={r.wouldFundAgain} />
                </div>

                <p className="mt-3 text-[13px] font-bold text-[#16803c]">What works</p>
                <p className="mt-0.5 text-[14px] leading-relaxed text-[#474556]">{r.pros}</p>

                {r.cons && (
                  <>
                    <p className="mt-3 text-[13px] font-bold text-[#b91c1c]">What does not</p>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-[#474556]">{r.cons}</p>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setReviews((list) => list.map((x) => (x.id === r.id ? { ...x, helpful: x.helpful + 1 } : x)))}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#64748b] transition hover:text-[#5945F1]"
                >
                  <ThumbsUp className="h-4 w-4" aria-hidden />
                  Helpful {r.helpful > 0 && `(${r.helpful})`}
                </button>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
