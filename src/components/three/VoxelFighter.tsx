'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getAnimation } from '@/systems/AnimationSystem';

export interface VoxelFighterProps {
  skinColors?: any;
  animation?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  mirror?: boolean;
}

export const DEFAULT_COLORS = { head: '#e0ac69', body: '#222', arms: '#e0ac69', legs: '#111', gloves: '#AA0000' };

export const SKIN_PRESETS: Record<string, { head: string; body: string; arms: string; legs: string; gloves: string; bodyType: 'balanced' | 'heavy' | 'slim' | 'huge_arms' }> = {
  skin_01: { head: '#e0ac69', body: '#DD0000', arms: '#e0ac69', legs: '#FFFFFF', gloves: '#AA0000', bodyType: 'balanced' },
  skin_02: { head: '#222222', body: '#444455', arms: '#222222', legs: '#111111', gloves: '#00FFFF', bodyType: 'slim' },
  skin_03: { head: '#8B4513', body: '#FFD700', arms: '#8B4513', legs: '#222222', gloves: '#FFD700', bodyType: 'balanced' },
  skin_04: { head: '#e0ac69', body: '#FFAA00', arms: '#e0ac69', legs: '#FFFFFF', gloves: '#FFAA00', bodyType: 'heavy' },
  skin_05: { head: '#111111', body: '#111111', arms: '#111111', legs: '#111111', gloves: '#222222', bodyType: 'slim' },
  skin_06: { head: '#FF00FF', body: '#00FFFF', arms: '#FF00FF', legs: '#0000FF', gloves: '#FF00FF', bodyType: 'heavy' },
  skin_07: { head: '#6b4423', body: '#222222', arms: '#6b4423', legs: '#550000', gloves: '#111111', bodyType: 'huge_arms' },
};

export function getSkinColors(skinId: string) {
  return SKIN_PRESETS[skinId] || DEFAULT_COLORS;
}

// Reusable organic limb component using Capsule for realistic smooth muscles
function MannequinLimb({ color, length, radiusTop, radiusBottom, position: pos, name: n, isArm = false, gloveColor = '' }: any) {
  // We use CapsuleGeometry which takes (radius, length, capSegments, radialSegments)
  // To approximate tapering, we just use an average radius.
  const avgRadius = (radiusTop + radiusBottom) / 2;
  const capsuleLength = length - avgRadius * 2; // Subtract caps
  
  return (
    <group position={pos} name={n}>
      {/* Joint sphere at top for smooth blending */}
      <mesh castShadow receiveShadow position={[0, length/2, 0]}>
        <sphereGeometry args={[radiusTop * 1.05, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      
      {/* Limb segment (Capsule) */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[avgRadius, capsuleLength > 0 ? capsuleLength : 0.1, 16, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Joint/Glove at bottom */}
      {isArm ? (
        <mesh position={[0, -length/2 - 0.05, 0]} castShadow>
          <sphereGeometry args={[radiusBottom * 1.5, 32, 32]} />
          <meshStandardMaterial color={gloveColor} roughness={0.3} metalness={0.2} />
        </mesh>
      ) : (
        <mesh castShadow receiveShadow position={[0, -length/2, 0]}>
          <sphereGeometry args={[radiusBottom * 1.05, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

export function VoxelFighter({ skinColors, animation = 'idle', position: pos = [0, 0, 0], rotation = [0, 0, 0], scale = 1, mirror = false, skinId }: VoxelFighterProps & { skinId?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  
  const preset = skinId ? SKIN_PRESETS[skinId] : null;
  const colors = preset || (skinColors || DEFAULT_COLORS);
  const bodyType = preset?.bodyType || 'balanced';

  // Base sizing logic to retain animation skeleton compatibility
  const s = 0.09;
  
  let torsoW = 8*s;
  let torsoH = 12*s;
  let torsoD = 4*s;
  
  let armW = 3*s;
  let armH = 12*s;
  
  let legW = 3.5*s;
  let legH = 12*s;

  if (bodyType === 'heavy') {
    torsoW *= 1.8;
    torsoD *= 1.5;
    armW *= 1.4;
    legW *= 1.5;
    torsoH *= 0.9;
  } else if (bodyType === 'slim') {
    torsoW *= 0.7;
    torsoD *= 0.7;
    armW *= 0.6;
    legW *= 0.7;
    legH *= 1.3;
    torsoH *= 1.1;
  } else if (bodyType === 'huge_arms') {
    armW *= 2.0;
    torsoW *= 1.3;
    torsoH *= 1.1;
    legW *= 0.8;
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

  return (
    <group ref={groupRef} position={pos} rotation={rotation as unknown as THREE.Euler} scale={mirror ? [-scale, scale, scale] : [scale, scale, scale]}>
      <group name="Root">
        <group name="Spine" position={[0, legH + torsoH/2, 0]}>
          {/* Detailed Torso (Capsule) */}
          <mesh castShadow receiveShadow name="BodyMesh">
            <capsuleGeometry args={[torsoW/1.5, torsoH - torsoW/1.5, 16, 32]} />
            <meshStandardMaterial color={colors.body} roughness={0.5} />
          </mesh>
          
          <group name="Head" position={[0, torsoH/2 + 3*s, 0]}>
            {/* Realistic Head Shape */}
            <mesh castShadow name="HeadMesh">
              <sphereGeometry args={[4.5*s, 32, 32]} />
              <meshStandardMaterial color={colors.head} roughness={0.3} />
            </mesh>
          </group>

          {/* Connectors for shoulders to blend the arms */}
          <mesh castShadow position={[torsoW/1.8, torsoH/2 - armW, 0]}>
            <sphereGeometry args={[armW * 1.2, 32, 32]} />
            <meshStandardMaterial color={colors.arms} roughness={0.4} />
          </mesh>
          <mesh castShadow position={[-torsoW/1.8, torsoH/2 - armW, 0]}>
            <sphereGeometry args={[armW * 1.2, 32, 32]} />
            <meshStandardMaterial color={colors.arms} roughness={0.4} />
          </mesh>

          <group name="LeftArm" position={[torsoW/1.5 + armW, torsoH/2 - armW, 0]}>
            <MannequinLimb 
              color={colors.arms} length={armH} 
              radiusTop={armW} radiusBottom={armW*0.8} 
              position={[0, -armH/2, 0]} name="LeftArmMesh" 
              isArm={true} gloveColor={colors.gloves || '#AA0000'}
            />
          </group>
          <group name="RightArm" position={[-(torsoW/1.5 + armW), torsoH/2 - armW, 0]}>
            <MannequinLimb 
              color={colors.arms} length={armH} 
              radiusTop={armW} radiusBottom={armW*0.8} 
              position={[0, -armH/2, 0]} name="RightArmMesh" 
              isArm={true} gloveColor={colors.gloves || '#AA0000'}
            />
          </group>
        </group>

        <group name="LeftLeg" position={[torsoW/3, legH, 0]}>
          <MannequinLimb 
            color={colors.legs} length={legH} 
            radiusTop={legW} radiusBottom={legW*0.8} 
            position={[0, -legH/2, 0]} name="LeftLegMesh" 
          />
        </group>
        <group name="RightLeg" position={[-torsoW/3, legH, 0]}>
          <MannequinLimb 
            color={colors.legs} length={legH} 
            radiusTop={legW} radiusBottom={legW*0.8} 
            position={[0, -legH/2, 0]} name="RightLegMesh" 
          />
        </group>
      </group>
    </group>
  );
}
