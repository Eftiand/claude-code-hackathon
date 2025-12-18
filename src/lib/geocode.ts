export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

const SWEDEN_BOUNDS = {
  minLat: 55.3,
  maxLat: 69.1,
  minLng: 10.9,
  maxLng: 24.2,
};

export function isInSweden(lat: number, lng: number): boolean {
  return (
    lat >= SWEDEN_BOUNDS.minLat &&
    lat <= SWEDEN_BOUNDS.maxLat &&
    lng >= SWEDEN_BOUNDS.minLng &&
    lng <= SWEDEN_BOUNDS.maxLng
  );
}

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  try {
    // Use Nominatim (OpenStreetMap) for geocoding - free and no API key required
    // Remove ", Sweden" suffix if it was added
    const cleanAddress = address.replace(/, Sweden$/i, '');

    const params = new URLSearchParams({
      q: cleanAddress,
      format: 'json',
      countrycodes: 'se', // Restrict to Sweden
      limit: '5', // Get a few results to find best match
      addressdetails: '1',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': 'LightACandle/1.0 (demo hackathon project)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding response not ok:', response.status);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return null;
    }

    // Find the first result that's in Sweden
    for (const result of results) {
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      if (isInSweden(latitude, longitude)) {
        // Extract a shorter display name
        const addr = result.address || {};
        const shortName = addr.city || addr.town || addr.village ||
                         addr.municipality || addr.county || result.display_name;

        return {
          latitude,
          longitude,
          displayName: shortName,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        headers: {
          'User-Agent': 'TandEttLjus/1.0',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    // Extract city/town name
    const address = result.address;
    return (
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      result.display_name
    );
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
