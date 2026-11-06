import { useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

const consumer = createConsumer(import.meta.env.VITE_CABLE_URL);

export function useImportCable(jobId, { onProgress, onComplete, onFailed } = {}) {
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const onFailedRef = useRef(onFailed);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;
  onFailedRef.current = onFailed;

  useEffect(() => {
    if (!jobId) return;

    let subscription;
    try {
      subscription = consumer.subscriptions.create(
        { channel: 'ImportChannel', job_id: jobId },
        {
          received(data) {
            if (data.type === 'progress') {
              onProgressRef.current?.(data);
            } else if (data.type === 'complete') {
              onCompleteRef.current?.(data);
            } else if (data.type === 'failed') {
              onFailedRef.current?.(data);
            }
          },
        }
      );
    } catch (error) {
      // Sin WebSocket (bloqueado, ws:// en https, etc.) seguimos con la consulta periódica
      console.warn('[useImportCable] no se pudo suscribir al canal de importación', error);
      return undefined;
    }

    return () => subscription?.unsubscribe();
  }, [jobId]);
}
