import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

export const settingKeys = {
  all: ['setting'],
  detail: () => [...settingKeys.all, 'detail'],
};

export const useSetting = () => {
  return useQuery({
    queryKey: settingKeys.detail(),
    queryFn: async () => {
      const response = await api.get('/setting');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingData) => {
      const response = await api.put('/setting', { setting: settingData });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: settingKeys.all });
    },
  });
};
