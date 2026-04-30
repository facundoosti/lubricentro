import { useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

const consumer = createConsumer(import.meta.env.VITE_CABLE_URL);

export function useImportCable(jobId, { onProgress, onComplete } = {}) {
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!jobId) return;

    const subscription = consumer.subscriptions.create(
      { channel: 'ImportChannel', job_id: jobId },
      {
        received(data) {
          if (data.type === 'progress') {
            onProgressRef.current?.(data);
          } else if (data.type === 'complete') {
            onCompleteRef.current?.(data);
          }
        },
      }
    );

    return () => subscription.unsubscribe();
  }, [jobId]);
}
