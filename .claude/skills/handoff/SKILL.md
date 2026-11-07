---
name: handoff
description: Genera un bloque copiable para continuar el trabajo actual en una conversación nueva, con el comando del proyecto que corresponda (/orquestar, /quick-fix, /openspec-apply-change, /qa-visual…). No ejecuta nada. Usar cuando el usuario pida "handoff", "pasame esto a otra conversación", "cómo sigo en otro chat" o cuando una sesión larga se corta a mitad.
argument-hint: "[destino: orquestar | apply | quick-fix | qa | archive …]"
---

# /handoff — Traspaso a otra conversación

Adaptado de `rmad-util-handoff` (Rankmi). El entregable es **un bloque**; el texto alrededor es la excepción.

## Destino

- Con argumento: resolvé el alias → `orquestar` → `/orquestar`, `apply` → `/openspec-apply-change`, `qa` → `/qa-visual`, `archive` → `/openspec-archive-change`, `fix` → `/quick-fix`, `bug` → `/bugbuster`.
- Sin argumento: deducilo del trabajo hecho. Si hay **dos** igual de válidos, `AskUserQuestion` con ambos.

## Datos (verificados, no recordados)

- Rama: `git branch --show-current`
- Change activo: `openspec list` (y etapa según `tasks.md`)
- Cambios sin commitear: `git status --short` (solo cantidad + si hay migraciones)
- Entrada: ruta del archivo que la conversación nueva debe leer (`openspec/changes/<change>/`, `docs/fixes/…`, `docs/qa/…`)

**Omití lo que no esté confirmado.** Una línea de menos es correcta; una inventada rompe la conversación siguiente.

## Bloque

````
```
/<comando> <argumento>

Rama: <rama>
Change: <change o N/A>
Entrada: <ruta>
Estado: <etapa actual · lo último verificado>
Sin commitear: <n archivos · migraciones sí/no>
Decisiones ya tomadas: <1–3 bullets cortos, solo lo que no se deduce del repo>
```
````

## Reglas

- No resumas la conversación: si el contexto no entra en "Decisiones ya tomadas", pertenece a un archivo (registro en `docs/fixes/`, `design.md` del change) — escribilo ahí primero.
- Máximo 2 líneas fuera del bloque.
