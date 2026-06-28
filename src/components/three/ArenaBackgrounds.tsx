'use client';
// ============================================================
// LEARN FIGHT — Rich 3D Arena Backgrounds (Overhauled with 3D Depth & Dimension)
// ============================================================
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── 1. Cyberpunk Gym Environment (Training Hub) ───
export function GymEnvironment() {
  const ringsRef = useRef<THREE.Group>(null);
  const droneRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.25;
      ringsRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    }
    if (droneRef.current) {
      droneRef.current.position.y = 1.8 + Math.sin(t * 1.5) * 0.3;
      droneRef.current.rotation.y += delta * 0.8;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.04;
    }
  });

  // Floating energy dust particles
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(200 * 3);
    for (let i = 0; i < 200 * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 16;
      pos[i + 1] = Math.random() * 7 - 1;
      pos[i + 2] = (Math.random() - 0.5) * 16;
    }
    return pos;
  }, []);

  return (
    <group>
      {/* 3D Training Platform Stage */}
      <mesh position={[0, -0.95, 0]} receiveShadow>
        <cylinderGeometry args={[5.5, 6.0, 0.2, 32]} />
        <meshStandardMaterial color="#12121A" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Glowing Neon Edge Ring */}
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.3, 5.5, 64]} />
        <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.0, 3.08, 64]} />
        <meshStandardMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={1.2} />
      </mesh>

      {/* Neon Floor Grid */}
      <gridHelper args={[30, 30, '#FF8C00', '#1F1A2C']} position={[0, -0.85, 0]} />

      {/* High-Tech Cyber Pillars with Energy Bars */}
      {[-5.5, 5.5].map((x) =>
        [-5.5, 5.5].map((z) => (
          <group key={`${x}-${z}`} position={[x, 1.8, z]}>
            {/* Main Pillar Body */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.8, 5.5, 0.8]} />
              <meshStandardMaterial color="#151520" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Glowing Core Energy Strip */}
            <mesh position={[0, 0, x > 0 ? -0.41 : 0.41]}>
              <planeGeometry args={[0.3, 4.5]} />
              <meshStandardMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={2.0} side={THREE.DoubleSide} />
            </mesh>
            {/* Top Light Cap */}
            <mesh position={[0, 2.8, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={2.5} />
            </mesh>
          </group>
        ))
      )}

      {/* Background Rotating Holographic Gym Target Rings */}
      <group ref={ringsRef} position={[0, 1.8, -4.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.5, 0.06, 16, 64]} />
          <meshStandardMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={2.0} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]}>
          <torusGeometry args={[2.0, 0.04, 16, 64]} />
          <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={2.0} />
        </mesh>
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <torusGeometry args={[1.4, 0.03, 16, 64]} />
          <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* Floating Sci-Fi Training Drone */}
      <group ref={droneRef} position={[-3.5, 2.0, -2.0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#222230" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.32]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={3.0} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.02, 8, 32]} />
          <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Floating Energy Dust */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#FF8C00" transparent opacity={0.7} />
      </points>
    </group>
  );
}

