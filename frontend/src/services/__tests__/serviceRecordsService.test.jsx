import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mocks = vi.hoisted(() => ({ post: vi.fn(), patch: vi.fn() }));
vi.mock('@services/api', () => ({ api: { post: mocks.post, patch: mocks.patch, get: vi.fn() } }));

import { useCreateServiceRecord, useUpdateServiceRecord, toFormData } from '@services/serviceRecordsService';
import { budgetKeys } from '@services/budgetsService';

const setup = (hook) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  return renderHook(hook, { wrapper });
};

const items = [
  { id: 1, position: 0, description: 'Aceite', quantity: 4, unit_price: 10000, iva_rate: null, product_id: 7, service_id: null },
  { id: 2, _destroy: true },
];

describe('serviceRecordsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.post.mockResolvedValue({ data: { success: true } });
    mocks.patch.mockResolvedValue({ data: { success: true } });
  });

  it('crea con items_attributes y budget_id en JSON', async () => {
    const { result } = setup(() => useCreateServiceRecord());
    await act(async () => {
      await result.current.mutateAsync({ customer_id: 3, budget_id: 12, items_attributes: items });
    });
    expect(mocks.post).toHaveBeenCalledWith('/service_records', {
      service_record: { customer_id: 3, budget_id: 12, items_attributes: items },
    });
  });

  it('al crear con budget_id invalida listas y detalles de presupuestos', async () => {
    mocks.post.mockResolvedValue({ data: { success: true, data: { id: 9, budget_id: 12 } } });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useCreateServiceRecord(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ customer_id: 3, budget_id: 12, items_attributes: items });
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: budgetKeys.lists() });
    expect(spy).toHaveBeenCalledWith({ queryKey: budgetKeys.details() });
  });

  it('al crear sin budget_id no invalida presupuestos', async () => {
    mocks.post.mockResolvedValue({ data: { success: true, data: { id: 9, budget_id: null } } });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useCreateServiceRecord(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ customer_id: 3, items_attributes: items });
    });
    expect(spy).not.toHaveBeenCalledWith({ queryKey: budgetKeys.lists() });
    expect(spy).not.toHaveBeenCalledWith({ queryKey: budgetKeys.details() });
  });

  it('con fotos manda los ítems indexados en FormData (null como vacío)', async () => {
    const { result } = setup(() => useUpdateServiceRecord());
    const photo = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await act(async () => {
      await result.current.mutateAsync({ id: 5, data: { notes: 'ok', items_attributes: items, photos: [photo] } });
    });
    const [url, fd] = mocks.patch.mock.calls[0];
    expect(url).toBe('/service_records/5');
    expect(fd.get('service_record[items_attributes][0][description]')).toBe('Aceite');
    expect(fd.get('service_record[items_attributes][0][iva_rate]')).toBe('');
    expect(fd.get('service_record[items_attributes][0][product_id]')).toBe('7');
    expect(fd.get('service_record[items_attributes][1][_destroy]')).toBe('true');
    expect(fd.getAll('service_record[photos][]')).toHaveLength(1);
  });

  it('toFormData omite campos nulos de primer nivel', () => {
    const fd = toFormData('service_record', { notes: null, mileage: 100 });
    expect(fd.has('service_record[notes]')).toBe(false);
    expect(fd.get('service_record[mileage]')).toBe('100');
  });
});
