import crypto from 'crypto';

type Entry = { token: string; expiresAt: number };

const store = new Map<string, Entry>();
const TTL_MS = 60_000;

export function issueLoginCode(token: string): string {
  const code = crypto.randomBytes(24).toString('hex');
  store.set(code, { token, expiresAt: Date.now() + TTL_MS });
  return code;
}

export function consumeLoginCode(code: string): string | null {
  const entry = store.get(code);
  store.delete(code);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) return null;
  return entry.token;
}
