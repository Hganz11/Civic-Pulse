import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SAMPLE_REPORTS, type Report } from '@/constants/reports';

/**
 * REPORTS STORE: the problems shown on the map, and which ones the user upvoted.
 * The map, the search, the preview drawer and the profile all read from here, so an
 * upvote made on the map shows up everywhere at once.
 *
 * SIMULATION: `reports` starts from sample data. Replace it with a fetch from your backend
 * (for example a `loadReports` action that calls `set({ reports })`).
 */
type ReportsState = {
  reports: Report[];
  /** IDs of reports the user has upvoted. */
  upvoted: string[];
  /** Adds or removes the user's upvote. Returns true when the report is now upvoted. */
  toggleUpvote: (id: string) => boolean;
  /** Puts the sample data back (handy while testing). */
  resetDemoData: () => void;
};

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: SAMPLE_REPORTS,
      upvoted: [],

      toggleUpvote: (id) => {
        const already = get().upvoted.includes(id);
        set((state) => ({
          upvoted: already ? state.upvoted.filter((x) => x !== id) : [...state.upvoted, id],
          reports: state.reports.map((r) =>
            r.id === id ? { ...r, votes: r.votes + (already ? -1 : 1) } : r,
          ),
        }));
        return !already;
      },

      resetDemoData: () => set({ reports: SAMPLE_REPORTS, upvoted: [] }),
    }),
    {
      name: 'civic-pulse-reports',
      // Raise this number whenever the shape of the saved data changes.
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ reports: state.reports, upvoted: state.upvoted }),
    },
  ),
);
