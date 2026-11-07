# Fix: sidebar (H-08), accesibilidad de modales y switches, tooltip pegado en Turnos

## Lectura rápida
Con Operaciones abierto, en /dashboard quedaban dos ítems activos. Colapsado, el sidebar no tenía nombres accesibles. Los modales no se anunciaban como diálogo y su X no tenía nombre; los toggles de horario no eran switches. En Turnos, el tooltip quedaba visible al cambiar de mes.

## Error
- **Sidebar**: el botón del grupo usaba `menu-item-active` con `isSubmenuOpen || hasActiveSubItem` (`frontend/src/layout/Sidebar.jsx:52`). Colapsado, los ítems solo muestran el ícono, sin `aria-label` ni `title`.
- **Modal**: sin `role="dialog"`/`aria-modal`; X sin nombre (`frontend/src/components/ui/Modal.jsx`). Pasaba lo mismo con la X de `SlideOver` y con `BulkPriceModal` (sin `role` ni nombre).
- **Settings**: los toggles de horario eran `<button>` sin `role="switch"`/`aria-checked` (`frontend/src/pages/Settings.jsx:264`).
- **Turnos**: el tooltip solo se ocultaba en el `mouseleave` del evento. Al cambiar de mes o de vista el evento se desmonta bajo el puntero y ese evento nunca llega (`frontend/src/pages/Appointments.jsx:183`).
- Origen: `docs/PENDIENTES.md`

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: 0 bloqueantes; se aplicaron las sugerencias triviales)
- [x] QA visual (ver `docs/qa/2026-11-06-pendientes-quick-fix.md`)

## Solución
- Sidebar: el grupo queda activo **solo** si la ruta actual es uno de sus subítems. Se agregó `aria-expanded` al botón del grupo y, colapsado, `aria-label` y `title` en links, grupos, Configuración y Cerrar sesión.
- Modal: `role="dialog"`, `aria-modal`, `aria-labelledby` (con `useId`) y X con `aria-label="Cerrar"`. Igual en `SlideOver` (X) y `BulkPriceModal` (dialog + X).
- Settings: `role="switch"`, `aria-checked` y `aria-label` con el nombre del día.
- Turnos: `hideTooltip` se llama en `datesSet`, en `eventClick` y en `eventWillUnmount` de FullCalendar.

⚠️ Toca más de 5 archivos de producción, pero cada cambio es puntual (atributos ARIA o un handler).

## Verificación
- Tests nuevos: `Sidebar.test.jsx` (3), casos nuevos en `Modal.test.jsx` (2) y `SlideOver.test.jsx` (1), `Settings.test.jsx` (1) y `Appointments.test.jsx` (2, con FullCalendar reemplazado por un doble). Antes del fix fallaban todos salvo "el grupo sí queda activo con un subítem"; con el fix pasan.

- `npx vitest run` (suite completa): 49 archivos, 367 tests ✅
- `npx eslint` sobre los archivos tocados ✅
- QA visual: `docs/qa/2026-11-06-pendientes-quick-fix.md` (12 ✅, 1 🚧 sin datos)

## Descartado
- Partes **mobile** de H-08 (overlay bajo el header, drawer que tapa la X, drawer cerrado en el árbol de a11y), el ítem "Mobile" y el botón de usuario en mobile: la app es desktop-first (notebook) y mobile no es objetivo (`CLAUDE.md`).

## Seguimiento
- Del review: `Appointments` ahora memoiza `calendarEvents` (FullCalendar no remonta eventos al mostrar el tooltip). `Modal` acepta `ariaLabel` para los modales sin título.
- `ServiceForm`: con `focus:border-transparent`, al enfocar un campo con error se pierde el borde rojo. Ya pasaba antes; no se tocó.
