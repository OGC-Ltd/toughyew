# Toughyew

Server-rendered Node.js app: **Express 5 + TypeScript**, **Pug** templates, **SCSS** styles.

## Run

```bash
npm install
cp .env.example .env
npm run dev        # tsx watch + sass --watch, http://localhost:3100
```

Production:

```bash
npm run build      # sass → public/css, tsc → dist/
npm start
```

## Layout

```
src/
  server.ts          entry point
  app.ts             express setup (helmet, compression, static, pug)
  config.ts          env config
  routes/index.ts    page routes
  styles/            SCSS: abstracts/ (tokens, mixins), base, layout, components/
views/
  layouts/base.pug   html shell
  partials/          header, footer, mixins (card, field)
  pages/             home, about, contact, 404, error
public/              static files; css/ is generated
```

Add a page: a route in `src/routes/index.ts` and a template in `views/pages/` that `extends ../layouts/base`.
