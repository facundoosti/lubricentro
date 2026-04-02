import { useQuery } from '@tanstack/react-query';
import { api } from '@services/api';

export const reminderKeys = {
  all: ['serviceReminders'],
  lists: () => [...reminderKeys.all, 'list'],
  list: (filters) => [...reminderKeys.lists(), { filters }],
  statistics: () => [...reminderKeys.all, 'statistics'],
};

export const useServiceReminders = (filters = {}) => {
  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.page) params.append('page', filters.page);
      if (filters.per_page) params.append('per_page', filters.per_page);
      const response = await api.get(`/service_reminders?${params.toString()}`);
      return response.data;
    },
  });
};

export const useReminderStatistics = () => {
  return useQuery({
    queryKey: reminderKeys.statistics(),
    queryFn: async () => {
      const response = await api.get('/service_reminders/statistics');
      return response.data;
    },
  });
};
