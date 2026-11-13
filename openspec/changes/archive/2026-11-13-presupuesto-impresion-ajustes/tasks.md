Solo **frontend**. Sin backend ni migraciones.

## 1. Hoja de presupuesto

- [x] 1.1 Año con dos dígitos en la fecha de la hoja impresa (spec "Año con dos dígitos"), con test de Vitest para fecha presente y ausente.
- [x] 1.2 NOMBRE vacío cuando no hay cliente (spec "Nombre vacío sin cliente"), con test de Vitest para ambos escenarios.
- [x] 1.3 Encabezado "ARTÍCULO" en la tabla de ítems (spec "Columna Artículo"), ajustando los tests existentes que busquen "DESCRIPCIÓN".

## 2. Cierre

- [x] 2.1 Correr `npx vitest run` de los tests afectados y `npm run lint` en `frontend/`.

