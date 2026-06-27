'use client';
// ============================================================
// LEARN FIGHT — QTE Minigame (Reaction Speed Training)
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrainingGrade, TrainingResult } from '@/types/game';

interface QTEGameProps {
  currentStatLevel: number;
  onComplete: (result: TrainingResult) => void;
  onCancel: () => void;
}

type Direction = 'left' | 'right' | 'up' | 'down';

const DIRECTION_CONFIG: Record<Direction, { key: string; keys: string[]; arrow: string; color: string }> = {
  left:  { key: 'A / ←', keys: ['KeyA', 'ArrowLeft'],  arrow: '←', color: '#3B82F6' },
  right: { key: 'D / →', keys: ['KeyD', 'ArrowRight'], arrow: '→', color: '#EF4444' },
  up:    { key: 'W / ↑', keys: ['KeyW', 'ArrowUp'],    arrow: '↑', color: '#22C55E' },
  down:  { key: 'S / ↓', keys: ['KeyS', 'ArrowDown'],  arrow: '↓', color: '#EAB308' },
};

const DIRECTIONS: Direction[] = ['left', 'right', 'up', 'down'];

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

export default function QTEGame({ currentStatLevel, onComplete, onCancel }: QTEGameProps) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'waiting' | 'feedback' | 'result'>('ready');
  const [promptIndex, setPromptIndex] = useState(0);
  const [currentDirection, setCurrentDirection] = useState<Direction>('up');
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [results, setResults] = useState<Array<{ correct: boolean; time: number }>>([]);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const TOTAL_PROMPTS = 8;

  // Difficulty: time window shrinks with level
  const timeWindow = Math.max(400, 1500 - currentStatLevel * 160); // ms

  const generatePrompt = useCallback(() => {
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    setCurrentDirection(dir);
    setTimeRemaining(100);
    setPhase('playing');
    startTimeRef.current = performance.now();
  }, []);

  // Countdown timer during prompt
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / timeWindow) * 100);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Timeout
        setResults((prev) => [...prev, { correct: false, time: timeWindow }]);
        setFeedbackType('timeout');
        setPhase('feedback');
      }
    }, 16);

    return () => clearInterval(interval);
  }, [phase, timeWindow]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') { onCancel(); return; }

      if (phase === 'ready' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        // Start with small delay
        setPhase('waiting');
        setTimeout(generatePrompt, 500 + Math.random() * 800);
        return;
      }

      if (phase !== 'playing') return;

      const config = DIRECTION_CONFIG[currentDirection];
      const elapsed = performance.now() - startTimeRef.current;

      if (config.keys.includes(e.code)) {
        // Correct!
        setResults((prev) => [...prev, { correct: true, time: elapsed }]);
        setFeedbackType('correct');
      } else {
        // Wrong key
        const isDirectionKey = DIRECTIONS.some(d => DIRECTION_CONFIG[d].keys.includes(e.code));
        if (isDirectionKey) {
          setResults((prev) => [...prev, { correct: false, time: elapsed }]);
          setFeedbackType('wrong');
        } else {
          return; // Ignore non-direction keys
        }
      }
      setPhase('feedback');
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, currentDirection, generatePrompt, onCancel]);

  // Feedback → next prompt or result
  useEffect(() => {
    if (phase !== 'feedback') return;

    const timer = setTimeout(() => {
      if (promptIndex + 1 >= TOTAL_PROMPTS) {
        setPhase('result');
      } else {
        setPromptIndex((p) => p + 1);
        setFeedbackType(null);
        setPhase('waiting');
        // Random delay before next prompt
        setTimeout(generatePrompt, 300 + Math.random() * 600);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [phase, promptIndex, generatePrompt]);

  // Calculate final score
  const correctCount = results.filter((r) => r.correct).length;
  const avgReactionTime = results.filter((r) => r.correct).length > 0
    ? results.filter((r) => r.correct).reduce((a, b) => a + b.time, 0) / results.filter((r) => r.correct).length
    : timeWindow;

  const accuracyScore = (correctCount / TOTAL_PROMPTS) * 70;
  const speedBonus = Math.max(0, 30 - (avgReactionTime / timeWindow) * 30);
  const perfectBonus = correctCount === TOTAL_PROMPTS ? 10 : 0;
  const finalScore = Math.min(100, Math.round(accuracyScore + speedBonus + perfectBonus));
  const grade = getGrade(finalScore);
  const statGain = getStatGain(grade);

  const handleFinish = () => {
    onComplete({
      type: 'reaction',
      grade,
      statGain,
      score: finalScore,
      maxScore: 100,
    });
  };

  const config = DIRECTION_CONFIG[currentDirection];

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 50,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
    }}>
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: '#00BFFF', marginBottom: '16px' }}>
              ฝึกความเร็ว
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              กดปุ่มตามทิศทางที่แสดงให้เร็วที่สุด
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '24px 0' }}>
              {DIRECTIONS.map((d) => (
                <div key={d} style={{
                  width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', fontFamily: 'Inter', fontSize: '28px', color: DIRECTION_CONFIG[d].color,
                }}>
                  {DIRECTION_CONFIG[d].arrow}
                </div>
              ))}
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
              ใช้ปุ่ม WASD หรือปุ่มลูกศร — ทั้งหมด {TOTAL_PROMPTS} ครั้ง
            </p>
            <button className="game-btn primary" onClick={() => {
              setPhase('waiting');
              setTimeout(generatePrompt, 500 + Math.random() * 800);
            }} style={{ fontSize: '20px', padding: '16px 48px' }}>
              เริ่มฝึก (SPACE)
            </button>
          </motion.div>
        )}

        {phase === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Orbitron', fontSize: '24px', color: 'rgba(255,255,255,0.3)',
              animation: 'pulse 1s infinite',
            }}>
              เตรียมตัว...
            </div>
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ textAlign: 'center' }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: r.correct ? '#22C55E' : '#EF4444',
                }} />
              ))}
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: config.color, boxShadow: `0 0 8px ${config.color}`,
              }} />
              {Array.from({ length: TOTAL_PROMPTS - results.length - 1 }).map((_, i) => (
                <div key={`e${i}`} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                }} />
              ))}
            </div>

            {/* Big arrow prompt */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{
                width: '160px', height: '160px', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${config.color}20`, border: `4px solid ${config.color}`,
                borderRadius: '24px', fontFamily: 'Inter', fontSize: '80px',
                color: config.color, textShadow: `0 0 40px ${config.color}`,
              }}
            >
              {config.arrow}
            </motion.div>

            {/* Timer bar */}
            <div style={{
              width: '200px', height: '6px', margin: '24px auto 0',
              background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden',
            }}>
              <motion.div style={{
                width: `${timeRemaining}%`, height: '100%',
                background: timeRemaining > 50 ? '#22C55E' : timeRemaining > 20 ? '#EAB308' : '#EF4444',
                borderRadius: '3px',
              }} />
            </div>

            <p style={{ marginTop: '12px', fontFamily: 'Orbitron', fontSize: '14px', color: config.color }}>
              {config.key}
            </p>
          </motion.div>
        )}

        {phase === 'feedback' && feedbackType && (
          <motion.div key="feedback" initial={{ opacity: 0, scale: 1.5 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Orbitron', fontSize: '48px', fontWeight: 900,
              color: feedbackType === 'correct' ? '#22C55E' : '#EF4444',
              textShadow: `0 0 30px ${feedbackType === 'correct' ? '#22C55E' : '#EF4444'}`,
            }}>
              {feedbackType === 'correct' ? '✓' : feedbackType === 'wrong' ? '✗' : '⏰'}
            </div>
            <p style={{
              fontFamily: 'Orbitron', fontSize: '18px', marginTop: '8px',
              color: feedbackType === 'correct' ? '#22C55E' : '#EF4444',
            }}>
              {feedbackType === 'correct' ? 'ถูกต้อง!' : feedbackType === 'wrong' ? 'ผิด!' : 'หมดเวลา!'}
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
              แม่นยำ: {correctCount}/{TOTAL_PROMPTS} — เฉลี่ย: {Math.round(avgReactionTime)}ms
            </p>
            <p style={{ fontFamily: 'Orbitron', fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              คะแนน: {finalScore}/100
            </p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{
                fontFamily: 'Orbitron', fontSize: '22px', fontWeight: 700,
                color: statGain > 0 ? '#22C55E' : '#EF4444', marginBottom: '32px',
              }}>
              {statGain > 0 ? `+${statGain} ความเร็ว` : 'ไม่ได้รับค่าพลัง'}
            </motion.p>

            <button className="game-btn primary" onClick={handleFinish} style={{ fontSize: '18px', padding: '14px 40px' }}>
              รับผล
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onCancel} style={{
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
