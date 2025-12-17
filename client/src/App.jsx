import { useState } from 'react';
import InteractiveGlobe from './components/Globe';
import UserModal from './components/UserModal';
import { mockLocations, transformToGlobePins } from './mocks/locations';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPins, setUserPins] = useState([]);

  const mockPins = transformToGlobePins(mockLocations);
  const allPins = [...mockPins, ...userPins];

  const handleAddPin = (userData) => {
    const newPin = {
      lat: userData.latitude,
      lng: userData.longitude,
      name: userData.name,
      amount: 1,
      city: userData.city,
      country: userData.country,
    };
    setUserPins((prev) => [...prev, newPin]);
  };

  return (
    <div className="app">
      <button
        className="add-pin-btn"
        onClick={() => setIsModalOpen(true)}
        aria-label="Add your pin"
      >
        <span className="btn-icon">+</span>
        <span className="btn-text">Add Pin</span>
      </button>

      <InteractiveGlobe pins={allPins} />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddPin}
      />
    </div>
  );
}

export default App;
