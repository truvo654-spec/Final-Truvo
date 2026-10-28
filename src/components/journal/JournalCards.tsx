import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Plus, X } from 'lucide-react';
import { JOURNAL_CARD_REGISTRY, JOURNAL_LEVELS, LEVEL_DESCRIPTIONS, type JournalCardDefinition, type JournalTab } from './journalViews';
import type { JournalCardsController } from './useJournalCards';
import { useJournalPopover } from './useJournalPopover';
import { useDialogFocus } from './useDialogFocus';
import { getJournalHelp } from './JournalHelp';

export const journalButton = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#5338ec] disabled:opacity-40';
export function JournalLevelSwitch({ view }: { view: JournalCardsController }) {
  const [open, setOpen] = useState(false);
  const ref = useJournalPopover(open, () => setOpen(false));
  return <div ref={ref} className="relative">
    <button className="rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100" aria-label={`Journal view: ${view.level}`} aria-expanded={open} onClick={() => setOpen(!open)}>View: <span className="capitalize">{view.level}</span> <span aria-hidden="true">▾</span></button>
    {open && <div className="absolute right-0 z-30 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl" role="group" aria-label="Choose journal view">
      {JOURNAL_LEVELS.map(level => <button key={level} aria-pressed={view.baseLevel === level && view.level !== 'custom'} className="block w-full rounded-lg p-3 text-left hover:bg-slate-50" onClick={() => { view.setLevel(level); setOpen(false); }}>
        <span className="text-sm font-semibold capitalize">{level}</span><span className="mt-1 block text-xs text-slate-500">{LEVEL_DESCRIPTIONS[level]}</span>
      </button>)}
      <button className="w-full rounded-lg p-3 text-left text-xs text-[#5338ec] hover:bg-slate-50" onClick={() => { view.reset(); setOpen(false); }}>Reset this tab</button>
    </div>}
  </div>;
}
export function JournalCard({ card, view, children, detail, compact = false, className = '' }: { card: JournalCardDefinition; view: JournalCardsController; children: React.ReactNode; detail?: React.ReactNode; compact?: boolean; className?: string }) {
  const [menu, setMenu] = useState(false), [expanded, setExpanded] = useState(false);
  const ref = useJournalPopover(menu, () => setMenu(false));
  const menuRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPress = () => { if (timer.current) clearTimeout(timer.current); };
  useEffect(() => () => cancelPress(), []);
  useEffect(() => { if (menu) menuRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus(); }, [menu]);
  const index = view.cards.findIndex(item => item.id === card.id);
  return <section aria-label={card.title} className={`relative min-w-0 rounded-2xl border border-slate-200 bg-white ${compact ? 'p-4' : 'p-5'} text-sm ${className}`} onContextMenu={event => {
    if ((event.target as HTMLElement).closest('input,textarea,a')) return;
    event.preventDefault(); setMenu(true);
  }} onPointerDown={event => {
    if (event.pointerType === 'touch' && !(event.target as HTMLElement).closest('button,input,textarea,select,a,summary')) timer.current = setTimeout(() => setMenu(true), 600);
  }} onPointerUp={cancelPress} onPointerCancel={cancelPress} onPointerMove={cancelPress}>
    <header className={`${compact ? 'mb-3' : 'mb-4'} flex items-center justify-between gap-3`}>
      <h3 className="text-sm font-semibold text-[#0b1c30]">{card.title}</h3>
      <div ref={ref} className="relative">
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Options for ${card.title}`} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><MoreHorizontal size={18}/></button>
        {menu && <div ref={menuRef} role="menu" aria-label={`${card.title} options`} className="absolute right-0 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-xl" onKeyDown={event => {
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
          const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (at + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
          buttons[next]?.focus();
        }}>
          {[
            { label: 'Hide this card', disabled: !card.canHide, action: () => view.hide(card.id) },
            { label: expanded ? 'Show less detail' : 'Show more detail', action: () => setExpanded(!expanded) },
            { label: 'Move up', disabled: index === 0, action: () => view.moveUp(card.id) },
            { label: 'Move down', disabled: index === view.cards.length - 1, action: () => view.moveDown(card.id) },
          ].map(item => <button key={item.label} role="menuitem" disabled={item.disabled} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-40" onClick={() => { item.action(); setMenu(false); }}>{item.label}</button>)}
        </div>}
      </div>
    </header>
    {children}
    {expanded && <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">{detail || card.plainSummary}</div>}
  </section>;
}
function AddCardSheet({ tab, view, onClose }: { tab: JournalTab; view: JournalCardsController; onClose: () => void }) {
  const ref = useDialogFocus(onClose);
  const available = JOURNAL_CARD_REGISTRY.filter(card => card.tab === tab && !view.cards.some(shown => shown.id === card.id));
  return <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/35" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Add a journal card" tabIndex={-1} className="h-full w-full max-w-md overflow-y-auto bg-white p-6 outline-none">
      <header className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Add a card</h2><button className={journalButton} aria-label="Close add card" onClick={onClose}><X size={18}/></button></header>
      <p className="mb-5 text-sm text-slate-500">Hidden cards and extra tools. Add only what helps you.</p>
      <div className="space-y-3">{available.map(card => <div key={card.id} className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold">{card.title}</h3><p className="my-2 text-sm text-slate-500">{card.plainSummary}</p>
        <button className={journalButton} aria-label={`Add ${card.title}`} onClick={() => view.add(card.id)}>Add</button>
      </div>)}</div>
      {!available.length && <p className="text-sm text-slate-500">All available cards are already in your view.</p>}
    </div>
  </div>;
}
export function JournalAddCard({ tab, view }: { tab: JournalTab; view: JournalCardsController }) {
  const [open, setOpen] = useState(false);
  if (view.baseLevel === 'advanced' && view.level !== 'custom') return null;
  return <div className="mt-5">
    <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#5338ec] hover:bg-[#F7F5FF]" onClick={() => setOpen(true)}><Plus size={16}/> Add card</button>
    {open && <AddCardSheet tab={tab} view={view} onClose={() => setOpen(false)}/>}
  </div>;
}
export function JournalWorkspaceCard({ view, children }: { view: JournalCardsController; children: React.ReactNode }) {
  if (view.baseLevel === 'advanced' && view.level !== 'custom') return <>{children}</>;
  const card = view.cards[0];
  return card ? <JournalCard card={card} view={view} detail={getJournalHelp(card.title) || card.plainSummary}>{children}</JournalCard> : null;
}
