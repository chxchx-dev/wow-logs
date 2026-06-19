# Guild Performance Coach — Orquestador del Proyecto

## Fallo

La app muere si intentas construir “otro Warcraft Logs”. El objetivo no es competir en cantidad de datos. El objetivo es traducir logs densos en decisiones claras para una hermandad.

## Por qué duele

Warcraft Logs ya resolvió parsing, eventos, rankings, reportes, tablas y atribución compleja. Si duplicas eso, pierdes meses. Si haces una capa visual que diga “fallaste aquí y corriges esto”, entregas valor en días.

## Acción

Construye una web React/PWA primero. Nada de móvil nativo, nada de parser TXT, nada de IA avanzada en fase 1.

---

## Nombre interno

**Guild Performance Coach**

## Objetivo del MVP

Recibir un link de Warcraft Logs, extraer el `reportCode`, consultar datos del reporte desde un backend seguro, procesar métricas básicas y mostrar un resumen accionable de una run M+ o pelea.

## Usuario principal

- Raid lead / officer.
- Jugador que quiere mejorar.
- Hermandad que necesita claridad sin navegar 40 pestañas en Warcraft Logs.

## Diferenciador

La app no muestra “más números”. La app muestra diagnóstico:

> “Moriste con defensivo disponible en 3 de 5 pulls críticos. Próxima key: usa defensivo antes del segundo golpe fuerte.”

---

## Stack recomendado

### Frontend

- React + Vite + TypeScript.
- TailwindCSS.
- TanStack Query para consultas.
- Zustand para estado local mínimo.
- Recharts o gráficos SVG simples.
- PWA/responsive desde el inicio.

### Backend/BFF

- NestJS + TypeScript.
- PostgreSQL.
- Prisma.
- Redis opcional para caché/rate limit.

### Fuentes externas

1. **Warcraft Logs API v2 GraphQL**: fuente principal.
2. **Blizzard/Battle.net API**: roster, personaje, equipment, datos estáticos.
3. **Raider.IO API**: score M+, progresión y contexto.

### Prohibido en fase 1

- Parser TXT local.
- Móvil nativo.
- Login complejo.
- Rankings globales.
- Análisis de todas las specs.
- IA para “explicar todo”.

---

## Estructura de documentación

```txt
/docs
  00_ORQUESTADOR.md
  01_PRODUCTO_MVP.md
  02_SETUP_REACT_WEB.md
  03_ARQUITECTURA.md
  04_WARCRAFTLOGS_API.md
  05_BLIZZARD_RAIDERIO.md
  06_MODELO_DATOS.md
  07_UI_UX_PANTALLAS.md
  08_METRICAS_SCORE.md
  09_API_CONTRACTS.md
  10_BACKLOG_14_DIAS.md
  11_PROMPTS_AGENTES.md
  12_TESTING_QA.md
```

---

## Roadmap brutal

### Fase 0 — Base

Entregable:

- Repo creado.
- Web React creada.
- API NestJS creada.
- Pantalla para pegar link de Warcraft Logs.
- Extracción de `reportCode`.

### Fase 1 — Warcraft Logs mínimo

Entregable:

- OAuth server-side.
- Metadata de reporte.
- Fights/runs.
- Participantes.
- Guardado mínimo en PostgreSQL.

### Fase 2 — Dashboard útil

Entregable:

- Cards por jugador.
- Deaths.
- Interrupts.
- Damage.
- Defensive usage.
- Avoidable damage.

### Fase 3 — Aug Evoker

Entregable:

- Direct damage vs contributed damage.
- Ebon Might uptime.
- Prescience targets.
- Breath of Eons timing.
- Contribución por aliado.

### Fase 4 — Contexto externo

Entregable:

- Raider.IO character summary.
- Blizzard character/equipment/roster.
- Comparativo semana a semana.

### Fase 5 — Demo real

Entregable:

- Una run real analizada.
- Top 5 errores.
- Acciones concretas por jugador.

---

## Criterio de éxito

La app funciona si un jugador entiende en menos de 60 segundos:

1. Qué hizo mal.
2. Qué le costó a la run.
3. Qué debe corregir en la próxima key.

Si no logra eso, es otra tabla inútil.

---

## Fuentes técnicas base

- Warcraft Logs API Docs: https://www.warcraftlogs.com/api/docs
- Warcraft Logs v2 Query Docs: https://www.warcraftlogs.com/v2-api-docs/warcraft/query.doc.html
- Raider.IO API: https://raider.io/api
- Blizzard WoW Game Data APIs: https://develop.battle.net/documentation/world-of-warcraft/game-data-apis
- Blizzard WoW Profile APIs: https://develop.battle.net/documentation/world-of-warcraft/profile-apis
