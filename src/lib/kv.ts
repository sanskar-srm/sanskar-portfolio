import 'server-only';

import {promises as fs} from 'fs';
import path from 'path';
import {Redis} from '@upstash/redis';

/**
 * Tiny JSON key-value store for admin-managed content.
 *
 * Production (Vercel): Upstash Redis — set UPSTASH_REDIS_REST_URL/TOKEN, or add
 * the Upstash integration in Vercel which injects KV_REST_API_URL/TOKEN.
 * Local development: falls back to a JSON file in data/.
 */

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({url, token}) : null;
}

export const storageMode = () => (redis() ? 'redis' : 'file');

const fileFor = (name: string) => path.join(process.cwd(), 'data', `${name}.json`);

export async function readJSON(key: string, file: string): Promise<unknown> {
  try {
    const client = redis();
    if (client) return await client.get<unknown>(key);
    return JSON.parse(await fs.readFile(fileFor(file), 'utf8'));
  } catch {
    return null;
  }
}

export async function writeJSON(key: string, file: string, data: unknown): Promise<void> {
  const client = redis();
  if (client) {
    await client.set(key, data);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      'No database configured. Add the Upstash Redis integration in Vercel (or set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).'
    );
  }
  await fs.mkdir(path.dirname(fileFor(file)), {recursive: true});
  await fs.writeFile(fileFor(file), JSON.stringify(data, null, 2) + '\n', 'utf8');
}
