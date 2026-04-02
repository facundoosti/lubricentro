import { useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

const consumer = createConsumer(import.meta.env.VITE_CABLE_URL);

export function useInboxCable(onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const subscription = consumer.subscriptions.create('InboxChannel', {
      received(data) {
        onUpdateRef.current(data);
      },
    });

    return () => subscription.unsubscribe();
  }, []);
}
