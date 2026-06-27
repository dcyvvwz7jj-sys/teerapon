'use client';
// ============================================================
// LEARN FIGHT — Main Menu Scene
// ============================================================
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/systems/GameStore';
import { RealisticFighter } from '@/components/three/RealisticFighter';
import { ShowroomLighting } from '@/components/three/AdvancedLighting';
import { PostProcessingStack } from '@/components/three/PostProcessingStack';

export default function MainMenuScene() {
  const setScene = useGameStore((s) => s.setScene);
  const settings = useGameStore((s) => s.settings);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0A0A0E', overflow: 'hidden' }}>
      {/* 3D Background Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 1.5, 4.5]} fov={50} />
          <ShowroomLighting />
          
          {/* Two fighters facing each other */}
          <group position={[-1.2, -1, 0]} rotation={[0, 0.4, 0]}>
            <RealisticFighter skinId="skin_01" animation="guard" scale={1.1} />
          </group>
          <group position={[1.2, -1, 0]} rotation={[0, -0.4, 0]}>
            <RealisticFighter skinId="skin_04" animation="guard" mirror scale={1.1} />
          </group>

          {/* Floor grid / reflection plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#111118" roughness={0.3} metalness={0.8} />
          </mesh>

          <PostProcessingStack quality={settings?.quality || 'high'} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(10,10,15,0.8) 100%)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px', pointerEvents: 'auto' }}>
          <h1 style={{
            fontFamily: 'Orbitron', fontSize: '72px', fontWeight: 900,
            background: 'linear-gradient(135deg, #FF8C00 0%, #FF0055 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(255, 140, 0, 0.4)', margin: 0, letterSpacing: '4px',
          }}>
            LEARN FIGHT
          </h1>
          <p style={{ fontFamily: 'Orbitron', fontSize: '18px', color: '#00BFFF', letterSpacing: '6px', marginTop: '8px' }}>
            DOKAPON-STYLE TURN-BASED COMBAT
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px', pointerEvents: 'auto' }}>
          <button
            onClick={() => setScene('fighter_select')}
            className="game-btn primary"
            style={{ padding: '18px', fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700, borderRadius: '12px' }}
          >
            เริ่มเกม (START)
          </button>

          <button
            onClick={() => alert('สามารถตั้งค่าเสียงและคุณภาพกราฟิกได้ในเมนูภายในเกม')}
            className="game-btn secondary"
            style={{
              padding: '16px', fontSize: '16px', fontFamily: 'Orbitron', fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF', borderRadius: '12px', cursor: 'pointer',
            }}
          >
            ตั้งค่า (SETTINGS)
          </button>
        </div>
      </div>
    </div>
  );
}
