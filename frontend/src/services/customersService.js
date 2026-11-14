import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

// Query Keys
export const customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  list: (filters) => [...customerKeys.lists(), filters],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
};

// Hooks para Customers
export const useCustomers = (filters = {}) => {
  const {
    page = 1,
    per_page = 10,
    search = '',
    enabled = true,
    ...otherFilters
  } = filters;

  return useQuery({
    queryKey: customerKeys.list({ page, per_page, search, ...otherFilters }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      // Agregar otros filtros si existen
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/customers?${params}`);
      return response.data;
    },
    enabled,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCustomer = (id) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 0, // Siempre considerar los datos como stale para forzar refetch
  });
};

// Clientes con el mismo teléfono (coincidencia por los últimos 10 dígitos en el backend).
export const useCustomersByPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return useQuery({
    queryKey: [...customerKeys.lists(), 'by-phone', digits],
    queryFn: async () => {
      const response = await api.get('/customers', { params: { phone, per_page: 5 } });
      return response.data?.data?.customers || [];
    },
    enabled: digits.length >= 6,
    staleTime: 30 * 1000,
  });
};

// Helper: build FormData for multipart uploads
const toFormData = (namespace, data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${namespace}[${key}][]`, v));
    } else {
      fd.append(`${namespace}[${key}]`, value);
    }
  });
  return fd;
};

// Mutations
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData) => {
      const { avatar, ...fields } = customerData;
      const payload = avatar instanceof File
        ? toFormData('customer', { ...fields, avatar })
        : { customer: fields };
      const response = await api.post('/customers', payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar y refetch la lista de customers
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Agregar el nuevo customer al cache si es necesario
      if (data.data?.customer) {
        queryClient.setQueryData(
          customerKeys.detail(data.data.customer.id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customerData }) => {
      const { avatar, ...fields } = customerData;
      const payload = avatar instanceof File
        ? toFormData('customer', { ...fields, avatar })
        : { customer: fields };
      const response = await api.put(`/customers/${id}`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      
      // Invalidar y refetch la lista de customers
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Forzar refetch del customer específico
      queryClient.refetchQueries({ queryKey: customerKeys.detail(variables.id) });
      
      // También actualizar el cache directamente como respaldo
      queryClient.setQueryData(
        customerKeys.detail(variables.id),
        data
      );
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      throw error;
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidar y refetch la lista de customers
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Remover el customer del cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      throw error;
    },
  });
};
