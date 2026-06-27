'use client';
// ============================================================
// LEARN FIGHT — Realistic Fighter 3D Component (PBR Overhaul)
// ============================================================
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getAnimation } from '@/systems/AnimationSystem';

export interface SkinColors {
  skin: string;
  hair: string;
  shorts: string;
  gloves: string;
  shoes: string;
  accent: string;
  bodyType: 'balanced' | 'heavy' | 'slim' | 'stocky' | 'athletic';
}

export interface RealisticFighterProps {
  skinId?: string;
  skinColors?: Partial<SkinColors>;
  animation?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  mirror?: boolean;
  onAnimationComplete?: () => void;
}

export const DEFAULT_COLORS: SkinColors = {
  skin: '#C68642',
  hair: '#1A1A1A',
  shorts: '#4A3728',
  gloves: '#CD7F32',
  shoes: '#222222',
  accent: '#8B6914',
  bodyType: 'heavy',
};

export const SKIN_PRESETS: Record<string, SkinColors> = {
  skin_01: { skin: '#C68642', hair: '#1A1A1A', shorts: '#4A3728', gloves: '#CD7F32', shoes: '#222222', accent: '#8B6914', bodyType: 'heavy' },    // KRONOS
  skin_02: { skin: '#F5DEB3', hair: '#000000', shorts: '#FFFFFF', gloves: '#00BFFF', shoes: '#111111', accent: '#00BFFF', bodyType: 'slim' },     // VORTEX
  skin_03: { skin: '#8D7B68', hair: '#2F4F4F', shorts: '#556B2F', gloves: '#708090', shoes: '#333333', accent: '#708090', bodyType: 'stocky' },   // AEGIS
  skin_04: { skin: '#C19A6B', hair: '#3B1A0E', shorts: '#1A1A1A', gloves: '#DC143C', shoes: '#1A1A1A', accent: '#FF4500', bodyType: 'athletic' }, // BLAZE
  skin_05: { skin: '#D2B48C', hair: '#4B0082', shorts: '#2D1B4E', gloves: '#1A1A1A', shoes: '#0D0D0D', accent: '#9B30FF', bodyType: 'slim' },     // PHANTOM
  skin_06: { skin: '#5C4033', hair: '#000000', shorts: '#8B0000', gloves: '#1A1A1A', shoes: '#1A1A1A', accent: '#FF0000', bodyType: 'heavy' },    // RAZE
  skin_07: { skin: '#FAEBD7', hair: '#D4AF37', shorts: '#FFFFFF', gloves: '#FFD700', shoes: '#FFFFFF', accent: '#FFD700', bodyType: 'athletic' }, // SAGE
};

export function getSkinColors(skinId?: string): SkinColors {
  if (!skinId) return DEFAULT_COLORS;
  return SKIN_PRESETS[skinId] || DEFAULT_COLORS;
}

