import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';
import { budgetKeys } from '@services/budgetsService';

// Query keys
const serviceRecordKeys = {
  all: ['serviceRecords'],
  lists: () => [...serviceRecordKeys.all, 'list'],
  list: (filters) => [...serviceRecordKeys.lists(), { filters }],
  details: () => [...serviceRecordKeys.all, 'detail'],
  detail: (id) => [...serviceRecordKeys.details(), id],
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

// Helper: build FormData for multipart uploads (only when photos are present)
export const toFormData = (namespace, data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === 'items_attributes') {
      // Ítems anidados con índice: service_record[items_attributes][0][description].
      // null va como '' (Rails lo toma como nil): así se puede vaciar el % o el catálogo de una línea guardada.
      value.forEach((item, idx) => {
        Object.entries(item).forEach(([k, v]) => {
          if (v !== undefined) fd.append(`${namespace}[${key}][${idx}][${k}]`, v ?? '');
        });
      });
    } else if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${namespace}[${key}][]`, v));
    } else {
      fd.append(`${namespace}[${key}]`, value);
    }
  });
  return fd;
};

// Mutations
export const useCreateServiceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { photos, ...fields } = data;
      const hasPhotos = Array.isArray(photos) && photos.length > 0;
      const payload = hasPhotos
        ? toFormData('service_record', { ...fields, photos })
        : { service_record: fields };
      const response = await api.post('/service_records', payload);
      return response.data;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.lists() });
      // Crear la atención desde un presupuesto lo marca como aprobado en el backend.
      if (response?.data?.budget_id ?? variables?.budget_id) {
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
        queryClient.invalidateQueries({ queryKey: budgetKeys.details() });
      }
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useUpdateServiceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { photos, ...fields } = data;
      const hasPhotos = Array.isArray(photos) && photos.length > 0;
      const payload = hasPhotos
        ? toFormData('service_record', { ...fields, photos })
        : { service_record: fields };
      const response = await api.patch(`/service_records/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.detail(variables.id) });
    },
    onError: (error) => {
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
    },
    onError: (error) => {
      console.error('Error:', error);
      throw error;
    },
  });
};
