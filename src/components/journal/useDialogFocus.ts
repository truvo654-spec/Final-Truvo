import { useEffect, useRef } from 'react';
export function useDialogFocus(close:()=>void) {
  const ref=useRef<HTMLDivElement>(null);const closeRef=useRef(close);closeRef.current=close;
  useEffect(()=>{const prior=document.activeElement as HTMLElement;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.focus();
    const element=ref.current;
    const key=(ev:KeyboardEvent)=>{if(ev.key==='Escape'){ev.stopPropagation();closeRef.current();}if(ev.key==='Tab'){
      const nodes=(Array.from(element?.querySelectorAll('button:not(:disabled),input:not(:disabled),select,textarea,a[href],summary') || []) as HTMLElement[]).filter(e=>e.offsetParent!==null);
      const first=nodes[0],last=nodes[nodes.length-1];if(ev.shiftKey && (document.activeElement===first || document.activeElement===ref.current)){ev.preventDefault();last?.focus();}else if(!ev.shiftKey && document.activeElement===last){ev.preventDefault();first?.focus();}}};
    element?.addEventListener('keydown',key);return()=>{element?.removeEventListener('keydown',key);document.body.style.overflow=overflow;prior?.focus();};},[]);return ref;
}
