# Fix: errores de formulario sin borde rojo y outline de foco duplicado (H-06, H-07)

## Lectura rápida
En el formulario de turno no aparecía el error de "Cliente *" y ningún campo se ponía en rojo; en `/atenciones/nueva` el buscador de cliente y el de vehículo tampoco. `ServiceForm` mostraba el outline nativo además del ring violeta.

## Error
- **Turno, "Cliente *"**: el error del cliente se valida a mano con un flag `submitted`, que se activaba dentro de `handleFormSubmit`. Si fallaba otra validación (vehículo), RHF no llamaba a ese callback y el flag nunca se activaba (`frontend/src/components/features/appointments/AppointmentForm.jsx:79`).
- **Turno, campos**: select de vehículo, fecha y hora tenían `border-outline-variant` fijo.
- **Atenciones**: `inputClass` era un string fijo sin variante de error (`frontend/src/pages/ServiceRecordFormPage.jsx:293`).
- **H-06**: `ServiceForm` no tenía `focus:outline-none` en sus 3 campos. En `CustomerSearchInput` y `VehicleForm` ya estaba resuelto.
- `CustomerForm` ya marcaba los errores y ya no tenía el `console.log` (resuelto en `e07ae99`).
- Origen: `docs/PENDIENTES.md` (H-06, H-07)

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: 0 bloqueantes; se aplicaron las sugerencias triviales)
- [x] QA visual (ver `docs/qa/2026-11-06-pendientes-quick-fix.md`)

## Solución
- `AppointmentForm`: el `onSubmit` del form activa `submitted` **antes** de `handleSubmit`. Hay un helper `fieldClass(hasError)` y `aria-invalid` en vehículo, fecha y hora.
- `ServiceRecordFormPage`: `fieldClass(hasError)`; los buscadores de cliente y vehículo usan `errors.customer_id` y `errors.vehicle_id`, más `aria-invalid`.
- `CustomerSearchInput`: `aria-invalid={!!error}` (el borde rojo ya existía).
- `ServiceForm`: `focus:outline-none` en los 3 campos.

## Verificación
- Tests nuevos: `AppointmentForm.test.jsx` (2), `ServiceForm.test.jsx` (1), caso nuevo en `ServiceRecordFormPage.test.jsx`. Antes del fix fallaban los 4; ahora 33/33 junto con los de customers.
- `npx vitest run` (suite completa): 49 archivos, 367 tests ✅
- `npx eslint` sobre los archivos tocados ✅
- QA visual: `docs/qa/2026-11-06-pendientes-quick-fix.md` (12 ✅, 1 🚧 sin datos)
