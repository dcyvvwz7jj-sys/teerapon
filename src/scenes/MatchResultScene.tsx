'use client';
// ============================================================
// LEARN FIGHT — Match Result Celebration Scene
// ============================================================
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/systems/GameStore';
import { RealisticFighter } from '@/components/three/RealisticFighter';
import { ShowroomLighting } from '@/components/three/AdvancedLighting';
import { ShowroomEnvironment } from '@/components/three/ArenaBackgrounds';
import { motion } from 'framer-motion';

export default function MatchResultScene() {
  const combatState = useGameStore((s) => s.combatState);
  const setScene = useGameStore((s) => s.setScene);

  if (!combatState) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'white', fontFamily: 'Orbitron' }}>
        ไม่มีข้อมูลการต่อสู้ <button onClick={() => setScene('main_menu')}>กลับเมนู</button>
      </div>
    );
  }

  const isPlayerWinner = combatState.winner === 'player';
  const winnerFighter = isPlayerWinner ? combatState.playerFighter : combatState.opponentFighter;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0A0A0E', overflow: 'hidden' }}>
      
      {/* 3D Winner Spotlight Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0.2, 3.8]} fov={45} />
          <ShowroomLighting />
          <ShowroomEnvironment color={isPlayerWinner ? '#FFD700' : '#EF4444'} />
          
          <group position={[0, -0.85, 0]}>
            <RealisticFighter
              key={winnerFighter.id}
              skinId={winnerFighter.skinPreset || winnerFighter.skinId}
              animation="victory"
              scale={0.58}
            />
          </group>

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.91, 0]} receiveShadow>
            <circleGeometry args={[2.5, 32]} />
            <meshStandardMaterial color={isPlayerWinner ? '#102A1E' : '#2A1010'} roughness={0.3} metalness={0.7} />
          </mesh>

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2.0} maxPolarAngle={Math.PI / 2 + 0.05} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* UI Celebration Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between', padding: '48px 32px', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(10,10,15,0.85) 100%)',
      }}>
        {/* Banner */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ textAlign: 'center', pointerEvents: 'auto' }}
        >
          <h1 style={{
            fontFamily: 'Orbitron', fontSize: '80px', fontWeight: 900, margin: 0, letterSpacing: '4px',
            color: isPlayerWinner ? '#FFD700' : '#EF4444',
            textShadow: `0 0 40px ${isPlayerWinner ? '#FFD700' : '#EF4444'}`,
          }}>
            {isPlayerWinner ? 'VICTORY!' : 'DEFEAT'}
          </h1>
          <div style={{ fontFamily: 'Orbitron', fontSize: '24px', color: '#FFFFFF', marginTop: '8px' }}>
            ผู้ชนะ: <span style={{ color: isPlayerWinner ? '#22C55E' : '#EF4444', fontWeight: 800 }}>{winnerFighter.name}</span> ({combatState.method})
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            จบการต่อสู้ในรอบที่ {combatState.round} เทิร์นที่ {combatState.turn}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', pointerEvents: 'auto' }}>
          <button
            onClick={() => setScene('training_hub')}
            className="game-btn primary"
            style={{ padding: '16px 36px', fontSize: '18px', fontFamily: 'Orbitron', fontWeight: 700, borderRadius: '12px' }}
          >
            💪 ฝึกซ้อมต่อ (TRAINING HUB)
          </button>

          <button
            onClick={() => setScene('main_menu')}
            className="game-btn secondary"
            style={{
              padding: '16px 36px', fontSize: '16px', fontFamily: 'Orbitron', fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF', borderRadius: '12px', cursor: 'pointer',
            }}
          >
            🏠 กลับสู่เมนูหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
