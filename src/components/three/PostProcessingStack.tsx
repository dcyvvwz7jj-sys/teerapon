'use client';
// ============================================================
// LEARN FIGHT — Post-Processing Stack (High-End Rendering)
// ============================================================
import React from 'react';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { Vector2 } from 'three';

interface PostProcessingStackProps {
  quality?: 'high' | 'medium' | 'low';
  combatActive?: boolean;
}

export function PostProcessingStack({ quality = 'high', combatActive = false }: PostProcessingStackProps) {
  if (quality === 'low') return null;

  const chromaticOffset = new Vector2(0.002, 0.002);

  try {
    return (
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.75}
          luminanceSmoothing={0.9}
        />
        <Vignette
          offset={0.3}
          darkness={0.65}
        />
        <ChromaticAberration
          offset={combatActive && quality === 'high' ? chromaticOffset : new Vector2(0, 0)}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    );
  } catch {
    // Fallback ifWebGL context or post-processing shader fails
    return null;
  }
}
