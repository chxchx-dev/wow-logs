import { Injectable } from '@nestjs/common';
import { PlayerMetricsMap, GeneratedIssue } from '../types/analysis.types';

interface DefensivesResult {
  metrics: PlayerMetricsMap;
  issues: GeneratedIssue[];
}

@Injectable()
export class DefensivesCalculator {
  // Requires events data which needs a separate WCL query per fight.
  // MVP stub: returns empty metrics, no issues.
  // Fase 2: implement with specific defensive spell IDs per class.
  calculate(_rawCastsTable: unknown): DefensivesResult {
    return { metrics: new Map(), issues: [] };
  }
}
