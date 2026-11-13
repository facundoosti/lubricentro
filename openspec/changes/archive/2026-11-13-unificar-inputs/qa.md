# QA visual: unificar-inputs

Script: `openspec/changes/unificar-inputs/qa.mjs` · Capturas: `tmp/qa/unificar-inputs/`

## Riesgo: alto
El change toca todos los formularios y buscadores de la app, y también las primitivas compartidas (Select, DateInput, TimeInput, Autocomplete). Por eso los casos de estilo se corren en dark y light.

- [x] **TC-01** · must · vitest · Input (default/sm/override/error/ícono/ref), Textarea, Field (label, required, error, hint, id propio, isFieldControl) y regla de ESLint — *spec: campos-texto › Input común, Estado de error, Ícono, Textarea, Field, ESLint*
- [x] **TC-02** · must · script · dark,light · El diálogo de cliente y Configuración tienen el mismo estilo computado de input y de label — *spec: campos-texto › Todos los formularios… › Mismo estilo en diálogo y en página*
- [x] **TC-03** · must · script · dark · Turnos: Cliente, Fecha, Hora y Estado tienen el mismo alto y el mismo fondo — *spec: campos-texto › Controles alineados › Fila mixta*
- [x] **TC-04** · must · script · dark · Los buscadores de 8 pantallas tienen el mismo alto, el mismo fondo y la lupa adentro — *spec: campos-texto › Todos los formularios… › Buscadores de tablas*
- [x] **TC-05** · must · script · dark,light · Foco: el borde se pone violeta y aparece el anillo de 2px — *origen: diff (inputVariants)*
- [x] **TC-06** · must · script · dark · Error en el diálogo de cliente: `aria-invalid`, borde rojo, `role=alert` y `aria-describedby` — *spec: campos-texto › Estado de error / Field › Mensaje de error*
- [x] **TC-07** · must · script · dark · Presupuesto nuevo: el buscador de ítems y los inputs de ItemRow son compactos — *regresión: ItemRow, ItemSearchInput*
- [x] **TC-08** · must · script · dark,light · Login: email y contraseña con el estilo común y sin scroll horizontal — *regresión: Login*
- [x] **TC-09** · should · script · dark · El textarea del Inbox tiene el estilo común — *regresión: ConversationDetail*
- [x] **TC-10** · must · script · dark,light · Los planes de cuotas tienen el mismo estilo que los demás inputs de Configuración — *regresión: InstallmentPlanForm*

## Resultados
Corrida del 2026-11-13 sobre el working tree (base `683610a`):
- ✅ TC-01: vitest completo, 743/743. Incluye Input, Textarea, Field, Select, DateInput y eslintNativeControls.
- ✅ TC-02: 38px, `px-3`, radio 8px y 14px de fuente, idénticos en los dos temas. El label es igual en color y en peso 500.
- ✅ TC-03: Cliente, Fecha, Hora y Estado miden 38px, con fondo `rgb(24,24,27)`.
- ✅ TC-04: las 8 pantallas miden 38px y tienen `pl-9` (36px) con la lupa adentro.
- ✅ TC-05: el borde pasa de `rgb(39,39,42)` a `rgb(167,139,250)` en dark y a `rgb(124,58,237)` en light, más el anillo de 2px al 20%.
- ✅ TC-06: `aria-invalid="true"`, borde `rgb(239,68,68)` (un campo válido queda en `rgb(39,39,42)`), 2 alertas y `aria-describedby="name-message"`.
- ✅ TC-07: buscador de ítems e inputs de la fila en 34px (`sm`); los campos generales en 38px.
- ✅ TC-08: email y contraseña de 38px, idénticos, sin overflow, en los dos temas.
- ✅ TC-09: textarea con radio 8px, `px-3`, 14px y fondo `surface-variant`.
- ✅ TC-10: idéntico a "Nombre del Lubricentro" en los dos temas.

## Hallazgos
Los 3 fallos de la primera corrida eran errores del script. Los corregí en el script, sin tocar código de la app:
- **TC-05 y TC-06:** se midió el borde antes de que terminara `transition-colors` (150ms). Ahora espera 400ms.
- **TC-07:** el script tomaba el buscador de cliente en vez del de ítems.
- **TC-09:** el selector no abría la conversación.

Gap de spec: la spec dice `sm` "~34px" y el real es 34px (`py-1.5` + line-height 20px + borde). Es aceptable, porque coincide con la ItemRow previa.
