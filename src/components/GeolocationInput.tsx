import { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { geocodeAddress } from '../lib/geocode';
import { isWithinSweden } from '../lib/api';

// Swedish cities - comprehensive list sorted alphabetically
const SWEDISH_CITIES = [
  { name: 'Alingsås', lat: 57.9304, lng: 12.5336 },
  { name: 'Arvika', lat: 59.6554, lng: 12.5854 },
  { name: 'Avesta', lat: 60.1454, lng: 16.1694 },
  { name: 'Boden', lat: 66.0614, lng: 21.6886 },
  { name: 'Bollnäs', lat: 61.3481, lng: 16.3947 },
  { name: 'Borås', lat: 57.7210, lng: 12.9401 },
  { name: 'Borlänge', lat: 60.4858, lng: 15.4364 },
  { name: 'Enköping', lat: 59.6360, lng: 17.0773 },
  { name: 'Eskilstuna', lat: 59.3666, lng: 16.5077 },
  { name: 'Eslöv', lat: 55.8392, lng: 13.3039 },
  { name: 'Falkenberg', lat: 56.9055, lng: 12.4912 },
  { name: 'Falköping', lat: 58.1734, lng: 13.5507 },
  { name: 'Falun', lat: 60.6065, lng: 15.6355 },
  { name: 'Gävle', lat: 60.6749, lng: 17.1413 },
  { name: 'Göteborg', lat: 57.7089, lng: 11.9746 },
  { name: 'Halmstad', lat: 56.6745, lng: 12.8578 },
  { name: 'Haparanda', lat: 65.8355, lng: 24.1319 },
  { name: 'Helsingborg', lat: 56.0465, lng: 12.6945 },
  { name: 'Hudiksvall', lat: 61.7276, lng: 17.1056 },
  { name: 'Härnösand', lat: 62.6323, lng: 17.9379 },
  { name: 'Jönköping', lat: 57.7826, lng: 14.1618 },
  { name: 'Kalmar', lat: 56.6634, lng: 16.3566 },
  { name: 'Karlskoga', lat: 59.3266, lng: 14.5239 },
  { name: 'Karlskrona', lat: 56.1612, lng: 15.5869 },
  { name: 'Karlstad', lat: 59.4022, lng: 13.5115 },
  { name: 'Katrineholm', lat: 58.9958, lng: 16.2070 },
  { name: 'Kiruna', lat: 67.8558, lng: 20.2253 },
  { name: 'Kristianstad', lat: 56.0294, lng: 14.1567 },
  { name: 'Kumla', lat: 59.1275, lng: 15.1416 },
  { name: 'Kungälv', lat: 57.8710, lng: 11.9736 },
  { name: 'Landskrona', lat: 55.8708, lng: 12.8302 },
  { name: 'Lidköping', lat: 58.5052, lng: 13.1579 },
  { name: 'Linköping', lat: 58.4108, lng: 15.6214 },
  { name: 'Ljungby', lat: 56.8333, lng: 13.9408 },
  { name: 'Luleå', lat: 65.5848, lng: 22.1547 },
  { name: 'Lund', lat: 55.7047, lng: 13.1910 },
  { name: 'Malmö', lat: 55.6050, lng: 13.0038 },
  { name: 'Mariestad', lat: 58.7094, lng: 13.8236 },
  { name: 'Mjölby', lat: 58.3263, lng: 15.1248 },
  { name: 'Motala', lat: 58.5372, lng: 15.0364 },
  { name: 'Nacka', lat: 59.3108, lng: 18.1636 },
  { name: 'Norrköping', lat: 58.5877, lng: 16.1924 },
  { name: 'Norrtälje', lat: 59.7580, lng: 18.7043 },
  { name: 'Nyköping', lat: 58.7530, lng: 17.0086 },
  { name: 'Nässjö', lat: 57.6531, lng: 14.6967 },
  { name: 'Oskarshamn', lat: 57.2648, lng: 16.4498 },
  { name: 'Piteå', lat: 65.3173, lng: 21.4797 },
  { name: 'Sandviken', lat: 60.6199, lng: 16.7754 },
  { name: 'Skara', lat: 58.3867, lng: 13.4384 },
  { name: 'Skellefteå', lat: 64.7507, lng: 20.9528 },
  { name: 'Skövde', lat: 58.3910, lng: 13.8451 },
  { name: 'Sollentuna', lat: 59.4280, lng: 17.9510 },
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { name: 'Strängnäs', lat: 59.3792, lng: 17.0310 },
  { name: 'Sundbyberg', lat: 59.3616, lng: 17.9719 },
  { name: 'Sundsvall', lat: 62.3908, lng: 17.3069 },
  { name: 'Söderhamn', lat: 61.3035, lng: 17.0590 },
  { name: 'Södertälje', lat: 59.1955, lng: 17.6253 },
  { name: 'Tranås', lat: 58.0376, lng: 14.9782 },
  { name: 'Trollhättan', lat: 58.2837, lng: 12.2886 },
  { name: 'Trelleborg', lat: 55.3760, lng: 13.1574 },
  { name: 'Uddevalla', lat: 58.3489, lng: 11.9420 },
  { name: 'Umeå', lat: 63.8258, lng: 20.2630 },
  { name: 'Uppsala', lat: 59.8586, lng: 17.6389 },
  { name: 'Varberg', lat: 57.1057, lng: 12.2508 },
  { name: 'Vetlanda', lat: 57.4289, lng: 15.0780 },
  { name: 'Visby', lat: 57.6348, lng: 18.2948 },
  { name: 'Västervik', lat: 57.7584, lng: 16.6370 },
  { name: 'Västerås', lat: 59.6099, lng: 16.5448 },
  { name: 'Växjö', lat: 56.8790, lng: 14.8059 },
  { name: 'Ystad', lat: 55.4295, lng: 13.8200 },
  { name: 'Ängelholm', lat: 56.2428, lng: 12.8622 },
  { name: 'Örebro', lat: 59.2753, lng: 15.2134 },
  { name: 'Örnsköldsvik', lat: 63.2909, lng: 18.7152 },
  { name: 'Östersund', lat: 63.1792, lng: 14.6357 },
];

interface GeolocationInputProps {
  onLocationSet: (lat: number, lng: number, name: string | null) => void;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}

export function GeolocationInput({
  onLocationSet,
  latitude,
  longitude,
  locationName,
}: GeolocationInputProps) {
  const {
    loading: geoLoading,
    error: geoError,
  } = useGeolocation();

  const [address, setAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [mode, setMode] = useState<'cities' | 'auto' | 'manual'>('cities');
  const [autoLoading, setAutoLoading] = useState(false);

  const handleAutoLocation = async () => {
    if (!navigator.geolocation) {
      setAddressError('Geolocation is not supported by your browser');
      return;
    }

    setAutoLoading(true);
    setAddressError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        }
      );

      const { latitude: lat, longitude: lng } = position.coords;

      // Check if location is within Sweden
      if (!isWithinSweden(lat, lng)) {
        setAddressError('Your location is outside Sweden. Please select a Swedish city instead.');
        setMode('cities');
        return;
      }

      // Reverse geocode to get location name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'LightACandle/1.0' } }
      );
      const data = await response.json();
      const name =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        'Your location';

      onLocationSet(lat, lng, name);
    } catch {
      setAddressError('Could not get your location. Please try selecting a city.');
    } finally {
      setAutoLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setAddressLoading(true);
    setAddressError(null);

    try {
      const result = await geocodeAddress(address);

      if (!result) {
        setAddressError('Could not find this address in Sweden. Try a city name like "Stockholm" or "Malmö"');
        return;
      }

      onLocationSet(result.latitude, result.longitude, result.displayName);
      setAddress('');
    } catch {
      setAddressError('An error occurred while searching');
    } finally {
      setAddressLoading(false);
    }
  };

  const hasLocation = latitude !== null && longitude !== null;

  const handleCitySelect = (city: typeof SWEDISH_CITIES[0]) => {
    onLocationSet(city.lat, city.lng, city.name);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Where would you like to light your candle?
      </label>

      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('cities')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === 'cities'
              ? 'bg-forest-dark text-white'
              : 'bg-dark-surface text-gray-400 hover:text-white'
          }`}
        >
          Choose city
        </button>
        <button
          type="button"
          onClick={() => setMode('auto')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === 'auto'
              ? 'bg-forest-dark text-white'
              : 'bg-dark-surface text-gray-400 hover:text-white'
          }`}
        >
          My location
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-forest-dark text-white'
              : 'bg-dark-surface text-gray-400 hover:text-white'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Cities grid - scrollable */}
      {mode === 'cities' && (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-forest-dark/30 p-2">
          <div className="grid grid-cols-3 gap-1.5">
            {SWEDISH_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleCitySelect(city)}
                className={`py-1.5 px-2 rounded text-xs font-medium transition-all border ${
                  locationName === city.name
                    ? 'border-candle-amber bg-candle-amber/10 text-candle-amber'
                    : 'border-forest-dark/30 bg-dark-surface text-gray-400 hover:text-white hover:border-forest-dark/50'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto location */}
      {mode === 'auto' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleAutoLocation}
            disabled={autoLoading || geoLoading}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {autoLoading ? (
              <>
                <span className="animate-spin">↻</span>
                Getting location...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Detect my location
              </>
            )}
          </button>
          {(geoError || addressError) && (
            <p className="text-red-400 text-sm">{geoError || addressError}</p>
          )}
        </div>
      )}

      {/* Manual address entry */}
      {mode === 'manual' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddressSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="e.g. Drottninggatan 1, Stockholm"
              className="form-input flex-1"
              disabled={addressLoading}
            />
            <button
              type="button"
              onClick={handleAddressSubmit}
              disabled={addressLoading || !address.trim()}
              className="btn-secondary px-4"
            >
              {addressLoading ? '...' : 'Search'}
            </button>
          </div>
          {addressError && (
            <p className="text-red-400 text-sm">{addressError}</p>
          )}
        </div>
      )}

      {/* Show selected location */}
      {hasLocation && (
        <div className="p-4 bg-forest-dark/20 rounded-lg border border-forest-dark/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-candle-amber/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-candle-amber"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">
                {locationName || 'Location selected'}
              </p>
              <p className="text-sm text-gray-400">
                {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
