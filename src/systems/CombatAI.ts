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

export function chooseAIAction(combatState: CombatState): CombatAction {
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
    // Aggressive
    weights = { heavy_strike: 35, light_strike: 30, defend: 10, dodge: 15, special: 10 };
  } else if (stats.endurance > 5) {
    // Defensive
    weights = { heavy_strike: 15, light_strike: 20, defend: 30, dodge: 25, special: 10 };
  } else if (stats.reactionSpeed > 5) {
    // Evasive
    weights = { heavy_strike: 15, light_strike: 25, defend: 15, dodge: 35, special: 10 };
  }

  // HP-aware Adjustments
  const aiHPPercent = combatState.opponentHP / combatState.opponentMaxHP;
  const playerHPPercent = combatState.playerHP / combatState.playerMaxHP;

  if (aiHPPercent < 0.3) {
    weights.defend += 15;
    weights.dodge += 10;
  }
  if (aiHPPercent > 0.7 && playerHPPercent < 0.3) {
    weights.heavy_strike += 20;
  }

  // Pattern Counter (analyze player's last 3 actions)
  const history = combatState.turnHistory;
  if (history.length > 0) {
    const recent = history.slice(-3);
    const heavyCount = recent.filter(t => t.playerAction === 'heavy_strike').length;
    const lightCount = recent.filter(t => t.playerAction === 'light_strike').length;
    const defendCount = recent.filter(t => t.playerAction === 'defend').length;

    // If player uses lots of heavy strikes -> counter with dodge or light strike
    if (heavyCount >= 2) {
      weights.dodge += 20;
      weights.light_strike += 15;
    }
    // If player uses lots of light strikes -> counter with heavy strike or defend
    if (lightCount >= 2) {
      weights.heavy_strike += 20;
      weights.defend += 15;
    }
    // If player defends a lot -> counter with special or wait out with defend
    if (defendCount >= 2) {
      weights.special += 15;
    }
  }

  // Normalize weights and pick weighted random
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let randomVal = Math.random() * totalWeight;

  for (const [action, weight] of Object.entries(weights)) {
    randomVal -= weight;
    if (randomVal <= 0) {
      return action as CombatAction;
    }
  }

  return 'light_strike'; // Fallback
}
