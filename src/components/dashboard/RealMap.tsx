import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

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

/**
 * Phone version: a real Cagayan de Oro map (Leaflet) inside a WebView.
 * The browser version lives in RealMap.web.tsx; Metro picks the right file per platform.
 */
export const RealMap = React.forwardRef<RealMapHandle, RealMapProps>(function RealMap(props, ref) {
  const webRef = useRef<WebView>(null);
  const html = useMemo(() => buildLeafletHtml(), []);

  const send = useCallback((cmd: MapCommand) => {
    webRef.current?.injectJavaScript(`window.__cmd(${JSON.stringify(cmd)}); true;`);
  }, []);

  const { onEvent, handle } = useMapBridge(send, props);
  React.useImperativeHandle(ref, () => handle, [handle]);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        onEvent(JSON.parse(e.nativeEvent.data) as MapEvent);
      } catch {
        // ignore messages that are not ours
      }
    },
    [onEvent],
  );

  return (
    <View style={s.fill}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://civicpulse.app/' }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        overScrollMode="never"
        bounces={false}
        scrollEnabled={false}
        style={s.web}
        containerStyle={s.web}
      />
    </View>
  );
});

const s = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg },
  web: { flex: 1, backgroundColor: colors.bg },
});
