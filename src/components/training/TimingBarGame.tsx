'use client';
// ============================================================
// LEARN FIGHT — Timing Bar Minigame (Punch/Kick Training)
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrainingGrade, TrainingResult, TrainingType } from '@/types/game';
import { playPunchSound, playKickSound, playVictorySound, playUIClick } from '@/systems/AudioSystem';

interface TimingBarGameProps {
  trainingType: 'punch' | 'kick';
  currentStatLevel: number; // 0–7
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

export default function TimingBarGame({ trainingType, currentStatLevel, onComplete, onCancel, onHitSuccess }: TimingBarGameProps) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result'>('ready');
  const [attempt, setAttempt] = useState(0);
  const [cursorPos, setCursorPos] = useState(0); // 0–100
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [sweetSpotStart, setSweetSpotStart] = useState(40);
  const [scores, setScores] = useState<number[]>([]);
  const [lastHitResult, setLastHitResult] = useState<'perfect' | 'good' | 'miss' | null>(null);
  const [frozen, setFrozen] = useState(false);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const MAX_ATTEMPTS = 3;

  // Difficulty scales with stat level
  const sweetSpotWidth = Math.max(8, 30 - currentStatLevel * 3.5);
  const cursorSpeed = 60 + currentStatLevel * 12; // pixels per second equivalent

  // Randomize sweet spot position for each attempt
  useEffect(() => {
    if (phase === 'playing' && !frozen) {
      const margin = sweetSpotWidth / 2 + 5;
      const start = margin + Math.random() * (100 - sweetSpotWidth - margin * 2);
      setSweetSpotStart(start);
      setCursorPos(0);
      setDirection(1);
      setLastHitResult(null);
    }
  }, [phase, attempt, frozen, sweetSpotWidth]);

