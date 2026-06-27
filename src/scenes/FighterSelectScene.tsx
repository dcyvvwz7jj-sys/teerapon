'use client';
// ============================================================
// LEARN FIGHT — Fighter Select Scene
// ============================================================
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/systems/GameStore';
import { RealisticFighter } from '@/components/three/RealisticFighter';
import { ShowroomLighting } from '@/components/three/AdvancedLighting';
import StatBar from '@/components/ui/StatBar';
import { ABILITIES } from '@/data/constants';

export default function FighterSelectScene() {
  const fighters = useGameStore((s) => s.fighters);
  const selectFighter = useGameStore((s) => s.selectFighter);
  const setScene = useGameStore((s) => s.setScene);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentFighter = fighters[selectedIndex] || fighters[0];
  const ability = ABILITIES.find((a) => a.id === currentFighter?.ability);

  const handleSelect = () => {
    if (!currentFighter) return;
    selectFighter(currentFighter.id);
    setScene('training_hub');
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0A0A0E', display: 'flex', overflow: 'hidden' }}>
      
      {/* Left Panel: Fighter Roster Selection */}
      <div style={{
        width: '320px', height: '100%', background: 'rgba(15, 15, 22, 0.9)',
        borderRight: '1px solid rgba(255,255,255,0.1)', padding: '32px 20px',
        display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '22px', color: '#FF8C00', marginBottom: '24px' }}>
          เลือกตัวละคร
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
          {fighters.map((f, i) => {
            const isSel = i === selectedIndex;
            const ab = ABILITIES.find((a) => a.id === f.ability);
            return (
              <button
                key={f.id}
                onClick={() => setSelectedIndex(i)}
                style={{
                  padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                  background: isSel ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isSel ? '#FF8C00' : 'rgba(255,255,255,0.1)'}`,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px',
                }}
              >
                <span style={{ fontSize: '28px' }}>{ab?.icon || '🥊'}</span>
                <div>
                  <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', color: isSel ? '#FF8C00' : '#FFFFFF' }}>
                    {f.name}
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    {ab?.nameTH}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setScene('main_menu')}
          style={{
            marginTop: '16px', padding: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontFamily: 'Orbitron', cursor: 'pointer',
          }}
        >
          ← กลับสู่เมนูหลัก
        </button>
      </div>

      {/* Center Panel: 3D Preview */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 1.2, 3.2]} fov={45} />
          <ShowroomLighting />
          
          {currentFighter && (
            <group position={[0, -0.9, 0]}>
              <RealisticFighter
                key={currentFighter.id}
                skinId={currentFighter.skinPreset || currentFighter.skinId}
                animation="idle"
                scale={1.05}
              />
            </group>
          )}

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.91, 0]} receiveShadow>
            <circleGeometry args={[2, 32]} />
            <meshStandardMaterial color="#1F1F2E" roughness={0.4} metalness={0.6} />
          </mesh>

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} maxPolarAngle={Math.PI / 2 + 0.05} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Right Panel: Fighter Stats & Details */}
      <div style={{
        width: '360px', height: '100%', background: 'rgba(15, 15, 22, 0.9)',
        borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        {currentFighter && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: '#FFFFFF', margin: 0 }}>
                {currentFighter.name}
              </h1>
              <div style={{ fontFamily: 'Inter', fontSize: '14px', color: '#00BFFF', marginTop: '4px' }}>
                ระดับ {currentFighter.level || 1} Fighter
              </div>
            </div>

            {/* Stats Display */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
              <StatBar label="พลังหมัด (Punch Power)" value={currentFighter.stats.punchPower} color="#FF4444" />
              <StatBar label="พลังเตะ (Kick Power)" value={currentFighter.stats.kickPower} color="#FF8C00" />
              <StatBar label="ความเร็ว (Reaction Speed)" value={currentFighter.stats.reactionSpeed} color="#00BFFF" />
              <StatBar label="ความอึด (Endurance)" value={currentFighter.stats.endurance} color="#22C55E" />
            </div>

            {/* Special Ability Card */}
            {ability && (
              <div style={{
                padding: '20px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '12px', marginBottom: 'auto',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{ability.icon}</span>
                  <span style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', color: '#A855F7' }}>
                    สกิลพิเศษ: {ability.nameTH}
                  </span>
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                  {ability.descriptionTH}
                </p>
              </div>
            )}

            <button
              onClick={handleSelect}
              className="game-btn primary"
              style={{ width: '100%', padding: '18px', fontSize: '18px', fontFamily: 'Orbitron', fontWeight: 700, borderRadius: '12px' }}
            >
              ยืนยันเลือกตัวละครนี้
            </button>
          </>
        )}
      </div>
    </div>
  );
}
