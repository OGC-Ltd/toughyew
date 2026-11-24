import { Router } from 'express';

export const router = Router();

const features = [
  { title: 'TypeScript', body: 'Strict, ESM, compiled with tsc and run in dev with tsx watch.' },
  { title: 'Pug', body: 'Layouts, partials and mixins render every page on the server.' },
  { title: 'SCSS', body: 'Tokens, base and component partials compiled by Dart Sass.' },
];

router.get('/', (_req, res) => {
  res.render('pages/home', { title: 'Home', features });
});

router.get('/about', (_req, res) => {
  res.render('pages/about', { title: 'About' });
});

router.get('/contact', (_req, res) => {
  res.render('pages/contact', { title: 'Contact', values: {}, errors: {} });
});

router.post('/contact', (req, res) => {
  const values = {
    name: String(req.body?.name ?? '').trim(),
    email: String(req.body?.email ?? '').trim(),
    message: String(req.body?.message ?? '').trim(),
  };
  const errors: Record<string, string> = {};
  if (!values.name) errors.name = 'Tell us your name.';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (values.message.length < 10) errors.message = 'A few more words, please (10+ characters).';

  if (Object.keys(errors).length) {
    return res.status(422).render('pages/contact', { title: 'Contact', values, errors });
  }
  res.render('pages/contact', { title: 'Contact', values: {}, errors: {}, sent: true });
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});
