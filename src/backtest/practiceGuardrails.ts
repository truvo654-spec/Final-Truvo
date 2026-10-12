import type {PracticeTrade} from './store';
export interface PracticeGuardrails {session:{start:number;end:number}|null;maxTrades:number|null;lossesPerDay:number|null;dailyLoss:number|null;}
export const emptyPracticeGuardrails:PracticeGuardrails={session:null,maxTrades:null,lossesPerDay:null,dailyLoss:null};
export function practiceEntryBlock(trades:PracticeTrade[],time:number,limits:PracticeGuardrails):string|null{
  const date=new Date(time).toISOString().slice(0,10),hour=new Date(time).getUTCHours()+new Date(time).getUTCMinutes()/60;
  const session=limits.session;
  if(session&&!(session.start<session.end?hour>=session.start&&hour<session.end:hour>=session.start||hour<session.end))return 'Outside your practice session (UTC).';
  const closed=trades.filter(t=>t.exitTime&&Date.parse(t.exitTime)<=time&&t.entryTime?.slice(0,10)===date);
  const positions=new Map<string,number>();closed.forEach(t=>positions.set(t.entryTime!, (positions.get(t.entryTime!)||0)+t.net));
  if(limits.maxTrades!==null&&positions.size>=limits.maxTrades)return 'Maximum practice trades for this day reached.';
  if(limits.lossesPerDay!==null&&[...positions.values()].filter(n=>n<0).length>=limits.lossesPerDay)return 'Practice losing-trade limit reached.';
  if(limits.dailyLoss!==null&&[...positions.values()].reduce((a,b)=>a+b,0)<=-limits.dailyLoss)return 'Practice daily loss limit reached.';
  return null;
}
