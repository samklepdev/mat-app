const BASE_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
const MAT_SERVICE_CODES = 'OTP,BU,NU,MH,SA,HI,DX';

export type FacilityType = 'OTP' | 'BU' | 'NU' | string;

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
  typeFacility: FacilityType; // OTP = methadone clinic, BU = buprenorphine, NU = naltrexone
  services: string[];
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
  latitude: string;  // NOTE: SAMHSA has lat/lng swapped — latitude field contains longitude value
  longitude: string; // and longitude field contains latitude value
  miles: number;
  typeFacility: string;
  services: null; // always null at list level — use typeFacility for filtering
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
    name2: row.name2 || undefined,
    street1: row.street1,
    street2: row.street2 || undefined,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone || undefined,
    website: row.website || undefined,
    // SAMHSA has lat/lng swapped in their API response
    latitude: parseFloat(row.longitude),
    longitude: parseFloat(row.latitude),
    milesAway: row.miles,
    typeFacility: row.typeFacility,
    services: [], // not available at list level
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
}): Promise<TreatmentFacility[]> {
  const { latitude, longitude, radiusMiles = 50, pageSize = 100 } = params;

  const queryParams = [
    `sCodes=${MAT_SERVICE_CODES}`,
    `sAddr=${longitude},${latitude}`,
    `limitType=2`,
    `limitValue=${Math.round(milesToMeters(radiusMiles))}`,
    `pageSize=${pageSize}`,
    `page=1`,
    `sort=0`,
  ];

  const url = `${BASE_URL}?${queryParams.join('&')}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`FindTreatment.gov request failed: ${response.status}`);
  }

  const data: RawResponse = await response.json();

  if (!data.rows) return [];
  const rows = Array.isArray(data.rows) ? data.rows : [data.rows];
  if (__DEV__) {
    console.log('[FindTreatment] typeFacility values:', rows.map((r: any) => `${r.name1}: ${r.typeFacility}`).join(', '));
  }
  return rows.map(mapFacility);
}
