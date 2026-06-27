// ============================================================
// LEARN FIGHT — Zustand Game State Store (v2 — Major Overhaul)
// ============================================================
import { create } from 'zustand';
import {
  Fighter, GameScene, GameSettings, AbilityId, Stats,
  TrainingType, CombatState, CombatAction, CombatPhase,
  TurnResult, TrainingResult
} from '@/types/game';
import { loadSave, saveToDisk } from './SaveSystem';
import { STAT_MAX, MAX_TRAINING_SESSIONS } from '@/data/constants';
import { setSFXVolume, setMusicVolume } from './AudioSystem';

// ---- Store Interface ----
interface GameStore {
  // Navigation (proper history stack)
  scene: GameScene;
  sceneHistory: GameScene[];
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
  setCurrentTrainingType: (type: TrainingType | null) => void;
  applyTrainingResult: (result: TrainingResult) => void;

  // Combat (Turn-Based)
  combatState: CombatState | null;
  startCombat: (playerId: string, opponentId: string) => void;
  setCombatPhase: (phase: CombatPhase) => void;
  setPlayerAction: (action: CombatAction) => void;
  applyTurnResult: (result: TurnResult) => void;
  endCombat: (winner: 'player' | 'opponent', method: 'KO' | 'TKO' | 'Decision') => void;
  updateCombatState: (partial: Partial<CombatState>) => void;

  // Settings
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Init
  initialized: boolean;
  initializeGame: () => void;
}

// ---- Helpers ----
function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function calculateMaxHP(endurance: number): number {
  return 100 + endurance * 20;
}

