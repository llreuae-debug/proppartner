// components/AntiGravityCanvas.tsx
"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Floating geometric wireframe core
function FloatingCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1.8}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          wireframe
          color="#ffffff"
          emissive="#333333"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

// Particle field reacting to mouse inertia & zero-g drift
function ZeroGravityParticles({ count = 250 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Generate initial particle positions and random velocity offsets
  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const off = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      off[i * 3] = (Math.random() - 0.5) * 0.005;
      off[i * 3 + 1] = Math.random() * 0.008 + 0.002; // upward anti-gravity drift
      off[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return [pos, off];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const array = positionsAttr.array as Float32Array;

    // Mouse pointer interactive influence
    const targetX = (state.pointer.x * viewport.width) / 6;
    const targetY = (state.pointer.y * viewport.height) / 6;

    for (let i = 0; i < count; i++) {
      // Apply upward anti-gravity drift
      array[i * 3 + 1] += offsets[i * 3 + 1];

      // Reset when particle drifts beyond upper boundary
      if (array[i * 3 + 1] > 7.5) {
        array[i * 3 + 1] = -7.5;
        array[i * 3] = (Math.random() - 0.5) * 15;
      }

      // Subtle parallax toward pointer
      array[i * 3] += (targetX - array[i * 3]) * 0.0005;
    }

    positionsAttr.needsUpdate = true;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#a1a1aa"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

export default function AntiGravityCanvas() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -5]} color="#71717a" intensity={1} />
        
        <FloatingCore />
        <ZeroGravityParticles count={300} />
      </Canvas>
    </div>
  );
}
