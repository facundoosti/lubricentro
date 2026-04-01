import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@services/api";

export const budgetKeys = {
  all: ["budgets"],
  lists: () => [...budgetKeys.all, "list"],
  list: (filters) => [...budgetKeys.lists(), { filters }],
  details: () => [...budgetKeys.all, "detail"],
  detail: (id) => [...budgetKeys.details(), id],
};

export const useBudgets = (filters = {}) => {
  return useQuery({
    queryKey: budgetKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page);
      if (filters.per_page) params.append("per_page", filters.per_page);
      const response = await api.get(`/budgets?${params.toString()}`);
      return response.data;
    },
  });
};

export const useBudget = (id) => {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/budgets/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/budgets", { budgets: data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/budgets/${id}`, {
        budgets: data,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
};
