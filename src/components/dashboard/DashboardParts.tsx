import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, type IconName } from '@/components/auth/ui';
import { colors, comingSoon, fonts } from '@/constants/civic';
import {
  CATEGORIES,
  categoryById,
  STATUS,
  type FilterId,
  type Report,
} from '@/constants/reports';
import { PLACES, type MapLayer, type Place } from '@/constants/cdo';

const lift: ViewStyle = Platform.select<ViewStyle>({
  android: { elevation: 6 },
  default: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
}) as ViewStyle;

/* -------------------------------------------------------------------------- */
/* Phone-shaped frame so the screens look like a phone when opened in a browser */
/* -------------------------------------------------------------------------- */

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.frameOuter}>
      <View style={s.frame}>{children}</View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Top bar: avatar, search, notifications                                      */
/* -------------------------------------------------------------------------- */

export function TopOverlay({
  unread,
  onAvatar,
  onSearch,
  onBell,
}: {
  unread: number;
  onAvatar: () => void;
  onSearch: () => void;
  onBell: () => void;
}) {
  return (
    <View style={s.topRow} pointerEvents="box-none">
      <Pressable
        onPress={onAvatar}
        accessibilityRole="button"
        accessibilityLabel="Open your profile"
        style={({ pressed }) => [s.circle, lift, pressed && s.pressed]}
      >
        <MaterialCommunityIcons name="account" size={24} color={colors.text} />
      </Pressable>

      <Pressable
        onPress={onSearch}
        accessibilityRole="search"
        accessibilityLabel="Search address"
        style={({ pressed }) => [s.search, lift, pressed && s.pressed]}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={colors.textMuted} />
        <Text style={s.searchText} numberOfLines={1}>
          Search address
        </Text>
      </Pressable>

      <Pressable
        onPress={onBell}
        accessibilityRole="button"
        accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        style={({ pressed }) => [s.circle, lift, pressed && s.pressed]}
      >
        <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
        {unread > 0 ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter pills                                                                */
/* -------------------------------------------------------------------------- */

const FILTERS: { id: FilterId; label: string; icon?: IconName }[] = [
  { id: 'all', label: 'All' },
  ...CATEGORIES,
];

export function FilterBar({
  value,
  onChange,
}: {
  value: FilterId;
  onChange: (id: FilterId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filters}
      keyboardShouldPersistTaps="handled"
    >
      {FILTERS.map((item) => {
        const active = item.id === value;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[s.pill, active ? s.pillActive : s.pillIdle, lift]}
          >
            {item.icon ? (
              <MaterialCommunityIcons
                name={item.icon}
                size={16}
                color={active ? colors.accentInk : colors.textMuted}
                style={s.pillIcon}
              />
            ) : null}
            <Text style={[s.pillText, { color: active ? colors.accentInk : colors.text }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/* Floating map controls: layers, zoom, GPS                                    */
/* -------------------------------------------------------------------------- */

const LAYERS: { id: MapLayer; label: string; icon: IconName }[] = [
  { id: 'dark', label: 'Dark map', icon: 'weather-night' },
  { id: 'streets', label: 'Streets', icon: 'map-outline' },
  { id: 'satellite', label: 'Satellite', icon: 'satellite-variant' },
  { id: 'heat', label: 'Report heatmap', icon: 'fire' },
];

export function MapControls({
  layer,
  bottom,
  onLayer,
  onZoom,
  onLocate,
}: {
  layer: MapLayer;
  bottom: number;
  onLayer: (layer: MapLayer) => void;
  onZoom: (factor: number) => void;
  onLocate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[s.controls, { bottom }]} pointerEvents="box-none">
      {open ? (
        <View style={[s.layerMenu, lift]}>
          {LAYERS.map((item) => {
            const active = item.id === layer;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  onLayer(item.id);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [s.layerRow, pressed && s.pressed]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={active ? colors.accent : colors.textMuted}
                />
                <Text style={[s.layerText, active && { color: colors.accent }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Map layers"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [s.controlButton, lift, pressed && s.pressed]}
      >
        <MaterialCommunityIcons name="layers-outline" size={24} color={colors.text} />
      </Pressable>

      <View style={[s.zoomGroup, lift]}>
        <Pressable
          onPress={() => onZoom(1.6)}
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          style={({ pressed }) => [s.zoomButton, pressed && s.pressed]}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.text} />
        </Pressable>
        <View style={s.zoomDivider} />
        <Pressable
          onPress={() => onZoom(1 / 1.6)}
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          style={({ pressed }) => [s.zoomButton, pressed && s.pressed]}
        >
          <MaterialCommunityIcons name="minus" size={22} color={colors.text} />
        </Pressable>
      </View>

      <Pressable
        onPress={onLocate}
        accessibilityRole="button"
        accessibilityLabel="Center map on my location"
        style={({ pressed }) => [s.controlButton, lift, pressed && s.pressed]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottom preview drawer                                                       */
/* -------------------------------------------------------------------------- */

export const PREVIEW_HEIGHT = 190;

export function ReportPreview({
  report,
  bottom,
  upvoted,
  onClose,
  onDetails,
  onUpvote,
}: {
  report: Report;
  bottom: number;
  upvoted: boolean;
  onClose: () => void;
  onDetails: () => void;
  onUpvote: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, friction: 9, tension: 70, useNativeDriver: false }).start();
  }, [report.id, anim]);

  const category = categoryById(report.category);
  const status = STATUS[report.status];

  return (
    <Animated.View
      style={[
        s.preview,
        lift,
        {
          bottom,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={onClose}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Close preview"
        style={s.previewClose}
      >
        <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
      </Pressable>

      <View style={s.previewHeader}>
        <View style={[s.previewIcon, { borderColor: status.color }]}>
          <MaterialCommunityIcons name={category.icon} size={24} color={status.color} />
        </View>
        <View style={s.previewText}>
          <Text style={s.previewTitle} numberOfLines={1}>
            {report.title}
          </Text>
          <Text style={s.previewAddress} numberOfLines={1}>
            {report.address}
          </Text>
        </View>
      </View>

      <View style={s.previewMeta}>
        <View style={[s.statusPill, { backgroundColor: `${status.color}2E` }]}>
          <View style={[s.statusDot, { backgroundColor: status.color }]} />
          <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={s.metaText}>{report.votes} upvotes</Text>
        <Text style={[s.metaText, s.metaRight]}>{report.reportedAgo}</Text>
      </View>

      <View style={s.previewActions}>
        <Button label="View details" onPress={onDetails} style={s.previewButton} />
        <Button
          label={upvoted ? 'Upvoted' : 'Upvote'}
          icon={upvoted ? 'arrow-up-bold' : 'arrow-up-bold-outline'}
          variant="secondary"
          onPress={onUpvote}
          style={s.previewButton}
        />
      </View>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottom navigation                                                           */
/* -------------------------------------------------------------------------- */

export const NAV_HEIGHT = 64;

export type Tab = 'map' | 'feed' | 'add' | 'impact' | 'profile';

/** Handles tab taps for any screen that shows the bottom navigation. */
export function useTabNav(active: Exclude<Tab, 'add'>) {
  const router = useRouter();
  return (tab: Tab) => {
    if (tab === active) return;
    if (tab === 'map') router.replace('/dashboard');
    else if (tab === 'profile') router.replace('/profile');
    else if (tab === 'feed') comingSoon('Citywide feed');
    else if (tab === 'impact') comingSoon('Impact dashboard');
    else comingSoon('Reporting a problem');
  };
}

export function BottomNav({
  active,
  bottomInset,
  onPress,
}: {
  active: Exclude<Tab, 'add'>;
  bottomInset: number;
  onPress: (tab: Tab) => void;
}) {
  const item = (id: Exclude<Tab, 'add'>, label: string, icon: IconName) => {
    const isActive = id === active;
    return (
      <Pressable
        key={id}
        onPress={() => onPress(id)}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: isActive }}
        style={s.tab}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={isActive ? colors.accent : colors.textMuted}
        />
        <Text style={[s.tabText, isActive && s.tabTextActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[s.nav, { height: NAV_HEIGHT + bottomInset, paddingBottom: bottomInset }]}>
      {item('map', 'Map', active === 'map' ? 'map' : 'map-outline')}
      {item('feed', 'Feed', 'newspaper-variant-outline')}
      <View style={s.fabSlot}>
        <Pressable
          onPress={() => onPress('add')}
          accessibilityRole="button"
          accessibilityLabel="Report a problem"
          style={({ pressed }) => [s.fab, lift, pressed && s.fabPressed]}
        >
          <MaterialCommunityIcons name="plus" size={32} color={colors.accentInk} />
        </Pressable>
      </View>
      {item('impact', 'Impact', 'chart-box-outline')}
      {item('profile', 'Profile', active === 'profile' ? 'account' : 'account-outline')}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Full-screen search overlay (sits inside the phone frame, not a system modal) */
/* -------------------------------------------------------------------------- */

export function SearchOverlay({
  visible,
  reports,
  onClose,
  onSelectReport,
  onSelectPlace,
}: {
  visible: boolean;
  reports: Report[];
  onClose: () => void;
  onSelectReport: (report: Report) => void;
  onSelectPlace: (place: Place) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const q = query.trim().toLowerCase();

  // SIMULATED auto-complete: matches the fake places and the reports on the map.
  const placeMatches = useMemo(
    () => (q ? PLACES.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5) : PLACES.slice(0, 5)),
    [q],
  );
  const reportMatches = useMemo(
    () =>
      q
        ? reports
            .filter((r) => r.title.toLowerCase().includes(q) || r.address.toLowerCase().includes(q))
            .slice(0, 6)
        : [],
    [q, reports],
  );

  if (!visible) return null;

  return (
    <View style={[s.searchScreen, { paddingTop: insets.top + 8 }]}>
      <View style={s.searchHeader}>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close search"
          style={({ pressed }) => [s.searchBack, pressed && s.pressed]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={s.searchField}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search address"
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.accent}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search address"
            onSubmitEditing={() => {
              if (placeMatches[0]) onSelectPlace(placeMatches[0]);
              else if (reportMatches[0]) onSelectReport(reportMatches[0]);
            }}
          />
          {query ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.searchResults, { paddingBottom: insets.bottom + 24 }]}
      >
        {placeMatches.length > 0 ? (
          <Text style={s.sectionLabel}>{q ? 'Places' : 'Popular places'}</Text>
        ) : null}
        {placeMatches.map((place) => (
          <Pressable
            key={place.id}
            onPress={() => onSelectPlace(place)}
            accessibilityRole="button"
            style={({ pressed }) => [s.resultRow, pressed && s.pressed]}
          >
            <View style={s.resultIcon}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.accent} />
            </View>
            <Text style={s.resultTitle} numberOfLines={1}>
              {place.name}
            </Text>
          </Pressable>
        ))}

        {reportMatches.length > 0 ? <Text style={s.sectionLabel}>Reports</Text> : null}
        {reportMatches.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => onSelectReport(r)}
            accessibilityRole="button"
            style={({ pressed }) => [s.resultRow, pressed && s.pressed]}
          >
            <View style={s.resultIcon}>
              <MaterialCommunityIcons
                name={categoryById(r.category).icon}
                size={20}
                color={STATUS[r.status].color}
              />
            </View>
            <View style={s.resultText}>
              <Text style={s.resultTitle} numberOfLines={1}>
                {r.title}
              </Text>
              <Text style={s.resultSub} numberOfLines={1}>
                {r.address}
              </Text>
            </View>
          </Pressable>
        ))}

        {q && placeMatches.length === 0 && reportMatches.length === 0 ? (
          <Text style={s.searchHint}>Nothing matches “{query.trim()}”. Try “Market” or “Oak”.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */

const s = StyleSheet.create({
  pressed: { opacity: 0.75 },

  // Phone frame
  frameOuter: { flex: 1, backgroundColor: '#060D11', alignItems: 'center' },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },

  // Top row
  topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchText: { flex: 1, color: colors.textMuted, fontSize: 15 },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#E5383B',
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  // Filters
  filters: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  pillIdle: { backgroundColor: colors.surface, borderColor: colors.border },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillIcon: { marginRight: 6 },
  pillText: { fontSize: 14, fontWeight: '600' },

  // Controls
  controls: { position: 'absolute', right: 16, alignItems: 'flex-end', gap: 12 },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomGroup: {
    width: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  zoomButton: { height: 46, alignItems: 'center', justifyContent: 'center' },
  zoomDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 10 },
  layerMenu: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    minWidth: 168,
  },
  layerRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  layerText: { color: colors.text, fontSize: 15, fontWeight: '600' },

  // Preview
  preview: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: PREVIEW_HEIGHT,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
  },
  previewClose: { position: 'absolute', top: 14, right: 14, zIndex: 2 },
  previewHeader: { flexDirection: 'row', alignItems: 'center' },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewText: { flex: 1, paddingRight: 28 },
  previewTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 19,
    fontWeight: '700',
  },
  previewAddress: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  previewMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 13, fontWeight: '700' },
  metaText: { color: colors.textMuted, fontSize: 13 },
  metaRight: { marginLeft: 'auto' },
  previewActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  previewButton: { flex: 1, minHeight: 46 },

  // Bottom nav
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, height: NAV_HEIGHT, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  tabTextActive: { color: colors.accent, fontWeight: '700' },
  fabSlot: { flex: 1, height: NAV_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -18 }],
  },
  fabPressed: { opacity: 0.9 },

  // Search overlay
  searchScreen: { ...StyleSheet.absoluteFillObject, zIndex: 50, backgroundColor: colors.bg },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  searchBack: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchField: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 0 },
  searchResults: { paddingHorizontal: 16 },
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  resultRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultText: { flex: 1 },
  resultTitle: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '600' },
  resultSub: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  searchHint: { color: colors.textMuted, fontSize: 15, lineHeight: 22, paddingVertical: 20 },
});
