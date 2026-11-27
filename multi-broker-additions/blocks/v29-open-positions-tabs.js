
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
