import { apiFetch } from './client';

export const whatsappApi = {
  getStatus: () => apiFetch('/whatsapp/status'),
  getQr: () => apiFetch('/whatsapp/qr'),
  getGroups: () => apiFetch('/whatsapp/groups'),
  send: (payload: Record<string, unknown>) =>
    apiFetch('/whatsapp/send', { method: 'POST', body: JSON.stringify(payload) }),
};
