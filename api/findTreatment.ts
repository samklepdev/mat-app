const BASE_URL = "https://findtreatment.gov/locator/exportsAsJson/v2";

// Testing against the live API showed that sType=SA returns zero results, and
// that omitting sCodes returns the same facilities as the restrictive OTP set —
// so SAMHSA's dataset near a given point is simply limited (it's built from an
// annual survey many facilities never complete). We omit sCodes to cast the
// widest net the API supports, and default to a generous radius.

export type FacilityType = string;

export interface TreatmentFacility {
  id: string;
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
