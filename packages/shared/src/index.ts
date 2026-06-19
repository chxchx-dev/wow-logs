export type Role = 'tank' | 'healer' | 'dps' | 'support' | 'unknown';

export interface ParsedReportLink {
  reportCode: string;
  fightId?: string;
}

export interface FightSummaryDto {
  id: number;
  name: string;
  startTimeMs: number;
  endTimeMs: number;
  kill?: boolean;
  difficulty?: number;
  encounterID?: number;
}

export interface ReportOverviewDto {
  reportCode: string;
  title?: string;
  zoneName?: string;
  ownerName?: string;
  startTimeMs?: number;
  endTimeMs?: number;
  fights: FightSummaryDto[];
}

export interface IssueDto {
  id: string;
  playerId?: string;
  playerName?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  timestampMs?: number;
  evidence?: {
    timestampMs?: number;
    spellName?: string;
    targetName?: string;
    value?: number;
  };
}

export interface PlayerMetricCardDto {
  playerId: string;
  name: string;
  server?: string;
  className?: string;
  specName?: string;
  role: Role;
  score: number;
  damageDone: number;
  contributedDamage?: number;
  healingDone?: number;
  deaths: number;
  interrupts: number;
  interruptOpportunities?: number;
  defensivesUsed: number;
  avoidableDamageTaken: number;
  topIssue?: IssueDto;
}

export interface CompositionDto {
  tanks: string[];
  healers: string[];
  dps: string[];
  support: string[];
}

export interface FightMetricStripDto {
  totalDeaths: number;
  totalInterrupts: number;
  totalAvoidableDamage: number;
  averageScore: number;
}

export interface AugEvokerAnalysisDto {
  playerId: string;
  playerName: string;
  directDamage: number;
  contributedDamage: number;
  ebonMightUptimePct?: number;
  prescienceUptimePct?: number;
  breathAlignmentScore?: number;
  contributionByAlly: Array<{
    allyName: string;
    amount: number;
    pct: number;
  }>;
  issues: IssueDto[];
}

export interface FightAnalysisDto {
  reportCode: string;
  fightId: number;
  title: string;
  result: 'timed' | 'depleted' | 'kill' | 'wipe' | 'unknown';
  durationMs: number;
  composition: CompositionDto;
  metrics: FightMetricStripDto;
  players: PlayerMetricCardDto[];
  topIssues: IssueDto[];
  augEvoker?: AugEvokerAnalysisDto;
}

export interface ApiErrorDto {
  code: string;
  message: string;
  details?: unknown;
}

export interface ExternalCharacterIdentity {
  name: string;
  normalizedName: string;
  realm: string;
  realmSlug: string;
  region: 'us' | 'eu' | 'kr' | 'tw';
}

export function normalizeWowName(name: string): string {
  return name.trim().toLowerCase();
}

export function normalizeRealmSlug(realm: string): string {
  return realm.trim().toLowerCase().replace(/\s+/g, '-');
}
