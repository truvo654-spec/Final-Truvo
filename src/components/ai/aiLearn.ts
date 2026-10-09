import { Course } from '../../types';
import { COURSES } from '../../data/educationData';
import { AiContext, AiItem, AiMessage, AiQuiz, AiReply, Level } from './aiTypes';
import { GLOSSARY, Term, escapeRe, findTerm, termByTitle } from './aiKnowledge';
import { levelIndex, levenshtein, mid } from './aiUtil';

const courseItem = (c: Course): AiItem => ({
  title: c.title,
  sub: `${c.level} · ${c.category} · ${c.lessons.length} lessons · +${c.pointsReward} pts`,
  badge: 'Course',
  tab: 'education-hub',
});

function coursesFor(category: string | undefined, level: Level, limit = 2): Course[] {
  const pool = category ? COURSES.filter((c) => c.category === category) : COURSES;
  return [...(pool.length ? pool : COURSES)]
    .sort((a, b) => Math.abs(levelIndex(a.level) - levelIndex(level)) - Math.abs(levelIndex(b.level) - levelIndex(level)))
    .slice(0, limit);
}

export function explainTerm(term: Term, level: Level): AiReply {
  const paragraphs =
    level === 'Beginner' ? [term.simple, ...(term.example ? [`Example: ${term.example}`] : [])]
    : level === 'Intermediate' ? [term.simple, term.deeper]
    : [term.deeper, ...(term.example ? [`Example: ${term.example}`] : [])];
  const items: AiItem[] = [];
  if (term.calc) items.push({ title: `Try the ${term.calc.replace('-', ' ')}`, sub: 'Work it out with your own numbers', badge: 'Tool', tab: term.calc });
  items.push(...coursesFor(term.category, level).map(courseItem));
  const related = (term.related ?? []).filter((r) => termByTitle(r));
  const msg: AiMessage = {
    id: mid(),
    role: 'ai',
    surface: 'learn',
    heading: term.title,
    paragraphs,
    items,
    sources: ['Trading glossary', 'Education Hub'],
    note: `Explained at ${level} level. Change your level in the panel, or ask for “simpler” or “deeper”.`,
    followUps: [
      ...(level !== 'Beginner' ? ['Explain it simpler'] : []),
      ...(level !== 'Advanced' ? ['Go deeper'] : []),
      `Quiz me on ${term.title}`,
      ...related.slice(0, 2).map((r) => `What is ${r.toLowerCase()}?`),
    ],
  };
  return { msg, mem: { surface: 'learn', term: term.title, level } };
}

export function oneLiner(term: Term): AiReply {
  const first = term.simple.split('. ')[0].replace(/\.$/, '');
  return {
    msg: {
      id: mid(), role: 'ai', surface: 'learn',
      heading: `${term.title} in one line`,
      paragraphs: [`${first}.`, ...(term.example ? [`Example: ${term.example}`] : [])],
      note: 'That is the simplest version I have. The courses below go step by step.',
      items: coursesFor(term.category, 'Beginner', 1).map(courseItem),
      followUps: [`Quiz me on ${term.title}`, 'Learning path'],
    },
    mem: { surface: 'learn', term: term.title, level: 'Beginner' },
  };
}

function suggestTerm(q: string): Term | undefined {
  const words = q.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4);
  for (const w of words) {
    for (const t of GLOSSARY) {
      for (const k of [...t.keys, ...(t.weak ?? [])]) {
        if (k.length >= 4 && !k.includes(' ') && levenshtein(w, k) <= 1) return t;
      }
    }
  }
  return undefined;
}

