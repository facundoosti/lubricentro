---
name: quick-fix
description: Corrige un bug acotado sin pasar por OpenSpec - test que reproduce, fix mínimo, review por sub-agente y registro en docs/fixes/. Usar cuando el usuario pida "arreglá este bug", "quick fix", o venga de un diagnóstico de /bugbuster. No usar si el cambio necesita migración, cambia un contrato de API o toca más de ~5 archivos de producción → /openspec-propose (o /orquestar).
argument-hint: "<descripción del bug> | docs/fixes/<archivo>-diagnostico.md"
---

# /quick-fix — Arreglo acotado

Adaptado de `rmad-dev-quick-fix` (Rankmi). Que el fix sea chico **no** lo exime de test ni de review: los cambios chicos en auth, permisos o queries son donde se cuela lo grave.

## 1. ¿Es acotado?

Es acotado si **todo** se cumple:
- ≤ ~5 archivos de producción y ~100 líneas (sin contar tests).
- Sin migración, sin cambio de contrato de API (request/response), sin cambio de comportamiento acordado en `openspec/specs/`.
- La causa está clara (si viene de `/bugbuster`, leé ese archivo y **no** rehagas el diagnóstico).

Si algo falla → pará y sugerí `/openspec-propose` u `/orquestar`. Si la causa no está clara → `/bugbuster`.

## 2. Registro

Creá `docs/fixes/YYYY-MM-DD-<slug>.md` (fecha de hoy) con:

```markdown
# Fix: <título>

## Lectura rápida
<1–2 líneas: qué fallaba y qué se cambió>

## Error
- Síntoma: …
- Causa: … (`archivo:línea`)
- Origen: <descripción del usuario | docs/fixes/…-diagnostico.md>

## Plan
- [ ] Test que reproduce
- [ ] Fix mínimo
- [ ] Tests + lint
- [ ] Review
- [ ] QA visual (o N/A: razón)

## Solución
<qué se cambió y por qué así>

## Verificación
<comandos corridos y resultado>
```

Actualizá el checklist en cada hito.

## 3. Test primero

Escribí el test que reproduce el bug en la capa correcta (RSpec request/model/service, o Vitest para UI) y **corrélo para verlo fallar**. Aserción observable, no de implementación. Leé `.claude/rules/backend-specs.md` o `.claude/rules/frontend-tests.md` antes.

Si no se puede reproducir con un test, anotá por qué en el registro.

## 4. Fix mínimo

- Solo lo necesario para que el test pase. Nada de refactors de paso; si ves algo, anotalo en el registro como "Seguimiento".
- Antes de tocar un símbolo compartido: `codegraph impact <símbolo>`.

## 5. Tests + lint

Tests del archivo tocado y vecinos (`bundle exec rspec <specs>` / `npx vitest run <tests>`) y lint de los archivos tocados (`bundle exec rubocop <files>` / `npx eslint <files>`). Todo verde antes de seguir.

## 6. Review (sub-agente)

Lanzá `rails-reviewer` y/o `react-reviewer` según lo tocado. Corregí bloqueantes; las sugerencias van al registro como Seguimiento salvo que sean triviales.

Si el fix toca **auth, permisos, queries con input del usuario o el Inbox/WhatsApp**, pedile al reviewer foco explícito en seguridad.

## 7. QA visual

Si cambió algo visible en `frontend/` → `/qa-visual` (riesgo bajo, escenario en `docs/qa/`). Si no → `N/A` con razón.

## 8. Cierre

Completá `## Solución` y `## Verificación`. Después `AskUserQuestion`:
- **Commit + push a main (deploy)** · **Solo commit** · **No commitear**.
- En la pregunta: archivos que entrarían y recordatorio de que push = deploy.

Commit: `fix: <qué>` en español, solo con los archivos del fix + el registro.

## Nunca

- Arreglar sin test que lo cubra (salvo imposibilidad anotada).
- Ampliar el alcance "ya que estoy".
- Pushear sin la pregunta del paso 8.
