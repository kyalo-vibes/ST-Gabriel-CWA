import { apiFetch } from './client';

export const reportsApi = {
  getSummary: () => apiFetch('/reports/summary'),
  getMonthlyTrends: () => apiFetch('/reports/monthly-trends'),
  getTopContributors: () => apiFetch('/reports/top-contributors'),
  getOutstanding: () => apiFetch('/reports/outstanding'),
};
