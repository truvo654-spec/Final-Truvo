
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
