const BASE_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
const MAT_SERVICE_CODES = 'OTP,BU,NU';

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
  latitude: string;
  longitude: string;
  miles: number;
  services: Array<{ f1: string; f2: string; f3: string }>;
}

function mapFacility(row: RawFacilityRow): TreatmentFacility {
  return {
    id: `${row.name1}-${row.street1}-${row._irow}`.replace(/\s+/g, '-'),
    name: row.name1,
    name2: row.name2 ?? undefined,
    street1: row.street1,
    street2: row.street2 ?? undefined,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    milesAway: row.miles,
    services: (row.services || []).map((s) => s.f3),
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
    `limitValue=${milesToMeters(radiusMiles)}`,
    `pageSize=${pageSize}`,
    `page=1`,
    `sort=0`,
  ];

  const requestUrl = `${BASE_URL}?${queryParams.join('&')}`;
  console.log('[FindTreatment] URL:', requestUrl);

  const data = await new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', requestUrl);
    xhr.timeout = 15000;

    xhr.onload = () => {
      console.log('[FindTreatment] status:', xhr.status);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText);
          console.log('[FindTreatment] recordCount:', parsed.recordCount);
          console.log('[FindTreatment] rows type:', typeof parsed.rows, Array.isArray(parsed.rows));
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`Request failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timed out'));
    xhr.send();
  });

  if (!data.rows) return [];
  const rows: RawFacilityRow[] = Array.isArray(data.rows) ? data.rows : [data.rows];
  return rows.map(mapFacility);
}
