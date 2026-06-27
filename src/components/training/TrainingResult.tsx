'use client';
// ============================================================
// LEARN FIGHT — Unified Training Result Component
// ============================================================
import React from 'react';
import { motion } from 'framer-motion';
import type { TrainingResult as TrainingResultType } from '@/types/game';
import { playUIClick } from '@/systems/AudioSystem';

interface TrainingResultProps {
  result: TrainingResultType;
  statNameTH: string;
  onContinue: () => void;
}

export default function TrainingResult({ result, statNameTH, onContinue }: TrainingResultProps) {
  const grade = result.grade;
  const gradeColor = grade === 'S' ? '#FFD700' : grade === 'A' ? '#22C55E' : grade === 'B' ? '#3B82F6' : grade === 'C' ? '#EAB308' : '#EF4444';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 60,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      }}
    >
      <h2 style={{ fontFamily: 'Orbitron', fontSize: '28px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
        สรุปผลการฝึกซ้อม
      </h2>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        style={{
          fontFamily: 'Orbitron', fontSize: '96px', fontWeight: 900,
          color: gradeColor, textShadow: `0 0 50px ${gradeColor}`, margin: '20px 0',
        }}
      >
        {grade}
      </motion.div>

      <p style={{ fontFamily: 'Orbitron', fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
        คะแนนรวม: {result.score} / {result.maxScore}
      </p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          padding: '16px 32px', background: 'rgba(255,255,255,0.05)',
          border: `2px solid ${result.statGain > 0 ? '#22C55E' : '#EF4444'}`,
          borderRadius: '12px', marginBottom: '36px', textAlign: 'center',
        }}
      >
        <span style={{ fontFamily: 'Inter', fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
          ค่าพลัง {statNameTH}:{' '}
        </span>
        <span style={{
          fontFamily: 'Orbitron', fontSize: '24px', fontWeight: 800,
          color: result.statGain > 0 ? '#22C55E' : '#EF4444',
        }}>
          {result.statGain > 0 ? `+${result.statGain}` : 'ไม่เพิ่มขึ้น'}
        </span>
      </motion.div>

      <button
        className="game-btn primary"
        onClick={() => { playUIClick(); onContinue(); }}
        style={{ fontSize: '20px', padding: '16px 48px', cursor: 'pointer' }}
      >
        ดำเนินการต่อ (ตกลง)
      </button>
    </motion.div>
  );
}
