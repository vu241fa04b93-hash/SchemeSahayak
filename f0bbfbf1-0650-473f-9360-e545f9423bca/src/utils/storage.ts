/**
 * Namespaced browser storage. Everything user-owned lives under
 * ss.u.<userId>.* so two accounts in the same browser can never
 * read each other's profile, chat, saved schemes or applications.
 */

const ROOT = 'ss';

export function globalKey(name: string): string {
  return `${ROOT}.${name}`;
}

export function userKey(userId: string, name: string): string {
  return `${ROOT}.u.${userId}.${name}`;
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {

    /* quota or private mode — non-fatal */}
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {

    /* no-op */}
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}