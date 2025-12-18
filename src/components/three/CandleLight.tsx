import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointLight } from 'three';

interface CandleLightProps {
  position: [number, number, number];
  intensity: number;
  distance: number;
  color?: string;
}

export function CandleLight({
  position,
  intensity,
  distance,
  color = '#FFB347',
}: CandleLightProps) {
  const lightRef = useRef<PointLight>(null);

  // Animate the light for gentle flickering effect
  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.getElapsedTime();
      // Reduced flicker for smoother, less jarring animation
      const flicker =
        Math.sin(time * 3) * 0.05 +
        Math.sin(time * 5) * 0.03;

      lightRef.current.intensity = intensity * (1 + flicker);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      intensity={intensity}
      distance={distance}
      color={color}
      decay={2}
      castShadow={false}
    />
  );
}
