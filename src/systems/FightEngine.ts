// ============================================================
// LEARN FIGHT — Fight Simulation Engine
// ============================================================
import { Fighter, FightEvent, FightState, AbilityId, PunchType, KickType } from '@/types/game';
import { PUNCH_TYPES, KICK_TYPES } from '@/data/constants';

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface EffectiveStats {
  punchDamage: number;
  kickDamage: number;
  dodgeChance: number;
  counterChance: number;
  maxHP: number;
  damageReduction: number;
  punchCritChance: number;
  kickCritChance: number;
}

function calculateEffectiveStats(fighter: Fighter): EffectiveStats {
  const s = fighter.stats;
  let punchDamage = 10 + s.punchPower * 5;
  let kickDamage = 12 + s.kickPower * 5;
  let dodgeChance = (5 + s.reactionSpeed * 8) / 100;
  let counterChance = (s.reactionSpeed * 6) / 100;
  let maxHP = 100 + s.endurance * 20;
  let damageReduction = (s.endurance * 4) / 100;
  let punchCritChance = (s.punchPower * 5) / 100;
  let kickCritChance = (s.kickPower * 5) / 100;

  // Apply ability modifiers
  switch (fighter.ability) {
    case 'iron_fist': punchDamage *= 1.4; break;
    case 'iron_kick': kickDamage *= 1.4; break;
    case 'iron_body': damageReduction = 1 - (1 - damageReduction) * 0.6; break;
    case 'lightning_reflexes': dodgeChance += 0.3; break;
    case 'counter_king': counterChance += 0.2; break;
    default: break;
  }

  return { punchDamage, kickDamage, dodgeChance, counterChance, maxHP, damageReduction, punchCritChance, kickCritChance };
}

