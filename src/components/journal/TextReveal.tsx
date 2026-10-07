import React, { useMemo } from 'react';

type Stop = [number, number, number];
const hex = (h: string): Stop => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** MarketSyde colours (violet, pink, lime), lightened a little so small text stays readable on the dark card. */
export const PALETTES = {
  headline: ['#9D8FFF', '#FF3FC4', '#D6F73A'].map(hex),
  body: ['#CFC8FF', '#FFA6E6', '#E9F98F'].map(hex),
  soft: ['#E4E0FF', '#FFC7F0', '#F0FAB8'].map(hex),
} as const;

/** A colour at position t (0 to 1) along a list of stops. */
export function gradientAt(stops: readonly Stop[], t: number): string {
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const f = x - i;
  const c = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

/**
 * Words appear one after another, each fading in out of a blur, and the colour runs along
 * the sentence from violet through pink to lime. With reduced motion the text is simply shown.
 */
export const TextReveal: React.FC<{
  text: string;
  palette?: keyof typeof PALETTES;
  /** ms before the first word */
  delay?: number;
  /** ms between words */
  stagger?: number;
  instant?: boolean;
  className?: string;
  as?: 'p' | 'h2' | 'h3' | 'span';
}> = ({ text, palette = 'body', delay = 0, stagger = 28, instant = false, className = '', as: Tag = 'p' }) => {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const stops = PALETTES[palette];
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <React.Fragment key={`${i}-${w}`}>
            <span
              className={instant ? '' : 'jr-word'}
              style={{ color: gradientAt(stops, words.length > 1 ? i / (words.length - 1) : 0), animationDelay: instant ? undefined : `${delay + i * stagger}ms` }}
            >
              {w}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </span>
    </Tag>
  );
};
