'use client';
// ============================================================
// LEARN FIGHT — Combat HUD Overlay
// ============================================================
import React from 'react';
import { motion } from 'framer-motion';

interface HUDProps {
  playerName: string;
  opponentName: string;
  playerHP: number;
  playerMaxHP: number;
  opponentHP: number;
  opponentMaxHP: number;
  round: number;
  turn: number;
}

export default function HUD({
  playerName, opponentName, playerHP, playerMaxHP, opponentHP, opponentMaxHP, round, turn
}: HUDProps) {
  const pPercent = Math.max(0, Math.min(100, (playerHP / playerMaxHP) * 100));
  const oPercent = Math.max(0, Math.min(100, (opponentHP / opponentMaxHP) * 100));

  const getHPColor = (pct: number) => {
    if (pct > 50) return '#22C55E';
    if (pct > 25) return '#EAB308';
    return '#EF4444';
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 32px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      pointerEvents: 'none', zIndex: 40,
    }}>
      {/* Player HP Bar */}
      <div style={{ width: '40%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: '18px', color: '#00BFFF' }}>{playerName}</span>
          <span style={{ fontFamily: 'Orbitron', fontWeight: 600, fontSize: '16px', color: '#FFFFFF' }}>{playerHP} / {playerMaxHP}</span>
        </div>
        <div style={{
          width: '100%', height: '20px', background: 'rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden',
          transform: 'skewX(-15deg)',
        }}>
          <motion.div
            animate={{ width: `${pPercent}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%', background: getHPColor(pPercent),
              boxShadow: `0 0 10px ${getHPColor(pPercent)}`,
            }}
          />
        </div>
      </div>

      {/* Round & Turn Center Indicator */}
      <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.7)', padding: '8px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '14px', color: '#FFD700', letterSpacing: '2px' }}>ROUND {round}</div>
        <div style={{ fontFamily: 'Orbitron', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>TURN {turn}</div>
      </div>

      {/* Opponent HP Bar */}
      <div style={{ width: '40%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'Orbitron', fontWeight: 600, fontSize: '16px', color: '#FFFFFF' }}>{opponentHP} / {opponentMaxHP}</span>
          <span style={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: '18px', color: '#EF4444' }}>{opponentName}</span>
        </div>
        <div style={{
          width: '100%', height: '20px', background: 'rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden',
          transform: 'skewX(15deg)', display: 'flex', justifyContent: 'flex-end',
        }}>
          <motion.div
            animate={{ width: `${oPercent}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%', background: getHPColor(oPercent),
              boxShadow: `0 0 10px ${getHPColor(oPercent)}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
