import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import './Globe.css';

function InteractiveGlobe({ pins = [], onPinClick }) {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });

  // Globe material
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
      // Disable auto-rotation
      const controls = globeRef.current.controls();
      controls.autoRotate = false;

      // Set initial camera position
      globeRef.current.pointOfView({
        lat: 20,
        lng: 0,
        altitude: 2.2
      });
    }
  }, []);

  // Create a candle with flame as a THREE.js object
  const createCandle = useCallback((d) => {
    const group = new THREE.Group();
    const scale = 0.5;

    // Ping ring at base (glowing circle on the ground)
    const ringGeometry = new THREE.RingGeometry(0.8 * scale, 1.2 * scale, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: '#ff6600',
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    group.add(ring);

    // Outer ping ring (larger, softer)
    const outerRingGeometry = new THREE.RingGeometry(1.2 * scale, 1.8 * scale, 32);
    const outerRingMaterial = new THREE.MeshBasicMaterial({
      color: '#ff4400',
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.005;
    group.add(outerRing);

    // Candle body (cylinder) - cream/white color with warm glow
    const candleGeometry = new THREE.CylinderGeometry(0.3 * scale, 0.35 * scale, 2 * scale, 12);
    const candleMaterial = new THREE.MeshStandardMaterial({
      color: '#f5f0e0',
      emissive: '#ff6633',
      emissiveIntensity: 0.2,
    });
    const candle = new THREE.Mesh(candleGeometry, candleMaterial);
    candle.position.y = 1 * scale;
    group.add(candle);

    // Wick (thin cylinder)
    const wickGeometry = new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.3 * scale, 6);
    const wickMaterial = new THREE.MeshBasicMaterial({ color: '#1a1a1a' });
    const wick = new THREE.Mesh(wickGeometry, wickMaterial);
    wick.position.y = 2.15 * scale;
    group.add(wick);

    // Outer glow sphere (large, soft)
    const glowOuterGeometry = new THREE.SphereGeometry(1.0 * scale, 16, 16);
    const glowOuterMaterial = new THREE.MeshBasicMaterial({
      color: '#ff4400',
      transparent: true,
      opacity: 0.2,
    });
    const glowOuter = new THREE.Mesh(glowOuterGeometry, glowOuterMaterial);
    glowOuter.position.y = 2.6 * scale;
    group.add(glowOuter);

    // Middle glow sphere
    const glowMiddleGeometry = new THREE.SphereGeometry(0.6 * scale, 16, 16);
    const glowMiddleMaterial = new THREE.MeshBasicMaterial({
      color: '#ff6600',
      transparent: true,
      opacity: 0.4,
    });
    const glowMiddle = new THREE.Mesh(glowMiddleGeometry, glowMiddleMaterial);
    glowMiddle.position.y = 2.6 * scale;
    group.add(glowMiddle);

    // Flame outer (orange)
    const flameOuterGeometry = new THREE.SphereGeometry(0.3 * scale, 8, 8);
    flameOuterGeometry.scale(1, 2, 1);
    const flameOuterMaterial = new THREE.MeshBasicMaterial({
      color: '#ff6600',
      transparent: true,
      opacity: 0.9,
    });
    const flameOuter = new THREE.Mesh(flameOuterGeometry, flameOuterMaterial);
    flameOuter.position.y = 2.6 * scale;
    group.add(flameOuter);

    // Flame inner core (bright yellow/white)
    const flameInnerGeometry = new THREE.SphereGeometry(0.15 * scale, 8, 8);
    flameInnerGeometry.scale(1, 2.5, 1);
    const flameInnerMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffcc',
      transparent: true,
      opacity: 1,
    });
    const flameInner = new THREE.Mesh(flameInnerGeometry, flameInnerMaterial);
    flameInner.position.y = 2.55 * scale;
    group.add(flameInner);

    // Point light for dynamic glow effect
    const light = new THREE.PointLight('#ff9933', 2, 6);
    light.position.y = 2.6 * scale;
    group.add(light);

    // Store data reference for click handling
    group.userData = d;

    return group;
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
        // Country polygons with outline style
        polygonsData={countries.features}
        polygonCapColor={() => '#1a1a1a'}
        polygonSideColor={() => '#000000'}
        polygonStrokeColor={() => '#ffffff'}
        polygonAltitude={0.008}
        // Custom candle objects
        objectsData={pins}
        objectLat={d => d.lat}
        objectLng={d => d.lng}
        objectAltitude={0.01}
        objectThreeObject={createCandle}
        onObjectClick={(obj, event, coords) => onPinClick && onPinClick(obj)}
        objectLabel={d => d.label ? `
          <div style="
            background: rgba(0, 10, 20, 0.9);
            border: 1px solid #ff9933;
            border-radius: 4px;
            padding: 8px 12px;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            font-size: 12px;
            color: #ffcc66;
            box-shadow: 0 0 20px rgba(255, 153, 51, 0.4);
            cursor: pointer;
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
