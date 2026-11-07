## 1. Backend — Clientes

- [ ] 1.1 `normalizes` de email (vacío → `nil`, minúsculas) y teléfono (strip) en `Customer` + model spec (dos clientes sin email no chocan)
- [ ] 1.2 Rake task idempotente `customers:normalize_blank_emails` + spec de la task
- [ ] 1.3 `Customer.by_search` incluye teléfono por dígitos y nuevo scope `by_phone` (últimos 10 dígitos) + model spec
- [ ] 1.4 Filtro `phone` en `CustomersController#index` + request spec

## 2. Backend — Vehículos y presupuestos

- [ ] 2.1 Validación de año `1950..año_actual + 1` en `Vehicle` + model spec
- [ ] 2.2 Filtro `license_plate` (exacto, normalizado, vista `with_customer`) en `VehiclesController#index` + request spec
- [ ] 2.3 Vista `with_last_service` (`last_service_date`, `last_mileage`) precargada con `DISTINCT ON` al listar por `customer_id` + request spec (incluye chequeo de N+1)
- [ ] 2.4 Filtro `customer_id` en `BudgetsController#index` + request spec

## 3. Frontend — Alta de cliente

- [ ] 3.1 `CustomerForm`: solo nombre y teléfono obligatorios, estilo de inputs del design system, foto plegable, sin `console.log` + test
- [ ] 3.2 Aviso de teléfono duplicado (consulta `?phone=` al salir del campo, link al perfil, no bloquea) + test
- [ ] 3.3 Acciones "Ver perfil" y "+ Agregar vehículo" al crear (toast con acciones o mini diálogo según soporte de `sileo`) + test
- [ ] 3.4 `CustomerSearchInput`: prop `onCreateNew` con opción "+ Crear cliente \"<texto>\"" + test

## 4. Frontend — Alta de vehículo

- [ ] 4.1 Select de años hasta 1950 + test
- [ ] 4.2 Búsqueda automática por patente (debounce, una consulta por patente, no pisa campos editados) + test
- [ ] 4.3 Mensajes de "sin datos" (404) y "servicio caído" (503/red) con reintento + test
- [ ] 4.4 Aviso de patente registrada a otro cliente (consulta `?license_plate=`, link al perfil, Guardar deshabilitado, excluye el propio vehículo al editar) + test
- [ ] 4.5 Alta de cliente en línea desde `VehicleForm` (modal apilado, cliente nuevo queda elegido, conserva los datos cargados) + test

## 5. Frontend — Perfil del cliente

- [ ] 5.1 Limpiar `CustomerProfile`: sin estado local duplicado, toasts en vez de `alert()`, sin props muertas en `VehicleModal` + test
- [ ] 5.2 `CustomerHeaderCard` (une `CustomerMetaCard` y `CustomerInfoCard`, un solo "Editar", Llamar / WhatsApp / Email) y borrar `CustomerInfoCard` + test
- [ ] 5.3 `utils/whatsapp.js` (reutilizar el de `iva-presupuestos` o crearlo) + test
- [ ] 5.4 `CustomerHistoryCard` con pestañas Atenciones / Presupuestos / Turnos, estados de carga/error/vacío y "Ver todos" + test
- [ ] 5.5 `CustomerVehiclesCard`: último service y km, acciones "Presupuestar" y "Nueva atención" + test
- [ ] 5.6 Botón "Nuevo presupuesto" en el perfil y apertura del alta de vehículo con `?addVehicle=1` + test
- [ ] 5.7 `BudgetForm` y `ServiceRecordFormPage` leen `customer_id` y `vehicle_id` de la URL al crear + test

## 6. QA visual

- [ ] 6.1 Escribir escenarios en `openspec/changes/mejoras-clientes-vehiculos/qa.md`: alta de cliente (mínimo, duplicado, acciones al crear), alta de vehículo (autocompletado, 404, patente registrada, cliente en línea, año 1986), perfil (encabezado, WhatsApp, historial, vehículos, accesos rápidos), desktop y 375 px, tema claro y oscuro
- [ ] 6.2 Ejecutar los escenarios con `/qa-visual` (Brave + DevTools)
- [ ] 6.3 Corregir los hallazgos y volver a ejecutar los escenarios fallidos

## 7. Cierre

- [ ] 7.1 Ejecutar en producción `bin/rails customers:normalize_blank_emails` después del deploy (anotar en el PR)
- [ ] 7.2 Correr lint y tests completos: `bundle exec rspec`, `bundle exec rubocop` (backend) y `npm test -- --run`, `npm run lint` (frontend)
