import { Router, type Request } from 'express';
import { isBot, isPublicIp, isSitePage, readLog, type Gps, type IpLocation } from '../tracking.js';
import { readQuotes } from './quotes.js';
import { pageOf } from '../paging.js';

// Staff: one log of where people were when they used the site. Each row is a page visit, a quotation that
// could not be sent (location refused or missing), or a quotation sent; each carries the IP address and the
// place that address belongs to, and sent quotations also carry the device's GPS position.
// Served as a page (/staff/locations), JSON (/staff/locations.json) and CSV (/staff/locations.csv).
export const locationsRouter = Router();

type Kind = 'visit' | 'failed' | 'sent';
export type LocationEntry = {
  at: string;
  kind: Kind;
  ip: string;
  ipLocation: IpLocation;
  gps: Gps | null;
  detail: string; // the page opened, why sending failed, or the quotation number
  who: string; // business and contact, where known
  link: string; // the staff page for a sent quotation
  userAgent: string;
};

type Visit = { at: string; path: string; ip?: string; ipLocation?: IpLocation; userAgent?: string };
type Attempt = { at: string; reason: string; business?: string; contact?: string; ip?: string; ipLocation?: IpLocation; userAgent?: string };

const kinds: Record<Kind, string> = { visit: 'Visit', failed: 'Not sent', sent: 'Quotation sent' };
const PAGE = 100;

async function allEntries(): Promise<LocationEntry[]> {
  const [visits, attempts, quotes] = await Promise.all([readLog<Visit>('visits.jsonl'), readLog<Attempt>('quote-attempts.jsonl'), readQuotes()]);
  const who = (b?: string, c?: string) => [b, c].filter(Boolean).join(', ');
  const entries: LocationEntry[] = [
    // Visits logged before the bot filter (src/tracking.ts, logVisits) still hold scanners and crawlers; drop them here too.
    ...visits.filter((v) => isSitePage(v.path) && !isBot(v.userAgent)).map((v) => ({ at: v.at, kind: 'visit' as const, ip: v.ip ?? '', ipLocation: v.ipLocation ?? null, gps: null, detail: v.path, who: '', link: '', userAgent: v.userAgent ?? '' })),
    ...attempts.map((a) => ({ at: a.at, kind: 'failed' as const, ip: a.ip ?? '', ipLocation: a.ipLocation ?? null, gps: null, detail: a.reason, who: who(a.business, a.contact), link: '', userAgent: a.userAgent ?? '' })),
    ...quotes.map((q) => ({ at: q.receivedAt, kind: 'sent' as const, ip: q.ip ?? '', ipLocation: q.ipLocation ?? null, gps: q.gps ?? null, detail: q.id, who: who(q.business, q.contact), link: `/staff/quotations/${q.id}`, userAgent: q.userAgent ?? '' })),
  ];
  // Only real visitors: entries from this machine (::1, 127.0.0.1) or an internal network were tests and are left out.
  return entries.filter((e) => isPublicIp(e.ip)).sort((a, b) => b.at.localeCompare(a.at));
}

export const placeName = (l: IpLocation) => (l ? [l.city, l.region, l.country].filter(Boolean).join(', ') : '');

function filtered(all: LocationEntry[], query: Request['query']) {
  const term = String(query.q ?? '').trim().slice(0, 200);
  const kind = (['visit', 'failed', 'sent'] as const).find((k) => k === query.kind) ?? 'all';
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  const list = all.filter((e) => {
    if (kind !== 'all' && e.kind !== kind) return false;
    if (!words.length) return true;
    const hay = [e.ip, placeName(e.ipLocation), e.detail, e.who, e.userAgent].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  return { term, kind, list };
}

const time = new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' });

locationsRouter.get('/staff/locations', async (req, res) => {
  const all = await allEntries();
  const { term, kind, list } = filtered(all, req.query);
  const keep = { ...(term && { q: term }), ...(kind !== 'all' && { kind }) };
  const paging = pageOf(list.length, req.query.page, PAGE, '/staff/locations', keep);
  const params = () => {
    const s = new URLSearchParams(keep).toString();
    return s ? `?${s}` : '';
  };
  res.render('pages/staff-locations', {
    title: 'Location log',
    entries: list.slice(paging.from, paging.to),
    paging,
    shown: list.length,
    total: all.length,
    counts: {
      visit: all.filter((e) => e.kind === 'visit').length,
      failed: all.filter((e) => e.kind === 'failed').length,
      sent: all.filter((e) => e.kind === 'sent').length,
      ips: new Set(all.map((e) => e.ip).filter(Boolean)).size,
    },
    term, kind, kinds,
    csvHref: `/staff/locations.csv${params()}`,
    jsonHref: `/staff/locations.json${params()}`,
    when: (iso: string) => time.format(new Date(iso)),
    placeName,
    mapHref: (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`,
  });
});

// The same log as data, newest first. Takes the page's filters (q, kind) plus limit (default 500, at most 5000).
locationsRouter.get('/staff/locations.json', async (req, res) => {
  const { term, kind, list } = filtered(await allEntries(), req.query);
  const limit = Math.min(5000, Math.max(1, Math.floor(Number(req.query.limit)) || 500));
  res.json({ filter: { q: term, kind }, count: list.length, returned: Math.min(limit, list.length), entries: list.slice(0, limit) });
});

locationsRouter.get('/staff/locations.csv', async (req, res) => {
  const { list } = filtered(await allEntries(), req.query);
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop a spreadsheet treating text as a formula
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ['Time (UTC)', 'Event', 'Detail', 'Supplier', 'IP address', 'IP place', 'IP latitude', 'IP longitude',
    'GPS latitude', 'GPS longitude', 'GPS accuracy (m)', 'Browser'];
  const rows = list.map((e) => [
    e.at, kinds[e.kind], e.detail, e.who, e.ip, placeName(e.ipLocation), e.ipLocation?.lat ?? '', e.ipLocation?.lng ?? '',
    e.gps?.lat ?? '', e.gps?.lng ?? '', e.gps && e.gps.accuracy >= 0 ? e.gps.accuracy : '', e.userAgent,
  ]);
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="location-log-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n');
});
