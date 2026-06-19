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
