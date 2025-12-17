import { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import './Globe.css';

function InteractiveGlobe({ pins = [] }) {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });

  // Blue water material for globe
  const globeMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: '#000000',
      transparent: true,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    // Load countries GeoJSON for polygon outlines
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Configure auto-rotation
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;

      // Set initial camera position
      globeRef.current.pointOfView({
        lat: 20,
        lng: 0,
        altitude: 2.2
      });
    }
  }, []);

  // Create candle HTML element for each pin
  const candleElement = useMemo(() => {
    return (d) => {
      const el = document.createElement('div');
      el.className = 'candle-container';
      const height = 20 + (d.size || 1) * 15;
      const flameColor = d.color || '#ff9500';

      el.innerHTML = `
        <div class="candle" style="height: ${height}px;">
          <div class="flame" style="--flame-color: ${flameColor};">
            <div class="flame-inner"></div>
            <div class="flame-outer"></div>
            <div class="glow" style="--glow-color: ${flameColor};"></div>
          </div>
          <div class="wick"></div>
          <div class="wax"></div>
        </div>
      `;
      return el;
    };
  }, []);

  return (
    <div className="globe-container">
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl=""
        showGlobe={true}
        globeMaterial={globeMaterial}
        showAtmosphere={true}
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.15}
        // Country polygons with cyan outline style
        polygonsData={countries.features}
        polygonCapColor={() => '#1a1a1a'}
        polygonSideColor={() => '#000000'}
        polygonStrokeColor={() => '#ffffff'}
        polygonAltitude={0.008}
        // Light candles using HTML elements
        htmlElementsData={pins}
        htmlLat={d => d.lat}
        htmlLng={d => d.lng}
        htmlAltitude={0.02}
        htmlElement={candleElement}
        htmlLabel={d => d.label ? `
          <div style="
            background: rgba(0, 10, 20, 0.9);
            border: 1px solid ${d.color || '#ff9500'};
            border-radius: 4px;
            padding: 8px 12px;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            font-size: 12px;
            color: ${d.color || '#ff9500'};
            box-shadow: 0 0 20px ${d.color || '#ff9500'}40;
          ">
            <div style="font-weight: bold;">${d.label}</div>
            ${d.description ? `<div style="opacity: 0.7; margin-top: 4px;">${d.description}</div>` : ''}
          </div>
        ` : null}
        animateIn={true}
      />
    </div>
  );
}

export default InteractiveGlobe;
