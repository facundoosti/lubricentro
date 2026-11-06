---
name: qa-visual
description: QA visual en el navegador (Brave local vía Chrome DevTools MCP) para features que cambian UI. Crea escenarios y casos de uso, los ejecuta con DevTools, revisa cada escenario y audita/corrige los errores. Usar al terminar de implementar cualquier cambio con impacto visual en frontend/ (pantallas, componentes, estilos, temas, responsive), o cuando el usuario pida "QA", "probar en el navegador" o "revisión visual".
---

# QA visual

Flujo obligatorio para cambios con impacto visual. No se da por terminada la feature hasta que todos los escenarios pasen o el usuario acepte explícitamente un fallo.

## ¿Cuándo aplica?

Aplica si el diff toca: componentes/páginas `.jsx`, `index.css`, layout, temas (claro/oscuro), responsive, formularios, modales, tablas, o flujos de usuario.
No aplica a: cambios solo de backend sin efecto en UI, tests, docs, refactors sin cambio visual (en ese caso decilo y saltealo).

## Requisitos previos

1. App corriendo: `make dev` (o `make dev-local` + backend/frontend locales). Verificá con `curl -sf http://localhost:5173 >/dev/null && curl -sf http://localhost:3000/up >/dev/null`.
   Si no está arriba, pedile al usuario que la levante; no la levantes en background por tu cuenta.
2. MCP `chrome-devtools` conectado (usa Brave con el perfil persistente `~/.cache/chrome-devtools-mcp/brave-qa`). Si no aparecen las tools `mcp__chrome-devtools__*`, avisá al usuario que corra `/mcp`.
3. Credenciales de QA: leelas de `CLAUDE.local.md` (`QA_EMAIL` / `QA_PASSWORD`, git-ignored). Si no están, pedíselas al usuario. **Nunca** las escribas en archivos versionados ni en el reporte.

## Paso 1 — Escenarios y casos de uso

Escribí el plan en:
- Change de OpenSpec activo → `openspec/changes/<change>/qa.md`
- Sin OpenSpec → `docs/qa/<AAAA-MM-DD>-<slug>.md`

Derivá los escenarios de: specs del change (GIVEN/WHEN/THEN), el diff (`git diff --stat` + componentes tocados) y el blast radius (`codegraph impact <símbolo>`): incluí las pantallas que reutilizan los componentes modificados.

Cobertura mínima por feature:
- **Camino feliz** del caso de uso principal.
- **Estados**: cargando, vacío, error (API caída o 4xx/5xx), validaciones de formulario.
- **Temas**: modo oscuro y modo claro (switch del header).
- **Responsive**: mobile 375×812 y desktop 1440×900.
- **Regresión**: 1 escenario por pantalla vecina afectada según `codegraph impact`.
- **Consola y red**: sin errores en consola ni requests 4xx/5xx inesperadas.

Plantilla (un bloque por escenario):

```markdown
### QA-01 · <título corto>
- **Pantalla**: /ruta
- **Precondición**: datos/estado necesarios
- **Pasos**: 1) … 2) …
- **Resultado esperado**: qué se ve (layout, textos, colores/tokens, contraste, estados)
- **Viewports / temas**: desktop+mobile · oscuro+claro
- **Estado**: ⏳ pendiente
```

Mostrale al usuario la lista de escenarios (solo títulos) antes de ejecutar.

## Paso 2 — Ejecución con DevTools

Delegá la ejecución al subagente **`qa-visual-runner`** (mantiene screenshots y snapshots fuera del contexto principal). Pasale: ruta del `qa.md`, URL base `http://localhost:5173`, credenciales y la carpeta de evidencia `tmp/qa/<slug>/` (git-ignored).
Para re-ejecutar después de un fix, pasale solo los IDs de los escenarios a correr.

Si el subagente no está disponible, ejecutá vos mismo siguiendo el protocolo de `.claude/agents/qa-visual-runner.md`.

## Paso 3 — Revisión de cada escenario

Con el reporte del runner:
1. Abrí (Read) las capturas de los escenarios ❌ y ⚠️, y al menos una ✅ por pantalla, para validar con tu propio criterio que el resultado coincide con lo esperado (no confíes solo en el veredicto del runner).
2. Actualizá el **Estado** de cada escenario en `qa.md` (✅ pasa · ❌ falla · ⚠️ observación) con una línea de evidencia (`tmp/qa/<slug>/QA-01-desktop-dark.png`, mensaje de consola, request fallida).

## Paso 4 — Auditoría y corrección de errores

Por cada ❌:
1. **Auditar**: causa raíz con evidencia (consola, red, `get_css_styles` del elemento, componente y token involucrado). Nada de fixes a ciegas.
2. **Corregir** en el código respetando `frontend/CLAUDE.md` y `.claude/rules/frontend-ui.md` (tokens semánticos, sin `dark:` ni hex).
3. Correr tests + lint de la app tocada.
4. **Re-ejecutar** el escenario fallido + sus regresiones.
5. Registrar en `qa.md` una sección `## Hallazgos` con: ID, síntoma, causa raíz, fix (`archivo:línea`), estado.

Máximo 3 ciclos por escenario; si sigue fallando, frená y escalá al usuario con la evidencia.
Los ⚠️ (cosméticos o fuera de alcance) se reportan al usuario, no se corrigen sin preguntar.

## Cierre

Resumen al usuario: escenarios ✅/❌/⚠️, hallazgos corregidos, pendientes y ruta al `qa.md`.
En un change de OpenSpec, el QA visual va **después** de `react-reviewer` y **antes** de `spec-verifier`.
