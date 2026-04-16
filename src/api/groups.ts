import { apiFetch } from './client';

export const groupsApi = {
  getAll: () => apiFetch('/groups'),
  create: (data: { id: string; name: string }) =>
    apiFetch('/groups', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/groups/${id}`, { method: 'DELETE' }),
};
