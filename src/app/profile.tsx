import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, type IconName } from '@/components/auth/ui';
import {
  BottomNav,
  NAV_HEIGHT,
  PhoneFrame,
  useTabNav,
} from '@/components/dashboard/DashboardParts';
import { ToastHost } from '@/components/Toast';
import { colors, comingSoon, fonts, radius } from '@/constants/civic';
import { categoryById, STATUS } from '@/constants/reports';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMyUpvotes, useReportsStore } from '@/stores/useReportsStore';

// SIMULATED numbers: replace with the signed-in user's real stats from your backend.
// The score goes up by 5 for every report you upvote on the map (shared state in action).
const BASE_SCORE = 742;
const POINTS_PER_UPVOTE = 5;
const NEXT_LEVEL_AT = 1000;
const LEVEL_NAME = 'Neighborhood Champion';
const NEXT_LEVEL_NAME = 'Civic Leader';
const MUNICIPALITY = 'Metropolis Metro District (Zone 4)';
const BADGES: { icon: IconName; label: string }[] = [
  { icon: 'flag-outline', label: 'First report' },
  { icon: 'vote-outline', label: 'Active voter' },
  { icon: 'binoculars', label: 'Street scout' },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'G';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onTab = useTabNav('profile');
  const [pushOn, setPushOn] = useState(true);

  // Shared state from the stores
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const reports = useReportsStore((s) => s.reports);
  const upvoted = useMyUpvotes();

  const name = user?.name ?? 'Guest resident';
  const civicScore = BASE_SCORE + upvoted.length * POINTS_PER_UPVOTE;
  const progress = Math.min(1, civicScore / NEXT_LEVEL_AT);
  const navSpace = NAV_HEIGHT + insets.bottom;
  const myReports = reports.slice(0, 3);
  const stats = [
    { label: 'Reports', value: '12' },
    { label: 'You upvoted', value: String(upvoted.length) },
    { label: 'Resolved', value: '7' },
  ];

  // The route guard in app/_layout.tsx sends you back to onboarding once you are logged out.
  const logOut = () => logout();

  const row = (icon: IconName, label: string, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [s.row, pressed && s.pressed]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={colors.textMuted} />
      <Text style={s.rowLabel}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textFaint} />
    </Pressable>
  );

  return (
    <PhoneFrame>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 20, paddingBottom: navSpace + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.screenTitle} accessibilityRole="header">
          Your profile
        </Text>

        {/* Identity */}
        <View style={s.identity}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initialsOf(name)}</Text>
          </View>
          <View style={s.identityText}>
            <Text style={s.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={s.municipality} numberOfLines={1}>
              {MUNICIPALITY}
            </Text>
          </View>
          <View style={s.tierBadge}>
            <Text style={s.tierText}>Tier 1</Text>
          </View>
        </View>

        {/* Civic score */}
        <View style={s.scoreCard}>
          <View style={s.scoreTop}>
            <View>
              <Text style={s.scoreLabel}>Civic score</Text>
              <Text style={s.scoreValue}>{civicScore}</Text>
            </View>
            <View style={s.levelPill}>
              <MaterialCommunityIcons name="shield-star-outline" size={16} color={colors.accent} />
              <Text style={s.levelText}>{LEVEL_NAME}</Text>
            </View>
          </View>
          <View
            style={s.track}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Score ${civicScore} of ${NEXT_LEVEL_AT}`}
          >
            <View style={[s.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={s.scoreHint}>
            {Math.max(0, NEXT_LEVEL_AT - civicScore)} points to {NEXT_LEVEL_NAME}
          </Text>
        </View>

        {/* Stats */}
        <View style={s.stats}>
          {stats.map((stat) => (
            <View key={stat.label} style={s.stat}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        <Text style={s.sectionTitle}>Badges</Text>
        <View style={s.badges}>
          {BADGES.map((b) => (
            <View key={b.label} style={s.badge}>
              <MaterialCommunityIcons name={b.icon} size={16} color={colors.accent} />
              <Text style={s.badgeText}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent reports */}
        <Text style={s.sectionTitle}>Your recent reports</Text>
        <View style={s.group}>
          {myReports.map((r, i) => {
            const status = STATUS[r.status];
            return (
              <Pressable
                key={r.id}
                onPress={() => router.replace('/dashboard')}
                accessibilityRole="button"
                accessibilityLabel={`${r.title}, ${status.label}. Open on the map.`}
                style={({ pressed }) => [s.report, i > 0 && s.rowBorder, pressed && s.pressed]}
              >
                <View style={[s.reportIcon, { borderColor: status.color }]}>
                  <MaterialCommunityIcons
                    name={categoryById(r.category).icon}
                    size={20}
                    color={status.color}
                  />
                </View>
                <View style={s.reportText}>
                  <Text style={s.reportTitle} numberOfLines={1}>
                    {r.title}
                  </Text>
                  <Text style={s.reportSub} numberOfLines={1}>
                    {r.address} · {r.reportedAgo}
                  </Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: `${status.color}2E` }]}>
                  <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Settings */}
        <Text style={s.sectionTitle}>Settings</Text>
        <View style={s.group}>
          <View style={s.row}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textMuted} />
            <Text style={s.rowLabel}>Push notifications</Text>
            <Switch
              value={pushOn}
              onValueChange={setPushOn}
              trackColor={{ false: colors.border, true: colors.accentDim }}
              thumbColor={pushOn ? colors.accent : colors.textMuted}
              accessibilityLabel="Push notifications"
            />
          </View>
          <View style={s.rowBorder}>{row('account-edit-outline', 'Edit profile', () => comingSoon('Edit profile'))}</View>
          <View style={s.rowBorder}>{row('shield-lock-outline', 'Privacy and data', () => comingSoon('Privacy settings'))}</View>
          <View style={s.rowBorder}>{row('help-circle-outline', 'Help and support', () => comingSoon('Help'))}</View>
        </View>

        <View style={s.logout}>
          {user ? (
            <Button label="Log out" variant="secondary" icon="logout" onPress={logOut} />
          ) : (
            <Button label="Log in" icon="login" onPress={() => router.replace('/login')} />
          )}
        </View>
      </ScrollView>

      <BottomNav active="profile" bottomInset={insets.bottom} onPress={onTab} />
      <ToastHost bottom={navSpace + 16} />
    </PhoneFrame>
  );
}

const s = StyleSheet.create({
  pressed: { opacity: 0.75 },
  scroll: { paddingHorizontal: 20 },
  screenTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 20,
  },

  identity: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: colors.accentInk, fontSize: 22, fontWeight: '800' },
  identityText: { flex: 1 },
  name: { color: colors.text, fontSize: 20, fontWeight: '700' },
  municipality: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  tierBadge: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  tierText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },

  scoreCard: {
    marginTop: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
  },
  scoreTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  scoreLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  scoreValue: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 52,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  levelText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
    marginTop: 12,
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  scoreHint: { color: colors.textMuted, fontSize: 13, marginTop: 10 },

  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.tile,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 13, marginTop: 2 },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  badgeText: { color: colors.text, fontSize: 13, fontWeight: '600' },

  group: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: 'hidden',
  },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 14,
  },
  rowLabel: { flex: 1, color: colors.text, fontSize: 16 },

  report: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportText: { flex: 1, paddingRight: 8 },
  reportTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  reportSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  statusPill: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },

  logout: { marginTop: 24 },
});
