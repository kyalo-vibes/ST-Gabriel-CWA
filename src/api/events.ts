import { apiFetch } from './client';

function transformEvent(e: any) {
  return {
    ...e,
    type: eventTypeToDisplay(e.type),
    status: e.status === 'ACTIVE' ? 'Active' : 'Closed',
    createdDate: e.createdAt,
  };
}

function eventTypeToDisplay(raw: string): string {
  const map: Record<string, string> = {
    BEREAVEMENT: 'Bereavement', WEDDING: 'Wedding',
    SCHOOL_FEES: 'School Fees', MONTHLY: 'Monthly',
    HARAMBEE: 'Harambee', SPECIAL: 'Special',
  };
  return map[raw] ?? raw;
}

function transformPayment(p: any) {
  return {
    ...p,
    status: p.status === 'PAID' ? 'Paid' : 'Pending',
  };
}

export const eventsApi = {
  getAll: () => apiFetch('/events').then((list: any[]) => list.map(transformEvent)),
  getOne: (id: string) => apiFetch(`/events/${id}`).then(transformEvent),
  create: (data: any) =>
    apiFetch('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getPayments: (id: string) =>
    apiFetch(`/events/${id}/payments`).then((list: any[]) => list.map(transformPayment)),
  markPaid: (eventId: string, memberId: string) =>
    apiFetch(`/events/${eventId}/payments/${memberId}/pay`, { method: 'PATCH' }),
};
