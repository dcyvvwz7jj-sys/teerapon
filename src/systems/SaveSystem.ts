// ============================================================
// LEARN FIGHT — Save System (localStorage)
// ============================================================
import { Fighter, GameSettings } from '@/types/game';

const SAVE_KEY = 'learn_fight_save';

export interface SaveData {
  fighters: Fighter[];
  settings: GameSettings;
  version: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  language: 'th',
  sfxVolume: 0.7,
  musicVolume: 0.5,
  quality: 'high',
};

const DEFAULT_FIGHTERS: Fighter[] = [
  {
    id: 'char_1', name: 'TIGER', skinId: 'skin_03', ability: 'iron_fist',
    stats: { punchPower: 7, kickPower: 3, reactionSpeed: 2, endurance: 3 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now()
  },
  {
    id: 'char_2', name: 'VIPER', skinId: 'skin_05', ability: 'lightning_reflexes',
    stats: { punchPower: 2, kickPower: 4, reactionSpeed: 7, endurance: 2 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now()
  },
  {
    id: 'char_3', name: 'GOLEM', skinId: 'skin_07', ability: 'iron_body',
    stats: { punchPower: 5, kickPower: 2, reactionSpeed: 1, endurance: 7 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now()
  },
  {
    id: 'char_4', name: 'DRAGON', skinId: 'skin_04', ability: 'iron_kick',
    stats: { punchPower: 3, kickPower: 7, reactionSpeed: 5, endurance: 3 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now()
  },
  {
    id: 'char_5', name: 'PHANTOM', skinId: 'skin_02', ability: 'auto_dodge',
    stats: { punchPower: 3, kickPower: 3, reactionSpeed: 6, endurance: 5 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now()
  },
  {
    id: 'char_6', name: 'ASURA', skinId: 'skin_06', ability: 'berserker',
    stats: { punchPower: 6, kickPower: 6, reactionSpeed: 3, endurance: 2 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now()
  },
  {
    id: 'char_7', name: 'MASTER', skinId: 'skin_01', ability: 'read_opponent',
    stats: { punchPower: 5, kickPower: 5, reactionSpeed: 5, endurance: 5 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now()
  }
];

export function loadSave(): SaveData {
  if (typeof window === 'undefined') {
    return { fighters: DEFAULT_FIGHTERS, settings: DEFAULT_SETTINGS, version: 1 };
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as SaveData;
      // Ensure the 7 default characters always exist
      if (!data.fighters) data.fighters = [];
      const existingIds = new Set(data.fighters.map(f => f.id));
      const missingDefaults = DEFAULT_FIGHTERS.filter(f => !existingIds.has(f.id));
      
      if (missingDefaults.length > 0) {
        data.fighters = [...missingDefaults, ...data.fighters];
        saveToDisk(data);
      }
      return data;
    }
  } catch (e) {
    console.warn('Failed to load save data:', e);
  }
  const defaultData = { fighters: DEFAULT_FIGHTERS, settings: DEFAULT_SETTINGS, version: 1 };
  saveToDisk(defaultData);
  return defaultData;
}

export function saveToDisk(data: SaveData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save data:', e);
  }
}

export function clearSave(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVE_KEY);
}
