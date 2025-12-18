import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeolocationInput } from './GeolocationInput';
import { createDonation, TEAMS } from '../lib/api';

const AMOUNT_PRESETS = [50, 100, 250, 500];

export function DonationForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [team, setTeam] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSet = (
    lat: number,
    lng: number,
    locName: string | null
  ) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationName(locName);
  };

  const handleAmountPreset = (preset: number) => {
    setAmount(preset);
    setCustomAmount('');
    setShowCustomAmount(false);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    } else {
      setAmount('');
    }
  };

  const handleOtherClick = () => {
    setShowCustomAmount(true);
    setAmount('');
  };

  const isValid =
    name.trim() !== '' &&
    amount !== '' &&
    amount > 0 &&
    latitude !== null &&
    longitude !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || latitude === null || longitude === null) return;

    setSubmitting(true);
    setError(null);

    try {
      await createDonation({
        donorName: name.trim(),
        amount: amount as number,
        latitude,
        longitude,
        team: team || undefined,
      });

      // Redirect to map page after successful donation
      navigate('/?donated=true&name=' + encodeURIComponent(name.trim()));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate duration based on amount
  const getDurationText = () => {
    if (amount === '' || amount <= 0) return null;
    const minutes = Math.max(20, Math.min((amount as number) * 2, 480));
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hours`;
    }
    return `${hours} hours and ${remainingMinutes} minutes`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name input */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Your name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="form-input"
          maxLength={50}
        />
        <p className="text-xs text-gray-500">
          Your name will appear next to the candle on the map
        </p>
      </div>

      {/* Team selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Join a team (optional)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TEAMS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTeam(team === t.id ? '' : t.id)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                team === t.id
                  ? 'border-candle-amber bg-candle-amber/10 text-candle-amber'
                  : 'border-forest-dark/30 bg-dark-surface text-gray-400 hover:text-white hover:border-forest-dark/50'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: t.color }}
              />
              {t.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Compete with other teams to light the most candles
        </p>
      </div>

      {/* Amount input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Donation amount (SEK)
        </label>

        {/* Preset buttons */}
        <div className="grid grid-cols-5 gap-2">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAmountPreset(preset)}
              className={`amount-btn ${amount === preset && !showCustomAmount ? 'active' : ''}`}
            >
              {preset} kr
            </button>
          ))}
          <button
            type="button"
            onClick={handleOtherClick}
            className={`amount-btn ${showCustomAmount ? 'active' : ''}`}
          >
            Other
          </button>
        </div>

        {/* Custom amount - only show when "Other" is clicked */}
        {showCustomAmount && (
          <div className="relative animate-slide-up">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="Enter amount"
              className="form-input pr-12"
              min="1"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              kr
            </span>
          </div>
        )}

        {/* Duration preview */}
        {getDurationText() && (
          <div className="flex items-center gap-2 text-sm text-candle-amber">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Your candle will burn for {getDurationText()}</span>
          </div>
        )}
      </div>

      {/* Location input */}
      <GeolocationInput
        onLocationSet={handleLocationSet}
        latitude={latitude}
        longitude={longitude}
        locationName={locationName}
      />

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full btn-primary text-lg py-4 font-display"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">↻</span>
            Tänder ljuset...
          </span>
        ) : (
          'Tänd ett ljus'
        )}
      </button>

      {/* Info text */}
      <p className="text-center text-sm text-gray-500">
        This is a demo. No payment will be processed.
      </p>
    </form>
  );
}
