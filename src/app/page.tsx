'use client';
// ============================================================
// LEARN FIGHT — Master Application Entry Point
// ============================================================
import React, { useEffect } from 'react';
import { useGameStore } from '@/systems/GameStore';
import SceneRouter from '@/components/ui/SceneRouter';

export default function Home() {
  const initializeGame = useGameStore((s) => s.initializeGame);
  const initialized = useGameStore((s) => s.initialized);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  if (!initialized) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#0A0A0E', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      }}>
        <div style={{
          fontFamily: 'Orbitron', fontSize: '36px', fontWeight: 900,
          background: 'linear-gradient(135deg, #FF8C00 0%, #FF0055 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'pulse 1.5s infinite',
        }}>
          LEARN FIGHT
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
          กำลังโหลดข้อมูลเกม...
        </div>
      </div>
    );
  }

  return <SceneRouter />;
}
