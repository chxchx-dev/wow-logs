# Guild Performance Coach — Docs de arranque

Esta carpeta contiene la guía completa para construir una web React/PWA que interpreta logs de Warcraft Logs para una hermandad de World of Warcraft.

## Orden de lectura

1. `00_ORQUESTADOR.md`
2. `01_PRODUCTO_MVP.md`
3. `02_SETUP_REACT_WEB.md`
4. `03_ARQUITECTURA.md`
5. `04_WARCRAFTLOGS_API.md`
6. `06_MODELO_DATOS.md`
7. `07_UI_UX_PANTALLAS.md`
8. `08_METRICAS_SCORE.md`
9. `09_API_CONTRACTS.md`
10. `10_BACKLOG_14_DIAS.md`
11. `11_PROMPTS_AGENTES.md`
12. `12_TESTING_QA.md`

## Decisión principal

Web primero. React + BFF. No móvil nativo. No parser TXT. No IA avanzada en fase 1.

## Primer entregable real

Hoy debes dejar funcionando:

- input de link Warcraft Logs;
- extracción de `reportCode`;
- navegación a dashboard;
- backend preparado para consumir Warcraft Logs sin exponer secretos.

Si no hay pantalla, no hay producto.
