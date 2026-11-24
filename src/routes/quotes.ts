import { randomBytes } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { dataDir } from '../paths.js';
import { Router, type Request, type Response } from 'express';
import { quotePdf, quotePdfName } from '../quote-pdf.js';
import { clientIp, isPublicIp, readGps, record as recordEvent, requestTrace, type Gps, type IpLocation } from '../tracking.js';

// Supplier quotations: a supplier fills in the form at /supplier-quote, the quotation is stored as one line
// in data/quotations.jsonl and shown back as a branded, printable document at /supplier-quote/<id>.
export const quotesRouter = Router();

const file = path.join(dataDir, 'quotations.jsonl');

export const units = ['Pieces', 'Bags', 'Tonnes', 'Kilograms', 'Lorries (trips)', 'Cubic metres (m³)', 'Square metres (m²)', 'Metres', 'Lengths', 'Sheets', 'Litres', 'Rolls', 'Boxes', 'Sets', 'Lump sum'];
export const currencies = [{ value: 'KES', label: 'KES, Kenya shillings' }, { value: 'USD', label: 'USD, US dollars' }, { value: 'TZS', label: 'TZS, Tanzania shillings' }, { value: 'UGX', label: 'UGX, Uganda shillings' }];
export const vatRates = [{ value: '16', label: 'VAT at 16%' }, { value: '0', label: 'No VAT (exempt or not registered)' }];
export const paymentTerms = ['Cash on delivery', 'Payment before delivery', '50% deposit, balance on delivery', '7 days after delivery', '14 days after delivery', '30 days after delivery'];

const supplierKeys = ['business', 'contact', 'position', 'phone', 'email', 'address', 'town', 'pobox', 'pin'] as const;
const quoteKeys = ['quoteNo', 'quoteDate', 'validUntil', 'ourRef', 'site', 'currency'] as const;
const chargeKeys = ['discount', 'delivery', 'vat'] as const;
const termKeys = ['leadTime', 'payment', 'payDetails', 'notes', 'signName', 'confirm'] as const;
const allKeys = [...supplierKeys, ...quoteKeys, ...chargeKeys, ...termKeys];
type Key = (typeof allKeys)[number];
type Values = Record<Key, string>;
type Row = { desc: string; spec: string; unit: string; qty: string; price: string };
type RowError = Partial<Record<keyof Row, string>>;

const MIN_ROWS = 5;
const MAX_ROWS = 100;

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * 864e5).toISOString().slice(0, 10);
const blank = (): Values => ({
  ...(Object.fromEntries(allKeys.map((k) => [k, ''])) as Values),
  quoteDate: today(), validUntil: plusDays(today(), 30), currency: 'KES', vat: '16',
});
const emptyRow = (): Row => ({ desc: '', spec: '', unit: '', qty: '', price: '' });

// "12,500.50" or "12 500" -> 12500.5; anything else -> NaN.
const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(/[,\s]/g, '')));
const list = (v: unknown): string[] => (Array.isArray(v) ? v : v === undefined ? [] : [v]).map((x) => String(x ?? '').trim().slice(0, 500));

function render(res: Response, opts: { values?: Values; rows?: Row[]; errors?: Partial<Values>; rowErrors?: RowError[]; itemsError?: string; gpsError?: boolean } = {}) {
  const rows = opts.rows ?? [];
  while (rows.length < MIN_ROWS) rows.push(emptyRow());
  const errors = opts.errors ?? {};
  res.render('pages/quote-form', {
    title: 'Send us a quotation',
    description: 'Suppliers: send Tough Yew Co. a quotation for building materials.',
    values: opts.values ?? blank(),
    rows,
    errors,
    rowErrors: opts.rowErrors ?? [],
    itemsError: opts.itemsError,
    gpsError: !!opts.gpsError,
    hasErrors: Object.keys(errors).length > 0 || (opts.rowErrors ?? []).some((e) => e && Object.keys(e).length) || !!opts.itemsError,
    firstError: Object.keys(errors)[0],
    units, currencies, vatRates, paymentTerms,
  });
}

quotesRouter.get('/supplier-quote', (_req, res) => render(res));

