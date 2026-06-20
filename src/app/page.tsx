'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

import { useGameStore } from '@/systems/GameStore';
import { simulateFight } from '@/systems/FightEngine';
import { initAudio, playUIClick, playPunchSound, playKickSound, playBlockSound, playDodgeSound, playKnockdownSound, playBellSound, playVictorySound, playDefeatSound, playCrowdCheer, stopAmbience } from '@/systems/AudioSystem';
import { ABILITIES, AVAILABLE_SKINS, MAX_TRAINING_SESSIONS } from '@/data/constants';
import { t } from '@/data/localization';
import type { GameScene, AbilityId, TrainingType, FightEvent, Fighter } from '@/types/game';

import { VoxelFighter, getSkinColors, DEFAULT_COLORS } from '@/components/three/VoxelFighter';
import { CameraController, CameraMode } from '@/components/three/CameraController';
import { ParticleManager, ParticleManagerRef } from '@/components/three/ParticleManager';
import { PhysicalPunchingBag, PhysicalKickBag } from '@/components/three/PhysicalTrainingElements';
import { Skybox } from '@/components/three/Skybox';

// ============================================================
// 3D ENVIRONMENTS (Optimized & Brightened)
// ============================================================
function GymEnvironment() {
  return (
    <group>
      <Skybox texturePath="/bg_gym.png" />
      <spotLight position={[0, 8, 2]} angle={0.8} penumbra={0.5} intensity={12} color="#FFFFFF" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <ambientLight intensity={3.0} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
    </group>
  );
}

