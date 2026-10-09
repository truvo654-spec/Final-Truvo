import { AiMessage } from './aiTypes';

let n = 0;
const mid = () => `c${Date.now()}_${n++}`;

const toNum = (s: string, k?: string) => {
  const v = parseFloat(s.replace(/,/g, ''));
  if (Number.isNaN(v)) return NaN;
  return k ? v * 1000 : v;
};

/** Pull the first dollar-like amount out of the text ($5,000 / 5k / 5000 usd). */
function parseMoney(q: string): number | null {
  const m =
    q.match(/\$\s?(\d[\d,]*(?:\.\d+)?)\s?(k)?/i) ||
    q.match(/(\d[\d,]*(?:\.\d+)?)\s?(k)?\s?(?:usd|dollars?|account|balance|equity|capital)/i);
  if (!m) return null;
  const v = toNum(m[1], m[2]);
  return Number.isNaN(v) ? null : v;
}

const parsePercent = (q: string) => {
  const m = q.match(/(\d+(?:\.\d+)?)\s?%/);
  return m ? parseFloat(m[1]) : null;
};
const parsePips = (q: string) => {
  const m = q.match(/(\d+(?:\.\d+)?)\s?(?:pips?|points?)/i);
  return m ? parseFloat(m[1]) : null;
};
const parseLots = (q: string) => {
  const m = q.match(/(\d+(?:\.\d+)?)\s?lots?/i);
  return m ? parseFloat(m[1]) : null;
};
const parseLeverage = (q: string) => {
  const m = q.match(/1\s?:\s?(\d+)/) || q.match(/(\d+)\s?(?:x|:1)\s?leverage/i) || q.match(/leverage\s?(?:of)?\s?(\d+)/i);
  return m ? parseFloat(m[1]) : null;
};

