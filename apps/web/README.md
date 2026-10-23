# Web

Interfaz React con Vite para introducir un reporte de Warcraft Logs y navegar sus fights, análisis y jugadores. Consume únicamente la API de este monorepo.

Para preparar la API, la base de datos y las credenciales, sigue el [README principal](../../README.md).

## Desarrollo

Desde la raíz del monorepo:

```sh
pnpm dev:web
```

Vite sirve la web en `http://localhost:5173`. Por defecto, la web llama a `http://localhost:4000/api`. Para cambiarlo, define `VITE_API_BASE_URL` en `apps/web/.env`.

```sh
pnpm --dir apps/web build
pnpm --dir apps/web lint
```
