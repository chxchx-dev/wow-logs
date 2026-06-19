import { Injectable } from '@nestjs/common';
import { parseTableEntries, PlayerMetricsMap, GeneratedIssue } from '../types/analysis.types';

interface DeathsResult {
  metrics: PlayerMetricsMap;
  issues: GeneratedIssue[];
}

@Injectable()
export class DeathsCalculator {
  calculate(rawTable: unknown): DeathsResult {
    const metrics: PlayerMetricsMap = new Map();
    const issues: GeneratedIssue[] = [];
    const entries = parseTableEntries(rawTable);

    for (const entry of entries) {
      if (!entry.name) continue;

      const deathCount =
        entry.deaths ??
        (Array.isArray(entry.deathsData) ? entry.deathsData.length : 0);

      metrics.set(entry.name, { deaths: deathCount });

      if (deathCount >= 3) {
        issues.push({
          playerName: entry.name,
          type: 'DEATH',
          severity: 'CRITICAL',
          title: `${entry.name} murió ${deathCount} veces`,
          description: `${deathCount} muertes en esta run es un patrón de error repetido que afecta directamente el tiempo de la key.`,
          action: 'Próxima key: identifica el pull donde ocurren las muertes y prioriza defensivos o posicionamiento en ese momento.',
        });
      } else if (deathCount === 2) {
        issues.push({
          playerName: entry.name,
          type: 'DEATH',
          severity: 'HIGH',
          title: `${entry.name} murió 2 veces`,
          description: 'Dos muertes representan pérdida de tiempo significativa y potencial depleción del timer.',
          action: 'Próxima key: revisa en qué momento del pull ocurrieron las muertes y usa defensivo anticipado.',
        });
      } else if (deathCount === 1) {
        issues.push({
          playerName: entry.name,
          type: 'DEATH',
          severity: 'MEDIUM',
          title: `${entry.name} murió en esta run`,
          description: 'Una muerte puede ser aceptable si fue en un pull de alto riesgo, pero debe analizarse.',
          action: 'Próxima key: verifica si el defensivo estaba disponible en el momento de la muerte.',
        });
      }
    }

    return { metrics, issues };
  }
}
