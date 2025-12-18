import { useState, useEffect, useCallback } from 'react';
import { getDonations, Donation, IS_DEMO_MODE, subscribeToDemoUpdates } from '../lib/api';
import { useWebSocket, WebSocketMessage } from './useWebSocket';

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'NEW_DONATION') {
      setDonations((prev) => {
        // Avoid duplicates
        if (prev.some((d) => d.id === message.donation.id)) {
          return prev;
        }
        return [...prev, message.donation];
      });
    } else if (message.type === 'DONATION_EXPIRED') {
      setDonations((prev) =>
        prev.filter((d) => d.id !== message.donation.id)
      );
    }
  }, []);

  // Only use WebSocket if not in demo mode
  const { isConnected } = useWebSocket({
    onMessage: handleWebSocketMessage,
    enabled: !IS_DEMO_MODE,
  });

  // Subscribe to demo updates
  useEffect(() => {
    if (IS_DEMO_MODE) {
      const unsubscribe = subscribeToDemoUpdates((donation) => {
        setDonations((prev) => {
          if (prev.some((d) => d.id === donation.id)) {
            return prev;
          }
          return [...prev, donation];
        });
      });
      return unsubscribe;
    }
  }, []);

  // Fetch initial donations
  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDonations();
      setDonations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Periodically remove expired donations from local state
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setDonations((prev) => prev.filter((d) => d.expiresAt > now));
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Add a new donation to the local state (for optimistic updates)
  const addDonation = useCallback((donation: Donation) => {
    setDonations((prev) => [...prev, donation]);
  }, []);

  return {
    donations,
    loading,
    error,
    isConnected: IS_DEMO_MODE ? true : isConnected,
    refetch: fetchDonations,
    addDonation,
  };
}
