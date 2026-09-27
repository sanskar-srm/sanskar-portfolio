import 'server-only';

import {promises as fs} from 'fs';
import path from 'path';
import {Redis} from '@upstash/redis';
import {ExperienceListSchema, type Experience} from './experience';

/**
 * Persistence for admin-managed experience entries.
 *
 * Production (Vercel): Upstash Redis — set UPSTASH_REDIS_REST_URL/TOKEN, or add
 * the Upstash integration in Vercel which injects KV_REST_API_URL/TOKEN.
 * Local development: falls back to data/experience.json.
 */

const KEY = 'portfolio:experience';
const FILE = path.join(process.cwd(), 'data', 'experience.json');

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({url, token}) : null;
}

export const storageMode = () => (redis() ? 'redis' : 'file');

export async function getExperience(): Promise<Experience[]> {
  try {
    const client = redis();
    const raw = client ? await client.get<unknown>(KEY) : JSON.parse(await fs.readFile(FILE, 'utf8'));
    const parsed = ExperienceListSchema.safeParse(raw ?? []);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export async function saveExperience(list: Experience[]): Promise<void> {
  const data = ExperienceListSchema.parse(list);
  const client = redis();
  if (client) {
    await client.set(KEY, data);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      'No database configured. Add the Upstash Redis integration in Vercel (or set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).'
    );
  }
  await fs.mkdir(path.dirname(FILE), {recursive: true});
  await fs.writeFile(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
