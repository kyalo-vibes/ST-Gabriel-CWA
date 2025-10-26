import { create } from 'zustand';
import { membersData } from '../data/members';
import { contributionsData } from '../data/contributions';
import { notificationsData } from '../data/notifications';
import { reportsData } from '../data/reports';
import { savedFiltersData } from '../data/filters';
import { expensesData } from '../data/expenses';

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
  login: (email: string, password: string, accountType?: string) => Promise<boolean>;
  logout: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Members
  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;

  // Contributions
  contributions: Contribution[];
  addContribution: (contribution: Omit<Contribution, 'id'>) => void;
  getContributionsByMember: (memberId: string) => Contribution[];

  // Expenses
  expenses: Expense[];
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
}

export const useStore = create<StoreState>((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string, accountType: string = 'admin') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (accountType === 'member') {
      // Check if member exists and is approved
      const member = get().members.find(m => m.email.toLowerCase() === email.toLowerCase());
      
      console.log('Member login attempt:', email);
      console.log('Found member:', member);
      
      if (!member) {
        console.log('Member not found');
        return false;
      }
      
      if (member.approvalStatus === 'Pending') {
        console.log('Member pending approval');
        return false; // Account pending approval
      }
      
      if (member.approvalStatus === 'Rejected') {
        console.log('Member rejected');
        return false; // Account rejected
      }
      
      // Allow login for approved members regardless of active/inactive status for demo
      if (member.approvalStatus === 'Approved') {
        set({
          isAuthenticated: true,
          user: {
            name: member.name,
            email: member.email,
            role: 'Member',
          },
        });
        console.log('Member login successful');
        return true;
      }
      
      return false;
    } else {
      // Admin login - accept any credentials for demo
      set({
        isAuthenticated: true,
        user: {
          name: 'Admin User',
          email: email,
          role: 'Administrator',
        },
      });
      return true;
    }
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },

  // Theme
  theme: 'light',
  toggleTheme: () => {
    set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
  },

  // Members
  members: membersData as Member[],
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
}));