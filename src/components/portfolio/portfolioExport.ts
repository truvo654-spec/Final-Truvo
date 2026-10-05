import { PortfolioTrade } from '../../types';
import { TradeStats, durationH, isClosed, rOf } from './portfolioMath';

const esc = (v: string | number) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const day = (t: PortfolioTrade) => (t.closedAt || t.openedAt).slice(0, 10);

export interface ReportMeta {
  planLabel: string;
  accounts: string;
  periodLabel: string;
  balance: number;
}

/** Excel opens SpreadsheetML 2003 natively, no library needed. Two sheets: Summary and Trades. */
export function buildXls(trades: PortfolioTrade[], stats: TradeStats, meta: ReportMeta): string {
  const cell = (v: string | number, type: 'String' | 'Number' = typeof v === 'number' ? 'Number' : 'String', style = '') =>
    `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="${type}">${esc(v)}</Data></Cell>`;
  const row = (cells: string[]) => `<Row>${cells.join('')}</Row>`;

  const summary = [
    row([cell('MarketSyde portfolio report', 'String', 'h')]),
    row([cell('Plan'), cell(meta.planLabel)]),
    row([cell('Accounts'), cell(meta.accounts)]),
    row([cell('Period'), cell(meta.periodLabel)]),
    row([cell('Balance'), cell(Number(meta.balance.toFixed(2)))]),
    row([cell('Closed trades'), cell(stats.closed)]),
    row([cell('Win rate %'), cell(Number(stats.winRate.toFixed(1)))]),
    row([cell('Realized P&L'), cell(Number(stats.realized.toFixed(2)))]),
    row([cell('Profit factor'), cell(Number(Math.min(99, stats.profitFactor).toFixed(2)))]),
    row([cell('Average R'), cell(Number(stats.avgR.toFixed(2)))]),
    row([cell('Average win'), cell(Number(stats.avgWin.toFixed(2)))]),
    row([cell('Average loss'), cell(Number((-stats.avgLoss).toFixed(2)))]),
  ].join('');

  const head = ['Date', 'Account', 'Symbol', 'Asset', 'Side', 'Size', 'Entry', 'Exit', 'Held (h)', 'R', 'P&L', 'Outcome', 'Strategy', 'Risk tag'];
  const body = trades
    .map((t) =>
      row([
        cell(day(t)),
        cell(t.broker),
        cell(t.symbol),
        cell(t.assetClass),
        cell(t.direction),
        cell(t.size),
        cell(t.entryPrice),
        cell(t.exitPrice ?? ''),
        cell(Number(durationH(t).toFixed(1))),
        cell(isClosed(t) ? Number(rOf(t).toFixed(2)) : ''),
        cell(t.pnl, 'Number', t.pnl >= 0 ? 'pos' : 'neg'),
        cell(!isClosed(t) ? 'Open' : t.outcome === 'win' ? 'Win' : t.outcome === 'loss' ? 'Loss' : 'Even'),
        cell(t.strategyTag ?? ''),
        cell(t.riskTag ?? ''),
      ])
    )
    .join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="h"><Font ss:Bold="1" ss:Size="14"/></Style>
<Style ss:ID="pos"><Font ss:Color="#059669"/></Style>
<Style ss:ID="neg"><Font ss:Color="#E11D48"/></Style>
<Style ss:ID="th"><Font ss:Bold="1"/><Interior ss:Color="#EEF0FE" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Summary"><Table>${summary}</Table></Worksheet>
<Worksheet ss:Name="Trades"><Table>${row(head.map((h) => cell(h, 'String', 'th')))}${body}</Table></Worksheet>
</Workbook>`;
}

/* ───────────────────────── Minimal PDF writer (text only, Helvetica) ───────────────────────── */

const ascii = (s: string) =>
  s
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2192/g, '->')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00B7|\u2022/g, '-')
    .replace(/[^\x20-\x7E]/g, '');
const pdfEsc = (s: string) => ascii(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

interface PdfLine {
  y: number;
  items: { x: number; text: string; size?: number; bold?: boolean; color?: [number, number, number] }[];
}

export function buildPdf(trades: PortfolioTrade[], stats: TradeStats, meta: ReportMeta): Uint8Array {
  const W = 595;
  const H = 842;
  const pages: PdfLine[][] = [];
  let cur: PdfLine[] = [];
  let y = H - 56;
  const newPage = () => {
    pages.push(cur);
    cur = [];
    y = H - 56;
  };
  const push = (items: PdfLine['items'], dy = 16) => {
    if (y < 56) newPage();
    cur.push({ y, items });
    y -= dy;
  };

  push([{ x: 40, text: 'MarketSyde portfolio report', size: 18, bold: true }], 26);
  push([{ x: 40, text: `${meta.planLabel} plan  |  ${meta.accounts}  |  ${meta.periodLabel}`, size: 9, color: [0.4, 0.45, 0.55] }], 24);

  const kv: [string, string][] = [
    ['Balance', `$${meta.balance.toFixed(2)}`],
    ['Closed trades', String(stats.closed)],
    ['Win rate', `${stats.winRate.toFixed(0)}%`],
    ['Realized P&L', `${stats.realized >= 0 ? '+' : '-'}$${Math.abs(stats.realized).toFixed(2)}`],
    ['Profit factor', stats.profitFactor >= 99 ? 'n/a' : stats.profitFactor.toFixed(2)],
    ['Average R', `${stats.avgR >= 0 ? '+' : ''}${stats.avgR.toFixed(2)}R`],
  ];
  kv.forEach(([k, v], i) => {
    if (i % 2 === 0) push([{ x: 40, text: k, size: 10, color: [0.4, 0.45, 0.55] }, { x: 150, text: v, size: 11, bold: true }, ...(kv[i + 1] ? [{ x: 320, text: kv[i + 1][0], size: 10, color: [0.4, 0.45, 0.55] as [number, number, number] }, { x: 430, text: kv[i + 1][1], size: 11, bold: true }] : [])], 18);
  });
  y -= 10;

  const cols = [40, 100, 170, 215, 255, 330, 400, 480];
  const head = ['Date', 'Account', 'Symbol', 'Side', 'Size', 'Entry', 'Exit', 'P&L'];
  const header = () => push(head.map((h, i) => ({ x: cols[i], text: h, size: 9, bold: true, color: [0.33, 0.22, 0.93] as [number, number, number] })), 15);
  header();
  trades.forEach((t) => {
    if (y < 64) {
      newPage();
      header();
    }
    push(
      [
        { x: cols[0], text: day(t), size: 8.5 },
        { x: cols[1], text: t.broker, size: 8.5 },
        { x: cols[2], text: t.symbol, size: 8.5, bold: true },
        { x: cols[3], text: t.direction, size: 8.5 },
        { x: cols[4], text: String(t.size), size: 8.5 },
        { x: cols[5], text: String(t.entryPrice), size: 8.5 },
        { x: cols[6], text: t.exitPrice === null ? 'open' : String(t.exitPrice), size: 8.5 },
        { x: cols[7], text: `${t.pnl >= 0 ? '+' : '-'}$${Math.abs(t.pnl).toFixed(2)}`, size: 8.5, bold: true, color: t.pnl >= 0 ? [0.02, 0.59, 0.41] : [0.88, 0.11, 0.28] },
      ],
      13
    );
  });
  pages.push(cur);

  // build objects
  const objs: string[] = [];
  const add = (body: string) => {
    objs.push(body);
    return objs.length;
  };
  const catalog = add('');
  const pagesObj = add('');
  const fReg = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fBold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const kids: number[] = [];
  pages.forEach((lines, pi) => {
    let stream = '';
    lines.forEach((ln) =>
      ln.items.forEach((it) => {
        const c = it.color || [0.04, 0.11, 0.19];
        stream += `BT /${it.bold ? 'F2' : 'F1'} ${it.size || 10} Tf ${c[0]} ${c[1]} ${c[2]} rg ${it.x} ${ln.y} Td (${pdfEsc(it.text)}) Tj ET\n`;
      })
    );
    stream += `BT /F1 8 Tf 0.6 0.65 0.72 rg 40 28 Td (MarketSyde  |  Page ${pi + 1} of ${pages.length}  |  Trading carries risk. This report is for information only.) Tj ET\n`;
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    const page = add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${content} 0 R /Resources << /Font << /F1 ${fReg} 0 R /F2 ${fBold} 0 R >> >> >>`);
    kids.push(page);
  });
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objs[pagesObj - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => (out += `${String(o).padStart(10, '0')} 00000 n \n`));
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}

export function downloadBlob(data: BlobPart, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([data], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
