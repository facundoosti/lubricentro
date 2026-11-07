## Context

- `Customer` valida `email` como único con `allow_blank`, pero no normaliza `""` a `nil`. La tabla tiene un índice único sobre `email`: **dos clientes con email vacío provocan un error de índice** (500) en vez de un 422.
- `Customer.by_search` busca solo por nombre y email; el teléfono, que es el dato principal en el mostrador, no se busca.
- `CustomerForm` exige dirección (el backend no) y tiene `console.log`.
- `VehicleForm`:
  - Años de 1990 en adelante.
  - La búsqueda por patente (`GET /vehicles/lookup`) solo se dispara con un botón y los errores se ignoran (`catch {}`).
  - La patente duplicada se detecta recién al guardar (validación de unicidad).
- `CustomerProfile.jsx`:
  - Arma su propio estado local duplicando los datos de React Query.
  - Usa `alert()` para errores.
  - Pasa `onSubmit`/`isLoading` a `VehicleModal`, que hace sus propias mutaciones e ignora esas props.
  - Muestra dos tarjetas (`CustomerMetaCard` y `CustomerInfoCard`) con datos repetidos.
- Ya existen filtros por `customer_id` en `service_records` y `appointments`; `budgets` no lo tiene.
- `service_records` tiene `service_date` y `mileage`.

## Goals / Non-Goals

**Goals:**
- Dar de alta cliente y vehículo en menos pasos y con menos errores.
- Detectar duplicados (teléfono, patente) antes de guardar.
- Que el perfil sirva para atender: contacto, historial y accesos rápidos.
- Corregir los errores encontrados en la revisión.

**Non-Goals:**
- Fusionar duplicados, validar teléfonos de forma estricta, enviar WhatsApp desde el sistema.

## Decisions

### 1. Normalización de email y teléfono en `Customer`
- `normalizes :email, with: ->(e) { e.strip.downcase.presence }` → `""` pasa a `nil`.
- `normalizes :phone, with: ->(p) { p.strip.presence }` (se guarda como lo escribe el usuario, sin espacios a los lados).
- Backfill: rake task `customers:normalize_blank_emails` (`update_all(email: nil)` donde `email = ''`). Es idempotente. **No es migración** porque no cambia el esquema.
- **Alternativa descartada:** índice parcial `WHERE email IS NOT NULL AND email <> ''`. Requiere migración y deja datos inconsistentes.

### 2. Búsqueda y detección de duplicados por teléfono
- `Customer.by_search` agrega el teléfono comparando solo dígitos: `regexp_replace(phone, '\D', '', 'g') ILIKE '%<dígitos>%'` cuando el término tiene dígitos.
- Nuevo scope `by_phone(phone)`: igualdad de dígitos (últimos 10 dígitos, para tolerar `+54 9`).
- `GET /api/v1/customers?phone=1155551234` → mismo formato de respuesta paginada; el frontend lo usa con debounce al salir del campo teléfono.
- El aviso **no bloquea** el alta (puede haber familiares con el mismo número): "Ya existe *Juan Pérez* con este teléfono · Ver perfil".

### 3. Patente existente
- `GET /api/v1/vehicles?license_plate=AB123CD` → filtro exacto sobre la patente normalizada (mismo `normalize_license_plate` del modelo), con la vista `with_customer`.
- `VehicleForm` lo consulta cuando la patente tiene formato válido (debounce 400 ms) y, si existe otro vehículo con esa patente, muestra "Patente registrada a *Nombre* · Ver perfil" y deshabilita Guardar.
- Al editar, se excluye el propio vehículo.

### 4. Búsqueda automática por patente
- Al tener formato válido y sin cambios por 600 ms, se dispara `lookup` una sola vez por patente (se recuerda la última consultada).
- Solo completa marca, modelo y año si esos campos están **vacíos** o fueron autocompletados antes (no pisa lo que escribió el usuario).
- Estados visibles debajo del campo:
  - 404 → "No encontramos datos para esta patente. Completalos a mano."
  - 503 / error → "El servicio de búsqueda no responde. Completalos a mano."
- El botón ✨ se mantiene para reintentar.

### 5. Alta de cliente en línea
- `CustomerSearchInput` acepta una prop `onCreateNew`. Cuando no hay resultados (o siempre al final de la lista) muestra "+ Crear cliente "<texto>"".
- `VehicleForm` abre un `CustomerModal` apilado con el nombre prellenado; al crear, selecciona ese cliente.
- `SlideOver` debe soportar apilarse (z-index mayor y foco atrapado en el de arriba). Si no lo soporta, se usa `Modal` de `@ui`.

