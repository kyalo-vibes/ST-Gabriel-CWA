import { apiFetch } from './client';

export interface ScheduleConfig {
  id: string;
  label: string;
  hour: number;
  enabled: boolean;
}

export const schedulerApi = {
  getConfig: (): Promise<ScheduleConfig[]> => apiFetch('/scheduler/config'),
  updateConfig: (id: string, data: { hour?: number; enabled?: boolean }): Promise<ScheduleConfig> =>
    apiFetch(`/scheduler/config/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
