import { useCallback, useEffect, useRef } from 'react';
import { useImportCable } from '@hooks/useImportCable';
import { useImportStatus } from '@services/productsService';

const FINAL_TYPES = ['complete', 'failed'];

export const STATUS_UNKNOWN_MESSAGE =
  'No pudimos confirmar el estado de la importación. Revisá el listado de productos.';

/**
 * Sigue una importación por dos vías: Action Cable (tiempo real) y consulta
 * periódica del estado (respaldo si el WebSocket no conecta o se corta).
 * - onComplete se llama una sola vez por jobId, venga de donde venga el aviso.
 * - El progreso nunca retrocede (un estado consultado puede llegar atrasado).
 * - Si la consulta falla de forma persistente, se informa como fallo.
 */
export function useImportProgress(jobId, { onProgress, onComplete } = {}) {
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const finishedJobRef = useRef(null);
  const lastProcessedRef = useRef({ jobId: null, processed: -1 });
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  const handleUpdate = useCallback((data) => {
    if (!data || !jobId || finishedJobRef.current === jobId) return;

    if (FINAL_TYPES.includes(data.type)) {
      finishedJobRef.current = jobId;
      onCompleteRef.current?.(data);
      return;
    }

    if (data.type !== 'progress') return;
    const last = lastProcessedRef.current;
    if (last.jobId === jobId && data.processed < last.processed) return;
    lastProcessedRef.current = { jobId, processed: data.processed };
    onProgressRef.current?.(data);
  }, [jobId]);

  useImportCable(jobId, { onProgress: handleUpdate, onComplete: handleUpdate, onFailed: handleUpdate });

  const { data: polled, isError } = useImportStatus(jobId);

  useEffect(() => {
    handleUpdate(polled);
  }, [polled, handleUpdate]);

  useEffect(() => {
    if (isError) {
      handleUpdate({ type: 'failed', errors: [{ row: null, message: STATUS_UNKNOWN_MESSAGE }] });
    }
  }, [isError, handleUpdate]);
}
