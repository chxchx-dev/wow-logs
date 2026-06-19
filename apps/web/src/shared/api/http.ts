const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  const payload = await res.json().catch(() => null) as { message?: string; code?: string } | null;

  if (!res.ok) {
    const error = new Error(payload?.message ?? `HTTP ${res.status}`);
    (error as Error & { code?: string }).code = payload?.code;
    throw error;
  }

  return payload as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
