// Usage: npm run hash-password -- "your-password"
// Prints a value for ADMIN_PASSWORD_HASH (salt:hash, scrypt).
import {randomBytes, scryptSync} from 'crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('hex')}  # (new random secret, if you need one)`);
