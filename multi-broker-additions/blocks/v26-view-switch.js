
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
