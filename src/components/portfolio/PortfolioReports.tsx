import React, { useMemo, useState } from 'react';
import { Mail, Upload, Download, Copy, Printer, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PortfolioTrade, PortfolioAssetClass } from '../../types';
import { PortfolioCtx } from './portfolioContext';
import { Card, CardTitle, Locked, PLAN_RANK, money, signedMoney } from './portfolioUi';
import { parseCsv, tradeStats, tradesInRange } from './portfolioMath';
import { PORTFOLIO_NOW } from '../../data/portfolioData';
import { PLAN_LABEL } from './portfolioUi';
import { buildPdf, buildXls, downloadBlob, ReportMeta } from './portfolioExport';

const SAMPLE_CSV = `symbol,direction,entry,exit,size,pnl,date,asset,strategy
EUR/USD,BUY,1.0820,1.0868,1.0,96,2026-09-10,Forex,Swing
XAU/USD,SELL,2640.5,2631.0,0.3,-28.5,2026-09-12,Commodity,Breakout
BTC/USDT,BUY,64200,65100,0.1,90,2026-09-14,Crypto,Momentum`;

const ASSETS: PortfolioAssetClass[] = ['Forex', 'Crypto', 'Stocks', 'Commodity', 'Indices'];

function toCsv(trades: PortfolioTrade[]) {
  const head = 'symbol,direction,entry,exit,size,pnl,date,account,strategy';
  const rows = trades.map((t) =>
    [t.symbol, t.direction, t.entryPrice, t.exitPrice ?? '', t.size, t.pnl, (t.closedAt || t.openedAt).slice(0, 10), t.broker, t.strategyTag ?? ''].join(',')
  );
  return [head, ...rows].join('\n');
}

