import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/civic';
import { categoryById, PLACES, STATUS, USER_POS, type Report } from '@/constants/reports';
import {
  BLOCKS,
  PALETTES,
  RIVER,
  ROAD_SEGMENTS,
  TRAFFIC_COLORS,
  WORLD,
  type MapLayer,
} from '@/constants/simMap';

/**
 * A simulated, drag-to-pan city map built from plain Views.
 * It works in the browser and on phones, with no native map package or location permission.
 * Zoom and position are kept in world units (0 to 1000); see constants/simMap.ts.
 */

type Viewport = { cx: number; cy: number; scale: number };
type Cluster = { id: string; x: number; y: number; items: Report[] };

export type SimMapHandle = {
  focusReport: (report: Report, offsetPx?: number) => void;
  flyTo: (x: number, y: number, zoom?: number) => void;
  locate: () => void;
  zoomBy: (factor: number) => void;
};

const MAX_ZOOM = 6; // times the minimum scale
const START_ZOOM = 1.7;
const FOCUS_ZOOM = 3.6; // zoomed in far enough that pins stop clustering
const NO_CLUSTER_ZOOM = 3.4;
const CLUSTER_PX = 90;

type Props = {
  reports: Report[];
  selectedId: string | null;
  layer: MapLayer;
  onSelectReport: (report: Report) => void;
  onClearSelection: () => void;
};

