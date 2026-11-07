# QA visual — mejoras-clientes-vehiculos

## Riesgo: alto — cambia flujos de alta/edición (clientes, vehículos) y el `SlideOver` compartido por todos los formularios

Script: `QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs openspec/changes/mejoras-clientes-vehiculos/qa.mjs`
Los casos de script crean sus propios datos (clientes `QA …`, patentes al azar) en la base de dev. El lookup de patentes se simula con `page.route` para no depender de clasific.ar.

### Cubiertos por Vitest / RSpec (regresión permanente)

- [x] **TC-01** · must · vitest · Alta con solo nombre y teléfono; sin teléfono → "El teléfono es requerido" — *spec: alta-cliente › Campos obligatorios › ambos* — `CustomerForm.test.jsx`
- [x] **TC-02** · must · vitest · Aviso de teléfono duplicado al salir del campo, no bloquea, no avisa al editar el mismo — *spec: alta-cliente › Aviso de teléfono duplicado › Teléfono ya registrado* — `CustomerForm.test.jsx`
- [x] **TC-03** · must · vitest · Foto plegada y sin `console.log` — *spec: alta-cliente › Formulario consistente › Foto plegada* — `CustomerForm.test.jsx`
- [x] **TC-04** · must · vitest · "Ver perfil" / "+ Agregar vehículo" navegan — *spec: alta-cliente › Acciones después de crear* — `CustomerCreatedDialog.test.jsx`
- [x] **TC-05** · must · rspec · Email vacío → NULL, backfill, búsqueda y filtro por teléfono — *spec: alta-cliente › Email vacío / Búsqueda / Filtro exacto* — `customer_spec`, `customers_rake_spec`, `customers_spec`
- [x] **TC-06** · must · vitest · Autocompletado, no pisa lo escrito, una consulta por patente — *spec: alta-vehiculo › Búsqueda automática* — `VehicleForm.test.jsx`, `useVehiclePlate.test.js`
- [x] **TC-07** · must · vitest · 404 y 503 con reintento — *spec: alta-vehiculo › Feedback* — `VehicleForm.test.jsx`
- [x] **TC-08** · must · vitest+rspec · Patente registrada: aviso, Guardar deshabilitado, editar el mismo sin aviso; filtro API normalizado — *spec: alta-vehiculo › Patente ya registrada* — `VehicleForm.test.jsx`, `vehicles_spec`
- [x] **TC-09** · must · vitest+rspec · Años 1950..actual; API 422 con 1900 — *spec: alta-vehiculo › Años desde 1950* — `VehicleForm.test.jsx`, `vehicle_spec`, `vehicles_spec`
- [x] **TC-10** · must · vitest · Cliente en línea queda elegido y conserva los datos — *spec: alta-vehiculo › Crear cliente desde el formulario* — `VehicleForm.test.jsx`
- [x] **TC-11** · must · vitest · Encabezado único, WhatsApp `wa.me/549…`, sin teléfono sin Llamar/WhatsApp — *spec: perfil-cliente › Encabezado / Contacto rápido* — `CustomerHeaderCard.test.jsx`
- [x] **TC-12** · must · vitest · Error al editar → toast, sin `alert()` — *spec: perfil-cliente › Errores con avisos* — `CustomerProfile.test.jsx`
- [x] **TC-13** · must · vitest+rspec · Historial: pestañas, carga/error/vacío, filtro de presupuestos por cliente — *spec: perfil-cliente › Historial* — `CustomerHistoryCard.test.jsx`, `budgets_spec`
- [x] **TC-14** · must · vitest+rspec · Último service y km, "Sin services", sin N+1 — *spec: perfil-cliente › Último service* — `CustomerVehiclesCard.test.jsx`, `vehicles_spec`
- [x] **TC-15** · must · vitest · Accesos rápidos y `?addVehicle=1` — *spec: perfil-cliente › Accesos rápidos* — `BudgetForm.test.jsx`, `ServiceRecordFormPage.test.jsx`, `CustomerProfile.test.jsx`

### Script (navegador real)

- [x] **TC-20** · must · script · todas · Alta real de cliente → diálogo "Cliente creado" → "+ Agregar vehículo" abre el perfil con el alta de vehículo y el cliente elegido, sin `?addVehicle` — *spec: alta-cliente › Agregar vehículo desde el aviso*
  - ✅ `5021720+wip` · 4/4 combos · perfil abierto con alta de vehículo y cliente elegido, sin `?addVehicle`
- [x] **TC-21** · must · script · desktop-dark, mobile-light · Teléfono con otro formato avisa con link al perfil, Crear sigue habilitado, foto plegada — *spec: alta-cliente › Teléfono ya registrado*
  - ✅ `5021720+wip` · 2/2 · aviso "Ya existe … · Ver perfil", Crear habilitado, foto plegada
- [x] **TC-22** · must · script · desktop-dark, mobile-light · Autocompletado visible y patente de otro cliente (en minúsculas) → alerta con nombre + Guardar deshabilitado — *spec: alta-vehiculo › Patente encontrada / Aviso en el formulario*
  - ✅ `5021720+wip` · 2/2 · Toyota/Corolla/2018 autocompletado; alerta con dueña; Guardar deshabilitado
- [x] **TC-23** · must · script · desktop-dark, mobile-light · Mensajes de 404 y 503 del lookup — *spec: alta-vehiculo › Feedback*
  - ✅ `5021720+wip` · 2/2 · mensajes 404 y 503 visibles
