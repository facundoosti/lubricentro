import { useQuery } from '@tanstack/react-query';
import { api } from '@services/api';

export const useCategories = (search = '') => {
  return useQuery({
    queryKey: ['categories', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await api.get(`/categories?${params}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};
