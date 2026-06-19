import { Injectable } from '@nestjs/common';
import { ComputedPlayerMetrics } from '../types/analysis.types';

// Penalties from docs/08_METRICAS_SCORE.md
const PENALTIES = {
  death: 15,
  // -20 for death with defensive available requires events data — Fase 2
  interruptMissed: 4,   // per important missed interrupt
  avoidableDamageHigh: 8,
  defensiveUnused: 10,
  paddingDamage: 5,
} as const;

// avoidableDamageTaken threshold: more than 5% of total damage taken is considered "high"
const AVOIDABLE_DAMAGE_THRESHOLD_RATIO = 0.05;

export interface ScoreInput {
  deaths: number;
  interrupts: number;
  groupAvgInterrupts: number;
  avoidableDamageTaken: number;
  totalDamageTaken?: number;
  defensivesUsed: number;
}

@Injectable()
export class ScoreCalculator {
  calculate(metrics: ScoreInput): number {
    let score = 100;

    // Death penalty
    score -= metrics.deaths * PENALTIES.death;

    // Interrupt penalty: estimate missed as how far below group average the player is
    const groupAvg = metrics.groupAvgInterrupts;
    if (groupAvg >= 3 && metrics.interrupts < groupAvg) {
      const missedEstimate = Math.round(groupAvg - metrics.interrupts);
      score -= missedEstimate * PENALTIES.interruptMissed;
    }

    // Avoidable damage penalty (needs events data for full accuracy; stub uses totalDamageTaken ratio)
    if (metrics.totalDamageTaken && metrics.totalDamageTaken > 0) {
      const ratio = metrics.avoidableDamageTaken / metrics.totalDamageTaken;
      if (ratio > AVOIDABLE_DAMAGE_THRESHOLD_RATIO) {
        score -= PENALTIES.avoidableDamageHigh;
      }
    }

    // Defensive penalty — requires cast events per class; stub skips until Fase 2
    // score -= missingDefensives * PENALTIES.defensiveUnused;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
