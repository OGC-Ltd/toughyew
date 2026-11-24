import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Router, type Response } from 'express';
import { credits, faqs, projectTypes, services, steps, timeframes } from '../content.js';

export const router = Router();

type Values = Record<'name' | 'email' | 'phone' | 'location' | 'type' | 'start' | 'budget' | 'message' | 'consent', string>;
const empty: Values = { name: '', email: '', phone: '', location: '', type: '', start: '', budget: '', message: '', consent: '' };

const dataDir = path.resolve(process.cwd(), 'data');

function renderHome(res: Response, opts: { values?: Values; errors?: Partial<Values>; sent?: boolean } = {}) {
  const errors = opts.errors ?? {};
  res.render('pages/home', {
    title: 'New builds, extensions and bespoke joinery',
    services, steps, faqs, projectTypes, timeframes, credits,
    values: opts.values ?? empty,
    errors,
    firstError: Object.keys(errors)[0],
    sent: opts.sent ?? false,
  });
}

router.get('/', (req, res) => {
  const type = String(req.query.type ?? '');
  const values = { ...empty, type: projectTypes.some((t) => t.value === type) ? type : '' };
  renderHome(res, { values, sent: req.query.sent === '1' });
});

router.post('/enquire', async (req, res, next) => {
  const body = req.body ?? {};
  const values = Object.fromEntries(
    Object.keys(empty).map((k) => [k, String(body[k] ?? '').trim().slice(0, 4000)]),
  ) as Values;

  const errors: Partial<Values> = {};
  if (!values.name) errors.name = 'Add your name so we know who to reply to.';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Add an email address we can reply to, like name@example.com.';
  if (!values.location) errors.location = 'Add the town or postcode of the project.';
  if (!projectTypes.some((t) => t.value === values.type)) errors.type = 'Choose the kind of project.';
  if (values.message.length < 10) errors.message = 'Tell us a little about the project, a sentence or two is enough.';
  if (values.consent !== 'yes') errors.consent = 'Tick the box so we may contact you about this enquiry.';

  if (Object.keys(errors).length) {
    res.status(422);
    return renderHome(res, { values, errors });
  }

  try {
    await mkdir(dataDir, { recursive: true });
    await appendFile(path.join(dataDir, 'enquiries.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...values }) + '\n');
    res.redirect(303, '/?sent=1#enquire');
  } catch (err) {
    next(err);
  }
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});