export const PortfolioReports: React.FC<{ ctx: PortfolioCtx }> = ({ ctx }) => {
  const rank = PLAN_RANK[ctx.plan];
  const [weekly, setWeekly] = useState(true);
  const [text, setText] = useState('');
  const [imported, setImported] = useState(0);

  const week = useMemo(() => {
    const s = tradeStats(tradesInRange(ctx.trades, 7));
    const ser = ctx.fullSeries.slice(-8);
    const change = ser.length > 1 ? ser[ser.length - 1].value - ser[0].value : 0;
    return { s, change, ratio: s.losses ? s.wins / s.losses : s.wins };
  }, [ctx.trades, ctx.fullSeries]);

  const parsed = useMemo(() => (text.trim() ? parseCsv(text) : null), [text]);

  const doImport = () => {
    if (!parsed || parsed.error) return;
    const existing = new Set(ctx.allTrades.map((t) => `${t.symbol}|${t.entryPrice}|${(t.closedAt || t.openedAt).slice(0, 10)}`));
    const out: PortfolioTrade[] = [];
    let skipped = 0;
    parsed.rows.forEach((r, i) => {
      const entry = parseFloat(r.entry);
      const size = parseFloat(r.size);
      const exit = r.exit ? parseFloat(r.exit) : null;
      const dir = /^(sell|short|s)$/i.test(r.direction) ? 'SELL' : /^(buy|long|b)$/i.test(r.direction) ? 'BUY' : null;
      if (!r.symbol || !dir || Number.isNaN(entry) || Number.isNaN(size)) {
        skipped++;
        return;
      }
      const date = /^\d{4}-\d{2}-\d{2}$/.test(r.date || '') ? r.date : new Date(PORTFOLIO_NOW).toISOString().slice(0, 10);
      if (existing.has(`${r.symbol.toUpperCase()}|${entry}|${date}`)) {
        skipped++;
        return;
      }
      const pnl = r.pnl !== undefined && r.pnl !== '' ? parseFloat(r.pnl) : exit !== null ? Math.round((dir === 'BUY' ? exit - entry : entry - exit) * size * 100 * 100) / 100 : 0;
      const asset = ASSETS.find((a) => a.toLowerCase() === (r.asset || '').toLowerCase()) || 'Forex';
      out.push({
        id: `import_${Date.now()}_${i}`,
        broker: 'Manual Log',
        inputMethod: 'manual',
        assetClass: asset,
        symbol: r.symbol.toUpperCase(),
        direction: dir,
        entryPrice: entry,
        exitPrice: exit,
        size,
        pnl: Number.isNaN(pnl) ? 0 : pnl,
        isRealized: exit !== null,
        outcome: pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'neutral',
        strategyTag: r.strategy || undefined,
        openedAt: `${date}T09:00:00Z`,
        closedAt: exit !== null ? `${date}T15:00:00Z` : null,
      });
    });
    if (out.length) ctx.setAllTrades((p) => [...out, ...p]);
    setImported(out.length);
    setText('');
    ctx.toast(`Imported ${out.length} trade${out.length === 1 ? '' : 's'}${skipped ? `, skipped ${skipped}` : ''}`);
  };

  const csv = useMemo(() => toCsv(ctx.trades), [ctx.trades]);

  const copyCsv = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      ctx.toast('CSV copied to your clipboard');
    } catch {
      ctx.toast('Copy is blocked here. Use Download instead.');
    }
  };
  const downloadCsv = () => {
    try {
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'marketsyde-portfolio.csv';
      a.click();
      URL.revokeObjectURL(url);
      ctx.toast('Download started');
    } catch {
      ctx.toast('Download is blocked here. Use Copy CSV instead.');
    }
  };
  const meta: ReportMeta = {
    planLabel: PLAN_LABEL[ctx.plan],
    accounts: ctx.accountIds.length ? ctx.accounts.filter((a) => ctx.accountIds.includes(a.id)).map((a) => a.name).join(', ') : 'All accounts',
    periodLabel: ctx.historyDays >= 9999 ? 'Full history' : `Last ${ctx.historyDays} days`,
    balance: ctx.fullSeries[ctx.fullSeries.length - 1]?.value ?? 0,
  };
  const exportXls = () => {
    try {
      downloadBlob(buildXls(ctx.trades, tradeStats(ctx.trades), meta), 'marketsyde-portfolio.xls', 'application/vnd.ms-excel');
      ctx.toast('Excel file ready');
    } catch {
      ctx.toast('Download is blocked here. It works in the live app.');
    }
  };
  const exportPdf = () => {
    try {
      downloadBlob(buildPdf(ctx.trades, tradeStats(ctx.trades), meta), 'marketsyde-portfolio.pdf', 'application/pdf');
      ctx.toast('PDF report ready');
    } catch {
      ctx.toast('Download is blocked here. It works in the live app.');
    }
  };
  const printReport = () => {
    try {
      window.print();
    } catch {
      ctx.toast('Printing is blocked here.');
    }
  };

  const stats = tradeStats(ctx.trades);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
      <div className="space-y-6">
        {/* Import */}
        <Locked locked={rank < 1} label="Unlock import on Intermediate" onUpgrade={ctx.upgrade}>
          <Card className="p-5">
            <CardTitle title="Import trade history" hint="Bring in a CSV from your broker or a spreadsheet" icon={<Upload className="w-4 h-4 text-[#5338ec]" />} />
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#5338ec] border border-[#5338ec]/30 hover:border-[#5338ec] px-3.5 py-2 rounded-xl cursor-pointer transition-colors">
                <FileText className="w-3.5 h-3.5" /> Choose a CSV file
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = () => setText(String(r.result || ''));
                    r.readAsText(f);
                  }}
                />
              </label>
              <button onClick={() => setText(SAMPLE_CSV)} className="text-xs font-semibold text-[#474556] hover:text-[#5338ec] underline underline-offset-4">Use a sample file</button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder={'symbol,direction,entry,exit,size,pnl,date,asset,strategy\nEUR/USD,BUY,1.0820,1.0868,1.0,96,2026-09-10,Forex,Swing'}
              className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
            <p className="text-[11px] text-[#94a3b8] mt-1.5">Required columns: symbol, direction, entry, size. Optional: exit, pnl, date, asset, strategy.</p>

            {parsed?.error && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2.5 mt-3"><AlertTriangle className="w-4 h-4 shrink-0" />{parsed.error}</div>
            )}
            {parsed && !parsed.error && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#0b1c30] mb-2">{parsed.rows.length} rows found</p>
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-3">
                  {parsed.rows.slice(0, 5).map((r, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_80px_80px_60px] gap-2 px-3 py-2 text-xs border-b border-[#f1f5f9] last:border-0">
                      <span className="font-bold">{r.symbol}</span><span>{r.direction}</span><span className="font-mono">{r.entry}</span><span className="font-mono">{r.exit || 'open'}</span><span className="font-mono">{r.size}</span>
                    </div>
                  ))}
                </div>
                <button onClick={doImport} className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Import {parsed.rows.length} trades</button>
              </div>
            )}
            {imported > 0 && !parsed && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-3"><CheckCircle2 className="w-4 h-4" /> {imported} trades added to Manual Log. Find them in Trades.</p>
            )}
          </Card>
        </Locked>

        {/* Export */}
        <Locked locked={rank < 1} label="Unlock export on Intermediate" onUpgrade={ctx.upgrade}>
          <Card className="p-5">
            <CardTitle title="Export performance report" hint={`${ctx.trades.length} trades in your plan's history`} icon={<Download className="w-4 h-4 text-[#5338ec]" />} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[['Net P&L', signedMoney(stats.realized, 0)], ['Win rate', `${stats.winRate.toFixed(0)}%`], ['Profit factor', stats.profitFactor >= 99 ? '∞' : stats.profitFactor.toFixed(2)], ['Closed trades', String(stats.closed)]].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3"><p className="text-[11px] text-[#474556]">{k}</p><p className="text-base font-bold font-mono">{v}</p></div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportXls} className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Excel (.xls)</button>
              <button onClick={exportPdf} className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">PDF report</button>
              <button onClick={downloadCsv} className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">CSV</button>
              <button onClick={copyCsv} className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Copy CSV</button>
              <button onClick={printReport} className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Print</button>
            </div>
            <p className="text-[11px] text-[#94a3b8] mt-3">Excel opens the .xls with a Summary and a Trades sheet. The PDF lists every trade in your plan's history.</p>
          </Card>
        </Locked>
      </div>

      {/* Weekly summary */}
      <Card className="p-5">
        <CardTitle
          title="Weekly summary email"
          icon={<Mail className="w-4 h-4 text-[#5338ec]" />}
          hint="Every Monday morning"
          right={
            <button onClick={() => { setWeekly((v) => !v); ctx.toast(weekly ? 'Weekly email turned off' : 'Weekly email turned on'); }} className={`w-10 h-6 rounded-full p-0.5 transition-colors ${weekly ? 'bg-[#5338ec]' : 'bg-slate-200'}`} aria-label="Toggle weekly email">
              <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${weekly ? 'translate-x-4' : ''}`} />
            </button>
          }
        />
        <div className={`rounded-2xl border border-[#e2e8f0] overflow-hidden ${weekly ? '' : 'opacity-50'}`}>
          <div className="bg-[#0b1c30] px-4 py-3 text-white">
            <p className="text-[11px] text-white/60">Your week on MarketSyde</p>
            <p className="text-sm font-bold">Sep 28 – Oct 4</p>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#474556]">Trades</span><span className="font-mono font-bold">{week.s.closed}</span></div>
            <div className="flex justify-between"><span className="text-[#474556]">Win / loss ratio</span><span className="font-mono font-bold">{week.s.wins}:{week.s.losses} ({week.ratio.toFixed(1)})</span></div>
            <div className="flex justify-between"><span className="text-[#474556]">Realized P&amp;L</span><span className={`font-mono font-bold ${week.s.realized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(week.s.realized, 0)}</span></div>
            <div className="flex justify-between"><span className="text-[#474556]">Balance change</span><span className={`font-mono font-bold ${week.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(week.change, 0)}</span></div>
            <div className="flex justify-between"><span className="text-[#474556]">Open positions</span><span className="font-mono font-bold">{ctx.openTrades.length}</span></div>
          </div>
        </div>
        <button onClick={() => ctx.toast('Preview sent to your email')} disabled={!weekly} className="mt-4 w-full border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-sm font-semibold py-2.5 rounded-xl transition-colors">
          Send me a preview
        </button>
        <p className="text-[11px] text-[#94a3b8] mt-2">Included on every plan. Balance {money(ctx.fullSeries[ctx.fullSeries.length - 1]?.value ?? 0, 0)} today.</p>
      </Card>
    </div>
  );
};
