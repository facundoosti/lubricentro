# QA visual — form de turnos: pickers de fecha/hora y dropdown de Estado

Fix: `docs/fixes/2026-11-12-form-turnos-fecha-hora-estado.md`

## Riesgo: medio — cambia el comportamiento del form y toca `SearchableSelect` (compartido, hoy sin consumidores en producción) y el color del dropdown de Estado

- [x] **TC-01** · must · vitest · Click en Fecha llama a `showPicker`; Hora = lista de horas en punto AM/PM, vacía y obligatoria; Estado no es `<select>` nativo; teclado y edición — *origen: diff* → ✅ c2bee2c+wip · 7 tests en AppointmentForm.test.jsx
- [x] **TC-02** · must · script · desktop-dark,desktop-light · Estado abre el dropdown de la app con fondo `surface-container` (no negro en claro), sin buscador, por encima del modal — *origen: diff* → ✅ c2bee2c+wip · bg dark rgb(18,18,21) / light rgb(255,255,255), z 9999, sin buscador
- [x] **TC-03** · must · script · desktop-dark · Elegir "Confirmado" actualiza el trigger y el trigger mide igual de alto que los otros campos (44px) — *origen: diff* → ✅ c2bee2c+wip · trigger 44px = fecha 44px
- [x] **TC-04** · must · script · desktop-dark · Submit vacío: Hora muestra 'Seleccionar hora' con borde rojo; Fecha es `type=date` — *borde* → ✅ c2bee2c+wip · borde rgb(239,68,68) = `border-error`

- [x] **TC-05** · must · script · desktop-dark,desktop-light · Lista de Hora: 8 AM…8 PM (13 opciones, sin minutos) con el fondo del tema; elegir '10 AM' actualiza el trigger — *origen: diff (pedido del usuario)* → ✅ c2bee2c+wip
- [x] **TC-06** · must · script · desktop-dark · Scrollear la lista de Hora con la rueda hasta el final no la cierra y se puede elegir '8 PM' — *bug reportado por el usuario* → ✅ c2bee2c+wip · scrollTop 260, sigue abierta, trigger '8 PM'

## Hallazgos
- Reporte del usuario: la lista se cerraba al scrollear hasta las últimas horas. Causa: el listener de `scroll` en captura de `SearchableSelect` cerraba con cualquier scroll, incluido el de la propia lista. Fix: ignorar scrolls dentro del dropdown (`SearchableSelect.jsx`, `handleScroll`). TC-06 ✅.
- TC-04 (1ª corrida): `border-error!` en `className` no ganaba al borde base → se agregó prop `error` a `SearchableSelect` (`SearchableSelect.jsx`). Re-corrida con espera por `transition-colors` → ✅.
- TC-05 (versión TimePicker, descartada): el color del seleccionado se midió a mitad de `transition-colors` → falso negativo; se agregó una espera de 300 ms al script. Sin cambio de código.

> No automatizable: que el calendario nativo se vea abierto (headless no lo dibuja) → cubierto por TC-01 (`showPicker` invocado).
