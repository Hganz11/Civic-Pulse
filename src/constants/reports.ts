import type { IconName } from '@/components/auth/ui';

export type CategoryId = 'road' | 'lighting' | 'drainage' | 'sanitation' | 'pedestrian';
export type FilterId = 'all' | CategoryId;
export type Status = 'open' | 'in_progress' | 'resolved';

export const CATEGORIES: { id: CategoryId; label: string; icon: IconName }[] = [
  { id: 'road', label: 'Road hazards', icon: 'road-variant' },
  { id: 'lighting', label: 'Lighting', icon: 'lightbulb-on-outline' },
  { id: 'drainage', label: 'Drainage', icon: 'water-outline' },
  { id: 'sanitation', label: 'Sanitation', icon: 'trash-can-outline' },
  { id: 'pedestrian', label: 'Pedestrian', icon: 'walk' },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

/** Pin colors: red = open, orange = being fixed, green = resolved. */
export const STATUS: Record<Status, { label: string; color: string }> = {
  open: { label: 'Open', color: '#FF6B5E' },
  in_progress: { label: 'In progress', color: '#FFA14A' },
  resolved: { label: 'Resolved', color: '#4FD1A5' },
};

export type Report = {
  id: string;
  title: string;
  address: string;
  category: CategoryId;
  status: Status;
  /** Real-world position in Cagayan de Oro. */
  lat: number;
  lng: number;
  votes: number;
  reportedAgo: string;
};

/**
 * SIMULATED reports: the titles, statuses and vote counts are made up, but each one is placed
 * within a few hundred meters of a real Cagayan de Oro landmark (see constants/cdo.ts).
 * Replace with a fetch from your backend later.
 */
export const SAMPLE_REPORTS: Report[] = [
  { id: 'r1', title: 'Large pothole', address: 'Near Gaston Park', category: 'road', status: 'open', lat: 8.4759, lng: 124.6427, votes: 24, reportedAgo: '2h ago' },
  { id: 'r2', title: 'Cracked road surface', address: 'Near St. Augustine Cathedral', category: 'road', status: 'in_progress', lat: 8.4749, lng: 124.6418, votes: 9, reportedAgo: '1d ago' },
  { id: 'r3', title: 'Sunken manhole cover', address: 'Near Gaston Park', category: 'road', status: 'open', lat: 8.475, lng: 124.6425, votes: 15, reportedAgo: '3h ago' },
  { id: 'r4', title: 'Streetlight out', address: 'Near Golden Friendship Park', category: 'lighting', status: 'open', lat: 8.4781, lng: 124.6448, votes: 12, reportedAgo: '5h ago' },
  { id: 'r5', title: 'Flickering streetlight', address: 'Near Golden Friendship Park', category: 'lighting', status: 'in_progress', lat: 8.4772, lng: 124.6451, votes: 6, reportedAgo: '2d ago' },
  { id: 'r6', title: 'Blocked storm drain', address: 'Near McArthur Park', category: 'drainage', status: 'open', lat: 8.4859, lng: 124.6469, votes: 31, reportedAgo: '1h ago' },
  { id: 'r7', title: 'Flooded gutter', address: 'Near McArthur Park', category: 'drainage', status: 'resolved', lat: 8.4845, lng: 124.6483, votes: 8, reportedAgo: '4d ago' },
  { id: 'r8', title: 'Overflowing bins', address: 'Near SM City Cagayan de Oro', category: 'sanitation', status: 'in_progress', lat: 8.4569, lng: 124.6247, votes: 5, reportedAgo: '6h ago' },
  { id: 'r9', title: 'Illegal dumping', address: 'Near SM City Cagayan de Oro', category: 'sanitation', status: 'open', lat: 8.4556, lng: 124.6238, votes: 18, reportedAgo: '1d ago' },
  { id: 'r10', title: 'Broken crosswalk signal', address: 'City center', category: 'pedestrian', status: 'open', lat: 8.4843, lng: 124.647, votes: 40, reportedAgo: '30m ago' },
  { id: 'r11', title: 'Missing sidewalk slab', address: 'Near St. Augustine Cathedral', category: 'pedestrian', status: 'resolved', lat: 8.4743, lng: 124.6407, votes: 3, reportedAgo: '1w ago' },
  { id: 'r12', title: 'Faded crosswalk paint', address: 'Near Golden Friendship Park', category: 'pedestrian', status: 'in_progress', lat: 8.4796, lng: 124.6454, votes: 11, reportedAgo: '3d ago' },
  { id: 'r13', title: 'Fallen tree branch', address: 'Near McArthur Park', category: 'road', status: 'resolved', lat: 8.4867, lng: 124.6479, votes: 7, reportedAgo: '5d ago' },
  { id: 'r14', title: 'Dark alley lighting', address: 'Near Gaston Park', category: 'lighting', status: 'open', lat: 8.4765, lng: 124.6409, votes: 14, reportedAgo: '8h ago' },
  { id: 'r15', title: 'Broken curb ramp', address: 'City center', category: 'pedestrian', status: 'open', lat: 8.483, lng: 124.6482, votes: 20, reportedAgo: '12h ago' },
  { id: 'r16', title: 'Pothole cluster', address: 'Near SM City Cagayan de Oro', category: 'road', status: 'open', lat: 8.4575, lng: 124.6231, votes: 27, reportedAgo: '4h ago' },
];
