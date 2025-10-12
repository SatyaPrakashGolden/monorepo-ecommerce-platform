// app/layout.tsx or components/NotificationListener.tsx
'use client';

import { useEffect } from 'react';
import { onMessageListener } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';

export function NotificationListener() {
  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload: any) => {
        toast({
          title: payload.notification?.title || 'New Notification',
          description: payload.notification?.body || '',
        });
      })
      .catch((err) => console.error('Failed to listen for messages:', err));

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
}