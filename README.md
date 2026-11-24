# Toughyew

Server-rendered Node.js app: **Express 5 + TypeScript**, **Pug** templates, **SCSS** styles.

## Run

```bash
npm install
cp .env.example .env
npm run dev        # server (tsx watch) + sass --watch + client tsc --watch, http://localhost:3100
```

Production:

```bash
npm run build      # sass → public/css, client tsc → public/js, server tsc → dist/
npm start
```

## Layout

```
src/
  server.ts          entry point
  app.ts             express setup (helmet, compression, static, pug)
  config.ts          env config
  routes/index.ts    home + POST /enquire (validated, appended to data/enquiries.jsonl)
  content.ts         page copy, services, steps, FAQs, photo credits
  styles/            SCSS: abstracts/ (tokens, mixins), base, layout, components/
views/
  layouts/base.pug   html shell
  partials/          header (lockup, nav), footer (mast, photo credits)
  pages/             home (one page: services, craft, process, inspiration, FAQ, enquiry), 404, error
public/              static files; css/ is generated
```

Add a page: a route in `src/routes/index.ts` and a template in `views/pages/` that `extends ../layouts/base`.

## Motion

`src/client/site.ts` (compiled to `public/js/site.js`) adds the behaviour: the header that turns solid and tucks away on scroll, the hero slideshow (crossfade, slow push-in, progress dots, pause), scroll reveals, the gallery rail arrows, the FAQ ease-in and the form sending state. The page works with scripting off, and every animation stops under `prefers-reduced-motion: reduce`.