export function simulateFight(player: Fighter, opponent: Fighter): FightState {
  const pStats = calculateEffectiveStats(player);
  const oStats = calculateEffectiveStats(opponent);

  let playerHP = pStats.maxHP;
  let opponentHP = oStats.maxHP;
  const events: FightEvent[] = [];
  let time = 0;
  const maxRounds = 3;
  let finished = false;
  let winner: 'player' | 'opponent' | null = null;
  let method: 'KO' | 'TKO' | 'Decision' | null = null;
  let playerDamageDealt = 0;
  let opponentDamageDealt = 0;

  // Trackers
  let playerAutoDodgeUsed: Record<number, boolean> = {};
  let opponentAutoDodgeUsed: Record<number, boolean> = {};
  let playerReadAccuracy = 0;
  let opponentReadAccuracy = 0;

  // Initial walk in
  events.push({ type: 'move', attacker: 'player', moveDirection: 'forward', success: true, timestamp: time, damage: 0 });
  events.push({ type: 'move', attacker: 'opponent', moveDirection: 'forward', success: true, timestamp: time, damage: 0 });
  time += 2.0;

  for (let round = 1; round <= maxRounds && !finished; round++) {
    const exchangeCount = Math.floor(rand(12, 18));
    
    // Round start guard
    events.push({ type: 'guard', attacker: 'player', success: true, timestamp: time });
    events.push({ type: 'guard', attacker: 'opponent', success: true, timestamp: time });
    time += 1.0;

    for (let ex = 0; ex < exchangeCount && !finished; ex++) {
      // 1. Movement / Positioning phase before strike
      const pCircle = pick(['circle_left', 'circle_right', 'forward', 'backward'] as const);
      const oCircle = pick(['circle_left', 'circle_right', 'forward', 'backward'] as const);
      
      events.push({ type: 'move', attacker: 'player', moveDirection: pCircle, success: true, timestamp: time });
      events.push({ type: 'move', attacker: 'opponent', moveDirection: oCircle, success: true, timestamp: time });
      time += rand(1.0, 2.5);

      // Determine attacker
      const playerGoesFirst = Math.random() < (0.5 + (player.stats.reactionSpeed - opponent.stats.reactionSpeed) * 0.05);
      const attackers: ('player' | 'opponent')[] = playerGoesFirst ? ['player', 'opponent'] : ['opponent', 'player'];

      for (const attacker of attackers) {
        if (finished) break;

        const isPlayer = attacker === 'player';
        const attackerFighter = isPlayer ? player : opponent;
        const defenderFighter = isPlayer ? opponent : player;
        const aStats = isPlayer ? pStats : oStats;
        const dStats = isPlayer ? oStats : pStats;

        // Choose attack
        const useKick = Math.random() < 0.4;
        const moveType = useKick ? pick(KICK_TYPES) as KickType : pick(PUNCH_TYPES) as PunchType;
        const baseDamage = useKick ? aStats.kickDamage : aStats.punchDamage;
        const critChance = useKick ? aStats.kickCritChance : aStats.punchCritChance;

        // Modifiers
        let damageMultiplier = 1;
        if (attackerFighter.ability === 'berserker') {
          const currentHP = isPlayer ? playerHP : opponentHP;
          damageMultiplier = 1 + (1 - currentHP / aStats.maxHP) * 0.8;
        }
        if (attackerFighter.ability === 'explosive_power' && Math.random() < 0.1) damageMultiplier *= 3;
        
        let accuracyBonus = 0;
        if (attackerFighter.ability === 'read_opponent') {
          const readAcc = isPlayer ? playerReadAccuracy : opponentReadAccuracy;
          accuracyBonus = readAcc * 0.05;
          if (isPlayer) playerReadAccuracy++; else opponentReadAccuracy++;
        }

        let dodgeChance = dStats.dodgeChance - accuracyBonus;

        // Auto dodge
        if (defenderFighter.ability === 'auto_dodge') {
          const used = isPlayer ? opponentAutoDodgeUsed : playerAutoDodgeUsed;
          if (!used[round]) {
            used[round] = true;
            events.push({ type: 'dodge', attacker, moveType, damage: 0, success: true, timestamp: time });
            time += 0.8;
            continue; // Defender dodges, attack misses
          }
        }

        const roll = Math.random();
        if (roll < dodgeChance) {
          // Dodged
          events.push({ type: 'dodge', attacker, moveType, damage: 0, success: true, timestamp: time });
          time += 0.6;

          // Counter attack chance
          if (Math.random() < dStats.counterChance) {
            const counterDamage = Math.round((useKick ? dStats.kickDamage : dStats.punchDamage) * 
              (defenderFighter.ability === 'counter_king' ? 1.5 : 1) * rand(0.9, 1.3));
            const defender = isPlayer ? 'opponent' : 'player';
            
            time += 0.3; // Slight delay for counter
            events.push({ 
              type: 'counter', attacker: defender, moveType: pick(PUNCH_TYPES) as PunchType, 
              damage: counterDamage, success: true, timestamp: time, isCritical: true, isSlowMo: counterDamage > 25 
            });

            if (isPlayer) {
              playerHP -= Math.round(counterDamage * (1 - pStats.damageReduction));
              opponentDamageDealt += counterDamage;
            } else {
              opponentHP -= Math.round(counterDamage * (1 - oStats.damageReduction));
              playerDamageDealt += counterDamage;
            }
            time += 1.0;
          }
        } else if (roll < dodgeChance + 0.20) {
          // Blocked
          const blockDamage = Math.round(baseDamage * 0.25 * rand(0.8, 1.2));
          events.push({ type: 'block', attacker, moveType, damage: blockDamage, success: true, timestamp: time });
          
          if (isPlayer) {
            opponentHP -= Math.round(blockDamage * (1 - dStats.damageReduction));
            playerDamageDealt += blockDamage;
          } else {
            playerHP -= Math.round(blockDamage * (1 - dStats.damageReduction));
            opponentDamageDealt += blockDamage;
          }
          time += 0.7;
        } else {
          // Hit lands
          const isCritical = Math.random() < critChance;
          const damage = Math.round(baseDamage * damageMultiplier * (isCritical ? 1.8 : 1) * rand(0.8, 1.2));
          const isSlowMo = isCritical || damage > 30;

          events.push({ 
            type: useKick ? 'kick' : 'punch', attacker, moveType, damage, success: true, 
            timestamp: time, isCritical, isSlowMo 
          });

          if (isPlayer) {
            opponentHP -= Math.round(damage * (1 - dStats.damageReduction));
            playerDamageDealt += damage;
          } else {
            playerHP -= Math.round(damage * (1 - dStats.damageReduction));
            opponentDamageDealt += damage;
          }

          time += isSlowMo ? 1.2 : 0.8;

          // Target gets stunned on heavy hit
          if (damage > 15 && Math.random() < 0.4) {
             const target = isPlayer ? 'opponent' : 'player';
             events.push({ type: 'stun', attacker: target, success: true, timestamp: time, damage: 0 });
             time += 1.0;
          }

          // Check knockdown
          const targetHP = isPlayer ? opponentHP : playerHP;
          if (damage > 25 && Math.random() < 0.4) {
            events.push({ type: 'knockdown', attacker, damage: 0, success: true, timestamp: time, isSlowMo: true });
            time += 2.0;

            const recoveryFighter = isPlayer ? defenderFighter : attackerFighter;
            const recoveryChance = recoveryFighter.ability === 'fast_recovery' ? 0.85 : 0.5;
            
            if (targetHP > 0 && Math.random() < recoveryChance) {
              events.push({ type: 'recovery', attacker: isPlayer ? 'opponent' : 'player', damage: 0, success: true, timestamp: time });
              time += 2.0;
            } else if (targetHP <= 0) {
              finished = true;
              winner = attacker;
              method = 'KO';
            }
          }

          // Check KO
          if (playerHP <= 0) { finished = true; winner = 'opponent'; method = 'KO'; }
          if (opponentHP <= 0) { finished = true; winner = 'player'; method = 'KO'; }
        }

        // Retreat after exchange
        if (!finished && Math.random() < 0.5) {
          time += 0.2;
          events.push({ type: 'move', attacker, moveDirection: 'backward', success: true, timestamp: time });
          time += 0.8;
        }
      }
    }
  }

  // Decision
  if (!finished) {
    finished = true;
    method = 'Decision';
    winner = playerDamageDealt > opponentDamageDealt ? 'player' : opponentDamageDealt > playerDamageDealt ? 'opponent' : (Math.random() < 0.5 ? 'player' : 'opponent');
  }

  return {
    playerHP: Math.max(0, Math.round(playerHP)),
    opponentHP: Math.max(0, Math.round(opponentHP)),
    playerMaxHP: Math.round(pStats.maxHP),
    opponentMaxHP: Math.round(oStats.maxHP),
    round: Math.min(3, Math.ceil(time / 60) || 1),
    maxRounds,
    events,
    currentEventIndex: 0,
    isFinished: true,
    winner,
    method,
  };
}
