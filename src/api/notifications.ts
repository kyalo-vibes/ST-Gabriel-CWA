import { apiFetch } from './client';

function transform(n: any) {
  return {
    ...n,
    member_id: n.member_id ?? n.memberId ?? 'bulk',
    date: n.date ?? n.sentAt,
  };
}

export const notificationsApi = {
  getAll: () => apiFetch('/notifications').then((list: any[]) => list.map(transform)),
  create: (data: any) =>
    apiFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
};
