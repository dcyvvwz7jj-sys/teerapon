// ============================================================
// LEARN FIGHT — Turn-Based Combat Engine (Dokapon-Style)
// ============================================================
import { CombatState, CombatAction, TurnResult, TurnOutcome, AbilityId, Fighter } from '@/types/game';

export function calculateMaxHP(endurance: number): number {
  return 100 + endurance * 20;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Map Special action to effective base attack action for matrix resolution
function getEffectiveAction(action: CombatAction, ability: AbilityId): CombatAction {
  if (action !== 'special') return action;
  if (ability === 'iron_wall') return 'defend';
  if (ability === 'phase_shift' || ability === 'afterimage') return 'dodge';
  return 'light_strike'; // Offensive specials act like fast light strikes
}

export function resolveTurn(
  combatState: CombatState,
  playerAction: CombatAction,
  aiAction: CombatAction
): TurnResult {
  const player = combatState.playerFighter;
  const ai = combatState.opponentFighter;

  const playerAbility = player.ability;
  const aiAbility = ai.ability;

  const effPlayerAction = getEffectiveAction(playerAction, playerAbility);
  const effAiAction = getEffectiveAction(aiAction, aiAbility);

  let outcome: TurnOutcome = 'stalemate';
  let specialTriggered: AbilityId | null = null;

  let miracleComebackPlayer = false;
  let miracleComebackAi = false;

  if (playerAction === 'special') {
    specialTriggered = playerAbility;
    const hpRatio = combatState.playerHP / combatState.playerMaxHP;
    if (Math.random() < (hpRatio < 0.4 ? 0.45 : 0.25)) {
      miracleComebackPlayer = true;
    }
  }
  if (aiAction === 'special') {
    specialTriggered = aiAbility;
    const hpRatio = combatState.opponentHP / combatState.opponentMaxHP;
    if (Math.random() < (hpRatio < 0.4 ? 0.35 : 0.20)) {
      miracleComebackAi = true;
    }
  }

  // Phantom Phase Shift check (Invulnerability for 1 turn)
  if (playerAction === 'special' && playerAbility === 'phase_shift' && !combatState.phantomPhaseUsedThisRound) {
    outcome = 'stalemate';
  } else if (aiAction === 'special' && aiAbility === 'phase_shift') {
    outcome = 'stalemate';
  } else if (miracleComebackPlayer) {
    outcome = 'player_hits';
  } else if (miracleComebackAi) {
    outcome = 'opponent_hits';
  } else {
    // Standard Matrix Resolution
    if (effPlayerAction === 'heavy_strike') {
      if (effAiAction === 'heavy_strike') outcome = 'both_hit';
      else if (effAiAction === 'light_strike') outcome = 'player_hits';
      else if (effAiAction === 'defend') outcome = 'reduced';
      else if (effAiAction === 'dodge') outcome = 'opponent_counters';
    } else if (effPlayerAction === 'light_strike') {
      if (effAiAction === 'heavy_strike') outcome = 'opponent_hits';
      else if (effAiAction === 'light_strike') outcome = 'both_hit';
      else if (effAiAction === 'defend') outcome = 'blocked';
      else if (effAiAction === 'dodge') outcome = 'player_hits';
    } else if (effPlayerAction === 'defend') {
      if (effAiAction === 'heavy_strike') outcome = 'reduced';
      else if (effAiAction === 'light_strike') outcome = 'blocked';
      else outcome = 'stalemate';
    } else if (effPlayerAction === 'dodge') {
      if (effAiAction === 'heavy_strike') outcome = 'player_counters';
      else if (effAiAction === 'light_strike') outcome = 'opponent_hits';
      else outcome = 'stalemate';
    }
  }

  // Calculate Damage
  const calcDmg = (attacker: Fighter, defender: Fighter, isHeavy: boolean, isCounter: boolean, isReduced: boolean) => {
    const stat = isHeavy ? attacker.stats.punchPower : attacker.stats.kickPower;
    let base = (stat * 3) + getRandomInt(5, 15);

    if (isHeavy) base *= 1.5;
    else base *= 0.8;

    if (isCounter) base *= 1.5;

    // Crit check
    const critChance = attacker.stats.reactionSpeed * 0.02; // max 14%
    const isCrit = Math.random() < critChance;
    if (isCrit) base *= 1.8;

    // Ability Modifiers
    if (attacker.ability === 'crushing_blow' && isHeavy) base *= 1.4;
    if (attacker.ability === 'afterimage' && isCounter) base *= 2.0;
    if (attacker.ability === 'wildfire' && !isHeavy) base *= 1.5; // hits twice simulation
    if (attacker.ability === 'blood_rage') {
      const currentHP = attacker.id === player.id ? combatState.playerHP : combatState.opponentHP;
      const maxHP = attacker.id === player.id ? combatState.playerMaxHP : combatState.opponentMaxHP;
      if (currentHP / maxHP < 0.3) base *= 1.6;
    }

    // Defensive reductions
    if (isReduced) {
      if (defender.ability === 'iron_wall') base *= 0.15; // 85% reduction
      else base *= 0.30; // standard 70% reduction
    }

    return { damage: Math.round(Math.max(1, base)), isCrit };
  };

  let playerDamageDealt = 0;
  let playerDamageTaken = 0;
  let critOccurred = false;

  if (outcome === 'player_hits') {
    const res = calcDmg(player, ai, effPlayerAction === 'heavy_strike', false, false);
    playerDamageDealt = res.damage;
    critOccurred = res.isCrit;
  } else if (outcome === 'opponent_hits') {
    const res = calcDmg(ai, player, effAiAction === 'heavy_strike', false, false);
    playerDamageTaken = res.damage;
    critOccurred = res.isCrit;
  } else if (outcome === 'both_hit') {
    const pRes = calcDmg(player, ai, effPlayerAction === 'heavy_strike', false, false);
    const aRes = calcDmg(ai, player, effAiAction === 'heavy_strike', false, false);
    playerDamageDealt = pRes.damage;
    playerDamageTaken = aRes.damage;
    critOccurred = pRes.isCrit || aRes.isCrit;
  } else if (outcome === 'player_counters') {
    const res = calcDmg(player, ai, false, true, false);
    playerDamageDealt = res.damage;
    critOccurred = res.isCrit;
  } else if (outcome === 'opponent_counters') {
    const res = calcDmg(ai, player, false, true, false);
    playerDamageTaken = res.damage;
    critOccurred = res.isCrit;
  } else if (outcome === 'reduced') {
    if (effPlayerAction === 'heavy_strike') {
      const res = calcDmg(player, ai, true, false, true);
      playerDamageDealt = res.damage;
    } else {
      const res = calcDmg(ai, player, true, false, true);
      playerDamageTaken = res.damage;
    }
  }

  // Descriptions & Miracle Comeback Damage overrides
  let descTH = 'ต้านทานกำลัง! ไม่มีใครเพลี่ยงพล้ำ!';
  let descEN = 'Stalemate! No damage dealt!';

  if (miracleComebackPlayer) {
    playerDamageDealt = Math.round(Math.max(45, (player.stats.punchPower + player.stats.kickPower) * 12 * 2.3));
    critOccurred = true;
    descTH = `🎲✨ ดวงปาฏิหาริย์! ${player.name} ระเบิดพลังพิเศษพลิกสถานการณ์ทำลายการ์ดสำเร็จ! ทำดาเมจมหาศาล ${playerDamageDealt}`;
    descEN = `🎲✨ Miracle Comeback! ${player.name} unleashes special luck to crush the guard for ${playerDamageDealt} dmg!`;
  } else if (miracleComebackAi) {
    playerDamageTaken = Math.round(Math.max(45, (ai.stats.punchPower + ai.stats.kickPower) * 12 * 2.3));
    critOccurred = true;
    descTH = `🎲✨ ปาฏิหาริย์เกิดขึ้น! ${ai.name} วัดดวงสำเร็จ ระเบิดสกิลพลิกเกมสวนกลับ! ทำดาเมจ ${playerDamageTaken}`;
    descEN = `🎲✨ Miracle Comeback! ${ai.name} rolls lucky special power to counter for ${playerDamageTaken} dmg!`;
  } else if (outcome === 'player_hits') {
    descTH = `${player.name} โจมตีเข้าเป้าอย่างจัง! ทำดาเมจ ${playerDamageDealt}`;
    descEN = `${player.name} lands a clean strike for ${playerDamageDealt} dmg!`;
  } else if (outcome === 'opponent_hits') {
    descTH = `${ai.name} สวนกลับเร็วสวนหมัดเข้าเต็มหน้า! ทำดาเมจ ${playerDamageTaken}`;
    descEN = `${ai.name} strikes fast and lands for ${playerDamageTaken} dmg!`;
  } else if (outcome === 'both_hit') {
    descTH = `ปะทะเดือด! ต่างฝ่ายต่างแลกหมัดรุนแรง!`;
    descEN = `Furious clash! Both fighters trade heavy blows!`;
  } else if (outcome === 'player_counters') {
    descTH = `${player.name} หลบได้อย่างพริ้วไหวและสวนกลับอย่างรุนแรง! ทำดาเมจ ${playerDamageDealt}`;
    descEN = `${player.name} dodges gracefully and delivers a lethal counter for ${playerDamageDealt} dmg!`;
  } else if (outcome === 'opponent_counters') {
    descTH = `${ai.name} อ่านทางออก หลบแล้วสวนกลับเต็มแรง! ทำดาเมจ ${playerDamageTaken}`;
    descEN = `${ai.name} reads the attack, dodges and counters for ${playerDamageTaken} dmg!`;
  } else if (outcome === 'blocked') {
    descTH = `การโจมตีถูกตั้งการ์ดป้องกันไว้ได้อย่างสมบูรณ์!`;
    descEN = `The strike was fully absorbed by the defense!`;
  } else if (outcome === 'reduced') {
    descTH = `การ์ดแข็งแกร่ง! ลดทอนความเสียหายลงอย่างมาก!`;
    descEN = `Strong guard! Damage significantly reduced!`;
  }

  return {
    turn: combatState.turn,
    round: combatState.round,
    playerAction,
    aiAction,
    outcome,
    playerDamageDealt,
    playerDamageTaken,
    description: descEN,
    descriptionTH: descTH,
    isCritical: critOccurred,
    specialTriggered,
  };
}
