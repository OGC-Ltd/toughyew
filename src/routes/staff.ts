import { Router, type NextFunction, type Request, type Response } from 'express';
import { formatters, isQuoteId, readQuotes, renderQuote, type Quote } from './quotes.js';

// Staff pages: the quotations suppliers have sent. No sign-in (by request), so they are left out of the
// site's links and search engines are asked not to index or keep them.
export const staffRouter = Router();

function staffHeaders(_req: Request, res: Response, next: NextFunction) {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
}

staffRouter.use('/staff', staffHeaders);

const todayIso = () => new Date().toISOString().slice(0, 10);
const isExpired = (q: Quote) => q.validUntil < todayIso();

// Free-text search over the supplier, contact, references, site and every material line.
function matches(q: Quote, term: string) {
  if (!term) return true;
  const hay = [q.business, q.contact, q.phone, q.email, q.town, q.quoteNo, q.ourRef, q.site, q.id, ...q.items.flatMap((i) => [i.desc, i.spec])]
    .join(' ').toLowerCase();
  return term.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
}

function filtered(all: Quote[], query: Request['query']) {
  const term = String(query.q ?? '').trim().slice(0, 200);
  const status = ['valid', 'expired'].includes(String(query.status)) ? String(query.status) : 'all';
  const list = all.filter((q) => matches(q, term) && (status === 'all' || (status === 'expired') === isExpired(q)));
  return { term, status, list };
}

staffRouter.get('/staff/quotations', async (req, res) => {
  const all = await readQuotes();
  const { term, status, list } = filtered(all, req.query);
  const query = new URLSearchParams({ ...(term && { q: term }), ...(status !== 'all' && { status }) }).toString();
  res.render('pages/staff-quotes', {
    title: 'Received quotations',
    quotes: list.map((q) => ({ ...q, expired: isExpired(q) })),
    total: all.length,
    term, status,
    csvHref: `/staff/quotations.csv${query ? `?${query}` : ''}`,
    ...formatters,
  });
});

// One row per material line, so prices from different suppliers can be compared in a spreadsheet.
staffRouter.get('/staff/quotations.csv', async (req, res) => {
  const { list } = filtered(await readQuotes(), req.query);
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop a spreadsheet treating supplier text as a formula
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ['Received', 'Quotation ID', 'Supplier', 'Contact', 'Phone', 'Email', 'Town', 'Their quote no.', 'Quote date', 'Valid until',
    'Our reference', 'Site', 'Currency', 'Line', 'Material', 'Specification', 'Unit', 'Quantity', 'Unit price', 'Line total',
    'Quotation total (incl. VAT)', 'Delivery time', 'Payment terms',
    'GPS latitude', 'GPS longitude', 'GPS accuracy (m)', 'IP address', 'IP location'];
  const rows = list.flatMap((q) => q.items.map((it, i) => [
    q.receivedAt.slice(0, 10), q.id, q.business, q.contact, q.phone, q.email, q.town, q.quoteNo, q.quoteDate, q.validUntil,
    q.ourRef, q.site, q.currency, i + 1, it.desc, it.spec, it.unit, it.qty, (it.unitPrice / 100).toFixed(2), (it.total / 100).toFixed(2),
    (q.totals.total / 100).toFixed(2), q.leadTime, q.payment,
    q.gps?.lat ?? '', q.gps?.lng ?? '', q.gps && q.gps.accuracy >= 0 ? q.gps.accuracy : '', q.ip ?? '',
    q.ipLocation ? [q.ipLocation.city, q.ipLocation.region, q.ipLocation.country].filter(Boolean).join(', ') : '',
  ]));
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="quotations-${todayIso()}.csv"`);
  res.send('﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n');
});

staffRouter.get('/staff/quotations/:id', async (req, res, next) => {
  const id = req.params.id;
  if (!isQuoteId(id)) return next();
  const q = (await readQuotes()).find((x) => x.id === id);
  if (!q) return next();
  renderQuote(res, q, { staff: true });
});
