export interface ServiceWorkerRegistrationResult {
  registration: ServiceWorkerRegistration | null;
  error?: Error;
}

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistrationResult> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { registration: null };
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) {
        return;
      }

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          const shouldReload = window.confirm(
            'A new version of LocaleLore is available. Reload to update now?'
          );

          if (shouldReload) {
            window.location.reload();
          }
        }
      });
    });

    return { registration };
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    console.error('Service worker registration failed:', normalizedError);
    return { registration: null, error: normalizedError };
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  return Notification.requestPermission();
};

export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    const applicationServerKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!applicationServerKey) {
      throw new Error('Missing VITE_VAPID_PUBLIC_KEY for push notifications');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(applicationServerKey) as BufferSource,
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};
