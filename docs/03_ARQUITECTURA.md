# Arquitectura — React + BFF + PostgreSQL

## Fallo
Meter las llamadas a Warcraft Logs directo desde React es una mala decisión. Es rápido para una demo falsa y peligroso para un producto real.

## Por qué duele
El frontend no debe guardar `client_secret`. Además, necesitas caché, normalización, control de errores y rate limits. Eso vive en backend, no en componentes React.

## Acción
Usa React como capa visual y NestJS como BFF. El BFF habla con APIs externas y entrega DTOs limpios a la web.

---

## Diagrama lógico

```txt
[React Web/PWA]
      |
      | HTTP JSON
      v
[NestJS BFF/API]
      |
      |---- Warcraft Logs GraphQL
      |---- Raider.IO REST
      |---- Blizzard/Battle.net REST
      |
      | Prisma
      v
[PostgreSQL]
      |
      | optional cache
      v
[Redis]
```

---

## Capas del backend

```txt
apps/api/src/
  modules/
    reports/
      reports.controller.ts
      reports.service.ts
      dto/
    warcraftlogs/
      warcraftlogs-auth.service.ts
      warcraftlogs-client.service.ts
      queries/
    raiderio/
      raiderio-client.service.ts
    blizzard/
      blizzard-auth.service.ts
      blizzard-client.service.ts
    analysis/
      analysis.service.ts
      calculators/
        damage.calculator.ts
        deaths.calculator.ts
        interrupts.calculator.ts
        defensives.calculator.ts
        aug-evoker.calculator.ts
    players/
    cache/
    prisma/
```

---

## Flujo de análisis

```txt
1. Usuario pega link.
2. React extrae reportCode y fightId opcional.
3. React llama POST /reports/import.
4. API valida input.
5. API obtiene token Warcraft Logs.
6. API consulta metadata y fights.
7. API guarda report/run/players.
8. API calcula métricas mínimas.
9. React muestra dashboard.
```

---

## Flujo sincrónico inicial
Para MVP, puedes hacer el análisis en una request:

```txt
POST /reports/analyze
```

Ventaja:
- rápido de construir;
- menos infraestructura;
- demo simple.

Límite:
- reportes grandes pueden tardar.

---

## Flujo asíncrono futuro
Cuando la app crezca:

```txt
POST /reports/import -> crea job
GET /jobs/:id -> progreso
GET /reports/:reportCode/summary -> resultado
```

Usar BullMQ + Redis.

No lo hagas en fase 1.

---

## Frontera clara entre frontend y backend

### React hace
- Render de pantallas.
- Estados loading/error/empty.
- Filtros de UI.
- Navegación.
- Mostrar diagnóstico.

### React no hace
- OAuth externo.
- Guardar secretos.
- Normalizar eventos crudos.
- Calcular métricas pesadas.
- Hacer scraping.

### API hace
- OAuth.
- GraphQL hacia Warcraft Logs.
- REST hacia Raider.IO/Blizzard.
- Caché.
- Persistencia.
- Cálculo de métricas.
- DTOs listos para UI.

---

## Módulos NestJS

### ReportsModule
Responsable de reportes importados.

Endpoints:

```txt
POST /reports/import
GET /reports/:reportCode
GET /reports/:reportCode/fights
GET /reports/:reportCode/fights/:fightId/summary
```

### WarcraftLogsModule
Responsable de autenticación y consultas GraphQL.

Servicios:

```txt
WarcraftLogsAuthService
WarcraftLogsClientService
```

### AnalysisModule
Responsable de convertir data externa en insights.

Calculadoras:

```txt
DamageCalculator
DeathsCalculator
InterruptsCalculator
DefensivesCalculator
AugEvokerCalculator
ScoreCalculator
```

### ExternalProfilesModule
Responsable de Raider.IO y Blizzard.

Servicios:

```txt
RaiderIoClientService
BlizzardClientService
```

---

## Estrategia de caché

### MVP
Guardar en PostgreSQL:
- report metadata;
- fights;
- player metrics;
- issues calculados.

### Fase posterior
Redis para:
- token OAuth;
- respuestas externas temporales;
- rate limit por IP;
- job status.

---

## Seguridad mínima

1. `WARCRAFTLOGS_CLIENT_SECRET` solo en API.
2. No logs de tokens.
3. Validar `reportCode` con regex.
4. Rate limit en endpoints de import.
5. Timeout en llamadas externas.
6. Manejar reportes privados con error claro.
7. No guardar data sensible innecesaria.

---

## Errores obligatorios

```txt
INVALID_REPORT_URL
REPORT_NOT_FOUND
REPORT_PRIVATE_OR_FORBIDDEN
WARCRAFTLOGS_RATE_LIMITED
EXTERNAL_API_TIMEOUT
ANALYSIS_NOT_AVAILABLE
```

Cada error debe tener mensaje humano:

```txt
No pude leer este reporte. Es privado, inexistente o tu token no tiene acceso.
```

---

## Deploy recomendado MVP

### Simple
- VPS Ubuntu.
- Docker Compose.
- Nginx reverse proxy.
- Postgres container.
- API container.
- Web estática servida por Nginx.

### No hacer todavía
- Kubernetes.
- Microservicios.
- Lambda.
- Cola distribuida.
- Multi-tenant.

---

## Decisión final
El MVP no necesita arquitectura espectacular. Necesita una pantalla que funcione, datos limpios y recomendaciones claras.
