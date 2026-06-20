'use client';

import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export function Skybox({ texturePath }: { texturePath: string }) {
  const texture = useLoader(THREE.TextureLoader, texturePath);
  
  // Create an equirectangular environment mapping
  const envMap = useMemo(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [texture]);

  return (
    <mesh>
      <sphereGeometry args={[200, 64, 64]} />
      <meshBasicMaterial map={envMap} side={THREE.BackSide} />
    </mesh>
  );
}
