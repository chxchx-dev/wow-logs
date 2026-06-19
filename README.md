# Guild Performance Coach

Traduce logs de Warcraft Logs en diagnósticos accionables para raid leads y jugadores de M+.

## Stack

- **Web** — React 19 + Vite + TypeScript + TailwindCSS
- **API** — NestJS + TypeScript + Prisma v5
- **DB** — PostgreSQL 16 (Docker)
- **Monorepo** — pnpm workspaces

## Requisitos previos

- Node 22+
- pnpm 9+
- Docker Desktop

## Setup inicial

```bash
# 1. Clonar e instalar dependencias
pnpm install

# 2. Copiar variables de entorno
cp .env.example apps/api/.env

# 3. Editar apps/api/.env con tus credenciales de Warcraft Logs
#    WARCRAFTLOGS_CLIENT_ID=...
#    WARCRAFTLOGS_CLIENT_SECRET=...

# 4. Levantar la base de datos
pnpm dev:db

# 5. Correr la migración (primera vez)
cd apps/api
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm prisma migrate dev --name init_gpc
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm prisma generate
cd ../..
```

## Desarrollo

```bash
# Levantar todo (DB + API + Web)
pnpm dev

# O por separado:
pnpm dev:db     # Docker: postgres + redis
pnpm dev:api    # NestJS en localhost:4000
pnpm dev:web    # Vite en localhost:5173
```

## Variables de entorno

Copia `.env.example` a `apps/api/.env` y completa:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `WARCRAFTLOGS_CLIENT_ID` | Client ID de la app en warcraftlogs.com |
| `WARCRAFTLOGS_CLIENT_SECRET` | Client Secret — solo en API, nunca en frontend |
| `WARCRAFTLOGS_TOKEN_URL` | `https://www.warcraftlogs.com/oauth/token` |
| `WARCRAFTLOGS_GRAPHQL_URL` | `https://www.warcraftlogs.com/api/v2/client` |
| `BLIZZARD_CLIENT_ID` | Opcional — Fase 4 |
| `BLIZZARD_CLIENT_SECRET` | Opcional — Fase 4 |
| `RAIDERIO_BASE_URL` | `https://raider.io/api/v1` — Opcional, Fase 4 |

Para registrar una app de Warcraft Logs: https://www.warcraftlogs.com/api/clients/

## Endpoints principales

```
POST /api/reports/import                          Importar reporte desde WCL
GET  /api/reports/:reportCode                     Overview de un reporte
GET  /api/reports/:reportCode/fights              Lista de fights
GET  /api/reports/:reportCode/fights/:id/summary  Análisis completo de un fight
GET  /api/players/:reportCode                     Jugadores de un reporte
GET  /api/players/:reportCode/:playerId           Detalle de jugador
```

## Flujo de uso

1. Ir a `localhost:5173`
2. Pegar un link público de Warcraft Logs
3. La app importa el reporte y lista los fights
4. Click en un fight para ver el análisis: score, muertes, interrupts, issues
5. Click en un jugador para ver su detalle

## Estructura

```
apps/
  api/          NestJS BFF — toda la lógica de negocio y llamadas a WCL
  web/          React — UI que consume únicamente la API propia
packages/
  shared/       Tipos y utilidades compartidos (DTOs, helpers)
```

## Seguridad

- `WARCRAFTLOGS_CLIENT_SECRET` nunca sale del servidor
- React no llama a Warcraft Logs directamente
- `reportCode` validado con regex en cada endpoint
- Rate limiting: 20 requests/minuto por IP
