import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFloatingPosition } from '@hooks/useFloatingPosition';

const makeAnchor = (rect) => {
  const el = document.createElement('div');
  el.getBoundingClientRect = vi.fn(() => ({ right: rect.left + rect.width, ...rect }));
  return { current: el };
};

describe('useFloatingPosition', () => {
  let innerHeight;

  beforeEach(() => {
    innerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight });
    vi.restoreAllMocks();
  });

  it('por defecto abre hacia abajo, debajo del ancla con el offset', () => {
    const anchorRef = makeAnchor({ top: 100, bottom: 144, left: 20, width: 300 });
    const { result } = renderHook(() =>
      useFloatingPosition(anchorRef, { isOpen: true, maxHeight: 240, offset: 4 }));

    expect(result.current.placement).toBe('bottom');
    expect(result.current.style).toEqual({ position: 'fixed', left: 20, width: 300, top: 148 });
  });

  it('abre hacia arriba si abajo no entra el maxHeight y arriba hay más lugar', () => {
    const anchorRef = makeAnchor({ top: 700, bottom: 744, left: 10, width: 200 });
    const { result } = renderHook(() =>
      useFloatingPosition(anchorRef, { isOpen: true, maxHeight: 240, offset: 4 }));

    expect(result.current.placement).toBe('top');
    expect(result.current.style).toEqual({ position: 'fixed', left: 10, width: 200, bottom: 104 });
    expect(result.current.style.top).toBeUndefined();
  });

  it('recalcula en scroll (de cualquier contenedor) y en resize', () => {
    const rect = { top: 100, bottom: 144, left: 20, width: 300 };
    const anchorRef = makeAnchor(rect);
    const { result } = renderHook(() => useFloatingPosition(anchorRef, { isOpen: true }));
    expect(result.current.style.top).toBe(148);

    anchorRef.current.getBoundingClientRect.mockReturnValue({ ...rect, top: 50, bottom: 94 });
    act(() => {
      document.body.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.style.top).toBe(98);

    anchorRef.current.getBoundingClientRect.mockReturnValue({ ...rect, top: 600, bottom: 644, width: 500 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.placement).toBe('top');
    expect(result.current.style.width).toBe(500);
  });

  it('cerrado no calcula ni escucha scroll/resize', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const anchorRef = makeAnchor({ top: 100, bottom: 144, left: 20, width: 300 });
    const { result } = renderHook(() => useFloatingPosition(anchorRef, { isOpen: false }));

    expect(result.current).toEqual({ style: {}, placement: 'bottom' });
    expect(anchorRef.current.getBoundingClientRect).not.toHaveBeenCalled();
    const events = addSpy.mock.calls.map(([type]) => type);
    expect(events).not.toContain('scroll');
    expect(events).not.toContain('resize');
  });

  it('deja de escuchar al cerrarse', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const anchorRef = makeAnchor({ top: 100, bottom: 144, left: 20, width: 300 });
    const { rerender } = renderHook(
      ({ isOpen }) => useFloatingPosition(anchorRef, { isOpen }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });
    const events = removeSpy.mock.calls.map(([type]) => type);
    expect(events).toContain('scroll');
    expect(events).toContain('resize');

    anchorRef.current.getBoundingClientRect.mockClear();
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(anchorRef.current.getBoundingClientRect).not.toHaveBeenCalled();
  });

  it('al desmontarse abierto remueve los listeners (scroll con capture)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const anchorRef = makeAnchor({ top: 100, bottom: 144, left: 20, width: 300 });
    const { unmount } = renderHook(() => useFloatingPosition(anchorRef, { isOpen: true }));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('sin ancla (ref null) abierto devuelve el estado inicial sin romper', () => {
    const anchorRef = { current: null };
    const { result } = renderHook(() => useFloatingPosition(anchorRef, { isOpen: true }));

    expect(result.current).toEqual({ style: {}, placement: 'bottom' });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toEqual({ style: {}, placement: 'bottom' });
  });

  it('abrir → cerrar → abrir recalcula la posición', () => {
    const rect = { top: 100, bottom: 144, left: 20, width: 300 };
    const anchorRef = makeAnchor(rect);
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFloatingPosition(anchorRef, { isOpen }),
      { initialProps: { isOpen: true } },
    );
    expect(result.current.style.top).toBe(148);

    rerender({ isOpen: false });
    anchorRef.current.getBoundingClientRect.mockReturnValue({ ...rect, top: 200, bottom: 244 });
    rerender({ isOpen: true });
    expect(result.current.style.top).toBe(248);
  });

  it('un scroll sin cambio de posición conserva la referencia del style', () => {
    const anchorRef = makeAnchor({ top: 100, bottom: 144, left: 20, width: 300 });
    const { result } = renderHook(() => useFloatingPosition(anchorRef, { isOpen: true }));
    const firstStyle = result.current.style;

    act(() => {
      document.body.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.style).toBe(firstStyle);
  });
});