// ─── 2. Dokapon Neon Stadium Environment (Combat Arena) ───
export function CombatArenaEnvironment() {
  const laserRef = useRef<THREE.Group>(null);
  const topRingsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (laserRef.current) laserRef.current.rotation.y += delta * 0.35;
    if (topRingsRef.current) {
      topRingsRef.current.rotation.y -= delta * 0.2;
      topRingsRef.current.position.y = 4.2 + Math.sin(t) * 0.15;
    }
  });

  return (
    <group>
      {/* 3D Octagonal Fighting Ring Platform Stage */}
      <mesh position={[0, -0.95, 0]} receiveShadow>
        <cylinderGeometry args={[6.5, 7.2, 0.3, 8]} />
        <meshStandardMaterial color="#1A111E" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Glowing Crimson Stage Border */}
      <mesh position={[0, -0.79, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 8]}>
        <ringGeometry args={[6.2, 6.45, 8]} />
        <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={2.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner Arena Battle Circle */}
      <mesh position={[0, -0.79, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.8, 4.0, 32]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Grid Floor below stage */}
      <gridHelper args={[36, 36, '#FF0055', '#151525']} position={[0, -0.85, 0]} />

      {/* Stadium Corner Light Towers & Energy Ropes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 6.3;
        const z = Math.sin(rad) * 6.3;
        const isMajor = idx % 2 === 0;
        return (
          <group key={idx} position={[x, 1.2, z]}>
            {/* Tower Post */}
            <mesh castShadow>
              <cylinderGeometry args={[0.2, 0.25, 4.2, 12]} />
              <meshStandardMaterial color="#0F0F1A" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Glowing Orb on top */}
            <mesh position={[0, 2.2, 0]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial
                color={isMajor ? '#FF0055' : '#FFD700'}
                emissive={isMajor ? '#FF0055' : '#FFD700'}
                emissiveIntensity={2.5}
              />
            </mesh>
          </group>
        );
      })}

      {/* Overhead Giant Chandelier Scoreboard Rings */}
      <group ref={topRingsRef} position={[0, 4.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.8, 0.12, 16, 64]} />
          <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={2.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <torusGeometry args={[3.6, 0.08, 16, 64]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* Sweeping Laser Searchlights */}
      <group ref={laserRef} position={[0, 0, 0]}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
          <group key={i} rotation={[0, rot, 0]}>
            <mesh position={[5.0, 3.0, 0]} rotation={[0, 0, Math.PI / 6]}>
              <cylinderGeometry args={[0.05, 0.6, 10, 16]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#FF0055' : '#FFD700'} transparent opacity={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// ─── 3. Showroom Spotlight Environment (Fighter Select & Main Menu) ───
export function ShowroomEnvironment({ color = '#FFD700' }: { color?: string }) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const crystalsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (outerRingRef.current) outerRingRef.current.rotation.z += delta * 0.4;
    if (innerRingRef.current) innerRingRef.current.rotation.z -= delta * 0.6;
    if (crystalsRef.current) {
      crystalsRef.current.rotation.y += delta * 0.15;
      crystalsRef.current.position.y = 1.5 + Math.sin(t * 1.2) * 0.2;
    }
  });

  return (
    <group>
      {/* Multi-Layered Cyber Pedestal Base */}
      <mesh position={[0, -0.95, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 3.2, 0.2, 32]} />
        <meshStandardMaterial color="#161622" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 32]} />
        <meshStandardMaterial color="#0D0D14" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Glowing Rotating Rings on Pedestal */}
      <mesh ref={innerRingRef} position={[0, -0.83, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.45, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={outerRingRef} position={[0, -0.83, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.25, 32]} />
        <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={1.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Futuristic Hexagonal Data Crystals in Background */}
      <group ref={crystalsRef} position={[0, 1.5, -3.2]}>
        {[-2.2, -1.1, 0, 1.1, 2.2].map((x, idx) => {
          const isCenter = idx === 2;
          return (
            <mesh key={idx} position={[x, Math.sin(idx) * 0.4, Math.abs(x) * 0.3]} rotation={[Math.PI / 6, idx * 0.2, 0]}>
              <octahedronGeometry args={[isCenter ? 0.6 : 0.4, 0]} />
              <meshStandardMaterial
                color={isCenter ? color : '#A855F7'}
                emissive={isCenter ? color : '#A855F7'}
                emissiveIntensity={1.5}
                roughness={0.1}
                metalness={0.9}
                wireframe={!isCenter}
              />
            </mesh>
          );
        })}
      </group>

      {/* Vertical Light Column Beams behind character */}
      {[-1.8, 1.8].map((x, idx) => (
        <mesh key={idx} position={[x, 2.5, -2.5]}>
          <cylinderGeometry args={[0.04, 0.04, 7, 16]} />
          <meshBasicMaterial color={idx === 0 ? color : '#A855F7'} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Floor Grid */}
      <gridHelper args={[24, 24, color, '#181824']} position={[0, -0.85, 0]} />
    </group>
  );
}
