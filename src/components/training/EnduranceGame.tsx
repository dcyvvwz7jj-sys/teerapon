'use client';
// ============================================================
// LEARN FIGHT — Endurance Minigame (Rhythm/Pressure Gauge)
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrainingGrade, TrainingResult } from '@/types/game';

interface EnduranceGameProps {
  currentStatLevel: number;
  onComplete: (result: TrainingResult) => void;
  onCancel: () => void;
  onHitSuccess?: () => void;
}

function getGrade(score: number): TrainingGrade {
  if (score >= 95) return 'S';
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 30) return 'C';
  return 'F';
}

function getStatGain(grade: TrainingGrade): number {
  switch (grade) {
    case 'S': return 1.0;
    case 'A': return 0.7;
    case 'B': return 0.5;
    case 'C': return 0.2;
    case 'F': return 0;
  }
}

// Gauge zones
const ZONE_BLUE = { min: 0, max: 30, color: '#3B82F6', label: 'ช้าเกินไป' };
const ZONE_GREEN = { min: 30, max: 70, color: '#22C55E', label: 'พอดี!' };
const ZONE_RED = { min: 70, max: 100, color: '#EF4444', label: 'เร็วเกินไป' };

const GAME_DURATION = 15; // seconds

export default function EnduranceGame({ currentStatLevel, onComplete, onCancel, onHitSuccess }: EnduranceGameProps) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result'>('ready');
  const [gauge, setGauge] = useState(50); // 0–100
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [greenTime, setGreenTime] = useState(0);
  const [totalSamples, setTotalSamples] = useState(0);
  const [clickBurst, setClickBurst] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const lastClickRef = useRef<number>(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Difficulty: gauge decay rate increases with level
  const decayRate = 20 + currentStatLevel * 4; // units per second
  const boostPerClick = 8 - currentStatLevel * 0.5; // less boost at higher levels
  const overchargeRate = 3 + currentStatLevel * 0.5; // overshoot at higher levels

  const handleClick = useCallback(() => {
    if (phase !== 'playing') return;

    const now = performance.now();
    const timeSinceLast = now - lastClickRef.current;
    lastClickRef.current = now;

    // Rapid clicking = more gauge overshoot
    const clickSpeed = timeSinceLast < 150 ? overchargeRate : 0;

    setGauge((prev) => {
      const next = Math.min(100, prev + boostPerClick + clickSpeed);
      if (next >= ZONE_GREEN.min && next <= ZONE_GREEN.max) {
        onHitSuccess?.();
      }
      return next;
    });
    setClickBurst(true);
    setTimeout(() => setClickBurst(false), 100);

    // Combo tracking for visual feedback
    if (timeSinceLast < 500) {
      setComboCount((prev) => prev + 1);
    } else {
      setComboCount(1);
    }
  }, [phase, boostPerClick, overchargeRate]);

  // Main game loop
  useEffect(() => {
    if (phase !== 'playing') return;

    startTimeRef.current = performance.now();
    lastTimeRef.current = performance.now();

    const update = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Decay gauge
      setGauge((prev) => Math.max(0, prev - decayRate * dt));

      // Track time
      const elapsed = (time - startTimeRef.current) / 1000;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeRemaining(remaining);

      // Sample zone
      setTotalSamples((prev) => prev + 1);
      setGauge((current) => {
        if (current >= ZONE_GREEN.min && current <= ZONE_GREEN.max) {
          setGreenTime((prev) => prev + 1);
        }
        return current;
      });

      if (remaining <= 0) {
        setPhase('result');
        return;
      }

      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, decayRate]);

  // Keyboard/mouse
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') { onCancel(); return; }
      if (phase === 'ready' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        setPhase('playing');
        return;
      }
      if (phase === 'playing' && (e.code === 'Space' || e.code === 'KeyF')) {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleClick, onCancel]);

  // Calculate score
  const greenPercentage = totalSamples > 0 ? (greenTime / totalSamples) * 100 : 0;
  const finalScore = Math.round(greenPercentage);
  const grade = getGrade(finalScore);
  const statGain = getStatGain(grade);

  const handleFinish = () => {
    onComplete({
      type: 'endurance',
      grade,
      statGain,
      score: finalScore,
      maxScore: 100,
    });
  };

  // Current zone
  const currentZone = gauge < ZONE_GREEN.min ? 'blue' : gauge > ZONE_GREEN.max ? 'red' : 'green';
  const zoneColor = currentZone === 'blue' ? ZONE_BLUE.color : currentZone === 'red' ? ZONE_RED.color : ZONE_GREEN.color;

  return (
    <div
      onClick={phase === 'playing' ? handleClick : undefined}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '280px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 50,
        background: 'rgba(15, 15, 22, 0.95)', borderTop: '2px solid #22C55E',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.8)', padding: '16px',
        cursor: phase === 'playing' ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: '#22C55E', marginBottom: '16px' }}>
              ฝึกความอึด
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              คลิก/กด SPACE จังหวะสม่ำเสมอเพื่อรักษาเกจให้อยู่ในโซนสีเขียว
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              กดเร็วเกินไป → เข้าโซนแดง (ออกแรงเกิน)
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
              กดช้าเกินไป → เข้าโซนน้ำเงิน (แรงไม่พอ) — เวลา {GAME_DURATION} วินาที
            </p>
            <button className="game-btn primary" onClick={(e) => { e.stopPropagation(); setPhase('playing'); }}
              style={{ fontSize: '20px', padding: '16px 48px' }}>
              เริ่มฝึก (SPACE)
            </button>
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>

            {/* Timer */}
            <div style={{ fontFamily: 'Orbitron', fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '24px' }}>
              {Math.ceil(timeRemaining)}
            </div>

            {/* Vertical Gauge */}
            <div style={{
              position: 'relative', width: '80px', height: '300px', margin: '0 auto',
              background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
              border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden',
            }}>
              {/* Zone indicators */}
              <div style={{
                position: 'absolute', bottom: '70%', top: 0, left: 0, right: 0,
                background: 'rgba(239, 68, 68, 0.15)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              }} />
              <div style={{
                position: 'absolute', bottom: '30%', top: '30%', left: 0, right: 0,
                background: 'rgba(34, 197, 94, 0.15)',
                borderTop: '1px solid rgba(34, 197, 94, 0.3)',
                borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, top: '70%', left: 0, right: 0,
                background: 'rgba(59, 130, 246, 0.15)', borderTop: '1px solid rgba(59, 130, 246, 0.3)',
              }} />

              {/* Zone labels */}
              <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                fontFamily: 'Orbitron', fontSize: '8px', color: '#EF4444', opacity: 0.6 }}>RED</div>
              <div style={{ position: 'absolute', top: '47%', left: '50%', transform: 'translateX(-50%)',
                fontFamily: 'Orbitron', fontSize: '8px', color: '#22C55E', opacity: 0.6 }}>OK</div>
              <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
                fontFamily: 'Orbitron', fontSize: '8px', color: '#3B82F6', opacity: 0.6 }}>LOW</div>

              {/* Fill */}
              <motion.div
                animate={{ height: `${gauge}%` }}
                transition={{ duration: 0.05 }}
                style={{
                  position: 'absolute', bottom: 0, left: '4px', right: '4px',
                  background: `linear-gradient(to top, ${zoneColor}40, ${zoneColor}80)`,
                  borderRadius: '8px',
                }}
              />

              {/* Gauge line indicator */}
              <motion.div
                animate={{ bottom: `${gauge}%` }}
                transition={{ duration: 0.05 }}
                style={{
                  position: 'absolute', left: '-4px', right: '-4px', height: '3px',
                  background: zoneColor,
                  boxShadow: `0 0 12px ${zoneColor}`,
                  borderRadius: '2px',
                }}
              />
            </div>

            {/* Zone status */}
            <motion.div
              animate={{ scale: clickBurst ? 1.2 : 1 }}
              style={{
                marginTop: '24px', fontFamily: 'Orbitron', fontSize: '18px',
                color: zoneColor, fontWeight: 700,
              }}
            >
              {currentZone === 'blue' ? 'ช้าเกินไป! กดเร็วขึ้น!' :
               currentZone === 'red' ? 'เร็วเกินไป! ชะลอ!' : 'สมบูรณ์แบบ!'}
            </motion.div>

            {/* Green time tracker */}
            <div style={{
              marginTop: '16px', fontFamily: 'Orbitron', fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
            }}>
              โซนเขียว: {Math.round(greenPercentage)}%
            </div>

            <p style={{ marginTop: '16px', fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>
              คลิกหรือกด SPACE เป็นจังหวะ
            </p>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              ผลการฝึก
            </h2>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              style={{
                fontFamily: 'Orbitron', fontSize: '80px', fontWeight: 900,
                color: grade === 'S' ? '#FFD700' : grade === 'A' ? '#22C55E' : grade === 'B' ? '#3B82F6' : grade === 'C' ? '#EAB308' : '#EF4444',
                textShadow: `0 0 40px ${grade === 'S' ? '#FFD700' : grade === 'A' ? '#22C55E' : grade === 'B' ? '#3B82F6' : grade === 'C' ? '#EAB308' : '#EF4444'}`,
                margin: '16px 0',
              }}>
              {grade}
            </motion.div>

            <p style={{ fontFamily: 'Orbitron', fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              อยู่ในโซนเขียว: {Math.round(greenPercentage)}% ของเวลาทั้งหมด
            </p>
            <p style={{ fontFamily: 'Orbitron', fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              คะแนน: {finalScore}/100
            </p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{
                fontFamily: 'Orbitron', fontSize: '22px', fontWeight: 700,
                color: statGain > 0 ? '#22C55E' : '#EF4444', marginBottom: '32px',
              }}>
              {statGain > 0 ? `+${statGain} ความอึด` : 'ไม่ได้รับค่าพลัง'}
            </motion.p>

            <button className="game-btn primary" onClick={(e) => { e.stopPropagation(); handleFinish(); }}
              style={{ fontSize: '18px', padding: '14px 40px' }}>
              รับผล
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={(e) => { e.stopPropagation(); onCancel(); }} style={{
        position: 'absolute', top: '24px', right: '24px',
        background: 'none', border: '1px solid rgba(255,255,255,0.2)',
        color: 'rgba(255,255,255,0.5)', padding: '8px 16px',
        fontFamily: 'Orbitron', fontSize: '12px', cursor: 'pointer',
      }}>
        ยกเลิก (ESC)
      </button>
    </div>
  );
}
