import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Scene } from '../components/three/Scene';
import { useDonations } from '../hooks/useDonations';
import { getTeamStats } from '../lib/api';

export default function MapPage() {
  const { donations, loading, error, isConnected } = useDonations();
  const [searchParams] = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [donorName, setDonorName] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Get team stats
  const teamStats = getTeamStats(donations);

  // Show success message if redirected from donation
  useEffect(() => {
    if (searchParams.get('donated') === 'true') {
      setShowSuccessMessage(true);
      setDonorName(searchParams.get('name'));
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        setDonorName(null);
        // Clean up URL
        window.history.replaceState({}, '', '/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="map-page">
      <Header />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene donations={donations} />
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="px-6 py-4 bg-forest-dark/90 backdrop-blur-sm rounded-xl border border-forest-sage/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-candle-amber/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-candle-amber rounded-full"></div>
              </div>
              <div>
                <p className="font-display text-xl text-candle-glow">
                  {donorName ? `${donorName}'s candle is lit!` : 'Your candle has been lit!'}
                </p>
                <p className="text-sm text-gray-400">
                  Find your candle on the map
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Leaderboard Toggle */}
      <div className="absolute top-20 right-6 z-10">
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="px-4 py-2 bg-dark-surface/80 backdrop-blur-sm rounded-lg border border-forest-dark/30 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Teams
        </button>
      </div>

      {/* Team Leaderboard */}
      {showLeaderboard && (
        <div className="absolute top-32 right-6 z-10 w-56 animate-slide-up">
          <div className="bg-dark-surface/90 backdrop-blur-sm rounded-xl border border-forest-dark/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-forest-dark/30">
              <h3 className="font-display text-base text-candle-glow">Team Leaderboard</h3>
            </div>
            <div className="p-2">
              {teamStats.map((team, index) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-forest-dark/20 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-500 w-5">
                    {index + 1}.
                  </span>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{team.name}</p>
                    <p className="text-xs text-gray-500">
                      {team.count} candle{team.count !== 1 ? 's' : ''} · {team.totalAmount} kr
                    </p>
                  </div>
                </div>
              ))}
              {teamStats.every(t => t.count === 0) && (
                <p className="text-center text-gray-500 text-sm py-4">
                  No team candles yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status overlay */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="px-4 py-3 bg-dark-surface/80 backdrop-blur-sm rounded-lg border border-forest-dark/30">
          <div className="flex items-center gap-3 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-forest-sage' : 'bg-yellow-500'
              }`}
            />
            <span className="text-gray-400">
              {loading
                ? 'Loading...'
                : `${donations.length} candle${donations.length !== 1 ? 's' : ''} burning`}
            </span>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="absolute bottom-6 right-6 z-10">
        <Link
          to="/donate"
          className="btn-primary flex items-center gap-2 shadow-lg shadow-candle-amber/20"
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Tänd ett ljus
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
          <div className="px-4 py-3 bg-red-900/80 backdrop-blur-sm rounded-lg border border-red-500/30">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions overlay (shows briefly) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="text-center text-gray-500 text-sm">
          <p>Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}