// Reusable anatomically shaped limb with PBR shaders
function RealisticLimb({
  color, length, radiusTop, radiusBottom, position: pos, name: n,
  isArm = false, gloveColor = '', shoeColor = '', accentColor = ''
}: {
  color: string; length: number; radiusTop: number; radiusBottom: number;
  position: [number, number, number]; name: string; isArm?: boolean;
  gloveColor?: string; shoeColor?: string; accentColor?: string;
}) {
  const avgRadius = (radiusTop + radiusBottom) / 2;
  const capsuleLength = Math.max(0.1, length - avgRadius * 2);

  return (
    <group position={pos} name={n}>
      {/* Shoulder / Hip Joint Sphere */}
      <mesh castShadow receiveShadow position={[0, length / 2, 0]}>
        <sphereGeometry args={[radiusTop * 1.05, 32, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.55} metalness={0.05} clearcoat={0.1} />
      </mesh>

      {/* Limb Muscle Segment (Capsule) */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[avgRadius, capsuleLength, 16, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.55} metalness={0.05} clearcoat={0.1} />
      </mesh>

      {/* Glowing Accent Band on Bicep/Thigh */}
      <mesh position={[0, length * 0.15, 0]}>
        <cylinderGeometry args={[avgRadius * 1.03, avgRadius * 1.03, length * 0.08, 32]} />
        <meshStandardMaterial color={accentColor || color} emissive={accentColor || '#000000'} emissiveIntensity={0.4} roughness={0.3} />
      </mesh>

      {/* Hand / Glove or Foot / Shoe */}
      {isArm ? (
        <group position={[0, -length / 2 - 0.06, 0]}>
          {/* Boxing Glove (PBR Leather shine) */}
          <mesh castShadow receiveShadow scale={[1.3, 1.4, 1.5]}>
            <sphereGeometry args={[radiusBottom * 1.4, 32, 32]} />
            <meshPhysicalMaterial color={gloveColor} roughness={0.25} metalness={0.3} clearcoat={0.8} clearcoatRoughness={0.1} />
          </mesh>
          {/* Glove Wrist Strap */}
          <mesh position={[0, radiusBottom * 0.8, 0]}>
            <cylinderGeometry args={[radiusBottom * 1.2, radiusBottom * 1.1, 0.08, 32]} />
            <meshStandardMaterial color="#111111" roughness={0.8} />
          </mesh>
        </group>
      ) : (
        <group position={[0, -length / 2 - 0.04, 0]}>
          {/* Shoe / Ankle Wrap */}
          <mesh castShadow receiveShadow scale={[1.1, 0.8, 1.4]} position={[0, 0, radiusBottom * 0.2]}>
            <boxGeometry args={[radiusBottom * 2.2, radiusBottom * 1.6, radiusBottom * 3]} />
            <meshPhysicalMaterial color={shoeColor || '#111111'} roughness={0.7} metalness={0.1} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function RealisticFighter({
  skinId,
  skinColors,
  animation = 'idle',
  position: pos = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  mirror = false,
}: RealisticFighterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  const preset = getSkinColors(skinId);
  const colors: SkinColors = { ...preset, ...skinColors };
  const bodyType = colors.bodyType;

  // Base proportions maintaining animation compatibility
  const s = 0.09;
  let torsoW = 8 * s;
  let torsoH = 12 * s;
  let torsoD = 4.5 * s;
  let armW = 3.2 * s;
  let armH = 12 * s;
  let legW = 3.8 * s;
  let legH = 12 * s;

  // Body type sculpting adjustments
  if (bodyType === 'heavy') {
    torsoW *= 1.6; torsoD *= 1.4; armW *= 1.35; legW *= 1.4; torsoH *= 0.95;
  } else if (bodyType === 'slim') {
    torsoW *= 0.8; torsoD *= 0.8; armW *= 0.75; legW *= 0.8; legH *= 1.15; torsoH *= 1.05;
  } else if (bodyType === 'stocky') {
    torsoW *= 1.7; torsoD *= 1.5; armW *= 1.3; legW *= 1.45; legH *= 0.85; torsoH *= 0.85;
  } else if (bodyType === 'athletic') {
    torsoW *= 1.2; armW *= 1.1; legW *= 1.1;
  }

  useEffect(() => {
    if (!groupRef.current) return;
    mixerRef.current = new THREE.AnimationMixer(groupRef.current);
  }, []);

  useEffect(() => {
    if (!mixerRef.current || !groupRef.current) return;
    const clip = getAnimation(animation);
    const newAction = mixerRef.current.clipAction(clip);

    const isOneShot = !['idle', 'guard', 'walk', 'walk_forward', 'walk_backward', 'circle_left', 'circle_right', 'defeat', 'victory'].includes(animation);
    if (isOneShot) {
      newAction.setLoop(THREE.LoopOnce, 1);
      newAction.clampWhenFinished = true;
    } else {
      newAction.setLoop(THREE.LoopRepeat, Infinity);
    }

    if (currentActionRef.current && currentActionRef.current !== newAction) {
      currentActionRef.current.fadeOut(0.2);
    }
    newAction.reset().fadeIn(0.2).play();
    currentActionRef.current = newAction;

    return () => {
      newAction.fadeOut(0.1);
    };
  }, [animation]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  // Calculate rotation as Euler safely
  const eulerRot = useMemo(() => new THREE.Euler(...rotation), [rotation]);

  return (
    <group ref={groupRef} position={pos} rotation={eulerRot} scale={mirror ? [-scale, scale, scale] : [scale, scale, scale]}>
      <group name="Root">
        <group name="Spine" position={[0, legH + torsoH / 2, 0]}>
          
          {/* Sculpted Torso with PBR Subsurface-like feel */}
          <mesh castShadow receiveShadow name="BodyMesh">
            <capsuleGeometry args={[torsoW / 1.4, Math.max(0.1, torsoH - torsoW / 1.4), 16, 32]} />
            <meshPhysicalMaterial color={colors.skin} roughness={0.55} metalness={0.05} clearcoat={0.15} />
          </mesh>

          {/* Boxing Shorts (Fabric roughness) */}
          <mesh castShadow receiveShadow position={[0, -torsoH * 0.28, 0]}>
            <cylinderGeometry args={[torsoW * 0.85, torsoW * 0.95, torsoH * 0.45, 32]} />
            <meshStandardMaterial color={colors.shorts} roughness={0.85} metalness={0.1} />
          </mesh>
          {/* Shorts Waistband with Accent Color */}
          <mesh position={[0, -torsoH * 0.05, 0]}>
            <cylinderGeometry args={[torsoW * 0.87, torsoW * 0.87, torsoH * 0.08, 32]} />
            <meshStandardMaterial color={colors.accent} roughness={0.4} metalness={0.3} />
          </mesh>

          {/* Head Group */}
          <group name="Head" position={[0, torsoH / 2 + 3.2 * s, 0]}>
            {/* Sculpted Head Sphere */}
            <mesh castShadow name="HeadMesh">
              <sphereGeometry args={[4.2 * s, 32, 32]} />
              <meshPhysicalMaterial color={colors.skin} roughness={0.5} metalness={0.05} clearcoat={0.2} />
            </mesh>
            {/* Hair / Headband */}
            <mesh position={[0, 1.8 * s, 0]}>
              <sphereGeometry args={[4.3 * s, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={colors.hair} roughness={0.9} />
            </mesh>
            {/* Glowing Eye Visor / Cybernetic Accent */}
            <mesh position={[0, 0.5 * s, 3.8 * s]}>
              <boxGeometry args={[5 * s, 1.2 * s, 1 * s]} />
              <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.8} roughness={0.2} />
            </mesh>
          </group>

          {/* Shoulder Connectors */}
          <mesh castShadow position={[torsoW / 1.6, torsoH / 2 - armW * 0.8, 0]}>
            <sphereGeometry args={[armW * 1.15, 32, 32]} />
            <meshPhysicalMaterial color={colors.skin} roughness={0.55} />
          </mesh>
          <mesh castShadow position={[-torsoW / 1.6, torsoH / 2 - armW * 0.8, 0]}>
            <sphereGeometry args={[armW * 1.15, 32, 32]} />
            <meshPhysicalMaterial color={colors.skin} roughness={0.55} />
          </mesh>

          {/* Left Arm */}
          <group name="LeftArm" position={[torsoW / 1.4 + armW * 0.9, torsoH / 2 - armW * 0.8, 0]}>
            <RealisticLimb
              color={colors.skin} length={armH} radiusTop={armW} radiusBottom={armW * 0.8}
              position={[0, -armH / 2, 0]} name="LeftArmMesh" isArm={true}
              gloveColor={colors.gloves} accentColor={colors.accent}
            />
          </group>

          {/* Right Arm */}
          <group name="RightArm" position={[-(torsoW / 1.4 + armW * 0.9), torsoH / 2 - armW * 0.8, 0]}>
            <RealisticLimb
              color={colors.skin} length={armH} radiusTop={armW} radiusBottom={armW * 0.8}
              position={[0, -armH / 2, 0]} name="RightArmMesh" isArm={true}
              gloveColor={colors.gloves} accentColor={colors.accent}
            />
          </group>
        </group>

        {/* Left Leg */}
        <group name="LeftLeg" position={[torsoW / 2.8, legH, 0]}>
          <RealisticLimb
            color={colors.skin} length={legH} radiusTop={legW} radiusBottom={legW * 0.8}
            position={[0, -legH / 2, 0]} name="LeftLegMesh" shoeColor={colors.shoes} accentColor={colors.accent}
          />
        </group>

        {/* Right Leg */}
        <group name="RightLeg" position={[-torsoW / 2.8, legH, 0]}>
          <RealisticLimb
            color={colors.skin} length={legH} radiusTop={legW} radiusBottom={legW * 0.8}
            position={[0, -legH / 2, 0]} name="RightLegMesh" shoeColor={colors.shoes} accentColor={colors.accent}
          />
        </group>
      </group>
    </group>
  );
}

// Backward compatibility alias so any file still importing VoxelFighter works!
export const VoxelFighter = RealisticFighter;
