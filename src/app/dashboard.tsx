import { useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomNav,
  FilterBar,
  MapControls,
  NAV_HEIGHT,
  PhoneFrame,
  PREVIEW_HEIGHT,
  ReportPreview,
  SearchOverlay,
  TopOverlay,
  useTabNav,
} from '@/components/dashboard/DashboardParts';
import { RealMap, type RealMapHandle } from '@/components/dashboard/RealMap';
import { ToastHost } from '@/components/Toast';
import { comingSoon } from '@/constants/civic';
import type { Place } from '@/constants/cdo';
import type { Report } from '@/constants/reports';
import { showToast } from '@/constants/toast';
import { useAuthStore, userKey } from '@/stores/useAuthStore';
import { useMyUpvotes, useReportsStore } from '@/stores/useReportsStore';
import { useUIStore } from '@/stores/useUIStore';

/**
 * The map home screen. It holds no data of its own: reports and upvotes come from
 * useReportsStore, the filter / layer / selected pin / search from useUIStore, and who is
 * logged in from useAuthStore. Only the map's camera (a ref) lives here.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onTab = useTabNav('map');
  const mapRef = useRef<RealMapHandle>(null);

  // Stores
  const user = useAuthStore((s) => s.user);
  const reports = useReportsStore((s) => s.reports);
  const upvoted = useMyUpvotes();
  const toggleUpvote = useReportsStore((s) => s.toggleUpvote);

  const filter = useUIStore((s) => s.filter);
  const layer = useUIStore((s) => s.layer);
  const selectedId = useUIStore((s) => s.selectedId);
  const searchOpen = useUIStore((s) => s.searchOpen);
  const unread = useUIStore((s) => s.unread);
  const setFilter = useUIStore((s) => s.setFilter);
  const setLayer = useUIStore((s) => s.setLayer);
  const selectId = useUIStore((s) => s.selectReport);
  const openSearch = useUIStore((s) => s.openSearch);
  const closeSearch = useUIStore((s) => s.closeSearch);
  const clearUnread = useUIStore((s) => s.clearUnread);

  const visible = useMemo(
    () => reports.filter((r) => filter === 'all' || r.category === filter),
    [reports, filter],
  );
  const selected = useMemo(
    () => reports.find((r) => r.id === selectedId) ?? null,
    [reports, selectedId],
  );

  const selectReport = (report: Report) => {
    selectId(report.id);
    // Shift the map so the pin sits above the preview drawer.
    mapRef.current?.focusReport(report, 120);
  };

  const onUpvote = () => {
    if (!selected) return;
    if (!user) {
      showToast('Log in to upvote reports.');
      return;
    }
    const nowUpvoted = toggleUpvote(selected.id, userKey(user));
    showToast(nowUpvoted ? 'Upvoted. Thanks for helping prioritize this.' : 'Upvote removed.');
  };

  const goToPlace = (place: Place) => {
    closeSearch();
    selectId(null);
    mapRef.current?.flyTo(place.lat, place.lng);
  };

  const goToReport = (report: Report) => {
    closeSearch();
    if (filter !== 'all' && filter !== report.category) setFilter('all');
    selectReport(report);
  };

  const navSpace = NAV_HEIGHT + insets.bottom;
  const controlsBottom = navSpace + 16 + (selected ? PREVIEW_HEIGHT + 12 : 0);

  return (
    <PhoneFrame>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <RealMap
        ref={mapRef}
        bottomInset={NAV_HEIGHT + insets.bottom}
        reports={visible}
        selectedId={selectedId}
        layer={layer}
        onSelectReport={selectReport}
        onClearSelection={() => selectId(null)}
      />

      {/* Top overlay: avatar, search, notifications, and the filter pills below */}
      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <TopOverlay
          unread={unread}
          onAvatar={() => router.replace('/profile')}
          onSearch={openSearch}
          onBell={() => {
            clearUnread();
            comingSoon('Activity center');
          }}
        />
        <FilterBar value={filter} onChange={setFilter} />
      </View>

      <MapControls
        layer={layer}
        bottom={controlsBottom}
        onLayer={setLayer}
        onZoom={(factor) => mapRef.current?.zoomBy(factor)}
        onLocate={() => mapRef.current?.locate()}
      />

      {selected ? (
        <ReportPreview
          report={selected}
          bottom={navSpace + 12}
          upvoted={upvoted.includes(selected.id)}
          onClose={() => selectId(null)}
          onDetails={() => comingSoon('Report details')}
          onUpvote={onUpvote}
        />
      ) : null}

      <BottomNav active="map" bottomInset={insets.bottom} onPress={onTab} />

      <SearchOverlay
        visible={searchOpen}
        reports={reports}
        onClose={closeSearch}
        onSelectReport={goToReport}
        onSelectPlace={goToPlace}
      />

      <ToastHost bottom={navSpace + 16} />
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
});
