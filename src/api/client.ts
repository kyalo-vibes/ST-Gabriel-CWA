import { useStore } from '@/store/useStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch(path: string, options?: RequestInit) {
  const token = useStore.getState().token;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      useStore.getState().logout();
    }
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || res.statusText);
  }
  return res.json();
}
