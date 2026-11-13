# controles-ui Specification

## Purpose
TBD - created by archiving change shadcn-base-ui-fase-2. Update Purpose after archive.
## Requirements
### Requirement: Switch común
La app SHALL tener un `Switch` en `@ui` sobre Base UI, con rol `switch`, estado `aria-checked`, nombre accesible y activable con click, Espacio y Enter. El modo oscuro del encabezado y el día abierto/cerrado de Configuración SHALL usarlo, manteniendo su aspecto actual.

#### Scenario: Cambiar el tema
- **GIVEN** la app en modo claro
- **WHEN** el usuario activa el switch "Modo oscuro"
- **THEN** la app pasa a modo oscuro y el switch queda con `aria-checked="true"`

#### Scenario: Cerrar un día con teclado
- **GIVEN** Configuración con el lunes abierto y su switch enfocado
- **WHEN** el usuario presiona Espacio
- **THEN** el lunes queda cerrado y desaparecen sus campos de horario

### Requirement: Checkbox con estado indeterminado
La app SHALL tener un `Checkbox` en `@ui` sobre Base UI con estados marcado, desmarcado e indeterminado. La selección de productos SHALL usarlo: la cabecera marca o desmarca todos los de la página y se ve indeterminada cuando hay algunos (no todos) elegidos.

#### Scenario: Seleccionar una fila
- **GIVEN** el listado de productos sin selección
- **WHEN** el usuario marca el checkbox de un producto
- **THEN** ese producto queda seleccionado y el checkbox de la cabecera queda indeterminado (`aria-checked="mixed"`)

#### Scenario: Seleccionar toda la página
- **GIVEN** el listado de productos con un producto seleccionado
- **WHEN** el usuario marca el checkbox de la cabecera
- **THEN** quedan seleccionados todos los productos de la página

#### Scenario: Cabecera deshabilitada sin productos
- **GIVEN** el listado de productos vacío
- **WHEN** se renderiza la cabecera
- **THEN** su checkbox está deshabilitado

### Requirement: Tabs accesibles
La app SHALL tener un `Tabs` en `@ui` sobre Base UI, con `tablist`/`tab`/`tabpanel` vinculados y navegación con flechas. El historial del perfil de cliente SHALL usarlo y montar solo el panel activo.

#### Scenario: Cambiar de pestaña con teclado
- **GIVEN** el historial del cliente con la primera pestaña enfocada
- **WHEN** el usuario presiona flecha derecha y Enter
- **THEN** queda activa la segunda pestaña y se muestra su panel

#### Scenario: Panel vinculado
- **GIVEN** el historial del cliente
- **WHEN** se consulta el `tabpanel`
- **THEN** su nombre accesible es el de la pestaña activa

### Requirement: Sin controles hechos a mano
Los archivos de `features/`, `pages/` y `layout/` NO SHALL usar `<select>`, `<input type="checkbox">`, `role="switch"` ni `role="tablist"` propios; una regla de ESLint SHALL rechazar `<select>` e `<input type="date|time|checkbox">` en esas carpetas.

#### Scenario: Lint rechaza un select nativo
- **GIVEN** un componente en `features/` con `<select>`
- **WHEN** se corre `npm run lint`
- **THEN** el lint falla con un mensaje que indica usar `@ui/Select`

