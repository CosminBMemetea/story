import { geoContains, geoDistance } from "d3-geo";
import type { Feature, MultiPolygon, Polygon } from "geojson";

export type CountryFeature = Feature<
  Polygon | MultiPolygon,
  { ADMIN: string; ISO_A2: string; POP_EST: number }
>;

export interface VisitedCountry {
  code: string; // ISO 3166-1 alpha-2, upper case
  name: string;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let datasetPromise: Promise<CountryFeature[]> | null = null;

/** Natural Earth 1:110m country polygons, served from /public. Cached after first load. */
export const loadCountries = (): Promise<CountryFeature[]> => {
  datasetPromise ??= fetch(`${BASE_PATH}/countries.geojson`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load countries (${res.status})`);
      return res.json();
    })
    .then((data: { features: CountryFeature[] }) => data.features)
    .catch((error) => {
      datasetPromise = null; // allow a retry on the next call
      throw error;
    });
  return datasetPromise;
};

// ~220 km. The 1:110m outlines are coarse, so coastal cities (e.g. New York)
// can fall just outside their country's polygon.
const MAX_SNAP_RADIANS = (2 * Math.PI) / 180;

const forEachVertex = (
  feature: CountryFeature,
  fn: (point: [number, number]) => void
) => {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
  for (const polygon of polygons)
    for (const ring of polygon) for (const [lng, lat] of ring) fn([lng, lat]);
};

/**
 * Finds the country containing a coordinate entirely on-device
 * (no reverse-geocoding service is called).
 */
export const findCountry = (
  features: CountryFeature[],
  lng: number,
  lat: number
): VisitedCountry | null => {
  const point: [number, number] = [lng, lat];
  let match = features.find((f) => geoContains(f, point));

  if (!match) {
    let best = MAX_SNAP_RADIANS;
    for (const feature of features) {
      forEachVertex(feature, (vertex) => {
        const d = geoDistance(point, vertex);
        if (d < best) {
          best = d;
          match = feature;
        }
      });
    }
  }

  return match
    ? {
        code: match.properties.ISO_A2.toUpperCase(),
        name: match.properties.ADMIN,
      }
    : null;
};

/** A made-up itinerary so visitors can try the app without geotagged photos. */
export const SAMPLE_TRIP: VisitedCountry[] = [
  { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italy" },
  { code: "GR", name: "Greece" },
  { code: "JP", name: "Japan" },
  { code: "PE", name: "Peru" },
  { code: "MA", name: "Morocco" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];
