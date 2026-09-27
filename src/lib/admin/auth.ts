import 'server-only';

import {createHash, scrypt as scryptCb, timingSafeEqual} from 'crypto';
import {promisify} from 'util';
import {jwtVerify, SignJWT} from 'jose';
import {cookies, headers} from 'next/headers';

/**
 * Single-admin auth. Credentials live only in env vars:
 *   ADMIN_EMAIL           — login email
 *   ADMIN_PASSWORD_HASH   — "salt:hash" from `npm run hash-password -- <password>`
 *   ADMIN_SESSION_SECRET  — 32+ random chars used to sign the session cookie
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: string, len: number) => Promise<Buffer>;
const COOKIE = 'sb_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set (32+ characters).');
  return new TextEncoder().encode(s);
}

const sha = (v: string) => createHash('sha256').update(v).digest();

export function adminConfigured() {
  return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);
}

export async function verifyCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL ?? '';
  const stored = process.env.ADMIN_PASSWORD_HASH ?? '';
  const [salt, hash] = stored.split(':');
  if (!expectedEmail || !salt || !hash) return false;

  const emailOk = timingSafeEqual(sha(email.trim().toLowerCase()), sha(expectedEmail.trim().toLowerCase()));
  const derived = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  const passOk = expected.length === derived.length && timingSafeEqual(derived, expected);
  return emailOk && passOk;
}

// Best-effort brute-force throttle (per server instance).
const attempts = new Map<string, {count: number; until: number}>();
const WINDOW = 15 * 60 * 1000;
const LIMIT = 5;

export async function clientKey() {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
}

export function isThrottled(key: string) {
  const a = attempts.get(key);
  return !!a && a.count >= LIMIT && a.until > Date.now();
}

export function recordFailure(key: string) {
  const a = attempts.get(key);
  const now = Date.now();
  if (!a || a.until < now) attempts.set(key, {count: 1, until: now + WINDOW});
  else a.count++;
}

export function clearFailures(key: string) {
  attempts.delete(key);
}

export async function createSession() {
  const token = await new SignJWT({role: 'admin'})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject('admin')
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete({name: COOKIE, path: '/admin'});
}

export async function isAuthenticated() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !adminConfigured()) return false;
  try {
    const {payload} = await jwtVerify(token, secret(), {algorithms: ['HS256']});
    return payload.sub === 'admin';
  } catch {
    return false;
  }
}
