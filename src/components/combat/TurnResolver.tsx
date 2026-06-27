'use client';
// ============================================================
// LEARN FIGHT — Turn Resolution Cinematic Display
// ============================================================
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TurnResult, CombatAction } from '@/types/game';

interface TurnResolverProps {
  result: TurnResult;
  playerName: string;
  opponentName: string;
  onComplete: () => void;
}

const ACTION_LABELS: Record<CombatAction, { label: string; icon: string; color: string }> = {
  heavy_strike: { label: 'โจมตีหนัก', icon: '💥', color: '#EF4444' },
  light_strike: { label: 'โจมตีเบา', icon: '⚡', color: '#EAB308' },
  defend:       { label: 'ตั้งการ์ด', icon: '🛡️', color: '#3B82F6' },
  dodge:        { label: 'หลบหลีก', icon: '💨', color: '#10B981' },
  special:      { label: 'ท่าไม้ตาย', icon: '✨', color: '#A855F7' },
};

export default function TurnResolver({ result, playerName, opponentName, onComplete }: TurnResolverProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pAct = ACTION_LABELS[result.playerAction];
  const oAct = ACTION_LABELS[result.aiAction];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      {/* Clash Header */}
      <div style={{ display: 'flex', gap: '60px', alignItems: 'center', marginBottom: '32px' }}>
        {/* Player Action Choice */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'Orbitron', fontSize: '14px', color: '#00BFFF', marginBottom: '8px' }}>{playerName}</div>
          <div style={{
            padding: '20px 32px', background: `${pAct.color}20`, border: `2px solid ${pAct.color}`,
            borderRadius: '16px', boxShadow: `0 0 20px ${pAct.color}40`,
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>{pAct.icon}</div>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '20px', color: pAct.color }}>{pAct.label}</div>
          </div>
        </motion.div>

        <div style={{ fontFamily: 'Orbitron', fontSize: '36px', fontWeight: 900, color: '#FFD700' }}>VS</div>

        {/* Opponent Action Choice */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'Orbitron', fontSize: '14px', color: '#EF4444', marginBottom: '8px' }}>{opponentName}</div>
          <div style={{
            padding: '20px 32px', background: `${oAct.color}20`, border: `2px solid ${oAct.color}`,
            borderRadius: '16px', boxShadow: `0 0 20px ${oAct.color}40`,
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>{oAct.icon}</div>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '20px', color: oAct.color }}>{oAct.label}</div>
          </div>
        </motion.div>
      </div>

      {/* Outcome Description */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
          padding: '20px 40px', borderRadius: '12px', textAlign: 'center', maxWidth: '600px',
        }}
      >
        <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '22px', color: '#FFFFFF', marginBottom: '12px' }}>
          {result.descriptionTH}
        </div>

        {/* Damage Numbers Display */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
          {result.playerDamageDealt > 0 && (
            <div style={{ fontFamily: 'Orbitron', fontSize: '20px', color: '#22C55E', fontWeight: 800 }}>
              {playerName} ทำดาเมจ: +{result.playerDamageDealt} {result.isCritical && '🔥 CRIT!'}
            </div>
          )}
          {result.playerDamageTaken > 0 && (
            <div style={{ fontFamily: 'Orbitron', fontSize: '20px', color: '#EF4444', fontWeight: 800 }}>
              {opponentName} ทำดาเมจ: +{result.playerDamageTaken}
            </div>
          )}
        </div>
      </motion.div>

      <div style={{ marginTop: '32px', fontFamily: 'Inter', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
        (คลิกที่หน้าจอเพื่อดำเนินการต่อ)
      </div>
    </motion.div>
  );
}
