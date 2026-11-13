import { CDO_BOUNDS, CDO_CENTER, USER_POS } from '@/constants/cdo';
import { colors } from '@/constants/civic';
import { CARTO_KEY } from '@/constants/mapKeys';
import { STATUS } from '@/constants/reports';

/**
 * The whole map as one self-contained web page (Leaflet + OpenStreetMap-based tiles).
 * No API key is needed. Libraries load from unpkg at fixed versions, so the phone needs internet.
 *
 * Tiles (each shows its own required credit in the bottom-left corner of the map):
 *  - dark:      OpenStreetMap tiles recolored dark with a CSS filter (CARTO's dark tiles now need an API key)
 *  - streets:   OpenStreetMap standard (c) OpenStreetMap contributors
 *  - satellite: Esri World Imagery
 *  - heat:      the dark map plus a heat layer drawn from the reports (weighted by upvotes)
 *
 * The map cannot leave Cagayan de Oro: maxBounds + maxBoundsViscosity lock the panning, and the
 * minimum zoom is raised until the CDO box fills the screen.
 */
export function buildLeafletHtml(): string {
  const cfg = {
    bounds: CDO_BOUNDS,
    center: CDO_CENTER,
    user: USER_POS,
    status: {
      open: STATUS.open.color,
      in_progress: STATUS.in_progress.color,
      resolved: STATUS.resolved.color,
    },
    accent: colors.accent,
    accentInk: colors.accentInk,
    bg: colors.bg,
    cartoKey: CARTO_KEY,
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
<style>
  :root { --attr-bottom: 76px; }
  html, body, #map { margin: 0; height: 100%; width: 100%; background: ${colors.bg}; }
  body { font-family: -apple-system, Roboto, "Segoe UI", sans-serif; overflow: hidden; }
  .leaflet-container { background: ${colors.bg}; -webkit-tap-highlight-color: transparent; }
  .leaflet-bottom.leaflet-left { bottom: var(--attr-bottom); }
  .leaflet-control-attribution {
    background: rgba(14, 27, 34, 0.78) !important; color: #9DB2B9 !important;
    font-size: 10px; padding: 2px 6px; border-radius: 0 6px 0 0;
  }
  .leaflet-control-attribution a { color: #C8D6DB !important; }
  .dark-tiles { filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9) saturate(0.55); }
  .pinwrap, .clwrap, .mewrap { background: transparent; border: 0; }
  .pin {
    width: 24px; height: 24px; margin: 3px; border-radius: 50%; box-sizing: border-box;
    border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,.55);
    transition: transform .15s ease;
  }
  .pin.sel { transform: scale(1.4); border-color: ${colors.accent}; box-shadow: 0 0 0 4px rgba(246,201,69,.35), 0 2px 10px rgba(0,0,0,.6); }
  .cl {
    width: 40px; height: 40px; border-radius: 50%; box-sizing: border-box;
    background: ${colors.accent}; color: ${colors.accentInk}; font-weight: 800; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    border: 3px solid rgba(255,255,255,.9); box-shadow: 0 2px 10px rgba(0,0,0,.55);
  }
  .me {
    width: 18px; height: 18px; margin: 3px; border-radius: 50%; background: #4C9AFF;
    border: 3px solid #fff; box-sizing: border-box; box-shadow: 0 0 0 8px rgba(76,154,255,.28);
  }
  #fail {
    display: none; position: absolute; inset: 0; z-index: 1000; align-items: center; justify-content: center;
    flex-direction: column; text-align: center; padding: 32px; color: #F1F4F2; background: ${colors.bg};
  }
  #fail b { font-size: 17px; margin-bottom: 8px; }
  #fail span { color: #9DB2B9; font-size: 14px; line-height: 1.4; }
  #banner {
    display: none; position: absolute; left: 50%; top: 150px; transform: translateX(-50%); z-index: 900;
    background: rgba(21,39,47,.95); color: #F1F4F2; font-size: 12px; padding: 7px 12px; border-radius: 999px;
    border: 1px solid #2A434E; white-space: nowrap;
  }
