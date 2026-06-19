# Prompts para Codex / Claude / Agentes

## Fallo
Pedirle a un agente “hazme la app” es una orden mediocre. Te devuelve estructura inflada, código inventado y dependencias de sobra.

## Por qué duele
Los agentes funcionan mejor con tareas pequeñas, criterios de aceptación y límites claros.

## Acción
Usa estos prompts por fase. Un prompt, un resultado verificable.

---

## Prompt 1 — Crear monorepo

```txt
Actúa como desarrollador senior full-stack. Crea la base de un monorepo llamado guild-performance-coach con pnpm workspaces.

Stack obligatorio:
- apps/web: React + Vite + TypeScript
- apps/api: NestJS + TypeScript
- packages/shared: tipos compartidos
- TailwindCSS en web
- PostgreSQL con Prisma en api

Restricciones:
- No agregues librerías innecesarias.
- No implementes login.
- No conectes APIs externas todavía.
- No pongas secretos en frontend.

Entregables:
1. Estructura de carpetas.
2. Scripts raíz: dev:web, dev:api, dev:db.
3. docker-compose con postgres y redis.
4. .env.example.
5. README con comandos.

Criterio de aceptación:
- pnpm dev:web levanta la web.
- pnpm dev:api levanta la API.
- docker compose up -d postgres levanta la DB.
```

---

## Prompt 2 — Input Warcraft Logs

```txt
Implementa en apps/web una pantalla inicial para pegar un link de Warcraft Logs.

Requisitos:
- Extraer reportCode desde https://www.warcraftlogs.com/reports/<reportCode>
- Extraer fightId opcional desde query/hash con fight=<id>
- Si el link es inválido, mostrar error humano.
- Si es válido, navegar a /report/:reportCode o /report/:reportCode/fight/:fightId.

Restricciones:
- No llames Warcraft Logs desde React.
- No uses librerías de formularios para este input.
- Usa TypeScript estricto.

Entregables:
- parseWarcraftLogsUrl.ts
- ReportLinkForm.tsx
- tests unitarios del parser si el setup ya existe.
```

---

## Prompt 3 — Warcraft Logs OAuth server-side

```txt
Implementa en apps/api un módulo NestJS llamado WarcraftLogsModule.

Debe incluir:
- WarcraftLogsAuthService con client_credentials OAuth.
- Cache en memoria del access token hasta antes de expirar.
- WarcraftLogsClientService para ejecutar queries GraphQL.
- Config desde @nestjs/config.

Variables:
WARCRAFTLOGS_CLIENT_ID
WARCRAFTLOGS_CLIENT_SECRET
WARCRAFTLOGS_TOKEN_URL
WARCRAFTLOGS_GRAPHQL_URL

Restricciones:
- No loguear tokens.
- No exponer secretos.
- Manejar errores con mensajes claros.

Criterio de aceptación:
- Existe un método query<T>(query, variables) reutilizable.
```

---

## Prompt 4 — Report import

```txt
Crea ReportsModule en NestJS.

Endpoint:
POST /reports/import
Body: { reportCode: string }

Debe:
1. Validar reportCode con regex alfanumérica.
2. Consultar metadata del reporte en Warcraft Logs GraphQL.
3. Consultar fights del reporte.
4. Guardar Report y Fight en PostgreSQL con Prisma.
5. Retornar DTO limpio para frontend.

Restricciones:
- No devolver JSON crudo de Warcraft Logs al frontend.
- Guardar raw solo como respaldo interno.
- Manejar reportes privados/inexistentes con error REPORT_PRIVATE_OR_FORBIDDEN.
```

---

## Prompt 5 — Report overview React

```txt
Implementa en React la pantalla /report/:reportCode.

Debe:
- Llamar POST /reports/import si el reporte no está importado.
- Mostrar header del reporte.
- Listar fights/runs.
- Permitir navegar a /report/:reportCode/fight/:fightId.
- Manejar loading, empty y error.

Restricciones:
- Usar TanStack Query.
- No acoplar la UI al JSON externo de Warcraft Logs.
```

---

## Prompt 6 — Fight summary mock primero

```txt
Crea endpoint GET /reports/:reportCode/fights/:fightId/summary.

Primera versión:
- Puede retornar métricas mockeadas basadas en jugadores existentes.
- Debe cumplir el contrato FightAnalysisDto.
- Debe incluir topIssues y players.

Luego implementa en React:
- RunHeader
- MetricStrip
- TopIssues
- PlayerCardGrid
- PlayerCard

Objetivo:
La UI debe verse como producto aunque el cálculo todavía sea parcial.
```

---

## Prompt 7 — Calculadoras reales

```txt
Implementa AnalysisModule con calculadoras separadas:
- DamageCalculator
- DeathsCalculator
- InterruptsCalculator
- DefensivesCalculator
- ScoreCalculator

Restricciones:
- Cada calculadora recibe datos normalizados, no llama APIs externas.
- Cada calculadora retorna métricas e issues.
- Cada issue debe tener title, description y action.

Criterio de aceptación:
- Fight summary ya no depende completamente de mocks.
```

---

## Prompt 8 — Aug Evoker panel

```txt
Implementa panel especial para Augmentation Evoker.

Backend:
- Crear AugEvokerCalculator.
- Detectar jugadores Evoker/Aug si el dato está disponible.
- Calcular directDamage, contributedDamage, ebonMightUptimePct, prescienceUptimePct, breathAlignmentScore cuando sea posible.
- Si un dato no está disponible, retornar null y agregar warning de análisis parcial.

Frontend:
- AugEvokerPanel
- ContributionByAllyChart
- BuffUptimeCard
- BreathTimeline placeholder si no hay datos suficientes.

Restricciones:
- No inventar métricas.
- Si Warcraft Logs no entrega contribución, mostrar análisis parcial.
```

---

## Prompt 9 — Raider.IO contexto

```txt
Implementa RaiderIoModule.

Debe:
- Consultar /characters/profile.
- Recibir region, realm y name.
- Pedir fields de mythic plus, raid progression, gear y talents.
- Guardar resultado en ExternalProfile.
- No bloquear el dashboard si Raider.IO falla.

Frontend:
- Mostrar score M+ e ilvl si está disponible.
```

---

## Prompt 10 — QA final

```txt
Revisa el proyecto completo y corrige problemas.

Checklist:
- No secretos en frontend.
- No llamadas directas desde React a Warcraft Logs.
- Errores humanos para report privado/inválido.
- Estados loading/error/empty en todas las pantallas.
- DTOs limpios.
- Prisma sin relaciones rotas.
- README actualizado.
- No dependencias innecesarias.

No agregues features nuevas. Solo estabiliza el MVP.
```
