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
  /** Position on the simulated map (0 to 1000). */
  x: number;
  y: number;
  votes: number;
  reportedAgo: string;
};

/** Where the blue "you are here" dot sits on the simulated map. */
export const USER_POS = { x: 400, y: 440 };

export type Place = { id: string; name: string; x: number; y: number };

/** SIMULATED places for search auto-complete. */
export const PLACES: Place[] = [
  { id: 'p1', name: 'City Hall', x: 500, y: 350 },
  { id: 'p2', name: 'Central Park', x: 400, y: 250 },
  { id: 'p3', name: 'Market Street', x: 300, y: 420 },
  { id: 'p4', name: 'Oak Avenue', x: 700, y: 520 },
  { id: 'p5', name: 'River Road', x: 480, y: 658 },
  { id: 'p6', name: 'Riverside Park', x: 790, y: 825 },
  { id: 'p7', name: 'Park Lane', x: 120, y: 560 },
  { id: 'p8', name: 'School Road', x: 880, y: 230 },
  { id: 'p9', name: 'Elm Street', x: 200, y: 740 },
  { id: 'p10', name: 'Central Station', x: 600, y: 750 },
];

/** SIMULATED reports. Replace with a fetch from your backend later. */
export const SAMPLE_REPORTS: Report[] = [
  { id: 'r1', title: 'Large pothole', address: '120 Market St', category: 'road', status: 'open', x: 312, y: 410, votes: 24, reportedAgo: '2h ago' },
  { id: 'r2', title: 'Cracked road surface', address: '124 Market St', category: 'road', status: 'in_progress', x: 322, y: 436, votes: 9, reportedAgo: '1d ago' },
  { id: 'r3', title: 'Sunken manhole cover', address: '118 Market St', category: 'road', status: 'open', x: 296, y: 398, votes: 15, reportedAgo: '3h ago' },
  { id: 'r4', title: 'Streetlight out', address: '45 Oak Ave', category: 'lighting', status: 'open', x: 702, y: 505, votes: 12, reportedAgo: '5h ago' },
  { id: 'r5', title: 'Flickering streetlight', address: '49 Oak Ave', category: 'lighting', status: 'in_progress', x: 710, y: 530, votes: 6, reportedAgo: '2d ago' },
  { id: 'r6', title: 'Blocked storm drain', address: '8 River Rd', category: 'drainage', status: 'open', x: 470, y: 612, votes: 31, reportedAgo: '1h ago' },
  { id: 'r7', title: 'Flooded gutter', address: '12 River Rd', category: 'drainage', status: 'resolved', x: 492, y: 700, votes: 8, reportedAgo: '4d ago' },
  { id: 'r8', title: 'Overflowing bins', address: '3 Park Lane', category: 'sanitation', status: 'in_progress', x: 130, y: 520, votes: 5, reportedAgo: '6h ago' },
  { id: 'r9', title: 'Illegal dumping', address: '7 Park Lane', category: 'sanitation', status: 'open', x: 112, y: 545, votes: 18, reportedAgo: '1d ago' },
  { id: 'r10', title: 'Broken crosswalk signal', address: '5th & Main', category: 'pedestrian', status: 'open', x: 500, y: 350, votes: 40, reportedAgo: '30m ago' },
  { id: 'r11', title: 'Missing sidewalk slab', address: '22 5th Ave', category: 'pedestrian', status: 'resolved', x: 330, y: 820, votes: 3, reportedAgo: '1w ago' },
  { id: 'r12', title: 'Faded crosswalk paint', address: '2 School Rd', category: 'pedestrian', status: 'in_progress', x: 880, y: 220, votes: 11, reportedAgo: '3d ago' },
  { id: 'r13', title: 'Fallen tree branch', address: '61 Elm St', category: 'road', status: 'resolved', x: 205, y: 722, votes: 7, reportedAgo: '5d ago' },
  { id: 'r14', title: 'Dark alley lighting', address: 'Alley 3', category: 'lighting', status: 'open', x: 600, y: 300, votes: 14, reportedAgo: '8h ago' },
  { id: 'r15', title: 'Broken curb ramp', address: '9 Station Rd', category: 'pedestrian', status: 'open', x: 610, y: 748, votes: 20, reportedAgo: '12h ago' },
  { id: 'r16', title: 'Pothole cluster', address: '30 Station Rd', category: 'road', status: 'open', x: 590, y: 770, votes: 27, reportedAgo: '4h ago' },
];