  // Cursor animation
  useEffect(() => {
    if (phase !== 'playing' || frozen) return;

    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setCursorPos((prev) => {
        let next = prev + direction * cursorSpeed * dt;
        if (next >= 100) { next = 100; setDirection(-1); }
        if (next <= 0) { next = 0; setDirection(1); }
        return next;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, frozen, direction, cursorSpeed]);

  const handleClick = useCallback(() => {
    if (phase !== 'playing' || frozen) return;

    if (trainingType === 'punch') playPunchSound();
    else playKickSound();

    onHitSuccess?.();
    setFrozen(true);
    cancelAnimationFrame(animRef.current);

    // Calculate score
    const sweetSpotCenter = sweetSpotStart + sweetSpotWidth / 2;
    const distance = Math.abs(cursorPos - sweetSpotCenter);
    const halfWidth = sweetSpotWidth / 2;

    let score: number;
    let hitResult: 'perfect' | 'good' | 'miss';

    if (distance <= halfWidth * 0.3) {
      score = 100;
      hitResult = 'perfect';
    } else if (distance <= halfWidth) {
      score = 60 + (1 - distance / halfWidth) * 40;
      hitResult = 'good';
    } else {
      score = Math.max(0, 30 - (distance - halfWidth) * 2);
      hitResult = 'miss';
    }

    setLastHitResult(hitResult);
    const newScores = [...scores, score];
    setScores(newScores);

    // Next attempt or finish
    setTimeout(() => {
      if (attempt + 1 >= MAX_ATTEMPTS) {
        playVictorySound();
        const bestScore = Math.max(...newScores);
        const avgScore = newScores.reduce((a, b) => a + b, 0) / newScores.length;
        const finalScore = Math.round(bestScore * 0.6 + avgScore * 0.4);
        const grade = getGrade(finalScore);
        const statGain = getStatGain(grade);
        onComplete({
          type: trainingType,
          grade,
          statGain,
          score: finalScore,
          maxScore: 100,
        });
      } else {
        setAttempt((prev) => prev + 1);
        setFrozen(false);
      }
    }, 1000);
  }, [phase, frozen, cursorPos, sweetSpotStart, sweetSpotWidth, attempt, scores, trainingType, onComplete, onHitSuccess]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (phase === 'ready') {
          playUIClick();
          setPhase('playing');
        } else handleClick();
      }
      if (e.code === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleClick, onCancel]);

  // Calculate final result
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const finalScore = Math.round(bestScore * 0.6 + avgScore * 0.4);
  const grade = getGrade(finalScore);
  const statGain = getStatGain(grade);

  const handleFinish = () => {
    onComplete({
      type: trainingType,
      grade,
      statGain,
      score: finalScore,
      maxScore: 100,
    });
  };

  const isPunch = trainingType === 'punch';
  const accentColor = isPunch ? '#FF4444' : '#FF6B35';
  const title = isPunch ? 'ฝึกพลังหมัด' : 'ฝึกพลังเตะ';

  return (
    <div
      onClick={phase === 'playing' ? handleClick : undefined}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '210px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 50,
        background: 'rgba(15, 15, 22, 0.95)', borderTop: `2px solid ${accentColor}`,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.8)', padding: '12px 24px',
        cursor: phase === 'playing' ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ textAlign: 'center' }}
          >
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: accentColor, marginBottom: '16px' }}>
              {title}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              กดปุ่มเมื่อตัวชี้อยู่ในโซนสีเขียว
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
              ทั้งหมด {MAX_ATTEMPTS} ครั้ง — คะแนนที่ดีที่สุดจะถูกนำไปใช้
            </p>
            <button
              className="game-btn primary"
              onClick={() => setPhase('playing')}
              style={{ fontSize: '20px', padding: '16px 48px' }}
            >
              เริ่มฝึก (SPACE)
            </button>
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', maxWidth: '600px', padding: '0 24px', textAlign: 'center' }}
          >
            {/* Attempt counter */}
            <div style={{ fontFamily: 'Orbitron', fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
              ครั้งที่ {attempt + 1} / {MAX_ATTEMPTS}
            </div>

            {/* Score dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
              {scores.map((s, i) => (
                <div key={i} style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: s >= 80 ? '#22C55E' : s >= 50 ? '#EAB308' : '#EF4444',
                }} />
              ))}
              {Array.from({ length: MAX_ATTEMPTS - scores.length }).map((_, i) => (
                <div key={`e${i}`} style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                }} />
              ))}
            </div>

            {/* Timing Bar */}
            <div
              onClick={handleClick}
              style={{
                position: 'relative', width: '100%', height: '60px',
                background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {/* Sweet spot zone */}
              <div style={{
                position: 'absolute', top: '4px', bottom: '4px',
                left: `${sweetSpotStart}%`, width: `${sweetSpotWidth}%`,
                background: 'rgba(34, 197, 94, 0.3)',
                border: '2px solid rgba(34, 197, 94, 0.6)',
                borderRadius: '4px',
              }}>
                {/* Perfect center line */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: '50%', width: '2px', transform: 'translateX(-50%)',
                  background: 'rgba(34, 197, 94, 0.8)',
                }} />
              </div>

              {/* Moving cursor */}
              <motion.div
                style={{
                  position: 'absolute', top: '2px', bottom: '2px',
                  left: `${cursorPos}%`, width: '4px', transform: 'translateX(-50%)',
                  background: frozen
                    ? (lastHitResult === 'perfect' ? '#22C55E' : lastHitResult === 'good' ? '#EAB308' : '#EF4444')
                    : accentColor,
                  borderRadius: '2px',
                  boxShadow: `0 0 12px ${frozen
                    ? (lastHitResult === 'perfect' ? '#22C55E' : lastHitResult === 'good' ? '#EAB308' : '#EF4444')
                    : accentColor}`,
                }}
              />
            </div>

            {/* Hit result feedback */}
            <AnimatePresence>
              {lastHitResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{
                    marginTop: '24px', fontFamily: 'Orbitron', fontSize: '28px', fontWeight: 800,
                    color: lastHitResult === 'perfect' ? '#22C55E' : lastHitResult === 'good' ? '#EAB308' : '#EF4444',
                    textShadow: `0 0 20px ${lastHitResult === 'perfect' ? '#22C55E' : lastHitResult === 'good' ? '#EAB308' : '#EF4444'}`,
                  }}
                >
                  {lastHitResult === 'perfect' ? 'PERFECT!' : lastHitResult === 'good' ? 'GOOD' : 'MISS'}
                </motion.div>
              )}
            </AnimatePresence>

            {!frozen && (
              <p style={{ marginTop: '24px', fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
                คลิกหรือกด SPACE เพื่อหยุดตัวชี้
              </p>
            )}
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              ผลการฝึก
            </h2>

            {/* Grade */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              style={{
                fontFamily: 'Orbitron', fontSize: '80px', fontWeight: 900,
                color: grade === 'S' ? '#FFD700' : grade === 'A' ? '#22C55E' : grade === 'B' ? '#3B82F6' : grade === 'C' ? '#EAB308' : '#EF4444',
                textShadow: `0 0 40px ${grade === 'S' ? '#FFD700' : grade === 'A' ? '#22C55E' : grade === 'B' ? '#3B82F6' : grade === 'C' ? '#EAB308' : '#EF4444'}`,
                margin: '16px 0',
              }}
            >
              {grade}
            </motion.div>

            {/* Score */}
            <p style={{ fontFamily: 'Orbitron', fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              คะแนน: {finalScore}/100
            </p>

            {/* Stat gain */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                fontFamily: 'Orbitron', fontSize: '22px', fontWeight: 700,
                color: statGain > 0 ? '#22C55E' : '#EF4444', marginBottom: '32px',
              }}
            >
              {statGain > 0 ? `+${statGain} ${isPunch ? 'พลังหมัด' : 'พลังเตะ'}` : 'ไม่ได้รับค่าพลัง'}
            </motion.p>

            {/* Individual scores */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              {scores.map((s, i) => (
                <div key={i} style={{
                  padding: '8px 16px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  fontFamily: 'Orbitron', fontSize: '14px',
                  color: s >= 80 ? '#22C55E' : s >= 50 ? '#EAB308' : '#EF4444',
                }}>
                  ครั้ง {i + 1}: {Math.round(s)}
                </div>
              ))}
            </div>

            <button className="game-btn primary" onClick={handleFinish} style={{ fontSize: '18px', padding: '14px 40px' }}>
              รับผล
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'none', border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.5)', padding: '8px 16px',
          fontFamily: 'Orbitron', fontSize: '12px', cursor: 'pointer',
        }}
      >
        ยกเลิก (ESC)
      </button>
    </div>
  );
}
