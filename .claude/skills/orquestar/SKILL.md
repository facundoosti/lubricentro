---
name: orquestar
description: Lleva una feature de punta a punta por el flujo OpenSpec del proyecto (propose → apply → reviews → QA visual → spec-verifier → archive → commit), delegando cada tramo a un sub-agente y frenando en 4 paradas con AskUserQuestion. Usar cuando el usuario pida "orquestar", "llevá esto hasta el final", "hacé la feature completa" o retome un change a medias. No usar para un bug acotado → /quick-fix, ni para diagnosticar → /bugbuster.
argument-hint: "<idea de la feature> | <nombre de change existente>"
---

# /orquestar — Coordinar una feature de punta a punta

Adaptado de `rmad-dev-orchestrator` (Rankmi). Vos **coordinás**: decidís la etapa, delegás, verificás y preguntás. No implementás vos lo que delegaste.

## Principios (no negociables)

- **Quien escribe no revisa.** El sub-agente que modificó código nunca revisa ese código.
- **Verificar antes de anunciar.** Todo lo que declara un sub-agente se comprueba (`git diff`, `tasks.md`, tests) antes de pasarlo al mapa.
- **Una sola ronda de correcciones** después de los reviews. No se abre una segunda revisión completa.
- **No inventar estado**: change, tests, rama o commit se consultan, no se recuerdan.
- **Push a `main` = deploy a producción.** Nunca se pushea sin la parada 4.
- **No ampliar alcance.** Lo que aparezca fuera del change se anota en "Pendientes", no se hace.

## Mapa de estado

Después de cada etapa, mostrá en el chat (y solo esto, sin narrar el método):

```
🧭 <change>  ·  rama: <git branch --show-current>
✅ propose   ✅ apply   ⏳ reviews   ·  qa   ·  verify   ·  archive   ·  commit
Último: <resultado verificable en 1 línea>
Próximo: <etapa>
Pendientes: <fuera de alcance / N/A con razón>
```

Una etapa que no aplica queda `N/A` con la razón (ej. `qa: N/A — solo backend`).

## Paso 0 — Detectar dónde estamos

1. `git branch --show-current` y `git status --short`. Si la rama **no es `main`**, avisalo en el mapa (CLAUDE.md pide trabajar en `main`); se resuelve en la parada 4.
2. `openspec list`. Si el argumento es un change existente, leé su `tasks.md` y entrá en la etapa más atrasada:
   - sin tasks marcadas → apply · todas `[x]` → reviews · ya archivado → commit.
3. Si el argumento es una idea nueva → etapa 1.

## Etapa 1 — Propose (hilo principal)

Corré `/openspec-propose <idea>` en este mismo hilo (puede necesitar preguntarte cosas).

### 🛑 Parada 1 — Alcance

`AskUserQuestion` con un resumen de 2–3 líneas del proposal y la cantidad de tasks. Incluí en la pregunta **por qué importa**: corregir alcance acá es lo más barato del flujo.
Opciones: **Aprobar y construir** · **Ajustar** (el usuario dice qué; editás los artefactos y volvés a preguntar) · **Cancelar**.

## Etapa 2 — Apply (sub-agente)

Lanzá un `Agent` (`general-purpose`) con un paquete autocontenido:

```
Objetivo: implementar el change de OpenSpec <change> siguiendo .claude/skills/openspec-apply-change/SKILL.md
Leé antes: CLAUDE.md, backend/CLAUDE.md y/o frontend/CLAUDE.md según el change, openspec/changes/<change>/*
Reglas: tests + lint antes de marcar cada task; no commitear; no pushear; no tocar nada fuera del change.
Búsqueda: usá codegraph (MCP `codegraph_*` o CLI `codegraph context|query|callers|impact`) para ubicar código y `codegraph impact <símbolo>` antes de tocar uno compartido. Para ubicar un archivo o componente por nombre, `codegraph query "<Nombre>"`, nunca `grep -rl` ni `find`. Grep solo para strings literales.
Devolvé: tasks marcadas, archivos tocados, comandos de test/lint corridos con su resultado, migraciones nuevas, símbolos compartidos tocados (con su impact), dudas.
```

**Verificá** al volver: `git diff --stat`, `tasks.md`, y corré los tests afectados (`bundle exec rspec <specs>` / `npx vitest run <tests>`). Si algo no coincide con lo declarado, decilo y no avances.

## Etapa 3 — Reviews (sub-agentes en paralelo)

Según el diff, lanzá **en un mismo mensaje** `rails-reviewer` (si toca `backend/`) y `react-reviewer` (si toca `frontend/`).

### 🛑 Parada 2 — Hallazgos

Agrupá los hallazgos por severidad (bloqueante / sugerencia / nit) y preguntá con `AskUserQuestion`:
- Opciones: **Bloqueantes + sugerencias (Recommended)** · **Solo bloqueantes** · **Todo, incluidos nits** · **Nada**.
- Si hay ≤ 4 hallazgos relevantes, usá `multiSelect: true` listándolos uno por uno.
- En la descripción de cada opción, una línea de **por qué** (ej. "N+1 en listado de clientes: escala mal con datos reales").

## Etapa 3b — Una ronda de fixes (sub-agente nuevo)

Si se eligió corregir algo: `Agent` (`general-purpose`) **nuevo** con la lista exacta de hallazgos (`archivo:línea` + qué cambiar). Mismas reglas que apply (incluida la de búsqueda con codegraph). Al volver, **vos** verificás el diff de los fixes y corrés los tests. Sin segunda review completa.

## Etapa 4 — QA visual (si hay impacto visual)

Si el diff toca UI de `frontend/` → `/qa-visual` en el hilo principal (la skill decide riesgo y alcance). Si no → `qa: N/A` con la razón y saltá la parada.

### 🛑 Parada 3 — Resultado de QA

`AskUserQuestion` con el conteo pass/fail de casos `must`.
Opciones: **Seguir** (todo pasó) · **Corregir fallos** (sub-agente nuevo + re-correr solo los casos afectados) · **Aceptar fallo y seguir** (queda anotado en Pendientes).

## Etapa 5 — Verificación de specs (sub-agente)

Lanzá `spec-verifier` con el nombre del change. Si hay ❌: un sub-agente nuevo los corrige y se re-verifica **una vez**. Si sigue fallando, se informa en la parada 4.

## Etapa 6 — Archive

`/openspec-archive-change <change>` en el hilo principal.

## Etapa 7 — Commit

### 🛑 Parada 4 — Commit y deploy

Antes de preguntar, armá el resumen:
- `git status --short` (separá archivos del change de los ajenos: `.codegraph/daemon.pid`, `docker-compose.yml` personal, etc. **nunca** entran).
- **Migraciones nuevas** en `backend/db/migrate/` → avisá que corren en el deploy.
- `make lint` y tests afectados en verde (si no, decilo).
- Si la rama no es `main`: explicá cómo llegaría a `main`.

`AskUserQuestion`. Opciones: **Commit + push a main (deploy)** · **Solo commit** · **No commitear todavía**.
Recordá en la pregunta: push a `main` dispara CI y deploy a producción.

Commit en español, convencional (`feat:`, `fix:`, …), solo con los archivos del change.

## Final

Mapa de estado completo + 1 párrafo humano de qué quedó hecho + Pendientes. Si se corta a mitad, ofrecé `/handoff`.

## Nunca

- Implementar en el hilo principal lo que se delegó.
- Revisar código con el mismo agente que lo escribió.
- Pushear, hacer `reset --hard`, force-push o `db:reset`.
- Saltar una parada porque "parece obvio".
