import type { ApiError } from './types';

const DEFAULT_TIMEOUT_MS = 15000;

export const API_BASE: string = process.env.EXPO_PUBLIC_API_BASE ?? 'https://api.purifacil.mx';
export const USE_MOCK_API: boolean = (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') !== 'false';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  try {
    const response = await fetch(url, { ...init, headers, signal: controller.signal });
    const text = await response.text();
    const body = text ? safeJson(text) : undefined;
    if (!response.ok) {
      const err: ApiError = {
        status: response.status,
        code: (body && typeof body === 'object' && 'code' in body ? String(body.code) : `HTTP_${response.status}`),
        message: (body && typeof body === 'object' && 'message' in body ? String(body.message) : response.statusText),
      };
      throw err;
    }
    return body as T;
  } catch (raw) {
    if (raw && typeof raw === 'object' && 'status' in raw) throw raw as ApiError;
    const message = raw instanceof Error ? raw.message : 'network_error';
    const err: ApiError = { status: 0, code: 'NETWORK', message };
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
