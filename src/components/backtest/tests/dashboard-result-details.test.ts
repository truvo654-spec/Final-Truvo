import test from 'node:test';
import assert from 'node:assert/strict';
import {completeTotal,resultGross,resultCommission,resultVolume,resultCurve} from '../dashboardResultDetails';
import {dashboardSources,initialDashboardScope} from '../dashboardData';
import type {DashboardRow} from '../dashboardData';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
import {USD_PER} from '../../../backtest/config';

const row=(overrides:Partial<DashboardRow>={}):DashboardRow=>({id:'one',sourceId:'journal',symbol:'MGC',strategy:'Swing',bookId:'swing',side:'long',entryAt:1000,at:2000,day:'2026-07-14',net:90,r:1,fallbackDate:false,holdKnown:true,...overrides});
test('popup totals require complete data and do not convert missing costs to zero',()=>{
 const scope=initialDashboardScope([],[]),entry={...JOURNAL_ENTRIES[0],pnl:100,commission:undefined,pnlKnown:true};
 const r=dashboardSources([],[],[entry],[],scope).at(-1)!.rows[0];
 assert.equal(resultGross(r),100);assert.equal(resultCommission(r),null);
 assert.equal(completeTotal([r],resultCommission),null);
 assert.equal(completeTotal([row(),row({net:10})],r=>r.net),100);
 assert.equal(completeTotal([],r=>r.net),null);
 assert.equal(completeTotal([row(),row()],()=>NaN),null);
});
test('simulation commission follows per-side quantity and account currency conversion',()=>{
 const r=row({trade:{size:3,gross:100} as any,run:{settings:{costs:{enabled:true,commissionPerSide:2}},output:{result:{currency:'EUR'}}} as any});
 assert.equal(resultCommission(r),12/USD_PER.EUR);
 r.run!.settings.costs.enabled=false;assert.equal(resultCommission(r),0);
 assert.equal(resultGross(r),100);
});
test('volume keeps each instrument and quantity unit separate',()=>{
 assert.equal(resultVolume([row({trade:{size:2} as any}),row({symbol:'EUR/USD',trade:{size:.1} as any})]),'2 MGC contracts · 0.1 EUR/USD lots');
 assert.equal(resultVolume([row()]),null);
});
test('result curve begins at zero, sorts closes, groups equal times and excludes incomplete trades',()=>{
 const curve=resultCurve([row({at:3000,net:-10}),row({net:100}),row({net:5}),row({closed:false,net:999})],r=>r.net);
 assert.deepEqual(curve.map(p=>p.y),[0,105,95]);assert.ok(curve[0].x<curve[1].x);
 assert.deepEqual(resultCurve([row()],()=>null),[]);
 assert.deepEqual(resultCurve([row()],r=>r.net).map(p=>p.y),[0,90]);
});
