'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type CameraMode = 'orbit' | 'wide' | 'medium' | 'close' | 'dramatic' | 'creation';

interface CameraControllerProps {
  mode: CameraMode;
  target?: [number, number, number];
  shakeIntensity?: number;
}

export function CameraController({ mode, target = [0, 1, 0], shakeIntensity = 0 }: CameraControllerProps) {
  const { camera } = useThree();
  const timeRef = useRef(0);
  const targetPos = useRef(new THREE.Vector3(5, 2, 5));
  const targetLookAt = useRef(new THREE.Vector3(...target));

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    let camPos: THREE.Vector3;
    let lookAtOffset = new THREE.Vector3(0, 0, 0);

    switch (mode) {
      case 'creation':
        // Perfect framing for character creation, centered, fully visible
        camPos = new THREE.Vector3(0, 1.2, 3.5);
        lookAtOffset.set(0, 1.2, 0);
        break;
      case 'orbit':
        camPos = new THREE.Vector3(
          Math.sin(t * 0.2) * 4,
          2.0,
          Math.cos(t * 0.2) * 4
        );
        lookAtOffset.set(0, 1.0, 0);
        break;
      case 'wide':
        camPos = new THREE.Vector3(0, 2.5, 6.5);
        lookAtOffset.set(0, 1.2, 0);
        break;
      case 'medium':
        camPos = new THREE.Vector3(2.5, 1.8, 4.0);
        lookAtOffset.set(0, 1.2, 0);
        break;
      case 'close':
        camPos = new THREE.Vector3(1.5, 1.5, 2.5);
        lookAtOffset.set(0, 1.2, 0);
        break;
      case 'dramatic':
        camPos = new THREE.Vector3(0, 0.5, 3.5);
        lookAtOffset.set(0, 1.5, 0);
        break;
      default:
        camPos = new THREE.Vector3(0, 2, 5);
    }

    targetPos.current.lerp(camPos, 0.05);
    
    const finalTarget = new THREE.Vector3(...target).add(lookAtOffset);
    targetLookAt.current.lerp(finalTarget, 0.08);

    // Camera shake
    let shakeOffset = new THREE.Vector3(0, 0, 0);
    if (shakeIntensity > 0) {
      shakeOffset.set(
        (Math.random() - 0.5) * shakeIntensity * 0.05,
        (Math.random() - 0.5) * shakeIntensity * 0.05,
        (Math.random() - 0.5) * shakeIntensity * 0.02
      );
    }

    camera.position.copy(targetPos.current).add(shakeOffset);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
