import path from 'node:path';
import dotenv from 'dotenv';
import { root } from './paths.js';

// Read toughyew/.env wherever the server is started from (the dev preview starts it from the folder above).
dotenv.config({ path: path.join(root, '.env'), quiet: true });

export const config = {
  port: Number(process.env.PORT ?? 3100),
  env: process.env.NODE_ENV ?? 'development',
  appName: 'Tough Yew Co.',
  trustProxy: process.env.TRUST_PROXY ?? '',
} as const;

export const isProd = config.env === 'production';