// A quotation that could not be sent for want of a GPS position: who tried (as far as they had filled in), and from where.
function recordAttempt(req: Request, reason: string, who: Partial<Record<'business' | 'contact' | 'email' | 'phone', string>>) {
  const clip = (v: unknown) => String(v ?? '').trim().slice(0, 200);
  // Attempts from this machine or an internal network are tests, not suppliers.
  if (!isPublicIp(clientIp(req))) return Promise.resolve();
  return recordEvent('quote-attempts.jsonl', {
    reason,
    business: clip(who.business), contact: clip(who.contact), email: clip(who.email), phone: clip(who.phone),
    ...requestTrace(req),
  });
}

// Sent by the form's script the moment location is refused or unavailable (navigator.sendBeacon, JSON).
const failReasons: Record<string, string> = {
  denied: 'location permission refused', unavailable: 'location unavailable', timeout: 'location timed out', unsupported: 'browser has no location support',
};
quotesRouter.post('/supplier-quote/location-failed', async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const reason = failReasons[String(body.reason)] ?? 'location failed';
  await recordAttempt(req, reason, body as Record<string, string>).catch((err) => console.error('attempt log failed', err));
  res.status(204).end();
});

quotesRouter.post('/supplier-quote', async (req, res, next) => {
  const body = req.body ?? {};
  const values = Object.fromEntries(allKeys.map((k) => [k, String(body[k] ?? '').trim().slice(0, 2000)])) as Values;

  // Rows arrive as repeated fields (desc, spec, unit, qty, price), one of each per row; wholly empty rows are dropped.
  const cols = { desc: list(body.desc), spec: list(body.spec), unit: list(body.unit), qty: list(body.qty), price: list(body.price) };
  const count = Math.min(MAX_ROWS, Math.max(...Object.values(cols).map((c) => c.length), 0));
  const rows: Row[] = [];
  for (let i = 0; i < count; i++) {
    const r: Row = { desc: cols.desc[i] ?? '', spec: cols.spec[i] ?? '', unit: cols.unit[i] ?? '', qty: cols.qty[i] ?? '', price: cols.price[i] ?? '' };
    if (r.desc || r.spec || r.qty || r.price) rows.push(r);
  }

  const errors: Partial<Values> = {};
  if (!values.business) errors.business = 'Add the name of your business.';
  if (!values.contact) errors.contact = 'Add the name of the person we should speak to.';
  if (!/^[+\d][\d\s()-]{6,}$/.test(values.phone)) errors.phone = 'Add a phone number we can call, like 0712 345 678.';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Add an email address, like sales@example.com.';
  if (!values.address) errors.address = 'Add your physical address: building, street or road.';
  if (!values.town) errors.town = 'Add the town or city.';
  if (!values.quoteNo) errors.quoteNo = 'Add your quotation number, so we can quote it back to you.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.quoteDate)) errors.quoteDate = 'Add the date of the quotation.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.validUntil)) errors.validUntil = 'Add the date these prices hold until.';
  else if (values.validUntil < values.quoteDate) errors.validUntil = 'The prices must hold until on or after the quotation date.';
  if (!currencies.some((c) => c.value === values.currency)) errors.currency = 'Choose a currency.';
  if (!vatRates.some((v) => v.value === values.vat)) errors.vat = 'Choose how VAT applies.';
  for (const k of ['discount', 'delivery'] as const) {
    if (values[k] && !(num(values[k]) >= 0)) errors[k] = 'Use a number, like 2,500, or leave it empty.';
  }
  if (!values.leadTime) errors.leadTime = 'Say how soon you can deliver, like “3 days from order”.';
  if (!values.payment) errors.payment = 'Add your payment terms.';
  if (!values.signName) errors.signName = 'Add the name of the person sending this quotation.';
  if (values.confirm !== 'yes') errors.confirm = 'Tick the box to confirm the prices and details.';

  const rowErrors: RowError[] = rows.map((r) => {
    const e: RowError = {};
    if (!r.desc) e.desc = 'Name the material.';
    if (!units.includes(r.unit)) e.unit = 'Choose a unit.';
    if (!(num(r.qty) > 0)) e.qty = 'Use a quantity above 0.';
    if (!(num(r.price) >= 0)) e.price = 'Use a price, like 850.';
    return e;
  });
  const itemsError = rows.length ? undefined : 'Add at least one material with its quantity and price.';

  const gps = readGps(body);
  if (!gps) {
    await recordAttempt(req, 'sent without a GPS position', values).catch((err) => console.error('attempt log failed', err));
    res.status(422);
    return render(res, { values, rows, errors, rowErrors, itemsError, gpsError: true });
  }

  if (Object.keys(errors).length || rowErrors.some((e) => Object.keys(e).length) || itemsError) {
    res.status(422);
    return render(res, { values, rows, errors, rowErrors, itemsError });
  }

  // Money is worked in cents so the totals add up exactly.
  const cents = (n: number) => Math.round(n * 100);
  const items = rows.map((r) => {
    const qty = num(r.qty);
    const unitPrice = cents(num(r.price));
    return { desc: r.desc, spec: r.spec, unit: r.unit, qty, unitPrice, total: Math.round(qty * unitPrice) };
  });
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discount = values.discount ? cents(num(values.discount)) : 0;
  const delivery = values.delivery ? cents(num(values.delivery)) : 0;
  const taxable = Math.max(0, subtotal - discount + delivery);
  const vatRate = Number(values.vat);
  const vat = Math.round((taxable * vatRate) / 100);

  const id = `TYQ-${today().replace(/-/g, '')}-${randomBytes(4).toString('hex')}`;
  const { confirm: _confirm, discount: _d, delivery: _del, vat: _v, ...details } = values;
  const record = {
    id, receivedAt: new Date().toISOString(), ...details,
    // Where it was sent from: the device's GPS position and the network (IP) location, for staff only.
    gps, ...requestTrace(req),
    items, totals: { subtotal, discount, delivery, taxable, vatRate, vat, total: taxable + vat },
  };

  try {
    await mkdir(dataDir, { recursive: true });
    await appendFile(file, JSON.stringify(record) + '\n');
    res.redirect(303, `/supplier-quote/${id}?sent=1`);
  } catch (err) {
    next(err);
  }
});

