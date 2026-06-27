// ============================================================
// LEARN FIGHT — Combat AI Decision System
// ============================================================
import { CombatState, CombatAction } from '@/types/game';

interface ActionWeights {
  heavy_strike: number;
  light_strike: number;
  defend: number;
  dodge: number;
  special: number;
}

export function chooseAIAction(combatState: CombatState, isPlayerAttacker?: boolean): CombatAction {
  const ai = combatState.opponentFighter;
  const stats = ai.stats;

  // Base Personality Profile
  let weights: ActionWeights = {
    heavy_strike: 20,
    light_strike: 20,
    defend: 20,
    dodge: 20,
    special: 20,
  };

  if (stats.punchPower + stats.kickPower > 8) {
    weights = { heavy_strike: 35, light_strike: 30, defend: 10, dodge: 15, special: 10 };
  } else if (stats.endurance > 5) {
    weights = { heavy_strike: 15, light_strike: 20, defend: 30, dodge: 25, special: 10 };
  } else if (stats.reactionSpeed > 5) {
    weights = { heavy_strike: 15, light_strike: 25, defend: 15, dodge: 35, special: 10 };
  }

  // If role is defined, zero out invalid actions for Dokapon turns!
  if (isPlayerAttacker === true) {
    // Player attacks -> AI defends
    weights.heavy_strike = 0;
    weights.light_strike = 0;
  } else if (isPlayerAttacker === false) {
    // Player defends -> AI attacks
    weights.defend = 0;
    weights.dodge = 0;
  }

  if (combatState.aiSpecialUsed === true) {
    weights.special = 0;
  }

  // HP-aware Adjustments
  const aiHPPercent = combatState.opponentHP / combatState.opponentMaxHP;
  const playerHPPercent = combatState.playerHP / combatState.playerMaxHP;

  if (aiHPPercent < 0.3 && isPlayerAttacker !== false) {
    weights.defend += 15;
    weights.dodge += 10;
  }
  if (aiHPPercent > 0.7 && playerHPPercent < 0.3 && isPlayerAttacker !== true) {
    weights.heavy_strike += 20;
  }

  // Normalize weights and pick weighted random
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let randomVal = Math.random() * totalWeight;

  for (const [action, weight] of Object.entries(weights)) {
    if (weight <= 0) continue;
    randomVal -= weight;
    if (randomVal <= 0) {
      return action as CombatAction;
    }
  }

  return isPlayerAttacker === true ? 'defend' : 'light_strike'; // Fallback
}