### 6. Acciones al crear cliente
- Al crear, en vez de cerrar el panel en silencio, el toast de éxito ofrece **"Ver perfil"** y **"+ Agregar vehículo"**.
- "+ Agregar vehículo" navega a `/customers/:id?addVehicle=1` y el perfil abre el modal de vehículo al cargar (y limpia el parámetro).
- Si `sileo` no soporta acciones en el toast, se muestra un mini diálogo de éxito con los dos botones.

### 7. Perfil unificado
- `CustomerMetaCard` pasa a `CustomerHeaderCard`: avatar, nombre, contacto (teléfono, email, dirección), botones Llamar / WhatsApp / Email y un único "Editar". Se elimina `CustomerInfoCard`.
- Se elimina el estado local duplicado: se usan directamente los datos de `useCustomer` y `useVehicles`; las mutaciones invalidan esas queries.
- Errores con `notificationService` (toasts), no `alert()`.
- `VehicleModal` se usa sin `onSubmit`/`isLoading` (se quitan las props muertas).

### 8. WhatsApp
- Se reutiliza `utils/whatsapp.js` del change `iva-presupuestos` (normalización a `549…`). Si este change se implementa antes, se crea acá.
- Sin teléfono → no se muestra el botón.

### 9. Historial del cliente
- Nuevo `CustomerHistoryCard` con tres pestañas: **Atenciones**, **Presupuestos**, **Turnos**.
  - Atenciones: `GET /service_records?customer_id=:id&per_page=5` (ya existe).
  - Presupuestos: `GET /budgets?customer_id=:id&per_page=5` (**filtro nuevo** en `BudgetsController#index`).
  - Turnos: `GET /appointments?customer_id=:id` con los próximos primero (ya existe).
- Cada fila navega al detalle; "Ver todos" navega al listado filtrado.
- Cada pestaña maneja carga, error y vacío por separado.

### 10. Último service por vehículo
- `VehicleSerializer` agrega en una vista `with_last_service`: `last_service_date` y `last_mileage`.
- `VehiclesController#index` la usa cuando viene `customer_id`, con una subconsulta (`DISTINCT ON (vehicle_id)` sobre `service_records` ordenado por `service_date DESC`) precargada en un hash para evitar N+1.
- **Alternativa descartada:** pedir las atenciones de cada vehículo desde el frontend (N requests).

### 11. Accesos rápidos
- "Nuevo presupuesto" → `/budgets/new?customer_id=:id`.
- "Presupuestar" (vehículo) → `/budgets/new?customer_id=:id&vehicle_id=:vid`.
- "Nueva atención" (vehículo) → `/service-records/new?customer_id=:id&vehicle_id=:vid`.
- `BudgetForm` y `ServiceRecordFormPage` leen esos parámetros al crear (no al editar) y preseleccionan cliente y vehículo.

### 12. Formulario de cliente
- Obligatorios: nombre y teléfono. Dirección y email opcionales.
- Campos con el patrón de input del design system (`bg-surface-variant border-outline-variant`) y la misma altura que `VehicleForm`.
- Foto dentro de una sección plegable "Foto (opcional)".

### 13. Años de vehículo
- Select de año del actual a 1950. Backend: agregar validación numérica `1950..año_actual + 1` (hoy solo valida longitud 4).

## Risks / Trade-offs

- [El backfill de emails corre en producción] → rake task idempotente que solo toca `email = ''`; se ejecuta una vez después del deploy.
- [Búsqueda por dígitos del teléfono sin índice] → la tabla de clientes es chica; si crece, agregar índice funcional sobre los dígitos.
- [Varias consultas automáticas mientras se escribe la patente] → debounce y una consulta por patente distinta.
- [Pisar datos escritos a mano con el autocompletado] → solo se completan campos vacíos o previamente autocompletados.
- [Modales apilados con foco y scroll] → probar en QA visual; alternativa: `Modal` de `@ui`.
- [Dependencia del change `iva-presupuestos`] → implementar este change después; si no, "Presupuestar" solo preselecciona el cliente.

## Migration Plan

1. Deploy del backend (cambios aditivos: filtros nuevos y campos nuevos en el serializer).
2. Ejecutar `bin/rails customers:normalize_blank_emails` una vez.
3. Deploy del frontend.
4. **Rollback:** revertir frontend y backend. El backfill no se revierte (un `NULL` en vez de `''` es equivalente para la app).

## Open Questions

- ¿El toast de `sileo` soporta botones de acción? Se confirma al implementar; hay alternativa definida (decisión 6).
