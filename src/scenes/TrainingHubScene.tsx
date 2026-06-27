'use client';
// ============================================================
// LEARN FIGHT — Training Hub Scene
// ============================================================
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/systems/GameStore';
import { RealisticFighter } from '@/components/three/RealisticFighter';
import { GymLighting } from '@/components/three/AdvancedLighting';
import StatBar from '@/components/ui/StatBar';
import TimingBarGame from '@/components/training/TimingBarGame';
import QTEGame from '@/components/training/QTEGame';
import EnduranceGame from '@/components/training/EnduranceGame';
import TrainingResult from '@/components/training/TrainingResult';
import type { TrainingResult as TrainingResultType } from '@/types/game';
import { ABILITIES, MAX_TRAINING_SESSIONS } from '@/data/constants';

type MinigameType = 'punch' | 'kick' | 'reaction' | 'endurance' | null;

export default function TrainingHubScene() {
  const selectedFighterId = useGameStore((s) => s.selectedFighterId);
  const fighters = useGameStore((s) => s.fighters);
  const applyTrainingResult = useGameStore((s) => s.applyTrainingResult);
  const selectOpponent = useGameStore((s) => s.selectOpponent);
  const startCombat = useGameStore((s) => s.startCombat);
  const setScene = useGameStore((s) => s.setScene);

  const player = fighters.find((f) => f.id === selectedFighterId) || fighters[0];
  const ability = ABILITIES.find((a) => a.id === player?.ability);
  const sessionsLeft = Math.max(0, MAX_TRAINING_SESSIONS - (player?.trainingSessions || 0));

  const [activeGame, setActiveGame] = useState<MinigameType>(null);
  const [lastResult, setLastResult] = useState<TrainingResultType | null>(null);

  const handleMinigameComplete = (res: TrainingResultType) => {
    setLastResult(res);
  };

  const handleContinueResult = () => {
    if (!lastResult || !player) return;
    applyTrainingResult(lastResult);
    setLastResult(null);
    setActiveGame(null);
  };

  const handleStartFight = () => {
    if (!player) return;
    // Pick random AI opponent excluding player
    const availableAIs = fighters.filter((f) => f.id !== player.id);
    const ai = availableAIs[Math.floor(Math.random() * availableAIs.length)] || fighters[0];
    
    selectOpponent(ai.id);
    startCombat(player.id, ai.id);
    setScene('combat');
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0D0D12', display: 'flex', overflow: 'hidden' }}>
      
      {/* Left Panel: Fighter Stats & Status */}
      <div style={{
        width: '360px', height: '100%', background: 'rgba(15, 15, 22, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: '28px', color: '#FFFFFF', margin: 0 }}>{player?.name}</h1>
            <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#FF8C00' }}>ระดับ {player?.level || 1} Fighter</div>
          </div>
          <div style={{
            padding: '8px 16px', background: 'rgba(255, 140, 0, 0.15)', border: '1px solid #FF8C00',
            borderRadius: '20px', fontFamily: 'Orbitron', fontWeight: 700, color: '#FF8C00', fontSize: '14px',
          }}>
            ⚡ {sessionsLeft} เซสชัน
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
          <StatBar label="พลังหมัด (Punch Power)" value={player?.stats.punchPower || 1} color="#FF4444" />
          <StatBar label="พลังเตะ (Kick Power)" value={player?.stats.kickPower || 1} color="#FF8C00" />
          <StatBar label="ความเร็ว (Reaction Speed)" value={player?.stats.reactionSpeed || 1} color="#00BFFF" />
          <StatBar label="ความอึด (Endurance)" value={player?.stats.endurance || 1} color="#22C55E" />
        </div>

        {/* Ability info */}
        {ability && (
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: 'auto', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '14px', color: '#A855F7', marginBottom: '4px' }}>
              ✨ {ability.nameTH}
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {ability.descriptionTH}
            </div>
          </div>
        )}

        <button
          onClick={() => setScene('fighter_select')}
          style={{ padding: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontFamily: 'Orbitron', cursor: 'pointer' }}
        >
          ← เปลี่ยนตัวละคร
        </button>
      </div>

      {/* Center Panel: 3D Gym View */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 1.3, 3.5]} fov={45} />
          <GymLighting />
          
          {player && (
            <group position={[0, -0.9, 0]}>
              <RealisticFighter
                key={player.id}
                skinId={player.skinPreset}
                animation="idle"
                scale={1.05}
              />
            </group>
          )}

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.91, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#1E1A1D" roughness={0.6} />
          </mesh>

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} maxPolarAngle={Math.PI / 2 + 0.05} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Right Panel: Training Minigame Selector & Fight Button */}
      <div style={{
        width: '380px', height: '100%', background: 'rgba(15, 15, 22, 0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '22px', color: '#FFFFFF', marginBottom: '8px' }}>
          คอร์สฝึกซ้อมมินิเกม
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
          เลือกฝึกเพื่อเพิ่มค่าพลังก่อนลงสนามจริง (ใช้ 1 เซสชันต่อครั้ง)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'auto' }}>
          <button
            onClick={() => sessionsLeft > 0 && setActiveGame('punch')}
            disabled={sessionsLeft <= 0}
            style={{
              padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: sessionsLeft > 0 ? 'pointer' : 'not-allowed',
              background: 'rgba(255, 68, 68, 0.15)', border: '2px solid #FF4444',
              display: 'flex', alignItems: 'center', gap: '16px', opacity: sessionsLeft > 0 ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: '32px' }}>🥊</span>
            <div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', color: '#FF4444' }}>ฝึกพลังหมัด (Timing Bar)</div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>หยุดเกจในโซนเขียวเพื่อเพิ่มพลังหมัด</div>
            </div>
          </button>

          <button
            onClick={() => sessionsLeft > 0 && setActiveGame('kick')}
            disabled={sessionsLeft <= 0}
            style={{
              padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: sessionsLeft > 0 ? 'pointer' : 'not-allowed',
              background: 'rgba(255, 140, 0, 0.15)', border: '2px solid #FF8C00',
              display: 'flex', alignItems: 'center', gap: '16px', opacity: sessionsLeft > 0 ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: '32px' }}>🦵</span>
            <div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', color: '#FF8C00' }}>ฝึกพลังเตะ (Timing Bar)</div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>หยุดเกจในโซนเขียวเพื่อเพิ่มพลังเตะ</div>
            </div>
          </button>

          <button
            onClick={() => sessionsLeft > 0 && setActiveGame('reaction')}
            disabled={sessionsLeft <= 0}
            style={{
              padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: sessionsLeft > 0 ? 'pointer' : 'not-allowed',
              background: 'rgba(0, 191, 255, 0.15)', border: '2px solid #00BFFF',
              display: 'flex', alignItems: 'center', gap: '16px', opacity: sessionsLeft > 0 ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: '32px' }}>⚡</span>
            <div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', color: '#00BFFF' }}>ฝึกความเร็ว (QTE Reaction)</div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>กดปุ่มทิศทางให้ทันเพื่อเพิ่มความเร็ว</div>
            </div>
          </button>

          <button
            onClick={() => sessionsLeft > 0 && setActiveGame('endurance')}
            disabled={sessionsLeft <= 0}
            style={{
              padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: sessionsLeft > 0 ? 'pointer' : 'not-allowed',
              background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22C55E',
              display: 'flex', alignItems: 'center', gap: '16px', opacity: sessionsLeft > 0 ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: '32px' }}>🛡️</span>
            <div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', color: '#22C55E' }}>ฝึกความอึด (Rhythm Endurance)</div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>คุมจังหวะเกจความดันเพื่อเพิ่มความอึด</div>
            </div>
          </button>
        </div>

        {/* Big Fight Button */}
        <button
          onClick={handleStartFight}
          className="game-btn primary"
          style={{
            width: '100%', padding: '20px', fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 800,
            background: 'linear-gradient(135deg, #FF0055 0%, #FF8C00 100%)', borderRadius: '12px',
            boxShadow: '0 0 24px rgba(255, 0, 85, 0.5)', border: 'none', color: '#FFFFFF', cursor: 'pointer',
          }}
        >
          🔥 เข้าสู่ลานประลอง (FIGHT!)
        </button>
      </div>

      {/* Minigame Overlays */}
      {activeGame === 'punch' && player && (
        <TimingBarGame trainingType="punch" currentStatLevel={player.stats.punchPower} onComplete={handleMinigameComplete} onCancel={() => setActiveGame(null)} />
      )}
      {activeGame === 'kick' && player && (
        <TimingBarGame trainingType="kick" currentStatLevel={player.stats.kickPower} onComplete={handleMinigameComplete} onCancel={() => setActiveGame(null)} />
      )}
      {activeGame === 'reaction' && player && (
        <QTEGame currentStatLevel={player.stats.reactionSpeed} onComplete={handleMinigameComplete} onCancel={() => setActiveGame(null)} />
      )}
      {activeGame === 'endurance' && player && (
        <EnduranceGame currentStatLevel={player.stats.endurance} onComplete={handleMinigameComplete} onCancel={() => setActiveGame(null)} />
      )}

      {/* Result Overlay */}
      {lastResult && (
        <TrainingResult
          result={lastResult}
          statNameTH={lastResult.type === 'punch' ? 'พลังหมัด' : lastResult.type === 'kick' ? 'พลังเตะ' : lastResult.type === 'reaction' ? 'ความเร็ว' : 'ความอึด'}
          onContinue={handleContinueResult}
        />
      )}
    </div>
  );
}
