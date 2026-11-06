# QA visual · Tema claro/oscuro + migración de CSS

- **Cambio**: switch de tema en el header (`useThemeStore`, clase `.dark` en `<html>`), `index.css` con tokens por tema, migración de clases legacy (`gray-*`, `dark:*`, `brand-*`) a tokens semánticos en 26 componentes.
- **Rama**: `chore/claude-guardrails` (sin OpenSpec)
- **Entorno**: local · frontend `http://localhost:5173` · backend `http://localhost:3000`
- **Navegador**: Brave vía `chrome-devtools` MCP
- **Evidencia**: `tmp/qa/tema-claro-oscuro/` (git-ignored)

Salvo que se indique otra cosa, cada escenario se corre en **desktop 1440×900 · oscuro + claro**. Criterios comunes: texto legible con buen contraste, sin fondos blancos/negros "pegados" que no cambian con el tema, bordes visibles pero sutiles, sin errores de consola ni requests ≥ 400 inesperadas.

## Escenarios

### QA-01 · Switch de tema en el header
- **Pantalla**: /dashboard
- **Precondición**: sesión iniciada, `localStorage.theme` vacío
- **Pasos**: 1) Cargar /dashboard 2) Verificar que arranca en oscuro 3) Ubicar el switch a la derecha de Configuración 4) Click → claro 5) Click → oscuro
- **Resultado esperado**: el switch está pegado al ícono de Configuración, muestra 🌙 en oscuro y ☀️ en claro, el thumb se desplaza; toda la UI (header, sidebar, contenido) cambia de tema al instante; `aria-checked` refleja el estado
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ✅ pasa · `QA-01-desktop-{dark,light}.png`, `QA-01-mobile-*`

### QA-02 · Persistencia del tema sin flash
- **Pantalla**: /dashboard
- **Precondición**: QA-01
- **Pasos**: 1) Pasar a claro 2) Recargar la página 3) Navegar a /customers 4) Volver a oscuro y recargar
- **Resultado esperado**: tras recargar se mantiene el tema elegido sin parpadeo oscuro→claro; `localStorage.theme` = `light`/`dark`; `<html>` tiene/no tiene `.dark`
- **Viewports / temas**: desktop · ambos
- **Estado**: ✅ pasa · `localStorage.theme` y `.dark` coinciden tras recargar; sin flash verificado por código (script inline en `<head>`)

### QA-03 · Login
- **Pantalla**: /login
- **Precondición**: sesión cerrada (probar con tema claro y oscuro guardado)
- **Pasos**: 1) Abrir /login 2) Enviar vacío (validaciones) 3) Credenciales inválidas 4) Login correcto
- **Resultado esperado**: logo visible en ambos temas (en claro no debe desaparecer por el blend), inputs y errores legibles, botón CTA violeta
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ✅ pasa (r2) · `QA-03-desktop-{dark,light}-invalid-r2.png`

### QA-04 · Layout: sidebar + header + menú de usuario
- **Pantalla**: /dashboard
- **Pasos**: 1) Revisar sidebar (ítem activo/inactivo, hover, submenús) 2) Colapsar sidebar 3) Abrir menú de usuario 4) Mobile: abrir/cerrar sidebar
- **Resultado esperado**: ítem activo resaltado en violeta, inactivos legibles, dropdown de usuario con fondo y sombra acordes al tema, logo visible
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ⚠️ observaciones · ver H-08 (sidebar)

### QA-05 · Dashboard
- **Pantalla**: /dashboard
- **Pasos**: 1) Cargar 2) Revisar KPIs, gráficos, alertas y listas de turnos
- **Resultado esperado**: cards con fondo `surface-container` y borde sutil, textos y ejes de gráficos legibles, badges con contraste
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ⚠️ observaciones · acciones rápidas cortadas en mobile, "Ingresos: $ NaN" (fuera de alcance)

### QA-06 · Clientes: tabla, búsqueda, badges y paginación
- **Pantalla**: /customers
- **Pasos**: 1) Cargar 2) Buscar un cliente 3) Búsqueda sin resultados (estado vacío) 4) Hover en fila 5) Cambiar de página
- **Resultado esperado**: la tabla ya no es blanca en oscuro; header de tabla, divisores, hover, botón "Nuevo" y paginación (página activa violeta) correctos en ambos temas
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ⚠️ observaciones · estado vacío descentrado (`colSpan`)