- [x] **TC-24** · must · script · todas · Cliente en línea: panel apilado arriba, foco adentro, Escape cierra solo el de arriba, cliente elegido, año 1986 conservado, vehículo creado (201) — *spec: alta-vehiculo › Cliente nuevo en el mostrador + Auto de 1986*
  - ✅ `5021720+wip` · 4/4 · panel arriba, foco adentro, Escape cierra solo el de arriba, 1986 conservado, POST 201
- [x] **TC-25** · must · script · todas · Perfil: un solo Editar, WhatsApp, último service, links Presupuestar/Nueva atención, pestañas, sin scroll horizontal a 375 px — *spec: perfil-cliente*
  - ✅ `5021720+wip` · 4/4 (tras fix del script) · 1 Editar, wa.me/5491155551234, último service, pestañas, sin overflow
- [x] **TC-26** · must · script · desktop-dark · `/budgets/new?customer_id&vehicle_id` preselecciona ambos — *spec: perfil-cliente › Presupuestar un vehículo*
  - ✅ `5021720+wip` · 1/1 (tras fix H-01) · cliente y vehículo preseleccionados
- [x] **TC-27** · must · script · desktop-dark · `/service-records/new?customer_id&vehicle_id` preselecciona ambos — *spec: perfil-cliente › Nueva atención*
  - ✅ `5021720+wip` · 1/1 (tras fix del script) · vehículo preseleccionado
- [x] **TC-28** · must · script · desktop-dark, mobile-light · Regresión: SlideOver de productos abre, bloquea scroll, Escape cierra y lo restaura — *regresión: ProductModal (consumidor de SlideOver)*
  - ✅ `5021720+wip` · 2/2 · abre, bloquea scroll, Escape cierra y restaura

### Exploratorios (DevTools MCP)

- [x] **TC-30** · should · mcp · mobile-light, mobile-dark (375 px) · Revisión visual del perfil `/customers/867` (cliente QA con vehículo, atención y presupuesto): espaciados, contraste de textos secundarios, botones de contacto y acciones del vehículo sin solaparse, pestañas del historial legibles — *origen: diff*
  - ❌ → ✅ · H-03: la fila de acciones del vehículo desbordaba la tarjeta y las pestañas necesitaban scroll; tras el fix, TC-25 mide `editDentro: true`, `tabsSinScroll: true` en las 4 combinaciones (`TC-25-mobile-*.jpg`)
- [x] **TC-31** · should · mcp · desktop-dark, desktop-light · Panel "Nuevo Cliente" apilado sobre "Nuevo Vehículo" (desde `/vehicles` → Nuevo Vehículo → buscar un nombre → "+ Crear cliente"): el de arriba se distingue del de abajo (overlay, sombra, borde), el foco visible está dentro, nada del panel inferior asoma por encima — *origen: diff*
  - ✅ · dark y light: foco dentro del panel superior, `elementFromPoint` cae en el de arriba (`TC-31-desktop-*.jpeg`)
- [x] **TC-32** · should · mcp · desktop-light, mobile-dark · Formulario de cliente y de vehículo con el nuevo estilo de inputs: misma altura, fondo `surface-variant`, avisos (teléfono duplicado, patente registrada, 404) legibles en ambos temas — *origen: diff*
  - ✅ (con observación H-04 corregida) · inputs de 44 px con `surface-variant`, avisos legibles (`TC-32-*.jpeg`). El 404 de patente se cubrió en TC-23

## Hallazgos

Corrida: 16/22 en la primera pasada → 22/22 tras los fixes. Capturas en `tmp/qa/mejoras-clientes-vehiculos/`.

- **H-01** · TC-26 ❌ → ✅ · `/budgets/new?customer_id=…` mostraba "Cliente no encontrado".
  - Causa raíz: `CustomerSearchInput` buscaba el cliente en `data.customer`, pero `GET /customers/:id` lo devuelve directo en `data` (bug previo, expuesto por la preselección por URL).
  - Fix: `frontend/src/components/features/customers/CustomerSearchInput.jsx:74` acepta ambas formas + test de regresión en `CustomerSearchInput.test.jsx`.
- **H-02** · TC-25 / TC-27 ❌ → ✅ · errores del script, no de la app: contaba filas del historial antes de que cargaran (los requests daban 200) y usaba `getByDisplayValue`, que no existe en Playwright. Fix en `qa.mjs`.
- **Nota** · la captura de TC-25 a veces muestra resaltada la pestaña anterior: es el `transition-colors` a mitad de camino. Se verificó con `aria-selected` y la clase activa: queda marcada la correcta.
- **H-03** · TC-30 ❌ → ✅ · A 375 px "Presupuestar", "Nueva atención" y editar desbordaban la tarjeta del vehículo, y "Turnos" quedaba fuera de vista con scroll.
  - Causa raíz: fila `flex` sin wrap ni reparto de ancho, y tablist con `overflow-x-auto`.
  - Fix: `CustomerVehiclesCard.jsx` (fila `w-full`, links `flex-auto min-w-0`, en mobile sin íconos y con "Atención" como texto corto, padding `p-3`) y `CustomerHistoryCard.jsx` (pestañas `flex-auto`, `text-xs` e íconos ocultos en mobile).
- **H-04** · observaciones de TC-30/TC-32 ✅ · El buscador de cliente medía 42 px y no tenía fondo (ahora `h-11 bg-surface-variant`, `CustomerSearchInput.jsx`). Los textos secundarios del perfil tenían ~3.6:1 de contraste en dark (pasaron a `text-on-surface-variant`).
- **Fuera de alcance** · la burbuja flotante del chat tapa parcialmente el botón del pie de los paneles en mobile (no es de este change).

