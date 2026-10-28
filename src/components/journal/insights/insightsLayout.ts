const processCards = new Set(['insights-playbooks', 'insights-discipline']);
const pairedCards = new Set([...processCards, 'insights-curve', 'insights-weekdays', 'insights-calendar', 'insights-kpis']);
const wideCards = new Set(['insights-calendar', 'insights-playbooks', 'insights-curve']);
type Span = 5 | 6 | 7 | 12;
const classes = {
  md: { 5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 12: 'md:col-span-12' },
  lg: { 5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 12: 'lg:col-span-12' },
  xl: { 5: 'xl:col-span-5', 6: 'xl:col-span-6', 7: 'xl:col-span-7', 12: 'xl:col-span-12' },
};

// Pair adjacent cards only, so visual and keyboard order always match a saved layout.
export function easyInsightsLayout(ids: readonly string[]) {
  const layout: Record<string, string> = Object.fromEntries(ids.map(id => [id, 'col-span-12']));
  for (const breakpoint of ['md', 'lg', 'xl'] as const) {
    const eligible = breakpoint === 'md' ? processCards : pairedCards;
    const spans = new Map<string, Span>(ids.map(id => [id, 12]));
    for (let index = 0; index < ids.length - 1; index++) {
      const current = ids[index], next = ids[index + 1];
      if (!eligible.has(current) || !eligible.has(next)) continue;
      const span: Span = breakpoint === 'md' || wideCards.has(current) === wideCards.has(next) ? 6 : wideCards.has(current) ? 7 : 5;
      spans.set(current, span); spans.set(next, span === 7 ? 5 : span === 5 ? 7 : 6);
      index++;
    }
    for (const id of ids) layout[id] += ` ${classes[breakpoint][spans.get(id)!]}`;
  }
  return layout;
}