### QA-07 · Clientes: modal de alta con validaciones
- **Pantalla**: /customers → "Nuevo cliente"
- **Pasos**: 1) Abrir modal 2) Guardar vacío 3) Revisar inputs con error 4) Cerrar sin guardar
- **Resultado esperado**: modal con fondo del tema y overlay oscuro, inputs con borde/placeholder legibles, mensajes de error en rojo del tema, foco visible
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ✅ pasa (r2) · overlay oscurece en ambos temas · `QA-07-desktop-{dark,light}[-confirm]-r2.png`

### QA-08 · Vehículos: tabla + formulario
- **Pantalla**: /vehicles
- **Pasos**: 1) Cargar tabla 2) Abrir "Nuevo vehículo" 3) Buscar cliente en el autocomplete (`CustomerSearchInput`) 4) Validaciones de patente/marca/modelo/año
- **Resultado esperado**: tabla y formulario con tokens del tema; dropdown del autocomplete con ítem resaltado legible; bordes rojo (error) / verde (cliente seleccionado)
- **Viewports / temas**: desktop · ambos
- **Estado**: ⚠️ observaciones · outline azul nativo duplicado con el ring (H-06)

### QA-09 · Servicios y Proveedores: tablas + formularios
- **Pantalla**: /services, /suppliers
- **Pasos**: 1) Cargar cada tabla 2) Abrir formulario de servicio y guardar vacío 3) Acciones de fila (editar/eliminar) en hover
- **Resultado esperado**: tablas, íconos de acción (hover amarillo/rojo/violeta) y formularios coherentes en ambos temas
- **Viewports / temas**: desktop · ambos
- **Estado**: ⚠️ observaciones · outline nativo duplicado; hover amarillo poco contraste en claro

### QA-10 · Productos: tabla con imagen/estado + formulario
- **Pantalla**: /products
- **Pasos**: 1) Cargar 2) Revisar aro verde (activo) / rojo (inactivo) en las imágenes 3) Abrir formulario 4) Validaciones
- **Resultado esperado**: aros y glow visibles en ambos temas; formulario legible
- **Viewports / temas**: desktop · ambos
- **Estado**: ✅ pasa (r2) · checkbox sin marcar/marcado/indeterminado visibles · `QA-10-desktop-{dark,light}-r2.png` · ⚠️ borde sin marcar en claro ≈ 2.6:1

### QA-11 · Atenciones (service records): tabla + formulario
- **Pantalla**: /service-records, /atenciones/nueva
- **Pasos**: 1) Cargar tabla (avatares de colores, badges) 2) Abrir formulario 3) Validaciones
- **Resultado esperado**: avatares (azul/verde/naranja) legibles en ambos temas, badges con contraste, formulario sin fondos blancos en oscuro
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ⚠️ observaciones · avatar achicado en mobile; errores sin borde rojo (H-07)

### QA-12 · Turnos: calendario, lista y formulario
- **Pantalla**: /appointments
- **Pasos**: 1) Vista calendario mes/semana 2) Hover sobre un evento (tooltip) 3) Vista lista con badges de estado 4) Abrir formulario de turno (InputField/TextArea) 5) Confirmar eliminación (ConfirmModal)
- **Resultado esperado**: FullCalendar respeta el tema (celdas, bordes, día de hoy, botones activos); colores de estado (programado gris, confirmado violeta, completado verde, cancelado rojo); modal de confirmación legible
- **Viewports / temas**: desktop + mobile · ambos
- **Estado**: ✅ pasa (r2) · Mes/Semana/Día con color de estado · `QA-12-desktop-{dark,light}-{month,week,day}-r2.png`

### QA-13 · Inbox
- **Pantalla**: /inbox
- **Pasos**: 1) Cargar lista de conversaciones 2) Filtros de estado 3) Abrir una conversación
- **Resultado esperado**: conversación activa resaltada, badges de estado legibles, burbujas de mensajes con contraste en ambos temas
- **Viewports / temas**: desktop · ambos
- **Estado**: ✅ pasa · `QA-13-desktop-{dark,light}.png`

