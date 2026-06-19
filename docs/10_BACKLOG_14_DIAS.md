# Backlog de 14 días — Sin excusas

## Fallo
Si no divides esto en entregables diarios, vas a esconderte en investigación técnica.

## Por qué duele
Este proyecto tiene demasiados caminos tentadores: OAuth, GraphQL, UI, parser TXT, Raider.IO, Blizzard, scoring, IA. Sin backlog, te dispersas.

## Acción
Cumple este plan. Cada día debe terminar con algo visible o comprobable.

---

## Día 1 — Repo + Web input

### Tareas
- Crear monorepo.
- Crear React Vite.
- Crear NestJS API.
- Crear input para link Warcraft Logs.
- Extraer `reportCode` y `fightId`.

### Criterio de aceptación
- `pnpm dev:web` levanta.
- `pnpm dev:api` levanta.
- Pegar link navega a `/report/:reportCode`.

---

## Día 2 — Warcraft Logs OAuth + metadata

### Tareas
- Crear `WarcraftLogsAuthService`.
- Crear `WarcraftLogsClientService`.
- Query metadata.
- Manejar error privado/inválido.

### Criterio de aceptación
- API retorna título, owner, start/end.
- Error humano si falla.

---

## Día 3 — Fights + DB

### Tareas
- Query fights.
- Prisma schema inicial.
- Guardar Report y Fight.
- Endpoint `GET /reports/:code`.

### Criterio de aceptación
- Report overview lista fights desde DB.

---

## Día 4 — Participantes

### Tareas
- Query masterData actors.
- Guardar players.
- Mostrar composición inicial.

### Criterio de aceptación
- Dashboard muestra nombres de jugadores.

---

## Día 5 — Cards mock + contrato final

### Tareas
- Crear DTO `FightAnalysisDto`.
- Endpoint summary con datos calculados o mockeados.
- Cards por jugador.

### Criterio de aceptación
- UI ya parece producto, aunque el cálculo sea parcial.

---

## Día 6 — Deaths + damage

### Tareas
- Consultar tabla DamageDone.
- Consultar tabla Deaths.
- Guardar métricas.
- Crear issues por deaths.

### Criterio de aceptación
- Cada player card muestra daño y muertes.

---

## Día 7 — Demo hermandad v0

### Tareas
- Pulir UI.
- Agregar estados loading/error.
- Probar con 1 reporte real público.
- Registrar bugs.

### Criterio de aceptación
- Demo navegable end-to-end.

---

## Día 8 — Interrupts

### Tareas
- Obtener casts/interruption data.
- Calcular interrupts por jugador.
- Crear issue para bajo interrupt.

### Criterio de aceptación
- Dashboard muestra interrupciones y objetivo mínimo.

---

## Día 9 — Defensivos

### Tareas
- Crear lista inicial de defensivos por clase.
- Detectar defensivos usados.
- Cruzar deaths con defensivo disponible de forma básica.

### Criterio de aceptación
- Issue: “moriste con defensivo disponible” aparece cuando aplique.

---

## Día 10 — Aug Evoker v1

### Tareas
- Detectar jugador Aug Evoker.
- Métricas iniciales:
  - direct damage;
  - contributed damage si está disponible;
  - Ebon Might uptime;
  - Prescience uptime;
  - Breath casts.

### Criterio de aceptación
- Panel Aug Evoker existe y muestra diagnóstico parcial.

---

## Día 11 — Raider.IO

### Tareas
- Cliente Raider.IO.
- Perfil por personaje.
- Score M+ en player card.

### Criterio de aceptación
- Si Raider.IO falla, la app no se cae.

---

## Día 12 — Blizzard Profile/Equipment

### Tareas
- Cliente Blizzard OAuth.
- Equipment/profile básico.
- Mostrar ilvl/spec cuando esté disponible.

### Criterio de aceptación
- Player detail muestra contexto externo.

---

## Día 13 — Comparativo histórico

### Tareas
- Guardar múltiples runs.
- Comparar player vs historial.
- Mostrar mejora/empeora.

### Criterio de aceptación
- Player detail muestra tendencia simple.

---

## Día 14 — Demo seria

### Tareas
- Probar 3 logs.
- Crear top 5 errores por run.
- Pulir copy accionable.
- Preparar README.

### Criterio de aceptación
- Alguien de la hermandad puede usarlo sin que tú expliques la app.

---

## Regla diaria
Cada día termina con commit:

```txt
day-XX: descripción concreta
```

Ejemplo:

```txt
day-02: add warcraftlogs oauth and report metadata
```

---

## Anti-excusas

```txt
“No tengo todos los datos” -> mockea y avanza UI.
“No entiendo todo GraphQL” -> consulta metadata y fights primero.
“Quiero parser TXT” -> prohibido hasta fase 3.
“Quiero móvil” -> PWA responsive basta.
“Quiero IA” -> primero reglas claras y cards útiles.
```
