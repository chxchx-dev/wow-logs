import { Injectable } from '@nestjs/common';
import { parseTableEntries, PlayerMetricsMap, GeneratedIssue } from '../types/analysis.types';

interface InterruptsResult {
  metrics: PlayerMetricsMap;
  issues: GeneratedIssue[];
}

@Injectable()
export class InterruptsCalculator {
  calculate(rawTable: unknown): InterruptsResult {
    const metrics: PlayerMetricsMap = new Map();
    const issues: GeneratedIssue[] = [];
    const entries = parseTableEntries(rawTable);

    for (const entry of entries) {
      if (!entry.name) continue;
      metrics.set(entry.name, { interrupts: entry.total ?? 0 });
    }

    const allInterrupts = [...metrics.values()].map((m) => m.interrupts ?? 0);
    if (allInterrupts.length === 0) return { metrics, issues };

    const avgInterrupts = allInterrupts.reduce((a, b) => a + b, 0) / allInterrupts.length;

    for (const [name, m] of metrics.entries()) {
      const count = m.interrupts ?? 0;
      if (count === 0 && avgInterrupts >= 3) {
        issues.push({
          playerName: name,
          type: 'INTERRUPT_MISSED',
          severity: 'HIGH',
          title: `${name} no realizó ningún interrupt`,
          description: `El promedio del grupo fue ${avgInterrupts.toFixed(1)} interrupts. ${name} no contribuyó.`,
          action: 'Próxima key: asigna un cast objetivo a interrumpir y activa el kick antes del casteo completo.',
        });
      } else if (count < avgInterrupts * 0.4 && avgInterrupts >= 4) {
        issues.push({
          playerName: name,
          type: 'INTERRUPT_MISSED',
          severity: 'MEDIUM',
          title: `${name} interrumpió por debajo del promedio del grupo`,
          description: `${count} interrupts vs ${avgInterrupts.toFixed(1)} de promedio del grupo.`,
          action: 'Próxima key: coordina con el grupo qué casts son prioridad de kick.',
        });
      }
    }

    return { metrics, issues };
  }
}
