'use client';
// ============================================================
// LEARN FIGHT — Reusable Segmented Stat Bar
// ============================================================
import React from 'react';
import { motion } from 'framer-motion';
import { STAT_MAX } from '@/data/constants';

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export default function StatBar({ label, value, max = STAT_MAX, color = '#FF6B00' }: StatBarProps) {
  const segments = Array.from({ length: max }, (_, i) => i);

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px', fontFamily: 'Inter' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
        <span style={{ fontFamily: 'Orbitron', fontWeight: 700, color: '#FFFFFF' }}>{value} / {max}</span>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {segments.map((seg) => {
          const isFilled = value >= seg + 1;
          const isPartial = !isFilled && value > seg;
          const partialFill = isPartial ? (value - seg) * 100 : 0;

          return (
            <div
              key={seg}
              style={{
                flex: 1,
                height: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isFilled && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  style={{
                    height: '100%',
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
              )}
              {isPartial && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${partialFill}%` }}
                  style={{
                    height: '100%',
                    background: color,
                    opacity: 0.7,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
