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

  // Convert size to weight for heatmap intensity (0-1 range)
  const getWeight = useCallback((d) => {
    const size = d.size || 1;
    // Normalize size to 0-1 range, assuming size is typically 1-5
    return Math.min(1, Math.max(0.2, size / 5));
  }, []);

  // Heatmap color interpolation function
  const heatmapColorFn = useCallback((d) => {
    const weight = getWeight(d);
    // Interpolate from blue (cold) through green/yellow to red (hot)
    if (weight < 0.33) {
      // Blue to cyan
      const t = weight / 0.33;
      return `rgba(0, ${Math.round(150 + 105 * t)}, ${Math.round(255 - 55 * t)}, 0.9)`;
    } else if (weight < 0.66) {
      // Cyan to yellow
      const t = (weight - 0.33) / 0.33;
      return `rgba(${Math.round(255 * t)}, 255, ${Math.round(200 * (1 - t))}, 0.9)`;
    } else {
      // Yellow to red
      const t = (weight - 0.66) / 0.34;
      return `rgba(255, ${Math.round(255 * (1 - t))}, 0, 0.9)`;
    }
  }, [getWeight]);

  // Point altitude based on intensity
  const getPointAltitude = useCallback((d) => {
    const size = d.size || 1;
    return 0.01 + (size / 5) * 0.05;
  }, []);

  // Point radius based on size
  const getPointRadius = useCallback((d) => {
    const size = d.size || 1;
    return 0.3 + size * 0.4;
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
        // Heatmap points
        pointsData={pins}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
        pointAltitude={getPointAltitude}
        pointRadius={getPointRadius}
        pointColor={heatmapColorFn}
        pointsMerge={false}
        pointLabel={d => d.label ? `
          <div style="
            background: rgba(0, 10, 20, 0.9);
            border: 1px solid ${heatmapColorFn(d)};
            border-radius: 4px;
            padding: 8px 12px;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            font-size: 12px;
            color: ${heatmapColorFn(d)};
            box-shadow: 0 0 20px ${heatmapColorFn(d)}40;
            cursor: pointer;
          ">
            <div style="font-weight: bold;">${d.label}</div>
            ${d.description ? `<div style="opacity: 0.7; margin-top: 4px;">${d.description}</div>` : ''}
          </div>
        ` : null}
        onPointClick={onPinClick}
        animateIn={true}
      />
    </div>
  );
}

export default InteractiveGlobe;
