export interface ContributionEvent {
  id: string;
  title: string;
  type: 'Bereavement' | 'Wedding' | 'School Fees' | 'Monthly' | 'Harambee' | 'Special';
  amountPerMember: number;
  dueDate: string;
  createdDate: string;
  targetJumuia: 'All' | 'St. Peter' | 'St. Paul' | 'St. Joseph' | 'St. Mary';
  status: 'Active' | 'Closed';
  description: string;
}

export interface EventPayment {
  id: string;
  eventId: string;
  memberId: string;
  amountDue: number;
  amountPaid: number;
  status: 'Pending' | 'Paid';
  paidDate?: string;
}

// All 50 approved member IDs (m-051 through m-053 are pending, excluded)
const memberIds = Array.from({ length: 50 }, (_, i) => `m-${String(i + 1).padStart(3, '0')}`);

export const eventsData = [
  {
    id: 'evt-001',
    title: 'Monthly Contribution — March 2026',
    type: 'Monthly',
    amountPerMember: 500,
    dueDate: '2026-03-31',
    createdDate: '2026-03-01',
    targetJumuia: 'All',
    status: 'Active',
    description: 'Regular monthly contribution for March 2026.',
  },
  {
    id: 'evt-002',
    title: "Bereavement — Mary Kamau's Mother",
    type: 'Bereavement',
    amountPerMember: 300,
    dueDate: '2026-04-05',
    createdDate: '2026-03-20',
    targetJumuia: 'All',
    status: 'Active',
    description: 'Contribution towards the burial expenses for Mary Kamau\'s late mother.',
  },
  {
    id: 'evt-003',
    title: 'Headscarf Project 2025',
    type: 'Special',
    amountPerMember: 200,
    dueDate: '2025-12-31',
    createdDate: '2025-10-01',
    targetJumuia: 'All',
    status: 'Closed',
    description: 'Special levy for purchasing new headscarves for all CWA members.',
  },
];

// Helper to build payment records for a single event
function buildPayments(
  eventId: string,
  amount: number,
  paidCount: number,
  paidDate: string,
): EventPayment[] {
  return memberIds.map((memberId, i) => {
    const paid = i < paidCount;
    return {
      id: `ep-${eventId}-${String(i + 1).padStart(3, '0')}`,
      eventId,
      memberId,
      amountDue: amount,
      amountPaid: paid ? amount : 0,
      status: paid ? 'Paid' as const : 'Pending' as const,
      ...(paid ? { paidDate } : {}),
    };
  });
}

export const eventPaymentsData = [
  // evt-001: ~60% paid (30 of 50)
  ...buildPayments('evt-001', 500, 30, '2026-03-15'),
  // evt-002: ~30% paid (15 of 50)
  ...buildPayments('evt-002', 300, 15, '2026-03-22'),
  // evt-003: all paid (50 of 50)
  ...buildPayments('evt-003', 200, 50, '2025-12-20'),
];