export const SimMap = forwardRef<SimMapHandle, Props>(function SimMap(
  { reports, selectedId, layer, onSelectReport, onClearSelection },
  ref,
) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<Viewport>({ cx: USER_POS.x, cy: USER_POS.y, scale: 1 });

  const sizeRef = useRef(size);
  sizeRef.current = size;
  const viewRef = useRef(view);
  viewRef.current = view;
  const startRef = useRef(view);
  const rafRef = useRef<number | null>(null);
  const readyRef = useRef(false);
  const clearRef = useRef(onClearSelection);
  clearRef.current = onClearSelection;

  const minScaleNow = () => {
    const { w, h } = sizeRef.current;
    return w && h ? Math.max(w, h) / WORLD : 0.6;
  };

  /** Keeps the view inside the world and inside the allowed zoom range. */
  const clamp = useCallback((v: Viewport): Viewport => {
    const { w, h } = sizeRef.current;
    const min = w && h ? Math.max(w, h) / WORLD : 0.6;
    const scale = Math.min(min * MAX_ZOOM, Math.max(min, v.scale));
    const hw = w / 2 / scale;
    const hh = h / 2 / scale;
    const cx = hw >= WORLD / 2 ? WORLD / 2 : Math.min(WORLD - hw, Math.max(hw, v.cx));
    const cy = hh >= WORLD / 2 ? WORLD / 2 : Math.min(WORLD - hh, Math.max(hh, v.cy));
    return { cx, cy, scale };
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (target: Viewport, ms = 420) => {
      stop();
      const from = viewRef.current;
      const t0 = Date.now();
      const tick = () => {
        const t = Math.min(1, (Date.now() - t0) / ms);
        const e = 1 - Math.pow(1 - t, 3);
        setView(
          clamp({
            cx: from.cx + (target.cx - from.cx) * e,
            cy: from.cy + (target.cy - from.cy) * e,
            scale: from.scale + (target.scale - from.scale) * e,
          }),
        );
        rafRef.current = t < 1 ? requestAnimationFrame(tick) : null;
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [clamp, stop],
  );

  useEffect(() => stop, [stop]);

  useImperativeHandle(
    ref,
    () => ({
      focusReport: (report, offsetPx = 0) => {
        const scale = Math.max(viewRef.current.scale, minScaleNow() * FOCUS_ZOOM);
        animateTo({ cx: report.x, cy: report.y + offsetPx / scale, scale }, 380);
      },
      flyTo: (x, y, zoom = FOCUS_ZOOM) => {
        animateTo({ cx: x, cy: y, scale: minScaleNow() * zoom });
      },
      locate: () => {
        const scale = Math.max(viewRef.current.scale, minScaleNow() * 3);
        animateTo({ cx: USER_POS.x, cy: USER_POS.y, scale });
      },
      zoomBy: (factor) => {
        const v = viewRef.current;
        animateTo({ ...v, scale: v.scale * factor }, 220);
      },
    }),
    [animateTo],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    sizeRef.current = { w: width, h: height };
    setSize({ w: width, h: height });
    if (!readyRef.current) {
      readyRef.current = true;
      const min = Math.max(width, height) / WORLD;
      setView(clamp({ cx: USER_POS.x, cy: USER_POS.y, scale: min * START_ZOOM }));
    } else {
      setView((v) => clamp(v));
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        stop();
        startRef.current = viewRef.current;
      },
      onPanResponderMove: (_, g) => {
        const s = startRef.current;
        setView(clamp({ cx: s.cx - g.dx / s.scale, cy: s.cy - g.dy / s.scale, scale: s.scale }));
      },
      onPanResponderRelease: (_, g) => {
        // A tap on empty map (not a drag) closes the preview drawer.
        if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) clearRef.current();
      },
    }),
  ).current;

  const { w, h } = size;
  const { cx, cy, scale } = view;
  const min = w && h ? Math.max(w, h) / WORLD : 0.6;
  const palette = PALETTES[layer === 'satellite' ? 'satellite' : 'dark'];
  const X = (x: number) => w / 2 + (x - cx) * scale;
  const Y = (y: number) => h / 2 + (y - cy) * scale;

  // Group nearby reports into numbered circles. The more zoomed out, the bigger the groups.
  const { singles, clusters } = useMemo(() => {
    const selected = reports.filter((r) => r.id === selectedId);
    if (scale >= min * NO_CLUSTER_ZOOM) return { singles: reports, clusters: [] as Cluster[] };

    const cell = CLUSTER_PX / scale;
    const buckets = new Map<string, Report[]>();
    for (const r of reports) {
      if (r.id === selectedId) continue;
      const key = `${Math.floor(r.x / cell)}:${Math.floor(r.y / cell)}`;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(r);
      else buckets.set(key, [r]);
    }

    const singles: Report[] = [...selected];
    const clusters: Cluster[] = [];
    buckets.forEach((items, key) => {
      if (items.length === 1) {
        singles.push(items[0]);
        return;
      }
      clusters.push({
        id: key,
        x: items.reduce((sum, r) => sum + r.x, 0) / items.length,
        y: items.reduce((sum, r) => sum + r.y, 0) / items.length,
        items,
      });
    });
    return { singles, clusters };
  }, [reports, selectedId, scale, min]);

  const zoomIntoCluster = (cluster: Cluster) => {
    const v = viewRef.current;
    animateTo({ cx: cluster.x, cy: cluster.y, scale: Math.min(v.scale * 2.4, min * MAX_ZOOM) });
  };

  const offscreen = (px: number, py: number) => px < -50 || px > w + 50 || py < -50 || py > h + 50;

  return (
    <View style={s.map} onLayout={onLayout} {...pan.panHandlers}>
      {w > 0 ? (
        <>
          {/* Drawn city: blocks, river, roads, lane lines */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]} pointerEvents="none">
            {BLOCKS.map((b) => (
              <View
                key={b.id}
                style={{
                  position: 'absolute',
                  left: X(b.x),
                  top: Y(b.y),
                  width: b.w * scale,
                  height: b.h * scale,
                  borderRadius: 6 * scale,
                  backgroundColor: b.park ? palette.park : b.alt ? palette.blockAlt : palette.block,
                }}
              />
            ))}

            <View
              style={{
                position: 'absolute',
                left: X(RIVER.x),
                top: Y(RIVER.y),
                width: RIVER.w * scale,
                height: RIVER.h * scale,
                backgroundColor: palette.water,
              }}
            />

            {ROAD_SEGMENTS.map((seg) => {
              const color =
                layer === 'traffic'
                  ? TRAFFIC_COLORS[seg.level]
                  : seg.main
                    ? palette.roadMain
                    : palette.road;
              const thickness = seg.width * scale;
              return (
                <View
                  key={seg.id}
                  style={
                    seg.horizontal
                      ? {
                          position: 'absolute',
                          left: X(seg.from),
                          top: Y(seg.at) - thickness / 2,
                          width: (seg.to - seg.from) * scale,
                          height: thickness,
                          backgroundColor: color,
                        }
                      : {
                          position: 'absolute',
                          left: X(seg.at) - thickness / 2,
                          top: Y(seg.from),
                          width: thickness,
                          height: (seg.to - seg.from) * scale,
                          backgroundColor: color,
                        }
                  }
                />
              );
            })}

            {layer !== 'traffic'
              ? ROAD_SEGMENTS.filter((seg) => seg.main).map((seg) => (
                  <View
                    key={`line-${seg.id}`}
                    style={
                      seg.horizontal
                        ? {
                            position: 'absolute',
                            left: X(seg.from) + 6,
                            top: Y(seg.at) - 0.75,
                            width: (seg.to - seg.from) * scale - 12,
                            height: 0,
                            borderTopWidth: 1.5,
                            borderStyle: 'dashed',
                            borderColor: palette.line,
                          }
                        : {
                            position: 'absolute',
                            left: X(seg.at) - 0.75,
                            top: Y(seg.from) + 6,
                            width: 0,
                            height: (seg.to - seg.from) * scale - 12,
                            borderLeftWidth: 1.5,
                            borderStyle: 'dashed',
                            borderColor: palette.line,
                          }
                    }
                  />
                ))
              : null}

            {scale >= min * 1.6
              ? PLACES.map((place) => (
                  <Text
                    key={place.id}
                    style={[
                      s.placeLabel,
                      { left: X(place.x) - 60, top: Y(place.y) - 8, color: palette.label },
                    ]}
                    numberOfLines={1}
                  >
                    {place.name}
                  </Text>
                ))
              : null}
          </View>

          {/* "You are here" dot */}
          <View
            pointerEvents="none"
            style={[s.hit, { left: X(USER_POS.x) - 30, top: Y(USER_POS.y) - 30 }]}
          >
            <View style={s.userHalo}>
              <View style={s.userDot} />
            </View>
          </View>

          {clusters.map((cluster) => {
            const px = X(cluster.x);
            const py = Y(cluster.y);
            if (offscreen(px, py)) return null;
            return (
              <Pressable
                key={`c-${cluster.id}`}
                onPress={() => zoomIntoCluster(cluster)}
                accessibilityRole="button"
                accessibilityLabel={`${cluster.items.length} reports. Tap to zoom in.`}
                style={[s.hit, { left: px - 30, top: py - 30, zIndex: 3 }]}
              >
                <View style={s.clusterOuter}>
                  <View style={s.clusterInner}>
                    <Text style={s.clusterText}>{cluster.items.length}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {singles.map((r) => {
            const px = X(r.x);
            const py = Y(r.y);
            if (offscreen(px, py)) return null;
            const isSelected = r.id === selectedId;
            const pinSize = isSelected ? 42 : 32;
            return (
              <Pressable
                key={r.id}
                onPress={() => onSelectReport(r)}
                accessibilityRole="button"
                accessibilityLabel={`${r.title}, ${STATUS[r.status].label}`}
                style={[s.hit, { left: px - 30, top: py - 30, zIndex: isSelected ? 10 : 2 }]}
              >
                <View
                  style={{
                    width: pinSize,
                    height: pinSize,
                    borderRadius: pinSize / 2,
                    backgroundColor: STATUS[r.status].color,
                    borderColor: isSelected ? colors.text : colors.bg,
                    borderWidth: isSelected ? 4 : 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name={categoryById(r.category).icon}
                    size={isSelected ? 20 : 16}
                    color={colors.bg}
                  />
                </View>
              </Pressable>
            );
          })}
        </>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', backgroundColor: colors.bg },
  // 60x60 touch area centered on the point.
  hit: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeLabel: {
    position: 'absolute',
    width: 120,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  userHalo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(90, 169, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#5AA9FF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  clusterOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(246, 201, 69, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterText: { color: colors.accentInk, fontSize: 15, fontWeight: '800' },
});
