import { GooglePlaceFacility, searchGoogleTreatmentFacilities } from "./googlePlaces";

const BASE_URL = "https://findtreatment.gov/locator/exportsAsJson/v2";

// Testing against the live API showed that sType=SA returns zero results, and
// that omitting sCodes returns the same facilities as the restrictive OTP set —
// so SAMHSA's dataset near a given point is simply limited (it's built from an
// annual survey many facilities never complete). We omit sCodes to cast the
// widest net the API supports, and default to a generous radius.

export type FacilityType = string;

export interface TreatmentFacility {
  id: string;
  source: "samhsa" | "google";
  name: string;
  name2?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  milesAway: number;
  typeFacility: FacilityType;
  services: string[]; // service codes offered — used for MAT filtering
  rating?: number; // present for Google-sourced results only
  ratingCount?: number;
}

interface RawFacilityRow {
  _irow: number;
  name1: string;
  name2: string | null;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  latitude: string; // SAMHSA has lat/lng swapped in their response
  longitude: string;
  miles: number;
  typeFacility: string;
  services: unknown; // may be null, array of codes, or nested objects
}

interface RawResponse {
  page: number;
  totalPages: number;
  recordCount: number;
  rows: RawFacilityRow[] | RawFacilityRow | null;
}

// Extract flat service codes from SAMHSA's inconsistent shapes.
function extractServiceCodes(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((s) => {
        if (typeof s === "string") return s;
        if (s && typeof s === "object") {
          const obj = s as Record<string, unknown>;
          return (obj.f1 ?? obj.code ?? obj.f3 ?? "") as string;
        }
        return "";
      })
      .filter(Boolean)
      .map((s) => String(s).toUpperCase());
  }
  return [];
}

function mapFacility(row: RawFacilityRow): TreatmentFacility {
  return {
    id: `${row.name1}-${row.street1}-${row._irow}`.replace(/\s+/g, "-"),
    source: "samhsa",
    name: row.name1,
    name2: row.name2 || undefined,
    street1: row.street1,
    street2: row.street2 || undefined,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone || undefined,
    website: row.website || undefined,
    latitude: parseFloat(row.longitude), // swapped
    longitude: parseFloat(row.latitude),
    milesAway: row.miles,
    typeFacility: row.typeFacility ?? "",
    services: extractServiceCodes(row.services),
  };
}

function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

export interface SearchResult {
  facilities: TreatmentFacility[];
  totalPages: number;
  currentPage: number;
  recordCount: number;
}

export async function searchNearbyMatFacilities(params: {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  pageSize?: number;
  page?: number;
}): Promise<SearchResult> {
  const {
    latitude,
    longitude,
    radiusMiles = 50,
    pageSize = 50,
    page = 1,
  } = params;

  const queryParams = [
    `sAddr=${longitude},${latitude}`,
    `limitType=2`,
    `limitValue=${Math.round(milesToMeters(radiusMiles))}`,
    `pageSize=${pageSize}`,
    `page=${page}`,
    `sort=0`,
  ];

  const url = `${BASE_URL}?${queryParams.join("&")}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`FindTreatment.gov request failed: ${response.status}`);
  }

  const data: RawResponse = await response.json();

  if (!data.rows) {
    return { facilities: [], totalPages: 0, currentPage: page, recordCount: 0 };
  }

  const rows: RawFacilityRow[] = Array.isArray(data.rows)
    ? data.rows
    : typeof data.rows === "object" && data.rows !== null
      ? [data.rows as RawFacilityRow]
      : [];

  if (rows.length === 0) {
    return { facilities: [], totalPages: 0, currentPage: page, recordCount: 0 };
  }

  return {
    facilities: rows.map(mapFacility),
    totalPages: data.totalPages ?? 1,
    currentPage: page,
    recordCount: data.recordCount ?? rows.length,
  };
}

// ─── Merged search (SAMHSA registry + Google local search) ───────────────────
// SAMHSA is the free, treatment-specific, no-key source and stays primary.
// Google Places broadens coverage to facilities SAMHSA's dataset misses
// (SAMHSA is built from an annual survey many facilities never complete —
// see the note above). Google only contributes on the first page; "load
// more" just paginates further into the SAMHSA registry.

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\b(llc|inc|corp|corporation|ltd)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapGoogleFacility(
  place: GooglePlaceFacility,
  origin: { latitude: number; longitude: number }
): TreatmentFacility {
  return {
    id: place.id,
    source: "google",
    name: place.name,
    street1: place.street1,
    city: place.city,
    state: place.state,
    zip: place.zip,
    phone: place.phone,
    website: place.website,
    latitude: place.latitude,
    longitude: place.longitude,
    milesAway: haversineMiles(
      origin.latitude,
      origin.longitude,
      place.latitude,
      place.longitude
    ),
    typeFacility: "",
    services: [],
    rating: place.rating,
    ratingCount: place.ratingCount,
  };
}

// Drops Google results that look like a facility SAMHSA already returned —
// same normalized name and zip. Not perfect (data sources format addresses
// differently), but good enough to avoid obvious duplicates in the list.
function dedupeAgainstSamhsa(
  googleFacilities: TreatmentFacility[],
  samhsaFacilities: TreatmentFacility[]
): TreatmentFacility[] {
  const samhsaKeys = new Set(
    samhsaFacilities.map((f) => `${normalizeName(f.name)}|${f.zip}`)
  );
  return googleFacilities.filter(
    (f) => !samhsaKeys.has(`${normalizeName(f.name)}|${f.zip}`)
  );
}

export async function searchTreatmentFacilities(params: {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  pageSize?: number;
  page?: number;
}): Promise<SearchResult> {
  const { page = 1 } = params;

  if (page > 1) {
    // Google only ever contributes its (single) first page of results.
    return searchNearbyMatFacilities(params);
  }

  const [samhsaResult, googlePlaces] = await Promise.all([
    searchNearbyMatFacilities(params),
    searchGoogleTreatmentFacilities(params).catch(() => []),
  ]);

  const googleFacilities = dedupeAgainstSamhsa(
    googlePlaces.map((p) =>
      mapGoogleFacility(p, {
        latitude: params.latitude,
        longitude: params.longitude,
      })
    ),
    samhsaResult.facilities
  );

  return {
    ...samhsaResult,
    facilities: [...samhsaResult.facilities, ...googleFacilities],
    recordCount: samhsaResult.recordCount + googleFacilities.length,
  };
}
