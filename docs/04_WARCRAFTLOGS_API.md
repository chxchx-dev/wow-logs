# Warcraft Logs API — Uso mínimo para MVP

## Fallo
Pensar en parsear `WoWCombatLog.txt` ahora es escaparte hacia la complejidad. Es el camino largo antes de tener una sola pantalla útil.

## Por qué duele
Los logs crudos tienen eventos, timestamps, IDs, buffs, debuffs, casts, damage, healing y edge cases. Warcraft Logs ya hace ese trabajo pesado.

## Acción
En fase 1 usa Warcraft Logs API v2 GraphQL. Tu app solo interpreta y presenta.

---

## Objetivo de esta integración
Obtener:

1. Metadata del reporte.
2. Lista de fights/runs.
3. Participantes.
4. Tablas básicas de damage/healing/deaths/casts.
5. Eventos puntuales para buffs, interrupts y defensivos.

---

## Variables de entorno

```env
WARCRAFTLOGS_CLIENT_ID=change_me
WARCRAFTLOGS_CLIENT_SECRET=change_me
WARCRAFTLOGS_TOKEN_URL=https://www.warcraftlogs.com/oauth/token
WARCRAFTLOGS_GRAPHQL_URL=https://www.warcraftlogs.com/api/v2/client
```

---

## Regla de seguridad
Nunca llames Warcraft Logs desde React con `client_secret`.

Correcto:

```txt
React -> tu API -> Warcraft Logs
```

Incorrecto:

```txt
React -> Warcraft Logs
```

---

## Auth service

`warcraftlogs-auth.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable()
export class WarcraftLogsAuthService {
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && this.cachedToken.expiresAt > now + 30_000) {
      return this.cachedToken.value;
    }

    const clientId = this.config.getOrThrow<string>('WARCRAFTLOGS_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('WARCRAFTLOGS_CLIENT_SECRET');
    const tokenUrl = this.config.getOrThrow<string>('WARCRAFTLOGS_TOKEN_URL');

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    if (!response.ok) {
      throw new Error(`Warcraft Logs auth failed: ${response.status}`);
    }

    const data = (await response.json()) as TokenResponse;

    this.cachedToken = {
      value: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };

    return data.access_token;
  }
}
```

---

## GraphQL client service

`warcraftlogs-client.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WarcraftLogsAuthService } from './warcraftlogs-auth.service';

@Injectable()
export class WarcraftLogsClientService {
  constructor(
    private readonly auth: WarcraftLogsAuthService,
    private readonly config: ConfigService,
  ) {}

  async query<TData>(query: string, variables: Record<string, unknown>) {
    const token = await this.auth.getAccessToken();
    const url = this.config.getOrThrow<string>('WARCRAFTLOGS_GRAPHQL_URL');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json();

    if (!response.ok || payload.errors?.length) {
      throw new Error(JSON.stringify(payload.errors ?? payload));
    }

    return payload.data as TData;
  }
}
```

---

## Query: metadata del reporte

```graphql
query ReportMetadata($code: String!) {
  reportData {
    report(code: $code) {
      code
      title
      owner {
        name
      }
      startTime
      endTime
      zone {
        name
      }
    }
  }
}
```

Uso:

```ts
const data = await warcraftLogs.query<ReportMetadataResponse>(REPORT_METADATA_QUERY, {
  code: reportCode,
});
```

---

## Query: fights/runs

```graphql
query ReportFights($code: String!) {
  reportData {
    report(code: $code) {
      fights {
        id
        name
        startTime
        endTime
        kill
        difficulty
        encounterID
      }
    }
  }
}
```

Nota:
Los `startTime` y `endTime` del fight son necesarios para consultar tablas y eventos dentro de un rango real.

---

## Query: master data / actores

```graphql
query ReportMasterData($code: String!) {
  reportData {
    report(code: $code) {
      masterData {
        actors {
          id
          name
          type
          subType
          server
        }
      }
    }
  }
}
```

Usos:
- identificar jugadores;
- detectar clases/specs cuando esté disponible;
- relacionar métricas por actor ID.

---

## Query: tabla de daño

```graphql
query DamageDoneTable($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int]) {
  reportData {
    report(code: $code) {
      table(dataType: DamageDone, startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs)
    }
  }
}
```

---

## Query: deaths

```graphql
query DeathsTable($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int]) {
  reportData {
    report(code: $code) {
      table(dataType: Deaths, startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs)
    }
  }
}
```

---

## Query: casts

```graphql
query CastsTable($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int]) {
  reportData {
    report(code: $code) {
      table(dataType: Casts, startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs)
    }
  }
}
```

---

## Query: events para buffs/interrupts/defensivos

```graphql
query Events($code: String!, $startTime: Float!, $endTime: Float!, $fightIDs: [Int], $filterExpression: String) {
  reportData {
    report(code: $code) {
      events(startTime: $startTime, endTime: $endTime, fightIDs: $fightIDs, filterExpression: $filterExpression) {
        data
        nextPageTimestamp
      }
    }
  }
}
```

Ejemplos de búsqueda conceptual:

```txt
interrupts
buff applications
defensive casts
Ebon Might uptime
Prescience applications
Breath of Eons casts
```

No hardcodees todo en fase 1. Empieza con eventos simples y mejora.

---

## Servicio mínimo de importación

```ts
async importReport(reportCode: string) {
  const metadata = await this.getReportMetadata(reportCode);
  const fights = await this.getReportFights(reportCode);
  const actors = await this.getReportActors(reportCode);

  await this.reportsRepository.upsertReport({ metadata, fights, actors });

  return {
    reportCode,
    title: metadata.title,
    fights: fights.map((fight) => ({
      id: fight.id,
      name: fight.name,
      startTime: fight.startTime,
      endTime: fight.endTime,
      kill: fight.kill,
    })),
  };
}
```

---

## Manejo de reportes privados

Cuando Warcraft Logs responda forbidden/not found/error GraphQL:

```json
{
  "code": "REPORT_PRIVATE_OR_FORBIDDEN",
  "message": "No pude leer este reporte. Es privado, inexistente o la app no tiene acceso."
}
```

No inventes datos. No simules que el análisis existe.

---

## Plazo
Día 2 debe terminar con:

- token OAuth funcionando;
- metadata del reporte en consola;
- fights listados en la web;
- errores humanos para reporte privado/inválido.
