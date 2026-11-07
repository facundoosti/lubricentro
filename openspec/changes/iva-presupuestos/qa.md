# QA visual · iva-presupuestos

- **URL base**: http://localhost:5173
- **Evidencia**: `tmp/qa/iva-presupuestos/`
- **Datos**: usar productos existentes; si hace falta, crear desde la UI un producto "QA Neumático 175" ($4.000, 10,5%) y un servicio existente cualquiera. Cliente con teléfono y al menos un vehículo (o crearlo desde Clientes).

## Productos

### QA-01 · Tabla de productos con IVA
- **Pantalla**: /products
- **Precondición**: hay productos cargados
- **Pasos**: 1) Abrir Productos.
- **Resultado esperado**: el encabezado de la columna de precio dice "Precio s/IVA · c/IVA"; cada fila muestra el precio neto, un badge "IVA 21%" (o "IVA 10,5%") y el precio con IVA debajo. Sin desbordes ni scroll horizontal en desktop.
- **Viewports / temas**: desktop+mobile · oscuro+claro
- **Estado**: ✅ pasa · `tmp/qa/iva-presupuestos/QA-01-desktop-dark.png` (mobile: la tabla scrollea por dentro, sin desborde de página)

### QA-02 · Formulario de producto con alícuota
- **Pantalla**: /products → Nuevo / Editar producto
- **Pasos**: 1) Abrir "Nuevo producto". 2) Escribir precio 10000. 3) Cambiar IVA a 10,5%.
- **Resultado esperado**: el campo se llama "Precio sin IVA (ARS)"; el selector "IVA" arranca en 21%; debajo aparece "Con IVA: $12.100" y pasa a "$11.050" al elegir 10,5%. Al editar un producto existente, el selector muestra su alícuota.
- **Viewports / temas**: desktop+mobile · oscuro
- **Estado**: ✅ pasa · `QA-02-desktop-dark.png` ($12.100 → $11.050)

### QA-03 · Cambio masivo de IVA
- **Pantalla**: /products
- **Pasos**: 1) Seleccionar 2 productos con el checkbox. 2) Tocar "Cambiar IVA". 3) Elegir 10,5% y "Aplicar a 2 productos". 4) Volver a dejarlos en 21% con el mismo flujo.
- **Resultado esperado**: el botón "Cambiar IVA" aparece en la barra de selección junto a "Actualizar precios"; el modal muestra la cantidad, dos opciones grandes (21% / 10,5%) y aclara que los precios no cambian; al aplicar aparece un toast de éxito, se limpia la selección y la tabla muestra la nueva alícuota. Precios netos sin cambios.
- **Viewports / temas**: desktop · oscuro+claro
- **Estado**: ⚠️ pasa con observaciones · `QA-03-desktop-dark-aplicado.png` (modal siempre arranca en 10,5%; toast en Title Case)

## Presupuesto — formulario

### QA-04 · Nuevo presupuesto con IVA mixto (camino feliz)
- **Pantalla**: /presupuestos/nuevo
- **Pasos**: 1) Elegir un cliente con vehículos. 2) Elegir un vehículo del select. 3) Recargo tarjeta 10. 4) Línea 1: buscar un producto al 21%, cantidad 2. 5) Enter en el precio → línea 2: buscar el producto al 10,5%. 6) Enter → línea 3: buscar un servicio. 7) Abrir "Desglose". 8) Crear presupuesto.
- **Resultado esperado**: subtítulo "Completá los datos del presupuesto" (sin "budget"); cada línea toma la alícuota del origen (21% / 10,5% / Sin IVA); la barra fija muestra "Efectivo / Débito" y "Tarjeta de crédito (+10%)"; el desglose muestra Subtotal neto, IVA 21%, IVA 10,5%, Sin IVA (servicios) y Recargo; al guardar navega a la edición con toast de éxito y los totales coinciden.
- **Viewports / temas**: desktop · oscuro
- **Estado**: ✅ pasa tras fix H-02 · `QA-04-desktop-dark-items.png` (totales verificados a mano)

