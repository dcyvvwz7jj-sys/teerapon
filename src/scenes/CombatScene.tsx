'use client';
// ============================================================
// LEARN FIGHT — Turn-Based Combat Arena Scene
// ============================================================
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/systems/GameStore';
import { RealisticFighter } from '@/components/three/RealisticFighter';
import { ArenaLighting } from '@/components/three/AdvancedLighting';
import { PostProcessingStack } from '@/components/three/PostProcessingStack';
import HUD from '@/components/ui/HUD';
import ActionSelector from '@/components/combat/ActionSelector';
import TurnResolver from '@/components/combat/TurnResolver';
import { chooseAIAction } from '@/systems/CombatAI';
import { resolveTurn } from '@/systems/TurnCombatEngine';
import type { CombatAction } from '@/types/game';

export default function CombatScene() {
  const combatState = useGameStore((s) => s.combatState);
  const applyTurnResult = useGameStore((s) => s.applyTurnResult);
  const setCombatPhase = useGameStore((s) => s.setCombatPhase);
  const endCombat = useGameStore((s) => s.endCombat);
  const setScene = useGameStore((s) => s.setScene);
  const settings = useGameStore((s) => s.settings);

  const [playerAnim, setPlayerAnim] = useState('guard');
  const [aiAnim, setAiAnim] = useState('guard');

  useEffect(() => {
    if (!combatState) {
      setScene('training_hub');
    }
  }, [combatState, setScene]);

  if (!combatState) return null;

  const player = combatState.playerFighter;
  const ai = combatState.opponentFighter;

  const handleSelectAction = (action: CombatAction) => {
    const aiAction = chooseAIAction(combatState);
    const result = resolveTurn(combatState, action, aiAction);

    // Trigger dynamic strike animations
    if (action === 'heavy_strike') setPlayerAnim('hook');
    else if (action === 'light_strike') setPlayerAnim('jab');
    else if (action === 'dodge') setPlayerAnim('dodge_left');
    else if (action === 'defend') setPlayerAnim('block');

    if (aiAction === 'heavy_strike') setAiAnim('overhand');
    else if (aiAction === 'light_strike') setAiAnim('cross');
    else if (aiAction === 'dodge') setAiAnim('dodge_right');
    else if (aiAction === 'defend') setAiAnim('block');

    applyTurnResult(result);
    setCombatPhase('resolving');
  };

  const handleResolverComplete = () => {
    // Reset to idle/guard stance
    setPlayerAnim('guard');
    setAiAnim('guard');

    if (combatState.opponentHP <= 0) {
      setAiAnim('defeat');
      setPlayerAnim('victory');
      setTimeout(() => {
        endCombat('player', 'KO');
        setScene('match_result');
      }, 1500);
    } else if (combatState.playerHP <= 0) {
      setPlayerAnim('defeat');
      setAiAnim('victory');
      setTimeout(() => {
        endCombat('opponent', 'KO');
        setScene('match_result');
      }, 1500);
    } else {
      setCombatPhase('select_action');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#05050A', overflow: 'hidden' }}>
      
      {/* HUD Overlay */}
      <HUD
        playerName={player.name}
        opponentName={ai.name}
        playerHP={combatState.playerHP}
        playerMaxHP={combatState.playerMaxHP}
        opponentHP={combatState.opponentHP}
        opponentMaxHP={combatState.opponentMaxHP}
        round={combatState.round}
        turn={combatState.turn}
      />

      {/* 3D Combat Arena Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 1.4, 4.2]} fov={48} />
          <ArenaLighting />

          {/* Player Fighter (Left) */}
          <group position={[-1.3, -0.9, 0]} rotation={[0, 0.35, 0]}>
            <RealisticFighter
              key={player.id}
              skinId={player.skinPreset || player.skinId}
              animation={playerAnim}
              scale={1.05}
            />
          </group>

          {/* AI Opponent (Right) */}
          <group position={[1.3, -0.9, 0]} rotation={[0, -0.35, 0]}>
            <RealisticFighter
              key={ai.id}
              skinId={ai.skinPreset || ai.skinId}
              animation={aiAnim}
              mirror
              scale={1.05}
            />
          </group>

          {/* Ring Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.91, 0]} receiveShadow>
            <planeGeometry args={[16, 16]} />
            <meshStandardMaterial color="#11131A" roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Ring Ropes Border */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
            <ringGeometry args={[5.8, 6.0, 32]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
          </mesh>

          <PostProcessingStack quality={settings?.quality || 'high'} combatActive={combatState.phase === 'resolving'} />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.05} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Action Selector Overlay */}
      {combatState.phase === 'select_action' && (
        <ActionSelector
          abilityId={player.ability}
          onSelectAction={handleSelectAction}
        />
      )}

      {/* Turn Resolver Clash Overlay */}
      {combatState.phase === 'resolving' && combatState.currentTurnResult && (
        <TurnResolver
          result={combatState.currentTurnResult}
          playerName={player.name}
          opponentName={ai.name}
          onComplete={handleResolverComplete}
        />
      )}
    </div>
  );
}
