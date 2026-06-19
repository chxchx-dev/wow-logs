# UI/UX — Pantallas React

## Fallo
Si copias Warcraft Logs visualmente, pierdes. La gente ya tiene Warcraft Logs.

## Por qué duele
Tu ventaja no es mostrar 200 columnas. Tu ventaja es decir qué corregir.

## Acción
Diseña pantallas con jerarquía de decisión: resumen, errores, jugadores, detalle.

---

## Estilo visual

Dirección:
- dark premium;
- estilo gamer serio, no caricatura;
- cards con bordes sutiles;
- estados críticos claros;
- cero tablas gigantes en la primera vista.

Paleta sugerida:

```txt
background: #070a12
surface: #0f172a
surface-soft: #111827
text: #f8fafc
muted: #94a3b8
accent: cyan / violet
critical: red
warning: amber
success: emerald
```

---

## Rutas

```txt
/                            Home + input
/report/:reportCode          Report overview
/report/:reportCode/fight/:id Run dashboard
/player/:reportCode/:playerId Player detail
```

---

## Pantalla 1 — Home/Input

Objetivo:
Pegar un link y empezar análisis.

Wireframe:

```txt
+--------------------------------------------------+
| Guild Performance Coach                          |
| Traduce logs en acciones para tu hermandad.       |
|                                                  |
| [ https://www.warcraftlogs.com/reports/...    ]  |
| [ Analizar run ]                                 |
|                                                  |
| No parser TXT. No móvil. Primero claridad.        |
+--------------------------------------------------+
```

Componentes:

```txt
HeroSection
ReportLinkForm
FeatureCards
```

---

## Pantalla 2 — Report Overview

Objetivo:
Mostrar metadata y seleccionar fight/run.

Wireframe:

```txt
+--------------------------------------------------+
| Report: Guild M+ Night                           |
| Zone: Mythic+ / Date / Owner                     |
+--------------------------------------------------+
| Fights/Runs                                      |
|  #1 Dungeon/Pull name        [Analyze]           |
|  #2 Dungeon/Pull name        [Analyze]           |
|  #3 Dungeon/Pull name        [Analyze]           |
+--------------------------------------------------+
```

Componentes:

```txt
ReportHeader
FightList
FightRow
```

---

## Pantalla 3 — Run Dashboard

Objetivo:
Explicar la run en menos de 60 segundos.

Wireframe:

```txt
+--------------------------------------------------+
| Dungeon + Key + Time + Result                    |
| Composition chips                                |
+--------------------------------------------------+
| Score General | Deaths | Interrupts | Avoidable  |
+--------------------------------------------------+
| Top 5 errores que costaron la run                |
|  1. Player murió con defensivo disponible        |
|  2. 9 casts peligrosos no interrumpidos          |
|  3. Breath of Eons fuera de CDs aliados          |
+--------------------------------------------------+
| Player Cards                                     |
| [Tank] [Healer] [DPS] [Aug]                      |
+--------------------------------------------------+
```

Componentes:

```txt
RunHeader
CompositionBar
MetricStrip
TopIssues
PlayerCardGrid
PlayerCard
```

---

## Pantalla 4 — Player Detail

Objetivo:
No humillar por humillar. Mostrar evidencia y acción.

Wireframe:

```txt
+--------------------------------------------------+
| Player: Name - Spec - Role                       |
| Score: 72/100                                    |
+--------------------------------------------------+
| Lo que hiciste bien                              |
| - Buen daño en prioridad                         |
+--------------------------------------------------+
| Lo que te mató                                   |
| - Pull 4: frontal                                |
| - Pull 7: dot sin dispel                         |
+--------------------------------------------------+
| Lo que no usaste                                 |
| - Defensive CD disponible en muerte #2           |
+--------------------------------------------------+
| Próxima key                                      |
| - Usa defensivo antes del segundo golpe fuerte   |
+--------------------------------------------------+
```

Componentes:

```txt
PlayerHeader
GoodActionsPanel
DeathTimeline
UnusedToolsPanel
NextRunActionPanel
```

---

## Pantalla 5 — Aug Evoker Panel

Objetivo:
Evaluar Aug Evoker como support, no como DPS tradicional.

Wireframe:

```txt
+--------------------------------------------------+
| Augmentation Evoker Analysis                     |
+--------------------------------------------------+
| Direct Damage      | Contributed Damage          |
| Ebon Might Uptime  | Prescience Uptime           |
| Breath Alignment   | Utility Used                |
+--------------------------------------------------+
| Contribution by Ally                             |
| Mage      ██████████                             |
| Warrior   ███████                                |
| Rogue     █████                                  |
+--------------------------------------------------+
| Timing Issues                                    |
| - Breath outside Combustion window               |
| - Prescience on low-value target                 |
+--------------------------------------------------+
```

Componentes:

```txt
AugEvokerPanel
ContributionByAllyChart
BuffUptimeCard
BreathTimeline
PrescienceTargetTable
```

---

## PlayerCard props

```ts
export interface PlayerCardProps {
  playerId: string;
  name: string;
  className?: string;
  specName?: string;
  role: 'tank' | 'healer' | 'dps' | 'support' | 'unknown';
  score: number;
  damageDone: number;
  contributedDamage?: number;
  deaths: number;
  interrupts: number;
  defensivesUsed: number;
  avoidableDamageTaken: number;
  topIssue?: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    action: string;
  };
}
```

---

## Card visual base

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20 ${className}`}>
      {children}
    </section>
  );
}
```

---

## Copy de cards

### Malo

```txt
Deaths: 3
```

### Bueno

```txt
Moriste 3 veces. En 2 muertes tenías defensivo disponible. Próxima key: úsalo antes del segundo golpe fuerte del pull.
```

---

## Estados UI obligatorios

### Loading

```txt
Leyendo reporte y calculando errores críticos...
```

### Empty

```txt
Pega un link público de Warcraft Logs para empezar.
```

### Forbidden/private

```txt
No pude leer este reporte. Es privado, no existe o la app no tiene acceso.
```

### Partial analysis

```txt
Análisis parcial. Warcraft Logs respondió metadata, pero no pude calcular eventos detallados.
```

---

## Plazo
Día 5-6:

- dashboard con cards reales o mockeadas;
- top issues visibles;
- player detail navegable;
- Aug Evoker panel con datos iniciales.
