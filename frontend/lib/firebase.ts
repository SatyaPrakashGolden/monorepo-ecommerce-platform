

// lib/firebase.ts
'use client';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  getAnalytics(app);
}

/**
 * Request FCM token from Firebase
 * @returns FCM token or null if failed
 */
export const requestFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Messaging not initialized');
    return null;
  }

  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return null;
    }

    // Check notification support
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    });
    
    if (token) {
      console.log('✅ FCM Token obtained successfully');
      return token;
    } else {
      console.warn('⚠️ No FCM token available');
      return null;
    }
  } catch (err) {
    console.error('❌ FCM token error:', err);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @returns Promise that resolves when a message is received
 */
export const onMessageListener = (): Promise<any> =>
  new Promise((resolve, reject) => {
    if (!messaging) {
      reject(new Error('Messaging not initialized'));
      return;
    }
    
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      resolve(payload);
    });
  });

/**
 * Check if notifications are supported and permitted
 * @returns boolean indicating notification support status
 */
export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
};

/**
 * Get current notification permission status
 * @returns NotificationPermission status
 */
export const getNotificationPermission = (): NotificationPermission | null => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }
  return Notification.permission;
};