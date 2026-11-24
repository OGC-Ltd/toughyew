import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import geoip from 'geoip-lite';
import { dataDir } from './paths.js';

// Visitor and supplier location records. IP addresses are placed on a map from geoip-lite's local copy of the
// GeoLite2 database, so no address leaves the server. An IP location is approximate: usually the town of the
// network, sometimes only the country, and nothing at all for local or private addresses.

export type IpLocation = { country: string; region: string; city: string; timezone: string; lat: number; lng: number } | null;

export function clientIp(req: Request): string {
  // req.ip honours the 'trust proxy' setting (TRUST_PROXY in .env) when the site sits behind a proxy.
  return (req.ip ?? req.socket.remoteAddress ?? '').replace(/^::ffff:/, '');
}

export function ipLocation(ip: string): IpLocation {
  const g = ip ? geoip.lookup(ip) : null;
  if (!g) return null;
  // Some countries' regions come back as bare numeric codes, which mean nothing on screen; those are left out.
  return { country: g.country, region: /^\d+$/.test(g.region) ? '' : g.region, city: g.city, timezone: g.timezone, lat: g.ll[0], lng: g.ll[1] };
}

export function requestTrace(req: Request) {
  const ip = clientIp(req);
  return { ip, ipLocation: ipLocation(ip), userAgent: String(req.headers['user-agent'] ?? '').slice(0, 400) };
}

export async function record(file: string, entry: object): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await appendFile(path.join(dataDir, file), JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n');
}

// Every page someone opens (static files are served before this runs, so only pages are counted).
export function logVisits(req: Request, _res: Response, next: NextFunction) {
  if (req.method === 'GET' && !req.path.startsWith('/staff') && req.path !== '/health') {
    record('visits.jsonl', {
      path: req.path,
      referrer: String(req.headers.referer ?? '').slice(0, 400),
      ...requestTrace(req),
    }).catch((err) => console.error('visit log failed', err));
  }
  next();
}

// GPS position sent with the form: numbers in range, or null.
export type Gps = { lat: number; lng: number; accuracy: number; at: string };
export function readGps(body: Record<string, unknown>): Gps | null {
  const lat = Number(body.gpsLat), lng = Number(body.gpsLng), accuracy = Number(body.gpsAccuracy);
  const at = String(body.gpsAt ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (String(body.gpsLat).trim() === '' || String(body.gpsLng).trim() === '') return null;
  return { lat, lng, accuracy: Number.isFinite(accuracy) ? Math.round(accuracy) : -1, at: /^\d{4}-\d\d-\d\dT/.test(at) ? at.slice(0, 30) : '' };
}