function ArenaEnvironment() {
  return (
    <group>
      <Skybox texturePath="/bg_arena.png" />
      {/* Ring Canvas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[9.5, 9.5]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.9} />
      </mesh>
      <spotLight position={[0, 10, 0]} angle={0.8} penumbra={0.5} intensity={15} color="#FFFFFF" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <ambientLight intensity={2.5} />
      <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#ffffff" />
    </group>
  );
}

function ShowroomEnvironment() {
  return (
    <group>
      <Skybox texturePath="/bg_lab.png" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#111" opacity={0.5} transparent />
      </mesh>
      <spotLight position={[0, 6, 4]} angle={0.6} penumbra={0.4} intensity={12} color="#FFFFFF" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <ambientLight intensity={3.5} color="#ffffff" />
      <directionalLight position={[0, 2, 5]} intensity={2.0} color="#ffffff" />
    </group>
  );
}

// ============================================================
// UI COMPONENTS
// ============================================================
function SegmentedStatBar({ label, value, max = 7 }: { label: string; value: number; max?: number }) {
  return (
    <div className="stat-bar">
      <div className="stat-bar-label">{label}</div>
      <div className="stat-bar-segments">
        {Array.from({ length: max }).map((_, i) => (
          <motion.div 
            key={i}
            className={`stat-bar-segment ${i < value ? (value >= 5 ? 'filled high' : 'filled') : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>
      <div className="stat-bar-value">{value.toFixed(1)}</div>
    </div>
  );
}

function AnimatedReflexBall({ active }: { active: boolean }) {
  const ballRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ballRef.current && active) {
      const time = state.clock.elapsedTime;
      // Swing back and forth quickly
      ballRef.current.position.z = 0.6 + Math.sin(time * 8) * 0.4;
      ballRef.current.position.x = Math.cos(time * 5) * 0.2;
    }
  });

  return (
    <mesh ref={ballRef} position={[0, 1.5, 0.6]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#FF2244" roughness={0.2} metalness={0.5} />
    </mesh>
  );
}

// ============================================================
// MAIN GAME COMPONENT
// ============================================================
export default function GamePage() {
  const store = useGameStore();
  const { scene, fighters, selectedFighterId, opponentFighterId, settings } = store;
  const lang = settings.language;

  const [initialized, setInitialized] = useState(false);
  const particlesRef = useRef<ParticleManagerRef>(null);

  // Character States
  const [playerAnim, setPlayerAnim] = useState('idle');
  const [opponentAnim, setOpponentAnim] = useState('idle');
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [opponentPos, setOpponentPos] = useState<[number, number, number]>([0, 0, 0]);

  // Camera State
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 1.2, 0]);
  const [cameraShake, setCameraShake] = useState(0);
  const [showImpactFlash, setShowImpactFlash] = useState(false);

  // UI States
  const [createName, setCreateName] = useState('');
  const [createSkin, setCreateSkin] = useState('skin_01');
  const [createAbility, setCreateAbility] = useState<AbilityId>('iron_fist');
  const [trainingTimer, setTrainingTimer] = useState(0);
  const [trainingActive, setTrainingActive] = useState(false);
  const [fightActive, setFightActive] = useState(false);
  const [fightAnnouncement, setFightAnnouncement] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [fightPlayerHP, setFightPlayerHP] = useState(100);
  const [fightOpponentHP, setFightOpponentHP] = useState(100);
  const [fightMaxHP, setFightMaxHP] = useState(100);
  const [fightOpponentMaxHP, setFightOpponentMaxHP] = useState(100);

  const selectedFighter = useMemo(() => fighters.find(f => f.id === selectedFighterId) || null, [fighters, selectedFighterId]);
  const opponentFighter = useMemo(() => fighters.find(f => f.id === opponentFighterId) || null, [fighters, opponentFighterId]);

  useEffect(() => {
    store.initializeGame();
    setInitialized(true);
  }, []);

  // Scene setup logic
  useEffect(() => {
    switch (scene) {
      case 'main_menu':
        setCameraMode('orbit'); setPlayerPos([0, 0, 0]); setPlayerAnim('idle');
        break;
      case 'character_creation':
      case 'character_list':
      case 'character_detail':
        setCameraMode('creation'); setPlayerPos([0, 0, 0]); setPlayerAnim('guard');
        break;
      case 'training_select':
        setCameraMode('orbit'); setPlayerPos([0, 0, 0]); setPlayerAnim('guard');
        break;
      case 'fight_select':
        setCameraMode('wide'); setPlayerPos([-1.5, 0, 0]); setOpponentPos([1.5, 0, 0]);
        setPlayerAnim('idle'); setOpponentAnim('idle');
        break;
    }
  }, [scene]);

  // Physical Training Logic
  useEffect(() => {
    if (!trainingActive || scene !== 'training') return;
    const type = store.currentTrainingType;
    let seqIndex = 0;
    
    // Walk to bag sequence
    setPlayerAnim('walk_forward');
    setPlayerPos([0, 0, 2.5]); // Start further back
    
    let walkInterval = setInterval(() => {
      setPlayerPos(prev => {
        const newZ = prev[2] - 0.2;
        if (newZ <= 1.5) { // Stop perfectly in front of the bag without overlapping
          clearInterval(walkInterval);
          setPlayerAnim('guard');
          startTrainingHits();
        }
        return [prev[0], prev[1], newZ];
      });
    }, 100);

    const startTrainingHits = () => {
      const punchAnims = ['jab', 'cross', 'hook', 'uppercut', 'body_shot'];
      const kickAnims = ['low_kick', 'body_kick', 'high_kick', 'roundhouse'];
      const hitInterval = setInterval(() => {
        if (type === 'punch') {
          const anim = punchAnims[Math.floor(Math.random() * punchAnims.length)];
          setPlayerAnim(anim);
          setTimeout(() => {
            playPunchSound();
            if (particlesRef.current) particlesRef.current.emitImpact(new THREE.Vector3(0, 1.5, 0.5), 'spark', 1.5);
            if ((window as any).triggerBagImpulse) (window as any).triggerBagImpulse(50);
            setCameraShake(2); setTimeout(() => setCameraShake(0), 200);
          }, 300);
        } else if (type === 'kick') {
          const anim = kickAnims[Math.floor(Math.random() * kickAnims.length)];
          setPlayerAnim(anim);
          setTimeout(() => {
            playKickSound();
            if (particlesRef.current) particlesRef.current.emitImpact(new THREE.Vector3(0, 1.0, 0.5), 'spark', 2);
            if ((window as any).triggerBagImpulse) (window as any).triggerBagImpulse(100);
            setCameraShake(3); setTimeout(() => setCameraShake(0), 200);
          }, 400);
        } else if (type === 'endurance') {
          const isBody = Math.random() > 0.5;
          setOpponentAnim(isBody ? 'body_shot' : 'cross');
          setTimeout(() => {
             setPlayerAnim(isBody ? 'hit_body' : 'hit_head');
             playBlockSound();
             if (particlesRef.current) particlesRef.current.emitImpact(new THREE.Vector3(-0.5, 1.2, 0), 'sweat', 1.5);
             setCameraShake(3); setTimeout(() => setCameraShake(0), 200);
          }, 150);
        } else {
          setPlayerAnim(Math.random() > 0.5 ? 'dodge_left' : 'dodge_right');
          playDodgeSound();
          setCameraShake(2); setTimeout(() => setCameraShake(0), 150);
        }
        
        setTimeout(() => {
          setPlayerAnim('guard');
          if (type === 'endurance') setOpponentAnim('guard');
        }, 600); // Wait 600ms before returning to guard so it triggers properly
      }, type === 'reaction' ? 800 : 1500);

      // Countdown
      let count = 10;
      setTrainingTimer(count);
      const timerInterval = setInterval(() => {
        count--;
        setTrainingTimer(count);
        if (count <= 0) {
          clearInterval(hitInterval);
          clearInterval(timerInterval);
          setTrainingActive(false);
          store.finishTraining();
          setPlayerAnim('victory');
          setTimeout(() => store.setScene('character_detail'), 3000);
        }
      }, 1000);
    };

    return () => { clearInterval(walkInterval); };
  }, [trainingActive]);

  // Cinematic Combat Logic
  const handleStartFight = useCallback(() => {
    if (!selectedFighter || !opponentFighter) return;
    const result = simulateFight(selectedFighter, opponentFighter);
    store.setFightState(result);
    setFightPlayerHP(result.playerMaxHP);
    setFightOpponentHP(result.opponentMaxHP);
    setFightMaxHP(result.playerMaxHP);
    setFightOpponentMaxHP(result.opponentMaxHP);
    setFightActive(true);
    store.setScene('fight');
    initAudio();
    playBellSound();

    setPlayerPos([-1.5, 0, 0]);
    setOpponentPos([1.5, 0, 0]);
    
    // Start playback
    let eventIdx = 0;
    const playNextEvent = () => {
      if (eventIdx >= result.events.length) {
        setFightActive(false);
        setTimeout(() => {
          if (result.winner === 'player') {
             playVictorySound(); playCrowdCheer(); store.setScene('victory');
             store.recordMatch(selectedFighter.id, opponentFighter.id, { opponentId: opponentFighter.id, opponentName: opponentFighter.name, result: 'win', method: result.method as any, round: result.round, date: Date.now() });
          } else {
             playDefeatSound(); store.setScene('defeat');
             store.recordMatch(selectedFighter.id, opponentFighter.id, { opponentId: opponentFighter.id, opponentName: opponentFighter.name, result: 'loss', method: result.method as any, round: result.round, date: Date.now() });
          }
        }, 2000);
        return;
      }

      const event = result.events[eventIdx];
      const nextEvent = result.events[eventIdx + 1];
      const delay = nextEvent ? (nextEvent.timestamp - event.timestamp) * 1000 : 1000;
      const isPlayer = event.attacker === 'player';

      switch (event.type) {
        case 'move':
          if (event.moveDirection === 'forward') {
            if (isPlayer) { setPlayerAnim('walk_forward'); setPlayerPos(p => [Math.min(-1, p[0]+0.5), 0, p[2]]); }
            else { setOpponentAnim('walk_forward'); setOpponentPos(p => [Math.max(1, p[0]-0.5), 0, p[2]]); }
          } else if (event.moveDirection === 'backward') {
            if (isPlayer) { setPlayerAnim('walk_backward'); setPlayerPos(p => [Math.max(-3, p[0]-0.5), 0, p[2]]); }
            else { setOpponentAnim('walk_backward'); setOpponentPos(p => [Math.min(3, p[0]+0.5), 0, p[2]]); }
          } else if (event.moveDirection === 'circle_left') {
            if (isPlayer) { setPlayerAnim('circle_left'); setPlayerPos(p => [p[0], 0, Math.min(2, p[2]+0.5)]); }
            else { setOpponentAnim('circle_right'); setOpponentPos(p => [p[0], 0, Math.min(2, p[2]+0.5)]); }
          } else if (event.moveDirection === 'circle_right') {
            if (isPlayer) { setPlayerAnim('circle_right'); setPlayerPos(p => [p[0], 0, Math.max(-2, p[2]-0.5)]); }
            else { setOpponentAnim('circle_left'); setOpponentPos(p => [p[0], 0, Math.max(-2, p[2]-0.5)]); }
          }
          break;
        case 'guard':
          if (isPlayer) setPlayerAnim('guard'); else setOpponentAnim('guard');
          break;
        case 'punch':
        case 'kick':
          if (isPlayer) {
             setPlayerAnim(event.moveType || 'jab');
             setOpponentAnim(event.success ? 'hit_head' : 'block');
          } else {
             setOpponentAnim(event.moveType || 'jab');
             setPlayerAnim(event.success ? 'hit_head' : 'block');
          }
          if (event.success && event.damage) {
            setCameraShake(event.isCritical ? 5 : 2);
            if (event.type === 'punch') playPunchSound(event.isCritical); else playKickSound(event.isCritical);
            if (particlesRef.current) {
              const p = isPlayer ? opponentPos : playerPos;
              particlesRef.current.emitImpact(new THREE.Vector3(p[0], 1.5, p[2]), event.isCritical ? 'spark' : 'sweat', event.isCritical ? 1.5 : 1.0);
            }
            setShowImpactFlash(true); setTimeout(() => { setCameraShake(0); setShowImpactFlash(false); }, 250);
            if (isPlayer) setFightOpponentHP(prev => Math.max(0, prev - (event.damage || 0)));
            else setFightPlayerHP(prev => Math.max(0, prev - (event.damage || 0)));
            
            if (event.isSlowMo) { setCameraMode('close'); setTimeout(() => setCameraMode('wide'), 1000); }
          } else playBlockSound();
          break;
        case 'dodge':
          if (isPlayer) { setPlayerAnim(event.moveType || 'jab'); setOpponentAnim('dodge'); }
          else { setOpponentAnim(event.moveType || 'jab'); setPlayerAnim('dodge'); }
          playDodgeSound();
          break;
        case 'block':
          if (isPlayer) { setPlayerAnim(event.moveType || 'jab'); setOpponentAnim('block'); }
          else { setOpponentAnim(event.moveType || 'jab'); setPlayerAnim('block'); }
          playBlockSound();
          if (event.damage) {
            if (isPlayer) setFightOpponentHP(prev => Math.max(0, prev - (event.damage || 0)));
            else setFightPlayerHP(prev => Math.max(0, prev - (event.damage || 0)));
          }
          break;
        case 'stun':
          if (isPlayer) setPlayerAnim('hit_body'); else setOpponentAnim('hit_body');
          break;
        case 'knockdown':
          if (isPlayer) setOpponentAnim('knockdown'); else setPlayerAnim('knockdown');
          playKnockdownSound();
          setCameraMode('dramatic'); setCameraTarget(isPlayer ? opponentPos : playerPos); setCameraShake(10); setShowImpactFlash(true);
          setTimeout(() => { setCameraShake(0); setShowImpactFlash(false); }, 500);
          
          let count = 1;
          const cInt = setInterval(() => {
             setCountdown(count); count++;
             if (count > 3) { clearInterval(cInt); setTimeout(() => setCountdown(null), 1000); }
          }, 1000);
          break;
        case 'recovery':
          if (isPlayer) setOpponentAnim('getup'); else setPlayerAnim('getup');
          setTimeout(() => { setCameraMode('wide'); setCameraTarget([0, 1.2, 0]); setPlayerAnim('guard'); setOpponentAnim('guard'); }, 1500);
          break;
      }
      
      if (cameraMode === 'wide') {
         setCameraTarget([(playerPos[0] + opponentPos[0])/2, 1.2, (playerPos[2] + opponentPos[2])/2]);
      }

      eventIdx++;
      setTimeout(playNextEvent, delay);
    };

    setFightAnnouncement('FIGHT!');
    setTimeout(() => { setFightAnnouncement(null); playNextEvent(); }, 2000);
  }, [selectedFighter, opponentFighter, store]);

  if (!initialized) return null;

  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="vignette-overlay" />
      
      <div className="game-canvas-container">
        {/* Removed PostProcessing for max FPS. Added dpr matching device settings. */}
        <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }} dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}>
          <CameraController mode={cameraMode} target={cameraTarget} shakeIntensity={cameraShake} />
          <ParticleManager ref={particlesRef} />
          <ContactShadows position={[0, 0, 0]} opacity={0.6} blur={2.0} far={4} color="#000" />

          <Suspense fallback={null}>
            {scene === 'main_menu' && <group><Skybox texturePath="/bg_city.png" /><ambientLight intensity={3.0}/></group>}
            {scene === 'training_select' && <GymEnvironment />}
            {['character_creation', 'character_list', 'character_detail', 'victory'].includes(scene) && <ShowroomEnvironment />}
            {['fight_select', 'fight', 'defeat'].includes(scene) && <ArenaEnvironment />}
            {scene === 'training' && <GymEnvironment />}

            {scene === 'training' && (
              <Physics>
                {/* Adjusted bag positions to avoid overlapping */}
                {store.currentTrainingType === 'punch' && <PhysicalPunchingBag position={[0, 2.5, 0.2]} />}
                {store.currentTrainingType === 'kick' && <PhysicalKickBag position={[0, 1.0, 0.2]} />}
                {store.currentTrainingType === 'endurance' && (
                  <VoxelFighter skinColors={DEFAULT_COLORS} animation={opponentAnim} position={[0, 0, -0.8]} rotation={[0, 0, 0]} />
                )}
                {/* Character faces away from camera, towards the bag */}
                <VoxelFighter skinId={selectedFighter?.skinId} animation={playerAnim} position={playerPos} rotation={[0, Math.PI, 0]} />
              </Physics>
            )}

            {/* Standard rotation logic for character previews and fight mode */}
            {scene !== 'training' && scene !== 'character_creation' && selectedFighter && (
              <VoxelFighter 
                skinId={selectedFighter.skinId} 
                animation={playerAnim} 
                position={playerPos} 
                rotation={scene === 'fight' || scene === 'fight_select' ? [0, Math.PI / 2, 0] : [0, 0, 0]} 
              />
            )}
            
            {scene === 'character_creation' && (
              <VoxelFighter skinId={createSkin} animation={playerAnim} position={playerPos} />
            )}

            {['fight', 'fight_select'].includes(scene) && opponentFighter && (
              <VoxelFighter 
                skinId={opponentFighter.skinId} 
                animation={opponentAnim} 
                position={opponentPos} 
                rotation={[0, -Math.PI / 2, 0]} 
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      <AnimatePresence>
        {showImpactFlash && (
          <motion.div className="impact-flash" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'white', zIndex:100, pointerEvents:'none'}} />
        )}
        {countdown !== null && (
          <motion.div className="fight-announce" initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
            <div style={{ fontFamily:'Orbitron', fontSize:'150px', fontWeight:900, color:'#FF2244', textShadow:'0 0 50px rgba(255,0,0,0.8)' }}>{countdown}</div>
          </motion.div>
        )}
        {fightAnnouncement && (
          <motion.div className="fight-announce" initial={{ opacity: 0, scale: 3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
            <div style={{ fontFamily:'Orbitron', fontSize:'120px', fontWeight:900, fontStyle:'italic', color:'#FFC000', textShadow:'0 0 50px #FF5500' }}>{fightAnnouncement}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ui-overlay">
        {scene !== 'main_menu' && scene !== 'fight' && scene !== 'training' && (
          <motion.div className="nav-bar" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: 'spring' }}>
            <button className="nav-btn" onClick={() => { store.goBack(); playUIClick(); }}>◀ BACK</button>
            <div style={{ fontFamily:'Orbitron', fontSize:'24px', fontWeight:800, color:'white', letterSpacing:'4px' }}>
              {scene.toUpperCase().replace('_', ' ')}
            </div>
            <button className="nav-btn" onClick={() => { store.setScene('main_menu'); playUIClick(); }}>HOME ⌂</button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {scene === 'main_menu' && (
             <motion.div key="main" className="main-menu" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
               <div className="main-menu-title">LEARN<br/>FIGHT</div>
               <div className="main-menu-subtitle">AAA COMBAT TRAINING SIMULATOR</div>
               <div className="main-menu-buttons">
                 <button className="game-btn primary full-width" onClick={() => { store.setScene('character_list'); playUIClick(); }}>START GAME</button>
                 <button className="game-btn full-width" onClick={() => { store.setScene('character_list'); playUIClick(); }}>CHARACTERS</button>
                 <button className="game-btn full-width" onClick={() => { store.setScene('character_creation'); playUIClick(); }}>CREATE FIGHTER</button>
               </div>
             </motion.div>
          )}

          {scene === 'character_list' && (
             <motion.div key="list" className="character-list" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
               <div className="character-grid">
                 {fighters.map(f => (
                   <div key={f.id} className="character-card" onClick={() => { store.selectFighter(f.id); store.setScene('character_detail'); playUIClick(); }}>
                     <div className="character-card-name">{f.name}</div>
                     <SegmentedStatBar label="PWR (P)" value={f.stats.punchPower} max={7} />
                     <SegmentedStatBar label="PWR (K)" value={f.stats.kickPower} max={7} />
                     <SegmentedStatBar label="SPD" value={f.stats.reactionSpeed} max={7} />
                     <SegmentedStatBar label="END" value={f.stats.endurance} max={7} />
                     <SegmentedStatBar label="HP" value={(100 + f.stats.endurance * 20) / 20} max={12} />
                   </div>
                 ))}
                 <div className="character-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => store.setScene('character_creation')}>
                   <div style={{ fontFamily:'Orbitron', fontSize:'24px', fontWeight:800, color:'var(--text-secondary)' }}>+ CREATE FIGHTER</div>
                 </div>
               </div>
             </motion.div>
          )}
          
          {scene === 'character_creation' && (
            <motion.div key="create" style={{ display:'grid', gridTemplateColumns:'1fr 400px', height:'100%', padding:'40px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div />
              <div className="glass-panel" style={{ overflowY:'auto' }}>
                <h2 style={{ fontFamily:'Orbitron', fontSize:'24px', color:'white', marginBottom:'24px' }}>CREATE FIGHTER</h2>
                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', marginBottom:'8px', fontFamily:'Orbitron', fontSize:'14px', color:'var(--accent-orange)' }}>FIGHTER NAME</label>
                  <input style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'18px', fontFamily:'Orbitron', outline:'none' }} value={createName} onChange={e => setCreateName(e.target.value)} placeholder="ENTER NAME..." />
                </div>
                
                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', marginBottom:'8px', fontFamily:'Orbitron', fontSize:'14px', color:'var(--accent-orange)' }}>SELECT CHARACTER</label>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'200px', overflowY:'auto', paddingRight:'8px' }}>
                    {AVAILABLE_SKINS.map(s => (
                      <div key={s.id} onClick={() => setCreateSkin(s.id)} style={{ padding:'12px 16px', border:`2px solid ${createSkin === s.id ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)'}`, background: createSkin === s.id ? 'rgba(255,85,0,0.2)' : 'rgba(0,0,0,0.5)', cursor:'pointer', textAlign:'left', fontSize:'14px', fontFamily:'Orbitron', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span>{s.name}</span>
                        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>({s.id.replace('skin_', '')})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom:'32px' }}>
                  <label style={{ display:'block', marginBottom:'8px', fontFamily:'Orbitron', fontSize:'14px', color:'var(--accent-orange)' }}>SPECIAL ABILITY</label>
                  <select style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'16px', fontFamily:'Inter', outline:'none' }} value={createAbility} onChange={e => setCreateAbility(e.target.value as AbilityId)}>
                    {ABILITIES.map(a => <option key={a.id} value={a.id} style={{ background:'#111' }}>{a.icon} {a.nameTH}</option>)}
                  </select>
                </div>

                <button className="game-btn primary full-width" onClick={() => {
                   if(createName) { store.createFighter(createName, createSkin, createAbility); store.setScene('character_detail'); playUIClick(); }
                }}>CREATE FIGHTER</button>
              </div>
            </motion.div>
          )}

          {scene === 'character_detail' && selectedFighter && (
            <motion.div key="detail" style={{ display:'grid', gridTemplateColumns:'1fr 450px', height:'100%', padding:'40px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div />
              <div className="glass-panel" style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ fontFamily:'Orbitron', fontSize:'48px', fontWeight:900, fontStyle:'italic', marginBottom:'8px', color:'white', textShadow:'0 2px 10px rgba(0,0,0,1)' }}>{selectedFighter.name.toUpperCase()}</div>
                
                <div style={{ padding:'16px', background:'rgba(255,85,0,0.1)', border:'1px solid rgba(255,85,0,0.3)', marginBottom:'32px', display:'flex', alignItems:'center', gap:'16px' }}>
                   <div style={{ fontSize:'32px' }}>{ABILITIES.find(a => a.id === selectedFighter.ability)?.icon}</div>
                   <div>
                     <div style={{ fontFamily:'Inter', fontWeight:700, color:'var(--accent-orange)', fontSize:'20px' }}>{ABILITIES.find(a => a.id === selectedFighter.ability)?.nameTH || 'ความสามารถลึกลับ'}</div>
                     <div style={{ fontSize:'12px', color:'var(--text-secondary)' }}>Special Ability</div>
                   </div>
                </div>

                <div style={{ flex:1 }}>
                  <SegmentedStatBar label="PUNCH" value={selectedFighter.stats.punchPower} max={7} />
                  <SegmentedStatBar label="KICK" value={selectedFighter.stats.kickPower} max={7} />
                  <SegmentedStatBar label="SPEED" value={selectedFighter.stats.reactionSpeed} max={7} />
                  <SegmentedStatBar label="ENDUR" value={selectedFighter.stats.endurance} max={7} />
                  <SegmentedStatBar label="HP" value={(100 + selectedFighter.stats.endurance * 20) / 20} max={12} />
                </div>
                
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                  <button className="game-btn" onClick={() => store.setScene('training_select')}>TRAIN</button>
                  <button className="game-btn primary" onClick={() => store.setScene('fight_select')}>FIGHT</button>
                </div>
              </div>
            </motion.div>
          )}

          {scene === 'training_select' && (
            <motion.div key="train_sel" className="training-select" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="training-grid">
                {[
                  { id: 'punch', title: 'HEAVY BAG', subtitle: 'ฝึกต่อย (Punch Training)', image: '/heavy_bag.png' },
                  { id: 'kick', title: 'KICK BAG', subtitle: 'ฝึกเตะ (Kick Training)', image: '/kick_bag.png' },
                  { id: 'reaction', title: 'REFLEXES', subtitle: 'ฝึกการตอบสนอง (Reaction)', image: '/reflexes.png' },
                  { id: 'endurance', title: 'SPARRING', subtitle: 'ฝึกรับหมัด (Endurance)', image: '/sparring.png' }
                ].map((t, i) => (
                  <motion.div key={t.id} className="training-card" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => {
                    store.setCurrentTrainingType(t.id as TrainingType);
                    store.setScene('training');
                    setTrainingActive(true);
                    initAudio();
                  }}>
                    <div className="training-card-bg" style={{ backgroundImage: `url(${t.image})` }} />
                    <div className="training-card-content">
                      <div className="training-card-title">{t.title}</div>
                      <div className="training-card-desc">{t.subtitle}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {scene === 'fight_select' && (
            <motion.div key="fight_sel" style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="fight-vs-container">
                <div className="glass-panel" style={{ width:'350px', textAlign:'center' }}>
                  <div style={{ fontFamily:'Orbitron', fontSize:'32px', fontWeight:900, marginBottom:'16px' }}>{selectedFighter?.name.toUpperCase()}</div>
                  <SegmentedStatBar label="PWR (P)" value={selectedFighter?.stats.punchPower || 0} />
                  <SegmentedStatBar label="PWR (K)" value={selectedFighter?.stats.kickPower || 0} />
                  <SegmentedStatBar label="SPD" value={selectedFighter?.stats.reactionSpeed || 0} />
                  <SegmentedStatBar label="END" value={selectedFighter?.stats.endurance || 0} />
                  <SegmentedStatBar label="HP" value={(100 + (selectedFighter?.stats.endurance || 0) * 20) / 20} max={12} />
                </div>
                
                <div className="vs-text">VS</div>
                
                <div className="glass-panel" style={{ width:'350px', textAlign:'center', borderColor:'var(--accent-red)' }}>
                  {opponentFighter ? (
                    <>
                      <div style={{ fontFamily:'Orbitron', fontSize:'32px', fontWeight:900, marginBottom:'16px', color:'var(--accent-red)' }}>{opponentFighter.name.toUpperCase()}</div>
                      <SegmentedStatBar label="PWR (P)" value={opponentFighter.stats.punchPower} />
                      <SegmentedStatBar label="PWR (K)" value={opponentFighter.stats.kickPower} />
                      <SegmentedStatBar label="SPD" value={opponentFighter.stats.reactionSpeed} />
                      <SegmentedStatBar label="END" value={opponentFighter.stats.endurance} />
                      <SegmentedStatBar label="HP" value={(100 + opponentFighter.stats.endurance * 20) / 20} max={12} />
                    </>
                  ) : (
                    <div style={{ fontFamily:'Orbitron', fontSize:'24px', color:'var(--text-muted)' }}>SELECT OPPONENT</div>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', gap:'16px', marginTop:'40px', maxWidth:'1000px', overflowX:'auto', padding:'20px' }}>
                {fighters.filter(f => f.id !== selectedFighterId).map(f => (
                  <div key={f.id} onClick={() => store.selectOpponent(f.id)} style={{ padding:'20px', minWidth:'200px', background: opponentFighterId === f.id ? 'rgba(217,0,34,0.2)' : 'rgba(0,0,0,0.6)', border:`2px solid ${opponentFighterId === f.id ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)'}`, borderRadius:'8px', cursor:'pointer', textAlign:'center', transition:'all 0.3s' }}>
                    <div style={{ fontFamily:'Orbitron', fontSize:'20px', fontWeight:800 }}>{f.name.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {opponentFighter && (
                <motion.button className="game-btn primary" style={{ marginTop:'40px', fontSize:'24px', padding:'24px 64px' }} initial={{ scale:0 }} animate={{ scale:1 }} onClick={handleStartFight}>
                  START FIGHT
                </motion.button>
              )}
            </motion.div>
          )}

          {scene === 'fight' && (
            <div className="fight-hud">
              <div className="health-bar-wrapper">
                <div className="hud-name" style={{ color: '#4488FF' }}>{selectedFighter?.name.toUpperCase()}</div>
                <div className="health-bar-track">
                  <motion.div className={`health-bar-fill ${(fightPlayerHP / fightMaxHP) < 0.25 ? 'critical' : ''}`} animate={{ width: `${Math.max(0, (fightPlayerHP / fightMaxHP)) * 100}%` }} />
                </div>
              </div>
              
              <div className="health-bar-wrapper" style={{ transform:'skewX(20deg)' }}>
                <div className="hud-name" style={{ color: '#FF2244', textAlign:'right', transform:'skewX(-20deg)' }}>{opponentFighter?.name.toUpperCase()}</div>
                <div className="health-bar-track" style={{ transform:'scaleX(-1)' }}>
                  <motion.div className={`health-bar-fill ${(fightOpponentHP / fightOpponentMaxHP) < 0.25 ? 'critical' : ''}`} animate={{ width: `${Math.max(0, (fightOpponentHP / fightOpponentMaxHP)) * 100}%` }} />
                </div>
              </div>
            </div>
          )}
          
          {scene === 'victory' && (
            <motion.div key="vic" className="result-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="result-title victory" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>VICTORY</motion.div>
              <div style={{ fontFamily:'Orbitron', fontSize:'32px', color:'white', marginBottom:'60px', letterSpacing:'4px' }}>{selectedFighter?.name.toUpperCase()} WINS</div>
              <button className="game-btn primary" onClick={() => store.setScene('main_menu')}>CONTINUE</button>
            </motion.div>
          )}

          {scene === 'defeat' && (
            <motion.div key="def" className="result-screen" style={{ background:'rgba(20,0,0,0.9)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="result-title defeat" initial={{ scale: 1.2 }} animate={{ scale: 1 }}>DEFEAT</motion.div>
              <div style={{ fontFamily:'Orbitron', fontSize:'32px', color:'var(--text-secondary)', marginBottom:'60px', letterSpacing:'4px' }}>KNOCKOUT</div>
              <button className="game-btn" onClick={() => store.setScene('main_menu')}>CONTINUE</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
