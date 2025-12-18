import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { SwedenTerrain } from './SwedenTerrain';
import { Candle } from './Candle';
import { Donation } from '../../lib/api';

interface SceneProps {
  donations: Donation[];
}

// Snow particles component
function Snow({ count = 1000 }) {
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      velocities[i] = 0.015 + Math.random() * 0.02;
    }

    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= particles.velocities[i];

        // Reset snowflake to top when it falls below
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 1] = 15;
          positions[i * 3] = (Math.random() - 0.5) * 25;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }

        // Gentle sway
        positions[i * 3] += Math.sin(Date.now() * 0.0005 + i) * 0.001;
      }

      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#FFB347" wireframe />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      {/* Soft ambient light */}
      <ambientLight intensity={0.1} color="#a0c4ff" />
      {/* Main light from above */}
      <directionalLight
        position={[5, 15, 5]}
        intensity={0.2}
        color="#fffacd"
      />
      {/* Fill light */}
      <directionalLight
        position={[-5, 8, -5]}
        intensity={0.08}
        color="#6b93d6"
      />
    </>
  );
}

export function Scene({ donations }: SceneProps) {
  return (
    <Canvas
      className="canvas-container"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      {/* Deep night sky */}
      <color attach="background" args={['#030812']} />

      <PerspectiveCamera makeDefault position={[0, 10, 18]} fov={45} />

      <Suspense fallback={<LoadingFallback />}>
        <Lights />

        {/* Starfield background */}
        <Stars
          radius={60}
          depth={60}
          count={2000}
          factor={3}
          saturation={0}
          fade
          speed={0.3}
        />

        {/* Snow effect */}
        <Snow count={800} />

        {/* Sweden terrain with city markers */}
        <SwedenTerrain />

        {/* Render candles for each donation */}
        {donations.map((donation) => (
          <Candle key={donation.id} donation={donation} />
        ))}

        {/* Subtle ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
          <planeGeometry args={[40, 45]} />
          <meshBasicMaterial
            color="#050a15"
            transparent
            opacity={0.8}
          />
        </mesh>
      </Suspense>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
        autoRotate
        autoRotateSpeed={0.2}
      />

      {/* Post-processing effects - reduced intensity for stability */}
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          intensity={0.6}
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
