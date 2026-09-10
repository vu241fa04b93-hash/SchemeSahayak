import type { ConnectionMode } from '../types';

export interface ServiceErrorShape {
  code: 'network' | 'unauthorized' | 'not_found' | 'validation' | 'conflict' | 'server';
  message: string;
}

export class ServiceError extends Error {
  code: ServiceErrorShape['code'];
  constructor(code: ServiceErrorShape['code'], message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

type Env = Record<string, string | undefined>;

function env(): Env {
  try {
    return ((import.meta as unknown as {env?: Env;}).env ?? {}) as Env;
  } catch {
    return {};
  }
}

export const API_BASE_URL: string = (env().VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export const SUPABASE_URL: string = env().VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY: string = env().VITE_SUPABASE_ANON_KEY ?? '';

/** True only when a backend base URL has been configured at build time. */
export const isApiConfigured = (): boolean => API_BASE_URL.length > 0;

let mode: ConnectionMode = isApiConfigured() ? 'connected' : 'demo';
const listeners = new Set<(m: ConnectionMode) => void>();

export function getMode(): ConnectionMode {
  return mode;
}

export function setMode(next: ConnectionMode): void {
  if (mode === next) return;
  mode = next;
  listeners.forEach((l) => l(mode));
}

export function subscribeMode(fn: (m: ConnectionMode) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let authToken: string | null = null;
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Single fetch wrapper. Every service goes through this; nothing calls
 * fetch from a component. Throws a typed ServiceError on failure so the
 * caller can decide whether to surface an error or fall back to Demo Mode.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isApiConfigured()) throw new ServiceError('network', 'API base URL is not configured');

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(init.headers ?? {})
      }
    });
  } catch {
    setMode('demo');
    throw new ServiceError('network', 'Could not reach the service');
  }

  if (!response.ok) {
    const code =
    response.status === 401 || response.status === 403 ?
    'unauthorized' :
    response.status === 404 ?
    'not_found' :
    response.status === 409 ?
    'conflict' :
    response.status === 422 || response.status === 400 ?
    'validation' :
    'server';
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as {detail?: string;message?: string;};
      message = body.detail ?? body.message ?? message;
    } catch {

      /* body was not JSON */}
    throw new ServiceError(code, message);
  }

  setMode('connected');
  return (await response.json()) as T;
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function get<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' });
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}