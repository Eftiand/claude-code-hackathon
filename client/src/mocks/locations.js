// Mock location data with geolocation, name, and amount
export const mockLocations = [
  {
    id: 1,
    name: "New York",
    lat: 40.7128,
    lng: -74.006,
    amount: 15000,
  },
  {
    id: 2,
    name: "London",
    lat: 51.5074,
    lng: -0.1278,
    amount: 12500,
  },
  {
    id: 3,
    name: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    amount: 18000,
  },
  {
    id: 4,
    name: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
    amount: 8500,
  },
  {
    id: 5,
    name: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
    amount: 9200,
  },
  {
    id: 6,
    name: "Dubai",
    lat: 25.2048,
    lng: 55.2708,
    amount: 22000,
  },
  {
    id: 7,
    name: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    amount: 16500,
  },
  {
    id: 8,
    name: "Berlin",
    lat: 52.52,
    lng: 13.405,
    amount: 7800,
  },
];

// Helper to transform mock data to globe pin format (candles)
export const transformToGlobePins = (locations) => {
  return locations.map((loc) => ({
    lat: loc.lat,
    lng: loc.lng,
    label: loc.name,
    description: `Amount: $${loc.amount.toLocaleString()}`,
    amount: loc.amount,
  }));
};
