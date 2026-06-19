export type FightResult = 'timed' | 'depleted' | 'kill' | 'wipe' | 'unknown';

export interface IssueDtoOut {
  id: string;
  playerId?: string;
  playerName?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  timestampMs?: number;
}

export interface CompositionDtoOut {
  tanks: string[];
  healers: string[];
  dps: string[];
  support: string[];
}

export interface FightMetricStripDtoOut {
  totalDeaths: number;
  totalInterrupts: number;
  totalAvoidableDamage: number;
  averageScore: number;
}

export interface AugEvokerAnalysisDtoOut {
  playerId: string;
  playerName: string;
  directDamage: number;
  contributedDamage: number;
  ebonMightUptimePct?: number;
  prescienceUptimePct?: number;
  breathAlignmentScore?: number;
  contributionByAlly: Array<{ allyName: string; amount: number; pct: number }>;
  issues: IssueDtoOut[];
}

export interface PlayerMetricCardDtoOut {
  playerId: string;
  name: string;
  server?: string;
  className?: string;
  specName?: string;
  role: string;
  score: number;
  damageDone: number;
  healingDone: number;
  deaths: number;
  interrupts: number;
  defensivesUsed: number;
  avoidableDamageTaken: number;
  topIssue?: IssueDtoOut;
}

export interface FightAnalysisDtoOut {
  reportCode: string;
  fightId: number;
  title: string;
  result: FightResult;
  durationMs: number;
  composition: CompositionDtoOut;
  metrics: FightMetricStripDtoOut;
  players: PlayerMetricCardDtoOut[];
  topIssues: IssueDtoOut[];
  augEvoker?: AugEvokerAnalysisDtoOut;
}
