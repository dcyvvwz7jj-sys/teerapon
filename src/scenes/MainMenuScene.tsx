'use client';
// ============================================================
// LEARN FIGHT — Main Menu Scene (With Manual)
// ============================================================
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/systems/GameStore';
import { RealisticFighter } from '@/components/three/RealisticFighter';
import { ShowroomLighting } from '@/components/three/AdvancedLighting';
import { CombatArenaEnvironment } from '@/components/three/ArenaBackgrounds';
import { PostProcessingStack } from '@/components/three/PostProcessingStack';

export default function MainMenuScene() {
  const setScene = useGameStore((s) => s.setScene);
  const settings = useGameStore((s) => s.settings);
  const [showManual, setShowManual] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, rgba(10,10,14,0.3) 0%, rgba(10,10,14,0.85) 100%), url("/backgrounds/main_menu.png") center/cover no-repeat', overflow: 'hidden' }}>
      {/* 3D Background Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0.3, 4.0]} fov={46} />
          <ShowroomLighting />
          <CombatArenaEnvironment />
          
          {/* Two fighters facing each other */}
          <group position={[-1.1, -0.85, 0]} rotation={[0, 0.85, 0]}>
            <RealisticFighter skinId="skin_01" animation="guard" scale={0.55} />
          </group>
          <group position={[1.1, -0.85, 0]} rotation={[0, -0.85, 0]}>
            <RealisticFighter skinId="skin_04" animation="guard" mirror scale={0.55} />
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px', pointerEvents: 'auto' }}>
          <button
            onClick={() => setScene('fighter_select')}
            className="game-btn primary"
            style={{ padding: '18px', fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700, borderRadius: '12px' }}
          >
            🔥 เริ่มเกม (START)
          </button>

          <button
            onClick={() => setShowManual(true)}
            className="game-btn secondary"
            style={{
              padding: '16px', fontSize: '16px', fontFamily: 'Orbitron', fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF', borderRadius: '12px', cursor: 'pointer',
            }}
          >
            📖 คู่มือการเล่น (HOW TO PLAY)
          </button>
        </div>
      </div>

      {/* How to Play Manual Modal */}
      {showManual && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', pointerEvents: 'auto',
        }}>
          <div style={{
            background: '#151520', border: '2px solid #FF8C00', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '750px', maxHeight: '85vh', overflowY: 'auto', color: '#FFFFFF',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: '26px', color: '#FF8C00', margin: 0 }}>📖 คู่มือการเล่น LEARN FIGHT</h2>
              <button onClick={() => setShowManual(false)} style={{ background: 'none', border: 'none', color: '#FF4444', fontSize: '28px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter', lineHeight: 1.6 }}>
              <div>
                <h3 style={{ fontFamily: 'Orbitron', color: '#00BFFF', fontSize: '18px', marginBottom: '8px' }}>🏋️‍♂️ 1. การฝึกซ้อม (Training Hub)</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
                  ก่อนลงสนาม คุณสามารถเลือกเล่นมินิเกมด้านล่างจอเพื่ออัปเกรดค่าพลังได้:
                  <br />• <b>🥊 พลังหมัด / 🦵 พลังเตะ:</b> หยุดเกจในโซนสีเขียว เมื่อสำเร็จตัวละครจะออกหมัด/เตะโชว์ทันที
                  <br />• <b>⚡ ความเร็ว:</b> กดปุ่ม QTE ให้ทันเวลา เพื่อเพิ่มโอกาสคริติคอลและหลบหลีก
                  <br />• <b>🛡️ ความอึด:</b> คุมจังหวะเกจความดัน เพื่อเพิ่ม Max HP
                </p>
              </div>

              <div>
                <h3 style={{ fontFamily: 'Orbitron', color: '#FF0055', fontSize: '18px', marginBottom: '8px' }}>⚔️ 2. ระบบต่อสู้สไตล์ Dokapon (Turn-Based Combat)</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
                  การต่อสู้จะแบ่งเป็น <b>"เทิร์นฝ่ายโจมตี"</b> และ <b>"เทิร์นฝ่ายป้องกัน"</b> สลับกันตามสไตล์เกม Dokapon:
                </p>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  <b style={{ color: '#EF4444' }}>🔥 เมื่อคุณเป็นฝ่ายโจมตี เลือกได้ 3 ทาง:</b>
                  <br />• <b>💥 โจมตีหนัก (Strike):</b> ดาเมจมหาศาล! ชนะโจมตีเบาและตั้งการ์ด แต่ถ้าศัตรูเลือก "หลบหลีก" จะโดนสวนกลับยับ!
                  <br />• <b>⚡ โจมตีเบา (Attack):</b> ออกท่าเร็วและชัวร์! ชนะศัตรูที่เลือกหลบหลีก แต่จะโดนตั้งการ์ดกันได้
                  <br />• <b>✨ สกิลพิเศษ (Special):</b> ใช้ท่าไม้ตายประจำตัวหรือเวทมนตร์โจมตี
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  <b style={{ color: '#3B82F6' }}>🛡️ เมื่อคุณเป็นฝ่ายป้องกัน เลือกได้ 3 ทาง:</b>
                  <br />• <b>🛡️ ตั้งการ์ด (Defend):</b> ป้องกันโจมตีเบาได้ 100% และลดดาเมจโจมตีหนักได้ 70%
                  <br />• <b>💨 หลบหลีก (Counter):</b> หลบการโจมตีหนักได้อย่างสมบูรณ์และสวนกลับแรง 1.5 เท่า! แต่แพ้โจมตีเบา
                  <br />• <b>🎲✨ ป้องกันพิเศษ/วัดดวง (Miracle):</b> วัดดวงปาฏิหาริย์ หากพลังชีวิตเหลือน้อยจะมีโอกาสพลิกสถานการณ์สำเร็จ!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowManual(false)}
              style={{
                marginTop: '28px', width: '100%', padding: '14px', background: '#FF8C00', color: '#000',
                fontFamily: 'Orbitron', fontWeight: 800, fontSize: '16px', border: 'none', borderRadius: '10px', cursor: 'pointer',
              }}
            >
              เข้าใจแล้ว เริ่มเกมกันเลย!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
