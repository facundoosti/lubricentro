---
name: qa-visual
description: QA visual en el navegador para features que cambian UI. Clasifica el riesgo, arma casos TC-XX, automatiza lo posible (Vitest o Playwright con scripts) y usa Chrome DevTools MCP solo para lo exploratorio. Revisa cada caso y audita/corrige los errores. Usar al terminar de implementar cualquier cambio con impacto visual en frontend/ (pantallas, componentes, estilos, temas, responsive), o cuando el usuario pida "QA", "probar en el navegador" o "revisión visual".
---

# QA visual

Flujo obligatorio para cambios con impacto visual. La feature no termina hasta que todos los casos **must** pasen o el usuario acepte explícitamente un fallo.

**Principio:** el navegador es la herramienta más cara. Primero se decide **cuánto** probar (riesgo), después **dónde** (Vitest > script Playwright > DevTools MCP) y recién al final se abre el navegador.

## ¿Cuándo aplica?

Aplica si el diff toca: componentes/páginas `.jsx`, `index.css`, layout, temas (claro/oscuro), responsive, formularios, modales, tablas, o flujos de usuario.
No aplica a: cambios solo de backend sin efecto en UI, tests, docs, refactors sin cambio visual (en ese caso decilo y saltealo).

## Requisitos previos

1. App corriendo: `curl -sf http://localhost:5173 >/dev/null && curl -sf http://localhost:3000/up >/dev/null`. Si no está arriba, pedile al usuario que la levante (`make dev`); no la levantes en background por tu cuenta.
2. Runner Playwright instalado: `tools/qa-runner/node_modules` existe (si no: `cd tools/qa-runner && npm install`). Usa el Brave instalado, sin descargar navegadores.
3. Credenciales de QA en `CLAUDE.local.md` (`QA_EMAIL` / `QA_PASSWORD`, git-ignored). Si no están, pedíselas al usuario. Se pasan **solo como variables de entorno** en el comando; **nunca** en archivos versionados ni en el reporte.
4. DevTools MCP (`mcp__chrome-devtools__*`) solo si hay casos exploratorios. Si no aparecen las tools, avisá al usuario que corra `/mcp`.

## Paso 0 — Riesgo (decide el alcance)

Clasificá el cambio **por impacto, no por tamaño del diff**. Ante la duda, el nivel más alto.

| Riesgo | Cuándo | Alcance del QA |
|---|---|---|
| **Bajo** | Ajuste visual acotado a 1 componente, reversible, sin lógica | 1–3 casos · solo `desktop-dark` · sin regresión salvo vecino directo |
| **Medio** | Cambia comportamiento o una pantalla completa; componente compartido | Casos de la spec + 1 regresión por consumidor (`codegraph impact`) · matriz **solo en la dimensión tocada** (temas si tocó colores/tokens; viewports si tocó layout/responsive) |
| **Alto** | Layout global (sidebar, header, `Layout`), tema/tokens globales, flujos de datos (alta/edición/borrado, importaciones), auth | Matriz completa `desktop/mobile × dark/light` en los casos must + regresión de pantallas vecinas |

Escribí el nivel y una frase de justificación al principio del plan.

## Paso 1 — Casos `TC-XX`

Archivo del plan:
- Change de OpenSpec activo → `openspec/changes/<change>/qa.md` (+ `qa.mjs` si hay casos de script)
- Sin OpenSpec → `docs/qa/<AAAA-MM-DD>-<slug>.md` (+ `docs/qa/<AAAA-MM-DD>-<slug>.qa.mjs`)

**Reglas:**
- **No transcribas la spec.** Cada `#### Scenario:` del change es un caso: citá su origen (`spec: <capability> › <Requirement> › <Scenario>`) y resumí el `THEN` en una frase. Sin spec, derivá del diff y marcá `origen: diff`.
- QA aporta lo que la spec no cubre: **regresión** (consumidores del componente según `codegraph impact`) y **bordes** (vacío, uno, muchos, error de API, permisos).
- Cada caso ejecuta una regla observable; nada de casos triviales.
- Prioridad: **must** (criterio de la spec o riesgo real) / **should** (cosmético, exploratorio). Los must se corren primero.

**Ejecutor por caso** — elegí el más barato que pueda observar la regla:

