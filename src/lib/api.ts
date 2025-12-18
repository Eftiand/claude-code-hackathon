export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  expiresAt: number;
  durationMinutes: number;
  team?: string;
  isNew?: boolean; // Flag for animation
}

export interface CreateDonationRequest {
  donorName: string;
  amount: number;
  latitude: number;
  longitude: number;
  team?: string;
}

// Teams for competition
export const TEAMS = [
  { id: 'north', name: 'North', color: '#2d5a27' },
  { id: 'south', name: 'South', color: '#1e40af' },
  { id: 'east', name: 'East', color: '#dc2626' },
  { id: 'west', name: 'West', color: '#7c3aed' },
];

export function getTeamById(id: string) {
  return TEAMS.find((t) => t.id === id);
}

// Check if we have real API URLs configured
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const WS_URL = import.meta.env.VITE_WS_URL || '';

// Demo mode when no API is configured
export const IS_DEMO_MODE = !API_BASE_URL || API_BASE_URL === '';

// localStorage key for persisting donations
const STORAGE_KEY = 'tand-ett-ljus-donations';

// In-memory store for demo mode
let demoDonations: Donation[] = [];
let demoListeners: ((donation: Donation) => void)[] = [];

// Load donations from localStorage
function loadFromStorage(): Donation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const donations = JSON.parse(stored) as Donation[];
      // Filter out expired donations
      const now = Math.floor(Date.now() / 1000);
      return donations.filter((d) => d.expiresAt > now);
    }
  } catch (e) {
    console.error('Failed to load donations from storage:', e);
  }
  return [];
}

// Save donations to localStorage
function saveToStorage(donations: Donation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  } catch (e) {
    console.error('Failed to save donations to storage:', e);
  }
}

// Initialize from localStorage
if (IS_DEMO_MODE) {
  demoDonations = loadFromStorage();
}

export function subscribeToDemoUpdates(callback: (donation: Donation) => void) {
  demoListeners.push(callback);
  return () => {
    demoListeners = demoListeners.filter((l) => l !== callback);
  };
}

// Sweden coordinate bounds (must match SwedenTerrain.tsx)
export const SWEDEN_BOUNDS = {
  minLat: 55.3,
  maxLat: 69.1,
  minLng: 10.9,
  maxLng: 24.2,
};

// Check if coordinates are within Sweden bounds
export function isWithinSweden(lat: number, lng: number): boolean {
  return (
    lat >= SWEDEN_BOUNDS.minLat &&
    lat <= SWEDEN_BOUNDS.maxLat &&
    lng >= SWEDEN_BOUNDS.minLng &&
    lng <= SWEDEN_BOUNDS.maxLng
  );
}

// Clamp coordinates to Sweden bounds
export function clampToSweden(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.max(SWEDEN_BOUNDS.minLat, Math.min(SWEDEN_BOUNDS.maxLat, lat)),
    lng: Math.max(SWEDEN_BOUNDS.minLng, Math.min(SWEDEN_BOUNDS.maxLng, lng)),
  };
}

export async function createDonation(
  data: CreateDonationRequest
): Promise<Donation> {
  // Clamp coordinates to Sweden bounds
  const { lat: clampedLat, lng: clampedLng } = clampToSweden(data.latitude, data.longitude);

  if (IS_DEMO_MODE) {
    const durationMinutes = Math.max(20, Math.min(data.amount * 2, 480));
    const now = Date.now();
    const donation: Donation = {
      id: `donation-${now}-${Math.random().toString(36).substr(2, 9)}`,
      donorName: data.donorName,
      amount: data.amount,
      latitude: clampedLat,
      longitude: clampedLng,
      createdAt: new Date().toISOString(),
      expiresAt: Math.floor(now / 1000) + durationMinutes * 60,
      durationMinutes,
      team: data.team,
      isNew: true, // Mark as new for animation
    };
    demoDonations.push(donation);
    // Save to localStorage
    saveToStorage(demoDonations);
    // Notify listeners
    demoListeners.forEach((l) => l(donation));
    return donation;
  }

  const response = await fetch(`${API_BASE_URL}/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create donation');
  }

  return response.json();
}

export async function getDonations(): Promise<Donation[]> {
  if (IS_DEMO_MODE) {
    // Filter out expired donations
    const now = Math.floor(Date.now() / 1000);
    demoDonations = demoDonations.filter((d) => d.expiresAt > now);
    return demoDonations;
  }

  const response = await fetch(`${API_BASE_URL}/donations`);

  if (!response.ok) {
    throw new Error('Failed to fetch donations');
  }

  return response.json();
}

export function getWebSocketUrl(): string {
  return WS_URL;
}

// Get team statistics
export function getTeamStats(donations: Donation[]) {
  const stats = TEAMS.map((team) => {
    const teamDonations = donations.filter((d) => d.team === team.id);
    return {
      ...team,
      count: teamDonations.length,
      totalAmount: teamDonations.reduce((sum, d) => sum + d.amount, 0),
    };
  });

  // Sort by count (most candles first)
  return stats.sort((a, b) => b.count - a.count);
}
