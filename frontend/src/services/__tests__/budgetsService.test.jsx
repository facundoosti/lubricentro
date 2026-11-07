import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mocks = vi.hoisted(() => ({ post: vi.fn(), patch: vi.fn() }));
vi.mock('@services/api', () => ({ api: { post: mocks.post, patch: mocks.patch, get: vi.fn() } }));

import { useDuplicateBudget, useUpdateBudgetStatus, budgetKeys } from '@services/budgetsService';

const setup = (hook) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  return { invalidate, ...renderHook(hook, { wrapper }) };
};

describe('budgetsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useDuplicateBudget llama al endpoint e invalida el listado', async () => {
    mocks.post.mockResolvedValue({ data: { success: true, data: { id: 8 } } });
    const { result, invalidate } = setup(() => useDuplicateBudget());

    let res;
    await act(async () => { res = await result.current.mutateAsync(5); });

    expect(mocks.post).toHaveBeenCalledWith('/budgets/5/duplicate');
    expect(res.data.id).toBe(8);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: budgetKeys.lists() });
  });

  it('useUpdateBudgetStatus envía solo el estado', async () => {
    mocks.patch.mockResolvedValue({ data: { success: true } });
    const { result, invalidate } = setup(() => useUpdateBudgetStatus());

    await act(async () => { await result.current.mutateAsync({ id: 5, status: 'sent' }); });

    expect(mocks.patch).toHaveBeenCalledWith('/budgets/5', { budgets: { status: 'sent' } });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: budgetKeys.detail(5) });
  });
});
