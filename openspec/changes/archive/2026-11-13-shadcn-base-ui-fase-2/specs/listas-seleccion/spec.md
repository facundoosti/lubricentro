## MODIFIED Requirements

### Requirement: Select sin búsqueda
La app SHALL tener un componente `Select` en `@ui` para listas cortas sin búsqueda, usable con teclado (flechas, Enter, Escape) y etiquetable con `aria-labelledby`. **Todas** las listas cortas sin búsqueda de la app SHALL usarlo (formularios de turno, producto, vehículo, atención y presupuesto, IVA, estado de presupuesto, filtros de productos y recordatorios, cambio masivo de precios); no SHALL quedar `<select>` nativos en `features/`, `pages/` ni `layout/`. Su lista desplegada SHALL respetar el tema claro/oscuro.

#### Scenario: Elegir hora con teclado
- **GIVEN** el formulario de turno con el Select de hora enfocado
- **WHEN** el usuario presiona Enter, baja con la flecha y presiona Enter
- **THEN** queda elegida la segunda hora de la lista

#### Scenario: Etiqueta accesible
- **GIVEN** el Select de estado con `aria-labelledby="appointment-status-label"`
- **WHEN** se consulta su nombre accesible
- **THEN** es el texto de la etiqueta "Estado"

#### Scenario: Valor inicial en un formulario de edición
- **GIVEN** un vehículo existente con un valor elegido en su Select
- **WHEN** se abre su formulario de edición
- **THEN** el Select muestra la opción guardada y al enviar sin cambios el payload lleva el mismo valor

#### Scenario: Filtro "Todos"
- **GIVEN** Recordatorios filtrado por estado "Enviado"
- **WHEN** el usuario elige "Todos los estados" y aplica el filtro
- **THEN** el pedido de recordatorios no lleva el parámetro `status`