const fmt = (v: number, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const base = (): Pick<AiMessage, 'id' | 'role' | 'surface'> => ({ id: mid(), role: 'ai', surface: 'learn' });
const ASSUME = 'Assumes a USD-quoted pair where one standard lot is about $10 per pip. Yen pairs, gold and indices differ, so confirm in the calculator before you trade.';

export type CalcKind = 'size' | 'pipvalue' | 'margin' | 'recovery' | 'rr' | 'breakeven';

export function detectCalc(q: string): CalcKind | null {
  const t = q.toLowerCase();
  if (/position size|lot size|how many lots|how big should|how much (should i|can i) (risk|trade)|size my (trade|position)|calculate (my )?(lot|size)/.test(t)) return 'size';
  if (/pip value|worth per pip|per pip|how much is a pip|value of a pip/.test(t) && /\d/.test(t)) return 'pipvalue';
  if (/margin (needed|required|for)|how much margin|required margin/.test(t)) return 'margin';
  if (/recover|get back|(draw ?down|down|lost|loss) (of )?\d+\s?%|\d+\s?% (draw ?down|loss)/.test(t) && /\d/.test(t)) return 'recovery';
  if (/risk.?reward|r:r|reward.?risk/.test(t) && /\d/.test(t)) return 'rr';
  if (/break.?even win ?rate|win ?rate (needed|do i need|to break even)/.test(t)) return 'breakeven';
  return null;
}

export function calculate(kind: CalcKind, q: string): AiMessage {
  switch (kind) {
    case 'size': {
      const bal = parseMoney(q);
      const risk = parsePercent(q) ?? 1;
      const stop = parsePips(q);
      if (!bal || !stop) {
        return {
          ...base(),
          heading: 'Position size calculator',
          paragraphs: [
            'Tell me three things: your account size, how much of it you will risk, and your stop distance in pips.',
            'For example: “Position size for $5,000 risking 1% with a 25 pip stop”.',
          ],
          items: [{ title: 'Open the Pip calculator', sub: 'Full calculator with pair selection', tab: 'pip-calculator' }],
          followUps: ['Position size for $5,000 risking 1% with a 25 pip stop', 'What is position sizing?'],
        };
      }
      const riskUsd = (bal * risk) / 100;
      const lots = riskUsd / (stop * 10);
      return {
        ...base(),
        heading: 'Your position size',
        paragraphs: [`Risking ${risk}% of $${fmt(bal, 0)} is $${fmt(riskUsd)}. With a ${stop} pip stop that is about ${fmt(lots, 2)} lots (${fmt(lots * 100000, 0)} units).`],
        stats: [
          { label: 'Risk amount', value: `$${fmt(riskUsd)}` },
          { label: 'Stop distance', value: `${stop} pips` },
          { label: 'Lot size', value: fmt(lots, 2), tone: 'good' },
          { label: 'Value per pip', value: `$${fmt(lots * 10)}` },
        ],
        items: [{ title: 'Check it in the Pip calculator', sub: 'Pick your exact pair', tab: 'pip-calculator' }],
        sources: ['Position sizing formula'],
        note: ASSUME,
        followUps: ['Position size for $10,000 risking 2% with a 30 pip stop', 'What is position sizing?'],
      };
    }
    case 'pipvalue': {
      const lots = parseLots(q) ?? 1;
      const pips = parsePips(q) ?? 1;
      const perPip = lots * 10;
      return {
        ...base(),
        heading: 'Pip value',
        paragraphs: [`${fmt(lots, 2)} lots is about $${fmt(perPip)} per pip, so ${pips} pip${pips === 1 ? '' : 's'} is about $${fmt(perPip * pips)}.`],
        stats: [{ label: 'Per pip', value: `$${fmt(perPip)}` }, { label: `${pips} pips`, value: `$${fmt(perPip * pips)}` }],
        note: ASSUME,
        items: [{ title: 'Open the Pip calculator', tab: 'pip-calculator' }],
        sources: ['Pip value formula'],
      };
    }
    case 'margin': {
      const lots = parseLots(q) ?? 1;
      const lev = parseLeverage(q) ?? 100;
      if (lots <= 0 || lev <= 0) {
        return { ...base(), heading: 'Margin needed', paragraphs: ['Give me a lot size and leverage above zero, for example “Margin for 2 lots at 1:200”.'], followUps: ['Margin for 2 lots at 1:200'] };
      }
      const margin = (lots * 100000) / lev;
      return {
        ...base(),
        heading: 'Margin needed',
        paragraphs: [`${fmt(lots, 2)} lots at 1:${lev} needs about $${fmt(margin)} of margin on a pair quoted near $1 per unit.`],
        stats: [{ label: 'Position size', value: `${fmt(lots * 100000, 0)} units` }, { label: 'Leverage', value: `1:${lev}` }, { label: 'Margin', value: `$${fmt(margin)}`, tone: 'neutral' }],
        note: 'Gold, indices and crypto use different contract sizes. Use the leverage calculator for the exact instrument.',
        items: [{ title: 'Open the Leverage calculator', tab: 'leverage-calculator' }],
        sources: ['Margin formula'],
      };
    }
    case 'recovery': {
      const dd = parsePercent(q);
      if (!dd || dd <= 0 || dd >= 100) {
        return { ...base(), heading: 'Drawdown recovery', paragraphs: ['Give me the drawdown as a percentage, for example “How much to recover from a 20% drawdown?”.'], followUps: ['How much to recover from a 20% drawdown?'] };
      }
      const need = (dd / (100 - dd)) * 100;
      return {
        ...base(),
        heading: 'What it takes to recover',
        paragraphs: [`After a ${dd}% drawdown you need a ${fmt(need, 1)}% gain just to get back to the old high.`],
        stats: [{ label: 'Drawdown', value: `${dd}%`, tone: 'bad' }, { label: 'Gain to recover', value: `${fmt(need, 1)}%`, tone: 'good' }],
        bars: [{ title: 'Gain needed by drawdown', rows: [10, 20, 30, 50].map((d) => ({ label: `${d}% down`, value: (d / (100 - d)) * 100, display: `${fmt((d / (100 - d)) * 100, 0)}%` })) }],
        note: 'This is why capping drawdown matters more than chasing returns.',
        sources: ['Drawdown arithmetic'],
        followUps: ['What is drawdown?', 'How are my trades doing?'],
      };
    }
    case 'rr': {
      const nums = (q.match(/\d+(?:\.\d+)?/g) || []).map(parseFloat);
      const m = q.match(/(\d+(?:\.\d+)?)\s?(?::|to)\s?(\d+(?:\.\d+)?)/);
      let risk: number | undefined;
      let reward: number | undefined;
      if (m) { risk = parseFloat(m[1]); reward = parseFloat(m[2]); }
      else if (nums.length >= 3 && /entry/i.test(q)) {
        const [entry, stop, target] = nums;
        risk = Math.abs(entry - stop);
        reward = Math.abs(target - entry);
      }
      if (!risk || !reward) {
        return { ...base(), heading: 'Risk / reward', paragraphs: ['Give me a ratio (“1:2”) or entry, stop and target (“entry 1.0850 stop 1.0830 target 1.0890”).'], followUps: ['Risk reward for entry 1.0850 stop 1.0830 target 1.0890'] };
      }
      const rr = reward / risk;
      const be = (1 / (1 + rr)) * 100;
      return {
        ...base(),
        heading: 'Risk / reward',
        paragraphs: [`That is 1:${fmt(rr, 2)}. You would break even at about a ${fmt(be, 0)}% win rate (before costs).`],
        stats: [{ label: 'Ratio', value: `1:${fmt(rr, 2)}`, tone: rr >= 1.5 ? 'good' : rr < 1 ? 'bad' : 'neutral' }, { label: 'Break-even win rate', value: `${fmt(be, 0)}%` }],
        sources: ['Risk/reward arithmetic'],
        followUps: ['What is expectancy?'],
      };
    }
    case 'breakeven': {
      const m = q.match(/(\d+(?:\.\d+)?)\s?(?::|to)\s?(\d+(?:\.\d+)?)/);
      const rr = m ? parseFloat(m[2]) / parseFloat(m[1]) : 2;
      const be = (1 / (1 + rr)) * 100;
      return {
        ...base(),
        heading: 'Break-even win rate',
        paragraphs: [`At 1:${fmt(rr, 1)} risk/reward you need to win about ${fmt(be, 0)}% of trades to break even, before spreads and commissions.`],
        stats: [{ label: 'Risk / reward', value: `1:${fmt(rr, 1)}` }, { label: 'Break-even win rate', value: `${fmt(be, 0)}%`, tone: 'good' }],
        sources: ['Expectancy arithmetic'],
        followUps: ['What is expectancy?'],
      };
    }
  }
}
