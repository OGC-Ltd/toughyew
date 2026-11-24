import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config, isProd } from './config.js';
import { router } from './routes/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createApp() {
  const app = express();

  app.set('view engine', 'pug');
  app.set('views', path.join(root, 'views'));
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'style-src': ["'self'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
        },
      },
    }),
  );
  app.use(compression());
  app.use(morgan(isProd ? 'combined' : 'dev'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(root, 'public'), { maxAge: isProd ? '7d' : 0 }));

  app.use((req, res, next) => {
    res.locals.appName = config.appName;
    res.locals.path = req.path;
    res.locals.year = new Date().getFullYear();
    next();
  });

  app.use(router);

  app.use((_req, res) => {
    res.status(404).render('pages/404', { title: 'Not found' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).render('pages/error', {
      title: 'Something went wrong',
      message: isProd ? undefined : err.message,
    });
  });

  return app;
}
