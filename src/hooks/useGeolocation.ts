import { useState, useCallback } from 'react';
import { isInSweden, reverseGeocode } from '../lib/geocode';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    locationName: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      if (!isInSweden(latitude, longitude)) {
        setState({
          latitude: null,
          longitude: null,
          locationName: null,
          loading: false,
          error: 'Your location appears to be outside Sweden',
        });
        return;
      }

      // Get location name via reverse geocoding
      const locationName = await reverseGeocode(latitude, longitude);

      setState({
        latitude,
        longitude,
        locationName,
        loading: false,
        error: null,
      });
    } catch (error) {
      let errorMessage = 'Failed to get your location';

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
      }

      setState({
        latitude: null,
        longitude: null,
        locationName: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  const setManualLocation = useCallback(
    (lat: number, lng: number, name: string | null) => {
      setState({
        latitude: lat,
        longitude: lng,
        locationName: name,
        loading: false,
        error: null,
      });
    },
    []
  );

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      locationName: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    setManualLocation,
    clearLocation,
  };
}
