import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

// Query keys
export const serviceRecordKeys = {
  all: ['serviceRecords'],
  lists: () => [...serviceRecordKeys.all, 'list'],
  list: (filters) => [...serviceRecordKeys.lists(), { filters }],
  details: () => [...serviceRecordKeys.all, 'detail'],
  detail: (id) => [...serviceRecordKeys.details(), id],
  statistics: () => [...serviceRecordKeys.all, 'statistics'],
  overdue: () => [...serviceRecordKeys.all, 'overdue'],
  upcoming: () => [...serviceRecordKeys.all, 'upcoming'],
};

// Queries
export const useServiceRecords = (filters = {}) => {
  return useQuery({
    queryKey: serviceRecordKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.vehicle_id) params.append('vehicle_id', filters.vehicle_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.page) params.append('page', filters.page);
      if (filters.per_page) params.append('per_page', filters.per_page);

      const response = await api.get(`/service_records?${params.toString()}`);
      return response.data;
    },
  });
};

export const useServiceRecord = (id) => {
  return useQuery({
    queryKey: serviceRecordKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/service_records/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useServiceRecordStatistics = () => {
  return useQuery({
    queryKey: serviceRecordKeys.statistics(),
    queryFn: async () => {
      const response = await api.get('/service_records/statistics');
      return response.data;
    },
  });
};

export const useOverdueServiceRecords = () => {
  return useQuery({
    queryKey: serviceRecordKeys.overdue(),
    queryFn: async () => {
      const response = await api.get('/service_records/overdue');
      return response.data;
    },
  });
};

export const useUpcomingServiceRecords = () => {
  return useQuery({
    queryKey: serviceRecordKeys.upcoming(),
    queryFn: async () => {
      const response = await api.get('/service_records/upcoming');
      return response.data;
    },
  });
};

// Mutations
export const useCreateServiceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      console.log("API call with:", data);
      const response = await api.post('/service_records', { service_record: data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.statistics() });
    },
    onError: (error) => {
      console.error('Error:', error);
      throw error;
    },
  });
};

export const useUpdateServiceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      console.log("API call with:", { id, data });
      const response = await api.patch(`/service_records/${id}`, { service_record: data });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.statistics() });
    },
    onError: (error) => {
      console.error('Error:', error);
      throw error;
    },
  });
};

export const useDeleteServiceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      console.log("API call with:", id);
      const response = await api.delete(`/service_records/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.statistics() });
    },
    onError: (error) => {
      console.error('Error:', error);
      throw error;
    },
  });
}; 