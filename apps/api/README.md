# API

Backend NestJS para importar reportes de Warcraft Logs, guardar sus datos en PostgreSQL y ofrecer resúmenes a la aplicación web.

Para instalar el monorepo y configurar credenciales, sigue el [README principal](../../README.md). La API lee `apps/api/.env`; puedes crear ese archivo copiando [`.env.example`](.env.example).

## Comandos

Desde la raíz del monorepo:

```sh
pnpm dev:api
pnpm --dir apps/api build
pnpm --dir apps/api test
```

La API escucha por defecto en `http://localhost:4000/api`. `GET /health` indica que el proceso responde, pero no verifica dependencias externas.

Las rutas disponibles y las limitaciones actuales del análisis están descritas en el [README principal](../../README.md#api-disponible).
