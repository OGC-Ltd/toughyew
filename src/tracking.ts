import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { BlockList, isIP } from 'node:net';
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

// Addresses that never belong to a real visitor: this machine (127.0.0.1, ::1), private and internal networks
// (10.x, 172.16–31.x, 192.168.x, carrier-grade 100.64.x, link-local, IPv6 unique-local) and unspecified ones.
const internal = new BlockList();
for (const [net, bits] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16]] as const) {
  internal.addSubnet(net, bits, 'ipv4');
}
for (const [net, bits] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10]] as const) internal.addSubnet(net, bits, 'ipv6');

export function isPublicIp(ip: string): boolean {
  const family = isIP(ip);
  if (!family) return false;
  return !internal.check(ip, family === 4 ? 'ipv4' : 'ipv6');
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

// Every line of a JSONL log in data/, oldest first; unreadable lines are skipped.
export async function readLog<T>(file: string): Promise<T[]> {
  let text = '';
  try { text = await readFile(path.join(dataDir, file), 'utf8'); } catch { return []; }
  const out: T[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* skip */ }
  }
  return out;
}

// Every page someone opens (static files are served before this runs, so only pages are counted). Visits from
// this machine or an internal network (testing, health checks) are not real visitors and are not recorded.
export function logVisits(req: Request, _res: Response, next: NextFunction) {
  if (req.method === 'GET' && !req.path.startsWith('/staff') && req.path !== '/health' && isPublicIp(clientIp(req))) {
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
