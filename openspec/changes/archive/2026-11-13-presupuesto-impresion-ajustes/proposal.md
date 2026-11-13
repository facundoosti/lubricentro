## Why

La hoja de presupuesto impresa no coincide con el talonario del lubricentro en tres detalles chicos anotados en `docs/PENDIENTES.md` (sección "Hoja de presupuesto", visual). Se resuelven juntos porque tocan la misma pantalla y no requieren backend.

## What Changes

- El año de la fecha se muestra con dos dígitos (ej. `26` en vez de `2026`).
- Si el presupuesto no tiene cliente, el campo NOMBRE queda vacío (hoy cae a la descripción del vehículo).
- El encabezado de la columna "DESCRIPCIÓN" de la tabla de ítems pasa a "ARTÍCULO".

## Capabilities

### New Capabilities
- `presupuesto-impresion`: contenido de la hoja de presupuesto imprimible.

### Modified Capabilities
<!-- ninguna -->

## Impact

- Solo frontend: la pantalla de impresión de presupuestos y sus componentes de ítems.
- Sin backend, sin migraciones, sin cambios de API.
