import { useState, useEffect, useRef } from 'react';
import './UserModal.css';

function UserModal({ isOpen, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchInitialLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInitialLocation = async () => {
    setInitializing(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const locationText = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
      setAddress(locationText);
      setSelectedLocation({
        display: locationText,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    } catch (err) {
      // Silently fail - user can search manually
    } finally {
      setInitializing(false);
    }
  };

  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      setSuggestions(
        data.map((item) => ({
          display: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        }))
      );
      setShowDropdown(true);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    setSelectedLocation(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setAddress(suggestion.display);
    setSelectedLocation(suggestion);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedLocation) {
      onConfirm({
        name: name.trim() || null,
        message: message.trim(),
        city: address,
        country: '',
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
      // Reset form
      setName('');
      setMessage('');
      setAddress('');
      setSelectedLocation(null);
      setSuggestions([]);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isValid = message.trim() && selectedLocation;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">Add Your Pin</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name (optional)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={60}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the world..."
              maxLength={200}
              rows={3}
              autoFocus
            />
            <span className="char-count">{message.length}/200</span>
          </div>

          <div className="form-group">
            <label>
              Location
              {initializing && <span className="label-hint"> (detecting...)</span>}
              {!initializing && selectedLocation && <span className="label-hint"> (confirmed)</span>}
            </label>

            <div className="address-input-wrapper" ref={dropdownRef}>
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder="Search for a city or address"
                disabled={initializing}
                className={selectedLocation ? 'has-selection' : ''}
              />
              {loading && <span className="input-spinner"></span>}

              {showDropdown && suggestions.length > 0 && (
                <ul className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <span className="suggestion-icon">📍</span>
                      <span className="suggestion-text">{suggestion.display}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!selectedLocation && address && !loading && suggestions.length === 0 && !initializing && (
              <p className="helper-text">Select a location from the dropdown</p>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={!isValid || initializing}
          >
            {initializing ? 'Detecting Location...' : 'Confirm & Add Pin'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