// ---- Store ----
export const useGameStore = create<GameStore>((set, get) => ({
  // ─── Navigation ───
  scene: 'main_menu',
  sceneHistory: [],
  setScene: (scene) => set((state) => ({
    scene,
    sceneHistory: [...state.sceneHistory, state.scene],
  })),
  goBack: () => set((state) => {
    const history = [...state.sceneHistory];
    const prev = history.pop() || 'main_menu';
    return { scene: prev, sceneHistory: history };
  }),

  // ─── Fighters ───
  fighters: [],
  selectedFighterId: null,
  opponentFighterId: null,
  selectFighter: (id) => set({ selectedFighterId: id }),
  selectOpponent: (id) => set({ opponentFighterId: id }),

  createFighter: (name, skinId, ability) => {
    set((state) => {
      const newFighter: Fighter = {
        id: generateId(),
        name: name.toUpperCase(),
        skinId,
        skinPreset: skinId,
        level: 1,
        ability,
        stats: { punchPower: 1, kickPower: 1, reactionSpeed: 1, endurance: 1 },
        trainingSessions: 0,
        matchHistory: [],
        createdAt: Date.now(),
      };
      const fighters = [...state.fighters, newFighter];
      saveToDisk({ fighters, settings: state.settings, version: 2 });
      return { fighters, selectedFighterId: newFighter.id };
    });
  },

  deleteFighter: (id) => {
    set((state) => {
      const fighters = state.fighters.filter((f) => f.id !== id);
      saveToDisk({ fighters, settings: state.settings, version: 2 });
      return {
        fighters,
        selectedFighterId: state.selectedFighterId === id ? null : state.selectedFighterId,
      };
    });
  },

  // ─── Training ───
  currentTrainingType: null,
  setCurrentTrainingType: (type) => set({ currentTrainingType: type }),

  applyTrainingResult: (result) => {
    set((state) => {
      const fighterId = state.selectedFighterId;
      if (!fighterId) return state;

      const fighters = state.fighters.map((f) => {
        if (f.id !== fighterId) return f;
        if (f.trainingSessions >= MAX_TRAINING_SESSIONS) return f;

        const stats = { ...f.stats };
        const gain = result.statGain;

        switch (result.type) {
          case 'punch':
            stats.punchPower = Math.min(STAT_MAX, Math.round((stats.punchPower + gain) * 100) / 100);
            break;
          case 'kick':
            stats.kickPower = Math.min(STAT_MAX, Math.round((stats.kickPower + gain) * 100) / 100);
            break;
          case 'reaction':
            stats.reactionSpeed = Math.min(STAT_MAX, Math.round((stats.reactionSpeed + gain) * 100) / 100);
            break;
          case 'endurance':
            stats.endurance = Math.min(STAT_MAX, Math.round((stats.endurance + gain) * 100) / 100);
            break;
        }

        return { ...f, stats, trainingSessions: f.trainingSessions + 1 };
      });

      saveToDisk({ fighters, settings: state.settings, version: 2 });
      return { fighters };
    });
  },

  // ─── Combat ───
  combatState: null,

  startCombat: (playerId, opponentId) => {
    const state = get();
    const player = state.fighters.find((f) => f.id === playerId);
    const opponent = state.fighters.find((f) => f.id === opponentId);
    if (!player || !opponent) return;

    const combatState: CombatState = {
      playerFighter: player,
      opponentFighter: opponent,
      playerHP: calculateMaxHP(player.stats.endurance),
      playerMaxHP: calculateMaxHP(player.stats.endurance),
      opponentHP: calculateMaxHP(opponent.stats.endurance),
      opponentMaxHP: calculateMaxHP(opponent.stats.endurance),
      round: 1,
      turn: 1,
      phase: 'intro',
      turnHistory: [],
      currentPlayerAction: null,
      currentAIAction: null,
      currentTurnResult: null,
      winner: null,
      method: null,
      phantomPhaseUsedThisRound: false,
      blazeDoTTurnsRemaining: 0,
      blazeDoTDamage: 0,
      sageTurnsElapsed: 0,
      sageCanReadMind: false,
      revealedAIAction: null,
    };

    set({ combatState });
  },

  setCombatPhase: (phase) => {
    set((state) => {
      if (!state.combatState) return state;
      return { combatState: { ...state.combatState, phase } };
    });
  },

  setPlayerAction: (action) => {
    set((state) => {
      if (!state.combatState) return state;
      return { combatState: { ...state.combatState, currentPlayerAction: action } };
    });
  },

  applyTurnResult: (result) => {
    set((state) => {
      if (!state.combatState) return state;
      const cs = state.combatState;
      return {
        combatState: {
          ...cs,
          playerHP: Math.max(0, cs.playerHP - result.playerDamageTaken),
          opponentHP: Math.max(0, cs.opponentHP - result.playerDamageDealt),
          turn: cs.turn + 1,
          turnHistory: [...cs.turnHistory, result],
          currentTurnResult: result,
          currentPlayerAction: null,
          currentAIAction: null,
          // Track SAGE turns
          sageTurnsElapsed: cs.sageTurnsElapsed + 1,
          sageCanReadMind: (cs.sageTurnsElapsed + 1) >= 3 && cs.playerFighter.ability === 'mind_read',
          // Reset PHANTOM per round
          phantomPhaseUsedThisRound: result.specialTriggered === 'phase_shift'
            ? true : cs.phantomPhaseUsedThisRound,
          // BLAZE DoT tracking
          blazeDoTTurnsRemaining: result.specialTriggered === 'wildfire'
            ? 3 : Math.max(0, cs.blazeDoTTurnsRemaining - 1),
          blazeDoTDamage: result.specialTriggered === 'wildfire'
            ? 5 : cs.blazeDoTDamage,
        },
      };
    });
  },

  endCombat: (winner, method) => {
    set((state) => {
      if (!state.combatState) return state;
      const cs = state.combatState;

      // Record match
      const record = {
        opponentId: winner === 'player' ? cs.opponentFighter.id : cs.playerFighter.id,
        opponentName: winner === 'player' ? cs.opponentFighter.name : cs.playerFighter.name,
        result: (winner === 'player' ? 'win' : 'loss') as 'win' | 'loss',
        method,
        round: cs.round,
        date: Date.now(),
      };

      const fighters = state.fighters.map((f) => {
        if (f.id === cs.playerFighter.id) {
          return { ...f, matchHistory: [...f.matchHistory, record] };
        }
        return f;
      });

      saveToDisk({ fighters, settings: state.settings, version: 2 });

      return {
        fighters,
        combatState: { ...cs, winner, method, phase: 'finished' as CombatPhase },
      };
    });
  },

  updateCombatState: (partial) => {
    set((state) => {
      if (!state.combatState) return state;
      return { combatState: { ...state.combatState, ...partial } };
    });
  },

  // ─── Settings ───
  settings: { language: 'th', sfxVolume: 0.7, musicVolume: 0.5, quality: 'high' },
  updateSettings: (newSettings) => {
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      setSFXVolume(settings.sfxVolume);
      setMusicVolume(settings.musicVolume);
      saveToDisk({ fighters: state.fighters, settings, version: 2 });
      return { settings };
    });
  },

  // ─── Init ───
  initialized: false,
  initializeGame: () => {
    const save = loadSave();
    setSFXVolume(save.settings.sfxVolume);
    setMusicVolume(save.settings.musicVolume);
    set({
      fighters: save.fighters,
      settings: save.settings,
      initialized: true,
    });
  },
}));
