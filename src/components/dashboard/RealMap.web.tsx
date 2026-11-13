import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/civic';

import { buildLeafletHtml } from './leafletHtml';
import {
  useMapBridge,
  type MapCommand,
  type MapEvent,
  type RealMapHandle,
  type RealMapProps,
} from './mapBridge';

export type { RealMapHandle } from './mapBridge';

/** Browser version: the same Leaflet page, inside an iframe. */
export const RealMap = React.forwardRef<RealMapHandle, RealMapProps>(function RealMap(props, ref) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const html = useMemo(() => buildLeafletHtml(), []);

  const send = useCallback((cmd: MapCommand) => {
    frameRef.current?.contentWindow?.postMessage({ civicCmd: cmd }, '*');
  }, []);

  const { onEvent, handle } = useMapBridge(send, props);
  React.useImperativeHandle(ref, () => handle, [handle]);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      const data = e.data as { civicEvt?: MapEvent } | null;
      if (data && data.civicEvt) onEvent(data.civicEvt);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onEvent]);

  return (
    <View style={s.fill}>
      {React.createElement('iframe', {
        ref: frameRef,
        srcDoc: html,
        title: 'Cagayan de Oro map',
        style: { border: 0, width: '100%', height: '100%', background: colors.bg },
      })}
    </View>
  );
});

const s = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg },
});
