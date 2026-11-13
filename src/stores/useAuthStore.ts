import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * AUTH STORE: who is using the app.
 * - `user` is the signed-in resident (null when logged out).
 * - `isGuest` lets someone browse the map without an account.
 * - `remember` is the "Keep me logged in" checkbox: when it is false the user is not saved,
 *   so closing the app logs them out.
 *
 * SIMULATION: nothing here talks to a server. Swap the bodies of `login` and `signUp` for
 * real API calls later; the screens will not need to change.
 */
export type User = { name: string; identifier: string };

type AuthState = {
  user: User | null;
  isGuest: boolean;
  remember: boolean;
  login: (identifier: string, remember?: boolean) => void;
  loginAsDemoGoogleUser: () => void;
  signUp: (name: string, email: string) => void;
  continueAsGuest: () => void;
  logout: () => void;
};

/** A stable key for a user. Per-user data (like upvotes) is saved under this key. */
export const userKey = (user: User) => user.identifier.trim().toLowerCase();

/** "jordan.mitchell@example.com" -> "Jordan Mitchell". IDs without an email become "Resident". */
export function nameFromIdentifier(identifier: string) {
  const raw = identifier.trim();
  const base = raw.includes('@') ? raw.split('@')[0] : '';
  const words = base.split(/[._\-\s]+/).filter(Boolean);
  if (words.length === 0) return 'Resident';
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isGuest: false,
      remember: true,

      login: (identifier, remember = true) =>
        set({
          user: { name: nameFromIdentifier(identifier), identifier: identifier.trim() },
          isGuest: false,
          remember,
        }),

      loginAsDemoGoogleUser: () =>
        set({
          user: { name: 'Jordan Mitchell', identifier: 'jordan.mitchell@example.com' },
          isGuest: false,
          remember: true,
        }),

      signUp: (name, email) =>
        set({
          user: { name: name.trim(), identifier: email.trim() },
          isGuest: false,
          remember: true,
        }),

      continueAsGuest: () => set({ user: null, isGuest: true }),

      logout: () => set({ user: null, isGuest: false }),
    }),
    {
      name: 'civic-pulse-auth',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Only these fields are saved to the device.
      partialize: (state) => ({
        user: state.remember ? state.user : null,
        remember: state.remember,
      }),
    },
  ),
);
