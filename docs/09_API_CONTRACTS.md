# API Contracts — React consume DTOs limpios

## Fallo
Si React recibe el JSON crudo de Warcraft Logs, conviertes tus componentes en parsers disfrazados.

## Por qué duele
Cada cambio de API externa romperá UI. Además, mezclar lógica de métricas con JSX hace el proyecto frágil.

## Acción
Define contratos propios. El backend traduce APIs externas a DTOs estables.

---

## Base URL

```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## POST /reports/import

### Request

```json
{
  "reportCode": "abc123XYZ"
}
```

### Response

```json
{
  "reportCode": "abc123XYZ",
  "title": "Guild M+ Night",
  "zoneName": "Mythic+",
  "ownerName": "Uploader",
  "startTimeMs": 1710000000000,
  "endTimeMs": 1710003600000,
  "fights": [
    {
      "id": 1,
      "name": "Dungeon Run",
      "startTimeMs": 1234,
      "endTimeMs": 5678,
      "kill": true
    }
  ]
}
```

---

## GET /reports/:reportCode

### Response

```ts
export interface ReportOverviewDto {
  reportCode: string;
  title?: string;
  zoneName?: string;
  ownerName?: string;
  startTimeMs?: number;
  endTimeMs?: number;
  fights: FightSummaryDto[];
}

export interface FightSummaryDto {
  id: number;
  name: string;
  startTimeMs: number;
  endTimeMs: number;
  kill?: boolean;
  difficulty?: number;
}
```

---

## GET /reports/:reportCode/fights/:fightId/summary

### Response

```ts
export interface FightAnalysisDto {
  reportCode: string;
  fightId: number;
  title: string;
  result: 'timed' | 'depleted' | 'kill' | 'wipe' | 'unknown';
  durationMs: number;
  composition: CompositionDto;
  metrics: FightMetricStripDto;
  topIssues: IssueDto[];
  players: PlayerMetricCardDto[];
  augEvoker?: AugEvokerAnalysisDto;
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

export interface PlayerMetricCardDto {
  playerId: string;
  name: string;
  server?: string;
  className?: string;
  specName?: string;
  role: 'tank' | 'healer' | 'dps' | 'support' | 'unknown';
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
```

---

## Error response

```ts
export interface ApiErrorDto {
  code: string;
  message: string;
  details?: unknown;
}
```

Ejemplo:

```json
{
  "code": "REPORT_PRIVATE_OR_FORBIDDEN",
  "message": "No pude leer este reporte. Es privado, inexistente o la app no tiene acceso."
}
```

---

## Cliente HTTP frontend

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Error de API');
  }

  return payload as T;
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Error de API');
  }

  return payload as TResponse;
}
```

---

## Hook React

```ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/http';
import type { FightAnalysisDto } from '@gpc/shared';

export function useFightAnalysis(reportCode: string, fightId: string) {
  return useQuery({
    queryKey: ['fight-analysis', reportCode, fightId],
    queryFn: () => apiGet<FightAnalysisDto>(`/reports/${reportCode}/fights/${fightId}/summary`),
    enabled: Boolean(reportCode && fightId),
  });
}
```

---

## Zod validation backend

```ts
import { z } from 'zod';

export const ImportReportSchema = z.object({
  reportCode: z.string().regex(/^[a-zA-Z0-9]+$/),
});

export type ImportReportInput = z.infer<typeof ImportReportSchema>;
```

---

## Plazo
Día 3:

- contratos compartidos;
- endpoint import;
- endpoint summary con mock;
- React pintando DTO propio, no JSON externo.
