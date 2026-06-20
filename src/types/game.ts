// ============================================================
// LEARN FIGHT — Game Type Definitions
// ============================================================

export type AbilityId =
  | 'iron_fist'
  | 'iron_kick'
  | 'iron_body'
  | 'fast_recovery'
  | 'lightning_reflexes'
  | 'auto_dodge'
  | 'read_opponent'
  | 'counter_king'
  | 'explosive_power'
  | 'berserker';

export interface Ability {
  id: AbilityId;
  nameTH: string;
  nameEN: string;
  descriptionTH: string;
  descriptionEN: string;
  icon: string;
  color: string;
}

export interface Stats {
  punchPower: number;    // 0-7
  kickPower: number;     // 0-7
  reactionSpeed: number; // 0-7
  endurance: number;     // 0-7
}

export interface Fighter {
  id: string;
  name: string;
  skinId: string;
  ability: AbilityId;
  stats: Stats;
  trainingSessions: number; // max 20
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

export type TrainingType = 'punch' | 'kick' | 'reaction' | 'endurance';

export type GameScene =
  | 'main_menu'
  | 'character_creation'
  | 'character_list'
  | 'character_detail'
  | 'training_select'
  | 'training'
  | 'fight_select'
  | 'fight'
  | 'victory'
  | 'defeat';

export type PunchType = 'jab' | 'cross' | 'hook' | 'uppercut' | 'body_shot' | 'liver_shot' | 'overhand';
export type KickType = 'low_kick' | 'body_kick' | 'high_kick' | 'front_kick' | 'side_kick' | 'roundhouse' | 'spinning_kick';

export interface FightEvent {
  type: 'punch' | 'kick' | 'block' | 'dodge' | 'counter' | 'knockdown' | 'recovery' | 'move' | 'idle' | 'stun' | 'guard';
  attacker: 'player' | 'opponent';
  moveType?: PunchType | KickType;
  moveDirection?: 'forward' | 'backward' | 'circle_left' | 'circle_right';
  damage?: number;
  success: boolean;
  timestamp: number;
  isCritical?: boolean;
  isSlowMo?: boolean;
}

export interface FightState {
  playerHP: number;
  opponentHP: number;
  playerMaxHP: number;
  opponentMaxHP: number;
  round: number;
  maxRounds: number;
  events: FightEvent[];
  currentEventIndex: number;
  isFinished: boolean;
  winner: 'player' | 'opponent' | null;
  method: 'KO' | 'TKO' | 'Decision' | null;
}

export interface SkinData {
  id: string;
  name: string;
  texture: string; // path to PNG
}

export interface GameSettings {
  language: 'th' | 'en';
  sfxVolume: number;
  musicVolume: number;
  quality: 'low' | 'medium' | 'high';
}
