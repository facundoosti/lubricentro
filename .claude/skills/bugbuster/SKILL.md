---
name: bugbuster
description: Diagnostica un bug o incidente sin tocar código - junta evidencia (logs de Railway, código, datos), clasifica el reporte, separa confirmado de hipótesis y deja docs/fixes/<fecha>-<slug>-diagnostico.md con la propuesta de solución. Usar cuando el usuario reporte "algo anda mal", "en producción falla X", "por qué pasa Y" y la causa no esté clara. No implementa el fix → después /quick-fix u /openspec-propose.
argument-hint: "<síntoma, mensaje de error o reporte>"
---

# /bugbuster — Diagnóstico sin fix

Adaptado de `rmad-dev-bugbuster` (Rankmi). **Solo lectura:** no edites código ni datos. El único archivo que escribís es el diagnóstico.

Principio: **el reporte es lo que alguien vio, no lo que pasó.** La evidencia separa un diagnóstico de una hipótesis elegante.

## 1. Recopilar

Usá lo que dio el usuario: síntoma, pantalla, hora aproximada, usuario/rol afectado, captura, mensaje. Si falta algo crítico para afirmar causa o alcance, preguntá en **una** ronda corta (`AskUserQuestion` si hay opciones claras).

## 2. Evidencia de producción (permitido sin preguntar, solo lectura)

- **Logs:** Railway MCP `get-logs` (servicio `backend` o `frontend`, ventana acotada a la hora del reporte, filtrá por `ERROR`/excepción). Si las tools no están cargadas, `ToolSearch` con `select:mcp__Railway__get-logs`.
- **¿Coincide con un deploy?** `list-deployments` → compará fecha del último deploy con el inicio del síntoma.
- **Datos:** si hace falta mirar la BD de prod, seguí la memoria de acceso (railway ssh al backend + `rails runner` **read-only**). Ese comando pide permiso: es esperado.
- Anclá cada dato a **servicio + ventana de tiempo + conteo**. Anonimizá datos personales (nombres, teléfonos, patentes) en el documento.
- Si no pudiste acceder: escribí **"sin acceso a logs"** — no es lo mismo que "no aparece en producción".

## 3. Clasificar el reporte

Con la evidencia, una de cuatro:
- **Defecto confirmado** → sigue al paso 4.
- **Comportamiento esperado** (el sistema hace lo que dice la spec en `openspec/specs/`).
- **Error de uso / dato cargado mal.**
- **No verificable** (falta evidencia).

## 4. Código

`codegraph context "<síntoma>"` → recorré el flujo sospechoso: con MCP, `codegraph_trace` (de → hasta) en una llamada; por CLI no existe `trace`, usá `codegraph callers <símbolo>` / `codegraph callees <símbolo>` salto a salto. Enumerá escenarios (el más probable primero) y qué evidencia apoya o descarta cada uno.

Si quedan varias hipótesis igual de viables: pedile al usuario **máximo 3** verificaciones concretas (reproducir pasos en la UI, revisar un registro, probar con otro rol) y anotá pedido + resultado.

## 5. Documento

`docs/fixes/YYYY-MM-DD-<slug>-diagnostico.md`:

```markdown
# Diagnóstico: <título>

## Lectura rápida
**Veredicto:** <defecto confirmado | comportamiento esperado | error de uso | no verificable>
<1–2 líneas en lenguaje claro>

## Explicación simple
<para alguien no técnico (ej. el dueño del lubricentro): qué pasó y qué hacer mientras tanto>

## Evidencia
- Logs: <servicio, ventana, conteo, extracto corto> | sin acceso a logs
- Deploy relacionado: …
- Código: `archivo:línea`

## Análisis técnico
**Confirmado:** …
**Hipótesis:** … (con qué la confirmaríamos)

## Verificaciones pedidas (si hubo)

## Propuesta de solución
<qué cambiar o validar, sin implementar · tamaño estimado: acotado | requiere change>
```

## 6. Siguiente paso

`AskUserQuestion` según el veredicto:
- Defecto acotado → **`/quick-fix` con este diagnóstico (Recommended)** · `/openspec-propose` · Nada por ahora.
- Defecto que toca varias capas, migración o contrato → **`/openspec-propose` (Recommended)** · `/orquestar` · Nada.
- Esperado / uso / no verificable → sin código; ofrecé el texto de la explicación simple para compartir.

## Nunca

- Editar código, datos o configuración.
- Presentar una hipótesis como causa confirmada.
- Escribir en la BD de producción.
