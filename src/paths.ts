import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The project folder (one up from src/ or dist/), so saved data lands in toughyew/data wherever the server is started from.
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const dataDir = path.join(root, 'data');