export function learnAnswer(q: string, ctx: AiContext, levelOverride?: Level): AiReply {
  const level = levelOverride ?? ctx.level;
  const term = findTerm(q) ?? (ctx.memory.term && /^(it|that|this)\b|simpler|deeper/.test(q.toLowerCase()) ? termByTitle(ctx.memory.term) : undefined);
  if (term) return explainTerm(term, level);

  const guess = suggestTerm(q);
  if (guess) {
    return {
      msg: {
        id: mid(), role: 'ai', surface: 'learn',
        heading: `Did you mean “${guess.title}”?`,
        paragraphs: ['I could not find that exact term, but this one is close.'],
        followUps: [`What is ${guess.title.toLowerCase()}?`, 'Learning path'],
      },
      mem: { surface: 'learn' },
    };
  }
  const words = q.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  const hits = COURSES.map((c) => ({ c, s: words.reduce((a, w) => a + (`${c.title} ${c.summary} ${c.category}`.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.c);
  return {
    msg: {
      id: mid(), role: 'ai', surface: 'learn',
      heading: hits.length ? 'These lessons cover that' : 'I do not have a one-line answer for that',
      paragraphs: [hits.length ? 'I do not have a short definition for it, but these courses go through it properly.' : 'Try the exact term (for example “drawdown”, “pip” or “margin call”) and I will explain it at your level.'],
      items: (hits.length ? hits : coursesFor(undefined, level)).map(courseItem),
      sources: ['Education Hub'],
      followUps: ['What is drawdown?', 'What is leverage?', 'Quiz me', 'Learning path'],
    },
    mem: { surface: 'learn' },
  };
}

export function learnHome(ctx: AiContext): AiReply {
  return {
    msg: {
      id: mid(), role: 'ai', surface: 'learn',
      heading: 'Learning assistant',
      paragraphs: [
        `I explain trading terms plainly, adjust depth to your level (${ctx.level}), run quick quizzes and work out position size, pip value, margin and risk/reward for you.`,
        'Ask about any term, or try the ideas below.',
      ],
      items: coursesFor(undefined, ctx.level, 2).map(courseItem),
      sources: ['Trading glossary', 'Education Hub'],
      followUps: ['What is drawdown?', 'Quiz me', 'Learning path', 'Position size for $5,000 risking 1% with a 25 pip stop'],
    },
    mem: { surface: 'learn' },
  };
}

/* ───────────── Learning path ───────────── */

const PATH_ORDER = ['Forex Basics', 'Risk Management', 'Technical Analysis', 'Trading Psychology', 'Crypto'];

export function learningPath(ctx: AiContext): AiReply {
  const idx = levelIndex(ctx.level);
  const ordered = [...COURSES].sort((a, b) => {
    const la = levelIndex(a.level) - idx;
    const lb = levelIndex(b.level) - idx;
    const ra = la < 0 ? 3 + Math.abs(la) : la; // courses below your level go last
    const rb = lb < 0 ? 3 + Math.abs(lb) : lb;
    if (ra !== rb) return ra - rb;
    return PATH_ORDER.indexOf(a.category) - PATH_ORDER.indexOf(b.category);
  });
  const total = ordered.slice(0, 5).reduce((s, c) => s + c.pointsReward, 0);
  return {
    msg: {
      id: mid(), role: 'ai', surface: 'learn',
      heading: `A learning path for ${ctx.level} level`,
      paragraphs: [`Start at your level and move on when each course feels easy. Finishing these ${Math.min(5, ordered.length)} earns up to +${total} points.`],
      items: ordered.slice(0, 5).map((c, i) => ({ ...courseItem(c), title: `${i + 1}. ${c.title}` })),
      sources: ['Education Hub'],
      followUps: ['Quiz me', 'What is risk reward?', 'What should I do next?'],
    },
    mem: { surface: 'learn' },
  };
}

/* ───────────── Quiz ───────────── */

interface PoolQuiz extends AiQuiz { id: string }

function termQuestion(t: Term, all: Term[]): PoolQuiz {
  const mask = [t.title, ...t.keys, ...(t.weak ?? [])].filter((k) => k.length >= 2).sort((a, b) => b.length - a.length);
  let first = t.simple.split('. ')[0].replace(/\.$/, '');
  mask.forEach((k) => { first = first.replace(new RegExp(`(^|[^a-z0-9])${escapeRe(k)}(s)?(?=[^a-z0-9]|$)`, 'gi'), '$1_____'); });
  const distractors = all.filter((x) => x.title !== t.title).sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.title);
  const options = [...distractors, t.title].sort(() => Math.random() - 0.5);
  return {
    id: `term:${t.title}`,
    question: `Which term fits this description? “${first}.”`,
    options,
    correctIndex: options.indexOf(t.title),
    explanation: `${t.title}: ${t.deeper}`,
    source: 'Trading glossary',
  };
}

export function quizReply(ctx: AiContext, focus?: Term): AiReply {
  const pool: PoolQuiz[] = [];
  const maxLevel = levelIndex(ctx.level);
  COURSES.filter((c) => levelIndex(c.level) <= maxLevel).forEach((c) =>
    c.lessons.forEach((l) => (l.quizQuestions ?? []).forEach((qq) =>
      pool.push({ id: qq.id, question: qq.question, options: qq.options, correctIndex: qq.correctIndex, explanation: `The answer is “${qq.options[qq.correctIndex]}”. This comes from the course “${c.title}”.`, source: c.title }),
    )),
  );
  const termPool = (focus ? [focus] : GLOSSARY).map((t) => termQuestion(t, GLOSSARY));
  const all = focus ? termPool : [...pool, ...termPool];
  const fresh = all.filter((x) => x.id !== ctx.memory.quizId);
  const pick = fresh[Math.floor(Math.random() * fresh.length)] ?? all[0];
  return {
    msg: {
      id: mid(), role: 'ai', surface: 'learn',
      heading: focus ? `Quick check: ${focus.title}` : 'Quick quiz',
      paragraphs: ['Pick an answer. I will explain it either way.'],
      quiz: { question: pick.question, options: pick.options, correctIndex: pick.correctIndex, explanation: pick.explanation, source: pick.source },
      sources: [pick.source ?? 'Education Hub'],
      followUps: ['Next question', 'Learning path'],
    },
    mem: { surface: 'learn', quizId: pick.id },
  };
}
