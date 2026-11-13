import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

export const installmentPlanKeys = {
  all: ['installment_plans'],
  list: () => [...installmentPlanKeys.all, 'list'],
};

// Los planes cambian el cálculo de cuotas que devuelve cada presupuesto.
const invalidate = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: installmentPlanKeys.all });
  queryClient.invalidateQueries({ queryKey: ['budgets'] });
};

export const useInstallmentPlans = () =>
  useQuery({
    queryKey: installmentPlanKeys.list(),
    queryFn: async () => {
      const response = await api.get('/installment_plans');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCreateInstallmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/installment_plans', { installment_plan: data });
      return response.data;
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const useUpdateInstallmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/installment_plans/${id}`, { installment_plan: data });
      return response.data;
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const useDeleteInstallmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/installment_plans/${id}`);
      return response.data;
    },
    onSuccess: () => invalidate(queryClient),
  });
};
