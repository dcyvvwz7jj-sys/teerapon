'use client';
// ============================================================
// LEARN FIGHT — Advanced Lighting Rigs
// ============================================================
import React from 'react';

export function GymLighting() {
  return (
    <group name="GymLightingRig">
      {/* Main warm overhead spot */}
      <spotLight
        position={[0, 8, 2]}
        intensity={15}
        angle={0.8}
        penumbra={0.5}
        color="#FFF5E1"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Side fill light */}
      <spotLight
        position={[-3, 6, 0]}
        intensity={8}
        angle={0.6}
        penumbra={0.6}
        color="#E1EFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Warm ambient bounce */}
      <ambientLight intensity={2.0} color="#FFE8D6" />
      {/* Window directional sunlight */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </group>
  );
}

export function ArenaLighting() {
  return (
    <group name="ArenaLightingRig">
      {/* 4 Ring SpotLights in square pattern */}
      <spotLight position={[-2, 10, -2]} intensity={12} angle={0.5} penumbra={0.4} color="#FFFFFF" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[2, 10, -2]} intensity={12} angle={0.5} penumbra={0.4} color="#FFFFFF" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-2, 10, 2]} intensity={12} angle={0.5} penumbra={0.4} color="#FFFFFF" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[2, 10, 2]} intensity={12} angle={0.5} penumbra={0.4} color="#FFFFFF" castShadow shadow-mapSize={[1024, 1024]} />

      {/* Red corner spot */}
      <spotLight position={[-4, 3, 0]} intensity={3.5} angle={0.7} penumbra={0.8} color="#FF2222" />
      {/* Blue corner spot */}
      <spotLight position={[4, 3, 0]} intensity={3.5} angle={0.7} penumbra={0.8} color="#2288FF" />

      {/* Low ambient for dramatic shadows */}
      <ambientLight intensity={0.5} color="#111827" />
    </group>
  );
}

export function ShowroomLighting() {
  return (
    <group name="ShowroomLightingRig">
      {/* Key light */}
      <spotLight
        position={[3, 5, 5]}
        intensity={12}
        angle={0.6}
        penumbra={0.5}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Fill light */}
      <directionalLight position={[-3, 3, -2]} intensity={2} color="#D8B4F8" />
      {/* Rim light */}
      <spotLight position={[-2, 4, -4]} intensity={6} angle={0.8} penumbra={0.5} color="#38BDF8" />
      {/* Studio ambient */}
      <ambientLight intensity={2.5} color="#F3F4F6" />
    </group>
  );
}
