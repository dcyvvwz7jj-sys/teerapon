'use client';
// ============================================================
// LEARN FIGHT — Fighter Select & Creation Scene
// ============================================================
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/systems/GameStore';
import { RealisticFighter, SKIN_PRESETS } from '@/components/three/RealisticFighter';
import { ShowroomLighting } from '@/components/three/AdvancedLighting';
import { ShowroomEnvironment } from '@/components/three/ArenaBackgrounds';
import StatBar from '@/components/ui/StatBar';
import { ABILITIES } from '@/data/constants';
import { AbilityId } from '@/types/game';

export default function FighterSelectScene() {
  const fighters = useGameStore((s) => s.fighters);
  const selectFighter = useGameStore((s) => s.selectFighter);
  const createFighter = useGameStore((s) => s.createFighter);
  const setScene = useGameStore((s) => s.setScene);

  const [tab, setTab] = useState<'roster' | 'create'>('roster');

  // Roster Tab State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentFighter = fighters[selectedIndex] || fighters[0];

  // Create Tab State
  const [customName, setCustomName] = useState('MY FIGHTER');
  const [customSkin, setCustomSkin] = useState('skin_01');
  const [customAbility, setCustomAbility] = useState<AbilityId>('crushing_blow');

  // Preview data based on active tab
  const previewSkin = tab === 'roster' ? (currentFighter?.skinPreset || currentFighter?.skinId || 'skin_01') : customSkin;
  const previewName = tab === 'roster' ? currentFighter?.name : customName || 'UNNAMED';
  const previewLevel = tab === 'roster' ? (currentFighter?.level || 1) : 1;
  const activeAbilityId = tab === 'roster' ? currentFighter?.ability : customAbility;
  const abilityInfo = ABILITIES.find((a) => a.id === activeAbilityId) || ABILITIES[0];

  const previewStats = tab === 'roster' && currentFighter ? currentFighter.stats : {
    punchPower: 2,
    kickPower: 2,
    reactionSpeed: 2,
    endurance: 2,
  };

  const handleConfirm = () => {
    if (tab === 'roster') {
      if (!currentFighter) return;
      selectFighter(currentFighter.id);
    } else {
      const nameToUse = customName.trim() || 'NEW FIGHTER';
      createFighter(nameToUse, customSkin, customAbility);
    }
    setScene('training_hub');
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, rgba(10,10,14,0.3) 0%, rgba(10,10,14,0.85) 100%), url("/backgrounds/fighter_select.png") center/cover no-repeat', display: 'flex', overflow: 'hidden' }}>
      
      {/* Left Panel: Tabs & Selection/Creation Controls */}
      <div style={{
        width: '340px', height: '100%', background: 'rgba(15, 15, 22, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.1)', padding: '24px 20px',
        display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '12px' }}>
          <button
            onClick={() => setTab('roster')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: 'Orbitron', fontWeight: 700, fontSize: '13px',
              background: tab === 'roster' ? '#FF8C00' : 'transparent',
              color: tab === 'roster' ? '#000' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}
          >
            📋 เลือกตัวละคร
          </button>
          <button
            onClick={() => setTab('create')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: 'Orbitron', fontWeight: 700, fontSize: '13px',
              background: tab === 'create' ? '#FF8C00' : 'transparent',
              color: tab === 'create' ? '#000' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}
          >
            ✨ สร้างนักสู้ใหม่
          </button>
        </div>

        {tab === 'roster' ? (
          /* Roster List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {fighters.map((f, i) => {
              const isSel = i === selectedIndex;
              const ab = ABILITIES.find((a) => a.id === f.ability);
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedIndex(i)}
                  style={{
                    padding: '14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                    background: isSel ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isSel ? '#FF8C00' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '26px' }}>{ab?.icon || '🥊'}</span>
                  <div>
                    <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '15px', color: isSel ? '#FF8C00' : '#FFFFFF' }}>
                      {f.name}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      {ab?.nameTH} • Lv.{f.level || 1}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Create Custom Fighter Form */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <div>
              <label style={{ fontFamily: 'Orbitron', fontSize: '12px', color: '#FF8C00', display: 'block', marginBottom: '6px' }}>
                ชื่อนักสู้ของคุณ (FIGHTER NAME)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                maxLength={12}
                placeholder="พิมพ์ชื่อนักสู้..."
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.5)', color: '#FFF', fontFamily: 'Orbitron', fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'Orbitron', fontSize: '12px', color: '#FF8C00', display: 'block', marginBottom: '6px' }}>
                เลือกสกินรูปร่าง (SKIN PRESET)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {Object.keys(SKIN_PRESETS).map((skinKey, idx) => {
                  const isSel = customSkin === skinKey;
                  const preset = SKIN_PRESETS[skinKey];
                  return (
                    <button
                      key={skinKey}
                      onClick={() => setCustomSkin(skinKey)}
                      style={{
                        height: '48px', borderRadius: '8px', cursor: 'pointer',
                        background: preset.skin, border: `3px solid ${isSel ? '#FF8C00' : 'transparent'}`,
                        boxShadow: isSel ? '0 0 10px #FF8C00' : 'none', position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      title={`Skin ${idx + 1}`}
                    >
                      <div style={{ width: '16px', height: '6px', background: preset.shorts, borderRadius: '2px' }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'Orbitron', fontSize: '12px', color: '#FF8C00', display: 'block', marginBottom: '6px' }}>
                เลือกสกิลพิเศษ (SPECIAL ABILITY)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ABILITIES.map((ab) => {
                  const isSel = customAbility === ab.id;
                  return (
                    <button
                      key={ab.id}
                      onClick={() => setCustomAbility(ab.id)}
                      style={{
                        padding: '10px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer',
                        background: isSel ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSel ? '#A855F7' : 'rgba(255,255,255,0.08)'}`,
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{ab.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '13px', color: isSel ? '#A855F7' : '#FFF' }}>
                          {ab.nameTH}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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

      {/* Center Panel: 3D Preview (Centered perfectly with scale 0.58) */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0.2, 3.8]} fov={45} />
          <ShowroomLighting />
          <ShowroomEnvironment color="#FF8C00" />
          
          <group position={[0, -0.85, 0]}>
            <RealisticFighter
              key={previewSkin + previewName}
              skinId={previewSkin}
              animation="idle"
              scale={0.58}
            />
          </group>

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.86, 0]} receiveShadow>
            <circleGeometry args={[2.5, 32]} />
            <meshStandardMaterial color="#1F1F2E" roughness={0.4} metalness={0.6} />
          </mesh>

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} maxPolarAngle={Math.PI / 2 + 0.05} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Right Panel: Fighter Stats & Details */}
      <div style={{
        width: '360px', height: '100%', background: 'rgba(15, 15, 22, 0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: '28px', color: '#FFFFFF', margin: 0 }}>
            {previewName}
          </h1>
          <div style={{ fontFamily: 'Inter', fontSize: '14px', color: '#00BFFF', marginTop: '4px' }}>
            ระดับ {previewLevel} Fighter {tab === 'create' && '(ตัวละครสร้างใหม่)'}
          </div>
        </div>

        {/* Stats Display */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
          <StatBar label="พลังหมัด (Punch Power)" value={previewStats.punchPower} color="#FF4444" />
          <StatBar label="พลังเตะ (Kick Power)" value={previewStats.kickPower} color="#FF8C00" />
          <StatBar label="ความเร็ว (Reaction Speed)" value={previewStats.reactionSpeed} color="#00BFFF" />
          <StatBar label="ความอึด (Endurance)" value={previewStats.endurance} color="#22C55E" />
        </div>

        {/* Special Ability Card */}
        {abilityInfo && (
          <div style={{
            padding: '20px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px', marginBottom: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{abilityInfo.icon}</span>
              <span style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', color: '#A855F7' }}>
                สกิลพิเศษ: {abilityInfo.nameTH}
              </span>
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
              {abilityInfo.descriptionTH}
            </p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          className="game-btn primary"
          style={{
            width: '100%', padding: '18px', fontSize: '18px', fontFamily: 'Orbitron', fontWeight: 700,
            borderRadius: '12px', cursor: 'pointer', background: '#FF8C00', color: '#000', border: 'none',
            boxShadow: '0 0 15px rgba(255, 140, 0, 0.4)', marginTop: '20px', transition: 'all 0.2s',
          }}
        >
          {tab === 'roster' ? 'ยืนยันเลือกตัวละครนี้' : '✨ สร้างและเริ่มฝึกซ้อมทันที'}
        </button>
      </div>
    </div>
  );
}
