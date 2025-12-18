import { useMemo } from 'react';
import { Shape, ExtrudeGeometry } from 'three';
import { useLoader } from '@react-three/fiber';
import { FileLoader } from 'three';
import { Html } from '@react-three/drei';

// Sweden coordinate bounds
export const SWEDEN_BOUNDS = {
  minLat: 55.3,
  maxLat: 69.1,
  minLng: 10.9,
  maxLng: 24.2,
};

// 3D terrain dimensions
const TERRAIN_SIZE = { width: 10, height: 20 };

// Swedish cities with coordinates and size based on population
const CITIES = [
  // Large cities (>200k)
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686, size: 'large' },
  { name: 'Göteborg', lat: 57.7089, lng: 11.9746, size: 'large' },
  { name: 'Malmö', lat: 55.6050, lng: 13.0038, size: 'large' },
  // Medium cities (50k-200k)
  { name: 'Uppsala', lat: 59.8586, lng: 17.6389, size: 'medium' },
  { name: 'Linköping', lat: 58.4108, lng: 15.6214, size: 'medium' },
  { name: 'Örebro', lat: 59.2753, lng: 15.2134, size: 'medium' },
  { name: 'Västerås', lat: 59.6099, lng: 16.5448, size: 'medium' },
  { name: 'Helsingborg', lat: 56.0465, lng: 12.6945, size: 'medium' },
  { name: 'Norrköping', lat: 58.5877, lng: 16.1924, size: 'medium' },
  { name: 'Jönköping', lat: 57.7826, lng: 14.1618, size: 'medium' },
  { name: 'Umeå', lat: 63.8258, lng: 20.2630, size: 'medium' },
  { name: 'Lund', lat: 55.7047, lng: 13.1910, size: 'medium' },
  { name: 'Gävle', lat: 60.6749, lng: 17.1413, size: 'medium' },
  { name: 'Borås', lat: 57.7210, lng: 12.9401, size: 'medium' },
  { name: 'Sundsvall', lat: 62.3908, lng: 17.3069, size: 'medium' },
  // Small cities (20k-50k)
  { name: 'Luleå', lat: 65.5848, lng: 22.1547, size: 'small' },
  { name: 'Karlstad', lat: 59.4022, lng: 13.5115, size: 'small' },
  { name: 'Växjö', lat: 56.8790, lng: 14.8059, size: 'small' },
  { name: 'Halmstad', lat: 56.6745, lng: 12.8578, size: 'small' },
  { name: 'Kalmar', lat: 56.6634, lng: 16.3566, size: 'small' },
  { name: 'Kristianstad', lat: 56.0294, lng: 14.1567, size: 'small' },
  { name: 'Skellefteå', lat: 64.7507, lng: 20.9528, size: 'small' },
  { name: 'Karlskrona', lat: 56.1612, lng: 15.5869, size: 'small' },
  { name: 'Falun', lat: 60.6065, lng: 15.6355, size: 'small' },
  { name: 'Trollhättan', lat: 58.2837, lng: 12.2886, size: 'small' },
  { name: 'Östersund', lat: 63.1792, lng: 14.6357, size: 'small' },
  { name: 'Visby', lat: 57.6348, lng: 18.2948, size: 'small' },
  { name: 'Kiruna', lat: 67.8558, lng: 20.2253, size: 'small' },
  { name: 'Uddevalla', lat: 58.3489, lng: 11.9420, size: 'small' },
  { name: 'Skövde', lat: 58.3910, lng: 13.8451, size: 'small' },
];

// Convert geographic coordinates to local 2D position (used inside rotated terrain group)
function geoToLocal(lat: number, lng: number): [x: number, z: number] {
  const x =
    ((lng - SWEDEN_BOUNDS.minLng) / (SWEDEN_BOUNDS.maxLng - SWEDEN_BOUNDS.minLng)) *
      TERRAIN_SIZE.width -
    TERRAIN_SIZE.width / 2;
  const z =
    ((lat - SWEDEN_BOUNDS.minLat) /
      (SWEDEN_BOUNDS.maxLat - SWEDEN_BOUNDS.minLat)) *
      TERRAIN_SIZE.height -
    TERRAIN_SIZE.height / 2;
  return [x, z];
}

// Convert geographic coordinates to world 3D position (for candles in Scene)
// The terrain is rotated -90° around X, so we need to transform accordingly
export function geoTo3D(
  lat: number,
  lng: number
): [x: number, y: number, z: number] {
  const [x, localZ] = geoToLocal(lat, lng);
  // After terrain rotation (-90° X): local (x, z, 0) → world (x, 0, -z)
  // Add small y offset to place candles on terrain surface
  return [x, 0, -localZ];
}