### QA-14 · Recordatorios, Configuración y Presupuestos (regresión)
- **Pantalla**: /reminders, /settings, /presupuestos
- **Pasos**: 1) Cargar cada página 2) Interactuar con checkboxes (configuración) 3) Revisar tablas/listas
- **Resultado esperado**: checkbox personalizado (check visible en ambos temas), inputs date/time/number con íconos visibles, sin regresiones
- **Viewports / temas**: desktop · ambos
- **Estado**: ✅ pasa · `QA-14-desktop-*`

### QA-15 · Tour de la aplicación y toasts
- **Pantalla**: /dashboard
- **Pasos**: 1) Iniciar tour (ícono ?) 2) Avanzar 2 pasos 3) Cerrar 4) Disparar un toast (ej. guardar algo o logout/login)
- **Resultado esperado**: popover del tour con colores del tema; toast oscuro (diseño de Sileo) legible en ambos temas
- **Viewports / temas**: desktop · ambos
- **Estado**: ✅ pasa (r2) · flecha triangular y toast legible · `QA-15-desktop-{dark,light}[-toast]-r2.png`

## Hallazgos

Ejecución 1: 15 escenarios · Ejecución 2 (r2): QA-03, 07, 10, 12, 15 tras fixes, todos ✅ · 0 errores de consola · 0 requests ≥ 400. Evidencia en `tmp/qa/tema-claro-oscuro/`.

| ID | Síntoma | Causa raíz | Fix | Estado |
|----|---------|-----------|-----|--------|
| H-01 | Descripción del toast invisible en claro (contraste ~1.1:1) | Sileo no pinta la descripción sin `theme`; hereda `text-on-surface` (oscuro) sobre fill fijo `#121215` | `frontend/src/index.css` · `[data-sileo-description]` con color claro fijo | ✅ verificado (r2) |
| H-02 | Flecha del tour renderiza como cuadrado | `.lubricentro-tour-popover .driver-popover-arrow { border-color }` (2 clases) pisaba los lados `transparent` de driver.js — regresión de la simplificación | `index.css` · reglas por lado (`-side-*`) | ✅ verificado (r2) |
| H-03 | Eventos Semana/Día en azul `#3788d8` | `--fc-event-bg-color/border-color` sin sobrescribir (preexistente) | `index.css` · bloque `.fc`, ambos en `transparent` | ✅ verificado (r2) |
| H-04 | Checkbox sin marcar casi invisible; header indeterminado vacío | Utilidad `border-outline-variant` (capa utilities) pisaba el estilo en `@layer base` | `index.css` · checkbox fuera de `@layer` + `:indeterminate` | ✅ verificado (r2) |
| H-05 | Overlay del modal aclara el fondo en oscuro | Codemod mapeó `bg-gray-400/50` → `bg-outline/50` — regresión | `frontend/src/components/ui/Modal.jsx` · `bg-black/50` | ✅ verificado (r2) |
| H-06 | Outline azul nativo + ring violeta en inputs (CustomerSearchInput, VehicleForm, ServiceForm) | Falta `focus:outline-none` (preexistente) | — | ⚠️ pendiente de decisión |
| H-07 | Formularios muestran mensaje de error pero no borde rojo (CustomerForm, turno, atención); `console.log` en CustomerForm | Preexistente | — | ⚠️ pendiente de decisión |
| H-08 | Sidebar: submenú abierto resaltado como activo; botón colapsar tapado por el aside en desktop | Preexistente | — | ⚠️ pendiente de decisión |
| H-10 | Borde de checkbox sin marcar en claro ≈ 2.6:1 (< 3:1 recomendado) | `--color-outline` claro `#a1a1aa` | Posible: `--color-outline` claro → `#71717a` | ⚠️ pendiente de decisión |
| H-09 | Contraste CTA en oscuro (`on-primary #0a0012` sobre `#7c3aed` ≈ 3.6:1) | Token de diseño original | — | ⚠️ pendiente de decisión |

