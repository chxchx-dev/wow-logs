# Modelo de Datos — PostgreSQL + Prisma

## Fallo
Guardar JSON crudo sin modelo te da velocidad el primer día y caos el tercero.

## Por qué duele
Necesitas comparar runs, jugadores, métricas e issues. Si todo vive como blob sin criterio, cada pantalla se vuelve una cirugía.

## Acción
Guarda lo mínimo estructurado y conserva payload externo en campos JSON solo como respaldo.

---

## Entidades principales

```txt
Report
Run/Fight
Player
PlayerRunMetric
Issue
ExternalProfile
ApiCache
```

---

## Prisma schema inicial

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PlayerRole {
  TANK
  HEALER
  DPS
  SUPPORT
  UNKNOWN
}

enum IssueSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IssueType {
  DEATH
  INTERRUPT_MISSED
  DEFENSIVE_UNUSED
  AVOIDABLE_DAMAGE
  LOW_PRIORITY_DAMAGE
  AUG_BUFF_UPTIME
  AUG_BAD_PRESCIENCE_TARGET
  AUG_BAD_BREATH_TIMING
  OTHER
}

model Report {
  id           String   @id @default(cuid())
  code         String   @unique
  title        String?
  ownerName    String?
  zoneName     String?
  startTimeMs  BigInt?
  endTimeMs    BigInt?
  raw          Json?
  importedAt   DateTime @default(now())
  updatedAt    DateTime @updatedAt

  fights       Fight[]
  players      Player[]

  @@index([code])
}

model Fight {
  id              String   @id @default(cuid())
  reportId        String
  externalFightId Int
  name            String
  startTimeMs     BigInt
  endTimeMs       BigInt
  kill            Boolean?
  difficulty      Int?
  encounterId     Int?
  raw             Json?

  report          Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)
  metrics         PlayerRunMetric[]
  issues          Issue[]

  @@unique([reportId, externalFightId])
  @@index([reportId])
}

model Player {
  id          String     @id @default(cuid())
  reportId    String
  externalId  Int?
  name        String
  server      String?
  className   String?
  specName    String?
  role        PlayerRole @default(UNKNOWN)
  raw         Json?

  report      Report     @relation(fields: [reportId], references: [id], onDelete: Cascade)
  metrics     PlayerRunMetric[]
  issues      Issue[]
  profiles    ExternalProfile[]

  @@unique([reportId, name, server])
  @@index([reportId])
  @@index([name])
}

model PlayerRunMetric {
  id                    String   @id @default(cuid())
  fightId               String
  playerId              String
  role                  PlayerRole @default(UNKNOWN)

  damageDone            BigInt   @default(0)
  contributedDamage     BigInt   @default(0)
  healingDone           BigInt   @default(0)
  deaths                Int      @default(0)
  interrupts            Int      @default(0)
  interruptOpportunities Int     @default(0)
  defensivesUsed        Int      @default(0)
  avoidableDamageTaken  BigInt   @default(0)

  ebonMightUptimePct    Float?
  prescienceUptimePct   Float?
  breathAlignmentScore  Float?

  score                 Float    @default(0)
  raw                   Json?
  createdAt             DateTime @default(now())

  fight                 Fight    @relation(fields: [fightId], references: [id], onDelete: Cascade)
  player                Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([fightId, playerId])
  @@index([fightId])
  @@index([playerId])
}

model Issue {
  id          String        @id @default(cuid())
  fightId     String
  playerId    String?
  type        IssueType
  severity    IssueSeverity
  title       String
  description String
  action      String
  timestampMs BigInt?
  raw         Json?
  createdAt   DateTime      @default(now())

  fight       Fight         @relation(fields: [fightId], references: [id], onDelete: Cascade)
  player      Player?       @relation(fields: [playerId], references: [id], onDelete: SetNull)

  @@index([fightId])
  @@index([playerId])
  @@index([type])
  @@index([severity])
}

model ExternalProfile {
  id          String   @id @default(cuid())
  playerId    String
  provider    String
  region      String?
  realm       String?
  profileUrl  String?
  score       Float?
  itemLevel   Float?
  raw         Json?
  fetchedAt   DateTime @default(now())

  player      Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@index([playerId])
  @@index([provider])
}

model ApiCache {
  id          String   @id @default(cuid())
  provider    String
  cacheKey    String
  payload     Json
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@unique([provider, cacheKey])
  @@index([expiresAt])
}
```

---

## Migración

```bash
cd apps/api
pnpm prisma migrate dev --name init_gpc
pnpm prisma generate
```

---

## Reglas de guardado

### Report
Guardar una vez por `code`.

### Fight
Guardar por `reportId + externalFightId`.

### Player
Guardar por `reportId + name + server`.

### PlayerRunMetric
Guardar por `fightId + playerId`.

### Issue
Puede regenerarse. Para MVP, borra issues del fight y recalcula.

---

## Payload crudo
Mantén `raw` para debug, pero no dependas de eso en la UI.

Correcto:

```txt
UI lee PlayerRunMetric.damageDone
```

Incorrecto:

```txt
UI navega raw.entries[0].something.deep
```

---

## Queries útiles

### Resumen por fight

```ts
const fight = await prisma.fight.findUnique({
  where: { id: fightId },
  include: {
    metrics: {
      include: { player: true },
      orderBy: { score: 'desc' },
    },
    issues: {
      orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
      include: { player: true },
    },
  },
});
```

### Histórico por jugador

```ts
const history = await prisma.playerRunMetric.findMany({
  where: {
    player: {
      name: playerName,
    },
  },
  include: {
    fight: {
      include: { report: true },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

---

## Plazo
Día 3-4:

- schema creado;
- migración corriendo;
- import de report/fights/players;
- metrics mockeadas si todavía no están las calculadoras.
