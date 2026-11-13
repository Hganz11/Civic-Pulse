import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/useAuthStore';
import { useReportsStore } from '@/stores/useReportsStore';
import { useUIStore } from '@/stores/useUIStore';

/**
 * Saved data is read from the device asynchronously when the app starts. This hook turns true
 * once every persisted store has finished loading, so the app doesn't flash a logged-out
 * screen before the saved login arrives. The loading screen waits on it.
 */
const stores = [useAuthStore, useReportsStore, useUIStore];

const allHydrated = () => stores.every((store) => store.persist.hasHydrated());

export function useStoresHydrated() {
  const [ready, setReady] = useState(allHydrated);

  useEffect(() => {
    if (ready) return;
    const check = () => {
      if (allHydrated()) setReady(true);
    };
    const unsubscribers = stores.map((store) => store.persist.onFinishHydration(check));
    check();
    return () => unsubscribers.forEach((off) => off());
  }, [ready]);

  return ready;
}
