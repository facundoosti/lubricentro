## Why

Crear un cliente y su vehículo es lo primero que se hace cuando alguien llega al mostrador, y hoy tiene fricciones: campos obligatorios que el negocio no necesita, la búsqueda por patente hay que dispararla a mano y falla en silencio, no se detectan duplicados hasta que el backend rechaza el alta, y no se puede crear el cliente desde el formulario del vehículo. El perfil del cliente repite datos en dos tarjetas y no muestra lo más útil para atenderlo: su historial y accesos rápidos. Además hay errores chicos (alertas del navegador, años antes de 1990 bloqueados, un posible error 500 con emails vacíos) que conviene corregir en el mismo cambio.

## What Changes

**Correcciones**
- El perfil usa toasts en vez de `alert()` y deja de pasar props que `VehicleModal` ignora.
- Años de vehículo desde 1950.
- La dirección del cliente deja de ser obligatoria en el formulario (el backend ya no la exige).
- Se quitan los `console.log` de `CustomerForm`.
- El email vacío se guarda como `NULL` para no chocar con el índice único de `customers.email`.

**Crear Cliente**
- Obligatorios: solo nombre y teléfono.
- Aviso de posible duplicado si ya existe un cliente con el mismo teléfono (no bloquea).
- Al crear: acciones "Ver perfil" y "+ Agregar vehículo".
- Foto en una sección secundaria plegable.
- Estilo de campos unificado con el resto de los formularios.

**Crear Vehículo**
- Búsqueda automática por patente al completar un formato válido (con debounce), además del botón.
- Mensajes claros cuando la patente no se encuentra o el servicio falla.
- Aviso inmediato si la patente ya está registrada, con el nombre del dueño y un link a su perfil.
- "+ Nuevo cliente" dentro del buscador de clientes, que crea el cliente sin salir del formulario.
- La búsqueda de clientes también busca por teléfono.

**Perfil del Cliente**
- Una sola tarjeta de encabezado con datos de contacto y un único botón "Editar".
- Botón de WhatsApp junto a llamar y email.
- Historial: últimas atenciones, presupuestos y próximo turno.
- En cada vehículo: fecha y kilometraje del último service y acciones "Nueva atención" y "Presupuestar".
- Botón "Nuevo presupuesto" con el cliente ya elegido.

## Capabilities

### New Capabilities
- `alta-cliente`: formulario de cliente (campos, validación, aviso de duplicado, acciones al crear, email vacío como nulo, búsqueda por teléfono).
- `alta-vehiculo`: formulario de vehículo (búsqueda por patente automática y con feedback, patente existente, años, alta de cliente en línea).
- `perfil-cliente`: perfil unificado, WhatsApp, historial, datos y acciones por vehículo, accesos rápidos a presupuesto y atención.

### Modified Capabilities
<!-- No hay specs existentes de clientes, vehículos ni perfil en openspec/specs/. -->

## Impact

- **Apps:** backend y frontend.
- **Migraciones:** **no** hay cambios de columnas. Se agrega un backfill de datos (rake task) que pasa `customers.email = ''` a `NULL`.
- **Backend:**
  - `Customer`: normalización de email y teléfono, `by_search` incluye teléfono, scope `by_phone`.
  - `CustomersController#index`: filtro `phone` (coincidencia exacta normalizada).
  - `VehiclesController#index`: filtro `license_plate` (coincidencia exacta normalizada) con datos del dueño; serializer con último service al listar por cliente.
  - `BudgetsController#index`: filtro `customer_id`.
- **Frontend:** `CustomerForm`, `CustomerModal`, `Customers.jsx`, `CustomerSearchInput`, `VehicleForm`, `VehicleModal`, `CustomerProfile.jsx`, `CustomerMetaCard`, `CustomerInfoCard` (se elimina), `CustomerVehiclesCard`, nuevo `CustomerHistoryCard`; `BudgetForm` y `ServiceRecordFormPage` leen `customer_id` / `vehicle_id` de la URL.
- **Dependencia:** "Presupuestar" con el vehículo elegido requiere que el change `iva-presupuestos` ya haya agregado `vehicle_id` al formulario de presupuesto. **Este change se implementa después de `iva-presupuestos`.**

## Fuera de alcance

- Fusionar clientes duplicados.
- Validación estricta del formato de teléfono argentino.
- Enviar mensajes de WhatsApp desde el sistema (solo se abre `wa.me`).
- Cambios en el listado de clientes o de vehículos más allá del buscador.
- Editar el historial desde el perfil (solo se muestra y se navega).