export type Quote = {
  id: string; receivedAt: string; business: string; contact: string; position: string; phone: string; email: string;
  address: string; town: string; pobox: string; pin: string; quoteNo: string; quoteDate: string; validUntil: string;
  ourRef: string; site: string; currency: string; leadTime: string; payment: string; payDetails: string; notes: string; signName: string;
  items: { desc: string; spec: string; unit: string; qty: number; unitPrice: number; total: number }[];
  totals: { subtotal: number; discount: number; delivery: number; taxable: number; vatRate: number; vat: number; total: number };
  gps?: Gps | null; ip?: string; ipLocation?: IpLocation; userAgent?: string;
};

// Every stored quotation, newest first. A line that will not parse is skipped rather than failing the page.
export async function readQuotes(): Promise<Quote[]> {
  let text = '';
  try { text = await readFile(file, 'utf8'); } catch { return []; }
  const out: Quote[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* skip */ }
  }
  return out.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export const isQuoteId = (id: string) => /^TYQ-\d{8}-[0-9a-f]{8}$/.test(id);

const money = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const formatters = {
  fmt: (c: number) => money.format(c / 100),
  qty: (n: number) => new Intl.NumberFormat('en-KE', { maximumFractionDigits: 3 }).format(n),
  day: (iso: string) => longDate.format(new Date(iso)),
  shortDay: (iso: string) => shortDate.format(new Date(iso)),
};

export function renderQuote(res: Response, q: Quote, opts: { sent?: boolean; staff?: boolean } = {}) {
  res.render('pages/quote-view', {
    title: `Quotation ${q.quoteNo} from ${q.business}`,
    q, sent: !!opts.sent, staff: !!opts.staff, ...formatters,
  });
}

// The supplier's own copy as a PDF (no record of where it was sent from).
quotesRouter.get('/supplier-quote/:id.pdf', async (req, res, next) => {
  const id = req.params.id;
  if (!isQuoteId(id)) return next();
  const q = (await readQuotes()).find((x) => x.id === id);
  if (!q) return next();
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `attachment; filename="${quotePdfName(q)}"`);
  quotePdf(q).pipe(res);
});

quotesRouter.get('/supplier-quote/:id', async (req, res, next) => {
  const id = req.params.id;
  if (!isQuoteId(id)) return next();
  const q = (await readQuotes()).find((x) => x.id === id);
  if (!q) return next();
  renderQuote(res, q, { sent: req.query.sent === '1' });
});
