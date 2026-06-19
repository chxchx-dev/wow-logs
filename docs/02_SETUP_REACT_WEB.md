# Setup React Web — Vite + TypeScript + Tailwind

## Fallo
Si metes todo en una sola carpeta sin estructura, vas a terminar con componentes gigantes, fetches duplicados y secretos mal puestos.

## Por qué duele
Warcraft Logs usa credenciales OAuth. El `client_secret` no puede tocar el navegador. Si lo haces directo desde React, quemas seguridad desde el día uno.

## Acción
Crea una web React y un backend BFF. React consume tu API. Tu API consume Warcraft Logs, Blizzard y Raider.IO.

---

## Estructura recomendada

```txt
guild-performance-coach/
  apps/
    web/
    api/
  packages/
    shared/
  docs/
  docker-compose.yml
  pnpm-workspace.yaml
  package.json
  .env.example
```

---

## Crear workspace

```bash
mkdir guild-performance-coach
cd guild-performance-coach
pnpm init
```

Crear `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Crear carpetas:

```bash
mkdir -p apps packages docs
```

---

## Crear React web

```bash
cd apps
pnpm create vite web --template react-ts
cd web
pnpm install
```

Instalar dependencias:

```bash
pnpm add @tanstack/react-query zustand react-router-dom zod clsx lucide-react
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p
```

Configurar `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Configurar `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #070a12;
  color: #f8fafc;
}
```

---

## Crear API NestJS

Desde la raíz:

```bash
cd apps
pnpm dlx @nestjs/cli new api --package-manager pnpm
```

Instalar dependencias API:

```bash
cd api
pnpm add @nestjs/config @nestjs/axios @nestjs/throttler @prisma/client zod
pnpm add -D prisma
pnpm prisma init
```

---

## Crear package shared

```bash
cd ../../packages
mkdir shared
cd shared
pnpm init
mkdir src
```

`packages/shared/package.json`:

```json
{
  "name": "@gpc/shared",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

`packages/shared/src/index.ts`:

```ts
export type Role = 'tank' | 'healer' | 'dps' | 'support';

export interface ParsedReportLink {
  reportCode: string;
  fightId?: string;
}
```

---

## Variables de entorno

Crear `.env.example` en la raíz:

```env
# Web
VITE_API_BASE_URL=http://localhost:4000

# API
PORT=4000
DATABASE_URL=postgresql://gpc:gpc@localhost:5432/gpc?schema=public

WARCRAFTLOGS_CLIENT_ID=change_me
WARCRAFTLOGS_CLIENT_SECRET=change_me
WARCRAFTLOGS_TOKEN_URL=https://www.warcraftlogs.com/oauth/token
WARCRAFTLOGS_GRAPHQL_URL=https://www.warcraftlogs.com/api/v2/client

BLIZZARD_CLIENT_ID=change_me
BLIZZARD_CLIENT_SECRET=change_me
BLIZZARD_REGION=us

RAIDERIO_BASE_URL=https://raider.io/api/v1
```

---

## Docker Compose mínimo

`docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: gpc-postgres
    environment:
      POSTGRES_USER: gpc
      POSTGRES_PASSWORD: gpc
      POSTGRES_DB: gpc
    ports:
      - "5432:5432"
    volumes:
      - gpc_postgres:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: gpc-redis
    ports:
      - "6379:6379"

volumes:
  gpc_postgres:
```

---

## Scripts raíz

`package.json` raíz:

```json
{
  "name": "guild-performance-coach",
  "private": true,
  "type": "module",
  "scripts": {
    "dev:web": "pnpm --dir apps/web dev",
    "dev:api": "pnpm --dir apps/api start:dev",
    "dev:db": "docker compose up -d postgres redis",
    "dev": "pnpm dev:db && concurrently \"pnpm dev:web\" \"pnpm dev:api\""
  },
  "devDependencies": {
    "concurrently": "latest"
  }
}
```

Instalar:

```bash
pnpm add -D concurrently -w
```

---

## Rutas frontend iniciales

```txt
/
/report/:reportCode
/report/:reportCode/fight/:fightId
/player/:reportCode/:playerId
```

---

## Estructura frontend

```txt
apps/web/src/
  app/
    router.tsx
    providers.tsx
  features/
    report-import/
      components/ReportLinkForm.tsx
      utils/parseWarcraftLogsUrl.ts
    run-dashboard/
      components/RunSummary.tsx
      components/TopIssues.tsx
      components/PlayerCard.tsx
      hooks/useReportSummary.ts
    aug-evoker/
      components/AugEvokerPanel.tsx
  shared/
    api/http.ts
    components/Card.tsx
    components/EmptyState.tsx
    components/LoadingState.tsx
  main.tsx
  index.css
```

---

## Parser de link

`src/features/report-import/utils/parseWarcraftLogsUrl.ts`:

```ts
export function parseWarcraftLogsUrl(input: string) {
  const trimmed = input.trim();

  const reportMatch = trimmed.match(/warcraftlogs\.com\/reports\/([a-zA-Z0-9]+)/);
  if (!reportMatch) {
    throw new Error('Link inválido de Warcraft Logs');
  }

  const fightMatch = trimmed.match(/[?#&]fight=([a-zA-Z0-9]+)/);

  return {
    reportCode: reportMatch[1],
    fightId: fightMatch?.[1],
  };
}
```

---

## Primer componente útil

`ReportLinkForm.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseWarcraftLogsUrl } from '../utils/parseWarcraftLogsUrl';

export function ReportLinkForm() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const parsed = parseWarcraftLogsUrl(value);
      const path = parsed.fightId
        ? `/report/${parsed.reportCode}/fight/${parsed.fightId}`
        : `/report/${parsed.reportCode}`;
      navigate(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
      <label className="block text-sm font-medium text-slate-300">
        Link de Warcraft Logs
      </label>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="https://www.warcraftlogs.com/reports/..."
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
        Analizar run
      </button>
    </form>
  );
}
```

---

## Plazo
Hoy debes dejar:

- repo creado;
- web levantando;
- API levantando;
- input de Warcraft Logs funcionando;
- navegación a `/report/:reportCode`.

Si no tienes eso hoy, estás investigando de más y construyendo de menos.
