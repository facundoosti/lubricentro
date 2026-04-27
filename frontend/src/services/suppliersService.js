import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

export const supplierKeys = {
  all: ['suppliers'],
  lists: () => [...supplierKeys.all, 'list'],
  list: (filters) => [...supplierKeys.lists(), filters],
  details: () => [...supplierKeys.all, 'detail'],
  detail: (id) => [...supplierKeys.details(), id],
};

export const useSuppliers = (filters = {}) => {
  const { page = 1, per_page = 50, search = '' } = filters;

  return useQuery({
    queryKey: supplierKeys.list({ page, per_page, search }),
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), per_page: per_page.toString() });
      if (search) params.append('search', search);
      const response = await api.get(`/suppliers?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSupplier = (id) => {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/suppliers/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/suppliers', { supplier: data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/suppliers/${id}`, { supplier: data });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/suppliers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};
