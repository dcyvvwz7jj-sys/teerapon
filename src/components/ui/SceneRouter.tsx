'use client';
// ============================================================
// LEARN FIGHT — Master Scene Router
// ============================================================
import React from 'react';
import { useGameStore } from '@/systems/GameStore';
import MainMenuScene from '@/scenes/MainMenuScene';
import FighterSelectScene from '@/scenes/FighterSelectScene';
import TrainingHubScene from '@/scenes/TrainingHubScene';
import CombatScene from '@/scenes/CombatScene';
import MatchResultScene from '@/scenes/MatchResultScene';

export default function SceneRouter() {
  const scene = useGameStore((s) => s.scene);

  switch (scene) {
    case 'main_menu':
      return <MainMenuScene />;
    case 'fighter_select':
      return <FighterSelectScene />;
    case 'training_hub':
      return <TrainingHubScene />;
    case 'combat':
      return <CombatScene />;
    case 'match_result':
      return <MatchResultScene />;
    default:
      return <MainMenuScene />;
  }
}
