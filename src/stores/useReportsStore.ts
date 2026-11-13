import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SAMPLE_REPORTS, type Report } from '@/constants/reports';
import { useAuthStore, userKey } from '@/stores/useAuthStore';

/**
 * REPORTS STORE: the problems shown on the map, and who upvoted what.
 * - `reports` are shared by everyone (a report's vote count is the total across all users).
 * - `upvotedBy` is kept PER USER: it maps a user's key to the report IDs that user upvoted,
 *   so logging into a different account shows that account's own upvotes.
 *
 * SIMULATION: `reports` starts from sample data. Replace it with a fetch from your backend
 * (for example a `loadReports` action that calls `set({ reports })`).
 */
type ReportsState = {
  reports: Report[];
  /** userKey -> IDs of the reports that user upvoted. */
  upvotedBy: Record<string, string[]>;
  /** Adds or removes this user's upvote. Returns true when the report is now upvoted. */
  toggleUpvote: (reportId: string, key: string) => boolean;
  /** Puts the sample data back (handy while testing). */
  resetDemoData: () => void;
};

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: SAMPLE_REPORTS,
      upvotedBy: {},

      toggleUpvote: (reportId, key) => {
        const mine = get().upvotedBy[key] ?? [];
        const already = mine.includes(reportId);
        set((state) => ({
          upvotedBy: {
            ...state.upvotedBy,
            [key]: already ? mine.filter((x) => x !== reportId) : [...mine, reportId],
          },
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, votes: r.votes + (already ? -1 : 1) } : r,
          ),
        }));
        return !already;
      },

      resetDemoData: () => set({ reports: SAMPLE_REPORTS, upvotedBy: {} }),
    }),
    {
      name: 'civic-pulse-reports',
      // Raise this number whenever the shape of the saved data changes.
      // v2: upvotes became per-user (`upvotedBy`). Older saved data is replaced with fresh data.
      version: 3,
      migrate: () => ({ reports: SAMPLE_REPORTS, upvotedBy: {} }),
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ reports: state.reports, upvotedBy: state.upvotedBy }),
    },
  ),
);

const NONE: string[] = [];

/** The report IDs the CURRENT user has upvoted (empty for guests). */
export function useMyUpvotes(): string[] {
  const user = useAuthStore((s) => s.user);
  const key = user ? userKey(user) : null;
  return useReportsStore((s) => (key ? s.upvotedBy[key] : undefined) ?? NONE);
}
