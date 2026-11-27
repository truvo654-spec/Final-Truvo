
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
