const BASE_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
const MAT_SERVICE_CODES = 'OTP,BU,NU,MH,SA,HI,DX';

export interface TreatmentFacility {
  id: string;
  name: string;
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
  typeFacility: string;
}

export interface SearchResult {
  facilities: TreatmentFacility[];
  totalPages: number;
  currentPage: number;
  recordCount: number;
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
  latitude: string;
  longitude: string;
  miles: number;
  typeFacility: string;
  services: null;
}

interface RawResponse {
  page: number;
  totalPages: number;
  recordCount: number;
  rows: RawFacilityRow[] | RawFacilityRow | null;
}

function mapFacility(row: RawFacilityRow): TreatmentFacility {
  return {
    id: `${row.name1}-${row.street1}-${row._irow}`.replace(/\s+/g, '-'),
    name: row.name1,
    street1: row.street1,
    street2: row.street2 || undefined,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone || undefined,
    website: row.website || undefined,
    latitude: parseFloat(row.longitude),  // SAMHSA has lat/lng swapped
    longitude: parseFloat(row.latitude),
    milesAway: row.miles,
    typeFacility: row.typeFacility ?? '',
  };
}

function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

export async function searchNearbyMatFacilities(params: {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  pageSize?: number;
  page?: number;
}): Promise<SearchResult> {
  const { latitude, longitude, radiusMiles = 50, pageSize = 20, page = 1 } = params;

  const queryParams = [
    `sCodes=${MAT_SERVICE_CODES}`,
    `sAddr=${longitude},${latitude}`,
    `limitType=2`,
    `limitValue=${Math.round(milesToMeters(radiusMiles))}`,
    `pageSize=${pageSize}`,
    `page=${page}`,
    `sort=0`,
  ];

  const url = `${BASE_URL}?${queryParams.join('&')}`;
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
    : typeof data.rows === 'object' && data.rows !== null
    ? [data.rows as RawFacilityRow]
    : [];

  if (__DEV__) {
    console.log('[FindTreatment] typeFacility values:', rows.map(r => `${r.name1}: ${r.typeFacility}`).join(', '));
  }

  return {
    facilities: rows.map(mapFacility),
    totalPages: data.totalPages ?? 1,
    currentPage: page,
    recordCount: data.recordCount ?? rows.length,
  };
}
