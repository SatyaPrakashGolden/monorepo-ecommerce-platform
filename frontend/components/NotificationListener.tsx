// components/NotificationListener.tsx
'use client';

import { useEffect } from 'react';
import { onMessageListener } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function NotificationListener() {
  const router = useRouter();

  useEffect(() => {
    // Request notification permission on component mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // Listen for foreground messages
    const setupListener = async () => {
      try {
        const payload: any = await onMessageListener();
        
        console.log('Foreground notification received:', payload);

        // Show toast notification
        toast({
          title: payload.notification?.title || 'New Notification',
          description: payload.notification?.body || '',
          duration: 5000,
        });

        // Handle notification data (e.g., navigate to specific page)
        if (payload.data) {
          // Example: Handle order updates
          if (payload.data.orderId) {
            console.log('Order update received:', payload.data);
            // Optionally navigate or update UI
            // router.push(`/orders/${payload.data.orderId}`);
          }
        }
      } catch (err) {
        console.error('Error setting up notification listener:', err);
      }
    };

    setupListener();
  }, [router]);

  return null; // This component doesn't render anything
}