# Pendientes

Backlog de mejoras detectadas y diferidas. Al tomar uno, movelo a un change de OpenSpec (o fix chico) y borralo de acá.

## UI / QA visual (origen: QA del tema claro/oscuro, 2026-11-06)

Detalle y evidencia en [`docs/qa/2026-11-06-tema-claro-oscuro.md`](qa/2026-11-06-tema-claro-oscuro.md).

- [ ] **H-10 · Contraste del checkbox en claro** — borde sin marcar `#a1a1aa` sobre blanco ≈ 2.6:1 (< 3:1). Propuesta: `--color-outline` en modo claro → `#71717a` (`frontend/src/index.css`); revisar que no endurezca otros bordes.
- [ ] **H-09 · Contraste del CTA en oscuro** — `--color-on-primary: #0a0012` sobre `#7c3aed` ≈ 3.6:1 (< 4.5:1). Unificar: `text-on-primary` en blanco o aclarar el `primary-container`; hoy algunos CTAs usan `text-white` y otros `text-on-primary`.
- [ ] **H-06 · Outline de foco duplicado** — `CustomerSearchInput`, `VehicleForm`, `ServiceForm` muestran el outline azul nativo además del ring violeta. Agregar `focus:outline-none` (o centralizar en el primitive de input).
- [ ] **H-07 · Errores de formulario sin borde rojo** — `CustomerForm`, formulario de turno y `/atenciones/nueva` (Cliente/Vehículo) muestran el mensaje pero no marcan el input; el formulario de turno no muestra error de "Cliente *". Quitar `console.log` de debug en `CustomerForm.jsx` (l.32-33).
- [ ] **H-08 · Sidebar** — submenú expandido usa `menu-item-active` (se resalta como ruta activa); en desktop el botón "Toggle Sidebar" queda tapado por el aside fijo y no se puede colapsar con click; overlay mobile no cubre el header.
- [ ] **Estado vacío / carga descentrado** — `CustomersTable` y la carga de Productos usan `colSpan` menor a la cantidad de columnas.
- [ ] **Mobile** — Dashboard: acciones rápidas se cortan ("Presup…") y el badge "0 pend." se sale de la card; Atenciones: avatar sin `flex-shrink-0`; Turnos: "Nuevo Turno" sobresale 27 px.
- [ ] **Turnos: tooltip pegado** — si el evento se desmonta bajo el puntero el tooltip queda visible (`Appointments.jsx` ~l.166-186: limpiar también al cambiar de vista/mes).
- [ ] **Hover de "Editar" en Servicios** — `hover:text-yellow-500` es color de paleta, poco contraste en claro; pasar a token.
- [ ] **Tour: flecha tenue** — usa `outline-variant`; considerar el color de fondo del popover.
- [ ] **Accesibilidad** — modales sin `role="dialog"` y X sin nombre accesible; toggles de horario en Configuración sin `role="switch"`/`aria-checked`; botón de usuario en mobile sin nombre accesible.

## Bugs fuera del tema

- [ ] Dashboard muestra **"Ingresos: $ NaN"**.
- [ ] Autocomplete de cliente: el texto queda debajo de la X de limpiar.
- [ ] Subtítulo de Presupuestos dice "budgets" (sin traducir).
- [ ] Título de pestaña en `/login` queda "Dashboard - …".

## Seguridad

- [ ] `backend/db/seeds.rb` versiona contraseñas en texto plano de usuarios reales (admin incluido). Moverlas a variables de entorno y rotarlas si se usan en producción.
