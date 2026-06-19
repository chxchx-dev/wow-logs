# Producto MVP — Guild Performance Coach

## Fallo
Tu peor error sería vender esto como “analizador universal de logs de WoW”. Eso es grande, lento y fácil de abandonar.

## Por qué duele
Un analizador universal necesita cubrir specs, raids, dungeons, expansiones, patches, edge cases, permisos, rankings y eventos raros. El MVP no aguanta esa carga.

## Acción
Véndelo como **coach visual para tu hermandad**, enfocado en M+ y lectura clara de rendimiento.

---

## Pitch del producto
**Guild Performance Coach** convierte logs de Warcraft Logs en recomendaciones visuales y accionables para mejorar runs M+ y desempeño de hermandad.

No reemplaza Warcraft Logs. Lo traduce.

---

## Input principal
Un link de Warcraft Logs:

```txt
https://www.warcraftlogs.com/reports/<reportCode>
https://www.warcraftlogs.com/reports/<reportCode>#fight=12
```

La app debe extraer:

```txt
reportCode
fightId opcional
```

---

## Output principal
Un dashboard con:

1. Resumen de la run.
2. Participantes.
3. Top errores.
4. Cards por jugador.
5. Diagnóstico por rol.
6. Sección especial para Augmentation Evoker.

---

## MVP real

### Sí entra
- Pegar link de Warcraft Logs.
- Consultar reporte desde backend.
- Mostrar metadata.
- Listar fights/runs.
- Mostrar jugadores.
- Mostrar cards básicas:
  - daño;
  - muertes;
  - interrupciones;
  - defensivos;
  - daño evitable;
  - recomendaciones.
- Métricas iniciales para Aug Evoker.

### No entra
- Login.
- Guild permissions complejos.
- Parser TXT.
- App móvil nativa.
- Rankings globales.
- Análisis perfecto por spec.
- IA generativa.
- Integración con Discord.

---

## Personas

### Raid Lead / Officer
Quiere saber rápido:
- quién repite errores;
- quién no corta;
- quién muere con defensivo disponible;
- qué pull dañó la run;
- qué jugador mejoró o empeoró.

### Jugador DPS
Quiere saber:
- si su daño fue útil o padding;
- si usó defensivos;
- si cortó casts importantes;
- si murió por mecánica evitable.

### Healer
Quiere saber:
- si las muertes eran salvables;
- si usó CDs importantes;
- si hizo dispels;
- si gastó recursos fuera de ventanas críticas.

### Tank
Quiere saber:
- si tuvo spikes por baja mitigación;
- si juntó pulls peligrosos;
- si usó defensivos tarde;
- si la ruta provocó pérdidas.

### Aug Evoker
Quiere saber:
- cuánto aportó realmente;
- si Ebon Might tuvo buen uptime;
- si Prescience fue al objetivo correcto;
- si Breath of Eons cayó con CDs aliados.

---

## User stories iniciales

```txt
Como raid lead,
quiero pegar un link de Warcraft Logs,
para ver un resumen claro de la run sin navegar el log completo.
```

```txt
Como jugador,
quiero ver mis 3 errores principales,
para corregirlos en la siguiente key.
```

```txt
Como Aug Evoker,
quiero ver daño directo vs contribución,
para no ser evaluado como un DPS tradicional.
```

```txt
Como officer,
quiero ver quién no interrumpe y quién muere repetido,
para tomar decisiones de entrenamiento.
```

---

## Métrica de producto

La app no se mide por cantidad de datos. Se mide por claridad.

### Métricas de éxito
- Tiempo hasta primer diagnóstico: menos de 60 segundos.
- Cards accionables por jugador: mínimo 3.
- Top errores por run: mínimo 5.
- Cero secretos expuestos en frontend.
- Demo funcional con una run real en 7 días.

---

## Frases accionables obligatorias
Cada card debe cerrar con una orden clara:

```txt
Próxima key: usa defensivo antes del segundo golpe fuerte.
```

```txt
Objetivo mínimo: subir interrupts de 2 a 6.
```

```txt
Sincroniza Breath of Eons con Combustion/Pillar/Avatar.
```

```txt
Deja de hacer padding en adds irrelevantes y prioriza el caster peligroso.
```
