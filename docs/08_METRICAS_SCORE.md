# Métricas y Score — No midas solo DPS

## Fallo
Definir rendimiento como DPS total es pensamiento de pug malo.

## Por qué duele
Para una hermandad, el rendimiento real incluye supervivencia, utilidad, interrupciones, defensivos, daño útil y coordinación. En specs como Aug Evoker, el DPS directo miente.

## Acción
Crea un score por rol y obliga a que cada métrica termine en una acción concreta.

---

## Score general inicial

```txt
score = 100
score -= penalizaciones
score += bonos limitados
score = clamp(score, 0, 100)
```

No busques perfección matemática. Busca utilidad.

---

## Severidades

```txt
LOW      = error menor, no cambió la run
MEDIUM   = error repetido o pérdida moderada
HIGH     = error que costó tiempo significativo
CRITICAL = wipe, muerte clave o fallo grave repetido
```

---

## Penalizaciones base

```txt
Death: -15
Death con defensivo disponible: -20
Interrupt perdido importante: -4
Mecánica evitable recibida alta: -8
Defensivo no usado en pull crítico: -10
Padding inútil: -5
```

---

## DPS Score

### Métricas
- daño a prioridad;
- daño en ventanas de CDs;
- interrupts;
- defensivos;
- daño evitable recibido;
- muertes por mecánica;
- utilidad usada.

### Issues

```txt
LOW_PRIORITY_DAMAGE
INTERRUPT_MISSED
DEFENSIVE_UNUSED
AVOIDABLE_DAMAGE
DEATH
```

### Acción esperada

```txt
Próxima key: prioriza caster peligroso antes de hacer padding en adds pequeños.
```

---

## Healer Score

### Métricas
- muertes con CDs disponibles;
- dispels;
- overhealing relevante;
- externos usados;
- cooldowns mal alineados;
- mana en momentos críticos.

### Issues

```txt
DEATH_WITH_EXTERNAL_AVAILABLE
DISPEL_MISSED
COOLDOWN_MISALIGNED
OVERHEALING_NO_VALUE
```

### Acción esperada

```txt
Próxima key: guarda externo para el pull 6. La muerte ocurrió mientras el CD estaba disponible.
```

---

## Tank Score

### Métricas
- uptime defensivo;
- spikes de daño;
- pulls peligrosos;
- ruta;
- muertes por falta de mitigación;
- kiting en ventanas correctas.

### Issues

```txt
MITIGATION_DROPPED
DAMAGE_SPIKE
BAD_PULL_CHAIN
DEATH_WITH_MAJOR_CD_AVAILABLE
```

### Acción esperada

```txt
Próxima key: no encadenes pull 4 y 5 sin defensivo mayor disponible.
```

---

## Aug Evoker Score

### Fallo específico
Evaluar Aug Evoker como DPS plano es incorrecto.

### Métricas
- daño directo;
- daño contribuido;
- contribución por aliado;
- Ebon Might uptime;
- Prescience uptime;
- Prescience en objetivos correctos;
- Breath of Eons alineado con CDs aliados;
- utilidad usada:
  - Rescue;
  - Zephyr;
  - Cauterizing Flame;
  - dispel;
  - knockbacks.

---

## Fórmula inicial Aug Evoker

```txt
AugScore = 100
- penalización por Ebon Might uptime bajo
- penalización por Prescience en targets pobres
- penalización por Breath fuera de CDs aliados
- penalización por no usar utilidad en eventos críticos
- penalización por muertes evitables
```

### Threshold inicial

```txt
Ebon Might uptime >= 65%: aceptable
Ebon Might uptime < 50%: alto problema
Prescience en top DPS/CD window: correcto
Breath con CDs aliados: correcto
Breath sin CDs aliados: desperdicio parcial
```

Estos thresholds son iniciales. Ajusta con logs reales de tu hermandad.

---

## Issues Aug Evoker

### Ebon Might bajo

```json
{
  "type": "AUG_BUFF_UPTIME",
  "severity": "HIGH",
  "title": "Ebon Might tuvo bajo uptime",
  "description": "Tu uptime fue 48%. Para Aug Evoker, eso reduce el valor real del spec.",
  "action": "Próxima key: prioriza mantener Ebon Might activo antes de perseguir daño directo."
}
```

### Prescience mal targeteado

```json
{
  "type": "AUG_BAD_PRESCIENCE_TARGET",
  "severity": "MEDIUM",
  "title": "Prescience cayó en objetivos de bajo valor",
  "description": "Prescience no estuvo concentrado en los DPS con mayor ventana de burst.",
  "action": "Próxima run: define dos objetivos principales antes de iniciar la key."
}
```

### Breath mal alineado

```json
{
  "type": "AUG_BAD_BREATH_TIMING",
  "severity": "HIGH",
  "title": "Breath of Eons cayó fuera de CDs aliados",
  "description": "El cast no coincidió con las ventanas fuertes de tus DPS.",
  "action": "Próxima run: sincroniza Breath con Combustion, Pillar, Avatar u otros CDs principales."
}
```

---

## Top 5 errores de run

Orden recomendado:

```txt
1. Wipes.
2. Deaths evitables.
3. Mechanics repetidas.
4. Interrupts críticos perdidos.
5. CDs/defensivos mal usados.
6. Padding o daño no prioritario.
7. Buff windows mal alineadas.
```

---

## Insight object

```ts
export interface Insight {
  id: string;
  playerId?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence?: {
    timestampMs?: number;
    spellName?: string;
    targetName?: string;
    value?: number;
  };
  action: string;
}
```

---

## Plazo
Día 5:

- score simple funcionando;
- issues generados;
- mínimo 5 frases accionables;
- Aug Evoker con panel inicial aunque sea parcial.
