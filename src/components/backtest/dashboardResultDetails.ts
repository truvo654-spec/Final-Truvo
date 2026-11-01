import type {DashboardRow} from './dashboardData';
import {finite,closedRow} from './dashboardAnalytics';
import {symbolSpec} from '../../backtest/marketData';
import {USD_PER} from '../../backtest/config';

/** Missing components never silently become zero or a partial total. */
export function completeTotal(rows:DashboardRow[],value:(row:DashboardRow)=>number|null){
 const values=rows.map(value);
 return values.length&&values.every((v):v is number=>v!==null&&Number.isFinite(v))?values.reduce((a,b)=>a+b,0):null;
}
export const resultGross=(row:DashboardRow)=>finite(row.trade?.gross??(row.journal?.pnlKnown===false?null:row.journal?.pnl));
export function resultCommission(row:DashboardRow){
 if(row.journal)return finite(row.journal.commission);
 if(!row.trade||!row.run)return null;
 const costs=row.run.settings.costs;
 // Same commission calculation as engine.fillExit, converted from USD to account currency.
 return costs.enabled?finite(costs.commissionPerSide*row.trade.size*2/(USD_PER[row.run.output.result.currency]??1)):0;
}
export function resultVolume(rows:DashboardRow[]){
 const groups=new Map<string,number>();
 for(const row of rows){
  const qty=finite(row.trade?.size??row.practice?.size??row.journal?.size);if(qty===null||qty<0)return null;
  const unit=row.journal?row.journal.quantityUnit||'units':symbolSpec(row.symbol)?.sizeUnit||'units';
  const key=`${row.symbol} ${unit}`;groups.set(key,(groups.get(key)??0)+qty);
 }
 return groups.size?[...groups].map(([label,qty])=>`${qty.toLocaleString('en-US',{maximumFractionDigits:8})} ${label}`).join(' · '):null;
}
export function resultCurve(rows:DashboardRow[],value:(row:DashboardRow)=>number|null){
 const grouped=new Map<number,number>();
 for(const row of rows.filter(closedRow)){const v=value(row);if(v!==null&&Number.isFinite(v)&&Number.isFinite(row.at))grouped.set(row.at,(grouped.get(row.at)??0)+v);}
 const ordered=[...grouped].sort(([a],[b])=>a-b);if(!ordered.length)return [];
 let total=0;return [{x:ordered[0][0]-60000,y:0},...ordered.map(([x,v])=>({x,y:total+=v}))];
}
