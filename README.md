# Guild Performance Coach

Herramienta web en desarrollo que importa reportes públicos de [Warcraft Logs](https://www.warcraftlogs.com/) y presenta un resumen de sus fights, jugadores y algunas métricas de combate. Está pensada como apoyo para revisar una raid o una Mythic+; sus puntuaciones son experimentales y no sustituyen una revisión del log.

## Estado del proyecto

Este repositorio contiene un MVP local, no un servicio publicado. Hoy permite importar un reporte, ver sus fights y consultar un análisis básico de daño, muertes e interrupts.

Hay partes todavía incompletas: el uso de defensivos, el daño evitable y la sanación aún no se calculan; algunos campos aparecen como cero. El score es una heurística propia basada en muertes y comparación de interrupts con el promedio del grupo, no una puntuación oficial. Los clientes de Blizzard y Raider.IO están preparados como módulos, pero todavía no enriquecen la experiencia de la web.

## Cómo funciona

1. La web recibe un enlace o código de reporte de Warcraft Logs.
2. La API consulta Warcraft Logs con credenciales OAuth guardadas en el servidor.
3. La API guarda el reporte, los fights y los jugadores en PostgreSQL.
4. La web muestra el reporte y, al abrir un fight, solicita y guarda el análisis calculado.

Los reportes deben ser públicos y accesibles para la aplicación de Warcraft Logs configurada. La base local guarda la primera importación; para volver a consultar un reporte desde cero, elimina los datos locales con cuidado o usa otro código.

## Tecnologías

- **Web:** React 19, Vite, TypeScript y Tailwind CSS.
- **API:** NestJS, TypeScript, Prisma y Zod.
- **Base de datos:** PostgreSQL 16. El análisis calculado también se guarda en PostgreSQL.
- **Monorepo:** pnpm workspaces, con tipos compartidos en `packages/shared`.

## Requisitos

- Node.js 22 o posterior.
- pnpm 9 o posterior.
- Docker Desktop o Docker Engine con Docker Compose.
- Credenciales de cliente de Warcraft Logs para importar reportes.

## Arranque local

Desde la raíz del repositorio:

1. Instala dependencias:

   ```sh
   pnpm install
   ```

2. Crea el archivo de entorno de la API:

   PowerShell:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   ```

   macOS / Linux:

   ```sh
   cp apps/api/.env.example apps/api/.env
   ```

3. Completa `WARCRAFTLOGS_CLIENT_ID` y `WARCRAFTLOGS_CLIENT_SECRET` en `apps/api/.env`. Puedes crear una aplicación de cliente desde [Warcraft Logs API Clients](https://www.warcraftlogs.com/api/clients/). Mantén el secreto en la API y fuera de Git.

4. Inicia PostgreSQL:

   ```sh
   pnpm dev:db
   ```

5. Crea la migración inicial y genera el cliente de Prisma:

   ```sh
   pnpm db:migrate
   pnpm db:generate
   ```

   Prisma solicitará un nombre para la migración inicial; por ejemplo, `init`.

6. Inicia la web y la API:

   ```sh
   pnpm dev
   ```

   La web queda en <http://localhost:5173> y la API en <http://localhost:4000/api>. El estado del proceso se puede consultar en <http://localhost:4000/api/health>.

También puedes ejecutar cada parte por separado con `pnpm dev:db`, `pnpm dev:api` y `pnpm dev:web`.

### Base de datos local

El puerto de PostgreSQL está ligado a `127.0.0.1`. La contraseña `gpc` de Compose es solo para desarrollo local: no expongas esta base en una red pública.

`pnpm dev:db:reset` elimina los volúmenes de Docker del proyecto y vuelve a crear la base. **Se pierden los datos locales guardados.**

## Variables de entorno

El archivo de ejemplo está en [`apps/api/.env.example`](apps/api/.env.example). La API lee `apps/api/.env`.

| Variable | Requerida | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión a PostgreSQL local; el ejemplo coincide con `docker-compose.yml`. |
| `WARCRAFTLOGS_CLIENT_ID` | Sí | ID de cliente OAuth de Warcraft Logs. |
| `WARCRAFTLOGS_CLIENT_SECRET` | Sí | Secreto OAuth; solo debe estar en la API. |
| `WARCRAFTLOGS_TOKEN_URL` | Sí | URL OAuth de Warcraft Logs. |
| `WARCRAFTLOGS_GRAPHQL_URL` | Sí | Endpoint GraphQL de Warcraft Logs. |
| `PORT` | No | Puerto de la API; por defecto `4000`. |
| `CORS_ORIGIN` | No | Origen permitido para la web; por defecto `http://localhost:5173`. |

La web acepta `VITE_API_BASE_URL` en `apps/web/.env` si la API no está en `http://localhost:4000/api`.

## API disponible

Todas las rutas usan el prefijo `/api`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Confirma que el proceso API está respondiendo; no comprueba PostgreSQL ni Warcraft Logs. |
| `POST` | `/reports/import` | Importa un reporte. Cuerpo: `{"reportCode":"ABC123"}`. |
| `GET` | `/reports/:reportCode` | Metadatos y fights de un reporte ya importado. |
| `GET` | `/reports/:reportCode/fights` | Lista de fights importados. |
| `GET` | `/reports/:reportCode/fights/:fightId/summary` | Análisis básico de un fight. |
| `GET` | `/players/:reportCode` | Jugadores importados para el reporte. |
| `GET` | `/players/:reportCode/:playerId` | Detalle y métricas disponibles de un jugador. |

La API limita las peticiones a 20 por minuto y por IP. Las rutas de reporte requieren importarlo antes.

## Estructura

```text
apps/
  api/          API NestJS, acceso a Warcraft Logs y persistencia
  web/          Interfaz React
packages/
  shared/       Tipos compartidos entre API y web
docs/           Arquitectura, diseño del producto y notas de planificación
```

Consulta [`docs/README.md`](docs/README.md) para orientarte por la documentación. Los documentos de arquitectura y planificación pueden describir trabajo futuro; para el comportamiento actual, el código y este README son la referencia.

## Contribuir

Issues y pull requests son bienvenidos. Antes de proponer cambios en métricas, indica qué datos del log se usan y qué limitaciones tienen. No incluyas secretos, tokens ni códigos de reportes privados en cambios o ejemplos.

## Licencia

Este repositorio todavía no define una licencia. Hacerlo público en GitHub no concede por sí solo permiso para reutilizar el código; el titular debe elegir y añadir una licencia antes de presentarlo como software de código abierto.
