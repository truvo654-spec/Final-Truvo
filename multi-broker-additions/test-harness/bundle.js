(function(){
'use strict';
var BROKERS=[{id:'HFM',ab:'HF',col:'#5945f1'},{id:'IC Markets',ab:'IC',col:'#e03434'},{id:'XM',ab:'XM',col:'#ea8a0c'},{id:'Exness',ab:'EX',col:'#16a34a'}];
var ACC=[
 {id:'hfm',broker:'HFM',nick:'Main',plat:'MT5',type:'Premium',no:'4521',status:'live',snap:'Today 11:58',ago:'2 min ago',bal:12293.60,eq:12480,pl:186.40,mu:1521.95,today:96.2,partnerId:'HFM-PA-77104521',server:'x'},
 {id:'hfm2',broker:'HFM',nick:'Hedge',plat:'MT5',type:'Premium',no:'6610',status:'live',snap:'Today 11:58',ago:'2 min ago',bal:2013,eq:1980,pl:-33,mu:456.59,today:-14,partnerId:'HFM-PA-77106610',server:'x'},
 {id:'ic',broker:'IC Markets',nick:'Prop 1',plat:'cTrader',type:'Raw',no:'3310',status:'live',snap:'Today 11:58',ago:'2 min ago',bal:8216.1,eq:8120,pl:-96.1,mu:8285.71,today:-31.8,partnerId:'ICM',server:'x'},
 {id:'ic2',broker:'IC Markets',nick:'Prop 2',plat:'MT5',type:'Pro',no:'7724',status:'none',snap:null,ago:'never',bal:null,eq:null,pl:null,mu:null,today:null,reason:'Broker partner API returned no data for this account',partnerId:'ICM2',server:'x'},
 {id:'xm',broker:'XM',nick:'Swing',plat:'MT4',type:'Standard',no:'8765',status:'stale',snap:'21 Nov 10:02',ago:'3 days ago',bal:5442.75,eq:5230,pl:-212.75,mu:3735.71,today:0,partnerId:'XM',server:'x'},
 {id:'ex',broker:'Exness',nick:'Scalp',plat:'MT5',type:'Pro',no:'9281',status:'live',snap:'Today 11:58',ago:'2 min ago',bal:3856.8,eq:3915,pl:58.2,mu:315.73,today:60.2,partnerId:'EXN',server:'x'}];
var POS=[
 {id:'p1',a:'hfm',ins:'EURUSD',side:'Buy',lots:1,en:'1.0842',cu:'1.0861',pl:186.4,m:1521.95,usd:108610},
 {id:'p2',a:'xm',ins:'EURUSD',side:'Sell',lots:.5,en:'1.0843',cu:'1.0861',pl:-92.75,m:1250,usd:-54305},
 {id:'p3',a:'xm',ins:'US500',side:'Sell',lots:2,en:'5,912.4',cu:'5,918.4',pl:-120,m:2485.71,usd:-11837},
 {id:'p4',a:'ic',ins:'XAUUSD',side:'Buy',lots:.3,en:'2,648.20',cu:'2,643.85',pl:-130.5,m:5290.71,usd:79316},
 {id:'p5',a:'ic',ins:'GBPJPY',side:'Buy',lots:.4,en:'193.42',cu:'193.53',pl:34.4,m:2995,usd:50800},
 {id:'p6',a:'ex',ins:'BTCUSD',side:'Buy',lots:.1,en:'96,120',cu:'96,702',pl:58.2,m:315.73,usd:9670},
 {id:'p7',a:'hfm2',ins:'EURUSD',side:'Sell',lots:.3,en:'1.0850',cu:'1.0861',pl:-33,m:456.59,usd:-32583},
 {id:'p8',a:'ex',ins:'BTCUSD',side:'Sell',lots:.05,en:'96,702',cu:'96,702',pl:0,m:0,usd:-4835}];
var CLOSED=[
 {day:30,t:'09:20',a:'hfm',ins:'EURUSD',side:'Buy',lots:.5,en:'1',ex:'1',pl:64.5},{day:29,t:'16:42',a:'hfm',ins:'EURUSD',side:'Buy',lots:1,en:'1',ex:'1',pl:262.8},
 {day:29,t:'10:15',a:'ic',ins:'XAUUSD',side:'Sell',lots:.2,en:'1',ex:'1',pl:178.6},{day:28,t:'14:27',a:'ex',ins:'BTCUSD',side:'Buy',lots:.05,en:'1',ex:'1',pl:26.25},
 {day:27,t:'09:48',a:'ic',ins:'GBPJPY',side:'Buy',lots:.3,en:'1',ex:'1',pl:89.4},{day:27,t:'08:03',a:'xm',ins:'US500',side:'Buy',lots:1,en:'1',ex:'1',pl:-131.8},
 {day:26,t:'18:30',a:'hfm',ins:'XAUUSD',side:'Buy',lots:.1,en:'1',ex:'1',pl:-68.7},{day:25,t:'15:55',a:'ex',ins:'GBPUSD',side:'Sell',lots:.4,en:'1',ex:'1',pl:-66},
 {day:20,t:'11:12',a:'xm',ins:'EURUSD',side:'Sell',lots:.5,en:'1',ex:'1',pl:145.4},{day:17,t:'13:40',a:'ic',ins:'XAUUSD',side:'Buy',lots:.2,en:'1',ex:'1',pl:-142.2},
 {day:12,t:'10:05',a:'hfm',ins:'GBPUSD',side:'Buy',lots:.5,en:'1',ex:'1',pl:118.5},{day:8,t:'19:22',a:'ex',ins:'BTCUSD',side:'Sell',lots:.05,en:'1',ex:'1',pl:-38.75},
 {day:3,t:'15:10',a:'ic',ins:'GBPJPY',side:'Sell',lots:.3,en:'1',ex:'1',pl:96.3},{id:'m1',day:28,t:'13:05',a:'xm',ins:'EURUSD',side:'Sell',lots:.2,en:'1',ex:'1',pl:42,src:'manual'}];
CLOSED.forEach(function(c,i){ if(!c.id) c.id='c'+i; if(!c.src) c.src=c.a==='xm'?'statement':'api'; });
var SRC={api:'API',statement:'API (daily)',manual:'Manual'};
var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DAYS=[];(function(){var t0=Date.UTC(2026,9,25);for(var i=0;i<31;i++){var d=new Date(t0+i*864e5);DAYS.push(d.getUTCDate()+' '+MONTHS[d.getUTCMonth()]);}})();
var INS={EURUSD:{fx:['EUR','USD'],cls:'Forex'},GBPJPY:{fx:['GBP','JPY'],cls:'Forex'},XAUUSD:{fx:['XAU','USD'],cls:'Metals'},US500:{fx:null,cls:'Indices'},BTCUSD:{fx:['BTC','USD'],cls:'Crypto'}};
var CCY={USD:'US Dollar',XAU:'Gold',EUR:'Euro',GBP:'Pound',JPY:'Yen',BTC:'Bitcoin'};
var PORT=ACC.filter(function(a){return a.status!=='none';}).map(function(a){return {id:'a-'+a.id,name:a.broker+' ••'+a.no,col:'#5945f1',acc:[a.id],acctPf:true};});
function acc(id){for(var i=0;i<ACC.length;i++)if(ACC[i].id===id)return ACC[i];return null;}
function f2(n){return Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function usd(n){return (n<0?'−$':'$')+f2(n);} function sgn(n){return (n<0?'−$':'+$')+f2(n);}
function usd0(n){return (n<0?'−$':'$')+Math.round(Math.abs(n)).toLocaleString('en-US');} function sgn0(n){return (n<0?'−$':'+$')+Math.round(Math.abs(n)).toLocaleString('en-US');}
function k1(n){return (n<0?'−$':'$')+(Math.abs(n)/1000).toFixed(1)+'k';} function sk1(n){return (n<0?'−$':'+$')+(Math.abs(n)/1000).toFixed(1)+'k';}
function pct(n){return Math.round(n)+'%';} function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function plc(n){return n<0?'neg':'pos';} function accName(a){return a.broker+' ••'+a.no;} function mlvl(a){return a.mu?a.eq/a.mu*100:null;} function reporting(a){return a.status!=='none';}
function logo(b,sm){return '<span class="lg'+(sm?' sm':'')+'">'+b.slice(0,2)+'</span>';}
function uniq(arr){var o=[],s={};arr.forEach(function(x){if(!s[x]){s[x]=1;o.push(x);}});return o;}
function sumOf(list,k){var t=0;list.forEach(function(x){t+=x[k]||0;});return Math.round(t*100)/100;}
function r2(n){return Math.round(n*100)/100;} var DASH='<span class="mut">—</span>';
function pdir(p){return p.side==='Buy'?'long':'short';} function cdir(c){return c.side==='Buy'?'long':'short';}
function dirName(d){return d==='long'?'Long':d==='short'?'Short':'All directions';}
function pdirCell(p){var d=pdir(p);return '<span class="side '+(d==='long'?'buy':'sell')+'" data-dir="'+d+'">'+dirName(d)+'</span>';}
function cdirCell(c){var d=cdir(c);return '<span class="side" data-dir="'+d+'">'+dirName(d)+'</span>';}
var S={on:true,tab:'compare',scope:'all',range:'1M',ptab:'open',posF:{broker:'',ins:'',status:'',acc:'',dir:''},mon:{view:'currency',ccy:'USD',open:{},dir:''},sync:{},cr:{mode:'latest',s:24,e:30},dtSet:false,cmpView:'ml',cmpDir:'',cmpExact:true,pf:'all',pfDir:'',pfView:'main',panel:null,drawer:null,dtab:'overview',dload:false};
function rangeOK(){return true;} function rangeStart(){return S.range==='custom'?S.cFrom:0;} function rangeEnd(){return S.range==='custom'?S.cTo:30;}
function closedIn(ids){var s=rangeStart(),e=rangeEnd();return CLOSED.filter(function(c){return ids.indexOf(c.a)>=0&&c.day>=s&&c.day<=e;}).sort(function(x,y){return y.day-x.day||(y.t>x.t?1:-1);});}
function rangeName(){return S.range;}
function snapTime(a){return a.status==='stale'?a.snap:DAYS[30]+' '+a.snap.replace('Today ','');}
function crLatest(){return S.cr.mode==='latest';} function crEnd(){return S.cr.mode==='custom'?S.cr.e:30;}
function lastDay(a){return a.status==='stale'?27:30;}
function snapAt(a){ if(a.status==='none')return {kind:'none'}; var last=lastDay(a),e=crLatest()?30:crEnd(); if(e>=last) return {kind:crLatest()?(a.status==='live'?'latest':'lastknown'):(e===last?'asof':'lastknown'),day:last,time:snapTime(a),eq:a.eq,pl:a.pl,mu:a.mu,npos:POS.filter(function(p){return p.a===a.id;}).length,sim:false}; return {kind:'asof',day:e,time:DAYS[e]+' 23:59',eq:a.eq,pl:a.pl,mu:a.mu,npos:null,sim:true}; }
function snapHead(){return crLatest()?'Latest snapshots':'As of '+DAYS[crEnd()]+' 2026';}
function setDate(mode,s,e){S.dtSet=true;S.cr={mode:mode,s:s,e:e};}
var root=document.createElement('div');root.id='mb-root';document.body.appendChild(root);
function toast(){}

var FB_TABS={overview:1,monitor:1,compare:1,portfolios:1};
function pfAccounts2(){} function scopeAccounts(){ if(S.scope==='all')return ACC.slice(); if(S.scope.indexOf('b:')===0){var b=S.scope.slice(2);return ACC.filter(function(a){return a.broker===b;});} return ACC.filter(function(a){return a.id===S.scope.slice(2);}); }
function scopeName(){ return S.scope==='all'?'All accounts':S.scope.indexOf('b:')===0?S.scope.slice(2):accName(acc(S.scope.slice(2))); }
function port(id){for(var i=0;i<PORT.length;i++)if(PORT[i].id===id)return PORT[i];return null;}
function curDir(){return S.tab==='monitor'?S.mon.dir:S.tab==='portfolios'?S.pfDir:S.tab==='compare'?S.cmpDir:S.posF.dir;}
function setDir(v){v=v||'';S.posF.dir=v;S.mon.dir=v;S.pfDir=v;S.cmpDir=v;}
function statusPill(a){return '<span class="pill">'+a.status+'</span>';}
function rangeLabel(){return '25 Oct – 24 Nov 2026';}
function fbar(){ return '<div class="fbar" data-filter-bar><label class="fbf"><span>Accounts</span><select data-a="fscope"><option value="all">All</option>'+ACC.map(function(a){return '<option value="a:'+a.id+'"'+(S.scope==='a:'+a.id?' selected':'')+'>'+accName(a)+'</option>';}).join('')+'</select></label><div class="fbf"><span>Direction</span><span class="seg">'+[['','All'],['long','Long'],['short','Short']].map(function(x){return '<button data-a="hdir" data-v="'+x[0]+'" class="'+(curDir()===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</span></div></div><div class="fbsum show-m" data-fb-summary>x</div>'; }
function noteFor(){return '';}
function overviewAccount(){var a=acc(S.scope.slice(2));return '<div class="g4"><div data-metric="equity">'+usd(a.eq)+'</div><div data-metric="margin">'+usd(a.mu)+'</div></div>'+positionsCard4();}
function monToolbar(){var v=S.mon.view;return '<div class="mtool mb16"><span class="seg">'+[['tiles','Tiles'],['holdings','Holdings'],['matrix','Matrix'],['map','Map'],['currency','Currency'],['alerts','Alerts <i class="cnt">2</i>']].map(function(o){return '<button data-a="mview" data-v="'+o[0]+'" class="'+(v===o[0]?'on':'')+'" aria-selected="'+(v===o[0])+'">'+o[1]+'</button>';}).join('')+'</span><button class="btn sm" data-a="mexport">Export</button></div>';}
function monHoldings(){return '<div data-section="mon-holdings" data-hold-ids="'+mPosD().map(function(p){return p.id;}).join(',')+'">'+mPosD().length+' legs</div>';}
function monMatrix(){return '<table data-matrix>'+mPosD().map(function(p){return '<tr data-mx="'+p.id+'"><td>'+p.ins+'</td><td>'+p.pl+'</td></tr>';}).join('')+'</table>';} function monMap(){return '<div data-map>'+mPosD().map(function(p){return '<i data-mp="'+p.id+'">'+p.ins+' '+p.pl+'</i>';}).join('')+'</div>';} function monTiles(){return '<div class="card pad" data-tiles>tiles</div>';} function monAlertsView(){return '<div class="card pad" data-alerts><div class="ch"><h3>Alerts</h3></div>alert rules</div>';}
function pfBar(){return '';}
function posPanel(pn){var L=pn.ids.map(function(id){return POS.filter(function(p){return p.id===id;})[0];}),net=0,pl=0;L.forEach(function(p){net+=p.usd;pl+=p.pl;});return '<div class="ov" data-a="pclose"></div><aside class="drw" data-pos-panel><div class="dh"><div><b>'+esc(pn.title)+'</b><div class="mut" data-pp-sub>'+L.length+' position'+(L.length>1?'s':'')+' · net '+sk1(net)+' · P/L '+sgn(Math.round(pl*100)/100)+'</div></div></div><div class="db">'+L.map(function(p){return '<div class="ppos" data-ppos="'+p.id+'">'+p.ins+'</div>';}).join('')+'</div></aside>';}

var BMETA={'HFM':{stop:50},'IC Markets':{stop:50},'XM':{stop:20},'Exness':{stop:0}};
var PX={p1:{sl:'SL 42 pips'},p2:{sl:null},p3:{sl:'SL 12 pts'},p4:{sl:'SL 18.4 pips'},p5:{sl:'SL 65 pips'},p6:{sl:'SL $1,200'},p7:{sl:'SL 30 pips'},p8:{sl:'SL $900'}};
var DEPS={hfm:[['Deposit',10000,'2 Sep 2026'],['Withdrawal',-1500,'30 Oct 2026']],ic:[['Withdrawal',-500,'15 Nov 2026']],ex:[['Deposit',300,'10 Nov 2026']]};
var EQ={};ACC.forEach(function(a,k){if(a.status==='none')return;var e=[];for(var i=0;i<31;i++)e.push(a.status==='stale'&&i>27?null:Math.round((a.eq*(0.97+0.03*i/30)+Math.sin(i*1.3+k)*a.eq*0.01)*100)/100);e[30]=a.status==='stale'?null:a.eq;EQ[a.id]=e;});
function series(ids){var out=[];for(var i=0;i<31;i++){var t=0;ids.forEach(function(id){var s=EQ[id];if(!s)return;var v=s[i];if(v==null){for(var j=i;j>=0;j--)if(s[j]!=null){v=s[j];break;}}t+=v||0;});out.push(Math.round(t*100)/100);}return out;}
function dayIdx(str){var p=str.split(' '),m=MONTHS.indexOf(p[1]);return Math.round((Date.UTC(+p[2]||2026,m,+p[0])-Date.UTC(2026,9,25))/864e5);}
function syncDerived(){}
function mPosD(){return mPos().filter(function(p){return !S.mon.dir||pdir(p)===S.mon.dir;});}
function pfPositions(ids){var L=POS.filter(function(p){return ids.indexOf(p.a)>=0&&(!S.pfDir||pdir(p)===S.pfDir);});return '<div class="card" data-section="pf-positions">'+L.length+' rows</div>';}
/* compare (markers as in v9) */
function cmpRow(a,sn,mode,scale){var head='<span class="crow-acc"><b>'+esc(accName(a))+'</b></span><span class="crow-st"></span>';
 if(sn.kind==='none')return '<div class="crow9" data-cmp-row="'+a.id+'">'+head+'<span class="crow-viz"><span class="nosnap">No snapshot</span></span><span class="crow-val vnum">'+DASH+'</span></div>';
 return '<div class="crow9" data-cmp-row="'+a.id+'">'+head+'<span class="crow-viz"><span class="vtrack"><i style="width:40%;background:#5945f1"></i></span></span><span class="crow-val vnum" data-cmp-val="'+a.id+'"><b>'+sgn(sn.pl)+'</b></span></div>';}
function cmpExact(list,SN){var cell=function(a){var sn=SN[a.id];if(sn.kind==='none')return DASH;return sn.npos==null?'<span class="na-inline">Not recorded<small>No position history in demo</small></span>':String(sn.npos);};
 var mobile='<div class="show-m" data-cmp-mobile>'+list.map(function(a){return '<div class="mcard" data-mcard="'+a.id+'"><b>'+accName(a)+'</b><div class="kv"><span>Equity</span><b>x</b></div><div class="kv"><span>Open positions</span><b>'+cell(a)+'</b></div><div class="kv"><span>Last sync</span><b>y</b></div></div>';}).join('')+'</div>';
 return mobile+'<div class="hide-m"><table class="cmp"><tbody><tr data-xrow="np"><th>Open positions</th>'+list.map(function(a){return '<td class="v num" data-x="np:'+a.id+'">'+cell(a)+'</td>';}).join('')+'</tr></tbody></table></div>';}
function compareView(){var list=ACC.slice(),SN={};list.forEach(function(a){SN[a.id]=snapAt(a);});return '<div class="card pad" data-section="compare" style="height:1400px"><div data-panel="rows">'+list.map(function(a){return cmpRow(a,SN[a.id],S.cmpView,1);}).join('')+'</div>'+(S.cmpExact?'<div data-exact>'+cmpExact(list,SN)+'</div>':'')+'</div>';}
/* monitor (v5 monCurrency verbatim core) */
function mPorts(){return PORT.slice();} function mPos(){return POS.slice();} function mAccIds(){return ACC.filter(reporting).map(function(a){return a.id;});}
function posPorts(p){return PORT.filter(function(q){return q.acc.indexOf(p.a)>=0;});}
function ccyExposure(list){var m={},gl={},gs={},add=function(c,v){m[c]=(m[c]||0)+v;if(v>0)gl[c]=(gl[c]||0)+v;else gs[c]=(gs[c]||0)+v;};list.forEach(function(p){var f=INS[p.ins].fx;if(!f)return;add(f[0],p.usd);add(f[1],-p.usd);});return Object.keys(m).map(function(k){return {c:k,v:Math.round(m[k]),gl:Math.round(gl[k]||0),gs:Math.round(gs[k]||0)};}).sort(function(a,b){return Math.abs(b.v)-Math.abs(a.v);});}
function monCurrency(){var pos=mPos(),list=ccyExposure(pos);if(!list.some(function(x){return x.c===S.mon.ccy;}))S.mon.ccy=list[0].c;
 var rows=list.map(function(x){return '<button class="crow" data-a="mccy" data-v="'+x.c+'" data-ccy="'+x.c+'">'+x.c+' '+sk1(x.v)+'</button>';}).join('');
 var c=S.mon.ccy,contrib=pos.filter(function(p){var f=INS[p.ins].fx;return f&&f.indexOf(c)>=0;}),sgnFor=function(p){return INS[p.ins].fx[0]===c?p.usd:-p.usd;},total=0;contrib.forEach(function(p){total+=sgnFor(p);});
 var sel=list.filter(function(x){return x.c===c;})[0];
 return '<div class="card pad mb16" data-section="mon-currency">'+rows+'</div><div class="g12r mb16"><div class="card pad" data-section="ccy-breakdown"><table><tbody><tr class="mfoot"><td>Total</td><td class="r"><b data-ccy-total>'+sk1(total)+'</b></td></tr></tbody></table></div><div class="card pad mside"><b class="mid">'+sk1(sel.v)+'</b></div></div>';}
function monKpis(){var k=function(l,v,sub,attr){return '<div><span class="l5">'+l+'</span><b '+(attr||'')+'>'+v+'</b><small>'+sub+'</small></div>';};return '<div class="card mkpi" data-section="mon-kpis">'+k('Total equity','$1','x','data-mon="equity"')+k('Open P/L','<span>+$1</span>','8 open','data-mon="openpl"')+'</div>';}
function holdGroups(){return uniq(POS.map(function(p){return p.ins;})).map(function(k){return {k:k};});}
function monitor(){return monKpis()+(S.mon.view==='currency'?monCurrency():'<div class="card" data-section="mon-holdings">holdings '+JSON.stringify(S.mon.open)+'</div>');}
/* overview */
function brokerAccs(b){return ACC.filter(function(a){return a.broker===b;});}
function accCard4(b){var list=brokerAccs(b),a=list.filter(reporting)[0],np=POS.filter(function(p){return p.a===a.id;}).length;return '<div class="acard" data-card="'+a.id+'"><div class="kvr"><span>Margin level</span><b>1%</b></div><div class="kvr"><span>Open positions</span><b>'+np+' open position'+(np===1?'':'s')+'</b></div></div>';}
function summary4(){var rep=ACC.filter(reporting);return '<div class="card sum4 mb16" data-section="summary"><div><div class="lbl">Total equity</div><div class="big num">$1</div><div class="lbl" style="margin-top:10px">Aggregated in USD across '+rep.length+' reporting accounts</div></div><div class="covrow"><span class="lbl" data-metric="coverage">'+rep.length+' of '+ACC.length+' accounts reporting</span></div></div>';}
function posMatch(p){var f=S.posF,sc=S.scope.indexOf('a:')===0?S.scope.slice(2):'';return (!f.ins||p.ins===f.ins)&&(!f.acc||p.a===f.acc)&&(!sc||p.a===sc)&&(!f.dir||pdir(p)===f.dir);}
function positionsCard4(){var open=POS.filter(posMatch),body;if(S.ptab==='open')body=open.length?'<div style="overflow-x:auto"><table class="num ptab" data-table="positions"><tbody>'+open.map(function(x){return '<tr data-row="pos"><td>'+x.ins+'</td></tr>';}).join('')+'</tbody></table></div><div class="pfoot">foot</div>':'<div class="mut" style="padding:22px;text-align:center">No positions match these filters</div>';else body='<div>other</div>';
 return '<div class="card pad mb16" data-section="trades"><div class="ch"><div class="ctl"><div class="seg"><button data-a="ptab" data-v="open">Open ('+open.length+')</button></div><span class="lbl" data-pos-summary>'+open.length+' of '+POS.length+' open positions</span></div><div class="ctl rel"><button class="btn sm" data-a="fopen">Filter</button></div></div>'+body+'</div>';}
function overview(){if(S.scope.indexOf('a:')===0)return overviewAccount();return summary4()+'<div class="cards5">'+BROKERS.map(function(b){return accCard4(b.id);}).join('')+'</div><div style="height:900px"></div>'+positionsCard4();}
/* portfolios */
function pfAccounts(){return scopeAccounts().map(function(a){return a.id;});}
function pfTradePred(c){return (!S.pfDir||cdir(c)===S.pfDir);}
function pfTrades(){return closedIn(pfAccounts()).filter(pfTradePred);}
function pfLabel(){return 'All portfolios';}
function closedTable(ids,label,pred){var rows=closedIn(ids).filter(pred||function(){return true;}),tot=sumOf(rows,'pl');return '<div class="lbl" data-trades-caption>'+esc(label)+' · <b data-trade-count>'+rows.length+'</b> trades</div><table data-table="closed"><tbody>'+rows.map(function(x){return '<tr data-row="closed" data-dir="'+cdir(x)+'"><td>'+x.ins+'</td></tr>';}).join('')+'</tbody></table><div class="tfoot"><b data-total="realized">'+sgn(tot)+'</b></div>';}
function analyticsView(tr,label){return '<div class="card pad mb16" data-section="analytics"><div class="ch"><h3>Analytics</h3><span data-sample>n = '+tr.length+'</span></div><div class="agrid"><div class="am">win</div></div></div>';}
function portfolios(){if(S.pfView==='analytics')return '<div class="ch"><button class="lnk" data-a="pfmain">Back</button></div>'+analyticsView(pfTrades(),pfLabel());return '<div style="height:600px">kpis</div><div class="card pad mb16" data-section="pf-closed"><div class="ch"><h3>Closed trades</h3></div>'+closedTable(pfAccounts(),pfLabel(),pfTradePred)+'</div>';}
/* manage + drawer */
POS.push({id:'s1',a:'sx1',ins:'XAUUSD',side:'Buy',lots:0.05,en:'2,641.37',cu:'2,643.85',pl:12.4,m:132,usd:13219,opened:'2 min'});ACC.push({id:'sx2',broker:'Pepperstone',nick:'Razor',plat:'MT5',no:'6112',status:'live',snap:'Today 11:58',ago:'just now',bal:2500,eq:2512.4,pl:12.4,mu:132,today:12.4,sim:true});POS.push({id:'s2',a:'sx2',ins:'XAUUSD',side:'Buy',lots:0.05,en:'2,641.37',cu:'2,643.85',pl:12.4,m:132,usd:13219,opened:'2 min'});ACC.push({id:'sx1',broker:'Exness',nick:'Swing',plat:'MT5',no:'5530',status:'live',snap:'Today 11:58',ago:'just now',bal:2500,eq:2512.4,pl:12.4,mu:132,today:12.4,partnerId:'EXN-PA-1',server:'x',sim:true});
function manage(){var how={hfm:'Partner API',hfm2:'Partner API',ic:'Partner API',ic2:'Partner API',xm:'Partner API',ex:'Partner API'};
 var rows=ACC.map(function(a){return '<tr data-manage-row="'+a.id+'"><td>'+logo(a.broker)+' <b>'+esc(a.broker)+'</b> · '+esc(a.nick)+' <span class="mut">••'+a.no+'</span></td><td>'+how[a.id]+'</td><td><span class="pill">st</span></td><td data-sync="'+a.id+'">'+(a.status==='none'?'Never':a.snap)+'</td><td class="r"><button class="btn sm" data-a="open" data-v="'+a.id+'">Details</button></td></tr>';}).join('');
 return '<div class="card pad"><table data-table="manage"><thead><tr><th>Account</th><th>Connection</th><th>Status</th><th>Last sync</th><th class="r">Actions</th></tr></thead><tbody>'+rows+'<tr><td>FxPro</td><td>—</td><td><span class="pill p-gr">Not a partner broker</span></td><td class="mut">Never</td><td></td></tr></tbody></table></div>';}
function drawer(id){var a=acc(id);var head='<div class="dh"><b>'+accName(a)+'</b><button class="btn sm" data-a="close">✕</button></div>';
 if(a.status==='none')return '<div class="ov" data-a="close"></div><aside data-dr class="drw" role="dialog">'+head+'<div class="db"><div class="alert wa" data-unavail>No snapshot yet</div></div></aside>';
 return '<div class="ov" data-a="close"></div><aside data-dr class="drw" role="dialog" data-drawer="'+a.id+'">'+head+'<div class="db"><div class="seg dtabs"><button data-a="dtab" data-v="overview">Overview</button><button data-a="dtab" data-v="history">History</button></div><section>meter</section></div></aside>';}
/* alerts (v20 alNoteHtml) */
var NOTES=[{id:'n1',kind:'fill',acc:'hfm',ins:'EURUSD',side:'Buy',size:.5,price:1.0863,deal:'50190',time:'24 Nov 12:10',sim:true},{id:'n2',kind:'fill',acc:'hfm',ins:'XAUUSD',side:'Sell',size:.1,price:2644.1,deal:'50191',time:'24 Nov 12:11',sim:true}];
function alStore(){return {notes:NOTES};}
function alNoteHtml(n){var a=acc(n.acc),head='<b>'+n.ins+' '+n.side+' '+n.size.toFixed(2)+' lots filled</b>',body='Fill price '+n.price+' · '+esc(n.time)+' · '+esc(accName(a))+' · deal '+esc(n.deal);return '<div class="alnote unread" data-al-note="'+n.id+'" data-kind="'+n.kind+'"><div>Trade Fill Alert'+(n.sim?' <span class="tag">simulated event</span>':'')+'</div>'+head+'<div class="lbl">'+body+'</div></div>';}
function alerts(){return '<div class="card pad" data-section="al-notes"><h3>Notifications</h3>'+NOTES.map(function(n){return alNoteHtml(n);}).join('')+'</div>';}
function render(){syncDerived();var t=S.tab,body=t==='compare'?compareView():t==='monitor'?(S.mon.view==='alerts'?alerts():monitor()):t==='overview'?overview():t==='portfolios'?portfolios():manage();
 root.innerHTML='<div class="wrap" data-tab="'+t+'">'+(FB_TABS[t]?fbar()+noteFor(t):'')+body+'</div>'+(S.drawer?drawer(S.drawer):'')+(S.panel?posPanel(S.panel):'');}
var H7={hdir:function(el,v){setDir(v);render();},pclose:function(){S.panel=null;render();},open:function(el,v){S.drawer=v;S.panel=null;S.dtab='overview';render();},close:function(){S.drawer=null;render();},mccy:function(el,v){S.mon.ccy=v;render();},dtab:function(el,v){S.dtab=v;render();},rsync:function(){},pfanalytics:function(){S.pfView='analytics';render();},pfmain:function(){S.pfView='main';render();},mview:function(el,v){S.mon.view=v;render();},mexport:function(){}};
root.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a]');if(!el||!root.contains(el))return;var a=el.getAttribute('data-a'),h=H7[a];if(!h)return;e.stopPropagation();e.preventDefault();h(el,el.getAttribute('data-v'),e);},true);
function activate(){}

/* ============================ v25 · From a summary number to the positions behind it ============================
   Compare: Open positions count (Exact numbers), Open P/L bar and Exposure bar open an account positions panel
   (side panel on desktop, sheet on mobile). Closing it restores selection, metric, filters and scroll.
   Monitor › Currency: Exposure | Open positions toggle; Open P/L card opens Holdings with the active filters.
   Overview: "N open positions" opens Trade Tracker › Open for that account; coverage line names missing / last-known
   accounts. Portfolios › Analytics: Long vs Short net realized P/L bars that filter the Closed trades table.
   Manage: per-feed data status in Account details; no undefined Connection values. Alerts: View position / View trade.
   Wrappers below call the earlier functions and add to their output, so earlier behaviour stays as it was. */
S.dd = null; S.mon.ccyView = 'exposure'; S.ovLatest = false; S.ovCov = false; S.pfSide = '';

/* ---------- shared positions panel ---------- */
function ddPos(a, dir) { return POS.filter(function (p) { return p.a === a.id && (!dir || pdir(p) === dir); }); }
function ddSynced(a) { return S.sync[a.id] === 'done' ? 'just now' : snapTime(a); }
function ddWhen(a) { return a.status === 'stale' ? 'Last known at ' + snapTime(a) : 'Latest · synced ' + ddSynced(a); }
function ovHist() { return S.tab === 'overview' && S.dtSet && S.cr && S.cr.mode === 'custom' && S.cr.e < 30; }
function ddState(d) {
  var a = acc(d.acc);
  if (!a || a.status === 'none') return { kind: 'unavail' };
  if (d.src === 'cmp' && !d.latest) { var sn = snapAt(a); if (sn.kind === 'none' || sn.sim) return { kind: 'nosnap', day: crEnd() }; }
  return { kind: 'ok' };
}
function ddRow(p, ex, focus) {
  var side = dirName(pdir(p)), xs = (p.usd < 0 ? 'Short ' : 'Long ') + usd0(Math.abs(p.usd));
  return '<div class="ddrow' + (ex ? ' x' : '') + (focus === p.id ? ' on' : '') + '" data-dd-row="' + p.id + '"><span class="c1"><b>' + p.ins + '</b><small class="show-m">' + side + ' · ' + p.lots.toFixed(2) + ' lots' + (ex ? ' · ' + xs : '') + '</small></span>' +
    '<span class="hide-m">' + pdirCell(p) + '</span><span class="hide-m r">' + p.lots.toFixed(2) + ' lots</span>' + (ex ? '<span class="hide-m r" data-dd-exp="' + p.id + '">' + xs + '</span>' : '') +
    '<span class="r ' + plc(p.pl) + '"><b>' + sgn(p.pl) + '</b></span></div>';
}
function ddPanel() {
  var d = S.dd, a = acc(d.acc); if (!a) return '';
  var st = ddState(d), dir = d.src === 'cmp' ? S.cmpDir : '', ex = d.metric === 'ex', body = '';
  var what = { np: 'Open positions', pl: 'Open P/L', ex: 'Exposure' }[d.metric] || 'Open positions';
  var ctx = d.src === 'cmp' ? 'Compare · ' + what + ' · ' + (d.latest ? 'Latest snapshot' : snapHead()) : d.src === 'note' ? 'From a notification · simulated fill' + (d.deal ? ' · deal ' + esc(d.deal) : '') : what;
  var head = '<div class="dh"><div style="display:flex;gap:10px;align-items:center">' + logo(a.broker) + '<div><b>' + esc(accName(a)) + ' · ' + esc(a.nick) + '</b><div class="mut" style="font-size:12px" data-dd-ctx>' + ctx + '</div></div></div><button class="btn sm" data-a="ddclose" data-dd-close aria-label="Close">✕</button></div>';
  if (d.trade) {
    var c = CLOSED.filter(function (x) { return x.id === d.trade; })[0];
    body = c ? '<div class="ddtrade" data-dd-trade="' + esc(c.id) + '"><div class="ch" style="margin-bottom:8px"><span><b>' + c.ins + '</b> ' + cdirCell(c) + '</span><b class="' + plc(c.pl) + '">' + sgn(c.pl) + '</b></div><div class="gg num"><div><small>Closed</small><b>' + DAYS[c.day] + ' · ' + c.t + '</b></div><div><small>Size</small><b>' + c.lots.toFixed(2) + ' lots</b></div><div><small>Entry → exit</small><b>' + c.en + ' → ' + c.ex + '</b></div><div><small>Source</small><b>' + esc(SRC[c.src] || c.src) + '</b></div></div></div><div class="lbl" style="margin-top:10px">This fill maps to a closed trade, so there’s no open position to show. Realized P/L is the trade’s, as in the Closed trades table.</div>' : '<div class="na">Trade not found</div>';
  } else if (st.kind === 'unavail') {
    body = '<div class="na" data-dd-unavail><b style="color:#171717">Position data unavailable</b><span>' + esc(a.reason || 'Partner sync failed') + '. Shown as unavailable, not as zero positions.</span><button class="btn sm" data-a="rsync" data-v="' + a.id + '">Retry sync</button></div>';
  } else if (st.kind === 'nosnap') {
    body = '<div class="na" data-dd-nosnap><b style="color:#171717">No position snapshot for ' + DAYS[st.day] + '</b><span>The demo records positions at each sync only. Equity and margin for this date are simulated, but which positions were open isn’t known.</span><button class="btn sm pri" data-a="ddlatest">View latest</button></div>';
  } else {
    var L = ddPos(a, dir), pl = r2(sumOf(L, 'pl')), lo = 0, sh = 0; L.forEach(function (p) { if (p.usd > 0) lo += p.usd; else sh -= p.usd; });
    var sum = '<div class="ddsum"><div><small>Open positions' + (dir ? ' · ' + dirName(dir) : '') + '</small><b data-dd-count>' + L.length + '</b></div><div><small>Unrealized P/L</small><b class="' + plc(pl) + '" data-dd-pl>' + sgn(pl) + '</b></div>' +
      (ex ? (dir !== 'short' ? '<div><small>Long exposure</small><b data-dd-xl>' + usd0(lo) + '</b></div>' : '') + (dir !== 'long' ? '<div><small>Short exposure</small><b data-dd-xs>' + usd0(sh) + '</b></div>' : '') + (dir ? '' : '<div><small>Net exposure</small><b data-dd-xn>' + (Math.round(lo - sh) === 0 ? '$0' : sgn0(lo - sh)) + '</b></div>') : '') + '</div>';
    var when = '<div class="lbl ddwhen" data-dd-when>' + (a.status === 'stale' ? '<span class="tag wa" style="margin:0 6px 0 0">Last known</span>' : '') + esc(ddWhen(a)) + (d.latest ? ' · selected date ' + DAYS[crEnd()] + ' has no position snapshot' : '') + (dir ? ' · ' + dirName(dir) + ' positions only (Direction filter)' : '') + '</div>';
    body = sum + when + (L.length ? '<div class="ddrows" data-dd-rows><div class="ddrow h' + (ex ? ' x' : '') + '"><span>Symbol</span><span class="hide-m">Side</span><span class="hide-m r">Size</span>' + (ex ? '<span class="hide-m r">Exposure</span>' : '') + '<span class="r">Unrealized P/L</span></div>' + L.map(function (p) { return ddRow(p, ex, d.focus); }).join('') + '</div>'
      : '<div class="na" data-dd-empty style="min-height:120px"><b style="color:#171717">No open positions</b><span>The positions feed synced ' + esc(ddSynced(a)) + ' and returned none' + (dir ? ' for ' + dirName(dir).toLowerCase() + ' positions' : '') + '.</span></div>');
  }
  var foot = '<div class="ddfoot"><button class="lnk" data-a="ddacct" data-v="' + a.id + '">Account details →</button>' + (d.src === 'cmp' ? '<span class="lbl">Closing returns to the same comparison</span>' : '') + '</div>';
  return '<div class="ov" data-a="ddclose"></div><aside class="drw ddp" role="dialog" aria-modal="true" aria-label="' + esc(accName(a)) + ' · ' + what + '" data-dd-panel="' + a.id + '" data-dd-src="' + d.src + '">' + head + '<div class="db">' + body + foot + '</div></aside>';
}
function ddOpen(o) {
  o.scroll = root.scrollTop; o.tab = S.tab; S.cmpSelOpen = false; S.crOpen = false; S.fbDate = false; S.panel = null; S.drawer = null; S.alPop = [];
  S.dd = o; render(); root.scrollTop = o.scroll;
  var b = root.querySelector('[data-dd-close]'); if (b) try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
}
var _render25 = render;
render = function () {
  if (S.dd && S.dd.tab !== S.tab) S.dd = null;
  _render25();
  if (S.dd) { try { root.insertAdjacentHTML('beforeend', ddPanel()); } catch (err) { S.dd = null; } }
};
H7.ddclose = function () {
  var d = S.dd; if (!d) return; S.dd = null; render(); root.scrollTop = d.scroll;
  var t = d.ret && root.querySelector(d.ret); if (t) try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
};
H7.ddlatest = function () { if (!S.dd) return; S.dd.latest = true; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.ddacct = function (el, v) { S.dd = null; H7.open(el, v); };
var _activate25 = activate;
activate = function () { S.dd = null; return _activate25.apply(null, arguments); };
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.on && S.dd) { e.stopPropagation(); H7.ddclose(); } }, true);
root.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var t = e.target; if (!t || !t.getAttribute || /^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(t.tagName)) return;
  if (t.getAttribute('role') === 'button' && t.getAttribute('data-a')) { e.preventDefault(); t.click(); }
});

/* ---------- 1 · Compare ---------- */
var _cmpRow25 = cmpRow;
cmpRow = function (a, sn, mode, scale) {
  var h = _cmpRow25(a, sn, mode, scale);
  if (mode !== 'pl' && mode !== 'ex') return h;
  return h.replace('<span class="crow-viz">', '<span class="crow-viz cdrill" data-a="cpos" data-v="' + a.id + '|' + mode + '" role="button" tabindex="0" title="Show the positions behind this bar" aria-label="Show ' + (mode === 'pl' ? 'open P/L' : 'exposure') + ' positions for ' + esc(accName(a)) + '">');
};
var _cmpExact25 = cmpExact;
cmpExact = function (list, SN, PD) {
  var btn = function (id, v) { return '<button class="cnum" data-a="cpos" data-v="' + id + '|np" aria-label="Show open positions for ' + esc(accName(acc(id))) + '">' + v + '<span class="cgo" aria-hidden="true"> ›</span></button>'; };
  return _cmpExact25(list, SN, PD)
    .replace(/(<td class="v num" data-x="np:([^"]+)">)((?:(?!<\/td>)[\s\S])*)(<\/td>)/g, function (m, o, id, v, c) { return o + btn(id, v) + c; })
    .replace(/(<div class="mcard" data-mcard="([^"]+)">(?:(?!data-mcard=)[\s\S])*?<span>Open positions<\/span><b>)((?:(?!<\/b><\/div>)[\s\S])*)(<\/b><\/div>)/g, function (m, o, id, v, c) { return o + btn(id, v) + c; });
};
H7.cpos = function (el, v) { var x = v.split('|'); ddOpen({ acc: x[0], src: 'cmp', metric: x[1], ret: '[data-a="cpos"][data-v="' + v + '"]' }); };

/* ---------- 2 · Monitor › Currency ---------- */
function ccyPositions(c) {
  var pos = mPos().filter(function (p) { var f = INS[p.ins] && INS[p.ins].fx; return f && f.indexOf(c) >= 0; });
  var con = function (p) { return INS[p.ins].fx[0] === c ? p.usd : -p.usd; }, tot = 0, pl = 0;
  pos.sort(function (x, y) { return Math.abs(con(y)) - Math.abs(con(x)); });
  pos.forEach(function (p) { tot += con(p); pl += p.pl; });
  var cx = function (v) { return '<span class="cdirx ' + (v < 0 ? 'neg' : 'pos') + '">' + (v < 0 ? 'Short ' : 'Long ') + c + '</span> <b>' + sgn0(v) + '</b>'; };
  var why = function (p) { var f = INS[p.ins].fx, base = f[0] === c; return dirName(pdir(p)) + ' ' + p.ins + ' → ' + (con(p) < 0 ? 'short ' : 'long ') + c + ' (' + c + ' is the ' + (base ? 'base' : 'quote') + ' currency)'; };
  var rows = pos.map(function (p) { var a = acc(p.a), v = con(p); return '<tr class="click" data-a="open" data-v="' + a.id + '" data-ccy-pos="' + p.id + '"><td>' + logo(a.broker, true) + ' ' + esc(accName(a)) + (a.status === 'stale' ? ' <span class="tag wa">Last known</span>' : '') + '</td><td><b>' + p.ins + '</b></td><td>' + pdirCell(p) + '</td><td class="r">' + p.lots.toFixed(2) + '</td><td class="r" data-ccy-con="' + p.id + '" title="' + esc(why(p)) + '">' + cx(v) + '</td><td class="r ' + plc(p.pl) + '">' + sgn(p.pl) + '</td></tr>'; }).join('');
  var cards = pos.map(function (p) { var a = acc(p.a), v = con(p); return '<div class="ccyc" data-ccy-card="' + p.id + '"><div class="ccyc1"><b>' + p.ins + '</b> ' + pdirCell(p) + ' <span class="mut">' + p.lots.toFixed(2) + ' lots</span><span class="' + plc(p.pl) + '" style="margin-left:auto">' + sgn(p.pl) + '</span></div><div class="ccyc2">' + cx(v) + '</div><div class="lbl">' + esc(accName(a)) + ' · ' + esc(why(p)) + '</div></div>'; }).join('');
  return '<div class="card pad" data-section="ccy-positions"><div class="ch"><div><h3>' + c + ' · open positions</h3><div class="lbl">Trade side is the position’s direction. ' + c + ' exposure is the effect on your ' + c + ': a long EURUSD is short USD.</div></div><span class="pill p-pu">' + c + ' ' + sk1(tot) + '</span></div>' +
    (pos.length ? '<div class="hide-m" style="overflow-x:auto"><table class="num" data-table="ccy-positions"><thead><tr><th>Account</th><th>Instrument</th><th>Trade side</th><th class="r">Size (lots)</th><th class="r">' + c + ' exposure</th><th class="r">Unrealized P/L</th></tr></thead><tbody>' + rows +
      '<tr class="mfoot"><td colspan="4"><b>Total net ' + c + '</b> <span class="mut">· ' + pos.length + ' position' + (pos.length === 1 ? '' : 's') + ' · matches the ' + c + ' bar above</span></td><td class="r"><b class="' + (tot < 0 ? 'neg' : 'pos') + '" data-ccy-pos-total>' + sk1(tot) + '</b></td><td class="r ' + plc(pl) + '"><b>' + sgn(r2(pl)) + '</b></td></tr></tbody></table></div><div class="show-m">' + cards + '<div class="kv" style="padding:8px 2px"><b>Total net ' + c + '</b><b class="' + (tot < 0 ? 'neg' : 'pos') + '">' + sk1(tot) + '</b></div></div>'
      : '<div class="na" style="min-height:110px">No open positions contribute to ' + c + ' in this scope.</div>') + '</div>';
}
var _monCur25 = monCurrency;
monCurrency = function () {
  var h = _monCur25(), i = h.indexOf('<div class="g12r mb16">'); if (i < 0) return h;
  var v = S.mon.ccyView === 'positions' ? 'positions' : 'exposure', c = S.mon.ccy;
  var tog = '<div class="ccytog mb16" data-ccy-toggle><span class="lbl">' + esc(c) + ' details</span><span class="seg" role="group" aria-label="Currency details">' + [['exposure', 'Exposure'], ['positions', 'Open positions']].map(function (x) { return '<button data-a="mccyview" data-v="' + x[0] + '" class="' + (v === x[0] ? 'on' : '') + '" aria-pressed="' + (v === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</span></div>';
  if (v !== 'positions') return h.slice(0, i) + tog + h.slice(i);
  var j = h.indexOf('<div class="card pad mside">');
  return h.slice(0, i) + tog + '<div class="g12r mb16">' + ccyPositions(c) + (j >= 0 ? h.slice(j) : '</div>');
};
H7.mccyview = function (el, v) { S.mon.ccyView = v; var k = root.scrollTop; render(); root.scrollTop = k; };
var _monKpis25 = monKpis;
monKpis = function () { return _monKpis25().replace('<div><span class="l5">Open P/L</span>', '<div class="mkgo" data-a="mopenpl" role="button" tabindex="0" title="Open Holdings with these filters"><span class="l5">Open P/L <span class="mkarr" aria-hidden="true">→ Holdings</span></span>'); };
H7.mopenpl = function () {
  S.mon.view = 'holdings'; S.mon.opt = false; S.mon.open = {};
  try { holdGroups().forEach(function (g) { S.mon.open[g.k] = true; }); } catch (e) {}
  render(); var s = root.querySelector('[data-section="mon-holdings"]'); if (s) root.scrollTop = Math.max(0, s.offsetTop - 90);
};

/* ---------- 3 · Overview ---------- */
var _accCard25 = accCard4;
accCard4 = function (b) {
  var h = _accCard25(b), m = /data-card="([^"]+)"/.exec(h); if (!m || !acc(m[1])) return h; var id = m[1];
  return h.replace(/<div class="kvr"><span>Open positions<\/span><b>([^<]*)<\/b><\/div>/, function (x, t) { return '<div class="kvr"><span>Open positions</span><button class="lnk kvgo" data-a="ovpos" data-v="' + id + '" aria-label="Show ' + esc(t) + ' for ' + esc(accName(acc(id))) + ' in the Trade Tracker">' + esc(t) + ' →</button></div>'; });
};
H7.ovpos = function (el, v) {
  S.posF.acc = v; S.posF.broker = ''; S.posF.ins = ''; S.posF.status = ''; S.ptab = 'open'; S.fopen = false; render();
  var tc = root.querySelector('[data-section="trades"]'); if (tc) { root.scrollTop = tc.offsetTop - 20; var f = tc.querySelector('[data-acc-chip] .lnk'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }
};
H7.ovposclr = function () { S.posF.acc = ''; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.ovlatest = function () { S.ovLatest = true; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.ovlatestx = function () { S.ovLatest = false; var k = root.scrollTop; render(); root.scrollTop = k; };
var _pc25 = positionsCard4;
positionsCard4 = function () {
  var h = _pc25(), f = S.posF;
  if (f.acc && acc(f.acc)) h = h.replace(/(<span class="lbl" data-pos-summary>(?:(?!<\/span>)[\s\S])*<\/span>)/, function (m) { return m + '<span class="fchip" data-acc-chip>Account: ' + esc(accName(acc(f.acc))) + ' <button class="lnk" data-a="ovposclr" aria-label="Clear account filter">× Clear</button></span>'; });
  if (S.ptab === 'open' && ovHist()) {
    var k = h.indexOf('<div style="overflow-x:auto"><table class="num ptab" data-table="positions">'); if (k < 0) k = h.indexOf('<div class="mut" style="padding:22px;text-align:center">No positions match');
    if (k >= 0) {
      if (!S.ovLatest) h = h.slice(0, k) + '<div class="na" data-ov-nosnap style="min-height:150px"><b style="color:#171717">No position snapshot for ' + DAYS[S.cr.e] + '</b><span>Your date range ends ' + DAYS[S.cr.e] + '. The demo only records open positions at the latest sync (' + DAYS[30] + ' 11:58).</span><button class="btn sm pri" data-a="ovlatest">View latest</button></div></div>';
      else h = h.slice(0, k) + '<div class="ddlnote" data-ov-latest>Showing the latest positions (' + DAYS[30] + ' 11:58 sync). Your date range ends ' + DAYS[S.cr.e] + '. <button class="lnk" data-a="ovlatestx">Back to ' + DAYS[S.cr.e] + '</button></div>' + h.slice(k);
    }
  }
  return h;
};
var _setDate25 = setDate;
setDate = function () { S.ovLatest = false; if (S.dd) S.dd.latest = false; return _setDate25.apply(null, arguments); };
var _sum25 = summary4;
summary4 = function () {
  var h = _sum25(), L = ACC, rep = L.filter(reporting), miss = L.filter(function (a) { return a.status === 'none'; }), st = L.filter(function (a) { return a.status === 'stale'; });
  if (st.length) h = h.replace('<div class="lbl">Total equity</div>', '<div class="lbl">Total equity <span class="tag wa" data-ov-lastknown title="' + esc(st.map(function (a) { return accName(a) + ' last known ' + a.snap; }).join(', ')) + '">Includes last-known values</span></div>');
  var cov;
  if (!miss.length && !st.length) cov = '<div class="lbl" style="margin-top:10px" data-ov-coverage>All ' + L.length + ' accounts included · aggregated in USD</div>';
  else cov = '<div class="ovcov" data-ov-coverage><span class="ovcovt"><b data-ov-covtext>' + rep.length + ' of ' + L.length + ' accounts included' + (miss.length ? ' · ' + miss.length + ' missing' : '') + '</b>' + (st.length ? ' · ' + st.length + ' last known' : '') + '</span> <button class="lnk" data-a="ovcov" aria-expanded="' + !!S.ovCov + '">' + (S.ovCov ? 'Hide' : 'Which accounts?') + '</button>' +
    (S.ovCov ? '<div class="ovcovl" data-ov-covlist>' + L.map(function (a) { var k = a.status === 'none' ? 'miss' : a.status === 'stale' ? 'old' : 'ok'; return '<span class="ovca ' + k + '" data-cov-acc="' + a.id + '">' + (k === 'ok' ? '✓' : k === 'old' ? '◷' : '✕') + ' ' + esc(accName(a)) + ' <small>' + (k === 'ok' ? 'live' : k === 'old' ? 'last known ' + esc(a.snap) : 'missing · not in totals') + '</small></span>'; }).join('') + '</div>' : '') +
    '<div class="lbl">Aggregated in USD. Missing accounts are left out of the totals, not counted as $0.</div></div>';
  return h.replace(/<div class="lbl" style="margin-top:10px">Aggregated in USD across \d+ reporting accounts<\/div>/, cov);
};
H7.ovcov = function () { S.ovCov = !S.ovCov; var k = root.scrollTop; render(); root.scrollTop = k; };

/* ---------- 4 · Portfolios › Long vs Short ---------- */
function pfNoDir(fn) { var d = S.pfDir; S.pfDir = ''; try { return fn(); } finally { S.pfDir = d; } }
function lsBars() {
  if (!rangeOK()) return '';
  var T = pfNoDir(pfTrades), R = ['long', 'short'].map(function (d) { var L = T.filter(function (c) { return cdir(c) === d; }); return { d: d, n: L.length, pl: r2(sumOf(L, 'pl')) }; });
  var mx = Math.max(Math.abs(R[0].pl), Math.abs(R[1].pl)) || 1;
  var rows = R.map(function (r) {
    return '<button class="lsrow' + (S.pfSide === r.d ? ' on' : '') + '" data-a="pfside" data-v="' + r.d + '" data-ls="' + r.d + '" aria-pressed="' + (S.pfSide === r.d) + '" aria-label="' + dirName(r.d) + ': ' + (r.pl === 0 ? '$0.00' : sgn(r.pl)) + ' net realized from ' + r.n + ' closed trades. Show these trades">' +
      '<span class="lsl"><b>' + dirName(r.d) + '</b><small data-ls-n="' + r.d + '">' + r.n + ' closed trade' + (r.n === 1 ? '' : 's') + '</small></span>' +
      '<span class="lstrack"><s></s>' + (r.pl ? '<i class="' + (r.pl < 0 ? 'n' : 'p') + '" style="' + (r.pl < 0 ? 'right:50%' : 'left:50%') + ';width:' + (Math.abs(r.pl) / mx * 50).toFixed(1) + '%"></i>' : '') + '</span>' +
      '<b class="lsv ' + (r.pl === 0 ? '' : plc(r.pl)) + '" data-ls-pl="' + r.d + '">' + (r.pl === 0 ? '$0.00' : sgn(r.pl)) + '</b></button>';
  }).join('');
  return '<div class="lsbox" data-section="long-short"><div class="ch" style="margin:0 0 4px"><h4 style="margin:0;font-size:13px">Long vs Short · net realized P/L</h4><span class="lbl">Direction of the closed position · click a bar to see its trades</span></div>' + rows +
    '<div class="lsaxis" aria-hidden="true"><span></span><span><i>' + sgn(-mx) + '</i><i>$0</i><i>' + sgn(mx) + '</i></span><span></span></div>' +
    (S.pfDir ? '<div class="lbl" style="margin-top:4px">Both sides are shown here. The ' + dirName(S.pfDir) + ' Direction filter still applies to the rest of Analytics.</div>' : '') + '</div>';
}
var _an25 = analyticsView;
analyticsView = function (tr, label, ids) {
  var h = _an25(tr, label, ids); if (S.tab !== 'portfolios') return h;
  var b = lsBars(); if (!b) return h;
  var i = h.indexOf('<div class="agrid">'); if (i >= 0) return h.slice(0, i) + b + h.slice(i);
  i = h.lastIndexOf('</div>'); return h.slice(0, i) + b + h.slice(i);
};
var _pf25 = portfolios;
portfolios = function () {
  var h = _pf25(); if (S.pfView === 'analytics' || !S.pfSide) return h;
  var k = h.indexOf('<div class="card pad mb16" data-section="pf-closed">'); if (k < 0) return h;
  var side = S.pfSide, pred = function (c) { return pfNoDir(function () { return pfTradePred(c); }) && cdir(c) === side; };
  return h.slice(0, k) + '<div class="card pad mb16" data-section="pf-closed" data-side="' + side + '"><div class="ch"><h3>Closed trades</h3><div class="ctl"><span class="fchip" data-side-chip>' + dirName(side) + ' trades only <button class="lnk" data-a="pfsideclr" aria-label="Clear the ' + dirName(side) + ' filter">× Clear</button></span><button class="btn sm" data-a="pfanalytics">Analytics →</button><button class="btn sm pri" data-a="journal" data-v="log">Open in Trading Journal →</button></div></div>' +
    closedTable(pfAccounts(), pfLabel() + ' · ' + dirName(side) + ' trades', pred) + '</div>';
};
H7.pfside = function (el, v) { S.pfSide = v; S.pfView = 'main'; render(); var s = root.querySelector('[data-section="pf-closed"]'); if (s) root.scrollTop = Math.max(0, s.offsetTop - 20); };
H7.pfsideclr = function () { S.pfSide = ''; var k = root.scrollTop; render(); root.scrollTop = k; };

/* ---------- 5 · Manage, Account details, Alerts ---------- */
function mbConnType(a) { return a && (a.partnerId || a.server) ? 'Partner API' : '<span class="mut">Source unavailable</span>'; }
function feedRows(a) {
  var none = a.status === 'none', stale = a.status === 'stale', t = none ? 'Never' : ddSynced(a), old = 'Last known at ' + (none ? '' : snapTime(a));
  var np = POS.filter(function (p) { return p.a === a.id; }).length, nt = CLOSED.filter(function (c) { return c.a === a.id && c.src !== 'manual'; }).length;
  var hist = none ? 'Never' : S.sync[a.id] === 'done' ? 'just now' : stale ? snapTime(a) : DAYS[30] + ' 11:45';
  return [
    ['bal', 'Balances', none ? ['na', 'Balance data unavailable'] : stale ? ['old', old] : ['ok', 'Up to date'], t],
    ['pos', 'Open positions', none ? ['na', 'Position data unavailable'] : stale ? ['old', old + ' · ' + np + ' position' + (np === 1 ? '' : 's')] : np ? ['ok', np + ' open position' + (np === 1 ? '' : 's')] : ['zero', 'No open positions'], t],
    ['hist', 'Trade history', none ? ['na', 'Trade history unavailable'] : stale ? ['old', old + ' · ' + nt + ' trade' + (nt === 1 ? '' : 's')] : ['ok', 'Up to date · ' + nt + ' synced trade' + (nt === 1 ? '' : 's')], hist]
  ];
}
function feedSection(a) {
  return '<section data-feed-status><h4>Data status</h4>' + feedRows(a).map(function (r) { return '<div class="fdrow" data-feed="' + r[0] + '" data-feed-state="' + r[2][0] + '"><span class="fdl">' + r[1] + '</span><span class="fds ' + r[2][0] + '">' + esc(r[2][1]) + '</span><span class="fdt"><small>Last successful update</small>' + esc(r[3]) + '</span></div>'; }).join('') +
    '<div class="lbl" style="margin-top:6px">Each feed syncs from ' + esc(a.broker) + '’s partner API on its own schedule (demo times). Missing data shows as unavailable, never as $0 or 0 positions. Connection: ' + mbConnType(a) + '.</div></section>';
}
function feedPosState(a) { var r = feedRows(a)[1][2]; return '<span class="fds ' + r[0] + '">' + esc(r[1]) + '</span>'; }
var _manage25 = manage;
manage = function () {
  return _manage25()
    .replace(/(<tr data-manage-row="([^"]+)"><td>(?:(?!<\/td>)[\s\S])*<\/td>)<td>(?:undefined|null)?<\/td>/g, function (m, pre, id) { return pre + '<td>' + mbConnType(acc(id)) + '</td>'; })
    .replace('<th>Status</th><th>Last sync</th>', '<th>Status</th><th>Open positions</th><th>Last sync</th>')
    .replace(/<td data-sync="([^"]+)">/g, function (m, id) { var a = acc(id); return '<td data-pos-state="' + id + '"><button class="lnk fdgo" data-a="open" data-v="' + id + '" title="Account details">' + (a ? feedPosState(a) : '') + '</button></td>' + m; })
    .replace('<span class="pill p-gr">Not a partner broker</span></td>', '<span class="pill p-gr">Not a partner broker</span></td><td class="mut">Not connected</td>');
};
var _drawer25 = drawer;
drawer = function (id) {
  var h = _drawer25(id), a = acc(id); if (!a || S.dload) return h;
  var k = h.indexOf('<div class="seg dtabs">');
  if (k >= 0) { if (S.dtab !== 'overview') return h; var e = h.indexOf('</div>', k) + 6; return h.slice(0, e) + feedSection(a) + h.slice(e); }
  k = h.indexOf('<div class="db">'); if (k < 0) return h; k += 15; return h.slice(0, k) + feedSection(a) + h.slice(k);
};
function fillTarget(n) {
  var p = POS.filter(function (x) { return x.a === n.acc && x.ins === n.ins && x.side === n.side; })[0]; if (p) return { pos: p };
  var cs = CLOSED.filter(function (c) { return c.a === n.acc && c.ins === n.ins; }).sort(function (x, y) { return y.day - x.day || (y.t > x.t ? 1 : -1); });
  return cs[0] ? { trade: cs[0] } : null;
}
var _note25 = alNoteHtml;
alNoteHtml = function (n, c) {
  var h = _note25(n, c); if (!n || n.kind !== 'fill') return h;
  var m = fillTarget(n); if (!m) return h;
  var i = h.lastIndexOf('</div>');
  return h.slice(0, i) + '<div class="alnact" data-note-act="' + (m.pos ? 'position' : 'trade') + '"><button class="btn sm" data-a="' + (m.pos ? 'alpos' : 'altrade') + '" data-v="' + esc(n.id) + '">' + (m.pos ? 'View position' : 'View trade') + '</button><span class="lbl">' + (m.pos ? 'Position still open' : 'Maps to a closed trade') + ' · simulated feed</span></div>' + h.slice(i);
};
function alNoteById(id) { return alStore().notes.filter(function (n) { return n.id === id; })[0]; }
H7.alpos = function (el, v) { var n = alNoteById(v), m = n && fillTarget(n); if (!m || !m.pos) return; ddOpen({ acc: n.acc, src: 'note', metric: 'np', focus: m.pos.id, deal: n.deal, ret: '[data-a="alpos"][data-v="' + v + '"]' }); };
H7.altrade = function (el, v) { var n = alNoteById(v), m = n && fillTarget(n); if (!m || !m.trade) return; ddOpen({ acc: n.acc, src: 'note', trade: m.trade.id, deal: n.deal, ret: '[data-a="altrade"][data-v="' + v + '"]' }); };

(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v25', '1');
  st.textContent = [
    '#mb-root .cdrill{cursor:pointer;border-radius:8px;padding:6px;margin:-6px;outline:0;transition:background .12s}#mb-root .cdrill:hover{background:#f1efff}#mb-root .cdrill:focus-visible{box-shadow:0 0 0 2px var(--b)}',
    '#mb-root .cnum{border:0;background:none;padding:2px 6px;margin:-2px -6px;border-radius:6px;font:inherit;color:var(--b);font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:3px}#mb-root .cnum:hover{background:#f1efff}#mb-root .cnum:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .ddsum{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:10px}#mb-root .ddsum>div{background:#faf9f6;border-radius:10px;padding:8px 10px}#mb-root .ddsum small{display:block;font-size:11px;color:var(--tx2)}#mb-root .ddsum b{font-size:18px;font-variant-numeric:tabular-nums}',
    '#mb-root .ddwhen{margin-bottom:8px}',
    '#mb-root .ddrow{display:grid;grid-template-columns:1.2fr .9fr .8fr 1fr;gap:8px;align-items:center;padding:9px 6px;border-bottom:1px solid #f3f2ee;font-size:13px;font-variant-numeric:tabular-nums}#mb-root .ddrow.x{grid-template-columns:1fr .8fr .8fr 1.2fr 1fr}',
    '#mb-root .ddrow.h{font-size:11px;color:var(--tx2);font-weight:600;text-transform:uppercase;letter-spacing:.03em}#mb-root .ddrow .r{text-align:right}#mb-root .ddrow.on{background:#f4f2ff;border-radius:8px;box-shadow:inset 3px 0 0 var(--b)}#mb-root .ddrow .c1 small{font-size:11.5px;color:#5c5c5c}',
    '#mb-root .ddfoot{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px}',
    '#mb-root .ddtrade{border:1px solid var(--l1);border-radius:12px;padding:12px}',
    '#mb-root .ddlnote{font-size:12.5px;background:#f4f2ff;color:#2d2490;border-radius:10px;padding:8px 12px;margin-bottom:8px}',
    '#mb-root .ccytog{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#mb-root .ccytog .lbl{font-weight:600;color:#404040}',
    '#mb-root .cdirx{font-size:11px;font-weight:600;border-radius:6px;padding:1px 6px;white-space:nowrap}#mb-root .cdirx.neg{background:var(--t);color:var(--b)}#mb-root .cdirx.pos{background:rgba(135,158,7,.14);color:#5f7005}',
    '#mb-root .ccyc{border:1px solid var(--l1);border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:13px}#mb-root .ccyc1{display:flex;align-items:center;gap:6px;flex-wrap:wrap}#mb-root .ccyc2{margin:4px 0 2px}',
    '#mb-root .mkgo{cursor:pointer;border-radius:10px;transition:background .12s}#mb-root .mkgo:hover{background:#f7f5ff}#mb-root .mkgo:focus-visible{outline:2px solid var(--b)}#mb-root .mkarr{color:var(--b);font-weight:600;margin-left:2px}',
    '#mb-root .kvgo{font-size:11.5px;font-weight:600;text-decoration:underline;text-underline-offset:2px;padding:0}',
    '#mb-root .fchip{display:inline-flex;align-items:center;gap:6px;background:var(--t);color:#2d2490;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;white-space:nowrap}#mb-root .fchip .lnk{font-size:12px}',
    '#mb-root .ovcov{margin-top:10px;font-size:12.5px}#mb-root .ovcovt b{font-weight:600}#mb-root .ovcovl{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}#mb-root .ovca{border-radius:8px;padding:3px 8px;font-size:12px;background:#f1f1ee}#mb-root .ovca small{color:inherit;opacity:.8;margin-left:2px}#mb-root .ovca.ok{background:#eef6e0;color:#3f4d03}#mb-root .ovca.old{background:#fdf0dc;color:#9a4b03}#mb-root .ovca.miss{background:#fff;color:#404040;border:1px dashed #c9c6bd}',
    '#mb-root .lsbox{background:#faf9f6;border-radius:12px;padding:12px 14px;margin-bottom:14px}',
    '#mb-root .lsrow,#mb-root .lsaxis{display:grid;grid-template-columns:120px 1fr 110px;gap:12px;align-items:center}#mb-root .lsrow{width:100%;border:0;background:none;padding:8px 6px;border-radius:10px;font:inherit;text-align:left;cursor:pointer;color:#171717}#mb-root .lsrow:hover,#mb-root .lsrow.on{background:#f1efff}#mb-root .lsrow.on{box-shadow:inset 0 0 0 1.5px var(--b)}',
    '#mb-root .lsl b{display:block;font-size:13.5px}#mb-root .lsl small{display:block;font-size:11.5px;color:var(--tx2)}',
    '#mb-root .lstrack{position:relative;display:block;height:16px;border-radius:8px;background:#ebe9e3;overflow:hidden}#mb-root .lstrack s{position:absolute;left:50%;top:-2px;bottom:-2px;width:2px;background:#8a8a8a;z-index:1}#mb-root .lstrack i{position:absolute;top:0;bottom:0}#mb-root .lstrack i.p{background:#879e07}#mb-root .lstrack i.n{background:#5945f1}',
    '#mb-root .lsv{text-align:right;font-variant-numeric:tabular-nums;font-size:14px}#mb-root .lsaxis{padding:0 6px;font-size:10.5px;color:var(--tx2)}#mb-root .lsaxis>span:nth-child(2){display:flex;justify-content:space-between}#mb-root .lsaxis i{font-style:normal}',
    '#mb-root .fdrow{display:grid;grid-template-columns:110px 1fr 130px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f3f2ee;font-size:12.5px}#mb-root .fdl{font-weight:600}#mb-root .fds{font-weight:600}#mb-root .fds.ok{color:#15803d}#mb-root .fds.zero{color:#404040}#mb-root .fds.old{color:#9a4b03}#mb-root .fds.na{color:#b42318}#mb-root .fdt{text-align:right}#mb-root .fdt small{display:block;font-size:10.5px;color:var(--tx2)}',
    '#mb-root .fdgo{font-size:12.5px;text-align:left;white-space:normal}#mb-root .alnact{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px}',
    '@keyframes mbddup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}',
    '@media (max-width:760px){#mb-root .drw.ddp{top:auto;left:0;right:0;bottom:0;width:100%;max-height:84vh;border-radius:18px 18px 0 0;animation:mbddup .2s ease-out}#mb-root .ddp .db{padding-bottom:28px}#mb-root .ddrow,#mb-root .ddrow.x{grid-template-columns:1fr auto}#mb-root .ddrow.h .hide-m{display:none}',
    '#mb-root .ccytog .seg{display:flex;width:100%}#mb-root .ccytog .seg button{flex:1}#mb-root .lsrow,#mb-root .lsaxis{grid-template-columns:72px 1fr 92px;gap:8px}#mb-root .fdrow{grid-template-columns:1fr;row-gap:2px}#mb-root .fdt{text-align:left}#mb-root .cdrill{margin:-4px;padding:4px}}'
  ].join('\n');
  document.head.appendChild(st);
})();


/* ============================ v26 · View: Portfolio status | Open positions ============================
   One View control in the main filter bar (Overview, Monitor, Compare, Portfolios), kept with Accounts, Portfolio,
   Date and Direction when moving between tabs. Open positions puts the positions held in that scope first, from one
   filtered list (pvScope) shared by the summary, charts, table and every drill-down, so counts and totals reconcile.
   Direction filters positions and their metrics only; equity, balance and margin stay full-account and say so.
   A date that ends before the latest sync has no position snapshot: counts stay hidden until View latest. */
S.view = 'status'; S.pvLatest = false;
function pvOn() { return S.view === 'positions' && !!FB_TABS[S.tab]; }
function pvEnd() { return S.dtSet && S.cr && S.cr.mode === 'custom' ? S.cr.e : 30; }
function pvHist() { return pvEnd() < 30 && !S.pvLatest; }
function pvPf() { return (S.tab === 'monitor' || S.tab === 'portfolios') && S.pf !== 'all' && port(S.pf) ? port(S.pf) : null; }
function pvScope() {
  var ids = scopeAccounts().map(function (a) { return a.id; }), P = pvPf();
  if (P) ids = ids.filter(function (id) { return P.acc.indexOf(id) >= 0; });
  var accs = ids.map(acc).filter(Boolean), dir = curDir() || '', ins = S.tab === 'portfolios' ? (S.pfIns || '') : '';
  var rep = accs.filter(reporting), un = accs.filter(function (a) { return a.status === 'none'; }), stale = rep.filter(function (a) { return a.status === 'stale'; }), rid = rep.map(function (a) { return a.id; });
  var all = POS.filter(function (p) { return rid.indexOf(p.a) >= 0 && (!ins || p.ins === ins); }), pos = all.filter(function (p) { return !dir || pdir(p) === dir; });
  var lo = 0, sh = 0, upl = 0; pos.forEach(function (p) { if (p.usd > 0) lo += p.usd; else sh -= p.usd; upl += p.pl; });
  return { accs: accs, rep: rep, un: un, stale: stale, all: all, pos: pos, dir: dir, ins: ins, n: pos.length, upl: r2(upl), long: Math.round(lo), short: Math.round(sh), gross: Math.round(lo + sh), net: Math.round(lo - sh), eq: sumOf(rep, 'eq'), bal: sumOf(rep, 'bal'), mu: sumOf(rep, 'mu') };
}
function pvName(X) { var P = pvPf(); return scopeName() + (P ? ' · ' + P.name : '') + (X.dir ? ' · ' + dirName(X.dir) : '') + (X.ins ? ' · ' + X.ins : ''); }
function pvLatestTxt() { return DAYS[30] + ' 11:58'; }
function pvBars(rows, key, act, val) {
  var mx = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[key]); }).concat([1]));
  return rows.map(function (r) {
    var v = r[key];
    return '<button class="pvrow" data-a="' + act + '" data-v="' + esc(r.k) + '" data-pv-row="' + esc(r.k) + '" aria-label="Show the ' + r.n + ' position' + (r.n === 1 ? '' : 's') + ' in ' + esc(r.name) + '"><span class="pvl"><b>' + esc(r.name) + '</b><small>' + r.n + ' position' + (r.n === 1 ? '' : 's') + '</small></span>' +
      '<span class="lstrack"><s></s>' + (v ? '<i class="' + (v < 0 ? 'n' : 'p') + '" style="' + (v < 0 ? 'right:50%' : 'left:50%') + ';width:' + (Math.abs(v) / mx * 50).toFixed(1) + '%"></i>' : '') + '</span><span class="pvv">' + val(r) + '</span></button>';
  }).join('');
}
function pvGroup(pos, key, name) {
  var m = {}, order = [];
  pos.forEach(function (p) { var k = key(p); if (!m[k]) { m[k] = { k: k, name: name(k), n: 0, upl: 0, net: 0 }; order.push(k); } m[k].n++; m[k].upl += p.pl; m[k].net += p.usd; });
  return order.map(function (k) { var g = m[k]; g.upl = r2(g.upl); g.net = Math.round(g.net); return g; }).sort(function (a, b) { return Math.abs(b.net) - Math.abs(a.net); });
}
function pvModule(o) {
  o = o || {};
  var X = pvScope(), end = pvEnd();
  var head = '<div class="ch"><div><h3>Open positions</h3><div class="lbl" data-pv-scope>' + esc(pvName(X)) + ' · P/L here is unrealized</div></div><span class="pill p-pu" data-pv-when>' + (pvHist() ? 'Date ' + DAYS[end] : 'Latest snapshot · ' + pvLatestTxt()) + '</span></div>';
  var wrap = function (b) { return '<div class="card pad mb16 pvcard" data-section="pv" data-pv-state="' + (pvHist() ? 'nosnap' : !X.rep.length ? 'unavail' : !X.n ? 'none' : 'ok') + '">' + head + b + '</div>'; };
  if (pvHist()) return wrap('<div class="na" data-pv-nosnap><b style="color:#171717">No position snapshot for ' + DAYS[end] + '</b><span>Positions are recorded at each sync only, and the demo has none for this date. Latest counts stay hidden until you choose View latest.</span><button class="btn sm pri" data-a="pvlatest">View latest</button></div>');
  if (!X.rep.length) return wrap('<div class="na" data-pv-unavail><b style="color:#171717">Position data unavailable</b><span>' + (X.un.length ? esc(X.un.map(accName).join(', ')) + ' has no synced positions yet.' : 'No account in this scope.') + ' Not shown as zero.</span><button class="lnk" data-a="pvmanage">Data status in Manage →</button></div>');
  var latestNote = end < 30 ? '<div class="ddlnote" data-pv-latest>Showing the latest snapshot (' + pvLatestTxt() + '). Your date range ends ' + DAYS[end] + '. <button class="lnk" data-a="pvlatestx">Back to ' + DAYS[end] + '</button></div>' : '';
  var notes = (X.stale.length ? '<div class="lbl pvnote" data-pv-stale><span class="tag wa" style="margin:0 6px 0 0">Last known</span>Includes ' + X.stale.map(function (a) { return esc(accName(a)) + ' at ' + esc(snapTime(a)); }).join(', ') + '</div>' : '') +
    (X.un.length ? '<div class="lbl pvnote" data-pv-unavail-acc><span class="fds na">Position data unavailable</span> · ' + esc(X.un.map(accName).join(', ')) + ' · not counted as zero · <button class="lnk" data-a="pvmanage">Data status in Manage →</button></div>' : '');
  var kp = function (lab, val, sub, attr, act) { return '<div class="pvk' + (act ? ' click' : '') + '"' + (act ? ' data-a="pvall" role="button" tabindex="0" title="Show these positions"' : '') + '><small>' + lab + '</small><b ' + attr + '>' + val + '</b><span>' + sub + '</span></div>'; };
  var go = X.n > 0;
  var strip = '<div class="pvstrip" data-pv-strip>' + kp('Open positions' + (X.dir ? ' · ' + dirName(X.dir) : ''), String(X.n), go ? 'View trades ›' : '—', 'data-pv-n', go) +
    kp('Unrealized P/L', '<span class="' + plc(X.upl) + '">' + sgn(X.upl) + '</span>', 'Open positions only', 'data-pv-upl', go) +
    kp('Gross exposure', usd0(X.gross), 'Long ' + usd0(X.long) + ' · short ' + usd0(X.short), 'data-pv-gross', go) +
    kp('Net exposure', X.net === 0 ? '$0' : sgn0(X.net), X.net < 0 ? 'Net short' : X.net > 0 ? 'Net long' : 'Flat', 'data-pv-net', go) +
    '<div class="pvk acct" data-pv-acct><small>Account equity · full account</small><b data-pv-eq>' + usd(X.eq) + '</b><span>Balance ' + usd(X.bal) + ' · margin used ' + usd(X.mu) + (X.dir ? ' · not filtered by direction' : '') + '</span></div></div>';
  if (!X.n) return wrap(latestNote + strip + notes + '<div class="na" data-pv-none style="min-height:110px"><b style="color:#171717">No open positions</b><span>' + (X.all.length && X.dir ? 'Every open position in this scope is ' + (X.dir === 'long' ? 'short' : 'long') + '.' : 'The positions feed synced and returned none.') + '</span>' + (X.dir ? '<button class="btn sm" data-a="hdir" data-v="">Show all directions</button>' : '') + '</div>');
  var body = '';
  if (o.charts !== false) {
    var gi = pvGroup(X.pos, function (p) { return p.ins; }, function (k) { return k; }), ga = pvGroup(X.pos, function (p) { return p.a; }, function (k) { return accName(acc(k)); });
    ga.forEach(function (g) { g.stale = acc(g.k).status === 'stale'; });
    body += '<div class="pvcharts"><div class="pvch" data-pv-chart="instrument"><h4>By instrument <small>net exposure · centred on $0</small></h4>' + pvBars(gi, 'net', 'pvins', function (r) { return '<b>' + (r.net === 0 ? '$0' : sgn0(r.net)) + '</b><small class="' + plc(r.upl) + '">' + sgn(r.upl) + '</small>'; }) + '</div>' +
      '<div class="pvch" data-pv-chart="account"><h4>By account <small>unrealized P/L · centred on $0</small></h4>' + pvBars(ga, 'upl', 'pvacc', function (r) { return '<b class="' + plc(r.upl) + '">' + sgn(r.upl) + '</b>' + (r.stale ? '<small class="warn">Last known</small>' : '<small>' + esc(acc(r.k).nick) + '</small>'); }) + '</div></div>';
  }
  if (o.table) {
    body += '<div style="overflow-x:auto"><table class="num" data-table="pv-positions"><thead><tr><th>Account</th><th>Instrument</th><th>Side</th><th class="r">Size</th><th class="r">Exposure</th><th class="r">Unrealized P/L</th></tr></thead><tbody>' +
      X.pos.map(function (p) { var a = acc(p.a); return '<tr class="click" data-a="pvpos" data-v="' + p.id + '" data-pv-pos="' + p.id + '"><td>' + logo(a.broker, true) + ' ' + esc(accName(a)) + (a.status === 'stale' ? ' <span class="tag wa">Last known</span>' : '') + '</td><td><b>' + p.ins + '</b></td><td>' + pdirCell(p) + '</td><td class="r">' + p.lots.toFixed(2) + '</td><td class="r">' + sgn0(p.usd) + '</td><td class="r ' + plc(p.pl) + '">' + sgn(p.pl) + '</td></tr>'; }).join('') +
      '<tr class="mfoot"><td colspan="4"><b data-pv-tcount>' + X.n + ' position' + (X.n === 1 ? '' : 's') + '</b></td><td class="r">Net ' + (X.net === 0 ? '$0' : sgn0(X.net)) + '</td><td class="r"><b class="' + plc(X.upl) + '" data-pv-ttotal>' + sgn(X.upl) + '</b></td></tr></tbody></table></div>';
  }
  return wrap(latestNote + strip + notes + body);
}
function pvPanel(title, L) { if (!L.length) return; S.panel = { title: title, ids: L.map(function (p) { return p.id; }) }; var k = root.scrollTop; render(); root.scrollTop = k; }
H7.pview = function (el, v) {
  if (!v || v === S.view) return; S.view = v; S.panel = null;
  if (v === 'positions') { S.ptab = 'open'; if (S.mon.view === 'tiles') S.mon.view = 'holdings'; S.pvCmpPrev = S.cmpView; if (S.cmpView === 'ml' || S.cmpView === 'eq') S.cmpView = 'pl'; S.mon.ccyView = 'positions'; }
  else { if (S.pvCmpPrev) S.cmpView = S.pvCmpPrev; S.mon.ccyView = 'exposure'; if (S.mon.view === 'holdings') S.mon.view = 'tiles'; }
  var k = root.scrollTop; render(); root.scrollTop = k;
};
H7.pvall = function () { var X = pvScope(); pvPanel('Open positions · ' + pvName(X), X.pos); };
H7.pvins = function (el, v) { var X = pvScope(); pvPanel(v + ' · ' + pvName(X), X.pos.filter(function (p) { return p.ins === v; })); };
H7.pvacc = function (el, v) { var X = pvScope(); pvPanel(accName(acc(v)) + (X.dir ? ' · ' + dirName(X.dir) : ''), X.pos.filter(function (p) { return p.a === v; })); };
H7.pvpos = function (el, v) { var p = POS.filter(function (x) { return x.id === v; })[0]; if (p) pvPanel(p.ins + ' · ' + accName(acc(p.a)), [p]); };
H7.pvlatest = function () { S.pvLatest = true; S.ovLatest = true; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.pvlatestx = function () { S.pvLatest = false; S.ovLatest = false; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.pvmanage = function () {
  var one = S.scope.indexOf('a:') === 0 ? S.scope.slice(2) : null; S.panel = null; S.tab = 'manage';
  if (one && H7.open) H7.open(null, one); else render(); root.scrollTop = 0;
};
var _setDate26 = setDate;
setDate = function () { S.pvLatest = false; return _setDate26.apply(null, arguments); };

/* ---------- filter bar ---------- */
var _fbar26 = fbar;
fbar = function () {
  var ctl = '<div class="fbf fbview" data-view-ctl><span>View</span><span class="seg" role="group" aria-label="View">' + [['status', 'Portfolio status'], ['positions', 'Open positions']].map(function (x) { return '<button data-a="pview" data-v="' + x[0] + '" class="' + (S.view === x[0] ? 'on' : '') + '" aria-pressed="' + (S.view === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</span></div>';
  return _fbar26().replace('<div class="fbar" data-filter-bar>', '<div class="fbar" data-filter-bar>' + ctl)
    .replace('<div class="fbsum show-m" data-fb-summary>', '<div class="fbsum show-m" data-fb-summary>' + (S.view === 'positions' ? 'Open positions · ' : 'Portfolio status · '));
};
var _noteFor26 = noteFor;
noteFor = function (tab) {
  if (!pvOn()) return _noteFor26(tab);
  var d = curDir();
  return '<div class="fbnote" data-fb-note><b>Open positions</b> · positions held at the snapshot, with unrealized P/L. Equity, balance and margin are full-account.' + (d ? ' ' + dirName(d) + ' applies to positions and their metrics only.' : '') + (S.tab === 'portfolios' ? ' Closed-trade results below are realized, for ' + esc(rangeLabel()) + '.' : '') + '</div>';
};

/* ---------- tabs in Open positions ---------- */
var _overview26 = overview;
overview = function () {
  if (!pvOn() || S.loading) return _overview26();
  if (S.ptab !== 'open' && S.ptab !== 'exposure') S.ptab = 'open';
  return pvModule({ charts: true }) + (pvHist() ? '' : positionsCard4());
};
var _mPos26 = mPos;
mPos = function () { var L = _mPos26(); return pvOn() && S.tab === 'monitor' && S.mon.dir ? L.filter(function (p) { return pdir(p) === S.mon.dir; }) : L; };
var _monitor26 = monitor;
monitor = function () {
  if (!pvOn() || S.mon.view === 'alerts') return _monitor26();
  var v = S.mon.view;
  if (pvHist()) return pvModule({ charts: true }) + monToolbar();
  var body = v === 'holdings' ? monHoldings() : v === 'matrix' ? monMatrix() : v === 'map' ? monMap() : v === 'currency' ? monCurrency() : monTiles();
  return pvModule({ charts: true }) + monToolbar() + '<div data-mon-view="' + v + '">' + body + '</div>';
};
var _compare26 = compareView;
compareView = function () { return pvOn() ? pvModule({ charts: false }) + _compare26() : _compare26(); };
var _portfolios26 = portfolios;
portfolios = function () {
  if (!pvOn() || S.pfView === 'analytics') { var s = _portfolios26(); if (!pvOn() && pvEnd() < 30) s = s.replace(/(\d+ open positions?)/, '$1 · latest ' + pvLatestTxt()).replace('<h3>Open positions', '<h3>Open positions <span class="tag wa" data-pf-latest>Latest · ' + pvLatestTxt() + '</span>'); return s; }
  var h = _portfolios26(), k = h.indexOf('<div class="card pad mb16" data-section="pf-closed"'), closed = k >= 0 ? h.slice(k).replace('<h3>Closed trades</h3>', '<h3>Closed trades <span class="lbl" data-closed-period>realized · ' + esc(rangeLabel()) + '</span></h3>') : '';
  return pfBar() + pvModule({ charts: true, table: true }) + closed;
};
/* status view: the selected account's sync line; past dates never show an unlabeled latest count */
var _ovAcc26 = overviewAccount;
overviewAccount = function () {
  var h = _ovAcc26(), a = acc(S.scope.slice(2));
  if (!a || a.status === 'none') return h;
  return '<div class="pvsync" data-sync-line>' + statusPill(a) + ' <span>' + (a.status === 'stale' ? 'Last known · ' : 'Synced ' + esc(a.ago) + ' · ') + esc(snapTime(a)) + '</span><button class="lnk" data-a="pvmanage">Data status in Manage →</button></div>' + h;
};
var _pc26 = positionsCard4;
positionsCard4 = function () {
  var h = _pc26();
  if (!ovHist()) return h;
  if (!S.ovLatest) return h.replace(/>Open \(\d+\)</, '>Open<').replace(/(<span class="lbl" data-pos-summary>)(?:(?!<\/span>)[\s\S])*/, '$1No position snapshot for ' + DAYS[S.cr.e]);
  return h.replace(/>Open \((\d+)\)</, '>Open ($1 · latest ' + pvLatestTxt() + ')<');
};
var _acc26 = accCard4;
accCard4 = function (b) { var h = _acc26(b); return pvEnd() < 30 ? h.replace(/(data-a="ovpos"[^>]*>)/, '$1Latest · ') : h; };
var _posPanel26 = posPanel;
posPanel = function (pn) {
  return _posPanel26(pn).replace(' · P/L ', ' · unrealized P/L ').replace('<div class="db">', '<div class="db"><div class="lbl" style="margin-bottom:8px" data-panel-when>Latest snapshot · ' + pvLatestTxt() + ' · P/L is unrealized</div>');
};

(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v26', '1');
  st.textContent = [
    '#mb-root .fbview .seg button{height:28px;font-weight:600}#mb-root .fbview .seg button.on{color:var(--b)}',
    '#mb-root .pvcard{border-color:#d8d0ff}#mb-root .pvnote{margin:6px 0}',
    '#mb-root .pvstrip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) minmax(0,1.25fr);gap:8px;margin-bottom:10px}',
    '#mb-root .pvk{background:#f7f5ff;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}#mb-root .pvk small{font-size:11px;color:var(--tx2)}#mb-root .pvk b{font-size:20px;font-variant-numeric:tabular-nums}#mb-root .pvk>span{font-size:11.5px;color:#525252}',
    '#mb-root .pvk.click{cursor:pointer}#mb-root .pvk.click:hover{background:#efebff}#mb-root .pvk.click:focus-visible{outline:2px solid var(--b)}#mb-root .pvk.click>span{color:var(--b)}',
    '#mb-root .pvk.acct{background:#faf9f6;border:1px dashed #d4d0c6}',
    '#mb-root .pvcharts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0 10px}#mb-root .pvch{background:#faf9f6;border-radius:12px;padding:10px 12px}#mb-root .pvch h4{margin:0 0 4px;font-size:13px}#mb-root .pvch h4 small{font-weight:400;color:var(--tx2);margin-left:4px}',
    '#mb-root .pvrow{display:grid;grid-template-columns:120px 1fr 104px;gap:10px;align-items:center;width:100%;border:0;background:none;padding:7px 4px;border-radius:8px;font:inherit;text-align:left;cursor:pointer;color:#171717}#mb-root .pvrow:hover{background:#f1efff}#mb-root .pvrow:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .pvl b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#mb-root .pvl small,#mb-root .pvv small{display:block;font-size:11px;color:var(--tx2)}#mb-root .pvv{text-align:right;font-variant-numeric:tabular-nums}#mb-root .pvv b{font-size:13px}',
    '#mb-root .fds.na{display:inline;min-height:0;background:none;padding:0;text-align:inherit;font-size:inherit;border-radius:0;gap:0;color:#b42318}',
    '#mb-root .pvsync{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12.5px;color:#404040;margin:-4px 0 12px}',
    '@media (max-width:1100px){#mb-root .pvstrip{grid-template-columns:repeat(2,minmax(0,1fr))}#mb-root .pvk.acct{grid-column:1/-1}}',
    '@media (max-width:760px){#mb-root .fbar .fbview{grid-column:1/-1;order:-1}#mb-root .fbview .seg{display:flex;width:100%}#mb-root .fbview .seg button{flex:1}#mb-root .pvcharts{grid-template-columns:1fr}#mb-root .pvrow{grid-template-columns:84px 1fr 92px;gap:8px}#mb-root .pvk b{font-size:18px}}'
  ].join('\n');
  document.head.appendChild(st);
})();


/* ============================ v27 · Open positions: risk widgets, one selection model ============================
   Account and portfolio stay in step (one synced account = one portfolio; a broker selection = its accounts).
   Open positions adds: Margin risk by account and Gross exposure by stop-loss status (Monitor), Unrealized P/L by
   instrument (Overview), Equity drawdown (Portfolios, compact in Monitor). Every count and amount comes from pvScope.
   Thresholds, stop-loss coverage and the equity curve are demo data and say so. XM's partner feed (demo) omits
   stop-loss fields, so its positions show Stop data unavailable instead of No stop. */
S.mon.slf = ''; S._ls = S.scope; S._lp = S.pf;
['p2', 'p3'].forEach(function (id) { if (PX[id]) { PX[id].sl = 'Stop data unavailable'; PX[id].slNA = true; } });
function slKey(p) { var x = PX[p.id]; return !x || x.slNA || acc(p.a).broker === 'XM' ? 'na' : x.sl ? 'set' : 'none'; }
var SLK = { set: 'Stop set', none: 'No stop set', na: 'Stop data unavailable' };

/* ---------- selection: account <-> portfolio ---------- */
var _syncDerived27 = syncDerived;
syncDerived = function () {
  if (S.scope !== S._ls) { var id = S.scope.indexOf('a:') === 0 ? S.scope.slice(2) : null; S.pf = id && port('a-' + id) ? 'a-' + id : 'all'; }
  else if (S.pf !== S._lp) { var p = S.pf !== 'all' ? port(S.pf) : null; S.scope = p && p.acc.length === 1 ? 'a:' + p.acc[0] : 'all'; }
  S._ls = S.scope; S._lp = S.pf;
  return _syncDerived27.apply(null, arguments);
};

/* ---------- Margin risk by account ---------- */
function mrThreshold(a) { var m = BMETA[a.broker]; return m && m.stop > 0 ? m.stop : null; }
function marginRiskCard() {
  var X = pvScope(), rows = X.accs.map(function (a) {
    var none = a.status === 'none', ml = none ? null : mlvl(a), th = none ? null : mrThreshold(a);
    return { a: a, none: none, ml: ml, th: th, dist: ml != null && th != null ? Math.round(ml - th) : null, free: none ? null : r2(a.eq - a.mu) };
  });
  rows.sort(function (x, y) { if (x.none !== y.none) return x.none ? 1 : -1; var dx = x.dist == null ? (x.ml == null ? 1e9 : x.ml) : x.dist, dy = y.dist == null ? (y.ml == null ? 1e9 : y.ml) : y.dist; return dx - dy; });
  var scale = 400;
  var body = rows.map(function (r) {
    var a = r.a, st = a.status === 'stale';
    if (r.none) return '<div class="mrrow un" data-mr-row="' + a.id + '"><span class="mrn"><b>' + esc(accName(a)) + '</b><small>' + esc(a.nick) + '</small></span><span class="fds na">Margin data unavailable</span><span class="mrd"><button class="lnk" data-a="pvmanage">Data status in Manage →</button></span></div>';
    var x = Math.min(100, r.ml / scale * 100), tx = r.th != null ? Math.min(100, r.th / scale * 100) : null, cls = r.ml < 100 ? 'ri' : r.ml < 150 ? 'wa' : 'ok';
    return '<button class="mrrow" data-a="mracc" data-v="' + a.id + '" data-mr-row="' + a.id + '" aria-label="Show positions for ' + esc(accName(a)) + '"><span class="mrn"><b>' + esc(accName(a)) + '</b><small>' + (st ? '<span class="warn">Last known ' + esc(a.snap) + '</span>' : esc(a.nick)) + '</small></span>' +
      '<span class="mrbar"><span class="mrtrack"><i class="' + cls + '" style="width:' + x.toFixed(1) + '%"></i>' + (tx != null ? '<em style="left:' + tx.toFixed(1) + '%" title="Stop-out ' + r.th + '%"></em>' : '') + '</span><small><b class="' + (cls === 'ri' ? 'bad' : '') + '" data-mr-ml="' + a.id + '">' + pct(r.ml) + '</b> margin level · free ' + usd(r.free) + '</small></span>' +
      '<span class="mrd" data-mr-dist="' + a.id + '">' + (r.th == null ? '<span class="mut">Threshold unavailable</span>' : '<b>' + (r.dist >= 0 ? r.dist.toLocaleString('en-US') + ' pts' : '<span class="bad">' + Math.abs(r.dist) + ' pts below</span>') + '</b><small>to ' + r.th + '% stop-out</small>') + '</span></button>';
  }).join('');
  return '<div class="card pad mb16" data-section="margin-risk"><div class="ch"><div><h3>Margin risk by account</h3><div class="lbl">Full-account margin · most urgent first · Direction doesn’t change these</div></div><span class="lbl">Stop-out levels: broker demo values</span></div>' + (rows.length ? body : '<div class="mut">No accounts in this scope.</div>') + '</div>';
}
H7.mracc = function (el, v) { var X = pvScope(), L = X.pos.filter(function (p) { return p.a === v; }); if (L.length) pvPanel(accName(acc(v)) + (X.dir ? ' · ' + dirName(X.dir) : ''), L); else ddOpen({ acc: v, src: 'mr', metric: 'np', ret: '[data-a="mracc"][data-v="' + v + '"]' }); };

/* ---------- Gross exposure by stop-loss status ---------- */
function stopCard() {
  var X = pvScope(), g = { set: { v: 0, n: 0 }, none: { v: 0, n: 0 }, na: { v: 0, n: 0 } }, tot = 0;
  X.pos.forEach(function (p) { var k = slKey(p), v = Math.abs(p.usd); g[k].v += v; g[k].n++; tot += v; });
  var segs = ['set', 'none', 'na'].filter(function (k) { return g[k].n; }).map(function (k) { var w = tot ? g[k].v / tot * 100 : 0; return '<button class="slseg ' + k + (S.mon.slf === k ? ' on' : '') + '" style="width:' + w.toFixed(2) + '%" data-a="mslf" data-v="' + k + '" data-sl-seg="' + k + '" title="' + SLK[k] + ': ' + usd0(g[k].v) + ' · ' + g[k].n + ' positions">' + (w > 14 ? '<span>' + Math.round(w) + '%</span>' : '') + '</button>'; }).join('');
  var leg = ['set', 'none', 'na'].map(function (k) { return '<button class="slleg' + (S.mon.slf === k ? ' on' : '') + '" data-a="mslf" data-v="' + k + '"' + (g[k].n ? '' : ' disabled') + '><i class="' + k + '"></i><b>' + SLK[k] + '</b><span data-sl-amt="' + k + '">' + usd0(g[k].v) + ' · ' + g[k].n + ' position' + (g[k].n === 1 ? '' : 's') + '</span></button>'; }).join('');
  return '<div class="card pad mb16" data-section="stop-status"><div class="ch"><div><h3>Gross exposure by stop-loss status</h3><div class="lbl">Gross, so offsetting positions stay visible · ' + usd0(Math.round(tot)) + ' across ' + X.n + ' position' + (X.n === 1 ? '' : 's') + ' · click a segment to filter Holdings</div></div>' + (S.mon.slf ? '<span class="fchip" data-sl-chip>' + SLK[S.mon.slf] + ' <button class="lnk" data-a="mslfclr">× Clear</button></span>' : '') + '</div>' +
    (X.n ? '<div class="slbar" role="group" aria-label="Gross exposure by stop-loss status">' + segs + '</div>' : '<div class="mut">No open positions.</div>') + '<div class="slleg-w">' + leg + '</div><div class="lbl">Stop data unavailable: XM’s partner feed doesn’t send stop-loss fields (demo).</div></div>';
}
H7.mslf = function (el, v) { S.mon.slf = S.mon.slf === v ? '' : v; S.mon.view = 'holdings'; S.mon.open = {}; try { holdGroups().forEach(function (g) { S.mon.open[g.k] = true; }); } catch (e) {} var k = root.scrollTop; render(); root.scrollTop = k; };
H7.mslfclr = function () { S.mon.slf = ''; var k = root.scrollTop; render(); root.scrollTop = k; };
var _mPosD27 = mPosD;
mPosD = function () { var L = _mPosD27(); return pvOn() && S.mon.slf ? L.filter(function (p) { return slKey(p) === S.mon.slf; }) : L; };

/* ---------- Equity drawdown (full account, cash-flow adjusted) ---------- */
function eqAdj(ids) {
  var raw = series(ids), flow = []; for (var i = 0; i < 31; i++) flow.push(0);
  ids.forEach(function (id) { (DEPS[id] || []).forEach(function (d) { var k = dayIdx(d[2]); if (k >= 1 && k <= 30) flow[k] += d[1]; }); });
  var cum = 0; return raw.map(function (v, i) { cum += flow[i]; return r2(v - cum); });
}
function drawdown(compact) {
  var X = pvScope(), ids = X.rep.map(function (a) { return a.id; }).filter(function (id) { return EQ[id]; });
  var head = '<div class="ch"><div><h3>Equity drawdown</h3><div class="lbl">Full account · deposits and withdrawals removed from the curve · demo equity history</div></div></div>';
  if (!ids.length || !rangeOK() || rangeEnd() - rangeStart() < 2) return '<div class="card pad mb16' + (compact ? ' ddc' : '') + '" data-section="drawdown" data-dd-state="na">' + head + '<div class="na" style="min-height:90px" data-dd-na>Equity history is insufficient for ' + esc(scopeName()) + (rangeOK() ? ' in this period' : '') + '.</div></div>';
  var s = eqAdj(ids), pk = -Infinity, pkDay = 0; for (var i = 0; i <= 30; i++) if (s[i] > pk) { pk = s[i]; pkDay = i; }
  var cur = pk > 0 ? (pk - s[30]) / pk : 0, a0 = rangeStart(), a1 = rangeEnd(), rp = -Infinity, mdd = 0, mAbs = 0, uw = [];
  for (var j = a0; j <= a1; j++) { if (s[j] > rp) rp = s[j]; var d = rp > 0 ? (rp - s[j]) / rp : 0; uw.push(d); if (d > mdd) { mdd = d; mAbs = rp - s[j]; } }
  var stale = X.rep.some(function (a) { return a.status === 'stale' && ids.indexOf(a.id) >= 0; }), W = 300, H = 46, mx = Math.max.apply(null, uw.concat([0.0001]));
  var pts = uw.map(function (d, k) { return (k / Math.max(1, uw.length - 1) * W).toFixed(1) + ',' + (d / mx * (H - 4)).toFixed(1); }).join(' ');
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" preserveAspectRatio="none" role="img" aria-label="Drawdown over the reporting period"><polygon points="0,0 ' + pts + ' ' + W + ',0" fill="#5945f1" fill-opacity=".14"/><polyline points="' + pts + '" fill="none" stroke="#5945f1" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>';
  return '<div class="card pad mb16' + (compact ? ' ddc' : '') + '" data-section="drawdown" data-dd-state="ok">' + head + '<div class="ddg"><div><small>Current drawdown</small><b data-dd-cur>' + (cur > 0 ? '−' + (cur * 100).toFixed(1) + '%' : '0.0%') + '</b><span>' + (cur > 0 ? '−$' + f2(pk - s[30]) + ' from peak ' + DAYS[pkDay] : 'At peak') + ' · latest ' + DAYS[30] + (stale ? ' · includes last-known' : '') + '</span></div>' +
    '<div><small>Max drawdown · ' + esc(rangeLabel()) + '</small><b data-dd-max>' + (mdd > 0 ? '−' + (mdd * 100).toFixed(1) + '%' : '0.0%') + '</b><span>' + (mdd > 0 ? '−$' + f2(mAbs) + ' peak to trough' : 'No drawdown in period') + '</span></div></div>' + (compact ? '' : svg) + '</div>';
}

/* ---------- module tweaks: Overview pairs net exposure with unrealized P/L by instrument ---------- */
var _pvModule27 = pvModule;
pvModule = function (o) {
  var h = _pvModule27(o);
  if (!o || !o.ov) return h;
  var X = pvScope(), gi = pvGroup(X.pos, function (p) { return p.ins; }, function (k) { return k; }).sort(function (a, b) { return a.upl - b.upl; });
  var chart = '<div class="pvch" data-pv-chart="ins-upl"><h4>Unrealized P/L by instrument <small>losses left · gains right · sums to ' + sgn(X.upl) + '</small></h4>' + pvBars(gi, 'upl', 'pvinsT', function (r) { return '<b class="' + plc(r.upl) + '">' + sgn(r.upl) + '</b><small>' + r.n + ' position' + (r.n === 1 ? '' : 's') + '</small>'; }) + '</div>';
  var a = h.indexOf('<div class="pvch" data-pv-chart="account">'); if (a < 0) return h;
  var e = h.indexOf('</div>', a); return h.slice(0, a) + chart + h.slice(e + 6);
};
H7.pvinsT = function (el, v) { S.posF.ins = v; S.posF.status = ''; S.ptab = 'open'; S.fopen = false; render(); var tc = root.querySelector('[data-section="trades"]'); if (tc) root.scrollTop = tc.offsetTop - 20; };
H7.ovinsclr = function () { S.posF.ins = ''; var k = root.scrollTop; render(); root.scrollTop = k; };
var _pc27 = positionsCard4;
positionsCard4 = function () {
  var h = _pc27(); if (!S.posF.ins) return h;
  return h.replace(/(<span class="lbl" data-pos-summary>(?:(?!<\/span>)[\s\S])*<\/span>)/, function (m) { return m + '<span class="fchip" data-ins-chip>Instrument: ' + esc(S.posF.ins) + ' <button class="lnk" data-a="ovinsclr" aria-label="Clear instrument filter">× Clear</button></span>'; });
};

/* ---------- tab composition in Open positions ---------- */
overview = (function (prev) { return function () { if (!pvOn() || S.loading) return prev(); if (S.ptab !== 'open' && S.ptab !== 'exposure') S.ptab = 'open'; return pvModule({ charts: true, ov: true }) + (pvHist() ? '' : positionsCard4()); }; })(overview);
monitor = (function (prev) {
  return function () {
    if (!pvOn() || S.mon.view === 'alerts' || pvHist()) return prev();
    var v = S.mon.view, body = v === 'holdings' ? monHoldings() : v === 'matrix' ? monMatrix() : v === 'map' ? monMap() : v === 'currency' ? monCurrency() : monTiles();
    var chip = v === 'holdings' && S.mon.slf ? '<div class="lbl mb16" data-hold-slf>Holdings filtered to <b>' + SLK[S.mon.slf] + '</b> · <button class="lnk" data-a="mslfclr">Show all positions</button></div>' : '';
    return pvModule({ charts: true }) + '<div class="mrw">' + marginRiskCard() + drawdown(true) + '</div>' + stopCard() + monToolbar() + chip + '<div data-mon-view="' + v + '">' + body + '</div>';
  };
})(monitor);
portfolios = (function (prev) {
  return function () {
    if (!pvOn() || S.pfView === 'analytics' || pvHist()) return prev();
    var h = prev(), k = h.indexOf('<div class="card pad mb16" data-section="pf-closed"');
    return pfBar() + pvModule({ charts: true }) + drawdown(false) + pfPositions(pfAccounts()) + (k >= 0 ? h.slice(k) : '');
  };
})(portfolios);

(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v27', '1');
  st.textContent = [
    '#mb-root .mrw{display:grid;grid-template-columns:2fr 1fr;gap:16px;align-items:start}',
    '#mb-root .mrrow{display:grid;grid-template-columns:150px 1fr 150px;gap:12px;align-items:center;width:100%;border:0;border-top:1px solid #f3f2ee;background:none;padding:10px 4px;font:inherit;text-align:left;color:#171717;cursor:pointer}#mb-root .mrrow:hover{background:#f7f5ff}#mb-root .mrrow.un{cursor:default}#mb-root .mrrow.un:hover{background:none}',
    '#mb-root .mrn b{display:block;font-size:13px}#mb-root .mrn small,#mb-root .mrbar small,#mb-root .mrd small{display:block;font-size:11.5px;color:var(--tx2)}#mb-root .mrd{text-align:right}',
    '#mb-root .mrtrack{position:relative;display:block;height:10px;border-radius:5px;background:#ebe9e3;margin-bottom:3px}#mb-root .mrtrack i{position:absolute;left:0;top:0;bottom:0;border-radius:5px}#mb-root .mrtrack i.ok{background:#879e07}#mb-root .mrtrack i.wa{background:#e0a100}#mb-root .mrtrack i.ri{background:#e03434}#mb-root .mrtrack em{position:absolute;top:-3px;bottom:-3px;width:2px;background:#171717}',
    '#mb-root .slbar{display:flex;height:30px;border-radius:10px;overflow:hidden;gap:2px;background:#f1f0ec}#mb-root .slseg{border:0;padding:0;cursor:pointer;color:#fff;font:600 11px/30px inherit}#mb-root .slseg.set,#mb-root .slleg i.set{background:#879e07}#mb-root .slseg.none,#mb-root .slleg i.none{background:#e03434}#mb-root .slseg.na,#mb-root .slleg i.na{background:repeating-linear-gradient(45deg,#9c9c9c 0 5px,#bdbdbd 5px 10px)}#mb-root .slseg.on{box-shadow:inset 0 0 0 3px #171717}',
    '#mb-root .slleg-w{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px}#mb-root .slleg{display:flex;align-items:center;gap:6px;border:1px solid var(--l1);background:#fff;border-radius:10px;padding:6px 10px;font:inherit;font-size:12.5px;cursor:pointer}#mb-root .slleg.on{border-color:var(--b);background:#f4f2ff}#mb-root .slleg i{width:10px;height:10px;border-radius:3px;display:inline-block}#mb-root .slleg span{color:var(--tx2)}',
    '#mb-root .ddg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px}#mb-root .ddg>div{background:#faf9f6;border-radius:10px;padding:8px 10px}#mb-root .ddg small{display:block;font-size:11px;color:var(--tx2)}#mb-root .ddg b{display:block;font-size:20px;color:var(--b)}#mb-root .ddg span{font-size:11.5px;color:#525252}#mb-root .ddc .ddg{grid-template-columns:1fr}',
    '@media (max-width:980px){#mb-root .mrw{grid-template-columns:1fr}}',
    '@media (max-width:760px){#mb-root .mrrow{grid-template-columns:1fr auto;row-gap:4px}#mb-root .mrbar{grid-column:1/-1;grid-row:2}#mb-root .ddg{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(st);
})();


/* ============================ v28 · Open positions chart types ============================
   Overview: diverging bar chart on one shared $ axis. Monitor: bullet chart for margin level with broker stop-out
   markers, and a single stacked bar for stop-loss coverage. Portfolios: underwater equity drawdown chart with
   hover / tap-drag / arrow-key inspection. All read pvScope (Long/Short applies to P/L and stop-loss exposure only). */
function niceMax(v) { if (!(v > 0)) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
function axisMoney(v) { var a = Math.abs(v), s = a >= 1000 ? '$' + (a / 1000).toFixed(a % 1000 ? 1 : 0) + 'k' : '$' + Math.round(a); return v === 0 ? '$0' : (v < 0 ? '−' : '+') + s; }

/* ---------- Overview · Unrealized P/L by instrument (diverging bars) ---------- */
function divChart(X) {
  var gi = pvGroup(X.pos, function (p) { return p.ins; }, function (k) { return k; }).sort(function (a, b) { return a.upl - b.upl; });
  var mx = niceMax(Math.max.apply(null, gi.map(function (r) { return Math.abs(r.upl); }).concat([1]))), half = 34;
  var rows = gi.map(function (r) {
    var w = Math.abs(r.upl) / mx * half, neg = r.upl < 0, on = S.posF.ins === r.k;
    return '<button class="dvrow' + (on ? ' on' : '') + '" data-a="pvinsT" data-v="' + esc(r.k) + '" data-pv-row="' + esc(r.k) + '" aria-pressed="' + on + '" aria-label="' + esc(r.k) + ' ' + sgn(r.upl) + ' unrealized, ' + r.n + ' position' + (r.n === 1 ? '' : 's') + '. Filter the Trade Tracker"><span class="dvn"><b>' + esc(r.k) + '</b><small>' + r.n + ' position' + (r.n === 1 ? '' : 's') + '</small></span>' +
      '<span class="dvtrack"><s></s>' + (r.upl ? '<i class="' + (neg ? 'n' : 'p') + '" style="' + (neg ? 'right:50%' : 'left:50%') + ';width:' + w.toFixed(2) + '%"></i>' : '') + '<em class="' + (neg ? 'neg' : r.upl ? 'pos' : '') + '" style="' + (neg ? 'right:' + (50 + w).toFixed(2) + '%' : 'left:' + (50 + w).toFixed(2) + '%') + '" data-dv-val="' + esc(r.k) + '">' + (r.upl === 0 ? '$0.00' : sgn(r.upl)) + '</em></span></button>';
  }).join('');
  var ticks = [-1, -0.5, 0, 0.5, 1].map(function (t) { return '<span style="left:' + (50 + t * half) + '%">' + axisMoney(t * mx) + '</span>'; }).join('');
  return '<div class="pvch" data-pv-chart="ins-upl"><h4>Unrealized P/L by instrument <small>losses left · gains right · total ' + sgn(X.upl) + '</small></h4>' + rows +
    '<div class="dvaxis" aria-hidden="true"><span></span><span class="dvticks">' + ticks + '</span></div></div>';
}
var _pvModule28 = pvModule;
pvModule = function (o) {
  var h = _pvModule28(o); if (!o || !o.ov) return h;
  var a = h.indexOf('<div class="pvch" data-pv-chart="ins-upl">'); if (a < 0) return h;
  var e = h.indexOf('</div>', a); return h.slice(0, a) + divChart(pvScope()) + h.slice(e + 6);
};

/* ---------- Monitor · Margin risk by account (bullet chart) ---------- */
marginRiskCard = function () {
  var X = pvScope(), SC = 400, rows = X.accs.map(function (a) {
    var none = a.status === 'none', ml = none ? null : mlvl(a), th = none ? null : mrThreshold(a);
    return { a: a, none: none, ml: ml, th: th, dist: ml != null && th != null ? Math.round(ml - th) : null, free: none ? null : r2(a.eq - a.mu) };
  });
  rows.sort(function (x, y) { if (x.none !== y.none) return x.none ? 1 : -1; var dx = x.dist == null ? x.ml : x.dist, dy = y.dist == null ? y.ml : y.dist; return dx - dy; });
  var px = function (v) { return Math.min(100, v / SC * 100).toFixed(2) + '%'; };
  var body = rows.map(function (r) {
    var a = r.a, st = a.status === 'stale', name = '<span class="mrn"><b>' + esc(accName(a)) + '</b><small>' + (st ? '<span class="warn">Last known ' + esc(a.snap) + '</span>' : esc(a.nick)) + '</small></span>';
    if (r.none) return '<div class="blrow un" data-mr-row="' + a.id + '">' + name + '<span class="fds na">Margin data unavailable</span><span></span><span></span><span class="mrd"><button class="lnk" data-a="pvmanage">Data status in Manage →</button></span></div>';
    var cls = r.ml < 100 ? 'ri' : r.ml < 150 ? 'wa' : 'ok', over = r.ml > SC;
    return '<button class="blrow" data-a="mracc" data-v="' + a.id + '" data-mr-row="' + a.id + '" aria-label="' + esc(accName(a)) + ': margin level ' + pct(r.ml) + ', free margin ' + usd(r.free) + (r.th != null ? ', ' + r.dist + ' points above ' + r.th + '% stop-out' : ', threshold unavailable') + '. Open positions">' + name +
      '<span class="bullet"><span class="bband" style="left:0;width:' + px(100) + '"></span><span class="bband w" style="left:' + px(100) + ';width:' + (50 / SC * 100) + '%"></span><i class="' + cls + '" style="width:' + px(r.ml) + '"></i>' + (over ? '<b class="bover">›</b>' : '') + (r.th != null ? '<em style="left:' + px(r.th) + '" title="Stop-out ' + r.th + '%"></em>' : '') + '</span>' +
      '<span class="blv"><b class="' + (cls === 'ri' ? 'bad' : '') + '" data-mr-ml="' + a.id + '">' + pct(r.ml) + '</b><small>margin level</small></span>' +
      '<span class="blv"><b data-mr-free="' + a.id + '" class="' + (r.free < 0 ? 'bad' : '') + '">' + usd(r.free) + '</b><small>free margin</small></span>' +
      '<span class="mrd" data-mr-dist="' + a.id + '">' + (r.th == null ? '<span class="mut">Threshold unavailable</span>' : '<b>' + (r.dist >= 0 ? r.dist.toLocaleString('en-US') + ' pts' : '<span class="bad">' + Math.abs(r.dist) + ' pts below</span>') + '</b><small>to ' + r.th + '% stop-out</small>') + '</span></button>';
  }).join('');
  var ticks = [0, 100, 200, 300, 400].map(function (t) { return '<span style="left:' + (t / SC * 100) + '%">' + t + '%' + (t === SC ? '+' : '') + '</span>'; }).join('');
  return '<div class="card pad mb16" data-section="margin-risk"><div class="ch"><div><h3>Margin risk by account</h3><div class="lbl">Full-account margin level · most urgent first · Direction doesn’t change these</div></div><span class="bleg"><i class="mk"></i>Broker stop-out (demo values) <i class="bd1"></i>&lt;100% <i class="bd2"></i>100–150%</span></div>' +
    (rows.length ? body + '<div class="blaxis" aria-hidden="true"><span></span><span class="blticks">' + ticks + '</span></div>' : '<div class="mut">No accounts in this scope.</div>') + '</div>';
};

/* ---------- Monitor · Stop-loss coverage (single stacked bar) ---------- */
stopCard = function () {
  var X = pvScope(), g = { set: { v: 0, n: 0 }, none: { v: 0, n: 0 }, na: { v: 0, n: 0 } }, tot = 0;
  X.pos.forEach(function (p) { var k = slKey(p), v = Math.abs(p.usd); g[k].v += v; g[k].n++; tot += v; });
  var keys = ['set', 'none', 'na'];
  var segs = keys.filter(function (k) { return g[k].n; }).map(function (k) {
    var w = tot ? g[k].v / tot * 100 : 0, lab = SLK[k] + ' · ' + g[k].n;
    return '<button class="slseg sl-' + k + (S.mon.slf === k ? ' on' : '') + (S.mon.slf && S.mon.slf !== k ? ' dim' : '') + '" style="width:' + w.toFixed(2) + '%" data-a="mslf" data-v="' + k + '" data-sl-seg="' + k + '" aria-pressed="' + (S.mon.slf === k) + '" aria-label="' + SLK[k] + ': ' + usd0(g[k].v) + ' gross, ' + g[k].n + ' positions. Filter Holdings">' + (w >= 22 ? '<span>' + lab + '</span><small>' + usd0(g[k].v) + '</small>' : w >= 9 ? '<span>' + g[k].n + '</span>' : '') + '</button>';
  }).join('');
  var leg = keys.map(function (k) { return '<button class="slleg' + (S.mon.slf === k ? ' on' : '') + '" data-a="mslf" data-v="' + k + '"' + (g[k].n ? '' : ' disabled') + '><i class="sl-' + k + '"></i><b>' + SLK[k] + '</b><span data-sl-amt="' + k + '">' + usd0(g[k].v) + ' · ' + g[k].n + ' position' + (g[k].n === 1 ? '' : 's') + (tot ? ' · ' + Math.round(g[k].v / tot * 100) + '%' : '') + '</span></button>'; }).join('');
  return '<div class="card pad mb16" data-section="stop-status"><div class="ch"><div><h3>Stop-loss coverage</h3><div class="lbl">Gross exposure ' + usd0(Math.round(tot)) + ' across ' + X.n + ' position' + (X.n === 1 ? '' : 's') + (X.dir ? ' · ' + dirName(X.dir) + ' only' : '') + ' · gross, so offsetting positions stay visible</div></div>' + (S.mon.slf ? '<button class="btn sm" data-a="mslfclr" data-sl-clear>× Clear · ' + SLK[S.mon.slf] + '</button>' : '') + '</div>' +
    (X.n ? '<div class="slbar" role="group" aria-label="Stop-loss coverage by gross exposure">' + segs + '</div>' : '<div class="mut">No open positions.</div>') + '<div class="slleg-w">' + leg + '</div><div class="lbl">Click a segment to filter Holdings. Stop data unavailable: XM’s partner feed doesn’t send stop-loss fields (demo).</div></div>';
};

/* ---------- Portfolios · Equity drawdown (underwater chart) ---------- */
function uwCalc() {
  var X = pvScope(), ids = X.rep.map(function (a) { return a.id; }).filter(function (id) { return EQ[id]; });
  if (!ids.length || !rangeOK() || rangeEnd() - rangeStart() < 2) return { ok: false, X: X };
  var s = eqAdj(ids), pkAll = -Infinity, pkAllI = 0; for (var i = 0; i <= 30; i++) if (s[i] > pkAll) { pkAll = s[i]; pkAllI = i; }
  var a0 = rangeStart(), a1 = rangeEnd(), rp = -Infinity, rpI = a0, pts = [], mdd = 0, mI = -1, mPk = a0;
  for (var j = a0; j <= a1; j++) { if (s[j] > rp) { rp = s[j]; rpI = j; } var d = rp > 0 ? (rp - s[j]) / rp : 0; pts.push({ i: j, eq: s[j], pk: rp, pkI: rpI, dd: r2(rp - s[j]), pc: d }); if (d > mdd) { mdd = d; mI = j; mPk = rpI; } }
  var stale = X.rep.filter(function (a) { return a.status === 'stale' && ids.indexOf(a.id) >= 0; });
  return { ok: true, X: X, s: s, pts: pts, cur: pkAll > 0 ? (pkAll - s[30]) / pkAll : 0, curAbs: r2(pkAll - s[30]), pkAllI: pkAllI, mdd: mdd, mAbs: mI >= 0 ? r2(s[mPk] - s[mI]) : 0, mI: mI, mPk: mPk, stale: stale };
}
function uwHead(c) {
  return '<div class="ddg"><div><small>Current drawdown</small><b data-dd-cur>' + (c.cur > 0 ? '−' + (c.cur * 100).toFixed(1) + '%' : '0.0%') + '</b><span>' + (c.cur > 0 ? '−$' + f2(c.curAbs) + ' below the ' + DAYS[c.pkAllI] + ' peak' : 'At peak') + ' · latest ' + DAYS[30] + '</span></div>' +
    '<div><small>Max drawdown · ' + esc(rangeLabel()) + '</small><b data-dd-max>' + (c.mdd > 0 ? '−' + (c.mdd * 100).toFixed(1) + '%' : '0.0%') + '</b><span>' + (c.mdd > 0 ? '−$' + f2(c.mAbs) + ' · peak ' + DAYS[c.mPk] + ' → trough ' + DAYS[c.mI] : 'No drawdown in period') + '</span></div></div>';
}
function uwSvg(c) {
  var W = Math.max(300, Math.min(640, (root.clientWidth || 720) - 84)), H = W < 480 ? 190 : 210, L = 46, R = 12, T = 12, B = 26, n = c.pts.length, ymax = niceMax(Math.max(c.mdd * 100, 0.5));
  var X = function (k) { return L + k * (W - L - R) / Math.max(1, n - 1); }, Y = function (pc) { return T + pc * 100 / ymax * (H - T - B); };
  var g = '';
  for (var t = 0; t <= 4; t++) { var v = ymax * t / 4, y = T + t / 4 * (H - T - B); g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + (t ? '#efece6' : '#9c9c9c') + '"' + (t ? ' stroke-dasharray="3 4"' : '') + '/><text x="' + (L - 6) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" font-size="10" fill="#737373">' + (v ? '−' + (+v.toFixed(2)) + '%' : '0%') + '</text>'; }
  [0, Math.floor((n - 1) / 2), n - 1].forEach(function (k, j) { g += '<text x="' + X(k).toFixed(1) + '" y="' + (H - 8) + '" font-size="10" fill="#737373" text-anchor="' + (j === 0 ? 'start' : j === 2 ? 'end' : 'middle') + '">' + DAYS[c.pts[k].i] + '</text>'; });
  var line = c.pts.map(function (p, k) { return X(k).toFixed(1) + ',' + Y(p.pc).toFixed(1); }).join(' ');
  var area = '<polygon points="' + X(0).toFixed(1) + ',' + T + ' ' + line + ' ' + X(n - 1).toFixed(1) + ',' + T + '" fill="#5945f1" fill-opacity=".16"/><polyline points="' + line + '" fill="none" stroke="#5945f1" stroke-width="2" stroke-linejoin="round"/>';
  var mk = '';
  if (c.mI >= 0) {
    var kp = c.mPk - c.pts[0].i, kt = c.mI - c.pts[0].i;
    mk = '<circle cx="' + X(kp).toFixed(1) + '" cy="' + T + '" r="5" fill="#fff" stroke="#16a34a" stroke-width="2" data-uw-peak/><text x="' + X(kp).toFixed(1) + '" y="' + (T + 18) + '" font-size="10" font-weight="700" fill="#15803d" text-anchor="' + (kp < n / 2 ? 'start' : 'end') + '">Peak ' + DAYS[c.mPk] + '</text>' +
      '<circle cx="' + X(kt).toFixed(1) + '" cy="' + Y(c.mdd).toFixed(1) + '" r="5" fill="#e03434" stroke="#fff" stroke-width="2" data-uw-trough/><text x="' + X(kt).toFixed(1) + '" y="' + (Y(c.mdd) - 9).toFixed(1) + '" font-size="10" font-weight="700" fill="#b42318" text-anchor="' + (kt < n / 2 ? 'start' : 'end') + '">Trough ' + DAYS[c.mI] + ' −' + (c.mdd * 100).toFixed(1) + '%</text>';
  }
  var guide = '<line data-uw-guide x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="#171717" stroke-width="1" visibility="hidden"/><circle data-uw-dot r="4" cx="0" cy="0" fill="#171717" visibility="hidden"/>';
  return { svg: '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-hidden="true">' + g + area + mk + guide + '</svg>', W: W, xs: c.pts.map(function (p, k) { return +X(k).toFixed(1); }), ys: c.pts.map(function (p) { return +Y(p.pc).toFixed(1); }) };
}
drawdown = function (compact) {
  var c = uwCalc(), head = '<div class="ch"><div><h3>Equity drawdown</h3><div class="lbl">Full account · ' + esc(scopeName()) + ' · deposits and withdrawals removed · Direction doesn’t apply</div></div><span class="tag gr" style="margin:0">Simulated equity history</span></div>';
  if (!c.ok) return '<div class="card pad mb16' + (compact ? ' ddc' : '') + '" data-section="drawdown" data-dd-state="na">' + head + '<div class="na" style="min-height:90px" data-dd-na><b style="color:#171717">Drawdown unavailable</b><span>Not enough equity history for ' + esc(scopeName()) + (rangeOK() ? ' in ' + esc(rangeLabel()) : '') + '.</span></div></div>';
  var stale = c.stale.length ? '<div class="lbl" data-dd-stale><span class="tag wa" style="margin:0 6px 0 0">Last known</span>' + c.stale.map(function (a) { return esc(accName(a)) + ' is held at its ' + esc(a.snap) + ' value after that date'; }).join(', ') + '</div>' : '';
  if (compact) return '<div class="card pad mb16 ddc" data-section="drawdown" data-dd-state="ok">' + head + uwHead(c) + stale + '</div>';
  var v = uwSvg(c), data = { xs: v.xs, ys: v.ys, W: v.W, p: c.pts.map(function (p) { return [DAYS[p.i] + ' 2026', p.eq, p.pk, DAYS[p.pkI], p.dd, +(p.pc * 100).toFixed(2)]; }) };
  return '<div class="card pad mb16" data-section="drawdown" data-dd-state="ok">' + head + uwHead(c) + stale +
    '<div class="uw" data-uw="' + esc(JSON.stringify(data)) + '"><div class="uwsvg" tabindex="0" role="slider" aria-label="Underwater equity chart. Use left and right arrows to inspect dates" aria-valuemin="0" aria-valuemax="' + (c.pts.length - 1) + '" aria-valuenow="' + (c.pts.length - 1) + '" aria-valuetext="' + esc(DAYS[c.pts[c.pts.length - 1].i]) + '">' + v.svg + '</div><div class="uwtip" data-uw-tip role="status" aria-live="polite" hidden></div></div>' +
    '<div class="lbl" style="margin-top:6px">Hover, tap or drag the chart, or focus it and use ← →, to inspect a date. Equity is shown after removing deposits and withdrawals.</div></div>';
};
function uwSet(box, k) {
  var D; try { D = JSON.parse(box.getAttribute('data-uw')); } catch (e) { return; }
  k = Math.max(0, Math.min(D.p.length - 1, k)); box.setAttribute('data-uw-i', k);
  var svg = box.querySelector('svg'), gl = svg.querySelector('[data-uw-guide]'), dot = svg.querySelector('[data-uw-dot]'), tip = box.querySelector('[data-uw-tip]'), p = D.p[k], x = D.xs[k];
  gl.setAttribute('x1', x); gl.setAttribute('x2', x); gl.setAttribute('visibility', 'visible'); dot.setAttribute('cx', x); dot.setAttribute('cy', D.ys[k]); dot.setAttribute('visibility', 'visible');
  tip.hidden = false; tip.innerHTML = '<b>' + esc(p[0]) + '</b><span>Equity <b>' + usd(p[1]) + '</b></span><span>Prior peak <b>' + usd(p[2]) + '</b> · ' + esc(p[3]) + '</span><span>Drawdown <b class="' + (p[4] > 0 ? 'neg' : '') + '">' + (p[4] > 0 ? '−$' + f2(p[4]) + ' · −' + p[5].toFixed(2) + '%' : '$0.00 · 0%') + '</b></span>';
  var pctX = x / D.W * 100; tip.style.left = pctX + '%'; tip.style.transform = 'translateX(' + (pctX > 70 ? '-100%' : pctX < 30 ? '0' : '-50%') + ')';
  var s = box.querySelector('.uwsvg'); s.setAttribute('aria-valuenow', k); s.setAttribute('aria-valuetext', p[0] + ', drawdown ' + p[5].toFixed(2) + ' percent');
}
function uwAt(box, clientX) { var D = JSON.parse(box.getAttribute('data-uw')), r = box.querySelector('svg').getBoundingClientRect(), x = (clientX - r.left) / r.width * D.W, best = 0; D.xs.forEach(function (v, k) { if (Math.abs(v - x) < Math.abs(D.xs[best] - x)) best = k; }); uwSet(box, best); }
root.addEventListener('pointermove', function (e) { var b = e.target.closest && e.target.closest('[data-uw]'); if (b && e.target.closest('.uwsvg')) uwAt(b, e.clientX); });
root.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('[data-uw]'); if (b && e.target.closest('.uwsvg')) uwAt(b, e.clientX); });
root.addEventListener('pointerleave', function () {}, true);
root.addEventListener('mouseout', function (e) { var s = e.target.closest && e.target.closest('.uwsvg'); if (!s || (e.relatedTarget && s.contains(e.relatedTarget)) || document.activeElement === s) return; var b = s.closest('[data-uw]'), t = b.querySelector('[data-uw-tip]'); t.hidden = true; b.querySelectorAll('[data-uw-guide],[data-uw-dot]').forEach(function (el) { el.setAttribute('visibility', 'hidden'); }); });
root.addEventListener('keydown', function (e) {
  var s = e.target.closest && e.target.closest('.uwsvg'); if (!s) return; var b = s.closest('[data-uw]'), n = JSON.parse(b.getAttribute('data-uw')).p.length, k = b.hasAttribute('data-uw-i') ? +b.getAttribute('data-uw-i') : n - 1;
  var m = { ArrowLeft: k - 1, ArrowRight: k + 1, Home: 0, End: n - 1 }; if (!(e.key in m)) return; e.preventDefault(); e.stopPropagation(); uwSet(b, m[e.key]);
});
root.addEventListener('focusin', function (e) { var s = e.target.closest && e.target.closest('.uwsvg'); if (s) { var b = s.closest('[data-uw]'); uwSet(b, b.hasAttribute('data-uw-i') ? +b.getAttribute('data-uw-i') : JSON.parse(b.getAttribute('data-uw')).p.length - 1); } });

(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v28', '1');
  st.textContent = [
    '#mb-root .dvrow,#mb-root .dvaxis{display:grid;grid-template-columns:96px 1fr;gap:10px;align-items:center}#mb-root .dvrow{width:100%;border:0;background:none;padding:6px 4px;border-radius:8px;font:inherit;text-align:left;cursor:pointer;color:#171717}#mb-root .dvrow:hover,#mb-root .dvrow.on{background:#f1efff}#mb-root .dvrow:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .dvn b{display:block;font-size:13px}#mb-root .dvn small{display:block;font-size:11px;color:var(--tx2)}',
    '#mb-root .dvtrack{position:relative;display:block;height:22px}#mb-root .dvtrack s{position:absolute;left:50%;top:-4px;bottom:-4px;border-left:1.5px solid #8a8a8a}#mb-root .dvtrack i{position:absolute;top:3px;bottom:3px;border-radius:3px}#mb-root .dvtrack i.p{background:#879e07}#mb-root .dvtrack i.n{background:#5945f1}',
    '#mb-root .dvtrack em{position:absolute;top:2px;font-style:normal;font-size:11.5px;font-weight:700;white-space:nowrap;padding:0 4px;font-variant-numeric:tabular-nums}',
    '#mb-root .dvaxis{padding:0 4px;margin-top:2px}#mb-root .dvticks{position:relative;height:16px;border-top:1px solid #d9d6cf}#mb-root .dvticks span{position:absolute;top:2px;transform:translateX(-50%);font-size:10px;color:var(--tx2);white-space:nowrap}',
    '#mb-root .blrow{display:grid;grid-template-columns:140px minmax(120px,1fr) 70px 100px 130px;gap:12px;align-items:center;width:100%;border:0;border-top:1px solid #f3f2ee;background:none;padding:10px 4px;font:inherit;text-align:left;color:#171717;cursor:pointer}#mb-root .blrow:hover{background:#f7f5ff}#mb-root .blrow:focus-visible{outline:2px solid var(--b)}#mb-root .blrow.un{cursor:default}#mb-root .blrow.un:hover{background:none}',
    '#mb-root .bullet{position:relative;display:block;height:20px;background:#f1f0ec;border-radius:4px;overflow:visible}#mb-root .bband{position:absolute;top:0;bottom:0;background:#fbe3e3}#mb-root .bband.w{background:#fdf0dc}#mb-root .bullet i{position:absolute;left:0;top:6px;height:8px;border-radius:2px}#mb-root .bullet i.ok{background:#3f4d03}#mb-root .bullet i.wa{background:#b45309}#mb-root .bullet i.ri{background:#e03434}',
    '#mb-root .bullet em{position:absolute;top:-3px;bottom:-3px;width:3px;margin-left:-1.5px;background:#171717;border-radius:1px}#mb-root .bover{position:absolute;right:-12px;top:0;font-size:14px;color:#3f4d03}',
    '#mb-root .blv{text-align:right;font-variant-numeric:tabular-nums}#mb-root .blv b{display:block;font-size:13.5px}#mb-root .blv small{display:block;font-size:10.5px;color:var(--tx2)}',
    '#mb-root .blaxis{display:grid;grid-template-columns:140px minmax(120px,1fr) 70px 100px 130px;gap:12px;padding:0 4px}#mb-root .blticks{position:relative;height:16px;border-top:1px solid #d9d6cf}#mb-root .blticks span{position:absolute;top:2px;transform:translateX(-50%);font-size:10px;color:var(--tx2)}#mb-root .blticks span:last-child{transform:translateX(-100%)}',
    '#mb-root .bleg{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--tx2)}#mb-root .bleg i{display:inline-block;width:10px;height:10px;border-radius:2px}#mb-root .bleg .mk{width:3px;height:12px;background:#171717}#mb-root .bleg .bd1{background:#fbe3e3}#mb-root .bleg .bd2{background:#fdf0dc}',
    '#mb-root .slbar{height:44px}#mb-root .slseg{display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;overflow:hidden;white-space:nowrap}#mb-root .slseg span{font-size:11.5px;font-weight:700}#mb-root .slseg small{font-size:10.5px;font-weight:500;opacity:.9}#mb-root .slseg.sl-set,#mb-root .slleg i.sl-set{background:#879e07}#mb-root .slseg.sl-none,#mb-root .slleg i.sl-none{background:#e03434}#mb-root .slseg.sl-na,#mb-root .slleg i.sl-na{background:repeating-linear-gradient(45deg,#9c9c9c 0 5px,#bdbdbd 5px 10px);color:#171717}#mb-root .slseg.dim{opacity:.35}#mb-root .slseg:focus-visible{outline:2px solid #171717;outline-offset:-2px}',
    '#mb-root .uw{position:relative;margin-top:6px}#mb-root .uwsvg{outline:0;border-radius:8px;touch-action:pan-y;cursor:crosshair}#mb-root .uwsvg:focus-visible{box-shadow:0 0 0 2px var(--b)}',
    '#mb-root .uwtip{position:absolute;top:4px;background:#171717;color:#fff;border-radius:10px;padding:8px 10px;font-size:11.5px;line-height:1.5;pointer-events:none;display:flex;flex-direction:column;min-width:170px;z-index:3}#mb-root .uwtip[hidden]{display:none}#mb-root .uwtip b{font-weight:700}#mb-root .uwtip .neg{color:#cfc8ff}',
    '@media (max-width:760px){#mb-root .blrow,#mb-root .blaxis{grid-template-columns:1fr 1fr;row-gap:6px}#mb-root .blrow .bullet{grid-column:1/-1;grid-row:2}#mb-root .blrow .mrd{grid-column:2;grid-row:1}#mb-root .blrow .blv{grid-row:3;text-align:left}#mb-root .blaxis span:first-child{display:none}#mb-root .blaxis .blticks{grid-column:1/-1}#mb-root .dvrow,#mb-root .dvaxis{grid-template-columns:72px 1fr}}'
  ].join('\n');
  document.head.appendChild(st);
})();


/* ============================ v29 · Monitor views inside the Open positions card ============================
   Open positions view only: the Monitor view bar moves into the Open positions card, with Charts (the
   instrument / account bars) first and Margin risk added at the end. The selected view renders inside the card.
   Alerts sits apart at the right of the bar. Stop-loss coverage and Equity drawdown follow the card. */
var PVT_OWN = ['charts', 'margin', 'stoploss', 'drawdown'];
/* the card's own views live in S.pvtView; S.mon.view only ever holds the Monitor's native values */
function pvtV() { return S.pvtView || S.mon.view; }
function pvtFind(d, label) {
  var L = d.querySelectorAll('button,[data-a]');
  for (var i = 0; i < L.length; i++) { var t = (L[i].textContent || '').replace(/\s+/g, ' ').trim(); if (t === label || t.indexOf(label + ' ') === 0 || (label === 'Alerts' && t.indexOf('Alerts') === 0)) return L[i]; }
  return null;
}
function pvtParse(h) { var d = document.createElement('div'); d.innerHTML = h; return d; }
function pvtOwn() {
  var v = pvtV(), opts = [['charts', 'Charts'], ['tiles', 'Tiles'], ['holdings', 'Holdings'], ['matrix', 'Matrix'], ['map', 'Map'], ['currency', 'Exposure'], ['margin', 'Margin risk'], ['stoploss', 'Stop-loss'], ['drawdown', 'Drawdown']];
  return '<span class="seg" role="group" aria-label="Open positions view">' + opts.map(function (o) { return '<button data-a="pvt" data-v="' + o[0] + '" class="' + (v === o[0] ? 'on' : '') + '" aria-pressed="' + (v === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</span>';
}
function pvtBar() {
  var v = pvtV(), nat = S.mon.view, html = '', al = '';
  try {
    S.mon.view = 'tiles'; var dOn = pvtParse(monToolbar());
    S.mon.view = 'holdings'; var dOff = pvtParse(monToolbar());
    S.mon.view = nat; var d = pvtParse(monToolbar());
    var tOn = pvtFind(dOn, 'Tiles'), tOff = pvtFind(dOff, 'Tiles'), tiles = pvtFind(d, 'Tiles'), alerts = pvtFind(d, 'Alerts');
    if (!tOn || !tOff || !tiles) throw 0;
    var cOn = (tOn.getAttribute('class') || '').split(/\s+/).filter(Boolean), cOff = (tOff.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    var onCls = cOn.filter(function (c) { return cOff.indexOf(c) < 0; }), offCls = cOff.filter(function (c) { return cOn.indexOf(c) < 0; });
    var attrs = [].slice.call(tOn.attributes).filter(function (a) { return a.name !== 'class' && a.name !== 'data-a' && a.name !== 'data-v' && tOff.getAttribute(a.name) !== a.value; }).map(function (a) { return [a.name, a.value, tOff.getAttribute(a.name)]; });
    var setOn = function (b, on) {
      (on ? offCls : onCls).forEach(function (c) { b.classList.remove(c); }); (on ? onCls : offCls).forEach(function (c) { b.classList.add(c); });
      attrs.forEach(function (a) { var val = on ? a[1] : a[2]; if (val == null) b.removeAttribute(a[0]); else b.setAttribute(a[0], val); });
    };
    var make = function (val, label) { var b = tiles.cloneNode(false); b.removeAttribute('data-pvt-orig'); b.removeAttribute('data-pvt-v'); b.setAttribute('data-a', 'pvt'); b.setAttribute('data-v', val); b.setAttribute('data-pvt', val); b.removeAttribute('title'); b.textContent = label; setOn(b, v === val); return b; };
    tiles.parentNode.insertBefore(make('charts', 'Charts'), tiles);
    var cur = pvtFind(d, 'Currency'), mr = make('margin', 'Margin risk');
    if (cur && cur.parentNode === tiles.parentNode) cur.parentNode.insertBefore(mr, cur.nextSibling); else tiles.parentNode.appendChild(mr);
    var sl = make('stoploss', 'Stop-loss'); mr.parentNode.insertBefore(sl, mr.nextSibling);
    sl.parentNode.insertBefore(make('drawdown', 'Drawdown'), sl.nextSibling);
    var route = function (b, key) { b.setAttribute('data-pvt-orig', b.getAttribute('data-a') || ''); b.setAttribute('data-pvt-v', b.getAttribute('data-v') || key); b.setAttribute('data-a', 'pvt'); b.setAttribute('data-v', key); };
    [['Tiles', 'tiles'], ['Holdings', 'holdings'], ['Matrix', 'matrix'], ['Map', 'map'], ['Currency', 'currency']].forEach(function (x) { var b = pvtFind(d, x[0]); if (!b || b.getAttribute('data-pvt')) return; if (S.pvtView || v === 'alerts') setOn(b, false); route(b, x[1]); if (x[1] === 'currency') b.textContent = 'Exposure'; });
    if (alerts) {
      var n = (alerts.textContent || '').replace(/\D+/g, ' ').trim(), a = alerts.cloneNode(false);
      a.setAttribute('class', 'pvt-al' + (v === 'alerts' ? ' on' : '')); a.setAttribute('aria-pressed', String(v === 'alerts'));
      a.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>Alerts' + (n ? ' <b>' + esc(n.split(' ')[0]) + '</b>' : '');
      route(a, 'alerts'); al = a.outerHTML; alerts.parentNode.removeChild(alerts);
    }
    html = d.innerHTML;
  } catch (e) {
    S.mon.view = nat; html = pvtOwn();
    al = '<button class="pvt-al' + (v === 'alerts' ? ' on' : '') + '" data-a="pvt" data-v="alerts" aria-pressed="' + (v === 'alerts') + '">Alerts</button>';
  }
  return '<div class="pvtw" data-pvt-bar>' + html + al + '</div>';
}
function pvtBody(v) {
  if (v === 'margin') return marginRiskCard();
  if (v === 'stoploss') return stopCard();
  if (v === 'drawdown') return drawdown(false);
  if (v === 'alerts') return typeof monAlertsView === 'function' ? monAlertsView() : '';
  var chip = v === 'holdings' && S.mon.slf ? '<div class="lbl mb16" data-hold-slf>Holdings filtered to <b>' + SLK[S.mon.slf] + '</b> · <button class="lnk" data-a="mslfclr">Show all positions</button></div>' : '';
  return chip + (v === 'holdings' ? monHoldings() : v === 'matrix' ? monMatrix() : v === 'map' ? monMap() : v === 'currency' ? monCurrency() : monTiles());
}
function pvtCard() {
  if (!S.pvtInit) { S.pvtInit = true; if (S.mon.view === 'tiles') S.pvtView = 'charts'; }
  var v = pvtV();
  if (v === 'alerts' && typeof monAlertsView !== 'function') return null;
  var card = pvModule({ charts: v === 'charts' }), bar = pvtBar(), e = card.lastIndexOf('</div>');
  var inner = v === 'charts' ? '' : '<div class="pvtb" data-pvt-body data-mon-view="' + v + '">' + pvtBody(v) + '</div>';
  if (v === 'charts') { var c = card.indexOf('<div class="pvcharts">'); card = c >= 0 ? card.slice(0, c) + bar + '<div data-pvt-body data-mon-view="charts">' + card.slice(c, e) + '</div>' + card.slice(e) : card.slice(0, e) + bar + card.slice(e); }
  else card = card.slice(0, e) + bar + inner + card.slice(e);
  return card;
}
monitor = (function (prev) {
  return function () { if (!pvOn() || pvHist()) return prev(); try { var c = pvtCard(); return c == null ? prev() : c; } catch (e) { pvtErr(e); S.pvtView = null; return prev(); } };
})(monitor);
/* Portfolios (Open positions view): the same tabbed card, then the portfolio's positions and closed trades */
portfolios = (function (prev) {
  return function () {
    if (!pvOn() || S.pfView === 'analytics' || pvHist()) return prev();
    var c; try { c = pvtCard(); if (c == null) { S.pvtView = 'charts'; c = pvtCard(); } } catch (e) { pvtErr(e); S.pvtView = null; return prev(); }
    var h = prev(), k = h.indexOf('<div class="card pad mb16" data-section="pf-closed"');
    return pfBar() + c + pfPositions(pfAccounts()) + (k >= 0 ? h.slice(k) : '');
  };
})(portfolios);
function pvtErr(e) { try { console.error('[Open positions card]', e); } catch (x) {} }
H7.pvt = function (el, v) {
  if (!v) return; S.panel = null;
  var orig = el && el.getAttribute ? el.getAttribute('data-pvt-orig') : null;
  if (orig && H7[orig]) { S.pvtView = null; return H7[orig](el, el.getAttribute('data-pvt-v')); }
  if (PVT_OWN.indexOf(v) >= 0) { S.pvtView = v; if (S.mon.view === 'alerts') S.mon.view = 'tiles'; } else { S.pvtView = null; S.mon.view = v; }
  var k = root.scrollTop; render(); root.scrollTop = k;
  var t = root.querySelector('[data-pvt-bar] [data-pvt="' + v + '"]'), sc = t && t.closest('[data-pvt-bar]>*');
  if (t && sc && sc.scrollWidth > sc.clientWidth) { var tr = t.getBoundingClientRect(), sr = sc.getBoundingClientRect(); if (tr.left < sr.left || tr.right > sr.right) sc.scrollLeft += tr.left - sr.left - 16; }
};
var _pview29 = H7.pview;
H7.pview = function (el, v) {
  if (v === 'positions' && S.view !== v && S.mon.view === 'tiles') S.pvtView = 'charts';
  if (v === 'status' && S.view !== v) S.pvtView = null;
  return _pview29.apply(this, arguments);
};
/* never leave a card-only value in the Monitor's own state (other code looks views up by that name) */
function pvtFix() { if (PVT_OWN.indexOf(S.mon.view) >= 0) { S.pvtView = S.mon.view; S.mon.view = 'tiles'; } }
pvtFix();
var _monStatus29 = monitor;
monitor = function () { pvtFix(); return _monStatus29(); };
/* Overview · Unrealized P/L by instrument: a bar opens its positions, like every other bar */
H7.pvinsT = function (el, v) { var X = pvScope(), L = X.pos.filter(function (p) { return p.ins === v; }); if (L.length) pvPanel(v + ' · ' + pvName(X), L); };
var _divChart29 = divChart;
divChart = function (X) { return _divChart29(X).split('. Filter the Trade Tracker').join('. Show these positions'); };
var _mslf29 = H7.mslf;
H7.mslf = function () {
  S.pvtView = null; _mslf29.apply(this, arguments);
  var b = root.querySelector('[data-pvt-bar]'); if (b && pvOn() && (S.tab === 'monitor' || S.tab === 'portfolios')) { var r = b.getBoundingClientRect(), rr = root.getBoundingClientRect(); if (r.top < rr.top || r.top > rr.bottom - 80) root.scrollTop += r.top - rr.top - 16; }
};

(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v29', '1');
  st.textContent = [
    '#mb-root .pvtw{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:18px 0 14px;padding-top:16px;border-top:1px solid #eeeae5}',
    '#mb-root .pvtw>:first-child{flex:1 1 auto;min-width:0;margin:0}',
    '#mb-root .pvt-al{display:inline-flex;align-items:center;gap:6px;border:1px solid #e3e0dc;background:#fff;border-radius:999px;height:32px;padding:0 12px;font:inherit;font-size:13px;font-weight:600;color:#3f3f46;cursor:pointer}',
    '#mb-root .pvt-al:hover{border-color:#bdb8b1}#mb-root .pvt-al.on{border-color:#5945f1;color:#5945f1;background:#f4f2ff}',
    '#mb-root .pvt-al b{background:#5945f1;color:#fff;border-radius:999px;font-size:11px;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;padding:0 5px}',
    '#mb-root [data-pvt-body]>.card{border:0;box-shadow:none;background:transparent;padding:0;margin-bottom:0}',
    '#mb-root [data-pvt-body]>.card>.ch{margin-top:0}',
    '@media (max-width:760px){#mb-root .pvtw>:first-child{flex-basis:100%;overflow-x:auto}#mb-root .pvtw .seg{flex-wrap:nowrap}#mb-root .pvtw .seg button{white-space:nowrap}}'
  ].join('\n');
  document.head.appendChild(st);
})();


/* ============================ v30 · Data consistency check ============================
   1. Accounts added through Connect (sim: true) all received the same placeholder position (XAUUSD, +$12.40,
      $2,500 balance). Each now gets its own deterministic position set from its nickname and account number, and
      the account figures are rebuilt from those positions: P/L = sum of position P/L, equity = balance + P/L,
      margin used = sum of position margin. They also get equity and margin history so every chart includes them.
   2. Pepperstone (offered in Connect) had no broker record: wrong logo colour, no stop-out level, and the account
      drawer could fail. Added with demo values.
   3. Manage: the Connection column showed "undefined" for connected accounts; "Need attention" and "Cashback this
      month" were fixed numbers. Both are now counted from the accounts.
   4. Account drawer: the margin meter always said "50% stop-out"; it now uses the broker's level.
   5. Portfolios › Open positions: the Holdings / Matrix / Map / Currency / Tiles tabs ignored the portfolio and
      Direction filters. They now render from the same scope as the card's numbers. */
if (!BROKERS.some(function (b) { return b.id === 'Pepperstone'; })) BROKERS.push({ id: 'Pepperstone', ab: 'PP', col: '#0f766e' });
if (!BMETA.Pepperstone) BMETA.Pepperstone = { ms: 36, stop: 50, cover: ['Forex', 'Metals', 'Indices', 'Crypto', 'Stocks'] };

var D30_PX = { EURUSD: 1.0861, GBPUSD: 1.2710, USDJPY: 154.06, XAUUSD: 2643.85, BTCUSD: 96702, US500: 5918.4, GBPJPY: 193.53 };
/* only instruments the dashboard already knows (currency split, alerts, instrument lists) */
var D30_SET = {
  Scalp: [['BTCUSD', 'Buy', 0.05], ['EURUSD', 'Sell', 0.20]],
  Swing: [['GBPJPY', 'Buy', 0.30]],
  Razor: [['EURUSD', 'Buy', 0.50], ['XAUUSD', 'Sell', 0.05]],
  Standard: [['US500', 'Buy', 0.50]],
  Main: [['XAUUSD', 'Buy', 0.10]],
  Hedge: [['EURUSD', 'Sell', 0.30]]
};
var D30_ROT = [['XAUUSD', 'Buy', 0.10], ['EURUSD', 'Buy', 0.30], ['GBPJPY', 'Buy', 0.20], ['US500', 'Sell', 0.30], ['BTCUSD', 'Buy', 0.05]];
function d30num(a) { var n = parseInt(String(a.no || '').replace(/\D/g, ''), 10); if (!isFinite(n)) { n = 0; String(a.id).split('').forEach(function (c) { n += c.charCodeAt(0); }); } return n; }
function d30fmt(ins, v) { return ins === 'BTCUSD' ? Math.round(v).toLocaleString('en-US') : ins === 'XAUUSD' ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ins === 'US500' ? v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : /JPY$/.test(ins) ? v.toFixed(2) : v.toFixed(4); }
function d30leg(ins, side, lots, k, lev) {
  if (typeof INS !== 'undefined' && !INS[ins]) ins = 'EURUSD';
  var cu = D30_PX[ins], s = side === 'Buy' ? 1 : -1, off = ((k % 17) - 6);
  var step = ins === 'BTCUSD' ? 45 : ins === 'XAUUSD' ? 0.85 : ins === 'US500' ? 1.5 : /JPY$/.test(ins) ? 0.035 : 0.00022;
  var en = cu - s * off * step, diff = (cu - en) * s, pl, usd;
  if (ins === 'BTCUSD') { pl = diff * lots; usd = lots * cu; }
  else if (ins === 'XAUUSD') { pl = diff * lots * 100; usd = lots * 100 * cu; }
  else if (ins === 'US500') { pl = diff * lots * 10; usd = lots * cu; }
  else if (ins === 'USDJPY') { pl = diff * lots * 100000 / cu; usd = lots * 100000; }
  else if (ins === 'GBPJPY') { pl = diff * lots * 100000 / D30_PX.USDJPY; usd = lots * 100000 * 1.2710; }
  else { pl = diff * lots * 100000; usd = lots * 100000 * cu; }
  return { ins: ins, side: side, lots: lots, en: d30fmt(ins, en), cu: d30fmt(ins, cu), pl: r2(pl), usd: Math.round(usd) * s, m: r2(usd / lev) };
}
function d30series(end, k, amp) { var o = []; for (var i = 0; i < 31; i++) o.push(i === 30 ? end : r2(end * (0.965 + 0.035 * i / 30) + Math.sin(i * (0.6 + (k % 5) / 10)) * end * amp)); return o; }
function d30norm() {
  ACC.forEach(function (a) {
    if (!a.sim || a._d30) return;
    var k = d30num(a), lev = parseInt(String(a.lev || '1:500').split(':')[1], 10) || 500, mine = POS.filter(function (p) { return p.a === a.id; });
    var plan = (D30_SET[a.nick] || [D30_ROT[k % D30_ROT.length]]).slice();
    while (plan.length < mine.length) plan.push(D30_ROT[(k + plan.length) % D30_ROT.length]);
    mine.forEach(function (p, i) { var g = d30leg(plan[i][0], plan[i][1], plan[i][2], k + i * 7, lev); Object.keys(g).forEach(function (f) { p[f] = g[f]; }); });
    if (a.bal == null || a.bal === 2500) a.bal = 1500 + (k % 7) * 500 + (k % 100);
    a.pl = r2(mine.reduce(function (s, p) { return s + p.pl; }, 0)); a.eq = r2(a.bal + a.pl); a.mu = r2(mine.reduce(function (s, p) { return s + p.m; }, 0));
    a.today = r2(a.pl * 0.6); if (a.cb == null) a.cb = r2(mine.reduce(function (s, p) { return s + p.lots; }, 0) * 3.2); if (!a.lev) a.lev = '1:' + lev; if (!a.type) a.type = 'Standard';
    if (typeof EQ !== 'undefined' && !EQ[a.id]) EQ[a.id] = d30series(a.eq, k, 0.004);
    if (typeof MG !== 'undefined' && !MG[a.id]) MG[a.id] = d30series(a.mu, k + 3, 0.05);
    a._d30 = true;
  });
}
d30norm();
var _render30 = render;
render = function () { d30norm(); return _render30.apply(this, arguments); };

/* ---------- Manage: counted tiles, connection column ---------- */
var _manage30 = manage;
manage = function () {
  var h = _manage30.apply(this, arguments);
  var none = ACC.filter(function (a) { return a.status === 'none'; }).length, st = ACC.filter(function (a) { return a.status === 'stale'; }).length, n = none + st + 1;
  var cb = ACC.reduce(function (s, a) { return s + (a.cb || 0); }, 0);
  return h.split('<td>undefined</td>').join('<td>Partner API</td>')
    .replace('<b style="font-size:20px;color:#b45309">3</b><div class="lbl">1 sync failed · 1 delayed · 1 not a partner</div>', '<b style="font-size:20px;color:#b45309" data-attn-n>' + n + '</b><div class="lbl">' + none + ' sync failed · ' + st + ' delayed · 1 not a partner</div>')
    .replace('<b style="font-size:20px" class="pos">$77.90</b>', '<b style="font-size:20px" class="pos" data-cb-total>' + usd(cb) + '</b>');
};
/* ---------- Account drawer: broker stop-out on the meter ---------- */
if (typeof dOverview === 'function') {
  var _dOverview30 = dOverview;
  dOverview = function (a) {
    var m = BMETA[a.broker] || { stop: 0 }, h = _dOverview30.apply(this, arguments);
    return h.replace('<span>50% stop-out</span>', '<span>' + (m.stop > 0 ? m.stop + '% stop-out' : 'No stop-out level') + '</span>');
  };
}
/* ---------- Portfolios › Open positions: tab views use the portfolio and Direction scope ---------- */
var _pvtBody30 = pvtBody;
pvtBody = function (v) {
  if (S.tab !== 'portfolios' || ['tiles', 'holdings', 'matrix', 'map', 'currency'].indexOf(v) < 0) return _pvtBody30(v);
  var X = pvScope(), keepP = POS, keepD = S.mon.dir, out;
  try { POS = X.pos.slice(); S.mon.dir = X.dir || ''; out = _pvtBody30(v); }
  catch (e) { POS = keepP; S.mon.dir = keepD; out = _pvtBody30(v); }
  finally { POS = keepP; S.mon.dir = keepD; }
  return out;
};


/* ============================ v31 · More closed-trade history ============================
   The demo had 13 closed trades for 6 accounts, so many filter combinations (one account, Long or Short,
   1W) showed empty charts. Every reporting account now gets a month of synced history: about two trades a
   week, both directions, on the instruments it trades. XM stops at its last snapshot (21 Nov); IC Markets
   ••7724 has none. Accounts added through Connect get the same backfill (partner API history).
   New rows copy the shape of the existing rows, so every view that reads closed trades sees normal data. */
var G31_INS = ['EURUSD', 'XAUUSD', 'GBPJPY', 'BTCUSD', 'US500'];
function g31rand(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
function g31fill(c, tpl, k) {
  Object.keys(tpl).forEach(function (f) {
    if (f in c) return; var v = tpl[f];
    if (f === 'id') c.id = 'g31-' + k; else if (f === 'ticket') c.ticket = String(81000000 + k); else if (f === 'tUtc') { var h = (parseInt(c.t, 10) + 17) % 24; c.tUtc = (h < 10 ? '0' : '') + h + c.t.slice(2); }
    else if (Array.isArray(v)) c[f] = []; else if (v && typeof v === 'object') c[f] = {}; else if (typeof v === 'boolean') c[f] = false; else c[f] = v;
  });
  return c;
}
function g31trades(a) {
  var tpl = CLOSED.filter(function (c) { return !c.simClosed && !c.g31; })[0] || {}, n0 = d30num(a), last = a.status === 'stale' ? (typeof STALE_DAY !== 'undefined' ? STALE_DAY : 27) : 30, out = [];
  var own = POS.filter(function (p) { return p.a === a.id; }).map(function (p) { return p.ins; }).filter(function (x, j, L) { return L.indexOf(x) === j; }), pool = own.concat(G31_INS.filter(function (i) { return own.indexOf(i) < 0; }));
  for (var d = last, i = 0; d >= 0; i++) {
    var r = g31rand(n0 + i * 13), ins = pool[i % 3 === 2 ? (i + n0) % pool.length : i % Math.max(1, own.length || 1)], side = i % 2 === 0 ? 'Buy' : 'Sell';
    if (typeof INS !== 'undefined' && !INS[ins]) ins = 'EURUSD';
    var lots = ins === 'BTCUSD' ? 0.05 : ins === 'US500' ? 0.5 : ins === 'XAUUSD' ? 0.1 : [0.2, 0.3, 0.5][i % 3];
    var win = r > 0.42, mv = (0.4 + g31rand(n0 + i * 7) * 1.2) * (win ? 1 : -1);
    var cu = D30_PX[ins], step = ins === 'BTCUSD' ? 45 : ins === 'XAUUSD' ? 0.85 : ins === 'US500' ? 1.5 : /JPY$/.test(ins) ? 0.035 : 0.00022;
    var s = side === 'Buy' ? 1 : -1, en = cu * (1 - (30 - d) * 0.0008), ex = en + s * mv * step * 9, diff = (ex - en) * s;
    var gross = ins === 'BTCUSD' ? diff * lots : ins === 'XAUUSD' ? diff * lots * 100 : ins === 'US500' ? diff * lots * 10 : /JPY$/.test(ins) ? diff * lots * 100000 / D30_PX.USDJPY : diff * lots * 100000;
    var cm = ins === 'US500' ? 0 : r2(lots * 7), sp = r2(lots * 9), sw = d % 3 === 0 ? -r2(lots * 2) : 0, pl = r2(gross - cm + sw);
    var hh = d === 30 ? 8 + Math.floor(r * 3) : 8 + Math.floor(r * 11), mm = Math.floor(g31rand(n0 + i) * 60);
    out.push(g31fill({ day: d, t: (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm, a: a.id, ins: ins, side: side, lots: lots, en: d30fmt(ins, en), ex: d30fmt(ins, ex), sp: sp, cm: cm, sw: sw, cb: r2(lots * 3.2), pl: pl, g31: true }, tpl, n0 * 100 + i));
    d -= 2 + (i % 3 === 0 ? 2 : 1);
  }
  return out;
}
function g31add() {
  try { d30norm(); } catch (e) {}
  var add = [];
  ACC.forEach(function (a) { if (a.status === 'none' || a._g31) return; a._g31 = true; add = add.concat(g31trades(a)); });
  if (!add.length) return;
  add.forEach(function (c) { CLOSED.push(c); });
  CLOSED.sort(function (x, y) { return y.day - x.day || (y.t > x.t ? 1 : y.t < x.t ? -1 : 0); });
}
try { g31add(); } catch (e) { try { console.error('[closed-trade backfill]', e); } catch (x) {} }
var _render31 = render;
render = function () { try { g31add(); } catch (e) { try { console.error('[closed-trade backfill]', e); } catch (x) {} } return _render31.apply(this, arguments); };


/* ============================ v32 · Portfolio status uses the same tab bar, with full-account data ============================
   Monitor › Portfolio status now shows the same tabs as Open positions. Under Portfolio status each tab answers
   "how did the account do over the selected dates" (closed trades, equity, margin); under Open positions it shows the
   latest snapshot. Charts, Holdings, Matrix and Map switch to realized results for the date range; Currency uses its
   exposure mode; Tiles, Margin risk, Stop-loss and Drawdown are full-account already and say so. The selected tab
   stays selected when you switch views. */
function pvsTrades() {
  var X = pvScope(), ids = X.rep.map(function (a) { return a.id; }), dir = X.dir;
  var L = S.tab === 'portfolios' && typeof pfTrades === 'function' ? pfTrades() : closedIn(ids);
  return { X: X, L: L.filter(function (c) { return !dir || (typeof cdir === 'function' ? cdir(c) : (c.side === 'Buy' ? 'long' : 'short')) === dir; }) };
}
function pvsGroup(L, key, name) {
  var m = {}, o = [];
  L.forEach(function (c) { var k = key(c); if (!m[k]) { m[k] = { k: k, name: name(k), n: 0, pl: 0, w: 0 }; o.push(k); } m[k].n++; m[k].pl += c.pl; if (c.pl > 0) m[k].w++; });
  return o.map(function (k) { var g = m[k]; g.pl = r2(g.pl); return g; }).sort(function (a, b) { return b.pl - a.pl; });
}
function pvsNote(t) { return '<div class="lbl pvs-note" data-pvs-note>' + t + '</div>'; }
function pvsBody(v) {
  var D = pvsTrades(), L = D.L, X = D.X, rl = esc(rangeLabel());
  var empty = '<div class="na" style="min-height:90px">No closed trades for ' + esc(scopeName()) + (X.dir ? ' · ' + dirName(X.dir) : '') + ' in ' + rl + '</div>';
  if (v === 'charts') {
    if (!L.length) return empty;
    var gi = pvsGroup(L, function (c) { return c.ins; }, function (k) { return k; }), ga = pvsGroup(L, function (c) { return c.a; }, function (k) { return accName(acc(k)); });
    var val = function (r) { return '<b class="' + plc(r.pl) + '">' + sgn(r.pl) + '</b><small>' + Math.round(r.w / r.n * 100) + '% win</small>'; };
    return '<div class="pvcharts"><div class="pvch" data-pvs-chart="instrument"><h4>By instrument <small>realized P/L · ' + rl + '</small></h4>' + pvBars(gi, 'pl', 'pvsins', val) + '</div>' +
      '<div class="pvch" data-pvs-chart="account"><h4>By account <small>realized P/L · ' + rl + '</small></h4>' + pvBars(ga, 'pl', 'pvsacc', val) + '</div></div>';
  }
  if (v === 'holdings') {
    var rows = X.accs.map(function (a) {
      var t = L.filter(function (c) { return c.a === a.id; }), pl = r2(t.reduce(function (s, c) { return s + c.pl; }, 0)), w = t.filter(function (c) { return c.pl > 0; }).length;
      if (a.status === 'none') return '<tr data-pvs-acc="' + a.id + '"><td><b>' + esc(accName(a)) + '</b> <span class="mut">' + esc(a.nick || '') + '</span></td><td colspan="6" class="mut">No snapshot · not counted</td></tr>';
      return '<tr class="click" data-a="pvsacc" data-v="' + a.id + '" data-pvs-acc="' + a.id + '"><td><b>' + esc(accName(a)) + '</b> <span class="mut">' + esc(a.nick || '') + '</span>' + (a.status === 'stale' ? ' <span class="tag wa">Last known</span>' : '') + '</td><td class="r">' + usd(a.eq) + '</td><td class="r">' + usd(a.bal) + '</td><td class="r">' + (mlvl(a) == null ? '—' : pct(mlvl(a))) + '</td><td class="r">' + t.length + '</td><td class="r">' + (t.length ? Math.round(w / t.length * 100) + '%' : '—') + '</td><td class="r"><b class="' + plc(pl) + '">' + (t.length ? sgn(pl) : '—') + '</b></td></tr>';
    }).join('');
    return pvsNote('Account holdings for ' + esc(scopeName()) + ' · equity and margin are the latest snapshot; trades and realized P/L cover ' + rl) +
      '<div style="overflow-x:auto"><table class="num" data-table="pvs-holdings"><thead><tr><th>Account</th><th class="r">Equity</th><th class="r">Balance</th><th class="r">Margin level</th><th class="r">Trades</th><th class="r">Win rate</th><th class="r">Realized P/L</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  if (v === 'matrix') {
    if (!L.length) return empty;
    var ins = pvsGroup(L, function (c) { return c.ins; }, function (k) { return k; }), ac = X.rep.filter(function (a) { return L.some(function (c) { return c.a === a.id; }); });
    var cell = function (i, a) { var t = L.filter(function (c) { return c.ins === i && c.a === a; }); if (!t.length) return '<td class="r mut">—</td>'; var p = r2(t.reduce(function (s, c) { return s + c.pl; }, 0)); return '<td class="r"><span class="pvs-cell ' + (p < 0 ? 'n' : 'p') + '">' + sgn(p) + '</span><small class="mut"> ' + t.length + '</small></td>'; };
    return pvsNote('Realized P/L by instrument and account · ' + rl + ' · small number = trades') + '<div style="overflow-x:auto"><table class="num" data-table="pvs-matrix"><thead><tr><th>Instrument</th>' + ac.map(function (a) { return '<th class="r">' + esc(accName(a)) + '</th>'; }).join('') + '<th class="r">Total</th></tr></thead><tbody>' +
      ins.map(function (g) { return '<tr class="click" data-a="pvsins" data-v="' + esc(g.k) + '"><td><b>' + esc(g.k) + '</b></td>' + ac.map(function (a) { return cell(g.k, a.id); }).join('') + '<td class="r"><b class="' + plc(g.pl) + '">' + sgn(g.pl) + '</b></td></tr>'; }).join('') + '</tbody></table></div>';
  }
  if (v === 'map') {
    if (!L.length) return empty;
    var gm = pvsGroup(L, function (c) { return c.ins; }, function (k) { return k; }), tot = gm.reduce(function (s, g) { return s + Math.abs(g.pl); }, 0) || 1;
    return pvsNote('Tile size = share of realized P/L (gains and losses) · ' + rl) + '<div class="pvs-map" data-pvs-map>' + gm.map(function (g) {
      var sh = Math.abs(g.pl) / tot;
      return '<button class="pvs-tile ' + (g.pl < 0 ? 'n' : 'p') + '" style="flex:' + Math.max(0.06, sh).toFixed(3) + ' 1 0" data-a="pvsins" data-v="' + esc(g.k) + '" aria-label="' + esc(g.k) + ' realized ' + sgn(g.pl) + ', ' + g.n + ' trades"><b>' + esc(g.k) + '</b><span>' + sgn(g.pl) + '</span><small>' + g.n + ' trade' + (g.n === 1 ? '' : 's') + ' · ' + Math.round(sh * 100) + '%</small></button>';
    }).join('') + '</div>';
  }
  if (v === 'currency') return monCurrency();
  if (v === 'margin') return marginRiskCard();
  if (v === 'stoploss') return pvsNote('Stop-loss coverage is about positions open now, so it is the same in both views.') + stopCard();
  if (v === 'drawdown') return drawdown(false);
  if (v === 'alerts') return typeof monAlertsView === 'function' ? monAlertsView() : '';
  return pvsNote('Portfolio tiles are full-account, so they are the same in both views.') + monTiles();
}
function pvsCard() {
  var v = pvtV(), D = pvsTrades(), L = D.L, X = D.X, pl = r2(L.reduce(function (s, c) { return s + c.pl; }, 0)), w = L.filter(function (c) { return c.pl > 0; }).length;
  var k = function (l, val, sub, cls) { return '<div class="pvs-k"><small>' + l + '</small><b class="' + (cls || '') + '">' + val + '</b><span>' + sub + '</span></div>'; };
  var head = '<div class="ch"><div><h3>Portfolio status</h3><div class="lbl">Full account · ' + esc(scopeName()) + (X.dir ? ' · ' + dirName(X.dir) + ' trades only' : '') + ' · ' + esc(rangeLabel()) + '</div></div></div>' +
    '<div class="pvs-ks">' + k('Equity · latest', usd(X.eq), X.rep.length + ' account' + (X.rep.length === 1 ? '' : 's') + ' reporting') + k('Realized P/L', L.length ? sgn(pl) : '—', 'closed trades in range', L.length ? plc(pl) : '') + k('Closed trades', String(L.length), w + ' wins · ' + (L.length - w) + ' losses') + k('Win rate', L.length ? Math.round(w / L.length * 100) + '%' : '—', 'of closed trades') + '</div>';
  return '<div class="card pad mb16 pvcard" data-section="pvs">' + head + pvtBar() + '<div class="pvtb" data-pvt-body data-pvs-view="' + v + '">' + pvsBody(v) + '</div></div>';
}
monitor = (function (prev) {
  return function () {
    if (pvOn() || S.loading) return prev();
    try { return pvsCard(); } catch (e) { pvtErr(e); return prev(); }
  };
})(monitor);
/* keep the chosen tab when switching views */
var _pview32 = H7.pview;
H7.pview = function (el, v) {
  var n = S.mon.view, o = S.pvtView, first = !S.pvtInit, r = _pview32.apply(this, arguments);
  if (!first && S.tab === 'monitor' && (S.mon.view !== n || S.pvtView !== o) && n !== 'alerts') { S.mon.view = n; S.pvtView = o; var k = root.scrollTop; render(); root.scrollTop = k; }
  return r;
};
/* realized-results panel */
S.pvsPanel = null;
function pvsPanelHtml() {
  var P = S.pvsPanel; if (!P) return '';
  var D = pvsTrades(), L = D.L.filter(function (c) { return P.ins ? c.ins === P.ins : c.a === P.acc; }), pl = r2(L.reduce(function (s, c) { return s + c.pl; }, 0));
  var title = P.ins ? P.ins + ' · ' + scopeName() : accName(acc(P.acc));
  return '<div class="ov" data-a="pvsclose"></div><aside class="drw" role="dialog" aria-label="' + esc(title) + ' closed trades" data-pvs-panel><div class="dh"><div><b>' + esc(title) + '</b><div class="mut" data-pvs-sub>' + L.length + ' closed trade' + (L.length === 1 ? '' : 's') + ' · realized ' + sgn(pl) + ' · ' + esc(rangeLabel()) + '</div></div><button class="btn sm" data-a="pvsclose" aria-label="Close">✕</button></div>' +
    '<div class="db"><table class="num"><thead><tr><th>Closed</th><th>' + (P.ins ? 'Account' : 'Instrument') + '</th><th>Side</th><th class="r">Lots</th><th class="r">P/L</th></tr></thead><tbody>' +
    L.map(function (c) { return '<tr><td class="mut">' + DAYS[c.day] + ' ' + c.t + '</td><td>' + (P.ins ? esc(accName(acc(c.a))) : '<b>' + c.ins + '</b>') + '</td><td>' + c.side + '</td><td class="r">' + c.lots.toFixed(2) + '</td><td class="r ' + plc(c.pl) + '">' + sgn(c.pl) + '</td></tr>'; }).join('') + '</tbody></table></div></aside>';
}
H7.pvsins = function (el, v) { S.pvsPanel = { ins: v }; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.pvsacc = function (el, v) { S.pvsPanel = { acc: v }; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.pvsclose = function () { S.pvsPanel = null; var k = root.scrollTop; render(); root.scrollTop = k; };
var _render32 = render;
render = function () {
  var r = _render32.apply(this, arguments);
  try { if (S.pvsPanel) { if (S.tab !== 'monitor' && S.tab !== 'portfolios') S.pvsPanel = null; else root.insertAdjacentHTML('beforeend', pvsPanelHtml()); } } catch (e) { pvtErr(e); }
  return r;
};
(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v32', '1');
  st.textContent = [
    '#mb-root .pvs-ks{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}',
    '#mb-root .pvs-k{background:#f7f5ff;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}#mb-root .pvs-k small{font-size:12px;color:var(--tx2)}#mb-root .pvs-k b{font-size:20px}#mb-root .pvs-k span{font-size:12px;color:var(--tx2)}',
    '#mb-root .pvs-note{margin:0 0 10px}',
    '#mb-root .pvs-cell{font-weight:600}#mb-root .pvs-cell.p{color:#5f7005}#mb-root .pvs-cell.n{color:var(--b)}',
    '#mb-root .pvs-map{display:flex;flex-wrap:wrap;gap:6px}',
    '#mb-root .pvs-tile{min-width:110px;min-height:84px;border:0;border-radius:10px;padding:10px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;cursor:pointer;font:inherit;text-align:left}',
    '#mb-root .pvs-tile.p{background:rgba(135,158,7,.16);color:#3f4d04}#mb-root .pvs-tile.n{background:#efecff;color:#3d2bc4}#mb-root .pvs-tile:hover{filter:brightness(.96)}#mb-root .pvs-tile:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .pvs-tile b{font-size:14px}#mb-root .pvs-tile span{font-size:16px;font-weight:700}#mb-root .pvs-tile small{font-size:11px;opacity:.8}',
    '@media (max-width:760px){#mb-root .pvs-ks{grid-template-columns:1fr 1fr}}'
  ].join('\n');
  document.head.appendChild(st);
})();


/* ============================ v33 · Long / Short classification in the card charts ============================
   Colour now means direction everywhere in this card, matching the Buy / Sell side tags: Long = olive, Short = purple.
   Gain or loss is shown by which side of $0 a bar sits on and by the +/− sign; totals in these charts are not coloured,
   so purple never means both "short" and "loss" in the same chart.
   Charts tab (both views, Monitor and Portfolios): every instrument and account row splits into a Long bar and a
   Short bar. Map tab (Portfolio status): each tile shows its Long / Short split. */
function lsGroup(list, key, name, val) {
  var m = {}, o = [];
  list.forEach(function (x) {
    var k = key(x); if (!m[k]) { m[k] = { k: k, name: name(k), L: 0, S: 0, nL: 0, nS: 0 }; o.push(k); }
    var g = m[k], v = val(x); if (x.side === 'Buy') { g.L += v; g.nL++; } else { g.S += v; g.nS++; }
  });
  return o.map(function (k) { var g = m[k]; g.L = r2(g.L); g.S = r2(g.S); g.t = r2(g.L + g.S); return g; });
}
function lsBar(v, mx, cls) {
  if (!v) return '<span class="lstr"><s></s></span>';
  var w = Math.min(50, Math.abs(v) / mx * 50).toFixed(2);
  return '<span class="lstr"><s></s><i class="' + cls + '" style="' + (v < 0 ? 'right:50%' : 'left:50%') + ';width:' + w + '%"></i></span>';
}
function lsChart(o) {
  var rows = o.rows, mx = Math.max.apply(null, rows.map(function (r) { return Math.max(Math.abs(r.L), Math.abs(r.S)); }).concat([1]));
  var body = rows.map(function (r) {
    var sub = (r.nL ? r.nL + ' long' : '') + (r.nL && r.nS ? ' · ' : '') + (r.nS ? r.nS + ' short' : '');
    var tot = o.mode === 'exp' ? r.L - r.S : r.t, totTxt = o.mode === 'exp' ? (tot === 0 ? '$0' : sgn0(tot)) + ' net' : sgn(tot);
    var kx = function (v) { return v ? '$' + (v / 1000).toFixed(1) + 'k' : '—'; }, lTxt = o.mode === 'exp' ? kx(r.L) : (r.nL ? sgn(r.L) : '—'), sTxt = o.mode === 'exp' ? kx(r.S) : (r.nS ? sgn(r.S) : '—');
    return '<button class="lsr" data-a="' + o.act + '" data-v="' + esc(r.k) + '" data-ls-row="' + esc(r.k) + '" aria-label="' + esc(r.name) + ': long ' + lTxt + ', short ' + sTxt + ', ' + (o.mode === 'exp' ? 'net ' + (tot === 0 ? '$0' : sgn0(tot)) : 'total ' + totTxt) + '">' +
      '<span class="lsn"><b>' + esc(r.name) + '</b><small>' + sub + '</small></span>' +
      '<span class="lsb">' + (o.mode === 'exp' ? '<span class="lstr"><s></s>' + (r.S ? '<i class="s" style="right:50%;width:' + Math.min(50, r.S / mx * 50).toFixed(2) + '%"></i>' : '') + (r.L ? '<i class="l" style="left:50%;width:' + Math.min(50, r.L / mx * 50).toFixed(2) + '%"></i>' : '') + '</span>'
        : lsBar(r.L, mx, 'l') + lsBar(r.S, mx, 's')) + '</span>' +
      '<span class="lsv"><b class="' + (o.mode === 'exp' ? '' : plc(tot)) + '">' + totTxt + '</b><small><em class="l">L</em> ' + lTxt + ' <em class="s">S</em> ' + sTxt + '</small></span></button>';
  }).join('');
  return '<div class="pvch" data-ls-chart="' + o.id + '"><h4>' + o.title + ' <small>' + o.sub + '</small></h4>' +
    '<div class="lsleg"><span><i class="l"></i>Long</span><span><i class="s"></i>Short</span><span class="mut">' + o.axis + '</span></div>' +
    (rows.length ? body + '<div class="lsax" aria-hidden="true"><span></span><span class="lsaxl"><b>' + (o.mode === 'exp' ? 'Short' : 'Loss') + '</b><b>$0</b><b>' + (o.mode === 'exp' ? 'Long' : 'Gain') + '</b></span><span></span></div>' : '<div class="mut">Nothing in this scope.</div>') + '</div>';
}
/* Open positions › Charts */
function lsPosCharts() {
  var X = pvScope(), P = X.pos;
  if (!P.length) return '<div class="na" style="min-height:90px">No open positions for ' + esc(pvName(X)) + '</div>';
  var gi = lsGroup(P, function (p) { return p.ins; }, function (k) { return k; }, function (p) { return Math.abs(p.usd); }).sort(function (a, b) { return (b.L + b.S) - (a.L + a.S); });
  var ga = lsGroup(P, function (p) { return p.a; }, function (k) { return accName(acc(k)); }, function (p) { return p.pl; }).sort(function (a, b) { return a.t - b.t; });
  return '<div class="pvcharts">' + lsChart({ id: 'pos-ins', title: 'By instrument', sub: 'exposure · long right, short left', rows: gi, mode: 'exp', act: 'pvins', axis: 'Bar length = exposure' }) +
    lsChart({ id: 'pos-acc', title: 'By account', sub: 'unrealized P/L · ' + sgn(X.upl) + ' total', rows: ga, mode: 'pl', act: 'pvacc', axis: 'Right of $0 = gain, left = loss' }) + '</div>';
}
/* Portfolio status › Charts */
function lsStatCharts() {
  var D = pvsTrades(), L = D.L, rl = esc(rangeLabel());
  if (!L.length) return '<div class="na" style="min-height:90px">No closed trades for ' + esc(scopeName()) + ' in ' + rl + '</div>';
  var gi = lsGroup(L, function (c) { return c.ins; }, function (k) { return k; }, function (c) { return c.pl; }).sort(function (a, b) { return b.t - a.t; });
  var ga = lsGroup(L, function (c) { return c.a; }, function (k) { return accName(acc(k)); }, function (c) { return c.pl; }).sort(function (a, b) { return b.t - a.t; });
  return '<div class="pvcharts">' + lsChart({ id: 'st-ins', title: 'By instrument', sub: 'realized P/L · ' + rl, rows: gi, mode: 'pl', act: 'pvsins', axis: 'Right of $0 = gain, left = loss' }) +
    lsChart({ id: 'st-acc', title: 'By account', sub: 'realized P/L · ' + rl, rows: ga, mode: 'pl', act: 'pvsacc', axis: 'Right of $0 = gain, left = loss' }) + '</div>';
}
/* Portfolio status › Map: tile size = share of realized P/L; inner bar = Long / Short split of that P/L */
function lsStatMap() {
  var D = pvsTrades(), L = D.L, rl = esc(rangeLabel());
  if (!L.length) return '<div class="na" style="min-height:90px">No closed trades for ' + esc(scopeName()) + ' in ' + rl + '</div>';
  var gm = lsGroup(L, function (c) { return c.ins; }, function (k) { return k; }, function (c) { return c.pl; }).sort(function (a, b) { return Math.abs(b.t) - Math.abs(a.t); });
  var tot = gm.reduce(function (s, g) { return s + Math.abs(g.t); }, 0) || 1;
  return pvsNote('Tile size = share of realized P/L · inner bar = Long / Short split · ' + rl) + '<div class="lsleg" style="margin-bottom:8px"><span><i class="l"></i>Long</span><span><i class="s"></i>Short</span></div><div class="pvs-map" data-pvs-map>' + gm.map(function (g) {
    var sh = Math.abs(g.t) / tot, a = Math.abs(g.L) + Math.abs(g.S) || 1;
    return '<button class="pvs-tile ls" style="flex:' + Math.max(0.06, sh).toFixed(3) + ' 1 0" data-a="pvsins" data-v="' + esc(g.k) + '" aria-label="' + esc(g.k) + ' realized ' + sgn(g.t) + '; long ' + sgn(g.L) + ', short ' + sgn(g.S) + '"><b>' + esc(g.k) + '</b><span class="' + plc(g.t) + '">' + sgn(g.t) + '</span>' +
      '<span class="lssplit"><i class="l" style="width:' + (Math.abs(g.L) / a * 100).toFixed(1) + '%"></i><i class="s" style="width:' + (Math.abs(g.S) / a * 100).toFixed(1) + '%"></i></span>' +
      '<small><em class="l">L</em> ' + sgn(g.L) + ' · <em class="s">S</em> ' + sgn(g.S) + '</small></button>';
  }).join('') + '</div>';
}
var _pvtBody33 = pvtBody;
pvtBody = function (v) { return v === 'charts' ? lsPosCharts() : _pvtBody33(v); };
var _pvsBody33 = pvsBody;
pvsBody = function (v) { return v === 'charts' ? lsStatCharts() : v === 'map' ? lsStatMap() : _pvsBody33(v); };
/* the Open positions card now always draws Charts through pvtBody */
function pvtCard() {
  if (!S.pvtInit) { S.pvtInit = true; if (S.mon.view === 'tiles') S.pvtView = 'charts'; }
  var v = pvtV();
  if (v === 'alerts' && typeof monAlertsView !== 'function') return null;
  var card = pvModule({ charts: false }), e = card.lastIndexOf('</div>');
  return card.slice(0, e) + pvtBar() + '<div class="pvtb" data-pvt-body data-mon-view="' + v + '">' + pvtBody(v) + '</div>' + card.slice(e);
}
(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v33', '1');
  st.textContent = [
    '#mb-root .lsleg{display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:12px;margin:0 0 6px}#mb-root .lsleg span{display:inline-flex;align-items:center;gap:5px}',
    '#mb-root .lsleg i,#mb-root .lssplit i{display:inline-block;width:10px;height:10px;border-radius:3px}',
    '#mb-root i.l,#mb-root .lstr i.l{background:#879e07}#mb-root i.s,#mb-root .lstr i.s{background:#5945f1}',
    '#mb-root em.l,#mb-root em.s{font-style:normal;font-weight:700;font-size:10px;border-radius:4px;padding:0 4px;margin-right:1px}#mb-root em.l{background:rgba(135,158,7,.16);color:#4d5c04}#mb-root em.s{background:#efecff;color:#3d2bc4}',
    '#mb-root .lsr,#mb-root .lsax{display:grid;grid-template-columns:132px 1fr 150px;gap:10px;align-items:center}',
    '#mb-root .lsr{width:100%;border:0;background:none;padding:7px 4px;border-radius:8px;font:inherit;text-align:left;cursor:pointer;color:#171717}#mb-root .lsr:hover{background:#f6f4ff}#mb-root .lsr:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .lsn b{display:block;font-size:13px}#mb-root .lsn small{display:block;font-size:11px;color:var(--tx2)}',
    '#mb-root .lsb{display:flex;flex-direction:column;gap:3px}',
    '#mb-root .lstr{position:relative;display:block;height:9px;background:#efede8;border-radius:5px}#mb-root .lsb .lstr:only-child{height:14px}',
    '#mb-root .lstr s{position:absolute;left:50%;top:-3px;bottom:-3px;border-left:1.5px solid #8a8a8a}#mb-root .lstr i{position:absolute;top:0;bottom:0;border-radius:4px}',
    '#mb-root .lsv{text-align:right}#mb-root .lsv b{display:block;font-size:13px}#mb-root .lsv small{display:block;font-size:11px;color:var(--tx2);white-space:nowrap}',
    '#mb-root .lsax{padding:0 4px;font-size:10px;color:var(--tx2)}#mb-root .lsaxl{display:flex;justify-content:space-between}#mb-root .lsaxl b{font-weight:500}',
    '#mb-root .pvs-tile.ls{background:#f7f6f2;color:#171717}',
    '#mb-root .lssplit{display:flex;width:100%;height:6px;border-radius:3px;overflow:hidden;background:#e7e4dd;margin:4px 0}#mb-root .lssplit i{height:6px;border-radius:0;width:auto}',
    '#mb-root .lsv b.pos,#mb-root .lsv b.neg,#mb-root .pvs-tile.ls span.pos,#mb-root .pvs-tile.ls span.neg{color:#171717}',
    '@media (max-width:760px){#mb-root .lsr,#mb-root .lsax{grid-template-columns:96px 1fr 92px;gap:6px}#mb-root .lsv small{display:none}}'
  ].join('\n');
  document.head.appendChild(st);
})();


/* ============================ v34 · Portfolio status: same visuals as Open positions, different data ============================
   Charts, Holdings, Matrix, Map and Exposure now draw exactly the same views in both modes. Only the data changes:
   Open positions = positions open at the latest snapshot; Portfolio status = closed trades in the date range, grouped per
   account · instrument · side (size = traded volume, P/L = realized). The data is swapped in while the view draws. */
function pvsNotional(c) {
  var px = parseFloat(String(c.ex).replace(/,/g, '')) || D30_PX[c.ins] || 1, n;
  if (c.ins === 'BTCUSD' || c.ins === 'US500') n = c.lots * px; else if (c.ins === 'XAUUSD') n = c.lots * 100 * px;
  else if (c.ins === 'USDJPY') n = c.lots * 100000; else if (/JPY$/.test(c.ins)) n = c.lots * 100000 * 1.271; else n = c.lots * 100000 * px;
  return Math.round(n) * (c.side === 'Buy' ? 1 : -1);
}
function pvsSynth(known) {
  var L = pvsTrades().L, m = {}, o = [];
  L.forEach(function (c) {
    if (known && typeof INS !== 'undefined' && !INS[c.ins]) return;
    var k = c.a + '|' + c.ins + '|' + c.side;
    if (!m[k]) { m[k] = { id: 'pvs-' + c.a + '-' + c.ins + '-' + c.side, a: c.a, ins: c.ins, side: c.side, lots: 0, en: c.en, cu: c.ex, pl: 0, m: 0, usd: 0, opened: DAYS[c.day], n: 0, closed: true }; o.push(k); }
    var g = m[k]; g.lots = r2(g.lots + c.lots); g.pl = r2(g.pl + c.pl); g.usd += pvsNotional(c); g.n++;
  });
  return o.map(function (k) { return m[k]; });
}
function pvsWith(fn, known) {
  var keepP = POS, keepC = S.mon.ccyView, syn = pvsSynth(known), tpl = null, added = [];
  for (var k in PX) { tpl = PX[k]; break; }
  syn.forEach(function (p) { if (!(p.id in PX)) { var t = {}; if (tpl) Object.keys(tpl).forEach(function (f) { t[f] = f === 'sl' ? null : tpl[f]; }); PX[p.id] = t; added.push(p.id); } });
  try { POS = syn; S.mon.ccyView = 'positions'; return fn(); }
  finally { POS = keepP; S.mon.ccyView = keepC; added.forEach(function (id) { delete PX[id]; }); }
}
var PVS_SAME = ['charts', 'holdings', 'matrix', 'map', 'currency'];
var _pvsBody34 = pvsBody;
pvsBody = function (v) {
  if (PVS_SAME.indexOf(v) < 0) return _pvsBody34(v);
  var D = pvsTrades(), rl = esc(rangeLabel());
  if (!D.L.length) return '<div class="na" style="min-height:90px">No closed trades for ' + esc(scopeName()) + (D.X.dir ? ' · ' + dirName(D.X.dir) : '') + ' in ' + rl + '</div>';
  var note = pvsNote('Same view as Open positions, filled with closed trades from ' + rl + ': size = traded volume, P/L = realized.');
  return note + pvsWith(function () {
    var h = pvtBody(v);
    if (v === 'charts') h = h.split('data-a="pvins"').join('data-a="pvsins"').split('data-a="pvacc"').join('data-a="pvsacc"')
      .replace('exposure · long right, short left', 'traded volume · long right, short left').replace('Bar length = exposure', 'Bar length = traded volume')
      .replace(/unrealized P\/L · [^<]*/, 'realized P/L · ' + rl);
    return h;
  }, v === 'currency');
};
/* panels opened from those views (status mode) read the same grouped data */
if (typeof posPanel === 'function') {
  var _posPanel34 = posPanel;
  posPanel = function (pn) {
    if (pn && pn.ids && pn.ids.some(function (id) { return String(id).indexOf('pvs-') === 0; })) return pvsWith(function () { return _posPanel34(pn); });
    return _posPanel34.apply(this, arguments);
  };
}
/* Portfolios › Portfolio status: the same tabbed card, placed above Closed trades */
portfolios = (function (prev) {
  return function () {
    var h = prev();
    if (pvOn() || S.pfView === 'analytics' || S.loading) return h;
    try { var c = pvsCard(), k = h.indexOf('<div class="card pad mb16" data-section="pf-closed"'); return k >= 0 ? h.slice(0, k) + c + h.slice(k) : h + c; }
    catch (e) { pvtErr(e); return h; }
  };
})(portfolios);

window.T={closedIn:function(i){return closedIn(i);},EQX:EQ,BM:BMETA,BR:BROKERS,manage:function(){return manage();},PX:PX,EQ:EQ,S:S,render:render,root:root,H7:H7,ACC:ACC,POS:POS,CLOSED:CLOSED,DAYS:DAYS,setDate:function(){return setDate.apply(null,arguments);}};
render();
})();