</style>
</head>
<body>
<div id="map"></div>
<div id="banner">Map tiles can't load. Check your internet connection.</div>
<div id="fail"><b>The map couldn't load</b><span>Civic Pulse needs an internet connection to draw the Cagayan de Oro map. Check your connection and reopen the app.</span></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
<script>
(function () {
  var CFG = ${JSON.stringify(cfg)};

  function out(o) {
    try {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o));
      else if (window.parent !== window) window.parent.postMessage({ civicEvt: o }, '*');
    } catch (e) {}
  }

  if (typeof L === 'undefined' || !L.markerClusterGroup) {
    document.getElementById('fail').style.display = 'flex';
    return;
  }

  var b = CFG.bounds;
  var bounds = L.latLngBounds([b.south, b.west], [b.north, b.east]);
  var map = L.map('map', {
    center: [CFG.center.lat, CFG.center.lng],
    zoom: 14,
    minZoom: 11,
    maxZoom: 18,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    zoomControl: false,
    attributionControl: false
  });
  L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

  function fitMinZoom() {
    try { map.setMinZoom(Math.max(11, map.getBoundsZoom(bounds, true))); } catch (e) {}
  }
  fitMinZoom();
  map.on('resize', fitMinZoom);

  var CARTO = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
  var OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var ESRI = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

  var tiles = {
    dark: L.tileLayer('https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=' + CFG.cartoKey, { maxZoom: 18, attribution: CARTO }),
    darkFallback: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: OSM, className: 'dark-tiles' }),
    streets: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: OSM }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: ESRI })
  };
  var useFallback = false;
  var layerName = 'dark';
  Object.keys(tiles).forEach(function (k) {
    var errors = 0, banner = document.getElementById('banner');
    tiles[k].on('tileerror', function () {
      errors++;
      if (k === 'dark' && errors >= 3 && !useFallback) { useFallback = true; setBase(layerName === 'heat' ? 'heat' : layerName, true); return; }
      if (errors >= 4) banner.style.display = 'block';
    });
    tiles[k].on('tileload', function () { errors = 0; banner.style.display = 'none'; });
  });

  var currentBase = null;
  function setBase(name, force) {
    var want = name === 'heat' ? 'dark' : name;
    if (want === 'dark' && useFallback) want = 'darkFallback';
    if (currentBase === want && !force) return;
    if (currentBase) map.removeLayer(tiles[currentBase]);
    tiles[want].addTo(map);
    tiles[want].bringToBack();
    currentBase = want;
  }

  // "You are here" (simulated at the city centre)
  L.marker([CFG.user.lat, CFG.user.lng], {
    icon: L.divIcon({ className: 'mewrap', html: '<div class="me"></div>', iconSize: [24, 24], iconAnchor: [12, 12] }),
    interactive: false, zIndexOffset: -1000, keyboard: false
  }).addTo(map);

  var cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 55,
    disableClusteringAtZoom: 17,
    spiderfyOnMaxZoom: false,
    iconCreateFunction: function (c) {
      return L.divIcon({ className: 'clwrap', html: '<div class="cl">' + c.getChildCount() + '</div>', iconSize: [40, 40] });
    }
  });
  var heat = null;
  var markers = {};
  var lastSig = '';

  function pinIcon(r, sel) {
    var color = CFG.status[r.status] || '#fff';
    return L.divIcon({
      className: 'pinwrap',
      html: '<div class="pin' + (sel ? ' sel' : '') + '" style="background:' + color + '"></div>',
      iconSize: [30, 30], iconAnchor: [15, 15]
    });
  }

  function applyLayerMode() {
    var isHeat = layerName === 'heat';
    if (isHeat) {
      if (map.hasLayer(cluster)) map.removeLayer(cluster);
      if (heat && !map.hasLayer(heat)) heat.addTo(map);
    } else {
      if (heat && map.hasLayer(heat)) map.removeLayer(heat);
      if (!map.hasLayer(cluster)) map.addLayer(cluster);
    }
  }

  function applyState(s) {
    document.documentElement.style.setProperty('--attr-bottom', (s.attrBottom || 0) + 'px');

    var sig = s.reports.map(function (r) { return r.id + ':' + r.status + ':' + r.votes; }).join('|');
    if (sig !== lastSig) {
      lastSig = sig;
      cluster.clearLayers();
      markers = {};
      s.reports.forEach(function (r) {
        var m = L.marker([r.lat, r.lng], { icon: pinIcon(r, false), keyboard: false });
        m.on('click', function () { out({ t: 'select', id: r.id }); });
        markers[r.id] = { marker: m, report: r };
        cluster.addLayer(m);
      });
      if (heat) { map.removeLayer(heat); heat = null; }
      heat = L.heatLayer(
        s.reports.map(function (r) {
          var w = Math.min(1, r.votes / 40);
          if (r.status === 'resolved') w *= 0.25;
          return [r.lat, r.lng, Math.max(0.25, w)];
        }),
        { radius: 34, blur: 26, maxZoom: 16, gradient: { 0.3: '#4FD1A5', 0.6: '#F6C945', 0.85: '#FFA14A', 1.0: '#FF6B5E' } }
      );
    }

    Object.keys(markers).forEach(function (id) {
      var e = markers[id];
      e.marker.setIcon(pinIcon(e.report, id === s.selectedId));
    });

    layerName = s.layer;
    setBase(s.layer);
    applyLayerMode();
  }

  map.on('click', function () { out({ t: 'clear' }); });

  function handle(cmd) {
    if (!cmd || !cmd.c) return;
    if (cmd.c === 'state') applyState(cmd);
    else if (cmd.c === 'focus') {
      var z = Math.max(map.getZoom(), 17);
      var p = map.project([cmd.lat, cmd.lng], z).add([0, cmd.offsetPx || 0]);
      map.setView(map.unproject(p, z), z, { animate: true });
    }
    else if (cmd.c === 'fly') map.setView([cmd.lat, cmd.lng], cmd.zoom, { animate: true });
    else if (cmd.c === 'locate') map.setView([CFG.user.lat, CFG.user.lng], Math.max(map.getZoom(), 16), { animate: true });
    else if (cmd.c === 'zoom') { if (cmd.delta > 0) map.zoomIn(); else map.zoomOut(); }
  }

  // Phone: the app calls window.__cmd(...). Browser: it posts a message to this frame.
  window.__cmd = handle;
  window.addEventListener('message', function (e) {
    if (e.data && e.data.civicCmd) handle(e.data.civicCmd);
  });

  setBase('dark');
  applyLayerMode();
  out({ t: 'ready' });
})();
</script>
</body>
</html>`;
}
