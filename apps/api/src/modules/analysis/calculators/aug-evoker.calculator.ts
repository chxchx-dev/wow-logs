import { Injectable } from '@nestjs/common';
import { GeneratedIssue } from '../types/analysis.types';

export interface AugEvokerResult {
  detected: boolean;
  playerName?: string;
  ebonMightUptimePct?: number;
  prescienceUptimePct?: number;
  breathAlignmentScore?: number;
  issues: GeneratedIssue[];
}

@Injectable()
export class AugEvokerCalculator {
  // Requires Ebon Might buff events, Prescience applications, and Breath of Eons timing.
  // MVP stub: detects Aug Evoker presence only.
  // Fase 3: implement full uptime and alignment analysis.
  calculate(_actorSubTypes: Record<string, string>): AugEvokerResult {
    const augEntry = Object.entries(_actorSubTypes).find(
      ([, spec]) => spec?.toLowerCase().includes('augmentation') || spec?.toLowerCase().includes('evoker'),
    );

    return {
      detected: !!augEntry,
      playerName: augEntry?.[0],
      issues: [],
    };
  }
}
