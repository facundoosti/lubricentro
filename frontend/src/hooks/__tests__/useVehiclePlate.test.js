import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useVehiclePlate } from '@hooks/useVehiclePlate';
import { usePlateLookup, useVehiclesByPlate } from '@services/vehiclesService';

vi.mock('@services/vehiclesService', () => ({
  usePlateLookup: vi.fn(),
  useVehiclesByPlate: vi.fn(),
}));

const lookupResult = (overrides = {}) => ({
  data: undefined,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
  ...overrides,
});

// Arranca vacío y escribe la patente, para que el debounce tenga efecto
const renderTyping = (plate, options) => {
  const hook = renderHook(({ value }) => useVehiclePlate(value, options), { initialProps: { value: '' } });
  hook.rerender({ value: plate });
  return hook;
};

const advance = (ms) => act(() => { vi.advanceTimersByTime(ms); });

describe('useVehiclePlate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    usePlateLookup.mockReturnValue(lookupResult());
    useVehiclesByPlate.mockReturnValue({ data: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('patente inválida: no consulta dueño ni servicio externo', () => {
    const { result } = renderTyping('AB12');
    advance(1000);

    expect(result.current.isValid).toBe(false);
    expect(useVehiclesByPlate.mock.calls.every(([plate]) => plate === '')).toBe(true);
    expect(usePlateLookup.mock.calls.every(([plate]) => plate === '')).toBe(true);
    expect(result.current.lookupStatus).toBe('idle');
  });

  it('consulta recién después del debounce', () => {
    renderTyping('abc123');
    expect(usePlateLookup).not.toHaveBeenCalledWith('ABC123');

    advance(400);
    expect(useVehiclesByPlate).toHaveBeenLastCalledWith('ABC123');
    expect(usePlateLookup).not.toHaveBeenCalledWith('ABC123');

    advance(200);
    expect(usePlateLookup).toHaveBeenLastCalledWith('ABC123');
  });

  it('el conflicto excluye al vehículo que se está editando', () => {
    useVehiclesByPlate.mockImplementation((plate) => ({
      data: plate === 'ABC123' ? [{ id: 5, license_plate: 'ABC123' }, { id: 9, license_plate: 'ABC123' }] : [],
    }));
    const { result } = renderTyping('ABC123', { currentVehicleId: '5' });
    advance(400);
    expect(result.current.conflict).toMatchObject({ id: 9 });
  });

  it('sin otro vehículo con la patente no hay conflicto', () => {
    useVehiclesByPlate.mockImplementation((plate) => ({
      data: plate === 'ABC123' ? [{ id: 5, license_plate: 'ABC123' }] : [],
    }));
    const { result } = renderTyping('ABC123', { currentVehicleId: 5 });
    advance(400);
    expect(result.current.conflict).toBeNull();
  });

  it('la patente original (edición) no dispara la búsqueda automática', () => {
    const { result } = renderTyping('ABC123', { currentVehicleId: 5, originalPlate: 'abc123' });
    advance(1000);
    expect(usePlateLookup.mock.calls.every(([plate]) => plate === '')).toBe(true);
    expect(result.current.lookupStatus).toBe('idle');
  });

  it('status not_found cuando el servicio no encuentra la patente', () => {
    usePlateLookup.mockImplementation((plate) => lookupResult(plate ? { data: { status: 'not_found' } } : {}));
    const { result } = renderTyping('AB123CD');
    advance(600);
    expect(result.current.lookupStatus).toBe('not_found');
    expect(result.current.lookupData).toBeNull();
  });

  it('status error cuando la consulta falla', () => {
    usePlateLookup.mockImplementation((plate) => lookupResult(plate ? { isError: true } : {}));
    const { result } = renderTyping('AB123CD');
    advance(600);
    expect(result.current.lookupStatus).toBe('error');
  });
});