| Ejecutor | Para qué | Costo |
|---|---|---|
| `vitest` | Estados (cargando, vacío, error 4xx/5xx), validaciones de formulario, lógica de render. Test con Testing Library + mock del service | Mínimo, y queda como regresión permanente |
| `script` | Layout, tema, responsive, persistencia, flujos repetibles. Va en el `.qa.mjs` y lo corre `tools/qa-runner/run.mjs` | Bajo: una llamada de Bash para toda la matriz |
| `mcp` | Exploratorio o algo que no se puede escribir de antemano (hover fino, drag, revisar visualmente un layout nuevo) | Alto: usar con moderación |
| `manual` | Lo que requiere al usuario (impresión física, WhatsApp real) | Lo ejecuta el usuario; registrás lo que reporte |

**Formato** (una línea por caso, detalle solo si hace falta):

```markdown
## Riesgo: medio — cambia el sidebar compartido por todas las pantallas

- [ ] **TC-01** · must · script · desktop-dark,desktop-light · Colapsar/expandir: el ancho pasa de 290 a 90 y vuelve — *spec: layout › Sidebar › Colapsar*
- [ ] **TC-02** · must · vitest · Lista vacía muestra el estado vacío — *borde*
- [ ] **TC-03** · should · mcp · desktop-dark · Hover del rail se ve como overlay — *origen: diff*
- [ ] **TC-04** · must · script · desktop-dark · Regresión: /appointments recalcula el calendario al colapsar — *regresión: Appointments*
```

Mostrale al usuario la lista (IDs + títulos + ejecutor) antes de ejecutar.

## Paso 2 — Ejecución (de lo más barato a lo más caro)

1. **`vitest`**: escribí/ajustá el test junto al componente y corré `npx vitest run <ruta>` (siguiendo `frontend/CLAUDE.md` y `.claude/rules/`).
2. **`script`**: escribí el `.qa.mjs` (ver `tools/qa-runner/example.qa.mjs`) y corré:
   ```bash
   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs <archivo.qa.mjs> [--only TC-01,TC-04]
   ```
   - El `check` devuelve `{ pass, reason, facts }`. `facts` es un **JSON chico con lo medido** (rects, estilos computados, `localStorage`, textos): es la evidencia, no la captura.
   - El runner ya revisa errores de consola y requests ≥ 400 (usá `allowStatus` para los esperados) y guarda capturas jpeg en `tmp/qa/<slug>/`.
   - Salida: una línea por caso × combinación + detalle solo de los fallos. Exit 1 si algo falló.
3. **`mcp`**: delegá en el subagente **`qa-visual-runner`** pasándole la ruta del plan, los IDs `mcp`, la URL base y la carpeta `tmp/qa/<slug>/`. Si el subagente no está disponible, seguí su protocolo vos mismo.

**Reuso de resultados:** un caso ✅ no se vuelve a correr si desde ese resultado no cambiaron los archivos que ejercita (`git diff --stat <sha-del-resultado>`). Tras un fix, re-ejecutá solo los casos afectados (`--only`).

**Resultados válidos:** `pass` ✅ · `fail` ❌ · `blocked` 🚧 (falta app/datos/credenciales) · `not-run` ⏭️ (con motivo). **Nunca** marques ✅ algo que no se ejecutó.

## Paso 3 — Revisión

1. Abrí (Read) **solo las capturas de los ❌** y de los casos `mcp` cuyo veredicto dependa de lo visual. Para los ✅ de script alcanza con los `facts`.
2. Actualizá cada caso en el plan: `[x]` + resultado + SHA corto + evidencia en una línea (`facts` relevante o ruta de la captura).

## Paso 4 — Auditoría y corrección

Por cada ❌:
1. **Auditar**: causa raíz con evidencia (consola, red, estilos computados, componente y token involucrado). Nada de fixes a ciegas.
2. **Corregir** respetando `frontend/CLAUDE.md` y `.claude/rules/frontend-ui.md` (tokens semánticos, sin `dark:` ni hex).
3. Correr tests + lint de la app tocada.
4. **Re-ejecutar** solo el caso fallido + sus regresiones (`--only`).
5. Registrar en `## Hallazgos`: ID, síntoma, causa raíz, fix (`archivo:línea`), estado.

Máximo 3 ciclos por caso; si sigue fallando, frená y escalá al usuario con la evidencia.
Los ⚠️ (cosméticos o fuera de alcance) se reportan al usuario, no se corrigen sin preguntar.
Si un caso descubre un comportamiento que **debería estar en la spec y no está**, anotalo como **gap de spec** (no lo entierres como un caso más).

## Cierre

Resumen al usuario: riesgo, casos ✅/❌/🚧/⏭️ por ejecutor, hallazgos corregidos, gaps de spec, pendientes y ruta al plan.
En un change de OpenSpec, el QA visual va **después** de `react-reviewer` y **antes** de `spec-verifier`.
