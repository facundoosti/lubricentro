# QA visual — badge "Beta" en el sidebar

## Riesgo: bajo — agregado visual acotado al sidebar, sin lógica

Origen: diff · registro `docs/fixes/2026-11-13-badge-beta-sidebar.md`. Cambios sin commitear sobre `5ffb022`.

- [x] **TC-01** · must · script · desktop-dark,desktop-light · Badge en Inbox y Recordatorios, dentro del ítem, contraste ≥ 4.5; Dashboard sin badge — ✅ `contrast: 7.55`, `insideLink: true`
- [x] **TC-02** · must · script · desktop-dark · Con Inbox activo el badge sigue visible — ✅ `insideLink: true`
- [x] **TC-03** · must · script · desktop-dark · Sidebar colapsado (90 px): sin badge — ✅ `width: 90, Inbox: null`

Script: `docs/qa/2026-11-13-badge-beta-sidebar.qa.mjs` · capturas en `tmp/qa/badge-beta-sidebar/`

## Hallazgos
- Ninguno.
