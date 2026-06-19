import { Injectable } from '@nestjs/common';
import { parseTableEntries, PlayerMetricsMap } from '../types/analysis.types';

@Injectable()
export class DamageCalculator {
  calculate(rawTable: unknown): PlayerMetricsMap {
    const result: PlayerMetricsMap = new Map();
    const entries = parseTableEntries(rawTable);

    for (const entry of entries) {
      if (!entry.name) continue;
      result.set(entry.name, { damageDone: entry.total ?? 0 });
    }

    return result;
  }
}
