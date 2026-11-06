import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mocks = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('@rails/actioncable', () => ({
  createConsumer: () => ({ subscriptions: { create: mocks.create } }),
}));

import { useImportCable } from '@hooks/useImportCable';

describe('useImportCable', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no rompe la app si no se puede crear la suscripción (WebSocket bloqueado)', () => {
    mocks.create.mockImplementation(() => { throw new Error('WS bloqueado'); });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => renderHook(() => useImportCable('job-1', {}))).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('enruta cada tipo de mensaje a su callback', () => {
    let received;
    mocks.create.mockImplementation((_params, handlers) => {
      received = handlers.received;
      return { unsubscribe: vi.fn() };
    });
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const onFailed = vi.fn();
    renderHook(() => useImportCable('job-1', { onProgress, onComplete, onFailed }));

    received({ type: 'progress', processed: 1 });
    received({ type: 'complete', imported: 1 });
    received({ type: 'failed', errors: [] });

    expect(onProgress).toHaveBeenCalledWith({ type: 'progress', processed: 1 });
    expect(onComplete).toHaveBeenCalledWith({ type: 'complete', imported: 1 });
    expect(onFailed).toHaveBeenCalledWith({ type: 'failed', errors: [] });
  });

  it('no se suscribe sin jobId', () => {
    renderHook(() => useImportCable(null, {}));
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
