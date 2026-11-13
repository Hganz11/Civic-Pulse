import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { MapLayer } from '@/constants/cdo';
import type { Report, Status } from '@/constants/reports';

/**
 * The map itself is a Leaflet page (see leafletHtml.ts). It runs inside a WebView on a phone and
 * inside an iframe in the browser. These types and one hook are the shared "language" both
 * versions speak, so RealMap.tsx and RealMap.web.tsx only have to move messages back and forth.
 */
export type MapReport = { id: string; lat: number; lng: number; status: Status; votes: number };

/** Messages the app sends to the map. */
export type MapCommand =
  | {
      c: 'state';
      reports: MapReport[];
      layer: MapLayer;
      selectedId: string | null;
      /** Space (px) kept free at the bottom so the attribution stays above the nav bar. */
      attrBottom: number;
    }
  | { c: 'focus'; lat: number; lng: number; offsetPx: number }
  | { c: 'fly'; lat: number; lng: number; zoom: number }
  | { c: 'locate' }
  | { c: 'zoom'; delta: number };

/** Messages the map sends back to the app. */
export type MapEvent =
  | { t: 'ready' }
  | { t: 'select'; id: string }
  | { t: 'clear' };

export type RealMapHandle = {
  focusReport: (report: Report, offsetPx?: number) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  locate: () => void;
  zoomBy: (factor: number) => void;
};

export type RealMapProps = {
  reports: Report[];
  selectedId: string | null;
  layer: MapLayer;
  /** Pixels at the bottom of the screen covered by the nav bar. */
  bottomInset?: number;
  onSelectReport: (report: Report) => void;
  onClearSelection: () => void;
};

export function useMapBridge(send: (cmd: MapCommand) => void, props: RealMapProps) {
  const { reports, selectedId, layer, bottomInset = 0 } = props;
  const [readyCount, setReadyCount] = useState(0);

  const sendRef = useRef(send);
  sendRef.current = send;
  const propsRef = useRef(props);
  propsRef.current = props;
  const readyRef = useRef(false);

  // Push the whole picture (pins, layer, selection) whenever any of it changes.
  useEffect(() => {
    if (readyCount === 0) return;
    sendRef.current({
      c: 'state',
      reports: reports.map((r) => ({
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        status: r.status,
        votes: r.votes,
      })),
      layer,
      selectedId,
      attrBottom: bottomInset + 6,
    });
  }, [readyCount, reports, layer, selectedId, bottomInset]);

  const onEvent = useCallback((e: MapEvent) => {
    if (e.t === 'ready') {
      readyRef.current = true;
      setReadyCount((n) => n + 1);
    } else if (e.t === 'select') {
      const report = propsRef.current.reports.find((r) => r.id === e.id);
      if (report) propsRef.current.onSelectReport(report);
    } else if (e.t === 'clear') {
      propsRef.current.onClearSelection();
    }
  }, []);

  const handle = useMemo<RealMapHandle>(() => {
    const go = (cmd: MapCommand) => {
      if (readyRef.current) sendRef.current(cmd);
    };
    return {
      focusReport: (report, offsetPx = 0) =>
        go({ c: 'focus', lat: report.lat, lng: report.lng, offsetPx }),
      flyTo: (lat, lng, zoom = 17) => go({ c: 'fly', lat, lng, zoom }),
      locate: () => go({ c: 'locate' }),
      zoomBy: (factor) => go({ c: 'zoom', delta: factor >= 1 ? 1 : -1 }),
    };
  }, []);

  return { onEvent, handle };
}
