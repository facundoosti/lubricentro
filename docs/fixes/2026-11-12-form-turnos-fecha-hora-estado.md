# Fix: form de turnos — picker de fecha, picker de hora y dropdown de Estado

## Lectura rápida
En el form de turnos la fecha no abría el calendario al hacer click, la hora era un `<select>` de slots fijos y el dropdown de Estado se veía con fondo negro (menú nativo). Se abre el picker al click, la hora pasa a una lista de horas en punto con AM/PM en el dropdown de la app (obligatoria, arranca vacía) y Estado usa el dropdown propio de la app.

## Error
- Síntoma:
  1. Click en el campo Fecha no abre el calendario (solo el ícono).
  2. Hora es un `<select>` de slots de 30 min, no un selector de hora.
  3. Estado: al abrirlo, las opciones salen con fondo negro (distinto al resto de los dropdowns).
- Causa:
  1. `<input type="date">` nativo sin `showPicker()` en el click (`frontend/src/components/features/appointments/AppointmentForm.jsx`).
  2. Diseño original con `timeSlots` en un `<select>`.
  3. `<select>` nativo: en macOS Chrome/Brave el popup lo dibuja el SO según `color-scheme` y no se puede estilar con CSS.
- Origen: descripción del usuario. La hora sigue siendo obligatoria (confirmado por el usuario).

## Plan
- [x] Test que reproduce (4 tests en rojo antes del fix)
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (`react-reviewer`: 1 bloqueante de teclado en SearchableSelect, corregido; 2ª pasada sobre un TimePicker que luego se descartó)
- [x] QA visual (`docs/qa/2026-11-12-form-turnos-pickers.md`, 7/7)

## Solución
- `AppointmentForm.jsx`:
  - Fecha: `onClick` → `showPicker()` (en `try/catch`), el calendario se abre al clickear cualquier parte del campo.
  - Hora: `<select>` de slots cada 30 min → `SearchableSelect` (sin buscador ni X) con horas en punto 8 AM–8 PM (`value` `HH:00`, label `8 AM`…`8 PM`). Arranca vacía y es obligatoria (`Controller` con `required`, borde rojo). Turnos viejos con minutos (p. ej. 10:30) agregan su horario a la lista para poder mostrarse.
  - Estado: `<select>` nativo → `SearchableSelect` vía `Controller`, con el label asociado por `aria-labelledby`.
  - Se quitó el import sin uso de `InputField`.
- `SearchableSelect.jsx`: props opcionales `searchable`, `clearable`, `className`, `error`, `id`, `aria-labelledby` (los defaults mantienen el comportamiento anterior). Teclado: al abrir sin buscador se enfoca la opción elegida, ↑/↓ navegan, Enter elige, Tab/Escape cierran. ARIA: `aria-haspopup`, `aria-expanded`, `role=listbox/option`, `aria-selected`.
- `SearchableSelect`: el scroll de la propia lista ya no la cierra (antes cualquier scroll, incluido el interno, la cerraba → no se llegaba a las últimas opciones). Solo cierra el scroll de la página.
- Iteraciones descartadas a pedido del usuario: `<input type="time">` nativo (no se puede estilar) y un `TimePicker` propio de dos columnas Hora|Min ("demasiado").

### Seguimiento
- No se pasa `field.ref` del `Controller` al trigger: al fallar el submit RHF no enfoca la Hora/Estado.
- El select de Vehículo sigue siendo `<select>` nativo (mismo fondo negro en el menú del SO).
- Labels de Fecha sin `htmlFor` (ya existía).
- `className="h-11 px-4"` convive con `px-3 py-2` del trigger: hoy gana por el orden del CSS de Tailwind.
- El lector de pantalla anuncia el label ("Hora", "Estado") pero no el valor elegido (`aria-labelledby` solo apunta al label).

## Verificación
- `npx vitest run src/components/features/appointments src/components/ui src/pages` → 19 archivos, 196 tests ✅ (incluye 2 tests de scroll en `SearchableSelect.test.jsx`)
- `npx eslint src/components/features/appointments src/components/ui/SearchableSelect.jsx` ✅
- QA visual: `node tools/qa-runner/run.mjs docs/qa/2026-11-12-form-turnos-pickers.qa.mjs` → 7/7 ✅ (dark + light)
