// ============================================================
// LEARN FIGHT — Game Types (v2 — Major Overhaul)
// ============================================================

// --- Ability System ---
export type AbilityId =
  | 'crushing_blow'    // KRONOS
  | 'afterimage'       // VORTEX
  | 'iron_wall'        // AEGIS
  | 'wildfire'         // BLAZE
  | 'phase_shift'      // PHANTOM
  | 'blood_rage'       // RAZE
  | 'mind_read';       // SAGE

export interface Ability {
  id: AbilityId;
  nameTH: string;
  nameEN: string;
  descriptionTH: string;
  descriptionEN: string;
  icon: string;
  color: string;
}

// --- Fighter Stats ---
export interface Stats {
  punchPower: number;   // 0–7
  kickPower: number;    // 0–7
  reactionSpeed: number;// 0–7
  endurance: number;    // 0–7
}

export type TrainingType = 'punch' | 'kick' | 'reaction' | 'endurance';

// --- Fighter ---
export interface Fighter {
  id: string;
  name: string;
  skinId: string;
  skinPreset?: string;
  level?: number;
  ability: AbilityId;
  stats: Stats;
  trainingSessions: number;
  matchHistory: MatchRecord[];
  createdAt: number;
}

export interface MatchRecord {
  opponentId: string;
  opponentName: string;
  result: 'win' | 'loss';
  method: 'KO' | 'TKO' | 'Decision';
  round: number;
  date: number;
}

// --- Skin & Visual Data ---
export interface SkinColors {
  skin: string;
  hair: string;
  shorts: string;
  gloves: string;
  shoes: string;
  accent: string;
}

export interface BodyType {
  name: string;
  headScale: number;
  torsoScale: [number, number, number];
  armScale: [number, number];
  legScale: [number, number];
  shoulderWidth: number;
}

// --- Scene Navigation ---
export type GameScene =
  | 'main_menu'
  | 'fighter_select'
  | 'training_hub'
  | 'combat'
  | 'match_result'
  | 'character_creation'
  | 'character_list'
  | 'character_detail'
  | 'training_select'
  | 'training'
  | 'fight_select'
  | 'fight'
  | 'victory'
  | 'defeat';

// --- Combat System (Dokapon-Style Turn-Based) ---
export type CombatAction = 'heavy_strike' | 'light_strike' | 'defend' | 'dodge' | 'special';

export type CombatPhase =
  | 'intro'           // Pre-fight cinematic
  | 'select_action'   // Player choosing action (alias)
  | 'action_select'   // Player choosing action
  | 'resolving'       // Resolving clash (alias)
  | 'revealing'       // Dramatic reveal of both actions
  | 'animating'       // 3D animations playing
  | 'result'          // Damage numbers, effects
  | 'round_end'       // Between rounds
  | 'ko'              // KO sequence
  | 'finished';       // Combat over

export type TurnOutcome =
  | 'player_hits'        // Player's attack lands
  | 'opponent_hits'      // Opponent's attack lands
  | 'both_hit'           // Trade — both take damage
  | 'player_counters'    // Player dodges and counters
  | 'opponent_counters'  // Opponent dodges and counters
  | 'blocked'            // Attack fully blocked
  | 'reduced'            // Attack partially blocked (reduced damage)
  | 'stalemate'          // No damage dealt
  | 'special_activated'; // Special ability activated

export interface TurnResult {
  turn: number;
  round: number;
  playerAction: CombatAction;
  aiAction: CombatAction;
  outcome: TurnOutcome;
  playerDamageDealt: number;
  playerDamageTaken: number;
  description: string;
  descriptionTH: string;
  isCritical: boolean;
  specialTriggered: AbilityId | null;
}

export interface CombatState {
  playerFighter: Fighter;
  opponentFighter: Fighter;
  playerHP: number;
  playerMaxHP: number;
  opponentHP: number;
  opponentMaxHP: number;
  round: number;
  turn: number;
  phase: CombatPhase;
  turnHistory: TurnResult[];
  currentPlayerAction: CombatAction | null;
  currentAIAction: CombatAction | null;
  currentTurnResult: TurnResult | null;
  winner: 'player' | 'opponent' | null;
  method: 'KO' | 'TKO' | 'Decision' | null;
  // Ability tracking
  phantomPhaseUsedThisRound: boolean;
  blazeDoTTurnsRemaining: number;
  blazeDoTDamage: number;
  sageTurnsElapsed: number;
  sageCanReadMind: boolean;
  revealedAIAction: CombatAction | null; // For SAGE mind read
  playerSpecialUsed?: boolean;
  aiSpecialUsed?: boolean;
}

// --- Training Minigame ---
export type TrainingGrade = 'S' | 'A' | 'B' | 'C' | 'F';

export interface TrainingResult {
  type: TrainingType;
  grade: TrainingGrade;
  statGain: number;
  score: number;        // 0–100 percentage
  maxScore: number;
}

// --- Game Settings ---
export interface GameSettings {
  language: 'th' | 'en';
  sfxVolume: number;
  musicVolume: number;
  quality: 'high' | 'medium' | 'low';
}

// --- Punch & Kick Types (for animations) ---
export const PUNCH_TYPES = ['jab', 'cross', 'hook', 'uppercut', 'body_shot', 'liver_shot', 'overhand'] as const;
export type PunchType = typeof PUNCH_TYPES[number];

export const KICK_TYPES = ['low_kick', 'body_kick', 'high_kick', 'front_kick', 'side_kick', 'roundhouse', 'spinning_kick'] as const;
export type KickType = typeof KICK_TYPES[number];
