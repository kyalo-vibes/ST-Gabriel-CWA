import { apiFetch } from './client';

function transform(m: any) {
  return {
    ...m,
    join_date: m.join_date ?? m.joinDate,
    jumuia: jumuiaToDisplay(m.jumuia),
    status: statusToDisplay(m.status),
    approvalStatus: approvalToDisplay(m.approvalStatus),
  };
}

function jumuiaToDisplay(raw: string): string {
  const map: Record<string, string> = {
    ST_PETER: 'St. Peter', ST_PAUL: 'St. Paul',
    ST_JOSEPH: 'St. Joseph', ST_MARY: 'St. Mary',
  };
  return map[raw] ?? raw;
}

function statusToDisplay(raw: string): string {
  const map: Record<string, string> = { ACTIVE: 'Active', INACTIVE: 'Inactive', PENDING: 'Pending' };
  return map[raw] ?? raw;
}

function approvalToDisplay(raw: string): string {
  const map: Record<string, string> = { APPROVED: 'Approved', PENDING: 'Pending', REJECTED: 'Rejected' };
  return map[raw] ?? raw;
}

export const membersApi = {
  getAll: () => apiFetch('/members').then((list: any[]) => list.map(transform)),
  getOne: (id: string) => apiFetch(`/members/${id}`).then(transform),
  create: (data: any) => apiFetch('/members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/members/${id}`, { method: 'DELETE' }),
  approve: (id: string) => apiFetch(`/members/${id}/approve`, { method: 'PATCH' }),
  resetPassword: (id: string) => apiFetch(`/members/${id}/reset-password`, { method: 'PATCH' }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch('/members/me/password', { method: 'PATCH', body: JSON.stringify(data) }),
};
