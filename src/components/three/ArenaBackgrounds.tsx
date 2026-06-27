'use client';
// ============================================================
// LEARN FIGHT — Rich 3D Arena Backgrounds (Maximum Realism)
// ============================================================
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── 1. Cyberpunk Gym Environment (Training Hub) ───
export function GymEnvironment() {
  const ringRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.2;
    if (particlesRef.current) particlesRef.current.rotation.y -= delta * 0.05;
  });

  // Generate floating energy particles
  const particlePositions = React.useMemo(() => {
    const pos = new Float32Array(150 * 3);
    for (let i = 0; i < 150 * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 14;
      pos[i + 1] = Math.random() * 6 - 1;
      pos[i + 2] = (Math.random() - 0.5) * 14;
    }
    return pos;
  }, []);

  return (
    <group>
      {/* Neon Floor Grid */}
      <gridHelper args={[24, 24, '#FF8C00', '#2A2030']} position={[0, -0.85, 0]} />

      {/* Sci-Fi Corner Pillars */}
      {[-5, 5].map((x) =>
        [-5, 5].map((z) => (
          <group key={`${x}-${z}`} position={[x, 1.5, z]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.4, 5, 16]} />
              <meshStandardMaterial color="#1A1520" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Glowing LED Strip on Pillar */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 3, 16]} />
              <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={0.8} wireframe />
            </mesh>
          </group>
        ))
      )}

      {/* Rotating Holographic Gym Target Ring in background */}
      <group ref={ringRef} position={[0, 1.2, -4]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.05, 16, 64]} />
          <meshStandardMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={1.5} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]}>
          <torusGeometry args={[1.8, 0.03, 16, 64]} />
          <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Floating Energy Dust */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#FF8C00" transparent opacity={0.6} />
      </points>
    </group>
  );
}

// ─── 2. Dokapon Neon Stadium Environment (Combat Arena) ───
export function CombatArenaEnvironment() {
  const laserRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (laserRef.current) laserRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group>
      {/* Cyberpunk Fighting Ring Platform Grid */}
      <gridHelper args={[30, 30, '#EF4444', '#1A1A2E']} position={[0, -0.85, 0]} />

      {/* Outer Hexagonal Arena Boundary Pillars */}
      {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 7.5;
        const z = Math.sin(rad) * 7.5;
        return (
          <group key={idx} position={[x, 1.5, z]}>
            <mesh>
              <boxGeometry args={[0.6, 6, 0.6]} />
              <meshStandardMaterial color="#0F0F1A" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#EF4444' : '#3B82F6'} emissive={idx % 2 === 0 ? '#EF4444' : '#3B82F6'} emissiveIntensity={2} />
            </mesh>
          </group>
        );
      })}

      {/* Rotating Laser Light Show Beams */}
      <group ref={laserRef} position={[0, 4, 0]}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
          <mesh key={i} rotation={[0, rot, Math.PI / 4]} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.15, 12, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#EF4444' : '#EAB308'} transparent opacity={0.25} />
          </mesh>
        ))}
      </group>

      {/* Holographic Arena Banner Rings */}
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.5, 4.7, 64]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.8, 7.0, 64]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ─── 3. Showroom Spotlight Environment (Fighter Select & Winner Showcase) ───
export function ShowroomEnvironment({ color = '#FFD700' }: { color?: string }) {
  const pedestalRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (pedestalRef.current) pedestalRef.current.rotation.z += delta * 0.5;
  });

  return (
    <group>
      {/* Glowing Pedestal Ring */}
      <mesh ref={pedestalRef} position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.4, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.85, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Background Digital Equalizer Pillars */}
      {[-3, -1.5, 0, 1.5, 3].map((x, idx) => (
        <mesh key={idx} position={[x, 0.5 + Math.sin(idx) * 0.5, -4]}>
          <boxGeometry args={[0.3, 3 + Math.cos(idx) * 1.5, 0.3]} />
          <meshStandardMaterial color="#151520" metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Soft Floor Grid */}
      <gridHelper args={[16, 16, color, '#1A1A24']} position={[0, -0.86, 0]} />
    </group>
  );
}
