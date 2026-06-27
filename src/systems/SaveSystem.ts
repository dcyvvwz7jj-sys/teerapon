// ============================================================
// LEARN FIGHT — Save System (v2 — Major Overhaul)
// ============================================================
import { Fighter, GameSettings } from '@/types/game';

const SAVE_KEY = 'learn_fight_save_v2';
const LEGACY_SAVE_KEY = 'learn_fight_save';
const CURRENT_VERSION = 2;

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

const DEFAULT_FIGHTER_IDS = ['kronos', 'vortex', 'aegis', 'blaze', 'phantom', 'raze', 'sage'] as const;
const LEGACY_DEFAULT_IDS = ['char_1', 'char_2', 'char_3', 'char_4', 'char_5', 'char_6', 'char_7'] as const;

const DEFAULT_FIGHTERS: Fighter[] = [
  {
    id: 'kronos', name: 'KRONOS', skinId: 'skin_01', skinPreset: 'skin_01', level: 4, ability: 'crushing_blow',
    stats: { punchPower: 7, kickPower: 3, reactionSpeed: 1, endurance: 5 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now(),
  },
  {
    id: 'vortex', name: 'VORTEX', skinId: 'skin_02', skinPreset: 'skin_02', level: 3, ability: 'afterimage',
    stats: { punchPower: 2, kickPower: 4, reactionSpeed: 7, endurance: 2 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now(),
  },
  {
    id: 'aegis', name: 'AEGIS', skinId: 'skin_03', skinPreset: 'skin_03', level: 3, ability: 'iron_wall',
    stats: { punchPower: 3, kickPower: 3, reactionSpeed: 2, endurance: 7 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now(),
  },
  {
    id: 'blaze', name: 'BLAZE', skinId: 'skin_04', skinPreset: 'skin_04', level: 4, ability: 'wildfire',
    stats: { punchPower: 5, kickPower: 6, reactionSpeed: 4, endurance: 2 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now(),
  },
  {
    id: 'phantom', name: 'PHANTOM', skinId: 'skin_05', skinPreset: 'skin_05', level: 4, ability: 'phase_shift',
    stats: { punchPower: 3, kickPower: 3, reactionSpeed: 6, endurance: 4 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now(),
  },
  {
    id: 'raze', name: 'RAZE', skinId: 'skin_06', skinPreset: 'skin_06', level: 4, ability: 'blood_rage',
    stats: { punchPower: 6, kickPower: 6, reactionSpeed: 3, endurance: 2 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now(),
  },
  {
    id: 'sage', name: 'SAGE', skinId: 'skin_07', skinPreset: 'skin_07', level: 4, ability: 'mind_read',
    stats: { punchPower: 4, kickPower: 4, reactionSpeed: 5, endurance: 5 },
    trainingSessions: 0, matchHistory: [], createdAt: Date.now(),
  },
];

/**
 * Migrate v1 save data to v2.
 * Removes old default characters (char_1 through char_7) and replaces
 * them with the new roster. User-created fighters are preserved.
 */
function migrateV1toV2(oldData: SaveData): SaveData {
  const legacyIds = new Set<string>(LEGACY_DEFAULT_IDS);
  // Keep only user-created fighters (anything that isn't a legacy default)
  const userFighters = oldData.fighters.filter(f => !legacyIds.has(f.id));
  return {
    fighters: [...DEFAULT_FIGHTERS, ...userFighters],
    settings: { ...DEFAULT_SETTINGS, ...oldData.settings },
    version: CURRENT_VERSION,
  };
}

/**
 * Ensure all 7 default fighters exist in the save data.
 * Missing defaults are prepended to the fighters array.
 */
function ensureDefaults(data: SaveData): SaveData {
  const existingIds = new Set(data.fighters.map(f => f.id));
  const missing = DEFAULT_FIGHTERS.filter(f => !existingIds.has(f.id));
  const patchedFighters = [...missing, ...data.fighters].map(f => ({
    ...f,
    skinPreset: f.skinPreset || f.skinId,
    level: f.level || Math.floor((f.stats.punchPower + f.stats.kickPower + f.stats.reactionSpeed + f.stats.endurance) / 4) + 1,
  }));
  return { ...data, fighters: patchedFighters };
}

export function loadSave(): SaveData {
  // SSR-safe: return defaults on server
  if (typeof window === 'undefined') {
    return { fighters: DEFAULT_FIGHTERS, settings: DEFAULT_SETTINGS, version: CURRENT_VERSION };
  }

  try {
    // Try loading v2 save first
    const rawV2 = localStorage.getItem(SAVE_KEY);
    if (rawV2) {
      const data = JSON.parse(rawV2) as SaveData;
      if (!data.fighters) data.fighters = [];
      const patched = ensureDefaults(data);
      if (patched !== data) {
        saveToDisk(patched);
      }
      return patched;
    }

    // Try loading legacy v1 save and migrate
    const rawV1 = localStorage.getItem(LEGACY_SAVE_KEY);
    if (rawV1) {
      const oldData = JSON.parse(rawV1) as SaveData;
      if (!oldData.fighters) oldData.fighters = [];
      const migrated = migrateV1toV2(oldData);
      // Persist migrated data under new key and remove legacy
      saveToDisk(migrated);
      localStorage.removeItem(LEGACY_SAVE_KEY);
      return migrated;
    }
  } catch (e) {
    console.warn('Failed to load save data:', e);
  }

  // No save found — create fresh
  const freshData: SaveData = {
    fighters: DEFAULT_FIGHTERS,
    settings: DEFAULT_SETTINGS,
    version: CURRENT_VERSION,
  };
  saveToDisk(freshData);
  return freshData;
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
  localStorage.removeItem(LEGACY_SAVE_KEY);
}