### QA-05 · Buscador de ítems con teclado y stock
- **Pantalla**: /presupuestos/nuevo
- **Pasos**: 1) Escribir en "Buscar producto o servicio...". 2) ↓ ↓ y Enter. 3) Repetir y presionar Esc.
- **Resultado esperado**: cada resultado muestra "$neto + IVA X% = $final" o "precio final" (servicios), y "Stock: N" o badge "Sin stock"; la opción activa se resalta; Enter completa la línea; Esc cierra la lista sin enviar el formulario.
- **Viewports / temas**: desktop · oscuro+claro
- **Estado**: ✅ pasa tras fix H-02/H-03 · `QA-05-desktop-dark.png`

### QA-06 · Formulario en mobile (tarjetas + barra fija)
- **Pantalla**: /presupuestos/nuevo
- **Pasos**: 1) Viewport 375×812. 2) Cargar 3 ítems. 3) Scroll.
- **Resultado esperado**: los ítems se ven como tarjetas apiladas (descripción arriba, cantidad/precio/IVA/importe con etiquetas, botón quitar arriba a la derecha); sin scroll horizontal; la barra de totales con Guardar queda fija abajo y no tapa contenido de forma permanente.
- **Viewports / temas**: mobile · oscuro+claro
- **Estado**: ⚠️ pasa con observaciones tras fix H-04 · `QA-06-mobile-light-final.png` (barra ocupa ~160 px; puede tapar la línea siguiente hasta hacer scroll)

### QA-07 · Quitar líneas y editar
- **Pantalla**: /presupuestos/:id/editar (el creado en QA-04)
- **Pasos**: 1) Quitar la línea del servicio. 2) Guardar. 3) Recargar la página. 4) Quitar todas las líneas hasta dejar una.
- **Resultado esperado**: tras guardar y recargar, la línea quitada ya no está y los totales se recalculan; al quitar la única línea queda una vacía. Request PATCH 200 sin errores.
- **Viewports / temas**: desktop · oscuro
- **Estado**: ✅ pasa · `QA-07-desktop-dark-guardado.png` (PATCH 200, línea borrada persiste)

### QA-08 · Cambio de cliente limpia el vehículo · validaciones
- **Pantalla**: /presupuestos/nuevo
- **Pasos**: 1) Elegir cliente y vehículo. 2) Cambiar a otro cliente. 3) Borrar la fecha y guardar.
- **Resultado esperado**: al cambiar de cliente se limpia el vehículo; sin fecha aparece "La fecha es obligatoria" y no se envía.
- **Viewports / temas**: desktop · claro
- **Estado**: ✅ pasa · `QA-08-desktop-light.png` (borrar solo el día muestra el mensaje nativo del navegador)

### QA-09 · Acciones del presupuesto (WhatsApp / Duplicar / Imprimir)
- **Pantalla**: /presupuestos/:id/editar
- **Pasos**: 1) Ver acciones del encabezado. 2) Inspeccionar el link de WhatsApp (no abrirlo). 3) Tocar "Duplicar".
- **Resultado esperado**: el link apunta a `https://wa.me/549...?text=` con el resumen y los totales; con un cliente sin teléfono el botón está deshabilitado con tooltip; "Duplicar" crea un borrador con fecha de hoy, mismos ítems y alícuotas, y abre su edición.
- **Viewports / temas**: desktop+mobile · oscuro
- **Estado**: ✅ pasa tras fix H-01 · `QA-09-desktop-dark-duplicado.png` (wa.me/549…; duplicado #64 correcto)

## Impresión

### QA-10 · Impresión con desglose de IVA
- **Pantalla**: /presupuestos/:id/imprimir (el de QA-04)
- **Resultado esperado**: columnas CANT · ARTÍCULO · P. UNIT. S/IVA · IVA · IMPORTE C/IVA; servicios con "s/IVA"; pie con Subtotal neto, IVA 21% s/ base, IVA 10,5% s/ base, Subtotal con IVA, Sin IVA, EFECTIVO / DÉBITO TOTAL y TARJETA DE CRÉDITO TOTAL. La hoja se ve bien (fondo blanco) en ambos temas.
- **Viewports / temas**: desktop · oscuro+claro
- **Estado**: ✅ pasa · `QA-10-desktop-light.png`

### QA-11 · Impresión de un presupuesto viejo (regresión)
- **Pantalla**: /presupuestos/:id/imprimir de un presupuesto creado antes del cambio
- **Resultado esperado**: sin columna IVA ni desglose; solo los dos totales, con los mismos montos que tenía antes.
- **Viewports / temas**: desktop · claro
- **Estado**: ✅ pasa · `QA-11-desktop-light.png` (#62 sin columna IVA, totales iguales al listado)

## Listado

### QA-12 · Filtro y cambio rápido de estado
- **Pantalla**: /presupuestos
- **Pasos**: 1) Tocar el chip "Borrador". 2) Cambiar el estado de una fila a "Enviado" desde su menú. 3) Volver a "Todos".
- **Resultado esperado**: el chip activo se resalta; la lista se filtra; el badge-menú cambia de color según el estado y aparece un toast "Estado actualizado"; columnas "Efectivo / Débito" y "Tarjeta"; acciones por fila (imprimir, WhatsApp, duplicar, editar, eliminar) alineadas. Sin "budget" en ningún texto.
- **Viewports / temas**: desktop+mobile · oscuro+claro
- **Estado**: ⚠️ pasa con observaciones · `QA-12-desktop-dark-enviado.png` (mobile: sin vista de tarjetas en el listado; el badge-menú no tiene chevron)

