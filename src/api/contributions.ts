import { apiFetch } from './client';

function transform(c: any) {
  return {
    ...c,
    member_id: c.member_id ?? c.memberId,
    date: c.date ?? (c.date ? c.date : undefined),
  };
}

export const contributionsApi = {
  getAll: () => apiFetch('/contributions').then((list: any[]) => list.map(transform)),
  getByMember: (memberId: string) =>
    apiFetch(`/contributions/member/${memberId}`).then((list: any[]) => list.map(transform)),
  create: (data: any) =>
    apiFetch('/contributions', { method: 'POST', body: JSON.stringify(data) }),
};
