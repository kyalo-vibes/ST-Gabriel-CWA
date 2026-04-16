import { apiFetch } from './client';

export interface LoginResponse {
  access_token: string;
  user: { sub: string; name: string; email: string; role: 'Administrator' | 'Member' };
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