## Consola y red

### QA-13 · Sin errores en consola ni requests fallidas
- **Pantalla**: todas las anteriores
- **Resultado esperado**: sin errores de consola nuevos ni requests 4xx/5xx inesperadas durante QA-01 a QA-12.
- **Estado**: ✅ pasa · sin errores de consola ni requests 4xx/5xx

## Hallazgos

| ID | Escenario | Síntoma | Causa raíz | Fix | Estado |
|----|-----------|---------|------------|-----|--------|
| H-01 | QA-09 | Al quitar el cliente de un presupuesto el buscador seguía mostrando el anterior (incluso tras guardar) | `CustomerSearchInput` re-aplica `initialCustomer` en cada cambio de `value`; `BudgetForm` nunca lo limpiaba | `BudgetGeneralSection.jsx`: pasa `initialCustomer` solo si coincide con el cliente elegido; `BudgetForm.jsx`: `setInitialCustomer(budget.customer \|\| null)` | ✅ corregido |
| H-02 | QA-04/05/10 | Montos con un decimal ("$27.654,8") | `formatCurrency` usaba `minimumFractionDigits: 0, maximumFractionDigits: 2` | `utils/money.js`: 0 decimales si es entero, si no siempre 2 | ✅ corregido |
| H-03 | QA-05 | Opción activa del buscador casi invisible en oscuro | `bg-surface-container-high` sobre `bg-surface-container` (diferencia mínima) | `ItemSearchInput.jsx`: `bg-primary-container/15` + borde izquierdo `border-primary` | ✅ corregido |
| H-04 | QA-06 | "Crear presupuesto" se partía en dos líneas en 375 px | Botón sin `whitespace-nowrap` y con ícono | `BudgetTotalsBar.jsx`: `whitespace-nowrap`, ícono oculto en mobile | ✅ corregido |

### Observaciones sin corregir (a decidir)

- Listado de presupuestos en mobile sin vista de tarjetas: montos y acciones requieren scroll horizontal dentro de la tabla (QA-12).
- El badge de estado del listado no tiene chevron que indique que es un menú (QA-12).
- La barra fija ocupa ~160 px en mobile y puede tapar la línea siguiente tras Enter hasta hacer scroll (QA-06).
- En mobile el texto del buscador de clientes pasa por debajo de la ✕ y "Duplicar" queda pegado al borde (QA-09) — `CustomerSearchInput` es previo a este change.
- Toasts en Title Case automático ("Estado Actualizado") — comportamiento de la librería de toasts, afecta toda la app.
- El modal "Cambiar IVA" siempre arranca en 10,5% (QA-03).
- Contraste de botones primarios en oscuro ~3,4:1 (patrón del design system, no de este change).
- No se vio el toast al crear un presupuesto en la captura inmediata (sí aparece al guardar/duplicar).
