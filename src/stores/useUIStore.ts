import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FilterId } from '@/constants/reports';
import type { MapLayer } from '@/constants/cdo';

/**
 * UI STORE: what the map screen is currently showing.
 * Keeping this outside the screen means the filter, selected pin and map layer are still
 * there when you switch to the Profile tab and back.
 */
type UIState = {
  filter: FilterId;
  layer: MapLayer;
  selectedId: string | null;
  searchOpen: boolean;
  /** Unread notification count shown on the bell. SIMULATION: starts at 3. */
  unread: number;

  setFilter: (filter: FilterId) => void;
  setLayer: (layer: MapLayer) => void;
  selectReport: (id: string | null) => void;
  openSearch: () => void;
  closeSearch: () => void;
  clearUnread: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      filter: 'all',
      layer: 'dark',
      selectedId: null,
      searchOpen: false,
      unread: 3,

      // Changing the filter also closes the preview, since that pin may now be hidden.
      setFilter: (filter) => set({ filter, selectedId: null }),
      setLayer: (layer) => set({ layer }),
      selectReport: (selectedId) => set({ selectedId }),
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),
      clearUnread: () => set({ unread: 0 }),
    }),
    {
      name: 'civic-pulse-ui',
      version: 2,
      // v2: the 'traffic' layer became 'heat'; older saved layers are reset to the default.
      migrate: () => ({ layer: 'dark' }),
      storage: createJSONStorage(() => AsyncStorage),
      // Only the chosen map layer is remembered between launches.
      partialize: (state) => ({ layer: state.layer }),
    },
  ),
);
