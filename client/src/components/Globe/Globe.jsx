import { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import './Globe.css';

function InteractiveGlobe() {
  const globeRef = useRef();

  useEffect(() => {
    if (globeRef.current) {
      // Configure auto-rotation
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      // Set initial camera position
      globeRef.current.pointOfView({
        lat: 20,
        lng: 0,
        altitude: 2.5
      });
    }
  }, []);

  return (
    <div className="globe-container">
      <Globe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.25}
        animateIn={true}
      />
    </div>
  );
}

export default InteractiveGlobe;
