import {useEffect,useRef} from 'react';
/** Count only time while the tester is visible and focused. No elapsed-time guesses for older saves. */
export function useActiveTime(enabled:boolean,key:string){
 const state=useRef({key,total:0,last:Date.now(),enabled});
 if(state.current.key!==key)state.current={key,total:0,last:Date.now(),enabled};
 const sample=()=>{const s=state.current,now=Date.now();if(s.enabled&&document.visibilityState==='visible'&&document.hasFocus())s.total+=Math.min(1500,Math.max(0,now-s.last));s.last=now;return Math.round(s.total);};
 useEffect(()=>{sample();state.current.enabled=enabled;const timer=setInterval(sample,1000);window.addEventListener('blur',sample);document.addEventListener('visibilitychange',sample);return()=>{sample();clearInterval(timer);window.removeEventListener('blur',sample);document.removeEventListener('visibilitychange',sample);};},[enabled,key]);
 return sample;
}
