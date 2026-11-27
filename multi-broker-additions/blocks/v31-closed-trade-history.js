
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
