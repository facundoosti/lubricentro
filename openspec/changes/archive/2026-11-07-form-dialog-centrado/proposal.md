## Why

Los formularios de alta/edición (cliente, vehículo, producto, servicio, proveedor, turno) se abren en un panel lateral angosto (`SlideOver`, ~448px). Los formularios ya están maquetados en 2 columnas, pero en ese ancho quedan apretados y obligan a scrollear para ver todos los campos y el botón Guardar. La app se usa en notebooks, donde sobra ancho.

## What Changes

- El panel lateral `SlideOver` se reemplaza por un **modal centrado** (`FormDialog`) de ~768px de ancho (`max-w-3xl`), alto máximo 90vh, header y footer fijos y cuerpo que scrollea solo si el contenido no entra.
- Botones del footer compactos y alineados a la derecha (Cancelar · Guardar).
- Campos de texto largo (notas, descripción, observaciones) ocupan las 2 columnas.
- **Click en el fondo ya no cierra el formulario** (antes se perdía lo cargado). Se cierra solo con ✕, Cancelar o Escape.
- Apilado: el alta de cliente desde el formulario de vehículo abre un segundo modal encima, más chico y con fondo más oscuro. Escape cierra solo el de arriba.
- Se mantienen: foco inicial y retorno de foco, bloqueo de scroll del body, portal a `body`, `role="dialog"` + `aria-modal`.
- Se migran los 6 modales de formulario: `CustomerModal`, `VehicleModal`, `ProductModal`, `ServiceModal`, `SupplierModal`, `AppointmentModal`.
- Se elimina `ServiceRecordModal.jsx` (código muerto: no se usa desde que existe `ServiceRecordFormPage`).

## Capabilities

### New Capabilities
- `formularios-dialogo`: cómo se presentan y se cierran los formularios de alta/edición (modal centrado, 2 columnas, cierre, apilado, accesibilidad).

### Modified Capabilities
<!-- Ninguna: alta-cliente y alta-vehiculo no especifican el contenedor visual. -->

## Impact

- **Apps**: solo **frontend**. Sin cambios en backend, API ni **sin migraciones**.
- Código: `frontend/src/components/ui/SlideOver.jsx` (reemplazado por `FormDialog.jsx`), sus tests, los 6 `*Modal.jsx` de `components/features/*` y ajustes menores de `col-span` en los `*Form.jsx` con textarea.
- Tests: `SlideOver.test.jsx` pasa a cubrir `FormDialog`; tests de páginas que abren formularios pueden depender del markup.

## Fuera de alcance

- Edición inline en tablas.
- Páginas de formulario completas (`ServiceRecordFormPage`, `BudgetForm`).
- Unificar con el `Modal.jsx` genérico (usado por `ConfirmModal`, `BulkIvaModal`, etc.).
- Confirmación de "cambios sin guardar" al cancelar.
- QA en mobile/tablet (la app se usa en notebook, desktop 1440×900).
