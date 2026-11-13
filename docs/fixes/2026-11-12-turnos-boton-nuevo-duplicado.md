# Fix: Card "Acciones" duplicaba el botón "Nuevo Turno" en Turnos

## Lectura rápida
En la vista calendario de Turnos, debajo de la card "Este Mes" (contador por estado) había una card "Acciones" con otro botón "Nuevo Turno", repetido con el del header. Se eliminó la card.

## Error
- Síntoma: dos botones "Nuevo Turno" en la misma pantalla.
- Causa: card "Quick actions" en la sidebar (`frontend/src/pages/Appointments.jsx:341-351`, antes del fix).
- Origen: descripción del usuario.

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review
- [x] QA visual (cubierto por Vitest: riesgo bajo, solo se quita una card; el botón del header y el tour no cambian)

## Solución
Se borró el bloque de la card "Acciones" de la sidebar. El botón del header (`#tour-appointments-new-btn`, usado por el tour) queda como único punto de entrada, junto con la selección de fechas en el calendario.

## Verificación
- `npx vitest run src/pages/__tests__/Appointments.test.jsx` → falló antes del fix (2 botones), 3/3 verde después.
- `npx eslint src/pages/Appointments.jsx src/pages/__tests__/Appointments.test.jsx` → OK.
- Review `react-reviewer`: sin bloqueantes. Se aplicó la sugerencia de usar `getByRole` único y verificar el id del tour.

## Seguimiento
- `Appointments.jsx` (~490 líneas) supera el límite de 300: separar en Container/View más adelante.
