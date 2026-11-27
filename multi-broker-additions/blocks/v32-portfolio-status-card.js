
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
