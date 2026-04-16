import { apiFetch } from './client';

export const expensesApi = {
  getAll: () => apiFetch('/expenses'),
  create: (data: any) =>
    apiFetch('/expenses', { method: 'POST', body: JSON.stringify(data) }),
};
