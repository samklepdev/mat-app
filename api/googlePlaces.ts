// Google Places API (New) — Text Search. This is the sanctioned, stable way
// to get the same "treatment facilities near me" local results Google's own
// search UI shows, using the user's coordinates. Scraping a Google search
// results page directly is not viable: SERP URLs carry short-lived,
// session-bound tokens (sxsrf/ei/sstk/ved) tied to the browser that issued
// them, and automated scraping of google.com/search violates Google's Terms
// of Service.
//
// Requires a Google Cloud project with the Places API enabled and an API key
// in EXPO_PUBLIC_GOOGLE_PLACES_API_KEY (see .env.local). Every function here
// degrades to an empty result set if that key is missing, so the app and the
// SAMHSA search in findTreatment.ts keep working without it.

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
].join(",");

export interface GooglePlaceFacility {
  id: string;
  source: "google";
  name: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  ratingCount?: number;
}

interface PlaceAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  addressComponents?: PlaceAddressComponent[];
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
}

interface TextSearchResponse {
  places?: PlaceResult[];
}

function getApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
}

function componentByType(
  components: PlaceAddressComponent[] | undefined,
  type: string
): string | undefined {
  return components?.find((c) => c.types.includes(type))?.longText;
}

function mapPlace(place: PlaceResult): GooglePlaceFacility | null {
  if (!place.location) return null;

  const components = place.addressComponents;
  const streetNumber = componentByType(components, "street_number");
  const route = componentByType(components, "route");
  const street1 =
    [streetNumber, route].filter(Boolean).join(" ") ||
    place.formattedAddress ||
    "";

  return {
    id: `google-${place.id}`,
    source: "google",
    name: place.displayName?.text ?? "Unknown facility",
    street1,
    city: componentByType(components, "locality") ?? "",
    state:
      componentByType(components, "administrative_area_level_1") ?? "",
    zip: componentByType(components, "postal_code") ?? "",
    phone: place.nationalPhoneNumber || undefined,
    website: place.websiteUri || undefined,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    rating: place.rating,
    ratingCount: place.userRatingCount,
  };
}

function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

export async function searchGoogleTreatmentFacilities(params: {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
}): Promise<GooglePlaceFacility[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const { latitude, longitude, radiusMiles = 25 } = params;

  const response = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: "drug and alcohol treatment center",
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius: Math.min(milesToMeters(radiusMiles), 50000), // API caps at 50km
        },
      },
    }),
  });

  if (!response.ok) {
    // Google search results are supplementary — fail quietly and let the
    // SAMHSA results carry the search rather than surfacing an error for
    // what's meant to be a broadening, not a requirement.
    console.log("[GooglePlaces] request failed:", response.status);
    return [];
  }

  const data: TextSearchResponse = await response.json();
  return (data.places ?? [])
    .map(mapPlace)
    .filter((f): f is GooglePlaceFacility => f !== null);
}
