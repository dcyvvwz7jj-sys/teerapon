'use client';
// ============================================================
// LEARN FIGHT — Turn-Based Combat Action Selector UI
// ============================================================
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CombatAction, AbilityId } from '@/types/game';
import { ABILITIES } from '@/data/constants';

interface ActionSelectorProps {
  onSelectAction: (action: CombatAction) => void;
  abilityId: AbilityId;
  disabled?: boolean;
}

const ACTION_CONFIG: Record<CombatAction, { label: string; icon: string; desc: string; color: string }> = {
  heavy_strike: { label: 'โจมตีหนัก', icon: '💥', desc: 'รุนแรงแต่ช้า ชนะโจมตีเบา แพ้หลบหลีก', color: '#EF4444' },
  light_strike: { label: 'โจมตีเบา', icon: '⚡', desc: 'รวดเร็ว ชนะหลบหลีก แพ้ตั้งการ์ด', color: '#EAB308' },
  defend:       { label: 'ตั้งการ์ด', icon: '🛡️', desc: 'ป้องกันโจมตีเบา 100% ลดโจมตีหนัก 70%', color: '#3B82F6' },
  dodge:        { label: 'หลบหลีก', icon: '💨', desc: 'หลบโจมตีหนักแล้วสวนกลับ แพ้โจมตีเบา', color: '#10B981' },
  special:      { label: 'ใช้สกิลพิเศษ', icon: '✨', desc: 'เปิดใช้งานความสามารถพิเศษประจำตัวละคร', color: '#A855F7' },
};

const ACTIONS: CombatAction[] = ['heavy_strike', 'light_strike', 'defend', 'dodge', 'special'];

export default function ActionSelector({ onSelectAction, abilityId, disabled = false }: ActionSelectorProps) {
  const [selected, setSelected] = useState<CombatAction | null>(null);
  const [timeLeft, setTimeLeft] = useState(8);

  const ability = ABILITIES.find((a) => a.id === abilityId);

  useEffect(() => {
    if (disabled) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto select Defend on timeout
          onSelectAction(selected || 'defend');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [disabled, selected, onSelectAction]);

  const handleConfirm = () => {
    if (!selected || disabled) return;
    onSelectAction(selected);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(16px)',
        borderTop: '2px solid rgba(255,255,255,0.15)', padding: '24px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
    >
      {/* Top Header & Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '18px', color: '#FFFFFF' }}>
          เลือกการกระทำในเทิร์นนี้
        </div>
        <div style={{ fontFamily: 'Orbitron', fontSize: '20px', fontWeight: 800, color: timeLeft <= 3 ? '#EF4444' : '#EAB308' }}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '800px', marginBottom: '20px' }}>
        {ACTIONS.map((act) => {
          const cfg = ACTION_CONFIG[act];
          const isSelected = selected === act;
          const isSpecial = act === 'special';

          return (
            <motion.button
              key={act}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              onClick={() => !disabled && setSelected(act)}
              disabled={disabled}
              style={{
                flex: 1, padding: '16px 12px', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
                background: isSelected ? `${cfg.color}30` : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isSelected ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                boxShadow: isSelected ? `0 0 16px ${cfg.color}60` : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: '28px' }}>{isSpecial && ability ? ability.icon : cfg.icon}</span>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '15px', color: isSelected ? cfg.color : '#FFFFFF' }}>
                {isSpecial && ability ? ability.nameTH : cfg.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Tooltip & Confirm Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '800px', minHeight: '48px' }}>
        <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '60%' }}>
          {selected ? (
            selected === 'special' && ability ? (
              <span style={{ color: '#A855F7' }}>✨ {ability.nameTH}: {ability.descriptionTH}</span>
            ) : (
              <span style={{ color: ACTION_CONFIG[selected].color }}>👉 {ACTION_CONFIG[selected].desc}</span>
            )
          ) : (
            'คลิกเลือกท่าโจมตีหรือป้องกันที่ต้องการ'
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected || disabled}
          className="game-btn primary"
          style={{
            padding: '12px 36px', fontSize: '16px',
            opacity: !selected || disabled ? 0.5 : 1,
            cursor: !selected || disabled ? 'not-allowed' : 'pointer',
          }}
        >
          ยืนยันคำสั่ง
        </button>
      </div>
    </motion.div>
  );
}
