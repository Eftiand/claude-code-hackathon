import { useState, useEffect, useCallback } from 'react';
import InteractiveGlobe from './components/Globe';
import UserModal from './components/UserModal';
import IntroAnimation from './components/IntroAnimation';
import { fetchNotePoints, createNote } from './api/notes';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pins, setPins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPins = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const points = await fetchNotePoints();
      // Transform API response to match globe pin format
      const transformedPins = points.map((point) => ({
        lat: point.lat,
        lng: point.lng,
        label: point.label,
        description: point.label,
        id: point.id,
      }));
      setPins(transformedPins);
    } catch (err) {
      console.error('Failed to load pins:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPins();
  }, [loadPins]);

  const handleAddPin = async (userData) => {
    try {
      setError(null);
      const noteData = {
        name: userData.name || null,
        message: userData.message,
        lat: userData.latitude,
        lon: userData.longitude,
        city: userData.city || null,
        country_code: null,
        share_location: true,
      };

      await createNote(noteData);
      // Reload pins to show the new one
      await loadPins();
    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.message);
    }
  };

  const handlePinClick = (pin) => {
    console.log('Pin clicked:', pin);
  };

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    // Small delay before showing the app content with animation
    setTimeout(() => setAppReady(true), 100);
  }, []);

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      <div className={`app ${appReady ? 'app-ready' : 'app-hidden'}`}>
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <button
          className={`add-pin-btn ${appReady ? 'btn-visible' : ''}`}
          onClick={() => setIsModalOpen(true)}
          aria-label="Add your pin"
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Add Pin</span>
        </button>

        {isLoading && pins.length === 0 && (
          <div className="loading-indicator">Loading...</div>
        )}

        <InteractiveGlobe pins={pins} onPinClick={handlePinClick} />

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleAddPin}
        />
      </div>
    </>
  );
}

export default App;