// Check if coordinates are within Sweden bounds
export function isWithinSweden(lat: number, lng: number): boolean {
  return (
    lat >= SWEDEN_BOUNDS.minLat &&
    lat <= SWEDEN_BOUNDS.maxLat &&
    lng >= SWEDEN_BOUNDS.minLng &&
    lng <= SWEDEN_BOUNDS.maxLng
  );
}

// Clamp coordinates to Sweden bounds
export function clampToSweden(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.max(SWEDEN_BOUNDS.minLat, Math.min(SWEDEN_BOUNDS.maxLat, lat)),
    lng: Math.max(SWEDEN_BOUNDS.minLng, Math.min(SWEDEN_BOUNDS.maxLng, lng)),
  };
}

// City marker component - rendered inside the terrain's rotated group
function CityMarker({ name, lat, lng, size }: { name: string; lat: number; lng: number; size: string }) {
  const [x, z] = geoToLocal(lat, lng);

  // Size-based properties
  const dotSize = size === 'large' ? 0.12 : size === 'medium' ? 0.07 : 0.04;
  const fontSize = size === 'large' ? '9px' : size === 'medium' ? '7px' : '5px';
  const opacity = size === 'large' ? 0.85 : size === 'medium' ? 0.6 : 0.4;
  const dotOpacity = size === 'large' ? 0.9 : size === 'medium' ? 0.7 : 0.5;

  // Position in local coordinates of the rotated terrain group (XZ plane becomes XY after rotation)
  return (
    <group position={[x, z, 0.2]}>
      {/* City dot */}
      <mesh>
        <circleGeometry args={[dotSize, 16]} />
        <meshBasicMaterial color="#4a7c59" transparent opacity={dotOpacity} />
      </mesh>

      {/* Outer ring - only for large/medium cities */}
      {size !== 'small' && (
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[dotSize, dotSize + 0.02, 16]} />
          <meshBasicMaterial color="#6b9080" transparent opacity={opacity * 0.5} />
        </mesh>
      )}

      {/* City name label */}
      <Html
        position={[0, -0.18, 0.3]}
        center
        style={{ pointerEvents: 'none' }}
        transform
        rotation={[Math.PI / 2, 0, 0]}
      >
        <div
          style={{
            color: '#9cb8a0',
            fontSize,
            fontFamily: 'Lora, serif',
            fontWeight: size === 'large' ? 600 : 400,
            opacity,
            textShadow: '0 0 3px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
}

export function SwedenTerrain() {
  // Load the GeoJSON
  const geoJson = useLoader(
    FileLoader,
    '/sweden-outline.json',
    (loader) => {
      loader.setResponseType('json');
    }
  );

  const geometry = useMemo(() => {
    if (!geoJson) return null;

    // Parse JSON if it's a string
    const data = typeof geoJson === 'string'
      ? JSON.parse(geoJson) as { geometry: { coordinates: number[][][] } }
      : geoJson as unknown as { geometry: { coordinates: number[][][] } };

    const coordinates = data.geometry.coordinates[0];

    // Create a shape from the coordinates
    const shape = new Shape();

    coordinates.forEach((coord, index) => {
      const [lng, lat] = coord;
      const [x, z] = geoToLocal(lat, lng);

      if (index === 0) {
        shape.moveTo(x, z);
      } else {
        shape.lineTo(x, z);
      }
    });

    shape.closePath();

    // Extrude the shape to create 3D geometry
    const extrudeSettings = {
      steps: 1,
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    return new ExtrudeGeometry(shape, extrudeSettings);
  }, [geoJson]);

  // Removed breathing animation to prevent flickering

  if (!geometry) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      {/* Main terrain mesh */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#0a1a2e"
          metalness={0.3}
          roughness={0.7}
          emissive="#0f2847"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Glowing edge outline */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[geometry, 15]} />
        <lineBasicMaterial
          color="#4a7c59"
          linewidth={2}
          transparent
          opacity={0.8}
        />
      </lineSegments>

      {/* Inner surface glow */}
      <mesh geometry={geometry} position={[0, 0, 0.05]}>
        <meshBasicMaterial
          color="#1a4d2e"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* City markers - inside the rotated group so they align with terrain */}
      {CITIES.map((city) => (
        <CityMarker key={city.name} {...city} />
      ))}
    </group>
  );
}
