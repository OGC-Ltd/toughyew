import path from 'node:path';
import PDFDocument from 'pdfkit';
import { root } from './paths.js';
import type { Quote } from './routes/quotes.js';

// A received quotation as an A4 PDF on the Tough Yew Co. letterhead, made on the server so staff can
// download and keep it. Brand colours from the brand board: green #1E5631, ink #333333.
const GREEN = '#1E5631';
const INK = '#333333';
const MUTED = '#6B6B6B';
const RULE = '#D9D9D9';
const PAPER = '#F2F2F2';
const logo = path.join(root, 'public', 'img', 'brand', 'mark-light.png');

const money = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qtyFmt = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 3 });
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmt = (cents: number) => money.format(cents / 100);
const day = (iso: string) => (iso ? longDate.format(new Date(iso)) : '');

export const quotePdfName = (q: Quote) =>
  `${q.id}-${q.business.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'supplier'}.pdf`;

export function quotePdf(q: Quote, opts: { staff?: boolean } = {}): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true, info: { Title: `Quotation ${q.quoteNo} from ${q.business}`, Author: q.business, Subject: `Tough Yew Co. quotation ${q.id}` } });
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;
  const bottom = () => doc.page.height - doc.page.margins.bottom;
  const ensure = (h: number) => { if (doc.y + h > bottom()) doc.addPage(); };

  // Letterhead: green band, mark, name and tagline; the quotation number on the right.
  doc.rect(0, 0, doc.page.width, 110).fill(GREEN);
  try { doc.image(logo, left, 26, { height: 58 }); } catch { /* no mark: name only */ }
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text('Tough Yew Co.', left + 72, 36);
  doc.font('Helvetica').fontSize(10).text('Building. Lasting. Strong.', left + 72, 62);
  doc.font('Helvetica-Bold').fontSize(18).text('Supplier quotation', left, 34, { width, align: 'right' });
  doc.font('Helvetica').fontSize(10).text(`No. ${q.quoteNo}`, left, 60, { width, align: 'right' });
  doc.text(`Ref. ${q.id}`, left, 74, { width, align: 'right' });

  // Supplier on the left, the quotation's dates and references on the right.
  doc.y = 132;
  const colW = (width - 24) / 2;
  const top = doc.y;
  const block = (x: number, title: string, lines: string[]) => {
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text(title, x, top, { width: colW });
    doc.moveDown(0.3);
    lines.filter(Boolean).forEach((l, i) => {
      doc.fillColor(INK).font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(i === 0 ? 12 : 10).text(l, x, doc.y, { width: colW });
    });
    return doc.y;
  };
  const leftEnd = block(left, 'From', [
    q.business,
    [q.contact, q.position].filter(Boolean).join(', '),
    q.phone, q.email,
    [q.address, q.town].filter(Boolean).join(', '),
    q.pobox && `P.O. Box ${q.pobox}`,
    q.pin && `KRA PIN ${q.pin}`,
  ]);
  const rightEnd = block(left + colW + 24, 'Quotation', [
    `Dated ${day(q.quoteDate)}`,
    `Valid until ${day(q.validUntil)}`,
    `Received ${day(q.receivedAt)}`,
    q.ourRef && `Our reference: ${q.ourRef}`,
    q.site && `For site: ${q.site}`,
    `Currency: ${q.currency}`,
  ]);
  doc.y = Math.max(leftEnd, rightEnd) + 20;

  // Materials table.
  const cols = [
    { key: 'n', label: '#', w: 30, align: 'left' as const },
    { key: 'desc', label: 'Material', w: width - 30 - 50 - 56 - 82 - 92, align: 'left' as const },
    { key: 'unit', label: 'Unit', w: 50, align: 'left' as const },
    { key: 'qty', label: 'Qty', w: 56, align: 'right' as const },
    { key: 'price', label: 'Unit price', w: 82, align: 'right' as const },
    { key: 'total', label: 'Total', w: 92, align: 'right' as const },
  ];
  const pad = 6;
  const header = () => {
    const y = doc.y;
    doc.rect(left, y, width, 22).fill(GREEN);
    let x = left;
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
    for (const c of cols) { doc.text(c.label, x + pad, y + 7, { width: c.w - pad * 2, align: c.align }); x += c.w; }
    doc.y = y + 22;
  };
  header();
  q.items.forEach((it, i) => {
    const cells: Record<string, string> = { n: String(i + 1), desc: it.desc, unit: it.unit, qty: qtyFmt.format(it.qty), price: fmt(it.unitPrice), total: fmt(it.total) };
    doc.font('Helvetica').fontSize(9.5);
    const descH = doc.heightOfString(it.desc, { width: cols[1].w - pad * 2 }) + (it.spec ? doc.fontSize(8.5).heightOfString(it.spec, { width: cols[1].w - pad * 2 }) + 2 : 0);
    const h = Math.max(descH, 12) + pad * 2;
    if (doc.y + h > bottom()) { doc.addPage(); header(); }
    const y = doc.y;
    if (i % 2 === 1) doc.rect(left, y, width, h).fill(PAPER);
    let x = left;
    for (const c of cols) {
      doc.fillColor(INK).font(c.key === 'total' ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5).text(cells[c.key], x + pad, y + pad, { width: c.w - pad * 2, align: c.align });
      if (c.key === 'desc' && it.spec) doc.fillColor(MUTED).fontSize(8.5).text(it.spec, x + pad, doc.y + 2, { width: c.w - pad * 2 });
      x += c.w;
    }
    doc.moveTo(left, y + h).lineTo(left + width, y + h).lineWidth(0.5).strokeColor(RULE).stroke();
    doc.y = y + h;
  });

  // Totals, right-aligned.
  doc.moveDown(0.8);
  const t = q.totals;
  const lines: [string, string, boolean?][] = [['Subtotal', fmt(t.subtotal)]];
  if (t.discount) lines.push(['Discount', `- ${fmt(t.discount)}`]);
  if (t.delivery) lines.push(['Delivery', fmt(t.delivery)]);
  lines.push([`VAT (${t.vatRate}%)`, fmt(t.vat)], [`Total (${q.currency})`, fmt(t.total), true]);
  ensure(lines.length * 18 + 12);
  const tw = 240, tx = left + width - tw;
  for (const [label, value, strong] of lines) {
    const y = doc.y;
    if (strong) { doc.rect(tx, y - 2, tw, 22).fill(GREEN); doc.fillColor('#FFFFFF'); } else doc.fillColor(INK);
    doc.font(strong ? 'Helvetica-Bold' : 'Helvetica').fontSize(strong ? 11 : 10);
    doc.text(label, tx + 8, y + (strong ? 4 : 0), { width: tw / 2 - 8 });
    doc.text(value, tx + tw / 2, y + (strong ? 4 : 0), { width: tw / 2 - 8, align: 'right' });
    doc.y = y + (strong ? 24 : 18);
  }

  // Terms and sign-off.
  const terms: [string, string][] = [
    ['Delivery time', q.leadTime], ['Payment terms', q.payment], ['Payment details', q.payDetails], ['Notes', q.notes],
  ].filter(([, v]) => v) as [string, string][];
  if (terms.length) {
    doc.moveDown(1);
    ensure(40);
    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(11).text('Terms', left, doc.y, { width });
    doc.moveDown(0.3);
    for (const [label, value] of terms) {
      ensure(30);
      doc.fillColor(MUTED).font('Helvetica').fontSize(9).text(label, left, doc.y, { width });
      doc.fillColor(INK).fontSize(10).text(value, left, doc.y, { width });
      doc.moveDown(0.4);
    }
  }
  if (q.signName) {
    doc.moveDown(0.6);
    ensure(30);
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text('Sent and confirmed by', left, doc.y, { width });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(10).text(`${q.signName}, for ${q.business}`, left, doc.y, { width });
  }

  // Staff copy only: where it was sent from.
  if (opts.staff && (q.gps || q.ip)) {
    doc.moveDown(1);
    ensure(70);
    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(11).text('Where it was sent from (staff copy)', left, doc.y, { width });
    doc.moveDown(0.3).fillColor(INK).font('Helvetica').fontSize(9.5);
    if (q.gps) doc.text(`GPS: ${q.gps.lat.toFixed(6)}, ${q.gps.lng.toFixed(6)}${q.gps.accuracy >= 0 ? ` (within ${q.gps.accuracy} m)` : ''}`, left, doc.y, { width, link: `https://www.google.com/maps?q=${q.gps.lat},${q.gps.lng}` });
    if (q.ip) doc.text(`IP address: ${q.ip}${q.ipLocation ? ` (${[q.ipLocation.city, q.ipLocation.region, q.ipLocation.country].filter(Boolean).join(', ')})` : ''}`, left, doc.y, { width });
  }

  // Footer line on every page.
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0; // writing below the margin would otherwise start a new page
    const y = doc.page.height - 34;
    doc.fillColor(MUTED).font('Helvetica').fontSize(8)
      .text(`Tough Yew Co. · Quotation ${q.quoteNo} from ${q.business} · page ${i + 1} of ${range.count}`, left, y, { width, align: 'center', lineBreak: false });
  }
  doc.end();
  return doc;
}
