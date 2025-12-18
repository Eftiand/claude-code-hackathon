import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import gsap from 'gsap';
import { CandleLight } from './CandleLight';
import { geoTo3D } from './SwedenTerrain';
import { Donation, getTeamById } from '../../lib/api';

interface CandleProps {
  donation: Donation;
}

export function Candle({ donation }: CandleProps) {
  const groupRef = useRef<Group>(null);
  const flameRef = useRef<Mesh>(null);
  const flameMaterialRef = useRef<MeshStandardMaterial>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(donation.isNew);

  // Get team info
  const team = donation.team ? getTeamById(donation.team) : null;

  // Calculate candle properties based on donation amount
  const candleProps = useMemo(() => {
    const amount = donation.amount;

    // Scale factors based on donation amount
    // Small: 50 SEK, Medium: 100-250 SEK, Large: 500+ SEK
    const scale = Math.min(0.5 + (amount / 500) * 0.5, 1.2);
    const lightIntensity = Math.min(0.5 + (amount / 200) * 0.5, 2);
    const lightDistance = Math.min(2 + (amount / 100) * 1, 6);

    return {
      scale,
      lightIntensity,
      lightDistance,
      candleHeight: 0.3 * scale,
      candleRadius: 0.08 * scale,
      flameHeight: 0.15 * scale,
    };
  }, [donation.amount]);

  // Hide "NEW" badge after 5 seconds
  useEffect(() => {
    if (showNewBadge) {
      const timer = setTimeout(() => setShowNewBadge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNewBadge]);

  // Calculate position from coordinates
  const position = useMemo(() => {
    return geoTo3D(donation.latitude, donation.longitude);
  }, [donation.latitude, donation.longitude]);

  // Calculate remaining time and fade effect
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const updateOpacity = () => {
      const now = Date.now() / 1000;
      const remaining = donation.expiresAt - now;
      const total = donation.durationMinutes * 60;

      if (remaining <= 0) {
        setOpacity(0);
        return;
      }

      // Start fading when 20% of time remains
      const fadeThreshold = total * 0.2;
      if (remaining < fadeThreshold) {
        setOpacity(remaining / fadeThreshold);
      } else {
        setOpacity(1);
      }
    };

    updateOpacity();
    const interval = setInterval(updateOpacity, 1000);
    return () => clearInterval(interval);
  }, [donation.expiresAt, donation.durationMinutes]);

  // Entrance animation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(0, 0, 0);
      setIsVisible(true);

      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  }, []);

  // Flame animation - gentle and smooth
  useFrame((state) => {
    if (flameRef.current) {
      const time = state.clock.getElapsedTime();

      // Gentle flame sway
      flameRef.current.rotation.z = Math.sin(time * 2) * 0.05;
      flameRef.current.rotation.x = Math.cos(time * 1.5) * 0.03;

      // Subtle pulsate
      const pulseScale = 1 + Math.sin(time * 3) * 0.05;
      flameRef.current.scale.y = pulseScale;
    }

    // Update flame material emissive intensity - smoother
    if (flameMaterialRef.current) {
      const time = state.clock.getElapsedTime();
      flameMaterialRef.current.emissiveIntensity =
        2 + Math.sin(time * 2) * 0.2;
    }
  });

  if (!isVisible && opacity === 0) return null;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[opacity, opacity, opacity]}
    >
      {/* Candle body */}
      <mesh position={[0, candleProps.candleHeight / 2, 0]}>
        <cylinderGeometry
          args={[
            candleProps.candleRadius,
            candleProps.candleRadius * 1.1,
            candleProps.candleHeight,
            16,
          ]}
        />
        <meshStandardMaterial
          color="#f5f5dc"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, candleProps.candleHeight + 0.02, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Flame */}
      <mesh
        ref={flameRef}
        position={[0, candleProps.candleHeight + candleProps.flameHeight / 2 + 0.04, 0]}
      >
        <coneGeometry
          args={[candleProps.flameHeight * 0.3, candleProps.flameHeight, 8]}
        />
        <meshStandardMaterial
          ref={flameMaterialRef}
          color="#FF8C00"
          emissive="#FFB347"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner flame (brighter core) */}
      <mesh
        position={[0, candleProps.candleHeight + candleProps.flameHeight * 0.4 + 0.04, 0]}
      >
        <coneGeometry
          args={[
            candleProps.flameHeight * 0.15,
            candleProps.flameHeight * 0.6,
            8,
          ]}
        />
        <meshBasicMaterial color="#FFFACD" transparent opacity={0.9} />
      </mesh>

      {/* Point light for glow */}
      <CandleLight
        position={[0, candleProps.candleHeight + 0.1, 0]}
        intensity={candleProps.lightIntensity * opacity}
        distance={candleProps.lightDistance}
      />

      {/* Green glow ring at base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry
          args={[
            candleProps.candleRadius * 1.5,
            candleProps.candleRadius * 3,
            32,
          ]}
        />
        <meshBasicMaterial
          color="#4a7c59"
          transparent
          opacity={0.3 * opacity}
        />
      </mesh>

      {/* Name label */}
      <Html
        position={[0, candleProps.candleHeight + candleProps.flameHeight + 0.3, 0]}
        center
        distanceFactor={8}
        style={{
          opacity: opacity,
          transition: 'opacity 0.3s',
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {/* NEW badge */}
          {showNewBadge && (
            <div
              className="px-2 py-0.5 rounded-full text-xs font-bold animate-pulse"
              style={{
                backgroundColor: '#FFB347',
                color: '#0a0a0f',
              }}
            >
              NEW!
            </div>
          )}
          {/* Name and team */}
          <div
            className="px-3 py-1.5 rounded-lg bg-dark-bg/90 backdrop-blur-sm border"
            style={{
              whiteSpace: 'nowrap',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '14px',
              color: '#FFFACD',
              textShadow: '0 0 10px rgba(255, 179, 71, 0.5)',
              borderColor: team ? team.color : 'rgba(255, 179, 71, 0.3)',
            }}
          >
            <span className="font-semibold">{donation.donorName}</span>
            {team && (
              <span
                className="ml-2 inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: team.color }}
              />
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
