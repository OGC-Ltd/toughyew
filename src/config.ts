import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3100),
  env: process.env.NODE_ENV ?? 'development',
  appName: 'Toughyew',
} as const;

export const isProd = config.env === 'production';
