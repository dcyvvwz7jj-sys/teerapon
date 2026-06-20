'use client';

import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
  size: number;
}

export interface ParticleManagerRef {
  emitImpact: (position: THREE.Vector3, type: 'sweat' | 'spark', intensity: number) => void;
}

export const ParticleManager = forwardRef<ParticleManagerRef>((props, ref) => {
  const MAX_PARTICLES = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<Particle[]>([]);
  const dummy = new THREE.Object3D();

  useImperativeHandle(ref, () => ({
    emitImpact: (position: THREE.Vector3, type: 'sweat' | 'spark', intensity: number) => {
      const count = type === 'spark' ? Math.floor(10 * intensity) : Math.floor(15 * intensity);
      for (let i = 0; i < count; i++) {
        if (particles.current.length >= MAX_PARTICLES) {
          particles.current.shift(); // remove oldest
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = (type === 'spark' ? 3 : 2) * Math.random() * intensity;
        
        particles.current.push({
          position: position.clone().add(new THREE.Vector3((Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2)),
          velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.random() * speed + 1, Math.sin(angle) * speed),
          life: 0,
          maxLife: type === 'spark' ? 0.3 + Math.random() * 0.2 : 0.5 + Math.random() * 0.5,
          color: type === 'spark' ? new THREE.Color(1, 0.5, 0).multiplyScalar(2) : new THREE.Color(0.8, 0.9, 1.0),
          size: type === 'spark' ? 0.05 : 0.03 + Math.random() * 0.02,
        });
      }
    }
  }));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Update particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life += delta;
      
      if (p.life >= p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }

      // Physics
      p.position.add(p.velocity.clone().multiplyScalar(delta));
      p.velocity.y -= 9.8 * delta; // Gravity
      
      // Update instance
      dummy.position.copy(p.position);
      const scale = p.size * (1 - p.life / p.maxLife);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, p.color);
    }

    // Hide unused instances
    for (let i = particles.current.length; i < MAX_PARTICLES; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
});
ParticleManager.displayName = 'ParticleManager';
