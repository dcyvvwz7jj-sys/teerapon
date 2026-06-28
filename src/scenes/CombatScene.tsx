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
import { CombatArenaEnvironment } from '@/components/three/ArenaBackgrounds';
import { PostProcessingStack } from '@/components/three/PostProcessingStack';
import HUD from '@/components/ui/HUD';
import ActionSelector from '@/components/combat/ActionSelector';
import TurnResolver from '@/components/combat/TurnResolver';
import { chooseAIAction } from '@/systems/CombatAI';
import { resolveTurn } from '@/systems/TurnCombatEngine';
import { playPunchSound, playKickSound, playVictorySound, playDefeatSound, playUIClick } from '@/systems/AudioSystem';
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
    } else if (combatState.phase === 'intro') {
      const timer = setTimeout(() => {
        setCombatPhase('select_action');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [combatState, setScene, setCombatPhase]);

  if (!combatState) return null;

  const player = combatState.playerFighter;
  const ai = combatState.opponentFighter;
  const isPlayerAttacker = combatState.turn % 2 === 1;

  const handleSelectAction = (action: CombatAction) => {
    playUIClick();
    const aiAction = chooseAIAction(combatState, isPlayerAttacker);
    const result = resolveTurn(combatState, action, aiAction);

    // Trigger logical attack/defense animations
    if (action === 'heavy_strike') setPlayerAnim('hook');
    else if (action === 'light_strike') setPlayerAnim('jab');
    else if (action === 'dodge') setPlayerAnim('dodge_left');
    else if (action === 'defend') setPlayerAnim('block');
    else if (action === 'special') setPlayerAnim('spinning_kick');

    if (aiAction === 'heavy_strike') setAiAnim('overhand');
    else if (aiAction === 'light_strike') setAiAnim('cross');
    else if (aiAction === 'dodge') setAiAnim('dodge_right');
    else if (aiAction === 'defend') setAiAnim('block');
    else if (aiAction === 'special') setAiAnim('spinning_kick');

    // Delayed hit reactions for realism
    setTimeout(() => {
      if (result.outcome === 'player_hits' || result.outcome === 'player_counters') {
        setAiAnim('hit_head');
        playPunchSound(result.isCritical);
      } else if (result.outcome === 'opponent_hits' || result.outcome === 'opponent_counters') {
        setPlayerAnim('hit_head');
        playKickSound(result.isCritical);
      } else if (result.outcome === 'both_hit') {
        setPlayerAnim('hit_body');
        setAiAnim('hit_body');
        playKickSound(true);
      } else {
        playUIClick();
      }
    }, 450);

    applyTurnResult(result);
    setCombatPhase('resolving');
  };

  const handleResolverComplete = () => {
    // Reset to ready guard stance
    setPlayerAnim('guard');
    setAiAnim('guard');

    if (combatState.opponentHP <= 0) {
      setAiAnim('defeat');
      setPlayerAnim('victory');
      playVictorySound();
      setTimeout(() => {
        endCombat('player', 'KO');
        setScene('match_result');
      }, 1800);
    } else if (combatState.playerHP <= 0) {
      setPlayerAnim('defeat');
      setAiAnim('victory');
      playDefeatSound();
      setTimeout(() => {
        endCombat('opponent', 'KO');
        setScene('match_result');
      }, 1800);
    } else {
      setCombatPhase('select_action');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, rgba(5,5,10,0.3) 0%, rgba(5,5,10,0.85) 100%), url("/backgrounds/combat_arena.png") center/cover no-repeat', overflow: 'hidden' }}>
      
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

      {/* Intro VS Banner */}
      {combatState.phase === 'intro' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', pointerEvents: 'none',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: '64px', fontWeight: 900, color: '#FFD700', textShadow: '0 0 30px #FF0055', margin: 0 }}>
              ROUND {combatState.round} FIGHT!
            </h1>
            <p style={{ fontFamily: 'Orbitron', fontSize: '24px', color: '#FFFFFF' }}>
              {player.name} <span style={{ color: '#EF4444' }}>VS</span> {ai.name}
            </p>
          </div>
        </div>
      )}

      {/* 3D Combat Arena Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0.3, 3.8]} fov={46} />
          <ArenaLighting />
          <CombatArenaEnvironment />

          {/* Player Fighter (Left facing inward) */}
          <group position={[-1.1, -0.85, 0]} rotation={[0, 0.85, 0]}>
            <RealisticFighter
              key={player.id + playerAnim}
              skinId={player.skinPreset || player.skinId}
              animation={playerAnim}
              scale={0.55}
            />
          </group>

          {/* AI Opponent (Right facing inward) */}
          <group position={[1.1, -0.85, 0]} rotation={[0, -0.85, 0]}>
            <RealisticFighter
              key={ai.id + aiAnim}
              skinId={ai.skinPreset || ai.skinId}
              animation={aiAnim}
              mirror
              scale={0.55}
            />
          </group>

          <PostProcessingStack quality={settings?.quality || 'high'} combatActive={combatState.phase === 'resolving'} />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.05} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Action Selector Overlay (Always shows during select_action or intro) */}
      {(combatState.phase === 'select_action' || combatState.phase === 'intro') && (
        <ActionSelector
          abilityId={player.ability}
          onSelectAction={handleSelectAction}
          disabled={combatState.phase === 'intro'}
          isPlayerAttacker={isPlayerAttacker}
          playerSpecialUsed={combatState.playerSpecialUsed}
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
