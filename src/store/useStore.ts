import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { membersData } from '../data/members';
import { contributionsData } from '../data/contributions';
import { notificationsData } from '../data/notifications';
import { reportsData } from '../data/reports';
import { savedFiltersData } from '../data/filters';
import { expensesData } from '../data/expenses';
import { eventsData, eventPaymentsData } from '../data/events';
import type { ContributionEvent, EventPayment } from '../data/events';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  join_date: string;
  total_contributed: number;
  balance: number;
  status: string;
  jumuia: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
}

interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  type: string;
  date: string;
  reference: string;
  status: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  reference: string;
  status: string;
}

interface Notification {
  id: string;
  member_id: string;
  message: string;
  date: string;
  type: string;
  status: string;
  targetGroup?: string;
  contributionType?: string;
  recipientCount?: number;
}

interface FilterCriteria {
  status?: string[];
  jumuia?: string[];
  minBalance?: number;
  maxBalance?: number;
  joinDateFrom?: string;
  joinDateTo?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria;
  createdAt: string;
}

interface StoreState {
  // Auth
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  setToken: (token: string | null) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Members
  members: Member[];
  setMembers: (members: Member[]) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;

  // Contributions
  contributions: Contribution[];
  setContributions: (contributions: Contribution[]) => void;
  addContribution: (contribution: Omit<Contribution, 'id'>) => void;
  getContributionsByMember: (memberId: string) => Contribution[];

  // Expenses
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;

  // Filters
  activeFilters: FilterCriteria | null;
  savedFilters: SavedFilter[];
  setActiveFilters: (filters: FilterCriteria) => void;
  clearFilters: () => void;
  saveFilter: (name: string, criteria: FilterCriteria) => void;
  deleteFilter: (id: string) => void;

  // Reports
  reports: typeof reportsData;

  // Events
  events: ContributionEvent[];
  eventPayments: EventPayment[];
  setEvents: (events: ContributionEvent[]) => void;
  setEventPayments: (payments: EventPayment[]) => void;
  createEvent: (event: Omit<ContributionEvent, 'id'>, targetMembers: Member[]) => void;
  markPaymentPaid: (eventId: string, memberId: string) => void;
  closeEvent: (eventId: string) => void;
  getEventPayments: (eventId: string) => EventPayment[];
  getPendingPaymentsByMember: (memberId: string) => (EventPayment & { event: ContributionEvent })[];

  // WhatsApp Groups
  approvedGroups: { id: string; name: string }[];
  setApprovedGroups: (groups: { id: string; name: string }[]) => void;
}

export const useStore = create<StoreState>()(persist((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    const { login: apiLogin } = await import('../api/auth');
    try {
      const data = await apiLogin(email, password);
      set({
        isAuthenticated: true,
        token: data.access_token,
        user: {
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        },
      });
      return true;
    } catch {
      return false;
    }
  },
  logout: () => {
    set({ isAuthenticated: false, user: null, token: null });
  },
  token: null,
  setToken: (token) => {
    set({ token });
  },

  // Theme
  theme: 'light',
  toggleTheme: () => {
    set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
  },

  // Members
  members: membersData as Member[],
  setMembers: (members) => set({ members }),
  addMember: (member) => {
    const newMember = {
      ...member,
      id: `m-${String(get().members.length + 1).padStart(3, '0')}`,
    };
    set(state => ({ members: [...state.members, newMember] }));
  },
  updateMember: (id, memberUpdate) => {
    set(state => ({
      members: state.members.map(m => (m.id === id ? { ...m, ...memberUpdate } : m)),
    }));
  },
  deleteMember: (id) => {
    set(state => ({
      members: state.members.filter(m => m.id !== id),
    }));
  },
  getMemberById: (id) => {
    return get().members.find(m => m.id === id);
  },

  // Contributions
  contributions: contributionsData as Contribution[],
  setContributions: (contributions) => set({ contributions }),
  addContribution: (contribution) => {
    const newContribution = {
      ...contribution,
      id: `c-${String(get().contributions.length + 1).padStart(3, '0')}`,
    };
    set(state => ({ contributions: [...state.contributions, newContribution] }));
  },
  getContributionsByMember: (memberId) => {
    return get().contributions.filter(c => c.member_id === memberId);
  },

  // Expenses
  expenses: expensesData as Expense[],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => {
    const newExpense = {
      ...expense,
      id: `e-${String(get().expenses.length + 1).padStart(3, '0')}`,
    };
    set(state => ({ expenses: [...state.expenses, newExpense] }));
  },

  // Notifications
  notifications: notificationsData as Notification[],
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: `n-${String(get().notifications.length + 1).padStart(3, '0')}`,
    };
    set(state => ({ notifications: [...state.notifications, newNotification] }));
  },

  // Filters
  activeFilters: null,
  savedFilters: savedFiltersData as SavedFilter[],
  setActiveFilters: (filters) => {
    set({ activeFilters: filters });
  },
  clearFilters: () => {
    set({ activeFilters: null });
  },
  saveFilter: (name, criteria) => {
    const newFilter = {
      id: `f-${String(get().savedFilters.length + 1).padStart(3, '0')}`,
      name: name,
      criteria: criteria,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ savedFilters: [...state.savedFilters, newFilter] }));
  },
  deleteFilter: (id) => {
    set(state => ({
      savedFilters: state.savedFilters.filter(f => f.id !== id),
    }));
  },

  // Reports
  reports: reportsData,

  // Events
  events: eventsData as ContributionEvent[],
  eventPayments: eventPaymentsData as EventPayment[],
  setEvents: (events) => set({ events }),
  setEventPayments: (payments) => set({ eventPayments: payments }),

  createEvent: (eventData, targetMembers) => {
    const newEvent: ContributionEvent = {
      ...eventData,
      id: `evt-${String(get().events.length + 1).padStart(3, '0')}`,
    };
    const newPayments: EventPayment[] = targetMembers.map((m, i) => ({
      id: `ep-${newEvent.id}-${String(i + 1).padStart(3, '0')}`,
      eventId: newEvent.id,
      memberId: m.id,
      amountDue: eventData.amountPerMember,
      amountPaid: 0,
      status: 'Pending' as const,
    }));
    set(state => ({
      events: [...state.events, newEvent],
      eventPayments: [...state.eventPayments, ...newPayments],
    }));
  },

  closeEvent: (eventId) => {
    set(state => ({
      events: state.events.map(e =>
        e.id === eventId ? { ...e, status: 'Closed' as const } : e
      ),
    }));
  },

  markPaymentPaid: (eventId, memberId) => {
    const now = new Date().toISOString().split('T')[0];
    set(state => ({
      eventPayments: state.eventPayments.map(ep =>
        ep.eventId === eventId && ep.memberId === memberId
          ? { ...ep, amountPaid: ep.amountDue, status: 'Paid' as const, paidDate: now }
          : ep
      ),
    }));
  },

  getEventPayments: (eventId) => {
    return get().eventPayments.filter(ep => ep.eventId === eventId);
  },

  getPendingPaymentsByMember: (memberId) => {
    const pending = get().eventPayments.filter(
      ep => ep.memberId === memberId && ep.status === 'Pending'
    );
    return pending.map(ep => ({
      ...ep,
      event: get().events.find(e => e.id === ep.eventId)!,
    }));
  },
  // WhatsApp Groups
  approvedGroups: [],
  setApprovedGroups: (groups) => set({ approvedGroups: groups }),
}), { name: 'cwa-store' }));