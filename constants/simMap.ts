/**
 * SIMULATED city map. Everything here is drawn with plain Views, so it runs in the browser
 * and on phones without any native map package. Coordinates are in "world units" (0 to 1000).
 */
export const WORLD = 1000;

export type MapLayer = 'dark' | 'satellite' | 'traffic';

type Road = { at: number; w: number };

const H_ROADS: Road[] = [
  { at: 150, w: 16 },
  { at: 350, w: 26 },
  { at: 550, w: 16 },
  { at: 750, w: 26 },
  { at: 900, w: 16 },
];

const V_ROADS: Road[] = [
  { at: 120, w: 16 },
  { at: 300, w: 26 },
  { at: 500, w: 16 },
  { at: 700, w: 26 },
  { at: 880, w: 16 },
];

export type RoadSeg = {
  id: string;
  horizontal: boolean;
  at: number;
  from: number;
  to: number;
  width: number;
  main: boolean;
  /** Fake traffic: 0 = flowing, 1 = busy, 2 = jammed. Only shown on the traffic layer. */
  level: 0 | 1 | 2;
};

function buildSegments(roads: Road[], cross: Road[], horizontal: boolean): RoadSeg[] {
  const stops = [0, ...cross.map((c) => c.at), WORLD];
  const out: RoadSeg[] = [];
  roads.forEach((road) => {
    for (let i = 0; i < stops.length - 1; i++) {
      const n = (Math.round(road.at / 50) * 3 + i * 5) % 7;
      out.push({
        id: `${horizontal ? 'h' : 'v'}-${road.at}-${i}`,
        horizontal,
        at: road.at,
        from: stops[i],
        to: stops[i + 1],
        width: road.w,
        main: road.w >= 26,
        level: n < 3 ? 0 : n < 5 ? 1 : 2,
      });
    }
  });
  return out;
}

export const ROAD_SEGMENTS: RoadSeg[] = [
  ...buildSegments(H_ROADS, V_ROADS, true),
  ...buildSegments(V_ROADS, H_ROADS, false),
];

export type Block = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  park: boolean;
  alt: boolean;
};

const PARKS = new Set(['2-1', '4-4']);

function buildBlocks(): Block[] {
  const hb = [0, ...H_ROADS.map((r) => r.at), WORLD];
  const vb = [0, ...V_ROADS.map((r) => r.at), WORLD];
  const blocks: Block[] = [];
  for (let j = 0; j < hb.length - 1; j++) {
    for (let i = 0; i < vb.length - 1; i++) {
      const left = (i > 0 ? V_ROADS[i - 1].w / 2 : 0) + 5;
      const right = (i < vb.length - 2 ? V_ROADS[i].w / 2 : 0) + 5;
      const top = (j > 0 ? H_ROADS[j - 1].w / 2 : 0) + 5;
      const bottom = (j < hb.length - 2 ? H_ROADS[j].w / 2 : 0) + 5;
      blocks.push({
        id: `${i}-${j}`,
        x: vb[i] + left,
        y: hb[j] + top,
        w: vb[i + 1] - vb[i] - left - right,
        h: hb[j + 1] - hb[j] - top - bottom,
        park: PARKS.has(`${i}-${j}`),
        alt: (i + j) % 2 === 0,
      });
    }
  }
  return blocks;
}

export const BLOCKS: Block[] = buildBlocks();

export const RIVER = { x: 0, y: 640, w: WORLD, h: 36 };

type Palette = {
  bg: string;
  block: string;
  blockAlt: string;
  park: string;
  water: string;
  road: string;
  roadMain: string;
  line: string;
  label: string;
};

export const PALETTES: Record<'dark' | 'satellite', Palette> = {
  dark: {
    bg: '#0B161C',
    block: '#12242C',
    blockAlt: '#152A33',
    park: '#13302B',
    water: '#0A1E2B',
    road: '#223B46',
    roadMain: '#2A4753',
    line: 'rgba(246, 201, 69, 0.45)',
    label: '#9DB2B9',
  },
  satellite: {
    bg: '#2C3A24',
    block: '#3B4A30',
    blockAlt: '#46553A',
    park: '#25522C',
    water: '#1F4A66',
    road: '#6B6A63',
    roadMain: '#7A7970',
    line: 'rgba(255, 255, 255, 0.3)',
    label: '#F1F4F2',
  },
};

export const TRAFFIC_COLORS = ['#3DDC97', '#FFB84A', '#FF5A4F'] as const;
