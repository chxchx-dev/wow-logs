# Testing & QA — No rompas la demo

## Fallo
Construir sin pruebas mínimas te obliga a probar todo a mano cada vez que cambias una query.

## Por qué duele
APIs externas fallan, reportes privados existen, GraphQL devuelve errores y los logs no siempre traen lo que esperas. Sin QA, la demo se rompe frente a la hermandad.

## Acción
Prueba parsers, contratos, estados de error y calculadoras. No necesitas cobertura perfecta. Necesitas no hacer el ridículo.

---

## Pruebas frontend mínimas

### Parser de Warcraft Logs URL

Casos:

```txt
https://www.warcraftlogs.com/reports/ABC123
https://www.warcraftlogs.com/reports/ABC123#fight=7
https://www.warcraftlogs.com/reports/ABC123?fight=7
warcraftlogs.com/reports/ABC123
invalid-url
```

Resultado esperado:

```ts
{ reportCode: 'ABC123' }
{ reportCode: 'ABC123', fightId: '7' }
throw Error('Link inválido de Warcraft Logs')
```

---

## Estados UI obligatorios

### Home
- Input vacío.
- Link inválido.
- Link válido.

### Report Overview
- Loading.
- Report importado.
- Report privado.
- Report sin fights.

### Fight Dashboard
- Loading.
- Summary completo.
- Summary parcial.
- Fight inexistente.

---

## Pruebas backend mínimas

### Validation

```txt
reportCode válido: ABC123xyz
reportCode inválido: ../../secret
reportCode inválido: <script>
```

### WarcraftLogsAuthService

- cachea token;
- renueva token expirado;
- no loguea token;
- falla con error claro si auth responde 401.

### WarcraftLogsClientService

- manda Authorization Bearer;
- captura errores GraphQL;
- captura HTTP non-200.

---

## Pruebas de calculadoras

### DeathsCalculator

Input:

```json
{
  "player": "Aldren",
  "deaths": 2,
  "defensiveAvailable": true
}
```

Output esperado:

```json
{
  "type": "DEATH",
  "severity": "HIGH",
  "title": "Murió con defensivo disponible",
  "action": "Próxima key: usa defensivo antes del golpe fuerte del pull."
}
```

### InterruptsCalculator

Input:

```json
{
  "interrupts": 2,
  "opportunities": 11
}
```

Output esperado:

```json
{
  "type": "INTERRUPT_MISSED",
  "severity": "HIGH",
  "action": "Objetivo mínimo: subir interrupts de 2 a 6."
}
```

### AugEvokerCalculator

Input:

```json
{
  "ebonMightUptimePct": 48,
  "breathAlignmentScore": 35
}
```

Output esperado:

```json
[
  {
    "type": "AUG_BUFF_UPTIME",
    "severity": "HIGH"
  },
  {
    "type": "AUG_BAD_BREATH_TIMING",
    "severity": "HIGH"
  }
]
```

---

## Reportes para QA

Mantén una lista en `.env.local` o documento privado:

```txt
PUBLIC_REPORT_OK=<code>
PUBLIC_REPORT_WITH_AUG=<code>
PUBLIC_REPORT_LONG=<code>
PRIVATE_REPORT_EXPECT_FORBIDDEN=<code>
```

No subas códigos privados al repo público.

---

## Checklist antes de demo

```txt
[ ] Web carga sin errores en consola.
[ ] API responde healthcheck.
[ ] Postgres corre.
[ ] Report público importa.
[ ] Report privado muestra error humano.
[ ] Dashboard muestra top issues.
[ ] Player cards tienen acciones, no solo números.
[ ] Aug panel no inventa datos si faltan.
[ ] Secrets solo en API.
[ ] README explica cómo levantar todo.
```

---

## Healthcheck API

```ts
@Get('/health')
health() {
  return {
    status: 'ok',
    service: 'guild-performance-coach-api',
    timestamp: new Date().toISOString(),
  };
}
```

---

## Plazo
Día 14:

- checklist completo;
- 3 reportes probados;
- README actualizado;
- demo sin explicación manual.
