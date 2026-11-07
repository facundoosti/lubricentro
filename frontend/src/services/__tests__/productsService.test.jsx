import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@services/api', () => ({
  api: { post: mocks.post, get: vi.fn() },
  default: { post: mocks.post, get: vi.fn() },
}));

import { useBulkIvaUpdate, productKeys } from '@services/productsService';

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { invalidate, ...renderHook(() => useBulkIvaUpdate(), { wrapper }) };
};

describe('useBulkIvaUpdate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía la alícuota y los ids al endpoint masivo', async () => {
    mocks.post.mockResolvedValue({ data: { success: true, data: { updated: 2 } } });
    const { result } = setup();

    let response;
    await act(async () => {
      response = await result.current.mutateAsync({ product_ids: [1, 2], iva_rate: 10.5 });
    });

    expect(mocks.post).toHaveBeenCalledWith('/products/bulk_iva_update', { product_ids: [1, 2], iva_rate: 10.5 });
    expect(response.data.updated).toBe(2);
  });

  it('invalida las queries de productos al terminar', async () => {
    mocks.post.mockResolvedValue({ data: { success: true, data: { updated: 1 } } });
    const { result, invalidate } = setup();

    await act(async () => {
      await result.current.mutateAsync({ product_ids: [1], iva_rate: 21 });
    });

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.all }),
    );
  });
});
