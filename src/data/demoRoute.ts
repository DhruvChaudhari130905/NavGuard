import savedRoute from './pune-demo-route.json';

export type Coordinate = [longitude: number, latitude: number];
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const DEMO_ROUTE: Coordinate[] = savedRoute.geometry.coordinates.map(([lng, lat]) => [lng, lat]);
export const DEMO_ROUTE_KM = savedRoute.distanceMeters / 1000;

export function routeForTrip(tripNumber: number): Coordinate[] {
  const route = DEMO_ROUTE;
  const variant = Math.abs(tripNumber) % 4;
  if (variant === 1) return [...route].reverse();
  if (variant === 2) return route.slice(0, Math.max(2, Math.floor(route.length * 0.82)));
  if (variant === 3) return route.slice(Math.floor(route.length * 0.18));
  return [...route];
}

function distance(a: Coordinate, b: Coordinate): number {
  const radians = Math.PI / 180;
  const dLat = (b[1] - a[1]) * radians;
  const dLng = (b[0] - a[0]) * radians;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * radians) * Math.cos(b[1] * radians) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

const cumulative = [0];
for (let i = 1; i < DEMO_ROUTE.length; i++) {
  cumulative.push(cumulative[i - 1] + distance(DEMO_ROUTE[i - 1], DEMO_ROUTE[i]));
}

// Interpolate by travelled distance, not by the number of vertices in the road.
export function positionAtProgress(progress: number, route: Coordinate[] = DEMO_ROUTE): Coordinate {
  const fraction = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const routeCumulative = [0];
  for (let i = 1; i < route.length; i++) {
    routeCumulative.push(routeCumulative[i - 1] + distance(route[i - 1], route[i]));
  }
  const target = fraction * routeCumulative[routeCumulative.length - 1];
  for (let i = 1; i < routeCumulative.length; i++) {
    if (routeCumulative[i] >= target) {
      const span = routeCumulative[i] - routeCumulative[i - 1];
      const t = span === 0 ? 0 : (target - routeCumulative[i - 1]) / span;
      const a = route[i - 1];
      const b = route[i];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
  }
  return route[route.length - 1];
}

export function routeDistanceKm(route: Coordinate[]): number {
  let meters = 0;
  for (let i = 1; i < route.length; i++) meters += distance(route[i - 1], route[i]);
  return meters / 1000;
}

export const ROUTE_BOUNDS: [number, number, number, number] = [
  Math.min(...DEMO_ROUTE.map(p => p[0])),
  Math.min(...DEMO_ROUTE.map(p => p[1])),
  Math.max(...DEMO_ROUTE.map(p => p[0])),
  Math.max(...DEMO_ROUTE.map(p => p[1])),
];

export const routeFeature: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: DEMO_ROUTE },
};

export const endpointsFeature: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: [DEMO_ROUTE[0], DEMO_ROUTE[DEMO_ROUTE.length - 1]].map((coordinates, index) => ({
    type: 'Feature', properties: { endpoint: index === 0 ? 'Start' : 'End' },
    geometry: { type: 'Point', coordinates },
  })),
};
