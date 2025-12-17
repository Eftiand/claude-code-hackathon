import { useState, useEffect } from 'react';
import './IntroAnimation.css';

function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState('initial'); // initial, title, zoom, fade

  useEffect(() => {
    // Start sequence
    const timer1 = setTimeout(() => setPhase('title'), 100);
    const timer2 = setTimeout(() => setPhase('zoom'), 2000);
    const timer3 = setTimeout(() => setPhase('fade'), 3500);
    const timer4 = setTimeout(() => onComplete(), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className={`intro-animation ${phase}`}>
      {/* Starfield background */}
      <div className="starfield">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Nebula/space glow effects */}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />

      {/* Central content */}
      <div className="intro-content">
        {/* Globe placeholder that zooms */}
        <div className="globe-silhouette">
          <div className="globe-ring ring-1" />
          <div className="globe-ring ring-2" />
          <div className="globe-ring ring-3" />
          <div className="globe-core" />
          <div className="globe-glow" />
        </div>

        {/* Title text */}
        <div className="title-container">
          <h1 className="intro-title">
            <span className="title-word">Global</span>
            <span className="title-word">Candles</span>
          </h1>
          <p className="intro-subtitle">Light a candle. Share your story.</p>
        </div>
      </div>

      {/* Scan lines effect */}
      <div className="scan-lines" />

      {/* Vignette */}
      <div className="vignette" />
    </div>
  );
}

export default IntroAnimation;
