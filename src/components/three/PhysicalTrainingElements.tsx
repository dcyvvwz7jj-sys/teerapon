'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, useSphericalJoint } from '@react-three/rapier';
import * as THREE from 'three';

export function PhysicalPunchingBag({ position }: { position: [number, number, number] }) {
  const anchorRef = useRef<RapierRigidBody>(null as any);
  const bagRef = useRef<RapierRigidBody>(null as any);

  useSphericalJoint(anchorRef, bagRef, [
    [0, 0, 0],
    [0, 1.2, 0]
  ]);

  // Expose impulse method to window for easy triggering from Animation loop
  useEffect(() => {
    (window as any).triggerBagImpulse = (force: number = 50) => {
      if (bagRef.current) {
        bagRef.current.applyImpulse({ x: 0, y: 0, z: -force }, true);
      }
    };
    return () => { delete (window as any).triggerBagImpulse; };
  }, []);

  return (
    <group position={position}>
      {/* Invisible anchor */}
      <RigidBody ref={anchorRef} type="fixed" position={[0, 1.5, 0]} colliders="ball">
        <mesh visible={false}>
          <sphereGeometry args={[0.1]} />
        </mesh>
      </RigidBody>

      {/* The physical bag */}
      <RigidBody ref={bagRef} type="dynamic" mass={50} colliders="hull" linearDamping={1.5} angularDamping={2.0}>
        <mesh position={[0, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 1.5, 12]} />
          <meshStandardMaterial color="#8B0000" roughness={0.7} />
        </mesh>
        {/* Chain visual */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.3} />
        </mesh>
      </RigidBody>
    </group>
  );
}

export function PhysicalKickBag({ position = [0, 1.5, 0] }: { position?: [number, number, number] }) {
  const bagRef = useRef<RapierRigidBody>(null);

  useEffect(() => {
    (window as any).triggerBagImpulse = (force: number = 80) => {
      if (bagRef.current) {
        // Kick bag gets hit higher/harder, tilts but springs back
        bagRef.current.applyImpulse({ x: 0, y: force * 0.2, z: -force }, true);
      }
    };
    return () => { delete (window as any).triggerBagImpulse; };
  }, []);

  return (
    <group position={position}>
      <RigidBody 
        ref={bagRef} 
        type="dynamic" 
        mass={100} 
        colliders="hull" 
        linearDamping={4} 
        angularDamping={8}
        lockTranslations
      >
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 1.8, 0.5]} />
          <meshStandardMaterial color="#660000" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
           <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
           <meshStandardMaterial color="#222" />
        </mesh>
      </RigidBody>
    </group>
  );
}
