/**
 * Cagayan de Oro City: the only area the map shows.
 *
 * Landmark coordinates come from the published GPS waypoints at waypoints.ph (Gaston Park,
 * St. Augustine Cathedral, Golden Friendship Park, McArthur Park, SM City Cagayan de Oro) and the
 * city center from philatlas.com. The bounds are a rectangle around the populated city and
 * the coast of Macajalar Bay; the map cannot be panned outside of it.
 */
export type MapLayer = 'dark' | 'streets' | 'satellite' | 'heat';

export type LatLng = { lat: number; lng: number };

export type Place = { id: string; name: string; lat: number; lng: number; sub?: string };

export const CDO_CENTER: LatLng = { lat: 8.4842, lng: 124.6472 };

export const CDO_BOUNDS = { south: 8.36, west: 124.55, north: 8.53, east: 124.77 };

/**
 * SIMULATED: the blue "you are here" dot sits at the city center.
 * Replace with the device's real location (expo-location) later.
 */
export const USER_POS: LatLng = CDO_CENTER;

/** Landmarks shown in search suggestions (coordinates from the sources above). */
export const PLACES: Place[] = [
  { id: 'gaston', name: 'Gaston Park', lat: 8.4755, lng: 124.6421, sub: 'Downtown' },
  { id: 'cathedral', name: 'St. Augustine Cathedral', lat: 8.4753, lng: 124.6415, sub: 'Downtown' },
  { id: 'gfpark', name: 'Golden Friendship Park', lat: 8.4776, lng: 124.6444, sub: 'Downtown' },
  { id: 'mcarthur', name: 'McArthur Park', lat: 8.4855, lng: 124.6475, sub: 'Lapasan area' },
  { id: 'smcdo', name: 'SM City Cagayan de Oro', lat: 8.4563, lng: 124.6243, sub: 'Uptown' },
  { id: 'center', name: 'City center', lat: 8.4842, lng: 124.6472 },
];
