// ============================================================
// LEARN FIGHT — Zustand Game State Store
// ============================================================
import { create } from 'zustand';
import { Fighter, GameScene, GameSettings, AbilityId, Stats, TrainingType, FightState, MatchRecord } from '@/types/game';
import { loadSave, saveToDisk } from './SaveSystem';
import { MAX_TRAINING_SESSIONS, STAT_MAX } from '@/data/constants';

interface GameStore {
  // Navigation
  scene: GameScene;
  previousScene: GameScene;
  setScene: (scene: GameScene) => void;
  goBack: () => void;

  // Fighters
  fighters: Fighter[];
  selectedFighterId: string | null;
  opponentFighterId: string | null;
  selectFighter: (id: string) => void;
  selectOpponent: (id: string) => void;
  createFighter: (name: string, skinId: string, ability: AbilityId) => void;
  deleteFighter: (id: string) => void;

  // Training
  currentTrainingType: TrainingType | null;
  isTraining: boolean;
  trainFighter: (type: TrainingType) => void;
  finishTraining: () => void;
  setCurrentTrainingType: (type: TrainingType | null) => void;

  // Fight
  fightState: FightState | null;
  setFightState: (state: FightState | null) => void;
  recordMatch: (playerId: string, opponentId: string, result: MatchRecord) => void;

  // Settings
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Init
  initialized: boolean;
  initializeGame: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Navigation
  scene: 'main_menu',
  previousScene: 'main_menu',
  setScene: (scene) => set((state) => ({ scene, previousScene: state.scene })),
  goBack: () => set((state) => ({ scene: state.previousScene, previousScene: 'main_menu' })),

  // Fighters
  fighters: [],
  selectedFighterId: null,
  opponentFighterId: null,
  selectFighter: (id) => set({ selectedFighterId: id }),
  selectOpponent: (id) => set({ opponentFighterId: id }),
  
  createFighter: (name, skinId, ability) => {
    const newFighter: Fighter = {
      id: generateId(),
      name,
      skinId,
      ability,
      stats: { punchPower: 1, kickPower: 1, reactionSpeed: 1, endurance: 1 },
      trainingSessions: 0,
      matchHistory: [],
      createdAt: Date.now(),
    };
    set((state) => {
      const fighters = [...state.fighters, newFighter];
      saveToDisk({ fighters, settings: state.settings, version: 1 });
      return { fighters, selectedFighterId: newFighter.id };
    });
  },

  deleteFighter: (id) => {
    set((state) => {
      const fighters = state.fighters.filter((f) => f.id !== id);
      saveToDisk({ fighters, settings: state.settings, version: 1 });
      return {
        fighters,
        selectedFighterId: state.selectedFighterId === id ? null : state.selectedFighterId,
      };
    });
  },

  // Training
  currentTrainingType: null,
  isTraining: false,
  setCurrentTrainingType: (type) => set({ currentTrainingType: type }),

  trainFighter: (type) => {
    const state = get();
    const fighter = state.fighters.find((f) => f.id === state.selectedFighterId);
    if (!fighter || fighter.trainingSessions >= MAX_TRAINING_SESSIONS) return;

    set({ isTraining: true, currentTrainingType: type });
  },

  finishTraining: () => {
    const state = get();
    const fighter = state.fighters.find((f) => f.id === state.selectedFighterId);
    if (!fighter || !state.currentTrainingType) return;

    const statKey: Record<TrainingType, keyof Stats> = {
      punch: 'punchPower',
      kick: 'kickPower',
      reaction: 'reactionSpeed',
      endurance: 'endurance',
    };

    const key = statKey[state.currentTrainingType];
    const r = Math.random();
    const increase = r < 0.3 ? 0.05 : r < 0.7 ? 0.10 : r < 0.9 ? 0.15 : 0.20;
    const newValue = Math.min(STAT_MAX, Math.round((fighter.stats[key] + increase) * 100) / 100);

    const updatedFighter: Fighter = {
      ...fighter,
      stats: { ...fighter.stats, [key]: newValue },
      trainingSessions: fighter.trainingSessions + 1,
    };

    const fighters = state.fighters.map((f) => (f.id === fighter.id ? updatedFighter : f));
    saveToDisk({ fighters, settings: state.settings, version: 1 });
    set({ fighters, isTraining: false });
  },

  // Fight
  fightState: null,
  setFightState: (fightState) => set({ fightState }),

  recordMatch: (playerId, opponentId, result) => {
    set((state) => {
      const fighters = state.fighters.map((f) => {
        if (f.id === playerId) {
          return { ...f, matchHistory: [...f.matchHistory, result] };
        }
        return f;
      });
      saveToDisk({ fighters, settings: state.settings, version: 1 });
      return { fighters };
    });
  },

  // Settings
  settings: { language: 'th', sfxVolume: 0.7, musicVolume: 0.5, quality: 'high' },
  updateSettings: (newSettings) => {
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      saveToDisk({ fighters: state.fighters, settings, version: 1 });
      return { settings };
    });
  },

  // Init
  initialized: false,
  initializeGame: () => {
    const save = loadSave();
    set({
      fighters: save.fighters,
      settings: save.settings,
      initialized: true,
    });
  },
}));
