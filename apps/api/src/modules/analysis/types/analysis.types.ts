export interface WclTableEntry {
  id?: number;
  name: string;
  type?: string;
  subType?: string;
  total?: number;
  deaths?: number;
  deathsData?: Array<{ timestamp?: number; name?: string }>;
}

export interface ComputedPlayerMetrics {
  damageDone: number;
  healingDone: number;
  deaths: number;
  interrupts: number;
  interruptOpportunities: number;
  defensivesUsed: number;
  avoidableDamageTaken: number;
  score: number;
}

export interface GeneratedIssue {
  playerName: string | null;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  action: string;
  timestampMs?: number;
}

export type PlayerMetricsMap = Map<string, Partial<ComputedPlayerMetrics>>;

export function parseTableEntries(raw: unknown): WclTableEntry[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  const inner = (obj['data'] as Record<string, unknown> | undefined) ?? obj;
  return (inner['entries'] as WclTableEntry[] | undefined) ?? [];
}
